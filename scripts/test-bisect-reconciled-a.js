#!/usr/bin/env node
// test-bisect-reconciled-a.js — proof test for the survival-collapse
// BISECT RECONCILED-MASTER leg (Loop A arm sim-bisect-reconciled-a).
//
// THE QUESTION (evidence/2026-11-11/sim-bisect-adopt-round-0215.md):
// the vetphantom fix leg (5157782a4) survived 6/8; the merge-cut leg
// on e4dbe581b survived 1/8 — but 5157782a4 is NOT an ancestor of the
// merge, it descends from the merge's first parent 203a32775 by 205
// commits, and the merge was cut from stale local master. This arm is
// the confirmatory leg on the SHIPPED reconciled master 743e07d87
// (the merge-forward of master into reconcile-divergence): re-run the
// vetphantom seeds there. Instrument-only: ZERO src/js changes committed.
//
// THE FIX-SWAP: this base predates the r131 roster-check fix
// (5d16916f4 is NOT an ancestor of 743e07d87 — verified at run start),
// so src/js/standing.js on disk is the PRE-FIX version (sha256
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
//      reconciled cut would be uninterpretable. BASE DIFFERENCE (real,
//      not a test bug): ladder.js at the merge-cut e4dbe581b has NO
//      countLivingVeterans — its _ladderLivingVeterans is the old
//      inline rule (vp && !vp.dead, no roster check, scholar never
//      counted) — while 5157782a4/3f136f07e/master AND the reconciled
//      master 743e07d87 use the shared countLivingVeterans (roster
//      check + scholar counts, commit 3995d21d6; verified: 6 matches
//      in 743e07d87's ladder.js). So after a TB fall the ladder on
//      THIS base reads 0, like the swapped-in readiness gate and the
//      instrument. The test still detects which rule the LOADED
//      game carries (from _ladderLivingVeterans source) and asserts
//      the matching count on either base; the survival read comes
//      from the harness end state, not the ladder.
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190391–190398, the vetphantom band. A cut on the wrong seeds
//      answers nothing.
//   3. Driver leg guard (swap-aware) — legGuard accepts the swapped
//      fix text (marker + exact fix sha f8fda4295a99, read from the
//      pinned vetphantom commit, never live disk) and refuses the
//      pre-fix reconciled text (no marker, sha 75762cb2259d); the driver
//      refuses a wrong-sha swap at run entry (proven by a real
//      subprocess run against a scratch repo) and never runs its
//      main loop when required as a module.
//   4. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing seed
//      on a partial one.
//   5. Survival read matches the summary — analyzeRows counts
//      survivors from the per-seed villageLost flag, and the judge
//      maps every survived count to the prereg verdict (≥5
//      RECONCILED_NO_COLLAPSE, ≤2 COLLAPSE_CONFIRMED, 3–4 INCONCLUSIVE).
//
// Usage: node scripts/test-bisect-reconciled-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./bisect-reconciled-analyze-20261111');
const DR = require('./bisect-reconciled-driver-20261111');
const T = K.reporter('bisect-reconciled-a');

// writeFileRetry: host write flap (2026-11-11/12) — EPERM on
// writeFileSync comes and goes in bursts of MINUTES (observed
// 2026-11-12: clear for ~1 min, then denied for 60s+ straight);
// retry EPERM with a budget that rides out a burst (150 x 2s =
// 5 min max) so a passing proof is not killed by one. Non-EPERM
// errors throw immediately; exhaustion throws loudly. This hardens
// only the proof's own scratch writes; no assertion is loosened.
function writeFileRetry(file, data) {
  for (let i = 0; i < 150; i++) {
    try { fs.writeFileSync(file, data); return; }
    catch (e) {
      if (e.code !== 'EPERM' || i === 149) throw e;
      // Atomics.wait is REAL wall-clock sleep: the harness freezes
      // Date.now (simulated game clock, +1ms/call), so a Date.now
      // busy-wait would exit instantly and burn all 30 retries in
      // ~0s (observed 2026-11-12). Do NOT use Date.now here.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
    }
  }
}

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
  // rule (roster check — master, and the reconciled master 743e07d87)
  // or the old inline rule (vp.dead only, no roster check — the
  // e4dbe581b merge base). The fallen killer counts 0 under the first,
  // 1 under the second. Detect it
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

  // ---- 2. Seed-band identity: exactly the vetphantom band ----
  T.section('2. Seed-band identity — 190391–190398, the vetphantom band');
  T.ok('analyzer SEEDS = 190391–190398', JSON.stringify(SC.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'bisect-reconciled-driver-20261111.js'), 'utf8');
  T.ok('driver writes to perseed-bisect-reconciled-a', driverSrc.indexOf('perseed-bisect-reconciled-a') !== -1, 'outDir check');
  T.ok('driver does NOT write to the vetphantom corpus', driverSrc.indexOf('perseed-vetphantom-b') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the anchor corpus', driverSrc.indexOf('perseed-bisect-anchor-a') === -1, 'no cross-corpus write');
  T.ok('driver writeRobust backs off on real wall-clock time (Atomics.wait, not frozen Date.now)', driverSrc.indexOf('Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000)') !== -1 && driverSrc.indexOf('while (Date.now() - t0 < 2000)') === -1, 'writeRobust backoff check');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'bisect-reconciled-analyze-20261111.js'), 'utf8');
  T.ok('analyzer reads perseed-bisect-reconciled-a', analyzerSrc.indexOf('perseed-bisect-reconciled-a') !== -1, 'DIR check');
  T.ok('analyzer compares against vetphantom fix leg 6/8', analyzerSrc.indexOf('VETPHANTOM_SURVIVED = 6') !== -1, 'baseline check');

  // ---- 3. Driver leg guard (swap-aware): accepts fix, refuses pre-fix ----
  T.section('3. Driver leg guard (swap-aware) — fix accepted, pre-fix refused');
  // HERMETIC (sim-findings-a 2026-11-11): the fix text comes from the
  // pinned vetphantom commit, never from live on-disk standing.js —
  // on current master the on-disk file carries the marker but a later
  // sha, and the old read made this proof base-state-bound (the driver
  // then also exited at require time; see the driver change).
  const fixText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const preFixText = execSync('git show 743e07d87:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const gFix = DR.legGuard(fixText);
  T.ok('legGuard accepts the swapped fix text', gFix.ok === true && gFix.fix === true, 'ok=' + gFix.ok + ' sha=' + gFix.sha);
  T.ok('legGuard records the vetphantom fix sha f8fda4295a99', gFix.sha === 'f8fda4295a99' && gFix.shaFull === DR.EXPECTED_FIX_SHA,
    'sha=' + gFix.sha);
  const gPre = DR.legGuard(preFixText);
  T.ok('legGuard refuses the pre-fix reconciled text (no marker)', gPre.ok === false && gPre.fix === false, 'ok=' + gPre.ok + ' fix=' + gPre.fix);
  T.ok('legGuard records the pre-fix sha 75762cb2259d', gPre.sha === '75762cb2259d' && gPre.shaFull === DR.PRE_FIX_SHA,
    'sha=' + gPre.sha);
  T.ok('legGuard refuses a marker-bearing text with the wrong sha', DR.legGuard('ROSTER CHECK\n' + preFixText).ok === false,
    'wrong-sha marker text refused');
  T.ok('legGuard refuses a non-string', DR.legGuard(null).ok === false && DR.legGuard(undefined).ok === false, 'null/undefined refused');
  T.ok('the pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present in the pinned fix text');
  // Real refusal: the driver run as a script against a scratch REPO
  // whose standing.js carries the marker but a WRONG sha must exit 2
  // with the BISECTRECONCILED STOP line — never a mislabeled run. The
  // scratch repo is a scripts symlink + a wrong standing.js; nothing
  // on the live tree is touched.
  const scratchRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bisect-reconciled-refusal-'));
  let refusal = null;
  try {
    fs.symlinkSync(path.join(__dirname), path.join(scratchRepo, 'scripts'), 'dir');
    fs.mkdirSync(path.join(scratchRepo, 'src', 'js'), { recursive: true });
    writeFileRetry(path.join(scratchRepo, 'src', 'js', 'standing.js'),
      '// ROSTER CHECK — deliberately wrong swap for the refusal leg\nmodule.exports = {};\n');
    try {
      execSync('node ' + path.join(__dirname, 'bisect-reconciled-driver-20261111.js'),
        { cwd: scratchRepo, env: Object.assign({}, process.env, { REPO: scratchRepo, SEEDS: '190391' }), stdio: 'pipe' });
    } catch (e) { refusal = e; }
  } finally {
    fs.rmSync(scratchRepo, { recursive: true, force: true });
  }
  T.ok('driver run with a wrong-sha swap exits 2 with BISECTRECONCILED STOP', refusal !== null && refusal.status === 2 &&
    /BISECTRECONCILED STOP: standing\.js has the marker but sha .* is not the vetphantom fix sha/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  T.ok('driver refuses an unswapped run at run entry (exit path in source)', driverSrc.indexOf('perform the fix-swap first') !== -1, 'unswapped exit check');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 4. Corpus completeness on a synthetic corpus ----
  T.section('4. Corpus completeness — loader names missing seeds');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bisect-reconciled-proof-'));
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
  for (const seed of SC.SEEDS) {
    writeFileRetry(path.join(tmp, 'bisect-reconciled-s' + seed + '-bisect-reconciled-pilot-fix.json'), JSON.stringify(fakeRow(seed, seed === 190395)) + '\n');
  }
  let corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('full synthetic corpus loads 8/8 complete', corpus.complete === true && corpus.rows.length === 8 && corpus.missing.length === 0,
    'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
  fs.unlinkSync(path.join(tmp, 'bisect-reconciled-s190397-bisect-reconciled-pilot-fix.json'));
  corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('partial corpus reports incomplete', corpus.complete === false, 'complete=' + corpus.complete);
  T.ok('partial corpus names the missing seed', JSON.stringify(corpus.missing) === JSON.stringify([190397]),
    'missing=' + JSON.stringify(corpus.missing));
  fs.rmSync(tmp, { recursive: true, force: true });

  // ---- 5. Survival read matches the summary + decision rule ----
  T.section('5. Survival read + prereg decision rule');
  function synthRows(nSurvived) {
    return SC.SEEDS.map(function (seed, i) {
      const lost = i >= nSurvived;
      return fakeRow(seed, lost);
    });
  }
  for (const n of [8, 6, 5]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok('analyzeRows counts ' + n + '/8 survived', a.survived === n, 'survived=' + a.survived);
    T.ok(n + '/8 -> RECONCILED_NO_COLLAPSE', SC.judge(a).verdict === 'RECONCILED_NO_COLLAPSE', SC.judge(a).verdict);
  }
  for (const n of [4, 3]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/8 -> INCONCLUSIVE', SC.judge(a).verdict === 'INCONCLUSIVE', SC.judge(a).verdict);
  }
  for (const n of [2, 1, 0]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/8 -> COLLAPSE_CONFIRMED', SC.judge(a).verdict === 'COLLAPSE_CONFIRMED', SC.judge(a).verdict);
  }
  T.ok('out-of-range 9 -> UNCLASSIFIABLE', SC.classifySurvived(9) === 'UNCLASSIFIABLE', SC.classifySurvived(9));
  T.ok('out-of-range -1 -> UNCLASSIFIABLE', SC.classifySurvived(-1) === 'UNCLASSIFIABLE', SC.classifySurvived(-1));
  T.ok('NaN -> UNCLASSIFIABLE', SC.classifySurvived(NaN) === 'UNCLASSIFIABLE', String(SC.classifySurvived(NaN)));
  const a6 = SC.analyzeRows(synthRows(6));
  T.ok('6/8 synthetic: median 150d', a6.wall.medianDays === 150, 'median=' + a6.wall.medianDays);
  T.ok('6/8 synthetic: wave4 8/8, wave5 0/8', a6.wall.wave4 === 8 && a6.wall.wave5 === 0, 'wave4=' + a6.wall.wave4 + ' wave5=' + a6.wall.wave5);
  T.ok('6/8 synthetic: death-cause shares count 8 deaths', a6.causes.total === 8 && a6.causes.counts.combat === 8,
    'total=' + a6.causes.total + ' ' + JSON.stringify(a6.causes.counts));

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
