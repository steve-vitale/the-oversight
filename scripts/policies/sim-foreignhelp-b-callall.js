// sim-foreignhelp-b-callall — FOREIGN-HELP PROBE policy (flesh-out loop arm
// sim-foreignhelp-b, axis scale-onramp, run fleshout-20261024T0925Z,
// backlog #872). POLICY-SIDE ONLY — zero src/js changes.
//
// PURPOSE: a maximal-call probe, NOT a proposed landing. Phase 1 (baseline)
// measures what competent policies do (expected: never call). Phase 2 asks
// whether ANY policy-side calling produces arrivals at all: on the first
// daily tick that sees a crisis with no call placed yet, this driver calls
// ALL FOUR tiers it can (runner, then signal, then system if stage 2+,
// then cry if a cry ability is held), once per tier per crisis. If arrivals
// appear, the chain is policy-reachable and the per-tier arrival split
// names which tier carries them; if arrivals stay zero under maximal
// calling, the gate is engine-side (links/trust/score/crisis-window) and
// the DIAG verdict stands with teeth.
//
// COSTS ARE REAL AND DOCUMENTED, not hidden: the signal fire raises
// crisis.attracted (+1, draws company, blocks fleeing while it holds) and
// nudges hostile known villages -5 opinion; the runner can die on the
// road; the system relay costs a favor owed. This probe spends those
// costs deliberately to measure the chain's ceiling. Do NOT land this
// policy as competent play without a separate cost/benefit arm.
//
// GATE: SIMFOREIGNHELP_CALLALL=1, default OFF. Gate-off is pure
// delegation (base.daily only), so the baseline sweep and the probe sweep
// differ by exactly this driver.
'use strict';

function layerOn() { return process.env.SIMFOREIGNHELP_CALLALL === '1'; }
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function driveCallAll(Game, ctx) {
  ctx = ctx || {};
  let crisis = null;
  try { crisis = (typeof Game.aidCrisis === 'function') ? Game.aidCrisis() : null; } catch (e) {}
  if (!crisis) { ctx.fhNoCrisis = (ctx.fhNoCrisis | 0) + 1; return; }
  const key = String(crisis.sinceDay) + '|' + String(crisis.name || '');
  if (ctx.fhKey !== key) { ctx.fhKey = key; ctx.fhTiers = {}; }
  const tiers = ctx.fhTiers;
  const placed = [];
  const call = (tier, opts) => {
    let ret = null;
    try { ret = (typeof Game.callForHelp === 'function') ? Game.callForHelp(tier, opts || {}) : 'no-verb'; } catch (e) { ret = 'error'; }
    placed.push({ day: gday(Game), tier, ret: ret == null ? 'null' : String(ret) });
    tiers[tier] = true;
  };
  try {
    // Runner first: signal raises attracted, and at attracted>=2 no runner
    // volunteers (comms.js aidRoadHot) — runner must go before the fire.
    if (!tiers.runner) call('runner');
    if (!tiers.signal) call('signal');
    let stage = 0;
    try { stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
    if (!tiers.system && stage >= 2) call('system');
    let cries = [];
    try { cries = Game.aidCryAbilities ? Game.aidCryAbilities() : []; } catch (e) {}
    if (!tiers.cry && cries.length) call('cry', { abilityId: cries[0].id });
    try {
      Game.state.fhProbe = Game.state.fhProbe || { calls: [] };
      for (const p of placed) Game.state.fhProbe.calls.push(p);
    } catch (e) {}
    ctx.fhPlacements = (ctx.fhPlacements | 0) + placed.length;
  } catch (e) { ctx.fhDriveError = (ctx.fhDriveError | 0) + 1; }
}

function withCallAll(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx);
      try { driveCallAll(Game, ctx); } catch (e) { ctx.fhDriveError = (ctx.fhDriveError | 0) + 1; }
      return base.daily(Game, ctx);
    },
  });
}

module.exports = { layerOn, driveCallAll, withCallAll };
