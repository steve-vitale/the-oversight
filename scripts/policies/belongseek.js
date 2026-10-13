// belongseek — competent + BELONG-road scale courtship (longsim scale 2026-10-12).
//
// Extends scalecourt (competent + courtship-answering) with one addition and one
// subtraction:
//   + BELONG courtship: from day ~20, propose as SUBORDINATE to the strongest
//     known fire (preferring the primary of the largest foreign polity, the
//     consolidation candidate), answer counters honestly, pay weekly tribute
//     with arrears-0 priority (below scalecourt's 15k threshold), answer the
//     primary's demands, engage the region weekly so foreign realms consolidate
//     to 4 — and RIDE THE CONSOLIDATOR: once the region shows its hand
//     (another fire's realm at 4+ while ours stalls), break cleanly and court
//     the rising power. Then swear the oath when the Binding beat stages
//     (inherited from scalecourt's national-beat answers).
//   − scalecourt's own LEAD/covenant/trade PROPOSALS are shielded off for the
//     run (a proposal shield in daily, restored in finally): those roads are
//     measured elsewhere and would confound the BELONG measurement. All of
//     scalecourt's ANSWERING (accords, counters, national/global beats,
//     demands, tribute, defense/trade calls, covenant crises) still runs.
//
// Trust math for a Haven-subordinate link (hierarchy.js, verified 2026-10-12):
//   payTribute(full) → _trustGain +3, arrears 0, stirs region ('trade');
//   linkTick then settles the paid week → _trustGain +1.
//   => +4/week while paying, arrears 0. Miss → arrears += short, trust −6.
// BELONG standing bar (docs/SCALE.md): link trust ≥ 50, arrears 0, link age ≥
// 14 days, and the foreign primary's realm holds ≥ 4 fires
// (polityOf(primaryId): size = 2 + foreignPolity.subs.length ≥ 4).
//
// v3 (BELONG_V3=1, 2026-10-12) — "read the room before you burn the bond".
// Diagnosis (evidence/2026-10-12/scale-belong-v3.md): v2's "decline spiral"
// never happened. The re-courts on 606/707 never reached the consolidator —
// the persona was moot-exiled (d60/d48), and proposeLink's exile guard
// (hierarchy.js _blockIfNotHaven) returned null without ever calling
// judgeLink. Recomputed det scores were 59-81: solid accept territory.
// v2's bug: it broke a trust-90+ bond without checking whether the re-court
// was even possible. v3: (1) exile-gate the switch — never break when the
// persona can't propose; (2) score-gate the break — only break when the
// deterministic re-court score clears 55 (direct-accept territory), waiting
// on the passive climb verbs (broadcast +2/win, time +1/wk) meanwhile, with a
// day-85 deadline at det >= 45; (3) no cold re-ask after a switch (wait for
// det >= 50). All v3 logic is pure decision — no persona movement, no extra
// RNG draws — so v3 trajectories match v2's wherever the decision matches.
// (An active codex-trek +3 was cut in pilot: it perturbed the persona's
// routine and the RNG stream, collapsing 303 at d65 vs v2's national.)
// BELONG_V3 off = v2 behavior byte-identical (the measurable baseline).
//
// Canon read: docs/CANON.md, docs/SCALE.md, evidence/2026-10-12/scale-wall-diagnosis.md.
'use strict';
const { scalecourt } = require('./scalecourt');

// v3 gate: BELONG_V3=1 enables the opinion-building + exile-aware switch.
// Default off — v2 remains the measurable baseline.
const BELONG_V3 = process.env.BELONG_V3 === '1';

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function standingOf(Game, vid) {
  try { return Game.villageStandingOf ? (Game.villageStandingOf(vid) || 0) : 0; } catch (e) { return 0; }
}

// v3: can the persona actually propose? proposeLink (and answerCounter,
// answerNationalChoice, ...) are Haven-council verbs — the exile guard
// (hierarchy.js _blockIfNotHaven) returns null without ever scoring when the
// persona is exiled or has joined another fire. Breaking the old link while
// this is false trades a live bond for nothing (606/707).
function canPropose(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return !s.exiled && !s.joinedVillage;
  } catch (e) { return false; }
}

// v3: the deterministic part of judgeLink's score for an asSubordinate
// proposal (noise excluded). judgeLink: 38 + min(20, repS/2) + opinion/2 +
// 10 (subordinate) + 8 (tribute ≥3000 && opinion ≥5) + U(-10,+10).
// det >= 65 => direct accept even on worst noise. 55-64 => accept/counter.
// 45-54 => counter band (playable). <45 => likely decline.
function detScore(Game, targetId, trib) {
  try {
    const ov = ((Game.state || {}).otherVillages || []).find(v => v && v.id === targetId);
    const opinion = ov ? (ov.opinion || 0) : 0;
    let repS = 0;
    try { const rep = Game.representative(); if (rep) repS = Game.linkStanding(rep.id) || 0; } catch (e) {}
    return 38 + Math.min(20, repS / 2) + opinion / 2 + 10 +
      ((trib >= 3000 && opinion >= 5) ? 8 : 0);
  } catch (e) { return 0; }
}

// v3 OPINION-BUILDING PHASE (the climb, before the switch window).
// CUT 2026-10-12 (pilot): the active codex trek was removed. It moved the
// persona for ~3 days and perturbed the RNG stream (travelTo/study consume
// draws); on seed 303 the v3 trajectory collapsed at d65 where v2 reached
// national at d152. The building now uses the PASSIVE climb verbs only —
// broadcast wins (+2 each, automatic via _foreignEyes) and time (+1/wk toward
// zero) — while the score gate below waits for det >= 55. The old link stays
// active throughout; nothing is risked. If a future run wants the active
// +3, it belongs behind a persona-safety gate, not in the baseline.
// (Kept as a documented no-op so the call site in belongCourtship reads
// honestly; the trek helpers were removed.)
function v3Build(Game, ctx) {
  return; // passive building only — see above
}

// Active Haven-subordinate link (the BELONG road's bond), if any.
function subLink(Game) {
  try {
    const ls = Game.hierarchyState() || [];
    for (const l of ls) {
      if (l && l.status === 'active' && l.subordinate === 'haven' && !l.kind) return l;
    }
  } catch (e) {}
  return null;
}

// Target selection: the primary of the largest known foreign polity (the
// consolidation candidate — the realm most likely to reach 4 fires under
// engagement), else the strongest known village. Never an already-linked or
// hostile (opinion ≤ −15, shut door) fire.
function pickTarget(Game) {
  try {
    const st = Game.state;
    const known = (st.otherVillages || []).filter(v =>
      v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) &&
      !(Game.linkWith && Game.linkWith(v.id)) && (v.opinion || 0) > -15);
    if (!known.length) return null;
    let fps = [];
    try { fps = (Game.foreignPolities && Game.foreignPolities()) || []; } catch (e) {}
    const withSubs = fps
      .filter(f => f && f.primary && (f.subs || []).length > 0)
      .sort((a, b) => ((b.subs || []).length) - ((a.subs || []).length));
    for (const f of withSubs) {
      const v = known.find(x => x.id === f.primary);
      if (v) return v;
    }
    known.sort((a, b) => standingOf(Game, b.id) - standingOf(Game, a.id));
    return known[0] || null;
  } catch (e) { return null; }
}

function proposeSubordinate(Game, ctx, t) {
  const day = gday(Game);
  ctx._belongCool = ctx._belongCool || {};
  if (((ctx._belongCool[t.id] || 0) + 7 > day)) return;
  if (BELONG_V3 && ctx._switched) {
    // v3: after a switch, don't cold-ask into a likely decline — the
    // decline's -5 is real and the courtshipDeclined watching bonus only
    // helps if we then do the verbs. Wait for the counter band or better.
    // (The initial day-20 courtship is ungated — v2 behavior preserved.)
    const det = detScore(Game, t.id, 5000);
    if (det < 50) { ctx._v3retryWaiting = (ctx._v3retryWaiting || 0) + 1; return; }
  }
  ctx._belongCool[t.id] = day;
  try {
    const r = Game.proposeLink(t.id, { asSubordinate: true, tributeKcalPerWeek: 5000 });
    ctx.belongProposed = (ctx.belongProposed || 0) + 1;
    ctx.belongLastTarget = t.id;
    if (r === 'counter') answerBelongCounter(Game, ctx);
  } catch (e) {}
}

// RIDE THE CONSOLIDATOR (seed-303 lesson, 2026-10-12): the BELONG beat needs
// OUR primary's realm at ≥4 fires, but foreign consolidation picks its head
// by momentum (uniform pair seed + engagement growth), not by our courtship.
// The day-20 pick is a blind bet on the strongest known fire. Once the region
// shows its hand — some other fire's realm at 4+ while ours stalls below 4 —
// break cleanly ('walked': opinion −10, an honest parting, no gambit) and
// court the rising power. Once per run; the trust investment is sunk cost
// against a structural bar. Returns true when a switch happened.
function rideConsolidator(Game, ctx) {
  try {
    const day = gday(Game);
    if (ctx._switched || day < 55) return false;
    const link = subLink(Game);
    if (!link || (day - (link.day || 0)) < 21) return false;
    let fps = [];
    try { fps = (Game.foreignPolities && Game.foreignPolities()) || []; } catch (e) {}
    let ourSize = 0, best = null, bestSize = 0;
    for (const f of fps) {
      if (!f || !f.primary) continue;
      const sz = 2 + ((f.subs || []).length);
      if (f.primary === link.primary) ourSize = sz;
      if (sz > bestSize) { bestSize = sz; best = f; }
    }
    if (!best || best.primary === link.primary || bestSize < 4 || ourSize >= 4) return false;
    if (BELONG_V3) {
      // EXILE GATE (606/707): never burn the bond when the re-court is
      // engine-blocked. The persona can't propose while exiled — breaking
      // here trades a trust-90+ live bond for a silent null.
      if (!canPropose(Game)) {
        ctx._v3blockedExile = (ctx._v3blockedExile || 0) + 1;
        return false;
      }
      // SCORE GATE: only break once the re-court is likely to clear the bar.
      // det >= 65 clears 55 even on worst noise (direct accept). Below 55 we
      // keep building (codex/broadcast/time); the day-85 deadline breaks at
      // >= 45 (the counter band is playable — counters get answered).
      // Below 45 we never break: the decline's -5 isn't worth it.
      const det = detScore(Game, best.primary, 5000);
      ctx._v3detAtSwitch = Math.round(det * 10) / 10;
      if (det < 55 && day < 85) { ctx._v3waitingScore = (ctx._v3waitingScore || 0) + 1; return false; }
      if (det < 45) { ctx._v3blockedScore = (ctx._v3blockedScore || 0) + 1; return false; }
    }
    try { Game.breakLink(link.id, 'walked'); } catch (e) {}
    ctx._switched = link.primary + '->' + best.primary;
    ctx.switches = (ctx.switches || 0) + 1;
    // court the rising power immediately — clear its cooldown, it may have
    // been knocked on before
    try { (ctx._belongCool = ctx._belongCool || {})[best.primary] = 0; } catch (e) {}
    const st = Game.state;
    const t = (st.otherVillages || []).find(v => v && v.id === best.primary);
    if (t && pantryKcal(Game) > 12000) proposeSubordinate(Game, ctx, t);
    return true;
  } catch (e) { return false; }
}

// Honest counter handling: the middle band counters our subordinate offer with
// max(offered, 6000)/wk. Accept only when the pantry can carry ~6 weeks of
// their terms; otherwise walk (opinion −3, cooldown) rather than promise what
// we can't pay — arrears would kill the standing bar.
function answerBelongCounter(Game, ctx) {
  const c = (Game.state || {}).pendingCounter;
  if (!c || !Game.answerCounter) return;
  const trib = c.tributeKcalPerWeek || 6000;
  const pk = pantryKcal(Game);
  try {
    if (pk > Math.max(30000, trib * 6)) {
      Game.answerCounter('accept');
      ctx.belongCountersAccepted = (ctx.belongCountersAccepted || 0) + 1;
    } else {
      Game.answerCounter('walk');
      ctx.belongCountersWalked = (ctx.belongCountersWalked || 0) + 1;
    }
  } catch (e) {}
}

function belongCourtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
    const week = (Game._week ? Game._week() : 0);
    // 1. Any pending counter is ours (scalecourt's proposals are shielded) —
    //    answer it before its own answering logic can spend a sweetener.
    if (st.pendingCounter) answerBelongCounter(Game, ctx);
    const link = subLink(Game);
    // 2. Tribute priority: arrears 0 is the standing bar, so pay even below
    //    scalecourt's 15k pantry threshold — when the pantry can carry 2× the
    //    week's tribute. Real food, real cost (payTribute debits the pantry).
    if (link && link.tributePaidWeek !== week && Game.payTribute) {
      const trib = link.tributeKcalPerWeek || 4000;
      if (pantryKcal(Game) > trib * 2) {
        try { Game.payTribute(link.id); ctx.belongTribute = (ctx.belongTribute || 0) + 1; } catch (e) {}
      }
    }
    // 3. Answer the primary's demands ourselves: honor the obligation even on
    //    a thin pantry (honor is proportional; refusals cost −15 trust and
    //    break the standing bar). Partial payments grow arrears — cleared by
    //    the next full weekly tribute.
    if (link && link.pendingDemand && Game.answerDemand) {
      try { Game.answerDemand(link.id, true); ctx.belongDemands = (ctx.belongDemands || 0) + 1; } catch (e) {}
    }
    // 4. Courtship: day ≥ 20, one subordinate link at a time, 7-day cooldown
    //    per target. The tribute offer is real (judgeLink's generosity band
    //    reads ≥ 3000 with opinion ≥ 5); the counter band may set 6000.
    //    The consolidator switch (step 5) runs first — a fresh break leaves
    //    no link, and the rising power gets courted the same day.
    //    v3: the opinion-building phase (step 0) runs before all of this —
    //    the climb verbs land while the old link is still active.
    if (BELONG_V3) { v3Build(Game, ctx); }
    rideConsolidator(Game, ctx);
    if (day >= 20 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational) {
      if (!subLink(Game) && pantryKcal(Game) > 12000) {
        const t = pickTarget(Game);
        if (t) proposeSubordinate(Game, ctx, t);
      }
    }
  } catch (e) {}
}

const belongseek = Object.assign({}, scalecourt, {
  id: 'belongseek',
  desc: 'scalecourt + BELONG-road courtship (subordinate proposals, tribute priority, demands honored, consolidator switch); LEAD/covenant/trade proposals shielded' +
    (BELONG_V3 ? '; v3: exile-aware switch + opinion-building climb before the switch + score-gated break' : ''),
  daily(Game, ctx) {
    belongCourtship(Game, ctx);
    // PROPOSAL SHIELD: scalecourt.daily would court the LEAD/covenant/trade
    // roads (its own proposals). Those are measured elsewhere; here they'd
    // confound the BELONG measurement (a covenant beat staging first would
    // steal the national slot). Block proposal verbs for the duration of the
    // inherited daily; all answering (beats, demands, tribute, calls) runs.
    const op = Game.proposeLink, oc = Game.proposeCovenant, ot = Game.proposeTrade;
    Game.proposeLink = function () { return null; };
    if (typeof oc === 'function') Game.proposeCovenant = function () { return null; };
    if (typeof ot === 'function') Game.proposeTrade = function () { return null; };
    try { scalecourt.daily(Game, ctx); }
    finally {
      Game.proposeLink = op;
      if (typeof oc === 'function') Game.proposeCovenant = oc;
      if (typeof ot === 'function') Game.proposeTrade = ot;
    }
  },
});

module.exports = { belongseek };
