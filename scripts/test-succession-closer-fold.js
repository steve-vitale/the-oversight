#!/usr/bin/env node
// test-succession-closer-fold.js — PROOF (journey-succession 2026-10-12):
// voiceLine's comma-led closers (", friend.", ", as it were.", DNA ", kid.")
// were appended AFTER the line's terminal punctuation, stuttering:
//   "I go back and forth. Ask me tomorrow, I'll say different. , friend."
// (seen live on seed 302, succession harness 2026-10-12 — Emma Larsen's
// softened take). The closer must fold INTO the clause:
//   "...say different, friend."  /  "...coming with us, friend?"
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}
// Dangling comma-closer: terminal punctuation followed by space + comma,
// the exact stutter from seed 302.
const dangles = (t) => /[.!?]\s*,\s*\w+\.?["\s]/ .test(t) || /\.\s*, /.test(t);

async function withForcedCloser(Game, vid, closer, fn) {
  const orig = Game.convoPickCycle;
  const realRandom = Math.random;
  // voiceLine consumes: (1) p-gate random, (2) opener/closer random for
  // non-questions. Queue: [0.1 passes p-gate, 0.9 forces closer path].
  // convoPickCycle is forced to the exact closer bit.
  const queue = [0.1, 0.9];
  let qi = 0;
  Game.convoPickCycle = () => closer;
  Math.random = () => queue[(qi++) % queue.length];
  try { return fn(); } finally { Game.convoPickCycle = orig; Math.random = realRandom; }
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-closer-fold' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village;
  const vid = (v.roster || []).filter(id => id !== Game.villagerId)[0];

  // 1. period + ", friend." folds into the clause
  await withForcedCloser(Game, vid, ', friend.', () => {
    const out = Game.voiceLine(vid, '"I go back and forth. Ask me tomorrow, I\'ll say different."');
    check('period-fold', out === '"I go back and forth. Ask me tomorrow, I\'ll say different, friend."', out);
    check('no-dangle', !dangles(out), out);
  });
  // 2. exclamation + ", as it were."
  await withForcedCloser(Game, vid, ', as it were.', () => {
    const out = Game.voiceLine(vid, '"Fine. We eat tonight!"');
    check('bang-fold', out === '"Fine. We eat tonight, as it were."', out);
  });
  // 3. question + ", friend.": the address tucks before the question mark
  await withForcedCloser(Game, vid, ', friend.', () => {
    const out = Game.voiceLine(vid, '"Are you coming with us?"');
    check('question-fold', out === '"Are you coming with us, friend?"', out);
    check('question-no-dangle', !dangles(out), out);
  });
  // 4. no terminal mark: unchanged behavior
  await withForcedCloser(Game, vid, ', friend.', () => {
    const out = Game.voiceLine(vid, '"Ask me tomorrow"');
    check('no-mark', out === '"Ask me tomorrow , friend."', out);
  });
  // 5. dash closers untouched (trailing aside, not a clause join; the
  // double space is the pre-existing composer convention for space-led bits)
  await withForcedCloser(Game, vid, ' — or so they tell me.', () => {
    const out = Game.voiceLine(vid, '"The creek\'s dry this week."');
    check('dash-untouched', out === '"The creek\'s dry this week.  — or so they tell me."', out);
  });

  console.log(fails ? `\n${fails} FAIL(s)` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW:', e); process.exit(1); });
