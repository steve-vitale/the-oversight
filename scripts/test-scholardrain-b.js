// test-scholardrain-b.js — proof for the sim-scholardrain-b instrument.
// Proves the recorder (scripts/scholardrain-b-driver.js) and analyzer
// (scripts/scholardrain-b-analyze.js) without touching src/js:
//   1. CLASSIFICATION — synthetic corpora: veteran-day counted/succession/
//      death splits, days-to-seat (incl. scholar-at-kill = 0, never = null),
//      kills-made-as-scholar, ready-window closing by succession vs death
//      vs censored, and the kill LOG (not the waveKills counter) as the
//      killer source.
//   2. DETERMINISM — the same seed run twice with the recorder yields
//      byte-identical daily rows, kill-time samples, and scholar changes.
//   3. NEUTRALITY — the drain recorder does not change outcomes vs the
//      capstoneready recorder: same seed, identical trajectories AND
//      identical kill-time samples.
//   4. SUCCESSION ATTRIBUTION — live: every scholar change is
//      well-formed and every outgoing-dead change has a matching
//      scholar-death entry in the death telemetry.
// Writes nothing into the repo (all runs in-memory; live legs use
// throwaway seed 424242, never a scored band seed).
// Usage: node scripts/test-scholardrain-b.js
//   SCHOLARDRAIN_TEST_DAYS=30 node scripts/test-scholardrain-b.js (quick check)
'use strict';
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { snapshotLadder, summarize, wrapKillRecorder } = require(path.join(REPO, 'scripts', 'capstoneready-b-driver'));
const { runDrainSeed } = require(path.join(REPO, 'scripts', 'scholardrain-b-driver'));
const { analyzeSeed } = require(path.join(REPO, 'scripts', 'scholardrain-b-analyze'));

const DAYS = parseInt(process.env.SCHOLARDRAIN_TEST_DAYS || '30', 10) || 30;
const SEED = 424242;
let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ' — ' + e.message); }
}

function row(day, fates, ready, vets) {
  return {
    day: day, scholarId: 'S0', livingVeterans: (vets || []).length,
    deeds: { military_tribute: { ready: !!ready, reason: ready ? 'ready' : 'veterans-short' } },
    veterans: (vets || []).map(function (v) { return { vid: v, name: v }; }),
    killerFates: fates, errors: [],
  };
}
function fate(vid, firstKillDay, alive, isScholar, kills) {
  return { vid: vid, name: vid, kills: kills || 1, firstKillDay: firstKillDay, lastKillDay: firstKillDay, alive: alive, isScholar: isScholar };
}

// Corpus 1: veteran-day splits + days-to-seat + scholar kills.
// A: kills d10, scholar d12–d14, dies d15. B: kills d10 AS scholar, dies d11.
// C: kills d12, never scholar, alive to end. Rows d10–d16.
function corpus1() {
  const rows = [];
  for (let d = 10; d <= 16; d++) {
    const fates = [
      fate('A', 10, d < 15, d >= 12 && d <= 14, 1),
      fate('B', 10, d < 11, d === 10, 1),
    ];
    if (d >= 12) fates.push(fate('C', 12, true, false, 1));
    rows.push(row(d, fates, false, []));
  }
  return {
    seed: 1, resultDays: 16, endReason: 'test', won: false, maxWaveUnlocked: 4,
    waveKills: { 4: 1 }, // DELIBERATELY WRONG counter: the log has 3 killers; the analyzer must read the log
    teleDeaths: [
      { day: 11, kind: 'villager', who: 'B', cause: 'the wild', player: true },
      { day: 15, kind: 'villager', who: 'A', cause: 'the wild', player: true },
    ],
    killTimeSamples: [
      { day: 10, mid: 'm1', by: 'A', w: 4, via: 'wild', livingVeteransAtKill: 0, scholarIdAtKill: 'S0' },
      { day: 10, mid: 'm2', by: 'B', w: 4, via: 'wild', livingVeteransAtKill: 0, scholarIdAtKill: 'B' },
      { day: 12, mid: 'm3', by: 'C', w: 5, via: 'wild', livingVeteransAtKill: 1, scholarIdAtKill: 'S0' },
    ],
    scholarChanges: [{ day: 10, from: null, fromName: null, fromAlive: null, to: 'S0', toName: 'S0' }],
    daily: rows,
  };
}

// Corpus 2: ready-window closing (succession / death / censored) + turnover.
// X kills d1, scholar d5, dies d6. Y kills d1, alive throughout. Z kills d5,
// dies d7. W kills d8. Windows: ready d2–d4 (closed succession), ready d6
// (closed death), ready d8 (censored, open at end).
function corpus2() {
  const rows = [];
  const readyDays = { 2: true, 3: true, 4: true, 6: true, 8: true };
  const vetsByDay = {
    1: ['X', 'Y'], 2: ['X', 'Y'], 3: ['X', 'Y'], 4: ['X', 'Y'],
    5: ['Y', 'Z'], 6: ['Y', 'Z'], 7: ['Y'], 8: ['Y', 'W'],
  };
  for (let d = 1; d <= 8; d++) {
    const fates = [
      fate('X', 1, d < 6, d === 5, 1),
      fate('Y', 1, true, false, 1),
    ];
    if (d >= 5) fates.push(fate('Z', 5, d < 7, false, 1));
    if (d >= 8) fates.push(fate('W', 8, true, false, 1));
    rows.push(row(d, fates, !!readyDays[d], vetsByDay[d] || []));
  }
  return {
    seed: 2, resultDays: 8, endReason: 'test', won: false, maxWaveUnlocked: 4,
    waveKills: { 4: 4 },
    teleDeaths: [
      { day: 6, kind: 'villager', who: 'X', cause: 'the wild', player: true },
      { day: 7, kind: 'villager', who: 'Z', cause: 'monster', player: false },
    ],
    killTimeSamples: [
      { day: 1, mid: 'm1', by: 'X', w: 4, via: 'wild', livingVeteransAtKill: 0, scholarIdAtKill: 'S0' },
      { day: 1, mid: 'm2', by: 'Y', w: 4, via: 'wild', livingVeteransAtKill: 1, scholarIdAtKill: 'S0' },
      { day: 5, mid: 'm3', by: 'Z', w: 4, via: 'wild', livingVeteransAtKill: 1, scholarIdAtKill: 'S0' },
      { day: 8, mid: 'm4', by: 'W', w: 4, via: 'wild', livingVeteransAtKill: 2, scholarIdAtKill: 'S0' },
    ],
    scholarChanges: [
      { day: 1, from: null, fromName: null, fromAlive: null, to: 'S0', toName: 'S0' },
      { day: 5, from: 'S0', fromName: 'S0', fromAlive: true, to: 'X', toName: 'X' },
      { day: 6, from: 'X', fromName: 'X', fromAlive: false, to: 'Y', toName: 'Y' },
    ],
    daily: rows,
  };
}

function classificationLeg() {
  const a = analyzeSeed(corpus1());
  check('classify: veteran-day split counted/succession/death (A 2/3/2, B 0/1/6, C 5/0/0)', function () {
    assert.deepStrictEqual(a.veteranDays, { counted: 7, succession: 4, death: 8, unknown: 0 }, JSON.stringify(a.veteranDays));
    assert.strictEqual(a.killerCount, 3);
  });
  check('classify: killer list comes from the log, not the counter (counter says 1, log has 3)', function () {
    assert.strictEqual(a.killerCount, 3, 'counter {4:1} must not shrink the killer list');
    assert.deepStrictEqual(a.killers.map(function (k) { return k.vid; }).sort(), ['A', 'B', 'C']);
  });
  check('classify: days-to-seat (A 2, B 0 scholar-at-kill, C never)', function () {
    const byId = {};
    for (const k of a.killers) byId[k.vid] = k;
    assert.strictEqual(byId.A.daysToSeat, 2);
    assert.strictEqual(byId.B.daysToSeat, 0);
    assert.strictEqual(byId.B.scholarAtKill, true);
    assert.strictEqual(byId.C.daysToSeat, null);
    assert.strictEqual(byId.A.scholarAtKill, false);
  });
  check('classify: kills made as scholar 1/3', function () {
    assert.strictEqual(a.scholarKills.count, 1);
    assert.strictEqual(a.scholarKills.total, 3);
    assert.strictEqual(a.scholarKills.share, 0.333);
  });
  check('classify: killer death day + cause + as-scholar from death telemetry', function () {
    const byId = {};
    for (const k of a.killers) byId[k.vid] = k;
    assert.strictEqual(byId.A.deathDay, 15);
    assert.strictEqual(byId.A.deathCause, 'the wild');
    assert.strictEqual(byId.A.deathAsScholar, true);
    assert.strictEqual(byId.B.deathDay, 11);
    assert.strictEqual(byId.C.deathDay, null);
  });
  check('classify: primary metric names both drain numbers (succession 4, death 8)', function () {
    assert.strictEqual(a.named, true);
    assert.strictEqual(a.veteranDays.succession, 4);
    assert.strictEqual(a.veteranDays.death, 8);
    assert.strictEqual(a.successionShareOfLost, 0.333);
  });

  const b = analyzeSeed(corpus2());
  check('classify: ready window closed by succession names the scholar leaver', function () {
    assert.strictEqual(b.readyWindows.length, 3, JSON.stringify(b.readyWindows));
    const w1 = b.readyWindows[0];
    assert.strictEqual(w1.startDay, 2);
    assert.strictEqual(w1.endDay, 4);
    assert.strictEqual(w1.closedBy, 'succession', JSON.stringify(w1));
    assert.strictEqual(w1.leavers.length, 1);
    assert.strictEqual(w1.leavers[0].vid, 'X');
    assert.strictEqual(w1.leavers[0].cause, 'succession');
  });
  check('classify: ready window closed by death names the dead leaver', function () {
    const w2 = b.readyWindows[1];
    assert.strictEqual(w2.startDay, 6);
    assert.strictEqual(w2.endDay, 6);
    assert.strictEqual(w2.closedBy, 'death', JSON.stringify(w2));
    assert.strictEqual(w2.leavers[0].vid, 'Z');
    assert.strictEqual(w2.leavers[0].cause, 'death');
  });
  check('classify: ready window open at the last row is censored, not closed', function () {
    const w3 = b.readyWindows[2];
    assert.strictEqual(w3.startDay, 8);
    assert.strictEqual(w3.closedBy, 'censored');
    assert.strictEqual(b.censoredWindows, 1);
    assert.strictEqual(b.closedBySuccession, 1);
    assert.strictEqual(b.closedByDeath, 1);
  });
  check('classify: scholar turnover counts killer promotions (X then Y)', function () {
    assert.strictEqual(b.scholarChanges.successions, 2);
    assert.strictEqual(b.scholarChanges.promotedKiller, 2);
    assert.strictEqual(b.scholarChanges.promotedNonKiller, 0);
  });
  check('classify: no sample-vs-fate killer discrepancy on clean corpora', function () {
    assert.deepStrictEqual(a.sampleOnlyKillers, []);
    assert.deepStrictEqual(a.fateOnlyKillers, []);
    assert.deepStrictEqual(b.sampleOnlyKillers, []);
    assert.deepStrictEqual(b.fateOnlyKillers, []);
  });
  check('classify: corpus2 veteran-day totals (counted 15, succession 1, death 5)', function () {
    assert.deepStrictEqual(b.veteranDays, { counted: 15, succession: 1, death: 5, unknown: 0 }, JSON.stringify(b.veteranDays));
  });
}

async function runCapstoneRecorded(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'scholardrain-b-test', fullTelemetry: false });
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
  return { result: result, rows: rows, killTimeSamples: killTimeSamples, recorderErrors: recorderErrors, Game: Game };
}

function fingerprint(result, Game) {
  // Core trajectory only: fields both recorders store (the drain corpus
  // keeps deaths + scale, not pop/standing samples).
  return {
    days: result.days,
    gameDays: ((Game.state || {}).scholar || {}).day || 0,
    endReason: result.endReason,
    won: !!Game.won,
    maxWave: result.maxWaveUnlocked || 1,
    waveKills: result.waveKills || {},
    deaths: (result.samples && result.samples.deaths) || [],
    scale: (result.samples && result.samples.scale) || [],
  };
}

(async function () {
  classificationLeg();
  console.log('--- determinism + neutrality (' + DAYS + 'd, seed ' + SEED + ') ---');
  const a = await runDrainSeed(SEED, DAYS);
  const b = await runDrainSeed(SEED, DAYS);
  check('determinism: same seed twice with drain recorder -> identical daily rows', function () {
    assert.strictEqual(JSON.stringify(b.daily), JSON.stringify(a.daily), 'daily rows differ between identical runs');
  });
  check('determinism: same seed twice with drain recorder -> identical kill-time samples', function () {
    assert.strictEqual(JSON.stringify(b.killTimeSamples), JSON.stringify(a.killTimeSamples), 'kill-time samples differ between identical runs');
  });
  check('determinism: same seed twice with drain recorder -> identical scholar changes', function () {
    assert.strictEqual(JSON.stringify(b.scholarChanges), JSON.stringify(a.scholarChanges), 'scholar changes differ between identical runs');
  });
  check('determinism: drain recorder reports no errors', function () {
    assert.strictEqual(a.recorderErrors.length, 0, JSON.stringify(a.recorderErrors));
    assert.strictEqual(b.recorderErrors.length, 0, JSON.stringify(b.recorderErrors));
  });
  check('determinism: same seed twice with drain recorder -> identical end fingerprint', function () {
    assert.strictEqual(JSON.stringify({ days: b.resultDays, end: b.endReason, won: b.won, maxWave: b.maxWaveUnlocked, waveKills: b.waveKills }),
      JSON.stringify({ days: a.resultDays, end: a.endReason, won: a.won, maxWave: a.maxWaveUnlocked, waveKills: a.waveKills }));
  });
  const cap = await runCapstoneRecorded(SEED, DAYS);
  check('neutrality: drain recorder vs capstoneready recorder -> identical trajectories', function () {
    const fa = fingerprint({ days: a.resultDays, endReason: a.endReason, maxWaveUnlocked: a.maxWaveUnlocked, waveKills: a.waveKills, samples: { deaths: a.teleDeaths, scale: a.scaleTrajectory } }, { state: { scholar: { day: a.gameDays } }, won: a.won });
    const fp = fingerprint(cap.result, cap.Game);
    assert.strictEqual(JSON.stringify(fp), JSON.stringify(fa), 'trajectories diverge');
  });
  check('neutrality: drain recorder vs capstoneready recorder -> identical kill-time samples', function () {
    assert.strictEqual(JSON.stringify(cap.killTimeSamples), JSON.stringify(a.killTimeSamples), 'kill-time samples diverge between recorders');
  });
  check('neutrality: capstoneready recorder reports no errors on the same seed', function () {
    assert.strictEqual(cap.recorderErrors.length, 0, JSON.stringify(cap.recorderErrors));
  });
  check('succession attribution: every live scholar change is well-formed', function () {
    assert(a.scholarChanges.length > 0, 'expected at least the initial scholar event');
    assert.strictEqual(a.scholarChanges[0].from, null, 'first event must be the initial scholar');
    for (const c of a.scholarChanges.slice(1)) {
      assert(typeof c.fromAlive === 'boolean', 'fromAlive must be boolean, got ' + JSON.stringify(c));
      assert(typeof c.to === 'string' && c.to, 'to must be a scholar id: ' + JSON.stringify(c));
      assert(typeof c.toName === 'string' && c.toName, 'toName must be a name: ' + JSON.stringify(c));
    }
  });
  check('succession attribution: every outgoing-dead change matches a scholar-death in the death telemetry', function () {
    for (const c of a.scholarChanges.slice(1)) {
      if (c.fromAlive === false) {
        const hit = a.teleDeaths.find(function (d) { return d && d.kind === 'villager' && d.who === c.from && d.player === true; });
        assert(hit, 'no scholar-death telemetry for outgoing ' + c.from + ' on d' + c.day);
      }
    }
  });
  check('analyzer runs on the live corpus without discrepancy', function () {
    const r = analyzeSeed(a);
    assert.deepStrictEqual(r.sampleOnlyKillers, [], JSON.stringify(r.sampleOnlyKillers));
    assert.deepStrictEqual(r.fateOnlyKillers, [], JSON.stringify(r.fateOnlyKillers));
    assert.strictEqual(r.named, true);
  });
  console.log(failures === 0 ? 'ALL SCHOLARDRAIN-B PROOF LEGS PASS' : failures + ' LEG(S) FAILED');
  process.exitCode = failures === 0 ? 0 : 1;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
