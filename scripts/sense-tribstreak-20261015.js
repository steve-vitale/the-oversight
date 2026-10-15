#!/usr/bin/env node
// scripts/sense-tribstreak-20261015.js — SENSE-TESTING for SIM-TRIBSTREAK.
// Runs the armed tribstreak policy and dumps the tribute beats with day
// stamps for a human meaning read: the early-pay beat, the engine's payment
// beats, shortfalls, arrears notes, and any hunger-crisis beats (to judge
// whether early pays happened while the village was hungry).
//
// Usage: TRIBSTREAK=1 SEED=22 DAYS=120 node scripts/sense-tribstreak-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let TH = null;
try { TH = require('./policies/tribstreak'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: tribstreak layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const POLICY = (process.env.POLICY || 'belongseek');
const pol = POLICY === 'leadcourt' ? TH.tribstreaklead : TH.tribstreakbelong;

const SEED = parseInt(process.env.SEED || '22', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'tribstreak-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { beats.push({ day: (Game.state.scholar || {}).day || 0, text: String(msg || '').slice(0, 320) }); } catch (e) {}
    return origSay(msg);
  };
  const policy = Object.assign({}, pol);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: DAYS + 1 }); });
  const OS = /walks out early|pull tribute forward|Tribute paid|Tribute short|arrears|Tribute is already current|STARVING|Day \d+ of hunger|hollow look/i;
  const shown = beats.filter(b => OS.test(b.text));
  console.log(`== sense: ${pol.id} s${SEED} ${DAYS}d — ${shown.length} tribute/hunger beats ==`);
  console.log(`verbs: tsEarly=${runCtx ? runCtx.tsEarly : '?'} tsHoldPantry=${runCtx ? runCtx.tsHoldPantry : '?'} tsHoldVillage=${runCtx ? runCtx.tsHoldVillage : '?'} tsHoldLink=${runCtx ? runCtx.tsHoldLink : '?'}`);
  let lastDay = -1;
  for (const b of shown) {
    if (b.day !== lastDay) { console.log(`\n--- day ${b.day} ---`); lastDay = b.day; }
    console.log('  ' + b.text);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
