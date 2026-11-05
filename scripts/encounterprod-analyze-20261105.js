// encounterprod-analyze-20261105.js — wave-4 encounter-production census
// analyzer (arm sim-encounterprod2-b). Pure function over per-seed corpus
// rows; no game reads, no re-scoring.
//
// Per seed (definitions fixed in sim-encounterprod-b-prereg.md):
//   unlockDay = first snapshot day with day >= dayFloor AND w2pts >= bar2
//     AND gated >= t4 (derived; never calls unlockedWave mid-run).
//   unlocked   = unlockDay != null OR finalize unlockedWave >= 4 OR
//     maxWave >= 4 (a seed meeting the derived rungs counts as unlocked
//     even if the finalize call disagrees — the disagreement is flagged
//     as unlockMismatch for investigation, never silently resolved).
//   faced      = >= 1 wave-4 fight (any channel, any class) in t.fights.
//   class      = UNLOCKED-FACED / UNLOCKED-UNMET / NEVER-UNLOCKED.
//   sub-cause (primary, one per unmet/never-unlocked seed):
//     NEVER-UNLOCKED: DIED-EARLY (village lost before dayFloor) |
//       LEDGER (survived to dayFloor, final w2pts < bar2) |
//       STANDING (dayFloor met, w2pts >= bar2, gated peak < t4) |
//       NON-COINCIDENT (each rung met at some point, never together) |
//       ANOMALY (derived rungs met on some snapshot day yet no unlock —
//         flagged via unlockMismatch on the UNLOCKED side, since a seed
//         meeting the derived rungs counts as unlocked).
//     UNLOCKED-UNMET: NO-SPAWN (zero post-unlock w4 spawns) |
//       SPAWN-NO-TILE (spawns > 0, zero on-player-tile w4 spawns) |
//       TILE-NO-FIGHT (on-player-tile w4 spawns > 0, zero w4 fights).
//     Post-unlock windows use spawn day >= unlockDay (unlockDay is a
//     snapshot day, so spawns on that day count as post-unlock).
//   Wall numbers: wins, national+, table (0 — uninstrumented, never
//     guessed), wave-4/5 unlocks, wave-4 faced, wave-5 faced (w5 fights),
//     median run-days.
// Usage: node scripts/encounterprod-analyze-20261105.js <per-seed-dir> [run-filter-substring]
//   Prints a JSON summary. With a run filter, only files whose name
//   contains the substring are analyzed (baseline vs seek split).
'use strict';
const fs = require('fs');
const path = require('path');

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

function analyzeSeed(row) {
  const daily = row.daily || [];
  const dayFloor = (daily[0] && daily[0].dayFloor != null) ? daily[0].dayFloor : 25;
  const bar2 = (daily[0] && daily[0].bar2 != null) ? daily[0].bar2 : 5;
  const t4 = (daily[0] && daily[0].t4 != null) ? daily[0].t4 : 100;
  let unlockDay = null;
  let rungsMetDay = null;
  daily.forEach(function (s) {
    if (rungsMetDay == null && s.day != null && s.day >= dayFloor && (s.w2pts | 0) >= bar2 && s.gated != null && s.gated >= t4) rungsMetDay = s.day;
  });
  unlockDay = rungsMetDay;
  const finUnlocked = ((row.unlockedWave | 0) >= 4) || ((row.maxWave | 0) >= 4);
  const unlocked = (unlockDay != null) || finUnlocked;
  const unlockMismatch = (unlockDay != null) !== finUnlocked;
  const gatedPeak = daily.reduce(function (m, s) { return (s.gated != null && s.gated > m) ? s.gated : m; }, null);
  const gatedPeakDay = daily.filter(function (s) { return s.gated === gatedPeak; }).map(function (s) { return s.day; })[0];
  const rawPeak = daily.reduce(function (m, s) { return (s.raw != null && s.raw > m) ? s.raw : m; }, null);
  const lastSnap = daily[daily.length - 1] || {};
  const finalW2pts = (lastSnap.w2pts != null) ? lastSnap.w2pts : null;
  const w4fightsAll = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; });
  const w4fightsWild = w4fightsAll.filter(function (f) { return f.cls === 'world'; });
  const w4fightsPost = (unlockDay == null) ? [] : w4fightsAll.filter(function (f) { return (f.day | 0) >= unlockDay; });
  const faced = w4fightsAll.length > 0;
  const facedWild = w4fightsWild.length > 0;
  const w4kills = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const w5fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 5; }).length;
  const spawnsW4 = (row.spawns || []).filter(function (s) { return (s.wave | 0) === 4; });
  const spawnsPost = (unlockDay == null) ? [] : spawnsW4.filter(function (s) { return (s.day | 0) >= unlockDay; });
  const spawnsTilePost = spawnsPost.filter(function (s) { return s.onPlayerTile === true; });
  const spawnsTileAll = spawnsW4.filter(function (s) { return s.onPlayerTile === true; });
  const castsW4 = (row.casts || []).filter(function (c) { return (c.wave | 0) === 4; });
  const castsPost = (unlockDay == null) ? [] : castsW4.filter(function (c) { return (c.day | 0) >= unlockDay; });
  const unlockedDays = (unlockDay == null) ? 0 : Math.max(0, (row.days | 0) - unlockDay + 1);
  const fightsPerUnlockedDay = unlockedDays > 0 ? (w4fightsPost.length / unlockedDays) : null;

  let cls = null;
  let sub = null;
  if (!unlocked) {
    cls = 'NEVER-UNLOCKED';
    if ((row.days | 0) < dayFloor && row.villageLost) sub = 'DIED-EARLY';
    else if (rungsMetDay != null) sub = 'ANOMALY';
    else if (finalW2pts != null && finalW2pts < bar2) sub = 'LEDGER';
    else if (gatedPeak != null && gatedPeak < t4) sub = 'STANDING';
    else if (finalW2pts != null && finalW2pts >= bar2 && gatedPeak != null && gatedPeak >= t4) sub = 'NON-COINCIDENT';
    else sub = 'ANOMALY';
  } else if (!faced) {
    cls = 'UNLOCKED-UNMET';
    if (spawnsPost.length === 0) sub = 'NO-SPAWN';
    else if (spawnsTilePost.length === 0) sub = 'SPAWN-NO-TILE';
    else sub = 'TILE-NO-FIGHT';
  } else {
    cls = 'UNLOCKED-FACED';
    sub = null;
  }

  return {
    seed: row.seed, policy: row.policy || null, run: row.run || null,
    days: row.days, endReason: row.endReason, villageLost: !!row.villageLost,
    won: !!row.won, scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    unlockDay: unlockDay, rungsMetDay: rungsMetDay, unlockMismatch: unlockMismatch,
    dayFloor: dayFloor, bar2: bar2, t4: t4,
    gatedPeak: gatedPeak, gatedPeakDay: gatedPeakDay, rawPeak: rawPeak, finalW2pts: finalW2pts,
    class: cls, subCause: sub,
    w4fights: w4fightsAll.length, w4fightsWild: w4fightsWild.length, w4fightsPost: w4fightsPost.length,
    w4kills: w4kills, w5fights: w5fights,
    spawnsW4: spawnsW4.length, spawnsPost: spawnsPost.length,
    spawnsTilePost: spawnsTilePost.length, spawnsTileAll: spawnsTileAll.length,
    castsW4: castsW4.length, castsPost: castsPost.length,
    unlockedDays: unlockedDays, fightsPerUnlockedDay: fightsPerUnlockedDay,
    seekCalls: row.encseek ? row.encseek.calls.length : 0,
    seekArrived: row.encseek ? row.encseek.calls.filter(function (c) { return c.arrived; }).length : 0,
    seekFightStarted: row.encseek ? row.encseek.calls.filter(function (c) { return c.fightStarted; }).length : 0,
    instrumentErrors: (row.instrumentErrors || []).length,
    snapshotDays: daily.length,
  };
}

function analyzeDir(dir, runFilter) {
  const files = fs.readdirSync(dir).filter(function (f) {
    return f.indexOf('encounterprod-s') === 0 && f.endsWith('.json') && (!runFilter || f.indexOf(runFilter) >= 0);
  }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const faced = seeds.filter(function (s) { return s.class === 'UNLOCKED-FACED'; });
  const unmet = seeds.filter(function (s) { return s.class === 'UNLOCKED-UNMET'; });
  const never = seeds.filter(function (s) { return s.class === 'NEVER-UNLOCKED'; });
  const problem = unmet.concat(never);
  const subCounts = {};
  problem.forEach(function (s) { subCounts[s.subCause] = (subCounts[s.subCause] | 0) + 1; });
  let topMechanism = null;
  let topCount = 0;
  Object.keys(subCounts).forEach(function (k) { if (subCounts[k] > topCount) { topCount = subCounts[k]; topMechanism = k; } });
  const wall = {
    wins: seeds.filter(function (s) { return s.won; }).length,
    national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: 0,
    wave4unlocks: seeds.filter(function (s) { return s.unlockDay != null || (s.unlockedWave | 0) >= 4; }).length,
    wave4faced: faced.length,
    wave4kills: seeds.reduce(function (m, s) { return m + s.w4kills; }, 0),
    wave5unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    wave5faced: seeds.filter(function (s) { return s.w5fights > 0; }).length,
    medianDays: medianOf(seeds.map(function (s) { return s.days; })),
  };
  return {
    n: seeds.length, runFilter: runFilter || null,
    facedSeeds: faced.map(function (s) { return s.seed; }),
    unmetSeeds: unmet.map(function (s) { return s.seed; }),
    neverSeeds: never.map(function (s) { return s.seed; }),
    subCounts: subCounts, topMechanism: topMechanism, topCount: topCount,
    problemSeeds: problem.length,
    topShareOfProblem: problem.length ? (topCount / problem.length) : null,
    unlockMismatchSeeds: seeds.filter(function (s) { return s.unlockMismatch; }).map(function (s) { return s.seed; }),
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    wall: wall, seeds: seeds,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const runFilter = process.argv[3] || null;
  if (!dir) { console.error('usage: encounterprod-analyze-20261105.js <per-seed-dir> [run-filter]'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir, runFilter), null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, medianOf: medianOf };
