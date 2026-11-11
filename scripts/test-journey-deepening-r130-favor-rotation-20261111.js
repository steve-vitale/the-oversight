'use strict';
// test-journey-deepening-r130-favor-rotation-20261111.js -- R130 fix proof.
// The question (r130 prereg Q1/Q2 + Amendment A1): r129's stateless hash
// pick is verdict-unstable at panel size — r129's panel clustered 6/10 on
// one 1890 variant (60%, REPETITIVE) while r130's fresh panel spread 4/13
// (31%, VARIED) on the same mechanism. Only a STATEFUL rotation guarantees
// spread. The read-only contract blocks a stateful pick INSIDE
// convoFavorAction (journal path calls it outside any sitting; buildMenu
// stringifies the status into the menu cache key), so the fix moves the
// pick to the display sites: the action functions return a stable
// reasonKey ('favorblock' / 'favorpartner' / 'favoraway') alongside the
// unchanged canonical hash line, and the convo-dialogue favour/commit
// handlers rotate through the same pool via convoPickCycle (c.said
// persists across sittings; cycles on exhaustion seeded with the last 3
// lines, so no immediate repeat).
// Cases (engine, real Game):
// (1) the three *Cycle helpers return pool members (exact match, one of 4).
// (2) ROTATION GUARANTEE: 4 consecutive cycle calls in one sitting return
//     4 DISTINCT variants (no repeat until exhaustion) — the guarantee the
//     hash cannot give. Same for the partner and away pools.
// (3) the 5th cycle call differs from the 4th (no immediate repeat after
//     exhaustion — the cycle reseeds with the last 3).
// (4) reasonKey: convoFavorAction blocked returns 'favorblock'; the
//     delegated water/forage partner block returns 'favorpartner';
//     convoFavorCommit's away refusal returns 'favoraway' — and the
//     canonical reason is still a pool member (journal path unchanged).
// (5) READ-ONLY CONTRACT: calling convoFavorAction with NO conv record
//     creates none (the journal path must not open a sitting).
// (6) MENUKEY STABILITY: two buildMenu calls back-to-back give the same
//     cache key (reasonKey is stable; the rotation never runs on a menu
//     build, so the menu cache still hits).
// (7) END-TO-END (favour_requirements): asking "Why can't I do this now?"
//     4 times in one sitting speaks 4 DISTINCT block variants; the 5th
//     ask reframes ("As I said — ...") — the r21 reframe preserved,
//     deferred to pool exhaustion.
// (8) END-TO-END (commit, away): a refused commit to an away partner
//     speaks an away-pool member, rotated across villagers (two villagers'
//     refusals differ when the ledger has the first variant).
// The expected pools are literals in this test (the contract); the engine
// implements them. If the engine drifts, the membership cases fail first.
// RED/FAILURE MODE: on the pre-fix engine, (1)-(3) throw (the *Cycle
// helpers do not exist), (4) fails (reasonKey undefined), (7)-(8) fail
// (the spoken line is the single hash pick, so 4 asks repeat it). Run RED
// on a temp copy with the HEAD (pre-fix) src/js/convo-wants.js,
// favor-water.js, favor-forage.js, convo-dialogue.js.
const K = require('./godpath/lib');
const T = K.reporter('R130 favour-block rotation (engine)');

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
  const G = await K.load({ seed: 13007 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  K.newRun(G);
  const v = G.state.village, s = G.state.scholar;
  s.day = 45; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
  v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
  v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  const roster = (v.roster || []).filter(id => id !== G.villagerId && !G.getPerson(id).dead);
  T.ok('setup: a roster to vary over', roster.length >= 6, 'roster=' + roster.length);

  // (1) cycle helpers return pool members.
  const b0 = G.convoFavorBlockLineCycle(roster[0]);
  const p0 = G.convoFavorPartnerBlockLineCycle(roster[0]);
  const a0 = G.convoFavorAwayLineCycle(roster[0]);
  T.ok('Q1 engine (1) cycle helpers return pool members',
    BLOCK_POOL.indexOf(b0) >= 0 && PARTNER_POOL.indexOf(p0) >= 0 && AWAY_POOL.indexOf(a0) >= 0,
    'block=' + JSON.stringify(b0) + ' partner=' + JSON.stringify(p0) + ' away=' + JSON.stringify(a0));

  // (2) rotation guarantee: 4 consecutive cycle calls, one sitting, 4 distinct.
  // Open a sitting first (convoPickCycle needs the conv ledger).
  const cycVid = roster[1];
  const r0 = G.startConvo(cycVid);
  T.ok('setup: sitting opens for the cycle vid', !!r0, 'r0=' + JSON.stringify(r0 && r0.line));
  const blockCycle = [G.convoFavorBlockLineCycle(cycVid), G.convoFavorBlockLineCycle(cycVid), G.convoFavorBlockLineCycle(cycVid), G.convoFavorBlockLineCycle(cycVid)];
  const partnerCycle = [G.convoFavorPartnerBlockLineCycle(cycVid), G.convoFavorPartnerBlockLineCycle(cycVid), G.convoFavorPartnerBlockLineCycle(cycVid), G.convoFavorPartnerBlockLineCycle(cycVid)];
  const awayCycle = [G.convoFavorAwayLineCycle(cycVid), G.convoFavorAwayLineCycle(cycVid), G.convoFavorAwayLineCycle(cycVid), G.convoFavorAwayLineCycle(cycVid)];
  T.ok('Q1 engine (2a) four block cycle calls are four distinct variants',
    new Set(blockCycle).size === 4, 'cycle=' + JSON.stringify(blockCycle));
  T.ok('Q1b engine (2b) four partner cycle calls are four distinct variants',
    new Set(partnerCycle).size === 4, 'cycle=' + JSON.stringify(partnerCycle));
  T.ok('Q3(a) engine (2c) four away cycle calls are four distinct variants',
    new Set(awayCycle).size === 4, 'cycle=' + JSON.stringify(awayCycle));

  // (3) the 5th cycle call differs from the 4th (no immediate repeat).
  const b5 = G.convoFavorBlockLineCycle(cycVid);
  T.ok('Q1 engine (3) fifth block cycle call differs from the fourth',
    b5 !== blockCycle[3], 'fourth=' + JSON.stringify(blockCycle[3]) + ' fifth=' + JSON.stringify(b5));

  // (4) reasonKey on the action returns; canonical reason still a pool member.
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
  T.ok('Q1 engine (4a) blocked favour action carries reasonKey favorblock + pool reason',
    !actErr && act && act.ready === false && act.reasonKey === 'favorblock' && BLOCK_POOL.indexOf(act.reason) >= 0,
    'err=' + (actErr && actErr.message) + ' act=' + JSON.stringify(act));
  // Partner block through the delegated water action. The villager must be
  // OUTSIDE the hall (npcInside false, matching the scholar) or the
  // inside/outside branch fires before the adjacency check.
  const wVid = roster[5];
  v.positions[wVid] = { mx: 7, my: 7 };
  v.nodePos[wVid] = { nx: v.px, ny: v.py };
  v.npcInside = v.npcInside || {};
  v.npcInside[wVid] = false;
  let wact = null, wErr = null;
  try { wact = G.convoFavorAction(wVid, { kind: 'water_haul', state: 'asked', vid: wVid, id: 'f-test-2' }); }
  catch (e) { wErr = e; }
  T.ok('Q1b engine (4b) delegated water block carries reasonKey favorpartner + pool reason',
    !wErr && wact && wact.ready === false && wact.reasonKey === 'favorpartner' && PARTNER_POOL.indexOf(wact.reason) >= 0,
    'err=' + (wErr && wErr.message) + ' act=' + JSON.stringify(wact));
  // Away refusal through the commit path.
  const aVid = roster[2];
  v.away[aVid] = true;
  let fc = null, fcErr = null;
  try { fc = G.convoFavorCommit(aVid, { kind: 'water_haul', state: 'asked', vid: aVid, id: 'f-test-3' }); }
  catch (e) { fcErr = e; }
  T.ok('Q3(a) engine (4c) away commit refusal carries reasonKey favoraway + pool line',
    !fcErr && fc && fc.ok === false && fc.away === true && fc.reasonKey === 'favoraway' && AWAY_POOL.indexOf(fc.line) >= 0,
    'err=' + (fcErr && fcErr.message) + ' fc=' + JSON.stringify(fc));
  v.away = {};

  // (5) read-only contract: no conv record created by the action call.
  const roVid = roster[3];
  const convBefore = (v.conv || {})[roVid];
  let roAct = null;
  try { roAct = G.convoFavorAction(roVid, { kind: 'food_share', state: 'asked', vid: roVid, id: 'f-test-4' }); } catch (e) { roAct = null; }
  const convAfter = (v.conv || {})[roVid];
  T.ok('Q1 engine (5) convoFavorAction creates no conv record (read-only)',
    !convBefore && !convAfter && roAct && roAct.ready === false,
    'before=' + JSON.stringify(!!convBefore) + ' after=' + JSON.stringify(!!convAfter));

  // (6) menuKey stability across back-to-back builds.
  const mVid = roster[0];
  G.startConvo(mVid);
  const cM = G.convoGet(mVid);
  let key1 = null, key2 = null;
  try { G.convoChoices(mVid); key1 = cM.replyMenu && cM.replyMenu.key; G.convoChoices(mVid); key2 = cM.replyMenu && cM.replyMenu.key; } catch (e) { key1 = 'ERR:' + e.message; }
  T.ok('Q1 engine (6) menu cache key is stable across rebuilds',
    !!key1 && key1 === key2, 'key1=' + String(key1).slice(0, 120) + ' key2=' + String(key2).slice(0, 120));

  // (7) end-to-end: four "Why can't I do this now?" asks, four distinct lines.
  const eVid = roster[4];
  const favor = G.convoBuildFavor(eVid, { kind: 'food_share' });
  T.ok('setup: favour built for the end-to-end sitting', !!favor, 'favor=' + JSON.stringify(favor && favor.kind));
  const rs = G.startConvo(eVid);
  T.ok('setup: sitting opens for the end-to-end vid', !!rs, 'line=' + JSON.stringify(rs && rs.line));
  const cE = G.convoGet(eVid);
  cE.want = { id: 'ask_favor', favor, stage: 1, resolution: 'none' };
  cE.thread = 'want';
  v.positions[eVid] = { mx: 7, my: 7 };
  v.nodePos[eVid] = { nx: v.px, ny: v.py };
  v.away = {};
  const spoken = [];
  let turnErr = null;
  for (let i = 0; i < 5; i++) {
    try {
      G.convoChoices(eVid);
      const r = G.convoTurn(eVid, 'dlg:favor_requirements');
      spoken.push(r && r.line);
    } catch (e) { turnErr = e; break; }
  }
  T.ok('Q1 engine (7a) four requirements asks speak four distinct block variants',
    !turnErr && spoken.length === 5 && new Set(spoken.slice(0, 4)).size === 4 && spoken.slice(0, 4).every(l => BLOCK_POOL.indexOf(l) >= 0),
    'err=' + (turnErr && turnErr.message) + ' spoken=' + JSON.stringify(spoken));
  T.ok('Q1 engine (7b) fifth requirements ask reframes instead of repeating',
    !turnErr && spoken.length === 5 && typeof spoken[4] === 'string' && spoken[4].indexOf('As I said — ') === 0,
    'fifth=' + JSON.stringify(spoken[4]));

  // (8) end-to-end: refused commit to an away partner speaks an away-pool line.
  const xVid = roster[2];
  const xFavor = G.convoBuildFavor(xVid, { kind: 'water_haul', water: 5 });
  const xs = G.startConvo(xVid);
  T.ok('setup: sitting opens for the away-commit vid', !!xs, 'line=' + JSON.stringify(xs && xs.line));
  const cX = G.convoGet(xVid);
  // Keep the naturally selected want's def (the commit handler requires a
  // live want: w.def + stage < 3); only re-point it at the away favour.
  const wNat = cX.want || {};
  cX.want = { ...wNat, id: 'ask_favor', favor: xFavor, stage: 1, resolution: 'none' };
  cX.thread = 'want';
  v.away[xVid] = true;
  let xLine = null, xErr = null;
  try {
    G.convoChoices(xVid);
    const r = G.convoTurn(xVid, 'dlg:commit');
    xLine = r && r.line;
  } catch (e) { xErr = e; }
  T.ok('Q3(a) engine (8) refused away commit speaks an away-pool member',
    !xErr && AWAY_POOL.indexOf(xLine) >= 0,
    'err=' + (xErr && xErr.message) + ' line=' + JSON.stringify(xLine));
  v.away = {};
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
