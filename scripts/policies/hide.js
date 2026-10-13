// policies/hide.js — the armor-uptake layer (longsim scale-wall r15,
// 2026-10-13). r14's static audit found wave-2's top end kills an unarmored
// scholar in ~3 landed hits, but P=20 (craftable hide armor) takes those
// fights to 5.9-6.7. The r15 lever question: do day-7+ scholars actually
// wear P>=20 in sims? Baseline (this run): no — the layer below is the lever.
//
// withHide(base, id) layers this onto any competent-derived policy.
// Arms for r15: belonghide (BELONG road + hide), leadhide (LEAD road + hide).
//
// Opt-in: HIDE_R15=1 enables the layer. Default OFF -> pure delegation,
// parent-identical behavior (proven in the proof test's RED phase).
//
// Diegetic rules (a real player could do exactly this):
//   - learn the recipe honestly: L1 from handling a hide_armor item (equip
//     or loot from the dead — the engine's noteGearHandled, already live;
//     haul/loot-as-action carries gear up); blind 35% craft at L1 teaches
//     L2 (the engine's PRACTICE rule); L2+ crafts at 85%. There is NO
//     engine path to L3 for this recipe in sim time (no book teaches it,
//     no village codex carries it, villager teachings are plants/skills) —
//     L2 is the honest ceiling and plenty (85%). Never granted for free.
//   - hides from hauled carcasses: the engine already puts a Hide
//     (material:'hide') on every animal corpse (corpses.js); competent's
//     lootCorpses takes it in range like any other item. This layer uses
//     only the scholar's OWN inventory — never the pantry, never a
//     villager's stash, never the communal pile (canon: theft is socially
//     punished).
//   - craft when 2 hide + 1 vine are in hand and no hide armor is
//     owned/worn (once per day — blind 35% burns real hides, so don't
//     machine-gun attempts 3x/day). Re-craft when lost/destroyed.
//   - run BEFORE the parent's upkeep so competent's gearUp (which equips
//     the best armor owned) picks up the fresh piece the same part.
//
// Design note (for Steve's overrule): L3 remains unreachable through any
// legitimate in-game channel — "You can make it" is the only level the
// UI never grants for armor recipes. That gap is engine-side; this lever
// deliberately does not touch it.
'use strict';
const { belongseek } = require('./belongseek');
const { leadcourt } = require('./leadcourt');

const HIDE_ON = () => process.env.HIDE_R15 === '1';

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

function hideRecipeLevel(Game) {
  try { return ((((Game.state.codex || {}).recipes || {}).hide_armor || {}).level) || 0; }
  catch (e) { return 0; }
}

function ownMaterial(Game, mat, need) {
  try {
    const inv = (Game.state.scholar || {}).inventory || [];
    return inv.filter(i => i && i.material === mat).reduce((t, i) => t + (i.units || 0), 0) >= need;
  } catch (e) { return false; }
}

function hasHideArmor(Game) {
  try {
    const s = Game.state.scholar || {};
    const isHide = (it) => it && ((it.itemId || it.id) === 'hide_armor');
    if (Object.values(s.equipped || {}).some(isHide)) return true;
    return (s.inventory || []).some(isHide);
  } catch (e) { return false; }
}

// HIDE SWEEP: source hides by taking them off hauled carcasses, honestly.
// The engine puts a Hide (material:'hide') on every animal corpse
// (corpses.js generatePossessions — Steve 2026-10-09: "the hide_armor
// recipe's honest source"). competent's daily lootCorpses only strips what
// stands near the scholar at haven; kills happen out on the trail. This
// runs at upkeep, right after the fight-drive, while the scholar still
// stands on the kill tile — the "before the blood cools" beat (same rule
// as haul.js). Never mid-fight: stripping a body while something is
// actively trying to kill you is not a thing. Takes ONLY hides —
// person/villager corpses are skipped (their packs are competent's daily
// beat; this is the butcher's errand, not the death beat). corpseTakeItem
// enforces every gate itself: range (same node, <=1 tile), canCarry, burial.
function hideSweep(Game, ctx) {
  try {
    if (!Game.corpses) return 0;
    try { if (Game.tbfight && !Game.tbfight.over) return 0; } catch (e) {}
    let took = 0;
    for (const c of Game.corpses()) {
      if (!c || c.looted || c.buried) continue;
      if (c.kind === 'person' || c.kind === 'villager') continue;
      const items = c.items || [];
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (!it || it.material !== 'hide') continue;
        if ((it.units == null ? 1 : it.units) <= 0) continue;
        try {
          const r = Game.corpseTakeItem(c.id, i);
          if (r) { took++; ctx.hidesSwept = (ctx.hidesSwept || 0) + 1; }
        } catch (e) {}
      }
      if (took >= 6) break; // the butcher's errand, not the whole part
    }
    return took;
  } catch (e) { return 0; }
}

// hideUpkeep: craft the hide armor honestly. Runs before the parent's
// upkeep so gearUp equips the fresh piece the same part.
function hideUpkeep(Game, ctx) {
  try {
    const day = gday(Game);
    hideSweep(Game, ctx); // hides off today's kills first
    const level = hideRecipeLevel(Game);
    if (level < 1) {
      // L0: you've never seen one — no button (the engine's honesty rule).
      // L1 arrives through the world's hands: loot a dead villager's pack
      // (competent's lootCorpses takes gear, never human meat) or be
      // handed one. Never granted here.
      ctx.hideRecipeL0 = (ctx.hideRecipeL0 || 0) + 1;
      return;
    }
    if (hasHideArmor(Game)) { ctx.hideArmored = true; return; }
    if (!ownMaterial(Game, 'hide', 2)) { ctx.hideWantHide = (ctx.hideWantHide || 0) + 1; return; }
    if (!ownMaterial(Game, 'vine', 1)) { ctx.hideWantVine = (ctx.hideWantVine || 0) + 1; return; }
    // One honest attempt per day. Blind (L1) is 35% with the materials at
    // real risk — the engine's tuition — so don't burn the pack 3x/day.
    if (ctx.hideCraftDay === day) return;
    ctx.hideCraftDay = day;
    ctx.hideCraftAttempts = (ctx.hideCraftAttempts || 0) + 1;
    const blind = level < 2;
    if (blind) ctx.hideBlindAttempts = (ctx.hideBlindAttempts || 0) + 1;
    let made = null;
    try { made = Game.craft ? Game.craft('hide_armor') : null; } catch (e) {}
    if (made) {
      ctx.hideArmorCrafted = (ctx.hideArmorCrafted || 0) + 1;
      if (blind) ctx.hideBlindLearned = (ctx.hideBlindLearned || 0) + 1; // L2, per engine PRACTICE rule
    } else {
      ctx.hideCraftFails = (ctx.hideCraftFails || 0) + 1;
    }
  } catch (e) {}
}

function withHide(base, id) {
  const p = Object.assign({}, base, { id });
  const parentUpkeep = base.upkeep;
  p.upkeep = function (Game, ctx) {
    if (HIDE_ON()) hideUpkeep(Game, ctx);
    if (parentUpkeep) return parentUpkeep(Game, ctx);
  };
  return p;
}

const belonghide = withHide(belongseek, 'belonghide');
const leadhide = withHide(leadcourt, 'leadhide');

module.exports = { withHide, belonghide, leadhide, hideUpkeep, HIDE_ON };
