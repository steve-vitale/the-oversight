#!/usr/bin/env node
// analyze-substrate-b.js — per-seed day tables, band roll-up, sense samples.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-substrate-b-corpus');
const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const CLASSES = ['S-THROTTLED', 'S-THROTTLED-PARTIAL', 'S-FORAGED', 'S-NO-FORAGE-DUTY'];
const band = {}; for (const c of CLASSES) band[c] = 0;
let bandDays = 0, bandNational = 0, bandTable = 0, bandWins = 0;
const daysAlive = [];
const waveDist = {};
let bandForageReturns = 0, bandRedirects = 0, bandGardenFish = 0;
const foragerNames = {}, redirectNames = {};
for (const seed of seeds) {
  const f = path.join(dir, `substrate-b-cap1-pd0-dg1-competent-nofeast-s${seed}.json`);
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const counts = {}; for (const c of CLASSES) counts[c] = 0;
  for (const d of (j.dayTable || [])) { counts[d.class]++; band[d.class]++; bandDays++;
    bandForageReturns += d.forageReturns; bandRedirects += d.forageRedirects; bandGardenFish += d.gardenFishRedirects;
    for (const n of d.forageReturnNames) foragerNames[n] = (foragerNames[n] || 0) + 1;
    for (const n of d.forageRedirectNames) redirectNames[n] = (redirectNames[n] || 0) + 1;
  }
  if (j.national) bandNational++;
  if (j.table) bandTable++;
  if (j.win) bandWins++;
  daysAlive.push(j.daysAlive);
  const w = (j.waveReach || []).length;
  waveDist[w] = (waveDist[w] || 0) + 1;
  console.log(`seed ${seed} days=${j.daysAlive} rank=${j.rank} wave=${w} deaths=${j.deaths} cook=${j.sayTotal} racksFull=${j.racksFullLines} plain=${j.plainLines} events=${JSON.stringify(j.eventCounts)} racksBoundDays=${(j.dayTable || []).length} classes=${JSON.stringify(counts)}`);
}
daysAlive.sort((a, b) => a - b);
const median = daysAlive.length % 2 ? daysAlive[Math.floor(daysAlive.length / 2)]
  : (daysAlive[daysAlive.length / 2 - 1] + daysAlive[daysAlive.length / 2]) / 2;
console.log('BAND racksBoundDays=' + bandDays + ' classes=' + JSON.stringify(band));
for (const c of CLASSES) console.log('  ' + c + ' ' + band[c] + ' (' + (bandDays ? (100 * band[c] / bandDays).toFixed(1) : '0') + '%)');
console.log('BAND forageReturnsOnBoundDays=' + bandForageReturns + ' forageRedirectsOnBoundDays=' + bandRedirects + ' gardenFishRedirects=' + bandGardenFish);
console.log('BAND national=' + bandNational + '/8 table=' + bandTable + '/8 wins=' + bandWins + '/8 medianDaysAlive=' + median + ' max=' + daysAlive[daysAlive.length - 1] + ' waveDist=' + JSON.stringify(waveDist));
console.log('BAND foragerNames=' + JSON.stringify(foragerNames));
console.log('BAND redirectNames=' + JSON.stringify(redirectNames));
// Sense samples: first day of each non-empty class (per seed order), with
// its day transcript in arrival order (cook lines + events that day).
console.log('--- SENSE SAMPLES ---');
const shown = new Set();
for (const seed of seeds) {
  const f = path.join(dir, `substrate-b-cap1-pd0-dg1-competent-nofeast-s${seed}.json`);
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const d of (j.dayTable || [])) {
    if (shown.has(d.class)) continue;
    shown.add(d.class);
    console.log(`\nSAMPLE ${d.class} seed=${seed} day=${d.day} forageReturns=${d.forageReturns} forageRedirects=${d.forageRedirects} assigned=${JSON.stringify(d.assignedForage)} pantryFirst=${d.pantryFirst} pantryLast=${d.pantryLast} preservedFirst=${d.preservedFirst} freshFirst=${d.freshFirst} throttleFirst=${d.throttleFirst} eligibleAny=${d.eligibleAny} racksFullSpoken=${d.racksFullSpoken} silenced=${d.silenced}`);
    const lines = [];
    for (const c of (j.cookLines || [])) if (c.day === d.day) lines.push({ seq: c.seq || 0, kind: 'cook:' + c.frame, cook: c.cook, text: c.text, racksFull: c.racksFull, eligible: c.eligiblePresent, preserved: c.preservedKcal, cap: c.rackCap });
    for (const e of (j.events || [])) if (e.day === d.day) lines.push({ seq: e.seq || 0, kind: e.kind, name: e.name, text: e.text });
    lines.sort((a, b) => a.seq - b.seq);
    for (const l of lines) console.log('  ' + JSON.stringify(l));
  }
}
