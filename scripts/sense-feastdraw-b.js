#!/usr/bin/env node
// sense-feastdraw-b.js — sense-test the seconds beat (SENSE-TESTING LAW).
// Runs one armed seed, captures the "seconds all round" voice lines with
// surrounding context, and prints 1-2 full dinner beats for reading.
// Usage: SEED=6203 POLICY=leadfeastdraw DAYS=60 node scripts/sense-feastdraw-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { withFeastDraw } = require('./policies/feastdraw');

const POLICIES = {
  leadfeastdraw: withFeastDraw(leadfeast, 'leadfeastdraw', 'sense'),
  belongfeastdraw: withFeastDraw(belongfeast, 'belongfeastdraw', 'sense'),
};
const SEED = parseInt(process.env.SEED || '6203', 10);
const POLICY = POLICIES[process.env.POLICY || 'leadfeastdraw'];
const DAYS = parseInt(process.env.DAYS || '60', 10);

(async () => {
  process.env.FEASTDRAW = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-feastdraw', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) {
    try { lines.push({ day: (Game.state.scholar || {}).day || 0, text: String(s) }); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const ctx = {};
  await runDays(Game, Object.assign({}, POLICY, {
    setup(G, c) { Object.assign(ctx, {}); return POLICY.setup(G, Object.assign(c, ctx)); },
  }), { days: DAYS, manifest: null });
  const beats = lines.map((l, i) => ({ ...l, i })).filter(l => /seconds all round/.test(l.text));
  console.log(`seed=${SEED} policy=${POLICY.id} days=${DAYS}: ${beats.length} seconds beats\n`);
  for (const b of beats.slice(0, 4)) {
    console.log(`--- d${b.day} (beat ${b.i}) ---`);
    for (let j = Math.max(0, b.i - 2); j <= Math.min(lines.length - 1, b.i + 2); j++) {
      const mark = j === b.i ? '>>>' : '   ';
      console.log(`${mark} d${lines[j].day}: ${lines[j].text.slice(0, 280)}`);
    }
    console.log('');
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
