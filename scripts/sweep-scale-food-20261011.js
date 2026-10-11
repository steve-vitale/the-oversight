#!/usr/bin/env node
// sweep-scale-food-20261011.js — lever 0 ROUND 2: the food economy AT SCALE.
//
// Baseline/after harness: per seed x scalecourt policy x 200 days. The full
// village calorie ledger, decomposed:
//
//   IN:  duty production by source (stockPantry names: Foraged food, Garden
//        harvest, Fish catch, Game meat, Genesis fruit, ...), tribute grain
//        arrivals, route tariff, league-granary draws, other direct pushes
//   OUT: nightly meals, away rations, feasts, league pours, trade upkeep,
//        tribute paid out, demands, raids/theft, spoilage
//   STATE (daily): pantry kcal, preserved kcal, roster, scaleRank, league pool
//        balance, active links by kind, tribute owed/arrears, hungry days
//
// Plus the famine hypothesis: on days the pantry is bare, what does the
// league granary hold? (The covenant's headline benefit is "draw on it in
// famine" — but nothing in the engine draws, and no policy ever did.)
//
// Usage: SEEDS="11,22" DAYS=200 OUT=/tmp/scale.json node scripts/sweep-scale-food-20261011.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');

const parseList = (env, def) => (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
const { competent } = require('./policies/competent');
const POLICIES = { scalecourt, competent };
const POLICY_ID = (process.env.POLICY || 'scalecourt').toLowerCase();
const POLICY = POLICIES[POLICY_ID] || scalecourt;

function pantryKcalOf(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function preservedKcalOf(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .filter(i => i && i.foodState === 'preserved')
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

function endState(Game) {
  const out = {
    won: !!Game.won, endReason: Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived',
    day: 0, arc: 1, scaleRank: '?', maxWave: 1, pantryKcal: 0, poolKcal: 0,
    roster: 0, hungryDays: 0,
  };
  try { out.day = Game.state.scholar.day || 0; } catch (e) {}
  try { out.arc = (Game.progState() || {}).arc || 1; } catch (e) {}
  try { out.scaleRank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  out.pantryKcal = pantryKcalOf(Game);
  try { out.poolKcal = Game.leaguePool ? Game.leaguePool() : 0; } catch (e) {}
  try { out.roster = ((Game.state.village || {}).roster || []).length; } catch (e) {}
  try { out.hungryDays = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  return out;
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'scale-food' });
  await setupGame(Game);
  const L = {
    inBy: {},          // stockPantry IN by item name
    outBy: {},         // all OUT by sink
    poolDraws: 0,      // total kcal drawn from league granary
    poolDrawN: 0,
    spoilLostKcal: 0, spoilLostItems: 0,
    spoilBy: {},
    emptyPantryDays: 0,      // days with pantry == 0
    poolAtEmpty: [],         // leaguePoolKcal on bare-pantry days
    hungryDayTotal: 0,
    maxScaleRank: 'village',
    scaleDays: {},           // days spent at each rank
    daysAtDay: {},           // per-day ledger rows (every 5 days)
  };
  const RANK_ORDER = ['village', 'local', 'regional', 'national', 'global'];
  const rankUp = (r) => { if (RANK_ORDER.indexOf(r) > RANK_ORDER.indexOf(L.maxScaleRank)) L.maxScaleRank = r; };

  // ---- IN: duty production ----
  const stockNames = {}; // names stocked via stockPantry (merged stacks) — excluded from the arrival scan
  const origStock = Game.stockPantry;
  if (typeof origStock === 'function') {
    Game.stockPantry = function (kcal, name, opts) {
      try { if (kcal > 0) { L.inBy[name || '?'] = (L.inBy[name || '?'] || 0) + kcal; stockNames[name || '?'] = true; } } catch (e) {}
      return origStock.apply(this, arguments);
    };
  }
  // ---- OUT: pantryDraw (meals/rations/feasts/raids) ----
  const origDraw = Game.pantryDraw;
  if (typeof origDraw === 'function') {
    Game.pantryDraw = function (v, want, opts) {
      let sink = 'other-draw';
      try {
        const realPantry = (Game.state.village || {}).pantry;
        if (!v || v.pantry !== realPantry) sink = 'dryrun-skip'; // feastPlan's copy
        else if (opts && opts.cook) sink = 'meals';
        else {
          const st = (new Error().stack || '');
          if (/hostFeast/.test(st)) sink = 'feast';
          else if (/feastPlan/.test(st)) sink = 'dryrun-skip';
          else if (opts && opts.cook === false) sink = 'rations';
        }
      } catch (e) {}
      const r = origDraw.apply(this, arguments);
      try { if (sink !== 'dryrun-skip') L.outBy[sink] = (L.outBy[sink] || 0) + (r && r.taken || 0); } catch (e) {}
      return r;
    };
  }
  // ---- OUT: _removePantryKcal (league pour, trade upkeep, tribute, demands) ----
  const origRem = Game._removePantryKcal;
  if (typeof origRem === 'function') {
    Game._removePantryKcal = function (kcal) {
      let sink = 'other-remove';
      try {
        const st = (new Error().stack || '');
        if (/covenantTick/.test(st)) sink = 'league-pour';
        else if (/tradeTick/.test(st)) sink = 'trade-upkeep';
        else if (/payTribute/.test(st)) sink = 'tribute-out';
        else if (/answerDemand|primaryDemand/.test(st)) sink = 'demand';
        else if (/betrayal/.test(st)) sink = 'theft';
      } catch (e) {}
      const r = origRem.apply(this, arguments);
      try { L.outBy[sink] = (L.outBy[sink] || 0) + (r || 0); } catch (e) {}
      return r;
    };
  }
  // ---- IN: league granary draws ----
  const origPoolDraw = Game.drawLeaguePool;
  if (typeof origPoolDraw === 'function') {
    Game.drawLeaguePool = function (kcal) {
      const r = origPoolDraw.apply(this, arguments);
      try { if (r > 0) { L.poolDraws += r; L.poolDrawN++; } } catch (e) {}
      return r;
    };
  }
  // ---- OUT: spoilage ----
  const origSweep = Game.sweepSpoiled;
  if (typeof origSweep === 'function') {
    Game.sweepSpoiled = function () {
      try {
        const scan = (cont, label) => {
          for (const it of (cont || [])) {
            if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it)) {
              const k = (it.kcalEach || 0) * (it.units || 1);
              L.spoilLostKcal += k; L.spoilLostItems++;
              L.spoilBy[label] = (L.spoilBy[label] || 0) + k;
            }
          }
        };
        scan(Game.state.scholar.inventory, 'pack');
        scan((Game.state.village || {}).pantry, 'pantry');
      } catch (e) {}
      return origSweep.apply(this, arguments);
    };
  }
  // ---- IN: direct pantry pushes (tribute grain, tariff, pool draws) ----
  // kcal-delta based: for each (name, spoilDay) not stocked via stockPantry,
  // an increase in total kcal since yesterday's scan is an arrival. (Unit
  // churn from meals would false-positive a signature scan.)
  let prevKcal = null;
  const scanArrivals = () => {
    try {
      const now = {};
      for (const it of ((Game.state.village || {}).pantry || [])) {
        const nm = String(it.name || '?');
        if (stockNames[nm]) continue; // duty production — counted via the wrap
        const key = nm + '|' + (it.spoilDay || 0);
        now[key] = (now[key] || 0) + (it.kcalEach || 0) * (it.units || 1);
      }
      const fresh = {};
      if (prevKcal) {
        for (const key of Object.keys(now)) {
          const delta = now[key] - (prevKcal[key] || 0);
          if (delta > 0) {
            const nm = key.split('|')[0];
            let bucket = 'other-direct-in';
            if (/^Tribute grain from/.test(nm)) bucket = 'tribute-in';
            else if (/^Route tariff/.test(nm)) bucket = 'tariff-in';
            else if (nm === 'League granary draw') bucket = 'pool-draw-in';
            fresh[bucket] = (fresh[bucket] || 0) + delta;
            if (bucket === 'other-direct-in') {
              const dk = 'other-direct-in::' + nm.slice(0, 32);
              fresh[dk] = (fresh[dk] || 0) + delta;
            }
          }
        }
      }
      prevKcal = now;
      return fresh;
    } catch (e) { return null; }
  };

  // ---- daily state sample ----
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const arrivals = scanArrivals();
      if (arrivals) for (const k of Object.keys(arrivals)) if (arrivals[k] > 0) L.inBy[k] = (L.inBy[k] || 0) + arrivals[k];
      let rank = '?';
      try { rank = G.scaleRank ? G.scaleRank() : '?'; } catch (e) {}
      rankUp(rank);
      L.scaleDays[rank] = (L.scaleDays[rank] || 0) + 1;
      const pk = pantryKcalOf(G);
      let pool = 0;
      try { pool = G.leaguePool ? G.leaguePool() : 0; } catch (e) {}
      if (pk === 0) { L.emptyPantryDays++; L.poolAtEmpty.push(pool); }
      const v = G.state.village || {};
      if ((v.hungryDays || 0) > 0) L.hungryDayTotal++;
      let links = [];
      try { links = G.hierarchyState ? G.hierarchyState() : []; } catch (e) {}
      const active = links.filter(l => l && l.status === 'active');
      if (day % 5 === 0 || pk === 0) {
        L.daysAtDay[day] = {
          pantry: Math.round(pk), preserved: Math.round(preservedKcalOf(G)),
          roster: (v.roster || []).length, rank, pool: Math.round(pool),
          links: active.map(l => ({ kind: l.kind, trust: l.trust, trib: l.tributeKcalPerWeek || 0, arrears: l.arrears || 0 })),
          hungry: v.hungryDays || 0,
        };
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  // light text capture: food-related say lines for agency sampling
  const foodLines = [];
  const origSay = Game.say;
  Game.say = function (...a) {
    try {
      const s = String(a[0] || '');
      if (foodLines.length < 600 && /pantry|cook|smok|feast|granary|hungr|starv|tribute|ration|dinner|supper|meal/i.test(s)) foodLines.push(s);
    } catch (e) {}
    return origSay.apply(this, a);
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const deaths = (result.samples.deaths || []).map(d => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause }));
  return { seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason, ledger: L, end: endState(Game), deaths, foodLines: foodLines.slice(0, 120) };
}

(async () => {
  const seeds = parseList('SEEDS', '11,22,33,44,55').map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const seed of seeds) {
    const r = await oneRun(seed, days);
    rows.push(r);
    const e = r.end, Lg = r.ledger;
    const inDetail = Object.entries(Lg.inBy).filter(([k]) => k.startsWith('other-direct-in::')).map(([k, v]) => k.slice('other-direct-in::'.length).slice(0, 24) + ':' + Math.round(v / 1000) + 'k').join(',');
    console.error(`seed ${seed}: ${r.endReason} d${e.day} rank=${Lg.maxScaleRank} roster=${e.roster} pantry=${e.pantryKcal} pool=${e.poolKcal} emptyD=${Lg.emptyPantryDays} in=${Object.entries(Lg.inBy).filter(([k]) => !k.startsWith('other-direct-in::')).map(([k, v]) => k.split(' ')[0] + ':' + Math.round(v / 1000) + 'k').join(',')} out=${Object.entries(Lg.outBy).map(([k, v]) => k + ':' + Math.round(v / 1000) + 'k').join(',')}${inDetail ? ' DIRECT[' + inDetail + ']' : ''}`);
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ when: new Date().toISOString(), days, rows }, null, 1)); console.error('wrote ' + outFile); }
})();
