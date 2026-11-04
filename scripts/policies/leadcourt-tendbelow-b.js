// leadcourt-tendbelow-b — leadcourt-tendthrough with EXACTLY ONE
// further restriction: a tend fires ONLY for a link BELOW the seasoned
// bar (arm sim-tendbelow-b, Loop B 20261104T1735Z; the fresh-band
// re-judgment of the tendseason variant with a decision-time tend
// classifier — see evidence/2026-11-04/sim-tendbelow-b-prereg.md).
// Everything else is leadcourt-tendthrough verbatim: weekly cadence
// (tendedWeek check unchanged), Haven-primary links only, 1,500 kcal
// engine cost per tend, proposal gate pantry > 12,000 unchanged,
// answer/counter logic unchanged, NO pantry tend gate at all (the
// tend-through leg has none, and this arm adds none back).
//
// PREDICATE (read from src/js/hierarchy.js before any sim, not
// invented): _linkSeasoned counts a link toward a polity when it is
// 30+ days old AND trust 40+ (links form at trust 30 via _formLink:
// link.day = formation day, link.trust starts at 30). So a link IS
// seasoned iff (scholar day - link.day) >= 30 AND (link.trust || 0)
// >= 40, and this policy tends iff NOT that: age < 30 days OR trust
// < 40. Mercy/succ-polity graces are polity-membership-only readings
// and never change link.trust, so they do not move this predicate;
// conquered links need the season alone for polity membership, but
// this policy never raids, and the raw trust bar is the conservative
// reading (a seasoned-age link under trust 40 is exactly a link at
// risk of unseasoning, so it gets tended). A seasoned link is never
// tended by this policy — grain goes only to links at risk of
// unseasoning, never to links already safe. The predicate reads the
// live link object at decision time, so it cannot disagree with
// itself the way a previous-day-snapshot classifier could (the
// tendseason lesson: snapshot trust 46 vs decision trust 38).
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
// Below the seasoned bar iff age < 30 days OR trust < 40.
// Fields: link.day (formation day, set in _formLink) and link.trust.
function belowSeasonedBar(Game, link) {
  try {
    const age = gday(Game) - (link.day || 0);
    return age < 30 || (link.trust || 0) < 40;
  } catch (e) { return true; }
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
      // but ONLY for links below the seasoned bar — seasoned links are
      // never tended by this policy. This is the tendbelow arm's one change.
      if (link.primary === 'haven' && Game.tendLink) {
        if (link.tendedWeek !== week && belowSeasonedBar(Game, link)) {
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

const leadcourtTendbelowB = Object.assign({}, competent, {
  id: 'leadcourt-tendbelow-b',
  desc: 'leadcourt-tendthrough restricted to links below the seasoned bar (age < 30d OR trust < 40), decision-time classified',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    leadCourtship(Game, ctx);
  },
});

module.exports = { leadcourtTendbelowB: leadcourtTendbelowB, belowSeasonedBar: belowSeasonedBar };
