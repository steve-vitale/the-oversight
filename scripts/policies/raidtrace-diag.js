// raidtrace-diag — raid-window transcript recorder for
// sim-raidtrace-a (2026-10-27, flesh-out loop, axis scale-onramp).
// DIAG ONLY: zero src/js changes, policy-side only.
//
// WHAT IT RECORDS: every line through Game.emit (the single
// narration write path; emit pushes to Game.log and draws no
// RNG, touches no game state — verified by reading game.js
// emit before sweeping), with a running sequence index,
// scholar day, surface, and text (first 400 chars), plus the
// emit-index at each policy.daily tick
// (tickEmitIndex[scholarDay], recorded by the outermost daily
// wrapper AFTER the inner policy's daily work, so the index
// sits just after that day's tick snapshot).
//
// WHY EMIT-ONLY (not the postunlock sayRing): the sayRing
// keeps only the last 240 lines — a raid night in week 20 is
// long gone by day 180. This recorder keeps every line in
// memory during the run and, at end of run, retains ONLY
// the raid-window lines (see filterWindows) plus every
// 'RAID' line, plus per-day line counts and the
// tickEmitIndex map; everything else is discarded by that
// rule and the discard is counted, never hidden.
//
// OBSERVATIONAL ONLY. RAIDTRACE=1 is the only on-switch.
// Unset: install() installs NO wrap, sets NO flag, records
// NOTHING, and the daily wrapper records no index — the
// det-gate's "no wrap installed" check is therefore a real
// identity check, not a flag check. The wrapper calls the
// original emit with its original this/arguments and
// returns its value untouched; recording errors are counted
// and never thrown into the engine. It never calls
// villageStandingTotal() or unlockedWave() mid-run.
'use strict';

function layerOn() { try { return process.env.RAIDTRACE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    lines: [],
    tickEmitIndex: {},
    errs: 0, errors: [], installed: false, wrapped: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

// installRaidtraceDiag(Game, store): wraps Game.emit when the
// layer is on; returns an uninstall function. When the layer
// is OFF it returns a noop and touches nothing (no wrap, no
// flag) — this is what the det-gate checks.
function installRaidtraceDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (!layerOn()) return function () {};
  if (Game._raidtraceDiagWrapped) return function () {};
  const orig = Game.emit;
  if (typeof orig !== 'function') { noteErr(store, 'install.emit-missing', new Error('Game.emit not a function')); return function () {}; }
  try {
    Game.emit = function (text, surface) {
      try {
        store.lines.push({
          idx: store.lines.length,
          day: dayOf(this),
          surface: surface != null ? String(surface) : null,
          text: String(text == null ? '' : text).slice(0, 400),
        });
      } catch (e) { noteErr(store, 'emit.record', e); }
      return orig.apply(this, arguments);
    };
    Game._raidtraceDiagWrapped = true;
    Game._raidtraceDiagInstalled = true;
    store.installed = true;
    store.wrapped = true;
  } catch (e) { noteErr(store, 'install.wrap', e); return function () {}; }
  return function () {
    try { Game.emit = orig; } catch (e) {}
    try { Game._raidtraceDiagWrapped = false; Game._raidtraceDiagInstalled = false; } catch (e) {}
    store.installed = false; store.wrapped = false;
  };
}

function withRaidtraceDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { st.tickEmitIndex[dayOf(Game)] = st.lines.length; } catch (e) { noteErr(st, 'daily.index', e); }
        try { ctx._raidtrace = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// filterWindows(lines, tickEmitIndex, raidDays, tickDays):
// raidDays = [{raidDay, nextTickDay|null}]. Returns
// {windows: {raidDay: [lines]}, raidLines, palisadeRaidLines}.
// Window = UNION of (i) sequence interval
// (tickEmitIndex[raidDay], tickEmitIndex[nextTickDay]] (or
// end-of-lines when nextTickDay is null/unindexed) and
// (ii) lines with scholar day == raidDay or raidDay+1.
// Lines are deduplicated by idx and kept in idx order.
function filterWindows(lines, tickEmitIndex, raidDays) {
  const byIdx = new Map();
  for (const l of (lines || [])) byIdx.set(l.idx, l);
  const windows = {};
  for (const rd of (raidDays || [])) {
    const R = rd.raidDay;
    const kept = new Map();
    const lo = (tickEmitIndex && tickEmitIndex[R] != null) ? tickEmitIndex[R] : null;
    let hi = null;
    if (rd.nextTickDay != null && tickEmitIndex && tickEmitIndex[rd.nextTickDay] != null) hi = tickEmitIndex[rd.nextTickDay];
    else hi = (lines || []).length;
    if (lo != null) {
      for (const l of (lines || [])) {
        if (l.idx > lo && l.idx <= hi) kept.set(l.idx, l);
      }
    }
    for (const l of (lines || [])) {
      if (l.day === R || l.day === R + 1) kept.set(l.idx, l);
    }
    windows[R] = Array.from(kept.values()).sort((a, b) => a.idx - b.idx);
  }
  const raidLines = (lines || []).filter(l => /RAID/.test(l.text));
  const palisadeRaidLines = (lines || []).filter(l => /hit Haven/.test(l.text));
  return { windows, raidLines, palisadeRaidLines };
}

module.exports = { layerOn, newStore, installRaidtraceDiag, withRaidtraceDiag, filterWindows };
