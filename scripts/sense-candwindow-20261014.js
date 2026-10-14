#!/usr/bin/env node
// scripts/sense-candwindow-20261014.js — SENSE-TESTING for the candwindow arm.
//
// Reads the actual proposal/tend/counter beats from armed (and control)
// runs and prints them for human judgment: proposals must read as the
// courtship climb, the suppressed feasts must simply be absent (never
// narrated as refused), and the tend beats must be unchanged.
// Judgment is on meaning, not counts (SENSE-TESTING LAW, Steve 2026-10-11).
//
// Usage:
//   FOURTHLINK=1 FIFTHLINK=1 node scripts/sense-candwindow-20261014.js
//   FOURTHLINK=1 FIFTHLINK=1 CANDWINDOW=1 node scripts/sense-candwindow-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
const ARMED = process.env.CANDWINDOW === '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { fifthlink } = require('./policies/fifthlink-r26');
const { candwindow } = require('./policies/candwindow');
const policy = ARMED ? candwindow : fifthlink;

(async () => {
  const seeds = (process.env.SEEDS || '11,66').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'candwindow-sense' });
    await setupGame(Game);
    const lines = [];
    Game.say = (m) => { try { lines.push(String(m)); } catch (e) {} };
    const ctx = {};
    await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 }); });
    const prop = lines.filter(l => /declines\.|doesn't say no|doesn't answer the knock|bows to Haven|There is already a link/.test(l)).slice(0, 8);
    const tend = lines.filter(l => /Haven sends/.test(l)).slice(0, 4);
    const counter = lines.filter(l => /The table is set|The gift talks|They take the food|sweeten/.test(l)).slice(0, 6);
    const feast = lines.filter(l => /host the feast|hostFeast|evening feast/i.test(l)).slice(0, 4);
    const study = lines.filter(l => /codex keeper|linked\. I can see|study .*codex/i.test(l)).slice(0, 4);
    console.log(`\n===== seed ${seed} (${ARMED ? 'ARMED' : 'control'}): ${prop.length} proposal-ish, ${tend.length} tend, ${counter.length} counter, ${study.length} study lines =====`);
    console.log('--- PROPOSAL/COURTSHIP (first 8) ---');
    prop.forEach(l => console.log('  ' + l.slice(0, 220)));
    console.log('--- COUNTERS (first 6) ---');
    counter.forEach(l => console.log('  ' + l.slice(0, 220)));
    console.log('--- TEND BEATS (first 4) ---');
    tend.forEach(l => console.log('  ' + l.slice(0, 220)));
    console.log('--- STUDY/CODEX (first 4) ---');
    study.forEach(l => console.log('  ' + l.slice(0, 220)));
    console.log('--- FEAST HOST LINES (first 4) ---');
    feast.forEach(l => console.log('  ' + l.slice(0, 220)));
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
