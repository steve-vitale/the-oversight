#!/usr/bin/env node
// probe-ledgerpenalty-20261014.js — explain the takesEnd divergence.
// Tracks per-day: scholar vid/name (succession), trust, bar, take kcal,
// meal kcal, on one seed x one policy, both sides.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');

const SEED = parseInt(process.env.SEED || '11', 10);

async function runOnce() {
  const { Game } = await loadGame({ seed: SEED, mode: 'ledgerpenalty-probe' });
  await setupGame(Game);
  const startVid = Game.villagerId;
  const rows = [];
  let takeKcal = 0, takeN = 0, mealKcal = 0;
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      const m = String(msg);
      const mm = m.match(/Village meal: \+([\d,]+) kcal/);
      if (mm) mealKcal += parseInt(mm[1].replace(/,/g, ''), 10);
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const realTake = Game.takeFromPantry;
  Game.takeFromPantry = function (idx) {
    const v = Game.state.village || {};
    const item = (v.pantry || [])[idx];
    const k = item ? (item.kcalEach || 0) : 0;
    const r = realTake.apply(this, arguments);
    takeKcal += k; takeN++;
    return r;
  };
  const base = belongseek;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = G.state.scholar || {}, vv = G.state.village || {};
      rows.push({
        day: s.day, vid: G.villagerId, name: s.name,
        trust: ((vv.trust || {})[G.villagerId]),
        bar: Math.round(s.kcal || 0),
        takeKcal, takeN, mealKcal,
        alive: (vv.roster || []).includes(G.villagerId),
      });
      takeKcal = 0; takeN = 0; mealKcal = 0;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 1 });
  Game.say = origSay;
  Game.takeFromPantry = realTake;
  return { rows, days: r.days, endReason: r.endReason, startVid };
}

async function main() {
  const { rows, days, endReason, startVid } = await runOnce();
  console.log(`seed=${SEED} days=${days} end=${endReason} startVid=${startVid}`);
  // succession check: distinct vids over time
  const vids = [...new Set(rows.map(r => r.vid))];
  console.log('distinct scholar vids:', vids.length, vids.join(','));
  // per-20-day blocks: avg trust, avg bar, total take kcal, total meal kcal, take N
  for (let b = 0; b < days; b += 20) {
    const blk = rows.filter(r => r.day >= b && r.day < b + 20);
    if (!blk.length) continue;
    const trusts = blk.map(r => r.trust).filter(t => t !== undefined && t !== null);
    const bars = blk.map(r => r.bar);
    const tk = blk.reduce((t, r) => t + r.takeKcal, 0);
    const tn = blk.reduce((t, r) => t + r.takeN, 0);
    const mk = blk.reduce((t, r) => t + r.mealKcal, 0);
    const names = [...new Set(blk.map(r => r.name))].join('/');
    console.log(`d${b}-${b + 19}: scholar=${names} trust~${trusts.length ? (trusts.reduce((a, x) => a + x, 0) / trusts.length).toFixed(1) : '?'} bar~${(bars.reduce((a, x) => a + x, 0) / bars.length).toFixed(0)} takes=${tn}x/${tk}kcal meals=${mk}kcal`);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
