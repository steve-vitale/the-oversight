// Proof: convoPickCycle reshuffle keeps a 3-line memory window (r18).
// ROOT CAUSE (journey-landing r18, seed-64 probe): the comfort pool
// (7 lines, convo-dialogue.js) repeated '"You're kind. Don't let this
// place change that." 3 turns apart in one conversation. The pool had
// EXHAUSTED after 7 sincere picks; the reshuffle seeded the fresh
// said-list with only the LAST line, so lines said 2-6 turns earlier were
// immediately eligible again — a real person wouldn't repeat a
// distinctive line 3 turns later.
// FIX (src/js/conversation.js convoPickCycle): seed the reshuffle with
// the last 3 lines (capped at pool.length - 1 so small pools still cycle).
// RED: after exhausting a 7-line pool, the 8th pick's said-list holds 2
//   entries (1 seeded + 1 new) — memory window 1, the bug.
// GREEN: the 8th pick's said-list holds 4 entries (3 seeded + 1 new),
//   and the 8th pick is never among the 3 pre-reshuffle lines.
'use strict';
const { loadGame, setupGame } = require('./sim-harness.js');

async function main() {
  const { Game: G } = await loadGame({ seed: 64 });
  await setupGame(G);
  const assert = require('assert');
  const v = G.state.village;
  const vid = (v.roster && v.roster[0] && v.roster[0].id) || (v.roster && v.roster[0]);
  assert(vid, 'need a villager id');

  let pass = 0, fail = 0;
  const check = (cond, msg) => {
    if (cond) { pass++; }
    else { fail++; console.error('FAIL: ' + msg); }
  };

  // --- 7-line pool: exhaust, then reshuffle ---
  const pool7 = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
  const key7 = 'test:r18:pool7';
  const picks = [];
  for (let i = 0; i < 7; i++) picks.push(G.convoPickCycle(vid, key7, pool7));
  check(new Set(picks).size === 7, `7 picks exhaust without repeat (got ${JSON.stringify(picks)})`);

  const saidBefore = G.convoGet(vid).said[key7].slice();
  const eighth = G.convoPickCycle(vid, key7, pool7);
  check(eighth != null, '8th pick returns a line after reshuffle (no null)');
  const saidAfter = G.convoGet(vid).said[key7];
  // Memory window: 3 seeded + the new pick = 4. Pre-fix this is 2.
  check(saidAfter.length >= 4,
    `reshuffle keeps 3-line memory (said-list ${saidAfter.length}, want >=4; pre-fix=2): ${JSON.stringify(saidAfter)}`);
  // The 8th pick cannot be among the 3 lines said just before reshuffle.
  const lastThree = saidBefore.slice(-3);
  check(lastThree.indexOf(eighth) === -1,
    `8th pick ${JSON.stringify(eighth)} not among pre-reshuffle last 3 ${JSON.stringify(lastThree)}`);

  // --- 2-line pool: small pools must still cycle, not collapse ---
  const pool2 = ['A', 'B'];
  const key2 = 'test:r18:pool2';
  const p2 = [G.convoPickCycle(vid, key2, pool2), G.convoPickCycle(vid, key2, pool2)];
  check(new Set(p2).size === 2, `2-line pool exhausts without repeat (got ${JSON.stringify(p2)})`);
  const third = G.convoPickCycle(vid, key2, pool2);
  check(third != null, '2-line pool reshuffles (3rd pick non-null, no collapse)');
  check(third !== p2[1], `2-line reshuffle avoids immediate repeat (3rd=${third}, 2nd=${p2[1]})`);

  // --- 1-line pool: degenerate — must not hang or throw; yields null so the
  // caller falls back (existing design, unchanged by this fix) ---
  const key1 = 'test:r18:pool1';
  const o1 = G.convoPickCycle(vid, key1, ['ONLY']);
  const o2 = G.convoPickCycle(vid, key1, ['ONLY']);
  check(o1 === 'ONLY' && o2 == null, `1-line pool: first='ONLY', then null->fallback (got ${o1}, ${o2})`);

  console.log(`\ncomfort-cycle r18: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
