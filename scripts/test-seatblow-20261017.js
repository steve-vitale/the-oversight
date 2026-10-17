#!/usr/bin/env node
// test-seatblow-20261017.js — proof for the sim-seatblow instrument.
//
// 1. classifyActor fixtures (RED-pinned): scholar conventions, villager,
//    monster, and the adversarial unknowns (never guess).
// 2. speciesOf: canonical id lookup, unknown id -> null, null defs -> null.
// 3. Unframed-note honesty: a noteFeastedCombatUse() call with no live frame
//    is recorded via='unframed'/actor='unknown' — the diagnostic MISS path
//    records honestly, never silently attributes.
// 4. Det-gate: paired 60d runs (instrumented vs uninstrumented, same seed +
//    policy) are byte-identical trajectory hashes.
// 5. SMOKE: 12d run schema-clean, 0 instrument errors.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=1 node scripts/test-seatblow-20261017.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { attachSeatblowCapture, classifyActor, speciesOf } = require('./seatblow-instrument-20261017');
const { runSeatblow } = require('./sweep-seatblow-20261017');

function t1_classifier() {
  // scholar conventions
  assert.strictEqual(classifyActor('p', 'x'), 'scholar');
  assert.strictEqual(classifyActor('player', null), 'scholar');
  assert.strictEqual(classifyActor(null, 'you'), 'scholar');
  assert.strictEqual(classifyActor(undefined, 'you'), 'scholar');
  // villager / monster
  assert.strictEqual(classifyActor('v_12', 'Mira'), 'villager');
  assert.strictEqual(classifyActor('v_0', null), 'villager');
  assert.strictEqual(classifyActor('m_0', 'Highbeam Deer'), 'monster');
  // RED: adversarial unknowns — never guess
  assert.strictEqual(classifyActor(null, null), 'unknown');
  assert.strictEqual(classifyActor(undefined, undefined), 'unknown');
  assert.strictEqual(classifyActor('qx', 'zzz'), 'unknown');
  assert.strictEqual(classifyActor('', 'you'), 'unknown'); // not the strike convention (needs null key)
  assert.strictEqual(classifyActor('p2', 'you'), 'unknown');
  console.log('  t1 classifier: 13 fixtures green');
}

function t2_species() {
  const defs = [{ id: 'highbeam_deer', name: 'Highbeam Deer', wave: 1 }, { id: 'hushwolf', name: 'Hushwolf', wave: 1 }];
  const s = speciesOf('highbeam_deer', defs);
  assert.strictEqual(s.name, 'Highbeam Deer');
  assert.strictEqual(s.wave, 1);
  assert.strictEqual(speciesOf('nope', defs), null);
  assert.strictEqual(speciesOf('highbeam_deer', null), null);
  assert.strictEqual(speciesOf(null, defs), null);
  console.log('  t2 speciesOf: 5 checks green');
}

async function t3_unframed() {
  const { Game } = await loadGame({ seed: 5201, mode: 'seatblow-proof' });
  await setupGame(Game);
  const inst = attachSeatblowCapture(Game);
  const cap = inst.capture;
  assert.strictEqual(typeof Game.noteFeastedCombatUse, 'function', 'note exists on Game');
  await quietLog(async () => { Game.noteFeastedCombatUse(); });
  assert.strictEqual(cap.noteEvents.length, 1, 'exactly one note event recorded');
  const e = cap.noteEvents[0];
  assert.strictEqual(e.via, 'unframed');
  assert.strictEqual(e.actor, 'unknown');
  assert.strictEqual(e.marked, false);
  assert.ok(Array.isArray(e.contextBeats), 'context beats present');
  inst.restore();
  console.log('  t3 unframed-note honesty: green (via=unframed, actor=unknown, marked=false)');
}

async function t4_detgate() {
  const pairs = [
    ['leadseat', 5201],
    ['belongseat', 5202],
  ];
  for (const [policyId, seed] of pairs) {
    const a = await runSeatblow(seed, policyId, { days: 60, instrumented: true, writeJson: false });
    const b = await runSeatblow(seed, policyId, { days: 60, instrumented: false, writeJson: false });
    assert.strictEqual(a.instrumentErrors, 0, `${policyId} s${seed}: instrument errors`);
    assert.deepStrictEqual(a.hashes, b.hashes, `${policyId} s${seed}: trajectory hash mismatch (instrument not neutral)`);
    console.log(`  t4 det-gate ${policyId}-s${seed}: byte-identical (${a.hashes.length} day-hashes)`);
  }
}

async function t5_smoke() {
  const r = await runSeatblow(5203, 'leadseat', { days: 12, instrumented: true, writeJson: false });
  assert.strictEqual(r.instrumentErrors, 0, 'instrument errors');
  const numKeys = ['seed', 'days', 'gameDays', 'maxRank', 'national', 'table', 'wins', 'buffGrants', 'noteCalls', 'noteMarked', 'upliftN'];
  for (const k of numKeys) assert.ok(typeof r[k] === 'number' && Number.isFinite(r[k]), `schema ${k}`);
  for (const e of r.markedEvents) {
    assert.ok(['scholar', 'villager', 'ally', 'monster', 'unknown'].includes(e.actor), 'actor in taxonomy');
    assert.ok(['tbDamage-hook', 'feasted-form'].includes(e.via), 'via in taxonomy');
    assert.strictEqual(typeof e.feasted, 'number');
  }
  console.log(`  t5 smoke: schema-clean, 0 errors, noteCalls=${r.noteCalls} marked=${r.noteMarked}`);
}

async function main() {
  console.log('== test-seatblow-20261017 ==');
  t1_classifier();
  t2_species();
  await t3_unframed();
  await t4_detgate();
  await t5_smoke();
  console.log('ALL GREEN');
}

main().catch(e => { console.error('PROOF FAIL:', e); process.exit(1); });
