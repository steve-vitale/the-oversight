#!/usr/bin/env node
// sense-smokeorder-b.js — capture the cook's smoke/racks-full beats on pinned
// fixtures for sense-reading (SENSE-TESTING LAW). Restores sysSay in engine
// format (lesson a: the harness stubs G.sysSay to no-op; a Game.say-only
// wrap would render System-voiced beats silent).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function stack(day, name, units, kcalEach, spoilIn, state) {
  return { name, kcalEach, units, spoilDay: day + spoilIn, foodKind: 'meat',
           foodState: state || 'fresh', safe: false, kg: 0.2, unit: 'portion' };
}

async function scenario(name, pantryFn) {
  const { Game } = await loadGame({ seed: 777, mode: 'sense-smokeorder', fullTelemetry: false });
  await setupGame(Game);
  // Lesson (a): restore sysSay in engine format so System-voiced beats render.
  if (Game.sysSay) {
    const orig = Game.sysSay;
    try {
      const fmt = Game.formatSys ? Game.formatSys.bind(Game) : (s) => String(s);
      Game.sysSay = (s) => Game.say(fmt(s));
    } catch (e) { /* keep stub if format unknown */ }
  }
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const vid = (v.roster || [])[0];
  v.pantry = [];
  pantryFn(day, v);
  const lines = [];
  Game.say = (s) => { lines.push(String(s)); };
  Game.resolveOneAssignment(vid, { task: 'cook' });
  console.log('=== ' + name + ' ===');
  for (const l of lines) console.log(l);
  console.log('');
}

(async () => {
  // Scenario 1: racks-full — preserved stock above the blind cap, fresh surplus present.
  await scenario('RACKS-FULL (guard binds)', (day, v) => {
    v.pantry.push(stack(day, 'Deer (dried)', 100, 200, 20, 'preserved')); // 20k preserved
    v.pantry.push(stack(day, 'Deer meat', 20, 200, 1));  // 4000 doomed fresh
    v.pantry.push(stack(day, 'Turkey meat', 20, 150, 2)); // 3000 near-expiry
  });
  // Scenario 2: racks open — thin preserved stock, urgent fresh surplus.
  await scenario('RACKS-OPEN (guard clear)', (day, v) => {
    v.pantry.push(stack(day, 'Deer (dried)', 5, 200, 20, 'preserved')); // 1k preserved
    v.pantry.push(stack(day, 'Deer meat', 20, 200, 1));  // 4000 doomed fresh
    v.pantry.push(stack(day, 'Turkey meat', 20, 150, 2)); // 3000 near-expiry
  });
})();
