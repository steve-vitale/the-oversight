#!/usr/bin/env node
// test-journey-landing-r127-small-bridge.js — proof test for the r127
// SMALL-BRIDGE fix (journey-landing r127 2026-11-12).
//
// The defect (panel r127 BEFORE, seeds 1142/1148): the dlg:subject
// acknowledgment repeats verbatim — 1148 d9: '"Sure — what\'s on your
// mind?"' x3 and '"Yeah? What\'s up?"' x2 in ONE sitting (the transcript
// itself flags "VERBATIM REPEATS (3)"); 1142 d6: each line x2. Root cause,
// read pre-panel: both lines are the WHOLE BRIDGES.small pool
// (convo-beats.js:222, 2 lines). bridgeLine draws via convoPickCycle
// (convo-beats.js:229), which cycles without replacement then reshuffles
// keeping the last min(3, pool.length - 1) = 1 line (conversation.js:2935).
// With a 2-line pool the cycle is strict alternation A,B,A,B — a third
// small-bridge in one sitting repeats a line heard two turns earlier.
// Deterministic, not a fluke. Small is ALSO the fallback pool (bridgeLine
// falls back to it when fromTopic has no pool of its own — topic2 topics
// like lately/others/fears/you), which is why it serves 26x per 100
// sittings while grief/cheer/secret serve 0-1x (r127 Q2 dwell read).
//
// The fix (src/js, convo-beats.js BRIDGES.small): 2 -> 6 distinct lines,
// the same voice (a villager stepping back from chit-chat and handing the
// floor to the player), the two original lines kept as entries 1-2. No
// other call-site change.
//
// Cases (each in its own process — never two harnesses in one process):
//   pool    : bridgeLine(vid, 'small') 6 times — all 6 served bridge texts
//             distinct (extracted by substring match against the known pool
//             lines, since voiceLine may add an opener/closer). On unfixed
//             code: A,B,A,B,A,B -> distinct=2 -> FAIL.
//   window  : bridgeLine(vid, 'small') 12 times — no repeat within any
//             3-consecutive window (the keep-3 memory window). On unfixed
//             code: A repeats 2 calls after B -> FAIL.
//   control : bridgeLine(vid, 'personal') 2 times — both served, distinct.
//             Pins the untouched pools against regressions.
//
// Usage: node scripts/test-journey-landing-r127-small-bridge.js [pool|window|control]
//   Default (no arg): runs all three cases, spawning children for the two
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

// Known BRIDGES.small lines: the 2 originals + the 4 added by the fix.
// The extraction matches the served bridge text inside the voiced line
// (voiceLine may prepend an opener or append a closer).
const SMALL_LINES = [
  "Sure — what's on your mind?",
  "Yeah? What's up?",
  "Right — go on, I'm listening.",
  "Okay, I'm all ears.",
  "Go ahead — you've got my attention.",
  "Alright, I'm listening. What's next?",
];
const PERSONAL_LINES = [
  "That's me, I guess. What's on your mind?",
  'Anyway. What did you want?',
  "Enough about me — you've got something on your mind, I can tell.",
  "That's my story, anyway. What's yours today?",
  "I could go on about myself all day. Better if I don't — what do you need?",
  "Right. Me, me, me. Your turn — what's up?",
];

function extractServed(voiced, pool) {
  const t = String(voiced || '');
  for (const line of pool) {
    if (t.includes(line)) return line;
  }
  return null;
}

function pickVillager(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  return roster[0] || null;
}

async function runCase(mode) {
  const seed = { pool: 5727, window: 5728, control: 5729 }[mode] || 5727;
  const { Game } = await loadGame({ seed, mode: 'landing-r127-small-bridge-proof', fullTelemetry: true });
  await setupGame(Game);
  const vid = pickVillager(Game);
  check(`${mode}: roster villager exists`, !!vid);
  if (!vid) return;

  if (mode === 'pool') {
    const served = [];
    for (let i = 0; i < 6; i++) {
      let line = '';
      try { line = Game.bridgeLine(vid, 'small') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, SMALL_LINES));
    }
    check('pool: all 6 calls serve a known small line', served.every(s => s !== null),
      `served=${JSON.stringify(served)}`);
    check('pool: all 6 served bridge texts distinct (no-repeat)', new Set(served).size === 6,
      `distinct=${new Set(served).size} served=${JSON.stringify(served)}`);
    return;
  }

  if (mode === 'window') {
    const served = [];
    for (let i = 0; i < 12; i++) {
      let line = '';
      try { line = Game.bridgeLine(vid, 'small') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, SMALL_LINES));
    }
    check('window: all 12 calls serve a known small line', served.every(s => s !== null),
      `served=${JSON.stringify(served)}`);
    let worst = 0;
    for (let i = 0; i < served.length; i++) {
      for (let j = i + 1; j < Math.min(served.length, i + 3); j++) {
        if (served[i] !== null && served[i] === served[j]) worst++;
      }
    }
    check('window: no repeat within any 3-consecutive window', worst === 0,
      `repeats-in-window=${worst} served=${JSON.stringify(served)}`);
    return;
  }

  if (mode === 'control') {
    const served = [];
    for (let i = 0; i < 2; i++) {
      let line = '';
      try { line = Game.bridgeLine(vid, 'personal') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, PERSONAL_LINES));
    }
    check('control: both personal-bridge calls serve a known line', served.every(s => s !== null),
      `served=${JSON.stringify(served)}`);
    check('control: the 2 personal-bridge texts differ', served[0] !== served[1],
      `served=${JSON.stringify(served)}`);
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['pool', 'window', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('pool');
    for (const m of ['window', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-landing-r127-small-bridge.js'), m],
          { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
        console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
        if (/FAIL/.test(out)) fails++;
      } catch (e) {
        check(`${m} child run passes`, false, String((e.stdout || e.message || e)).slice(0, 300));
      }
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
