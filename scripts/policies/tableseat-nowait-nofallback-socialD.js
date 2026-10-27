// tableseat-nowait — leanlinkrescue courtship + table SEAT legs ONLY, NO wait leg
// (sim-tableseat-nowait-a, arm 2 of 2, axis scale-onramp, run fleshout-20261024T1955Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TABLESEATNOWAIT unset or not
// '1' → daily delegates to leanlinkrescue.daily with NO seat behavior at all
// (the det-gate in scripts/test-tableseat-nowait-sweep.js pins that: off
// daily is leanlinkrescue.daily, byte-identical days on the det-gate seed).
//
// WHAT THIS IS: leanlinkrescue courtship (scripts/policies/leanlinkrescue.js,
// LEANLINKRESCUE=1) wrapped with the tablesit SEAT legs ONLY, copied from
// scripts/test-tablesit-sweep.js: tsDriveSeat + tsAnswerTableChoices +
// rank-national+ gating. The wait leg is OMITTED ENTIRELY — no Haven-ending
// while tableWaiting, no walkTo(4,4), no wait counters. Paired with the
// sibling seat+wait arm (sim-tableseat-a), this arm isolates whether the
// wait discipline helps or hurts.
//
// WHY: backlog #906 + run 1822Z next blank — no beat-answering policy ever
// took the table seat. sim-tablesit proved the seat/wait legs are never
// exercised against competent (0 attempts, competent never reached national),
// while leanlinkrescue reaches national reliably (confirm: final 6/8, ever
// 8/8). Wrapping leanlinkrescue.daily — NOT competent.daily — keeps the
// courtship shared exactly with the baseline, so the delta is ONLY the seat.
//
// A GO verdict means GO CANDIDATE as an instrument, default-OFF only —
// landing this as competent play is a coordinator/Steve call, NOT made by
// this arm. No default flips.
'use strict';
const { leanlinkrescue } = require('./leanlinkrescue-nofallback-socialD');

const TS_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function tsLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TABLESEATNOWAIT) || '0') === '1'; } catch (e) { return false; }
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
// Seat legs below are verbatim from scripts/test-tablesit-sweep.js
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

const tableseatNowait = Object.assign({}, leanlinkrescue, {
  id: 'tableseat-nowait',
  desc: 'leanlinkrescue + table seat legs only (take the seat when ready at national+, NO wait leg; default off = leanlinkrescue)',
  daily(Game, ctx) {
    if (!tsLayerOn()) return leanlinkrescue.daily(Game, ctx);
    try {
      const pg0 = tsProgOf(Game);
      if (!pg0.tableDone && tsRankOrder(Game) >= 2) {
        if (ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
        tsDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); }
    // NO WAIT LEG: after the day's courtship work, nothing Haven-ends the
    // day while tableWaiting. That omission IS the arm.
    const r = leanlinkrescue.daily(Game, ctx);
    try {
      if (tsRankOrder(Game) >= 2 && ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
    } catch (e) {}
    return r;
  },
});

module.exports = { tableseatNowait, tsLayerOn, tsDriveSeat, tsAnswerTableChoices };
