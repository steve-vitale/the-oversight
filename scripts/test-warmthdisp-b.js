// test-warmthdisp-b.js — disposition comparison for the stranded warmthrestraint branch.
//
// Loads the stranded census set (branch sim-warmthrestraint-b, tip cf9cb51e0)
// and the landed census set (commit 2067af34e) via `git show`, normalizes the
// two analyzers' strand encodings, and compares ONLY the verdict-relevant
// aggregates pre-registered in evidence/2026-10-30/sim-warmthdisp-b-prereg.md:
//   coverage (seeds/files/evenings/creekEvenings), guard strand (per-seed
//   maxRun + run windows), warmth benefit retained (warmActed/warmLogSpent,
//   per arm and per seed), restraint miss counts, and R1-vs-R2 equivalence.
// Analyzer-only extra keys are reported, never judged.
// Also compares the 40 nighttravel corpus files by full SHA-256.
// Exit 0 = SUPERSEDED-DUPLICATE (all verdict aggregates agree exactly).
// Exit 1 = MATERIAL-DIFFERENCE (any verdict aggregate, or any corpus file, differs).
// Pure reads: prints to stdout, writes nothing.
'use strict';
const { execSync } = require('child_process');
const crypto = require('crypto');

const STRANDED_REF = process.argv[2] || 'sim-warmthrestraint-b';
const LANDED_REF = process.argv[3] || '2067af34e';
const SEEDS = ['15003', '15009', '15091', '15211', '15215', '15220', '15221', '15337', '15376', '15439'];
const ARMS = ['guard', 'on', 'r1', 'r2'];

function show(ref, path) {
  return execSync(`git show ${ref}:${path}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}
function census(ref, stem, arm) {
  return JSON.parse(show(ref, `evidence/2026-10-30/${stem}-census-${arm}.json`));
}
// Stranded analyzer: strands = {seed: {maxRun, runs}} (all seeds).
// Landed analyzer:   strands = {seed: [runs]} (non-empty seeds only).
// Normalize both to {seed: [runs]} over the full bank.
function normStrands(strands) {
  const out = {};
  for (const s of SEEDS) {
    const v = strands[s];
    out[s] = v === undefined ? [] : (Array.isArray(v) ? v : v.runs);
  }
  return out;
}
function maxRuns(norm) {
  const out = {};
  for (const s of SEEDS) out[s] = norm[s].reduce((m, r) => Math.max(m, r.length), 0);
  return out;
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

let failures = 0;
function check(label, a, b) {
  const ok = eq(a, b);
  if (!ok) failures++;
  console.log(`${ok ? 'SAME ' : 'DIFF '} ${label}: stranded=${JSON.stringify(a)} landed=${JSON.stringify(b)}`);
  return ok;
}

for (const arm of ARMS) {
  const s = census(STRANDED_REF, 'sim-warmthrestraint-b', arm);
  const l = census(LANDED_REF, 'sim-warmthrestr2-b', arm);
  console.log(`--- ${arm} ---`);
  for (const k of ['seeds', 'files', 'evenings', 'creekEvenings', 'stillRefused', 'rescued',
                   'warmRecords', 'warmActed', 'warmLogSpent', 'warmFireFailed', 'havenMornings']) {
    check(`${arm}.${k}`, s[k], l[k]);
  }
  check(`${arm}.missReasons`, s.missReasons, l.missReasons);
  check(`${arm}.perSeed`, s.perSeed, l.perSeed);
  const ns = normStrands(s.strands), nl = normStrands(l.strands);
  check(`${arm}.strands(runs)`, ns, nl);
  check(`${arm}.strands(maxRun)`, maxRuns(ns), maxRuns(nl));
  const onlyS = Object.keys(s).filter(k => !(k in l)).sort();
  const onlyL = Object.keys(l).filter(k => !(k in s)).sort();
  console.log(`INFO ${arm}.analyzer-only keys: stranded-only=${JSON.stringify(onlyS)} landed-only=${JSON.stringify(onlyL)}`);
  // R1-vs-R2 equivalence is checked across arms below; record per-arm values here.
}

// R1-vs-R2 equivalence inside each run.
for (const ref of [STRANDED_REF, LANDED_REF]) {
  const r1 = census(ref, ref === STRANDED_REF ? 'sim-warmthrestraint-b' : 'sim-warmthrestr2-b', 'r1');
  const r2 = census(ref, ref === STRANDED_REF ? 'sim-warmthrestraint-b' : 'sim-warmthrestr2-b', 'r2');
  const v = (c) => [c.warmActed, c.warmLogSpent, maxRuns(normStrands(c.strands))['15215']];
  const ok = eq(v(r1), v(r2));
  if (!ok) failures++;
  console.log(`${ok ? 'SAME ' : 'DIFF '} R1-vs-R2 in ${ref}: r1=${JSON.stringify(v(r1))} r2=${JSON.stringify(v(r2))}`);
}

// Nighttravel corpora: full SHA-256 per file (names differ by run prefix only).
for (const arm of ARMS) {
  let same = 0, diff = 0;
  for (const seed of SEEDS) {
    const a = show(STRANDED_REF, `evidence/2026-10-30/sim-warmthrestraint-b-corpus-${arm}/warmthrestraint-b-nighttravel-s${seed}.json`);
    const b = show(LANDED_REF, `evidence/2026-10-30/sim-warmthrestr2-b-corpus-${arm}/warmthrestr2-b-nighttravel-s${seed}.json`);
    const ha = crypto.createHash('sha256').update(a).digest('hex');
    const hb = crypto.createHash('sha256').update(b).digest('hex');
    if (ha === hb) same++; else { diff++; failures++; console.log(`DIFF corpus ${arm} s${seed}`); }
  }
  console.log(`INFO corpus ${arm}: same=${same} diff=${diff} (of ${SEEDS.length})`);
}

console.log(failures === 0
  ? 'VERDICT: SUPERSEDED-DUPLICATE — all verdict aggregates and all 40 corpus files agree exactly.'
  : `VERDICT: MATERIAL-DIFFERENCE — ${failures} verdict-relevant mismatch(es). HOLD for coordinator decision.`);
process.exit(failures === 0 ? 0 : 1);
