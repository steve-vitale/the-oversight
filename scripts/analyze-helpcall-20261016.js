#!/usr/bin/env node
'use strict';
// analyze-helpcall-20261016.js — verdict analyzer for the sim-helpcall arm.
//
// Pre-registered (binding):
//   PRIMARY (diagnostic GO): >=1 aid engagement (accepted help leading to
//     aid arrival, OR refusal with attributed reason) on called apex raids,
//     with 100% attribution of every help call placed.
//   SECONDARY (lever read): post-invite raid-attributed deaths armed vs
//     control.
//   Guardrails: no new death mode (aid-runner road deaths are an
//     engine-existing mode the arm engages — counted separately);
//     national >= control-2; median survival >= control-10d; no aid errors.
//
// Reports the wall numbers (national / table / wins, wave 4-5 unlocks,
// median survival) every run.
//
// Run: node scripts/analyze-helpcall-20261016.js
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-helpcall');

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
const mean = (rs, k) => rs.length ? rs.reduce((t, r) => t + (r[k] || 0), 0) / rs.length : 0;

console.log('\n--- wall numbers ---');
console.log(`national : armed ${sum(armed, 'national')}/${armed.length}  control ${sum(control, 'national')}/${control.length}`);
console.log(`table    : armed ${sum(armed, 'table')}/${armed.length}  control ${sum(control, 'table')}/${control.length}`);
console.log(`wins     : armed ${sum(armed, 'wins')}/${armed.length}  control ${sum(control, 'wins')}/${control.length}`);
console.log(`exiled   : armed ${sum(armed, 'exiled')}/${armed.length}  control ${sum(control, 'exiled')}/${control.length}`);
console.log(`wave4-5 unlocks: armed ${sum(armed, 'wave45')}/${armed.length}  control ${sum(control, 'wave45')}/${control.length}`);
console.log(`median survival: armed ${med(armed, 'gameDays')}d  control ${med(control, 'gameDays')}d`);
console.log(`max survival   : armed ${Math.max(...armed.map(r => r.gameDays || 0))}d  control ${Math.max(...control.map(r => r.gameDays || 0))}d`);

// --- PRIMARY: aid engagement with 100% attribution ---
let nPlace = 0, unattributed = 0, enRoute = 0, accepted = 0, refused = 0, arrived = 0, arrivedParty = 0, errors = 0;
const retCounts = {}, verdictCounts = {};
for (const r of armed) {
  const h = r.hc || {};
  nPlace += h.placements || 0;
  unattributed += h.unattributed || 0;
  enRoute += h.enRoute || 0;
  accepted += h.accepted || 0;
  refused += h.refused || 0;
  arrived += h.aidArrived || 0;
  arrivedParty += h.aidArrivedParty || 0;
  errors += h.errors || 0;
  for (const [k, v] of Object.entries(h.retCounts || {})) retCounts[k] = (retCounts[k] || 0) + v;
  for (const [k, v] of Object.entries(h.verdictCounts || {})) verdictCounts[k] = (verdictCounts[k] || 0) + v;
}
console.log('\n--- PRIMARY: help-call placements & attribution (armed only) ---');
console.log(`placements: ${nPlace}`);
console.log(`  engine returns: ${JSON.stringify(retCounts)}`);
console.log(`  verdicts: ${JSON.stringify(verdictCounts)}`);
console.log(`  accepted=${accepted} refused=${refused} aidArrived(parties)=${arrived} aidArrived(fighters)=${arrivedParty} enRouteAtRunEnd=${enRoute}`);
console.log(`  unattributed placements: ${unattributed}  (must be 0 for 100% attribution)`);
console.log(`  aid-system errors: ${errors}  (guardrail: 0)`);
const engagements = arrived + refused;
console.log(`PRIMARY GO (>=1 engagement with full attribution): ${engagements >= 1 && unattributed === 0 ? 'GO' : 'NO-GO'} (engagements=${engagements})`);

// --- SECONDARY: raid-attributed deaths ---
console.log('\n--- SECONDARY: raid-attributed deaths (engine markers) ---');
console.log(`raid deaths: armed ${sum(armed, 'raidDeaths')} (mean ${mean(armed, 'raidDeaths').toFixed(2)}/run)  control ${sum(control, 'raidDeaths')} (mean ${mean(control, 'raidDeaths').toFixed(2)}/run)`);
console.log(`aid-runner road deaths: armed ${sum(armed, 'aidRunnerDeaths')}  control ${sum(control, 'aidRunnerDeaths')}`);
const rdCause = {};
for (const r of armed) for (const [k, v] of Object.entries(r.raidDeathCauses || {})) rdCause[k] = (rdCause[k] || 0) + v;
console.log(`  armed raid-death causes: ${JSON.stringify(rdCause)}`);

// --- Guardrails: death modes ---
const causesA = new Set(), causesC = new Set();
for (const r of armed) for (const k of Object.keys(r.causeCounts || {})) causesA.add(k);
for (const r of control) for (const k of Object.keys(r.causeCounts || {})) causesC.add(k);
const newModes = [...causesA].filter(k => !causesC.has(k));
console.log('\n--- guardrails ---');
console.log(`new death modes in armed vs control: ${newModes.length ? newModes.join(', ') : 'none'}`);
console.log(`national guardrail (>= control-2): ${sum(armed, 'national') >= sum(control, 'national') - 2 ? 'HOLD' : 'VIOLATED'}`);
console.log(`median-survival guardrail (>= control-10d): ${med(armed, 'gameDays') >= med(control, 'gameDays') - 10 ? 'HOLD' : 'VIOLATED'}`);

// Death-cause shares (top).
function shares(rs) {
  const t = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.causeCounts || {})) t[k] = (t[k] || 0) + v;
  const tot = Object.values(t).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}(${(100 * v / tot).toFixed(0)}%)`).join(' ');
}
console.log(`\ndeath shares armed  : ${shares(armed)}`);
console.log(`death shares control: ${shares(control)}`);

// Paired raid-death deltas.
console.log('\npaired raidDeaths (armed-control) per seed/policy:');
for (const p of pairs) {
  const d = (p.a.raidDeaths || 0) - (p.c.raidDeaths || 0);
  console.log(`  s${p.seed} ${p.policy}: armed=${p.a.raidDeaths} control=${p.c.raidDeaths} delta=${d >= 0 ? '+' : ''}${d}  hcPlace=${(p.a.hc || {}).placements || 0}`);
}
