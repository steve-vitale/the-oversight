// policies/seeker.js — competent player who SEEKS alien infection (longsim
// disease lever r4, 2026-10-12).
//
// Canon (docs/DISEASES.md): alien diseases are min-max building blocks —
// "some players will avoid these at all costs, others will seek infection to
// boost their build." No prior sim policy played the seeker angle, so the
// building-block half of the canon was untested: do seekers actually acquire
// the viruses, do the abilities fire in real runs, and is the bargain worth it?
//
// The seeker is competent about everything EXCEPT the alien pool:
//  - PURE vector fights (every live monster is giant_mosquito / alien_tick):
//    never flees on the new-fight assessment — the infection is the goal.
//    Mosquito: WAITS (no strikes) until it drinks — the drink is the 50/50
//    virus roll — then kills it in the heavy punish window. Tick: walks IN
//    for the latch (the honest counter is "keep 2 squares away"; the seeker
//    does the opposite), then kills it once latched (the 50% roll fires at
//    latch). The <35% HP mid-fight retreat still applies — a dead seeker gets
//    no build. Mixed fights use competent rules (you don't stand still while
//    a hushwolf chews on you).
//  - Monster meat: eaten as food, never avoided (chases the quirks). Human
//    meat still refused (trembles: no cure, ever — not a build, a grave).
//  - Mundane sickness: fully competent (cookPack, drinkSafe, checkTicks) —
//    the seeker wants the alien warping, not gutrot.
//  - Stops seeking a vector once its permanent warping is held (eurika AND
//    east_nile for the mosquito — min-maxers seek both; lemons for the tick).
//
// Policy-honesty note: the seeker knows the vectors the way a real player
// does after a few lives — the codex records meatDisease, counters, and
// transformations, and the alien-affliction surface names them. The
// measurement here is "does the building-block path function," not "is it
// discoverable" (r3 covered discoverability/reachability of the vectors).
'use strict';
const { competent } = require('./competent');

const GIANT_SEEK = new Set(['giant_mosquito', 'alien_tick']);
const PERMA_VIRUS = { giant_mosquito: ['eurika', 'east_nile'], alien_tick: ['lemons'] };

function liveMonsters(f) {
  return (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
}

// true when every live monster is a sought vector (pure vector fight)
function pureVectorFight(f) {
  const live = liveMonsters(f);
  return live.length > 0 && live.every(x => GIANT_SEEK.has(x.monsterId));
}

function hasVirus(Game, id) {
  try { return !!(Game.hasStatus && Game.hasStatus('scholar', id)); } catch (e) { return false; }
}

// which sought viruses are still missing for the live vectors in this fight
function missingViruses(Game, live) {
  const missing = [];
  for (const m of live) {
    for (const v of (PERMA_VIRUS[m.monsterId] || [])) {
      if (!hasVirus(Game, v) && !missing.includes(v)) missing.push(v);
    }
  }
  return missing;
}

// move the player adjacent to (mx,my) without striking; returns true if moved
function stepAdjacent(Game, ctx, mx, my) {
  try {
    const p = Game.tbFighter('p');
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    if (Math.max(Math.abs(mx - px), Math.abs(my - py)) <= 1) return false;
    const occupied = new Set(
      ((Game.tbfight || {}).fighters || []).filter(x => x && x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
    let bx = null, by = null, bd = 1e9;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const cx = mx + dx, cy = my + dy;
      if (cx < 1 || cx > 7 || cy < 1 || cy > 7) continue; // interior: edges are the flee barrier
      if (occupied.has(cx + ',' + cy)) continue;
      const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
      if (dd < bd) { bd = dd; bx = cx; by = cy; }
    }
    if (bx == null) return false;
    try { Game.tbPlayerMove(bx, by); ctx.seekerSteps = (ctx.seekerSteps || 0) + 1; } catch (e) { return false; }
    return true;
  } catch (e) { return false; }
}

// The seeker fight hook. Returns true when it handled the turn (including
// "stand here and take it"), false to fall through to competent logic.
function seekerFight(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    if (!p) return false;
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    if (hpPct < 0.35) return false; // survival first — competent retreats below this
    if (!pureVectorFight(f)) return false; // mixed fights: competent rules
    const live = liveMonsters(f);
    const missing = missingViruses(Game, live);
    if (!missing.length) return false; // warping held — nothing to seek, fight normally
    // CLAIMED: set _fightObj so competent.fight skips its new-fight flee
    // assessment and goes straight to fighting. The <35% HP retreat lives
    // outside that block, so it still applies — survival first.
    ctx._fightObj = f;
    ctx._seekerFight = f;

    // MOSQUITO: stand for the drink. The mosquito only rolls the virus on a
    // LANDED drink (mosquitoBiteVirus); striking it down in circle phase
    // wastes the encounter. Wait until heavy (drank), then kill it.
    const mosq = live.find(x => x.monsterId === 'giant_mosquito');
    if (mosq && (missing.includes('eurika') || missing.includes('east_nile'))) {
      if ((mosq.mosqPhase || 'circle') !== 'heavy') {
        ctx.seekerWaits = (ctx.seekerWaits || 0) + 1;
        try { Game.tbPlayerWait(); } catch (e) {}
        return true;
      }
      // heavy = drank = the roll fired. Fall through to competent: kill it.
      ctx.seekerDrinksStood = (ctx.seekerDrinksStood || 0) + 1;
      return false;
    }
    // TICK: walk in. The latch is undodgeable at adjacency and the 50% lemons
    // roll fires AT LATCH — after that the seeker just wants it dead.
    const tick = live.find(x => x.monsterId === 'alien_tick');
    if (tick && missing.includes('lemons') && !tick.tickLatched) {
      const mx = tick.mx != null ? tick.mx : 4, my = tick.my != null ? tick.my : 4;
      stepAdjacent(Game, ctx, mx, my);
      ctx.seekerWalkIns = (ctx.seekerWalkIns || 0) + 1;
      try { Game.tbPlayerWait(); } catch (e) {}
      return true;
    }
    return false;
  } catch (e) { return false; }
}

// Quirk-carrying monster mids, data-driven from cooking.monsterDiseases
// (hushwolf, bulldozer, belltoad, speedbump_turtle, mirror_stag,
// ducks_in_a_row). The seeker knows these the way a real player does after a
// few lives: the codex records meatDisease per monster on first taste, and
// the alien-affliction surface names the transformation.
function quirkMids(Game) {
  try {
    const list = ((Game.data || {}).cooking || {}).monsterDiseases || [];
    const out = new Set();
    for (const dz of list) for (const m of (dz.monsters || [])) out.add(m);
    return out;
  } catch (e) { return new Set(); }
}

// Seeker eating: competent's honest-eating, except quirk-carrying monster
// meat is FOOD, not a hazard to route around. Scores it as ordinary food in
// any state (carcass is inedible until cleaned — cleanCatch handles that;
// raw scores don't repel the seeker the way they do competent) — the quirk
// roll (rawChance 0.35 / cookedChance 0.2) is the point. Human meat still
// refused (trembles: no cure, ever — not a build, a grave). Everything else
// identical to competentEat.
function seekerEat(Game, ctx) {
  const s = Game.state.scholar, vv = Game.state.village;
  const qm = quirkMids(Game);
  try {
    if (s.kcal >= Game.kcalCap() * 0.85) return;
    try { Game.eat(); } catch (e) {}
    if (s.kcal >= Game.kcalCap() * 0.85) return;
    let guard = 0;
    while (s.kcal < Game.kcalCap() * 0.95 && guard++ < 20) {
      const pantry = vv.pantry || [];
      let best = -1, bestScore = -99;
      for (let i = 0; i < pantry.length; i++) {
        const it = pantry[i];
        if (!it || (it.kcalEach || 0) <= 0) continue;
        if (it.plantId === 'meat_human') continue; // trembles: no cure, ever
        let score = 1;
        const fs = it.foodState || '';
        const mid = (it.plantId || '').startsWith('meat_') ? (it.plantId || '').slice(5) : null;
        const isQuirkMeat = mid && qm.has(mid);
        // SEEKER: quirk meat is the build. Eat it in any state, never route around it.
        if (isQuirkMeat) score = 6;
        else if (fs === 'cooked' || fs === 'smoked' || fs === 'preserved' || fs === 'rendered') score = 10;
        else if (fs === 'raw') score = (it.plantId || '').startsWith('meat_') ? -10 : 2;
        if (isQuirkMeat) {
          try { ctx.seekerMeatEaten = ctx.seekerMeatEaten || {}; ctx.seekerMeatEaten[it.plantId] = (ctx.seekerMeatEaten[it.plantId] || 0) + 1; } catch (e) {}
        }
        if (score > bestScore) { bestScore = score; best = i; }
      }
      if (best < 0 || bestScore < 0) break;
      try { Game.takeFromPantry(best); } catch (e) { break; }
      try { Game.eat(); } catch (e) { break; }
    }
  } catch (e) {}
}

const seeker = Object.assign({}, competent, {
  id: 'seeker',
  desc: 'competent + seeks alien infection: stands for the mosquito drink, walks into the tick latch, eats monster meat as food',
  upkeep(Game, ctx) {
    // competent upkeep, but with seeker eating instead of competentEat.
    // competent.upkeep calls competentEat internally; replicate with the swap:
    // run the pieces except the final competentEat, then seekerEat.
    try {
      // mirror competent.upkeep's structure: it ends with competentEat(Game).
      // We call it, then ALSO run seekerEat to pick up monster meat the
      // competent pass refused. Simpler and honest: the seeker eats twice —
      // once safe, once seeking. The kcal caps make the second pass a no-op
      // unless the first left monster meat on the table.
      competent.upkeep(Game, ctx);
    } catch (e) {}
    try { seekerEat(Game, ctx); } catch (e) {}
  },
  fight(Game, ctx) {
    if (seekerFight(Game, ctx)) return true;
    return competent.fight(Game, ctx);
  },
});

module.exports = { seeker, pureVectorFight, missingViruses, GIANT_SEEK };
