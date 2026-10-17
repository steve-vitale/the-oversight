#!/usr/bin/env node
// test-snippet-substance-r19-20261016.js — journey-social r19 people-check
// blank: the R17 "real beat" gate tested truthiness, so micro-fillers
// ("Hm.", "So.") planted as thread memories and got quoted at resume time
// ("We never finished talking about what scares them — we wandered off
// it. 'Hm.'"), and resume-scaffolding phrasings ("never did get back to
// that") slipped the R18-landing quote guard.
// Fix: convoSnippetIsRealBeat — a plantable/quotable snippet is not a
// deflection line, not resume scaffolding, and carries a proposition
// (>= 4 words). convoLastThreadSnippet skips filler (quotes the last
// SUBSTANTIVE beat); the resume-time quote guard uses the same test.
// RED (pre-fix): a thread plants with a '"Hm."' snippet (ghost thread),
//   and the resume opener quotes it.
// GREEN (post-fix): the ghost plant is refused; a substantive snippet
//   still plants; the helper classifies correctly.
// Usage: SEED=4242 node scripts/test-snippet-substance-r19-20261016.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '4242', 10);

function openTids(Game, vid) {
  const L = Game.convoTopicLedger(vid);
  return (L.open || []).map(o => o.tid);
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-snippet-r19', fullTelemetry: false });
  await setupGame(Game);
  let pass = 0;
  const ok = (cond, msg) => { assert(cond, 'FAIL: ' + msg); pass++; console.log('  ok: ' + msg); };

  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  ok(!!vid, 'found a villager');
  // Backing-event gate: stub it so the test isolates the substance gate.
  const realBacked = Game.convoThreadBacked;
  Game.convoThreadBacked = () => true;

  // --- helper unit checks ---
  ok(!Game.convoSnippetIsRealBeat('"Hm."'), 'micro-filler "Hm." is not a real beat');
  ok(!Game.convoSnippetIsRealBeat('"So."'), 'micro-filler "So." is not a real beat');
  ok(!Game.convoSnippetIsRealBeat('"Anyway."'), 'micro-filler "Anyway." is not a real beat');
  ok(!Game.convoSnippetIsRealBeat('"...Sorry, lost my train of thought."'), 'deflection line is not a real beat');
  ok(!Game.convoSnippetIsRealBeat('"About their skills — yeah, we never did get back to that."'),
    'resume scaffolding is not a real beat');
  ok(!Game.convoSnippetIsRealBeat(null), 'null is not a real beat');
  ok(!Game.convoSnippetIsRealBeat(''), 'empty is not a real beat');
  ok(Game.convoSnippetIsRealBeat('"The cellar door was open. Something big went in."'),
    'substantive beat is real');
  ok(Game.convoSnippetIsRealBeat('"You\'re kind. Don\'t let this place change that."'),
    'short substantive beat is real');

  // --- plant behavior: ghost refused, substance accepted ---
  Game.convoThreadOpen(vid, 'fears', 'what scares them', 'walked away mid-thread', '"Hm."');
  ok(openTids(Game, vid).indexOf('fears') === -1,
    'ghost thread (filler snippet) is NOT planted');
  Game.convoThreadOpen(vid, 'fears', 'what scares them', 'walked away mid-thread',
    '"The cellar door was open. Something big went in."');
  ok(openTids(Game, vid).indexOf('fears') !== -1,
    'substantive thread IS planted');
  const planted = Game.convoTopicLedger(vid).open.find(o => o.tid === 'fears');
  ok(planted && planted.snippet && planted.snippet.indexOf('cellar door') !== -1,
    'planted snippet carries the substantive beat');

  // --- threadLog scan: filler last-beat skipped for the earlier substance ---
  const c = Game.convoGet(vid);
  c.threadLog = [
    { thread: 'past', snippet: '"I grew up near the water. We all learned young."', ex: 1 },
    { thread: 'past', snippet: '"Hm."', ex: 2 },
  ];
  const snip = Game.convoLastThreadSnippet(vid, 'past');
  ok(snip && snip.indexOf('grew up near the water') !== -1,
    'last-substantive-beat scan skips the filler tail');
  c.threadLog = [{ thread: 'past', snippet: '"Hm."', ex: 1 }];
  ok(Game.convoLastThreadSnippet(vid, 'past') === null,
    'all-filler thread yields no snippet (ghost)');

  Game.convoThreadBacked = realBacked;

  // --- grief pool: sized for a village-wide beat, all quotable ---
  const pool = Game.convoGriefOpenerPool();
  ok(Array.isArray(pool) && pool.length >= 8,
    `grief opener pool sized for the village (${pool.length} lines)`);
  ok(pool.every(l => Game.convoSnippetIsRealBeat(l)),
    'every grief pool line is a real beat (quotable as a memory)');
  ok(pool.every(l => !Game.convoIsDeflectionLine(l)),
    'no grief pool line is a deflection line');
  ok(new Set(pool).size === pool.length, 'grief pool lines are distinct');

  console.log(`GREEN: ${pass} assertions passed (seed ${SEED})`);
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
