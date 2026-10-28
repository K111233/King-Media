// KWM Systems · privacy.html and terms.html (same addresses as before, so existing links keep working).
// Built from King Media's published website terms and privacy notice (27-28 September 2026), with the
// our other services added. DRAFTS FOR LEGAL REVIEW: see
// launch-pack/09-compliance-notes.md. Plain English, no "fully compliant" claims.
import { SITE } from '../content/site.mjs';
import { WEB, POLICY, VAT_NOTE, money } from '../content/pricing.mjs';
import { esc } from '../templates/components.mjs';
import { pageHero } from './web.mjs';

const UPDATED = '27 October 2026';
const toc = (items) => `<nav class="toc" aria-label="On this page"><p class="toc__title">On this page</p><ol role="list">${items.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol></nav>`;
const legalHero = (title, intro) => pageHero({
  crumbs: [{ href: '/', label: 'Home' }, { label: title }],
  eyebrow: 'Legal',
  title: esc(title),
  lede: `${intro} <span class="phero__updated">Last updated ${UPDATED}.</span>`,
  cls: 'phero--compact',
});
const mail = `<a href="mailto:${SITE.email}">${SITE.email}</a>`;

/* ---------------------------------- Privacy ---------------------------------- */
const privacySections = [
  ['who', 'Who we are'], ['enquiries', 'When you contact us or request a demo'], ['paying', 'Payments and agreements'], ['customers', 'When you’re our customer'],
  ['clients', 'If you contacted one of our clients'], ['prospects', 'Contacting businesses about our services'], ['why', 'Why we use it'],
  ['share', 'Who we share it with'], ['abroad', 'Information sent outside the UK'], ['keep', 'How long we keep it'], ['rights', 'Your rights and complaints'],
  ['cookies', 'Cookies, visit counting and browser storage'], ['safe', 'Keeping it safe'], ['changes', 'Changes to this notice'],
];

const privacy = {
  path: '/privacy.html',
  title: 'Privacy & cookies',
  description: `How ${SITE.name} uses personal information: enquiries, demo requests, customers, the callers and customers of the businesses we work for, and cookies.`,
  bodyClass: 'is-legal',
  body: legalHero('Privacy & cookies', 'How we use personal information, in plain English. If anything isn’t clear, email us and we’ll explain.') + `
<section class="section section--legal">
  <div class="container legal-grid">
    ${toc(privacySections)}
    <div class="prose">
    <h2 id="who">1. Who we are</h2>
    <p>${SITE.name} is a trading name of ${SITE.legalName}, a company registered in ${SITE.registeredIn} (company number ${SITE.companyNumber}), whose registered office is at ${SITE.office}.</p>
    <p>For the information we collect about our own enquiries, customers and business contacts, we decide how it’s used, which makes us the <strong>controller</strong> under UK data protection law. When we run a website or a service for a business, such as hosting its website or answering its calls, we handle its customers’ information on that business’s behalf, which makes us its <strong>processor</strong> (see section 5).</p>
    <p>Contact us about anything on this page at ${mail}.</p>

    <h2 id="enquiries">2. When you contact us or request a demo</h2>
    <ul>
      <li><strong>When you ask for a quote:</strong> your name, business name, email address, phone number (if you give it), your type of business, the services you’re interested in, and anything else you tell us.</li>
      <li><strong>When you request a website demo:</strong> your name, business name, email address, phone number (if you give it), how many pages you think you need, what you need (including any booking, payment or shop details), your message, and any files you send us, such as your logo or photos.</li>
      <li><strong>When you email us:</strong> your email address and whatever you write to us.</li>
    </ul>
    <p>We use this to reply to you, build your demo, send you quotes and talk through whether our services would suit your business. Our forms briefly keep a scrambled (hashed) version of your IP address to stop spam.</p>

    <h2 id="paying">3. Payments and agreements</h2>
    <p>Payments are handled by Stripe, a secure payment provider. We see that you’ve paid, but we never see or store your full card details.</p>
    <p>If you sign an agreement online, we keep the name and position you type to sign, the plan you choose, the date and time, your IP address and browser, and a copy of exactly what you signed, as a record of the contract.</p>

    <h2 id="customers">4. When you’re our customer</h2>
    <p>We keep your contact and business details, the emails and messages we exchange, the content you ask us to put on your website or social media, your service settings (such as your working hours, approved wording and where summaries should go), records of what we’ve set up and changed, and usage figures.</p>

    <h2 id="clients">5. If you contacted one of our clients</h2>
    <p>We host websites and run services for small businesses: an AI receptionist for calls the business can’t take, website enquiry forms, social media management and, for some, a tailored Business OS. If you visited one of those websites, contacted one of those businesses, or bought from them, we may handle your information on their behalf. That business is the controller of your information, and its own privacy notice explains how it uses it. We act only on its instructions.</p>
    <p>Depending on the service, this can include:</p>
    <ul>
      <li>what you enter in a form on a website we host for them;</li>
      <li>your name, phone number, the area or postcode of the job, what the job is, how urgent you said it was, and when you’d like a call back (AI receptionist);</li>
      <li>comments and messages you send to the business’s Facebook or Instagram pages, which we may read and, on some plans, reply to using wording the business has approved (social media management);</li>
      <li>photos of work the business has done, which might show a property;</li>
      <li>for a business with a KWM Business OS, the details you give that business (for example in an enquiry, a call or a booking) as they pass through the tools we set up and run for it.</li>
    </ul>
    <p>Our AI receptionist tells callers that it’s an AI assistant. We don’t record calls by default: the conversation is turned into text so a summary can be written, and we set our suppliers to keep that for the shortest time they allow. If you’d like to see, correct or delete your information, contact the business you dealt with. If you contact us instead, we’ll pass your request to them straight away.</p>

    <h2 id="prospects">6. Contacting businesses about our services</h2>
    <p>We may contact businesses whose details are publicly listed, for example on Google Maps. We use the business name, phone number, address, the contact’s name if it’s listed, and notes of our conversations. Before we call, we check the number against the Telephone Preference Service and the Corporate Telephone Preference Service. We don’t send marketing emails or texts to sole traders or partnerships unless they’ve agreed to them. If you ask us not to contact you, we’ll stop and keep a note so we don’t contact you again.</p>

    <h2 id="why">7. Why we use it</h2>
    <ul>
      <li>To reply to you, build your demo and send you quotes, because you’ve asked us to, as a step before a possible contract.</li>
      <li>To build, host and look after your website, and to set up and run your services, because we need to in order to deliver our contract with you.</li>
      <li>To keep business and accounting records, because the law requires it.</li>
      <li>To keep a reliable record of who signed an agreement for a business and when, to protect our website and services from spam and misuse, to count visits to our website so we can improve it, and to contact businesses about our services, because we have a legitimate interest in doing so. You can object to this at any time.</li>
    </ul>
    <p>We never sell your information or use it for anything you wouldn’t expect. We don’t use our clients’ customers’ information to train AI, and we choose supplier settings that stop our suppliers doing so.</p>

    <h2 id="share">8. Who we share it with</h2>
    <p>We only share information with services we need to run the business: our website hosting, our email (Microsoft 365) and our payment provider (Stripe). To run our services for clients, we also use telephone, text message, email, automation and AI providers, and we post to social media platforms (Meta and Google) on our clients’ behalf, where their own terms apply. Our providers may only use the information to provide their service to us. We’ll list the providers our AI receptionist, enquiry setup and social media services use on this page, with what each one does and where it processes information, before any client’s service starts. For a Business OS, they’re named in your proposal. People who make sales calls for us see only the contact details they need. We don’t share information with anyone else unless the law requires it.</p>

    <h2 id="abroad">9. Information sent outside the UK</h2>
    <p>Some of our providers are based in, or process information in, other countries, including the United States. Where that happens, we rely on the safeguards UK law requires, such as the UK–US “data bridge” for providers certified under it, or UK-approved data transfer contracts.</p>

    <h2 id="keep">10. How long we keep it</h2>
    <ul>
      <li><strong>Website demo requests:</strong> if you start a request but don’t pay, it’s deleted automatically, usually within 2 days. Copies of requests and files on our website’s server are deleted automatically after about 90 days.</li>
      <li><strong>Enquiries:</strong> if we don’t end up working together, we delete your enquiry and any files from our email within 12 months.</li>
      <li><strong>Signed agreements:</strong> if you sign but don’t pay, we delete the signed copy and its signing record after 12 months.</li>
      <li><strong>Our clients’ customers:</strong> callback summaries, enquiries and message records are kept only as long as the client needs them. Our default is to delete them from our systems 90 days after they’re sent to the client, and message logs after 12 months. Photos sent to us for social media posts are deleted from our storage within 30 days of being posted, unless the client asks us to keep them for future posts.</li>
      <li><strong>Social Content Machine:</strong> the photos you upload are deleted from our storage after 30 days.</li>
      <li><strong>Customers:</strong> for as long as we work together, then for 6 years after our agreement ends, for accounting and legal reasons. Then we delete it.</li>
    </ul>

    <h2 id="rights">11. Your rights and complaints</h2>
    <p>You can ask us for a copy of your information, ask us to correct or delete it, object to how we use it, or ask us to limit its use. Email ${mail} and we’ll respond within one month.</p>
    <p>If you’re unhappy with how we’ve handled your information, please tell us first by emailing the same address with “Complaint” in the subject line. We’ll acknowledge your complaint within 30 days and look into it properly. You can also complain to the UK data protection regulator, the Information Commission (ICO), at <a href="https://ico.org.uk" rel="noopener">ico.org.uk</a> or on 0303 123 1113.</p>

    <h2 id="cookies">12. Cookies, visit counting and browser storage</h2>
    <p>This website doesn’t use cookies for analytics or advertising, and it doesn’t load scripts, fonts or images from other companies. Even our fonts are served from our own site.</p>
    <p><strong>Visit counting.</strong> To see which pages are useful and improve the website, we count visits on our own server. When you open a page, your browser tells us which page it was, the website you came from (just its address, such as google.com), and whether you’re on a phone, tablet or computer. We also count when a quote request is sent, a demo request is started or a demo fee is paid. We add these to daily totals. We don’t use cookies for this, we don’t store your IP address or anything else that could identify you, and we don’t share the totals with anyone. We keep the daily totals for 13 months. If your browser sends a Global Privacy Control or Do Not Track signal, we don’t count your visits. You can also switch counting off on this device at any time:</p>
    <div class="stats-pref" id="statsPref" hidden><p class="stats-pref__state" id="statsState" role="status"></p><button type="button" class="btn btn--outline btn--sm" id="statsToggle">Switch off visit counting</button></div>
    <noscript><p>Your browser isn’t running our scripts, so your visits aren’t being counted.</p></noscript>
    <p>We store a few small items in your browser only when they’re needed, listed below.</p>
    <div class="table-wrap"><table class="ptable ptable--plain">
      <caption class="visually-hidden">Browser storage used by this website</caption>
      <thead><tr><th scope="col">Name</th><th scope="col">What it does</th><th scope="col">Type</th><th scope="col">How long</th></tr></thead>
      <tbody>
        <tr><th scope="row">kwm-notice</th><td data-label="What it does">Remembers that you’ve seen our note about visit counting, so it isn’t shown again</td><td data-label="Type">Essential</td><td data-label="How long">Until you clear it</td></tr>
        <tr><th scope="row">kwm-stats</th><td data-label="What it does">Remembers that you switched visit counting off. Only set if you do.</td><td data-label="Type">Essential</td><td data-label="How long">Until you clear it</td></tr>
      </tbody>
    </table></div>
    <p>Like every website, our hosting provider keeps standard server logs (such as IP address, browser type and the pages requested) to keep the site secure; these are deleted automatically after a short period set by our host. If you choose to pay online, you’ll go to Stripe’s secure payment page, which has its own privacy notice. If we ever add advertising measurement, we’ll update this notice first and ask for your consent before it starts.</p>

    <h2 id="safe">13. Keeping it safe</h2>
    <p>Our website is served over a secure connection (the padlock in your browser). We only keep the information we need, limit who can see it, and use strong passwords and two-step sign-in on the accounts that hold it. We never ask for, or keep, our clients’ social media passwords.</p>

    <h2 id="changes">14. Changes to this notice</h2>
    <p>We’ll update this page when anything changes, and the date at the top shows when it was last updated.</p>
    </div>
  </div>
</section>`,
};

/* ----------------------------------- Terms ----------------------------------- */
const termsSections = [
  ['about', 'About us'], ['business', 'Our services are for businesses'], ['site', 'Using this website'], ['services', 'What we provide'],
  ['web-prices', 'Website prices'], ['demo', 'Your website demo'], ['web-pay', 'Paying for your website'], ['web-plans', 'Website monthly plans'],
  ['quoted', 'Things we quote for separately'], ['tools', 'Monthly services: prices and payment'], ['usage', 'Allowances and top-ups'],
  ['social', 'Social media management'], ['yours', 'What we need from you'], ['ai', 'AI and automation'], ['suppliers', 'Suppliers and availability'],
  ['data', 'Data protection'], ['support', 'Support and changes'], ['cancel', 'Cancelling monthly services'], ['ownership', 'Ownership'],
  ['responsibility', 'Our responsibility to you'], ['change', 'Changes to these terms'], ['law', 'Law'],
];

const terms = {
  path: '/terms.html',
  title: 'Terms & conditions',
  description: `The terms for the ${SITE.name} website and our services: website demos, plans and payment, monthly services, social media, Business OS, AI and cancelling.`,
  bodyClass: 'is-legal',
  body: legalHero('Terms & conditions', 'These terms cover using this website and the main points of how our services work. For websites, your signed Service Agreement sets out the full terms of your plan. For our other services, we agree a written order with you first, and for a Business OS, a written proposal. If anything here differs from your Service Agreement or written order, that document applies.') + `
<section class="section section--legal">
  <div class="container legal-grid">
    ${toc(termsSections)}
    <div class="prose">
    <h2 id="about">1. About us</h2>
    <p>This website is run by ${SITE.legalName}, trading as ${SITE.name}, a company registered in ${SITE.registeredIn} (company number ${SITE.companyNumber}), whose registered office is at ${SITE.office}. You can contact us at ${mail}.</p>

    <h2 id="business">2. Our services are for businesses</h2>
    <p>Our services are for sole traders, partnerships and companies acting for their business. By asking us for a demo or a proposal, or buying our services, you confirm you’re acting for your business, not as a consumer.</p>

    <h2 id="site">3. Using this website</h2>
    <p>You’re welcome to browse this website and use its forms to contact us. Please don’t misuse it, try to break it, or copy its design or content without our permission. The concept websites shown on this site are examples we designed ourselves for made-up businesses. The examples of our services and social media posts, including names, phone numbers and messages, are made up to show how they work. They aren’t real customers or real results.</p>

    <h2 id="services">4. What we provide</h2>
    <p>We design, build, host and look after websites. We also set up and run an AI receptionist for calls our clients can’t take, and website enquiry setup, carry out one-off Local Business Refresh projects, provide the Social Content Machine, manage social media, and design, build and maintain tailored KWM Business OS systems. Each service is described on its page on this website, including what it does and what it won’t do.</p>
    <p>In particular: our AI receptionist takes messages and doesn’t quote, book work or handle emergencies; the Social Content Machine writes drafts for you to check and post, and doesn’t post for you; for managed social media, a person checks every post before it’s scheduled, and we never buy followers, likes or reviews; and a Business OS is scoped in a written proposal, which sets out what’s included, the fees and any third-party costs before work starts.</p>

    <h2 id="web-prices">5. Website prices</h2>
    <p>Our prices are in pounds sterling. ${VAT_NOTE}</p>
    <div class="table-wrap"><table class="ptable ptable--plain">
      <caption class="visually-hidden">Website prices</caption>
      <thead><tr><th scope="col">Website size</th><th scope="col">Design &amp; build (one-off)</th><th scope="col">Monthly management</th></tr></thead>
      <tbody>${WEB.tiers.map((t) => `<tr><th scope="row">${esc(t.label)}${t.id === '4+' ? ' (more are quoted)' : ''}</th><td data-label="Design &amp; build">${money(t.build)}</td><td data-label="Monthly">${money(t.m12)} a month with a 12-month minimum, or ${money(t.m5)} a month on a 5-year plan</td></tr>`).join('')}</tbody>
    </table></div>
    <p>Or choose the Care plan: ${money(WEB.care.monthly)} a month for a website of any size, with a 12-month minimum and 1 website change a month. Every monthly plan includes hosting, a domain name (web address) registered and renewed by us, the SSL padlock, security updates, daily backups and up to 5 website changes a month (1 on the Care plan).</p>

    <h2 id="demo">6. Your website demo</h2>
    <p>Before you commit to anything, we build a real, working demo of your new website. If you request it through this website, it costs ${money(WEB.demo.price)}, which you pay online, securely through Stripe; the fee stops time-wasting requests, and we start work once it’s paid. If we arranged your demo with you on a call, it’s free. We aim to have your demo ready within 2 working days. Any demo fee is separate from your build price and isn’t taken off it. If you decide not to go ahead, you don’t owe us anything more.</p>
    <p>We’ll keep making changes to your demo until you’re happy with it. The demo is for you to review. Please don’t publish it or pass it off as your own website until you’ve paid for your build.</p>

    <h2 id="web-pay">7. Paying for your website</h2>
    <p>Once you approve your demo, we’ll send you a private link to your Service Agreement. You choose your plan, sign online and pay your build price by card through Stripe, which also sets up your monthly payments. Your build price includes your first month. We aim to put your website live the day after you pay.</p>

    <h2 id="web-plans">8. Website monthly plans</h2>
    <p>Your plan and its minimum term start on the day you pay your build price, and your monthly payments start one month later, paid monthly in advance. A “website change” is any single change you ask us to make, big or small, such as new prices, photos, opening hours, offers, or a new section on an existing page. You can ask for up to 5 changes each month, or 1 on the Care plan. New pages are quoted separately. Unused changes don’t carry over to the next month.</p>
    <p>On the 12-month plan and the Care plan, you agree to pay for at least 12 months. On the 5-year plan, you agree to pay for at least 5 years, in return for a lower monthly price. After your minimum term, your plan continues month by month until either of us ends it. Notice periods, what happens if you end a plan early and how your website is handed over are all set out in your Service Agreement, which you’ll see and sign before we start.</p>

    <h2 id="quoted">9. Things we quote for separately</h2>
    <p>New pages, online booking systems, taking payments online, online shops, new features and major redesigns aren’t included in the website build or monthly price. Paid advert management isn’t included in our social media plans. Tell us what you need and we’ll send you a clear quote, free, within 24 hours. We won’t start this work until you’ve accepted the quote in writing.</p>

    <h2 id="tools">10. Monthly services: prices and payment</h2>
    <p>Prices for the AI receptionist, enquiry setup and social media are shown on our <a href="/pricing/">pricing page</a>. They are launch prices. Before we start, we send you a written order setting out the services you’ve chosen, the prices, your allowances and the wording you’ve approved. We set up each service, test it with you and switch it on once you’ve agreed. The Local Business Refresh is quoted in writing before it starts. A Business OS starts from the prices on its page, and its exact scope, fees and any third-party costs are set out in a written proposal before work starts.</p>
    <ul>
      <li>${POLICY.payment}</li>
      <li>${POLICY.setupRefund}</li>
      <li>${POLICY.priceChange}</li>
      <li>Call forwarding is set up on your own phone or phone system. Any charges your network makes for forwarded calls are yours, so check your plan with us before setup.</li>
    </ul>

    <h2 id="usage">11. Allowances and top-ups</h2>
    <p>The AI receptionist has no minute limit. It’s covered by fair use: if a business’s receptionist regularly takes more than about 100 calls a month, we’ll agree the next step with them before anything changes, and we’ll never cut callers off. Our other monthly services have allowances or limits, shown on the pricing page. For a Business OS, any usage limits and usage-based costs are set out in your proposal. We tell you when you’ve used ${POLICY.warnAt}% of an allowance. We never charge for extra use without your agreement: if you’re going to run out, you choose whether to buy a top-up or extra posts for the rest of that month, or to wait until your allowance resets. Unused allowances don’t carry over.</p>

    <h2 id="social">12. Social media management</h2>
    <ul>
      <li><strong>Access:</strong> you give us access through Meta Business Suite partner access and Google Business Profile manager access. We never ask for your passwords. Your pages stay yours, and you can remove our access at any time.</li>
      <li><strong>Approval:</strong> you see your posts before they go out, in a weekly or monthly preview. If you choose, posts can go ahead unless you object within 2 working days. Tell us if you want a post changed or removed and we’ll do it, usually the same working day.</li>
      <li><strong>Comments and messages:</strong> what we do depends on your plan, as shown on the pricing page. Where we reply, we use wording you’ve approved. We pass enquiries to you, and we never quote, book or agree anything on your behalf.</li>
      <li><strong>Platform rules:</strong> Facebook, Instagram and Google set their own rules and can change how their services work. We follow their rules and can’t control what they show, to whom, or when.</li>
      <li><strong>No guarantees:</strong> we can’t promise a particular number of followers, views, likes, enquiries or sales.</li>
      <li><strong>When it ends:</strong> we stop posting, remove our access, and your pages and the posts on them stay yours.</li>
    </ul>

    <h2 id="yours">13. What we need from you</h2>
    <ul>
      <li>Give us accurate information, approve your wording before it goes live, and tell us promptly about changes, such as new working hours or a new phone number.</li>
      <li>When you send us text, logos, colour schemes, photos or other files, you confirm that you own them or have permission to use them. You keep ownership of everything you send us. You give us permission to use it to provide our services to you, and for nothing else.</li>
      <li>Photos: avoid customers’ faces, house numbers and number plates unless the customer is happy for you to share them.</li>
      <li>Use our services lawfully. In particular, don’t use them to send marketing to people who haven’t agreed to it, and don’t ask us to add offers or adverts to service messages.</li>
      <li>Have your own privacy notice that tells your customers how you use their information, including that you use services like ours. We can give you suggested wording.</li>
      <li>Keep your call forwarding switched on while you use our call services, and tell us before you change phone network or plan.</li>
    </ul>
    <p>If a service is being used in a way that breaks these terms or the law, we may pause that service and will tell you why.</p>

    <h2 id="ai">14. AI and automation</h2>
    <p>Our AI receptionist and the Social Content Machine use AI. AI can make mistakes, such as mishearing a name or misreading a photo. That’s why summaries show the number a call came from where it’s available, why anything unclear is flagged, and why a person checks every managed social media post before it’s scheduled. You’re responsible for checking summaries, and Social Content Machine drafts, before acting on them or posting them. Where a Business OS uses AI, your proposal sets out what it does and what needs a person’s approval. None of our services is an emergency service.</p>

    <h2 id="suppliers">15. Suppliers and availability</h2>
    <p>Our services rely on telephone, messaging, email, AI, social media and hosting providers. We choose them carefully and set up backups so callers aren’t left hanging if something fails, but we can’t promise that any service or website will never be interrupted. If something stops working, we’ll treat it as a priority and tell you what happened. If a supplier changes its service or prices in a way that affects yours, we’ll tell you as early as we can and explain your options.</p>

    <h2 id="data">16. Data protection</h2>
    <p>When we host your website or run services for you, we handle your customers’ information on your behalf, as your processor, and only on your instructions. Our data processing terms form part of your Service Agreement or written order. Our <a href="/privacy.html">privacy notice</a> explains how we use our own customers’ and contacts’ information.</p>

    <h2 id="support">17. Support and changes</h2>
    <ul>
      <li>${POLICY.support}</li>
      <li>The AI receptionist, enquiry setup and social media: ${POLICY.changes.charAt(0).toLowerCase() + POLICY.changes.slice(1)} Bigger changes, such as new services or custom work, are quoted first and only started once you’ve agreed.</li>
      <li>Websites: your monthly website changes are covered in section 8.</li>
    </ul>

    <h2 id="cancel">18. Cancelling monthly services</h2>
    <p>${POLICY.term}. You can cancel any of them by giving us ${POLICY.notice}’ notice by email. When a service ends, we switch it off, help you turn off call forwarding, remove our access to your accounts, and delete your information and your customers’ information from our systems within 30 days, after sending you a copy if you ask for one. We can end these services by giving you ${POLICY.notice}’ notice, or straight away if you seriously break these terms or don’t pay. Website plans are ended as set out in your Service Agreement, and a Business OS as set out in its proposal and agreement.</p>

    <h2 id="ownership">19. Ownership</h2>
    <p>Your content is always yours, and so are your social media pages and your customers’ details. Who owns the website design and the domain name (web address), and how they’re handed over if you leave, is set out in your Service Agreement.</p>

    <h2 id="responsibility">20. Our responsibility to you</h2>
    <p>We’ll provide our services with reasonable care and skill. We can’t promise that your website or our services will never be unavailable, or that they will bring a particular number of visitors, calls, enquiries, jobs, reviews, followers or sales, or reach a particular position in search results. We’re not responsible for losses caused by your phone network, your website provider (if it isn’t us) or social media platforms. For our other services, we’re not responsible for lost business or lost profits, and our total responsibility to you is limited to the amount you paid us for them in the 12 months before the problem arose. Nothing in these terms limits any liability that the law doesn’t allow us to limit.</p>

    <h2 id="change">21. Changes to these terms</h2>
    <p>We may update these terms from time to time. The date at the top of this page shows when they were last changed. Changes won’t affect work you’ve already agreed with us unless we tell you at least 30 days in advance.</p>

    <h2 id="law">22. Law</h2>
    <p>These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction.</p>
    </div>
  </div>
</section>`,
};

export default [privacy, terms];
