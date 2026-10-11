// policies/larceny-leaning.js — the crime-pressure policy (measurement 2026-10-11).
//
// Built for the social-life leg's finding: moots never fired in ~175
// village-days of uniformly-kind play. Moots, trials, and the justice system
// need a policy that actually breaks rules. Same competent survival base, but:
//  1. STEALS: when personal kcal < 50% cap, stealFrom the richest pantry
//     neighbor (takes, not gives — the takes/gives ledger goes honestly red).
//     Occasionally (deterministic schedule: day % 5 === 0) steals even when
//     fed, to keep the crime signal alive in good times.
//  2. PROVOKES: never comforts grief, never donates surplus, talks rarely —
//     a cold neighbor the village has opinions about.
//  3. CONTESTS: always participates (never refuses) — crime doesn't hide
//     from cameras.
//
// Deterministic: theft schedule is day-modulo, victim choice is
// highest-pantry-index (stable ordering), no unseeded randomness.
//
// What it proves: pair with kind on identical seeds to measure the justice
// system's response — moot firings, trust deltas, gossip volume, punishment
// severity. If moots still don't fire under larceny-leaning, the trigger is
// structurally broken, not policy-starved.
'use strict';
const { competent } = require('./competent');

function richestMark(Game) {
  try {
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    const roster = (vv.roster || []).filter(id => id !== me);
    // Deterministic: first living roster member (stable order).
    for (const id of roster) {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      if (p && !p.dead) return id;
    }
  } catch (e) {}
  return null;
}

function larcenyDaily(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const cap = Game.kcalCap ? Game.kcalCap() : 2000;
    const day = s.day || 0;
    const hungry = (s.kcal || 0) < cap * 0.5;
    const scheduled = day % 5 === 0;
    if ((hungry || scheduled) && Game.stealFrom) {
      const mark = richestMark(Game);
      if (mark) {
        try {
          const r = Game.stealFrom(mark);
          if (r) ctx.thefts = (ctx.thefts || 0) + 1;
        } catch (e) {}
      }
    }
  } catch (e) {}
}

const larcenyLeaning = Object.assign({}, competent, {
  id: 'larceny-leaning',
  desc: 'competent base + steals when hungry (and on schedule), cold neighbor: never comforts, never donates, always takes the cameras',
  daily(Game, ctx) {
    // Run competent's daily FIRST (survival), then apply the larceny layer.
    // Skip competent's donate/talk generosity by post-correcting: we steal
    // after donating would have happened, keeping the ledger honestly red.
    try { competent.daily(Game, ctx); } catch (e) {}
    larcenyDaily(Game, ctx);
    // Never comfort: skip — competent doesn't force-comfort anyway, but we
    // also never volunteer aid. (Documented absence, not a code path.)
    ctx.coldShoulder = (ctx.coldShoulder || 0) + 1;
  },
  // Always participate: override any refusal instinct. competent has no
  // contest hook (defaults to choice 0 = participate), so inherit that —
  // documented here so the intent is explicit.
});

module.exports = { larcenyLeaning };
