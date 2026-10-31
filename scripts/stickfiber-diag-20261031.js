#!/usr/bin/env node
// stickfiber-diag-20261031.js — producer-counter instrument for
// sim-stickfiber-b. MEASUREMENT ONLY. Env-gated on STICKFIBERDIAG=1.
// Installs ON TOP of ammo-diag + supply-diag (install those first).
// It counts calls to the Game-level routines that can move stick or
// fiber, without changing any of them:
//   addMaterial(mat,n)  — SCHOLAR inventory only (storage.js); a
//     stick/fiber count here is a scholar-side gain, NOT pile
//     production. The pile verdict rests on the daily pile series.
//   donateMaterial(mat,n) — the ONLY scholar->pile path (UI only).
//   inviteReward(vid)   — the betrayal +4 wood/+4 fiber bundle path;
//     counted by returned kind === 'bundle'.
//   craft(recipeId)     — scholar crafting; arrow/bolt counts only.
// Pile writes that are inline code (stone duty, inflow wrap, skim)
// cannot be wrapped as methods; they are caught by the daily pile
// diff in the analyzer (supplyDaily rows) and by pocket-call pile
// deltas. No wrapper draws RNG, writes game state, or changes a
// return value. Every catch reports into t.stickfiberErrors.
'use strict';

function instrumentOn() { return process.env.STICKFIBERDIAG === '1'; }

function err(t, where, e) {
  try { t.stickfiberErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Cumulative producer counters, snapshotted by scanDay.
function counters(t) {
  t.sfCounters = t.sfCounters || {
    addStick: 0, addFiber: 0, donateStick: 0, donateFiber: 0,
    inviteBundle: 0, craftArrow: 0, craftBolt: 0,
  };
  return t.sfCounters;
}

function install(Game, t) {
  t.stickfiberRows = t.stickfiberRows || [];
  t.stickfiberErrors = t.stickfiberErrors || [];
  const c = counters(t);
  const wrapped = [];
  function wrap(name, onCall) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.stickfiberErrors.push('wrap-missing:' + name); return; }
      Game[name] = function () {
        let r;
        try { r = orig.apply(this, arguments); } catch (e) { throw e; }
        try { onCall(arguments, r); } catch (e) { err(t, 'wrap-' + name, e); }
        return r;
      };
      wrapped.push([name, orig]);
    } catch (e) { err(t, 'wrap-' + name, e); }
  }
  wrap('addMaterial', (args) => {
    if (args[0] === 'stick') c.addStick += Math.max(0, Math.floor(args[1] || 0));
    if (args[0] === 'fiber') c.addFiber += Math.max(0, Math.floor(args[1] || 0));
  });
  wrap('donateMaterial', (args) => {
    if (args[0] === 'stick') c.donateStick += Math.max(0, Math.floor(args[1] || 0));
    if (args[0] === 'fiber') c.donateFiber += Math.max(0, Math.floor(args[1] || 0));
  });
  wrap('inviteReward', (args, r) => {
    if (r && r.kind === 'bundle') c.inviteBundle += 1;
  });
  wrap('craft', (args) => {
    if (args[0] === 'arrow') c.craftArrow += 1;
    if (args[0] === 'bolt') c.craftBolt += 1;
  });
  return function uninstall() {
    for (const [name, orig] of wrapped) { try { Game[name] = orig; } catch (e) {} }
  };
}

// scanDay(Game, t): read-only daily snapshot of the cumulative
// producer counters, called from the sweep's daily hook. ALSO
// snapshots the scholar's own pack stick/fiber totals — the main
// scholar forage paths push to scholar.inventory DIRECTLY (game.js
// sweep: stick per tree cell, fiber per deadfall), bypassing
// addMaterial entirely, so counters alone would miss scholar-side
// production. The pile verdict rests on the pile series; the
// scholar-pack series answers "did ANYONE produce a stick/fiber".
function scholarInvTotals(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    let stick = 0, fiber = 0;
    for (const e of inv) {
      if (e && e.material === 'stick') stick += (e.units || 1);
      if (e && e.material === 'fiber') fiber += (e.units || 1);
    }
    return { stick, fiber };
  } catch (e) { return { stick: null, fiber: null }; }
}

function scanDay(Game, t) {
  try {
    const c = counters(t);
    const si = scholarInvTotals(Game);
    t.stickfiberRows.push(Object.assign({ day: gday(Game), scholarStick: si.stick, scholarFiber: si.fiber }, c));
  } catch (e) { err(t, 'scanDay', e); }
}

module.exports = { instrumentOn, install, scanDay };
