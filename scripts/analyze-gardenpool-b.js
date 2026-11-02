#!/usr/bin/env node
// analyze-gardenpool-b.js — garden-pooling diagnostics + pilot judge.
// Reads entrywindow driver .jsonl files (baseline, armed) and prints
// per-seed garden diagnostics plus the prereg verdict. The judged
// bars come from scripts/analyze-entrywindow-b.js (pack_full,
// meanDailyHaul, awayDayEnds, starvationDeaths); this script adds:
//   - day-start overload days (day.start.packKg >= day.start.packCap)
//   - mean/max day-start packKg per leg
//   - garden pooled kcal (deposits kind 'other' — harvestGarden's
//     pantry deposit runs outside returnToVillage/donateToPantry)
//   - pooled / deferred narration counts from sayLines
//   - per-seed away table (the 60307-shaped shape veto input)
// Usage: node scripts/analyze-gardenpool-b.js <baseline.jsonl> <armed.jsonl>
//   [--judge] prints PILOT GO / NO-GO against the prereg bars.
'use strict';
const fs = require('fs');
const ew = require('./analyze-entrywindow-b');

function load(f) {
  return fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function isPooledLine(line) { return /straight to the pantry/.test(line || ''); }
function isDeferredLine(line) { return /in its bed/.test(line || ''); }
function isHarvestLine(line) { return /^Harvest: /.test(line || ''); }

function gardenSeed(inst) {
  const days = inst.days || [];
  let overloadDays = 0, dsSum = 0, dsN = 0, dsMax = 0;
  for (const d of days) {
    const s = d.start || {};
    if (typeof s.packKg === 'number' && typeof s.packCap === 'number') {
      dsSum += s.packKg; dsN++; if (s.packKg > dsMax) dsMax = s.packKg;
      if (s.packKg >= s.packCap) overloadDays++;
    }
  }
  const pooledKcal = (inst.deposits || []).filter((x) => x.kind === 'other')
    .reduce((t, x) => t + (x.kcal || 0), 0);
  const sayLines = (inst.sayLines || []).map((x) => x.line);
  return {
    seed: inst.seed,
    overloadDays,
    dayStartMeanKg: dsN ? +(dsSum / dsN).toFixed(1) : null,
    dayStartMaxKg: +dsMax.toFixed(1),
    gardenPooledKcal: pooledKcal,
    pooledLines: sayLines.filter(isPooledLine).length,
    deferredLines: sayLines.filter(isDeferredLine).length,
    harvestLines: sayLines.filter(isHarvestLine).length,
    pooledSamples: sayLines.filter(isPooledLine).slice(0, 3),
    deferredSamples: sayLines.filter(isDeferredLine).slice(0, 3),
  };
}

function gardenBand(insts) {
  const seeds = insts.map(gardenSeed);
  return {
    seeds,
    overloadDays: seeds.reduce((t, s) => t + s.overloadDays, 0),
    dayStartMeanKg: seeds.length
      ? +(seeds.reduce((t, s) => t + (s.dayStartMeanKg || 0), 0) / seeds.length).toFixed(1) : null,
    dayStartMaxKg: Math.max(0, ...seeds.map((s) => s.dayStartMaxKg || 0)),
    gardenPooledKcal: seeds.reduce((t, s) => t + s.gardenPooledKcal, 0),
    pooledLines: seeds.reduce((t, s) => t + s.pooledLines, 0),
    deferredLines: seeds.reduce((t, s) => t + s.deferredLines, 0),
  };
}

function judge(base, armed) {
  const b = base.band, a = armed.band, gb = base.garden, ga = armed.garden;
  const pfB = (b.entrywindow.failByReason || {}).pack_full || 0;
  const pfA = (a.entrywindow.failByReason || {}).pack_full || 0;
  const checks = [];
  checks.push({ bar: 'regime guard: baseline pack_full >= 4', base: pfB, armed: pfA, pass: pfB >= 4 });
  checks.push({ bar: 'pack_full armed <= 0.5 x baseline', base: pfB, armed: pfA, pass: pfB >= 4 && pfA <= 0.5 * pfB });
  checks.push({ bar: 'day-start overload days armed < baseline', base: gb.overloadDays, armed: ga.overloadDays, pass: ga.overloadDays < gb.overloadDays });
  checks.push({ bar: 'mean daily haul armed >= baseline', base: b.meanDailyHaul, armed: a.meanDailyHaul, pass: a.meanDailyHaul >= b.meanDailyHaul });
  checks.push({ bar: 'away day-ends armed <= baseline', base: b.awayDayEnds, armed: a.awayDayEnds, pass: a.awayDayEnds <= b.awayDayEnds });
  // Shape veto: new-or-worsened stranding on any single seed.
  const veto = [];
  for (const as of a.seeds) {
    const bs = b.seeds.find((s) => s.seed === as.seed);
    if (!bs) continue;
    if (as.awayDayEnds >= 10 && as.awayDayEnds >= (bs.awayDayEnds || 0) + 10)
      veto.push({ seed: as.seed, base: bs.awayDayEnds, armed: as.awayDayEnds });
  }
  checks.push({ bar: 'shape veto: no seed armed awayE >= 10 AND >= baseline+10', base: null, armed: veto.length ? veto : 0, pass: veto.length === 0 });
  checks.push({ bar: 'starvation deaths armed <= baseline', base: b.starvationDeaths, armed: a.starvationDeaths, pass: a.starvationDeaths <= b.starvationDeaths });
  const mechanism = (ga.pooledLines + ga.deferredLines) > 0 && ga.gardenPooledKcal + ga.deferredLines > 0;
  checks.push({ bar: 'mechanism gate: armed pooled or deferred event fired', base: null, armed: { pooledLines: ga.pooledLines, deferredLines: ga.deferredLines, pooledKcal: ga.gardenPooledKcal }, pass: mechanism });
  const go = checks.every((c) => c.pass);
  // --confirm only relabels the verdict string for the confirm run;
  // the bars and the computation are identical to the pilot judge.
  const label = process.argv.includes('--confirm') ? 'CONFIRM' : 'PILOT';
  return { checks, veto, go, verdict: go ? label + ' GO' : label + ' NO-GO' };
}

function main() {
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const doJudge = process.argv.includes('--judge');
  if (files.length < 2) { console.error('usage: analyze-gardenpool-b.js <baseline.jsonl> <armed.jsonl> [--judge]'); process.exit(2); }
  const bands = files.map((f) => {
    const insts = load(f);
    const rows = insts.map(ew.analyzeSeedEntrywindow);
    return { file: f, seeds: rows, band: ew.bandSummary(rows), garden: gardenBand(insts) };
  });
  const out = { bands };
  if (doJudge) out.judge = judge(bands[0], bands[1]);
  for (const bnd of bands) {
    console.error('gardenpool file=' + bnd.file + ' pack_full=' + ((bnd.band.entrywindow.failByReason || {}).pack_full || 0) +
      ' overloadDays=' + bnd.garden.overloadDays + ' dayStartMean=' + bnd.garden.dayStartMeanKg +
      ' dayStartMax=' + bnd.garden.dayStartMaxKg + ' haul=' + bnd.band.meanDailyHaul +
      ' awayE=' + bnd.band.awayDayEnds + ' starv=' + bnd.band.starvationDeaths +
      ' pooledKcal=' + bnd.garden.gardenPooledKcal + ' pooledLines=' + bnd.garden.pooledLines +
      ' deferredLines=' + bnd.garden.deferredLines);
  }
  if (out.judge) {
    for (const c of out.judge.checks) console.error('JUDGE ' + (c.pass ? 'PASS' : 'FAIL') + ' | ' + c.bar + ' | base=' + JSON.stringify(c.base) + ' armed=' + JSON.stringify(c.armed));
    console.error('JUDGE VERDICT: ' + out.judge.verdict);
  }
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}
if (require.main === module) main();
module.exports = { gardenSeed, gardenBand, judge, isPooledLine, isDeferredLine };
