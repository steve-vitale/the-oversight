// scalecourt — competent + covenant-road scale courtship (longsim food r2 2026-10-11).
//
// A competent player who ALSO courts the scale ladder the way the journey-scale
// leg played it: day 25+ first link (regional accord), then covenant peer links
// toward the national bar (3 same-kind peers), trade links after. Answers
// counters, accords, national/global beats, defense/trade calls, covenant
// crises, primary demands; pays tribute when the pantry can carry it.
// Covenant road is the food-relevant one (the shared league granary).
//
// Exists so the day-40+ food economy AT SCALE can be measured: production by
// source, pantry flow, tribute/pool/tariff in/out, spoilage, nightly draw.
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

function courtship(Game, ctx) {
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
    // demands + tribute + defense/trade calls on all active links
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      const lid = link.id;
      if (link.pendingDefenseCall && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(lid, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
      if (link.pendingTradeCall && Game.answerTradeCall) {
        const canSend = pantryKcal(Game) > 10000;
        try { Game.answerTradeCall(lid, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.tradeCalls = (ctx.tradeCalls || 0) + 1;
      }
      if (link.pendingCovenantCrisis && Game.answerCovenantCrisis) {
        try { Game.answerCovenantCrisis(lid, 'concede'); } catch (e) {}
        ctx.covenantCrises = (ctx.covenantCrises || 0) + 1;
      }
      if (link.subordinate !== 'haven') continue;
      if (link.pendingDemand && Game.answerDemand) {
        const rich = pantryKcal(Game) > 12000;
        try { Game.answerDemand(link.id, rich); } catch (e) {}
        ctx.demands = (ctx.demands || 0) + 1;
      }
      const week = (Game._week ? Game._week() : 0);
      if (link.tributePaidWeek !== week && pantryKcal(Game) > 15000 && Game.payTribute) {
        try { Game.payTribute(link.id); } catch (e) {}
        ctx.tributePaid = (ctx.tributePaid || 0) + 1;
      }
    }
    // courtship: day>=25, first link, then peer push toward the covenant bar (3)
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const covN = active.filter(l => l.kind === 'covenant').length;
      const trN = active.filter(l => l.kind === 'trade').length;
      ctx._propCool = ctx._propCool || {};
      const coolOk = (vid, kind) => ((ctx._propCool[vid + ':' + kind] || 0) + 7 <= day);
      const markCool = (vid, kind) => { ctx._propCool[vid + ':' + kind] = day; };
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      if (!cands.length) return;
      if (!active.length) {
        const t = cands.find(v => coolOk(v.id, 'link')) || null;
        if (t) {
          markCool(t.id, 'link');
          try { Game.proposeLink(t.id); } catch (e) {}
          ctx.proposed = (ctx.proposed || 0) + 1;
        }
        return;
      }
      // covenant first (the food-relevant road), then trade
      if (covN < 3 || trN < 3) {
        for (const t of cands) {
          const kind = covN < 3 && coolOk(t.id, 'covenant') ? 'covenant'
            : trN < 3 && coolOk(t.id, 'trade') ? 'trade' : null;
          if (!kind) continue;
          markCool(t.id, kind);
          try {
            if (kind === 'covenant' && Game.proposeCovenant) Game.proposeCovenant(t.id);
            else if (kind === 'trade' && Game.proposeTrade) Game.proposeTrade(t.id);
          } catch (e) {}
          ctx.proposedPeer = (ctx.proposedPeer || 0) + 1;
          break; // one proposal per day — courtship takes time
        }
      }
    }
  } catch (e) {}
}

// GRANARY DRAW (LEVER CANDIDATE — not in the baseline): the covenant's
// headline benefit is "draw on it in famine". A competent player whose pantry
// is nearly bare and whose league granary holds food would draw the village's
// daily need. Kept OUT of the baseline so the scale economy can be measured
// as-is; the lever run may add it (policy-side) or wire an automatic famine
// draw (game-code). See evidence/2026-10-11/sim-food-r2.md.

const scalecourt = Object.assign({}, competent, {
  id: 'scalecourt',
  desc: 'competent + covenant-road scale courtship (propose/answer/tend links)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    courtship(Game, ctx);
  },
});

module.exports = { scalecourt };
