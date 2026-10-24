// policies/deed-seeking.js — the notability hunter (measurement 2026-10-11).
//
// Used by the endgame journey leg ("deed-seeking competent policy"). Lighter
// than winseek (which pursues the full galactic-table deed gate) and less
// systems-deep than oracleV2: this policy just wants DEEDS — the notability
// ledger that the table prices.
//
// Same competent survival base, plus:
//  1. WAVE DEEDS: patrols far wild tiles ~3x/week seeking encounters; ENGAGES
//     (never flees at fight start — facing counts, you stood on the grid),
//     competent's mid-fight eject still applies (not suicide).
//  2. FEAST SURGE: channels ready keepsakes daily (proven API, as winseek).
//  3. SHOWMANSHIP: always participates when grabbed (never refuses).
//
// All Game APIs used here are proven in winseek.js (travelTargets/travelTo,
// channelReadyKeepsakes/channelSentiment, sentimentTaught). Deterministic:
// patrol schedule is day-modulo; tile choice is farthest-first.
//
// What it proves: the deed-accumulation curve — how fast a trying player
// fills wave bars 1–5, the table's lesser-seat bar, and notability. Pair with
// competent to isolate "trying for deeds" from "just surviving". Pair with
// winseek to isolate the table-gate pursuit overhead.
'use strict';
const { competent } = require('./competent');

function deedPatrol(Game, ctx) {
  // Mirrors winseek's proven huntPatrol, minus the deed-gate check.
  try {
    if (Game.over || Game.tbfight) return;
    const s = Game.state.scholar || {};
    const day = s.day || 1;
    if (![1, 3, 5].includes(day % 7)) return;
    if (ctx._patrolDay === day) return; // once per day (upkeep runs 3x/day)
    ctx._patrolDay = day;
    if ((s.kcal || 0) < (Game.kcalCap ? Game.kcalCap() * 0.4 : 800)) return;
    const cands = [];
    const targets = (Game.travelTargets ? Game.travelTargets() : []) || [];
    for (const tt of targets) {
      let t = null;
      try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
      if (!t || t.type === 'haven') continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d || 0 });
    }
    cands.sort((a, b) => b.d - a.d); // far tiles first: different ground
    let visited = 0;
    for (const c of cands.slice(0, 4)) {
      if (Game.over || Game.tbfight) break;
      try { Game.travelTo(c.x, c.y); } catch (e) { break; }
      if (Game.over || Game.tbfight) break;
      visited++;
      try { Game.doAction('forage', {}); } catch (e) {}
      if (Game.over || Game.tbfight) break;
    }
    if (visited) ctx.patrols = (ctx.patrols || 0) + 1;
  } catch (e) {}
}

function surgeUpkeep(Game, ctx) {
  // Proven API: channelReadyKeepsakes + channelSentiment (winseek).
  try {
    if (!(Game.sentimentTaught && Game.sentimentTaught())) return;
    const idxs = (Game.channelReadyKeepsakes && Game.channelReadyKeepsakes()) || [];
    let n = 0;
    for (const idx of idxs) {
      try { Game.channelSentiment(idx); n++; } catch (e) {}
      if (n >= 3) break;
    }
    if (n) ctx.channeled = (ctx.channeled || 0) + n;
  } catch (e) {}
}

const deedSeeking = Object.assign({}, competent, {
  id: 'deed-seeking',
  desc: 'competent base + hunts notability deeds: patrols for wave bars (fought-then-flee), channels keepsakes, always takes the cameras',
  daily(Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    deedPatrol(Game, ctx);
    surgeUpkeep(Game, ctx);
  },
  // Engage at fight start (facing counts); competent's mid-fight eject
  // still applies — deed-seeking isn't suicide.
});

module.exports = { deedSeeking, deedPatrol, surgeUpkeep };
// deedPatrol/surgeUpkeep exported (additive, 2026-10-23 r45) so other
// instruments can compose the deed-hunt layers onto different bases
// (e.g. capable) without duplicating the patrol logic.
