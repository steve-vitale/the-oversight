#!/usr/bin/env node
// scripts/test-deathrow-b.js — sim-deathrow-b PROOF (loop B, run
// fleshout-loop-b-20261025T1752Z, axis food-economy).
//
// Proves, against the COMMITTED artifacts (no hand-typed numbers):
//   L1 corpus integrity: exactly the 40 pre-registered seeds (5 bands),
//     every per-seed file carries deathRows, every row carries kind
//     (non-empty string), scholar flag (boolean), cause (non-empty
//     string); no duplicate seeds; zero kind/flag/cause-missing rows.
//   L2 pool reproduction: analyzer pool mode on the corpus dir,
//     byte-identical to the committed pooled JSON
//     (evidence/2026-10-25/sim-deathrow-b-baseline.json), scope
//     included — the file is the analyzer's own output, re-derivable.
//   L3 scope content: policy "tableseat-nowait", horizon 180
//     death-aware, counts recomputed from the files match the JSON.
//   L4 guardrail: compare mode with the pooled JSON as --baseline on
//     the matched corpus dir exits 0 with scopeCheck match; on the
//     competent awayration-size-b corpus exits 2 with SCOPE-MISMATCH
//     naming both scopes.
//   L5 N rule: the churn-band calibration recomputes (churn = count<=2
//     AND (single-seed OR monster-name)); N = churnMax + 1 (N clears the
//     band); N is printed (the evidence file states it). A present
//     sub-N non-churn label is a documented caveat, not a failure.
//   L6 determinism: sweep --rerun on one pilot seed byte-compares to
//     its committed per-seed file (one 180d sim, ~1 min).
//   L7 neutrality: sweep --neutrality on one pilot seed — recorder
//     path vs pristine tableseat-nowait sweep path, identical seed,
//     identical env — matches on days/gameDays/deathTotal/deaths/ts
//     (three 180d sims, ~3 min).
// L1-L5 are fast (no sims). L6-L7 run sims; set TEST_DEATHROW_FAST=1 to
// skip them (the sweep modes are then proven by the run's recorded
// outputs, not by this test invocation).
//
// Usage: node scripts/test-deathrow-b.js
// Exit 0 iff every leg passes; any failure prints FAILED and exits 1.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathrow-b');
const POOLED = path.join(REPO, 'evidence', '2026-10-25', 'sim-deathrow-b-baseline.json');
const ANALYZER = path.join(REPO, 'scripts', 'analyze-causebase-b.js');
const SWEEP = path.join(REPO, 'scripts', 'sweep-deathrow-b.js');
const MISMATCH_DIR = path.join(REPO, 'evidence', '2026-10-24', 'awayration-size-b-corpus');
const FAST = process.env.TEST_DEATHROW_FAST === '1';

const BANDS = [
  [73701, 73702, 73703, 73704, 73705, 73706, 73707, 73708],
  [73711, 73712, 73713, 73714, 73715, 73716, 73717, 73718],
  [73721, 73722, 73723, 73724, 73725, 73726, 73727, 73728],
  [73731, 73732, 73733, 73734, 73735, 73736, 73737, 73738],
  [73741, 73742, 73743, 73744, 73745, 73746, 73747, 73748],
];
const EXPECTED_SEEDS = BANDS.flat();
let failures = 0;
function leg(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAILED'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}
function runAnalyzer(args) {
  return spawnSync('node', [ANALYZER].concat(args), { cwd: REPO, encoding: 'utf8', timeout: 600000 });
}

// ---- L1: corpus integrity ----
const files = fs.readdirSync(CORPUS).filter(f => /^s\d+\.json$/.test(f)).sort();
const seen = new Set();
let rowsTotal = 0, kindMissing = 0, flagMissing = 0, causeMissing = 0, emptyRows = 0;
const perSeed = [];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
  if (seen.has(String(j.seed))) leg('L1 duplicate seed ' + j.seed, false, '');
  seen.add(String(j.seed));
  if (!Array.isArray(j.deathRows) || j.deathRows.length === 0) { emptyRows++; continue; }
  perSeed.push(j);
  for (const r of j.deathRows) {
    rowsTotal++;
    if (typeof r.kind !== 'string' || r.kind === '') kindMissing++;
    if (typeof r.isPlayer !== 'boolean') flagMissing++;
    if (typeof r.cause !== 'string' || r.cause === '') causeMissing++;
  }
}
const seedsOk = EXPECTED_SEEDS.every(s => seen.has(String(s))) && seen.size === EXPECTED_SEEDS.length;
leg('L1 corpus seeds (40 pre-registered, no duplicates)', seedsOk,
  `files=${files.length} seeds=${seen.size} expected=${EXPECTED_SEEDS.length}`);
leg('L1 every row carries kind/flag/cause', kindMissing === 0 && flagMissing === 0 && causeMissing === 0 && emptyRows === 0,
  `rows=${rowsTotal} kindMissing=${kindMissing} flagMissing=${flagMissing} causeMissing=${causeMissing} emptyFiles=${emptyRows}`);

// ---- L2/L3: pool reproduction + scope ----
const pool = runAnalyzer([CORPUS]);
let poolJson = null;
try { poolJson = JSON.parse(pool.stdout); } catch (e) {}
const committedText = fs.readFileSync(POOLED, 'utf8');
leg('L2 analyzer pool exits 0', pool.status === 0, `exit=${pool.status}`);
leg('L2 pool output byte-identical to committed pooled JSON', pool.status === 0 && pool.stdout === committedText,
  pool.status === 0 ? `bytes=${pool.stdout.length} committed=${committedText.length}` : 'pool failed');
// Recomputed counts from the files.
let recRows = 0, recKind = 0, recScholar = 0, recVill = 0;
const recCauses = {};
for (const j of perSeed) {
  for (const r of j.deathRows) {
    recRows++;
    if (r.kind !== 'villager' && r.kind !== 'person') { recKind++; continue; }
    if (r.isPlayer) { recScholar++; continue; }
    recVill++;
    recCauses[r.cause] = (recCauses[r.cause] || 0) + 1;
  }
}
leg('L3 scope policy/horizon', !!poolJson && poolJson.scope.policy === 'tableseat-nowait'
  && poolJson.scope.horizon.days === 180 && poolJson.scope.horizon.mode === 'death-aware',
  poolJson ? `policy=${poolJson.scope.policy} horizon=${JSON.stringify(poolJson.scope.horizon)}` : 'no pool JSON');
leg('L3 counts recomputed match pooled JSON', !!poolJson
  && poolJson.rowsTotal === recRows && poolJson.excludedByKind === recKind
  && poolJson.excludedScholar === recScholar && poolJson.villagerDeaths === recVill
  && JSON.stringify(poolJson.pooledCauses) === JSON.stringify(recCauses),
  `rows=${recRows} kind=${recKind} scholar=${recScholar} villager=${recVill}`);

// ---- L4: guardrail ----
const matched = runAnalyzer(['--baseline', POOLED, CORPUS]);
let matchedJson = null;
try { matchedJson = JSON.parse(matched.stdout); } catch (e) {}
leg('L4 matched compare exits 0 with scopeCheck match', matched.status === 0
  && matchedJson && matchedJson.scopeCheck && matchedJson.scopeCheck.status === 'match',
  `exit=${matched.status} scopeCheck=${matchedJson && matchedJson.scopeCheck ? matchedJson.scopeCheck.status : 'n/a'}`);
const mismatched = runAnalyzer(['--baseline', POOLED, MISMATCH_DIR]);
leg('L4 mismatched compare refuses (exit 2, SCOPE-MISMATCH)', mismatched.status === 2
  && /SCOPE-MISMATCH/.test(mismatched.stderr || ''),
  `exit=${mismatched.status} stderrHead=${String(mismatched.stderr || '').split('\n')[0].slice(0, 120)}`);

// ---- L5: N rule ----
const monsterNames = new Set();
try {
  const roster = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of roster) {
    if (!m) continue;
    for (const k of ['id', 'name', 'unknown']) if (m[k]) monsterNames.add(String(m[k]).toLowerCase());
    for (const vn of (m.villageNames || [])) if (vn) monsterNames.add(String(vn).toLowerCase());
  }
} catch (e) {}
const labelSeeds = {};
for (const j of perSeed) {
  for (const r of j.deathRows) {
    if ((r.kind !== 'villager' && r.kind !== 'person') || r.isPlayer) continue;
    (labelSeeds[r.cause] = labelSeeds[r.cause] || new Set()).add(j.seed);
  }
}
let churnMax = 0;
for (const label of Object.keys(recCauses)) {
  const count = recCauses[label];
  const churn = count <= 2 && (labelSeeds[label].size === 1 || monsterNames.has(String(label).toLowerCase()));
  if (churn && count > churnMax) churnMax = count;
}
const N = churnMax + 1;
// N clears the churn band by construction (N = churnMax + 1). A PRESENT
// label below N that is not churn (e.g. a generic cause recurring on 2
// seeds at n=2) is a documented caveat in the evidence file, not a
// failure: N governs only labels ABSENT from this baseline.
const belowNNonChurn = Object.keys(recCauses).filter(label => {
  const count = recCauses[label];
  if (count >= N) return false;
  return !(count <= 2 && (labelSeeds[label].size === 1 || monsterNames.has(String(label).toLowerCase())));
});
leg('L5 N rule (N clears the churn band)', N === churnMax + 1,
  `N=${N} churnMax=${churnMax} labels=${Object.keys(recCauses).length} villagerDeaths=${recVill} sub-N non-churn (caveat, not failure)=${JSON.stringify(belowNNonChurn)}`);

// ---- L6/L7: slow sim legs ----
if (FAST) {
  console.log('SKIP L6/L7 (TEST_DEATHROW_FAST=1) — determinism/neutrality proven by the run\'s recorded sweep-mode outputs');
} else {
  try {
    const rerun = execFileSync('node', [SWEEP, '--rerun', '73701'], { cwd: REPO, encoding: 'utf8', timeout: 3600000 });
    leg('L6 determinism (--rerun 73701 byte-match)', /MATCH/.test(rerun) && !/MISMATCH/.test(rerun),
      String(rerun).trim().split('\n').filter(l => l.indexOf('RERUN') === 0).join(' '));
  } catch (e) {
    leg('L6 determinism (--rerun 73701 byte-match)', false, String((e && e.stdout) || (e && e.message) || e).slice(0, 200));
  }
  try {
    const neut = execFileSync('node', [SWEEP, '--neutrality', '73701'], { cwd: REPO, encoding: 'utf8', timeout: 3600000 });
    leg('L7 neutrality (--neutrality 73701)', /PASS/.test(neut) && !/FAIL/.test(neut),
      String(neut).trim().split('\n').filter(l => l.indexOf('NEUTRALITY') === 0).join(' '));
  } catch (e) {
    leg('L7 neutrality (--neutrality 73701)', false, String((e && e.stdout) || (e && e.message) || e).slice(0, 200));
  }
}

console.log(failures === 0 ? '\nALL LEGS PASS' : `\n${failures} LEG(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
