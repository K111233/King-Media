// KWM Systems · /websites/ and /work/
import { SITE } from '../content/site.mjs';
import { WEB, money, VAT_NOTE } from '../content/pricing.mjs';
import { BUILD_INCLUDES, MONTHLY_INCLUDES, FEATURES, PROCESS, PROMISES, EXTRAS, WEB_FAQS } from '../content/websites.mjs';
import { CONCEPTS, CREDITS } from '../content/concepts.mjs';
import { btn, badge, sectionHead, breadcrumb, browser, phone, steps, tickList, faqList, webTierCard, ctaBand, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';

const C = Object.fromEntries(CONCEPTS.map((c) => [c.slug, c]));

// chips: badges above the title. price: one line of price facts under the lede (HTML).
const pageHero = ({ crumbs, eyebrow, title, lede, chips = '', price = '', actions = '', aside = '', id = 'pageTitle', cls = '' }) => `
<section class="phero${aside ? ' phero--split' : ''}${cls ? ' ' + cls : ''}" aria-labelledby="${id}">
  <div class="phero__bg" aria-hidden="true"></div>
  <div class="container phero__grid">
    <div class="phero__copy">
      ${breadcrumb(crumbs)}
      ${chips ? `<div class="phero__chips">${chips}</div>` : ''}
      ${eyebrow ? `<p class="eyebrow eyebrow--gold">${esc(eyebrow)}</p>` : ''}
      <h1 class="phero__title" id="${id}">${title}</h1>
      <p class="phero__lede">${lede}</p>
      ${price ? `<p class="phero__price">${price}</p>` : ''}
      ${actions ? `<div class="phero__actions">${actions}</div>` : ''}
    </div>
    ${aside ? `<div class="phero__aside">${aside}</div>` : ''}
  </div>
</section>`;
export { pageHero };

const websites = {
  path: '/websites/',
  title: 'Website design for local businesses',
  description: 'Websites designed, built and looked after for local businesses. See a working demo within 2 working days. From £494.99 to build, then from £19.99 a month.',
  bodyClass: 'is-websites',
  jsonld: {
    '@context': 'https://schema.org', '@type': 'Service', name: 'Website design, build and care', serviceType: 'Website design',
    provider: { '@type': 'Organization', name: SITE.name, legalName: SITE.legalName, url: SITE.origin + '/' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' }, url: SITE.origin + '/websites/',
    offers: WEB.tiers.map((t) => ({ '@type': 'Offer', name: `${t.label} website`, price: t.build.toFixed(2), priceCurrency: 'GBP' })),
  },
  body: pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { label: 'Websites' }],
    eyebrow: 'Websites',
    title: 'Websites that look the part, <em class="serif">built and looked after for you.</em>',
    lede: `Designed for your business, hand-coded for phones first, and kept hosted, secure and up to date for one monthly fee. See a real, working demo within 2 working days before you commit.`,
    actions: `${btn('/contact/#demo', `Request a demo (${money(WEB.demo.price)})`, { variant: 'gold', size: 'lg' })}${btn('#pricing', 'See prices', { variant: 'ghost', size: 'lg', ic: '' })}`,
    aside: `<div class="phero__devices">${browser(C['crumb-and-co'], { eager: true, sizes: '(min-width: 1100px) 520px, 90vw' })}${phone(C['crumb-and-co'], { cls: 'phero__phone', sizes: '150px' })}</div><p class="stage__caption">Crumb &amp; Co. is a concept website for a made-up bakery.</p>`,
  }) + `
<section class="section" aria-labelledby="featTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'What you get', title: 'We don’t build it _and vanish_.', lede: 'Before they ring you, people look you up, usually on a phone, often in a hurry. We make sure they find something worth ringing about, and we keep it that way.', id: 'featTitle' })}
    <ul class="features" role="list">${FEATURES.map((f) => `<li class="feature"><span class="iconbox">${icon(f.icon)}</span><h3 class="feature__title">${esc(f.title)}</h3><p>${esc(f.text)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="section section--muted" id="pricing" aria-labelledby="priceTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Website prices', title: 'Priced by the page. _No surprises._', lede: `Start with a ${money(WEB.demo.price)} demo. Love it? Choose the size of site you need. One monthly fee then keeps it hosted, secure and up to date. ${VAT_NOTE}`, id: 'priceTitle' })}
    <div class="tiers">${WEB.tiers.map(webTierCard).join('')}</div>
    <div class="care">
      <div class="care__copy"><p class="eyebrow">Care plan</p><h3 class="care__title">Just the essentials. <span>${money(WEB.care.monthly)} a month.</span></h3><p>${esc(WEB.care.detail)} Hosting, web address, padlock, security updates, daily backups and fault fixing. Your build price is the same.</p></div>
      ${btn('/contact/?plan=care#demo', 'Start with a demo on the Care plan', { variant: 'outline' })}
    </div>
    <div class="includes">
      <div class="includes__col"><h3 class="includes__title">${icon('monitor', { cls: 'icon' })}Every build includes</h3>${tickList(BUILD_INCLUDES)}</div>
      <div class="includes__col"><h3 class="includes__title">${icon('shield', { cls: 'icon' })}Every monthly plan includes</h3>${tickList(MONTHLY_INCLUDES)}</div>
    </div>
    <p class="fineprint">Your build price includes your first month; monthly payments start a month later. A change is any single change on an existing page, such as new prices, photos, opening hours or a new section. Unused changes don’t carry over. New pages, online booking, payments and shops are quoted, free. The full terms are in the agreement you sign. <a href="/terms.html">Our terms</a>.</p>
  </div>
</section>

<section class="section" aria-labelledby="demoTitle">
  <div class="container split">
    <div class="split__copy">
      ${sectionHead({ eyebrow: 'The demo', title: 'See it _before_ you commit.', lede: `We design a real, working demo of your website and aim to show it to you within 2 working days. ${money(WEB.demo.price)}, a one-off fee that’s separate from your build price. No obligation to go ahead. Arranged your demo with us on a call? Then it’s free.`, id: 'demoTitle' })}
      ${steps(PROCESS, { when: true, cls: 'steps--compact' })}
      <div class="split__actions">${btn('/contact/#demo', 'Request my demo', { variant: 'primary', size: 'lg' })}</div>
    </div>
    <div class="split__visual">
      <ul class="gallery gallery--stack" role="list">${['ironclad-roofing', 'halcyon-physio'].map((k) => `<li class="gallery__item"><a class="gallery__link" href="/work/#${k}">${browser(C[k], { sizes: '(min-width: 1100px) 480px, 90vw' })}<span class="gallery__label"><strong>${esc(C[k].name)}</strong><span>${esc(C[k].sector)} · concept</span></span></a></li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="section section--muted" aria-labelledby="extrasTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Quoted to fit', title: 'Need bookings, payments _or a shop_?', lede: 'Every business books and sells a little differently, so we price these to fit. Tell us what you need and we’ll send a clear quote within 24 hours, free. Nothing starts until you say yes.', id: 'extrasTitle' })}
    <ul class="features features--4" role="list">${EXTRAS.map((f) => `<li class="feature"><span class="iconbox iconbox--gold">${icon(f.icon)}</span><h3 class="feature__title">${esc(f.title)}</h3><p>${esc(f.text)}</p>${badge('Quoted', 'neutral')}</li>`).join('')}</ul>
    <p class="fineprint">Booking, payment and shop platforms charge their own fees, which you pay to them directly. We’ll tell you what they are before you agree.</p>
  </div>
</section>

<section class="section" aria-labelledby="promTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'In writing', title: 'Our website _promises_.', lede: 'Each of these is written into our terms or the agreement you sign, so you can hold us to it.', id: 'promTitle' })}
    <ul class="promises" role="list">${PROMISES.map((p) => `<li class="promise">${icon('shield', { cls: 'promise__icon' })}<h3 class="promise__title">${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="section section--muted" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Website _questions_.', ledeHtml: `Can’t see yours? <a href="/contact/">Ask us</a>. We reply ${SITE.replyTime}.`, id: 'faqTitle' })}
    ${faqList(WEB_FAQS)}
  </div>
</section>
${ctaBand({ title: 'See your new website _before you pay for it_.', text: `Request a ${money(WEB.demo.price)} demo and we’ll show you a real, working website for your business within 2 working days. Or ask us anything first, free.` })}`,
};

const work = {
  path: '/work/',
  title: 'Our work: concept websites',
  description: 'Seven concept websites we designed and built for made-up local businesses, from a roofer to a bakery and a barber. Open them live and try them on your phone.',
  bodyClass: 'is-work',
  body: pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { label: 'Our work' }],
    eyebrow: 'Our work',
    title: 'Judge us on the work. <em class="serif">Open any of them live.</em>',
    lede: 'These are concept websites we designed and built for made-up businesses, so you can see exactly how we work without us showing off anyone else’s site. Each one is real and working: open it, scroll it, try it on your phone.',
  }) + `
<section class="section" aria-labelledby="workList">
  <div class="container">
    <h2 class="visually-hidden" id="workList">Concept websites</h2>
    <ul class="works" role="list">
      ${CONCEPTS.map((c, i) => `<li class="work${i % 2 ? ' work--flip' : ''}" id="${c.slug}">
        <div class="work__visual">${browser(c, { sizes: '(min-width: 1100px) 640px, 92vw', alt: `${c.name} concept website, desktop view` })}${phone(c, { cls: 'work__phone', sizes: '150px', alt: `${c.name} concept website, phone view` })}</div>
        <div class="work__copy">
          <p class="eyebrow">${esc(c.sector)} · concept</p>
          <h3 class="work__title">${esc(c.name)}</h3>
          <p class="work__pitch">${esc(c.pitch)}</p>
          <h4 class="work__why">Why it works</h4>
          ${tickList(c.why)}
          <p class="work__feature">${badge(c.feature, c.feature.includes('quoted') ? 'neutral' : 'navy')}</p>
          <div class="work__actions">${btn(`/concepts/${c.slug}/`, 'Open it live', { variant: 'primary', ic: 'arrow-up-right', attrs: `target="_blank" rel="noopener" aria-label="Open the ${esc(c.name)} concept live (opens in a new tab)"` })}</div>
        </div>
      </li>`).join('')}
    </ul>
    <div class="name-try card">
      <div><h3 class="name-try__title">${icon('wand', { cls: 'icon' })}See one with your business name</h3><p>Type your business name and pick a concept. It opens live with your name in it. Nothing is sent or saved.</p></div>
      <form class="name-try__form" id="nameTry" novalidate>
        <div class="field"><label for="nameTryName">Your business name</label><input id="nameTryName" type="text" maxlength="32" autocomplete="organization" autocapitalize="words"></div>
        <div class="field"><label for="nameTryConcept">Concept</label><select id="nameTryConcept">${CONCEPTS.filter((c) => c.slug !== 'velluto').map((c) => `<option value="${c.slug}">${esc(c.name)} (${esc(c.sector.toLowerCase())})</option>`).join('')}</select></div>
        <button type="submit" class="btn btn--primary"><span>Show me</span>${icon('arrow-up-right', { cls: 'btn__icon' })}</button>
      </form>
    </div>
  </div>
</section>
<section class="section section--muted" aria-labelledby="creditsTitle">
  <div class="container">
    <h2 class="credits__title" id="creditsTitle">Photo and footage credits</h2>
    <p class="fineprint">The concepts are designed by us for fictional businesses. Photos and footage are used under their licences.</p>
    <ul class="credits" role="list">${CREDITS.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>
</section>
${ctaBand({ title: 'Want one like these, _for your business_?', text: `Request a ${money(WEB.demo.price)} demo and we’ll design a real, working website for you within 2 working days. No obligation.` })}`,
};

export default [websites, work];
