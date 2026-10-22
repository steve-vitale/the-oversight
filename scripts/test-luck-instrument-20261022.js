#!/usr/bin/env node
// scripts/test-luck-instrument-20261022.js — proof for rogue P0-6 (2026-10-22).
// Binomial luck instrumentation on the balanced panel.
//
// PART 1 (unit): the binomial math on synthetic roll streams — known p,
// assert tail probabilities behave (a 50/50 stream over 100 rolls scores
// near-neutral; rigged streams score extreme; terciles land correctly).
// PART 2 (integration): two real panel children (observe=1 / observe=0) on a
// small corpus — assert the panel emits the new luck columns and the luck
// detail without breaking existing columns, and that observation stays
// gameplay-neutral (identical stateHash + identical row).
// PART 3 (contract): the new columns are descriptive-only — compareMetric
// gives them 'descriptive' status and they cannot move a comparison verdict.
//
// Writes NOTHING into the repo (children emit to stdout only).
'use strict';
const assert = require('assert'), cp = require('child_process'), path = require('path'), fs = require('fs');
const luck = require('./lib/luck-instrument');
const contract = require('./balance-metrics.json');
const score = require('./lib/balance-scorecard');

let passed = 0;
function ok(name, cond) {
  assert(cond, 'FAIL: ' + name);
  passed++;
  console.log('  ok: ' + name);
}

// ---------- PART 1: binomial math on synthetic streams ----------
console.log('PART 1 — binomial math on synthetic roll streams');
{
  // Neutral: 100 rolls at p=0.5, exactly 50 hits. luckPct = P(X<=50) ≈ 0.54.
  const neutral = Array.from({ length: 100 }, () => ({ p: 0.5, hit: true }))
    .map((r, i) => ({ p: 0.5, hit: i < 50 }));
  const s = luck.summarizeStream(neutral);
  ok('neutral stream: n=100 k=50', s.n === 100 && s.k === 50);
  ok('neutral stream: expected=50', Math.abs(s.expected - 50) < 1e-9);
  ok('neutral stream: luckPct near 0.5 (' + s.luckPct.toFixed(3) + ')', Math.abs(s.luckPct - 0.5) < 0.1);
  ok('neutral stream: tercile neutral', s.tercile === 'neutral');
  ok('neutral stream: twoSided high (' + s.twoSided.toFixed(3) + ')', s.twoSided > 0.5);

  // Rigged lucky: 100 rolls at p=0.5, 80 hits.
  const lucky = Array.from({ length: 100 }, (_, i) => ({ p: 0.5, hit: i < 80 }));
  const sl = luck.summarizeStream(lucky);
  ok('lucky stream: luckPct extreme high (' + sl.luckPct.toFixed(4) + ')', sl.luckPct > 0.99);
  ok('lucky stream: tercile lucky', sl.tercile === 'lucky');
  ok('lucky stream: twoSided tiny (' + sl.twoSided.toExponential(1) + ')', sl.twoSided < 1e-6);

  // Rigged unlucky: 100 rolls at p=0.5, 20 hits.
  const unlucky = Array.from({ length: 100 }, (_, i) => ({ p: 0.5, hit: i < 20 }));
  const su = luck.summarizeStream(unlucky);
  ok('unlucky stream: luckPct extreme low (' + su.luckPct.toFixed(4) + ')', su.luckPct < 0.01);
  ok('unlucky stream: tercile unlucky', su.tercile === 'unlucky');
  ok('unlucky stream: twoSided tiny', su.twoSided < 1e-6);

  // Varying p (the hunt case): 50 rolls at 0.7 + 50 at 0.3, expected = 50.
  const varied = [...Array.from({ length: 50 }, () => ({ p: 0.7, hit: true })),
                  ...Array.from({ length: 50 }, () => ({ p: 0.3, hit: false }))];
  const sv = luck.summarizeStream(varied);
  ok('varying-p: expected = sum p (' + sv.expected.toFixed(1) + ')', Math.abs(sv.expected - 50) < 1e-9);
  ok('varying-p: k=50 luckPct mid (' + sv.luckPct.toFixed(3) + ')', sv.luckPct > 0.4 && sv.luckPct < 0.6);

  // Degenerate p=0/1 rolls don't break the DP.
  const degen = [{ p: 1, hit: true }, { p: 0, hit: false }, { p: 0.5, hit: true }];
  const sd = luck.summarizeStream(degen);
  ok('degenerate p values handled', sd.n === 3 && sd.k === 2 && Number.isFinite(sd.luckPct));

  // Empty stream → null summary → null metric value.
  const se = luck.summarizeStream([]);
  ok('empty stream → null', se === null);
  const vals = luck.metricValues(luck.summarizeRun({ hunt: [], trap: [], snare: [], pit: [], fish: [] }));
  ok('empty run → all luck metrics null', Object.values(vals).every(v => v === null));

  // Run-level: one extreme-lucky stream among neutrals pulls overall up.
  const run = luck.summarizeRun({ hunt: lucky, trap: neutral, snare: [], pit: [], fish: [] });
  ok('run summary: hunt tercile lucky', run.streams.hunt.tercile === 'lucky');
  ok('run summary: trap tercile neutral', run.streams.trap.tercile === 'neutral');
  ok('run summary: empty snare → null', run.streams.snare === null);
  ok('run summary: overall pulled lucky (' + run.overall.luckPct.toFixed(3) + ')',
    run.overall.luckPct > 0.9 && run.overall.tercile === 'lucky');
  const valsRun = luck.metricValues(run);
  ok('metricValues: luckHunt extreme, luckOverall combined',
    valsRun.luckHunt > 0.99 && valsRun.luckOverall > 0.9 && valsRun.luckSnare === null);

  // Tercile boundaries.
  ok('tercile boundaries', luck.tercile(0.32) === 'unlucky' && luck.tercile(0.5) === 'neutral' &&
    luck.tercile(0.68) === 'lucky' && luck.tercile(null) === 'none');
}

// ---------- PART 2: integration — real panel children ----------
console.log('PART 2 — real panel children (observe=1 vs observe=0)');
{
  const root = path.resolve(__dirname, '..');
  const runChild = observe => {
    const out = cp.execFileSync(process.execPath,
      [path.join(__dirname, 'balance-panel.js'), '--child', '--root', root,
       '--policy', 'capable', '--seed', '7', '--observe', observe, '--days', '20',
       '--origin', 'Columbus, Ohio'],
      { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600000 });
    return JSON.parse(out.split('@@BALANCE@@').pop());
  };
  const on = runChild('1'), off = runChild('0');
  ok('observe=1 child completed a run', !!on.row && !on.excluded);
  ok('observe=1: luck detail present', !!on.luck && !!on.luck.streams && 'overall' in on.luck);
  const luckIds = ['luckHunt', 'luckTrap', 'luckSnare', 'luckPit', 'luckFish', 'luckOverall'];
  ok('observe=1: all 6 luck metric columns present',
    luckIds.every(id => Object.prototype.hasOwnProperty.call(on.metrics, id)));
  ok('observe=1: luck metric values match detail',
    luckIds.every(id => {
      const v = on.metrics[id];
      const exp = id === 'luckOverall'
        ? (on.luck.overall ? on.luck.overall.luckPct : null)
        : (on.luck.streams[luck.STREAMS.find(s => s.metricId === id).id] || {}).luckPct ?? null;
      return v === exp || (v == null && exp == null);
    }));
  const preexisting = ['won', 'entered', 'table', 'survival30', 'playerDeaths', 'livingNpcs',
    'lowFood', 'classAccess', 'goodGear', 'usefulIntake', 'bearerChanges', 'abilityAccepted'];
  ok('observe=1: pre-existing metric columns intact',
    preexisting.every(id => Object.prototype.hasOwnProperty.call(on.metrics, id)));
  // Observer neutrality: gameplay state and driver row must not move.
  ok('neutrality: stateHash identical (observe=1 vs 0)', on.stateHash === off.stateHash);
  ok('neutrality: driver row identical', JSON.stringify(on.row) === JSON.stringify(off.row));
  // At least one honest roll stream should have fired in 20 days of capable play.
  const fired = Object.values(on.luck.streams).filter(Boolean);
  console.log('  info: streams fired: ' + fired.map(s => s.n + ' rolls').join(', '));
  ok('neutrality: no observer errors', on.observerErrors.length === 0);
}

// ---------- PART 3: contract — luck columns are descriptive-only ----------
console.log('PART 3 — luck columns cannot move a comparison verdict');
{
  // The lib's canonical specs must be present verbatim in the contract.
  for (const spec of luck.CONTRACT_METRICS) {
    const inContract = contract.metrics.find(m => m.id === spec.id);
    ok('contract contains ' + spec.id,
      !!inContract && inContract.direction === 'neutral' && inContract.reviewChanges === false &&
      inContract.label === spec.label);
  }
  // compareMetric on a luck column: always 'descriptive', never a signal.
  const spec = contract.metrics.find(m => m.id === 'luckOverall');
  const before = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  const afterLucky = [0.9, 0.85, 0.95, 0.8, 0.88, 0.92, 0.86, 0.9]; // arm B wildly luckier
  const r = score.compareMetric(before, afterLucky, spec, 'test/luckOverall');
  ok('luck column status is descriptive even when an arm is far luckier', r.status === 'descriptive');
  ok('luck column delta still reported (' + r.delta.toFixed(3) + ')', r.delta > 0.3 && r.pairs === 8);
  // The markdown table renders the luck column like any other metric.
  const md = score.markdown({ decision: 'no_material_signal', errors: [],
    policies: [{ policy: 'capable', cases: 8, confirmationSized: false, decision: 'no_material_signal', metrics: [r] }] });
  ok('markdown renders the luck column', md.includes('Combined run luck percentile'));
}

console.log(`\nALL ${passed} CHECKS PASSED`);
