#!/usr/bin/env node
// killtime-census-20261021.js — kill-time attribution instrument (sim-killtime,
// 2026-10-21, axis scale-onramp; backlog #753 measurement correction).
//
// DIAGNOSTIC — no lever. Zero src/js, zero policy changes.
//
// The veteran-channel claims ("scholar wave-4 kills = 0", "N villager wave-4
// kills") rest on joining each wave-4 kill's killer vid against the scholar
// vid. Succession churn is heavy on the winning substrate, so the END-OF-RUN
// Game.villagerId misattributes: a companion's kill looks like a scholar kill
// once the killer later takes the mantle (s64712: d74 companion kill by
// ethan_hunt, killer became scholar at d87 — end-of-run attribution says
// "scholar", kill-time says "companion").
//
// This layer installs ON TOP of killdisc v1 or v2
// (scripts/killdisc-instrument-20261018.js / -20261021.js — same install
// contract: instrumentOn(), install(Game, t), uninstall; when KILLDISC is
// unset the wraps are never installed and the policy path is byte-identical
// to the base — the proof test's det-gate pins that):
//
//   DAILY VID CENSUS: Game.sleep is wrapped (pure reads) to record, once per
//     day, the current scholar vid plus the living roster — a map
//     day -> { scholar: vid, roster: [vids] }.
//   KILL-TIME JOIN: attributeKills() joins every waveKillLog entry with w>=4
//     (day, by) against THAT DAY's census — never the end-of-run roster.
//     The killdisc instrument's own kill-time ctx.scholarVid (captured at
//     the exact kill moment inside recordWaveKill) cross-checks the daily
//     census; on disagreement the exact kill-time capture wins and the
//     disagreement is flagged (censusMismatch).
//   CORRECTION REPORT: correctionReport() emits end-of-run-attributed counts
//     vs kill-time-attributed counts, the delta list (each flipped kill with
//     day/mid/before/after), and the corrected veteran-channel primaries.
//
// Attribution rules (kill-time):
//   by === 'player'          -> scholar (the game's own channel tag for the
//                               scholar's TB kills)
//   by === bearerAtKill      -> scholar (killer held the mantle that day)
//   otherwise                -> villager (a companion / villager kill)
//
// Unexplained (honest residuals, never silent):
//   - join failure: no census for the kill's day and no kill-time ctx
//     fallback (reason 'no-census-for-day')
//   - unresolvable wave: entry carries no w and the instrument has no kill
//     row for it (reason 'unresolvable-wave')
//
// Pure reads, zero game-state writes, zero RNG draws. The Game.sleep wrap is
// call-through; install-time wrapper replacement is the only mutation.
'use strict';

function err(t, where, e) {
  try { t.instrumentErrors.push('killtime:' + where + ': ' + String((e && e.message) || e)); } catch (e2) { /* reporting must never throw; nothing left to report to */ }
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function scholarVidOf(Game) {
  try { return Game.villagerId || null; } catch (e) { return null; }
}

function rosterVids(Game) {
  try {
    const r = ((Game.state || {}).village || {}).roster || [];
    return r.map(x => (typeof x === 'string') ? x : (x && (x.vid || x.id)) || null).filter(Boolean);
  } catch (e) { return []; }
}

// install(Game, t, KD): installs KD (killdisc v1/v2 module) then the daily
// census wrap on top of Game.sleep. t gains t.bearerByDay.
// Returns an uninstall function restoring both layers.
function install(Game, t, KD) {
  if (!t.bearerByDay) t.bearerByDay = {};
  if (!t.instrumentErrors) t.instrumentErrors = [];
  if (!KD || typeof KD.install !== 'function') { err(t, 'install.noKD', new Error('KD module with install() required')); return function () {}; }
  const uninstallKD = KD.install(Game, t);
  const oSleep = Game.sleep;
  if (typeof oSleep !== 'function') { err(t, 'install.missing:sleep', new Error('not a function')); return uninstallKD; }
  const bound = oSleep.bind ? oSleep.bind(Game) : function () { return oSleep.apply(Game, arguments); };
  Game.sleep = function () {
    try {
      const day = gday(Game);
      t.bearerByDay[day] = { scholar: scholarVidOf(Game), roster: rosterVids(Game) };
    } catch (e) { err(t, 'sleep.census', e); }
    return bound.apply(this, arguments);
  };
  return function uninstall() {
    try { Game.sleep = oSleep; } catch (e) { err(t, 'uninstall.sleep', e); }
    try { if (uninstallKD) uninstallKD(); } catch (e) { err(t, 'uninstall.kd', e); }
  };
}

// nameOf(Game, vid): first-name display for a vid (pure read).
function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) { /* getPerson unavailable — fall through to the vid slice */ }
  return String(vid || '?').slice(0, 14);
}

// resolveWave(Game, entry): the wave of a waveKillLog entry — the game's own
// w first (kill-time honest), else the monster def lookup. 0 = unresolvable.
function resolveWave(Game, entry) {
  try {
    const w = (entry && entry.w) | 0;
    if (w > 0) return w;
    const m = ((Game.data || {}).monsters || []).find(x => x && x.id === entry.mid);
    return (m && m.wave) | 0 || 0;
  } catch (e) { return 0; }
}

// attributeKills(Game, t, endScholarVid): join terminal waveKillLog w>=4
// entries against the daily census. Returns { rows, unexplained,
// instrumentErrors }. Each row:
//   { day, mid, by, byName, via, wave, bearerAtKill, censusScholar,
//     ctxScholar (killdisc exact kill-time, may be null), censusMismatch,
//     killTimeScholar (bool), endRunScholar (bool), flipped (bool) }
function attributeKills(Game, t, endScholarVid) {
  const rows = [];
  const unexplained = [];
  try {
    const wkl = (((Game.state || {}).waveKillLog) || []).slice();
    // Index killdisc kill rows by day|mid|by for the exact kill-time
    // cross-check.
    const kidx = {};
    try {
      for (const k of (t.kills || [])) {
        const key = k.day + '|' + k.mid + '|' + (k.by || '');
        if (!kidx[key]) kidx[key] = k;
      }
    } catch (e) { err(t, 'attributeKills.kidx', e); }
    for (const e of wkl) {
      if (!e || typeof e !== 'object') continue;
      const day = e.d, mid = e.mid, by = e.by || null, via = e.via || 'unknown';
      const wave = resolveWave(Game, e);
      const cens = (t.bearerByDay && t.bearerByDay[day]) || null;
      const bearerAtKill = cens ? (cens.scholar || null) : null;
      const krow = kidx[day + '|' + mid + '|' + (by || '')] || null;
      const ctxScholar = (krow && krow.ctx && krow.ctx.scholarVid) || null;
      const instrWave = krow ? ((krow.wave | 0) || 0) : 0;
      // Unresolvable wave is an honest residual even when the entry would
      // otherwise be filtered — record it BEFORE the wave<4 skip, or it
      // goes silent.
      if (wave === 0 && instrWave === 0) {
        unexplained.push({ day, mid, by, via, reason: 'unresolvable-wave' });
        continue;
      }
      const effWave = wave > 0 ? wave : instrWave;
      if (effWave < 4) continue;
      if (!bearerAtKill && !ctxScholar) {
        unexplained.push({ day, mid, by, via, reason: 'no-census-for-day' });
        continue;
      }
      // Authority: the exact kill-time capture when present; else the daily
      // census. Flag disagreement.
      const censusMismatch = !!(bearerAtKill && ctxScholar && bearerAtKill !== ctxScholar);
      const authScholar = ctxScholar || bearerAtKill;
      const killTimeScholar = (by === 'player') || (by != null && by === authScholar);
      const endRunScholar = (by === 'player') || (by != null && by === endScholarVid);
      rows.push({
        day, mid, by, byName: nameOf(Game, by), via, wave: effWave,
        bearerAtKill: authScholar, censusScholar: bearerAtKill, ctxScholar,
        censusMismatch, killTimeScholar, endRunScholar,
        flipped: killTimeScholar !== endRunScholar,
        viaDisagrees: (via === 'player') !== killTimeScholar,
      });
    }
  } catch (e) { err(t, 'attributeKills', e); }
  return { rows, unexplained, instrumentErrors: t.instrumentErrors.slice() };
}

// correctionReport(attribution): end-of-run vs kill-time counts, deltas, and
// corrected veteran-channel primaries.
function correctionReport(attr) {
  const rows = (attr && attr.rows) || [];
  let endScholar = 0, endVillager = 0, ktScholar = 0, ktVillager = 0;
  const deltas = [];
  const villagers = new Set();
  for (const r of rows) {
    if (r.endRunScholar) endScholar++; else endVillager++;
    if (r.killTimeScholar) ktScholar++; else { ktVillager++; if (r.by) villagers.add(r.by); }
    if (r.flipped) deltas.push({
      day: r.day, mid: r.mid, by: r.by, byName: r.byName, via: r.via,
      before: r.endRunScholar ? 'scholar' : 'villager',
      after: r.killTimeScholar ? 'scholar' : 'villager',
      censusScholar: r.censusScholar, ctxScholar: r.ctxScholar,
      censusMismatch: !!r.censusMismatch,
    });
  }
  return {
    kills: rows.length,
    endOfRun: { scholar: endScholar, villager: endVillager },
    killTime: { scholar: ktScholar, villager: ktVillager, distinctVillagers: villagers.size },
    deltas,
    unexplained: (attr && attr.unexplained) || [],
  };
}

module.exports = { install, attributeKills, correctionReport, nameOf, resolveWave };
