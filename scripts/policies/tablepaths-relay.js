// tablepaths-relay — tableseat-nowait + a RELAY-door answer override ONLY
// (sim-seatpath-a, axis scale-onramp, run fleshout-20261028T0416Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TABLERELAY unset or not '1'
// → daily delegates to tableseat-nowait daily EXACTLY (the det-gate in
// scripts/test-tablepaths-relay-sweep.js pins that: gate off, seed 75101,
// days equal tableseat-nowait days, no rp counters).
//
// WHY: the tableseat-nowait seat legs answer the FIRST table option at
// every phase, and at a lesser seat the engine offers earned paths in
// registration order — feared first — so the baseline walks Feared
// whenever Feared is earned. Path diversity on the 75101–75108 band is
// untested. Relay is the one alternative picked (pre-registered in
// evidence/2026-10-28/sim-seatpath-a-prereg.md): TABLE.md names its
// stage-3 qualification the most reachable route by design (integration
// earned through play, not territory), and it is the only path qualified
// by integration depth instead of territory — the most distinct answers
// from Feared's terror calibration.
//
// THE DOOR RULE (pre-registered, POLICY-SIDE, not canon):
// at a paths-phase offer (every option id 'path:*'):
// (1) If 'relay' is offered, take it (rule 'relay').
// (2) Else take the first offered door that is NOT 'feared', in engine
//     order (rule 'fallback-non-feared').
// (3) Else (only feared offered) take feared (rule 'fallback-feared';
//     that seating is flagged fallback-Feared and does NOT count toward
//     the relay GO).
// A door never offered is NEVER taken (the modalplay precedent — forcing
// an unearned door would bypass the engine's prereq).
// Downgrade, conscript, demand-price, challenge beats and finals all take
// the FIRST option, exactly like tableseat-nowait. Branches stay
// ledger-earned (this layer NEVER overrides tableBranch).
//
// OPTION -> PATH MAPPING (from src/js/table.js, as in tablepaths-nowait):
// tableOfferPaths offers ONLY earned paths as {id: 'path:' + p.id};
// lesser-seat offered order (registration order, indispensable excluded by
// its full-seat floor) is feared → beloved → witness → assimilated →
// defiant → relay. Relay prereq (src/js/table-relay.js): integration
// stage >= 3, OR stage >= 2 with the relay office held (TABLE.md also
// names sysBond >= 2; the code earns on stage/office and prices strength
// from sysBond — the earned snapshot recorded per seating names the
// actual blocking reason if relay is never offered).
//
// NEVER edit tableseat-nowait.js, tablepaths-nowait.js,
// tablepaths-defiant.js, tablepaths-witness.js, leanlinkrescue.js,
// or any src/js file.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');
const { leanlinkrescue } = require('./leanlinkrescue');

const RP_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function rpLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TABLERELAY) || '0') === '1'; } catch (e) { return false; }
}
function rpGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function rpRankOrder(Game) { try { return RP_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function rpProgOf(Game) { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } }
function rpScholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}
function rpCanPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; } catch (e) { return false; }
}
// Answer loop: the nowait tsAnswerTableChoices shape, with ONLY the
// paths-phase pick changed per the pre-registered door rule. Non-paths
// phases take options[0], exactly like the baseline.
function rpAnswerTableChoices(Game, ctx) {
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
            earnedSnap = Game.tableEarnedPaths().map(p => ({ id: p.id, earned: !!p.earned, why: String(p.why || '').slice(0, 160) }));
          }
        } catch (e) { ctx.rpEarnedErr = String(e && e.message).slice(0, 80); }
        if (offered.indexOf('relay') >= 0) { pick = 'path:relay'; rule = 'relay'; }
        else {
          const nonFeared = offered.filter(id => id !== 'feared');
          if (nonFeared.length) { pick = 'path:' + nonFeared[0]; rule = 'fallback-non-feared'; }
          else { pick = 'path:' + offered[0]; rule = 'fallback-feared'; }
        }
        ctx.rpOffers = ctx.rpOffers || [];
        ctx.rpOffers.push({ day: rpGday(Game), offered, picked: String(pick).slice(5), rule, earned: earnedSnap });
        ctx.rpPath = String(pick).slice(5);
        ctx.rpRule = rule;
        if (rule === 'fallback-feared') ctx.rpFallbackFeared = (ctx.rpFallbackFeared || 0) + 1;
      } else if (ids.length && String(ids[0]).indexOf('downgrade:') === 0) {
        ctx.rpDowngrade = String(ids[0]).slice(10);
      }
      try { Game.chooseTableOption(pick); } catch (e) { ctx.rpTableErr = String(e && e.message).slice(0, 80); break; }
      n++;
      ctx.rpTableAnswers = (ctx.rpTableAnswers || 0) + 1;
    }
  } catch (e) { ctx.rpTableErr = String(e && e.message).slice(0, 80); }
}
// Seat leg: the nowait tsDriveSeat shape verbatim, except it drains through
// rpAnswerTableChoices and records rp counters (not ts counters).
function rpDriveSeat(Game, ctx) {
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { ctx.rpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (!pv) return;
  ctx.rpPreviewSeen = (ctx.rpPreviewSeen || 0) + 1;
  if (!pv.ready) { ctx.rpPreviewNotReady = (ctx.rpPreviewNotReady || 0) + 1; return; }
  if (!rpScholarAlive(Game)) { ctx.rpNoScholar = (ctx.rpNoScholar || 0) + 1; return; }
  if (!rpCanPropose(Game)) { ctx.rpGuardRefused = (ctx.rpGuardRefused || 0) + 1; return; }
  ctx.rpSeatAttempts = (ctx.rpSeatAttempts || 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.rpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (r && r.ok) {
    ctx.rpSeatTaken = (ctx.rpSeatTaken || 0) + 1;
    ctx.rpSeatDay = rpGday(Game);
    ctx.rpSeatKind = pv.seat;
    rpAnswerTableChoices(Game, ctx);
  } else {
    ctx.rpSeatFailed = (ctx.rpSeatFailed || 0) + 1;
  }
}

const tablepathsRelay = Object.assign({}, tableseatNowait, {
  id: 'tablepaths-relay',
  desc: 'tableseat-nowait + relay-door rule (relay if offered, else first non-feared, else feared-flagged; default off = tableseat-nowait)',
  daily(Game, ctx) {
    if (!rpLayerOn()) return tableseatNowait.daily(Game, ctx);
    try {
      const pg0 = rpProgOf(Game);
      if (!pg0.tableDone && rpRankOrder(Game) >= 2) {
        if (ctx.rpNationalDay == null) ctx.rpNationalDay = rpGday(Game);
        rpDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.rpSeatErr = String(e && e.message).slice(0, 80); }
    // NO WAIT LEG (inherited from tableseat-nowait): after the day's
    // courtship work, nothing Haven-ends the day while tableWaiting.
    const r = leanlinkrescue.daily(Game, ctx);
    try {
      if (rpRankOrder(Game) >= 2 && ctx.rpNationalDay == null) ctx.rpNationalDay = rpGday(Game);
    } catch (e) {}
    return r;
  },
});

module.exports = { tablepathsRelay, rpLayerOn, rpDriveSeat, rpAnswerTableChoices };
