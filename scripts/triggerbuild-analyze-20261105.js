// trigger-analyze-20261104.js — trigger-mechanism diag analyzer
// (arm sim-trigger-b). Reads per-seed JSON from the trigger driver and
// applies the prereg definitions exactly: wild-only break/binding steps,
// stack-classified fight counts, trigger sub-cause decomposition by
// FIRST co-location episode end, and removal-event instance fates.
// Usage: node scripts/trigger-analyze-20261104.js <per-seed-dir>
// Prints a JSON summary to stdout.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('TRIGGER-ANALYZE STOP: per-seed dir required.'); process.exit(2); }
const files = fs.readdirSync(dir).filter(function (f) { return f.startsWith('trigger-s') && f.endsWith('.json'); }).sort();
if (!files.length) { console.error('TRIGGER-ANALYZE STOP: no per-seed files in ' + dir); process.exit(2); }

// Vetencounter's shared numbers (evidence/2026-11-04/sim-vetencounter-b.md),
// for the prereg clause-5 sanity check.
const VET = {
  99101: { days: 150, peakGated: 199, w4fightsAny: 13, w4kills: 3, unlock: 65 },
  99102: { days: 116, peakGated: 199, w4fightsAny: 0, w4kills: 0, unlock: 80 },
  99103: { days: 121, peakGated: 180, w4fightsAny: 17, w4kills: 1, unlock: 59 },
  99104: { days: 150, peakGated: 199, w4fightsAny: 8, w4kills: 3, unlock: 94 },
  99105: { days: 52, peakGated: 140, w4fightsAny: 4, w4kills: 1, unlock: 48 },
  99106: { days: 59, peakGated: 150, w4fightsAny: 0, w4kills: 0, unlock: 47 },
  99107: { days: 72, peakGated: 50, w4fightsAny: 0, w4kills: 0, unlock: null },
  99108: { days: 48, peakGated: 20, w4fightsAny: 0, w4kills: 0, unlock: null },
};

function analyzeSeed(corpus) {
  const seed = corpus.seed;
  const daily = corpus.daily || [];
  const spawns = corpus.spawns || [];
  const removals = corpus.removals || [];
  const casts = corpus.casts || [];
  const fights = corpus.fights || [];
  const mtCalls = corpus.mtCalls || [];
  const tileChanges = corpus.tileChanges || [];
  const sayLines = corpus.sayLines || [];
  const errors = corpus.instrumentErrors || [];

  let unlockDay = null, peakGated = null;
  daily.forEach(function (s) {
    if (s.gated != null && (peakGated == null || s.gated > peakGated)) peakGated = s.gated;
    if (unlockDay == null && (s.unlockedWave | 0) >= 4) unlockDay = s.day;
  });
  const endDay = daily.length ? daily[daily.length - 1].day : corpus.gameDays;

  const w4spawns = spawns.filter(function (s) { return (s.wave | 0) === 4; });
  const postSpawns = unlockDay != null ? w4spawns.filter(function (s) { return s.day >= unlockDay; }) : [];
  const preSpawns = unlockDay != null ? w4spawns.filter(function (s) { return s.day < unlockDay; }) : w4spawns;
  const spawnBySource = {};
  postSpawns.forEach(function (s) { spawnBySource[s.source] = (spawnBySource[s.source] || 0) + 1; });
  const w4castsPost = unlockDay != null ? casts.filter(function (c) { return (c.wave | 0) === 4 && c.day >= unlockDay; }) : [];
  const castBySource = {};
  w4castsPost.forEach(function (c) { castBySource[c.source] = (castBySource[c.source] || 0) + 1; });

  const w4fights = fights.filter(function (f) { return (f.wave | 0) === 4; });
  const fightByClass = {};
  w4fights.forEach(function (f) { fightByClass[f.cls || 'other'] = (fightByClass[f.cls || 'other'] || 0) + 1; });
  const worldFights = w4fights.filter(function (f) { return f.cls === 'world'; });
  const w4kills = (corpus.waveKillLog || []).filter(function (e) { return ((e.w | 0) === 4); }).length;

  // Per-instance assembly (post-unlock wave-4 spawns only).
  const inst = {};
  postSpawns.forEach(function (s) {
    inst[s.seq] = {
      seq: s.seq, id: s.id, spawnDay: s.day, spawnSource: s.source,
      spawnOnPlayer: !!s.onPlayerTile, spawnTx: s.tx, spawnTy: s.ty, spawnMx: s.mx, spawnMy: s.my,
      snapOnPlayerDays: [], villagerDays: [], sepDays: [], mt: [], removal: null, foughtWorld: false,
      foughtViaRemoval: false, removalOnlyFought: false,
    };
  });
  daily.forEach(function (s) {
    (s.world || []).forEach(function (w) {
      if (w.seq == null || !inst[w.seq]) return;
      if (w.onPlayerTile) inst[w.seq].snapOnPlayerDays.push(s.day);
      if ((w.npcCount || 0) > 0) inst[w.seq].villagerDays.push(s.day);
      // Separation: instance listed on a tile other than the player's.
      if (w.tx !== s.px || w.ty !== s.py) inst[w.seq].sepDays.push(s.day);
    });
  });
  mtCalls.forEach(function (c) { if (inst[c.seq]) inst[c.seq].mt.push(c); });
  removals.forEach(function (r) {
    if (r.seq != null && inst[r.seq]) inst[r.seq].removal = r;
  });
  worldFights.forEach(function (f) { if (f.seq != null && inst[f.seq]) inst[f.seq].foughtWorld = true; });
  Object.keys(inst).forEach(function (k) {
    const it = inst[k];
    if (it.removal && it.removal.rclass === 'fight-settlement') {
      it.foughtViaRemoval = true;
      if (!it.foughtWorld) it.removalOnlyFought = true;
    }
    if (it.foughtViaRemoval) it.foughtWorld = true;
  });

  const finalSeqs = {};
  (corpus.finalWorld || []).forEach(function (w) { if (w.seq != null) finalSeqs[w.seq] = w; });

  // Lost-trail say-line join: first unmatched 'lost your trail' line
  // with idx > removal idx on the same day.
  const lostLines = sayLines.filter(function (s) { return /lost your trail/i.test(s.line); });
  const usedLost = new Set();
  function lostTrailJoined(removal) {
    if (!removal) return false;
    for (let i = 0; i < lostLines.length; i++) {
      if (usedLost.has(i)) continue;
      const ln = lostLines[i];
      if (ln.day === removal.day && ln.idx > removal.idx) { usedLost.add(i); return true; }
    }
    return false;
  }

  const instances = Object.keys(inst).map(function (k) { return inst[k]; });
  instances.forEach(function (it) {
    const playerReach = it.spawnOnPlayer || it.snapOnPlayerDays.length > 0 || it.mt.length > 0;
    const villagerReach = it.villagerDays.length > 0;
    it.playerReach = playerReach;
    it.villagerReach = villagerReach;
    it.reach = playerReach || villagerReach;
    it.firstCoDay = null;
    if (playerReach) {
      const cands = [];
      if (it.spawnOnPlayer) cands.push(it.spawnDay);
      if (it.snapOnPlayerDays.length) cands.push(Math.min.apply(null, it.snapOnPlayerDays));
      if (it.mt.length) cands.push(Math.min.apply(null, it.mt.map(function (c) { return c.day; })));
      it.firstCoDay = Math.min.apply(null, cands);
    }
    // Terminal fate by removal events (never by id). The lost-trail
    // say-line join is consumed once and reused for the sub-cause.
    if (it.removal && it.removal.rclass === 'monsterTurn') {
      const lastMt = it.mt.length ? it.mt[it.mt.length - 1] : null;
      const ls = lastMt ? (lastMt.after.lostSight || 0) : 0;
      it.lostJoined = (ls > 6) || lostTrailJoined(it.removal);
    } else it.lostJoined = false;
    if (it.foughtWorld) it.fate = 'fought';
    else if (it.removal) {
      const r = it.removal;
      if (r.rclass === 'monsterTurn') {
        const lastMt = it.mt.length ? it.mt[it.mt.length - 1] : null;
        const stance = lastMt ? lastMt.after.stance : null;
        if (it.lostJoined) it.fate = 'lost-trail';
        else if (stance === 'fearful') it.fate = 'fled-boundary';
        else it.fate = 'other-removal-monsterTurn';
      } else it.fate = 'other-removal-' + (r.rclass || 'other');
    } else if (finalSeqs[it.seq]) {
      const fw = finalSeqs[it.seq];
      const lastSnap = daily[daily.length - 1] || {};
      it.fate = (fw.tx === lastSnap.px && fw.ty === lastSnap.py) ? 'village-died-first' : 'still-wandering-at-death';
    } else it.fate = 'vanished-no-record';
    // Trigger sub-cause: FIRST co-location episode end (unfought,
    // player-reaching instances only). The first episode ends at the
    // first departure OR the first removal, whichever comes first —
    // a later return and lost-trail removal does NOT rewrite an
    // episode that already ended by departure. Departure evidence:
    // (a) any snapshot separation day — a listed instance on a
    // different tile than the player was alive and separated at
    // snapshot time, so the departure precedes any later removal
    // (a removed instance cannot appear in later snapshots);
    // (b) a tile-change marker after first co-location and before
    // any removal (idx-ordered; day-ordered fallback when the
    // first co-location has no idx).
    it.subCause = null;
    if (playerReach && !it.foughtWorld) {
      // First co-location event index (spawn-on-tile / mtCall records
      // carry idx; snapshot-only evidence has none, so day fallback).
      let firstCoIdx = null;
      if (it.spawnOnPlayer) {
        const sp = postSpawns.find(function (s) { return s.seq === it.seq; });
        if (sp) firstCoIdx = sp.idx;
      }
      if (it.mt.length) {
        const m0 = Math.min.apply(null, it.mt.map(function (c) { return c.idx; }));
        firstCoIdx = (firstCoIdx == null) ? m0 : Math.min(firstCoIdx, m0);
      }
      it.firstCoIdx = firstCoIdx;
      // First co-location TILE (triggerbuild 2026-11-05, stale-marker
      // fix): the tile the player shared with the instance at first
      // co-location. The instrument's tile-change marker is LAZY — it
      // is recorded on the next monsterTurn call after the tile key
      // changes, so a parting turn's own pre-hook records the ARRIVAL
      // onto the co-location tile (to == co-location tile) BEFORE its
      // own mtCall record. That marker is not a departure from the
      // tile and must not end the episode — the prereg states the
      // parting turn "falls inside the episode". A departure marker
      // is a tile-change whose TO tile differs from the co-location
      // tile. Unknown tile (no spawn-on-player, no mtCall): no
      // exclusion, old behavior.
      let firstCoTile = null;
      if (it.spawnOnPlayer) {
        const sp = postSpawns.find(function (s) { return s.seq === it.seq; });
        if (sp) firstCoTile = [sp.tx, sp.ty];
      }
      if (!firstCoTile && it.mt.length) {
        const m0 = it.mt.reduce(function (a, c) { return (c.idx < a.idx) ? c : a; });
        if (m0.px != null) firstCoTile = [m0.px, m0.py];
      }
      it.firstCoTile = firstCoTile;
      function isDepartureMarker(tc) {
        if (!firstCoTile) return true;
        return !(tc.to && tc.to[0] === firstCoTile[0] && tc.to[1] === firstCoTile[1]);
      }
      const departedBySnap = it.sepDays.some(function (d) { return d >= it.firstCoDay; });
      const departedByMarker = tileChanges.some(function (tc) {
        if (firstCoIdx != null) {
          if (tc.idx <= firstCoIdx) return false;
          if (it.removal && tc.idx > it.removal.idx) return false;
          return isDepartureMarker(tc);
        }
        if (tc.day <= it.firstCoDay) return false;
        if (it.removal && tc.day >= it.removal.day) return false;
        return isDepartureMarker(tc);
      });
      if (departedBySnap || departedByMarker) it.subCause = 'player-left-the-tile';
      else if (it.removal) {
        const r = it.removal;
        if (r.rclass === 'monsterTurn') {
          if (it.lostJoined) it.subCause = 'monster-unseen-on-tile';
          else it.subCause = 'player-present-never-engaged';
        } else it.subCause = 'player-present-never-engaged';
      }
      else if (finalSeqs[it.seq]) it.subCause = 'player-present-never-engaged';
      else it.subCause = 'unclassified';
    }
    it.mtCount = it.mt.length;
    it.mtMinDist = it.mt.length ? Math.min.apply(null, it.mt.map(function (c) { return (c.distAfter != null ? c.distAfter : 99); })) : null;
    it.mtStances = Array.from(new Set(it.mt.map(function (c) { return (c.after && c.after.stance) || null; }).filter(Boolean)));
    it.mtMaxLostSight = it.mt.length ? Math.max.apply(null, it.mt.map(function (c) { return (c.after && c.after.lostSight) || 0; })) : 0;
    // TRIGGERBUILD first-episode turns (prereg metric): mtCalls with idx
    // in [firstCoIdx, first departure marker). The parting turn runs
    // BEFORE the position update, so its call precedes the marker the
    // next call records — it falls inside the episode. A later return
    // episode's calls fall after the marker and are excluded. No marker
    // (run ended, or removal before any later call): all calls count,
    // flagged as a fallback upper bound. STALE-MARKER RULE (2026-11-05):
    // a marker whose TO tile is the co-location tile is the lazy
    // arrival record, not a departure — it is skipped, never the
    // episode end (see firstCoTile above).
    if (playerReach && !it.foughtWorld) {
      let depIdx = null;
      if (it.firstCoIdx != null) {
        for (const tc of tileChanges) {
          if (tc.idx <= it.firstCoIdx) continue;
          if (it.removal && tc.idx > it.removal.idx) continue;
          if (it.firstCoTile && tc.to && tc.to[0] === it.firstCoTile[0] && tc.to[1] === it.firstCoTile[1]) continue;
          depIdx = tc.idx; break;
        }
      }
      const eps = it.mt.filter(function (c) {
        if (it.firstCoIdx != null && c.idx < it.firstCoIdx) return false;
        if (depIdx != null && c.idx >= depIdx) return false;
        return true;
      });
      it.firstEpMt = eps.length;
      it.firstEpFallback = (depIdx == null);
      it.firstEpViaTravel = eps.some(function (c) { return !!c.viaTravel; });
    } else {
      it.firstEpMt = null; it.firstEpFallback = false; it.firstEpViaTravel = false;
    }
  });

  const reached = instances.filter(function (i) { return i.reach; });
  const playerReached = instances.filter(function (i) { return i.playerReach; });
  const villagerOnly = instances.filter(function (i) { return !i.playerReach && i.villagerReach; });
  const firstSpawnDay = postSpawns.length ? Math.min.apply(null, postSpawns.map(function (s) { return s.day; })) : null;
  const firstReachDay = reached.length ? Math.min.apply(null, reached.map(function (i) {
    const cands = [];
    if (i.firstCoDay != null) cands.push(i.firstCoDay);
    if (i.villagerDays.length) cands.push(Math.min.apply(null, i.villagerDays));
    return cands.length ? Math.min.apply(null, cands) : 99999;
  })) : null;
  const firstWorldFightDay = worldFights.length ? Math.min.apply(null, worldFights.map(function (f) { return f.day; })) : null;

  let breakStep, bindingStep, gaps = null;
  if (unlockDay == null) { breakStep = 'UNLOCK'; bindingStep = 'UNLOCK'; }
  else if (!postSpawns.length) { breakStep = 'SPAWN'; bindingStep = 'SPAWN'; }
  else if (!reached.length) { breakStep = 'REACH'; bindingStep = 'REACH'; }
  else if (!worldFights.length) { breakStep = 'TRIGGER'; bindingStep = 'TRIGGER'; }
  else {
    breakStep = 'FACED-WILD';
    gaps = {
      unlockToSpawn: (firstSpawnDay != null ? firstSpawnDay - unlockDay : null),
      spawnToReach: (firstSpawnDay != null && firstReachDay != null) ? firstReachDay - firstSpawnDay : null,
      reachToFight: (firstReachDay != null && firstWorldFightDay != null) ? firstWorldFightDay - firstReachDay : null,
    };
    const order = [['SPAWN', gaps.unlockToSpawn], ['REACH', gaps.spawnToReach], ['TRIGGER', gaps.reachToFight]];
    let best = order[0];
    order.forEach(function (o) { if ((o[1] || 0) > (best[1] || 0)) best = o; });
    bindingStep = best[0];
  }

  // World-full pressure + background distances (continuity).
  let fullSnaps = 0, postSnaps = 0;
  const bgDists = [];
  daily.forEach(function (s) {
    if (unlockDay != null && s.day >= unlockDay) {
      postSnaps++;
      if (s.worldCap != null && (s.world || []).length >= s.worldCap) fullSnaps++;
    }
  });
  postSpawns.filter(function (s) { return s.source === 'background'; }).forEach(function (s) { if (s.dist != null) bgDists.push(s.dist); });
  bgDists.sort(function (a, b) { return a - b; });
  const bgMedian = bgDists.length ? bgDists[Math.floor(bgDists.length / 2)] : null;

  const subCounts = {};
  const unfoughtPlayer = instances.filter(function (i) { return i.playerReach && !i.foughtWorld; });
  unfoughtPlayer.forEach(function (i) { subCounts[i.subCause || 'null'] = (subCounts[i.subCause || 'null'] || 0) + 1; });
  // TRIGGERBUILD aggregates (prereg GO inputs).
  const firstEpContact = unfoughtPlayer.filter(function (i) { return (i.firstEpMt || 0) >= 1; }).length;
  const zeroTurnPlayerLeft = unfoughtPlayer.filter(function (i) { return i.subCause === 'player-left-the-tile' && (i.firstEpMt || 0) === 0; }).length;
  const firstEpViaTravel = unfoughtPlayer.filter(function (i) { return i.firstEpViaTravel; }).length;
  const partingTurns = mtCalls.filter(function (c) { return !!c.viaTravel; }).length;
  const partingFights = mtCalls.filter(function (c) { return !!c.viaTravel && !!c.fightFired; }).length;
  const partingLines = sayLines.filter(function (s) { return /turn to leave/i.test(s.line); }).length;
  const starvFallen = (corpus.fallen || []).filter(function (f) { return /starv|hunger/i.test(f.cause || ''); }).length;

  const vet = VET[seed] || {};
  const sanity = {
    days: corpus.days === vet.days,
    peakGated: peakGated === vet.peakGated,
    unlock: unlockDay === vet.unlock,
    w4fightsAny: w4fights.length === vet.w4fightsAny,
    w4kills: w4kills === vet.w4kills,
  };
  sanity.all = sanity.days && sanity.peakGated && sanity.unlock && sanity.w4fightsAny && sanity.w4kills;

  return {
    seed: seed, days: corpus.days, endReason: corpus.endReason, won: corpus.won,
    scaleRank: corpus.scaleRank, maxWave: corpus.maxWave, standing: corpus.standing,
    readiness5: corpus.readiness5, unlockDay: unlockDay, peakGated: peakGated, endDay: endDay,
    w4spawnsPost: postSpawns.length, spawnBySource: spawnBySource, preUnlockW4spawns: preSpawns.length,
    w4castsPost: w4castsPost.length, castBySource: castBySource,
    w4fightsAny: w4fights.length, fightByClass: fightByClass, worldFights: worldFights.length,
    firstWorldFightDay: firstWorldFightDay, w4kills: w4kills,
    reachedInstances: reached.length, playerReached: playerReached.length, villagerOnly: villagerOnly.length,
    firstSpawnDay: firstSpawnDay, firstReachDay: firstReachDay,
    breakStep: breakStep, bindingStep: bindingStep, gaps: gaps,
    subCounts: subCounts, unfoughtPlayerInstances: unfoughtPlayer.length,
    firstEpContact: firstEpContact, zeroTurnPlayerLeft: zeroTurnPlayerLeft,
    firstEpViaTravel: firstEpViaTravel, partingTurns: partingTurns,
    partingFights: partingFights, partingLines: partingLines,
    starvFallen: starvFallen, endReasonOut: corpus.endReason,
    fullSnaps: fullSnaps, postSnaps: postSnaps, bgMedianDist: bgMedian, bgCount: bgDists.length,
    mtCallCount: mtCalls.length, tileChangeCount: tileChanges.length,
    sayLineCount: sayLines.length, instrumentErrors: errors,
    sanity: sanity, vetExpected: vet,
    instances: instances.map(function (i) {
      return {
        seq: i.seq, id: i.id, spawnDay: i.spawnDay, spawnSource: i.spawnSource,
        spawnOnPlayer: i.spawnOnPlayer, playerReach: i.playerReach, villagerReach: i.villagerReach,
        firstCoDay: i.firstCoDay, villagerDays: i.villagerDays.length,
        foughtWorld: i.foughtWorld, removalOnlyFought: i.removalOnlyFought,
        subCause: i.subCause, fate: i.fate,
        mtCount: i.mtCount, mtMinDist: i.mtMinDist, mtStances: i.mtStances, mtMaxLostSight: i.mtMaxLostSight,
        firstEpMt: i.firstEpMt, firstEpFallback: i.firstEpFallback, firstEpViaTravel: i.firstEpViaTravel,
        removal: i.removal ? { day: i.removal.day, rclass: i.removal.rclass, stackFn: i.removal.stackFn } : null,
      };
    }),
  };
}

const out = { seeds: [] };
files.forEach(function (f) {
  const corpus = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  out.seeds.push(analyzeSeed(corpus));
});

// Band verdict counts.
const bindingCounts = {};
out.seeds.forEach(function (s) { bindingCounts[s.bindingStep] = (bindingCounts[s.bindingStep] || 0) + 1; });
const subBand = {};
out.seeds.forEach(function (s) {
  Object.keys(s.subCounts).forEach(function (k) { subBand[k] = (subBand[k] || 0) + s.subCounts[k]; });
});
const unmet = out.seeds.filter(function (s) { return s.breakStep === 'TRIGGER'; }).map(function (s) { return s.seed; });
const unmetSubCauses = {};
out.seeds.filter(function (s) { return unmet.indexOf(s.seed) >= 0; }).forEach(function (s) {
  s.instances.filter(function (i) { return i.playerReach && !i.foughtWorld; }).forEach(function (i) {
    unmetSubCauses[i.subCause || 'null'] = (unmetSubCauses[i.subCause || 'null'] || 0) + 1;
  });
});
let plurality = null, pluralityN = 0, tie = false;
Object.keys(subBand).forEach(function (k) {
  if (subBand[k] > pluralityN) { plurality = k; pluralityN = subBand[k]; tie = false; }
  else if (subBand[k] === pluralityN) tie = true;
});
const wins = out.seeds.filter(function (s) { return s.won; }).length;
const national = out.seeds.filter(function (s) { return s.scaleRank && s.scaleRank !== 'village'; }).length;
const daysSorted = out.seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
const medianDays = daysSorted.length % 2 ? daysSorted[Math.floor(daysSorted.length / 2)]
  : (daysSorted[daysSorted.length / 2 - 1] + daysSorted[daysSorted.length / 2]) / 2;
out.verdict = {
  bindingCounts: bindingCounts,
  triggerBinding: bindingCounts.TRIGGER || 0,
  subBand: subBand, plurality: tie ? null : plurality, pluralityN: pluralityN, tie: tie,
  unmetSeeds: unmet, unmetSubCauses: unmetSubCauses,
  allClassified: out.seeds.every(function (s) { return !!s.breakStep; }),
  allErrorsZero: out.seeds.every(function (s) { return s.instrumentErrors.length === 0; }),
  allSanity: out.seeds.every(function (s) { return s.sanity.all; }),
  seedsWithErrors: out.seeds.filter(function (s) { return s.instrumentErrors.length > 0; }).map(function (s) { return s.seed; }),
  wins: wins, national: national, table: 0,
  wave4unlocks: out.seeds.filter(function (s) { return s.unlockDay != null; }).length,
  wave4facedAny: out.seeds.filter(function (s) { return s.w4fightsAny > 0; }).length,
  wave4facedWild: out.seeds.filter(function (s) { return s.worldFights > 0; }).length,
  wave5unlocks: out.seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
  medianDays: medianDays,
};
// TRIGGERBUILD band aggregates (prereg GO inputs).
const tbSum = function (k) { return out.seeds.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
out.triggerbuild = {
  population: tbSum('unfoughtPlayerInstances'),
  firstEpContact: tbSum('firstEpContact'),
  zeroTurnPlayerLeft: tbSum('zeroTurnPlayerLeft'),
  firstEpViaTravel: tbSum('firstEpViaTravel'),
  partingTurns: tbSum('partingTurns'),
  partingFights: tbSum('partingFights'),
  partingLines: tbSum('partingLines'),
  starvFallen: tbSum('starvFallen'),
  facedWild: out.seeds.filter(function (s) { return s.worldFights > 0; }).length,
  w4kills: tbSum('w4kills'),
  worldFights: tbSum('worldFights'),
};
console.log(JSON.stringify(out, null, 2));
