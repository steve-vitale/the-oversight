#!/usr/bin/env node
// w5census-lib.js — pure census-row builder for the wave-5 post-unlock death
// census (scale-onramp r26, diagnostic arm, 2026-10-14).
//
// No Game reads here: the sweep driver gathers plain data (death records,
// tenure list, combat_start stream, unlock days, table days) and this lib
// turns it into census rows + aggregates. That keeps the logic unit-testable
// (scripts/test-w5census-instrument-20261014.js) without a live sim.
//
// A "wave-5 unlocker" is a village whose wave 5 unlocked at day U. The census
// rows are the bearers (scholars) who died at day >= U: one row per bearer
// death. Tenure (when the vid became scholar) comes from the driver's
// daily-hook bearer tracking; the death's `who` is the bearer vid.
'use strict';

// Cause -> category. Named monsters are not enumerated here: the driver
// passes a monster-name set so "killed by <monster name>" keys as combat.
// Anything unmapped keeps its raw text under 'other:' — a leak is visible,
// never silently absorbed into a friendly bucket.
function categorizeCause(cause, monsterNames) {
  const c = String(cause || 'unknown').trim();
  const lower = c.toLowerCase();
  if (lower === 'combat' || lower === 'monster' || lower === 'villager combat') return 'combat';
  if (lower === 'starvation') return 'starvation';
  if (lower === 'sickness') return 'disease';
  if (lower === "a wound that wouldn't close") return 'wound';
  if (lower === 'contest' || lower === 'the contest') return 'contest';
  if (lower === 'expedition' || lower === 'the expedition') return 'expedition';
  if (monsterNames && monsterNames.has(c)) return 'combat';
  return 'other:' + c;
}

// opts:
//   unlockDayW5: number|null (null = wave 5 never unlocked -> no rows)
//   playerDeaths: [{day, who, cause}] (player:true tele death records)
//   tenures: [{vid, startDay}] — bearer tenures, latest last
//   combatStarts: [{day, mid, wave, pack}] — player's own fights (combat_start)
//   pairs: [{start, end}] from pairFights — start/end-paired fights; the end
//     nearest the death day names the paired (usually fatal) fight
//   nameOf: (mid) -> display name
//   tableDays: [day] — days tableWaiting was true
//   monsterNames: Set of monster display names (for cause classification)
// Returns { rows, reconciliation } — reconciliation pins the census to the
// death tally: rows.length must equal post-unlock player-death count.
function buildCensusRows(opts) {
  const { unlockDayW5, playerDeaths, tenures, combatStarts, pairs, nameOf, tableDays, monsterNames } = opts;
  const rows = [];
  const reconciliation = { postUnlockDeaths: 0, rows: 0, preUnlockDeaths: 0, unmatchedTenure: 0 };
  if (unlockDayW5 == null) {
    reconciliation.postUnlockDeaths = 0;
    return { rows, reconciliation };
  }
  const U = unlockDayW5;
  for (const d of (playerDeaths || [])) {
    if (d.day < U) { reconciliation.preUnlockDeaths += 1; continue; }
    reconciliation.postUnlockDeaths += 1;
    // tenure: latest tenure whose startDay <= deathDay and (vid matches if we know it)
    let tenure = null;
    for (const t of (tenures || [])) {
      if (t.startDay <= d.day && (!d.who || t.vid === d.who)) tenure = t;
    }
    if (!tenure) {
      // fallback: latest tenure before the death even if vid didn't match
      for (const t of (tenures || [])) { if (t.startDay <= d.day) tenure = t; }
      if (tenure) reconciliation.unmatchedTenure += 1;
    }
    const cat = categorizeCause(d.cause, monsterNames);
    // Fight context: the player's own fights on the death day and the 2
    // days before it — the fatal fight started in that window. Up to 3,
    // most recent last.
    const win = (combatStarts || [])
      .filter(c => c.day >= d.day - 2 && c.day <= d.day)
      .sort((a, b) => a.day - b.day)
      .slice(-3);
    // Paired fight: the combat_end nearest the death day (within 1 day) is the
    // death's fight; its paired combat_start names the monster. Two honest
    // outcomes: (a) paired start -> the fatal monster fight; (b) unpaired
    // end -> a NON-MONSTER person-fight (uprising / betrayal / alien-duel
    // paths bypass startCombat, so no combat_start exists — verified s22
    // d144: fighter capture showed player vs hostile 'Stranger', an
    // alien-player duel, uprising=false betrayal=false).
    let pairedFight = null;
    if (pairs && pairs.length) {
      let bestPair = null, bestScore = 1e9;
      for (const p of pairs) {
        if (!p.end) continue;
        const diff = Math.abs(p.end.day - d.day);
        if (diff > 1) continue;
        const score = diff * 10 + (p.end.day > d.day ? 1 : 0);
        if (score < bestScore) { bestScore = score; bestPair = p; }
      }
      if (bestPair) {
        pairedFight = bestPair.start
          ? {
              vs: nameOf(bestPair.start.mid),
              wave: bestPair.start.wave != null ? bestPair.start.wave : null,
              pack: bestPair.start.pack || null,
              startDay: bestPair.start.day,
              endDay: bestPair.end.day,
              result: bestPair.end.result || null,
              personFight: false,
            }
          : {
              vs: null, wave: null, pack: null, startDay: null,
              endDay: bestPair.end.day,
              result: bestPair.end.result || null,
              personFight: true,
              note: 'no combat_start — non-monster person-fight path (uprising/betrayal/alien-duel bypass startCombat)',
            };
      }
    }
    const fightCtx = win.length
      ? win.map(c => `${nameOf(c.mid)} (w${c.wave}${c.pack > 1 ? ', pack ' + c.pack : ''}) d${c.day}`).join(' -> ')
      : null;
    const fightWaves = [...new Set(win.map(c => c.wave))].sort();
    const tableReached = (tableDays || []).some(td => td >= U && td <= d.day);
    rows.push({
      who: d.who || '?',
      tenureStartDay: tenure ? tenure.startDay : null,
      deathDay: d.day,
      daysPostUnlock: d.day - U,
      cause: String(d.cause || 'unknown'),
      category: cat,
      tableReached: !!tableReached,
      fightCtx,
      pairedFight,
      fightWaves,
      w5Fought: fightWaves.includes(5) || !!(pairedFight && pairedFight.wave === 5),
    });
  }
  rows.sort((a, b) => a.deathDay - b.deathDay);
  reconciliation.rows = rows.length;
  return { rows, reconciliation };
}

// pairFights: greedy temporal pairing of the player's own turn-based fights.
// Each combat_end consumes the most recent unconsumed combat_start with
// day <= end.day. Index pairing is wrong: some ends have no start (e.g. a
// startCombat path that skips the tele) and fights can span days.
// Returns [{start, end}] in end order; start may be null (unpaired end).
function pairFights(starts, ends) {
  const avail = (starts || []).slice().sort((a, b) => a.day - b.day);
  const used = new Set();
  const pairs = [];
  for (const e of (ends || []).slice().sort((a, b) => a.day - b.day)) {
    let best = -1;
    for (let i = 0; i < avail.length; i++) {
      if (used.has(i)) continue;
      if (avail[i].day <= e.day) best = i; else break;
    }
    if (best >= 0) { used.add(best); pairs.push({ start: avail[best], end: e }); }
    else pairs.push({ start: null, end: e });
  }
  return pairs;
}

// Succession chains: maximal runs of post-unlock bearer deaths with gaps
// <= maxGap days (the s303 7-deep d48-d76 pattern: successors walking into
// the same fight). Returns chains sorted by depth desc.
function findChains(rows, maxGap) {
  maxGap = maxGap == null ? 12 : maxGap;
  const sorted = rows.slice().sort((a, b) => a.deathDay - b.deathDay);
  const chains = [];
  let cur = [];
  for (const r of sorted) {
    if (cur.length && r.deathDay - cur[cur.length - 1].deathDay > maxGap) {
      if (cur.length >= 2) chains.push(cur);
      cur = [];
    }
    cur.push(r);
  }
  if (cur.length >= 2) chains.push(cur);
  return chains
    .map(c => ({ depth: c.length, from: c[0].deathDay, to: c[c.length - 1].deathDay,
                 causes: c.map(r => r.category), w5Fought: c.map(r => r.w5Fought) }))
    .sort((a, b) => b.depth - a.depth);
}

function aggregateRows(rows) {
  const n = rows.length;
  const counts = {};
  for (const r of rows) counts[r.category] = (counts[r.category] || 0) + 1;
  const shares = Object.keys(counts).map(k => ({ cause: k, n: counts[k], share: n ? +(counts[k] / n).toFixed(3) : 0 }));
  shares.sort((a, b) => b.n - a.n);
  const dpu = rows.map(r => r.daysPostUnlock).sort((a, b) => a - b);
  const medianDPU = dpu.length ? dpu[Math.floor(dpu.length / 2)] : null;
  const tableReached = rows.filter(r => r.tableReached).length;
  const w5Fought = rows.filter(r => r.w5Fought).length;
  const personFights = rows.filter(r => r.pairedFight && r.pairedFight.personFight).length;
  const paired = rows.filter(r => r.pairedFight).length;
  return {
    n, top3: shares.slice(0, 3), all: shares,
    medianDaysPostUnlock: medianDPU,
    maxDaysPostUnlock: dpu.length ? dpu[dpu.length - 1] : null,
    minDaysPostUnlock: dpu.length ? dpu[0] : null,
    tableReached, tableRate: n ? +(tableReached / n).toFixed(3) : 0,
    w5FoughtInWindow: w5Fought, w5FoughtShare: n ? +(w5Fought / n).toFixed(3) : 0,
    pairedFights: paired, personFights,
    chains: findChains(rows),
  };
}

module.exports = { categorizeCause, buildCensusRows, pairFights, findChains, aggregateRows,
  buildVillagerRows, aggregateVillagerRows, classifyPersonFight, findCombatChains48,
  buildVillageProfile };

// ---------------------------------------------------------------------------
// r27 EXTENSIONS (scale-onramp r27, HOLLOW UNLOCK #134 + 48h chains #90).
// All instrument-only: pure functions, no Game reads. The r26 functions
// above are untouched so their proof test keeps pinning behavior.

// VILLAGER-LEVEL post-unlock rows (closes HOLLOW UNLOCK #134 — the r26 census
// was scholar-centric and couldn't explain s88: village-lost d87 with the
// scholar alive). One row per non-player villager/'person' death at day >= U:
// the scholar's tenure context (who held the mantle on the death day, from
// the driver's daily-hook tenure list) is attached so each row says who was
// in charge when this villager died.
//
// opts: { unlockDayW5, villagerDeaths: [{day, who, cause, kind}],
//         tenures, monsterNames }
// Returns { rows, reconciliation } — rows.length must equal the post-unlock
// non-player death count.
function buildVillagerRows(opts) {
  const { unlockDayW5, villagerDeaths, tenures, monsterNames } = opts;
  const rows = [];
  const reconciliation = { postUnlockVillagerDeaths: 0, rows: 0, preUnlockVillagerDeaths: 0, unmatchedTenure: 0 };
  if (unlockDayW5 == null) {
    reconciliation.postUnlockVillagerDeaths = 0;
    return { rows, reconciliation };
  }
  const U = unlockDayW5;
  for (const d of (villagerDeaths || [])) {
    if (d.day < U) { reconciliation.preUnlockVillagerDeaths += 1; continue; }
    reconciliation.postUnlockVillagerDeaths += 1;
    // tenure: latest tenure whose startDay <= deathDay (the mantle at the time)
    let tenure = null;
    for (const t of (tenures || [])) { if (t.startDay <= d.day) tenure = t; }
    if (!tenure) reconciliation.unmatchedTenure += 1;
    rows.push({
      who: d.who || '?',
      deathDay: d.day,
      daysPostUnlock: d.day - U,
      kind: String(d.kind || '?'),
      cause: String(d.cause || 'unknown'),
      category: categorizeCause(d.cause, monsterNames),
      mantleAtDeath: tenure ? tenure.vid : null,
      mantleTenureStart: tenure ? tenure.startDay : null,
    });
  }
  rows.sort((a, b) => a.deathDay - b.deathDay);
  reconciliation.rows = rows.length;
  return { rows, reconciliation };
}

function aggregateVillagerRows(rows) {
  const n = rows.length;
  const counts = {};
  for (const r of rows) counts[r.category] = (counts[r.category] || 0) + 1;
  const shares = Object.keys(counts).map(k => ({ cause: k, n: counts[k], share: n ? +(counts[k] / n).toFixed(3) : 0 }));
  shares.sort((a, b) => b.n - a.n);
  const dpu = rows.map(r => r.daysPostUnlock).sort((a, b) => a - b);
  const med = dpu.length ? dpu[Math.floor(dpu.length / 2)] : null;
  return {
    n, top3: shares.slice(0, 3), all: shares,
    medianDaysPostUnlock: med,
    maxDaysPostUnlock: dpu.length ? dpu[dpu.length - 1] : null,
    minDaysPostUnlock: dpu.length ? dpu[0] : null,
  };
}

// PERSON-FIGHT SUBTYPE SPLITS (#133 stays OPEN: the engine still emits no
// tele distinguishing alien-duel/uprising/betrayal — but the driver's tbEnd
// instrument wrap snapshots the LIVE tbfight object (no game-code change),
// so where the fight flags are readable the split IS determinable.
//
// snapshot (instrument-captured at tbEnd, before call-through):
//   { uprising, betrayal, aggressor, hasMonster, hasAlienPid }
// Returns 'alien-duel' | 'uprising' | 'betrayal' | 'other-person'.
function classifyPersonFight(snap) {
  const s = snap || {};
  if (s.hasAlienPid) return 'alien-duel';
  if (s.uprising) return 'uprising';
  if (s.betrayal) return 'betrayal';
  return 'other-person';
}

// 48h COMBAT-SUCCESSION chains (#90): the same-day multi-death metric misses
// d91->d92->d93 and d75->d76 chains (same pathology, different clock). A
// chain is a maximal run of COMBAT-category scholar deaths with gaps <= 2
// days (48h). Non-combat rows neither start nor extend a chain (the
// pathology under study is the succession combat feed, per #90).
function findCombatChains48(rows) {
  const combat = (rows || []).filter(r => r.category === 'combat')
    .sort((a, b) => a.deathDay - b.deathDay);
  const chains = [];
  let cur = [];
  for (const r of combat) {
    if (cur.length && r.deathDay - cur[cur.length - 1].deathDay > 2) {
      if (cur.length >= 2) chains.push(cur);
      cur = [];
    }
    cur.push(r);
  }
  if (cur.length >= 2) chains.push(cur);
  return chains
    .map(c => ({ depth: c.length, from: c[0].deathDay, to: c[c.length - 1].deathDay,
                 causes: c.map(x => x.category), who: c.map(x => x.who),
                 w5Fought: c.map(x => !!x.w5Fought) }))
    .sort((a, b) => b.depth - a.depth);
}

// VILLAGE PROFILE (the hollow-vs-combat story in numbers). From a
// day-keyed village curve (driver daily hook, last-write-wins per
// game-day): roster size, pantry kcal, trust mean/min + bands, standing.
// Builds the last-30-post-unlock-days story plus unlock-day anchors.
//
// curve: [{day, roster, pantryKcal, trustMean, trustMin, trustN,
//          low: n trust<30, mid: 30-60, high: 60+, standing}]
// villagerRows: post-unlock villager rows (for death-cause counts in window)
// unlockDay: wave-5 unlock day
function buildVillageProfile(curve, villagerRows, unlockDay) {
  const byDay = {};
  for (const c of (curve || [])) byDay[c.day] = c; // last write per game-day wins
  const at = (d) => byDay[d] || null;
  const unlock = at(unlockDay) || {};
  const winStart = unlockDay;
  const win = (villagerRows || []).filter(r => r.deathDay >= winStart && r.deathDay < winStart + 30);
  const counts = {};
  for (const r of win) counts[r.category] = (counts[r.category] || 0) + 1;
  const dayNums = Object.keys(byDay).map(Number);
  const lastDay = dayNums.length ? Math.max.apply(null, dayNums.concat([unlockDay])) : unlockDay;
  // curve in the window: min roster, min pantry, trust trajectory
  let minRoster = null, minPantry = null, endRoster = null, endPantry = null,
      endTrustMean = null, endTrustLow = null, endTrustN = null, endStanding = null;
  for (let d = winStart; d <= Math.min(winStart + 30, lastDay); d++) {
    const c = at(d);
    if (!c) continue;
    if (c.roster != null) { minRoster = minRoster == null ? c.roster : Math.min(minRoster, c.roster); endRoster = c.roster; }
    if (c.pantryKcal != null) { minPantry = minPantry == null ? c.pantryKcal : Math.min(minPantry, c.pantryKcal); endPantry = c.pantryKcal; }
    if (c.trustMean != null) endTrustMean = c.trustMean;
    if (c.low != null) endTrustLow = c.low;
    if (c.trustN != null) endTrustN = c.trustN;
    if (c.standing != null) endStanding = c.standing;
  }
  return {
    unlockDay,
    atUnlock: { roster: unlock.roster != null ? unlock.roster : null,
                pantryKcal: unlock.pantryKcal != null ? unlock.pantryKcal : null,
                trustMean: unlock.trustMean != null ? unlock.trustMean : null,
                trustN: unlock.trustN != null ? unlock.trustN : null },
    window30: { minRoster, minPantry,
                endRoster, endPantry, endTrustMean, endTrustLow, endTrustN,
                endStanding, lastCurveDay: lastDay,
                villagerDeaths: win.length,
                deathsByCause: counts },
  };
}
