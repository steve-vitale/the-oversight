#!/usr/bin/env node
// scripts/sense-succession-20261014.js — SENSE-TESTING for the succession arm.
//
// Re-runs one seed with narration ENABLED and dumps the succession say-lines
// plus the shaken links' histories, so a human can judge whether the
// protocol's responses read as coherent village decisions or robotic clicks.
// Graceful degradation: if the layer file is absent (killed arm), falls back
// to fourthlink and reports the baseline narration.
// Usage: SEED=55 node scripts/sense-succession-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.SUCCPROTO = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let policy = null;
try { policy = require('./policies/succession').succession; }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  console.error('info: succession layer absent — sensing the baseline narration.');
  policy = require('./policies/fourthlink').fourthlink;
}

const SEED = parseInt(process.env.SEED || '55', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-sense' });
  await setupGame(Game);
  const lines = [];
  Game.say = function (s) { try { lines.push({ day: (Game.state.scholar || {}).day || 0, text: String(s).slice(0, 280) }); } catch (e) {} };
  const pol = Object.assign({}, policy);
  const result = await runDays(Game, pol, { days: 180 });
  console.log(`seed ${SEED}: d=${result.days} ${result.endReason}`);
  const keep = /succession|grief|mourning|silence answered|speaker|tribute|trust \+|trust -|dead|funeral|candle/i;
  console.log(`\n--- succession narration (seed ${SEED}) ---`);
  let n = 0;
  for (const l of lines) {
    if (keep.test(l.text)) { console.log(`[d${l.day}] ${l.text}`); if (++n >= 60) break; }
  }
  console.log(`\n--- link histories with succession/renegotiation notes ---`);
  for (const l of (Game.hierarchyState() || [])) {
    const hs = (l.history || []).filter(h => h.kind === 'renegotiation' || h.kind === 'succession' || h.kind === 'tended');
    if (!hs.length) continue;
    const other = l.primary === 'haven' ? l.subordinate : l.primary;
    console.log(`link ${l.id.slice(0, 14)} (${other}): formed d${l.day}, trust ${l.trust | 0}, status ${l.status}`);
    for (const h of hs) console.log(`  [d${h.day}][${h.kind}] ${String(h.note).slice(0, 220)}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
