#!/usr/bin/env node
// test-recap-hammer-20261108.js — dialog audit defect #6.
// Recap hammer: player must not get 4–5 "Still on X" / reframe serves before
// the choice spends. Cap at 3 presses with a clearer exit on the last.
//
// Repro shape (dialog-coherence-audit.md #6): seed-1 day-31 Dieter turns 1–5
// — "Wait — what were we talking about?" → Still on / As I said ×4–5.
//
// GREEN: same-line path serves ≤3 lines; last names the loop and spends;
//   fresh-line path also spends after the 3rd press; recap absent after.
// RED (pre-fix): 5 serves before spend.
'use strict';
process.env.TRIBFLOOR = '1';
const path = require('path');
const { spawnSync } = require('child_process');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

async function sameLineShape() {
  const { Game } = await loadGame({ seed: 1, mode: 'recap-hammer-same' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  c.budget = 99;
  c.threadLog = [{ thread: 'goal' }, { thread: 'goal' }];
  const served = [];
  for (let i = 0; i < 6; i++) {
    if (c.spent && c.spent.recap) break;
    served.push(String(Game.convoRecapLine(vid) || ''));
  }
  const spent = !!(c.spent && c.spent.recap);
  const presses = c._recapPresses || 0;
  Game.endConvo(vid, 'left');
  return { served, spent, presses };
}

async function freshLineShape() {
  const { Game } = await loadGame({ seed: 1, mode: 'recap-hammer-fresh' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  c.budget = 99;
  const rotate = ['goal', 'past', 'plans', 'village', 'gossip', 'personal'];
  c.threadLog = [
    { thread: 'goal', snippet: 'wants', ex: 0 },
    { thread: 'past', snippet: 'old life', ex: 0 },
  ];
  const served = [];
  for (let i = 0; i < 6; i++) {
    if (c.spent && c.spent.recap) break;
    served.push(String(Game.convoRecapLine(vid) || ''));
    c.threadLog.push({ thread: rotate[(i + 2) % rotate.length], snippet: 'moved', ex: i + 1 });
  }
  const spent = !!(c.spent && c.spent.recap);
  const presses = c._recapPresses || 0;
  Game.endConvo(vid, 'left');
  return { served, spent, presses };
}

async function main() {
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  if (!process.argv.includes('--child')) {
    for (const shape of ['same', 'fresh']) {
      const r = spawnSync(process.execPath, [__filename, '--child', shape], {
        encoding: 'utf8', env: process.env,
      });
      process.stdout.write(r.stdout || '');
      process.stderr.write(r.stderr || '');
      if (r.status !== 0) fails++;
    }
    // Keep r27 first-three reframes honest where they still apply.
    const r27 = spawnSync(process.execPath, [
      path.join(__dirname, 'test-social-r27-recap-repeat-20261019.js'),
    ], { encoding: 'utf8', env: process.env });
    process.stdout.write(r27.stdout || '');
    process.stderr.write(r27.stderr || '');
    if (r27.status !== 0) fail('r27 recap-repeat regressed');
    console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — recap hammer capped at 3 with clearer exit');
    process.exit(fails ? 1 : 0);
  }

  const shape = process.argv[process.argv.indexOf('--child') + 1];
  if (shape === 'same') {
    const { served, spent, presses } = await sameLineShape();
    console.log('same-line served:', served);
    console.log('same-line spent=', spent, 'presses=', presses);
    if (served.length !== 3) fail('same-line should serve exactly 3 recaps, got ' + served.length);
    if (presses !== 3) fail('same-line press counter should be 3, got ' + presses);
    if (!spent) fail('same-line should spend recap after the 3rd');
    if (!/Still on/.test(served[0] || '') || /I said|circles/i.test(served[0] || '')) {
      fail('same-line 1st should be canonical Still on: ' + served[0]);
    }
    if (!/As I said —|Like I said —|that's still where we are/i.test(served[1] || '')) {
      fail('same-line 2nd should reframe honestly: ' + served[1]);
    }
    if (!/going in circles/i.test(served[2] || '') || !/Ask me something else/i.test(served[2] || '')) {
      fail('same-line 3rd should be clearer exit: ' + served[2]);
    }
  } else if (shape === 'fresh') {
    const { served, spent, presses } = await freshLineShape();
    console.log('fresh-line served:', served);
    console.log('fresh-line spent=', spent, 'presses=', presses);
    if (served.length !== 3) fail('fresh-line should serve exactly 3 recaps, got ' + served.length);
    if (presses !== 3) fail('fresh-line press counter should be 3, got ' + presses);
    if (!spent) fail('fresh-line should spend recap after the 3rd');
  } else {
    fail('unknown child shape ' + shape);
  }
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
