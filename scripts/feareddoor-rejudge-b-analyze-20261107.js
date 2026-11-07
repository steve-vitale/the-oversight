// feareddoor-rejudge-b-analyze-20261107.js — the feared-door
// RE-JUDGE analyzer (arm sim-feareddoor-rejudge-b, run
// fleshout-loop-b-20261107T1830Z). Re-judges the FROZEN corpus
// (evidence/2026-11-07/perseed-feareddoor-b-baseline/ and
// perseed-feareddoor-b-armed/, band 53201-53212, judged at branch
// tip 6e8b3e8f0) under the REVISED metric from the re-judge prereg
// (evidence/2026-11-07/sim-feareddoor-rejudge-b-prereg.md,
// committed 16d6acac5 BEFORE this judgment):
//   PRIMARY (REVISED): feared wins >= 4/12 armed AND >= 3 more
//     feared wins than baseline on identical seeds.
//   SUBSTRATE SANITY (unchanged): baseline lesser >= 4/12 AND
//     sat >= 4/12.
//   SUBSTRATE GUARD (unchanged): 12/12 per-seed exact
//     pre-first-bind.
//   COST BAR (REVISED): per-seed survival non-inferiority 12/12;
//     starvation <= baseline + 2 total AND arm-only starvation 0;
//     median survival armed >= 0.8x baseline median.
// NO NEW SIMS: this script reads only the frozen per-seed files.
// It reuses the frozen analyzer's per-seed analysis by require
// (analyzeSeed, preEntryMatch, medianOf, starvation,
// effectiveDays) — the frozen analyzer
// (scripts/feareddoor-b-analyze-20261107.js) is NOT edited, and
// its verdict under the frozen header stands on the record.
// Prints a JSON summary to stdout and writes it to
// /tmp/feareddoor-rejudge-b-analysis.json (working copy; the
// evidence file is the record). Usage:
//   node scripts/feareddoor-rejudge-b-analyze-20261107.js [baselineDir] [armedDir]
'use strict';
const fs = require('fs');
const path = require('path');
const FROZEN = require('./feareddoor-b-analyze-20261107');
const analyzeSeed = FROZEN.analyzeSeed;
const preEntryMatch = FROZEN.preEntryMatch;
const medianOf = FROZEN.medianOf;
const starvation = FROZEN.starvation;
const effectiveDays = FROZEN.effectiveDays;

const HORIZON = 150;

function w4kills(o) {
  return (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
}
function pairDays(o) {
  return (o.daily || []).filter(function (d) { return d.pairDay; }).length;
}
function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const bySeed = {};
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[o.seed] = o;
  });
  return bySeed;
}

// judgeRevised: pure judge over summary counts. The counts are
// computed by analyzeCorpus from the frozen corpora; the proof
// exercises this function directly on synthetic counts so the
// bars themselves are pinned independently of any corpus.
function judgeRevised(c) {
  const margin = c.fearedWinsArmed - c.fearedWinsBaseline;
  const primary = {
    fearedWinsArmed: c.fearedWinsArmed, fearedWinsBaseline: c.fearedWinsBaseline,
    fearedWinsMargin: margin,
    fearedEnteredArmed: c.fearedEnteredArmed, fearedEnteredBaseline: c.fearedEnteredBaseline,
    bar: 'feared wins >=4/12 armed AND >=3 more feared wins than baseline on identical seeds',
    pass: c.fearedWinsArmed >= 4 && margin >= 3,
  };
  const substrateSanity = {
    baseSeatsEarned: c.baseSeats, baseSat: c.baseSat, armedSat: c.armedSat,
    bar: 'baseline lesser >=4/12 AND sat >=4/12',
    pass: c.baseSeats >= 4 && c.baseSat >= 4,
  };
  const substrateGuard = {
    exactSeeds: c.guardPass, of: c.guardOf,
    bar: '12/12 per-seed exact pre-first-bind',
    pass: c.guardPass === c.guardOf,
  };
  const medianRatio = (c.medianBase != null && c.medianBase > 0)
    ? (c.medianArmed / c.medianBase) : null;
  const costBar = {
    starvationBase: c.starvBase, starvationArmed: c.starvArmed,
    starvationCap: c.starvBase + 2, starvationArmOnly: c.starvArmOnly,
    starvationPass: c.starvArmed <= c.starvBase + 2 && c.starvArmOnly === 0,
    nonInferiorSeeds: c.nonInfPass, nonInferiorOf: c.nonInfOf,
    nonInferiorityPass: c.nonInfPass === c.nonInfOf,
    medianBase: c.medianBase, medianArmed: c.medianArmed,
    medianRatio: medianRatio, medianBar: 'armed median >= 0.8x baseline median',
    medianPass: medianRatio != null && medianRatio >= 0.8,
    pass: null,
  };
  costBar.pass = costBar.starvationPass && costBar.nonInferiorityPass && costBar.medianPass;
  const verdict = { primary: primary, substrateSanity: substrateSanity, substrateGuard: substrateGuard, costBar: costBar };
  verdict.overall = (primary.pass && substrateSanity.pass && substrateGuard.pass && costBar.pass) ? 'GO' : 'NO-GO';
  if (!substrateSanity.pass) verdict.overall = 'NO-GO (substrate — feared drive unjudged)';
  return verdict;
}

function wall(rows) {
  return {
    national: rows.filter(function (r) { return r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
    tableSat: rows.filter(function (r) { return r.tsTaken > 0; }).length,
    doorsEntered: rows.filter(function (r) { return r.doorsEntered > 0; }).length,
    fearedEntered: rows.filter(function (r) { return r.fearedEntered > 0; }).length,
    fearedWins: rows.filter(function (r) { return r.fearedWin; }).length,
    wins: rows.filter(function (r) { return r.won; }).length,
    wave4unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 4; }).length,
    wave5unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 5; }).length,
    wave5faced: rows.filter(function (r) { return (r.w5kills | 0) > 0; }).length,
    regional: rows.filter(function (r) { return r.scaleRank === 'regional' || r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
    lesserSeats: rows.filter(function (r) { return r.finalSeat === 'lesser'; }).length,
    fullSeats: rows.filter(function (r) { return r.finalSeat === 'full'; }).length,
    medianSurvival: medianOf(rows.map(function (r) { return r.days; })),
    medianSurvivalNonWon: medianOf(rows.filter(function (r) { return !r.won; }).map(function (r) { return r.days; })),
    survivals: rows.map(function (r) { return r.days; }),
  };
}

// analyzeCorpus: load the two frozen corpora, compute per-seed
// rows with the FROZEN analyzer's analyzeSeed, compute the guard
// with the FROZEN guard logic, and judge the REVISED bars.
function analyzeCorpus(baseDir, armedDir) {
  const base = loadDir(baseDir);
  const armed = loadDir(armedDir);
  const seeds = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) throw new Error('no baseline files in ' + baseDir);
  seeds.forEach(function (s) { if (!armed[s]) throw new Error('missing armed file for seed ' + s); });

  const bRows = seeds.map(function (s) { return analyzeSeed(base[s]); });
  const aRows = seeds.map(function (s) { return analyzeSeed(armed[s]); });

  // --- substrate guard: per-seed exact reproduction, pre-first-bind
  // (the frozen analyzer's guard, copied verbatim in logic) ---
  const guard = [];
  seeds.forEach(function (s, i) {
    const b = base[s], a = armed[s];
    const bRow = bRows[i], aRow = aRows[i];
    const bEntry = bRow.entryDay, aEntry = aRow.entryDay;
    if (bEntry == null && aEntry == null) {
      const match = (a.days === b.days) && (a.endReason === b.endReason) &&
        (a.standing === b.standing) && (a.maxWave === b.maxWave) &&
        (w4kills(a) === w4kills(b)) &&
        (((a.finalSeat || {}).seat || null) === ((b.finalSeat || {}).seat || null)) &&
        (a.gameDays === b.gameDays);
      guard.push({ seed: s, clause: 'neither-entered whole-run', match: match,
        firstDiff: match ? null : ('days ' + a.days + '/' + b.days + ' end ' + a.endReason + '/' + b.endReason + ' standing ' + a.standing + '/' + b.standing + ' maxWave ' + a.maxWave + '/' + b.maxWave + ' w4kills ' + w4kills(a) + '/' + w4kills(b) + ' seat ' + ((a.finalSeat || {}).seat) + '/' + ((b.finalSeat || {}).seat)) });
    } else {
      const firstBind = Math.min(
        bEntry == null ? Infinity : bEntry,
        aEntry == null ? Infinity : aEntry);
      const pre = preEntryMatch(b, a, firstBind);
      guard.push({ seed: s, clause: 'entered pre-first-bind day<' + firstBind + ' (base entry ' + bEntry + ', armed entry ' + aEntry + ')', match: pre.match, daysCompared: pre.daysCompared, firstDiff: pre.firstDiff });
    }
  });
  const guardPass = guard.filter(function (g) { return g.match; }).length;

  // --- counts for the revised judge ---
  const fearedEnteredArmed = aRows.filter(function (r) { return r.fearedEntered > 0; }).length;
  const fearedWinsArmed = aRows.filter(function (r) { return r.fearedWin; }).length;
  const fearedEnteredBase = bRows.filter(function (r) { return r.fearedEntered > 0; }).length;
  const fearedWinsBase = bRows.filter(function (r) { return r.fearedWin; }).length;
  const winsArmed = aRows.filter(function (r) { return r.won; }).length;
  const winsBase = bRows.filter(function (r) { return r.won; }).length;
  const baseSeats = bRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length;
  const baseSat = bRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const armedSat = aRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const bStarv = bRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const aStarv = aRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const armOnlyStarv = aRows.reduce(function (t, r, i) { return t + (bRows[i].starvation === 0 ? r.starvation : 0); }, 0);
  const nonInf = seeds.map(function (s, i) {
    const effArmed = effectiveDays(aRows[i].days, aRows[i].won, HORIZON);
    const effBase = bRows[i].days;
    return { seed: s, armedDays: aRows[i].days, armedWon: !!aRows[i].won,
      armedEffective: effArmed, baselineDays: effBase, pass: effArmed >= effBase };
  });
  const nonInfPass = nonInf.filter(function (r) { return r.pass; }).length;
  const aPairs = aRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const bPairs = bRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const wB = wall(bRows), wA = wall(aRows);

  const verdict = judgeRevised({
    fearedWinsArmed: fearedWinsArmed, fearedWinsBaseline: fearedWinsBase,
    fearedEnteredArmed: fearedEnteredArmed, fearedEnteredBaseline: fearedEnteredBase,
    baseSeats: baseSeats, baseSat: baseSat, armedSat: armedSat,
    guardPass: guardPass, guardOf: seeds.length,
    nonInfPass: nonInfPass, nonInfOf: seeds.length,
    starvBase: bStarv, starvArmed: aStarv, starvArmOnly: armOnlyStarv,
    medianBase: wB.medianSurvival, medianArmed: wA.medianSurvival,
  });

  return {
    arm: 'feareddoor-rejudge-b', seeds: seeds,
    baseline: bRows, armed: aRows,
    guard: guard, wallBaseline: wB, wallArmed: wA,
    counts: {
      fearedWinsArmed: fearedWinsArmed, fearedWinsBaseline: fearedWinsBase,
      fearedEnteredArmed: fearedEnteredArmed, fearedEnteredBaseline: fearedEnteredBase,
      winsArmed: winsArmed, winsBaseline: winsBase,
      starvationBase: bStarv, starvationArmed: aStarv, starvationArmOnly: armOnlyStarv,
      nonInferiority: nonInf,
      pairDaysArmed: aPairs, pairDaysBase: bPairs,
      fearedOfferedArmed: aRows.filter(function (r) { return r.fearedOffered; }).length,
      fearedOfferedBaseline: bRows.filter(function (r) { return r.fearedOffered; }).length,
      fearedOfferedUnwalkedArmed: aRows.filter(function (r) { return r.fearedOfferedUnwalked; }).length,
      fearedOfferedUnwalkedBaseline: bRows.filter(function (r) { return r.fearedOfferedUnwalked; }).length,
    },
    verdict: verdict,
  };
}

if (require.main === module) {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-feareddoor-b-baseline');
  const armedDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-feareddoor-b-armed');
  const out = analyzeCorpus(baseDir, armedDir);
  fs.writeFileSync('/tmp/feareddoor-rejudge-b-analysis.json', JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { judgeRevised: judgeRevised, analyzeCorpus: analyzeCorpus, medianOf: medianOf };
