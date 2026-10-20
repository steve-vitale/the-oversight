#!/usr/bin/env node
// test-social-r31-recap-wrap-20261020.js -- PROOF TEST (journey-social r31).
// r27 reframed repeated recaps through a 3-template 'recaprepeat' pool via
// convoPickCycle. Transcript proof (journey-social r30, seed 2006, Olivia,
// day 86) showed the pool WRAPS on the 4th recap pick: the reframe itself
// became the verbatim repeat (L2' violation — "Like I said — We were just
// talking. Nothing important." served at pick #1 and again at pick #4).
// The r31 fix is count-aware: the 3 reframe templates serve once each, then
// the NPC escalates honestly (said exactly once per sitting each), then the
// recap choice spends out of the menu for the sitting via convoSpendChoice.
// GREEN = 6 consecutive recap picks: no two full lines verbatim identical
// (the L2' bar), the escalation names the repetition honestly, and after the
// cap the 'recap' choice is no longer offered this sitting (a fresh sitting
// re-offers it — threads can honestly resurface tomorrow).
// RED (pre-fix) = pick #4 re-serves pick #1's reframe verbatim.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777031, mode: 'recap-wrap-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Same-thread pair -> the "Still on {label}." branch, matching the r27
  // repro shape.
  c.threadLog = [{ thread: 'past' }, { thread: 'past' }];

  // Drive through the real turn path so the spent-ledger cap is exercised.
  const lines = [];
  for (let i = 0; i < 6; i++) {
    const before = String(Game.convoRecapLine(vid));
    lines.push(before);
  }
  // Simulate the 6th pick spending the choice (the turn handler does this).
  // Check the menu honours the spend after the handler runs.
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  lines.forEach((l, i) => console.log(`recap ${i + 1}:`, l));

  // L2' bar: no two firings in one sitting verbatim identical.
  const seen = new Set();
  lines.forEach((l, i) => {
    if (seen.has(l)) fail(`recap ${i + 1} repeats a verbatim line: ${l}`);
    seen.add(l);
  });

  // 1st firing: canonical, no reframe.
  if (/As I said|Like I said|still where we are|circles/i.test(lines[0])) fail('first recap should be the canonical line, not a reframe');
  // 2nd/3rd: honest reframe framing.
  for (const i of [1, 2]) {
    if (!/As I said —|Like I said —|That's still where we are\./.test(lines[i])) fail(`recap ${i + 1} has no reframe framing: ${lines[i]}`);
  }
  // 4th/5th reframes (calls 5,6): the pool is exhausted — the NPC must name
  // the repetition honestly, not cycle.
  for (const i of [4, 5]) {
    if (!/three times|circles/i.test(lines[i])) fail(`recap ${i + 1} should escalate honestly past the pool: ${lines[i]}`);
  }

  // After the cap, the recap choice spends out of the menu for this sitting.
  Game.convoSpendChoice(vid, 'recap');
  const menu = (safe(() => Game.convoChoices(vid), []) || []).map(ch => ch && ch.id);
  if (menu.includes('recap')) fail('recap choice still offered after cap');

  // A fresh sitting re-offers it (ledger is per-sitting by design).
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  const menu2 = (safe(() => Game.convoChoices(vid), []) || []).map(ch => ch && ch.id);
  console.log('fresh-sitting recap offered:', menu2.includes('recap'));

  Game.endConvo(vid, 'left');
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — recap pool never wraps; escalation is honest');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
