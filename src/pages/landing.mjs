// KWM Systems · the advert landing pages (/websites-for-…/ and /small-business-websites/).
// Same addresses and wording as the King Media versions, rebuilt in the KWM design. One job each:
// get a free demo, arranged on a call (the demo is free that way; £4.99 through the main site).
import { SITE } from '../content/site.mjs';
import { byId } from '../content/services.mjs';
import { WEB, money, VAT_NOTE } from '../content/pricing.mjs';
import { PROMISES } from '../content/websites.mjs';
import { CONCEPTS } from '../content/concepts.mjs';
import { btn, sectionHead, browser, phone, steps, tickList, faqList, serviceCard, quoteForm, ctaBand, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';
import { pageHero } from './web.mjs';

const C = Object.fromEntries(CONCEPTS.map((c) => [c.slug, c]));

const PAGES = [
  {
    path: '/websites-for-barbers/', crumb: 'Barbers and salons', eyebrow: 'Websites for barbers and salons',
    lead: 'A barber’s website', accent: 'that gets the chair booked.',
    lede: 'Your prices, your cuts and a way to book, on a website that’s yours.',
    concept: 'northside-barbers', tools: ['social', 'receptionist', 'enquiry'],
    pitch: 'We design it, build it and look after it. You see a real, working demo of your shop’s website before you decide anything.',
    get: ['Your full price list, readable at a glance', 'A gallery of your cuts, so people can see the standard', 'Opening hours, a map and a button to call or book'],
    faq: { q: 'Can customers book a chair online?', a: 'Yes. We can link your website to the booking app you already use, or add an online booking system, which we quote for separately. Tell us what you use now and we’ll advise.' },
    title: 'Websites for barbers and salons',
    description: 'Barber and salon websites, designed, built and looked after for you. From £494.99 to build. See a demo of yours before you decide.',
  },
  {
    path: '/websites-for-cafes/', crumb: 'Cafés and bakeries', eyebrow: 'Websites for cafés, bakeries and takeaways',
    lead: 'A café website', accent: 'that makes people hungry.',
    lede: 'Your menu, your prices and your opening hours, a thumb’s reach away.',
    concept: 'crumb-and-co', tools: ['social', 'enquiry', 'receptionist'],
    pitch: 'We design it, build it and look after it. You see a real, working demo of your website before you decide anything.',
    get: ['Your menu and prices as a proper page, not a PDF', 'Opening hours and a map on every page', 'New specials or prices? Text us and we’ll update it'],
    faq: { q: 'Can people order or book a table online?', a: 'Yes. Online ordering, table booking and taking payments can all be added, and we quote for them separately because every kitchen works differently. Tell us what you need and we’ll send a clear quote, free.' },
    title: 'Websites for cafés and bakeries',
    description: 'Café, bakery and takeaway websites, designed, built and looked after for you. From £494.99 to build. See a demo of yours before you decide.',
  },
  {
    path: '/websites-for-clinics/', crumb: 'Clinics and therapists', eyebrow: 'Websites for physios, therapists and clinics',
    lead: 'A clinic website', accent: 'that puts people at ease.',
    lede: 'Clear treatments, clear prices and a simple way to get in touch.',
    concept: 'halcyon-physio', tools: ['enquiry', 'receptionist', 'social'],
    pitch: 'We design it, build it and look after it. You see a real, working demo of your clinic’s website before you decide anything.',
    get: ['Your treatments and prices explained in plain words', 'Who you are and your qualifications, so people know who they’ll see', 'A clear way to call, message or book'],
    faq: { q: 'Can patients book appointments online?', a: 'Yes. We can link your website to the booking system you already use, or add online booking, which we quote for separately. We don’t collect health details through website forms unless that’s agreed in writing.' },
    title: 'Websites for clinics and therapists',
    description: 'Websites for physios, therapists and private clinics, designed, built and looked after for you. From £494.99 to build. See a demo before you decide.',
  },
  {
    path: '/websites-for-gardeners/', crumb: 'Gardeners and landscapers', eyebrow: 'Websites for gardeners, landscapers and tree surgeons',
    lead: 'A gardening website', accent: 'where the work sells itself.',
    lede: 'Before-and-after photos, your services and an easy way to ask for a visit.',
    concept: 'evergreen-gardens', tools: ['social', 'receptionist', 'enquiry'],
    pitch: 'We design it, build it and look after it. You see a real, working demo of your website before you decide anything.',
    get: ['Before-and-after photos of your jobs up front', 'Your services in plain words: hedges, lawns, design, clearance', 'A button to book a visit or ask for a quote on every page'],
    faq: { q: 'Can you show my before-and-after photos?', a: 'Yes. Send us pairs of photos taken from the same spot and we’ll build them into your demo, so you can see how they look before you decide.' },
    title: 'Websites for gardeners and landscapers',
    description: 'Websites for gardeners, landscapers and tree surgeons, built and looked after for you. From £494.99 to build. See a demo of yours before you decide.',
  },
  {
    path: '/websites-for-tradespeople/', crumb: 'Tradespeople', eyebrow: 'Websites for roofers, builders, plumbers and electricians',
    lead: 'A trades website', accent: 'that wins you the quote.',
    lede: 'Show your work, the areas you cover and a number to call.',
    concept: 'ironclad-roofing', tools: ['receptionist', 'enquiry', 'social'],
    pitch: 'You’re on the tools, so we do the lot: design, build, hosting and updates. You see a real, working demo of your website before you decide anything.',
    get: ['Photos of your finished jobs, front and centre', 'The services you offer and the areas you cover, in plain words', 'A call button and a quote form on every page'],
    faq: { q: 'I get my work from Facebook and word of mouth. Do I need a website?', a: 'That’s your call, and we won’t pretend otherwise. A website gives people who search for your trade somewhere to check your work, your area and your number, and it’s yours, whatever happens to your social media pages. See your demo first, then decide.' },
    title: 'Websites for tradespeople',
    description: 'Websites for roofers, builders, plumbers, electricians and other trades, built and looked after for you. From £494.99 to build. See a demo first.',
  },
  {
    path: '/small-business-websites/', crumb: 'Small business websites', eyebrow: 'Websites for local businesses',
    lead: 'A website for your business,', accent: 'built for you.',
    lede: 'We build yours first. You decide after.',
    concept: 'crumb-and-co', tools: ['receptionist', 'enquiry', 'social'],
    pitch: 'We design it, build it and look after it: hosting, web address, security and changes. You see a real, working demo of your website before you decide anything.',
    get: ['Designed for your business, not a template', 'Usually live the day after you pay for your build', 'Changes by text, WhatsApp or email, whenever you need them'],
    faq: { q: 'What kinds of business do you build for?', a: 'Local businesses of all kinds: shops, cafés, barbers and salons, trades, gardeners, clinics and more. On our work page you can open seven concept websites we designed for different trades.' },
    title: 'Small business websites, built for you',
    description: 'Websites for UK small businesses, designed, built and looked after for you. From £494.99 to build. See a demo of yours before you decide.',
  },
];

const t = WEB.tiers;
const SHARED_FAQS = [
  { q: 'What will it cost?', a: `Your build price is ${money(t[0].build)} for 1 page, ${money(t[1].build)} for 2, ${money(t[2].build)} for 3, or ${money(t[3].build)} for 4 to 6, and it includes your first month. After that, the monthly fee is ${money(t[0].m12)} for 1 or 2 pages on the 12-month plan (${money(t[2].m12)} for 3 or more), with a lower price on the 5-year plan. Or choose the Care plan at ${money(WEB.care.monthly)} a month for any size of site, with 1 change a month instead of 5. ${VAT_NOTE}` },
  { q: 'Is the demo really free?', a: `Yes, when we arrange it with you on a call after you send this form. If you’d rather skip the call and request a demo straight through our website, there’s a ${money(WEB.demo.price)} fee. Either way, there’s no obligation to go ahead.` },
  null, // the page's own question goes here
  { q: 'I don’t have a logo or professional photos. Is that a problem?', a: 'No. Send whatever you have. With your permission, we can also start from the photos and reviews already on your Google or Facebook page.' },
  { q: 'Is there a contract?', a: 'Yes, a clear agreement you read and sign online before we start. Plans have a 12-month minimum (or 5 years for a lower monthly price), then run month to month. If you leave early there’s an early exit fee, and the agreement shows exactly how it’s worked out.' },
  { q: 'What if I need to change something later?', a: 'Text, WhatsApp or email us. Your monthly plan includes up to 5 changes a month (1 on the Care plan), such as new prices, photos or opening hours. New pages and new features are quoted first.' },
];

const FEATURES = [
  { ic: 'edit', title: 'Designed for your business', text: 'Built by hand around what you do. Not a template with your logo dropped in.' },
  { ic: 'phone', title: 'Made for phones first', text: 'Most people will find you on their phone, so that’s where we start.' },
  { ic: 'shield', title: 'Hosting, web address and padlock', text: 'We register your web address, host your site, keep it secure and back it up every day.' },
  { ic: 'message', title: 'Changes by text', text: 'New prices, fresh photos, holiday hours. Text, WhatsApp or email us and we’ll tell you when it’s live.' },
];

const STEPS = [
  { title: 'Tell us about your business', text: 'Send the short form. It’s free. We reply within 24 hours and arrange a quick call.', when: 'Today' },
  { title: 'See your demo', text: 'A real, working demo of your website, designed for your business. Arranged with us on a call, it’s free. Don’t love it? You owe us nothing.', when: 'Within 2 working days' },
  { title: 'Go live', text: 'Happy with it? Sign your agreement online and pay for your build. We aim to have you live the day after.', when: 'The day after you pay' },
];

const promises = PROMISES.filter((p) => ['No surprise bills.', 'Live the day after you pay.', 'Your website, if you leave.'].includes(p.title));

function landing(p) {
  const c = C[p.concept];
  const faqs = SHARED_FAQS.map((f) => f || p.faq);
  return {
    path: p.path,
    title: p.title,
    description: p.description,
    bodyClass: 'is-landing',
    jsonld: {
      '@context': 'https://schema.org', '@type': 'Service', name: p.title, serviceType: 'Website design',
      provider: { '@type': 'Organization', name: SITE.name, legalName: SITE.legalName, url: SITE.origin + '/' },
      areaServed: { '@type': 'Country', name: 'United Kingdom' }, url: SITE.origin + p.path,
      offers: { '@type': 'Offer', price: t[0].build.toFixed(2), priceCurrency: 'GBP' },
    },
    body: pageHero({
      crumbs: [{ href: '/', label: 'Home' }, { href: '/websites/', label: 'Websites' }, { label: p.crumb }],
      eyebrow: p.eyebrow,
      title: `${esc(p.lead)} <em class="serif">${esc(p.accent)}</em>`,
      lede: esc(p.lede),
      price: `<strong>From ${money(t[0].build)}</strong> to build <span>· then from ${money(t[0].m12)} a month, or ${money(WEB.care.monthly)} on the Care plan · ${VAT_NOTE}</span>`,
      actions: `${btn('#start', 'Get my free demo', { variant: 'gold', size: 'lg' })}${btn(`/concepts/${c.slug}/`, 'See a concept live', { variant: 'ghost', size: 'lg', ic: 'arrow-up-right', attrs: `target="_blank" rel="noopener" aria-label="See the ${esc(c.name)} concept live (opens in a new tab)"` })}`,
      aside: `<div class="phero__devices">${browser(c, { eager: true, sizes: '(min-width: 1100px) 520px, 90vw', alt: `${c.name} concept website, desktop view` })}${phone(c, { cls: 'phero__phone', sizes: '150px', alt: `${c.name} concept website, phone view` })}</div><p class="stage__caption">Concept: ${esc(c.name)}, a working website we designed and built for a made-up business. Not a real business.</p>`,
    }) + `
<section class="section section--muted" id="start" aria-label="Get your free demo">
  <div class="container formwrap">
    <div class="formwrap__main">${quoteForm({ id: 'quote', title: 'Get your free demo', intro: 'It takes a minute. We reply within 24 hours and arrange a quick call. No obligation.', interests: ['websites'], submit: 'Send, and get my free demo' })}</div>
    <div class="formwrap__side">
      <div class="card side">
        <p class="eyebrow">Your real one</p>
        <h2 class="side__title">Yours, designed from scratch in two working days.</h2>
        <p class="side__text">${esc(p.pitch)}</p>
        ${tickList(p.get)}
      </div>
      <p class="side__mail">${icon('mail', { cls: 'icon icon--sm' })}<span>Prefer email? <a href="mailto:${SITE.email}">${SITE.email}</a></span></p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="workTitle">
  <div class="container work work--single">
    <div class="work__visual">${browser(c, { sizes: '(min-width: 1100px) 640px, 92vw', alt: `${c.name} concept website, desktop view` })}${phone(c, { cls: 'work__phone', sizes: '150px', alt: `${c.name} concept website, phone view` })}</div>
    <div class="work__copy">
      ${sectionHead({ eyebrow: 'The work', title: 'Judge us on _the work_.', lede: 'We don’t use borrowed logos or made-up reviews. These are working websites we designed and built for made-up businesses. Open one and try it.', id: 'workTitle' })}
      <h3 class="work__why">Why the ${esc(c.name)} design works</h3>
      ${tickList(c.why)}
      <div class="work__actions">${btn(`/concepts/${c.slug}/`, 'Open it live', { variant: 'primary', ic: 'arrow-up-right', attrs: `target="_blank" rel="noopener" aria-label="Open the ${esc(c.name)} concept live (opens in a new tab)"` })}${btn('/work/', 'See all seven', { variant: 'outline', ic: '' })}</div>
    </div>
  </div>
  <div class="container">
    <div class="name-try card">
      <div><h3 class="name-try__title">${icon('wand', { cls: 'icon' })}See one with your business name</h3><p>Type your business name and pick a concept. It opens live with your name in it. Nothing is sent or saved.</p></div>
      <form class="name-try__form" id="nameTry" novalidate>
        <div class="field"><label for="nameTryName">Your business name</label><input id="nameTryName" type="text" maxlength="32" autocomplete="organization" autocapitalize="words"></div>
        <div class="field"><label for="nameTryConcept">Concept</label><select id="nameTryConcept">${CONCEPTS.filter((x) => x.slug !== 'velluto').map((x) => `<option value="${x.slug}"${x.slug === c.slug ? ' selected' : ''}>${esc(x.name)} (${esc(x.sector.toLowerCase())})</option>`).join('')}</select></div>
        <button type="submit" class="btn btn--primary"><span>Show me</span>${icon('arrow-up-right', { cls: 'btn__icon' })}</button>
      </form>
    </div>
  </div>
</section>

<section class="section section--muted" aria-labelledby="getTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'What you get', title: 'Everything handled, _for one monthly fee_.', id: 'getTitle' })}
    <ul class="features features--4" role="list">${FEATURES.map((f) => `<li class="feature"><span class="iconbox">${icon(f.ic)}</span><h3 class="feature__title">${esc(f.title)}</h3><p>${esc(f.text)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="section" aria-labelledby="priceTitle">
  <div class="container split">
    <div class="split__copy">
      ${sectionHead({ eyebrow: 'Pricing', title: 'Clear prices, _published_.', lede: `Monthly payments start a month after you pay for your build. Online booking, taking payments and online shops are quoted separately, free. ${VAT_NOTE}`, id: 'priceTitle' })}
      <dl class="mini-prices">
        <div><dt>Build</dt><dd>From ${money(t[0].build)}<small>One-off, first month included</small></dd></div>
        <div><dt>Monthly</dt><dd>From ${money(t[0].m12)}<small>12-month plan, up to 5 changes</small></dd></div>
        <div><dt>Care plan</dt><dd>${money(WEB.care.monthly)}<small>A month, any size of site</small></dd></div>
      </dl>
      <div class="split__actions">${btn('/websites/#pricing', 'Full website pricing', { variant: 'outline' })}</div>
    </div>
    <div class="split__visual">
      ${sectionHead({ eyebrow: 'How it works', title: 'Three steps _to live_.', level: 3, cls: 'shead--small' })}
      ${steps(STEPS, { when: true, cls: 'steps--compact' })}
    </div>
  </div>
</section>

<section class="section section--muted" aria-labelledby="promTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Our promises', title: 'In writing, _not in small print_.', id: 'promTitle' })}
    <ul class="promises" role="list">${promises.map((x) => `<li class="promise">${icon('shield', { cls: 'promise__icon' })}<h3 class="promise__title">${esc(x.title)}</h3><p>${esc(x.text)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="section" aria-labelledby="moreTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'More than a website', title: 'Services that _work while you work_.', lede: 'When your website’s live, we can also answer your out-of-hours calls with an AI receptionist, organise your website enquiries and help with your social media. Every one is optional, and priced on its own.', id: 'moreTitle' })}
    <div class="cards">${p.tools.map((id) => serviceCard(byId[id])).join('')}</div>
  </div>
</section>

<section class="section section--muted" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Straight _answers_.', ledeHtml: `More questions? See <a href="/websites/">websites</a> or <a href="/pricing/">pricing</a>, or ask us. We reply ${SITE.replyTime}.`, id: 'faqTitle' })}
    ${faqList(faqs)}
  </div>
</section>
${ctaBand({ title: 'See yours _before you decide_.', text: 'Tell us about your business and we’ll reply within 24 hours. It’s free, and there’s no obligation.', primary: { href: '#start', label: 'Get my free demo' } })}`,
  };
}

export default PAGES.map(landing);
