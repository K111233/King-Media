// KWM Systems · /business-os/ · KWM Business OS, the premium offer.
// A tailored system of selected tools and workflows. Prices are "from" amounts only: exact scope,
// fees and any third-party costs are set in a written proposal. Possible modules are never presented
// as included in every build, and nothing here promises a saving or replaces a number of people.
import { SITE } from '../content/site.mjs';
import { OS, money, VAT_NOTE } from '../content/pricing.mjs';
import { btn, badge, sectionHead, tickList, steps, faqList, ctaBand, osMap, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';
import { pageHero } from './web.mjs';

const DISCUSS = '/contact/?interest=business-os#quote';

const MODULES = [
  { ic: 'globe', title: 'Capture enquiries', text: 'Bring in enquiries from your website and phone in a consistent, organised way, so new work doesn’t start life on a scrap of paper.' },
  { ic: 'layers', title: 'Route and organise', text: 'Send each new opportunity to the right place and the right person, with its details in order, so you can see what’s new and what needs attention.' },
  { ic: 'calendar', title: 'Booking, scheduling and handover', text: 'Support the steps between “yes” and the job: booking, scheduling and handing work over with the information people need.' },
  { ic: 'receipt', title: 'Drafts for approval', text: 'Prepare draft quotes, job information and routine documents for a person to check and approve before anything is sent.' },
  { ic: 'package', title: 'Routine admin, kept moving', text: 'Move routine job and admin steps between the tools you already use, with less copying the same details from one place to another.' },
  { ic: 'chart', title: 'A clear owner view', text: 'See workload, pipeline and recurring tasks in one place, so you know what’s coming up and what’s stuck.' },
  { ic: 'camera', title: 'Marketing content', text: 'Help produce or organise approved marketing content, such as posts drafted from your own job photos.' },
  { ic: 'sparkle', title: 'Connections between tools', text: 'Connect selected tools where a suitable integration genuinely exists. If a connection isn’t available or reliable enough, we’ll tell you.' },
];

const CONTROL = [
  { ic: 'check-circle', title: 'You approve what goes out', text: 'Draft quotes, documents and messages wait for a person to check and approve them.' },
  { ic: 'bell', title: 'Exceptions come to a person', text: 'Anything unusual, unclear or outside the agreed rules is flagged to you or your team, not guessed at.' },
  { ic: 'user', title: 'You choose what runs on its own', text: 'We agree with you which steps are automated and which need a person, and that can change as you go.' },
  { ic: 'arrow', title: 'Clean handovers', text: 'When work moves between people or tools, the agreed details move with it, so nobody starts from scratch.' },
];

const PROCESS = [
  { title: 'Map how you work', text: 'We look at how enquiries, jobs and admin move through your business today, and where the routine work piles up.' },
  { title: 'Choose what to automate', text: 'Together we pick the processes worth automating and agree what stays with people. You get a written proposal and price.' },
  { title: 'Build and test', text: 'We build the agreed system and test it with you before anything goes live.' },
  { title: 'Launch, train and maintain', text: 'We launch it, train your team and keep it running for the monthly fee.' },
];

const FAQS = [
  { q: 'Is Business OS software I install?', a: 'No. It’s a set of tools and workflows we choose, configure and connect for your business. Some may be software you already use; others we set up for you.' },
  { q: 'Will it automate everything?', a: 'No. We automate routine steps that suit automation, and leave decisions, judgement and customer relationships with people. Anything unusual is passed to you or your team.' },
  { q: 'Do I have to replace the tools I already use?', a: 'Not necessarily. Where your current tools work well and can be connected reliably, we build around them. Where they can’t, we’ll explain the options and let you decide.' },
  { q: `What does the ${money(OS.setupFrom)} setup cover?`, a: 'The work to design and build your system: the initial review, scoping, workflow design, configuration and build, testing, launch and training. It’s a starting price. Bigger or more complex systems cost more, and your proposal sets out exactly what’s included.' },
  { q: `What does the monthly fee cover?`, a: `Keeping your system running: support, hosting of the parts we run, monitoring and maintenance, as set out in your proposal. It starts from ${money(OS.monthlyFrom)} a month. Usage-based costs, such as calls, messages or AI use, are confirmed in your proposal.` },
  { q: 'Are third-party software costs included?', a: 'Not automatically. Some tools have their own subscriptions or usage charges. Your proposal lists them, and who pays for what, before you commit to anything.' },
  { q: 'Who makes the decisions?', a: 'You and your team. The system prepares, organises and moves routine work along. Approvals, important decisions and anything out of the ordinary stay with people.' },
  { q: 'How long does it take?', a: 'It depends on what we build. After the initial review, we agree a timeline with you in the proposal.' },
  { q: 'What happens to my data?', a: 'We only connect what’s needed, and our agreement sets out how your data and your customers’ data are handled. Where we run parts of the system for you, we act as your data processor.' },
  { q: 'Is it right for my business?', a: 'It suits businesses with a steady flow of enquiries, jobs and admin spread across several tools. If a website or one of our simpler services would do the job, we’ll tell you.' },
];

const priceTag = `<span class="osprice"><span class="osprice__item"><small>Setup from</small><strong>${money(OS.setupFrom)}</strong></span><span class="osprice__item"><small>Then from</small><strong>${money(OS.monthlyFrom)}</strong><small>a month</small></span></span>`;

const calcField = (id, label, hint, attrs = '') => `<div class="field">
  <label for="${id}">${label}</label>
  <input id="${id}" type="number" inputmode="decimal" min="0" ${attrs} aria-describedby="${id}-hint">
  <p class="field__hint" id="${id}-hint">${hint}</p>
</div>`;

export default [{
  path: '/business-os/',
  title: 'KWM Business OS: your tools and workflows, connected',
  ogTitle: 'KWM Business OS: your tools and workflows, connected',
  ogImage: '/assets/kwm/share/og-business-os.png',
  ogAlt: `KWM Business OS by KWM Systems. A connected system built around how your business works. Setup from ${money(OS.setupFrom)}, then from ${money(OS.monthlyFrom)} a month.`,
  description: `KWM Business OS connects selected software, AI tools and workflows around how your business works. Setup from ${money(OS.setupFrom)}, then from ${money(OS.monthlyFrom)} a month.`,
  bodyClass: 'is-os',
  jsonld: {
    '@context': 'https://schema.org', '@type': 'Service', name: 'KWM Business OS', serviceType: 'Business systems and workflow automation',
    description: 'A tailored, connected system of selected software, AI tools and workflows, scoped around a business after an initial review.',
    provider: { '@type': 'Organization', name: SITE.name, legalName: SITE.legalName, url: SITE.origin + '/' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' }, url: SITE.origin + '/business-os/',
    offers: [
      { '@type': 'Offer', name: 'Setup', priceCurrency: 'GBP', priceSpecification: { '@type': 'PriceSpecification', minPrice: OS.setupFrom.toFixed(2), priceCurrency: 'GBP' } },
      { '@type': 'Offer', name: 'Monthly', priceCurrency: 'GBP', priceSpecification: { '@type': 'UnitPriceSpecification', minPrice: OS.monthlyFrom.toFixed(2), priceCurrency: 'GBP', unitText: 'MONTH' } },
    ],
  },
  body: pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { label: 'Business OS' }],
    chips: badge('Premium', 'gold') + badge('Tailored to your business', 'dark'),
    eyebrow: 'KWM Business OS',
    title: 'Your business, connected. <em class="serif">Built around how you work.</em>',
    lede: 'A tailored operating system for your business: selected software, AI tools and workflows, connected around the way you already work. It can capture enquiries, keep routine admin moving and give you a clear view of the work, while the important decisions stay with you.',
    price: priceTag,
    actions: `${btn(DISCUSS, 'Discuss your Business OS', { variant: 'gold', size: 'lg' })}${btn('#capabilities', 'See what it can do', { variant: 'ghost', size: 'lg', ic: 'chev-down' })}`,
    aside: osMap({ id: 'heroMap' }),
    cls: 'phero--os',
  }) + `
<section class="section" aria-labelledby="isTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'What it is', title: 'Not a box of software. _A system for your business._', lede: 'Business OS isn’t a desktop operating system, and it isn’t a promise to automate everything. It’s a set of carefully chosen tools and workflows, connected around how your business runs, so routine work keeps moving and the important work comes to you.', id: 'isTitle' })}
    <div class="duo">
      <div class="card duo__col"><h3 class="duo__title">${icon('check-circle', { cls: 'icon duo__icon duo__icon--yes' })}It is</h3>${tickList(['Tailored to how your business already works', 'Built from selected software, AI tools and workflows', 'Scoped with you after an initial review', 'Designed so important decisions stay with you or your team'], 'yes')}</div>
      <div class="card duo__col"><h3 class="duo__title">${icon('cross', { cls: 'icon duo__icon duo__icon--no' })}It isn’t</h3>${tickList(['A boxed operating system or an off-the-shelf app', 'A promise to automate every task', 'A replacement for the skilled people in your business', 'An “everything included” package at the starting price'], 'no')}</div>
    </div>
  </div>
</section>

<section class="section section--muted" id="capabilities" aria-labelledby="capTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'What it can do', title: 'Possible modules, _chosen for your business_.', lede: 'These are the areas a Business OS can cover. Your system is scoped after an initial review, so it includes the parts that suit your business, not everything listed here.', id: 'capTitle' })}
    <ul class="mods" role="list">${MODULES.map((m) => `<li class="mod"><span class="iconbox">${icon(m.ic)}</span><p class="mod__flag">Possible module</p><h3 class="mod__title">${esc(m.title)}</h3><p>${esc(m.text)}</p></li>`).join('')}</ul>
    <p class="fineprint">Possible modules, not a fixed list. What’s included in your build, and which tools it connects, is set out in your proposal.</p>
  </div>
</section>

<section class="section" aria-labelledby="controlTitle">
  <div class="container split split--control">
    <div class="split__copy">
      ${sectionHead({ eyebrow: 'You stay in control', title: 'Important decisions _stay with you_.', lede: 'A Business OS does the routine work in the background and brings the rest to you. Nothing important goes out without a person’s say-so.', id: 'controlTitle' })}
    </div>
    <ul class="principles principles--2" role="list">${CONTROL.map((c) => `<li class="principle"><span class="iconbox">${icon(c.ic)}</span><h3 class="principle__title">${esc(c.title)}</h3><p>${esc(c.text)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="section section--muted" aria-labelledby="valueTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'The value', title: 'Less routine admin. _More room for the real work._', lede: 'A Business OS can take on some of the repetitive work that eats into your week. That may help you handle more work, or put off hiring for routine tasks. It doesn’t replace the skilled, accountable people your business depends on.', id: 'valueTitle' })}
    <div class="duo">
      <div class="card duo__col"><h3 class="duo__title">${icon('check-circle', { cls: 'icon duo__icon duo__icon--yes' })}Work it can support</h3>${tickList(['Routine reception: capturing who got in touch and why', 'Basic lead administration', 'Scheduling and coordination', 'Re-entering the same details in different tools', 'Preparing documents for a person to approve', 'Simple reporting on workload and pipeline'], 'yes')}</div>
      <div class="card duo__col"><h3 class="duo__title">${icon('user', { cls: 'icon duo__icon duo__icon--new' })}Still needs your people</h3>${tickList(['The skilled work itself', 'Pricing and quoting decisions', 'Customer relationships and difficult conversations', 'Anything that needs judgement or accountability', 'Signing off what goes to a customer'], 'person')}</div>
    </div>
    <p class="fineprint">We don’t promise a particular saving, and Business OS doesn’t replace a set number of people. Try the calculator below with your own figures.</p>
  </div>
</section>

<section class="section" id="calculator" aria-labelledby="calcTitle">
  <div class="container calc">
    <div class="calc__intro">
      ${sectionHead({ eyebrow: 'Your numbers', title: 'Could it pay its way? _Try your own figures._', lede: 'This calculator is illustrative and uses only the figures you enter. It isn’t a quote, an estimate of savings or a promise of results.', id: 'calcTitle' })}
      <p class="calc__note">${icon('info', { cls: 'icon icon--sm' })}<span>The setup and monthly figures start at our “from” prices. Change any figure to match your own situation.</span></p>
    </div>
    <form class="calc__form card" id="osCalc" novalidate aria-labelledby="calcTitle">
      <fieldset class="calc__group">
        <legend>Your routine work</legend>
        ${calcField('calcHours', 'Hours a week spent on routine admin', 'Your own estimate, across everyone in the business.', 'step="0.5"')}
        ${calcField('calcRate', 'What an hour of that time costs you (£)', 'Your own figure, for example wages plus costs.', 'step="0.01"')}
        ${calcField('calcShare', 'Share you think a system could support (%)', 'Your own estimate, from 0 to 100.', 'max="100" step="1"')}
      </fieldset>
      <fieldset class="calc__group">
        <legend>Business OS (starting prices)</legend>
        ${calcField('calcSetup', 'Setup (£)', `From ${money(OS.setupFrom)}. Yours is set in your proposal.`, `value="${OS.setupFrom}" step="1"`)}
        ${calcField('calcMonthly', 'Monthly fee (£)', `From ${money(OS.monthlyFrom)}. Yours is set in your proposal.`, `value="${OS.monthlyFrom}" step="1"`)}
      </fieldset>
      <div class="calc__out">
        <p class="calc__empty" id="calcEmpty">Enter your hours, hourly cost and share to see the sums. Every figure is shown with how it’s worked out.</p>
        <dl class="calc__rows" id="calcRows" hidden>
          <div><dt>Routine admin time a month</dt><dd><strong id="calcOutHours">—</strong><small id="calcOutHoursHow"></small></dd></div>
          <div><dt>What that time costs a month</dt><dd><strong id="calcOutCost">—</strong><small id="calcOutCostHow"></small></dd></div>
          <div><dt>The part you think a system could support</dt><dd><strong id="calcOutSupported">—</strong><small id="calcOutSupportedHow"></small></dd></div>
          <div><dt>Business OS monthly fee</dt><dd><strong id="calcOutOs">—</strong><small id="calcOutOsHow"></small></dd></div>
          <div><dt>Difference a month</dt><dd><strong id="calcOutDiff">—</strong><small id="calcOutDiffHow"></small></dd></div>
          <div class="calc__total"><dt>Months for the difference to cover the setup</dt><dd><strong id="calcOutMonths">—</strong><small id="calcOutMonthsHow"></small></dd></div>
        </dl>
        <p class="calc__verdict" id="calcVerdict" role="status" aria-live="polite"></p>
      </div>
      <p class="fineprint">Illustrative only, based entirely on the figures you enter. Your actual scope, price and any third-party costs are set out in a written proposal. ${VAT_NOTE}</p>
    </form>
  </div>
</section>

<section class="section section--muted" id="pricing" aria-labelledby="osPriceTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Pricing', title: 'Two parts: _setup, then monthly._', lede: 'Prices start from the figures below. Your exact scope, monthly fee and any third-party software or usage costs are confirmed in a written proposal before anything starts.', id: 'osPriceTitle' })}
    <div class="osprices">
      <article class="card osplan">
        <p class="eyebrow">One-off</p>
        <h3 class="osplan__name">Setup</h3>
        <p class="osplan__amount"><small>From</small><strong>${money(OS.setupFrom)}</strong></p>
        <p class="osplan__text">The work to design and build your system.</p>
        ${tickList(['An initial review of how your business works', 'Scoping the processes worth automating', 'Workflow design', 'Configuration and build', 'Testing with you', 'Launch, and training for your team'], 'yes')}
      </article>
      <article class="card osplan osplan--dark card--dark">
        <p class="eyebrow eyebrow--gold">Monthly</p>
        <h3 class="osplan__name">Running your system</h3>
        <p class="osplan__amount"><small>From</small><strong>${money(OS.monthlyFrom)}</strong><small>a month</small></p>
        <p class="osplan__text">Keeps your Business OS running, as set out in your proposal.</p>
        ${tickList(['Support', 'Hosting of the parts we run', 'Monitoring', 'Maintenance'], 'yes')}
        <p class="osplan__note">Usage-based costs, such as calls, messages or AI use, and any third-party subscriptions are confirmed in your proposal.</p>
      </article>
      <div class="osplan osplan--factors">
        <h3 class="osplan__h">What changes the price</h3>
        <ul class="rules__list" role="list">
          <li>How many workflows and modules you need</li>
          <li>Which tools we connect, and how</li>
          <li>How much the system is used, such as calls, messages and AI</li>
          <li>Any existing information to move across</li>
          <li>How much training your team needs</li>
        </ul>
        <p class="osplan__note">The starting prices aren’t an “everything included” promise. ${VAT_NOTE}</p>
        ${btn(DISCUSS, 'Discuss your Business OS', { variant: 'primary', size: 'block' })}
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="osHowTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'How it works', title: 'From first conversation _to a running system_.', id: 'osHowTitle', align: 'center' })}
    ${steps(PROCESS, { cls: 'steps--row' })}
    <p class="section__after section__after--center">${btn(DISCUSS, 'Discuss your Business OS', { variant: 'gold', size: 'lg' })}</p>
  </div>
</section>

<section class="section section--muted" id="faq" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Business OS, _answered_.', ledeHtml: `Something else? <a href="${DISCUSS}">Ask us</a>. We reply ${SITE.replyTime}.`, id: 'faqTitle' })}
    ${faqList(FAQS)}
  </div>
</section>
${ctaBand({ title: 'Let’s map _your business_.', text: 'Tell us how your business runs today. We’ll reply within 24 hours to arrange a first conversation, then scope a Business OS around the way you work.', primary: { href: DISCUSS, label: 'Discuss your Business OS' }, secondary: null })}`,
}];
