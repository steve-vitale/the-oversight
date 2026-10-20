#!/usr/bin/env node
// scripts/analyze-shelltask-b2.js — pilot analysis for arm sim-shelltask-b2.
// Reads evidence/2026-10-20/perseed-shelltask-b2/*.json, prints before/after
// against the pre-registered GO thresholds (see evidence header).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.env.DIR || path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-shelltask-b2');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const by = (arm) => rows.filter(r => r.arm === arm);
const sum = (a, f) => a.reduce((t, r) => t + (f(r) || 0), 0);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

for (const arm of ['control', 'armed']) {
  const R = by(arm);
  console.log(`=== ${arm.toUpperCase()} (${R.length} runs) ===`);
  console.log(`  shellDays=${sum(R, r => r.shellDays)} shelledKcal=${sum(R, r => r.shelledKcal)} shelledKcalStarvDays=${sum(R, r => r.shelledKcalStarvDays)} shelledDayEatKcal=${sum(R, r => r.shelledDayEatKcal)}`);
  console.log(`  starvationDeaths=${sum(R, r => r.starvationDeaths)} playerStarvationDeaths=${sum(R, r => r.playerStarvationDeaths)} starvedDays=${sum(R, r => r.starvedDays)}`);
  console.log(`  national=${sum(R, r => r.national)}/${R.length} table=${sum(R, r => r.table)} wins=${sum(R, r => r.wins)} exiled=${sum(R, r => r.exiled)}`);
  console.log(`  wave4=${sum(R, r => r.wave4)} wave5=${sum(R, r => r.wave5)} arc2=${sum(R, r => r.arc2)} arc3=${sum(R, r => r.arc3)} arc4=${sum(R, r => r.arc4)} fourRealm=${sum(R, r => r.fourRealm)}`);
  console.log(`  medianSurvival=${med(R.map(r => r.gameDays))}d maxSurvival=${Math.max(...R.map(r => r.gameDays))}d`);
  console.log(`  scholarPantryTakesKcal=${sum(R, r => r.scholarPantryTakes)}`);
  const cc = {};
  for (const r of R) for (const [k, v] of Object.entries(r.causeCounts || {})) cc[k] = (cc[k] || 0) + v;
  const top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`  deaths: ${top}`);
  const err = sum(R, r => r.instrumentErrors);
  if (err) console.log(`  INSTRUMENT ERRORS: ${err}`);
}
const C = by('control'), A = by('armed');
// paired sign + displacement
let better = 0, worse = 0, tied = 0, disp = 0;
const pairLines = [];
for (const c of C) {
  const a = A.find(r => r.seed === c.seed && r.policyId === c.policyId);
  if (!a) continue;
  const d = (c.starvationDeaths || 0) - (a.starvationDeaths || 0);
  if (d > 0) better++; else if (d < 0) worse++; else tied++;
  const p = (c.scholarPantryTakes || 0) - (a.scholarPantryTakes || 0);
  disp += p;
  pairLines.push(`  s${c.seed} ${c.policyId}: starv c=${c.starvationDeaths}/a=${a.starvationDeaths} pantryTakes c=${c.scholarPantryTakes} a=${a.scholarPantryTakes} (disp ${p})`);
}
console.log('\n=== PAIRED (seed x policy) ===');
for (const l of pairLines) console.log(l);
console.log(`  starvation paired sign (armed better/worse/tied): ${better}/${worse}/${tied}`);
console.log(`  pantry displacement sum(control - armed scholar takes): ${disp} kcal (need >= 0)`);

console.log('\n=== GO VERDICT (pre-registered) ===');
const engA = sum(A, r => r.shelledKcal), engC = sum(C, r => r.shelledKcal);
const starvA = sum(A, r => r.shelledKcalStarvDays), starvC = sum(C, r => r.shelledKcalStarvDays);
const sdA = sum(A, r => r.starvationDeaths), sdC = sum(C, r => r.starvationDeaths);
const psdA = sum(A, r => r.playerStarvationDeaths), psdC = sum(C, r => r.playerStarvationDeaths);
const natA = sum(A, r => r.national), natC = sum(C, r => r.national);
const medA = med(A.map(r => r.gameDays)), medC = med(C.map(r => r.gameDays));
const errTot = sum(rows, r => r.instrumentErrors);
console.log(`  PRIMARY(a) engagement: armed shelledKcal=${engA} vs control=${engC} (need armed>0, control=0)`);
console.log(`  PRIMARY(b) shelled-and-eaten on starvation days: armed=${starvA} (need >=1000 across armed side)`);
console.log(`  STARVATION guardrail: armed=${sdA} <= control+2=${sdC + 2} ? ${sdA <= sdC + 2}  (player: ${psdA} vs ${psdC})`);
console.log(`  DISPLACEMENT guardrail: ${disp} >= 0 ? ${disp >= 0}`);
console.log(`  national guardrail: armed=${natA} >= control-2=${natC - 2} ? ${natA >= natC - 2}`);
console.log(`  median survival guardrail: armed=${medA}d >= control-10d=${medC - 10}d ? ${medA >= medC - 10}`);
const ccA = {}, ccC = {};
for (const r of A) for (const [k, v] of Object.entries(r.causeCounts || {})) ccA[k] = (ccA[k] || 0) + v;
for (const r of C) for (const [k, v] of Object.entries(r.causeCounts || {})) ccC[k] = (ccC[k] || 0) + v;
const newModes = Object.keys(ccA).filter(k => !(k in ccC));
console.log(`  new death modes armed-not-in-control: ${newModes.length ? newModes.map(k => k + ':' + ccA[k]).join(' ') : 'none'}`);
console.log(`  laundering: instrumentErrors=${errTot} (need 0)`);
const GO = engA > 0 && engC === 0 && starvA >= 1000
  && sdA <= sdC + 2 && disp >= 0
  && natA >= natC - 2 && medA >= medC - 10 && newModes.length === 0 && errTot === 0;
console.log(`\n  ==> ${GO ? 'GO' : 'NO-GO'}`);
