#!/usr/bin/env node
// test-mcconfirm-merge-b.js — proof test for the survival-collapse
// CONFIRM leg (Loop B arm sim-mcconfirm-merge-b, run
// fleshout-b-2026-11-12T03:29Z).
//
// THE QUESTION (evidence/2026-11-11/sim-bisect-merge-a.md): the
// merge-cut leg on e4dbe581b survived 1/8 on the matched band
// 190391–190398 while the vetphantom fix leg survived 6/8 on the
// same seeds — verdict COLLAPSE_INSIDE_MERGE, resting on 8 matched
// seeds. This arm re-runs the SAME merge base on a FRESH 16-seed
// band (190419–190434) so the coordinator can judge whether the
// collapse reproduces on fresh seeds. Instrument-only: ZERO src/js
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
//      merge cut would be uninterpretable. BASE DIFFERENCE (real,
//      not a test bug): ladder.js at e4dbe581b has NO
//      countLivingVeterans — its _ladderLivingVeterans is the old
//      inline rule (vp && !vp.dead, no roster check, scholar never
//      counted), while 5157782a4/3f136f07e/master use the shared
//      countLivingVeterans (roster check + scholar counts, commit
//      3995d21d6). The merge kept its first parent's ladder.js
//      (merge vs ^1 ladder diff is empty). So after a TB fall the
//      ladder still reads 1 (the vp record is not marked dead by
//      tbVillagerFalls) while the swapped-in readiness gate and the
//      instrument read 0. The test detects which rule the LOADED
//      game carries (from _ladderLivingVeterans source) and asserts
//      the matching count on either base; the survival read comes
//      from the harness end state, not the ladder.
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190419–190434, the fresh 16-seed band. A cut on the wrong
//      seeds answers nothing.
//   3. Driver leg guard (swap-aware) — legGuard accepts the swapped
//      fix text (marker + exact fix sha f8fda4295a99, read from the
//      pinned vetphantom commit, never live disk) and refuses the
//      pre-fix merge text (no marker, sha 75762cb2259d); the driver
//      refuses a wrong-sha swap at run entry (proven by a real
//      subprocess run against a scratch repo) and never runs its
//      main loop when required as a module.
//   4. Corpus completeness — the analyzer's loader reports 16/16
//      complete on a full synthetic corpus and names the missing seed
//      on a partial one.
//   5. Survival read matches the summary — analyzeRows counts
//      survivors from the per-seed villageLost flag, and the joint
//      rule (jointVerdict) maps every (merge, control) pair to the
//      prereg outcome (CONFIRMED / REFUTED / INCONCLUSIVE /
//      UNCLASSIFIABLE). The joint verdict itself is the
//      coordinator's read of both legs; this test proves the rule
//      table, not a joint claim.
//
// Usage: node scripts/test-mcconfirm-merge-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./mcconfirm-merge-analyze-20261111');
const DR = require('./mcconfirm-merge-driver-20261111');
const T = K.reporter('mcconfirm-merge-b');

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
  // only, no roster check — the e4dbe581b merge base). The fallen
  // killer counts 0 under the first, 1 under the second. Detect it
  // from the LOADED function source, never from disk — the test
  // asserts the behavior of the code it actually runs, on either base.
  const ladderRosterCheck = String(Game._ladderLivingVeterans).indexOf('countLivingVeterans') !== -1;
  const ladderAfterFall = ladderRosterCheck ? 0 : 1;
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

  // ---- 2. Seed-band identity: exactly the fresh band ----
  T.section('2. Seed-band identity — 190419–190434, the fresh band');
  T.ok('analyzer SEEDS = 190419–190434', JSON.stringify(SC.SEEDS) === JSON.stringify([190419, 190420, 190421, 190422, 190423, 190424, 190425, 190426, 190427, 190428, 190429, 190430, 190431, 190432, 190433, 190434]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  T.ok('analyzer SEEDS has 16 entries', SC.SEEDS.length === 16, 'len=' + SC.SEEDS.length);
  const driverSrc = fs.readFileSync(path.join(__dirname, 'mcconfirm-merge-driver-20261111.js'), 'utf8');
  T.ok('driver writes to perseed-mcconfirm-merge-b', driverSrc.indexOf('perseed-mcconfirm-merge-b') !== -1, 'outDir check');
  T.ok('driver does NOT write to the vetphantom corpus', driverSrc.indexOf('perseed-vetphantom-b') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the anchor corpus', driverSrc.indexOf('perseed-bisect-anchor-a') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the merge-a corpus', driverSrc.indexOf('perseed-bisect-merge-a') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'mcconfirm-merge-analyze-20261111.js'), 'utf8');
  T.ok('analyzer reads perseed-mcconfirm-merge-b', analyzerSrc.indexOf('perseed-mcconfirm-merge-b') !== -1, 'DIR check');
  T.ok('analyzer references the merge-a leg 1/8', analyzerSrc.indexOf('MERGE_A_SURVIVED = 1') !== -1, 'baseline check');
  T.ok('analyzer carries the joint rule text', analyzerSrc.indexOf('PENDING_CONTROL_LEG') !== -1, 'joint rule is pending, never claimed by this leg');

  // ---- 3. Driver leg guard (swap-aware): accepts fix, refuses pre-fix ----
  T.section('3. Driver leg guard (swap-aware) — fix accepted, pre-fix refused');
  // HERMETIC (sim-findings-a 2026-11-11): the fix text comes from the
  // pinned vetphantom commit, never from live on-disk standing.js —
  // on current master the on-disk file carries the marker but a later
  // sha, and the old read made this proof base-state-bound (the driver
  // then also exited at require time; see the driver change).
  const fixText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const preFixText = execSync('git show e4dbe581b:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const gFix = DR.legGuard(fixText);
  T.ok('legGuard accepts the swapped fix text', gFix.ok === true && gFix.fix === true, 'ok=' + gFix.ok + ' sha=' + gFix.sha);
  T.ok('legGuard records the vetphantom fix sha f8fda4295a99', gFix.sha === 'f8fda4295a99' && gFix.shaFull === DR.EXPECTED_FIX_SHA,
    'sha=' + gFix.sha);
  const gPre = DR.legGuard(preFixText);
  T.ok('legGuard refuses the pre-fix merge text (no marker)', gPre.ok === false && gPre.fix === false, 'ok=' + gPre.ok + ' fix=' + gPre.fix);
  T.ok('legGuard records the pre-fix sha 75762cb2259d', gPre.sha === '75762cb2259d' && gPre.shaFull === DR.PRE_FIX_SHA,
    'sha=' + gPre.sha);
  T.ok('legGuard refuses a marker-bearing text with the wrong sha', DR.legGuard('ROSTER CHECK\n' + preFixText).ok === false,
    'wrong-sha marker text refused');
  T.ok('legGuard refuses a non-string', DR.legGuard(null).ok === false && DR.legGuard(undefined).ok === false, 'null/undefined refused');
  T.ok('the pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present in the pinned fix text');
  // Real refusal: the driver run as a script against a scratch REPO
  // whose standing.js carries the marker but a WRONG sha must exit 2
  // with the MCCONFIRM STOP line — never a mislabeled run. The
  // scratch repo is a scripts symlink + a wrong standing.js; nothing
  // on the live tree is touched.
  // FIXED-REPO FALLBACK (2026-11-11): if the scratch build fails
  // (host write flap denying write() AND copyfile for minutes), use
  // the prebuilt fixed repo /tmp/mcconfirm-merge-refusal-fixed
  // (standing.js placed via a write path the flap does not touch;
  // same bytes as the literal below; scripts symlink to this
  // worktree). The assertion — the driver refuses a wrong-sha swap —
  // is identical either way; only the fixture's provenance differs.
  const FIXED_REFUSAL_REPO = '/tmp/mcconfirm-merge-refusal-fixed';
  let scratchRepo = null;
  let refusalRepo = null;
  try {
    scratchRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'mcconfirm-merge-refusal-'));
    fs.symlinkSync(path.join(__dirname), path.join(scratchRepo, 'scripts'), 'dir');
    fs.mkdirSync(path.join(scratchRepo, 'src', 'js'), { recursive: true });
    // FLAP RETRY (2026-11-11, sim-mcconfirm-merge-b): the host write flap
    // denies file writes (EPERM) in minutes-long windows — retry the
    // scratch write so an environmental denial can't fail the proof.
    // The assertion (a wrong-sha swap is refused) is unchanged.
    // REAL SLEEP: Atomics.wait, NOT a Date.now() busy-wait — the sim
    // harness's frozen clock makes Date.now() jump ~1ms per CALL after
    // a day advances, so a Date.now() wait returns in <1ms of real time
    // (found 2026-11-11: 30 "2s" retries finished in under a second).
    const sleepReal = (ms) => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} };
    // COPY FALLBACK: the host write flap can deny write() for minutes
    // at a time; copyFileSync (copy_file_range) is a different syscall
    // path, and the fixture below was placed by the coordinator via a
    // write path the flap does not touch. Same bytes, same assertion.
    function copyRetry(src, dst) {
      for (let i = 0; ; i++) {
        try { fs.copyFileSync(src, dst); return; }
        catch (e) {
          if (i >= 29) throw e;
          sleepReal(2000);
        }
      }
    }
    let written = false;
    for (let i = 0; i < 5; i++) {
      try {
        fs.writeFileSync(path.join(scratchRepo, 'src', 'js', 'standing.js'),
          '// ROSTER CHECK — deliberately wrong swap for the refusal leg\nmodule.exports = {};\n');
        written = true;
        break;
      } catch (e) {
        if (e.code !== 'EPERM') throw e;
        sleepReal(2000);
      }
    }
    if (!written) copyRetry('/tmp/mcconfirm-refusal-standing.js', path.join(scratchRepo, 'src', 'js', 'standing.js'));
    refusalRepo = scratchRepo;
  } catch (e) {
    if (scratchRepo) { try { fs.rmSync(scratchRepo, { recursive: true, force: true }); } catch (e2) {} scratchRepo = null; }
    const fixedStanding = path.join(FIXED_REFUSAL_REPO, 'src', 'js', 'standing.js');
    if (!fs.existsSync(fixedStanding) || fs.readFileSync(fixedStanding, 'utf8').indexOf('ROSTER CHECK') === -1) {
      throw new Error('flap fallback fixture missing: ' + fixedStanding + ' (scratch build error: ' + (e && e.message) + ')');
    }
    refusalRepo = FIXED_REFUSAL_REPO;
  }
  let refusal = null;
  try {
    execSync('node ' + path.join(__dirname, 'mcconfirm-merge-driver-20261111.js'),
      { cwd: refusalRepo, env: Object.assign({}, process.env, { REPO: refusalRepo, SEEDS: '190391' }), stdio: 'pipe' });
  } catch (e) { refusal = e; }
  if (scratchRepo) { try { fs.rmSync(scratchRepo, { recursive: true, force: true }); } catch (e) {} }
  T.ok('driver run with a wrong-sha swap exits 2 with MCCONFIRM STOP' + (refusalRepo === FIXED_REFUSAL_REPO ? ' (fixed-repo fallback)' : ''), refusal !== null && refusal.status === 2 &&
    /MCCONFIRM STOP: standing\.js has the marker but sha .* is not the vetphantom fix sha/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  T.ok('driver refuses an unswapped run at run entry (exit path in source)', driverSrc.indexOf('perform the fix-swap first') !== -1, 'unswapped exit check');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 4. Corpus completeness on a synthetic corpus ----
  T.section('4. Corpus completeness — loader names missing seeds');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mcconfirm-merge-proof-'));
  // FLAP RETRY (same host write flap as §3): retry each synthetic
  // corpus write on EPERM so the environment can't fail the proof.
  // REAL SLEEP via Atomics.wait — see §3: a Date.now() busy-wait is
  // instant once the harness clock has advanced a day.
  // COPY FALLBACK: if the direct write stays denied, copy the same
  // bytes from the pre-generated fixture dir
  // /tmp/mcconfirm-merge-proof-fixed/ (placed via a write path the
  // flap does not touch; content identical to fakeRow output).
  function sleepReal(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
  function writeRetry(file, data) {
    for (let i = 0; i < 5; i++) {
      try { fs.writeFileSync(file, data); return; }
      catch (e) {
        if (e.code !== 'EPERM') throw e;
        sleepReal(2000);
      }
    }
    const fixture = path.join('/tmp', 'mcconfirm-merge-proof-fixed', path.basename(file));
    for (let i = 0; ; i++) {
      try { fs.copyFileSync(fixture, file); return; }
      catch (e) {
        if (i >= 29) throw e;
        sleepReal(2000);
      }
    }
  }
  function fakeRow(seed, lost) {
    return {
      seed: seed, anchorCommit: 'proof', standingFix: true, standingSha: 'f8fda4295a99',
      days: lost ? 100 : 150, endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
    };
  }
  let corpus = null;
  let usedFixture = false;
  try {
    for (const seed of SC.SEEDS) {
      writeRetry(path.join(tmp, 'mcconfirm-merge-s' + seed + '-mcconfirm-merge-pilot-fix.json'), JSON.stringify(fakeRow(seed, seed === 190425)) + '\n');
    }
    corpus = SC.loadCorpus(SC.SEEDS, tmp);
    T.ok('full synthetic corpus loads 16/16 complete', corpus.complete === true && corpus.rows.length === 16 && corpus.missing.length === 0,
      'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
    fs.unlinkSync(path.join(tmp, 'mcconfirm-merge-s190427-mcconfirm-merge-pilot-fix.json'));
    corpus = SC.loadCorpus(SC.SEEDS, tmp);
    T.ok('partial corpus reports incomplete', corpus.complete === false, 'complete=' + corpus.complete);
    T.ok('partial corpus names the missing seed', JSON.stringify(corpus.missing) === JSON.stringify([190427]),
      'missing=' + JSON.stringify(corpus.missing));
  } catch (e) {
    // FIXED-FIXTURE FALLBACK (same host write flap as §3): if any
    // corpus write stays denied, read the pre-generated fixture dir
    // /tmp/mcconfirm-merge-proof-fixed/ instead (placed via a write
    // path the flap does not touch; content identical to fakeRow
    // output — key order differs, parsed values identical). The
    // partial case then uses an extra unknown seed instead of an
    // unlink, so the fixture dir is never mutated.
    if (tmp) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e2) {} }
    const fixtureDir = '/tmp/mcconfirm-merge-proof-fixed';
    corpus = SC.loadCorpus(SC.SEEDS, fixtureDir);
    T.ok('full synthetic corpus loads 16/16 complete (fixed-fixture fallback)', corpus.complete === true && corpus.rows.length === 16 && corpus.missing.length === 0,
      'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
    corpus = SC.loadCorpus(SC.SEEDS.concat([999999]), fixtureDir);
    T.ok('partial corpus reports incomplete (fixed-fixture fallback)', corpus.complete === false, 'complete=' + corpus.complete);
    T.ok('partial corpus names the missing seed (fixed-fixture fallback)', JSON.stringify(corpus.missing) === JSON.stringify([999999]),
      'missing=' + JSON.stringify(corpus.missing));
    usedFixture = true;
  }
  if (tmp && !usedFixture) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} }

  // ---- 5. Survival read + the joint rule table ----
  // The analyzer judges THIS leg only (survived count, median,
  // completeness). The joint verdict is the coordinator's read of
  // both legs; this section proves the jointVerdict(merge, control)
  // table the coordinator will apply, and that analyzeRows counts
  // survivors from the per-seed villageLost flag.
  T.section('5. Survival read + joint rule table');
  function synthRows(nSurvived) {
    return SC.SEEDS.map(function (seed, i) {
      const lost = i >= nSurvived;
      return fakeRow(seed, lost);
    });
  }
  for (const n of [16, 12, 1, 0]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok('analyzeRows counts ' + n + '/16 survived', a.survived === n, 'survived=' + a.survived);
  }
  // CONFIRMED: merge <= control - 4 AND control >= 8
  for (const pair of [[4, 8], [0, 16], [8, 12], [5, 9], [12, 16], [3, 8]]) {
    T.ok('joint (' + pair[0] + ', ' + pair[1] + ') -> CONFIRMED',
      SC.jointVerdict(pair[0], pair[1]) === 'CONFIRMED', SC.jointVerdict(pair[0], pair[1]));
  }
  // REFUTED: merge >= control - 1
  for (const pair of [[7, 8], [16, 16], [8, 8], [15, 16], [0, 1]]) {
    T.ok('joint (' + pair[0] + ', ' + pair[1] + ') -> REFUTED',
      SC.jointVerdict(pair[0], pair[1]) === 'REFUTED', SC.jointVerdict(pair[0], pair[1]));
  }
  // INCONCLUSIVE: neither clause fires — including the control>=8
  // gate (merge 2 vs control 5 is a 3-gap but control < 8, so it
  // cannot confirm) and the boundary (merge = control - 3).
  for (const pair of [[6, 8], [5, 8], [2, 5], [4, 7], [9, 12], [13, 16]]) {
    T.ok('joint (' + pair[0] + ', ' + pair[1] + ') -> INCONCLUSIVE',
      SC.jointVerdict(pair[0], pair[1]) === 'INCONCLUSIVE', SC.jointVerdict(pair[0], pair[1]));
  }
  T.ok('out-of-range merge 17 -> UNCLASSIFIABLE', SC.jointVerdict(17, 8) === 'UNCLASSIFIABLE', SC.jointVerdict(17, 8));
  T.ok('out-of-range merge -1 -> UNCLASSIFIABLE', SC.jointVerdict(-1, 8) === 'UNCLASSIFIABLE', SC.jointVerdict(-1, 8));
  T.ok('out-of-range control 17 -> UNCLASSIFIABLE', SC.jointVerdict(8, 17) === 'UNCLASSIFIABLE', SC.jointVerdict(8, 17));
  T.ok('NaN -> UNCLASSIFIABLE', SC.jointVerdict(NaN, 8) === 'UNCLASSIFIABLE', String(SC.jointVerdict(NaN, 8)));
  T.ok('non-number control -> UNCLASSIFIABLE', SC.jointVerdict(8, 'x') === 'UNCLASSIFIABLE', String(SC.jointVerdict(8, 'x')));
  const a12 = SC.analyzeRows(synthRows(12));
  T.ok('12/16 synthetic: median 150d (upper median, same convention as merge-a)', a12.wall.medianDays === 150, 'median=' + a12.wall.medianDays);
  const a1 = SC.analyzeRows(synthRows(1));
  T.ok('1/16 synthetic: median 100d', a1.wall.medianDays === 100, 'median=' + a1.wall.medianDays);
  T.ok('12/16 synthetic: wave4 16/16, wave5 0/16', a12.wall.wave4 === 16 && a12.wall.wave5 === 0, 'wave4=' + a12.wall.wave4 + ' wave5=' + a12.wall.wave5);
  T.ok('12/16 synthetic: death-cause shares count 16 deaths', a12.causes.total === 16 && a12.causes.counts.combat === 16,
    'total=' + a12.causes.total + ' ' + JSON.stringify(a12.causes.counts));

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
