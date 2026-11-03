// test-vetbar-20261103.js — proof test for the veterans-bar autopsy
// instrument + analyzer (arm sim-vetbar-a). Fixture-based (analyzer
// classes, gate-mismatch detection, log reconciliation) plus one live
// harness smoke: a wave-4 kill recorded through the real recordWaveKill
// appears in the instrument rows and in waveCombatReadiness(5).
// Usage: node scripts/test-vetbar-20261103.js
'use strict';
const path = require('path');
const assert = require('assert');
const { classifySeed } = require(path.join(__dirname, 'vetbar-analyze-20261103'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function fixture(over) {
  const base = {
    seed: 1, run: 'fixture', days: 100, endReason: 'village-lost', won: false,
    maxWave: 4, standing: 150, killRows: [], daily: [], deathDays: {}, instrumentErrors: [],
  };
  return Object.assign(base, over);
}
function snap(day, opts) {
  opts = opts || {};
  return {
    day: day, scholarId: opts.scholarId || 'v_scholar', roster: opts.roster || [],
    logW4: opts.logW4 || [], readiness5: opts.readiness5 || { ready: false, veterans: 0 },
    readiness4: {}, killers: opts.killers || {}, gateSet: opts.gateSet || [], gateCount: (opts.gateSet || []).length,
  };
}

// 1. counted: living killer inside gate set.
ok('counted killer', function () {
  const s = classifySeed(fixture({
    killRows: [{ day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_a', via: 'wild', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: true }],
    daily: [snap(100, { logW4: [{ d: 50, mid: 'm4', w: 4, by: 'v_a', via: 'wild' }], readiness5: { ready: false, veterans: 1 }, killers: { v_a: { aliveRecount: true } }, gateSet: ['v_a'] })],
  }));
  assert.strictEqual(s.perKiller[0].class, 'counted');
  assert.strictEqual(s.livingKillers, 1);
  assert.strictEqual(s.logReconciled, true);
});
// 2. died-later: killer alive at kill, dead by end, death well after kill.
ok('died-later killer', function () {
  const s = classifySeed(fixture({
    killRows: [{ day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_b', via: 'patrol', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: true }],
    deathDays: { v_b: 80 },
    daily: [snap(100, { logW4: [{ d: 50, mid: 'm4', w: 4, by: 'v_b', via: 'patrol' }], readiness5: { ready: false, veterans: 0 }, killers: { v_b: { aliveRecount: false } }, gateSet: [] })],
  }));
  assert.strictEqual(s.perKiller[0].class, 'died-later');
  assert.strictEqual(s.perKiller[0].deathDay, 80);
});
// 3. died-same-fight: death observed within 1 day of kill.
ok('died-same-fight killer', function () {
  const s = classifySeed(fixture({
    killRows: [{ day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_c', via: 'wild', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: true }],
    deathDays: { v_c: 51 },
    daily: [snap(100, { logW4: [{ d: 50, mid: 'm4', w: 4, by: 'v_c', via: 'wild' }], readiness5: { ready: false, veterans: 0 }, killers: { v_c: { aliveRecount: false } }, gateSet: [] })],
  }));
  assert.strictEqual(s.perKiller[0].class, 'died-same-fight');
});
// 4. pyrrhic: all kills pyrrhic, killer dead.
ok('pyrrhic killer', function () {
  const s = classifySeed(fixture({
    killRows: [{ day: 50, fn: 'recordPyrrhicKill', pyrrhic: true, mid: 'm4', wave: 4, by: 'v_d', via: 'player', scholarAtKill: 'v_d', wasScholar: true, entryAdded: true }],
    deathDays: { v_d: 50 },
    daily: [snap(100, { scholarId: 'v_next', logW4: [{ d: 50, mid: 'm4', w: 4, by: 'v_d', via: 'player' }], readiness5: { ready: false, veterans: 0 }, killers: { v_d: { aliveRecount: false } }, gateSet: [] })],
  }));
  assert.strictEqual(s.perKiller[0].class, 'pyrrhic');
  assert.strictEqual(s.perKiller[0].scholarSuccession, true);
});
// 5. unattributed: null by.
ok('unattributed kill', function () {
  const s = classifySeed(fixture({
    killRows: [{ day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: null, via: 'unknown', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: true }],
    daily: [snap(100, { logW4: [{ d: 50, mid: 'm4', w: 4, by: null, via: 'unknown' }], readiness5: { ready: false, veterans: 1 }, killers: {}, gateSet: [] })],
  }));
  assert.strictEqual(s.perKiller[0].class, 'unattributed');
});
// 6. gate mismatch flagged on a daily snapshot.
ok('gate mismatch flagged', function () {
  const s = classifySeed(fixture({
    killRows: [{ day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_e', via: 'wild', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: true }],
    daily: [snap(100, { logW4: [{ d: 50, mid: 'm4', w: 4, by: 'v_e', via: 'wild' }], readiness5: { ready: false, veterans: 0 }, killers: { v_e: { aliveRecount: true } }, gateSet: ['v_e'] })],
  }));
  assert.strictEqual(s.gateMismatchDays.length, 1);
  assert.strictEqual(s.gateMismatchDays[0].gateCount, 1);
  assert.strictEqual(s.gateMismatchDays[0].readiness, 0);
});
// 7. dedupe drop: row without entry breaks reconciliation accounting but is counted as dropped.
ok('dedupe drop counted', function () {
  const s = classifySeed(fixture({
    killRows: [
      { day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_f', via: 'wild', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: true },
      { day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_f', via: 'wild', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: false },
    ],
    daily: [snap(100, { logW4: [{ d: 50, mid: 'm4', w: 4, by: 'v_f', via: 'wild' }], readiness5: { ready: false, veterans: 1 }, killers: { v_f: { aliveRecount: true } }, gateSet: ['v_f'] })],
  }));
  assert.strictEqual(s.droppedRows, 1);
  assert.strictEqual(s.logReconciled, true);
  assert.strictEqual(s.perKiller[0].droppedRows, 1);
});
// 8. alive-but-uncounted: alive at end, outside gate set.
ok('alive-but-uncounted killer', function () {
  const s = classifySeed(fixture({
    killRows: [{ day: 50, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_g', via: 'wild', scholarAtKill: 'v_scholar', wasScholar: false, entryAdded: true }],
    daily: [snap(100, { logW4: [{ d: 50, mid: 'm4', w: 4, by: 'v_g', via: 'wild' }], readiness5: { ready: false, veterans: 0 }, killers: { v_g: { aliveRecount: true } }, gateSet: [] })],
  }));
  assert.strictEqual(s.perKiller[0].class, 'alive-but-uncounted');
});

// 9. Census instrument wiring on a stub Game (no harness needed).
ok('census instrument rows', function () {
  const CENS = require(path.join(__dirname, 'vetbar-census-instrument-20261103'));
  const stub = {
    state: { scholar: { day: 5, monster: null }, village: { roster: [] }, waveKillLog: [] },
    data: { monsters: [{ id: 'm4', wave: 4 }, { id: 'm3', wave: 3 }], villagers: [] },
    villagerId: 'v_scholar', pendingMonsterId: null, pendingEncounter: false,
    spawnWorldMonster: function () { return { id: 'm4', wave: 4 }; },
    startCombat: function () { return null; },
    tbEnd: function () { return null; },
    fieldFight: function () { return { outcome: 'vKill' }; },
    recordWaveKill: function () { return null; },
  };
  const inst = CENS.install(stub);
  stub.spawnWorldMonster({ id: 'm4' }, 1, 2, {});
  stub.pendingMonsterId = 'm4'; stub.pendingEncounter = true;
  stub.startCombat('m4');
  stub.tbfight = { fighters: [{ kind: 'monster', mdef: { id: 'm4' }, alive: false, hp: 0 }] };
  stub.tbEnd('won');
  stub.fieldFight('v_x', { id: 'm4' }, { id: 'm4' }, {});
  stub.recordWaveKill('m4', 'v_x', 'wild', null);
  assert.strictEqual(inst.t.spawns.length, 1);
  assert.strictEqual(inst.t.starts.length, 1);
  assert.strictEqual(inst.t.tbEnds.length, 1);
  assert.strictEqual(inst.t.tbEnds[0].result, 'won');
  assert.strictEqual(inst.t.fields.length, 1);
  assert.strictEqual(inst.t.fields[0].outcome, 'vKill');
  assert.strictEqual(inst.t.killRows.length, 1);
  assert.strictEqual(inst.t.instrumentErrors.length, 0);
  inst.uninstall();
});

// 10. Live harness smoke: real recordWaveKill + real readiness.
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const INST = require(path.join(__dirname, 'vetbar-instrument-20261103'));
  const { Game } = await loadGame({ seed: 99101, mode: 'vetbar-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    assert.ok(vid, 'a roster villager must exist');
    const before = (Game.state.waveKillLog || []).length;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    const rows = inst.t.killRows.filter(function (r) { return r.mid === m4.id; });
    assert.strictEqual(rows.length, 1, 'instrument captures the kill');
    assert.strictEqual(rows[0].wave, 4);
    assert.strictEqual((Game.state.waveKillLog || []).length, before + 1, 'log gains one entry');
    const snapNow = inst.snapshot();
    assert.ok((snapNow.gateSet || []).indexOf(vid) >= 0, 'killer in replicated gate set');
    const r5 = Game.waveCombatReadiness(5);
    assert.strictEqual(r5.veterans, snapNow.gateCount, 'gate count matches replication on smoke');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: kill -> gate');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('VETBAR-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('VETBAR-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
