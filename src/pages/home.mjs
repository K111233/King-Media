// KWM Systems · home page
import { SITE, CTA } from '../content/site.mjs';
import { SERVICES, byId, GENERAL_FAQS, pathOf } from '../content/services.mjs';
import { PRICES, WEB, SOCIAL, OS, money, VAT_NOTE, POLICY } from '../content/pricing.mjs';
import { MONTHLY_INCLUDES, PROMISES } from '../content/websites.mjs';
import { CONCEPTS } from '../content/concepts.mjs';
import { btn, sectionHead, browser, phone, noteCard, serviceCard, steps, tickList, faqList, dayStrip, postPreview, ctaBand, solutionsBar, osTeaser, fromPrice, setupText, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';

const C = Object.fromEntries(CONCEPTS.map((c) => [c.slug, c]));
const social = byId.social;

const hero = `
<section class="hero" aria-labelledby="heroTitle">
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="container hero__grid">
    <div class="hero__copy">
      <p class="eyebrow eyebrow--gold">Websites and business systems</p>
      <h1 class="hero__title" id="heroTitle">Your website, <em class="serif">and the systems behind it.</em></h1>
      <p class="hero__lede">KWM Systems designs, builds and looks after websites for local businesses across the UK, then sets up what sits around them: an AI receptionist for the calls you can’t take, organised website enquiries and help with your social media. Ready for more? KWM Business OS connects your tools and workflows around the way you work.</p>
      <p class="hero__for">${icon('building', { cls: 'icon icon--sm' })}<span>For trades, salons, clinics, cafés, shops and other owner-run local businesses.</span></p>
      <div class="hero__actions">
        ${btn(CTA.href, CTA.label, { variant: 'gold', size: 'lg' })}
        ${btn('/websites/', 'See our websites', { variant: 'ghost', size: 'lg', ic: '' })}
      </div>
      <ul class="hero__proof" role="list">
        <li>${icon('check-circle')}Websites from ${money(WEB.tiers[0].build)}</li>
        <li>${icon('check-circle')}A working demo in 2 working days</li>
        <li>${icon('check-circle')}Live the day after you pay</li>
        <li>${icon('check-circle')}Prices include any VAT that applies</li>
      </ul>
    </div>
    <div class="hero__stage">
      <div class="stage">
        ${browser(C['evergreen-gardens'], { eager: true, cls: 'stage__browser', sizes: '(min-width: 1100px) 560px, 88vw' })}
        ${phone(C['evergreen-gardens'], { cls: 'stage__phone', sizes: '170px' })}
        <ul class="stage__notes" role="list" aria-label="Example notifications from our services">
          ${noteCard({ ic: 'form', title: 'New website enquiry', meta: 'Kitchen-diner, B13 · call after 6pm', cls: 'n1' })}
          ${noteCard({ ic: 'moon', title: 'Out-of-hours message', meta: 'Sarah · call back Wed, 8–9am', cls: 'n2' })}
          ${noteCard({ ic: 'camera', title: 'Post scheduled', meta: 'Facebook and Instagram · Tue 7:30pm', cls: 'n3' })}
          ${noteCard({ ic: 'receipt', title: 'Draft quote to check', meta: 'Business OS · sent only once you approve', cls: 'n4' })}
        </ul>
      </div>
      <p class="stage__caption">Evergreen Gardens is a concept website we designed for a made-up business. The notifications are examples.</p>
    </div>
  </div>
</section>`;

const work = ['ironclad-roofing', 'crumb-and-co', 'halcyon-physio', 'northside-barbers'].map((k) => C[k]);
const websites = `
<section class="section section--muted" aria-labelledby="webTitle">
  <div class="container split">
    <div class="split__copy">
      ${sectionHead({ eyebrow: 'Websites · our main service', title: 'A website that _looks the part_, and keeps up with you.', lede: 'Before they ring you, people look you up, usually on a phone, often in a hurry. We design yours around your customers, your prices and your area, then look after it every month.', id: 'webTitle' })}
      ${tickList(MONTHLY_INCLUDES.slice(0, 4), 'yes')}
      <dl class="mini-prices">
        <div><dt>Demo</dt><dd>${money(WEB.demo.price)}<small>Free if we arrange it on a call</small></dd></div>
        <div><dt>Build</dt><dd>From ${money(WEB.tiers[0].build)}<small>First month included</small></dd></div>
        <div><dt>Monthly</dt><dd>From ${money(WEB.care.monthly)}<small>Care plan, any size</small></dd></div>
      </dl>
      <div class="split__actions">${btn('/contact/#demo', 'Request a demo', { variant: 'primary' })}${btn('/websites/', 'Explore websites', { variant: 'outline', ic: '' })}</div>
    </div>
    <div class="split__visual">
      <ul class="gallery" role="list">${work.map((c) => `<li class="gallery__item"><a class="gallery__link" href="/work/#${c.slug}">${browser(c, { sizes: '(min-width: 1100px) 300px, 45vw' })}<span class="gallery__label"><strong>${esc(c.name)}</strong><span>${esc(c.sector)} · concept</span></span></a></li>`).join('')}</ul>
      <p class="fineprint">Concept websites we designed and built for made-up businesses, to show our work. <a href="/work/">See them all</a>.</p>
    </div>
  </div>
</section>`;

const services = `
<section class="section" aria-labelledby="svcTitle">
  <div class="container">
    <div class="shead-row">
      ${sectionHead({ eyebrow: 'Around your website', title: 'Services that _keep enquiries moving_.', lede: 'Add what helps, when it helps. Each service is set up and tested with you and uses wording you approve.', id: 'svcTitle' })}
      <div class="pricing-note" role="note" aria-label="How we price">
        <p class="pricing-note__title">${icon('info', { cls: 'icon icon--sm' })}How we price</p>
        <p><strong>Automated</strong> services run on software once they’re set up, so they cost less each month. <strong>Managed</strong> social media takes our time every week, so it’s priced by how much we do. <strong>One-off projects</strong> are quoted after a free look.</p>
      </div>
    </div>
    <div class="cards cards--4">${SERVICES.map((s) => serviceCard(s)).join('')}</div>
  </div>
</section>`;

const calls = `
<section class="section section--muted" aria-labelledby="callsTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'When the phone rings', title: 'Closed for the day? _You still get the details._', lede: 'Your phone rings as normal. When you’re on a job or closed for the day, calls you don’t answer go to an AI receptionist that takes the caller’s details and the reason for the call, then sends you a summary, so you can call back and quote when you’re free. Website enquiries arrive as a tidy summary, whenever they’re sent.', id: 'callsTitle' })}
    ${dayStrip()}
    <p class="section__after">${btn(pathOf(byId.receptionist), 'The AI receptionist', { variant: 'outline' })}${btn(pathOf(byId.enquiry), 'Website enquiry setup', { variant: 'outline' })}</p>
  </div>
</section>`;

const socialSection = `
<section class="section section--dark" aria-labelledby="scmTitle">
  <div class="container split split--reverse">
    <div class="split__copy">
      ${sectionHead({ eyebrow: 'Social media', title: 'Your job photos, turned into _a social media presence_.', lede: `Two ways to do it. The ${SOCIAL.diy.name} writes AI drafts from your own photos and notes for you to check and post. Or we run your pages for you, with every post checked by a person.`, id: 'scmTitle' })}
      <ul class="tiers-mini" role="list">
        <li class="tiers-mini__diy"><span class="tiers-mini__name">${esc(SOCIAL.diy.name)}</span><span class="tiers-mini__posts">${esc(SOCIAL.diy.limit)} · you post them</span><span class="tiers-mini__price">${money(SOCIAL.diy.monthly)}<small>/month</small></span></li>
        ${SOCIAL.tiers.map((t) => `<li><span class="tiers-mini__name">${esc(t.name)}</span><span class="tiers-mini__posts">${t.posts} posts a month · we post them</span><span class="tiers-mini__price">${money(t.monthly)}<small>/month</small></span></li>`).join('')}
      </ul>
      <p class="fineprint fineprint--dark">Managed plans have a ${money(SOCIAL.setup)} setup fee. We never buy followers or promise reach. Want more posts or a different rhythm? <a href="${SOCIAL.custom.href}">Tell us and we’ll quote</a>.</p>
      <div class="split__actions">${btn(pathOf(social), 'How it works', { variant: 'gold' })}${btn('/pricing/#social', 'Compare plans', { variant: 'ghost', ic: '' })}</div>
    </div>
    <div class="split__visual">${postPreview(social, { dark: true })}</div>
  </div>
</section>`;

const process = `
<section class="section" aria-labelledby="howTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Getting started', title: 'Simple to start. _Looked after_ from then on.', lede: 'Whether it’s a website, one of our services or a Business OS, it starts with a conversation.', id: 'howTitle', align: 'center' })}
    ${steps([
      { title: 'Tell us what you need', text: 'Send us a message through the enquiry form or by email. Tell us about your business and what’s getting in the way.' },
      { title: 'A clear recommendation and price', text: 'We recommend only what would genuinely help, and put the price in writing. For a website, you can see a working demo within 2 working days.' },
      { title: 'Built and tested with you', text: 'We build it, connect it and test it with you using made-up details, then switch it on.' },
      { title: 'Looked after from then on', text: 'Hosting, changes, monitoring and support, as set out in your plan or proposal.' },
    ], { cls: 'steps--row' })}
    <p class="section__after section__after--center">${btn(CTA.href, CTA.label, { variant: 'primary', size: 'lg' })}</p>
  </div>
</section>`;

const promises = `
<section class="section section--muted" aria-labelledby="promTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'In writing', title: 'Promises, _not small print_.', lede: 'Our website promises are written into the agreement you sign. Our other services come with the same plain rules.', id: 'promTitle' })}
    <ul class="promises" role="list">
      ${PROMISES.map((p) => `<li class="promise">${icon('shield', { cls: 'promise__icon' })}<h3 class="promise__title">${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('')}
      <li class="promise">${icon('clock', { cls: 'promise__icon' })}<h3 class="promise__title">No long tie-ins on services.</h3><p>${esc(POLICY.term)}. Cancel with ${POLICY.notice}’ notice.</p></li>
      <li class="promise">${icon('receipt', { cls: 'promise__icon' })}<h3 class="promise__title">Nothing extra without your OK.</h3><p>We tell you at ${POLICY.warnAt}% of any allowance, and we never charge for extra use unless you say yes.</p></li>
      <li class="promise">${icon('check-circle', { cls: 'promise__icon' })}<h3 class="promise__title">If it can’t work, you don’t pay for setup.</h3><p>${esc(POLICY.setupRefund)}</p></li>
    </ul>
  </div>
</section>`;

const tab = (id, label, on = false) => `<button type="button" class="tabs__tab" role="tab" id="pt-${id}" aria-controls="pp-${id}" aria-selected="${on}" tabindex="${on ? 0 : -1}">${label}</button>`;
const priceTabs = `
<section class="section" id="pricing" aria-labelledby="pricesTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Prices', title: 'Clear prices, _published_.', lede: `No hidden extras and no “call us for a price”. ${VAT_NOTE}`, id: 'pricesTitle' })}
    <div class="tabs" data-tabs>
      <div class="tabs__list" role="tablist" aria-label="Price lists">${tab('web', 'Websites', true)}${tab('svc', 'Services')}${tab('social', 'Social media')}${tab('os', 'Business OS')}</div>
      <div class="tabs__panel" role="tabpanel" id="pp-web" aria-labelledby="pt-web" tabindex="0">
        <div class="table-wrap"><table class="ptable"><thead><tr><th scope="col">Website size</th><th scope="col">Build (one-off)</th><th scope="col">12-month plan</th><th scope="col">5-year plan</th></tr></thead><tbody>
          ${WEB.tiers.map((t) => `<tr><th scope="row">${esc(t.label)}</th><td data-label="Build"><strong>${money(t.build)}</strong></td><td data-label="12-month plan">${money(t.m12)}/month</td><td data-label="5-year plan">${money(t.m5)}/month</td></tr>`).join('')}
        </tbody></table></div>
        <p class="fineprint">Or the Care plan: ${money(WEB.care.monthly)} a month. ${WEB.care.detail} Website demo ${money(WEB.demo.price)}, free if we arrange it on a call.</p>
      </div>
      <div class="tabs__panel" role="tabpanel" id="pp-svc" aria-labelledby="pt-svc" tabindex="0">
        <div class="table-wrap"><table class="ptable"><thead><tr><th scope="col">Service</th><th scope="col">Price</th><th scope="col">Setup</th><th scope="col">Included</th></tr></thead><tbody>
          ${SERVICES.filter((s) => !s.managed).map((s) => `<tr><th scope="row"><a href="${pathOf(s)}">${esc(s.name)}</a></th><td data-label="Price"><strong>${fromPrice(s)}</strong></td><td data-label="Setup">${s.quoted ? 'One-off project' : money(PRICES[s.id].setup)}</td><td data-label="Included">${s.quoted ? 'Website wording and pages, Google Business Profile, quote-preparation guide' : esc(PRICES[s.id].allowance.short)}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="fineprint">${esc(POLICY.term)}. The Local Business Refresh is a one-off project, priced after a free look at your website and Google profile.</p>
      </div>
      <div class="tabs__panel" role="tabpanel" id="pp-social" aria-labelledby="pt-social" tabindex="0">
        <div class="table-wrap"><table class="ptable"><thead><tr><th scope="col">Plan</th><th scope="col">Monthly</th><th scope="col">What you get</th><th scope="col">Who posts</th></tr></thead><tbody>
          <tr><th scope="row">${esc(SOCIAL.diy.name)}</th><td data-label="Monthly"><strong>${money(SOCIAL.diy.monthly)}</strong></td><td data-label="What you get">AI drafts from your photos and notes, ${esc(SOCIAL.diy.limit.toLowerCase())}</td><td data-label="Who posts">You do</td></tr>
          ${SOCIAL.tiers.map((t) => `<tr><th scope="row">${esc(t.name)}</th><td data-label="Monthly"><strong>${money(t.monthly)}</strong></td><td data-label="What you get">${t.posts} posts a month (${esc(t.pace)}) on ${t.channels.join(', ')}</td><td data-label="Who posts">We do</td></tr>`).join('')}
        </tbody></table></div>
        <p class="fineprint">No setup fee for the ${esc(SOCIAL.diy.name)}; ${money(SOCIAL.setup)} setup on managed plans. Monthly, with no minimum term.</p>
      </div>
      <div class="tabs__panel" role="tabpanel" id="pp-os" aria-labelledby="pt-os" tabindex="0">
        <div class="ostab">
          <p class="ostab__price"><span><small>Setup from</small><strong>${money(OS.setupFrom)}</strong></span><span><small>Then from</small><strong>${money(OS.monthlyFrom)}</strong><small>a month</small></span></p>
          <p class="ostab__text">A tailored system of selected software, AI tools and workflows, scoped around your business after an initial review. Your exact scope, monthly fee and any third-party costs are confirmed in a written proposal.</p>
          ${btn('/business-os/', 'Explore Business OS', { variant: 'outline' })}
        </div>
      </div>
    </div>
    <p class="section__after">${btn('/pricing/', 'See every price and what’s included', { variant: 'primary' })}</p>
  </div>
</section>`;

const faq = `
<section class="section section--muted" id="faq" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Straight _answers_.', ledeHtml: `Can’t see yours? <a href="/contact/">Ask us</a>. We reply ${SITE.replyTime}.`, id: 'faqTitle' })}
    ${faqList(GENERAL_FAQS)}
  </div>
</section>`;

export default [{
  path: '/',
  fullTitle: 'KWM Systems | Websites and business systems for local businesses',
  ogTitle: 'KWM Systems: websites and business systems for local businesses',
  description: `Websites designed, built and looked after for UK local businesses from ${money(WEB.tiers[0].build)}, plus an AI receptionist, enquiry setup, social media and Business OS.`,
  ogAlt: 'KWM Systems. Websites and business systems for local businesses.',
  bodyClass: 'is-home',
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE.name,
    legalName: SITE.legalName,
    identifier: `Company number ${SITE.companyNumber} (${SITE.registeredIn})`,
    url: SITE.origin + '/',
    logo: SITE.origin + '/assets/kwm/icons/icon-512.png',
    image: SITE.origin + '/assets/kwm/share/og-kwm.png',
    description: 'Websites and business systems for UK local businesses: website design, build, hosting and care plans, an AI receptionist for the calls you can’t take, website enquiry setup, a Local Business Refresh, social media management and KWM Business OS.',
    email: SITE.email,
    address: { '@type': 'PostalAddress', streetAddress: '124 City Road', addressLocality: 'London', postalCode: 'EC1V 2NX', addressCountry: 'GB' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    currenciesAccepted: 'GBP',
  },
  body: hero + solutionsBar() + websites + services + osTeaser({ id: 'homeOs' }) + calls + socialSection + process + promises + priceTabs + faq + ctaBand({ sectionId: 'contact' }),
}];
