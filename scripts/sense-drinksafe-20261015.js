#!/usr/bin/env node
// sense-drinksafe-20261015.js — SENSE-TESTING LAW probe for sim-drinksafe-b.
// Runs the ARMED policy (worktree competent.js, fixed regex) on the canonical
// ranging seeds and prints real fill/drink/water say-beats with day context.
// Read them as a person deciding, not a dispenser: include 2-3 excerpts in
// the evidence file.
// Usage: node scripts/sense-drinksafe-20261015.js [seed] [policyId]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const seed = parseInt(process.argv[2] || '55', 10);
const policyId = process.argv[3] || 'leadcourt';
const RX = /fill|Filled|drink|Drank|thirst|hydrat|water|cistern|boil|bottle/i;

async function main() {
  const policy = require('./policies/' + policyId)[policyId];
  const { Game } = await loadGame({ seed, mode: `drinksafe-sense-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const day = (Game.state.scholar || {}).day || 0;
      if (typeof msg === 'string' && RX.test(msg)) {
        let tile = null, ah = null;
        try { const t = Game.playerTile(); tile = t && t.type; } catch (e) {}
        try { ah = Game.playerAtHaven(); } catch (e) {}
        beats.push({ day, tile, atHaven: ah, msg: msg.slice(0, 220) });
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 10 }); });
  console.log(`sense: ${policyId} s${seed} armed, ${beats.length} water beats over ${Game.state.scholar.day}d`);
  // print fill beats + a sample of drink beats, with day/tile context
  const fills = beats.filter(b => /fill|Filled|bottle/i.test(b.msg));
  const drinks = beats.filter(b => !/fill|Filled|bottle/i.test(b.msg));
  console.log(`--- FILL BEATS (${fills.length}) ---`);
  for (const b of fills.slice(0, 40)) console.log(`d${b.day} [${b.tile}${b.atHaven ? ',haven' : ''}] ${b.msg}`);
  if (fills.length > 40) console.log(`... +${fills.length - 40} more`);
  console.log(`--- DRINK/WATER BEATS (${drinks.length}, first 25) ---`);
  for (const b of drinks.slice(0, 25)) console.log(`d${b.day} [${b.tile}${b.atHaven ? ',haven' : ''}] ${b.msg}`);
}
main().catch(e => { console.error('SENSE ERROR', e); process.exit(2); });
