// gap-candidates-analyze-20261113.js — analyzer for the +1 gap
// deciding test (arm sim-gap-candidates-a).
// Reads the 8 per-seed JSONs (seeds 190391–190398, the vetphantom band)
// from evidence/2026-11-13/perseed-gap-candidates-a-<LEG>/ and judges
// them against the prereg (evidence/2026-11-13/
// sim-gap-candidates-a-prereg.md).
//
// PRIMARY METRIC — per leg, which of the gap seeds {190392, 190394}
// survive on the collapse window's far end 203a32775 PLUS the leg's
// configuration (with the r131 roster-check fix swapped in, sha
// f8fda4295a99, recorded per seed), and whether any far-end survivor
// is lost. Decision table (prereg, binding):
//   >=1 of {190392, 190394} survives AND 190393, 190397, 190398 all
//     survive -> GO (the leg saves a gap seed with no regression)
//   neither gap seed survives, OR a baseline survivor
//     (190393/190397/190398) is lost -> NO_GO
// RANK READ (reported, not judged): survived count on the band vs the
// vetphantom fix leg's 6/8 and the firstparent leg's 4/8; regional
// reach vs the pole's 8/8.
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
// Usage: LEG=r180 node scripts/gap-candidates-analyze-20261113.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LEG = process.env.LEG || 'r180';
const LEGS = {
  r180: { commits: ['28875b1b1'], label: 'r180 draw-removal (reframed-recap voiceLine skip + topic-ack skip)' },
  joint: { commits: ['10fe7ee52', 'ed33b42b8', 'b09cf584e'], label: 'joint r125 + r129/r130 (secret answers + teach-plant + favour pools + cycle)' },
  reseed: { commits: [], label: 'reseed control (no code change; shared stream shifted by a 997-draw burn after setupGame)' },
  r172: { commits: ['bd0bf10e2'], label: 'r172 one-confession-per-sitting guard' },
};
if (!LEGS[LEG]) { console.error('gap-candidates-a: unknown LEG ' + LEG); process.exit(2); }
const DIR = path.join(REPO, 'evidence', '2026-11-13', 'perseed-gap-candidates-a-' + LEG);
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'gap-candidates-pilot';
const GAP_SEEDS = [190392, 190394];
const BASELINE_SURVIVORS = [190393, 190397, 190398];
const VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, same seeds
const VETPHANTOM_MEDIAN = 150;
const VETPHANTOM_REGIONAL = 8; // vetphantom fix leg: regional 8/8
const FIRSTPARENT_SURVIVED = 4; // bisect-firstparent-a on 203a32775, same seeds

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'gap-candidates-s' + seed + '-' + RUN + '-fix.json');
}

// Gap rule (prereg, binding): GO iff >=1 gap seed survives AND all
// far-end baseline survivors survive. Anything else is NO_GO.
function judgeGap(perSeed) {
  const bySeed = {};
  for (const r of perSeed) bySeed[r.seed] = r;
  const gapSaved = GAP_SEEDS.filter(function (s) { return bySeed[s] && !bySeed[s].villageLost; });
  const lostBaseline = BASELINE_SURVIVORS.filter(function (s) { return bySeed[s] && bySeed[s].villageLost; });
  const go = gapSaved.length >= 1 && lostBaseline.length === 0;
  return { verdict: go ? 'GO' : 'NO_GO', gapSaved: gapSaved, lostBaseline: lostBaseline };
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
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  return { perSeed: perSeed, survived: survived, wall: wall, causes: causes, instrumentErrors: instrumentErrors };
}

function judge(analysis) {
  const g = judgeGap(analysis.perSeed);
  return { verdict: g.verdict, gapSaved: g.gapSaved, lostBaseline: g.lostBaseline, classifiable: true };
}

function main() {
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('gap-candidates-a-' + LEG + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judge(analysis);
  const summary = {
    leg: LEG, candidate: LEGS[LEG],
    seeds: SEEDS, run: RUN,
    base: '203a32775', healthyPole: '5157782a4',
    gapSeeds: GAP_SEEDS, baselineSurvivors: BASELINE_SURVIVORS,
    vetphantomFixLeg: { survived: VETPHANTOM_SURVIVED, medianDays: VETPHANTOM_MEDIAN, regional: VETPHANTOM_REGIONAL },
    firstparentLeg: { survived: FIRSTPARENT_SURVIVED, base: '203a32775' },
    standingFixSha: 'f8fda4295a99',
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    gapSaved: j.gapSaved,
    lostBaseline: j.lostBaseline,
    classifiable: j.classifiable,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-13', 'gap-candidates-a-' + LEG + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('gap-candidates-a-' + LEG + ' (' + LEGS[LEG].label + '): ' + j.verdict + ' (gap saved: ' + (j.gapSaved.join(', ') || 'none') + '; lost baseline: ' + (j.lostBaseline.join(', ') || 'none') + '; survived ' + analysis.survived + '/8 vs vetphantom fix leg ' + VETPHANTOM_SURVIVED + '/8, firstparent ' + FIRSTPARENT_SURVIVED + '/8)');
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
  GAP_SEEDS: GAP_SEEDS, BASELINE_SURVIVORS: BASELINE_SURVIVORS,
  judgeGap: judgeGap,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows, judge: judge,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile,
};
