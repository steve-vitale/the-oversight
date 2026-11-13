#!/usr/bin/env node
'use strict';
// Proof: question-shaped thread labels in noun frames (journey-crisis
// r192, F5 — found on the r192 pilot panel: seed 14433 d24, Marcus
// Ortiz).
// RED: the resume opener's "still owe" clause renders "We still owe
// What season is it here, do you think? a proper ending, too." — the
// thread's label IS the raw question text (ask:where threads are
// labeled by their question), and convoThreadAbout passes it through
// verbatim into a noun frame ("owe X a proper ending", "Good — X,
// settled", "Still on X", "We were talking about X"). A question is
// not a noun phrase.
// GREEN (post-fix): a question-shaped label (ends with '?') renders as
// 'that question' in every closing frame — grammatical and honest —
// while ordinary labels pass through unchanged and the existing
// 'themselves' -> 'your story' special-case still holds.
// The unit under test is convoThreadAbout itself: the resume opener
// only appends the "still owe" clause on a 50% roll with a second open
// thread, so driving it end-to-end is flaky by design; the label
// mapping is the unit that owns the grammar.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  const speaker = (v.roster || [])[0];

  const q = Game.convoThreadAbout(speaker, 'ask:where', 'What season is it here, do you think?');
  console.log(`question label => ${JSON.stringify(q)}`);
  check('question-shaped label is not quoted raw', q !== 'What season is it here, do you think?', 'got ' + JSON.stringify(q));
  check('question-shaped label reads as a noun phrase', !/\?/.test(q) && q.length > 0, 'got ' + JSON.stringify(q));
  check('question-shaped label names the question', /question/i.test(q), 'got ' + JSON.stringify(q));
  // The frames it feeds, rendered with the mapped label:
  check('still-owe frame reads clean', /^We still owe that question a proper ending, too\.$/.test(`We still owe ${q} a proper ending, too.`), `We still owe ${q} a proper ending, too.`);
  check('settled frame reads clean', /^Good — that question, settled\.$/.test(`Good — ${q}, settled.`), `Good — ${q}, settled.`);

  // Regression guards: ordinary labels and the existing special-case.
  check('ordinary label passes through', Game.convoThreadAbout(speaker, 'secret', 'what they confided') === 'what they confided');
  check('themselves still maps to your story', Game.convoThreadAbout(speaker, 'x', 'themselves') === 'your story');

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
