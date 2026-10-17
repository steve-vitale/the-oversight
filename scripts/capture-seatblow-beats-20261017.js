#!/usr/bin/env node
// scripts/capture-seatblow-beats-20261017.js — sense-read beat capture for
// sim-seatblow-open. Runs leadfeast on the armed tree and dumps narration
// context around every villager feasted/overcharged blow, so a human can
// judge whether it reads as a person fighting (SENSE-TESTING LAW).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS=61111 DAYS=90 node scripts/capture-seatblow-beats-20261017.js
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SEEDS || '61111', 10);
const DAYS = parseInt(process.env.DAYS || '90', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'seatblow-beats' });
  await setupGame(Game);
  const log = [];
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const _say = Game.say;
  Game.say = function (msg) {
    let r; try { r = _say.apply(this, arguments); } catch (e) {}
    try { log.push({ day: dayOf(), line: String(msg) }); } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, leadfeast, { days: DAYS, sampleEvery: 30 }); });
  const hits = [];
  log.forEach((e, i) => {
    if (/'s blow carries the feast/.test(e.line) || /fights on a full belly/.test(e.line)) hits.push(i);
  });
  console.log(`seed ${SEED}: ${hits.length} villager uplift beats in ${log.length} lines`);
  const seen = new Set();
  for (const i of hits.slice(0, 6)) {
    const key = log[i].line;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`\n--- d${log[i].day}: ${key}`);
    for (let j = Math.max(0, i - 4); j < Math.min(log.length, i + 3); j++) {
      if (j === i) continue;
      console.log(`    d${log[j].day}: ${log[j].line.slice(0, 160)}`);
    }
  }
  if (!hits.length) console.log('(no villager uplift beats on this seed — try another)');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
