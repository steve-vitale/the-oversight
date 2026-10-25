#!/usr/bin/env node
// scripts/test-wave2enc-diag.js — proof test for scripts/policies/
// wave2enc-diag.js (sim-wave2enc-a). Synthetic classification cases
// plus wrap purity on mock Games. No repo state touched, no Game loaded.
'use strict';
const assert = require('assert');
const {
  layerOn, newStore, installWave2EncDiag, withWave2EncDiag,
  classifyWave2,
} = require('./policies/wave2enc-diag');

let pass = 0;
function check(name, fn) { fn(); pass++; console.log('  ok: ' + name); }

function waveOf(mid) {
  if (!mid) return 1;
  const m = /^w([123])_/.exec(mid);
  return m ? (m[1] | 0) : 1;
}
function cls(o) { return classifyWave2(Object.assign({ waveOf, bar2: 4, dayFloor: 25, perTypeCap: 2 }, o)); }

check('GATE-OPEN: pts at bar, day floor passed', () => {
  const c = cls({ spawns: [], fieldFights: [], tbFights: [], faced: { w2_a: 2 }, killEntries: [{ d: 30, mid: 'w2_a', w: 2, by: 'v1', via: 'player' }], endPts2: 4, endDay: 60, perType2: { points: 4, perType: { w2_a: 2, w2_b: 2 } }, daily: [{ day: 30, ledger: { pts2: 4 } }] });
  assert.strictEqual(c.label, 'GATE-OPEN');
  assert.strictEqual(c.firstGateDay, 30);
});
check('KILLED-BELOW-BAR: 1 heckler kill, pts 1/4 (the 73674 shape)', () => {
  const c = cls({ spawns: [{ day: 10, mid: 'heckler', wave: 2 }], fieldFights: [], tbFights: [{ day: 11, result: 'won', monsterIds: ['heckler'], villagerIds: [], scholarIn: true }], faced: { heckler: 2 }, killEntries: [{ d: 11, mid: 'heckler', w: 2, by: 'player', via: 'player' }], endPts2: 1, endDay: 180, perType2: { points: 1, perType: { heckler: 1 } }, daily: [{ day: 11, ledger: { pts2: 1 } }] });
  assert.strictEqual(c.label, 'KILLED-BELOW-BAR');
  assert.deepStrictEqual(c.killsByType, { heckler: 1 });
  assert.deepStrictEqual(c.pointsByType, { heckler: 1 });
});
check('NEVER-SPAWNED: empty everything', () => {
  const c = cls({ spawns: [], fieldFights: [], tbFights: [], faced: {}, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [] });
  assert.strictEqual(c.label, 'NEVER-SPAWNED');
});
check('SPAWNED-UNFOUGHT: spawn, no fight', () => {
  const c = cls({ spawns: [{ day: 40, mid: 'w2_spool', wave: 2 }], fieldFights: [], tbFights: [], faced: {}, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [] });
  assert.strictEqual(c.label, 'SPAWNED-UNFOUGHT');
  assert.deepStrictEqual(c.unfoughtSpawnTypes, ['w2_spool']);
  assert.strictEqual(c.firstSpawnDay, 40);
});
check('FOUGHT-LOST: tb lost outranks fled', () => {
  const c = cls({
    spawns: [{ day: 40, mid: 'w2_a', wave: 2 }],
    fieldFights: [{ day: 41, vid: 'v1', mid: 'w2_a', wave: 2, outcome: 'vFlee' }],
    tbFights: [{ day: 42, result: 'lost', monsterIds: ['w2_a'], villagerIds: [], scholarIn: true }],
    faced: { w2_a: 2 }, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [],
  });
  assert.strictEqual(c.label, 'FOUGHT-LOST');
  assert.strictEqual(c.outcomeCounts.tbLost, 1);
});
check('FOUGHT-FLED: villager vFlee only', () => {
  const c = cls({
    spawns: [], fieldFights: [{ day: 50, vid: 'v1', mid: 'w2_a', wave: 2, outcome: 'vFlee' }],
    tbFights: [], faced: { w2_a: 2 }, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [],
  });
  assert.strictEqual(c.label, 'FOUGHT-FLED');
});
check('FOUGHT-DROVE-OFF: tb won with no kill', () => {
  const c = cls({
    spawns: [], fieldFights: [{ day: 50, vid: 'v1', mid: 'w2_a', wave: 2, outcome: 'mFlee' }],
    tbFights: [], faced: { w2_a: 2 }, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [],
  });
  assert.strictEqual(c.label, 'FOUGHT-DROVE-OFF');
  assert.strictEqual(c.outcomeCounts.fieldMFlee, 1);
});
check('UNCLASSIFIED: deed feed fight, no rows at all', () => {
  const c = cls({ spawns: [], fieldFights: [], tbFights: [], faced: { w2_a: 2 }, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [] });
  assert.strictEqual(c.label, 'UNCLASSIFIED');
});
check('UNCLASSIFIED: fight row with no outcome', () => {
  const c = cls({
    spawns: [], fieldFights: [{ day: 50, vid: 'v1', mid: 'w2_a', wave: 2, outcome: null }],
    tbFights: [], faced: { w2_a: 2 }, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [],
  });
  assert.strictEqual(c.label, 'UNCLASSIFIED');
});
check('participant split: tb with villager vs player-only vs scholar-absent', () => {
  const c = cls({
    spawns: [],
    fieldFights: [{ day: 50, vid: 'v1', mid: 'w2_a', wave: 2, outcome: 'vFlee' }],
    tbFights: [
      { day: 51, result: 'lost', monsterIds: ['w2_a'], villagerIds: ['v2'], scholarIn: true },
      { day: 52, result: 'lost', monsterIds: ['w2_a'], villagerIds: [], scholarIn: true },
      { day: 53, result: 'lost', monsterIds: ['w2_a'], villagerIds: [], scholarIn: false },
    ],
    faced: { w2_a: 2 }, killEntries: [], endPts2: 0, endDay: 180, perType2: { points: 0, perType: {} }, daily: [],
  });
  assert.strictEqual(c.counts.tbWithVillager, 1);
  assert.strictEqual(c.counts.tbPlayerOnly, 1);
  assert.strictEqual(c.counts.tbScholarAbsent, 1);
});
check('trajectory: pts change points only, first gate day', () => {
  const c = cls({
    spawns: [], fieldFights: [], tbFights: [], faced: {}, killEntries: [],
    endPts2: 4, endDay: 60, perType2: { points: 4, perType: {} },
    daily: [
      { day: 10, ledger: { pts2: 0 } }, { day: 11, ledger: { pts2: 0 } },
      { day: 12, ledger: { pts2: 1 } }, { day: 30, ledger: { pts2: 4 } },
    ],
  });
  assert.deepStrictEqual(c.traj.map(t => [t.day, t.pts2]), [[10, 0], [12, 1], [30, 4]]);
  assert.strictEqual(c.firstGateDay, 30);
});
check('cap: types at cap reported', () => {
  const c = cls({
    spawns: [], fieldFights: [], tbFights: [], faced: { w2_a: 2 }, killEntries: [{ d: 20, mid: 'w2_a', w: 2, by: 'v1', via: 'player' }],
    endPts2: 2, endDay: 180, perType2: { points: 2, perType: { w2_a: 2 } }, daily: [],
  });
  assert.deepStrictEqual(c.typesAtCap, ['w2_a']);
});

// Wrap purity on mock Games: the mock tbEnd nulls tbfight like the
// real engine, so only the capture-before-delegate wrap records it.
function mockGame() {
  const G = {
    state: { scholar: { day: 42 } },
    tbfight: null,
    spawnWorldMonster(mdef) { const mon = { id: mdef.id, wave: mdef.wave, tx: 1, ty: 2, veteran: false }; return mon; },
    fieldFight(vid, mdef) { return { outcome: 'vFlee', rounds: 2, vHpLeft: 10, mHpLeft: 50, allyVid: null, calledHelp: false, intent: null }; },
    tbEnd(result) { const f = this.tbfight; if (f) { f.over = true; f.result = result; } this.tbfight = null; return result; },
  };
  return G;
}
check('wrap purity: tbEnd fight captured before nulling', () => {
  const store = newStore();
  const G = mockGame();
  G.tbfight = { over: false, result: null, fighters: [{ kind: 'player' }, { kind: 'monster', monsterId: 'w2_a' }] };
  installWave2EncDiag(G, store);
  G.tbEnd('lost');
  assert.strictEqual(store.tbFights.length, 1);
  assert.strictEqual(store.tbFights[0].result, 'lost');
  assert.deepStrictEqual(store.tbFights[0].monsterIds, ['w2_a']);
  assert.strictEqual(store.tbFights[0].scholarIn, true);
  assert.strictEqual(G.tbfight, null);
});
check('wrap purity: spawn + fieldFight recorded, originals returned', () => {
  const store = newStore();
  const G = mockGame();
  installWave2EncDiag(G, store);
  const mon = G.spawnWorldMonster({ id: 'w2_a', wave: 2 });
  assert.strictEqual(mon.id, 'w2_a');
  const rec = G.fieldFight('v1', { id: 'w2_a', wave: 2 });
  assert.strictEqual(rec.outcome, 'vFlee');
  assert.strictEqual(store.spawns.length, 1);
  assert.strictEqual(store.fieldFights.length, 1);
  assert.strictEqual(store.fieldFights[0].outcome, 'vFlee');
});
check('wrap purity: recording errors never throw into the engine', () => {
  const store = newStore();
  const G = mockGame();
  G.fieldFight = function () { return { outcome: 'vKill' }; };
  installWave2EncDiag(G, store);
  // Break the store mid-run: pushCapped must tolerate it via noteErr path.
  const origPush = store.fieldFights.push;
  store.fieldFights.push = function () { throw new Error('boom'); };
  let rec;
  try { rec = G.fieldFight('v1', { id: 'w2_a', wave: 2 }); } catch (e) { assert.fail('wrap threw: ' + e.message); }
  assert.strictEqual(rec.outcome, 'vKill');
  assert.ok(store.errs >= 1);
  store.fieldFights.push = origPush;
});
check('layer gate: unset delegates with no surface', () => {
  delete process.env.WAVE2ENC;
  assert.strictEqual(layerOn(), false);
  const inner = { id: 'base', daily() { return 'inner'; } };
  const wrapped = withWave2EncDiag(inner, 'w2', 'test');
  const ctx = {};
  const r = wrapped.daily({}, ctx);
  assert.strictEqual(r, 'inner');
  assert.strictEqual(ctx._wave2encdiag, undefined);
  process.env.WAVE2ENC = '1';
  assert.strictEqual(layerOn(), true);
  delete process.env.WAVE2ENC;
});

console.log(`wave2enc-diag proof: ${pass} checks passed`);
