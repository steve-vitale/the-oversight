// tribshield — the tribute-shield layer for the political-attrition face
// (longsim scale-onramp, sim-tribshield 2026-10-15).
//
// ONE policy-side layer, opt-in via TRIBSHIELD=1 (default OFF — unset means
// the wrapper delegates to its parent byte-identically; the proof test's
// D0 pins that).
//
// The diagnosis (r4 holdloss census, evidence/2026-10-15/sim-holdloss.md;
// tworung2, evidence/2026-10-15/sim-tworung2.md): the scale wall's hold face
// is POLITICAL ATTRITION — rival raids + "tribute-on-empty-chair" on young
// nationals. The tribute half works like this:
//
//   * BELONG road (Haven subordinate): on leader death the primary installs
//     their own speaker and tribute rises x1.5 ("Grief is leverage, and they
//     know it") while trust takes the -8 haircut and mourning gags gains.
//     The village misses the inflated bill -> arrears -> the BELONG good-
//     standing bar (trust >= 50, arrears EXACTLY 0, link >= 14d) breaks and
//     the realm comes apart (tworung2 belongfeast s77: arrears 0 -> 12,904
//     kcal in 7d -> national->regional d155).
//   * LEAD road (Haven primary): subordinates press tribute DOWN x0.75 while
//     the chair is empty; the -8 haircut can drop seasoned links (trust 40
//     bar) out of the realm (holdloss s44: "press the tribute down ... while
//     the chair is empty" -> "the realm came apart").
//   * Young links (<21d): succession stages a renegotiation beat (gift /
//     visit / wait, 7-day expiry). UNANSWERED it costs -6 trust and — when
//     Haven is the subordinate — the deferred x1.5 tribute leverage lands
//     anyway. The base courtship policies (leadcourt/belongseek/scalecourt)
//     NEVER answer these beats (sim-findings #166); only fifthlink-r26 and
//     winseek do.
//
// The landed succpolity arm (ee5d1803, src/js/hierarchy.js, SUCCPOLITY=1)
// fixed the polity-persistence half game-side (the 14d proving window reads
// the inherited standing). This layer closes the tribute half from the
// POLICY side: inside the shield window — the young national's first 60
// hold-days, or succession grief live on a link (the succpolity 14d proving
// window and beyond) — the village answers its tribute beats instead of
// letting silence answer.
//
// THE VERBS (all in daily, before the parent's daily):
//   V1 answer renegotiation beats FIRST (gift when the pantry carries 1,500
//      kcal above the 1-day floor, else visit — never 'wait': silence is -6
//      trust and the deferred leverage landing). Steve's young-bond ruling
//      (2026-10-14): the bearer <redacted> the obligations; relief must be ASKED
//      FOR via renegotiation, never automatic — answering the beat IS the
//      asked-for path. This is the layer's core: the base policies never do
//      it, and an answered beat is a x1.5 leverage that never lands.
//   V2 weakest-first tend triage on Haven-primary links (trust<45) at the
//      base's own 20k gate, before the parent's daily: when grain is short
//      the haircut links rebuild inside the proving window instead of the
//      strongest bonds eating first. tendLink dedups per week and refuses
//      during mourning, so no double-spend. (Micro-delta; the lead road's
//      "keep their tribute honest" discipline.)
//
// DELIBERATELY NOT BUILT (measured, not assumed):
//   - A tribute-payment verb: scalecourt ALREADY pays ALL active
//     Haven-subordinate links' tribute weekly at pantry > 15k, and belongseek
//     pays the first at pantry > tribute*2 — both with no survival floor.
//     A shield payment gate (tribute + floor) can never fire where the base
//     wouldn't also pay, so a V2 payment verb is dead code (proven by the
//     proof's R2: the base clears multi-link arrears on its own). Filed as
//     a named next: the base's floor-less 15k gate can empty the pantry on
//     a partial leveraged payment — a floor belongs on the BASE gate, not
//     in a shield.
//   - Vetoing the base's payments or the feast: the wrapper cannot veto the
//     parent; restraint levers belong in the base policies.
//
// The shield fires ONLY in-window:
//   S1 the national is young: first 60 hold-days (ctx-tracked from
//      scaleRank()), or
//   S2 succession grief is live on any active link: pendingRenegotiation,
//      mourningUntil > day, or a 'succession' link-history note within 14d.
// (A staged beat implies S2, so V1's window check is vacuous — V1 fires on
// every beat. The window gates V2.)
//
// Survival first: the gift never fires unless the pantry still holds >= 1
// fresh day (mouths x 2000 kcal — BALANCING.md's target) AFTER the 1,500
// kcal gift. Below that the beat is answered with a visit.
//
// Deterministic: no RNG, no Date.now — reads only Game.state + ctx counters.
'use strict';
const { leadfeast, belongfeast } = require('./feastscale');

function layerOn() { return process.env.TRIBSHIELD === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function mouths(Game) {
  try { return Math.max(1, ((Game.state.village || {}).roster || []).length); }
  catch (e) { return 1; }
}
// The 1-fresh-day survival floor: BALANCING.md's 2,000 kcal/day target.
function floorKcal(Game) { return 2000 * mouths(Game); }
function week(Game) { try { return (Game._week ? Game._week() : 0); } catch (e) { return 0; } }
function activeLinks(Game) {
  try { return (Game.hierarchyState() || []).filter(l => l && l.status === 'active'); }
  catch (e) { return []; }
}
function rankOf(Game) {
  try { return (typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village'); }
  catch (e) { return 'village'; }
}

// nationalAge: days since the realm first read 'national' (or 'global').
// Stamped once per run in ctx — the realm's age, not the current reign's.
function nationalAge(Game, ctx) {
  try {
    const r = rankOf(Game);
    const day = gday(Game);
    if ((r === 'national' || r === 'global') && ctx._tsNatFirstDay == null) {
      ctx._tsNatFirstDay = day;
    }
    if (ctx._tsNatFirstDay == null) return null;
    return day - ctx._tsNatFirstDay;
  } catch (e) { return null; }
}

// successionGrief: a succession beat is live on some active link — the
// staged renegotiation (<=7d), the mourning window, or a 'succession'
// link-history note within the 14d proving window.
function successionGrief(Game) {
  try {
    const day = gday(Game);
    for (const l of activeLinks(Game)) {
      if (l.pendingRenegotiation) return true;
      if ((l.mourningUntil || 0) > day) return true;
      const hist = l.history || [];
      for (const h of hist) {
        if (h && h.kind === 'succession' && (day - (h.day || 0)) <= 14) return true;
      }
    }
    return false;
  } catch (e) { return false; }
}

function shieldOn(Game, ctx) {
  try {
    const age = nationalAge(Game, ctx);
    if (age != null && age < 60) return true;   // S1: young national
    if (successionGrief(Game)) return true;      // S2: grief live
    return false;
  } catch (e) { return false; }
}

// V1: answer every staged renegotiation beat — gift when the pantry carries
// 1,500 kcal above the floor, else visit (the engine answers the empty
// bench with word-and-promises, +2 — never 'wait': silence is -6 trust
// and the deferred leverage landing).
function answerBeats(Game, ctx) {
  let n = 0;
  try {
    if (!Game.answerRenegotiation) return 0;
    const floor = floorKcal(Game);
    for (const l of activeLinks(Game)) {
      if (!l.pendingRenegotiation) continue;
      const how = pantryKcal(Game) >= 1500 + floor ? 'gift' : 'visit';
      try {
        const r = Game.answerRenegotiation(l.id, how);
        if (r) { n++; ctx['tsReneg_' + how] = (ctx['tsReneg_' + how] || 0) + 1; }
      } catch (e) {}
    }
  } catch (e) {}
  return n;
}

// V2: Haven-as-primary — weakest-first tend triage at the base's own 20k
// gate. Weakest bonds first so short grain rebuilds the haircut links
// inside the proving window. tendLink dedups per week and refuses during
// mourning.
function tendThinPrimaries(Game, ctx) {
  let n = 0;
  try {
    if (!Game.tendLink) return 0;
    const wk = week(Game);
    const cands = activeLinks(Game)
      .filter(l => l.primary === 'haven' && (l.trust || 0) < 45 && l.tendedWeek !== wk)
      .sort((a, b) => (a.trust || 0) - (b.trust || 0));
    for (const l of cands) {
      if (pantryKcal(Game) <= 20000) break; // the base's own survival gate; pantry re-read per tend
      try {
        const r = Game.tendLink(l.id);
        if (r) { n++; ctx.tsTends = (ctx.tsTends || 0) + 1; }
      } catch (e) {}
    }
  } catch (e) {}
  return n;
}

function tribShieldDuty(Game, ctx) {
  if (!layerOn()) return;             // before/after harness gate
  try {
    if (!shieldOn(Game, ctx)) return; // the shield is a window, not a tax
    answerBeats(Game, ctx);           // beats expire in 7 days — first
    tendThinPrimaries(Game, ctx);     // rebuild the haircut inside the window
  } catch (e) {}
}

function withTribShield(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      tribShieldDuty(Game, ctx);  // the tribute discipline runs first
      return base.daily(Game, ctx);
    },
  });
}

const leadtrib = withTribShield(
  leadfeast, 'leadfeast',
  'leadfeast + tribshield (TRIBSHIELD=1): answer tribute beats, weakest-first tend triage in the succession window / young national'
);
const belongtrib = withTribShield(
  belongfeast, 'belongfeast',
  'belongfeast + tribshield (TRIBSHIELD=1): answer tribute beats, weakest-first tend triage in the succession window / young national'
);

// The sweep imports these ids ('leadfeast', 'belongfeast'); the TRIBSHIELD
// env var is the only switch — control and armed share the same objects.
module.exports = { leadfeast: leadtrib, belongfeast: belongtrib, withTribShield, layerOn };
