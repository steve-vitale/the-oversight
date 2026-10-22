#!/usr/bin/env node
// prodrebound-b2-instruments.js — DECISION-LEVEL attribution instruments for
// sim-prodrebound-b2 (loop B, run fleshout-loop-b-20261021T2130Z).
//
// Answers sim-findings #570 (claimed by this arm): DIAGNOSTIC — why does the
// village over-produce into gluts it cannot eat?
//
// Extends the landed sim-glutprobe-b instrument (scripts/probe-glut-instruments.js,
// call-path CHANNEL attribution) with DECISION-level attribution:
//   WHO decided to produce (which villager, which duty pick, which funnel decision),
//   WHAT pantry sensor they read (or failed to read),
//   WHEN (pantry fresh-days at decision time).
//
// The glutprobe instrument's honest limit: it attributes to CHANNELS, not to
// the decision that fired. This module fixes that: every choke-point deposit
// (stockPantry / stockSurplus / depositPantryPieces) is linked to a NAMED
// decision point (DP) with an actor and the sensor reads the decision's code
// path actually consulted.
//
// ATTACH ORDER (important): attachDecision(Game) FIRST (inner wraps), then
// the base attachProbe(Game) (outer wraps). Base's channel records remain the
// instrument-of-record; the proof cross-checks sum(decEvents.kcal) against
// base's chokeTotal and per-day sums.
//
// Zero src/js changes. All wraps call through exactly once and return the
// original result. Bookkeeping lives only in W — NO writes to game state or
// Game object fields, NO extra Math.random draws (displayName verified
// RNG-pure, 2026-10-21). Any internal error increments W.instrumentErrors
// (DIAG-GO requires 0) and the original engine call still completes.
'use strict';

const { fallbackChannel, dayOf, pantryKcal } = require('./probe-glut-instruments');

// Named decision-point taxonomy. DPs are named code mechanisms, not channels:
// a DP is the exact place in code where a villager/system "decided" to move
// food into the pantry. Anything not reachable from a named DP is 'unexplained'.
const CHANNEL_DP = {
  share_surplus: 'funnel.share',
  'internal:meal': 'internal.meal',
  away_wild: 'away.return',
  scholar_home: 'scholar.homecoming',
  'ambient:villagelives': 'ambient.bighaul',
  traps: 'traps.check',
  'haul:field': 'haul.field',
  quest: 'quest.resolve',
  'events:ambient': 'events.ambient',
  'events:special': 'events.special',
  aid_system: 'aid.delivery',
  donation: 'donation.deposit',
  tribute: 'tribute.deposit',
  system: 'system.grant',
};

function trustBand(trust) {
  if (trust < 30) return '0.2';
  if (trust < 60) return '0.5';
  if (trust < 80) return '0.8';
  return '1.0';
}

function attachDecision(Game) {
  const W = {
    decStack: [],        // decision-context stack (top = current decision)
    chStack: [],         // parallel channel stack (mirrors base taxonomy)
    eventSeq: 0,
    decEvents: [],       // one per choke-point deposit: {id,day,channel,kcal,dp,actor,sensor,detail}
    govEvents: [],       // kcal=0 governor decisions: throttle redirects/exemptions
    capTrimEvents: [],   // funnel shares trimmed by the pantry cap (stockSurplus return < nominal)
    preservationEvents: [], // cook smoke-drive per-assignment (not pantry inflow — separate array)
    donationEvents: [],  // donateToPantry intake/storage decisions
    sensorReads: {},     // dp -> {freshDays, freshKcal, throttle, surplusFeed}
    instrumentErrors: 0,
  };
  const err = (where, e) => {
    W.instrumentErrors++;
    try { W['err_' + where] = String((e && e.stack) || e).slice(0, 300); } catch (e2) {}
  };
  const top = () => (W.decStack.length ? W.decStack[W.decStack.length - 1] : null);
  const curCh = () => (W.chStack.length ? W.chStack[W.chStack.length - 1] : null);
  // Dawn context: the base probe's dawnSamples (the engine's own framing of
  // what the day's duties know). The sweep/proof links the base W after both
  // attach via W.linkBase(W1). Until linked (or on day 1 before first sleep)
  // the sensor context is honestly null.
  const lastDawn = () => {
    try {
      const ds = W._baseW && W._baseW.dawnSamples;
      return (ds && ds.length) ? ds[ds.length - 1] : null;
    } catch (e) { return null; }
  };

  function sensorCtx() {
    const dl = lastDawn();
    return {
      freshDays: dl ? dl.freshDays : null,
      doomedKcal: dl ? dl.doomedKcal : null,
      pantryKcal: dl ? dl.pantryKcal : null,
      codeReadFreshDays: false,   // set true if the decision path called pantryFreshDays()/prodThrottleEngaged
      codeReadFreshKcal: false,
      codeReadDoomed: false,      // no engine path reads doomedKcal — stays false by construction
      crisisLeg: null,            // funnel.share only: pantryKcal<5000 crisis read
      trustBand: null,            // funnel.share only
    };
  }
  function pushDec(dp, actor, extra) {
    const ctx = { dp, actor: actor || null, sensor: sensorCtx(), detail: {} };
    if (extra) Object.assign(ctx.detail, extra);
    W.decStack.push(ctx);
    return ctx;
  }
  function popDec() { W.decStack.pop(); }
  function actorOf(vid) {
    if (!vid) return null;
    try {
      const name = Game.displayName ? Game.displayName(vid) : String(vid);
      return { vid: String(vid), name: String(name).slice(0, 40) };
    } catch (e) { err('actorOf', e); return { vid: String(vid), name: '?' }; }
  }
  function bumpSensor(dp, sensor) {
    const cell = W.sensorReads[dp] || (W.sensorReads[dp] = { freshDays: 0, freshKcal: 0, throttle: 0, surplusFeed: 0 });
    if (cell[sensor] !== undefined) cell[sensor]++;
  }

  // --- sensor hooks: mark WHICH decision had the pantry sensor on its stack.
  // These fire only when engine code actually consults the sensor. ---
  const oFreshDays = Game.pantryFreshDays;
  if (typeof oFreshDays === 'function') Game.pantryFreshDays = function () {
    try {
      const t = top();
      if (t) { t.sensor.codeReadFreshDays = true; bumpSensor(t.dp, 'freshDays'); }
    } catch (e) { err('pantryFreshDays', e); }
    return oFreshDays.apply(this, arguments);
  };
  const oFreshKcal = Game.pantryFreshKcal;
  if (typeof oFreshKcal === 'function') Game.pantryFreshKcal = function () {
    try {
      const t = top();
      if (t) { t.sensor.codeReadFreshKcal = true; bumpSensor(t.dp, 'freshKcal'); }
    } catch (e) { err('pantryFreshKcal', e); }
    return oFreshKcal.apply(this, arguments);
  };
  const oThr = Game.prodThrottleEngaged;
  if (typeof oThr === 'function') Game.prodThrottleEngaged = function () {
    let r = false;
    try { r = !!oThr.apply(this, arguments); } catch (e) { err('prodThrottleEngaged-call', e); }
    try {
      const t = top();
      if (t) { t.sensor.codeReadFreshDays = true; bumpSensor(t.dp, 'throttle'); t.detail.throttleResult = r; }
    } catch (e) { err('prodThrottleEngaged-mark', e); }
    return r;
  };
  const oExempt = Game.prodThrottleHungerExempt;
  if (typeof oExempt === 'function') Game.prodThrottleHungerExempt = function () {
    let r = false;
    try { r = !!oExempt.apply(this, arguments); } catch (e) { err('exempt-call', e); }
    try {
      const t = top();
      if (t && r) { t.detail.hungerExempt = true; }
    } catch (e) { err('exempt-mark', e); }
    return r;
  };
  const oSFG = Game.surplusFeedGovernor;
  if (typeof oSFG === 'function') Game.surplusFeedGovernor = function (v, give) {
    let r;
    try { r = oSFG.apply(this, arguments); } catch (e) { err('sfg-call', e); r = give; }
    try {
      const t = top();
      if (t) { bumpSensor(t.dp, 'surplusFeed'); t.detail.surplusFeedGoverned = (Number(r) !== Number(give)); }
    } catch (e) { err('sfg-mark', e); }
    return r;
  };

  // --- decision event emitter: one per choke-point deposit, linked to the
  // top decision context. Called from the inner choke wrappers. ---
  function emitDecision(channel, kcal, name, opts) {
    if (!(kcal > 0)) return;
    try {
      const t = top();
      let dp, actor = null, sensor, detail = {};
      if (t) {
        dp = t.dp; actor = t.actor; sensor = t.sensor; detail = t.detail;
        // away.return EXACT actor attribution (2026-10-22): the engine tags
        // every forage-return deposit with the returner's harvestShares
        // ({[rid]:1} via harvestOrigin). No prediction, no FIFO — the deposit
        // names its depositor. Deposits without the tag (e.g. agency
        // 'Expedition haul') keep actor=null honestly.
        if (t.dp === 'away.return' && opts && opts.harvestShares) {
          try {
            const keys = Object.keys(opts.harvestShares);
            if (keys.length) actor = actorOf(keys[0]);
          } catch (e2) {}
        }
      } else {
        dp = CHANNEL_DP[channel] || 'unexplained';
        sensor = sensorCtx();
      }
      // duty channel suffix without a decCtx (should not happen — honest fallback)
      if (!t && String(channel).indexOf('duty:') === 0) dp = 'duty.assign:' + channel.slice(5);
      W.eventSeq++;
      W.decEvents.push({
        id: W.eventSeq,
        day: dayOf(Game),
        channel,
        kcal,
        dp,
        actor,
        sensor: Object.assign({}, sensor),
        detail: JSON.parse(JSON.stringify(detail || {})),
      });
    } catch (e) { err('emitDecision', e); }
  }

  // --- inner choke wrappers (attach BEFORE base) ---
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    let r;
    try { r = oStock.apply(this, arguments); } catch (e) { err('stockPantry-call', e); throw e; }
    try {
      const k = Math.round(Number(kcal) || 0);
      if (k > 0) {
        const ch = curCh() || fallbackChannel(name);
        emitDecision(ch, k, name, opts);
      }
    } catch (e) { err('stockPantry-emit', e); }
    return r;
  };
  // stockSurplus entry: the funnel's share decision sees the POST-MEAL pantry
  // (the meal draw happens earlier in villagerMealDay). Refresh the crisis-leg
  // input on the decision context right before the event is emitted, so the
  // event records what the engine's `pantryKcal < 5000` read saw.
  const refreshShareCrisis = (t) => {
    try {
      if (t && t.dp === 'funnel.share') {
        const pk = Math.round(pantryKcal(Game));
        t.sensor.crisisLeg = pk < 5000;
        t.detail.pantryKcalAtShare = pk;
      }
    } catch (e) { err('refreshShareCrisis', e); }
  };
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { err('stockSurplus-call', e); throw e; }
    try {
      const nominal = Math.round(Number(give) || 0);
      const k = Math.round(Number(r) || 0);
      const ch = curCh() || 'share_surplus';
      const t0 = top();
      refreshShareCrisis(t0);
      if (k > 0) emitDecision(ch, k, 'share_surplus');
      // cap-trim: the pantry cap door bound — nominal > stored. WHERE does
      // the refused kcal go? CAPDOOR=1: villager eats it (fate 'eaten').
      // Default: it evaporates (fate 'evaporated') — honest measure.
      if (nominal > k) {
        const t = top();
        let capdoorOn = false;
        try { capdoorOn = (typeof process !== 'undefined' && process.env && process.env.CAPDOOR === '1'); } catch (e2) {}
        W.capTrimEvents.push({
          day: dayOf(Game),
          dp: t ? t.dp : 'share_surplus',
          actor: t ? t.actor : null,
          nominalKcal: nominal, storedKcal: k, lostKcal: nominal - k,
          fate: capdoorOn ? 'eaten' : 'evaporated',
        });
      }
    } catch (e) { err('stockSurplus-emit', e); }
    return r;
  };
  const oDep = Game.depositPantryPieces;
  if (typeof oDep === 'function') Game.depositPantryPieces = function (v, src, pieceKcal) {
    let dep = 0;
    try { dep = oDep.apply(this, arguments); } catch (e) { err('deposit-call', e); throw e; }
    try {
      const k = Math.round(Number(dep) || 0);
      if (k > 0) {
        const ch = curCh() || fallbackChannel(src && src.name);
        emitDecision(ch, k, src && src.name);
      }
    } catch (e) { err('deposit-emit', e); }
    return dep;
  };

  // --- DP entry wrappers: push decision ctx + parallel channel ---

  // funnel.share — villagerMealDay: the autonomous surplus-share decision.
  // Decision inputs are read-only: trust band (deterministic from v.trust),
  // the crisis leg's pantryKcal read (<5000 doubles the trust share), and
  // the per-day contribLog/gives deltas the engine itself writes.
  const oVMD = Game.villagerMealDay;
  if (typeof oVMD === 'function') Game.villagerMealDay = function (vid, person, v, ctx) {
    let t = null;
    try {
      const vv = v || {};
      const trust = (vv.trust && vv.trust[vid] !== undefined) ? vv.trust[vid] : 10;
      let pk = 0;
      try { pk = pantryKcal(Game); } catch (e2) {}
      t = pushDec('funnel.share', actorOf(vid));
      t.sensor.crisisLeg = pk < 5000;
      t.sensor.trustBand = trustBand(trust);
      t.detail.trust = trust;
      t.detail.pantryKcalAtDecision = Math.round(pk);
      try { t.detail.gives0 = Math.round((vv.gives || {})[vid] || 0); } catch (e2) {}
      W.chStack.push('share_surplus');
    } catch (e) { err('vmd-entry', e); }
    let r;
    try { r = oVMD.apply(this, arguments); } catch (e) { err('vmd-call', e); throw e; }
    try {
      if (t) {
        try {
          const vv = v || {};
          const gives1 = Math.round((vv.gives || {})[vid] || 0);
          t.detail.gaveKcal = Math.max(0, gives1 - (t.detail.gives0 || 0));
          const log = (vv.contribLog || {})[vid];
          if (log) { t.detail.producedKcal = log.produced || 0; t.detail.expectedKcal = log.expected || 0; }
          // Backfill: the decision events for this villager's share were
          // emitted during the call (detail cloned then); now that the
          // engine's own ledger (gives/contribLog) is readable, stamp the
          // decision inputs onto today's events for this villager.
          const today = dayOf(Game);
          for (let i = W.decEvents.length - 1; i >= 0; i--) {
            const ev = W.decEvents[i];
            if (ev.day !== today) break;
            if (ev.dp === 'funnel.share' && ev.actor && ev.actor.vid === String(vid)) {
              ev.detail.gaveKcal = t.detail.gaveKcal;
              ev.detail.producedKcal = t.detail.producedKcal;
              ev.detail.expectedKcal = t.detail.expectedKcal;
            }
          }
        } catch (e2) { err('vmd-exit-read', e2); }
      }
    } catch (e) { err('vmd-exit', e); }
    finally {
      try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
      try { popDec(); } catch (e) {}
    }
    return r;
  };

  // duty.assign:<task> — resolveOneAssignment: the duty pick + PRODTHROTTLE
  // redirect leg. The redirect itself is a kcal=0 governor decision
  // (govEvents); inflow under the recursion lands on duty.assign:<alt-task>.
  const oROA = Game.resolveOneAssignment;
  if (typeof oROA === 'function') Game.resolveOneAssignment = function (vid, a) {
    const task = (a && a.task) || '?';
    let t = null, isCook = false, beforePres = null;
    try {
      t = pushDec('duty.assign:' + task, actorOf(vid));
      t.detail.task = task;
      try {
        // NOTE: this pantryFreshDays() read is the INSTRUMENT's own
        // decision-context snapshot, not the engine's. The sensor hook fires
        // with this decCtx on the stack, so subtract the instrument's own
        // read back out of both the flag and the per-DP counter — the flag
        // must answer "did the ENGINE's decision path read it".
        const fd = Game.pantryFreshDays ? +Number(Game.pantryFreshDays()).toFixed(3) : null;
        t.detail.freshDaysAtDecision = fd;
        t.sensor.codeReadFreshDays = false;
        const cell = W.sensorReads[t.dp];
        if (cell && cell.freshDays > 0) cell.freshDays--;
      } catch (e2) { err('roa-fd-read', e2); }
      W.chStack.push('duty:' + task);
      isCook = task === 'cook';
      if (isCook) {
        beforePres = new Map();
        try {
          for (const it of (((Game.state || {}).village || {}).pantry) || []) {
            if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
              beforePres.set(it, (it.kcalEach || 0) * (it.units || 1));
          }
        } catch (e2) {}
      }
    } catch (e) { err('roa-entry', e); }
    let r;
    try { r = oROA.apply(this, arguments); } catch (e) { err('roa-call', e); throw e; }
    try {
      if (t) {
        const taskAfter = (a && a.task) || '?';
        t.detail.taskAfter = taskAfter;
        if (taskAfter !== task) {
          // PRODTHROTTLE redirect (or another retask): the named governor
          // decision — kcal=0, recorded separately from inflow events.
          W.govEvents.push({
            day: dayOf(Game), dp: 'throttle.redirect', actor: t.actor,
            detail: { from: task, to: taskAfter, freshDays: t.detail.freshDaysAtDecision, throttleResult: t.detail.throttleResult },
          });
        }
        if (t.detail.hungerExempt) {
          W.govEvents.push({
            day: dayOf(Game), dp: 'throttle.exempt', actor: t.actor,
            detail: { task, freshDays: t.detail.freshDaysAtDecision },
          });
        }
        if (isCook && beforePres) {
          let preserved = 0, laundered = 0;
          try {
            for (const it of (((Game.state || {}).village || {}).pantry) || []) {
              if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) {
                const k = (it.kcalEach || 0) * (it.units || 1);
                const prev = beforePres.get(it) || 0;
                if (k > prev) {
                  preserved += k - prev;
                  try { if (Game.isSpoiled && Game.isSpoiled(it)) laundered++; } catch (e2) {}
                }
              }
            }
          } catch (e2) { err('roa-cook-scan', e2); }
          if (preserved > 0) {
            W.preservationEvents.push({
              day: dayOf(Game), dp: 'cook.smokedrive', actor: t.actor,
              freshDays: t.detail.freshDaysAtDecision, preservedKcal: Math.round(preserved), laundered,
            });
          }
        }
      }
    } catch (e) { err('roa-exit', e); }
    finally {
      try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
      try { popDec(); } catch (e) {}
    }
    return r;
  };

  // away.return — npcNodeTravel: the away-return decision context. Actor
  // attribution is EXACT (2026-10-22): the engine tags every forage-return
  // deposit with the returner's harvestShares ({[rid]:1}), read at emit time
  // in emitDecision — no prediction, no FIFO queue. (The old prediction model
  // spurious-errored on rare no-deposit returns.)
  const oNT = Game.npcNodeTravel;
  if (typeof oNT === 'function') Game.npcNodeTravel = function () {
    let t = null;
    try {
      t = pushDec('away.return', null);
      W.chStack.push('away_wild');
    } catch (e) { err('nt-entry', e); }
    let r;
    try { r = oNT.apply(this, arguments); } catch (e) { err('nt-call', e); throw e; }
    try {
      if (t) {
        // record who actually returned (all purposes) for the audit trail:
        // diff the away ledger across the call (read-only).
        try {
          const awayAfter = ((Game.state || {}).village || {}).away || {};
          t.detail.nAwayAfter = Object.keys(awayAfter).length;
        } catch (e2) { err('nt-exit-diff', e2); }
      }
    } catch (e) { err('nt-exit', e); }
    finally {
      try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
      try { popDec(); } catch (e) {}
    }
    return r;
  };

  // scholar.homecoming — returnToVillage / returnToOldVillage.
  const oRTV = Game.returnToVillage;
  if (typeof oRTV === 'function') Game.returnToVillage = function () {
    let actor = null;
    try { actor = actorOf(Game.villagerId || ((Game.state || {}).scholar || {}).villagerId); } catch (e) { err('rtv-actor', e); }
    try { pushDec('scholar.homecoming', actor); W.chStack.push('scholar_home'); } catch (e) { err('rtv-entry', e); }
    let r;
    try { r = oRTV.apply(this, arguments); } catch (e) { err('rtv-call', e); throw e; }
    try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
    try { popDec(); } catch (e) {}
    return r;
  };
  const oRTOV = Game.returnToOldVillage;
  if (typeof oRTOV === 'function') Game.returnToOldVillage = function () {
    let actor = null;
    try { actor = actorOf(Game.villagerId || ((Game.state || {}).scholar || {}).villagerId); } catch (e) { err('rtov-actor', e); }
    try { pushDec('scholar.homecoming', actor); W.chStack.push('scholar_home'); } catch (e) { err('rtov-entry', e); }
    let r;
    try { r = oRTOV.apply(this, arguments); } catch (e) { err('rtov-call', e); throw e; }
    try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
    try { popDec(); } catch (e) {}
    return r;
  };

  // ambient.bighaul — villageLives (BIG DAY etc.). The say-line names the
  // villager; matched by kcal on the way out (see stockPantry note below).
  const oVL = Game.villageLives;
  if (typeof oVL === 'function') Game.villageLives = function () {
    try { pushDec('ambient.bighaul', null); W.chStack.push('ambient:villagelives'); } catch (e) { err('vl-entry', e); }
    let r;
    try { r = oVL.apply(this, arguments); } catch (e) { err('vl-call', e); throw e; }
    try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
    try { popDec(); } catch (e) {}
    return r;
  };

  // traps.check / haul.field — objReturnEffect purpose flag.
  const oORE = Game.objReturnEffect;
  if (typeof oORE === 'function') Game.objReturnEffect = function (vid, purpose) {
    try {
      const ch = purpose === 'traps' ? 'traps' : purpose === 'haul' ? 'haul:field' : 'objectives:' + (purpose || '?');
      const dp = purpose === 'traps' ? 'traps.check' : purpose === 'haul' ? 'haul.field' : 'objectives.' + (purpose || '?');
      pushDec(dp, actorOf(vid));
      W.chStack.push(ch);
    } catch (e) { err('ore-entry', e); }
    let r;
    try { r = oORE.apply(this, arguments); } catch (e) { err('ore-call', e); throw e; }
    try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
    try { popDec(); } catch (e) {}
    return r;
  };

  // internal.meal — villageMeal (leftovers re-deposit).
  const oVM = Game.villageMeal;
  if (typeof oVM === 'function') Game.villageMeal = function () {
    try { pushDec('internal.meal', null); W.chStack.push('internal:meal'); } catch (e) { err('vm-entry', e); }
    let r;
    try { r = oVM.apply(this, arguments); } catch (e) { err('vm-call', e); throw e; }
    try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
    try { popDec(); } catch (e) {}
    return r;
  };

  // quest / events / aid wrappers (named DPs, system-level actors).
  const namedWrap = (method, dp, ch) => {
    const o = Game[method];
    if (typeof o !== 'function') return;
    Game[method] = function () {
      try { pushDec(dp, null); W.chStack.push(ch); } catch (e) { err(method + '-entry', e); }
      let r;
      try { r = o.apply(this, arguments); } catch (e) { err(method + '-call', e); throw e; }
      try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
      try { popDec(); } catch (e) {}
      return r;
    };
  };
  namedWrap('checkQuest', 'quest.resolve', 'quest');
  namedWrap('villagerInitiative', 'events.ambient', 'events:ambient');
  namedWrap('ambientSocial', 'events.ambient', 'events:ambient');
  namedWrap('npcTakeAction', 'events.ambient', 'events:ambient');
  namedWrap('tradeRiverTrader', 'events.special', 'events:special');
  namedWrap('chooseTrialOption', 'events.special', 'events:special');
  namedWrap('evCookingLesson', 'events.special', 'events:special');
  namedWrap('inviteReward', 'aid.delivery', 'aid_system');
  namedWrap('justiceRespond', 'aid.delivery', 'aid_system');

  // donation.deposit — donateToPantry: the intake/storage decision.
  // WHERE does the food go when the pantry is bursting? pantryDonationOptions
  // is RNG-pure (verified 2026-10-21): safe to read for the decision record.
  const oDon = Game.donateToPantry;
  if (typeof oDon === 'function') Game.donateToPantry = function (idx, units) {
    let t = null, inv0 = null, choice0 = null;
    try {
      const actor = actorOf(Game.villagerId || ((Game.state || {}).scholar || {}).villagerId);
      t = pushDec('donation.deposit', actor);
      W.chStack.push('donation');
      try {
        const inv = ((Game.state || {}).scholar || {}).inventory || [];
        const item = inv[idx];
        inv0 = item ? { units: item.units, kcalEach: item.kcalEach, name: String(item.name).slice(0, 40) } : null;
        choice0 = Game.pantryDonationOptions ? Game.pantryDonationOptions(idx) : null;
        t.detail.requestedUnits = units;
        t.detail.choiceOk = !!(choice0 && choice0.ok);
        t.detail.maxUnits = choice0 ? choice0.maxUnits : 0;
        t.detail.why = choice0 && !choice0.ok ? String(choice0.why).slice(0, 120) : null;
        t.detail.freshDaysAtDecision = null;
        try {
          // instrument's own read (see duty.assign note): subtract it back out.
          const fd = Game.pantryFreshDays ? +Number(Game.pantryFreshDays()).toFixed(3) : null;
          t.detail.freshDaysAtDecision = fd;
          t.sensor.codeReadFreshDays = false;
          const cell = W.sensorReads[t.dp];
          if (cell && cell.freshDays > 0) cell.freshDays--;
        } catch (e2) { err('don-fd-read', e2); }
        t.detail.inv0 = inv0;
      } catch (e2) { err('don-entry-read', e2); }
    } catch (e) { err('don-entry', e); }
    let r = null;
    try { r = oDon.apply(this, arguments); } catch (e) { err('don-call', e); throw e; }
    try {
      if (t) {
        try {
          const inv = ((Game.state || {}).scholar || {}).inventory || [];
          const item = inv[idx];
          const inv1Units = item ? item.units : 0;
          const movedUnits = inv0 ? Math.max(0, (inv0.units || 0) - inv1Units) : 0;
          const depositedKcal = Math.round(movedUnits * (inv0 ? inv0.kcalEach : 0));
          t.detail.movedUnits = movedUnits;
          t.detail.depositedKcal = depositedKcal;
          let outcome;
          if (!t.detail.choiceOk) outcome = 'rejected-choice';
          else if (movedUnits <= 0) outcome = 'refused-cap';
          else outcome = 'deposited';
          t.detail.outcome = outcome;
          // WHERE did it go: refused → "Your food stays in your pack."
          // (donateToPantry voice). deposited → pantry (choke event exists).
          t.detail.fate = outcome === 'deposited' ? 'pantry' : 'pack';
          W.donationEvents.push({
            day: dayOf(Game), dp: 'donation.deposit', actor: t.actor,
            freshDays: t.detail.freshDaysAtDecision,
            requestedKcal: inv0 ? Math.round((units === undefined ? (choice0 ? choice0.units : 0) : units) * inv0.kcalEach) : 0,
            depositedKcal, outcome, fate: t.detail.fate,
            why: t.detail.why,
          });
        } catch (e2) { err('don-exit-read', e2); }
      }
    } catch (e) { err('don-exit', e); }
    finally {
      try { if (W.chStack.length) W.chStack.pop(); } catch (e) {}
      try { popDec(); } catch (e) {}
    }
    return r;
  };

  // Link the base probe's collector after both attach (sweep/proof do:
  // const W2 = attachDecision(Game); const W1 = attachProbe(Game); W2.linkBase(W1);)
  // so sensorCtx() reads the true dawn samples during the run.
  W.linkBase = (W1) => { W._baseW = W1; };

  return W;
}

module.exports = { attachDecision, CHANNEL_DP, trustBand };
