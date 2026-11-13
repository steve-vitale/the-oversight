// burnoffsets-analyze-20261113.js — analyzer for the more-reseed-burn
// offsets arm (arm sim-burnoffsets-a).
// Reads the 8 per-seed JSONs (seeds 190391–190398, the vetphantom band)
// from evidence/2026-11-13/perseed-burnoffsets-a-b<N>/ and judges them
// against the MEASURED baseline leg (b0, same seeds, same master) per
// the prereg (evidence/2026-11-13/sim-burnoffsets-a-prereg.md).
//
// PRIMARY METRIC — per offset, which of the gap seeds {190392, 190394}
// the burn leg saves that the baseline LOSES, and whether any baseline
// survivor is lost. Decision table (prereg, binding, all conjunctive):
//   >=1 gap seed saved (that the baseline loses) AND no baseline
//     survivor lost AND median >= 0.8x baseline median AND starvation
//     deaths <= baseline starvation + 2 -> GO
//   anything else -> NO_GO
// RANK READ (reported, not judged): survived count on the band vs the
// measured baseline; regional reach.
// Any GO/NO_GO is a classified outcome. Exit 0 on a classified
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
// Usage: BURN=1 node scripts/burnoffsets-analyze-20261113.js
// (BURN=0 prints the baseline read with no verdict.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const BURN = parseInt(process.env.BURN || '1', 10);
const BURNS = [0, 1, 13, 251, 499, 1999];
if (BURNS.indexOf(BURN) === -1) { console.error('burnoffsets-a: unknown BURN ' + BURN); process.exit(2); }
const DIR = path.join(REPO, 'evidence', '2026-11-13', 'perseed-burnoffsets-a-b' + BURN);
const BASE_DIR = path.join(REPO, 'evidence', '2026-11-13', 'perseed-burnoffsets-a-b0');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'burnoffsets-pilot';
const MODE = 'competent-burnoffsets';
const GAP_SEEDS = [190392, 190394];

function perSeedFile(seed, dir) {
  return path.join(dir, 'burnoffsets-s' + seed + '-' + RUN + '-' + MODE + '.json');
}

// GO rule (prereg, binding, all conjunctive): saves >=1 gap seed the
// baseline loses, no baseline survivor lost, median >= 0.8x baseline
// median, starvation <= baseline starvation + 2.
function judgeOffset(legRows, baseRows) {
  const bySeed = {};
  for (const r of legRows) bySeed[r.seed] = r;
  const baseBySeed = {};
  for (const r of baseRows) baseBySeed[r.seed] = r;
  const baselineSurvivors = SEEDS.filter(function (s) { return baseBySeed[s] && !baseBySeed[s].villageLost; });
  const baselineLostGap = GAP_SEEDS.filter(function (s) { return baseBySeed[s] && baseBySeed[s].villageLost; });
  const gapSaved = baselineLostGap.filter(function (s) { return bySeed[s] && !bySeed[s].villageLost; });
  const lostBaseline = baselineSurvivors.filter(function (s) { return bySeed[s] && bySeed[s].villageLost; });
  const legMedian = median(legRows.map(function (r) { return r.days; }));
  const baseMedian = median(baseRows.map(function (r) { return r.days; }));
  const medianOk = legMedian !== null && baseMedian !== null && legMedian >= 0.8 * baseMedian;
  const legStarv = starvationDeaths(legRows);
  const baseStarv = starvationDeaths(baseRows);
  const starvOk = legStarv <= baseStarv + 2;
  const go = gapSaved.length >= 1 && lostBaseline.length === 0 && medianOk && starvOk;
  return {
    verdict: go ? 'GO' : 'NO_GO',
    gapSaved: gapSaved, lostBaseline: lostBaseline,
    baselineSurvivors: baselineSurvivors, baselineLostGap: baselineLostGap,
    legMedian: legMedian, baseMedian: baseMedian, medianOk: medianOk,
    legStarvation: legStarv, baseStarvation: baseStarv, starvOk: starvOk,
  };
}

function starvationDeaths(rows) {
  let n = 0;
  for (const d of rows) {
    for (const death of (d.deaths || [])) {
      if ((death.cause || death.kind) === 'starvation') n++;
    }
  }
  return n;
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
      policySha: d.policySha, burnOffset: (d.burnOffset == null ? null : d.burnOffset),
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
    starvation: starvationDeaths(rows),
    standingRange: [Math.min.apply(null, perSeed.map(function (r) { return r.standing; })), Math.max.apply(null, perSeed.map(function (r) { return r.standing; }))],
    blooded: perSeed.filter(function (r) { return r.blooded; }).length,
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  return { perSeed: perSeed, survived: survived, wall: wall, causes: causes, instrumentErrors: instrumentErrors };
}

function main() {
  const corpus = loadCorpus(SEEDS, DIR);
  if (!corpus.complete) {
    console.error('burnoffsets-a-b' + BURN + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  let judgment = null;
  let baseAnalysis = null;
  if (BURN !== 0) {
    const baseCorpus = loadCorpus(SEEDS, BASE_DIR);
    if (!baseCorpus.complete) {
      console.error('burnoffsets-a-b' + BURN + ': INCOMPLETE baseline corpus — missing seeds: ' + baseCorpus.missing.join(', '));
      process.exit(1);
    }
    baseAnalysis = analyzeRows(baseCorpus.rows);
    judgment = judgeOffset(corpus.rows, baseCorpus.rows);
  }
  const summary = {
    burnOffset: BURN,
    seeds: SEEDS, run: RUN, mode: MODE,
    base: 'f7352f946',
    gapSeeds: GAP_SEEDS,
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: judgment ? judgment.verdict : 'BASELINE',
    judgment: judgment,
    baseline: baseAnalysis ? {
      survived: baseAnalysis.survived, wall: baseAnalysis.wall,
      perSeed: baseAnalysis.perSeed,
    } : null,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-13', 'burnoffsets-a-b' + BURN + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  if (BURN === 0) {
    console.log('burnoffsets-a-b0 (baseline, current master f7352f946): survived ' + analysis.survived + '/8');
  } else {
    console.log('burnoffsets-a-b' + BURN + ': ' + judgment.verdict + ' (gap saved: ' + (judgment.gapSaved.join(', ') || 'none') + '; lost baseline: ' + (judgment.lostBaseline.join(', ') || 'none') + '; median ' + judgment.legMedian + ' vs baseline ' + judgment.baseMedian + ' (ok=' + judgment.medianOk + '); starvation ' + judgment.legStarvation + ' vs baseline ' + judgment.baseStarvation + ' (ok=' + judgment.starvOk + '); survived ' + analysis.survived + '/8 vs baseline ' + baseAnalysis.survived + '/8)');
  }
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', starvation ' + analysis.wall.starvation + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  if (analysis.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN, MODE: MODE, DIR: DIR, BASE_DIR: BASE_DIR,
  BURN: BURN, BURNS: BURNS,
  GAP_SEEDS: GAP_SEEDS,
  judgeOffset: judgeOffset,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows,
  deathCauseShares: deathCauseShares, median: median,
  starvationDeaths: starvationDeaths,
  perSeedFile: perSeedFile,
};
