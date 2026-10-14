#!/usr/bin/env node
// detgate-run-predcond-20261014.js — determinism gate + SMOKE for the predcond arm.
// SMOKE: the named-export unwrap actually yields a working policy (the
// 2026-10-14 unwrap bug ran a whole suite policy-less).
// DET: checkDeterminism(seed, policy) 16/16 — 8 seeds x {leadfeast, predcond},
// 180d, one process.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { checkDeterminism } = require('./det-gate');
const { leadfeast } = require('./policies/feastscale');
const { predcond } = require('./policies/predcond');

(async () => {
  let bad = 0;
  // SMOKE
  for (const [name, p] of [['leadfeast', leadfeast], ['predcond', predcond]]) {
    if (typeof p.daily !== 'function') { console.error('SMOKE FAIL: ' + name + '.daily is not a function'); bad++; }
    else console.log('SMOKE ok: ' + name + ' unwraps, daily is a function');
  }
  if (predcond.id !== 'predcond') { console.error('SMOKE FAIL: expected policy id predcond, got ' + predcond.id); bad++; }
  // gate-off unwrap: PREDCOND unset must still give a delegating policy
  delete process.env.PREDCOND;
  if (typeof predcond.daily !== 'function') { console.error('SMOKE FAIL: gate-off daily missing'); bad++; }
  else console.log('SMOKE ok: gate-off unwrap has daily');
  if (bad) process.exit(1);

  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
  const days = parseInt(process.env.DAYS || '180', 10);
  let identical = 0, total = 0;
  for (const [pid, pol] of [['leadfeast', leadfeast], ['predcond', predcond]]) {
    process.env.PREDCOND = pid === 'predcond' ? '1' : '';
    if (pid !== 'predcond') delete process.env.PREDCOND;
    for (const seed of seeds) {
      const g = await checkDeterminism(seed, pol, { days, mode: 'predcond-detgate' });
      total++;
      if (g.identical) { identical++; console.log('  ok - ' + g.summary); }
      else { console.log('  FAIL - ' + g.summary); }
    }
  }
  console.log(`\ndet-gate: ${identical}/${total} identical`);
  process.exit(identical === total ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
