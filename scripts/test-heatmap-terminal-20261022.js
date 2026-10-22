// test-heatmap-terminal-20261022.js — proof for scripts/heatmap-terminal.js
// (rogue P0-1: terminal-state heatmap aggregator, Roguelike Celebration
// audit Talk 1 G2). Assert the matrix aggregates correctly:
//   (A) a committed REAL sweep corpus — scripts/sweep-winseek-results.json
//       (60 real rows, zero new sims);
//   (B) synthetic rows mimicking the two real record shapes root-caused
//       2026-10-22 (runDays result + legacy sweep rows);
//   (C) ONE real runDays row via the shared kit (sim-harness) to pin the
//       TRUE current record shape (endReason ∈ {'village-lost','over-other',
//       'survived'} + stop.won — the audit's 'won/villageLost/survived'
//       spellings do not exist).
// No repo writes. No copied harness boilerplate: loadGame/setupGame/runDays
// come from scripts/sim-harness.js; paths are relative (no absolutes).
'use strict';
const assert = require('assert');
const path = require('path');
const heat = require('./heatmap-terminal');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

function cellSum(matrix) {
  let sum = 0;
  for (const p of matrix.policies) {
    for (const t of matrix.terminals) {
      for (const c of (p.cells[t] || [])) sum += c.n;
    }
  }
  return sum;
}

async function main() {
  // ---------- A. real committed sweep corpus ----------
  const corpus = path.join(__dirname, 'sweep-winseek-results.json');
  const rowsA = heat.loadRows([corpus], { policyLabel: 'winseek' });
  assert.strictEqual(rowsA.length, 60, 'corpus A: 60 rows');
  const mA = heat.aggregate(rowsA, { title: 'A', sources: ['sweep-winseek-results.json'] });
  assert.strictEqual(mA.rowCount, 60);
  assert.strictEqual(mA.policies.length, 1, 'single-policy corpus → one facet');
  const pA = mA.policies[0];
  assert.strictEqual(pA.policy, 'winseek', 'label override applied to policy-less rows');
  assert.strictEqual(pA.terminals['village-lost'].total, 55);
  assert.strictEqual(pA.terminals['survived'].total, 5);
  assert.strictEqual(cellSum(mA), 60, 'cells sum to row count');
  // Real day distribution (2026-10-22 corpus): village-lost 39 in 0–30 / 16
  // in 31–60; survived 4 in 0–30 / 1 in 31–60. The heatmap must bucket real
  // data exactly, not just the trivial case.
  assert.strictEqual(pA.cells['village-lost'][0].n, 39);
  assert.strictEqual(pA.cells['village-lost'][1].n, 16);
  assert.strictEqual(pA.cells['survived'][0].n, 4);
  assert.strictEqual(pA.cells['survived'][1].n, 1);
  assert.ok(Math.abs(pA.cells['village-lost'][1].share - 16 / 60) < 1e-12);
  // Legacy string death records carry no day → honestly excluded from the
  // day-bucketed cause tables, never invented.
  assert.strictEqual(mA.skippedDeathsNoDay, 418);
  assert.deepStrictEqual(mA.deaths, {});
  const htmlA = heat.renderHTML(mA);
  for (const needle of ['winseek', 'village-lost', 'survived', '0–30', '31–60', '39 (65%)', '16 (27%)', '>55</b>']) {
    assert.ok(htmlA.includes(needle), 'HTML contains ' + JSON.stringify(needle));
  }
  console.log('A ok: real corpus 60 rows → 55 village-lost / 5 survived, cells sum, HTML cells present');

  // ---------- B. synthetic rows, both real record shapes ----------
  const synth = [
    // runDays result shape: harness terminal + object death records.
    { policyId: 'competent', seed: 7, days: 17, endReason: 'village-lost',
      stop: { version: 1, kind: 'engine-ending', engineOver: true, won: false, villageLost: true, iterations: 17, gameDay: 17 },
      samples: { deaths: [
        { day: 12, kind: 'combat', who: 'v_3', cause: 'mauling', player: false },
        { day: 15, kind: 'combat', who: 'v_9', cause: 'mauling', player: true },
      ] } },
    // A win: endReason 'over-other' + won flag → terminal 'won'.
    { policyId: 'capable', seed: 8, days: 134, endReason: 'over-other', won: true,
      stop: { version: 1, kind: 'engine-ending', engineOver: true, won: true, villageLost: false, iterations: 134, gameDay: 134 },
      samples: { deaths: [] } },
    // Observation cap: 'survived' in the open bucket.
    { policyId: 'competent', seed: 9, days: 180, endReason: 'survived',
      stop: { version: 1, kind: 'observation-cap', engineOver: false, won: false },
      samples: { deaths: [] } },
    // Legacy sweep shape: top-level string deaths, no policy → 'unknown' facet.
    { seed: 10, days: 31, endReason: 'village-lost', won: false,
      deaths: ['villager combat', 'villager starvation'] },
    // Bucket edges.
    { policyId: 'competent', seed: 11, days: 30, endReason: 'village-lost', samples: { deaths: [] } },
    { policyId: 'competent', seed: 12, days: 31, endReason: 'village-lost', samples: { deaths: [] } },
    { policyId: 'competent', seed: 13, days: 151, endReason: 'over-other', samples: { deaths: [] } },
  ];
  const rowsB = synth.map(r => heat.normalizeRow(r, null));
  assert.ok(rowsB.every(Boolean));
  const mB = heat.aggregate(rowsB, { title: 'B' });
  assert.strictEqual(cellSum(mB), 7, 'all 7 synthetic rows land in cells');
  assert.deepStrictEqual(mB.policies.map(p => p.policy), ['capable', 'competent', 'unknown'],
    'facets split by policy; policy-less rows → unknown, nothing invented');
  const byPol = Object.fromEntries(mB.policies.map(p => [p.policy, p]));
  // Win normalization.
  assert.strictEqual(byPol.capable.cells['won'][4].n, 1, 'won at day 134 → 121–150');
  assert.ok(mB.terminals.includes('won'));
  // Competent: village-lost days 17/30 → 0–30, day 31 → 31–60.
  assert.strictEqual(byPol.competent.cells['village-lost'][0].n, 2);
  assert.strictEqual(byPol.competent.cells['village-lost'][1].n, 1);
  // survived day 180 → 151+; over-other day 151 → 151+.
  assert.strictEqual(byPol.competent.cells['survived'][5].n, 1);
  assert.strictEqual(byPol.competent.cells['over-other'][5].n, 1);
  // Unknown facet: 1 legacy row, day 31 → 31–60.
  assert.strictEqual(byPol.unknown.total, 1);
  assert.strictEqual(byPol.unknown.cells['village-lost'][1].n, 1);
  // Death-cause aggregation from harness object records.
  const dl = mB.deaths['village-lost'][0];
  assert.strictEqual(dl.total, 2);
  assert.deepStrictEqual(dl.top[0], { cause: 'mauling', n: 2, share: 1 });
  const htmlB = heat.renderHTML(mB);
  for (const needle of ['capable', 'competent', 'unknown', 'won', '151+', 'mauling']) {
    assert.ok(htmlB.includes(needle), 'HTML contains ' + JSON.stringify(needle));
  }
  const jsonB = JSON.parse(heat.renderJSON(mB));
  assert.strictEqual(jsonB.schema, 'heatmap-terminal/1');
  assert.strictEqual(jsonB.rowCount, 7);
  console.log('B ok: facets split (3), won/village-lost/survived/over-other normalized, bucket edges, death causes');

  // ---------- C. one real runDays row via the shared kit ----------
  const { Game } = await loadGame({ seed: 7, mode: 'heatmap-test', fullTelemetry: false });
  await setupGame(Game);
  let real;
  await quietLog(async () => {
    real = await runDays(Game, { id: 'heatmap-test-zero' }, { days: 5, sampleEvery: 5 });
  });
  assert.ok(['village-lost', 'over-other', 'survived'].includes(real.endReason),
    'real endReason ∈ {' + ['village-lost', 'over-other', 'survived'].join(',') + '}, got ' + real.endReason);
  assert.strictEqual(real.stop && real.stop.version, 1, 'stop record versioned');
  assert.ok(Array.isArray(real.samples.deaths), 'samples.deaths array');
  assert.ok(Number.isFinite(real.days));
  assert.strictEqual(real.policyId, 'heatmap-test-zero');
  const n = heat.normalizeRow(real, null);
  assert.strictEqual(n.policy, 'heatmap-test-zero');
  const mC = heat.aggregate([n]);
  assert.strictEqual(cellSum(mC), 1, 'real row lands in exactly one cell');
  assert.strictEqual(mC.policies[0].cells[n.terminal][0].n, 1, 'day ≤5 → 0–30');
  console.log(`C ok: real runDays row — endReason=${real.endReason} days=${real.days} deaths=${real.samples.deaths.length}`);

  console.log('HEATMAP-TERMINAL-PROOF PASS');
}

main().catch(e => { console.error('HEATMAP-TERMINAL-PROOF FAIL: ' + (e && e.stack || e)); process.exit(1); });
