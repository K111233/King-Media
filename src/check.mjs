// KWM Systems · check.mjs · checks the built KWM pages: links, anchors, assets, one h1, unique ids,
// titles, descriptions, canonicals, image alts and form labels. Zero dependencies.
//   node src/check.mjs
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './content/site.mjs';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['index.html', 'websites/index.html', 'work/index.html', 'solutions/index.html', 'solutions/out-of-hours-receptionist/index.html', 'solutions/website-enquiry-form/index.html', 'solutions/local-business-refresh/index.html', 'solutions/social-media/index.html', 'business-os/index.html', 'pricing/index.html', 'about/index.html', 'contact/index.html', 'privacy.html', 'terms.html', '404.html', 'websites-for-barbers/index.html', 'websites-for-cafes/index.html', 'websites-for-clinics/index.html', 'websites-for-gardeners/index.html', 'websites-for-tradespeople/index.html', 'small-business-websites/index.html'];
const toFile = (urlPath) => { const p = urlPath.split('#')[0].split('?')[0]; if (!p) return null; const f = join(ROOT, p.replace(/^\//, '')); if (existsSync(f) && statSync(f).isDirectory()) return join(f, 'index.html'); return f; };
const ids = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
let problems = 0; const warn = (page, msg) => { problems++; console.log(`✗ ${page}: ${msg}`); };
for (const page of PAGES) {
  const file = join(ROOT, page);
  if (!existsSync(file)) { warn(page, 'missing'); continue; }
  const html = readFileSync(file, 'utf8');
  const pageUrl = '/' + page.replace(/index\.html$/, '');
  const h1 = (html.match(/<h1[\s>]/g) || []).length; if (h1 !== 1) warn(page, `${h1} h1 elements`);
  const all = ids(html); const dup = all.filter((v, i) => all.indexOf(v) !== i); if (dup.length) warn(page, 'duplicate ids: ' + [...new Set(dup)].join(', '));
  if (!/<title>[^<]{10,}<\/title>/.test(html)) warn(page, 'no title');
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) warn(page, 'description missing or short');
  if (!html.includes(`<link rel="canonical" href="${SITE.origin}/`)) warn(page, 'no canonical');
  if (!/<html lang="en-GB"/.test(html)) warn(page, 'lang not en-GB');
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) warn(page, 'img without alt: ' + m[0].slice(0, 80));
  for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    if (/type="(hidden|checkbox|radio)"/.test(m[0]) || /tabindex="-1"/.test(m[0])) continue;
    if (!new RegExp(`for="${m[2]}"`).test(html)) warn(page, 'field without label: ' + m[2]);
  }
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(u)) continue;
    if (u.startsWith('#')) { if (u.length > 1 && !all.includes(u.slice(1))) warn(page, 'broken in-page anchor ' + u); continue; }
    const abs = u.startsWith('/') ? u : pageUrl + u;
    const f = toFile(abs);
    if (!f || !existsSync(f)) { warn(page, 'broken link/asset ' + u); continue; }
    const hash = u.split('#')[1];
    if (hash && f.endsWith('.html') && !ids(readFileSync(f, 'utf8')).includes(hash)) warn(page, 'broken anchor ' + u);
  }
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(/\s+/)[0]; if (u.startsWith('/') && !existsSync(join(ROOT, u))) warn(page, 'missing srcset file ' + u); }
}
console.log(problems ? `\n${problems} problem(s) found.` : `All ${PAGES.length} KWM pages passed: links, anchors, assets, headings, ids, meta, alts and labels.`);
process.exitCode = problems ? 1 : 0;
