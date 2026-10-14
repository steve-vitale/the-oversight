#!/usr/bin/env node
// scripts/sense-feastdoor-20261014.js — SENSE-TEST for the FEASTDOOR arm.
// Runs one armed 120d seed and prints the feast/duty beats for a human read
// (SENSE-TESTING LAW: transcripts, not counts).
//
// Usage: FEASTDOOR=1 FEASTSCALE_R13=1 SEED=22 node scripts/sense-feastdoor-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { doorlead } = require('./policies/feastdoor');

const SEED = parseInt(process.env.SEED || '22', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'feastdoor-sense', fullTelemetry: false });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t) { said.push({ day: (Game.state.scholar || {}).day || 0, text: String(t) }); return origSay(t); };
  let runCtx = null;
  const policy = Object.assign({}, doorlead);
  const origSetup = doorlead.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 120, manifest: undefined, sampleEvery: 10 }); });
  console.log(`seed ${SEED}: days=${result.days} end=${result.endReason}`);
  console.log(`duty feasts: ${runCtx.fdFeasts || 0} (${Math.round(runCtx.fdFeastKcal || 0)} kcal), gate-held: ${runCtx.fdGateHeld || 0} (linger=${runCtx.fdGateHeld_linger || 0} gorge=${runCtx.fdGateHeld_gorge || 0} raid=${runCtx.fdGateHeld_raid || 0})`);
  console.log('\n--- feast/duty beats (human read) ---');
  for (const s of said) {
    if (/🍖|mountain tonight|FEAST/.test(s.text)) {
      console.log(`[d${s.day}] ${s.text.slice(0, 320)}`);
    }
  }
  console.log('\n--- surge/deed state ---');
  try {
    const pg = Game.progState ? Game.progState() : {};
    const sp = (Game.state.scholar || {}).prog || {};
    console.log(`sentimentTaught=${!!pg.sentimentTaught} feastSurgeUsed=${!!sp.feastSurgeUsed}`);
    if (typeof Game.tableSeat === 'function') console.log('tableSeat=' + JSON.stringify(Game.tableSeat().seat));
  } catch (e) { console.log('deed read failed: ' + e.message); }
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
