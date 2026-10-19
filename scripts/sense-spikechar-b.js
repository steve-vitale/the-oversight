#!/usr/bin/env node
// sense-spikechar-b.js — SENSE-TESTING LAW read for the spike characterization.
// Replays one armed seed with narration live, instruments spike trims +
// post-census mild-hunger days, and prints the narration around attributed
// spike→mild-hunger sequences: does the hunger read as a consequence of the
// trim, or as weather?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 SEED=6611 POLICY=leadfeast
//   DAYS=180 node scripts/sense-spikechar-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
process.env.SURPLUSFEED = '1';

const SEED = parseInt(process.env.SEED || '6611', 10);
const POLICY = process.env.POLICY === 'belongfeast' ? belongfeast : leadfeast;
const DAYS = parseInt(process.env.DAYS || '180', 10);

function hungerCensus(Game) {
  let nHungry = 0;
  const names = [];
  try {
    for (const id of (((Game.state || {}).village || {}).roster) || []) {
      let p = null;
      try { p = Game.getPerson(id); } catch (e) {}
      if (!p || p.dead) continue;
      let h = 0;
      try { h = (Game.npcNeeds(id).hunger) || 0; } catch (e) {}
      if (h > 70) { nHungry++; names.push(String(p.name || '?').split(' ')[0] + ':' + Math.round(h)); }
    }
  } catch (e) {}
  return { nHungry, names };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'spikechar-b-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const dawnByDay = {}, spikeDays = new Set(), mildDays = new Map();
  const beats = [], ctx = [];

  const oGov = Game.surplusFeedGovernor;
  Game.surplusFeedGovernor = function (v, give) {
    const day = (Game.state.scholar || {}).day || 0;
    let fireFd = -1;
    try { fireFd = Game.pantryFreshDays(); } catch (e) {}
    const dawnFd = (dawnByDay[day] !== undefined) ? dawnByDay[day] : -1;
    const r = oGov.apply(this, arguments);
    try {
      if (typeof r === 'number' && r < give && dawnFd >= 0 && dawnFd <= 4 && fireFd > 4) {
        spikeDays.add(day);
      }
    } catch (e) {}
    return r;
  };
  const oSleep = Game.sleep;
  Game.sleep = function () {
    const dayEnded = (Game.state.scholar || {}).day || 0;
    const r = oSleep.apply(this, arguments);
    try {
      const dayAfter = (Game.state.scholar || {}).day || 0;
      dawnByDay[dayAfter] = Game.pantryFreshDays();
      const c = hungerCensus(Game);
      if (c.nHungry > 0) mildDays.set(dayEnded, c.names);
    } catch (e) {}
    return r;
  };
  const oSay = Game.say;
  Game.say = function (msg) {
    try { if (String(msg).includes('groaning pantry shelves')) beats.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: String(msg) }); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const oEmit = Game.emit;
  Game.emit = function (text, surface) {
    try {
      if (surface === 'narration' && String(text).length > 20) {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d >= 80 && d <= 160) ctx.push({ day: d, text: String(text).slice(0, 220) });
      }
    } catch (e) {}
    return oEmit.apply(this, arguments);
  };

  await runDays(Game, POLICY, { days: DAYS, manifest: null });

  // attributed sequences: mild day D with a spike trim on D or D-1
  const attributed = [];
  for (const [d, names] of mildDays) {
    if (spikeDays.has(d) || spikeDays.has(d - 1)) attributed.push({ day: d, names, spikeDay: spikeDays.has(d) ? d : d - 1 });
  }
  console.log(`seed=${SEED} spikeDays=${spikeDays.size} mildDays=${mildDays.size} attributed=${attributed.length} beats=${beats.length}`);
  const show = attributed.slice(0, 6);
  for (const a of show) {
    console.log(`\n=== attributed: spike trim day ${a.spikeDay} -> mild-hunger day ${a.day} (${a.names.join(', ')}) ===`);
    const near = ctx.filter(c => c.day >= a.spikeDay - 1 && c.day <= a.day + 1).slice(-10);
    for (const c of near) console.log(`[d${c.day}] ${c.text}`);
  }
  if (!show.length) console.log('NO ATTRIBUTED SEQUENCES');
  if (beats.length) {
    console.log('\n--- governor beats ---');
    for (const b of beats.slice(0, 4)) console.log(`[d${b.day}] ${b.text.slice(0, 200)}`);
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
