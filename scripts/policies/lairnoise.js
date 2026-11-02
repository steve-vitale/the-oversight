// policies/lairnoise.js — PURE-NOISE control (sim-laircontact-a,
// axis scale-onramp). POLICY ONLY: zero src/js changes. Wraps the
// closecommit stack (titanroute + musterclose + mustergap commit-own)
// and adds ONE leg: while a sounded muster stands, consume exactly 8
// Math.random() draws per daily, after the march, and change NO game
// state whatsoever.
//
// WHY: the musterfed leg's pantry verb can consume RNG through the
// theft-confrontation path (one roll per witness in the confronter
// loop + the 0.35 let-it-slide roll + the line-pick roll, only when
// a bar fires and witnesses are present). If a pure RNG-stream shift
// of that order suffices to kill contact, the fed 0-attempt pattern
// is trajectory noise, not a feeding mechanism. 8 draws is calibrated
// as an upper-ish bound on one confrontation's consumption
// (witnesses(6) at Haven is plausibly <= ~10); it is an approximation,
// NOT an exact replay of the verb's rolls, and the verdict treats it
// as such: a noise-arm "preserves attempts" result rules out only
// RNG shifts of this order, not every possible stream shift.
//
// PERCEPTION LAW (load-bearing): the policy reads nothing but the
// call record (ctx.titan.called), its own muster record, and its own
// slain flag — no monster roster, no allied roster, no link list, no
// pantry, no pack. The draws themselves are the experiment.
'use strict';

const DRAWS_PER_DAY = 8;

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function slain(Game) {
  try { return !!((((Game.state || {}).titans || {}).slain || {}).herald); } catch (e) { return false; }
}

function musterOf(Game) {
  try {
    if (typeof Game.titanMusterState === 'function') return Game.titanMusterState('herald');
    return null;
  } catch (e) { return null; }
}

function withLairNoise(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'lairnoise',
    desc: desc || 'lairnoise: 8 RNG draws per day while a muster stands, no state change',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.lairnoiseBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const nz = ctx.lairnoise || (ctx.lairnoise = { draws: [] });
      try {
        const called = ctx.titan && ctx.titan.called;
        if (!called || typeof called !== 'object') return;
        if (Game.over || Game.tbfight) return;
        if (slain(Game)) return;
        const muster = musterOf(Game);
        if (!muster || !muster.allies || muster.allies.length === 0) return;
        for (let i = 0; i < DRAWS_PER_DAY; i++) Math.random();
        nz.draws.push({ day: gday(Game), draws: DRAWS_PER_DAY });
      } catch (e) {
        nz.drawError = String((e && e.message) || e).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withLairNoise, DRAWS_PER_DAY };
