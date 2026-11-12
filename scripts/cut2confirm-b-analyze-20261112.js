// cut2confirm-b-analyze-20261112.js — analyzer for the
// CONFIRM leg on bisect round-5 cut 2 (arm sim-cut2confirm-b).
// Reads the 16 per-seed JSONs (fresh seeds 190601–190616)
// from evidence/2026-11-12/perseed-cut2confirm-b/ and judges them
// against the prereg (evidence/2026-11-12/
// sim-cut2confirm-b-prereg.md).
//
// PRIMARY METRIC — survived count on the cut-2 base
// 2215e22d4 (the 262nd commit in the window d229b58f5..203a32775) WITH the
// r131 roster-check fix swapped in (sha f8fda4295a99, recorded per
// seed) on the FRESH band 190601–190616, vs Loop A's cut-2 leg (2/8,
// median 144d on 190391–190398):
//   <=4/16 survive -> CONFIRMED (the collapse generalizes; r5 cut2
//                     was 2/8 = 25%)
//   >=12/16 survive -> REFUTED (band noise; the collapse does not
//                      generalize)
//   5–11/16 survive -> INCONCLUSIVE
// RANK READ (pre-registered alongside survival): regional reach on the
// same fresh band, vs the cut-2 leg's 8/8 regional:
//   >=11/16 regional -> REGIONAL_INTACT (link/regional formation works)
//   <=4/16 regional -> RANK_STALL (the rank stall is in on fresh seeds)
//   5–10/16 regional -> RANK_INCONCLUSIVE
// Any survival verdict is a classified outcome; the rank read is
// always classifiable on a complete corpus. Exit 0 on a classified
// outcome with a complete corpus and 0 instrument errors; exit 1 on
// corpus incompleteness, instrument failure, or an unclassifiable
// read. The verdict is the classification — never re-scored.
// SECONDARY (reported, not judged): median survival vs 144d (r5 cut-2);
// death-cause shares vs survivalcontrol's combat-heavy profile; wave
// 4–5 unlocks; national/table/wins; standing range; tribute-ready
// days (from the final instrument snapshot's tribute read + the
// driver's end tribute field); blooded count.
// Usage: node scripts/cut2confirm-b-analyze-20261112.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-cut2confirm-b');
const SEEDS = [190601, 190602, 190603, 190604, 190605, 190606, 190607, 190608, 190609, 190610, 190611, 190612, 190613, 190614, 190615, 190616];
const RUN = 'cut2confirm-b-pilot';
const R5CUT2_SURVIVED = 2; // Loop A r5 cut-2 leg on 2215e22d4, seeds 190391–190398
const R5CUT2_MEDIAN = 144;
const R5CUT2_REGIONAL = 8; // r5 cut-2 leg: regional 8/8
const ORIGIN_REGIONAL = 0; // bisect-origin-a on a628aeaf3: regional 0/8 (rank stall)
const TRIBUTEDELIV_BAND_SURVIVED = 1; // fresh band 190411–190418, 1/8
const MERGE_A_SURVIVED = 1; // bisect-merge-a on e4dbe581b, same seeds
const FIRSTPARENT_SURVIVED = 4; // bisect-firstparent-a on 203a32775, same seeds
const RECONCILED_SURVIVED = 1; // bisect-reconciled-a on 743e07d87, same seeds
const ANCHOR_LEG_SURVIVED = 1; // bisect-anchor leg on 3f136f07e, same seeds
const SURVIVALCONTROL_SURVIVED = 1; // survivalcontrol on master d33ca69f9, same seeds
const ORIGIN_SURVIVED = 2; // bisect-origin-a on a628aeaf3, same seeds
const MERGEBASE_SURVIVED = 1; // bisect-mergebase-a on d229b58f5, same seeds

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'cut2confirm-b-s' + seed + '-' + RUN + '-fix.json');
}

function classifySurvived(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 16) return 'UNCLASSIFIABLE';
  if (n <= 4) return 'CONFIRMED';
  if (n >= 12) return 'REFUTED';
  return 'INCONCLUSIVE';
}

function classifyRegional(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 16) return 'UNCLASSIFIABLE';
  if (n >= 11) return 'REGIONAL_INTACT';
  if (n <= 4) return 'RANK_STALL';
  return 'RANK_INCONCLUSIVE';
}

function loadCorpus(seeds, dir) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, dir);
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
      seed: d.seed, anchorCommit: d.anchorCommit, standingFix: d.standingFix, standingSha: d.standingSha,
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

function judge(analysis) {
  const verdict = classifySurvived(analysis.survived);
  const rankVerdict = classifyRegional(analysis.wall.regional);
  const ok = verdict !== 'UNCLASSIFIABLE' && rankVerdict !== 'UNCLASSIFIABLE';
  return { verdict: verdict, rankVerdict: rankVerdict, classifiable: ok };
}

function main() {
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('cut2confirm-b: INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judge(analysis);
  const summary = {
    seeds: SEEDS, run: RUN,
    r5cut2Leg: { survived: R5CUT2_SURVIVED, medianDays: R5CUT2_MEDIAN, regional: R5CUT2_REGIONAL, seeds: [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398] },
    tributedelivBand: { survived: TRIBUTEDELIV_BAND_SURVIVED, seeds: [190411, 190412, 190413, 190414, 190415, 190416, 190417, 190418] },
    anchorLeg: { survived: ANCHOR_LEG_SURVIVED, base: '3f136f07e' },
    survivalcontrolLeg: { survived: SURVIVALCONTROL_SURVIVED, base: 'd33ca69f9' },
    originLeg: { survived: ORIGIN_SURVIVED, base: 'a628aeaf3', regional: ORIGIN_REGIONAL },
    mergeLeg: { survived: MERGE_A_SURVIVED, base: 'e4dbe581b' },
    firstparentLeg: { survived: FIRSTPARENT_SURVIVED, base: '203a32775' },
    reconciledLeg: { survived: RECONCILED_SURVIVED, base: '743e07d87' },
    r5cut2Base: '2215e22d4',
    mergebaseLeg: { survived: MERGEBASE_SURVIVED, base: 'd229b58f5' },
    standingFixSha: 'f8fda4295a99',
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    rankVerdict: j.rankVerdict,
    classifiable: j.classifiable,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-12', 'cut2confirm-b-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('cut2confirm-b: ' + j.verdict + ' (survived ' + analysis.survived + '/16 vs r5 cut-2 leg ' + R5CUT2_SURVIVED + '/8)');
  console.log('  rank: ' + j.rankVerdict + ' (regional ' + analysis.wall.regional + '/16 vs r5 cut-2 ' + R5CUT2_REGIONAL + '/8, origin ' + ORIGIN_REGIONAL + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/16, wave4 ' + analysis.wall.wave4 + '/16, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  if (!j.classifiable || analysis.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN, DIR: DIR,
  classifySurvived: classifySurvived,
  classifyRegional: classifyRegional,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows, judge: judge,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile,
};
