// policies/kindseek.js — the exile-foreclosure kind test (longsim scale-wall r7, 2026-10-13).
//
// belongseek (scale-push, BELONG-road courtship) + kind.js's uniformly-kind
// behavior: NEVER steals (no stealFrom call exists anywhere in this file —
// that absence is the policy), SHARES surplus eagerly (bank overflow +
// pack beyond a half-day buffer), COMFORTS the grieving, KEEPS promises.
//
// Why this tests the exile-foreclosure hypothesis: r6's exiles were earned
// via the takes/gives ledger, but the moot itself was convened by FABRICATED
// theft accusation (betrayal.js considerPlayerAccusation: enemy motive >= 60
// + trustInPlayer < 25 + 25% roll) — the 'hoard' observations from
// theftConfrontation's gross-takes bar build the motive, the trust erosion
// opens the door. A generous scholar still accumulates GROSS takes (the
// confrontation bar is cumulative, not net) but keeps NET non-negative and
// trust high via donations. If exile persists, the transcript names the route.
'use strict';
const { belongseek } = require('./belongseek');
const { kind } = require('./kind');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// kind's shareSurplus, inlined (kind.js is competent-based; we need the
// behavior on top of belongseek's courtship, not competent's daily twice).
function shareSurplus(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const cap = Game.kcalCap ? Game.kcalCap() : 2000;
    if ((s.kcal || 0) <= cap * 1.0) return;
    const inv = s.inventory || [];
    for (let i = inv.length - 1; i >= 0; i--) {
      const it = inv[i];
      if ((it.kcalEach || 0) > 0 && it.foodState !== 'raw' && Game.donateToPantry) {
        try { Game.donateToPantry(i); ctx.shared = (ctx.shared || 0) + 1; break; } catch (e) {}
      }
    }
  } catch (e) {}
}

function comfortRound(Game, ctx) {
  try {
    if (!Game.talkTo) return;
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    const roster = (vv.roster || []).filter(id => id !== me);
    for (const vid of roster) {
      let grieving = false;
      try {
        const p = Game.getPerson ? Game.getPerson(vid) : null;
        grieving = !!(p && (p.grieving || p.mood === 'grieving'));
      } catch (e) {}
      if (!grieving) continue;
      try {
        Game.talkTo(vid);
        const choices = (Game.convoChoices ? Game.convoChoices(vid) : []) || [];
        const comfort = choices.find(c => c && c.id && /comfort|console|grief/i.test(String(c.id)));
        if (comfort && Game.convoTurn) {
          Game.convoTurn(vid, comfort.id);
          ctx.comforts = (ctx.comforts || 0) + 1;
        }
      } catch (e) {}
      break;
    }
  } catch (e) {}
}

const kindseek = Object.assign({}, belongseek, {
  id: 'kindseek',
  desc: 'belongseek scale-push + kind: never steals, shares surplus eagerly, comforts the grieving, keeps promises',

  daily(Game, ctx) {
    try { belongseek.daily(Game, ctx); } catch (e) {}
    shareSurplus(Game, ctx);
    comfortRound(Game, ctx);
    // No stealFrom call exists anywhere in this file — that absence is the policy.
  },
});

module.exports = { kindseek };
