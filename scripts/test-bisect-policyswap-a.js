#!/usr/bin/env node
// test-bisect-policyswap-a.js — proof test for the survival-collapse
// BISECT POLICY-SWAP leg (Loop B arm sim-bisect-policyswap-a).
//
// THE QUESTION (evidence/2026-11-11/sim-bisect-anchor-a.md §8,
// sim-bisect-anchor2-a.md §8): the vetphantom band (seeds
// 190391–190398, competent, 150d, base 5157782a4) survived 6/8,
// median 150d; the same seeds on 3f136f07e survived 1/8, median
// 126d — the collapse sits in 5157782a4..3f136f07e. Across that
// range the only harness/policy diff is scripts/policies/
// competent.js — ONE hunk in workGarden (garden-keeper appointment
// moved before makePlot, OVE-160, Cursor PR #120). This arm runs
// 3f136f07e game code with the 5157782a4 competent.js to control
// for it. Instrument-only: ZERO src/js changes, ZERO committed
// policy changes (the swap is uncommitted, restored afterwards).
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Instrument validity — the reused vetfirst instrument + the
//      engine's own readiness/ladder reads agree on a living veteran
//      AND on a TB-fallen veteran (death day + day after), on the
//      current tree. If the instrument lied, the swap leg would be
//      uninterpretable.
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190391–190398, the vetphantom band. A swap leg on the wrong
//      seeds answers nothing.
//   3. Driver policy-swap leg guard — the driver's legGuard accepts
//      ONLY the old (5157782a4) competent.js sha, refuses the new
//      (3f136f07e) version and garbage, and the standing guard still
//      requires the roster-check fix (accepts the pinned fix text,
//      refuses a wrong-sha marker text). All guard texts come from
//      pinned commits, never live disk. An unswapped run is refused
//      loudly, never mislabeled.
//   4. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing seed
//      on a partial one.
//   5. Survival read matches the summary + decision rule —
//      analyzeRows counts survivors from the per-seed villageLost
//      flag, the judge maps every survived count to the prereg
//      verdict (≥5 POLICY_HUNK_IMPLICATED, ≤2 POLICY_EXONERATED,
//      3–4 INCONCLUSIVE), and a corpus whose policy sha is wrong is
//      unclassifiable.
//
// Usage: node scripts/test-bisect-policyswap-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./bisect-policyswap-analyze-20261111');
const DR = require('./bisect-policyswap-driver-20261111');
const T = K.reporter('bisect-policyswap-a');

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
  T.section('1. Instrument validity — engine vs ladder vs instrument');
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
  T.ok('death day: readiness(4) = 0 (no phantom on the old base)', c.r4 === 0, fmt(c));
  T.ok('death day: ladder(3) = 0', c.l3 === 0, fmt(c));
  T.ok('death day: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('death day: three counts agree', c.r4 === c.l3 && c.l3 === c.i3, fmt(c));
  const adv = await advanceOneDay();
  T.ok('day advanced by one', adv.error === null && adv.day === deathDay + 1,
    'from d' + deathDay + ' to d' + adv.day + (adv.error ? ' err=' + adv.error : ''));
  c = counts(Game);
  T.ok('day after: readiness(4) = 0 (phantom does not reappear)', c.r4 === 0, fmt(c));
  T.ok('day after: ladder(3) = 0', c.l3 === 0, fmt(c));
  T.ok('day after: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('day after: three counts agree', c.r4 === c.l3 && c.l3 === c.i3, fmt(c));

  // ---- 2. Seed-band identity: exactly the vetphantom band ----
  T.section('2. Seed-band identity — 190391–190398, the vetphantom band');
  T.ok('analyzer SEEDS = 190391–190398', JSON.stringify(SC.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'bisect-policyswap-driver-20261111.js'), 'utf8');
  T.ok('driver writes to perseed-bisect-policyswap-a', driverSrc.indexOf('perseed-bisect-policyswap-a') !== -1, 'outDir check');
  T.ok('driver does NOT write to the vetphantom corpus', driverSrc.indexOf('perseed-vetphantom-b') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'bisect-policyswap-analyze-20261111.js'), 'utf8');
  T.ok('analyzer reads perseed-bisect-policyswap-a', analyzerSrc.indexOf('perseed-bisect-policyswap-a') !== -1, 'DIR check');
  T.ok('analyzer compares against vetphantom fix leg 6/8', analyzerSrc.indexOf('VETPHANTOM_SURVIVED = 6') !== -1, 'baseline check');

  // ---- 3. Driver policy-swap leg guard: old sha only ----
  T.section('3. Driver policy-swap leg guard — old competent.js sha only');
  T.ok('driver hardcodes MODE = fix (no control variant)', driverSrc.indexOf("const MODE = 'fix'") !== -1, 'MODE check');
  T.ok('driver refuses an unswapped run (new-policy message)', driverSrc.indexOf('Refusing to run unswapped') !== -1, 'refusal check');
  const oldPolicyText = execSync('git show 5157782a4:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  // HERMETIC (sim-findings-a 2026-11-11): both policy texts come from
  // pinned commits, never live disk — and the standing text below the
  // same: on current master the on-disk standing.js carries the
  // marker but a later sha, which made the ACCEPTS leg fail.
  const newPolicyText = execSync('git show 3f136f07e:scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const gOld = DR.legGuard(oldPolicyText);
  T.ok('legGuard ACCEPTS the old (5157782a4) competent.js', gOld.ok === true && gOld.shaFull === DR.EXPECTED_OLD_POLICY_SHA, 'sha=' + gOld.sha);
  const gNew = DR.legGuard(newPolicyText);
  T.ok('legGuard REFUSES the new (3f136f07e) competent.js', gNew.ok === false, 'sha=' + gNew.sha);
  T.ok('legGuard new-policy sha is the recorded current sha', gNew.shaFull === DR.CURRENT_POLICY_SHA, 'sha=' + gNew.sha);
  T.ok('legGuard REFUSES garbage text', DR.legGuard('not a policy file').ok === false, 'garbage check');
  T.ok('standingGuard REFUSES a marker-bearing text with the wrong sha', DR.standingGuard('ROSTER CHECK\n' + newPolicyText).ok === false,
    'wrong-sha marker text refused');
  // HERMETIC: the standing text comes from the pinned vetphantom fix
  // commit — on current master the on-disk standing.js carries the
  // marker but a later sha.
  const standingSrc = execSync('git show 5157782a4:src/js/standing.js', { cwd: path.join(__dirname, '..') }).toString();
  T.ok('the vetphantom fix standing.js HAS the roster-check fix', standingSrc.indexOf('ROSTER CHECK') !== -1, 'fix present in the pinned text');
  T.ok('standingGuard ACCEPTS the vetphantom fix standing.js', DR.standingGuard(standingSrc).ok === true, 'standing sha=' + DR.standingGuard(standingSrc).sha);

  // ---- 4. Corpus completeness on a synthetic corpus ----
  T.section('4. Corpus completeness — loader names missing seeds');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bisect-policyswap-proof-'));
  function fakeRow(seed, lost) {
    return {
      seed: seed, anchorCommit: 'proof', standingFix: true, standingSha: 'proof',
      policySha: SC.EXPECTED_OLD_POLICY_SHA, policyVersion: '5157782a4-competent',
      days: lost ? 100 : 150, endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
    };
  }
  for (const seed of SC.SEEDS) {
    fs.writeFileSync(path.join(tmp, 'bisect-policyswap-s' + seed + '-bisect-policyswap-pilot-fix.json'), JSON.stringify(fakeRow(seed, seed === 190395)) + '\n');
  }
  let corpus = SC.loadCorpus(SC.SEEDS, tmp);
  T.ok('full synthetic corpus loads 8/8 complete', corpus.complete === true && corpus.rows.length === 8 && corpus.missing.length === 0,
    'complete=' + corpus.complete + ' rows=' + corpus.rows.length);
  fs.unlinkSync(path.join(tmp, 'bisect-policyswap-s190397-bisect-policyswap-pilot-fix.json'));
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
    T.ok(n + '/8 -> POLICY_HUNK_IMPLICATED', SC.judge(a).verdict === 'POLICY_HUNK_IMPLICATED', SC.judge(a).verdict);
  }
  for (const n of [4, 3]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/8 -> INCONCLUSIVE', SC.judge(a).verdict === 'INCONCLUSIVE', SC.judge(a).verdict);
  }
  for (const n of [2, 1, 0]) {
    const a = SC.analyzeRows(synthRows(n));
    T.ok(n + '/8 -> POLICY_EXONERATED', SC.judge(a).verdict === 'POLICY_EXONERATED', SC.judge(a).verdict);
  }
  T.ok('out-of-range 9 -> UNCLASSIFIABLE', SC.classifySurvived(9) === 'UNCLASSIFIABLE', SC.classifySurvived(9));
  T.ok('out-of-range -1 -> UNCLASSIFIABLE', SC.classifySurvived(-1) === 'UNCLASSIFIABLE', SC.classifySurvived(-1));
  T.ok('NaN -> UNCLASSIFIABLE', SC.classifySurvived(NaN) === 'UNCLASSIFIABLE', String(SC.classifySurvived(NaN)));
  const a6 = SC.analyzeRows(synthRows(6));
  T.ok('6/8 synthetic: median 150d', a6.wall.medianDays === 150, 'median=' + a6.wall.medianDays);
  T.ok('6/8 synthetic: wave4 8/8, wave5 0/8', a6.wall.wave4 === 8 && a6.wall.wave5 === 0, 'wave4=' + a6.wall.wave4 + ' wave5=' + a6.wall.wave5);
  T.ok('6/8 synthetic: death-cause shares count 8 deaths', a6.causes.total === 8 && a6.causes.counts.combat === 8,
    'total=' + a6.causes.total + ' ' + JSON.stringify(a6.causes.counts));
  T.ok('6/8 synthetic: all rows carry the old policy sha', a6.policyOk === true, 'policyOk=' + a6.policyOk);
  const wrongPolicy = synthRows(6);
  wrongPolicy[0].policySha = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
  const aWrong = SC.analyzeRows(wrongPolicy);
  T.ok('wrong policy sha on one seed -> policyOk false', aWrong.policyOk === false, 'policyOk=' + aWrong.policyOk);
  T.ok('wrong policy sha -> judge unclassifiable', SC.judge(aWrong).classifiable === false, 'classifiable=' + SC.judge(aWrong).classifiable);

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
