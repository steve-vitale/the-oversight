// leanlink — leadcourt courtship WITHOUT tends, cap 3 (sim-leanlink arm,
// axis scale-onramp, run fleshout-20261024T1530Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: LEANLINK unset, '0', or
// anything but '1' → daily delegates to competent.daily (no courtship at
// all — the lean courtship is inert unless explicitly enabled).
//
// THE DELTA vs LINKFORM=2 (linkform.js mode 2) is EXACTLY two things:
//   1. subordinate cap 5 → 3 (back to leadcourt's cap), and
//   2. NO weekly tends at all (the 1,500 kcal/week/link tend verb is never
//      called; ctx.tended is never incremented).
// Nothing else changes: competent.daily + answering pending counters
// (sweeten if pantry > 25,000 kcal else accept), accords (gift), national
// beats (shape-mapped pick), global beats (feast), defense calls (send if
// pop >= 5 else refuse); proposes from day 25, 1/day, 7-day per-village
// cooldown, pantry > 12,000 kcal, tribute 4,000 kcal/week.
//
// WHY: sim-linkdrive (2026-10-24) proved a link/courtship drive moves
// national 0/8 → 7/8 but was KILLED-AT-PILOT on the binding starvation
// guardrail (armed 5 vs control 1+2 allowance). Its mechanism notes say
// tends are NOT load-bearing on thin-pantry seeds (seed 73403 reached
// national with 0 tends, via proposals + accord answers alone). This arm
// tests whether dropping the tend ingredient at cap 3 keeps the national
// gain without the starvation cost.
//
// CANON NOTE: no canon doc covers the envoy→accord mechanism specifically
// (CANON.md manifest has no such doc). The mechanism here comes from
// src/js/hierarchy.js, scripts/policies/linkform.js and leadcourt.js,
// read before writing this file — not invented.
//   - national is a polity: LEAD = primary of >=3 seasoned subordinates;
//     seasoned = link 30+ days old AND trust 40+ (formed at 30).
//   - proposeLink scores courtship (>=55 accepts, 35–54 counters with
//     played terms, <35 declines); counter-terms played, never rolled.
//   - national is a live state (dissolve the realm and nationalLive clears).
'use strict';
const { competent } = require('./competent');
const { leadcourt } = require('./leadcourt');

function leanlinkMode() {
  try {
    const v = String((typeof process !== 'undefined' && process.env && process.env.LEANLINK) || '0');
    return v === '1' ? 1 : 0;
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

// leanCourtship: linkformCourtship with the tend loop REMOVED and the
// subordinate cap back at 3. Deliberately contains NO tend verb call:
// the tend ingredient is the thing under test, and its absence must be
// provable from this source (scripts/test-sim-leanlink.js T1).
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
    // NO TEND LOOP HERE — deliberately. Tends are the removed ingredient.
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(link.id, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
    }
    // LEAD courtship, lean: cap 3 subordinate links, propose from day 25.
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

const leanlink = Object.assign({}, competent, {
  id: 'leanlink',
  desc: 'competent + LEANLINK-gated lean courtship (cap 3, NO tends; default off = competent)',
  daily(Game, ctx) {
    const mode = leanlinkMode();
    if (mode === 0) return competent.daily(Game, ctx); // gate off: pure competent
    competent.daily(Game, ctx);
    leanCourtship(Game, ctx);
  },
});

module.exports = { leanlink, leanlinkMode, leanCourtship };
