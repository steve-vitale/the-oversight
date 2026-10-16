#!/usr/bin/env node
'use strict';
// analyze-crisistier-20261016.js — verdict analyzer for the sim-crisistier
// sweep (finding #420: raid crisis tier always wave 1).
//
// Binding guardrails (pre-registered): national >= control-2,
// median survival (gameDays) >= control-10d, no new death mode.
// The binding PRIMARY is the proof (tier attribution 100% correct on
// wave-4/5 probe raids); this sweep measures only the guardrails.
// Reports the wall numbers (national / table / wins, wave-4/5 unlocks,
// median survival) every run.
//
// Run: node scripts/analyze-crisistier-20261016.js
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-crisistier');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
const armed = rows.filter(r => r.armed);
const control = rows.filter(r => !r.armed);

function pair(a, c) {
  return a.map(x => {
    const y = c.find(z => z.seed === x.seed && z.policyId === x.policyId);
    return { seed: x.seed, policy: x.policyId, a: x, c: y };
  });
}
const pairs = pair(armed, control);
const missing = pairs.filter(p => !p.c);
if (missing.length) { console.error('MISSING pairs:', missing.map(p => `${p.policy}-s${p.seed}`).join(', ')); process.exit(1); }
console.log(`pairs: ${pairs.length} (armed ${armed.length}, control ${control.length})`);

const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = (rs, k) => { const v = rs.map(r => r[k] || 0).sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };

const natA = sum(armed, 'national'), natC = sum(control, 'national');
const tabA = sum(armed, 'table'), tabC = sum(control, 'table');
const winA = sum(armed, 'wins'), winC = sum(control, 'wins');
const exA = sum(armed, 'exiled'), exC = sum(control, 'exiled');
const w45A = sum(armed, 'wave45'), w45C = sum(control, 'wave45');
const medA = med(armed, 'gameDays'), medC = med(control, 'gameDays');
const maxA = Math.max(...armed.map(r => r.gameDays || 0)), maxC = Math.max(...control.map(r => r.gameDays || 0));

console.log('\n--- wall numbers ---');
console.log(`national : armed ${natA}/${armed.length}  control ${natC}/${control.length}`);
console.log(`table    : armed ${tabA}/${armed.length}  control ${tabC}/${control.length}`);
console.log(`wins     : armed ${winA}/${armed.length}  control ${winC}/${control.length}`);
console.log(`exiled   : armed ${exA}/${armed.length}  control ${exC}/${control.length}`);
console.log(`wave4-5 unlocks: armed ${w45A}/${armed.length}  control ${w45C}/${control.length}`);
console.log(`median survival: armed ${medA}d  control ${medC}d`);
console.log(`max survival   : armed ${maxA}d  control ${maxC}d`);

// trajectory-identity check: the fix is behavior-neutral when aid is never
// called (leadfeast/belongfeast never callForHelp), so paired runs SHOULD be
// byte-identical on the wall metrics and death counts.
let identicalPairs = 0;
for (const p of pairs) {
  const keys = ['won', 'national', 'table', 'exiled', 'wave45', 'nDeaths', 'gameDays', 'endReason'];
  if (keys.every(k => JSON.stringify(p.a[k]) === JSON.stringify(p.c[k]))) identicalPairs++;
}
console.log(`\npaired-metric-identical: ${identicalPairs}/${pairs.length} pairs`);

console.log('\n--- guardrails ---');
const g1 = natA >= natC - 2;
console.log(`national >= control-2: ${natA} >= ${natC - 2} -> ${g1 ? 'PASS' : 'FAIL'}`);
const g2 = medA >= medC - 10;
console.log(`median survival >= control-10d: ${medA} >= ${medC - 10} -> ${g2 ? 'PASS' : 'FAIL'}`);
// no new death mode: armed-only cause strings, investigated not just counted
const causesA = {}, causesC = {};
for (const r of armed) for (const [c, n] of Object.entries(r.causeCounts || {})) causesA[c] = (causesA[c] || 0) + n;
for (const r of control) for (const [c, n] of Object.entries(r.causeCounts || {})) causesC[c] = (causesC[c] || 0) + n;
const armedOnly = Object.keys(causesA).filter(c => !causesC[c]);
const controlOnly = Object.keys(causesC).filter(c => !causesA[c]);
console.log(`distinct death-cause strings: armed ${Object.keys(causesA).length}, control ${Object.keys(causesC).length}`);
console.log(`armed-only causes: ${armedOnly.length ? armedOnly.map(c => `${c}(${causesA[c]})`).join(', ') : 'none'}`);
console.log(`control-only causes: ${controlOnly.length ? controlOnly.map(c => `${c}(${causesC[c]})`).join(', ') : 'none'}`);
const g3 = armedOnly.length === 0;
console.log(`no new death mode: ${g3 ? 'PASS' : 'INVESTIGATE (see above)'}`);

// per-pair sign table (compact)
console.log('\n--- per-pair (national / days) ---');
for (const p of pairs) {
  const flag = (p.a.national !== p.c.national || Math.abs((p.a.gameDays || 0) - (p.c.gameDays || 0)) > 0) ? '  <-- DIFF' : '';
  console.log(`  ${p.policy} s${p.seed}: armed nat=${p.a.national} d=${p.a.gameDays} ${p.a.endReason} | control nat=${p.c.national} d=${p.c.gameDays} ${p.c.endReason}${flag}`);
}

const verdict = (g1 && g2 && g3) ? 'GUARDRAILS HOLD' : 'GUARDRAIL BREACH';
console.log(`\nverdict: ${verdict}`);
if (!(g1 && g2 && g3)) process.exit(1);
