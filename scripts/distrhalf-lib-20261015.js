#!/usr/bin/env node
// scripts/distrhalf-lib-20261015.js — DISTRIBUTION-STARVATION diagnostic
// instrument (loop B, 2026-10-15, food-economy axis — sim-findings #272
// TRUST-THROTTLED HALF-RATIONS).
//
// INSTRUMENT ONLY — zero src/js changes. Harness-side wraps (call-through,
// the predation-lib pattern). Attributes EVERY hunger-day on the courtship
// substrate to a named channel:
//
//   (a) empty-pantry — pantry fresh-days < 2 at the dawn of the hunger-day.
//   (b) trust-throttled half-ration — pantry deep (fresh-days >= 2) AND the
//       meal beat names a half-ration (or the ration vote is active) AND
//       trust < the engine's threshold (30, read from game.js villageMeal:
//       `trust < 30 ? 1000 : ...`, beat `trust < 30 ? ' (Half ration — they
//       don't trust you yet.)' : ''`). The engine trust-gates ONLY the
//       scholar's communal meal — villager draws are first-come-first-served
//       in roster order and trust enters only through surplus sharing
//       (villagerMealDay: `gave = (produced - need) * trustFactor`). So (b)
//       is structurally scholar-only; the classifier enforces that.
//   (c) other-named — sub-labels below; nothing is unattributed.
//
// Populations:
//   - villagers: scripts/sharcensus-20261014.js rows (ate < 0.6*need, the
//     engine's starvation branch, !fasting).
//   - the scholar: the engine's own scholar-starvation signal — the
//     overnight resolveDay STARVING warning (scholar.kcal driven below 0).
//     The sharcensus skips the scholar (player-parity), which is exactly why
//     #272's episode never registered.
//
// Trajectory-neutral by construction: every wrap is call-through with pure
// reads; the temporary Game.say capture inside villageMeal restores in a
// finally. Byte-identicality is proven by scripts/test-distrhalf-20261015.js
// PART C (60d x 8 seeds x 2 policies, pristine vs instrumented).
//
// CANON: docs/CANON.md read. NO food-distribution canon doc exists — stated
// in the evidence file per the canon rule; no canon invented.
'use strict';
const { installShareCensus, classify } = require('./sharcensus-20261014');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarTrustOf(Game, v) {
  try {
    const sid = Game.villagerId;
    return (v.trust && v.trust[sid] !== undefined) ? v.trust[sid] : 10;
  } catch (e) { return 10; }
}
function freshDaysOf(Game) {
  try { return Game.pantryFreshDays(); } catch (e) { return null; }
}

// installDistrHalf(Game) — install after loadGame+setupGame, before runDays.
// The driver calls track.dawn(Game) at the START of its policy.daily wrapper
// (pure reads; the day's fresh-days/trust snapshot "at the dawn").
function installDistrHalf(Game) {
  const track = {
    census: null,
    meals: [],    // one per villageMeal call (the scholar's evening bowl)
    nights: [],   // one per overnight resolveDay (scholar STARVING signal)
    dawns: {},    // day -> {freshDays, scholarTrust, scholarKcal, rosterN, meanTrust}
    oVillageMeal: Game.villageMeal,
    oResolveDay: null,
    calObj: null,
  };
  track.census = installShareCensus(Game);

  // ---- scholar's evening meal (the trust-throttled bowl) ----
  if (typeof track.oVillageMeal === 'function') {
    Game.villageMeal = function () {
      const v = this.state.village || {}, scholar = this.state.scholar || {};
      const day = scholar.day || 0;
      const trust = scholarTrustOf(this, v);
      const freshDays = freshDaysOf(this);
      const rationVote = !!(v.rationing && v.rationing.until >= day);
      let need = null, cap = null, kcalBefore = null;
      try {
        const cal = (typeof globalThis !== 'undefined' && globalThis.Scattering || {}).calories || {};
        if (cal.dailyNeed) need = cal.dailyNeed(scholar);
      } catch (e) {}
      try { cap = this.kcalCap(); } catch (e) {}
      try { kcalBefore = scholar.kcal || 0; } catch (e) {}
      // Beat capture: temporary call-through say wrap, restored in finally.
      // The engine's half-ration beat condition is trust<30 && taken>0; the
      // captured text lets the test assert the gate byte-for-byte.
      const beats = [];
      const oSay = this.say;
      this.say = function (t) {
        try { beats.push(String(t)); } catch (e) {}
        return oSay.apply(this, arguments);
      };
      let out;
      try { out = track.oVillageMeal.apply(this, arguments); }
      finally { this.say = oSay; }
      const text = beats.join('\n');
      const refused = /closed to you|not yours anymore/.test(text);
      const halfRation = /Half ration/.test(text);
      const taken = refused ? 0 : ((v.lastPlayerMeal || 0));
      let refusedKind = null;
      if (refused) refusedKind = 'exile';
      else if (/camp wild tonight/.test(text)) refusedKind = 'wild';
      else if (/No food in the pantry/.test(text)) refusedKind = 'pantry-bare';
      else if (/You're full/.test(text)) refusedKind = 'already-full';
      else if (/Village meal at /.test(text)) refusedKind = 'joined';
      // Instrument-honesty: the captured beat must equal the engine gate
      // (trust<30 && taken>0, non-joined branch). A mismatch is recorded,
      // never thrown — the test asserts zero mismatches.
      const gateSays = (trust < 30) && (taken > 0) && refusedKind !== 'joined';
      track.meals.push({
        day, trust, freshDays, rationVote, taken, halfRation, refused, refusedKind,
        need, cap, kcalBefore, beatGateMismatch: (halfRation !== gateSays),
        mealBelow06: need ? (taken < need * 0.6) : null,
        beats: text.slice(0, 1500),
      });
      return out;
    };
  }

  // ---- overnight scholar body (the STARVING signal) ----
  try {
    const calObj = (typeof globalThis !== 'undefined' && globalThis.Scattering || {}).calories || null;
    if (calObj && typeof calObj.resolveDay === 'function') {
      track.calObj = calObj;
      track.oResolveDay = calObj.resolveDay;
      calObj.resolveDay = function (scholar, village, opts) {
        const day = (scholar && scholar.day) || 0;
        const kcalBefore = scholar ? (scholar.kcal || 0) : 0;
        let need = null;
        try { need = track.oResolveDay && calObj.dailyNeed ? calObj.dailyNeed(scholar) : null; } catch (e) {}
        const res = track.oResolveDay.apply(this, arguments);
        let starving = false;
        try { starving = (res.warnings || []).some(w => String(w).indexOf('STARVING') === 0); } catch (e) {}
        track.nights.push({ day, starving, kcalBefore, need,
          warnings: (res.warnings || []).map(String).slice(0, 4) });
        return res;
      };
    }
  } catch (e) { /* instrument degrades to villager-only; flagged in report */ }

  // dawn snapshot — called by the DRIVER at the start of policy.daily
  track.dawn = function (G) {
    const day = gday(G);
    if (track.dawns[day]) return;
    const v = (G.state.village || {});
    const scholar = (G.state.scholar || {});
    let meanTrust = null;
    try {
      const ts = Object.keys(v.trust || {}).map(k => v.trust[k]).filter(x => typeof x === 'number');
      if (ts.length) meanTrust = ts.reduce((a, b) => a + b, 0) / ts.length;
    } catch (e) {}
    track.dawns[day] = {
      day,
      freshDays: freshDaysOf(G),
      scholarTrust: scholarTrustOf(G, v),
      scholarKcal: scholar.kcal || 0,
      rosterN: (v.roster || []).length,
      meanTrust,
    };
  };

  track.uninstall = function () {
    try { if (track.census) track.census.uninstall(); } catch (e) {}
    try { if (track.oVillageMeal && Game.villageMeal !== track.oVillageMeal) Game.villageMeal = track.oVillageMeal; } catch (e) {}
    try {
      if (track.calObj && track.oResolveDay && track.calObj.resolveDay !== track.oResolveDay)
        track.calObj.resolveDay = track.oResolveDay;
    } catch (e) {}
  };
  return track;
}

// classifyHungerDay(h) — pure. Every hunger-day lands in exactly one channel.
// h: {subject:'scholar'|'villager', day, vid, name, freshDaysDawn,
//     scholarTrustDawn, trust, meal, starvePath, ate, need}
// Villagers never take channel (b): the engine never trust-gates a villager's
// draw (first-come-first-served roster order; trust only scales surplus
// sharing). A villager starving on a deep pantry is a different distribution
// story — draw-order exhaustion or floor1 crumbs — and gets those names.
function classifyHungerDay(h) {
  if (h.freshDaysDawn == null) return { channel: 'c', label: 'no-dawn-snapshot' };
  if (h.freshDaysDawn < 2) return { channel: 'a', label: 'empty-pantry' };
  if (h.subject === 'scholar') {
    const m = h.meal || {};
    const t = (m.trust != null) ? m.trust : 10;
    // (b): the engine's real gate — half-ration beat (trust<30) or the voted
    // ration state, on a deep pantry, with trust below the threshold.
    if ((m.halfRation || m.rationVote) && t < 30)
      return { channel: 'b', label: 'trust-throttled-half-ration' };
    // (c): scholar sub-labels — the meal record says what happened.
    if (m.taken === 0 || m.refused) {
      if (m.refusedKind === 'exile') return { channel: 'c', label: 'exile-withheld' };
      if (m.refusedKind === 'wild') return { channel: 'c', label: 'away-wild-no-pantry' };
      if (m.refusedKind === 'joined') return { channel: 'c', label: 'joined-pantry-bare' };
      if (m.refusedKind === 'pantry-bare') return { channel: 'c', label: 'pantry-bare-at-dusk' };
      if (m.refusedKind === 'already-full') return { channel: 'c', label: 'bank-full-still-starved' };
      return { channel: 'c', label: 'meal-zero-unknown' };
    }
    return { channel: 'c', label: 'meal-served-still-starved' };
  }
  // ---- villagers ----
  const sp = h.starvePath;
  if (sp === 'empty-pantry') return { channel: 'c', label: 'draw-order-exhausted' };
  if (sp === 'crumbs-left') return { channel: 'c', label: 'floor1-crumbs' };
  if (sp === 'spoiled-insufficient' || sp === 'desperation-spoiled')
    return { channel: 'c', label: 'spoiled-insufficient' };
  if (sp === 'away-pack-empty') return { channel: 'c', label: 'away-pack-empty' };
  if (sp === 'away-pack-short') return { channel: 'c', label: 'away-pack-short' };
  return { channel: 'c', label: 'taxonomy-gap' };
}

// finalizeDistrHalf(Game, track) — join rows + meals + nights + dawns into
// attributed hunger-day records. Returns {hungerDays, unattributed, ...}.
// A non-zero unattributed count is a LOUD instrument failure.
function finalizeDistrHalf(Game, track) {
  const hungerDays = [];
  const mealByDay = {};
  for (const m of track.meals) mealByDay[m.day] = m;
  const nightByDay = {};
  for (const n of track.nights) nightByDay[n.day] = n;

  // villagers (sharcensus rows)
  for (const row of track.census.rows) {
    const c = classify(row, {});
    if (!c.starved) continue;
    const dawn = track.dawns[row.day] || {};
    const h = {
      subject: 'villager', day: row.day, vid: row.vid, name: row.name,
      freshDaysDawn: dawn.freshDays != null ? dawn.freshDays : null,
      scholarTrustDawn: dawn.scholarTrust,
      trust: row.trust, ate: row.ate, need: row.need,
      halfRationNamed: !!(mealByDay[row.day] && (mealByDay[row.day].halfRation || mealByDay[row.day].rationVote)),
      starvePath: c.starvePath, path: row.path,
    };
    const cls = classifyHungerDay(h);
    hungerDays.push(Object.assign(h, { channel: cls.channel, label: cls.label }));
  }
  // the scholar (overnight STARVING nights)
  for (const n of track.nights) {
    if (!n.starving) continue;
    const dawn = track.dawns[n.day] || {};
    const m = mealByDay[n.day] || null;
    const h = {
      subject: 'scholar', day: n.day, vid: 'scholar', name: 'scholar(bearer)',
      freshDaysDawn: dawn.freshDays != null ? dawn.freshDays : null,
      scholarTrustDawn: dawn.scholarTrust,
      trust: m ? m.trust : dawn.scholarTrust,
      ate: null, need: n.need, kcalBefore: n.kcalBefore,
      meal: m ? {
        trust: m.trust, taken: m.taken, halfRation: m.halfRation,
        rationVote: m.rationVote, refused: m.refused, refusedKind: m.refusedKind,
        mealBelow06: m.mealBelow06, freshDays: m.freshDays, need: m.need,
      } : null,
      halfRationNamed: !!(m && (m.halfRation || m.rationVote)),
      starvePath: null,
    };
    const cls = classifyHungerDay(h);
    hungerDays.push(Object.assign(h, { channel: cls.channel, label: cls.label }));
  }

  const BAD = new Set(['no-dawn-snapshot', 'taxonomy-gap', 'meal-zero-unknown']);
  const unattributed = hungerDays.filter(h => BAD.has(h.label));
  const byChannel = {}, byLabel = {};
  for (const h of hungerDays) {
    byChannel[h.channel] = (byChannel[h.channel] || 0) + 1;
    byLabel[h.label] = (byLabel[h.label] || 0) + 1;
  }
  return {
    hungerDays, unattributed: unattributed.length, unattributedRows: unattributed,
    byChannel, byLabel,
    nMeals: track.meals.length, nNights: track.nights.length,
    nStarvingNights: track.nights.filter(n => n.starving).length,
    nVillagerRows: track.census.rows.length,
    beatGateMismatches: track.meals.filter(m => m.beatGateMismatch).length,
    resolveDayWrapped: !!track.oResolveDay,
    report: {
      meals: track.meals, nights: track.nights.filter(n => n.starving), dawns: track.dawns,
    },
  };
}

module.exports = { installDistrHalf, classifyHungerDay, finalizeDistrHalf };
