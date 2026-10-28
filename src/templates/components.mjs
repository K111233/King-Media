// KWM Systems · components.mjs · the pieces pages are built from. Plain functions that return HTML.
import { icon } from './icons.mjs';
import { PRICES, WEB, SOCIAL, OS, INVOLVEMENT, money, VAT_NOTE } from '../content/pricing.mjs';
import { SERVICES, byId, pathOf, EXAMPLE_NOTE } from '../content/services.mjs';
import { SITE, CTA } from '../content/site.mjs';
import { EXAMPLE_POSTS, POST_TYPES, EXAMPLE_MONTH } from '../content/social-examples.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Headline text: _words_ become the serif italic accent
export const rich = (s) => esc(s).replace(/_(.+?)_/g, '<em class="serif">$1</em>');

export const btn = (href, label, { variant = 'primary', size = '', ic = 'arrow', attrs = '' } = {}) =>
  `<a class="btn btn--${variant}${size ? ' btn--' + size : ''}" href="${href}"${attrs ? ' ' + attrs : ''}><span>${label}</span>${ic ? icon(ic, { cls: 'btn__icon' }) : ''}</a>`;

export const badge = (text, variant = 'neutral', ic = '') =>
  `<span class="badge badge--${variant}">${ic ? icon(ic, { cls: 'badge__icon' }) : ''}${esc(text)}</span>`;

export function involvement(key) {
  const i = INVOLVEMENT[key];
  const person = key === 'managed' || key === 'either';
  return `<span class="badge badge--${person ? 'gold' : 'navy'}" title="${esc(i.note)}">${icon(person ? 'user' : key === 'project' ? 'receipt' : 'sparkle', { cls: 'badge__icon' })}${esc(i.label)}</span>`;
}

export const sectionHead = ({ eyebrow, title, lede, ledeHtml, id, align = 'left', level = 2, cls = '' }) =>
  `<div class="shead${align === 'center' ? ' shead--center' : ''}${cls ? ' ' + cls : ''}">${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}<h${level} class="shead__title"${id ? ` id="${id}"` : ''}>${rich(title)}</h${level}>${ledeHtml ? `<p class="shead__lede">${ledeHtml}</p>` : lede ? `<p class="shead__lede">${rich(lede)}</p>` : ''}</div>`;

export const breadcrumb = (items) =>
  `<nav class="crumbs" aria-label="Breadcrumb"><ol role="list">${items.map((it, i) => (i < items.length - 1 ? `<li><a href="${it.href}">${esc(it.label)}</a>${icon('chev', { cls: 'crumbs__sep' })}</li>` : `<li><span aria-current="page">${esc(it.label)}</span></li>`)).join('')}</ol></nav>`;

/* ---------- Device mock-ups with real concept renders ---------- */
function picture(c, kind, { eager = false, sizes = '', alt = '' } = {}) {
  const lazy = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  if (kind === 'phone') {
    return `<picture><source type="image/avif" srcset="${c.r.phone(400, 'avif')} 400w, ${c.r.phone(600, 'avif')} 600w, ${c.r.phone(800, 'avif')} 800w" sizes="${sizes || '220px'}"><img src="${c.r.phone(400, 'webp')}" srcset="${c.r.phone(400, 'webp')} 400w, ${c.r.phone(600, 'webp')} 600w, ${c.r.phone(800, 'webp')} 800w" sizes="${sizes || '220px'}" width="393" height="852" alt="${esc(alt)}" decoding="async"${lazy}></picture>`;
  }
  return `<picture><source type="image/avif" srcset="${c.r.desk(960, 'avif')} 960w, ${c.r.desk(1440, 'avif')} 1440w, ${c.r.desk(1920, 'avif')} 1920w" sizes="${sizes || '(min-width: 1100px) 640px, 92vw'}"><img src="${c.r.desk(960, 'webp')}" srcset="${c.r.desk(960, 'webp')} 960w, ${c.r.desk(1440, 'webp')} 1440w, ${c.r.desk(1920, 'webp')} 1920w" sizes="${sizes || '(min-width: 1100px) 640px, 92vw'}" width="1280" height="800" alt="${esc(alt)}" decoding="async"${lazy}></picture>`;
}

export const browser = (c, { eager = false, sizes = '', cls = '', alt = '' } = {}) =>
  `<div class="browser${cls ? ' ' + cls : ''}"><div class="browser__bar" aria-hidden="true"><span class="browser__dots"><i></i><i></i><i></i></span><span class="browser__url">${icon('lock', { cls: 'browser__lock' })}${esc(c.slug.replace(/-/g, ''))}.co.uk</span></div><div class="browser__screen">${picture(c, 'desk', { eager, sizes, alt })}</div></div>`;

export const phone = (c, { eager = false, sizes = '', cls = '', alt = '' } = {}) =>
  `<div class="handset${cls ? ' ' + cls : ''}"><div class="handset__screen">${picture(c, 'phone', { eager, sizes, alt })}</div></div>`;

/* ---------- Small floating notification (hero stage) ---------- */
export const noteCard = ({ ic, title, meta, tone = 'light', cls = '' }) =>
  `<li class="note-card note-card--${tone}${cls ? ' ' + cls : ''}"><span class="note-card__icon">${icon(ic)}</span><span class="note-card__text"><span class="note-card__title">${esc(title)}</span><span class="note-card__meta">${esc(meta)}</span></span></li>`;

/* ---------- A summary, as the owner receives it (examples only) ---------- */
export function summaryCard(s, { ic = 'phone', label = '' } = {}) {
  const rows = s.fields.map(([k, v]) => `<div class="sum__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  const chips = (s.ticks || []).map(([t, on]) => `<li class="chip${on ? ' chip--on' : ''}">${icon(on ? 'check' : 'cross', { cls: 'chip__icon' })}${esc(t)}<span class="visually-hidden">: ${on ? 'yes' : 'no'}</span></li>`).join('');
  return `<article class="sum" aria-label="${esc(label || 'Example ' + s.kind.toLowerCase() + ' summary')}">
  <header class="sum__head"><span class="sum__icon">${icon(ic)}</span><span class="sum__titles"><span class="sum__kind">${esc(s.kind)}</span><span class="sum__time">${esc(s.time)}</span></span><span class="badge badge--neutral">Example</span></header>
  <dl class="sum__fields">${rows}</dl>
  ${chips ? `<ul class="sum__chips" role="list">${chips}</ul>` : ''}
</article>`;
}

/* ---------- A text conversation on a phone (the caller's side) ---------- */
export function phoneThread(thread, { title = 'Text message', note = EXAMPLE_NOTE } = {}) {
  const bubbles = thread.map((m) => `<li class="bubble bubble--${m.from === 'biz' ? 'in' : 'out'}"><p>${esc(m.text)}</p><span class="bubble__time">${esc(m.time)}</span></li>`).join('');
  return `<figure class="convo">
  <div class="convo__phone" role="img" aria-label="${esc('Example text conversation. ' + thread.map((m) => (m.from === 'biz' ? 'Business: ' : 'Caller: ') + m.text).join(' '))}">
    <div class="convo__top" aria-hidden="true"><span class="convo__island"></span></div>
    <p class="convo__title" aria-hidden="true">${esc(title)}<span class="badge badge--neutral">Example</span></p>
    <ol class="convo__thread" role="list" aria-hidden="true">${bubbles}</ol>
  </div>
  <figcaption class="fineprint">${esc(note)}</figcaption>
</figure>`;
}

/* ---------- A social post, as it appears on the client's page (example) ---------- */
export function postPreview(s, { eager = false, dark = false } = {}) {
  const ex = s.example;
  return `<figure class="post${dark ? ' post--dark' : ''}">
  <div class="post__card">
    <header class="post__head"><span class="post__avatar" aria-hidden="true">HR</span><span class="post__who"><span class="post__name">Hall Green Roofing</span><span class="post__meta">${icon('calendar', { cls: 'post__metaicon' })}Scheduled for Tue, 7:30pm</span></span><span class="badge badge--neutral">Example</span></header>
    <p class="post__text">${esc(ex.draft)}</p>
    <div class="post__photo"><picture><source type="image/avif" srcset="/assets/kwm/img/roof-400.avif 400w, /assets/kwm/img/roof-600.avif 600w" sizes="(min-width: 1000px) 460px, 90vw"><img src="/assets/kwm/img/roof-600.webp" srcset="/assets/kwm/img/roof-400.webp 400w, /assets/kwm/img/roof-600.webp 600w" sizes="(min-width: 1000px) 460px, 90vw" width="600" height="450" alt="${esc(ex.photo.alt)}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}></picture></div>
    <footer class="post__foot"><span>Facebook</span><span>Instagram</span><span>Google Business Profile</span></footer>
  </div>
  <figcaption class="fineprint">Example: a made-up business, with notes and a post written to show how it works. ${esc(ex.photo.credit)}</figcaption>
</figure>`;
}

/* ---------- A timed example (a real sequence, so the times carry the order) ---------- */
export const timeline = (events) => `<ol class="timeline" role="list">${events.map((e) => `<li class="timeline__item"><time class="timeline__time">${esc(e.time)}</time><p>${esc(e.text)}</p></li>`).join('')}</ol>`;

/* ---------- The day strip: working hours vs out of hours ---------- */
export function dayStrip({ start = 8, end = 18, pins = true, id = 'day' } = {}) {
  const pct = (h) => ((h / 24) * 100).toFixed(3) + '%';
  const marks = [
    { at: 13 + 5 / 60, time: '13:05', label: 'Website enquiry', side: 'on' },
    { at: 19 + 52 / 60, time: '19:52', label: 'Call after hours', side: 'off' },
  ];
  const hours = [0, 6, 12, 18, 24].map((h) => `<span style="--x:${pct(h)}">${String(h).padStart(2, '0')}:00</span>`).join('');
  return `<figure class="day" id="${id}">
  <div class="day__track" role="img" aria-label="An example day. Working hours are 8am to 6pm, when your phone rings as normal. Before 8am and after 6pm is out of hours, when the AI receptionist answers calls you don’t pick up.${pins ? ' Example times: a website enquiry at 13:05 and a call after hours at 19:52.' : ''}">
    <span class="day__seg day__seg--off" style="--a:0%;--b:${pct(start)}"></span>
    <span class="day__seg day__seg--on" style="--a:${pct(start)};--b:${pct(end)}"><span class="day__seg-label">Your working hours</span></span>
    <span class="day__seg day__seg--off day__seg--late" style="--a:${pct(end)};--b:100%"><span class="day__seg-label">Out of hours</span></span>
    ${pins ? marks.map((m, i) => `<span class="day__pin day__pin--${m.side} day__pin--n${i + 2}" style="--x:${pct(m.at)}"><span class="day__pin-time">${m.time}</span><span class="day__pin-label">${m.label}</span></span>`).join('') : ''}
  </div>
  <div class="day__hours" aria-hidden="true">${hours}</div>
  <figcaption class="day__key">
    <span class="day__key-item"><span class="day__swatch day__swatch--on" aria-hidden="true"></span><span><strong>Working hours:</strong> your phone rings as normal</span></span>
    <span class="day__key-item"><span class="day__swatch day__swatch--off" aria-hidden="true"></span><span><strong>Out of hours:</strong> the AI receptionist answers calls you don’t pick up</span></span>
  </figcaption>
</figure>`;
}

/* ---------- Prices ---------- */
export const fromPrice = (s) => (s.quoted ? 'Quoted after a free look' : s.managed ? `From ${money(SOCIAL.diy.monthly)} a month` : `${money(PRICES[s.id].monthly)} a month`);
export const setupText = (s) => (s.quoted ? 'One-off project' : s.managed ? `Managed plans from ${money(SOCIAL.tiers[0].monthly)}` : PRICES[s.id].setup ? `${money(PRICES[s.id].setup)} setup` : 'No setup fee');
export const involvementKey = (s) => (s.quoted ? 'project' : s.managed ? 'either' : PRICES[s.id].involvement);

/* ---------- Lists ---------- */
export const tickList = (items, kind = 'yes', cls = '') =>
  `<ul class="ticks ticks--${kind}${cls ? ' ' + cls : ''}" role="list">${items.map((t) => `<li>${icon(kind === 'yes' ? 'check' : kind === 'person' ? 'user' : 'cross', { cls: 'ticks__icon' })}<span>${esc(t)}</span></li>`).join('')}</ul>`;

export const steps = (list, { cls = '', when = false } = {}) =>
  `<ol class="steps${cls ? ' ' + cls : ''}" role="list">${list.map((s, i) => `<li class="steps__item"><span class="steps__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div class="steps__body"><h3 class="steps__title">${esc(s.title)}</h3><p>${esc(s.text)}</p>${when && s.when ? `<p class="steps__when">${icon('clock', { cls: 'steps__clock' })}${esc(s.when)}</p>` : ''}</div></li>`).join('')}</ol>`;

export const faqList = (faqs, { headingLevel = 3 } = {}) =>
  `<div class="faq">${faqs.map((f) => `<details class="faq__item"><summary class="faq__q"><h${headingLevel} class="faq__q-text">${esc(f.q)}</h${headingLevel}><span class="faq__icon" aria-hidden="true">${icon('plus')}</span></summary><div class="faq__a"><p>${esc(f.a)}</p></div></details>`).join('')}</div>`;

export const fallbackList = (items) =>
  `<dl class="fallbacks">${items.map((f) => `<div class="fallbacks__row"><dt>${esc(f.when)}</dt><dd>${esc(f.what)}</dd></div>`).join('')}</dl>`;

/* ---------- Cards ---------- */
export function serviceCard(s, { headingLevel = 3 } = {}) {
  return `<article class="card card--link svc">
  <div class="svc__top"><span class="iconbox">${icon(s.icon)}</span>${involvement(involvementKey(s))}</div>
  <h${headingLevel} class="svc__title"><a class="stretched" href="${pathOf(s)}">${esc(s.name)}</a></h${headingLevel}>
  <p class="svc__text">${esc(s.oneLiner)}</p>
  <p class="svc__price"><strong>${fromPrice(s)}</strong><span>${setupText(s)}</span></p>
  <span class="svc__more" aria-hidden="true">Learn more ${icon('arrow', { cls: 'icon icon--sm' })}</span>
</article>`;
}

export function webTierCard(t) {
  return `<article class="card tier${t.popular ? ' tier--pick' : ''}">
  ${t.popular ? '<p class="tier__flag">A good place to start</p>' : ''}
  <h3 class="tier__name">${esc(t.label)}</h3>
  <p class="tier__price"><span class="tier__amount">${money(t.build)}</span><span class="tier__per">to build, first month included</span></p>
  <ul class="tier__plans" role="list">
    <li><span>12-month plan</span><strong>${money(t.m12)}<small>/month</small></strong></li>
    <li><span>5-year plan</span><strong>${money(t.m5)}<small>/month</small></strong></li>
    <li><span>Care plan</span><strong>${money(WEB.care.monthly)}<small>/month</small></strong></li>
  </ul>
  <p class="tier__best">${esc(t.bestFor)}</p>
  ${btn(`/contact/?pages=${encodeURIComponent(t.id)}#demo`, 'Start with a demo', { variant: t.popular ? 'primary' : 'outline', size: 'block' })}
</article>`;
}

export function socialTierCard(t) {
  return `<article class="card tier tier--social${t.popular ? ' tier--pick' : ''}">
  ${t.popular ? '<p class="tier__flag">Our suggestion for most</p>' : ''}
  <h3 class="tier__name">${esc(t.name)}</h3>
  <p class="tier__price"><span class="tier__amount">${money(t.monthly)}</span><span class="tier__per">a month · ${t.posts} posts (${esc(t.pace)})</span></p>
  <p class="tier__inv">${icon('clock', { cls: 'icon icon--sm' })}${esc(t.involvement)}</p>
  ${tickList(t.includes, 'yes', 'tier__list')}
  <p class="tier__channels">${t.channels.map((c) => `<span>${esc(c)}</span>`).join('')}</p>
  ${btn(`/contact/?interest=social&tier=${t.id}#quote`, 'Ask about this plan', { variant: t.popular ? 'primary' : 'outline', size: 'block', attrs: `aria-label="Ask about the ${esc(t.name)} plan"` })}
</article>`;
}

export const socialQuote = () =>
  `<div class="care care--quote">
  <div class="care__copy"><p class="eyebrow">Custom</p><h3 class="care__title">${esc(SOCIAL.custom.title)}</h3><p>${esc(SOCIAL.custom.text)}</p></div>
  ${btn(SOCIAL.custom.href, 'Ask for a quote', { variant: 'primary' })}
</div>`;

/* ---------- Bands ---------- */
export function ctaBand({ title = 'Tell us what your business _needs_.', text = 'A website, an AI receptionist, help with your social media, or a connected Business OS. We’ll reply within 24 hours with honest advice and a clear price.', id = 'cta', sectionId = '', primary = CTA, secondary = { href: '/contact/#demo', label: 'Request a website demo' } } = {}) {
  return `<section class="band"${sectionId ? ` id="${sectionId}"` : ''} aria-labelledby="${id}Title">
  <div class="container band__inner">
    <div class="band__copy">
      <h2 class="band__title" id="${id}Title">${rich(title)}</h2>
      <p class="band__text">${esc(text)}</p>
      <div class="pay-note" id="payNote" role="status" tabindex="-1" hidden></div>
    </div>
    <div class="band__actions">
      ${btn(primary.href, primary.label, { variant: 'gold', size: 'lg' })}
      ${secondary ? btn(secondary.href, secondary.label, { variant: 'ghost', size: 'lg', ic: '' }) : ''}
      <p class="band__mail">${icon('mail', { cls: 'icon icon--sm' })}<a href="mailto:${SITE.email}">${SITE.email}</a></p>
    </div>
  </div>
</section>`;
}

/* ---------- Forms (both post to the existing api/submit.php) ---------- */
const field = ({ id, name, label, type = 'text', req = false, auto = '', hint = '', extra = '' }) =>
  `<div class="field">
    <label for="${id}">${label}${req ? ' <span class="req" aria-hidden="true">*</span>' : ' <span class="field__opt">(optional)</span>'}</label>
    <input id="${id}" name="${name}" type="${type}"${auto ? ` autocomplete="${auto}"` : ''}${req ? ' required' : ''} aria-describedby="${hint ? id + '-hint ' : ''}${id}-err"${extra ? ' ' + extra : ''}>
    ${hint ? `<p class="field__hint" id="${id}-hint">${hint}</p>` : ''}
    <p class="field__error" id="${id}-err"></p>
  </div>`;

const choice = (type, name, value, label, extra = '', checked = false) =>
  `<label class="choice"><input type="${type}" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}><span class="choice__box" aria-hidden="true">${icon('check', { cls: 'choice__tick' })}</span><span class="choice__label">${label}</span>${extra}</label>`;

export function quoteForm({ id = 'quote', title = 'Get a free quote', intro = 'Free, with no obligation.', interests = [], submit = 'Send my enquiry' } = {}) {
  const topics = [['websites', 'A new website'], ['business-os', 'KWM Business OS'], ['receptionist', 'AI receptionist'], ['enquiry', 'Website enquiry setup'], ['social', 'Social media'], ['refresh', 'Local Business Refresh'], ['unsure', 'Not sure yet']];
  return `<form class="form" id="${id}Form" data-kind="question" novalidate aria-labelledby="${id}Title">
  <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="km_extra" tabindex="-1" autocomplete="off"></label></div>
  <div class="form__head"><h2 class="form__title" id="${id}Title">${esc(title)}</h2><p class="form__intro">${esc(intro)} Fields marked <span class="req">*</span> are needed.</p></div>
  <div class="form__grid">
    ${field({ id: `${id}-name`, name: 'name', label: 'Your name', req: true, auto: 'name', extra: 'autocapitalize="words"' })}
    ${field({ id: `${id}-biz`, name: 'business', label: 'Business name', req: true, auto: 'organization', extra: 'autocapitalize="words"' })}
    ${field({ id: `${id}-email`, name: 'email', label: 'Email', type: 'email', req: true, auto: 'email', extra: 'inputmode="email" spellcheck="false"' })}
    ${field({ id: `${id}-phone`, name: 'phone', label: 'Phone', type: 'tel', auto: 'tel', hint: 'Only if you’d like us to call you.', extra: 'inputmode="tel"' })}
    <div class="field field--wide">
      <label for="${id}-type">Your type of business <span class="field__opt">(optional)</span></label>
      <input id="${id}-type" name="type" type="text" autocomplete="off" placeholder="For example: plumber, café, salon" aria-describedby="${id}-type-err">
      <p class="field__error" id="${id}-type-err"></p>
    </div>
    <fieldset class="field field--wide">
      <legend>What can we help with? <span class="field__opt">(choose any)</span></legend>
      <div class="choices">${topics.map(([v, l]) => choice('checkbox', 'interest', v, l, '', interests.includes(v))).join('')}</div>
    </fieldset>
    <div class="field field--wide">
      <label for="${id}-msg">Anything else we should know? <span class="field__opt">(optional)</span></label>
      <textarea id="${id}-msg" name="message" rows="4" aria-describedby="${id}-msg-hint"></textarea>
      <p class="field__hint" id="${id}-msg-hint">For example: what you’d like to improve, or what’s getting missed.</p>
    </div>
  </div>
  <div class="form__foot">
    <button type="submit" class="btn btn--primary btn--lg"><span>${esc(submit)}</span>${icon('arrow', { cls: 'btn__icon' })}</button>
    <p class="fineprint">We’ll only use your details to reply to you. See our <a href="/privacy.html">privacy notice</a>.</p>
  </div>
  <p class="form__status" id="${id}-status" role="status" aria-live="polite"></p>
</form>
<div class="form-done" id="${id}Done" tabindex="-1" hidden></div>`;
}

export function demoForm({ id = 'demo' } = {}) {
  const pages = WEB.tiers.map((t) => choice('radio', 'pages', t.id, `${esc(t.label)}`, `<span class="choice__meta">${money(t.build)}</span>`)).join('') + choice('radio', 'pages', 'unsure', 'Not sure yet', '<span class="choice__meta">We’ll help you decide</span>', true);
  const needs = [['A new website', 'A new website'], ['A redesign', 'A redesign of my current site'], ['Online shop', 'An online shop <span class="choice__meta">Quoted</span>'], ['Not sure yet', 'Not sure yet']];
  return `<form class="form" id="${id}Form" data-kind="demo" novalidate aria-labelledby="${id}Title">
  <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="km_extra" tabindex="-1" autocomplete="off"></label></div>
  <div class="form__head"><h2 class="form__title" id="${id}Title">Request your website demo</h2><p class="form__intro">£4.99, ready within 2 working days, with no obligation to go ahead. Fields marked <span class="req">*</span> are needed.</p></div>
  <div class="form__grid">
    ${field({ id: `${id}-name`, name: 'name', label: 'Your name', req: true, auto: 'name', extra: 'autocapitalize="words"' })}
    ${field({ id: `${id}-biz`, name: 'business', label: 'Business name', req: true, auto: 'organization', extra: 'autocapitalize="words"' })}
    ${field({ id: `${id}-email`, name: 'email', label: 'Email', type: 'email', req: true, auto: 'email', hint: 'We’ll send your demo here.', extra: 'inputmode="email" spellcheck="false"' })}
    ${field({ id: `${id}-phone`, name: 'phone', label: 'Phone', type: 'tel', auto: 'tel', extra: 'inputmode="tel"' })}
    <fieldset class="field field--wide">
      <legend>How many pages do you think you need?</legend>
      <div class="choices choices--cards">${pages}</div>
    </fieldset>
    <fieldset class="field field--wide">
      <legend>What do you need? <span class="field__opt">(choose any)</span></legend>
      <div class="choices">${needs.map(([v, l]) => choice('checkbox', 'need', v, l)).join('')}</div>
    </fieldset>
    <fieldset class="field field--wide">
      <legend>Would you like customers to book online?</legend>
      <div class="choices">${choice('radio', 'booking', 'none', 'No thanks', '', true)}${choice('radio', 'booking', 'booking', 'Yes, online booking <span class="choice__meta">Quoted</span>')}${choice('radio', 'booking', 'booking-payments', 'Yes, booking + taking payments <span class="choice__meta">Quoted</span>')}</div>
    </fieldset>
    <div class="quote-panel field--wide" id="${id}-quote" hidden>
      <p class="quote-panel__title">${icon('info', { cls: 'icon icon--sm' })}Quoted separately, before any work starts</p>
      <fieldset class="field" data-show="booking">
        <legend>What do customers book? <span class="field__opt">(optional)</span></legend>
        <div class="choices">${['Appointments', 'Tables', 'Classes or events', 'Rooms or stays', 'Call-outs or visits', 'Something else'].map((v) => choice('checkbox', 'bookWhat', v, v)).join('')}</div>
      </fieldset>
      <fieldset class="field" data-show="payments">
        <legend>How should customers pay?</legend>
        <div class="choices">${['A deposit when they book', 'The full amount when they book', 'Let them choose', 'Not sure yet'].map((v) => choice('radio', 'payWhen', v, v)).join('')}</div>
      </fieldset>
      <fieldset class="field" data-show="shop">
        <legend>Roughly how many products?</legend>
        <div class="choices">${['1–20', '21–100', '100+', 'Not sure'].map((v) => choice('radio', 'products', v, v)).join('')}</div>
      </fieldset>
      <div class="field">
        <label for="${id}-quoteNeeds">Tell us what you need so we can quote <span class="req" aria-hidden="true">*</span></label>
        <textarea id="${id}-quoteNeeds" name="quoteNeeds" rows="3" aria-describedby="${id}-quoteNeeds-hint ${id}-quoteNeeds-err"></textarea>
        <p class="field__hint" id="${id}-quoteNeeds-hint">For example: what people book, how long appointments are, or how many products you sell.</p>
        <p class="field__error" id="${id}-quoteNeeds-err"></p>
      </div>
    </div>
    <div class="field field--wide">
      <label for="${id}-msg">Tell us about your business <span class="field__opt">(optional)</span></label>
      <textarea id="${id}-msg" name="message" rows="4" aria-describedby="${id}-msg-hint"></textarea>
      <p class="field__hint" id="${id}-msg-hint">What you do, the area you cover, and anything you like or dislike about websites you’ve seen.</p>
    </div>
    <div class="field field--wide">
      <span class="field__label" id="${id}-files-label">Send us anything that helps <span class="field__opt">(optional)</span></span>
      <label class="drop" for="${id}-files">
        ${icon('upload', { cls: 'drop__icon' })}
        <span class="drop__text"><strong>Choose files</strong> or drag them here</span>
        <span class="drop__hint">Logo, photos of your work, menus or price lists. Up to 10 files, 25MB in total. Big photos are shrunk first.</span>
        <input class="drop__input" id="${id}-files" name="files" type="file" multiple accept="image/*,.heic,.heif,.pdf,.doc,.docx,.txt,.svg,.ai,.eps,.psd,.zip" aria-describedby="${id}-files-label ${id}-files-err">
      </label>
      <ul class="drop__list" id="${id}-files-list" role="list"></ul>
      <p class="field__error" id="${id}-files-err"></p>
    </div>
  </div>
  <div class="order" role="group" aria-labelledby="${id}-order-title">
    <p class="order__title" id="${id}-order-title">Your request</p>
    <div class="order__row"><span>Website demo, ready within 2 working days</span><strong>£4.99 today</strong></div>
    <div class="order__row"><span>If you go ahead: build price</span><strong id="${id}-build">From ${money(WEB.tiers[0].build)}</strong></div>
    <div class="order__row" id="${id}-quoted-row" hidden><span>Quoted separately</span><strong id="${id}-quoted">Booking</strong></div>
    <p class="order__note">${VAT_NOTE} The demo fee is separate from the build price. No obligation.</p>
  </div>
  <div class="form__foot">
    <button type="submit" class="btn btn--primary btn--lg"><span>Continue to pay £4.99</span>${icon('lock', { cls: 'btn__icon' })}</button>
    <p class="fineprint">You’ll pay securely with Stripe (card, Apple Pay or Google Pay). Your bank statement may show King Media, our former trading name. Our services are for businesses. See our <a href="/privacy.html">privacy notice</a> and <a href="/terms.html">terms</a>.</p>
  </div>
  <p class="form__status" id="${id}-status" role="status" aria-live="polite"></p>
</form>
<div class="form-done" id="${id}Done" tabindex="-1" hidden></div>`;
}

/* ---------- Solutions: the bar under the home hero, and the cards on /solutions/ ---------- */
export const solutionsBar = () => `<section class="solbar" aria-labelledby="solbarTitle">
  <div class="container">
    <div class="solbar__head"><h2 class="solbar__title" id="solbarTitle">Everything we do</h2><a class="link-arrow" href="/solutions/">Compare all services ${icon('arrow', { cls: 'icon icon--sm' })}</a></div>
    <ul class="solbar__list" role="list">
      <li><a class="solbar__item solbar__item--lead" href="/websites/"><span class="iconbox iconbox--sm iconbox--gold">${icon('monitor')}</span><span class="solbar__text"><span class="solbar__name">Websites</span><span class="solbar__tag">Designed, built and looked after</span></span>${icon('arrow', { cls: 'icon icon--sm solbar__arrow' })}</a></li>
      ${SERVICES.map((s) => `<li><a class="solbar__item" href="${pathOf(s)}"><span class="iconbox iconbox--sm">${icon(s.icon)}</span><span class="solbar__text"><span class="solbar__name">${esc(s.name)}</span><span class="solbar__tag">${esc(s.tagline)}</span></span>${icon('arrow', { cls: 'icon icon--sm solbar__arrow' })}</a></li>`).join('')}
      <li><a class="solbar__item solbar__item--os" href="/business-os/"><span class="iconbox iconbox--sm">${icon('layers')}</span><span class="solbar__text"><span class="solbar__name">Business OS <span class="solbar__flag">Premium</span></span><span class="solbar__tag">Your tools and workflows, connected</span></span>${icon('arrow', { cls: 'icon icon--sm solbar__arrow' })}</a></li>
    </ul>
  </div>
</section>`;

export function solutionCard(s) {
  return `<article class="card card--link solcard">
  <div class="solcard__top"><span class="iconbox iconbox--lg">${icon(s.icon)}</span>${involvement(involvementKey(s))}</div>
  <p class="solcard__tag">${esc(s.tagline)}</p>
  <h3 class="solcard__title"><a class="stretched" href="${pathOf(s)}">${esc(s.name)}</a></h3>
  <p class="solcard__text">${esc(s.oneLiner)}</p>
  ${tickList(s.youGet.slice(0, 3), 'yes', 'solcard__list')}
  <div class="solcard__foot"><p class="solcard__price"><strong>${fromPrice(s)}</strong><span>${setupText(s)}</span></p><span class="solcard__more" aria-hidden="true">How it works ${icon('arrow', { cls: 'icon icon--sm' })}</span></div>
</article>`;
}

/* ---------- Social media examples: posts, and a month on the Regular plan ---------- */
export function examplePost(p) {
  const media = p.card
    ? `<div class="xpost__card xpost__card--${p.tone}"><p class="xpost__kicker">${esc(p.card.kicker)}</p><p class="xpost__cardtitle">${esc(p.card.title)}</p><ol class="xpost__lines">${p.card.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ol><p class="xpost__brand">${esc(p.biz)}</p></div>`
    : `<div class="xpost__media${p.images.length > 1 ? ' xpost__media--split' : ''}">${p.images.map((im) => `<figure class="xpost__img"><img src="${im.webp}" alt="${esc(im.alt)}" width="600" height="450" loading="lazy" decoding="async">${im.label ? `<figcaption class="xpost__tag">${esc(im.label)}</figcaption>` : ''}</figure>`).join('')}${p.video ? `<span class="xpost__play" aria-hidden="true">${icon('play')}</span><span class="xpost__dur" aria-hidden="true">0:20</span>` : ''}</div>`;
  return `<li class="xpost">
  <article class="xpost__inner" aria-label="${esc(`Example ${p.type.toLowerCase()} post for ${p.biz}, a made-up business`)}">
    <header class="xpost__head"><span class="xpost__avatar xpost__avatar--${p.tone}" aria-hidden="true">${esc(p.initials)}</span><span class="xpost__who"><span class="xpost__name">${esc(p.biz)}</span><span class="xpost__meta">${esc(p.channel)} · ${esc(p.when)}</span></span></header>
    ${media}
    <p class="xpost__text">${esc(p.text)}</p>
    <footer class="xpost__foot"><span class="xpost__type">${esc(p.type)}</span><span class="badge badge--neutral">Example</span></footer>
  </article>
</li>`;
}

export const socialExamples = ({ count = EXAMPLE_POSTS.length } = {}) => `<ul class="xposts" role="list">${EXAMPLE_POSTS.slice(0, count).map(examplePost).join('')}</ul>
<p class="fineprint">Examples for made-up businesses from <a href="/work/">our concept websites</a>, written to show the kinds of posts we make. Photos are used under their licences: <a href="/work/#creditsTitle">see the credits</a>.</p>`;

export function socialMonth() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const counts = {};
  EXAMPLE_MONTH.flat().forEach((t) => { counts[t] = (counts[t] || 0) + 1; });
  return `<figure class="month">
  <div class="month__wrap"><table class="month__table">
    <caption class="visually-hidden">An example month on the Regular plan: 20 posts, Monday to Friday, with comments and messages checked on Mondays and Thursdays</caption>
    <thead><tr><th scope="col"><span class="visually-hidden">Week</span></th>${days.map((d, i) => `<th scope="col">${d}${i === 0 || i === 3 ? `<span class="month__check">${icon('message', { cls: 'icon icon--sm' })}<span>Comments checked</span></span>` : ''}</th>`).join('')}</tr></thead>
    <tbody>${EXAMPLE_MONTH.map((w, wi) => `<tr><th scope="row">Week ${wi + 1}</th>${w.map((t) => `<td><span class="month__post month__post--${t}">${esc(POST_TYPES[t].short)}</span></td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <figcaption class="month__key">${Object.entries(POST_TYPES).map(([k, v]) => `<span class="month__keyitem"><span class="month__swatch month__post--${k}" aria-hidden="true"></span>${esc(v.label)} <strong>× ${counts[k] || 0}</strong></span>`).join('')}</figcaption>
</figure>`;
}

/* ---------- Social media: the £29.99 do-it-yourself plan ---------- */
export function diyCard({ headingLevel = 3 } = {}) {
  const d = SOCIAL.diy;
  return `<article class="card diy">
  <div class="diy__copy">
    <p class="eyebrow">Do it yourself</p>
    <h${headingLevel} class="diy__name">${esc(d.name)}</h${headingLevel}>
    <p class="diy__text">AI drafts of posts from your own job photos and notes. You check them, edit them and post them yourself. Nothing is posted for you.</p>
    ${tickList(d.includes, 'yes', 'diy__list')}
  </div>
  <div class="diy__price">
    <p class="tier__price"><span class="tier__amount">${money(d.monthly)}</span><span class="tier__per">a month · ${esc(d.limit.toLowerCase())} · no setup fee</span></p>
    ${btn('/contact/?interest=social&tier=social-content-machine#quote', 'Ask about the Social Content Machine', { variant: 'outline', size: 'block' })}
  </div>
</article>`;
}

/* ---------- KWM Business OS: an example system map (custom HTML, readable at every size) ---------- */
export function osMap({ id = 'osmap', compact = false } = {}) {
  const node = (ic, text) => `<li class="osnode">${icon(ic, { cls: 'icon icon--sm' })}<span>${esc(text)}</span></li>`;
  return `<figure class="osmap${compact ? ' osmap--compact' : ''}" aria-labelledby="${id}Cap">
  <p class="osmap__label">Capture</p>
  <ul class="osmap__row" role="list">${node('globe', 'Website enquiries')}${node('phone', 'Phone calls')}${node('layers', 'Tools you already use')}</ul>
  <div class="osmap__core">
    <p class="osmap__brand">${markSvg()}KWM Business OS</p>
    <ul class="osmap__mods" role="list"><li>Route and organise</li><li>Prepare drafts</li><li>Keep admin moving</li><li>Report</li></ul>
  </div>
  <p class="osmap__gate">${icon('user', { cls: 'icon icon--sm' })}<span>You approve the important decisions</span></p>
  <ul class="osmap__row osmap__row--out" role="list">${node('calendar', 'Schedules and handovers')}${node('receipt', 'Quotes and documents, once approved')}${node('chart', 'A clear owner view')}</ul>
  <figcaption class="osmap__cap" id="${id}Cap">An example system map. Every Business OS is scoped around the business after an initial review, and not every part is in every build.</figcaption>
</figure>`;
}
const markSvg = () => '<svg class="osmap__mark" viewBox="0 0 48 48" width="22" height="22" aria-hidden="true" focusable="false"><rect width="48" height="48" rx="12" fill="#13264F"/><rect x="11.5" y="11" width="7" height="26" rx="1" fill="#fff"/><path d="M28.5 11h8l-8 12h-8z" fill="#fff"/><path d="M20.5 25h8l8 12h-8z" fill="#D1A84E"/></svg>';

/* ---------- KWM Business OS: the premium offer, as a band on other pages ---------- */
export function osTeaser({ id = 'osTeaser' } = {}) {
  return `<section class="section section--dark section--os" aria-labelledby="${id}Title">
  <div class="container ostease">
    <div class="ostease__copy">
      <p class="eyebrow eyebrow--gold">Premium · KWM Business OS</p>
      <h2 class="shead__title" id="${id}Title">One connected system, <em class="serif">built around how you work.</em></h2>
      <p class="shead__lede">For businesses ready for more than a website: we connect selected software, AI tools and workflows so enquiries are captured, routine admin keeps moving and you get a clear view of the work. Important decisions stay with you.</p>
      <p class="ostease__price"><span><small>Setup from</small><strong>${money(OS.setupFrom)}</strong></span><span><small>Then from</small><strong>${money(OS.monthlyFrom)}</strong><small>a month</small></span></p>
      <div class="split__actions">${btn('/business-os/', 'Explore Business OS', { variant: 'gold' })}${btn('/contact/?interest=business-os#quote', 'Discuss your Business OS', { variant: 'ghost', ic: '' })}</div>
    </div>
    <div class="ostease__visual">${osMap({ id: id + 'Map', compact: true })}</div>
  </div>
</section>`;
}
