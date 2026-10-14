#!/usr/bin/env node
// scripts/sense-overdraw3-20261014.js — SENSE-TESTING for SIM-OVERDRAW3.
// Runs the armed overdraw3 policy (seed 22, leadcourt — the verb-heaviest
// R2 pilot seed) and dumps the drawdown cause lines + the engine beats
// that follow them, with day stamps, for a human meaning read.
//
// Usage: OVERDRAW3=1 node scripts/sense-overdraw3-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let OVER = null;
try { OVER = require('./policies/overdraw3'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: overdraw3 layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const { overlead } = OVER;

const SEED = parseInt(process.env.SEED || '22', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'overdraw3-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { beats.push({ day: (Game.state.scholar || {}).day || 0, text: String(msg || '').slice(0, 300) }); } catch (e) {}
    return origSay(msg);
  };
  const policy = Object.assign({}, overlead);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: DAYS + 1 }); });
  const OS = /not the rot|eat the mountain tonight|while the grain is still good|🌾 Haven sends|🍖 FEAST|Tribute paid|Tribute short/;
  const shown = beats.filter(b => OS.test(b.text));
  console.log(`== sense: overlead s${SEED} ${DAYS}d — ${shown.length} drawdown beats ==`);
  console.log(`verbs: aid=${runCtx.osAid || 0} feasts=${runCtx.osFeasts || 0} tribute=${runCtx.osTribute || 0} gateHeld=${runCtx.osGateHeld || 0}`);
  for (const b of shown) console.log(`[d${b.day}] ${b.text}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
