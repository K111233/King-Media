// KWM Systems · /pricing/ · every price on one page, all from content/pricing.mjs
import { SITE } from '../content/site.mjs';
import { SERVICES, byId, pathOf } from '../content/services.mjs';
import { PRICES, WEB, SOCIAL, OS, POLICY, money, VAT_NOTE } from '../content/pricing.mjs';
import { MONTHLY_INCLUDES } from '../content/websites.mjs';
import { btn, involvement, sectionHead, webTierCard, socialTierCard, socialQuote, diyCard, tickList, faqList, ctaBand, esc } from '../templates/components.mjs';
import { icon } from '../templates/icons.mjs';
import { pageHero } from './web.mjs';

const monthly = SERVICES.filter((s) => !s.managed && !s.quoted);

const jump = [['websites', 'Websites', 'monitor'], ['services', 'Services', 'layers'], ['social', 'Social media', 'camera'], ['business-os', 'Business OS', 'package'], ['rules', 'The rules', 'receipt']];

const PRICE_FAQS = [
  { q: 'Do your prices include VAT?', a: `Yes. ${VAT_NOTE} The price you see is the price you pay.` },
  { q: 'Why do some services cost more than others?', a: 'Because some take more of our time. The AI receptionist and enquiry setup run on software after we set them up, so the monthly price mostly covers the phone, text and software costs. Managed social media needs a person on your pages every week, so it’s priced by how much we do. A Business OS is built around your business, so it starts from a published price and is confirmed in a written proposal.' },
  { q: 'What happens if I use more than my allowance?', a: `We tell you when you’ve used ${POLICY.warnAt}% of it. If you’re going to run out, you choose: buy a top-up for the rest of the month, or wait until it resets. We never charge for extra use without your OK.` },
  { q: 'Are there any other costs?', a: 'Not from us. A few things are paid to other companies directly, and we’ll tell you about them before you agree: for example, your phone network may charge for forwarded calls, and booking or payment platforms take their own fees. For a Business OS, any third-party software or usage costs are listed in your proposal.' },
  { q: 'How do I pay?', a: 'Websites: you pay the build price by card through Stripe when you sign your agreement, and Stripe takes your monthly payments. Our monthly services: the setup fee is paid before we start, then monthly by card, in advance. For a Business OS, payment is set out in your proposal.' },
  { q: 'Can I change or cancel?', a: `${POLICY.term}: cancel with ${POLICY.notice}’ notice, or change plan from your next month. Website plans have a minimum term (12 months, or 5 years on the 5-year plan), set out in the agreement you sign. A Business OS is set out in its proposal.` },
];

export default [{
  path: '/pricing/',
  title: 'Prices: websites, services, social media and Business OS',
  description: `Every ${SITE.name} price in one place. Websites from ${money(WEB.tiers[0].build)} to build, the AI receptionist ${money(PRICES.receptionist.monthly)} a month, social media from ${money(SOCIAL.diy.monthly)}, and KWM Business OS from ${money(OS.setupFrom)} setup. ${VAT_NOTE}`,
  bodyClass: 'is-pricing',
  body: pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { label: 'Pricing' }],
    eyebrow: 'Pricing',
    title: 'Every price, <em class="serif">published.</em>',
    lede: `No “call us for a price”. Websites have a one-off build price and a monthly plan. Automated services have a setup fee and a small monthly price. Social media is priced by how much we do. Anything tailored is quoted in writing before it starts. ${VAT_NOTE}`,
    cls: 'phero--compact',
  }) + `
<nav class="jump" aria-label="Price lists">
  <div class="container"><ul class="jump__list" role="list">${jump.map(([id, label, ic]) => `<li><a href="#${id}">${icon(ic, { cls: 'icon icon--sm' })}${label}</a></li>`).join('')}</ul></div>
</nav>

<section class="section" id="websites" aria-labelledby="webTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Websites', title: 'Website design, build _and care_.', lede: `Start with a ${money(WEB.demo.price)} demo, ready ${WEB.demo.ready}. Go ahead and you pay the build price, which includes your first month. Then one monthly fee keeps your site hosted, secure and up to date.`, id: 'webTitle' })}
    <div class="tiers">${WEB.tiers.map(webTierCard).join('')}</div>
    <div class="care">
      <div class="care__copy"><p class="eyebrow">Care plan</p><h3 class="care__title">Just the essentials. <span>${money(WEB.care.monthly)} a month.</span></h3><p>${esc(WEB.care.detail)}</p></div>
      ${btn('/websites/#pricing', 'What every plan includes', { variant: 'outline' })}
    </div>
    <p class="fineprint">Every monthly plan includes ${MONTHLY_INCLUDES.slice(0, 3).map((t) => t.charAt(0).toLowerCase() + t.slice(1)).join('; ')}. Online booking, payments and shops are quoted, free, within 24 hours.</p>
  </div>
</section>

<section class="section section--muted" id="services" aria-labelledby="svcTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Services', title: 'Automated, so they _cost less_.', lede: 'The AI receptionist and enquiry setup run on their own after we set them up and test them with you. The setup fee covers that hands-on work; the monthly price covers the calls, texts and software, plus our monitoring.', id: 'svcTitle' })}
    <div class="table-wrap"><table class="ptable ptable--tools">
      <caption class="visually-hidden">Service prices</caption>
      <thead><tr><th scope="col">Service</th><th scope="col">Monthly</th><th scope="col">Setup (one-off)</th><th scope="col">Included each month</th><th scope="col">If you need more</th><th scope="col">How it runs</th></tr></thead>
      <tbody>
        ${monthly.map((s) => { const p = PRICES[s.id]; return `<tr>
          <th scope="row"><a href="${pathOf(s)}">${esc(s.name)}</a></th>
          <td data-label="Monthly"><strong>${money(p.monthly)}</strong></td>
          <td data-label="Setup">${money(p.setup)}</td>
          <td data-label="Included">${esc(p.allowance.short)}</td>
          <td data-label="More">${p.topUp ? `${money(p.topUp.price)} for ${p.topUp.amount} more ${esc(p.topUp.unit)}` : 'No minute limit (fair use)'}</td>
          <td data-label="How it runs">${involvement(p.involvement)}</td>
        </tr>`; }).join('')}
      </tbody>
    </table></div>
    <p class="fineprint">The AI receptionist has no minute limit: if you regularly get more than about 100 out-of-hours calls a month, we’ll talk to you first. Top-ups are only ever bought if you say yes. Unused allowances don’t carry over. Call forwarding uses your own phone plan: check what your network charges for forwarded calls.</p>
    <div class="care care--quote">
      <div class="care__copy"><p class="eyebrow">One-off project</p><h3 class="care__title">${esc(byId.refresh.name)}. <span>Quoted after a free look.</span></h3><p>${esc(byId.refresh.oneLiner)}</p></div>
      ${btn(pathOf(byId.refresh), 'About the refresh', { variant: 'outline' })}
    </div>
  </div>
</section>

<section class="section" id="social" aria-labelledby="socialTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'Social media', title: 'Do it yourself, or _have it done for you_.', lede: `Post your own with AI drafts from the ${SOCIAL.diy.name}, or pick a managed plan. Managed plans are run by a person, so they’re priced by activity: more posts, more channels and more frequent checks take more of our time. ${money(SOCIAL.setup)} setup on every managed plan.`, id: 'socialTitle' })}
    ${diyCard()}
    <div class="plans-head"><h3 class="plans-head__title">Managed for you</h3><p>A person checks every post, schedules it and keeps an eye on your pages.</p></div>
    <div class="tiers">${SOCIAL.tiers.map(socialTierCard).join('')}</div>
    ${socialQuote()}
    <div class="extras-row">${SOCIAL.extras.map((e) => `<p>${icon('plus', { cls: 'icon icon--sm' })}<span>${esc(e.label)}</span><strong>${e.price ? money(e.price) : esc(e.note)}</strong></p>`).join('')}</div>
    <p class="fineprint">${esc(SOCIAL.capacity)} <a href="${pathOf(byId.social)}">How our social media service works</a>.</p>
  </div>
</section>

<section class="section section--muted" id="business-os" aria-labelledby="osPriceTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'KWM Business OS', title: 'A tailored system, _from a clear starting price_.', lede: 'Selected software, AI tools and workflows, connected around how your business works. The setup fee covers designing and building your system; the monthly fee keeps it running. Your exact scope, monthly fee and any third-party costs are confirmed in a written proposal.', id: 'osPriceTitle' })}
    <div class="ospanel card card--dark">
      <p class="osprice osprice--lg"><span class="osprice__item"><small>Setup from</small><strong>${money(OS.setupFrom)}</strong></span><span class="osprice__item"><small>Then from</small><strong>${money(OS.monthlyFrom)}</strong><small>a month</small></span></p>
      ${tickList(['Scoped after an initial review of how your business works', 'Built from modules chosen for your business, not a fixed package', 'Important decisions stay with you or your team'], 'yes', 'ospanel__list')}
      <div class="ospanel__actions">${btn('/business-os/', 'Explore Business OS', { variant: 'gold' })}${btn('/contact/?interest=business-os#quote', 'Discuss your Business OS', { variant: 'outline', ic: '' })}</div>
    </div>
    <p class="fineprint">“From” prices are starting points, not an “everything included” promise. Bigger or more complex systems cost more.</p>
  </div>
</section>

<section class="section" id="rules" aria-labelledby="rulesTitle">
  <div class="container">
    ${sectionHead({ eyebrow: 'The rules', title: 'How payment, changes and _cancelling_ work.', lede: 'The same plain rules for everyone. Your written order, or for websites your signed agreement, sets out the detail. A Business OS is set out in its own proposal.', id: 'rulesTitle' })}
    <div class="rules">
      <div class="card rules__col">
        <h3 class="rules__title">${icon('monitor', { cls: 'icon' })}Websites</h3>
        <ul class="rules__list" role="list">
          <li><strong>Demo:</strong> ${money(WEB.demo.price)}, paid online, separate from your build price. ${esc(WEB.demo.free)}.</li>
          <li><strong>Build:</strong> paid by card when you sign your agreement. It includes your first month, and your site goes live the next day.</li>
          <li><strong>Plans:</strong> 12-month minimum on the 12-month and Care plans; 5 years on the 5-year plan, in return for a lower price. Then month by month.</li>
          <li><strong>Changes:</strong> up to 5 a month (1 on the Care plan). Unused changes don’t carry over.</li>
        </ul>
      </div>
      <div class="card rules__col">
        <h3 class="rules__title">${icon('layers', { cls: 'icon' })}AI receptionist, enquiry setup and social media</h3>
        <ul class="rules__list" role="list">
          <li><strong>Term:</strong> ${esc(POLICY.term)}. Cancel with ${POLICY.notice}’ notice.</li>
          <li><strong>Payment:</strong> ${esc(POLICY.payment)}</li>
          <li><strong>Allowances:</strong> we tell you at ${POLICY.warnAt}%, and never charge for extra use without your OK.</li>
          <li><strong>Setup refund:</strong> ${esc(POLICY.setupRefund)}</li>
          <li><strong>Price changes:</strong> ${esc(POLICY.priceChange)}</li>
          <li><strong>Support:</strong> ${esc(POLICY.support)} ${esc(POLICY.changes)}</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--muted" id="faq" aria-labelledby="faqTitle">
  <div class="container faq-wrap">
    ${sectionHead({ eyebrow: 'Questions', title: 'Price _questions_.', ledeHtml: `Something not covered? <a href="/contact/">Ask us</a>. We reply ${SITE.replyTime}.`, id: 'faqTitle' })}
    ${faqList(PRICE_FAQS)}
  </div>
</section>
${ctaBand({ title: 'Not sure what you need? _Ask us._', text: 'Tell us about your business and we’ll recommend only what would genuinely help, with the price in writing. Free, with no obligation.' })}`,
}];
