/* King Media · lp.js · the short enquiry form on the advert landing pages.
 * It sends through the same free question form as the home page (api/submit.php), so nothing new runs on the server. */
(function () {
  'use strict';
  var EMAIL = 'enquiries@kingmedia.uk';
  var API = '/api/submit.php';
  var opened = Date.now();
  var local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var form = document.getElementById('lpForm');
  var dock = document.getElementById('lpDock');
  var card = document.getElementById('start');

  // The phone bar steps aside while the form is on screen
  if (dock && card && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { dock.classList.toggle('is-off', es[0].isIntersecting); }, { threshold: 0.15 }).observe(card);
  }

  /* ---------- The live showroom: a real concept site runs in the frames, with their name in it ---------- */
  var root = document.documentElement;
  var live = document.getElementById('lpLive');
  var still = function () { return !root.classList.contains('motion-ok'); };
  var fit = function (screen) { if (screen.clientWidth) screen.style.setProperty('--k', String(screen.clientWidth / Number(screen.dataset.vw))); };
  var screens = [].slice.call(document.querySelectorAll('.lp-frame__screen'));
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) { es.forEach(function (e) { fit(e.target); }); }) : null;
  screens.forEach(function (s) { fit(s); if (ro) ro.observe(s); });

  function frameIn(screen, src, onready) {
    var f = document.createElement('iframe');
    f.className = 'is-loading';
    f.title = 'Live concept website';
    f.setAttribute('scrolling', 'yes');
    f.addEventListener('load', function () { f.classList.remove('is-loading'); if (onready) onready(f); });
    f.src = src;
    var old = screen.querySelector('iframe');
    if (old) old.remove();
    screen.appendChild(f);
    return f;
  }

  if (live) (function () {
    var concepts = JSON.parse(live.dataset.concepts);
    var slug = live.dataset.slug;
    var star = document.getElementById('lpStar'), nameIn = document.getElementById('lpStarName'), statusEl = document.getElementById('lpStarStatus');
    var tourBtn = document.getElementById('lpTour'), tourText = document.getElementById('lpTourText');
    var openLink = document.getElementById('lpLiveOpen'), cap = document.getElementById('lpLiveCap'), urlEl = document.getElementById('lpLiveUrl');
    var deskScreen = live.querySelector('.lp-frame--desk .lp-frame__screen'), phoneScreen = live.querySelector('.lp-frame--phone .lp-frame__screen');
    var wide = matchMedia('(min-width: 768px)');
    var frames = [];          // {f: iframe, y: number, dir: 1|-1, hold: ms}
    var paused = false, userPaused = false, inView = true, raf = 0, last = 0, resumeT = 0;
    var clean = function (v) { return String(v || '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32); };
    var name = function () { return clean(nameIn.value); };

    function api(fr) { try { return fr.f.contentWindow.kmConcept || null; } catch (e) { return null; } }
    function win(fr) { try { return fr.f.contentWindow; } catch (e) { return null; } }

    function applyName(caret) {
      var n = name();
      frames.forEach(function (fr) { var a = api(fr); if (a) a.setName(n, { caret: !!caret && !!n }); });
      openLink.href = '/concepts/' + slug + '/' + (n ? '?name=' + encodeURIComponent(n) : '');
      [].forEach.call(document.querySelectorAll('[data-concept-link]'), function (a) {
        a.href = a.getAttribute('href').split('?')[0] + (n ? '?name=' + encodeURIComponent(n) : '');
      });
      var biz = document.getElementById('lpBiz');
      if (biz && n && (!biz.value.trim() || biz.dataset.auto === '1')) { biz.value = n; biz.dataset.auto = '1'; }
    }

    function toTop() { frames.forEach(function (fr) { var w = win(fr); fr.y = 0; fr.dir = 1; fr.hold = 2600; if (w) w.scrollTo(0, 0); }); }

    function tick(t) {
      raf = 0;
      var dt = Math.min(64, t - (last || t)); last = t;
      if (!paused && inView && !still()) {
        frames.forEach(function (fr) {
          var w = win(fr); if (!w || !w.document || !w.document.documentElement) return;
          if (fr.hold > 0) { fr.hold -= dt; return; }
          var max = w.document.documentElement.scrollHeight - w.innerHeight;
          if (max <= 0) return;
          fr.y += fr.dir * (fr.dir > 0 ? 0.085 : 0.9) * dt;   // a slow read down, a quick return
          if (fr.y >= max) { fr.y = max; fr.dir = -1; fr.hold = 1800; }
          if (fr.y <= 0) { fr.y = 0; fr.dir = 1; fr.hold = 2200; }
          w.scrollTo({ top: fr.y, behavior: 'instant' });
        });
      }
      if (frames.length && !paused && inView && !still()) raf = requestAnimationFrame(tick);
    }
    function run() { last = 0; if (!raf && !paused && inView && !still()) raf = requestAnimationFrame(tick); }
    function setPaused(on, byUser) {
      paused = on; if (byUser !== undefined) userPaused = byUser;
      tourBtn.setAttribute('aria-pressed', String(on));
      tourText.textContent = on ? 'Play the tour' : 'Pause the tour';
      if (!on) { frames.forEach(function (fr) { var w = win(fr); if (w) fr.y = w.scrollY; }); run(); }
    }

    function ready(f) {
      var fr = { f: f, y: 0, dir: 1, hold: 1600 };
      frames.push(fr);
      applyName(false);
      // The moment someone uses the site in the frame, the tour steps aside
      try {
        ['wheel', 'pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
          f.contentWindow.addEventListener(ev, function () { if (!paused) setPaused(true, true); }, { passive: true });
        });
      } catch (e) {}
      if (!still()) { tourBtn.hidden = false; run(); }
    }

    function mount() {
      frames = [];
      var q = '?embed=1';
      frameIn(phoneScreen, '/concepts/' + slug + '/' + q, ready);
      if (wide.matches) frameIn(deskScreen, '/concepts/' + slug + '/' + q, ready);
    }

    function describe() {
      var c = concepts[slug], n = name();
      cap.textContent = 'Concept: ' + c.name + ', a working website we designed and built for a made-up business. Not a real business.';
      urlEl.textContent = 'kingmedia.uk/concepts/' + slug;
      statusEl.textContent = n ? 'That’s ' + n + ' on our ' + c.kind + ' concept. It’s a real, working page' + (wide.matches ? ': scroll it and click around.' : '.') : '';
    }

    var typeT = 0;
    nameIn.addEventListener('input', function () {
      clearTimeout(resumeT); clearTimeout(typeT);
      if (!paused) paused = true;       // hold the tour while they type, without flipping the button
      toTop(); applyName(true); describe();
      typeT = setTimeout(function () { applyName(false); }, 900);
      resumeT = setTimeout(function () { if (!userPaused) { paused = false; frames.forEach(function (fr) { fr.hold = 1800; }); run(); } }, 2600);
    });
    star.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!name()) { nameIn.focus(); return; }
      applyName(false); describe(); nameIn.blur();
      if (!wide.matches) live.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'center' });
    });
    [].forEach.call(star.querySelectorAll('input[name="lpTrade"]'), function (r) {
      r.addEventListener('change', function () {
        if (!r.checked || r.value === slug) return;
        slug = r.value;
        live.classList.add('is-switched');
        cancelAnimationFrame(raf); raf = 0;
        mount(); describe(); applyName(false);
      });
    });
    var bizIn = document.getElementById('lpBiz');
    if (bizIn) bizIn.addEventListener('input', function () { bizIn.dataset.auto = '0'; });
    tourBtn.addEventListener('click', function () { setPaused(!paused, !paused); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) run(); }, { threshold: 0.05 }).observe(live);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) run(); });

    // Posters paint first; the live pages come in once the page has settled
    var go = function () { (window.requestIdleCallback || function (cb) { setTimeout(cb, 300); })(mount, { timeout: 1500 }); };
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
  })();

  // The film loads only when asked for: it is 14MB of footage
  var play = document.getElementById('lpFilmPlay');
  if (play) play.addEventListener('click', function () {
    var screen = play.parentNode;
    play.remove();
    frameIn(screen, '/concepts/velluto/?embed=1&play=1', function (f) { f.title = 'Velluto concept: a scroll film'; f.focus(); });
  });


  if (!form) return;

  var status = document.getElementById('lpStatus');
  var btn = form.querySelector('button[type="submit"]');
  var label = btn.querySelector('.btn__label');
  var idle = label.textContent;
  var checks = {
    lpName: function (v) { return v ? '' : 'Please tell us your name.'; },
    lpBiz: function (v) { return v ? '' : 'Please tell us your business name.'; },
    lpEmail: function (v) { return !v ? 'We need an email address to reply to.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'That email doesn’t look quite right. Please check it.'; }
  };
  var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };

  function mark(id, msg) {
    var el = document.getElementById(id), err = document.getElementById(id + 'Err');
    if (!el || !err) return;
    err.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }
  Object.keys(checks).forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('blur', function () { if (el.value.trim() || el.hasAttribute('aria-invalid')) mark(id, checks[id](el.value.trim())); });
  });

  function busy(on) {
    btn.disabled = on;
    btn.classList.toggle('is-busy', on);
    btn.setAttribute('aria-busy', String(on));
    label.textContent = on ? 'Sending…' : idle;
  }

  function done(sent) {
    var first = val('lpName').split(/\s+/)[0];
    var box = document.createElement('div');
    box.className = 'lp-done';
    var h = document.createElement('h2');
    h.tabIndex = -1;
    h.textContent = 'Thanks, ' + first + '. ' + (sent ? 'We’ve got it.' : 'That’s how it will look.');
    var p = document.createElement('p');
    p.textContent = sent
      ? 'We’ll reply by email within 24 hours to talk through your website and arrange your demo.'
      : 'This is a preview, so nothing has been sent.';
    box.appendChild(h); box.appendChild(p);
    if (sent) {
      var n = document.createElement('p');
      n.className = 'lp-done__note';
      n.textContent = 'Nothing to pay, and no obligation. If you don’t see our reply, check your junk folder or email ' + EMAIL + '.';
      box.appendChild(n);
      document.dispatchEvent(new CustomEvent('km:lead'));
    }
    form.replaceWith(box);
    var lede = document.getElementById('lpCardLede'), title = document.getElementById('lpCardTitle');
    if (lede) lede.remove();
    if (title) title.remove();
    h.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    Object.keys(checks).forEach(function (id) { var m = checks[id](val(id)); mark(id, m); if (m) bad.push(id); });
    if (bad.length) {
      document.getElementById(bad[0]).focus();
      status.className = 'lp-form__status is-err';
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }
    // Which advert brought them, read from the address only (no cookies)
    var q = new URLSearchParams(location.search);
    var from = ['utm_campaign', 'utm_term', 'utm_content'].map(function (k) { return q.get(k) ? k.slice(4) + ': ' + q.get(k).slice(0, 80) : ''; }).filter(Boolean);
    if (q.get('gclid') || q.get('gbraid') || q.get('wbraid')) from.unshift('Google Ads click');
    var lines = [
      'Website enquiry from the ' + (form.dataset.page || 'landing') + ' page',
      'Business: ' + val('lpBiz'),
      val('lpPhone') ? 'Phone: ' + val('lpPhone') : '',
      val('lpMsg') ? '\n' + val('lpMsg') : '',
      from.length ? '\nCame from: ' + from.join(' · ') : ''
    ].filter(Boolean);
    var data = new FormData();
    data.set('form', 'question');
    data.set('qName', val('lpName'));
    data.set('qEmail', val('lpEmail'));
    data.set('qText', lines.join('\n'));
    data.set('km_extra', form.elements.km_extra.value);
    data.set('t', String(Math.round((Date.now() - opened) / 1000)));
    status.className = 'lp-form__status';
    status.textContent = '';
    busy(true);
    var xhr = new XMLHttpRequest();
    var finish = function (code, body) {
      busy(false);
      var res = null;
      try { res = JSON.parse(body); } catch (err) {}
      if (res && res.ok) return done(true);
      if (local && !res && [0, 404, 405, 501].indexOf(code) !== -1) return done(false); // preview on your own computer
      if (res && res.fields) {
        var map = { qName: 'lpName', qEmail: 'lpEmail', qText: 'lpBiz' }, firstBad = null;
        Object.keys(res.fields).forEach(function (k) { if (map[k]) { mark(map[k], res.fields[k]); firstBad = firstBad || map[k]; } });
        if (firstBad) document.getElementById(firstBad).focus();
      }
      status.className = 'lp-form__status is-err';
      status.textContent = (res && res.message ? res.message + ' ' : 'Sorry, that didn’t send. ') + 'Please try again, or email us at ' + EMAIL + '.';
    };
    xhr.open('POST', API);
    xhr.timeout = 30000;
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function () { finish(xhr.status, xhr.responseText); };
    xhr.onerror = xhr.ontimeout = function () { finish(0, ''); };
    xhr.send(data);
  });
})();
