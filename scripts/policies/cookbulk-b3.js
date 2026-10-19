// scripts/policies/cookbulk-b3.js — batch-cook v2 trigger, round 3.
//
// Round 3 of the #483 bean/rice blank (evidence/2026-10-17/sim-camptasks-b.md):
//   v1 (lean-day trigger) GO'd at its own bar, KILLED at the 50k confirm;
//   v2 (commons trigger: any Haven day, pool >= 1000 kcal) engaged 16/16 at
//   mean 23.6k kcal/side but was KILLED on the 50k bar; the b2 capacity lever
//   ("water for the pots") was INERT (delta exactly 0, 8/8 pairs) and the
//   -46d median survival delta violated the guardrail.
//
// This file faithfully reconstructs the v2 TRIGGER alone (the b2 run's
// "v2base", proof-verified 25/25 + det-gate 16/16 in test-cookbulk-b2.js)
// for a capacity-honest acceptance re-measurement (bar >= 20k kcal/side)
// PLUS attribution of the -46d survival signal. Zero src/js. The batch runs
// through the engine's honest cookAll (16-tick fire session, water cost,
// blind-attempt teaching, spoilage + unknown-flesh guards) — the layer only
// decides WHEN (cookDay) and HOW MUCH (splitForWater), exactly as v2 did.
//
// Enable: COOKBULK_B3=1. Default OFF. Gate-off: pure delegation, zero writes.
'use strict';

const ENV = 'COOKBULK_B3';

function layerOn() {
  return process.env[ENV] === '1';
}

// poolContainers: the v2 reachable cookable pool — pack + prep stash +
// pantry, the pantry gated on Haven stores access (the betrayal.js 'none'
// pattern: exiled scholars can't reach the commons). Order is fixed:
// pack, prep stash, pantry — the pot fills in that order.
function poolContainers(G) {
  const out = [];
  try {
    const s = G.state.scholar || {};
    if (Array.isArray(s.inventory)) out.push({ name: 'pack', items: s.inventory });
    if (Array.isArray(s.prepStash)) out.push({ name: 'prepStash', items: s.prepStash });
  } catch (e) {}
  try {
    const acc = (G.havenStoresAccess && G.havenStoresAccess()) || 'inside';
    if (acc !== 'none' && G.state.village && Array.isArray(G.state.village.pantry)) {
      out.push({ name: 'pantry', items: G.state.village.pantry });
    }
  } catch (e) {}
  return out;
}

// cookableEntries: [{container, item}] across the reachable pool, in
// container order. Still-raw items (rawKcal set, not spoiled).
function cookableEntries(G) {
  const out = [];
  for (const c of poolContainers(G)) {
    for (const it of c.items) {
      if (!it || !it.rawKcal) continue;
      try { if (G.isSpoiled && G.isSpoiled(it)) continue; } catch (e) {}
      out.push({ container: c, item: it });
    }
  }
  return out;
}

// cookableItems: the items alone (unit-test convenience).
function cookableItems(G, stash) {
  const out = [];
  for (const it of stash || []) {
    if (!it || !it.rawKcal) continue;
    try { if (G.isSpoiled && G.isSpoiled(it)) continue; } catch (e) {}
    out.push(it);
  }
  return out;
}

function atHaven(G) {
  try {
    if (G.havenStoresAccess && G.havenStoresAccess() === 'none') return false;
  } catch (e) { return false; }
  try {
    if (G.location === 'haven') return true;
    const t = G.playerTile && G.playerTile();
    if (t && t.type === 'haven') return true;
  } catch (e) {}
  return false;
}

function fireHere(G) {
  try { return !!G.nearFire(); } catch (e) { return false; }
}

// timeToSpare: the scholar has most of the day left. Reconstruction choice:
// dayTicks < 400 fires (pins: 100 fires, 480 does not; TICKS_PER_DAY=512).
function timeToSpare(G) {
  try { return (G.state.scholar.dayTicks | 0) < 400; } catch (e) { return false; }
}

function poolKcal(G, entries) {
  let k = 0;
  for (const e of entries) {
    const it = e.item || e;
    k += (it.rawKcal || 0) * (it.units || 1);
  }
  return k;
}

// cookDay: the v2 commons trigger — ANY Haven day with a >= 1000 kcal
// reachable cookable pool (pack + prep stash + pantry), a fire, and time.
// NOT hunger-gated, NOT ready-food-gated, NOT knowledge-gated (the engine
// teaches 'cook' on the first blind attempt; canon: "the attempt teaches
// the technique").
function cookDay(G) {
  if (!atHaven(G)) return false;
  const entries = cookableEntries(G);
  if (poolKcal(G, entries) < 1000) return false;
  if (!fireHere(G)) return false;
  if (!timeToSpare(G)) return false;
  return true;
}

// affordableUnits: how many needsCooking units the reachable clean water
// covers, using the engine's own water math (1L/unit; camp_cook L1 halves,
// L2 or a camp pot removes the cost — game.js cook path).
function affordableUnits(G) {
  let waterMult = 1;
  try {
    const lvl = G.abilityLevel ? (G.abilityLevel('camp_cook') | 0) : 0;
    const hasPot = G.hasItem ? !!G.hasItem('camp_pot') : false;
    waterMult = (lvl >= 2 || hasPot) ? 0 : (lvl >= 1 ? 0.5 : 1);
  } catch (e) {}
  if (waterMult === 0) return Infinity;
  let liters = 0;
  try { liters = Math.floor(G.cleanWaterForCooking() || 0); } catch (e) {}
  return Math.floor(liters / waterMult);
}

// splitForWater: size one affordable pot from the reachable entries, in
// container order. Boundary stacks split IN their home container; the pot
// is an array of item refs — cookAll mutates them in place, so cooked food
// stays wherever it came from. Returns the pot.
function splitForWater(G, entries) {
  let budget = affordableUnits(G);
  const pot = [];
  for (const e of entries) {
    if (!(budget > 0)) break;
    const it = e.item;
    const u = it.units || 1;
    if (u <= budget) { pot.push(it); budget -= u; continue; }
    const rem = Object.assign({}, it, { units: u - budget });
    it.units = budget;
    const home = e.container.items;
    const idx = home.indexOf(it);
    if (idx >= 0) home.splice(idx + 1, 0, rem); else home.push(rem);
    pot.push(it);
    budget = 0;
  }
  return pot;
}

function reachableClean(G) {
  let n = 0;
  try {
    const s = G.state.scholar || {};
    n += (s.water || []).filter(b => b && b.quality === 'clean').length;
  } catch (e) {}
  try { n += Math.floor((G.state.village.water || {}).clean || 0); } catch (e) {}
  return n;
}

// cookPass: the once-per-day batch. Gate-off returns null and touches
// nothing (pin). On a cookDay it sizes one affordable pot and runs the
// engine's cookAll on it — honest fire, water, time, teaching, spoilage.
function cookPass(G, ctx, phase) {
  if (!layerOn()) return null;
  ctx = ctx || {};
  let day = 0;
  try { day = G.state.scholar.day | 0; } catch (e) { return null; }
  if (ctx._cb3CookDay === day) return null; // once/day guard
  if (!cookDay(G)) return null;
  const entries = cookableEntries(G);
  if (!entries.length) return null;
  const pot = splitForWater(G, entries);
  if (!pot.length) return null;
  const cleanBefore = reachableClean(G);
  try { G.cookAll(pot); } catch (e) { return null; }
  const cleanAfter = reachableClean(G);
  let kcal = 0;
  for (const it of pot) {
    if (!it.needsCooking) kcal += (it.kcalEach || 0) * (it.units || 1);
  }
  ctx._cb3CookDay = day;
  ctx._cb3CookDays = (ctx._cb3CookDays || 0) + 1;
  ctx._cb3CookedKcal = (ctx._cb3CookedKcal || 0) + kcal;
  ctx._cb3WaterDrawnL = (ctx._cb3WaterDrawnL || 0) + Math.max(0, cleanBefore - cleanAfter);
  return { day, kcal, units: pot.reduce((t, i) => t + (i.units || 1), 0) };
}

function withCookBulkB3(base, id, desc) {
  return Object.assign({}, base, {
    id: id || ((base && base.id) ? base.id + '+cookbulk-b3' : 'cookbulk-b3'),
    desc: desc || 'commons batch-cook v2 trigger (COOKBULK_B3=1), round-3 acceptance + survival attribution',
    upkeep(G, ctx) {
      if (base.upkeep) base.upkeep(G, ctx);
      if (!layerOn()) return; // gate off: pure delegation
      try { cookPass(G, ctx, 'upkeep'); }
      catch (e) {
        ctx = ctx || {};
        ctx._cb3Errors = (ctx._cb3Errors || 0) + 1;
        if (ctx._cb3Errors <= 3) console.warn('[cookbulk-b3] cookPass error:', e && e.message);
      }
    },
  });
}

module.exports = {
  layerOn, cookableItems, cookableEntries, poolContainers, cookDay, fireHere,
  timeToSpare, poolKcal, affordableUnits, splitForWater, cookPass,
  withCookBulkB3, ENV,
};
