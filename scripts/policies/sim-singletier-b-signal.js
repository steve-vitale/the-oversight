// sim-singletier-b-signal — SINGLE-TIER foreign-help policy: signal only
// (flesh-out loop arm sim-singletier-b, axis scale-onramp, parent run
// fleshout-20261024T1215Z). POLICY-SIDE ONLY — zero src/js changes.
//
// PURPOSE: the single-tier comparison prescribed by sim-foreignhelp-b
// (evidence/2026-10-24/sim-foreignhelp-b.md): callall proved the comms
// chain is policy-reachable, but callall is a maximal probe with probe
// artifacts (signal+system double-ask producing two parties with
// identical faces; every signal call raises attracted and blocks fleeing).
// This file is the signal tier: on the first daily tick that sees a
// crisis with no call placed yet, it calls 'signal' once — and nothing
// else (no runner, no system, no cry).
//
// COSTS ARE REAL: the signal fire raises crisis.attracted (+1, draws
// company, blocks fleeing while it holds) and nudges hostile known
// villages -5 opinion. Those costs are measured, not hidden: the sweep
// instrument records calls, asks, arrivals, and crises with attracted>0.
//
// GATE: SIMSINGTIER_SIGNAL=1, default OFF. Gate-off is pure delegation
// (base.daily only), so the signal sweep differs from baseline by exactly
// this driver.
'use strict';

function layerOn() { return process.env.SIMSINGTIER_SIGNAL === '1'; }
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function driveSignal(Game, ctx) {
  ctx = ctx || {};
  let crisis = null;
  try { crisis = (typeof Game.aidCrisis === 'function') ? Game.aidCrisis() : null; } catch (e) {}
  if (!crisis) { ctx.stNoCrisis = (ctx.stNoCrisis | 0) + 1; return; }
  const key = String(crisis.sinceDay) + '|' + String(crisis.name || '');
  if (ctx.stKey !== key) { ctx.stKey = key; ctx.stCalled = false; }
  if (ctx.stCalled) return;
  try {
    let ret = null;
    try { ret = (typeof Game.callForHelp === 'function') ? Game.callForHelp('signal') : 'no-verb'; } catch (e) { ret = 'error'; }
    try {
      Game.state.stSingle = Game.state.stSingle || { calls: [] };
      Game.state.stSingle.calls.push({ day: gday(Game), tier: 'signal', ret: ret == null ? 'null' : String(ret) });
    } catch (e) {}
    ctx.stCalled = true;
    ctx.stPlacements = (ctx.stPlacements | 0) + 1;
  } catch (e) { ctx.stDriveError = (ctx.stDriveError | 0) + 1; }
}

function withSignal(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx);
      try { driveSignal(Game, ctx); } catch (e) { ctx.stDriveError = (ctx.stDriveError | 0) + 1; }
      return base.daily(Game, ctx);
    },
  });
}

module.exports = { layerOn, driveSignal, withSignal };
