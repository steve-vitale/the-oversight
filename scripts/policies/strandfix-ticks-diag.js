// strandfix-ticks-diag — creek-wake hold-day tick-preservation
// instrument (sim-strandfix-ticks-b, 2026-10-30, flesh-out loop B,
// axis food-economy). DIAG ONLY: a design measurement, NOT a
// proposed villager behavior and NOT a default flip.
// POLICY-SIDE INSTRUMENT ONLY: zero src/js changes, zero edits
// to competent.js, nighttravel.js, woodcarry.js, woodwarm.js, or
// any other existing policy file. Env-gated: STRANDFIX=1 arms
// it; unset/0 delegates to inner.daily untouched (the control
// legs run the same stack with STRANDFIX=0 / without the wrapper).
//
// BEHAVIOR: at daily entry, if the villager WOKE ON A CREEK TILE,
// is NOT inside haven, is NOT in a tent, is NOT dead or in
// combat, and the day is already 3/4 spent (morningDayTicks >=
// 384, i.e. ticksLeft <= 128 after the harness's 3 part waits),
// then SKIP the routine: do NOT call inner.daily's competent
// day, and run ONLY the night step (nighttravel's exported
// nightStep, with nighttravel.daily's ctx bookkeeping
// replicated), so the evening travel attempt and the outer
// woodcarry bridge decision still happen that evening. The
// routine tick spend on a hold day is therefore 0 by
// construction (probe-verified by the driver, not asserted).
//
// WHY THIS GATE: tickbudget's census (sim-tickbudget-b) showed
// routine-attributed ticks-short evenings replicated across
// legs, with the day-7 hole (49 ticks short, no morning
// behavior fired) unmovable by any morning-behavior budget.
// The hold prices the upper bound of routine-trimming on creek
// days: "if the villager spent the strand day idle at the
// creek, would the bridge build?" A real design built on a GO
// here would trim selectively, not idle the whole day; this
// instrument prices the bound, it does not prescribe the trim.
//
// WHY IT CANNOT MOVE DAY 7 (pre-registered): day 7's morning
// wakes AT HAVEN (inside, tile haven), not at a creek, so the
// creek-wake gate does not fire on it; day 7 is the first
// strand evening and has no still evening behind it. Day 7 is
// reported separately and honestly, moved or not.
//
// PERCEPTION LAW (Steve 2026-10-28): the gate reads ONLY what
// the villager itself knows at morning — where it woke (its
// own tile via Game.playerTile, never a roster or snapshot),
// whether it is inside / in a tent, and the day-clock it can
// see (scholar.dayTicks, the UI tick bar). It reads no future
// evening and no previous-evening record (woodcarry resets
// ctx._wcLast before this wrapper runs, so the gate is
// deliberately previous-record-free). It draws NO RNG.
//
// The wrapper NEVER calls microMove, cutTree, clearBrush,
// forage, eat, or travelTo itself; on a hold morning it calls
// only nighttravel's exported nightStep (the engine travel +
// evening step the routine would have run anyway). Recording
// errors are counted in store.errs and never thrown into the
// engine. At most one hold/skip record per loop-day.
'use strict';

const { nightStep } = require('./nighttravel');

function leverOn() {
  try { return process.env.STRANDFIX === '1'; } catch (e) { return false; }
}

function newStore() {
  return { holds: [], skips: [], errs: 0, errors: [] };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function gameOver(Game) {
  try { return !!Game.over; } catch (e) { return false; }
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

// Pure gate (unit-tested by scripts/test-strandfix-ticks-b.js).
// Input o: { gameOver, combatLive, insideTent, wakeTileType,
//   insideHaven, morningDayTicks }. Returns { fire: true } or
// { fire: false, skip: reason }. The 384 boundary is the
// waits-alignment line: on ticks-short evenings the morning
// dayTicks is 384 (3 part waits already spent); 256 mornings
// leave 256 ticks, room enough that no hold is needed.
function holdDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (o.insideTent === true) return { fire: false, skip: 'in-tent' };
  if (o.wakeTileType !== 'creek') return { fire: false, skip: 'not-creek-wake' };
  if (o.insideHaven === true) return { fire: false, skip: 'haven-morning' };
  if (o.morningDayTicks === null || o.morningDayTicks === undefined || o.morningDayTicks < 384) return { fire: false, skip: 'day-not-short' };
  return { fire: true };
}

function withStrandfix(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'strandfix',
    desc: 'nighttravel + creek-wake hold day on short days (STRANDFIX=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      if (!leverOn()) return inner.daily ? inner.daily(Game, ctx) : undefined;
      try {
        const sch = (Game.state || {}).scholar || {};
        let wakeTileType = null;
        try { const t = Game.playerTile(); wakeTileType = t ? (t.type || null) : null; } catch (e) {}
        const insideHaven = (sch.insideHaven === undefined ? null : !!sch.insideHaven);
        const insideTent = (sch.insideTent === undefined ? null : !!sch.insideTent);
        const morningDayTicks = (sch.dayTicks === undefined ? null : sch.dayTicks);
        let ticksLeft = null;
        try { const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512; ticksLeft = (morningDayTicks === null ? null : tpd - morningDayTicks); } catch (e) {}
        const dec = holdDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          insideTent, wakeTileType, insideHaven, morningDayTicks,
        });
        if (!dec.fire) {
          st.skips.push({ loopDay, skip: dec.skip, wakeTileType, insideHaven, insideTent, morningDayTicks, ticksLeft });
          return inner.daily ? inner.daily(Game, ctx) : undefined;
        }
        // HOLD: skip the competent routine; run ONLY the night
        // step, with nighttravel.daily's ctx bookkeeping.
        st.holds.push({ loopDay, wakeTileType, insideHaven, insideTent, morningDayTicks, ticksLeft });
        const rec = nightStep(Game, ctx);
        try {
          ctx._ntLast = rec;
          ctx.ntEvenings = ctx.ntEvenings || {};
          ctx.ntEvenings[rec.outcome] = (ctx.ntEvenings[rec.outcome] || 0) + 1;
          if (rec.outcome === 'completed' || rec.outcome === 'already-inside') {
            ctx.ntInsideEvenings = (ctx.ntInsideEvenings || 0) + 1;
          }
          if (rec.before && rec.before.tile !== 'haven' && (rec.outcome === 'completed' || rec.outcome === 'already-inside')) {
            ctx.ntConvertedAway = (ctx.ntConvertedAway || 0) + 1;
          }
        } catch (e) { noteErr(st, 'hold.ctx', e); }
        return undefined;
      } catch (e) {
        noteErr(st, 'daily', e);
        st.skips.push({ loopDay, skip: 'error', error: String((e && (e.message || e)) || e).slice(0, 300) });
        return inner.daily ? inner.daily(Game, ctx) : undefined;
      }
    },
  });
}

module.exports = { withStrandfix, newStore, holdDecision, leverOn };
