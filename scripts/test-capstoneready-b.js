// test-capstoneready-b.js — proof for the sim-capstoneready-b instrument.
// Proves the recorder (scripts/capstoneready-b-driver.js) without touching src/js:
//   1. CLASSIFICATION — ladderCapstoneReady branches on constructed states,
//      and snapshotLadder reports the same readiness + veteran identities.
//   2. DETERMINISM — the same seed run twice with the recorder yields
//      byte-identical daily rows and end state.
//   3. NEUTRALITY — the recorder does not change outcomes: same seed,
//      recorder-wrapped competent vs plain competent, identical trajectories
//      (pop, scale, standing, deaths, wave kills, end reason).
// Re-measure revision: also proves (a) scholarId is recorded per daily row,
// (b) kill-time sampling via wrapKillRecorder (recordWaveKill /
// recordPyrrhicKill wrappers record livingVeteransAtKill at the moment each
// new waveKillLog entry lands, dedupe adds no sample), (c) summarize()
// per-deed blockers, and (d) backward compatibility: old-corpus rows (no
// scholarId / kill-time fields) still summarize and analyze.
// Writes nothing into the repo (all runs in-memory).
// Usage: node scripts/test-capstoneready-b.js
//   CAPSTONE_TEST_DAYS=30 node scripts/test-capstoneready-b.js  (quick check)
'use strict';
const assert = require('assert');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { snapshotLadder, summarize, wrapKillRecorder } = require(path.join(REPO, 'scripts', 'capstoneready-b-driver'));

const DAYS = parseInt(process.env.CAPSTONE_TEST_DAYS || '150', 10) || 150;
const SEED = 140101;
let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ' — ' + e.message); }
}
function dataPerson(Game, vid) {
  return ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; })
    || ((Game.data || {}).background_survivors || []).find(function (x) { return x && x.id === vid; }) || null;
}

async function classificationLeg() {
  const { Game } = await loadGame({ seed: 424242, mode: 'capstoneready-b-classification', fullTelemetry: false });
  await setupGame(Game);
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) { return id && id !== Game.villagerId; });
  assert(roster.length >= 2, 'need >=2 non-scholar villagers, got ' + roster.length);
  const v1 = roster[0], v2 = roster[1];
  assert(dataPerson(Game, v1) && !dataPerson(Game, v1).dead, 'v1 must start alive');
  assert(dataPerson(Game, v2) && !dataPerson(Game, v2).dead, 'v2 must start alive');
  const savedLog = Game.state.waveKillLog;
  const savedFeast = Game.state.feastLog;
  const savedNational = Game.state.nationalLive;

  // --- military_tribute ---
  check('classify: military ready with 2 living non-scholar w4 veterans', function () {
    Game.state.waveKillLog = [{ by: v1, w: 4, d: 10 }, { by: v2, w: 4, d: 12 }];
    const r = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(r.ready, true, JSON.stringify(r));
    assert.strictEqual(r.veterans, 2);
    assert.strictEqual(r.reason, 'ready');
  });
  check('classify: military not ready with 1 veteran', function () {
    Game.state.waveKillLog = [{ by: v1, w: 4, d: 10 }];
    const r = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.reason, 'veterans-short');
    assert.strictEqual(r.veterans, 1);
  });
  check('classify: scholar kills never count as veterans', function () {
    Game.state.waveKillLog = [{ by: Game.villagerId, w: 4, d: 10 }, { by: Game.villagerId, w: 5, d: 11 }];
    const r = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.veterans, 0, JSON.stringify(r));
  });
  check('classify: wave-3 kills do not make wave-4 veterans', function () {
    Game.state.waveKillLog = [{ by: v1, w: 3, d: 10 }, { by: v2, w: 3, d: 12 }];
    const r = Game.ladderCapstoneReady('military_tribute');
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.veterans, 0);
  });
  check('recorder: snapshot names both living veterans, count agrees with _ladderLivingVeterans', function () {
    Game.state.waveKillLog = [{ by: v1, w: 4, d: 10 }, { by: v2, w: 4, d: 12 }, { by: v2, w: 5, d: 20 }];
    const row = snapshotLadder(Game);
    assert.strictEqual(row.deeds.military_tribute.ready, true, JSON.stringify(row.deeds.military_tribute));
    assert.strictEqual(row.livingVeterans, 2);
    assert.strictEqual(row.livingVeterans, Game._ladderLivingVeterans(4));
    assert.strictEqual(row.veterans.length, 2);
    const names = row.veterans.map(function (v) { return v.vid; }).sort();
    assert.deepStrictEqual(names, [v1, v2].sort());
    for (const v of row.veterans) assert.strictEqual(v.alive, true, v.vid + ' should read alive');
    const vv2 = row.veterans.find(function (v) { return v.vid === v2; });
    assert.deepStrictEqual(vv2.waves, [4, 5]);
  });
  check('recorder: daily row records the current scholarId', function () {
    const row = snapshotLadder(Game);
    assert.strictEqual(row.scholarId, Game.villagerId, 'scholarId should be the current scholar');
  });
  check('recorder: kill-time sampling records livingVeteransAtKill at each new kill', function () {
    const samples = [];
    const errors = [];
    const origRWK = Game.recordWaveKill;
    const origRPK = Game.recordPyrrhicKill;
    const installed = wrapKillRecorder(Game, samples, errors);
    assert(installed && installed.recordWaveKill, 'recordWaveKill wrapper should install');
    assert.strictEqual(errors.length, 0, JSON.stringify(errors));
    const priorLog = Game.state.waveKillLog;
    Game.state.waveKillLog = [];
    Game.recordWaveKill('congregation', v1, 'test', null);
    assert.strictEqual(samples.length, 1, JSON.stringify(samples));
    assert.strictEqual(samples[0].by, v1);
    assert.strictEqual(samples[0].w, 4, JSON.stringify(samples[0]));
    assert.strictEqual(samples[0].livingVeteransAtKill, 1, JSON.stringify(samples[0]));
    assert.strictEqual(samples[0].scholarIdAtKill, Game.villagerId);
    Game.recordWaveKill('strike', v2, 'test', null);
    assert.strictEqual(samples.length, 2, JSON.stringify(samples));
    assert.strictEqual(samples[1].livingVeteransAtKill, 2, JSON.stringify(samples[1]));
    // Same-day exact repeat is recordWaveKill's dedupe: no new log entry,
    // so no new kill-time sample.
    Game.recordWaveKill('congregation', v1, 'test', null);
    assert.strictEqual(samples.length, 2, 'dedupe repeat must not sample: ' + JSON.stringify(samples));
    assert.strictEqual(errors.length, 0, JSON.stringify(errors));
    // Restore the unwrapped methods for the rest of the leg.
    if (origRWK) Game.recordWaveKill = origRWK;
    if (origRPK) Game.recordPyrrhicKill = origRPK;
    Game.state.waveKillLog = priorLog;
  });
  check('recorder: a veteran death drops the count and the deed to veterans-short', function () {
    const p = dataPerson(Game, v2);
    p.dead = true;
    try {
      const row = snapshotLadder(Game);
      assert.strictEqual(row.livingVeterans, 1, JSON.stringify(row.veterans));
      assert.strictEqual(row.deeds.military_tribute.ready, false);
      assert.strictEqual(row.deeds.military_tribute.reason, 'veterans-short');
      const dead = row.veterans.find(function (v) { return v.vid === v2; });
      assert.strictEqual(dead.alive, false);
    } finally { p.dead = false; }
  });

  // --- trade_charter ---
  const mship = Game.mshipState();
  assert(mship && Array.isArray(mship.links), 'mshipState().links must exist');
  const savedLinks = mship.links.slice();
  check('classify: trade ready with sealed charter + national scale', function () {
    mship.links.push({ status: 'active', kind: 'trade', chartered: true });
    Game.state.nationalLive = true;
    const r = Game.ladderCapstoneReady('trade_charter');
    assert.strictEqual(r.ready, true, JSON.stringify(r));
    assert.strictEqual(r.charteredLinks, 1);
    assert.strictEqual(r.scale, 'national');
  });
  check('classify: trade scale-short with charter but village scale', function () {
    Game.state.nationalLive = false;
    const r = Game.ladderCapstoneReady('trade_charter');
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.reason, 'scale-short');
  });
  check('classify: trade no-sealed-charter without a chartered link', function () {
    mship.links.length = 0;
    Game.state.nationalLive = true;
    const r = Game.ladderCapstoneReady('trade_charter');
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.reason, 'no-sealed-charter');
  });
  mship.links.length = 0;
  Array.prototype.push.apply(mship.links, savedLinks);
  Game.state.nationalLive = savedNational;

  // --- feast_embassy ---
  const realLadderStage = Game.ladderStage;
  check('classify: feast ready with bundle + National stage', function () {
    Game.state.feastLog = [{ bundle: true, bundleStage: 3 }];
    Game.ladderStage = function () { return 3; };
    try {
      const r = Game.ladderCapstoneReady('feast_embassy');
      assert.strictEqual(r.ready, true, JSON.stringify(r));
      assert.strictEqual(r.bundle, true);
      assert.strictEqual(r.stage, 3);
    } finally { Game.ladderStage = realLadderStage; }
  });
  check('classify: feast stage-short with bundle below National', function () {
    Game.state.feastLog = [{ bundle: true, bundleStage: 3 }];
    const r = Game.ladderCapstoneReady('feast_embassy');
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.reason, 'stage-short', JSON.stringify(r));
    assert.strictEqual(r.bundle, true);
  });
  check('classify: feast no-bundle-feast without the flag', function () {
    Game.state.feastLog = [];
    const r = Game.ladderCapstoneReady('feast_embassy');
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.reason, 'no-bundle-feast');
  });
  Game.state.feastLog = savedFeast;
  Game.state.waveKillLog = savedLog;

  // --- summarize() math ---
  check('summarize: dominant blocker named at >=50% share', function () {
    const rows = [];
    for (let d = 1; d <= 10; d++) {
      rows.push({ day: d, livingVeterans: 0, ladder: { stage: 0 }, scaleRank: 'village', delivered: null,
        deeds: {
          military_tribute: { ready: false, reason: 'veterans-short' },
          trade_charter: { ready: false, reason: d <= 6 ? 'veterans-short' : 'no-sealed-charter' },
          feast_embassy: { ready: false, reason: 'no-bundle-feast' },
        } });
    }
    const s = summarize(rows);
    // veterans-short: 10 (military) + 6 (trade) = 16 of 30 blocked deed-days
    assert.strictEqual(s.bindingBlocker, 'veterans-short');
    assert(s.bindingBlockerShare >= 0.5, 'share ' + s.bindingBlockerShare);
    assert.strictEqual(s.bindingBlockerNamed, true);
  });
  check('summarize: tied thirds not named', function () {
    const rows = [];
    for (let d = 1; d <= 3; d++) {
      rows.push({ day: d, livingVeterans: 0, ladder: { stage: 0 }, scaleRank: 'village', delivered: null,
        deeds: {
          military_tribute: { ready: false, reason: 'veterans-short' },
          trade_charter: { ready: false, reason: 'no-sealed-charter' },
          feast_embassy: { ready: false, reason: 'no-bundle-feast' },
        } });
    }
    const s = summarize(rows);
    assert.strictEqual(s.bindingBlockerNamed, false, 'share ' + s.bindingBlockerShare);
  });
  check('summarize: per-deed blockers name the modal reason per deed (old-corpus rows without scholarId still summarize)', function () {
    const rows = [];
    for (let d = 1; d <= 10; d++) {
      rows.push({ day: d, livingVeterans: 0, ladder: { stage: 0 }, scaleRank: 'village', delivered: null,
        deeds: {
          military_tribute: { ready: false, reason: 'veterans-short' },
          trade_charter: { ready: false, reason: d <= 6 ? 'veterans-short' : 'no-sealed-charter' },
          feast_embassy: { ready: false, reason: 'no-bundle-feast' },
        } });
    }
    const s = summarize(rows);
    assert.strictEqual(s.perDeedBlocker.military_tribute.blocker, 'veterans-short');
    assert.strictEqual(s.perDeedBlocker.military_tribute.share, 1);
    assert.strictEqual(s.perDeedBlocker.military_tribute.named, true);
    assert.strictEqual(s.perDeedBlocker.trade_charter.blocker, 'veterans-short');
    assert.strictEqual(s.perDeedBlocker.trade_charter.share, 0.6);
    assert.strictEqual(s.perDeedBlocker.trade_charter.named, true);
    assert.strictEqual(s.perDeedBlocker.feast_embassy.blocker, 'no-bundle-feast');
    assert.strictEqual(s.perDeedBlocker.feast_embassy.named, true);
  });
  check('summarize: per-deed blocker is not named below a 50% modal share, and unblocked deeds count named-vacuous', function () {
    const rows = [];
    for (let d = 1; d <= 5; d++) {
      rows.push({ day: d, livingVeterans: 0, ladder: { stage: 0 }, scaleRank: 'village', delivered: null,
        deeds: {
          military_tribute: { ready: false, reason: d <= 2 ? 'veterans-short' : (d <= 4 ? 'read-error' : 'unknown-capstone') },
          trade_charter: { ready: true, reason: 'ready' },
          feast_embassy: { ready: false, reason: 'no-bundle-feast' },
        } });
    }
    const s = summarize(rows);
    assert.strictEqual(s.perDeedBlocker.military_tribute.share, 0.4, 'share ' + s.perDeedBlocker.military_tribute.share);
    assert.strictEqual(s.perDeedBlocker.military_tribute.named, false, 'share ' + s.perDeedBlocker.military_tribute.share);
    assert.strictEqual(s.perDeedBlocker.trade_charter.blockedDays, 0);
    assert.strictEqual(s.perDeedBlocker.trade_charter.blocker, null);
    assert.strictEqual(s.perDeedBlocker.trade_charter.named, true);
  });
}

async function runRecorded(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'capstoneready-b-test', fullTelemetry: false });
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

async function runPlain(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'capstoneready-b-test', fullTelemetry: false });
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
    deaths: (result.samples && result.samples.deaths) || [],
    pop: (result.samples && result.samples.pop) || [],
    scale: (result.samples && result.samples.scale) || [],
    standing: (result.samples && result.samples.standing) || [],
  };
}

(async function () {
  await classificationLeg();
  console.log('--- determinism + neutrality (' + DAYS + 'd, seed ' + SEED + ') ---');
  const a = await runRecorded(SEED, DAYS);
  const b = await runRecorded(SEED, DAYS);
  check('determinism: same seed twice with recorder -> identical daily rows', function () {
    assert.strictEqual(JSON.stringify(b.rows), JSON.stringify(a.rows), 'daily rows differ between identical runs');
  });
  check('determinism: same seed twice with recorder -> identical kill-time samples', function () {
    assert.strictEqual(JSON.stringify(b.killTimeSamples), JSON.stringify(a.killTimeSamples), 'kill-time samples differ between identical runs');
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
  console.log(failures === 0 ? 'ALL CAPSTONEREADY-B PROOF LEGS PASS' : failures + ' LEG(S) FAILED');
  process.exitCode = failures === 0 ? 0 : 1;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
