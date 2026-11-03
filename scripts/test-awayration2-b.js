#!/usr/bin/env node
// test-awayration2-b.js — proof for the awayration2-b instrument (and,
// after the fix lands, for the fix itself).
//
// Legs:
//  A. Fixture decomposition: hand-built packMeal rows with known
//     dawn/top-up/theft numbers must decompose exactly, dup calls
//     must not pollute the primary rates, and structural violations
//     (take > want) must hard-fail via errors.
//  B. Live wiring + determinism: oneRun(96101, 100) twice, sequentially
//     (the sweep-compare pattern — one harness load per run, never
//     concurrent). The two runs must produce byte-identical packMeal
//     and meal rows (wrappers consume no RNG and change no value),
//     the analyzer must report zero structural errors, pack meals
//     must exist in volume, and >= 90% of primary rows must join to
//     a meal row (ate / ownEat coverage).
//  C. (added with the fix) packKcal meal-path sizing + theft-path
//     preservation fixtures — see the FIX section below.
//
// Env: the sweep module asserts PLENTYDEPRI=1, DEPOSITGATE=1,
// SEEDS (a legal list) and DAYS=100 at require time, so they are set
// here before require. The proof never writes into the repo: the live
// legs use oneRun() in memory only (the sweep's main block, which
// writes corpora, runs only under require.main).
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
process.env.SEEDS = '96101,96102,96103,96104,96105,96106,96107,96108';
process.env.DAYS = '100';

const assert = require('assert');
const { aggregate } = require('./analyze-awayration2-b');
const { oneRun } = require('./sweep-awayration2-b');

function fixturePerSeed() {
  // One villager, three days + one dup day + one theft day.
  const meal = (vid, day, ate, drawn, needEst) => ({ vid, day, away: true, ate, drawn, fasting: false, needEst });
  const pm = (vid, day, want, dawnKcal, poolBefore, topUpDrawn, dawnDrawn, take, topUpDoneBefore) =>
    ({ vid, day, want, away: true, rosterPos: 3, hungerAtMeal: 90, healthAtMeal: 80,
      pantryBefore: 30000, pantryAfter: 29000, poolBefore, dawnBefore: dawnKcal,
      topUpDoneBefore, dawnKcal, poolAfter: 0, topUpDoneAfter: true,
      dawnDrawn, topUpDrawn, draws: 2, take });
  return {
    seed: 96101, mealRows: [
      meal('v1', 1, 1900, 1500, 2000), // A: full (ownEat 400 + take 1500)
      meal('v1', 2, 1300, 1100, 2000), // B: pantry-limited top-up (ownEat 200)
      meal('v1', 3, 1300, 1100, 2000), // C: theft gap (ownEat 200)
      meal('v1', 4, 1900, 1500, 2000), // D: dup day (first call full)
    ],
    packRows: [
      { vid: 'v1', day: 1, hungerAtPack: 95, temper: 'steady' },
      { vid: 'v1', day: 2, hungerAtPack: 96, temper: 'steady' },
      { vid: 'v1', day: 3, hungerAtPack: 97, temper: 'steady' },
      { vid: 'v1', day: 4, hungerAtPack: 98, temper: 'steady' },
    ],
    packMealRows: [
      pm('v1', 1, 1500, 900, 900, 600, 900, 1500, false), // A: dawnGap 600, topUp 600 -> shortfall 0
      pm('v1', 2, 1500, 900, 900, 200, 900, 1100, false), // B: topUpGap 400 -> shortfall 400
      pm('v1', 3, 1500, 1000, 600, 500, 1000, 1100, false), // C: theftGap 400 -> shortfall 400
      pm('v1', 4, 1500, 900, 900, 600, 900, 1500, false), // D first call: full
      pm('v1', 4, 1500, 900, 0, 0, 0, 0, true), // D dup call: must NOT enter primary rates
    ],
    deathRows: [], daySeries: [], awayLines: [],
  };
}

async function main() {
  // --- Leg A: fixture decomposition ---
  const a = aggregate([fixturePerSeed()]);
  assert.strictEqual(a.errors.length, 0, 'fixture must be structurally clean: ' + a.errors.join('; '));
  assert.strictEqual(a.nPrimary, 4, 'primary rows = first call per (vid,day)');
  assert.strictEqual(a.nDupGroups, 1, 'one dup group');
  assert.strictEqual(a.shortfall.mean, 200, 'mean shortfall (0+400+400+0)/4');
  assert.strictEqual(a.shortfall.shareGt0, 0.5, 'half of primary meals short');
  assert.strictEqual(a.decomposition.totalShortfallKcal, 800, 'total shortfall kcal');
  assert.strictEqual(a.decomposition.topUpGapShare, 0.5, 'top-up explains half');
  assert.strictEqual(a.decomposition.theftGapShare, 0.5, 'theft explains half');
  assert.strictEqual(a.decomposition.residualShare, 0, 'no residual on clean fixtures');
  assert.strictEqual(a.decomposition.nTopUpBinding, 1, 'one top-up-binding meal');
  assert.strictEqual(a.decomposition.nTheftBinding, 1, 'one theft-binding meal');
  assert.strictEqual(a.adequacy.packDayAdequate, 1, 'all fixture meals adequate at 0.6*needEst');
  // Structural violation must hard-fail, not publish rates.
  const bad = fixturePerSeed();
  bad.packMealRows[0].take = 1600; // take > want
  const ab = aggregate([bad]);
  assert.ok(ab.errors.length >= 1, 'take>want must be a structural error');
  console.log('leg A (fixture decomposition) PASS');

  // --- Leg B: live wiring + determinism on seed 96101, 100d ---
  const r1 = await oneRun(96101, 100);
  const r2 = await oneRun(96101, 100);
  assert.strictEqual(JSON.stringify(r1.perSeed.packMealRows), JSON.stringify(r2.perSeed.packMealRows),
    'packMeal rows must be byte-identical across re-runs (wrappers consume no RNG)');
  assert.strictEqual(JSON.stringify(r1.perSeed.mealRows), JSON.stringify(r2.perSeed.mealRows),
    'meal rows must be byte-identical across re-runs');
  const live = aggregate([r1.perSeed]);
  assert.strictEqual(live.errors.length, 0, 'live corpus must be structurally clean: ' + live.errors.join('; '));
  assert.ok(live.nPrimary >= 15, `need pack-meal volume, got ${live.nPrimary}`);
  const joined = r1.perSeed.packMealRows.length; // packMeal rows always join via meal wrapper on the same day
  assert.ok(joined >= 15, 'packMeal rows must exist');
  const mealKeys = new Set(r1.perSeed.mealRows.map(m => m.vid + '|' + m.day));
  const primaryKeys = new Set();
  for (const pm of r1.perSeed.packMealRows) primaryKeys.add(pm.vid + '|' + pm.day);
  let hit = 0; for (const k of primaryKeys) if (mealKeys.has(k)) hit++;
  const joinRate = primaryKeys.size ? hit / primaryKeys.size : 0;
  assert.ok(joinRate >= 0.9, `meal join rate ${joinRate} < 0.9`);
  console.log(`leg B (live wiring + determinism) PASS: nPrimary=${live.nPrimary} joinRate=${joinRate.toFixed(3)} daysAlive=${r1.perSeed.daysAlive} packMeals=${r1.perSeed.packMealRows.length}`);

  console.log('test-awayration2-b: ALL LEGS PASS');
}

main().catch(e => { console.error('TEST FAIL', e); process.exit(1); });
