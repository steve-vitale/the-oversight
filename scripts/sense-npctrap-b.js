#!/usr/bin/env node
// scripts/sense-npctrap-b.js — SENSE-TESTING LAW reader for the NPC trapper
// economy census (arm sim-npctrap-b, run fleshout-loop-b-20261019T0130Z).
// Runs one channel-on seed and prints every pit-trapper beat from the
// game's own narration log so a human can judge meaning and coherence,
// plus a short sample of villager voices (teach / catch / quiet beats).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-npctrap-b.js [seed] [policy]
// Default: seed 9421 (1 background knowsPit villager on the smoke run), leadfeast.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

(async () => {
  const seed = Number(process.argv[2] || 9421);
  const policy = (process.argv[3] || 'leadfeast') === 'belongfeast' ? belongfeast : leadfeast;
  delete process.env.PITKNOWLEDGE;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (s) { try { if (typeof s === 'string' && /pit[ _-]?trap|pit line|pit was|🪤/i.test(s)) beats.push(s); } catch (e) {} return oSay.call(this, s); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180 }); });
  Game.say = oSay;
  console.log(`seed=${seed} days=${result && result.days} end=${result && result.endReason} pitBeats=${beats.length}`);
  const seen = new Set();
  for (const l of beats) {
    const k = l.slice(0, 90);
    if (seen.has(k)) continue;
    seen.add(k);
    console.log('---');
    console.log(l.slice(0, 700));
  }
  const rk = ((Game.state.codex || {}).recipes || {}).pit_trap || {};
  console.log('---');
  console.log('final pit_trap:', JSON.stringify(rk));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
