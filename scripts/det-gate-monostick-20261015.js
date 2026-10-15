#!/usr/bin/env node
// scripts/det-gate-monostick-20261015.js — determinism gate for the
// monostick arm (run BEFORE trusting any before/after comparison).
//
// The armed stack is the sweep's own oneRun (fourthlink+FOURTHLINK=1 /
// leadfeast, sticky arm, BREAK=1 scenario). Each (policy, seed) runs TWICE at
// 150d; trajectory hashes AND the scenario record (unlock day, break
// day/link/wave) must be bit-identical. The scenario's determinism is what
// the paired sticky-vs-mercy comparison rests on.
//
// Usage: node scripts/det-gate-monostick-20261015.js
// Exits 0 when all pairs run bit-identically; exits 1 otherwise.
'use strict';
const MONO = require('./monostick-sweep');

const SEEDS = [11, 22];
const PIDS = ['fourthlink', 'leadfeast'];
const DAYS = 150;

function scenKey(rec) {
  return JSON.stringify({
    unlockDay: rec.unlock4 ? rec.unlock4.day : null,
    breaks: rec.breaks.map(b => ({
      n: b.n, breakDay: b.breakDay, linkId: b.linkId,
      stEffPre: b.stEffPre, stEffPost: b.stEffPost,
      waveEffPre: b.waveEffPre, waveEffPost: b.waveEffPost,
      reLocked: b.reLocked, heldByRatchet: b.heldByRatchet,
      outcome: (b.outcome || {}).outcome,
    })),
    gameDays: rec.gameDays, endReason: rec.endReason,
  });
}

(async () => {
  let bad = 0;
  for (const pid of PIDS) for (const seed of SEEDS) {
    const a = await MONO.oneRun(seed, pid, 'sticky', DAYS);
    const b = await MONO.oneRun(seed, pid, 'sticky', DAYS);
    const hSame = a.hashes.join('\n') === b.hashes.join('\n');
    const sSame = scenKey(a) === scenKey(b);
    const ok = hSame && sSame;
    console.log(`${ok ? 'PASS' : 'FAIL'} det [${pid}/s${seed}] ${DAYS}d hashes:${hSame ? 'same' : 'DIVERGED'} scenario:${sSame ? 'same' : 'DIVERGED'} (breaks=${a.breaks.length})`);
    if (!ok) {
      bad++;
      if (!sSame) { console.log('  run1: ' + scenKey(a)); console.log('  run2: ' + scenKey(b)); }
    }
  }
  if (bad) {
    console.error(`\nDETERMINISM GATE FAILED on ${bad}/${SEEDS.length * PIDS.length} pairs — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('\ndet-gate GREEN: all pairs bit-identical (hashes + scenario records). Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(2); });
