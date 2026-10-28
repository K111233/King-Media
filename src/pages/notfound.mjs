// KWM Systems · 404 page (served by .htaccess: ErrorDocument 404 /404.html, so every link is root-relative)
import { SERVICES, pathOf } from '../content/services.mjs';
import { btn, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';

const links = [
  { href: '/websites/', label: 'Websites', ic: 'monitor' },
  { href: '/work/', label: 'Our work', ic: 'globe' },
  { href: '/solutions/', label: 'Services', ic: 'layers' },
  ...SERVICES.map((s) => ({ href: pathOf(s), label: s.name, ic: s.icon })),
  { href: '/business-os/', label: 'KWM Business OS', ic: 'layers' },
  { href: '/pricing/', label: 'Pricing', ic: 'receipt' },
];

export default [{
  path: '/404.html',
  title: 'Page not found',
  description: 'That address doesn’t lead anywhere on the KWM Systems website. From here you can find our websites, services, prices and contact details.',
  noindex: true,
  bodyClass: 'is-404',
  body: `
<section class="phero phero--compact nf" aria-labelledby="pageTitle">
  <div class="phero__bg" aria-hidden="true"></div>
  <div class="container nf__inner">
    <p class="nf__code" aria-hidden="true">404</p>
    <h1 class="phero__title" id="pageTitle">That page isn’t here.</h1>
    <p class="phero__lede">The address may have changed, or there may be a typo in the link. King Media is now KWM Systems, so some old addresses have moved. These might help:</p>
    <div class="phero__actions">${btn('/', 'Go to the home page', { variant: 'gold', size: 'lg' })}${btn('/contact/', 'Contact us', { variant: 'ghost', size: 'lg', ic: '' })}</div>
  </div>
</section>
<section class="section" aria-labelledby="nfLinks">
  <div class="container">
    <h2 class="nf__h" id="nfLinks">Popular pages</h2>
    <ul class="nf__links" role="list">${links.map((l) => `<li><a class="card card--link nf__link" href="${l.href}"><span class="iconbox iconbox--sm">${icon(l.ic)}</span><span>${esc(l.label)}</span>${icon('arrow', { cls: 'icon icon--sm nf__arrow' })}</a></li>`).join('')}</ul>
  </div>
</section>`,
}];
