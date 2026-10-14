#!/usr/bin/env node
// scripts/sense-fifthlink-20261014.js — SENSE-TESTING for the fifthlink arm.
//
// Re-runs one seed with narration ENABLED (the sweep silences say) and
// dumps the tend / renegotiation / tribute say-lines plus the 5th link's
// history, so a human can judge whether the tended links read as village
// diplomacy or theater. Usage: SEED=55 node scripts/sense-fifthlink-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fifthlink } = require('./policies/fifthlink');

const SEED = parseInt(process.env.SEED || '55', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'fifthlink-sense' });
  await setupGame(Game);
  // re-enable narration for this read
  const lines = [];
  Game.say = function (s) { try { lines.push({ day: (Game.state.scholar || {}).day || 0, text: String(s).slice(0, 220) }); } catch (e) {} };
  const policy = Object.assign({}, fifthlink);
  const result = await runDays(Game, policy, { days: 180 });
  console.log(`seed ${SEED}: d=${result.days} ${result.endReason}`);
  const links = (Game.hierarchyState() || []).filter(l => l.primary === 'haven').sort((a, b) => (a.day || 0) - (b.day || 0));
  links.forEach((l, i) => console.log(`  link#${i + 1} formed d${l.day} trust=${l.trust | 0} status=${l.status}`));
  const fifth = links[4];
  const keep = /tribute|grain|trust|renegot|grief|speaker|bond|fire/i;
  console.log(`\n--- narration mentioning links/bonds/grain (seed ${SEED}) ---`);
  let n = 0;
  for (const l of lines) {
    if (keep.test(l.text)) { console.log(`[d${l.day}] ${l.text}`); if (++n >= 60) break; }
  }
  if (fifth) {
    console.log(`\n--- 5th link history (formed d${fifth.day}) ---`);
    for (const h of (fifth.history || [])) console.log(`[d${h.day}][${h.kind}] ${String(h.note).slice(0, 200)}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
