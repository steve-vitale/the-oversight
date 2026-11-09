// feaststopspend-analyze-20261107.js — compare the stop-after-spend
// corpora (arm sim-feaststopspend-b). Reads the re-baseline corpus
// (staged + feastdrive on current master) and the armed corpus
// (staged + feastdrive + stop-after-spend, same seeds, same base)
// and prints a JSON summary: per-seed chain state, the substrate
// guard (8/8 per-seed exact pre-first-bind), the substrate sanity
// check, the frozen primary + cost bars, and the scale-wall numbers.
// The evidence file is the record; this is the arithmetic behind it.
// Usage: node scripts/feaststopspend-analyze-20261107.js <baseline-dir> <armed-dir> [--out <file>]
'use strict';
const fs = require('fs');
const path = require('path');
// sim-sitmetric-b: the row's finalSeat is the ALIGNED seat (taken, not
// priced) — see scripts/lib/seat-taken.js. A priced-but-untaken seat
// (seed 53004: "lesser", taken 0) reads 'none' here.
const { alignedSeat } = require(path.join(__dirname, 'lib', 'seat-taken'));

// guardRows(baselineDaily, armedDaily, firstSpendDay): the substrate
// guard — daily rows must match exactly for every day <= the
// baseline leg's firstSpendDay (the stop binds only after the spend;
// the wrapper delegates identically before it). Returns
// { pass, firstDiffDay, diffs } with diffs as field-level
// "day.field: base -> armed" strings (first 10). A seed with no
// spend day must match on every row.
function guardRows(baselineDaily, armedDaily, firstSpendDay) {
  const diffs = [];
  let firstDiffDay = null;
  const n = Math.min((baselineDaily || []).length, (armedDaily || []).length);
  for (let i = 0; i < n; i++) {
    const b = baselineDaily[i] || {};
    const a = armedDaily[i] || {};
    if (firstSpendDay != null && (b.day | 0) > (firstSpendDay | 0)) break;
    const keys = {};
    Object.keys(b).forEach(function (k) { keys[k] = true; });
    Object.keys(a).forEach(function (k) { keys[k] = true; });
    Object.keys(keys).sort().forEach(function (k) {
      if (JSON.stringify(b[k]) !== JSON.stringify(a[k])) {
        if (firstDiffDay == null) firstDiffDay = (b.day | 0);
        if (diffs.length < 10) diffs.push('d' + (b.day | 0) + '.' + k + ': ' + JSON.stringify(b[k]) + ' -> ' + JSON.stringify(a[k]));
      }
    });
    if (firstSpendDay != null && (b.day | 0) === (firstSpendDay | 0)) break;
  }
  return { pass: firstDiffDay == null, firstDiffDay: firstDiffDay, diffs: diffs };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const seeds = [];
  for (const f of files) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const daily = o.daily || [];
    const last = daily[daily.length - 1] || {};
    const gates = {};
    daily.forEach(function (d) { gates[d.feastGate || '?'] = (gates[d.feastGate || '?'] | 0) + 1; });
    const w4kills = (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
    const w5kills = (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); }).length;
    // Starvation deaths: teleDeaths is an ARRAY of death records
    // ({kind, cause}) in this driver — count records whose kind/cause
    // names starvation (feastdrive metric-review correction).
    const starveDeaths = Array.isArray(o.teleDeaths)
      ? o.teleDeaths.filter(function (d) { return /starv/i.test(((d.cause || '') + ' ' + (d.kind || ''))); }).length
      : (((o.teleDeaths || {}).starvation | 0) + ((o.teleDeaths || {}).starved | 0));
    // Post-spend feasts/draws: chain events after the spend day.
    const spendDay = o.firstSpendDay;
    const feastsAfterSpend = (spendDay == null) ? null :
      ((o.feastEvents || {}).feasts || []).filter(function (ev) { return (ev.day | 0) > (spendDay | 0); }).length;
    const drawsAfterSpend = (spendDay == null) ? null :
      ((o.feastEvents || {}).draws || []).filter(function (ev) { return ev.drawn && (ev.day | 0) > (spendDay | 0); }).length;
    // Drive-hosted feasts / donate-downs after the spend day, from
    // the drive's own event log (the drive logs each with its day).
    const driveFeastsAfterSpend = (spendDay == null) ? null :
      (((o.feastdriveStats || {}).events || []).filter(function (ev) { return ev.what === 'feast' && (ev.day | 0) > (spendDay | 0); }).length);
    const driveDonateAfterSpend = (spendDay == null) ? null :
      (((o.feastdriveStats || {}).events || []).filter(function (ev) { return ev.what === 'donate-down' && (ev.day | 0) > (spendDay | 0); }).length);
    seeds.push({
      seed: o.seed, policy: o.policy, anchorCommit: o.anchorCommit, days: o.days, endReason: o.endReason, won: !!o.won,
      maxWave: o.maxWave, standing: o.standing, scaleRank: o.scaleRank,
      finalSeat: alignedSeat(o),
      w4kills: w4kills, w5kills: w5kills, pairDays: daily.filter(function (d) { return d.pairDay; }).length,
      channels: last.channels | 0, arms: last.arms | 0, feasts: last.feasts | 0,
      armedFeasts: last.armedFeasts | 0, grants: last.grants | 0,
      draws: last.draws | 0, drawn: last.drawn | 0, facedOk: last.facedOk | 0,
      drivenOff: last.drivenOff | 0, spent: !!last.spent,
      resonance: last.surgeResonance, l3: last.l3Count,
      firstArmDay: o.firstArmDay, firstFeastDay: o.firstFeastDay,
      firstGrantDay: o.firstGrantDay, firstDrawDay: o.firstDrawDay,
      firstSpendDay: o.firstSpendDay, endFeastGate: o.endFeastGate,
      sentimentTaught: !!last.sentimentTaught,
      foodDeeds: !!(last.sentimentTaught && last.spent),
      feastsAfterSpend: feastsAfterSpend, drawsAfterSpend: drawsAfterSpend,
      driveFeastsAfterSpend: driveFeastsAfterSpend, driveDonateAfterSpend: driveDonateAfterSpend,
      donatedKcal: ((o.feastdriveStats || {}).donatedKcal | 0),
      stopDays: ((o.feaststopspendStats || {}).deedDoneDays | 0),
      stopDonateSkips: ((o.feaststopspendStats || {}).deedDoneDonateSkips | 0),
      stopFeastSkips: ((o.feaststopspendStats || {}).deedDoneFeastSkips | 0),
      firstDeedDoneDay: (o.feaststopspendStats || {}).firstDeedDoneDay,
      feastGates: gates, feastLines: (o.feastLines || []).length,
      starveDeaths: starveDeaths, errors: (o.instrumentErrors || []).length,
      instrumentErrors: o.instrumentErrors || [],
      daily: daily,
    });
  }
  return seeds;
}

function median(nums) {
  const s = nums.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  if (!n) return null;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function summarize(seeds) {
  const days = seeds.map(function (s) { return s.days; });
  return {
    seeds: seeds.length,
    medianDays: median(days),
    survived: seeds.filter(function (s) { return s.endReason === 'survived' || s.days >= 150; }).length,
    won: seeds.filter(function (s) { return s.won; }).length,
    national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: seeds.filter(function (s) { return s.finalSeat && s.finalSeat !== 'none'; }).length,
    wave4unlock: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
    wave5unlock: seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
    w4killsTotal: seeds.reduce(function (a, s) { return a + s.w4kills; }, 0),
    w4killsPerSeed: seeds.map(function (s) { return s.w4kills; }),
    w5killsTotal: seeds.reduce(function (a, s) { return a + s.w5kills; }, 0),
    pairDaysTotal: seeds.reduce(function (a, s) { return a + s.pairDays; }, 0),
    pairDaysPerSeed: seeds.map(function (s) { return s.pairDays; }),
    spentSeeds: seeds.filter(function (s) { return s.spent; }).length,
    foodDeedsSeeds: seeds.filter(function (s) { return s.foodDeeds; }).length,
    starveDeathsTotal: seeds.reduce(function (a, s) { return a + s.starveDeaths; }, 0),
    starveDeathsPerSeed: seeds.map(function (s) { return s.starveDeaths; }),
    donatedKcalTotal: seeds.reduce(function (a, s) { return a + s.donatedKcal; }, 0),
    donatedKcalPerSeed: seeds.map(function (s) { return s.donatedKcal; }),
    feastsTotal: seeds.reduce(function (a, s) { return a + s.feasts; }, 0),
    drawsTotal: seeds.reduce(function (a, s) { return a + s.draws; }, 0),
    facedTotal: seeds.reduce(function (a, s) { return a + s.facedOk; }, 0),
    totalErrors: seeds.reduce(function (a, s) { return a + s.errors; }, 0),
  };
}

function main() {
  const baseDir = process.argv[2];
  const armedDir = process.argv[3];
  if (!baseDir || !armedDir) { console.error('FEASTSTOPSPEND-ANALYZE STOP: baseline-dir and armed-dir required.'); process.exit(2); }
  const outIdx = process.argv.indexOf('--out');
  const outFile = outIdx >= 0 ? process.argv[outIdx + 1] : null;

  const baseline = loadCorpus(baseDir);
  const armed = loadCorpus(armedDir);
  if (baseline.length !== armed.length) { console.error('FEASTSTOPSPEND-ANALYZE STOP: corpus seed counts differ (' + baseline.length + ' vs ' + armed.length + ').'); process.exit(3); }
  const seedSet = {};
  baseline.forEach(function (s) { seedSet[s.seed] = true; });
  armed.forEach(function (s) { if (!seedSet[s.seed]) { console.error('FEASTSTOPSPEND-ANALYZE STOP: seed ' + s.seed + ' in armed but not baseline.'); process.exit(3); } });

  const bSum = summarize(baseline);
  const aSum = summarize(armed);

  // Substrate guard: per-seed exact pre-first-bind.
  const guard = { pass: true, perSeed: {} };
  baseline.forEach(function (b) {
    const a = armed.filter(function (x) { return x.seed === b.seed; })[0];
    const g = guardRows(b.daily, a.daily, b.firstSpendDay);
    guard.perSeed[b.seed] = g;
    if (!g.pass) guard.pass = false;
  });

  // Substrate sanity (frozen): foodDeeds >= 3/8 on the re-baseline
  // AND >= 2 seeds with a spend day.
  const sanity = {
    foodDeeds: bSum.foodDeedsSeeds,
    foodDeedsBar: 3,
    spendSeeds: baseline.filter(function (s) { return s.firstSpendDay != null; }).length,
    spendSeedsBar: 2,
    pass: bSum.foodDeedsSeeds >= 3 && baseline.filter(function (s) { return s.firstSpendDay != null; }).length >= 2,
  };

  // Frozen primary + cost bars.
  const bars = {
    pairDays: { value: aSum.pairDaysTotal, bar: 35, pass: aSum.pairDaysTotal >= 35 },
    foodDeeds: { value: aSum.foodDeedsSeeds, bar: 4, pass: aSum.foodDeedsSeeds >= 4 },
    donations: { value: aSum.donatedKcalTotal, baseline: bSum.donatedKcalTotal, pass: aSum.donatedKcalTotal <= bSum.donatedKcalTotal },
    starvation: { value: aSum.starveDeathsTotal, baseline: bSum.starveDeathsTotal, pass: aSum.starveDeathsTotal <= bSum.starveDeathsTotal + 2 },
    median: { value: aSum.medianDays, baseline: bSum.medianDays, pass: aSum.medianDays >= 0.8 * bSum.medianDays },
  };
  const verdict = (sanity.pass && guard.pass && bars.pairDays.pass && bars.foodDeeds.pass &&
    bars.donations.pass && bars.starvation.pass && bars.median.pass) ? 'GO' : 'NO-GO';

  const perSeed = armed.map(function (a) {
    const b = baseline.filter(function (x) { return x.seed === a.seed; })[0];
    return {
      seed: a.seed, days: [b.days, a.days], endReason: [b.endReason, a.endReason],
      w4kills: [b.w4kills, a.w4kills], w5kills: [b.w5kills, a.w5kills],
      pairDays: [b.pairDays, a.pairDays], spent: [b.spent, a.spent], foodDeeds: [b.foodDeeds, a.foodDeeds],
      feasts: [b.feasts, a.feasts], draws: [b.draws, a.draws], facedOk: [b.facedOk, a.facedOk],
      donatedKcal: [b.donatedKcal, a.donatedKcal],
      firstSpendDay: [b.firstSpendDay, a.firstSpendDay],
      feastsAfterSpend: [b.feastsAfterSpend, a.feastsAfterSpend],
      drawsAfterSpend: [b.drawsAfterSpend, a.drawsAfterSpend],
      driveFeastsAfterSpend: [b.driveFeastsAfterSpend, a.driveFeastsAfterSpend],
      driveDonateAfterSpend: [b.driveDonateAfterSpend, a.driveDonateAfterSpend],
      stopDays: a.stopDays, stopDonateSkips: a.stopDonateSkips, stopFeastSkips: a.stopFeastSkips,
      firstDeedDoneDay: a.firstDeedDoneDay,
      standing: [b.standing, a.standing], maxWave: [b.maxWave, a.maxWave],
      starveDeaths: [b.starveDeaths, a.starveDeaths],
      endFeastGate: [b.endFeastGate, a.endFeastGate], errors: [b.errors, a.errors],
    };
  });
  const summary = {
    baseline: bSum, armed: aSum,
    sanity: sanity, guard: guard, bars: bars, verdict: verdict,
    anchors: { baseline: baseline.map(function (s) { return s.anchorCommit; }), armed: armed.map(function (s) { return s.anchorCommit; }) },
    perSeed: perSeed,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  return summary;
}

if (require.main === module) main();
module.exports = { guardRows: guardRows, loadCorpus: loadCorpus, main: main };
