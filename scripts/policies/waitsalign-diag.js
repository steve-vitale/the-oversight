// waitsalign-diag — ask-skip probe wrapper (sim-waitsalign-a,
// 2026-10-31, flesh-out loop, axis food-economy, backlog
// #1599). DIAG/MECHANISM ONLY: a policy-side prototype, NOT a
// proposed villager behavior and NOT a default flip.
// Env-gated: WAITSALIGN_ASKSKIP=1 arms it; unset/0 delegates
// to inner.daily untouched.
//
// PURPOSE: vary d9 saved ticks on the honest trajectory by
// exactly one rung of the ladder. The selecttrim wrapper
// skips talkRound (1 tick) AND askAbout beasttricks (2
// ticks) = save 3. This wrapper skips ONLY askAbout, keeping
// the talk: forageTripSeedFirst + sortHaul + competentEat +
// talkRound = save 2 vs full daily on days where askAbout
// fires (control d9 routine 19 -> 17). If askAbout does not
// fire on a day, this wrapper saves 0 there — the probe
// judges MEASURED evening dayTicks against the 448/449
// sleep threshold, not the assumed ladder rung, and the
// evidence file discloses any rung deviation.
//
// GATE: identical to selecttrim-diag's trimDecision gate
// (imported, not copied — the two wrappers fire on the same
// days by construction): creek wake, not inside haven, not
// in a tent, not dead, not in combat, morningDayTicks >=
// 384, NOT recovering(), needTrip() true, thirstHome would
// NOT fire. Same perception-law basis: the gate reads only
// what the villager itself knows at morning. It draws NO
// RNG itself (beats draw their own, as daily would). It
// never steers, places, or pre-walks the villager.
'use strict';

const { nightStep } = require('./nighttravel');
const { forageTripSeedFirst, sortHaul, competentEat, talkRound, recovering, needTrip } = require('./competent');
const { trimDecision, thirstHomeWouldFire } = require('./selecttrim-diag');

function leverOn() {
  try { return process.env.WAITSALIGN_ASKSKIP === '1'; } catch (e) { return false; }
}

function newStore() {
  return { asks: [], skips: [], errs: 0, errors: [] };
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

function withWaitsalign(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'waitsalign',
    desc: 'nighttravel + ask-skip on creek-wake short days (WAITSALIGN_ASKSKIP=1)',
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
        // ASK-SKIP: the walk beat + haul sort + haul eat + the talk, nothing else.
        st.asks.push({ loopDay, wakeTileType, insideHaven, insideTent, morningDayTicks, ticksLeft, isRecovering, needsTrip });
        try { forageTripSeedFirst(Game, ctx); } catch (e) { noteErr(st, 'ask.forageTrip', e); }
        try { sortHaul(Game, ctx); } catch (e) { noteErr(st, 'ask.sortHaul', e); }
        try { competentEat(Game); } catch (e) { noteErr(st, 'ask.competentEat', e); }
        try { talkRound(Game, ctx); } catch (e) { noteErr(st, 'ask.talkRound', e); }
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
        } catch (e) { noteErr(st, 'ask.ctx', e); }
        return undefined;
      } catch (e) {
        noteErr(st, 'daily', e);
        st.skips.push({ loopDay, skip: 'error', error: String((e && (e.message || e)) || e).slice(0, 300) });
        return inner.daily ? inner.daily(Game, ctx) : undefined;
      }
    },
  });
}

module.exports = { withWaitsalign, newStore, leverOn };
