// killerdeath-analyze-20261105.js — wave-4 killer retention analyzer
// (arm sim-killerdeath-b). Pure function over corpus JSON; no game reads,
// no re-scoring. Adapted from vetprod-analyze-20261104 (classification +
// simultaneous-living reconstruction) with:
//  - kill-time channel from killsLive (scholarAtKill), falling back to the
//    waveKillLog via string (killsLive is authoritative; a missing live row
//    is flagged, never silently filled);
//  - death-cause SPLIT: a fallen entry with monsterId/monsterName, or a
//    scholarDeath record (playerDeath wrap), splits the fallen 'the wild'
//    residual. 'the wild' with no split evidence stays labelled
//    'the wild (unsplit residual)' and is NEVER cited as a cause;
//  - alive-at-end from the deadMap (data dead flags) where known, else
//    fallen-based;
//  - PRIMARY metric: seeds with >= 1 DAILY ENGINE snapshot day with
//    readiness5.veterans >= 2 (the brief's literal 'snapshot day').
//    Reconstructed maxSimultaneous >= 2 is reported as a cross-check:
//    a reconstructed pair with no snapshot day is a fleeting pair, reported
//    not scored.
// Usage: node scripts/killerdeath-analyze-20261105.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');

function killerFates(row) {
  const log = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); });
  const fallen = row.fallen || [];
  const liveByKey = {};
  (row.killsLive || []).forEach(function (k) {
    if (((k.wave | 0) >= 4)) liveByKey[k.day + '|' + k.mid + '|' + k.by] = k;
  });
  const byKiller = {};
  log.forEach(function (e) {
    if (!e.by) return;
    const k = byKiller[e.by] || (byKiller[e.by] = { by: e.by, kills: 0, firstDay: e.d, lastDay: e.d, via: [], mids: [], channels: [], liveRows: 0 });
    k.kills++;
    if (e.d < k.firstDay) k.firstDay = e.d;
    if (e.d > k.lastDay) k.lastDay = e.d;
    if (k.via.indexOf(e.via) < 0) k.via.push(e.via);
    if (k.mids.indexOf(e.mid) < 0) k.mids.push(e.mid);
    const lk = liveByKey[e.d + '|' + e.mid + '|' + e.by];
    if (lk) {
      k.liveRows++;
      const ch = lk.scholarChannel ? 'player' : 'npc';
      if (k.channels.indexOf(ch) < 0) k.channels.push(ch);
    }
  });
  const deadMap = row.deadMap || null;
  return Object.keys(byKiller).map(function (by) {
    const k = byKiller[by];
    const entries = fallen.filter(function (f) { return f.villagerId === by; });
    const anomaly = entries.some(function (f) { return (f.day | 0) < (k.firstDay | 0); });
    const after = entries.filter(function (f) { return (f.day | 0) >= (k.firstDay | 0); });
    const deathDay = after.length ? Math.min.apply(null, after.map(function (f) { return f.day | 0; })) : null;
    const deathEntry = deathDay != null ? (after.filter(function (f) { return (f.day | 0) === deathDay; })[0] || {}) : {};
    // Scholar-death context for the same day (playerDeath wrap), if any.
    const scholarCtx = (row.scholarDeaths || []).filter(function (s) { return s.scholarId === by && (s.day | 0) === (deathDay | 0); })[0] || null;
    // Last tracker row strictly before the death day (killer's last-seen state).
    let lastSeen = null;
    if (deathDay != null) {
      (row.killerTrack || []).filter(function (tr) { return tr.by === by && (tr.day | 0) < (deathDay | 0); }).forEach(function (tr) { lastSeen = tr; });
    }
    // Death-cause split. monsterId/monsterName on the fallen entry wins;
    // then the scholarDeath context; then the literal fallen cause; the
    // bare 'the wild' with no split evidence is a residual, not a cause.
    let causeSplit = null, causeRaw = deathEntry.cause || null;
    if (deathDay == null) { causeSplit = 'alive'; }
    else if (deathEntry.monsterId || deathEntry.monsterName) { causeSplit = 'monster:' + (deathEntry.monsterName || deathEntry.monsterId); }
    else if (scholarCtx) {
      const loc = scholarCtx.atHaven ? 'at-haven' : 'away';
      const comb = scholarCtx.inCombat ? 'in-combat' : (scholarCtx.pendingEncounter ? 'pending-encounter' : 'not-in-combat');
      causeSplit = 'scholar-death:' + (scholarCtx.causeArg || causeRaw || '?') + ':' + loc + ':' + comb;
    }
    else if (causeRaw && causeRaw !== 'the wild') { causeSplit = causeRaw; }
    else if (causeRaw === 'the wild') { causeSplit = 'the wild (unsplit residual)'; }
    else { causeSplit = 'unknown (no fallen entry)'; }
    const alive = (deadMap && deadMap[by] !== undefined) ? !deadMap[by] : (deathDay == null);
    return {
      by: by, kills: k.kills, firstDay: k.firstDay, lastDay: k.lastDay, via: k.via, mids: k.mids,
      channels: k.channels, liveRows: k.liveRows, liveMissing: k.kills - k.liveRows,
      deathDay: deathDay, deathCauseRaw: causeRaw, deathCauseSplit: causeSplit,
      scholarDeathCtx: scholarCtx, lastSeenBeforeDeath: lastSeen,
      aliveAtEnd: alive, deathDayFromFallenOnly: deathDay != null,
      killToDeathDays: deathDay != null ? (deathDay - (k.firstDay | 0)) : null,
      anomaly: anomaly,
    };
  }).sort(function (a, b) { return a.firstDay - b.firstDay; });
}

function maxSimultaneous(fates) {
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
  const w4fights = fights.filter(function (f) { return (f.wave | 0) >= 4; });
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
  // PRIMARY metric: any daily engine snapshot with veterans >= 2, and the
  // first such day. (Reconstructed sim.max is the cross-check.)
  let pairSnapshotDay = null;
  daily.forEach(function (s) {
    if (pairSnapshotDay == null && s.readiness5 && (s.readiness5.veterans | 0) >= 2) pairSnapshotDay = s.day;
  });
  const ready5Days = daily.filter(function (s) { return s.readiness5 && s.readiness5.ready; }).length;
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
  const classDependsOnAnomaly = anomalies.length > 0 && (cls === 'KILLED-DEAD-KILLER' || cls === 'KILLED-LIVING-SHORT') &&
    fates.some(function (f) { return f.anomaly && ((cls === 'KILLED-DEAD-KILLER' && !f.aliveAtEnd) || (cls === 'KILLED-LIVING-SHORT' && f.aliveAtEnd)); });
  return {
    seed: row.seed, policy: row.policy || null, run: row.run || null, class: cls, otherCause: cause,
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
    pairSnapshotDay: pairSnapshotDay, hasLivingPairSnapshot: pairSnapshotDay != null,
    ready5Days: ready5Days,
    peakGated: peak ? peak.gated : null, peakDay: peak ? peak.day : null,
    peakRaw: peak ? peak.raw : null, peakVets: peakVets,
    endGated: daily.length ? daily[daily.length - 1].gated : null,
    anomalies: anomalies, classDependsOnAnomaly: classDependsOnAnomaly,
    instrumentErrors: (row.instrumentErrors || []).length,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
  };
}

function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'killerdeath-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return classifySeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const counts = {};
  seeds.forEach(function (s) { counts[s.class] = (counts[s.class] | 0) + 1; });
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const pairs = seeds.filter(function (s) { return s.hasLivingPairSnapshot; }).length;
  const reconPairs = seeds.filter(function (s) { return s.maxSimultaneous >= 2; }).length;
  const allKillers = [];
  seeds.forEach(function (s) { s.killers.forEach(function (k) { allKillers.push(Object.assign({ seed: s.seed }, k)); }); });
  const deadKillers = allKillers.filter(function (k) { return !k.aliveAtEnd && k.killToDeathDays != null; });
  const causeShares = {};
  allKillers.filter(function (k) { return !k.aliveAtEnd; }).forEach(function (k) {
    const c = (k.deathCauseSplit || '?').split(':')[0];
    causeShares[c] = (causeShares[c] | 0) + 1;
  });
  const wall = { wins: 0, national: 0, table: 0, wave4unlocks: 0, wave4faced: 0, wave5unlocks: 0, wave5faced: 0, medianDays: null };
  files.forEach(function (f) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (row.won) wall.wins++;
    if (row.scaleRank === 'national' || row.scaleRank === 'global') wall.national++;
    if (row.tableDone || row.tableEntered) wall.table++;
    if ((row.unlockedWave | 0) >= 4 || (row.maxWave | 0) >= 4) wall.wave4unlocks++;
    if ((row.fights || []).some(function (ev) { return (ev.wave | 0) >= 4; }) || Object.keys(row.wavesFaced || {}).some(function (mid) { return (row.wavesFaced[mid] | 0) >= 4; })) wall.wave4faced++;
    if ((row.unlockedWave | 0) >= 5) wall.wave5unlocks++;
    if ((row.fights || []).some(function (ev) { return (ev.wave | 0) >= 5; }) || Object.keys(row.wavesFaced || {}).some(function (mid) { return (row.wavesFaced[mid] | 0) >= 5; })) wall.wave5faced++;
  });
  wall.medianDays = median(seeds.map(function (s) { return s.days; }));
  return { n: seeds.length, counts: counts, pairSnapshotSeeds: pairs, reconPairSeeds: reconPairs,
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    killToDeathMedian: median(deadKillers.map(function (k) { return k.killToDeathDays; })),
    deadKillers: deadKillers.length, killersEver: allKillers.length,
    deathCauseShares: causeShares, wall: wall, seeds: seeds, killers: allKillers };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: killerdeath-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { classifySeed: classifySeed, killerFates: killerFates, maxSimultaneous: maxSimultaneous, analyzeDir: analyzeDir, median: median };
