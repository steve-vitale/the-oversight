// policies/selfeed.js — the exile-foreclosure clean test (longsim scale-wall r7, 2026-10-13).
//
// belongseek (scale-push, BELONG-road courtship) + ZERO pantry takes.
// The r6 diagnosis: the scale wall's face is moot-exile foreclosure, earned via
// the takes/gives ledger — communal-pantry takes (~1,000 kcal/day, gives=0)
// trip theftConfrontation's cumulative-4000 bar → 'hoard' observations →
// grievances → moot theft case → conviction (avgBelief < -40) → exile, and the
// exiled persona can never court (proposeLink's exile guard, _checkNational's
// exiled-answerer refusal). The cleanest test: remove the takes ENTIRELY and
// see whether the courtship window un-forecloses.
//
// Ledger contract (verified by scripts/test-exile-selfeed.js, never assumed):
//   v.takes[scholarId] reads 0 at end of run.
// Mechanics:
//   1. takeFromPantry / takeFromPantryBulk are disabled in setup (the base
//      policy's honest-eating pantry fallback is a no-op; the scholar eats
//      from the PACK only). Attempts are counted in ctx.refusedPantryTakes.
//   2. The communal dawn meal (Game.villageMeal) is declined at the haven
//      fire — in-fiction "I eat my own" (the engine already models this for
//      wild camp / estranged / joined-village branches; the home-fire branch
//      is the only one refused). The refused share is computed with the
//      engine's own trust-scaled math and recorded in ctx.refusedMealK so the
//      test measures what the fiction cost. Every other villageMeal branch
//      (wild camp, joined village, estranged) calls through untouched.
//   3. After base daily: Game.eat() tops the kcal bank off from the PACK.
//   4. No stealFrom call exists anywhere in this file — that absence is the
//      policy (same doctrine as kind.js).
//
// NOTE: this is a diagnostic instrument, not a player fantasy. It answers
// "does the takes-ledger cause the exile-foreclosure?" — nothing more.
'use strict';
const { belongseek } = require('./belongseek');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

const selfeed = Object.assign({}, belongseek, {
  id: 'selfeed',
  desc: 'belongseek scale-push + zero pantry takes: no pantry draws, communal meal declined, pack-only eating, never steals',

  setup(Game, ctx) {
    ctx.refusedPantryTakes = 0;
    ctx.refusedMealK = 0;
    ctx.refusedMealDays = 0;
    // 1. Disable pantry draws (pack-only eating).
    const origTake = Game.takeFromPantry ? Game.takeFromPantry.bind(Game) : null;
    const origBulk = Game.takeFromPantryBulk ? Game.takeFromPantryBulk.bind(Game) : null;
    if (origTake) {
      Game.takeFromPantry = function () {
        ctx.refusedPantryTakes = (ctx.refusedPantryTakes || 0) + 1;
        return null;
      };
    }
    if (origBulk) {
      Game.takeFromPantryBulk = function () {
        ctx.refusedPantryTakes = (ctx.refusedPantryTakes || 0) + 1;
        return null;
      };
    }
    // 2. Decline the communal dawn meal at the haven fire only.
    const origMeal = Game.villageMeal ? Game.villageMeal.bind(Game) : null;
    if (origMeal) {
      Game.villageMeal = function () {
        const s = this.state.scholar || {};
        const v = this.state.village || {};
        // Only the home-fire branch is refused: if the scholar joined another
        // village, is estranged, or camps wild, the engine's own branches
        // (their pantry / no meal / edge of the fire) handle it — call through.
        let homeFire = false, whyNot = '';
        try {
          const inReach = (typeof this.pantryInReach === 'function') ? !!this.pantryInReach() : false;
          const jv = s.joinedVillage
            ? (this.state.otherVillages || []).find(x => x.id === s.joinedVillage)
            : null;
          let atJv = false;
          if (jv && this.map && typeof this.map.px === 'number') {
            atJv = (Math.abs((jv.x || 0) - this.map.px) + Math.abs((jv.y || 0) - this.map.py) <= 1);
          }
          homeFire = inReach && !s.joinedVillage && !atJv;
          if (!homeFire) whyNot = `inReach=${inReach} joined=${!!s.joinedVillage} atJv=${atJv}`;
        } catch (e) { homeFire = false; whyNot = 'EXC:' + (e && e.message); }
        if (!homeFire) {
          if (typeof process !== 'undefined' && process.env.SELFEED_DEBUG) {
            try { process.stderr.write(`[selfeed] meal call-through day=${(s.day || 0)} ${whyNot}\n`); } catch (e) {}
          }
          return origMeal();
        }
        // The refused share: the engine's own trust-scaled math (game.js villageMeal).
        let want = 0;
        try {
          const trust = v.trust && v.trust[s.villagerId] !== undefined ? v.trust[s.villagerId] : 10;
          const share = trust < 30 ? 1000 : trust < 60 ? 2000 : 2200;
          const cap = (typeof this.kcalCap === 'function') ? this.kcalCap() : 2400;
          const room = Math.max(0, cap - (s.kcal || 0));
          want = Math.min(share, room);
        } catch (e) {}
        ctx.refusedMealK = (ctx.refusedMealK || 0) + Math.round(want);
        ctx.refusedMealDays = (ctx.refusedMealDays || 0) + 1;
        v.lastPlayerMeal = 0;
        if (want > 0) {
          try { this.say(`You wave off the communal bowl — your pack feeds you today. (selfeed: declined ~${Math.round(want)} kcal)`); } catch (e) {}
        }
        return null;
      };
    }
  },

  daily(Game, ctx) {
    try { belongseek.daily(Game, ctx); } catch (e) {}
    // 3. Top off the kcal bank from the PACK before sleep/endDay.
    // Game.eat() eats inventory food to cap — no pantry touch, no takes.
    try {
      const cap = Game.kcalCap ? Game.kcalCap() : 2400;
      if ((Game.state.scholar || {}).kcal < cap * 0.995) Game.eat();
    } catch (e) {}
  },
});

module.exports = { selfeed };
