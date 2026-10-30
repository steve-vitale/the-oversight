#!/usr/bin/env node
// scripts/trace-starveplenty-b.js — DIAG instrument for sim-starveplenty-b.
// Zero game changes: record-only wrappers around meal/pantry/starvation
// paths, plus plain state reads. No wrapper calls a Game helper that rolls
// RNG or initializes state, EXCEPT two pure predicates documented here:
//   Game.isSpoiled(item) — the engine's own spoilage boundary (pure
//     comparison; the spoilDay<=day approximation would mis-split
//     bonus-preserved items), and Game.plantsKnownBy(vid) — a pure union
//     read over familiar/taught/plantKnowledge arrays.
//   Game.vpOf / Game.isMember — pure identity/membership lookups used
//     only for the end-of-run roster detail (backlog #1495 note).
// Hunger is read from the plain v.needs map (no npcNeeds() call, which
// would initialize missing entries).
//
// Usage: node scripts/trace-starveplenty-b.js <seed> <days> <out.json>
// One process per seed (never two harnesses in one process).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function pantrySplit(Game, v) {
  const day = (Game.state.scholar || {}).day || 0;
  let total = 0, fresh = 0, spoiled = 0, unknown = 0, freshItems = 0;
  for (const it of (v.pantry || [])) {
    const kcal = (it.kcalEach || 0) * (it.units || 1);
    total += kcal;
    if ((it.kcalEach || 0) <= 0) { unknown += kcal; continue; }
    let sp = false;
    try { sp = !!(Game.isSpoiled && Game.isSpoiled(it)); }
    catch (e) { sp = it.spoilDay !== undefined && it.spoilDay <= day; }
    if (sp) spoiled += kcal; else { fresh += kcal; freshItems++; }
  }
  return { total: Math.round(total), fresh: Math.round(fresh), spoiled: Math.round(spoiled), unknown: Math.round(unknown), freshItems };
}

function pantryItems(Game, v) {
  const day = (Game.state.scholar || {}).day || 0;
  return (v.pantry || []).map(it => {
    let sp = false;
    try { sp = !!(Game.isSpoiled && Game.isSpoiled(it)); } catch (e) { sp = it.spoilDay !== undefined && it.spoilDay <= day; }
    return { id: it.plantId || it.itemId || it.id || '?', name: it.name || '?', kcalEach: it.kcalEach || 0, units: it.units || 0, spoilDay: it.spoilDay ?? null, spoiled: sp, foodState: it.foodState || null, foodKind: it.foodKind || null };
  });
}

async function main() {
  const seed = parseInt(process.argv[2], 10);
  const days = parseInt(process.argv[3], 10) || 180;
  const out = process.argv[4];
  if (!Number.isFinite(seed) || !out) { console.error('usage: trace-starveplenty-b.js <seed> <days> <out.json>'); process.exit(2); }
  const { Game, manifest } = await loadGame({ seed, mode: 'trace-starveplenty-b' });
  await setupGame(Game);

  const rec = { seed, daysCap: days, daily: [], meals: [], draws: [], starveHits: [], scholarMeals: [], packMeals: [] };
  let curMeal = null; // {vid, day} while inside villagerMealDay
  let curPack = null; // vid while inside packMeal
  let curScholarMeal = false;
  let producedByKey = {};

  const dayOf = () => (Game.state.scholar || {}).day || 0;
  const healthOf = (v, vid) => (v.health && v.health[vid] !== undefined) ? v.health[vid] : null;
  const hungerOf = (v, vid) => ((v.needs || {})[vid] || {}).hunger ?? null;
  const livingCount = (v) => (v.roster || []).filter(id => {
    try { const c = Game.vpOf(id); return c && c.id === id && !c.dead && c.alive !== false; } catch (e) { return false; }
  }).length;

  // --- villagerDayProduction: record produced for the in-flight meal only
  const origProd = Game.villagerDayProduction;
  if (typeof origProd === 'function') {
    Game.villagerDayProduction = function (person, vid, v) {
      const r = origProd.apply(this, arguments);
      try { if (curMeal && curMeal.vid === vid) producedByKey[vid + '@' + curMeal.day] = Math.round(r); } catch (e) {}
      return r;
    };
  }
  // --- packMeal: tag nested pantryDraw calls as top-ups; record pack kcal
  const origPack = Game.packMeal;
  if (typeof origPack === 'function') {
    Game.packMeal = function (vid, want, exposure) {
      const v = this.state.village;
      const before = v && v.pack && v.pack[vid] ? Math.round(v.pack[vid].kcal || 0) : null;
      const dawn = v && v.pack && v.pack[vid] ? (v.pack[vid].dawnKcal ?? null) : null;
      curPack = vid;
      let r;
      try { r = origPack.apply(this, arguments); } finally { curPack = null; }
      const after = v && v.pack && v.pack[vid] ? Math.round(v.pack[vid].kcal || 0) : null;
      rec.packMeals.push({ day: dayOf(), vid, want: Math.round(want), taken: Math.round(r || 0), packBefore: before, packAfter: after, dawnKcal: dawn });
      return r;
    };
  }
  // --- pantryDraw: record every draw with its context
  const origDraw = Game.pantryDraw;
  if (typeof origDraw === 'function') {
    Game.pantryDraw = function (v, want, opts) {
      const before = v && v.pantry ? pantrySplit(Game, v) : null;
      const r = origDraw.apply(this, arguments);
      const ctx = curMeal ? 'meal:' + curMeal.vid : curScholarMeal ? 'scholarMeal' : curPack ? 'packTopUp:' + curPack : 'other';
      rec.draws.push({ day: dayOf(), ctx, want: Math.round(want), taken: Math.round((r && r.taken) || 0), shortOfFresh: !!(r && r.shortOfFresh), pantryBefore: before, pantryAfter: v && v.pantry ? pantrySplit(Game, v) : null });
      return r;
    };
  }
  // --- villageMeal (scholar): record the scholar's own draw, the
  // roster-order drain candidate that eats before villageEats.
  const origVM = Game.villageMeal;
  if (typeof origVM === 'function') {
    Game.villageMeal = function () {
      const v = this.state.village;
      const before = v ? pantrySplit(Game, v) : null;
      curScholarMeal = true;
      let r;
      try { r = origVM.apply(this, arguments); } finally { curScholarMeal = false; }
      rec.scholarMeals.push({ day: dayOf(), result: (r && typeof r === 'object') ? JSON.stringify(r).slice(0, 200) : String(r), pantryBefore: before, pantryAfter: v ? pantrySplit(Game, v) : null });
      return r;
    };
  }
  // --- villagerMealDay: the per-villager meal row
  const origMeal = Game.villagerMealDay;
  if (typeof origMeal === 'function') {
    Game.villagerMealDay = function (vid, person, v, ctx) {
      const day = dayOf();
      const away = !!(v.away && v.away[vid]);
      const hBefore = healthOf(v, vid);
      const pantryBefore = pantrySplit(Game, v);
      const packBefore = v.pack && v.pack[vid] ? Math.round(v.pack[vid].kcal || 0) : null;
      curMeal = { vid, day };
      let r;
      try { r = origMeal.apply(this, arguments); } finally { curMeal = null; }
      rec.meals.push({
        day, vid, away,
        produced: producedByKey[vid + '@' + day] ?? null,
        ate: r ? Math.round(r.ate) : null, gave: r ? Math.round(r.gave) : null,
        drawn: r ? Math.round(r.drawn || 0) : null, fasting: !!(r && r.fasting),
        healthBefore: hBefore, healthAfter: healthOf(v, vid),
        hungerAfter: hungerOf(v, vid),
        pantryBefore, pantryAfter: pantrySplit(Game, v),
        packBefore, packAfter: v.pack && v.pack[vid] ? Math.round(v.pack[vid].kcal || 0) : null,
        deadAfter: !!(person && person.dead),
      });
      return r;
    };
  }
  // --- hurtFromStarvation: every -8 meal hit and -4 famine hit
  const origHurt = Game.hurtFromStarvation;
  if (typeof origHurt === 'function') {
    Game.hurtFromStarvation = function (vid, damage) {
      const v = this.state.village;
      const hBefore = v ? healthOf(v, vid) : null;
      const r = origHurt.apply(this, arguments);
      let person = null;
      try { person = this.vpOf(vid); } catch (e) {}
      rec.starveHits.push({ day: dayOf(), vid, damage, healthBefore: hBefore, healthAfter: v ? healthOf(v, vid) : null, died: !!(person && person.dead), inMeal: !!curMeal, mealVid: curMeal ? curMeal.vid : null });
      return r;
    };
  }
  // --- villageEats: day-boundary pantry + membership + knowledge snapshot
  const origEats = Game.villageEats;
  if (typeof origEats === 'function') {
    Game.villageEats = function () {
      const v = this.state.village;
      const day = dayOf();
      const entry = v ? { pantry: pantrySplit(Game, v), hungryDays: v.hungryDays || 0, living: livingCount(v), roster: (v.roster || []).slice(), items: pantryItems(Game, v) } : null;
      let known = null;
      try { known = v ? Object.keys(v.sharedKnowledge || {}).length : null; } catch (e) {}
      let codexPlants = null;
      try { codexPlants = Object.keys((Game.state.codex || {}).plants || {}).length; } catch (e) {}
      const r = origEats.apply(this, arguments);
      const v2 = this.state.village;
      rec.daily.push({
        day, entry, exit: v2 ? { pantry: pantrySplit(Game, v2), hungryDays: v2.hungryDays || 0, living: livingCount(v2), scattered: !!v2.scattered, extinct: !!v2.extinct } : null,
        sharedKnowledge: known, codexPlants,
      });
      return r;
    };
  }

  const policy = Object.assign({}, competent);
  const result = await runDays(Game, policy, { days, manifest });
  // End-of-run roster detail (#1495 wrinkle probe): dead flag, identity
  // match, membership, health, away — as plain state reads.
  const v = Game.state.village || {};
  const finalRoster = (v.roster || []).map(id => {
    let person = null, vp = null;
    try { person = Game.getPerson(id); } catch (e) {}
    try { vp = Game.vpOf(id); } catch (e) {}
    let member = null;
    try { member = typeof Game.isMember === 'function' ? !!Game.isMember(id) : null; } catch (e) {}
    return {
      id, dead: !!(person && person.dead), aliveFlag: person ? (person.alive ?? null) : null,
      vpOfMatch: !!(vp && vp.id === id), member,
      health: (v.health && v.health[id] !== undefined) ? v.health[id] : null,
      away: !!(v.away && v.away[id]),
      occ: person ? (person.occupationId || person.formerOccupation || null) : null,
    };
  });
  // Per-villager knowledge at end (survivors only; the dead keep their
  // last meal-row knowledge context via sharedKnowledge counts).
  const payload = {
    seed, daysCap: days, days: result.days, endReason: result.endReason,
    won: !!Game.won, villageLost: !!Game.villageLost, over: !!Game.over,
    deaths: (result.samples && result.samples.deaths) || [],
    scholarVid: Game.villagerId || null,
    finalRoster, finalDay: dayOf(),
    daily: rec.daily, meals: rec.meals, draws: rec.draws,
    starveHits: rec.starveHits, scholarMeals: rec.scholarMeals, packMeals: rec.packMeals,
  };
  fs.mkdirSync(require('path').dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({ seed, days: result.days, endReason: result.endReason, deaths: payload.deaths.length, starveHits: rec.starveHits.length, meals: rec.meals.length, out }));
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
