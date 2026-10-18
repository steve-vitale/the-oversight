#!/usr/bin/env node
// scripts/policies/shellrevive-b.js — COUNTER-shelling revival layer (sim-shellrevive-b2).
//
// Fresh write against the spec in evidence/2026-10-17/sim-shellcounter-b.md
// ("VERB-GATE READING") and the revival guardrail spec in
// evidence/2026-10-17/sim-shellharm-b.md. It does NOT import or reuse
// scripts/policies/shellcounter.js (the diagnostic instrument, NEVER LAND).
//
// The COUNTER BEAT, once per day, at the START of upkeep before the base
// upkeep/daily: on a lean Haven day — scholar hungry (<50% kcalCap), scholar
// alive, no fight, no contest, hands in the hall (havenStoresAccess() !==
// 'none'), in-shell nuts on the prep-stash counter, time to spare — the
// scholar shells the counter batch with the EXACT engine stash verb
// (Game.shellNuts(undefined, Game.prepStash()); costs 4 ticks inside) and
// puts the finished food away (Game.putAwayFinished(): shelled nuts are
// finished food — edible, no longer unprocessed — so they flow counter ->
// pantry, where competentEat's takeFromPantry and the village's own
// consumption can reach them).
//
// Gates (all honest, all engine-state; checked against the verb):
//   SHELLREVIVE_B=1 (default OFF; gate-off = pure delegation to the base policy)
//   scholar alive (mantle succession replaces the scholar; s.over is a no-op
//     safety net — never set in-engine)
//   no tbfight (tickAction no-ops mid-fight; shelling without the time cost
//     would be dishonest)
//   no active contest
//   lean day: scholar.kcal < 50% of kcalCap() (FED days never fire)
//   at Haven stores: havenStoresAccess() !== 'none' (the counter is physical)
//   in-shell nuts on the prep-stash counter (unspoiled; the engine refuses rot
//     honestly in the put-away)
//   time to spare: dayTicks + 4 + 64 < TICKS_PER_DAY (never rolls the day)
//   once per day (ctx._srShellDay)
// No fire gate, no knowledge gate — the verb's own terms
// (food.js:2745 "Shell them · 4 ticks · net 75% of gross · everyone knows how").
// Narration is the engine's own beats (shellNuts + putAwayFinished say their
// lines honestly); this layer fabricates nothing.
//
// Zero src/js changes. Telemetry on ctx: _srShellDay (once-per-day guard),
// _srShellDays, _srShelledKcal (net 75% of gross, engine formula),
// _srShelledKcalLean / _srShelledKcalFed (day-type split at firing).
'use strict';

function layerOn() { return process.env.SHELLREVIVE_B === '1'; }

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
    if (ctx._srShellDay === day) return;      // once per day
    // Honest telemetry of the conversion (engine formula: net = 75% of gross),
    // computed from the stacks BEFORE the engine transforms them in place.
    let gross = 0;
    for (const it of nuts) gross += (it.hiddenKcal || it.kcalEach || 0) * (it.units || 1);
    const net = Math.round(gross * 0.75);
    Game.shellNuts(undefined, Game.prepStash());
    Game.putAwayFinished();
    ctx._srShellDay = day;
    ctx._srShellDays = (ctx._srShellDays || 0) + 1;
    ctx._srShelledKcal = (ctx._srShelledKcal || 0) + net;
    if (leanDay(Game)) ctx._srShelledKcalLean = (ctx._srShelledKcalLean || 0) + net;
    else ctx._srShelledKcalFed = (ctx._srShelledKcalFed || 0) + net;
  } catch (e) { /* a policy layer never crashes a sim */ }
}

function withShellRevive(base, pid, tag) {
  const id = pid || ((base && base.id) || 'base') + '+shellrevive';
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
  withShellRevive, counterNuts, leanDay, timeToSpare, atHavenStores, layerOn,
};
