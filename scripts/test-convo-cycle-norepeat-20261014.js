#!/usr/bin/env node
// test-convo-cycle-norepeat-20261014.js — proof test for the journey-endgame
// r10 blank: convoPickCycle must never return the same line twice in a row
// when a pool exhausts and resets.
//
// Caught live (2026-10-14): the dlg:comfort pool (3 lines) spoke
// '"Thanks. ...Thanks for saying that."' VERBATIM back-to-back. Mechanism:
// the pool exhausted on pick 3, convoPickCycle cleared the key's said-list,
// and the random re-pick drew from the full pool again — the just-spoken
// line was eligible (1/3 chance per exhaustion).
//
// Method: TRIALS independent trials; each clears the villager's said-memory
// (fresh conversation) and makes 4 picks from a 3-line pool through the real
// key. picks[0..2] exhaust the pool; picks[3] is the post-reset re-pick and
// must not equal picks[2] (the line just spoken).
// RED (unfixed): ~1/3 of trials repeat -> fails. GREEN (fixed): 0 repeats.
// RNG is seeded by loadGame (mulberry32 BEFORE eval) — deterministic.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const POOL = ['"line one."', '"line two."', '"line three."'];
const KEY = 'dlg:comfort:lines'; // the real pool key from the live transcript
const TRIALS = 40;

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'proof-cycle-norepeat' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager in roster');
  if (typeof Game.convoPickCycle !== 'function') throw new Error('Game.convoPickCycle missing');
  let fails = 0, nulls = 0;
  for (let t = 0; t < TRIALS; t++) {
    Game.convoGet(vid).said = {}; // fresh conversation per trial
    const picks = [];
    for (let i = 0; i < 4; i++) picks.push(Game.convoPickCycle(vid, KEY, POOL));
    if (picks.some(p => p == null)) { nulls++; continue; }
    const first3 = picks.slice(0, 3);
    if (new Set(first3).size !== 3) {
      fails++;
      console.log(`  EXHAUSTION-ORDER trial ${t}: [${picks.join(' | ')}]`);
      continue;
    }
    if (picks[3] === picks[2]) {
      fails++;
      if (fails <= 5) console.log(`  REPEAT trial ${t}: reset re-pick == just-spoken ${picks[2]}`);
    }
  }
  if (nulls) console.log(`  note: ${nulls} trials returned null (pool genuinely unavailable)`);
  console.log(`\n${TRIALS - fails - nulls}/${TRIALS} trials clean (no immediate repeat after pool reset)`);
  if (fails) { console.log('RED: verbatim repeat after pool reset'); process.exit(1); }
  console.log('GREEN: convoPickCycle never repeats the just-spoken line on reset');
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
