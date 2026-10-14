#!/usr/bin/env node
// test-dryline-repeat-20261014.js — journey landing r14 blank fix.
// DEFECT: convoDryLine (src/js/conversation.js) claims "Per-conversation
// cycling so they never parrot verbatim" but the DRY pool has 3 lines and
// the per-conversation cap is DRY.length * 3 = 9 — so uses 4..9 repeat
// verbatim (use 4 == use 1). Observed in the wild: seed 43 day 9, Francesca
// said "...Actually, forget it." twice in one conversation (run-ledger
// blocks hit the dry path twice, 3 uses apart).
// PROOF: call convoDryLine 9 times on a fresh conversation; all 9 must be
// distinct (the fix expands the pool to cover the cap). 10th call must
// return null (silence stays the honest signal past the cap).
// Run: node scripts/test-dryline-repeat-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 43 });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  Game.startConvo(vid);
  const lines = [];
  for (let i = 0; i < 9; i++) lines.push(Game.convoDryLine(vid));
  const tenth = Game.convoDryLine(vid);
  console.log('dry lines used in one conversation:');
  lines.forEach((l, i) => console.log(`  ${i + 1}. ${l}`));
  ok(lines.every(l => typeof l === 'string' && l.length > 0), 'all 9 dry-line uses return a line');
  const distinct = new Set(lines).size;
  ok(distinct === 9, 'no verbatim repeat within the 9-use cap', `only ${distinct} distinct of 9`);
  ok(tenth === null, '10th use returns null (silence is the honest signal past cap)', `got ${JSON.stringify(tenth)}`);
  // a fresh conversation resets the counter
  const vid2 = roster[1];
  Game.startConvo(vid2);
  const fresh = Game.convoDryLine(vid2);
  ok(fresh === lines[0], 'counter resets per conversation', `fresh=${JSON.stringify(fresh)} first=${JSON.stringify(lines[0])}`);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
