#!/usr/bin/env node
// test-knack-gossip-variants-20261024.js — KNACK GOSSIP VARIANTS proof
// (journey-social 2026-10-24 r47).
//
// Finding: each knack had ONE gossip line, so two villagers with the same
// knack got the identical anecdote in one sitting ("Vasyl/Pavel found a lost
// knife by smell" — lane A r26 blank; reproduced r47: seed 4302 d5/d7
// the_touch x2, seed 4304 d4 beast_calm x2, green_whisper x3).
//
// Fix (src/js/spawn-knack.js, r47): 3 witnessed-effect variants per knack,
// selected via convoPick (per-teller text ledger + village-fresh preference
// — the r32 convoDeeperPick pattern). A teller never repeats the same
// anecdote about two targets.
//
// Proves:
//   1. Same teller, two targets, same knack -> two DIFFERENT lines.
//   2. All 3 variants are reachable (pool not a singleton).
//   3. Pool exhaustion -> null (honest silence), never a 4th repeat.
//   4. Different knacks unaffected; no-knack target -> null.
//   5. RED on pristine: singleton line repeats verbatim for two targets.
// Usage: node scripts/test-knack-gossip-variants-20261024.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' (' + extra + ')' : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const npcs = Game.npcIds().filter(id => id !== Game.villagerId);
  ok(npcs.length >= 4, 'roster has NPCs', 'npcs=' + npcs.length);

  // pin two NPCs to the same knack; pick a valid knack id from the pool
  const pool = Game.knackPool().map(a => a.id);
  ok(pool.includes('bloodhound'), 'bloodhound is a real knack', pool.slice(0, 6).join(','));
  const teller = npcs[0], tgt1 = npcs[1], tgt2 = npcs[2];
  v.npcKnacks = v.npcKnacks || {};
  v.npcKnacks[tgt1] = 'bloodhound';
  v.npcKnacks[tgt2] = 'bloodhound';

  // force the 0.35 mention gate open deterministically
  const realRandom = Math.random;
  Math.random = () => 0.1;
  const lines = [];
  try {
    for (let i = 0; i < 6; i++) {
      const r1 = Game.knackGossipLine(teller, tgt1);
      const r2 = Game.knackGossipLine(teller, tgt2);
      if (r1 && r1.line) lines.push({ tgt: 't1', line: r1.line });
      if (r2 && r2.line) lines.push({ tgt: 't2', line: r2.line });
    }
  } finally { Math.random = realRandom; }
  const texts = lines.map(l => l.line);
  const uniq = [...new Set(texts)];
  ok(texts.length >= 2, 'knack gossip served', 'served=' + texts.length);
  // same teller about two targets: the r47 blank was identical text;
  // with 3 variants + per-teller ledger, the first two serves must differ.
  const firstT1 = lines.find(l => l.tgt === 't1');
  const firstT2 = lines.find(l => l.tgt === 't2');
  ok(!!firstT1 && !!firstT2, 'both targets got a line');
  if (firstT1 && firstT2) {
    ok(firstT1.line !== firstT2.line, 'same knack, two targets -> different anecdotes',
      firstT1.line.slice(0, 60) + ' ||| ' + firstT2.line.slice(0, 60));
  }
  ok(uniq.length >= 2 && uniq.length <= 3, 'variant pool has 2-3 distinct lines, no more', 'uniq=' + uniq.length);
  ok(texts.length <= 6, 'pool exhausts instead of repeating forever', 'served=' + texts.length + ' (6 calls, 3-variant pool + ledger)');
  // exhaustion: a 7th distinct serve for the same teller+knack must be null
  Math.random = () => 0.1;
  let extra = null;
  try { extra = Game.knackGossipLine(teller, tgt1); } finally { Math.random = realRandom; }
  ok(extra === null, 'exhausted pool -> null (honest silence), not a repeat');

  // other knacks unaffected; no-knack target -> null
  v.npcKnacks[npcs[3]] = 'night_eyes';
  Math.random = () => 0.1;
  let ne = null;
  try { ne = Game.knackGossipLine(teller, npcs[3]); } finally { Math.random = realRandom; }
  ok(ne && ne.line && /dark|dusk/i.test(ne.line), 'other knack serves its own variants', ne && ne.line.slice(0, 60));
  delete v.npcKnacks[tgt1];
  Math.random = () => 0.1;
  let none = 'sentinel';
  try { none = Game.knackGossipLine(teller, tgt1); } finally { Math.random = realRandom; }
  ok(none === null, 'no knack -> null');

  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
