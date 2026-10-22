#!/usr/bin/env node
// windowreach-r4-channels-20261022.js — herald-vs-monster channel
// decomposition helpers (sim-windowreach-r4, DIAG, axis scale-onramp).
//
// INSTRUMENT-ADJACENT: pure reads only, zero game-state writes, zero RNG
// draws, zero engine calls. No lever.
//
// Canon #749 (src/js/titans.js: the TITAN CLASS): titans — herald (wave 4),
// nielsen (wave 5), finale/apocalypse (wave 5), the_network (wave 6) —
// REFUSE solo TB entry (the muster hard gate: "no solo titans"). They fight
// through the COALITION channel: allied villages commit named faces who
// fight blow-by-blow, with outcomes recorded in
// Game.state.titans.outcomes ('refused'|'fought'|'stood-down' -> 'slain'|'fled').
// Wave-4/5 MONSTERS fight through the TB channel (scholar startCombat) and
// the field-fight channel (villagers). The engagement census MUST split
// these channels, never lump them.
//
// Exports:
//   titanIds(Game)      — set of titan ids + their .monster ids (pure data reads)
//   channelOf(Game, mid)— 'titan' | 'monster' | 'unknown'
//   readTitanOutcomes(Game) — normalized titan outcome records
//     {titan, wave, day, outcome, detail} from state.titans.outcomes
//   isWave5Monster(Game, mid) — monster-channel + wave 5
'use strict';

function titanIds(Game) {
  const ids = new Set();
  try {
    const tt = (Game.data && Game.data.titans) || {};
    for (const k of Object.keys(tt)) {
      const d = tt[k];
      if (!d || typeof d !== 'object') continue;
      if (!d.monster && d.wave == null) continue; // skip _comment/_overtime scaffolding
      ids.add(String(k));
      if (d.monster) ids.add(String(d.monster));
    }
  } catch (e) {}
  return ids;
}

function titanWave(Game, titanId) {
  try {
    const tt = (Game.data && Game.data.titans) || {};
    const d = tt[titanId];
    if (d && d.wave != null) return d.wave | 0;
    for (const k of Object.keys(tt)) {
      const dd = tt[k];
      if (dd && typeof dd === 'object' && dd.monster === titanId && dd.wave != null) return dd.wave | 0;
    }
  } catch (e) {}
  return null;
}

function monsterWaveOf(Game, mid) {
  try {
    const m = ((Game.data || {}).monsters || []).find(x => x && x.id === mid);
    return (m && (m.wave | 0)) || null;
  } catch (e) { return null; }
}

// channelOf(Game, mid): 'titan' when mid is a titan id or a titan's monster
// id; 'monster' when it's a wave-4/5 monster id; 'unknown' otherwise.
// Herald is BOTH a titan and monsters.json wave=4 — the titan channel wins
// (canon #749: the herald class refuses solo TB entry).
function channelOf(Game, mid) {
  const id = String(mid == null ? '' : mid);
  if (!id) return 'unknown';
  try {
    const ids = titanIds(Game);
    if (ids.has(id)) return 'titan';
  } catch (e) {}
  try {
    const w = monsterWaveOf(Game, id);
    if (w === 4 || w === 5) return 'monster';
    if (w != null) return 'monster';
  } catch (e) {}
  return 'unknown';
}

// readTitanOutcomes(Game): the coalition channel's own engagement log —
// state.titans.outcomes (titans.js titanRecordOutcome / titanResolveOutcome).
// Pure log reads; returns [] when the log is absent.
function readTitanOutcomes(Game) {
  const out = [];
  try {
    const log = ((Game.state || {}).titans || {}).outcomes;
    if (!Array.isArray(log)) return out;
    for (const r of log) {
      if (!r || typeof r !== 'object') continue;
      const titan = r.titan != null ? String(r.titan) : '?';
      out.push({
        titan,
        wave: titanWave(Game, titan),
        day: r.day != null ? (r.day | 0) : null,
        outcome: r.outcome != null ? String(r.outcome) : null,
        detail: (r.detail && typeof r.detail === 'object') ? Object.assign({}, r.detail) : r.detail,
      });
    }
  } catch (e) {}
  return out;
}

function isWave5Monster(Game, mid) {
  try {
    return channelOf(Game, mid) === 'monster' && monsterWaveOf(Game, mid) === 5;
  } catch (e) { return false; }
}

module.exports = { titanIds, titanWave, monsterWaveOf, channelOf, readTitanOutcomes, isWave5Monster };
