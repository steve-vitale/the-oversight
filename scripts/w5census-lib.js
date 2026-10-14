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

module.exports = { categorizeCause, buildCensusRows, pairFights, findChains, aggregateRows };
