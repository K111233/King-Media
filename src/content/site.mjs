// KWM Systems · site.mjs · verified business details, used on every page.
// KWM Systems is the new name for King Media (never "KWM Solutions"). The site lives on kwmsystems.com, parked
// on the kingmedia.uk website in hPanel. kingmedia.uk page views forward here (root .htaccess); payment and agreement
// links use kwmsystems.com too (api/lib.php km_config). The King Media mailboxes still send and receive the form emails.
// The public email is info@kwmsystems.com. Payments, form delivery and the mailboxes behind them
// still run through King Media's accounts (api/config.php) and are never shown on the site.

export const SITE = {
  name: 'KWM Systems',
  domain: 'kwmsystems.com',                  // main domain since 2026-10-28 (kingmedia.uk forwards here)
  origin: 'https://kwmsystems.com',
  email: 'info@kwmsystems.com',              // public contact address, confirmed by the owner on 2026-10-28
  replyTime: 'within 24 hours',              // reply promise already published by King Media
  legalName: 'KING WEB MEDIA LTD',
  companyNumber: '17483413',                 // checked on Companies House (incorporated 27 September 2026)
  registeredIn: 'England and Wales',
  office: '124 City Road, London, EC1V 2NX', // registered office
  locale: 'en_GB',
  themeColor: '#081226',
};

export const DISCLOSURE = `${SITE.name} is a trading name of ${SITE.legalName}, a company registered in ${SITE.registeredIn}, company number ${SITE.companyNumber}. Registered office: ${SITE.office}.`;

// Main navigation. "Services" opens a menu of the services (built from services.mjs).
export const NAV = [
  { href: '/websites/', label: 'Websites' },
  { href: '/solutions/', label: 'Services', menu: true },
  { href: '/business-os/', label: 'Business OS' },
  { href: '/work/', label: 'Our work' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/about/', label: 'About' },
];

export const CTA = { href: '/contact/', label: 'Get a free quote' };

// Printed by `node src/build.mjs` until each item is done. Never shown to visitors.
export const OWNER_TODO = [
  'Confirm VAT status. The site says prices "include any VAT that applies", which is true either way, but it changes your margins (launch-pack/03).',
  'Approve the prices in src/content/pricing.mjs: AI receptionist, enquiry setup, the £29.99 Social Content Machine (up to 30 drafts a day), managed social plans, and Business OS (setup from £6,999, from £499 a month). Website prices are your existing King Media prices.',
  'Local Business Refresh is shown as "quoted after a free look": confirm what the quote-preparation guide contains, and whether you want a fixed price.',
  'Confirm the policies the site states: monthly rolling for the AI receptionist, enquiry setup and social media, 30 days\' notice, setup refund if a service can\'t be made to work, top-ups only with approval.',
  'Check info@kwmsystems.com receives mail before going live (the site shows it everywhere; form messages still arrive at the King Media inbox).',
  'Stripe receipts and card statements may still say King Media, and the website no longer mentions that name: change the Stripe account\'s public business name and statement descriptor to KWM Systems.',
  'Legal review of terms.html and privacy.html, and the items in launch-pack/09.',
  'Before selling the AI receptionist, enquiry setup or social management: pass the launch checks in launch-pack/05 and 10.',
];
