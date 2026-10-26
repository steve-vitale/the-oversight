#!/usr/bin/env node
// analyze-plainvoice-b.js — aggregate the plainvoice corpus into the
// per-seed class distribution table, band totals, sense samples,
// and wall numbers for evidence/2026-10-26/sim-plainvoice-b.md.
// Usage: node scripts/analyze-plainvoice-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-plainvoice-b-corpus');
const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const classes = ['P-SILENCED', 'P-RACKS-NOELIG', 'P-RES2PLUS', 'P-FIRST-NOSMOKE', 'UNCLASSIFIED'];
const load = (cap, seed) => JSON.parse(fs.readFileSync(
  path.join(dir, `plainvoice-b-cap${cap}-pd0-dg1-leadfeast-s${seed}.json`), 'utf8'));
const rows = [];
let band = { plain: 0, say: 0, worked: 0, racksFull: 0, deaths: 0 };
const bandClass = {};
for (const c of classes) bandClass[c] = 0;
const firstSample = {};
const unclassReasons = {};
for (const seed of seeds) {
  const c1 = load(1, seed);
  const cc = c1.classCounts || {};
  const row = { seed, days: c1.daysAlive, batches: c1.preserveVillagerBatches,
    res: c1.preserveVillagerResolutions, worked: c1.workedLines,
    racksFull: c1.racksFullLines, plain: c1.plainLines, say: c1.sayTotal,
    deaths: c1.deaths, national: c1.national, rank: c1.rank,
    wave: c1.waveReach.length, table: c1.table, win: c1.win, classes: {} };
  for (const cl of classes) { row.classes[cl] = cc[cl] || 0; bandClass[cl] += row.classes[cl]; }
  band.plain += row.plain; band.say += row.say; band.worked += row.worked;
  band.racksFull += row.racksFull; band.deaths += row.deaths;
  rows.push(row);
  for (const p of (c1.plainDetail || [])) {
    if (!firstSample[p.class]) firstSample[p.class] = { seed, ...p };
    if (p.class === 'UNCLASSIFIED') unclassReasons[p.unclassReason || '?'] = (unclassReasons[p.unclassReason || '?'] || 0) + 1;
  }
}
console.log('seed days batches res worked racksFull plain say deaths rank wave | ' + classes.join(' '));
for (const r of rows) {
  console.log(`${r.seed} ${r.days} ${r.batches} ${r.res} ${r.worked} ${r.racksFull} ${r.plain} ${r.say} ${r.deaths} ${r.rank} ${r.wave} | ` +
    classes.map(c => r.classes[c]).join(' '));
}
console.log('BAND plain=' + band.plain + ' say=' + band.say + ' worked=' + band.worked +
  ' racksFull=' + band.racksFull + ' deaths=' + band.deaths);
console.log('BANDCLASSES ' + JSON.stringify(bandClass));
console.log('COVERAGE ' + ((band.plain - bandClass.UNCLASSIFIED) / Math.max(1, band.plain) * 100).toFixed(2) + '%');
console.log('UNCLASS-REASONS ' + JSON.stringify(unclassReasons));
// Wall numbers
const daysSorted = rows.map(r => r.days).sort((a, b) => a - b);
const median = daysSorted[Math.floor(daysSorted.length / 2)];
const national = rows.filter(r => r.national).length;
const table = rows.filter(r => r.table).length;
const wins = rows.filter(r => r.win).length;
const waveDist = {};
for (const r of rows) waveDist[r.wave] = (waveDist[r.wave] || 0) + 1;
console.log(`WALL national=${national}/8 table=${table}/8 wins=${wins}/8 medianDays=${median} maxDays=${Math.max(...daysSorted)} waveDist=${JSON.stringify(waveDist)}`);
// Sense samples: first line per class with full tags
for (const cl of classes) {
  const s = firstSample[cl];
  if (!s) { console.log('SAMPLE ' + cl + ' NONE'); continue; }
  console.log('SAMPLE ' + cl + ' seed=' + s.seed + ' day=' + s.day + ' cook=' + s.cook +
    ' resIndex=' + s.resIndex + ' racksFull=' + s.racksFull + ' eligible=' + s.eligiblePresent +
    ' eligCount=' + s.eligibleCount + ' eligKcal=' + s.eligibleKcal +
    ' preservedKcal=' + s.preservedKcal + ' rackCap=' + s.rackCap +
    ' voiceSpoken=' + s.voiceSpokenToday + ' cands=' + s.candidates +
    (s.unclassReason ? ' reason=' + s.unclassReason : '') + ' text=' + JSON.stringify(s.text));
}
// Per-class eligible-present split for P-FIRST-NOSMOKE / P-RES2PLUS
for (const cl of ['P-FIRST-NOSMOKE', 'P-RES2PLUS', 'P-RACKS-NOELIG']) {
  let elig = 0, noelig = 0;
  for (const seed of seeds) {
    const c1 = load(1, seed);
    for (const p of (c1.plainDetail || [])) {
      if (p.class !== cl) continue;
      if (p.eligiblePresent) elig++; else noelig++;
    }
  }
  console.log('ELIGSPLIT ' + cl + ' eligiblePresent=' + elig + ' absent=' + noelig);
}
