#!/usr/bin/env node
// analyze-apexhook-20261016.js — compares treatment vs control on IDENTICAL
// seeds (the sim-apexhook pilot sweep).
//
// PRIMARY (binding, from evidence/2026-10-16/sim-apexhook.md):
//   GO iff probe proof GREEN for every hooked species (scripts/
//   test-apexhook-20261016.js) AND ≥1 trick execution vs the newly-hooked
//   set (apexExecutions > 0) in the 8-seed sweep.
// Guardrails: national_treatment >= national_control - 2;
//   median_days_treatment >= median_days_control - 10; no new death mode.
//
// Usage: node scripts/analyze-apexhook-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-apexhook');
const SEEDS = [901, 902, 903, 904, 905, 906, 907, 908];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(policyId, seed, arm) {
  const p = path.join(EVID, `${policyId}-s${seed}-${arm}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const rows = [];
for (const policyId of POLICIES) {
  for (const seed of SEEDS) {
    try {
      const t = load(policyId, seed, 'treatment');
      const c = load(policyId, seed, 'control');
      rows.push({ policyId, seed, t, c });
    } catch (e) {
      console.log(`MISSING: ${policyId}-s${seed} (${e.message.slice(0, 60)})`);
    }
  }
}
if (!rows.length) { console.log('no complete pairs'); process.exit(1); }

const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const median = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

console.log(`== sim-apexhook pilot: treatment vs control (${rows.length} seed-pairs) ==`);

// PRIMARY: apex executions
const apexT = sum(rows.map(r => r.t.apexExecutions || 0));
const apexC = sum(rows.map(r => r.c.apexExecutions || 0));
console.log(`\nPRIMARY — apex trick executions (newly-hooked set): treatment=${apexT} control=${apexC}`);
console.log('apex tally (treatment):', JSON.stringify(rows.reduce((o, r) => {
  for (const [k, v] of Object.entries(r.t.apexTally || {})) o[k] = (o[k] || 0) + v;
  return o;
}, {})));
console.log('apex tricks known (mean/run): treatment=' +
  mean(rows.map(r => r.t.nApexTricksKnown || 0)).toFixed(2) +
  ' control=' + mean(rows.map(r => r.c.nApexTricksKnown || 0)).toFixed(2));

// Wall numbers
const natT = sum(rows.map(r => r.t.national)), natC = sum(rows.map(r => r.c.national));
const tabT = sum(rows.map(r => r.t.table)), tabC = sum(rows.map(r => r.c.table));
const wonT = sum(rows.map(r => r.t.won)), wonC = sum(rows.map(r => r.c.won));
const w4T = sum(rows.map(r => r.t.wave4Reached)), w4C = sum(rows.map(r => r.c.wave4Reached));
const w5T = sum(rows.map(r => r.t.wave5Reached)), w5C = sum(rows.map(r => r.c.wave5Reached));
console.log(`\nnational: treatment=${natT}/${rows.length} control=${natC}/${rows.length} (guardrail ≥ ${natC - 2})`);
console.log(`table: treatment=${tabT} control=${tabC}`);
console.log(`won: treatment=${wonT} control=${wonC}`);
console.log(`wave-4 reached: treatment=${w4T} control=${w4C}`);
console.log(`wave-5 reached: treatment=${w5T} control=${w5C}`);

// Survival
const daysT = rows.map(r => r.t.days), daysC = rows.map(r => r.c.days);
console.log(`\nmedian days: treatment=${median(daysT)} control=${median(daysC)} (guardrail ≥ ${median(daysC) - 10})`);
console.log(`max days: treatment=${Math.max(...daysT)} control=${Math.max(...daysC)}`);

// Death modes
const causesT = {}, causesC = {};
for (const r of rows) {
  for (const [k, v] of Object.entries(r.t.deathCauses || {})) causesT[k] = (causesT[k] || 0) + v;
  for (const [k, v] of Object.entries(r.c.deathCauses || {})) causesC[k] = (causesC[k] || 0) + v;
}
const newModes = Object.keys(causesT).filter(k => !causesC[k]);
console.log(`\ndeath modes treatment-only: ${newModes.length ? JSON.stringify(newModes) : 'none'}`);
console.log('top death causes (treatment):', JSON.stringify(Object.entries(causesT).sort((a, b) => b[1] - a[1]).slice(0, 8)));

// Verdict
console.log('\n== VERDICT ==');
const goApex = apexT >= 1;
const goNat = natT >= natC - 2;
const goMed = median(daysT) >= median(daysC) - 10;
const goModes = newModes.length === 0;
console.log(`apex executions ≥1: ${goApex ? 'GO' : 'NO-GO'} (${apexT})`);
console.log(`national guardrail: ${goNat ? 'GO' : 'NO-GO'} (${natT} ≥ ${natC - 2})`);
console.log(`median guardrail: ${goMed ? 'GO' : 'NO-GO'} (${median(daysT)} ≥ ${median(daysC) - 10})`);
console.log(`no new death mode: ${goModes ? 'GO' : 'NO-GO'}`);
console.log(`OVERALL: ${(goApex && goNat && goMed && goModes) ? 'GO' : 'NO-GO / KILL'}`);
