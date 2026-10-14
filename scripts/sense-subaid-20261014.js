#!/usr/bin/env node
// scripts/sense-subaid-20261014.js — SENSE-TESTING for the SUBAID arm.
//
// Reads the actual tend/grain beats and tribute-arrival lines from armed
// (and baseline) runs and prints them for human judgment: the grain
// arriving must read as feeding, the trust beats must be unchanged, and
// the tribute lines must name the true reason (empty fields vs defiance).
// Judgment is on meaning, not counts (SENSE-TESTING LAW, Steve 2026-10-11).
//
// Usage:
//   FOURTHLINK=1 FIFTHLINK=1 ARMED_ENGINE=1 SEEDS=11,55 node scripts/sense-subaid-20261014.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fifthlink } = require('./policies/fifthlink-r26');

(async () => {
  const seeds = (process.env.SEEDS || '11,55').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'subaid-sense' });
    await setupGame(Game);
    const lines = [];
    Game.say = (m) => { try { lines.push(String(m)); } catch (e) {} };
    const ctx = {};
    await runDays(Game, fifthlink, { days: 180 });
    const tend = lines.filter(l => /Haven sends/.test(l));
    const tribute = lines.filter(l => /[Tt]ribute/.test(l) && !/Haven sends/.test(l)).slice(0, 12);
    const renego = lines.filter(l => /Met grief with grain/.test(l));
    console.log(`\n===== seed ${seed}: ${tend.length} tend beats, ${lines.filter(l => /[Tt]ribute/.test(l)).length} tribute lines, ${renego.length} grief-grain beats =====`);
    console.log('--- TEND BEATS (first 5) ---');
    tend.slice(0, 5).forEach(l => console.log('  ' + l));
    console.log('--- TRIBUTE-ARRIVAL LINES (first 12) ---');
    tribute.forEach(l => console.log('  ' + l));
    if (renego.length) {
      console.log('--- GRIEF-GRAIN BEATS (first 3, untouched sibling verb) ---');
      renego.slice(0, 3).forEach(l => console.log('  ' + l));
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
