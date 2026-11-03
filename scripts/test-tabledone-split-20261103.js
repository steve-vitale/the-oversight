#!/usr/bin/env node
// test-tabledone-split-20261103.js — proof for the tableDone recorder
// split (fleshout-20261103T0115Z, axis scale-onramp). Instrument only.
//
// Cases (pre-registered in scripts/tabledone-split-prereg-20261103.md):
//   1. tableFlags unit cases: all four progState boolean combos +
//      missing/non-object input. Waiting-only => (1,0); done =>
//      (0,1) in the engine's normal exclusive shape, and (1,1) is
//      reported as-is if the game ever holds both (no exclusivity
//      forced by the recorder); neither => (0,0).
//   2. splitFromLegacy cases: split fields present => used as-is;
//      legacy table=0 => (0,0); legacy table=1 => (null,null) UNKNOWN,
//      never guessed; no table field => (null,null).
//   3. Fixture corpus (FIXTURE, not a real corpus result): synthetic
//      per-seed records in real-corpus shape covering waiting-only,
//      done, neither, legacy-unknown, and legacy-zero; the analyzer
//      must report wall.tableWaiting=1, wall.tableDone=1,
//      wall.tableUnknown=1, wall.table=3.
//   4. Replay comparison: the real evidence/2026-11-02/perseed-
//      heraldband-widen corpus (8 seeds, collapsed field only) is
//      copied to /tmp (the analyzer writes analysis.json into its
//      target dir, so it is NEVER run in place in the repo) and
//      analyzed with the pre-split analyzer (from git HEAD) vs the
//      new analyzer. All pre-existing analysis.json fields must be
//      identical; only the three new wall fields and the two new
//      per-seed split fields may differ. Expected new-corpus verdict
//      for this legacy corpus: tableWaiting=0, tableDone=0,
//      tableUnknown=6 (the six table=1 seeds), table=6 unchanged.
//
// Writes only under os.tmpdir(). Exits non-zero on any failure.
// Usage: node scripts/test-tabledone-split-20261103.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const { tableFlags, splitFromLegacy } = require(path.join(__dirname, 'fightoutcome-tableflags'));
let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log('PASS ' + name);
  else { failures += 1; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// --- 1. tableFlags ---
check('flags waiting-only', eq(tableFlags({ tableWaiting: true, tableDone: false }), { tableWaiting: 1, tableDone: 0, table: 1 }));
check('flags done', eq(tableFlags({ tableWaiting: false, tableDone: true }), { tableWaiting: 0, tableDone: 1, table: 1 }));
check('flags neither', eq(tableFlags({ tableWaiting: false, tableDone: false }), { tableWaiting: 0, tableDone: 0, table: 0 }));
check('flags both-held-as-is', eq(tableFlags({ tableWaiting: true, tableDone: true }), { tableWaiting: 1, tableDone: 1, table: 1 }));
check('flags missing-fields', eq(tableFlags({}), { tableWaiting: 0, tableDone: 0, table: 0 }));
check('flags null-pg', eq(tableFlags(null), { tableWaiting: 0, tableDone: 0, table: 0 }));
check('flags undefined-pg', eq(tableFlags(undefined), { tableWaiting: 0, tableDone: 0, table: 0 }));

// --- 2. splitFromLegacy ---
check('legacy split-present', eq(splitFromLegacy({ table: 1, tableWaiting: 1, tableDone: 0 }), { tableWaiting: 1, tableDone: 0 }));
check('legacy split-present-done', eq(splitFromLegacy({ table: 1, tableWaiting: 0, tableDone: 1 }), { tableWaiting: 0, tableDone: 1 }));
check('legacy table=0', eq(splitFromLegacy({ table: 0 }), { tableWaiting: 0, tableDone: 0 }));
check('legacy table=1-unknown', eq(splitFromLegacy({ table: 1 }), { tableWaiting: null, tableDone: null }));
check('legacy no-table-unknown', eq(splitFromLegacy({}), { tableWaiting: null, tableDone: null }));
check('legacy null-rec', eq(splitFromLegacy(null), { tableWaiting: null, tableDone: null }));

// --- helpers for analyzer runs (always in /tmp) ---
function minimalRec(seed, extra) {
  return Object.assign({ seed: seed, run: 'r1', attempts: [], tbFights: [],
    fieldFights: [], titanOutcomesEnd: [], unresolved: [], national: 0, won: 0,
    wave4: 0, wave5: 0, gameDays: 100 }, extra);
}
function runAnalyzer(analyzerPath, dir) {
  execFileSync(process.execPath, [analyzerPath, dir], { stdio: 'pipe' });
  return JSON.parse(fs.readFileSync(path.join(dir, 'analysis.json'), 'utf8'));
}
function stripNew(a) {
  const c = JSON.parse(JSON.stringify(a));
  if (c.wall) { delete c.wall.tableWaiting; delete c.wall.tableDone; delete c.wall.tableUnknown; }
  (c.perSeed || []).forEach(function (s) { delete s.tableWaiting; delete s.tableDone; });
  return c;
}

// --- 3. Fixture corpus (FIXTURE — synthetic, labeled, not real runs) ---
const fixDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabledone-fixture-'));
[
  minimalRec(1, { table: 1, tableWaiting: 1, tableDone: 0 }), // waiting-only
  minimalRec(2, { table: 1, tableWaiting: 0, tableDone: 1 }), // done
  minimalRec(3, { table: 0, tableWaiting: 0, tableDone: 0 }), // neither
  minimalRec(4, { table: 1 }), // legacy table=1 => UNKNOWN
  minimalRec(5, { table: 0 }), // legacy table=0 => (0,0)
].forEach(function (r, i) {
  fs.writeFileSync(path.join(fixDir, 'fo-fixture-s' + (i + 1) + '-r1.json'), JSON.stringify(r) + '\n');
});
const fixOut = runAnalyzer(path.join(__dirname, 'fightoutcome-analyze-20261102.js'), fixDir);
check('fixture wall.tableWaiting=1', fixOut.wall.tableWaiting === 1, fixOut.wall);
check('fixture wall.tableDone=1', fixOut.wall.tableDone === 1, fixOut.wall);
check('fixture wall.tableUnknown=1', fixOut.wall.tableUnknown === 1, fixOut.wall);
check('fixture wall.table=3 (legacy preserved)', fixOut.wall.table === 3, fixOut.wall);
check('fixture per-seed unknown is null', fixOut.perSeed[3].tableWaiting === null && fixOut.perSeed[3].tableDone === null, fixOut.perSeed[3]);
check('fixture per-seed legacy-zero is 0,0', fixOut.perSeed[4].tableWaiting === 0 && fixOut.perSeed[4].tableDone === 0, fixOut.perSeed[4]);

// --- 4. Replay comparison on the real heraldband-widen corpus ---
const corpus = path.join(REPO, 'evidence', '2026-11-02', 'perseed-heraldband-widen');
if (!fs.existsSync(corpus)) {
  console.log('SKIP replay: corpus dir absent: ' + corpus);
} else {
  const oldDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabledone-replay-old-'));
  const newDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabledone-replay-new-'));
  fs.readdirSync(corpus).filter(function (f) { return f.endsWith('.json') && f !== 'analysis.json'; }).forEach(function (f) {
    const body = fs.readFileSync(path.join(corpus, f));
    fs.writeFileSync(path.join(oldDir, f), body);
    fs.writeFileSync(path.join(newDir, f), body);
  });
  // Pre-split analyzer, recovered verbatim from git HEAD (this
  // worktree's committed version predates the split edits).
  const oldAnalyzer = path.join(os.tmpdir(), 'fightoutcome-analyze-OLD-20261103.js');
  fs.writeFileSync(oldAnalyzer, execSync('git -C ' + REPO + ' show HEAD:scripts/fightoutcome-analyze-20261102.js', { encoding: 'utf8' }));
  const oldOut = runAnalyzer(oldAnalyzer, oldDir);
  const newOut = runAnalyzer(path.join(__dirname, 'fightoutcome-analyze-20261102.js'), newDir);
  check('replay pre-existing fields identical', eq(stripNew(oldOut), stripNew(newOut)));
  check('replay wall.table unchanged (=6)', newOut.wall.table === 6 && oldOut.wall.table === 6, { old: oldOut.wall.table, new: newOut.wall.table });
  check('replay legacy corpus tableWaiting=0 tableDone=0 tableUnknown=6',
    newOut.wall.tableWaiting === 0 && newOut.wall.tableDone === 0 && newOut.wall.tableUnknown === 6, newOut.wall);
  check('replay no legacy run mislabeled done', newOut.perSeed.every(function (s) { return s.tableDone === 0 || s.tableDone === null; }));
  console.log('replay corpus seeds: ' + newOut.seeds + ' wall: ' + JSON.stringify(newOut.wall));
}

if (failures) { console.error('tabledone-split proof: ' + failures + ' FAILURES'); process.exit(1); }
console.log('tabledone-split proof: ALL PASS');
