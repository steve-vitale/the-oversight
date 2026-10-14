#!/usr/bin/env node
// scripts/test-deterministic-clock-20261014.js — proof for the harness
// deterministic clock (scripts/sim-harness.js, entropy-hunt r27).
//
// WHAT IT PROVES:
//   1. Date.now() is monotonic and unique within a sim run (the property
//      wall-clock gave ID generation — no key collisions).
//   2. The 4 seeds that diverged A/A after the r26 contest-seed fix
//      (11/22/33/88, days 41-86) are now bit-identical A/A — the
//      Date.now()-ID entropy class is closed at the instrument level.
// RED (would have failed before the fix): seeds 11/22/33/88 A/A diverge.
// GREEN: all identical + clock monotonic.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const assert = require('assert');
const { leadfeast } = require('./policies/feastscale');
const { loadGame } = require('./sim-harness');
const { checkDeterminism } = require('./det-gate');

async function main() {
  let pass = 0, fail = 0;
  const t = async (name, fn) => {
    try { await fn(); pass++; console.log('  ok - ' + name); }
    catch (e) { fail++; console.log('  FAIL - ' + name + ' :: ' + e.message); }
  };

  await t('Date.now() monotonic and unique within a run', async () => {
    await loadGame({ seed: 11, mode: 'clock-proof' });
    const a = Date.now(), b = Date.now(), c = Date.now();
    assert.ok(b > a && c > b, `not monotonic: ${a},${b},${c}`);
    assert.strictEqual(new Set([a, b, c]).size, 3, 'clock values must be unique (ID uniqueness)');
  });

  await t('Date.now() deterministic across runs of the same seed', async () => {
    await loadGame({ seed: 11, mode: 'clock-proof' });
    const a1 = Date.now(), a2 = Date.now();
    await loadGame({ seed: 11, mode: 'clock-proof' });
    const b1 = Date.now(), b2 = Date.now();
    assert.strictEqual(a1, b1, `first call differs across runs: ${a1} vs ${b1}`);
    assert.strictEqual(a2, b2, `second call differs across runs: ${a2} vs ${b2}`);
  });

  for (const seed of [11, 22, 33, 88]) {
    await t(`det-gate A/A identical on previously-divergent seed ${seed}`, async () => {
      const gate = await checkDeterminism(seed, leadfeast, { days: 180 });
      assert.ok(gate.identical, gate.summary);
    });
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
