// vetprod-analyze-20261104.js — veterans-production diag analyzer
// (arm sim-vetprod-b). Classifies each per-seed corpus row per the
// prereg precedence order, reconstructs simultaneous living killers
// from the log + full fallen list, and reports the verdict inputs.
// Pure function over corpus JSON; no game reads, no re-scoring.
// Usage: node scripts/vetprod-analyze-20261104.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');

function killerFates(row) {
  // Returns per wave-4+ killer: {by, kills, firstDay, lastDay, via[],
  // deathDay (earliest fallen entry with day >= first kill day, else null),
  // aliveAtEnd, anomaly (any fallen entry with day < first kill day),
  // killToDeathDays}. Alive-at-end: scholar id, or getPerson-equivalent
  // is unavailable post-run, so alive = no death entry >= first kill day
  // AND not in the end-of-run dead set. The driver records no person
  // table, so the analyzer treats "no qualifying death entry" as alive
  // ONLY when the end-of-run readiness snapshot agrees where available;
  // the primary alive signal is the fallen list (a dead killer is
  // recorded there by the engine's death block). A killer with a
  // qualifying death entry is dead; otherwise alive.
  const log = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); });
  const fallen = row.fallen || [];
  const byKiller = {};
  log.forEach(function (e) {
    if (!e.by) return;
    const k = byKiller[e.by] || (byKiller[e.by] = { by: e.by, kills: 0, firstDay: e.d, lastDay: e.d, via: [], mids: [] });
    k.kills++;
    if (e.d < k.firstDay) k.firstDay = e.d;
    if (e.d > k.lastDay) k.lastDay = e.d;
    if (k.via.indexOf(e.via) < 0) k.via.push(e.via);
    if (k.mids.indexOf(e.mid) < 0) k.mids.push(e.mid);
  });
  return Object.keys(byKiller).map(function (by) {
    const k = byKiller[by];
    const entries = fallen.filter(function (f) { return f.villagerId === by; });
    const anomaly = entries.some(function (f) { return (f.day | 0) < (k.firstDay | 0); });
    const after = entries.filter(function (f) { return (f.day | 0) >= (k.firstDay | 0); });
    const deathDay = after.length ? Math.min.apply(null, after.map(function (f) { return f.day | 0; })) : null;
    const deathCause = deathDay != null ? (after.filter(function (f) { return (f.day | 0) === deathDay; })[0] || {}).cause || null : null;
    return {
      by: by, kills: k.kills, firstDay: k.firstDay, lastDay: k.lastDay, via: k.via, mids: k.mids,
      deathDay: deathDay, deathCause: deathCause, aliveAtEnd: deathDay == null,
      killToDeathDays: deathDay != null ? (deathDay - (k.firstDay | 0)) : null,
      anomaly: anomaly,
    };
  }).sort(function (a, b) { return a.firstDay - b.firstDay; });
}

function maxSimultaneous(fates) {
  // A killer counts living on days [firstDay, deathDay) — deathDay null
  // means living through the end. A same-day kill-and-die contributes
  // to NO day (fleeting). Max over kill days + end day.
  const days = {};
  fates.forEach(function (f) { days[f.firstDay] = true; });
  let max = 0, maxDay = null;
  Object.keys(days).forEach(function (ds) {
    const d = parseInt(ds, 10);
    const n = fates.filter(function (f) { return f.firstDay <= d && (f.deathDay == null || d < f.deathDay); }).length;
    if (n > max) { max = n; maxDay = d; }
  });
  return { max: max, maxDay: maxDay };
}

function classifySeed(row) {
  const log = row.waveKillLog || [];
  const w4kills = log.filter(function (e) { return ((e.w | 0) >= 4); });
  const fights = row.fights || [];
  const w4fights = fights.filter(function (f) { return ((f.wave | 0) >= 4); });
  const facedFeed = row.wavesFaced || {};
  const facedTypes = Object.keys(facedFeed).filter(function (mid) { return (facedFeed[mid] | 0) >= 4; });
  const faced = (w4fights.length > 0) || (facedTypes.length > 0) || (w4kills.length > 0);
  const fates = killerFates(row);
  const sim = maxSimultaneous(fates);
  const daily = row.daily || [];
  let peak = null;
  daily.forEach(function (s) {
    if (s.gated == null) return;
    if (!peak || s.gated > peak.gated) peak = s;
  });
  const peakVets = peak && peak.readiness5 ? peak.readiness5.veterans : null;
  const engineMaxVets = daily.reduce(function (m, s) {
    const v = s.readiness5 ? (s.readiness5.veterans | 0) : 0;
    return v > m ? v : m;
  }, 0);
  const livingAtEnd = fates.filter(function (f) { return f.aliveAtEnd; }).length;
  const anomalies = fates.filter(function (f) { return f.anomaly; }).map(function (f) { return f.by; });

  let cls, cause = null;
  if (!faced) { cls = 'NEVER-FACED-WAVE4'; }
  else if (w4kills.length === 0) { cls = 'FACED-NO-KILL'; }
  else if (livingAtEnd === 0) { cls = 'KILLED-DEAD-KILLER'; }
  else if (sim.max < 2) { cls = 'KILLED-LIVING-SHORT'; }
  else {
    cls = 'OTHER';
    cause = 'reconstructed max simultaneous living wave-4 killers ' + sim.max + ' (day ' + sim.maxDay + ') yet peak-gated-standing vet bar ' + peakVets + ' of 2 — bar met at some point, not at peak (timing/peak mismatch)';
  }
  // A class that depends on an anomalous killer's timing is not credible.
  const classDependsOnAnomaly = anomalies.length > 0 && (cls === 'KILLED-DEAD-KILLER' || cls === 'KILLED-LIVING-SHORT') &&
    fates.some(function (f) { return f.anomaly && ((cls === 'KILLED-DEAD-KILLER' && !f.aliveAtEnd) || (cls === 'KILLED-LIVING-SHORT' && f.aliveAtEnd)); });
  return {
    seed: row.seed, class: cls, otherCause: cause,
    days: row.days, endReason: row.endReason, won: !!row.won,
    w4fights: w4fights.length,
    w4fightsPlayerTb: w4fights.filter(function (f) { return f.channel === 'player-tb'; }).length,
    w4fightsField: w4fights.filter(function (f) { return f.channel === 'field'; }).length,
    w4facedTypes: facedTypes.length, facedTypeIds: facedTypes,
    w4kills: w4kills.length, w4killersEver: fates.length,
    w4killsByVia: (function () { const c = {}; w4kills.forEach(function (e) { c[e.via || '?'] = (c[e.via || '?'] | 0) + 1; }); return c; })(),
    killers: fates, livingAtEnd: livingAtEnd,
    maxSimultaneous: sim.max, maxSimultaneousDay: sim.maxDay,
    engineDailyMaxVets: engineMaxVets,
    peakGated: peak ? peak.gated : null, peakDay: peak ? peak.day : null,
    peakRaw: peak ? peak.raw : null, peakVets: peakVets,
    endGated: daily.length ? daily[daily.length - 1].gated : null,
    anomalies: anomalies, classDependsOnAnomaly: classDependsOnAnomaly,
    instrumentErrors: (row.instrumentErrors || []).length,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('vetprod-s') === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return classifySeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const counts = {};
  seeds.forEach(function (s) { counts[s.class] = (counts[s.class] | 0) + 1; });
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const s1 = (counts['KILLED-DEAD-KILLER'] | 0) + (counts['KILLED-LIVING-SHORT'] | 0);
  const s2 = (counts['NEVER-FACED-WAVE4'] | 0) + (counts['FACED-NO-KILL'] | 0);
  const dominant = Object.keys(counts).reduce(function (best, k) { return counts[k] > (counts[best] | 0) ? k : best; }, Object.keys(counts)[0]);
  const verdict = (seeds.length === 8 && errSeeds <= 2 && totalErr === 0 &&
    (counts[dominant] >= 5 || s1 >= 5 || s2 >= 5)) ? 'DIAG-GO' :
    (errSeeds > 2 ? 'INSUFFICIENT-DATA' : 'DIAG-NO-CANDIDATE');
  const wall = {
    wins: seeds.filter(function (s) { return s.won; }).length,
    national: 0, table: 0,
    wave4unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 4 || (s.maxWave | 0) >= 4; }).length,
    wave4faced: seeds.filter(function (s) { return s.w4fights > 0 || s.w4facedTypes > 0; }).length,
    wave5unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    wave5faced: 0,
  };
  // National/table from raw rows (classifySeed drops them); recompute here.
  files.forEach(function (f) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (row.scaleRank === 'national' || row.scaleRank === 'global') wall.national++;
    if (row.tableDone || row.tableEntered) wall.table++;
    const w5fights = (row.fights || []).filter(function (ev) { return (ev.wave | 0) >= 5; }).length;
    const w5faced = Object.keys(row.wavesFaced || {}).filter(function (mid) { return (row.wavesFaced[mid] | 0) >= 5; }).length;
    if (w5fights > 0 || w5faced > 0) wall.wave5faced++;
  });
  const dayList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  wall.medianDays = dayList.length ? ((dayList[Math.floor((dayList.length - 1) / 2)] + dayList[Math.ceil((dayList.length - 1) / 2)]) / 2) : null;
  return { verdict: verdict, n: seeds.length, counts: counts, splitS1: s1, splitS2: s2, dominant: dominant, totalInstrumentErrors: totalErr, errSeeds: errSeeds, wall: wall, seeds: seeds };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: vetprod-analyze-20261104.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { classifySeed: classifySeed, killerFates: killerFates, maxSimultaneous: maxSimultaneous, analyzeDir: analyzeDir };
