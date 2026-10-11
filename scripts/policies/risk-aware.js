// policies/risk-aware.js — the fear-measuring policy (measurement 2026-10-11).
//
// Same survival base as competent (eats safe, fights with advantage), but
// treats high-stakes contests the way a real player does: it READS the billing
// and hedges. This is the policy the contest-fear lever was missing — the old
// sim auto-participated (always choice 0), so "thinking twice" was
// unmeasurable. Pair with competent on identical seeds: the delta in
// participation rate, injury share, and win rate IS the fear signal.
//
// Behavior (deterministic — no unseeded randomness beyond the shared PRNG):
//  1. CHOICE PHASE (participate/refuse offered): refuse high/extreme-risk
//     contests when hurt (hp < 70% max). Refusing is itself a played sequence
//     (shame/notability consequences), so this measures the real tradeoff.
//  2. IN-PHASE HEDGING: instead of choice 0, score every choice by expected
//     harm from its declared `do` block — dmg range midpoint (×1.5, matching
//     the contest-fear billing honesty), die chance ×1000, trauma ×25 — and
//     take the minimum. Ties break to the lowest index (deterministic).
//  3. FIGHTS: competent's advantage rules, plus an earlier eject — below 45%
//     HP (vs competent's 35%) it walks to the edge (flee-by-barrier).
//  4. BANKS SAFETY: keeps kcal topped above 90% before any optional risk and
//     never volunteers for extreme billing below 80% HP.
//
// What it proves: if fear mechanics work, risk-aware should show FEWER
// participations, FEWER contest deaths/injuries, and a LOWER-OR-EQUAL win rate
// than competent on the same seeds — the player pays for safety with prizes.
'use strict';
const { competent } = require('./competent');

const RISKY = { high: true, extreme: true };

// Expected-harm score for one contest choice, from its declared `do` block.
// Units are roughly "expected HP lost"; die chance is weighted catastrophically
// because death ends the measurement. Deterministic.
function harmScore(choice) {
  const d = (choice && choice.do) || {};
  let s = 0;
  if (Array.isArray(d.dmg) && d.dmg.length >= 2) s += (d.dmg[0] + d.dmg[1]) / 2 * 1.5;
  if (typeof d.die === 'number' && d.die > 0) s += d.die * 1000;
  if (typeof d.trauma === 'number' && d.trauma > 0) s += d.trauma * 25;
  if (typeof d.kcal === 'number' && d.kcal < 0) s += (-d.kcal) / 500;
  return s;
}

function baseRisk(Game, contestId) {
  try {
    const pool = Game.contestPool ? Game.contestPool() : [];
    const c = pool.find(x => x && x.id === contestId);
    return (c && c.risk) || 'medium';
  } catch (e) { return 'medium'; }
}

function hpPct(Game) {
  try {
    const s = Game.state.scholar || {};
    return (s.health || 0) / Math.max(1, s.maxHealth || s.health || 1);
  } catch (e) { return 1; }
}

// The policy's contest hook: called by driveContests when activeContest is up.
// Return true when we handled this step (driveContests loops again).
function riskContest(Game, ctx) {
  try {
    const ac = Game.state && Game.state.activeContest;
    if (!ac || ac.phase === 'done') return false;
    if (ac.participant && ac.participant !== 'player') return false; // watching: not our call
    const phases = ac.phases || [];
    const phase = phases[ac.phaseIdx || 0];
    if (!phase || !phase.choices || !phase.choices.length) return false;
    const choices = phase.choices;

    // 1. CHOICE PHASE: participate vs refuse.
    const refuseIdx = choices.findIndex(ch => ch && ch.next === 'REFUSE');
    if (refuseIdx >= 0) {
      const risk = baseRisk(Game, ac.contestId);
      const hp = hpPct(Game);
      ctx.contestChoices = (ctx.contestChoices || 0) + 1;
      if (RISKY[risk] && hp < 0.7) {
        ctx.contestRefusals = (ctx.contestRefusals || 0) + 1;
        try { Game.contestChoose(refuseIdx); } catch (e) {}
        return true;
      }
      // Participate: take choice 0 (the Participate button).
      try { Game.contestChoose(0); } catch (e) {}
      return true;
    }

    // 2. IN-PHASE: min-harm choice instead of blind choice 0.
    let best = 0, bestScore = Infinity;
    for (let i = 0; i < choices.length; i++) {
      const sc = harmScore(choices[i]);
      if (sc < bestScore - 1e-9) { bestScore = sc; best = i; }
    }
    if (best !== 0) ctx.contestHedges = (ctx.contestHedges || 0) + 1;
    try { Game.contestChoose(best); } catch (e) {}
    return true;
  } catch (e) { return false; }
}

// Earlier eject than competent's 35%: at 45% walk to the edge.
function riskFight(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    const hp = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    if (hp < 0.45) {
      try {
        const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
        const tx = px <= 4 ? 0 : 8;
        try { Game.tbPlayerMove(tx, py); } catch (e) {}
        const q = Game.tbFighter('p');
        q.moveLeft = 0; q.acted = true;
        Game.tbAfterPlayerAction();
        ctx.fled = (ctx.fled || 0) + 1;
        return true;
      } catch (e) { return false; }
    }
    return false; // fall through to competent's fight logic
  } catch (e) { return false; }
}

const riskAware = Object.assign({}, competent, {
  id: 'risk-aware',
  desc: 'competent base + reads contest billing: refuses high/extreme when hurt, hedges phases by declared harm, ejects from fights at 45%',
  contest: riskContest,
  fight(Game, ctx) {
    if (riskFight(Game, ctx)) return true;
    try { return competent.fight(Game, ctx); } catch (e) { return false; }
  },
});

module.exports = { riskAware, harmScore };
