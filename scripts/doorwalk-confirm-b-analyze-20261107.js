// doorwalk-confirm-b-analyze-20261107.js — the door-walk CONFIRM analyzer
// (arm sim-doorwalk-confirm-b, run fleshout-loop-b-20261107T1530Z). Reads the
// two per-seed corpora
// (evidence/2026-11-07/perseed-doorwalk-confirm-b-baseline/ and
// perseed-doorwalk-confirm-b-armed/, band 53201–53212) and judges the REVISED
// prereg (sim-doorwalk-confirm-b-prereg.md):
//   PRIMARY: wins >= 4/12 armed AND >= 3 more wins than baseline on
//     identical seeds.
//   SUBSTRATE SANITY: baseline earns lesser seats on >= 4/12 seeds AND sits
//     on >= 4/12 seeds (unjudgeable-if-failed).
//   SUBSTRATE GUARD: 12/12 per-seed exact (never-entered whole-run; entered
//     pre-entry daily rows) — the pilot guard, bar raised to 12/12.
//   COST BAR (revised — the pilot median bar is RETIRED): per-seed survival
//     non-inferiority — no seed dies earlier in the armed leg than its own
//     baseline day, a won seed counting at the horizon (150d); starvation
//     <= baseline + 1 total. Pair days recorded, not gated.
// Per-seed analysis reuses the pilot analyzer's analyzeSeed / preEntryMatch /
// medianOf / starvation verbatim via require. Prints a JSON summary to
// stdout and writes it to /tmp/doorwalk-confirm-b-analysis.json (working
// copy; the evidence file is the record). Usage:
//   node scripts/doorwalk-confirm-b-analyze-20261107.js [baselineDir] [armedDir]
'use strict';
const fs = require('fs');
const path = require('path');
const PILOT = require(path.join(__dirname, 'doorwalk-b-analyze-20261107'));
const HORIZON = 150;

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const bySeed = {};
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[o.seed] = o;
  });
  return bySeed;
}
function w4kills(o) {
  return (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
}

if (require.main === module) {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-doorwalk-confirm-b-baseline');
  const armedDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-doorwalk-confirm-b-armed');
  const base = loadDir(baseDir);
  const armed = loadDir(armedDir);
  const seeds = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) throw new Error('no baseline files in ' + baseDir);
  seeds.forEach(function (s) { if (!armed[s]) throw new Error('missing armed file for seed ' + s); });

  const bRows = seeds.map(function (s) { return PILOT.analyzeSeed(base[s]); });
  const aRows = seeds.map(function (s) { return PILOT.analyzeSeed(armed[s]); });

  // --- substrate guard: per-seed exact reproduction (pilot rule, 12/12) ---
  const guard = [];
  seeds.forEach(function (s, i) {
    const b = base[s], a = armed[s];
    const aRow = aRows[i];
    if (!aRow.doorsEntered) {
      const match = (a.days === b.days) && (a.endReason === b.endReason) &&
        (a.standing === b.standing) && (a.maxWave === b.maxWave) &&
        (w4kills(a) === w4kills(b)) &&
        (((a.finalSeat || {}).seat || null) === ((b.finalSeat || {}).seat || null)) &&
        (a.gameDays === b.gameDays);
      guard.push({ seed: s, clause: 'never-entered whole-run', match: match,
        firstDiff: match ? null : ('days ' + a.days + '/' + b.days + ' end ' + a.endReason + '/' + b.endReason + ' standing ' + a.standing + '/' + b.standing + ' maxWave ' + a.maxWave + '/' + b.maxWave + ' w4kills ' + w4kills(a) + '/' + w4kills(b) + ' seat ' + ((a.finalSeat || {}).seat) + '/' + ((b.finalSeat || {}).seat)) });
    } else {
      const pre = PILOT.preEntryMatch(b, a, aRow.entryDay);
      guard.push({ seed: s, clause: 'entered pre-entry day<' + aRow.entryDay, match: pre.match, daysCompared: pre.daysCompared, firstDiff: pre.firstDiff });
    }
  });
  const guardPass = guard.filter(function (g) { return g.match; }).length;

  // --- primary: wins at horizon ---
  const winsArmed = aRows.filter(function (r) { return r.won; }).length;
  const winsBase = bRows.filter(function (r) { return r.won; }).length;
  const winMargin = winsArmed - winsBase;
  const enteredArmed = aRows.filter(function (r) { return r.doorsEntered > 0; }).length;
  const enteredBase = bRows.filter(function (r) { return r.doorsEntered > 0; }).length;

  // --- substrate sanity ---
  const baseSeats = bRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length;
  const baseSat = bRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const armedSat = aRows.filter(function (r) { return r.tsTaken > 0; }).length;

  // --- cost bar (revised): per-seed survival non-inferiority + starvation ---
  const nonInf = [];
  seeds.forEach(function (s, i) {
    const b = bRows[i], a = aRows[i];
    // A won seed counts at the horizon — a win is a success, not a truncated life.
    const aDays = a.won ? HORIZON : a.days;
    const pass = aDays >= b.days;
    nonInf.push({ seed: s, baseDays: b.days, armedDays: a.days, armedWon: !!a.won,
      armedCounted: aDays, pass: pass });
  });
  const nonInfFail = nonInf.filter(function (x) { return !x.pass; });
  const bStarv = bRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const aStarv = aRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const armOnlyStarv = aRows.reduce(function (t, r, i) { return t + (bRows[i].starvation === 0 ? r.starvation : 0); }, 0);
  const aPairs = aRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  const bPairs = bRows.reduce(function (t, r) { return t + r.pairDays; }, 0);
  // Median survival reported for the record only — NEITHER median is a gate now.
  const bMed = PILOT.medianOf(bRows.map(function (r) { return r.days; }));
  const aMed = PILOT.medianOf(aRows.map(function (r) { return r.days; }));
  const aMedNonWon = PILOT.medianOf(aRows.filter(function (r) { return !r.won; }).map(function (r) { return r.days; }));

  const wall = function (rows) {
    return {
      national: rows.filter(function (r) { return r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
      tableSat: rows.filter(function (r) { return r.tsTaken > 0; }).length,
      doorsEntered: rows.filter(function (r) { return r.doorsEntered > 0; }).length,
      wins: rows.filter(function (r) { return r.won; }).length,
      wave4unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 4; }).length,
      wave5unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 5; }).length,
      wave5faced: rows.filter(function (r) { return (r.w5kills | 0) > 0; }).length,
      regional: rows.filter(function (r) { return r.scaleRank === 'regional' || r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
      lesserSeats: rows.filter(function (r) { return r.finalSeat === 'lesser'; }).length,
      fullSeats: rows.filter(function (r) { return r.finalSeat === 'full'; }).length,
      medianSurvival: PILOT.medianOf(rows.map(function (r) { return r.days; })),
      medianSurvivalNonWon: PILOT.medianOf(rows.filter(function (r) { return !r.won; }).map(function (r) { return r.days; })),
      survivals: rows.map(function (r) { return r.days; }),
    };
  };

  const verdict = {
    primary: { winsArmed: winsArmed, winsBaseline: winsBase, winMargin: winMargin,
      bar: 'wins >=4/12 armed AND >=3 more wins than baseline on identical seeds',
      pass: winsArmed >= 4 && winMargin >= 3 },
    substrateSanity: { baseSeatsEarned: baseSeats, baseSat: baseSat, armedSat: armedSat,
      bar: 'baseline lesser >=4/12 AND sat >=4/12', pass: baseSeats >= 4 && baseSat >= 4 },
    substrateGuard: { exactSeeds: guardPass, of: seeds.length, bar: '12/12 per-seed exact',
      pass: guardPass === seeds.length, detail: guard },
    costBar: {
      nonInferiority: { fail: nonInfFail, pass: nonInfFail.length === 0 },
      starvationBase: bStarv, starvationArmed: aStarv, starvationCap: bStarv + 1,
      starvationArmOnly: armOnlyStarv,
      starvationPass: aStarv <= bStarv + 1,
      medianBaseAll: bMed, medianArmedAll: aMed, medianArmedNonWon: aMedNonWon,
      pairDaysArmed: aPairs, pairDaysBase: bPairs,
      pass: nonInfFail.length === 0 && aStarv <= bStarv + 1,
    },
    secondaries: { doorsEnteredArmed: enteredArmed, doorsEnteredBaseline: enteredBase },
  };
  verdict.overall = verdict.primary.pass && verdict.substrateSanity.pass &&
    verdict.substrateGuard.pass && verdict.costBar.pass ? 'GO' : 'NO-GO';
  if (!verdict.substrateSanity.pass) verdict.overall = 'NO-GO (substrate — door drive unjudged)';

  const out = {
    arm: 'doorwalk-confirm-b', seeds: seeds,
    baseline: bRows, armed: aRows,
    guard: guard, nonInferiority: nonInf,
    wallBaseline: wall(bRows), wallArmed: wall(aRows),
    verdict: verdict,
  };
  fs.writeFileSync('/tmp/doorwalk-confirm-b-analysis.json', JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { loadDir: loadDir };
