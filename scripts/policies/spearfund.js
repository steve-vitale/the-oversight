// spearfund — policy-side spear acquisition drive for the courtship scholar
// (flesh-out loop arm sim-spearfund, run fleshout-20261020T1215Z, axis
// scale-onramp, backlog #69 named next).
//
// buildfund r19 KILLED AT PILOT: the spear recipe chain's first link never
// fires on the courtship road — 8/8 seeds x 180d never put a hunting_spear
// in the scholar's hands. This layer drives the honest acquisition channel
// the probe showed fires (census scripts/census-spearcarriers-20261020.js:
// 3/4 seeds have a villager carrying a hunting_spear; villagers die; the
// dead carry their real gear):
//
//   CHANNEL: corpse-loot priority (Game.corpseTakeItem).
//   The other candidates are structurally dead on this road:
//   - stash-armory borrow: donateWeapon is UI-only; no code or policy ever
//     deposits a weapon — the pile starts empty and stays empty.
//   - monster loot: alien-origin pool only; an earthly spear never drops.
//   - trade: the river trader sells knife/salt/rope.
//   - hunter-villager gift: no verb exists (gifts are scholar→villager).
//   A living hunter lending/giving a spear would need a NEW verb —
//   game-code, out of scope; noted as a steve-call candidate.
//
// All verbs already exist in the engine — zero src/js changes:
//   LEG 1 (loot): once/day, if the spear recipe is unseen (L0) and the
//     scholar is near an unburied person/villager corpse holding a
//     hunting_spear, take JUST the spear via corpseTakeItem (the per-item
//     verb — range-checked, weight-checked, narrated, trauma + social
//     consequences via observe('loot_corpse')). Fires noteGearHandled → L1.
//     Opportunistic only: no corpse-chasing travel.
//   LEG 2 (craft): one blind craft attempt/day via Game.craft when recipe
//     L1+ and branch+stone+vine are on hand. craft() enforces every gate
//     (L1 blind 35%, materials at risk; success teaches L2).
//
// SPEARFUND=1 = armed; unset = control. Gate-off is pure delegation
// (the drive function returns before touching anything; the armed policy
// wrapper still runs the courtship verbs first and fully).
'use strict';
const { leadcourt } = require('./leadcourt');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function recipeLevel(Game, id) {
  try { return (((Game.state.codex || {}).recipes || {})[id] || {}).level || 0; } catch (e) { return 0; }
}
function scholarOwnsSpear(Game) {
  try {
    const s = Game.state.scholar || {};
    const defOf = (it) => (Game.data.items || []).find(d => d.id === (it && (it.itemId || it.id)));
    for (const k of Object.keys(s.equipped || {})) {
      const it = s.equipped[k];
      if (it && (it.itemId === 'hunting_spear' || it.id === 'hunting_spear')) return true;
    }
    for (const it of (s.inventory || [])) {
      if (it && (it.itemId === 'hunting_spear' || it.id === 'hunting_spear')) return true;
    }
    return false;
  } catch (e) { return false; }
}
// Corpses near the scholar holding a hunting_spear: node-scoped, unburied,
// within the verb's own reach (same node, adjacent cell), person/villager.
function spearCorpses(Game) {
  const out = [];
  try {
    const s = Game.state.scholar || {};
    const px = Game.map ? Game.map.px : null, py = Game.map ? Game.map.py : null;
    const mx = s.mx == null ? 4 : s.mx, my = s.my == null ? 4 : s.my;
    const list = Game.corpses ? Game.corpses() : (Game.state.corpses || []);
    for (const c of list) {
      if (!c || c.buried) continue;
      const n = c.node || {};
      if (px != null && (n.x !== px || n.y !== py)) continue;
      if (Math.max(Math.abs((c.mx == null ? 4 : c.mx) - mx), Math.abs((c.my == null ? 4 : c.my) - my)) > 1) continue;
      const idx = (c.items || []).findIndex(it => it && (it.itemId === 'hunting_spear' || it.id === 'hunting_spear') && ((it.units == null ? 1 : it.units) > 0));
      if (idx >= 0) out.push({ cid: c.id, idx });
    }
  } catch (e) {}
  return out;
}
function hasMaterials(Game, recipe) {
  try {
    const inv = (Game.state.scholar || {}).inventory || [];
    return Object.entries(recipe.materials || {}).every(([mat, need]) => {
      const have = inv.filter(i => i && i.material === mat).reduce((t, i) => t + (i.units || 0), 0);
      return have >= need;
    });
  } catch (e) { return false; }
}

// The drive itself: runs BEFORE the courtship verbs each day so the base
// policy's gearUp can equip a looted spear the same day.
function spearfundDrive(Game, ctx) {
  if (process.env.SPEARFUND !== '1') return; // gate off: pure delegation
  try {
    const s = Game.state.scholar;
    if (!s || Game.over) return;
    if (Game.inCombat && Game.inCombat()) return; // never mid-fight
    const day = gday(Game);
    // LEG 1 — loot a hunting_spear from a nearby dead villager's pack.
    // Only while the recipe is unseen: after L1 the scholar crafts their
    // own; a second spear is greed, not the first link. The verb is honest:
    // range/weight gates, narration, trauma, observe('loot_corpse').
    if (recipeLevel(Game, 'hunting_spear') < 1 && !scholarOwnsSpear(Game)) {
      const found = spearCorpses(Game);
      if (found.length && typeof Game.corpseTakeItem === 'function') {
        const took = Game.corpseTakeItem(found[0].cid, found[0].idx);
        if (took) ctx.sfLooted = (ctx.sfLooted || 0) + 1;
      }
    }
    // LEG 2 — one blind craft attempt per day when L1+ and funded.
    // craft() enforces every gate (L1 blind 35%, materials at risk;
    // success teaches L2). Last attempt tracked per-day to keep it to one.
    const lvl = recipeLevel(Game, 'hunting_spear');
    if (lvl >= 1 && Game.craft) {
      const recipe = (Game.data.recipes || []).find(r => r.id === 'hunting_spear');
      if (recipe && hasMaterials(Game, recipe) && ctx.sfTryDay !== day) {
        ctx.sfTryDay = day;
        ctx.sfSpearTries = (ctx.sfSpearTries || 0) + 1;
        const made = Game.craft('hunting_spear');
        if (made) ctx.sfSpearCrafts = (ctx.sfSpearCrafts || 0) + 1;
      }
    }
  } catch (e) {
    // Policy layers must never crash a sim; count the fault for telemetry.
    ctx.sfFaults = (ctx.sfFaults || 0) + 1;
  }
}

// Armed policy: drive runs first (so gearUp equips a looted spear the
// same day), courtship verbs run fully after — the layer is additive.
const spearfundLead = Object.assign({}, leadcourt, {
  id: 'spearfund-lead',
  daily(Game, ctx) {
    try { spearfundDrive(Game, ctx); } catch (e) { ctx.sfFaults = (ctx.sfFaults || 0) + 1; }
    if (leadcourt.daily) { try { leadcourt.daily(Game, ctx); } catch (e) {} }
  },
});

module.exports = { spearfundLead, spearfundDrive, recipeLevel, scholarOwnsSpear, spearCorpses, hasMaterials };
