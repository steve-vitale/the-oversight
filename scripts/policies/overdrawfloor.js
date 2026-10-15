#!/usr/bin/env node
// scripts/policies/overdrawfloor.js — FRESH-FIRST DRAWDOWN instrument (overdrawfloor lineage).
//
// REBUILT 2026-10-15 (flesh-out loop B, sim-belongfeast) from the preserved
// spec in evidence/2026-10-15/sim-overdrawfloor-b.md after the original layer
// was deleted per the kill protocol. This is an INSTRUMENT, not a lever:
// it exists so sim-findings #259 can answer "does the belong-road feast verb
// drive the starvation elevation?" The rebuild reproduces the killed arm's
// drawdown behavior verb-for-verb (proof: scripts/test-overdrawfloor-20261015.js,
// RED→GREEN R1–R3 + G1–G12) on the belongseek road.
//
// Spec (preserved, evidence/2026-10-15/sim-overdrawfloor-b.md):
//   - Default OFF via OVERDRAWFLOOR=1. Gate off = pure delegation to the
//     parent policy (byte-identical, R1).
//   - 3-DAY FLOOR: maxDrawdownKcal = freshKcal - 3*burnAt; aid needs >= 1500 of it.
//   - FRAGILITY GATE (pure-read, daily): no drawdown when fresh-days < 5, OR
//     the trailing-5d mean exceeds today by >= 1 fresh-day (needs >= 3
//     trailing samples), OR a hungry day in the trailing 7d. Holds counted
//     as osFragileHeld (a "would-have-fired" hold, ag2 convention).
//   - SIEGE GATE: no drawdown with a lingering raider, a raid in the last
//     7 days, or a gorge night yesterday. Holds counted as osGateHeld.
//   - VERBS: aid (tends a thin untended subordinate link: 1,500 kcal, fires
//     BEFORE the parent's daily; the parent keeps its own rhythm on
//     non-drawdown days and dedups via tendedWeek) and feast (r13-style
//     candidacy: dusk, at haven, one/day, cadence 7d armed / 14d unarmed,
//     contribution recentGives(7)+tribute/tend(7) >= 1500, affordability
//     have >= cost*1.5, cost <= 3-day floor, fusion ceiling). NO tribute verb.
//   - FRESH-FIRST: every verb pre-draws through pantryDraw's soonest-
//     spoiling-first ordering and the engine verb's removal is answered from
//     the pre-draw (rollback on refusal — G5b). Attribution sink on
//     Game.__odfSink ('aid'/'feast') so harness instruments can count it.
//   - PRIORITY: aid > feast, both call orders (one verb per day, _osFired).
//   - Cause lines after CONFIRMED verbs only (player-facing: mark [needs-eyes]).
//
// Zero src/js changes. Policy-side only.
'use strict';
const { leadcourt } = require('./leadcourt');
const { belongseek } = require('./belongseek');
const { recentGives } = require('./competent');

function layerOn() { return process.env.OVERDRAWFLOOR === '1'; }

const HOME = 'haven';

// ---- pantry reads (pure getters) ----
function freshKcalOf(Game) {
  try { return Game.pantryFreshKcal ? Math.round(Game.pantryFreshKcal()) : 0; }
  catch (e) { return 0; }
}
function freshDaysOf(Game) {
  try { return Game.pantryFreshDays ? Game.pantryFreshDays() : 0; }
  catch (e) { return 0; }
}
function burnAt(Game) {
  try {
    const hist = (((Game.state || {}).village || {}).burnHistory || []).filter(x => x > 0);
    if (hist.length) return hist.reduce((a, b) => a + b, 0) / hist.length;
    const pop = ((((Game.state || {}).village || {}).roster || []).length) || 12;
    return pop * 2000;
  } catch (e) { return 24000; }
}
function maxDrawdownKcal(Game) {
  return Math.max(0, Math.round(freshKcalOf(Game) - 3 * burnAt(Game)));
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// ---- pre-draw: fresh-first draw held for the engine verb ----
// Draws `kcal` through the LIVE pantryDraw (soonest-spoiling-first — finding
// #199: any drawdown arm must use this end). The engine verb's removal is
// answered from this draw; rollback() restores the pantry exactly on refusal.
function preDraw(Game, kcal) {
  const v = Game.state.village || {};
  const snapshot = (v.pantry || []).map(it => Object.assign({}, it));
  let r = null;
  try { r = Game.pantryDraw(v, kcal, {}); } catch (e) { r = null; }
  const taken = Math.round((r && r.taken) || 0);
  let cancelled = false;
  return {
    taken,
    items: (r && r.items) || [],
    cancel() { cancelled = true; },
    rollback() {
      if (cancelled) return;
      try { Game.state.village.pantry = snapshot.map(it => Object.assign({}, it)); } catch (e) {}
    },
  };
}

// ---- fragility gate (pure read) ----
// Returns 'near-floor' | 'trending' | 'hunger' | null. Fragile → hold.
function fragilityOf(Game, ctx) {
  const fd = freshDaysOf(Game);
  if (fd < 5) return 'near-floor';
  const trail = (ctx._odfTrail || []).slice(-6, -1); // prior days only, never today
  if (trail.length >= 3) {
    const mean = trail.reduce((t, e) => t + (e.fd || 0), 0) / trail.length;
    if (mean - fd >= 1) return 'trending';
  }
  const day = gday(Game);
  for (const e of (ctx._odfTrail || [])) {
    if (e && e.hungry && (day - (e.day || 0)) <= 7) return 'hunger';
  }
  // hungryStreak backstop (evidence spec): the engine's own hunger signal.
  try {
    const pg = Game.progState ? Game.progState() : null;
    if (pg && (pg.hungryStreak || 0) > 0) return 'hunger';
  } catch (e) {}
  return null;
}

// ---- siege gate: lingerer / recent raid / yesterday's gorge ----
// Returns 'lingerer' | 'raid' | 'gorge' | null. Held → hold.
function siegeOf(Game, ctx) {
  try {
    const ms = Game.worldMonsters ? Game.worldMonsters() : [];
    for (const m of ms) if (m && m.lingering && (m.hp || 0) > 0) return 'lingerer';
  } catch (e) {}
  try {
    const v = Game.state.village || {};
    if (gday(Game) - (v.lastRaidDay || -999) < 7) return 'raid';
  } catch (e) {}
  try {
    const day = gday(Game);
    const seen = new Set();
    for (const gn of ((ctx._predTrack || {}).gorgeNights || [])) if (gn) seen.add(gn.day);
    for (const d of (Game.__odfGorgeDays || [])) seen.add(d);
    for (const d of seen) if (day - d <= 1 && day - d >= 0) return 'gorge';
  } catch (e) {}
  return null;
}

// ---- trail recording (daily, pure read) ----
function recordTrail(Game, ctx) {
  try {
    const day = gday(Game);
    const fd = freshDaysOf(Game);
    const v = Game.state.village || {};
    const hNow = v.hungryDays || 0;
    const hungry = hNow > (ctx._odfLastHungry || 0);
    ctx._odfLastHungry = hNow;
    ctx._odfTrail = ctx._odfTrail || [];
    const last = ctx._odfTrail[ctx._odfTrail.length - 1];
    if (!last || last.day !== day) ctx._odfTrail.push({ day, fd, hungry });
    while (ctx._odfTrail.length > 10) ctx._odfTrail.shift();
  } catch (e) {}
}

// ---- aid candidacy: an active primary-haven link untended this week ----
function aidLink(Game) {
  try {
    const links = Game.hierarchyState ? Game.hierarchyState() : [];
    const week = Game._week ? Game._week() : 0;
    for (const l of links) {
      if (!l || l.status !== 'active' || l.primary !== HOME) continue;
      if (l.tendedWeek === week) continue;
      return l;
    }
  } catch (e) {}
  return null;
}

// ---- contribution history (r13 symmetry): tribute/tend paid kcal ----
function recentTrib(Game, ctx, days) {
  try {
    const day = gday(Game);
    const hist = ctx._tribHist || [];
    let t = 0;
    for (const e of hist) if (e && e.day > day - days) t += (e.kcal || 0);
    if (ctx._tribHist && ctx._tribHist.length > 40) ctx._tribHist = ctx._tribHist.slice(-40);
    return t;
  } catch (e) { return 0; }
}
function trackTribute(Game, ctx) {
  const op = Game.payTribute, ot = Game.tendLink;
  const rec = (r) => {
    try {
      if (typeof r === 'number' && r > 0) {
        ctx._tribHist = ctx._tribHist || [];
        ctx._tribHist.push({ day: gday(Game), kcal: Math.round(r) });
      }
    } catch (e) {}
  };
  if (typeof op === 'function') {
    Game.payTribute = function () { const r = op.apply(this, arguments); rec(r); return r; };
  }
  if (typeof ot === 'function') {
    Game.tendLink = function () { const r = ot.apply(this, arguments); rec(r); return r; };
  }
  return () => {
    if (typeof op === 'function') Game.payTribute = op;
    if (typeof ot === 'function') Game.tendLink = ot;
  };
}

// ---- feast candidacy (r13-style) ----
// Returns the plan when the layer's feast may fire, else null.
function feastCandidacy(Game, ctx) {
  try {
    if (Game.dayPart !== 2) return null; // dusk
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (s.feastDay === day) return null;
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return null;
    const armed = !!((s.prog || {}).feastSurge);
    let armedForFeast = armed;
    try { if (armed && Game.fusionReactorOnline && Game.fusionReactorOnline()) armedForFeast = false; } catch (e) {}
    const cadence = armedForFeast ? 7 : 14;
    if (ctx._odfLastFeastDay && (day - ctx._odfLastFeastDay) < cadence) return null;
    const contrib = recentGives(Game, ctx, 7) + recentTrib(Game, ctx, 7);
    if (contrib < 1500) return null;
    if (ctx._osFired === day) return null; // one verb per day
    if (aidLink(Game)) return null; // aid > feast: the feast yields to the aid channel
    if (freshDaysOf(Game) <= 4) return null; // the overstock trigger
    if (siegeOf(Game, ctx)) return null; // gates checked before the plan (cheap reads)
    if (fragilityOf(Game, ctx)) return null;
    const plan = Game.feastPlan ? Game.feastPlan() : null;
    if (!plan || !plan.ok) return null;
    if (plan.have < plan.cost * 1.5) return null; // honest buffer — never feast into famine
    if (plan.cost > maxDrawdownKcal(Game)) return null; // the 3-day floor
    return plan;
  } catch (e) { return null; }
}

function ovName(Game, vid) {
  try { return Game._ovName ? Game._ovName(vid) : vid; } catch (e) { return vid; }
}

// ---- the verbs ----
function fireAid(Game, ctx) {
  const link = aidLink(Game);
  if (!link) return false;
  const fd = freshDaysOf(Game);
  if (fd <= 4) return false; // the overstock trigger
  const fg = fragilityOf(Game, ctx);
  if (fg) { ctx.osFragileHeld = (ctx.osFragileHeld || 0) + 1; return false; }
  const sg = siegeOf(Game, ctx);
  if (sg) { ctx.osGateHeld = (ctx.osGateHeld || 0) + 1; return false; }
  const md = maxDrawdownKcal(Game);
  if (md < 1500) return false; // the 3-day floor holds the aid
  const day = gday(Game);
  Game.__odfSink = 'aid';
  const draw = preDraw(Game, 1500);
  const oRem = Game._removePantryKcal;
  let consumed = false;
  if (typeof oRem === 'function') {
    Game._removePantryKcal = function (kcal) {
      if (!consumed && kcal <= draw.taken) { consumed = true; return draw.taken; }
      return oRem.apply(this, arguments);
    };
  }
  let paid = 0;
  try { paid = Game.tendLink(link.id); } catch (e) { paid = 0; }
  finally {
    if (typeof oRem === 'function') Game._removePantryKcal = oRem;
    Game.__odfSink = null;
  }
  if (paid > 0 && consumed) {
    draw.cancel();
    ctx.osAid = (ctx.osAid || 0) + 1;
    ctx.osAidKcal = (ctx.osAidKcal || 0) + Math.round(paid);
    ctx._osFired = day;
    const fdNow = freshDaysOf(Game);
    try {
      Game.say(`🌾 Haven's shelves hold ~${Math.round(fdNow)} days of fresh — more than the village eats before it turns. The surplus goes to ${ovName(Game, link.subordinate)}'s fire, not the rot.`);
    } catch (e) {}
    return true;
  }
  draw.rollback();
  return false;
}

function fireFeast(Game, ctx, plan) {
  plan = plan || feastCandidacy(Game, ctx);
  if (!plan) return false;
  const fdBefore = freshDaysOf(Game);
  const day = gday(Game);
  Game.__odfSink = 'feast';
  const draw = preDraw(Game, plan.cost);
  const oDraw = Game.pantryDraw, oPlan = Game.feastPlan;
  let consumed = false;
  if (typeof oDraw === 'function') {
    Game.pantryDraw = function (v, want, opts) {
      if (!consumed && want <= draw.taken) {
        consumed = true;
        return { taken: draw.taken, items: draw.items, shortOfFresh: false };
      }
      return oDraw.apply(this, arguments);
    };
  }
  if (typeof oPlan === 'function') Game.feastPlan = function () { return plan; };
  let rep = null;
  try { rep = Game.hostFeast(); } catch (e) { rep = null; }
  finally {
    if (typeof oDraw === 'function') Game.pantryDraw = oDraw;
    if (typeof oPlan === 'function') Game.feastPlan = oPlan;
    Game.__odfSink = null;
  }
  if (rep && rep.ok && consumed) {
    draw.cancel();
    const fdAfter = freshDaysOf(Game);
    ctx.osFeasts = (ctx.osFeasts || 0) + 1;
    ctx.osFeastKcal = (ctx.osFeastKcal || 0) + Math.round(draw.taken);
    ctx._osFired = day;
    ctx._odfLastFeastDay = day;
    ctx._odfFeastEvents = ctx._odfFeastEvents || [];
    ctx._odfFeastEvents.push({
      day, kcal: Math.round(draw.taken),
      fdBefore: +fdBefore.toFixed(2), fdAfter: +fdAfter.toFixed(2),
    });
    try {
      Game.say(`🍖 The shelves groan — ~${Math.round(fdAfter)} days of fresh on hand, and the rot is already circling. We eat the mountain tonight, or it eats itself.`);
    } catch (e) {}
    return true;
  }
  if (rep && /Nobody came/.test(rep.why || '')) ctx._odfLastFeastDay = day; // read the room
  draw.rollback();
  return false;
}

// ---- layer hooks ----
function layerSetup(Game, ctx, base) {
  if (!layerOn()) return base.setup ? base.setup(Game, ctx) : undefined;
  ctx._odfTrail = [];
  ctx._predTrack = { gorgeNights: [] };
  try { ctx._odfLastHungry = ((Game.state.village || {}).hungryDays || 0); } catch (e) { ctx._odfLastHungry = 0; }
  ctx._odfFeastEvents = [];
  // gorge-night beat tracking: pure text match on the engine's honest beat.
  // Pushes to the Game object so every ctx shape sees it (the det-gate's
  // manual-setup ctx differs from runDays' ctx).
  if (!Game.__odfSayWrapped && typeof Game.say === 'function') {
    const oSay = Game.say, self = Game;
    Game.__odfSayWrapped = true;
    Game.say = function (t) {
      try {
        if (/gorges at the treeline/.test(String(t))) {
          self.__odfGorgeDays = self.__odfGorgeDays || [];
          self.__odfGorgeDays.push(gday(self));
        }
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
  }
  return base.setup ? base.setup(Game, ctx) : undefined;
}

function layerDaily(Game, ctx, base) {
  if (!layerOn()) return base.daily(Game, ctx);
  const restore = trackTribute(Game, ctx);
  try {
    fireAid(Game, ctx); // the aid verb runs BEFORE the parent's daily
    recordTrail(Game, ctx);
    return base.daily(Game, ctx);
  } finally { restore(); }
}

function layerUpkeep(Game, ctx, base) {
  if (!layerOn()) { if (base.upkeep) return base.upkeep(Game, ctx); return; }
  if (base.upkeep) base.upkeep(Game, ctx);
  fireFeast(Game, ctx);
}

function wrap(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) { return layerSetup(Game, ctx, base); },
    daily(Game, ctx) { return layerDaily(Game, ctx, base); },
    upkeep(Game, ctx) { return layerUpkeep(Game, ctx, base); },
  });
}

const overleadfloor = wrap(
  leadcourt, 'overleadfloor',
  'leadcourt + overdrawfloor fresh-first drawdown (OVERDRAWFLOOR=1): 3-day floor + fragility gate, aid+feast verbs, no tribute'
);
const overbelongfloor = wrap(
  belongseek, 'overbelongfloor',
  'belongseek + overdrawfloor fresh-first drawdown (OVERDRAWFLOOR=1): 3-day floor + fragility gate, aid+feast verbs, no tribute'
);

module.exports = { overleadfloor, overbelongfloor, maxDrawdownKcal, burnAt, preDraw, layerOn };
