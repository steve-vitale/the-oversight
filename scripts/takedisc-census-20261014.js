#!/usr/bin/env node
// takedisc-census-20261014.js — BASELINE take-discipline census (no layer).
//
// Measures, per run, the scholar's pantry-take behavior on the CURRENT base
// policies (belongseek / leadcourt), so the takedisc arm can pre-check the
// blank honestly: does the base policy already batch takes?
//
// Instruments (read-only wraps — engine behavior unchanged):
//   - takeFromPantry: events + kcalEach per call + trust-sting detection
//     (scholar-vid trust drop of exactly 2 during the call)
//   - takeFromPantryBulk: events + total kcal + sting detection
//   - villageMeal: events + taken kcal (v.lastPlayerMeal)
//   - daily: v.takes[vid], trust[vid], scholar kcal, current scholar vid
//     (succession-safe: re-reads vid each day)
//
// Usage:
//   SEEDS="11,22" POLICY=belongseek DAYS=40 node scripts/takedisc-census-20261014.js
//   SEEDS="11,22,33,44,55,66,77,88" POLICY=leadcourt DAYS=60 OUT=... node ...
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');

const POLICY_ID = process.env.POLICY || 'belongseek';
const SEEDS = (process.env.SEEDS || '11,22').split(',').map(s => parseInt(s, 10));
const DAYS = parseInt(process.env.DAYS || '40', 10);

function loadPolicy() {
  if (POLICY_ID === 'belongseek') return require('./policies/belongseek').belongseek;
  if (POLICY_ID === 'leadcourt') return require('./policies/leadcourt').leadcourt;
  throw new Error('unknown POLICY ' + POLICY_ID);
}

function scholarVid(Game) {
  try { return Game.state.scholar.villagerId; } catch (e) { return null; }
}
function vTakes(Game, vid) {
  try { return (((Game.state.village || {}).takes || {})[vid]) || 0; } catch (e) { return 0; }
}
function vTakesAll(Game) {
  try {
    const t = (Game.state.village || {}).takes || {};
    return Object.values(t).reduce((a, b) => a + (b || 0), 0);
  } catch (e) { return 0; }
}
function vTrust(Game, vid) {
  try { const t = (((Game.state.village || {}).trust || {})[vid]); return t === undefined ? 15 : t; } catch (e) { return 15; }
}

function installCensus(Game) {
  const T = {
    singleEvents: 0, singleKcal: 0, singleStings: 0,
    bulkEvents: 0, bulkKcal: 0, bulkStings: 0,
    mealEvents: 0, mealKcal: 0,
    otherTrustDrops: 0,
    days: [],
    instrErrors: 0,
  };
  const origSingle = Game.takeFromPantry.bind(Game);
  Game.takeFromPantry = function (idx) {
    const vid = scholarVid(Game);
    const t0 = vTrust(Game, vid);
    const tk0 = vTakesAll(Game);
    let r = null;
    try { r = origSingle(idx); } catch (e) { T.instrErrors++; }
    try {
      // HONEST: attribute only what the engine actually wrote (weight-failed
      // takes return null without writing v.takes)
      const dKcal = vTakesAll(Game) - tk0;
      T.singleEvents++;
      if (dKcal > 0) { T.singleTakes++; T.singleKcal += dKcal; }
      const drop = t0 - vTrust(Game, vid);
      if (drop === 2) T.singleStings++;
      else if (drop > 0) T.otherTrustDrops++;
    } catch (e) { T.instrErrors++; }
    return r;
  };
  const origBulk = Game.takeFromPantryBulk.bind(Game);
  Game.takeFromPantryBulk = function (selections) {
    const vid = scholarVid(Game);
    const t0 = vTrust(Game, vid);
    const tk0 = vTakesAll(Game);
    let r = null;
    try { r = origBulk(selections); } catch (e) { T.instrErrors++; }
    try {
      const dKcal = vTakesAll(Game) - tk0;
      T.bulkEvents++;
      if (dKcal > 0) { T.bulkTakes++; T.bulkKcal += dKcal; }
      const drop = t0 - vTrust(Game, vid);
      if (drop === 2) T.bulkStings++;
      else if (drop > 0) T.otherTrustDrops++;
    } catch (e) { T.instrErrors++; }
    return r;
  };
  const origMeal = Game.villageMeal ? Game.villageMeal.bind(Game) : null;
  if (origMeal) {
    Game.villageMeal = function () {
      const tk0 = vTakesAll(Game);
      let r = null;
      try { r = origMeal(); } catch (e) { T.instrErrors++; }
      try {
        const dKcal = vTakesAll(Game) - tk0;
        T.mealEvents++;
        if (dKcal > 0) T.mealKcal += dKcal;
      } catch (e) { T.instrErrors++; }
      return r;
    };
  }
  return T;
}

async function runOne(seed) {
  const { Game } = await loadGame({ seed, mode: 'takedisc-census' });
  await setupGame(Game);
  const T = installCensus(Game);
  const base = loadPolicy();
  const wrapped = Object.assign({}, base, {
    id: base.id + '-takedisc-census',
    daily(G, ctx) {
      try {
        const vid = scholarVid(G);
        const day = ((G.state || {}).scholar || {}).day || 0;
        if (T._lastVid && T._lastVid !== vid) T.successionCount = (T.successionCount || 0) + 1;
        T._lastVid = vid;
        T.days.push({
          day,
          vid: String(vid).slice(0, 14),
          takes: vTakes(G, vid),
          takesAll: Math.round(vTakesAll(G)),
          trust: vTrust(G, vid),
          kcal: Math.round(((G.state || {}).scholar || {}).kcal || 0),
        });
      } catch (e) { T.instrErrors++; }
      if (base.daily) return base.daily(G, ctx);
    },
  });
  const res = await runDays(Game, wrapped, { days: DAYS, manifest: { policy: POLICY_ID, seed, mode: 'takedisc-census' } });
  const n = T.days.length || 1;
  const firstTakes = T.days.length ? T.days[0].takes : 0;
  return {
    seed, policy: POLICY_ID, days: res.days, endReason: res.endReason,
    singleEvents: T.singleEvents, singleTakes: T.singleTakes || 0,
    singlePerDay: (T.singleEvents / n).toFixed(1),
    singleKcal: Math.round(T.singleKcal), singleKcalPerDay: Math.round(T.singleKcal / n),
    bulkEvents: T.bulkEvents, bulkKcal: Math.round(T.bulkKcal),
    mealEvents: T.mealEvents, mealKcal: Math.round(T.mealKcal),
    mealKcalPerDay: Math.round(T.mealKcal / n),
    stings: T.singleStings + T.bulkStings, stingsPerDay: ((T.singleStings + T.bulkStings) / n).toFixed(2),
    otherTrustDrops: T.otherTrustDrops,
    vTakesEnd: T.days.length ? T.days[T.days.length - 1].takes : 0,
    vTakesDelta: (T.days.length ? T.days[T.days.length - 1].takes : 0) - firstTakes,
    takesAllEnd: T.days.length ? T.days[T.days.length - 1].takesAll : 0,
    successionCount: T.successionCount || 0,
    instrTotalKcal: Math.round(T.singleKcal + T.bulkKcal + T.mealKcal),
    trustD5: T.days[4] ? T.days[4].trust : null,
    trustD15: T.days[14] ? T.days[14].trust : null,
    trustD30: T.days[29] ? T.days[29].trust : null,
    instrErrors: T.instrErrors,
  };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const r = await runOne(seed);
    rows.push(r);
    console.log(JSON.stringify(r));
  }
  const out = process.env.OUT;
  if (out) require('fs').writeFileSync(out, JSON.stringify(rows, null, 2));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
