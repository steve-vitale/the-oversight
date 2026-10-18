#!/usr/bin/env node
// prodrebound-feastdraw-replay.js — DIAGNOSTIC-ONLY REPLAY of the killed
// sim-feastdraw-b layer (arm sim-prodrebound-b, run
// fleshout-loop-b-20261018T175233Z).
//
// *** THIS IS NOT A LEVER. DO NOT LAND IT AS ONE. DO NOT MOVE IT INTO
// *** scripts/policies/. It exists ONLY so the prodrebound diagnostic can
// *** reproduce the armed condition (the original layer was deleted
// *** zero-trace per kill protocol) and attribute the production rebound
// *** (sim-findings #570) to inflow channels. The fidelity gate is
// *** scripts/test-prodrebound-b.js: the replay must reproduce the known
// *** perverse result on the two backfire seeds (lead 6206 rot ~1.87x,
// *** belong 6202 rot ~2.10x) or the attribution is invalid.
//
// Faithful reconstruction from evidence/2026-10-18/sim-feastdraw-b.md §
// "Pre-registration" + the landed proof's pinned behaviors (31/31 GREEN
// pre-kill; the proof is INFO-SKIP post-kill):
//   - wrap the base policy's Game.villageEats; AFTER the normal nightly
//     loop, compute the doomed-fresh pile (bonus-inclusive
//     spoilDay+bonus == day+1 — rots at tomorrow's dawn, before any meal
//     can touch it).
//   - trigger: doomed > 200*roster. Cap: 400*roster/night.
//   - serveSeconds: supplementary fresh-first draw via the engine's own
//     pantryDraw (cook:true, exposure-rolled per villager via
//     villagerFoodPoisoning — no laundering); hunger eased with the
//     meal's own math (ate/need*70); recordTakeHist per villager share
//     (freeloader/fair-share clocks stay honest); pantryKcal re-synced;
//     one voice line naming the food + the cook, no lever name.
//   - telemetry: ctx._fdNights / _fdKcal / _fdDoomedSeen.
//   - gate-off (FEASTDRAW_REPLAY unset): pure delegation, zero writes.
//
// Deliberate simplifications vs the original (documented, none touch the
// measured channels): hunger easing uses the engine's meal formula
// directly (no seasonMeal tastes/bonds — social machinery untouched by
// design); the voice line is the sense-tested wording.
'use strict';

const TRIGGER_PER_ROSTER = 200;
const CAP_PER_ROSTER = 400;

function layerOn() {
  try { return process.env.FEASTDRAW_REPLAY === '1'; } catch (e) { return false; }
}

// doomedFresh(Game): fresh kcal that will rot at tomorrow's dawn —
// bonus-inclusive (spoilDay+bonus)==day+1, spoiled excluded, preserved /
// rendered / pemmican excluded, bonded excluded.
function doomedFresh(Game) {
  const out = { kcal: 0, names: [], items: [] };
  try {
    const v = (Game.state || {}).village || {};
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let bonus = 0;
    try { bonus = Game.spoilBonusDays ? Game.spoilBonusDays() : 0; } catch (e) {}
    for (const it of (v.pantry || [])) {
      if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
      if (it.bonded) continue;
      if (it.foodState === 'preserved' || it.foodState === 'rendered') continue;
      if ((it.foodKind || '') === 'pemmican') continue;
      try { if (Game.isSpoiled && Game.isSpoiled(it)) continue; } catch (e) {}
      const sd = it.spoilDay;
      if (sd === undefined || sd === null || sd >= 9999) continue;
      if ((sd + (bonus || 0)) === day + 1) {
        out.kcal += (it.kcalEach || 0) * (it.units || 1);
        out.items.push(it);
        const nm = String(it.name || 'food');
        if (!out.names.includes(nm)) out.names.push(nm);
      }
    }
  } catch (e) {}
  return out;
}

function livingRoster(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return (v.roster || []).filter(id => {
      if (id === Game.villagerId) return false;
      try { const p = Game.getPerson ? Game.getPerson(id) : null; return p && !p.dead; }
      catch (e) { return false; }
    });
  } catch (e) { return []; }
}

// serveSeconds(Game, ctx): the cook serves seconds at the fire from the
// doomed pile. Returns kcal eaten.
function serveSeconds(Game, ctx) {
  if (!layerOn()) return 0;
  try {
    const v = (Game.state || {}).village || {};
    const roster = livingRoster(Game);
    if (!roster.length) return 0;
    const doomed = doomedFresh(Game);
    const trigger = TRIGGER_PER_ROSTER * roster.length;
    if (doomed.kcal <= trigger) return 0;
    const want = Math.min(CAP_PER_ROSTER * roster.length, doomed.kcal);
    let exposure = null;
    try { exposure = Game.freshExposure ? Game.freshExposure() : null; } catch (e) {}
    const drawn = Game.pantryDraw(v, want, { cook: true, exposure });
    const taken = drawn.taken || 0;
    if (taken <= 0) return 0;
    // the meal's own math: hunger eases with what they actually ate
    const share = taken / roster.length;
    for (const vid of roster) {
      try {
        const person = Game.getPerson ? Game.getPerson(vid) : null;
        const n = Game.npcNeeds ? Game.npcNeeds(vid) : null;
        let need = (person && person.kcalPerDay) || 2000;
        try {
          const health = (((v.health || {})[vid] !== undefined) ? v.health[vid] : 100) / 100;
          need = need * (0.7 + 0.3 * health);
          if (Game.hearthStretch) need = Math.round(need * Game.hearthStretch());
        } catch (e) {}
        if (n) n.hunger = Math.max(0, (n.hunger || 0) - Math.round((share / need) * 70));
        // takes ledgers kept (the original's proof pinned takes >= eaten):
        // v.takes[vid] is the cumulative gross (player-trust accounting);
        // recordTakeHist is the dated history the freeloader clock judges.
        try { v.takes = v.takes || {}; v.takes[vid] = (v.takes[vid] || 0) + Math.round(share); } catch (e) {}
        try { if (Game.recordTakeHist) Game.recordTakeHist(vid, Math.round(share)); } catch (e) {}
        try { if (Game.villagerFoodPoisoning) Game.villagerFoodPoisoning(v, vid, exposure); } catch (e) {}
      } catch (e) {}
    }
    // pantryKcal re-synced (derived, not source of truth)
    try { v.pantryKcal = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) {}
    // one voice line: names the food + the cook, no lever name
    try {
      let cookName = 'the cook';
      try {
        const cookId = Game.villageCookId ? Game.villageCookId(v) : null;
        const cook = cookId && Game.getPerson ? Game.getPerson(cookId) : null;
        if (cook && cook.name) cookName = String(cook.name).split(' ')[0];
      } catch (e) {}
      const foodName = (doomed.names || []).slice(0, 2).join(' and ') || 'food';
      Game.say(`🍽️ ${cookName} sees the ${foodName} won't keep till tomorrow — seconds all round at the fire, before it turns.`);
    } catch (e) {}
    if (ctx) {
      ctx._fdNights = (ctx._fdNights || 0) + 1;
      ctx._fdKcal = (ctx._fdKcal || 0) + taken;
      ctx._fdDoomedSeen = (ctx._fdDoomedSeen || 0) + doomed.kcal;
    }
    return taken;
  } catch (e) { return 0; }
}

function withFeastDrawReplay(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      if (base.setup) base.setup(Game, ctx);
      if (!layerOn()) return; // gate off: pure delegation, zero wraps
      const oVE = Game.villageEats;
      if (typeof oVE === 'function') {
        Game.villageEats = function () {
          const r = oVE.apply(this, arguments);
          try { serveSeconds(Game, ctx); } catch (e) {}
          return r;
        };
      }
    },
  });
}

module.exports = { withFeastDrawReplay, doomedFresh, serveSeconds, layerOn, TRIGGER_PER_ROSTER, CAP_PER_ROSTER };
