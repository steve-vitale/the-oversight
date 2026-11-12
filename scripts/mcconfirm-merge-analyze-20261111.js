// mcconfirm-merge-analyze-20261111.js — analyzer for the
// survival-collapse CONFIRM leg (arm sim-mcconfirm-merge-b, Loop B run
// fleshout-b-2026-11-12T03:29Z). Reads the 16 per-seed JSONs (seeds
// 190419–190434, a FRESH band) from
// evidence/2026-11-11/perseed-mcconfirm-merge-b/ and reports this
// leg's numbers against the prereg
// (evidence/2026-11-11/sim-mcconfirm-merge-b-prereg.md).
//
// PRIMARY METRIC — survived count on the reconcile-merge base
// e4dbe581b WITH the r131 roster-check fix swapped in (sha
// f8fda4295a99, recorded per seed), on the fresh band 190419–190434.
// This analyzer judges THIS LEG ONLY: survived count, median survival
// (the same upper-median convention as merge-a: s[floor(n/2)] on
// sorted days), and corpus completeness. It does NOT claim the joint
// verdict. The JOINT decision rule (same text as the sibling control
// leg; the coordinator reads both legs and calls it):
//   CONFIRMED  if merge survived <= control - 4 AND control >= 8/16
//   REFUTED    if merge survived >= control - 1
//   INCONCLUSIVE otherwise
// where "merge" is this leg's survived count and "control" is the
// sibling control leg's survived count on the same fresh band. The
// jointVerdict(merge, control) export implements exactly that rule
// and is proof-tested; main() leaves jointVerdict as
// 'PENDING_CONTROL_LEG' until the control leg is read, and exits 0
// on a complete corpus with 0 instrument errors.
// SECONDARY (reported, not judged): median survival; death-cause
// shares; wave 4–5 unlocks; national/table/wins; standing range;
// tribute-ready days (from the final instrument snapshot's tribute
// read + the driver's end tribute field); blooded count; phantom
// days (0 expected — the fix is swapped in).
// Usage: node scripts/mcconfirm-merge-analyze-20261111.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-11', 'perseed-mcconfirm-merge-b');
const SEEDS = [190419, 190420, 190421, 190422, 190423, 190424, 190425, 190426, 190427, 190428, 190429, 190430, 190431, 190432, 190433, 190434];
const RUN = 'mcconfirm-merge-pilot';
const MERGE_A_SURVIVED = 1; // merge-a leg on e4dbe581b, matched band 190391–190398: 1/8
const MERGE_A_MEDIAN = 126; // merge-a leg, same upper-median convention

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'mcconfirm-merge-s' + seed + '-' + RUN + '-fix.json');
}

// The JOINT decision rule (prereg; same text as the sibling leg).
// merge = this leg's survived count (0–16); control = the sibling
// control leg's survived count on the same fresh band (0–16).
// CONFIRMED if merge <= control - 4 AND control >= 8; REFUTED if
// merge >= control - 1; INCONCLUSIVE otherwise. Out-of-range or
// non-numeric inputs are UNCLASSIFIABLE. The coordinator calls the
// joint verdict from both legs; this analyzer only reports this
// leg's numbers.
function jointVerdict(mergeSurvived, controlSurvived) {
  if (typeof mergeSurvived !== 'number' || typeof controlSurvived !== 'number' ||
      !Number.isFinite(mergeSurvived) || !Number.isFinite(controlSurvived) ||
      mergeSurvived < 0 || mergeSurvived > 16 || controlSurvived < 0 || controlSurvived > 16) return 'UNCLASSIFIABLE';
  if (mergeSurvived <= controlSurvived - 4 && controlSurvived >= 8) return 'CONFIRMED';
  if (mergeSurvived >= controlSurvived - 1) return 'REFUTED';
  return 'INCONCLUSIVE';
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

function main() {
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('mcconfirm-merge-b: INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const summary = {
    seeds: SEEDS, run: RUN,
    mergeALeg: { survived: MERGE_A_SURVIVED, medianDays: MERGE_A_MEDIAN, seeds: [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398] },
    mergeBase: 'e4dbe581b',
    standingFixSha: 'f8fda4295a99',
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    jointVerdict: 'PENDING_CONTROL_LEG',
    controlSurvived: null,
    jointRule: 'CONFIRMED if merge survived <= control - 4 AND control >= 8/16; REFUTED if merge >= control - 1; INCONCLUSIVE otherwise (coordinator reads both legs)',
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-11', 'mcconfirm-merge-b-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('mcconfirm-merge-b: survived ' + analysis.survived + '/16 on the merge base (joint verdict PENDING — control leg not yet read; coordinator calls it)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/16, wave4 ' + analysis.wall.wave4 + '/16, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
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
  SEEDS: SEEDS, RUN: RUN, DIR: DIR,
  jointVerdict: jointVerdict,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile,
};
