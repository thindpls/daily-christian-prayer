/* Daily Christian Prayer anonymous analytics. No visitor names or unique IDs are transmitted.
   Insert your GoatCounter site code below, e.g. "dailyprayers" for
   https://dailyprayers.goatcounter.com. Until configured, no analytics loads. */
(() => {
  'use strict';
  const SITE_CODE = 'woodcraftspectrum'; // Your GoatCounter site code.
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(SITE_CODE) || SITE_CODE === 'YOUR_GOATCOUNTER_CODE') return;
  if (!/^https?:$/.test(location.protocol)) return;

  let ready = false;
  const pending = [];
  function send(name) {
    const payload = {path: name, title: name.replace(/-/g, ' '), event: true, no_session: true};
    if (ready && window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count(payload);
    } else { pending.push(payload); }
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = `https://${SITE_CODE}.goatcounter.com/count`;
  script.onload = () => {
    ready = !!(window.goatcounter && typeof window.goatcounter.count === 'function');
    if (ready) pending.splice(0).forEach(item => window.goatcounter.count(item));
  };
  script.onerror = () => { pending.length = 0; };
  document.head.appendChild(script);

  const card = document.getElementById('daily-card');
  const dateKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; };
  function stored(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function store(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* storage disabled */ } }
  let openedThisLoad = false;
  function prayerOpened() {
    if (!card || card.hidden || openedThisLoad) return;
    openedThisLoad = true;
    send('prayer-open');
    const last = stored('prayer-analytics-last-day');
    if (last === null) send('first-prayer-use');
    else if (last !== dateKey()) send('return-day');
    store('prayer-analytics-last-day', dateKey());
  }
  prayerOpened();
  const begin = document.getElementById('start');
  if (begin) begin.addEventListener('click', () => { setTimeout(prayerOpened, 0); });

  const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
     window.navigator.standalone === true;
  if (standalone) send('home-screen-launch');

  // Record voluntary share actions, never the prayer text or a visitor's name.
  window.addEventListener('prayer-share-intent', (event) => {
    const kind = event && event.detail && event.detail.kind;
    if (kind === 'share-prayer') send('share-prayer');
    else if (kind === 'copy-prayer') send('copy-prayer-link');
    else if (kind === 'invite-friend') send('invite-friend');
  });

  const paypal = document.querySelector('a[href*="paypal.com/donate/"]');
  if (paypal) paypal.addEventListener('click', () => send('paypal-link-click'));
})();
