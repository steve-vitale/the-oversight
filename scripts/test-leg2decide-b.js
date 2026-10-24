#!/usr/bin/env node
// test-leg2decide-b.js — proof for sim-leg2decide-b (fleshout-loop-b-20261024T1830Z).
//
// T1: analyzer-label fix (#909): a synthetic DISPUTED preserver-style case
//   makes analyze-leg2drift-b.js print BOTH the aggregate-only STEP label
//   AND the pre-reg-adjusted DISPUTED verdict; a synthetic social-style
//   case prints BOTH aggregate EXONERATED and adjusted DISPUTED.
// T2: decide analyzer verdict math: synthetic corpora with known per-seed
//   ratios yield STEP CONFIRMED (<0.80) and STEP REFUTED (>=0.90), and the
//   per-seed distribution lines are present (SENSE-TESTING: skew visible).
// T3: fresh-corpus completeness: the real leg2decide corpus holds 64/64
//   files (16 seeds x pd0/pd1 x parent/commit), anchor tags + seeds match,
//   and the decide analyzer exits 0 with a verdict line on it.
// T4: decide analyzer loud failure: an empty corpus dir exits non-zero
//   with FATAL (no silent empty verdict).
//
// No repo writes: all synthetic corpora live under os.tmpdir().
// No game load needed (analyzer + file checks only). No jest surface.
// Exit 0 = all PASS; exit 1 = any FAIL (loud).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZE_DRIFT = path.join(__dirname, 'analyze-leg2drift-b.js');
const ANALYZE_DECIDE = path.join(__dirname, 'analyze-leg2decide-b.js');
const REAL_CORPUS = path.join(ROOT, 'evidence', '2026-10-24', 'leg2decide-b-corpus');
const PARENT = '1f24a4ef04a857d33138fd0845cfa83df688285c';
const COMMIT = '75fdd92587ad9d83bb12f05da535cdfb49255835';
const SOCIAL_P = '0b151e0e163b21f07606f9cd06dd9d675e6225d2';
const SOCIAL_C = '2c2336dd9e254406dd3db9e39cac319068c357ff';

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function runAnalyzer(script, corpusDir) {
  try {
    const out = execFileSync('node', [script, corpusDir], { encoding: 'utf8', timeout: 60000 });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}
// row: daysAlive=100, so rotFreshKcal IS the rot/100d value.
function writeRow(dir, anchor, side, seed, rot100, national) {
  const short = anchor.slice(0, 8);
  const f = path.join(dir, `leg2drift-b-${short}-${side}-dg1-leadfeast-s${seed}.json`);
  fs.writeFileSync(f, JSON.stringify({
    seed, policy: 'leadfeast', plentydepri: side === 'pd1' ? 1 : 0, depositgate: 1,
    daysAlive: 100, villageDays: 100, rotFreshKcal: rot100, rotPreservedKcal: 0,
    depriKcal: 0, deathCauses: {}, national: !!national, table: false, win: false,
    waveReach: [1], medianSurvival: null, anchorCommit: anchor,
  }));
}
function buildCorpus(anchors) {
  // anchors: { sha: { pd0: [rot100 x seeds], pd1: [rot100 x seeds] } }, seeds 1..n
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leg2decide-test-'));
  for (const [sha, sides] of Object.entries(anchors)) {
    sides.pd0.forEach((v, i) => writeRow(dir, sha, 'pd0', 9000 + i, v, false));
    sides.pd1.forEach((v, i) => writeRow(dir, sha, 'pd1', 9000 + i, v, false));
  }
  return dir;
}

// ---- T1a: preserver-style disputed case (aggregate STEP, median disputes) ----
{
  // Parent: pd0 [1000,50x7] sum 1350; pd1 [880,44x7] sum 1188 -> agg 0.880 NEW; med 44/50 = 0.880 NEW (agree).
  // Commit: pd0 [1000,50x7] sum 1350; pd1 [650,49x7] sum 993 -> agg 0.736 OLD; med 49/50 = 0.980 NEW (DISAGREE at commit).
  const dir = buildCorpus({
    [PARENT]: { pd0: [1000, 50, 50, 50, 50, 50, 50, 50], pd1: [880, 44, 44, 44, 44, 44, 44, 44] },
    [COMMIT]: { pd0: [1000, 50, 50, 50, 50, 50, 50, 50], pd1: [650, 49, 49, 49, 49, 49, 49, 49] },
  });
  const { rc, out } = runAnalyzer(ANALYZE_DRIFT, dir);
  const line = out.split('\n').find(l => l.includes('preserver widening')) || '';
  check('T1a drift analyzer exits 0 on synthetic corpus', rc === 0, 'rc=' + rc);
  check('T1a aggregate STEP label present', /STEP NEW->OLD/.test(line), line);
  check('T1a pre-reg-adjusted DISPUTED present alongside', /pre-reg-adjusted: DISPUTED/.test(line), line);
}
// ---- T1b: social-style disputed case (aggregate EXONERATED, median disputes) ----
{
  // Social parent: pd0 [1000,50x7] sum 1350; pd1 [1100,20x7] sum 1240 -> agg 0.919 NEW; med 20/50 = 0.400 OLD (DISAGREE).
  // Social commit: pd0 [1000,50x7]; pd1 [880,44x7] -> agg 0.880 NEW; med 0.880 NEW (agree).
  const dir = buildCorpus({
    [SOCIAL_P]: { pd0: [1000, 50, 50, 50, 50, 50, 50, 50], pd1: [1100, 20, 20, 20, 20, 20, 20, 20] },
    [SOCIAL_C]: { pd0: [1000, 50, 50, 50, 50, 50, 50, 50], pd1: [880, 44, 44, 44, 44, 44, 44, 44] },
  });
  const { rc, out } = runAnalyzer(ANALYZE_DRIFT, dir);
  const line = out.split('\n').find(l => l.includes('social (invisible friendship)')) || '';
  check('T1b drift analyzer exits 0 on synthetic corpus', rc === 0, 'rc=' + rc);
  check('T1b aggregate EXONERATED label present', /EXONERATED/.test(line), line);
  check('T1b pre-reg-adjusted DISPUTED present alongside', /pre-reg-adjusted: DISPUTED/.test(line), line);
}
// ---- T1c: undisputed case repeats the aggregate label (no false DISPUTED) ----
{
  const dir = buildCorpus({
    [PARENT]: { pd0: [100, 100, 100, 100], pd1: [90, 90, 90, 90] },
    [COMMIT]: { pd0: [100, 100, 100, 100], pd1: [90, 90, 90, 90] },
  });
  const { rc, out } = runAnalyzer(ANALYZE_DRIFT, dir);
  const line = out.split('\n').find(l => l.includes('preserver widening')) || '';
  check('T1c undisputed pair repeats aggregate label', /pre-reg-adjusted: EXONERATED/.test(line) && !/DISPUTED/.test(line), line);
  void rc;
}
// ---- T2a: decide analyzer STEP CONFIRMED on known ratios ----
{
  const dir = buildCorpus({
    [PARENT]: { pd0: [100, 100, 100, 100], pd1: [100, 100, 100, 100] },
    [COMMIT]: { pd0: [100, 100, 100, 100], pd1: [50, 50, 50, 50] },
  });
  const { rc, out } = runAnalyzer(ANALYZE_DECIDE, dir);
  check('T2a decide analyzer exits 0', rc === 0, 'rc=' + rc);
  check('T2a M(parent)=1.000 M(commit)=0.500 step=0.500', /M\(parent\) = 1\.000x \| M\(commit\) = 0\.500x \| MEDIAN STEP RATIO = 0\.500x/.test(out), out.split('\n').slice(0, 8).join(' | '));
  check('T2a verdict STEP CONFIRMED', /VERDICT.*STEP CONFIRMED/.test(out), '');
  check('T2a distribution rows present (skew visible)', /9000 \| 1\.000 \| 0\.500 \| 0\.500/.test(out), '');
}
// ---- T2b: decide analyzer STEP REFUTED on known ratios ----
{
  const dir = buildCorpus({
    [PARENT]: { pd0: [100, 100, 100, 100], pd1: [100, 100, 100, 100] },
    [COMMIT]: { pd0: [100, 100, 100, 100], pd1: [95, 95, 95, 95] },
  });
  const { rc, out } = runAnalyzer(ANALYZE_DECIDE, dir);
  check('T2b verdict STEP REFUTED at 0.950', rc === 0 && /MEDIAN STEP RATIO = 0\.950x/.test(out) && /VERDICT.*STEP REFUTED/.test(out), 'rc=' + rc);
}
// ---- T2c: decide analyzer INCONCLUSIVE band ----
{
  const dir = buildCorpus({
    [PARENT]: { pd0: [100, 100, 100, 100], pd1: [100, 100, 100, 100] },
    [COMMIT]: { pd0: [100, 100, 100, 100], pd1: [85, 85, 85, 85] },
  });
  const { rc, out } = runAnalyzer(ANALYZE_DECIDE, dir);
  check('T2c verdict INCONCLUSIVE at 0.850', rc === 0 && /VERDICT.*INCONCLUSIVE/.test(out), 'rc=' + rc);
}
// ---- T3: real fresh corpus completeness + decide analyzer on it ----
{
  const files = fs.existsSync(REAL_CORPUS) ? fs.readdirSync(REAL_CORPUS).filter(f => f.startsWith('leg2drift-b-') && f.endsWith('.json')) : [];
  check('T3 real corpus has 64 per-seed files', files.length === 64, `found ${files.length}`);
  let ok = files.length === 64;
  const seen = new Set();
  if (ok) {
    for (const f of files) {
      let row;
      try { row = JSON.parse(fs.readFileSync(path.join(REAL_CORPUS, f), 'utf8')); } catch (e) { ok = false; break; }
      if (![PARENT, COMMIT].includes(row.anchorCommit) || row.seed < 9266 || row.seed > 9281) { ok = false; break; }
      seen.add(`${row.anchorCommit}|${row.plentydepri}|${row.seed}`);
    }
    if (seen.size !== 64) ok = false;
  }
  check('T3 all 64 cells valid: parent/commit x pd0/pd1 x seeds 9266-9281', ok, `distinct cells ${seen.size}`);
  const { rc, out } = runAnalyzer(ANALYZE_DECIDE, REAL_CORPUS);
  check('T3 decide analyzer exits 0 on real corpus', rc === 0, 'rc=' + rc);
  check('T3 decide analyzer prints a verdict line on real corpus', /VERDICT \(pre-registered bands/.test(out), '');
  check('T3 distribution section present on real corpus', /PER-SEED RATIO DISTRIBUTION/.test(out), '');
}
// ---- T4: empty corpus loud failure ----
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leg2decide-empty-'));
  const { rc, out } = runAnalyzer(ANALYZE_DECIDE, dir);
  check('T4 empty corpus exits non-zero with FATAL', rc !== 0 && /FATAL/.test(out), `rc=${rc}`);
}

console.log(`\ntest-leg2decide-b: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
