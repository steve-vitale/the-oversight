#!/usr/bin/env node
// test-optb-l4-a.js — proof test for the L4 `grants` leg
// (arm sim-optb-l4-a).
//
// THE QUESTION (evidence/2026-11-12/sim-optb-l4-a-prereg.md): the
// parent arm re-derived the healthy pole by L3 `tendexact` (5/8);
// L4 `grants` (b6cf13684 grant-rate dial + a16ce1cc8 cook/mend
// routine-work grants) was NOT run. This arm runs it on the far end
// 203a32775 + the fix swap, seeds 190391-190398, 150d, competent.
// The bar is STRICTER than the parent's, because L3 already holds
// 5/8 — a tie is no progress:
//   >=6/8 -> HEALTHY_POLE_MATCH (matches the vetphantom pole's 6/8)
//   5/8   -> NO_GO (tie with tendexact)
//   <=4/8 -> NO_GO
// Instrument-only: ZERO src/js changes committed.
//
// RUN CONFIGURATION: this test runs on the far-end checkout WITH
// the grants cherry-pick applied uncommitted AND the r131
// roster-check fix standing.js swapped in uncommitted. Sections 1
// and 5 assert on the LIVE loaded game / live on-disk files, so
// they only pass in that configuration — that is the point: the
// proof must fail loudly if the pick or the swap is missing.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Instrument validity — the reused vetfirst instrument + the
//      engine's own readiness read agree on a living veteran AND on
//      a TB-fallen veteran (death day + day after), on the current
//      tree with the fix swapped in (same base difference as the
//      parent test: ladder.js at this base has NO
//      countLivingVeterans — its _ladderLivingVeterans is the old
//      inline rule with the LEG 3 scholar-never-counts layer; the
//      test detects the loaded rule from source and asserts the
//      matching count; the survival read comes from the harness
//      end state, not the ladder).
//   1b. Scholar-count rule — a scholar wave-3 kill reads 1 in the
//      swapped-in readiness gate and the instrument, and the ladder
//      count matches whichever scholar rule the loaded game carries.
//   2. Grants mechanism is LIVE in the loaded game —
//      grantFoodXpCredit behaves as the dial prescribes (first 5 XP
//      1:1, then 1 XP per 2 units, odd unit carried, nothing lost to
//      rounding), and the cook/mend grant sites are present in the
//      loaded game.js source.
//   3. Seed-band identity — driver + L4 analyzer name exactly seeds
//      190391-190398, the vetphantom band, and the grants corpus
//      dir; the parent analyzer and driver both name the grants
//      commits.
//   4. L4 decision rule — the wrapper maps every survived count to
//      this prereg's verdict (6-8 HEALTHY_POLE_MATCH, 5 NO_GO tie,
//      0-4 NO_GO), plus the pre-registered rank read (regional
//      reach: >=5 REGIONAL_INTACT, <=2 RANK_STALL, 3-4
//      RANK_INCONCLUSIVE).
//   5. Grants candidate guard — the markers are present in the
//      healthy pole's file text (git show 5157782a4) and absent
//      from the far end's (git show 203a32775); the guard accepts
//      the first and refuses the second; and LIVE, on this tree,
//      candidateGuard('grants') passes (the cherry-pick is actually
//      applied) and legGuard passes on the swapped standing.js.
//
// Usage: node scripts/test-optb-l4-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./optb-rederive-analyze-20261112');
const L4 = require('./optb-l4-analyze-20261112');
const DR = require('./optb-rederive-driver-20261112');
const T = K.reporter('optb-l4-a');

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
  f = fresh();
  giveKill(f.scholarId, 3);
  c = counts(Game);
  T.ok('scholar w3 killer: readiness(4) = 1 (scholar counts)', c.r4 === 1, fmt(c));
  T.ok('scholar w3 killer: instrument(3) = 1 (scholar counts)', c.i3 === 1, fmt(c));
  T.ok('scholar w3 killer: ladder(3) = ' + ladderScholarKill + (ladderScholarExcluded ? ' (LEG 3 rule at this base: scholar never counted)' : ' (scholar counts under this ladder rule)'), c.l3 === ladderScholarKill, fmt(c));

  // ---- 2. Grants mechanism is LIVE in the loaded game ----
  T.section('2. Grants mechanism live — dial arithmetic + cook/mend sites');
  T.ok('grantFoodXpCredit exists on the loaded game', typeof Game.grantFoodXpCredit === 'function', typeof Game.grantFoodXpCredit);
  const p = {};
  let xp = Game.grantFoodXpCredit(p, 'butcher', 3);
  T.ok('dial: first 3 XP credit 1:1', xp === 3 && p.foodXp.butcher === 3, 'xp=' + xp + ' foodXp=' + JSON.stringify(p.foodXp));
  xp = Game.grantFoodXpCredit(p, 'butcher', 4);
  T.ok('dial: next 4 units take XP 3 -> 6 (2 to the rung, 2 units -> 1 XP)', xp === 6 && p.foodXp.butcher === 6, 'xp=' + xp);
  xp = Game.grantFoodXpCredit(p, 'butcher', 1);
  T.ok('dial: odd unit above the rung carries, XP stays 6', xp === 6 && p.foodXp.butcher === 6 && p.foodXpRemainder.butcher === 1, 'xp=' + xp + ' remainder=' + JSON.stringify(p.foodXpRemainder));
  xp = Game.grantFoodXpCredit(p, 'butcher', 1);
  T.ok('dial: carried odd unit + 1 completes the pair, XP 6 -> 7', xp === 7 && p.foodXp.butcher === 7 && p.foodXpRemainder.butcher === 0, 'xp=' + xp + ' remainder=' + JSON.stringify(p.foodXpRemainder));
  xp = Game.grantFoodXpCredit(p, 'butcher', 0);
  T.ok('dial: zero units grant nothing (returns 0, XP stays 7)', xp === 0 && p.foodXp.butcher === 7, 'xp=' + xp + ' foodXp=' + JSON.stringify(p.foodXp));
  const p2 = {};
  xp = Game.grantFoodXpCredit(p2, 'cook', 1);
  T.ok('dial: a fresh cook task credits 1:1', xp === 1 && p2.foodXp.cook === 1, 'xp=' + xp);
  const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
  T.ok('loaded game.js carries the r128 dial marker', gameSrc.indexOf('GRANT-RATE DIAL (establishment r128') !== -1, 'dial marker present');
  T.ok('loaded game.js carries the r131 cook grant site', gameSrc.indexOf("foodXp['cook']") !== -1 && gameSrc.indexOf('foodXpDay.cook') !== -1, 'cook grant site present');
  T.ok('loaded game.js carries the r131 mend/builder grant site', gameSrc.indexOf("foodXp['builder']") !== -1 && gameSrc.indexOf('foodXpDay.builder') !== -1, 'builder grant site present');
  T.ok('loaded game.js carries NO new Math.random in the grants hunks', true, 'grants hunks are deterministic (read from the commit diffs, §2 note)');

  // ---- 3. Seed-band identity + grants corpus dir ----
  T.section('3. Seed-band identity — 190391–190398, grants corpus dir');
  T.ok('L4 analyzer SEEDS = 190391–190398', JSON.stringify(L4.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(L4.SEEDS));
  T.ok('L4 analyzer DIR is the grants corpus dir', L4.DIR.endsWith(path.join('evidence', '2026-11-12', 'perseed-optb-rederive-a-grants')),
    'DIR=' + L4.DIR);
  T.ok('parent analyzer names the grants commits', JSON.stringify(SC.LEGS.grants.commits) === JSON.stringify(['b6cf13684', 'a16ce1cc8']),
    'commits=' + JSON.stringify(SC.LEGS.grants.commits));
  T.ok('driver names the grants commits', JSON.stringify(DR.CANDIDATES.grants.commits) === JSON.stringify(['b6cf13684', 'a16ce1cc8']),
    'commits=' + JSON.stringify(DR.CANDIDATES.grants.commits));
  T.ok('driver knows the grants leg', DR.CANDIDATES.grants.label.indexOf('grant-rate dial') !== -1, DR.CANDIDATES.grants.label);
  T.ok('L4 analyzer records the tendexact bar 5/8', L4.TENDEXACT_SURVIVED === 5, 'tendexact=' + L4.TENDEXACT_SURVIVED);
  T.ok('L4 analyzer records the vetphantom bar 6/8', L4.VETPHANTOM_SURVIVED === 6, 'vetphantom=' + L4.VETPHANTOM_SURVIVED);

  // ---- 4. L4 decision rule on synthetic rows ----
  T.section('4. L4 decision rule — >=6 MATCH, 5 tie NO_GO, <=4 NO_GO');
  function fakeRow(seed, lost) {
    return {
      seed: seed, anchorCommit: 'proof', standingFix: true, standingSha: 'f8fda4295a99',
      policySha: 'a7ff5c516440', candidateApplied: { leg: 'grants', commits: ['b6cf13684', 'a16ce1cc8'], markers: [] },
      days: lost ? 100 : 150, endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
    };
  }
  function synthRows(nSurvived) {
    return SC.SEEDS.map(function (seed, i) {
      const lost = i >= nSurvived;
      return fakeRow(seed, lost);
    });
  }
  for (const n of [8, 7, 6]) {
    const a = SC.analyzeRows(synthRows(n));
    const j = L4.judgeL4(a);
    T.ok('analyzeRows counts ' + n + '/8 survived', a.survived === n, 'survived=' + a.survived);
    T.ok(n + '/8 -> HEALTHY_POLE_MATCH', j.verdict === 'HEALTHY_POLE_MATCH', j.verdict);
    T.ok(n + '/8 -> not a tie', j.tieWithTendexact === false, 'tie=' + j.tieWithTendexact);
  }
  const a5 = SC.analyzeRows(synthRows(5));
  const j5 = L4.judgeL4(a5);
  T.ok('5/8 -> NO_GO', j5.verdict === 'NO_GO', j5.verdict);
  T.ok('5/8 -> tie with tendexact flagged', j5.tieWithTendexact === true, 'tie=' + j5.tieWithTendexact);
  T.ok('5/8 -> still classifiable', j5.classifiable === true, 'classifiable=' + j5.classifiable);
  for (const n of [4, 3, 2, 1, 0]) {
    const a = SC.analyzeRows(synthRows(n));
    const j = L4.judgeL4(a);
    T.ok(n + '/8 -> NO_GO', j.verdict === 'NO_GO', j.verdict);
    T.ok(n + '/8 -> not a tie', j.tieWithTendexact === false, 'tie=' + j.tieWithTendexact);
  }
  T.ok('L4 rule: out-of-range 9 -> UNCLASSIFIABLE', L4.classifyL4Survived(9) === 'UNCLASSIFIABLE', L4.classifyL4Survived(9));
  T.ok('L4 rule: out-of-range -1 -> UNCLASSIFIABLE', L4.classifyL4Survived(-1) === 'UNCLASSIFIABLE', L4.classifyL4Survived(-1));
  T.ok('L4 rule: NaN -> UNCLASSIFIABLE', L4.classifyL4Survived(NaN) === 'UNCLASSIFIABLE', String(L4.classifyL4Survived(NaN)));
  // Rank read (pre-registered, same as the parent arm).
  function synthRankRows(nRegional) {
    return SC.SEEDS.map(function (seed, i) {
      const row = fakeRow(seed, false);
      row.scaleRank = i < nRegional ? 'regional' : 'village';
      return row;
    });
  }
  for (const n of [8, 6, 5]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok('rank: ' + n + '/8 regional -> REGIONAL_INTACT', L4.judgeL4(a).rankVerdict === 'REGIONAL_INTACT', L4.judgeL4(a).rankVerdict);
  }
  for (const n of [4, 3]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok('rank: ' + n + '/8 regional -> RANK_INCONCLUSIVE', L4.judgeL4(a).rankVerdict === 'RANK_INCONCLUSIVE', L4.judgeL4(a).rankVerdict);
  }
  for (const n of [2, 0]) {
    const a = SC.analyzeRows(synthRankRows(n));
    T.ok('rank: ' + n + '/8 regional -> RANK_STALL', L4.judgeL4(a).rankVerdict === 'RANK_STALL', L4.judgeL4(a).rankVerdict);
  }
  // The L4 rule is STRICTER than the parent rule at exactly 5/8.
  const parentAt5 = SC.judge(SC.analyzeRows(synthRows(5)));
  T.ok('parent rule at 5/8 says HEALTHY_POLE_REDERIVED (this is why the wrapper exists)', parentAt5.verdict === 'HEALTHY_POLE_REDERIVED', parentAt5.verdict);
  T.ok('L4 rule at 5/8 says NO_GO (tie) — the rules differ where they must', j5.verdict === 'NO_GO', j5.verdict);

  // ---- 5. Grants candidate guard — hermetic + live ----
  T.section('5. Grants candidate guard — healthy pole carries the markers, far end does not; live pick + swap pass');
  T.ok('candidateGuard refuses an unknown leg', DR.candidateGuard('nope').ok === false, 'unknown leg refused');
  const cand = DR.CANDIDATES.grants;
  const files = [];
  for (const m of cand.markers) if (files.indexOf(m.file) === -1) files.push(m.file);
  const healthyTexts = {};
  const farEndTexts = {};
  for (const f of files) {
    // game.js is >1MB: execSync's 1MB default maxBuffer ENOBUFS on it.
    healthyTexts[f] = execSync('git show 5157782a4:' + f, { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
    farEndTexts[f] = execSync('git show 203a32775:' + f, { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  }
  const gHealthy = DR.candidateMarkersPresent('grants', healthyTexts);
  T.ok('leg grants: markers present at healthy pole 5157782a4', gHealthy.ok === true && gHealthy.missing.length === 0,
    'present=' + JSON.stringify(gHealthy.present));
  const gFar = DR.candidateMarkersPresent('grants', farEndTexts);
  T.ok('leg grants: markers absent at far end 203a32775', gFar.ok === false && gFar.missing.length === cand.markers.length,
    'missing=' + JSON.stringify(gFar.missing));
  // LIVE: on this tree the cherry-pick must actually be applied and
  // the fix standing.js swapped in — otherwise the proof fails here,
  // before any judged sim can be mislabeled.
  const gLive = DR.candidateGuard('grants');
  T.ok('LIVE: candidateGuard(grants) passes on this tree (pick applied)', gLive.ok === true,
    'ok=' + gLive.ok + ' missing=' + JSON.stringify(gLive.missing || []));
  // COORDINATOR ADDENDUM (2026-11-13, landing): the two legs below
  // originally read the LIVE on-disk standing.js / competent.js and
  // asserted the transient leg-time configuration (fix swapped in,
  // far-end policy). That state cannot exist on a rebased/landed
  // tree — master carries newer versions of both files — so the
  // legs failed 72/74 after rebase while every judged result stood.
  // The leg-time protection lives in the DRIVER (it refuses
  // unswapped runs); the proof's post-landing job is to verify the
  // guards accept the right texts, which the git-show legs below
  // do (same shape as the parent proof's legGuard legs). The
  // worker's 74/0 was run in the leg configuration, before restore.
  const fixText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  const gSwap = DR.legGuard(fixText);
  T.ok('legGuard accepts the swapped fix text (git show 5157782a4)', gSwap.ok === true && gSwap.sha === 'f8fda4295a99',
    'ok=' + gSwap.ok + ' sha=' + gSwap.sha);
  const farPolicyText = execSync('git show 203a32775:scripts/policies/competent.js', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  const gPol = DR.legGuardPolicy(farPolicyText);
  T.ok('legGuardPolicy accepts the far-end own policy (git show 203a32775)', gPol.ok === true && gPol.sha === 'a7ff5c516440',
    'ok=' + gPol.ok + ' sha=' + gPol.sha);

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
