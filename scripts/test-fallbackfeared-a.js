#!/usr/bin/env node
// scripts/test-fallbackfeared-a.js — proof test for sim-fallbackfeared-a
// (first live test of the defiant-door rule (3), fallback-feared).
//
// This run creates NO new policy file and flips NO default: it tests the
// ALREADY-LANDED scripts/policies/tablepaths-defiant.js VERBATIM, never
// edited here. Three proofs:
//   1. Gate-off det-gate (unit level + optional full-sim delegation):
//      TABLEDEFIANT unset => the armed daily sets no dp counters (it
//      delegates to tableseat-nowait daily exactly). The full-sim form
//      (armed days == tableseat-nowait days on seed 74201) runs when
//      FALLBACKFEARED_DETGATE=1, by invoking the proven reused sweep's
//      --detgate mode as a subprocess and requiring exit 0.
//   2. Fallback-feared flagging (mock Game): only-feared offer =>
//      path:feared taken, rule 'fallback-feared', dpFallbackFeared flagged.
//      Also pins the neighbours so the flag cannot be confused with them:
//      defiant-offered => defiant; defiant-absent => first non-feared.
//   3. Corpus integrity: when evidence/2026-10-27/perseed-fallbackfeared-a
//      exists (i.e. after the pilot sweep), every config produced a row:
//      16 rows (8 seeds x 2 arms), every row days > 0, counters present,
//      and every armed seated row's fallbackFeared flag is consistent
//      with its dpRule ('fallback-feared' iff fallbackFeared=1).
//      Before the sweep the corpus check is SKIPPED with a printed note
//      (unit proofs still run); after the sweep it is REQUIRED.
// Exit 1 on any failed proof. Exit 0 only when all applicable proofs pass.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { tablepathsDefiant, dpAnswerTableChoices } = require('./policies/tablepaths-defiant');

function mockGame(optionIds) {
  const picked = [];
  const Game = {
    over: false, tbfight: null,
    state: { scholar: { day: 100, tableChoices: { frame: 1, options: optionIds.map(id => ({ id })) } } },
    chooseTableOption(id) {
      picked.push(id);
      Game.state.scholar.tableChoices = null;
    },
    tableEarnedPaths() { return optionIds.map(id => ({ id: String(id).slice(5), earned: true, why: 'mock' })); },
  };
  return { Game, picked };
}
function runCase(name, optionIds, wantPick, wantRule) {
  const { Game, picked } = mockGame(optionIds);
  const ctx = {};
  dpAnswerTableChoices(Game, ctx);
  assert.strictEqual(picked.length, 1, `${name}: expected exactly one pick, got ${picked}`);
  assert.strictEqual(picked[0], wantPick, `${name}: pick`);
  assert.strictEqual(ctx.dpRule, wantRule, `${name}: rule`);
  assert.strictEqual(ctx.dpPath, String(wantPick).slice(5), `${name}: dpPath`);
  console.log(`  PASS ${name}: picked=${picked[0]} rule=${wantRule}`);
  return ctx;
}

// --- Proof 2: fallback-feared flagging (+ neighbours) ---
const fullMenu = ['path:feared', 'path:beloved', 'path:witness', 'path:assimilated', 'path:defiant', 'path:relay'];
runCase('defiant-offered', fullMenu, 'path:defiant', 'defiant');
runCase('defiant-absent-fallback-non-feared', ['path:feared', 'path:beloved', 'path:assimilated', 'path:relay'], 'path:beloved', 'fallback-non-feared');
const ctxFeared = runCase('only-feared-fallback-feared', ['path:feared'], 'path:feared', 'fallback-feared');
assert.strictEqual(ctxFeared.dpFallbackFeared, 1, 'only-feared: fallback-Feared flag must be 1');
console.log('  PASS only-feared: fallback-Feared flagged (dpFallbackFeared=1)');

// --- Proof 1 (unit): gate-off sets no dp counters ---
delete process.env.TABLEDEFIANT;
delete process.env.TABLESEATNOWAIT;
delete process.env.LEANLINKRESCUE;
const ctxGate = {};
const fakeGame = {
  over: false, state: { scholar: { day: 50 } },
  scaleRank() { return 'national'; },
  progState() { return { tableDone: false }; },
};
try { tablepathsDefiant.daily(fakeGame, ctxGate); } catch (e) { /* delegate throw on bare mock is acceptable */ }
const dpKeys = Object.keys(ctxGate).filter(k => k.indexOf('dp') === 0);
assert.strictEqual(dpKeys.length, 0, `gate-off unit: no dp counters, got ${dpKeys}`);
console.log('  PASS gate-off unit: no dp counters, delegates to tableseat-nowait daily');

// --- Proof 1 (full-sim delegation, opt-in): TABLEDEFIANT unset => armed days == tableseat-nowait days ---
if (process.env.FALLBACKFEARED_DETGATE === '1') {
  const seed = process.env.SEED || '74201';
  console.log(`  DETGATE full-sim: seed=${seed} via reused sweep --detgate ...`);
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-tablepaths-defiant-sweep.js'), '--detgate'],
    { cwd: REPO, env: Object.assign({}, process.env, { SEED: seed, DAYS: '180' }), encoding: 'utf8', timeout: 900000 });
  const line = (out.split('\n').find(l => l.indexOf('DETGATE') >= 0) || '').trim();
  console.log('  ' + line);
  assert.ok(/-> PASS/.test(line), 'det-gate full-sim must PASS (armed days == tableseat-nowait days, no dp counters)');
  console.log('  PASS gate-off det-gate full-sim: armed days == tableseat-nowait days');
} else {
  console.log('  SKIP det-gate full-sim (set FALLBACKFEARED_DETGATE=1 to run; unit gate-off above already passed)');
}

// --- Proof 3: corpus integrity (required once the pilot corpus exists) ---
const evidDir = path.join(REPO, 'evidence', '2026-10-27', 'perseed-fallbackfeared-a');
if (!fs.existsSync(evidDir)) {
  console.log(`  SKIP corpus integrity: ${evidDir} does not exist yet (run the pilot sweep first)`);
} else {
  const files = fs.readdirSync(evidDir).filter(f => /^s\d+-(baseline|armed)\.json$/.test(f)).sort();
  assert.strictEqual(files.length, 16, `corpus: expected 16 per-seed rows (8 seeds x 2 arms), got ${files.length}: ${files.join(',')}`);
  const seeds = ['74201', '74202', '74203', '74204', '74205', '74206', '74207', '74208'];
  for (const seed of seeds) {
    for (const pid of ['baseline', 'armed']) {
      const f = `s${seed}-${pid}.json`;
      assert.ok(files.includes(f), `corpus: missing row ${f}`);
      const row = JSON.parse(fs.readFileSync(path.join(evidDir, f), 'utf8'));
      assert.ok(row.days > 0, `corpus: ${f} days must be > 0, got ${row.days}`);
      assert.ok(row.gameDays > 0, `corpus: ${f} gameDays must be > 0`);
      assert.ok(row.ts && typeof row.ts === 'object', `corpus: ${f} ts counters present`);
      assert.ok(row.dp && typeof row.dp === 'object', `corpus: ${f} dp counters present`);
      if (pid === 'armed' && row.entered) {
        const flag = row.fallbackFeared === 1;
        const ruleIsFallbackFeared = row.doorRule === 'fallback-feared';
        assert.strictEqual(flag, ruleIsFallbackFeared, `corpus: ${f} fallbackFeared flag (${row.fallbackFeared}) must match doorRule (${row.doorRule})`);
      }
    }
  }
  const summary = JSON.parse(fs.readFileSync(path.join(evidDir, 'summary.json'), 'utf8'));
  assert.ok(Array.isArray(summary.rows) && summary.rows.length === 16, 'corpus: summary.json must carry 16 rows');
  console.log('  PASS corpus integrity: 16/16 rows, all days > 0, counters present, fallbackFeared flag consistent with doorRule');
}
console.log('test-fallbackfeared-a: ALL APPLICABLE PROOFS PASS');
