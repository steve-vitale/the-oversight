// wavegate-diag — the wave-unlock gate decomposition recorder
// (sim-wavegate-a, 2026-10-31, flesh-out loop, axis scale-onramp).
//
// THE QUESTION (backlog item 2 from sim-heraldcontact-a): 3/8 pilot
// villages reached national at wave 2-3 and never unlocked wave 4,
// so the Herald omen never started. WHAT gates wave unlock on the
// win-pursuit stack, seed by seed — and is national-without-wave-4
// the normal road or a stall?
//
// This layer decomposes the wave-4/5 unlock gate into its EXACT
// components (src/js/game.js unlockedWave + src/js/standing.js
// villageStandingTotal/waveCombatReadiness — the code is
// authoritative, not docs) and records one compact row per day.
//
// PURE-READ instrument (WAVEGATE=1; unset delegates to the wrapped
// policy byte-identically): every daily, AFTER delegating inward,
// it snapshots the engine's OWN gate inputs and records the
// derived gated total / unlocked wave. It writes NOTHING to game
// state and draws NO RNG.
//
// DELIBERATE NON-CALLS (see prereg): the recorder does NOT call
// villageStandingTotal() or unlockedWave() mid-run — both can
// write state / fire beats (peak release, hold beats). The base
// stack's fullseat-diag snap already calls both daily, so the
// engine's own gated number is already computed each day by the
// base stack; this recorder DERIVES the same numbers from pure
// components with the exact code logic (deriveWavegate, below)
// and the sweep cross-checks the derived final unlocked wave
// against ONE post-run unlockedWave() call (trajectory-free).
//
// SAY CAPTURE: installSayCapture wraps Game.sysSay ONLY to record
// hold/release beat lines (filtered substrings), calling through
// to the original with identical arguments. It writes nothing to
// game state and draws no RNG. Install after loadGame, remove
// after the run (uninstallSayCapture restores the original).
//
// COMPOSE UPON (never edit): tribfloor, windefer, seatdrive,
// fullseat-diag — this layer wraps OUTSIDE them.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

function layerOn() { return process.env.WAVEGATE === '1'; }

const HOLD_BEAT_NEEDLES = ['next act', 'fifth draft', 'RATINGS ARE UP', 'not bought with bread'];

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// deriveWavegate: mirror of standing.js villageStandingTotal() WITHOUT
// side effects (no peak write, no beats) + game.js unlockedWave()
// WITHOUT its villageStandingTotal() call. Inputs are all pure reads.
// Returns { raw, capped, gated, peak, floor, holds, binding, w3rung,
// unlockedWave }.
function deriveWavegate(inp) {
  const raw = n0(inp.raw), capped = n0(inp.capped);
  const t4 = (inp.t4 | 0) || 100, t5 = (inp.t5 | 0) || 200;
  const peak = n0(inp.peak);
  const holds = [];
  if (raw >= t5 && capped < t5 && peak < 5) holds.push({ kind: 'cap', bound: t5 - 1 });
  if (raw >= t4 && !inp.rd4ready && peak < 4) holds.push({ kind: 'defer4', bound: t4 - 1 });
  if (capped >= t5 && !inp.rd5ready && peak < 5) holds.push({ kind: 'defer5', bound: t5 - 1 });
  let gated = raw, minBound = Infinity;
  for (const h of holds) { if (h.bound < gated) gated = h.bound; if (h.bound < minBound) minBound = h.bound; }
  const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
  const ratcheted = gated < floor;
  if (floor > gated) gated = floor;
  const binding = (minBound < raw) ? holds.filter(h => h.bound === minBound).map(h => h.kind) : [];
  let holdLabel;
  if (ratcheted) holdLabel = peak >= 5 ? 'ratchet5' : 'ratchet4';
  else if (binding.length) holdLabel = binding.join('+');
  else if (gated >= t5) holdLabel = 'released5';
  else if (gated >= t4) holdLabel = 'released4';
  else holdLabel = 'below';
  // unlockedWave mirror (game.js): w3 rung + gated + w4-faced.
  const day = n0(inp.day), d2 = (inp.d2 | 0) || 8, dN = (inp.dN | 0) || 25;
  const bar1 = (inp.bar1 | 0) || 5, bar2 = (inp.bar2 | 0) || 4;
  const p1 = n0(inp.p1), p2 = n0(inp.p2);
  const w3rung = day >= dN && p2 >= bar2;
  let uw;
  if (w3rung && gated >= t5 && inp.w4faced) uw = 5;
  else if (w3rung && gated >= t4) uw = 4;
  else if (w3rung) uw = 3;
  else if (day >= d2 && p1 >= bar1) uw = 2;
  else uw = 1;
  return { raw, capped, gated, peak, floor, holds: holds.map(h => h.kind), binding, holdLabel, w3rung, unlockedWave: uw };
}

function copyRd(rd) {
  if (!rd) return { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, short: ['read-error'], demand: null };
  const dem = rd.demand || null;
  return {
    ready: !!rd.ready, armored: n0(rd.armored), armed: n0(rd.armed),
    tricks: n0(rd.tricks), veterans: n0(rd.veterans),
    short: Array.isArray(rd.short) ? rd.short.slice() : [],
    demand: dem ? {
      armored: n0(dem.armored), armorP: n0(dem.armorP), armed: n0(dem.armed),
      tricks: n0(dem.tricks), veterans: n0(dem.veterans),
    } : null,
  };
}

function snapWavegate(Game) {
  const row = { day: dayOf(Game), errs: [] };
  try {
    row.rank = (typeof Game.scaleRank === 'function') ? String(Game.scaleRank()) : 'village';
  } catch (e) { row.rank = 'village'; row.errs.push('scaleRank'); }
  let vs = null, cfg = null, wl = null;
  try { vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; } catch (e) { row.errs.push('villageStanding'); }
  try { cfg = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null; } catch (e) { row.errs.push('standingCfg'); }
  try { wl = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null; } catch (e) { row.errs.push('waveLedgerCfg'); }
  const t4 = (cfg && (cfg.t4 | 0)) || 100, t5 = (cfg && (cfg.t5 | 0)) || 200;
  const capT5 = (cfg && (cfg.plentyCapT5 | 0)) || 100;
  const war = vs ? n0(vs.war) : 0, dip = vs ? n0(vs.diplomacy) : 0, plenty = vs ? n0(vs.plenty) : 0;
  row.war = war; row.dip = dip; row.plenty = plenty;
  row.warPts = vs ? n0(vs.warPts) : 0; row.links = vs ? n0(vs.links) : 0; row.feasts = vs ? n0(vs.feasts) : 0;
  row.raw = vs ? n0(vs.total) : 0;
  row.capped = war + dip + Math.min(plenty, capT5);
  row.t4 = t4; row.t5 = t5;
  const bars = (wl && wl.barsPerWave) || {};
  row.bar1 = (bars[1] | 0) || 5; row.bar2 = (bars[2] | 0) || 4;
  row.d2 = (wl && wl.wave2DayFloor != null) ? (wl.wave2DayFloor | 0) : 8;
  row.dN = (wl && wl.dayFloor != null) ? (wl.dayFloor | 0) : 25;
  row.p1 = 0; row.p2 = 0; row.p3 = 0; row.p4 = 0; row.p5 = 0;
  try {
    for (let w = 1; w <= 5; w++) {
      if (typeof Game.waveLedgerPoints === 'function') row['p' + w] = Game.waveLedgerPoints(w) | 0;
    }
  } catch (e) { row.errs.push('waveLedgerPoints'); }
  try { row.rd4 = copyRd(Game.waveCombatReadiness(4)); } catch (e) { row.rd4 = copyRd(null); row.errs.push('rd4'); }
  try { row.rd5 = copyRd(Game.waveCombatReadiness(5)); } catch (e) { row.rd5 = copyRd(null); row.errs.push('rd5'); }
  try { row.peak = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : 0; } catch (e) { row.peak = 0; row.errs.push('peak'); }
  try { row.w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) > 0) : false; } catch (e) { row.w4faced = false; row.errs.push('w4faced'); }
  const dv = deriveWavegate({
    raw: row.raw, capped: row.capped, peak: row.peak,
    rd4ready: row.rd4.ready, rd5ready: row.rd5.ready, t4, t5,
    day: row.day, d2: row.d2, dN: row.dN, bar1: row.bar1, bar2: row.bar2,
    p1: row.p1, p2: row.p2, w4faced: row.w4faced,
  });
  row.gated = dv.gated; row.hold = dv.holdLabel; row.holds = dv.holds; row.binding = dv.binding;
  row.w3rung = dv.w3rung; row.uw = dv.unlockedWave;
  row.w3dayShort = row.day < row.dN ? (row.dN - row.day) : 0;
  row.w3barShort = Math.max(0, row.bar2 - row.p2);
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : null;
    row.tableWaiting = !!(pg && pg.tableWaiting); row.tableDone = !!(pg && pg.tableDone);
  } catch (e) { row.tableWaiting = false; row.tableDone = false; row.errs.push('progState'); }
  try { row.won = !!Game.won; } catch (e) { row.won = false; }
  try {
    const tit = (Game.state || {}).titans || {};
    const om = tit.omens ? tit.omens.herald : null;
    row.omenStage = om ? (om.stage != null ? (om.stage | 0) : null) : null;
  } catch (e) { row.omenStage = null; }
  return row;
}

function newStore() {
  return { rows: [], beats: [], errs: 0, installed: false, origSysSay: null };
}

function installSayCapture(Game, store) {
  if (!Game || store.installed) return;
  try {
    const orig = Game.sysSay;
    if (typeof orig !== 'function') return;
    store.origSysSay = orig;
    const wrapped = function () {
      try {
        const line = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
        if (HOLD_BEAT_NEEDLES.some(n => line.indexOf(n) >= 0)) {
          store.beats.push({ day: dayOf(Game), line });
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    Game.sysSay = wrapped;
    store.installed = true;
  } catch (e) {}
}

function uninstallSayCapture(Game, store) {
  try {
    if (store && store.installed && Game && store.origSysSay) Game.sysSay = store.origSysSay;
  } catch (e) {}
  if (store) store.installed = false;
}

function withWavegateDiag(inner, id, desc) {
  const store = newStore();
  const wrapped = Object.assign({}, inner, {
    id, desc, wavegateStore: store,
    daily(Game, ctx) {
      const r = inner.daily(Game, ctx);
      if (layerOn()) {
        try {
          const row = snapWavegate(Game);
          store.rows.push(row);
          if (row.errs.length) store.errs += row.errs.length;
        } catch (e) { store.errs += 1; }
      }
      return r;
    },
  });
  return wrapped;
}

module.exports = {
  layerOn, withWavegateDiag, snapWavegate, deriveWavegate, copyRd,
  newStore, installSayCapture, uninstallSayCapture, HOLD_BEAT_NEEDLES,
};
