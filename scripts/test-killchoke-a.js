// test-killchoke-a.js — proof for the sim-killchoke-a trace (REPLICATION)
// (kill choke-point trace: which caller paths re-fire recordWaveKill, and
// whether the ledger's per-type-capped double-score on re-fires matters).
// Proves, before any scored seed:
//   1. CLASSIFY — classifyFrames maps each of the nine named settlement
//      call sites to its path OFFLINE (from stored frame names), skips
//      hook/wrapper frames, and returns UNATTRIBUTED (never a guess) for
//      an unknown caller.
//   2. SYNTHETIC-BURST (live) — a forced multi-path re-fire through the
//      live wrapped recordWaveKill (same key from tbEnd, patrol, wild)
//      is attributed to all three paths, never guessed; the 2nd/3rd
//      calls are dup=true with no second log entry; each call carries
//      its ledger add; the analyzer's shape verdict on the burst is
//      RE-FIRE (cross-path).
//   3. SYNTHETIC-SHAPES (pure) — the analyzer's shape verdicts: one TB
//      fight with 4 dead of the type is GENUINE multi-body; contest
//      ordinals 1,2,3 are GENUINE gauntlet repeats; wild distinct
//      monster objects are GENUINE repeats; one TB fight with 1 dead
//      but 2 calls is RE-FIRE; a repeated contest ordinal is RE-FIRE.
//   4. DETERMINISM — the same seed run twice with the recorder yields
//      byte-identical kill-call attribution and trajectories.
//   5. NEUTRALITY — recorder off (KILLCHOKE_RECORD=0) vs on:
//      byte-identical trajectories (days, end reason, max wave, wave
//      kills, scale trajectory, deaths, daily rows, killers,
//      reconciliation); settlement-invocation counting fires (tb-end > 0).
// Writes nothing into the repo (driver runs go to os.tmpdir()).
// Usage: node scripts/test-killchoke-a.js
//   KILLCHOKE_TEST_DAYS=30 node scripts/test-killchoke-a.js  (quick check)
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { wrapKillchokeRecorder, parseStackFrames, classifyFrames } = require(path.join(REPO, 'scripts', 'killchoke-a-driver'));
const { classifyCall, groupBursts, shapeBurst } = require(path.join(REPO, 'scripts', 'killchoke-a-analyze'));

const DAYS = parseInt(process.env.KILLCHOKE_TEST_DAYS || '30', 10) || 30;
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
      const stack = 'Error: killchoke\n'
        + '    at killchokeRecordWaveKill (' + __filename + ':1:1)\n'
        + '    at Object.' + fnName + ' (' + __filename + ':2:2)\n'
        + '    at Object.runDays (' + __filename + ':3:3)\n';
      const frames = parseStackFrames(stack);
      assert.strictEqual(classifyFrames(frames), want, JSON.stringify(frames));
      assert.ok(frames.includes(fnName), 'frames keep the settlement name');
    });
  }
  check('classify: recordPyrrhicKill wrapper frame skipped, tbEnd found', function () {
    const stack = 'Error: killchoke\n'
      + '    at killchokeRecordPyrrhicKill (' + __filename + ':1:1)\n'
      + '    at Game.tbEnd (' + __filename + ':2:2)\n';
    assert.strictEqual(classifyFrames(parseStackFrames(stack)), 'tb-end');
  });
  check('classify: unknown caller -> UNATTRIBUTED, never a guess', function () {
    const stack = 'Error: killchoke\n'
      + '    at killchokeRecordWaveKill (' + __filename + ':1:1)\n'
      + '    at Object.someRandomFn (' + __filename + ':2:2)\n'
      + '    at Object.runDays (' + __filename + ':3:3)\n';
    const frames = parseStackFrames(stack);
    assert.strictEqual(classifyFrames(frames), 'UNATTRIBUTED', JSON.stringify(frames));
    assert.ok(frames.length > 0, 'frames kept for diagnosis');
  });
  check('classify: empty/garbage stack -> UNATTRIBUTED, no crash', function () {
    assert.strictEqual(classifyFrames(parseStackFrames('')), 'UNATTRIBUTED');
    assert.strictEqual(classifyFrames(parseStackFrames(null)), 'UNATTRIBUTED');
    assert.strictEqual(classifyFrames([]), 'UNATTRIBUTED');
  });
  check('classify: contest-other refined by contest id', function () {
    const base = { method: 'recordWaveKill', day: 10, mid: 'x', by: 'v', via: 'contest', trick: null, stackFrames: ['killchokeRecordWaveKill', '_cxOther', 'runDays'], inv: {}, ordInInv: 1, contestId: 'hide' };
    assert.strictEqual(classifyCall(base), 'contest-hide');
    assert.strictEqual(classifyCall(Object.assign({}, base, { contestId: 'beastmaster' })), 'contest-beastmaster');
    assert.strictEqual(classifyCall(Object.assign({}, base, { contestId: null })), 'contest-other');
  });
}

// Live synthetic burst: force the same kill key through three settlement
// functions (defined below with the exact settlement names, so the real
// V8 stack carries them) plus an unknown caller. The wrapper must store
// frames attributing every one; the 2nd/3rd same-key calls are dup with
// no second log entry; each call carries its ledger add.
async function syntheticBurstLeg() {
  const { Game } = await loadGame({ seed: 424243, mode: 'killchoke-a-synth', fullTelemetry: false });
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
  wrapKillchokeRecorder(Game, samples, calls, errors);
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
    assert.strictEqual(calls.length, 4, JSON.stringify(calls.map(function (c) { return c.stackFrames; })));
    assert.strictEqual(calls.filter(function (c) { return c.logged; }).length, 1, 'only the first call logs');
    assert.strictEqual(calls.filter(function (c) { return c.dup; }).length, 3, 're-fires are dup');
    assert.strictEqual(Game.state.waveKillLog.length, 1, 'one body = one log entry');
  });
  check('synthetic-burst: multi-path re-fire attributed offline, never guessed', function () {
    assert.strictEqual(classifyCall(calls[0]), 'tb-end', JSON.stringify(calls[0].stackFrames));
    assert.strictEqual(classifyCall(calls[1]), 'patrol', JSON.stringify(calls[1].stackFrames));
    assert.strictEqual(classifyCall(calls[2]), 'wild', JSON.stringify(calls[2].stackFrames));
    assert.strictEqual(classifyCall(calls[3]), 'UNATTRIBUTED', JSON.stringify(calls[3].stackFrames));
  });
  check('synthetic-burst: analyzer shape verdict is RE-FIRE (cross-path)', function () {
    const bursts = groupBursts(calls);
    assert.strictEqual(bursts.length, 1, 'one burst of 4 same-key calls');
    const sh = shapeBurst(bursts[0]);
    assert.strictEqual(sh.verdict, 'RE-FIRE', JSON.stringify(sh));
    assert.ok(sh.paths.length > 1, 'cross-path burst: ' + JSON.stringify(sh.paths));
  });
  check('synthetic-burst: each call carries its ledger add (cap room known)', function () {
    for (const c of calls) {
      assert.ok(c.ledger && typeof c.ledger.add === 'number', JSON.stringify(c.ledger));
      assert.ok(c.ledger.cap > 0, 'cap read');
      assert.ok(typeof c.ledger.roomBefore === 'number', 'roomBefore read');
    }
    const last = calls[calls.length - 1];
    assert.ok(last.ledger.perTypeAfter <= last.ledger.cap, 'per-type never exceeds cap: ' + JSON.stringify(last.ledger));
    assert.strictEqual(calls[0].ledger.add, 1, 'first call scores +1: ' + JSON.stringify(calls[0].ledger));
  });
  check('synthetic-burst: a genuinely different kill still logs and counts', function () {
    const before = Game.state.waveKillLog.length;
    function aidFight() { Game.recordWaveKill('hummice', v1, 'player', null); }
    aidFight();
    assert.strictEqual(Game.state.waveKillLog.length, before + 1, 'different monster logs');
    assert.strictEqual(classifyCall(calls[calls.length - 1]), 'aid-crisis', JSON.stringify(calls[calls.length - 1].stackFrames));
    assert.strictEqual(calls[calls.length - 1].dup, false, 'different kill is not a dup');
  });
}

// Pure synthetic shapes: fake call records straight into the analyzer.
function syntheticShapesLeg() {
  function fakeCall(o) {
    return Object.assign({
      seq: 1, method: 'recordWaveKill', day: 10, mid: 'belltoad', by: 'v1',
      via: 'player', trick: null, logged: true, dup: false,
      stackFrames: ['killchokeRecordWaveKill', 'tbEnd'], inv: { tbEnd: 1 },
      ordInInv: 1, fightId: 1, deadByType: null, contestId: null,
      fieldFightSeq: null, monsterObjId: null,
      ledger: { wave: 1, pointsBefore: 0, pointsAfter: 1, perTypeBefore: 0, perTypeAfter: 1, add: 1, cap: 2, bar: 5, roomBefore: 2, counterKnown: false, crossedBar: false },
      _invKey: 'tbEnd#1',
    }, o);
  }
  check('shape: one TB fight, 4 dead belltoad -> GENUINE multi-body', function () {
    const cs = [1, 2, 3, 4].map(function (i) {
      return fakeCall({ seq: i, logged: i === 1, dup: i > 1, ordInInv: i, deadByType: { belltoad: 4 } });
    });
    const b = groupBursts(cs)[0];
    assert.ok(b, 'burst formed');
    const sh = shapeBurst(b);
    assert.strictEqual(sh.verdict, 'GENUINE', JSON.stringify(sh));
  });
  check('shape: one TB fight, 1 dead but 2 calls -> RE-FIRE', function () {
    const cs = [1, 2].map(function (i) {
      return fakeCall({ seq: i, logged: i === 1, dup: i > 1, ordInInv: i, deadByType: { belltoad: 1 } });
    });
    const sh = shapeBurst(groupBursts(cs)[0]);
    assert.strictEqual(sh.verdict, 'RE-FIRE', JSON.stringify(sh));
  });
  check('shape: contest ordinals 1,2,3 -> GENUINE gauntlet repeats', function () {
    const cs = [1, 2, 3].map(function (i) {
      return fakeCall({ seq: i, mid: 'giant_mosquito', via: 'contest', logged: i === 1, dup: i > 1, ordInInv: i,
        stackFrames: ['killchokeRecordWaveKill', '_cxBlood'], inv: { blood: 1 }, _invKey: 'blood#1', deadByType: null });
    });
    const sh = shapeBurst(groupBursts(cs)[0]);
    assert.strictEqual(sh.verdict, 'GENUINE', JSON.stringify(sh));
  });
  check('shape: contest repeated ordinal -> RE-FIRE', function () {
    const cs = [1, 2].map(function (i) {
      return fakeCall({ seq: i, mid: 'giant_mosquito', via: 'contest', logged: i === 1, dup: i > 1, ordInInv: 1,
        stackFrames: ['killchokeRecordWaveKill', '_cxBlood'], inv: { blood: 1 }, _invKey: 'blood#1', deadByType: null });
    });
    const sh = shapeBurst(groupBursts(cs)[0]);
    assert.strictEqual(sh.verdict, 'RE-FIRE', JSON.stringify(sh));
  });
  check('shape: wild distinct monster objects -> GENUINE repeats', function () {
    const cs = [1, 2].map(function (i) {
      return fakeCall({ seq: i, mid: 'hushwolf', via: 'wild', logged: i === 1, dup: i > 1, ordInInv: 1,
        stackFrames: ['killchokeRecordWaveKill', 'resolveWildMonsterEncounter'], inv: { wild: i }, _invKey: 'wild#' + (7 + i),
        monsterObjId: 6 + i, fieldFightSeq: i, deadByType: null });
    });
    const sh = shapeBurst(groupBursts(cs)[0]);
    assert.strictEqual(sh.verdict, 'GENUINE', JSON.stringify(sh));
  });
  check('shape: wild same monster object twice -> RE-FIRE', function () {
    const cs = [1, 2].map(function (i) {
      return fakeCall({ seq: i, mid: 'hushwolf', via: 'wild', logged: i === 1, dup: i > 1, ordInInv: 1,
        stackFrames: ['killchokeRecordWaveKill', 'resolveWildMonsterEncounter'], inv: { wild: 8 }, _invKey: 'wild#8',
        monsterObjId: 7, fieldFightSeq: 1, deadByType: null });
    });
    const sh = shapeBurst(groupBursts(cs)[0]);
    assert.strictEqual(sh.verdict, 'RE-FIRE', JSON.stringify(sh));
  });
}

// Driver-level legs: determinism + neutrality via the real CLI on tmp dirs.
function runDriver(seed, days, outDir, record) {
  fs.mkdirSync(outDir, { recursive: true });
  const env = Object.assign({}, process.env, {
    SEEDS: String(seed), DAYS: String(days), OUTDIR: outDir,
    KILLCHOKE_RECORD: record ? '1' : '0',
  });
  execFileSync(process.execPath, [path.join(REPO, 'scripts', 'killchoke-a-driver.js')], { env: env, stdio: 'pipe', cwd: REPO });
  const file = path.join(outDir, 'killchoke-a-s' + seed + '.json');
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
      classifyCall(c), c.inv, c.ordInInv, c.fightId, c.fieldFightSeq, c.monsterObjId,
      c.ledger.add, c.ledger.perTypeBefore, c.ledger.perTypeAfter];
  });
}

function driverLegs() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'killchoke-a-test-'));
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
  check('settlement-invocation counting fires (tb-end > 0)', function () {
    const inv = a.summary.settlementInvocations;
    assert.ok(inv && typeof inv === 'object', 'settlementInvocations present');
    assert.ok((inv['tb-end'] | 0) > 0, 'tbEnd ran: ' + JSON.stringify(inv));
    assert.ok((inv.wild | 0) > 0, 'wild ran: ' + JSON.stringify(inv));
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
  syntheticShapesLeg();
  driverLegs();
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)');
  process.exitCode = failures === 0 ? 0 : 1;
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}
