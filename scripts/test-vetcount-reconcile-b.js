// test-vetcount-reconcile-b.js — proof for the sim-vetcount-reconcile-b fix
// (backlog #2077: kill-log vs veteran-counter disagree).
// Proves, before any scored seed:
//   1. RECONCILE — reconcile() counts counter vs non-pyrrhic log entries
//      per wave and agrees exactly when they match.
//   2. PYRRHIC — recordPyrrhicKill stamps the log entry pyrrhic:true and
//      moves NO counter (waveKills / wave4Slain unchanged — the steve-call
//      boundary stands), while the veteran read still counts the killer
//      (who counts as a veteran does not change).
//   3. REPEAT — a same-day exact repeat of recordWaveKill writes no second
//      log entry AND increments no counter (waveKills, wave4Slain,
//      waveKillByChannel each +0); a genuinely different kill still counts.
//   4. FATES — buildKillers() includes the current scholar (scholarAtEnd)
//      and ever-scholar killers the last-row veterans list drops.
//   5. DETERMINISM — the same seed run twice with the vetcount recorder
//      yields byte-identical daily rows, kill-time samples, kill calls,
//      killers, and reconciliation.
//   6. NEUTRALITY — the recorder does not change outcomes: same seed,
//      recorder-wrapped competent vs plain competent, identical trajectories
//      (pop, scale, standing, deaths, wave kills, end reason, log length).
//   7. ATTR-OFF CONTROL — with Game._attrKills === false the counter
//      increments per call exactly as before the fix (no log exists to
//      dedupe against), so the honesty control's behavior is preserved.
// Writes nothing into the repo (all runs in-memory).
// Usage: node scripts/test-vetcount-reconcile-b.js
//   VETCOUNT_TEST_DAYS=30 node scripts/test-vetcount-reconcile-b.js  (quick check)
'use strict';
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { snapshotLadder, wrapKillRecorder, buildKillers, reconcile } = require(path.join(REPO, 'scripts', 'vetcount-b-driver'));

const DAYS = parseInt(process.env.VETCOUNT_TEST_DAYS || '30', 10) || 30;
const SEED = 140201;
let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ' — ' + e.message); }
}
function dataPerson(Game, vid) {
  return ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; })
    || ((Game.data || {}).background_survivors || []).find(function (x) { return x && x.id === vid; }) || null;
}

function reconcileLeg() {
  check('reconcile: counter == non-pyrrhic log entries agrees', function () {
    const G = { state: { waveKills: { 1: 2, 4: 1 }, waveKillLog: [
      { w: 1, pyrrhic: false }, { w: 1 }, { w: 4, by: 'x' }, { w: 4, by: 'y', pyrrhic: true },
    ] } };
    const r = reconcile(G);
    assert.strictEqual(r.allAgree, true, JSON.stringify(r));
    assert.strictEqual(r.waves[1].counter, 2);
    assert.strictEqual(r.waves[1].logCounted, 2);
    assert.strictEqual(r.waves[4].counter, 1);
    assert.strictEqual(r.waves[4].logAll, 2);
    assert.strictEqual(r.waves[4].logCounted, 1);
  });
  check('reconcile: counter > log disagrees (the 140208 shape)', function () {
    const G = { state: { waveKills: { 4: 6 }, waveKillLog: [
      { w: 4 }, { w: 4 }, { w: 4 }, { w: 4 }, { w: 4 },
    ] } };
    const r = reconcile(G);
    assert.strictEqual(r.allAgree, false, JSON.stringify(r));
    assert.strictEqual(r.waves[4].counter, 6);
    assert.strictEqual(r.waves[4].logCounted, 5);
  });
  check('reconcile: log > counter disagrees (the 140203 shape, pre-stamp)', function () {
    const G = { state: { waveKills: { 4: 1 }, waveKillLog: [{ w: 4 }, { w: 4 }] } };
    const r = reconcile(G);
    assert.strictEqual(r.allAgree, false, JSON.stringify(r));
    assert.strictEqual(r.waves[4].logCounted, 2);
  });
}

async function engineLeg() {
  const { Game } = await loadGame({ seed: 424242, mode: 'vetcount-b-engine', fullTelemetry: false });
  await setupGame(Game);
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) { return id && id !== Game.villagerId; });
  assert(roster.length >= 2, 'need >=2 non-scholar villagers, got ' + roster.length);
  const v1 = roster[0], v2 = roster[1];
  assert(dataPerson(Game, v1) && !dataPerson(Game, v1).dead, 'v1 must start alive');
  assert(dataPerson(Game, v2) && !dataPerson(Game, v2).dead, 'v2 must start alive');
  Game.state.scholar.day = 10;
  Game.state.waveKillLog = [];
  Game.state.waveKills = {};
  Game.state.wave4Slain = 0;
  Game.state.waveKillByChannel = {};
  Game.state.villageSlain = {};

  check('pyrrhic: log entry stamped pyrrhic:true, counters unmoved', function () {
    const beforeKills = JSON.parse(JSON.stringify(Game.state.waveKills));
    const beforeSlain = Game.state.wave4Slain;
    Game.recordPyrrhicKill('congregation', v1, 'player', null);
    assert.strictEqual(Game.state.waveKillLog.length, 1, JSON.stringify(Game.state.waveKillLog));
    assert.strictEqual(Game.state.waveKillLog[0].pyrrhic, true, JSON.stringify(Game.state.waveKillLog[0]));
    assert.deepStrictEqual(Game.state.waveKills, beforeKills, 'pyrrhic must not touch waveKills');
    assert.strictEqual(Game.state.wave4Slain, beforeSlain, 'pyrrhic must not touch wave4Slain');
    assert.strictEqual(Game.state.villageSlain.congregation, 1, 'pyrrhic still teaches villageSlain');
  });
  check('pyrrhic: the killer still counts as a veteran (identity unchanged)', function () {
    assert.strictEqual(Game._ladderLivingVeterans(4), 1, 'a pyrrhic w4 kill still makes a veteran');
    const r = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(r.veterans, 1, JSON.stringify(r));
  });
  check('pyrrhic: reconcile counts it as log-all but not log-counted', function () {
    const r = reconcile(Game);
    assert.strictEqual(r.waves[4].logAll, 1);
    assert.strictEqual(r.waves[4].logCounted, 0);
    assert.strictEqual(r.waves[4].counter, 0);
    assert.strictEqual(r.waves[4].agree, true, JSON.stringify(r.waves[4]));
  });

  // Fresh slate for the repeat leg (keep the pyrrhic lesson above intact in
  // the test narrative, but isolate the counters).
  Game.state.waveKillLog = [];
  Game.state.waveKills = {};
  Game.state.wave4Slain = 0;
  Game.state.waveKillByChannel = {};
  Game.state.villageSlain = {};
  check('repeat: first kill logs once and counts once', function () {
    Game.recordWaveKill('congregation', v1, 'player', null);
    assert.strictEqual(Game.state.waveKillLog.length, 1);
    assert.strictEqual(Game.state.waveKills[4], 1);
    assert.strictEqual(Game.state.wave4Slain, 1);
    assert.strictEqual(Game.state.waveKillByChannel['player.w4'], 1);
  });
  check('repeat: same-day exact repeat logs nothing and counts nothing', function () {
    Game.recordWaveKill('congregation', v1, 'player', null);
    assert.strictEqual(Game.state.waveKillLog.length, 1, 'one body = one log entry');
    assert.strictEqual(Game.state.waveKills[4], 1, 'one body = one count (the 140208 fix)');
    assert.strictEqual(Game.state.wave4Slain, 1);
    assert.strictEqual(Game.state.waveKillByChannel['player.w4'], 1, 'channel counter also once');
  });
  check('repeat: a genuinely different kill still counts', function () {
    Game.recordWaveKill('strike', v2, 'player', null);
    assert.strictEqual(Game.state.waveKillLog.length, 2);
    assert.strictEqual(Game.state.waveKills[4], 2);
    assert.strictEqual(Game.state.wave4Slain, 2);
    assert.strictEqual(Game.state.waveKillByChannel['player.w4'], 2);
  });
  check('repeat: reconcile agrees after the fix', function () {
    const r = reconcile(Game);
    assert.strictEqual(r.allAgree, true, JSON.stringify(r));
    assert.strictEqual(r.waves[4].counter, 2);
    assert.strictEqual(r.waves[4].logCounted, 2);
  });
  check('fates: buildKillers includes the current scholar (scholarAtEnd)', function () {
    const scholarId = Game.villagerId;
    Game.state.waveKillLog = [
      { by: v1, w: 4, d: 10 }, { by: scholarId, w: 4, d: 12 }, { by: v1, w: 5, d: 14 },
    ];
    const rows = [{ scholarId: scholarId }, { scholarId: v1 }];
    const killers = buildKillers(Game, rows);
    assert.strictEqual(killers.length, 2, JSON.stringify(killers));
    const sk = killers.find(function (k) { return k.vid === scholarId; });
    assert(sk, 'scholar killer must be listed');
    assert.strictEqual(sk.scholarAtEnd, true);
    assert.strictEqual(sk.everScholar, true);
    assert.strictEqual(sk.kills, 1);
    const k1 = killers.find(function (k) { return k.vid === v1; });
    assert(k1, 'v1 must be listed');
    assert.strictEqual(k1.kills, 2);
    assert.deepStrictEqual(k1.waves, [4, 5]);
    assert.strictEqual(k1.everScholar, true, 'v1 held the scholar seat for a day in rows');
  });
  check('attr-off: with _attrKills false the counter increments per call (control preserved)', function () {
    Game.state.waveKillLog = [];
    Game.state.waveKills = {};
    Game.state.wave4Slain = 0;
    Game.state.waveKillByChannel = {};
    Game._attrKills = false;
    try {
      Game.recordWaveKill('congregation', v1, 'player', null);
      Game.recordWaveKill('congregation', v1, 'player', null);
    } finally { Game._attrKills = true; }
    assert.strictEqual(Game.state.waveKillLog.length, 0, 'logging off writes no log');
    assert.strictEqual(Game.state.waveKills[4], 2, 'logging off still counts every call, as before the fix');
    assert.strictEqual(Game.state.wave4Slain, 2);
  });
}

async function runRecorded(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'vetcount-b-test', fullTelemetry: false });
  const rows = [];
  const killTimeSamples = [];
  const killCalls = [];
  const recorderErrors = [];
  let lastSnapDay = -1;
  await setupGame(Game);
  wrapKillRecorder(Game, killTimeSamples, killCalls, recorderErrors);
  const wrapped = Object.assign({}, COMPETENT.competent, {
    daily: function (Gm, ctx) {
      try { return COMPETENT.competent.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== lastSnapDay) { lastSnapDay = d; rows.push(snapshotLadder(Game)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
  return {
    result: result, rows: rows, killTimeSamples: killTimeSamples, killCalls: killCalls,
    killers: buildKillers(Game, rows), reconciliation: reconcile(Game),
    recorderErrors: recorderErrors, Game: Game,
  };
}

async function runPlain(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'vetcount-b-test', fullTelemetry: false });
  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, COMPETENT.competent, { days: days, manifest: undefined, sampleEvery: 30 }); });
  return { result: result, Game: Game };
}

function fingerprint(result, Game) {
  return {
    days: result.days,
    gameDays: ((Game.state || {}).scholar || {}).day || 0,
    endReason: result.endReason,
    won: !!Game.won,
    maxWave: result.maxWaveUnlocked || 1,
    waveKills: result.waveKills || {},
    logLen: ((Game.state || {}).waveKillLog || []).length,
    deaths: (result.samples && result.samples.deaths) || [],
    pop: (result.samples && result.samples.pop) || [],
    scale: (result.samples && result.samples.scale) || [],
    standing: (result.samples && result.samples.standing) || [],
  };
}

(async function () {
  reconcileLeg();
  await engineLeg();
  console.log('--- determinism + neutrality (' + DAYS + 'd, seed ' + SEED + ') ---');
  const a = await runRecorded(SEED, DAYS);
  const b = await runRecorded(SEED, DAYS);
  check('determinism: same seed twice with recorder -> identical daily rows', function () {
    assert.strictEqual(JSON.stringify(b.rows), JSON.stringify(a.rows), 'daily rows differ between identical runs');
  });
  check('determinism: same seed twice with recorder -> identical kill-time samples', function () {
    assert.strictEqual(JSON.stringify(b.killTimeSamples), JSON.stringify(a.killTimeSamples), 'kill-time samples differ between identical runs');
  });
  check('determinism: same seed twice with recorder -> identical kill calls', function () {
    assert.strictEqual(JSON.stringify(b.killCalls), JSON.stringify(a.killCalls), 'kill calls differ between identical runs');
  });
  check('determinism: same seed twice with recorder -> identical killers + reconciliation', function () {
    assert.strictEqual(JSON.stringify(b.killers), JSON.stringify(a.killers), 'killers differ between identical runs');
    assert.strictEqual(JSON.stringify(b.reconciliation), JSON.stringify(a.reconciliation), 'reconciliation differs between identical runs');
  });
  check('determinism: kill-time recorder reports no errors', function () {
    assert.strictEqual(a.recorderErrors.length, 0, JSON.stringify(a.recorderErrors));
    assert.strictEqual(b.recorderErrors.length, 0, JSON.stringify(b.recorderErrors));
  });
  check('determinism: same seed twice with recorder -> identical end fingerprint', function () {
    assert.strictEqual(JSON.stringify(fingerprint(b.result, b.Game)), JSON.stringify(fingerprint(a.result, a.Game)));
  });
  const plain = await runPlain(SEED, DAYS);
  check('neutrality: recorder vs plain competent -> identical trajectories', function () {
    const fa = fingerprint(a.result, a.Game);
    const fp = fingerprint(plain.result, plain.Game);
    assert.strictEqual(JSON.stringify(fp), JSON.stringify(fa), 'plain run diverges from recorded run');
  });
  console.log(failures === 0 ? 'ALL VETCOUNT-B PROOF LEGS PASS' : failures + ' LEG(S) FAILED');
  process.exitCode = failures === 0 ? 0 : 1;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
