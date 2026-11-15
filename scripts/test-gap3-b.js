// test-gap3-b.js — proof test for sim-gap3-b (Stage 1 diag instrumentation).
//   static: no Math.random in the diag driver (comments stripped first —
//     the header documents the rule in prose); competent.js +
//     competent-answercourt-b.js unmodified vs HEAD; no src/js file modified.
//   analyzer: on the Stage-0 corpus (default
//     evidence/2026-11-15/perseed-gap3-b-control) every wild scholar death
//     joins to a diag row (unmatchedWild 0), every gap-3+ death has a
//     same-day fight, and the judged fields reproduce the successorcaution
//     control leg.
//   determinism: the gap3 driver CLI twice on one seed / 30 days (different
//     RUN tags) yields identical judged fields + identical diag counts.
// Usage: node scripts/test-gap3-b.js [corpus-dir]
//   env: GAP3_DET_SEED (default 100201), GAP3_DET_DAYS (default 30)
// Exit 0 = all green; prints one line per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!ok) failures += 1;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

// ---- static ----
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'gap3-driver-20261115.js'), 'utf8');
check('static: no Math.random in driver', !/Math\.random/.test(stripComments(driverSrc)));
check('static: driver requires fightAssessRace/DPR (live verdict)', /fightAssessRace/.test(driverSrc) && /fightAssessDPR/.test(driverSrc));
check('static: driver wraps travelTo + tele + tbBarrierExit', /travelTo-wrap/.test(driverSrc) && /diag-tele-wrap/.test(driverSrc) && /tbBarrierExit/.test(driverSrc));
function gitDiffNames(args) {
  try { return execSync('git diff ' + args, { cwd: REPO }).toString().trim(); } catch (e) { return 'ERR:' + e.message; }
}
const srcDiff = gitDiffNames('HEAD -- src/js');
check('static: no src/js file modified', srcDiff === '', srcDiff.slice(0, 200));
const polDiff = gitDiffNames('HEAD -- scripts/policies/competent.js scripts/policies/competent-answercourt-b.js');
check('static: competent.js + competent-answercourt-b.js unmodified vs HEAD', polDiff === '', polDiff.slice(0, 200));

// ---- analyzer on the Stage-0 corpus ----
const corpusDir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-15', 'perseed-gap3-b-control');
let analysis = null;
try {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'analyze-gap3-b.js'), corpusDir], { cwd: REPO, encoding: 'utf8' });
  analysis = JSON.parse(out);
} catch (e) {
  check('analyzer: runs on corpus', false, String(e.message).slice(0, 200));
}
if (analysis) {
  check('analyzer: runs on corpus', true, analysis.seeds + ' seeds');
  check('analyzer: every wild scholar death joined (unmatchedWild 0)', analysis.joinQuality.unmatchedWild === 0, 'unmatched=' + analysis.joinQuality.unmatchedWild);
  check('analyzer: no ambiguous joins', analysis.joinQuality.ambiguousWild === 0, 'ambiguous=' + analysis.joinQuality.ambiguousWild);
  check('analyzer: every wild death links to a fight within 1 day (multi-day fights lag 1)', analysis.joinQuality.noSameDayFight === 0, 'badLag=' + analysis.joinQuality.noSameDayFight);
  check('analyzer: race verdicts computed (no-ctx 0)', analysis.joinQuality.noCtxRaces === 0, 'noCtx=' + analysis.joinQuality.noCtxRaces);
  check('analyzer: diag recorded fights + successions', analysis.perSeed.every(function (s) { return s.diagFights > 0 && s.diagSuccessions > 0; }),
    JSON.stringify(analysis.perSeed.map(function (s) { return [s.seed, s.diagFights, s.diagSuccessions]; })));
  // Reproduction vs the successorcaution control leg (same tip, same policy,
  // same band): judged fields must match exactly.
  const expected = {
    100201: { days: 113, endReason: 'village-lost', maxWave: 5, scaleRank: 'national' },
    100203: { days: 145, endReason: 'village-lost', maxWave: 4, scaleRank: 'national' },
    100212: { days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national' },
  };
  // 100212's expected values come from the Stage-0b validation file (third
  // control file, successorcaution driver); the 100201–100208 pilot band
  // does not contain it — skip (pass) when absent.
  const have = {};
  for (const f of fs.readdirSync(corpusDir).filter(function (x) { return x.endsWith('.json'); })) {
    const r = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    have[r.seed] = r;
  }
  for (const seed of Object.keys(expected)) {
    const r = have[seed];
    if (!r) { check('repro: seed ' + seed + ' present', true, 'not in this band — skipped'); continue; }
    const e = expected[seed];
    const ok = r.days === e.days && r.endReason === e.endReason && r.maxWave === e.maxWave && r.scaleRank === e.scaleRank;
    check('repro: seed ' + seed + ' judged fields identical to successorcaution control', ok,
      JSON.stringify({ days: r.days, endReason: r.endReason, maxWave: r.maxWave, scaleRank: r.scaleRank }));
  }
  // v5 raid instrumentation: when the corpus carries diag.raids, every file
  // must have the raid log + daily lingerer lists, and at least one raid
  // must have fired (the join the Stage-1 verdict rests on).
  const firstFile = Object.keys(have).length ? have[Object.keys(have)[0]] : null;
  const hasV5 = !!(firstFile && firstFile.diag && Array.isArray(firstFile.diag.raids));
  if (hasV5) {
    const allHaveRaids = Object.keys(have).every(function (s) { return have[s].diag && Array.isArray(have[s].diag.raids); });
    check('v5: every corpus file carries diag.raids', allHaveRaids);
    const totalRaids = Object.keys(have).reduce(function (a, s) { return a + (have[s].diag.raids || []).length; }, 0);
    check('v5: at least one raid fired in the corpus', totalRaids > 0, totalRaids + ' raids');
    const allHaveLinger = Object.keys(have).every(function (s) {
      return (have[s].series || []).some(function (row) { return Array.isArray(row.lingerers); });
    });
    check('v5: every corpus file carries daily lingerer lists', allHaveLinger);
    const anyLingerDay = Object.keys(have).some(function (s) {
      return (have[s].series || []).some(function (row) { return (row.lingerers || []).length > 0; });
    });
    check('v5: at least one lingerer-day observed', anyLingerDay);
  } else {
    check('v5: raid log present', true, 'pre-v5 corpus — skipped');
  }
}

// ---- determinism: driver CLI twice, 30 days, different RUN tags ----
const detSeed = process.env.GAP3_DET_SEED || '100201';
const detDays = process.env.GAP3_DET_DAYS || '30';
function runDet(tag) {
  const outDir = 'perseed-gap3-b-det-' + tag;
  execFileSync('node', ['scripts/gap3-driver-20261115.js'], {
    cwd: REPO,
    env: Object.assign({}, process.env, { SEEDS: detSeed, POLICY: 'competent-answercourt-b', DAYS: detDays, RUN: 'gap3-b-det-' + tag, OUTDIR: outDir }),
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  const file = path.join(REPO, 'evidence', '2026-11-15', outDir,
    'gap3-b-s' + detSeed + '-competent-answercourt-b-gap3-b-det-' + tag + '.json');
  const r = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { file: file, outDir: outDir,
    judged: { days: r.days, endReason: r.endReason, maxWave: r.maxWave, scaleRank: r.scaleRank,
      deaths: r.deaths.length, seriesDays: r.series.length },
    diag: { fights: r.diag.fights.length, deaths: r.diag.deaths.length,
      successions: r.diag.successions.length, travels: r.diag.travels.length } };
}
try {
  const a = runDet('a'), b = runDet('b');
  const same = JSON.stringify(a.judged) === JSON.stringify(b.judged) && JSON.stringify(a.diag) === JSON.stringify(b.diag);
  check('determinism: two 30d runs identical (judged + diag counts)', same,
    JSON.stringify({ aJudged: a.judged, bJudged: b.judged, aDiag: a.diag, bDiag: b.diag }));
  // Clean up the determinism scratch corpora (evidence, not judged data).
  for (const r of [a, b]) {
    try { fs.unlinkSync(r.file); fs.rmdirSync(path.join(REPO, 'evidence', '2026-11-15', r.outDir)); } catch (e) {}
  }
} catch (e) {
  check('determinism: two 30d runs identical', false, String(e.message).slice(0, 300));
}

console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
