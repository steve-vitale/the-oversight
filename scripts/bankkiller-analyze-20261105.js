// bankkiller-analyze-20261105.js — rally-the-line analyzer
// (arm sim-bankkiller-b). Pure function over corpus JSON; no game reads,
// no re-scoring. Reuses killerdeath-analyze-20261105 by require
// (classifySeed / killerFates / maxSimultaneous / median) and adds the
// rally splits + the prereg's GO/NO-GO/THIN verdict.
//
// VERDICT (prereg-binding, judged here, never re-scored):
//   THIN  — armed-leg rally fires < 8 (mechanism unmeasured; NOT a NO-GO).
//   GO    — production seeds (w4killersEver >= 2) armed >= 2 AND baseline
//           0 — or, if baseline nonzero, armed beats baseline by >= 2 —
//           AND both guardrails hold.
//   NO-GO — anything else, or a failed guardrail even if the primary holds.
// Guardrails: G3 kill rate (armed w4 kills / w4 fights >= 1/2 baseline;
//   vacuous-pass when baseline kills = 0); G4 survival (armed median
//   survival >= 0.8x baseline median).
//
// JOINS (all disclosed approximations, never hidden):
//   - TB survival: TB fights = fights rows channel 'player-tb', wave >= 4.
//     TB deaths = distinct scholarDeaths rows with inCombat=true on a day
//     that has >= 1 such TB fight. A day with 2 TB fights and 1 death
//     counts ONE lost fight. The rate is (tbFights - tbDeaths)/tbFights.
//   - Post-first-blood: day granularity. firstBloodDay = earliest wave-4
//     kill day; post-blood fights/kills are those with day > firstBloodDay
//     (same-day earlier fights are NOT excluded — secondkiller's stated
//     limitation).
//   - Rallied-fight outcomes: a rally call (result true) is 'kill' when a
//     same-day wave-4 TB kill (killsLive via player/companion) exists,
//     'scholar-death' when a same-day in-combat scholar death exists,
//     else 'other'. Same-day joining only; unmatched rallies are 'other',
//     never forced into a bucket.
// Usage: node scripts/bankkiller-analyze-20261105.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');
const KD = require('./killerdeath-analyze-20261105');

function rallySummary(row) {
  const stats = row.bankkillerStats || null;
  const calls = row.rallyCalls || [];
  const okCalls = calls.filter(function (c) { return c.result; }).length;
  return {
    statsFires: stats ? stats.rallyFires : null,
    statsOk: stats ? stats.rallyOk : null,
    statsW4plusFights: stats ? stats.w4plusFights : null,
    statsAlliesPresent: stats ? stats.alliesPresentFights : null,
    instrumentCalls: calls.length,
    instrumentOk: okCalls,
    mismatch: stats ? (stats.rallyFires !== calls.length || stats.rallyOk !== okCalls) : null,
  };
}

function perSeedExtra(row) {
  const c = KD.classifySeed(row);
  const fights = row.fights || [];
  const w4fights = fights.filter(function (f) { return (f.wave | 0) >= 4; });
  const tbFights = w4fights.filter(function (f) { return f.channel === 'player-tb'; });
  const tbDays = {};
  tbFights.forEach(function (f) { tbDays[f.day] = true; });
  const tbDeaths = (row.scholarDeaths || []).filter(function (s) { return s.inCombat && tbDays[s.day]; }).length;
  const kills = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); });
  const firstBloodDay = kills.length ? Math.min.apply(null, kills.map(function (e) { return e.d | 0; })) : null;
  const postBloodFights = firstBloodDay == null ? 0 : w4fights.filter(function (f) { return (f.day | 0) > firstBloodDay; }).length;
  const postBloodKills = firstBloodDay == null ? 0 : kills.filter(function (e) { return (e.d | 0) > firstBloodDay; }).length;
  const tbKills = (row.killsLive || []).filter(function (k) { return ((k.wave | 0) >= 4) && (k.via === 'player' || k.via === 'companion'); }).length;
  // Rallied-fight outcomes (same-day join, descriptive only).
  const rallyOutcomes = { kill: 0, scholarDeath: 0, other: 0 };
  (row.rallyCalls || []).filter(function (rc) { return rc.result; }).forEach(function (rc) {
    const dayKills = (row.killsLive || []).filter(function (k) { return (k.day | 0) === (rc.day | 0) && ((k.wave | 0) >= 4) && (k.via === 'player' || k.via === 'companion'); });
    const dayDeaths = (row.scholarDeaths || []).filter(function (s) { return (s.day | 0) === (rc.day | 0) && s.inCombat; });
    if (dayKills.length) rallyOutcomes.kill++;
    else if (dayDeaths.length) rallyOutcomes.scholarDeath++;
    else rallyOutcomes.other++;
  });
  const rally = rallySummary(row);
  return Object.assign({}, c, {
    rallyFires: rally.statsFires, rallyOk: rally.statsOk,
    rallyW4plusFights: rally.statsW4plusFights, rallyAlliesPresent: rally.statsAlliesPresent,
    rallyInstrumentCalls: rally.instrumentCalls, rallyInstrumentOk: rally.instrumentOk,
    rallyMismatch: rally.mismatch,
    tbFights: tbFights.length, tbDeaths: tbDeaths,
    tbSurvival: tbFights.length ? (tbFights.length - tbDeaths) / tbFights.length : null,
    tbKills: tbKills,
    firstBloodDay: firstBloodDay,
    postBloodFights: postBloodFights, postBloodKills: postBloodKills,
    postBloodKillRate: postBloodFights ? postBloodKills / postBloodFights : null,
    killRate: w4fights.length ? kills.length / w4fights.length : null,
    rallyOutcomes: rallyOutcomes,
  });
}

function legSummary(rows) {
  const seeds = rows.map(perSeedExtra);
  const production = seeds.filter(function (s) { return s.w4killersEver >= 2; }).length;
  const pairSnapshot = seeds.filter(function (s) { return s.hasLivingPairSnapshot; }).length;
  const reconPair = seeds.filter(function (s) { return s.maxSimultaneous >= 2; }).length;
  const w4fights = seeds.reduce(function (m, s) { return m + s.w4fights; }, 0);
  const w4kills = seeds.reduce(function (m, s) { return m + s.w4kills; }, 0);
  const tbFights = seeds.reduce(function (m, s) { return m + s.tbFights; }, 0);
  const tbDeaths = seeds.reduce(function (m, s) { return m + s.tbDeaths; }, 0);
  const rallyFires = seeds.reduce(function (m, s) { return m + (s.rallyFires || 0); }, 0);
  const rallyOk = seeds.reduce(function (m, s) { return m + (s.rallyOk || 0); }, 0);
  const firstKillerSurvival = [];
  seeds.forEach(function (s) {
    s.killers.forEach(function (k) { if (k.killToDeathDays != null) firstKillerSurvival.push(k.killToDeathDays); });
  });
  // First-killer survival: earliest killer per seed, observed exits only.
  const firstKillerExits = [];
  seeds.forEach(function (s) {
    if (s.killers.length) {
      const first = s.killers.slice().sort(function (a, b) { return a.firstDay - b.firstDay; })[0];
      if (first.killToDeathDays != null) firstKillerExits.push(first.killToDeathDays);
    }
  });
  const wall = { wins: 0, national: 0, table: 0, wave4unlocks: 0, wave4faced: 0,
    wave5unlocks: 0, wave5faced: 0, wave5kills: 0, ready5Days: 0, medianDays: null };
  rows.forEach(function (row) {
    if (row.won) wall.wins++;
    if (row.scaleRank === 'national' || row.scaleRank === 'global') wall.national++;
    if (row.tableDone || row.tableEntered) wall.table++;
    if ((row.unlockedWave | 0) >= 4 || (row.maxWave | 0) >= 4) wall.wave4unlocks++;
    if ((row.fights || []).some(function (ev) { return (ev.wave | 0) >= 4; }) || Object.keys(row.wavesFaced || {}).some(function (mid) { return (row.wavesFaced[mid] | 0) >= 4; })) wall.wave4faced++;
    if ((row.unlockedWave | 0) >= 5) wall.wave5unlocks++;
    if ((row.fights || []).some(function (ev) { return (ev.wave | 0) >= 5; }) || Object.keys(row.wavesFaced || {}).some(function (mid) { return (row.wavesFaced[mid] | 0) >= 5; })) wall.wave5faced++;
    if ((row.waveKillLog || []).some(function (e) { return ((e.w | 0) >= 5); })) wall.wave5kills++;
  });
  wall.ready5Days = seeds.reduce(function (m, s) { return m + s.ready5Days; }, 0);
  wall.medianDays = KD.median(seeds.map(function (s) { return s.days; }));
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  return { n: seeds.length, productionSeeds: production, pairSnapshotSeeds: pairSnapshot,
    reconPairSeeds: reconPair, w4fights: w4fights, w4kills: w4kills,
    killRate: w4fights ? w4kills / w4fights : null,
    tbFights: tbFights, tbDeaths: tbDeaths,
    tbSurvival: tbFights ? (tbFights - tbDeaths) / tbFights : null,
    rallyFires: rallyFires, rallyOk: rallyOk,
    firstKillerSurvivalMedian: KD.median(firstKillerExits),
    firstKillerExits: firstKillerExits,
    allKillerSurvivalMedian: KD.median(firstKillerSurvival),
    totalInstrumentErrors: totalErr,
    errSeeds: seeds.filter(function (s) { return s.instrumentErrors > 0; }).length,
    wall: wall, seeds: seeds };
}

function verdictFor(baselineRows, armedRows) {
  const b = legSummary(baselineRows);
  const a = legSummary(armedRows);
  const fires = a.rallyFires;
  if (fires < 8) {
    return { verdict: 'THIN', reason: 'rally fires ' + fires + ' < 8 across the armed leg — mechanism unmeasured, not a NO-GO', baseline: b, armed: a };
  }
  const primaryHolds = a.productionSeeds >= 2 &&
    (b.productionSeeds === 0 ? true : (a.productionSeeds - b.productionSeeds) >= 2);
  const guardKill = (b.w4kills === 0) ? { holds: true, vacuous: true, ratio: null }
    : { holds: a.killRate >= (b.killRate / 2), vacuous: false, ratio: (b.killRate ? a.killRate / b.killRate : null) };
  const guardSurvival = { holds: (b.wall.medianDays == null || a.wall.medianDays == null) ? true : (a.wall.medianDays >= 0.8 * b.wall.medianDays),
    ratio: (b.wall.medianDays && a.wall.medianDays) ? a.wall.medianDays / b.wall.medianDays : null };
  if (!primaryHolds) {
    return { verdict: 'NO-GO', reason: 'primary missed: production seeds armed ' + a.productionSeeds + '/8 vs baseline ' + b.productionSeeds + '/8 (bar: armed >= 2 and +2 over baseline when baseline nonzero)', baseline: b, armed: a, guards: { kill: guardKill, survival: guardSurvival } };
  }
  if (!guardKill.holds || !guardSurvival.holds) {
    return { verdict: 'NO-GO', reason: 'primary held but a guardrail failed (kill ' + JSON.stringify(guardKill) + ', survival ' + JSON.stringify(guardSurvival) + ')', baseline: b, armed: a, guards: { kill: guardKill, survival: guardSurvival } };
  }
  return { verdict: 'GO', reason: 'production seeds armed ' + a.productionSeeds + '/8 vs baseline ' + b.productionSeeds + '/8; guards hold', baseline: b, armed: a, guards: { kill: guardKill, survival: guardSurvival } };
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'bankkiller-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const baseline = rows.filter(function (r) { return r.policy === 'baseline'; });
  const armed = rows.filter(function (r) { return r.policy === 'rally'; });
  return verdictFor(baseline, armed);
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: bankkiller-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { rallySummary: rallySummary, perSeedExtra: perSeedExtra,
  legSummary: legSummary, verdictFor: verdictFor, analyzeDir: analyzeDir };
