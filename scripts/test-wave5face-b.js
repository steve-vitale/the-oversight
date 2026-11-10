// test-wave5face-b.js — proof for sim-wave5face-b (run fleshout-loop-b-20261110T0122Z).
// DIAG instrument proof: pure-function analyzer tests on synthetic
// fixtures + a live-harness neutrality smoke (1 seed, 30d, instrument
// on vs W5_OFF=1). Zero src/js. Must pass on this branch AND after any
// rebase.
// Usage: node scripts/test-wave5face-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'wave5face-analyze-20261109'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; console.error('FAIL: ' + name + (extra != null ? ' — ' + JSON.stringify(extra) : '')); }
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), { got: got, want: want }); }

// ---------- fixtures ----------
function dailyRow(day, unlocked, gated, short) {
  return { day: day, unlockedWaveSnap: unlocked, gated: gated,
    readiness5: short ? { ready: short.length === 0, short: short, armored: 4, armed: 6, tricks: 3, veterans: 2, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 } } : null };
}
function baseSeed(over) {
  const o = {
    seed: 99641, days: 150, endReason: 'lost', won: false, standing: 300,
    scaleRank: 'regional', maxWave: 5, instrumentErrors: [],
    daily: [], w5spawns: [], w5casts: [], w5wanderers: [], w5livingVets: [],
    fieldFights: [], traces: [], waveKillLog: [], scholarDeaths: [],
  };
  return Object.assign(o, over || {});
}

// Fixture A: released, met, killed by a veteran (instance join).
(function () {
  const daily = [];
  for (let d = 1; d <= 110; d++) daily.push(dailyRow(d, d >= 100 ? 5 : 4, d >= 100 ? 250 : 150, d >= 100 ? [] : ['veterans']));
  const lv = [];
  for (let d = 1; d <= 110; d++) lv.push({ day: d, count: d >= 102 ? 2 : (d >= 90 ? 1 : 0), ids: d >= 102 ? ['a', 'b'] : [] });
  const o = baseSeed({
    daily: daily, w5livingVets: lv,
    w5spawns: [{ seq: 's1', day: 100, mid: 'the_cancellation', veteran: false, hp: 1200, maxHp: 1200, removedDay: 101 }],
    w5casts: [{ day: 100, mid: 'the_cancellation', veteran: false }],
    w5wanderers: [{ day: 100, bornDay: 100, mid: 'the_cancellation', wave: 5, veteran: false }],
    fieldFights: [{ day: 101, vid: 'a', isScholar: false, mid: 'the_cancellation', wave: 5, outcome: 'vKill', w5spawnSeq: 's1', w5veteranAtMeeting: true, w5fighterHadKill: true, entryHp: 1200, entryMaxHp: 1200, rounds: 8, mHpLeft: 0, vHpLeft: 40, log: ['a strikes'] }],
    waveKillLog: [{ d: 95, mid: 'the_audit', w: 4, by: 'a', via: 'field' }, { d: 101, mid: 'the_cancellation', w: 5, by: 'a', via: 'field' }],
  });
  const r = AN.analyzeSeed(o);
  eq('A unlockDay', r.unlockDay, 100);
  eq('A releaseDays', r.releaseDays, [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110]);
  eq('A releaseClass', r.releaseClass.class, 'released-met');
  eq('A spawn outcome', r.spawns.rows[0].outcome, 'kill');
  eq('A spawn meeting kind', r.spawns.rows[0].meetings[0].kind, 'field');
  eq('A spawn meeting veteran', r.spawns.rows[0].meetings[0].veteranAtMeeting, true);
  eq('A w5kills', r.w5kills, 1);
  eq('A maxVets', r.simultaneity.maxVets, 2);
  eq('A days2plus', r.simultaneity.days2plus, 9);
  eq('A relDays2plus', r.simultaneity.relDays2plus, 9);
  eq('A casts matched', r.casts.matchedBirth, 1);
  eq('A births matched spawn', r.births.matchedSpawn, 1);
  eq('A spawnsFromBirths', r.spawns.fromWandererBirth, 1);
})();

// Fixture B: released, no spawn at all.
(function () {
  const daily = [];
  for (let d = 1; d <= 120; d++) daily.push(dailyRow(d, d >= 105 ? 5 : 4, d >= 105 ? 210 : 120, []));
  const o = baseSeed({ daily: daily, w5livingVets: [{ day: 120, count: 2, ids: ['a', 'b'] }] });
  const r = AN.analyzeSeed(o);
  eq('B releaseClass', r.releaseClass.class, 'released-no-spawn');
  eq('B unlockDay', r.unlockDay, 105);
  eq('B spawns total', r.spawns.total, 0);
  eq('B meetings', r.meetings.length, 0);
})();

// Fixture C: released, spawn lived unmet (tile-entry spawn, no birth).
(function () {
  const daily = [];
  for (let d = 1; d <= 120; d++) daily.push(dailyRow(d, d >= 105 ? 5 : 4, 220, []));
  const o = baseSeed({
    daily: daily,
    w5spawns: [{ seq: 's1', day: 106, mid: 'the_editor', veteran: false, hp: 1000, maxHp: 1000, removedDay: 112 }],
  });
  const r = AN.analyzeSeed(o);
  eq('C releaseClass', r.releaseClass.class, 'released-spawns-no-meeting');
  eq('C spawn outcome', r.spawns.rows[0].outcome, 'never-met');
  eq('C neverMetReason', r.spawns.rows[0].neverMetReason, 'no-encounter');
  eq('C spawnsFromBirths', r.spawns.fromWandererBirth, 0);
})();

// Fixture D: never released — veterans short.
(function () {
  const daily = [];
  for (let d = 1; d <= 100; d++) daily.push(dailyRow(d, 4, 180, ['veterans']));
  const o = baseSeed({ daily: daily, days: 100 });
  const r = AN.analyzeSeed(o);
  eq('D releaseClass', r.releaseClass.class, 'never-released');
  eq('D unlockDay', r.unlockDay, null);
  eq('D lastShort', r.releaseClass.lastShort, ['veterans']);
  eq('D maxGated', r.releaseClass.maxGated, 180);
})();

// Fixture E: TB mid-day join + ambiguous pair.
(function () {
  const daily = [];
  for (let d = 1; d <= 120; d++) daily.push(dailyRow(d, d >= 100 ? 5 : 4, 260, []));
  const o = baseSeed({
    daily: daily,
    w5spawns: [
      { seq: 's1', day: 100, mid: 'the_finale', veteran: false, hp: 1500, maxHp: 1500, removedDay: null },
      { seq: 's2', day: 101, mid: 'the_finale', veteran: false, hp: 1500, maxHp: 1500, removedDay: null },
    ],
    traces: [
      { seq: 1, day: 102, mid: 'the_finale', mids: ['the_finale'], wave: 5, ending: 'kill', fighters: ['scholar1'], w5scholarMonsterSeq: null, rounds: 9, mHpLeft: 0, scholarHpEnd: 30 },
    ],
    waveKillLog: [{ d: 102, mid: 'the_finale', w: 5, by: 'scholar1', via: 'tb' }],
  });
  const r = AN.analyzeSeed(o);
  // Two live spawns of the same mid on the trace day: ambiguous, not assigned.
  eq('E ambiguous count', r.ambiguousTb.length, 1);
  eq('E ambiguous candidates', r.ambiguousTb[0].candidates, ['s1', 's2']);
  eq('E s1 never-met (ambiguous, not stolen)', r.spawns.rows[0].outcome, 'never-met');
  eq('E meetings total', r.meetings.length, 1);
  eq('E meeting outcome', r.meetings[0].outcome, 'kill');
})();

// Fixture E3: TB re-engage join — trace 2 days after removal, single
// candidate; and same-day repeats (two scholars, one beast, one day).
(function () {
  const daily = [];
  for (let d = 1; d <= 120; d++) daily.push(dailyRow(d, d >= 100 ? 5 : 4, 260, []));
  const o = baseSeed({
    daily: daily,
    w5spawns: [{ seq: 's1', day: 100, mid: 'the_finale', veteran: false, hp: 1500, maxHp: 1500, removedDay: 102 }],
    traces: [
      { seq: 1, day: 102, mid: 'the_finale', mids: ['the_finale'], wave: 5, ending: 'scholar-death', fighters: ['scholar1'], w5scholarMonsterSeq: null, rounds: 9, mHpLeft: 900, scholarHpEnd: 0 },
      { seq: 2, day: 102, mid: 'the_finale', mids: ['the_finale'], wave: 5, ending: 'scholar-death', fighters: ['scholar2'], w5scholarMonsterSeq: null, rounds: 7, mHpLeft: 700, scholarHpEnd: 0 },
      { seq: 3, day: 104, mid: 'the_finale', mids: ['the_finale'], wave: 5, ending: 'scholar-death', fighters: ['scholar3'], w5scholarMonsterSeq: null, rounds: 6, mHpLeft: 500, scholarHpEnd: 0 },
    ],
  });
  const r = AN.analyzeSeed(o);
  eq('E3 unmatched', r.unmatchedTb.length, 0);
  eq('E3 ambiguous', r.ambiguousTb.length, 0);
  eq('E3 spawn outcome', r.spawns.rows[0].outcome, 'die');
  eq('E3 spawn meetings', r.spawns.rows[0].meetings.length, 3);
  eq('E3 first join mid-day', r.spawns.rows[0].meetings[0].join, 'mid-day');
  eq('E3 third join re-engage', r.spawns.rows[0].meetings[2].join, 're-engage');
})();

// Fixture E2: TB mid-day join, single candidate.
(function () {
  const daily = [];
  for (let d = 1; d <= 120; d++) daily.push(dailyRow(d, d >= 100 ? 5 : 4, 260, []));
  const o = baseSeed({
    daily: daily,
    w5spawns: [{ seq: 's1', day: 100, mid: 'the_finale', veteran: false, hp: 1500, maxHp: 1500, removedDay: null }],
    traces: [{ seq: 1, day: 103, mid: 'the_finale', mids: ['the_finale'], wave: 5, ending: 'scholar-flee', fighters: ['scholar1'], w5scholarMonsterSeq: null, rounds: 4, mHpLeft: 900, scholarHpEnd: 12 }],
  });
  const r = AN.analyzeSeed(o);
  eq('E2 ambiguous', r.ambiguousTb.length, 0);
  eq('E2 spawn outcome', r.spawns.rows[0].outcome, 'flee');
  eq('E2 join', r.spawns.rows[0].tbJoin, 'mid-day');
  eq('E2 unmatchedTb', r.unmatchedTb.length, 0);
})();

// Fixture F: cast reconciliation — feast draw unmatched, wanderer gave up.
(function () {
  const daily = [];
  for (let d = 1; d <= 120; d++) daily.push(dailyRow(d, d >= 100 ? 5 : 4, 260, []));
  const o = baseSeed({
    daily: daily,
    w5casts: [
      { day: 50, mid: 'the_editor', veteran: false },
      { day: 60, mid: 'the_finale', veteran: false },
    ],
    w5wanderers: [{ day: 50, bornDay: 50, mid: 'the_editor', wave: 5, veteran: false }],
    w5spawns: [],
  });
  const r = AN.analyzeSeed(o);
  eq('F casts matched', r.casts.matchedBirth, 1);
  eq('F casts unmatched', r.casts.unmatched.length, 1);
  eq('F unmatched cast mid', r.casts.unmatched[0].mid, 'the_finale');
  eq('F births unmatched (gave up)', r.births.unmatched.length, 1);
})();

// Outcome mapping.
eq('map field vDie', AN.fieldOutcome('vDie'), 'die');
eq('map field vFlee', AN.fieldOutcome('vFlee'), 'flee');
eq('map tb rout', AN.tbOutcome('rout'), 'flee');
eq('map tb unfinished', AN.tbOutcome('unfinished'), 'other:unfinished');

// Band aggregation over fixtures A–D.
(function () {
  const mk = function (cls, seed) {
    const o = baseSeed({ seed: seed });
    if (cls === 'released-met') {
      o.daily = [dailyRow(100, 5, 250, []), dailyRow(101, 5, 250, [])];
      o.w5spawns = [{ seq: 's1', day: 100, mid: 'the_cancellation', veteran: false, hp: 1, maxHp: 1, removedDay: 101 }];
      o.fieldFights = [{ day: 100, vid: 'a', mid: 'the_cancellation', wave: 5, outcome: 'vKill', w5spawnSeq: 's1', log: [] }];
      o.waveKillLog = [{ d: 100, mid: 'the_cancellation', w: 5, by: 'a', via: 'field' }];
    } else if (cls === 'released-no-spawn') {
      o.daily = [dailyRow(100, 5, 210, []), dailyRow(101, 5, 210, [])];
    } else {
      o.daily = [dailyRow(100, 4, 180, ['veterans'])];
    }
    o.w5livingVets = [{ day: 100, count: 2, ids: ['a', 'b'] }];
    return o;
  };
  const band = AN.analyzeBand([mk('released-met', 1), mk('released-no-spawn', 2), mk('never', 3)]);
  eq('band wave5unlocks', band.wall.wave5unlocks, 2);
  eq('band wave5kills', band.wall.wave5kills, 1);
  eq('band releases classes', band.releases.classes, { 'released-met': 1, 'released-no-spawn': 1 });
  eq('band neverReleased', band.releases.neverReleased.length, 1);
  eq('band diagGo all', band.diagGo.all, true);
  eq('band spawn outcomes', band.spawns.outcomes, { kill: 1 });
})();

// ---------- live-harness neutrality smoke ----------
// 1 seed, 30d, instrument on vs W5_OFF=1. The instrument must not move
// the sim: days / endReason / waveKillLog length identical, and the
// on-leg JSON carries the w5 arrays with zero instrument errors.
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wave5face-proof-'));
  const seed = '99641';
  function runLeg(run, off) {
    const outDir = path.join(tmp, run);
    const env = Object.assign({}, process.env, {
      SEEDS: seed, DAYS: '30', RUN: run, OUTDIR: outDir,
    });
    if (off) env.W5_OFF = '1';
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'wave5face-driver-20261109.js')],
      { cwd: REPO, env: env, timeout: 180000, stdio: 'pipe' });
    return JSON.parse(fs.readFileSync(path.join(outDir, 'w5-s' + seed + '-' + run + '.json'), 'utf8'));
  }
  const on = runLeg('wave5face-proof-on', false);
  const off = runLeg('wave5face-proof-off', true);
  // Determinism re-run: the same on-leg twice must record identical rows.
  const on2 = runLeg('wave5face-proof-on2', false);
  check('smoke on-leg w5 arrays present',
    Array.isArray(on.w5spawns) && Array.isArray(on.w5casts) && Array.isArray(on.w5wanderers) && Array.isArray(on.w5livingVets));
  check('smoke on-leg daily w5livingVets populated', (on.daily || []).length > 0 && (on.daily || []).every(function (d) { return d.w5livingVets != null; }));
  check('smoke on-leg instrument errors 0', (on.instrumentErrors || []).length === 0, on.instrumentErrors);
  check('smoke off-leg instrumentOff flag', off.instrumentOff === true);
  eq('smoke neutrality days', on.days, off.days);
  eq('smoke neutrality endReason', on.endReason, off.endReason);
  eq('smoke neutrality maxWave', on.maxWave, off.maxWave);
  eq('smoke neutrality standing', on.standing, off.standing);
  eq('smoke neutrality killLog content', on.waveKillLog, off.waveKillLog);
  eq('smoke neutrality fallen length', (on.fallen || []).length, (off.fallen || []).length);
  eq('smoke determinism fieldFights', on.fieldFights, on2.fieldFights);
  eq('smoke determinism w5spawns', on.w5spawns, on2.w5spawns);
  eq('smoke determinism w5casts', on.w5casts, on2.w5casts);
  eq('smoke determinism w5wanderers', on.w5wanderers, on2.w5wanderers);
  check('smoke analyzer reads on-leg', (function () { try { const r = AN.analyzeSeed(on); return r.seed === 99641 && !!r.releaseClass; } catch (e) { return false; } })());
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
})();

console.log('test-wave5face-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
