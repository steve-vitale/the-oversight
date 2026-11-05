// standaccum2-analyze-20261105.js — standing-accumulation part 2 analyzer
// (arm sim-standaccum2-b). Pure function over per-seed corpus rows; no
// game reads, no re-scoring. Killer fates come from vetprod-analyze's
// killerFates (single source of truth, reused not re-implemented).
//
// Per snapshot day d: L(d) = derived living wave-4+ killers (firstDay <= d
// and (deathDay null or d < deathDay)); R(d) = snapshot readiness5.ready;
// G(d) = snapshot gated. A RELEASE DAY is L(d) >= 2 AND G(d) >= 200 AND
// R(d) true. Closest seed ranking is fixed in the prereg: among seeds
// ever banking >= 2 killers, highest gated peak, tie-break most days
// with L(d) >= 2, then lowest seed; if none banks 2 ever, highest
// gated peak, tie-break lowest seed.
// Usage: node scripts/standaccum2-analyze-20261105.js <per-seed-dir>
//   Prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const VETPROD = require(path.join(__dirname, 'vetprod-analyze-20261104'));

function livingOnDay(fates, d) {
  return fates.filter(function (f) {
    return f.firstDay <= d && (f.deathDay == null || d < f.deathDay);
  }).length;
}

function analyzeSeed(row) {
  const fates = VETPROD.killerFates(row);
  const days = [];
  (row.daily || []).forEach(function (s) {
    const r5 = s.readiness5;
    const L = livingOnDay(fates, s.day);
    days.push({
      day: s.day, raw: s.raw, gated: s.gated,
      living: L,
      engineVets: r5 ? (r5.veterans | 0) : null,
      ready: r5 ? !!r5.ready : null,
      armored: r5 ? r5.armored : null, armed: r5 ? r5.armed : null,
      tricks: r5 ? r5.tricks : null, short: r5 ? (r5.short || null) : null,
      mismatch: r5 ? (L !== (r5.veterans | 0)) : false,
    });
  });
  const releaseDays = days.filter(function (d) {
    return d.living >= 2 && d.gated != null && d.gated >= 200 && d.ready === true;
  });
  const readyDays = days.filter(function (d) { return d.ready === true; }).map(function (d) { return d.day; });
  const living2Days = days.filter(function (d) { return d.living >= 2; }).map(function (d) { return d.day; });
  const gatedPeak = days.reduce(function (m, d) { return (d.gated != null && d.gated > m) ? d.gated : m; }, null);
  const rawPeak = days.reduce(function (m, d) { return (d.raw != null && d.raw > m) ? d.raw : m; }, null);
  const gatedPeakDay = days.filter(function (d) { return d.gated === gatedPeak; }).map(function (d) { return d.day; })[0];
  const mismatches = days.filter(function (d) { return d.mismatch; }).length;
  const w4fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; }).length;
  const w4kills = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const facedFeed = row.wavesFaced || {};
  const facedTypes = Object.keys(facedFeed).filter(function (mid) { return (facedFeed[mid] | 0) >= 4; }).length;
  const wave4met = ((row.unlockedWave | 0) >= 4) || ((row.maxWave | 0) >= 4) || w4fights > 0 || w4kills > 0;
  const intervals = fates.filter(function (f) { return f.killToDeathDays != null; })
    .map(function (f) { return f.killToDeathDays; }).sort(function (a, b) { return a - b; });
  // Binding-leg day counts on raw >= 200 days (derived short set).
  const bindingRaw200 = {};
  days.forEach(function (d) {
    if (d.raw == null || d.raw < 200 || d.short == null) return;
    const parts = [];
    // Derive from counts via the snapshot's own short list when present,
    // else from living count; the engine short list IS the binding leg
    // readout, so report it verbatim as the key.
    const key = (d.short.length ? d.short.join('+') : 'none');
    bindingRaw200[key] = (bindingRaw200[key] | 0) + 1;
  });
  const maxLiving = days.reduce(function (m, d) { return d.living > m ? d.living : m; }, 0);
  return {
    seed: row.seed, days: row.days, endReason: row.endReason,
    won: !!row.won, scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    wave4met: wave4met, w4fights: w4fights, w4kills: w4kills, w4facedTypes: facedTypes,
    killersEver: fates.length, killers: fates,
    killToDeathIntervals: intervals,
    maxLiving: maxLiving, living2Days: living2Days,
    gatedPeak: gatedPeak, gatedPeakDay: gatedPeakDay, rawPeak: rawPeak,
    releaseDays: releaseDays.map(function (d) { return d.day; }),
    releaseDayDetail: releaseDays.length ? releaseDays[0] : null,
    readyDays: readyDays,
    mismatchDays: mismatches, snapshotDays: days.length,
    bindingRaw200: bindingRaw200,
    instrumentErrors: (row.instrumentErrors || []).length,
    dayTable: days,
  };
}

function closestSeed(seeds) {
  const banked2 = seeds.filter(function (s) { return s.killersEver >= 2; });
  const pool = banked2.length ? banked2 : seeds;
  const sorted = pool.slice().sort(function (a, b) {
    if ((b.gatedPeak || 0) !== (a.gatedPeak || 0)) return (b.gatedPeak || 0) - (a.gatedPeak || 0);
    if (banked2.length && b.living2Days.length !== a.living2Days.length) return b.living2Days.length - a.living2Days.length;
    return a.seed - b.seed;
  });
  return sorted.length ? sorted[0].seed : null;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('standaccum2-s') === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const clean = seeds.filter(function (s) { return s.instrumentErrors === 0; });
  const released = clean.filter(function (s) { return s.releaseDays.length > 0; });
  const verdict = errSeeds > 2 ? 'INSUFFICIENT-DATA' :
    (released.length >= 1 ? 'DIAG-GO' : 'DIAG-NO');
  const allIntervals = [];
  seeds.forEach(function (s) { s.killToDeathIntervals.forEach(function (v) { allIntervals.push(v); }); });
  allIntervals.sort(function (a, b) { return a - b; });
  const medianAll = allIntervals.length
    ? ((allIntervals[Math.floor((allIntervals.length - 1) / 2)] + allIntervals[Math.ceil((allIntervals.length - 1) / 2)]) / 2) : null;
  const dayList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = dayList.length ? ((dayList[Math.floor((dayList.length - 1) / 2)] + dayList[Math.ceil((dayList.length - 1) / 2)]) / 2) : null;
  const wall = {
    wins: seeds.filter(function (s) { return s.won; }).length,
    national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: 0,
    wave4unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 4 || (s.maxWave | 0) >= 4; }).length,
    wave4faced: seeds.filter(function (s) { return s.w4fights > 0; }).length,
    wave4kills: seeds.reduce(function (m, s) { return m + s.w4kills; }, 0),
    wave5unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    wave5faced: 0, medianDays: medianDays,
  };
  return {
    verdict: verdict, n: seeds.length,
    releasedSeeds: released.map(function (s) { return s.seed; }),
    closestSeed: closestSeed(seeds),
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    medianKillToDeathAll: medianAll, killToDeathIntervalsAll: allIntervals,
    wall: wall, seeds: seeds,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: standaccum2-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { livingOnDay: livingOnDay, analyzeSeed: analyzeSeed, closestSeed: closestSeed, analyzeDir: analyzeDir };
