#!/usr/bin/env node
// scripts/sense-overdraw4-20261014.js — SENSE-TESTING for SIM-OVERDRAW4.
// Runs the armed overdraw4 policy (seed 22, leadcourt) and dumps the
// drawdown cause lines + the engine beats that follow them, with day
// stamps, for a human meaning read.
//
// Usage: OVERDRAW4=1 node scripts/sense-overdraw4-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let OVER = null;
try { OVER = require('./policies/overdraw4'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: overdraw4 layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const { overlead4 } = OVER;

const SEED = parseInt(process.env.SEED || '22', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'overdraw4-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { beats.push({ day: (Game.state.scholar || {}).day || 0, text: String(msg || '').slice(0, 300) }); } catch (e) {}
    return origSay(msg);
  };
  const policy = Object.assign({}, overlead4);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: DAYS + 1 }); });
  const OS = /not the rot|eat the mountain tonight|🌾 Haven sends|🍖 FEAST|Tribute paid|Tribute short|while the grain is still good/;
  const shown = beats.filter(b => OS.test(b.text));
  console.log(`== sense: overlead4 s${SEED} ${DAYS}d — ${shown.length} drawdown beats ==`);
  console.log(`verbs: aid=${runCtx.osAid || 0} feasts=${runCtx.osFeasts || 0} gateHeld=${runCtx.osGateHeld || 0}`);
  for (const b of shown) console.log(`[d${b.day}] ${b.text}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
