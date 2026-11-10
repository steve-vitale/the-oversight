// competent-answermail-a — competent + the answer-the-mail drive
// (arm sim-answermail-a, run fleshout-20261110T0615Z).
//
// The trust-growth diag (sim-trustgrowth-b, band 99101-99108) found the
// village's trust growers go unused under competent play: the
// first-gesture accord (+4..10) sits pending from formation day to
// death on all 8 seeds, tendLink (+8/week) is never called, and
// renegotiation beats expire in silence (-6 each). This policy answers
// the mail that arrives — nothing more:
//
//   1. pendingAccord -> answerAccord('gift') (2,000 kcal -> +10).
//   2. active LEAD links (primary haven): tendLink once a week when
//      the pantry holds > 20,000 kcal (leadcourt's gate; tendLink
//      itself refuses mourning weeks at no cost).
//   3. link.pendingRenegotiation -> answerRenegotiation(id, 'gift')
//      (1,500 kcal -> +8; lands through the mourning choke for
//      succgrace beats).
//   4. link.pendingDemand -> answerDemand(id, true) (honor).
//
// Explicitly NOT here: proposing links (this policy must never form a
// link — the isolated answer-the-mail effect is the measurement),
// answering counters, answering national/global beats, tribute or
// arrears verbs. Leadcourt and linkdrive both answer the accord and
// tend, but both bundle answering with PROPOSING; this policy isolates
// answering on the links the village actually gets.
//
// Every verb goes through the same engine paths a player clicks, with
// real pantry costs. No src/js changes; policy-only lever.
'use strict';
const { competent } = require('./competent');

const TEND_PANTRY = 20000;

const STATS = {
  accordAnswers: 0, accordGiftKcal: 0,
  tends: 0, tendsBlockedPantry: 0, tendsPaidKcal: 0,
  renegotiationAnswers: 0, renegotiationGiftKcal: 0,
  demandAnswers: 0, demandKinds: {},
  proposeCalls: 0,
  errors: 0, events: [],
};
function resetAnswermailStats() {
  STATS.accordAnswers = 0; STATS.accordGiftKcal = 0;
  STATS.tends = 0; STATS.tendsBlockedPantry = 0; STATS.tendsPaidKcal = 0;
  STATS.renegotiationAnswers = 0; STATS.renegotiationGiftKcal = 0;
  STATS.demandAnswers = 0; STATS.demandKinds = {};
  STATS.proposeCalls = 0;
  STATS.errors = 0; STATS.events = [];
}
function answermailStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function event(day, kind, detail) {
  try { STATS.events.push({ day: day, kind: kind, detail: detail || null }); } catch (e) {}
}

function answerTheMail(Game, ctx) {
  try {
    const day = dayOf(Game);
    const st = Game.state || {};
    // 1. The first gesture: answer the pending accord with a gift.
    if (st.pendingAccord && typeof Game.answerAccord === 'function') {
      const acc = st.pendingAccord;
      try { Game.answerAccord('gift'); } catch (e) { STATS.errors += 1; }
      STATS.accordAnswers += 1;
      event(day, 'accord-answer', { linkId: acc.linkId || null, how: 'gift' });
    }
    let links = [];
    try { links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : []; } catch (e) { STATS.errors += 1; }
    const week = (typeof Game._week === 'function') ? Game._week() : 0;
    const pantry = pantryKcal(Game);
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      // 2. Tend our subordinates weekly, when the pantry can carry it.
      if (link.primary === 'haven' && typeof Game.tendLink === 'function') {
        if (link.tendedWeek !== week) {
          if (pantry > TEND_PANTRY) {
            let paid = 0;
            try { paid = Game.tendLink(link.id) || 0; } catch (e) { STATS.errors += 1; }
            if (paid > 0) {
              STATS.tends += 1; STATS.tendsPaidKcal += paid;
              event(day, 'tend', { linkId: link.id, paid: paid });
            }
          } else {
            STATS.tendsBlockedPantry += 1;
          }
        }
      }
      // 3. Answer a staged renegotiation beat with grain, never silence.
      if (link.pendingRenegotiation && typeof Game.answerRenegotiation === 'function') {
        try { Game.answerRenegotiation(link.id, 'gift'); } catch (e) { STATS.errors += 1; }
        STATS.renegotiationAnswers += 1;
        event(day, 'renegotiation-answer', { linkId: link.id, how: 'gift' });
      }
      // 4. Honor a pending demand.
      if (link.pendingDemand && typeof Game.answerDemand === 'function') {
        const kind = link.pendingDemand.kind || '?';
        try { Game.answerDemand(link.id, true); } catch (e) { STATS.errors += 1; }
        STATS.demandAnswers += 1;
        STATS.demandKinds[kind] = (STATS.demandKinds[kind] || 0) + 1;
        event(day, 'demand-answer', { linkId: link.id, kind: kind });
      }
    }
  } catch (e) { STATS.errors += 1; }
}

const answermailPolicy = Object.assign({}, competent, {
  id: 'competent-answermail-a',
  desc: 'competent + answer-the-mail (accord gift, weekly tend, renegotiation + demand answers; never proposes)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    answerTheMail(Game, ctx);
  },
});

module.exports = { answermailPolicy: answermailPolicy,
  resetAnswermailStats: resetAnswermailStats, answermailStats: answermailStats,
  answerTheMail: answerTheMail };
