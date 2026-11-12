// bisect-stallcut49-analyze-20261112.js — analyzer for the
// survival-collapse BISECT stall-cut leg (arm sim-stallcut49-a,
// run fleshout-20261112T1624Z).
// Reads the 8 per-seed JSONs (seeds 190391–190398, the vetphantom band)
// from evidence/2026-11-12/perseed-bisect-stallcut49-a/ and judges them
// against the prereg (evidence/2026-11-12/
// sim-stallcut49-a-prereg.md).
//
// PRIMARY METRIC — regional reach on the stall-cut base
// 1ae6dd76c (the 49th commit in the window d229b58f5..6dc7f8162) WITH the
// r131 roster-check fix swapped in (sha f8fda4295a99, recorded per
// seed) vs the merge-base leg's 0/8 regional (RANK_STALL) and the
// stall-cut leg's 8/8 regional (a18d7438c, the 65th commit):
//   >=5/8 regional -> STALL_LIFTED (the stall transition sits in the
//                     first 49 commits, d229b58f5 -> this cut)
//   <=2/8 regional -> STALL_STILL_IN (the transition sits in commits
//                     50–65, this cut -> a18d7438c)
//   3–4/8 regional -> RANK_INCONCLUSIVE
// SURVIVAL READ (pre-registered alongside regional — the same rules,
// judged, not merely reported): survived count on the same band, vs
// the vetphantom fix leg's 6/8 and the stall-cut leg's 0/8:
//   >=5/8 survive -> STALLCUT49_HEALTHY
//   <=2/8 survive -> STALLCUT49_COLLAPSED
//   3–4/8 survive -> INCONCLUSIVE
// Any survival verdict is a classified outcome; the rank read is
// always classifiable on a complete corpus. Exit 0 on a classified
// outcome with a complete corpus and 0 instrument errors; exit 1 on
// corpus incompleteness, instrument failure, or an unclassifiable
// read. The verdict is the classification — never re-scored.
// SECONDARY (reported, not judged): median survival vs 150d;
// death-cause shares vs survivalcontrol's combat-heavy profile; wave
// 4–5 unlocks; national/table/wins; standing range; tribute-ready
// days (from the final instrument snapshot's tribute read + the
// driver's end tribute field); blooded count.
// Usage: node scripts/bisect-stallcut49-analyze-20261112.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-bisect-stallcut49-a');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'bisect-stallcut49-pilot';
const VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, same seeds, old base
const VETPHANTOM_MEDIAN = 150;
const VETPHANTOM_REGIONAL = 8; // vetphantom fix leg: regional 8/8
const ORIGIN_REGIONAL = 0; // bisect-origin-a on a628aeaf3: regional 0/8 (rank stall)
const TRIBUTEDELIV_BAND_SURVIVED = 1; // fresh band 190411–190418, 1/8
const MERGE_A_SURVIVED = 1; // bisect-merge-a on e4dbe581b, same seeds
const FIRSTPARENT_SURVIVED = 4; // bisect-firstparent-a on 203a32775, same seeds
const RECONCILED_SURVIVED = 1; // bisect-reconciled-a on 743e07d87, same seeds
const ANCHOR_LEG_SURVIVED = 1; // bisect-anchor leg on 3f136f07e, same seeds
const SURVIVALCONTROL_SURVIVED = 1; // survivalcontrol on master d33ca69f9, same seeds
const ORIGIN_SURVIVED = 2; // bisect-origin-a on a628aeaf3, same seeds
const MERGEBASE_SURVIVED = 1; // bisect-mergebase-a on d229b58f5, same seeds
const MERGEBASE_REGIONAL = 0; // bisect-mergebase-a: regional 0/8 (rank stall)
const R5CUT1_SURVIVED = 2; // bisect-r5-cut1-a on 6dc7f8162, same seeds
const R5CUT1_REGIONAL = 8; // bisect-r5-cut1-a: regional 8/8
const R5CUT1_MEDIAN = 110; // bisect-r5-cut1-a, upper median of [84,84,90,102,110,139,150,150]
const R5CUT2_SURVIVED = 2; // bisect-r5-cut2-a on 2215e22d4, same seeds
const R5CUT2_REGIONAL = 8; // bisect-r5-cut2-a: regional 8/8
const R5CUT2_MEDIAN = 144; // bisect-r5-cut2-a, upper median
const STALLCUT_SURVIVED = 0; // bisect-stallcut-a on a18d7438c, same seeds
const STALLCUT_REGIONAL = 8; // bisect-stallcut-a: regional 8/8
const STALLCUT_MEDIAN = 123; // bisect-stallcut-a, upper median
const STALLCUT32_SURVIVED = 1; // bisect-stallcut32-a on 715c2918d, same seeds
const STALLCUT32_REGIONAL = 0; // bisect-stallcut32-a: regional 0/8
const STALLCUT32_MEDIAN = 102; // bisect-stallcut32-a, upper median

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'bisect-stallcut49-s' + seed + '-' + RUN + '-fix.json');
}

function classifySurvived(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'STALLCUT49_HEALTHY';
  if (n <= 2) return 'STALLCUT49_COLLAPSED';
  return 'INCONCLUSIVE';
}

function classifyRegional(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'STALL_LIFTED';
  if (n <= 2) return 'STALL_STILL_IN';
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
    console.error('bisect-stallcut49-a: INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judge(analysis);
  const summary = {
    seeds: SEEDS, run: RUN,
    vetphantomFixLeg: { survived: VETPHANTOM_SURVIVED, medianDays: VETPHANTOM_MEDIAN, regional: VETPHANTOM_REGIONAL },
    tributedelivBand: { survived: TRIBUTEDELIV_BAND_SURVIVED, seeds: [190411, 190412, 190413, 190414, 190415, 190416, 190417, 190418] },
    anchorLeg: { survived: ANCHOR_LEG_SURVIVED, base: '3f136f07e' },
    survivalcontrolLeg: { survived: SURVIVALCONTROL_SURVIVED, base: 'd33ca69f9' },
    originLeg: { survived: ORIGIN_SURVIVED, base: 'a628aeaf3', regional: ORIGIN_REGIONAL },
    mergeLeg: { survived: MERGE_A_SURVIVED, base: 'e4dbe581b' },
    firstparentLeg: { survived: FIRSTPARENT_SURVIVED, base: '203a32775' },
    reconciledLeg: { survived: RECONCILED_SURVIVED, base: '743e07d87' },
    stallcutBase: '1ae6dd76c',
    mergebaseLeg: { survived: MERGEBASE_SURVIVED, base: 'd229b58f5', regional: MERGEBASE_REGIONAL },
    r5cut1Leg: { survived: R5CUT1_SURVIVED, base: '6dc7f8162', regional: R5CUT1_REGIONAL, medianDays: R5CUT1_MEDIAN },
    r5cut2Leg: { survived: R5CUT2_SURVIVED, base: '2215e22d4', regional: R5CUT2_REGIONAL, medianDays: R5CUT2_MEDIAN },
    stallcutLeg: { survived: STALLCUT_SURVIVED, base: 'a18d7438c', regional: STALLCUT_REGIONAL, medianDays: STALLCUT_MEDIAN },
    stallcut32Leg: { survived: STALLCUT32_SURVIVED, base: '715c2918d', regional: STALLCUT32_REGIONAL, medianDays: STALLCUT32_MEDIAN },
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
  const outFile = path.join(REPO, 'evidence', '2026-11-12', 'bisect-stallcut49-a-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('bisect-stallcut49-a: ' + j.verdict + ' (survived ' + analysis.survived + '/8 vs vetphantom fix leg ' + VETPHANTOM_SURVIVED + '/8, stall-cut ' + STALLCUT_SURVIVED + '/8)');
  console.log('  rank: ' + j.rankVerdict + ' (regional ' + analysis.wall.regional + '/8 vs merge-base ' + MERGEBASE_REGIONAL + '/8, stall-cut ' + STALLCUT_REGIONAL + '/8, vetphantom ' + VETPHANTOM_REGIONAL + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
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
