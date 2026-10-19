// doomeddraw.js — the DOOMED-ONLY DRAW DISCIPLINE (sim-doomeddraw-b 2026-10-18,
// revived as sim-doomrevive-b 2026-10-19 composed with the landed
// surplusfeed governor).
//
// A nightly draw discipline, NOT a feast: after the normal nightly loop
// (wrapped Game.villageEats), the cook serves seconds from the ~2-day doomed
// window ONLY — stock that will rot regardless, never displacing the meal:
//   P1 = bonus-inclusive (spoilDay+bonus)==day+1 — rots at tomorrow's dawn,
//        before any meal or smoke duty can touch it (feastdraw-b canon pin:
//        sweepSpoiled at dawn). No future sink.
//   P2 = bonus-inclusive (spoilDay+bonus)==day+2 — drawn ONLY as measured
//        excess beyond demonstrated sink clearance:
//        p2excess = max(0, p2 - mealClear7 - smokeClear7), trailing-7d
//        measured daily meal fresh-draw and cook smoke kcal (policy-side
//        wraps); <3d history -> p2excess = 0.
// Trigger: (p1+p2excess) > 200*roster (feastdraw's proven trigger).
// Cap: 400*roster/night. NO feast machinery: no feastDay, no buffs, no
// cadence reset, no trust/social effects.
//
// The fresh sink follows the rot-accounting split (finding #546):
// preserved/rendered/pemmican/bonded/spoiled excluded;
// foodState fresh/undefined/cleaned/cooked/smoked/dried all count — the pile
// matches what the primary counts as rot:fresh.
//
// The draw rides the engine's own pantryDraw (cook:true, exposure-rolled per
// villager — no laundering); hunger eased with the meal's own math; takes
// ledgers kept (v.takes + recordTakeHist). EATING CODE UNTOUCHED.
// One honest voice line per fire night names the cook and the food — never
// the lever name.
//
// Env-gated DOOMEDDRAW=1, default OFF everywhere. Gate-off: pure delegation
// — zero wraps, zero ctx writes, zero RNG draws (the det-gate reads this).
'use strict';

const TRIGGER_PER_ROSTER = 200;
const CAP_PER_ROSTER = 400;

function layerOn() {
  try { return typeof process !== 'undefined' && process.env && process.env.DOOMEDDRAW === '1'; }
  catch (e) { return false; }
}

// livingRoster: the collective draw's denominator — excludes the scholar
// (PARITY: never in the collective pot) and the dead (DEAD DON'T EAT).
function livingRoster(Game) {
  const out = [];
  try {
    const v = ((Game || {}).state || {}).village || {};
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.dead) dead = true; } catch (e) {}
      if (dead) continue;
      out.push(id);
    }
  } catch (e) {}
  return out;
}

function spoilBonus(Game) {
  try { return Math.round(Game.spoilBonusDays ? Game.spoilBonusDays() : 0) || 0; } catch (e) { return 0; }
}

// inFreshSink: the rot-accounting split (finding #546) — the pile matches
// what the primary counts as rot:fresh.
function inFreshSink(Game, it) {
  if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) return false;
  if (it.bonded) return false;
  const fs = it.foodState;
  if (fs === 'preserved' || fs === 'rendered') return false;
  if ((it.foodKind || '') === 'pemmican') return false;
  try { if (Game.isSpoiled && Game.isSpoiled(it)) return false; } catch (e) {}
  return true;
}

// freshSink: total kcal of the fresh sink (exported for instruments).
function freshSink(Game) {
  let t = 0;
  try {
    for (const it of ((((Game || {}).state || {}).village) || {}).pantry || []) {
      if (inFreshSink(Game, it)) t += (it.kcalEach || 0) * (it.units || 1);
    }
  } catch (e) {}
  return Math.round(t);
}

function preservedKcal(Game) {
  let t = 0;
  try {
    for (const it of ((((Game || {}).state || {}).village) || {}).pantry || []) {
      if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
        t += (it.kcalEach || 0) * (it.units || 1);
    }
  } catch (e) {}
  return t;
}

// doomedPile: the ~2-day doomed window, bonus-inclusive.
function doomedPile(Game) {
  const day = (((Game || {}).state || {}).scholar || {}).day || 1;
  const bonus = spoilBonus(Game);
  let p1 = 0, p2 = 0;
  try {
    for (const it of ((((Game || {}).state || {}).village) || {}).pantry || []) {
      if (!inFreshSink(Game, it)) continue;
      const w = (it.spoilDay === undefined || it.spoilDay === null) ? 99999 : it.spoilDay + bonus;
      const k = (it.kcalEach || 0) * (it.units || 1);
      if (w === day + 1) p1 += k;
      else if (w === day + 2) p2 += k;
    }
  } catch (e) {}
  return { p1: Math.round(p1), p2: Math.round(p2) };
}

function histMean(hist, days) {
  const h = (hist || []).slice(-days);
  if (!h.length) return 0;
  let t = 0;
  for (const e of h) t += (e && e.kcal) || 0;
  return t / h.length;
}

// serveSeconds: the discipline's nightly pass. Runs AFTER the normal meal
// (the villageEats wrap calls it). Returns kcal drawn.
function serveSeconds(Game, ctx) {
  if (!layerOn()) return 0;
  ctx = ctx || {};
  let v = null;
  try { v = ((Game || {}).state || {}).village || null; } catch (e) {}
  if (!v || !v.pantry) return 0;
  const day = (((Game || {}).state || {}).scholar || {}).day || 0;
  const ids = livingRoster(Game);
  const roster = ids.length || 1;
  const pile = doomedPile(Game);
  const raw = pile.p1 + pile.p2;
  const trigger = TRIGGER_PER_ROSTER * roster;
  // the glut night is counted whether or not the discipline fires — the
  // discipline may correctly stand down when the sinks can clear the pile.
  if (raw > trigger) {
    ctx._ddGlutNights = (ctx._ddGlutNights || 0) + 1;
    ctx._ddRawSeen = (ctx._ddRawSeen || 0) + raw;
  }
  // P2 only as measured excess beyond demonstrated sink clearance. <3d
  // history: the estimate is withheld, not guessed — P2 inert.
  let p2excess = 0;
  const mh = ctx._ddMealHist || [], sh = ctx._ddSmokeHist || [];
  if (mh.length >= 3 && sh.length >= 3) {
    p2excess = Math.max(0, pile.p2 - histMean(mh, 7) - histMean(sh, 7));
  }
  ctx._ddP1 = (ctx._ddP1 || 0) + pile.p1;
  ctx._ddP2x = (ctx._ddP2x || 0) + Math.round(p2excess);
  const want0 = pile.p1 + p2excess;
  if (want0 <= trigger) return 0;
  const cap = CAP_PER_ROSTER * roster;
  let want = Math.min(cap, want0);
  // The cook serves seconds: up to 400/head, doomed-window only. The
  // engine's own pantryDraw is fresh-first (soonest-spoiling), so a draw
  // bounded by the doomed pile can only touch the doomed window; slabs
  // ride last by the anti-slab law. cook:true — the village cook's
  // abstraction, the same one the meal uses.
  let eaten = 0;
  const allItems = [];
  for (const vid of ids) {
    if (want <= 0) break;
    let exposure = null;
    try { exposure = Game.freshExposure ? Game.freshExposure() : {}; } catch (e) { exposure = {}; }
    let drawn = null;
    try { drawn = Game.pantryDraw(v, Math.min(400, want), { cook: true, exposure, round: 'floor1' }); }
    catch (e) { drawn = null; }
    const taken = Math.round((drawn && drawn.taken) || 0);
    if (taken <= 0) continue;
    eaten += taken;
    want -= taken;
    for (const d of ((drawn && drawn.items) || [])) allItems.push(d);
    // hunger eased with the meal's own math (villagerMealDay's formula)
    try {
      const n = Game.npcNeeds ? Game.npcNeeds(vid) : null;
      if (n) n.hunger = Math.max(0, (n.hunger || 0) - Math.round((taken / 2000) * 70));
    } catch (e) {}
    // takes ledgers kept — the freeloader pipeline sees the seconds
    try {
      v.takes = v.takes || {};
      v.takes[vid] = (v.takes[vid] || 0) + taken;
    } catch (e) {}
    try { if (taken > 0 && Game.recordTakeHist) Game.recordTakeHist(vid, taken); } catch (e) {}
    // exposure rolled per villager — the same consequences the meal faces,
    // no laundering
    try { if (Game.villagerFoodPoisoning) Game.villagerFoodPoisoning(v, vid, exposure); } catch (e) {}
  }
  if (eaten <= 0) return 0;
  // one honest voice line per fire night: names the cook and the food —
  // never the lever name. The cook is whoever is on duty (the rotation is
  // honest: the whole village is at the fire).
  try {
    let cookName = 'Someone';
    try {
      const cookId = Game.villageCookId ? Game.villageCookId(v) : null;
      const cp = (cookId && Game.getPerson) ? Game.getPerson(cookId) : null;
      if (cp && cp.name) cookName = String(cp.name).split(' ')[0];
    } catch (e) {}
    let foodName = 'food', bestK = 0;
    for (const d of allItems) {
      const k = (d.units || 0) * (d.effectiveKcal || 0);
      if (k > bestK) { bestK = k; foodName = (d.item && d.item.name) || 'food'; }
    }
    Game.say(`\u{1F37D}\uFE0F ${cookName} sees the ${foodName} won't keep \u2014 seconds all round at the fire, before it turns.`);
  } catch (e) {}
  ctx._ddNights = (ctx._ddNights || 0) + 1;
  ctx._ddKcal = (ctx._ddKcal || 0) + eaten;
  return eaten;
}

// withDoomedDraw: wrap a base policy (leadfeast/belongfeast) with the
// discipline. setup installs: (1) the villageEats wrap — measure the
// nightly meal's fresh draw, then serve seconds; (2) the cook-smoke wrap —
// measure the duty smoke drive's daily preserved output. Gate-off: pure
// delegation, zero wraps, zero ctx writes.
function withDoomedDraw(base, name, desc) {
  const wrapped = Object.assign({}, base);
  wrapped._doomeddrawName = name;
  wrapped._doomeddrawDesc = desc;
  const baseSetup = base.setup;
  wrapped.setup = function (Game, ctx) {
    if (baseSetup) baseSetup.call(this, Game, ctx);
    if (!layerOn()) return;
    if (Game._doomeddrawInstalled) return; // idempotent install
    Game._doomeddrawInstalled = true;
    const origVE = Game.villageEats;
    const origROA = Game.resolveOneAssignment;
    Game.villageEats = function () {
      const day = (((Game || {}).state || {}).scholar || {}).day || 0;
      let before = 0;
      try { before = freshSink(Game); } catch (e) {}
      const r = origVE.apply(this, arguments);
      try {
        // the meal's demonstrated fresh-draw: what the fresh sink lost
        // across the meal (the seconds, served below, are not in this)
        const drawn = Math.max(0, before - freshSink(Game));
        ctx._ddMealHist = ctx._ddMealHist || [];
        ctx._ddMealHist.push({ day, kcal: Math.round(drawn) });
        if (ctx._ddMealHist.length > 14) ctx._ddMealHist = ctx._ddMealHist.slice(-14);
      } catch (e) {}
      try { serveSeconds(Game, ctx); } catch (e) {}
      return r;
    };
    if (typeof origROA === 'function') {
      Game.resolveOneAssignment = function (vid, a) {
        let isCook = false, preK = 0;
        try { isCook = !!(a && a.task === 'cook'); } catch (e) {}
        if (isCook) { try { preK = preservedKcal(Game); } catch (e) {} }
        const r = origROA.apply(this, arguments);
        if (isCook) {
          try {
            const smoked = Math.max(0, preservedKcal(Game) - preK);
            if (smoked > 0) {
              const day = (((Game || {}).state || {}).scholar || {}).day || 0;
              let h = ctx._ddSmokeHist = ctx._ddSmokeHist || [];
              let e0 = (h.length && h[h.length - 1].day === day) ? h[h.length - 1] : null;
              if (!e0) {
                e0 = { day, kcal: 0 };
                h.push(e0);
                if (h.length > 14) ctx._ddSmokeHist = h.slice(-14);
              }
              e0.kcal += Math.round(smoked);
            }
          } catch (e) {}
        }
        return r;
      };
    }
  };
  return wrapped;
}

module.exports = { withDoomedDraw, doomedPile, serveSeconds, freshSink, livingRoster, layerOn, TRIGGER_PER_ROSTER, CAP_PER_ROSTER };
