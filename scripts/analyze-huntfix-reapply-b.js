#!/usr/bin/env node
// scripts/analyze-huntfix-reapply-b.js — aggregate per-seed JSONs for the
// sim-huntfix-reapply-b pilot: pre-registered PRIMARY, guardrails, watch,
// and wall numbers (report-only).
//
// Usage:
//   node scripts/analyze-huntfix-reapply-b.js <ctl-out-dir> <armed-out-dir>
// PRE-REGISTERED BARS (binding, §14):
//   PRIMARY: staffingHuntKcal mean armed >= 1.15x control AND >= 10,000 kcal/run.
//   GUARDRAILS: starvation deaths <= control+1 (paired per run); median
//     survival no worse than -10d; no new death mode (revised >=2-event rule);
//     wave-4 unlocks within +/-2/16 (report-only).
//   WATCH: taskLeadHuntKcal amplification (report honestly, never re-score).
'use strict';
const fs = require('fs'), path = require('path');
const [ctlDir, armedDir] = process.argv.slice(2);
if (!ctlDir || !armedDir) { console.error('usage: node analyze-huntfix-reapply-b.js <ctl-out> <armed-out>'); process.exit(2); }
const readDir = (d) => fs.readdirSync(d).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
const key = (r) => `${r.policyId}-s${r.seed}`;
const C = readDir(ctlDir), A = readDir(armedDir);
const cByKey = Object.fromEntries(C.map(r => [key(r), r]));
const pairs = A.filter(a => cByKey[key(a)]).map(a => [cByKey[key(a)], a]);
console.log(`runs: control=${C.length} armed=${A.length} paired=${pairs.length}`);
const cMean = mean(C.map(r => r.staffingHuntKcal || 0));
const aMean = mean(A.map(r => r.staffingHuntKcal || 0));
const ratio = cMean > 0 ? aMean / cMean : (aMean > 0 ? Infinity : 1);
console.log('\n=== PRIMARY: staffing-channel hunt kcal/run ===');
console.log(`  control mean ${cMean.toFixed(0)} (median ${med(C.map(r => r.staffingHuntKcal || 0)).toFixed(0)})`);
console.log(`  armed   mean ${aMean.toFixed(0)} (median ${med(A.map(r => r.staffingHuntKcal || 0)).toFixed(0)})`);
console.log(`  ratio armed/control = ${ratio.toFixed(3)}  (GO needs >= 1.15)`);
console.log(`  absolute armed = ${aMean.toFixed(0)}  (GO needs >= 10,000)`);
console.log(`  PRIMARY VERDICT: ${(ratio >= 1.15 && aMean >= 10000) ? 'GO' : 'NO-GO'}`);
console.log('\n  per-seed staffing kcal (ctl -> armed):');
for (const [c, a] of pairs) console.log(`    ${key(a)}: ${(c.staffingHuntKcal || 0).toFixed(0)} -> ${(a.staffingHuntKcal || 0).toFixed(0)} (res ${c.staffingHuntResolves || 0}->${a.staffingHuntResolves || 0}, kills ${c.staffingHuntKills || 0}->${a.staffingHuntKills || 0})`);
console.log('\n=== WATCH: task-lead hunt kcal ===');
console.log(`  control mean ${mean(C.map(r => r.taskLeadHuntKcal || 0)).toFixed(0)}, armed mean ${mean(A.map(r => r.taskLeadHuntKcal || 0)).toFixed(0)}`);
console.log(`  task-lead days (mean): control ${mean(C.map(r => r.huntTaskLeadDays || 0)).toFixed(1)}, armed ${mean(A.map(r => r.huntTaskLeadDays || 0)).toFixed(1)}`);
console.log('\n=== GUARDRAILS ===');
let starvFails = 0;
for (const [c, a] of pairs) {
  const cs = c.villagerStarvationDeaths || 0, as = a.villagerStarvationDeaths || 0;
  if (as > cs + 1) { starvFails++; console.log(`  STARV FAIL ${key(a)}: ctl ${cs} -> armed ${as}`); }
}
console.log(`  starvation deaths <= control+1 (paired): ${starvFails ? starvFails + ' FAILURES' : 'PASS'}`);
const cMed = med(C.map(r => r.gameDays || 0)), aMed = med(A.map(r => r.gameDays || 0));
console.log(`  median survival: control ${cMed}d, armed ${aMed}d (gate: no worse than -10d): ${aMed >= cMed - 10 ? 'PASS' : 'FAIL'}`);
const cCauses = {}, aCauses = {};
for (const r of C) for (const [k, n] of Object.entries(r.villagerCauseCounts || {})) cCauses[k] = (cCauses[k] || 0) + n;
for (const r of A) for (const [k, n] of Object.entries(r.villagerCauseCounts || {})) aCauses[k] = (aCauses[k] || 0) + n;
const newModes = Object.entries(aCauses).filter(([k, n]) => !(k in cCauses) && n >= 2);
console.log(`  new death modes (>=2 events, armed-only): ${newModes.length ? JSON.stringify(newModes) + ' FAIL' : 'none — PASS'}`);
const cW4 = C.filter(r => r.wave4).length, aW4 = A.filter(r => r.wave4).length;
console.log(`  wave-4 unlocks: control ${cW4}/${C.length}, armed ${aW4}/${A.length} (report-only, gate ±2/16)`);
console.log('\n=== WALL (report-only) ===');
const wall = (rs, f) => rs.filter(f).length;
console.log(`  national: ctl ${wall(C, r => r.national)}/${C.length} armed ${wall(A, r => r.national)}/${A.length}`);
console.log(`  table:    ctl ${wall(C, r => r.table)}/${C.length} armed ${wall(A, r => r.table)}/${A.length}`);
console.log(`  wins:     ctl ${wall(C, r => r.wins)}/${C.length} armed ${wall(A, r => r.wins)}/${A.length}`);
console.log(`  wave5:    ctl ${wall(C, r => r.wave5)}/${C.length} armed ${wall(A, r => r.wave5)}/${A.length}`);
console.log(`  arc2/3/4: ctl ${wall(C, r => r.arc2)}/${wall(C, r => r.arc3)}/${wall(C, r => r.arc4)} armed ${wall(A, r => r.arc2)}/${wall(A, r => r.arc3)}/${wall(A, r => r.arc4)}`);
console.log(`  fourRealm: ctl ${wall(C, r => r.fourRealm)} armed ${wall(A, r => r.fourRealm)}`);
console.log(`  max survival: ctl ${Math.max(...C.map(r => r.gameDays || 0))}d, armed ${Math.max(...A.map(r => r.gameDays || 0))}d`);
const agg = (rs) => { const o = {}; for (const r of rs) for (const [k, n] of Object.entries(r.villagerCauseCounts || {})) o[k] = (o[k] || 0) + n; return o; };
console.log('\n  villager death causes — control:', JSON.stringify(agg(C)));
console.log('  villager death causes — armed:  ', JSON.stringify(agg(A)));
