// selecttrim-diag — selective routine trim that keeps the walk
// (sim-selecttrim-a, 2026-10-31, flesh-out loop, axis
// food-economy, backlog #1588). DIAG/MECHANISM ONLY: a
// policy-side prototype, NOT a proposed villager behavior and
// NOT a default flip. Env-gated: SELECTTRIM=1 arms it;
// unset/0 delegates to inner.daily untouched.
//
// THE MECHANISM QUESTION (from sim-strandfix-ticks-b): the
// whole-day hold froze the villager at the foodless west corner
// (0,0), so the next morning's press never fired. The spy run
// (scripts/selecttrim-spy-b.js, control stack, seed 15215)
// identified what the "within-tile walk" actually is — it is
// NOT a microMove walk at all:
//
//   * competent.daily never calls microMove and never writes
//     mx/my. The west->east move is forageTripSeedFirst's
//     OUT-AND-BACK node trip: out to neighbouring tiles,
//     forage (16 ticks when a patch pays, 0 when all picks
//     fail), then walkHome back to the creek tile. The return
//     landing is the east edge cell (8,0) because the return
//     approaches from the east (3,5) on day 9, and (8,0) again
//     on day 10 because the return approaches from the north
//     (2,4) preserving x=8. The next morning's 3x3 press sweep
//     around (8,0) then holds known muscadine, so the press
//     fires. Skip forageTrip and the landing — and the press —
//     are lost. That is why the hold arm scored 0 presses.
//
//   * The strand-day routine is ALREADY nearly minimal:
//     guard day 9: 19 ticks = forage 16 + talkRound 1
//     (talkTo) + askAbout beasttricks 2; day 10: 18 = forage
//     16 + talkRound 1 + competentEat 1; day 11: 17 = forage
//     16 + talkRound 1. Every other daily beat spends 0 ticks
//     on strand days (haven chores, crafting, traps, teaching
//     all no-op away from haven). So a walk-preserving trim
//     can save at most the 1-3 social ticks — it CANNOT clear
//     day 10's 3-tick hole while keeping the forage (384 waits
//     + 17 press + 16 forage = 417, still 1 short of 416 even
//     with talk AND eat skipped). That bound is reported, not
//     hidden: the verdict's ticks bar is "saved and reported",
//     not "hole cleared".
//
// WRAPPER FORM (no competent.js edit): competent.js EXPORTS
// its beats (forageTripSeedFirst, sortHaul, competentEat,
// recovering, needTrip — see its module.exports), so a wrapper
// can assemble a trimmed day from the routine's own beats
// without touching daily()'s core flow. This file is that
// wrapper: it sits in the strandfix slot (wrapping
// nighttravel, inside woodcarry/woodwarm), and on trim days
// runs ONLY forageTripSeedFirst + sortHaul + competentEat,
// then nighttravel's nightStep with nighttravel.daily's ctx
// bookkeeping replicated (as strandfix did). On every other
// day it delegates to inner.daily untouched.
//
// TRIM GATE (strict-subset days only — the trim does LESS
// than daily, never more):
//   * creek wake, not inside haven, not in a tent, not dead,
//     not in combat, morningDayTicks >= 384 (the waits-
//     alignment line: 256 mornings have room and need no trim),
//   * NOT recovering() (daily gates outward trips on !rec;
//     a recovering villager must not be sent out by the trim),
//   * needTrip() true (daily gates the trip on needTrip; the
//     trim never ADDS a trip daily would not take),
//   * thirstHome would NOT fire (hydration >= 45, or water
//     carried, or at haven — daily's drink-then-walk-home
//     branch is unexported drinkSafe, so the trim declines
//     those days instead of half-reproducing it).
// Day 7 wakes at haven, so the gate never fires on it — the
// 49-tick day-7 hole stands, exactly as preregistered.
//
// SKIPPED ON TRIM DAYS (the trim): talkRound, askAbout
// beasttricks, and all 0-tick beats (soothe, devotion, keep
// promises, stone run, counter-play, vinebank, trapline,
// teaching, deep talk, loot, aid beats, ability choice,
// evening promises, go-home-standing). Skipping talk CAN
// change later knowledge/sentiment (a talk can teach); the
// trim legs measure presses empirically rather than assuming
// they survive. Skipping keepPromises can break a promise;
// that is a cost of the prototype, reported if observed, and
// one reason this stays DIAG-only.
//
// PERCEPTION LAW (Steve 2026-10-28): the gate reads ONLY
// what the villager itself knows at morning — where it woke,
// the day-clock, its own hydration/water, its own recovery
// and trip-need state. It draws NO RNG itself (beats draw
// their own, as daily would). It never steers, places, or
// pre-walks the villager: the landing comes from the
// routine's own forageTrip + walkHome, never from a wrapper
// walk to a known patch.
'use strict';

const { nightStep } = require('./nighttravel');
const { forageTripSeedFirst, sortHaul, competentEat, recovering, needTrip } = require('./competent');

function leverOn() {
  try { return process.env.SELECTTRIM === '1'; } catch (e) { return false; }
}

function newStore() {
  return { trims: [], skips: [], errs: 0, errors: [] };
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

function thirstHomeWouldFire(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    if ((s.hydration || 0) >= 45) return false;
    if ((s.water || []).length) return false;
    try { if (Game.playerAtHaven && Game.playerAtHaven()) return false; } catch (e) {}
    return true;
  } catch (e) { return false; }
}

// Pure gate (unit-tested by scripts/test-selecttrim-a.js).
// Input o: { gameOver, combatLive, insideTent, wakeTileType,
//   insideHaven, morningDayTicks, isRecovering, needsTrip,
//   thirstHome }. Returns { fire: true } or
// { fire: false, skip: reason }.
function trimDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (o.insideTent === true) return { fire: false, skip: 'in-tent' };
  if (o.wakeTileType !== 'creek') return { fire: false, skip: 'not-creek-wake' };
  if (o.insideHaven === true) return { fire: false, skip: 'haven-morning' };
  if (o.morningDayTicks === null || o.morningDayTicks === undefined || o.morningDayTicks < 384) return { fire: false, skip: 'day-not-short' };
  if (o.isRecovering === true) return { fire: false, skip: 'recovering' };
  if (o.needsTrip !== true) return { fire: false, skip: 'no-trip-needed' };
  if (o.thirstHome === true) return { fire: false, skip: 'thirst-home' };
  return { fire: true };
}

function withSelecttrim(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'selecttrim',
    desc: 'nighttravel + selective trim on creek-wake short days (SELECTTRIM=1)',
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
        let isRecovering = null, needsTrip = null;
        try { isRecovering = recovering(Game, ctx); } catch (e) { noteErr(st, 'recovering', e); }
        try { needsTrip = needTrip(Game, ctx); } catch (e) { noteErr(st, 'needTrip', e); }
        const dec = trimDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          insideTent, wakeTileType, insideHaven, morningDayTicks,
          isRecovering, needsTrip, thirstHome: thirstHomeWouldFire(Game),
        });
        if (!dec.fire) {
          st.skips.push({ loopDay, skip: dec.skip, wakeTileType, insideHaven, insideTent, morningDayTicks, ticksLeft, isRecovering, needsTrip });
          return inner.daily ? inner.daily(Game, ctx) : undefined;
        }
        // TRIM: the walk beat + haul sort + haul eat, nothing else.
        st.trims.push({ loopDay, wakeTileType, insideHaven, insideTent, morningDayTicks, ticksLeft, isRecovering, needsTrip });
        try { forageTripSeedFirst(Game, ctx); } catch (e) { noteErr(st, 'trim.forageTrip', e); }
        try { sortHaul(Game, ctx); } catch (e) { noteErr(st, 'trim.sortHaul', e); }
        try { competentEat(Game); } catch (e) { noteErr(st, 'trim.competentEat', e); }
        if (Game.over) { ctx._ntLast = { outcome: 'game-over', method: null }; return undefined; }
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
        } catch (e) { noteErr(st, 'trim.ctx', e); }
        return undefined;
      } catch (e) {
        noteErr(st, 'daily', e);
        st.skips.push({ loopDay, skip: 'error', error: String((e && (e.message || e)) || e).slice(0, 300) });
        return inner.daily ? inner.daily(Game, ctx) : undefined;
      }
    },
  });
}

module.exports = { withSelecttrim, newStore, trimDecision, leverOn, thirstHomeWouldFire };
