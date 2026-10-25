#!/usr/bin/env node
// scripts/analyze-deathrow-b.js — sim-deathrow-b POOLED LIST + N + guardrail
// driver (loop B, run fleshout-loop-b-20261025T1752Z, axis food-economy).
//
// This driver does NOT re-implement pooling: the pool/compare engine is
// scripts/analyze-causebase-b.js (the causemeta-guarded analyzer), invoked
// as a subprocess. This script adds only the deathrow-b layer:
//   1. Pool mode on the deathrow corpus dir -> the pooled tableseat-nowait
//      JSON (evidence/2026-10-25/sim-deathrow-b-baseline.json). The file
//      is the analyzer's own output, never hand-typed, so re-running the
//      analyzer reproduces it byte-identically (scope included).
//   2. N calibration by the causebase audit's rule: the churn band is
//      labels at low counts that are single-seed blips or monster names
//      (a new monster name showing up once or twice IS the normal case —
//      the roster is an open class). N = one above the highest churn-band
//      count: the smallest count clearing the observed churn band. The
//      full histogram with per-label seed counts is printed so the
//      calibration is auditable, not asserted.
//   3. Guardrail demonstration (the causemeta G6 contract, applied to
//      THIS baseline): compare mode with the pooled JSON as --baseline
//      on (a) a matched arm (this corpus dir) -> exit 0, scopeCheck
//      match; (b) a different-substrate dir (the competent
//      awayration-size-b corpus) -> exit 2, SCOPE-MISMATCH naming both
//      scopes. A future arm holding only the JSON + analyzer can run
//      exactly this check.
//
// Usage:
//   node scripts/analyze-deathrow-b.js [--corpus <dir>] [--out <file>]
// Defaults: corpus evidence/2026-10-25/perseed-deathrow-b,
// out evidence/2026-10-25/sim-deathrow-b-baseline.json.
// Exit 0 on a completed report (verdicts are data); exit 1 on any failed
// expectation (pool failure, guard mismatch, N rule violation).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZER = path.join(REPO, 'scripts', 'analyze-causebase-b.js');

const argv = process.argv.slice(2);
let corpusDir = path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathrow-b');
let outPath = path.join(REPO, 'evidence', '2026-10-25', 'sim-deathrow-b-baseline.json');
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--corpus') corpusDir = argv[++i];
  else if (argv[i] === '--out') outPath = argv[++i];
  else { console.error('analyze-deathrow-b: unknown flag: ' + argv[i]); process.exit(2); }
}
const MISMATCH_DIR = path.join(REPO, 'evidence', '2026-10-24', 'awayration-size-b-corpus');

function runAnalyzer(args, expectExit) {
  const r = spawnSync('node', [ANALYZER].concat(args), { cwd: REPO, encoding: 'utf8', timeout: 600000 });
  return r;
}

// ---- 1. pool ----
console.log('=== 1. pooled tableseat-nowait list (analyzer pool mode) ===');
const pool = runAnalyzer([corpusDir, '--out', outPath]);
if (pool.status !== 0) {
  console.error('POOL FAILED (exit ' + pool.status + '): ' + (pool.stderr || pool.stdout || '').slice(0, 500));
  process.exit(1);
}
const pooled = JSON.parse(fs.readFileSync(outPath, 'utf8'));
console.log('pooled JSON -> ' + outPath);
console.log('scope: policy=' + JSON.stringify(pooled.scope.policy) +
  ' horizon=' + JSON.stringify(pooled.scope.horizon) +
  ' flags=' + JSON.stringify(pooled.scope.flags));
console.log('counts: rowsTotal=' + pooled.rowsTotal +
  ' excludedByKind=' + pooled.excludedByKind +
  ' excludedScholar=' + pooled.excludedScholar +
  ' villagerDeaths=' + pooled.villagerDeaths +
  ' labels=' + Object.keys(pooled.pooledCauses).length);

// ---- 2. histogram + churn-band N ----
console.log('\n=== 2. label histogram + N calibration (audit rule) ===');
// Per-label seed spread, read from the per-seed files (the analyzer's
// pooledCauses has counts only; seed spread is the churn-band evidence).
const monsterNames = new Set();
try {
  const roster = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of roster) {
    if (!m) continue;
    for (const k of ['id', 'name', 'unknown']) if (m[k]) monsterNames.add(String(m[k]).toLowerCase());
    for (const vn of (m.villageNames || [])) if (vn) monsterNames.add(String(vn).toLowerCase());
  }
} catch (e) { console.log('(monster roster unreadable; churn rule falls back to single-seed blips only)'); }
const labelSeeds = {};
const labelCounts = {};
for (const f of fs.readdirSync(corpusDir).filter(x => x.endsWith('.json')).sort()) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8')); } catch (e) { continue; }
  if (!Array.isArray(j.deathRows)) continue;
  for (const r of j.deathRows) {
    if ((r.kind !== 'villager' && r.kind !== 'person') || r.isPlayer) continue;
    const label = r.cause;
    labelCounts[label] = (labelCounts[label] || 0) + 1;
    (labelSeeds[label] = labelSeeds[label] || new Set()).add(j.seed);
  }
}
const rows = Object.keys(labelCounts).map(label => ({
  label, count: labelCounts[label], seeds: labelSeeds[label].size,
  monsterName: monsterNames.has(String(label).toLowerCase()),
})).sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : 1));
let churnMax = 0;
for (const r of rows) {
  const churn = r.count <= 2 && (r.seeds === 1 || r.monsterName);
  r.churn = churn;
  if (churn && r.count > churnMax) churnMax = r.count;
  console.log(`  ${r.count}x ${r.label} (seeds=${r.seeds}${r.monsterName ? ', monster-name' : ''})${churn ? ' [churn band]' : ''}`);
}
const N = churnMax + 1;
console.log(`churn band max count = ${churnMax} -> recommended N = ${N}`);
console.log(`rule: N = one above the highest churn-band count (churn = count<=2 AND (single-seed OR monster-name));`);
console.log(`a future arm label absent from this baseline flags as "new" at count >= ${N} (analyzer --new-threshold ${N}).`);
// NOTE (not a violation): a PRESENT label below N that is not churn —
// e.g. a generic cause recurring on 2 seeds at n=2 — does not break N.
// N governs only labels ABSENT from this baseline: a future new generic
// label at n=2 would not flag under N=3, the same known blind spot the
// competent baseline carries (its 'experiment' doubleton). It is
// reported here as a caveat, never hidden, and it does not move N: the
// tail is churn-dominated, and lowering N to 2 would flag routine new
// monster names (an open class) as "new" — the exact false positive the
// audit's N=3 exists to avoid.
const belowNNonChurn = rows.filter(r => r.count < N && !r.churn);
if (belowNNonChurn.length) {
  console.log('CAVEAT (present labels below N, not churn — documented, not a failure):');
  for (const r of belowNNonChurn) console.log(`  ${r.count}x ${r.label} (seeds=${r.seeds}): a future NEW generic label at this count would not flag under N=${N}.`);
}
const villagerTotal = rows.reduce((t, r) => t + r.count, 0);
console.log(`villager deaths in histogram = ${villagerTotal} (pooled villagerDeaths = ${pooled.villagerDeaths})`);
if (villagerTotal !== pooled.villagerDeaths) { console.error('HISTOGRAM MISMATCH vs pooled counts'); process.exit(1); }

// ---- 3. guardrail demonstration ----
console.log('\n=== 3. guardrail demonstration (causemeta contract on this baseline) ===');
const matched = runAnalyzer(['--baseline', outPath, corpusDir]);
let matchedJson = null;
try { matchedJson = JSON.parse(matched.stdout); } catch (e) {}
const matchedOk = matched.status === 0 && matchedJson && matchedJson.scopeCheck && matchedJson.scopeCheck.status === 'match';
console.log(`matched arm (this corpus dir): exit=${matched.status} scopeCheck=${matchedJson && matchedJson.scopeCheck ? matchedJson.scopeCheck.status : 'n/a'} -> ${matchedOk ? 'PASS' : 'FAIL'}`);
const mismatched = runAnalyzer(['--baseline', outPath, MISMATCH_DIR]);
const mismatchOk = mismatched.status === 2 && /SCOPE-MISMATCH/.test(mismatched.stderr || '');
console.log(`mismatched arm (competent awayration-size-b corpus): exit=${mismatched.status} SCOPE-MISMATCH=${/SCOPE-MISMATCH/.test(mismatched.stderr || '')} -> ${mismatchOk ? 'PASS' : 'FAIL'}`);
if (mismatchOk) console.log('  refusal text: ' + String(mismatched.stderr).split('\n')[0].slice(0, 300));
if (!matchedOk || !mismatchOk) { console.error('GUARDRAIL DEMONSTRATION FAILED'); process.exit(1); }

console.log('\n=== analyze-deathrow-b DONE ===');
console.log(`pooled baseline: ${outPath}`);
console.log(`villagerDeaths=${pooled.villagerDeaths} labels=${Object.keys(pooled.pooledCauses).length} recommended N=${N} guardrail matched/mismatched PASS`);
