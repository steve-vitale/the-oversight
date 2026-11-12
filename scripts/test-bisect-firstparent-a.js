#!/usr/bin/env node
// test-bisect-firstparent-a.js — proof test for the survival-collapse
// BISECT FIRST-PARENT leg (Loop A arm sim-bisect-firstparent-a).
//
// THE QUESTION (evidence/2026-11-11/sim-bisect-adopt-round-0215.md
// §8 ancestry twist): the vetphantom fix leg (5157782a4) survived
// 6/8; the merge-cut on e4dbe581b survived 1/8 — but 5157782a4 is NOT
// an ancestor of the merge: it descends from the merge's first parent
// 203a32775 by 205 commits. This arm cuts the window at the first
// parent itself: re-run the vetphantom seeds on 203a32775 with its OWN
// competent.js policy and the r131 fix swapped in.
// Instrument-only: ZERO src/js changes committed.
//
// THE FIX-SWAP: this base predates the r131 roster-check fix, so
// src/js/standing.js on disk is the PRE-FIX version (sha256
// 75762cb2259d...). The fix standing.js (sha256 f8fda4295a99...,
// from `git show 5157782a4:src/js/standing.js`) is swapped in
// UNCOMMITTED for the run and restored byte-identical afterwards.
// The driver refuses to run unless the on-disk standing.js carries
// the "ROSTER CHECK" marker AND its sha256 is exactly the fix sha.
//
// THE POLICY: this leg runs 203a32775's OWN competent.js (sha256
// a7ff5c516440...). The driver refuses to run unless the on-disk
// competent.js sha256 is exactly that sha, and records policySha
// per seed.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Instrument validity — the reused vetfirst instrument + the
//      engine's own readiness read agree on a living veteran AND on
//      a TB-fallen veteran (death day + day after), on the current
//      tree with the fix swapped in. If the instrument lied, the
//      first-parent cut would be uninterpretable. BASE DIFFERENCE
//      (real, not a test bug): ladder.js at 203a32775 has NO
//      countLivingVeterans — its _ladderLivingVeterans is the old
//      inline rule (vp && !vp.dead, no roster check, scholar never
//      counted), while 5157782a4/3f136f07e/master use the shared
//      countLivingVeterans (roster check + scholar counts, commit
//      3995d21d6). The merge kept its first parent's ladder.js
//      (merge vs ^1 ladder diff is empty), so 203a32775 carries the
//      same old rule the merge base did. So after a TB fall the
//      ladder still reads 1 (the vp record is not marked dead by
//      tbVillagerFalls) while the swapped-in readiness gate and the
//      instrument read 0. The test detects which rule the LOADED
//      game carries (from _ladderLivingVeterans source) and asserts
//      the matching count on either base; the survival read comes
//      from the harness end state, not the ladder.
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190391–190398, the vetphantom band. A cut on the wrong seeds
//      answers nothing.
//   3. Driver leg guards (swap-aware + own-policy) — legGuard accepts
//      the swapped fix text (marker + exact fix sha f8fda4295a99,
//      read from the pinned vetphantom commit, never live disk) and
//      refuses the pre-fix first-parent text (no marker, sha
//      75762cb2259d); legGuardPolicy accepts 203a32775's own
//      competent.js (sha a7ff5c516440, read from the pinned first
//      parent commit) and refuses the vetphantom-base policy
//      (0801abd82e52) and the current branch policy (3c40151e8dd4);
//      the driver refuses a wrong-sha swap AND a wrong-sha policy at
//      run entry (proven by real subprocess runs against scratch
//      repos built from SYMLINKS — no content writes, so the host
//      write flap cannot block them — and never runs its main loop
//      when required as a module.
//   4. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing seed
//      on a partial one.
//   5. Survival read matches the summary — analyzeRows counts
//      survivors from the per-seed villageLost flag, and the judge
//      maps every survived count to the prereg verdict (≥5
//      FIRSTPARENT_SURVIVES, ≤2 FIRSTPARENT_COLLAPSES, 3–4
//      INCONCLUSIVE).
//
// Usage: node scripts/test-bisect-firstparent-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./bisect-firstparent-analyze-20261111');
const DR = require('./bisect-firstparent-driver-20261111');
const T = K.reporter('bisect-firstparent-a');

// NOTE (host write flap, 2026-11-12): content writes are denied in
// multi-minute EPERM waves, so this proof performs NO content writes
// at all — §3's refusal tests and §4's corpus setup both build their
// scratch files from SYMLINKS (metadata ops, never denied). The
// driver's writeRobust (flap-tolerant sampling) covers the judged
// sims' corpus writes instead; this proof must stay runnable while
// the flap is active.

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
  // only, no roster check — the 203a32775 first-parent base, same as
  // the e4dbe581b merge base). The fallen
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

  // ---- 2. Seed-band identity: exactly the vetphantom band ----
  T.section('2. Seed-band identity — 190391–190398, the vetphantom band');
  T.ok('analyzer SEEDS = 190391–190398', JSON.stringify(SC.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'bisect-firstparent-driver-20261111.js'), 'utf8');
  T.ok('driver writes to perseed-bisect-firstparent-a', driverSrc.indexOf('perseed-bisect-firstparent-a') !== -1, 'outDir check');
  T.ok('driver does NOT write to the vetphantom corpus', driverSrc.indexOf('perseed-vetphantom-b') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the anchor corpus', driverSrc.indexOf('perseed-bisect-anchor-a') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'bisect-firstparent-analyze-20261111.js'), 'utf8');
  T.ok('analyzer reads perseed-bisect-firstparent-a', analyzerSrc.indexOf('perseed-bisect-firstparent-a') !== -1, 'DIR check');
  T.ok('analyzer compares against vetphantom fix leg 6/8', analyzerSrc.indexOf('VETPHANTOM_SURVIVED = 6') !== -1, 'baseline check');

  // ---- 3. Driver leg guards (swap-aware + own-policy) ----
  T.section('3. Driver leg guards — fix accepted, pre-fix refused; own policy accepted, other policies refused');
  // HERMETIC (sim-findings-a 2026-11-11): the fix text comes from the
  // pinned vetphantom commit, never from live on-disk standing.js —
  // on current master the on-disk file carries the marker but a later
  // sha, and the old read made this proof base-state-bound (the driver
  // then also exited at require time; see the driver change). Policy
  // texts likewise come from pinned commits, never live disk.
  const fixText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const preFixText = execSync('git show 203a32775:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const gFix = DR.legGuard(fixText);
  T.ok('legGuard accepts the swapped fix text', gFix.ok === true && gFix.fix === true, 'ok=' + gFix.ok + ' sha=' + gFix.sha);
  T.ok('legGuard records the vetphantom fix sha f8fda4295a99', gFix.sha === 'f8fda4295a99' && gFix.shaFull === DR.EXPECTED_FIX_SHA,
    'sha=' + gFix.sha);
  const gPre = DR.legGuard(preFixText);
  T.ok('legGuard refuses the pre-fix first-parent text (no marker)', gPre.ok === false && gPre.fix === false, 'ok=' + gPre.ok + ' fix=' + gPre.fix);
  T.ok('legGuard records the pre-fix sha 75762cb2259d', gPre.sha === '75762cb2259d' && gPre.shaFull === DR.PRE_FIX_SHA,
    'sha=' + gPre.sha);
  T.ok('legGuard refuses a marker-bearing text with the wrong sha', DR.legGuard('ROSTER CHECK\n' + preFixText).ok === false,
    'wrong-sha marker text refused');
  T.ok('legGuard refuses a non-string', DR.legGuard(null).ok === false && DR.legGuard(undefined).ok === false, 'null/undefined refused');
  T.ok('the pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present in the pinned fix text');
  T.ok('the pinned pre-fix text LACKS the roster-check marker', preFixText.indexOf('ROSTER CHECK') === -1, 'marker absent in the pinned pre-fix text');
  // Own-policy guard: texts from pinned commits.
  const ownPolicyText = execSync('git show 203a32775:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const vetphantomPolicyText = execSync('git show 5157782a4:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const currentPolicyText = execSync('git show HEAD:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const gOwn = DR.legGuardPolicy(ownPolicyText);
  T.ok('legGuardPolicy accepts the first-parent own policy', gOwn.ok === true, 'ok=' + gOwn.ok + ' sha=' + gOwn.sha);
  T.ok('legGuardPolicy records the own-policy sha a7ff5c516440', gOwn.sha === 'a7ff5c516440' && gOwn.shaFull === DR.EXPECTED_POLICY_SHA,
    'sha=' + gOwn.sha);
  const gVet = DR.legGuardPolicy(vetphantomPolicyText);
  T.ok('legGuardPolicy refuses the vetphantom-base policy (0801abd82e52)', gVet.ok === false && gVet.sha === '0801abd82e52' && gVet.shaFull === DR.VETPHANTOM_POLICY_SHA,
    'ok=' + gVet.ok + ' sha=' + gVet.sha);
  const gCur = DR.legGuardPolicy(currentPolicyText);
  T.ok('legGuardPolicy refuses the current branch policy (3c40151e8dd4)', gCur.ok === false && gCur.sha === '3c40151e8dd4',
    'ok=' + gCur.ok + ' sha=' + gCur.sha);
  T.ok('legGuardPolicy refuses a non-string', DR.legGuardPolicy(null).ok === false && DR.legGuardPolicy(undefined).ok === false, 'null/undefined refused');
  // Real refusal: the driver run as a script against a scratch REPO
  // whose standing.js is the PRE-FIX version must exit 2 with the
  // BISECTFIRSTPARENT STOP line — never a mislabeled run.
  //
  // FLAP-IMMUNE SETUP (host write flap, 2026-11-12): content writes
  // are denied in multi-minute waves, so the scratch standing.js is
  // a SYMLINK, not a written file — symlink/mkdir/mkdtemp are
  // metadata ops and are not denied. The target is the durable
  // vetphantom scratch copy of the pre-fix standing.js
  // (~/workspace/scratch-vetphantom/standing-prefix.js), whose sha
  // is asserted below to equal the pinned pre-fix sha — if that
  // scratch copy is ever deleted, this test fails loudly instead of
  // silently testing the wrong file. Nothing on the live tree is
  // touched. (The "marker but wrong sha" refusal is covered purely
  // by legGuard above; this subprocess leg proves the run-entry
  // enforcement on the unswapped file.)
  const VETPHANTOM_SCRATCH = path.join(os.homedir(), 'workspace', 'scratch-vetphantom');
  const preFixScratch = path.join(VETPHANTOM_SCRATCH, 'standing-prefix.js');
  const preFixScratchText = fs.readFileSync(preFixScratch, 'utf8');
  const crypto = require('crypto');
  T.ok('scratch pre-fix copy hashes to the pinned pre-fix sha 75762cb2259d',
    crypto.createHash('sha256').update(preFixScratchText).digest('hex') === DR.PRE_FIX_SHA,
    'scratch copy sha=' + crypto.createHash('sha256').update(preFixScratchText).digest('hex').slice(0, 12));
  const scratchRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bisect-firstparent-refusal-'));
  let refusal = null;
  try {
    fs.symlinkSync(path.join(__dirname), path.join(scratchRepo, 'scripts'), 'dir');
    fs.mkdirSync(path.join(scratchRepo, 'src', 'js'), { recursive: true });
    fs.symlinkSync(preFixScratch, path.join(scratchRepo, 'src', 'js', 'standing.js'));
    try {
      execSync('node ' + path.join(__dirname, 'bisect-firstparent-driver-20261111.js'),
        { cwd: scratchRepo, env: Object.assign({}, process.env, { REPO: scratchRepo, SEEDS: '190391' }), stdio: 'pipe' });
    } catch (e) { refusal = e; }
  } finally {
    fs.rmSync(scratchRepo, { recursive: true, force: true });
  }
  T.ok('driver run with an unswapped standing.js exits 2 with BISECTFIRSTPARENT STOP', refusal !== null && refusal.status === 2 &&
    /BISECTFIRSTPARENT STOP: mode=fix but standing\.js LACKS the roster-check fix/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  // Real policy refusal: the driver run as a script against a scratch
  // REPO whose standing.js is the CORRECT fix text (standing guard
  // passes) but whose symlinked scripts dir carries the CURRENT
  // competent.js (sha 3c40151e8dd4, not the first-parent own policy)
  // must exit 2 with the POLICY STOP line — never a mislabeled run.
  // Same symlink setup: the fix text comes from the durable
  // vetphantom scratch copy (sha asserted to the pinned fix sha).
  // NOTE: this leg assumes the BRANCH state (current competent.js is
  // not the own policy) — run the proof on the branch, not in the
  // checked-out first-parent state.
  const fixScratch = path.join(VETPHANTOM_SCRATCH, 'standing-fixed.js');
  const fixScratchText = fs.readFileSync(fixScratch, 'utf8');
  T.ok('scratch fix copy hashes to the pinned fix sha f8fda4295a99',
    crypto.createHash('sha256').update(fixScratchText).digest('hex') === DR.EXPECTED_FIX_SHA,
    'scratch copy sha=' + crypto.createHash('sha256').update(fixScratchText).digest('hex').slice(0, 12));
  const scratchPolicy = fs.mkdtempSync(path.join(os.tmpdir(), 'bisect-firstparent-policy-'));
  let policyRefusal = null;
  try {
    fs.symlinkSync(path.join(__dirname), path.join(scratchPolicy, 'scripts'), 'dir');
    fs.mkdirSync(path.join(scratchPolicy, 'src', 'js'), { recursive: true });
    fs.symlinkSync(fixScratch, path.join(scratchPolicy, 'src', 'js', 'standing.js'));
    try {
      execSync('node ' + path.join(__dirname, 'bisect-firstparent-driver-20261111.js'),
        { cwd: scratchPolicy, env: Object.assign({}, process.env, { REPO: scratchPolicy, SEEDS: '190391' }), stdio: 'pipe' });
    } catch (e) { policyRefusal = e; }
  } finally {
    fs.rmSync(scratchPolicy, { recursive: true, force: true });
  }
  T.ok('driver run with a wrong-sha policy exits 2 with BISECTFIRSTPARENT STOP (policy)', policyRefusal !== null && policyRefusal.status === 2 &&
    /BISECTFIRSTPARENT STOP: competent\.js sha .* is not the first-parent own-policy sha/.test(String((policyRefusal.stderr || '') + (policyRefusal.stdout || ''))),
    policyRefusal ? ('status=' + policyRefusal.status + ' ' + String(policyRefusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  T.ok('driver refuses an unswapped run at run entry (exit path in source)', driverSrc.indexOf('perform the fix-swap first') !== -1, 'unswapped exit check');
  T.ok('driver refuses a wrong-policy run at run entry (exit path in source)', driverSrc.indexOf('is not the first-parent own-policy sha') !== -1, 'wrong-policy exit check');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 4. Corpus completeness on a synthetic corpus ----
  T.section('4. Corpus completeness — loader names missing seeds');
  // FLAP-IMMUNE (host write flap, 2026-11-12): this section writes
  // NO content. The 8 per-seed files are SYMLINKS to a single
  // template file — a real merge-a per-seed JSON, which parses under
  // the same schema. The loader under test (loadCorpus) only parses
  // each file and counts rows; it does not branch on per-seed
  // content, so identical template content exercises exactly the
  // completeness / missing-seed logic asserted here. Per-seed content
  // variation (survival counting, decision rules) is covered in §5
  // via in-memory synthRows, which needs no files at all.
  const templateFile = path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-bisect-merge-a', 'bisect-merge-s190391-bisect-merge-pilot-fix.json');
  T.ok('template per-seed JSON exists (merge-a corpus)', fs.existsSync(templateFile), templateFile);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bisect-firstparent-proof-'));
  function fakeRow(seed, lost) {
    return {
      seed: seed, anchorCommit: 'proof', standingFix: true, standingSha: 'f8fda4295a99',
      policySha: 'a7ff5c516440',
      days: lost ? 100 : 150, endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
    };
  }
  for (const seed of SC.SEEDS) {
    fs.symlinkSync(templateFile, path.join(tmp, 'bisect-firstparent-s' + seed + '-bisect-firstparent-pilot-fix.json'));
  }
  let corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('full synthetic corpus loads 8/8 complete', corpus.complete === true && corpus.rows.length === 8 && corpus.missing.length === 0,
    'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
  fs.unlinkSync(path.join(tmp, 'bisect-firstparent-s190397-bisect-firstparent-pilot-fix.json'));
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
    T.ok(n + '/8 -> FIRSTPARENT_SURVIVES', SC.judge(a).verdict === 'FIRSTPARENT_SURVIVES', SC.judge(a).verdict);
  }
  for (const n of [4, 3]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/8 -> INCONCLUSIVE', SC.judge(a).verdict === 'INCONCLUSIVE', SC.judge(a).verdict);
  }
  for (const n of [2, 1, 0]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/8 -> FIRSTPARENT_COLLAPSES', SC.judge(a).verdict === 'FIRSTPARENT_COLLAPSES', SC.judge(a).verdict);
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
