#!/usr/bin/env node
// scripts/sharcensus-20261014.js — per-villager meal census instrument.
// Wraps villageEats (outermost = membership's roster filter) and
// villagerMealDay + the three draw functions (pantryDraw, drawSpoiled,
// packMeal) to record, for every villager-day, the ENGINE PATH that decided
// the meal outcome. Instrument-only: no game-code changes, no RNG
// consumption, no behavior change — all reads are pure getters.
//
// Engine paths named here are the real code paths in src/js/game.js
// (villagerMealDay ~game.js:26402, pantryDraw ~game.js:25784,
// drawSpoiled ~game.js:25964, packMeal ~game.js:25984) and the membership
// wrapper (src/js/membership.js:1008):
//
//   SKIP paths (no meal attempt):
//     nonmember-withheld — membership.js withholds non-members (exiled) from
//       the roster during villageEats.
//     dead-skipped       — villageEats skips person.dead.
//     player-parity       — the player is never in the collective pot.
//   MEAL paths (one villagerMealDay call):
//     voluntary-fast     — gorge rhythm, hunger<45, RNG<0.35: meals=0, no draw.
//     self-fed            — dayWant<=50: own production covered need, no draw.
//     pantry-fresh        — pantryDraw covered the want (no drawSpoiled).
//     desperation-spoiled — pile.shortOfFresh: drawSpoiled topped up the meal.
//     away-pack           — away from haven: packMeal (away-pack-empty when 0).
//   STARVED-DAY attribution (ate < 0.6*need, !fasting — the engine's own
//   starvation branch condition), layered over the meal path:
//     empty-pantry        — pantry held no fresh candidates at meal time.
//     spoiled-insufficient— desperation ran and still fell short.
//     crumbs-left         — pantry still held crumbs the floor1 rounding rule
//                           would not take (indivisible leftovers).
//     away-pack-empty     — pack yielded nothing.
//     away-pack-short     — pack yielded something but not enough.
//     other-short         — residual; a non-zero count here is a taxonomy gap.
//
// There is deliberately NO trust-gated draw denial path: villager draws are
// first-come-first-served in roster order; trust enters ONLY through sharing
// (gave = surplus * trustFactor). The census records trust, trustFactor and
// gave per villager-day so the distributional hypothesis (sim-findings #115)
// can be tested as a measured link, not an asserted one.
'use strict';

// Post-hoc classifier: pure function of a recorded row + day context.
// Returns { path, starved, starvePath }.
function classify(row, dayCtx) {
  dayCtx = dayCtx || {};
  const r = { path: row.path, starved: false, starvePath: null };
  if (row.skip) return r; // skips carry path, no starvation accounting
  const need = row.need;
  if (!(need > 0)) { r.path = 'unknown-need'; return r; }
  if (!row.fasting && row.ate < need * 0.6) {
    r.starved = true;
    // starvation attribution, in priority order
    if (row.away) {
      r.starvePath = row.drew > 0 ? 'away-pack-short' : 'away-pack-empty';
    } else if (row.spoiledCalled) {
      r.starvePath = row.pantryFreshBefore > 0 ? 'spoiled-insufficient' : 'empty-pantry';
    } else if (row.pantryDrawCalled) {
      // fresh ran short without desperation: either crumbs the floor1 rule
      // would not take, or the pantry genuinely exhausted mid-draw.
      r.starvePath = row.pantryFreshAfter > 0 ? 'crumbs-left' : 'empty-pantry';
    } else if (!row.fasting) {
      // no draw attempted and still starved: only possible when dayWant<=50
      // yet produced<60% need — engine-impossible (need>=~1400); flag it.
      r.starvePath = 'other-short';
    }
    if (!r.starvePath) r.starvePath = 'other-short';
  }
  return r;
}

// need recompute — the engine's exact formula (game.js villagerMealDay):
// need = kcalPerDay * (0.7 + 0.3*healthFactor) [* hearthStretch() if !away].
// Recorded from observed inputs (health before, away, kcalPerDay, hearthMult).
function mealNeed(kcalPerDay, healthBefore, away, hearthMult) {
  const hf = (healthBefore == null ? 100 : healthBefore) / 100;
  let need = (kcalPerDay || 2000) * (0.7 + 0.3 * hf);
  if (!away) need = Math.round(need * (hearthMult || 1));
  return need;
}

function trustFactorOf(trust, pantryTotalKcal) {
  let tf = trust < 30 ? 0.2 : trust < 60 ? 0.5 : trust < 80 ? 0.8 : 1.0;
  // Match villagerMealDay's actual crisis test, which counts all pantry
  // stock, including spoiled food. Fresh stock remains a separate measure.
  if (pantryTotalKcal < 5000) tf = Math.min(1.0, tf * 2);
  return tf;
}

function pantryFreshKcal(Game, v) {
  let t = 0;
  try {
    for (const it of (v.pantry || [])) {
      if (it && (it.kcalEach || 0) > 0 && (it.units || 0) > 0 &&
          !(Game.isSpoiled && Game.isSpoiled(it))) t += (it.kcalEach || 0) * (it.units || 0);
    }
  } catch (e) {}
  return t;
}

// installShareCensus(Game) — wraps the meal pipeline on a live Game.
// Returns { rows, skips, uninstall }.
// rows: one per villagerMealDay call. skips: one per withheld/dead/player
// roster id per villageEats day.
function installShareCensus(Game) {
  const C = { rows: [], skips: [], current: null, order: 0,
              oVillageEats: Game.villageEats, oMealDay: Game.villagerMealDay,
              oPantryDraw: Game.pantryDraw, oDrawSpoiled: Game.drawSpoiled,
              oPackMeal: Game.packMeal };

  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const nameOf = (vid) => { try { return Game.npcName ? Game.npcName(vid) : String(vid); } catch (e) { return String(vid); } };

  // --- draw-function wraps: flag the call on the current villager-day row.
  if (typeof C.oPantryDraw === 'function') Game.pantryDraw = function (v, want, opts) {
    const rec = C.current;
    let out;
    try { out = C.oPantryDraw.apply(this, arguments); }
    catch (e) { if (rec) rec.pantryDrawThrew = String(e && e.message || e); throw e; }
    if (rec) { rec.pantryDrawCalled = true; }
    return out;
  };
  if (typeof C.oDrawSpoiled === 'function') Game.drawSpoiled = function (v, want, exposure) {
    const rec = C.current;
    let got = 0;
    try { got = C.oDrawSpoiled.apply(this, arguments); }
    catch (e) { if (rec) rec.drawSpoiledThrew = String(e && e.message || e); throw e; }
    if (rec) { rec.spoiledCalled = true; rec.spoiledTook = got; }
    return got;
  };
  if (typeof C.oPackMeal === 'function') Game.packMeal = function (vid, want, exposure) {
    const rec = C.current;
    let got = 0;
    try { got = C.oPackMeal.apply(this, arguments); }
    catch (e) { if (rec) rec.packMealThrew = String(e && e.message || e); throw e; }
    if (rec) { rec.packMealCalled = true; rec.packTook = got; }
    return got;
  };

  // --- villagerMealDay wrap: one row per call.
  if (typeof C.oMealDay === 'function') Game.villagerMealDay = function (vid, person, v, ctx) {
    const day = dayOf();
    const sid = this.villagerId;
    if (vid === sid) return C.oMealDay.apply(this, arguments); // player parity: unwrapped
    const rec = {
      kind: 'meal', day, vid: String(vid), name: nameOf(vid),
      order: C.order++,
      trust: null, healthBefore: null, healthAfter: null,
      hungerBefore: null, hungerAfter: null,
      away: !!(v.away && v.away[vid]),
      rhythm: null, kcalPerDay: (person && person.kcalPerDay) || 2000,
      hearthMult: 1,
      pantryFreshBefore: 0, pantryFreshAfter: 0, pantryTotalBefore: 0,
      ate: 0, drew: 0, gave: 0, fasting: false,
      pantryDrawCalled: false, spoiledCalled: false, spoiledTook: 0,
      packMealCalled: false, packTook: 0,
      path: 'unclassified', need: 0, trustFactor: 0,
    };
    // pre-meal reads — all pure getters, no RNG
    try { rec.trust = (v.trust && v.trust[vid] !== undefined) ? v.trust[vid] : 10; } catch (e) { rec.trust = 10; }
    try { rec.healthBefore = (v.health && v.health[vid] !== undefined) ? v.health[vid] : 100; } catch (e) { rec.healthBefore = 100; }
    try { const n = this.npcNeeds ? this.npcNeeds(vid) : null; rec.hungerBefore = n ? (n.hunger || 0) : 0; } catch (e) {}
    try { rec.rhythm = this.mealRhythm ? this.mealRhythm(vid) : '?'; } catch (e) { rec.rhythm = '?'; }
    try { rec.hearthMult = (this.hearthStretch ? this.hearthStretch() : 1) || 1; } catch (e) {}
    rec.pantryFreshBefore = pantryFreshKcal(this, v);
    rec.pantryTotalBefore = (v.pantry || []).reduce((total, item) =>
      total + (item.kcalEach || 0) * (item.units || 1), 0);
    rec.trustFactor = trustFactorOf(rec.trust, rec.pantryTotalBefore);
    rec.need = mealNeed(rec.kcalPerDay, rec.healthBefore, rec.away, rec.hearthMult);
    const prev = C.current; C.current = rec;
    let r;
    try { r = C.oMealDay.apply(this, arguments); }
    finally { C.current = prev; }
    // post-meal reads
    try {
      r = r || {};
      rec.ate = r.ate || 0; rec.drew = r.drawn || 0; rec.gave = r.gave || 0;
      rec.fasting = !!r.fasting;
      rec.ownEat = Math.max(0, rec.ate - rec.drew);
    } catch (e) {}
    try { rec.healthAfter = (v.health && v.health[vid] !== undefined) ? v.health[vid] : rec.healthBefore; } catch (e) {}
    try { const n = this.npcNeeds ? this.npcNeeds(vid) : null; rec.hungerAfter = n ? (n.hunger || 0) : 0; } catch (e) {}
    rec.pantryFreshAfter = pantryFreshKcal(this, v);
    // path from the observed call pattern — the real engine branches
    if (rec.fasting) rec.path = 'voluntary-fast';
    else if (rec.away && rec.packMealCalled) rec.path = rec.packTook > 0 ? 'away-pack' : 'away-pack-empty';
    else if (rec.spoiledCalled) rec.path = 'desperation-spoiled';
    else if (rec.pantryDrawCalled) rec.path = 'pantry-fresh';
    else rec.path = 'self-fed';
    C.rows.push(rec);
    return r;
  };

  // --- villageEats wrap (outermost): skip records + per-day pantry bounds.
  if (typeof C.oVillageEats === 'function') Game.villageEats = function () {
    const v = this.state.village || {};
    const day = dayOf();
    const sid = this.villagerId;
    C.order = 0;
    const dayFreshBefore = pantryFreshKcal(this, v);
    // skip records — the engine's own skip decisions, observed not duplicated:
    // membership withholds non-members; the loop skips dead and the player.
    try {
      for (const id of (v.roster || [])) {
        let skip = null;
        try { if (typeof this.isMember === 'function' && !this.isMember(id)) skip = 'nonmember-withheld'; } catch (e) {}
        if (!skip) { try { if (id !== sid && this.getPerson && (this.getPerson(id) || {}).dead) skip = 'dead-skipped'; } catch (e) {} }
        if (!skip && id === sid) skip = 'player-parity';
        if (skip) {
          let trust = 10;
          try { trust = (v.trust && v.trust[id] !== undefined) ? v.trust[id] : 10; } catch (e) {}
          C.skips.push({ kind: 'skip', day, vid: String(id), name: nameOf(id), path: skip, trust });
        }
      }
    } catch (e) {}
    let out;
    try { out = C.oVillageEats.apply(this, arguments); }
    finally { /* rows already pushed by the inner wrap */ }
    return out;
  };

  const uninstall = () => {
    if (C.oVillageEats && Game.villageEats !== C.oVillageEats) Game.villageEats = C.oVillageEats;
    if (C.oMealDay && Game.villagerMealDay !== C.oMealDay) Game.villagerMealDay = C.oMealDay;
    if (C.oPantryDraw && Game.pantryDraw !== C.oPantryDraw) Game.pantryDraw = C.oPantryDraw;
    if (C.oDrawSpoiled && Game.drawSpoiled !== C.oDrawSpoiled) Game.drawSpoiled = C.oDrawSpoiled;
    if (C.oPackMeal && Game.packMeal !== C.oPackMeal) Game.packMeal = C.oPackMeal;
  };
  return { rows: C.rows, skips: C.skips, uninstall, classify, mealNeed, trustFactorOf };
}

module.exports = { installShareCensus, classify, mealNeed, trustFactorOf, pantryFreshKcal };
