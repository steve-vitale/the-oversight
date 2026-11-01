#!/usr/bin/env node
// test-dipslide-b.js — proof test for sim-dipslide-b (DIAG ONLY).
// Pure unit checks for the dip/slide sensor rule, plus --live replay
// checks (determinism + an independent recomputation of 51101's
// confirmed day from the raw pantry series) against the committed
// depositgate armed corpus. No game load, no RNG, no file writes.
// Usage: node scripts/test-dipslide-b.js [--live <corpus.jsonl>]
'use strict';
const { isCandidateDay, isEligibleCandidateDay, confirms, analyzeSeed, summarize } = require('./analyze-dipslide-b.js');

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

// 1. Candidate condition identical to trendsensor: 20% fall + 3 falls + engaged.
{
  const rows = rowsFrom([100, 100, 100, 100, 100, 90, 80, 70]);
  check('candidate: 20% fall + 3 falls + engaged at day 8', isCandidateDay(rows, 7) === true);
  check('eligible: day 8 passes early-window cutoff', isEligibleCandidateDay(rows, 7) === true);
}
// 2. Early-window exclusion: same shape at day 7 is a candidate but NOT eligible.
{
  const rows = rowsFrom([100, 100, 100, 100, 90, 80, 70]);
  check('candidate shape holds at day 7', isCandidateDay(rows, 6) === true);
  check('exclusion: day 7 candidate is NOT eligible', isEligibleCandidateDay(rows, 6) === false);
}
// 3. Slope fail: fall under 20% over 5 evenings is not a candidate.
{
  const rows = rowsFrom([100, 100, 100, 100, 100, 95, 90, 85]);
  check('slope fail: 85 > 0.80*100, not a candidate', isCandidateDay(rows, 7) === false);
}
// 4. Falls fail: a rise inside the last 3 evenings breaks the chain.
{
  const rows = rowsFrom([100, 100, 100, 100, 100, 90, 95, 70]);
  check('falls fail: rise on day 7 breaks the chain', isCandidateDay(rows, 7) === false);
}
// 5. Disengaged evening is never a candidate.
{
  const rows = rowsFrom([100, 100, 100, 100, 100, 90, 80, 70], () => false);
  check('disengaged: never a candidate', isCandidateDay(rows, 7) === false);
}
// 6. Null pantry breaks the chain.
{
  const rows = rowsFrom([100, 100, 100, 100, 100, 90, null, 70]);
  check('null pantry: breaks fall chain, not a candidate', isCandidateDay(rows, 7) === false);
}
// 7. Recovery confirmation cases (candidate at day 8, confirm evening day 13).
function confirmSetup(p13, engaged13) {
  const pantries = [100, 100, 100, 100, 100, 90, 80, 70, 65, 60, 55, 50, p13];
  const rows = rowsFrom(pantries, (d) => (d === 13 ? engaged13 !== false : true));
  const byDay = new Map(rows.map((r, i) => [r.loopDay, i]));
  return { rows, byDay };
}
{
  const { rows, byDay } = confirmSetup(60, true);
  check('confirm: P(13)=60 < P(8)=70 confirms', confirms(rows, byDay, 7, 0, 12) === true);
}
{
  const { rows, byDay } = confirmSetup(70, true);
  check('no confirm: P(13)=70 == P(8) is recovery, not a slide', confirms(rows, byDay, 7, 0, 12) === false);
}
{
  const { rows, byDay } = confirmSetup(90, true);
  check('no confirm: P(13)=90 > P(8) recovered', confirms(rows, byDay, 7, 0, 12) === false);
}
{
  const { rows, byDay } = confirmSetup(60, false);
  check('no confirm: confirmation evening disengaged', confirms(rows, byDay, 7, 0, 12) === false);
}
{
  const pantries = [100, 100, 100, 100, 100, 90, 80, 70, 65, 60, 55, 50, null];
  const rows = rowsFrom(pantries);
  const byDay = new Map(rows.map((r, i) => [r.loopDay, i]));
  check('no confirm: null pantry on confirmation evening', confirms(rows, byDay, 7, 0, 12) === false);
}
{
  // Confirmation evening beyond the lived window cannot confirm.
  const rows = rowsFrom([100, 100, 100, 100, 100, 90, 80, 70, 65, 60]);
  const byDay = new Map(rows.map((r, i) => [r.loopDay, i]));
  check('no confirm: D+5 beyond lived window', confirms(rows, byDay, 7, 0, 9) === false);
}
// 8. Scanning: a candidate that fails recovery does not end the scan;
//    the next confirming candidate wins (candidateDay 9, confirmedDay 14).
{
  const pantries = [100, 100, 100, 100, 100, 95, 90, 80, 75, 70, 65, 60, 85, 70, 65, 60, 55, 50, 45, 40];
  const a = analyzeSeed(seedFrom(pantries));
  check('scan: first failing candidate skipped, next confirms', a.candidateDay === 9 && a.confirmedDay === 14, a);
  check('scan: survived + confirmed in final run = false fire', a.falseFire === true);
}
// 9. Final-run-only counting: an early confirming candidate in a run that
//    later disengages and resets does NOT count (final run has no candidate).
{
  const pantries = [100, 100, 100, 100, 100, 95, 90, 80, 75, 70, 65, 60, 55, 50, 45, 100, 100, 100, 100, 100];
  const engaged = (d) => !(d >= 11 && d <= 15);
  const a = analyzeSeed(seedFrom(pantries, { engaged }));
  check('final-run-only: early candidate ignored after reset', a.confirmedDay === null && a.finalRun.startLoopDay === 16, a);
  check('final-run-only: not a false fire', a.falseFire === false);
}
// 10. No-run seed: gate never engaged.
{
  const a = analyzeSeed(seedFrom([100, 90, 80, 70, 60, 50, 40, 30], { engaged: () => false }));
  check('no-run: finalRun null, no confirmed day, not false', a.finalRun === null && a.confirmedDay === null && a.falseFire === false);
}
// 11. Census validity: rows != daysAlive fails validity.
{
  const s = seedFrom([100, 90, 80, 70, 60, 50, 40, 30]);
  s.daysAlive = 99;
  check('census validity: row count mismatch invalid', analyzeSeed(s).censusValid === false);
}

// --live: replay checks against the committed depositgate armed corpus.
const liveIdx = process.argv.indexOf('--live');
if (liveIdx >= 0) {
  const fs = require('fs');
  const path = process.argv[liveIdx + 1];
  const text = fs.readFileSync(path, 'utf8');
  const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const s1 = summarize(seeds);
  const s2 = summarize(seeds);
  check('live: 8 pilot seeds replayed', s1.seeds.length === 8, s1.seeds.length);
  check('live: census valid on all seeds', s1.censusValidAll === true);
  check('live: 7 surviving pilot seeds', s1.bars.b_falseCap.survivingCount === 7, s1.bars.b_falseCap);
  check('live: replay deterministic (same corpus in, same verdict out)',
    JSON.stringify(s1) === JSON.stringify(s2));
  // Independent recomputation of 51101's confirmed day from the raw series,
  // written as a plain loop here (not via confirms()), as a cross-check.
  const s51101 = s1.seeds.find((s) => s.seed === 51101);
  const series = s51101.pantrySeries;
  let independent = null;
  for (let i = 5; i < series.length; i++) {
    const d = series[i];
    if (!d.gateEngaged || d.loopDay < 8) continue;
    const p = (j) => series[j].pantryKcal;
    if (!(d.pantryKcal <= 0.80 * p(i - 5))) continue;
    if (!(p(i - 2) < p(i - 3) && p(i - 1) < p(i - 2) && d.pantryKcal < p(i - 1))) continue;
    const conf = series.find((r) => r.loopDay === d.loopDay + 5);
    if (conf && conf.gateEngaged && conf.pantryKcal < d.pantryKcal) { independent = conf.loopDay; break; }
  }
  check('live: independent recomputation matches analyzer confirmedDay for 51101',
    independent === s51101.confirmedDay, { independent, analyzer: s51101.confirmedDay });
  console.log('live: 51101 candidateDay=' + s51101.candidateDay + ' confirmedDay=' + s51101.confirmedDay +
    ' levelSD=' + s51101.levelStandDown + ' earliness=' + s51101.earliness);
  console.log('live: falseSeeds=' + JSON.stringify(s1.bars.b_falseCap.falseSeeds) +
    ' diagGo=' + s1.diagGo + ' barA=' + s1.bars.a_51101Earliness.pass + ' barB=' + s1.bars.b_falseCap.pass);
}

console.log('test-dipslide-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
