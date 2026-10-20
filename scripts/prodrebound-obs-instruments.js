#!/usr/bin/env node
// prodrebound-obs-instruments.js — SHARED observational instruments for the
// sim-prodrebound-b diagnostic (arm, run fleshout-loop-b-20261020TxxxxxxZ).
//
// Used by scripts/sweep-prodrebound-b-obs.js and scripts/test-prodrebound-b.js.
// Pure telemetry wraps: every wrap calls through to the original and only
// counts/tags. Zero src/js changes. Tags (_diagCh/_diagArr) touch only
// untracked fields stacksMatch ignores, so trajectories are RNG-clean
// (proven by the det-gate in test-prodrebound-b.js).
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

// channel classifier: duty flag > return purpose > name classification
function classifyChannel(dt, rp, name) {
  const n = String(name || '');
  if (dt) return 'duty_' + dt;
  if (rp === 'haul') return 'haul_field';
  if (rp === 'traps' || /snared/i.test(n)) return 'traps';
  if (/meal leftovers/i.test(n)) return 'leftovers';
  if (/system-replicated|trial feast|genesis fruit|refunded/i.test(n)) return 'system';
  if (/foraged|garden harvest|fish catch|game meat/i.test(n)) return 'away_wild';
  return 'other';
}

// attachObs(Game) -> W. Applies all wraps; returns the collector.
function attachObs(Game) {
  const W = {
    deaths: [], deathSeen: new Set(),
    inflow: {},
    dayInflow: {},
    dayDuty: {},
    dayThrottle: {},
    dayLaunder: {},
    rotByCh: {},
    rotByChFast: {},
    rotByChPres: {},
    throttleCalls: 0, throttleEngaged: 0,
    dutyPreserved: 0, laundered: 0, starveDays: 0,
    starveByDay: {},
    assignCounts: {},
    dawnSamples: [],
  };
  const bumpDay = (map, day, ch, v) => {
    if (typeof v !== 'number' || v <= 0) return;
    const d = map[day] || (map[day] = {});
    d[ch] = (d[ch] || 0) + v;
  };

  // --- rot attribution: identity-deduped; channel by arrival tag ---
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    const rotDay = dayOf(Game);
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const k = (it.kcalEach || 0) * (it.units || 1);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + k;
          const ch = it._diagCh || 'untagged';
          W.rotByCh[ch] = (W.rotByCh[ch] || 0) + k;
          if (fs === 'preserved') W.rotByChPres[ch] = (W.rotByChPres[ch] || 0) + k;
          const arr = (typeof it._diagArr === 'number') ? it._diagArr : null;
          if (arr !== null && (rotDay - arr) <= 3) W.rotByChFast[ch] = (W.rotByChFast[ch] || 0) + k;
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  // --- duty-task flag + cook smoke-drive throughput + laundering (per day) ---
  const oROA = Game.resolveOneAssignment;
  if (typeof oROA === 'function') Game.resolveOneAssignment = function (vid, a) {
    const prev = Game._diagDutyTask;
    let isCook = false;
    try {
      Game._diagDutyTask = (a && a.task) || null;
      isCook = (Game._diagDutyTask === 'cook');
    } catch (e) {}
    let beforePres = new Map(), beforeSpoiled = new Set();
    if (isCook) {
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered')
            beforePres.set(it, (it.kcalEach || 0) * (it.units || 1));
          if (Game.isSpoiled && Game.isSpoiled(it)) beforeSpoiled.add(it);
        }
      } catch (e) {}
    }
    let r;
    try { r = oROA.apply(this, arguments); }
    finally { try { Game._diagDutyTask = prev; } catch (e) {} }
    if (isCook) {
      const d = dayOf(Game);
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered') {
            const k = (it.kcalEach || 0) * (it.units || 1);
            const prevK = beforePres.get(it) || 0;
            if (k > prevK) {
              const add = k - prevK;
              W.dutyPreserved += add;
              bumpDay(W.dayDuty, d, 'cook', add);
              if (beforeSpoiled.has(it)) { W.laundered++; W.dayLaunder[d] = (W.dayLaunder[d] || 0) + 1; }
            }
          }
        }
      } catch (e) {}
    }
    return r;
  };

  // --- objReturnEffect flag: haul vs traps vs water returns ---
  const oRet = Game.objReturnEffect;
  if (typeof oRet === 'function') Game.objReturnEffect = function (vid, purpose) {
    const prev = Game._diagReturnPurpose;
    try { Game._diagReturnPurpose = purpose || null; } catch (e) {}
    try { return oRet.apply(this, arguments); }
    finally { try { Game._diagReturnPurpose = prev; } catch (e) {} }
  };

  // --- arrival tagger: brand-new pantry items get _diagCh/_diagArr ---
  // Merged units inherit the stack's existing tag (fungibility by design —
  // stacksMatch merged them as identical; documented limit of attribution).
  function tagArrivals(chName, before) {
    if (!before) return;
    const d = dayOf(Game);
    try {
      for (const it of (((Game.state || {}).village || {}).pantry) || []) {
        if (it && !before.has(it) && !('_diagCh' in it)) {
          it._diagCh = chName; it._diagArr = d;
        }
      }
    } catch (e) {}
  }

  // --- inflow funnel: stockPantry attributed by duty flag / return purpose / name ---
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    const d = dayOf(Game);
    const dt = Game._diagDutyTask, rp = Game._diagReturnPurpose;
    const chName = classifyChannel(dt, rp, name);
    let before = null;
    try { before = new Set((((Game.state || {}).village || {}).pantry) || []); } catch (e) {}
    let r;
    try { r = oStock.apply(this, arguments); }
    catch (e) { r = undefined; }
    try {
      if (typeof kcal === 'number' && kcal > 0) {
        W.inflow[chName] = (W.inflow[chName] || 0) + kcal;
        bumpDay(W.dayInflow, d, chName, kcal);
        tagArrivals(chName, before);
      }
    } catch (e) {}
    return r;
  };

  // --- villager surplus-share funnel (stockSurplus pushes pantry directly) ---
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    const d = dayOf(Game);
    let before = null;
    try { before = new Set((((this.state || {}).village || {}).pantry) || []); } catch (e) {}
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try {
      if (typeof r === 'number' && r > 0) {
        W.inflow['share_surplus'] = (W.inflow['share_surplus'] || 0) + r;
        bumpDay(W.dayInflow, d, 'share_surplus', r);
        tagArrivals('share_surplus', before);
      }
    } catch (e) {}
    return r;
  };

  // --- PRODTHROTTLE sensor: per day and cumulative ---
  const oThr = Game.prodThrottleEngaged;
  if (typeof oThr === 'function') Game.prodThrottleEngaged = function () {
    let r = false;
    try { r = !!oThr.apply(this, arguments); } catch (e) {}
    try {
      const d = dayOf(Game);
      W.throttleCalls++;
      if (r) W.throttleEngaged++;
      const cell = W.dayThrottle[d] || (W.dayThrottle[d] = { calls: 0, engaged: 0 });
      cell.calls++; if (r) cell.engaged++;
    } catch (e) {}
    return r;
  };

  // --- duty assignment mix (policy-side) ---
  const oAssign = Game.assignTask;
  if (typeof oAssign === 'function') Game.assignTask = function (vid, task, opts) {
    try { const t = String(task || '?'); W.assignCounts[t] = (W.assignCounts[t] || 0) + 1; } catch (e) {}
    return oAssign.apply(this, arguments);
  };

  // --- dawn sensor snapshot: what the day's duties see (after sleep rolls the day) ---
  const oSleep = Game.sleep;
  if (typeof oSleep === 'function') Game.sleep = function () {
    const r = oSleep.apply(this, arguments);
    try {
      const v = (Game.state || {}).village || {};
      const day = ((Game.state || {}).scholar || {}).day || 0;
      let freshKcal = 0, freshDays = 0, burnAvg = 0;
      try { freshKcal = Game.pantryFreshKcal ? Game.pantryFreshKcal() : 0; } catch (e) {}
      try { freshDays = Game.pantryFreshDays ? Game.pantryFreshDays() : 0; } catch (e) {}
      try {
        const hist = (v.burnHistory || []).filter(x => x > 0);
        if (hist.length) burnAvg = hist.reduce((a, b) => a + b, 0) / hist.length;
      } catch (e) {}
      W.dawnSamples.push({
        day, pantryKcal: Math.round(pantryKcal(Game)),
        freshKcal: Math.round(freshKcal), freshDays: +Number(freshDays).toFixed(3),
        burnAvg: Math.round(burnAvg), roster: ((v.roster || []).length),
      });
    } catch (e) {}
    return r;
  };

  // --- deaths: kind-aware, dedup on (who,day,cause) ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  return W;
}

module.exports = { attachObs, classifyChannel, dayOf, pantryKcal };
