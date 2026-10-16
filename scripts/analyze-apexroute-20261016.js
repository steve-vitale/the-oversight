#!/usr/bin/env node
'use strict';
// analyze-apexroute-20261016.js — gate judge for the apexroute pilot sweep.
//
// Reads evidence/2026-10-16/perseed-apexroute/*.json and judges the
// pre-registered gates:
//   PRIMARY: Σ postInviteFieldExposure (FFS EXPEDITION + WILD-ENCOUNTER)
//     armed <= 0.70x control on identical seeds.
//   GUARDRAILS: national >= control-2; median survival >= control-10d;
//     no new death mode (armed deathFamilies keys ⊆ control keys);
//     forage kcal/run-day armed >= 0.80x control.
// Exit 0 + GO/NO-GO verdict; exit 3 on KILL (primary or guardrail miss).
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-apexroute');

function load() {
  const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}
function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const runs = load();
const byKey = {};
for (const r of runs) byKey[`${r.policyId};${r.side};${r.seed}`] = r;
const pairs = [];
for (const r of runs) {
  if (r.side !== 'control') continue;
  const a = byKey[`${r.policyId};armed;${r.seed}`];
  if (a) pairs.push([r, a]);
}

let cField = 0, aField = 0, cNat = 0, aNat = 0;
const cDays = [], aDays = [];
let cForage = 0, aForage = 0, cForageDays = 0, aForageDays = 0;
const cFams = {}, aFams = {};
const apexSum = { sights: 0, reroute: 0, sidestep: 0, heat: 0 };
let cW4 = 0, aW4 = 0, cTable = 0, aTable = 0, cStarv = 0, aStarv = 0;

console.log('pair (control → armed): fieldExp | nat | days | forageKcal/d');
for (const [c, a] of pairs) {
  cField += c.postInviteFieldExposure; aField += a.postInviteFieldExposure;
  cNat += c.national; aNat += a.national;
  cDays.push(c.gameDays); aDays.push(a.gameDays);
  cForage += c.forageKcal; aForage += a.forageKcal;
  cForageDays += c.gameDays; aForageDays += a.gameDays;
  cW4 += c.wave4; aW4 += a.wave4; cTable += c.table; aTable += a.table;
  cStarv += c.starvationDeaths; aStarv += a.starvationDeaths;
  for (const k of Object.keys(c.deathFamilies || {})) cFams[k] = (cFams[k] | 0) + c.deathFamilies[k];
  for (const k of Object.keys(a.deathFamilies || {})) aFams[k] = (aFams[k] | 0) + a.deathFamilies[k];
  for (const k of Object.keys(apexSum)) apexSum[k] += ((a.apexStats || {})[k] | 0);
  console.log(`  ${c.policyId}-s${c.seed}: ${c.postInviteFieldExposure}→${a.postInviteFieldExposure} | ` +
    `${c.national}→${a.national} | ${c.gameDays}→${a.gameDays} | ` +
    `${c.forageKcalPerDay.toFixed(1)}→${a.forageKcalPerDay.toFixed(1)}`);
}

const ratio = cField > 0 ? aField / cField : (aField === 0 ? 1 : Infinity);
const cMed = median(cDays), aMed = median(aDays);
const cFpd = cForageDays > 0 ? cForage / cForageDays : 0;
const aFpd = aForageDays > 0 ? aForage / aForageDays : 0;
const forageRatio = cFpd > 0 ? aFpd / cFpd : 1;
const newModes = Object.keys(aFams).filter(k => !(k in cFams));

console.log('\n--- PRIMARY ---');
console.log(`field-exposure deaths: control ${cField} → armed ${aField} = ${ratio.toFixed(3)} (GO needs <= 0.700)`);
console.log('\n--- GUARDRAILS ---');
console.log(`national: ${cNat} → ${aNat} (need >= ${cNat - 2})`);
console.log(`median survival: ${cMed}d → ${aMed}d (need >= ${cMed - 10}d)`);
console.log(`new death modes: ${newModes.length ? newModes.join(', ') : 'none'} (need none)`);
console.log(`forage kcal/day: ${cFpd.toFixed(1)} → ${aFpd.toFixed(1)} = ${forageRatio.toFixed(3)} (need >= 0.800)`);
console.log('\n--- SECONDARIES ---');
console.log(`wave4: ${cW4} → ${aW4} | table invites: ${cTable} → ${aTable} | starvation: ${cStarv} → ${aStarv}`);
console.log(`armed apexStats sums: ${JSON.stringify(apexSum)}`);

const goPrimary = ratio <= 0.70;
const goNat = aNat >= cNat - 2;
const goMed = aMed >= cMed - 10;
const goModes = newModes.length === 0;
const goForage = forageRatio >= 0.80;
const go = goPrimary && goNat && goMed && goModes && goForage;
console.log(`\nVERDICT: ${go ? 'GO' : 'KILL'} ` +
  `(primary ${goPrimary ? 'PASS' : 'FAIL'}; national ${goNat ? 'PASS' : 'FAIL'}; ` +
  `median ${goMed ? 'PASS' : 'FAIL'}; modes ${goModes ? 'PASS' : 'FAIL'}; forage ${goForage ? 'PASS' : 'FAIL'})`);
process.exit(go ? 0 : 3);
