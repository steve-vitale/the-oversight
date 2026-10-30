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

function classifySource(lines) {
  if (!lines || !lines.length) return { source: 'unrecorded', line: null };
  const joined = lines.join(' | ');
  const pick = (re) => lines.find((l) => re.test(l)) || null;
  let line = null;
  if ((line = pick(/corpse|looted|loot(ed)?\b|took .* off the body|stripped/i))) return { source: 'loot', line };
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
        const cls = classifySource(lines);
        first = { loopDay: m.loopDay, gameDay: m.axe.gameDay, source: cls.source, line: cls.line, carrier: 'vessel', priorLoopDay: m.loopDay - 1 };
        break;
      }
    }
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
