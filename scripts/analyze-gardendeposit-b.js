#!/usr/bin/env node
// analyze-gardendeposit-b.js — re-derivation for sim-gardendeposit-b (DIAG).
// Reads ONLY the existing 2026-10-26 stock9762 corpus; runs no sims, writes
// nothing to the repo. Prints: 9762 gardenInflows door/name/count/kcal,
// cross-check against the inflows array, band-wide door split, harvest-day
// vs deposit-day timing, plot-state cycle, and sense-line counts.
// Usage: node scripts/analyze-gardendeposit-b.js [--corpus-dir <dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv.includes('--corpus-dir')
  ? process.argv[process.argv.indexOf('--corpus-dir') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-stock9762-b-corpus');
const load = s => JSON.parse(fs.readFileSync(path.join(dir,
  `stock9762-b-competent-nofeast-s${s}.json`), 'utf8'));
const seeds = [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767];
const bySeed = {};
for (const s of seeds) bySeed[s] = load(s);

function tabulate(recs) {
  const byDoor = {}, byName = {}, byDoorName = {};
  let kcal = 0, unclassified = 0;
  for (const r of recs) {
    if (!r.door || !r.name) { unclassified++; continue; }
    kcal += r.kcal || 0;
    byDoor[r.door] = (byDoor[r.door] || 0) + 1;
    byName[r.name] = (byName[r.name] || 0) + 1;
    const k = r.door + '|' + r.name;
    byDoorName[k] = byDoorName[k] || { count: 0, kcal: 0 };
    byDoorName[k].count++; byDoorName[k].kcal += r.kcal || 0;
  }
  return { n: recs.length, kcal, unclassified, byDoor, byName, byDoorName };
}

const d = bySeed[9762];
const gi = d.gardenEvents.gardenInflows;
const t = tabulate(gi);
console.log('=== 9762 gardenInflows (traced set) ===');
console.log('count', t.n, 'kcal', t.kcal, 'unclassified', t.unclassified);
console.log('byDoor', JSON.stringify(t.byDoor));
console.log('byName', JSON.stringify(t.byName));
console.log('byDoorName', JSON.stringify(t.byDoorName));
console.log('day range', Math.min(...gi.map(r => r.day)), Math.max(...gi.map(r => r.day)),
  'distinct deposit days', new Set(gi.map(r => r.day)).size);

// Cross-check: inflows array, deposit door, same name.
const infDep = d.inflows.filter(r => r.door === 'deposit');
const infLQ = infDep.filter(r => r.name === "Lamb's Quarters");
const infLQKcal = infLQ.reduce((a, r) => a + (r.kcal || 0), 0);
console.log('=== 9762 inflows cross-check ===');
console.log('inflows total', d.inflows.length, 'deposit records', infDep.length,
  'deposit LQ', infLQ.length, 'LQ kcal', infLQKcal);
console.log('gardenInflows == inflows deposit-LQ (count & kcal)?',
  infLQ.length === t.n && infLQKcal === t.kcal);
console.log('inflows stock names', JSON.stringify([...new Set(
  d.inflows.filter(r => r.door === 'stock').map(r => r.name))]));
console.log('inflows stock Garden harvest count',
  d.inflows.filter(r => r.door === 'stock' && r.name === 'Garden harvest').length);
console.log('inflows pantryAdd count',
  d.inflows.filter(r => r.door === 'pantryAdd').length);

// Band-wide door split.
console.log('=== band-wide gardenInflows ===');
let bandN = 0, bandKcal = 0;
for (const s of seeds) {
  const tt = tabulate(bySeed[s].gardenEvents.gardenInflows);
  bandN += tt.n; bandKcal += tt.kcal;
  console.log(s, 'n', tt.n, 'kcal', tt.kcal, 'doors', JSON.stringify(tt.byDoor),
    'names', JSON.stringify(tt.byName), 'unclassified', tt.unclassified);
}
console.log('band total n', bandN, 'kcal', bandKcal);

// Timing: snapshot harvest days (any plot lastHarvest == day) vs deposit days.
const harvDays = new Set();
for (const gd of d.gardenDays) {
  if (gd.plots.some(p => p.lastHarvest === gd.day)) harvDays.add(gd.day);
}
const depDays = new Set(gi.map(r => r.day));
const both = [...harvDays].filter(x => depDays.has(x));
const harvOnly = [...harvDays].filter(x => !depDays.has(x));
const depOnly = [...depDays].filter(x => !harvDays.has(x));
console.log('=== 9762 timing ===');
console.log('first player sow LQ day',
  Math.min(...d.gardenEvents.sows.filter(s => s.pid === 'lambs_quarters').map(s => s.day)));
console.log('player LQ sows', d.gardenEvents.sows.filter(s => s.pid === 'lambs_quarters').length,
  'NPC sows', d.gardenEvents.npcSows.length);
console.log('first snapshot harvest day', Math.min(...harvDays),
  'first deposit day', Math.min(...depDays));
console.log('snapshot harvest days', harvDays.size, 'deposit days', depDays.size,
  'both', both.length, 'harvest-only', harvOnly.length, 'deposit-only', depOnly.length);
console.log('harvest-only days', JSON.stringify(harvOnly));
console.log('deposit-only days', JSON.stringify(depOnly));
console.log('garden resolutions', d.gardenEvents.resolutions.length,
  'throttle-engaged', d.gardenEvents.resolutions.filter(r => r.throttle).length);
console.log('end-of-day ripe counts: max ripe over all gardenDays',
  Math.max(...d.gardenDays.map(g => g.ripe)),
  'days with growthLeft<=0 at snapshot',
  d.gardenDays.filter(g => g.plots.some(p => p.growthLeft != null && p.growthLeft <= 0)).length);

// Sense lines.
const say = d.gardenEvents.sayLines;
console.log('=== 9762 sense lines (garden-filtered sayLines) ===');
console.log('sayLines', say.length,
  'keeper weed lines', say.filter(s => s.line.includes('waters and weeds')).length,
  'coax lines', say.filter(s => s.line.includes('coax')).length,
  'sow lines', say.filter(s => s.line.includes('You sow')).length,
  'Harvest: lines', say.filter(s => s.line.startsWith('Harvest:')).length);
console.log('coax amounts', JSON.stringify(say.filter(s => s.line.includes('coax'))
  .reduce((a, s) => { const m = s.line.match(/by (\d+) days/); if (m) a[m[1]] = (a[m[1]] || 0) + 1; return a; }, {})));
