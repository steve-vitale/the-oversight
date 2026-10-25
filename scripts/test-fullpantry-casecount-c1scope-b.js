#!/usr/bin/env node
// test-fullpantry-casecount-c1scope-b.js — proof for the C1-scope fix
// (sim-c1scope-b, 2026-10-25, run fleshout-loop-b-20261025T0630Z).
// Tooling ONLY, zero src/js. The landed corpus is READ-ONLY here:
// it is read, never written, and doctored corpora live only in a
// mkdtemp scratch dir (removed in `finally`).
//
// Pre-registered GO legs (evidence/2026-10-25/sim-c1scope-b.md):
//   R1 OLD behavior reproduced (data-level): the PLANNED band
//      (B1..B4, 94601-94728) intersects another corpus's run seeds
//      (cover-b 94701) while the ACTUALLY-RUN seeds (94601-94664)
//      intersect NO other corpus — so the old C1 exited 2 on a
//      phantom, and the new C1 has nothing to flag. (The live RED
//      run — old analyzer exiting 2 naming seed 94701 — is recorded
//      in the evidence file; this test reconstructs it from data so
//      it stays green after the fix lands and HEAD moves.)
//   R2 NEW analyzer on the untouched landed corpus: exit 0, verdict
//      identical to published CASECOUNT-GO (n=8, shareA 1.000, all
//      8 deaths awayAtDeath=true, seeds matching the published table).
//   R3 Negative control: a doctored other-corpus containing a REAL
//      collision (actually-run seed 94605) fails C1 loudly (exit 2,
//      names 94605) under the NEW analyzer.
//   R4 Planned-band case: a doctored other-corpus containing ONLY
//      the planned-but-unrun B4 band (94697-94728) passes C1 (exit 0)
//      under the NEW analyzer.
//   R5 Source guard: the analyzer's C1 section uses the run-seed
//      list, never ALLBATCH/allSeeds; the run-seed derivation from
//      per-seed filenames precedes C1.
// Run: node scripts/test-fullpantry-casecount-c1scope-b.js
// (no env, no seeds, no sims — pure analyzer proof).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');

let passed = 0;
function ok(name, cond) {
  assert(cond, 'FAILED: ' + name);
  passed++;
  console.log('ok ' + passed + ' - ' + name);
}

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-fullpantry-casecount-b.js');
const EV24 = path.join(ROOT, 'evidence', '2026-10-24');
const CORPUS = path.join(EV24, 'fullpantry-casecount-b-corpus');
const analyzerSrc = fs.readFileSync(ANALYZER, 'utf8');

// Corpus seed readers (exact `seed` field, as C1 reads it).
function corpusSeeds(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json') || f.startsWith('sweep-')) continue;
    try { const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); if (j.seed != null) out.push(j.seed); }
    catch (e) { /* ignore */ }
  }
  return out.sort((a, b) => a - b);
}
function otherCorpusSeeds() {
  const map = {};
  for (const d of fs.readdirSync(EV24)) {
    if (!d.endsWith('-corpus') || d === 'fullpantry-casecount-b-corpus') continue;
    const p = path.join(EV24, d);
    if (!fs.statSync(p).isDirectory()) continue;
    map[d] = corpusSeeds(p);
  }
  return map;
}
function runSeedsFromFilenames(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^fullpantry-casecount-b-competent-s(\d+)\.json$/);
    if (m) out.push(parseInt(m[1], 10));
  }
  return out.sort((a, b) => a - b);
}

// --- R1: old-vs-new collision sets, from data ---
const runSeeds = runSeedsFromFilenames(CORPUS);
ok('R1a run seeds are the batch-boundary prefix 94601-94664 (64)',
  runSeeds.length === 64 && runSeeds[0] === 94601 && runSeeds[63] === 94664
  && runSeeds.every((s, i) => s === 94601 + i));
const { BATCHES } = require('./analyze-fullpantry-casecount-b.js');
const planned = BATCHES.flat();
ok('R1b planned band is B1..B4 94601-94728 (128)', planned.length === 128
  && planned[0] === 94601 && planned[127] === 94728);
const others = otherCorpusSeeds();
const allOther = Object.values(others).flat();
const plannedHits = planned.filter(s => allOther.includes(s));
const runHits = runSeeds.filter(s => allOther.includes(s));
ok('R1c OLD C1 would fire: planned band hits another corpus (94701 in cover-b)',
  plannedHits.includes(94701) && (others['awayration-cover-b-corpus'] || []).includes(94701));
ok('R1d NEW C1 has nothing to flag: run seeds hit NO other corpus',
  runHits.length === 0);

// --- R5: source guard (scoped to the C1 section, not the whole file:
// BATCHES/ALLBATCH legitimately still exist for batch validation) ---
const c1Start = analyzerSrc.indexOf('C1SCOPE FIX');
const c1End = analyzerSrc.indexOf('Case-count seed selection');
assert(c1Start !== -1 && c1End > c1Start, 'C1 section markers present');
const c1Section = analyzerSrc.slice(c1Start, c1End);
ok('R5a C1 check expression never uses ALLBATCH/allSeeds (comment may name the old code)',
  !/ALLBATCH\.includes|allSeeds\.includes/.test(c1Section));
ok('R5b C1 checks the run-seed list (runSeeds.includes)',
  /runSeeds\.includes\(j\.seed\)/.test(c1Section));
const derivIdx = analyzerSrc.indexOf('let runSeeds');
const checkIdx = analyzerSrc.indexOf('runSeeds.includes');
ok('R5c run-seed derivation from per-seed filenames precedes the C1 check',
  derivIdx !== -1 && checkIdx > derivIdx
  && /fullpantry-casecount-b-competent-s/.test(analyzerSrc.slice(derivIdx, checkIdx)));
ok('R5d other analyzers untouched by this arm (leg2decide sort bug still present, not fixed here)',
  !fs.readFileSync(path.join(__dirname, 'analyze-leg2decide-b.js'), 'utf8').includes('C1SCOPE'));

// --- R2/R3/R4: live analyzer runs (scratch evidence roots) ---
function runAnalyzer(corpusDir, evidenceDir) {
  return spawnSync(process.execPath, [ANALYZER, corpusDir, 'full'], {
    encoding: 'utf8',
    env: { ...process.env, C1_EVIDENCE_DIR: evidenceDir },
  });
}
function copyCorpus(dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(CORPUS)) fs.copyFileSync(path.join(CORPUS, f), path.join(dst, f));
}
function writeOtherCorpus(evDir, dirName, seeds) {
  const d = path.join(evDir, dirName);
  fs.mkdirSync(d, { recursive: true });
  for (const s of seeds) fs.writeFileSync(path.join(d, `doctored-competent-s${s}.json`), JSON.stringify({ seed: s }) + '\n');
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c1scope-'));
try {
  // R2: live new analyzer on the untouched landed corpus.
  const r2 = runAnalyzer(CORPUS, EV24);
  ok('R2a new analyzer exits 0 on the landed corpus', r2.status === 0);
  ok('R2b verdict identical to published CASECOUNT-GO (n=8 shareA=1.000)',
    /VERDICT: CASECOUNT-GO/.test(r2.stdout) && /got n=8 shareA=1\.000/.test(r2.stdout)
    && /FULL-PANTRY ATTRIBUTION: A=8 \(1\.000\) B=0/.test(r2.stdout));
  const deathLines = r2.stdout.split('\n').filter(l => /^  s\d+\(B[12]\) d\d+ .* class=A sub=away-at-death/.test(l));
  ok('R2c all 8 deaths class A, away-at-death, awayAtDeath=true',
    deathLines.length === 8 && deathLines.every(l => /awayAtDeath=true/.test(l)));
  const deathSeeds = deathLines.map(l => parseInt(l.match(/^  s(\d+)/)[1], 10)).sort((a, b) => a - b);
  ok('R2d death seeds match the published table (94605,94617,94629x2,94632,94633,94635,94644)',
    JSON.stringify(deathSeeds) === JSON.stringify([94605, 94617, 94629, 94629, 94632, 94633, 94635, 94644]));

  // R3: negative control — real collision (actually-run 94605).
  const evNeg = path.join(tmp, 'ev-neg');
  const corpusNeg = path.join(evNeg, 'fullpantry-casecount-b-corpus');
  copyCorpus(corpusNeg);
  writeOtherCorpus(evNeg, 'doctored-collide-b-corpus', [94605]);
  const r3 = runAnalyzer(corpusNeg, evNeg);
  ok('R3a negative control exits 2 under the new analyzer', r3.status === 2);
  ok('R3b negative control names the real collision seed 94605',
    /C1 hit: seed 94605/.test(r3.stderr) || /C1 hit: seed 94605/.test(r3.stdout));

  // R4: planned-band case — other corpus holds ONLY unrun B4 seeds.
  const evPlan = path.join(tmp, 'ev-plan');
  const corpusPlan = path.join(evPlan, 'fullpantry-casecount-b-corpus');
  copyCorpus(corpusPlan);
  const b4 = Array.from({ length: 32 }, (_, i) => 94697 + i);
  writeOtherCorpus(evPlan, 'doctored-planned-b-corpus', b4);
  const r4 = runAnalyzer(corpusPlan, evPlan);
  ok('R4a planned-but-unrun B4 band passes C1 (exit 0)', r4.status === 0);
  ok('R4b planned-band run still renders CASECOUNT-GO', /VERDICT: CASECOUNT-GO/.test(r4.stdout));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`PASS ${passed} legs (test-fullpantry-casecount-c1scope-b.js)`);
