// KWM Solutions · shot.mjs · zero-dependency headless Chrome driver for visual checks (Node 22+: global WebSocket + fetch).
// Usage:
//   node shot.mjs <url> <out.png> [width=1440] [height=900] [--mobile] [--full] [--wait=ms] [--eval=js] [--dpr=1]
//   node shot.mjs --batch jobs.json      (jobs: [{url,out,width,height,mobile,full,wait,eval,dpr}])
// Prints console errors and page exceptions, and the result of --eval (JSON) if given.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  if (argv[0] === '--batch') return JSON.parse(readFileSync(argv[1], 'utf8'));
  const [url, out, w, h, ...rest] = argv;
  const job = { url, out, width: Number(w) || 1440, height: Number(h) || 900 };
  for (const r of rest) {
    if (r === '--mobile') job.mobile = true;
    else if (r === '--full') job.full = true;
    else if (r.startsWith('--wait=')) job.wait = Number(r.slice(7));
    else if (r.startsWith('--eval=')) job.eval = r.slice(7);
    else if (r.startsWith('--dpr=')) job.dpr = Number(r.slice(6));
    else if (r === '--reduced') job.reduced = true;
  }
  return [job];
}

async function launch() {
  const dir = mkdtempSync(join(tmpdir(), 'kwm-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-extensions', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('Chrome did not start')), 20000);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); resolve(m[1]); } });
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else listeners.forEach((fn) => fn(msg));
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  return { send, listeners, close: () => { try { ws.close(); } catch {} proc.kill('SIGKILL'); setTimeout(() => { try { rmSync(dir, { recursive: true, force: true }); } catch {} }, 500); } };
}

async function run(jobs) {
  const b = await launch();
  try {
    for (const job of jobs) {
      const { targetId } = await b.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await b.send('Target.attachToTarget', { targetId, flatten: true });
      const s = (m, p) => b.send(m, p, sessionId);
      const logs = [];
      const onMsg = (msg) => {
        if (msg.sessionId !== sessionId) return;
        if (msg.method === 'Runtime.exceptionThrown') logs.push('EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
        if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) logs.push(msg.params.type.toUpperCase() + ': ' + msg.params.args.map((a) => a.value ?? a.description).join(' '));
        if (msg.method === 'Log.entryAdded' && ['error', 'warning'].includes(msg.params.entry.level)) logs.push('LOG ' + msg.params.entry.level + ': ' + msg.params.entry.text + (msg.params.entry.url ? ' @ ' + msg.params.entry.url : ''));
      };
      b.listeners.push(onMsg);
      await s('Page.enable'); await s('Runtime.enable'); await s('Log.enable');
      const width = job.width || 1440, height = job.height || 900;
      await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: job.dpr || (job.mobile ? 2 : 1), mobile: !!job.mobile, screenWidth: width, screenHeight: height });
      if (job.mobile) await s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      if (job.reduced) await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      if (job.transparent) await s('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
      const loaded = new Promise((r) => { const fn = (m) => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') r(); }; b.listeners.push(fn); });
      await s('Page.navigate', { url: job.url });
      await Promise.race([loaded, sleep(15000)]);
      await s('Runtime.evaluate', { expression: 'document.fonts && document.fonts.ready', awaitPromise: true }).catch(() => {});
      await sleep(job.wait ?? 600);
      let evalOut;
      if (job.eval) {
        const r = await s('Runtime.evaluate', { expression: job.eval, awaitPromise: true, returnByValue: true });
        evalOut = r.exceptionDetails ? 'EVAL ERROR: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) : r.result.value;
        await sleep(job.afterEvalWait ?? 400);
      }
      if (job.full || job.sections || job.scroll) {
        // Scroll through the page so lazy images load, then return to the top
        await s('Runtime.evaluate', { expression: `(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += Math.round(innerHeight * .8)) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 120)); } scrollTo({ top: 0, behavior: "instant" }); await new Promise(r => setTimeout(r, 400)); })()`, awaitPromise: true });
        await sleep(job.settle ?? 500);
      }
      if (job.scroll && job.out) {
        // Scroll the window and capture each viewport, as a visitor sees it (sticky header included)
        const { result } = await s('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
        const H = result.value, step = job.scroll; let i = 0;
        for (let y = 0; y < H; y += step, i++) {
          await s('Runtime.evaluate', { expression: `scrollTo({ top: ${y}, behavior: "instant" })` });
          await sleep(job.scrollWait ?? 350);
          const shot = await s('Page.captureScreenshot', { format: 'png' });
          writeFileSync(job.out.replace(/\.png$/, `-${i}.png`), Buffer.from(shot.data, 'base64'));
          if (y + height >= H) { i++; break; }
        }
        console.log(JSON.stringify({ url: job.url, shots: i, pageHeight: H, logs }));
        await b.send('Target.closeTarget', { targetId });
        continue;
      }
      if (job.sections && job.out) {
        // Capture the full page as consecutive sections of `sections` px (exact clips, no external cropping)
        const { result } = await s('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
        const H = result.value, step = job.sections; let i = 0;
        for (let y = 0; y < H; y += step, i++) {
          const shot = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width, height: Math.min(step, H - y), scale: 1 } });
          writeFileSync(job.out.replace(/\.png$/, `-${i}.png`), Buffer.from(shot.data, 'base64'));
        }
        console.log(JSON.stringify({ url: job.url, sections: i, pageHeight: H, logs }));
        await b.send('Target.closeTarget', { targetId });
        continue;
      }
      if (job.out) {
        let clip;
        if (job.full) {
          const { result } = await s('Runtime.evaluate', { expression: 'Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)', returnByValue: true });
          clip = { x: 0, y: 0, width, height: Math.min(result.value, 16000), scale: 1 };
        }
        const shot = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!job.full, ...(clip ? { clip } : {}) });
        writeFileSync(job.out, Buffer.from(shot.data, 'base64'));
      }
      console.log(JSON.stringify({ url: job.url, out: job.out, size: `${width}x${height}${job.mobile ? ' mobile' : ''}`, eval: evalOut, logs }, null, 0));
      await b.send('Target.closeTarget', { targetId });
    }
  } finally { b.close(); }
}

run(parseArgs(process.argv.slice(2))).catch((e) => { console.error(e); process.exit(1); });
