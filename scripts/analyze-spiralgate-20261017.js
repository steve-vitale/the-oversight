#!/usr/bin/env node
// scripts/analyze-spiralgate-20261017.js — adjudicate the sim-spiralgate-b
// sweep: paired control vs armed on identical seeds.
//
// Adjudication (binding pre-registration, evidence/2026-10-17/sim-spiralgate-b.md):
//   PRIMARY GO: 0 'spiral has started' beats at pre-gate positions on ARMED.
//   BLANK-EXISTENCE: CONTROL fires day-1..3 pre-gate spiral beats on >=4/16 runs.
//   GUARDRAILS: det-gate byte-identical per-dawn extHash armed vs control;
//     wall metrics identical (national/table/wins/exiled, median survival,
//     death-cause shares).
//
// Usage: node scripts/analyze-spiralgate-20261017.js \
//   evidence/2026-10-17/spiralgate-control.json evidence/2026-10-17/spiralgate-armed.json
'use strict';
const fs = require('fs');
const [controlPath, armedPath] = process.argv.slice(2);
if (!controlPath || !armedPath) { console.error('usage: analyze-spiralgate-20261017.js <control.json> <armed.json>'); process.exit(2); }
const C = JSON.parse(fs.readFileSync(controlPath, 'utf8')).perSeed;
const A = JSON.parse(fs.readFileSync(armedPath, 'utf8')).perSeed;
const key = p => `${p.policy}-s${p.seed}`;
const cmap = Object.fromEntries(C.map(p => [key(p), p]));
const amap = Object.fromEntries(A.map(p => [key(p), p]));
const keys = Object.keys(cmap).filter(k => amap[k]);

let fails = [];
function verdict(cond, name, extra) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) fails.push(name);
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

console.log('== PRIMARY: armed pre-gate spiral beats ==');
const armedPreGate = keys.reduce((t, k) => t + amap[k].spiral.preGateSpiralN, 0);
verdict(armedPreGate === 0, 'PRIMARY GO: 0 pre-gate spiral beats on ARMED', `observed=${armedPreGate}`);
const armedPostGate = keys.reduce((t, k) => t + amap[k].spiral.postGateSpiralN, 0);
const armedHonest = keys.reduce((t, k) => t + amap[k].spiral.preGateHonestN, 0);
console.log(`  INFO armed: postGateSpiralN=${armedPostGate} (alarm still fires when earned), preGateHonestN=${armedHonest} (first-tick honest framing)`);

console.log('== BLANK-EXISTENCE: control day-1..3 pre-gate spiral beats ==');
const ctrlDay13 = keys.filter(k => cmap[k].spiral.day13PreGateSpiralN > 0);
verdict(ctrlDay13.length >= 4, 'BLANK-EXISTENCE: >=4/16 control runs fire day-1..3 pre-gate spiral beats',
  `${ctrlDay13.length}/16 runs: ${ctrlDay13.slice(0, 8).join(', ')}`);
const ctrlPreGate = keys.reduce((t, k) => t + cmap[k].spiral.preGateSpiralN, 0);
console.log(`  INFO control: total pre-gate spiral beats=${ctrlPreGate} across ${keys.length} runs`);

console.log('== GUARDRAIL: det-gate byte-identical extHash (paired) ==');
// hashes live in the per-seed .hashes.json files next to the sweep outputs
const path = require('path');
let hashPairs = 0, hashDiffs = 0;
for (const k of keys) {
  const cp = path.join(path.dirname(controlPath), 'perseed-spiralgate', `${cmap[k].side}-${cmap[k].policy}-s${cmap[k].seed}.hashes.json`);
  const ap = path.join(path.dirname(armedPath), 'perseed-spiralgate', `${amap[k].side}-${amap[k].policy}-s${amap[k].seed}.hashes.json`);
  if (!fs.existsSync(cp) || !fs.existsSync(ap)) { console.log(`  SKIP hashes for ${k} (file missing)`); continue; }
  const ch = JSON.parse(fs.readFileSync(cp, 'utf8'));
  const ah = JSON.parse(fs.readFileSync(ap, 'utf8'));
  hashPairs++;
  const n = Math.min(ch.length, ah.length);
  for (let i = 0; i < n; i++) if (ch[i] !== ah[i]) hashDiffs++;
  if (ch.length !== ah.length) hashDiffs++;
}
verdict(hashPairs === keys.length && hashDiffs === 0,
  'DET-GATE: per-dawn extHash byte-identical armed vs control (voice-only)',
  `${hashPairs}/${keys.length} pairs compared, ${hashDiffs} differing entries`);

console.log('== GUARDRAIL: wall metrics identical (paired) ==');
const wall = (p, m) => m.reduce((t, k) => t + (p[k][m] ? 1 : 0), 0);
for (const m of ['national', 'table', 'wins', 'exiled', 'wave45']) {
  const c = keys.reduce((t, k) => t + cmap[k][m], 0);
  const a = keys.reduce((t, k) => t + amap[k][m], 0);
  verdict(c === a, `wall ${m} identical`, `control=${c} armed=${a}`);
}
const cMed = median(keys.map(k => cmap[k].gameDays)), aMed = median(keys.map(k => amap[k].gameDays));
verdict(cMed === aMed, 'median survival identical', `control=${cMed} armed=${aMed}`);
const cMax = Math.max(...keys.map(k => cmap[k].gameDays)), aMax = Math.max(...keys.map(k => amap[k].gameDays));
console.log(`  INFO max survival: control=${cMax} armed=${aMax}`);
const cDeaths = {}, aDeaths = {};
for (const k of keys) {
  for (const [d, n] of Object.entries(cmap[k].deaths || {})) cDeaths[d] = (cDeaths[d] || 0) + n;
  for (const [d, n] of Object.entries(amap[k].deaths || {})) aDeaths[d] = (aDeaths[d] || 0) + n;
}
const dKeys = new Set([...Object.keys(cDeaths), ...Object.keys(aDeaths)]);
let deathDiff = 0;
for (const d of dKeys) if ((cDeaths[d] || 0) !== (aDeaths[d] || 0)) deathDiff++;
verdict(deathDiff === 0, 'death-cause shares identical', deathDiff ? 'DIFF' : 'all equal');
console.log('  control deaths:', JSON.stringify(cDeaths));
console.log('  armed deaths:  ', JSON.stringify(aDeaths));

console.log(`\n${fails.length ? 'NO-GO' : 'GO'} — ${fails.length} failure(s)${fails.length ? ': ' + fails.join('; ') : ''}`);
process.exit(fails.length ? 1 : 0);
