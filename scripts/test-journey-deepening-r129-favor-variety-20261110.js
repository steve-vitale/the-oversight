'use strict';
// test-journey-deepening-r129-favor-variety-20261110.js -- R129 fix proof.
// The question (r129 prereg Q1/Q1b/Q3(a)/Q3(b) + Amendments A1/A2): the
// Haven-door adjacency block was ONE fixed sentence per site (before-panel,
// 8 seeds: 1890 line 10x, partner line 18x, away line 18x), and the
// water-haul opener said "1 liters". The fix gives each blocked line four
// variants picked STATELESSLY by convoFavorHash (stable person key + day
// + per-pool seq) — stateless because convoFavorAction is documented
// read-only (it reads the conv map without creating one; the journal path
// calls it outside any sitting), so the convoPickCycle ledger is not
// available there. The same villager on the same day gets the same
// variant (which preserves the r21 re-ask reframe); different villagers
// and days spread across the four wordings.
// Cases (engine, real Game):
// (1) convoFavorBlockLine returns a pool member (exact match, one of 4).
// (2) across the roster x days 40-80, >= 3 distinct block variants fire
//     (hash distribution; RED pre-fix: the helper does not exist).
// (3) the same (villager, day) returns the same variant (stability — the
//     reframe anchor); the same villager across days varies.
// (4) convoFavorPartnerBlockLine: pool member + >= 3 distinct.
// (5) convoFavorAwayLine: pool member (quoted) + >= 3 distinct.
// (6) cistern: water_haul build with water=1 says "1 liter" (never
//     "1 liters") in the opener and the why-line; water=2 says "2 liters".
// (7) end-to-end: convoFavorAction for a food_share favour with the
//     villager far away returns ready:false and a block-pool reason —
//     the line the player actually sees.
// The expected pools are literals in this test (the contract); the engine
// implements them. If the engine drifts, the membership cases fail first.
// RED/FAILURE MODE: on the pre-fix engine, (1)-(5) throw (the helpers do
// not exist), (6) fails ("1 liters" in the opener), (7) fails (the reason
// is the single fixed sentence). Run RED on a temp copy with the HEAD
// (pre-fix) src/js/convo-wants.js, favor-water.js, favor-forage.js.
const K = require('./godpath/lib');
const T = K.reporter('R129 favour-line variety (engine)');

const BLOCK_POOL = [
  'Move next to them, on the same side of the Haven door, to help.',
  'Stand beside them first — same side of the Haven door — then help.',
  'You need to be right next to them, same side of the Haven door, to help.',
  'Get to their side of the Haven door and stand next to them — then you can help.',
];
const PARTNER_POOL = [
  'Move next to your partner, on the same side of the Haven door.',
  'Stand beside your partner first — same side of the Haven door — then help.',
  'You need to be right next to your partner, same side of the Haven door, to help.',
  "Get to your partner's side of the Haven door and stand next to them — then you can help.",
];
const AWAY_POOL = [
  `"Wait — I'm away from Haven, out on the road. I can't promise a dawn meet while I'm out — find me when I'm back, and we'll set it then."`,
  `"I'm out on the road, away from Haven — no dawn meet while I'm out, I'm afraid. Catch me when I'm back and we'll set it then."`,
  `"Wait — I'm away from Haven right now, out on the road. I can't promise a dawn meet from out here — find me when I'm back and we'll set it then."`,
  `"Out on the road, away from Haven. A dawn meet's not something I can promise while I'm out — when I'm back, find me, and we'll set it then."`,
];

(async () => {
  const G = await K.load({ seed: 12907 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  K.newRun(G);
  const v = G.state.village, s = G.state.scholar;
  s.day = 45; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
  v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
  v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  const roster = (v.roster || []).filter(id => id !== G.villagerId && !G.getPerson(id).dead);
  T.ok('setup: a roster to vary over', roster.length >= 6, 'roster=' + roster.length);

  // (1) block line is a pool member.
  const b0 = G.convoFavorBlockLine(roster[0]);
  T.ok('Q1 engine (1) favour-block line is a pool member',
    BLOCK_POOL.indexOf(b0) >= 0, 'line=' + JSON.stringify(b0));

  // (2) roster x days -> >= 3 distinct block variants.
  const blockSeen = new Set();
  for (const day of [40, 45, 50, 55, 60, 65, 70, 75, 80]) {
    s.day = day;
    for (const vid of roster) blockSeen.add(G.convoFavorBlockLine(vid));
  }
  T.ok('Q1 engine (2) roster x days use >= 3 distinct block variants',
    blockSeen.size >= 3, 'distinct=' + blockSeen.size + ' variants=' + JSON.stringify([...blockSeen]));

  // (3) stability: same (villager, day) -> same variant; across days it varies.
  s.day = 50;
  const stableA = G.convoFavorBlockLine(roster[1]);
  const stableB = G.convoFavorBlockLine(roster[1]);
  const acrossDays = new Set();
  for (const day of [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]) {
    s.day = day;
    acrossDays.add(G.convoFavorBlockLine(roster[1]));
  }
  T.ok('Q1 engine (3) same villager+day is stable, across days it varies',
    stableA === stableB && acrossDays.size >= 2,
    'stable=' + JSON.stringify(stableA) + ' acrossDays=' + acrossDays.size);

  // (4) partner line: pool member + >= 3 distinct.
  const p0 = G.convoFavorPartnerBlockLine(roster[0]);
  const partnerSeen = new Set();
  for (const day of [40, 45, 50, 55, 60, 65, 70, 75, 80]) {
    s.day = day;
    for (const vid of roster) partnerSeen.add(G.convoFavorPartnerBlockLine(vid));
  }
  T.ok('Q1b engine (4) partner-block line is a pool member + >= 3 distinct',
    PARTNER_POOL.indexOf(p0) >= 0 && partnerSeen.size >= 3,
    'line=' + JSON.stringify(p0) + ' distinct=' + partnerSeen.size);

  // (5) away line: pool member (quoted) + >= 3 distinct.
  const a0 = G.convoFavorAwayLine(roster[0]);
  const awaySeen = new Set();
  for (const day of [40, 45, 50, 55, 60, 65, 70, 75, 80]) {
    s.day = day;
    for (const vid of roster) awaySeen.add(G.convoFavorAwayLine(vid));
  }
  T.ok('Q3(a) engine (5) away line is a pool member + >= 3 distinct',
    AWAY_POOL.indexOf(a0) >= 0 && awaySeen.size >= 3,
    'line=' + JSON.stringify(a0) + ' distinct=' + awaySeen.size);

  // (6) cistern pluralization through the real favour build.
  s.day = 45;
  const f1 = G.convoBuildFavor(roster[2], { kind: 'water_haul', water: 1 });
  const f2 = G.convoBuildFavor(roster[3], { kind: 'water_haul', water: 2 });
  const oneOk = f1 && /1 liter\b(?!s)/.test(f1.line) && !/1 liters/.test(f1.line) &&
    /1 liter\b(?!s)/.test(f1.whyLine) && !/1 liters/.test(f1.whyLine);
  const twoOk = f2 && /2 liters/.test(f2.line) && /2 liters/.test(f2.whyLine);
  T.ok('Q3(b) engine (6) 1 liter is singular, 2 liters is plural',
    !!oneOk && !!twoOk,
    'f1.line=' + JSON.stringify(f1 && f1.line) + ' f1.why=' + JSON.stringify(f1 && f1.whyLine) +
    ' f2.line=' + JSON.stringify(f2 && f2.line));

  // (7) end-to-end: the blocked reason the player actually sees.
  s.day = 45;
  const actVid = roster[4];
  v.positions = v.positions || {};
  v.positions[actVid] = { mx: 7, my: 7 };
  v.nodePos = v.nodePos || {};
  v.nodePos[actVid] = { nx: v.px, ny: v.py };
  v.away = {};
  let act = null, actErr = null;
  try { act = G.convoFavorAction(actVid, { kind: 'food_share', state: 'asked', vid: actVid, id: 'f-test-1' }); }
  catch (e) { actErr = e; }
  T.ok('Q1 engine (7) blocked favour action returns a block-pool reason',
    !actErr && act && act.ready === false && BLOCK_POOL.indexOf(act.reason) >= 0,
    'err=' + (actErr && actErr.message) + ' act=' + JSON.stringify(act));
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
