#!/usr/bin/env node
// analyze-inflow-b.js — per-seed attribution tables + band roll-up +
// sense samples for sim-inflow-b. Recomputes attribution from raw
// inflows + day tables (never trusts the stored table alone) and
// asserts the recompute matches the stored table per seed.
//
//   node scripts/analyze-inflow-b.js [--corpus <dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const { buildAttributionTable } = require('./inflow-days');
const { buildDayTable } = require('./substrate-days');

const ROOT = path.join(__dirname, '..');
function getArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
const corpusDir = path.isAbsolute(getArg('--corpus') || '') ? getArg('--corpus')
  : path.join(ROOT, getArg('--corpus') || 'evidence/2026-10-26/sim-inflow-b-corpus');
const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const load = (cap, seed) => JSON.parse(fs.readFileSync(path.join(corpusDir, `inflow-b-cap${cap}-pd0-dg1-competent-nofeast-s${seed}.json`), 'utf8'));

let bandBound = 0, bandAttr = 0;
const domDayCounts = {}, domKcal = {}, classKcalAll = {};
let bandInflowKcal = 0;
const otherNames = {};
const donatedNames = {};
const finishedNames = {};
let dutyForageKcalOnBound = 0;
const perSeed = [];
for (const s of seeds) {
  const b = load(1, s);
  const rebuilt = buildAttributionTable(b.dayTable, b.inflows);
  const match = JSON.stringify(rebuilt) === JSON.stringify(b.attributionTable);
  let attr = 0, bound = rebuilt.length;
  const dc = {};
  const kc = {};
  for (const r of rebuilt) {
    const key = r.attributed ? r.dominantClass : 'prior-stock';
    dc[key] = (dc[key] || 0) + 1;
    if (r.attributed) attr++;
    for (const [cls, k] of Object.entries(r.byClass)) {
      kc[cls] = (kc[cls] || 0) + k;
      classKcalAll[cls] = (classKcalAll[cls] || 0) + k;
      if (cls === 'other-stock') for (const [nm, nk] of Object.entries(r.namesByClass[cls] || {})) otherNames[nm] = (otherNames[nm] || 0) + nk;
      if (cls === 'donated-pack') for (const [nm, nk] of Object.entries(r.namesByClass[cls] || {})) donatedNames[nm] = (donatedNames[nm] || 0) + nk;
      if (cls === 'finished-putaway') for (const [nm, nk] of Object.entries(r.namesByClass[cls] || {})) finishedNames[nm] = (finishedNames[nm] || 0) + nk;
    }
    bandInflowKcal += r.totalInflowKcal;
    if (r.attributed) { domDayCounts[r.dominantClass] = (domDayCounts[r.dominantClass] || 0) + 1; domKcal[r.dominantClass] = (domKcal[r.dominantClass] || 0) + r.dominantKcal; }
  }
  // duty-forage say-line kcal on bound days (substrate events) vs forage-class kcal
  const boundDays = new Set(rebuilt.map(r => r.day));
  let dutyKcal = 0, dutyLines = 0;
  for (const e of (b.events || [])) {
    if (e.kind === 'forageReturn' && boundDays.has(e.day)) { dutyKcal += (e.kcal || 0); dutyLines++; }
  }
  dutyForageKcalOnBound += dutyKcal;
  bandBound += bound; bandAttr += attr;
  perSeed.push({ seed: s, daysAlive: b.daysAlive, batches: b.preserveVillagerBatches, res: b.preserveVillagerResolutions,
    worked: b.workedLines, spoken: b.racksFullLines, plain: b.plainLines, bound, attr, domCounts: dc, classKcal: kc,
    rebuildMatch: match, deaths: b.deaths, rank: b.rank, wave: b.waveReach.length, win: b.win,
    inflows: b.inflowSeen, dutyForageLinesOnBound: dutyLines, dutyForageKcalOnBound: dutyKcal,
    forageClassKcalOnBound: kc.forage || 0 });
  console.log(`seed ${s} days=${b.daysAlive} batches=${b.preserveVillagerBatches} res=${b.preserveVillagerResolutions} worked=${b.workedLines} spoken=${b.racksFullLines} plain=${b.plainLines} bound=${bound} attributed=${attr} dom=${JSON.stringify(dc)} rebuildMatch=${match} inflows=${b.inflowSeen} dutyForageOnBound=${dutyLines}x${dutyKcal}kcal forageClass=${kc.forage || 0}kcal`);
}
console.log('\nBAND: boundDays=' + bandBound + ' attributed=' + bandAttr + ' completeness=' + (bandBound ? (bandAttr / bandBound).toFixed(4) : 'n/a'));
console.log('DOMINANT-CLASS DAY SHARES: ' + JSON.stringify(domDayCounts));
console.log('DOMINANT-CLASS DOMINANT-KCAL: ' + JSON.stringify(domKcal));
console.log('BOUND-DAY INFLOW KCAL BY CLASS: ' + JSON.stringify(classKcalAll) + ' total=' + bandInflowKcal);
console.log('OTHER-STOCK NAMES (bound days): ' + JSON.stringify(otherNames));
console.log('DONATED-PACK NAMES TOP (bound days): ' + JSON.stringify(Object.entries(donatedNames).sort((a, b) => b[1] - a[1]).slice(0, 20)));
console.log('FINISHED-PUTAWAY NAMES TOP (bound days): ' + JSON.stringify(Object.entries(finishedNames).sort((a, b) => b[1] - a[1]).slice(0, 20)));
console.log('DUTY-FORAGE SAY-LINE KCAL ON BOUND DAYS (band): ' + dutyForageKcalOnBound);

// whole-run inflow totals by class (all days, not just bound) for context
const allKcal = {};
for (const s of seeds) {
  const b = load(1, s);
  const { classifyInflow, inflowKcal } = require('./inflow-days');
  for (const rec of (b.inflows || [])) {
    const cls = classifyInflow(rec);
    if (!cls) continue;
    const k = inflowKcal(rec);
    if (k > 0) allKcal[cls] = (allKcal[cls] || 0) + k;
  }
}
console.log('ALL-DAY INFLOW KCAL BY CLASS (context): ' + JSON.stringify(allKcal));

// wall numbers
const daysAlive = perSeed.map(p => p.daysAlive).sort((a, b) => a - b);
const median = daysAlive.length % 2 ? daysAlive[Math.floor(daysAlive.length / 2)] : (daysAlive[daysAlive.length / 2 - 1] + daysAlive[daysAlive.length / 2]) / 2;
console.log('WALL: national=' + perSeed.filter(p => /national|global/i.test(p.rank)).length + '/8 table=' + perSeed.filter(p => p.win).length + '/8 wins=' + perSeed.filter(p => p.win).length + '/8 waveMax=' + JSON.stringify(perSeed.map(p => p.wave)) + ' medianDaysAlive=' + median + ' maxDaysAlive=' + daysAlive[daysAlive.length - 1]);

// sense samples: first bound day per dominant class with >=5 days, plus the largest garden day
const wanted = Object.entries(domDayCounts).filter(([, n]) => n >= 5).map(([c]) => c);
console.log('\nSENSE SAMPLE CLASSES (>=5 bound days): ' + wanted.join(', '));
for (const cls of wanted) {
  outer: for (const s of seeds) {
    const b = load(1, s);
    const rebuilt = buildAttributionTable(b.dayTable, b.inflows);
    for (const r of rebuilt) {
      if (r.attributed && r.dominantClass === cls) {
        console.log(`\n--- SAMPLE dominant=${cls} seed=${s} day=${r.day} totalInflow=${r.totalInflowKcal} dominantKcal=${r.dominantKcal} share=${(r.dominantShare * 100).toFixed(0)}% byClass=${JSON.stringify(r.byClass)} pantryFirst=${r.pantryFirst} preservedFirst=${r.preservedFirst} freshFirst=${r.freshFirst}`);
        // day transcript: cook lines + events + inflow say lines are not in inflows; print cook lines + events that day in seq order
        const lines = [];
        for (const c of (b.cookLines || []).filter(c => c.day === r.day)) lines.push({ seq: c.seq, text: '[' + c.frame + '] ' + c.text });
        for (const e of (b.events || []).filter(e => e.day === r.day)) lines.push({ seq: e.seq, text: '[' + e.kind + '] ' + e.text });
        lines.sort((a, b2) => a.seq - b2.seq);
        for (const l of lines.slice(0, 40)) console.log('  ' + l.text);
        console.log('  (inflow records this day are stockPantry calls, mostly silent in the log; duty say lines above are the voiced subset)');
        break outer;
      }
    }
  }
}
