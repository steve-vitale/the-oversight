#!/usr/bin/env node
// scripts/det-gate-pathselect-20261015.js — determinism gate for the
// PATHSELECT door chooser (sim-pathselect, 2026-10-15). Requires 16/16
// identical (8 seeds x {leadfeast, belongfeast}, traced + pursued +
// PATHSELECT=1) before trusting the before/after comparison.
//
// Env: FEASTSCALE_R13=1 (substrate), WINTRAZE=1 (instrument),
// WINPURSUIT=1 (pursuit layer), PATHSELECT=1 (door chooser).
//
// Usage:
//   FEASTSCALE_R13=1 WINTRAZE=1 WINPURSUIT=1 PATHSELECT=1 node scripts/det-gate-pathselect-20261015.js
'use strict';
const { checkDeterminism } = require('./det-gate');
const WT = require('./policies/wintrace');
const WP = require('./policies/winpursuit');

for (const [k, v] of [['FEASTSCALE_R13', '1'], ['WINTRAZE', '1'], ['WINPURSUIT', '1'], ['PATHSELECT', '1']]) {
  if (process.env[k] !== v) { console.error(`DET-GATE STOP: ${k}=1 is required.`); process.exit(2); }
}
const REG = {
  leadfeast: WT.withWinTrace(WP.leadpursuit, 'leadfeast-traced-pursued-pathselect', 'det-gate'),
  belongfeast: WT.withWinTrace(WP.belongpursuit, 'belongfeast-traced-pursued-pathselect', 'det-gate'),
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'ps-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE pathselect (traced+pursued+PATHSELECT): ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
