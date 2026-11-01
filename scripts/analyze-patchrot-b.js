#!/usr/bin/env node
// analyze-patchrot-b.js — patch-rotation before/after analyzer.
// Reads a driver .jsonl (one JSON object per seed, stdout of
// patchrot-b-driver.js) and prints one summary JSON object per seed
// plus a band summary to stdout. Reuses the haulsize analyzer for the
// per-seed decomposition (day rows, failed-trip classification,
// finished-pack definition) so both arms share identical definitions.
//
// PRIMARY (per prereg, judged as a pair):
//   failedTripDayShare = pooled failed-trip days / pooled loopDays
//     (failed = >= 1 forage attempt, 0 successes), GO needs armed
//     share <= baseline share - 0.10 (10 percentage points);
//   meanDailyHaul = band mean of seed mean-daily-hauls (mean over
//     loopDays of day-row edible + shelled kcal, multisweep
//     definition), GO needs armed >= baseline (not down).
// COST BARS: median survival (inst.daysAlive) armed >= 0.8x baseline;
//   starvation deaths armed <= baseline + 1.
// DIAGNOSTICS ONLY (never rescue a primary miss): pooled mean
// finished-pack value on successful-trip days with a final live
// return, unload total, FAILED_WORKED_OUT share, patchrot counters
// (stale attempts, penalized menus, visited tiles).
'use strict';
const fs = require('fs');
const haul = require('./analyze-haulsize-b');

function isStarvationDeath(d) {
  try { return /starv|starved|hunger/.test(JSON.stringify(d || '').toLowerCase()); } catch (e) { return false; }
}

function analyzeSeedPatch(inst) {
  const base = haul.analyzeSeed(inst);
  const liveByDay = new Map();
  for (const r of base.returns) liveByDay.set(r.loopDay, r);
  let finishedSum = 0, finishedN = 0;
  for (const d of base.dayRows) {
    if (d.successes <= 0) continue;
    const fin = liveByDay.get(d.loopDay);
    if (!fin) continue;
    finishedSum += fin.finished; finishedN++;
  }
  const totalDays = base.dayRows.length;
  const haulPerDay = totalDays
    ? base.dayRows.reduce((t, d) => t + (d.edibleKcal || 0) + (d.shelledKcal || 0), 0) / totalDays : 0;
  const failedDays = base.dayRows.filter((d) => d.attempts > 0 && d.successes === 0);
  const failedWorkedOut = failedDays.filter((d) => d.failedCategory === 'FAILED_WORKED_OUT').length;
  const deaths = inst.deaths || [];
  let staleAttempts = 0, forageAttempts = 0, penalizedMenus = 0, visitedTiles = 0;
  for (const day of (inst.days || [])) {
    const p = day.patchrot || {};
    staleAttempts += p.staleAttempts || 0; forageAttempts += p.forageAttempts || 0;
    penalizedMenus += p.penalizedMenus || 0; visitedTiles = Math.max(visitedTiles, p.visitedTiles || 0);
  }
  return Object.assign({}, base, {
    policy: inst.policy || null,
    totalDays,
    failedTripDayShare: totalDays ? failedDays.length / totalDays : null,
    meanDailyHaul: +haulPerDay.toFixed(1),
    finishedPooledMean: finishedN ? +(finishedSum / finishedN).toFixed(1) : null,
    finishedN,
    failedWorkedOutShare: failedDays.length ? failedWorkedOut / failedDays.length : null,
    starvationDeaths: deaths.filter(isStarvationDeath).length,
    survivalDays: inst.daysAlive,
    patchrot: { staleAttempts, forageAttempts, penalizedMenus, visitedTiles },
  });
}

function bandSummary(seedRows) {
  const totalDays = seedRows.reduce((t, s) => t + (s.totalDays || 0), 0);
  const failed = seedRows.reduce((t, s) => t + (s.failedTripDays || 0), 0);
  const surv = seedRows.map((s) => s.survivalDays || 0).sort((a, b) => a - b);
  return {
    seeds: seedRows.map((s) => s.seed),
    failedTripDays: failed, totalDays,
    failedTripDayShare: totalDays ? +(failed / totalDays).toFixed(3) : null,
    meanDailyHaul: seedRows.length ? +(seedRows.reduce((t, s) => t + (s.meanDailyHaul || 0), 0) / seedRows.length).toFixed(1) : null,
    finishedPooledMean: (() => { let sum = 0, n = 0; for (const s of seedRows) { sum += (s.finishedPooledMean || 0) * (s.finishedN || 0); n += s.finishedN || 0; } return n ? +(sum / n).toFixed(1) : null; })(),
    medianSurvival: surv.length ? surv[Math.floor(surv.length / 2)] : null,
    starvationDeaths: seedRows.reduce((t, s) => t + (s.starvationDeaths || 0), 0),
    unloadTotal: seedRows.reduce((t, s) => t + (s.unloadTotal || 0), 0),
    tripDays: seedRows.reduce((t, s) => t + (s.tripDays || 0), 0),
    maxWave: Math.max(0, ...seedRows.map((s) => s.maxWaveUnlocked || 0)),
    collapses: seedRows.filter((s) => /village-lost|village-dead|collapse/i.test(String(s.endReason || ''))).length,
    patchrot: {
      staleAttempts: seedRows.reduce((t, s) => t + (s.patchrot.staleAttempts || 0), 0),
      forageAttempts: seedRows.reduce((t, s) => t + (s.patchrot.forageAttempts || 0), 0),
      penalizedMenus: seedRows.reduce((t, s) => t + (s.patchrot.penalizedMenus || 0), 0),
      visitedTiles: seedRows.reduce((t, s) => t + (s.patchrot.visitedTiles || 0), 0),
    },
  };
}

function compareBands(baseline, armed) {
  const shareDelta = (baseline.failedTripDayShare != null && armed.failedTripDayShare != null)
    ? +(armed.failedTripDayShare - baseline.failedTripDayShare).toFixed(3) : null;
  const haulDelta = (baseline.meanDailyHaul != null && armed.meanDailyHaul != null)
    ? +(armed.meanDailyHaul - baseline.meanDailyHaul).toFixed(1) : null;
  const go = shareDelta != null && shareDelta <= -0.10
    && haulDelta != null && haulDelta >= 0
    && (armed.starvationDeaths <= baseline.starvationDeaths + 1)
    && (baseline.medianSurvival ? armed.medianSurvival >= 0.8 * baseline.medianSurvival : true);
  return { shareDelta, shareBar: -0.10, haulDelta, haulBar: 0,
    costStarvationDelta: armed.starvationDeaths - baseline.starvationDeaths,
    costMedianSurvivalRatio: (baseline.medianSurvival && baseline.medianSurvival > 0)
      ? +(armed.medianSurvival / baseline.medianSurvival).toFixed(3) : null,
    go };
}

async function main() {
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const compare = process.argv.includes('--compare');
  if (!files.length) { console.error('usage: analyze-patchrot-b.js <jsonl> [--compare <jsonl2>]'); process.exit(2); }
  const load = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const bands = files.map((f) => {
    const rows = load(f).map(analyzeSeedPatch);
    return { file: f, policy: rows[0] ? rows[0].policy : null, seeds: rows, band: bandSummary(rows) };
  });
  const out = { bands };
  if (compare && bands.length >= 2) out.comparison = compareBands(bands[0].band, bands[1].band);
  for (const b of bands) {
    console.error('patchrot policy=' + b.policy + ' seeds=' + b.band.seeds.join(',') +
      ' failedShare=' + b.band.failedTripDayShare + ' meanDailyHaul=' + b.band.meanDailyHaul +
      ' finished=' + b.band.finishedPooledMean + ' medianSurv=' + b.band.medianSurvival +
      ' starvDeaths=' + b.band.starvationDeaths + ' unload=' + b.band.unloadTotal);
  }
  if (out.comparison) console.error('patchrot COMPARE shareDelta=' + out.comparison.shareDelta +
    ' haulDelta=' + out.comparison.haulDelta + ' GO=' + out.comparison.go);
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

if (require.main === module) main().catch((e) => { console.error('PATCHROT ANALYZE CRASH', e && (e.stack || e)); process.exit(2); });
module.exports = { analyzeSeedPatch, bandSummary, compareBands, isStarvationDeath };
