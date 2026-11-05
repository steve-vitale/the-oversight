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
//  C. Fix proof (live fixture, RED on baseline, GREEN on the fix):
//     on a fresh loaded game with a plentiful pantry, a meal-path
//     packKcal(vid, 1200) for a HUNGRY villager must draw >= 1200
//     (the old formula caps a hunger-100 villager at 1000, so this
//     proves the hunger deduction is gone on the meal path); a
//     theft-path packKcal(vid) for a hungry NON-bold villager must
//     stay <= 1000 (old formula, hunger deduction still present);
//     packKcal(vid, 100) must floor at >= 200; packKcal(vid, null)
//     must fall back to the old-formula range [200, 1450]; the pantry
//     must lose exactly the drawn kcal (honest real items, never
//     conjured); and packMeal must still top up (reseed small, then
//     packMeal to a bigger want takes the full want).
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
const { loadGame, setupGame } = require('./sim-harness');

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

  // --- Leg C: fix proof on a fresh fixture game ---
  const { Game } = await loadGame({ seed: 7, mode: 'awayration2-b-fixture', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 0;
  try { if (Game.stockPantry) Game.stockPantry(50000, 'proof stock'); } catch (e) {}
  const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
  const fresh = (id) => { const p = (v.pack || {})[id]; return !p || p.day !== day; };
  const pick = (pred) => roster.find(id => fresh(id) && (!pred || pred(id)));
  // vidA: meal path, hungry — must draw >= 1200 (old formula caps at 1000).
  const vidA = pick();
  assert.ok(vidA, 'need a roster villager without a pack entry today (vidA)');
  try { Game.npcNeeds(vidA).hunger = 100; } catch (e) {}
  const pkBeforeA = Game.pantryKcalLive(v);
  const retA = Game.packKcal(vidA, 1200);
  const dawnA = (v.pack[vidA] || {}).dawnKcal;
  const pkAfterA = Game.pantryKcalLive(v);
  assert.ok(dawnA >= 1200, `meal-path dawn ${dawnA} must be >= want 1200`);
  assert.strictEqual(pkBeforeA - pkAfterA, dawnA, 'pantry must lose exactly the drawn kcal (honest items)');
  assert.ok(retA >= 1200, 'meal-path packKcal return must be >= want');
  // vidB: theft path, hungry + non-bold — old formula caps at 1000.
  const vidB = pick(id => { try { return Game.npcTemper(id) !== 'bold'; } catch (e) { return false; } });
  assert.ok(vidB, 'need a hungry non-bold roster villager without a pack entry today (vidB)');
  try { Game.npcNeeds(vidB).hunger = 100; } catch (e) {}
  const retB = Game.packKcal(vidB);
  assert.ok(retB >= 200 && retB <= 1000, `theft-path pack ${retB} must be in [200,1000] for hunger-100 non-bold (old formula)`);
  // vidC: floor — meal-path want 100 must floor at >= 200.
  const vidC = pick();
  assert.ok(vidC, 'need a roster villager without a pack entry today (vidC)');
  Game.packKcal(vidC, 100);
  const dawnC = (v.pack[vidC] || {}).dawnKcal;
  assert.ok(dawnC >= 200, `meal-path floor: dawn ${dawnC} must be >= 200 for want 100`);
  // vidD: invalid mealWant falls back to the old-formula range.
  const vidD = pick();
  assert.ok(vidD, 'need a roster villager without a pack entry today (vidD)');
  const retD = Game.packKcal(vidD, null);
  assert.ok(retD >= 200 && retD <= 1450, `fallback pack ${retD} must be in old-formula range [200,1450]`);
  // Top-up preserved: vidC's pack (~200-700 drawn) topped up to a 1500 want.
  const exposure = Game.freshExposure ? Game.freshExposure() : { raw: [], unsafe: 0, poison: [], monster: [], spoiled: 0 };
  const takeC = Game.packMeal(vidC, 1500, exposure);
  assert.strictEqual(takeC, 1500, `packMeal top-up must take the full want 1500, got ${takeC}`);
  console.log(`leg C (fix proof) PASS: mealDawn=${dawnA} theftPack=${retB} floorDawn=${dawnC} fallbackPack=${retD} topUpTake=${takeC}`);

  console.log('test-awayration2-b: ALL LEGS PASS');
}

main().catch(e => { console.error('TEST FAIL', e); process.exit(1); });
