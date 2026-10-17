#!/usr/bin/env node
// scripts/policies/perturbdawn.js — DIAGNOSTIC INSTRUMENT ONLY (sim-shellharm-b).
//
// The neutral perturbation probe. Identical gates to the killed shellcounter
// layer (PERTURBDAWN=1 default OFF; scholar alive; no tbfight; no active
// contest; lean day; at Haven stores; in-shell nuts on the prep-stash counter;
// dayTicks + 4 + 64 < TICKS_PER_DAY; once per day), but the beat moves NO food:
// no shelling, no put-away, no kcal change. The scholar takes stock of the
// counter and defers — a real human beat that costs the same 4 ticks the
// shelling cost (tickAction(4) inside), crossing the same 32-tick NPC-batch
// and day-part boundaries.
//
// This isolates the "4-tick dawn perturbation" timing vector from the food
// channel. If perturb-armed vs control replicates the shell-arm's collapse
// re-timing / starvation shift on the famine-prone seeds, the harm model is
// chaotic re-timing, not shelling. If it does not, the residual is food-side
// (shelled-kcal addition and/or the pantry item reorder from putAwayFinished),
// which this probe deliberately cannot replicate.
'use strict';

function perturbOn() { return process.env.PERTURBDAWN === '1'; }

function leanDay(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return (s.kcal || 0) < (Game.kcalCap() * 0.5);
  } catch (e) { return false; }
}

function timeToSpare(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const TPD = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
    return (s.dayTicks || 0) + 4 + 64 < TPD;
  } catch (e) { return false; }
}

function atHavenStores(Game) {
  try { return Game.havenStoresAccess() !== 'none'; } catch (e) { return false; }
}

function counterNuts(Game) {
  try {
    return (Game.prepStash() || []).filter(
      i => i && i.foodKind === 'nut' && i.foodState === 'in_shell');
  } catch (e) { return []; }
}

function perturbBeat(Game, ctx) {
  if (!perturbOn()) return;
  try {
    const s = (Game.state || {}).scholar || {};
    if (!s || s.over) return;
    if (Game.tbfight) return;
    if (Game.state && Game.state.activeContest) return;
    if (!leanDay(Game)) return;
    if (!atHavenStores(Game)) return;
    if (!counterNuts(Game).length) return;   // same schedule as the shell arm
    if (!timeToSpare(Game)) return;
    const day = s.day || 0;
    if (ctx._pdPerturbDay === day) return;    // once per day
    // The neutral 4 ticks: time passes, the world moves, no food changes hands.
    Game.tickAction(4);
    Game.say('You take stock of the counter — the nut lots are piled, the clock is ticking. Not today. (4 ticks)');
    ctx._pdPerturbDay = day;
    ctx._pdPerturbDays = (ctx._pdPerturbDays || 0) + 1;
  } catch (e) { /* an instrument never crashes a sim */ }
}

function withPerturbDawn(base, pid, tag) {
  const id = pid || ((base && base.id) || 'base') + '+perturbdawn';
  const wrapped = Object.assign({}, base);
  wrapped.id = id;
  const oUpkeep = base && base.upkeep;
  wrapped.upkeep = (Game, ctx) => {
    perturbBeat(Game, ctx);
    if (oUpkeep) return oUpkeep(Game, ctx);
  };
  return wrapped;
}

module.exports = {
  withPerturbDawn, counterNuts, leanDay, timeToSpare, atHavenStores, perturbOn,
};
