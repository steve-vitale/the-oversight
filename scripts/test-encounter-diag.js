#!/usr/bin/env node
// scripts/test-encounter-diag.js — proof test for scripts/policies/
// encounter-diag.js (sim-encounter-a). Synthetic classification cases
// plus wrap purity on mock Games. No repo state touched, no Game loaded.
'use strict';
const assert = require('assert');
const {
  layerOn, newStore, installEncounterDiag, withEncounterDiag,
  classifyEncounters,
} = require('./policies/encounter-diag');

let pass = 0;
function check(name, fn) { fn(); pass++; console.log('  ok: ' + name); }

// waveOf for synthetic monsters: ids carry their wave in the name.
function waveOf(mid) {
  if (!mid) return 1;
  const m = /^w([345])_/.exec(mid);
  return m ? (m[1] | 0) : 1;
}
function cls(o) { return classifyEncounters(Object.assign({ waveOf }, o)); }

check('NEVER-FACED: empty everything', () => {
  const c = cls({ spawns: [], fieldFights: [], tbFights: [], faced: {}, killEntries: [] });
  assert.strictEqual(c.label, 'NEVER-FACED');
  assert.strictEqual(c.counts.spawnsW3, 0);
});
check('FACED-UNFOUGHT: spawn, no fight', () => {
  const c = cls({ spawns: [{ day: 40, mid: 'w3_spool', wave: 3 }], fieldFights: [], tbFights: [], faced: {}, killEntries: [] });
  assert.strictEqual(c.label, 'FACED-UNFOUGHT');
  assert.deepStrictEqual(c.unfoughtSpawnTypes, ['w3_spool']);
  assert.strictEqual(c.spawnFirstDayW3, 40);
});
check('FACED-LOST: tb lost outranks fled', () => {
  const c = cls({
    spawns: [{ day: 40, mid: 'w3_spool', wave: 3 }],
    fieldFights: [{ day: 41, vid: 'v1', mid: 'w3_spool', wave: 3, outcome: 'vFlee' }],
    tbFights: [{ day: 42, result: 'lost', monsterIds: ['w3_spool'], villagerIds: [], scholarIn: true }],
    faced: { w3_spool: 3 }, killEntries: [],
  });
  assert.strictEqual(c.label, 'FACED-LOST');
  assert.strictEqual(c.outcomeCounts.tbLost, 1);
  assert.strictEqual(c.counts.tbPlayerOnly, 1);
});
check('FACED-FLED: villager vFlee only', () => {
  const c = cls({
    spawns: [], fieldFights: [{ day: 50, vid: 'v1', mid: 'w3_chorus', wave: 3, outcome: 'vFlee' }],
    tbFights: [], faced: { w3_chorus: 3 }, killEntries: [],
  });
  assert.strictEqual(c.label, 'FACED-FLED');
});
check('FACED-DROVE-OFF: tb won with no kill', () => {
  const c = cls({
    spawns: [], fieldFights: [{ day: 50, vid: 'v1', mid: 'w3_spool', wave: 3, outcome: 'mFlee' }],
    tbFights: [], faced: { w3_spool: 3 }, killEntries: [],
  });
  assert.strictEqual(c.label, 'FACED-DROVE-OFF');
  assert.strictEqual(c.outcomeCounts.fieldMFlee, 1);
});
check('FACED-KILLED: kill present', () => {
  const c = cls({
    spawns: [], fieldFights: [{ day: 50, vid: 'v1', mid: 'w3_spool', wave: 3, outcome: 'vKill' }],
    tbFights: [], faced: { w3_spool: 3 }, killEntries: [{ d: 50, mid: 'w3_spool', w: 3, by: 'v1', via: 'player' }],
  });
  assert.strictEqual(c.label, 'FACED-KILLED');
  assert.strictEqual(c.counts.killsW3, 1);
});
check('UNCLASSIFIED: deed feed fight, no rows at all', () => {
  const c = cls({ spawns: [], fieldFights: [], tbFights: [], faced: { w3_spool: 3 }, killEntries: [] });
  assert.strictEqual(c.label, 'UNCLASSIFIED');
});
check('UNCLASSIFIED: fight row with no outcome', () => {
  const c = cls({
    spawns: [], fieldFights: [{ day: 50, vid: 'v1', mid: 'w3_spool', wave: 3, outcome: null }],
    tbFights: [], faced: { w3_spool: 3 }, killEntries: [],
  });
  assert.strictEqual(c.label, 'UNCLASSIFIED');
});
check('participant split: tb with villager vs player-only vs scholar-absent', () => {
  const c = cls({
    spawns: [],
    fieldFights: [{ day: 50, vid: 'v1', mid: 'w3_spool', wave: 3, outcome: 'vFlee', allyVid: 'v2', calledHelp: true }],
    tbFights: [
      { day: 51, result: 'fled', monsterIds: ['w3_spool'], villagerIds: ['v9'], scholarIn: true },
      { day: 52, result: 'fled', monsterIds: ['w3_spool'], villagerIds: [], scholarIn: true },
      { day: 53, result: 'fled', monsterIds: ['w3_spool'], villagerIds: [], scholarIn: false },
    ],
    faced: { w3_spool: 3 }, killEntries: [],
  });
  assert.strictEqual(c.counts.tbWithVillager, 1);
  assert.strictEqual(c.counts.tbPlayerOnly, 1);
  assert.strictEqual(c.counts.tbScholarAbsent, 1);
  assert.strictEqual(c.counts.fieldWithAlly, 1);
  assert.strictEqual(c.label, 'FACED-FLED');
});
check('by-wave counts separate w3 from w4', () => {
  const c = cls({
    spawns: [{ day: 40, mid: 'w3_spool', wave: 3 }, { day: 90, mid: 'w4_audit', wave: 4 }],
    fieldFights: [], tbFights: [], faced: {}, killEntries: [],
  });
  assert.strictEqual(c.byWave[3].spawns, 1);
  assert.strictEqual(c.byWave[4].spawns, 1);
});
check('wrap purity: delegate returns + records, engine state untouched', () => {
  const engineState = { calls: 0 };
  const mock = {
    state: { scholar: { day: 42 } },
    spawnWorldMonster: function (mdef) { engineState.calls++; return { id: mdef.id, wave: 3, tx: 1, ty: 2, veteran: false }; },
    fieldFight: function () { engineState.calls++; return { outcome: 'vFlee', rounds: 3, vHpLeft: 40, mHpLeft: 200, allyVid: null, calledHelp: false, intent: 'learn' }; },
    tbfight: { over: false, fighters: [{ kind: 'player' }, { kind: 'monster', monsterId: 'w3_spool' }], result: null },
    // The real engine ends tbEnd with `this.tbfight = null` — the wrap
    // must read the captured fight object, not Game.tbfight afterwards.
    tbEnd: function (result) { engineState.calls++; this.tbfight.over = true; this.tbfight.result = result; this.tbfight = null; return 'ended'; },
  };
  const store = newStore();
  const uninstall = installEncounterDiag(mock, store);
  assert.strictEqual(mock.spawnWorldMonster({ id: 'w3_spool' }).id, 'w3_spool');
  assert.strictEqual(mock.fieldFight('v1', { id: 'w3_spool', wave: 3 }, null, {}).outcome, 'vFlee');
  assert.strictEqual(mock.tbEnd('fled'), 'ended');
  assert.strictEqual(store.spawns.length, 1);
  assert.strictEqual(store.fieldFights.length, 1);
  assert.strictEqual(store.tbFights.length, 1);
  assert.strictEqual(store.tbFights[0].result, 'fled');
  assert.strictEqual(engineState.calls, 3);
  uninstall();
  assert.strictEqual(mock._encounterDiagInstalled, false);
  assert.strictEqual(store.errs, 0);
});
check('wrap purity: already-over tbEnd records nothing', () => {
  const mock = {
    state: { scholar: { day: 5 } },
    tbfight: { over: true, result: 'won', fighters: [] },
    tbEnd: function () { return 'noop'; },
  };
  const store = newStore();
  installEncounterDiag(mock, store);
  mock.tbEnd('won');
  assert.strictEqual(store.tbFights.length, 0);
});
check('layer gate: ENCOUNTER unset delegates without install', () => {
  delete process.env.ENCOUNTER;
  assert.strictEqual(layerOn(), false);
  const inner = { id: 'x', daily: function () { return 'inner'; } };
  const wrapped = withEncounterDiag(inner, 'enc', 'test');
  const ctx = {};
  const mock = { state: { scholar: { day: 1 } } };
  assert.strictEqual(wrapped.daily(mock, ctx), 'inner');
  assert.strictEqual(ctx._encounterdiag, undefined);
  assert.strictEqual(mock._encounterDiagInstalled, undefined);
});
check('layer gate: ENCOUNTER=1 records daily + installs', () => {
  process.env.ENCOUNTER = '1';
  const store = newStore();
  const inner = { id: 'x', daily: function () { return 'inner'; } };
  const wrapped = withEncounterDiag(inner, 'enc', 'test', store);
  const mock = {
    state: { scholar: { day: 30 }, waveKillLog: [] },
    deedState: function () { return { wavesFaced: {} }; },
    waveLedgerPoints: function () { return 0; },
    waveLedgerCfg: function () { return { barsPerWave: { 2: 4 }, dayFloor: 25 }; },
    worldMonsters: function () { return []; },
    wanderer: null, pendingEncounter: false, pendingMonsterId: null,
  };
  const ctx2 = {};
  assert.strictEqual(wrapped.daily(mock, ctx2), 'inner');
  assert.strictEqual(store.daily.length, 1);
  assert.strictEqual(store.daily[0].ledger.w3gate, false);
  delete process.env.ENCOUNTER;
});
console.log(`ENCOUNTER-DIAG PROOF: ${pass} checks passed`);
