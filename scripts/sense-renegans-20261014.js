#!/usr/bin/env node
// scripts/sense-renegans-20261014.js — SENSE-TESTING for the renegans arm.
//
// Re-runs one seed with narration ENABLED and dumps the renegotiation
// say-lines plus the answering link's history, so a human can judge whether
// the policy's beat answers read as coherent village decisions or robotic
// clicks. Usage: SEED=44 node scripts/sense-renegans-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.RENEGANS = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { renegans } = require('./policies/renegans');

const SEED = parseInt(process.env.SEED || '44', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'renegans-sense' });
  await setupGame(Game);
  const lines = [];
  Game.say = function (s) { try { lines.push({ day: (Game.state.scholar || {}).day || 0, text: String(s).slice(0, 260) }); } catch (e) {} };
  const policy = Object.assign({}, renegans);
  const result = await runDays(Game, policy, { days: 180 });
  console.log(`seed ${SEED}: d=${result.days} ${result.endReason}`);
  const keep = /renegot|grief|silence answered|speaker|tribute|trust \+|trust -/i;
  console.log(`\n--- renegotiation narration (seed ${SEED}) ---`);
  let n = 0;
  for (const l of lines) {
    if (keep.test(l.text)) { console.log(`[d${l.day}] ${l.text}`); if (++n >= 40) break; }
  }
  console.log(`\n--- link histories with renegotiation notes ---`);
  for (const l of (Game.hierarchyState() || [])) {
    const hs = (l.history || []).filter(h => h.kind === 'renegotiation' || h.kind === 'succession');
    if (!hs.length) continue;
    const other = l.primary === 'haven' ? l.subordinate : l.primary;
    console.log(`link ${l.id.slice(0, 14)} (${other}): formed d${l.day}, trust ${l.trust | 0}, status ${l.status}`);
    for (const h of hs) console.log(`  [d${h.day}][${h.kind}] ${String(h.note).slice(0, 220)}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
