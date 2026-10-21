#!/usr/bin/env node
// sense-linkdissolve-b.js — SENSE-TESTING LAW read: does the post-court
// realm dissolution read as played, not ledger-flipped? Runs the proof
// seed (8801 armed leadfeast: court d77, dissolution d158) with narration
// live and prints the dissolution say-lines plus the tribute/trust beats
// in the post-court window.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 SEED=8801 POLICY=leadfeast DAYS=180 \
//   node scripts/sense-linkdissolve-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
process.env.SURPLUSFEED = '1';

const SEED = parseInt(process.env.SEED || '8801', 10);
const POLICY = process.env.POLICY === 'belongfeast' ? belongfeast : leadfeast;
const DAYS = parseInt(process.env.DAYS || '180', 10);

const BEAT_RE = /realm came apart|no polity answers|no longer describe|tribute|arrears|trust -|trust \+|succession|speaker is dead|pressed tribute|neglect|revolt|sabotage|The .* came apart/i;

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'linkdissolve-b-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      const day = ((Game.state || {}).scholar || {}).day || 0;
      if (day >= 70 && BEAT_RE.test(s)) beats.push({ day, text: s.slice(0, 300) });
      if (beats.length > 120) beats.shift();
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await runDays(Game, POLICY, { days: DAYS, manifest: null });
  console.log(`seed=${SEED} policy=${process.env.POLICY || 'leadfeast'} days=${DAYS} beats=${beats.length}`);
  console.log(`nationalDay=${(Game.state || {}).nationalDay} nationalLive=${!!(Game.state || {}).nationalLive}`);
  for (const b of beats) console.log(`\n[d${b.day}] ${b.text}`);
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
