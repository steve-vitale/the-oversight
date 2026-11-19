// test-partysize4-confirm-b.js — proof for arm sim-partysize4-confirm-b.
// Proves the 16-seed CONFIRM of the PARTYSIZE4 lever (band
// 104730-104745, 150d, competent verbatim, substrate VETREENGAGE=1 +
// FLEEREPAIR2=1, LAUNCHSURVIVE=1 both legs) by independently
// recounting the panel corpora and cross-checking the frozen
// analyzer's verdict — not just green assertions. The LIVE
// quad-fire leg (a quad actually launching through winPlanDepart /
// vbrainExecuteDepart and being counted by the fight engine's own
// depart record) is proven by test-partysize4-b.js §5 +
// test-partyquads-b.js §5q, both green on this tip before the
// sweep (test-partysize4-b §1 frozen-diff leg fails on master drift
// — unrelated landed work in build.js/fieldFights.js/godpath.js
// since the 1735Z freeze — documented in the prereg, not chased);
// this test proves the same effect on the REAL confirm corpora
// (§5 below: the 104733 day-85 stan_kowalski strike quad row,
// partySize 4, counted in the file's partyQuads).
// The frozen prereg's verdict is NO-GO METRIC-BROKEN: the arm pool
// floor (12) missed by one launch (11) even though the primary
// quad-fire ratio passed 9/9 = 1.00 and every other bar passed.
// §14 binds — a miss is NO-GO, never re-scored mid-run — so §3
// below asserts the floor outcome HONESTLY (arm launches == 11,
// floor == 12, judgement == NO-GO METRIC-BROKEN) instead of
// asserting a pass that did not happen.
// Usage: node scripts/test-partysize4-confirm-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CTL_DIR = path.join(REPO, 'evidence', '2026-11-18', 'perseed-partysize4-confirm-b-survey-ctl');
const ARM_DIR = path.join(REPO, 'evidence', '2026-11-18', 'perseed-partysize4-confirm-b-arm');
const ANALYSIS = path.join(REPO, 'evidence', '2026-11-18', 'partysize4-confirm-b-analysis.json');
const PANEL = path.join(REPO, 'evidence', '2026-11-18', 'partysize4-confirm-b-panel.md');
const LS_REPORT = path.join(REPO, 'evidence', '2026-11-18', 'partysize4-confirm-b-launchsurvive.json');
const SURVEY_ANCHOR = '046ae5859128'; // survey ran on master tip before the prereg commit
const ARM_ANCHOR = '7f00f27624ab3a'; // arm ran after the prereg + corpus commits
const SEEDS = [104730, 104731, 104732, 104733, 104734, 104735, 104736, 104737,
  104738, 104739, 104740, 104741, 104742, 104743, 104744, 104745];

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function loadDir(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort()) {
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}
function w4launches(d) {
  return (d.v4departs || []).filter(function (r) { return r.result === 'launch' && (r.targetWave || 0) >= 4; });
}
function quads(d) { return w4launches(d).filter(function (r) { return (r.partySize || 0) >= 4; }); }
function trios(d) { // size>=3 launches, the analyzer's observedTrios
  return w4launches(d).filter(function (r) { return (r.partySize || 0) >= 3; });
}

// §0 — lever statics: the lever is present on this tip.
const winplan = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
const brain = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
check('§0 win-plan has winPlanThirdCompanion', winplan.indexOf('winPlanThirdCompanion') !== -1);
check('§0 win-plan has partysize4On gate', winplan.indexOf('partysize4On') !== -1);
check('§0 win-plan has partyQuads bump (finding #2549)', winplan.indexOf("bump(self, 'partyQuads')") !== -1);
check('§0 win-plan stateOf defaults partyQuads to 0', /partyQuads: 0/.test(winplan));
check('§0 brain has winPlanThirdCompanion', brain.indexOf('winPlanThirdCompanion') !== -1);
check('§0 brain has companion3 launch', brain.indexOf('c.companion3') !== -1);
check('§0 brain has partyQuads bump', brain.indexOf('_pq.partyQuads') !== -1);
check('§0 lever commits are ancestors of HEAD',
  (function () {
    try {
      const log = require('child_process').execSync('git log --format=%H', { cwd: REPO, encoding: 'utf8' });
      return log.indexOf('1032897dc') !== -1 && log.indexOf('a9a4108fe') !== -1;
    } catch (e) { return false; }
  })());

// §1 — corpus integrity: 16/16 files, anchors as frozen, flag/leg match,
// no src drift between the survey anchor and the arm anchor.
const ctl = loadDir(CTL_DIR);
const arm = loadDir(ARM_DIR);
check('§1 ctl has 16 files', ctl.length === 16, 'got ' + ctl.length);
check('§1 arm has 16 files', arm.length === 16, 'got ' + arm.length);
check('§1 seeds are 104730-104745 both legs',
  ctl.map(function (d) { return d.seed; }).join(',') === SEEDS.join(',') &&
  arm.map(function (d) { return d.seed; }).join(',') === SEEDS.join(','));
check('§1 survey files share one anchorCommit (the pre-freeze master tip)',
  (function () { const s = {}; ctl.forEach(function (d) { s[d.anchorCommit] = true; }); return Object.keys(s).length === 1 && Object.keys(s)[0].indexOf(SURVEY_ANCHOR) === 0; })(),
  JSON.stringify(ctl.map(function (d) { return d.anchorCommit; }).filter(function (v, i, a) { return a.indexOf(v) === i; })));
check('§1 arm files share one anchorCommit (post-prereg tip)',
  (function () { const s = {}; arm.forEach(function (d) { s[d.anchorCommit] = true; }); return Object.keys(s).length === 1 && Object.keys(s)[0].indexOf(ARM_ANCHOR) === 0; })(),
  JSON.stringify(arm.map(function (d) { return d.anchorCommit; }).filter(function (v, i, a) { return a.indexOf(v) === i; })));
check('§1 no src/ drift between survey anchor and arm anchor',
  (function () {
    try {
      const out = require('child_process').execSync('git diff --name-only ' + SURVEY_ANCHOR + ' ' + ARM_ANCHOR + ' -- src/', { cwd: REPO, encoding: 'utf8' });
      return out.trim() === '';
    } catch (e) { return false; }
  })());
check('§1 ctl flag unset + lever present',
  ctl.every(function (d) { return d.partysize4Flag == null && d.leverPresent === true; }));
check('§1 arm flag 1 + lever present',
  arm.every(function (d) { return d.partysize4Flag === '1' && d.leverPresent === true; }));
check('§1 v4launchTrack present on all 32 files',
  ctl.concat(arm).every(function (d) { return Array.isArray(d.v4launchTrack); }));
check('§1 instrument errors 0 on all 32 files',
  ctl.concat(arm).every(function (d) { return ((d.instrumentErrors || []).length) === 0; }));

// §2 — measurement replication: recount from v4departs, cross-check
// the frozen analyzer JSON.
const analysis = JSON.parse(fs.readFileSync(ANALYSIS, 'utf8'));
const ctlLaunches = ctl.reduce(function (a, d) { return a + w4launches(d).length; }, 0);
const armLaunches = arm.reduce(function (a, d) { return a + w4launches(d).length; }, 0);
const ctlQuads = ctl.reduce(function (a, d) { return a + quads(d).length; }, 0);
const armQuads = arm.reduce(function (a, d) { return a + quads(d).length; }, 0);
const ctlPQ = ctl.reduce(function (a, d) { return a + ((d.winPlanStats || {}).partyQuads || 0); }, 0);
const armPQ = arm.reduce(function (a, d) { return a + ((d.winPlanStats || {}).partyQuads || 0); }, 0);
check('§2 recount ctl launches 40', ctlLaunches === 40, 'got ' + ctlLaunches);
check('§2 recount arm launches 11', armLaunches === 11, 'got ' + armLaunches);
check('§2 recount ctl quads 0', ctlQuads === 0, 'got ' + ctlQuads);
check('§2 recount arm quads 9', armQuads === 9, 'got ' + armQuads);
check('§2 recount ctl partyQuads 0', ctlPQ === 0, 'got ' + ctlPQ);
check('§2 recount arm partyQuads 9', armPQ === 9, 'got ' + armPQ);
check('§2 analyzer agrees on launches/quads/counters',
  analysis.ctl.launches === 40 && analysis.arm.launches === 11 &&
  analysis.ctl.quadLaunches === 0 && analysis.arm.quadLaunches === 9 &&
  analysis.ctl.partyQuads === 0 && analysis.arm.partyQuads === 9);
check('§2 quad ratio 9/9 = 1.00 (>= 0.95 prereg bar)', armQuads > 0 && armPQ / armQuads === 1);
check('§2 per-seed exact 16/16',
  arm.every(function (d) { return ((d.winPlanStats || {}).partyQuads || 0) === quads(d).length; }));
check('§2 trio accounting exact 16/16 each leg',
  ctl.every(function (d) { return ((d.winPlanStats || {}).partyTrios || 0) === trios(d).length; }) &&
  arm.every(function (d) { return ((d.winPlanStats || {}).partyTrios || 0) === trios(d).length; }));
check('§2 analyzer verdict is GO on its coded bars (floor 6/leg, ratio 0.80)',
  analysis.verdict === 'GO');
check('§2 quad conversion arm 9/11', armQuads === 9 && armLaunches === 11);

// §3 — the frozen prereg's floor judgement, asserted honestly: the
// prereg floor (ctl >= 16, arm >= 12) FAILS on the arm leg by one
// launch, so the prereg verdict is NO-GO METRIC-BROKEN — even
// though the ratio bar passed. The test proves the judgement
// follows from the numbers; it does not re-score the miss away.
const CTL_FLOOR = 16, ARM_FLOOR = 12;
check('§3 ctl floor passes (40 >= 16)', ctlLaunches >= CTL_FLOOR);
check('§3 arm floor FAILS by one (11 < 12)', armLaunches === 11 && armLaunches < ARM_FLOOR);
check('§3 prereg verdict is NO-GO METRIC-BROKEN on the frozen floor',
  ctlLaunches >= CTL_FLOOR && armLaunches < ARM_FLOOR);
check('§3 cost starvation passes (arm 5 <= ctl 6 + 2)',
  analysis.arm.starvation <= analysis.ctl.starvation + 2);
check('§3 cost median passes (arm 148 >= 0.8 x ctl 150)',
  analysis.arm.medianDays >= 0.8 * analysis.ctl.medianDays);
check('§3 community loss within frozen bar (arm 8 <= ctl 6 + 16)',
  (function () {
    const cl = function (rows) { return rows.filter(function (d) { return ['village-lost', 'village-dead', 'pop-zero'].indexOf(d.endReason) !== -1; }).length; };
    return cl(arm) <= cl(ctl) + 16;
  })());

// §4 — #2557 follow-up numbers: the seeding gap reproduces on the
// rich seeds, but no total post-quad launch drought.
function bySeed(rows, s) { return rows.filter(function (d) { return d.seed === s; })[0]; }
function censusLen(d) { return (d.dawnbidCensus || []).length; }
function v4seedCount(d) { return (d.v4seeds || []).filter(function (r) { return (r.wave || 0) >= 4; }).length; }
check('§4 104733 seeding gap: census arm 129 < ctl 302',
  censusLen(bySeed(arm, 104733)) === 129 && censusLen(bySeed(ctl, 104733)) === 302);
check('§4 104733 seeding gap: v4seeds w4+ arm 15 < ctl 38',
  v4seedCount(bySeed(arm, 104733)) === 15 && v4seedCount(bySeed(ctl, 104733)) === 38);
check('§4 104742 seeding gap: census arm 122 < ctl 403',
  censusLen(bySeed(arm, 104742)) === 122 && censusLen(bySeed(ctl, 104742)) === 403);
check('§4 104744 seeding gap: census arm 80 < ctl 212',
  censusLen(bySeed(arm, 104744)) === 80 && censusLen(bySeed(ctl, 104744)) === 212);
check('§4 no total drought: arm launches quads after the first quad on 104733/104742/104743',
  (function () {
    function afterFirstQuad(d) {
      const qs = quads(d);
      if (!qs.length) return null;
      const fq = Math.min.apply(null, qs.map(function (r) { return r.day; }));
      return w4launches(d).filter(function (r) { return r.day > fq && r.day <= fq + 30; }).length;
    }
    return afterFirstQuad(bySeed(arm, 104733)) >= 1 && afterFirstQuad(bySeed(arm, 104742)) >= 1 &&
      afterFirstQuad(bySeed(arm, 104743)) >= 1;
  })());
check('§4 104732 identical trajectories: same 2 launches, same census, same v4seeds both legs',
  (function () {
    const c = bySeed(ctl, 104732), a = bySeed(arm, 104732);
    return w4launches(c).length === 2 && w4launches(a).length === 2 &&
      censusLen(c) === censusLen(a) && (c.v4seeds || []).length === (a.v4seeds || []).length;
  })());

// §5 — live quad rows in the real arm corpus.
check('§5 104733 d85 stan_kowalski strike quad row, partySize 4',
  (function () {
    const d = bySeed(arm, 104733);
    return w4launches(d).some(function (r) { return r.day === 85 && r.vid === 'stan_kowalski' && r.target === 'strike' && r.partySize === 4; });
  })());
check('§5 104742 d76 nikos_papadopoulos algorithm quad row, partySize 4',
  (function () {
    const d = bySeed(arm, 104742);
    return w4launches(d).some(function (r) { return r.day === 76 && r.vid === 'nikos_papadopoulos' && r.target === 'algorithm' && r.partySize === 4; });
  })());
check('§5 104732 non-conversion is availability-gated, not a misfire (companion3 null, partyQuads 0)',
  (function () {
    const d = bySeed(arm, 104732);
    return w4launches(d).every(function (r) { return r.companion3 == null; }) &&
      ((d.winPlanStats || {}).partyQuads || 0) === 0;
  })());

// §6 — launchsurvive: tracker gaps 0 both legs; the judge's own
// instrument bar reads fail ONLY because it hardcodes 8 seeds/files
// (this run has 16) — the underlying measures are clean.
check('§6 launchsurvive report exists', fs.existsSync(LS_REPORT));
check('§6 launchsurvive tracker gaps 0 both legs',
  (function () {
    const txt = fs.readFileSync(LS_REPORT, 'utf8');
    return txt.indexOf('trackerGaps: 0') !== -1 && (txt.match(/trackerGaps: 0/g) || []).length >= 2;
  })());
check('§6 launchsurvive D3 clean on all 16 seeds',
  (function () {
    const txt = fs.readFileSync(LS_REPORT, 'utf8');
    return (txt.match(/divergesBeforeFirstSeed: false/g) || []).length === 4 &&
      (txt.match(/divergesBeforeFirstSeed: null/g) || []).length === 12;
  })());

// §7 — balanced panel: review_required, one regression_watch row
// (community loss), investigated in the evidence file.
check('§7 panel file exists with decision review_required',
  fs.existsSync(PANEL) && fs.readFileSync(PANEL, 'utf8').indexOf('Decision: review_required') !== -1);
check('§7 panel has 16 paired cases',
  fs.readFileSync(PANEL, 'utf8').indexOf('16 paired cases') !== -1);
check('§7 panel community-loss row is regression_watch',
  fs.readFileSync(PANEL, 'utf8').indexOf('Community loss') !== -1 &&
  fs.readFileSync(PANEL, 'utf8').indexOf('regression_watch') !== -1);

console.log('test-partysize4-confirm-b: ' + passed + ' passed, ' + failed + ' failed, 0 skipped');
if (failed) process.exit(1);
