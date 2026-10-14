#!/usr/bin/env node
// scripts/sense-tribdisc-20261014.js — SENSE-TESTING for SIM-TRIBDISC.
// Runs the armed tribdisc policy (belongfeast — the tribute road) and dumps
// the tribute beats with day stamps for a human meaning read: the early-pay
// beat, the engine's payment beats, shortfalls, arrears notes.
//
// Usage: FEASTSCALE_R13=1 TRIBDISC=1 node scripts/sense-tribdisc-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let TD = null;
try { TD = require('./policies/tribdisc'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: tribdisc layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const { tribbelong } = TD;

const SEED = parseInt(process.env.SEED || '22', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'tribdisc-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { beats.push({ day: (Game.state.scholar || {}).day || 0, text: String(msg || '').slice(0, 320) }); } catch (e) {}
    return origSay(msg);
  };
  const policy = Object.assign({}, tribbelong);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: DAYS + 1 }); });
  const OS = /walks out early|pull tribute forward|Tribute paid|Tribute short|arrears|Tribute is already current/;
  const shown = beats.filter(b => OS.test(b.text));
  console.log(`== sense: tribbelong s${SEED} ${DAYS}d — ${shown.length} tribute beats ==`);
  console.log(`verbs: tdEarly=${runCtx ? runCtx.tdEarly : '?'} tdEarlyKcal=${runCtx ? runCtx.tdEarlyKcal : '?'} tdFragile=${runCtx ? runCtx.tdFragile : '?'}`);
  for (const b of shown) console.log(`[d${b.day}] ${b.text}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
