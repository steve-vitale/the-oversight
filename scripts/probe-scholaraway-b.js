#!/usr/bin/env node
// probe-scholaraway-b.js — NON-JUDGED diagnostic probe (NOT the census).
// (sim-scholaraway-b follow-up: the judged pilot found homecomings on
// 19-31 days per seed with unload 0, contradicting the "camps wild all
// month" explanation. This probe answers two mechanism questions the
// judged driver did not record: (1) WHICH call site fires returnToVillage
// on days the scholar is already home (stack capture); (2) is the
// depositgate keep raised (6000) on the returns where the pack is
// largest (gate + fresh-days reads)? It changes no verdict rule and its
// numbers never enter the census; the evidence file quotes it as a
// labeled probe.)
// Usage: POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
//   DEPOSITGATE=1 DAYS=30 SEEDS=51102,51105 node scripts/probe-scholaraway-b.js
// Prints one JSON line per seed to stdout.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '51102').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);

function stackTop() {
  try { return new Error().stack.split('\n').slice(2, 10).join(' | ').slice(0, 500); }
  catch (e) { return ''; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'scholaraway-probe', fullTelemetry: false });
  await setupGame(Game);
  const returns = [];
  let loopDay = 0;
  const origReturn = Game.returnToVillage;
  Game.returnToVillage = function (...args) {
    let gate = null, freshDays = null, brought = null;
    try { gate = !!Game._depositGateEngaged(); } catch (e) {}
    try { freshDays = Game.pantryFreshDays(); } catch (e) {}
    try {
      brought = Game.state.scholar.inventory.reduce((t, i) =>
        t + (((i.kcalEach || 0) > 0 && !Game.isUnprocessed(i)) ? (i.units || 0) * (i.kcalEach || 0) : 0), 0);
    } catch (e) {}
    const rec = { loopDay, day: (Game.state.scholar || {}).day || 0, overAtEntry: !!Game.over,
      stack: stackTop(), gateEngaged: gate, pantryFreshDays: freshDays,
      broughtKcal: brought === null ? null : Math.round(brought) };
    let r;
    try { r = origReturn.apply(this, args); } finally { returns.push(rec); }
    return r;
  };
  let callIdx = 0;
  const baseDaily = competent.daily.bind(competent);
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      callIdx++; loopDay = callIdx;
      baseDaily(Game2, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return { seed, daysAlive: result.days, endReason: result.endReason, returns };
}

async function main() {
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    process.stdout.write(JSON.stringify(inst) + '\n');
    console.error('probe seed=' + seed + ' returns=' + inst.returns.length);
  }
}
if (require.main === module) {
  main().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
}
