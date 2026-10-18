#!/usr/bin/env node
// scripts/analyze-shellrevive-b3.js — step-3/step-4 adjudication for the
// shelltask-b revival under the #520 base-frozen guardrail.
//
// Reads evidence/2026-10-18/perseed-shellrevive-b3/*.json (DIR overrideable),
// prints:
//   STEP 3: does the original harm signal reproduce?
//     (pooled armed starvation > control+2 -> HARM-CLASS REPRODUCED -> KILL)
//   STEP 4: revised-guardrail GO verdict:
//     (a) armed-side shelled kcal >= 30k, control = 0
//     (b) pooled starvation armed <= control+2, per-pair collapse-aware
//     (c) pantry-draw displacement (control - armed scholar takes) >= 0
//     (d) national >= control-2, median survival >= control-10d, no new death mode
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.env.DIR || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-shellrevive-b3');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const by = (arm) => rows.filter(r => r.arm === arm);
const sum = (a, f) => a.reduce((t, r) => t + (f(r) || 0), 0);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

const C = by('control'), A = by('armed');
console.log(`runs: control=${C.length} armed=${A.length}`);
for (const arm of ['control', 'armed']) {
  const R = by(arm);
  console.log(`=== ${arm.toUpperCase()} (${R.length} runs) ===`);
  console.log(`  shellDays=${sum(R, r => r.shellDays)} shelledKcal=${sum(R, r => r.shelledKcal)} shelledKcalStarvDays=${sum(R, r => r.shelledKcalStarvDays)} shelledDayEatKcal=${sum(R, r => r.shelledDayEatKcal)}`);
  console.log(`  starvationDeaths=${sum(R, r => r.starvationDeaths)} playerStarvationDeaths=${sum(R, r => r.playerStarvationDeaths)} starvedDays=${sum(R, r => r.starvedDays)}`);
  console.log(`  scholarPantryTakes=${sum(R, r => r.scholarPantryTakes)}`);
  console.log(`  national=${sum(R, r => r.national)}/${R.length} table=${sum(R, r => r.table)}/${R.length} wins=${sum(R, r => r.wins)} exiled=${sum(R, r => r.exiled)}`);
  console.log(`  wave4=${sum(R, r => r.wave4)} wave5=${sum(R, r => r.wave5)} arc2=${sum(R, r => r.arc2)} arc3=${sum(R, r => r.arc3)} arc4=${sum(R, r => r.arc4)} fourRealm=${sum(R, r => r.fourRealm)}`);
  console.log(`  medianSurvival=${med(R.map(r => r.gameDays))}d maxSurvival=${Math.max(...R.map(r => r.gameDays))}d`);
  const cc = {};
  for (const r of R) for (const [k, v] of Object.entries(r.causeCounts || {})) cc[k] = (cc[k] || 0) + v;
  console.log(`  deaths: ${Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(' ')}`);
}

// paired, collapse-aware starvation read
console.log('\n=== PAIRED STARVATION (control vs armed, identical seeds) ===');
const pairs = {};
for (const r of rows) {
  const k = `${r.policyId}-s${r.seed}`;
  (pairs[k] = pairs[k] || {})[r.arm] = r;
}
let better = 0, worse = 0, tied = 0;
for (const [k, p] of Object.entries(pairs)) {
  const c = (p.control || {}).starvationDeaths || 0, a = (p.armed || {}).starvationDeaths || 0;
  const d = a - c;
  if (d < 0) better++; else if (d > 0) worse++; else tied++;
  if (d !== 0) console.log(`  ${k}: control=${c} armed=${a} (d=${d > 0 ? '+' : ''}${d}) cDays=${(p.control || {}).gameDays} aDays=${(p.armed || {}).gameDays}`);
}
console.log(`  paired sign (armed better/worse/tied): ${better}/${worse}/${tied}`);

// pantry-draw displacement: sum over pairs of (control - armed)
let disp = 0, dispNulls = 0;
for (const [, p] of Object.entries(pairs)) {
  const c = p.control && p.control.scholarPantryTakes, a = p.armed && p.armed.scholarPantryTakes;
  if (c == null || a == null) { dispNulls++; continue; }
  disp += (c - a);
}
console.log(`\n  pantry-draw displacement (control-armed, scholar, kcal): ${disp} (nulls=${dispNulls})`);

const engA = sum(A, r => r.shelledKcal), engC = sum(C, r => r.shelledKcal);
const starvA = sum(A, r => r.starvationDeaths), starvC = sum(C, r => r.starvationDeaths);
const natA = sum(A, r => r.national), natC = sum(C, r => r.national);
const medA = med(A.map(r => r.gameDays)), medC = med(C.map(r => r.gameDays));
const ccA = {}, ccC = {};
for (const r of A) for (const [k, v] of Object.entries(r.causeCounts || {})) ccA[k] = (ccA[k] || 0) + v;
for (const r of C) for (const [k, v] of Object.entries(r.causeCounts || {})) ccC[k] = (ccC[k] || 0) + v;
const newModes = Object.keys(ccA).filter(k => !(k in ccC));

console.log('\n=== STEP 3 — HARM-SIGNAL REPRODUCTION ===');
console.log(`  pooled starvation: armed=${starvA} vs control=${starvC} (harm-class = armed > control+2 = ${starvC + 2})`);
const harmReproduced = starvA > starvC + 2;
console.log(`  ==> ${harmReproduced ? 'HARM-CLASS SIGNAL REPRODUCED -> KILL AGAIN per protocol' : 'no harm-class signal -> proceed to step 4'}`);

console.log('\n=== STEP 4 — REVISED-GUARDRAIL GO VERDICT ===');
const gA = engA >= 30000 && engC === 0;
const gB = starvA <= starvC + 2;
const gC = disp >= 0 && dispNulls === 0;
const gD1 = natA >= natC - 2, gD2 = medA >= medC - 10, gD3 = newModes.length === 0;
console.log(`  (a) engagement: armed shelledKcal=${engA} >= 30000 && control=${engC}==0 ? ${gA}`);
console.log(`  (b) starvation: armed=${starvA} <= control+2=${starvC + 2} ? ${gB}`);
console.log(`  (c) pantry displacement=${disp} >= 0 (no nulls) ? ${gC}`);
console.log(`  (d) national ${natA}>=${natC - 2} ? ${gD1}; median ${medA}d>=${medC - 10}d ? ${gD2}; new modes: ${newModes.length ? newModes.map(k => k + ':' + ccA[k]).join(' ') : 'none'} ? ${gD3}`);
const GO = !harmReproduced && gA && gB && gC && gD1 && gD2 && gD3;
console.log(`\n  ==> ${GO ? 'GO — land default-OFF layer' : 'NO-GO — kill zero-trace'}`);
