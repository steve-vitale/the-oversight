#!/usr/bin/env node
// scripts/analyze-snarecatch-b.js — GO adjudication for the sim-snarecatch-b
// pilot (MEASUREMENT.md §14). Reads the before/after per-seed JSONs from
// scripts/sweep-snarecatch-b.js and judges against the pre-registered
// header in evidence/2026-10-19/sim-snarecatch-b.md.
//
// Usage: node scripts/analyze-snarecatch-b.js
//   <before-dir> <after-dir>
'use strict';
const fs = require('fs');
const path = require('path');

const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) { console.error('usage: analyze-snarecatch-b.js <before-dir> <after-dir>'); process.exit(2); }

const load = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
const B = load(beforeDir), A = load(afterDir);
const key = (r) => r.policy + '-s' + r.seed;
const bmap = new Map(B.rows.map(r => [key(r), r]));

console.log('=== sim-snarecatch-b PILOT ADJUDICATION ===');
console.log(`before: ${beforeDir}  after: ${afterDir}\n`);

let armedN = 0, ctrlN = 0, armedLearn = 0, ctrlLearn = 0, armedAttr = 0;
let ctrlSurv = [], armedSurv = [], ctrlStarv = 0, armedStarv = 0;
const ctrlDeathCauses = new Set(), armedDeathCauses = {};
let detgateOk = true, detgatePairs = 0;
const perSeed = [];

for (const a of A.rows) {
  const b = bmap.get(key(a));
  if (!b) { console.log('  WARN no before pair for ' + key(a)); continue; }
  armedN++; ctrlN++;
  if (b.snareLearnDay != null) ctrlLearn++;
  if (a.snareLearnDay != null) armedLearn++;
  if (a.snareLearnAttributed) armedAttr++;
  ctrlSurv.push(b.days); armedSurv.push(a.days);
  ctrlStarv += b.starved; armedStarv += a.starved;
  for (const d of b.deaths) ctrlDeathCauses.add(String(d.cause));
  for (const d of a.deaths) { const k = String(d.cause); armedDeathCauses[k] = (armedDeathCauses[k] || 0) + 1; }
  perSeed.push({ key: key(a), knowers0: a.knowers0, bLearn: b.snareLearnDay, bVia: b.snareLearnVia, aLearn: a.snareLearnDay, aVia: a.snareLearnVia, attr: a.snareLearnAttributed, bDays: b.days, aDays: a.days });
  // DET-GATE: no-knower pairs must be bit-identical (hook cannot fire; no RNG consumed).
  if (a.knowers0 === 0 && b.knowers0 === 0) {
    detgatePairs++;
    const strip = (r) => { const c = Object.assign({}, r); delete c.label; return c; };
    if (JSON.stringify(strip(a)) !== JSON.stringify(strip(b))) { detgateOk = false; console.log('  DET-GATE DIVERGENCE on ' + key(a)); }
  }
}

const med = (vs) => { vs = vs.slice().sort((x, y) => x - y); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
const ctrlMed = med(ctrlSurv), armedMed = med(armedSurv);

console.log('--- per-seed (knowers0, before learn, after learn, attributed, survival b→a) ---');
for (const p of perSeed) console.log(`  ${p.key} k0=${p.knowers0} learn ${p.bLearn}(${p.bVia}) → ${p.aLearn}(${p.aVia}) attr=${p.attr} surv ${p.bDays}→${p.aDays}`);

console.log('\n--- GO adjudication (pre-registered) ---');
const goRate = (armedLearn >= ctrlLearn + 2) && (armedLearn >= 5);
const goAttr = armedAttr >= 2;
console.log(`  primary: armed learn ${armedLearn}/${armedN} vs control ${ctrlLearn}/${ctrlN}; attributed ${armedAttr}`);
console.log(`    GO bar: armed ≥ control+2 AND ≥5/16 with ≥2 attributed → ${goRate && goAttr ? 'PASS' : 'MISS'}`);
console.log(`  guardrail survival: armed median ${armedMed} vs control ${ctrlMed} (bar ≥ control−10) → ${armedMed >= ctrlMed - 10 ? 'PASS' : 'MISS'}`);
console.log(`  guardrail starvation: armed ${armedStarv} vs control ${ctrlStarv} (bar ≤ control+1) → ${armedStarv <= ctrlStarv + 1 ? 'PASS' : 'MISS'}`);
const newModes = Object.keys(armedDeathCauses).filter(k => !ctrlDeathCauses.has(k) && armedDeathCauses[k] >= 2);
console.log(`  guardrail death modes: new modes on ≥2 armed runs: ${newModes.length ? newModes.join(', ') : 'none'} → ${newModes.length ? 'INVESTIGATE' : 'PASS'}`);
console.log(`  det-gate: ${detgatePairs} no-knower pairs, bit-identical → ${detgateOk ? 'PASS' : 'FAIL'}`);

const verdict = (goRate && goAttr) ? 'GO' : 'NO-GO';
console.log(`\nVERDICT: ${verdict}`);
console.log('\n--- scale wall (before → after) ---');
console.log(`  national ${B.summary.national} → ${A.summary.national}; table ${B.summary.table} → ${A.summary.table}; wins ${B.summary.wins} → ${A.summary.wins}`);
console.log(`  waveMax ${B.summary.waveMax} → ${A.summary.waveMax}; wave4 ${B.summary.wave4} → ${A.summary.wave4}; wave5 ${B.summary.wave5} → ${A.summary.wave5}`);
console.log(`  learnVias ${JSON.stringify(B.summary.learnVias)} → ${JSON.stringify(A.summary.learnVias)}`);
console.log(`  npcTrap ${B.summary.npcTrap}/${B.summary.npcTrapCaught} → ${A.summary.npcTrap}/${A.summary.npcTrapCaught}; snareCatchLearns 0 → ${A.summary.snareCatchLearns}`);
