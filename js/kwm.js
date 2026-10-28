/* KWM Systems · kwm.js · menus, tabs, the two forms, payment notices and the Business OS calculator. No dependencies.
 * Forms post to the existing api/submit.php (form=question | form=demo), exactly as the previous
 * site did: the demo request goes on to Stripe through the pay_url it returns. On a local preview
 * (no PHP), nothing is sent and the form says so.
 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const EMAIL = 'info@kwmsystems.com';
  const API = '/api/submit.php';
  const OPENED = Date.now();
  const LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const params = new URLSearchParams(location.search);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  };

  /* ---------- Visit counting: our own server, no cookies, daily totals only (privacy notice, section 12) ---------- */
  const STATS = 'kwm-stats';
  const NOTICE = 'kwm-notice';
  const signal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const counting = () => !LOCAL && !signal && store.get(STATS) !== 'off' && 'sendBeacon' in navigator;
  function count(event) {
    if (!counting()) return;
    const data = new FormData();
    if (event) {
      data.set('e', event);
    } else {
      data.set('p', location.pathname);
      let from = '';
      try { from = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) { from = ''; }
      if (from && from !== location.hostname.replace(/^www\./, '')) data.set('r', from);
      data.set('d', innerWidth < 640 ? 'phone' : innerWidth < 1080 ? 'tablet' : 'computer');
    }
    navigator.sendBeacon('/api/hit.php', data);
  }
  count();

  // The first time: say that visits are counted, with a one-tap way to switch it off
  let placeDock = () => {};
  if (!signal && !store.get(NOTICE) && store.get(STATS) !== 'off' && store.set(NOTICE + '-test', '1')) {
    store.set(NOTICE + '-test', null);
    const note = document.createElement('div');
    note.className = 'notice';
    note.setAttribute('role', 'region');
    note.setAttribute('aria-label', 'About visit counting');
    note.innerHTML = '<p class="notice__text">We count visits on our own server to see which pages help. No cookies, no adverts, nothing shared. <a href="/privacy.html#cookies">How it works</a></p><div class="notice__actions"><button type="button" class="btn btn--gold btn--sm" data-choice="ok">OK</button><button type="button" class="btn btn--ghost btn--sm" data-choice="off">Switch off</button></div>';
    note.addEventListener('click', (e) => {
      const b = e.target.closest('[data-choice]');
      if (!b) return;
      store.set(NOTICE, 'seen');
      if (b.dataset.choice === 'off') store.set(STATS, 'off');
      note.remove();
      placeDock();
    });
    document.body.append(note);
  }

  // Privacy notice: the on/off switch for this device
  const pref = $('#statsPref');
  if (pref) {
    const state = $('#statsState');
    const toggle = $('#statsToggle');
    const show = (msg) => {
      const off = store.get(STATS) === 'off';
      state.textContent = msg || (off ? 'Visit counting is switched off on this device.' : signal ? 'Your browser asks websites not to track it, so your visits aren’t counted.' : 'Visit counting is on for this device.');
      toggle.textContent = off ? 'Switch visit counting back on' : 'Switch off visit counting';
      toggle.hidden = signal && !off;
    };
    toggle.addEventListener('click', () => {
      const ok = store.set(STATS, store.get(STATS) === 'off' ? null : 'off');
      store.set(NOTICE, 'seen');
      show(ok ? '' : 'Your browser didn’t let us save that choice. Your visits may still be counted.');
    });
    pref.hidden = false;
    show();
  }

  /* ---------- Solutions menu (desktop header) ---------- */
  const megaBtn = $('.nav__menu-btn');
  const mega = megaBtn ? document.getElementById(megaBtn.getAttribute('aria-controls')) : null;
  let megaTimer = 0;
  let megaOpenedAt = 0;
  const megaOpen = () => megaBtn.getAttribute('aria-expanded') === 'true';
  function setMega(open, returnFocus) {
    clearTimeout(megaTimer);
    if (open && !megaOpen()) megaOpenedAt = Date.now();
    megaBtn.setAttribute('aria-expanded', String(open));
    mega.hidden = !open;
    if (!open && returnFocus) megaBtn.focus();
  }
  if (mega) {
    const item = megaBtn.closest('li');
    megaBtn.addEventListener('click', () => {
      if (megaOpen() && Date.now() - megaOpenedAt < 500) return; // just opened by hover: keep it open
      setMega(!megaOpen());
    });
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(megaTimer);
      megaTimer = setTimeout(() => setMega(true), 90);
    });
    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(megaTimer);
      megaTimer = setTimeout(() => setMega(false), 240);
    });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) setMega(false); });
    document.addEventListener('click', (e) => { if (megaOpen() && !item.contains(e.target)) setMega(false); });
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const menu = $('#menu');
  function setMenu(open, returnFocus) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    html.classList.toggle('menu-open', open);
    $$('#main, .site-footer').forEach((el) => { el.inert = open; });
    if (open) menu.querySelector('a').focus({ preventScroll: true });
    else if (returnFocus) menuBtn.focus();
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    matchMedia('(min-width: 1080px)').addEventListener('change', (e) => { if (e.matches && !menu.hidden) setMenu(false); });
  }

  /* ---------- Phones: keep "Get a free quote" one tap away once the visitor scrolls ---------- */
  const dock = $('#dock');
  if (dock) {
    const end = $('.band') || $('.site-footer');
    let queued = false;
    placeDock = () => {
      queued = false;
      const typing = document.activeElement && document.activeElement.matches('input, textarea, select');
      const show = scrollY > innerHeight * 0.9 && end.getBoundingClientRect().top > innerHeight && !typing && !$('.notice') && (!menu || menu.hidden);
      dock.classList.toggle('is-shown', show);
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(placeDock); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    document.addEventListener('focusin', queue);
    document.addEventListener('focusout', queue);
    placeDock();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mega && megaOpen()) setMega(false, true);
    if (menu && !menu.hidden) setMenu(false, true);
  });

  /* ---------- Tabs (price lists, example enquiries) ---------- */
  $$('[data-tabs]').forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        select(next, true);
      });
    });
    select(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
  });

  /* ---------- Pricing page: highlight the price list in view ---------- */
  const jump = $('.jump');
  if (jump && 'IntersectionObserver' in window) {
    const links = new Map($$('a[href^="#"]', jump).map((a) => [a.getAttribute('href').slice(1), a]));
    const inView = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) inView.add(en.target.id); else inView.delete(en.target.id); });
      const current = [...links.keys()].filter((id) => inView.has(id)).pop();
      links.forEach((a, id) => { if (id === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    links.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Our work: see a concept with your business name ---------- */
  const nameTry = $('#nameTry');
  if (nameTry) {
    nameTry.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#nameTryName').value.trim().slice(0, 32);
      const url = `/concepts/${encodeURIComponent($('#nameTryConcept').value)}/${name ? `#name=${encodeURIComponent(name)}` : ''}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------- Payment notices (Stripe sends people back to the home page) ---------- */
  const payNote = $('#payNote');
  const PAY = {
    success: ['Payment received. Thank you.', 'Your request and the £4.99 demo fee are with us. We’ll be in touch within 24 hours for a quick chat, and your demo will be ready within 2 working days.', 'ok'],
    already: ['You’ve already paid.', 'Your £4.99 demo fee is paid and your request is with us, so there’s nothing more to do. We’ll be in touch within 24 hours.', 'ok'],
    cancelled: ['Payment cancelled.', 'No money has been taken, and your request hasn’t been sent to us yet. Pay the £4.99 within 2 days to send it.', 'warn'],
    expired: ['That payment link has expired.', 'Please fill in the form again to send a new request.', 'warn'],
    error: ['We couldn’t open the payment page.', `Please try again, or email us at ${EMAIL}.`, 'warn'],
    unavailable: ['Online payment isn’t switched on yet.', `Please email us at ${EMAIL} and we’ll help you straight away.`, 'warn'],
  };
  const payment = params.get('payment');
  if (payment === 'success') count('paid');
  if (payNote && PAY[payment]) {
    const [title, text, tone] = PAY[payment];
    const ref = (params.get('r') || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 40);
    const key = (params.get('k') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 200);
    let more = '';
    if (payment === 'cancelled' && ref && key) more += ` <a href="/api/pay.php?r=${encodeURIComponent(ref)}&amp;k=${encodeURIComponent(key)}">Pay £4.99 and send my request</a>`;
    if (ref && payment !== 'expired') more += ` <span class="pay-note__ref">Your reference: ${esc(ref)}.</span>`;
    payNote.innerHTML = `<strong>${esc(title)}</strong><p>${esc(text)}${more}</p>`;
    payNote.className = `pay-note pay-note--${tone}`;
    payNote.hidden = false;
    history.replaceState(null, '', location.pathname + '#contact');
    requestAnimationFrame(() => payNote.focus({ preventScroll: false }));
  }

  /* ---------- Forms ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const NEEDED = {
    name: 'Please tell us your name.',
    business: 'Please add your business name.',
    email: 'We need an email address to reply to.',
    quoteNeeds: 'Please tell us what you need so we can quote for it.',
  };
  // The server's field names, mapped to the ids the forms use
  const FIELD = { name: 'name', business: 'biz', email: 'email', phone: 'phone', message: 'msg', quoteNeeds: 'quoteNeeds', files: 'files', qName: 'name', qEmail: 'email', qText: 'msg' };
  const prefix = (form) => form.id.replace(/Form$/, '');
  const field = (form, key) => document.getElementById(`${prefix(form)}-${FIELD[key] || key}`);

  function showError(input, msg) {
    const err = document.getElementById(`${input.id}-err`);
    if (err) err.textContent = msg;
    if (input.type === 'file') return;
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
  function check(input) {
    const v = input.value.trim();
    let msg = '';
    if (input.required && !v) msg = NEEDED[input.name] || 'Please fill this in.';
    else if (input.type === 'email' && v && !EMAIL_RE.test(v)) msg = 'That email doesn’t look quite right. Please check it.';
    showError(input, msg);
    return !msg;
  }
  function validate(form) {
    const bad = $$('input[required], textarea[required], input[type="email"]', form).filter((el) => !el.closest('[hidden]') && !check(el));
    if (bad.length) bad[0].focus();
    return bad.length === 0;
  }
  function watch(form) {
    form.addEventListener('focusout', (e) => {
      const el = e.target;
      if (!el.matches('input, textarea') || el.type === 'checkbox' || el.type === 'radio' || el.type === 'file') return;
      if (form.dataset.tried || (el.type === 'email' && el.value.trim())) check(el);
    });
    form.addEventListener('input', (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true') check(e.target);
    });
  }
  function status(form, msg, tone = '') {
    const el = document.getElementById(`${prefix(form)}-status`);
    el.textContent = msg;
    el.className = `form__status${tone ? ' is-' + tone : ''}`;
  }
  function busy(form, on, label) {
    const b = form.querySelector('button[type="submit"]');
    const span = b.querySelector('span');
    if (on) { b.dataset.label = span.textContent; span.textContent = label; } else if (b.dataset.label) span.textContent = b.dataset.label;
    b.disabled = on;
    b.setAttribute('aria-busy', String(on));
  }
  function finish(form, body) {
    const box = document.getElementById(`${prefix(form)}Done`);
    box.innerHTML = `<div class="form-done__icon">${TICK}</div>${body}`;
    form.hidden = true;
    box.hidden = false;
    box.focus();
    box.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  async function post(data) {
    data.set('t', String(Math.round((Date.now() - OPENED) / 1000)));
    const res = await fetch(API, { method: 'POST', body: data, headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    let json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    return { res, json };
  }
  function serverErrors(form, json) {
    let first = null;
    Object.entries(json.fields || {}).forEach(([k, msg]) => {
      const el = field(form, k);
      if (!el) return;
      showError(el, msg);
      if (!first) first = el;
    });
    if (first) first.focus();
  }
  const fallback = () => `Sorry, that didn’t send. Please try again, or email us at ${EMAIL}.`;
  const previewNote = '<p class="fineprint">Preview copy: forms only send from the live website, so nothing was sent.</p>';
  const labelOf = (input) => input.closest('.choice').querySelector('.choice__label').textContent.trim();
  const value = (form, name) => ((form.elements.namedItem(name) || {}).value || '').trim();
  const checked = (form, name) => $$(`input[name="${name}"]:checked`, form);

  /* Free quote: sent as a question (qName, qEmail, qText) */
  const quote = $('form[data-kind="question"]');
  if (quote) {
    watch(quote);
    const interest = params.get('interest');
    if (interest) $$('input[name="interest"]', quote).forEach((i) => { if (i.value === interest) i.checked = true; });
    const tier = (params.get('tier') || '').replace(/[^a-z-]/g, '');
    if (tier) {
      const name = tier.charAt(0).toUpperCase() + tier.slice(1).replace(/-/g, ' ');
      const msg = field(quote, 'message');
      if (msg && !msg.value) msg.value = tier === 'custom'
        ? 'I’d like a social media quote.\nAbout how many posts a month: \nWhich channels: \nHow often to check comments and messages: '
        : tier === 'social-content-machine' ? 'I’m interested in the Social Content Machine.' : `I’m interested in the ${name} social media plan.`;
    }
    if (interest === 'business-os') {
      const msg = field(quote, 'message');
      if (msg && !msg.value) msg.value = 'I’d like to discuss a Business OS.\nWhat my business does: \nThe tools we use now: \nWhat takes up the most admin time: ';
    }
    quote.addEventListener('submit', async (e) => {
      e.preventDefault();
      quote.dataset.tried = '1';
      status(quote, '');
      if (!validate(quote)) { status(quote, 'Please check the highlighted fields.', 'error'); return; }
      const lines = [`Business: ${value(quote, 'business')}`];
      if (value(quote, 'type')) lines.push(`Type of business: ${value(quote, 'type')}`);
      if (value(quote, 'phone')) lines.push(`Phone: ${value(quote, 'phone')}`);
      const wants = checked(quote, 'interest').map(labelOf);
      if (wants.length) lines.push(`Interested in: ${wants.join(', ')}`);
      lines.push('', value(quote, 'message') || '(No message)', '', `Sent from the free quote form on ${location.pathname}`);
      const data = new FormData();
      data.set('form', 'question');
      data.set('km_extra', value(quote, 'km_extra'));
      data.set('qName', value(quote, 'name'));
      data.set('qEmail', value(quote, 'email'));
      data.set('qText', lines.join('\n').slice(0, 3000));
      busy(quote, true, 'Sending…');
      const first = esc(value(quote, 'name').split(/\s+/)[0]);
      const email = esc(value(quote, 'email'));
      const thanks = `<h2>Thanks, ${first}. We’ve got your enquiry.</h2><p>We’ll reply to <strong>${email}</strong> within 24 hours, with honest advice and a clear price.</p><p>Thinking about a website? <a href="#demo">See your demo before you commit</a>.</p>`;
      try {
        const { res, json } = await post(data);
        if (json && json.ok) {
          finish(quote, thanks);
          document.dispatchEvent(new CustomEvent('km:lead'));
          count('quote');
          return;
        }
        if (!json && LOCAL) { finish(quote, thanks + previewNote); return; }
        if (json && json.fields) serverErrors(quote, json);
        status(quote, (json && json.message) || fallback(), 'error');
        if (!json) console.warn('KWM: quote form got HTTP', res.status);
      } catch (err) {
        if (LOCAL) { finish(quote, thanks + previewNote); return; }
        status(quote, fallback(), 'error');
      } finally {
        busy(quote, false);
      }
    });
  }

  /* Website demo: £4.99 through Stripe */
  const demo = $('form[data-kind="demo"]');
  if (demo) {
    watch(demo);
    const p = prefix(demo);
    const panel = document.getElementById(`${p}-quote`);
    const needs = document.getElementById(`${p}-quoteNeeds`);
    const build = document.getElementById(`${p}-build`);
    const quotedRow = document.getElementById(`${p}-quoted-row`);
    const quoted = document.getElementById(`${p}-quoted`);
    const buildDefault = build.textContent;

    const pages = params.get('pages');
    if (pages) $$('input[name="pages"]', demo).forEach((i) => { if (i.value === pages) i.checked = true; });
    if (params.get('plan') === 'care') {
      const msg = field(demo, 'message');
      if (msg && !msg.value) msg.value = 'I’m interested in the Care plan.';
    }

    const update = () => {
      const page = checked(demo, 'pages')[0];
      build.textContent = page && page.value !== 'unsure' ? page.closest('.choice').querySelector('.choice__meta').textContent : buildDefault;
      const booking = (checked(demo, 'booking')[0] || {}).value || 'none';
      const shop = checked(demo, 'need').some((i) => i.value === 'Online shop');
      const items = [];
      if (booking === 'booking') items.push('Online booking');
      if (booking === 'booking-payments') items.push('Booking + taking payments');
      if (shop) items.push('Online shop');
      quotedRow.hidden = !items.length;
      quoted.textContent = items.join(', ');
      panel.hidden = !items.length;
      $$('[data-show]', panel).forEach((fs) => {
        const k = fs.dataset.show;
        fs.hidden = !(k === 'booking' ? booking !== 'none' : k === 'payments' ? booking === 'booking-payments' : shop);
      });
      needs.required = !panel.hidden;
      if (panel.hidden) showError(needs, '');
      return { booking, shop };
    };
    demo.addEventListener('change', (e) => { if (e.target.matches('input[type="radio"], input[type="checkbox"]')) update(); });
    update();

    /* Files: up to 10, 10MB each, 25MB in all. Big phone photos are shrunk first. */
    const input = document.getElementById(`${p}-files`);
    const list = document.getElementById(`${p}-files-list`);
    const drop = input.closest('.drop');
    const MAX_FILES = 10;
    const MAX_EACH = 10 * 1024 * 1024;
    const MAX_ALL = 25 * 1024 * 1024;
    let files = [];
    const size = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);
    async function shrink(file) {
      if (file.type !== 'image/jpeg' || file.size < 1.5 * 1048576 || !('createImageBitmap' in window)) return file;
      try {
        const bmp = await createImageBitmap(file);
        const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bmp.width * scale);
        canvas.height = Math.round(bmp.height * scale);
        canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
        if (bmp.close) bmp.close();
        const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
        return blob && blob.size < file.size ? new File([blob], file.name, { type: 'image/jpeg', lastModified: file.lastModified }) : file;
      } catch (e) {
        return file;
      }
    }
    function render() {
      list.textContent = '';
      files.forEach((file, i) => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        name.textContent = file.name;
        const small = document.createElement('small');
        small.textContent = size(file.size);
        name.append(small);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'drop__remove';
        remove.textContent = 'Remove';
        remove.setAttribute('aria-label', `Remove ${file.name}`);
        remove.addEventListener('click', () => { files.splice(i, 1); render(); input.focus(); });
        li.append(name, remove);
        list.append(li);
      });
    }
    async function add(picked) {
      const err = document.getElementById(`${p}-files-err`);
      let problem = '';
      for (const original of picked) {
        if (files.length >= MAX_FILES) { problem = 'Please send up to 10 files at a time.'; break; }
        if (files.some((f) => f.name === original.name && f.lastModified === original.lastModified)) continue;
        const file = await shrink(original);
        if (file.size > MAX_EACH) { problem = `“${file.name}” is too big. Files can be up to 10MB each.`; continue; }
        if (files.reduce((t, f) => t + f.size, 0) + file.size > MAX_ALL) { problem = 'Your files come to more than 25MB. Please send fewer or smaller files.'; break; }
        files.push(file);
      }
      err.textContent = problem;
      render();
    }
    input.addEventListener('change', () => { const picked = [...input.files]; input.value = ''; add(picked); });
    ['dragenter', 'dragover'].forEach((t) => input.addEventListener(t, () => drop.classList.add('is-over')));
    ['dragleave', 'drop'].forEach((t) => input.addEventListener(t, () => drop.classList.remove('is-over')));

    demo.addEventListener('submit', async (e) => {
      e.preventDefault();
      demo.dataset.tried = '1';
      status(demo, '');
      const { booking, shop } = update();
      if (!validate(demo)) { status(demo, 'Please check the highlighted fields.', 'error'); return; }
      const data = new FormData();
      data.set('form', 'demo');
      data.set('km_extra', value(demo, 'km_extra'));
      ['name', 'business', 'email', 'phone', 'message'].forEach((k) => data.set(k, value(demo, k)));
      data.set('pages', (checked(demo, 'pages')[0] || {}).value || 'unsure');
      checked(demo, 'need').forEach((i) => data.append('need[]', i.value));
      data.set('booking', booking);
      if (booking !== 'none') checked(demo, 'bookWhat').forEach((i) => data.append('bookWhat[]', i.value));
      if (booking === 'booking-payments' && checked(demo, 'payWhen')[0]) data.set('payWhen', checked(demo, 'payWhen')[0].value);
      if (shop && checked(demo, 'products')[0]) data.set('products', checked(demo, 'products')[0].value);
      if (!panel.hidden) data.set('quoteNeeds', needs.value.trim());
      files.forEach((f) => data.append('files[]', f, f.name));
      busy(demo, true, files.length ? 'Sending your files…' : 'Saving your request…');
      const preview = `<h2>Preview: this is where you’d pay.</h2><p>On the live website, you’d now go to Stripe’s secure page to pay £4.99, and your request would be sent to us once it’s paid.</p>${previewNote}`;
      try {
        const { res, json } = await post(data);
        if (json && json.ok && json.pay_url) {
          count('demo');
          status(demo, 'Taking you to secure payment…', 'ok');
          location.assign(json.pay_url);
          return;
        }
        if (json && json.ok) {
          finish(demo, `<h2>Thanks. Your request is with us.</h2><p>We’ll be in touch within 24 hours for a quick chat, and your demo will be ready within 2 working days.</p>`);
          return;
        }
        if (!json && LOCAL) { finish(demo, preview); return; }
        if (json && json.fields) serverErrors(demo, json);
        status(demo, (json && json.message) || fallback(), 'error');
        if (!json) console.warn('KWM: demo form got HTTP', res.status);
      } catch (err) {
        if (LOCAL) { finish(demo, preview); return; }
        status(demo, fallback(), 'error');
      }
      busy(demo, false);
    });
  }

  /* KWM Business OS calculator: only the visitor's own figures, and every sum is shown */
  const calc = $('#osCalc');
  if (calc) {
    const num = (id) => { const v = parseFloat(($('#' + id).value || '').replace(/[£,\s]/g, '')); return Number.isFinite(v) && v >= 0 ? v : null; };
    const gbp = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Math.round(n));
    const one = (n) => (Math.round(n * 10) / 10).toLocaleString('en-GB');
    const set = (id, text) => { $('#' + id).textContent = text; };
    const run = () => {
      const hours = num('calcHours'); const rate = num('calcRate'); let share = num('calcShare');
      const setup = num('calcSetup'); const fee = num('calcMonthly');
      const ready = hours !== null && rate !== null && share !== null && setup !== null && fee !== null && hours > 0 && rate > 0;
      $('#calcRows').hidden = !ready; $('#calcEmpty').hidden = ready;
      if (!ready) { set('calcVerdict', ''); return; }
      share = Math.min(share, 100);
      const monthHours = (hours * 52) / 12;
      const cost = monthHours * rate;
      const supported = cost * (share / 100);
      const diff = supported - fee;
      set('calcOutHours', `${one(monthHours)} hours`); set('calcOutHoursHow', `${one(hours)} hours a week × 52 ÷ 12`);
      set('calcOutCost', gbp(cost)); set('calcOutCostHow', `${one(monthHours)} hours × ${gbp(rate)}`);
      set('calcOutSupported', gbp(supported)); set('calcOutSupportedHow', `${gbp(cost)} × ${one(share)}%`);
      set('calcOutOs', gbp(fee)); set('calcOutOsHow', 'The monthly figure you entered');
      set('calcOutDiff', (diff < 0 ? '−' : '') + gbp(Math.abs(diff))); set('calcOutDiffHow', `${gbp(supported)} − ${gbp(fee)}`);
      if (diff > 0) {
        const months = setup / diff;
        set('calcOutMonths', setup === 0 ? '0' : `About ${one(months)}`); set('calcOutMonthsHow', `${gbp(setup)} ÷ ${gbp(diff)}`);
        set('calcVerdict', `On your figures, the time you think a system could support is worth ${gbp(diff)} a month more than the monthly fee, and would cover the setup in about ${one(months)} months. This is an illustration, not a forecast or a promise.`);
      } else {
        set('calcOutMonths', 'Not on these figures'); set('calcOutMonthsHow', 'The difference a month isn’t above £0');
        set('calcVerdict', 'On your figures, the monthly fee is more than the value of the time you think a system could support. A Business OS may not be the right fit yet, and one of our smaller services might suit you better. We’ll tell you honestly either way.');
      }
    };
    calc.addEventListener('input', run);
    calc.addEventListener('submit', (e) => e.preventDefault());
    run();
  }
})();
