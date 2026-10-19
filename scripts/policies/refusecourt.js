// refusecourt — competent + REFUSE-road scale courtship (journey scale r9, 2026-10-19).
//
// Identical courtship to `leadcourt`: propose villages as Haven's
// subordinates (primary-Haven links), tend them with grain, keep their
// tribute honest. The courtship is the engine that stages a national beat —
// without three seasoned bonds no offer ever arrives.
//
// The difference is the answer: this policy REFUSES the scale itself on
// every national beat (`Game.answerNationalChoice('refuse')`), measuring
// the sixth road — a competent player who reaches a national beat and
// refuses the polity: permanent, aloud, bilateral relationships surviving.
//
// A competent player answers the mail — never leaves pendingNational
// pending. The pendingCounter / pendingAccord / pendingGlobal handling is
// leadcourt-identical.
'use strict';
const { competent } = require('./competent');

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

function refuseCourtship(Game, ctx) {
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
      // REFUSE ROAD (r9): the pendingNational branch ALWAYS refuses the
      // scale itself — permanently, aloud. The offer stages per shape; the
      // answer is the verdict.
      const shape = st.pendingNational.shape;
      let res = null;
      try { res = Game.answerNationalChoice('refuse'); } catch (e) { res = 'error: ' + (e && e.message); }
      ctx.courtNational = (ctx.courtNational || 0) + 1;
      ctx.refuseAnswers = (ctx.refuseAnswers || 0) + 1;
      try { (ctx.refuseAnswerLog || (ctx.refuseAnswerLog = [])).push({ day, shape, res }); } catch (e) {}
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
      // TEND OUR SUBORDINATES: the tending verb, weekly, when the pantry
      // can carry it. Post-refusal the bilateral bonds still get tended —
      // only the polity is refused, never the relationships.
      if (link.primary === 'haven' && Game.tendLink) {
        if (link.tendedWeek !== week && pantryKcal(Game) > 20000) {
          try { Game.tendLink(link.id); } catch (e) {}
          ctx.tended = (ctx.tended || 0) + 1;
        }
      }
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(link.id, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
    }
    // courtship: day>=25, propose villages as subordinates until three
    // seasoned bonds stand under one head. One proposal per day.
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
      if (subs >= 3) return;
      ctx._refuseCool = ctx._refuseCool || {};
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      for (const t of cands) {
        if ((ctx._refuseCool[t.id] || 0) + 7 > day) continue;
        ctx._refuseCool[t.id] = day;
        try { Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }); } catch (e) {}
        ctx.proposedLead = (ctx.proposedLead || 0) + 1;
        break;
      }
    }
  } catch (e) {}
}

const refusecourt = Object.assign({}, competent, {
  id: 'refusecourt',
  desc: 'competent + REFUSE-road courtship (propose/tend subordinates, always refuse the national beat)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    refuseCourtship(Game, ctx);
  },
});

module.exports = { refusecourt };
