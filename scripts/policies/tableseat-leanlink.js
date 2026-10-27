// tableseat-leanlink — leanlink courtship + table SEAT legs ONLY, NO wait leg
// (sim-lowdef-a, axis scale-onramp, run fleshout-20261027T1816Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TABLESEATLEANLINK unset or
// not '1' → daily delegates to leanlink.daily with NO seat behavior at all
// (the det-gate in scripts/test-lowdef-a-sweep.js pins that: off daily is
// leanlink.daily, byte-identical days on the det-gate seed).
//
// WHAT THIS IS: tableseat-nowait's seat legs, verbatim in shape, wrapped
// around leanlink courtship (scripts/policies/leanlink.js, LEANLINK=1: cap
// 3, NO tends) instead of leanlinkrescue courtship (cap 3, rescue-tends).
// The ONLY difference from tableseat-nowait is the courtship underneath:
// no 1,500 kcal/week/link tend drain on the pantry. The seat legs, the
// rank-national+ gating, the NO wait leg, and the first-option answering
// are identical to tableseat-nowait.
//
// WHY (sim-lowdef-a Phase 0, diagnostic seeds 76901-76902, unjudged):
// ledger defiance at seating time on the leanlinkrescue substrate is
// trial expiries ONLY (7/7 and 11/11; arena-defiance 0, global-declined 0,
// scale-refused 0). Haul trials complete iff the pantry GROWS by
// 1000/3000 kcal within 3 days, so removing the tend drain leaves more
// 3-day pantry growth and should complete more haul trials, expiring
// fewer — lowering defiance at seating. This file is the instrument that
// tests that mechanism; it is a measurement substrate, default-OFF only.
// Landing this as competent play is a coordinator/Steve call, NOT made by
// this arm. No default flips.
//
// NEVER edit leanlink.js, tableseat-nowait.js, leanlinkrescue.js, or any
// src/js file.
'use strict';
const { leanlink } = require('./leanlink');

const TS_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function tsLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TABLESEATLEANLINK) || '0') === '1'; } catch (e) { return false; }
}
function tsGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function tsRankOrder(Game) { try { return TS_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function tsProgOf(Game) { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } }
function tsScholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}
function tsCanPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; } catch (e) { return false; }
}
// Seat legs below are verbatim from scripts/policies/tableseat-nowait.js
// (tsAnswerTableChoices + tsDriveSeat), minus nothing, plus nothing.
function tsAnswerTableChoices(Game, ctx) {
  try {
    let n = 0, lastSig = null, stall = 0;
    for (;;) {
      if (Game.over || n >= 30) break;
      if (Game.tbfight && !Game.tbfight.over) break;
      const tc = (Game.state.scholar || {}).tableChoices;
      if (!tc || !tc.options || !tc.options.length || !Game.chooseTableOption) break;
      const sig = tc.frame + '|' + tc.options.map(o => o.id).join(',');
      if (sig === lastSig && ++stall >= 2) break;
      lastSig = sig;
      try { Game.chooseTableOption(tc.options[0].id); } catch (e) { ctx.tsTableErr = String(e && e.message).slice(0, 80); break; }
      n++;
      ctx.tsTableAnswers = (ctx.tsTableAnswers || 0) + 1;
      if (String(tc.options[0].id).indexOf('path:') === 0) ctx.tsTablePath = tc.options[0].id.slice(5);
    }
  } catch (e) { ctx.tsTableErr = String(e && e.message).slice(0, 80); }
}
function tsDriveSeat(Game, ctx) {
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); return; }
  if (!pv) return;
  ctx.tsPreviewSeen = (ctx.tsPreviewSeen || 0) + 1;
  if (!pv.ready) { ctx.tsPreviewNotReady = (ctx.tsPreviewNotReady || 0) + 1; return; }
  if (!tsScholarAlive(Game)) { ctx.tsNoScholar = (ctx.tsNoScholar || 0) + 1; return; }
  if (!tsCanPropose(Game)) { ctx.tsGuardRefused = (ctx.tsGuardRefused || 0) + 1; return; }
  ctx.tsSeatAttempts = (ctx.tsSeatAttempts || 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); return; }
  if (r && r.ok) {
    ctx.tsSeatTaken = (ctx.tsSeatTaken || 0) + 1;
    ctx.tsSeatDay = tsGday(Game);
    ctx.tsSeatKind = pv.seat;
    tsAnswerTableChoices(Game, ctx);
  } else {
    ctx.tsSeatFailed = (ctx.tsSeatFailed || 0) + 1;
  }
}

const tableseatLeanlink = Object.assign({}, leanlink, {
  id: 'tableseat-leanlink',
  desc: 'leanlink + table seat legs only (take the seat when ready at national+, NO wait leg; default off = leanlink)',
  daily(Game, ctx) {
    if (!tsLayerOn()) return leanlink.daily(Game, ctx);
    try {
      const pg0 = tsProgOf(Game);
      if (!pg0.tableDone && tsRankOrder(Game) >= 2) {
        if (ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
        tsDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); }
    // NO WAIT LEG: after the day's courtship work, nothing Haven-ends the
    // day while tableWaiting. That omission IS the arm (inherited from
    // tableseat-nowait).
    const r = leanlink.daily(Game, ctx);
    try {
      if (tsRankOrder(Game) >= 2 && ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
    } catch (e) {}
    return r;
  },
});

module.exports = { tableseatLeanlink, tsLayerOn, tsDriveSeat, tsAnswerTableChoices };
