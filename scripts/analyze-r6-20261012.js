#!/usr/bin/env node
// analyze-r6.js — before/after comparison for the knife round (lever 0 r6).
// Usage: node scripts/analyze-r6.js /tmp/food-r6-before.json /tmp/food-r6-after.json
//        [sweepBefore] [sweepAfter]
'use strict';
const fs = require('fs');
const [beforeF, afterF, sweepB, sweepA] = process.argv.slice(2);
const B = JSON.parse(fs.readFileSync(beforeF, 'utf8')).rows;
const A = JSON.parse(fs.readFileSync(afterF, 'utf8')).rows;
const q = (arr, p) => { const s = arr.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0; };
const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
const mean = (rows, k) => sum(rows, k) / rows.length;
const inBy = (rows) => { const o = {}; for (const r of rows) for (const [k, v] of Object.entries(r.inBy || {})) o[k] = (o[k] || 0) + v; return o; };

console.log('== seeds:', B.length, 'before /', A.length, 'after');
console.log('\n-- THE KNIFE --');
for (const [label, rows] of [['before', B], ['after', A]]) {
  const n = rows.length;
  const knifeDays = sum(rows, 'knifeDays'), sampleDays = sum(rows, 'sampleDays');
  console.log(`${label}: knifeCrafts=${sum(rows, 'knifeCrafts')} knivesKnapped(ctx)=${sum(rows, 'knivesKnappedCtx')} knappedKnife(r5 ctx)=${sum(rows, 'knappedKnifeCtx')} knapFailed=${sum(rows, 'knapFailedCtx')}`);
  console.log(`   knife held ${(100 * knifeDays / Math.max(1, sampleDays)).toFixed(1)}% of sampled days (${knifeDays}/${sampleDays})`);
  console.log(`   rubbleCleared=${sum(rows, 'rubbleClearedCtx')} stoneFromRubble=${sum(rows, 'stoneFromRubbleCtx')}`);
}
console.log('\n-- CATCH -> CLEANED (player) --');
for (const [label, rows] of [['before', B], ['after', A]]) {
  const catches = sum(rows, 'trapCatches'), cleaned = sum(rows, 'trapCarcassesCleaned');
  console.log(`${label}: catches=${catches} trappedCleaned=${cleaned} allCleaned=${sum(rows, 'carcassesCleaned')} conv=${catches ? (100 * cleaned / catches).toFixed(1) + '%' : 'n/a'}`);
  console.log(`   trapsSet=${sum(rows, 'trapsSet')} crafted=${sum(rows, 'trapsCraftedRecipe')} wireSet=${sum(rows, 'trapsWireSet')} looted=${sum(rows, 'trapLooted')} trapKcal=${sum(rows, 'trapKcal')}`);
}
console.log('\n-- FOOD ECONOMY --');
for (const [label, rows] of [['before', B], ['after', A]]) {
  const days = sum(rows, 'days');
  const spoil = sum(rows, 'spoilLostKcal');
  console.log(`${label}: spoil ${Math.round(spoil / Math.max(1, days))} kcal/run-day (fresh ${Math.round(sum(rows, 'spoilFreshKcal') / Math.max(1, days))} / preserved ${Math.round(sum(rows, 'spoilPreservedKcal') / Math.max(1, days))})`);
  console.log(`   hungry-day share ${(100 * sum(rows, 'hungryDays') / Math.max(1, sum(rows, 'sampleDays'))).toFixed(1)}% | preserved+=${Math.round(sum(rows, 'preservedKcal'))}`);
  const ib = inBy(rows);
  const top = Object.entries(ib).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('   income by source:', top.map(([k, v]) => `${k}=${(v / 1e6).toFixed(2)}M`).join(' '));
}
console.log('\n-- SURVIVAL / DEATHS --');
for (const [label, rows] of [['before', B], ['after', A]]) {
  const ds = rows.map(r => r.days).sort((a, b) => a - b);
  const causes = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.causes || {})) causes[k] = (causes[k] || 0) + v;
  console.log(`${label}: median ${ds[Math.floor(ds.length / 2)]}d max ${ds[ds.length - 1]}d`);
  console.log('   deaths:', JSON.stringify(causes));
}
if (sweepB && sweepA) {
  console.log('\n-- SWEEP (completion metrics) --');
  for (const [label, f] of [['before', sweepB], ['after', sweepA]]) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    const agg = d.agg && d.agg.competent;
    if (!agg) { console.log(label, 'no competent agg'); continue; }
    console.log(`${label}: n=${agg.n} medianDays=${agg.medianDays} maxDays=${agg.maxDays} won=${agg.won} table=${agg.tableWaiting} maxArc=${JSON.stringify(agg.maxArcDist)}`);
    const waves = {};
    for (const r of d.runs || []) if (r.policy === 'competent') waves[r.maxWave] = (waves[r.maxWave] || 0) + 1;
    console.log(`   maxWave dist: ${JSON.stringify(waves)} meanBreadth=${agg.meanBreadth}`);
  }
}
