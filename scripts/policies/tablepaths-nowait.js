// tablepaths-nowait — tableseat-nowait + a paths-phase answer override ONLY
// (sim-tablepaths-a, axis scale-onramp, run fleshout-20261024T2115Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TABLEPATHS unset or not '1'
// → daily delegates to tableseat-nowait daily EXACTLY (the det-gate in
// scripts/test-tablepaths-sweep.js pins that: gate off, seed 73641, days
// equal tableseat-nowait days, no tp counters).
//
// WHY: the 1955Z round proved tableseat-nowait takes the lesser seat 3/8
// and wins 3/8 — but every seat resolved to the Feared path because the
// seat legs always answer the FIRST table option. This layer changes ONLY
// which door is walked; everything else (courtship, seat legs, beat/final/
// downgrade/conscript answering) is byte-identical behavior to
// tableseat-nowait, so the delta is ONLY the door choice.
//
// THE DOOR RULE (pre-registered in evidence/2026-10-24/sim-tablepaths-a.md,
// implemented exactly as written there — POLICY-SIDE, not canon):
// at a paths-phase offer (every option id 'path:*'), let ASSIGNED =
// ROTATION[(seed - 73641)] with ROTATION =
// ['defiant','assimilated','beloved','relay','defiant','assimilated','beloved','relay'].
// (1) If ASSIGNED is offered, take it. (2) Else take the first offered door
// that is NOT 'feared', in engine order. (3) Else (only feared offered)
// take feared. A door never offered is NEVER taken (the modalplay
// precedent — forcing an unearned door would bypass the engine's prereq).
// Downgrade, conscript, demand-price, challenge beats and finals all take
// the FIRST option, exactly like tableseat-nowait. Branches stay
// ledger-earned (this layer NEVER overrides tableBranch).
//
// OPTION -> PATH MAPPING (from src/js/table.js, not guessed):
// tableOfferPaths offers ONLY earned paths as {id: 'path:' + p.id}; offered
// order at a lesser seat (registration order, indispensable excluded by its
// full-seat floor) is feared → beloved → witness → assimilated → defiant
// → relay. Feared registers first with an easy prereq (might+killed ≥ 6),
// which is why first-option answering always walks Feared when it is earned.
//
// NAME NOTE: scripts/policies/tablepaths.js already exists (the 2026-10-19
// seatdrive-substrate path-forcing driver). This file is the same job on
// the tableseat-nowait substrate and deliberately does NOT overwrite it.
//
// NEVER edit tableseat-nowait.js, leanlinkrescue.js, or any src/js file.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');
const { leanlinkrescue } = require('./leanlinkrescue');

const TP_ROTATION = ['defiant', 'assimilated', 'beloved', 'relay', 'defiant', 'assimilated', 'beloved', 'relay'];
const TP_BASE_SEED = 73641;
const TP_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function tpLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TABLEPATHS) || '0') === '1'; } catch (e) { return false; }
}
function tpSeedIndex() {
  try {
    const s = parseInt((typeof process !== 'undefined' && process.env && process.env.TP_SEED) || '', 10);
    if (!Number.isFinite(s)) return null;
    return ((s - TP_BASE_SEED) % TP_ROTATION.length + TP_ROTATION.length) % TP_ROTATION.length;
  } catch (e) { return null; }
}
function tpAssigned() {
  const i = tpSeedIndex();
  return i === null ? TP_ROTATION[0] : TP_ROTATION[i];
}
function tpGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function tpRankOrder(Game) { try { return TP_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function tpProgOf(Game) { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } }
function tpScholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}
function tpCanPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; } catch (e) { return false; }
}
// Answer loop: the nowait tsAnswerTableChoices shape, with ONLY the
// paths-phase pick changed per the pre-registered door rule. Non-paths
// phases take options[0], exactly like the baseline.
function tpAnswerTableChoices(Game, ctx) {
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
        const assigned = tpAssigned();
        let earnedSnap = null;
        try {
          if (typeof Game.tableEarnedPaths === 'function') {
            earnedSnap = Game.tableEarnedPaths().map(p => ({ id: p.id, earned: !!p.earned, why: String(p.why || '').slice(0, 120) }));
          }
        } catch (e) { ctx.tpEarnedErr = String(e && e.message).slice(0, 80); }
        if (offered.indexOf(assigned) >= 0) { pick = 'path:' + assigned; rule = 'assigned'; }
        else {
          const nonFeared = offered.filter(id => id !== 'feared');
          if (nonFeared.length) { pick = 'path:' + nonFeared[0]; rule = 'fallback-non-feared'; }
          else { pick = 'path:' + offered[0]; rule = 'only-feared'; }
        }
        ctx.tpOffers = ctx.tpOffers || [];
        ctx.tpOffers.push({ day: tpGday(Game), offered, assigned, picked: String(pick).slice(5), rule, earned: earnedSnap });
        ctx.tpPath = String(pick).slice(5);
      } else if (ids.length && String(ids[0]).indexOf('downgrade:') === 0) {
        ctx.tpDowngrade = String(ids[0]).slice(10);
      }
      try { Game.chooseTableOption(pick); } catch (e) { ctx.tpTableErr = String(e && e.message).slice(0, 80); break; }
      n++;
      ctx.tpTableAnswers = (ctx.tpTableAnswers || 0) + 1;
    }
  } catch (e) { ctx.tpTableErr = String(e && e.message).slice(0, 80); }
}
// Seat leg: the nowait tsDriveSeat shape verbatim, except it drains through
// tpAnswerTableChoices and records tp counters (not ts counters).
function tpDriveSeat(Game, ctx) {
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { ctx.tpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (!pv) return;
  ctx.tpPreviewSeen = (ctx.tpPreviewSeen || 0) + 1;
  if (!pv.ready) { ctx.tpPreviewNotReady = (ctx.tpPreviewNotReady || 0) + 1; return; }
  if (!tpScholarAlive(Game)) { ctx.tpNoScholar = (ctx.tpNoScholar || 0) + 1; return; }
  if (!tpCanPropose(Game)) { ctx.tpGuardRefused = (ctx.tpGuardRefused || 0) + 1; return; }
  ctx.tpSeatAttempts = (ctx.tpSeatAttempts || 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.tpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (r && r.ok) {
    ctx.tpSeatTaken = (ctx.tpSeatTaken || 0) + 1;
    ctx.tpSeatDay = tpGday(Game);
    ctx.tpSeatKind = pv.seat;
    tpAnswerTableChoices(Game, ctx);
  } else {
    ctx.tpSeatFailed = (ctx.tpSeatFailed || 0) + 1;
  }
}

const tablepathsNowait = Object.assign({}, tableseatNowait, {
  id: 'tablepaths-nowait',
  desc: 'tableseat-nowait + paths-phase door rule (assigned rotation, fallback first non-feared; default off = tableseat-nowait)',
  daily(Game, ctx) {
    if (!tpLayerOn()) return tableseatNowait.daily(Game, ctx);
    try {
      const pg0 = tpProgOf(Game);
      if (!pg0.tableDone && tpRankOrder(Game) >= 2) {
        if (ctx.tpNationalDay == null) ctx.tpNationalDay = tpGday(Game);
        tpDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.tpSeatErr = String(e && e.message).slice(0, 80); }
    // NO WAIT LEG (inherited from tableseat-nowait): after the day's
    // courtship work, nothing Haven-ends the day while tableWaiting.
    const r = leanlinkrescue.daily(Game, ctx);
    try {
      if (tpRankOrder(Game) >= 2 && ctx.tpNationalDay == null) ctx.tpNationalDay = tpGday(Game);
    } catch (e) {}
    return r;
  },
});

module.exports = { tablepathsNowait, tpLayerOn, tpDriveSeat, tpAnswerTableChoices, TP_ROTATION, TP_BASE_SEED };
