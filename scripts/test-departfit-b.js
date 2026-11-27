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

// ---------- T6+ — the departure-fitness check itself ----------
// Load the real villager-brain.js the way test-holdspeak-a.js does:
// stub Scattering.equipment first, then require; Game is
// globalThis.Scattering.Game.
globalThis.Scattering = {
  Game: {},
  equipment: {
    armorOf: function (person) { return (person && person._armorP) || 0; },
    weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
    volleyWeaponOf: function (person, defs) {
      const eq = (person && person.equipped) || {};
      const w = eq.ranged || null;
      if (!w) return null;
      const d = (defs || []).find(function (x) { return x.id === (w.itemId || w.id); });
      if (!d || !d.weapon || !d.weapon.ammo) return null;
      return w;
    },
  },
};
const BRAIN = require(path.join(__dirname, '..', 'src', 'js', 'villager-brain.js'));
const Game = globalThis.Scattering.Game;

const HOLD_BEAT_RE = /— the party waits\./;
function seedRng(seed) {
  let s = (seed | 0) || 1;
  Math.random = function () {
    s = (Math.imul(s, 1103515245) + 12345) | 0;
    return ((s >>> 0) % 10000) / 10000;
  };
}

const FIT_DEFS = [
  { id: 'sling', name: 'Sling', weapon: { type: 'ranged', bonus: 6, ammo: 'stone' } },
  { id: 'stone', name: 'Stone', class: 'ammo' },
  { id: 'spear', name: 'Spear', weapon: { type: 'melee', bonus: 12 } },
  { id: 'bow', name: 'Bow', weapon: { type: 'ranged', bonus: 20, ammo: 'arrow' } },
  { id: 'arrow', name: 'Arrow', class: 'ammo' },
  { id: 'vest', name: 'Vest', armor: { protection: 10 } },
];

function fitPeople(opts) {
  const o = opts || {};
  const people = {
    mara_voss: { id: 'mara_voss', name: 'Mara Voss', dead: false, _armorP: 0, _weaponB: 20,
      health: (o.maraHp != null ? o.maraHp : 100),
      equipped: { ranged: { itemId: 'bow' } },
      items: [{ itemId: 'bow', units: 1 }] },
    desmond_okafor: { id: 'desmond_okafor', name: 'Desmond Okafor', dead: false, _armorP: 10, _weaponB: 12,
      health: 100, equipped: { melee: { itemId: 'spear' } },
      items: [{ itemId: 'spear', units: 1 }] },
    bare_bones: { id: 'bare_bones', name: 'Bare Bones', dead: false, _armorP: 0, _weaponB: 0,
      health: 100, equipped: {}, items: [] },
  };
  if (o.spearRanged) {
    // A spear in the ranged slot: melee, no ammo — not a volley carrier.
    people.mara_voss.equipped = { ranged: { itemId: 'spear' } };
    people.mara_voss.items = [{ itemId: 'spear', units: 1 }];
    people.mara_voss._weaponB = 12;
  }
  if (o.maraLoaded) people.mara_voss.items.push({ itemId: 'arrow', units: 5 });
  return people;
}

// Fixture ctx for the check (direct calls) and the full depart path.
// pocketLoads: the stubbed villagerPocketAmmo loads ammo (adds arrows);
// gearUpArms: the stubbed villagerGearUp arms the member (spear).
function fitCtx(opts) {
  const o = opts || {};
  const people = fitPeople(o);
  const holder = o.holder || 'mara_voss';
  const says = [];
  const exped = {};
  const calls = { gearUp: [], stageBow: [], pocketAmmo: [] };
  const plan = { stage: 'party', target: 'eater', needWave: 4,
    node: { nx: 6, ny: 5 }, party: [], reseedExpiryDay: null };
  const commit = Object.assign({ day: 40, kind: 'EXPEDITION',
    winPlanAction: 'party_launch', companion: 'desmond_okafor' }, o.commit || {});
  const ctx = {
    state: { scholar: { day: 40, id: '__scholar__' },
      village: { roster: Object.keys(people), trust: {}, health: {}, sick: {},
        winPlan: {}, vbrain: null, away: {}, departFit: null } },
    data: { items: FIT_DEFS },
    dayPart: 1,
    villagerId: '__scholar__',
    says: says,
    exped: exped,
    calls: calls,
    say: function (line) { says.push(String(line)); },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcName: function (vid) {
      const p = people[vid];
      return p && p.name ? String(p.name).split(' ')[0] : 'Someone';
    },
    displayName: function (vid) { return this.npcName(vid); },
    nameKnown: function () { return true; },
    npcMaxDist: function () { return 3; },
    npcRangeProfile: function () { return 'wanderer'; },
    npcNode: function () { return { nx: 5, ny: 5 }; },
    agencyState: function () { return { exped: exped }; },
    isEngaged: function () { return false; },
    vbrainCommit: Game.vbrainCommit,
    // The check is a Game method; the executor calls it on `this`
    // (the game in production, this fixture ctx in the test).
    winPlanDepartFitness: Game.winPlanDepartFitness,
    winPlanOf: function () { return plan; },
    winPlanCommitDeadTarget: function () { return null; },
    winPlanHomebodyHandoff: function () { return 'hold'; },
    winPlanStats: function () { return {}; },
    winPlanDepartLaunchBeat: function () { return true; },
    winPlanReseedLaunchBeat: function () { return false; },
    villagerGearUp: function (vid) {
      calls.gearUp.push(vid);
      if (o.gearUpArms) {
        const p = people[vid];
        if (p && !p.items.some(function (e) { return (e.itemId || e.id) === 'spear'; })) {
          p.items.push({ itemId: 'spear', units: 1 });
          p._weaponB = 12;
          p.equipped.melee = { itemId: 'spear' };
        }
      }
    },
    villagerStageBow: function (vid) { calls.stageBow.push(vid); },
    villagerPocketAmmo: function (vid) {
      calls.pocketAmmo.push(vid);
      if (o.pocketLoads) {
        const p = people[vid];
        if (!p) return { pocketed: 0, ammoId: 'arrow' };
        p.items.push({ itemId: 'arrow', units: 5 });
        return { pocketed: 5, ammoId: 'arrow' };
      }
      return { pocketed: 0, ammoId: 'arrow' };
    },
    startExpedition: function (vid) { exped[vid] = { tx: 6, ty: 5 }; },
    stashState: function () { return { weapons: [], materials: {} }; },
  };
  ctx.state.village.health[holder] = (o.hp != null ? o.hp : 100);
  ctx.state.village.winPlan[holder] = plan;
  ctx.state.village.vbrain = { commit: {}, perception: {}, logs: [],
    stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  ctx.state.village.vbrain.commit[holder] = commit;
  return { ctx: ctx, holder: holder, says: says, exped: exped, calls: calls, people: people, plan: plan };
}

// T6: dry carrier loads via the check's pocket attempt and passes.
check('T6 check loads a dry carrier and passes', function () {
  const fx = fitCtx({ pocketLoads: true });
  const res = Game.winPlanDepartFitness.call(fx.ctx, 'mara_voss', ['mara_voss', 'desmond_okafor']);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.fails.length, 0);
  assert.strictEqual(res.loaded, 1);
  assert.strictEqual(res.checked, 2);
  assert.deepStrictEqual(fx.calls.pocketAmmo, ['mara_voss']);
  assert.strictEqual(fx.ctx.state.village.departFit.checked, 1);
  assert.strictEqual(fx.ctx.state.village.departFit.loadedByCheck, 1);
  assert.strictEqual(fx.ctx.state.village.departFit.heldNoAmmo || 0, 0);
});

// T7: no ammo anywhere — the load attempt finds nothing, the check fails.
check('T7 check fails no-ammo when nothing loads', function () {
  const fx = fitCtx({ pocketLoads: false });
  const res = Game.winPlanDepartFitness.call(fx.ctx, 'mara_voss', ['mara_voss', 'desmond_okafor']);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.fails.length, 1);
  assert.strictEqual(res.fails[0].vid, 'mara_voss');
  assert.strictEqual(res.fails[0].reason, 'no-ammo');
  assert.strictEqual(res.fails[0].ammo, 'arrow');
  assert.strictEqual(res.holdKind, 'no-ammo');
  assert.strictEqual(fx.ctx.state.village.departFit.heldNoAmmo, 1);
});

// T8: a spear in the ranged slot is not a volley carrier — no ammo
// needed, no pocket attempt, passes.
check('T8 spear carrier needs no ammo', function () {
  const fx = fitCtx({ pocketLoads: false, spearRanged: true });
  const res = Game.winPlanDepartFitness.call(fx.ctx, 'mara_voss', ['mara_voss', 'desmond_okafor']);
  assert.strictEqual(res.ok, true);
  assert.deepStrictEqual(fx.calls.pocketAmmo, []);
});

// T9: HP never gates — a 10 HP carrier with a loaded bow passes, and
// a 10 HP dry carrier that loads passes too.
check('T9 HP never gates the check', function () {
  const fx1 = fitCtx({ pocketLoads: false, maraLoaded: true, maraHp: 10 });
  const r1 = Game.winPlanDepartFitness.call(fx1.ctx, 'mara_voss', ['mara_voss', 'desmond_okafor']);
  assert.strictEqual(r1.ok, true);
  const fx2 = fitCtx({ pocketLoads: true, maraHp: 10 });
  const r2 = Game.winPlanDepartFitness.call(fx2.ctx, 'mara_voss', ['mara_voss', 'desmond_okafor']);
  assert.strictEqual(r2.ok, true);
  assert.strictEqual(r2.loaded, 1);
});

// T10: unarmed member gears up; still unarmed fails as 'unarmed' with
// holdKind 'kit' — and a gear-up that arms passes.
check('T10 unarmed fails kit, gear-up that arms passes', function () {
  const fx = fitCtx({ pocketLoads: false, gearUpArms: false });
  const res = Game.winPlanDepartFitness.call(fx.ctx, 'mara_voss', ['bare_bones', 'desmond_okafor']);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.fails[0].reason, 'unarmed');
  assert.strictEqual(res.holdKind, 'kit');
  assert.deepStrictEqual(fx.calls.gearUp, ['bare_bones']);
  assert.strictEqual(fx.ctx.state.village.departFit.heldUnarmed, 1);
  const fx2 = fitCtx({ pocketLoads: false, gearUpArms: true });
  const res2 = Game.winPlanDepartFitness.call(fx2.ctx, 'mara_voss', ['bare_bones', 'desmond_okafor']);
  assert.strictEqual(res2.ok, true);
});

// T11: the player manages their own kit — read-only, never loaded,
// never failed.
check('T11 player holder is read-only', function () {
  const fx = fitCtx({ pocketLoads: false });
  const res = Game.winPlanDepartFitness.call(fx.ctx, '__scholar__', ['__scholar__']);
  assert.strictEqual(res.ok, true);
  assert.deepStrictEqual(fx.calls.pocketAmmo, []);
  assert.deepStrictEqual(fx.calls.gearUp, []);
});

// T12: at most one pocketAmmo call per member per departure.
check('T12 one pocket attempt per member at most', function () {
  const fx = fitCtx({ pocketLoads: true });
  Game.winPlanDepartFitness.call(fx.ctx, 'mara_voss', ['mara_voss', 'mara_voss', 'desmond_okafor']);
  assert.deepStrictEqual(fx.calls.pocketAmmo, ['mara_voss']);
});

// T13: full depart path — dry bow, nothing to load: 'hold', nobody
// walks out, one voiced line ending with the holdspeak closer.
check('T13 full depart holds dry with a voiced line', function () {
  const fx = fitCtx({ pocketLoads: false });
  seedRng(42);
  const ret = Game.vbrainExecuteDepart.call(fx.ctx, 'mara_voss', 5, 5, false);
  assert.strictEqual(ret, 'hold');
  assert.deepStrictEqual(Object.keys(fx.exped), []);
  assert.strictEqual(fx.says.length, 1);
  assert.ok(HOLD_BEAT_RE.test(fx.says[0]), fx.says[0]);
  assert.ok(/quiver/.test(fx.says[0]), fx.says[0]);
  assert.ok(/^Mara/.test(fx.says[0]), fx.says[0]);
});

// T14: full depart path — the load succeeds: 'launch', holder and
// companion walk out, no hold line.
check('T14 full depart launches when loaded', function () {
  const fx = fitCtx({ pocketLoads: true });
  seedRng(42);
  const ret = Game.vbrainExecuteDepart.call(fx.ctx, 'mara_voss', 5, 5, false);
  assert.strictEqual(ret, 'launch');
  assert.ok(fx.exped.mara_voss, 'holder out');
  assert.ok(fx.exped.desmond_okafor, 'companion out');
  assert.strictEqual(fx.says.filter(function (l) { return HOLD_BEAT_RE.test(l); }).length, 0);
});

console.log(pass + '/' + (pass + fail) + ' PASS');
if (fail) process.exit(1);
