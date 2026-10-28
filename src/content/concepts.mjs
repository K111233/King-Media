// KWM Systems · concepts.mjs · the concept websites (fictional businesses, designed and built by us).
// Live pages are in /concepts/<slug>/; static renders in /assets/renders/. Never present these as clients.

const R = (slug, v2) => ({
  desk: (w, ext) => `/assets/renders/${slug}-desk-${w}${v2 ? '.v2' : ''}.${ext}`,
  phone: (w, ext) => `/assets/renders/${slug}-phone-${w}.${ext}`,
});

export const CONCEPTS = [
  { slug: 'evergreen-gardens', name: 'Evergreen Gardens', sector: 'Gardener and landscaper', feature: 'Before-and-after slider', r: R('evergreen-gardens', true),
    pitch: 'A before-and-after slider, so the work sells itself.',
    why: ['Before-and-after photos up front, because results sell gardening', 'A “Book a garden visit” button on every screen', 'Services in plain words: hedges, design, lawn care'] },
  { slug: 'ironclad-roofing', name: 'Ironclad Roofing', sector: 'Roofer', feature: 'Quote requests', r: R('ironclad-roofing', false),
    pitch: 'A free-quote button on every screen, for a trade that lives on the phone.',
    why: ['“Get a free quote” on every screen, one tap away', 'Reassurance up front: free quotes, insurance and guarantees', 'A grid of finished work to show the standard'] },
  { slug: 'crumb-and-co', name: 'Crumb & Co.', sector: 'Bakery and café', feature: 'Menu with prices', r: R('crumb-and-co', true),
    pitch: 'Today’s bakes, prices and opening hours, a thumb’s reach away.',
    why: ['Today’s bakes and prices first, because that’s what people check', 'Opening hours on every page, down to “7am until sold out”', 'A call button in the header for cake orders'] },
  { slug: 'northside-barbers', name: 'Northside Barbers', sector: 'Barber', feature: 'Booking (quoted add-on)', r: R('northside-barbers', true),
    pitch: 'Prices up front and a big “Book a chair” button.',
    why: ['The full price list, readable at a glance. No PDFs', '“Book a chair” in the header on every screen', 'A gallery of cuts, so people can see the standard'] },
  { slug: 'halcyon-physio', name: 'Halcyon Physio', sector: 'Physiotherapy clinic', feature: 'Booking (quoted add-on)', r: R('halcyon-physio', false),
    pitch: 'Treatments explained simply, with the next available times.',
    why: ['Treatments explained in plain English, not jargon', 'Next available times shown up front', 'Calm colours and generous spacing for a health setting'] },
  { slug: 'wick-and-wild', name: 'Wick & Wild', sector: 'Online candle shop', feature: 'Shop (quoted add-on)', r: R('wick-and-wild', false),
    pitch: 'A working demo basket. Online shops are quoted separately.',
    why: ['The free-delivery threshold in the top bar', 'Add to basket in one tap, with clear feedback', 'Checkout, delivery and returns spelled out before anyone asks'] },
  { slug: 'velluto', name: 'Velluto', sector: 'Gelato bar', feature: 'Scroll film (quoted add-on)', r: R('velluto', false),
    pitch: 'A scroll-driven film, made from real footage.',
    why: ['Real slow-motion footage that plays as you scroll', 'The name sits behind the ice cream, like a magazine cover', 'Press “Play live” and it runs by itself, like a film'] },
];

// Required attribution for photos and footage used in the concepts (several are CC BY).
export const CREDITS = [
  'Velluto: motion footage via Mixkit, Mixkit Free Licence. Clips cut into frames, cropped and resized.',
  'Evergreen Gardens: patchy lawn (before) by Jonathan Cooper, Unsplash Licence. Cropped and resized.',
  'Evergreen Gardens: striped lawn (after) by Se. Tsuchiya, Unsplash Licence. Cropped and resized.',
  'Evergreen Gardens: hedge trimming by Rattan Direct, CC BY 2.0, via Flickr. Cropped and resized.',
  'Evergreen Gardens: garden design by Dave Catchpole, CC BY 2.0, via Flickr. Cropped and resized.',
  'Evergreen Gardens: lawnmower by Ivan Radic, CC BY 2.0, via Flickr. Cropped and resized.',
  'Crumb & Co.: loaves by Kim Cruickshanks / Unsplash, CC0 1.0, via Wikimedia Commons. Cropped and resized.',
  'Crumb & Co.: sourdough by SueRostvold, CC BY 4.0, via Wikimedia Commons. Cropped and resized.',
  'Crumb & Co.: croissant and cinnamon bun by Andy Li, CC0 1.0, via Wikimedia Commons. Cropped and resized.',
  'Northside Barbers: barbershop interior by Nathon Oski, Unsplash Licence. Cropped and resized.',
  'Northside Barbers: skin fade by Michael DeMoya, Unsplash Licence. Cropped and resized.',
  'Northside Barbers: clippers by William Argueta, Unsplash Licence. Cropped and resized.',
  'Northside Barbers: barber’s chair by Chris Knight, Unsplash Licence. Cropped and resized.',
  'Northside Barbers: scissors and shaving kit by Nick Demou, CC0 1.0, via StockSnap. Cropped and resized.',
  'Halcyon Physio: leg stretch by Nenad Stojković (Shixart1985), CC BY 2.0, via Wikimedia Commons. Cropped and resized.',
  'Halcyon Physio: back treatment by Toa Heftiba, Unsplash Licence. Resized.',
  'Halcyon Physio: knee examination by yury kirillov, Unsplash Licence. Resized.',
  'Halcyon Physio: wrist splint by Tom Claes, Unsplash Licence. Cropped and resized.',
  'Ironclad Roofing: roofer in a harness by Raze Solar, Unsplash Licence. Cropped and resized.',
  'Ironclad Roofing: new tiled roof by Sergej (skstrannik), Unsplash Licence. Cropped and resized.',
  'Ironclad Roofing: slate and dormers by Mark Stuckey, Unsplash Licence. Cropped and resized.',
  'Ironclad Roofing: roof tiles by Michael Jasmund, Unsplash Licence. Resized.',
  'Ironclad Roofing: gutter and downpipe by Jeremy from Sydney, Australia, CC BY 2.0, via Wikimedia Commons. Cropped and resized.',
  'Wick & Wild: candle in cupped hands by Daiga Ellaby / Unsplash, CC0 1.0, via Wikimedia Commons. Cropped and resized.',
  'Wick & Wild: Linen & Cotton candle by rawpixel, CC0 1.0. Cropped and resized.',
  'Wick & Wild: wooden wick candle by Burst, via StockSnap, CC0 1.0. Cropped and resized.',
  'Wick & Wild: Wild Fig candle by rawpixel, CC0 1.0. Cropped and resized.',
  'Wick & Wild: amber gift jar by rawpixel, CC0 1.0. Cropped and resized.',
];
