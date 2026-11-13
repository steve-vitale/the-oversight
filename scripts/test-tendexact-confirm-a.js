#!/usr/bin/env node
// test-tendexact-confirm-a.js — proof test for the tendexact
// fresh-seed confirm (arm sim-tendexact-confirm-a).
//
// THE QUESTION (evidence/2026-11-13/sim-tendexact-confirm-a-prereg.md):
// the tendexact re-derivation (e6911eb80) re-derived the healthy pole
// BY COUNT on the matched band 190391-190398 (5/8 vs far end 4/8).
// Does the +1 generalize OFF the matched band? This arm runs the far
// end 203a32775 + fix swap (baseline leg, no candidate) against the
// far end + fix swap + tendexact (tendexact leg) on FRESH seeds
// 190401-190408, 150d death-aware, competent verbatim, mode fix only.
// GO bar (all conjunctive): tendexact survives >= baseline+1 AND
// >=5/8, median >= 0.8x baseline median, starvation <= baseline+2
// -> GENERALIZES; otherwise -> NO-GO. Instrument-only: ZERO src/js
// changes committed.
//
// THE FIX-SWAP: this base predates the r131 roster-check fix, so
// src/js/standing.js on disk is the PRE-FIX version (sha256
// 75762cb2259d...). The fix standing.js (sha256 f8fda4295a99...,
// from `git show 5157782a4:src/js/standing.js`) is swapped in
// UNCOMMITTED for the run and restored byte-identical afterwards.
// The driver refuses to run unless the on-disk standing.js carries
// the "ROSTER CHECK" marker AND its sha256 is exactly the fix sha.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Instrument validity — the reused vetfirst instrument + the
//      engine's own readiness read agree on a living veteran AND on
//      a TB-fallen veteran (death day + day after), on the current
//      tree with the fix swapped in. If the instrument lied, the
//      legs would be uninterpretable. BASE DIFFERENCE (real,
//      not a test bug): ladder.js at this base has NO
//      countLivingVeterans — its _ladderLivingVeterans is the old
//      inline rule (vp && !vp.dead, no roster check), while
//      5157782a4/master use the shared countLivingVeterans (roster
//      check + scholar counts, commit 3995d21d6). At THIS base
//      (203a32775) the ladder is the old inline rule (vp && !vp.dead,
//      no roster check) with the LEG 3 tribute scholar-readiness fix
//      layered on: the scholar is NEVER counted
//      (`vid === this.villagerId) return false`). So after a TB fall
//      the ladder still reads 1 (the vp record is not marked dead by
//      tbVillagerFalls) while the swapped-in readiness gate and the
//      instrument read 0 — and a scholar kill reads 1 in readiness /
//      instrument but 0 in the ladder on THIS base. The test detects
//      BOTH rules the LOADED game carries (roster check + scholar
//      rule, from _ladderLivingVeterans source) and asserts the
//      matching count on either base; the survival read comes from
//      the harness end state, not the ladder.
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190401–190408, the FRESH band (0 hits in all preregs,
//      evidence md, scripts, docs — see the prereg). A leg on the
//      wrong seeds answers nothing.
//   3. Driver leg guard (swap-aware) — legGuard accepts the swapped
//      fix text (marker + exact fix sha f8fda4295a99, read from the
//      pinned vetphantom commit, never live disk) and refuses the
//      pre-fix far-end text (no marker, sha 75762cb2259d); the driver
//      refuses a wrong-sha swap at run entry (proven by a real
//      subprocess run against a scratch repo) and never runs its
//      main loop when required as a module.
//   4. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing seed
//      on a partial one.
//   1b. Scholar-count rule — a scholar wave-3 kill reads 1 in the
//      swapped-in readiness gate and the instrument, and the ladder
//      count matches whichever scholar rule the loaded game carries
//      (0 under this base's LEG 3 never-counts rule, 1 elsewhere).
//   5. Survival read + GO bar — analyzeRows counts survivors from
//      the per-seed villageLost flag and counts starvation deaths
//      from the per-seed death records; the judge maps
//      (baseline, tendexact) pairs to the prereg verdict under the
//      full conjunctive GO bar (GENERALIZES vs NO-GO), plus the
//      pre-registered rank read (regional reach: >=5
//      REGIONAL_INTACT, <=2 RANK_STALL, 3–4 RANK_INCONCLUSIVE).
//   6. Candidate guard — the tendexact marker string is present in
//      the healthy pole's file text (git show 5157782a4) and absent
//      from the far end's (git show 203a32775), and the guard
//      accepts the first and refuses the second; the baseline leg
//      is a no-candidate pass; an unknown leg is refused.
//
// Usage: node scripts/test-tendexact-confirm-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./tendexact-confirm-analyze-20261113');
const DR = require('./tendexact-confirm-driver-20261113');
const T = K.reporter('tendexact-confirm-a');

function counts(Game) {
  let r4 = -1, l3 = -1, i3 = -1;
  try { r4 = (Game.waveCombatReadiness(4) || {}).veterans; } catch (e) { r4 = 'ERR:' + (e && e.message); }
  try { l3 = Game._ladderLivingVeterans(3); } catch (e) { l3 = 'ERR:' + (e && e.message); }
  try { i3 = VF.livingVeterans(Game, 3, {}).count; } catch (e) { i3 = 'ERR:' + (e && e.message); }
  return { r4, l3, i3 };
}
function fmt(c) { return 'r4=' + c.r4 + ' l3=' + c.l3 + ' i3=' + c.i3; }
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  const Game = await K.load({ seed: 131101 });

  function fresh() {
    K.newRun(Game);
    Game.state.waveKillLog = Game.state.waveKillLog || [];
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(function (v) { return v && v !== scholarId; });
    if (others.length < 1) throw new Error('fresh run has <1 non-scholar roster member');
    return { vidA: others[0], scholarId: scholarId };
  }
  function giveKill(vid, w) {
    Game.state.waveKillLog.push({ by: vid, w: w, day: gday(Game) || 1 });
  }
  function onRoster(vid) { return ((Game.state.village || {}).roster || []).includes(vid); }

  async function advanceOneDay() {
    const d0 = gday(Game);
    try {
      await H.quietLog(async function () { await H.runDays(Game, competent, { days: 1 }); });
    } catch (e) { return { day: gday(Game), error: String((e && e.message) || e).slice(0, 120) }; }
    return { day: gday(Game), from: d0, error: null };
  }

  // ---- 1. Instrument validity: three-way agreement, alive + fallen ----
  T.section('1. Instrument validity — engine vs ladder vs instrument (fix swapped in)');
  // LADDER RULE (hermetic, sim-findings-a 2026-11-11): the loaded
  // _ladderLivingVeterans is either the shared countLivingVeterans
  // rule (roster check — master) or the old inline rule (vp.dead
  // only, no roster check — this base and the d229b58f5 merge-base).
  // The fallen killer counts 0 under the first, 1 under the second.
  // SCHOLAR RULE (this base's LEG 3 layer): the old inline rule here
  // NEVER counts the scholar (`vid === this.villagerId) return
  // false`), while the merge-base old rule counted the scholar as
  // always living and the shared rule counts the scholar too. Detect
  // both from the LOADED function source, never from disk — the test
  // asserts the behavior of the code it actually runs, on either base.
  const ladderSrc = String(Game._ladderLivingVeterans);
  const ladderRosterCheck = ladderSrc.indexOf('countLivingVeterans') !== -1;
  const ladderAfterFall = ladderRosterCheck ? 0 : 1;
  const ladderScholarExcluded = ladderSrc.indexOf('vid === this.villagerId) return false') !== -1;
  const ladderScholarKill = ladderScholarExcluded ? 0 : 1;
  let f = fresh();
  giveKill(f.vidA, 3);
  let c = counts(Game);
  T.ok('alive w3 killer: readiness(4) = 1', c.r4 === 1, fmt(c));
  T.ok('alive w3 killer: ladder(3) = 1', c.l3 === 1, fmt(c));
  T.ok('alive w3 killer: instrument(3) = 1', c.i3 === 1, fmt(c));
  const deathDay = gday(Game);
  Game.tbVillagerFalls({ villagerId: f.vidA });
  T.ok('TB fall removes the villager from the roster', !onRoster(f.vidA), 'roster len ' + ((Game.state.village || {}).roster || []).length);
  c = counts(Game);
  T.ok('death day: readiness(4) = 0 (no phantom with the fix swapped in)', c.r4 === 0, fmt(c));
  T.ok('death day: ladder(3) = ' + ladderAfterFall + (ladderRosterCheck ? ' (roster-check rule: fallen killer not counted)' : ' (OLD ladder rule at this base: no roster check)'), c.l3 === ladderAfterFall, fmt(c));
  T.ok('death day: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('death day: engine + instrument agree' + (ladderRosterCheck ? ' (ladder agrees too)' : ' (ladder diverges by its old rule)'), c.r4 === 0 && c.i3 === 0, fmt(c));
  const adv = await advanceOneDay();
  T.ok('day advanced by one', adv.error === null && adv.day === deathDay + 1,
    'from d' + deathDay + ' to d' + adv.day + (adv.error ? ' err=' + adv.error : ''));
  c = counts(Game);
  T.ok('day after: readiness(4) = 0 (phantom does not reappear)', c.r4 === 0, fmt(c));
  T.ok('day after: ladder(3) = ' + ladderAfterFall + (ladderRosterCheck ? ' (roster-check rule still excludes the fallen killer)' : ' (old ladder rule still counts the fallen killer)'), c.l3 === ladderAfterFall, fmt(c));
  T.ok('day after: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('day after: engine + instrument agree' + (ladderRosterCheck ? ' (ladder agrees too)' : ' (ladder diverges by its old rule)'), c.r4 === 0 && c.i3 === 0, fmt(c));

  // ---- 1b. Scholar-count rule — the loaded ladder's own rule ----
  // Steve 2026-10-10: the scholar counts as a villager for the
  // living-veteran bar. The swapped-in readiness gate counts the
  // scholar (fix standing.js: `vid === scholarId) return true`) and
  // the instrument counts the scholar as living. The LADDER on this
  // base does NOT (LEG 3): a scholar wave-3 kill reads 1 in
  // readiness/instrument and 0 in the ladder. Assert the matching
  // count for whichever rule the loaded game carries.
  f = fresh();
  giveKill(f.scholarId, 3);
  c = counts(Game);
  T.ok('scholar w3 killer: readiness(4) = 1 (scholar counts)', c.r4 === 1, fmt(c));
  T.ok('scholar w3 killer: instrument(3) = 1 (scholar counts)', c.i3 === 1, fmt(c));
  T.ok('scholar w3 killer: ladder(3) = ' + ladderScholarKill + (ladderScholarExcluded ? ' (LEG 3 rule at this base: scholar never counted)' : ' (scholar counts under this ladder rule)'), c.l3 === ladderScholarKill, fmt(c));

  // ---- 2. Seed-band identity: exactly the fresh band ----
  T.section('2. Seed-band identity — 190401–190408, the fresh band');
  T.ok('analyzer SEEDS = 190401–190408', JSON.stringify(SC.SEEDS) === JSON.stringify([190401, 190402, 190403, 190404, 190405, 190406, 190407, 190408]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  T.ok('analyzer knows the two legs', JSON.stringify(Object.keys(SC.LEGS).sort()) === JSON.stringify(['baseline', 'tendexact']),
    'LEGS=' + JSON.stringify(Object.keys(SC.LEGS).sort()));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'tendexact-confirm-driver-20261113.js'), 'utf8');
  T.ok('driver writes to perseed-tendexact-confirm-a-<LEG>', driverSrc.indexOf('perseed-tendexact-confirm-a-\' + LEG') !== -1 || driverSrc.indexOf("perseed-tendexact-confirm-a-' + LEG") !== -1, 'outDir check');
  T.ok('driver does NOT write to the vetphantom corpus', driverSrc.indexOf('perseed-vetphantom-b') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to a bisect corpus', driverSrc.indexOf('perseed-bisect-') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the rederive corpus', driverSrc.indexOf('perseed-optb-rederive-a-') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'tendexact-confirm-analyze-20261113.js'), 'utf8');
  T.ok('analyzer reads perseed-tendexact-confirm-a-<LEG>', analyzerSrc.indexOf('perseed-tendexact-confirm-a-\' + LEG') !== -1 || analyzerSrc.indexOf("perseed-tendexact-confirm-a-' + LEG") !== -1, 'DIR check');
  T.ok('analyzer judges GENERALIZES vs NO-GO', analyzerSrc.indexOf("'GENERALIZES'") !== -1 && analyzerSrc.indexOf("'NO_GO'") !== -1, 'GO-bar verdicts present');
  T.ok('analyzer records the matched-band tendexact 5/8', analyzerSrc.indexOf('MATCHED_TENDEXACT_SURVIVED = 5') !== -1, 'matched-band reference check');
  T.ok('analyzer records the matched-band far end 4/8', analyzerSrc.indexOf('MATCHED_FAREND_SURVIVED = 4') !== -1, 'matched-band reference check');

  // ---- 3. Driver leg guard (swap-aware): accepts fix, refuses pre-fix ----
  T.section('3. Driver leg guard (swap-aware) — fix accepted, pre-fix refused');
  // HERMETIC (sim-findings-a 2026-11-11): the fix text comes from the
  // pinned vetphantom commit, never from live on-disk standing.js —
  // on current master the on-disk file carries the marker but a later
  // sha, and the old read made this proof base-state-bound (the driver
  // then also exited at require time; see the driver change).
  const fixText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const preFixText = execSync('git show 203a32775:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const gFix = DR.legGuard(fixText);
  T.ok('legGuard accepts the swapped fix text', gFix.ok === true && gFix.fix === true, 'ok=' + gFix.ok + ' sha=' + gFix.sha);
  T.ok('legGuard records the vetphantom fix sha f8fda4295a99', gFix.sha === 'f8fda4295a99' && gFix.shaFull === DR.EXPECTED_FIX_SHA,
    'sha=' + gFix.sha);
  const gPre = DR.legGuard(preFixText);
  T.ok('legGuard refuses the pre-fix far-end text (no marker)', gPre.ok === false && gPre.fix === false, 'ok=' + gPre.ok + ' fix=' + gPre.fix);
  T.ok('legGuard records the pre-fix sha 75762cb2259d', gPre.sha === '75762cb2259d' && gPre.shaFull === DR.PRE_FIX_SHA,
    'sha=' + gPre.sha);
  T.ok('legGuard refuses a marker-bearing text with the wrong sha', DR.legGuard('ROSTER CHECK\n' + preFixText).ok === false,
    'wrong-sha marker text refused');
  T.ok('legGuard refuses a non-string', DR.legGuard(null).ok === false && DR.legGuard(undefined).ok === false, 'null/undefined refused');
  T.ok('the pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present in the pinned fix text');
  // Real refusal: the driver run as a script against a scratch REPO
  // whose standing.js carries the marker but a WRONG sha must exit 2
  // with the OPTBRE-DERIVE STOP line — never a mislabeled run. The
  // scratch repo is a scripts symlink + a wrong standing.js; nothing
  // on the live tree is touched.
  const scratchRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'tendexact-confirm-refusal-'));
  let refusal = null;
  try {
    fs.symlinkSync(path.join(__dirname), path.join(scratchRepo, 'scripts'), 'dir');
    fs.mkdirSync(path.join(scratchRepo, 'src', 'js'), { recursive: true });
    fs.writeFileSync(path.join(scratchRepo, 'src', 'js', 'standing.js'),
      '// ROSTER CHECK — deliberately wrong swap for the refusal leg\nmodule.exports = {};\n');
    try {
      execSync('node ' + path.join(__dirname, 'tendexact-confirm-driver-20261113.js'),
        { cwd: scratchRepo, env: Object.assign({}, process.env, { REPO: scratchRepo, SEEDS: '190391' }), stdio: 'pipe' });
    } catch (e) { refusal = e; }
  } finally {
    fs.rmSync(scratchRepo, { recursive: true, force: true });
  }
  T.ok('driver run with a wrong-sha swap exits 2 with TENDCONFIRM STOP', refusal !== null && refusal.status === 2 &&
    /TENDCONFIRM STOP: standing\.js has the marker but sha .* is not the vetphantom fix sha/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  T.ok('driver refuses an unswapped run at run entry (exit path in source)', driverSrc.indexOf('perform the fix-swap first') !== -1, 'unswapped exit check');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 4. Corpus completeness on a synthetic corpus ----
  T.section('4. Corpus completeness — loader names missing seeds');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tendexact-confirm-proof-'));
  function fakeRow(seed, lost, days, deaths) {
    return {
      seed: seed, anchorCommit: 'proof', standingFix: true, standingSha: 'f8fda4295a99',
      policySha: 'a7ff5c516440', candidateApplied: { leg: 'tendexact', commits: ['e6911eb80'], markers: [] },
      days: (typeof days === 'number' ? days : (lost ? 100 : 150)), endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: deaths || [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
    };
  }
  for (const seed of SC.SEEDS) {
    fs.writeFileSync(SC.perSeedFile(seed, tmp), JSON.stringify(fakeRow(seed, seed === 190405)) + '\n');
  }
  let corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('full synthetic corpus loads 8/8 complete', corpus.complete === true && corpus.rows.length === 8 && corpus.missing.length === 0,
    'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
  fs.unlinkSync(SC.perSeedFile(190407, tmp));
  corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('partial corpus reports incomplete', corpus.complete === false, 'complete=' + corpus.complete);
  T.ok('partial corpus names the missing seed', JSON.stringify(corpus.missing) === JSON.stringify([190407]),
    'missing=' + JSON.stringify(corpus.missing));
  fs.rmSync(tmp, { recursive: true, force: true });

  // ---- 5. Survival read + prereg GO bar ----
  T.section('5. Survival read + prereg GO bar');
  function synthRows(nSurvived, days, starvation) {
    // days: per-seed days for survivors (lost seeds read 100d);
    // starvation: total starvation deaths spread one per seed from the top.
    let left = starvation || 0;
    return SC.SEEDS.map(function (seed, i) {
      const lost = i >= nSurvived;
      const deaths = [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }];
      if (!lost && left > 0) { deaths.push({ day: 20, kind: 'hunger', who: 'y', cause: 'starvation', player: false }); left--; }
      return fakeRow(seed, lost, lost ? 100 : days, deaths);
    });
  }
  function synthAnalysis(nSurvived, days, starvation) {
    return SC.analyzeRows(synthRows(nSurvived, days, starvation));
  }
  // The GO bar, case by case (baseline 4/8, median 150d, starvation 1):
  const base44 = synthAnalysis(4, 150, 1);
  T.ok('baseline synthetic: 4/8 survived, median 150d, starvation 1', base44.survived === 4 && base44.wall.medianDays === 150 && base44.wall.starvation === 1,
    'survived=' + base44.survived + ' median=' + base44.wall.medianDays + ' starvation=' + base44.wall.starvation);
  const goCases = [
    { t: [5, 150, 0], want: 'GENERALIZES', why: '5/8 vs 4/8, median held, starvation 0' },
    { t: [8, 150, 1], want: 'GENERALIZES', why: '8/8 vs 4/8' },
    { t: [6, 150, 3], want: 'GENERALIZES', why: '6/8, starvation 3 = baseline+2 exactly' },
  ];
  for (const c of goCases) {
    const a = synthAnalysis(c.t[0], c.t[1], c.t[2]);
    T.ok('GO bar: tendexact ' + c.t[0] + '/8 med ' + c.t[1] + 'd starv ' + c.t[2] + ' -> GENERALIZES (' + c.why + ')',
      SC.judge(base44, a).verdict === 'GENERALIZES', SC.judge(base44, a).verdict);
  }
  const nogoCases = [
    { t: [4, 150, 0], why: '4/8: no +1' },
    { t: [5, 150, 0], base: [5, 150, 1], why: '5/8 vs baseline 5/8: no +1' },
    { t: [5, 100, 0], why: 'median 100d < 0.8x150d' },
    { t: [6, 150, 4], why: 'starvation 4 > baseline+2=3' },
    { t: [3, 150, 0], why: '3/8: below count and no +1' },
    { t: [0, 150, 0], why: '0/8' },
  ];
  for (const c of nogoCases) {
    const b = c.base ? synthAnalysis(c.base[0], c.base[1], c.base[2]) : base44;
    const a = synthAnalysis(c.t[0], c.t[1], c.t[2]);
    T.ok('GO bar: tendexact ' + c.t[0] + '/8 med ' + c.t[1] + 'd starv ' + c.t[2] + ' -> NO-GO (' + c.why + ')',
      SC.judge(b, a).verdict === 'NO_GO', SC.judge(b, a).verdict);
  }
  T.ok('GO bar: missing baseline -> UNCLASSIFIABLE', SC.judge(null, synthAnalysis(5, 150, 0)).verdict === 'UNCLASSIFIABLE', SC.judge(null, synthAnalysis(5, 150, 0)).verdict);
  T.ok('GO bar: missing tendexact -> UNCLASSIFIABLE', SC.judge(base44, null).verdict === 'UNCLASSIFIABLE', SC.judge(base44, null).verdict);
  // Per-leg count classification (synthetic helper, not the verdict).
  for (const n of [8, 6, 5]) {
    const a = SC.analyzeRows(synthRows(n, 150, 0));
    T.ok('analyzeRows counts ' + n + '/8 survived', a.survived === n, 'survived=' + a.survived);
    T.ok(n + '/8 -> AT_REDERIVE_COUNT', SC.classifySurvived(n) === 'AT_REDERIVE_COUNT', SC.classifySurvived(n));
  }
  for (const n of [4, 3, 2, 1, 0]) {
    const a = SC.analyzeRows(synthRows(n, 150, 0));
    T.ok(n + '/8 -> BELOW_REDERIVE_COUNT', SC.classifySurvived(n) === 'BELOW_REDERIVE_COUNT', SC.classifySurvived(n));
  }
  // Rank read (pre-registered): regional reach on the same band.
  function synthRankRows(nRegional) {
    return SC.SEEDS.map(function (seed, i) {
      const row = fakeRow(seed, false, 150, [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }]);
      row.scaleRank = i < nRegional ? 'regional' : 'village';
      return row;
    });
  }
  for (const n of [8, 6, 5]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok('rank: ' + n + '/8 regional counted', a.wall.regional === n, 'regional=' + a.wall.regional);
    T.ok(n + '/8 regional -> REGIONAL_INTACT', SC.judge(base44, a).rankVerdict === 'REGIONAL_INTACT', SC.judge(base44, a).rankVerdict);
  }
  for (const n of [4, 3]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok(n + '/8 regional -> RANK_INCONCLUSIVE', SC.judge(base44, a).rankVerdict === 'RANK_INCONCLUSIVE', SC.judge(base44, a).rankVerdict);
  }
  for (const n of [2, 0]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok(n + '/8 regional -> RANK_STALL', SC.judge(base44, a).rankVerdict === 'RANK_STALL', SC.judge(base44, a).rankVerdict);
  }
  T.ok('rank: out-of-range 9 -> UNCLASSIFIABLE', SC.classifyRegional(9) === 'UNCLASSIFIABLE', SC.classifyRegional(9));
  T.ok('out-of-range 9 -> UNCLASSIFIABLE', SC.classifySurvived(9) === 'UNCLASSIFIABLE', SC.classifySurvived(9));
  T.ok('out-of-range -1 -> UNCLASSIFIABLE', SC.classifySurvived(-1) === 'UNCLASSIFIABLE', SC.classifySurvived(-1));
  T.ok('NaN -> UNCLASSIFIABLE', SC.classifySurvived(NaN) === 'UNCLASSIFIABLE', String(SC.classifySurvived(NaN)));
  const a6 = SC.analyzeRows(synthRows(6, 150, 0));
  T.ok('6/8 synthetic: median 150d', a6.wall.medianDays === 150, 'median=' + a6.wall.medianDays);
  T.ok('6/8 synthetic: wave4 8/8, wave5 0/8', a6.wall.wave4 === 8 && a6.wall.wave5 === 0, 'wave4=' + a6.wall.wave4 + ' wave5=' + a6.wall.wave5);
  T.ok('6/8 synthetic: death-cause shares count 8 deaths', a6.causes.total === 8 && a6.causes.counts.combat === 8,
    'total=' + a6.causes.total + ' ' + JSON.stringify(a6.causes.counts));
  T.ok('6/8 synthetic: starvation 0 counted', a6.wall.starvation === 0, 'starvation=' + a6.wall.starvation);
  const aStarv = SC.analyzeRows(synthRows(6, 150, 2));
  T.ok('starvation deaths counted in the wall (2)', aStarv.wall.starvation === 2, 'starvation=' + aStarv.wall.starvation);

  // ---- 6. Candidate guard — markers present at the healthy pole, absent at the far end ----
  T.section('6. Candidate guard — healthy pole carries the marker, far end does not');
  T.ok('candidateGuard refuses an unknown leg', DR.candidateGuard('nope').ok === false, 'unknown leg refused');
  T.ok('candidateGuard passes the baseline leg (no candidate)', DR.candidateGuard('baseline').ok === true && DR.candidateGuard('baseline').noCandidate === true, 'baseline is a no-candidate pass');
  T.ok('candidateMarkersPresent passes the baseline leg', DR.candidateMarkersPresent('baseline', {}).ok === true, 'baseline markers pass');
  for (const leg of Object.keys(DR.CANDIDATES)) {
    const cand = DR.CANDIDATES[leg];
    const files = [];
    for (const m of cand.markers) if (files.indexOf(m.file) === -1) files.push(m.file);
    const healthyTexts = {};
    const farEndTexts = {};
    for (const f of files) {
      // game.js is >1MB: execSync's 1MB default maxBuffer ENOBUFS on it.
      healthyTexts[f] = execSync('git show 5157782a4:' + f, { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
      farEndTexts[f] = execSync('git show 203a32775:' + f, { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
    }
    const gHealthy = DR.candidateMarkersPresent(leg, healthyTexts);
    T.ok('leg ' + leg + ': markers present at healthy pole 5157782a4', gHealthy.ok === true && gHealthy.missing.length === 0,
      'present=' + JSON.stringify(gHealthy.present));
    const gFar = DR.candidateMarkersPresent(leg, farEndTexts);
    T.ok('leg ' + leg + ': markers absent at far end 203a32775', gFar.ok === false && gFar.missing.length === cand.markers.length,
      'missing=' + JSON.stringify(gFar.missing));
  }
  T.ok('driver refuses a tendexact run without its candidate (exit path in source)', driverSrc.indexOf('refuseUnlessCandidate()') !== -1, 'candidate refusal wired at run entry');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
