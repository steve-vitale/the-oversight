#!/usr/bin/env node
// test-launchfit-b.js — proof test for the launchfit instrument +
// analyzer (arm sim-launchfit-b). No harness, no game load: the
// instrument is exercised against a fake Game; the analyzer against
// synthetic per-seed files in a temp dir; plus a real-corpus check
// (frozen numbers) when the per-seed dir exists.
// Usage: node scripts/test-launchfit-b.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { analyzeFiles, median, quartile } = require('./analyze-launchfit-b');
const INST = require('./launchfit-b-instrument');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + e.message); }
}

// T1: quartile math (hand-computed).
check('T1 quartile/median', function () {
  assert.strictEqual(median([1, 2, 3, 4]), 2.5);
  assert.strictEqual(median([5]), 5);
  assert.strictEqual(median([]), null);
  assert.strictEqual(quartile([0, 10, 20, 30], 0.25), 7.5);
  assert.strictEqual(quartile([0, 10, 20, 30], 0.75), 22.5);
});

// Fake Game for the instrument: sling (ranged, ammo stones), spear
// (melee), bow (ranged, ammo arrows); Alberto-shape villager with a
// sling and NO stones, HP 14.
function fakeGame() {
  const items = [
    { id: 'sling', name: 'Sling', weapon: { type: 'ranged', bonus: 6, ammo: 'stone' } },
    { id: 'stone', name: 'Stone', class: 'ammo' },
    { id: 'spear', name: 'Spear', weapon: { type: 'melee', bonus: 12 } },
    { id: 'bow', name: 'Bow', weapon: { type: 'ranged', bonus: 20, ammo: 'arrow' } },
    { id: 'arrow', name: 'Arrow', class: 'ammo' },
    { id: 'vest', name: 'Vest', armor: { protection: 10 } },
  ];
  const people = {
    alberto: { id: 'alberto', name: 'Alberto', health: 14,
      equipped: { ranged: { itemId: 'sling' } },
      items: [{ itemId: 'sling', units: 1 }] },
    bowman: { id: 'bowman', name: 'Bowman', health: 90,
      equipped: { melee: { itemId: 'spear' }, ranged: { itemId: 'bow' } },
      items: [{ itemId: 'spear', units: 1 }, { itemId: 'bow', units: 1 }, { itemId: 'arrow', units: 5 }] },
    bare: { id: 'bare', name: 'Bare', health: 100, equipped: {}, items: [] },
  };
  return {
    state: { scholar: { day: 66, id: 'scholar' }, village: { health: { alberto: 14, bowman: 90, bare: 100 }, winPlan: { alberto: { stage: 'launch', target: 'suburb', needWave: 4, party: ['bowman', 'bare'] } } } },
    data: { items: items },
    getPerson: function (vid) { return people[vid] || null; },
    winPlanDepart: function () { return 'launch'; },
    vbrainExecuteDepart: function () { return 'launch'; },
  };
}

// T2: stampMember classifies the Alberto shape (sling, no stones,
// 14 HP) as volley + unloaded, and the bowman as loaded.
check('T2 stampMember Alberto vs bowman', function () {
  const G = fakeGame();
  globalThis.Scattering = { equipment: { armorOf: function () { return 0; } } };
  const a = INST.stampMember(G, 'alberto', 'holder');
  assert.strictEqual(a.error, null);
  assert.strictEqual(a.hp, 14);
  assert.strictEqual(a.ranged, 'sling');
  assert.strictEqual(a.volley, true);
  assert.strictEqual(a.ammoNeed, 'stone');
  assert.strictEqual(a.ammoN, 0);
  assert.strictEqual(a.loaded, false);
  assert.strictEqual(a.armed, true);
  const b = INST.stampMember(G, 'bowman', 'party');
  assert.strictEqual(b.loaded, true);
  assert.strictEqual(b.ammoN, 5);
  assert.strictEqual(b.melee, 'spear');
  assert.strictEqual(b.meleeBonus, 12);
  const c = INST.stampMember(G, 'bare', 'party');
  assert.strictEqual(c.armed, false);
  assert.strictEqual(c.loaded, null);
  assert.strictEqual(c.hp, 100);
  const missing = INST.stampMember(G, 'ghost', 'party');
  assert.strictEqual(missing.error, 'no-person');
});

// T3: install() stamps a departure BEFORE the original call and drops
// non-departures.
check('T3 install stamps launch, drops normal', function () {
  const G = fakeGame();
  globalThis.Scattering = { equipment: { armorOf: function () { return 0; } } };
  const inst = INST.install(G);
  const ret = G.winPlanDepart('alberto', 0, 0, false);
  assert.strictEqual(ret, 'launch');
  assert.strictEqual(inst.departs.length, 1);
  const row = inst.departs[0];
  assert.strictEqual(row.result, 'launch');
  assert.strictEqual(row.complete, true);
  assert.strictEqual(row.members.length, 3);
  assert.strictEqual(row.members[0].vid, 'alberto');
  assert.strictEqual(row.members[0].hp, 14);
  assert.strictEqual(row.members[0].loaded, false);
  assert.strictEqual(inst.errors.length, 0);
  // A 'normal' return drops the row.
  G.winPlanDepart = (function (orig) { return function () { return 'normal'; }; })(G.winPlanDepart);
  G.winPlanDepart('alberto', 0, 0, false);
  assert.strictEqual(inst.departs.length, 1);
  inst.uninstall();
});

// T4: analyzer on synthetic per-seed files (coverage, shares, Alberto).
check('T4 analyzer synthetic corpus', function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchfit-test-'));
  const mk = function (seed, rows, errs) {
    fs.writeFileSync(path.join(dir, 'launchfit-b-s' + seed + '.json'),
      JSON.stringify({ seed: seed, departs: rows, instrumentErrors: errs || [] }));
  };
  const m = function (vid, hp, armed, loaded, volley, ammoN) {
    return { vid: vid, name: vid, role: 'party', hp: hp, hpFrac: hp / 100, hpSource: 'person',
      armed: armed, melee: armed ? 'spear' : null, meleeBonus: armed ? 10 : 0,
      ranged: volley ? 'sling' : null, rangedBonus: 0, volley: !!volley,
      ammoNeed: volley ? 'stone' : null, ammoN: ammoN || 0, otherAmmoN: 0,
      loaded: volley ? !!loaded : null, armorP: 0, error: null };
  };
  mk(111101, [
    { day: 10, vid: 'a', source: 'winPlanDepart', result: 'launch', complete: true,
      members: [m('a', 14, true, false, true, 0), m('b', 90, true, true, true, 5)] },
    { day: 12, vid: 'a', source: 'brain', result: 'hold', complete: true,
      members: [m('a', 80, true, null, false, 0)] },
    { day: 14, vid: 'a', source: 'winPlanDepart', result: 'launch', complete: false,
      members: [m('a', 50, false, null, false, 0)] },
  ]);
  mk(111102, [
    { day: 20, vid: 'c', source: 'winPlanDepart', result: 'launch', complete: true,
      members: [m('c', 100, false, null, false, 0), m('d', 100, true, null, false, 0)] },
  ]);
  const res = analyzeFiles(fs.readdirSync(dir).map(function (f) { return path.join(dir, f); }));
  assert.strictEqual(res.departs, 4);
  assert.strictEqual(res.launches, 3);
  assert.strictEqual(res.coverage, 0.75); // 3/4 complete
  assert.strictEqual(res.bars.B1.pass, false); // 0.75 < 0.80
  assert.strictEqual(res.bars.B2.pass, false); // 3 launches < 10
  assert.strictEqual(res.launchArmedShare.median, 0.5);
  assert.strictEqual(res.launchHp.median, 90);
  assert.strictEqual(res.launchHp.shareLt50, 1 / 5);
  assert.strictEqual(res.volley.carriers, 2);
  assert.strictEqual(res.volley.loadedShare, 0.5);
  assert.strictEqual(res.albertoLike.length, 1);
  assert.strictEqual(res.albertoLike[0].hp, 14);
  assert.strictEqual(res.verdict, 'DIAG-NO-GO');
  fs.rmSync(dir, { recursive: true, force: true });
});

// T5: real-corpus determinism + frozen numbers (only when the run exists).
check('T5 real corpus present and self-consistent', function () {
  const dir = path.join(__dirname, '..', 'evidence', '2026-11-27', 'perseed-launchfit-b');
  if (!fs.existsSync(dir)) { console.log('  (skip: no per-seed dir yet)'); return; }
  const files = fs.readdirSync(dir).filter(function (f) { return /^launchfit-b-s\d+\.json$/.test(f); })
    .map(function (f) { return path.join(dir, f); }).sort();
  assert.ok(files.length >= 8, 'expected 8 per-seed files, got ' + files.length);
  const res = analyzeFiles(files);
  assert.strictEqual(res.instrumentErrors, 0, 'instrument errors: ' + JSON.stringify(res.errorDetail));
  assert.ok(res.coverage >= 0.80, 'coverage ' + res.coverage);
  assert.ok(res.launches >= 10, 'launches ' + res.launches);
});

console.log(pass + '/' + (pass + fail) + ' PASS');
if (fail) process.exit(1);
