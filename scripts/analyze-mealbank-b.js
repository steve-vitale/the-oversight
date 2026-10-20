#!/usr/bin/env node
// analyze-mealbank-b.js — pilot analysis for the pack-banking discipline
// (arm sim-mealbank-b, run fleshout-loop-b-20261020T1630Z).
//
// Reads the 4 per-seed JSONs under evidence/2026-10-20/perseed-mealbank-b/,
// judges the pre-registered primary + guardrails (§14 binding), and prints
// the wall numbers + death-cause shares.
//
// Usage: node scripts/analyze-mealbank-b.js [perseed-dir]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || 'evidence/2026-10-20/perseed-mealbank-b';
function load(f) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  return j.rows || [];
}
const files = { 'armed-lead': 'armed-lead.json', 'armed-belong': 'armed-belong.json', 'control-lead': 'control-lead.json', 'control-belong': 'control-belong.json' };
const R = {};
for (const [k, f] of Object.entries(files)) R[k] = load(f);

const sum = (rows, fn) => rows.reduce((a, r) => a + fn(r.end), 0);
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };

const armed = [...R['armed-lead'], ...R['armed-belong']];
const control = [...R['control-lead'], ...R['control-belong']];

console.log(`n: armed=${armed.length} control=${control.length}`);

// ---- PRIMARY: scholar hungry-days ratio (armed/control) <= 0.75x ----
const hA = sum(armed, e => e.hungryDays), hC = sum(control, e => e.hungryDays);
const primary = hC > 0 ? hA / hC : (hA === 0 ? 0 : Infinity);
console.log(`\nPRIMARY hungry-days: armed=${hA} control=${hC} ratio=${primary.toFixed(3)} (GO iff <= 0.75) -> ${primary <= 0.75 ? 'GO' : 'NO-GO'}`);

// ---- GUARDRAILS ----
const sdA = sum(armed, e => e.starveDeaths), sdC = sum(control, e => e.starveDeaths);
const msA = med(armed.map(r => r.end.days)), msC = med(control.map(r => r.end.days));
const nA = sum(armed, e => e.national), nC = sum(control, e => e.national);
const pdA = sum(armed, e => e.scholarDeaths), pdC = sum(control, e => e.scholarDeaths);
console.log('\nGUARDRAILS:');
console.log(`  starvation deaths: armed=${sdA} control=${sdC} (need <= control+2=${sdC + 2}) -> ${sdA <= sdC + 2 ? 'PASS' : 'MISS'}`);
console.log(`  median survival: armed=${msA}d control=${msC}d (need >= control-10=${msC - 10}) -> ${msA >= msC - 10 ? 'PASS' : 'MISS'}`);
console.log(`  national: armed=${nA} control=${nC} (need >= control-2=${nC - 2}) -> ${nA >= nC - 2 ? 'PASS' : 'MISS'}`);
console.log(`  scholar deaths: armed=${pdA} control=${pdC} (report; need <= control+2=${pdC + 2}) -> ${pdA <= pdC + 2 ? 'PASS' : 'MISS'}`);

// new death mechanisms: causes present armed but absent control
const causesA = {}, causesC = {};
for (const r of armed) for (const [k, v] of Object.entries(r.end.deaths || {})) causesA[k] = (causesA[k] || 0) + v;
for (const r of control) for (const [k, v] of Object.entries(r.end.deaths || {})) causesC[k] = (causesC[k] || 0) + v;
const newCauses = Object.keys(causesA).filter(k => !causesC[k]);
console.log(`  new death mechanisms (armed-only causes): ${newCauses.length ? newCauses.map(k => `${k}(${causesA[k]})`).join(', ') : 'none'} -> ${newCauses.length ? 'TRIAGE' : 'PASS'}`);

// ---- mechanism ----
const refA = sum(armed, e => (e.mealbank || {}).refused || 0);
const refDaysA = sum(armed, e => (e.mealbank || {}).refuseDays || 0);
const voicedA = sum(armed, e => (e.mealbank || {}).voicedDays || 0);
const bankSumA = sum(armed, e => (e.mealbank || {}).bankSum || 0);
console.log(`\nMECHANISM (armed): refused takes=${refA} refuse-days=${refDaysA} voiced-days=${voicedA} bank-at-refuse=${Math.round(bankSumA / 1000)}k kcal`);

// ---- wall numbers ----
function wall(rows, tag) {
  const n = rows.length;
  const s = (fn) => sum(rows, fn);
  console.log(`\nWALL ${tag} (n=${n}): won=${s(e => e.won ? 1 : 0)}/${n} national=${s(e => e.national)}/${n} table=${s(e => e.table)}/${n} ` +
    `wave4=${s(e => e.wave4)}/${n} wave5=${s(e => e.wave5)}/${n} arc4+=${s(e => e.arc >= 4 ? 1 : 0)}/${n} ` +
    `median=${med(rows.map(r => r.end.days))}d max=${Math.max(...rows.map(r => r.end.days))}d`);
}
wall(armed, 'armed'); wall(control, 'control');

// ---- death-cause shares ----
function causeShares(rows, tag) {
  const tot = {};
  let all = 0;
  for (const r of rows) for (const [k, v] of Object.entries(r.end.deaths || {})) { tot[k] = (tot[k] || 0) + v; all += v; }
  const top = Object.entries(tot).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`\nDEATH CAUSES ${tag} (${all} deaths): ` + top.map(([k, v]) => `${k}:${v}(${(100 * v / all).toFixed(0)}%)`).join(' '));
}
causeShares(armed, 'armed'); causeShares(control, 'control');

// per-policy primary split (heterogeneity read, not a re-score)
for (const p of ['lead', 'belong']) {
  const a = R['armed-' + p], c = R['control-' + p];
  const ha = sum(a, e => e.hungryDays), hc = sum(c, e => e.hungryDays);
  console.log(`  ${p}: hungry ${ha}/${hc} = ${hc ? (ha / hc).toFixed(2) : 'n/a'}x | median ${med(a.map(r => r.end.days))}d/${med(c.map(r => r.end.days))}d`);
}

// verdict line
const verdict = (primary <= 0.75) && sdA <= sdC + 2 && msA >= msC - 10 && nA >= nC - 2 && pdA <= pdC + 2 && newCauses.length === 0;
console.log(`\nVERDICT: ${verdict ? 'pilot GO — confirm named for a later run' : 'pilot NO-GO — kill protocol'}`);
