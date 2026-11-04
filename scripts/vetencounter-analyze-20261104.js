// vetencounter-analyze-20261104.js — veterans-encounter diag analyzer
// (arm sim-vetencounter-b). Per-seed wave-4 chain classification per the
// prereg (unlock -> spawn -> reach -> fight), binding-step verdict, and
// scale-wall numbers. Pure function over corpus JSON; no game reads,
// no re-scoring.
// Usage: node scripts/vetencounter-analyze-20261104.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');

function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

// Vetprod's per-seed pattern, for the prereg sanity clause: unlock yes/no
// and faced yes/no per seed. A mismatch that changes a break step fails
// the verdict loudly; a mismatch that does not is reported, not hidden.
const VETPROD_PATTERN = {
  99101: { unlock: true, faced: true }, 99102: { unlock: true, faced: false },
  99103: { unlock: true, faced: true }, 99104: { unlock: true, faced: true },
  99105: { unlock: true, faced: true }, 99106: { unlock: true, faced: false },
  99107: { unlock: false, faced: false }, 99108: { unlock: false, faced: false },
};

function analyzeSeed(row) {
  const daily = row.daily || [];
  const spawns = row.spawns || [];
  const removals = row.removals || [];
  const casts = row.casts || [];
  const fights = row.fights || [];
  const endDay = row.gameDays || row.days || (daily.length ? daily[daily.length - 1].day : 0);

  // Unlock day: first daily snapshot with unlockedWave >= 4.
  let unlockDay = null;
  daily.forEach(function (s) { if (unlockDay == null && (s.unlockedWave | 0) >= 4) unlockDay = s.day; });
  // Note: the driver takes a final snapshot after runDays, so an unlock
  // on the last day is still captured above. A finalize-only unlockedWave
  // with no snapshot at >= 4 would leave unlockDay null (instrument blind
  // spot) and fail the per-seed pattern check loudly, by design.
  const unlocked = unlockDay != null;

  const w4spawns = spawns.filter(function (s) { return (s.wave | 0) >= 4; });
  const spawnsPre = unlocked ? w4spawns.filter(function (s) { return s.day < unlockDay; }) : w4spawns.slice();
  const spawnsPost = unlocked ? w4spawns.filter(function (s) { return s.day >= unlockDay; }) : [];
  const w4casts = casts.filter(function (c) { return (c.wave | 0) >= 4; });
  const castsPost = unlocked ? w4casts.filter(function (c) { return c.day >= unlockDay; }) : w4casts.slice();
  const w4fights = fights.filter(function (f) { return (f.wave | 0) >= 4; });
  const faced = w4fights.length > 0 ||
    Object.keys(row.wavesFaced || {}).filter(function (mid) { return (row.wavesFaced[mid] | 0) >= 4; }).length > 0;

  // Instance fates + reach, post-unlock only (pre-unlock spawns are anomalies).
  const removalBySeq = {};
  removals.forEach(function (r) { if (r.seq != null && !(r.seq in removalBySeq)) removalBySeq[r.seq] = r; });
  const instances = spawnsPost.map(function (sp) {
    const inst = {
      seq: sp.seq, id: sp.id, spawnDay: sp.day, source: sp.source,
      spawnDist: sp.dist, spawnOnPlayer: !!sp.onPlayerTile, veteran: !!sp.veteran,
      firstPlayerDay: sp.onPlayerTile ? sp.day : null, firstVillagerDay: null,
      removalDay: null, removalClass: null, fightDay: null, reachDay: null, fate: null,
    };
    daily.forEach(function (s) {
      if (!s.world) return;
      s.world.forEach(function (w) {
        if (w.seq !== sp.seq) return;
        if (w.onPlayerTile && inst.firstPlayerDay == null) inst.firstPlayerDay = s.day;
        if ((w.npcCount | 0) > 0 && inst.firstVillagerDay == null) inst.firstVillagerDay = s.day;
      });
    });
    const rem = removalBySeq[sp.seq];
    if (rem) { inst.removalDay = rem.day; inst.removalClass = rem.rclass; }
    // Fight correlation by id + alive window (fight events carry no
    // instance ref — stated approximation; moot on unmet seeds).
    const winEnd = inst.removalDay != null ? inst.removalDay : endDay;
    const corr = w4fights.filter(function (f) { return f.mid === sp.id && f.day >= sp.day && f.day <= winEnd; });
    if (corr.length) inst.fightDay = Math.min.apply(null, corr.map(function (f) { return f.day; }));
    const reachCands = [inst.spawnOnPlayer ? sp.day : null, inst.firstPlayerDay, inst.firstVillagerDay, inst.fightDay].filter(function (d) { return d != null; });
    inst.reachDay = reachCands.length ? Math.min.apply(null, reachCands) : null;
    inst.reachedPlayerTile = (inst.spawnOnPlayer || inst.firstPlayerDay != null);
    inst.reachedVillagerTile = inst.firstVillagerDay != null;
    inst.fate = inst.fightDay != null ? 'fought' : (inst.removalDay != null ? 'removed-unfought' : 'alive-at-end');
    return inst;
  });

  const firstSpawnDay = spawnsPost.length ? Math.min.apply(null, spawnsPost.map(function (s) { return s.day; })) : null;
  const reached = instances.filter(function (i) { return i.reachDay != null; });
  let firstReachDay = reached.length ? Math.min.apply(null, reached.map(function (i) { return i.reachDay; })) : null;
  const firstFightDay = w4fights.length ? Math.min.apply(null, w4fights.map(function (f) { return f.day; })) : null;
  // A fight implies reach even when snapshots + correlation miss the instance.
  if (firstFightDay != null && firstReachDay == null) firstReachDay = firstFightDay;

  let breakStep;
  if (!unlocked) breakStep = 'UNLOCK';
  else if (spawnsPost.length === 0) breakStep = 'SPAWN';
  else if (firstReachDay == null) breakStep = 'REACH';
  else if (w4fights.length === 0) breakStep = 'TRIGGER';
  else breakStep = 'FACED';

  let bindingStep, gaps = null, bindingNote = null;
  if (breakStep !== 'FACED') { bindingStep = breakStep; }
  else if (firstSpawnDay == null) { bindingStep = 'CONTEST-SOURCED'; bindingNote = 'fights exist but no post-unlock world spawn recorded — chain came via a non-world path (e.g. contest cast); does not count toward any judged step'; }
  else {
    gaps = {
      unlockToSpawn: firstSpawnDay - unlockDay,
      spawnToReach: firstReachDay - firstSpawnDay,
      reachToFight: firstFightDay - firstReachDay,
    };
    const order = [['SPAWN', gaps.unlockToSpawn], ['REACH', gaps.spawnToReach], ['TRIGGER', gaps.reachToFight]];
    let best = order[0];
    order.forEach(function (o) { if (o[1] > best[1]) best = o; });
    bindingStep = best[0];
  }

  // World-full pressure over post-unlock snapshots.
  const postSnaps = unlocked ? daily.filter(function (s) { return s.day >= unlockDay && s.world; }) : [];
  const fullSnaps = postSnaps.filter(function (s) { return s.worldCap != null && s.world.length >= s.worldCap; });
  const occupyingWaveDays = {};
  fullSnaps.forEach(function (s) { s.world.forEach(function (w) { const k = String(w.wave); occupyingWaveDays[k] = (occupyingWaveDays[k] | 0) + 1; }); });
  const bgDists = spawnsPost.filter(function (s) { return s.source === 'background' && s.dist != null; }).map(function (s) { return s.dist; });

  // Peak gated standing (first day at max), as in vetprod.
  let peak = null;
  daily.forEach(function (s) { if (s.gated == null) return; if (!peak || s.gated > peak.gated) peak = s; });

  const pattern = VETPROD_PATTERN[row.seed] || null;
  const patternMatch = pattern ? (pattern.unlock === unlocked && pattern.faced === faced) : null;

  return {
    seed: row.seed, days: row.days, endReason: row.endReason, won: !!row.won,
    unlockDay: unlockDay, unlocked: unlocked, endDay: endDay,
    spawnsPost: spawnsPost.length, spawnsPre: spawnsPre.length, spawnsPreAnomaly: spawnsPre.length > 0,
    spawnsBySource: (function () { const c = {}; spawnsPost.forEach(function (s) { c[s.source || '?'] = (c[s.source || '?'] | 0) + 1; }); return c; })(),
    castsW4Post: castsPost.length,
    castsBySource: (function () { const c = {}; castsPost.forEach(function (x) { c[x.source || '?'] = (c[x.source || '?'] | 0) + 1; }); return c; })(),
    w4fights: w4fights.length,
    w4fightsPlayerTb: w4fights.filter(function (f) { return f.channel === 'player-tb'; }).length,
    w4fightsField: w4fights.filter(function (f) { return f.channel === 'field'; }).length,
    w4kills: (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length,
    firstSpawnDay: firstSpawnDay, firstReachDay: firstReachDay, firstFightDay: firstFightDay,
    reachedPlayerInstances: instances.filter(function (i) { return i.reachedPlayerTile; }).length,
    reachedVillagerInstances: instances.filter(function (i) { return i.reachedVillagerTile; }).length,
    reachedInstances: reached.length,
    instances: instances,
    breakStep: breakStep, bindingStep: bindingStep, gaps: gaps, bindingNote: bindingNote,
    medianBgSpawnDist: median(bgDists),
    bgSpawnCount: bgDists.length,
    worldFullSnaps: fullSnaps.length, postUnlockSnaps: postSnaps.length,
    worldFullFrac: postSnaps.length ? (fullSnaps.length / postSnaps.length) : null,
    occupyingWaveDays: occupyingWaveDays,
    peakGated: peak ? peak.gated : null, peakDay: peak ? peak.day : null, peakRaw: peak ? peak.raw : null,
    endGated: daily.length ? daily[daily.length - 1].gated : null,
    scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    instrumentErrors: (row.instrumentErrors || []).length,
    patternMatch: patternMatch,
  };
}

function computeVerdict(seeds) {
  const counts = {};
  seeds.forEach(function (s) { const k = s.bindingStep; counts[k] = (counts[k] | 0) + 1; });
  const judged = ['SPAWN', 'REACH', 'TRIGGER'];
  let dominant = null, dominantCount = 0;
  judged.forEach(function (k) { if ((counts[k] | 0) > dominantCount) { dominant = k; dominantCount = counts[k] | 0; } });
  const tie = judged.filter(function (k) { return (counts[k] | 0) === dominantCount && dominantCount > 0; }).length > 1;
  // Target seeds: unlocked-but-unmet this run (break in the judged steps).
  const targets = seeds.filter(function (s) { return judged.indexOf(s.breakStep) >= 0; });
  const targetsAtDominant = dominant ? targets.filter(function (s) { return s.breakStep === dominant; }).length : 0;
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const unlocks = seeds.filter(function (s) { return s.unlocked; }).length;
  const faced = seeds.filter(function (s) { return s.breakStep === 'FACED'; }).length;
  const sanity = (unlocks === 6 && faced === 4);
  const patternAllMatch = seeds.every(function (s) { return s.patternMatch === true; });
  // Prereg clause 4: per-seed pattern match is required, not just the
  // aggregates — an aggregate match with flipped seeds (e.g. 99102 faced
  // now, 99101 unfaced now) would mean break steps changed, so it must
  // not pass. patternAllMatch implies sanity (6 unlocks, 4 faced).
  const verdict = (seeds.length === 8 && totalErr === 0 && !tie && dominant && dominantCount >= 6 &&
    targets.length > 0 && targetsAtDominant === targets.length && patternAllMatch)
    ? 'DIAG-GO' : (errSeeds > 2 ? 'INSUFFICIENT-DATA' : 'DIAG-NO-CANDIDATE');
  return {
    verdict: verdict, dominant: dominant, dominantCount: dominantCount, tie: tie,
    bindingCounts: counts, targets: targets.map(function (s) { return s.seed; }),
    targetsAtDominant: targetsAtDominant,
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    unlocks: unlocks, faced: faced, sanityMatch: sanity, patternAllMatch: patternAllMatch,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('vetencounter-s') === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const v = computeVerdict(seeds);
  const dayList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const wall = {
    wins: seeds.filter(function (s) { return s.won; }).length,
    national: 0, table: 0,
    wave4unlocks: v.unlocks,
    wave4faced: v.faced,
    wave5unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    wave5faced: 0,
    medianDays: dayList.length ? ((dayList[Math.floor((dayList.length - 1) / 2)] + dayList[Math.ceil((dayList.length - 1) / 2)]) / 2) : null,
  };
  files.forEach(function (f) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (row.scaleRank === 'national' || row.scaleRank === 'global') wall.national++;
    if (row.tableDone || row.tableEntered) wall.table++;
    const w5fights = (row.fights || []).filter(function (ev) { return (ev.wave | 0) >= 5; }).length;
    const w5faced = Object.keys(row.wavesFaced || {}).filter(function (mid) { return (row.wavesFaced[mid] | 0) >= 5; }).length;
    if (w5fights > 0 || w5faced > 0) wall.wave5faced++;
  });
  const bgAll = [];
  seeds.forEach(function (s) { (s.instances || []).forEach(function (i) { if (i.source === 'background' && i.spawnDist != null) bgAll.push(i.spawnDist); }); });
  return Object.assign(v, { n: seeds.length, wall: wall, bandMedianBgSpawnDist: median(bgAll), seeds: seeds });
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: vetencounter-analyze-20261104.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, computeVerdict: computeVerdict, analyzeDir: analyzeDir, median: median };
