#!/usr/bin/env node
// analyze-axeacq-b.js — pure reads over axeacq-trace-b corpora.
// Usage: node scripts/analyze-axeacq-b.js <corpus-dir> [--bank]
// Prints JSON: per-seed census rows, stranded-morning axe table
// (--bank), wall numbers, recorder-error count, classification
// completeness. No game code is loaded; no state is mutated.
// Source classification reads RECORDED lines only (see prereg):
//   spawn / loot / find / grant / trade-gift / other-named /
//   unrecorded. A gain with no naming line is 'unrecorded',
//   never guessed into a channel.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const bankMode = process.argv.includes('--bank');
if (!dir) { console.error('usage: analyze-axeacq-b.js <corpus-dir> [--bank]'); process.exit(2); }

function classifySource(lines, tailLines) {
  // lines: the day's hatchet-naming lines. tailLines: the evening's
  // last-30 say lines (context: 'The body is stripped' carries no
  // 'hatchet' literal, so it never appears in lines).
  // Corpse-loot-as-action reads, in order:
  //   'You take bow, hatchet, ... from Nina.' (from-line) and/or
  //   'Taken: Bow x1, Hatchet x1, ...' (take summary) paired with a
  //   from-line or a 'body is stripped' line in the tail.
  const all = (lines || []).concat(tailLines || []);
  const pick = (re) => (lines || []).find((l) => re.test(l)) || null;
  if ((lines || []).some((l) => /you take .* from /i.test(l))) {
    return { source: 'loot', line: pick(/you take .* from /i) };
  }
  if ((lines || []).some((l) => /^taken:/i.test(l)) &&
      all.some((l) => /from \w+/i.test(l) || /body is stripped/i.test(l))) {
    return { source: 'loot', line: pick(/^taken:/i) };
  }
  if ((lines || []).some((l) => /corpse|looted|loot(ed)?\b|stripped/i.test(l))) {
    return { source: 'loot', line: pick(/corpse|looted|loot(ed)?\b|stripped/i) };
  }
  if (!lines || !lines.length) return { source: 'unrecorded', line: null };
  let line = null;
  if ((line = pick(/ruin|scaveng/i))) return { source: 'find', line };
  if ((line = pick(/grant|System .* giv|contest .* prize|reward/i))) return { source: 'grant', line };
  if ((line = pick(/\bgiv(e|es|ing)\b|trade|gift|hand(s|ed)? .* (the )?hatchet/i))) return { source: 'trade/gift', line };
  return { source: 'other-named', line: lines[0] };
}

function analyzeSeed(inst) {
  const errors = [];
  const spawn = inst.spawnSnap || null;
  if (!spawn) errors.push('missing spawnSnap');
  else if (spawn.error) errors.push('spawnSnap error: ' + spawn.error);
  const mornings = (inst.mornings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  for (const m of mornings) {
    if (!m.axe) errors.push('morning loopDay ' + m.loopDay + ' missing axe snap');
    else if (m.axe.error) errors.push('morning loopDay ' + m.loopDay + ' axe error: ' + m.axe.error);
  }
  const evenings = inst.evenings || [];
  const evByLoop = new Map(evenings.map((e) => [e.loopDay, e]));
  // First axe: spawn, else first morning snap with hatchet/canFell.
  let first = null, mismatch = null;
  if (spawn && spawn.hasHatchet) {
    first = { loopDay: 0, gameDay: spawn.gameDay, source: 'spawn', line: null, carrier: 'vessel' };
  } else {
    for (const m of mornings) {
      if (!m.axe) continue;
      if (m.axe.hasHatchet && !m.axe.canFell) mismatch = 'hatchet held but canFell false at loopDay ' + m.loopDay;
      if (m.axe.canFell && !m.axe.hasHatchet) mismatch = 'canFell true without hatchet id at loopDay ' + m.loopDay + ' (tier ' + m.axe.tier + ', tool ' + m.axe.toolName + ')';
      if (m.axe.hasHatchet || m.axe.canFell) {
        // Gain happened during the previous loop-day's daily (or
        // overnight): scan that day's hatchet lines first, then the
        // morning's own day lines (loopDay k runs after the snap).
        const prev = evByLoop.get(m.loopDay - 1);
        const lines = (prev && prev.hatchetLines) ? prev.hatchetLines.slice() : [];
        const tail = (prev && prev.eveningSayTail) ? prev.eveningSayTail.slice() : [];
        const cls = classifySource(lines, tail);
        first = { loopDay: m.loopDay, gameDay: m.axe.gameDay, source: cls.source, line: cls.line, carrier: 'vessel', priorLoopDay: m.loopDay - 1 };
        break;
      }
    }
  }
  // Succession signal: the vessel id at the first-axe morning vs the
  // previous morning snap (or spawn). A vessel change with no
  // loot/grant/find/trade line that day means the NEW vessel arrived
  // already carrying axe-tier — acquisition by succession, not by
  // the original bot's effort. Corroborated from the deaths sample
  // (player:true near the acquisition gameDay) when present.
  let succession = null;
  if (first && first.loopDay > 0) {
    const snaps = [spawn].concat(mornings.map((m) => m.axe));
    const idx = mornings.findIndex((m) => m.loopDay === first.loopDay);
    const prevSnap = idx > 0 ? mornings[idx - 1].axe : spawn;
    const curSnap = mornings[idx] ? mornings[idx].axe : null;
    if (prevSnap && curSnap && prevSnap.villagerId && curSnap.villagerId &&
        prevSnap.villagerId !== curSnap.villagerId) {
      const death = (inst.deaths || []).find((dd) => dd.player &&
        Math.abs((dd.day || 0) - (first.gameDay || 0)) <= 1);
      succession = { fromVessel: prevSnap.villagerId, toVessel: curSnap.villagerId,
        death: death ? { day: death.day, who: death.who, cause: death.cause } : null };
    }
  }
  if (first && succession && (first.source === 'unrecorded' || first.source === 'other-named')) {
    first.source = 'succession';
    first.succession = succession;
  } else if (first && succession) {
    first.succession = succession;
  }
  const classification = first
    ? 'ACQUIRED'
    : ((inst.endReason && inst.endReason !== 'survived')
      ? 'BLOCKED-died-before-acquisition'
      : 'BLOCKED-survived-without-acquisition');
  const row = {
    seed: inst.seed,
    vesselOccupation: (spawn && spawn.occupation) || null,
    spawnTier: (spawn && spawn.tier) || null,
    spawnTool: (spawn && spawn.toolName) || null,
    spawnHasHatchet: !!(spawn && spawn.hasHatchet),
    spawnPool: (spawn && spawn.pool) || null,
    spawnPoolHatchet: (spawn && spawn.pool && Array.isArray(spawn.pool.fullPool)) ? spawn.pool.fullPool.includes('hatchet') : null,
    spawnStashedHatchet: (spawn && spawn.pool && Array.isArray(spawn.pool.stashed)) ? spawn.pool.stashed.includes('hatchet') : null,
    successionCount: mornings.reduce((n, m, i) => {
      const prev = i === 0 ? spawn : mornings[i - 1].axe;
      return n + ((prev && m.axe && prev.villagerId && m.axe.villagerId && prev.villagerId !== m.axe.villagerId) ? 1 : 0);
    }, 0),
    firstAxe: first,
    classification,
    endReason: inst.endReason || null,
    daysAlive: inst.daysAlive ?? null,
    gameDays: inst.gameDays ?? null,
    maxWaveUnlocked: inst.maxWaveUnlocked ?? null,
    waveKills: inst.waveKills || {},
    endState: inst.endState || null,
    mismatch,
    recorderErrors: errors,
  };
  // Stranded mornings (bank mode): evening bucket creek + rescued false.
  const stranded = [];
  if (bankMode) {
    for (const e of evenings) {
      const wc = e.woodcarry || null;
      if (wc && wc.bucket === 'creek' && !wc.rescued) {
        const m = mornings.find((x) => x.loopDay === e.loopDay);
        stranded.push({
          seed: inst.seed, loopDay: e.loopDay,
          wakeTile: m ? (m.mapPx + ',' + m.mapPy) : null,
          wakeCell: m ? (m.mx + ',' + m.my) : null,
          morningKcal: m ? m.kcal : null,
          morningWood: e.morningWood ?? null,
          axe: m && m.axe ? { hasHatchet: m.axe.hasHatchet, tier: m.axe.tier, toolName: m.axe.toolName, canFell: m.axe.canFell } : null,
        });
      }
    }
  }
  return { row, stranded };
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
if (!files.length) { console.error('no per-seed JSON in ' + dir); process.exit(2); }
const rows = [], strandedAll = [];
let recorderErrorCount = 0;
for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const { row, stranded } = analyzeSeed(inst);
  rows.push(row);
  strandedAll.push(...stranded);
  recorderErrorCount += row.recorderErrors.length;
}
rows.sort((a, b) => a.seed - b.seed);
const acquired = rows.filter((r) => r.classification === 'ACQUIRED');
const firstDays = acquired.filter((r) => r.firstAxe && r.firstAxe.gameDay !== undefined && r.firstAxe.source !== 'spawn')
  .map((r) => r.firstAxe.gameDay);
const spawnCount = rows.filter((r) => r.spawnHasHatchet).length;
const median = (xs) => {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const wall = {
  seeds: rows.length,
  wins: rows.filter((r) => r.endState && r.endState.won).length,
  national: rows.filter((r) => r.endState && (r.endState.scaleRank === 'national' || r.endState.scaleRank === 'global')).length,
  table: rows.filter((r) => r.endState && (r.endState.stage === 'table' || r.endState.stage === 'national')).length,
  scaleRanks: rows.map((r) => (r.endState || {}).scaleRank || null),
  maxWaveUnlocked: rows.map((r) => r.maxWaveUnlocked),
  medianSurvivalLoopDays: median(rows.map((r) => r.daysAlive).filter((x) => x !== null)),
  endReasons: rows.map((r) => r.endReason),
};
const out = {
  corpusDir: dir, bankMode, seeds: rows.length,
  summary: {
    acquired: acquired.length, blocked: rows.length - acquired.length,
    spawnHatchet: spawnCount,
    spawnPoolHatchet: rows.filter((r) => r.spawnPoolHatchet === true).length,
    spawnStashedHatchet: rows.filter((r) => r.spawnStashedHatchet === true).length,
    successionAcquisitions: rows.filter((r) => r.firstAxe && r.firstAxe.source === 'succession').length,
    firstAxeGameDaysNonSpawn: firstDays,
    medianFirstAxeGameDayNonSpawn: median(firstDays),
    unclassified: rows.filter((r) => r.classification !== 'ACQUIRED' && !r.classification.startsWith('BLOCKED')).length,
    recorderErrorCount,
    strandedMornings: strandedAll.length,
    strandedWithAxe: strandedAll.filter((s) => s.axe && s.axe.canFell).length,
  },
  wall, rows, stranded: strandedAll,
};
console.log(JSON.stringify(out, null, 2));
