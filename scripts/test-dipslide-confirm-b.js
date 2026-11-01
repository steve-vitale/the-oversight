#!/usr/bin/env node
// test-dipslide-confirm-b.js — proof test for sim-dipslide-confirm-b (DIAG ONLY).
// Pure unit checks for the confirm bars (c)/(d) and verdict mapping, plus
// --live replay checks (determinism, seed-band identity, census validity,
// independent recomputation of confirmedDay) against the fresh confirm
// corpus. No game load, no RNG, no file writes.
// Usage: node scripts/test-dipslide-confirm-b.js [--live <corpus.jsonl>]
'use strict';
const { summarizeConfirm } = require('./analyze-dipslide-confirm-b.js');
const { analyzeSeed } = require('./analyze-dipslide-b.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('ok   ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function rowsFrom(pantries, engaged) {
  return pantries.map((p, i) => ({
    loopDay: i + 1, pantryKcal: p, freshDays: 5,
    gateEngaged: engaged ? engaged(i + 1) : true, hungryStreak: 0, alive: 12,
  }));
}
function seedFrom(pantries, opts) {
  const o = opts || {};
  const rows = rowsFrom(pantries, o.engaged);
  return { seed: o.seed || 1, arm: 'armed', endReason: o.endReason || 'survived',
    daysAlive: rows.length, maxWaveUnlocked: 1, waveKills: {}, rows, sayLines: [] };
}
// A pantry shape that confirms in its final run: candidate day 8 (20% fall
// + 3 falls), still below at day 13. Flat otherwise.
const CONFIRM_SHAPE = [100, 100, 100, 100, 100, 90, 80, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
// A flat shape that never candidates.
const FLAT_SHAPE = Array(30).fill(100);

// 1. Bar (c) boundary: 4 survived with run, 1 false -> 0.25 PASS.
{
  const seeds = [seedFrom(CONFIRM_SHAPE, { seed: 1 }), seedFrom(FLAT_SHAPE, { seed: 2 }),
    seedFrom(FLAT_SHAPE, { seed: 3 }), seedFrom(FLAT_SHAPE, { seed: 4 })];
  const s = summarizeConfirm(seeds);
  check('bar c: 1/4 = 0.25 PASSES', s.bars.c_falseRate.verdict === 'PASS' && s.bars.c_falseRate.rate === 0.25, s.bars.c_falseRate);
  check('bar d: no collapse UNJUDGED', s.bars.d_collapseEarliness.verdict === 'UNJUDGED');
  check('verdict: c PASS + d UNJUDGED = GO', s.verdict === 'GO', s.verdict);
}
// 2. Bar (c) fail: 2 false of 4 -> 0.50 FAIL, verdict NO-GO even with no collapse.
{
  const seeds = [seedFrom(CONFIRM_SHAPE, { seed: 1 }), seedFrom(CONFIRM_SHAPE, { seed: 2 }),
    seedFrom(FLAT_SHAPE, { seed: 3 }), seedFrom(FLAT_SHAPE, { seed: 4 })];
  const s = summarizeConfirm(seeds);
  check('bar c: 2/4 = 0.50 FAILS', s.bars.c_falseRate.verdict === 'FAIL', s.bars.c_falseRate);
  check('verdict: c FAIL = NO-GO', s.verdict === 'NO-GO', s.verdict);
}
// 3. No-run survived seed is neither false nor survivor: excluded from S.
{
  const seeds = [seedFrom(CONFIRM_SHAPE, { seed: 1 }), seedFrom(FLAT_SHAPE, { seed: 2 }),
    seedFrom(FLAT_SHAPE, { seed: 3, engaged: () => false })];
  const s = summarizeConfirm(seeds);
  check('no-run: survived no-run seed excluded from S', s.bars.c_falseRate.survivingWithRunCount === 2, s.bars.c_falseRate);
  check('no-run: named descriptively', JSON.stringify(s.descriptive.noRunSeeds) === '[3]', s.descriptive.noRunSeeds);
  check('no-run: 1/2 = 0.50 still FAILS (no-run does not dilute)', s.bars.c_falseRate.verdict === 'FAIL');
}
// 4. Census-invalid seed excluded from bars and named.
{
  const bad = seedFrom(FLAT_SHAPE, { seed: 9 });
  bad.daysAlive = 99;
  const seeds = [seedFrom(FLAT_SHAPE, { seed: 1 }), bad];
  const s = summarizeConfirm(seeds);
  check('invalid: excluded from S', s.bars.c_falseRate.survivingWithRunCount === 1, s.bars.c_falseRate);
  check('invalid: named', JSON.stringify(s.descriptive.censusInvalidSeeds) === '[9]');
}
// 5. Bar (d) PASS: collapsed seed with earliness >= 3.
//    Engaged days 1-17, disengaged from 18 (level stand-down 18); candidate
//    day 8 confirms day 13 -> earliness 5. Collapse = endReason village-lost.
{
  const engaged = (d) => d <= 17;
  const seeds = [seedFrom(CONFIRM_SHAPE, { seed: 1, engaged, endReason: 'village-lost' }),
    seedFrom(FLAT_SHAPE, { seed: 2 })];
  const a = analyzeSeed(seeds[0]);
  check('d setup: collapsed seed confirmedDay 13, levelSD 18, earliness 5',
    a.confirmedDay === 13 && a.levelStandDown === 18 && a.earliness === 5, a);
  const s = summarizeConfirm(seeds);
  check('bar d: earliness 5 PASSES', s.bars.d_collapseEarliness.verdict === 'PASS', s.bars.d_collapseEarliness);
  check('verdict: c PASS + d PASS = GO', s.verdict === 'GO', s.verdict);
}
// 6. Bar (d) FAIL: collapsed seed confirms too late (earliness 2).
//    Engaged 1-14, stand-down 15; candidate 8 confirms 13 -> earliness 2.
{
  const engaged = (d) => d <= 14;
  const seeds = [seedFrom(CONFIRM_SHAPE, { seed: 1, engaged, endReason: 'village-lost' }),
    seedFrom(FLAT_SHAPE, { seed: 2 })];
  const s = summarizeConfirm(seeds);
  check('bar d: earliness 2 FAILS', s.bars.d_collapseEarliness.verdict === 'FAIL', s.bars.d_collapseEarliness);
  check('verdict: c PASS + d FAIL = NO-GO', s.verdict === 'NO-GO', s.verdict);
}
// 7. Bar (d) with collapsed seed ending engaged: earliness undefined, cannot pass.
{
  const seeds = [seedFrom(CONFIRM_SHAPE, { seed: 1, endReason: 'village-lost' }),
    seedFrom(FLAT_SHAPE, { seed: 2 })];
  const s = summarizeConfirm(seeds);
  check('d undefined: ends engaged, earliness null, bar FAILS',
    s.bars.d_collapseEarliness.verdict === 'FAIL' &&
    s.bars.d_collapseEarliness.collapsedEarliness[0].earliness === null, s.bars.d_collapseEarliness);
}
// 8. Counted-anywhere is descriptive: a confirming candidate outside the
//    final run does not count toward bar (c).
{
  // Candidate day 8 confirms on engaged day 13, then the gate disengages
  // days 14-18 and resets; the final run (19-30, flat) has no candidate.
  const pantries = [100, 100, 100, 100, 100, 95, 90, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
  const engaged = (d) => !(d >= 14 && d <= 18);
  const seeds = [seedFrom(pantries, { seed: 1, engaged })];
  const s = summarizeConfirm(seeds);
  check('anywhere: final-run false 0 but anywhere false 1 (descriptive only)',
    s.bars.c_falseRate.falseCount === 0 && s.descriptive.countedAnywhereFalseCount === 1, s);
}

// --live: checks against the fresh confirm corpus.
const liveIdx = process.argv.indexOf('--live');
if (liveIdx >= 0) {
  const fs = require('fs');
  const path = process.argv[liveIdx + 1];
  const text = fs.readFileSync(path, 'utf8');
  const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const s1 = summarizeConfirm(seeds);
  const s2 = summarizeConfirm(seeds);
  check('live: 12 confirm seeds replayed', s1.seeds.length === 12, s1.seeds.length);
  check('live: seed band is exactly 51201-51212',
    JSON.stringify(s1.seeds.map((s) => s.seed).sort((a, b) => a - b)) ===
    JSON.stringify([51201, 51202, 51203, 51204, 51205, 51206, 51207, 51208, 51209, 51210, 51211, 51212]),
    s1.seeds.map((s) => s.seed));
  check('live: all seeds armed arm', s1.seeds.every((s) => s.arm === 'armed'));
  check('live: census valid on all seeds', s1.descriptive.censusValidAll === true, s1.descriptive.censusInvalidSeeds);
  check('live: replay deterministic (same corpus in, same verdict out)',
    JSON.stringify(s1) === JSON.stringify(s2));
  check('live: no seed reuses a prior judged band',
    s1.seeds.every((s) => s.seed < 51101 || s.seed > 51120));
  // Independent recomputation of confirmedDay for every confirm seed from
  // the raw pantry series, written as a plain loop (not via confirms()).
  let mismatch = null;
  for (const s of s1.seeds) {
    const series = s.pantrySeries;
    // Final engaged run from the series itself.
    let lastEng = -1;
    for (let i = series.length - 1; i >= 0; i--) if (series[i].gateEngaged === true) { lastEng = i; break; }
    let independent = null;
    if (lastEng >= 0) {
      let runStart = lastEng;
      while (runStart - 1 >= 0 && series[runStart - 1].gateEngaged === true) runStart--;
      for (let i = runStart; i <= lastEng && independent == null; i++) {
        const d = series[i];
        if (!d.gateEngaged || d.loopDay < 8 || i < 5) continue;
        const p = (j) => series[j].pantryKcal;
        if (typeof d.pantryKcal !== 'number' || typeof p(i - 5) !== 'number') continue;
        if (!(d.pantryKcal <= 0.80 * p(i - 5))) continue;
        if (!(p(i - 2) < p(i - 3) && p(i - 1) < p(i - 2) && d.pantryKcal < p(i - 1))) continue;
        const conf = series.find((r) => r.loopDay === d.loopDay + 5);
        if (conf && conf.gateEngaged && typeof conf.pantryKcal === 'number' && conf.pantryKcal < d.pantryKcal) {
          // Confirmation evening must lie inside the same final run.
          const ci = series.indexOf(conf);
          if (ci >= runStart && ci <= lastEng) independent = conf.loopDay;
        }
      }
    }
    if (independent !== s.confirmedDay) { mismatch = { seed: s.seed, independent, analyzer: s.confirmedDay }; break; }
  }
  check('live: independent recomputation matches analyzer confirmedDay on all seeds', mismatch === null, mismatch);
  console.log('live: barC=' + s1.bars.c_falseRate.verdict + ' rate=' + s1.bars.c_falseRate.rate +
    ' F=' + s1.bars.c_falseRate.falseCount + '/' + s1.bars.c_falseRate.survivingWithRunCount +
    ' falseSeeds=' + JSON.stringify(s1.bars.c_falseRate.falseSeeds) +
    ' barD=' + s1.bars.d_collapseEarliness.verdict +
    ' collapsed=' + JSON.stringify(s1.bars.d_collapseEarliness.collapsedSeeds) +
    ' verdict=' + s1.verdict +
    ' anywhereFalse=' + s1.descriptive.countedAnywhereFalseCount);
}

console.log('test-dipslide-confirm-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
