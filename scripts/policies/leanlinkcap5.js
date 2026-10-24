// leanlinkcap5 — linkformCourtship (LINKFORM=2 shape) WITHOUT the weekly tend verb
// (flesh-out loop arm sim-leanlink-cap5, axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: LEANLINKCAP5 unset, or anything other
// than '1' → the daily delegates to competent.daily through the identical code path
// (byte-identical behavior; the det-gate in scripts/test-sim-leanlink-cap5.js pins that).
//
// LEANLINKCAP5=1 (lean courtship, cap-5, no-tend): competent.daily + leanCourtship.
// The delta vs LINKFORM=2 is EXACTLY ONE ingredient: the weekly tend verb is gone.
// There is no tend call in this file at all — no grain sent to subordinates, no
// +8 trust from tending, no tend pantry gate. Subordinate cap stays 5 (overcourt
// headroom, as in LINKFORM=2). Everything else is linkformCourtship verbatim:
// answer pending counters (sweeten if pantry > 25,000 kcal else accept), accords
// (gift), national beats (shape-mapped pick), global beats (feast), defense calls
// (send if pop >= 5 else refuse); propose from day 25, 1/day, 7-day per-village
// cooldown, pantry > 12,000 kcal, tribute 4,000 kcal/week.
//
// Why this arm exists: sim-linkdrive (2026-10-24) proved a link/courtship drive moves
// national 0/8 -> 7/8 but was KILLED-AT-PILOT on the starvation guardrail (armed 5 vs
// control 1 + 2 allowance). Linkdrive combined TWO changes over leadcourt: cap 3 -> 5
// AND weekly tends to all links. This arm isolates the cap: keep the 5-link headroom,
// drop the tend ingredient entirely, and test whether headroom alone (without tend
// cost) preserves the national gain. A GO verdict here is GO CANDIDATE, default-OFF
// only — landing this as competent play is a coordinator/Steve call, never this file.
'use strict';
const { competent } = require('./competent');

function leanlinkcap5Mode() {
  try {
    const v = String((typeof process !== 'undefined' && process.env && process.env.LEANLINKCAP5) || '0');
    if (v === '1') return 1;
    return 0;
  } catch (e) { return 0; }
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

// leanCourtship: linkformCourtship with the tend block REMOVED. The links loop keeps
// only the defense-call ingredient; nothing in this function sends grain to a link.
function leanCourtship(Game, ctx) {
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
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      // NO weekly tend verb in this arm — deliberately absent, not gated off.
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(link.id, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
    }
    // LEAD courtship: courts to 5 subordinate links (overcourt headroom, as LINKFORM=2);
    // everything else is leadcourt's.
    const proposeFrom = 25;
    const subCap = 5;
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

const leanlinkcap5 = Object.assign({}, competent, {
  id: 'leanlinkcap5',
  desc: 'competent + LEANLINKCAP5-gated lean courtship (1 = cap-5, no tends; default off = competent)',
  daily(Game, ctx) {
    const mode = leanlinkcap5Mode();
    if (mode === 0) return competent.daily(Game, ctx); // gate off: pure delegation
    competent.daily(Game, ctx);
    leanCourtship(Game, ctx);
  },
});

module.exports = { leanlinkcap5, leanlinkcap5Mode, leanCourtship };
