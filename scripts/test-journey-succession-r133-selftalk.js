#!/usr/bin/env node
// test-journey-succession-r133-selftalk.js — proof test for the r133
// SELF-TALK-REQUEST PURGE (src/js/ledger.js playerDeath).
// A talk request the successor filed as an NPC survives the handoff keyed
// by their own id: the new bearer <redacted> a pending request to talk to
// themselves, and talkRequestNear lights the Talk badge for their own
// position (distance 0). The fix deletes only the successor's own entry
// at handoff.
//   self case (default): the forced successor holds a pending request and
//     another villager holds one too. After playerDeath: the successor is
//     the requester, their own request is gone, the other's survives.
//   control case (`node <this> control`): the forced successor holds NO
//     request; two other villagers do. After playerDeath: both survive
//     (the fix is targeted, not a blanket clear).
// The default run executes the self case in-process, then spawns itself
// with 'control' (separate process — never two harnesses in one process).
// Usage: node scripts/test-journey-succession-r133-selftalk.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

async function runCase(mode) {
  const selfCase = mode !== 'control';
  const seed = selfCase ? 4341 : 4342;
  const { Game } = await loadGame({ seed, mode: 'succession-r133-selftalk-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  check(`${mode}: roster has at least 2 NPCs`, roster.length >= 2, `roster=${roster.length}`);
  if (roster.length < 2) return;
  const successor = roster[0];
  const other = roster[1];
  const third = roster[2] || other;
  // Force the pick: successor at 100, everyone else at 0 (agency bonus is
  // at most +12, so no reorder is possible).
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 0;
  v.trust[successor] = 100;
  v.talkRequests = {};
  if (selfCase) v.talkRequests[successor] = { line: '"Can we talk?"', day: 1 };
  v.talkRequests[other] = { line: '"Can we talk?"', day: 1 };
  if (!selfCase) v.talkRequests[third] = { line: '"Can we talk?"', day: 1 };
  const before = Game.villagerId;
  Game.playerDeath('the expedition');
  check(`${mode}: handoff to the forced successor`,
    Game.villagerId === successor && !Game.over, `before=${before} after=${Game.villagerId} want=${successor}`);
  const reqs = (Game.state.village || {}).talkRequests || {};
  if (selfCase) {
    check('self: successor own request purged', !(successor in reqs), `keys=${Object.keys(reqs).join(',')}`);
  } else {
    check('control: successor holds no request to purge (setup)', !(successor in reqs), `keys=${Object.keys(reqs).join(',')}`);
  }
  check(`${mode}: other villager request survives`, other in reqs, `keys=${Object.keys(reqs).join(',')}`);
  if (!selfCase) {
    check('control: third villager request survives', third in reqs, `keys=${Object.keys(reqs).join(',')}`);
  }
}

async function main() {
  const mode = process.argv[2] || 'self';
  if (mode === 'control') {
    await runCase('control');
  } else {
    await runCase('self');
    try {
      const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r133-selftalk.js'), 'control'],
        { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
      console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
      check('control child run passes', /ALL GREEN/.test(out), out.split('\n').filter(l => l.startsWith('FAIL')).join('; '));
    } catch (e) {
      check('control child run passes', false, String((e.stdout || e.message || e)).slice(0, 300));
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
