#!/usr/bin/env node
// scripts/analyze-mergereval-20261017.js — adjudicates the sim-mergereval-b
// sweep against the pre-registered thresholds (evidence header, binding).
// Usage: node scripts/analyze-mergereval-20261017.js [windfall-threshold-kcal]
'use strict';
const fs = require('fs');
const path = require('path');
const THRESH = parseInt(process.argv[2] || '100000', 10); // pool-calibrated blank-existence bar (60d probe median 149,444)
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-mergereval');
const load = (side) => fs.readdirSync(path.join(DIR, side))
  .filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(DIR, side, f), 'utf8')));
const median = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const c = load('control'), a = load('armed');
console.log(`control n=${c.length}  armed n=${a.length}`);
const sum = (xs, k) => xs.reduce((t, x) => t + (x[k] || 0), 0);
console.log(`\n-- PRIMARY (binding): armed conservation |storedPhys - r| == 0 on every call`);
const armedBad = a.filter(x => ((x.consViol || 0) !== 0 || (x.consHits || 0) !== 0));
console.log(`  armed conservation clean on ${a.length - armedBad.length}/${a.length} runs${armedBad.length ? ' FAIL: ' + JSON.stringify(armedBad.map(x => [x.policyId, x.seed, x.consViol, x.consHits])) : ' — GO'}`);
const aAvoid = sum(a, 'windfall') + sum(a, 'evap');
console.log(`  armed revaluation AVOIDED (counterfactual vs legacy target): ${aAvoid} kcal over ${sum(a, 'surplusCalls')} calls; revalHits=${sum(a, 'revalHits')}`);
console.log(`  armed reval PERFORMED: 0 by construction (merge only joins 200-stacks)`);
console.log(`\n-- BLANK-EXISTENCE: median control (windfall+evap) >= ${THRESH} kcal`);
const ct = c.map(x => (x.windfall || 0) + (x.evap || 0));
const cmed = median(ct);
console.log(`  control totals: ${ct.join(', ')}`);
console.log(`  median=${cmed} >= ${THRESH}: ${cmed >= THRESH ? 'GO (blank bites)' : 'MISS (see metric review)'}`);
console.log(`\n-- guardrails (binding)`);
const cNat = sum(c, 'national'), aNat = sum(a, 'national');
console.log(`  national: control ${cNat}/16, armed ${aNat}/16 — ${aNat >= cNat - 2 ? 'GO' : 'MISS'} (need >= ${cNat - 2})`);
const cMed = median(c.map(x => x.gameDays || 0)), aMed = median(a.map(x => x.gameDays || 0));
console.log(`  median survival: control ${cMed}d, armed ${aMed}d — ${aMed >= cMed - 10 ? 'GO' : 'MISS'} (need >= ${cMed - 10})`);
const cStv = sum(c, 'starvedDays'), aStv = sum(a, 'starvedDays');
console.log(`  starvation days: control ${cStv}, armed ${aStv} — ${aStv <= cStv + 2 ? 'GO' : 'MISS'} (need <= ${cStv + 2})`);
const ck = {}, ak = {};
for (const x of c) for (const [k, n] of Object.entries(x.deaths || {})) ck[k] = (ck[k] || 0) + n;
for (const x of a) for (const [k, n] of Object.entries(x.deaths || {})) ak[k] = (ak[k] || 0) + n;
const newModes = Object.keys(ak).filter(k => ak[k] >= 2 && !ck[k]);
console.log(`  death causes control: ${JSON.stringify(ck)}`);
console.log(`  death causes armed:   ${JSON.stringify(ak)}`);
console.log(`  new death mode: ${newModes.length ? 'MISS ' + newModes.join(',') : 'none — GO'}`);
console.log(`\n-- wall numbers`);
for (const [lbl, xs] of [['control', c], ['armed', a]]) {
  console.log(`  ${lbl}: national=${sum(xs, 'national')}/16 table=${sum(xs, 'table')}/16 wins=${sum(xs, 'wins')}/16 exiled=${sum(xs, 'exiled')}/16 wave4=${sum(xs, 'wave4')}/16 wave5=${sum(xs, 'wave5')}/16 medianSurv=${median(xs.map(x => x.gameDays || 0))}d arc2=${sum(xs, 'arc2')}/16 vestsMax=${Math.max(...xs.map(x => x.maxVests || 0))} fourRealm=${sum(xs, 'fourRealm')}/16`);
}
