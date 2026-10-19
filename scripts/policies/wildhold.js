// wildhold — deferral-window wild-exposure restraint (flesh-out loop arm
// sim-wildhold, run fleshout-20261019T07xxZ, axis scale-onramp).
//
// CONTEXT (evidence/2026-10-19/sim-windowsurvive.md + windowsurvive-taxonomy.md):
// the window-death diagnostic attributed 72 window deaths: raid 40, WILD 18,
// alien 5, expedition 4, other 4, disease 1. The wild channel is the #2
// window killer — scholars fighting in the wild (ctx:scholar-fight-in-wild)
// and villagers on the router (ctx:router — the wild router,
// villagerMonsterTick → resolveWildMonsterEncounter, jumps villagers who
// share a tile with a world monster). People die RICH (pantry 28,469 kcal
// mean at death, hungry streak 0) — the village can afford to stay home.
// Both prior avenues are CLOSED: veteran-production (0-for-11) and
// window-support (6 variants NO-GO — field support kills people).
//
// THE LEVER — RESTRAINT, not support: while the village is door-engaged
// (the wave-5 readiness window, standingDeferral(5).deferred), the scholar
// and the far-ranging villagers stay on home/close nodes — no far ranging
// into the wild. Keep people OUT of the meat-grinder rather than sending
// help into it. Three honest mechanisms, all existing verbs, all
// engine-honest:
//
//   (1) SCHOLAR HOLD (daily, post-base, window-gated): the scholar ends
//       every window day at Haven (or within 1 tile — "home/close"). If
//       farther out, they walk home honestly (Game.travelTo — the travel
//       itself rolls real encounters, honest cost). Backstop, not a yo-yo:
//       it fires only when the base stack left the scholar far at day's
//       end (multi-day camps like the Jada d111 8-day dehydration death).
//   (2) VET-HUNT STAND-DOWN (pre-daily, window-gated): the vetrel
//       deliberate wave-3 hunts (every 3rd day to thicket/ruin/forest/grove,
//       the scholar's most deliberate wild-combat exposure) stand down for
//       the window via ctx._whHold — read by veteranHuntLeg (3-line gated
//       edit in scripts/policies/vetrel.js, inert when WILDHOLD unset).
//       The veteran channel is a CLOSED avenue; the hunts spend scholar
//       lives during the window and buy nothing the window needs.
//   (3) FAR-PARTY RECALL (daily, post-base, window-gated): villagers on far
//       nodes (>2 Chebyshev from Haven) are called home. Expedition parties
//       end honestly first (Game.expeditionReturn — the haul comes home,
//       the gossip fires), then npcSetNode home. No shelter flag: they
//       resume close-node duties at Haven ("home/close nodes", not lock-in —
//       the food economy keeps breathing).
//
// Env gate WILDHOLD=1 opts IN (default OFF). Gate off = pure delegation:
// daily/upkeep/fight call the base exactly, ctx untouched — the proof
// test's GATE section pins that, and its DET section pins WILDHOLD=1
// byte-identical to unset while the window never opens (reads only until
// def5). No game-code changes. No fake anything, no stat edits.
//
// Design calls (documented — Steve 2026-10-07 "figure it out yourself",
// he can overrule):
// - "Close" = Chebyshev <= 2 from Haven (the 5x5 home block). Foragers
//   (npcMaxDist 1) never trigger; wanderers/explorers and expedition
//   parties do. The scholar is held tighter (<= 1) — the scholar is the
//   combatant of last resort and the succession chain.
// - Recall, not shelter: sheltered villagers skip ALL duties for the whole
//   window (median 78d) — that starves the village through lost production
//   (the shelter verb's own documented cost). The doctrine says the village
//   can afford to stay home, not that it stops working: close-node foraging
//   continues. The starvation guardrail judges this call.
// - The hunt stand-down lasts the whole window (the window usually runs to
//   death/regress — median 78d). The veteran leg stays short; the channel
//   is closed anyway.
// - One fiction beat at window-open ("we hold close while the door stands
//   open"), then quiet — daily beats would spam the transcript for 78 days.
// - Aid crises: the recall does NOT exempt them. The base stack on this
//   substrate doesn't run deliberate aid sorties (no aidCrisis in the
//   policy stack — the aid ctx at death is incidental), and the doctrine is
//   "no far ranging", full stop.
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; the def5
// window is where this layer lives). No canon doc covers "restraint" as a
// named doctrine — this layer defines it, policy-side, from the
// windowsurvive taxonomy numbers.
'use strict';

function wildholdOn() { return process.env.WILDHOLD === '1'; }

// ---------- reads ----------
// The def5 window: standing at/over t5 with readiness bars short — the
// window the windowsurvive diagnostic attributed (median 78d, 72 deaths).
// Pure engine read (standing.js standingDeferral). Duplicated from
// winsupport.js (6 lines) so this arm is self-contained for the kill
// protocol — no cross-arm require.
function whWindowLive(Game) {
  try {
    const df = Game.standingDeferral ? Game.standingDeferral(5) : null;
    return !!(df && df.deferred);
  } catch (e) { return false; }
}
function havenXY(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { x: v.px ?? 4, y: v.py ?? 4 };
  } catch (e) { return { x: 4, y: 4 }; }
}
function cheb(ax, ay, bx, by) {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}
function scholarFar(Game, maxD) {
  try {
    const h = havenXY(Game);
    return cheb(Game.map.px, Game.map.py, h.x, h.y) > maxD;
  } catch (e) { return false; }
}
function villagerNode(Game, vid) {
  try {
    const n = Game.npcNode(vid);
    return n ? { x: n.nx, y: n.ny } : null;
  } catch (e) { return null; }
}
function livingVillagers(Game) {
  const out = [];
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    for (const vid of roster) {
      if (vid === Game.villagerId) continue; // the scholar is the player's — held separately
      let dead = false;
      try { const vp = Game.vpOf ? Game.vpOf(vid) : null; dead = !!(vp && vp.dead); } catch (e) {}
      if (!dead) out.push(vid);
    }
  } catch (e) {}
  return out;
}
function onExpedition(Game, vid) {
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    return !!(a && a.exped && a.exped[vid]);
  } catch (e) { return false; }
}

// ---------- (2) vet-hunt stand-down: the pre-daily hold ----------
// Set before the base stack runs: vetrel's veteranHuntLeg reads ctx._whHold
// and stands down. Counted as hold-days.
function holdHunts(Game, ctx) {
  if (!wildholdOn() || !whWindowLive(Game)) { ctx._whHold = false; return; }
  ctx._whHold = true;
  ctx.whHoldDays = (ctx.whHoldDays || 0) + 1;
}

// ---------- (1) scholar hold: the post-daily backstop ----------
// The scholar ends every window day at home/close (Chebyshev <= 1). Fires
// only when the base stack left them farther out — the multi-day camp
// backstop. Honest walk home (real encounter rolls on the way).
function scholarHold(Game, ctx) {
  if (!wildholdOn() || !whWindowLive(Game)) return;
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    const s = (Game.state || {}).scholar || {};
    if (s.dead || s.exiled) return;
    const day = s.day || 0;
    if (ctx._whScholarDay === day) return; // one hold per day
    if (!scholarFar(Game, 1)) return; // home/close — the doctrine allows this
    const h = havenXY(Game);
    Game.travelTo(h.x, h.y);
    ctx._whScholarDay = day;
    ctx.whScholarRecalls = (ctx.whScholarRecalls || 0) + 1;
  } catch (e) {}
}

// ---------- (3) far-party recall: villagers come home ----------
// Villagers on far nodes (>2 Chebyshev) are called home. Expedition parties
// end honestly first (expeditionReturn: haul comes home, gossip fires),
// then the node move. No shelter flag — they resume close-node duties.
function recallVillager(Game, vid, hx, hy, playerAtHaven) {
  try {
    const v = (Game.state || {}).village || {};
    if (onExpedition(Game, vid) && typeof Game.expeditionReturn === 'function') {
      try { Game.expeditionReturn(vid, !!playerAtHaven); } catch (e) {}
    }
    if (v.away) { try { delete v.away[vid]; } catch (e) {} }
    if (typeof Game.npcSetNode === 'function') Game.npcSetNode(vid, hx, hy);
    return true;
  } catch (e) { return false; }
}
function farPartyRecall(Game, ctx) {
  if (!wildholdOn() || !whWindowLive(Game)) return;
  try {
    if (Game.over) return;
    const h = havenXY(Game);
    let pah = false;
    try { pah = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
    const v = (Game.state || {}).village || {};
    for (const vid of livingVillagers(Game)) {
      const n = villagerNode(Game, vid);
      if (!n) continue;
      if (cheb(n.x, n.y, h.x, h.y) <= 2) continue; // home/close — keep working
      // WATER EXEMPTION (sim-wildhold 2026-10-19, pilot guardrail breach):
      // water trips range 1-3 tiles (2-4 when the cistern is low — exactly
      // when water is most critical). Recalling the water crew runs the
      // cistern dry and kills villagers of thirst AT HAVEN (s63807 leadfeast
      // d101: Henry). The restraint must not break the water supply — thirst
      // kills in days, and a dry cistern is worse than wild exposure.
      let purpose = null;
      try { purpose = (v.away && v.away[vid] && v.away[vid].purpose) || null; } catch (e) {}
      if (purpose === 'water') continue;
      if (recallVillager(Game, vid, h.x, h.y, pah)) {
        ctx.whVillagerRecalls = (ctx.whVillagerRecalls || 0) + 1;
      }
    }
  } catch (e) {}
}

// ---------- the window-open beat (once per window, then quiet) ----------
function windowBeat(Game, ctx) {
  try {
    const live = whWindowLive(Game);
    const was = !!ctx._whWasLive;
    ctx._whWasLive = live;
    if (live && !was && !ctx._whBeatDone) {
      ctx._whBeatDone = true;
      Game.say('🧭 The door stands open and the wild is hungry. No far ranging while it lasts — the parties stay close, the scholar stays home. We hold what we have.');
      ctx.whBeats = (ctx.whBeats || 0) + 1;
    }
    if (!live) ctx._whBeatDone = false; // next window gets its own beat
  } catch (e) {}
}

function withWildhold(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!wildholdOn()) return base.daily(Game, ctx); // gate off: pure delegation
      holdHunts(Game, ctx); // (2) pre-daily: stand down the vet hunts for the window
      const r = base.daily(Game, ctx); // the whole stack runs — never preempted
      windowBeat(Game, ctx); // the fiction, once per window
      scholarHold(Game, ctx); // (1) post-daily backstop
      farPartyRecall(Game, ctx); // (3) call the far parties home
      return r;
    },
    upkeep(Game, ctx) {
      if (!wildholdOn()) return base.upkeep ? base.upkeep(Game, ctx) : undefined;
      return base.upkeep ? base.upkeep(Game, ctx) : undefined; // no per-part behavior — daily cadence is the fiction
    },
    fight(Game, ctx) {
      if (!wildholdOn()) return base.fight(Game, ctx); // gate off: pure delegation
      return base.fight(Game, ctx); // fights run untouched — restraint is about ranging, not fighting
    },
  });
}

const { leadfeast, belongfeast } = require('./feastscale');
const wildholdLead = withWildhold(leadfeast, 'leadfeast-wildhold',
  'leadfeast + WILDHOLD window wild-exposure restraint (WILDHOLD=1): scholar hold + vet-hunt stand-down + far-party recall while the def5 window is live');
const wildholdBelong = withWildhold(belongfeast, 'belongfeast-wildhold',
  'belongfeast + WILDHOLD window wild-exposure restraint (WILDHOLD=1): scholar hold + vet-hunt stand-down + far-party recall while the def5 window is live');

module.exports = {
  wildholdOn, whWindowLive, havenXY, cheb, scholarFar, villagerNode,
  livingVillagers, onExpedition, holdHunts, scholarHold, recallVillager,
  farPartyRecall, windowBeat, withWildhold, wildholdLead, wildholdBelong,
};
