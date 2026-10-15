#!/usr/bin/env node
// scripts/det-gate-wildtile-20261015.js — determinism gate for the wildtile
// instrument (sim-findings #256). The wraps are read-only (push-to-array
// only); the harness installs the deterministic sim clock + stable person
// keys (r26/r27). Two seeds, each run twice in isolated subprocesses;
// fingerprints must be bit-identical.
// Usage: node scripts/det-gate-wildtile-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';

async function main() {
  const { execFileSync } = require('child_process');
  const fp = {};
  for (const seed of [11, 22]) {
    fp[seed] = [];
    for (let rep = 0; rep < 2; rep++) {
      const out = execFileSync('node', ['-e', `
        const wt = require('/home/hatch/workspace/worktrees/sim-wildtile/scripts/wildtile-20261015.js');
        wt.runSeed(${seed}).then(r => console.log(wt.fingerprint(r))).catch(e => { console.error('FATAL', e.message); process.exit(1); });
      `], { encoding: 'utf8', timeout: 600000 }).trim().split('\n').pop();
      fp[seed].push(out);
    }
  }
  let ok = true;
  for (const seed of [11, 22]) {
    const same = fp[seed][0] === fp[seed][1];
    console.log(`  seed ${seed}: ${same ? 'BIT-IDENTICAL' : 'DIVERGED'}`);
    if (!same) {
      ok = false;
      console.log('  rep1: ' + fp[seed][0].slice(0, 400));
      console.log('  rep2: ' + fp[seed][1].slice(0, 400));
    }
  }
  console.log(ok ? 'DET-GATE GREEN (2/2 seeds bit-identical)' : 'DET-GATE RED — divergence');
  process.exit(ok ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
