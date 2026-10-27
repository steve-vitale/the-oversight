// leanlinkrescue — lean courtship, cap-3, rescue-tend-only (sim-leanlink-rescue,
// axis scale-onramp, run fleshout-20261024T1615Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: LEANLINKRESCUE unset or not
// '1' → daily delegates to competent.daily with NO courtship at all (the
// det-gate in scripts/test-sim-leanlink-rescue.js pins that: off daily is
// competent.daily, and competent contains no scale verbs).
//
// CONTEXT: sim-linkdrive (2026-10-24) proved a link/courtship drive moves
// national 0/8 → 7/8 but was KILLED-AT-PILOT on the binding starvation
// guardrail (armed 5 vs control 1+2 allowance). Its mechanism notes say
// weekly tends to ALL links are the expensive ingredient (1,500
// kcal/week/link; 133 tends on rich seed 73407), while thin seeds reached
// national with 0 tends. This arm tests whether tending ONLY dipping links
// (the HOLD where it matters) keeps the national gain at a fraction of the
// tend cost.
//
// DELTA vs LINKFORM=2, EXACTLY (nothing else changes):
//   1. subordinate cap 5 → 3 (leadcourt's cap, not overcourt's);
//   2. tends ONLY to active Haven-primary links whose trust is BELOW 40
//      (the seasoned bar), once per week (tendedWeek check), pantry >
//      20,000 kcal. No tends to links at trust ≥ 40.
// Everything else is linkformCourtship verbatim: answer pending counters
// (sweeten if pantry > 25,000 kcal else accept), accords (gift), national
// beats (shape-mapped pick), global beats (feast), defense calls (send if
// pop >= 5 else refuse); propose from day 25, 1/day, 7-day per-village
// cooldown, pantry > 12,000 kcal, tribute 4,000 kcal/week.
//
// A GO verdict means GO CANDIDATE, default-OFF only — landing this as
// competent play is a coordinator/Steve call, NOT made by this arm. No
// default flips.
'use strict';
const { competent } = require('./competent-nofallback');

function leanlinkRescueOn() {
  try {
    return String((typeof process !== 'undefined' && process.env && process.env.LEANLINKRESCUE) || '0') === '1';
  } catch (e) { return false; }
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function popAlive(Game) {
  try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return 0; }
}

// leanlinkRescueCourtship: linkformCourtship with the two deltas above.
function leanlinkRescueCourtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
    // answer pending offers/beats — a competent player answers, never leaves mail unread
    if (st.pendingCounter && Game.answerCounter) {
      const rich = pantryKcal(Game) > 25000;
      try { Game.answerCounter(rich ? 'sweeten' : 'accept'); } catch (e) {}
      ctx.courtCounters = (ctx.courtCounters || 0) + 1;
    }
    if (st.pendingAccord && Game.answerAccord) {
      try { Game.answerAccord('gift'); } catch (e) {}
      ctx.courtAccords = (ctx.courtAccords || 0) + 1;
    }
    if (st.pendingNational && Game.answerNationalChoice) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { Game.answerNationalChoice(pick); } catch (e) {}
      ctx.courtNational = (ctx.courtNational || 0) + 1;
    }
    if (st.pendingGlobal && Game.answerGlobalChoice) {
      try { Game.answerGlobalChoice('feast'); } catch (e) {}
      ctx.courtGlobal = (ctx.courtGlobal || 0) + 1;
    }
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    const week = (Game._week ? Game._week() : 0);
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      // RESCUE TEND ONLY: the HOLD where it matters. A link at/above the
      // seasoned bar (trust 40) holds itself; tending it is pantry burned
      // for no polity gain. A dipping link (trust < 40) gets the grain.
      if (link.primary === 'haven' && Game.tendLink) {
        const trust = (link.trust != null ? link.trust : 0);
        if (trust < 40 && link.tendedWeek !== week && pantryKcal(Game) > 20000) {
          try { Game.tendLink(link.id); } catch (e) {}
          ctx.tended = (ctx.tended || 0) + 1;
          ctx.tendTrusts = ctx.tendTrusts || [];
          ctx.tendTrusts.push({ day, id: link.id, trust });
        }
      }
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(link.id, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
    }
    // LEAD courtship, cap 3: propose from day 25, 1/day, 7-day cooldown.
    const proposeFrom = 25;
    const subCap = 3;
    const perDay = 1;
    if (day >= proposeFrom && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
      if (subs >= subCap) return;
      ctx._leadCool = ctx._leadCool || {};
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      let made = 0;
      for (const t of cands) {
        if (made >= perDay) break;
        if ((ctx._leadCool[t.id] || 0) + 7 > day) continue;
        ctx._leadCool[t.id] = day;
        try { Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }); } catch (e) {}
        ctx.proposedLead = (ctx.proposedLead || 0) + 1;
        made++;
      }
    }
  } catch (e) {}
}

const leanlinkrescue = Object.assign({}, competent, {
  id: 'leanlinkrescue-nofallback',
  desc: 'competent + LEANLINKRESCUE-gated lean courtship (cap 3, rescue-tend-only below trust 40; default off = competent)',
  daily(Game, ctx) {
    if (!leanlinkRescueOn()) return competent.daily(Game, ctx); // gate off: pure competent
    competent.daily(Game, ctx);
    leanlinkRescueCourtship(Game, ctx);
  },
});

module.exports = { leanlinkrescue, leanlinkRescueOn, leanlinkRescueCourtship };
