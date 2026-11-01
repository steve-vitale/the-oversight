#!/usr/bin/env node
// test-depositkeep-b.js — proof tests for the depositkeep census (DIAG ONLY).
// (sim-depositkeep-b; prereg: evidence/2026-11-01/sim-depositkeep-b-prereg.md,
// committed BEFORE any judged sim.)
//
// Pure checks run by default (no game load, no file writes, no RNG).
// Live controls each run in their OWN process (one harness per process,
// per repo rules) — run all three before any judged sim:
//   node scripts/test-depositkeep-b.js --live-a   # 3000-kcal pack, gate off -> unload > 0, gate engaged false
//   node scripts/test-depositkeep-b.js --live-b   # 1500-kcal pack, gate off -> unload exactly 0 (keep swallows it)
//   node scripts/test-depositkeep-b.js --live-c   # donateToPantry -> donate bucket > 0, unload bucket 0
// Each live control sets DEPOSITGATE=0 explicitly before loading the game.
'use strict';
const assert = require('assert');
const { analyzeSeed, goVerdict } = require('./analyze-depositkeep-b');

let n = 0;
function check(actual, expected, label) {
  n++;
  assert.strictEqual(actual, expected, label + ': got ' + actual + ', want ' + expected);
}
function checkTrue(v, label) { n++; assert.strictEqual(!!v, true, label); }

function mkReturn(loopDay, finished, unload, gate) {
  return { loopDay, day: loopDay, overAtEntry: false, stack: 'at returnToVillage (game.js:12690)',
    gateEngagedAtEntry: gate ? 1 : 0, gateEngagedAtExit: gate ? 1 : 0,
    packBefore: { finishedKcal: finished, totalKcal: finished, items: [] },
    packAfter: { finishedKcal: finished - unload, totalKcal: finished - unload, items: [] },
    unloadKcal: unload };
}
function mkSeed(seed, returns, donates, deposits, sayLines) {
  return { seed, arm: 'depositgate-off', endReason: 'survived', daysAlive: 30,
    maxWaveUnlocked: 1, waveKills: {}, deaths: [],
    homecomings: returns, deposits: deposits || [], donates: donates || [],
    evenings: [{ snap: { px: 4, py: 4, hx: 4, hy: 4, onTile: true, atHaven: true } }],
    sayLines: sayLines || [] };
}

// --- Analyzer: unload/donate split, death-path exclusion, gate flag ---
const seedA = analyzeSeed(mkSeed(51101,
  [mkReturn(1, 3000, 1000, false), mkReturn(2, 1500, 0, false),
   { loopDay: 3, day: 3, overAtEntry: true, stack: 'at returnToVillage (game.js:32198)',
     gateEngagedAtEntry: 0, gateEngagedAtExit: 0,
     packBefore: { finishedKcal: 5000, totalKcal: 5000, items: [] },
     packAfter: { finishedKcal: 2000, totalKcal: 2000, items: [] }, unloadKcal: 3000 }],
  [{ loopDay: 1, donateKcal: 600 }],
  [{ kind: 'unload', kcal: 1000 }, { kind: 'donate', kcal: 600 }],
  [{ line: 'You keep a day\'s food (2000 kcal) and unload 1000 kcal into Haven\'s pantry.' },
   { line: 'You keep a day\'s food (1500 kcal) — nothing extra for the pantry this time.' }]));
check(seedA.homecomingsLive, 2, 'death-path return excluded from live count');
check(seedA.homecomingsDeathPath, 1, 'death-path counted separately');
check(seedA.unloadTotal, 1000, 'live unload sums live returns only');
check(seedA.donateTotal, 600, 'donate bucket separate from unload');
check(seedA.depositUnloadTotal, 1000, 'deposit unload cross-check');
check(seedA.depositDonateTotal, 600, 'deposit donate cross-check');
check(seedA.returnsWithUnload, 1, 'one live return unloads');
check(seedA.maxFinishedPack, 3000, 'max finished pack over live returns');
check(seedA.gateEngagedTrue, 0, 'no gate-engaged live return');
check(seedA.unloadSayLines, 1, 'unload say line counted');
check(seedA.keepSayLines, 1, 'keep say line counted');

// Gate-engaged flag surfaces (prereg gate 4 would stop the run).
const seedG = analyzeSeed(mkSeed(51102, [mkReturn(1, 9000, 3000, true)], [], [], []));
check(seedG.gateEngagedTrue, 1, 'gate-engaged return flagged');

// EndDay stack sensitivity: flagged calls excluded only from the clean count.
const seedE = analyzeSeed(mkSeed(51103,
  [mkReturn(1, 3000, 1000, false),
   { loopDay: 2, day: 2, overAtEntry: false, stack: 'at endDay (game.js:32198)',
     gateEngagedAtEntry: 0, gateEngagedAtExit: 0,
     packBefore: { finishedKcal: 4000, totalKcal: 4000, items: [] },
     packAfter: { finishedKcal: 2000, totalKcal: 2000, items: [] }, unloadKcal: 2000 }],
  [], [], []));
check(seedE.homecomingsEndDayFlagged, 1, 'endDay-flagged live return counted');
check(seedE.unloadTotal, 3000, 'judged unload keeps flagged call (scholaraway rule)');
check(seedE.unloadTotalClean, 1000, 'clean unload excludes flagged call');

// Incomplete snapshot breaks completeness, not silently.
const seedB = analyzeSeed({ seed: 51104, endReason: 'survived', daysAlive: 30,
  homecomings: [], deposits: [], donates: [],
  evenings: [{ snap: null }], sayLines: [] });
check(seedB.completeCapture, false, 'null snapshot fails completeness');

// --- GO rule boundaries (prereg: pilot >= 6/8, confirm >= 9/12) ---
function mkUnloadSeed(seed, unload) {
  return { unloadTotal: unload };
}
const goBand = [];
for (let i = 0; i < 6; i++) goBand.push(mkUnloadSeed(51100 + i, 100));
for (let i = 0; i < 2; i++) goBand.push(mkUnloadSeed(51110 + i, 0));
check(goVerdict(goBand, 6).verdict, 'GO', '6/8 nonzero is GO');
const noBand = [];
for (let i = 0; i < 5; i++) noBand.push(mkUnloadSeed(51100 + i, 100));
for (let i = 0; i < 3; i++) noBand.push(mkUnloadSeed(51110 + i, 0));
check(goVerdict(noBand, 6).verdict, 'NO-GO', '5/8 nonzero is NO-GO');
const confBand = [];
for (let i = 0; i < 9; i++) confBand.push(mkUnloadSeed(51100 + i, 100));
for (let i = 0; i < 3; i++) confBand.push(mkUnloadSeed(51120 + i, 0));
check(goVerdict(confBand, 9).verdict, 'GO', '9/12 nonzero is confirm GO');

async function liveControl(which) {
  // Env contract mirrors the judged driver (gate OFF is the arm).
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '0';
  const { loadGame, setupGame } = require('./sim-harness');
  const { installWrappers, packComposition } = require('./depositkeep-b-driver');
  const { Game } = await loadGame({ seed: 51105, mode: 'depositkeep-b-proof', fullTelemetry: false });
  await setupGame(Game);
  checkTrue(Game._depositGateEngaged() === false, 'gate engaged false with DEPOSITGATE=0');
  const st = { loopDay: 0, homecomings: [], deposits: [], donates: [], sayCount: () => 0 };
  installWrappers(Game, st);
  if (which === 'a') {
    // Brought (3000) > KEEP_KCAL (2000): 1000 kcal must unload.
    Game.state.scholar.inventory = [{ name: 'Cooked stew', kcalEach: 500, units: 6 }];
    check(packComposition(Game).finishedKcal, 3000, 'control-a pack is 3000 finished kcal');
    Game.state.scholar.lastHavenDay = (Game.state.scholar.day || 1) - 5;
    Game.returnToVillage();
    check(st.homecomings.length, 1, 'control-a records exactly one homecoming');
    check(st.homecomings[0].overAtEntry, false, 'control-a homecoming is not death-path');
    check(st.homecomings[0].gateEngagedAtEntry, 0, 'control-a gate read false at entry');
    checkTrue(st.homecomings[0].unloadKcal > 0, 'control-a unload kcal > 0 (got ' + st.homecomings[0].unloadKcal + ')');
    checkTrue(st.deposits.some((d) => d.kind === 'unload' && d.kcal > 0), 'control-a deposit logged as unload');
  } else if (which === 'b') {
    // Brought (1500) < KEEP_KCAL (2000): the keep swallows everything.
    Game.state.scholar.inventory = [{ name: 'Cooked stew', kcalEach: 500, units: 3 }];
    check(packComposition(Game).finishedKcal, 1500, 'control-b pack is 1500 finished kcal');
    Game.state.scholar.lastHavenDay = (Game.state.scholar.day || 1) - 5;
    Game.returnToVillage();
    check(st.homecomings.length, 1, 'control-b records exactly one homecoming');
    check(st.homecomings[0].unloadKcal, 0, 'control-b unload exactly 0 under the keep');
    checkTrue(!st.deposits.some((d) => d.kind === 'unload'), 'control-b logs no unload deposit');
  } else if (which === 'c') {
    // Donate path: donation lands in the donate bucket, never unload.
    Game.state.scholar.inventory = [{ name: 'Cooked stew', kcalEach: 500, units: 4 }];
    Game.donateToPantry(0);
    check(st.donates.length, 1, 'control-c records exactly one donate call');
    checkTrue(st.donates[0].donateKcal > 0, 'control-c donate kcal > 0 (got ' + st.donates[0].donateKcal + ')');
    checkTrue(!st.deposits.some((d) => d.kind === 'unload'), 'control-c logs no unload deposit');
    check(st.homecomings.length, 0, 'control-c records no homecoming');
  }
}

const mode = process.argv[2];
if (mode === '--live-a' || mode === '--live-b' || mode === '--live-c') {
  liveControl(mode.slice(7)).then(() => {
    console.log('test-depositkeep-b ' + mode + ': ' + n + ' checks passed (incl. live control)');
  }).catch((e) => {
    console.error('test-depositkeep-b ' + mode + ' FAILED after ' + n + ' checks: ' + (e && (e.stack || e)));
    process.exit(1);
  });
} else {
  console.log('test-depositkeep-b: ' + n + ' pure checks passed (live controls: --live-a/--live-b/--live-c, each in its own process)');
}
