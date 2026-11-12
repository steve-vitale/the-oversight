// bisect-r10-cut-analyze-20261112.js — analyzer for the
// survival-collapse BISECT ROUND-10 CUT leg (arm sim-bisect-r10-cut-a).
// Reads the 8 per-seed JSONs (seeds 190391–190398, the vetphantom band)
// from evidence/2026-11-12/perseed-bisect-r10-cut-a/ and judges them
// against the prereg (evidence/2026-11-12/
// sim-bisect-r10-cut-a-prereg.md).
//
// PRIMARY METRIC — survived count on the round-10 cut
// c67a17564 (the 389th commit in the window d229b58f5..203a32775) WITH the
// r131 roster-check fix swapped in (sha f8fda4295a99, recorded per
// seed) vs the vetphantom fix leg's 6/8 (median 150d), the round-9
// cut leg's 4/8, and the firstparent leg's 4/8. REVISED decision
// table (prereg): CUT_HEALTHY is impossible on this cut — the far
// end is 4/8 — so the top band is renamed, not re-scored:
//   >=5/8 survive -> CUT10_ABOVE_FAR_END (UNEXPECTED, NOT healthy:
//                     the cut exceeds the far end's 4/8, so commits
//                     390–393 would have to HURT survival.
//                     Investigate; never report as CUT_HEALTHY.)
//   <=2/8 survive -> CUT10_COLLAPSED (the 2/8->4/8 exit does not
//                     hold at the 389th commit; the transition sits
//                     in 390–393, or the run is anomalous — no game
//                     code moved in 386–389)
//   3–4/8 survive -> INCONCLUSIVE (the expected band; the window's
//                     far end never was healthy — the healthy pole
//                     needs re-finding outside this window. A 4/8
//                     deep-identical to round 9 localizes the
//                     190393/190397 remainder to commits 390–393.)
// RANK READ (pre-registered alongside survival, per the origin leg's
// §7 metric note — the origin leg found a rank stall with no
// pre-registered metric, and this leg judges rank, not merely
// reports it): regional reach on the same band, vs the vetphantom
// fix leg's 8/8 regional and the origin leg's 0/8 regional:
//   >=5/8 regional -> REGIONAL_INTACT (link/regional formation works)
//   <=2/8 regional -> RANK_STALL (the rank stall is already in the base)
//   3–4/8 regional -> RANK_INCONCLUSIVE
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
// Usage: node scripts/bisect-r10-cut-analyze-20261112.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-bisect-r10-cut-a');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'bisect-r10-cut-pilot';
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
const R5CUT1_SURVIVED = 2; // bisect-r5-cut1-a on 6dc7f8162, same seeds
const R5CUT2_SURVIVED = 2; // bisect-r5-cut2-a on 2215e22d4, same seeds
const R6CUT_SURVIVED = 2; // bisect-r6-cut-a on c7786d567, same seeds
const R7CUT_SURVIVED = 2; // bisect-r7-cut-a on 21fc590d0, same seeds
const R8CUT_SURVIVED = 2; // bisect-r8-cut-a on a6ed956f5, same seeds
const R9CUT_SURVIVED = 4; // bisect-r9-cut-a on ee30f22a2, same seeds

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'bisect-r10-cut-s' + seed + '-' + RUN + '-fix.json');
}

function classifySurvived(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'CUT10_ABOVE_FAR_END';
  if (n <= 2) return 'CUT10_COLLAPSED';
  return 'INCONCLUSIVE';
}

function classifyRegional(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'REGIONAL_INTACT';
  if (n <= 2) return 'RANK_STALL';
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
    console.error('bisect-r10-cut-a: INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
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
    r10cutBase: 'c67a17564',
    r9cutLeg: { survived: R9CUT_SURVIVED, base: 'ee30f22a2' },
    r8cutLeg: { survived: R8CUT_SURVIVED, base: 'a6ed956f5' },
    r5cut1Leg: { survived: R5CUT1_SURVIVED, base: '6dc7f8162' },
    r5cut2Leg: { survived: R5CUT2_SURVIVED, base: '2215e22d4' },
    r6cutLeg: { survived: R6CUT_SURVIVED, base: 'c7786d567' },
    r7cutLeg: { survived: R7CUT_SURVIVED, base: '21fc590d0' },
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
  const outFile = path.join(REPO, 'evidence', '2026-11-12', 'bisect-r10-cut-a-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('bisect-r10-cut-a: ' + j.verdict + ' (survived ' + analysis.survived + '/8 vs vetphantom fix leg ' + VETPHANTOM_SURVIVED + '/8)');
  console.log('  rank: ' + j.rankVerdict + ' (regional ' + analysis.wall.regional + '/8 vs vetphantom ' + VETPHANTOM_REGIONAL + '/8, origin ' + ORIGIN_REGIONAL + '/8)');
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
