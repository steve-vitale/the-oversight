#!/usr/bin/env node
// test-tendshift-a.js — proof test for the tendexact x stream-shift
// interaction leg (arm sim-tendshift-a).
//
// THE QUESTION (evidence/2026-11-13/sim-tendshift-a-prereg.md): the
// healthy pole 5157782a4 (6/8 on the matched band 190391–190398)
// carries BOTH the tendexact pantry fix AND a stream shifted by
// ~200 commits of dialogue-variety work. Tendexact alone gives 5/8
// on the matched band; the 997-draw reseed alone gives 3/8 and saves
// neither gap seed (0515Z, GAP-NOT-DICE). This arm tests them
// TOGETHER on current master f7352f946: baseline (no burn) vs
// interaction (997-draw burn after setupGame, no code change).
// GO: interaction saves >=1 of {190392, 190394} the baseline LOSES,
// with no regression on any baseline survivor, median >= 0.8x
// baseline median, starvation <= baseline+2. Instrument-only: ZERO
// src/js changes committed. NO fix-swap on this base (master already
// carries the roster-check fix); NO cherry-pick (tendexact is an
// ancestor of master).
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Instrument validity — the reused vetfirst instrument + the
//      engine's own readiness read + the ladder agree on a living
//      veteran AND on a TB-fallen veteran (death day + day after),
//      on current master. If the instrument lied, the legs would be
//      uninterpretable. BASE DIFFERENCE (real, not a test bug):
//      ladder.js on master uses the shared countLivingVeterans
//      (roster check + scholar counts, commit 3995d21d6) — unlike
//      the far-end base's old inline rule. The test detects BOTH
//      rules the LOADED game carries (roster check + scholar rule,
//      from _ladderLivingVeterans source) and asserts the matching
//      count on either base; the survival read comes from the
//      harness end state, not the ladder.
//   1b. Scholar-count rule — a scholar wave-3 kill reads 1 in the
//      readiness gate and the instrument, and the ladder count
//      matches whichever scholar rule the loaded game carries (1
//      under master's shared rule, 0 under the far-end LEG 3
//      never-counts rule).
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190391–190398, the matched band (deliberately reused for
//      comparability with the 0515Z arm-2 legs; see the prereg).
//   3. Driver leg guard (master standing) — legGuard accepts the
//      master standing text (marker + exact master sha f935997640a0,
//      read from the pinned master commit, never live disk) and
//      refuses the pre-fix far-end text (no marker, sha
//      75762cb2259d) and the vetphantom fix text (marker present,
//      wrong sha for THIS base); the driver refuses a wrong-sha
//      swap at run entry (proven by a real subprocess run against a
//      scratch repo) and never runs its main loop when required as
//      a module. The policy guard accepts master's own competent.js
//      and refuses the far-end and vetphantom policies.
//   4. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing
//      seed on a partial one.
//   5. Interaction GO bar — the prereg's conjunctive bar (gap save
//      + no regression + median + starvation) is judged correctly
//      on synthetic per-seed rows, including the regression case, the
//      median case, the starvation case and boundary, and the prereg
//      addendum cases (baseline saves a gap seed: the burn must HOLD
//      it; losing it is a regression, holding it plus saving the
//      other is GO); the survival read matches the summary.
//   5b. Burn design — the observable effect: a 997-draw burn
//      advances the game's own mulberry32 instance by exactly 997
//      draws (proven on the game's mulberry32, not on a re-typed
//      copy); the five module-scope Math.random aliases exist at the
//      recorded lines on this base; the only `Math.random =` in
//      src/js is the _worldRng save/restore pair (a scoped temporary
//      swap, not a per-day reseed).
//   6. Tendexact guard — the exact-split marker is present in the
//      master file text (git show f7352f946) and absent from the far
//      end's (git show 203a32775), and the guard accepts the first
//      and refuses the second; an unknown leg is refused at run
//      entry. The no-code-change checker accepts exactly [] (no
//      swap, no cherry-pick on this base) and refuses any other list.
//   7. Deep-identity comparison — index-aligned snapshot pairing
//      (never day-keyed): the 4-field signature, the first-divergence
//      read, and the duplicate-loss-day-stamp demonstration (a
//      day-keyed pairing FALSELY flags the daily snapshot when only
//      the final snapshot differs; index-aligned pairing flags the
//      final snapshot and nothing else).
//
// Usage: node scripts/test-tendshift-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./tendshift-analyze-20261113');
const DR = require('./tendshift-driver-20261113');
const DD = require('./tendshift-deepdiff-20261113');
const T = K.reporter('tendshift-a');

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
  T.section('1. Instrument validity — engine vs ladder vs instrument (current master)');
  // LADDER RULE (hermetic): the loaded _ladderLivingVeterans is
  // either the shared countLivingVeterans rule (roster check —
  // master) or the old inline rule (vp.dead only, no roster check —
  // the far-end base). The fallen killer counts 0 under the first, 1
  // under the second. SCHOLAR RULE: the shared rule counts the
  // scholar; the far-end LEG 3 layer NEVER counts the scholar
  // (`vid === this.villagerId) return false`). Detect both from the
  // LOADED function source, never from disk — the test asserts the
  // behavior of the code it actually runs, on either base.
  const ladderSrc = String(Game._ladderLivingVeterans);
  const ladderRosterCheck = ladderSrc.indexOf('countLivingVeterans') !== -1;
  const ladderAfterFall = ladderRosterCheck ? 0 : 1;
  const ladderScholarExcluded = ladderSrc.indexOf('vid === this.villagerId) return false') !== -1;
  const ladderScholarKill = ladderScholarExcluded ? 0 : 1;
  T.ok('loaded ladder uses the shared roster-check rule on master', ladderRosterCheck === true, 'countLivingVeterans in source: ' + ladderRosterCheck);
  T.ok('loaded ladder counts the scholar on master', ladderScholarExcluded === false, 'LEG 3 exclusion in source: ' + ladderScholarExcluded);
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
  T.ok('death day: readiness(4) = 0 (no phantom on master)', c.r4 === 0, fmt(c));
  T.ok('death day: ladder(3) = ' + ladderAfterFall + (ladderRosterCheck ? ' (roster-check rule: fallen killer not counted)' : ' (OLD ladder rule: no roster check)'), c.l3 === ladderAfterFall, fmt(c));
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
  // living-veteran bar. The readiness gate counts the scholar and the
  // instrument counts the scholar as living. The LADDER on master
  // counts the scholar too (shared rule); on the far-end base it did
  // NOT (LEG 3). Assert the matching count for whichever rule the
  // loaded game carries.
  f = fresh();
  giveKill(f.scholarId, 3);
  c = counts(Game);
  T.ok('scholar w3 killer: readiness(4) = 1 (scholar counts)', c.r4 === 1, fmt(c));
  T.ok('scholar w3 killer: instrument(3) = 1 (scholar counts)', c.i3 === 1, fmt(c));
  T.ok('scholar w3 killer: ladder(3) = ' + ladderScholarKill + (ladderScholarExcluded ? ' (LEG 3 rule: scholar never counted)' : ' (scholar counts under this ladder rule)'), c.l3 === ladderScholarKill, fmt(c));

  // ---- 2. Seed-band identity: exactly the matched band ----
  T.section('2. Seed-band identity — 190391–190398, the matched band (deliberate reuse)');
  T.ok('analyzer SEEDS = 190391–190398', JSON.stringify(SC.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  T.ok('analyzer knows the two legs', JSON.stringify(Object.keys(SC.LEGS).sort()) === JSON.stringify(['baseline', 'interaction']),
    'LEGS=' + JSON.stringify(Object.keys(SC.LEGS).sort()));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'tendshift-driver-20261113.js'), 'utf8');
  T.ok('driver writes to perseed-tendshift-a-<LEG>', driverSrc.indexOf('perseed-tendshift-a-\' + LEG') !== -1 || driverSrc.indexOf("perseed-tendshift-a-' + LEG") !== -1, 'outDir check');
  T.ok('driver does NOT write to the vetphantom corpus', driverSrc.indexOf('perseed-vetphantom-b') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to a bisect corpus', driverSrc.indexOf('perseed-bisect-') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to an optb-rederive corpus', driverSrc.indexOf('perseed-optb-rederive-a-') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to a gap-candidates corpus', driverSrc.indexOf('perseed-gap-candidates-a-') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to a tendexact-confirm corpus', driverSrc.indexOf('perseed-tendexact-confirm-a-') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'tendshift-analyze-20261113.js'), 'utf8');
  T.ok('analyzer reads perseed-tendshift-a-<LEG>', analyzerSrc.indexOf('perseed-tendshift-a-\' + LEG') !== -1 || analyzerSrc.indexOf("perseed-tendshift-a-' + LEG") !== -1, 'DIR check');
  T.ok('analyzer compares against healthy pole 6/8', analyzerSrc.indexOf('POLE_SURVIVED = 6') !== -1, 'pole check');
  T.ok('analyzer compares against firstparent leg 4/8', analyzerSrc.indexOf('FIRSTPARENT_SURVIVED = 4') !== -1, 'firstparent check');
  T.ok('analyzer names the gap seeds 190392/190394', analyzerSrc.indexOf('GAP_SEEDS = [190392, 190394]') !== -1, 'gap seeds check');
  T.ok('driver carries the 997-draw burn', driverSrc.indexOf('RESEED_BURN = 997') !== -1 && driverSrc.indexOf('for (let i = 0; i < RESEED_BURN; i++) Math.random();') !== -1, 'burn check');
  T.ok('driver burns only on the interaction leg', driverSrc.indexOf("if (LEG === 'interaction')") !== -1, 'interaction-only burn check');

  // ---- 3. Driver leg guard (master standing) + policy guard ----
  T.section('3. Driver leg guard (master standing) — master accepted, pre-fix and vetphantom refused');
  // HERMETIC: the master text comes from the pinned master commit,
  // never from live on-disk standing.js — the test asserts the guard
  // against the base it is bound to, not whatever the disk holds.
  const masterText = execSync('git show f7352f946:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const preFixText = execSync('git show 203a32775:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const vetphantomText = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  const gMaster = DR.legGuard(masterText);
  T.ok('legGuard accepts the master standing text', gMaster.ok === true && gMaster.fix === true, 'ok=' + gMaster.ok + ' sha=' + gMaster.sha);
  T.ok('legGuard records the master sha f935997640a0', gMaster.sha === 'f935997640a0' && gMaster.shaFull === DR.EXPECTED_STANDING_SHA,
    'sha=' + gMaster.sha);
  const gPre = DR.legGuard(preFixText);
  T.ok('legGuard refuses the pre-fix far-end text (no marker)', gPre.ok === false && gPre.fix === false, 'ok=' + gPre.ok + ' fix=' + gPre.fix);
  T.ok('legGuard records the pre-fix sha 75762cb2259d', gPre.sha === '75762cb2259d' && gPre.shaFull === DR.PRE_FIX_SHA,
    'sha=' + gPre.sha);
  const gVet = DR.legGuard(vetphantomText);
  T.ok('legGuard refuses the vetphantom fix text (marker present, wrong sha for THIS base)', gVet.ok === false && gVet.fix === true, 'ok=' + gVet.ok + ' fix=' + gVet.fix);
  T.ok('legGuard records the vetphantom sha f8fda4295a99', gVet.sha === 'f8fda4295a99' && gVet.shaFull === DR.VETPHANTOM_FIX_SHA,
    'sha=' + gVet.sha);
  T.ok('legGuard refuses a marker-bearing text with the wrong sha', DR.legGuard('ROSTER CHECK\n' + preFixText).ok === false,
    'wrong-sha marker text refused');
  T.ok('legGuard refuses a non-string', DR.legGuard(null).ok === false && DR.legGuard(undefined).ok === false, 'null/undefined refused');
  T.ok('the pinned master text HAS the roster-check marker', masterText.indexOf('ROSTER CHECK') !== -1, 'marker present in the pinned master text');
  // Policy guard: master's own competent.js accepted; far-end and
  // vetphantom policies refused.
  const masterPolicy = execSync('git show f7352f946:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const farEndPolicy = execSync('git show 203a32775:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const vetphantomPolicy = execSync('git show 5157782a4:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const pMaster = DR.legGuardPolicy(masterPolicy);
  T.ok('policy guard accepts master competent.js', pMaster.ok === true, 'ok=' + pMaster.ok + ' sha=' + pMaster.sha);
  T.ok('policy guard records the master policy sha 74a890f0844e', pMaster.sha === '74a890f0844e' && pMaster.shaFull === DR.EXPECTED_POLICY_SHA,
    'sha=' + pMaster.sha);
  T.ok('policy guard refuses the far-end policy', DR.legGuardPolicy(farEndPolicy).ok === false && DR.legGuardPolicy(farEndPolicy).shaFull === DR.FAR_END_POLICY_SHA,
    'far-end sha=' + DR.legGuardPolicy(farEndPolicy).sha);
  T.ok('policy guard refuses the vetphantom policy', DR.legGuardPolicy(vetphantomPolicy).ok === false && DR.legGuardPolicy(vetphantomPolicy).shaFull === DR.VETPHANTOM_POLICY_SHA,
    'vetphantom sha=' + DR.legGuardPolicy(vetphantomPolicy).sha);
  // Real refusal: the driver run as a script against a scratch REPO
  // whose standing.js carries the marker but a WRONG sha must exit 2
  // with the TENDSHIFT STOP line — never a mislabeled run. The
  // scratch repo is a scripts symlink + a wrong standing.js; nothing
  // on the live tree is touched.
  const scratchRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'tendshift-refusal-'));
  let refusal = null;
  try {
    fs.symlinkSync(path.join(__dirname), path.join(scratchRepo, 'scripts'), 'dir');
    fs.mkdirSync(path.join(scratchRepo, 'src', 'js'), { recursive: true });
    fs.writeFileSync(path.join(scratchRepo, 'src', 'js', 'standing.js'),
      '// ROSTER CHECK — deliberately wrong swap for the refusal leg\nmodule.exports = {};\n');
    try {
      execSync('node ' + path.join(__dirname, 'tendshift-driver-20261113.js'),
        { cwd: scratchRepo, env: Object.assign({}, process.env, { REPO: scratchRepo, SEEDS: '190391' }), stdio: 'pipe' });
    } catch (e) { refusal = e; }
  } finally {
    fs.rmSync(scratchRepo, { recursive: true, force: true });
  }
  T.ok('driver run with a wrong-sha standing exits 2 with TENDSHIFT STOP', refusal !== null && refusal.status === 2 &&
    /TENDSHIFT STOP: standing\.js has the marker but sha .* is not the current-master sha/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  T.ok('driver refuses an unswapped run at run entry (exit path in source)', driverSrc.indexOf('this driver only runs on master f7352f946') !== -1, 'unswapped exit check');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');
  // Real refusal: an unknown LEG exits 2 at run entry (no sim, no dir).
  let legRefusal = null;
  try {
    execSync('node ' + path.join(__dirname, 'tendshift-driver-20261113.js'),
      { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { LEG: 'nope', SEEDS: '190391' }), stdio: 'pipe' });
  } catch (e) { legRefusal = e; }
  T.ok('driver run with an unknown LEG exits 2 with TENDSHIFT STOP', legRefusal !== null && legRefusal.status === 2 &&
    /TENDSHIFT STOP: unknown LEG nope/.test(String((legRefusal.stderr || '') + (legRefusal.stdout || ''))),
    legRefusal ? ('status=' + legRefusal.status + ' ' + String(legRefusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  T.ok('unknown LEG creates no corpus dir', !fs.existsSync(path.join(__dirname, '..', 'evidence', '2026-11-13', 'perseed-tendshift-a-nope')), 'no stray dir');

  // ---- 4. Corpus completeness on a synthetic corpus ----
  T.section('4. Corpus completeness — loader names missing seeds');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tendshift-proof-'));
  function fakeRow(seed, lost) {
    return {
      seed: seed, anchorCommit: 'proof', standingFix: true, standingSha: 'f935997640a0',
      policySha: '74a890f0844e', candidateApplied: { tendexact: ['e6911eb80'], markers: [], noCodeChange: true, srcJsDiff: [], reseedBurn: null },
      days: lost ? 100 : 150, endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
    };
  }
  for (const seed of SC.SEEDS) {
    fs.writeFileSync(SC.perSeedFile(seed, tmp), JSON.stringify(fakeRow(seed, seed === 190395)) + '\n');
  }
  let corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('full synthetic corpus loads 8/8 complete', corpus.complete === true && corpus.rows.length === 8 && corpus.missing.length === 0,
    'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
  fs.unlinkSync(SC.perSeedFile(190397, tmp));
  corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('partial corpus reports incomplete', corpus.complete === false, 'complete=' + corpus.complete);
  T.ok('partial corpus names the missing seed', JSON.stringify(corpus.missing) === JSON.stringify([190397]),
    'missing=' + JSON.stringify(corpus.missing));
  fs.rmSync(tmp, { recursive: true, force: true });

  // ---- 5. Interaction GO bar (prereg: gap save + no regression + median + starvation) ----
  T.section('5. Interaction GO bar + survival read');
  // Minimal per-seed rows for the judge: only seed / villageLost /
  // days are read. lostSet = seeds marked villageLost; days default
  // 150 survived / 100 lost unless overridden.
  function judgeRows(lostSet, dayOverrides) {
    return SC.SEEDS.map(function (seed) {
      const lost = lostSet.indexOf(seed) !== -1;
      return { seed: seed, villageLost: lost, days: (dayOverrides && dayOverrides[seed] != null) ? dayOverrides[seed] : (lost ? 100 : 150) };
    });
  }
  function barCase(name, baseLost, interLost, baseStarv, interStarv, dayOverrides, wantVerdict, wantGapSaved, wantLostBaseline) {
    const j = SC.judgeInteraction(judgeRows(baseLost), judgeRows(interLost, dayOverrides), baseStarv, interStarv);
    T.ok(name + ' -> ' + wantVerdict, j.verdict === wantVerdict, 'verdict=' + j.verdict + ' gapSaved=' + JSON.stringify(j.gapSaved) + ' lostBaseline=' + JSON.stringify(j.lostBaseline) + ' medianOk=' + j.medianOk + ' starvationOk=' + j.starvationOk);
    T.ok(name + ': gapSaved = ' + JSON.stringify(wantGapSaved), JSON.stringify(j.gapSaved) === JSON.stringify(wantGapSaved), 'gapSaved=' + JSON.stringify(j.gapSaved));
    T.ok(name + ': lostBaseline = ' + JSON.stringify(wantLostBaseline), JSON.stringify(j.lostBaseline) === JSON.stringify(wantLostBaseline), 'lostBaseline=' + JSON.stringify(j.lostBaseline));
  }
  // Baseline loses both gap seeds (far-end shape): 190391/190392/190394/190396 lost.
  barCase('baseline shape, interaction saves 190392', [190391, 190392, 190394, 190396], [190391, 190394, 190396], 1, 1, null, 'GO', [190392], []);
  barCase('baseline shape, interaction saves 190394', [190391, 190392, 190394, 190396], [190391, 190392, 190396], 1, 1, null, 'GO', [190394], []);
  barCase('baseline shape, interaction saves both gap seeds', [190391, 190392, 190394, 190396], [190391, 190396], 1, 1, null, 'GO', [190392, 190394], []);
  barCase('no gap saved', [190391, 190392, 190394, 190396], [190391, 190392, 190394, 190396], 1, 1, null, 'NO_GO', [], []);
  barCase('190392 saved BUT 190397 lost (regression)', [190391, 190392, 190394, 190396], [190391, 190394, 190396, 190397], 1, 1, null, 'NO_GO', [190392], [190397]);
  barCase('gap saved but median fails (all interaction days 100)', [190391, 190392, 190394, 190396], [190391, 190394, 190396], 1, 1,
    { 190391: 100, 190392: 100, 190393: 100, 190394: 100, 190395: 100, 190396: 100, 190397: 100, 190398: 100 }, 'NO_GO', [190392], []);
  barCase('gap saved but starvation fails (1 -> 4)', [190391, 190392, 190394, 190396], [190391, 190394, 190396], 1, 4, null, 'NO_GO', [190392], []);
  barCase('gap saved, starvation at the boundary (1 -> 3)', [190391, 190392, 190394, 190396], [190391, 190394, 190396], 1, 3, null, 'GO', [190392], []);
  // Prereg addendum: baseline already saves a gap seed — the burn
  // must HOLD it.
  barCase('ADDENDUM: baseline saves 190392, interaction LOSES it (regression)', [190391, 190394, 190396], [190391, 190392, 190394, 190396], 1, 1, null, 'NO_GO', [], [190392]);
  barCase('ADDENDUM: baseline saves 190392, interaction HOLDS it and saves 190394', [190391, 190394, 190396], [190391, 190396], 1, 1, null, 'GO', [190394], []);
  // Survival read still matches the summary.
  const a6 = SC.analyzeRows(SC.SEEDS.map(function (seed) { return fakeRow(seed, seed === 190391 || seed === 190396); }));
  T.ok('6/8 synthetic: analyzeRows counts 6 survived', a6.survived === 6, 'survived=' + a6.survived);
  T.ok('6/8 synthetic: median 150d', a6.wall.medianDays === 150, 'median=' + a6.wall.medianDays);
  T.ok('6/8 synthetic: wave4 8/8, wave5 0/8', a6.wall.wave4 === 8 && a6.wall.wave5 === 0, 'wave4=' + a6.wall.wave4 + ' wave5=' + a6.wall.wave5);
  T.ok('6/8 synthetic: death-cause shares count 8 deaths (fakeRow carries one death per row)', a6.causes.total === 8 && a6.causes.counts.combat === 8,
    'total=' + a6.causes.total + ' ' + JSON.stringify(a6.causes.counts));
  T.ok('6/8 synthetic: starvation counted from death records', SC.countStarvationRaw(SC.SEEDS.map(function (seed) {
    const r = fakeRow(seed, false);
    if (seed === 190393) r.deaths.push({ day: 50, kind: 'hunger', who: 'y', cause: 'starvation', player: false });
    return r;
  })) === 1, 'starvation=1');
  T.ok('countStarvationRaw counts only cause starvation', SC.countStarvationRaw([{ deaths: [{ cause: 'combat' }, { cause: 'starvation' }, { cause: 'starvation' }] }]) === 2, 'starvation=2');

  // ---- 5b. Burn design — the observable effect ----
  T.section('5b. Burn design — a 997-draw burn advances the shared mulberry32 instance by exactly 997');
  // The game's own mulberry32 (game.js), not a re-typed copy: two
  // instances from the same seed produce the same stream, and
  // burning 997 draws on one lands it on exactly the 998th draw of
  // the other. That is the effect the interaction leg relies on: the
  // burn shifts every draw site that reads the shared instance.
  const rngA = Game.mulberry32(12345);
  const rngB = Game.mulberry32(12345);
  T.ok('mulberry32 is deterministic from its seed', rngA() === rngB(), 'first draws match');
  const afterBurn = (function () {
    const g = Game.mulberry32(12345);
    for (let i = 0; i < 997; i++) g();
    return g();
  })();
  const expected = (function () {
    const h = Game.mulberry32(12345);
    let v = null;
    for (let i = 0; i < 998; i++) v = h();
    return v;
  })();
  T.ok('a 997-draw burn lands on the 998th draw of the same stream', afterBurn === expected, 'afterBurn=' + afterBurn + ' expected=' + expected);
  T.ok('the burn moves the stream (draw 998 != draw 1)', afterBurn !== Game.mulberry32(12345)(), 'burn changes the next draw');
  // The five module-scope aliases exist at the recorded lines on
  // THIS base (a re-assignment would leave them on the old stream;
  // a burn moves them all — the prereg's design claim, verified in
  // code, not assumed).
  const aliasSites = [
    ['src/js/betrayal.js', 87, 'const R = Math.random;'],
    ['src/js/comms.js', 116, 'var R = Math.random;'],
    ['src/js/corruption.js', 47, 'const R = Math.random;'],
    ['src/js/fieldFights.js', 71, 'var R = Math.random;'],
    ['src/js/finale-campaign.js', 28, 'var R = Math.random;'],
  ];
  for (const site of aliasSites) {
    const lines = fs.readFileSync(path.join(__dirname, '..', site[0]), 'utf8').split('\n');
    T.ok('alias site ' + site[0] + ':' + site[1], (lines[site[1] - 1] || '').trim() === site[2],
      'line ' + site[1] + ' reads: ' + JSON.stringify((lines[site[1] - 1] || '').trim()));
  }
  // The only `Math.random =` in src/js is the _worldRng save/restore
  // pair in game.js (a scoped temporary swap, not a per-day reseed).
  const assignSites = [];
  for (const f of fs.readdirSync(path.join(__dirname, '..', 'src', 'js')).filter(function (x) { return x.endsWith('.js'); })) {
    const text = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', f), 'utf8');
    const lines = text.split('\n');
    lines.forEach(function (line, i) {
      if (/Math\.random\s*=/.test(line) && line.indexOf('==') === -1) assignSites.push(f + ':' + (i + 1));
    });
  }
  T.ok('the only Math.random = in src/js is the game.js _worldRng pair (11009 set, 11011 restore)', JSON.stringify(assignSites) === JSON.stringify(['game.js:11009', 'game.js:11011']),
    'assign sites: ' + JSON.stringify(assignSites));
  const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
  T.ok('_worldRng restores Math.random in a finally', gameSrc.indexOf('finally { this._worldRng = null; Math.random = real; }') !== -1, 'restore-in-finally present');

  // ---- 6. Tendexact guard — marker present at master, absent at the far end ----
  T.section('6. Tendexact guard — exact-split marker present at master f7352f946, absent at far end 203a32775');
  const masterHierarchy = execSync('git show f7352f946:src/js/hierarchy.js', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  const farEndHierarchy = execSync('git show 203a32775:src/js/hierarchy.js', { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString();
  T.ok('tendexact marker present at master f7352f946', masterHierarchy.indexOf('EXACT SPLIT (tendexact-a 2026-11-10, finding #2072)') !== -1, 'marker present at master');
  T.ok('tendexact marker absent at far end 203a32775', farEndHierarchy.indexOf('EXACT SPLIT (tendexact-a 2026-11-10, finding #2072)') === -1, 'marker absent at far end');
  T.ok('tendexact commit e6911eb80 is an ancestor of HEAD', (function () {
    try { execSync('git merge-base --is-ancestor e6911eb80 HEAD', { cwd: path.join(__dirname, '..') }); return true; }
    catch (e) { return false; }
  })(), 'ancestry verified by git');
  const gMasterHier = DR.candidateMarkersPresent({ 'src/js/hierarchy.js': masterHierarchy });
  T.ok('candidate guard accepts the master hierarchy text', gMasterHier.ok === true && gMasterHier.missing.length === 0,
    'present=' + JSON.stringify(gMasterHier.present));
  const gFarHier = DR.candidateMarkersPresent({ 'src/js/hierarchy.js': farEndHierarchy });
  T.ok('candidate guard refuses the far-end hierarchy text', gFarHier.ok === false && gFarHier.missing.length === 1,
    'missing=' + JSON.stringify(gFarHier.missing));
  T.ok('candidate guard refuses a missing file', DR.candidateMarkersPresent({}).ok === false, 'empty texts refused');
  T.ok('driver refuses a run without tendexact (exit path in source)', driverSrc.indexOf('refuseUnlessCandidate()') !== -1, 'candidate refusal wired at run entry');
  T.ok('driver refuses a run with stray src/js changes (exit path in source)', driverSrc.indexOf('noCodeChangeGuard()') !== -1, 'no-code-change refusal wired at run entry');
  T.ok('driver invokes no cherry-pick (tendexact is an ancestor, not a pick)', driverSrc.indexOf('cherry-pick -n') === -1 && driverSrc.indexOf('git cherry-pick') === -1, 'no cherry-pick command in driver');
  T.ok('noCodeChangeOk accepts exactly [] (no swap, no pick on this base)', DR.noCodeChangeOk([]) === true, 'empty accepted');
  T.ok('noCodeChangeOk refuses a standing.js diff', DR.noCodeChangeOk(['src/js/standing.js']) === false, 'swap refused');
  T.ok('noCodeChangeOk refuses a stray src/js change', DR.noCodeChangeOk(['src/js/conversation.js']) === false, 'stray change refused');
  T.ok('noCodeChangeOk refuses a non-list', DR.noCodeChangeOk(null) === false && DR.noCodeChangeOk('src/js/standing.js') === false, 'non-list refused');
  T.ok('burn is the pre-registered 997', DR.RESEED_BURN === 997, 'RESEED_BURN=' + DR.RESEED_BURN);

  // ---- 7. Deep-identity comparison — index-aligned pairing ----
  T.section('7. Deep-identity comparison — index-aligned snapshots, never day-keyed');
  function snap(day, v3, v4, kills, rosterLen, extra) {
    const s = { day: day, vetsW3: { count: v3, killers: [] }, vetsW4: { count: v4, killers: [] }, waveKillLog: new Array(kills).fill(0), roster: new Array(rosterLen).fill(0) };
    if (extra) Object.assign(s, extra);
    return s;
  }
  T.ok('signatureOf reads the 4 fields', JSON.stringify(DD.signatureOf(snap(5, 1, 2, 7, 9))) === JSON.stringify([1, 2, 7, 9]),
    'sig=' + JSON.stringify(DD.signatureOf(snap(5, 1, 2, 7, 9))));
  T.ok('sigEqual compares field-wise', DD.sigEqual([1, 2, 7, 9], [1, 2, 7, 9]) === true && DD.sigEqual([1, 2, 7, 9], [1, 2, 8, 9]) === false, 'sig equality');
  const sameA = [snap(1, 0, 0, 0, 12), snap(2, 0, 0, 1, 12), snap(2, 0, 0, 1, 12)];
  const sameB = [snap(1, 0, 0, 0, 12), snap(2, 0, 0, 1, 12), snap(2, 0, 0, 1, 12)];
  const cSame = DD.compareSeed(sameA, sameB);
  T.ok('identical arrays compare DEEP-IDENTICAL', cSame.identical === true && cSame.firstSig === null && cSame.firstFull === null,
    'identical=' + cSame.identical);
  const diffA = [snap(1, 0, 0, 0, 12), snap(2, 0, 0, 1, 12), snap(3, 1, 0, 2, 11)];
  const diffB = [snap(1, 0, 0, 0, 12), snap(2, 0, 0, 1, 12), snap(3, 1, 0, 3, 11)];
  const cDiff = DD.compareSeed(diffA, diffB);
  T.ok('a waveKillLog divergence is found at its index', cDiff.identical === false && cDiff.firstSig !== null && cDiff.firstSig.index === 2,
    'firstSig.index=' + (cDiff.firstSig && cDiff.firstSig.index));
  T.ok('the first full-diff names the differing field', cDiff.firstFull !== null && cDiff.firstFull.index === 2 && cDiff.firstFull.path === 'waveKillLog[2]',
    'firstFull=' + JSON.stringify(cDiff.firstFull));
  T.ok('deepEqual ignores key order', DD.deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }) === true, 'key order ignored');
  T.ok('deepEqual detects a nested difference', DD.deepEqual({ a: { b: 1 } }, { a: { b: 2 } }) === false, 'nested diff detected');
  T.ok('firstDiffPath names the nested field', DD.firstDiffPath({ a: { b: 1 } }, { a: { b: 2 } }) === 'a.b', 'path=' + DD.firstDiffPath({ a: { b: 1 } }, { a: { b: 2 } }));
  // Duplicate loss-day stamps: daily d2 + final d2. The two corpora
  // agree on every DAILY snapshot and differ ONLY in the final one.
  // Day-keyed pairing pairs A's daily d2 against B's final d2 — a
  // FALSE divergence on the daily snapshot. Index-aligned pairing
  // pairs daily-with-daily and final-with-final, and flags only the
  // final index.
  const dupA = [snap(1, 0, 0, 0, 12), snap(2, 0, 0, 1, 12), snap(2, 0, 0, 1, 12, { final: true })];
  const dupB = [snap(1, 0, 0, 0, 12), snap(2, 0, 0, 1, 12), snap(2, 0, 0, 1, 12, { final: false })];
  const cDup = DD.compareSeed(dupA, dupB);
  T.ok('index-aligned pairing flags ONLY the final snapshot (index 2)', cDup.identical === false && cDup.firstFull !== null && cDup.firstFull.index === 2,
    'firstFull.index=' + (cDup.firstFull && cDup.firstFull.index) + ' path=' + (cDup.firstFull && cDup.firstFull.path));
  const cDupKeyed = DD.compareSeedDayKeyed(dupA, dupB);
  T.ok('day-keyed pairing FALSELY flags the daily snapshot (mis-pairing demonstrated)', cDupKeyed.identical === false && cDupKeyed.firstFull !== null && cDupKeyed.firstFull.day === 2,
    'day-keyed firstFull.day=' + (cDupKeyed.firstFull && cDupKeyed.firstFull.day));
  T.ok('the day-keyed false positive pairs the daily snapshot against the final one', (function () {
    // Day-keyed maps day 2 -> B's LAST snapshot (the final one), so
    // A's daily d2 (final: true) is compared against B's final d2
    // (final: false) — the same day stamp, the wrong snapshot.
    return cDupKeyed.firstFull.path === 'final';
  })(), 'mis-pairing path=' + (cDupKeyed.firstFull && cDupKeyed.firstFull.path));

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
