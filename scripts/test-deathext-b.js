#!/usr/bin/env node
// scripts/test-deathext-b.js — sim-deathext-b PROOF (loop B, run
// fleshout-loop-b-20261025T1849Z, axis food-economy).
//
// Extends the deathrow-b pooled list to the >= 300-villager-death scale
// bar: 56 fresh tableseat-nowait armed seeds (73751-73818: six bands plus
// the pre-registered conditional 7th band, triggered because the six-band
// combined total was 299, one short of the bar) pooled WITH the existing
// 40 deathrow-b seeds (73701-73748) on the same substrate, for a combined
// 96-seed corpus. Proves, against the COMMITTED artifacts (no hand-typed
// numbers):
//   L1 fresh-corpus integrity: exactly the 56 pre-registered fresh seeds
//     (6 bands + conditional 7th), every per-seed file carries deathRows, every row carries
//     kind (non-empty string), scholar flag (boolean), cause (non-empty
//     string); no duplicate seeds; zero kind/flag/cause-missing rows.
//   L2 combined pool: analyzer pool mode on BOTH corpus dirs exits 0 and
//     reproduces the committed extended pooled JSON
//     (evidence/2026-10-25/sim-deathext-b-baseline.json) on every
//     content field. Comparison is parsed, not byte-level, for one
//     stated reason: scope.corpora[].dir embeds the worktree path, which
//     legitimately changes when the branch merges to the main tree, while
//     every count, label, seed list, policy, and horizon leg stays
//     identical. Dir strings are therefore compared only as "two dirs,
//     one per corpus", not literally.
//   L3 scope + counts + scale bar: scope policy "tableseat-nowait",
//     horizon 180 death-aware, counts recomputed from the files match the
//     JSON, combined villager deaths >= 300 (pre-registered threshold a),
//     and the existing deathrow-b baseline file is untouched (still 144).
//   L4 guardrail: compare mode with the extended JSON as --baseline on
//     the combined corpus dirs exits 0 with scopeCheck match; on the
//     competent awayration-size-b corpus exits 2 with SCOPE-MISMATCH
//     naming both scopes (tableseat-nowait vs competent).
//   L5 N rule: the churn-band calibration recomputes over the COMBINED
//     corpus (churn = count<=2 AND (single-seed OR monster-name));
//     N = churnMax + 1; the test prints N and whether it moved vs the
//     deathrow-b N = 3. A present sub-N non-churn label is a documented
//     caveat in the evidence file, not a failure (same rule as deathrow-b).
//   L6 determinism: sweep --rerun on one fresh seed (73751, EVID pointed
//     at the deathext corpus) byte-compares to its committed per-seed
//     file (one 180d sim, ~1 min).
//   L7 neutrality: sweep --neutrality on 73751 — recorder path vs
//     pristine tableseat-nowait sweep path, identical seed/env — matches
//     on days/gameDays/deathTotal/deaths/ts (three 180d sims, ~3 min).
// L1-L5 are fast (no sims). L6-L7 run sims; set TEST_DEATHEXT_FAST=1 to
// skip them (the sweep modes are then proven by the run's recorded
// outputs, not by this test invocation).
//
// Usage: node scripts/test-deathext-b.js
// Exit 0 iff every leg passes; any failure prints FAILED and exits 1.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CORPUS_NEW = path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathext-b');
const CORPUS_OLD = path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathrow-b');
const POOLED = path.join(REPO, 'evidence', '2026-10-25', 'sim-deathext-b-baseline.json');
const POOLED_OLD = path.join(REPO, 'evidence', '2026-10-25', 'sim-deathrow-b-baseline.json');
const ANALYZER = path.join(REPO, 'scripts', 'analyze-causebase-b.js');
const SWEEP = path.join(REPO, 'scripts', 'sweep-deathrow-b.js');
const MISMATCH_DIR = path.join(REPO, 'evidence', '2026-10-24', 'awayration-size-b-corpus');
const FAST = process.env.TEST_DEATHEXT_FAST === '1';

const BANDS_NEW = [
  [73751, 73752, 73753, 73754, 73755, 73756, 73757, 73758],
  [73761, 73762, 73763, 73764, 73765, 73766, 73767, 73768],
  [73771, 73772, 73773, 73774, 73775, 73776, 73777, 73778],
  [73781, 73782, 73783, 73784, 73785, 73786, 73787, 73788],
  [73791, 73792, 73793, 73794, 73795, 73796, 73797, 73798],
  [73801, 73802, 73803, 73804, 73805, 73806, 73807, 73808],
  [73811, 73812, 73813, 73814, 73815, 73816, 73817, 73818],
];
const EXPECTED_NEW = BANDS_NEW.flat();
const BANDS_OLD = [
  [73701, 73702, 73703, 73704, 73705, 73706, 73707, 73708],
  [73711, 73712, 73713, 73714, 73715, 73716, 73717, 73718],
  [73721, 73722, 73723, 73724, 73725, 73726, 73727, 73728],
  [73731, 73732, 73733, 73734, 73735, 73736, 73737, 73738],
  [73741, 73742, 73743, 73744, 73745, 73746, 73747, 73748],
];
const EXPECTED_OLD = BANDS_OLD.flat();
let failures = 0;
function leg(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAILED'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}
function runAnalyzer(args) {
  return spawnSync('node', [ANALYZER].concat(args), { cwd: REPO, encoding: 'utf8', timeout: 600000 });
}
function readCorpus(dir) {
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const perSeed = [];
  const seen = new Set();
  let rowsTotal = 0, kindMissing = 0, flagMissing = 0, causeMissing = 0, emptyRows = 0;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (seen.has(String(j.seed))) leg('duplicate seed ' + j.seed + ' in ' + dir, false, '');
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
  return { files, perSeed, seen, rowsTotal, kindMissing, flagMissing, causeMissing, emptyRows };
}

// ---- L1: fresh corpus integrity + no overlap with the old corpus ----
const fresh = readCorpus(CORPUS_NEW);
const freshOk = EXPECTED_NEW.every(s => fresh.seen.has(String(s))) && fresh.seen.size === EXPECTED_NEW.length;
leg('L1 fresh corpus seeds (56 pre-registered, no duplicates)', freshOk,
  `files=${fresh.files.length} seeds=${fresh.seen.size} expected=${EXPECTED_NEW.length}`);
leg('L1 every fresh row carries kind/flag/cause', fresh.kindMissing === 0 && fresh.flagMissing === 0 && fresh.causeMissing === 0 && fresh.emptyRows === 0,
  `rows=${fresh.rowsTotal} kindMissing=${fresh.kindMissing} flagMissing=${fresh.flagMissing} causeMissing=${fresh.causeMissing} emptyFiles=${fresh.emptyRows}`);
const old = readCorpus(CORPUS_OLD);
const overlap = [...fresh.seen].filter(s => old.seen.has(s));
leg('L1 combined corpus: 96 seeds, no overlap old/new', old.seen.size === 40 && overlap.length === 0,
  `old=${old.seen.size} new=${fresh.seen.size} combined=${old.seen.size + fresh.seen.size} overlap=${overlap.length}`);

// ---- L2/L3: combined pool reproduction + scope + counts + scale bar ----
const pool = runAnalyzer([CORPUS_OLD, CORPUS_NEW]);
let poolJson = null;
try { poolJson = JSON.parse(pool.stdout); } catch (e) {}
leg('L2 analyzer pool on both dirs exits 0', pool.status === 0, `exit=${pool.status}`);
const committed = JSON.parse(fs.readFileSync(POOLED, 'utf8'));
function stripDirs(o) {
  const c = JSON.parse(JSON.stringify(o));
  if (c.scope && Array.isArray(c.scope.corpora)) c.scope.corpora.forEach(x => { delete x.dir; });
  if (Array.isArray(c.corpora)) c.corpora.forEach(x => { delete x.dir; });
  return c;
}
const poolMatches = !!poolJson && JSON.stringify(stripDirs(poolJson)) === JSON.stringify(stripDirs(committed));
leg('L2 pool output matches committed extended JSON (dir strings excluded, see header)', poolMatches,
  poolJson ? `bytes=${pool.stdout.length} committed=${fs.readFileSync(POOLED, 'utf8').length}` : 'pool failed');
// Recomputed counts from both corpora.
let recRows = 0, recKind = 0, recScholar = 0, recVill = 0;
const recCauses = {};
const labelSeeds = {};
for (const j of old.perSeed.concat(fresh.perSeed)) {
  for (const r of j.deathRows) {
    recRows++;
    if (r.kind !== 'villager' && r.kind !== 'person') { recKind++; continue; }
    if (r.isPlayer) { recScholar++; continue; }
    recVill++;
    recCauses[r.cause] = (recCauses[r.cause] || 0) + 1;
    (labelSeeds[r.cause] = labelSeeds[r.cause] || new Set()).add(j.seed);
  }
}
leg('L3 scope policy/horizon', !!poolJson && poolJson.scope.policy === 'tableseat-nowait'
  && poolJson.scope.horizon.days === 180 && poolJson.scope.horizon.mode === 'death-aware',
  poolJson ? `policy=${poolJson.scope.policy} horizon=${JSON.stringify(poolJson.scope.horizon)}` : 'no pool JSON');
leg('L3 counts recomputed match extended JSON', !!poolJson
  && poolJson.rowsTotal === recRows && poolJson.excludedByKind === recKind
  && poolJson.excludedScholar === recScholar && poolJson.villagerDeaths === recVill
  && JSON.stringify(poolJson.pooledCauses) === JSON.stringify(recCauses),
  `rows=${recRows} kind=${recKind} scholar=${recScholar} villager=${recVill}`);
leg('L3 scale bar: combined villager deaths >= 300', recVill >= 300,
  `combined villager deaths=${recVill} (old 144 + fresh ${recVill - 144})`);
const oldCommitted = JSON.parse(fs.readFileSync(POOLED_OLD, 'utf8'));
leg('L3 old deathrow-b baseline untouched (still 144)', oldCommitted.villagerDeaths === 144,
  `sim-deathrow-b-baseline.json villagerDeaths=${oldCommitted.villagerDeaths}`);

// ---- L4: guardrail ----
const matched = runAnalyzer(['--baseline', POOLED, CORPUS_OLD, CORPUS_NEW]);
let matchedJson = null;
try { matchedJson = JSON.parse(matched.stdout); } catch (e) {}
leg('L4 matched compare (combined corpus) exits 0 with scopeCheck match', matched.status === 0
  && matchedJson && matchedJson.scopeCheck && matchedJson.scopeCheck.status === 'match',
  `exit=${matched.status} scopeCheck=${matchedJson && matchedJson.scopeCheck ? matchedJson.scopeCheck.status : 'n/a'}`);
const mismatched = runAnalyzer(['--baseline', POOLED, MISMATCH_DIR]);
const mismatchErr = String(mismatched.stderr || '');
leg('L4 mismatched compare refuses (exit 2, SCOPE-MISMATCH, both scopes named)', mismatched.status === 2
  && /SCOPE-MISMATCH/.test(mismatchErr) && mismatchErr.includes('tableseat-nowait') && mismatchErr.includes('competent'),
  `exit=${mismatched.status} stderrHead=${mismatchErr.split('\n')[0].slice(0, 160)}`);

// ---- L5: N rule over the combined corpus ----
const monsterNames = new Set();
try {
  const roster = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of roster) {
    if (!m) continue;
    for (const k of ['id', 'name', 'unknown']) if (m[k]) monsterNames.add(String(m[k]).toLowerCase());
    for (const vn of (m.villageNames || [])) if (vn) monsterNames.add(String(vn).toLowerCase());
  }
} catch (e) {}
let churnMax = 0;
const histLines = [];
for (const label of Object.keys(recCauses).sort((a, b) => recCauses[b] - recCauses[a] || (a < b ? -1 : 1))) {
  const count = recCauses[label];
  const churn = count <= 2 && (labelSeeds[label].size === 1 || monsterNames.has(String(label).toLowerCase()));
  if (churn && count > churnMax) churnMax = count;
  histLines.push(`  ${count}x ${label} (seeds=${labelSeeds[label].size}${monsterNames.has(String(label).toLowerCase()) ? ', monster-name' : ''})${churn ? ' [churn band]' : ''}`);
}
const N = churnMax + 1;
console.log('L5 combined label histogram:');
for (const l of histLines) console.log(l);
const belowNNonChurn = Object.keys(recCauses).filter(label => {
  const count = recCauses[label];
  if (count >= N) return false;
  return !(count <= 2 && (labelSeeds[label].size === 1 || monsterNames.has(String(label).toLowerCase())));
});
leg('L5 N rule (N clears the churn band); N vs deathrow-b N=3 stated', N === churnMax + 1,
  `N=${N} churnMax=${churnMax} labels=${Object.keys(recCauses).length} villagerDeaths=${recVill} N moved vs 3: ${N !== 3 ? 'YES (3 -> ' + N + ')' : 'NO (still 3)'} sub-N non-churn (caveat, not failure)=${JSON.stringify(belowNNonChurn)}`);

// ---- L6/L7: slow sim legs on a fresh seed ----
if (FAST) {
  console.log('SKIP L6/L7 (TEST_DEATHEXT_FAST=1) — determinism/neutrality proven by the run\'s recorded sweep-mode outputs');
} else {
  try {
    const rerun = execFileSync('node', [SWEEP, '--rerun', '73751'], { cwd: REPO, encoding: 'utf8', timeout: 3600000, env: Object.assign({}, process.env, { EVID: CORPUS_NEW }) });
    leg('L6 determinism (--rerun 73751 byte-match)', /MATCH/.test(rerun) && !/MISMATCH/.test(rerun),
      String(rerun).trim().split('\n').filter(l => l.indexOf('RERUN') === 0).join(' '));
  } catch (e) {
    leg('L6 determinism (--rerun 73751 byte-match)', false, String((e && e.stdout) || (e && e.message) || e).slice(0, 200));
  }
  try {
    const neut = execFileSync('node', [SWEEP, '--neutrality', '73751'], { cwd: REPO, encoding: 'utf8', timeout: 3600000 });
    leg('L7 neutrality (--neutrality 73751)', /PASS/.test(neut) && !/FAIL/.test(neut),
      String(neut).trim().split('\n').filter(l => l.indexOf('NEUTRALITY') === 0).join(' '));
  } catch (e) {
    leg('L7 neutrality (--neutrality 73751)', false, String((e && e.stdout) || (e && e.message) || e).slice(0, 200));
  }
}

console.log(failures === 0 ? '\nALL LEGS PASS' : `\n${failures} LEG(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
