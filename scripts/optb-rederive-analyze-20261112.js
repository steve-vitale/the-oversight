// optb-rederive-analyze-20261112.js — analyzer for the option-B
// healthy-pole re-derivation (arm sim-optb-rederive-a).
// Reads the 8 per-seed JSONs (seeds 190391–190398, the vetphantom band)
// from evidence/2026-11-12/perseed-optb-rederive-a-<LEG>/ and judges
// them against the prereg (evidence/2026-11-12/
// sim-optb-rederive-a-prereg.md).
//
// PRIMARY METRIC — survived count on the collapse window's far end
// 203a32775 PLUS one candidate change cherry-picked uncommitted, WITH
// the r131 roster-check fix swapped in (sha f8fda4295a99, recorded per
// seed), vs the vetphantom fix leg's 6/8 (median 150d) and the
// firstparent leg's 4/8. Decision table (prereg, binding):
//   >=5/8 survive -> HEALTHY_POLE_REDERIVED (the candidate change(s)
//                     carry the health — name them; state the
//                     mechanism, including RNG-carried if that is
//                     what it is)
//   <=4/8 survive -> NO_GO (the candidate does not carry the health;
//                     move to the next leg)
// RANK READ (pre-registered alongside survival): regional reach on
// the same band, vs the vetphantom fix leg's 8/8 regional and the
// origin leg's 0/8 regional:
//   >=5/8 regional -> REGIONAL_INTACT
//   <=2/8 regional -> RANK_STALL
//   3–4/8 regional -> RANK_INCONCLUSIVE
// Any survival verdict is a classified outcome; the rank read is
// always classifiable on a complete corpus. Exit 0 on a classified
// outcome with a complete corpus and 0 instrument errors; exit 1 on
// corpus incompleteness, instrument failure, or an unclassifiable
// read. The verdict is the classification — never re-scored.
// SECONDARY (reported, not judged): median survival vs 150d;
// death-cause shares vs the combat-heavy profile; wave 4–5 unlocks;
// national/table/wins; standing range; tribute-ready (ladder read);
// blooded count; peak living wave-4+ veterans per seed vs the bar
// of 2 (reported only — the analyzer does not capture the veteran
// peak; the evidence file reports it from the corpus daily
// snapshots).
// Usage: LEG=r125 node scripts/optb-rederive-analyze-20261112.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LEG = process.env.LEG || 'r125';
const LEGS = {
  r125: { commits: ['10fe7ee52'], label: 'r125 secret-answer variety + teach-plant frames' },
  favor: { commits: ['ed33b42b8', 'b09cf584e'], label: 'r129/r130 favour-line pools + stateful cycle' },
  tendexact: { commits: ['e6911eb80'], label: 'tendexact exact-split _removePantryKcal' },
  grants: { commits: ['b6cf13684', 'a16ce1cc8'], label: 'r128 grant-rate dial + r131 cook/mend grants' },
};
if (!LEGS[LEG]) { console.error('optb-rederive-a: unknown LEG ' + LEG); process.exit(2); }
const DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-optb-rederive-a-' + LEG);
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'optb-rederive-pilot';
const VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, same seeds
const VETPHANTOM_MEDIAN = 150;
const VETPHANTOM_REGIONAL = 8; // vetphantom fix leg: regional 8/8
const ORIGIN_REGIONAL = 0; // bisect-origin-a on a628aeaf3: regional 0/8 (rank stall)
const FIRSTPARENT_SURVIVED = 4; // bisect-firstparent-a on 203a32775, same seeds
const R9CUT_SURVIVED = 4; // bisect-r9-cut-a on ee30f22a2, same seeds
const R10CUT_SURVIVED = 4; // bisect-r10-cut-a on c67a17564, same seeds

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'optb-rederive-s' + seed + '-' + RUN + '-fix.json');
}

function classifySurvived(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'HEALTHY_POLE_REDERIVED';
  return 'NO_GO';
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
      policySha: d.policySha, candidateApplied: d.candidateApplied,
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
    console.error('optb-rederive-a-' + LEG + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judge(analysis);
  const summary = {
    leg: LEG, candidate: LEGS[LEG],
    seeds: SEEDS, run: RUN,
    base: '203a32775', healthyPole: '5157782a4',
    vetphantomFixLeg: { survived: VETPHANTOM_SURVIVED, medianDays: VETPHANTOM_MEDIAN, regional: VETPHANTOM_REGIONAL },
    firstparentLeg: { survived: FIRSTPARENT_SURVIVED, base: '203a32775' },
    r9cutLeg: { survived: R9CUT_SURVIVED, base: 'ee30f22a2' },
    r10cutLeg: { survived: R10CUT_SURVIVED, base: 'c67a17564' },
    originRegional: ORIGIN_REGIONAL,
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
  const outFile = path.join(REPO, 'evidence', '2026-11-12', 'optb-rederive-a-' + LEG + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('optb-rederive-a-' + LEG + ' (' + LEGS[LEG].label + '): ' + j.verdict + ' (survived ' + analysis.survived + '/8 vs vetphantom fix leg ' + VETPHANTOM_SURVIVED + '/8, firstparent ' + FIRSTPARENT_SURVIVED + '/8)');
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
  SEEDS: SEEDS, RUN: RUN, DIR: DIR, LEG: LEG, LEGS: LEGS,
  classifySurvived: classifySurvived,
  classifyRegional: classifyRegional,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows, judge: judge,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile,
};
