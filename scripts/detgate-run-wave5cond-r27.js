#!/usr/bin/env node
// scripts/detgate-run-wave5cond-r27.js — run the determinism gate
// (scripts/det-gate.js) on the r27 8-seed set (11/22/33/44/55/66/77/88)
// with leadfeast + FEASTSCALE_R13=1, 180d death-aware.
// Exit 0 only if ALL seeds are bit-identical across two in-process runs.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { leadfeast } = require('./policies/feastscale');
const { checkDeterminism } = require('./det-gate');

async function main() {
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let allOk = true;
  for (const seed of seeds) {
    const t0 = Date.now();
    const gate = await checkDeterminism(seed, leadfeast, { days: 180 });
    console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s ${gate.summary}`);
    if (!gate.identical) allOk = false;
  }
  console.log(allOk ? 'DET-GATE: ALL IDENTICAL' : 'DET-GATE: DIVERGENCE FOUND');
  process.exit(allOk ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
