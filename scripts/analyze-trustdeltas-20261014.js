#!/usr/bin/env node
// scripts/analyze-trustdeltas-20261014.js — analysis for the evidence file.
// Reads evidence/2026-10-14/trustdeltas-perseed/*.json and prints the full
// delta taxonomy, succession-set decomposition, below-30 attribution, sting
// ablation, periodic-drain hunt, progressive-at-threshold, and wall numbers.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-14', 'trustdeltas-perseed');

const rows = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json') || f.includes('-i2')) continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}
console.log(`combos: ${rows.length}`);
const vd = rows.reduce((t, r) => t + r.villageDays, 0);
console.log(`village-days: ${vd}`);

// 1. full delta taxonomy
const agg = {};
for (const r of rows) for (const d of r.deltas) {
  const e = agg[d.channel] || (agg[d.channel] = { channel: d.channel, fires: 0, pos: 0, neg: 0, sPos: 0, sNeg: 0, sFires: 0, combos: 0 });
  e.fires += d.fires; e.pos += d.pos; e.neg += d.neg;
  e.sPos += d.sPos; e.sNeg += d.sNeg; e.sFires += d.sFires;
  if (d.fires > 0) e.combos++;
}
const p100 = x => (x / vd * 100);
console.log('\n== SITTING-SCHOLAR DRAINS (strict per-day lineage) ==');
for (const c of Object.values(agg).filter(c => c.sNeg < 0).sort((a, b) => a.sNeg - b.sNeg)) {
  const share = (c.sNeg / Object.values(agg).reduce((t, x) => t + x.sNeg, 0) * 100);
  console.log(`  ${c.channel}: ${p100(c.sNeg).toFixed(2)}/100vd total ${c.sNeg.toFixed(0)} (${share.toFixed(1)}% of scholar drains) x${c.sFires} ${c.combos}/${rows.length}`);
}
console.log('\n== SITTING-SCHOLAR GAINS ==');
for (const c of Object.values(agg).filter(c => c.sPos > 0).sort((a, b) => b.sPos - a.sPos)) {
  const share = (c.sPos / Object.values(agg).reduce((t, x) => t + x.sPos, 0) * 100);
  console.log(`  ${c.channel}: +${p100(c.sPos).toFixed(2)}/100vd total ${c.sPos.toFixed(0)} (${share.toFixed(1)}% of scholar gains) x${c.sFires} ${c.combos}/${rows.length}`);
}
console.log('\n== VILLAGE-WIDE TOP DRAINS (non-scholar context) ==');
for (const c of Object.values(agg).filter(c => c.neg < 0).sort((a, b) => a.neg - b.neg).slice(0, 10)) {
  console.log(`  ${c.channel}: ${p100(c.neg).toFixed(2)}/100vd total ${c.neg.toFixed(0)} x${c.fires} ${c.combos}/${rows.length}`);
}
console.log('\n== SETS (not earned — counted separately) ==');
for (const c of Object.values(agg).filter(c => c.channel.indexOf('set:') === 0).sort((a, b) => b.pos - a.pos)) {
  console.log(`  ${c.channel}: +${p100(c.pos).toFixed(2)}/100vd village (scholar +${c.sPos.toFixed(0)}) x${c.fires} ${c.combos}/${rows.length}`);
}

// 2. succession-set decomposition
const sets = [];
for (const r of rows) for (const s of (r.successionsDetail || [])) if (s.neu != null) sets.push(s);
const med = a => { const s2 = a.slice().sort((x, y) => x - y); return s2.length ? s2[Math.floor(s2.length / 2)] : 0; };
console.log(`\n== SUCCESSION-SET DECOMPOSITION (n=${sets.length}) ==`);
console.log(`  neu median ${med(sets.map(s => s.neu))} (p10 ${med(sets.map(s => s.neu).sort((a,b)=>a-b).slice(0, Math.max(1,Math.floor(sets.length*0.1))))})`);
console.log(`  office component median ${med(sets.map(s => s.office))}, own median ${med(sets.map(s => s.own))}`);
const vouchOk = sets.filter(s => s.vouch != null);
console.log(`  vouch identifiable: ${vouchOk.length}/${sets.length}; vouch median ${med(vouchOk.map(s => s.vouch))}; check failures: ${vouchOk.filter(s => s.check !== 'ok').length}`);
console.log(`  clamped (floor/ceiling bound): ${sets.filter(s => s.clamped).length}/${sets.length}`);
console.log(`  neu distribution: ${sets.map(s => s.neu).sort((a,b)=>a-b).join(',')}`);

// 3. below-30 attribution
const below = {};
let belowDays = 0, aboveDays = 0, nTen = 0;
for (const r of rows) for (const t of (r.tenures || [])) {
  nTen++;
  below[t.belowClass] = below[t.belowClass] || { days: 0, tenures: 0 };
  below[t.belowClass].days += t.daysBelow30; below[t.belowClass].tenures++;
  belowDays += t.daysBelow30; aboveDays += t.daysAtOrAbove30;
}
console.log(`\n== BELOW-30 ATTRIBUTION (${nTen} tenures) ==`);
console.log(`  trust<30 scholar-day share: ${(belowDays / Math.max(1, belowDays + aboveDays)).toFixed(4)} (${belowDays}/${belowDays + aboveDays})`);
for (const k of Object.keys(below).sort((a, b) => below[b].days - below[a].days)) {
  console.log(`  ${k}: ${below[k].days} below-30 days (${(below[k].days / Math.max(1, belowDays) * 100).toFixed(1)}%) across ${below[k].tenures} tenures`);
}
// start-trust distribution (the inheritance landing)
const starts = [];
for (const r of rows) for (const t of (r.tenures || [])) if (t.startTrust != null) starts.push(t.startTrust);
console.log(`  tenure start-trust: median ${med(starts)}, p10 ${starts.slice().sort((a,b)=>a-b)[Math.floor(starts.length*0.1)]}, max ${Math.max.apply(null, starts)}`);

// 4. sting ablation
let ag = 0, aa = 0, ab = 0, maxErr = 0;
for (const r of rows) for (const a of (r.ablations || [])) { ag += a.gained; aa += a.actualDaysAbove; ab += a.ablatedDaysAbove; if (a.replayError > maxErr) maxErr = a.replayError; }
console.log(`\n== STING ABLATION (in-silico; mealonly's real twin) ==`);
console.log(`  days>=30: actual ${aa} -> ablated ${ab} (gained ${ag}); max replayError ${maxErr}`);

// 5. periodic-drain hunt
const per = {};
for (const r of rows) for (const p of (r.periodic || [])) {
  const e = per[p.channel] || (per[p.channel] = { channel: p.channel, fires: 0, total: 0, regular: false });
  e.fires += p.fires; e.total += p.total; e.regular = e.regular || p.regular;
}
console.log('\n== PERIODIC-DRAIN HUNT (sitting scholar; #182 decay hypothesis) ==');
for (const c of Object.values(per).sort((a, b) => a.total - b.total)) {
  console.log(`  ${c.channel}: ${c.total.toFixed(0)} x${c.fires} ${c.regular ? '**REGULAR CADENCE**' : 'irregular'}`);
}
if (!Object.keys(per).length) console.log('  (no negative writes on the sitting scholar at all)');

// 6. progressive at threshold
const bands = {};
for (const r of rows) for (const [k, e] of Object.entries(r.progThresh || {})) {
  const b = bands[k] || (bands[k] = { calls: 0, base: 0, scaled: 0 });
  b.calls += e.calls; b.base += e.base; b.scaled += e.scaled;
}
console.log('\n== PROGRESSIVE EFFICIENCY AT THE 30 LINE (scholar gains only) ==');
for (const k of ['<30', '30-49', '50+']) {
  const e = bands[k] || { calls: 0, base: 0, scaled: 0 };
  console.log(`  trust ${k}: x${e.calls} base ${e.base.toFixed(0)} -> applied ${e.scaled.toFixed(0)} (eff ${e.base > 0 ? (e.scaled / e.base).toFixed(2) : 'n/a'})`);
}

// 7. wall
console.log('\n== WALL ==');
console.log(`  national ${rows.reduce((t, r) => t + r.national, 0)}/${rows.length} table ${rows.reduce((t, r) => t + r.table, 0)}/${rows.length} wins ${rows.reduce((t, r) => t + r.wins, 0)}/${rows.length} exiled ${rows.reduce((t, r) => t + r.exiled, 0)}/${rows.length}`);
console.log(`  maxWave ${Math.max.apply(null, rows.map(r => r.waveReach))} medianDays ${med(rows.map(r => r.gameDays))} trustEndMedian ${med(rows.map(r => r.scholarTrustEnd == null ? 0 : r.scholarTrustEnd))}`);
const unclass = rows.filter(r => r.unclassified.length);
console.log(`  unclassified: ${unclass.length ? unclass.map(r => r.policy + '-s' + r.seed + ': ' + r.unclassified.join(',')).join(' ') : 'NONE — taxonomy complete'}`);
