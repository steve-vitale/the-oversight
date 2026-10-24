// tableseat — leanlinkrescue courtship + table seat/wait legs (sim-tableseat-a,
// axis scale-onramp, run fleshout-20261024T1955Z, arm 1 of 2).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TABLESEAT unset or not
// '1' → daily delegates to leanlinkrescue.daily with NO seat legs at
// all (the det-gate in scripts/test-tableseat-sweep.js pins that: off
// daily is leanlinkrescue.daily, byte-identical days/gameDays).
//
// WRAPS leanlinkrescue.daily, NOT competent.daily — the courtship is
// shared exactly with the leanlinkrescue-only baseline, so the delta
// is EXACTLY the seat/wait legs below (copied from the seat/wait legs
// in scripts/test-tablesit-sweep.js, which proved them never exercised
// against competent: 0 attempts, competent never reached national —
// while leanlinkrescue reaches national reliably, confirm final 6/8,
// ever 8/8). This arm finally exercises the seat.
//
// Legs (both rank-national+ gated, both read-only before national):
//   1. SEAT: before the day's courtship, if !tableDone and rank >=
//      national, drive the seat: tablePreview() ready → tableTakeSeat()
//      from Haven (tableTakeSeat enforces its own guards), then answer
//      table choices first-option, bounded with a stall guard.
//   2. WAIT: after the day's courtship, while tableWaiting + national+
//      + !tableDone, end the day at Haven (4,4): walk there if needed.
// A GO verdict means GO CANDIDATE as an instrument, default-OFF only
// — landing this as competent play is a coordinator/Steve call, NOT
// made by this arm. No default flips.
'use strict';
const { leanlinkrescue } = require('./leanlinkrescue');
const { walkTo } = require('./competent');

function tableseatOn() {
  try {
    return String((typeof process !== 'undefined' && process.env && process.env.TABLESEAT) || '0') === '1';
  } catch (e) { return false; }
}

const TS_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function tsGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function tsRankOrder(Game) { try { return TS_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function tsProgOf(Game) { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } }
function tsAtHaven(Game) { try { return Game.map.px === 4 && Game.map.py === 4; } catch (e) { return false; } }
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

const tableseat = Object.assign({}, leanlinkrescue, {
  id: 'tableseat',
  desc: 'leanlinkrescue + table seat/wait legs after national (TABLESEAT=1; default off = leanlinkrescue-only)',
  daily(Game, ctx) {
    if (!tableseatOn()) return leanlinkrescue.daily(Game, ctx);
    try {
      const pg0 = tsProgOf(Game);
      if (!pg0.tableDone && tsRankOrder(Game) >= 2) {
        if (ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
        tsDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.tsSeatErr = String(e && e.message).slice(0, 80); }
    const r = leanlinkrescue.daily(Game, ctx);
    try {
      const pg = tsProgOf(Game);
      if (!pg.tableDone && pg.tableWaiting && tsRankOrder(Game) >= 2) {
        ctx.tsWaitDays = (ctx.tsWaitDays || 0) + 1;
        if (tsAtHaven(Game)) {
          ctx.tsWaitAtHaven = (ctx.tsWaitAtHaven || 0) + 1;
        } else {
          try { walkTo(Game, 4, 4); } catch (e) { ctx.tsWaitErr = String(e && e.message).slice(0, 80); }
          if (tsAtHaven(Game)) ctx.tsWaitReturns = (ctx.tsWaitReturns || 0) + 1;
          else ctx.tsWaitStranded = (ctx.tsWaitStranded || 0) + 1;
        }
      }
      if (tsRankOrder(Game) >= 2 && ctx.tsNationalDay == null) ctx.tsNationalDay = tsGday(Game);
    } catch (e) { ctx.tsWaitErr = String(e && e.message).slice(0, 80); }
    return r;
  },
});

module.exports = { tableseat, tableseatOn, tsDriveSeat, tsAnswerTableChoices };
