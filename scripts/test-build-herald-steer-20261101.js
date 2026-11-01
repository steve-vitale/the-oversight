#!/usr/bin/env node
// test-build-herald-steer-20261101.js — BUILD ARM 4 (HERALD STEERING) proof.
//
// Question: the Herald's lair sits 3-4 tiles east of Haven and the Herald
// moves as a symmetric random walk (wanderWorldMonsters: uniform 4-dir
// step, 35% move chance), so shared-tile contact happens on only 1/8
// heraldplace seeds. Fix: give the Herald's movement a gentle drift
// toward Haven — it seeks the village it watches — instead of a pure
// random walk. Movement only: no teleporting, no roster/list feeding
// (the target is Haven's map tile, a place, not a person list).
//
// Method: for each of 8 fixed seeds, load a fresh game, clear world
// monsters, spawn ONE subject monster at a lair-like tile (Haven + 3
// east), camp the scholar one tile east of Haven (on the drift path),
// then call wanderWorldMonsters() 3000 times and measure:
//   - meanDist: mean Manhattan distance to Haven over all ticks
//     (symmetric walk on the 9x9 => ~4.5; drifted walk hugs Haven).
//   - firstPassage: ticks until the subject first reaches distance <= 1
//     from Haven (drift pulls it in fast; a symmetric walk wanders).
//   - contactTicks: ticks ending with the subject on the scholar's
//     tile (reported before/after; the script gates on drift, and the
//     before/after comparison over identical seeds shows contact).
//   - approachShare is REPORTED, not gated: in the steady state any
//     walk — drifted or not — approaches as often as it retreats
//     (a birth-death chain in equilibrium has balanced flows), so a
//     ~0.50 share after 3000 ticks does NOT mean "no drift". The
//     signature of drift is the stationary distribution itself:
//     meanDist collapsing toward Haven and a fast first passage.
// Guards (must pass before AND after, proving the bounds held):
//   - the subject still wanders: per-seed retreat share >= 0.15 (a bias,
//     not a homing missile — a substantial minority of steps still move
//     away from Haven). Note: for single 4-dir steps, Manhattan distance
//     always changes by exactly 1, so lateral steps are impossible here
//     and retreat share is the honest wander measure.
//   - no teleport: every move changes exactly one coordinate by 1.
//   - never enters Haven: distance to Haven never reaches 0 (the
//     safe-tile block still holds).
//
// Control: MONSTER=gallowdeer runs the same measurement on an ordinary
// monster, which must stay symmetric after the fix (drift is Herald-only).
//
// Usage (from the repo root):
//   node scripts/test-build-herald-steer-20261101.js
//   MONSTER=gallowdeer node scripts/test-build-herald-steer-20261101.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const MONSTER = process.env.MONSTER || 'herald';
const SEEDS = [96101, 96102, 96103, 96104, 96105, 96106, 96107, 96108];
const TICKS = 3000;

function manhattan(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'herald-steer', fullTelemetry: false });
  await setupGame(Game);
  // Clear any starting population: one subject only, clean measurement.
  for (const m of [...Game.worldMonsters()]) Game.removeWorldMonster(m);
  const v = Game.state.village || {};
  const haven = { x: (v.px != null ? v.px : 4), y: (v.py != null ? v.py : 4) };
  // Lair-like start: 3 east of Haven; fall back to the first non-safe
  // tile east of Haven at distance >= 2 if the +3 tile is unusable.
  let lair = null;
  for (let dx = 3; dx >= 2 && !lair; dx--) {
    const t = { x: haven.x + dx, y: haven.y };
    if (t.x > 8 || Game.isSafeTile(t.x, t.y)) continue;
    lair = t;
  }
  if (!lair) throw new Error('no lair tile for seed ' + seed);
  // Scholar camp: one tile east of Haven, on the drift path.
  let camp = { x: haven.x + 1, y: haven.y };
  if (Game.isSafeTile(camp.x, camp.y)) camp = { x: haven.x, y: haven.y + 1 };
  Game.map.px = camp.x; Game.map.py = camp.y;
  const mon = Game.spawnWorldMonster(MONSTER, lair.x, lair.y, {});
  if (!mon || mon.tx !== lair.x || mon.ty !== lair.y) throw new Error('spawn failed seed ' + seed);
  let moves = 0, approach = 0, retreat = 0, lateral = 0, stays = 0;
  let contactTicks = 0, ticksAtDist1 = 0, distSum = 0, earlyDistSum = 0, teleports = 0, havenEntries = 0;
  let firstPassage = null;
  for (let t = 0; t < TICKS; t++) {
    const before = { x: mon.tx, y: mon.ty };
    Game.wanderWorldMonsters();
    const after = { x: mon.tx, y: mon.ty };
    const d0 = manhattan(before, haven), d1 = manhattan(after, haven);
    distSum += d1;
    if (t < 200) earlyDistSum += d1;
    if (d1 === 0) havenEntries++;
    if (d1 === 1) ticksAtDist1++;
    if (firstPassage == null && d1 <= 1) firstPassage = t + 1;
    if (after.x === camp.x && after.y === camp.y) contactTicks++;
    if (before.x === after.x && before.y === after.y) { stays++; continue; }
    moves++;
    const step = Math.abs(after.x - before.x) + Math.abs(after.y - before.y);
    if (step !== 1) teleports++;
    if (d1 < d0) approach++;
    else if (d1 > d0) retreat++;
    else lateral++;
  }
  return {
    seed, haven, lair, camp, moves, approach, retreat, lateral, stays,
    contactTicks, ticksAtDist1, meanDist: distSum / TICKS,
    earlyMeanDist: earlyDistSum / Math.min(200, TICKS), firstPassage,
    teleports, havenEntries,
    approachShare: (approach + retreat) > 0 ? approach / (approach + retreat) : null,
    retreatShare: moves > 0 ? retreat / moves : null,
  };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const r = await runSeed(seed);
    rows.push(r);
    console.log(`seed ${r.seed}: moves=${r.moves} approach=${r.approach} retreat=${r.retreat} lateral=${r.lateral} ` +
      `approachShare=${r.approachShare == null ? 'n/a' : r.approachShare.toFixed(3)} ` +
      `meanDist=${r.meanDist.toFixed(2)} earlyMeanDist=${r.earlyMeanDist.toFixed(2)} firstPassage=${r.firstPassage} ` +
      `contactTicks=${r.contactTicks} ticksAtDist1=${r.ticksAtDist1} ` +
      `teleports=${r.teleports} havenEntries=${r.havenEntries}`);
  }
  const avg = (k) => rows.reduce((s, r) => s + r[k], 0) / rows.length;
  const totApproach = rows.reduce((s, r) => s + r.approach, 0);
  const totRetreat = rows.reduce((s, r) => s + r.retreat, 0);
  const pooledShare = totApproach / (totApproach + totRetreat);
  const totContact = rows.reduce((s, r) => s + r.contactTicks, 0);
  const totTeleports = rows.reduce((s, r) => s + r.teleports, 0);
  const totHavenEntries = rows.reduce((s, r) => s + r.havenEntries, 0);
  const maxFirstPassage = Math.max.apply(null, rows.map((r) => (r.firstPassage == null ? Infinity : r.firstPassage)));
  const minRetreat = Math.min.apply(null, rows.map((r) => r.retreatShare));
  console.log(`AGG monster=${MONSTER} seeds=${rows.length} ticks=${TICKS} ` +
    `pooledApproachShare=${pooledShare.toFixed(3)} meanDist=${avg('meanDist').toFixed(2)} ` +
    `earlyMeanDist=${avg('earlyMeanDist').toFixed(2)} maxFirstPassage=${maxFirstPassage} ` +
    `totalContactTicks=${totContact} meanContactPerSeed=${(totContact / rows.length).toFixed(1)} ` +
    `minRetreatShare=${minRetreat.toFixed(3)} teleports=${totTeleports} havenEntries=${totHavenEntries}`);
  let fail = 0;
  function check(name, cond, detail) {
    if (cond) console.log(`  ok   ${name}`);
    else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
  }
  if (MONSTER === 'herald') {
    check('drift: mean distance to Haven <= 2.5', avg('meanDist') <= 2.5, 'meanDist=' + avg('meanDist').toFixed(2));
    check('drift: every seed reaches distance <= 1 within 150 ticks', maxFirstPassage <= 150, 'maxFirstPassage=' + maxFirstPassage);
  } else {
    check('control: mean distance stays wide (>= 3.5)', avg('meanDist') >= 3.5, 'meanDist=' + avg('meanDist').toFixed(2));
  }
  check('still wanders: min per-seed retreat share >= 0.15', minRetreat >= 0.15, 'min=' + minRetreat.toFixed(3));
  check('no teleports', totTeleports === 0, 'teleports=' + totTeleports);
  check('never enters Haven tile', totHavenEntries === 0, 'entries=' + totHavenEntries);
  console.log(fail ? `RESULT: FAIL (${fail} gate(s) failed)` : 'RESULT: PASS');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(2); });
