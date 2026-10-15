#!/usr/bin/env node
// scripts/compare-belongfeast-20261015.js — merge the two per-side sweep OUT
// files (control + armed) into the combined table and the PRIMARY verdict.
// The two sides run as separate invocations (the OVERDRAWFLOOR env gate is
// process-wide), identical seeds, same script — one sweep in two passes.
//
// Usage:
//   node scripts/compare-belongfeast-20261015.js <control.json> <armed.json>
'use strict';
const fs = require('fs');
const [cPath, aPath] = process.argv.slice(2);
if (!cPath || !aPath) { console.error('usage: compare-belongfeast-20261015.js <control.json> <armed.json>'); process.exit(1); }
const C = JSON.parse(fs.readFileSync(cPath, 'utf8'));
const A = JSON.parse(fs.readFileSync(aPath, 'utf8'));
const ca = C.agg.control, aa = A.agg.armed;
if (!ca || !aa) { console.error('FATAL: missing agg.control / agg.armed'); process.exit(1); }
if (JSON.stringify(C.seeds) !== JSON.stringify(A.seeds)) {
  console.error('FATAL: seed sets differ — not identical seeds'); process.exit(1);
}
console.log(`=== belongfeast combined === seeds=[${C.seeds.join(',')}] days=${C.days}`);
for (const [nm, b] of [['control', ca], ['armed', aa]]) {
  console.log(`  ${nm}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} w4=${b.wave4} w5=${b.wave5} hungry=${b.hungryDays} starveDeaths=${b.starveDeaths} starvedVD=${b.starvedDays} det=${b.determinedShare} prox=${b.feastProxShare} feasts=${b.osFeasts} feastsKcal=${(b.osFeastKcal / 1000).toFixed(1)}k gateHeld=${b.osGateHeld} fragileHeld=${b.osFragileHeld}`);
  console.log(`    byClass: ${Object.entries(b.byClass).map(([k, v]) => `${k}:${v}`).join(' ') || '-'}`);
  console.log(`    deaths: ${Object.entries(b.deaths).map(([k, v]) => `${k}:${v}`).join(' ') || '-'}`);
}
// per-seed pairing: feast events vs starvation
console.log('\nper-seed (armed): feasts, feast-proximity starved VD, starveDeaths, hungryDays');
for (const r of A.rows.filter(r => r.side === 'armed')) {
  console.log(`  s${r.seed}: days=${r.days} end=${r.endReason} feasts=${r.osFeasts} kcal=${r.osFeastKcal} proxVD=${r.feastProxStarved}/${r.starvedDays} starveDeaths=${r.starveDeaths} hungry=${r.hungryDays}`);
}
let verdict = 'MISS';
if (aa.starvedDays === 0) verdict = 'INFO-SKIP (no starved villager-days — question unanswerable)';
else if (aa.determinedShare != null && aa.determinedShare >= 0.80) verdict = 'GO';
console.log(`\nPRIMARY: armed starvedVD=${aa.starvedDays} determinedShare=${aa.determinedShare} feastProxShare=${aa.feastProxShare} -> ${verdict}`);
// the #259 question: does the feast drive the elevation?
const dStarve = aa.starveDeaths - ca.starveDeaths;
const dHungry = aa.hungryDays - ca.hungryDays;
console.log(`#259: starveDeaths ${ca.starveDeaths}->${aa.starveDeaths} (d=${dStarve}); hungryDays ${ca.hungryDays}->${aa.hungryDays} (d=${dHungry}); feast-proximity starved VD share armed=${aa.feastProxShare} (control: no feast events)`);
