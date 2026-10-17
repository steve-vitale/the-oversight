#!/usr/bin/env node
// scripts/diag-shellrevive-gates.js — gate audit on a firing seed (s7605 leadfeast armed).
// Counts days the scholar is hungry WITH in-shell nuts in the pack, and how
// the layer's gates resolve: leanDay true, blocked by act (fight/contest),
// blocked by time, or fired. Distinguishes "nuts never in pack on lean
// days" (substrate) from "layer fails to fire" (bug).
'use strict';
const ST = require('./policies/shelltask-b');
const { leadfeast } = require('./policies/feastscale');
process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0'; process.env.SHELLCAMP = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  const seed = parseInt(process.env.SEED || '7605', 10);
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const pol = ST.withShellTask(leadfeast, 'leadfeast+shell', 'diag');
  const base = pol.daily;
  const c = { hungryNutDays: 0, leanTrue: 0, blockedAct: 0, blockedTime: 0, fired: 0, ediblePresent: 0 };
  pol.daily = (G, ctx) => {
    try {
      const s = (G.state || {}).scholar || {};
      const cap = typeof G.kcalCap === 'function' ? G.kcalCap() : 3000;
      const nuts = ST.shellableNuts(G).length;
      if (s.kcal < cap && nuts > 0) {
        c.hungryNutDays++;
        if (!ST.leanDay(G)) c.ediblePresent++;
        else if (!ST.scholarCanAct(G)) c.blockedAct++;
        else if (!ST.timeToSpare(G)) c.blockedTime++;
        else c.leanTrue++;
      }
    } catch (e) {}
    const r = base(G, ctx);
    try { c.fired = ctx.stShellDays || 0; } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, pol, { days: 180, sampleEvery: 30 }); });
  console.log('DIAG', JSON.stringify({ seed, gameDays: result.gameDays, ...c }));
})().catch(e => { console.error('DIAG FAILED', e); process.exit(1); });
