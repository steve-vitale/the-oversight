#!/usr/bin/env node
// analyze-racksvoice-b.js — census table + quote sampler for the
// racks-full voice corpus (sim-racksvoice-b, 2026-10-26).
// Reads evidence/2026-10-26/sim-racksvoice-b-corpus/*.json only;
// prints per-seed table, per-cook breakdowns, kcal tracking, and
// verbatim racks-full + worked quotes with day/seed/cook.
// Usage: node scripts/analyze-racksvoice-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-racksvoice-b-corpus');
const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
function load(cap, seed) {
  const p = path.join(dir, `racksvoice-b-cap${cap}-pd0-dg1-leadfeast-s${seed}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
console.log('seed days batches res worked racksFull plain say deaths national wave rank');
for (const s of seeds) {
  const c = load(1, s);
  if (!c) { console.log(s + ' MISSING cap1'); continue; }
  console.log(`${s} ${c.daysAlive} ${c.preserveVillagerBatches} ${c.preserveVillagerResolutions} ${c.workedLines} ${c.racksFullLines} ${c.plainLines} ${c.saySamples ? c.saySamples.length : (c.sayTotal != null ? c.sayTotal : '-')} ${c.deaths} ${c.national} ${c.waveReach.length} ${c.rank}`);
}
console.log('\n--- per-seed racks-full by cook (count / distinct days / day span) ---');
for (const s of seeds) {
  const c = load(1, s);
  if (!c || !c.census) { console.log(s + ' no census'); continue; }
  const cen = c.census;
  const parts = Object.keys(cen.racksFullByCook).map(cook => {
    const days = cen.racksFullDaysByCook[cook] || [];
    return `${cook}=${cen.racksFullByCook[cook]} on ${days.length}d${days.length ? ` (${days[0]}..${days[days.length - 1]})` : ''}`;
  });
  console.log(`${s} racksFull=${c.racksFullLines} distinctDays=${cen.racksFullDistinctDays} span=${cen.racksFullDayMin}..${cen.racksFullDayMax} kcal=${cen.racksFullKcalMin}..${cen.racksFullKcalMax} distinctKcal=${cen.racksFullKcalDistinct} parsed=${cen.racksFullKcalParsed} | ${parts.join('; ') || 'none'} | workedByCook=${JSON.stringify(cen.workedByCook)}`);
}
console.log('\n--- verbatim racks-full quotes (census records carry first 3 + last 1) ---');
for (const s of seeds) {
  const c = load(1, s);
  if (!c) continue;
  const qs = c.racksFullQuotes || (c.saySamples ? c.saySamples.filter(x => /racks are already full/i.test(x.text)) : []);
  if (!qs.length) { console.log(`${s}: (no racks-full lines)`); continue; }
  for (const q of qs) console.log(`[${s} d${q.day}] ${q.text}`);
}
console.log('\n--- verbatim worked quotes (first 1 per seed with any) ---');
for (const s of seeds) {
  const c = load(1, s);
  if (!c) continue;
  if (c.workedQuoteFirst) { console.log(`[${s} d${c.workedQuoteFirst.day}] ${c.workedQuoteFirst.text}`); continue; }
  if (!c.saySamples) continue;
  const w = c.saySamples.filter(x => /worked the smoke racks too/i.test(x.text));
  if (w.length) console.log(`[${s} d${w[0].day}] ${w[0].text}`);
}
console.log('\n--- neutrality cap0 vs cap1 (numeric fields) ---');
const fields = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions', 'deaths', 'national', 'waveReach', 'rank'];
for (const s of seeds) {
  const a = load(0, s), b = load(1, s);
  if (!a || !b) { console.log(s + ' MISSING pair'); continue; }
  const diff = fields.filter(f => JSON.stringify(a[f]) !== JSON.stringify(b[f]));
  console.log(`${s} ${diff.length ? 'DIFF: ' + diff.join(',') : 'identical'}`);
}
