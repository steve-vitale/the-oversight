#!/usr/bin/env node
// analyze-vetbench-20261022.js — sim-vetbench PILOT analyzer.
//
// Reads evidence/2026-10-22/perseed-vetbench/ and judges the pre-registered
// header (evidence/2026-10-22/sim-vetbench.md):
//   PRIMARY: veteran combat deaths during live windows, armed <= control-2.
//   ENGAGEMENT: >=2/8 armed seeds engaging (either config).
//   GUARDRAILS: median survival >= control-10d (paired); no new death mode
//     (>=2-event rule); haven breach (unmet-raider nights) <= control+1.
//   SECONDARY: wave-5 doors opened.
// Plus wall numbers: national/table/wins, wave reach, median/max survival,
// death-cause shares.
//
// Usage: node scripts/analyze-vetbench-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-vetbench');
const SEEDS = [65551, 65552, 65553, 65554, 65555, 65556, 65557, 65558];
const BASES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const b of BASES) {
    const tag = arm === 'control' ? b : b + '-vetbench';
    for (const s of SEEDS) {
      const fp = path.join(DIR, `${arm}-${tag}-s${s}.json`);
      if (!fs.existsSync(fp)) { console.error('MISSING: ' + fp); process.exit(2); }
      rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
    }
  }
  return rows;
}
const sum = (a, f) => a.reduce((n, r) => n + (f(r) | 0), 0);
const median = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const control = load('control');
const armed = load('vetbench');
const byKey = (rows) => { const m = {}; for (const r of rows) m[r.seed + '/' + r.policy.replace('-vetbench', '')] = r; return m; };
const C = byKey(control), A = byKey(armed);

// Filename verification: every expected file present, seed field matches.
let fnOk = true;
for (const b of BASES) for (const s of SEEDS) {
  for (const arm of ['control', 'vetbench']) {
    const tag = arm === 'control' ? b : b + '-vetbench';
    const r = (arm === 'control' ? C : A)[s + '/' + b];
    if (!r || r.seed !== s || r.arm !== arm) { fnOk = false; console.error('FILENAME/SEED MISMATCH', arm, b, s); }
  }
}
console.log('filename-verified:', fnOk);

// PRIMARY.
const cDeaths = sum(control, r => r.nWindowVetDeaths);
const aDeaths = sum(armed, r => r.nWindowVetDeaths);
console.log(`PRIMARY veteran combat deaths on live-window days: control=${cDeaths} armed=${aDeaths} (GO: armed <= control-2 = ${cDeaths - 2})`);
const primaryGo = aDeaths <= cDeaths - 2;
console.log('PRIMARY:', primaryGo ? 'GO' : 'NO-GO');

// ENGAGEMENT.
const engagedSeeds = new Set();
for (const b of BASES) for (const s of SEEDS) {
  const r = A[s + '/' + b];
  if (r && r.vb && r.vb.vbEngaged) engagedSeeds.add(s);
}
console.log(`ENGAGEMENT: ${engagedSeeds.size}/8 armed seeds engaging (GO: >=2) — seeds [${[...engagedSeeds].sort()}]`);
const engageGo = engagedSeeds.size >= 2;
console.log('ENGAGEMENT:', engageGo ? 'GO' : 'NO-GO');

// Window liveness (was there anything to bench?).
const cWin = sum(control, r => r.windowLiveDays), aWin = sum(armed, r => r.windowLiveDays);
const cWinSeeds = new Set(), aWinSeeds = new Set();
for (const b of BASES) for (const s of SEEDS) {
  if ((C[s + '/' + b].windowLiveDays | 0) > 0) cWinSeeds.add(s);
  if ((A[s + '/' + b].windowLiveDays | 0) > 0) aWinSeeds.add(s);
}
console.log(`window-live days: control=${cWin} (${cWinSeeds.size}/8 seeds) armed=${aWin} (${aWinSeeds.size}/8 seeds)`);

// GUARDRAILS.
const survDiffs = [];
for (const b of BASES) for (const s of SEEDS) {
  survDiffs.push((A[s + '/' + b].gameDays | 0) - (C[s + '/' + b].gameDays | 0));
}
const medDiff = median(survDiffs);
console.log(`GUARDRAIL survival: median paired diff (armed-control) = ${medDiff}d (GO: >= -10d) -> ${medDiff >= -10 ? 'PASS' : 'FAIL'}`);
const cCauses = {}, aCauses = {};
for (const r of control) for (const [k, v] of Object.entries(r.deathCauses || {})) cCauses[k] = (cCauses[k] || 0) + v;
for (const r of armed) for (const [k, v] of Object.entries(r.deathCauses || {})) aCauses[k] = (aCauses[k] || 0) + v;
const newModes = Object.keys(aCauses).filter(k => (aCauses[k] | 0) >= 2 && !(cCauses[k] | 0));
console.log(`GUARDRAIL new death modes (>=2 armed, 0 control): [${newModes}] -> ${newModes.length ? 'FAIL' : 'PASS'}`);
const cBreach = sum(control, r => r.unmetRaiderNights), aBreach = sum(armed, r => r.unmetRaiderNights);
console.log(`GUARDRAIL haven breach (unmet-raider nights): control=${cBreach} armed=${aBreach} (GO: armed <= control+1 = ${cBreach + 1}) -> ${aBreach <= cBreach + 1 ? 'PASS' : 'FAIL'}`);

// SECONDARY + wall numbers.
for (const [label, rows] of [['control', control], ['vetbench', armed]]) {
  const w5 = sum(rows, r => r.wave5), w4 = sum(rows, r => r.wave4);
  const nat = sum(rows, r => r.national), tab = sum(rows, r => r.table), won = sum(rows, r => r.won);
  const surv = rows.map(r => r.gameDays | 0);
  console.log(`${label}: wave4 ${w4}/16, wave5 ${w5}/16 (doors), national ${nat}/16, table ${tab}/16, won ${won}/16, median ${median(surv)}d, max ${Math.max(...surv)}d`);
}
console.log('death-cause shares (control):', JSON.stringify(cCauses));
console.log('death-cause shares (vetbench):', JSON.stringify(aCauses));

// Per-seed primary table.
console.log('\nseed/base: control vetDeaths -> armed vetDeaths (window days c/a)');
for (const s of SEEDS) for (const b of BASES) {
  const c = C[s + '/' + b], a = A[s + '/' + b];
  console.log(`  s${s}/${b}: ${c.nWindowVetDeaths} -> ${a.nWindowVetDeaths} (winDays ${c.windowLiveDays}/${a.windowLiveDays}, engaged ${!!(a.vb && a.vb.vbEngaged)})`);
}

const verdict = primaryGo && engageGo ? 'GO' : 'NO-GO';
console.log('\nPILOT VERDICT:', verdict, `(primary ${primaryGo ? 'GO' : 'NO-GO'}, engagement ${engageGo ? 'GO' : 'NO-GO'})`);
