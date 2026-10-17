#!/usr/bin/env node
// scripts/beats-perfsurvive-20261017.js — beat capture for sense reads.
// Re-runs one armed seed with Game.say wrapped; logs fight beats around
// performed-trick fights.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { perfsurviveLead, perfsurviveBelong } = require('./policies/perfsurvive');

(async () => {
  const seed = parseInt(process.env.SEED || '9931', 10);
  const policyId = process.env.POLICY || 'perfsurvive-lead';
  const policy = policyId === 'perfsurvive-belong' ? perfsurviveBelong : perfsurviveLead;
  process.env.PERFSURVIVE = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'perfsurvive-beats', fullTelemetry: true });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      const f = Game.tbfight;
      if (f && !f.over) beats.push({ day: (Game.state.scholar || {}).day, msg: String(msg).slice(0, 300) });
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  // mark performed fights
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
          beats.push({ day: (Game.state.scholar || {}).day, msg: `@@PERF@@ result=${result} scholarAlive=${pAlive} perfs=${perfs.join(' ')}` });
        }
      }
    } catch (e) {}
    return origEnd.apply(this, arguments);
  };
  await quietLog(async () => runDays(Game, policy, { days: 180, sampleEvery: 15 }));
  const out = `evidence/2026-10-17/perfsurvive-beats/${policyId}-s${seed}.json`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(beats, null, 1));
  console.log(`wrote ${out} (${beats.length} beats)`);
})().catch(e => { console.error('beats crashed: ' + e.stack); process.exit(1); });
