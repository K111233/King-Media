// KWM Systems · build.mjs · writes the KWM pages as plain static HTML into the site folder.
// Zero dependencies (Node 18+). The output files are committed, because Hostinger deploys the repo as-is.
//
//   node src/build.mjs              build every page and sitemap.xml
//   node src/build.mjs --faq-doc    also write the customer FAQ document into ../launch-pack/
//
// Pages built here: /, /websites/, /work/, /solutions/ (the services hub, and one page per service),
// /business-os/, the advert landing pages (/websites-for-…/, /small-business-websites/), /pricing/,
// /about/, /contact/, /privacy.html, /terms.html and /404.html. /concepts/ and /api/ are separate and edited by hand.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page } from './templates/layout.mjs';
import { SITE, OWNER_TODO } from './content/site.mjs';
import { SERVICES, GENERAL_FAQS, pathOf } from './content/services.mjs';
import { PRICES, SOCIAL, OS, money } from './content/pricing.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = ['home', 'web', 'solutions', 'business-os', 'landing', 'pricing', 'about-contact', 'legal', 'notfound'];
const pages = [];
for (const m of modules) {
  const file = join(ROOT, 'src/pages', m + '.mjs');
  pages.push(...(await import(file)).default);
}

const outFile = (p) => (p.endsWith('.html') ? p.slice(1) : p.slice(1) + 'index.html');
for (const p of pages) {
  const file = join(ROOT, outFile(p.path));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(p));
}

// Sitemap: every page built here (the advert landing pages included), except the 404 page
const today = new Date().toISOString().slice(0, 10);
const urls = [...new Set(pages.filter((p) => !p.noindex).map((p) => p.path))];
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE.origin}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);

console.log(`Built ${pages.length} pages and sitemap.xml (${urls.length} URLs).`);
for (const p of pages) console.log('  ' + outFile(p.path));

// The customer-facing FAQ and workflow document, generated from the same words as the website
if (process.argv.includes('--faq-doc')) {
  const out = resolve(ROOT, '../launch-pack/07-customer-faqs-and-workflows.md');
  const lines = [
    '# KWM Systems: customer explanations, workflows and FAQs',
    '',
    `_Generated from the website content (src/content/services.mjs) on ${today}, so it always matches the site. Edit the content file, not this document, then run \`node src/build.mjs --faq-doc\`._`,
    '',
    'All examples are fictional and labelled **Example**. Names and numbers use Ofcom’s drama range (07700 900xxx).',
    '',
  ];
  for (const s of SERVICES) {
    const p = PRICES[s.id];
    const price = s.quoted
      ? 'Quoted after a free look. A one-off project.'
      : s.managed
        ? `${SOCIAL.diy.name} ${money(SOCIAL.diy.monthly)} a month (${SOCIAL.diy.limit.toLowerCase()}; the customer posts them, no setup fee). Managed plans: ${SOCIAL.tiers.map((t) => `${t.name} ${money(t.monthly)} a month (${t.posts} posts, ${t.comments.toLowerCase()})`).join('; ')}. ${money(SOCIAL.setup)} setup.`
        : `${money(p.monthly)} a month, ${p.setup ? money(p.setup) + ' setup' : 'no setup fee'}. Included: ${p.allowance.short}.`;
    lines.push(`## ${s.fullName}`, '', `**In one line:** ${s.oneLiner}`, '', `**Launch price:** ${price}`, '', s.lede, '');
    if (s.quoted) { lines.push('### What’s included', ...s.youGet.map((t) => `- ${t}`), '', `Web page: ${SITE.origin}${pathOf(s)}`, '', '---', ''); continue; }
    lines.push('### Who it’s for', ...s.forWho.map((t) => `- ${t}`), '', '### Not the right fit for', ...s.notFor.map((t) => `- ${t}`), '');
    lines.push('### What happens, step by step', ...s.steps.map((t, i) => `${i + 1}. **${t.title}.** ${t.text}`), '');
    if (s.example.events) lines.push(`### Example: ${s.example.title}`, ...s.example.events.map((e) => `- **${e.time}**: ${e.text}`), '');
    else lines.push(`### Example: ${s.example.title}`, `- Notes: “${s.example.notes}”`, `- Draft: “${s.example.draft}”`, '');
    lines.push('### What you get', ...s.youGet.map((t) => `- ${t}`), '', '### What it won’t do', ...s.wontDo.map((t) => `- ${t}`), '');
    lines.push('### When it needs a person, or something goes wrong', ...s.fallbacks.map((f) => `- **${f.when}:** ${f.what}`), '');
    lines.push(`**Where the owner sees it:** ${s.ownerSees}`, '', '### What the customer provides', ...s.youProvide.map((t) => `- ${t}`), '');
    lines.push('### Usage and limits', `- ${s.usage.counts}`, `- ${s.usage.atLimit}`, '', '### FAQs', ...s.faqs.flatMap((f) => [`**${f.q}**`, f.a, '']), `Web page: ${SITE.origin}${pathOf(s)}`, '', '---', '');
  }
  lines.push('## KWM Business OS', '', `**Price:** setup from ${money(OS.setupFrom)}, then from ${money(OS.monthlyFrom)} a month. Exact scope, fees and any third-party costs are confirmed in a written proposal after an initial review.`, '', `Web page: ${SITE.origin}/business-os/`, '', '---', '');
  lines.push('## General questions', '', ...GENERAL_FAQS.flatMap((f) => [`**${f.q}**`, f.a, '']));
  writeFileSync(out, lines.join('\n'));
  console.log('Wrote ' + out);
}

console.log('\nStill needs the owner (not shown on the site):');
OWNER_TODO.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
