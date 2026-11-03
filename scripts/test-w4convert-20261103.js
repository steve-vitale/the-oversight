// test-w4convert-20261103.js — proof test for the wave-4
// kill-conversion split instrument + analyzer (arm sim-w4convert-a).
// Fixture classification, gear buckets, reconciliation logic, and a
// stub-Game known-fight test (wrap fires, identity at start, exact
// kill linkage, unlinked kill reported not force-joined), plus a live
// harness smoke. Usage: node scripts/test-w4convert-20261103.js
'use strict';
const path = require('path');
const assert = require('assert');
const A = require(path.join(__dirname, 'w4convert-analyze-20261103'));
const INST = require(path.join(__dirname, 'w4convert-instrument-20261103'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
function ex(over) {
  return Object.assign({
    seq: 1, type: 'tb', day: 10, mid: 'm4', wave: 4, leadVid: 'v_s',
    partySizeStart: 1, leadGear: { armorP: 0, armed: false, weapon: null },
    end: null, kills: [], superseded: false,
  }, over);
}
function row(over) {
  return Object.assign({
    day: 10, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4,
    by: 'v_s', via: 'player', entryAdded: true, linkSeq: 1, linkHow: 'tb-open',
    killerDeadAtRecord: false,
  }, over);
}

// 1-2. TB classes: kill and died/fled/routed.
ok('tb kill / died / fled / routed classes', function () {
  assert.strictEqual(A.classifyExposure(ex({ end: { result: 'won', monsters: [], humans: [] }, kills: [row({})] })), 'kill');
  assert.strictEqual(A.classifyExposure(ex({ end: { result: 'lost', monsters: [], humans: [] }, kills: [] })), 'died');
  assert.strictEqual(A.classifyExposure(ex({ end: { result: 'fled', monsters: [], humans: [] }, kills: [] })), 'fled');
  assert.strictEqual(A.classifyExposure(ex({ end: { result: 'routed', monsters: [], humans: [] }, kills: [] })), 'routed');
  assert.strictEqual(A.classifyExposure(ex({ end: { result: 'calmed', monsters: [], humans: [] }, kills: [] })), 'tb-other:calmed');
  assert.strictEqual(A.classifyExposure(ex({ end: null, kills: [] })), 'tb-unended');
  assert.strictEqual(A.classifyExposure(ex({ end: { result: 'lost', monsters: [], humans: [] }, kills: [row({ pyrrhic: true, fn: 'recordPyrrhicKill' })] })), 'kill-pyrrhic');
});
// 3. Field classes incl. kill-unlinked and unresolved.
ok('field outcome classes', function () {
  const f = function (o, kills) { return ex({ type: 'field', end: { outcome: o, day: 10 }, kills: kills || [] }); };
  assert.strictEqual(A.classifyExposure(f('vKill', [row({ via: 'wild' })])), 'kill');
  assert.strictEqual(A.classifyExposure(f('vKill', [])), 'kill-unlinked');
  assert.strictEqual(A.classifyExposure(f('vDie')), 'died');
  assert.strictEqual(A.classifyExposure(f('vFlee')), 'fled');
  assert.strictEqual(A.classifyExposure(f('mFlee')), 'monster-fled');
  assert.strictEqual(A.classifyExposure(f('evade')), 'evaded');
  assert.strictEqual(A.classifyExposure(f('alreadyDead')), 'already-dead');
  assert.strictEqual(A.classifyExposure(f(null)), 'field-unresolved');
  assert.strictEqual(A.classifyExposure(f('bogus')), 'field-unresolved');
  assert.strictEqual(A.classifyExposure({}), 'UNCLASSIFIED');
});
// 4. Gear buckets incl. readiness-geared boundary.
ok('gear buckets', function () {
  assert.deepStrictEqual(A.gearBuckets({ armorP: 0, armed: false }), { armed: 'unarmed', armored: 'unarmored', readyGeared: 'not-ready-geared', armorP: 0 });
  assert.deepStrictEqual(A.gearBuckets({ armorP: 5, armed: true }), { armed: 'armed', armored: 'armored', readyGeared: 'not-ready-geared', armorP: 5 });
  assert.deepStrictEqual(A.gearBuckets({ armorP: 15, armed: true }), { armed: 'armed', armored: 'armored', readyGeared: 'ready-geared', armorP: 15 });
  assert.deepStrictEqual(A.gearBuckets({ armorP: 20, armed: false }), { armed: 'unarmed', armored: 'armored', readyGeared: 'not-ready-geared', armorP: 20 });
  assert.deepStrictEqual(A.gearBuckets(null), { armed: 'unarmed', armored: 'unarmored', readyGeared: 'not-ready-geared', armorP: 0 });
});
// 5. Split table math + dropped rows excluded.
ok('split table and dropped rows', function () {
  const list = [
    ex({ seq: 1, partySizeStart: 1, kills: [row({})] }),
    ex({ seq: 2, partySizeStart: 2, end: { result: 'fled' }, kills: [] }),
    ex({ seq: 3, partySizeStart: 1, end: { result: 'won' }, kills: [row({ entryAdded: false })] }),
  ];
  list[0].end = { result: 'won' };
  const byParty = A.splitTable(list, function (e) { return e.partySizeStart >= 2 ? '+ally' : 'solo'; });
  assert.strictEqual(byParty.solo.exposures, 2);
  assert.strictEqual(byParty.solo.kills, 1);
  assert.strictEqual(byParty.solo.killingExposures, 1);
  assert.strictEqual(byParty['+ally'].exposures, 1);
  assert.strictEqual(byParty['+ally'].kills, 0);
  assert.strictEqual(A.classifyExposure(list[2]), 'tb-other:won'); // dropped row: no effective kill, end won
});
// 6. Killer survival classes.
ok('killer survival classes', function () {
  const seed = function (over) {
    return Object.assign({
      seed: 1, killRows: [], daily: [], deathDays: {}, deathEvents: [],
    }, over);
  };
  const snap = function (day, killers) { return { day: day, killers: killers }; };
  // at-fight-end death
  let k = A.classifyKiller(seed({
    killRows: [row({ day: 50, killerDeadAtRecord: true })], deathDays: { v_s: 50 },
    daily: [snap(100, { v_s: { aliveRecount: false } })], deathEvents: [{ who: 'v_s', cause: 'monster' }],
  }), 'v_s');
  assert.strictEqual(k.class, 'same-fight'); assert.strictEqual(k.sub, 'at-fight-end');
  assert.strictEqual(k.cause, 'monster'); assert.strictEqual(k.participation, 'UNRECORDED');
  // same-day-later death
  k = A.classifyKiller(seed({
    killRows: [row({ day: 50, killerDeadAtRecord: false })], deathDays: { v_s: 50 },
    daily: [snap(100, { v_s: { aliveRecount: false } })],
  }), 'v_s');
  assert.strictEqual(k.class, 'same-fight'); assert.strictEqual(k.sub, 'same-day-later');
  // later death with UNRECORDED cause
  k = A.classifyKiller(seed({
    killRows: [row({ day: 50 })], deathDays: { v_s: 80 },
    daily: [snap(100, { v_s: { aliveRecount: false } })], deathEvents: [],
  }), 'v_s');
  assert.strictEqual(k.class, 'later'); assert.strictEqual(k.daysKillToDeath, 30);
  assert.strictEqual(k.cause, 'UNRECORDED');
  // alive
  k = A.classifyKiller(seed({
    killRows: [row({ day: 50 })], deathDays: {},
    daily: [snap(100, { v_s: { aliveRecount: true } })],
  }), 'v_s');
  assert.strictEqual(k.class, 'alive'); assert.strictEqual(k.daysKillToDeath, null);
});
// 7. Reconciliation constants match the vetbar census.
ok('census constants', function () {
  assert.deepStrictEqual(A.CENSUS, { spawns: 71, tbStarts: 37, fields: 33, kills: 5 });
});

// 8. Stub-Game known-fight test: wraps fire, identity at start,
// exact linkage, unlinked kill reported not force-joined.
ok('stub known fights: fire counts, start identity, exact linkage', function () {
  const stub = {
    state: { scholar: { day: 5, monster: null }, village: { roster: ['v_s', 'v_x'] }, waveKillLog: [] },
    data: { monsters: [{ id: 'm4', wave: 4 }], items: [], villagers: [{ id: 'v_x' }] },
    villagerId: 'v_s', pendingMonsterId: null, tbfight: null,
    armorBonus: function () { return 20; },
    equippedWeapon: function () { return { unarmed: false, name: 'Spear' }; },
    vpOf: function (vid) { return vid === 'v_x' ? { id: 'v_x', dead: false, items: [] } : {}; },
    spawnWorldMonster: function () { return { id: 'm4', wave: 4 }; },
    startCombat: function () {
      this.tbfight = { id: 'f1', fighters: [
        { key: 'p', kind: 'villager', villagerId: 'v_s', alive: true, hp: 80 },
        { key: 'm_0', kind: 'monster', mdef: { id: 'm4' }, alive: true, hp: 100 },
      ] };
      return null;
    },
    tbEnd: function () {
      this.recordWaveKill('m4', 'v_s', 'player', null);
      this.tbfight = null; return null;
    },
    fieldFight: function () { return { outcome: 'vKill', rounds: 3, partySize: 1, vTaken: 10, mDealt: 100, vHpLeft: 90, mHpLeft: 0, intent: 'engage' }; },
    recordWaveKill: function (mid, by) { this.state.waveKillLog.push({ d: 5, mid: mid, w: 4, by: by, via: 'player' }); return null; },
    recordPyrrhicKill: function () { return null; },
    tele: function () { return null; },
    waveCombatReadiness: function () { return { ready: false, veterans: 0 }; },
  };
  const inst = INST.install(stub);
  const t = inst.t;
  stub.spawnWorldMonster({ id: 'm4' }, 1, 2, {});
  stub.startCombat('m4');
  assert.strictEqual(t.exposures.length, 1, 'TB exposure created at start');
  assert.strictEqual(t.exposures[0].type, 'tb');
  assert.strictEqual(t.exposures[0].partySizeStart, 1);
  assert.strictEqual(t.exposures[0].leadGear.armorP, 20, 'scholar armorP read');
  assert.strictEqual(t.exposures[0].leadGear.armed, true);
  assert.strictEqual(t.wrapCounts.startCombat, 1);
  stub.tbEnd('won');
  assert.strictEqual(t.exposures[0].end.result, 'won');
  assert.strictEqual(t.exposures[0].kills.length, 1, 'TB kill linked by open fight');
  assert.strictEqual(t.exposures[0].kills[0].linkHow, 'tb-open');
  assert.strictEqual(A.classifyExposure(t.exposures[0]), 'kill');
  // Field fight: identity at start, kill recorded by caller AFTER return.
  stub.fieldFight('v_x', { id: 'm4' }, { id: 'm4' }, {});
  assert.strictEqual(t.exposures.length, 2, 'field exposure created at start');
  assert.strictEqual(t.exposures[1].type, 'field');
  assert.strictEqual(t.exposures[1].end.outcome, 'vKill');
  stub.recordWaveKill('m4', 'v_x', 'wild', null);
  assert.strictEqual(t.exposures[1].kills.length, 1, 'field kill linked via latch');
  assert.strictEqual(t.exposures[1].kills[0].linkHow, 'field-latch');
  // A kill with no open fight and no latch is unlinked, never force-joined.
  stub.recordWaveKill('m4', 'v_x', 'contest', null);
  assert.strictEqual(t.unlinkedKills.length, 1, 'stray kill reported unlinked');
  assert.strictEqual(t.killRows.length, 3);
  assert.strictEqual(t.instrumentErrors.length, 0);
  assert.ok(t.wrapCounts.fieldFight >= 1 && t.wrapCounts.recordWaveKill === 3, 'fire counts prove wraps fired');
  inst.uninstall();
  assert.strictEqual(typeof stub.startCombat, 'function');
});

// 9. Live harness smoke: unlinked kill + snapshot, no harness break.
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'w4convert-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killRows.length, 1, 'live kill row captured');
    assert.strictEqual(inst.t.unlinkedKills.length, 1, 'no-fight kill is unlinked, not force-joined');
    assert.strictEqual(inst.t.wrapCounts.recordWaveKill, 1, 'kill wrap fired on live harness');
    const snap = inst.snapshot();
    assert.ok(snap.killers[vid], 'snapshot tracks the killer');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: kill row + unlinked + snapshot');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('W4CONVERT-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('W4CONVERT-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
