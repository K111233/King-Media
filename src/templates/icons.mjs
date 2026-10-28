// KWM Systems · icons.mjs · the logo and one consistent icon family (24px grid, 1.75px round strokes).

// The mark: a modular K. The stem and upper arm are the business; the gold lower arm is the
// solution that slots in. Tile version for favicons and the header; bare version for large uses.
export const markTile = ({ tile = '#0B1B3A', ink = '#FFFFFF', gold = '#D1A84E' } = {}) =>
  `<rect width="48" height="48" rx="12" fill="${tile}"/><rect x="11.5" y="11" width="7" height="26" rx="1" fill="${ink}"/><path d="M28.5 11h8l-8 12h-8z" fill="${ink}"/><path d="M20.5 25h8l8 12h-8z" fill="${gold}"/>`;
export const markBare = ({ ink = '#0B1B3A', gold = '#D1A84E' } = {}) =>
  `<rect x="9" y="6" width="9" height="36" rx="1.5" fill="${ink}"/><path d="M30 6h10.5L29.5 22.5H19z" fill="${ink}"/><path d="M19 25.5h10.5L40.5 42H30z" fill="${gold}"/>`;

export const mark = (size = 36, cls = 'brand__mark', opts = {}) =>
  `<svg class="${cls}" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true" focusable="false">${markTile(opts)}</svg>`;

export const FAVICON_DATA_URI = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${markTile()}</svg>`);

const P = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  'chev-down': '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-5"/>',
  cross: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  phone: '<path d="M6.6 3.5h2.8l1.4 3.8-1.9 1.3a11 11 0 0 0 6.5 6.5l1.3-1.9 3.8 1.4v2.8a2 2 0 0 1-2.2 2C10.5 18.8 5.2 13.5 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
  'phone-missed': '<path d="M6.6 3.5h2.8l1.4 3.8-1.9 1.3a11 11 0 0 0 6.5 6.5l1.3-1.9 3.8 1.4v2.8a2 2 0 0 1-2.2 2C10.5 18.8 5.2 13.5 4.6 5.7a2 2 0 0 1 2-2.2Z"/><path d="m15 3 5 5M20 3l-5 5"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  message: '<path d="M4 5h16v11H9l-5 4Z"/><path d="M8.5 9.5h7M8.5 12.5h4"/>',
  form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8Z"/>',
  camera: '<path d="M4 8h3l1.8-2.5h6.4L17 8h3v11H4Z"/><circle cx="12" cy="13.2" r="3.4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
  shield: '<path d="M12 3 19.5 6v5.6c0 4.4-3 7.6-7.5 8.9-4.5-1.3-7.5-4.5-7.5-8.9V6Z"/><path d="m9 12 2.2 2.2L15.4 10"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
  cart: '<path d="M3 4h2.5l2.2 10.5h10.6L20.5 7H6.6"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  film: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7.5 4v16M16.5 4v16M3.5 8.5h4M3.5 15.5h4M16.5 8.5h4M16.5 15.5h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h1.5M13.5 7H15M9 11h1.5M13.5 11H15M10 21v-4h4v4"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
  pin: '<path d="M12 21s7-6 7-11.5a7 7 0 1 0-14 0C5 15 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/>',
  upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v4.5h16V15"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  sparkle: '<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4"/><circle cx="12" cy="12" r="2.2"/>',
  hand: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 10.5v-6a1.5 1.5 0 0 1 3 0v6M14 10.5V6a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.9-2.5L3.8 14a1.5 1.5 0 0 1 2.4-1.8L8 14.4"/>',
  play: '<path d="M7 4.5v15l12-7.5Z"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="m7.5 15 4-4.5 3 3L20 7"/>',
  receipt: '<path d="M6 3h12v18l-3-1.8-3 1.8-3-1.8L6 21Z"/><path d="M9 8h6M9 12h6"/>',
  wand: '<path d="m4 20 11-11M14 4l.7 1.8L16.5 6.5l-1.8.7L14 9l-.7-1.8L11.5 6.5l1.8-.7Z"/>',
  reply: '<path d="M9.5 6.5 4 12l5.5 5.5"/><path d="M4 12h9.5a6.5 6.5 0 0 1 6.5 6.5v1"/>',
  package: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
};

export const icon = (name, { cls = 'icon', label = '' } = {}) => {
  if (!P[name]) throw new Error(`Unknown icon "${name}"`);
  return `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"'}>${P[name]}</svg>`;
};
