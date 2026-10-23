#!/usr/bin/env node
// easingchannels-instruments-b.js — channel-attribution instruments for the
// sim-easingchannels-b decomposition (loop B, run fleshout-loop-b-20261023T1130Z).
//
// THE QUESTION: decompose the sim-plentydepri-confirm-b headline claim
// "the funnel.share/easing raw channel is throttled but away_wild
// compensates" kcal-by-kcal on a {PLENTYDEPRI=0/1}x{DEPOSITGATE=0/1} 2x2.
//
// Marginal-glut inflow taxonomy (from the landed DIAG, sim-funnelshare-b.md):
//   funnelShare      <- stockSurplus deposits via villagerMealDay (share_surplus)
//   scholarHomecoming<- returnToVillage/returnToOldVillage deposits (scholar_home)
//   tributeDeposit   <- hierarchy.js tribute receipt via depositPantryPieces (name 'Tribute ...')
//   awayReturn       <- away NPC returns; away_wild (npcNodeTravel) separated as a sub-channel
//   ambientBighaul  <- villageLives big-day haul deposits (ambient:villagelives)
//   other            <- everything else (system, duty, traps, unattributed)
//
// "Marginal-glut inflow" = pantry inflow kcal arriving on GLUT DAYS — days
// where prodThrottleEngaged() reads plentiful (the plenty definition both
// levers share). Attribution% = named-channel inflow / all choke-point
// inflow on glut days. DIAG-GO bar: >=90% on all four cells.
//
// Separations (per the task):
//   funnelShareEased  = depositgate-eased share kcal (ledger shareEased +
//                       _depositGateHoldback held for return/bigHaul)
//   awayWild          = inflow with call-path 'away_wild' (npcNodeTravel)
//   depriKcal         = _plentyDepri ledger kcal (production eased at the decision)
//
// Pure telemetry wraps: every wrap calls through and only counts. No src/js
// changes, ever. Usage: FEASTSCALE_R13=1 SEATDRIVE=0 (asserted by drivers).
'use strict';

const NAMED = ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul'];

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// name fallback for paths no wrapper covers (tribute via hierarchy.js,
// weregild callbacks, away-return named paths, etc.)
function fallbackChannel(name) {
  const n = String(name || '');
  if (/tribute/i.test(n)) return 'tribute';
  if (/wergild|weregild|restitution|buried cache|hoarder'?s interest/i.test(n)) return 'aid_system';
  if (/genesis fruit|system-replicated|trial feast|refunded trade/i.test(n)) return 'system';
  if (/remedy stores|aid from|aid crew|emergency hunt|relief/i.test(n)) return 'aid_system';
  if (/meal leftovers/i.test(n)) return 'internal:meal';
  if (/homecoming|pack meal|awayReturn/i.test(n)) return 'away_return';
  if (/big day|big-day|haul of a lifetime/i.test(n)) return 'ambient:villagelives';
  return 'unattributed';
}

// call-path label -> taxonomy channel
function taxonomy(ch) {
  if (ch === 'share_surplus') return 'funnelShare';
  if (ch === 'scholar_home') return 'scholarHomecoming';
  if (ch === 'tribute') return 'tributeDeposit';
  if (ch === 'away_wild' || ch === 'away_return') return 'awayReturn';
  if (ch === 'ambient:villagelives') return 'ambientBighaul';
  return 'other';
}

function attachEC(Game) {
  const W = {
    dayInflow: {},       // day -> {channel: kcal} (choke-point inflow, all channels incl 'other')
    glutInflow: {},      // day -> {channel: kcal} (arriving while prodThrottleEngaged() true)
    glutDaysSet: {},     // day -> 1 (had >=1 marginal-glut arrival)
    dayTotal: {},         // day -> total choke inflow kcal
    dayGlut: {},          // day -> bool (prodThrottleEngaged sampled daily — the regime measure)
    dayRoster: {},        // day -> living roster size (exposure)
    inflow: {},           // channel -> run-total kcal
    awayWild: 0,          // npcNodeTravel arrivals (sub-channel of awayReturn)
    awayWildByDay: {},
    awayWildGlut: 0,     // away_wild arrivals while the sensor read plentiful
    funnelShareEased: 0, // depositgate-eased share kcal (ledger shareEased)
    returnEased: 0,      // holdback held for away.return (kcal, from wrap)
    bigHaulEased: 0,     // holdback held for ambient.bighaul (kcal, from wrap)
    tributeWaived: 0,    // tribute waived home (kcal, from ledger)
    depriKcal: 0, depriDec: 0, depriDays: 0, // _plentyDepri ledger
    rotFresh: 0, rotPreserved: 0,
    deaths: [], deathSeen: new Set(),
    freshSeries: [],
    starveDays: 0,       // days with >=1 hunger>70 villager (raw; normalized by exposure at analysis)
    sayLines: [],
    otherRaw: {},       // raw call-path label -> kcal for 'other' inflow (diagnostic)
    glutOtherRaw: {},   // raw call-path label -> kcal for 'other' MARGINAL-GLUT inflow
  };
  const chStack = [];
  const curCh = () => (chStack.length ? chStack[chStack.length - 1] : null);
  const recordInflow = (taxCh, kcal, sub, glutNow) => {
    if (!(kcal > 0)) return;
    const d = dayOf(Game);
    const k = Math.round(kcal);
    W.inflow[taxCh] = (W.inflow[taxCh] || 0) + k;
    const cell = (W.dayInflow[d] = W.dayInflow[d] || {});
    cell[taxCh] = (cell[taxCh] || 0) + k;
    W.dayTotal[d] = (W.dayTotal[d] || 0) + k;
    if (taxCh === 'other') W.otherRaw[sub || 'none'] = (W.otherRaw[sub || 'none'] || 0) + k;
    if (sub === 'away_wild') {
      W.awayWild += k;
      W.awayWildByDay[d] = (W.awayWildByDay[d] || 0) + k;
    }
    // MARGINAL-GLUT: inflow arriving while the plenty sensor read engaged
    // BEFORE this deposit landed (pre-deposit sample — a post-deposit
    // sample would count the deposit that CREATED the glut as marginal).
    // The DIAG's own definition: unconditional deposit decisions firing
    // into an already-full pantry. Duty production is redirected by
    // PRODTHROTTLE, so it should NOT appear here if the redirect works.
    if (glutNow) {
      const g = (W.glutInflow[d] = W.glutInflow[d] || {});
      g[taxCh] = (g[taxCh] || 0) + k;
      W.glutDaysSet[d] = 1;
      if (sub === 'away_wild') W.awayWildGlut += k;
      if (taxCh === 'other') W.glutOtherRaw[sub || 'none'] = (W.glutOtherRaw[sub || 'none'] || 0) + k;
    }
  };
  const withCh = (ch, fn, ctx, args) => {
    chStack.push(ch);
    try { return fn.apply(ctx, args); }
    finally { chStack.pop(); }
  };
  const wrap = (method, chFn) => {
    const o = Game[method];
    if (typeof o !== 'function') return;
    Game[method] = function () {
      const ch = chFn ? chFn.apply(this, arguments) : null;
      if (ch) return withCh(ch, o, this, arguments);
      return o.apply(this, arguments);
    };
  };

  // --- channel entry wrappers ---
  wrap('villagerMealDay', () => 'share_surplus');
  wrap('villageMeal', () => 'internal:meal');
  wrap('npcNodeTravel', () => 'away_wild');
  wrap('returnToVillage', () => 'scholar_home');
  wrap('returnToOldVillage', () => 'scholar_home');
  wrap('villageLives', () => 'ambient:villagelives');
  wrap('checkQuest', () => 'quest');
  wrap('villagerInitiative', () => 'events:ambient');
  wrap('ambientSocial', () => 'events:ambient');
  wrap('npcTakeAction', () => 'events:ambient');
  wrap('tradeRiverTrader', () => 'events:special');
  wrap('chooseTrialOption', () => 'events:special');
  wrap('evCookingLesson', () => 'events:special');
  wrap('inviteReward', () => 'aid_system');
  wrap('justiceRespond', () => 'aid_system');
  wrap('donateToPantry', () => 'donation');
  {
    const o = Game.resolveOneAssignment;
    if (typeof o === 'function') Game.resolveOneAssignment = function (vid, a) {
      const task = (a && a.task) || '?';
      return withCh('duty:' + task, o, this, arguments);
    };
  }
  {
    const o = Game.objReturnEffect;
    if (typeof o === 'function') Game.objReturnEffect = function (vid, purpose) {
      const ch = purpose === 'traps' ? 'traps' : purpose === 'haul' ? 'haul:field' : 'objectives:' + (purpose || '?');
      return withCh(ch, o, this, arguments);
    };
  }

  // --- choke point 1: stockPantry (external fresh arrivals) ---
  {
    const o = Game.stockPantry;
    if (typeof o === 'function') Game.stockPantry = function (kcal, name, opts) {
      let glutNow = false;
      try { glutNow = !!Game.prodThrottleEngaged(); } catch (e) {}
      const r = o.apply(this, arguments);
      try {
        const k = Math.round(Number(kcal) || 0);
        const ch = curCh() || fallbackChannel(name);
        const tax = taxonomy(ch);
        recordInflow(tax, k, ch, glutNow);
      } catch (e) {}
      return r;
    };
  }
  // --- choke point 2: stockSurplus (the autonomous share funnel) ---
  {
    const o = Game.stockSurplus;
    if (typeof o === 'function') Game.stockSurplus = function (v, give) {
      let glutNow = false;
      try { glutNow = !!Game.prodThrottleEngaged(); } catch (e) {}
      let r = 0;
      try { r = o.apply(this, arguments); } catch (e) { r = 0; }
      try {
        const k = Math.max(0, Math.round(Number(r) || 0));
        const ch = curCh() || 'share_surplus';
        const tax = taxonomy(ch);
        recordInflow(tax, k, ch, glutNow);
      } catch (e) {}
      return r;
    };
  }
  // --- choke point 3: depositPantryPieces (donations, tribute, take conversions) ---
  {
    const o = Game.depositPantryPieces;
    if (typeof o === 'function') Game.depositPantryPieces = function (v, src, pieceKcal) {
      let glutNow = false;
      try { glutNow = !!Game.prodThrottleEngaged(); } catch (e) {}
      let dep = 0;
      try { dep = o.apply(this, arguments); } catch (e) { dep = 0; }
      try {
        const k = Math.max(0, Math.round(Number(dep) || 0));
        const ch = curCh() || fallbackChannel(src && src.name);
        const tax = taxonomy(ch);
        recordInflow(tax, k, ch, glutNow);
      } catch (e) {}
      return dep;
    };
  }

  // --- eased-share separation: _depositGateHoldback held kcal by kind ---
  {
    const o = Game._depositGateHoldback;
    if (typeof o === 'function') Game._depositGateHoldback = function (vid, kcal, kind) {
      let held = 0;
      try { held = o.apply(this, arguments) || 0; } catch (e) { held = 0; }
      try {
        const h = Math.max(0, Math.round(Number(held) || 0));
        if (h > 0) {
          if (kind === 'return') W.returnEased += h;
          else W.bigHaulEased += h;
        }
      } catch (e) {}
      return held;
    };
  }

  // --- rot attribution: identity-deduped ---
  {
    const rotCounted = new Set();
    const o = Game.sweepSpoiled;
    if (typeof o === 'function') Game.sweepSpoiled = function () {
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
            rotCounted.add(it);
            const k = (it.kcalEach || 0) * (it.units || 1);
            const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
            W[fs === 'preserved' ? 'rotPreserved' : 'rotFresh'] += k;
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  // --- deaths: kind-aware, dedup on (who,day,cause) ---
  {
    const o = Game.registerDeath;
    if (typeof o === 'function') Game.registerDeath = function (opts) {
      try {
        const kind = String((opts && opts.kind) || '');
        if (kind === 'person' || kind === 'villager') {
          const who = String((opts && (opts.villagerId || opts.name)) || '?');
          const day = dayOf(Game);
          const cause = canonCause((opts && opts.cause) || '?');
          const key = who + '|' + day + '|' + cause;
          if (!W.deathSeen.has(key)) {
            W.deathSeen.add(key);
            W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  // --- say() capture for the sense read (econ beats only, capped) ---
  {
    const o = Game.say;
    if (typeof o === 'function') Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (W.sayLines.length < 4000 && /pantry|shelf|shelves|fresh|smok|rack|spoil|forag|throttl|glut|rot\b|harvest|haul|surplus|cook|firewood|wagons|tribute|the wild|eat well/i.test(s)) {
          W.sayLines.push({ day: dayOf(Game), line: s.slice(0, 220) });
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  // --- daily sampler: glut sensor, roster exposure, freshDays, hunger ---
  function daily(G) {
    try {
      const d = dayOf(G);
      let glut = false;
      try { glut = !!G.prodThrottleEngaged(); } catch (e) {}
      W.dayGlut[d] = glut;
      const roster = (((G.state || {}).village || {}).roster) || [];
      let living = 0;
      try {
        for (const id of roster) {
          const p = G.getPerson ? G.getPerson(id) : null;
          if (p && !p.dead) living++;
        }
        if (living === 0 && roster.length) living = roster.length; // getPerson fallback
      } catch (e) { living = roster.length; }
      W.dayRoster[d] = living;
      if (G.pantryFreshDays) W.freshSeries.push(G.pantryFreshDays());
      let hungry = 0;
      try {
        for (const id of roster) {
          try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
        }
      } catch (e) {}
      if (hungry > 0) W.starveDays++;
    } catch (e) {}
  }

  // --- ledgers: read at the end of the run ---
  function readLedgers(Game) {
    try {
      const lg = (Game.state.village || {})._plentyDepri;
      if (lg) for (const d of Object.values(lg.days || {})) {
        W.depriDays++; W.depriDec += (d.depri || 0); W.depriKcal += (d.kcal || 0);
      }
    } catch (e) {}
    try {
      const dg = (Game.state.village || {})._depositGate;
      if (dg) for (const d of Object.values(dg.days || {})) {
        W.funnelShareEased += (d.shareEased || 0);
        W.tributeWaived += (d.tributeWaived || 0);
        // NOTE: returnEased/bigHaulEased in the ledger are COUNTS, not kcal —
        // kcal comes from the _depositGateHoldback wrap above.
      }
    } catch (e) {}
  }

  return { W, daily, readLedgers, NAMED, taxonomy };
}

module.exports = { attachEC, dayOf, canonCause, fallbackChannel, taxonomy, NAMED };
