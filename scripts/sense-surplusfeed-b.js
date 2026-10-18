#!/usr/bin/env node
// sense-surplusfeed-b.js — SENSE-TESTING LAW read: does the easing beat read
// as people behaving sensibly? Runs one armed seed with narration live and
// prints the easing beat lines plus the pantry/economic context around them.
//
// Usage: SEED=6401 POLICY=leadfeast DAYS=120 node scripts/sense-surplusfeed-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
process.env.SURPLUSFEED = '1';

const SEED = parseInt(process.env.SEED || '6401', 10);
const POLICY = process.env.POLICY === 'belongfeast' ? belongfeast : leadfeast;
const DAYS = parseInt(process.env.DAYS || '120', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'surplusfeed-b-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (msg) {
    try { if (String(msg).includes("groaning pantry shelves")) beats.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: String(msg) }); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  // capture a few glut-day narration lines around each beat for context
  const ctx = [];
  const oEmit = Game.emit;
  Game.emit = function (text, surface) {
    try {
      if (surface === 'narration' && String(text).length > 20) {
        ctx.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: String(text).slice(0, 160) });
        if (ctx.length > 400) ctx.shift();
      }
    } catch (e) {}
    return oEmit.apply(this, arguments);
  };
  await runDays(Game, POLICY, { days: DAYS, manifest: null });
  const v = Game.state.village || {};
  const sf = v._surplusFeed || {};
  const trimDays = Object.keys(sf.days || {}).length;
  console.log(`seed=${SEED} days=${DAYS} trimDays=${trimDays} beats=${beats.length}`);
  for (const b of beats) {
    console.log(`\n--- beat day ${b.day} ---`);
    console.log(b.text);
    let freshDays = 0;
    try { freshDays = Game.pantryFreshDays(); } catch (e) {}
    console.log(`[context] pantryFreshDays(at end)=${(+freshDays).toFixed(1)} roster=${(v.roster || []).length}`);
    const near = ctx.filter(c => Math.abs(c.day - b.day) <= 1).slice(-6);
    for (const c of near) console.log(`[d${c.day}] ${c.text}`);
  }
  if (!beats.length) console.log('NO BEATS FIRED');
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
