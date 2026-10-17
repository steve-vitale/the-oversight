#!/usr/bin/env node
// test-winstall-20261017.js — proof for the sim-winstall instrument.
//
// 1. classifyStall fixtures (RED-pinned): a naive stub that always returns
//    'unknown' REDs on every fixture; the real classifier GREENs on all of
//    them, covering every bucket of the stall taxonomy.
// 2. No-op honesty: a chooseTableOption-shaped record with no state change
//    is progOps=0 — the drain's stall-guard signature reads honestly.
// 3. Det-gate: paired 60d runs (instrumented vs uninstrumented, same seed +
//    policy) are byte-identical trajectory hashes — the instrument is
//    read-only.
// 4. Drain-off marker: on this sweep's env (WINDEFER unset) the modal drain
//    never runs — assert tableAnswers==0 AND chooseCallsN==0 on an
//    instrumented sitting run (the mechanism's live marker, measured).
// 5. SMOKE: 12d run schema-clean, 0 instrument errors.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=1 node scripts/test-winstall-20261017.js
'use strict';
const assert = require('assert');
const { classifyStall } = require('./winstall-instrument-20261017');
const { runWinstall } = require('./sweep-winstall-20261017');

function naiveStub() { return { stall: 'unknown' }; }

function t1_classifier() {
  const PENDING = 'the Table|path:feared,path:beloved';
  const fixtures = [
    [{ snapEnd: { won: true }, sitEvents: [1], chooseCalls: [{ noOp: false }] }, 'won'],
    [{ snapEnd: { won: false }, sitEvents: [], chooseCalls: [] }, 'no-table'],
    [{ snapEnd: { won: false, phase: 'paths', modalSig: PENDING }, sitEvents: [1], chooseCalls: [] }, 'modal-unanswered'],
    [{ snapEnd: { won: false, phase: 'challenge', modalSig: PENDING }, sitEvents: [1],
       chooseCalls: [{ noOp: true }, { noOp: true }] }, 'modal-stalled-noop'],
    [{ snapEnd: { won: false, phase: 'finals', modalSig: PENDING }, sitEvents: [1],
       chooseCalls: [{ noOp: false }] }, 'modal-stalled'],
    [{ snapEnd: { won: false, phase: 'paths', modalSig: PENDING }, sitEvents: [1],
       chooseCalls: [], deferEvents: [{ day: 60 }] }, 'modal-unanswered'], // defer irrelevant when modal was never answered
    [{ snapEnd: { won: false, phase: 'paths' }, sitEvents: [1], chooseCalls: [],
       deferEvents: [{ day: 60 }] }, 'deferred'],
    [{ snapEnd: { won: false, over: true, phase: 'paths', modalSig: PENDING }, sitEvents: [1],
       chooseCalls: [{ noOp: false }] }, 'modal-stalled'], // modal pending wins over died-
    [{ snapEnd: { won: false, over: true, phase: 'paths' }, sitEvents: [1], chooseCalls: [] }, 'died-mid-modal'],
    [{ snapEnd: { won: false, phase: 'done', modalSig: null }, sitEvents: [1], chooseCalls: [{ noOp: false }] }, 'modal-closed-no-win'],
    [{ snapEnd: { won: false }, sitEvents: [1], chooseCalls: [] }, 'modal-closed-no-win'], // sat, modal never pending, not over: the table closed without a win
  ];
  let reds = 0;
  for (const [cap, want] of fixtures) {
    if (naiveStub(cap).stall !== want) reds++;
    assert.strictEqual(classifyStall(cap).stall, want, `classify ${want}`);
  }
  assert.ok(reds === fixtures.length, 'naive stub must RED on every fixture');
  console.log(`  t1 classifier: ${fixtures.length}/${fixtures.length} fixtures green (naive stub RED on all ${reds})`);
}

function t2_noop_honesty() {
  // A day of drain stall-guard repeats: 3 identical no-op choices.
  const cap = {
    snapEnd: { won: false, phase: 'paths', modalSig: 'the Table|path:feared' },
    sitEvents: [{ day: 90 }],
    chooseCalls: [
      { day: 91, id: 'path:feared', phaseBefore: 'paths', phaseAfter: 'paths', noOp: true },
      { day: 92, id: 'path:feared', phaseBefore: 'paths', phaseAfter: 'paths', noOp: true },
    ],
  };
  const r = classifyStall(cap);
  assert.strictEqual(r.nChoose, 2);
  assert.strictEqual(r.progOps, 0, 'no-ops are not progress');
  assert.strictEqual(r.stall, 'modal-stalled-noop');
  console.log('  t2 no-op honesty: green (2 no-op choices -> modal-stalled-noop, progOps=0)');
}

async function t3_detgate() {
  const pairs = [
    ['leadseat', 5201],
    ['belongseat', 5202],
  ];
  for (const [policyId, seed] of pairs) {
    const a = await runWinstall(seed, policyId, { days: 60, instrumented: true, writeJson: false });
    const b = await runWinstall(seed, policyId, { days: 60, instrumented: false, writeJson: false });
    assert.strictEqual(a.instrumentErrors, 0, `${policyId} s${seed}: instrument errors`);
    assert.deepStrictEqual(a.hashes, b.hashes, `${policyId} s${seed}: trajectory hash mismatch (instrument not neutral)`);
    console.log(`  t3 det-gate ${policyId}-s${seed}: byte-identical (${a.hashes.length} day-hashes)`);
  }
}

async function t4_drainoff_marker() {
  // On this sweep's env (WINDEFER unset — asserted by the sweep), the modal
  // drain never runs. Pin the drain-off marker on the SWEEP'S OWN sitting
  // runs (deterministic — reads the measured per-seed JSONs, no fresh probes).
  // COORDINATOR REPAIR 2026-10-17: the original t4 re-probed fresh 100d runs
  // expecting sits "from d48" — but measured sit days are 90–119, and
  // cross-process trajectory divergence (sim-findings #104) meant fresh
  // probes didn't reproduce sits in-window (0/9 sat in the coordinator's
  // re-run). Re-probing timing is the wrong way to pin a marker the sweep
  // already measured. The drain's own counter (ctx.tableAnswers) is only
  // ever initialized inside winseek's tableRoad — null means tableRoad
  // NEVER RAN on this run (0 would mean "ran, answered nothing").
  // chooseCallsN==0 is the independent engine-side confirm.
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-winstall');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('probe'));
  assert.ok(files.length >= 16, `expected >=16 per-seed JSONs, found ${files.length}`);
  let sitting = 0;
  for (const f of files.sort()) {
    const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (r.sitN > 0) {
      sitting++;
      assert.strictEqual(r.tableAnswers, null, `${f}: tableRoad ran (tableAnswers=${r.tableAnswers}) — WINDEFER should be off`);
      assert.strictEqual(r.chooseCallsN, 0, `${f}: chooseTableOption fired (${r.chooseCallsN}) — WINDEFER should be off`);
      assert.strictEqual(r.stall, 'modal-unanswered', `${f}: stall=${r.stall}`);
      console.log(`  t4 drain-off ${f}: sit@${r.sitDay} answers=null choose=0 stall=modal-unanswered`);
    }
  }
  assert.ok(sitting >= 1, 'no sitting run in the sweep per-seed data — cannot pin the drain-off marker');
  console.log(`  t4 drain-off marker: green on ${sitting} sweep sitting run(s) (drain never answered)`);
}

async function t5_smoke() {
  const r = await runWinstall(5203, 'leadseat', { days: 12, instrumented: true, writeJson: false });
  assert.strictEqual(r.instrumentErrors, 0, 'instrument errors');
  const numKeys = ['seed', 'days', 'gameDays', 'maxRank', 'national', 'wins', 'sitN', 'chooseCallsN', 'progOpsN', 'deferN', 'finalN', 'modalNEnd', 'tableWaitingEnd', 'tableDoneEnd', 'weakenedEnd'];
  for (const k of numKeys) assert.ok(typeof r[k] === 'number' && Number.isFinite(r[k]), `schema ${k}`);
  assert.ok(typeof r.stall === 'string' && r.stall.length > 0, 'stall bucket present');
  assert.ok(Array.isArray(r.finals), 'finals array');
  console.log(`  t5 smoke: schema-clean, 0 errors, stall=${r.stall}`);
}

async function main() {
  console.log('== test-winstall-20261017 ==');
  t1_classifier();
  t2_noop_honesty();
  await t3_detgate();
  await t4_drainoff_marker();
  await t5_smoke();
  console.log('ALL GREEN');
}

main().catch(e => { console.error('PROOF FAIL:', e); process.exit(1); });
