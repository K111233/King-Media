/* ==========================================================================
   KING MEDIA — main.js
   Zero-dependency motion + interaction engine.
   The render loop sleeps when nothing is moving, all scroll maths runs from
   cached measurements, and every effect respects reduced motion and the
   on-page "Pause motion" control.
   ========================================================================== */
(() => {
  'use strict';

  /* The one inbox for enquiries. Used everywhere via [data-email]. */
  const CONTACT_EMAIL = 'enquiries@kingmedia.uk';

  /* Forms post to the PHP handler on the server. A local preview with no PHP
     server falls back to an on-page summary, and nothing is sent. */
  const FORM_ENDPOINT = 'api/submit.php';
  const PAGE_START = Date.now();
  const LOCAL_PREVIEW = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const mq = q => { try { return matchMedia(q).matches; } catch (e) { return false; } };

  const reduced = mq('(prefers-reduced-motion: reduce)');
  const finePointer = mq('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const body = document.body;
  const main = $('#main');
  const footer = $('#siteFooter');

  let vw = innerWidth;
  let vh = innerHeight;
  let motionOff = root.classList.contains('motion-off');
  const still = () => reduced || motionOff;
  let consentMemory = null;
  const consent = () => { try { return localStorage.getItem('km-consent') || consentMemory; } catch (e) { return consentMemory; } };

  /* ---------------------------------------------------------------------
     SPLIT TEXT
     --------------------------------------------------------------------- */
  let charIndex = 0;
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = text;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { visual.appendChild(document.createTextNode(' ')); return; }
      const word = document.createElement('span');
      word.className = 'split-word';
      [...part].forEach(ch => {
        const mask = document.createElement('span');
        mask.className = 'split-mask';
        const c = document.createElement('span');
        c.className = 'split-char';
        c.style.setProperty('--i', charIndex++);
        c.textContent = ch;
        mask.appendChild(c);
        word.appendChild(mask);
      });
      visual.appendChild(word);
    });
    el.append(sr, visual);
  }

  function wrapWords(el, makeWrapper) {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            frag.appendChild(makeWrapper(part, i++));
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  }

  $$('[data-split]').forEach(el => {
    if (el.classList.contains('hero__em')) el.style.setProperty('--d', '160ms');
    splitChars(el);
  });

  $$('[data-split-lines]').forEach(el => {
    wrapWords(el, (word, i) => {
      const outer = document.createElement('span');
      outer.className = 'split-line';
      const inner = document.createElement('span');
      inner.className = 'split-line__inner';
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      outer.appendChild(inner);
      return outer;
    });
  });

  const manifestoWords = [];
  $$('[data-words]').forEach(el => {
    wrapWords(el, word => {
      const s = document.createElement('span');
      s.className = 'word';
      s.textContent = word;
      manifestoWords.push(s);
      return s;
    });
  });

  $$('.fw--media span').forEach((s, i) => s.style.setProperty('--fd', `${i * 0.04}s`));

  /* ---------------------------------------------------------------------
     LOADER
     --------------------------------------------------------------------- */
  const brand = $('.brand');
  function runLoader() {
    const loader = $('#loader');
    return new Promise(resolve => {
      const skipNow = !loader || reduced || motionOff || !!location.hash;
      if (skipNow) {
        loader && loader.remove();
        body.classList.remove('is-loading');
        resolve();
        return;
      }
      let seen = false;
      try { seen = sessionStorage.getItem('km-seen') === '1'; sessionStorage.setItem('km-seen', '1'); } catch (e) { /* storage blocked */ }
      if (seen) loader.classList.add('is-quick');
      const duration = seen ? 450 : 1000;
      let skipped = false;
      const skip = () => { skipped = true; };
      addEventListener('pointerdown', skip, { once: true });
      addEventListener('keydown', skip, { once: true });
      setTimeout(() => body.classList.remove('is-loading'), 600);
      const count = $('#loaderCount');
      let fontsDone = false;
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fontsDone = true; });
      setTimeout(() => { fontsDone = true; }, 1200);
      const start = performance.now();
      const tick = now => {
        const t = clamp((now - start) / duration);
        count.textContent = Math.round((1 - Math.pow(1 - t, 2)) * 100);
        if (!skipped && (t < 1 || !fontsDone)) { requestAnimationFrame(tick); return; }
        count.textContent = '100';
        removeEventListener('pointerdown', skip);
        removeEventListener('keydown', skip);
        loader.classList.add('is-done');
        body.classList.remove('is-loading');
        setTimeout(resolve, 300);
        setTimeout(() => loader.remove(), 1500);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------------------------------------------------------------------
     RENDER LOOP (sleeps when idle)
     --------------------------------------------------------------------- */
  let looping = false;
  let lastActivity = 0;
  let lastT = performance.now();
  function wake() {
    lastActivity = performance.now();
    if (!looping) { looping = true; lastT = performance.now(); requestAnimationFrame(frame); }
  }

  /* ---------------------------------------------------------------------
     MAGNETIC BUTTONS
     --------------------------------------------------------------------- */
  if (finePointer && !reduced) {
    $$('[data-magnetic]').forEach(el => {
      const strength = el.classList.contains('btn--lg') ? .3 : .24;
      let r = null;
      el.addEventListener('pointerenter', () => { r = el.getBoundingClientRect(); });
      el.addEventListener('pointermove', e => {
        if (still()) return;
        r = r || el.getBoundingClientRect();
        el.style.setProperty('--bx', `${(e.clientX - (r.left + r.width / 2)) * strength}px`);
        el.style.setProperty('--by', `${(e.clientY - (r.top + r.height / 2)) * strength}px`);
      });
      el.addEventListener('pointerleave', () => { r = null; el.style.setProperty('--bx', '0px'); el.style.setProperty('--by', '0px'); });
    });
  }

  /* ---------------------------------------------------------------------
     HEADER, NAV LOCK, SURFACE + ACTIVE SECTION
     --------------------------------------------------------------------- */
  const header = $('#siteHeader');
  let navLock = false;
  let navLockTimer = 0;
  let navLockHide = false;
  function releaseNavLock() { navLock = false; if (!navLockHide) header.classList.remove('is-hidden'); navLockHide = false; }
  function lockNav(ms = 1500, hide = false) {
    navLock = true;
    navLockHide = hide && vw < 1100;
    header.classList.toggle('is-hidden', navLockHide);
    clearTimeout(navLockTimer);
    navLockTimer = setTimeout(releaseNavLock, ms);
  }
  document.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) lockNav(); });
  if ('onscrollend' in window) addEventListener('scrollend', () => { if (navLock) { clearTimeout(navLockTimer); navLockTimer = setTimeout(releaseNavLock, 120); } });

  const lightSections = new Set();
  const surfaceObserver = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) lightSections.add(en.target); else lightSections.delete(en.target); });
    header.classList.toggle('on-light', lightSections.size > 0);
  }, { rootMargin: '-4% 0px -94% 0px' });
  $$('[data-surface="light"]').forEach(s => surfaceObserver.observe(s));

  const navLinks = $$('.primary-nav a, .menu-overlay__nav a');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach(a => { if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach(s => sectionObserver.observe(s));

  // Moves focus to a container for screen readers and keyboards, without leaving it clickable-focusable
  function focusSpot(el) {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
    }
    el.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------------------
     MENU (modal dialog)
     --------------------------------------------------------------------- */
  const menuToggle = $('#menuToggle');
  const menu = $('#menuOverlay');
  const dock = $('#dock');
  let menuOpen = false;
  let menuTimer = 0;
  $$('.menu-overlay__nav a').forEach((a, i) => a.style.setProperty('--d', `${i * 0.05}s`));
  const menuFocusables = () => $$('a, button', menu).filter(el => !el.closest('[hidden]'));

  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    clearTimeout(menuTimer);
    menuToggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
    root.classList.toggle('is-menu-open', open);
    [main, footer, dock].forEach(el => { if (el) el.inert = open; });
    if (open) {
      menu.hidden = false;
      void menu.offsetWidth;
      menu.classList.add('is-open');
      root.style.overflow = 'hidden';
      header.classList.remove('is-hidden');
      menuTimer = setTimeout(() => { const f = menuFocusables()[0]; if (f) f.focus({ preventScroll: true }); }, reduced ? 0 : 320);
    } else {
      menu.classList.remove('is-open');
      root.style.overflow = '';
      menuTimer = setTimeout(() => { if (!menuOpen) menu.hidden = true; }, reduced ? 0 : 800);
    }
    updateDock();
  }
  menuToggle.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  brand.addEventListener('click', () => { if (menuOpen) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (!menuOpen) return;
    if (e.key === 'Escape') { setMenu(false); menuToggle.focus(); return; }
    if (e.key !== 'Tab') return;
    const items = menuFocusables();
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (!e.shiftKey && active === last) { e.preventDefault(); menuToggle.focus(); }
    else if (!e.shiftKey && active === menuToggle) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && active === first) { e.preventDefault(); menuToggle.focus(); }
    else if (e.shiftKey && active === menuToggle) { e.preventDefault(); last.focus(); }
    else if (!menu.contains(active)) { e.preventDefault(); first.focus(); }
  });

  const deskMQ = matchMedia('(min-width: 1100px)');
  const onDesk = e => {
    if (!e.matches || !menuOpen) return;
    const hadFocus = menu.contains(document.activeElement);
    setMenu(false);
    if (hadFocus) brand.focus({ preventScroll: true });
  };
  if (deskMQ.addEventListener) deskMQ.addEventListener('change', onDesk);
  else if (deskMQ.addListener) deskMQ.addListener(onDesk);

  /* ---------------------------------------------------------------------
     MOBILE DOCK
     --------------------------------------------------------------------- */
  let pastHero = false;
  let nearEnd = false;
  let inBuild = false;
  let typing = false; // the phone keyboard is up, so the dock would sit on top of it
  let quietFocus = false; // set while the page itself moves focus (no keyboard appears for that)
  function updateDock() {
    if (!dock) return;
    const on = pastHero && !nearEnd && !menuOpen && !inBuild && !typing;
    dock.classList.toggle('is-on', on);
    dock.inert = !on;
  }
  if (dock) {
    dock.hidden = false;
    dock.inert = true;
    new IntersectionObserver(([en]) => {
      pastHero = !en.isIntersecting && en.boundingClientRect.top < 0;
      updateDock();
    }, { rootMargin: '0px 0px 100000px 0px' }).observe($('.hero__actions'));
    const endZones = new Set();
    const endObserver = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) endZones.add(en.target); else endZones.delete(en.target); });
      nearEnd = endZones.size > 0;
      updateDock();
    });
    [$('#askForm'), $('#contact'), footer].forEach(el => { if (el) endObserver.observe(el); });
    const isTyping = el => el && el.matches && el.matches('textarea, select, input:not([type="radio"]):not([type="checkbox"]):not([type="file"]):not([type="button"]):not([type="submit"])');
    document.addEventListener('focusin', e => { if (!quietFocus && isTyping(e.target) !== typing) { typing = !typing; updateDock(); } });
    document.addEventListener('focusout', e => { if (typing && !isTyping(e.relatedTarget)) { typing = false; updateDock(); } });
  }

  /* ---------------------------------------------------------------------
     REVEALS & COUNTERS
     --------------------------------------------------------------------- */
  const groups = new Map();
  $$('.reveal').forEach(el => {
    const p = el.parentElement;
    const n = groups.get(p) || 0;
    el.style.setProperty('--rd', `${Math.min(n, 4) * 60}ms`);
    el.dataset.rd = String(Math.min(n, 4) * 60);
    groups.set(p, n + 1);
  });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-in');
      revealObserver.unobserve(el);
      if (el.classList.contains('reveal')) setTimeout(() => el.classList.add('is-settled'), 1300 + (Number(el.dataset.rd) || 0));
    });
  }, { threshold: .05, rootMargin: '0px 0px -2% 0px' });
  $$('.reveal, [data-split-lines], #footerWord').forEach(el => revealObserver.observe(el));

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const from = target === 0 ? 99 : 0;
    if (still()) { el.textContent = target; return; }
    const start = performance.now();
    const dur = target === 0 ? 1400 : 1800;
    const run = now => {
      const t = clamp((now - start) / dur);
      el.textContent = Math.round(lerp(from, target, easeOutExpo(t)));
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => {
    if (!still()) el.textContent = el.dataset.count === '0' ? 99 : 0;
    countObserver.observe(el);
  });

  /* Off-screen sections pause their CSS animations */
  const pauseObserver = new IntersectionObserver(entries => {
    entries.forEach(en => en.target.classList.toggle('is-offscreen', !en.isIntersecting));
  }, { rootMargin: '120px 0px' });
  $$('.hero, .services, #build, .concepts, .contact').forEach(el => pauseObserver.observe(el));

  /* ---------------------------------------------------------------------
     DOMAIN TYPEWRITER (pauses off-screen / when motion is paused)
     --------------------------------------------------------------------- */
  const typed = $('.domain__typed');
  if (typed) {
    const words = typed.dataset.typeWords.split('|');
    typed.textContent = words[0];
    if (!reduced) {
      let visible = false;
      let running = false;
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const until = async () => { while (!visible || motionOff) await wait(400); };
      const typeLoop = async () => {
        running = true;
        for (let w = 0; ; w = (w + 1) % words.length) {
          const word = words[w];
          for (let i = 1; i <= word.length; i++) { await until(); typed.textContent = word.slice(0, i); await wait(65 + Math.random() * 50); }
          await wait(1800);
          for (let i = word.length; i >= 0; i--) { await until(); typed.textContent = word.slice(0, i); await wait(28); }
          await wait(300);
        }
      };
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        if (visible && !running) typeLoop();
      }).observe(typed);
    }
  }

  /* ---------------------------------------------------------------------
     TILT + SPOTLIGHT
     --------------------------------------------------------------------- */
  if (finePointer && !reduced) {
    $$('[data-tilt]').forEach(el => {
      const max = el.hasAttribute('data-tilt-soft') ? 3 : 6;
      let r = null;
      el.addEventListener('pointerenter', () => { r = el.getBoundingClientRect(); });
      el.addEventListener('pointermove', e => {
        r = r || el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        if (still()) return;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${(px - .5) * max * 2}deg`);
        el.style.setProperty('--rx', `${(.5 - py) * max * 2}deg`);
      });
      el.addEventListener('pointerleave', () => {
        r = null;
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------------------------------------------------------------
     CONCEPT PREVIEWS (real buttons, any pointer)
     --------------------------------------------------------------------- */
  $$('.concept__toggle').forEach(btn => btn.addEventListener('click', () => {
    const frame = btn.closest('.concept__frame');
    const on = !frame.classList.contains('is-touched');
    frame.classList.toggle('is-touched', on);
    btn.setAttribute('aria-pressed', String(on));
    const hint = $('.concept__hint', frame);
    if (hint) hint.textContent = on ? 'Tap to stop' : 'Tap to preview';
  }));
  // Each preview scrolls exactly to the bottom of its mini-site, whatever the screen size
  const csShift = () => $$('.concept__screen').forEach(scr => {
    const cs = scr.firstElementChild;
    if (cs) cs.style.setProperty('--cs-shift', `${-Math.max(0, cs.offsetHeight - scr.clientHeight)}px`);
  });
  csShift();
  if ('ResizeObserver' in window) {
    const csRo = new ResizeObserver(csShift);
    $$('.concept__screen').forEach(scr => { csRo.observe(scr); if (scr.firstElementChild) csRo.observe(scr.firstElementChild); });
  } else addEventListener('resize', csShift);

  /* ---------------------------------------------------------------------
     BEFORE / AFTER SLIDER (drag, tap, arrow keys; vertical swipes still scroll)
     --------------------------------------------------------------------- */
  $$('[data-ba]').forEach(ba => {
    const range = $('.ba__range', ba);
    const set = v => {
      const pct = clamp(v, 0, 100);
      ba.style.setProperty('--pos', `${pct}%`);
      range.value = String(Math.round(pct));
      range.setAttribute('aria-valuetext', `${Math.round(pct)}% before, ${100 - Math.round(pct)}% after`);
    };
    const fromEvent = e => { const r = ba.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    let dragging = false;
    ba.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      ba.classList.remove('is-hinting');
      ba.setPointerCapture(e.pointerId);
      set(fromEvent(e));
    });
    ba.addEventListener('pointermove', e => { if (dragging) set(fromEvent(e)); });
    const end = () => { dragging = false; };
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
    range.addEventListener('input', () => { ba.classList.remove('is-hinting'); set(Number(range.value)); });
    set(50);
    // One gentle sweep the first time it scrolls into view, so people know it moves
    if (!still()) {
      new IntersectionObserver(([en], obs) => {
        if (!en.isIntersecting) return;
        obs.disconnect();
        ba.classList.add('is-hinting');
        const steps = [28, 72, 50];
        steps.forEach((v, i) => setTimeout(() => { if (ba.classList.contains('is-hinting')) set(v); }, 400 + i * 950));
        setTimeout(() => ba.classList.remove('is-hinting'), 400 + steps.length * 950);
      }, { threshold: .6 }).observe(ba);
    }
  });

  /* ---------------------------------------------------------------------
     DEMO SHOP BASKET (Wick & Wild concept: nothing is for sale or sent)
     --------------------------------------------------------------------- */
  $$('[data-shop]').forEach(shop => {
    const basket = $('[data-basket]', shop);
    const count = $('.ww-count', shop);
    const toast = $('.ww-toast', shop);
    const FREE_DELIVERY = 40;
    let items = 0, total = 0, toastTimer = 0;
    const gbp = n => `£${n}`;
    const plural = n => `${n} item${n === 1 ? '' : 's'}`;
    const say = (main, note) => {
      const small = document.createElement('small');
      small.textContent = note;
      toast.replaceChildren(document.createTextNode(`${main} `), small);
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-on');
        setTimeout(() => { if (!toast.classList.contains('is-on')) toast.replaceChildren(); }, 450);
      }, 3600);
    };
    const bump = el => {
      if (still()) return;
      el.classList.remove('is-bump');
      void el.offsetWidth; // restart the animation on quick repeat taps
      el.classList.add('is-bump');
    };
    $$('[data-add]', shop).forEach(btn => {
      const label = $('.ww-add__label', btn);
      let resetTimer = 0;
      btn.addEventListener('click', () => {
        const before = total;
        items += 1;
        total += Number(btn.dataset.price);
        count.textContent = String(items);
        shop.classList.add('has-items');
        basket.setAttribute('aria-label', `Demo basket, ${plural(items)}, ${gbp(total)}`);
        bump(count);
        bump(basket);
        btn.classList.add('is-added');
        label.textContent = 'Added';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { btn.classList.remove('is-added'); label.textContent = 'Add'; }, 1400);
        const unlocked = before < FREE_DELIVERY && total >= FREE_DELIVERY;
        say(`${btn.dataset.add} added. ${plural(items)}, ${gbp(total)}.`,
          unlocked ? 'Free delivery unlocked. Demo only, nothing is for sale.' : 'Demo only, nothing is for sale.');
      });
    });
    basket.addEventListener('click', () => {
      if (!items) { say('Your basket is empty.', 'Add a candle to try it out.'); return; }
      say(`${plural(items)}, ${gbp(total)}.`, 'On a real shop, secure checkout opens here.');
    });
  });

  /* ---------------------------------------------------------------------
     PRICING MODEL (one place to change prices)
     --------------------------------------------------------------------- */
  const DEMO_FEE = '£4.99';
  const MONTHLY_1_2 = '£49.99 a month (12-month minimum), or £39.99 a month on the 5-year plan';
  const MONTHLY_3PLUS = '£59.99 a month (12-month minimum), or £49.99 a month on the 5-year plan';
  const TIERS = {
    '1': { label: '1 page', build: '£494.99', monthly: MONTHLY_1_2 },
    '2': { label: '2 pages', build: '£899.99', monthly: MONTHLY_1_2 },
    '3': { label: '3 pages', build: '£1,199.99', monthly: MONTHLY_3PLUS },
    '4+': { label: '4+ pages', build: '£1,449.99', monthly: MONTHLY_3PLUS },
  };

  /* ---------------------------------------------------------------------
     ACCORDION
     --------------------------------------------------------------------- */
  $$('.acc__btn').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.acc');
    const open = btn.getAttribute('aria-expanded') !== 'true';
    $$('.acc.is-open').forEach(other => {
      if (other === item) return;
      other.classList.remove('is-open');
      $('.acc__btn', other).setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }));

  /* ---------------------------------------------------------------------
     SHARED FIELD ERRORS
     --------------------------------------------------------------------- */
  function setError(input, msg) {
    const fieldEl = input.closest('.field');
    const err = fieldEl && $('.field__error', fieldEl);
    if (fieldEl) fieldEl.classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    const starErr = input.id === 'starName' ? $('#starErr') : null;
    if (starErr) starErr.textContent = msg;
  }

  /* ---------------------------------------------------------------------
     SENDING FORMS (XHR rather than fetch, so big uploads can show progress)
     --------------------------------------------------------------------- */
  function postForm(fd, onProgress) {
    fd.set('t', String(Math.round((Date.now() - PAGE_START) / 1000)));
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', FORM_ENDPOINT);
      xhr.timeout = 180000;
      xhr.setRequestHeader('Accept', 'application/json');
      if (onProgress) xhr.upload.addEventListener('progress', e => { if (e.lengthComputable) onProgress(e.loaded / e.total); });
      xhr.addEventListener('load', () => {
        let data = null;
        try { data = JSON.parse(xhr.responseText); } catch (err) { /* not our handler */ }
        resolve({ status: xhr.status, data });
      });
      xhr.addEventListener('error', () => resolve({ status: 0, data: null }));
      xhr.addEventListener('timeout', () => resolve({ status: 0, data: null }));
      xhr.send(fd);
    });
  }
  // A local preview served without PHP has no handler: show the summary only
  const previewOnly = res => LOCAL_PREVIEW && !res.data && [0, 404, 405, 501].includes(res.status);
  function setBusy(btn, busy, label) {
    const l = $('.btn__label', btn);
    if (!btn.dataset.label) btn.dataset.label = l.textContent;
    btn.disabled = busy;
    btn.classList.toggle('is-busy', busy);
    btn.setAttribute('aria-busy', String(busy));
    l.textContent = busy ? label : btn.dataset.label;
  }

  /* ---------------------------------------------------------------------
     DEMO FORM: booking / payments / shop quote route, files, sending
     --------------------------------------------------------------------- */
  const form = $('#demoForm');
  const formDone = $('#formDone');
  const quotePanel = $('#quotePanel');
  const bookWhat = $('#bookWhat');
  const payQ = $('#payQ');
  const shopQ = $('#shopQ');
  const fQuote = $('#fQuote');
  const fQuoteHint = $('#fQuoteHint');
  const needShop = $('#needShop');
  const needStatus = $('#needStatus');
  const HINT_BOOKING = fQuoteHint ? fQuoteHint.textContent : '';
  const HINT_SHOP = 'For example: what you sell, roughly how many products, how you deliver, or any shop platform you use now.';

  const bookingValue = () => { const r = $('input[name="booking"]:checked', form); return r ? r.value : 'none'; };
  function syncQuote() {
    const bk = bookingValue();
    const shop = needShop.checked;
    quotePanel.hidden = bk === 'none' && !shop;
    bookWhat.hidden = bk === 'none';
    payQ.hidden = bk !== 'booking-payments';
    shopQ.hidden = !shop;
    fQuote.required = !quotePanel.hidden;
    fQuoteHint.textContent = bk === 'none' && shop ? HINT_SHOP : HINT_BOOKING;
    if (quotePanel.hidden) { setError(fQuote, ''); if (typeof refreshStatus === 'function') refreshStatus(); }
  }

  const rules = {
    name: v => (v.trim() ? '' : 'Please tell us your name.'),
    business: v => (v.trim() ? '' : 'Please add your business name.'),
    email: v => (!v.trim() ? 'We need an email address to send your demo to.'
      : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email doesn’t look quite right. Please check it and try again.'),
    quoteNeeds: v => (!quotePanel.hidden && !v.trim() ? 'Please tell us what you need so we can quote for it.' : ''),
  };
  function refreshStatus() {
    const st = $('#formStatus');
    if (!st || !st.classList.contains('is-err')) return;
    const n = $$('.field.has-error', form).length;
    st.textContent = n === 0 ? '' : n === 1 ? 'One thing to fix, highlighted above.' : `${n} things to fix, highlighted above.`;
    if (n === 0) st.className = 'form__status';
  }
  const check = input => {
    const rule = rules[input.name];
    if (!rule) return true;
    const msg = rule(input.value);
    setError(input, msg);
    refreshStatus();
    return !msg;
  };

  if (form) {
    form.addEventListener('change', e => { if (e.target.name === 'booking' || e.target === needShop) syncQuote(); });
    [...$$('input[required]', form), fQuote].forEach(input => {
      input.addEventListener('blur', () => check(input));
      input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) check(input); });
    });

    const status = $('#formStatus');
    const submitBtn = $('#demoSubmit');
    // Back from Stripe with the browser's Back button: Safari restores the page as it was, so un-stick the button
    let lastPayUrl = '';
    addEventListener('pageshow', e => {
      if (!e.persisted || !submitBtn.disabled) return;
      setBusy(submitBtn, false);
      if (!lastPayUrl) return;
      submitBtn.dataset.payUrl = lastPayUrl;
      $('.btn__label', submitBtn).textContent = 'Pay £4.99 to send it';
      status.className = 'form__status';
      status.textContent = 'Your details are saved but not paid for yet. Press the button to pay the £4.99 and send them to us.';
    });
    // Changing anything means sending the request again, rather than paying for the saved one
    form.addEventListener('input', () => {
      if (!submitBtn.dataset.payUrl) return;
      delete submitBtn.dataset.payUrl;
      $('.btn__label', submitBtn).textContent = submitBtn.dataset.label || 'Request my £4.99 demo';
      status.textContent = '';
    });
    const serverFields = { name: '#fName', business: '#fBiz', email: '#fEmail', quoteNeeds: '#fQuote' };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submitBtn.disabled) return;
      if (submitBtn.dataset.payUrl) { setBusy(submitBtn, true, 'Opening secure payment…'); location.assign(submitBtn.dataset.payUrl); return; }
      const inputs = [...$$('input[required]', form), fQuote];
      const invalid = inputs.filter(i => !check(i));
      if (invalid.length) {
        invalid[0].focus();
        status.className = 'form__status is-err';
        status.textContent = invalid.length === 1 ? 'One thing to fix, highlighted above.' : `${invalid.length} things to fix, highlighted above.`;
        return;
      }
      status.className = 'form__status';
      status.textContent = 'Sending your request…';
      setBusy(submitBtn, true, 'Sending…');
      while (dzBusy) await new Promise(r => setTimeout(r, 120)); // photos still being shrunk
      const fd = new FormData(form);
      fd.delete('files');
      dzFiles.forEach(f => fd.append('files[]', f, f.name));
      ['need', 'bookWhat'].forEach(k => { const v = fd.getAll(k); fd.delete(k); v.forEach(x => fd.append(`${k}[]`, x)); });
      fd.set('form', 'demo');
      const label = $('.btn__label', submitBtn);
      const res = await postForm(fd, dzFiles.length ? p => { label.textContent = p < 1 ? `Uploading ${Math.round(p * 100)}%` : 'Sending…'; } : null);
      if (res.data && res.data.ok && res.data.pay_required && res.data.pay_url) {
        // Saved on our side: now the £4.99 at Stripe. We're only emailed once it's paid.
        label.textContent = 'Opening secure payment…';
        status.textContent = 'Taking you to Stripe to pay the £4.99…';
        lastPayUrl = res.data.pay_url;
        location.assign(res.data.pay_url);
        return;
      }
      setBusy(submitBtn, false);
      if ((res.data && res.data.ok) || previewOnly(res)) {
        status.textContent = '';
        showDone(res.data && res.data.ok ? 'sent' : 'preview', (res.data && res.data.pay_url) || '');
        return;
      }
      let first = null;
      Object.entries((res.data && res.data.fields) || {}).forEach(([k, msg]) => {
        if (k === 'files') { dzErr.textContent = msg; first = first || dzInput; return; }
        const el = serverFields[k] && $(serverFields[k]);
        if (el) { setError(el, msg); first = first || el; }
      });
      status.className = 'form__status is-err';
      status.textContent = res.data && res.data.message
        ? `${res.data.message}${res.status === 422 ? '' : ` Please try again, or email us at ${CONTACT_EMAIL}.`}`
        : `Sorry, your request didn’t send. Please check your connection and try again, or email us at ${CONTACT_EMAIL}.`;
      if (first) first.focus();
    });

    const li = text => { const el = document.createElement('li'); el.textContent = text; return el; };
    function showDone(mode, payUrl) {
      const data = new FormData(form);
      const first = String(data.get('name')).trim().split(/\s+/)[0];
      const sent = mode === 'sent';
      $('#doneTitle').textContent = sent ? `Thanks, ${first}. We’ve got your request.` : `Thanks, ${first}. Here’s what you asked for.`;
      $('#doneNote').textContent = sent
        ? `We’ll be in touch within 24 hours to arrange a quick chat, and your demo will be ready within 2 working days. If you need us sooner, email ${CONTACT_EMAIL}.`
        : 'This is a preview, so nothing has been sent and no payment has been taken.';
      $('#donePay').hidden = !payUrl;
      if (payUrl) $('#donePayBtn').href = payUrl;
      $('#doneEdit').hidden = sent; // editing after sending would send it twice
      $('.btn__label', $('#doneReset')).textContent = sent ? 'Send another request' : 'Start again';
      const tier = TIERS[data.get('pages')];
      $('#doneIncluded').replaceChildren(
        li(`Your demo: ${DEMO_FEE}, with no obligation to go ahead`),
        li(tier ? `Design & build (${tier.label}): ${tier.build} one-off, paid after you approve your demo` : 'Design & build: from £494.99, depending on how many pages you need (we’ll help you decide)'),
        li(tier ? `Management: ${tier.monthly}` : 'Management: from £39.99 a month, depending on pages and plan'),
        li('Up to 5 website changes a month, big or small'),
      );
      const q = [];
      const bk = bookingValue();
      if (bk === 'booking') q.push('Online booking system');
      if (bk === 'booking-payments') q.push(`Online booking + taking payments${data.get('payWhen') ? ` (${String(data.get('payWhen')).toLowerCase()})` : ''}`);
      const what = data.getAll('bookWhat');
      if (bk !== 'none' && what.length) q.push(`Customers book: ${what.join(', ').toLowerCase()}`);
      const prod = data.get('products');
      if (needShop.checked) q.push(`Online shop${prod ? (prod === 'Not sure' ? ' (number of products not sure yet)' : ` (${prod} products)`) : ''}`);
      const notes = String(data.get('quoteNeeds') || '').trim();
      if (q.length && notes) q.push(`Your notes: “${notes}”`);
      if (dzFiles.length) q.push(`Files attached: ${dzFiles.length} (${dzFiles.map(f => f.name).slice(0, 4).join(', ')}${dzFiles.length > 4 ? '…' : ''})`);
      $('#doneQuoted').replaceChildren(...q.map(li));
      $('#doneQuotedWrap').hidden = q.length === 0;
      $('#doneQuotedWrap .form-done__tag').textContent = q.some(x => !x.startsWith('Files attached')) ? 'We’ll quote for this' : 'Also in your request';
      form.hidden = true;
      formDone.hidden = false;
      lockNav();
      formDone.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      $('#doneTitle').focus({ preventScroll: true });
    }
    $('#doneEdit').addEventListener('click', () => { formDone.hidden = true; form.hidden = false; lockNav(); form.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }); $('#fName').focus({ preventScroll: true }); });
    $('#doneReset').addEventListener('click', () => {
      form.reset();
      $$('input, textarea', form).forEach(i => { if (i.closest('.field') && rules[i.name]) setError(i, ''); });
      syncQuote();
      formDone.hidden = true;
      form.hidden = false;
      lockNav();
      form.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      $('#fName').focus({ preventScroll: true });
    });
    syncQuote();
  }

  /* ---------------------------------------------------------------------
     "CHOOSE N PAGES" BUTTONS pre-select the package in the demo form
     --------------------------------------------------------------------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-pages]');
    if (!a || !form) return;
    e.preventDefault();
    const r = $(`input[name="pages"][value="${a.dataset.pages}"]`, form);
    if (r) r.checked = true;
    if (form.hidden) { formDone.hidden = true; form.hidden = false; }
    lockNav();
    $('#pagesSet').scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#contact');
    needStatus.textContent = `${TIERS[a.dataset.pages].label} (${TIERS[a.dataset.pages].build}) selected. Now tell us about your business.`;
    setTimeout(() => { if (r) r.focus({ preventScroll: true }); }, reduced ? 60 : 900);
  });

  /* On phones the contact intro is a long scroll above the form, so "Get your demo" goes straight to the form */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href="#contact"]');
    if (!a || !form || vw > 720 || a.dataset.pages || a.id === 'donePayBtn' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    lockNav();
    const target = form.hidden ? formDone : form;
    target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#contact');
    focusSpot(form.hidden ? $('#doneTitle') : form); // so screen readers and keyboards land there too
  });

  /* ---------------------------------------------------------------------
     FILE DROP BOX (logo, colours, photos), sent with the demo request
     --------------------------------------------------------------------- */
  const dropzone = $('#dropzone');
  const dzInput = $('#fFiles');
  const dzList = $('#dzList');
  const dzErr = $('#dzErr');
  const dzStatus = $('#dzStatus');
  const DZ_MAX_FILES = 10;
  const DZ_MAX_BYTES = 10 * 1024 * 1024;
  const DZ_MAX_TOTAL = 25 * 1024 * 1024;
  const SHRINK_OVER = 2.5 * 1024 * 1024;
  const SHRINK_EDGE = 2560;
  let dzFiles = [];
  let dzBusy = false;
  // Big phone photos are shrunk to a web-friendly size before upload; logos and documents are sent as they are
  function shrinkPhoto(f) {
    return new Promise(resolve => {
      if (!/^image\/(jpeg|webp)$/.test(f.type) || f.size <= SHRINK_OVER) { resolve(f); return; }
      const url = URL.createObjectURL(f);
      const img = new Image();
      const done = out => { URL.revokeObjectURL(url); resolve(out); };
      img.onload = () => {
        try {
          const k = Math.min(1, SHRINK_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * k);
          c.height = Math.round(img.naturalHeight * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(b => done(b && b.size < f.size ? new File([b], f.name.replace(/\.(jpe?g|webp)$/i, '') + '.jpg', { type: 'image/jpeg', lastModified: f.lastModified }) : f), 'image/jpeg', .86);
        } catch (err) { done(f); }
      };
      img.onerror = () => done(f);
      img.src = url;
    });
  }
  const fmtSize = b => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))}KB` : `${(b / 1048576).toFixed(1)}MB`);
  function syncInput() {
    try { const dt = new DataTransfer(); dzFiles.forEach(f => dt.items.add(f)); dzInput.files = dt.files; } catch (err) { /* older browsers: list still shows */ }
  }
  function renderFiles() {
    dzList.querySelectorAll('img').forEach(im => URL.revokeObjectURL(im.src));
    dzList.replaceChildren(...dzFiles.map((f, i) => {
      const li = document.createElement('li');
      li.className = 'dz-file';
      if (f.type.startsWith('image/')) {
        const im = document.createElement('img');
        im.src = URL.createObjectURL(f);
        im.alt = '';
        li.append(im);
      } else {
        const ic = document.createElement('span');
        ic.className = 'dz-file__ext';
        ic.setAttribute('aria-hidden', 'true');
        ic.textContent = (f.name.split('.').pop() || 'file').slice(0, 4).toUpperCase();
        li.append(ic);
      }
      const meta = document.createElement('span');
      meta.className = 'dz-file__meta';
      const nm = document.createElement('b'); nm.textContent = f.name;
      const sz = document.createElement('small'); sz.textContent = fmtSize(f.size);
      meta.append(nm, sz);
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'dz-file__rm';
      rm.setAttribute('aria-label', `Remove ${f.name}`);
      rm.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      rm.addEventListener('click', () => {
        dzFiles.splice(i, 1);
        syncInput();
        renderFiles();
        dzStatus.textContent = `${f.name} removed. ${dzFiles.length} file${dzFiles.length === 1 ? '' : 's'} attached.`;
        (dzList.querySelector('.dz-file__rm') || dzInput).focus();
      });
      li.append(meta, rm);
      return li;
    }));
    dropzone.classList.toggle('has-files', dzFiles.length > 0);
  }
  async function addFiles(list) {
    const problems = [];
    dzBusy = true;
    dzStatus.textContent = 'Preparing your files…';
    for (const raw of list) {
      if (dzFiles.length >= DZ_MAX_FILES) { problems.push(`Only ${DZ_MAX_FILES} files at a time.`); break; }
      const src = `${raw.name}|${raw.size}`;
      if (dzFiles.some(x => x.kmSrc === src)) continue;
      const f = await shrinkPhoto(raw);
      f.kmSrc = src;
      if (f.size > DZ_MAX_BYTES) { problems.push(`${f.name} is over 10MB.`); continue; }
      if (dzFiles.reduce((n, x) => n + x.size, 0) + f.size > DZ_MAX_TOTAL) { problems.push(`${f.name} would take you over 25MB in total.`); continue; }
      dzFiles.push(f);
    }
    dzBusy = false;
    dzErr.textContent = problems.join(' ');
    syncInput();
    renderFiles();
    dzStatus.textContent = `${dzFiles.length} file${dzFiles.length === 1 ? '' : 's'} attached.`;
  }
  if (dropzone) {
    dzInput.addEventListener('change', () => { addFiles([...dzInput.files].filter(f => !dzFiles.includes(f))); });
    ['dragenter', 'dragover'].forEach(t => dropzone.addEventListener(t, e => { e.preventDefault(); dropzone.classList.add('is-over'); }));
    ['dragleave', 'dragend'].forEach(t => dropzone.addEventListener(t, e => { if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('is-over'); }));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('is-over');
      if (e.dataTransfer && e.dataTransfer.files.length) addFiles([...e.dataTransfer.files]);
    });
    // Stop a stray drop elsewhere on the page from navigating away to the file
    ['dragover', 'drop'].forEach(t => addEventListener(t, e => { if (!e.target.closest || !e.target.closest('#dropzone')) e.preventDefault(); }));
    $('#doneReset').addEventListener('click', () => { dzFiles = []; syncInput(); renderFiles(); dzErr.textContent = ''; });
  }

  /* ---------------------------------------------------------------------
     QUESTION BOX (separate from the demo request)
     --------------------------------------------------------------------- */
  const askForm = $('#askForm');
  if (askForm) {
    const askRules = {
      qName: v => (v.trim() ? '' : 'Please tell us your name.'),
      qEmail: v => (!v.trim() ? 'We need an email address to reply to.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email doesn’t look quite right. Please check it.'),
      qText: v => (v.trim() ? '' : 'Please type your question.'),
    };
    const askCheck = el => { const m = askRules[el.name](el.value); setError(el, m); return !m; };
    const askFields = $$('input, textarea', askForm).filter(el => askRules[el.name]); // not the hidden spam trap
    askFields.forEach(el => {
      el.addEventListener('blur', () => askCheck(el));
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('has-error')) askCheck(el); });
    });
    /* "Get a free quote" links land in this box with a starter line already typed */
    const QUOTE_STARTS = {
      booking: 'I’d like a quote for online booking. Customers would book: ',
      'booking-payments': 'I’d like a quote for online booking with payments. Customers would book and pay for: ',
      shop: 'I’d like a quote for an online shop. Roughly how many products: ',
      any: 'I’d like a quote for: ',
    };
    const qText = $('#qText');
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-quote]');
      if (!a) return;
      const start = QUOTE_STARTS[a.dataset.quote] || QUOTE_STARTS.any;
      const typed = qText.value.trim();
      if (!typed || Object.values(QUOTE_STARTS).some(t => t.trim() === typed)) qText.value = start;
      setError(qText, '');
      setTimeout(() => {
        const next = askFields.find(el => !el.value.trim()) || qText;
        quietFocus = true;
        next.focus({ preventScroll: true });
        quietFocus = false;
        if (next === qText) qText.setSelectionRange(qText.value.length, qText.value.length);
      }, reduced ? 60 : 900);
    });
    const askBtn = $('button[type="submit"]', askForm);
    askForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (askBtn.disabled) return;
      const bad = askFields.filter(el => !askCheck(el));
      const st = $('#askStatus');
      if (bad.length) { bad[0].focus(); st.className = 'ask__status is-err'; st.textContent = 'Please fix the highlighted fields.'; return; }
      st.className = 'ask__status';
      st.textContent = 'Sending…';
      setBusy(askBtn, true, 'Sending…');
      const fd = new FormData(askForm);
      fd.set('form', 'question');
      const res = await postForm(fd);
      setBusy(askBtn, false);
      const first = $('#qName').value.trim().split(/\s+/)[0];
      if ((res.data && res.data.ok) || previewOnly(res)) {
        const sent = !!(res.data && res.data.ok);
        askForm.reset();
        st.className = 'ask__status is-ok';
        st.textContent = sent ? `Thanks, ${first}. We’ve got your question and we’ll reply by email within 24 hours.` : `Thanks, ${first}. This is a preview, so your question hasn’t been sent.`;
        return;
      }
      let firstBad = null;
      Object.entries((res.data && res.data.fields) || {}).forEach(([k, msg]) => {
        const el = askForm.elements[k];
        if (el && el.closest('.field')) { setError(el, msg); firstBad = firstBad || el; }
      });
      st.className = 'ask__status is-err';
      st.textContent = res.status === 422 && res.data && res.data.message ? res.data.message : `Sorry, that didn’t send. Please try again, or email us at ${CONTACT_EMAIL}.`;
      if (firstBad) firstBad.focus();
    });
  }

  /* ---------------------------------------------------------------------
     BACK FROM STRIPE CHECKOUT (?payment=success, cancelled, …)
     --------------------------------------------------------------------- */
  const payNote = $('#payNote');
  const PAY_NOTES = {
    success: ['Payment received. Thank you!', 'Your request and the £4.99 demo fee are with us. We’ll be in touch within 24 hours for a quick chat, and your demo will be ready within 2 working days.', 'is-ok'],
    already: ['You’ve already paid.', 'Your £4.99 demo fee is paid and your request is with us, so there’s nothing more to do. We’ll be in touch within 24 hours.', 'is-ok'],
    cancelled: ['Payment cancelled.', 'No money has been taken, and your request hasn’t been sent to us yet. Pay the £4.99 within 2 days to send it.', ''],
    expired: ['That payment link has expired.', 'Please fill in the form again to send a new request.', 'is-err'],
    error: ['We couldn’t open the payment page.', `Please try again, or email us at ${CONTACT_EMAIL}.`, 'is-err'],
    unavailable: ['Online payment isn’t switched on yet.', `Please email us at ${CONTACT_EMAIL} and we’ll help you straight away.`, ''],
  };
  const payParams = new URLSearchParams(location.search);
  const payState = payParams.get('payment');
  if (payNote && PAY_NOTES[payState]) {
    const [title, text, cls] = PAY_NOTES[payState];
    $('#payNoteTitle').textContent = title;
    $('#payNoteText').textContent = text;
    if (cls) payNote.classList.add(cls);
    // Cancelled at Stripe: their request is saved, so offer the payment again
    const rid = payParams.get('r') || '';
    const key = payParams.get('k') || '';
    if ((payState === 'cancelled' || payState === 'error') && /^KM-\d{6}-([0-9A-F]{4}|[0-9A-F]{8})$/.test(rid) && /^[0-9a-f]{24}$/.test(key)) {
      const retry = $('#payRetry');
      retry.href = `api/pay.php?r=${encodeURIComponent(rid)}&k=${key}`;
      retry.hidden = false;
    }
    payNote.hidden = false;
    history.replaceState(null, '', location.pathname + '#contact');
  }

  /* ---------------------------------------------------------------------
     COOKIE CHOICES. No tracking cookies at all: the only optional storage is
     remembering the "See it with your name" sketch during the visit.
     --------------------------------------------------------------------- */
  const cookieBanner = $('#cookieBanner');
  function showCookieBanner() {
    cookieBanner.hidden = false;
    root.classList.add('has-cookie');
    root.style.setProperty('--cookie-h', `${cookieBanner.offsetHeight}px`); // so in-page jumps don't land under it
  }
  let cookieOpener = null;
  function chooseCookies(choice) {
    try { localStorage.setItem('km-consent', choice); } catch (e) { consentMemory = choice; }
    if (choice !== 'all') { try { sessionStorage.removeItem('km-star'); } catch (e) { /* storage blocked */ } }
    const hadFocus = cookieBanner.contains(document.activeElement);
    cookieBanner.hidden = true;
    root.classList.remove('has-cookie');
    if (hadFocus) { if (cookieOpener && cookieOpener.isConnected) cookieOpener.focus({ preventScroll: true }); else focusSpot(main); }
    cookieOpener = null;
  }
  if (cookieBanner) {
    if (!consent()) setTimeout(showCookieBanner, reduced ? 0 : 1600);
    $$('[data-consent]', cookieBanner).forEach(b => b.addEventListener('click', () => chooseCookies(b.dataset.consent)));
    // Escape closes it the private way, unless it's closing the menu (checked first, before the menu reacts)
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || cookieBanner.hidden || menuOpen) return;
      chooseCookies('essential');
    }, true);
    // While it's open, don't let keyboard focus hide underneath it. A few frames, because the hero drifts as it scrolls.
    document.addEventListener('focusin', e => {
      const el = e.target;
      if (cookieBanner.hidden || menuOpen || cookieBanner.contains(el) || !el.getBoundingClientRect) return;
      let tries = 0;
      const lift = () => {
        const over = el.getBoundingClientRect().bottom - (cookieBanner.getBoundingClientRect().top - 16);
        if (over <= 0 || tries++ > 5) return;
        scrollBy({ top: over, behavior: 'instant' });
        requestAnimationFrame(lift);
      };
      lift();
    });
    $$('[data-cookie-settings]').forEach(b => b.addEventListener('click', () => { cookieOpener = b; showCookieBanner(); $('[data-consent="all"]', cookieBanner).focus(); }));
  }

  $$('[data-email]').forEach(a => { a.href = `mailto:${CONTACT_EMAIL}`; a.textContent = CONTACT_EMAIL; });
  $$('[data-email-text]').forEach(s => { s.textContent = CONTACT_EMAIL; });

  /* ---------------------------------------------------------------------
     CLOCK, YEAR, BACK TO TOP, PAUSE MOTION
     --------------------------------------------------------------------- */
  const clock = $('#ukClock');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
  const tickClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
  tickClock();
  setInterval(tickClock, 15000);
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  $('#toTop').addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    brand.focus({ preventScroll: true });
  });

  /* ---------------------------------------------------------------------
     HERO FIELD: interactive dot grid on canvas
     --------------------------------------------------------------------- */
  const hero = $('.hero');
  const canvas = $('#heroCanvas');
  const ctx = canvas && canvas.getContext('2d');
  const field = { dots: [], w: 0, h: 0, mx: -9999, my: -9999, ripples: [], visible: true, lastMove: 0, frameNo: 0 };

  function buildField() {
    if (!ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    field.w = canvas.clientWidth;
    field.h = canvas.clientHeight;
    canvas.width = Math.round(field.w * dpr);
    canvas.height = Math.round(field.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = field.w < 700 ? 26 : 34;
    field.dots = [];
    for (let y = gap / 2; y < field.h; y += gap) {
      for (let x = gap / 2; x < field.w; x += gap) field.dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
    }
  }

  function drawField(t, frozen) {
    if (!ctx) return;
    ctx.clearRect(0, 0, field.w, field.h);
    const R = Math.min(200, field.w * .22);
    field.ripples = field.ripples.filter(r => t - r.t < 1600);
    for (const d of field.dots) {
      const wave = frozen ? 0 : Math.sin(d.ox * .006 + t * .0011) * Math.cos(d.oy * .008 + t * .0008) * 5;
      let tx = d.ox;
      let ty = d.oy + wave;
      let heat = 0;
      if (!frozen) {
        const dx = d.x - field.mx;
        const dy = d.y - field.my;
        const dist = Math.hypot(dx, dy);
        if (dist < R) {
          const f = 1 - dist / R;
          heat = f;
          tx += (dx / (dist || 1)) * f * f * 46;
          ty += (dy / (dist || 1)) * f * f * 46;
        }
        for (const r of field.ripples) {
          const age = (t - r.t) / 1600;
          const radius = age * Math.max(field.w, field.h) * .9;
          const rdx = d.ox - r.x;
          const rdy = d.oy - r.y;
          const rd = Math.hypot(rdx, rdy);
          const band = 1 - Math.min(1, Math.abs(rd - radius) / 60);
          if (band > 0) {
            const k = band * (1 - age);
            heat = Math.max(heat, k);
            tx += (rdx / (rd || 1)) * k * 22;
            ty += (rdy / (rd || 1)) * k * 22;
          }
        }
        d.vx = (d.vx + (tx - d.x) * .09) * .8;
        d.vy = (d.vy + (ty - d.y) * .09) * .8;
        d.x += d.vx;
        d.y += d.vy;
      } else { d.x = tx; d.y = ty; }
      const size = 1.1 + heat * 2.6;
      ctx.fillStyle = heat > .02
        ? `rgba(${Math.round(243 - 31 * heat)}, ${Math.round(238 - 63 * heat)}, ${Math.round(228 - 173 * heat)}, ${.22 + heat * .78})`
        : 'rgba(243, 238, 228, .13)';
      ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
    }
  }

  if (ctx) {
    buildField();
    hero.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      field.mx = e.clientX - r.left;
      field.my = e.clientY - r.top;
      field.lastMove = performance.now();
      wake();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { field.mx = -9999; field.my = -9999; });
    hero.addEventListener('pointerdown', e => {
      if (still()) return;
      const r = canvas.getBoundingClientRect();
      field.ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
      field.lastMove = performance.now();
      wake();
    });
    new IntersectionObserver(([en]) => { field.visible = en.isIntersecting; if (field.visible) wake(); }).observe(hero);
    if (still()) drawField(0, true);
  }

  const motionToggles = $$('[data-motion-toggle]');
  function syncMotionToggles() {
    motionToggles.forEach(b => { b.setAttribute('aria-pressed', String(motionOff)); });
  }
  motionToggles.forEach(b => b.addEventListener('click', () => {
    motionOff = !motionOff;
    root.classList.toggle('motion-off', motionOff);
    try { localStorage.setItem('km-motion', motionOff ? 'off' : 'on'); } catch (e) { /* storage blocked */ }
    syncMotionToggles();
    if (motionOff) drawField(performance.now(), true);
    if (motionOff && buildAuto && autoState === 'playing') { autoResume = false; pauseBuild(); }
    wake();
  }));
  syncMotionToggles();

  /* ---------------------------------------------------------------------
     SCROLL SCENES (cached measurements, no layout reads per frame)
     --------------------------------------------------------------------- */
  const progressBar = $('#scrollProgress');
  const heroInner = $('.hero__inner');
  const marquee = $('#marqueeTrack');
  const manifestoText = $('.manifesto__text');
  const build = $('#build');
  const buildTitle = $('#buildTitle');
  const mock = $('#mock');
  const buildStepItems = $$('#buildSteps li');
  const buildStepBtns = $$('#buildSteps .build__step');
  const buildMeter = $('#buildMeter');
  const buildCaption = $('#buildCaption');
  const buildStage = $('.build__stage');
  const mockUrl = $('#mockUrl');
  const process = $('#process');
  const processSticky = $('.process__sticky');
  const track = $('#processTrack');
  const rail = $('#processRail');
  const steps = $$('.step:not(.step--end)', track);

  const DEFAULT_LIVE = { name: 'Live', url: 'hearthcoffee.kingmedia.uk' };
  const STAGES = [
    { name: 'Blueprint', url: 'draft — blueprint' },
    { name: 'Words', url: 'draft — copy' },
    { name: 'Brand', url: 'draft — brand' },
    { name: 'Imagery', url: 'draft — imagery' },
    { name: 'Every screen', url: 'preview — mobile' },
    { ...DEFAULT_LIVE },
  ];
  let currentStage = -1;
  function setStage(n) {
    if (n === currentStage) return;
    currentStage = n;
    mock.dataset.stage = String(n);
    mock.classList.toggle('s-brand', n >= 2);
    mock.classList.toggle('s-image', n >= 3);
    mock.classList.toggle('s-mobile', n === 4);
    mock.classList.toggle('s-live', n >= 5);
    mockUrl.textContent = STAGES[n].url;
    buildCaption.textContent = `Step 0${n + 1} — ${STAGES[n].name}`;
    buildStepItems.forEach((li, i) => { li.classList.toggle('is-active', i === n); li.classList.toggle('is-done', i < n); });
    buildStepBtns.forEach((b, i) => { if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  }

  const M = { manTop: 0, manH: 0, buildTop: 0, buildH: 0, procTop: 0, procH: 0, docH: 0 };
  const absTop = el => el.getBoundingClientRect().top + scrollY;
  let processActive = false;
  let processDistance = 0;

  function layoutProcess() {
    processActive = vw >= 900 && !reduced;
    if (processActive) {
      processDistance = Math.max(0, track.scrollWidth - vw);
      process.style.height = `${processDistance + vh}px`;
      processSticky.scrollLeft = 0;
    } else {
      process.style.height = '';
      track.style.transform = '';
    }
  }
  function layoutMock() {
    if (!mock) return;
    if (vw < 1024) mock.style.zoom = String(Math.min(1, buildStage.clientWidth / 760));
    else if (!reduced) mock.style.zoom = String(Math.min(1, Math.max(.55, (vh - 154) / 791)));
    else mock.style.zoom = '';
    reserveStage();
  }
  if (document.fonts) document.fonts.ready.then(() => { if (mock) reserveStage(); }); // text sizes settle once the fonts arrive
  // Below desktop the preview sits in the page flow, and the phone step is taller than the rest.
  // Hold the tallest step's height so the page underneath never jumps while it plays.
  function reserveStage() {
    buildStage.style.minHeight = '';
    if (vw >= 1024) return;
    const kept = mock.className;
    const keptCaption = buildCaption.textContent;
    mock.classList.add('is-measuring');
    let tallest = 0;
    STAGES.forEach((stage, n) => {
      mock.classList.toggle('s-brand', n >= 2);
      mock.classList.toggle('s-image', n >= 3);
      mock.classList.toggle('s-mobile', n === 4);
      mock.classList.toggle('s-live', n >= 5);
      buildCaption.textContent = `Step 0${n + 1} — ${stage.name}`;
      tallest = Math.max(tallest, buildStage.offsetHeight);
    });
    mock.className = `${kept} is-measuring`;
    buildCaption.textContent = keptCaption;
    void mock.offsetHeight;
    mock.classList.remove('is-measuring');
    buildStage.style.minHeight = `${Math.ceil(tallest)}px`;
  }
  // If the pinned scene can't fit the screen (landscape phones, big zoom, short windows), show it as a normal section
  const buildSticky = $('.build__sticky');
  const buildGrid = $('.build__grid');
  let buildStatic = reduced;

  /* Phones and small tablets: the build plays by itself when the preview comes into
     view, like a short video. A flick of the thumb would otherwise race through a
     scroll-driven scene and it would look finished before it started. */
  const buildPlay = $('#buildPlay');
  const BUILD_STEP_MS = 1500;
  const BUILD_LABELS = {
    idle: ['Play the build', 'Play the build'],
    playing: ['Pause', 'Pause the build'],
    paused: ['Play', 'Play the rest of the build'],
    done: ['Replay', 'Replay the build'],
    still: ['Watch it build', 'Watch it build, step by step'],
  };
  let buildAuto = false;
  let autoState = 'idle';
  let autoTimer = 0;
  let autoResume = false;
  const meterTo = n => { buildMeter.style.transform = `scaleX(${(n + 1) / STAGES.length})`; };
  function setAutoState(state) {
    autoState = state;
    buildPlay.dataset.state = state;
    $('.build__play-label', buildPlay).textContent = BUILD_LABELS[state][0];
    buildPlay.setAttribute('aria-label', BUILD_LABELS[state][1]);
  }
  function autoTick() {
    setStage(Math.min(STAGES.length - 1, currentStage + 1));
    meterTo(currentStage);
    if (currentStage >= STAGES.length - 1) setAutoState('done');
    else autoTimer = setTimeout(autoTick, BUILD_STEP_MS);
  }
  function playBuild(fromStart) {
    clearTimeout(autoTimer);
    autoResume = false;
    if (fromStart || currentStage >= STAGES.length - 1) { setStage(0); meterTo(0); }
    setAutoState('playing');
    autoTimer = setTimeout(autoTick, BUILD_STEP_MS);
  }
  function pauseBuild() {
    clearTimeout(autoTimer);
    if (autoState === 'playing') setAutoState('paused');
  }
  function jumpBuild(n) {
    clearTimeout(autoTimer);
    autoResume = false;
    setStage(n);
    meterTo(n);
    setAutoState(n >= STAGES.length - 1 ? 'done' : 'paused');
  }
  buildPlay.addEventListener('click', () => {
    if (autoState === 'playing') { autoResume = false; pauseBuild(); }
    else playBuild(autoState !== 'paused');
  });
  // Plays when the preview reaches the middle of the screen (works in landscape too, where it's taller than the screen).
  // With Reduce Motion or "Pause motion" it waits for a tap on "Watch it build".
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      if (!buildAuto) return;
      if (en.isIntersecting) {
        if (autoState === 'idle' && !still()) playBuild(true);
        else if (autoResume) playBuild(false);
      } else if (autoState === 'playing') { pauseBuild(); autoResume = true; } // carry on when they scroll back
    }, { rootMargin: '-25% 0px -25% 0px', threshold: 0 }).observe(buildStage);
  }
  // After the "See it with your name" sketch changes: phones rewind (then play), desktop follows the scroll
  function resetBuildStage() {
    currentStage = -1;
    if (!buildAuto) { setStage(stageFromScroll()); return; }
    clearTimeout(autoTimer);
    autoResume = false;
    const n = still() ? STAGES.length - 1 : 0;
    setStage(n);
    meterTo(n);
    setAutoState(still() ? 'still' : 'idle');
  }

  function layoutBuild() {
    const auto = vw < 1024;
    if (auto) {
      if (!buildAuto) { build.classList.remove('build--static'); buildAuto = true; resetBuildStage(); }
      buildAuto = true;
      buildStatic = true; // no scroll-driven stages
      if (!build.classList.contains('build--auto')) { build.classList.add('build--auto'); reserveStage(); }
      buildPlay.hidden = false;
      return;
    }
    if (buildAuto) {
      clearTimeout(autoTimer);
      buildAuto = false;
      build.classList.remove('build--auto');
      buildPlay.hidden = true;
      buildMeter.style.transform = '';
      buildStatic = reduced;
    }
    if (reduced) return;
    build.classList.remove('build--static');
    const cs = getComputedStyle(buildSticky);
    const room = buildSticky.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    buildStatic = buildGrid.offsetHeight > room + 1;
    build.classList.toggle('build--static', buildStatic);
    currentStage = -1;
    if (buildStatic) { buildMeter.style.transform = 'scaleX(1)'; setStage(STAGES.length - 1); }
  }
  function measure() {
    if (manifestoText) { M.manTop = absTop(manifestoText); M.manH = manifestoText.offsetHeight; }
    M.buildTop = absTop(build); M.buildH = build.offsetHeight;
    M.procTop = absTop(process); M.procH = process.offsetHeight;
    M.docH = root.scrollHeight - vh;
    wake();
  }
  const stageFromScroll = () => {
    if (buildStatic) return STAGES.length - 1;
    const p = clamp((scrollY - M.buildTop) / Math.max(1, M.buildH - vh));
    return Math.min(STAGES.length - 1, Math.floor(p * STAGES.length * .999));
  };

  // Tappable build steps: jump to the middle of that stage
  buildStepBtns.forEach(btn => btn.addEventListener('click', () => {
    const n = Number(btn.dataset.stage);
    if (buildAuto) { jumpBuild(n); return; }
    if (buildStatic) { setStage(n); return; }
    lockNav(1500, true);
    scrollTo({ top: M.buildTop + ((n + .5) / STAGES.length) * (M.buildH - vh), behavior: 'smooth' });
  }));

  // Keyboard focus inside the pinned horizontal track scrolls the page to that card
  track.addEventListener('focusin', e => {
    if (!processActive) return;
    const el = e.target.closest('.step');
    if (!el) return;
    const p = clamp((el.offsetLeft - (vw - el.offsetWidth) / 2) / Math.max(1, processDistance));
    root.style.scrollBehavior = 'auto';
    scrollTo(0, M.procTop + p * (M.procH - vh));
    root.style.scrollBehavior = '';
  });

  let lastY = -1;
  let velocity = 0;
  let marqueeX = 0;
  let marqueeDir = -1;
  let marqueeWidth = marquee ? marquee.firstElementChild.offsetWidth : 0;
  let marqueeVisible = true;
  let lastLit = -1;
  let lastProgress = -1;
  let heroSettled = false;
  let lastCurrentStep = -1;
  if (marquee) new IntersectionObserver(([en]) => { marqueeVisible = en.isIntersecting; if (marqueeVisible) wake(); }).observe(marquee);

  function frame(now) {
    const dt = Math.min(64, now - lastT);
    lastT = now;
    const y = scrollY;
    const delta = lastY < 0 ? 0 : y - lastY;
    lastY = y;
    velocity = lerp(velocity, delta, .12);
    if (delta !== 0) lastActivity = now;

    const prog = M.docH > 0 ? Math.round(clamp(y / M.docH) * 1000) / 1000 : 0;
    if (prog !== lastProgress) { progressBar.style.transform = `scaleX(${prog})`; lastProgress = prog; }

    // Header: never hides on wide screens, during anchor jumps, or while focused
    header.classList.toggle('is-scrolled', y > 40);
    if (vw >= 1100) header.classList.remove('is-hidden');
    else if (!menuOpen && !navLock && !header.contains(document.activeElement)) {
      if (delta > 4 && y > 500) header.classList.add('is-hidden');
      else if (delta < -4 || y < 200) header.classList.remove('is-hidden');
    }

    if (!still()) {
      if (heroInner) {
        if (y < vh * 1.2) {
          heroInner.style.transform = `translate3d(0, ${y * .22}px, 0)`;
          heroInner.style.opacity = String(1 - clamp(y / (vh * .85)) * .85);
          heroSettled = false;
        } else if (!heroSettled) {
          heroInner.style.opacity = '.15';
          heroSettled = true;
        }
      }
      if (field.visible && ctx) {
        field.frameNo++;
        if (now - field.lastMove < 1500 || field.frameNo % 2 === 0) drawField(now, false);
      }
      if (marquee && marqueeWidth && marqueeVisible) {
        if (delta > 0) marqueeDir = -1; else if (delta < 0) marqueeDir = 1;
        marqueeX += (0.06 + Math.min(Math.abs(velocity) * .02, .9)) * dt * marqueeDir;
        if (marqueeX <= -marqueeWidth) marqueeX += marqueeWidth;
        if (marqueeX > 0) marqueeX -= marqueeWidth;
        marquee.style.transform = `translate3d(${marqueeX}px, 0, 0) skewX(${clamp(velocity * -.25, -10, 10)}deg)`;
      }
    }

    // Manifesto word fill: lights fully while "King Media." is still on screen
    if (manifestoWords.length && !reduced) {
      const top = M.manTop - y;
      if (top < vh && top + M.manH > 0) {
        const p = clamp((vh * .8 - top) / (M.manH + vh * .05));
        const lit = Math.floor(p * manifestoWords.length * 1.02);
        if (lit !== lastLit) { manifestoWords.forEach((w, i) => w.classList.toggle('is-lit', i < lit)); lastLit = lit; }
      }
    }

    // Build scrollytelling, with hysteresis so stages don't flicker at boundaries
    if (!buildStatic) {
      const top = M.buildTop - y;
      if (top < vh && top + M.buildH > 0) {
        const p = clamp(-top / Math.max(1, M.buildH - vh));
        buildMeter.style.transform = `scaleX(${p})`;
        const raw = p * STAGES.length * .999;
        const inBand = currentStage >= 0 && raw > currentStage - .12 && raw < currentStage + 1.12;
        if (!inBand) setStage(Math.min(STAGES.length - 1, Math.max(0, Math.floor(raw))));
      }
    }

    if (dock && !buildStatic) {
      const bTop = M.buildTop - y;
      const pinned = bTop < 2 && bTop + M.buildH > vh;
      if (pinned !== inBuild) { inBuild = pinned; updateDock(); }
    } else if (inBuild) { inBuild = false; updateDock(); }

    if (processActive) {
      const top = M.procTop - y;
      if (top < vh && top + M.procH > 0) {
        const p = clamp(-top / Math.max(1, M.procH - vh));
        track.style.transform = `translate3d(${-p * processDistance}px, 0, 0)`;
        rail.style.transform = `scaleX(${p})`;
        const cur = Math.round(p * (steps.length - 1));
        if (cur !== lastCurrentStep) { steps.forEach((s, i) => s.classList.toggle('is-current', i === cur)); lastCurrentStep = cur; }
      }
    }

    const busy = now - lastActivity < 250 || (!still() && ((field.visible && ctx) || (marqueeVisible && marquee)));
    if (busy) requestAnimationFrame(frame); else looping = false;
  }

  addEventListener('scroll', wake, { passive: true });

  if (reduced) {
    setStage(STAGES.length - 1);
    const lede = $('#buildLede');
    if (lede) lede.textContent = 'The same journey your website takes, from blank page to live, in six steps.';
  }

  /* ---------------------------------------------------------------------
     STARRING YOU: the build sequence with the visitor's own business name
     (a sketch on our example layout — stays on the device, nothing is sent)
     --------------------------------------------------------------------- */
  const TRADES = {
    cafe:   { kicker: 'Coffee & kitchen', h1: 'Coffee worth getting up for.', p: 'Fresh coffee, good food and a warm welcome, every day.', cta: 'See the menu', cta2: 'Find us', nav: ['Menu', 'Story', 'Visit'], nb: 'Call us', cards: ['Menu', 'Opening hours', 'Find us'] },
    bakery: { kicker: 'Baked fresh daily', h1: 'Baked while you were sleeping.', p: 'Bread, pastries and celebration cakes, made by hand.', cta: 'Today’s bakes', cta2: 'Visit us', nav: ['Bakes', 'Cakes', 'Visit'], nb: 'Call us', cards: ['Today’s bakes', 'Celebration cakes', 'Visit us'] },
    barber: { kicker: 'Barbers & grooming', h1: 'Sharp cuts. No fuss.', p: 'Walk in or book ahead. Every cut done properly.', cta: 'Book a chair', cta2: 'Prices', nav: ['Prices', 'Team', 'Visit'], nb: 'Call us', cards: ['Prices', 'The team', 'Opening hours'] },
    clinic: { kicker: 'Health & wellbeing', h1: 'Move better. Feel better.', p: 'Friendly, expert care to get you back to what you love.', cta: 'Book an appointment', cta2: 'Treatments', nav: ['Treatments', 'Team', 'Visit'], nb: 'Call us', cards: ['Treatments', 'Meet the team', 'Opening hours'] },
    trades: { kicker: 'Local & reliable', h1: 'Quality work, done properly.', p: 'Clear quotes, tidy work and people who turn up.', cta: 'Get a quote', cta2: 'Our work', nav: ['Services', 'Our work', 'Areas'], nb: 'Call us', cards: ['Services', 'Recent work', 'Areas we cover'] },
    other:  { kicker: 'Proudly independent', h1: 'Everything your customers need, in one place.', p: 'Who you are, what you do and how to get in touch.', cta: 'Get in touch', cta2: 'About us', nav: ['About', 'Services', 'Visit'], nb: 'Contact', cards: ['What we do', 'About us', 'Opening hours'] },
  };
  const starForm = $('#star');
  const starSlots = {};
  $$('[data-star]', mock).forEach(el => { starSlots[el.dataset.star] = { el, original: el.textContent }; });
  const mono = $('.ms-mono', mock);
  const plain = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slugify = name => (plain(name).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '').slice(0, 24) || 'yourbusiness');
  const setSlot = (key, text) => { if (starSlots[key]) starSlots[key].el.textContent = text; };

  function applyStar(name, trade) {
    const t = TRADES[trade] || TRADES.other;
    setSlot('name', name);
    setSlot('kicker', t.kicker);
    setSlot('h1', t.h1);
    setSlot('p', t.p);
    setSlot('cta', t.cta);
    setSlot('cta2', t.cta2);
    t.nav.forEach((l, i) => setSlot(`l${i}`, l));
    setSlot('nb', t.nb);
    t.cards.forEach((c, i) => { setSlot(`c${i}`, c); setSlot(`p${i}`, 'See more'); });
    if (mono) mono.textContent = (plain(name).match(/[a-z0-9]/i) || ['K'])[0].toUpperCase();
    mock.dataset.trade = trade;
    STAGES[5].url = `${slugify(name)}.co.uk`;
    STAGES[5].name = 'Live · example address';
    resetBuildStage();
    const fBiz = $('#fBiz');
    if (fBiz && !fBiz.value.trim()) fBiz.value = name;
    if (consent() === 'all') { try { sessionStorage.setItem('km-star', JSON.stringify({ name, trade })); } catch (e) { /* storage blocked */ } }
    $('#starReset').hidden = false;
    const tag = $('#buildStarName'); // the name is tiny inside the phone-sized mock, so say it underneath too
    if (tag) { tag.textContent = `Built for ${name}`; tag.hidden = false; }
    reserveStage();
  }
  function resetStar() {
    Object.values(starSlots).forEach(s => { s.el.textContent = s.original; });
    if (mono) mono.textContent = '';
    delete mock.dataset.trade;
    STAGES[5] = { ...DEFAULT_LIVE };
    resetBuildStage();
    try { sessionStorage.removeItem('km-star'); } catch (e) { /* storage blocked */ }
    $('#starReset').hidden = true;
    if ($('#buildStarName')) $('#buildStarName').hidden = true;
    reserveStage();
    $('#starStatus').replaceChildren();
    $('#starName').value = '';
    setError($('#starName'), '');
  }

  if (starForm) {
    const nameInput = $('#starName');
    const status = $('#starStatus');
    starForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = nameInput.value.trim().replace(/\s+/g, ' ');
      if (!name) { setError(nameInput, 'Please add your business name to see it built.'); nameInput.focus(); return; }
      setError(nameInput, '');
      const trade = $('#starTrade').value;
      applyStar(name, trade);
      const line = document.createElement('span');
      line.textContent = buildAuto ? `Done. Watch ${name} build itself.` : `Done. Scroll on to watch ${name} build itself.`;
      const parts = [line];
      if (trade === 'barber' || trade === 'clinic') {
        const note = document.createElement('span');
        note.className = 'starring__note';
        note.append('Want customers to book or pay online? That’s quoted separately. ');
        const a = document.createElement('a');
        a.href = '#askForm';
        a.dataset.quote = trade === 'clinic' ? 'booking-payments' : 'booking';
        a.textContent = 'Get a free quote';
        note.append(a);
        parts.push(note);
      }
      status.replaceChildren(...parts);
      if (parts.length > 1) {
        lockNav();
        status.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      setTimeout(() => {
        lockNav(1500, true);
        scrollTo({ top: M.buildTop, behavior: reduced ? 'auto' : 'smooth' });
        buildTitle.focus({ preventScroll: true });
        if (buildAuto && !still()) setTimeout(() => playBuild(true), 900);
      }, 700);
    });
    nameInput.addEventListener('input', () => { if (nameInput.getAttribute('aria-invalid') === 'true' && nameInput.value.trim()) setError(nameInput, ''); });
    $('#starReset').addEventListener('click', () => { resetStar(); nameInput.focus(); });
    try {
      const saved = consent() === 'all' ? JSON.parse(sessionStorage.getItem('km-star') || 'null') : null;
      if (saved && saved.name && TRADES[saved.trade]) { nameInput.value = saved.name; $('#starTrade').value = saved.trade; applyStar(saved.name, saved.trade); }
    } catch (e) { /* storage blocked */ }
  }

  /* ---------------------------------------------------------------------
     RESIZE (iPhone Safari fires resize as the address bar moves: ignore those)
     --------------------------------------------------------------------- */
  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const widthChanged = innerWidth !== vw;
      const bigHeightChange = Math.abs(innerHeight - vh) > 160;
      if (!widthChanged && !bigHeightChange) { vh = innerHeight; M.docH = root.scrollHeight - vh; if (vw >= 1024) { layoutMock(); layoutBuild(); } return; }
      vw = innerWidth;
      vh = innerHeight;
      buildField();
      if (still()) drawField(0, true);
      layoutProcess();
      layoutMock();
      layoutBuild();
      marqueeWidth = marquee ? marquee.firstElementChild.offsetWidth : 0;
      measure();
    }, 150);
  });
  if ('ResizeObserver' in window) {
    let roRaf = 0;
    new ResizeObserver(() => { cancelAnimationFrame(roRaf); roRaf = requestAnimationFrame(measure); }).observe(body);
  }

  /* ---------------------------------------------------------------------
     BOOT
     --------------------------------------------------------------------- */
  layoutProcess();
  layoutMock();
  layoutBuild();
  measure();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    layoutProcess();
    layoutBuild();
    marqueeWidth = marquee ? marquee.firstElementChild.offsetWidth : 0;
    measure();
  });
  if (!buildStatic && currentStage < 0) setStage(stageFromScroll());
  wake();
  // Back from Stripe: bring the payment message into view once the browser has done its own jump to #contact
  if (payNote && !payNote.hidden) {
    const showPayNote = () => setTimeout(() => {
      const wrap = payNote.closest('.reveal');
      if (wrap) wrap.classList.add('is-in');
      payNote.scrollIntoView({ block: 'center', behavior: 'auto' });
      payNote.focus({ preventScroll: true });
    }, 120);
    if (document.readyState === 'complete') showPayNote(); else addEventListener('load', showPayNote, { once: true });
  }
  runLoader().then(() => {
    body.classList.add('is-ready');
    brand.classList.add('is-blinking');
    setTimeout(() => brand.classList.remove('is-blinking'), 3200);
  });
})();
