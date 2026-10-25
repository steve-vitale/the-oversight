#!/usr/bin/env node
'use strict';
// fightopen-census-20261025.js — fight-census instrument (measurement audit
// 2026-10-25). Closes sim-findings #40: fights that "come apart" in
// startCombat's opening pass leave no dmg-audit record, so fight-census
// denominators undercount by exactly those fights.
//
// Mechanism (verified in game.js): startCombat assigns this.tbfight, then
// runs an opening tbAdvance when the monster is faster. If every living
// monster is follows:false, has no telegraph, and the whole living party is
// beyond max(2, tbMonsterReach) from it, tbEndCheck's DISENGAGE rule fires:
// "It comes apart — no one in reach, no one chasing" -> tbEnd('routed').
// startCombat then returns no live fight, so a startCombat wrapper that
// opens its record only after a live fight returns (the dmg-audit pattern)
// records nothing. The fight happened; the census missed it.
//
// Method (trickfunnel pattern, 2026-10-16): intercept the tbfight PROPERTY
// itself — Object.defineProperty getter/setter, fully transparent — so all
// five initiation paths are covered uniformly (startCombat's own
// construction, encounters.js:2707, justice.js:666 uprising, party.js:668
// betrayal, game.js:8499 save/load rebuild). Every assignment opens a census
// row; a tbEnd wrapper closes one. A row closed 'routed' at round 1 is a
// comes-apart fight: the opening pass disengaged it before any
// startCombat-wrapper record could open.
//
// MEASUREMENT ONLY: wrappers call through; no RNG, logic, or save-state
// touch. No top-level side effects — safe to require from any process.
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function monsterOf(f) {
  try {
    const fs = (f && f.fighters) || [];
    return fs.find(x => x && x.kind === 'monster') || null;
  } catch (e) { return null; }
}

function attachFightCensus(Game) {
  let seq = 0;
  const assignments = [];
  const outcomes = [];
  const openBySeq = new Map();

  function onAssign(f) {
    seq++;
    const m = monsterOf(f);
    const p = (() => { try { return (f.fighters || []).find(x => x && x.kind === 'player') || null; } catch (e) { return null; } })();
    const row = {
      seq, day: gday(Game),
      mid: (m && (m.monsterId || (m.mdef && m.mdef.id) || m.id)) || 'unknown',
      follows: m && m.mdef ? m.mdef.follows : null,
      pPos: p ? [p.mx, p.my] : null,
      mPos: m ? [m.mx, m.my] : null,
      result: null, round: null,
    };
    assignments.push(row);
    openBySeq.set(seq, row);
  }

  const origDesc = Object.getOwnPropertyDescriptor(Game, 'tbfight');
  let tbVal = Game.tbfight;
  let attached = false;
  try {
    Object.defineProperty(Game, 'tbfight', {
      configurable: true,
      enumerable: origDesc ? !!origDesc.enumerable : true,
      get: function () { return tbVal; },
      set: function (v) {
        tbVal = v;
        try { if (v && typeof v === 'object' && Array.isArray(v.fighters)) onAssign(v); } catch (e) {}
      },
    });
    attached = true;
  } catch (e) { attached = false; }

  const origTbEnd = Game.tbEnd;
  let tbEndWrapped = false;
  try {
    Game.tbEnd = function (...args) {
      const pre = Game.tbfight;
      const preRound = pre && typeof pre.round === 'number' ? pre.round : null;
      const ret = origTbEnd.apply(this, args);
      try {
        const f = Game.tbfight;
        const ended = !f || f.over === true;
        if (ended && openBySeq.size) {
          const lastSeq = Math.max(...openBySeq.keys());
          const row = openBySeq.get(lastSeq);
          row.result = args[0] != null ? String(args[0]) : null;
          row.round = preRound;
          openBySeq.delete(lastSeq);
          outcomes.push(row);
        }
      } catch (e) {}
      return ret;
    };
    tbEndWrapped = true;
  } catch (e) { tbEndWrapped = false; }

  function restore() {
    try {
      if (attached) {
        if (origDesc) Object.defineProperty(Game, 'tbfight', origDesc);
        else Game.tbfight = tbVal;
      }
    } catch (e) {}
    try { if (tbEndWrapped) Game.tbEnd = origTbEnd; } catch (e) {}
  }

  return {
    assignments, outcomes,
    attached, tbEndWrapped,
    routedBeforeRecord() {
      return assignments.filter(r => r.result === 'routed');
    },
    restore,
  };
}

module.exports = { attachFightCensus };
