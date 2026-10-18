#!/usr/bin/env node
// sense-cookbeats-b2.js — SENSE-TESTING LAW: capture one duty-day's cook beats.
// Reads the actual narration lines the duty-time cook drive emits, so the
// evidence can judge whether the drive reads as a cook taking stock for
// tomorrow's dinner — not a robot. Prints the distinct beat shapes seen.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

(async () => {
  const { Game } = await loadGame({ seed: 17013, mode: 'sense-cookbeats', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say;
  Game.say = function (s) {
    const t = String(s);
    if (/cooked for the haven|smoke racks|racks are already full/.test(t)) beats.push({ day: (Game.state.scholar || {}).day || 0, line: t });
    return origSay.apply(this, arguments);
  };
  const t0 = Date.now();
  await runDays(Game, leadfeast, { days: 40, manifest: null });
  console.log(`captured ${beats.length} cook beats over 40 days (${Date.now() - t0}ms)`);
  const shapes = new Map();
  for (const b of beats) {
    const shape = b.line.replace(/🍲|—/g, '').replace(/~?[\d,]+ kcal/g, '~N kcal').replace(/\d+ batch(es)?/g, 'N batch(es)').replace(/keeps [a-z ]+/g, 'keeps X').trim();
    shapes.set(shape, (shapes.get(shape) || 0) + 1);
  }
  for (const [shape, n] of shapes) console.log(`[${n}x] ${shape}`);
  console.log('\n--- verbatim samples (first 6) ---');
  for (const b of beats.slice(0, 6)) console.log(`day ${b.day}: ${b.line}`);
})();
