/* King Media · track.js · advert measurement. OFF until an ID is filled in below.
 *
 * To switch on: put your Google Ads ID in `ads` (it looks like AW-123456789) and the two
 * conversion labels Google gives you. Nothing loads, and no cookie is set, unless a visitor
 * presses Accept on the cookie choice. Tell Claude when you switch this on: the privacy
 * page has to say so first.
 */
(function () {
  'use strict';
  var CFG = {
    ads: '',        // e.g. 'AW-123456789'
    lead: '',       // conversion label for "sent an enquiry" (the free forms)
    demoPaid: ''    // conversion label for "paid the £4.99 demo fee"
  };
  var KEY = 'km-consent';
  var params = new URLSearchParams(location.search); // read now: the home page tidies its address later
  var paidNow = params.get('payment') === 'success';
  var queue = [];
  var loaded = false;

  function consent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  function gtag() { window.dataLayer.push(arguments); }

  function load() {
    if (loaded || !CFG.ads) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'denied' });
    gtag('js', new Date());
    gtag('config', CFG.ads);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.ads);
    document.head.appendChild(s);
    queue.splice(0).forEach(send);
  }

  function send(ev) {
    if (!CFG.ads || !ev.label) return;
    if (!loaded) { queue.push(ev); return; }
    var data = { send_to: CFG.ads + '/' + ev.label };
    if (ev.value) { data.value = ev.value; data.currency = 'GBP'; }
    gtag('event', 'conversion', data);
  }

  function banner() {
    var st = document.createElement('style');
    st.textContent = '.km-consent { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: var(--z-cookie); display: grid; gap: 12px; max-width: 520px; margin-inline: auto; padding: 16px 20px; background: var(--ink-900); border: 1px solid var(--line-strong); color: var(--fg); font-size: var(--fs-small); line-height: 1.5; } .km-consent__actions { display: flex; flex-wrap: wrap; gap: 8px; } .km-consent__actions .btn { flex: 1 1 140px; }';
    document.head.appendChild(st);
    var b = document.createElement('div');
    b.className = 'km-consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie choice');
    b.innerHTML = '<p>Can we use Google Ads cookies to see which of our adverts lead to enquiries? Nothing is set unless you accept. <a class="link" href="/privacy.html#cookies">Cookie policy</a></p>'
      + '<div class="km-consent__actions"><button type="button" class="btn btn--ghost btn--sm" data-c="all"><span class="btn__label">Accept</span></button>'
      + '<button type="button" class="btn btn--ghost btn--sm" data-c="essential"><span class="btn__label">No thanks</span></button></div>';
    b.addEventListener('click', function (e) {
      var t = e.target.closest('[data-c]');
      if (!t) return;
      try { localStorage.setItem(KEY, t.dataset.c); } catch (err) {}
      b.remove();
      if (t.dataset.c === 'all') load();
    });
    document.body.appendChild(b);
  }

  // Other scripts report what happened; this file decides whether anything is sent
  document.addEventListener('km:lead', function () { send({ label: CFG.lead }); });

  function start() {
    if (!CFG.ads) return;
    if (consent() === 'all') load();
    else if (!consent()) banner();
    if (paidNow) send({ label: CFG.demoPaid, value: 4.99 });
    // The home page's free question form says "Thanks" when it has sent
    var ask = document.getElementById('askStatus');
    if (ask && 'MutationObserver' in window) {
      new MutationObserver(function () { if (ask.classList.contains('is-ok')) send({ label: CFG.lead }); })
        .observe(ask, { attributes: true, attributeFilter: ['class'] });
    }
    // Accepting on the home page's own cookie box counts too
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-consent="all"]')) setTimeout(load, 0);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
