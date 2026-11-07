#!/usr/bin/env node
// scripts/test-feareddoor-rejudge-b-20261107.js — proof for the
// feared-door RE-JUDGE (arm sim-feareddoor-rejudge-b, run
// fleshout-loop-b-20261107T1830Z). NO NEW SIMS: the re-judge runs
// only on the frozen corpus (band 53201-53212, judged at branch
// tip 6e8b3e8f0).
//
// Sections:
//   (A) REVISED-BAR fixtures: judgeRevised on synthetic counts —
//       the primary bar (feared wins >=4/12 AND margin >=3),
//       the guard, the cost bar (non-inferiority, starvation
//       cap + arm-only, median tripwire), and the substrate
//       sanity gate. Each bar is pinned independently of any
//       corpus, including the boundary values.
//   (B) FROZEN-CORPUS leg: analyzeCorpus on the frozen corpora
//       must reproduce the frozen numbers (feared wins 5 vs 0,
//       feared entered 5 vs 0, wins 5 vs 5, guard 12/12,
//       starvation 4 -> 4, arm-only 0, non-inferiority 12/12,
//       medians 112.5/112.5, pair days 80/80) and judge GO
//       under the revised bars.
//
// Usage: node scripts/test-feareddoor-rejudge-b-20261107.js
'use strict';
const assert = require('assert');
const path = require('path');

const REPO = path.join(__dirname, '..');
const REJUDGE = require('./feareddoor-rejudge-b-analyze-20261107');
const judgeRevised = REJUDGE.judgeRevised;
const analyzeCorpus = REJUDGE.analyzeCorpus;

let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

// A valid counts object (the frozen shape), overridden per fixture.
function baseCounts(over) {
  const c = {
    fearedWinsArmed: 5, fearedWinsBaseline: 0,
    fearedEnteredArmed: 5, fearedEnteredBaseline: 0,
    baseSeats: 6, baseSat: 5, armedSat: 5,
    guardPass: 12, guardOf: 12,
    nonInfPass: 12, nonInfOf: 12,
    starvBase: 4, starvArmed: 4, starvArmOnly: 0,
    medianBase: 112.5, medianArmed: 112.5,
  };
  if (over) Object.keys(over).forEach(function (k) { c[k] = over[k]; });
  return c;
}

// ---- (A) REVISED-BAR fixtures ----

// The frozen shape passes GO under the revised bars.
(function () {
  const v = judgeRevised(baseCounts());
  ok('REVISED: frozen shape (feared wins 5 vs 0, margin 5) -> GO', v.overall === 'GO');
  ok('REVISED: primary margin recorded as 5', v.primary.fearedWinsMargin === 5);
  ok('REVISED: primary bar text names feared wins + margin', /feared wins/.test(v.primary.bar) && /margin|more feared wins/.test(v.primary.bar));
  ok('REVISED: cost bar passes (starvation 4->4, arm-only 0, median ratio 1.0)', v.costBar.pass === true);
  ok('REVISED: median ratio recorded as 1.0', v.costBar.medianRatio === 1);
})();

// Primary floor: feared wins 3/12 fails even with a clean margin.
(function () {
  const v = judgeRevised(baseCounts({ fearedWinsArmed: 3, fearedEnteredArmed: 3 }));
  ok('REVISED: feared wins 3 vs 0 fails the >=4 floor', v.primary.pass === false && v.overall === 'NO-GO');
})();

// Primary margin: 4 wins with margin 2 fails; 4 wins with margin 3 passes.
(function () {
  const v2 = judgeRevised(baseCounts({ fearedWinsArmed: 4, fearedWinsBaseline: 2, fearedEnteredArmed: 4, fearedEnteredBaseline: 2 }));
  ok('REVISED: feared wins 4 vs 2 fails the >=3 margin', v2.primary.pass === false && v2.overall === 'NO-GO');
  const v3 = judgeRevised(baseCounts({ fearedWinsArmed: 4, fearedWinsBaseline: 1, fearedEnteredArmed: 4, fearedEnteredBaseline: 1 }));
  ok('REVISED: feared wins 4 vs 1 passes (margin exactly 3)', v3.primary.pass === true && v3.overall === 'GO');
})();

// The margin counts BASELINE feared wins honestly: a baseline that
// already wins feared doors narrows the margin the same way.
(function () {
  const v = judgeRevised(baseCounts({ fearedWinsArmed: 5, fearedWinsBaseline: 3, fearedEnteredArmed: 5, fearedEnteredBaseline: 3 }));
  ok('REVISED: feared wins 5 vs 3 fails (margin 2, baseline feared wins count)', v.primary.pass === false);
})();

// Guard: 11/12 fails the run even with a passing primary.
(function () {
  const v = judgeRevised(baseCounts({ guardPass: 11 }));
  ok('REVISED: guard 11/12 -> NO-GO', v.substrateGuard.pass === false && v.overall === 'NO-GO');
})();

// Substrate sanity: a dead band (sat 3/12) is NO-GO on substrate,
// not a lever verdict.
(function () {
  const v = judgeRevised(baseCounts({ baseSat: 3 }));
  ok('REVISED: baseline sat 3/12 -> NO-GO (substrate)', v.substrateSanity.pass === false && v.overall === 'NO-GO (substrate — feared drive unjudged)');
})();

// Cost bar: one seed dying earlier fails non-inferiority.
(function () {
  const v = judgeRevised(baseCounts({ nonInfPass: 11 }));
  ok('REVISED: non-inferiority 11/12 -> cost FAIL -> NO-GO', v.costBar.nonInferiorityPass === false && v.costBar.pass === false && v.overall === 'NO-GO');
})();

// Cost bar: starvation cap boundary — baseline+2 passes, +3 fails.
(function () {
  const vOk = judgeRevised(baseCounts({ starvArmed: 6 }));
  ok('REVISED: starvation 4->6 passes the baseline+2 cap', vOk.costBar.starvationPass === true);
  const vFail = judgeRevised(baseCounts({ starvArmed: 7 }));
  ok('REVISED: starvation 4->7 fails the baseline+2 cap', vFail.costBar.starvationPass === false && vFail.overall === 'NO-GO');
})();

// Cost bar: arm-only starvation fails even inside the total cap.
(function () {
  const v = judgeRevised(baseCounts({ starvArmed: 5, starvArmOnly: 1 }));
  ok('REVISED: arm-only starvation 1 fails even at total 5 (cap 6)', v.costBar.starvationPass === false && v.overall === 'NO-GO');
})();

// Cost bar: median tripwire boundary — exactly 0.8x passes, below fails.
(function () {
  const vOk = judgeRevised(baseCounts({ medianBase: 150, medianArmed: 120 }));
  ok('REVISED: median ratio exactly 0.8 passes the tripwire', vOk.costBar.medianPass === true && vOk.costBar.medianRatio === 0.8);
  const vFail = judgeRevised(baseCounts({ medianBase: 150, medianArmed: 112.5 }));
  ok('REVISED: median ratio 0.75 fails the tripwire', vFail.costBar.medianPass === false && vFail.costBar.pass === false);
})();

// ---- (B) FROZEN-CORPUS leg ----
(function () {
  const out = analyzeCorpus(
    path.join(REPO, 'evidence', '2026-11-07', 'perseed-feareddoor-b-baseline'),
    path.join(REPO, 'evidence', '2026-11-07', 'perseed-feareddoor-b-armed'));
  const c = out.counts;
  const v = out.verdict;
  ok('CORPUS: 12+12 per-seed files, band 53201-53212', out.seeds.length === 12 && out.seeds[0] === 53201 && out.seeds[11] === 53212);
  ok('CORPUS: feared wins reproduce frozen 5 vs 0', c.fearedWinsArmed === 5 && c.fearedWinsBaseline === 0);
  ok('CORPUS: feared entered reproduces frozen 5 vs 0', c.fearedEnteredArmed === 5 && c.fearedEnteredBaseline === 0);
  ok('CORPUS: wins reproduce frozen 5 vs 5 (no net win change)', out.wallArmed.wins === 5 && out.wallBaseline.wins === 5);
  ok('CORPUS: guard reproduces frozen 12/12', v.substrateGuard.exactSeeds === 12 && v.substrateGuard.pass === true);
  ok('CORPUS: starvation reproduces frozen 4 -> 4, arm-only 0', c.starvationBase === 4 && c.starvationArmed === 4 && c.starvationArmOnly === 0);
  ok('CORPUS: per-seed non-inferiority reproduces frozen 12/12', v.costBar.nonInferiorSeeds === 12 && v.costBar.nonInferiorityPass === true);
  ok('CORPUS: medians reproduce frozen 112.5 -> 112.5 (ratio 1.0)', out.wallBaseline.medianSurvival === 112.5 && out.wallArmed.medianSurvival === 112.5 && v.costBar.medianRatio === 1);
  ok('CORPUS: pair days reproduce frozen 80 -> 80', c.pairDaysBase === 80 && c.pairDaysArmed === 80);
  ok('CORPUS: feared offered-but-unwalked armed reproduces frozen 0', c.fearedOfferedUnwalkedArmed === 0);
  ok('CORPUS: substrate sanity reproduces frozen (lesser 6/12, sat 5/12)', v.substrateSanity.baseSeatsEarned === 6 && v.substrateSanity.baseSat === 5);
  ok('CORPUS: verdict under the REVISED bars is GO', v.overall === 'GO');
  ok('CORPUS: every per-seed row has zero instrument errors', out.baseline.every(function (r) { return r.errors === 0; }) && out.armed.every(function (r) { return r.errors === 0; }));
  ok('CORPUS: every sat seed walked feared in the armed leg and won it', out.armed.filter(function (r) { return r.tsTaken > 0; }).every(function (r) { return r.fearedWin; }));
})();

console.log(pass + ' ok, exit ' + (process.exitCode ? 1 : 0));
