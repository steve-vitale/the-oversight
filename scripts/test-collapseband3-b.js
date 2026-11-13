#!/usr/bin/env node
// test-collapseband3-b.js — proof test for the CONFIRM leg on
// bisect round-7 cut (arm sim-collapseband3-b, Loop B confirm duty).
//
// THE QUESTION (evidence/2026-11-13/sim-bisect-r7-cut-a.md): Loop A
// landed CUT7_COLLAPSED (2/8 survived, median 144d) + REGIONAL_INTACT
// (8/8) on base 21fc590d0 (the 361st commit in the window
// d229b58f5..203a32775, 2026-11-10 05:43 UTC, "journey-social-life
// r167: refresh measurement neutrality proof on rebased tree"), on the
// vetphantom band 190391–190398 — with a corpus deep-identical to
// r5-cut2/r6-cut. Both legs used the SAME 8 seeds, so the collapse has
// never been tested on fresh seeds. This arm re-runs that leg on a
// FRESH 16-seed band 190737–190752 to test whether the collapse
// generalizes or was band noise. Instrument-only: ZERO src/js changes
// committed. This leg also judges the ARC IV / rank correlation
// (tracker 1130Z blank #4): ARC-TRACKS-RANK iff ARC IV fires on
// every regional seed and on no village-rank seed.
//
// THE FIX-SWAP: this base predates the r131 roster-check fix, so
// src/js/standing.js on disk is the PRE-FIX version (sha256
// 98c8bfad70d7...). The fix standing.js (sha256 f8fda4295a99...,
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
//      cut would be uninterpretable. BASE DIFFERENCE (real,
//      not a test bug): ladder.js at this base has NO
//      countLivingVeterans — its _ladderLivingVeterans is the old
//      inline rule (vp && !vp.dead, no roster check), while
//      5157782a4/3f136f07e/master use the
//      shared countLivingVeterans (roster check + scholar counts,
//      commit 3995d21d6). At THIS base (21fc590d0) the ladder is the
//      old inline rule (vp && !vp.dead, no roster check) with the LEG 3
//      tribute scholar-readiness fix layered on: the scholar is NEVER
//      counted (`vid === this.villagerId) return false`). The merge-base
//      d229b58f5 counted the scholar as always living; the merge base
//      e4dbe581b also never counts the scholar. So after a TB fall the
//      ladder still reads 1 (the vp record is not marked dead by
//      tbVillagerFalls) while the swapped-in readiness gate and the
//      instrument read 0 — and a scholar kill reads 1 in readiness /
//      instrument but 0 in the ladder on THIS base. The test detects
//      BOTH rules the LOADED game carries (roster check + scholar
//      rule, from _ladderLivingVeterans source) and asserts the
//      matching count on either base; the survival read comes from
//      the harness end state, not the ladder.
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190737–190752, the fresh confirm band. A confirm on the wrong
//      seeds answers nothing.
//   3. Driver leg guard (swap-aware) — legGuard accepts the swapped
//      fix text (marker + exact fix sha f8fda4295a99, read from the
//      pinned vetphantom commit, never live disk) and refuses the
//      pre-fix round-7-cut text (no marker, sha 98c8bfad70d7); the driver
//      refuses a wrong-sha swap at run entry (proven by a real
//      subprocess run against a scratch repo) and never runs its
//      main loop when required as a module.
//   4. Corpus completeness — the analyzer's loader reports 16/16
//      complete on a full synthetic corpus and names the missing seed
//      on a partial one.
//   1b. Scholar-count rule — a scholar wave-3 kill reads 1 in the
//      swapped-in readiness gate and the instrument, and the ladder
//      count matches whichever scholar rule the loaded game carries
//      (0 under this base's LEG 3 never-counts rule, 1 elsewhere).
//   5. Survival read matches the summary — analyzeRows counts
//      survivors from the per-seed villageLost flag, and the judge
//      maps every survived count to the prereg verdict (≤4
//      CONFIRMED, ≥12 REFUTED, 5–11 INCONCLUSIVE),
//      plus the pre-registered rank read (regional reach: ≥11
//      REGIONAL_INTACT, ≤4 RANK_STALL, 5–10 RANK_INCONCLUSIVE).
//   6. ARC IV read — analyzeRows records ARC IV fired/not per seed
//      from the vetSays capture, and the judge maps the pattern to
//      the pre-registered verdict (ARC-TRACKS-RANK iff ARC IV fires
//      on every regional seed and on no village-rank seed; else
//      ARC-DIVERGES with the diverging seeds listed).
//
// Usage: node scripts/test-collapseband3-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./collapseband3-b-analyze-20261113');
const DR = require('./collapseband3-b-driver-20261113');
const T = K.reporter('collapseband3-b');

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
  // Steve 2026-11-10: the scholar counts as a villager for the
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

  // ---- 2. Seed-band identity: exactly the fresh confirm band ----
  T.section('2. Seed-band identity — 190737–190752, the fresh confirm band');
  T.ok('analyzer SEEDS = 190737–190752', JSON.stringify(SC.SEEDS) === JSON.stringify([190737, 190738, 190739, 190740, 190741, 190742, 190743, 190744, 190745, 190746, 190747, 190748, 190749, 190750, 190751, 190752]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'collapseband3-b-driver-20261113.js'), 'utf8');
  T.ok('driver writes to perseed-collapseband3-b', driverSrc.indexOf('perseed-collapseband3-b') !== -1, 'outDir check');
  T.ok('driver does NOT write to the vetphantom corpus', driverSrc.indexOf('perseed-vetphantom-b') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the anchor corpus', driverSrc.indexOf('perseed-bisect-anchor-a') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'collapseband3-b-analyze-20261113.js'), 'utf8');
  T.ok('analyzer reads perseed-collapseband3-b', analyzerSrc.indexOf('perseed-collapseband3-b') !== -1, 'DIR check');
  T.ok('analyzer compares against r7 cut leg 2/8', analyzerSrc.indexOf('R7CUT_SURVIVED = 2') !== -1, 'baseline check');

  // ---- 3. Driver leg guard (swap-aware): accepts fix, refuses pre-fix ----
  T.section('3. Driver leg guard (swap-aware) — fix accepted, pre-fix refused');
  // HERMETIC (sim-findings-a 2026-11-11): the fix text comes from the
  // pinned vetphantom commit, never from live on-disk standing.js —
  // on current master the on-disk file carries the marker but a later
  // sha, and the old read made this proof base-state-bound (the driver
  // then also exited at require time; see the driver change).
  const fixText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const preFixText = execSync('git show 21fc590d0:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const gFix = DR.legGuard(fixText);
  T.ok('legGuard accepts the swapped fix text', gFix.ok === true && gFix.fix === true, 'ok=' + gFix.ok + ' sha=' + gFix.sha);
  T.ok('legGuard records the vetphantom fix sha f8fda4295a99', gFix.sha === 'f8fda4295a99' && gFix.shaFull === DR.EXPECTED_FIX_SHA,
    'sha=' + gFix.sha);
  const gPre = DR.legGuard(preFixText);
  T.ok('legGuard refuses the pre-fix round-7-cut text (no marker)', gPre.ok === false && gPre.fix === false, 'ok=' + gPre.ok + ' fix=' + gPre.fix);
  T.ok('legGuard records the pre-fix sha 98c8bfad70d7', gPre.sha === '98c8bfad70d7' && gPre.shaFull === DR.PRE_FIX_SHA,
    'sha=' + gPre.sha);
  T.ok('legGuard refuses a marker-bearing text with the wrong sha', DR.legGuard('ROSTER CHECK\n' + preFixText).ok === false,
    'wrong-sha marker text refused');
  T.ok('legGuard refuses a non-string', DR.legGuard(null).ok === false && DR.legGuard(undefined).ok === false, 'null/undefined refused');
  T.ok('the pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present in the pinned fix text');
  // Real refusal: the driver run as a script against a scratch REPO
  // whose standing.js carries the marker but a WRONG sha must exit 2
  // with the COLLAPSEBAND3B STOP line — never a mislabeled run. The
  // scratch repo is a scripts symlink + a wrong standing.js; nothing
  // on the live tree is touched.
  const scratchRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'collapseband3-b-refusal-'));
  let refusal = null;
  try {
    fs.symlinkSync(path.join(__dirname), path.join(scratchRepo, 'scripts'), 'dir');
    fs.mkdirSync(path.join(scratchRepo, 'src', 'js'), { recursive: true });
    fs.writeFileSync(path.join(scratchRepo, 'src', 'js', 'standing.js'),
      '// ROSTER CHECK — deliberately wrong swap for the refusal leg\nmodule.exports = {};\n');
    try {
      execSync('node ' + path.join(__dirname, 'collapseband3-b-driver-20261113.js'),
        { cwd: scratchRepo, env: Object.assign({}, process.env, { REPO: scratchRepo, SEEDS: '190737' }), stdio: 'pipe' });
    } catch (e) { refusal = e; }
  } finally {
    fs.rmSync(scratchRepo, { recursive: true, force: true });
  }
  T.ok('driver run with a wrong-sha swap exits 2 with COLLAPSEBAND3B STOP', refusal !== null && refusal.status === 2 &&
    /COLLAPSEBAND3B STOP: standing\.js has the marker but sha .* is not the vetphantom fix sha/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  T.ok('driver refuses an unswapped run at run entry (exit path in source)', driverSrc.indexOf('perform the fix-swap first') !== -1, 'unswapped exit check');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 4. Corpus completeness on a synthetic corpus ----
  T.section('4. Corpus completeness — loader names missing seeds');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'collapseband3-b-proof-'));
  function fakeRow(seed, lost, arcDay) {
    return {
      seed: seed, anchorCommit: 'proof', standingFix: true, standingSha: 'f8fda4295a99',
      days: lost ? 100 : 150, endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
      vetSays: (typeof arcDay === 'number') ? [{ day: arcDay, line: '◈ ARC IV — THE INEFFICIENCY. SYSTEM: "ROUNDING ERROR RECLASSIFIED: ANOMALY."' }] : [],
    };
  }
  for (const seed of SC.SEEDS) {
    fs.writeFileSync(path.join(tmp, 'collapseband3-b-s' + seed + '-collapseband3-b-pilot-fix.json'), JSON.stringify(fakeRow(seed, seed === 190741)) + '\n');
  }
  let corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('full synthetic corpus loads 16/16 complete', corpus.complete === true && corpus.rows.length === 16 && corpus.missing.length === 0,
    'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
  fs.unlinkSync(path.join(tmp, 'collapseband3-b-s190743-collapseband3-b-pilot-fix.json'));
  corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('partial corpus reports incomplete', corpus.complete === false, 'complete=' + corpus.complete);
  T.ok('partial corpus names the missing seed', JSON.stringify(corpus.missing) === JSON.stringify([190743]),
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
  for (const n of [16, 14, 12]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok('analyzeRows counts ' + n + '/16 survived', a.survived === n, 'survived=' + a.survived);
    T.ok(n + '/16 -> REFUTED', SC.judge(a).verdict === 'REFUTED', SC.judge(a).verdict);
  }
  for (const n of [11, 8, 5]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/16 -> INCONCLUSIVE', SC.judge(a).verdict === 'INCONCLUSIVE', SC.judge(a).verdict);
  }
  for (const n of [4, 2, 0]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/16 -> CONFIRMED', SC.judge(a).verdict === 'CONFIRMED', SC.judge(a).verdict);
  }
  // Rank read (pre-registered): regional reach on the same band.
  function synthRankRows(nRegional) {
    return SC.SEEDS.map(function (seed, i) {
      const row = fakeRow(seed, false);
      row.scaleRank = i < nRegional ? 'regional' : 'village';
      return row;
    });
  }
  for (const n of [16, 13, 11]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok('rank: ' + n + '/16 regional counted', a.wall.regional === n, 'regional=' + a.wall.regional);
    T.ok(n + '/16 regional -> REGIONAL_INTACT', SC.judge(a).rankVerdict === 'REGIONAL_INTACT', SC.judge(a).rankVerdict);
  }
  for (const n of [10, 7, 5]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok(n + '/16 regional -> RANK_INCONCLUSIVE', SC.judge(a).rankVerdict === 'RANK_INCONCLUSIVE', SC.judge(a).rankVerdict);
  }
  for (const n of [4, 2, 0]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok(n + '/16 regional -> RANK_STALL', SC.judge(a).rankVerdict === 'RANK_STALL', SC.judge(a).rankVerdict);
  }
  T.ok('rank: out-of-range 17 -> UNCLASSIFIABLE', SC.classifyRegional(17) === 'UNCLASSIFIABLE', SC.classifyRegional(17));
  T.ok('out-of-range 17 -> UNCLASSIFIABLE', SC.classifySurvived(17) === 'UNCLASSIFIABLE', SC.classifySurvived(17));
  T.ok('out-of-range -1 -> UNCLASSIFIABLE', SC.classifySurvived(-1) === 'UNCLASSIFIABLE', SC.classifySurvived(-1));
  T.ok('NaN -> UNCLASSIFIABLE', SC.classifySurvived(NaN) === 'UNCLASSIFIABLE', String(SC.classifySurvived(NaN)));
  const a6 = SC.analyzeRows(synthRows(12));
  T.ok('12/16 synthetic: median 150d', a6.wall.medianDays === 150, 'median=' + a6.wall.medianDays);
  T.ok('12/16 synthetic: wave4 16/16, wave5 0/16', a6.wall.wave4 === 16 && a6.wall.wave5 === 0, 'wave4=' + a6.wall.wave4 + ' wave5=' + a6.wall.wave5);
  T.ok('12/16 synthetic: death-cause shares count 16 deaths', a6.causes.total === 16 && a6.causes.counts.combat === 16,
    'total=' + a6.causes.total + ' ' + JSON.stringify(a6.causes.counts));

  // ---- 6. ARC IV read (pre-registered, tracker blank #4) ----
  T.section('6. ARC IV read — tracks rank, diverges listed');
  // arcIVFired reads the vetSays capture: a line containing 'ARC IV'.
  T.ok('arcIVFired: ARC IV line present -> fired with its day', (function () { const r = SC.arcIVFired({ vetSays: [{ day: 55, line: '◈ ARC IV — THE INEFFICIENCY.' }] }); return r.fired === true && r.day === 55; })(), 'fired/day check');
  T.ok('arcIVFired: no ARC IV line -> not fired', SC.arcIVFired({ vetSays: [{ day: 10, line: 'REMEMBER the name.' }] }).fired === false, 'absent check');
  T.ok('arcIVFired: missing vetSays -> not fired', SC.arcIVFired({}).fired === false && SC.arcIVFired(null).fired === false, 'missing check');
  T.ok('arcIVFired: non-ARC line mentioning the word ARC alone does not fire', SC.arcIVFired({ vetSays: [{ day: 3, line: 'The ARC of the story bends.' }] }).fired === false, 'ARC-without-IV check');
  function synthArcRows(nRegional, regionalFired, villageFired) {
    // First nRegional seeds are regional (fired per regionalFired),
    // the rest are village-rank (fired per villageFired).
    return SC.SEEDS.map(function (seed, i) {
      const row = fakeRow(seed, false, null);
      const isRegional = i < nRegional;
      row.scaleRank = isRegional ? 'regional' : 'village';
      const fired = isRegional ? regionalFired : villageFired;
      if (fired) row.vetSays = [{ day: 50 + i, line: '◈ ARC IV — THE INEFFICIENCY.' }];
      return row;
    });
  }
  // Cut2confirm-b shape: 14 regional all fired, 2 village none fired.
  let aa = SC.analyzeRows(synthArcRows(14, true, false));
  T.ok('ARC: 14 regional fired + 2 village silent recorded per seed', aa.arc.fired === 14 && aa.perSeed.filter(function (r) { return r.arcIV; }).length === 14, 'fired=' + aa.arc.fired);
  T.ok('ARC: 14/2 clean split -> ARC-TRACKS-RANK', SC.judge(aa).arcVerdict === 'ARC-TRACKS-RANK', SC.judge(aa).arcVerdict);
  T.ok('ARC: clean split lists no diverging seeds', JSON.stringify(SC.judge(aa).arcDiverging) === JSON.stringify([]), 'diverging=' + JSON.stringify(SC.judge(aa).arcDiverging));
  // One regional seed silent -> diverges, listing exactly that seed.
  aa = SC.analyzeRows(SC.SEEDS.map(function (seed, i) {
    const row = fakeRow(seed, false, null);
    row.scaleRank = i < 14 ? 'regional' : 'village';
    if (i < 13) row.vetSays = [{ day: 50, line: '◈ ARC IV — THE INEFFICIENCY.' }];
    return row;
  }));
  T.ok('ARC: one silent regional seed -> ARC-DIVERGES', SC.judge(aa).arcVerdict === 'ARC-DIVERGES', SC.judge(aa).arcVerdict);
  T.ok('ARC: diverging list names the silent regional seed', JSON.stringify(SC.judge(aa).arcDiverging) === JSON.stringify([190750]), 'diverging=' + JSON.stringify(SC.judge(aa).arcDiverging));
  // One village-rank seed fired -> diverges, listing exactly that seed.
  aa = SC.analyzeRows(SC.SEEDS.map(function (seed, i) {
    const row = fakeRow(seed, false, null);
    row.scaleRank = i < 14 ? 'regional' : 'village';
    if (i < 14 || i === 14) row.vetSays = [{ day: 50, line: '◈ ARC IV — THE INEFFICIENCY.' }];
    return row;
  }));
  T.ok('ARC: one fired village-rank seed -> ARC-DIVERGES', SC.judge(aa).arcVerdict === 'ARC-DIVERGES', SC.judge(aa).arcVerdict);
  T.ok('ARC: diverging list names the fired village-rank seed', JSON.stringify(SC.judge(aa).arcDiverging) === JSON.stringify([190751]), 'diverging=' + JSON.stringify(SC.judge(aa).arcDiverging));
  // National seeds are unconstrained: a fired national seed never diverges.
  aa = SC.analyzeRows(SC.SEEDS.map(function (seed, i) {
    const row = fakeRow(seed, false, null);
    row.scaleRank = i < 14 ? 'regional' : (i === 14 ? 'national' : 'village');
    if (i < 14 || i === 14) row.vetSays = [{ day: 50, line: '◈ ARC IV — THE INEFFICIENCY.' }];
    return row;
  }));
  T.ok('ARC: fired national seed does not diverge', SC.judge(aa).arcVerdict === 'ARC-TRACKS-RANK', SC.judge(aa).arcVerdict);
  // Per-seed arcIVDay recorded from the capture.
  aa = SC.analyzeRows(synthArcRows(16, true, false));
  T.ok('ARC: arcIVDay recorded per seed', aa.perSeed.every(function (r) { return r.arcIV === true && typeof r.arcIVDay === 'number'; }), 'arcIVDay check');

  // ---- 7. Leg-2 judge (ARC-negative attempt, rank/ARC only) ----
  T.section('7. Leg-2 judge — ARC-negative attempt on 190607+190614');
  T.ok('analyzer LEG2_SEEDS = [190607, 190614]', JSON.stringify(SC.LEG2_SEEDS) === JSON.stringify([190607, 190614]),
    'LEG2_SEEDS=' + JSON.stringify(SC.LEG2_SEEDS));
  T.ok('analyzer LEG2_RUN = collapseband3-b-leg2', SC.LEG2_RUN === 'collapseband3-b-leg2', 'LEG2_RUN=' + SC.LEG2_RUN);
  function synthLeg2Rows(rankA, firedA, rankB, firedB) {
    const a = fakeRow(190607, true, null); a.scaleRank = rankA; a.vetSays = firedA ? [{ day: 55, line: '◈ ARC IV — THE INEFFICIENCY.' }] : [];
    const b = fakeRow(190614, true, null); b.scaleRank = rankB; b.vetSays = firedB ? [{ day: 60, line: '◈ ARC IV — THE INEFFICIENCY.' }] : [];
    return [a, b];
  }
  T.ok('leg2: both village-rank + both silent -> NEGATIVE-HALF-CONFIRMED',
    SC.judgeLeg2(synthLeg2Rows('village', false, 'village', false)).verdict === 'NEGATIVE-HALF-CONFIRMED',
    SC.judgeLeg2(synthLeg2Rows('village', false, 'village', false)).verdict);
  T.ok('leg2: one seed reaches regional -> NEGATIVE-HALF-UNTESTED',
    SC.judgeLeg2(synthLeg2Rows('regional', true, 'village', false)).verdict === 'NEGATIVE-HALF-UNTESTED',
    SC.judgeLeg2(synthLeg2Rows('regional', true, 'village', false)).verdict);
  T.ok('leg2: both reach regional -> NEGATIVE-HALF-UNTESTED',
    SC.judgeLeg2(synthLeg2Rows('regional', true, 'regional', true)).verdict === 'NEGATIVE-HALF-UNTESTED',
    SC.judgeLeg2(synthLeg2Rows('regional', true, 'regional', true)).verdict);
  T.ok('leg2: a village-rank seed fires ARC IV -> NEGATIVE-HALF-DIVERGES',
    SC.judgeLeg2(synthLeg2Rows('village', true, 'village', false)).verdict === 'NEGATIVE-HALF-DIVERGES',
    SC.judgeLeg2(synthLeg2Rows('village', true, 'village', false)).verdict);
  T.ok('leg2: a seed reaching national -> NEGATIVE-HALF-UNTESTED',
    SC.judgeLeg2(synthLeg2Rows('national', true, 'village', false)).verdict === 'NEGATIVE-HALF-UNTESTED',
    SC.judgeLeg2(synthLeg2Rows('national', true, 'village', false)).verdict);
  T.ok('leg2: incomplete corpus -> UNCLASSIFIABLE',
    SC.judgeLeg2([synthLeg2Rows('village', false, 'village', false)[0]]).verdict === 'UNCLASSIFIABLE',
    SC.judgeLeg2([synthLeg2Rows('village', false, 'village', false)[0]]).verdict);
  // Leg-2 loader: reads the leg-2 corpus dir with the leg-2 RUN filename.
  const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'collapseband3-b-leg2-proof-'));
  fs.mkdirSync(path.join(tmp2, 'perseed-collapseband3-b-leg2'), { recursive: true });
  const leg2Dir = path.join(tmp2, 'perseed-collapseband3-b-leg2');
  for (const seed of SC.LEG2_SEEDS) {
    fs.writeFileSync(path.join(leg2Dir, 'collapseband3-b-s' + seed + '-collapseband3-b-leg2-fix.json'), JSON.stringify(fakeRow(seed, true)) + '\n');
  }
  // loadLeg2Corpus reads SC.LEG2_DIR (the repo path); exercise the filename
  // pattern directly instead: the leg-2 files must exist under the leg-2 RUN name.
  T.ok('leg2: per-seed files use the leg-2 RUN name',
    fs.existsSync(path.join(leg2Dir, 'collapseband3-b-s190607-collapseband3-b-leg2-fix.json')) &&
    fs.existsSync(path.join(leg2Dir, 'collapseband3-b-s190614-collapseband3-b-leg2-fix.json')),
    'leg2 filenames check');
  T.ok('leg2: perSeedFile(seed, dir, run) builds the leg-2 filename',
    SC.perSeedFile(190607, leg2Dir, SC.LEG2_RUN) === path.join(leg2Dir, 'collapseband3-b-s190607-collapseband3-b-leg2-fix.json'),
    SC.perSeedFile(190607, leg2Dir, SC.LEG2_RUN));
  fs.rmSync(tmp2, { recursive: true, force: true });

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
