#!/usr/bin/env node
// sweep-food-econ-20261011.js — food-economy lever measurement (long-run sim loop, Steve 2026-10-11).
// BASELINE/AFTER harness: per seed x competent policy x 200 days, records:
//   - win rate / endReason / days survived
//   - death causes (kind/cause shares)
//   - food-processing event counts: cook, smoke(preserve), render, pemmican,
//     clean, askSpecialist, feasts hosted, feastBuff grants
//   - spoilage waste (kcal lost to sweepSpoiled, pack+pantry), spoiled eats
//   - technique learning: preserve/render techniques known at end
//   - pantry kcal + spoilage-risk kcal curves (every 10 days)
//   - wave/arc reach, feastSurgeUsed
// Usage: SEEDS="11,22" DAYS=200 OUT=/tmp/food.json node scripts/sweep-food-econ-20261011.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');

const parseList = (env, def) => (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);

function endState(Game) {
  const out = {
    won: !!Game.won, endReason: Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived',
    day: 0, arc: 1, breadth: 0, stage: 0, feastSurgeUsed: false,
    maxWave: 1, waveKills: {}, pantryKcal: 0,
    knowPreserve: false, knowRender: false, knowClean: false,
  };
  try { out.day = Game.state.scholar.day || 0; } catch (e) {}
  try { out.arc = (Game.progState() || {}).arc || 1; } catch (e) {}
  try { out.breadth = Game.codexBreadth(); } catch (e) {}
  try { out.stage = Game.integrationStage(); } catch (e) {}
  try { out.feastSurgeUsed = !!((Game.state.scholar || {}).prog || {}).feastSurgeUsed; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.waveKills = Object.assign({}, Game.state.waveKills || {}); } catch (e) {}
  try { out.pantryKcal = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) {}
  try {
    out.knowPreserve = !!Game.knowsTechnique && Game.knowsTechnique('preserve');
    out.knowRender = !!Game.knowsTechnique && Game.knowsTechnique('render');
    out.knowClean = !!Game.knowsTechnique && Game.knowsTechnique('clean');
  } catch (e) {}
  return out;
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'food-econ' });
  await setupGame(Game);
  const food = {
    cook: 0, smoke: 0, render: 0, pemmican: 0, clean: 0, spec: 0,
    feasts: 0, feastBuffs: 0,
    spoilLostKcal: 0, spoilLostItems: 0, eatSpoiled: 0,
    smokedKcalEver: 0, renderedKcalEver: 0, pemmicanKcalEver: 0,
  };
  const wrap = (name, key) => {
    const f = Game[name];
    if (typeof f === 'function') {
      Game[name] = function (...a) { try { food[key]++; } catch (e) {} return f.apply(this, a); };
    }
  };
  wrap('cookFood', 'cook'); wrap('preserveFood', 'smoke'); wrap('renderFat', 'render');
  wrap('makePemmican', 'pemmican'); wrap('cleanCarcass', 'clean');
  wrap('askSpecialist', 'spec'); wrap('hostFeast', 'feasts'); wrap('grantFeastBuff', 'feastBuffs');
  // spoilage loss accounting: snapshot spoiled kcal just before the sweep runs
  const origSweep = Game.sweepSpoiled;
  if (typeof origSweep === 'function') {
    Game.sweepSpoiled = function (...a) {
      try {
        // waste breakdown: container -> foodState/foodKind -> kcal
        const breakdown = food.wasteBy || (food.wasteBy = {});
        const scan = (cont, label) => {
          for (const it of (cont || [])) {
            if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it)) {
              const k = (it.kcalEach || 0) * (it.units || 1);
              food.spoilLostKcal += k; food.spoilLostItems++;
              const fs = (it.foodState || '?') + '/' + (it.foodKind || '?');
              breakdown[label] = breakdown[label] || {};
              breakdown[label][fs] = (breakdown[label][fs] || 0) + k;
            }
          }
        };
        scan(Game.state.scholar.inventory, 'pack');
        try { const ps = Game.prepStash ? Game.prepStash() : null; if (ps && ps !== Game.state.scholar.inventory) scan(ps, 'stash'); } catch (e) {}
        scan((Game.state.village || {}).pantry, 'pantry');
      } catch (e) {}
      return origSweep.apply(this, a);
    };
  }
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    try { if (type === 'eat' && data && data.spoiled) food.eatSpoiled++; } catch (e) {}
    return origTele.call(this, type, data);
  };
  // preservation reachability: sample produced states each day
  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  const pantryCurve = [];
  policy.daily = (G, ctx) => {
    try {
      let smoked = 0, rendered = 0, pem = 0, riskKcal = 0, pantryKcal = 0;
      const scan = (cont, which) => {
        for (const it of (cont || [])) {
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved') smoked += k;
          if (it.foodState === 'rendered') rendered += k;
          if (it.foodKind === 'pemmican') pem += k;
          if (Game.isSpoiled && Game.isSpoiled(it)) continue;
          if ((it.spoilDay || 0) - G.state.scholar.day <= 2) riskKcal += k;
        }
      };
      scan(G.state.scholar.inventory);
      const pv = G.state.village || {};
      for (const it of (pv.pantry || [])) { const k = (it.kcalEach || 0) * (it.units || 1); pantryKcal += k; if (it.foodState === 'preserved') smoked += k; }
      const day = G.state.scholar.day || 0;
      if (day % 10 === 0) pantryCurve.push([day, Math.round(pantryKcal), Math.round(smoked), Math.round(rendered), Math.round(pem), Math.round(riskKcal)]);
      if (smoked > food.smokedKcalEver) food.smokedKcalEver = smoked;
      if (rendered > food.renderedKcalEver) food.renderedKcalEver = rendered;
      if (pem > food.pemmicanKcalEver) food.pemmicanKcalEver = pem;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const deaths = (result.samples.deaths || []).map(d => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause }));
  return { seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason, food, end: endState(Game), deaths, pantryCurve };
}

(async () => {
  const seeds = parseList('SEEDS', '11,22,33,44,55').map(Number);
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const seed of seeds) {
    const r = await oneRun(seed, days);
    rows.push(r);
    console.error(`seed ${seed}: ${r.endReason} d${r.days} pantry=${r.end.pantryKcal} spoil=${r.food.spoilLostKcal}k smoke=${r.food.smoke} render=${r.food.render} pemmican=${r.food.pemmican} feasts=${r.food.feasts} buffs=${r.food.feastBuffs} spec=${r.food.spec}`);
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ when: new Date().toISOString(), days, rows }, null, 1)); console.error('wrote ' + outFile); }
})();
