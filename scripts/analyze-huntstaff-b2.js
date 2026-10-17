#!/usr/bin/env node
// scripts/analyze-huntstaff-b2.js — verdict analyzer for the sim-huntstaff-b2 pilot.
//
// Reads evidence/2026-10-17/perseed-huntstaff-b2/ (schema 'huntstaff-wall/2'),
// judges the pre-registered PRIMARY + guardrails, reports wall metrics and
// the hunter-fate instrument (findings #508/#509).
//
// Usage: node scripts/analyze-huntstaff-b2.js [--dir <per-seed dir>]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-huntstaff-b2');
const SEEDS = [7811, 7812, 7813, 7814, 7815, 7816, 7817, 7818];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  return POLICIES.flatMap(p => SEEDS.map(s => {
    const f = path.join(DIR, `${arm}-${p}-s${s}.json`);
    if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  }));
}
const armed = load('armed'), control = load('control');
const byArm = { armed, control };
const sum = (a, f) => a.reduce((t, r) => t + (f(r) || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

console.log('== sim-huntstaff-b2 verdict analysis ==\n');
console.log('runs:', armed.length, 'armed /', control.length, 'control');

// PRIMARY
const asgArmed = sum(armed, r => r.huntAssignmentsFired);
const asgCtl = sum(control, r => r.huntAssignmentsFired);
const engaging = new Set(armed.filter(r => r.huntAssignmentsFired > 0).map(r => r.seed));
console.log('PRIMARY (engagement): armed assignments =', asgArmed, '(bar >= 8); engaging seeds =', engaging.size, '/8 (bar >= 4); control =', asgCtl);
console.log('  instrument cross-check: assignAttempts =', sum(armed, r => r.huntAssignAttempts), '| resolves =', sum(armed, r => r.huntResolves), '| kills =', sum(armed, r => r.huntKills), '| huntKcal =', sum(armed, r => r.huntKcal));

// GUARDRAILS
console.log('\nGUARDRAILS:');
const starvA = sum(armed, r => r.starvationDeaths), starvC = sum(control, r => r.starvationDeaths);
console.log(`  starvation deaths: armed ${starvA} vs control ${starvC} (bar <= control+2=${starvC + 2}): ${starvA <= starvC + 2 ? 'PASS' : 'MISS'}`);
const vdA = sum(armed, r => r.villagerDeaths), vdC = sum(control, r => r.villagerDeaths);
console.log(`  villager deaths: armed ${vdA} vs control ${vdC} (bar <= control): ${vdA <= vdC ? 'PASS' : 'MISS'}`);
const modesC = new Set(); control.forEach(r => Object.keys(r.causeCounts).forEach(c => modesC.add(c)));
const newModes = new Set(); armed.forEach(r => Object.keys(r.causeCounts).forEach(c => { if (!modesC.has(c)) newModes.add(c); }));
console.log(`  new death mode: ${newModes.size === 0 ? 'none — PASS' : 'FOUND: ' + JSON.stringify([...newModes])}`);
const natA = sum(armed, r => r.national), natC = sum(control, r => r.national);
console.log(`  national: armed ${natA}/16 vs control ${natC}/16 (bar >= control-2): ${natA >= natC - 2 ? 'PASS' : 'MISS'}`);
// CORRECTED survival gate: |mean paired delta| <= 20d
const deltas = SEEDS.flatMap(s => POLICIES.map(p => {
  const a = armed.find(r => r.seed === s && r.policyId === p);
  const c = control.find(r => r.seed === s && r.policyId === p);
  return (a.gameDays || 0) - (c.gameDays || 0);
}));
const meanD = deltas.reduce((t, x) => t + x, 0) / deltas.length;
console.log(`  paired survival deltas: [${deltas.join(', ')}]`);
console.log(`  mean Δ = ${meanD.toFixed(1)}d (bar |mean| <= 20d): ${Math.abs(meanD) <= 20 ? 'PASS' : 'MISS'}`);
console.log(`  (median armed ${med(armed.map(r => r.gameDays))}d vs control ${med(control.map(r => r.gameDays))}d — median no longer a gate)`);

// WALL
console.log('\nWALL METRICS (standing directive):');
for (const [k, f] of [['wins', r => r.wins], ['table', r => r.table], ['national', r => r.national], ['arc2', r => r.arc2], ['arc3', r => r.arc3], ['arc4', r => r.arc4], ['wave4', r => r.wave4], ['wave5', r => r.wave5], ['fourRealm', r => r.fourRealm]]) {
  console.log(`  ${k}: armed ${sum(armed, f)}/16 vs control ${sum(control, f)}/16`);
}
console.log(`  median survival: armed ${med(armed.map(r => r.gameDays))}d vs control ${med(control.map(r => r.gameDays))}d; max: ${Math.max(...armed.map(r => r.gameDays))}d vs ${Math.max(...control.map(r => r.gameDays))}d`);

// HUNTER-FATE instrument (#508/#509)
console.log('\nHUNTER-FATE (findings #508/#509: do hunters die faster — exposure vs layer-pulling-defenders?):');
const hdA = sum(armed, r => r.hunterDeaths), hdC = sum(control, r => r.hunterDeaths);
console.log(`  hunter-occupation villager deaths: armed ${hdA} vs control ${hdC} (total villager deaths armed ${vdA} vs ${vdC})`);
const mergeCounts = (rs) => { const m = {}; rs.forEach(r => Object.entries(r.hunterCauseCounts || {}).forEach(([c, n]) => m[c] = (m[c] || 0) + n)); return m; };
console.log('  armed hunter death causes:', JSON.stringify(mergeCounts(armed)));
console.log('  control hunter death causes:', JSON.stringify(mergeCounts(control)));
const assigned = armed.flatMap(r => r.assignedHunterDeaths || []);
const assignedDied = assigned.filter(a => a.dayDied != null);
console.log(`  assigned hunters: ${assigned.length} assignments, ${assignedDied.length} died afterwards`);
const attributable = assignedDied.filter(a => a.huntAttributable);
console.log(`  hunt-attributable deaths among assigned hunters: ${attributable.length}`);
for (const a of assignedDied) console.log(`    ${a.name} (${a.occ}) assigned d${a.dayAssigned}, died d${a.dayDied}: ${a.cause}${a.huntAttributable ? ' [HUNT-ATTRIBUTABLE]' : ''}`);

// death-cause shares
console.log('\nDEATH-CAUSE SHARES (villager, top 8):');
const share = (rs) => { const m = {}; rs.forEach(r => (r.deaths || []).filter(d => !d.player).forEach(d => { const k = d.cause == null ? '<null>' : d.cause; m[k] = (m[k] || 0) + 1; })); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
console.log('  armed:', JSON.stringify(share(armed).slice(0, 8)));
console.log('  control:', JSON.stringify(share(control).slice(0, 8)));

// completion
const errs = sum(armed, r => r.instrumentErrors) + sum(control, r => r.instrumentErrors);
console.log(`\nCOMPLETION: ${armed.length + control.length}/32 runs, instrument errors = ${errs}`);
