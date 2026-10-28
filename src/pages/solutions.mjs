// KWM Systems · /solutions/ services hub, the AI receptionist and enquiry setup, the Local Business Refresh and social media
import { SITE } from '../content/site.mjs';
import { SERVICES, byId, pathOf, EXAMPLE_NOTE, GENERAL_FAQS } from '../content/services.mjs';
import { PRICES, SOCIAL, OS, POLICY, money, VAT_NOTE } from '../content/pricing.mjs';
import { btn, badge, involvement, sectionHead, summaryCard, postPreview, timeline, dayStrip, steps, tickList, faqList, fallbackList, socialTierCard, socialQuote, solutionCard, socialExamples, socialMonth, diyCard, ctaBand, noteCard, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';
import { pageHero } from './web.mjs';

const ask = (s) => `/contact/?interest=${s.id}#quote`;
const ICON = { receptionist: 'moon', enquiry: 'form' };

const visualFor = (s) => summaryCard(s.example.slip, { ic: ICON[s.id] }) + `<p class="fineprint fineprint--dark">${esc(EXAMPLE_NOTE)}</p>`;

function serviceJsonLd(s, price) {
  return {
    '@context': 'https://schema.org', '@type': 'Service', name: s.fullName, description: s.description, serviceType: s.name,
    provider: { '@type': 'Organization', name: SITE.name, legalName: SITE.legalName, url: SITE.origin + '/' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' }, url: SITE.origin + pathOf(s),
    ...(price ? { offers: { '@type': 'Offer', priceCurrency: 'GBP', price: price.toFixed(2), priceSpecification: { '@type': 'UnitPriceSpecification', price: price.toFixed(2), priceCurrency: 'GBP', unitText: 'MONTH' } } } : {}),
  };
}

const priceBox = (s) => {
  const p = PRICES[s.id];
  return `<div class="pricebox">
  <p class="pricebox__label">Launch price</p>
  <p class="pricebox__amount"><span>${money(p.monthly)}</span> a month</p>
  <ul class="pricebox__list" role="list">
    <li>${icon('check', { cls: 'icon icon--sm' })}<span>${money(p.setup)} one-off setup</span></li>
    <li>${icon('check', { cls: 'icon icon--sm' })}<span>${esc(p.allowance.short.charAt(0).toUpperCase() + p.allowance.short.slice(1))}</span></li>
    <li>${icon('check', { cls: 'icon icon--sm' })}<span>${p.topUp ? `More if you need it: ${money(p.topUp.price)} for ${p.topUp.amount} ${esc(p.topUp.unit)}, only if you say yes` : esc(p.fairUse)}</span></li>
    <li>${icon('check', { cls: 'icon icon--sm' })}<span>Monthly, with ${POLICY.notice}’ notice to cancel</span></li>
  </ul>
  <p class="pricebox__vat">${VAT_NOTE}</p>
  ${btn(ask(s), 'Ask about setup', { variant: 'gold', size: 'block' })}
</div>`;
};

function toolPage(s) {
  const p = PRICES[s.id];
  const hero = pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { href: '/solutions/', label: 'Services' }, { label: s.name }],
    eyebrow: s.moment,
    title: esc(s.name) + '.',
    lede: esc(s.lede),
    actions: `${btn(ask(s), 'Ask about setup', { variant: 'gold', size: 'lg' })}${btn('/pricing/#services', 'All prices', { variant: 'ghost', size: 'lg', ic: '' })}`,
    chips: involvement(p.involvement) + badge(s.ai ? 'Uses AI' : 'No AI', 'dark'),
    price: `<strong>${money(p.monthly)}</strong> a month <span>· ${money(p.setup)} setup · ${esc(p.allowance.short)}</span>`,
    aside: `<div class="phero__visual">${visualFor(s)}</div>`,
  });

  return {
    path: pathOf(s),
    title: s.title,
    description: s.description,
    bodyClass: `is-service is-${s.id}`,
    jsonld: serviceJsonLd(s, p.monthly),
    body: hero + `
<section class="section" aria-labelledby="howTitle">
  <div class="container how">
    <div class="how__steps">
      ${sectionHead({ eyebrow: 'How it works', title: 'What happens, _step by step_.', id: 'howTitle' })}
      ${steps(s.steps, { cls: 'steps--compact' })}
    </div>
    <div class="how__example card" role="group" aria-labelledby="exTitle">
      <p class="eyebrow">Example</p>
      <h3 class="how__ex-title" id="exTitle">${esc(s.example.title)}</h3>
      ${timeline(s.example.events)}
      <p class="fineprint">${esc(EXAMPLE_NOTE)}</p>
    </div>
  </div>
</section>
<section class="section section--muted" aria-labelledby="scopeTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Included, and not', title: 'What you get, and _what it won’t do_.', id: 'scopeTitle' })}
    <div class="duo">
      <div class="card duo__col"><h3 class="duo__title">${icon('check-circle', { cls: 'icon duo__icon duo__icon--yes' })}You get</h3>${tickList(s.youGet, 'yes')}</div>
      <div class="card duo__col"><h3 class="duo__title">${icon('cross', { cls: 'icon duo__icon duo__icon--no' })}It won’t</h3>${tickList(s.wontDo, 'no')}</div>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="fitTitle">
  <div class="container fit">
    <div class="fit__col">
      ${sectionHead({ eyebrow: 'Is it for you?', title: 'Who it _suits_.', id: 'fitTitle' })}
      <h3 class="fit__h">Good for</h3>${tickList(s.forWho, 'yes')}
      <h3 class="fit__h">Not the right fit for</h3>${tickList(s.notFor, 'no')}
    </div>
    <div class="fit__col">
      ${sectionHead({ eyebrow: 'When it needs you', title: 'When it’s _not straightforward_.' })}
      ${fallbackList(s.fallbacks)}
      <p class="callout">${icon('bell', { cls: 'icon' })}<span><strong>Where you see it:</strong> ${esc(s.ownerSees)}</span></p>
    </div>
  </div>
</section>
<section class="section section--muted" aria-labelledby="setupTitle">
  <div class="container setupx">
    <div class="setupx__copy">
      ${sectionHead({ eyebrow: 'Setting up', title: 'What we _need from you_.', id: 'setupTitle' })}
      ${tickList(s.youProvide, 'yes')}
      <h3 class="setupx__h">Usage and limits</h3>
      <p>${esc(s.usage.counts)}</p>
      <p>${esc(s.usage.atLimit)}</p>
    </div>
    <div class="setupx__price">${priceBox(s)}</div>
  </div>
</section>
<section class="section" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: `${esc(s.name)}: _questions_`, id: 'faqTitle' })}
    ${faqList(s.faqs)}
  </div>
</section>
${ctaBand({ title: { receptionist: 'Would an AI receptionist _suit you_?', enquiry: 'Would enquiry setup _suit you_?' }[s.id], text:'Tell us how you work. We’ll be straight with you about whether it would help, and what setup involves.' })}`,
  };
}

/* The Local Business Refresh: a one-off project, quoted after a free look. Only the three parts the owner described. */
const REFRESH_PARTS = [
  { ic: 'monitor', title: 'Your website’s wording and pages', text: 'We go through the copy and pages on your current website and tidy them up, so they’re clear, current and easy to read.' },
  { ic: 'pin', title: 'Your Google Business Profile', text: 'We refresh your Google Business Profile, so what people see when they find you on Google is up to date.' },
  { ic: 'receipt', title: 'A quote-preparation guide', text: 'A guide for your business to help you prepare quotes. We agree what it covers with you before we start.' },
];
const REFRESH_FAQS = [
  { q: 'How much does it cost?', a: 'It depends on your website and how much needs changing. We take a free look first, then give you the price in writing before anything starts.' },
  { q: 'Is it a monthly service?', a: 'No. It’s a one-off project. If you’d like ongoing help afterwards, our website plans and social media plans are monthly.' },
  { q: 'What do you need from me?', a: 'Links to your website and Google Business Profile, access to them (or help from whoever looks after them), and your current services, prices and areas, so the wording is accurate.' },
  { q: 'What goes in the quote-preparation guide?', a: 'We agree what it covers with you before we start, so it fits the way your business prices its work.' },
];

function refreshPage() {
  const s = byId.refresh;
  return {
    path: pathOf(s),
    title: s.title,
    description: s.description,
    bodyClass: 'is-service is-refresh',
    jsonld: serviceJsonLd(s),
    body: pageHero({
      crumbs: [{ href: '/', label: 'Home' }, { href: '/solutions/', label: 'Services' }, { label: s.name }],
      eyebrow: s.moment,
      title: `${esc(s.name)}. <em class="serif">Back up to date.</em>`,
      lede: esc(s.lede),
      chips: involvement('project'),
      price: '<strong>Quoted</strong> after a free look <span>· a one-off project</span>',
      actions: `${btn(ask(s), 'Ask about a refresh', { variant: 'gold', size: 'lg' })}${btn('/solutions/', 'All services', { variant: 'ghost', size: 'lg', ic: '' })}`,
      aside: `<div class="phero__visual"><div class="refresh card" role="group" aria-labelledby="refreshCardTitle">
        <p class="refresh__title" id="refreshCardTitle">Your refresh, in three parts</p>
        <ul class="refresh__list" role="list">${REFRESH_PARTS.map((r) => `<li>${icon(r.ic, { cls: 'icon' })}<span>${esc(r.title)}</span></li>`).join('')}</ul>
        <p class="refresh__foot">${icon('receipt', { cls: 'icon icon--sm' })}<span>Price in writing before anything starts</span></p>
      </div></div>`,
    }) + `
<section class="section" aria-labelledby="partsTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'What’s included', title: 'Three parts, _done once, done properly_.', lede: 'A focused tidy-up of how your business looks and reads online, and a guide for one of the jobs that takes your time.', id: 'partsTitle' })}
    <ul class="principles" role="list">${REFRESH_PARTS.map((r) => `<li class="principle"><span class="iconbox">${icon(r.ic)}</span><h3 class="principle__title">${esc(r.title)}</h3><p>${esc(r.text)}</p></li>`).join('')}</ul>
  </div>
</section>
<section class="section section--muted" aria-labelledby="refreshHowTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'How it works', title: 'A free look, _then a clear price_.', id: 'refreshHowTitle' })}
    ${steps([
      { title: 'Send us your links', text: 'Tell us about your business and send links to your website and Google Business Profile.' },
      { title: 'A free look and a quote', text: 'We look at what’s there and tell you what we’d change, with the price in writing.' },
      { title: 'The refresh', text: 'If you go ahead, we tidy up your website, refresh your Google profile and prepare your guide, and you check the changes.' },
    ], { cls: 'steps--row steps--3' })}
  </div>
</section>
<section class="section" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Local Business Refresh: _questions_', id: 'faqTitle' })}
    ${faqList(REFRESH_FAQS)}
  </div>
</section>
${ctaBand({ title: 'Has your website _drifted out of date_?', text: 'Send us your website and Google profile. We’ll take a free look and tell you what we’d change, with the price in writing.', primary: { href: ask(s), label: 'Ask about a refresh' } })}`,
  };
}

function socialPage() {
  const s = byId.social;
  const hero = pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { href: '/solutions/', label: 'Services' }, { label: 'Social media' }],
    eyebrow: 'Social media',
    title: 'Social media, <em class="serif">drafted or done for you.</em>',
    lede: `Two ways to keep your pages active. The ${esc(SOCIAL.diy.name)} writes AI drafts of posts from your own job photos and notes, for you to check and post. Or we run your pages for you: we plan the posts, write them, check every one and publish them at sensible times.`,
    actions: `${btn('#plans', 'Compare the options', { variant: 'gold', size: 'lg' })}${btn('/contact/?interest=social#quote', 'Ask a question', { variant: 'ghost', size: 'lg', ic: '' })}`,
    chips: badge('Do it yourself', 'dark') + involvement('managed'),
    price: `<strong>${money(SOCIAL.diy.monthly)}</strong> a month for AI drafts <span>· managed plans from ${money(SOCIAL.tiers[0].monthly)} a month, ${money(SOCIAL.setup)} setup</span>`,
    aside: `<div class="phero__visual">${postPreview(s, { dark: true, eager: true })}</div>`,
  });
  return {
    path: pathOf(s),
    title: s.title,
    description: s.description,
    bodyClass: 'is-service is-social',
    jsonld: serviceJsonLd(s, SOCIAL.diy.monthly),
    body: hero + `
<section class="section" id="plans" aria-labelledby="plansTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Options', title: 'Do it yourself, or _have it done for you_.', lede: `Write and post your own with AI drafts, or pick a managed plan priced by how much we do. ${VAT_NOTE}`, id: 'plansTitle' })}
    ${diyCard()}
    <div class="plans-head">
      <h3 class="plans-head__title">Managed for you</h3>
      <p>More posts, more channels and more frequent comment checks take more of our time, so they cost more. ${money(SOCIAL.setup)} one-off setup on every managed plan.</p>
    </div>
    <div class="tiers">${SOCIAL.tiers.map(socialTierCard).join('')}</div>
    ${socialQuote()}
    <p class="capacity">${icon('info', { cls: 'icon icon--sm' })}<span>${esc(SOCIAL.capacity)}</span></p>
    <div class="extras-row">${SOCIAL.extras.map((e) => `<p>${icon('plus', { cls: 'icon icon--sm' })}<span>${esc(e.label)}</span><strong>${e.price ? money(e.price) : esc(e.note)}</strong></p>`).join('')}</div>
    <div class="table-wrap"><table class="ptable ptable--compare"><caption class="visually-hidden">Compare managed social media plans</caption>
      <thead><tr><th scope="col">What’s included</th>${SOCIAL.tiers.map((t) => `<th scope="col">${esc(t.name)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><th scope="row">Posts a month</th>${SOCIAL.tiers.map((t) => `<td data-label="${esc(t.name)}">${t.posts} (${esc(t.pace)})</td>`).join('')}</tr>
        <tr><th scope="row">Facebook and Instagram</th>${SOCIAL.tiers.map((t) => `<td data-label="${esc(t.name)}">${icon('check', { cls: 'icon icon--sm', label: 'Included' })}</td>`).join('')}</tr>
        <tr><th scope="row">Google Business Profile posts</th>${SOCIAL.tiers.map((t) => `<td data-label="${esc(t.name)}">${t.channels.includes('Google Business Profile') ? icon('check', { cls: 'icon icon--sm', label: 'Included' }) : '<span class="muted">Not included</span>'}</td>`).join('')}</tr>
        <tr><th scope="row">Short videos from your clips</th>${SOCIAL.tiers.map((t) => `<td data-label="${esc(t.name)}">${t.videos ? `${t.videos} a month` : `<span class="muted">Extra, ${money(SOCIAL.extras[1].price)} each</span>`}</td>`).join('')}</tr>
        <tr><th scope="row">Comments and messages</th>${SOCIAL.tiers.map((t) => `<td data-label="${esc(t.name)}">${esc(t.comments)}</td>`).join('')}</tr>
        <tr><th scope="row">How hands-on we are</th>${SOCIAL.tiers.map((t) => `<td data-label="${esc(t.name)}">${esc(t.involvement)}</td>`).join('')}</tr>
        <tr><th scope="row">Monthly price</th>${SOCIAL.tiers.map((t) => `<td data-label="${esc(t.name)}"><strong>${money(t.monthly)}</strong></td>`).join('')}</tr>
      </tbody>
    </table></div>
  </div>
</section>
<section class="section section--muted" id="examples" aria-labelledby="examplesTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Examples', title: 'The kind of posts _we make_.', lede: 'Real job photos, before-and-afters, tips, seasonal reminders and short videos, written in your voice and checked by a person before they go out.', id: 'examplesTitle' })}
    ${socialExamples()}
  </div>
</section>
<section class="section" aria-labelledby="howTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Managed plans', title: 'You send the photos. _We do the rest._', lede: 'A simple routine that keeps your pages active without taking your time.', id: 'howTitle' })}
    ${steps(s.steps, { cls: 'steps--grid' })}
  </div>
</section>
<section class="section section--muted" aria-labelledby="monthTitle">
  <div class="container split split--month">
    <div class="split__copy">
      ${sectionHead({ eyebrow: 'A month, planned', title: 'What a month on Regular _looks like_.', lede: 'Twenty posts, Monday to Friday, mixing your job photos with tips and seasonal posts so your pages never look stale. You approve the plan before the month starts, and we check comments and messages twice a week.', id: 'monthTitle' })}
      ${tickList(['A plan you approve before anything goes out', 'Posts at the times your customers are online', 'Anything that needs you passed on with a suggested reply', 'A short report at the end of the month'], 'yes')}
    </div>
    <div class="split__visual">${socialMonth()}</div>
  </div>
</section>
<section class="section" aria-labelledby="scopeTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Managed plans: included, and not', title: 'What you get, and _what we won’t do_.', id: 'scopeTitle' })}
    <div class="duo">
      <div class="card duo__col"><h3 class="duo__title">${icon('check-circle', { cls: 'icon duo__icon duo__icon--yes' })}You get</h3>${tickList(s.youGet, 'yes')}</div>
      <div class="card duo__col"><h3 class="duo__title">${icon('cross', { cls: 'icon duo__icon duo__icon--no' })}We won’t</h3>${tickList(s.wontDo, 'no')}</div>
    </div>
  </div>
</section>
<section class="section section--muted" aria-labelledby="fitTitle">
  <div class="container fit">
    <div class="fit__col">
      ${sectionHead({ eyebrow: 'Is it for you?', title: 'Who it _suits_.', id: 'fitTitle' })}
      <h3 class="fit__h">Good for</h3>${tickList(s.forWho, 'yes')}
      <h3 class="fit__h">Not the right fit for</h3>${tickList(s.notFor, 'no')}
    </div>
    <div class="fit__col">
      ${sectionHead({ eyebrow: 'Getting started', title: 'What we _need from you_.' })}
      ${tickList(s.youProvide, 'yes')}
      ${fallbackList(s.fallbacks)}
    </div>
  </div>
</section>
<section class="section" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Social media _questions_.', id: 'faqTitle' })}
    ${faqList(s.faqs)}
  </div>
</section>
${ctaBand({ title: 'Want your pages _kept active_?', text: 'Tell us about your business and the work you do. We’ll suggest the option that fits, or tell you if you don’t need one yet.' })}`,
  };
}

const scenarios = [
  { id: 'web', time: '13:05', label: 'Website enquiry', s: byId.enquiry, visual: summaryCard(byId.enquiry.example.slip, { ic: 'form' }) },
  { id: 'late', time: '19:52', label: 'Call after hours', s: byId.receptionist, visual: summaryCard(byId.receptionist.example.slip, { ic: 'moon' }) },
];

const HUB_FAQS = [
  { q: 'Can I use just one of these?', a: 'Yes. Every service works on its own, and you can add more later.' },
  GENERAL_FAQS.find((f) => f.q.startsWith('Do I need a website')),
  { q: 'How does setup work?', a: 'We agree the wording with you, connect the service to your phone, website or pages, and test it with made-up details before switching it on. You’ll get a date for that when you go ahead.' },
  { q: 'What do I have to do day to day?', a: `Very little. The AI receptionist and enquiry setup run on their own and send you summaries. For social media, you either post the ${SOCIAL.diy.name}’s drafts yourself, or send us photos of your work and approve the plan.` },
  GENERAL_FAQS.find((f) => f.q.startsWith('Which parts use AI')),
  { q: 'Can I cancel?', a: `Yes. ${POLICY.term}. Cancel with ${POLICY.notice}’ notice. The Local Business Refresh is a one-off project, so there’s nothing to cancel.` },
].filter(Boolean);

const hub = {
  path: '/solutions/',
  title: 'Services: AI receptionist, enquiries, refresh and social media',
  description: `The services around your website: an AI receptionist for out-of-hours calls (${money(PRICES.receptionist.monthly)} a month), website enquiry setup (${money(PRICES.enquiry.monthly)}), a Local Business Refresh, and social media from ${money(SOCIAL.diy.monthly)} a month.`,
  bodyClass: 'is-hub',
  body: pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { label: 'Services' }],
    eyebrow: 'Services',
    title: 'The services around <em class="serif">your website.</em>',
    lede: 'An AI receptionist for out-of-hours calls, organised website enquiries, a one-off Local Business Refresh and help with your social media. Each one does a clear job, uses wording you approve, and is set up and tested with you.',
    actions: `${btn('#all', 'See the services', { variant: 'gold', size: 'lg', ic: 'chev-down' })}${btn('/contact/', 'Get a free quote', { variant: 'ghost', size: 'lg', ic: '' })}`,
    aside: `<div class="lock">
      <div class="lock__screen">
        <p class="lock__date" aria-hidden="true">Tuesday 14 October</p>
        <p class="lock__time" aria-hidden="true">19:52</p>
        <ul class="lock__notes" role="list" aria-label="Example notifications from one day">
          ${noteCard({ ic: 'moon', title: 'Out-of-hours message', meta: '19:52 · Sarah, call back Wed 8–9am', cls: 'n1' })}
          ${noteCard({ ic: 'camera', title: 'Post published', meta: '19:30 · Facebook and Instagram', cls: 'n2' })}
          ${noteCard({ ic: 'form', title: 'New website enquiry', meta: '13:05 · kitchen-diner, B13', cls: 'n3' })}
          ${noteCard({ ic: 'edit', title: 'Post drafts ready', meta: '08:10 · 3 drafts from yesterday’s photos', cls: 'n4' })}
        </ul>
      </div>
    </div>
    <p class="stage__caption">Example notifications. The names and details are made up.</p>`,
  }) + `
<section class="section" id="all" aria-labelledby="allTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Our services', title: 'Pick the help _you need_.', lede: 'Use one on its own, or combine them. Websites are our main service, and KWM Business OS is for businesses ready for a connected system.', id: 'allTitle' })}
    <div class="solcards">
      ${SERVICES.map(solutionCard).join('')}
      <article class="card card--link card--dark solcard solcard--os">
        <div class="solcard__top"><span class="iconbox iconbox--lg">${icon('layers')}</span>${badge('Premium', 'gold')}</div>
        <p class="solcard__tag">Your tools and workflows, connected</p>
        <h3 class="solcard__title"><a class="stretched" href="/business-os/">KWM Business OS</a></h3>
        <p class="solcard__text">A tailored system of selected software, AI tools and workflows, built around how your business works. Important decisions stay with you.</p>
        ${tickList(['Scoped after an initial review', 'Modules chosen to suit your business', 'Built, tested and maintained with you'], 'yes', 'solcard__list')}
        <div class="solcard__foot"><p class="solcard__price"><strong>Setup from ${money(OS.setupFrom)}</strong><span>Then from ${money(OS.monthlyFrom)} a month</span></p><span class="solcard__more" aria-hidden="true">Explore ${icon('arrow', { cls: 'icon icon--sm' })}</span></div>
      </article>
      <article class="card card--link solcard solcard--help">
        <div class="solcard__top"><span class="iconbox iconbox--lg">${icon('message')}</span></div>
        <p class="solcard__tag">Not sure where to start?</p>
        <h3 class="solcard__title"><a class="stretched" href="/contact/?interest=unsure#quote">Ask us what would help</a></h3>
        <p class="solcard__text">Tell us how you work and what gets missed. We’ll recommend only what would genuinely help.</p>
        ${tickList(['Honest advice, even if it means you buy less', 'The price in writing before anything starts', 'No obligation, and no pressure'], 'yes', 'solcard__list')}
        <div class="solcard__foot"><p class="solcard__price"><strong>Free advice</strong><span>We reply within 24 hours</span></p><span class="solcard__more" aria-hidden="true">Get a free quote ${icon('arrow', { cls: 'icon icon--sm' })}</span></div>
      </article>
    </div>
  </div>
</section>

<section class="section section--muted" aria-labelledby="callsTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'When the phone rings', title: 'Closed for the day? _You still get the details._', lede: 'During your working hours, your phone rings as normal. Outside them, calls you don’t answer go to the AI receptionist, which takes the caller’s details and the reason for the call and sends you a summary. Website enquiries arrive as a tidy summary, whenever they’re sent.', id: 'callsTitle' })}
    ${dayStrip()}
    <div class="scen" data-tabs>
      <div class="tabs__list" role="tablist" aria-label="Example enquiries from one day">
        ${scenarios.map((x, i) => `<button type="button" class="tabs__tab" role="tab" id="tab-${x.id}" aria-controls="panel-${x.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="tabs__time">${x.time}</span> ${x.label}</button>`).join('')}
      </div>
      ${scenarios.map((x) => `
      <div class="tabs__panel" role="tabpanel" id="panel-${x.id}" aria-labelledby="tab-${x.id}" tabindex="0">
        <div class="scen__grid">
          <div class="scen__story">
            <p class="scen__kicker"><span class="tabs__time">${x.time}</span> ${x.label} · <a href="${pathOf(x.s)}">${esc(x.s.name)}</a></p>
            <h3 class="scen__title">${esc(x.s.example.title)}</h3>
            ${timeline(x.s.example.events)}
          </div>
          <div class="scen__visual">${x.visual}</div>
        </div>
      </div>`).join('')}
    </div>
    <p class="fineprint">${esc(EXAMPLE_NOTE)}</p>
  </div>
</section>

<section class="section" aria-labelledby="socialTitle">
  <div class="container">
    <div class="shead-row">
      ${sectionHead({ eyebrow: 'Social media', title: 'Your job photos, turned into _posts like these_.', lede: `Post them yourself with AI drafts from the ${SOCIAL.diy.name} for ${money(SOCIAL.diy.monthly)} a month, or let us run your pages from ${money(SOCIAL.tiers[0].monthly)} a month.`, id: 'socialTitle' })}
      <div class="shead-row__actions">${btn(pathOf(byId.social), 'Options and examples', { variant: 'primary' })}</div>
    </div>
    ${socialExamples({ count: 3 })}
  </div>
</section>

<section class="section section--muted" id="faq" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Before you _choose_.', ledeHtml: `Something else? <a href="/contact/">Ask us</a>. We reply ${SITE.replyTime}.`, id: 'faqTitle' })}
    ${faqList(HUB_FAQS)}
  </div>
</section>
${ctaBand()}`,
};

export default [hub, ...SERVICES.filter((s) => !s.managed && !s.quoted).map(toolPage), refreshPage(), socialPage()];
