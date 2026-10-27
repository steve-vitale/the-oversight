// tablepaths-leanlink — tableseat-leanlink + a DEFIANT-door answer override ONLY
// (sim-lowdef-a, axis scale-onramp, run fleshout-20261027T1816Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TABLEPATHSLEANLINK unset or
// not '1' → daily delegates to tableseat-leanlink daily EXACTLY (the
// det-gate in scripts/test-lowdef-a-sweep.js pins that: gate off, det-gate
// seed, days equal tableseat-leanlink days, no dp counters).
//
// WHY: the defiant-door rule from scripts/policies/tablepaths-defiant.js
// (sim-defiantdoor-a, 1315Z), applied VERBATIM as a rule on the leanlink
// substrate instead of the leanlinkrescue substrate, so a lower-defiance
// seating — if the leanlink substrate produces one — can be tested for
// rule (3) (fallback-feared) live. The rule itself is unchanged:
//
// THE DOOR RULE (pre-registered in
// evidence/2026-10-27/sim-defiantdoor-a-prereg.md, implemented exactly as
// written there — POLICY-SIDE, not canon):
// at a paths-phase offer (every option id 'path:*'):
// (1) If 'defiant' is offered, take it (rule 'defiant').
// (2) Else take the first offered door that is NOT 'feared', in engine
//     order (rule 'fallback-non-feared').
// (3) Else (only feared offered) take feared (rule 'fallback-feared';
//     that seating is flagged fallback-Feared and does NOT count toward
//     any defiant GO).
// A door never offered is NEVER taken. Branches stay ledger-earned; this
// layer NEVER overrides tableBranch.
//
// OPTION -> PATH MAPPING (from src/js/table.js, as in tablepaths-defiant):
// tableOfferPaths offers ONLY earned paths as {id: 'path:' + p.id};
// lesser-seat offered order (registration order, indispensable excluded by
// its full-seat floor) is feared → beloved → witness → assimilated →
// defiant → relay. Defiant prereq: ledger defiance >= 4
// (src/js/table-defiant.js path definition; minSeat lesser).
//
// NEVER edit tableseat-leanlink.js, tableseat-nowait.js, tablepaths-defiant.js,
// leanlink.js, leanlinkrescue.js, or any src/js file.
'use strict';
const { tableseatLeanlink } = require('./tableseat-leanlink');
const { leanlink } = require('./leanlink');

const DP_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function dpLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TABLEPATHSLEANLINK) || '0') === '1'; } catch (e) { return false; }
}
function dpGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dpRankOrder(Game) { try { return DP_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function dpProgOf(Game) { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } }
function dpScholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}
function dpCanPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; } catch (e) { return false; }
}
// Answer loop: the nowait tsAnswerTableChoices shape, with ONLY the
// paths-phase pick changed per the pre-registered door rule. Non-paths
// phases take options[0], exactly like the baseline.
function dpAnswerTableChoices(Game, ctx) {
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
      const ids = tc.options.map(o => o.id);
      const isPaths = ids.length > 0 && ids.every(id => String(id).indexOf('path:') === 0);
      let pick = tc.options[0].id;
      let rule = 'first-option';
      if (isPaths) {
        const offered = ids.map(id => String(id).slice(5));
        let earnedSnap = null;
        try {
          if (typeof Game.tableEarnedPaths === 'function') {
            earnedSnap = Game.tableEarnedPaths().map(p => ({ id: p.id, earned: !!p.earned, why: String(p.why || '').slice(0, 120) }));
          }
        } catch (e) { ctx.dpEarnedErr = String(e && e.message).slice(0, 80); }
        if (offered.indexOf('defiant') >= 0) { pick = 'path:defiant'; rule = 'defiant'; }
        else {
          const nonFeared = offered.filter(id => id !== 'feared');
          if (nonFeared.length) { pick = 'path:' + nonFeared[0]; rule = 'fallback-non-feared'; }
          else { pick = 'path:' + offered[0]; rule = 'fallback-feared'; }
        }
        ctx.dpOffers = ctx.dpOffers || [];
        ctx.dpOffers.push({ day: dpGday(Game), offered, picked: String(pick).slice(5), rule, earned: earnedSnap });
        ctx.dpPath = String(pick).slice(5);
        ctx.dpRule = rule;
        if (rule === 'fallback-feared') ctx.dpFallbackFeared = (ctx.dpFallbackFeared || 0) + 1;
      } else if (ids.length && String(ids[0]).indexOf('downgrade:') === 0) {
        ctx.dpDowngrade = String(ids[0]).slice(10);
      }
      try { Game.chooseTableOption(pick); } catch (e) { ctx.dpTableErr = String(e && e.message).slice(0, 80); break; }
      n++;
      ctx.dpTableAnswers = (ctx.dpTableAnswers || 0) + 1;
    }
  } catch (e) { ctx.dpTableErr = String(e && e.message).slice(0, 80); }
}
// Seat leg: the nowait tsDriveSeat shape verbatim, except it drains through
// dpAnswerTableChoices and records dp counters (not ts counters).
function dpDriveSeat(Game, ctx) {
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { ctx.dpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (!pv) return;
  ctx.dpPreviewSeen = (ctx.dpPreviewSeen || 0) + 1;
  if (!pv.ready) { ctx.dpPreviewNotReady = (ctx.dpPreviewNotReady || 0) + 1; return; }
  if (!dpScholarAlive(Game)) { ctx.dpNoScholar = (ctx.dpNoScholar || 0) + 1; return; }
  if (!dpCanPropose(Game)) { ctx.dpGuardRefused = (ctx.dpGuardRefused || 0) + 1; return; }
  ctx.dpSeatAttempts = (ctx.dpSeatAttempts || 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.dpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (r && r.ok) {
    ctx.dpSeatTaken = (ctx.dpSeatTaken || 0) + 1;
    ctx.dpSeatDay = dpGday(Game);
    ctx.dpSeatKind = pv.seat;
    dpAnswerTableChoices(Game, ctx);
  } else {
    ctx.dpSeatFailed = (ctx.dpSeatFailed || 0) + 1;
  }
}

const tablepathsLeanlink = Object.assign({}, tableseatLeanlink, {
  id: 'tablepaths-leanlink',
  desc: 'tableseat-leanlink + defiant-door rule (defiant if offered, else first non-feared, else feared-flagged; default off = tableseat-leanlink)',
  daily(Game, ctx) {
    if (!dpLayerOn()) return tableseatLeanlink.daily(Game, ctx);
    try {
      const pg0 = dpProgOf(Game);
      if (!pg0.tableDone && dpRankOrder(Game) >= 2) {
        if (ctx.dpNationalDay == null) ctx.dpNationalDay = dpGday(Game);
        dpDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.dpSeatErr = String(e && e.message).slice(0, 80); }
    // NO WAIT LEG (inherited from tableseat-leanlink): after the day's
    // courtship work, nothing Haven-ends the day while tableWaiting.
    const r = leanlink.daily(Game, ctx);
    try {
      if (dpRankOrder(Game) >= 2 && ctx.dpNationalDay == null) ctx.dpNationalDay = dpGday(Game);
    } catch (e) {}
    return r;
  },
});

module.exports = { tablepathsLeanlink, dpLayerOn, dpDriveSeat, dpAnswerTableChoices };
