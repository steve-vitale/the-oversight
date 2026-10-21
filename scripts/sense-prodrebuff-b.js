#!/usr/bin/env node
// sense-glut-b.js — SENSE-TESTING LAW read for sim-prodrebuff-b.
//
// Runs one permanent-glut config 60d and dumps the economy beats to a
// transcript file for a human read: does the over-production read as
// villagers behaving like people (ambitious crew leads, cultural norms)
// or as a missing feedback loop?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 POLICY=leadfeast SEED=8801 \
//   DAYS=60 OUT=evidence/2026-10-21/prodrebuff-sense.txt \
//   node scripts/sense-glut-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const POLICY = process.env.POLICY === 'belongfeast' ? belongfeast : leadfeast;
const SEED = parseInt(process.env.SEED || '8801', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const OUT = process.env.OUT || 'evidence/2026-10-21/prodrebuff-sense.txt';

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'prodrebuff-sense', fullTelemetry: false });
  await setupGame(Game);
  const W = attachProbe(Game);
  await runDays(Game, POLICY, { days: DAYS, manifest: null });

  // day-by-day economy log: dawn state + that day's inflow + beats
  const lines = [];
  lines.push(`SENSE TRANSCRIPT — sim-prodrebuff-b — ${process.env.POLICY || 'leadfeast'} seed ${SEED}, ${DAYS}d`);
  lines.push('');
  const beatsByDay = {};
  for (const b of W.sayLines) {
    (beatsByDay[b.day] = beatsByDay[b.day] || []).push(b.line);
  }
  const dawnByDay = {};
  for (const s of W.dawnSamples) dawnByDay[s.day] = s;
  const days = [...new Set([...Object.keys(dawnByDay).map(Number), ...Object.keys(beatsByDay).map(Number)])].sort((a, b) => a - b);
  for (const d of days) {
    const s = dawnByDay[d];
    const di = W.dayInflow[d] || {};
    const totIn = Object.values(di).reduce((a, b) => a + b, 0);
    lines.push(`--- d${d} ${s ? `pantry=${Math.round(s.pantryKcal / 1000)}k freshDays=${s.freshDays.toFixed(1)} doomed=${Math.round(s.doomedKcal / 1000)}k roster=${s.roster}` : '(no dawn sample)'} inflow=${Math.round(totIn / 1000)}k [${Object.entries(di).map(([c, k]) => c + ':' + Math.round(k / 1000) + 'k').join(' ')}]`);
    for (const b of (beatsByDay[d] || [])) lines.push('    ' + b);
  }
  fs.writeFileSync(OUT, lines.join('\n') + '\n');
  console.log('wrote ' + OUT + ' (' + lines.length + ' lines)');
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
