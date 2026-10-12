// Proof: sw.js runtime-caches audio responses (offline voice), and only audio.
// Runs the real fetch handler from sw.js against stubbed SW globals.
'use strict';
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../sw.js', 'utf8');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log('  FAIL', name); }
  else console.log('  ok  ', name);
}

// ---- stub the ServiceWorker globals ----
const handlers = {};
const store = new Map(); // url -> body marker
const caches = {
  open: async () => ({
    put: async (req, resp) => { store.set(req.url, resp._body); },
    match: async () => undefined,
  }),
  keys: async () => [],
  match: async () => undefined,
};
function makeResp(url, contentType, ok) {
  return {
    ok: ok !== false,
    headers: { get: (h) => h === 'content-type' ? contentType : null },
    _body: 'BYTES:' + url,
    clone() { return this; },
  };
}
let fetchImpl = async () => makeResp('x', 'text/plain');
const self = {
  addEventListener: (type, fn) => { handlers[type] = fn; },
  skipWaiting: () => {},
};
const fetch = (...a) => fetchImpl(...a);

// eval sw.js in this stubbed context
eval(src);
check('fetch handler registered', typeof handlers.fetch === 'function');

async function runFetch(url, contentType) {
  store.clear();
  fetchImpl = async () => makeResp(url, contentType);
  let out = null;
  const req = { method: 'GET', url, mode: 'no-cors' };
  await handlers.fetch({ request: req, respondWith: (p) => { out = p; } });
  const resp = await out;
  // let the caches.open().then() microtask flush
  await new Promise(r => setTimeout(r, 20));
  return { resp, cached: store.get(url) };
}

(async () => {
  // 1. audio by content-type gets cached
  let r = await runFetch('https://x/src/audio/system/sys-day7-01.mp3', 'audio/mpeg');
  check('mp3 by content-type cached for offline', r.cached === 'BYTES:https://x/src/audio/system/sys-day7-01.mp3');
  check('mp3 response still returned to player', r.resp && r.resp._body.indexOf('BYTES:') === 0);

  // 2. audio by URL path even without content-type
  r = await runFetch('https://x/src/audio/system/manifest.json', 'application/json');
  check('audio-dir URL cached even as json (manifest)', !!r.cached);

  // 3. non-audio not cached
  r = await runFetch('https://x/src/js/game.js', 'application/javascript');
  check('game.js NOT runtime-cached', r.cached === undefined);

  // 4. failed audio not cached
  fetchImpl = async () => makeResp('https://x/src/audio/system/missing.mp3', 'audio/mpeg', false);
  store.clear();
  let out = null;
  await handlers.fetch({ request: { method: 'GET', url: 'https://x/src/audio/system/missing.mp3', mode: 'no-cors' }, respondWith: (p) => { out = p; } });
  await out; await new Promise(res => setTimeout(res, 20));
  check('failed audio NOT cached', store.get('https://x/src/audio/system/missing.mp3') === undefined);

  // 5. cache failure never breaks playback
  const realOpen = caches.open;
  caches.open = async () => { throw new Error('quota'); };
  r = await runFetch('https://x/src/audio/system/sys-day7-01.mp3', 'audio/mpeg');
  check('playback survives cache failure', r.resp && r.resp._body.indexOf('BYTES:') === 0);
  caches.open = realOpen;

  console.log(`\n==== ${checks - fails}/${checks} checks passed ====`);
  process.exit(fails ? 1 : 0);
})();
