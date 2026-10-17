#!/usr/bin/env node
// scripts/beats-performretire-20261017.js — beat capture for sense reads.
// Re-runs one armed seed with Game.say wrapped; logs fight beats around
// performed-trick fights, marking retire events.
// Usage: SEED=9941 POLICY=performretire-lead node scripts/beats-performretire-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { performretireLead, performretireBelong } = require('./policies/performretire');

(async () => {
  const seed = parseInt(process.env.SEED || '9941', 10);
  const policyId = process.env.POLICY || 'performretire-lead';
  const policy = policyId === 'performretire-belong' ? performretireBelong : performretireLead;
  process.env.PERFORMRETIRE = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'performretire-beats', fullTelemetry: true });
  await setupGame(Game);
  const beats = [];
  const day = () => { try { return (Game.state.scholar || {}).day; } catch (e) { return null; } };
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      const f = Game.tbfight;
      if (f && !f.over) beats.push({ day: day(), msg: String(msg).slice(0, 320) });
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  // mark retire events + performed fights
  const origExit = Game.tbBarrierExit.bind(Game);
  Game.tbBarrierExit = function (dx, dy) {
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const tlbm = f.trickLogByMid || {};
        const perfs = [];
        for (const [mid, arr] of Object.entries(tlbm)) if ((arr || []).length) perfs.push(mid + ':' + arr.join(','));
        beats.push({ day: day(), msg: `@@RETIRE@@ push(${dx},${dy}) round=${f.round} perfs=${perfs.join(' ') || 'none'}` });
      }
    } catch (e) {}
    return origExit(dx, dy);
  };
  const origEnd = Game.tbEnd;
  Game.tbEnd = function (result) {
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const tlbm = f.trickLogByMid || {};
        const perfs = [];
        for (const [mid, arr] of Object.entries(tlbm)) if ((arr || []).length) perfs.push(mid + ':' + arr.join(','));
        if (perfs.length) {
          let pAlive = false;
          try { const p = Game.tbFighter('p'); pAlive = !!(p && p.alive); } catch (e) {}
          beats.push({ day: day(), msg: `@@PERF@@ result=${result} scholarAlive=${pAlive} rounds=${f.round} perfs=${perfs.join(' ')}` });
        }
      }
    } catch (e) {}
    return origEnd.apply(this, arguments);
  };
  await quietLog(async () => runDays(Game, policy, { days: 180, sampleEvery: 15 }));
  const out = `evidence/2026-10-17/performretire-beats/${policyId}-s${seed}.json`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(beats, null, 1));
  console.log(`wrote ${out} (${beats.length} beats)`);
})().catch(e => { console.error('beats crashed: ' + e.stack); process.exit(1); });
