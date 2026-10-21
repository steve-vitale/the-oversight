#!/usr/bin/env node
// windowreach-instrument-20261021.js — post-unlock-window observation layer
// (flesh-out loop arm sim-windowreach-r2, run fleshout-20261021T0730Z, axis
// scale-onramp). INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero
// scripts/policies changes.
//
// CONTEXT: sim-vgearconfirm proved the veteran channel fires on the VGEAR=1
// winning substrate (2/16 armed seeds reach w5vetsMax>=2, 1 wave-5 unlock);
// sim-w5gates decomposed the unlock gate (16/16 attributed). The measured
// unlock (belongfeast s64406, d97) died d170 in the window — the unlock did
// not save the village. Nobody has measured what happens IN the window on
// the winning substrate. This re-derives the dead run's sim-windowreach arm
// (worker died pre-sweep; pre-registration survives, code lost).
//
// LAYER: installed ON TOP of the killdisc v2 base
// (scripts/killdisc-instrument-20261021.js, on master, proven non-perturbing).
// install(Game, t) calls the killdisc install first, then wraps Game.sleep a
// second time (outer) to capture the daily window trace. uninstall restores
// the outer wrap, then the killdisc uninstall restores the original.
//
// ALL READS ARE PURE: villageStanding().total (raw), standingPlentyCappedTotal
// (capped), unlockedWave(), waveEngaged(4/5), waveCombatReadiness(4/5) bars,
// deed-state faces, roster via Game.getPerson(id).dead. The game's one-way
// peak (state._standingPeakWave) is a WAVE number, so "peak" here is the
// instrument-observed max of raw/capped across the daily trace — tracked in
// the trace object itself (t._wrPeak), never written to Game.state. The beat
// firing villageStandingTotal() is deliberately NEVER called — the DET gate
// pins instrument-on vs instrument-off byte-identical trajectories.
//
// Determinism: zero RNG draws, zero Date.now (fight ids stay in-run keys,
// never persisted), no timestamps in the trace. The sweep's per-seed JSON is
// re-run byte-identical.
//
// t = the killdisc trace object extended with:
//   window: per-day {day, uw, prevUw, unlocked, raw, capped, peakRaw,
//     peakCapped, r4, r5, w4faced, w5faced, veterans5, living, dead,
//     unknown, scholarAlive}
//   unlocked: null | 4 | 5 — the wave whose door first opened on that day.
//   r4/r5: {armored, armed, tricks, veterans, short, ready} from
//     waveCombatReadiness(4/5); veterans5 = r5.veterans (living wave-4+
//     killers — the VGEAR veteran channel read).
//   w4faced/w5faced: deedState().wavesFaced distinct-mid counts
//     (blow-by-blow; fleeing counts; villager + scholar deduped by type).
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

// captureWindow(Game, t): one daily window-trace entry. Pure reads; the only
// writes are appends to t.window and t._wrPeak (instrument-local).
function captureWindow(Game, t, prevUw) {
  const day = gday(Game);
  let uw = 1;
  try { uw = i0(Game.unlockedWave ? Game.unlockedWave() : 1); } catch (e) { err(t, 'unlockedWave', e); uw = -1; }
  let raw = -1, capped = -1;
  try { const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; raw = i0(vs && vs.total); } catch (e) { err(t, 'raw', e); }
  try { capped = i0(typeof Game.standingPlentyCappedTotal === 'function' ? Game.standingPlentyCappedTotal() : -1); } catch (e) { err(t, 'capped', e); }
  if (!t._wrPeak) t._wrPeak = { raw: -1, capped: -1 };
  if (raw > t._wrPeak.raw) t._wrPeak.raw = raw;
  if (capped > t._wrPeak.capped) t._wrPeak.capped = capped;
  const r4 = rdBars(Game, 4, t);
  const r5 = rdBars(Game, 5, t);
  let w4faced = -1, w5faced = -1;
  try { w4faced = i0(typeof Game.waveEngaged === 'function' ? Game.waveEngaged(4) : -1); } catch (e) { err(t, 'w4faced', e); }
  try { w5faced = i0(typeof Game.waveEngaged === 'function' ? Game.waveEngaged(5) : -1); } catch (e) { err(t, 'w5faced', e); }
  const roster = rosterRead(Game, t);
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
  };
  t.window.push(entry);
  return uw;
}

// installWindowLayer(Game, t): the outer Game.sleep wrap only (no killdisc
// base). Exported for synthetic-fixture tests; install() composes both.
function installWindowLayer(Game, t) {
  if (!Array.isArray(t.window)) t.window = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
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

module.exports = { instrumentOn, install, installWindowLayer, captureWindow, rdBars, rosterRead };
