// KWM Systems · serve.mjs · a local preview of the whole site folder (zero dependencies).
//   node src/serve.mjs          then open http://localhost:8321/
// PHP doesn't run here, so forms show their "preview: nothing was sent" message instead of sending.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8321; // not 4190: WebKit refuses that port
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4' };
const BLOCKED = /(^|\/)(\.git|src|api|tools|km-private)(\/|$)/;

async function find(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  if (BLOCKED.test(clean.replace(/^\//, ''))) return null;
  let file = join(ROOT, clean);
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, 'index.html');
    await stat(file);
    return file;
  } catch { return null; }
}

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('No PHP in the local preview'); }
  // Directory without a trailing slash: redirect, like Apache does
  if (!extname(req.url.split('?')[0]) && !req.url.split('?')[0].endsWith('/')) {
    const f = await find(req.url + '/');
    if (f) { res.writeHead(301, { Location: req.url.split('?')[0] + '/' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '') }); return res.end(); }
  }
  const file = await find(req.url);
  if (!file) {
    const body = await readFile(join(ROOT, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(body);
  }
  const body = await readFile(file);
  res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(PORT, () => console.log(`KWM Systems preview: http://localhost:${PORT}/`));
