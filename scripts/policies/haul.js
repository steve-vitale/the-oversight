// policies/haul.js — the carcass-haul layer (longsim scale-wall r11,
// 2026-10-13). r10 killed its discovery lever at pilot: 97% of edible kill
// kcal rots on corpses unlooted — "monster kills are a food source" is true
// in code and false in outcome. The binding constraint is UPSTREAM of
// discovery: kill -> carcass -> loot -> clean. The policy-side fix r10 named
// but did not attempt (lever discipline): loot corpses in range immediately
// after fights, then work the r10 chain (clean -> cautious-test/discovery ->
// pantry). NO game-code changes. The design-level fixes (a haul-the-carcass
// verb, longer corpse spoil window) are out of scope — Steve's call.
//
// Diegetic rules (a real player could do exactly this):
//   - loot runs at upkeep, 3x/day — right after the fight-drive, while the
//     player still stands on the kill tile. Never mid-fight: stripping a
//     body while something is actively trying to kill you is not a thing.
//   - loot-as-action, one corpseTakeItem at a time, range-gated by the
//     engine (_corpseCheckRange), weight-gated by canCarry, ticks ticked.
//     Whatever doesn't fit rides honestly (instrumented as left-behind).
//   - never human meat (trembles — canon, same as competent's looter).
//   - clean what was just hauled when the knife allows (cleanCarcass, the
//     same verb competent runs at day-end); the cautious test stays at
//     meatseek's honest 1/day pace; the pantry leg stays competent's
//     day-end donateHaul.
// withHaul(base, id) layers this onto any competent-derived policy.
// Arms for r11: belongseek-haul (BELONG road + haul), leadcourt-haul
// (LEAD road + haul).
'use strict';
const { belongseek } = require('./belongseek');
const { leadcourt } = require('./leadcourt');
const { testUnknownMeat } = require('./meatseek');

// HAUL THE FIELD: strip in-range corpses, then clean what the pack just
// gained. Runs at upkeep (post-fight-drive, pre-move) — the "before the
// blood cools" beat. Returns the number of items taken.
function haulCorpses(Game, ctx) {
  let took = 0;
  try {
    if (!Game.corpses) return 0;
    // not mid-fight: the dead can wait until the living are safe
    try { if (Game.tbfight && !Game.tbfight.over) return 0; } catch (e) {}
    const s = Game.state.scholar;
    for (const c of Game.corpses()) {
      if (!c || c.looted || c.buried) continue;
      if (c.kind === 'person' || c.kind === 'villager') continue; // meat lever only
      const items = c.items || [];
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
        if (it.plantId === 'meat_human') continue; // trembles: no cure, ever
        try {
          const r = Game.corpseTakeItem(c.id, i);
          if (r) { took++; ctx.hauled = (ctx.hauled || 0) + 1; }
        } catch (e) {}
      }
      if (took >= 12) break; // don't spend the whole part on one body
    }
    // CLEAN WHAT YOU HAULED (r10 chain, first rung): carcass-state pack
    // items get the knife now, not at day-end — 3 days of corpse rot taught
    // us the clock starts at the kill.
    if (took > 0) {
      try {
        const inv = (Game.state.scholar || {}).inventory || [];
        const nCar = inv.filter(x => x && x.foodState === 'carcass').length;
        if (nCar > 0 && Game.hasCuttingTool && Game.hasCuttingTool()) {
          const before = inv.length;
          Game.cleanCarcass();
          ctx.haulCleaned = (ctx.haulCleaned || 0) + nCar;
          ctx._haulCleanLog = ctx._haulCleanLog || [];
          ctx._haulCleanLog.push({ day: (s && s.day) || 0, carcasses: nCar });
        } else if (nCar > 0) {
          ctx.haulCleanSkipped = (ctx.haulCleanSkipped || 0) + nCar; // knifeless: honest
        }
      } catch (e) {}
    }
  } catch (e) {}
  return took;
}

function withHaul(base, id) {
  const policy = Object.assign({}, base, { id });
  const baseUpkeep = base.upkeep, baseDaily = base.daily, baseFight = base.fight;
  policy.upkeep = function (Game, ctx) {
    if (baseUpkeep) { try { baseUpkeep(Game, ctx); } catch (e) {} }
    try { haulCorpses(Game, ctx); } catch (e) {}
  };
  policy.daily = function (Game, ctx) {
    if (baseDaily) { try { baseDaily(Game, ctx); } catch (e) {} }
    // the r10 chain: one cautious flesh-test per day (meatseek's honest pace)
    try { testUnknownMeat(Game, ctx); } catch (e) {}
  };
  if (baseFight) {
    policy.fight = function (Game, ctx) {
      try { return baseFight(Game, ctx); } catch (e) { return false; }
    };
  }
  return policy;
}

const belongseekHaul = withHaul(belongseek, 'belongseek-haul');
const leadcourtHaul = withHaul(leadcourt, 'leadcourt-haul');

module.exports = { withHaul, haulCorpses, belongseekHaul, leadcourtHaul };
