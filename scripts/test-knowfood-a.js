// test-knowfood-a.js — proof test for the sim-knowfood-a instrument
// (arm sim-knowfood-a, run fleshout-loop-a-20261110T2215Z).
//
// Two parts:
//   (1) RECORDER-VALIDITY FIXTURES (no harness): fake Game objects with
//       stubbed methods. Each fixture asserts the recorder lands the event
//       in the RIGHT bucket — including swapped-label fixtures (flip the
//       known flags and the recorded buckets must flip) and a dropped-event
//       fixture (a throwing original must still record AND rethrow). The
//       villager-side known check itself is unit-tested against every item
//       class in the prereg (plant per-eater, monster meat by village
//       verdict, animal meat always known, meat_unknown definitionally
//       unknown, meat_human with no verdict). A recorder that hardcodes a
//       bucket, drops an event, or swallows a throw FAILS here.
//   (2) SIM LEGS (harness, 3 proof seeds 170225–170227, 30d): determinism
//       (MODE=on twice → byte-identical per-seed JSONs) and neutrality
//       (MODE=on vs MODE=off → identical end-state digests), run via the
//       driver as child processes.
//
// Usage: node scripts/test-knowfood-a.js
// Exit 0 when all assertions pass; exit 1 with the failing assertion named.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'knowfood-a-instrument-20261110'));

let failures = [];
let checks = 0;
function check(name, cond, extra) {
  checks++;
  if (!cond) failures.push(name + (extra ? ' :: ' + extra : ''));
  else console.log('ok - ' + name);
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---------- (1) fixtures ----------
function fakeGame(overrides) {
  const G = {
    villagerId: 'scholar-id',
    state: {
      scholar: { day: 5, inventory: [], prepStash: [] },
      village: {
        roster: ['a', 'b', 'c'],
        pantry: [], sharedKnowledge: {}, fallen: [],
        lastExperimentDay: null,
      },
      codex: { plants: {}, monsters: {} },
    },
    data: {
      plants: [{ id: 'dandelion' }, { id: 'yarrow' }, { id: 'mugwort' }],
      animals: [{ id: 'deer' }, { id: 'rabbit' }],
      monsters: [{ id: 'gallowdeer' }, { id: 'hushwolf' }, { id: 'belltoad' }],
      villagers: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      background_survivors: [],
    },
    getPerson: function (id) { return { id: id, dead: false }; },
    // 'a' knows dandelion (familiar) and yarrow (taught); 'b' knows nothing.
    plantKnownBy: function (vid, pid) {
      const known = { a: ['dandelion', 'yarrow'] };
      return (known[vid] || []).indexOf(pid) !== -1;
    },
    // Scholar/codex knows dandelion + mugwort (NOT yarrow).
    plantKnown: function (pid) { return pid === 'dandelion' || pid === 'mugwort'; },
    pantryItemKnown: function (it) {
      if (!it || !it.plantId) return true;
      if (String(it.plantId).indexOf('meat_') === 0) {
        const mid = String(it.plantId).slice(5);
        const e = (this.state.codex.monsters || {})[mid];
        return !!((e && e.villageName) || this.state.systemArrived);
      }
      return this.plantKnown(it.plantId);
    },
    // Village safety verdicts: hushwolf safe (but UNNAMED — the
    // knowledge-b exception case); gallowdeer not safe; belltoad_legs safe.
    monsterFoodSafe: function (mid) {
      return mid === 'hushwolf' || mid === 'belltoad_legs';
    },
    monsterFoodPoisoned: function (mid) { return false; },
    monsterMeatGated: function (mid) {
      return mid === 'belltoad_legs' || this.data.monsters.some(function (m) { return m.id === mid; });
    },
    isSpoiled: function (it) { return !!it.spoiled; },
    playerAtHaven: function () { return true; },
    pantryDraw: function (v, want) {
      return { taken: 600, items: [
        { item: { plantId: 'dandelion', foodKind: 'plant', kcalEach: 100 }, units: 1, effectiveKcal: 100 },
        { item: { plantId: 'meat_hushwolf', foodKind: 'meat', kcalEach: 500 }, units: 1, effectiveKcal: 500, cooked: true },
      ] };
    },
    villagerMealDay: function (vid) { return { ate: 100 }; },
    packMeal: function (vid, want) { return 300; },
    drawSpoiled: function (v, want) { return 0; },
    villagerDayProduction: function (person, vid, v) { return 1200; },
    villagerExperimentBeat: function (present) { return undefined; },
    unlockedWave: function () { return 1; },
    villageStandingTotal: function () { return 0; },
    scaleRank: function () { return 'village'; },
  };
  if (overrides) Object.assign(G, overrides);
  return G;
}

(function fixtures() {
  // --- The villager-side known check, per item class (prereg) ---
  let G = fakeGame();
  const K = INST.villagerKnownOf;
  check('known-check: plant known by eater => known (dandelion/a)', K(G, 'a', { plantId: 'dandelion' }) === true);
  check('known-check: plant unknown to eater => unknown (mugwort/a)', K(G, 'a', { plantId: 'mugwort' }) === false);
  check('known-check: plant known by eater but NOT scholar => known (yarrow/a)', K(G, 'a', { plantId: 'yarrow' }) === true);
  check('known-check: plant known to nobody => unknown (yarrow/b)', K(G, 'b', { plantId: 'yarrow' }) === false);
  check('known-check: monster meat safe but UNNAMED => known (hushwolf)', K(G, 'a', { plantId: 'meat_hushwolf' }) === true);
  check('known-check: monster meat unsafe => unknown (gallowdeer)', K(G, 'a', { plantId: 'meat_gallowdeer' }) === false);
  check('known-check: belltoad_legs safe => known', K(G, 'a', { plantId: 'meat_belltoad_legs' }) === true);
  check('known-check: animal meat always known (deer)', K(G, 'a', { plantId: 'meat_deer' }) === true);
  check('known-check: meat_unknown definitionally unknown', K(G, 'a', { plantId: 'meat_unknown' }) === false);
  check('known-check: meat_human, no verdict => unknown', K(G, 'a', { plantId: 'meat_human' }) === false);
  check('known-check: no plantId (staple) => known', K(G, 'a', { foodKind: 'plant' }) === true);
  check('known-check: non-plant plantId (tool) => known', K(G, 'a', { plantId: 'stone_knife' }) === true);
  check('known-check: null item => error', K(G, 'a', null) === 'error');
  check('known-check: null eater on a plant => error', K(G, null, { plantId: 'dandelion' }) === 'error');
  // Scholar-side check on the same items (the delta the arm measures).
  const S = INST.scholarKnownOf;
  check('scholar-check: hushwolf unnamed => unknown (the split)', S(G, { plantId: 'meat_hushwolf' }) === false);
  check('scholar-check: yarrow unknown to scholar => unknown', S(G, { plantId: 'yarrow' }) === false);
  check('scholar-check: dandelion known to scholar => known', S(G, { plantId: 'dandelion' }) === true);

  // --- Recorder: villager meal draw, both known flags ---
  G = fakeGame({
    villagerMealDay: function (vid) { return G.pantryDraw(G.state.village, 600); },
  });
  let inst = INST.install(G);
  G.villagerMealDay('a');
  check('food: villager meal draw recorded', inst.t.foodDraws.length === 1, 'got ' + inst.t.foodDraws.length);
  const d0 = inst.t.foodDraws[0];
  check('food: draw context is villager-meal', d0 && d0.context === 'villager-meal' && d0.vid === 'a');
  check('food: dandelion known villager-side (eater knows it)', d0 && d0.items[0].knownVillager === true, JSON.stringify(d0 && d0.items));
  check('food: hushwolf known villager-side (safe verdict, unnamed)', d0 && d0.items[1].knownVillager === true, JSON.stringify(d0 && d0.items));
  check('food: hushwolf UNKNOWN scholar-side (unnamed — the split)', d0 && d0.items[1].knownScholar === false, JSON.stringify(d0 && d0.items));
  check('food: cooked flag recorded', d0 && d0.items[1].cooked === true, JSON.stringify(d0 && d0.items));
  check('food: no instrument errors on happy path', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  inst.uninstall();

  // --- Swapped-label fixture: eater 'b' knows nothing; both items flip ---
  G = fakeGame({
    villagerMealDay: function (vid) { return G.pantryDraw(G.state.village, 600); },
  });
  inst = INST.install(G);
  G.villagerMealDay('b');
  const ds = inst.t.foodDraws[0];
  check('food-swapped: dandelion unknown to eater b', ds && ds.items[0].knownVillager === false, JSON.stringify(ds && ds.items));
  check('food-swapped: hushwolf still known (village verdict, not eater)', ds && ds.items[1].knownVillager === true, JSON.stringify(ds && ds.items));
  check('food-swapped: scholar flags do NOT flip with the eater', ds && ds.items[0].knownScholar === true && ds.items[1].knownScholar === false, JSON.stringify(ds && ds.items));
  inst.uninstall();

  // --- Scholar bucket: the scholar's own meal is excluded from the rate ---
  G = fakeGame({
    villagerMealDay: function (vid) { return G.pantryDraw(G.state.village, 600); },
  });
  inst = INST.install(G);
  G.villagerMealDay('scholar-id');
  check('food: scholar meal flagged isScholar', inst.t.foodDraws[0] && inst.t.foodDraws[0].isScholar === true, JSON.stringify(inst.t.foodDraws[0]));
  inst.uninstall();

  // --- Pack seeding: pantryDraw inside packMeal is flagged packSeed ---
  G = fakeGame({
    packMeal: function (vid, want) { G.pantryDraw(G.state.village, want); return 300; },
    villagerMealDay: function (vid) { return G.packMeal(vid, 600); },
  });
  inst = INST.install(G);
  G.villagerMealDay('a');
  check('pack: seeding draw flagged packSeed', inst.t.foodDraws[0] && inst.t.foodDraws[0].packSeed === true, JSON.stringify(inst.t.foodDraws[0]));
  check('pack: pack meal recorded with kcal taken', inst.t.packMeals.length === 1 && inst.t.packMeals[0].taken === 300, JSON.stringify(inst.t.packMeals));
  inst.uninstall();

  // --- drawSpoiled: before/after diff identifies eaten items ---
  const spoiledItem = { plantId: 'mugwort', foodKind: 'plant', kcalEach: 100, units: 2, spoiled: true };
  const spoiledMeat = { plantId: 'meat_gallowdeer', foodKind: 'meat', kcalEach: 400, units: 1, spoiled: true };
  const freshItem = { plantId: 'dandelion', foodKind: 'plant', kcalEach: 100, units: 5, spoiled: false };
  G = fakeGame({
    drawSpoiled: function (v, want) {
      // Eat 1 unit of the spoiled mugwort, leave the meat: the real
      // function consumes in pantry order.
      spoiledItem.units -= 1;
      return 100;
    },
    villagerMealDay: function (vid) { return G.drawSpoiled(G.state.village, 100); },
  });
  G.state.village.pantry = [spoiledItem, spoiledMeat, freshItem];
  inst = INST.install(G);
  G.villagerMealDay('a');
  const sp = inst.t.spoiledDraws[0];
  check('spoiled: call recorded', !!sp, JSON.stringify(inst.t.spoiledDraws));
  check('spoiled: 2 candidates (mugwort + gallowdeer meat)', sp && sp.candidates === 2, JSON.stringify(sp));
  check('spoiled: both candidates unknown to eater a', sp && sp.candidatesUnknownVillager === 2, JSON.stringify(sp));
  check('spoiled: exactly the eaten item recorded (mugwort x1)', sp && sp.takenItems.length === 1 && sp.takenItems[0].plantId === 'mugwort' && sp.takenItems[0].units === 1, JSON.stringify(sp && sp.takenItems));
  check('spoiled: eaten item unknown villager-side', sp && sp.takenItems[0].knownVillager === false, JSON.stringify(sp && sp.takenItems));
  inst.uninstall();

  // --- Experiment beat: plant target attributed with verdict + tester ---
  G = fakeGame();
  G.state.scholar.prepStash = [{ lump: { yarrow: { units: 5 } } }];
  G.villagerExperimentBeat = function (present) {
    G.state.village.lastExperimentDay = 5;
    G.state.village.sharedKnowledge.yarrow = { discoveredBy: 'b', day: 5, level: 1, tested: 'safe', testedBy: 'b' };
    return undefined;
  };
  inst = INST.install(G);
  G.villagerExperimentBeat(true);
  const eb = inst.t.experimentBeats[0];
  check('beat: plant target attributed', eb && eb.target && eb.target.kind === 'plant' && eb.target.id === 'yarrow', JSON.stringify(eb));
  check('beat: verdict safe + tester b', eb && eb.verdict === 'safe' && eb.tester === 'b', JSON.stringify(eb));
  check('beat: outcome tested', eb && eb.outcome === 'tested' && eb.fired === true, JSON.stringify(eb));
  inst.uninstall();

  // --- Experiment beat: meat target attributed (poison verdict) ---
  G = fakeGame();
  const fleshItem = { plantId: 'meat_gallowdeer', foodKind: 'meat', edible: false, kcalEach: 0 };
  G.state.village.pantry = [fleshItem];
  G.villagerExperimentBeat = function (present) {
    G.state.village.lastExperimentDay = 5;
    G.state.codex.monsters.gallowdeer = { foodSafe: false, foodTested: 'poison', foodTestedBy: 'c' };
    return undefined;
  };
  inst = INST.install(G);
  G.villagerExperimentBeat(true);
  const eb2 = inst.t.experimentBeats[0];
  check('beat-meat: meat target attributed', eb2 && eb2.target && eb2.target.kind === 'meat' && eb2.target.id === 'gallowdeer', JSON.stringify(eb2));
  check('beat-meat: verdict poison + tester c', eb2 && eb2.verdict === 'poison' && eb2.tester === 'c', JSON.stringify(eb2));
  inst.uninstall();

  // --- Experiment beat: not present => outcome not-present, no fire ---
  G = fakeGame({ playerAtHaven: function () { return false; } });
  inst = INST.install(G);
  G.villagerExperimentBeat(false);
  const eb3 = inst.t.experimentBeats[0];
  check('beat: not-present outcome recorded, not fired', eb3 && eb3.outcome === 'not-present' && eb3.fired === false, JSON.stringify(eb3));
  inst.uninstall();

  // --- Dropped-event fixture: a throwing original still records + rethrows ---
  G = fakeGame({
    villagerExperimentBeat: function (present) { throw new Error('boom-test'); },
  });
  inst = INST.install(G);
  let threw = false;
  try { G.villagerExperimentBeat(true); } catch (e) { threw = (e.message === 'boom-test'); }
  check('dropped-event: throw propagates', threw);
  check('dropped-event: event still recorded', inst.t.experimentBeats.length === 1, 'got ' + inst.t.experimentBeats.length);
  check('dropped-event: no instrument error for a game throw', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  inst.uninstall();

  // --- Missing-method fixture: removing a method reports, never silently skips ---
  G = fakeGame();
  delete G.drawSpoiled;
  inst = INST.install(G);
  check('missing-method: drawSpoiled-missing reported', inst.t.instrumentErrors.some(function (e) { return e.indexOf('drawSpoiled-missing') === 0; }), JSON.stringify(inst.t.instrumentErrors));
  inst.uninstall();

  // --- Production totals accumulate (scalar, no identity) ---
  G = fakeGame();
  inst = INST.install(G);
  G.villagerDayProduction({}, 'a', G.state.village);
  G.villagerDayProduction({}, 'b', G.state.village);
  check('production: totals accumulated', inst.t.produced.n === 2 && inst.t.produced.total === 2400, JSON.stringify(inst.t.produced));
  // Snapshot runs without error and counts unknown flesh present.
  G.state.village.pantry = [{ plantId: 'meat_gallowdeer', foodKind: 'meat', edible: false, kcalEach: 0, units: 3 }];
  inst.snapshot();
  const dn = inst.t.daily[0];
  check('snapshot: unknown flesh present counted', dn && dn.unknownFleshItems === 1 && dn.unknownFleshUnits === 3, JSON.stringify(dn));
  inst.uninstall();
})();

// ---------- (2) sim legs ----------
function runDriver(seeds, days, run, mode) {
  const env = Object.assign({}, process.env, {
    SEEDS: seeds.join(','), DAYS: String(days), RUN: run, KNOWFOOD_A_MODE: mode,
  });
  try {
    execSync('node scripts/knowfood-a-driver-20261110.js', { cwd: REPO, env: env, timeout: 600000, maxBuffer: 64 * 1024 * 1024, stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout || Buffer.alloc(0)).toString() + (e.stderr || Buffer.alloc(0)).toString();
    throw new Error('driver ' + run + '/' + mode + ' failed: ' + out.slice(-2000));
  }
}

(function simLegs() {
  const seeds = [170225, 170226, 170227];
  const dir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-knowfood-a');
  runDriver(seeds, 30, 'knowfood-a-proof-det-a', 'on');
  runDriver(seeds, 30, 'knowfood-a-proof-det-b', 'on');
  runDriver(seeds, 30, 'knowfood-a-proof-neu-off', 'off');
  for (const seed of seeds) {
    const fa = path.join(dir, 'knowfood-a-s' + seed + '-knowfood-a-proof-det-a-on.json');
    const fb = path.join(dir, 'knowfood-a-s' + seed + '-knowfood-a-proof-det-b-on.json');
    const fo = path.join(dir, 'knowfood-a-s' + seed + '-knowfood-a-proof-neu-off-off.json');
    const ja = JSON.parse(fs.readFileSync(fa, 'utf8'));
    const jb = JSON.parse(fs.readFileSync(fb, 'utf8'));
    const jo = JSON.parse(fs.readFileSync(fo, 'utf8'));
    // Determinism compares the event tables, not the run label itself
    // (the two runs differ in RUN by construction).
    const jaNoRun = Object.assign({}, ja, { run: 'X' });
    const jbNoRun = Object.assign({}, jb, { run: 'X' });
    check('determinism seed ' + seed + ': on-runs identical modulo run label', JSON.stringify(jaNoRun) === JSON.stringify(jbNoRun));
    check('neutrality seed ' + seed + ': on/off digests identical', eq(ja.digest, jo.digest), 'on=' + JSON.stringify(ja.digest) + ' off=' + JSON.stringify(jo.digest));
    check('pilot-sections seed ' + seed + ': all sections present', Array.isArray(ja.foodDraws) && Array.isArray(ja.experimentBeats) && Array.isArray(ja.spoiledDraws) && Array.isArray(ja.packMeals) && Array.isArray(ja.daily) && !!ja.produced);
    check('instrument-errors seed ' + seed + ': 0 errors', (ja.instrumentErrors || []).length === 0, JSON.stringify(ja.instrumentErrors).slice(0, 400));
    // GO bar item 7 preview: every drawn villager-meal item carries a
    // villager-side known boolean (no 'error' check results).
    let errItems = 0;
    for (const d of (ja.foodDraws || [])) for (const it of (d.items || [])) if (it.knownVillager === 'error' || it.knownScholar === 'error') errItems++;
    check('valid-rate seed ' + seed + ': 0 known-check errors in draws', errItems === 0, 'errItems=' + errItems);
  }
})();

console.log('test-knowfood-a: ' + checks + ' checks, ' + failures.length + ' failures');
if (failures.length) {
  for (const f of failures) console.error('FAIL: ' + f);
  process.exit(1);
}
console.log('test-knowfood-a: PASS');
