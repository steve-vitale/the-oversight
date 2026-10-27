// policies/meatseek.js — monster-meat discovery policy (longsim scale-wall r10,
// 2026-10-13). Starts from competent.js (DO NOT MODIFY competent.js) and adds
// the one thing the baseline never does: the cautious-test chain on unknown
// carcass flesh (docs canon: monster meat is knowledge-gated — edible:false,
// hiddenKcal until learned via cautious testing, villager word, or Codex).
//
// Steve 2026-10-13 (main chat): "Monster kills are supposed to sometimes be a
// food source once discovered." The r5 "55 kcal/kill" was a POLICY measurement:
// competent loots + cleans carcasses but NEVER cautious-tests unknown flesh,
// so edibility is never discovered. meatseek exercises the chain honestly:
//   - ONE unknown flesh type per day via Game.testMonsterMeat (the designed
//     cost: 8+12+12=32 ticks, an afternoon; toxic flesh -> -30 energy and
//     known-poison — the policy pays the real price, no skipping).
//   - Discovery is per-species (codex.monsters[mid].foodSafe): one test
//     reveals the whole species for the village, including the reveal of
//     matching meat in pack AND prepStash (markMonsterFoodSafe's path).
//   - The villager fireside experiment (villagerExperimentBeat, automatic
//     once/day when present at haven) and Codex paths stay engine-driven —
//     the policy doesn't fake them, the instrument attributes them.
// No game-code changes. No tuning numbers touched. Policy-side only.
'use strict';
const { competent } = require('./competent');

// FIND-UNKNOWN-FLESH: scan pack then prepStash then the village pantry for
// undiscovered monster flesh (foodKind 'meat', edible===false, plantId
// 'meat_<mid>', monster def, not yet monsterFoodSafe). Returns
// {idx, container, mid} or null. The pantry scan is the haul case: hauled
// flesh lands in the pantry, not the pack, and no pack verb reaches it —
// but the pantry is only tried when the player is actually at haven (the
// flesh is at the fire; the story waits until you're there, same presence
// rule as the villagers' own experiment beat). Packing unknowns stays
// gated — testing the pile at the fire is not packing it.
function findUnknownFlesh(Game) {
  try {
    const mons = Game.data.monsters || [];
    const isMon = (id) => mons.some(m => m.id === id);
    const scan = (cont) => {
      if (!cont) return null;
      for (let i = 0; i < cont.length; i++) {
        const it = cont[i];
        if (!it || it.foodKind !== 'meat' || it.edible !== false) continue;
        const mid = String(it.plantId || '').replace(/^meat_/, '');
        if (!mid || !isMon(mid)) continue; // animal meat is never unknown-flesh
        try { if (Game.monsterFoodSafe && Game.monsterFoodSafe(mid)) continue; }
        catch (e) {}
        return { idx: i, container: cont, mid };
      }
      return null;
    };
    const s = Game.state.scholar || {};
    let hit = scan(s.inventory || []);
    if (!hit) {
      try { hit = scan((Game.prepStash && Game.prepStash()) || []); } catch (e) {}
    }
    if (!hit) {
      // Pantry flesh is only tryable at haven; away from home the pile is
      // out of reach, and an unknown location defaults to "not there".
      let atHaven = false;
      try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
      if (atHaven) {
        try { hit = scan((Game.state.village || {}).pantry || []); } catch (e) {}
      }
    }
    return hit;
  } catch (e) { return null; }
}

// THE CAUTIOUS TEST, AS A PLAYER: one unknown flesh per day. The afternoon
// is the designed cost (testMonsterMeat ticks 8+12+12). A real player doesn't
// line up ten mystery meats in one day — and the toxic ones punish (-30
// energy, and the Codex records POISON so nobody eats it again).
function testUnknownMeat(Game, ctx) {
  if (process.env.MEATSEEK_TEST === '0') return; // before/after harness gate
  try {
    const s = Game.state.scholar; if (!s) return;
    const day = s.day || 0;
    if ((ctx._meatTestDay || 0) === day) return; // one flesh per day, honestly
    const hit = findUnknownFlesh(Game);
    if (!hit) return;
    ctx._meatTestDay = day;
    const before = s.energy || 100;
    try { Game.testMonsterMeat(hit.idx, hit.container); } catch (e) {}
    ctx.meatTests = (ctx.meatTests || 0) + 1;
    // attribution snapshot for the instrument (the transcript carries the say-lines)
    let safe = null;
    try { safe = Game.monsterFoodSafe ? !!Game.monsterFoodSafe(hit.mid) : null; } catch (e) {}
    ctx.meatTestLog = ctx.meatTestLog || [];
    ctx.meatTestLog.push({ day, mid: hit.mid, foodSafeAfter: safe,
      energyDelta: Math.round((s.energy || 100) - before) });
  } catch (e) {}
}

const meatseek = Object.assign({}, competent, {
  id: 'meatseek',
  daily(Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    // test AFTER the day's work (carcasses are cleaned by cleanCatch during
    // the day; the afternoon test is the honest next beat). Runs even while
    // recovering — a hurt player can still taste a strip of flesh at camp.
    testUnknownMeat(Game, ctx);
    // cook AFTER the test: revealed cleaned monster meat in the pack or on
    // the counter goes over the fire while it is still fresh. Unknown flesh
    // is never batch-cooked (the cautious-test gate holds — cookAll says
    // the same); only meat the village already knows is food.
    cookMonsterMeat(Game, ctx);
    try {
      const known = Game.state.codex && Game.state.codex.monsters
        ? Object.keys(Game.state.codex.monsters).filter(m => (Game.state.codex.monsters[m] || {}).foodSafe).length
        : 0;
      ctx.knownMonsterFood = known;
    } catch (e) {}
  },
});

// COOK-REVEALED-MONSTER-MEAT: the player-side cook path for the channel.
// A human with revealed cleaned monster meat and a fire can already press
// Cook in the pack UI; the baseline policy never does (its cook sweep only
// touches foodState 'raw'). This drives the same verb, same fire, same
// outcome — revealed monster meat only, spoiled skipped, at most 6 stacks
// so the fire-tending never eats the whole day-part.
function cookMonsterMeat(Game, ctx) {
  if (process.env.MEATSEEK_COOK === '0') return; // before/after harness gate
  try {
    if (!Game.nearFire || !Game.nearFire()) return;
    const s = Game.state.scholar; if (!s) return;
    let cooked = 0;
    const sweep = (cont) => {
      if (!cont || cooked >= 6) return;
      for (let i = cont.length - 1; i >= 0 && cooked < 6; i--) {
        const it = cont[i];
        if (!it || it.foodKind !== 'meat' || it.foodState !== 'cleaned') continue;
        if (it.edible === false || (it.kcalEach || 0) <= 0) continue; // unknown: test first
        const mid = String(it.plantId || '').replace(/^meat_/, '');
        try { if (!(Game.data.monsters || []).some(m => m.id === mid)) continue; } catch (e) { continue; }
        try { if (Game.monsterFoodSafe && !Game.monsterFoodSafe(mid)) continue; } catch (e) { continue; }
        try { if (Game.isSpoiled && Game.isSpoiled(it)) continue; } catch (e) {}
        try { Game.cookFood(i, cont); cooked++; } catch (e) {}
      }
    };
    sweep(s.inventory || []);
    try { sweep((Game.prepStash && Game.prepStash()) || []); } catch (e) {}
    if (cooked) ctx.monsterCooked = (ctx.monsterCooked || 0) + cooked;
  } catch (e) {}
}

module.exports = { meatseek, findUnknownFlesh, testUnknownMeat, cookMonsterMeat };
