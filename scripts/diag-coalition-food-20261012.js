#!/usr/bin/env node
// diag-coalition-food-20261012.js — lever 0 round 4: the coalition food ledger.
//
// Measures the FOOD ECONOMY AT SCALE: where does the coalition's food go?
// Per-run: weekly tribute/pool/demand flows, per-link tribute owed vs paid vs
// arrears, pantry trajectory from regional onward, pool balance at empty-pantry
// days, hungry-day accounting. Filters to runs that reach regional+.
//
// Usage: SEEDS="33,77,222" DAYS=200 OUT=/tmp/coal.json node scripts/diag-coalition-food-20261012.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');

const parseList = (env, def) => (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/coal.json';

function pk(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function linksOf(Game) {
  try {
    const ls = Game.hierarchyState ? Game.hierarchyState() : [];
    return ls.filter(l => l && l.status === 'active').map(l => ({
      id: l.id, kind: l.kind || '?',
      role: l.subordinate === 'haven' ? 'sub' : (l.primary === 'haven' ? 'prim' : 'peer'),
      tribWk: l.tributeKcalPerWeek || 0,
      arrears: l.arrears || 0,
      trust: Math.round(l.trust || 0),
    }));
  } catch (e) { return []; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'scale-food' });
  await setupGame(Game);
  const W = {
    tributeOut: 0, tributeIn: 0, poolPour: 0, poolDraw: 0, demand: 0, tradeUpkeep: 0,
    tradeTariffIn: 0, aidOut: 0,
  };
  // wrap _removePantryKcal by stack-sink (r2 pattern)
  const origRem = Game._removePantryKcal;
  if (typeof origRem === 'function') Game._removePantryKcal = function (kcal) {
    let sink = null;
    try {
      const st = (new Error().stack || '');
      if (/covenantTick/.test(st)) sink = 'poolPour';
      else if (/tradeTick/.test(st)) sink = 'tradeUpkeep';
      else if (/payTribute|tributeTick|_linkTribute/.test(st)) sink = 'tributeOut';
      else if (/answerDemand|primaryDemand/.test(st)) sink = 'demand';
      else if (/answerAid|sendAid|aidCall/.test(st)) sink = 'aidOut';
    } catch (e) {}
    const r = origRem.apply(this, arguments);
    try { if (sink && r > 0) W[sink] += r; } catch (e) {}
    return r;
  };
  // wrap drawLeaguePool
  const origPoolDraw = Game.drawLeaguePool;
  if (typeof origPoolDraw === 'function') Game.drawLeaguePool = function (k) {
    const r = origPoolDraw.apply(this, arguments);
    try { if (r > 0) W.poolDraw += r; } catch (e) {}
    return r;
  };
  // tribute-in arrives as real items named "Tribute grain from X"; scan daily deltas
  let prevKcal = null;
  const scanArrivals = () => {
    try {
      const now = {};
      for (const it of ((Game.state.village || {}).pantry || [])) {
        const nm = String(it.name || '?');
        const key = nm + '|' + (it.spoilDay || 0);
        now[key] = (now[key] || 0) + (it.kcalEach || 0) * (it.units || 1);
      }
      if (prevKcal) for (const key of Object.keys(now)) {
        const delta = now[key] - (prevKcal[key] || 0);
        if (delta > 0) {
          const nm = key.split('|')[0];
          if (/^Tribute grain from/.test(nm)) W.tributeIn += delta;
          else if (/^Route tariff/.test(nm)) W.tradeTariffIn += delta;
        }
      }
      prevKcal = now;
    } catch (e) {}
  };
  const policy = Object.assign({}, scalecourt);
  const origDaily = scalecourt.daily;
  const trace = [];
  policy.daily = (G, ctx) => {
    try {
      scanArrivals();
      const s = G.state.scholar, v = G.state.village;
      const rank = G.scaleRank ? G.scaleRank() : '?';
      if (['regional', 'national', 'global'].includes(rank) || (s.day || 0) >= 30) {
        trace.push({
          day: s.day || 0, rank, pk: Math.round(pk(G)),
          pool: G.leaguePool ? Math.round(G.leaguePool()) : 0,
          roster: (v.roster || []).length,
          hungry: v.hungryDays || 0,
          links: linksOf(G),
        });
      }
    } catch (e) {}
    return origDaily.call(policy, G, ctx);
  };
  await runDays(Game, policy, days, {});
  const end = {
    seed, days: (Game.state.scholar || {}).day || 0,
    endReason: Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived',
    rank: Game.scaleRank ? Game.scaleRank() : '?',
    flows: W, trace,
  };
  return end;
}

(async () => {
  const seeds = parseList('SEEDS', '33,77,222');
  const runs = [];
  for (const seed of seeds) {
    try { runs.push(await oneRun(seed, DAYS)); }
    catch (e) { console.error('seed', seed, 'failed:', String(e).slice(0, 200)); }
  }
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), days: DAYS, runs }, null, 1));
  for (const r of runs) {
    console.log('seed', r.seed, r.endReason, 'd' + r.days, 'rank=' + r.rank,
      'tribIn=' + Math.round(r.flows.tributeIn), 'tribOut=' + Math.round(r.flows.tributeOut),
      'poolPour=' + Math.round(r.flows.poolPour), 'poolDraw=' + Math.round(r.flows.poolDraw),
      'demand=' + Math.round(r.flows.demand), 'tariffIn=' + Math.round(r.flows.tradeTariffIn));
  }
  console.log('wrote', OUT);
})();
