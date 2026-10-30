#!/usr/bin/env node
// scripts/test-fullseatgate-20261030-a.js — proof for the 2026-10-30
// full-seat gate recorder (arm sim-fullseatgate-a). No sims, no game
// load: synthetic analyzer verdicts + captureVector against stub
// Games. Run: node scripts/test-fullseatgate-20261030-a.js
// (Named with the date because scripts/test-fullseatgate-a.js is the
// 2026-10-27 arm's validator for a different corpus shape.)
'use strict';
const assert = require('assert');
const { analyzeRows, verdict } = require('./sim-fullseatgate-a-analyze');
const { captureVector } = require('./sim-fullseatgate-a-sweep');

let pass = 0;
function check(name, fn) { fn(); pass++; console.log(`  PASS ${name}`); }

// Synthetic row builder: full components chosen per seed.
function row(seed, opts) {
  const f = Object.assign({ ok: false, waves: true, contests: true, crises: true, scale: true, stageOk: true, foodDeeds: true, stage: 3, w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contestsN: 4, crisesN: 4, rank: 'national' }, opts.full || {});
  f.ok = f.waves && f.contests && f.crises && f.scale && f.stageOk && f.foodDeeds;
  return { seed, table: opts.table === undefined ? 1 : opts.table, atTable: opts.noVector ? null : { day: 120, seat: f.ok ? 'full' : 'lesser', full: f, lesserOk: true, lesser: { w1: true, w2: true, w3: true, contests: true, crises: true, scale: true, stage: true, foodDeeds: true }, doors: ['assimilated'] }, endVector: { full: f }, seatAtEnd: f.ok ? 'full' : 'lesser', won: 0, nationalEver: 1, nationalFinal: 1, entered: 1, waveReach: 4, gameDays: 180 };
}

check('GO: one component fails on every table seed', () => {
  const rows = [];
  for (let i = 0; i < 7; i++) rows.push(row(75101 + i, { full: { scale: false, rank: 'regional' } }));
  rows.push(row(75108, { table: 0 }));
  const a = analyzeRows(rows);
  assert.strictEqual(a.tableSeeds.length, 7);
  assert.strictEqual(a.nVectors, 7);
  assert.strictEqual(a.compFail.scale, 7);
  assert.strictEqual(a.compFail.waves, 0);
  const v = verdict(a, 'pilot');
  assert.strictEqual(v.verdict, 'GO');
  assert.strictEqual(v.dominant, 'scale');
});

check('DIAG-GO: no dominant gate, ranked list complete', () => {
  const rows = [
    row(75101, { full: { waves: false, w4: 1, w5: 0 } }),
    row(75102, { full: { scale: false, rank: 'regional' } }),
    row(75103, { full: { contests: false, contestsN: 2 } }),
    row(75104, { full: { waves: false, w5: 1 } }),
    row(75105, { full: { crises: false, crisesN: 2 } }),
    row(75106, { full: { scale: false, rank: 'regional' } }),
    row(75107, { full: { foodDeeds: false } }),
  ];
  const a = analyzeRows(rows);
  const v = verdict(a, 'pilot');
  assert.strictEqual(v.verdict, 'DIAG-GO');
  assert.strictEqual(a.ranked[0].fail, 2);
  assert.strictEqual(a.waveEverShort.w4, 1);
});

check('PILOT-FAILED: table below floor', () => {
  const rows = [row(75101, {}), row(75102, {}), row(75103, {}), row(75104, { table: 0 })];
  const v = verdict(analyzeRows(rows), 'pilot');
  assert.strictEqual(v.verdict, 'PILOT-FAILED');
});

check('PILOT-FAILED: capture below 90%', () => {
  const rows = [];
  for (let i = 0; i < 7; i++) rows.push(row(75101 + i, { noVector: i < 2 }));
  const v = verdict(analyzeRows(rows), 'pilot');
  assert.strictEqual(v.verdict, 'PILOT-FAILED');
});

check('CONFIRM reproduces GO dominant; contradiction is NO-GO', () => {
  const ok = [];
  for (let i = 0; i < 8; i++) ok.push(row(75111 + i, { full: { scale: false, rank: 'regional' } }));
  assert.strictEqual(verdict(analyzeRows(ok), 'confirm', 'scale').verdict, 'GO-CONFIRMED');
  const bad = [];
  for (let i = 0; i < 8; i++) bad.push(row(75111 + i, { full: { waves: false, w4: 0 } }));
  assert.strictEqual(verdict(analyzeRows(bad), 'confirm', 'scale').verdict, 'NO-GO');
});

check('captureVector: full stub yields complete vector, no errs', () => {
  const Game = {
    state: { scholar: { day: 131, prog: { feastSurgeUsed: true } }, village: {} },
    progState: () => ({ arc: 4, tableWaiting: true, tableDone: false, sentimentTaught: true, crises: { a: 1, b: 1, c: 1 } }),
    tableSeat: () => ({ seat: 'lesser', detail: { w1: 5, w2: 5, w3: 4, w4: 1, w5: 0, contestsN: 4, crisesN: 3, rank: 'regional', stage: 3, foodDeeds: true } }),
    deedGateReady: () => ({ ok: false, waves: false, contests: true, crises: true, scale: false, stageOk: true, foodDeeds: true, stage: 3, w1: 5, w2: 5, w3: 4, w4: 1, w5: 0, contestsN: 4, crisesN: 3, rank: 'regional' }),
    deedState: () => ({ wavesFaced: { deer: 1, wolf: 1 } }),
    waveEngaged: (w) => (w === 4 ? 1 : 0), scaleRank: () => 'regional', integrationStage: () => 3,
    villageStanding: () => ({ total: 150, war: 40, diplomacy: 60, plenty: 50, warPts: 1, links: 2, feasts: 3 }),
    codexBreadth: () => 30, havenViewership: () => 20,
    ledger: () => ({ protected: 5, killed: 2, foodShared: 10, foodHoarded: 1 }),
    tablePromiseTally: () => ({ kept: 3, broken: 0 }),
    tableSwitchTally: () => ({ routed: 5, delayed: 0, edited: 0, skimmed: 0 }),
    tableEarnedPaths: () => [{ id: 'assimilated', name: 'the Assimilated', earned: true }, { id: 'indispensable', name: 'the Indispensable', earned: false }],
    tableState: () => ({ seat: 'lesser', path: null, phase: 'paths' }),
    relayLean: () => 0, won: false,
  };
  const v = captureVector(Game, 'atTable-waiting');
  assert.strictEqual(v.seat, 'lesser');
  assert.strictEqual(v.full.scale, false);
  assert.strictEqual(v.full.waves, false);
  assert.deepStrictEqual(v.waveShortfall, { w1: 0, w2: 0, w3: 0, w4: 2, w5: 2 });
  assert.strictEqual(v.lesserOk, true);
  assert.deepStrictEqual(v.doors, ['the Assimilated']);
  assert.strictEqual(v.unlockedWave, null);
  assert.ok(v.unlockedWaveSkipped);
  assert.strictEqual(v.waveEngaged[4], 1);
  assert.strictEqual(v.errs.length, 0);
});

check('captureVector: missing functions degrade to nulls, never throw', () => {
  const Game = { state: { scholar: { day: 5, prog: {} } }, progState: () => ({}) };
  const v = captureVector(Game, 'end');
  assert.strictEqual(v.seat, undefined);
  assert.ok(v.errs.length >= 5);
  assert.strictEqual(v.day, 5);
});

console.log(`FIXTURES-PASS ${pass}/7`);
