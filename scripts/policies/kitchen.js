// policies/kitchen.js — the cook->eat last-mile layer (longsim scale-wall
// r12, 2026-10-13). Lever 0 (food economy) AS A LENS on the scale wall.
//
// r11's open blank: the fight->food chain ends at "revealed" — scholar-eaten
// monster-meat kcal = 0 on all arms. Revealed monster meat (edible:true,
// foodKind 'meat', foodState 'cleaned', ~2-day shelf, prep "Cook it, or
// preserve it") rots before anyone eats it. The measured gap: competent's
// cookPack only cooks foodState === 'raw' (policies/competent.js:114), so
// cleaned meat is NEVER cooked and its 2-day cleaned shelf expires uncooked
// (meatRotK 6.7k pack-side on seed 11).
//
// The engine supports cooking cleaned meat honestly (food.js cookFood:
// unknown flesh keeps kcalEach 0 + hiddenKcal — cooking doesn't teach;
// revealed flesh gets its honest kcal; cooked-through clears diseaseRisk,
// and parasiteRisk is deleted outright — only 'cooked' clears trichinosis,
// per docs/BEAR.md).
//
// withKitchen(base, id) layers onto any competent-derived policy:
//   upkeep FIRST runs cookRevealedMeat (before the base cook+eat beat, so
//   the meat is cooked when competentEat/Game.eat() fires), then base.upkeep.
// Gate: COMPETENT_KITCHEN=1 opt-in (default OFF) so before/after runs on
// identical seeds are honest.
//
// RULES (canon + lever discipline):
//   - NEVER touch edible:false meat — that belongs to the r10 discovery
//     chain (cautious-test is the designed reveal; cooking unknown flesh
//     yields zero kcal and would waste fire).
//   - NEVER touch meat_human — trembles: cooking does not kill prions
//     (docs/DISEASES.md). The corruption slope is not a snack.
//   - cooking only. No smoking, no rendering, no game-code changes.
//   - near-expiry first; cap 6 items per beat (same restraint as cookPack).
//   - spoiled items are skipped (rot is the sweep's business, not the
//     kitchen's — cooking one would silently discard it).
//
// Diegetic: a real player could do exactly this — over the campfire, cook
// the meat you already know is food, soonest-spoiling first, then eat.
'use strict';
const { belongseekHaul, leadcourtHaul } = require('./haul');

// COOK THE REVEALED MEAT. Pack + village pantry, soonest-spoiling first.
function cookRevealedMeat(Game, ctx) {
  if (process.env.COMPETENT_KITCHEN !== '1') return 0; // opt-in gate, default OFF
  try {
    if (!Game.nearFire || !Game.nearFire()) return 0;
    const s = Game.state.scholar; if (!s) return 0;
    const spoiled = (it) => {
      try {
        return Game.isSpoiled ? !!Game.isSpoiled(it) : (it.spoilDay !== undefined && it.spoilDay <= s.day);
      } catch (e) { return false; }
    };
    const cands = [];
    const scan = (cont, cname) => {
      for (let i = 0; i < cont.length; i++) {
        const it = cont[i];
        if (!it) continue;
        if (it.foodKind !== 'meat') continue;
        if (it.edible !== true) continue;        // r10's chain owns the unknown
        if (it.foodState !== 'cleaned') continue; // raw is cookPack's; cooked+ is done
        if ((it.kcalEach || 0) <= 0) continue;
        if ((it.units == null ? 1 : it.units) <= 0) continue;
        if (String(it.plantId || '') === 'meat_human') continue; // trembles
        if (spoiled(it)) continue;
        cands.push({ it, cont, cname, spoil: it.spoilDay == null ? 99999 : it.spoilDay });
      }
    };
    scan(s.inventory || [], 'pack');
    const pantry = ((Game.state.village || {}).pantry) || [];
    if (pantry !== (s.inventory || [])) scan(pantry, 'pantry');
    cands.sort((a, b) => a.spoil - b.spoil); // near-expiry first
    let cooked = 0;
    for (const c of cands) {
      if (cooked >= 6) break; // don't burn the whole day-part
      const live = c.cont.indexOf(c.it); // index may have shifted; re-find
      if (live < 0) continue;
      try {
        Game.cookFood(live, c.cname === 'pantry' ? c.cont : undefined);
        cooked++;
      } catch (e) {}
    }
    if (cooked) {
      ctx.kitchenCooked = (ctx.kitchenCooked || 0) + cooked;
      ctx._kitchenLog = ctx._kitchenLog || [];
      ctx._kitchenLog.push({ day: s.day || 0, cooked });
    }
    return cooked;
  } catch (e) { return 0; }
}

function withKitchen(base, id) {
  const policy = Object.assign({}, base, { id });
  const baseUpkeep = base.upkeep, baseDaily = base.daily, baseFight = base.fight;
  policy.upkeep = function (Game, ctx) {
    // the kitchen beat runs FIRST: revealed cleaned meat over the fire
    // before the day's cook+eat beat, so competentEat sees cooked food.
    try { cookRevealedMeat(Game, ctx); } catch (e) {}
    if (baseUpkeep) { try { baseUpkeep(Game, ctx); } catch (e) {} }
  };
  if (baseDaily) {
    policy.daily = function (Game, ctx) {
      try { return baseDaily(Game, ctx); } catch (e) {}
    };
  }
  if (baseFight) {
    policy.fight = function (Game, ctx) {
      try { return baseFight(Game, ctx); } catch (e) { return false; }
    };
  }
  return policy;
}

const belongseekHaulKitchen = withKitchen(belongseekHaul, 'belongseek-haul-kitchen');
const leadcourtHaulKitchen = withKitchen(leadcourtHaul, 'leadcourt-haul-kitchen');

module.exports = { withKitchen, cookRevealedMeat, belongseekHaulKitchen, leadcourtHaulKitchen };
