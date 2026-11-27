#!/usr/bin/env node
// test-departfit-b.js — proof test for the departfit instrument,
// analyzer, and (once built) the departure-fitness check in game code
// (arm sim-departfit-b). No harness, no game load for T1–T5: the
// instrument is exercised against a fake Game; the analyzer against
// synthetic per-seed files in a temp dir; plus a real-corpus check
// (frozen numbers) when the per-seed dirs exist. T6+ exercise the
// check itself against a fake Game (added with the lever).
// Usage: node scripts/test-departfit-b.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { analyzePair, median, quartile } = require('./analyze-departfit-b');
const INST = require('./departfit-b-instrument');

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
// sling and NO stones, HP 14. The fake vbrainExecuteDepart simulates
// the departure loaders: it pockets 5 stones for Alberto mid-call,
// so the PRE stamp reads dry and the POST stamp reads loaded.
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
    _people: people,
    winPlanDepart: function () { return 'launch'; },
    vbrainExecuteDepart: function () {
      // Simulate the departure loaders: pocket 5 stones for Alberto.
      people.alberto.items.push({ itemId: 'stone', units: 5 });
      return 'launch';
    },
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

// T3: install() stamps pre AND post; the post stamp sees the load
// the departure performed mid-call; non-departures are dropped.
check('T3 install stamps pre+post, drops normal', function () {
  const G = fakeGame();
  globalThis.Scattering = { equipment: { armorOf: function () { return 0; } } };
  const inst = INST.install(G);
  const ret = G.vbrainExecuteDepart('alberto', 0, 0, false);
  assert.strictEqual(ret, 'launch');
  assert.strictEqual(inst.departs.length, 1);
  const row = inst.departs[0];
  assert.strictEqual(row.result, 'launch');
  assert.strictEqual(row.complete, true);
  assert.strictEqual(row.completePost, true);
  assert.strictEqual(row.members.length, 3);
  // PRE stamp: Alberto dry (the launchfit read).
  assert.strictEqual(row.members[0].vid, 'alberto');
  assert.strictEqual(row.members[0].loaded, false);
  assert.strictEqual(row.members[0].ammoN, 0);
  // POST stamp: the departure loaders pocketed 5 stones mid-call.
  assert.strictEqual(row.membersPost[0].vid, 'alberto');
  assert.strictEqual(row.membersPost[0].loaded, true);
  assert.strictEqual(row.membersPost[0].ammoN, 5);
  assert.strictEqual(inst.errors.length, 0);
  // A 'normal' return drops the row.
  G.vbrainExecuteDepart = (function () { return function () { return 'normal'; }; })();
  G.vbrainExecuteDepart('alberto', 0, 0, false);
  assert.strictEqual(inst.departs.length, 1);
  inst.uninstall();
});

// T4: analyzer on synthetic paired corpora (pre vs post shares, bars).
check('T4 analyzer synthetic paired corpus', function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'departfit-test-'));
  const ctlDir = path.join(dir, 'ctl'), armDir = path.join(dir, 'arm');
  fs.mkdirSync(ctlDir); fs.mkdirSync(armDir);
  const m = function (vid, hp, armed, loaded, volley, ammoN) {
    return { vid: vid, name: vid, role: 'party', hp: hp, hpFrac: hp / 100, hpSource: 'person',
      armed: armed, melee: armed ? 'spear' : null, meleeBonus: armed ? 10 : 0,
      ranged: volley ? 'sling' : null, rangedBonus: 0, volley: !!volley,
      ammoNeed: volley ? 'stone' : null, ammoN: ammoN || 0, otherAmmoN: 0,
      loaded: volley ? !!loaded : null, armorP: 0, error: null };
  };
  const row = function (day, vid, result, members, membersPost, complete) {
    return { day: day, vid: vid, source: 'brain', result: result, complete: complete !== false,
      completePost: complete !== false, members: members, membersPost: membersPost || members };
  };
  const deaths = function (causes) {
    return causes.map(function (c, i) { return { day: 10 + i, kind: 'villager', who: 'v' + i, cause: c }; });
  };
  // CTL seed: 2 launches, 4 volley carriers pre-load, 2 loaded pre,
  // 3 loaded post (one pocketed mid-departure); 10 deaths, half combat.
  const ctlRows = [
    row(10, 'a', 'launch', [m('a', 80, true, false, true, 0), m('b', 90, true, true, true, 5)],
      [m('a', 80, true, true, true, 5), m('b', 90, true, true, true, 5)]),
    row(12, 'a', 'launch', [m('a', 80, true, false, true, 0), m('b', 90, true, true, true, 5)],
      [m('a', 80, true, false, true, 0), m('b', 90, true, true, true, 5)]),
  ];
  // ARM seed: same 2 launches, all 4 carriers loaded post (check held
  // nothing — both loads succeeded); 10 deaths, same causes.
  const armRows = [
    row(10, 'a', 'launch', [m('a', 80, true, false, true, 0), m('b', 90, true, true, true, 5)],
      [m('a', 80, true, true, true, 5), m('b', 90, true, true, true, 5)]),
    row(12, 'a', 'launch', [m('a', 80, true, false, true, 0), m('b', 90, true, true, true, 5)],
      [m('a', 80, true, true, true, 5), m('b', 90, true, true, true, 5)]),
  ];
  const mk = function (dir, seed, rows, deathsArr) {
    fs.writeFileSync(path.join(dir, 'departfit-b-s' + seed + '.json'),
      JSON.stringify({ seed: seed, gameDays: 150, endReason: 'time', won: false,
        scaleRank: 'village', national: 0, table: 0, endUnlockedWave: 4, maxWave: 4,
        departs: rows, deaths: deathsArr, instrumentErrors: [],
        craftCounts: { ammo_craft: 1, ammo_craft_ok: 1, weapon_craft: 0, weapon_craft_ok: 0 },
        departFit: { checked: 2, loadedByCheck: 1, heldNoAmmo: 0, heldUnarmed: 0 } }));
  };
  mk(ctlDir, 111301, ctlRows, deaths(['combat', 'combat', 'combat', 'combat', 'combat', 'disease', 'disease', 'disease', 'disease', 'disease']));
  mk(armDir, 111301, armRows, deaths(['combat', 'combat', 'combat', 'combat', 'combat', 'disease', 'disease', 'disease', 'disease', 'disease']));
  const ctlFiles = fs.readdirSync(ctlDir).map(function (f) { return path.join(ctlDir, f); });
  const armFiles = fs.readdirSync(armDir).map(function (f) { return path.join(armDir, f); });
  const res = analyzePair(ctlFiles, armFiles, null);
  // Baseline post-load share 3/4 = 0.75 (the pre-load 2/4 = 0.5 understates it).
  assert.strictEqual(res.baselinePreLoadShare, 0.5);
  assert.strictEqual(res.baselinePostLoadShare, 0.75);
  // Arm post-load share 4/4 = 1.0.
  assert.strictEqual(res.arm.postLoad.share, 1);
  assert.strictEqual(res.bars.B1.pass, true);
  assert.strictEqual(res.bars.B2.pass, true); // 2 vs 2 launches
  assert.strictEqual(res.bars.B3.pass, true); // 150 vs 150 survival
  assert.strictEqual(res.bars.B4.pass, true); // identical causes
  assert.strictEqual(res.bars.B5.pass, true); // 0 errors (determinism unverified here, not a fail)
  assert.strictEqual(res.verdict, 'GO');
  // A failing variant: arm holds everything (0 launches) -> B1/B2 fail.
  const armHoldRows = [row(10, 'a', 'hold', [m('a', 80, true, false, true, 0)])];
  mk(armDir, 111301, armHoldRows, deaths(['combat']));
  const res2 = analyzePair(ctlFiles, fs.readdirSync(armDir).map(function (f) { return path.join(armDir, f); }), null);
  assert.strictEqual(res2.arm.launches, 0);
  assert.strictEqual(res2.bars.B1.pass, false);
  assert.strictEqual(res2.bars.B2.pass, false);
  assert.strictEqual(res2.verdict, 'NO-GO');
  fs.rmSync(dir, { recursive: true, force: true });
});

// T5: real-corpus self-check (only when the run exists).
check('T5 real corpus present and self-consistent', function () {
  const ctlDir = path.join(__dirname, '..', 'evidence', '2026-11-27', 'perseed-departfit-b-ctl');
  const armDir = path.join(__dirname, '..', 'evidence', '2026-11-27', 'perseed-departfit-b-arm');
  if (!fs.existsSync(ctlDir) || !fs.existsSync(armDir)) { console.log('  (skip: no per-seed dirs yet)'); return; }
  const list = function (d) {
    return fs.readdirSync(d).filter(function (f) { return /^departfit-b-s\d+\.json$/.test(f); })
      .map(function (f) { return path.join(d, f); }).sort();
  };
  const res = analyzePair(list(ctlDir), list(armDir), null);
  assert.strictEqual(res.ctl.instrumentErrors, 0, 'ctl errors: ' + JSON.stringify(res.ctl.errorDetail));
  assert.strictEqual(res.arm.instrumentErrors, 0, 'arm errors: ' + JSON.stringify(res.arm.errorDetail));
  assert.ok(res.ctl.coverage >= 0.80, 'ctl coverage ' + res.ctl.coverage);
  assert.ok(res.arm.coverage >= 0.80, 'arm coverage ' + res.arm.coverage);
  assert.ok(res.ctl.coveragePost >= 0.80, 'ctl post coverage ' + res.ctl.coveragePost);
  assert.ok(res.arm.coveragePost >= 0.80, 'arm post coverage ' + res.arm.coveragePost);
  assert.ok(res.ctl.launches >= 10, 'ctl launches ' + res.ctl.launches);
});

console.log(pass + '/' + (pass + fail) + ' PASS');
if (fail) process.exit(1);
