// tablepaths-witness — tableseat-nowait + a WITNESS-door answer override ONLY
// (sim-tablepaths-witness-a, axis scale-onramp, run fleshout-20261024T2215Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TABLEWITNESS unset or not '1'
// → daily delegates to tableseat-nowait daily EXACTLY (the det-gate in
// scripts/test-tablepaths-witness-sweep.js pins that: gate off, seed 73671,
// days equal tableseat-nowait days, no wp counters).
//
// WHY: sim-tablepaths-a proved the lesser-seat menu on the leanlinkrescue
// substrate offers witness (3-4 exposures on both seated seeds) — the old
// 2026-10-20 note that witness is never earned does not hold here. The
// 2115Z rotation walked defiant/assimilated/beloved/relay but never
// witness. This layer walks the witness door whenever it is offered.
//
// THE DOOR RULE (pre-registered in evidence/2026-10-24/sim-tablepaths-witness-a.md,
// implemented exactly as written there — POLICY-SIDE, not canon):
// at a paths-phase offer (every option id 'path:*'):
// (1) If 'witness' is offered, take it (rule 'witness').
// (2) Else take the first offered door that is NOT 'feared', in engine
//     order (rule 'fallback-non-feared').
// (3) Else (only feared offered) take feared (rule 'fallback-feared';
//     that seating is flagged fallback-Feared and does NOT count toward
//     the witness GO).
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
// defiant → relay. Witness prereq: exposed ≥ 3 (src/js/table-witness.js
// path definition; ledger threshold beats).
//
// NEVER edit tableseat-nowait.js, tablepaths-nowait.js, leanlinkrescue.js,
// or any src/js file.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');
const { leanlinkrescue } = require('./leanlinkrescue');

const WP_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function wpLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TABLEWITNESS) || '0') === '1'; } catch (e) { return false; }
}
function wpGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function wpRankOrder(Game) { try { return WP_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function wpProgOf(Game) { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } }
function wpScholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}
function wpCanPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; } catch (e) { return false; }
}
// Answer loop: the nowait tsAnswerTableChoices shape, with ONLY the
// paths-phase pick changed per the pre-registered door rule. Non-paths
// phases take options[0], exactly like the baseline.
function wpAnswerTableChoices(Game, ctx) {
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
        } catch (e) { ctx.wpEarnedErr = String(e && e.message).slice(0, 80); }
        if (offered.indexOf('witness') >= 0) { pick = 'path:witness'; rule = 'witness'; }
        else {
          const nonFeared = offered.filter(id => id !== 'feared');
          if (nonFeared.length) { pick = 'path:' + nonFeared[0]; rule = 'fallback-non-feared'; }
          else { pick = 'path:' + offered[0]; rule = 'fallback-feared'; }
        }
        ctx.wpOffers = ctx.wpOffers || [];
        ctx.wpOffers.push({ day: wpGday(Game), offered, picked: String(pick).slice(5), rule, earned: earnedSnap });
        ctx.wpPath = String(pick).slice(5);
        ctx.wpRule = rule;
        if (rule === 'fallback-feared') ctx.wpFallbackFeared = (ctx.wpFallbackFeared || 0) + 1;
      } else if (ids.length && String(ids[0]).indexOf('downgrade:') === 0) {
        ctx.wpDowngrade = String(ids[0]).slice(10);
      }
      try { Game.chooseTableOption(pick); } catch (e) { ctx.wpTableErr = String(e && e.message).slice(0, 80); break; }
      n++;
      ctx.wpTableAnswers = (ctx.wpTableAnswers || 0) + 1;
    }
  } catch (e) { ctx.wpTableErr = String(e && e.message).slice(0, 80); }
}
// Seat leg: the nowait tsDriveSeat shape verbatim, except it drains through
// wpAnswerTableChoices and records wp counters (not ts counters).
function wpDriveSeat(Game, ctx) {
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { ctx.wpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (!pv) return;
  ctx.wpPreviewSeen = (ctx.wpPreviewSeen || 0) + 1;
  if (!pv.ready) { ctx.wpPreviewNotReady = (ctx.wpPreviewNotReady || 0) + 1; return; }
  if (!wpScholarAlive(Game)) { ctx.wpNoScholar = (ctx.wpNoScholar || 0) + 1; return; }
  if (!wpCanPropose(Game)) { ctx.wpGuardRefused = (ctx.wpGuardRefused || 0) + 1; return; }
  ctx.wpSeatAttempts = (ctx.wpSeatAttempts || 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.wpSeatErr = String(e && e.message).slice(0, 80); return; }
  if (r && r.ok) {
    ctx.wpSeatTaken = (ctx.wpSeatTaken || 0) + 1;
    ctx.wpSeatDay = wpGday(Game);
    ctx.wpSeatKind = pv.seat;
    wpAnswerTableChoices(Game, ctx);
  } else {
    ctx.wpSeatFailed = (ctx.wpSeatFailed || 0) + 1;
  }
}

const tablepathsWitness = Object.assign({}, tableseatNowait, {
  id: 'tablepaths-witness',
  desc: 'tableseat-nowait + witness-door rule (witness if offered, else first non-feared, else feared-flagged; default off = tableseat-nowait)',
  daily(Game, ctx) {
    if (!wpLayerOn()) return tableseatNowait.daily(Game, ctx);
    try {
      const pg0 = wpProgOf(Game);
      if (!pg0.tableDone && wpRankOrder(Game) >= 2) {
        if (ctx.wpNationalDay == null) ctx.wpNationalDay = wpGday(Game);
        wpDriveSeat(Game, ctx);
      }
    } catch (e) { ctx.wpSeatErr = String(e && e.message).slice(0, 80); }
    // NO WAIT LEG (inherited from tableseat-nowait): after the day's
    // courtship work, nothing Haven-ends the day while tableWaiting.
    const r = leanlinkrescue.daily(Game, ctx);
    try {
      if (wpRankOrder(Game) >= 2 && ctx.wpNationalDay == null) ctx.wpNationalDay = wpGday(Game);
    } catch (e) {}
    return r;
  },
});

module.exports = { tablepathsWitness, wpLayerOn, wpDriveSeat, wpAnswerTableChoices };
