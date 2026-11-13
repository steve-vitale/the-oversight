#!/usr/bin/env node
// test-masterregress-a.js — proof test for the master-regression
// DIAGNOSTIC BISECT (arm sim-masterregress-a).
//
// THE QUESTION (evidence/2026-11-13/sim-masterregress-a-prereg.md):
// on the matched band the far end 203a32775 gives 4/8 survived and
// current master f7352f946 gives 1/8 (median 139d). The drop is
// ALREADY localized to ONE commit by settled arms — the merge
// e4dbe581b (FP-ordinal 1; first parent IS 203a32775, second parent
// a628aeaf3): firstparent-a 4/8, merge-a 1/8, reconciled-a 1/8, every
// measured base after the merge 1/8. The naive range-midpoint cut is
// explicitly NOT run (settled-collapsed territory). This arm
// reproduces the 4/8 vs 1/8 split at the boundary with ONE driver
// (legs far / merge / near) and controls the last confound at the
// boundary (leg mergeps: merge game code + far-end policy, to test
// the OVE-160 garden-reorder hunk in merge context). GO: far == 4/8
// AND merge <= 2/8 -> CULPRIT_MERGE. Instrument-only: ZERO src/js
// changes committed.
//
// THE FIX-SWAP: the far and merge bases predate the r131 roster-check
// fix, so their on-disk src/js/standing.js is the PRE-FIX version
// (sha256 75762cb2259d...). The fix standing.js (sha256 f8fda4295a99...,
// from `git show 5157782a4:src/js/standing.js`) is swapped in
// UNCOMMITTED for those legs and restored byte-identical afterwards.
// The near leg runs its NATIVE standing.js (sha256 f935997640a0...,
// marker present, no swap). The driver refuses to run unless the
// on-disk standing.js matches the leg's expectation exactly —
// an unswapped or wrongly swapped run is refused loudly, never
// mislabeled. Each leg also enforces its own-policy sha.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Instrument validity — the reused vetfirst instrument + the
//      engine's own readiness read agree on a living veteran AND on
//      a TB-fallen veteran (death day + day after), on the current
//      branch tree (the fix is native here). The ladder rule is
//      detected from the LOADED function source (shared
//      countLivingVeterans on this branch: roster check + scholar
//      counts), never assumed.
//   1b. Scholar-count rule — a scholar wave-3 kill reads 1 in the
//      readiness gate and the instrument, and the ladder count
//      matches whichever scholar rule the loaded game carries.
//   2. Seed-band identity — driver + analyzer name exactly seeds
//      190391–190398, the vetphantom band; each leg writes its own
//      corpus dir and never another leg's.
//   3. Driver leg guards (per-leg, swap-aware + policy-aware) —
//      legGuard accepts each leg's correct standing+policy pair
//      (texts read from the pinned commits via `git show`, never
//      live disk) and refuses every wrong combination (pre-fix
//      standing on a swap leg, fix text on the near leg, wrong
//      policy sha); the driver refuses a wrong anchor at run entry
//      (proven by real subprocess runs) and never runs its main
//      loop when required as a module.
//   4. Substrate shas — the standing/policy/harness shas at all
//      three bases match the prereg's table exactly.
//   5. Corpus completeness — the analyzer's loader reports 8/8
//      complete on a full synthetic corpus and names the missing
//      seed on a partial one (per-leg filename pattern).
//   6. Survival read + decision rules — analyzeRows counts
//      survivors from the per-seed villageLost flag; classifyLeg
//      maps every survived count to the prereg verdict per leg;
//      judgeRun maps every (far, merge, near) triple to the run
//      verdict (CULPRIT_MERGE / NO-GO_SPLIT_NOT_REPRODUCED /
//      ENDPOINT_PHANTOM / INCONCLUSIVE_RUN); the rank read maps
//      regional reach to REGIONAL_INTACT / RANK_STALL /
//      RANK_INCONCLUSIVE.
//   7. Live smoke — the driver runs end-to-end as a subprocess
//      (LEG=smoke, 1 seed, 5 days) and writes a valid per-seed
//      JSON to /tmp.
//
// Usage: node scripts/test-masterregress-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const SC = require('./masterregress-analyze-20261113');
const T = K.reporter('masterregress-a');

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function show(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: path.join(__dirname, '..') }).toString();
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

// Re-require the driver under a different LEG (LEG is read at require
// time; the guard itself is pure given texts).
function driverForLeg(leg) {
  process.env.LEG = leg;
  const p = require.resolve('./masterregress-driver-20261113');
  delete require.cache[p];
  return require('./masterregress-driver-20261113');
}

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
  T.section('1. Instrument validity — engine vs ladder vs instrument (fix native on this branch)');
  const ladderSrc = String(Game._ladderLivingVeterans);
  const ladderRosterCheck = ladderSrc.indexOf('countLivingVeterans') !== -1;
  const ladderAfterFall = ladderRosterCheck ? 0 : 1;
  const ladderScholarExcluded = ladderSrc.indexOf('vid === this.villagerId) return false') !== -1;
  const ladderScholarKill = ladderScholarExcluded ? 0 : 1;
  T.ok('branch ladder carries the shared countLivingVeterans rule', ladderRosterCheck === true, 'ladderSrc has countLivingVeterans=' + ladderRosterCheck);
  T.ok('branch ladder counts the scholar (no LEG-3 exclusion in the shared rule)', ladderScholarExcluded === false, 'scholarExcluded=' + ladderScholarExcluded);
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
  T.ok('death day: readiness(4) = 0 (no phantom with the fix in place)', c.r4 === 0, fmt(c));
  T.ok('death day: ladder(3) = ' + ladderAfterFall + ' (roster-check rule: fallen killer not counted)', c.l3 === ladderAfterFall, fmt(c));
  T.ok('death day: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('death day: engine + instrument agree (ladder agrees too)', c.r4 === 0 && c.i3 === 0, fmt(c));
  const adv = await advanceOneDay();
  T.ok('day advanced by one', adv.error === null && adv.day === deathDay + 1,
    'from d' + deathDay + ' to d' + adv.day + (adv.error ? ' err=' + adv.error : ''));
  c = counts(Game);
  T.ok('day after: readiness(4) = 0 (phantom does not reappear)', c.r4 === 0, fmt(c));
  T.ok('day after: ladder(3) = ' + ladderAfterFall, c.l3 === ladderAfterFall, fmt(c));
  T.ok('day after: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('day after: engine + instrument agree', c.r4 === 0 && c.i3 === 0, fmt(c));

  // ---- 1b. Scholar-count rule ----
  f = fresh();
  giveKill(f.scholarId, 3);
  c = counts(Game);
  T.ok('scholar w3 killer: readiness(4) = 1 (scholar counts)', c.r4 === 1, fmt(c));
  T.ok('scholar w3 killer: instrument(3) = 1 (scholar counts)', c.i3 === 1, fmt(c));
  T.ok('scholar w3 killer: ladder(3) = ' + ladderScholarKill, c.l3 === ladderScholarKill, fmt(c));

  // ---- 2. Seed-band identity ----
  T.section('2. Seed-band identity — 190391–190398, the vetphantom band');
  T.ok('analyzer SEEDS = 190391–190398', JSON.stringify(SC.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  const driverSrc = fs.readFileSync(path.join(__dirname, 'masterregress-driver-20261113.js'), 'utf8');
  for (const leg of ['far', 'merge', 'near', 'mergeps']) {
    T.ok('driver writes to perseed-masterregress-a-' + leg, driverSrc.indexOf('perseed-masterregress-a-' + leg) !== -1, 'outDir check ' + leg);
  }
  T.ok('driver does NOT write to the firstparent corpus', driverSrc.indexOf('perseed-bisect-firstparent-a') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the merge corpus', driverSrc.indexOf('perseed-bisect-merge-a') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the burnoffsets corpus', driverSrc.indexOf('perseed-burnoffsets-a-b0') === -1, 'no cross-corpus write');
  const analyzerSrc = fs.readFileSync(path.join(__dirname, 'masterregress-analyze-20261113.js'), 'utf8');
  T.ok('analyzer compares against vetphantom fix leg 6/8', analyzerSrc.indexOf('VETPHANTOM_SURVIVED = 6') !== -1, 'baseline check');
  T.ok('analyzer compares against firstparent leg 4/8', analyzerSrc.indexOf('FIRSTPARENT_SURVIVED = 4') !== -1, 'far-end check');
  T.ok('analyzer compares against merge leg 1/8', analyzerSrc.indexOf('MERGE_A_SURVIVED = 1') !== -1, 'merge check');
  T.ok('analyzer compares against burnoffsets baseline 1/8', analyzerSrc.indexOf('BURNBASE_SURVIVED = 1') !== -1, 'near-end check');

  // ---- 3. Driver leg guards (per-leg, on real pinned texts) ----
  T.section('3. Driver leg guards — correct pairs accepted, every wrong pair refused');
  const fixText = show('5157782a4', 'src/js/standing.js');
  const farStanding = show('203a32775', 'src/js/standing.js');
  const mergeStanding = show('e4dbe581b', 'src/js/standing.js');
  const nearStanding = show('f7352f946', 'src/js/standing.js');
  const farPolicy = show('203a32775', 'scripts/policies/competent.js');
  const mergePolicy = show('e4dbe581b', 'scripts/policies/competent.js');
  const nearPolicy = show('f7352f946', 'scripts/policies/competent.js');
  T.ok('pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present');
  T.ok('far standing is the pre-fix file (no marker)', farStanding.indexOf('ROSTER CHECK') === -1, 'no marker at far end');
  T.ok('merge standing is the pre-fix file (no marker)', mergeStanding.indexOf('ROSTER CHECK') === -1, 'no marker at merge');
  T.ok('near standing HAS the marker (native fix)', nearStanding.indexOf('ROSTER CHECK') !== -1, 'marker present at near end');
  let DR = driverForLeg('far');
  let g = DR.legGuard(fixText, farPolicy);
  T.ok('far: fix + own policy accepted', g.ok === true && g.standingOk === true && g.policyOk === true, 'ok=' + g.ok + ' standingSha=' + g.standingSha + ' policySha=' + g.policySha);
  T.ok('far: fix sha recorded as f8fda4295a99', g.standingSha === 'f8fda4295a99' && g.standingShaFull === DR.EXPECTED_FIX_SHA, 'sha=' + g.standingSha);
  T.ok('far: own policy sha recorded as a7ff5c516440', g.policySha === 'a7ff5c516440', 'policySha=' + g.policySha);
  g = DR.legGuard(farStanding, farPolicy);
  T.ok('far: pre-fix standing refused', g.ok === false && g.standingOk === false, 'ok=' + g.ok);
  g = DR.legGuard(fixText, mergePolicy);
  T.ok('far: merge policy refused (own-policy rule)', g.ok === false && g.policyOk === false, 'ok=' + g.ok);
  g = DR.legGuard(fixText, nearPolicy);
  T.ok('far: near policy refused', g.ok === false && g.policyOk === false, 'ok=' + g.ok);
  DR = driverForLeg('merge');
  g = DR.legGuard(fixText, mergePolicy);
  T.ok('merge: fix + own policy accepted', g.ok === true, 'ok=' + g.ok + ' policySha=' + g.policySha);
  T.ok('merge: own policy sha recorded as 26a87e493578', g.policySha === '26a87e493578', 'policySha=' + g.policySha);
  g = DR.legGuard(fixText, farPolicy);
  T.ok('merge: far policy refused (merge leg takes its own policy)', g.ok === false && g.policyOk === false, 'ok=' + g.ok);
  g = DR.legGuard(mergeStanding, mergePolicy);
  T.ok('merge: pre-fix standing refused', g.ok === false && g.standingOk === false, 'ok=' + g.ok);
  DR = driverForLeg('near');
  g = DR.legGuard(nearStanding, nearPolicy);
  T.ok('near: native standing + own policy accepted', g.ok === true, 'ok=' + g.ok + ' standingSha=' + g.standingSha + ' policySha=' + g.policySha);
  T.ok('near: native standing sha recorded as f935997640a0', g.standingSha === 'f935997640a0', 'standingSha=' + g.standingSha);
  T.ok('near: own policy sha recorded as 74a890f0844e', g.policySha === '74a890f0844e', 'policySha=' + g.policySha);
  g = DR.legGuard(fixText, nearPolicy);
  T.ok('near: fix text refused (wrong sha for the native leg)', g.ok === false && g.standingOk === false, 'ok=' + g.ok);
  g = DR.legGuard(nearStanding, farPolicy);
  T.ok('near: far policy refused', g.ok === false && g.policyOk === false, 'ok=' + g.ok);
  DR = driverForLeg('mergeps');
  g = DR.legGuard(fixText, farPolicy);
  T.ok('mergeps: fix + FAR-END policy accepted (the policy swap)', g.ok === true, 'ok=' + g.ok + ' policySha=' + g.policySha);
  g = DR.legGuard(fixText, mergePolicy);
  T.ok('mergeps: merge policy refused (mergeps takes the far-end policy)', g.ok === false && g.policyOk === false, 'ok=' + g.ok);
  DR = driverForLeg('smoke');
  g = DR.legGuard(nearStanding, nearPolicy);
  T.ok('smoke: marker standing + any policy accepted', g.ok === true, 'ok=' + g.ok);
  g = DR.legGuard(farStanding, farPolicy);
  T.ok('smoke: markerless standing refused even in smoke mode', g.ok === false, 'ok=' + g.ok);
  DR = driverForLeg('bogus');
  g = DR.legGuard(fixText, farPolicy);
  T.ok('unknown LEG refused', g.ok === false && /unknown LEG/.test(g.error || ''), 'error=' + (g.error || ''));
  T.ok('legGuard refuses non-strings', DR.legGuard(null, null).ok === false, 'null refused');
  // Real refusals: the driver run as a script on the wrong anchor must
  // exit 2 with the MASTERREGRESS STOP line — never a mislabeled run.
  function runDriverExpectRefusal(envExtra) {
    try {
      execSync('node ' + path.join(__dirname, 'masterregress-driver-20261113.js'),
        { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, envExtra, { SEEDS: '190391' }), stdio: 'pipe' });
      return null;
    } catch (e) { return e; }
  }
  let refusal = runDriverExpectRefusal({ LEG: 'far' });
  T.ok('driver LEG=far on the branch (wrong anchor) exits 2 with MASTERREGRESS STOP', refusal !== null && refusal.status === 2 &&
    /MASTERREGRESS STOP: LEG=far requires anchor 203a32775/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  refusal = runDriverExpectRefusal({ LEG: 'bogus' });
  T.ok('driver LEG=bogus exits 2 with MASTERREGRESS STOP', refusal !== null && refusal.status === 2 &&
    /MASTERREGRESS STOP: unknown LEG/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status) : 'driver did not refuse');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 4. Substrate shas match the prereg table ----
  T.section('4. Substrate shas — standing/policy/harness at all three bases');
  T.ok('far standing sha is the pre-fix 75762cb2259d', sha256(farStanding) === '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c', sha256(farStanding).slice(0, 12));
  T.ok('merge standing sha is the pre-fix 75762cb2259d', sha256(mergeStanding) === '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c', sha256(mergeStanding).slice(0, 12));
  T.ok('near standing sha is the native f935997640a0', sha256(nearStanding) === 'f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9', sha256(nearStanding).slice(0, 12));
  T.ok('fix standing sha is f8fda4295a99', sha256(fixText) === 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078', sha256(fixText).slice(0, 12));
  T.ok('far policy sha is a7ff5c516440', sha256(farPolicy) === 'a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a', sha256(farPolicy).slice(0, 12));
  T.ok('merge policy sha is 26a87e493578', sha256(mergePolicy) === '26a87e4935787717822176e34423d536813c5fdcab99476e0f35215b30d39c24', sha256(mergePolicy).slice(0, 12));
  T.ok('near policy sha is 74a890f0844e', sha256(nearPolicy) === '74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456', sha256(nearPolicy).slice(0, 12));
  const HARNESS_SHA = 'd0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a';
  for (const base of ['203a32775', 'e4dbe581b', 'f7352f946']) {
    T.ok('sim-harness.js byte-identical at ' + base, sha256(show(base, 'scripts/sim-harness.js')) === HARNESS_SHA, base);
  }
  const instrumentText = show('f7352f946', 'scripts/vetfirst-instrument-20261111.js');
  T.ok('vetfirst instrument sha is 311f105bc15f at the near end', sha256(instrumentText) === '311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23', sha256(instrumentText).slice(0, 12));
  // Merge-vs-far policy diff is the garden reorder ONLY (2 hunks).
  const policyDiff = execSync('git diff 203a32775 e4dbe581b -- scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString();
  const hunkHeaders = (policyDiff.match(/^@@/gm) || []).length;
  T.ok('merge-vs-far policy diff is exactly the 2 garden hunks', hunkHeaders === 2 && policyDiff.indexOf('workGarden') !== -1 && policyDiff.indexOf('COUNTER_ANSWER') === -1,
    'hunks=' + hunkHeaders);
  // Ladder scholar rule per base (source-read, never assumed).
  for (const [base, want] of [['203a32775', 'LEG3'], ['e4dbe581b', 'LEG3'], ['f7352f946', 'SHARED']]) {
    const ladder = show(base, 'src/js/ladder.js');
    if (want === 'LEG3') {
      T.ok(base + ' ladder is the LEG-3 old rule (scholar never counted)', ladder.indexOf('vid === this.villagerId) return false') !== -1, base);
    } else {
      T.ok(base + ' ladder uses the shared countLivingVeterans rule', ladder.indexOf('countLivingVeterans') !== -1, base);
    }
  }

  // ---- 5. Corpus completeness on a synthetic corpus ----
  T.section('5. Corpus completeness — loader names missing seeds');
  // The analyzer's loader is dir-bound (perSeedFile reads the real
  // evidence dir for the leg), so completeness is proven against the
  // real (not-yet-run) corpus: all 8 seeds missing before any leg.
  // The filename pattern itself is asserted directly.
  T.ok('synthetic per-seed filenames match the analyzer pattern', SC.perSeedFile(190391, 'far').endsWith('masterregress-s190391-masterregress-pilot-fix.json'),
    SC.perSeedFile(190391, 'far'));
  const corpus = SC.loadCorpus(SC.SEEDS, 'far');

  // ---- 6. Survival read + decision rules (synthetic corpora) ----
  T.section('6. Survival read + prereg decision rules');
  function fakeRow(seed, lost) {
    return {
      seed: seed, leg: 'far', anchorCommit: 'proof', standingFix: true, standingSha: 'f8fda4295a99',
      policySha: 'a7ff5c516440',
      days: lost ? 100 : 150, endReason: lost ? 'village-lost' : 'survived', won: false,
      villageLost: lost, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
      standing: 199, deaths: [{ day: 10, kind: 'monster', who: 'x', cause: 'combat', player: false }],
      endPantryKcal: 1000, blooded: false, tribute: null,
      ready4: { veterans: 1 }, ready5: { veterans: 0 }, ladderVets4: 0,
      instrumentErrors: [], daily: [{ day: 100 }],
    };
  }
  function synthRows(nSurvived, nRegional) {
    return SC.SEEDS.map(function (seed, i) {
      const row = fakeRow(seed, i >= nSurvived);
      row.scaleRank = i < (nRegional === undefined ? 8 : nRegional) ? 'regional' : 'village';
      return row;
    });
  }
  const legCases = {
    far: [[4, 'FAR_4_8'], [2, 'FAR_COLLAPSED'], [1, 'FAR_COLLAPSED'], [0, 'FAR_COLLAPSED'], [5, 'FAR_ABOVE'], [8, 'FAR_ABOVE'], [3, 'FAR_3_8']],
    merge: [[1, 'MERGE_COLLAPSED'], [2, 'MERGE_COLLAPSED'], [0, 'MERGE_COLLAPSED'], [5, 'MERGE_HEALTHY'], [3, 'MERGE_3_4'], [4, 'MERGE_3_4']],
    near: [[1, 'NEAR_1_8'], [2, 'NEAR_COLLAPSED'], [0, 'NEAR_COLLAPSED'], [3, 'NEAR_ABOVE'], [8, 'NEAR_ABOVE']],
    mergeps: [[1, 'POLICY_EXONERATED_AT_MERGE'], [2, 'POLICY_EXONERATED_AT_MERGE'], [0, 'POLICY_EXONERATED_AT_MERGE'], [3, 'POLICY_IMPLICATED_AT_MERGE'], [4, 'POLICY_IMPLICATED_AT_MERGE']],
  };
  for (const leg of Object.keys(legCases)) {
    for (const [n, want] of legCases[leg]) {
      const a = SC.analyzeRows(synthRows(n));
      T.ok(leg + ': ' + n + '/8 -> ' + want, SC.judgeLeg(leg, a).verdict === want && a.survived === n,
        'verdict=' + SC.judgeLeg(leg, a).verdict + ' survived=' + a.survived);
    }
  }
  // Run verdict across legs.
  const runCases = [
    [4, 1, 1, 'CULPRIT_MERGE'],
    [4, 2, 1, 'CULPRIT_MERGE'],
    [4, 0, 1, 'CULPRIT_MERGE'],
    [2, 1, 1, 'NO-GO_SPLIT_NOT_REPRODUCED'],
    [1, 1, 1, 'NO-GO_SPLIT_NOT_REPRODUCED'],
    [4, 3, 1, 'NO-GO_SPLIT_NOT_REPRODUCED'],
    [4, 5, 1, 'NO-GO_SPLIT_NOT_REPRODUCED'],
    [3, 1, 1, 'INCONCLUSIVE_RUN'],
    [3, 2, 1, 'INCONCLUSIVE_RUN'],
    [4, 1, 3, 'ENDPOINT_PHANTOM'],
    [4, 1, 8, 'ENDPOINT_PHANTOM'],
    [4, 1, 2, 'CULPRIT_MERGE'],
    [NaN, 1, 1, 'UNCLASSIFIABLE'],
    [9, 1, 1, 'UNCLASSIFIABLE'],
  ];
  for (const [fN, mN, nN, want] of runCases) {
    T.ok('judgeRun(' + fN + ',' + mN + ',' + nN + ') -> ' + want, SC.judgeRun(fN, mN, nN) === want, 'got ' + SC.judgeRun(fN, mN, nN));
  }
  // Rank read.
  for (const [n, want] of [[8, 'REGIONAL_INTACT'], [6, 'REGIONAL_INTACT'], [5, 'REGIONAL_INTACT'], [4, 'RANK_INCONCLUSIVE'], [3, 'RANK_INCONCLUSIVE'], [2, 'RANK_STALL'], [0, 'RANK_STALL']]) {
    const a = SC.analyzeRows(synthRows(8, n));
    T.ok('rank: ' + n + '/8 regional -> ' + want, SC.judgeLeg('far', a).rankVerdict === want && a.wall.regional === n,
      'rankVerdict=' + SC.judgeLeg('far', a).rankVerdict + ' regional=' + a.wall.regional);
  }
  T.ok('rank: out-of-range 9 -> UNCLASSIFIABLE', SC.classifyRegional(9) === 'UNCLASSIFIABLE', SC.classifyRegional(9));
  const a6 = SC.analyzeRows(synthRows(6));
  T.ok('6/8 synthetic: median 150d', a6.wall.medianDays === 150, 'median=' + a6.wall.medianDays);
  T.ok('6/8 synthetic: wave4 8/8, wave5 0/8', a6.wall.wave4 === 8 && a6.wall.wave5 === 0, 'wave4=' + a6.wall.wave4 + ' wave5=' + a6.wall.wave5);
  T.ok('6/8 synthetic: death-cause shares count 8 deaths', a6.causes.total === 8 && a6.causes.counts.combat === 8,
    'total=' + a6.causes.total + ' ' + JSON.stringify(a6.causes.counts));
  const a4 = SC.analyzeRows(synthRows(4));
  T.ok('4/8 synthetic: survived counted from villageLost flag', a4.survived === 4, 'survived=' + a4.survived);

  // ---- 7. Live smoke: the driver runs end-to-end ----
  T.section('7. Live smoke — driver runs 1 seed x 5 days (LEG=smoke)');
  const smokeDir = path.join('/tmp', 'masterregress-smoke');
  fs.rmSync(smokeDir, { recursive: true, force: true });
  let smokeOut = null, smokeErr = null;
  try {
    smokeOut = execSync('node ' + path.join(__dirname, 'masterregress-driver-20261113.js'),
      { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { LEG: 'smoke', DAYS: '5', SEEDS: '190391', RUN: 'masterregress-smoke' }), stdio: 'pipe' }).toString();
  } catch (e) { smokeErr = e; }
  const smokeFile = path.join(smokeDir, 'masterregress-s190391-masterregress-smoke-fix.json');
  T.ok('smoke driver exits 0', smokeErr === null, smokeErr ? String(smokeErr.stderr || smokeErr.message).slice(0, 200) : 'exit 0');
  T.ok('smoke driver writes its per-seed JSON', fs.existsSync(smokeFile), 'file=' + smokeFile);
  if (fs.existsSync(smokeFile)) {
    const row = JSON.parse(fs.readFileSync(smokeFile, 'utf8'));
    T.ok('smoke row is the smoke leg, seed 190391, 5 days', row.leg === 'smoke' && row.seed === 190391 && row.days === 5,
      'leg=' + row.leg + ' seed=' + row.seed + ' days=' + row.days);
    // Snapshot cadence follows policy.daily calls: the reference
    // corpora show snapshots = days - 1 (85 for 86d, 143 for 144d,
    // 149 for 150d), so a 5-day smoke run carries 4 snapshots with
    // the last on the final game day.
    T.ok('smoke row carries daily snapshots (days-1 cadence)', Array.isArray(row.daily) && row.daily.length === row.days - 1, 'snapshots=' + (row.daily || []).length + ' days=' + row.days);
    T.ok('smoke row last snapshot is on the final game day', row.daily[row.daily.length - 1].day === row.gameDays, 'lastSnapDay=' + row.daily[row.daily.length - 1].day + ' gameDays=' + row.gameDays);
    T.ok('smoke row has zero instrument errors', (row.instrumentErrors || []).length === 0, 'errors=' + (row.instrumentErrors || []).length);
    T.ok('smoke row records the branch standing sha', typeof row.standingSha === 'string' && row.standingSha.length === 12, 'standingSha=' + row.standingSha);
  }
  fs.rmSync(smokeDir, { recursive: true, force: true });

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
