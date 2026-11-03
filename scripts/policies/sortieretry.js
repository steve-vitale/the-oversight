// policies/sortieretry.js — queue + Q1-invalidation answer layer, arm
// sim-sortieretry-a (Loop A 20261103, axis scale-onramp). POLICY ONLY.
//
// ANSWER RULE (both queue arms, identical except the 'none' handler):
// each daily, observe the engine's last announced offer
// (state.lastLingererOffer — what was spoken aloud in a gorge line, one
// entity, the last announced) and enqueue it if its (key,day) is unseen.
// Then answer the queue head once per day with its key (match-first
// aiming, as landed by sortietarget). On ok: dequeue the head. On
// 'no-fighters': KEEP the head (retry it next day — the bench, not the
// offer, is bare; sortiev2 Q1 says no-fighters does NOT invalidate).
// On 'none': invalidate=false dequeues ONLY the head; invalidate=true
// drops ALL queued offers recorded BEFORE that return (Q1 global rule).
//
// PERCEPTION LAW (load-bearing): this policy reads ONLY the announced
// offer record plus its own queue/answered set. It NEVER reads a monster
// roster or position channel. The proof test asserts the absence of
// those call tokens in this file, comments included.
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

function withQueue(base, id, desc, invalidate) {
  const wrapped = Object.assign({}, base, {
    id: id || (invalidate ? 'sortieretry-retry' : 'sortieretry-queue'),
    desc: desc || (invalidate
      ? 'sortieretry: queue + Q1 invalidation + aiming'
      : 'sortieretry: queue + aiming, no invalidation'),
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.sortieretryBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const st = ctx.sortieretry || (ctx.sortieretry = { queue: [], seen: {}, calls: [], invalidations: 0 });
      try {
        if (Game.over || Game.tbfight) return;
        if (typeof Game.answerLingerer !== 'function') { st.answerError = 'answerLingerer missing'; return; }
        const offer = lastOffer(Game);
        if (offer) {
          const stamp = offer.key + '@' + offer.day;
          if (!st.seen[stamp]) {
            st.seen[stamp] = true;
            st.queue.push({ key: offer.key, day: offer.day, name: offer.name || null, enqueuedDay: gday(Game) });
          }
        }
        if (!st.queue.length) return;
        if (st.answeredToday === gday(Game)) return;
        const head = st.queue[0];
        st.answeredToday = gday(Game);
        const ret = Game.answerLingerer('sortie', head.key);
        const why = (ret && typeof ret === 'object' && ret.why) || (typeof ret === 'string' ? ret : null);
        const ok = !!(ret && typeof ret === 'object' && ret.ok);
        st.calls.push({ day: gday(Game), headKey: head.key, headDay: head.day,
          queueBefore: st.queue.length, ok, why,
          cleared: (ret && typeof ret === 'object' && (ret.cleared | 0)) || 0,
          fought: (ret && typeof ret === 'object' && Array.isArray(ret.fought)) ? ret.fought : [],
          targetMatched: !!(ret && typeof ret === 'object' && ret.targetMatched),
          raidersAtStart: (ret && typeof ret === 'object' && (ret.raidersAtStart | 0)) || 0 });
        if (ok) {
          st.queue.shift();
        } else if (why === 'none') {
          if (invalidate) {
            // Q1 global rule: every offer recorded BEFORE this return is
            // dead. All queued offers predate the return (enqueueing
            // happens before answering within a daily), so clear all.
            st.queue.length = 0;
            st.invalidations += 1;
          } else {
            st.queue.shift();
          }
        }
        // 'no-fighters' and anything else: keep the head for retry.
      } catch (e) {
        st.answerError = String((e && e.message) || e).slice(0, 120);
      }
    },
  });
  return wrapped;
}

function withQueueNoInvalidation(base, id, desc) {
  return withQueue(base, id || 'sortieretry-queue', desc, false);
}

function withQueueRetry(base, id, desc) {
  return withQueue(base, id || 'sortieretry-retry', desc, true);
}

module.exports = { withQueue, withQueueNoInvalidation, withQueueRetry };
