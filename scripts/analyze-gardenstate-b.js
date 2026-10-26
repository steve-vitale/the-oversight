#!/usr/bin/env node
// analyze-gardenstate-b.js — cascade analysis for sim-gardenstate-b.
// Reads evidence/2026-10-26/sim-gardenstate-b-corpus/*.json and applies
// the PRE-REGISTRATION cascade per seed-day, in order:
//   (d) garden inflow via a non-'Garden harvest' door
//   H   stockPantry 'Garden harvest' kcal>0 (harvest success, not a mechanism)
//   (e) no garden-duty signal ever in this seed up to this day
//   (a) planted == 0
//   (b) planted > 0, ripe == 0
//   (c) ripe > 0, no harvest
// Prints aggregate + per-seed cascade counts, non-cascade tallies,
// wall numbers, and sense excerpts. Exits 0; the verdict is judged by
// the human/evidence step against the pre-registered >=95% bar.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-gardenstate-b-corpus');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('no corpus files in ' + DIR); process.exit(2); }

const totals = { d: 0, H: 0, e: 0, a: 0, b: 0, c: 0, days: 0 };
const perSeed = [];
const wall = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, survivals: [] };
const tallies = { assigns: 0, keeperTurns: 0, resolutions: 0, throttleRes: 0,
  makes: 0, sows: 0, npcSows: 0, keeperSets: 0, gardenInflows: 0,
  inflowGardenHarvest: 0, ripeSafeDays: 0, ripeUnsafeDays: 0 };
const sense = { plantedDay: null, ripeDay: null, harvestDay: null };

for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const ev = s.gardenEvents || {};
  const inflowByDay = {};
  for (const r of (ev.gardenInflows || [])) {
    (inflowByDay[r.day] = inflowByDay[r.day] || []).push(r);
  }
  const dutyDays = new Set();
  for (const e of [...(ev.assigns || []), ...(ev.keeperTurns || []), ...(ev.resolutions || []), ...(ev.keeperSets || []).filter(k => k.ok)]) dutyDays.add(e.day);
  const c = { seed: s.seed, d: 0, H: 0, e: 0, a: 0, b: 0, c: 0, days: 0,
    firstPlanted: null, firstRipe: null, firstHarvest: null };
  let dutyEver = false;
  const daysSorted = [...(s.gardenDays || [])].sort((x, y) => x.day - y.day);
  for (const snap of daysSorted) {
    const d = snap.day;
    if (dutyDays.has(d)) dutyEver = true;
    const infl = inflowByDay[d] || [];
    const otherDoor = infl.filter(r => !(r.door === 'stock' && r.name === 'Garden harvest'));
    const harvest = infl.filter(r => r.door === 'stock' && r.name === 'Garden harvest' && (r.kcal || 0) > 0);
    let cls;
    if (otherDoor.length) cls = 'd';
    else if (harvest.length) cls = 'H';
    else if (!dutyEver) cls = 'e';
    else if ((snap.planted || 0) === 0) cls = 'a';
    else if ((snap.ripe || 0) === 0) cls = 'b';
    else cls = 'c';
    c[cls]++; totals[cls]++; totals.days++; c.days++;
    if (c.firstPlanted == null && (snap.planted || 0) > 0) c.firstPlanted = d;
    if (c.firstRipe == null && (snap.ripe || 0) > 0) c.firstRipe = d;
    if (c.firstHarvest == null && harvest.length) c.firstHarvest = d;
    if ((snap.ripeSafe || 0) > 0) tallies.ripeSafeDays++;
    if ((snap.ripeUnsafe || 0) > 0) tallies.ripeUnsafeDays++;
    // Sense excerpts: first planted-day / ripe-day / harvest-day say lines.
    if (!sense.plantedDay && (snap.planted || 0) > 0) {
      const line = (ev.sayLines || []).find(l => l.day === d);
      if (line) sense.plantedDay = { seed: s.seed, day: d, line: line.line };
    }
    if (!sense.ripeDay && (snap.ripe || 0) > 0) {
      const line = (ev.sayLines || []).find(l => l.day === d);
      if (line) sense.ripeDay = { seed: s.seed, day: d, line: line.line };
    }
    if (!sense.harvestDay && harvest.length) {
      const line = (ev.sayLines || []).find(l => l.day === d);
      if (line) sense.harvestDay = { seed: s.seed, day: d, line: line.line };
    }
  }
  perSeed.push(c);
  tallies.assigns += (ev.assigns || []).length;
  tallies.keeperTurns += (ev.keeperTurns || []).length;
  tallies.resolutions += (ev.resolutions || []).length;
  tallies.throttleRes += (ev.resolutions || []).filter(r => r.throttle).length;
  tallies.makes += (ev.makes || []).length;
  tallies.sows += (ev.sows || []).length;
  tallies.npcSows += (ev.npcSows || []).length;
  tallies.keeperSets += (ev.keeperSets || []).length;
  tallies.gardenInflows += (ev.gardenInflows || []).length;
  tallies.inflowGardenHarvest += (s.inflows || []).filter(r => r.name === 'Garden harvest').length;
  if (s.national) wall.national++;
  if (s.table) wall.table++;
  if (s.win) wall.wins++;
  if ((s.waveReach || []).includes(4)) wall.wave4++;
  if ((s.waveReach || []).includes(5)) wall.wave5++;
  wall.survivals.push(s.daysAlive);
}
wall.survivals.sort((a, b) => a - b);
const median = wall.survivals.length
  ? wall.survivals[Math.floor(wall.survivals.length / 2)] : null;

console.log('seeds: ' + files.length);
console.log('seed-days: ' + totals.days);
for (const k of ['d', 'H', 'e', 'a', 'b', 'c']) {
  console.log('class ' + k + ': ' + totals[k] + ' (' + (totals.days ? (100 * totals[k] / totals.days).toFixed(1) : '0') + '%)');
}
console.log('per-seed (seed d/H/e/a/b/c days firstPlanted firstRipe firstHarvest):');
for (const c of perSeed) {
  console.log(`  ${c.seed} ${c.d}/${c.H}/${c.e}/${c.a}/${c.b}/${c.c} days=${c.days} planted=${c.firstPlanted} ripe=${c.firstRipe} harvest=${c.firstHarvest}`);
}
console.log('tallies: ' + JSON.stringify(tallies));
console.log('wall: national=' + wall.national + '/' + files.length + ' table=' + wall.table + ' wins=' + wall.wins +
  ' wave4=' + wall.wave4 + ' wave5=' + wall.wave5 + ' medianSurvival=' + median + ' survivals=' + JSON.stringify(wall.survivals));
console.log('sense plantedDay: ' + JSON.stringify(sense.plantedDay));
console.log('sense ripeDay: ' + JSON.stringify(sense.ripeDay));
console.log('sense harvestDay: ' + JSON.stringify(sense.harvestDay));
