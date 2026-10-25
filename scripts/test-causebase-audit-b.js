#!/usr/bin/env node
// test-causebase-audit-b.js — proof for the sim-causebase-b audit.
//
// Each leg maps to a pre-registered audit criterion (see
// evidence/2026-10-25/sim-causebase-audit-b.md). Legs assert, they do not
// print verdicts: a failure exits non-zero naming the leg. The verdict
// (PARTIALLY SATISFIES) follows from which legs pass and which fail:
//   C1 reproduction, C2 scale, C3 population separation, C4 disjointness,
//   C5 guardrail usability all PASS; C6 machine-readable scope now PASSES
//   (fixed by sim-causemeta-b: the JSON carries scope, and compare refuses
//   a different substrate — proven in C5a/C7b below); C7 tail/truncation
//   honesty stays PARTIAL (tail quantified, truncation still exact-match
//   only — not the causemeta arm's target, so the audit verdict stays
//   PARTIALLY on C7 alone).
//
// Synthetic corpora live in a temp dir (created + removed by this test);
// nothing is written into the repo. Real corpora are read only.
'use strict';
const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HERE = __dirname;
const REPO = path.dirname(HERE);
const ANALYZER = path.join(HERE, 'analyze-causebase-b.js');
const BASELINE = path.join(REPO, 'evidence', '2026-10-25', 'sim-causebase-b-baseline.json');
const CORPORA = [
  'pantrystarve-b-corpus', 'fullpantry-diag-b-corpus', 'fullpantry-confirm-b-corpus',
  'awayration-size-b-corpus', 'fullpantry-casecount-b-corpus', 'awayration-cover-b-corpus',
].map(d => path.join(REPO, 'evidence', '2026-10-24', d));

function run(args, opts) {
  return spawnSync(process.execPath, [ANALYZER].concat(args),
    { encoding: 'utf8', ...(opts || {}) });
}
function runOk(args, opts) {
  const r = run(args, opts);
  assert.strictEqual(r.status, 0, 'analyzer exited ' + r.status + ': ' + r.stderr);
  return { out: JSON.parse(r.stdout), stdout: r.stdout };
}

const committed = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));

// ---- C1: reproduction (byte-identical + exact denominators) ----
// NOTE: the analyzer echoes input dir paths verbatim into its output, so
// byte-identical reproduction requires the ORIGINAL relative invocation
// (same path spellings the landed run used). Counts are path-independent;
// the byte comparison is path-spelling-dependent — recorded as a caveat.
const CORPORA_REL = [
  'pantrystarve-b-corpus', 'fullpantry-diag-b-corpus', 'fullpantry-confirm-b-corpus',
  'awayration-size-b-corpus', 'fullpantry-casecount-b-corpus', 'awayration-cover-b-corpus',
].map(d => path.join('evidence', '2026-10-24', d));
const repro = runOk(CORPORA_REL, { cwd: REPO });
assert.strictEqual(repro.stdout, fs.readFileSync(BASELINE, 'utf8'),
  'C1 repro stdout must be byte-identical to the committed baseline JSON');
assert.strictEqual(repro.out.rowsTotal, 1302, 'C1 rowsTotal');
assert.strictEqual(repro.out.excludedByKind, 0, 'C1 excludedByKind');
assert.strictEqual(repro.out.excludedScholar, 732, 'C1 excludedScholar');
assert.strictEqual(repro.out.villagerDeaths, 570, 'C1 villagerDeaths');
assert.strictEqual(Object.keys(repro.out.pooledCauses).length, 48, 'C1 label count');
assert.deepStrictEqual(repro.out.pooledCauses, committed.pooledCauses, 'C1 pooled counts');
assert.deepStrictEqual(
  repro.out.corpora.map(c => c.villagerDeaths), [40, 65, 71, 22, 247, 125],
  'C1 per-corpus villager deaths');
console.log('C1 reproduction (byte-identical, 1302/0/732/570, 48 labels): PASS');

// ---- C2: scale (order of magnitude above one 8-seed band) ----
assert.ok(repro.out.villagerDeaths >= 300, 'C2 >= 300 villager deaths');
const filesIngested = repro.out.corpora.reduce((n, c) => n + c.filesIngested.length, 0);
assert.strictEqual(filesIngested, 144, 'C2 144 per-seed files');
assert.ok(repro.out.villagerDeaths >= 10 * 30, 'C2 >= 10x a single band (~30)');
console.log('C2 scale (570 deaths, 144 runs): PASS');

// ---- C3: population separation, recomputed from corpora (not prose) ----
const scholarAbsent = {};
const scholarPresent = {};
for (const dir of CORPORA) {
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!Array.isArray(j.deathRows)) continue; // summary file: skipped
    for (const r of j.deathRows) {
      if (!r.isPlayer) continue;
      if (Object.prototype.hasOwnProperty.call(committed.pooledCauses, r.cause)) {
        scholarPresent[r.cause] = (scholarPresent[r.cause] || 0) + 1;
      } else {
        scholarAbsent[r.cause] = (scholarAbsent[r.cause] || 0) + 1;
      }
    }
  }
}
assert.strictEqual(scholarAbsent['the arena'], 613,
  'C3 scholar-only "the arena" must be 613 (the guardrail trap label)');
assert.deepStrictEqual(Object.keys(scholarAbsent).sort(),
  ['lockjaw', 'the arena', 'the expedition', 'the night'],
  'C3 scholar-only cause set');
console.log('C3 population separation (scholar-only set incl. the arena x613): PASS');

// ---- C4: seed disjointness ----
assert.deepStrictEqual(repro.out.seedOverlap, [], 'C4 seedOverlap must be empty');
console.log('C4 seed disjointness (overlap []): PASS');

// ---- C5a: guardrail usability on REAL out-of-baseline data (deathcensus baseline side) ----
// NOTE (sim-causemeta-b): compare mode now REFUSES this different-substrate
// dir (policy baseline vs baseline-scope competent) instead of running it
// silently — that refusal IS the C6 fix. The decomposition is therefore
// recomputed from the files directly (same numbers the old compare run
// produced), and the refusal itself is asserted.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'causebase-audit-b-'));
try {
  const dcBase = path.join(tmp, 'dc-base');
  fs.mkdirSync(dcBase);
  const dcDir = path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathcensus-a');
  for (const f of fs.readdirSync(dcDir).filter(x => x.endsWith('-baseline.json')).sort()) {
    fs.copyFileSync(path.join(dcDir, f), path.join(dcBase, f));
  }
  let dcRows = 0, dcKind = 0, dcScholar = 0, dcVill = 0;
  const dcVillCauses = {};
  for (const f of fs.readdirSync(dcBase).filter(x => x.endsWith('.json')).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dcBase, f), 'utf8'));
    for (const r of (j.deathcensus && j.deathcensus.deaths) || []) {
      dcRows += 1;
      if (r.kind !== 'villager' && r.kind !== 'person') { dcKind += 1; continue; }
      if (r.player) { dcScholar += 1; continue; }
      dcVill += 1;
      dcVillCauses[r.cause] = (dcVillCauses[r.cause] || 0) + 1;
    }
  }
  assert.strictEqual(dcRows, 261, 'C5a deathcensus rows');
  assert.strictEqual(dcKind, 192, 'C5a monster exclusions');
  assert.strictEqual(dcScholar, 42, 'C5a scholar exclusions');
  assert.strictEqual(dcVill, 27, 'C5a deathcensus villager deaths');
  assert.strictEqual(dcVillCauses.Nevermore, 1, 'C5a genuine other-substrate label Nevermore n=1');
  assert.strictEqual(dcVillCauses['The Suburb'], 1, 'C5a genuine other-substrate label The Suburb n=1');
  const dcRefuse = run(['--baseline', BASELINE, dcBase]);
  assert.strictEqual(dcRefuse.status, 2, 'C5a different-substrate compare must refuse (C6 fix)');
  assert.ok(dcRefuse.stderr.includes('SCOPE-MISMATCH'), 'C5a refusal must say SCOPE-MISMATCH');
  assert.ok(dcRefuse.stderr.includes('"competent"') && dcRefuse.stderr.includes('"baseline"'),
    'C5a refusal must name both policies; got: ' + dcRefuse.stderr);
  console.log('C5a real out-of-baseline data (261=192+42+27 recomputed; compare refuses, SCOPE-MISMATCH): PASS');

  // ---- C5b: guardrail usability on a SYNTHETIC hypothetical arm ----
  const hypo = path.join(tmp, 'hypo');
  fs.mkdirSync(hypo);
  const rows = [];
  const v = c => rows.push({ kind: 'villager', isPlayer: false, cause: c });
  for (let i = 0; i < 2; i++) v('monster');
  for (let i = 0; i < 10; i++) v('starvation');
  for (let i = 0; i < 4; i++) v('famine fever');       // absent, n=4 -> flagged
  for (let i = 0; i < 2; i++) v('river drowning');     // absent, n=2 -> churn only
  v('stripes flowing where no wind blows');            // full-length near-miss of a truncated baseline label
  // NOTE (sim-causemeta-b): the hypo arm declares the baseline's substrate
  // (competent policy, flags 1/1, 150d summary meta) so compare runs it as
  // an in-scope arm; scopeCheck must report match.
  fs.writeFileSync(path.join(hypo, 'h1.json'), JSON.stringify({ seed: 1, policy: 'competent', plentydepri: 1, depositgate: 1, deathRows: rows }));
  fs.writeFileSync(path.join(hypo, 'sweep-competent.json'), JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: 150, seeds: [1], env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } } }));
  const hy = runOk(['--baseline', BASELINE, hypo]);
  assert.strictEqual(hy.out.scopeCheck.status, 'match', 'C5b matched hypo scopeCheck must be match');
  assert.strictEqual(hy.out.villagerDeaths, 19, 'C5b hypo villager deaths');
  const byLabel = Object.fromEntries(hy.out.newLabels.map(n => [n.label, n]));
  assert.strictEqual(byLabel['famine fever'].flagged, true, 'C5b absent n=4 must flag');
  assert.strictEqual(byLabel['river drowning'].flagged, false, 'C5b absent n=2 must NOT flag');
  assert.ok('stripes flowing where no wind blows' in byLabel,
    'C5b truncated near-miss must appear as absent (exact-match limitation, documented)');
  const starv = hy.out.presentLabels.find(p => p.label === 'starvation');
  assert.strictEqual(starv.shareShiftFlagged, true, 'C5b starvation 10/19 vs pooled 8.6% must flag');
  console.log('C5b synthetic arm (new n=4 flagged, n=2 churn, share-shift flagged): PASS');

  // ---- C7: tail + truncation quantified ----
  const table = committed.pooledTable;
  const n1 = table.filter(r => r.count === 1);
  const n2 = table.filter(r => r.count === 2);
  assert.strictEqual(n1.length, 26, 'C7 singletons');
  assert.strictEqual(n2.length, 8, 'C7 doubletons');
  assert.strictEqual(n1.length + n2.length, 34, 'C7 tail labels at most twice');
  const trunc = table.filter(r => r.label.length === 32);
  assert.strictEqual(trunc.length, 4, 'C7 exactly 4 labels at the 32-char truncation edge');
  assert.ok(trunc.every(r => r.count === 1), 'C7 all truncated labels are singletons');
  console.log('C7 tail quantified (26x1, 8x2, 34/48 at most twice; 4 truncated singletons): PASS');

  // ---- C6: machine-readable scope — FIXED by sim-causemeta-b ----
  // Prior to the fix this leg recorded FAIL: the JSON carried no substrate
  // fields. The fix adds scope; this leg now asserts its exact content.
  // C7 truncation handling is still open, so the audit verdict stays
  // PARTIALLY on C7 alone — see the final line.
  const sc = committed.scope;
  assert.ok(sc && typeof sc === 'object', 'C6 scope object must exist');
  assert.strictEqual(sc.policy, 'competent', 'C6 scope policy');
  assert.deepStrictEqual(sc.horizon, { days: 150, mode: 'death-aware' }, 'C6 scope horizon');
  assert.deepStrictEqual(sc.flags, { PLENTYDEPRI: 1, DEPOSITGATE: 1 }, 'C6 scope flags');
  assert.strictEqual(sc.corpora.length, 6, 'C6 scope corpus list');
  assert.deepStrictEqual(sc.counts,
    { rowsTotal: 1302, excludedByKind: 0, excludedScholar: 732, villagerDeaths: 570, labelCount: 48 },
    'C6 scope counts');
  console.log('C6 machine-readable scope: PASS (policy competent, 150d death-aware, flags 1/1, 6 corpora, counts 1302/0/732/570/48)');

  // ---- C7b: the guard does not break in-scope use ----
  // Prior to sim-causemeta-b this leg recorded the analyzer's substrate
  // silence: compare on a different-substrate dir exited 0 with no
  // warning. The fix turns that into a refusal — proven in C5a above — so
  // this leg now proves the other side: a matched in-scope compare still
  // exits 0 with scopeCheck match.
  const hyMatch = runOk(['--baseline', BASELINE, hypo]);
  assert.strictEqual(hyMatch.out.scopeCheck.status, 'match',
    'C7b matched in-scope compare must exit 0 with scopeCheck match');
  console.log('C7b guard preserves in-scope use (matched compare exit 0, scopeCheck match): PASS');

  // ---- Heterogeneity (metric-review input): per-corpus starvation shares ----
  const starvShares = repro.out.corpora.map(c => {
    const n = (c.causes.starvation || 0) / c.villagerDeaths;
    return Math.round(n * 1000) / 10;
  });
  console.log('per-corpus starvation shares %: ' + starvShares.join(', ')
    + ' (pooled 8.6%) — pooled share is a mixture, not a clean control');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log('test-causebase-audit-b: ALL LEGS PASS (C6 fixed by sim-causemeta-b; audit verdict stays PARTIALLY on C7 truncation only)');
