// KWM Systems · /about/ and /contact/
import { SITE, DISCLOSURE } from '../content/site.mjs';
import { SERVICES, pathOf } from '../content/services.mjs';
import { WEB, OS, money } from '../content/pricing.mjs';
import { PROCESS } from '../content/websites.mjs';
import { btn, sectionHead, steps, quoteForm, demoForm, ctaBand, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';
import { pageHero } from './web.mjs';

const COMPANIES_HOUSE = `https://find-and-update.company-information.service.gov.uk/company/${SITE.companyNumber}`;

const companyCard = `
<div class="card company">
  <p class="eyebrow">Company details</p>
  <dl class="company__list">
    <div><dt>Trading name</dt><dd>${SITE.name} (formerly ${SITE.formerName})</dd></div>
    <div><dt>Company</dt><dd>${SITE.legalName}</dd></div>
    <div><dt>Company number</dt><dd><a href="${COMPANIES_HOUSE}" rel="noopener">${SITE.companyNumber}</a>, registered in ${SITE.registeredIn}</dd></div>
    <div><dt>Registered office</dt><dd>${SITE.office}</dd></div>
    <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
  </dl>
</div>`;

const PRINCIPLES = [
  { ic: 'receipt', title: 'Prices in public', text: 'Every price is on our website, including what’s included and what isn’t. If something needs a quote, we say so and send it free.' },
  { ic: 'check-circle', title: 'Only what would help', text: 'We’ll tell you if a service wouldn’t be worth it for your business, even if that means you buy less from us.' },
  { ic: 'shield', title: 'Your accounts stay yours', text: 'Your content, your pages and your customers’ details belong to you. We use proper access roles, never your passwords.' },
  { ic: 'sparkle', title: 'Clear about AI', text: 'We tell you which parts use AI and which are done by a person. Our AI never pretends to be a person, and nothing goes out under your name in wording you haven’t approved.' },
  { ic: 'user', title: 'Real examples, no fake proof', text: 'No made-up reviews, no borrowed logos, no inflated numbers. Our concept websites are labelled as concepts, and examples are labelled as examples.' },
  { ic: 'message', title: 'Plain English', text: 'No jargon and no small print surprises. If anything’s unclear, ask and we’ll explain it properly.' },
];

const about = {
  path: '/about/',
  title: 'About us: formerly King Media',
  description: `${SITE.name} is the new name for King Media: websites and business systems for local businesses. A trading name of ${SITE.legalName}, company number ${SITE.companyNumber}.`,
  bodyClass: 'is-about',
  jsonld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: `About ${SITE.name}`, url: SITE.origin + '/about/', mainEntity: { '@type': 'Organization', name: SITE.name, alternateName: SITE.formerName, legalName: SITE.legalName, email: SITE.email, url: SITE.origin + '/' } },
  body: pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { label: 'About' }],
    eyebrow: 'About us',
    title: `King Media is now <em class="serif">${SITE.name}.</em>`,
    lede: 'We started out designing and building websites for local businesses, and we still do. Now we also set up the systems around the website: an AI receptionist for out-of-hours calls, organised website enquiries and help with social media. For businesses ready for more, KWM Business OS connects their tools and workflows.',
    aside: companyCard,
  }) + `
<section class="section" aria-labelledby="changeTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'The new name', title: 'What’s changed, and _what hasn’t_.', id: 'changeTitle' })}
    <div class="duo">
      <div class="card duo__col">
        <h3 class="duo__title">${icon('check-circle', { cls: 'icon duo__icon duo__icon--yes' })}The same</h3>
        <ul class="ticks ticks--yes" role="list">
          ${['The same company: ' + SITE.legalName + ', company number ' + SITE.companyNumber, 'The same website prices, demos and agreements', 'If you already have a website with us, your plan carries on exactly as it is', 'The same way of working: a real demo first, clear prices, and changes by text, WhatsApp or email'].map((t) => `<li>${icon('check', { cls: 'ticks__icon' })}<span>${esc(t)}</span></li>`).join('')}
        </ul>
      </div>
      <div class="card duo__col">
        <h3 class="duo__title">${icon('sparkle', { cls: 'icon duo__icon duo__icon--new' })}New</h3>
        <ul class="ticks ticks--new" role="list">
          ${[`A new name, ${SITE.name}, because we now do more than websites`, `A new email address: ${SITE.email}`, 'An AI receptionist for out-of-hours calls, and website enquiry setup', 'Social media: AI drafts you post yourself, or plans we run for you', 'A one-off Local Business Refresh, and KWM Business OS for a connected system'].map((t) => `<li>${icon('plus', { cls: 'ticks__icon' })}<span>${esc(t)}</span></li>`).join('')}
        </ul>
      </div>
    </div>
    <p class="fineprint">Paying online? Card statements and receipts may still show ${SITE.formerName} for a while. It’s the same company.</p>
  </div>
</section>

<section class="section section--muted" aria-labelledby="doTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'What we do', title: 'Websites first. _Then everything around them._', id: 'doTitle' })}
    <ul class="offer-list" role="list">
      <li class="card offer"><span class="iconbox iconbox--gold">${icon('monitor')}</span><div><h3 class="offer__title"><a href="/websites/">Websites</a></h3><p>Designed, built, hosted and looked after, from ${money(WEB.tiers[0].build)}. See a working demo before you commit.</p></div></li>
      ${SERVICES.map((s) => `<li class="card offer"><span class="iconbox">${icon(s.icon)}</span><div><h3 class="offer__title"><a href="${pathOf(s)}">${esc(s.name)}</a></h3><p>${esc(s.oneLiner)}</p></div></li>`).join('')}
      <li class="card offer offer--os"><span class="iconbox iconbox--gold">${icon('layers')}</span><div><h3 class="offer__title"><a href="/business-os/">KWM Business OS</a></h3><p>Our premium offer: selected software, AI tools and workflows, connected around how your business works. Setup from ${money(OS.setupFrom)}, then from ${money(OS.monthlyFrom)} a month.</p></div></li>
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="howTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'How we work', title: 'Six things _we won’t compromise on_.', id: 'howTitle' })}
    <ul class="principles" role="list">${PRINCIPLES.map((p) => `<li class="principle"><span class="iconbox">${icon(p.ic)}</span><h3 class="principle__title">${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('')}</ul>
  </div>
</section>
${ctaBand({ title: 'Let’s talk about _your business_.', text: 'Tell us what you do and what you’d like to improve. We’ll reply within 24 hours with honest advice and a clear price.' })}`,
};

const contact = {
  path: '/contact/',
  title: 'Contact us: free quotes and website demos',
  description: `Get a free quote for a website, an AI receptionist, social media or KWM Business OS, or request a ${money(WEB.demo.price)} website demo. Email ${SITE.email}. We reply ${SITE.replyTime}.`,
  bodyClass: 'is-contact',
  jsonld: { '@context': 'https://schema.org', '@type': 'ContactPage', name: `Contact ${SITE.name}`, url: SITE.origin + '/contact/', mainEntity: { '@type': 'Organization', name: SITE.name, email: SITE.email, url: SITE.origin + '/' } },
  body: pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { label: 'Contact' }],
    eyebrow: 'Contact',
    title: 'Tell us about <em class="serif">your business.</em>',
    lede: `Ask for a free quote on anything we do, or request a website demo. We reply ${SITE.replyTime}, with honest advice and a clear price.`,
    cls: 'phero--compact',
  }) + `
<section class="section section--tight" aria-label="Choose how to get in touch">
  <div class="container">
    <ul class="chooser" role="list">
      <li><a class="card card--link chooser__card" href="#quote">
        <span class="iconbox">${icon('message')}</span>
        <span class="chooser__text"><span class="chooser__title">Get a free quote</span><span class="chooser__desc">For websites, our services or a Business OS. Free, with no obligation.</span></span>
        ${icon('arrow', { cls: 'chooser__arrow' })}
      </a></li>
      <li><a class="card card--link chooser__card" href="#demo">
        <span class="iconbox iconbox--gold">${icon('monitor')}</span>
        <span class="chooser__text"><span class="chooser__title">Request a website demo</span><span class="chooser__desc">${money(WEB.demo.price)}, ready ${WEB.demo.ready}. No obligation to go ahead.</span></span>
        ${icon('arrow', { cls: 'chooser__arrow' })}
      </a></li>
      <li><a class="card card--link chooser__card" href="mailto:${SITE.email}">
        <span class="iconbox">${icon('mail')}</span>
        <span class="chooser__text"><span class="chooser__title">Email us</span><span class="chooser__desc">${SITE.email}</span></span>
        ${icon('arrow', { cls: 'chooser__arrow' })}
      </a></li>
    </ul>
  </div>
</section>

<section class="section section--muted" id="quote" aria-labelledby="quoteTitle">
  <div class="container formwrap">
    <div class="formwrap__main">${quoteForm({ id: 'quote' })}</div>
    <div class="formwrap__side">
      <div class="card side">
        <h3 class="side__title">What happens next</h3>
        <ol class="side__steps" role="list">
          <li><strong>We reply ${SITE.replyTime}</strong><span>By email, or a call if you’d prefer.</span></li>
          <li><strong>A short chat</strong><span>About your business, and what’s getting missed or what you’d like to improve.</span></li>
          <li><strong>A clear recommendation and price</strong><span>In writing. Only what would genuinely help.</span></li>
          <li><strong>Nothing starts until you say yes</strong><span>No obligation, and no pressure.</span></li>
        </ol>
      </div>
      <p class="side__mail">${icon('mail', { cls: 'icon icon--sm' })}<span>Prefer email? <a href="mailto:${SITE.email}">${SITE.email}</a></span></p>
    </div>
  </div>
</section>

<section class="section" id="demo" aria-labelledby="demoTitle">
  <div class="container formwrap">
    <div class="formwrap__main">${demoForm({ id: 'demo' })}</div>
    <div class="formwrap__side">
      <div class="card side">
        <h3 class="side__title">How the demo works</h3>
        ${steps(PROCESS.slice(0, 4), { when: true, cls: 'steps--compact steps--side' })}
      </div>
      <p class="side__mail">${icon('info', { cls: 'icon icon--sm' })}<span>Just want to ask something first? <a href="#quote">Get a free quote</a> instead.</span></p>
    </div>
  </div>
</section>`,
};

export default [about, contact];
