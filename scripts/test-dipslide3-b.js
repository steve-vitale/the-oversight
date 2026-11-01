#!/usr/bin/env node
// test-dipslide3-b.js — PURE proof tests for scripts/analyze-dipslide3-b.js.
// (DIAG ONLY.) No game load, no file writes, no RNG, no judged seeds.
// Usage: node scripts/test-dipslide3-b.js
// A --live mode is intentionally NOT included: retrospective calibration on
// already-judged corpora, if done at all, runs only AFTER the prereg commit
// and is labeled calibration in the evidence file, never a judged result.
'use strict';

const { analyzeSeed3, confirms3, toleranceRecovery, isHairlineOnly, summarize3 } = require('./analyze-dipslide3-b');
const { isEligibleCandidateDay } = require('./analyze-dipslide-b');

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; }
  else { failed++; console.error('FAIL: ' + name); }
}

// Synthetic seed: pantry series array, one row per loopDay starting at 1.
// Candidate day is 10 by construction: days 1-5 flat 30000, days 6-9 falling
// 29000/28000/27000/26000, day 10 = 23000 (<= 0.80*30000, 3 falls ending 10).
function mkSeed(series, opts) {
  const o = opts || {};
  const rows = series.map((p, idx) => ({
    loopDay: idx + 1,
    pantryKcal: p,
    freshDays: 5,
    gateEngaged: o.gateOffDay != null && idx + 1 === o.gateOffDay ? false : true,
    hungryStreak: 0,
    alive: 5,
  }));
  return { seed: o.seed || 99999, arm: 'armed', endReason: o.endReason || 'survived',
    daysAlive: rows.length, maxWaveUnlocked: 2, waveKills: {}, rows, sayLines: [] };
}
function baseWindow() { return [30000, 30000, 30000, 30000, 30000, 29000, 28000, 27000, 26000, 23000]; }
function analyzeWithWindow(win, opts) {
  const sj = mkSeed(baseWindow().concat(win), opts);
  const a = analyzeSeed3(sj);
  return { sj, a };
}
function runIdx(sj) {
  // Final run is the whole window here (all engaged): runStart=0, runEnd=len-1.
  // confirms3 needs rowsByLoopDay; rebuild it the way the analyzer does.
  const rows = sj.rows;
  const map = new Map();
  rows.forEach((r, i) => map.set(r.loopDay, i));
  return { rows, map };
}

// 1. Pure fall window confirms, is not hairline-only, confirms under both rules.
{
  const { sj, a } = analyzeWithWindow([22000, 21000, 20000, 19000, 18000]);
  check('pure fall: candidateDay 10', a.candidateDay === 10);
  check('pure fall: confirmedDay 15', a.confirmedDay === 15);
  check('pure fall: not hairline-only', a.hairlineOnly === false);
  check('pure fall: not restored (old rule also confirms)', a.restoredByTolerance.length === 0);
  check('pure fall: not rejected by tolerance', a.rejectedByTolerance.length === 0);
  const { rows, map } = runIdx(sj);
  check('pure fall: confirms3 true at candidate row', confirms3(rows, map, 9, 0, rows.length - 1) === true);
}

// 2. Historical hairline shape (+215, +0.93%, single evening, then falls):
// confirms under tolerance, IS hairline-only, IS in the restored set.
{
  const { a } = analyzeWithWindow([23215, 22000, 21000, 20000, 19000]);
  check('hairline +215: confirms', a.confirmedDay === 15);
  check('hairline +215: hairline-only', a.hairlineOnly === true);
  check('hairline +215: restored by tolerance', a.restoredByTolerance.indexOf(10) !== -1);
}

// 3. Margin breach (+6.5% single evening) rejects, reason margin.
{
  const { sj, a } = analyzeWithWindow([24500, 22000, 21000, 20000, 19000]);
  check('margin +6.5%: no confirm', a.confirmedDay === null);
  const { rows, map } = runIdx(sj);
  const rec = toleranceRecovery(rows, map, 9);
  check('margin +6.5%: reason margin', rec.recovered === true && rec.reason === 'margin');
}

// 4. Exactly 105% counts as a margin breach (no gap in the partition).
{
  const { a } = analyzeWithWindow([24150, 22000, 21000, 20000, 19000]);
  check('exactly 105%: no confirm', a.confirmedDay === null);
}

// 5. Two consecutive sub-margin evenings at/above level reject (sustained).
{
  const { sj, a } = analyzeWithWindow([23100, 23050, 21000, 20000, 19000]);
  check('sustained sub-margin pair: no confirm', a.confirmedDay === null);
  const { rows, map } = runIdx(sj);
  const rec = toleranceRecovery(rows, map, 9);
  check('sustained sub-margin pair: reason sustained', rec.recovered === true && rec.reason === 'sustained');
}

// 6. Two consecutive evenings exactly AT the candidate level reject.
{
  const { a } = analyzeWithWindow([23000, 23000, 21000, 20000, 19000]);
  check('sustained equality pair: no confirm', a.confirmedDay === null);
}

// 7. A single evening exactly AT the level, then falls: confirms, and is
// NOT hairline-only (equality is not a strict uplift above level).
{
  const { a } = analyzeWithWindow([23000, 22000, 21000, 20000, 19000]);
  check('single equality evening: confirms', a.confirmedDay === 15);
  check('single equality evening: not hairline-only', a.hairlineOnly === false);
}

// 8. Two SEPARATED sub-margin evenings confirm and are NOT hairline-only
// under the verbatim definition (disclosed gap: exactly-one-above only).
{
  const { a } = analyzeWithWindow([23200, 21000, 23100, 20000, 19000]);
  check('two separated sub-margin evenings: confirms', a.confirmedDay === 15);
  check('two separated sub-margin evenings: not hairline-only (disclosed gap)', a.hairlineOnly === false);
}

// 9. A null evening BREAKS consecutiveness for the sustained branch:
// at-level, null, at-level still confirms.
{
  const { a } = analyzeWithWindow([23100, null, 23100, 20000, 19000]);
  check('null breaks sustained pair: confirms', a.confirmedDay === 15);
}

// 10. Endpoint above the candidate level blocks confirmation even when the
// only above-level evening is a single sub-margin uplift.
{
  const { a } = analyzeWithWindow([22000, 21000, 20000, 19000, 23500]);
  check('endpoint above level: no confirm', a.confirmedDay === null);
}

// 11. Missing D+5 row blocks confirmation.
{
  const sj = mkSeed(baseWindow().concat([22000, 21000, 20000, 19000]));
  const a = analyzeSeed3(sj);
  check('missing D+5: no confirm', a.confirmedDay === null);
}

// 12. D+5 disengaged (outside the final run) blocks confirmation.
{
  const { a } = analyzeWithWindow([22000, 21000, 20000, 19000, 18000], { gateOffDay: 15 });
  check('D+5 disengaged: no confirm', a.confirmedDay === null);
}

// 13. Flat series: no candidate, no confirm.
{
  const sj = mkSeed([30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000]);
  const a = analyzeSeed3(sj);
  check('flat series: no candidate', a.candidateDay === null && a.confirmedDay === null);
}

// 14. Early-window exclusion: a candidate-shaped fall ending on loopDay 7
// is not eligible (isEligibleCandidateDay false).
{
  const rows = [30000, 30000, 29000, 28000, 27000, 26000, 20000].map((p, idx) => ({
    loopDay: idx + 1, pantryKcal: p, freshDays: 5, gateEngaged: true, hungryStreak: 0, alive: 5 }));
  // Day 7: 20000 <= 0.80*30000 (day 2)? P(D-5)=P(2)=30000, 20000<=24000 yes;
  // falls: P5<P4 (27000<28000), P6<P5, P7<P6 — candidate-shaped but loopDay 7.
  check('loopDay 7 candidate-shaped row is ineligible', isEligibleCandidateDay(rows, 6) === false);
}

// 15. Tolerance rule is a pure relaxation of dipslide2: a dipslide2 confirm
// is never rejected by tolerance (rejected set empty on the pure-fall case
// is covered in test 1; here assert the same on the hairline case's
// converse — the margin case is rejected by BOTH rules, not by tolerance alone).
{
  const { a } = analyzeWithWindow([24500, 22000, 21000, 20000, 19000]);
  check('margin case: rejected by neither rule alone (both reject)', a.rejectedByTolerance.length === 0);
}

// 16. summarize3 bars: 1 pure confirm + 1 hairline confirm + 1 silent seed.
{
  const s1 = analyzeWithWindow([22000, 21000, 20000, 19000, 18000], { seed: 1 }).sj;
  const s2 = analyzeWithWindow([23215, 22000, 21000, 20000, 19000], { seed: 2 }).sj;
  const s3 = mkSeed([30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000], { seed: 3 });
  const sum = summarize3([s1, s2, s3]);
  check('summarize: confirmedCount 2', sum.bars.confirmedCount === 2);
  check('summarize: hairlineOnlyCount 1', sum.bars.hairlineOnlyCount === 1);
  check('summarize: hairlineOnlySeeds [2]', JSON.stringify(sum.bars.hairlineOnlySeeds) === '[2]');
  check('summarize: false-fire count 2 (both confirms on survived seeds)', sum.bars.falseFireRate.falseSeeds.length === 2);
  check('summarize: census valid all', sum.censusValidAll === true);
  check('summarize: wall maxWave 2', sum.wall.maxWaveUnlocked === 2);
}

// 17. isHairlineOnly unit checks on the raw window helper path.
{
  const sj = mkSeed(baseWindow().concat([23215, 22000, 21000, 20000, 19000]));
  const rows = sj.rows;
  const map = new Map();
  rows.forEach((r, i) => map.set(r.loopDay, i));
  check('isHairlineOnly true for +215 window', isHairlineOnly(rows, map, 9) === true);
  const sj2 = mkSeed(baseWindow().concat([22000, 21000, 20000, 19000, 18000]));
  const rows2 = sj2.rows;
  const map2 = new Map();
  rows2.forEach((r, i) => map2.set(r.loopDay, i));
  check('isHairlineOnly false for pure fall', isHairlineOnly(rows2, map2, 9) === false);
}

console.log('test-dipslide3-b: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
