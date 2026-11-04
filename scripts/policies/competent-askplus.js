// competent-askplus — competent + the asking move (arm sim-askplus-a,
// run fleshout-20261104T0820Z). The tracker's named next blank after
// sim-diplo-b: competent never proposes, so diplomacy income is
// structurally zero under the baseline. This policy adds ONLY the
// proposing/courtship verbs, borrowed from leadcourt.js leadCourtship
// with one documented adaptation: it does NOT answer pendingNational /
// pendingGlobal (endgame choices, not the ask; competent does not answer
// them either, so baseline parity holds). Judging rules, gates, prices,
// and deeds are untouched — every verb below goes through the same
// engine paths a player clicks, with real pantry costs.
//
// Verb set (leadcourt values, unchanged):
//   answerCounter: pantry > 25000 ? 'sweeten' : 'accept'
//   answerAccord: 'gift'
//   answerDefenseCall on our links: 'send' if living roster >= 5 else 'refuse'
//   tendLink: Haven-primary active links, weekly, pantry > 20000
//   proposeLink: day >= 25, no pendingCounter/pendingAccord/pendingNational,
//     pantry > 12000, < 3 Haven-primary non-conquered subordinates,
//     known + unlinked candidates, 1/day, 7-day cooldown per village,
//     proposeLink(id, { asSubordinate: false, tributeKcalPerWeek: 4000 })
//
// Error handling differs from leadcourt only in reporting: failures are
// counted into ctx.askplusErrors (never silently swallowed), per the
// repo rule against empty catches. Behavior on failure is identical
// (skip that verb that day).
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
function noteErr(ctx, where, e) {
  try {
    ctx.askplusErrors = (ctx.askplusErrors || 0) + 1;
    ctx.askplusLastError = where + ': ' + String((e && e.message) || e).slice(0, 120);
  } catch (e2) { /* ctx itself unusable; nothing to record into */ }
}

function askCourtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
    if (st.pendingCounter && Game.answerCounter) {
      const rich = pantryKcal(Game) > 25000;
      try { Game.answerCounter(rich ? 'sweeten' : 'accept'); } catch (e) { noteErr(ctx, 'answerCounter', e); }
      ctx.courtCounters = (ctx.courtCounters || 0) + 1;
    }
    if (st.pendingAccord && Game.answerAccord) {
      try { Game.answerAccord('gift'); } catch (e) { noteErr(ctx, 'answerAccord', e); }
      ctx.courtAccords = (ctx.courtAccords || 0) + 1;
    }
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) { noteErr(ctx, 'hierarchyState', e); }
    const week = (Game._week ? Game._week() : 0);
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      if (link.primary === 'haven' && Game.tendLink) {
        if (link.tendedWeek !== week && pantryKcal(Game) > 20000) {
          try { Game.tendLink(link.id); } catch (e) { noteErr(ctx, 'tendLink', e); }
          ctx.tended = (ctx.tended || 0) + 1;
        }
      }
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(link.id, canSend ? 'send' : 'refuse'); } catch (e) { noteErr(ctx, 'answerDefenseCall', e); }
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
    }
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
      if (subs >= 3) return;
      ctx._askCool = ctx._askCool || {};
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      for (const t of cands) {
        if ((ctx._askCool[t.id] || 0) + 7 > day) continue;
        ctx._askCool[t.id] = day;
        try { Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }); } catch (e) { noteErr(ctx, 'proposeLink', e); }
        ctx.proposedLead = (ctx.proposedLead || 0) + 1;
        break;
      }
    }
  } catch (e) { noteErr(ctx, 'askCourtship', e); }
}

const competentAskplus = Object.assign({}, competent, {
  id: 'competent-askplus',
  desc: 'competent + proposing/courtship verbs borrowed from leadcourt (no national/global answers)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    askCourtship(Game, ctx);
  },
});

module.exports = { competentAskplus: competentAskplus, askCourtship: askCourtship };
