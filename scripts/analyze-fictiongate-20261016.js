#!/usr/bin/env node
// scripts/analyze-fictiongate-20261016.js — armed-vs-control comparison for
// the sim-fictiongate-b sweep (loop B, 2026-10-16, food-economy axis).
//
// Reads the per-seed JSONs from the control and armed sweep invocations and
// judges the pre-registered PRIMARY + guardrails:
//
//   PRIMARY (binding): 0 firings of the honest "I know why" journal line on
//     a clean dated ledger (voluntaryNet7 >= 0) across the armed sweep.
//     GO: 100% gated — every clean-ledger journal firing voices the
//     meal-aware line; every honest-ledger (voluntaryNet7 < 0) journal
//     firing voices the honest line.
//   G1 (binding): per-dawn extended trajectory hashes byte-identical
//     armed vs control on all 16 pairs (voice-only must not move mechanics).
//   G2 (binding): stage-transition sequences identical armed vs control.
//   G3 (binding): no crash (all runs ended with an endReason), instrument
//     recon clean, zero instrument errors, on both sides.
//   Informational: half-ration rate per day-alive (#384) armed vs control;
//     wall metrics; death-cause shares.
//
// Usage:
//   node scripts/analyze-fictiongate-20261016.js \
//     <control-perseed-dir> <armed-perseed-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const { HONEST_LINE, MEAL_LINE } = require('./test-fictiongate-20261016');

const [ctlDir, armDir] = process.argv.slice(2);
if (!ctlDir || !armDir) { console.error('usage: analyze-fictiongate-20261016.js <control-dir> <armed-dir>'); process.exit(2); }

function load(dir, side) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(new RegExp(`^${side}-(leadfeast|belongfeast)-s(\\d+)\\.json$`));
    if (!m) continue;
    const key = `${m[1]}-s${m[2]}`;
    out[key] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
function loadHashes(dir, side) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(new RegExp(`^${side}-(leadfeast|belongfeast)-s(\\d+)\\.hashes\\.json$`));
    if (!m) continue;
    out[`${m[1]}-s${m[2]}`] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}

const ctl = load(ctlDir, 'control'), arm = load(armDir, 'armed');
const ctlH = loadHashes(ctlDir, 'control'), armH = loadHashes(armDir, 'armed');
const keys = Object.keys(ctl).sort();
let fails = [];
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
};

console.log(`pairs: ${keys.length} (control ${Object.keys(ctl).length}, armed ${Object.keys(arm).length})`);

// ---- PRIMARY: the gate on the armed side (voiced journal lines only) ----
let nJournal = 0, nClean = 0, nHonestLedger = 0, honestOnClean = 0, mealOnHonest = 0, unknown = 0;
const mismatches = [];
for (const k of keys) {
  const r = arm[k];
  if (!r) { mismatches.push(k + ': missing armed run'); continue; }
  for (const f of (r.firings || [])) {
    if (!f.journalVoiced) continue; // deduped call: the line never voiced
    nJournal++;
    const jt = f.journalText;
    const clean = typeof f.voluntaryNet7 === 'number' && f.voluntaryNet7 >= 0;
    if (clean) nClean++; else nHonestLedger++;
    if (jt === HONEST_LINE && clean) { honestOnClean++; mismatches.push(`${k} d${f.day}: HONEST on clean ledger (vn7=${f.voluntaryNet7})`); }
    else if (jt === MEAL_LINE && !clean) { mealOnHonest++; mismatches.push(`${k} d${f.day}: MEAL-AWARE on honest ledger (vn7=${f.voluntaryNet7})`); }
    else if (jt !== HONEST_LINE && jt !== MEAL_LINE) { unknown++; mismatches.push(`${k} d${f.day}: UNKNOWN text`); }
  }
}
console.log(`armed journal firings: ${nJournal} (clean-ledger ${nClean}, honest-ledger ${nHonestLedger})`);
for (const m of mismatches) console.log('    MISMATCH: ' + m);
check('PRIMARY: 0 honest-line firings on a clean dated ledger', honestOnClean === 0, `${honestOnClean} violations`);
check('PRIMARY: every clean-ledger firing is meal-aware', nClean > 0 && mismatches.filter(m => /MEAL-AWARE on honest/.test(m)).length === 0 && honestOnClean === 0, `${nClean} clean firings`);
check('PRIMARY: every honest-ledger firing keeps the honest line', nHonestLedger > 0 && mealOnHonest === 0 && unknown === 0,
  `${nHonestLedger} honest-ledger firings, ${mealOnHonest} meal-on-honest, ${unknown} unknown`);

// ---- G1: per-dawn trajectory hashes byte-identical ----
let hashPairs = 0, hashDivergent = 0;
const hashDiv = [];
for (const k of keys) {
  const a = ctlH[k], b = armH[k];
  if (!a || !b) { hashDiv.push(k + ': missing hashes'); hashDivergent++; continue; }
  hashPairs++;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      hashDivergent++;
      hashDiv.push(`${k} dawn[${i}]: control=${a[i]} armed=${b[i]}`);
      break; // one report per pair; the point is binary
    }
  }
}
for (const d of hashDiv) console.log('    HASHDIV: ' + d);
check('G1: per-dawn trajectory hashes byte-identical (16/16 pairs)', hashPairs === 16 && hashDivergent === 0,
  `${hashPairs - hashDivergent}/${hashPairs} identical`);

// ---- G2: stage-transition sequences identical ----
let stageDiv = 0;
for (const k of keys) {
  const a = JSON.stringify((ctl[k] && ctl[k].stageEvents) || []);
  const b = JSON.stringify((arm[k] && arm[k].stageEvents) || []);
  if (a !== b) { stageDiv++; console.log(`    STAGEDIV ${k}: control=${a} armed=${b}`); }
}
check('G2: stage-transition sequences identical', stageDiv === 0, `${16 - stageDiv}/16 identical`);

// ---- G3: completion + instrument honesty ----
let crash = 0, reconBad = 0, instrBad = 0;
for (const k of keys) {
  for (const [side, r] of [['control', ctl[k]], ['armed', arm[k]]]) {
    if (!r || !r.endReason) { crash++; console.log(`    CRASH: ${side} ${k}`); continue; }
    if (!r.recon || r.recon.tr7Mismatch !== 0) { reconBad++; console.log(`    RECON: ${side} ${k} tr7Mismatch=${r.recon && r.recon.tr7Mismatch}`); }
    if ((r.instrErrors || []).length) { instrBad++; console.log(`    INSTR: ${side} ${k}: ${(r.instrErrors || []).join('; ').slice(0, 200)}`); }
  }
}
check('G3: all 32 runs completed, recon clean, zero instrument errors',
  crash === 0 && reconBad === 0 && instrBad === 0, `crash=${crash} reconBad=${reconBad} instrBad=${instrBad}`);

// ---- informational: half-ration rate (#384), wall metrics ----
console.log('\ninformational — half-ration rate per day-alive (#384):');
for (const k of keys) {
  console.log(`  ${k}: control=${ctl[k].halfRationRate} armed=${arm[k].halfRationRate}`);
}
const agg = (runs, f) => runs.reduce((s, r) => s + (f(r) || 0), 0);
const cRuns = keys.map(k => ctl[k]), aRuns = keys.map(k => arm[k]);
console.log('\ninformational — wall metrics (control vs armed):');
for (const [label, f] of [['national', r => r.national], ['table', r => r.table], ['wins', r => r.wins],
    ['exiled', r => r.exiled], ['wave>=4', r => (r.maxWave >= 4 ? 1 : 0)], ['wave5', r => (r.maxWave >= 5 ? 1 : 0)]]) {
  console.log(`  ${label}: ${agg(cRuns, f)}/${cRuns.length} vs ${agg(aRuns, f)}/${aRuns.length}`);
}
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
console.log(`  median survival: ${med(cRuns.map(r => r.days))}d vs ${med(aRuns.map(r => r.days))}d`);
console.log(`  cold-shoulder firings (say-level): ${agg(cRuns, r => r.nFirings)} vs ${agg(aRuns, r => r.nFirings)}`);
const deathAgg = (runs) => { const d = {}; for (const r of runs) for (const [k, v] of Object.entries(r.deaths || {})) d[k] = (d[k] || 0) + v; return d; };
console.log('  deaths control:', JSON.stringify(deathAgg(cRuns)));
console.log('  deaths armed:  ', JSON.stringify(deathAgg(aRuns)));

console.log(fails.length ? `\nANALYZER: NO-GO — ${fails.join('; ')}` : '\nANALYZER: GO — primary + all guardrails hold');
process.exit(fails.length ? 1 : 0);
