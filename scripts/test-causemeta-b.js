#!/usr/bin/env node
// test-causemeta-b.js — proof for the sim-causemeta-b C6 fix.
//
// The audit (evidence/2026-10-25/sim-causebase-audit-b.md) found C6 FAIL:
// the committed causebase JSON carried no substrate metadata, so a future
// arm holding only the JSON could not verify comparability, and the
// analyzer exited 0 with no warning on a different-substrate dir. This
// proof judges the fix against its pre-registered GO (G1–G4, see
// evidence/2026-10-25/sim-causemeta-b.md):
//   G1: baseline JSON carries machine-readable scope metadata sufficient
//       to verify comparability (policy, horizon, flags, seed/corpus list,
//       kind-filter definition, headline counts), with the audit's counted
//       numbers reproduced EXACTLY (1302/0/732/570, 48 labels).
//   G2: the analyzer, given a different-substrate dir, exits NON-ZERO
//       with a LOUD scope-mismatch message naming both scopes (never 0
//       silent, the exact C6 failure).
//   G3: the analyzer on the matched baseline still exits 0 and reproduces
//       the audit numbers exactly.
//   G4: a future arm holding ONLY the JSON + analyzer can verify
//       comparability — the proof reads scope from the JSON file itself,
//       not from the author's memory of the audit.
// Plus the guard's deliberate edges: a scope-less legacy baseline warns
// (not silently passes), an arm field undeclared in corpus files warns
// as partial (unknown is not a mismatch), and a mixed-substrate pool
// refuses outright.
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

function run(args, opts) {
  return spawnSync(process.execPath, [ANALYZER].concat(args),
    { encoding: 'utf8', ...(opts || {}) });
}
function runOk(args, opts) {
  const r = run(args, opts);
  assert.strictEqual(r.status, 0, 'analyzer exited ' + r.status + ': ' + r.stderr);
  return { out: JSON.parse(r.stdout), stdout: r.stdout, stderr: r.stderr };
}
function writeDir(root, name, files) {
  const d = path.join(root, name);
  fs.mkdirSync(d, { recursive: true });
  for (const [f, obj] of Object.entries(files)) {
    fs.writeFileSync(path.join(d, f), typeof obj === 'string' ? obj : JSON.stringify(obj));
  }
  return d;
}
// One per-seed sweep-format file. `flags` may be omitted to model an arm
// whose corpus files declare no flags (the partial-warning edge).
function armFile(seed, policy, flags, causes) {
  const rows = [];
  for (const [cause, n] of Object.entries(causes)) {
    for (let i = 0; i < n; i++) rows.push({ kind: 'villager', isPlayer: false, cause });
  }
  const f = { seed, policy, deathRows: rows };
  if (flags) { f.plentydepri = flags[0]; f.depositgate = flags[1]; }
  return f;
}
// A summary file carrying sweep meta (policy/days/env), skipped as a file
// but harvested for scope derivation — exactly like sweep-competent.json.
function summaryMeta(policy, days, env) {
  return { meta: { cell: policy, policy, days, seeds: [], env } };
}

const committed = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));

// ---- G1a: the JSON carries the full scope, with exact literal values ----
assert.ok(committed.scope && typeof committed.scope === 'object', 'G1a scope object must exist');
assert.strictEqual(committed.scope.scopeVersion, 1, 'G1a scopeVersion');
assert.strictEqual(committed.scope.policy, 'competent', 'G1a policy');
assert.deepStrictEqual(committed.scope.horizon, { days: 150, mode: 'death-aware' }, 'G1a horizon');
assert.deepStrictEqual(committed.scope.flags, { PLENTYDEPRI: 1, DEPOSITGATE: 1 }, 'G1a flags');
assert.deepStrictEqual(committed.scope.kindFilter.kinds, ['villager', 'person'], 'G1a kindFilter kinds');
assert.strictEqual(committed.scope.kindFilter.scholarExcluded, true, 'G1a scholar excluded');
assert.strictEqual(committed.scope.kindFilter.description,
  'kind in {villager, person} AND scholar flag false', 'G1a kindFilter description');
assert.deepStrictEqual(committed.scope.labels, { form: 'raw, unnormalized', truncationChars: 32 }, 'G1a labels');
assert.deepStrictEqual(
  committed.scope.corpora.map(c => [c.dir, c.seedFirst, c.seedLast, c.seedCount, c.filesIngested]),
  [
    ['evidence/2026-10-24/pantrystarve-b-corpus', 94301, 94308, 8, 8],
    ['evidence/2026-10-24/fullpantry-diag-b-corpus', 94401, 94416, 16, 16],
    ['evidence/2026-10-24/fullpantry-confirm-b-corpus', 94421, 94436, 16, 16],
    ['evidence/2026-10-24/awayration-size-b-corpus', 94501, 94508, 8, 8],
    ['evidence/2026-10-24/fullpantry-casecount-b-corpus', 94601, 94664, 64, 64],
    ['evidence/2026-10-24/awayration-cover-b-corpus', 94701, 94732, 32, 32],
  ], 'G1a corpus seed bands');
assert.deepStrictEqual(committed.scope.counts,
  { rowsTotal: 1302, excludedByKind: 0, excludedScholar: 732, villagerDeaths: 570, labelCount: 48 },
  'G1a headline counts in scope');
console.log('G1a scope content (policy, 150d death-aware, flags 1/1, kind filter, bands, counts): PASS');

// ---- G1b/G3a: the audit's counted numbers reproduce EXACTLY ----
assert.strictEqual(committed.rowsTotal, 1302, 'G1b rowsTotal');
assert.strictEqual(committed.excludedByKind, 0, 'G1b excludedByKind');
assert.strictEqual(committed.excludedScholar, 732, 'G1b excludedScholar');
assert.strictEqual(committed.villagerDeaths, 570, 'G1b villagerDeaths');
assert.strictEqual(Object.keys(committed.pooledCauses).length, 48, 'G1b label count');
assert.strictEqual(committed.pooledCauses.monster, 219, 'G1b monster count');
assert.strictEqual(committed.pooledCauses.starvation, 49, 'G1b starvation count');
assert.deepStrictEqual(
  committed.corpora.map(c => c.villagerDeaths), [40, 65, 71, 22, 247, 125],
  'G1b per-corpus villager deaths');
console.log('G1b/G3a audit numbers reproduced exactly (1302/0/732/570, 48 labels): PASS');

// ---- G1c: the new file is analyzer-generated, not hand-typed ----
const CORPORA_REL = [
  'pantrystarve-b-corpus', 'fullpantry-diag-b-corpus', 'fullpantry-confirm-b-corpus',
  'awayration-size-b-corpus', 'fullpantry-casecount-b-corpus', 'awayration-cover-b-corpus',
].map(d => path.join('evidence', '2026-10-24', d));
const repro = runOk(CORPORA_REL, { cwd: REPO });
assert.strictEqual(repro.stdout, fs.readFileSync(BASELINE, 'utf8'),
  'G1c pool re-run must be byte-identical to the committed baseline (scope included)');
assert.deepStrictEqual(repro.out.scope, committed.scope, 'G1c regenerated scope matches committed scope');
console.log('G1c scope is analyzer-generated (pool re-run byte-identical incl. scope): PASS');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'causemeta-b-test-'));
try {
  // ---- G2a: policy mismatch refuses, naming both scopes ----
  const wrongPolicy = writeDir(tmp, 'wrong-policy', {
    'a.json': armFile(1, 'tableseat-nowait', [1, 1], { monster: 3 }),
  });
  const gp = run(['--baseline', BASELINE, wrongPolicy]);
  assert.strictEqual(gp.status, 2, 'G2a policy mismatch must exit non-zero, got ' + gp.status);
  assert.strictEqual(gp.stdout, '', 'G2a refusal must emit no stdout JSON');
  assert.ok(gp.stderr.includes('SCOPE-MISMATCH'), 'G2a stderr must say SCOPE-MISMATCH; got: ' + gp.stderr);
  assert.ok(gp.stderr.includes('"competent"'), 'G2a stderr must name the baseline policy');
  assert.ok(gp.stderr.includes('"tableseat-nowait"'), 'G2a stderr must name the arm policy');
  console.log('G2a policy mismatch refuses (exit 2, names competent vs tableseat-nowait): PASS');

  // ---- G2b: flag mismatch refuses, naming the flag and both values ----
  const wrongFlag = writeDir(tmp, 'wrong-flag', {
    'a.json': armFile(1, 'competent', [0, 1], { monster: 3 }),
  });
  const gf = run(['--baseline', BASELINE, wrongFlag]);
  assert.strictEqual(gf.status, 2, 'G2b flag mismatch must exit non-zero');
  assert.ok(gf.stderr.includes('SCOPE-MISMATCH'), 'G2b stderr must say SCOPE-MISMATCH');
  assert.ok(gf.stderr.includes('flag PLENTYDEPRI: baseline 1 vs arm 0'),
    'G2b stderr must name the flag leg; got: ' + gf.stderr);
  console.log('G2b flag mismatch refuses (exit 2, flag PLENTYDEPRI baseline 1 vs arm 0): PASS');

  // ---- G2c: horizon mismatch refuses, naming both day counts ----
  const wrongDays = writeDir(tmp, 'wrong-days', {
    'a.json': armFile(1, 'competent', [1, 1], { monster: 3 }),
    'sweep-competent.json': summaryMeta('competent', 200, { PLENTYDEPRI: '1', DEPOSITGATE: '1' }),
  });
  const gh = run(['--baseline', BASELINE, wrongDays]);
  assert.strictEqual(gh.status, 2, 'G2c horizon mismatch must exit non-zero');
  assert.ok(gh.stderr.includes('SCOPE-MISMATCH'), 'G2c stderr must say SCOPE-MISMATCH');
  assert.ok(gh.stderr.includes('horizon days: baseline 150 vs arm 200'),
    'G2c stderr must name the horizon leg; got: ' + gh.stderr);
  console.log('G2c horizon mismatch refuses (exit 2, horizon days baseline 150 vs arm 200): PASS');

  // ---- G2d: the audit's exact C6 failure case — real different-substrate dir ----
  const dcBase = path.join(tmp, 'dc-base');
  fs.mkdirSync(dcBase);
  const dcDir = path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathcensus-a');
  for (const f of fs.readdirSync(dcDir).filter(x => x.endsWith('-baseline.json')).sort()) {
    fs.copyFileSync(path.join(dcDir, f), path.join(dcBase, f));
  }
  const gd = run(['--baseline', BASELINE, dcBase]);
  assert.strictEqual(gd.status, 2, 'G2d deathcensus dir must now refuse (was exit 0 silent)');
  assert.ok(gd.stderr.includes('SCOPE-MISMATCH'), 'G2d stderr must say SCOPE-MISMATCH');
  assert.ok(gd.stderr.includes('"competent"') && gd.stderr.includes('"baseline"'),
    'G2d stderr must name both policies; got: ' + gd.stderr);
  console.log('G2d real different-substrate dir refuses (exit 2, was exit 0 silent): PASS');

  // ---- G3b: matched synthetic arm still exits 0 with a match verdict ----
  const matched = writeDir(tmp, 'matched', {
    'a.json': armFile(1, 'competent', [1, 1],
      { monster: 2, starvation: 10, 'famine fever': 4, 'river drowning': 2 }),
    'sweep-competent.json': summaryMeta('competent', 150, { PLENTYDEPRI: '1', DEPOSITGATE: '1' }),
  });
  const gm = runOk(['--baseline', BASELINE, matched]);
  assert.strictEqual(gm.out.scopeCheck.status, 'match', 'G3b matched arm scopeCheck must be match');
  assert.strictEqual(gm.out.villagerDeaths, 18, 'G3b matched arm villager deaths');
  const byLabel = Object.fromEntries(gm.out.newLabels.map(n => [n.label, n]));
  assert.strictEqual(byLabel['famine fever'].flagged, true, 'G3b absent n=4 still flags');
  assert.strictEqual(byLabel['river drowning'].flagged, false, 'G3b absent n=2 still churn only');
  console.log('G3b matched synthetic arm exits 0 (scopeCheck match, guardrail flags intact): PASS');

  // ---- G3c: matched REAL in-scope corpus still exits 0 ----
  const realMatched = runOk(['--baseline', BASELINE,
    path.join(REPO, 'evidence', '2026-10-24', 'awayration-size-b-corpus')]);
  assert.strictEqual(realMatched.out.scopeCheck.status, 'match', 'G3c real in-scope corpus must match');
  assert.strictEqual(realMatched.out.villagerDeaths, 22, 'G3c awayration-size villager deaths');
  console.log('G3c real in-scope corpus exits 0 (scopeCheck match, 22 villager deaths): PASS');

  // ---- G4: JSON-ONLY verification — scope values flow from the file, not memory ----
  // NOTE: this leg deliberately uses no literal policy/flag/day values for
  // arm construction: every expected value is read out of the JSON file
  // itself, exactly as a future arm holding only the JSON would read it.
  const s = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).scope;
  const jsonOnlyMatched = writeDir(tmp, 'json-only-matched', {
    'a.json': armFile(1, s.policy, [s.flags.PLENTYDEPRI, s.flags.DEPOSITGATE], { monster: 3 }),
    'sweep-competent.json': summaryMeta(s.policy, s.horizon.days,
      { PLENTYDEPRI: String(s.flags.PLENTYDEPRI), DEPOSITGATE: String(s.flags.DEPOSITGATE) }),
  });
  const jo1 = runOk(['--baseline', BASELINE, jsonOnlyMatched]);
  assert.strictEqual(jo1.out.scopeCheck.status, 'match',
    'G4 arm built from JSON scope must match');
  const otherPolicy = s.policy + '-variant';
  const jsonOnlyMismatch = writeDir(tmp, 'json-only-mismatch', {
    'a.json': armFile(1, otherPolicy, [s.flags.PLENTYDEPRI, s.flags.DEPOSITGATE], { monster: 3 }),
  });
  const jo2 = run(['--baseline', BASELINE, jsonOnlyMismatch]);
  assert.strictEqual(jo2.status, 2, 'G4 arm built from JSON scope with one leg changed must refuse');
  assert.ok(jo2.stderr.includes('SCOPE-MISMATCH'), 'G4 mismatch must say SCOPE-MISMATCH');
  assert.ok(jo2.stderr.includes(JSON.stringify(s.policy)), 'G4 stderr must name the JSON scope policy');
  assert.ok(jo2.stderr.includes(JSON.stringify(otherPolicy)), 'G4 stderr must name the variant policy');
  console.log('G4 JSON-only verification (matched 0 / variant 2, values read from the file): PASS');

  // ---- Edge E1: scope-less legacy baseline warns loudly, still runs ----
  const legacy = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  delete legacy.scope;
  const legacyPath = path.join(tmp, 'legacy-baseline.json');
  fs.writeFileSync(legacyPath, JSON.stringify(legacy, null, 2) + '\n');
  const le = runOk(['--baseline', legacyPath, matched]);
  assert.strictEqual(le.out.scopeCheck.status, 'unverifiable', 'E1 legacy baseline scopeCheck');
  assert.ok(le.stderr.includes('SCOPE-WARNING'), 'E1 legacy baseline must warn loudly; got: ' + le.stderr);
  console.log('E1 scope-less legacy baseline warns (SCOPE-WARNING, exit 0): PASS');

  // ---- Edge E2: arm field undeclared in corpus files -> partial warning, exit 0 ----
  const noFlags = writeDir(tmp, 'no-flags', {
    'a.json': armFile(1, 'competent', null, { monster: 3 }),
  });
  const pa = runOk(['--baseline', BASELINE, noFlags]);
  assert.strictEqual(pa.out.scopeCheck.status, 'partial', 'E2 undeclared flags must be partial');
  assert.ok(pa.stderr.includes('SCOPE-PARTIAL'), 'E2 must warn SCOPE-PARTIAL; got: ' + pa.stderr);
  console.log('E2 undeclared arm flags warn as partial (SCOPE-PARTIAL, exit 0): PASS');

  // ---- Edge E3: mixed-substrate pool refuses outright ----
  const mixed = writeDir(tmp, 'mixed', {
    'a.json': armFile(1, 'competent', [1, 1], { monster: 1 }),
    'b.json': armFile(2, 'tableseat-nowait', [1, 1], { monster: 1 }),
  });
  const mx = run([mixed]);
  assert.strictEqual(mx.status, 2, 'E3 mixed-substrate pool must exit non-zero');
  assert.ok(mx.stderr.includes('substrate conflict'), 'E3 stderr must name the conflict; got: ' + mx.stderr);
  console.log('E3 mixed-substrate pool refuses (exit 2, substrate conflict): PASS');

  console.log('test-causemeta-b: ALL LEGS PASS (G1–G4 GO, plus legacy/partial/conflict edges)');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
