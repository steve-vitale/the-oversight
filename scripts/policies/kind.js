// policies/kind.js — the uniformly-kind policy (measurement 2026-10-11).
//
// The social-life leg's baseline: "uniformly kind policy" produced zero
// rivalries and zero moots in ~175 village-days. This file makes that policy
// a first-class, documented citizen so the finding is reproducible and the
// contrast with larceny-leaning is a controlled experiment.
//
// Same competent survival base, plus:
//  1. NEVER steals (no stealFrom, ever).
//  2. SHARES: donates surplus food beyond a 1-day personal buffer (tighter
//     than competent's 1.5× cap rule — kindness as a measurable dial).
//  3. COMFORTS: seeks out grieving villagers and comforts (best-effort via
//     talkTo + convo choices; try/catch-guarded).
//  4. KEEPS PROMISES: favors accepted are favors worked — no walking away.
//  5. CONTESTS: participates when grabbed (no refusal) but never volunteers
//     for extreme billing — kindness isn't martyrdom.
//
// Deterministic: comfort target is first-grieving-in-roster-order; no
// unseeded randomness.
//
// What it proves: the warm pole of the social experiment. kind vs
// larceny-leaning on identical seeds isolates the village's moral response:
// trust curves, gossip volume, moot firings, favor completion rates.
'use strict';
const { competent } = require('./competent');

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
      break; // one comfort per day — kindness, not a shift
    }
  } catch (e) {}
}

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

const kind = Object.assign({}, competent, {
  id: 'kind',
  desc: 'competent base + uniformly kind: never steals, shares surplus, comforts the grieving, keeps promises, no extreme volunteering',
  daily(Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    shareSurplus(Game, ctx);
    comfortRound(Game, ctx);
    // No stealFrom call exists anywhere in this file — that absence is the
    // policy. Promises kept: favors accepted are worked by competent's
    // upkeep; we never walk away (documented, no code path to skip).
  },
});

module.exports = { kind };
