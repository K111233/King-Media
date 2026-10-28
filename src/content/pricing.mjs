// KWM Systems · pricing.mjs · every price, allowance and pricing rule on the site comes from here.
// Change a number, run `node src/build.mjs`, and every page that shows it updates.
//
// How prices are set (launch-pack/02 and 03):
//   Websites       - the existing King Media prices, unchanged.
//   Services       - the AI receptionist and enquiry setup run on their own after setup, so the monthly
//                    price mostly covers supplier costs and light monitoring; setup covers the hands-on work.
//   Social media   - the £29.99 Social Content Machine (AI drafts the owner posts, up to 30 a day), or managed
//                    plans priced by activity (posts, channels, how often we check comments).
//   Business OS    - a tailored system: "from" prices only; exact scope and costs go in a written proposal.

export const STATUS = 'launch';
export const VAT_NOTE = 'Prices include any VAT that applies.';

/* ---------- Websites (existing King Media prices) ---------- */
export const WEB = {
  demo: { price: 4.99, free: 'Free if we arrange it with you on a call', ready: 'within 2 working days' },
  tiers: [
    { id: '1', label: '1 page', build: 494.99, m12: 49.99, m5: 39.99, bestFor: 'One strong page: what you do, your prices, where to find you and how to get in touch.' },
    { id: '2', label: '2 pages', build: 899.99, m12: 49.99, m5: 39.99, bestFor: 'Your home page, plus a page for your menu, services or price list.' },
    { id: '3', label: '3 pages', build: 1199.99, m12: 59.99, m5: 49.99, bestFor: 'Home, services and about, with a way to get in touch on every page.', popular: true },
    { id: '4+', label: '4–6 pages', build: 1449.99, m12: 59.99, m5: 49.99, bestFor: 'Room for the lot: services, gallery, about, contact and more. Need more than 6? We’ll quote.' },
  ],
  care: { monthly: 19.99, detail: 'Any size of site, with a 12-month minimum and 1 change a month instead of 5.' },
};

/* ---------- How hands-on each service is (shown on cards, and the reason for the price) ---------- */
export const INVOLVEMENT = {
  automated: { label: 'Automated', note: 'Runs on its own after setup. We monitor it.' },
  checked: { label: 'Automated + checked', note: 'Runs on its own; we check its work every month.' },
  managed: { label: 'Managed by us', note: 'A person does the work every week.' },
  project: { label: 'One-off project', note: 'Done once, and quoted after a free look.' },
  either: { label: 'Do it yourself or managed', note: 'AI drafts you post yourself, or plans a person runs for you.' },
};

/* ---------- AI receptionist and enquiry setup (automated after setup) ---------- */
export const PRICES = {
  receptionist: {
    monthly: 59.99, setup: 99, involvement: 'checked',
    // No minute limit (the owner's decision, 27 Oct 2026). Each call is short because it only takes a
    // message; fair use covers the rare business with far more calls (launch-pack/03).
    allowance: { short: 'Unlimited calls (fair use)' },
    topUp: null,
    fairUse: 'No minute limit. Calls stay short because it only takes a message. If your receptionist regularly takes more than about 100 calls a month, we’ll talk to you first. We never cut callers off.',
  },
  enquiry: {
    monthly: 19.99, setup: 79, involvement: 'automated',
    allowance: { short: '1 enquiry form, email summaries for every enquiry, text alerts for 100 a month' },
    topUp: { price: 5, amount: 50, unit: 'text alerts' },
  },
};

/* ---------- Social media management: the Social Content Machine (managed, priced by activity) ----------
   Checked against 17 published UK offers (launch-pack/research/social-management.md, 27 Oct 2026):
   12–13 posts a month sells for £99–£300 (median about £225), 16–22 for £200–£500, daily posting for
   £195–£445 without replies. Comment or message handling usually costs £50–£300 a month extra.
   Four plans from £79 give more posts for less, which works because each post is batched: AI drafts the
   caption, a person checks it, a template and bulk scheduling do the rest (about 8–10 minutes a post,
   to be measured in the pilot: launch-pack/03). Anything bigger or different is quoted. */
export const SOCIAL = {
  // The approved do-it-yourself plan: AI drafts from the owner's photos and notes, which they check and post.
  // The limit is drafts, not posts: "up to 30 drafts a day" (the original approved spec).
  diy: {
    name: 'Social Content Machine', monthly: 29.99, setup: 0, limit: 'Up to 30 drafts a day',
    includes: ['AI drafts of posts from your job photos and a line of notes', 'Up to 30 drafts a day, written in the tone you choose', 'You check, edit and post them yourself', 'Your photos are deleted from our storage after 30 days'],
  },
  setup: 79,
  tiers: [
    {
      id: 'starter', name: 'Starter', monthly: 79, posts: 8, videos: 0, pace: 'about 2 a week',
      involvement: 'We plan and schedule a month at a time',
      channels: ['Facebook', 'Instagram'],
      includes: ['8 posts a month from your job photos and tips', 'Posted to Facebook and Instagram', 'A monthly plan you approve before anything goes out'],
      comments: 'You reply yourself',
    },
    {
      id: 'keep-active', name: 'Keep active', monthly: 129, posts: 12, videos: 0, pace: 'about 3 a week',
      involvement: 'We plan and schedule your posts every week',
      channels: ['Facebook', 'Instagram'],
      includes: ['12 posts a month from your job photos, tips and seasonal ideas', 'Posted to Facebook and Instagram', 'A monthly plan you approve before anything goes out', 'A short monthly report'],
      comments: 'You reply yourself',
    },
    {
      id: 'regular', name: 'Regular', monthly: 229, posts: 20, videos: 0, pace: 'about 5 a week', popular: true,
      involvement: 'We check your pages twice a week',
      channels: ['Facebook', 'Instagram', 'Google Business Profile'],
      includes: ['20 posts a month from your job photos, tips, reviews and seasonal ideas', 'Facebook, Instagram and your Google Business Profile', 'Comments and messages checked on Mondays and Thursdays, with anything that needs you passed on and a suggested reply', 'Monthly report and a 20-minute planning call'],
      comments: 'Checked twice a week, passed to you',
    },
    {
      id: 'fully-managed', name: 'Fully managed', monthly: 449, posts: 30, videos: 2, pace: 'about one a day',
      involvement: 'We’re on your pages every weekday',
      channels: ['Facebook', 'Instagram', 'Google Business Profile'],
      includes: ['30 posts a month, including 2 short videos edited from your clips', 'Facebook, Instagram and your Google Business Profile', 'Comments and messages answered every weekday in wording you’ve approved; enquiries and anything tricky passed to you', 'Monthly report and a 30-minute planning call'],
      comments: 'Answered every weekday',
    },
  ],
  extras: [
    { label: 'Extra post', price: 10 },
    { label: 'Extra short video, edited from your clips', price: 35 },
    { label: 'Paid advert management', price: null, note: 'Quoted' },
  ],
  custom: {
    title: 'Want more posts, or something different?',
    text: 'More posts, other channels such as TikTok or LinkedIn, or a different rhythm. Tell us how much you want and how often, and we’ll quote, free, within 24 hours.',
    href: '/contact/?interest=social&tier=custom#quote',
  },
  capacity: 'We only take on a few Fully managed clients at a time, so every page gets proper attention.',
};

/* ---------- KWM Business OS: a tailored system (from prices only; scope in a written proposal) ---------- */
export const OS = { setupFrom: 6999, monthlyFrom: 499 };

/* ---------- Rules shown with the prices (proposals until the owner confirms them) ---------- */
export const POLICY = {
  term: 'The AI receptionist, enquiry setup and social media are monthly, with no minimum term',
  notice: '30 days',
  setupRefund: 'If we can’t make the AI receptionist or enquiry setup work with your phone or website, we’ll refund its setup fee.',
  priceChange: 'If a price changes, we’ll tell you at least 30 days before it affects you.',
  warnAt: 80,
  payment: 'Setup fees are paid before we start. Monthly fees are paid by card, monthly in advance.',
  support: 'Email support on weekdays, 9am to 5pm. We reply within one working day.',
  changes: 'Up to 2 changes a month to your wording, hours or settings, usually done within 2 working days.',
};

export const money = (n) => (n === 0 ? '£0' : '£' + (Number.isInteger(n) ? n.toLocaleString('en-GB') : n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })));
