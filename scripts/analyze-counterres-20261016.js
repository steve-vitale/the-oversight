#!/usr/bin/env node
// analyze-counterres-20261016.js — compares armed (seatdrive explicitly
// composed, SEATDRIVE=1) vs control (SEATDRIVE=0, pure delegation) on
// IDENTICAL seeds (the sim-counterres pilot/confirm sweeps).
//
// PRIMARY (binding, from the task brief): w3+ trick RESOLUTIONS armed >= 20
// across the sweep, where a resolution = a fight vs a known-trick species
// ending in (trick-attributed kill) OR (mFlee/vFlee with >=2 trick actions
// in the fight's trickLog). SECONDARY: mean field deaths/run WITHIN
// wave-3+-reached runs.
// Guardrails: national_armed >= national_control - 2; median survival
// armed >= control - 10d; no new death mode.
//
// Usage: node scripts/analyze-counterres-20261016.js [pilot|confirm]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-counterres');
const ROUND = process.argv[2] || 'pilot';
const PILOT_SEEDS = [702, 703, 704, 705, 708, 709, 710, 719];
const CONFIRM_SEEDS = process.env.CONFIRM_SEEDS
  ? process.env.CONFIRM_SEEDS.split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite)
  : [];
const seeds = ROUND === 'confirm' ? CONFIRM_SEEDS : PILOT_SEEDS;
const policies = ['leadfeast'];
if (!seeds.length) { console.error('no seeds for round ' + ROUND); process.exit(2); }

function load(policyId, seed, arm) {
  const p = path.join(EVID, `${policyId}-s${seed}-${arm}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const rows = [];
for (const policyId of policies) {
  for (const seed of seeds) {
    rows.push({ policyId, seed, a: load(policyId, seed, 'armed'), c: load(policyId, seed, 'control') });
  }
}

const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

console.log(`== sim-counterres ${ROUND}: armed (seatdrive ON) vs control (SEATDRIVE=0) — ${rows.length} seed-pairs ==`);

// PRIMARY: w3+ resolutions
const resW3A = sum(rows.map(r => r.a.resW3));
const resW3C = sum(rows.map(r => r.c.resW3));
console.log(`w3+ RESOLUTIONS: armed=${resW3A} control=${resW3C}  (GO bar: armed >= 20)`);
console.log(`  armed split: kill=${sum(rows.map(r => r.a.resW3kill))} flee=${sum(rows.map(r => r.a.resW3flee))}`);
console.log(`  control split: kill=${sum(rows.map(r => r.c.resW3kill))} flee=${sum(rows.map(r => r.c.resW3flee))}`);
console.log(`all-wave resolutions: armed=${sum(rows.map(r => r.a.resAll))} control=${sum(rows.map(r => r.c.resAll))}`);

// resolution detail (armed): what resolved, where
const w3items = [];
for (const r of rows) for (const it of (r.a.resolutions || [])) if (it.wave >= 3) w3items.push({ seed: r.seed, ...it });
const byMid = {};
for (const it of w3items) { const k = `${it.mid}/${it.channel}`; byMid[k] = (byMid[k] || 0) + 1; }
console.log('armed w3 resolutions by species/channel: ' + JSON.stringify(byMid));

// SECONDARY: field-death-rate WITHIN wave-3+-reached pairs
const reached = rows.filter(r => r.a.wave3Reached && r.c.wave3Reached);
const dA = mean(reached.map(r => r.a.fieldDeaths));
const dC = mean(reached.map(r => r.c.fieldDeaths));
console.log(`wave-3+-reached pairs: ${reached.length}/${rows.length}`);
console.log(`mean field deaths/run within reached pairs: armed=${isNaN(dA) ? 'n/a' : dA.toFixed(2)} control=${isNaN(dC) ? 'n/a' : dC.toFixed(2)}`);

// knowledge / executions context
console.log(`w3+ tricks known (mean/run): armed=${mean(rows.map(r => r.a.nW3TricksKnown)).toFixed(2)} control=${mean(rows.map(r => r.c.nW3TricksKnown)).toFixed(2)}`);
console.log(`discoveries (mean/run): armed=${mean(rows.map(r => r.a.nDiscovered)).toFixed(1)} control=${mean(rows.map(r => r.c.nDiscovered)).toFixed(1)}`);
const tallyA = {};
for (const r of rows) for (const [k, v] of Object.entries(r.a.trickTally || {})) tallyA[k] = (tallyA[k] || 0) + v;
const w3k = (t) => Object.entries(t).filter(([k]) => /redactor|gavel|focus|tos|callback|adbreak|strike|suburb|eulogy|algorithm|congregation|nielsen|spoiler|bad_note|prone|confess|bore|examine|farewell|look_away|meet_demand|leave|contradict|argue/.test(k));
console.log('w3+ trick executions (tally, armed): ' + JSON.stringify(Object.fromEntries(w3k(tallyA))));

// guardrails
const natA = sum(rows.map(r => r.a.national)), natC = sum(rows.map(r => r.c.national));
const wonA = sum(rows.map(r => r.a.won)), wonC = sum(rows.map(r => r.c.won));
const maxWA = Math.max(...rows.map(r => r.a.maxWave)), maxWC = Math.max(...rows.map(r => r.c.maxWave));
console.log(`national: armed=${natA} control=${natC} (guardrail: >= ${natC - 2})`);
console.log(`won: armed=${wonA} control=${wonC}`);
console.log(`maxWave: armed=${maxWA} control=${maxWC}`);
console.log(`median days: armed=${med(rows.map(r => r.a.days))} control=${med(rows.map(r => r.c.days))} (guardrail: armed >= control-10)`);
const causesA = {}, causesC = {};
for (const r of rows) {
  for (const [k, v] of Object.entries(r.a.deathCauses || {})) causesA[k] = (causesA[k] || 0) + v;
  for (const [k, v] of Object.entries(r.c.deathCauses || {})) causesC[k] = (causesC[k] || 0) + v;
}
const newModes = Object.keys(causesA).filter(k => !causesC[k]);
console.log(`death modes armed-only: ${newModes.length ? newModes.join(' | ') : 'none'}`);

console.log('\n-- per-seed --');
for (const r of rows) {
  console.log(`s${r.seed}: A[d=${r.a.days} ${r.a.endReason} w=${r.a.maxWave} nat=${r.a.national} won=${r.a.won} resW3=${r.a.resW3} fd=${r.a.fieldDeaths} w3k=${r.a.nW3TricksKnown}] C[d=${r.c.days} ${r.c.endReason} w=${r.c.maxWave} nat=${r.c.national} won=${r.c.won} resW3=${r.c.resW3} fd=${r.c.fieldDeaths} w3k=${r.c.nW3TricksKnown}]`);
}

// verdict
const goPrimary = resW3A >= 20;
const guardNat = natA >= natC - 2;
const guardMed = med(rows.map(r => r.a.days)) >= med(rows.map(r => r.c.days)) - 10;
const guardModes = newModes.length === 0;
console.log('\n== VERDICT ==');
console.log(`PRIMARY (w3+ resolutions armed >= 20): ${goPrimary ? 'GO' : 'NO-GO'} (${resW3A})`);
console.log(`guardrails: national ${guardNat ? 'OK' : 'BREACH'} | median-survival ${guardMed ? 'OK' : 'BREACH'} | no-new-death-mode ${guardModes ? 'OK' : 'BREACH'}`);
console.log(`OVERALL: ${(goPrimary && guardNat && guardMed && guardModes) ? 'GO' : 'NO-GO'}`);
