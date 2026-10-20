#!/usr/bin/env node
// probe-glut-instruments.js — SHARED instruments for the sim-glutprobe-b
// diagnostic (loop B, run fleshout-loop-b-20261020T1630Z).
//
// The production-rebound question (#570): which inflow channels do NOT
// throttle when the pantry is full? Dose-response per channel vs pantry
// fresh-days AND vs doomed stock; permanent-glut configs; marginal glut
// inflow attribution.
//
// Design: CALL-PATH channel attribution. The 2026-10-20 prodrebound
// observational instrument classified arrivals by item TAGS, which let
// merged stacks smear duty forage/garden/hunt yield into the
// share_surplus funnel (their honest documented limit). Here a channel
// stack is pushed by wrappers on each channel's entry function, so
// stockPantry / stockSurplus / depositPantryPieces record the kcal under
// the executing channel. Item tags (_diagCh/_diagArr) are still written
// for rot attribution, but inflow attribution never reads them.
//
// Pure telemetry wraps: every wrap calls through to the original and only
// counts. Tags touch only fields stacksMatch ignores (proven by the
// prodrebound det-gate precedent — same field names). Zero src/js changes.
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 (SURPLUSFEED unset) node <driver>
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// name fallback for paths no wrapper covers (tribute via hierarchy.js,
// weregild callbacks, etc.)
function fallbackChannel(name) {
  const n = String(name || '');
  if (/tribute/i.test(n)) return 'tribute';
  if (/wergild|weregild|restitution|buried cache|hoarder'?s interest/i.test(n)) return 'aid_system';
  if (/genesis fruit|system-replicated|trial feast|refunded trade/i.test(n)) return 'system';
  if (/remedy stores|aid from|aid crew|emergency hunt|relief/i.test(n)) return 'aid_system';
  if (/meal leftovers/i.test(n)) return 'internal:meal';
  return 'unattributed';
}

function attachProbe(Game) {
  const W = {
    chStack: [],
    inflow: {},          // channel -> total kcal (what actually entered)
    dayInflow: {},       // day -> {channel: kcal}
    chokeTotal: 0,       // independent total at the choke points
    rotFresh: 0, rotPreserved: 0,
    rotByCh: {}, rotByChFast: {},
    dutyPreserved: 0, dayDuty: {}, laundered: 0,
    throttleCalls: 0, throttleEngaged: 0, dayThrottle: {},
    starveDays: 0,
    deaths: [], deathSeen: new Set(),
    dawnSamples: [],
    sayLines: [],
  };
  const curCh = () => (W.chStack.length ? W.chStack[W.chStack.length - 1] : null);
  const bumpDay = (map, day, ch, v) => {
    if (typeof v !== 'number' || v <= 0) return;
    const d = map[day] || (map[day] = {});
    d[ch] = (d[ch] || 0) + v;
  };
  const recordInflow = (ch, kcal, name) => {
    if (!(kcal > 0)) return;
    const c = ch || fallbackChannel(name);
    const d = dayOf(Game);
    W.inflow[c] = (W.inflow[c] || 0) + kcal;
    bumpDay(W.dayInflow, d, c, kcal);
    W.chokeTotal += kcal;
  };
  const tagArrivals = (ch, before) => {
    if (!before) return;
    const d = dayOf(Game);
    try {
      for (const it of (((Game.state || {}).village || {}).pantry) || []) {
        if (it && !before.has(it) && !('_diagCh' in it)) {
          it._diagCh = ch; it._diagArr = d;
        }
      }
    } catch (e) {}
  };
  const snapPantry = () => {
    try { return new Set((((Game.state || {}).village || {}).pantry) || []); } catch (e) { return null; }
  };
  const withCh = (ch, fn, ctx, args) => {
    W.chStack.push(ch);
    try { return fn.apply(ctx, args); }
    finally { W.chStack.pop(); }
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

  // --- duty production (resolveOneAssignment) — incl. the PRODTHROTTLE
  // redirect leg, which recurses with the alt task (counted as duty:<alt>) ---
  {
    const o = Game.resolveOneAssignment;
    if (typeof o === 'function') Game.resolveOneAssignment = function (vid, a) {
      const task = (a && a.task) || '?';
      return withCh('duty:' + task, o, this, arguments);
    };
  }

  // --- the autonomous funnel: villagerDayProduction -> villagerMealDay -> stockSurplus ---
  wrap('villagerMealDay', () => 'share_surplus');
  // --- internal re-deposit (leftovers back into the pantry) ---
  wrap('villageMeal', () => 'internal:meal');
  // --- away NPC returns ---
  wrap('npcNodeTravel', () => 'away_wild');
  // --- scholar expedition homecoming ---
  wrap('returnToVillage', () => 'scholar_home');
  wrap('returnToOldVillage', () => 'scholar_home');
  // --- ambient villager life (BIG DAY hauls etc.) ---
  wrap('villageLives', () => 'ambient:villagelives');
  // --- quests / ambient events ---
  wrap('checkQuest', () => 'quest');
  wrap('villagerInitiative', () => 'events:ambient');
  wrap('ambientSocial', () => 'events:ambient');
  wrap('npcTakeAction', () => 'events:ambient');
  wrap('tradeRiverTrader', () => 'events:special');
  wrap('chooseTrialOption', () => 'events:special');
  wrap('evCookingLesson', () => 'events:special');
  // --- aid / relief systems ---
  wrap('inviteReward', () => 'aid_system');
  wrap('justiceRespond', () => 'aid_system');
  // --- donations ---
  wrap('donateToPantry', () => 'donation');
  // --- objectives returns: traps vs field hauls ---
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
      const before = snapPantry();
      const r = o.apply(this, arguments);
      try {
        const k = Math.round(Number(kcal) || 0);
        const ch = curCh() || fallbackChannel(name);
        recordInflow(ch, k, name);
        tagArrivals(ch, before);
      } catch (e) {}
      return r;
    };
  }
  // --- choke point 2: stockSurplus (the autonomous share funnel) ---
  {
    const o = Game.stockSurplus;
    if (typeof o === 'function') Game.stockSurplus = function (v, give) {
      const before = snapPantry();
      let r = 0;
      try { r = o.apply(this, arguments); } catch (e) { r = 0; }
      try {
        const k = Math.round(Number(r) || 0);
        const ch = curCh() || 'share_surplus';
        recordInflow(ch, k, 'share_surplus');
        tagArrivals(ch, before);
      } catch (e) {}
      return r;
    };
  }
  // --- choke point 3: depositPantryPieces (donations, tribute, take conversions) ---
  {
    const o = Game.depositPantryPieces;
    if (typeof o === 'function') Game.depositPantryPieces = function (v, src, pieceKcal) {
      const before = snapPantry();
      let dep = 0;
      try { dep = o.apply(this, arguments); } catch (e) { dep = 0; }
      try {
        const k = Math.round(Number(dep) || 0);
        const ch = curCh() || fallbackChannel(src && src.name);
        recordInflow(ch, k, src && src.name);
        tagArrivals(ch, before);
      } catch (e) {}
      return dep;
    };
  }

  // --- rot attribution: identity-deduped, channel by arrival tag ---
  {
    const rotCounted = new Set();
    const o = Game.sweepSpoiled;
    if (typeof o === 'function') Game.sweepSpoiled = function () {
      const rotDay = dayOf(Game);
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
            rotCounted.add(it);
            const k = (it.kcalEach || 0) * (it.units || 1);
            const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
            W[fs === 'preserved' ? 'rotPreserved' : 'rotFresh'] += k;
            const ch = it._diagCh || 'untagged';
            W.rotByCh[ch] = (W.rotByCh[ch] || 0) + k;
            const arr = (typeof it._diagArr === 'number') ? it._diagArr : null;
            if (arr !== null && (rotDay - arr) <= 3) W.rotByChFast[ch] = (W.rotByChFast[ch] || 0) + k;
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  // --- PRODTHROTTLE sensor: per day and cumulative ---
  {
    const o = Game.prodThrottleEngaged;
    if (typeof o === 'function') Game.prodThrottleEngaged = function () {
      let r = false;
      try { r = !!o.apply(this, arguments); } catch (e) {}
      try {
        const d = dayOf(Game);
        W.throttleCalls++;
        if (r) W.throttleEngaged++;
        const cell = W.dayThrottle[d] || (W.dayThrottle[d] = { calls: 0, engaged: 0 });
        cell.calls++; if (r) cell.engaged++;
      } catch (e) {}
      return r;
    };
  }

  // --- duty smoke-drive throughput (in-place fresh->preserved) + laundering ---
  {
    const o = Game.resolveOneAssignment;
    // NOTE: resolveOneAssignment is already wrapped above for the channel
    // flag; wrap the WRAPPED version to add the cook measure.
    Game.resolveOneAssignment = function (vid, a) {
      let isCook = false;
      try { isCook = (a && a.task) === 'cook'; } catch (e) {}
      let beforePres = null, beforeSpoiled = null;
      if (isCook) {
        beforePres = new Map(); beforeSpoiled = new Set();
        try {
          for (const it of (((Game.state.village || {}).pantry) || [])) {
            if (!it) continue;
            if (it.foodState === 'preserved' || it.foodState === 'rendered')
              beforePres.set(it, (it.kcalEach || 0) * (it.units || 1));
            if (Game.isSpoiled && Game.isSpoiled(it)) beforeSpoiled.add(it);
          }
        } catch (e) {}
      }
      const r = o.apply(this, arguments);
      if (isCook) {
        const d = dayOf(Game);
        try {
          for (const it of (((Game.state.village || {}).pantry) || [])) {
            if (!it) continue;
            if (it.foodState === 'preserved' || it.foodState === 'rendered') {
              const k = (it.kcalEach || 0) * (it.units || 1);
              const prev = beforePres.get(it) || 0;
              if (k > prev) {
                const add = k - prev;
                W.dutyPreserved += add;
                const cell = W.dayDuty[d] || (W.dayDuty[d] = {});
                cell.cook = (cell.cook || 0) + add;
                if (beforeSpoiled.has(it)) W.laundered++;
              }
            }
          }
        } catch (e) {}
      }
      return r;
    };
  }

  // --- dawn sensor: what the day's duties see (after sleep rolls the day).
  // doomedKcal: fresh kcal whose effective spoilDay == day+1 — rots at
  // tomorrow's dawn BEFORE any meal can touch it (the feastdraw definition). ---
  {
    const o = Game.sleep;
    if (typeof o === 'function') Game.sleep = function () {
      const r = o.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        const day = dayOf(Game);
        let freshKcal = 0, freshDays = 0, burnAvg = 0, doomedKcal = 0;
        try { freshKcal = Game.pantryFreshKcal ? Game.pantryFreshKcal() : 0; } catch (e) {}
        try { freshDays = Game.pantryFreshDays ? Game.pantryFreshDays() : 0; } catch (e) {}
        try {
          const hist = (v.burnHistory || []).filter(x => x > 0);
          if (hist.length) burnAvg = hist.reduce((a, b) => a + b, 0) / hist.length;
        } catch (e) {}
        try {
          for (const it of (v.pantry || [])) {
            if (!it) continue;
            if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') continue;
            try { if (Game.isSpoiled && Game.isSpoiled(it)) continue; } catch (e) {}
            const effSpoil = (Number(it.spoilDay) || 0) + (Number(it.granaryDays) || 0);
            if (effSpoil === day + 1) doomedKcal += (it.kcalEach || 0) * (it.units || 1);
          }
        } catch (e) {}
        W.dawnSamples.push({
          day, pantryKcal: Math.round(pantryKcal(Game)),
          freshKcal: Math.round(freshKcal), freshDays: +Number(freshDays).toFixed(3),
          doomedKcal: Math.round(doomedKcal),
          burnAvg: Math.round(burnAvg), roster: ((v.roster || []).length),
        });
      } catch (e) {}
      return r;
    };
  }

  // --- say() capture for the sense read (econ beats only, capped) ---
  {
    const o = Game.say;
    if (typeof o === 'function') Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (W.sayLines.length < 3000 && /pantry|shelf|shelves|fresh|smok|rack|spoil|forag|fish net|throttl|glut|rot\b|harvest|haul|surplus|cook/i.test(s)) {
          W.sayLines.push({ day: dayOf(Game), line: s.slice(0, 220) });
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

  return W;
}

module.exports = { attachProbe, fallbackChannel, dayOf, pantryKcal };
