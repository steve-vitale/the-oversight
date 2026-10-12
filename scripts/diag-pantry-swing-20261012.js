#!/usr/bin/env node
// diag-pantry-swing-20261012.js — lever 0 r4: trace the pantry bathtub.
//
// Daily: pantry kcal, roster, IN (duty production by source), OUT (meals,
// rations, obligations), spoilage, deaths. Find what opens the drain.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');

const SEEDS = (process.env.SEEDS || '11').split(',').map(s => s.trim()).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/swing.json';

function pk(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'scale-food' });
  await setupGame(Game);
  const W = { meals: 0, rations: 0, spoil: 0, inBy: {}, deaths: [] };
  const origStock = Game.stockPantry;
  if (typeof origStock === 'function') Game.stockPantry = function (kcal, name) {
    try { if (kcal > 0) W.inBy[name || '?'] = (W.inBy[name || '?'] || 0) + kcal; } catch (e) {}
    return origStock.apply(this, arguments);
  };
  const origDraw = Game.pantryDraw;
  if (typeof origDraw === 'function') Game.pantryDraw = function (v, want, opts) {
    let sink = null;
    try {
      const realPantry = (Game.state.village || {}).pantry;
      if (v && v.pantry === realPantry) {
        if (opts && opts.cook) sink = 'meals';
        else if (opts && opts.cook === false) sink = 'rations';
      }
    } catch (e) {}
    const r = origDraw.apply(this, arguments);
    try { if (sink && r && r.taken) W[sink] += r.taken; } catch (e) {}
    return r;
  };
  const origSweep = Game.sweepSpoiled;
  if (typeof origSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it)) W.spoil += (it.kcalEach || 0) * (it.units || 1);
      }
    } catch (e) {}
    return origSweep.apply(this, arguments);
  };
  const origDie = Game.registerDeath;
  if (typeof origDie === 'function') Game.registerDeath = function (opts) {
    try { W.deaths.push({ day: (Game.state.scholar || {}).day || 0, who: String((opts && (opts.name || opts.villagerId)) || '?').slice(0, 24), cause: String((opts && opts.cause) || '?').slice(0, 24), kind: (opts && opts.kind) || '?' }); } catch (e) {}
    return origDie.apply(this, arguments);
  };
  const policy = Object.assign({}, scalecourt);
  const origDaily = scalecourt.daily;
  const trace = [];
  let lastIn = 0, lastOut = 0, lastSpoil = 0;
  const inSum = () => Object.values(W.inBy).reduce((a, b) => a + b, 0);
  policy.daily = (G, ctx) => {
    const r = origDaily.call(policy, G, ctx);
    try {
      const s = G.state.scholar, v = G.state.village;
      const nowIn = inSum(), nowOut = W.meals + W.rations, nowSpoil = W.spoil;
      trace.push({
        day: s.day || 0, pk: Math.round(pk(G)), roster: (v.roster || []).length,
        in: Math.round(nowIn - lastIn), out: Math.round(nowOut - lastOut), spoil: Math.round(nowSpoil - lastSpoil),
        hungry: v.hungryDays || 0,
      });
      lastIn = nowIn; lastOut = nowOut; lastSpoil = nowSpoil;
    } catch (e) {}
    return r;
  };
  await runDays(Game, policy, days, {});
  return { seed, days: (Game.state.scholar || {}).day || 0, endReason: Game.over ? 'village-lost' : 'survived', trace, inBy: W.inBy, deaths: W.deaths };
}

(async () => {
  const runs = [];
  for (const seed of SEEDS) {
    try { runs.push(await oneRun(seed, DAYS)); } catch (e) { console.error('seed', seed, 'failed:', String(e).slice(0, 200)); }
  }
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), runs }));
  for (const r of runs) {
    console.log('=== seed', r.seed, 'd' + r.days, r.endReason, '===');
    let lastPk = null;
    for (const t of r.trace) {
      const dPk = lastPk === null ? 0 : t.pk - lastPk; lastPk = t.pk;
      if (t.day % 4 !== 0 && t.day < 50) continue;
      console.log('d' + t.day, 'pk=' + t.pk, 'Δ' + (dPk >= 0 ? '+' : '') + dPk, 'r=' + t.roster, 'in=' + t.in, 'out=' + t.out, 'spoil=' + t.spoil, 'hungry=' + t.hungry);
    }
    console.log('deaths:', r.deaths.map(x => 'd' + x.day + ':' + x.cause).join(' '));
    const ib = Object.entries(r.inBy).sort((a, b) => b[1] - a[1]).slice(0, 6);
    console.log('top IN:', ib.map(([k, v]) => k + ':' + Math.round(v)).join(' '));
  }
  console.log('wrote', OUT);
})();
