#!/usr/bin/env node
// test-scholarhome-20261021.js — proof for the scholar_home conservation
// instrument (scripts/scholarhome-conservation-20261021.js).
//
// RED -> GREEN: T1 unit-probes the sink taxonomy on hand-driven calls
//   (deposit -> tagged; pantryDraw -> packed-out... wait, pantryDraw_other;
//   sweepSpoiled -> rotted with fast/slow split). T2 runs a small
//   deterministic sim and asserts the conservation equation holds within
//   +/-2% with inflow > 0. T3 fidelity: instrumented vs pristine digests on
//   identical seeds must be equal (the wrapper is behavior-neutral).
// DET-GATE: T4 — the same instrumented run twice yields byte-identical
//   conservation JSON.
//
// Substrate (binding): FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED-unset.
'use strict';
const path = require('path');
process.chdir(path.join(__dirname, '..'));

const { loadGame, setupGame, runDays, manifest, quietLog } = require('./sim-harness');
const { install, finalize, assertSubstrate } = require('./scholarhome-conservation-20261021');
const { leadfeast } = require('./policies/feastscale');

assertSubstrate();

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : ''));
  if (!cond) failures++;
}
function canon(o) {
  return JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v))
    ? Object.keys(v).sort().reduce((a, kk) => (a[kk] = v[kk], a), {}) : v);
}
function gameDigest(Game) {
  const v = Game.state.village || {};
  return {
    gameDays: (Game.state.scholar || {}).day || 0,
    won: !!Game.won, over: !!Game.over,
    pantryKcal: Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
    nPantryStacks: (v.pantry || []).length,
  };
}

// T1: unit probe of the sink taxonomy (hand-driven, no sim).
async function t1() {
  console.log('--- T1 sink-taxonomy unit probe ---');
  const { Game } = await loadGame({ seed: 4242, mode: 'scholarhome-test' });
  await setupGame(Game);
  const S = install(Game);
  const day = (Game.state.scholar || {}).day || 1;
  // Deterministic probe: start from an empty pack so the keep/give split is
  // exact (5000 in -> 2000 kept, 3000 given -> one 3000-kcal deposit event).
  Game.state.scholar.inventory = [];
  Game.state.scholar.inventory.push({
    name: 'Test cooked meat', kcalEach: 500, units: 10,
    spoilDay: day + 30, safe: true, kg: 0.4, unit: 'portion',
    foodKind: 'meat', foodState: 'cooked', edible: true,
  });
  // SPOILDAY HONESTY probe: a spoilDay-0 (genuinely spoiled) item must NOT
  // enter the pantry (the `?? 9999` fix); it is discarded on the trail.
  Game.state.scholar.inventory.push({
    name: 'Trail-spoiled meat', kcalEach: 300, units: 1,
    spoilDay: day - 10, safe: true, kg: 0.4, unit: 'portion',
    foodKind: 'meat', foodState: 'cooked', edible: true,
  });
  Game.returnToVillage();
  check('T1 inflow recorded', S.inflow === 3000, `inflow=${S.inflow}`);
  check('T1 one deposit event (spoiled item excluded)', S.inflowEvents.length === 1,
    `events=${S.inflowEvents.length} deposited=${S.inflowEvents.map(e => e.deposited).join(',')}`);
  const tagKcal = () => (Game.state.village.pantry || [])
    .filter(p => p.__shTag).reduce((t, p) => t + (p.kcalEach || 0) * (p.units || 1), 0);
  check('T1 tagged kcal in pantry', tagKcal() === 3000, `tagged=${tagKcal()}`);
  // Sink 1: drain the pantry -> the tagged 3000 must attribute to pantryDraw_other.
  const v = Game.state.village;
  const before = S.sinks.pantryDraw_other || 0;
  Game.pantryDraw(v, 100000, {});
  check('T1 pantryDraw attributes tagged kcal', (S.sinks.pantryDraw_other || 0) - before === 3000,
    `delta=${(S.sinks.pantryDraw_other || 0) - before}`);
  check('T1 pantry drained of tags', tagKcal() === 0, `tagged=${tagKcal()}`);
  // Sink 2: a second homecoming deposit, then rot it -> rotted (slow: 30d shelf).
  Game.state.scholar.inventory = [];
  Game.state.scholar.inventory.push({
    name: 'Test cooked meat', kcalEach: 500, units: 10,
    spoilDay: day + 30, safe: true, kg: 0.4, unit: 'portion',
    foodKind: 'meat', foodState: 'cooked', edible: true,
  });
  Game.returnToVillage();
  check('T1 second deposit tagged', tagKcal() === 3000 && S.inflow === 6000,
    `tagged=${tagKcal()} inflow=${S.inflow}`);
  for (const p of Game.state.village.pantry) if (p.__shTag) p.spoilDay = day - 10;
  Game.sweepSpoiled();
  check('T1 sweepSpoiled attributes rotted', S.sinks.rotted === 3000, `rotted=${S.sinks.rotted || 0}`);
  check('T1 slow-rot bucket', S.rotSlow === 3000 && S.rotFast === 0, `fast=${S.rotFast} slow=${S.rotSlow}`);
  // Conservation on the micro-run: inflow == sinks + residual.
  const cons = finalize(Game, S);
  check('T1 equation holds', Math.abs(cons.summary.unexplainedShare) <= 0.02,
    `unexplained=${(cons.summary.unexplainedShare * 100).toFixed(2)}%`);
  check('T1 100% named', cons.summary.attributedShare >= 0.999, `attr=${cons.summary.attributedShare}`);
}

// T2: conservation on a small deterministic sim.
async function t2() {
  console.log('--- T2 conservation, 60d sim ---');
  const { Game } = await loadGame({ seed: 8951, mode: 'scholarhome-test' });
  await setupGame(Game);
  const S = install(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, leadfeast, { days: 60, manifest: manifest(8951, 'leadfeast') }); });
  const cons = finalize(Game, S);
  check('T2 inflow > 0 (scholar came home with food)', cons.summary.inflow > 0, `inflow=${Math.round(cons.summary.inflow)}`);
  check('T2 equation within +/-2%', Math.abs(cons.summary.unexplainedShare) <= 0.02,
    `unexplained=${(cons.summary.unexplainedShare * 100).toFixed(3)}%`);
  check('T2 >=95% named sinks', cons.summary.attributedShare >= 0.95, `attr=${(cons.summary.attributedShare * 100).toFixed(2)}%`);
  return { Game, S, cons };
}

// T3: fidelity — instrumented vs pristine digests identical.
async function t3() {
  console.log('--- T3 fidelity instrumented-vs-pristine ---');
  const digests = [];
  for (const armed of [true, false]) {
    const { Game } = await loadGame({ seed: 8952, mode: 'scholarhome-test' });
    await setupGame(Game);
    if (armed) install(Game);
    let result;
    await quietLog(async () => { result = await runDays(Game, leadfeast, { days: 60, manifest: manifest(8952, 'leadfeast') }); });
    const deaths = ((result.samples && result.samples.deaths) || []).length;
    digests.push(canon(Object.assign({ deaths }, gameDigest(Game))));
  }
  check('T3 instrumented digest == pristine digest', digests[0] === digests[1],
    digests[0] === digests[1] ? 'identical' : `\n  armed:   ${digests[0]}\n  pristine: ${digests[1]}`);
}

// T4: det-gate — identical instrumented re-run byte-identical.
async function t4() {
  console.log('--- T4 det-gate ---');
  const outs = [];
  for (let i = 0; i < 2; i++) {
    const { Game } = await loadGame({ seed: 8953, mode: 'scholarhome-test' });
    await setupGame(Game);
    const S = install(Game);
    await quietLog(async () => { await runDays(Game, leadfeast, { days: 45, manifest: manifest(8953, 'leadfeast') }); });
    outs.push(canon(finalize(Game, S)));
  }
  check('T4 byte-identical re-run', outs[0] === outs[1], `bytes=${outs[0].length}`);
}

(async () => {
  await t1();
  await t2();
  await t3();
  await t4();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASHED:', e); process.exit(1); });
