'use strict';
// cookbulk-b — policy-side lean-day batch-cook layer (arm sim-cookbulk-b).
//
// Finding #483's named next (evidence/2026-10-17/sim-camptasks-b.md): the
// camp-task census measured 13.8k/lean-day of cookableRaw (dried beans +
// rice — the starting village pantry bulk) with ZERO firings of the
// scholar's cook verbs (cookFood/cookAll 0x across 16 runs). The largest
// pool on the processing ladder has no actor. This layer is the actor.
//
// The engine's honest batch verb is Game.cookAll(container) (game.js, wrapped
// by food.js): fire REQUIRED, 16 ticks of fire fuel, 16 honest ticks, 1L
// clean water per unit for needsCooking items (beans/rice), spoiled items
// refused honestly ("Rot can't be cooked back into food"), unknown monster
// flesh left out of the batch, cooked = safe with ~5d shelf per canon
// (docs/PRESERVATION.md: cooked 100% known yield, safe, ~5d shelf; cooking
// never destroys calories senselessly — Steve 2026-10-09).
//
// The layer: on a LEAN camp day — scholar hungry (<50% cap), no ready
// edible food in the pack (eat first), cookable beans/rice/meat in the
// pack, on the prep counter, or in the village pantry — at Haven or at a
// camp with a fire, with time to spare, the scholar batch-cooks once per
// day. Knowledge-gated (only when the scholar knows the cook technique),
// fire-gated, water-honest (the engine skips stacks it can't afford; the
// layer additionally splits ONE oversized stack down to the reachable water
// — one honest pot, the way a person cooks — instead of skipping it whole),
// never costs a critical action (16+64 tick margin, never rolls the day),
// never rolls the day, normal task fiction voiced by the engine.
//
// Gate: COOKBULK=1 (default OFF — unset means pure delegation to the base
// policy; the proof test's det-gate pins byte-identical trajectories).
// Zero src/js changes. Zero overlap with sibling arms (sim-shellrevive-b,
// sim-huntduty-b: separate new files each).

function layerOn() { return process.env.COOKBULK === '1'; }

// cookableItems(Game, container): the items Game.cookAll would cook —
// mirroring the engine's batch scope (game.js cookAll rawKcal branch +
// food.js wrapper meat/plant branches), minus what the engine refuses
// (spoiled, unknown monster flesh).
function cookableItems(Game, container) {
  const out = [];
  for (const it of (container || [])) {
    if (!it || (it.units || 0) <= 0) continue;
    const rawKcal = !!it.rawKcal;
    const cleanedMeat = it.foodKind === 'meat' && (it.foodState === 'cleaned' || it.undercooked);
    const cookPlant = it.foodKind === 'plant' && it.needsCooking && it.diseaseRisk;
    if (!(rawKcal || cleanedMeat || cookPlant)) continue;
    try { if (Game.isSpoiled && Game.isSpoiled(it)) continue; } catch (e) {}
    try {
      const mid = String(it.plantId || '').replace(/^meat_/, '');
      if (it.foodKind === 'meat' && Game.monsterMeatGated && Game.monsterMeatGated(mid) &&
          Game.monsterFoodSafe && !Game.monsterFoodSafe(mid)) continue;
    } catch (e) {}
    out.push(it);
  }
  return out;
}

// readyFood(Game, container): food the scholar could eat RIGHT NOW without
// cooking — anything edible that isn't in the cookable set.
function readyFood(Game, container) {
  const cookSet = new Set(cookableItems(Game, container));
  return (container || []).filter(it => it && (it.units || 0) > 0 && (it.kcalEach || 0) > 0 &&
    it.edible !== false && !cookSet.has(it) &&
    !(Game.isSpoiled && Game.isSpoiled(it)));
}

function kcalCapOf(Game) {
  try { return Game.kcalCap() || 2400; } catch (e) { return 2400; }
}

function atHavenStores(Game) {
  try { return Game.havenStoresAccess && Game.havenStoresAccess() !== 'none'; } catch (e) { return false; }
}

// leanCookDay: hungry scholar, nothing ready in the pack, cookable pool
// reachable (pack always; prep counter + pantry only at Haven stores).
function leanCookDay(Game) {
  const s = (Game.state || {}).scholar || {};
  if (!s || Game.over) return false;
  if ((s.kcal || 0) >= kcalCapOf(Game) * 0.5) return false;
  const pack = s.inventory || [];
  if (readyFood(Game, pack).length > 0) return false; // eat first
  if (cookableItems(Game, pack).length > 0) return true;
  if (atHavenStores(Game)) {
    try { if (cookableItems(Game, Game.prepStash()).length > 0) return true; } catch (e) {}
    try { if (cookableItems(Game, (Game.state.village || {}).pantry).length > 0) return true; } catch (e) {}
  }
  return false;
}

function knowsCookable(Game) {
  try { return !!Game.knowsTechnique('cook'); } catch (e) { return false; }
}

function fireHere(Game) {
  try {
    if (Game.nearFire && Game.nearFire()) return true;
    if (typeof Game.tentFireLit === 'function' && Game.tentFireLit()) return true;
  } catch (e) {}
  return false;
}

// timeToSpare: the batch costs an honest 16 ticks; keep a 64-tick margin so
// the day never rolls and the sleep-refusal window is never entered.
function timeToSpare(Game) {
  try {
    const T = (Game.TIME || {}).TICKS_PER_DAY || 512;
    const dt = ((Game.state || {}).scholar || {}).dayTicks || 0;
    return dt + 16 + 64 < T;
  } catch (e) { return false; }
}

function campCookWaterMult(Game) {
  try {
    const lvl = Game.abilityLevel ? Game.abilityLevel('camp_cook') : 0;
    return lvl >= 2 ? 0 : lvl >= 1 ? 0.5 : 1;
  } catch (e) { return 1; }
}

// splitForWater: the engine charges 1L clean water per unit for needsCooking
// items and skips whole stacks it can't afford. A person cooks one pot's
// worth. Split the first oversized needsCooking stack in-place down to the
// reachable water (same container; the remainder keeps needsCooking for
// another day). One split per pass — the fiction is one pot, not surgery.
function splitForWater(Game, container, cookables) {
  let water = 0;
  try { water = Math.floor(Game.cleanWaterForCooking() || 0); } catch (e) { return; }
  if (water <= 0) return;
  const wm = campCookWaterMult(Game);
  if (wm <= 0) return; // L2+ camp_cook: no water cost, nothing to split
  for (const it of cookables) {
    if (!it.needsCooking) continue; // no water cost on this one
    const units = it.units || 1;
    const cost = Math.ceil(units * wm);
    if (cost <= water) { water -= cost; continue; }
    const afford = Math.floor(water / wm);
    if (afford < 1) return; // can't afford a single unit of this stack
    const rest = Object.assign({}, it, { units: units - afford });
    it.units = afford;
    container.push(rest);
    return; // one pot per pass
  }
}

function cookKcal(items) {
  return items.reduce((t, i) => t + ((i.kcalEach || 0) * (i.units || 1)), 0);
}

// cookPass: the once-per-day batch. Returns a result object (or null when
// the gate or a precondition fails). All Game calls are guarded — a hostile
// engine state must never kill a run.
function cookPass(Game, ctx, where) {
  if (!layerOn()) return null;
  try {
    const s = (Game.state || {}).scholar || {};
    if (!s || Game.over) return null;
    if (Game.tbfight) return null;
    if ((Game.state || {}).activeContest) return null;
    const day = s.day || 0;
    if (ctx && ctx._cbCookDay === day) return null; // once per day
    if (!leanCookDay(Game)) return null;
    if (!knowsCookable(Game)) return null;
    if (!fireHere(Game)) return null;
    if (!timeToSpare(Game)) return null;
    const containers = [{ name: 'pack', arr: s.inventory || [] }];
    if (atHavenStores(Game)) {
      try { containers.push({ name: 'counter', arr: Game.prepStash() || [] }); } catch (e) {}
      try { containers.push({ name: 'pantry', arr: (Game.state.village || {}).pantry || [] }); } catch (e) {}
    }
    let fired = false, cookedKcal = 0, unlockedKcal = 0;
    for (const c of containers) {
      let cookables;
      try { cookables = cookableItems(Game, c.arr); } catch (e) { continue; }
      if (!cookables.length) continue;
      try { splitForWater(Game, c.arr, cookables); } catch (e) {}
      try { cookables = cookableItems(Game, c.arr); } catch (e) { continue; }
      if (!cookables.length) continue;
      const beforeSet = new Set(cookables);
      const beforeKcal = new Map(cookables.map(it => [it, (it.kcalEach || 0) * (it.units || 1)]));
      try { Game.cookAll(c.arr); } catch (e) { continue; }
      fired = true;
      // measure conversion: items that were cookable and no longer are
      for (const it of c.arr) {
        if (!it || !beforeSet.has(it)) continue;
        let still = false;
        try { still = cookableItems(Game, [it]).length > 0; } catch (e) {}
        if (!still) {
          const after = (it.kcalEach || 0) * (it.units || 1);
          cookedKcal += after;
          unlockedKcal += after - (beforeKcal.get(it) || 0);
        }
      }
    }
    if (ctx) {
      ctx._cbCookDay = day;
      if (fired && cookedKcal > 0) {
        ctx._cbCookDays = (ctx._cbCookDays || 0) + 1;
        ctx._cbCookedKcal = (ctx._cbCookedKcal || 0) + cookedKcal;
        ctx._cbUnlockedKcal = (ctx._cbUnlockedKcal || 0) + unlockedKcal;
      }
    }
    return { where, fired, cookedKcal, unlockedKcal };
  } catch (e) { return null; }
}

// withCookBulk(base, id, tag): wrap a base policy. The upkeep hook fires
// BEFORE the base upkeep — the scholar cooks first, then the base policy's
// own eat flow (competentEat) eats the COOKED food instead of eating it raw.
// (Firing after the base upkeep never engages: the base starvation loop eats
// the pantry beans raw first.) The daily hook fires before the base daily
// (pre-sleep, bedding down). Once-per-day guard shared via ctx.
function withCookBulk(base, id, tag) {
  const wrapped = Object.assign({}, base, { id: id || ((base && base.id) + '+cookbulk') });
  const oUpkeep = base.upkeep, oDaily = base.daily;
  wrapped.upkeep = function (Game, ctx) {
    cookPass(Game, ctx, 'upkeep');
    let r;
    if (oUpkeep) r = oUpkeep(Game, ctx);
    return r;
  };
  wrapped.daily = function (Game, ctx) {
    cookPass(Game, ctx, 'daily');
    let r;
    if (oDaily) r = oDaily(Game, ctx);
    return r;
  };
  return wrapped;
}

module.exports = {
  layerOn, cookableItems, readyFood, leanCookDay, knowsCookable, fireHere,
  timeToSpare, splitForWater, cookPass, withCookBulk,
};
