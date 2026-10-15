#!/usr/bin/env node
// sense-succevac-20261015.js — SENSE-TESTING for the successor-evacuate lever.
// Captures the full say-stream of an armed run and prints the transcript
// window around each evac line, plus the death that triggered it. The
// evacuation must read as a village decision, not a teleport.
// Usage: SEEDS=44 node scripts/sense-succevac-20261015.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.SUCCEVAC = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { succevac } = require('./policies/succevac');

const EVAC_RE = /won't sleep at Haven tonight/;

async function main() {
  const seed = parseInt(process.env.SEEDS || '44', 10);
  const days = parseInt(process.env.DAYS || '180', 10);
  const { Game } = await loadGame({ seed, mode: 'succevac-sense', fullTelemetry: true });
  await setupGame(Game);
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const sayStream = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (m) {
    try { sayStream.push({ day: gday(), text: String(m).slice(0, 300) }); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  // death-tile stamp for the layer (read-only tele wrap — the layer reads ev.tile)
  const origTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'death' && data && data.player) {
        try { data.tile = this.map ? [this.map.px, this.map.py] : null; } catch (e2) {}
      }
    } catch (e) {}
    return origTele.apply(this, arguments);
  };
  const base = succevac;
  const policy = Object.assign({}, base, { id: base.id + '+sense' });
  await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const evacIdx = sayStream.map((s, i) => EVAC_RE.test(s.text) ? i : -1).filter(i => i >= 0);
  console.log(`seed ${seed}: ${evacIdx.length} evac line(s) in ${sayStream.length} say lines`);
  for (const i of evacIdx.slice(0, 4)) {
    console.log(`\n=== evac at say#${i} (day ${sayStream[i].day}) ===`);
    for (let j = Math.max(0, i - 6); j <= Math.min(sayStream.length - 1, i + 4); j++) {
      const mark = j === i ? '>>> ' : '    ';
      console.log(`${mark}[d${sayStream[j].day}] ${sayStream[j].text}`);
    }
  }
  if (!evacIdx.length) {
    // print scholar-death-adjacent transcript instead (why no evac?)
    const deaths = sayStream.map((s, i) => /is dead/.test(s.text) ? i : -1).filter(i => i >= 0);
    console.log(`\n(no evac fired; ${deaths.length} scholar-death lines)`);
    for (const i of deaths.slice(0, 2)) {
      console.log(`\n--- death at say#${i} (day ${sayStream[i].day}) ---`);
      for (let j = Math.max(0, i - 3); j <= Math.min(sayStream.length - 1, i + 3); j++) {
        console.log(`    [d${sayStream[j].day}] ${sayStream[j].text}`);
      }
    }
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
