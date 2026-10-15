#!/usr/bin/env node
// scripts/det-gate-windefer-20261015.js — determinism gate for the windefer
// layer composed with the wintrace instrument (sim-findings #310,
// 2026-10-15). Requires 16/16 identical (8 seeds x {leadfeast, belongfeast},
// traced + deferred) before trusting the before/after comparison.
//
// Env: FEASTSCALE_R13=1 (substrate), WINTRAZE=1 (instrument),
// WINPURSUIT=1 (the drain substrate), WINDEFER=1 (the layer).
//
// Usage:
//   FEASTSCALE_R13=1 WINTRAZE=1 WINPURSUIT=1 WINDEFER=1 node scripts/det-gate-windefer-20261015.js
'use strict';
const { checkDeterminism } = require('./det-gate');
const WT = require('./policies/wintrace');
const WD = require('./policies/windefer');

for (const [k, v] of [['FEASTSCALE_R13', '1'], ['WINTRAZE', '1'], ['WINPURSUIT', '1'], ['WINDEFER', '1']]) {
  if (process.env[k] !== v) { console.error(`DET-GATE STOP: ${k}=1 is required.`); process.exit(2); }
}
if (WD.leaddefer.id !== 'leadfeast-windefer' || WD.belongdefer.id !== 'belongfeast-windefer') {
  console.error('SMOKE FAIL: armed policy ids wrong — refusing to gate a policy-less run.');
  process.exit(1);
}
const REG = {
  leadfeast: WT.withWinTrace(WD.leaddefer, 'leadfeast-traced-deferred', 'det-gate'),
  belongfeast: WT.withWinTrace(WD.belongdefer, 'belongfeast-traced-deferred', 'det-gate'),
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '60', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'wd-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE windefer (traced+deferred, ${DAYS}d): ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
