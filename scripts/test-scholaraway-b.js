#!/usr/bin/env node
// test-scholaraway-b.js — proof tests for the scholaraway census (DIAG ONLY).
// (sim-scholaraway-b; prereg: evidence/2026-11-01/sim-scholaraway-b-prereg.md,
// committed BEFORE any judged sim.)
//
// Pure checks first (no game load, no file writes, no RNG), then the
// POSITIVE CONTROL (prereg pilot gate G1): load a real game, install the
// driver's own wrappers, give the scholar a 3000-kcal pack, call
// returnToVillage, and assert the wrapper records a homecoming event AND
// unload kcal > 0. Without this green, a pilot zero would be suspect —
// a broken recorder also reads zero.
// Run: node scripts/test-scholaraway-b.js
'use strict';
const assert = require('assert');
const { classifyDayLines, analyzeSeed, structuralVerdict } = require('./analyze-scholaraway-b');

let n = 0;
function check(actual, expected, label) {
  n++;
  assert.strictEqual(actual, expected, label + ': got ' + actual + ', want ' + expected);
}
function checkTrue(v, label) { n++; assert.strictEqual(!!v, true, label); }

// --- Day-line buckets ---
const buckets = classifyDayLines([
  'You forage the wilds for greens.',
  'You camp wild tonight — no pantry meal. Eat from your pack.',
  'Hunger gnaws. The pack is thin — work the green, haul it back, get it named at camp.',
  'You teach Maya the lesson by the fire.',
  'A beast lunges from the brush.',
  'Something quiet with no keywords at all.',
]);
// The real hunger line also says "work the green", so it hits forage
// too — buckets are per-line multi-hit by design (analyzer counts each
// bucket independently; a day may hit several).
check(buckets.forage, 2, 'forage bucket (incl. hunger line\'s work-the-green)');
check(buckets.campWild, 1, 'camp-wild bucket');
check(buckets.hunger, 1, 'hunger bucket');
check(buckets.teach, 1, 'teach bucket');
check(buckets.combat, 1, 'combat bucket');
check(buckets.other, 1, 'other bucket');

// --- Seed analysis: presence counts, wild stretch, unload union ---
function mkEvening(onTile, atHaven, lines) {
  return { loopDay: 0, snap: { px: 4, py: 4, hx: 4, hy: 4, dist: onTile ? 0 : 3, onTile, atHaven }, dayLines: lines || [] };
}
const seedA = analyzeSeed({
  seed: 51105, daysAlive: 30, endReason: 'survived', maxWaveUnlocked: 1, waveKills: {},
  mornings: [{ snap: { onTile: true } }, { snap: { onTile: false } }],
  evenings: [
    mkEvening(true, true, []),
    mkEvening(false, true, ['You camp wild tonight — no pantry meal.']),
    mkEvening(false, false, ['Hunger gnaws. The pack is thin.']),
    mkEvening(false, false, []),
  ],
  homecomings: [
    { overAtEntry: false, unloadKcal: 1000 },
    { overAtEntry: true, unloadKcal: 500 }, // death-path: excluded from live count
  ],
  deposits: [
    { inReturn: true, kcal: 1000, stack: 'at returnToVillage (game.js:8813)' },
    { inReturn: false, kcal: 500, stack: 'at returnToVillage (game.js:9999)' }, // stack rule, counted once
  ],
  sayLines: [
    { line: 'You camp wild tonight — no pantry meal.' },
    { line: 'Hunger gnaws. The pack is thin.' },
    { line: 'You keep a day\'s food (2000 kcal) and unload 1000 kcal into Haven\'s pantry.' },
  ],
});
check(seedA.havenEvenings, 1, 'haven evenings');
check(seedA.atHavenEvenings, 2, 'at-haven evenings include adjacent');
check(seedA.adjacentEvenings, 1, 'adjacent evening separated from home');
check(seedA.awayEvenings, 3, 'away evenings');
check(seedA.longestWildStretch, 3, 'longest wild stretch');
check(seedA.homecomingsLive, 1, 'death-path homecoming excluded');
check(seedA.homecomingsDeathPath, 1, 'death-path counted separately');
check(seedA.unloadKcal, 1500, 'unload union counts each deposit once');
check(seedA.liveUnloadKcal, 1000, 'live-return unload subtotal');
check(seedA.unloadSayLines, 1, 'unload say line counted');
check(seedA.hungerLines, 1, 'hunger lines counted');
check(seedA.campWildLines, 1, 'camp-wild lines counted');
check(seedA.completeCapture, true, 'complete capture on full snaps');

// Incomplete snapshot breaks the completeness gate, not silently.
const seedB = analyzeSeed({
  seed: 51106, daysAlive: 30, endReason: 'survived',
  mornings: [], evenings: [{ loopDay: 1, snap: null, dayLines: [] }],
  homecomings: [], deposits: [], sayLines: [],
});
check(seedB.completeCapture, false, 'null snapshot fails completeness');

// --- Verdict rule (prereg): STRUCTURAL needs 7/8 zero-home + 8/8 zero-unload + 8/8 low-haven + mechanism ---
function mkSeed(home, unload, haven) {
  return { homecomingsLive: home, unloadKcal: unload, havenEvenings: haven };
}
const structBand = [];
for (let i = 0; i < 7; i++) structBand.push(mkSeed(0, 0, 0));
structBand.push(mkSeed(1, 0, 1)); // one seed homes once, unloads nothing
check(structuralVerdict(structBand, true).verdict, 'STRUCTURAL', '7/8 zero-home still structural');
check(structuralVerdict(structBand, false).verdict, 'VARIANCE', 'no mechanism means no structural verdict');
const varBand = [];
for (let i = 0; i < 6; i++) varBand.push(mkSeed(0, 0, 0));
varBand.push(mkSeed(2, 400, 3)); varBand.push(mkSeed(1, 0, 4));
check(structuralVerdict(varBand, true).verdict, 'VARIANCE', 'two homing seeds is variance');
const unloadBand = [];
for (let i = 0; i < 8; i++) unloadBand.push(mkSeed(0, i === 3 ? 500 : 0, 0));
check(structuralVerdict(unloadBand, true).verdict, 'VARIANCE', 'any unload breaks structural zero');

// --- POSITIVE CONTROL (prereg gate G1): real game, driver wrappers ---
async function positiveControl() {
  // Env gates mirror the judged driver contract (competent base defaults).
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '1';
  const { loadGame, setupGame } = require('./sim-harness');
  const { installWrappers, packKcal } = require('./scholaraway-trace-b');
  const { Game } = await loadGame({ seed: 51105, mode: 'scholaraway-b-proof', fullTelemetry: false });
  await setupGame(Game);
  const st = { loopDay: 0, homecomings: [], deposits: [] };
  installWrappers(Game, st);
  // A pack the haul block must split: brought (3000) > KEEP_KCAL (2000),
  // so 1000 kcal unloads; a <=2000 pack would "keep" everything and
  // prove nothing about the recorder.
  Game.state.scholar.inventory = [
    { name: 'Cooked stew', kcalEach: 500, units: 6 },
  ];
  check(packKcal(Game).kcal, 3000, 'control pack is 3000 kcal');
  Game.state.scholar.lastHavenDay = (Game.state.scholar.day || 1) - 5;
  Game.returnToVillage();
  check(st.homecomings.length, 1, 'control records exactly one homecoming');
  check(st.homecomings[0].overAtEntry, false, 'control homecoming is not death-path');
  checkTrue(st.homecomings[0].unloadKcal > 0, 'control unload kcal > 0 (got ' + st.homecomings[0].unloadKcal + ')');
  checkTrue(st.deposits.some((d) => d.inReturn && d.kcal > 0), 'control deposit logged inside return');
  checkTrue(st.deposits.some((d) => /returnToVillage/.test(d.stack || '')), 'control deposit stack names returnToVillage');
}

positiveControl().then(() => {
  console.log('test-scholaraway-b: ' + n + ' checks passed (incl. positive control)');
}).catch((e) => {
  console.error('test-scholaraway-b FAILED after ' + n + ' checks: ' + (e && (e.stack || e)));
  process.exit(1);
});
