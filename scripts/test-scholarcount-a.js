// test-scholarcount-a.js — proof for the sim-scholarcount-a fix
// (Steve RULED 2026-11-10 07:39 CST: the scholar is part of the village —
// their wave kills count toward the living-veteran bar, same as any
// villager's).
// Proves, before any scored seed:
//   1. SCHOLAR-COUNTS — a wave-4 kill by the current scholar counts in
//      _ladderLivingVeterans(4) and in ladderCapstoneReady
//      ('military_tribute'); the readiness return carries payable = the
//      non-scholar count. (RED before the fix: scholar excluded.)
//   2. DEAD-DOES-NOT — a kill by a dead villager does not count.
//   3. NON-VILLAGER-DOES-NOT — a kill by an unknown id, and a kill by a
//      living person who is not on the village roster, does not count.
//   4. PYRRHIC-SCHOLAR — a pyrrhic kill by the scholar counts the killer
//      as a veteran (identity) and moves NO counter (the steve-call
//      boundary stands).
//   5. WAVE-GATE-ALREADY — waveCombatReadiness(5) already counts the
//      scholar (standing.js isLiving returns true for scholarId); no
//      change there. (Already-true leg: passes at base too.)
//   6. DELIVERY — with scholar + 1 villager standing, readiness reads
//      ready but ladderDeliverCapstone honestly refuses with
//      'veterans-short' and records nothing; with 2 non-scholar
//      veterans it succeeds, removes exactly those two, and records
//      the capstone. The price (2 veterans leave) is unchanged.
//   7. LEGACY — the recorder's legacyLivingVeterans() reproduces the
//      OLD rule (scholar excluded) on a constructed log.
//   8. DETERMINISM — the same seed run twice with the scholarcount
//      recorder yields byte-identical daily rows, kill-time samples,
//      killers, and summaries.
//   9. NEUTRALITY — the recorder does not change outcomes: same seed,
//      recorder-wrapped competent vs plain competent, identical
//      trajectories (pop, scale, standing, deaths, wave kills, end
//      reason, log length).
// Writes nothing into the repo (all runs in-memory).
// Usage: node scripts/test-scholarcount-a.js
//   SCHOLARCOUNT_TEST_DAYS=30 node scripts/test-scholarcount-a.js (quick check)
'use strict';
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { snapshotLadder, wrapKillRecorder, buildKillers, legacyLivingVeterans } = require(path.join(REPO, 'scripts', 'scholarcount-a-driver'));

const DAYS = parseInt(process.env.SCHOLARCOUNT_TEST_DAYS || '30', 10) || 30;
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

async function engineLeg() {
  const { Game } = await loadGame({ seed: 424242, mode: 'scholarcount-a-engine', fullTelemetry: false });
  await setupGame(Game);
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) { return id && id !== Game.villagerId; });
  assert(roster.length >= 3, 'need >=3 non-scholar villagers, got ' + roster.length);
  const v1 = roster[0], v2 = roster[1], v3 = roster[2];
  const scholarId = Game.villagerId;
  assert(dataPerson(Game, v1) && !dataPerson(Game, v1).dead, 'v1 must start alive');
  assert(dataPerson(Game, v2) && !dataPerson(Game, v2).dead, 'v2 must start alive');
  assert(dataPerson(Game, v3) && !dataPerson(Game, v3).dead, 'v3 must start alive');
  Game.state.scholar.day = 10;
  Game.state.waveKillLog = [];
  Game.state.waveKills = {};
  Game.state.wave4Slain = 0;
  Game.state.waveKillByChannel = {};
  Game.state.villageSlain = {};

  check('scholar-counts: a wave-4 kill by the scholar counts as a veteran', function () {
    Game.state.waveKillLog = [{ by: scholarId, w: 4, d: 10, mid: 'congregation', via: 'player' }];
    assert.strictEqual(Game._ladderLivingVeterans(4), 1, 'scholar kill must count (the ruling)');
    const r = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(r.veterans, 1, JSON.stringify(r));
    assert.strictEqual(r.payable, 0, 'payable excludes the scholar: ' + JSON.stringify(r));
    assert.strictEqual(r.ready, false, '1 veteran is not ready for a 2-veteran tribute');
  });
  check('scholar-counts: scholar + 1 villager reads ready with payable 1', function () {
    Game.state.waveKillLog = [
      { by: scholarId, w: 4, d: 10, mid: 'congregation', via: 'player' },
      { by: v1, w: 4, d: 11, mid: 'strike', via: 'companion' },
    ];
    assert.strictEqual(Game._ladderLivingVeterans(4), 2, 'scholar + villager = 2 living veterans');
    const r = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(r.ready, true, JSON.stringify(r));
    assert.strictEqual(r.veterans, 2, JSON.stringify(r));
    assert.strictEqual(r.payable, 1, JSON.stringify(r));
  });
  check('dead-does-not: a kill by a dead villager does not count', function () {
    const rec = dataPerson(Game, v1);
    assert(rec, 'v1 must have a data record');
    rec.dead = true;
    try {
      Game.state.waveKillLog = [{ by: v1, w: 4, d: 10, mid: 'congregation', via: 'player' }];
      assert.strictEqual(Game._ladderLivingVeterans(4), 0, 'a dead killer is not a living veteran');
    } finally { rec.dead = false; }
  });
  check('non-villager-does-not: a kill by an unknown id does not count', function () {
    Game.state.waveKillLog = [{ by: 'not_a_villager_xyz', w: 4, d: 10, mid: 'congregation', via: 'player' }];
    assert.strictEqual(Game._ladderLivingVeterans(4), 0, 'an unknown killer is not a villager of this village');
  });
  check('non-villager-does-not: a kill by a living person off the roster does not count', function () {
    const fullRoster = (((Game.state || {}).village || {}).roster || []).slice();
    try {
      Game.state.village.roster = fullRoster.filter(function (id) { return id !== v3; });
      Game.state.waveKillLog = [{ by: v3, w: 4, d: 10, mid: 'congregation', via: 'player' }];
      assert.strictEqual(Game._ladderLivingVeterans(4), 0, 'a living person who is not on the roster is not a villager of this village');
    } finally { Game.state.village.roster = fullRoster; }
  });
  check('pyrrhic-scholar: a pyrrhic kill by the scholar counts as a veteran and moves no counter', function () {
    Game.state.waveKillLog = [];
    Game.state.waveKills = {};
    Game.state.wave4Slain = 0;
    Game.state.waveKillByChannel = {};
    Game.state.villageSlain = {};
    const beforeKills = JSON.parse(JSON.stringify(Game.state.waveKills));
    const beforeSlain = Game.state.wave4Slain;
    Game.recordPyrrhicKill('congregation', scholarId, 'player', null);
    assert.strictEqual(Game.state.waveKillLog.length, 1, JSON.stringify(Game.state.waveKillLog));
    assert.strictEqual(Game.state.waveKillLog[0].pyrrhic, true, JSON.stringify(Game.state.waveKillLog[0]));
    assert.deepStrictEqual(Game.state.waveKills, beforeKills, 'pyrrhic must not touch waveKills');
    assert.strictEqual(Game.state.wave4Slain, beforeSlain, 'pyrrhic must not touch wave4Slain');
    assert.strictEqual(Game._ladderLivingVeterans(4), 1, 'a pyrrhic scholar kill still makes a veteran');
  });
  check('wave-gate-already: waveCombatReadiness(5) already counts the scholar', function () {
    Game.state.waveKillLog = [{ by: scholarId, w: 4, d: 10, mid: 'congregation', via: 'player' }];
    const rd = Game.waveCombatReadiness(5);
    assert.strictEqual(rd.veterans, 1, 'the wave-5 readiness bar already counts scholar kills: ' + JSON.stringify(rd));
  });
  check('legacy: legacyLivingVeterans reproduces the old rule on a constructed log', function () {
    Game.state.waveKillLog = [
      { by: scholarId, w: 4, d: 10, mid: 'congregation', via: 'player' },
      { by: v1, w: 4, d: 11, mid: 'strike', via: 'companion' },
    ];
    assert.strictEqual(Game._ladderLivingVeterans(4), 2, 'new rule counts both');
    assert.strictEqual(legacyLivingVeterans(Game), 1, 'old rule counts only the non-scholar');
  });
  check('delivery: scholar + 1 villager reads ready but delivery honestly refuses', function () {
    Game.state.waveKillLog = [
      { by: scholarId, w: 4, d: 10, mid: 'congregation', via: 'player' },
      { by: v1, w: 4, d: 11, mid: 'strike', via: 'companion' },
    ];
    // RED before the fix: readiness itself says not-ready (scholar
    // excluded), so the refusal would come from the readiness re-check,
    // not from the payment selection. GREEN: readiness says ready
    // (veterans 2, payable 1) and the refusal comes from delivery.
    const ready = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(ready.ready, true, JSON.stringify(ready));
    assert.strictEqual(ready.veterans, 2, JSON.stringify(ready));
    assert.strictEqual(ready.payable, 1, JSON.stringify(ready));
    const rosterBefore = (((Game.state || {}).village || {}).roster || []).slice();
    const r = Game.ladderDeliverCapstone('military_tribute');
    assert.strictEqual(r.ok, false, JSON.stringify(r));
    assert.strictEqual(r.reason, 'veterans-short', JSON.stringify(r));
    assert.deepStrictEqual((((Game.state || {}).village || {}).roster || []).slice(), rosterBefore, 'a refused delivery removes nobody');
    const pg = (typeof Game.progState === 'function') ? Game.progState() : null;
    assert(!pg || !pg.ladderCapstone, 'a refused delivery records nothing');
  });
  check('delivery: 2 non-scholar veterans pay the tribute and are recorded', function () {
    Game.state.waveKillLog = [
      { by: scholarId, w: 4, d: 10, mid: 'congregation', via: 'player' },
      { by: v1, w: 4, d: 11, mid: 'strike', via: 'companion' },
      { by: v2, w: 4, d: 12, mid: 'eulogy', via: 'companion' },
    ];
    const r = Game.ladderDeliverCapstone('military_tribute');
    assert.strictEqual(r.ok, true, JSON.stringify(r));
    assert.deepStrictEqual(r.veterans, [v1, v2], 'the payment takes the two non-scholar veterans, in log order: ' + JSON.stringify(r));
    const rosterAfter = ((Game.state || {}).village || {}).roster || [];
    assert(rosterAfter.indexOf(v1) < 0 && rosterAfter.indexOf(v2) < 0, 'both paid veterans leave the roster');
    assert(rosterAfter.indexOf(scholarId) >= 0, 'the scholar stays — the scholar is never paid');
    const pg = (typeof Game.progState === 'function') ? Game.progState() : null;
    assert(pg && pg.ladderCapstone === 'military_tribute', 'the delivery is recorded');
  });
}

async function runRecorded(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'scholarcount-a-test', fullTelemetry: false });
  const rows = [];
  const killTimeSamples = [];
  const recorderErrors = [];
  let lastSnapDay = -1;
  await setupGame(Game);
  wrapKillRecorder(Game, killTimeSamples, recorderErrors);
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
    result: result, rows: rows, killTimeSamples: killTimeSamples,
    killers: buildKillers(Game, rows),
    recorderErrors: recorderErrors, Game: Game,
  };
}

async function runPlain(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'scholarcount-a-test', fullTelemetry: false });
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
  check('determinism: same seed twice with recorder -> identical killers', function () {
    assert.strictEqual(JSON.stringify(b.killers), JSON.stringify(a.killers), 'killers differ between identical runs');
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
  console.log(failures === 0 ? 'ALL SCHOLARCOUNT-A PROOF LEGS PASS' : failures + ' LEG(S) FAILED');
  process.exitCode = failures === 0 ? 0 : 1;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
