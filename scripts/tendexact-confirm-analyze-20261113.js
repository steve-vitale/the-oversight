// tendexact-confirm-analyze-20261113.js — analyzer for the
// tendexact fresh-seed confirm (arm sim-tendexact-confirm-a).
// Reads the 8 per-seed JSONs (FRESH seeds 190401–190408) from
// evidence/2026-11-13/perseed-tendexact-confirm-a-<LEG>/ and judges
// them against the prereg (evidence/2026-11-13/
// sim-tendexact-confirm-a-prereg.md).
//
// PRIMARY METRIC — survived count on the fresh band, tendexact leg
// vs baseline leg on identical seeds (far end 203a32775 + roster-
// check fix swap, mode fix only). GO bar (all four conjunctive):
//   tendexact survives >= baseline+1 AND >=5/8
//   tendexact median >= 0.8x baseline median
//   tendexact starvation <= baseline starvation + 2
//   -> GENERALIZES (the tendexact +1 holds off the matched band)
//   otherwise -> NO-GO (the re-derivation does not generalize)
// The baseline leg alone is reported, not judged (verdict BASELINE).
// RANK READ (pre-registered alongside survival): regional reach on
// the same band, per leg:
//   >=5/8 regional -> REGIONAL_INTACT
//   <=2/8 regional -> RANK_STALL
//   3–4/8 regional -> RANK_INCONCLUSIVE
// Any verdict is a classified outcome; the rank read is always
// classifiable on a complete corpus. Exit 0 on a classified outcome
// with complete corpora and 0 instrument errors; exit 1 on corpus
// incompleteness, instrument failure, or an unclassifiable read. The
// verdict is the classification — never re-scored.
// SECONDARY (reported, not judged): median survival; death-cause
// shares; wave 4–5 unlocks; national/table/wins; standing range;
// tribute-ready (ladder read); blooded count; starvation count;
// peak living wave-4+ veterans per seed vs the bar of 2 (reported
// only — the analyzer does not capture the veteran peak; the
// evidence file reports it from the corpus daily snapshots).
// Usage: LEG=tendexact node scripts/tendexact-confirm-analyze-20261113.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LEG = process.env.LEG || 'tendexact';
const LEGS = {
  baseline: { commits: [], label: 'far end 203a32775 + fix swap only (no candidate)' },
  tendexact: { commits: ['e6911eb80'], label: 'tendexact exact-split _removePantryKcal' },
};
if (!LEGS[LEG]) { console.error('tendexact-confirm-a: unknown LEG ' + LEG); process.exit(2); }
const DIR = path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendexact-confirm-a-' + LEG);
const SEEDS = [190401, 190402, 190403, 190404, 190405, 190406, 190407, 190408];
const RUN = 'tendexact-confirm-pilot';
const MATCHED_TENDEXACT_SURVIVED = 5; // rederive L3, matched band 190391-190398
const MATCHED_FAREND_SURVIVED = 4; // firstparent leg, matched band 190391-190398
const MATCHED_VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, matched band 190391-190398

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'tendexact-confirm-s' + seed + '-' + RUN + '-fix.json');
}

function classifySurvived(n) {
  // Per-leg survival count classification only (used for the
  // baseline read and the synthetic checks): >=5 is the rederive
  // count bar, <=4 is not. The arm verdict comes from judge(),
  // which compares the two legs under the full GO bar.
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'AT_REDERIVE_COUNT';
  return 'BELOW_REDERIVE_COUNT';
}

function classifyGoBar(baseline, tendexact) {
  // GO bar (prereg, all conjunctive): tendexact survives >=
  // baseline+1 AND >=5/8, median >= 0.8x baseline median,
  // starvation <= baseline+2. Either analysis missing a field is
  // UNCLASSIFIABLE, never a pass.
  if (!baseline || !tendexact) return 'UNCLASSIFIABLE';
  const b = baseline.survived, t = tendexact.survived;
  const bm = baseline.wall && baseline.wall.medianDays, tm = tendexact.wall && tendexact.wall.medianDays;
  const bs = baseline.wall ? baseline.wall.starvation : undefined;
  const ts = tendexact.wall ? tendexact.wall.starvation : undefined;
  if ([b, t, bm, tm, bs, ts].some(function (v) { return typeof v !== 'number' || !Number.isFinite(v); })) return 'UNCLASSIFIABLE';
  const ok = t >= b + 1 && t >= 5 && tm >= 0.8 * bm && ts <= bs + 2;
  return ok ? 'GENERALIZES' : 'NO_GO';
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
    starvation: rows.reduce(function (a, d) { return a + (d.deaths || []).filter(function (x) { return (x.cause || x.kind) === 'starvation'; }).length; }, 0),
    survived: survived,
    deaths: perSeed.reduce(function (a, r) { return a + r.deaths; }, 0),
    standingRange: [Math.min.apply(null, perSeed.map(function (r) { return r.standing; })), Math.max.apply(null, perSeed.map(function (r) { return r.standing; }))],
    blooded: perSeed.filter(function (r) { return r.blooded; }).length,
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  return { perSeed: perSeed, survived: survived, wall: wall, causes: causes, instrumentErrors: instrumentErrors };
}

function judge(baselineAnalysis, tendexactAnalysis) {
  // The two-arg form is the only judged form. For the baseline leg,
  // main() reports BASELINE directly.
  const verdict = classifyGoBar(baselineAnalysis, tendexactAnalysis);
  const rankVerdict = (verdict === 'UNCLASSIFIABLE' || !tendexactAnalysis || !tendexactAnalysis.wall)
    ? 'UNCLASSIFIABLE' : classifyRegional(tendexactAnalysis.wall.regional);
  const ok = verdict !== 'UNCLASSIFIABLE' && rankVerdict !== 'UNCLASSIFIABLE';
  return { verdict: verdict, rankVerdict: rankVerdict, classifiable: ok };
}

function main() {
  if (LEG === 'baseline') {
    const corpus = loadCorpus(SEEDS);
    if (!corpus.complete) {
      console.error('tendexact-confirm-a-' + LEG + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
      process.exit(1);
    }
    const analysis = analyzeRows(corpus.rows);
    const rankVerdict = classifyRegional(analysis.wall.regional);
    const summary = {
      leg: LEG, candidate: LEGS[LEG],
      seeds: SEEDS, run: RUN,
      base: '203a32775',
      matchedBand: { tendexactSurvived: MATCHED_TENDEXACT_SURVIVED, farEndSurvived: MATCHED_FAREND_SURVIVED, vetphantomSurvived: MATCHED_VETPHANTOM_SURVIVED },
      standingFixSha: 'f8fda4295a99',
      perSeed: analysis.perSeed,
      survived: analysis.survived,
      verdict: 'BASELINE',
      rankVerdict: rankVerdict,
      classifiable: rankVerdict !== 'UNCLASSIFIABLE',
      wall: analysis.wall,
      deathCauses: analysis.causes,
      instrumentErrors: analysis.instrumentErrors,
    };
    const outFile = path.join(REPO, 'evidence', '2026-11-13', 'tendexact-confirm-a-' + LEG + '-summary.json');
    fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
    console.log('tendexact-confirm-a-' + LEG + ' (' + LEGS[LEG].label + '): BASELINE (survived ' + analysis.survived + '/8, matched-band far end ' + MATCHED_FAREND_SURVIVED + '/8)');
    console.log('  rank: ' + rankVerdict + ' (regional ' + analysis.wall.regional + '/8)');
    console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', starvation ' + analysis.wall.starvation + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
    console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
    console.log('  instrument errors: ' + analysis.instrumentErrors);
    for (const r of analysis.perSeed) {
      console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
    }
    console.log('  summary: ' + path.relative(REPO, outFile));
    if (rankVerdict === 'UNCLASSIFIABLE' || analysis.instrumentErrors > 0) process.exit(1);
    process.exit(0);
  }
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('tendexact-confirm-a-' + LEG + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const baseDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendexact-confirm-a-baseline');
  const baseCorpus = loadCorpus(SEEDS, baseDir);
  if (!baseCorpus.complete) {
    console.error('tendexact-confirm-a-' + LEG + ': INCOMPLETE baseline corpus — missing seeds: ' + baseCorpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const baseAnalysis = analyzeRows(baseCorpus.rows);
  const j = judge(baseAnalysis, analysis);
  const summary = {
    leg: LEG, candidate: LEGS[LEG],
    seeds: SEEDS, run: RUN,
    base: '203a32775',
    matchedBand: { tendexactSurvived: MATCHED_TENDEXACT_SURVIVED, farEndSurvived: MATCHED_FAREND_SURVIVED, vetphantomSurvived: MATCHED_VETPHANTOM_SURVIVED },
    baseline: { survived: baseAnalysis.survived, medianDays: baseAnalysis.wall.medianDays, starvation: baseAnalysis.wall.starvation, regional: baseAnalysis.wall.regional },
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
  const outFile = path.join(REPO, 'evidence', '2026-11-13', 'tendexact-confirm-a-' + LEG + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('tendexact-confirm-a-' + LEG + ' (' + LEGS[LEG].label + '): ' + j.verdict + ' (survived ' + analysis.survived + '/8 vs baseline ' + baseAnalysis.survived + '/8, matched-band tendexact ' + MATCHED_TENDEXACT_SURVIVED + '/8, far end ' + MATCHED_FAREND_SURVIVED + '/8)');
  console.log('  GO bar: survived ' + analysis.survived + ' vs baseline+1=' + (baseAnalysis.survived + 1) + ' and >=5; median ' + analysis.wall.medianDays + 'd vs 0.8x baseline ' + (0.8 * baseAnalysis.wall.medianDays) + 'd; starvation ' + analysis.wall.starvation + ' vs baseline+2=' + (baseAnalysis.wall.starvation + 2));
  console.log('  rank: ' + j.rankVerdict + ' (regional ' + analysis.wall.regional + '/8 vs baseline ' + baseAnalysis.wall.regional + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', starvation ' + analysis.wall.starvation + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
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
  classifyGoBar: classifyGoBar,
  classifyRegional: classifyRegional,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows, judge: judge,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile,
};
