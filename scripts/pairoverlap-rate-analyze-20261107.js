// pairoverlap-rate-analyze-20261107.js — rate-instrument analysis
// for arm sim-pairoverlap-rate-b. Reuses loadCorpus/guardRows from
// scripts/pairoverlap-analyze-20261107.js (the frozen pairoverlap
// instrument) and adds the arm's ONLY change: the starvation cost
// bar is a RATE — starvation deaths per 100 village-days — instead
// of the absolute count. Village-days = sum over seeds of days
// lived (driver `days`). The absolute count is reported per seed
// as a secondary and is NOT a bar in this arm.
// Usage: node scripts/pairoverlap-rate-analyze-20261107.js <baseline-dir> <armed-dir> [--pair-bar N] [--rate-tol T] [--out <file>]
//   --pair-bar N: the amendment's exact pair-days GO number
//   (default 35). --rate-tol T: the amendment's exact starvation-
//   rate tolerance in deaths per 100 village-days (default 0.15,
//   the prereg's floor — the amendment overrides it with
//   max(0.15, 0.5 x pilot-baseline rate) once measured).
'use strict';
const fs = require('fs');
const path = require('path');
const ANALYZE = require(path.join(__dirname, 'pairoverlap-analyze-20261107'));

// starveRate(deaths, days): deaths per 100 village-days. Zero
// days lived (an empty corpus) is not a zero rate — it is unknown.
function starveRate(deaths, days) {
  if (!days || days <= 0) return null;
  return (deaths * 100) / days;
}

function rateSummary(seeds) {
  const days = seeds.reduce(function (a, s) { return a + (s.days | 0); }, 0);
  const deaths = seeds.reduce(function (a, s) { return a + (s.starveDeaths | 0); }, 0);
  return {
    seeds: seeds.length,
    villageDays: days,
    starveDeaths: deaths,
    starveRate: starveRate(deaths, days),
    perSeed: seeds.map(function (s) {
      return { seed: s.seed, days: s.days, starveDeaths: s.starveDeaths, starveRate: starveRate(s.starveDeaths, s.days) };
    }),
  };
}

function main() {
  const baseDir = process.argv[2];
  const armedDir = process.argv[3];
  if (!baseDir || !armedDir) { console.error('PAIROVERLAP-RATE-ANALYZE STOP: baseline-dir and armed-dir required.'); process.exit(2); }
  const outIdx = process.argv.indexOf('--out');
  const outFile = outIdx >= 0 ? process.argv[outIdx + 1] : null;
  const pairBarIdx = process.argv.indexOf('--pair-bar');
  const pairBar = (pairBarIdx >= 0) ? (parseInt(process.argv[pairBarIdx + 1], 10) || 35) : 35;
  const tolIdx = process.argv.indexOf('--rate-tol');
  const rateTol = (tolIdx >= 0) ? (parseFloat(process.argv[tolIdx + 1]) || 0.15) : 0.15;

  const baseline = ANALYZE.loadCorpus(baseDir);
  const armed = ANALYZE.loadCorpus(armedDir);
  if (baseline.length !== armed.length) { console.error('PAIROVERLAP-RATE-ANALYZE STOP: corpus seed counts differ (' + baseline.length + ' vs ' + armed.length + ').'); process.exit(3); }
  const seedSet = {};
  baseline.forEach(function (s) { seedSet[s.seed] = true; });
  armed.forEach(function (s) { if (!seedSet[s.seed]) { console.error('PAIROVERLAP-RATE-ANALYZE STOP: seed ' + s.seed + ' in armed but not baseline.'); process.exit(3); } });

  // Totals reused from the frozen analyzer's per-seed rows: pair
  // days, foodDeeds, donations, median survival.
  function total(seeds, f) { return seeds.reduce(function (a, s) { return a + (f(s) | 0); }, 0); }
  function median(nums) {
    const s = nums.slice().sort(function (a, b) { return a - b; });
    const n = s.length;
    if (!n) return null;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  const bPair = total(baseline, function (s) { return s.pairDays; });
  const aPair = total(armed, function (s) { return s.pairDays; });
  const bDeeds = baseline.filter(function (s) { return s.foodDeeds; }).length;
  const aDeeds = armed.filter(function (s) { return s.foodDeeds; }).length;
  const bDon = total(baseline, function (s) { return s.donatedKcal; });
  const aDon = total(armed, function (s) { return s.donatedKcal; });
  const bMed = median(baseline.map(function (s) { return s.days; }));
  const aMed = median(armed.map(function (s) { return s.days; }));
  const bRate = rateSummary(baseline);
  const aRate = rateSummary(armed);

  // Substrate guard: per-seed exact pre-first-yield (frozen).
  const guard = { pass: true, perSeed: {} };
  baseline.forEach(function (b) {
    const a = armed.filter(function (x) { return x.seed === b.seed; })[0];
    const g = ANALYZE.guardRows(b.daily, a.daily, a.firstYieldDay);
    guard.perSeed[b.seed] = g;
    if (!g.pass) guard.pass = false;
    if (g.firstDiffDayOverall != null && a.firstYieldDay != null && (g.firstDiffDayOverall | 0) < (a.firstYieldDay | 0)) guard.pass = false;
  });

  // Substrate sanity (frozen, pilot scale): foodDeeds >= 3/8 AND
  // >= 2 spend seeds. On a 12-seed confirm the caller checks the
  // scaled bars (5/12, >= 3 spend) against these same numbers.
  const bSpendSeeds = baseline.filter(function (s) { return s.firstSpendDay != null; }).length;
  const sanity = {
    foodDeeds: bDeeds, foodDeedsBar: 3,
    spendSeeds: bSpendSeeds, spendSeedsBar: 2,
    pass: bDeeds >= 3 && bSpendSeeds >= 2,
  };

  const rateBar = (aRate.starveRate == null || bRate.starveRate == null)
    ? null : bRate.starveRate + rateTol;
  const bars = {
    pairDays: { value: aPair, bar: pairBar, pass: aPair >= pairBar },
    foodDeeds: { value: aDeeds, bar: bDeeds, pass: aDeeds >= bDeeds },
    donations: { value: aDon, baseline: bDon, pass: aDon <= bDon },
    starvationRate: {
      value: aRate.starveRate, baseline: bRate.starveRate, tolerance: rateTol,
      bar: rateBar,
      pass: (aRate.starveRate != null && bRate.starveRate != null) ? (aRate.starveRate <= bRate.starveRate + rateTol) : false,
    },
    // Absolute counts, reported for the record — NOT a bar.
    starvationAbsolute: { value: aRate.starveDeaths, baseline: bRate.starveDeaths },
    median: { value: aMed, baseline: bMed, pass: aMed >= 0.8 * bMed },
  };
  const verdict = (sanity.pass && guard.pass && bars.pairDays.pass && bars.foodDeeds.pass &&
    bars.donations.pass && bars.starvationRate.pass && bars.median.pass) ? 'GO' : 'NO-GO';

  const perSeed = armed.map(function (a) {
    const b = baseline.filter(function (x) { return x.seed === a.seed; })[0];
    return {
      seed: a.seed, days: [b.days, a.days], endReason: [b.endReason, a.endReason],
      w4kills: [b.w4kills, a.w4kills], w5kills: [b.w5kills, a.w5kills],
      pairDays: [b.pairDays, a.pairDays], spent: [b.spent, a.spent], foodDeeds: [b.foodDeeds, a.foodDeeds],
      feasts: [b.feasts, a.feasts], draws: [b.draws, a.draws], facedOk: [b.facedOk, a.facedOk],
      donatedKcal: [b.donatedKcal, a.donatedKcal],
      firstSpendDay: [b.firstSpendDay, a.firstSpendDay],
      yields: a.yields, yieldFights: a.yieldFights, yieldsCapped: a.yieldsCapped,
      firstYieldDay: a.firstYieldDay,
      w4byVia: [b.w4byVia, a.w4byVia],
      companionKillsOnYieldDays: a.companionKillsOnYieldDays,
      firstPairDay: [b.firstPairDay, a.firstPairDay],
      standing: [b.standing, a.standing], maxWave: [b.maxWave, a.maxWave],
      starveDeaths: [b.starveDeaths, a.starveDeaths],
      starveRate: [starveRate(b.starveDeaths, b.days), starveRate(a.starveDeaths, a.days)],
      endFeastGate: [b.endFeastGate, a.endFeastGate], errors: [b.errors, a.errors],
    };
  });
  // Scale-wall numbers (reported, not judged).
  function wall(seeds) {
    return {
      seeds: seeds.length,
      national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      table: seeds.filter(function (s) { return s.finalSeat && s.finalSeat !== 'none'; }).length,
      wins: seeds.filter(function (s) { return s.won; }).length,
      wave4unlock: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
      wave5unlock: seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
      w5kills: total(seeds, function (s) { return s.w5kills; }),
      w4kills: total(seeds, function (s) { return s.w4kills; }),
      medianDays: median(seeds.map(function (s) { return s.days; })),
      survived: seeds.filter(function (s) { return s.endReason === 'survived' || s.days >= 150; }).length,
      w4byVia: seeds.reduce(function (acc, s) {
        Object.keys(s.w4byVia || {}).forEach(function (k) { acc[k] = (acc[k] || 0) + (s.w4byVia[k] | 0); });
        return acc;
      }, {}),
    };
  }
  const summary = {
    baseline: { pairDays: bPair, foodDeeds: bDeeds, donatedKcal: bDon, medianDays: bMed, rate: bRate, wall: wall(baseline) },
    armed: { pairDays: aPair, foodDeeds: aDeeds, donatedKcal: aDon, medianDays: aMed, rate: aRate, wall: wall(armed) },
    sanity: sanity, guard: guard, bars: bars, verdict: verdict,
    anchors: { baseline: baseline.map(function (s) { return s.anchorCommit; }), armed: armed.map(function (s) { return s.anchorCommit; }) },
    perSeed: perSeed,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  return summary;
}

if (require.main === module) main();
module.exports = { starveRate: starveRate, rateSummary: rateSummary, main: main };
