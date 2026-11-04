// leadcourt-tendfloor-b — leadcourt-tendthrough with the tend gate
// FLOORED at pantry > 13,500 kcal (arm sim-tendfloor-b, Loop B 20261104T1330Z).
// Every other line is leadcourt-tendthrough verbatim: tending still
// weekly, still Haven-primary links only, still 1,500 kcal per tend
// (engine price), proposal gate pantry > 12,000 unchanged,
// answer/counter logic unchanged. Floor = 12,000 proposal gate +
// 1,500 one-tend cost, so a policy-authorized tend can never by
// itself push the pantry below the proposal gate. No src/js change,
// no zombie-clearing mechanism: a trust-0 active link still counts
// as a subordinate and still blocks replacement, exactly as in
// baseline.
//
// A competent player who ALSO courts the LEAD road the way the canon
// describes it: propose villages as Haven's subordinates (primary-Haven
// links), tend them with grain, keep their tribute honest. Exists so the
// LEAD road to national can be MEASURED — the plain `competent` policy
// contains zero scale code by design (it stays pinned as the scale-free
// baseline; MEASUREMENT.md §2), and `scalecourt` courts the covenant road.
// Reachability claims about the LEAD road run against THIS policy, never
// against competent's silence.
//
// The policy tends (send grain, 1,500 kcal → +8 trust, weekly) and proposes;
// it does not cheat: every verb goes through the same engine paths a player
// clicks, with real pantry costs.
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

function leadCourtship(Game, ctx) {
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
      // TEND OUR SUBORDINATES (scale-wall fix): the tending verb, weekly,
      // when the pantry can carry it. This is the LEAD road's engine.
      if (link.primary === 'haven' && Game.tendLink) {
        if (link.tendedWeek !== week && pantryKcal(Game) > 13500) {
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
    // LEAD courtship: day>=25, propose villages as subordinates until three
    // seasoned bonds stand under one head. One proposal per day — courtship
    // takes time.
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
      if (subs >= 3) return;
      ctx._leadCool = ctx._leadCool || {};
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      for (const t of cands) {
        if ((ctx._leadCool[t.id] || 0) + 7 > day) continue;
        ctx._leadCool[t.id] = day;
        try { Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }); } catch (e) {}
        ctx.proposedLead = (ctx.proposedLead || 0) + 1;
        break;
      }
    }
  } catch (e) {}
}

const leadcourtTendfloorB = Object.assign({}, competent, {
  id: 'leadcourt-tendfloor-b',
  desc: 'leadcourt-tendthrough floored at pantry > 13,500 kcal (tend below 20,000 only above the floor)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    leadCourtship(Game, ctx);
  },
});

module.exports = { leadcourtTendfloorB };
