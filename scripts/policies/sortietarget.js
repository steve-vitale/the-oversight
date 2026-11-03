// policies/sortietarget.js — answer layer for arm sim-sortietarget-a
// (Loop A 20261103, axis scale-onramp). POLICY ONLY for the answer rule;
// the target threading itself is game code (havenGrowth.js).
//
// ANSWER RULE (identical in both arms, pre-registered): in policy daily,
// if the engine's last announced offer exists and its (key,day) has not
// been answered yet, answer it once. Baseline (withSortieBare) passes
// bare 'sortie' — the current-order behavior. Variant (withSortieAimed)
// passes ('sortie', offer.key) — the match-first behavior. The ONLY
// difference between arms is the target argument.
//
// PERCEPTION LAW (load-bearing): this policy reads ONLY the engine's
// announced-offer record (state.lastLingererOffer — what was spoken
// aloud in the gorge line, one entity, the last announced) and its own
// answered set. It NEVER reads a monster roster or position channel:
// no roster-list call, no world-array call, no tile reads. The
// cleanliness leg of scripts/test-sortietarget-a.js asserts the
// absence of those call tokens in this file, comments included.
//
// TIMING: gorge lines are spoken at endDay, so an offer recorded on day
// D is answered by the daily hook on the next loop-day. The (key,day)
// answered set means each night's latest offer is answered at most
// once, even across repeated daily hooks.
'use strict';

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function lastOffer(Game) {
  try {
    const o = (Game.state || {}).lastLingererOffer;
    if (o && typeof o === 'object' && o.key) return o;
    return null;
  } catch (e) { return null; }
}

function withSortie(base, id, desc, aimed) {
  const wrapped = Object.assign({}, base, {
    id: id || (aimed ? 'sortietarget-aimed' : 'sortietarget-bare'),
    desc: desc || (aimed
      ? 'sortietarget: answer the last announced offer with its key'
      : 'sortietarget: answer the last announced offer bare (current order)'),
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.sortieBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const st = ctx.sortietarget || (ctx.sortietarget = { answered: {}, calls: [] });
      try {
        if (Game.over || Game.tbfight) return;
        if (typeof Game.answerLingerer !== 'function') { st.answerError = 'answerLingerer missing'; return; }
        const offer = lastOffer(Game);
        if (!offer) return;
        const stamp = offer.key + '@' + offer.day;
        if (st.answered[stamp]) return;
        st.answered[stamp] = true;
        const ret = aimed
          ? Game.answerLingerer('sortie', offer.key)
          : Game.answerLingerer('sortie');
        st.calls.push({ day: gday(Game), aimed: !!aimed,
          offerKey: offer.key, offerDay: offer.day,
          ok: !!(ret && typeof ret === 'object' && ret.ok),
          why: (ret && typeof ret === 'object' && ret.why) || (typeof ret === 'string' ? ret : null),
          cleared: (ret && typeof ret === 'object' && (ret.cleared | 0)) || 0,
          fought: (ret && typeof ret === 'object' && Array.isArray(ret.fought)) ? ret.fought : [],
          targetMatched: !!(ret && typeof ret === 'object' && ret.targetMatched),
          raidersAtStart: (ret && typeof ret === 'object' && (ret.raidersAtStart | 0)) || 0 });
      } catch (e) {
        st.answerError = String((e && e.message) || e).slice(0, 120);
      }
    },
  });
  return wrapped;
}

function withSortieBare(base, id, desc) {
  return withSortie(base, id || 'sortietarget-bare', desc, false);
}

function withSortieAimed(base, id, desc) {
  return withSortie(base, id || 'sortietarget-aimed', desc, true);
}

module.exports = { withSortieBare, withSortieAimed };
