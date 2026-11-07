'use strict';
// test-journey-deepening-r116-listen-20261107.js -- R116 Q1 proof.
// (A) PICKER (the real driver pickChoice, via child processes — PANEL is
//     a load-time const, so each policy gets its own process):
//     (1) before-policy leaves a nonverbal sitting immediately (never
//         listens — the r114 behavior the before-panel measures);
//     (2) after-policy presses nv:listen in a nonverbal sitting;
//     (3) after-policy presses speak_back when offered (it outranks listen);
//     (4) goon still outranks listen in the after-panel (a held beat
//         speaks first, then the scholar listens);
//     (5) verbal menus are unchanged in both panels (ENGAGE wins);
//     (6) the bond branch is unchanged in both panels (bond:accept first).
// (B) ENGINE (the real Game): the exposure mechanism the after-panel
//     relies on:
//     (7) nvOpen grants +1 exposure; (8) nv:listen grants +3;
//     (9) nv:nod grants +1; (10) repeated listening across sittings
//     reaches 25, the scholar gains the language
//     (s.languages.spanish === 1) and commLevel flips 'none'->'partial'.
// RED/FAILURE MODE: (1)-(6) fail if the LISTEN branch is misplaced
// (e.g. outranking goon, or firing in verbal sittings); (7)-(10) fail
// if the engine's listen path does not teach (then the after-panel
// would measure nothing and Q1's ARC verdicts would be void).
const K = require('./godpath/lib');
const { execFileSync } = require('child_process');
const path = require('path');
const T = K.reporter('R116 listen policy (picker) + language exposure (engine)');
const DRIVER = path.join(__dirname, 'journey-deepening-r116-20261107.js');

function pickIn(panel, menu) {
  const script = `
    const D = require(${JSON.stringify(DRIVER)});
    D.beginSitting();
    const menu = ${JSON.stringify(menu)};
    const pick = D.pickChoice(menu, 0);
    console.log(pick ? pick.id : 'null');
  `;
  const out = execFileSync(process.execPath, ['-e', script], {
    env: Object.assign({}, process.env, { PANEL: panel }),
    encoding: 'utf8', timeout: 60000,
  });
  return out.trim().split('\n').pop().trim();
}
const NV_MENU = [
  { id: 'nv:nod', label: '(nod slowly)' },
  { id: 'nv:smile', label: '(smile)' },
  { id: 'nv:pointself', label: '(point: you, them, together)' },
  { id: 'nv:listen', label: '(listen hard — catch words)' },
  { id: 'leave', label: '(walk away)' },
];
const NV_MENU_SPEAK = NV_MENU.concat([{ id: 'speak_back', label: '(try your Spanish)' }]);
const NV_MENU_GOON = [{ id: 'goon', label: 'And?' }].concat(NV_MENU);
const VERBAL_MENU = [
  { id: 'dlg:more', label: 'Tell me more.' },
  { id: 'dlg:details', label: 'Details?' },
  { id: 'goon', label: 'And?' },
  { id: 'leave', label: '"I should go."' },
];
const BOND_MENU = [
  { id: 'bond:accept', label: 'Yes. Stick together.' },
  { id: 'bond:decline', label: 'Not like that. Not yet.' },
  { id: 'leave', label: '"I should go."' },
];
// (1) before-policy: never listens.
T.ok('Q1 picker (1) before-policy leaves a nonverbal sitting immediately',
  pickIn('before', NV_MENU) === 'leave', 'got ' + pickIn('before', NV_MENU));
// (2) after-policy: listens.
T.ok('Q1 picker (2) after-policy presses nv:listen in a nonverbal sitting',
  pickIn('after', NV_MENU) === 'nv:listen', 'got ' + pickIn('after', NV_MENU));
// (3) after-policy: speak_back outranks listen.
T.ok('Q1 picker (3) after-policy presses speak_back when offered',
  pickIn('after', NV_MENU_SPEAK) === 'speak_back', 'got ' + pickIn('after', NV_MENU_SPEAK));
// (4) after-policy: goon outranks listen.
T.ok('Q1 picker (4) after-policy presses goon before listening (held beat first)',
  pickIn('after', NV_MENU_GOON) === 'goon', 'got ' + pickIn('after', NV_MENU_GOON));
// (5) verbal menus unchanged in both panels.
T.ok('Q1 picker (5a) before-policy verbal menu still picks dlg:more',
  pickIn('before', VERBAL_MENU) === 'dlg:more', 'got ' + pickIn('before', VERBAL_MENU));
T.ok('Q1 picker (5b) after-policy verbal menu still picks dlg:more',
  pickIn('after', VERBAL_MENU) === 'dlg:more', 'got ' + pickIn('after', VERBAL_MENU));
// (6) bond branch unchanged in both panels.
T.ok('Q1 picker (6a) before-policy bond menu still answers bond:accept',
  pickIn('before', BOND_MENU) === 'bond:accept', 'got ' + pickIn('before', BOND_MENU));
T.ok('Q1 picker (6b) after-policy bond menu still answers bond:accept',
  pickIn('after', BOND_MENU) === 'bond:accept', 'got ' + pickIn('after', BOND_MENU));

(async () => {
  const G = await K.load({ seed: 11607 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  // Fresh Spanish-only speaker each sitting (exposure is per LANGUAGE,
  // so any speaker of the tongue teaches it — and a fresh villager per
  // sitting sidesteps any per-villager daily talk cap).
  const _used = new Set();
  function spanishSpeaker() {
    const v = G.state.village, s = G.state.scholar;
    const vid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead);
    if (!vid) throw Error('setup: no fresh roster villager left');
    _used.add(vid);
    const p = G.getPerson(vid);
    p.languages = { native: 'spanish' };
    v.away = {};
    v.trust = v.trust || {}; v.trust[vid] = 30;
    return vid;
  }
  function setup(day) {
    // ONE newRun for the whole arc: newRun regenerates the roster and
    // resets the scholar (languages + langExposure included), so it must
    // run exactly once — later sittings only advance the day.
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    s.languages = { english: 2 };
    s.langExposure = {};
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  }
  function nextDay(day) {
    // Advance the day WITHOUT touching languages or exposure: the arc
    // accumulates across sittings, and that is the property under test.
    const v = G.state.village, s = G.state.scholar;
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100;
    v.away = {}; v.engaged = {};
  }
  setup(4);
  const vid0 = spanishSpeaker();
  T.ok('setup (B): comm is none for a Spanish-only villager',
    (G.commLevel(vid0) || {}).level === 'none', JSON.stringify(G.commLevel(vid0)));
  T.ok('setup (B): exposure starts at 0', G.langExposure('spanish') === 0, String(G.langExposure('spanish')));
  // (7) open grants +1.
  const st = G.startConvo(vid0);
  T.ok('setup (B): nonverbal sitting opens', !!st, 'startConvo null');
  T.ok('Q1 engine (7) nvOpen grants +1 exposure', G.langExposure('spanish') === 1, String(G.langExposure('spanish')));
  T.ok('setup (B): the sitting menu offers nv:listen',
    (st.choices || []).some(x => x && x.id === 'nv:listen'), JSON.stringify((st.choices || []).map(x => x && x.id)));
  // (8) listen grants +3.
  let r = G.convoTurn(vid0, 'nv:listen');
  T.ok('Q1 engine (8) nv:listen grants +3 exposure (1 -> 4)', G.langExposure('spanish') === 4, String(G.langExposure('spanish')));
  // (9) nod grants +1.
  r = G.convoTurn(vid0, 'nv:nod');
  T.ok('Q1 engine (9) nv:nod grants +1 exposure (4 -> 5)', G.langExposure('spanish') === 5, String(G.langExposure('spanish')));
  T.ok('setup (B): comm still none at exposure 5',
    (G.commLevel(vid0) || {}).level === 'none', JSON.stringify(G.commLevel(vid0)));
  G.endConvo(vid0, 'done');
  // (10) the arc: listen across sittings until 25, then the flip.
  let sittings = 1;
  let flipped = false;
  for (let day = 5; day <= 12 && !flipped; day++) {
    nextDay(day);
    const vid = spanishSpeaker();
    const st2 = G.startConvo(vid);
    if (!st2) { T.ok('Q1 engine (10) sitting opens on day ' + day, false, 'startConvo null'); break; }
    sittings++;
    let turns = 0;
    let rr = st2;
    while (rr && !rr.ended && turns < 10) {
      const hasListen = (rr.choices || []).some(x => x && x.id === 'nv:listen');
      if (!hasListen) break;
      rr = G.convoTurn(vid, 'nv:listen');
      turns++;
      if (G.langExposure('spanish') >= 25) break;
    }
    try { G.endConvo(vid, 'done'); } catch (e) {}
    if (G.langExposure('spanish') >= 25) flipped = true;
  }
  T.ok('Q1 engine (10) listening reaches exposure 25 within 8 sittings', G.langExposure('spanish') >= 25,
    'exposure=' + G.langExposure('spanish') + ' sittings=' + sittings);
  T.ok('Q1 engine (10) the scholar gains Spanish at level 1',
    ((G.state.scholar.languages || {}).spanish | 0) === 1, JSON.stringify(G.state.scholar.languages));
  const vidLast = [..._used].pop();
  T.ok("Q1 engine (10) commLevel flips 'none' -> 'partial'",
    (G.commLevel(vidLast) || {}).level === 'partial', JSON.stringify(G.commLevel(vidLast)));
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
