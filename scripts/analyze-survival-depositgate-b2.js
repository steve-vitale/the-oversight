#!/usr/bin/env node
// analyze-survival-depositgate-b2.js — #799 higher-powered survival test.
//
// Reads sweep-b2-{control,armed}-{leadfeast,belongfeast}.json (32 fresh seeds
// 6001-6032 x 2 policies) and applies the pre-registered survival bar:
//   median survival armed >= control - 10d AND median paired diff
//   (armed-control) >= -10d, with no lopsided policy tail (belongfeast median
//   diff <= -30d while leadfeast >= 0 -> policy-interaction finding, not a pass).
// Also re-verifies the b-run primary on the fresh seeds (rot <= 0.85x,
// depositor-inflow <= 0.90x) and reports wall numbers.
'use strict';
const fs = require('fs');
const dir = process.argv[2] || 'evidence/2026-10-22/sweeps';
const L = f => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')).rows;
const med = a => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const inflow = e => { const c = e.chan || {}; return (e.shareKcal || 0) + (c.return || 0) + (c.bighaul || 0) + (e.tributeKcal || 0); };
const rot = e => (e.rotFresh || 0) + (e.rotPreserved || 0);

const out = { paired: [], byPolicy: {} };
for (const pol of ['leadfeast', 'belongfeast']) {
  const C = L(`sweep-b2-control-${pol}.json`), A = L(`sweep-b2-armed-${pol}.json`);
  const cBy = Object.fromEntries(C.map(r => [r.seed, r.end]));
  const diffs = [], cd = [], ad = [], cRot = [], aRot = [], cDays = [], aDays = [], cInf = [], aInf = [];
  const cNat = [], cWon = [], cWave = [], aNat = [], aWon = [], aWave = [];
  for (const { seed, end: a } of A) {
    const c = cBy[seed]; if (!c) continue;
    diffs.push(a.days - c.days); cd.push(c.days); ad.push(a.days);
    cRot.push(rot(c)); aRot.push(rot(a)); cDays.push(c.days); aDays.push(a.days);
    cInf.push(inflow(c)); aInf.push(inflow(a));
    cNat.push(c.nationalEnd ? 1 : 0); aNat.push(a.nationalEnd ? 1 : 0);
    cWon.push(c.won ? 1 : 0); aWon.push(a.won ? 1 : 0);
    cWave.push(c.maxWave || 0); aWave.push(a.maxWave || 0);
    out.paired.push({ policy: pol, seed, controlDays: c.days, armedDays: a.days, diff: a.days - c.days });
  }
  const sum = a => a.reduce((x, y) => x + y, 0);
  out.byPolicy[pol] = {
    n: diffs.length,
    medControl: med(cd), medArmed: med(ad), medDiff: med(diffs),
    meanDiff: +(sum(diffs) / diffs.length).toFixed(1),
    minDiff: Math.min(...diffs), maxDiff: Math.max(...diffs),
    rotRatio: +((sum(aRot) / sum(aDays)) / (sum(cRot) / sum(cDays))).toFixed(3),
    inflowRatio: +((sum(aInf) / sum(aDays)) / (sum(cInf) / sum(cDays))).toFixed(3),
    national: [sum(cNat), sum(aNat)], won: [sum(cWon), sum(aWon)],
    wave4: [cWave.filter(w => w >= 4).length, aWave.filter(w => w >= 4).length],
    wave5: [cWave.filter(w => w >= 5).length, aWave.filter(w => w >= 5).length],
    maxDays: [Math.max(...cd), Math.max(...ad)],
  };
}
console.log('=== #799 survival (32 fresh seeds x 2 policies) ===');
let pass = true;
for (const pol of ['leadfeast', 'belongfeast']) {
  const b = out.byPolicy[pol];
  console.log(`\n${pol}: n=${b.n} medControl=${b.medControl}d medArmed=${b.medArmed}d medDiff=${b.medDiff}d meanDiff=${b.meanDiff}d range=[${b.minDiff},${b.maxDiff}]`);
  console.log(`  primary re-verify: rot ${b.rotRatio}x (bar <=0.85) | inflow ${b.inflowRatio}x (bar <=0.90)`);
  console.log(`  wall: national ${b.national[0]}->${b.national[1]} won ${b.won[0]}->${b.won[1]} wave4 ${b.wave4[0]}->${b.wave4[1]} wave5 ${b.wave5[0]}->${b.wave5[1]} maxDays ${b.maxDays[0]}->${b.maxDays[1]}`);
  if (!(b.medArmed >= b.medControl - 10 && b.medDiff >= -10)) { console.log('  -> SURVIVAL BAR MISS'); pass = false; }
}
const bp = out.byPolicy;
if (bp.belongfeast.medDiff <= -30 && bp.leadfeast.medDiff >= 0)
  console.log('\nPOLICY-INTERACTION FLAG: belongfeast lopsided negative while leadfeast neutral/positive — finding, not a pass.');
// pooled
const allD = out.paired.map(p => p.diff);
console.log(`\nPOOLED: n=${allD.length} medDiff=${med(allD)}d meanDiff=${(allD.reduce((a,b)=>a+b,0)/allD.length).toFixed(1)}d`);
console.log(`\n#799 SURVIVAL BAR: ${pass ? 'HOLD' : 'MISS'}`);
const pj = `${dir}/survival-b2.json`;
fs.writeFileSync(pj, JSON.stringify(out, null, 1));
console.log('wrote ' + pj);
