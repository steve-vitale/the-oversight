#!/usr/bin/env node
// test-social-r27-recap-repeat-20261019.js -- PROOF TEST (journey-social r27).
// Back-to-back `recap` picks re-served the verbatim line ("Still on that
// personal stuff." x3, transcript-verified 2026-10-19, seed 2002 d34/d122
// Wei) — a filler loop in conversation grammar. The fix (conversation.js
// convoRecapLine): if the exact recap line was already said this
// conversation, reframe honestly ("As I said — ...") via convoPickCycle so
// the telling varies like a real re-asked person.
// GREEN = 1st recap is canonical; 2nd carries an honest reframe; 3rd is the
// clearer exit (circles + ask something else) and spends; no two consecutive
// full lines are verbatim identical.
// RED (pre-fix) = all three calls return the identical line.
// Note (dialog audit #6 2026-11-08): tightened from 3 reframes to 1 reframe
// + clearer exit so hammering recap is not a bad sitting.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777001, mode: 'recap-repeat-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Two same-thread log entries -> the "Still on {label}." branch.
  c.threadLog = [{ thread: 'past' }, { thread: 'past' }];

  const lines = [];
  for (let i = 0; i < 3; i++) lines.push(String(Game.convoRecapLine(vid)));
  console.log('recap 1:', lines[0]);
  console.log('recap 2:', lines[1]);
  console.log('recap 3:', lines[2]);

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };
  // 1st firing: the canonical line, no reframe.
  if (/As I said|Like I said|still where we are|circles/i.test(lines[0])) fail('first recap should be the canonical line, not a reframe');
  // 2nd: honest reframe framing present. The topic form ("<topic> —
  // that's still where we are.", r31's third template) is honest reframe
  // framing too — lowercase "that's", mid-sentence after the topic label —
  // so the match is case-insensitive (r180).
  if (!/As I said —|Like I said —|that's still where we are\./i.test(lines[1])) fail(`recap 2 has no reframe framing: ${lines[1]}`);
  // 3rd: clearer exit (audit #6) — names the loop and invites subject-change.
  // (Merged 2026-11-11: r180's 2nd/3rd loop expected reframe framing on the
  // 3rd press, but on the merged code the 3rd press is the clearer exit
  // ("We're going in circles — ... Ask me something else"), per HEAD's
  // tighten (2c01bb277) — so the 3rd check is HEAD's clearer-exit check,
  // and only the 2nd check takes r180's case-insensitive pattern.)
  if (!/going in circles/i.test(lines[2]) || !/Ask me something else/i.test(lines[2])) {
    fail(`recap 3 should be clearer exit: ${lines[2]}`);
  }
  if (!(c.spent && c.spent.recap)) fail('recap should spend after the 3rd clearer exit');
  // No two consecutive firings verbatim identical (the L2' bar).
  for (let i = 1; i < 3; i++) {
    if (lines[i] === lines[i - 1]) fail(`recap ${i} and ${i + 1} are verbatim identical`);
  }
  // The thread log itself is untouched (still the honest anchor).
  if ((c.threadLog || []).length !== 2) fail('threadLog mutated by recap');
  Game.endConvo(vid, 'left');
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — recap repeats reframe honestly');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
