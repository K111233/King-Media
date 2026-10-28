// KWM Systems · social-examples.mjs · example posts and an example month for the social media pages.
// The businesses are our made-up concept businesses; the photos come from their concept websites and are
// credited on /work/. Every example is labelled as an example on the page.

const IMG = (path) => ({ webp: `/concepts/${path}.webp` });

export const EXAMPLE_POSTS = [
  {
    biz: 'Evergreen Gardens', initials: 'EG', tone: 'green', type: 'Before and after', channel: 'Instagram', when: 'Tue, 7:30pm',
    text: 'Before and after in Moseley. This lawn was patchy and tired in spring. Scarified, re-seeded and fed, and here it is six weeks later. Thinking about your garden for next year? Send us a message.',
    images: [{ ...IMG('evergreen-gardens/img/before-640'), alt: 'A patchy, uneven lawn with worn tyre marks.', label: 'Before' }, { ...IMG('evergreen-gardens/img/after-640'), alt: 'A thick, green lawn with neat mowing stripes.', label: 'After' }],
  },
  {
    biz: 'Crumb & Co.', initials: 'C&', tone: 'warm', type: 'Fresh this morning', channel: 'Facebook', when: 'Sat, 7:05am',
    text: 'Out of the oven at 7am: our country sourdough, 36 hours from start to finish. Pop in before 10 for the warmest loaves, or message us to put one aside.',
    images: [{ ...IMG('crumb-and-co/img/sourdough-600'), alt: 'A round sourdough loaf with a scored, floury crust on baking paper.' }],
  },
  {
    biz: 'Northside Barbers', initials: 'NB', tone: 'dark', type: 'Job photo', channel: 'Instagram', when: 'Thu, 6:00pm',
    text: 'Skin fade with a sharp part, finished with a hot towel. Walk in or book a chair online, Monday to Saturday.',
    images: [{ ...IMG('northside-barbers/img/fade-640'), alt: 'A barber trimming the side of a man’s hair into a short fade.' }],
  },
  {
    biz: 'Ironclad Roofing', initials: 'IR', tone: 'yellow', type: 'Seasonal reminder', channel: 'Google Business Profile', when: 'Mon, 8:00am',
    text: 'Leaves are coming down. Blocked gutters are one of the most common causes of damp walls we see in winter. We’re booking gutter clear-outs now: send us a message for a free quote.',
    images: [{ ...IMG('ironclad-roofing/img/gutter-600'), alt: 'A gutter and downpipe on the corner of a house, against a blue sky.' }],
  },
  {
    biz: 'Halcyon Physio', initials: 'HP', tone: 'teal', type: 'Tip', channel: 'Facebook', when: 'Wed, 12:30pm',
    text: 'Working at a desk all day? Three quick checks for your set-up. Still getting aches? Book an assessment and we’ll take a look.',
    card: { kicker: 'Desk set-up tip', title: 'Three quick checks', lines: ['Screen at eye level', 'Feet flat on the floor', 'Elbows at about 90°'] },
  },
  {
    biz: 'Northside Barbers', initials: 'NB', tone: 'dark', type: 'Short video', channel: 'Instagram Reels', when: 'Fri, 5:30pm',
    text: 'Twenty seconds behind the chair: a hairline tidy, edited from clips on the barber’s own phone.',
    images: [{ ...IMG('northside-barbers/img/clipper-600'), alt: 'Close-up of a barber using clippers to shape a man’s hairline.' }], video: true,
  },
];

// An example month on the Regular plan: 20 posts, Monday to Friday, with comment checks on Mondays and Thursdays
export const POST_TYPES = {
  job: { label: 'Job photo', short: 'Job' },
  ba: { label: 'Before and after', short: 'Before / after' },
  tip: { label: 'Tip', short: 'Tip' },
  bts: { label: 'Behind the scenes', short: 'Behind the scenes' },
  season: { label: 'Seasonal or news', short: 'Seasonal' },
};
export const EXAMPLE_MONTH = [
  ['job', 'tip', 'ba', 'job', 'bts'],
  ['job', 'ba', 'tip', 'job', 'season'],
  ['job', 'tip', 'ba', 'job', 'bts'],
  ['job', 'ba', 'tip', 'job', 'season'],
];
