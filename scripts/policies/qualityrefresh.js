// qualityrefresh — QUALITY-STEP refresh instrument (sim-qualityrefresh-a,
// 2026-10-26, flesh-out loop A, axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This is a measurement
// instrument, not a play recommendation: the 0215Z feastrefresh band
// recorded 14 refresh grants, all quality 1 / mult 2.03, identical to
// their pre-buff values — "better quality wins" held only trivially,
// because no re-feast on that band ever carried a higher quality than
// the buff it refreshed.
//
// MECHANISM, READ FROM CODE (src/js/feastBuff.js grantFeastBuff,
// src/js/game.js hostFeast, never invented):
//   - Refresh: nq = max(existing.quality, q); mult = qualityUplift[nq]
//     * surge * arcBurn, recomputed never multiplied; untilDay =
//     grant day + durationNights (2); refreshed:true; NO draw.
//     A quality step on refresh happens IFF the refresh feast's q
//     exceeds the live buff's quality. The code CAN step; the open
//     question is whether any re-feast on this substrate ever does.
//   - Feast quality (hostFeast): score starts 1; +1 served variety
//     >= 4; +1 cooked-meat centerpiece; +1 table heart (always, when
//     anyone showed); +1 turnout >= 0.9 with invited >= 5; -1
//     per-head served < 300 kcal; -1 invited < 4; then quality =
//     max(0, min(2, score) - coldSeats), where each fusion-reactor
//     guest is a cold seat (a reactor HOST refuses the grant
//     outright, so host-reactor feasts never reach a grant); then
//     the LEGEND GATE: quality 2 needs a story on the table
//     (variety >= 4 OR meat) AND invited >= 4, else it drops to 1.
//   - Consequence: the reachable policy levers are (a) cold seats
//     — include reactor guests to drag quality down, exclude them
//     to lift it — and (b) the story / invited-count gates. A thin
//     quality-0 feast is nearly unreachable by guest count alone
//     (score >= 2 whenever anyone showed; both deductions firing
//     needs invited < 4 AND per-head < 300 against a 1500-kcal
//     floor). The hunted step is therefore 1 -> 2, not 0 -> 2.
//   - hostFeast draws the pantry cost BEFORE grantFeastBuff, so a
//     refused feast still costs dinner. The hostFeast report (rep)
//     carries ok, quality, spent, served, showed, invited,
//     surgeSpent, buffGranted, draw, and score factors — the
//     recorder below captures rep verbatim, so refused-feast cost
//     is priced from real reports, never inferred.
//
// STEERING LEG (QUALITYREFRESH=1): in upkeep, BEFORE delegating to
// the feastrefresh policy, at dusk, at haven, armed
// (prog.feastSurge truthy), host reactor offline, with a LIVE buff
// (direct-read s.feastBuff with day < untilDay — NEVER
// feastedActive(), which clears expired buffs), and with at least
// one reactor guest among the feastPlan guests and at least one
// non-reactor guest to invite, host the feast with guests = the
// non-reactor invitable guests only. hostFeast accepts a guest list
// via opts.guests — choosing who sits at your fire is a player's
// choice, exercised here as an instrument. All other honest gates
// still apply: dusk-only, at-haven, one feast/day (s.feastDay),
// recentGives >= 1500 in the last 7 days, feastPlan ok, have >=
// subset-cost * 1.5. FRESH feasts are NEVER steered — they delegate
// untouched, so the low side of any step is the ordinary
// (reactor-inclusive) feast and only the refresh side is lifted.
// If no reactor guest is present, or the refresh guest list would
// be empty, or any gate fails, the leg does nothing and the
// feastrefresh behavior runs unchanged.
//
// HOSTFEAST RECORDER (HOSTFEASTREC=1, withHostfeastRec): wraps
// Game.hostFeast, records rep verbatim AFTER delegating (quality,
// spent, served, showed, invited, surgeSpent, buffGranted, draw,
// factors) plus coldSeats computed by direct npcHasAbility
// (vid, 'fusion_reactor') reads on the showed guests, host-reactor
// state, and the live-buff-before direct read. Writes nothing to
// game state, draws no RNG, returns the original value untouched.
// Installs idempotently in daily AND in upkeep (the harness runs
// upkeep before the first daily, so a daily-only install would miss
// loop-day-1 feasts).
//
// DEFAULT OFF: QUALITYREFRESH unset or not '1' -> the steering leg
// does nothing (feastrefresh behavior exactly); HOSTFEASTREC unset
// or not '1' -> the recorder installs nothing (the det-gate in
// scripts/test-qualityrefresh-a.js pins off == plain
// tableseat-nowait on days/gameDays/ts, with no qr/hf surface and
// no installed wraps).
'use strict';
const { feastrefresh } = require('./feastrefresh');
const { recentGives } = require('./competent');

const MAX_EVENTS = 20000;

function steeringOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.QUALITYREFRESH) || '0') === '1'; } catch (e) { return false; }
}
function recOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.HOSTFEASTREC) || '0') === '1'; } catch (e) { return false; }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}
function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}
function newHostStore() {
  return {
    feasts: [], errs: 0, errors: [], overflow: { feasts: 0 },
    installed: false,
  };
}

// isReactorGuest: direct npcHasAbility read. A throw is recorded on
// the store (when one is supplied) and reads as non-reactor — a
// failed probe must never block or steer a feast.
function isReactorGuest(Game, vid, store) {
  try {
    return !!(Game.npcHasAbility && Game.npcHasAbility(vid, 'fusion_reactor'));
  } catch (e) { if (store) noteErr(store, 'npcHasAbility.' + String(vid), e); return false; }
}

// liveBuffDirect: PURE direct read of s.feastBuff — never
// feastedActive() (clears expired buffs). Live iff the buff object
// exists and its dawn has not yet arrived (day < untilDay).
function liveBuffDirect(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const b = s.feastBuff || null;
    if (!b || typeof b !== 'object') return null;
    const day = s.day || 0;
    if (day >= (b.untilDay || 0)) return null;
    return { quality: (b.quality != null ? b.quality : null), mult: (b.mult != null ? b.mult : null), untilDay: b.untilDay || 0, used: !!b.used };
  } catch (e) { return null; }
}

function installHostfeastRec(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._hostfeastRecStore === store && Game._hostfeastRecInstalled) return Game._hostfeastRecUninstall || function () {};
  if (typeof Game.hostFeast !== 'function') { noteErr(store, 'hostFeast.missing', new Error('no hostFeast')); return function () {}; }
  const orig = Game.hostFeast;
  Game.hostFeast = function () {
    let preBuff = null, preReactor = null, preArmed = null;
    try { preBuff = liveBuffDirect(Game); } catch (e) { noteErr(store, 'host.preBuff', e); }
    try { preReactor = (typeof Game.fusionReactorOnline === 'function') ? !!Game.fusionReactorOnline() : null; } catch (e) { preReactor = null; }
    try { const s = (Game.state || {}).scholar || {}; preArmed = !!((s.prog || {}).feastSurge); } catch (e) { preArmed = null; }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const r = (result && typeof result === 'object') ? result : {};
      const showed = Array.isArray(r.showed) ? r.showed.slice() : [];
      let coldSeats = 0;
      for (const vid of showed) { try { if (isReactorGuest(Game, vid, store)) coldSeats++; } catch (e) {} }
      pushCapped(store, 'feasts', {
        day: dayOf(Game), ok: !!r.ok, why: (r.why != null ? String(r.why).slice(0, 160) : null),
        quality: (r.quality != null ? r.quality : null), qualityName: (r.qualityName != null ? String(r.qualityName) : null),
        spent: (r.spent != null ? r.spent : null),
        served: Array.isArray(r.served) ? r.served.map(x => ({ itemId: x.itemId, kcal: x.kcal })) : null,
        servedList: Array.isArray(r.servedList) ? r.servedList.map(x => ({ name: x.name, units: x.units, kcal: x.kcal, meat: !!x.meat })) : null,
        showed: showed.map(String), invited: Array.isArray(r.invited) ? r.invited.map(String) : null,
        star: (r.star != null ? String(r.star) : null),
        surgeSpent: (r.surgeSpent != null ? r.surgeSpent : null),
        buffGranted: (r.buffGranted != null ? !!r.buffGranted : null),
        draw: (r.draw != null ? String(r.draw) : null),
        factors: r.factors ? {
          variety: r.factors.variety, centerpiece: !!r.factors.centerpiece,
          heart: (r.factors.heart != null ? String(r.factors.heart) : null),
          turnout: r.factors.turnout, invitedN: r.factors.invitedN,
          showedN: r.factors.showedN, perHead: r.factors.perHead,
        } : null,
        score: (r.score != null ? r.score : null),
        coldSeats: coldSeats, hostReactor: preReactor, armedBefore: preArmed,
        liveBuffBefore: preBuff,
        steered: !!(arguments.length && arguments[0] && arguments[0]._qualitySteered),
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'host.rec', e); }
    if (threw) throw threw;
    return result;
  };
  const uninstall = () => {
    try { Game.hostFeast = orig; } catch (e) {}
    try { Game._hostfeastRecInstalled = false; } catch (e) {}
  };
  try {
    Game._hostfeastRecStore = store;
    Game._hostfeastRecInstalled = true;
    Game._hostfeastRecUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withHostfeastRec(inner, id, desc, store) {
  const st = store || newHostStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (recOn()) {
        try { installHostfeastRec(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._hostfeast = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
    upkeep(Game, ctx) {
      if (recOn()) {
        try { installHostfeastRec(Game, st); } catch (e) { noteErr(st, 'upkeep.install', e); }
        try { ctx._hostfeast = st; } catch (e) { noteErr(st, 'upkeep.ctx', e); }
      }
      if (inner.upkeep) return inner.upkeep(Game, ctx);
      return undefined;
    },
  });
}

// trySteeredRefreshFeast: the steering leg. Returns the hostFeast
// report when it hosts, null when it does not intervene (every
// non-intervention path returns null — the caller then delegates
// untouched). Never throws into the engine: any error is counted
// on ctx and the leg stands down for that upkeep.
function trySteeredRefreshFeast(Game, ctx, store) {
  try {
    if (!steeringOn()) return null;
    if (Game.dayPart !== 2) return null; // dusk only
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (s.feastDay === day) return null; // one feast a day (game rule)
    if (ctx._qrHostDay === day) return null; // already steered today
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return null;
    if (!(s.prog && s.prog.feastSurge)) return null; // unarmed: no grant possible
    try { if (Game.fusionReactorOnline && Game.fusionReactorOnline()) return null; } catch (e) {}
    const live = liveBuffDirect(Game);
    if (!live) return null; // fresh, not refresh: NEVER steered
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) { return null; }
    if (!plan || !plan.ok) return null;
    const guests = Array.isArray(plan.guests) ? plan.guests : [];
    const invitable = guests.filter(g => g.status !== 'hostile');
    if (!invitable.length) return null;
    const reactorGuests = [], cleanGuests = [];
    for (const g of invitable) {
      if (isReactorGuest(Game, g.vid, store)) reactorGuests.push(g);
      else cleanGuests.push(g);
    }
    if (!reactorGuests.length) return null; // nothing to lift: delegate
    if (!cleanGuests.length) return null; // no clean guest list to offer
    const invited = cleanGuests.map(g => g.vid);
    const cost = Math.max(1500, 400 * (invited.length + 1));
    if (!(plan.have >= cost * 1.5)) return null; // honest buffer, subset cost
    if (recentGives(Game, ctx, 7) < 1500) return null; // contributor gate, as competent
    let rep = null;
    try { rep = Game.hostFeast({ guests: invited, _qualitySteered: true }); } catch (e) { ctx.qrHostErr = String((e && e.message) || e).slice(0, 120); return null; }
    if (rep && rep.ok) {
      ctx._qrHostDay = day;
      const recs = ctx.qrInterventions || (ctx.qrInterventions = []);
      recs.push({
        day: day, liveBuffBefore: live, reactorExcluded: reactorGuests.map(g => String(g.vid)),
        invited: invited.map(String), cost: cost, planHave: plan.have,
        quality: (rep.quality != null ? rep.quality : null), spent: (rep.spent != null ? rep.spent : null),
        buffGranted: (rep.buffGranted != null ? !!rep.buffGranted : null),
      });
    }
    return rep;
  } catch (e) {
    try { ctx.qrSteerErr = String((e && e.message) || e).slice(0, 120); } catch (e2) {}
    return null;
  }
}

const qualityrefresh = Object.assign({}, feastrefresh, {
  id: 'qualityrefresh',
  desc: 'feastrefresh (daily cadence + drive-off) + refresh-guest steering: exclude reactor guests on refresh feasts (QUALITYREFRESH=1; default off = feastrefresh)',
  upkeep(Game, ctx) {
    if (recOn()) {
      try {
        const st = ctx._hostfeast || null;
        // The recorder store lives on ctx once installed; install here
        // (upkeep-first) when not yet installed so the steered feast
        // itself is recorded.
        if (!Game._hostfeastRecInstalled) {
          // withHostfeastRec's daily installs on its own store; here we
          // install a fresh store only if no store exists yet — the
          // sweep wires the store via daily, so prefer reusing it.
          if (st) installHostfeastRec(Game, st);
        }
      } catch (e) {}
    }
    // Steering FIRST (it hosts the refresh feast itself), then the
    // feastrefresh upkeep (drive-off pre-check + competent upkeep,
    // which skips feasting because s.feastDay is now today).
    trySteeredRefreshFeast(Game, ctx, ctx._hostfeast || null);
    return feastrefresh.upkeep(Game, ctx);
  },
  daily(Game, ctx) {
    return feastrefresh.daily(Game, ctx);
  },
  pending(Game, ctx) {
    return feastrefresh.pending(Game, ctx);
  },
});

module.exports = {
  qualityrefresh, steeringOn, recOn, newHostStore, installHostfeastRec,
  withHostfeastRec, liveBuffDirect, isReactorGuest, trySteeredRefreshFeast, MAX_EVENTS,
};
