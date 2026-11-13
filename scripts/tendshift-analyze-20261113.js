// tendshift-analyze-20261113.js — analyzer for the tendexact x
// stream-shift interaction leg (arm sim-tendshift-a).
// Reads the 8 per-seed JSONs (seeds 190391–190398, the matched band)
// from evidence/2026-11-13/perseed-tendshift-a-<LEG>/ and judges
// them against the prereg (evidence/2026-11-13/
// sim-tendshift-a-prereg.md).
//
// PRIMARY METRIC — the interaction leg (current master f7352f946 +
// a 997-draw burn after setupGame, no code change) vs the baseline
// leg (current master, no burn) on identical seeds. Decision rule
// (prereg, binding, ALL conjunctive):
//   interaction saves >=1 of {190392, 190394} that the baseline
//     LOSES,
//   AND every baseline survivor also survives on the interaction
//     leg (no regression),
//   AND median >= 0.8x baseline median,
//   AND starvation <= baseline+2
//   -> GO (the interaction saves a gap seed with no regression)
//   Any condition fails -> NO_GO.
// PREREG ADDENDUM: if the baseline already saves a gap seed, the
// interaction leg must HOLD that save — the gap seed is then a
// baseline survivor, and losing it is a regression under the
// no-regression condition. The "saves >=1 gap seed the baseline
// loses" condition is then read against the remaining gap seed(s)
// only.
// The baseline leg alone is reported, not judged (verdict BASELINE).
// RANK READ (reported, not judged): survived count on the band vs
// the healthy pole's 6/8 and the far-end firstparent's 4/8;
// regional reach vs the pole's 8/8.
// Any GO/NO_GO/BASELINE is a classified outcome. Exit 0 on a
// classified outcome with a complete corpus and 0 instrument errors;
// exit 1 on corpus incompleteness, instrument failure, or an
// unclassifiable read. The verdict is the classification — never
// re-scored.
// SECONDARY (reported, not judged): median survival vs 150d;
// death-cause shares vs the combat-heavy profile; wave 4–5 unlocks;
// national/table/wins; standing range; tribute-ready (ladder read);
// blooded count; peak living wave-4+ veterans per seed vs the bar
// of 2 (reported only — the analyzer does not capture the veteran
// peak; the evidence file reports it from the corpus daily
// snapshots).
// Usage: LEG=baseline node scripts/tendshift-analyze-20261113.js
//        LEG=interaction node scripts/tendshift-analyze-20261113.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LEG = process.env.LEG || 'baseline';
const LEGS = {
  baseline: { label: 'baseline (current master f7352f946, no burn)' },
  interaction: { label: 'interaction (current master + 997-draw burn after setupGame, no code change)' },
};
if (!LEGS[LEG]) { console.error('tendshift-a: unknown LEG ' + LEG); process.exit(2); }
const DIR = path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendshift-a-' + LEG);
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'tendshift-pilot';
const MODE = 'master';
const GAP_SEEDS = [190392, 190394];
const POLE_SURVIVED = 6; // vetphantom fix leg, same seeds, 5157782a4
const POLE_MEDIAN = 150;
const POLE_REGIONAL = 8; // vetphantom fix leg: regional 8/8
const FIRSTPARENT_SURVIVED = 4; // bisect-firstparent-a on 203a32775, same seeds

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'tendshift-s' + seed + '-' + RUN + '-' + MODE + '.json');
}

// GO bar (prereg, binding, all conjunctive). baselineRows and
// interactionRows are the analyzer's perSeed rows; the starvation
// counts come from the RAW corpora (countStarvationRaw) because
// the analyzed rows do not carry death causes.
function judgeInteraction(baselineRows, interactionRows, baseStarvation, interStarvation) {
  const base = {};
  for (const r of baselineRows) base[r.seed] = r;
  const inter = {};
  for (const r of interactionRows) inter[r.seed] = r;
  // Gap seeds the interaction saves that the baseline LOSES.
  const gapSaved = GAP_SEEDS.filter(function (s) {
    return base[s] && base[s].villageLost && inter[s] && !inter[s].villageLost;
  });
  // No regression: every baseline survivor must also survive.
  const baselineSurvivors = SEEDS.filter(function (s) { return base[s] && !base[s].villageLost; });
  const lostBaseline = baselineSurvivors.filter(function (s) { return inter[s] && inter[s].villageLost; });
  const baseMedian = median(baselineRows.map(function (r) { return r.days; }));
  const interMedian = median(interactionRows.map(function (r) { return r.days; }));
  const medianOk = interMedian >= 0.8 * baseMedian;
  const starvationOk = interStarvation <= baseStarvation + 2;
  const go = gapSaved.length >= 1 && lostBaseline.length === 0 && medianOk && starvationOk;
  return {
    verdict: go ? 'GO' : 'NO_GO',
    gapSaved: gapSaved,
    lostBaseline: lostBaseline,
    baselineSurvivors: baselineSurvivors,
    baseMedian: baseMedian, interMedian: interMedian, medianOk: medianOk,
    baseStarvation: baseStarvation, interStarvation: interStarvation, starvationOk: starvationOk,
    classifiable: true,
  };
}

// Starvation is counted from the RAW corpus rows (per-seed death
// records, cause === 'starvation'), not from the analyzed rows.
function countStarvationRaw(rawRows) {
  let n = 0;
  for (const d of rawRows) {
    for (const death of (d.deaths || [])) {
      if (death.cause === 'starvation') n++;
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
      policySha: d.policySha, candidateApplied: d.candidateApplied, reseedBurn: d.reseedBurn || null,
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
    starvation: countStarvationRaw(rows),
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  return { perSeed: perSeed, survived: survived, wall: wall, causes: causes, instrumentErrors: instrumentErrors };
}

function main() {
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('tendshift-a-' + LEG + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  let j = null;
  if (LEG === 'baseline') {
    j = { verdict: 'BASELINE', gapSaved: [], lostBaseline: [], classifiable: true };
  } else {
    const baseDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-tendshift-a-baseline');
    const baseCorpus = loadCorpus(SEEDS, baseDir);
    if (!baseCorpus.complete) {
      console.error('tendshift-a-interaction: INCOMPLETE baseline corpus — missing seeds: ' + baseCorpus.missing.join(', '));
      process.exit(1);
    }
    const baseAnalysis = analyzeRows(baseCorpus.rows);
    // The median condition reads the analyzed rows; the
    // starvation condition reads the RAW corpora (death records).
    j = judgeInteraction(
      baseAnalysis.perSeed, analysis.perSeed,
      countStarvationRaw(baseCorpus.rows), countStarvationRaw(corpus.rows)
    );
  }
  const summary = {
    leg: LEG, candidate: LEGS[LEG],
    seeds: SEEDS, run: RUN, mode: MODE,
    base: 'f7352f946', healthyPole: '5157782a4',
    gapSeeds: GAP_SEEDS,
    vetphantomFixLeg: { survived: POLE_SURVIVED, medianDays: POLE_MEDIAN, regional: POLE_REGIONAL },
    firstparentLeg: { survived: FIRSTPARENT_SURVIVED, base: '203a32775' },
    standingSha: 'f935997640a0',
    policySha: '74a890f0844e',
    tendexact: 'e6911eb80',
    reseedBurn: LEG === 'interaction' ? 997 : null,
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    gapSaved: j.gapSaved || [],
    lostBaseline: j.lostBaseline || [],
    baselineSurvivors: j.baselineSurvivors || null,
    baseMedian: j.baseMedian || null,
    interMedian: j.interMedian || null,
    medianOk: j.medianOk || null,
    baseStarvation: j.baseStarvation != null ? j.baseStarvation : null,
    interStarvation: j.interStarvation != null ? j.interStarvation : null,
    starvationOk: j.starvationOk || null,
    classifiable: j.classifiable,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-13', 'tendshift-a-' + LEG + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('tendshift-a-' + LEG + ' (' + LEGS[LEG].label + '): ' + j.verdict + ' (gap saved: ' + ((j.gapSaved || []).join(', ') || 'none') + '; lost baseline: ' + ((j.lostBaseline || []).join(', ') || 'none') + '; survived ' + analysis.survived + '/8 vs healthy pole ' + POLE_SURVIVED + '/8, firstparent ' + FIRSTPARENT_SURVIVED + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1] + ', starvation ' + analysis.wall.starvation);
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
  GAP_SEEDS: GAP_SEEDS,
  judgeInteraction: judgeInteraction,
  countStarvationRaw: countStarvationRaw,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile,
};
