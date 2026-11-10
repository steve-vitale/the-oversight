// test-choketrace-b.js — proof for the sim-choketrace-b trace
// (kill choke-point trace: which caller paths re-fire recordWaveKill, and
// whether the ledger's per-type-capped double-score on re-fires matters).
// Proves, before any scored seed:
//   1. CLASSIFY — classifyStack maps each of the nine named settlement
//      call sites to its path, skips hook/wrapper frames, and returns
//      UNATTRIBUTED (never a guess) for an unknown caller.
//   2. SYNTHETIC-BURST — a forced multi-path re-fire through the live
//      wrapped recordWaveKill (same key from tbEnd, patrol, wild) is
//      attributed to all three paths, never UNATTRIBUTED; the 2nd/3rd
//      calls are dup=true with no second log entry; each call carries its
//      ledger add (per-type before/after).
//   3. DETERMINISM — the same seed run twice with the recorder yields
//      byte-identical kill-call attribution and trajectories.
//   4. NEUTRALITY — recorder off (CHOKE_RECORD=0) vs on: byte-identical
//      trajectories (days, end reason, max wave, wave kills, scale
//      trajectory, deaths, daily rows, killers, reconciliation).
// Writes nothing into the repo (driver runs go to os.tmpdir()).
// Usage: node scripts/test-choketrace-b.js
//   CHOKETRACE_TEST_DAYS=30 node scripts/test-choketrace-b.js  (quick check)
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { wrapChokeRecorder, classifyStack } = require(path.join(REPO, 'scripts', 'choketrace-b-driver'));

const DAYS = parseInt(process.env.CHOKETRACE_TEST_DAYS || '30', 10) || 30;
const SEED = 140204;
let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ' — ' + e.message); }
}

function classifyLeg() {
  const cases = [
    ['tbEnd', 'tb-end'], ['resolvePatrol', 'patrol'],
    ['resolveWildMonsterEncounter', 'wild'], ['aidFight', 'aid-crisis'],
    ['_cxBlood', 'contest-blood'], ['_cxOther', 'contest-other'],
    ['lingererSortie', 'sortie'], ['expeditionMonster', 'agency'],
  ];
  for (const [fnName, want] of cases) {
    check('classify: ' + fnName + ' -> ' + want, function () {
      const stack = 'Error: choke\n'
        + '    at chokeRecordWaveKill (' + __filename + ':1:1)\n'
        + '    at Object.' + fnName + ' (' + __filename + ':2:2)\n'
        + '    at Object.runDays (' + __filename + ':3:3)\n';
      const got = classifyStack(stack);
      assert.strictEqual(got.path, want, JSON.stringify(got));
    });
  }
  check('classify: recordPyrrhicKill wrapper frame skipped, tbEnd found', function () {
    const stack = 'Error: choke\n'
      + '    at chokeRecordPyrrhicKill (' + __filename + ':1:1)\n'
      + '    at Game.tbEnd (' + __filename + ':2:2)\n';
    assert.strictEqual(classifyStack(stack).path, 'tb-end');
  });
  check('classify: unknown caller -> UNATTRIBUTED, never a guess', function () {
    const stack = 'Error: choke\n'
      + '    at chokeRecordWaveKill (' + __filename + ':1:1)\n'
      + '    at Object.someRandomFn (' + __filename + ':2:2)\n'
      + '    at Object.runDays (' + __filename + ':3:3)\n';
    const got = classifyStack(stack);
    assert.strictEqual(got.path, 'UNATTRIBUTED', JSON.stringify(got));
    assert.ok(got.frames.length > 0, 'frames kept for diagnosis');
  });
  check('classify: empty/garbage stack -> UNATTRIBUTED, no crash', function () {
    assert.strictEqual(classifyStack('').path, 'UNATTRIBUTED');
    assert.strictEqual(classifyStack(null).path, 'UNATTRIBUTED');
  });
}

// Live synthetic burst: force the same kill key through three settlement
// functions (defined below with the exact settlement names, so the real
// V8 stack carries them) plus an unknown caller. The wrapper must
// attribute every one; the 2nd/3rd same-key calls are dup with no second
// log entry; each call carries its ledger add.
async function syntheticBurstLeg() {
  const { Game } = await loadGame({ seed: 424243, mode: 'choketrace-b-synth', fullTelemetry: false });
  await setupGame(Game);
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) { return id && id !== Game.villagerId; });
  assert(roster.length >= 1, 'need >=1 non-scholar villager');
  const v1 = roster[0];
  Game.state.scholar.day = 10;
  Game.state.waveKillLog = [];
  Game.state.waveKills = {};
  Game.state.wave4Slain = 0;
  Game.state.waveKillByChannel = {};
  Game.state.villageSlain = {};
  const calls = [];
  const samples = [];
  const errors = [];
  wrapChokeRecorder(Game, samples, calls, errors);
  assert.strictEqual(errors.length, 0, 'recorder install errors: ' + JSON.stringify(errors));

  // Settlement-named callers (local functions whose V8 stack frames carry
  // the exact settlement names the classifier matches on).
  function tbEnd() { Game.recordWaveKill('belltoad', v1, 'player', null); }
  function resolvePatrol() { Game.recordWaveKill('belltoad', v1, 'player', null); }
  function resolveWildMonsterEncounter() { Game.recordWaveKill('belltoad', v1, 'player', null); }
  function someRandomFn() { Game.recordWaveKill('belltoad', v1, 'player', null); }
  tbEnd();
  resolvePatrol();
  resolveWildMonsterEncounter();
  someRandomFn();

  check('synthetic-burst: 4 calls recorded, 1 logged, 3 dup', function () {
    assert.strictEqual(calls.length, 4, JSON.stringify(calls.map(function (c) { return c.path; })));
    assert.strictEqual(calls.filter(function (c) { return c.logged; }).length, 1, 'only the first call logs');
    assert.strictEqual(calls.filter(function (c) { return c.dup; }).length, 3, 're-fires are dup');
    assert.strictEqual(Game.state.waveKillLog.length, 1, 'one body = one log entry');
  });
  check('synthetic-burst: multi-path re-fire attributed, never UNATTRIBUTED', function () {
    assert.strictEqual(calls[0].path, 'tb-end', JSON.stringify(calls[0]));
    assert.strictEqual(calls[1].path, 'patrol', JSON.stringify(calls[1]));
    assert.strictEqual(calls[2].path, 'wild', JSON.stringify(calls[2]));
    assert.ok(calls.every(function (c) { return c.path !== 'UNATTRIBUTED'; }) === false, 'the unknown caller must stay UNATTRIBUTED');
    assert.strictEqual(calls[3].path, 'UNATTRIBUTED', JSON.stringify(calls[3]));
  });
  check('synthetic-burst: each call carries its ledger add (cap room known)', function () {
    for (const c of calls) {
      assert.ok(c.ledger && typeof c.ledger.add === 'number', JSON.stringify(c.ledger));
      assert.ok(c.ledger.cap > 0, 'cap read');
      assert.ok(typeof c.ledger.roomBefore === 'number', 'roomBefore read');
    }
    // First call scores (belltoad wave 1, cap 2, counter unknown -> +1);
    // re-fires share the cap: total per-type after all 4 calls <= cap.
    const last = calls[calls.length - 1];
    assert.ok(last.ledger.perTypeAfter <= last.ledger.cap, 'per-type never exceeds cap: ' + JSON.stringify(last.ledger));
    assert.strictEqual(calls[0].ledger.add, 1, 'first call scores +1: ' + JSON.stringify(calls[0].ledger));
  });
  check('synthetic-burst: a genuinely different kill still logs and counts', function () {
    const before = Game.state.waveKillLog.length;
    function aidFight() { Game.recordWaveKill('hummice', v1, 'player', null); }
    aidFight();
    assert.strictEqual(Game.state.waveKillLog.length, before + 1, 'different monster logs');
    assert.strictEqual(calls[calls.length - 1].path, 'aid-crisis', JSON.stringify(calls[calls.length - 1]));
    assert.strictEqual(calls[calls.length - 1].dup, false, 'different kill is not a dup');
  });
}

// Driver-level legs: determinism + neutrality via the real CLI on tmp dirs.
function runDriver(seed, days, outDir, record) {
  fs.mkdirSync(outDir, { recursive: true });
  const env = Object.assign({}, process.env, {
    SEEDS: String(seed), DAYS: String(days), OUTDIR: outDir,
    CHOKE_RECORD: record ? '1' : '0',
  });
  execFileSync(process.execPath, [path.join(REPO, 'scripts', 'choketrace-b-driver.js')], { env: env, stdio: 'pipe', cwd: REPO });
  const file = path.join(outDir, 'choketrace-b-s' + seed + '.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function trajectoryOf(o) {
  return {
    resultDays: o.resultDays, gameDays: o.gameDays, endReason: o.endReason,
    won: o.won, villageLost: o.villageLost, maxWaveUnlocked: o.maxWaveUnlocked,
    waveKills: o.waveKills, scaleTrajectory: o.scaleTrajectory,
    teleDeaths: o.teleDeaths, daily: o.daily, killers: o.killers,
    reconciliation: o.reconciliation,
  };
}
function attributionOf(o) {
  return (o.killCalls || []).map(function (c) {
    return [c.seq, c.method, c.day, c.mid, c.by, c.via, c.trick, c.logged, c.dup,
      c.path, c.inv, c.ordInInv, c.fightId, c.fieldFightSeq, c.monsterObjId,
      c.ledger.add, c.ledger.perTypeBefore, c.ledger.perTypeAfter];
  });
}

function driverLegs() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'choketrace-b-test-'));
  const d1 = path.join(tmp, 'run1');
  const d2 = path.join(tmp, 'run2');
  const dOff = path.join(tmp, 'runoff');
  const a = runDriver(SEED, DAYS, d1, true);
  const b = runDriver(SEED, DAYS, d2, true);
  check('determinism: same seed twice = same attribution + same trajectory', function () {
    assert.deepStrictEqual(attributionOf(b), attributionOf(a), 'kill-call attribution differs between identical runs');
    assert.deepStrictEqual(trajectoryOf(b), trajectoryOf(a), 'trajectory differs between identical runs');
    assert.ok((a.killCalls || []).length > 0, 'expected kill calls on seed ' + SEED);
  });
  const off = runDriver(SEED, DAYS, dOff, false);
  check('neutrality: recorder off = byte-identical trajectories vs recorder on', function () {
    assert.deepStrictEqual(trajectoryOf(off), trajectoryOf(a), 'recorder changed the game');
    assert.strictEqual((off.killCalls || []).length, 0, 'recorder-off run must record no calls');
    assert.strictEqual(off.recorded, false, 'recorder-off run must flag recorded=false');
  });
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}

async function main() {
  classifyLeg();
  await syntheticBurstLeg();
  driverLegs();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)');
  process.exitCode = failures === 0 ? 0 : 1;
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}
