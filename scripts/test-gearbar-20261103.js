// test-gearbar-20261103.js — proof test for the gear-bar autopsy
// instrument + analyzer (arm sim-gearbar-a). Fixture-based (reason classes,
// gate-mismatch detection, worn-gear-missed flags, persistence runs) plus
// one live harness smoke: a fresh loaded game snapshots with gate values
// exactly equal to the instrument recount.
// Usage: node scripts/test-gearbar-20261103.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'gearbar-analyze-20261103'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function fighter(vid, over) {
  return Object.assign({ vid: vid, isScholar: false, living: true, away: false,
    ap: 0, manualAp: 0, fullSet: false, apMissed: false, wornArmor: [],
    packArmor: [], stashArmor: [], equippedWeapons: [], packWeapons: [],
    stashWeapons: [], armed: false }, over || {});
}
function snap(day, over) {
  const o = over || {};
  return Object.assign({ day: day, scholarId: 'v_scholar', roster: ['v_scholar'],
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0 },
    fighters: [], recountArmored: 0, recountArmed: 0, apMissedFighters: [],
    village: { communalWeapons: [], communalArmor: [], communalWeaponUnits: 0,
      communalArmorUnits: 0, wood: 10, codexBark: 0, codexHide: 0 } }, o);
}
function seed(over) {
  return Object.assign({ seed: 1, run: 'fixture', days: 100, endReason: 'village-lost',
    won: false, maxWave: 4, standing: 150, daily: [], instrumentErrors: [] }, over || {});
}
function oneSnapSeed(f, villageOver, readinessOver) {
  const v = Object.assign({ communalWeapons: [], communalArmor: [], communalWeaponUnits: 0,
    communalArmorUnits: 0, wood: 10, codexBark: 0, codexHide: 0 }, villageOver || {});
  const r5 = Object.assign({ ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0 }, readinessOver || {});
  const s = snap(100, { fighters: [f], village: v, readiness5: r5,
    recountArmored: r5.armored, recountArmed: r5.armed });
  return seed({ daily: [s] });
}

// --- armor classes (priority order, exactly one each) ---
ok('armor owns-not-worn: pack armor beats worn', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', { ap: 10, wornArmor: [{ slot: 'torso', id: 'bark_armor', p: 10 }], packArmor: [{ id: 'hide_armor', p: 20 }] })));
  assert.strictEqual(s.fightersEnd[0].armorClass, 'owns-not-worn');
});
ok('armor stashed-not-fetched', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', { stashArmor: [{ id: 'bark_armor', p: 10 }] })));
  assert.strictEqual(s.fightersEnd[0].armorClass, 'stashed-not-fetched');
});
ok('armor wears-below-demand: bark-only 10', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', { ap: 10, wornArmor: [{ slot: 'torso', id: 'bark_armor', p: 10 }] })));
  assert.strictEqual(s.fightersEnd[0].armorClass, 'wears-below-demand');
});
ok('armor no-armor-owned-exists-elsewhere', function () {
  const f1 = fighter('v_a', {});
  const f2 = fighter('v_b', { ap: 20, wornArmor: [{ slot: 'torso', id: 'hide_armor', p: 20 }] });
  const v = { communalWeapons: [], communalArmor: [], communalWeaponUnits: 0, communalArmorUnits: 0, wood: 10, codexBark: 0, codexHide: 0 };
  const s = classifySeedWrap(seed({ daily: [snap(100, { fighters: [f1, f2], village: v, readiness5: { ready: false, armored: 1, armed: 0, tricks: 0, veterans: 0 }, recountArmored: 1, recountArmed: 0 })] }));
  assert.strictEqual(s.fightersEnd[0].armorClass, 'no-armor-owned-exists-elsewhere');
  assert.strictEqual(s.fightersEnd[1].armorClass, 'meets');
});
ok('armor no-armor-not-crafted: recipe known, none exists', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', {}), { codexBark: 1 }));
  assert.strictEqual(s.fightersEnd[0].armorClass, 'no-armor-not-crafted');
});
ok('armor no-armor-recipe-unlearned', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', {}), { codexBark: 0, codexHide: 0 }));
  assert.strictEqual(s.fightersEnd[0].armorClass, 'no-armor-recipe-unlearned');
});
ok('armor meets at 15, and dead fighters unclassified', function () {
  const f1 = fighter('v_a', { ap: 15, wornArmor: [{ slot: 'torso', id: 'hide_armor', p: 20 }] });
  const f2 = fighter('v_b', { living: false });
  const s = classifySeedWrap(seed({ daily: [snap(100, { fighters: [f1, f2] })] }));
  assert.strictEqual(s.fightersEnd.length, 1);
  assert.strictEqual(s.fightersEnd[0].armorClass, 'meets');
});

// --- armed classes ---
ok('armed stashed-not-fetched', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', { stashWeapons: [{ id: 'hunting_spear', bonus: 30 }] })));
  assert.strictEqual(s.fightersEnd[0].armedClass, 'stashed-not-fetched');
});
ok('armed communal-untaken', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', {}), { communalWeaponUnits: 2, communalWeapons: [{ id: 'hunting_spear', units: 2 }] }));
  assert.strictEqual(s.fightersEnd[0].armedClass, 'communal-untaken');
});
ok('armed no-weapon-anywhere', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', {})));
  assert.strictEqual(s.fightersEnd[0].armedClass, 'no-weapon-anywhere');
});
ok('armed meets via carried pack weapon', function () {
  const s = classifySeedWrap(oneSnapSeed(fighter('v_a', { armed: true, packWeapons: [{ id: 'sharpened_stick', bonus: 5 }] })));
  assert.strictEqual(s.fightersEnd[0].armedClass, 'meets');
});

// --- reconciliation flags ---
ok('gate mismatch day flagged', function () {
  const s = classifySeedWrap(seed({ daily: [
    snap(10, { readiness5: { ready: false, armored: 2, armed: 3, tricks: 0, veterans: 0 }, recountArmored: 1, recountArmed: 3 }),
    snap(11, { readiness5: { ready: false, armored: 1, armed: 3, tricks: 0, veterans: 0 }, recountArmored: 1, recountArmed: 3 }),
  ] }));
  assert.strictEqual(s.gateMismatchDays.length, 1);
  assert.strictEqual(s.gateMismatchDays[0].day, 10);
});
ok('worn-gear-missed day flagged', function () {
  const s = classifySeedWrap(seed({ daily: [snap(10, { apMissedFighters: ['v_a'] })] }));
  assert.strictEqual(s.apMissedDays.length, 1);
  assert.strictEqual(s.apMissedDays[0].fighters[0], 'v_a');
});
ok('transient max tracks gate values', function () {
  const s = classifySeedWrap(seed({ daily: [
    snap(10, { readiness5: { ready: false, armored: 1, armed: 2, tricks: 0, veterans: 0 }, recountArmored: 1, recountArmed: 2 }),
    snap(20, { readiness5: { ready: false, armored: 3, armed: 5, tricks: 0, veterans: 0 }, recountArmored: 3, recountArmed: 5 }),
    snap(30, { readiness5: { ready: false, armored: 2, armed: 4, tricks: 0, veterans: 0 }, recountArmored: 2, recountArmed: 4 }),
  ] }));
  assert.strictEqual(s.maxArmored, 3);
  assert.strictEqual(s.maxArmoredDay, 20);
  assert.strictEqual(s.maxArmed, 5);
  assert.strictEqual(s.maxArmedDay, 20);
});

// --- persistence runs ---
ok('persistence: 7 home days same class detected; away resets; scholar excluded', function () {
  const days = [];
  for (let d = 1; d <= 9; d++) {
    const away = (d === 5);
    days.push(snap(d, { fighters: [
      fighter('v_a', { packArmor: [{ id: 'hide_armor', p: 20 }] }),
      fighter('v_scholar', { isScholar: true, packArmor: [{ id: 'hide_armor', p: 20 }] }),
    ], village: { communalWeapons: [], communalArmor: [], communalWeaponUnits: 0, communalArmorUnits: 0, wood: 10, codexBark: 0, codexHide: 0 } }));
    if (away) days[days.length - 1].fighters[0].away = true;
  }
  // v_a: home days 1-4 same class (run 4), away day 5 resets, home 6-9 (run 4) -> best 4, not 7.
  const s = classifySeedWrap(seed({ daily: days }));
  assert.strictEqual(s.persist.v_a.bestSameClassRun, 4);
  assert.strictEqual(s.persist.v_scholar.bestSameClassRun, 0);
  // Unbroken 7 home days -> 7.
  const days2 = [];
  for (let d = 1; d <= 7; d++) days2.push(snap(d, { fighters: [fighter('v_a', { packArmor: [{ id: 'hide_armor', p: 20 }] })] }));
  const s2 = classifySeedWrap(seed({ daily: days2 }));
  assert.strictEqual(s2.persist.v_a.bestSameClassRun, 7);
});

function classifySeedWrap(s) { return AN.classifySeed(s); }

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const INST = require(path.join(__dirname, 'gearbar-instrument-20261103'));
  const { Game } = await loadGame({ seed: 99101, mode: 'gearbar-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const snapNow = inst.snapshot();
    assert.ok(snapNow.readiness5, 'readiness5 present');
    assert.ok(Array.isArray(snapNow.fighters) && snapNow.fighters.length > 0, 'fighter rows present');
    assert.strictEqual(snapNow.readiness5.armored, snapNow.recountArmored, 'gate armored == recount armored on smoke');
    assert.strictEqual(snapNow.readiness5.armed, snapNow.recountArmed, 'gate armed == recount armed on smoke');
    assert.ok(snapNow.village, 'village context present');
    assert.strictEqual(snapNow.apMissedFighters.length, 0, 'no worn-gear-missed on smoke');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, '0 instrument errors on smoke');
    // Every living fighter row reconciles: armed flag matches its own lists.
    snapNow.fighters.filter(function (f) { return f.living; }).forEach(function (f) {
      assert.strictEqual(f.armed, f.equippedWeapons.length > 0 || f.packWeapons.length > 0, 'armed flag matches lists for ' + f.vid);
      assert.ok(f.ap >= f.manualAp || f.apMissed, 'ap vs manual sum consistent for ' + f.vid);
    });
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: gate == recount, rows reconcile');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('GEARBAR-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('GEARBAR-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
