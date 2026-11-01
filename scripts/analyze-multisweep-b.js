#!/usr/bin/env node
// analyze-multisweep-b.js — multi-sweep before/after analyzer.
// Reads a driver .jsonl (one JSON object per seed, stdout of
// multisweep-b-driver.js) and prints one summary JSON object per seed
// plus a band summary to stdout. Reuses the haulsize analyzer for the
// per-seed decomposition (returns, day rows, attribution) so the
// finished-pack definition is identical on both arms (packcomp:
// finished = kcalEach > 0 AND foodState NOT in_shell/unprocessed;
// lump value at data calories, nut components shelled at 0.75).
//
// PRIMARY (per prereg): for each successful-trip day (day with >= 1
// successful forage), take the day's FINAL live return (the last
// returnToVillage with overAtEntry false and loopDay == that day)
// and read its finished kcal. A successful-trip day with NO live
// return that day (ended away) is EXCLUDED from the primary and
// counted separately (noReturnTripDays). The band primary is the
// POOLED mean over all such days in the band; the mean-of-seed-means
// is reported as a sensitivity only, never judged.
//
// Secondaries (diagnostic only, never overturning): POLICY_ONE_TRIP
// share = successful days with exactly 1 success / all successful
// days; multi-sweep day share = successful days with >= 2 successes;
// unload total; mean daily haul = mean over loopDays of
// (edibleKcal + shelledKcal) from the day rows; FAILED_WORKED_OUT day
// share; starvation deaths (see isStarvationDeath); median survival.
'use strict';
const fs = require('fs');
const haul = require('./analyze-haulsize-b');

function isStarvationDeath(d) {
  // runDays samples.deaths entries: shape verified on the control run
  // (see prereg amendment if any). Match conservatively on any string
  // field mentioning starvation/hunger.
  try {
    const s = JSON.stringify(d || '').toLowerCase();
    return /starv|starved|hunger/.test(s);
  } catch (e) { return false; }
}

function analyzeSeedMulti(inst) {
  const base = haul.analyzeSeed(inst);
  const liveByDay = new Map();
  for (const r of base.returns) {
    // base.returns are in homecoming order; keep the LAST per loopDay.
    liveByDay.set(r.loopDay, r);
  }
  let finishedSum = 0, finishedN = 0, noReturn = 0, oneTrip = 0, multiDays = 0;
  let extraTripDays = 0, extraSuccessDays = 0;
  const tripDayRows = [];
  for (const d of base.dayRows) {
    if (d.successes <= 0) continue;
    // Shares count ALL successful-trip days (return or not); the
    // primary counts only days with a final live return.
    if (d.successes === 1) oneTrip++;
    else multiDays++;
    // Driver per-day multisweep deltas live on inst.days (raw), keyed
    // by loopDay; base.dayRows do not carry them, so read them here.
    // Counted for every successful-trip day, return or not.
    const raw = (inst.days || []).find((x) => x.loopDay === d.loopDay);
    if (raw && raw.multisweep && raw.multisweep.extraTrips > 0) extraTripDays++;
    if (raw && raw.multisweep && raw.multisweep.extraSuccesses > 0) extraSuccessDays++;
    const fin = liveByDay.get(d.loopDay);
    if (!fin) { noReturn++; continue; }
    finishedSum += fin.finished;
    finishedN++;
    tripDayRows.push({ loopDay: d.loopDay, successes: d.successes, finalFinished: fin.finished,
      finalCombined: fin.combined, unload: fin.unload });
  }
  const tripDays = base.tripDays;
  const failedDays = base.dayRows.filter((d) => d.attempts > 0 && d.successes === 0);
  const failedWorkedOut = failedDays.filter((d) => d.failedCategory === 'FAILED_WORKED_OUT').length;
  const haulPerDay = base.dayRows.length
    ? base.dayRows.reduce((t, d) => t + (d.edibleKcal || 0) + (d.shelledKcal || 0), 0) / base.dayRows.length : 0;
  const deaths = inst.deaths || [];
  const starvationDeaths = deaths.filter(isStarvationDeath).length;
  return Object.assign({}, base, {
    policy: inst.policy || null,
    primaryMeanFinished: finishedN ? finishedSum / finishedN : null,
    primaryN: finishedN, primarySum: finishedSum, noReturnTripDays: noReturn,
    tripDayRows, oneTripDays: oneTrip, multiSweepDays: multiDays,
    oneTripShare: tripDays ? oneTrip / tripDays : null,
    multiSweepShare: tripDays ? multiDays / tripDays : null,
    extraTripDays, extraSuccessDays,
    failedWorkedOutShare: failedDays.length ? failedWorkedOut / failedDays.length : null,
    meanDailyHaul: +haulPerDay.toFixed(1),
    starvationDeaths, deathsRaw: deaths,
    survivalDays: inst.daysAlive,
  });
}

function bandSummary(seedRows) {
  let sum = 0, n = 0;
  for (const s of seedRows) { sum += s.primarySum || 0; n += s.primaryN || 0; }
  const seedMeans = seedRows.filter((s) => s.primaryMeanFinished != null).map((s) => s.primaryMeanFinished);
  const surv = seedRows.map((s) => s.survivalDays || 0).sort((a, b) => a - b);
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  const tripDays = seedRows.reduce((t, s) => t + (s.tripDays || 0), 0);
  const oneTrip = seedRows.reduce((t, s) => t + (s.oneTripDays || 0), 0);
  const multi = seedRows.reduce((t, s) => t + (s.multiSweepDays || 0), 0);
  const failed = seedRows.reduce((t, s) => t + (s.failedTripDays || 0), 0);
  return {
    seeds: seedRows.map((s) => s.seed),
    primaryPooledMeanFinished: n ? +(sum / n).toFixed(1) : null, primaryN: n,
    primaryMeanOfSeedMeans: seedMeans.length ? +(seedMeans.reduce((a, b) => a + b, 0) / seedMeans.length).toFixed(1) : null,
    medianSurvival: median, maxWave: Math.max(0, ...seedRows.map((s) => s.maxWaveUnlocked || 0)),
    collapses: seedRows.filter((s) => /village-lost|village-dead|collapse/i.test(String(s.endReason || ''))).length,
    starvationDeaths: seedRows.reduce((t, s) => t + (s.starvationDeaths || 0), 0),
    unloadTotal: seedRows.reduce((t, s) => t + (s.unloadTotal || 0), 0),
    tripDays, oneTripShare: tripDays ? +(oneTrip / tripDays).toFixed(3) : null,
    multiSweepShare: tripDays ? +(multi / tripDays).toFixed(3) : null,
    meanDailyHaul: seedRows.length ? +(seedRows.reduce((t, s) => t + (s.meanDailyHaul || 0), 0) / seedRows.length).toFixed(1) : null,
    failedTripDays: failed,
  };
}

function compareBands(baseline, armed) {
  const ratio = (baseline.primaryPooledMeanFinished && baseline.primaryPooledMeanFinished > 0)
    ? armed.primaryPooledMeanFinished / baseline.primaryPooledMeanFinished : null;
  return {
    baselinePrimary: baseline.primaryPooledMeanFinished, armedPrimary: armed.primaryPooledMeanFinished,
    ratio: ratio == null ? null : +ratio.toFixed(3),
    ratioBar: 1.25,
    costStarvationDelta: armed.starvationDeaths - baseline.starvationDeaths,
    costStarvationBar: 1,
    costMedianSurvivalRatio: (baseline.medianSurvival && baseline.medianSurvival > 0)
      ? +(armed.medianSurvival / baseline.medianSurvival).toFixed(3) : null,
    costMedianSurvivalBar: 0.8,
    go: ratio != null && ratio >= 1.25
      && (armed.starvationDeaths <= baseline.starvationDeaths + 1)
      && (baseline.medianSurvival ? armed.medianSurvival >= 0.8 * baseline.medianSurvival : true),
  };
}

async function main() {
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const compare = process.argv.includes('--compare');
  if (!files.length) { console.error('usage: analyze-multisweep-b.js <jsonl> [--compare <jsonl2>]'); process.exit(2); }
  const load = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const bands = files.map((f) => {
    const rows = load(f).map(analyzeSeedMulti);
    return { file: f, policy: rows[0] ? rows[0].policy : null, seeds: rows, band: bandSummary(rows) };
  });
  const out = { bands };
  if (compare && bands.length >= 2) out.comparison = compareBands(bands[0].band, bands[1].band);
  for (const b of bands) {
    console.error('multisweep policy=' + b.policy + ' seeds=' + b.band.seeds.join(',') +
      ' primary=' + b.band.primaryPooledMeanFinished + ' n=' + b.band.primaryN +
      ' oneTripShare=' + b.band.oneTripShare + ' multiShare=' + b.band.multiSweepShare +
      ' medianSurv=' + b.band.medianSurvival + ' starvDeaths=' + b.band.starvationDeaths +
      ' unload=' + b.band.unloadTotal + ' meanDailyHaul=' + b.band.meanDailyHaul);
  }
  if (out.comparison) console.error('multisweep COMPARE ratio=' + out.comparison.ratio + ' GO=' + out.comparison.go);
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

if (require.main === module) main().catch((e) => { console.error('MULTISWEEP ANALYZE CRASH', e && (e.stack || e)); process.exit(2); });
module.exports = { analyzeSeedMulti, bandSummary, compareBands, isStarvationDeath };
