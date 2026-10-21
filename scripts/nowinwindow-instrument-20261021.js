#!/usr/bin/env node
// nowinwindow-instrument-20261021.js — post-INVITATION-window observation
// layer (flesh-out loop arm sim-nowinwindow, axis scale-onramp, backlog
// #748's named next).
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes. The no-win POLICY layer
// (scripts/policies/nowinwindow.js) is a separate new file — this instrument
// only READS.
//
// CONTEXT: sim-windowreach-r3 (DIAG-insufficient-data) showed the wave-5
// door is a lagging indicator of wins — 4 measured unlocks, all won through
// the window without fighting wave-5, the win truncating every measurement
// at ~d90-130. This arm runs the vgearconfirm winning substrate with the
// seat REFUSED (NOWINWINDOW=1) so the post-invitation window runs to the
// 180d horizon instead of truncating at the win.
//
// LAYER: copied from scripts/windowreach-r3-instrument-20261021.js (NOT
// modified) — the r3 window layer on top of the killdisc v2 base (also NOT
// modified, proven non-perturbing). install(Game, t) calls the killdisc
// install first, then wraps Game.sleep a second time (outer) to capture the
// daily window trace.
//
// DELTAS vs the r3 instrument:
//   - each window entry gains `invite` (tablePreview() non-null — the table
//     is announced/waiting), `inviteReady` (pv.ready — the seat could be
//     taken; the layer declines it), `inviteSeat` (the priced seat kind),
//     and `exiled` (scholar.exiled — backlog #760 remainder: the vgear/
//     twovets/r3 instruments never recorded it; everExiled is derived).
//   - the trace tracks `firstInviteDay` (first day inviteReady — the start
//     of the post-invitation window the PRIMARY metric judges) alongside
//     the existing _wrPeak.
//   - everything else is r3-identical: rank/maxRank ladder, r4/r5 readiness
//     bars, w4faced/w5faced, roster, unlock detection. The beat-firing
//     villageStandingTotal() is deliberately NEVER called.
//
// ALL READS ARE PURE. tablePreview() is a pure recompute (table.js:762 —
// no beats, no saves, no state writes; the substrate's own seatdrive calls
// it daily anyway). Determinism: zero RNG draws, zero Date.now, no
// timestamps in the trace. The sweep's per-seed JSON is re-run
// byte-identical.
//
// t = the killdisc trace object extended with:
//   window: per-day {day, uw, prevUw, unlocked, raw, capped, peakRaw,
//     peakCapped, r4, r5, w4faced, w5faced, veterans5, living, dead,
//     unknown, scholarAlive, rank, maxRank, invite, inviteReady, inviteSeat,
//     exiled}
//   firstInviteDay: the first day inviteReady was seen (null if never).
//   unlocked: null | 4 | 5 — the wave whose door first opened on that day.
// Every catch reports into t.instrumentErrors with a 'window.' prefix — the
// PRIMARY gate counts 0 instrumentErrors across the whole stack, so the
// window layer shares the killdisc error sink deliberately.
'use strict';
const KD = require('./killdisc-instrument-20261021');

function instrumentOn() { return KD.instrumentOn(); } // same gate: KILLDISC=1

function err(t, where, e) {
  try { t.instrumentErrors.push('window.' + where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function i0(x) { const n = +x; return Number.isFinite(n) ? (n | 0) : -1; }
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

// Rank ladder for maxRank tracking (hierarchy.js: scale_is_a_ladder —
// global implies national implies regional, never a skip).
const RANK_ORD = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
function rankOrd(r) { return (r != null && RANK_ORD[r] != null) ? RANK_ORD[r] : -1; }

function rankRead(Game, t) {
  try {
    const r = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null;
    return (typeof r === 'string' && r) ? r : 'unknown';
  } catch (e) { err(t, 'rank', e); return 'unknown'; }
}

// rdBars: the four named readiness bars, defensive (never throws).
function rdBars(Game, w, t) {
  try {
    const rd = (typeof Game.waveCombatReadiness === 'function') ? Game.waveCombatReadiness(w) : null;
    if (!rd) return { armored: -1, armed: -1, tricks: -1, veterans: -1, short: ['no-read'], ready: false };
    return {
      armored: i0(rd.armored), armed: i0(rd.armed), tricks: i0(rd.tricks), veterans: i0(rd.veterans),
      short: Array.isArray(rd.short) ? rd.short.slice() : [],
      ready: !!rd.ready,
    };
  } catch (e) { err(t, 'rdBars.' + w, e); return { armored: -1, armed: -1, tricks: -1, veterans: -1, short: ['read-error'], ready: false }; }
}

// rosterRead(Game, t): living/dead/unknown roster counts. Pure reads only.
function rosterRead(Game, t) {
  const out = { living: 0, dead: 0, unknown: 0, scholarAlive: true };
  try {
    const vv = (Game.state || {}).village || {};
    const roster = vv.roster || [];
    for (const id of roster) {
      try {
        const p = (typeof Game.getPerson === 'function') ? Game.getPerson(id) : null;
        if (!p) { out.unknown++; continue; }
        if (p.dead) out.dead++; else out.living++;
      } catch (e) { out.unknown++; }
    }
    try { out.scholarAlive = !(Game.state && Game.state.scholar && Game.state.scholar.dead); } catch (e) {}
  } catch (e) { err(t, 'rosterRead', e); }
  return out;
}

// inviteRead(Game, t): the table invitation state, pure reads.
// tablePreview() is a pure recompute (table.js:762); the substrate's own
// seatdrive driveSeat calls it every day, so this adds no new perturbation.
function inviteRead(Game, t) {
  const out = { invite: 0, inviteReady: 0, inviteSeat: null };
  try {
    if (typeof Game.tablePreview !== 'function') return out;
    const pv = Game.tablePreview();
    if (!pv) return out;
    out.invite = 1;
    if (pv.ready) { out.inviteReady = 1; out.inviteSeat = pv.seat || null; }
  } catch (e) { err(t, 'inviteRead', e); }
  return out;
}

// exiledRead(Game, t): scholar.exiled, pure read (#760 remainder).
function exiledRead(Game, t) {
  try { return !!(((Game.state || {}).scholar || {}).exiled); }
  catch (e) { err(t, 'exiledRead', e); return false; }
}

// captureWindow(Game, t): one daily window-trace entry. Pure reads; the only
// writes are appends to t.window and t._wrPeak (instrument-local).
function captureWindow(Game, t, prevUw) {
  const day = gday(Game);
  let uw = 1;
  try { uw = i0(Game.unlockedWave ? Game.unlockedWave() : 1); } catch (e) { err(t, 'unlockedWave', e); uw = -1; }
  let raw = -1, capped = -1;
  try { const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; raw = i0(vs && vs.total); } catch (e) { err(t, 'raw', e); }
  try { capped = i0(typeof Game.standingPlentyCappedTotal === 'function' ? Game.standingPlentyCappedTotal() : -1); } catch (e) { err(t, 'capped', e); }
  if (!t._wrPeak) t._wrPeak = { raw: -1, capped: -1, maxRank: 'village', maxRankOrd: -1 };
  if (raw > t._wrPeak.raw) t._wrPeak.raw = raw;
  if (capped > t._wrPeak.capped) t._wrPeak.capped = capped;
  const rank = rankRead(Game, t);
  const ro = rankOrd(rank);
  if (ro > t._wrPeak.maxRankOrd) { t._wrPeak.maxRankOrd = ro; t._wrPeak.maxRank = rank; }
  const r4 = rdBars(Game, 4, t);
  const r5 = rdBars(Game, 5, t);
  let w4faced = -1, w5faced = -1;
  try { w4faced = i0(typeof Game.waveEngaged === 'function' ? Game.waveEngaged(4) : -1); } catch (e) { err(t, 'w4faced', e); }
  try { w5faced = i0(typeof Game.waveEngaged === 'function' ? Game.waveEngaged(5) : -1); } catch (e) { err(t, 'w5faced', e); }
  const roster = rosterRead(Game, t);
  const inv = inviteRead(Game, t);
  const exiled = exiledRead(Game, t);
  if (inv.inviteReady && t.firstInviteDay == null) t.firstInviteDay = day;
  // Unlock detection: the first trace day the door is seen open at wave w.
  let unlocked = null;
  if (prevUw != null && prevUw >= 1 && uw > prevUw && uw >= 4) unlocked = uw;
  const entry = {
    day, uw, prevUw: prevUw == null ? null : prevUw, unlocked,
    raw, capped, peakRaw: t._wrPeak.raw, peakCapped: t._wrPeak.capped,
    r4, r5, w4faced, w5faced,
    veterans5: r5.veterans,
    living: roster.living, dead: roster.dead, rosterUnknown: roster.unknown,
    scholarAlive: roster.scholarAlive,
    rank, maxRank: t._wrPeak.maxRank,
    invite: inv.invite, inviteReady: inv.inviteReady, inviteSeat: inv.inviteSeat,
    exiled: exiled ? 1 : 0,
  };
  t.window.push(entry);
  return uw;
}

// installWindowLayer(Game, t): the outer Game.sleep wrap only (no killdisc
// base). Exported for synthetic-fixture tests; install() composes both.
function installWindowLayer(Game, t) {
  if (!Array.isArray(t.window)) t.window = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
  if (t.firstInviteDay == null) t.firstInviteDay = null;
  if (typeof Game.sleep !== 'function') { err(t, 'install.missing:sleep', new Error('not a function')); return function () {}; }
  const innerSleep = Game.sleep;
  let prevUw = null, firstDay = true;
  Game.sleep = function () {
    try { prevUw = captureWindow(Game, t, firstDay ? null : prevUw); firstDay = false; }
    catch (e) { err(t, 'sleep.capture', e); }
    return innerSleep.apply(this, arguments);
  };
  return function uninstallWindowLayer() {
    try { Game.sleep = innerSleep; } catch (e) {}
  };
}

// install(Game, t): killdisc v2 base first, then the window layer on top.
// Uninstall restores the outer (window) wrap first, then the killdisc base.
function install(Game, t) {
  if (!Array.isArray(t.window)) t.window = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
  const killUninstall = KD.install(Game, t);
  const windowUninstall = installWindowLayer(Game, t);
  return function uninstall() {
    try { windowUninstall(); } catch (e) {}
    try { killUninstall(); } catch (e) {}
  };
}

module.exports = { instrumentOn, install, installWindowLayer, captureWindow, rdBars, rosterRead, rankOrd, RANK_ORD, inviteRead, exiledRead };
