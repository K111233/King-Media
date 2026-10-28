// KWM Systems · layout.mjs · the page shell: head, header (with the Services menu), footer.
import { SITE, NAV, CTA, DISCLOSURE } from '../content/site.mjs';
import { SERVICES, pathOf } from '../content/services.mjs';
import { mark, icon, FAVICON_DATA_URI } from './icons.mjs';
import { esc, fromPrice, involvementKey } from './components.mjs';
import { INVOLVEMENT, WEB, OS, money } from '../content/pricing.mjs';

export const VERSION = '20261028b'; // bump on every release: CSS and JS are cached by version

const brand = (cls = '', tile = '#13264F') => `<a class="brand${cls ? ' ' + cls : ''}" href="/" aria-label="${SITE.name}, home">${mark(38, 'brand__mark', { tile })}<span class="brand__word" aria-hidden="true"><b>KWM</b> Systems</span></a>`;

function solutionsMenu(path) {
  const items = SERVICES.map((s) => `<li><a class="mega__item" href="${pathOf(s)}"${path === pathOf(s) ? ' aria-current="page"' : ''}><span class="iconbox iconbox--sm">${icon(s.icon)}</span><span class="mega__text"><span class="mega__name">${esc(s.name)}</span><span class="mega__desc">${esc(s.tagline)}</span><span class="mega__price">${fromPrice(s)} · ${esc(INVOLVEMENT[involvementKey(s)].label)}</span></span></a></li>`).join('');
  return `<div class="mega" id="solutionsMenu" hidden>
    <div class="mega__inner">
      <div class="mega__intro">
        <p class="eyebrow eyebrow--gold">Services</p>
        <p class="mega__lead">The systems around your website: out-of-hours calls answered, enquiries organised, social media handled and your local presence tidied up.</p>
        <a class="btn btn--gold btn--sm" href="/solutions/"><span>See all services</span>${icon('arrow', { cls: 'btn__icon' })}</a>
        <a class="mega__sub" href="/websites/">${icon('monitor', { cls: 'icon icon--sm' })}Websites, from ${money(WEB.tiers[0].build)}</a>
        <a class="mega__sub" href="/business-os/">${icon('layers', { cls: 'icon icon--sm' })}Business OS, setup from ${money(OS.setupFrom)}</a>
      </div>
      <ul class="mega__list" role="list">${items}<li><a class="mega__item mega__item--os" href="/business-os/"${path === '/business-os/' ? ' aria-current="page"' : ''}><span class="iconbox iconbox--sm iconbox--gold">${icon('layers')}</span><span class="mega__text"><span class="mega__name">KWM Business OS</span><span class="mega__desc">Your tools and workflows, connected</span><span class="mega__price">Setup from ${money(OS.setupFrom)} · from ${money(OS.monthlyFrom)} a month</span></span></a></li><li><a class="mega__item mega__item--help" href="/contact/?interest=unsure#quote"><span class="iconbox iconbox--sm iconbox--gold">${icon('message')}</span><span class="mega__text"><span class="mega__name">Not sure what you need?</span><span class="mega__desc">Tell us how you work and we’ll recommend</span><span class="mega__price">Free advice · reply within 24 hours</span></span></a></li></ul>
    </div>
  </div>`;
}

function header(path) {
  const cur = (href) => (path === href || (href !== '/' && path.startsWith(href)) ? ' aria-current="page"' : '');
  const links = NAV.map((n) => (n.menu
    ? `<li class="nav__has-menu"><button type="button" class="nav__menu-btn" aria-expanded="false" aria-controls="solutionsMenu"${path.startsWith('/solutions/') ? ' data-current="true"' : ''}>${n.label}${icon('chev-down', { cls: 'nav__chev' })}</button>${solutionsMenu(path)}</li>`
    : `<li><a href="${n.href}"${cur(n.href)}>${n.label}</a></li>`)).join('');
  return `<header class="site-header" id="top">
  <div class="container site-header__bar">
    ${brand()}
    <nav class="nav" aria-label="Main"><ul role="list">${links}</ul></nav>
    <a class="btn btn--gold btn--sm site-header__cta" href="${CTA.href}"${cur(CTA.href)}><span>${CTA.label}</span></a>
    <button type="button" class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="menu"><span>Menu</span>${icon('menu', { cls: 'menu-btn__open' })}${icon('close', { cls: 'menu-btn__close' })}</button>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <nav class="container menu__inner" aria-label="Menu">
    <ul role="list" class="menu__list">
      <li><a href="/"${path === '/' ? ' aria-current="page"' : ''}>Home</a></li>
      ${NAV.map((n) => `<li><a href="${n.href}"${cur(n.href)}>${n.label}</a></li>`).join('')}
      <li><a href="/contact/"${cur('/contact/')}>Contact</a></li>
    </ul>
    <p class="menu__label">Services</p>
    <ul role="list" class="menu__services">${SERVICES.map((s) => `<li><a href="${pathOf(s)}"${cur(pathOf(s))}>${icon(s.icon, { cls: 'icon icon--sm' })}${esc(s.name)}</a></li>`).join('')}</ul>
    <a class="btn btn--gold btn--lg btn--block" href="${CTA.href}"><span>${CTA.label}</span>${icon('arrow', { cls: 'btn__icon' })}</a>
    <p class="menu__mail"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
  </nav>
</div>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        ${brand('brand--footer')}
        <p class="site-footer__line">Websites and business systems for local businesses.</p>
        <a class="site-footer__mail" href="mailto:${SITE.email}">${icon('mail', { cls: 'icon icon--sm' })}${SITE.email}</a>
      </div>
      <nav class="site-footer__nav" aria-label="Footer">
        <div>
          <h2 class="site-footer__h">Websites</h2>
          <ul role="list"><li><a href="/websites/">Website design</a></li><li><a href="/websites/#pricing">Website prices</a></li><li><a href="/work/">Our work</a></li><li><a href="/contact/#demo">Request a demo</a></li></ul>
        </div>
        <div>
          <h2 class="site-footer__h">Services</h2>
          <ul role="list">${SERVICES.map((s) => `<li><a href="${pathOf(s)}">${esc(s.name)}</a></li>`).join('')}<li><a href="/business-os/">KWM Business OS</a></li></ul>
        </div>
        <div>
          <h2 class="site-footer__h">Company</h2>
          <ul role="list"><li><a href="/pricing/">Pricing</a></li><li><a href="/about/">About us</a></li><li><a href="/contact/">Contact</a></li></ul>
        </div>
        <div>
          <h2 class="site-footer__h">Legal</h2>
          <ul role="list"><li><a href="/terms.html">Terms &amp; conditions</a></li><li><a href="/privacy.html">Privacy &amp; cookies</a></li></ul>
        </div>
      </nav>
    </div>
    <div class="site-footer__legal">
      <p>© ${new Date().getFullYear()} ${SITE.name}. Formerly ${SITE.formerName}.</p>
      <p>${esc(DISCLOSURE)}</p>
    </div>
  </div>
</footer>`;
}

/**
 * page({ path, title, description, body, ... }) → a complete HTML document.
 */
export function page({ path, title, fullTitle, description, body, bodyClass = '', jsonld = null, noindex = false, ogTitle, ogImage = '/assets/kwm/share/og-kwm.png', ogAlt = 'KWM Systems: websites and business systems for local businesses.' }) {
  const t = fullTitle || `${title} | ${SITE.name}`;
  const url = SITE.origin + path;
  const ld = jsonld ? `\n<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>` : '';
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="${SITE.themeColor}">
<meta name="format-detection" content="telephone=no">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(ogTitle || t)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.origin}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="${esc(ogAlt)}">
<meta property="og:locale" content="${SITE.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle || t)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.origin}${ogImage}">
<meta name="twitter:image:alt" content="${esc(ogAlt)}">
<meta name="application-name" content="${SITE.name}">
<meta name="apple-mobile-web-app-title" content="${SITE.name}">
<link rel="icon" href="${FAVICON_DATA_URI}">
<link rel="icon" href="/assets/kwm/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/kwm/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/kwm/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="/css/kwm.css?v=${VERSION}">
<script src="/js/track.js?v=20261009a" defer></script>
<script src="/js/kwm.js?v=${VERSION}" defer></script>${ld}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip-link" href="#main">Skip to main content</a>
${header(path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${path === CTA.href ? '' : `<div class="dock" id="dock"><a class="btn btn--gold btn--lg btn--block" href="${CTA.href}"><span>${CTA.label}</span>${icon('arrow', { cls: 'btn__icon' })}</a></div>`}
</body>
</html>
`;
}
