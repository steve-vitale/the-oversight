// test-wave5face-b-20261116.js — proof for arm sim-wave5face-b (DIAG
// follow-up: seed 102706 released on the final day (d151) — does it
// face wave 5? run fleshout-loop-b-20261116T2230Z).
// NOTE ON THE NAME: the prereg names scripts/test-wave5face-b.js, but
// that path is already the proof for the LANDED 2026-11-09 wave5face arm
// (scripts/wave5face-driver-20261109.js / wave5face-analyze-20261109.js,
// 69/69 on its tip — a spawn-based facing instrument on band
// 99641-99648). Overwriting it would destroy that arm's runnable proof.
// This dated file is the same proof the prereg specifies (static checks
// + D1 + D2), for THIS arm's -20261116 driver/analyzer. The old proof
// is left untouched; see the evidence file's prior-art correction.
// Static checks (zero src/js diff; instrument reused by path; wraps
// named, incl. the new engagement wrap) + fixture tests (engagement
// outcome classification, facing reconciliation, pure-read faced set)
// + a standalone wrap-fires check (install the wrap on a loaded Game,
// call recordDeedFight directly, assert exactly one engagement per new
// wave-5 type and none for other waves) + live harness legs: smoke
// (1 seed, 30d, 0 instrument errors, every snapshot reconciles,
// engagements reconcile), D1 determinism (recorder ON twice, seed
// 102701, 60d, identical facing corpus incl. engagements), D2 neutrality
// (recorder ON vs OFF, seed 102701, 60d, identical daily signatures +
// wall fields).
// Usage: node scripts/test-wave5face-b-20261116.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'standing199-instrument-20261110'));
const DRIVER = require(path.join(REPO, 'scripts', 'wave5face-driver-20261116'));
const AN = require(path.join(REPO, 'scripts', 'wave5face-analyze-20261116'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; failures.push(name + (extra ? ' :: ' + extra : '')); console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function snap(o) {
  return Object.assign({
    day: 1, standing: { total: 0, war: 0, diplomacy: 0, plenty: 0 },
    capped: 0, gated: 0, peakWave: 0,
    readiness4: { ready: true, demand: { armored: 4, armed: 6, tricks: 3, veterans: 1 } },
    readiness5: { ready: true, demand: { armored: 4, armed: 6, tricks: 3, veterans: 2 } },
  }, o);
}

(async function () {
  // ---- static checks ----
  let srcDiff = '';
  try { srcDiff = execSync('git diff --stat HEAD -- src/', { cwd: REPO }).toString().trim(); } catch (e) { srcDiff = 'ERR:' + e.message; }
  check('static: zero src/ diff', srcDiff === '', srcDiff.slice(0, 200));
  check('static: instrument file exists (reused)', fs.existsSync(path.join(REPO, 'scripts', 'standing199-instrument-20261110.js')));
  check('static: driver file exists', fs.existsSync(path.join(REPO, 'scripts', 'wave5face-driver-20261116.js')));
  check('static: analyzer file exists', fs.existsSync(path.join(REPO, 'scripts', 'wave5face-analyze-20261116.js')));
  let untrackedSrc = '';
  try { untrackedSrc = execSync('git status --porcelain -- src/', { cwd: REPO }).toString().trim(); } catch (e) {}
  check('static: no uncommitted src/ changes', untrackedSrc === '', untrackedSrc.slice(0, 200));
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'wave5face-driver-20261116.js'), 'utf8');
  check('static: engagement wrap named (recordDeedFight)', /installFacingWrap/.test(driverSrc) && /Game\.recordDeedFight = function/.test(driverSrc), 'wrap install not found');
  check('static: wrap diffs the wave-5 faced set', /w5FacedIdsPure/.test(driverSrc) && /beforeSet\[mid\]/.test(driverSrc), 'faced-set diff not found');
  check('static: wrap resolves outcomes from the kill log', /classifyEngagements/.test(driverSrc) && /waveKillLog/.test(driverSrc), 'outcome resolution not found');
  check('static: wrap reconciles against waveEngaged(5)', /reconcileFacing/.test(driverSrc) && /waveEngaged\(5\)/.test(driverSrc), 'reconciliation not found');
  check('static: old 20261109 proof untouched', fs.existsSync(path.join(REPO, 'scripts', 'test-wave5face-b.js')) && fs.readFileSync(path.join(REPO, 'scripts', 'test-wave5face-b.js'), 'utf8').indexOf('wave5face-driver-20261109') !== -1, 'old proof missing or altered');

  // ---- w5FacedIdsPure fixtures (pure read, no initializer) ----
  const fakeGame = { state: { scholar: { prog: { deeds: { wavesFaced: { cancellation: 5, editor: 5, reunion: 4, hushpuppy: 1 } } } } } };
  check('w5FacedIdsPure: wave-5 keys only, sorted', JSON.stringify(DRIVER.w5FacedIdsPure(fakeGame)) === JSON.stringify(['cancellation', 'editor']), JSON.stringify(DRIVER.w5FacedIdsPure(fakeGame)));
  check('w5FacedIdsPure: missing prog reads empty', JSON.stringify(DRIVER.w5FacedIdsPure({ state: { scholar: {} } })) === '[]');
  check('w5FacedIdsPure: does not create prog', (function () { const g = { state: { scholar: {} } }; DRIVER.w5FacedIdsPure(g); return g.state.scholar.prog === undefined; })());

  // ---- classifyEngagements fixtures ----
  const killLog = [{ d: 102, mid: 'cancellation', w: 5, by: 'p' }, { d: 110, mid: 'editor', w: 5, by: 'v1' }];
  const deaths = [{ day: 105, kind: 'monster', who: 'x' }, { day: 105, kind: 'starvation', who: 'y' }, { day: 107, kind: 'wild', who: 'z' }];
  const engs = [
    { day: 102, mid: 'cancellation', outcome: null },
    { day: 105, mid: 'editor', outcome: null },
    { day: 107, mid: 'rerun', outcome: null },
    { day: 108, mid: 'spoiler', outcome: null },
  ];
  DRIVER.classifyEngagements(engs, killLog, deaths);
  check('classify: same-day kill of that type is killed', engs[0].outcome === 'killed', JSON.stringify(engs[0]));
  check('classify: later kill of that type is NOT this engagement', engs[1].outcome === 'died', JSON.stringify(engs[1]));
  check('classify: same-day combat death is died', engs[2].outcome === 'died' && engs[2].combatDeathsSameDay === 1, JSON.stringify(engs[2]));
  check('classify: no kill, no combat death is fled', engs[3].outcome === 'fled' && engs[3].combatDeathsSameDay === 0, JSON.stringify(engs[3]));
  const engsStarve = [{ day: 105, mid: 'nielsen', outcome: null }];
  DRIVER.classifyEngagements(engsStarve, [], [{ day: 105, kind: 'starvation', who: 'y' }]);
  check('classify: starvation death does not make died', engsStarve[0].outcome === 'fled', JSON.stringify(engsStarve[0]));

  // ---- reconcileFacing fixtures ----
  const fakeGame2 = {
    waveEngaged: function (w) { return w === 5 ? 2 : 0; },
    state: { scholar: { prog: { deeds: { wavesFaced: { cancellation: 5, editor: 5 } } } } },
  };
  const recOk = DRIVER.reconcileFacing([{ mid: 'cancellation' }, { mid: 'editor' }], fakeGame2);
  check('reconcile: matching set, no mismatch', recOk.mismatch === false && recOk.engagedCount === 2, JSON.stringify(recOk));
  const recCount = DRIVER.reconcileFacing([{ mid: 'cancellation' }], fakeGame2);
  check('reconcile: count mismatch detected', recCount.mismatch === true, JSON.stringify(recCount));
  const recIds = DRIVER.reconcileFacing([{ mid: 'cancellation' }, { mid: 'rerun' }], fakeGame2);
  check('reconcile: id-set mismatch detected', recIds.mismatch === true, JSON.stringify(recIds));

  // ---- holdKind sanity (reused instrument still classifies) ----
  check('holdKind: defer5 still classifies', INST.holdKind(snap({ standing: { total: 250, war: 250, diplomacy: 0, plenty: 0 }, capped: 250, gated: 199, peakWave: 4, readiness5: { ready: false, demand: { armored: 4, armed: 6, tricks: 3, veterans: 2 }, armored: 4, armed: 6, tricks: 5, veterans: 1 } })) === 'defer5');

  // ---- standalone wrap-fires check (loaded Game, direct calls) ----
  const { Game } = await loadGame({ seed: 102701, mode: 'competent-wave5face-b-test', fullTelemetry: false });
  await setupGame(Game);
  const wrap = DRIVER.installFacingWrap(Game);
  check('wrap-fires: install clean', wrap.errors.length === 0, JSON.stringify(wrap.errors));
  Game.recordDeedFight('cancellation');
  check('wrap-fires: one engagement for a new wave-5 type', wrap.engagements.length === 1 && wrap.engagements[0].mid === 'cancellation', JSON.stringify(wrap.engagements));
  check('wrap-fires: engagement carries day + standing + veterans', typeof wrap.engagements[0].day === 'number' && wrap.engagements[0].gated != null && typeof wrap.engagements[0].veterans === 'number', JSON.stringify(wrap.engagements[0]));
  Game.recordDeedFight('cancellation');
  check('wrap-fires: repeat fight vs the same type records nothing', wrap.engagements.length === 1, JSON.stringify(wrap.engagements));
  Game.recordDeedFight('reunion');
  check('wrap-fires: wave-4 type records nothing', wrap.engagements.length === 1, JSON.stringify(wrap.engagements));
  Game.recordDeedFight('editor');
  check('wrap-fires: second wave-5 type records a second engagement', wrap.engagements.length === 2 && wrap.engagements[1].mid === 'editor', JSON.stringify(wrap.engagements));
  const recLive = DRIVER.reconcileFacing(wrap.engagements, Game);
  check('wrap-fires: reconciles with waveEngaged(5)', recLive.mismatch === false && recLive.engagedCount === 2, JSON.stringify(recLive));
  wrap.uninstall();
  Game.recordDeedFight('rerun');
  check('wrap-fires: uninstall stops recording', wrap.engagements.length === 2, JSON.stringify(wrap.engagements));
  check('wrap-fires: deed feed still works after uninstall', DRIVER.w5FacedIdsPure(Game).length === 3, JSON.stringify(DRIVER.w5FacedIdsPure(Game)));

  // ---- live harness legs ----
  const SEED = 102701;
  // Smoke: 30d ON.
  const smoke = await DRIVER.oneRun(SEED, { days: 30, recorderOn: true });
  check('live smoke: 0 instrument errors', smoke.instrumentErrors.length === 0, JSON.stringify(smoke.instrumentErrors.slice(0, 3)));
  let reconErrs = 0, gatedMismatch = 0, snaps = 0;
  for (const s of (smoke.daily || [])) {
    if (!s.standing) continue;
    snaps++;
    const sum = (s.standing.war | 0) + (s.standing.diplomacy | 0) + (s.standing.plenty | 0);
    if (sum !== (s.standing.total | 0)) reconErrs++;
    if (s.capped != null) {
      const capSum = (s.standing.war | 0) + (s.standing.diplomacy | 0) + Math.min(s.standing.plenty | 0, 100);
      if (capSum !== (s.capped | 0)) reconErrs++;
    }
    const kind = INST.holdKind(s);
    if ((s.gated | 0) === 199 && kind !== 'cap' && kind !== 'defer5') gatedMismatch++;
  }
  check('live smoke: snapshots reconcile (raw + capped)', reconErrs === 0, reconErrs + ' errors over ' + snaps + ' snapshots');
  check('live smoke: gated==199 implies a 199-hold', gatedMismatch === 0, gatedMismatch + ' mismatches');
  check('live smoke: engagements reconcile with waveEngaged(5)', smoke.facingReconcile && smoke.facingReconcile.mismatch === false, JSON.stringify(smoke.facingReconcile));
  check('live smoke: w5 snapshot fields present', (smoke.daily || []).every(function (s) { return typeof s.w5facedCount === 'number' && Array.isArray(s.w5facedIds); }), 'missing w5 fields on some snapshot');
  check('live smoke: dailySig carries w5 fields', smoke.dailySig.length > 0 && smoke.dailySig.every(function (r) { return typeof r.w5facedCount === 'number' && Array.isArray(r.w5facedIds); }), 'sig ' + smoke.dailySig.length);

  // D1: ON twice, 60d, identical facing corpus.
  const d1a = await DRIVER.oneRun(SEED, { days: 60, recorderOn: true });
  const d1b = await DRIVER.oneRun(SEED, { days: 60, recorderOn: true });
  check('D1: identical daily arrays', JSON.stringify(d1a.daily) === JSON.stringify(d1b.daily));
  check('D1: identical dailySig', JSON.stringify(d1a.dailySig) === JSON.stringify(d1b.dailySig));
  check('D1: identical engagements', JSON.stringify(d1a.engagements) === JSON.stringify(d1b.engagements));
  check('D1: identical wall fields', d1a.days === d1b.days && d1a.standing === d1b.standing && d1a.standingRaw === d1b.standingRaw && d1a.scaleRank === d1b.scaleRank && d1a.maxWave === d1b.maxWave && d1a.w4kills === d1b.w4kills && d1a.w5kills === d1b.w5kills);

  // D2: ON vs OFF, 60d, identical signatures + wall fields.
  const d2off = await DRIVER.oneRun(SEED, { days: 60, recorderOn: false });
  const d2cmp = AN.compareLegs(d1a, d2off);
  check('D2: 0 divergences ON vs OFF (60d)', d2cmp.divergences === 0, JSON.stringify(d2cmp.errors.slice(0, 5)));

  console.log('\nwave5face-b proof: ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('FAILURES:\n' + failures.join('\n')); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
