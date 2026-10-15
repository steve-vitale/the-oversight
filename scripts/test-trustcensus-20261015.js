#!/usr/bin/env node
// scripts/test-trustcensus-20261015.js — proof test for the trust-ledger
// trajectory census (loop B ARM 2, 2026-10-15, food-economy axis).
// ALL GREEN is the gate before ANY sweep spend.
//
// The instrument (scripts/trustcensus-lib-20261015.js) is a READ-ONLY
// diagnostic: zero src/js changes. It must read the REAL ledger — the
// -5000 trust-drop bar (game.js:14579), the dated takeHist/giveHist
// (game.js:14171-14230), the undated communal-meal takes (game.js:26622,
// r8), the half-ration beat (game.js:26641), the STARVING night
// (sleep→calories.resolveDay), and the succession book-reset
// (ledger.js:841-844).
//
// PART A — pure fixtures + fake-Game integration (no engine):
//   A1 tr7Sums honors the engine window exactly (e.day >= day-6, game.js
//      takeRate7/giveRate7) — synthetic histories -> exact sums.
//   A2 tr7Sums binge-vs-drip composition (nDays, maxDay).
//   A3 detectCrossings fires ONLY on strict < -5000 (the engine's `<`);
//      exact -5000 does NOT cross; no rows -> no crossings.
//   A4 gate OFF: install returns a stub that wraps NOTHING (Game.villageMeal
//      / Game.say references unchanged; finalize reports on:false).
//   A5 fake-Game run: dated voluntary takes + undated meal takes decompose
//      the cumulative book EXACTLY (mealTakes = cumTakes - volTakes); the
//      half-ration beat and STARVING night are captured; rows are complete.
//   A6 crossing attribution: the -5000 CUM crossing is attributed with the
//      full composition (voluntary vs meal share named); a book with takes
//      but NO dated history is flagged UNATTRIBUTED (mystery takes).
//   A7 succession: vid change resets the instrument-side book (mirrors
//      ledger.js:841-844); the new bearer's row starts at zero.
// PART B — det-gate (live engine):
//   B1 gate OFF: pristine vs install(stub) — 30d x {11,22} x
//      {leadcourt, belongseek}: per-dawn ledger hashes BYTE-IDENTICAL.
//   B2 gate ON: pristine vs fully-instrumented: same matrix, byte-identical
//      (the census is trajectory-neutral — the wraps are pure call-through).
// SMOKE=1 — instrument honesty on the live engine (leadcourt, s11, 15d):
//   rows == nights (complete); no instrument errors; the last row's tr7
//   sums recompute EXACTLY from the live histories; uninstall restores all
//   wrapped references; say beats were captured.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save never
// stubbed). Never run concurrent jest; --cacheDirectory=/tmp/jest-cache-*.
//
// Usage: node scripts/test-trustcensus-20261015.js
//        SMOKE=1 node scripts/test-trustcensus-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// The lib reads the gate at INSTALL time, so the test toggles the env var
// between installs in this one process.
process.env.TRUSTCENSUS = '1';
const { installTrustCensus, tr7Sums, detectCrossings } = require('./trustcensus-lib-20261015');

// ---------- PART A: fixtures ----------

function partA() {
  console.log('PART A — pure accounting fixtures');
  // A1: engine window e.day >= day-6 (takeRate7/giveRate7, game.js:14193-14227)
  const hist = [];
  for (let d = 0; d <= 10; d++) hist.push({ day: d, kcal: 100 });
  const w = tr7Sums(hist, 10);
  check('A1 window [d-6..d] exact', w.sum === 700 && w.nDays === 7,
    `sum=${w.sum} nDays=${w.nDays}`);
  const w0 = tr7Sums(hist, 3);
  check('A1 early-day window', w0.sum === 400 && w0.nDays === 4, `sum=${w0.sum}`);
  check('A1 empty hist', tr7Sums(null, 10).sum === 0 && tr7Sums([], 10).nDays === 0);
  check('A1 skips bad entries', tr7Sums([{ day: 10 }, { day: 10, kcal: NaN }, { day: 10, kcal: 50 }], 10).sum === 50);

  // A2: binge-vs-drip
  const binge = [{ day: 8, kcal: 10 }, { day: 9, kcal: 10 }, { day: 10, kcal: 980 }];
  const b = tr7Sums(binge, 10);
  check('A2 composition', b.sum === 1000 && b.nDays === 3 && b.maxDay === 980,
    `sum=${b.sum} nDays=${b.nDays} maxDay=${b.maxDay}`);
  const drip = [];
  for (let d = 4; d <= 10; d++) drip.push({ day: d, kcal: 100 });
  const dr = tr7Sums(drip, 10);
  check('A2 drip composition', dr.sum === 700 && dr.nDays === 7 && dr.maxDay === 100);

  // A3: strict crossings
  const rows = [-4000, -4999, -5000, -5001].map((n, i) => ({
    day: i + 1, cumNet: n, tr7Net: n,
  }));
  const x = detectCrossings(rows);
  check('A3 CUM fires only on strict < -5000', x.cum && x.cum.day === 4,
    'day=' + (x.cum && x.cum.day));
  check('A3 TR7 fires only on strict < -5000', x.tr7 && x.tr7.day === 4);
  const xj = detectCrossings(rows.map(r => ({ day: r.day, cumNet: -16000, tr7Net: 0 })));
  check('A3 JUSTICE tier', xj.justice && xj.justice.day === 1);
  const xn = detectCrossings([]);
  check('A3 no rows -> no crossings', !xn.cum && !xn.tr7 && !xn.justice);
}

// Fake-Game integration: drives the REAL wraps (villageMeal, resolveDay, dawn)
// against a synthetic ledger, proving the instrument reads the real shapes.
function fakeGame() {
  const v = {
    trust: { a: 10 }, takes: {}, gives: {},
    takeHist: { a: [] }, giveHist: { a: [] },
    lastPlayerMeal: 0,
  };
  const G = {
    state: { scholar: { day: 5, villagerId: 'a', kcal: 100 }, village: v },
    villagerId: 'a',
    say(t) { return t; },
    villageMeal() {
      // honest fake of game.js:26622 — the communal bowl writes v.takes
      // WITHOUT a takeHist entry (r8), and voices the half-ration beat at
      // trust<30 (game.js:26641).
      const vv = this.state.village, s = this.state.scholar;
      const vid = s.villagerId;
      const trust = (vv.trust[vid] !== undefined) ? vv.trust[vid] : 10;
      vv.takes[vid] = (vv.takes[vid] || 0) + 800;
      vv.lastPlayerMeal = 800;
      this.say(`Village meal: +800 kcal from the communal pantry.${trust < 30 ? " (Half ration — they don't trust you yet.)" : ''}`);
    },
  };
  return G;
}

function stubScattering() {
  const prev = globalThis.Scattering;
  globalThis.Scattering = {
    calories: {
      // honest fake of the overnight burn: STARVING warning when kcal < 0.
      resolveDay(scholar) {
        return { warnings: (scholar.kcal || 0) < 0 ? ['STARVING: health and energy falling.'] : [], burned: 1800 };
      },
    },
  };
  return prev;
}

function partA4() {
  console.log('PART A4 — gate OFF wraps nothing');
  process.env.TRUSTCENSUS = '';
  const G = fakeGame();
  const vmBefore = G.villageMeal, sayBefore = G.say;
  const track = installTrustCensus(G);
  check('A4 stub returned', track.on === false);
  check('A4 villageMeal untouched', G.villageMeal === vmBefore);
  check('A4 say untouched', G.say === sayBefore);
  check('A4 finalize reports off', track.finalize().on === false);
  track.dawn(G); // no-op, must not throw
  check('A4 dawn no-op', track.rows.length === 0);
  track.uninstall();
  process.env.TRUSTCENSUS = '1';
}

function partA5toA7() {
  console.log('PART A5-A7 — fake-Game ledger integration');
  const prev = stubScattering();
  const G = fakeGame();
  const v = G.state.village;
  const track = installTrustCensus(G);
  check('A5 armed install', track.on === true);

  const cal = globalThis.Scattering.calories;
  // --- day 5: one voluntary take (dated) + the communal bowl (undated) ---
  v.takes.a = (v.takes.a || 0) + 300;               // takeFromPantry (game.js:14575)
  v.takeHist.a.push({ day: 5, kcal: 300 });          // recordTakeHist (game.js:14183)
  G.state.scholar.day = 5; G.state.scholar.kcal = -50;
  cal.resolveDay(G.state.scholar, v, {});           // night of day 5: STARVING
  G.villageMeal.call(G);                             // bowl of day 5: +800 undated, half-ration beat
  G.state.scholar.day = 6;
  track.dawn(G);                                     // builds row for day 5
  check('A5 one row for one night', track.rows.length === 1, 'rows=' + track.rows.length);
  const r5 = track.rows[0];
  check('A5 cumTakes exact', r5.cumTakes === 1100, 'cumTakes=' + r5.cumTakes);
  check('A5 voluntary/meal decomposition exact', r5.volTakes === 300 && r5.mealTakes === 800,
    `vol=${r5.volTakes} meal=${r5.mealTakes}`);
  check('A5 tr7 window exact', r5.tr7Takes === 300 && r5.tr7Gives === 0,
    `tr7t=${r5.tr7Takes} tr7g=${r5.tr7Gives}`);
  check('A5 hunger flag', r5.hunger === true);
  check('A5 half-ration flag', r5.halfRation === true, 'mealTaken=' + r5.mealTaken);
  check('A5 no crossing yet', !track.finalize().crossings.cum.crossed);

  // --- day 6: a donation (dated give) ---
  v.gives.a = (v.gives.a || 0) + 500;               // donateToPantry (game.js:14089)
  v.giveHist.a.push({ day: 6, kcal: 500 });          // recordGiveHist (game.js:14090)
  G.state.scholar.day = 6; G.state.scholar.kcal = 1200;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 7;
  track.dawn(G);
  const r6 = track.rows[1];
  check('A6 donation dated', r6.volGives === 500 && r6.undatedGives === 0 && r6.tr7Gives === 500,
    `volG=${r6.volGives} undated=${r6.undatedGives} tr7g=${r6.tr7Gives}`);

  // --- day 7: a take-binge crosses the CUM bar ---
  v.takes.a += 5000; v.takeHist.a.push({ day: 7, kcal: 5000 });
  G.state.scholar.day = 7; G.state.scholar.kcal = -20;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G); // +800 more undated
  G.state.scholar.day = 8;
  track.dawn(G);
  const fin = track.finalize();
  const xc = fin.crossings.cum;
  check('A6 CUM crossing detected', xc.crossed && xc.day === 7, 'day=' + (xc && xc.day));
  // cumTakes = (300+800) + 800 + (5000+800) = 7700; cumGives = 500;
  // cumNet = -7200 < -5000. (The day-6 bowl adds its undated 800 too.)
  check('A6 crossing composition exact',
    xc.cumTakes === 7700 && xc.volTakes === 5300 && xc.mealTakes === 2400 && xc.cumGives === 500,
    `cum=${xc.cumTakes} vol=${xc.volTakes} meal=${xc.mealTakes} gives=${xc.cumGives}`);
  check('A6 crossing attributed', xc.attributed === true, 'silent=' + xc.silentReason);
  check('A6 meal share named', Math.abs(xc.mealShare - +(2400 / 7700).toFixed(3)) < 1e-9, 'mealShare=' + xc.mealShare);
  check('A6 post-crossing hunger counted',
    fin.post.hungerDaysBefore === 1 && fin.post.hungerDaysAfter === 0,
    `before=${fin.post.hungerDaysBefore} after=${fin.post.hungerDaysAfter}`);

  // --- day 8: succession — new bearer, fresh book (ledger.js:841-844) ---
  G.state.scholar.villagerId = 'b'; G.villagerId = 'b';
  v.trust.b = 12; v.takes.b = 0; v.gives.b = 0; v.takeHist.b = []; v.giveHist.b = [];
  G.state.scholar.day = 8; G.state.scholar.kcal = 900;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 9;
  track.dawn(G);
  const r8 = track.rows[3];
  check('A7 succession counted', track.successions === 1, 'successions=' + track.successions);
  check('A7 new bearer fresh book', r8.vid === 'b' && r8.volTakes === 0 && r8.cumTakes === 800 && r8.mealTakes === 800,
    `vid=${r8.vid} vol=${r8.volTakes} cum=${r8.cumTakes}`);
  check('A7 succession flagged on row', r8.succession === true);
  check('A7 no instrument errors', track.instrErrors.length === 0, JSON.stringify(track.instrErrors.slice(0, 2)));
  track.uninstall();
  check('A7 uninstall restores villageMeal', typeof G.villageMeal === 'function' && G.villageMeal.name !== '');
  globalThis.Scattering = prev;
}

function partA6silent() {
  console.log('PART A6b — mystery takes are UNATTRIBUTED (the r7 blank)');
  const prev = stubScattering();
  const G = fakeGame();
  const v = G.state.village;
  delete v.takeHist; // no dated history at all
  v.takes.a = 6000;  // ...but the cumulative book is deep
  const track = installTrustCensus(G);
  const cal = globalThis.Scattering.calories;
  G.state.scholar.day = 5; G.state.scholar.kcal = 100;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 6;
  track.dawn(G);
  const fin = track.finalize();
  const xc = fin.crossings.cum;
  check('A6b crossing detected', xc.crossed === true);
  check('A6b crossing UNATTRIBUTED', xc.attributed === false && !!xc.silentReason,
    'silent=' + xc.silentReason);
  track.uninstall();
  globalThis.Scattering = prev;
}

function partA8() {
  console.log('PART A8 — duplicate nights rebuild the row (frozen day)');
  const prev = stubScattering();
  const G = fakeGame();
  const v = G.state.village;
  const track = installTrustCensus(G);
  const cal = globalThis.Scattering.calories;
  // Night 1 of day 5: voluntary take 300 + bowl 800, not starving.
  v.takes.a = (v.takes.a || 0) + 300; v.takeHist.a.push({ day: 5, kcal: 300 });
  G.state.scholar.day = 5; G.state.scholar.kcal = 500;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 6;
  track.dawn(G);
  check('A8 first build', track.rows.length === 1 && track.rows[0].cumTakes === 1100,
    'rows=' + track.rows.length);
  // Frozen day: scholar.day stays 6 — a SECOND night lands on day label 5
  // (the engine re-sleeps without advancing). Another voluntary take + bowl,
  // this time STARVING.
  v.takes.a += 400; v.takeHist.a.push({ day: 5, kcal: 400 });
  G.state.scholar.day = 5; G.state.scholar.kcal = -30;
  cal.resolveDay(G.state.scholar, v, {});
  G.villageMeal.call(G);
  G.state.scholar.day = 6;
  track.dawn(G);
  check('A8 duplicate counted', track.nDupNights === 1, 'dups=' + track.nDupNights);
  check('A8 still one row', track.rows.length === 1, 'rows=' + track.rows.length);
  const r = track.rows[0];
  // cumTakes = 300+800 +400+800 = 2300; vol = 300+400 = 700 (NOT 1400);
  // meal = 2300-700 = 1600; hunger ORs across both nights.
  check('A8 rebuild no double-count', r.cumTakes === 2300 && r.volTakes === 700 && r.mealTakes === 1600,
    `cum=${r.cumTakes} vol=${r.volTakes} meal=${r.mealTakes}`);
  check('A8 hunger ORs', r.hunger === true);
  check('A8 no instrument errors', track.instrErrors.length === 0);
  track.uninstall();
  globalThis.Scattering = prev;
}

// ---------- PART B: det-gate (live engine) ----------

async function partB() {
  console.log('PART B — det-gate: byte-identical trajectories');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadcourt } = require('./policies/leadcourt');
  const { belongseek } = require('./policies/belongseek');
  const POLICIES = { leadcourt, belongseek };

  async function runHashes(policyId, seed, withInstr) {
    const { Game } = await loadGame({ seed, mode: 'tch-' + policyId + (withInstr ? '-i' : '-p'), fullTelemetry: false });
    await setupGame(Game);
    let track = null;
    if (withInstr) track = installTrustCensus(Game);
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
    if (track) track.uninstall();
    return hs.join('\n');
  }

  for (const gateLabel of ['B1 gate-OFF', 'B2 gate-ON']) {
    process.env.TRUSTCENSUS = gateLabel === 'B2 gate-ON' ? '1' : '';
    for (const pid of Object.keys(POLICIES)) {
      for (const seed of [11, 22]) {
        const pristine = await runHashes(pid, seed, false);
        const instr = await runHashes(pid, seed, true);
        const same = pristine === instr && pristine.length > 0 && pristine.split('\n').length >= 25;
        check(`${gateLabel} byte-identical ${pid} s${seed}`, same,
          same ? pristine.split('\n').length + ' dawns' :
            `pristine=${pristine.split('\n').length} instr=${instr.split('\n').length}`);
      }
    }
  }
  process.env.TRUSTCENSUS = '1';
}

// ---------- SMOKE ----------

async function partSmoke() {
  console.log('PART C (SMOKE) — instrument honesty on the live engine');
  process.env.TRUSTCENSUS = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadcourt } = require('./policies/leadcourt');
  const { Game } = await loadGame({ seed: 11, mode: 'tc-smoke', fullTelemetry: false });
  await setupGame(Game);
  const vmBefore = Game.villageMeal, sayBefore = Game.say;
  const calObj = (globalThis.Scattering || {}).calories || null;
  const rdBefore = calObj && calObj.resolveDay;
  const track = installTrustCensus(Game);
  const base = leadcourt;
  const policy = Object.assign({}, base);
  const od = base.daily;
  let dailyCalls = 0;
  policy.daily = (G, ctx) => { dailyCalls++; track.dawn(G); if (od) return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: 15 }); });
  try { track.dawn(Game); } catch (e) {} // row the last night (see sweep driver note)
  check('policy.daily fires >= 10x', dailyCalls >= 10, 'calls=' + dailyCalls);
  check('rows == unique nights (complete)', track.rows.length === track.nights.length - track.nDupNights && track.nights.length > 0,
    `rows=${track.rows.length} nights=${track.nights.length} dups=${track.nDupNights}`);
  check('no instrument errors', track.instrErrors.length === 0, JSON.stringify(track.instrErrors.slice(0, 3)));
  // Reconciliation: the last row's tr7 sums recompute EXACTLY from the live histories.
  const last = track.rows[track.rows.length - 1];
  const v = Game.state.village || {};
  const vid = last.vid;
  const rt = tr7Sums((v.takeHist || {})[vid], last.day);
  const rg = tr7Sums((v.giveHist || {})[vid], last.day);
  check('tr7 reconciliation exact', rt.sum === last.tr7Takes && rg.sum === last.tr7Gives,
    `t ${rt.sum}/${last.tr7Takes} g ${rg.sum}/${last.tr7Gives}`);
  // Cumulative closure: cumTakes == volTakes + mealTakes on the last row.
  check('cumulative closure', Math.abs(last.cumTakes - (last.volTakes + last.mealTakes)) < 1e-6,
    `cum=${last.cumTakes} vol+meal=${last.volTakes + last.mealTakes}`);
  check('say beats captured', track.sayLog.length > 0, 'beats=' + track.sayLog.length);
  const fin = track.finalize();
  check('finalize ok', fin.on && fin.nRows === track.rows.length);
  track.uninstall();
  check('uninstall restores villageMeal', Game.villageMeal === vmBefore);
  check('uninstall restores say', Game.say === sayBefore);
  if (rdBefore) check('uninstall restores resolveDay', calObj.resolveDay === rdBefore);
}

async function main() {
  partA();
  partA4();
  partA5toA7();
  partA6silent();
  partA8();
  await partB();
  if (SMOKE) await partSmoke();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
