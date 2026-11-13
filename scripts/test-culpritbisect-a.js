#!/usr/bin/env node
// test-culpritbisect-a.js — proof test for the inside-the-merge
// BISECT (arm sim-culpritbisect-a).
//
// THE QUESTION (evidence/2026-11-13/sim-culpritbisect-a-prereg.md):
// masterregress localized the 4/8 -> 1/8 survival drop to the merge
// e4dbe581b (first parent 203a32775, second parent a628aeaf3).
// This arm bisects good=203a32775 bad=e4dbe581b over the 157-commit
// range (156 origin-side commits + the merge; the "205" in the task
// brief is the far..pole count 203a32775..5157782a4, whose endpoints
// are both healthy and cannot be bisected for a drop — the prereg
// records the correction). Bisect rule: step >=3/8 GOOD, <=1/8 BAD,
// 2/8 AMBIGUOUS (re-run once). GO: a first-bad commit whose parent
// reads >=3/8 and whose boundary-pair re-run reproduces the split.
// DIAG outcomes cover merge-resolution and origin-collapsed-at-
// divergence. Instrument-only unless the prereg's conditional fix
// triggers — ZERO src/js changes committed otherwise.
//
// THE FIX-SWAP: every bisect step swaps in the fix standing.js
// (sha256 f8fda4295a99..., from `git show 5157782a4:src/js/standing.js`)
// uncommitted and restores the commit's native standing.js
// byte-identical afterwards. On origin trees the fix file differs
// from native standing.js by EXACTLY two insertions (54 added lines,
// 0 deleted): the ROSTER CHECK hunk and the BLOODED block — and
// BLOODED has ZERO callers on origin trees, so the swap's only live
// delta is the roster check, exactly as on the far/merge bases.
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
//      190391–190398, the vetphantom band; each step writes its own
//      corpus dir and never another step's or a masterregress leg's.
//   3. Driver guards (bisect) — legGuard accepts the fix text and
//      the origin native text (marker present) with ANY policy
//      (record-only), records the swapped flag correctly, and
//      refuses markerless standing and unknown LEGs; the driver
//      run as a script refuses LEG=bisect without STEP (exit 2)
//      and never runs its main loop when required as a module.
//   4. Substrate facts — range counts (157 / 205 / first-parent 1 /
//      origin 156); standing.js uniform across the origin range
//      (98c8bfad...); fix-vs-origin diff is exactly 2 insertions
//      (54 added, 0 deleted); BLOODED has zero callers at both
//      origin endpoints; the harness differs between the origin
//      endpoints and the far end by ONE hunk (the inert sourcePatch
//      hook); the policy flips once on the origin range (91cb6fa20)
//      between the far-end sha (a7ff5c51...) and the merge sha
//      (26a87e49...).
//   5. Corpus completeness — the analyzer's per-seed filename
//      pattern for a step corpus.
//   6. Step classification + boundary judge — classifyStep maps
//      every survived count to GOOD / BAD / AMBIGUOUS /
//      UNCLASSIFIABLE; judgeBoundary maps every (parent, culprit,
//      parent-re, culprit-re) quad to GO-CULPRIT-COMMIT or
//      NO-GO_BOUNDARY_NOT_REPRODUCED; the rank read maps regional
//      reach to REGIONAL_INTACT / RANK_STALL / RANK_INCONCLUSIVE.
//   7. Live smoke — the driver runs end-to-end as a subprocess
//      (LEG=smoke, 1 seed, 5 days) and writes a valid per-seed
//      JSON to /tmp.
//
// Usage: node scripts/test-culpritbisect-a.js
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
const SC = require('./culpritbisect-analyze-20261113');
const T = K.reporter('culpritbisect-a');

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
  const p = require.resolve('./culpritbisect-driver-20261113');
  delete require.cache[p];
  return require('./culpritbisect-driver-20261113');
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
  T.ok('analyzer RUN = culpritbisect-pilot', SC.RUN === 'culpritbisect-pilot', 'RUN=' + SC.RUN);
  const driverSrc = fs.readFileSync(path.join(__dirname, 'culpritbisect-driver-20261113.js'), 'utf8');
  T.ok('driver writes to perseed-culpritbisect-a-<step>', driverSrc.indexOf('perseed-culpritbisect-a-') !== -1, 'outDir check');
  T.ok('driver does NOT write to any masterregress corpus', driverSrc.indexOf('perseed-masterregress-a-') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the firstparent corpus', driverSrc.indexOf('perseed-bisect-firstparent-a') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the merge corpus', driverSrc.indexOf('perseed-bisect-merge-a') === -1, 'no cross-corpus write');

  // ---- 3. Driver guards (bisect) ----
  T.section('3. Driver guards — marker standing + any policy accepted, markerless refused, STEP required');
  const fixText = show('5157782a4', 'src/js/standing.js');
  const originStanding = show('d229b58f5', 'src/js/standing.js');
  const originTipStanding = show('a628aeaf3', 'src/js/standing.js');
  const farStanding = show('203a32775', 'src/js/standing.js');
  const farPolicy = show('203a32775', 'scripts/policies/competent.js');
  const mergePolicy = show('e4dbe581b', 'scripts/policies/competent.js');
  T.ok('pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present');
  T.ok('origin standing LACKS the marker (swap required at every step)', originStanding.indexOf('ROSTER CHECK') === -1, 'no marker at the merge-base');
  T.ok('far standing is the pre-fix file (no marker)', farStanding.indexOf('ROSTER CHECK') === -1, 'no marker at far end');
  let DR = driverForLeg('bisect');
  let g = DR.legGuard(fixText, farPolicy);
  T.ok('bisect: fix + far policy accepted', g.ok === true && g.standingOk === true && g.policyOk === true, 'ok=' + g.ok + ' standingSha=' + g.standingSha + ' policySha=' + g.policySha);
  T.ok('bisect: fix sha recorded as f8fda4295a99', g.standingSha === 'f8fda4295a99' && g.standingShaFull === DR.EXPECTED_FIX_SHA, 'sha=' + g.standingSha);
  T.ok('bisect: swapped flag TRUE for the fix text', g.standingSwapped === true, 'swapped=' + g.standingSwapped);
  g = DR.legGuard(fixText, mergePolicy);
  T.ok('bisect: fix + merge policy accepted (policy is record-only)', g.ok === true, 'ok=' + g.ok + ' policySha=' + g.policySha);
  T.ok('bisect: merge policy sha recorded as 26a87e493578', g.policySha === '26a87e493578', 'policySha=' + g.policySha);
  T.ok('bisect: far policy sha recorded as a7ff5c516440', DR.legGuard(fixText, farPolicy).policySha === 'a7ff5c516440', 'policySha check');
  g = DR.legGuard(originStanding, farPolicy);
  T.ok('bisect: origin native standing refused (marker required)', g.ok === false && g.standingOk === false, 'ok=' + g.ok);
  T.ok('bisect: swapped flag FALSE for native standing', g.standingSwapped === false, 'swapped=' + g.standingSwapped);
  g = DR.legGuard(farStanding, farPolicy);
  T.ok('bisect: pre-fix far standing refused', g.ok === false && g.standingOk === false, 'ok=' + g.ok);
  DR = driverForLeg('smoke');
  g = DR.legGuard(fixText, farPolicy);
  T.ok('smoke: marker standing + any policy accepted', g.ok === true, 'ok=' + g.ok);
  g = DR.legGuard(originStanding, farPolicy);
  T.ok('smoke: markerless standing refused even in smoke mode', g.ok === false, 'ok=' + g.ok);
  DR = driverForLeg('bogus');
  g = DR.legGuard(fixText, farPolicy);
  T.ok('unknown LEG refused', g.ok === false && /unknown LEG/.test(g.error || ''), 'error=' + (g.error || ''));
  T.ok('legGuard refuses non-strings', DR.legGuard(null, null).ok === false, 'null refused');
  // Real refusals: the driver run as a script must exit 2 with the
  // CULPRITBISECT STOP line — never an unlabeled or mislabeled run.
  function runDriverExpectRefusal(envExtra) {
    try {
      execSync('node ' + path.join(__dirname, 'culpritbisect-driver-20261113.js'),
        { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, envExtra, { SEEDS: '190391' }), stdio: 'pipe' });
      return null;
    } catch (e) { return e; }
  }
  let refusal = runDriverExpectRefusal({ LEG: 'bisect' });
  T.ok('driver LEG=bisect without STEP exits 2 with CULPRITBISECT STOP', refusal !== null && refusal.status === 2 &&
    /CULPRITBISECT STOP: LEG=bisect requires STEP/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  refusal = runDriverExpectRefusal({ LEG: 'bogus', STEP: 's00-test' });
  T.ok('driver LEG=bogus exits 2 with CULPRITBISECT STOP', refusal !== null && refusal.status === 2 &&
    /CULPRITBISECT STOP: unknown LEG/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status) : 'driver did not refuse');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 4. Substrate facts ----
  T.section('4. Substrate facts — ranges, standing uniformity, swap delta, BLOODED, harness, policy');
  function revCount(range) {
    return parseInt(execSync('git rev-list --count ' + range, { cwd: path.join(__dirname, '..') }).toString().trim(), 10);
  }
  T.ok('range far..merge is 157 commits (not the brief\'s 205)', revCount('203a32775..e4dbe581b') === 157, 'count=' + revCount('203a32775..e4dbe581b'));
  T.ok('range far..pole is 205 commits (the brief\'s number, both endpoints healthy)', revCount('203a32775..5157782a4') === 205, 'count=' + revCount('203a32775..5157782a4'));
  T.ok('first-parent far..merge is 1 (the merge itself)', revCount('--first-parent 203a32775..e4dbe581b') === 1, 'count=' + revCount('--first-parent 203a32775..e4dbe581b'));
  T.ok('origin range is 156 commits', revCount('d229b58f5..a628aeaf3') === 156, 'count=' + revCount('d229b58f5..a628aeaf3'));
  T.ok('origin standing sha is 98c8bfad at the merge-base', sha256(originStanding) === '98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d', sha256(originStanding).slice(0, 12));
  T.ok('origin standing is UNCHANGED across the range (tip == merge-base)', originTipStanding === originStanding, 'tip==base');
  T.ok('fix standing sha is f8fda4295a99', sha256(fixText) === 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078', sha256(fixText).slice(0, 12));
  // Fix-vs-origin diff: exactly 2 insertions (54 added, 0 deleted).
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'culpritbisect-proof-'));
  try {
    fs.writeFileSync(path.join(tmpDir, 'origin-standing.js'), originStanding);
    fs.writeFileSync(path.join(tmpDir, 'fix-standing.js'), fixText);
    let diffOut = '';
    try {
      diffOut = execSync('diff ' + path.join(tmpDir, 'origin-standing.js') + ' ' + path.join(tmpDir, 'fix-standing.js')).toString();
    } catch (e) { diffOut = (e.stdout || Buffer.from('')).toString(); } // diff exits 1 when files differ — that IS the expected case
    const added = (diffOut.match(/^> /gm) || []).length;
    const deleted = (diffOut.match(/^< /gm) || []).length;
    const hunks = (diffOut.match(/^[0-9]+[acd][0-9]/gm) || []).length;
    T.ok('fix-vs-origin diff is exactly 2 hunks', hunks === 2, 'hunks=' + hunks);
    T.ok('fix-vs-origin diff adds 54 lines', added === 54, 'added=' + added);
    T.ok('fix-vs-origin diff deletes 0 lines (pure insertion)', deleted === 0, 'deleted=' + deleted);
    T.ok('fix-vs-origin diff carries the ROSTER CHECK hunk', diffOut.indexOf('ROSTER CHECK') !== -1, 'roster check present');
    T.ok('fix-vs-origin diff carries the BLOODED block', diffOut.indexOf('bloodedCfg') !== -1 && diffOut.indexOf('villageBlooded') !== -1, 'blooded present');
  } finally { fs.rmSync(tmpDir, { recursive: true, force: true }); }
  // BLOODED has zero callers on origin trees.
  function grepCount(commit) {
    try {
      const out = execSync('git grep -l -e villageBlooded -e bloodedCfg ' + commit + ' -- src/js', { cwd: path.join(__dirname, '..') }).toString().trim();
      return out === '' ? 0 : out.split('\n').length;
    } catch (e) { return 0; } // git grep exits 1 on no match
  }
  T.ok('BLOODED has 0 callers at the merge-base', grepCount('d229b58f5') === 0, 'callers=' + grepCount('d229b58f5'));
  T.ok('BLOODED has 0 callers at the origin tip', grepCount('a628aeaf3') === 0, 'callers=' + grepCount('a628aeaf3'));
  T.ok('BLOODED HAS callers at the far end (fieldFights/game/standing)', grepCount('203a32775') === 3, 'callers=' + grepCount('203a32775'));
  // Harness: shas + the one-hunk sourcePatch-only diff.
  const HARNESS_FAR = 'd0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a';
  const HARNESS_ORIGIN = '341d2e6f14c5c1211e3e71443bf203c63ba72319a9652a992316ec05d25764fd';
  T.ok('harness sha is d0447d02 at the far end', sha256(show('203a32775', 'scripts/sim-harness.js')) === HARNESS_FAR, 'sha check');
  T.ok('harness sha is d0447d02 at the merge', sha256(show('e4dbe581b', 'scripts/sim-harness.js')) === HARNESS_FAR, 'sha check');
  T.ok('harness sha is 341d2e6f at the merge-base', sha256(show('d229b58f5', 'scripts/sim-harness.js')) === HARNESS_ORIGIN, 'sha check');
  T.ok('harness sha is 341d2e6f at the origin tip', sha256(show('a628aeaf3', 'scripts/sim-harness.js')) === HARNESS_ORIGIN, 'sha check');
  const harnessDiff = execSync('git diff d229b58f5 203a32775 -- scripts/sim-harness.js', { cwd: path.join(__dirname, '..') }).toString();
  T.ok('harness diff mb->far is exactly 1 hunk', (harnessDiff.match(/^@@/gm) || []).length === 1, 'hunks=' + (harnessDiff.match(/^@@/gm) || []).length);
  T.ok('harness diff mb->far is the sourcePatch hook only', harnessDiff.indexOf('sourcePatch') !== -1, 'sourcePatch present');
  // Policy: one flip on the origin range, far-end vs merge shas.
  T.ok('far policy sha is a7ff5c516440', sha256(farPolicy) === 'a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a', sha256(farPolicy).slice(0, 12));
  T.ok('merge policy sha is 26a87e493578', sha256(mergePolicy) === '26a87e4935787717822176e34423d536813c5fdcab99476e0f35215b30d39c24', sha256(mergePolicy).slice(0, 12));
  const policyCommits = execSync('git log --oneline d229b58f5..a628aeaf3 -- scripts/policies/competent.js', { cwd: path.join(__dirname, '..') }).toString().trim().split('\n');
  T.ok('policy changes exactly once on the origin range', policyCommits.length === 1, 'commits=' + policyCommits.length);
  T.ok('the single policy change is the OVE-160 garden commit 91cb6fa20', policyCommits[0].indexOf('91cb6fa20') === 0, policyCommits[0]);
  const instrumentText = show('f7352f946', 'scripts/vetfirst-instrument-20261111.js');
  T.ok('vetfirst instrument sha is 311f105bc15f at the near end', sha256(instrumentText) === '311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23', sha256(instrumentText).slice(0, 12));

  // ---- 5. Corpus completeness on a synthetic corpus ----
  T.section('5. Corpus completeness — loader names missing seeds');
  T.ok('synthetic per-seed filenames match the analyzer pattern', SC.perSeedFile(190391, 's01-447085506').endsWith('culpritbisect-s190391-culpritbisect-pilot-fix.json'),
    SC.perSeedFile(190391, 's01-447085506'));
  const corpus = SC.loadCorpus(SC.SEEDS, 's01-447085506');

  // ---- 6. Step classification + boundary judge (synthetic corpora) ----
  T.section('6. Step classification + prereg decision rules');
  function fakeRow(seed, lost) {
    return {
      seed: seed, leg: 'bisect', step: 's00-proof', anchorCommit: 'proof', standingFix: true, standingSha: 'f8fda4295a99',
      standingSwapped: true, policySha: 'a7ff5c516440',
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
  const MCA = require('./masterregress-analyze-20261113');
  for (const [n, want] of [[8, 'GOOD'], [5, 'GOOD'], [4, 'GOOD'], [3, 'GOOD'], [2, 'AMBIGUOUS'], [1, 'BAD'], [0, 'BAD']]) {
    const a = MCA.analyzeRows(synthRows(n));
    T.ok('classifyStep: ' + n + '/8 -> ' + want, SC.classifyStep(a.survived) === want && a.survived === n,
      'verdict=' + SC.classifyStep(a.survived) + ' survived=' + a.survived);
  }
  T.ok('classifyStep: out-of-range 9 -> UNCLASSIFIABLE', SC.classifyStep(9) === 'UNCLASSIFIABLE', SC.classifyStep(9));
  T.ok('classifyStep: NaN -> UNCLASSIFIABLE', SC.classifyStep(NaN) === 'UNCLASSIFIABLE', String(SC.classifyStep(NaN)));
  // Boundary judge.
  const boundaryCases = [
    [4, 1, 4, 1, 'GO-CULPRIT-COMMIT'],
    [3, 1, 3, 0, 'GO-CULPRIT-COMMIT'],
    [8, 0, 5, 1, 'GO-CULPRIT-COMMIT'],
    [4, 1, 2, 1, 'NO-GO_BOUNDARY_NOT_REPRODUCED'],
    [4, 1, 4, 2, 'NO-GO_BOUNDARY_NOT_REPRODUCED'],
    [2, 1, 4, 1, 'NO-GO_BOUNDARY_NOT_REPRODUCED'],
    [4, 3, 4, 1, 'NO-GO_BOUNDARY_NOT_REPRODUCED'],
    [4, 1, 4, 3, 'NO-GO_BOUNDARY_NOT_REPRODUCED'],
    [NaN, 1, 4, 1, 'UNCLASSIFIABLE'],
    [4, 9, 4, 1, 'UNCLASSIFIABLE'],
  ];
  for (const [p, cul, pr, cr, want] of boundaryCases) {
    T.ok('judgeBoundary(' + p + ',' + cul + ',' + pr + ',' + cr + ') -> ' + want, SC.judgeBoundary(p, cul, pr, cr) === want, 'got ' + SC.judgeBoundary(p, cul, pr, cr));
  }
  // Rank read.
  for (const [n, want] of [[8, 'REGIONAL_INTACT'], [6, 'REGIONAL_INTACT'], [5, 'REGIONAL_INTACT'], [4, 'RANK_INCONCLUSIVE'], [3, 'RANK_INCONCLUSIVE'], [2, 'RANK_STALL'], [0, 'RANK_STALL']]) {
    const a = MCA.analyzeRows(synthRows(8, n));
    T.ok('rank: ' + n + '/8 regional -> ' + want, SC.classifyRegional(a.wall.regional) === want && a.wall.regional === n,
      'rankVerdict=' + SC.classifyRegional(a.wall.regional) + ' regional=' + a.wall.regional);
  }
  T.ok('rank: out-of-range 9 -> UNCLASSIFIABLE', SC.classifyRegional(9) === 'UNCLASSIFIABLE', SC.classifyRegional(9));
  const a6 = MCA.analyzeRows(synthRows(6));
  T.ok('6/8 synthetic: median 150d', a6.wall.medianDays === 150, 'median=' + a6.wall.medianDays);
  T.ok('6/8 synthetic: wave4 8/8, wave5 0/8', a6.wall.wave4 === 8 && a6.wall.wave5 === 0, 'wave4=' + a6.wall.wave4 + ' wave5=' + a6.wall.wave5);
  T.ok('6/8 synthetic: death-cause shares count 8 deaths', a6.causes.total === 8 && a6.causes.counts.combat === 8,
    'total=' + a6.causes.total + ' ' + JSON.stringify(a6.causes.counts));
  const a4 = MCA.analyzeRows(synthRows(4));
  T.ok('4/8 synthetic: survived counted from villageLost flag', a4.survived === 4, 'survived=' + a4.survived);

  // ---- 7. Live smoke: the driver runs end-to-end ----
  T.section('7. Live smoke — driver runs 1 seed x 5 days (LEG=smoke)');
  const smokeDir = path.join('/tmp', 'culpritbisect-smoke');
  fs.rmSync(smokeDir, { recursive: true, force: true });
  let smokeOut = null, smokeErr = null;
  try {
    smokeOut = execSync('node ' + path.join(__dirname, 'culpritbisect-driver-20261113.js'),
      { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { LEG: 'smoke', DAYS: '5', SEEDS: '190391', RUN: 'culpritbisect-smoke' }), stdio: 'pipe' }).toString();
  } catch (e) { smokeErr = e; }
  const smokeFile = path.join(smokeDir, 'culpritbisect-s190391-culpritbisect-smoke-fix.json');
  T.ok('smoke driver exits 0', smokeErr === null, smokeErr ? String(smokeErr.stderr || smokeErr.message).slice(0, 200) : 'exit 0');
  T.ok('smoke driver writes its per-seed JSON', fs.existsSync(smokeFile), 'file=' + smokeFile);
  if (fs.existsSync(smokeFile)) {
    const row = JSON.parse(fs.readFileSync(smokeFile, 'utf8'));
    T.ok('smoke row is the smoke leg, seed 190391, 5 days', row.leg === 'smoke' && row.seed === 190391 && row.days === 5,
      'leg=' + row.leg + ' seed=' + row.seed + ' days=' + row.days);
    T.ok('smoke row carries daily snapshots (days-1 cadence)', Array.isArray(row.daily) && row.daily.length === row.days - 1, 'snapshots=' + (row.daily || []).length + ' days=' + row.days);
    T.ok('smoke row last snapshot is on the final game day', row.daily[row.daily.length - 1].day === row.gameDays, 'lastSnapDay=' + row.daily[row.daily.length - 1].day + ' gameDays=' + row.gameDays);
    T.ok('smoke row has zero instrument errors', (row.instrumentErrors || []).length === 0, 'errors=' + (row.instrumentErrors || []).length);
    T.ok('smoke row records the branch standing sha', typeof row.standingSha === 'string' && row.standingSha.length === 12, 'standingSha=' + row.standingSha);
    T.ok('smoke row records standingSwapped=false on the branch (native fix, not the swap)', row.standingSwapped === false, 'standingSwapped=' + row.standingSwapped);
  }
  fs.rmSync(smokeDir, { recursive: true, force: true });

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
