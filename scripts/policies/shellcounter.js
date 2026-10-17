#!/usr/bin/env node
// scripts/policies/shellcounter.js — DIAGNOSTIC INSTRUMENT ONLY (sim-shellharm-b).
//
// Faithful reconstruction of the counter-shelling layer from the killed arm
// sim-shellcounter-b (evidence/2026-10-17/sim-shellcounter-b.md), resurrected
// as read-only instrumentation for the harm-model diagnostic. NEVER LAND THIS
// FILE — the arm was NO-GO on the starvation guardrail and killed zero-trace.
// The reconstruction is byte-behavior-faithful to the evidence description:
//   - gates: SHELLCOUNTER=1 (default OFF); scholar alive; no tbfight; no
//     active contest; lean day (scholar kcal < 50% of kcalCap); at Haven
//     stores (havenStoresAccess() !== 'none'); in-shell nuts on the prep-stash
//     counter; dayTicks + 4 + 64 < TICKS_PER_DAY (4 honest ticks, 64-tick
//     margin, never rolls the day); once per day (ctx._scShellDay).
//   - beat: Game.shellNuts(undefined, Game.prepStash()) (the exact engine call
//     the stash "Shell them" button makes; costs 4 ticks inside), then
//     Game.putAwayFinished() (shelled nuts are finished food -> pantry).
//   - telemetry on ctx: _scShellDay (once-per-day guard), _scShellDays,
//     _scShelledKcal (net 75% of gross, engine formula), _scShelledKcalLean /
//     _scShelledKcalFed (day-type split at firing).
// No fire gate, no knowledge gate — the verb's own terms
// (evidence/2026-10-17/sim-shellcounter-b.md: "VERB-GATE READING").
// Fires at the start of upkeep, before the base upkeep/daily, so the base
// policy's own eat flow then eats the pantry's shelled nuts.
'use strict';

function layerOn() { return process.env.SHELLCOUNTER === '1'; }

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

function counterBeat(Game, ctx) {
  if (!layerOn()) return;
  try {
    const s = (Game.state || {}).scholar || {};
    if (!s || s.over) return;                 // scholar dead: no beat
    if (Game.tbfight) return;                 // tickAction no-ops mid-fight
    if (Game.state && Game.state.activeContest) return;
    if (!leanDay(Game)) return;               // FED days never fire
    if (!atHavenStores(Game)) return;         // the counter is physical
    const nuts = counterNuts(Game);
    if (!nuts.length) return;                 // no in-shell counter nuts
    if (!timeToSpare(Game)) return;           // never rolls the day
    const day = s.day || 0;
    if (ctx._scShellDay === day) return;      // once per day
    // Honest telemetry of the conversion (engine formula: net = 75% of gross),
    // computed from the stacks BEFORE the engine transforms them in place.
    let gross = 0;
    for (const it of nuts) gross += (it.hiddenKcal || it.kcalEach || 0) * (it.units || 1);
    const net = Math.round(gross * 0.75);
    Game.shellNuts(undefined, Game.prepStash());
    Game.putAwayFinished();
    ctx._scShellDay = day;
    ctx._scShellDays = (ctx._scShellDays || 0) + 1;
    ctx._scShelledKcal = (ctx._scShelledKcal || 0) + net;
    if (leanDay(Game)) ctx._scShelledKcalLean = (ctx._scShelledKcalLean || 0) + net;
    else ctx._scShelledKcalFed = (ctx._scShelledKcalFed || 0) + net;
  } catch (e) { /* an instrument never crashes a sim */ }
}

function withShellCounter(base, pid, tag) {
  const id = pid || ((base && base.id) || 'base') + '+shellcounter';
  const wrapped = Object.assign({}, base);
  wrapped.id = id;
  const oUpkeep = base && base.upkeep;
  wrapped.upkeep = (Game, ctx) => {
    counterBeat(Game, ctx);
    if (oUpkeep) return oUpkeep(Game, ctx);
  };
  return wrapped;
}

module.exports = {
  withShellCounter, counterNuts, leanDay, timeToSpare, atHavenStores, layerOn,
  // legacy alias used by some census scripts
  counterNutsOn: counterNuts,
};
