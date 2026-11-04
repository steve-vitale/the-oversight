// vetshape-analyze-20261104.js — VETSHAPE living-OR-DEAD counterfactual
// (arm sim-vetshape-b). Pure function over per-seed corpus rows; no game
// reads, no re-scoring. Killer fates come from vetprod-analyze's
// killerFates (single source of truth — vetshape must not diverge on
// death days/causes). Trajectories are computed from the kill log +
// fallen list, NOT from daily snapshot sampling, so fleeting
// same-day kill-and-die cases are handled exactly.
// Definitions (see sim-vetshape-b-prereg.md):
//   Living(d): firstKillDay <= d < deathDay (deathDay null = alive).
//   Shape(d):  cumulative killers ever, firstKillDay <= d.
//   Window_W(d): firstKillDay <= d AND (deathDay null OR d-deathDay < W),
//     W in {14,30,60}. Death day itself counts (0 < W).
// Counterfactual-ready day: a DAILY-SNAPSHOT day with Shape(day) >= 2
// AND gated >= 200 AND readiness5.short subset of {veterans}.
// Usage: node scripts/vetshape-analyze-20261104.js <per-seed-dir> <prefix>
//   prefix: 'vetshape-s' or 'vetprod-s'. Prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const VETPROD = require(path.join(__dirname, 'vetprod-analyze-20261104'));

const WINDOWS = [14, 30, 60];

function trajectories(fates, endDay) {
  // Returns per-day arrays over [firstKillDay..endDay]; empty when no killers.
  if (!fates.length) return { days: [], living: [], shape: [], windows: { 14: [], 30: [], 60: [] } };
  const start = Math.min.apply(null, fates.map(function (f) { return f.firstDay; }));
  const days = [], living = [], shape = [], wins = { 14: [], 30: [], 60: [] };
  for (let d = start; d <= endDay; d++) {
    days.push(d);
    living.push(fates.filter(function (f) { return f.firstDay <= d && (f.deathDay == null || d < f.deathDay); }).length);
    shape.push(fates.filter(function (f) { return f.firstDay <= d; }).length);
    WINDOWS.forEach(function (w) {
      wins[w].push(fates.filter(function (f) { return f.firstDay <= d && (f.deathDay == null || (d - f.deathDay) < w); }).length);
    });
  }
  return { days: days, living: living, shape: shape, windows: wins };
}

function countAtLeast(arr, n) {
  return arr.filter(function (v) { return v >= n; }).length;
}

function firstDayAtLeast(days, arr, n) {
  for (let i = 0; i < arr.length; i++) if (arr[i] >= n) return days[i];
  return null;
}

function peak(arr) { return arr.length ? Math.max.apply(null, arr) : 0; }

function analyzeSeed(row) {
  const fates = VETPROD.killerFates(row);
  const vet = VETPROD.maxSimultaneous(fates);
  const endDay = Math.max(row.gameDays || 0, row.days || 0,
    (row.daily && row.daily.length) ? row.daily[row.daily.length - 1].day : 0);
  const traj = trajectories(fates, endDay);
  const w4kills = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;

  // Counterfactual-ready days from daily snapshots.
  // V1 (gated): Shape(day) >= 2 AND gated >= 200 AND readiness5.short
  // subset of {veterans}. NOTE (found before judging, see evidence
  // metric review): V1 is circular — the engine caps gated standing at
  // 199 while the village is held, so gated >= 200 can never fire on a
  // held seed. V1 is kept for transparency and always reads 0 there.
  // V2 (raw, the real counterfactual): Shape(day) >= 2 AND raw >= 200
  // AND readiness5.short subset of {veterans} (every other readiness
  // leg already met, so counting dead killers is the ONLY change).
  const cfDays = [];
  const cfDaysRaw = [];
  (row.daily || []).forEach(function (s) {
    const short = (s.readiness5 && s.readiness5.short) || null;
    if (short == null) return;
    if (!short.every(function (leg) { return leg === 'veterans'; })) return;
    const shapeOnDay = fates.filter(function (f) { return f.firstDay <= s.day; }).length;
    if (shapeOnDay < 2) return;
    if (s.gated != null && s.gated >= 200) cfDays.push(s.day);
    if (s.raw != null && s.raw >= 200) cfDaysRaw.push(s.day);
  });

  // Died-before-second-banked: >= 2 killers ever, killer1 dead strictly
  // before killer2's first kill day.
  const sorted = fates.slice().sort(function (a, b) { return a.firstDay - b.firstDay; });
  let diedBeforeSecond = null;
  if (sorted.length >= 2) {
    diedBeforeSecond = (sorted[0].deathDay != null && sorted[0].deathDay < sorted[1].firstDay);
  }

  const intervals = fates.filter(function (f) { return f.killToDeathDays != null; })
    .map(function (f) { return f.killToDeathDays; }).sort(function (a, b) { return a - b; });
  const medianInterval = intervals.length
    ? ((intervals[Math.floor((intervals.length - 1) / 2)] + intervals[Math.ceil((intervals.length - 1) / 2)]) / 2) : null;
  const causes = {};
  fates.forEach(function (f) { if (f.deathCause) causes[f.deathCause] = (causes[f.deathCause] | 0) + 1; });

  const peakGated = (row.daily || []).reduce(function (m, s) {
    return (s.gated != null && s.gated > m) ? s.gated : m;
  }, -Infinity);
  const engineMaxVets = (row.daily || []).reduce(function (m, s) {
    const v = s.readiness5 ? (s.readiness5.veterans | 0) : 0;
    return v > m ? v : m;
  }, 0);

  return {
    seed: row.seed, days: row.days, endReason: row.endReason,
    w4kills: w4kills, killersEver: fates.length,
    killers: fates,
    livingReached2: peak(traj.living) >= 2,
    shapeReached2: peak(traj.shape) >= 2,
    peakLiving: peak(traj.living), peakShape: peak(traj.shape),
    firstDayLiving2: firstDayAtLeast(traj.days, traj.living, 2),
    firstDayShape2: firstDayAtLeast(traj.days, traj.shape, 2),
    daysAtLiving2: countAtLeast(traj.living, 2),
    daysAtShape2: countAtLeast(traj.shape, 2),
    peakWindow: { 14: peak(traj.windows[14]), 30: peak(traj.windows[30]), 60: peak(traj.windows[60]) },
    daysAtWindow2: { 14: countAtLeast(traj.windows[14], 2), 30: countAtLeast(traj.windows[30], 2), 60: countAtLeast(traj.windows[60], 2) },
    firstDayWindow2: { 14: firstDayAtLeast(traj.days, traj.windows[14], 2), 30: firstDayAtLeast(traj.days, traj.windows[30], 2), 60: firstDayAtLeast(traj.days, traj.windows[60], 2) },
    counterfactualReadyDays: cfDays,
    counterfactualReadyDaysRaw: cfDaysRaw,
    diedBeforeSecondBanked: diedBeforeSecond,
    killToDeathIntervals: intervals, medianKillToDeath: medianInterval,
    deathCauses: causes,
    reconstructedMaxLiving: vet.max, reconstructedMaxLivingDay: vet.maxDay,
    engineDailyMaxVets: engineMaxVets, peakGated: peakGated === -Infinity ? null : peakGated,
    instrumentErrors: (row.instrumentErrors || []).length,
  };
}

function analyzeDir(dir, prefix) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const shapeN = seeds.filter(function (s) { return s.shapeReached2; }).length;
  const livingN = seeds.filter(function (s) { return s.livingReached2; }).length;
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const verdict = (seeds.length === 8 && errSeeds <= 2 && totalErr === 0 && shapeN >= 5 && livingN <= 1)
    ? 'DIAG-GO' : (errSeeds > 2 ? 'INSUFFICIENT-DATA' : 'DIAG-NO-CANDIDATE');
  const allIntervals = [];
  seeds.forEach(function (s) { s.killToDeathIntervals.forEach(function (v) { allIntervals.push(v); }); });
  allIntervals.sort(function (a, b) { return a - b; });
  const medianAll = allIntervals.length
    ? ((allIntervals[Math.floor((allIntervals.length - 1) / 2)] + allIntervals[Math.ceil((allIntervals.length - 1) / 2)]) / 2) : null;
  const causeTotals = {};
  seeds.forEach(function (s) { Object.keys(s.deathCauses).forEach(function (c) { causeTotals[c] = (causeTotals[c] | 0) + s.deathCauses[c]; }); });
  return {
    verdict: verdict, n: seeds.length,
    shapeReached2: shapeN, livingReached2: livingN,
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    totalW4Kills: seeds.reduce(function (m, s) { return m + s.w4kills; }, 0),
    totalKillersEver: seeds.reduce(function (m, s) { return m + s.killersEver; }, 0),
    killersAliveAtEnd: seeds.reduce(function (m, s) { return m + s.killers.filter(function (f) { return f.aliveAtEnd; }).length; }, 0),
    medianKillToDeathAll: medianAll, killToDeathIntervalsAll: allIntervals,
    deathCausesAll: causeTotals,
    counterfactualReadySeeds: seeds.filter(function (s) { return s.counterfactualReadyDays.length > 0; }).map(function (s) { return s.seed; }),
    counterfactualReadySeedsRaw: seeds.filter(function (s) { return s.counterfactualReadyDaysRaw.length > 0; }).map(function (s) { return s.seed; }),
    seeds: seeds,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const prefix = process.argv[3] || 'vetshape-s';
  if (!dir) { console.error('usage: vetshape-analyze-20261104.js <per-seed-dir> [prefix]'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir, prefix), null, 2));
}

module.exports = { trajectories: trajectories, analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, WINDOWS: WINDOWS };
