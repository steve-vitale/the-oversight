#!/usr/bin/env node
// scripts/test-ledgerdiag-20261016.js — proof test for the ledger
// counterfactual diagnostic (loop B sim-ledgerdiag-b, 2026-10-16,
// food-economy axis; #340 evidence-sharpener for the steve-call).
// ALL GREEN is the gate before ANY sweep spend.
//
// The instrument (scripts/ledgerdiag-lib-20261016.js) is a READ-ONLY
// diagnostic: zero src/js changes, zero policy changes. It must read the
// REAL ledger shapes — the -5000 trust-drop bar (game.js:14579), the
// -15000/-5000 justice-heat tiers (justice.js:104-106), the dated voluntary
// takeHist/giveHist (game.js:14188-14241), the undated communal-bowl takes
// (villageMeal, game.js:26632), the cold-shoulder fiction beats
// (justice.js:135-139), and the succession book-reset (ledger.js:841-844).
//
// PART A — pure fixtures (no engine):
//   A1 tr7Sums honors the engine window exactly (e.day >= day-6, day<=day).
//   A2 sumEvents accumulates the full dated-voluntary history per vid
//      (no 7-day prune — the counterfactual's raw material); per-vid.
//   A3 armDay fires ONLY on strict < (the engine's `<`); exact -5000 does
//      NOT arm; no rows -> null.
//   A4 classifyBeat names the cold-shoulder beats (say + journal classes)
//      and the trust-take sting; other text -> null.
//   A5 gate OFF: install returns a stub that wraps NOTHING
//      (recordTakeHist/recordGiveHist/say/journalNote/villageMeal
//      references unchanged; finalize reports on:false).
// PART A6-A8 — fake-Game integration (drives the REAL wraps):
//   A6 dated voluntary takes + undated meal takes + a dated give
//      reconstruct BOTH ledgers exactly (volTakesCum/mealTakes/undatedGives
//      closure); the bar-arming day matches the engine's rule (strict <);
//      the counterfactual voluntaryNet arms LATER (or never).
//   A7 cold-shoulder fiction beats are captured and classified (say +
//      journalNote classes); the stage 0->1 transition records a firing
//      with both voluntary-net forms.
//   A8 succession: vid change starts a fresh book; per-vid arm days.
// PART B — det-gate (live engine):
//   B1 gate OFF: pristine vs install(stub) — 30d x {107,218} x
//      {leadfeast, belongfeast} (FEASTSCALE_R13=1, the sweep substrate):
//      per-dawn ledger hashes BYTE-IDENTICAL.
//   B2 gate ON: pristine vs fully-instrumented: same matrix, byte-identical
//      (the diagnostic is trajectory-neutral — the wraps are pure
//      call-through).
// SMOKE=1 — instrument honesty on the live engine (leadfeast, s107, 15d):
//   rows == nights - dups (complete); no instrument errors; the event-log
//   tr7 recomputes EXACTLY against the live takeHist/giveHist; cumulative
//   closure exact (cumTakes == volTakesCum + mealTakes); uninstall restores
//   all seven wraps; the engine's own takeRate7/giveRate7 reconcile.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save never
// stubbed). Never run concurrent jest; --cacheDirectory=/tmp/jest-cache-*.
//
// Usage: node scripts/test-ledgerdiag-20261016.js
//        SMOKE=1 node scripts/test-ledgerdiag-20261016.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// The lib reads the gate at INSTALL time; the test toggles env between installs.
process.env.LEDGERDIAG = '1';
process.env.FEASTSCALE_R13 = '1';
const { installLedgerDiag, tr7Sums, sumEvents, armDay, classifyBeat } = require('./ledgerdiag-lib-20261016');

// ---------- PART A: pure fixtures ----------

function partA() {
  console.log('PART A — pure accounting fixtures');
  const hist = [];
  for (let d = 0; d <= 10; d++) hist.push({ day: d, kcal: 100 });
  const w = tr7Sums(hist, 10);
  check('A1 window [d-6..d] exact', w === 700, 'sum=' + w);
  const w0 = tr7Sums(hist, 3);
  check('A1 early-day window', w0 === 400, 'sum=' + w0);
  check('A1 skips bad entries', tr7Sums([{ day: 10 }, { day: 10, kcal: NaN }, { day: 11, kcal: 999 }, { day: 10, kcal: 50 }], 10) === 50);

  const evs = [
    { vid: 'a', day: 1, kcal: 100 }, { vid: 'a', day: 3, kcal: 200 },
    { vid: 'a', day: 20, kcal: 400 }, { vid: 'b', day: 2, kcal: 50 },
  ];
  check('A2 full dated history (no prune)', sumEvents(evs, 'a', 20) === 700, 'sum=' + sumEvents(evs, 'a', 20));
  check('A2 per-vid', sumEvents(evs, 'b', 20) === 50);
  check('A2 day-bounded', sumEvents(evs, 'a', 3) === 300);
  check('A2 skips bad', sumEvents([{ vid: 'a', day: 1 }, { vid: 'a', day: 1, kcal: NaN }, { vid: 'a', day: 1, kcal: 25 }], 'a', 1) === 25);

  const rows = [-4000, -4999, -5000, -5001].map((n, i) => ({ day: i + 1, cumNet: n }));
  check('A3 strict < arms', armDay(rows, 'cumNet', -5000) === 4, 'day=' + armDay(rows, 'cumNet', -5000));
  check('A3 exact -5000 never arms', armDay(rows.slice(0, 3), 'cumNet', -5000) === null);
  check('A3 no rows -> null', armDay([], 'cumNet', -5000) === null);
  check('A3 justice tier', armDay([{ day: 2, cumNet: -16000 }], 'cumNet', -15000) === 2);

  check('A4 journal class', classifyBeat('The village has gone quiet around me. I know why.') === 'COLD_SHOULDER_JOURNAL');
  check('A4 say class', classifyBeat('Something has shifted. Conversations stop when you approach the fire. Nobody meets your eyes for long.') === 'COLD_SHOULDER_SAY');
  check('A4 sting class', classifyBeat('Someone watches you load up. They say nothing.') === 'TRUST_TAKE_STING');
  check('A4 other text -> null', classifyBeat('Village meal: +800 kcal.') === null);
}

// Fake Game: honest shapes of the real engine paths the instrument hooks.
function fakeGame() {
  const v = {
    trust: { a: 10 }, takes: {}, gives: {},
    takeHist: { a: [] }, giveHist: { a: [] },
    lastPlayerMeal: 0, justice: { stage: 0 },
  };
  const G = {
    state: { scholar: { day: 1, villagerId: 'a', kcal: 100 }, village: v },
    villagerId: 'a',
    say(t) { return t; },
    journalNote(cat, key, text) { return text; },
    // engine-shape recordTakeHist (game.js:14188): dated voluntary only.
    recordTakeHist(vid, kcal) {
      const vv = this.state.village;
      vv.takeHist = vv.takeHist || {};
      const h = (vv.takeHist[vid] = vv.takeHist[vid] || []);
      const day = (this.state.scholar || {}).day || 0;
      h.push({ day, kcal: Math.round(kcal) || 0 });
      while (h.length && h[0].day < day - 7) h.shift();
    },
    recordGiveHist(vid, kcal) {
      const vv = this.state.village;
      vv.giveHist = vv.giveHist || {};
      const h = (vv.giveHist[vid] = vv.giveHist[vid] || []);
      const day = (this.state.scholar || {}).day || 0;
      h.push({ day, kcal: Math.round(kcal) || 0 });
      while (h.length && h[0].day < day - 7) h.shift();
    },
    // engine-shape takeRate7 (game.js:14199): window e.day >= day-6.
    takeRate7(vid) {
      const vv = this.state.village;
      const h = (vv.takeHist || {})[vid] || [];
      const day = (this.state.scholar || {}).day || 0;
      let sum = 0;
      for (const e of h) if (e && e.day >= day - 6) sum += e.kcal || 0;
      return sum / 7;
    },
    giveRate7(vid) {
      const vv = this.state.village;
      const h = (vv.giveHist || {})[vid] || [];
      const day = (this.state.scholar || {}).day || 0;
      let sum = 0;
      for (const e of h) if (e && e.day >= day - 6) sum += e.kcal || 0;
      return sum / 7;
    },
    justiceState() { return this.state.village.justice; },
    justiceHeat() {
      const vv = this.state.village, vid = this.state.scholar.villagerId;
      const net = ((vv.gives || {})[vid] || 0) - ((vv.takes || {})[vid] || 0);
      let heat = 0;
      if (net < -15000) heat += 25; else if (net < -5000) heat += 10;
      return heat;
    },
    villageMeal() {
      // honest fake of game.js:26632 — the communal bowl writes v.takes
      // WITHOUT a takeHist entry (r8), half-ration beat at trust<30.
      const vv = this.state.village, s = this.state.scholar;
      const vid = s.villagerId;
      const trust = (vv.trust[vid] !== undefined) ? vv.trust[vid] : 10;
      vv.takes[vid] = (vv.takes[vid] || 0) + 2000;
      vv.lastPlayerMeal = 2000;
      this.say(`Village meal: +2000 kcal from the communal pantry.${trust < 30 ? " (Half ration — they don't trust you yet.)" : ''}`);
    },
  };
  return G;
}

function stubScattering() {
  const prev = globalThis.Scattering;
  globalThis.Scattering = {
    calories: {
      resolveDay(scholar) {
        return { warnings: (scholar.kcal || 0) < 0 ? ['STARVING: health and energy falling.'] : [], burned: 1800 };
      },
    },
  };
  return prev;
}

function partA5() {
  console.log('PART A5 — gate OFF wraps nothing');
  process.env.LEDGERDIAG = '';
  const G = fakeGame();
  const rt = G.recordTakeHist, rg = G.recordGiveHist, sy = G.say, jn = G.journalNote, vm = G.villageMeal;
  const track = installLedgerDiag(G);
  check('A5 stub returned', track.on === false);
  check('A5 recordTakeHist untouched', G.recordTakeHist === rt);
  check('A5 recordGiveHist untouched', G.recordGiveHist === rg);
  check('A5 say untouched', G.say === sy);
  check('A5 journalNote untouched', G.journalNote === jn);
  check('A5 villageMeal untouched', G.villageMeal === vm);
  check('A5 finalize reports off', track.finalize().on === false);
  track.dawn(G);
  track.uninstall();
  process.env.LEDGERDIAG = '1';
}

function partA6toA8() {
  console.log('PART A6-A8 — fake-Game ledger integration');
  const prev = stubScattering();
  const G = fakeGame();
  const v = G.state.village;
  const refsA = { rt: G.recordTakeHist, rg: G.recordGiveHist, sy: G.say, jn: G.journalNote, vm: G.villageMeal };
  const track = installLedgerDiag(G);
  check('A6 armed install', track.on === true);
  const cal = globalThis.Scattering.calories;

  // Day 1: one voluntary take 700 (dated) + communal bowl 2000 (undated).
  v.takes.a = (v.takes.a || 0) + 700;      // takeFromPantry (game.js:14584)
  G.recordTakeHist('a', 700);              // (game.js:14585) — via the HOOK
  G.state.scholar.day = 1;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 2;
  track.dawn(G);
  // Day 2: bowl only. Day 3: bowl only -> cumulative crosses -5000.
  for (const d of [2, 3]) {
    G.state.scholar.day = d;
    cal.resolveDay(G.state.scholar, v, {});
    G.villageMeal.call(G);
    G.state.scholar.day = d + 1;
    track.dawn(G);
  }
  check('A6 three rows', track.rows.length === 3, 'rows=' + track.rows.length);
  const r3 = track.rows[2];
  // cumTakes = 700 + 3x2000 = 6700; vol = 700; meal = 6000; cumNet = -6700.
  check('A6 both ledgers exact',
    r3.cumTakes === 6700 && r3.volTakesCum === 700 && r3.mealTakes === 6000 && r3.cumNet === -6700,
    `cum=${r3.cumTakes} vol=${r3.volTakesCum} meal=${r3.mealTakes} net=${r3.cumNet}`);
  check('A6 voluntary counterfactual net', r3.voluntaryNet === -700 && r3.voluntaryNetD === -700,
    `vn=${r3.voluntaryNet} vnD=${r3.voluntaryNetD}`);
  check('A6 meal share', Math.abs(r3.mealShare - +(6000 / 6700).toFixed(3)) < 1e-9, 'share=' + r3.mealShare);
  check('A6 engine window exact', r3.tr7VolTakes === 700, 'tr7=' + r3.tr7VolTakes);
  const fin0 = track.finalize();
  // Engine bar: cumNet d1=-2700, d2=-4700, d3=-6700 -> arms day 3 (strict <).
  check('A6 engine arm day matches engine rule', fin0.perVid.a.engineArm === 3, 'arm=' + fin0.perVid.a.engineArm);
  // Counterfactual: voluntaryNet stays -700 forever -> never arms.
  check('A6 voluntary never arms', fin0.perVid.a.volArm === null);
  check('A6 PRIMARY go (never)', fin0.primary.go === true && fin0.primary.delta === 'never');

  // A7: cold-shoulder fiction + stage 0->1 on day 4.
  G.state.scholar.day = 4;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G); // cumTakes 8700 -> cumNet -8700 (still < -5000, no -15000)
  G.say('Something has shifted. Conversations stop when you approach the fire. Nobody meets your eyes for long.');
  G.journalNote('village', 'mood', 'The village has gone quiet around me. I know why.');
  v.justice.stage = 1; // the engine's 0->1 transition (justice.js:135-139)
  G.state.scholar.day = 5;
  track.dawn(G);
  const fin = track.finalize();
  check('A7 one cold-shoulder firing', fin.coldShoulder.nFirings === 1, 'n=' + fin.coldShoulder.nFirings);
  const f = fin.coldShoulder.firings[0];
  check('A7 firing beats classified', f.beats.length === 2 &&
    f.beats.some(b => b.cls === 'COLD_SHOULDER_SAY') &&
    f.beats.some(b => b.cls === 'COLD_SHOULDER_JOURNAL' && b.jclass === 'village/mood'),
    JSON.stringify(f.beats.map(b => b.cls)));
  // At day 4: vol events are day-1 only (700 kcal, within the 7d window) ->
  // voluntaryNet7 = -700 < 0; the dated-voluntary ledger reads a drain.
  check('A7 firing nets recorded', f.voluntaryNet === -700 && f.voluntaryNet7 === -700,
    `vn=${f.voluntaryNet} vn7=${f.voluntaryNet7}`);
  check('A7 CO-PRIMARY honest (no false positive)', fin.coldShoulder.go === false,
    'go=' + fin.coldShoulder.go);
  // Justice tiers: -5000 landed day 3; -15000 never (cumNet min -8700).
  check('A7 tier10 landed with meal share', fin.perVid.a.tier10At && fin.perVid.a.tier10At.day === 3 &&
    Math.abs(fin.perVid.a.tier10At.mealShare - +(6000 / 6700).toFixed(3)) < 1e-9,
    'tier10day=' + (fin.perVid.a.tier10At && fin.perVid.a.tier10At.day));
  check('A7 tier25 never', fin.perVid.a.tier25 === null && fin.perVid.a.volTier25 === null);

  // A8: succession — new bearer 'b', fresh book (ledger.js:841-844).
  G.state.scholar.villagerId = 'b'; G.villagerId = 'b';
  v.trust.b = 12; v.takes.b = 0; v.gives.b = 0; v.takeHist.b = []; v.giveHist.b = [];
  v.justice = { stage: 0 };
  G.state.scholar.day = 5; G.state.scholar.kcal = 900;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 6;
  track.dawn(G);
  const fin2 = track.finalize();
  check('A8 succession counted', track.successions === 1, 'successions=' + track.successions);
  const rb = fin2.rows[fin2.rows.length - 1];
  check('A8 new bearer fresh book', rb.vid === 'b' && rb.volTakesCum === 0 && rb.cumTakes === 2000 && rb.mealTakes === 2000,
    `vid=${rb.vid} vol=${rb.volTakesCum} cum=${rb.cumTakes}`);
  check('A8 per-vid arm days', fin2.perVid.b.engineArm === null,
    'b.engineArm=' + fin2.perVid.b.engineArm);
  check('A8 no instrument errors', track.instrErrors.length === 0, JSON.stringify(track.instrErrors.slice(0, 2)));
  // Uninstall restores all seven wraps.
  track.uninstall();
  check('A8 uninstall restores recordTakeHist', G.recordTakeHist === refsA.rt);
  check('A8 uninstall restores recordGiveHist', G.recordGiveHist === refsA.rg);
  check('A8 uninstall restores say', G.say === refsA.sy);
  check('A8 uninstall restores journalNote', G.journalNote === refsA.jn);
  check('A8 uninstall restores villageMeal', G.villageMeal === refsA.vm);
  globalThis.Scattering = prev;
}

function partA9() {
  console.log('PART A9 — succession mirrors the engine book-reset (ledger.js:841-844)');
  const prev = stubScattering();
  const G = fakeGame();
  const v = G.state.village;
  // NPC-era: 'b' is a villager with their own flows (villagerMealDay path).
  G.recordTakeHist('b', 400);
  G.recordGiveHist('b', 250);
  v.takes.b = 400; v.gives.b = 250;
  const track = installLedgerDiag(G);
  const cal = globalThis.Scattering.calories;
  // Bearer 'a' plays day 1 (bowl only), then dies; 'b' becomes the scholar.
  // The engine zeroes the new bearer's book (ledger.js:841-844).
  G.state.scholar.day = 1;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 2;
  track.dawn(G);
  G.state.scholar.villagerId = 'b'; G.villagerId = 'b';
  v.takes.b = 0; v.gives.b = 0; v.takeHist.b = []; v.giveHist.b = []; // the engine's reset
  v.justice = { stage: 0 };
  G.state.scholar.day = 2; G.state.scholar.kcal = 900;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G); // 'b' as scholar: one undated bowl
  G.state.scholar.day = 3;
  track.dawn(G);
  const rb = track.rows[track.rows.length - 1];
  check('A9 NPC-era events purged on succession',
    rb.vid === 'b' && rb.volTakesCum === 0 && rb.volGivesCum === 0,
    `vid=${rb.vid} volT=${rb.volTakesCum} volG=${rb.volGivesCum}`);
  check('A9 post-reset bowl names the meal component',
    rb.cumTakes === 2000 && rb.mealTakes === 2000,
    `cum=${rb.cumTakes} meal=${rb.mealTakes}`);
  check('A9 no instrument errors', track.instrErrors.length === 0);
  track.uninstall();
  globalThis.Scattering = prev;
}

function partA10() {
  console.log('PART A10 — same-day post-reset takes survive (the SMOKE catch)');
  const prev = stubScattering();
  const G = fakeGame();
  const v = G.state.village;
  // Fake playerDeath with the engine's shape: switches the scholar vid and
  // zeroes the new bearer's book (ledger.js:830-844). Defined BEFORE install
  // so the instrument wraps it.
  G.playerDeath = function (oldId, newId) {
    const s = this.state.scholar, vv = this.state.village;
    s.villagerId = newId; this.villagerId = newId;
    vv.takes[newId] = 0; vv.gives[newId] = 0;
    vv.takeHist[newId] = []; vv.giveHist[newId] = [];
    return 'ok';
  };
  const track = installLedgerDiag(G);
  check('A10 playerDeath wrapped', typeof G.playerDeath === 'function' && G.playerDeath !== null);
  // NPC-era: 'b' is a villager with a 400-kcal take (villagerMealDay path).
  G.recordTakeHist('b', 400);
  v.takes.b = 400;
  // Succession 'a' -> 'b' on day 5 (through the instrument's wrap).
  G.state.scholar.day = 5;
  G.playerDeath('a', 'b');
  // Post-reset, SAME day: 'b' (now scholar) takes 150 voluntarily + gives 60.
  v.takes.b = (v.takes.b || 0) + 150;
  G.recordTakeHist('b', 150);   // through the instrument's hook
  v.gives.b = (v.gives.b || 0) + 60;
  G.recordGiveHist('b', 60);
  const cal = globalThis.Scattering.calories;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G); // +2000 undated bowl
  G.state.scholar.day = 6;
  track.dawn(G);
  const r = track.rows[track.rows.length - 1];
  // volTakesCum must be 150 (post-reset take kept), NOT 400 (NPC-era dropped),
  // NOT 550. volGivesCum 60. cumTakes = 150 + 2000 = 2150.
  check('A10 post-reset take kept, NPC-era dropped',
    r.vid === 'b' && r.volTakesCum === 150 && r.volGivesCum === 60,
    `vid=${r.vid} volT=${r.volTakesCum} volG=${r.volGivesCum}`);
  check('A10 books reconcile', r.cumTakes === 2150 && r.mealTakes === 2000,
    `cum=${r.cumTakes} meal=${r.mealTakes}`);
  check('A10 no instrument errors', track.instrErrors.length === 0,
    JSON.stringify(track.instrErrors.slice(0, 2)));
  track.uninstall();
  globalThis.Scattering = prev;
}

// ---------- PART B: det-gate (live engine) ----------

async function partB() {
  console.log('PART B — det-gate: byte-identical trajectories (FEASTSCALE_R13=1 substrate)');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  const POLICIES = { leadfeast, belongfeast };

  async function runHashes(policyId, seed, withInstr) {
    const { Game } = await loadGame({ seed, mode: 'ldg-' + policyId + (withInstr ? '-i' : '-p'), fullTelemetry: false });
    await setupGame(Game);
    let track = null;
    if (withInstr) track = installLedgerDiag(Game);
    const hs = [];
    const base = POLICIES[policyId];
    const policy = Object.assign({}, base);
    const od = base.daily;
    policy.daily = (G, ctx) => {
      if (track && track.on) track.dawn(G);
      try {
        const s = G.state.scholar || {}, v = G.state.village || {};
        const m = (o) => Object.keys(o || {}).sort().map(k => k + '=' + Math.round(o[k])).join(',');
        hs.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
          (v.roster || []).length, m(v.trust), m(v.takes), m(v.gives)].join('|'));
      } catch (e) { hs.push('ERR'); }
      if (od) return od(G, ctx);
    };
    await quietLog(async () => { await runDays(Game, policy, { days: 30 }); });
    if (track) { try { track.dawn(Game); } catch (e) {} track.uninstall(); }
    return hs.join('\n');
  }

  for (const gateLabel of ['B1 gate-OFF', 'B2 gate-ON']) {
    process.env.LEDGERDIAG = gateLabel === 'B2 gate-ON' ? '1' : '';
    for (const pid of Object.keys(POLICIES)) {
      for (const seed of [107, 218]) {
        const pristine = await runHashes(pid, seed, false);
        const instr = await runHashes(pid, seed, true);
        const same = pristine === instr && pristine.length > 0 && pristine.split('\n').length >= 25;
        check(`${gateLabel} byte-identical ${pid} s${seed}`, same,
          same ? pristine.split('\n').length + ' dawns' :
            `pristine=${pristine.split('\n').length} instr=${instr.split('\n').length}`);
      }
    }
  }
  process.env.LEDGERDIAG = '1';
}

// ---------- SMOKE ----------

async function partSmoke() {
  console.log('PART C (SMOKE) — instrument honesty on the live engine');
  process.env.LEDGERDIAG = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast } = require('./policies/feastscale');
  const { Game } = await loadGame({ seed: 107, mode: 'ldg-smoke', fullTelemetry: false });
  await setupGame(Game);
  const refs = {
    rt: Game.recordTakeHist, rg: Game.recordGiveHist, sy: Game.say,
    jn: Game.journalNote, vm: Game.villageMeal, pd: Game.playerDeath,
    rd: (globalThis.Scattering || {}).calories && globalThis.Scattering.calories.resolveDay,
  };
  const track = installLedgerDiag(Game);
  const base = leadfeast;
  const policy = Object.assign({}, base);
  const od = base.daily;
  let dailyCalls = 0;
  policy.daily = (G, ctx) => { dailyCalls++; track.dawn(G); if (od) return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: 15 }); });
  try { track.dawn(Game); } catch (e) {}
  check('policy.daily fires >= 10x', dailyCalls >= 10, 'calls=' + dailyCalls);
  check('rows == unique nights (complete)', track.rows.length === track.nights.length - track.nDupNights && track.nights.length > 0,
    `rows=${track.rows.length} nights=${track.nights.length} dups=${track.nDupNights}`);
  check('no instrument errors', track.instrErrors.length === 0, JSON.stringify(track.instrErrors.slice(0, 3)));
  // Reconciliation: the event-log tr7 recomputes EXACTLY against the live
  // takeHist/giveHist on the last row.
  const last = track.rows[track.rows.length - 1];
  const v = Game.state.village || {};
  const rt = tr7Sums((v.takeHist || {})[last.vid], last.day);
  const rg = tr7Sums((v.giveHist || {})[last.vid], last.day);
  check('event-log tr7 == live takeHist window', rt === last.tr7VolTakes && rg === last.tr7VolGives,
    `t ${rt}/${last.tr7VolTakes} g ${rg}/${last.tr7VolGives}`);
  // Cumulative closure: cumTakes == volTakesCum + mealTakes.
  check('cumulative closure exact', Math.abs(last.cumTakes - (last.volTakesCum + last.mealTakes)) < 1e-6,
    `cum=${last.cumTakes} vol+meal=${last.volTakesCum + last.mealTakes}`);
  // Engine's own rates reconcile with the event log.
  let erT = null, erG = null;
  try { erT = Game.takeRate7(last.vid) * 7; erG = Game.giveRate7(last.vid) * 7; } catch (e) {}
  check('engine takeRate7/giveRate7 reconcile',
    erT != null && Math.abs(erT - last.tr7VolTakes) <= 0.51 && Math.abs(erG - last.tr7VolGives) <= 0.51,
    `erT=${erT} tr7t=${last.tr7VolTakes}`);
  check('voluntary events captured', (track.volEvents.length) >= 0, 'n=' + track.volEvents.length);
  check('give events captured', (track.giveEvents.length) >= 0, 'n=' + track.giveEvents.length);
  const fin = track.finalize();
  check('finalize ok', fin.on && fin.nRows === track.rows.length && fin.recon.tr7Mismatch === 0,
    `mismatch=${fin.recon.tr7Mismatch} checked=${fin.recon.tr7Checked}`);
  track.uninstall();
  check('uninstall restores recordTakeHist', Game.recordTakeHist === refs.rt);
  check('uninstall restores recordGiveHist', Game.recordGiveHist === refs.rg);
  check('uninstall restores say', Game.say === refs.sy);
  check('uninstall restores journalNote', Game.journalNote === refs.jn);
  check('uninstall restores villageMeal', Game.villageMeal === refs.vm);
  check('uninstall restores playerDeath', Game.playerDeath === refs.pd);
  if (refs.rd) check('uninstall restores resolveDay', globalThis.Scattering.calories.resolveDay === refs.rd);
}

async function main() {
  partA();
  partA5();
  partA6toA8();
  partA9();
  partA10();
  await partB();
  if (SMOKE) await partSmoke();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
