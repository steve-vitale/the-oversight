#!/usr/bin/env node
// test-governverdict-b.js — proof for scripts/govern-verdict.js
// (sim-governverdict-b, 2026-10-24, oversight-flesh-out-loop-b).
//
// Proves every pre-registered calibration case in
// evidence/2026-10-24/sim-governverdict-b.md (C1-C12) plus the
// tie-breaks, degenerate exclusions, and CLI contract. All synthetic
// corpora use days=100, so rot100d numerically equals the rot value
// (rot100d = rot / 100 * 100) — the tool still computes it from
// raw rot/days, so the math path is the real one.
//
// This test READS the leg2decide-b corpus for C1 calibration only.
// It never writes into the repo: CLI temp files go to os.tmpdir().
// Exit 0 iff every check passes; any failure prints FAIL lines and
// exits 1. Usage: node scripts/test-governverdict-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');
const { governVerdict, median, classifyStep } = require('./govern-verdict');

let pass = 0;
let fail = 0;
function check(name, cond, extra = '') {
  if (cond) {
    pass += 1;
  } else {
    fail += 1;
    console.log(`FAIL: ${name} ${extra}`);
  }
}
function approx(a, b, tol = 0.0015) {
  return a !== null && Math.abs(a - b) <= tol;
}

// One record from desired rot100d values (days=100 => rot == rot100d).
function rec(seed, pp0, pp1, cp0, cp1) {
  const cell = (v) => ({ rot: v, days: 100 });
  return {
    seed,
    parent: { pd0: cell(pp0), pd1: cell(pp1) },
    commit: { pd0: cell(cp0), pd1: cell(cp1) },
  };
}
// Ratio-driven record: pd0 rot100d fixed at 100, pd1 = 100 * ratio.
function rrec(seed, parentRatio, commitRatio) {
  return rec(seed, 100, 100 * parentRatio, 100, 100 * commitRatio);
}
function uniformRecs(n, parentRatios, scale) {
  return parentRatios.map((r, i) => rrec(1000 + i, r, r * scale));
}

// --- Unit: median + bands (tie-breaks) ---
check('median numeric sort (not string sort)', median([14.96, 2.977, 0.02]) === 2.977);
check('median even-n mean of middle pair', median([1, 2]) === 1.5);
check('median empty -> null', median([]) === null);
check('band STEP strict below 0.80', classifyStep(0.799) === 'STEP');
check('band 0.80 is INCONCLUSIVE (STEP is strict)', classifyStep(0.80) === 'INCONCLUSIVE');
check('band 0.899 is INCONCLUSIVE', classifyStep(0.899) === 'INCONCLUSIVE');
check('band 0.90 is NO-STEP', classifyStep(0.90) === 'NO-STEP');
check('band null is UNDEFINED', classifyStep(null) === 'UNDEFINED');

// --- C2 clean STEP (broad shift, every seed halves) ---
{
  const ratios = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 0.4, 3.0];
  const v = governVerdict(uniformRecs(8, ratios, 0.5));
  check('C2 verdict STEP', v.verdict === 'STEP', `got ${v.verdict}`);
  check('C2 governing step 0.5', approx(v.governingStep, 0.5));
  check('C2 aggregate step 0.5', approx(v.diagnostics.aggregateStep, 0.5));
  check('C2 rom step 0.5', approx(v.diagnostics.ratioOfMediansStep, 0.5));
  check('C2 median-per-seed step 0.5', approx(v.diagnostics.medianPerSeedStep, 0.5));
  check('C2 uncontested', v.contested === false);
}

// --- C3 clean NO-STEP (no shift) ---
{
  const ratios = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 0.4, 3.0];
  const v = governVerdict(uniformRecs(8, ratios, 1.0));
  check('C3 verdict NO-STEP', v.verdict === 'NO-STEP', `got ${v.verdict}`);
  check('C3 all steps 1.0',
    approx(v.governingStep, 1.0) && approx(v.diagnostics.aggregateStep, 1.0)
    && approx(v.diagnostics.ratioOfMediansStep, 1.0)
    && approx(v.diagnostics.medianPerSeedStep, 1.0));
}

// --- C4 clean INCONCLUSIVE (uniform 0.85x) ---
{
  const ratios = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 0.4, 3.0];
  const v = governVerdict(uniformRecs(8, ratios, 0.85));
  check('C4 verdict INCONCLUSIVE', v.verdict === 'INCONCLUSIVE', `got ${v.verdict}`);
  check('C4 all steps 0.85',
    approx(v.governingStep, 0.85) && approx(v.diagnostics.aggregateStep, 0.85)
    && approx(v.diagnostics.ratioOfMediansStep, 0.85)
    && approx(v.diagnostics.medianPerSeedStep, 0.85));
}

// --- C5 single-seed-dominated: aggregate STEP, governing NO-STEP ---
{
  const records = [];
  for (let i = 0; i < 7; i++) records.push(rrec(2000 + i, 1.0, 1.0));
  // One huge-rot seed falls, but the typical seed does not move.
  records.push(rec(2007, 100, 10000, 100, 1000));
  const v = governVerdict(records);
  check('C5 verdict NO-STEP (CONTESTED)', v.verdict === 'NO-STEP (CONTESTED)', `got ${v.verdict}`);
  check('C5 governing 1.0', approx(v.governingStep, 1.0));
  check('C5 aggregate STEP (dominated)', v.diagnostics.aggregateClass === 'STEP',
    `got ${v.diagnostics.aggregateStep}`);
}

// --- C6 identical-seed saturation (leg2decide shape, synthetic) ---
{
  const records = [];
  // 9 identical extreme seeds (ratios far from the median).
  const extremes = [0.01, 0.02, 0.03, 0.04, 0.05, 20, 30, 40, 50];
  extremes.forEach((r, i) => records.push(rrec(3000 + i, r, r)));
  // 7 moved middle seeds (parent ratios near the median, commit x0.1).
  const middles = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1];
  middles.forEach((r, i) => records.push(rrec(3010 + i, r, r * 0.1)));
  const v = governVerdict(records);
  check('C6 verdict STEP (CONTESTED)', v.verdict === 'STEP (CONTESTED)', `got ${v.verdict}`);
  check('C6 governing 0.1', approx(v.governingStep, 0.1));
  check('C6 median-per-seed step 1.0 (saturated)', approx(v.diagnostics.medianPerSeedStep, 1.0));
  check('C6 median-per-seed class NO-STEP', v.diagnostics.medianPerSeedClass === 'NO-STEP');
  check('C6 identical count 9', v.counts.identicalRatioSeeds === 9, `got ${v.counts.identicalRatioSeeds}`);
}

// --- C7 contested NO-STEP (mirror: governing flat, steps move) ---
{
  const records = [];
  // Low seeds move down hard, high seeds move down but stay above the
  // median, middle seeds identical: ratio medians flat, step median down.
  const parent = [0.1, 0.2, 0.3, 0.8, 1.0, 3.0, 4.0, 5.0];
  const commit = [0.01, 0.02, 0.03, 0.8, 1.0, 1.5, 2.0, 2.5];
  parent.forEach((r, i) => records.push(rrec(4000 + i, r, commit[i])));
  const v = governVerdict(records);
  check('C7 verdict NO-STEP (CONTESTED)', v.verdict === 'NO-STEP (CONTESTED)', `got ${v.verdict}`);
  check('C7 governing 1.0', approx(v.governingStep, 1.0));
  check('C7 median-per-seed step STEP', v.diagnostics.medianPerSeedClass === 'STEP',
    `got ${v.diagnostics.medianPerSeedStep}`);
}

// --- C8 degenerate-zero: every pd0 rot is 0 ---
{
  const records = [];
  for (let i = 0; i < 4; i++) records.push(rec(5000 + i, 0, 100, 0, 100));
  const v = governVerdict(records);
  check('C8 verdict INSUFFICIENT-DATA', v.verdict === 'INSUFFICIENT-DATA', `got ${v.verdict}`);
  check('C8 uncontested', v.contested === false);
  check('C8 zero-denominator exclusions counted', v.counts.excludedZeroDenominator === 8,
    `got ${v.counts.excludedZeroDenominator}`);
}

// --- C9 mixed degenerate: 2 both-zero seeds + 6 clean STEP seeds ---
{
  const records = [];
  records.push(rec(6000, 100, 0, 100, 0));
  records.push(rec(6001, 100, 0, 100, 0));
  [0.5, 0.8, 1.0, 1.2, 1.5, 2.0].forEach((r, i) => records.push(rrec(6010 + i, r, r * 0.5)));
  const v = governVerdict(records);
  check('C9 verdict STEP', v.verdict === 'STEP', `got ${v.verdict}`);
  check('C9 governing 0.5', approx(v.governingStep, 0.5));
  check('C9 degenerate count 2', v.counts.degeneratePerSeedSteps === 2,
    `got ${v.counts.degeneratePerSeedSteps}`);
}

// --- C10 boundary 0.80 -> INCONCLUSIVE; C11 boundary 0.90 -> NO-STEP ---
// NOTE: boundary corpora use identical parent ratios (1.0) on purpose.
// With spread ratios, the even-n median average rounds a hair below the
// boundary float (0.7999...), which is a test-data artifact, not a tool
// bug: the tool bands full-precision floats, and the float nearest 0.80
// IS >= the 0.80 literal. Identical ratios keep every summary on the
// exact boundary float, so the test proves the band edges themselves.
{
  const ratios = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
  const v80 = governVerdict(uniformRecs(8, ratios, 0.80));
  check('C10 verdict INCONCLUSIVE at exactly 0.80', v80.verdict === 'INCONCLUSIVE', `got ${v80.verdict}`);
  const v90 = governVerdict(uniformRecs(8, ratios, 0.90));
  check('C11 verdict NO-STEP at exactly 0.90', v90.verdict === 'NO-STEP', `got ${v90.verdict}`);
}

// --- C12 undefined diagnostic never contests ---
{
  const records = [];
  // 5 seeds with parent pd0 = 0 (ratios excluded; parent rom median 0
  // -> rom step UNDEFINED), 3 seeds with clean 0.5x ratios.
  for (let i = 0; i < 5; i++) records.push(rec(7000 + i, 0, 100, 100, 50));
  for (let i = 0; i < 3; i++) records.push(rrec(7010 + i, 1.0, 0.5));
  const v = governVerdict(records);
  check('C12 verdict STEP uncontested', v.verdict === 'STEP', `got ${v.verdict}`);
  check('C12 rom step UNDEFINED', v.diagnostics.ratioOfMediansStep === null
    && v.diagnostics.ratioOfMediansClass === 'UNDEFINED');
  check('C12 governing 0.5', approx(v.governingStep, 0.5));
}

// --- Empty corpus -> INSUFFICIENT-DATA (a verdict, not a crash) ---
{
  const v = governVerdict([]);
  check('empty corpus INSUFFICIENT-DATA', v.verdict === 'INSUFFICIENT-DATA');
}

// --- C1 leg2decide-published shape, from the real corpus files ---
// CALIBRATION ONLY: this checks the tool reproduces the published
// summaries and labels them per the hierarchy. It does NOT re-judge
// the leg2decide corpus or change its deciding verdict.
{
  const corpusDir = path.join(__dirname, '..', 'evidence', '2026-10-24', 'leg2decide-b-corpus');
  const byKey = new Map(); // `${anchor8}|${side}|${seed}` -> {rot, days}
  let files = 0;
  if (fs.existsSync(corpusDir)) {
    for (const name of fs.readdirSync(corpusDir)) {
      if (!name.endsWith('.json')) continue;
      const d = JSON.parse(fs.readFileSync(path.join(corpusDir, name), 'utf8'));
      if (d.rotFreshKcal === undefined) continue; // sweep summary, not a per-seed file
      const m = name.match(/leg2drift-b-([0-9a-f]{8})-(pd[01])-dg1-leadfeast-s(\d+)\.json/);
      if (!m) continue;
      byKey.set(`${m[1]}|${m[2]}|${m[3]}`, {
        rot: d.rotFreshKcal + d.rotPreservedKcal, days: d.daysAlive,
      });
      files += 1;
    }
  }
  check('C1 corpus files present (64 per-seed)', files === 64, `got ${files}`);
  if (files === 64) {
    const records = [];
    for (let s = 9266; s <= 9281; s++) {
      const cell = (a, side) => byKey.get(`${a}|${side}|${s}`);
      records.push({
        seed: s,
        parent: { pd0: cell('1f24a4ef', 'pd0'), pd1: cell('1f24a4ef', 'pd1') },
        commit: { pd0: cell('75fdd925', 'pd0'), pd1: cell('75fdd925', 'pd1') },
      });
    }
    const v = governVerdict(records);
    check('C1 median parent 0.487', approx(v.medianParent, 0.487), `got ${v.medianParent}`);
    check('C1 median commit 0.196', approx(v.medianCommit, 0.196), `got ${v.medianCommit}`);
    check('C1 governing step 0.404', approx(v.governingStep, 0.404), `got ${v.governingStep}`);
    check('C1 aggregate step 0.817', approx(v.diagnostics.aggregateStep, 0.817),
      `got ${v.diagnostics.aggregateStep}`);
    check('C1 rom step 0.876', approx(v.diagnostics.ratioOfMediansStep, 0.876),
      `got ${v.diagnostics.ratioOfMediansStep}`);
    check('C1 median-per-seed step 1.000', approx(v.diagnostics.medianPerSeedStep, 1.0),
      `got ${v.diagnostics.medianPerSeedStep}`);
    check('C1 verdict STEP (CONTESTED)', v.verdict === 'STEP (CONTESTED)', `got ${v.verdict}`);
    check('C1 degenerate count 1 (seed 9268)', v.counts.degeneratePerSeedSteps === 1,
      `got ${v.counts.degeneratePerSeedSteps}`);
    check('C1 identical count 9', v.counts.identicalRatioSeeds === 9,
      `got ${v.counts.identicalRatioSeeds}`);
    check('C1 zero exclusions', v.counts.excludedZeroDenominator === 0);
  }
}

// --- CLI contract (fresh processes, temp files outside the repo) ---
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'governverdict-test-'));
  const goodFile = path.join(dir, 'good.json');
  fs.writeFileSync(goodFile, JSON.stringify(uniformRecs(8,
    [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 0.4, 3.0], 0.5)));
  const out = spawnSync(process.execPath,
    [path.join(__dirname, 'govern-verdict.js'), '--input', goodFile],
    { encoding: 'utf8' });
  let parsed = null;
  try { parsed = JSON.parse(out.stdout); } catch (e) { /* fall through */ }
  check('CLI valid input exit 0 + verdict STEP', out.status === 0 && parsed && parsed.verdict === 'STEP',
    `status ${out.status} stdout ${String(out.stdout).slice(0, 120)}`);
  const badFile = path.join(dir, 'bad.json');
  fs.writeFileSync(badFile, '{not json');
  const bad = spawnSync(process.execPath,
    [path.join(__dirname, 'govern-verdict.js'), '--input', badFile],
    { encoding: 'utf8' });
  check('CLI malformed input FATAL exit 2', bad.status === 2, `status ${bad.status}`);
  const noarg = spawnSync(process.execPath,
    [path.join(__dirname, 'govern-verdict.js')], { encoding: 'utf8' });
  check('CLI missing --input FATAL exit 2', noarg.status === 2, `status ${noarg.status}`);
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log(`test-governverdict-b: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) process.exit(1);
