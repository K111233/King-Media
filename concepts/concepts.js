/* KWM Systems concept pages: shared behaviour. See concepts/BUILDING.md. */
(() => {
  'use strict';
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const still = () => !root.classList.contains('motion-ok');

  // Motion follows the OS setting and KWM Systems’ Pause motion (km-motion)
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => {
    let off = false;
    try { off = localStorage.getItem('km-motion') === 'off'; } catch (e) {}
    root.classList.toggle('motion-ok', !off && !rm.matches);
  };
  if (rm.addEventListener) rm.addEventListener('change', syncMotion);
  addEventListener('storage', e => { if (e.key === 'km-motion') syncMotion(); });

  // Name: textContent only, never innerHTML
  const slots = $$('[data-slot="name"]');
  slots.forEach(el => { if (!('original' in el.dataset)) el.dataset.original = el.textContent; });
  const original = slots.length ? slots[0].dataset.original : '';
  const baseTitle = d.title;
  const clean = v => Array.from(String(v == null ? '' : v)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/\s+/g, ' ').trim()).slice(0, 32).join('').trim();
  function setName(value, opts) {
    const name = clean(value);
    slots.forEach(el => { el.textContent = name || el.dataset.original; });
    root.classList.toggle('has-name', !!name);
    root.classList.toggle('is-typing', !!(opts && opts.caret));
    d.title = name && original ? baseTitle.replace(original, name) : baseTitle;
    return name;
  }
  const q = new URLSearchParams(location.search);
  if (q.has('name')) setName(q.get('name'));

  // Demo toast: role=status, never focused, gone after 4s
  let tEl = $('.km-toast'), tA = 0, tB = 0;
  if (!tEl) { tEl = d.body.appendChild(d.createElement('p')); tEl.className = 'km-toast'; tEl.setAttribute('role', 'status'); }
  function toast(msg) {
    clearTimeout(tA); clearTimeout(tB);
    tEl.textContent = '';
    setTimeout(() => {
      tEl.textContent = String(msg);
      tEl.classList.add('is-on');
      tA = setTimeout(() => { tEl.classList.remove('is-on'); tB = setTimeout(() => { tEl.textContent = ''; }, 300); }, 4000);
    }, 30);
  }
  d.addEventListener('click', e => { const b = e.target.closest('button[data-toast]'); if (b) toast(b.dataset.toast); });
  d.addEventListener('change', e => {
    const i = e.target.closest('input[data-toast]');
    if (i && i.checked !== false) toast(i.dataset.toast.replace('{value}', i.value));
  });

  // Back to our work: return to the viewer where the visitor left off
  $$('[data-km-back]').forEach(a => a.addEventListener('click', e => {
    let ref;
    try { ref = new URL(d.referrer); } catch (err) { return; }
    if (ref.origin === location.origin && !ref.pathname.startsWith('/concepts/') && history.length > 1) { e.preventDefault(); history.back(); }
  }));

  // Framed: # links scroll this frame only; other links open in the top window
  if (root.classList.contains('is-embed')) {
    $$('a[href]:not([href^="#"]):not([target])').forEach(a => { a.target = '_top'; });
    d.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const t = id ? d.getElementById(id) : null;
      const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      scrollTo({ top: t ? t.getBoundingClientRect().top + scrollY - pad : 0, behavior: still() ? 'auto' : 'smooth' });
      if (t) { if (!t.hasAttribute('tabindex')) t.tabIndex = -1; t.focus({ preventScroll: true }); }
    });
  }

  // Before/after slider: drag, tap, arrow keys; a vertical swipe always scrolls
  const bas = $$('[data-ba]');
  let canSweep = false;
  if (bas.length && window.CSS && CSS.registerProperty) {
    try { CSS.registerProperty({ name: '--pos', syntax: '<percentage>', inherits: true, initialValue: '50%' }); canSweep = true; }
    catch (e) { canSweep = e.name === 'InvalidModificationError'; }
  }
  bas.forEach(ba => {
    const range = $('.ba__range', ba);
    const set = v => {
      const pct = Math.min(100, Math.max(0, v)), r = Math.round(pct);
      ba.style.setProperty('--pos', `${pct}%`);
      range.value = String(r);
      range.setAttribute('aria-valuetext', `${r}% before, ${100 - r}% after`);
    };
    const fromX = x => { const b = ba.getBoundingClientRect(); return (x - b.left) / b.width * 100; };
    const stopHint = () => ba.classList.remove('is-hinting');
    let drag = false, pend = null;
    ba.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      stopHint();
      if (e.pointerType === 'touch') { pend = { id: e.pointerId, x: e.clientX, y: e.clientY }; return; }
      drag = true;
      ba.setPointerCapture(e.pointerId);
      set(fromX(e.clientX));
    });
    ba.addEventListener('pointermove', e => {
      if (drag) { set(fromX(e.clientX)); return; }
      if (!pend || e.pointerId !== pend.id) return;
      const dx = Math.abs(e.clientX - pend.x), dy = Math.abs(e.clientY - pend.y);
      if (dx > 8 && dx > dy) {
        pend = null; drag = true;
        try { ba.setPointerCapture(e.pointerId); } catch (err) {}
        set(fromX(e.clientX));
      } else if (dy > 8) pend = null;
    });
    const end = e => { if (pend && e.type === 'pointerup') set(fromX(e.clientX)); drag = false; pend = null; };
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
    range.addEventListener('input', () => { stopHint(); set(Number(range.value)); });
    set(50);
    // One 1.6s CSS sweep at 60% in view
    if (canSweep && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en], obs) => {
        if (!en.isIntersecting) return;
        obs.disconnect();
        if (still()) return;
        ba.addEventListener('animationend', stopHint, { once: true });
        ba.classList.add('is-hinting');
      }, { threshold: .6 }).observe(ba);
    }
  });

  // Demo basket: nothing is for sale or sent
  $$('[data-shop]').forEach(shop => {
    const basket = $('[data-basket]', shop), count = $('.ww-count', shop);
    const wtoast = $('.ww-toast', shop), FREE_DELIVERY = 40;
    let items = 0, total = 0, timer = 0;
    const gbp = n => `£${n}`;
    const plural = n => `${n} item${n === 1 ? '' : 's'}`;
    const say = (main, note) => {
      const small = d.createElement('small');
      small.textContent = note;
      wtoast.replaceChildren(`${main} `, small);
      wtoast.classList.add('is-on');
      clearTimeout(timer);
      timer = setTimeout(() => {
        wtoast.classList.remove('is-on');
        setTimeout(() => { if (!wtoast.classList.contains('is-on')) wtoast.replaceChildren(); }, 300);
      }, 4000);
    };
    const bump = el => { if (still()) return; el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); };
    $$('[data-add]', shop).forEach(btn => {
      const label = $('.ww-add__label', btn);
      let reset = 0;
      btn.addEventListener('click', () => {
        const before = total;
        items += 1; total += Number(btn.dataset.price);
        count.textContent = String(items);
        shop.classList.add('has-items');
        basket.setAttribute('aria-label', `Demo basket, ${plural(items)}, ${gbp(total)}`);
        bump(count); bump(basket);
        btn.classList.add('is-added');
        label.textContent = 'Added';
        clearTimeout(reset);
        reset = setTimeout(() => { btn.classList.remove('is-added'); label.textContent = 'Add'; }, 1400);
        const unlocked = before < FREE_DELIVERY && total >= FREE_DELIVERY;
        say(`${btn.dataset.add} added. ${plural(items)}, ${gbp(total)}.`, `${unlocked ? 'Free delivery unlocked. ' : ''}Demo only, nothing is for sale.`);
      });
    });
    if (basket) basket.addEventListener('click', () => {
      if (!items) { say('Your basket is empty.', 'Add a candle to try it out.'); return; }
      say(`${plural(items)}, ${gbp(total)}.`, 'On a real shop, secure checkout opens here.');
    });
  });

  window.kmConcept = { setName, toast };
})();
