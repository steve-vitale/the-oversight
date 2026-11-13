// masterregress-analyze-20261113.js — analyzer for the master-regression
// DIAGNOSTIC BISECT (arm sim-masterregress-a). Reads one leg's 8 per-seed
// JSONs (seeds 190391–190398, the vetphantom band) from
// evidence/2026-11-13/perseed-masterregress-a-<leg>/ and judges them
// against the prereg (evidence/2026-11-13/
// sim-masterregress-a-prereg.md).
//
// PRIMARY METRIC — survived count per leg. The run verdict (judged
// across legs, once far + merge + near corpora all exist):
//   far == 4/8 AND merge <= 2/8 -> CULPRIT_MERGE (GO): the 4/8 vs 1/8
//     split reproduces at the boundary with one driver; the culprit
//     commit is the merge e4dbe581b.
//   far <= 2/8 OR merge >= 3/8 -> NO-GO — SPLIT NOT REPRODUCED:
//     the settled localization is in question; stop, report loudly.
//   near >= 3/8 -> ENDPOINT PHANTOM: the near-end claim (1/8) does
//     not reproduce; do not bisect a phantom.
// Per-leg classification:
//   far:     4 -> FAR_4_8 (expected); <=2 -> FAR_COLLAPSED;
//            >=5 -> FAR_ABOVE; 3 -> FAR_3_8
//   merge:   <=2 -> MERGE_COLLAPSED (expected); >=5 -> MERGE_HEALTHY;
//            3-4 -> MERGE_3_4
//   near:    1 -> NEAR_1_8 (expected); <=2 -> NEAR_COLLAPSED;
//            >=3 -> NEAR_ABOVE
//   mergeps: <=2 -> POLICY_EXONERATED_AT_MERGE (expected);
//            >=3 -> POLICY_IMPLICATED_AT_MERGE
// RANK READ (pre-registered alongside survival, same bands as r10):
//   >=5/8 regional -> REGIONAL_INTACT; <=2/8 -> RANK_STALL;
//   3–4/8 -> RANK_INCONCLUSIVE
// Exit 0 on a classified outcome with a complete corpus and 0
// instrument errors; exit 1 on corpus incompleteness, instrument
// failure, or an unclassifiable read. The verdict is the
// classification — never re-scored.
// SECONDARY (reported, not judged): median survival; death-cause
// shares; wave 4–5 unlocks; national/table/wins; standing range;
// tribute-ready; blooded count; phantom days (reported, corrected
// definition — see the evidence file).
// Usage: LEG=far node scripts/masterregress-analyze-20261113.js
// (LEG=far|merge|near|mergeps; after the last leg, the run verdict is
// written to evidence/2026-11-13/masterregress-a-run-summary.json
// whenever far + merge + near corpora all exist.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LEG = process.env.LEG || '';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'masterregress-pilot';
const LEGS = ['far', 'merge', 'near', 'mergeps'];
const EXPECTED = {
  far: { survived: 4, days: { 190391: 86, 190392: 144, 190393: 150, 190394: 43, 190395: 150, 190396: 87, 190397: 150, 190398: 150 } },
  merge: { survived: 1, days: { 190391: 103, 190392: 150, 190393: 115, 190394: 140, 190395: 76, 190396: 126, 190397: 115, 190398: 136 } },
  near: { survived: 1, days: { 190391: 65, 190392: 143, 190393: 126, 190394: 128, 190395: 150, 190396: 140, 190397: 135, 190398: 139 } },
  mergeps: { survived: null, days: null }, // no reference corpus; judged vs the merge rule only
};
const VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, same seeds
const VETPHANTOM_MEDIAN = 150;
const VETPHANTOM_REGIONAL = 8;
const FIRSTPARENT_SURVIVED = 4; // bisect-firstparent-a on 203a32775
const MERGE_A_SURVIVED = 1; // bisect-merge-a on e4dbe581b
const RECONCILED_SURVIVED = 1; // bisect-reconciled-a on 743e07d87
const BURNBASE_SURVIVED = 1; // burnoffsets-b0 on f7352f946
const BURNBASE_MEDIAN = 139;

function dirFor(leg) { return path.join(REPO, 'evidence', '2026-11-13', 'perseed-masterregress-a-' + leg); }
function perSeedFile(seed, leg) {
  return path.join(dirFor(leg), 'masterregress-s' + seed + '-' + RUN + '-fix.json');
}

function classifyLeg(leg, n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (leg === 'far') {
    if (n === 4) return 'FAR_4_8';
    if (n <= 2) return 'FAR_COLLAPSED';
    if (n >= 5) return 'FAR_ABOVE';
    return 'FAR_3_8';
  }
  if (leg === 'merge') {
    if (n <= 2) return 'MERGE_COLLAPSED';
    if (n >= 5) return 'MERGE_HEALTHY';
    return 'MERGE_3_4';
  }
  if (leg === 'near') {
    if (n === 1) return 'NEAR_1_8';
    if (n <= 2) return 'NEAR_COLLAPSED';
    return 'NEAR_ABOVE';
  }
  if (leg === 'mergeps') {
    if (n <= 2) return 'POLICY_EXONERATED_AT_MERGE';
    return 'POLICY_IMPLICATED_AT_MERGE';
  }
  return 'UNCLASSIFIABLE';
}

function classifyRegional(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'REGIONAL_INTACT';
  if (n <= 2) return 'RANK_STALL';
  return 'RANK_INCONCLUSIVE';
}

// judgeRun(farN, mergeN, nearN): the cross-leg GO rule from the prereg.
function judgeRun(farN, mergeN, nearN) {
  if ([farN, mergeN, nearN].some(function (n) { return typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8; })) return 'UNCLASSIFIABLE';
  if (nearN >= 3) return 'ENDPOINT_PHANTOM';
  if (farN <= 2 || mergeN >= 3) return 'NO-GO_SPLIT_NOT_REPRODUCED';
  if (farN === 4 && mergeN <= 2) return 'CULPRIT_MERGE';
  return 'INCONCLUSIVE_RUN';
}

function loadCorpus(seeds, leg) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, leg);
    if (!fs.existsSync(f)) { missing.push(seed); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows.push(d);
  }
  return { rows: rows, missing: missing, complete: missing.length === 0 && rows.length === seeds.length };
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function deathCauseShares(rows) {
  const counts = {};
  let total = 0;
  for (const d of rows) {
    for (const death of (d.deaths || [])) {
      const c = death.cause || death.kind || 'unknown';
      counts[c] = (counts[c] || 0) + 1;
      total++;
    }
  }
  return { total: total, counts: counts };
}

function analyzeRows(rows) {
  const perSeed = rows.map(function (d) {
    const daily = d.daily || [];
    const snap = daily.length ? daily[daily.length - 1] : null;
    return {
      seed: d.seed, leg: d.leg, anchorCommit: d.anchorCommit,
      standingFix: d.standingFix, standingSha: d.standingSha, policySha: d.policySha,
      days: d.days, endReason: d.endReason, won: !!d.won, villageLost: !!d.villageLost,
      scaleRank: d.scaleRank, maxWave: d.maxWave, unlockedWave: d.unlockedWave,
      standing: d.standing, deaths: (d.deaths || []).length,
      endPantryKcal: d.endPantryKcal, blooded: !!d.blooded,
      tribute: d.tribute, ready4: d.ready4 ? d.ready4.veterans : null,
      ready5: d.ready5 ? d.ready5.veterans : null,
      ladderVets4: d.ladderVets4,
      errors: (d.instrumentErrors || []).length,
      snapshotCount: daily.length,
      finalSnapDay: snap ? snap.day : null,
    };
  });
  const survived = perSeed.filter(function (r) { return !r.villageLost; }).length;
  const wall = {
    wins: perSeed.filter(function (r) { return r.won; }).length,
    national: perSeed.filter(function (r) { return r.scaleRank === 'national'; }).length,
    table: perSeed.filter(function (r) { return r.scaleRank === 'table'; }).length,
    regional: perSeed.filter(function (r) { return r.scaleRank === 'regional'; }).length,
    village: perSeed.filter(function (r) { return r.scaleRank === 'village'; }).length,
    wave5: perSeed.filter(function (r) { return (r.maxWave || 1) >= 5; }).length,
    wave4: perSeed.filter(function (r) { return (r.maxWave || 1) >= 4; }).length,
    medianDays: median(perSeed.map(function (r) { return r.days; })),
    survived: survived,
    deaths: perSeed.reduce(function (a, r) { return a + r.deaths; }, 0),
    standingRange: [Math.min.apply(null, perSeed.map(function (r) { return r.standing; })), Math.max.apply(null, perSeed.map(function (r) { return r.standing; }))],
    blooded: perSeed.filter(function (r) { return r.blooded; }).length,
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  return { perSeed: perSeed, survived: survived, wall: wall, causes: causes, instrumentErrors: instrumentErrors };
}

function judgeLeg(leg, analysis) {
  const verdict = classifyLeg(leg, analysis.survived);
  const rankVerdict = classifyRegional(analysis.wall.regional);
  const ok = verdict !== 'UNCLASSIFIABLE' && rankVerdict !== 'UNCLASSIFIABLE';
  return { verdict: verdict, rankVerdict: rankVerdict, classifiable: ok };
}

function analyzeLeg(leg) {
  const corpus = loadCorpus(SEEDS, leg);
  if (!corpus.complete) {
    console.error('masterregress-a ' + leg + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    return { leg: leg, complete: false, missing: corpus.missing };
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judgeLeg(leg, analysis);
  const summary = {
    leg: leg, seeds: SEEDS, run: RUN,
    vetphantomFixLeg: { survived: VETPHANTOM_SURVIVED, medianDays: VETPHANTOM_MEDIAN, regional: VETPHANTOM_REGIONAL },
    firstparentLeg: { survived: FIRSTPARENT_SURVIVED, base: '203a32775' },
    mergeLeg: { survived: MERGE_A_SURVIVED, base: 'e4dbe581b' },
    reconciledLeg: { survived: RECONCILED_SURVIVED, base: '743e07d87' },
    burnoffsetsBaseline: { survived: BURNBASE_SURVIVED, medianDays: BURNBASE_MEDIAN, base: 'f7352f946' },
    expected: EXPECTED[leg] || null,
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    rankVerdict: j.rankVerdict,
    classifiable: j.classifiable,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-13', 'masterregress-a-' + leg + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('masterregress-a ' + leg + ': ' + j.verdict + ' (survived ' + analysis.survived + '/8' + (EXPECTED[leg] && EXPECTED[leg].survived !== null ? ' vs expected ' + EXPECTED[leg].survived + '/8' : '') + ')');
  console.log('  rank: ' + j.rankVerdict + ' (regional ' + analysis.wall.regional + '/8 vs vetphantom ' + VETPHANTOM_REGIONAL + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  return { leg: leg, complete: true, survived: analysis.survived, verdict: j.verdict, rankVerdict: j.rankVerdict, classifiable: j.classifiable, instrumentErrors: analysis.instrumentErrors, summary: summary };
}

function main() {
  if (LEGS.indexOf(LEG) === -1) {
    console.error('masterregress-a: LEG required (far|merge|near|mergeps).');
    process.exit(2);
  }
  const res = analyzeLeg(LEG);
  if (!res.complete) process.exit(1);
  // Run verdict, whenever far + merge + near corpora all exist.
  const legs = {};
  let allPresent = true;
  for (const l of ['far', 'merge', 'near']) {
    const c = loadCorpus(SEEDS, l);
    if (!c.complete) { allPresent = false; break; }
    legs[l] = analyzeRows(c.rows).survived;
  }
  if (allPresent) {
    const runVerdict = judgeRun(legs.far, legs.merge, legs.near);
    let mergeps = null;
    const mps = loadCorpus(SEEDS, 'mergeps');
    if (mps.complete) mergeps = analyzeRows(mps.rows).survived;
    const runSummary = {
      legs: legs, mergepsSurvived: mergeps,
      runVerdict: runVerdict,
      mergepsVerdict: mergeps === null ? null : classifyLeg('mergeps', mergeps),
    };
    const runFile = path.join(REPO, 'evidence', '2026-11-13', 'masterregress-a-run-summary.json');
    fs.writeFileSync(runFile, JSON.stringify(runSummary, null, 2) + '\n');
    console.log('RUN VERDICT: ' + runVerdict + ' (far ' + legs.far + '/8, merge ' + legs.merge + '/8, near ' + legs.near + '/8' + (mergeps === null ? '' : ', mergeps ' + mergeps + '/8') + ')');
    console.log('  run summary: ' + path.relative(REPO, runFile));
  }
  if (!res.classifiable || res.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN, LEGS: LEGS, EXPECTED: EXPECTED,
  classifyLeg: classifyLeg, classifyRegional: classifyRegional,
  judgeRun: judgeRun, loadCorpus: loadCorpus, analyzeRows: analyzeRows,
  judgeLeg: judgeLeg, analyzeLeg: analyzeLeg,
  perSeedFile: perSeedFile, dirFor: dirFor, median: median,
  deathCauseShares: deathCauseShares,
};
