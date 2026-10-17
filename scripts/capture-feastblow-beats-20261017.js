#!/usr/bin/env node
// scripts/capture-feastblow-beats-20261017.js — SENSE-TESTING read: capture
// the feast + draw-fight transcript on one armed run (feast/fire/fight
// lines), so a human can judge whether the feasted blow READS as the
// designed "feast was the weapon" moment.
//   FEASTSCALE_R13=1 SEATDRIVE=0 FEASTBLOW=1 node scripts/capture-feastblow-beats-20261017.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SEEDS || '9503', 10);
const DAYS = parseInt(process.env.DAYS || '90', 10);
const RE = /feast|FEASTED|cookfire|scavenger|circling|drawn by the feast|face it|the weapon|devotion|surge/i;

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.FEASTBLOW === '1') {
    console.error('CAPTURE STOP: need FEASTSCALE_R13=1 SEATDRIVE=0 and FEASTBLOW unset'); process.exit(2);
  }
  const { Game } = await loadGame({ seed: SEED, mode: 'feastblow-beats-base' });
  await setupGame(Game);
  const beats = [];
  const day = () => (Game.state.scholar || {}).day || 0;
  const _say = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const s = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      if (RE.test(s) && beats.length < 120) beats.push({ day: day(), text: s.slice(0, 300) });
    } catch (e) {}
    return _say(msg);
  };
  await quietLog(async () => { await runDays(Game, leadfeast, { days: DAYS, sampleEvery: 30 }); });
  console.log('seed ' + SEED + ' beats: ' + beats.length);
  for (const b of beats) console.log(`[d${b.day}] ${b.text}`);
})().catch(e => { console.error('CAPTURE FATAL', e); process.exit(1); });
