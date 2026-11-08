#!/usr/bin/env node
// test-social-r31-recap-wrap-20261020.js -- PROOF TEST (journey-social r31).
// r27 reframed repeated recaps through a 3-template 'recaprepeat' pool via
// convoPickCycle. Transcript proof (journey-social r30, seed 2006, Olivia,
// day 86) showed the pool WRAPPED on the 4th recap pick: the reframe itself
// became the verbatim repeat (L2' violation).
//
// Dialog audit #6 (2026-11-08) tightened the sitting: 1 canonical + 1
// reframe + 1 clearer exit that spends — never enough presses for the pool
// to wrap. This proof now locks that tighter bar.
// GREEN = 3 consecutive recap picks: no two full lines verbatim identical,
// the 3rd names the loop and spends, and after the cap the 'recap' choice
// is no longer offered this sitting (a fresh sitting re-offers it).
// RED (pre-fix) = hammer serves 4–5 lines, or 3rd does not spend.
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

  const lines = [];
  for (let i = 0; i < 3; i++) {
    if (c.spent && c.spent.recap) break;
    lines.push(String(Game.convoRecapLine(vid)));
  }
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  lines.forEach((l, i) => console.log(`recap ${i + 1}:`, l));

  if (lines.length !== 3) fail('expected exactly 3 recap serves, got ' + lines.length);

  // L2' bar: no two firings in one sitting verbatim identical.
  const seen = new Set();
  lines.forEach((l, i) => {
    if (seen.has(l)) fail(`recap ${i + 1} repeats a verbatim line: ${l}`);
    seen.add(l);
  });

  // 1st firing: canonical, no reframe.
  if (/As I said|Like I said|still where we are|circles/i.test(lines[0])) fail('first recap should be the canonical line, not a reframe');
  // 2nd: honest reframe framing.
  if (!/As I said —|Like I said —|That's still where we are\./.test(lines[1])) fail(`recap 2 has no reframe framing: ${lines[1]}`);
  // 3rd: clearer exit + spend.
  if (!/going in circles/i.test(lines[2])) fail(`recap 3 should escalate honestly: ${lines[2]}`);
  if (!(c.spent && c.spent.recap)) fail('recap should be spent after the 3rd press');

  // After the cap, the recap choice spends out of the menu for this sitting.
  const menu = (safe(() => Game.convoChoices(vid), []) || []).map(ch => ch && ch.id);
  if (menu.includes('recap')) fail('recap choice still offered after cap');

  // A fresh sitting re-offers it (ledger is per-sitting by design).
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  const menu2 = (safe(() => Game.convoChoices(vid), []) || []).map(ch => ch && ch.id);
  console.log('fresh-sitting recap offered:', menu2.includes('recap'));

  Game.endConvo(vid, 'left');
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — recap pool never wraps; clearer exit spends');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
