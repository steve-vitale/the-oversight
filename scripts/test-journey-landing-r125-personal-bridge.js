#!/usr/bin/env node
// test-journey-landing-r125-personal-bridge.js — proof test for the r125
// PERSONAL-BRIDGE fix (journey-landing r125 2026-11-10).
//
// The defect (panel r124, seed 1150 d6 Wei sitting): the dlg:subject
// acknowledgment repeats verbatim — '"Anyway. What did you want?"' x2 and
// '"That\'s me, I guess. What\'s on your mind?"' x2 in ONE sitting (the
// second "That's me" carries a voice closer, so exact-match grep misses it
// — the extraction here is substring match, like the r124 test). Root cause,
// read pre-panel: both lines are the WHOLE BRIDGES.personal pool
// (convo-beats.js:182, 2 lines). bridgeLine draws via convoPickCycle
// (convo-beats.js:190), which cycles without replacement then reshuffles
// keeping the last min(3, pool.length - 1) = 1 line (conversation.js:2935).
// With a 2-line pool the cycle is strict alternation A,B,A,B — a third
// personal-bridge in one sitting repeats a line heard two turns earlier.
// Deterministic, not a fluke. (voiceLine sometimes appends an opener/closer
// that changes the composed line — luck, not design; the r124 repeats were
// verbatim.)
//
// The fix (src/js, convo-beats.js BRIDGES.personal): 2 -> 6 distinct lines,
// the same voice (a villager stepping back from talking about themselves
// and handing the floor to the player), the two original lines kept as
// entries 1-2. No other call-site change.
//
// Cases (each in its own process — never two harnesses in one process):
//   pool    : bridgeLine(vid, 'personal') 6 times — all 6 served bridge texts
//             distinct (extracted by substring match against the known pool
//             lines, since voiceLine may add an opener/closer). On unfixed
//             code: A,B,A,B,A,B -> distinct=2 -> FAIL.
//   window  : bridgeLine(vid, 'personal') 12 times — no repeat within any
//             3-consecutive window (the keep-3 memory window). On unfixed
//             code: A repeats 2 calls after B -> FAIL.
//   control : bridgeLine(vid, 'small') 2 times — both served, distinct.
//             Pins the untouched pools against regressions.
//
// Usage: node scripts/test-journey-landing-r125-personal-bridge.js [pool|window|control]
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

// Known BRIDGES.personal lines: the 2 originals + the 4 added by the fix.
// The extraction matches the served bridge text inside the voiced line
// (voiceLine may prepend an opener or append a closer).
const PERSONAL_LINES = [
  "That's me, I guess. What's on your mind?",
  'Anyway. What did you want?',
  "Enough about me — you've got something on your mind, I can tell.",
  "That's my story, anyway. What's yours today?",
  "I could go on about myself all day. Better if I don't — what do you need?",
  "Right. Me, me, me. Your turn — what's up?",
];
const SMALL_LINES = [
  "Sure — what's on your mind?",
  "Yeah? What's up?",
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
  const seed = { pool: 5724, window: 5725, control: 5726 }[mode] || 5724;
  const { Game } = await loadGame({ seed, mode: 'landing-r125-personal-bridge-proof', fullTelemetry: true });
  await setupGame(Game);
  const vid = pickVillager(Game);
  check(`${mode}: roster villager exists`, !!vid);
  if (!vid) return;

  if (mode === 'pool') {
    const served = [];
    for (let i = 0; i < 6; i++) {
      let line = '';
      try { line = Game.bridgeLine(vid, 'personal') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, PERSONAL_LINES));
    }
    check('pool: all 6 calls serve a known personal line', served.every(s => s !== null),
      `served=${JSON.stringify(served)}`);
    check('pool: all 6 served bridge texts distinct (no-repeat)', new Set(served).size === 6,
      `distinct=${new Set(served).size} served=${JSON.stringify(served)}`);
    return;
  }

  if (mode === 'window') {
    const served = [];
    for (let i = 0; i < 12; i++) {
      let line = '';
      try { line = Game.bridgeLine(vid, 'personal') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, PERSONAL_LINES));
    }
    check('window: all 12 calls serve a known personal line', served.every(s => s !== null),
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
      try { line = Game.bridgeLine(vid, 'small') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, SMALL_LINES));
    }
    check('control: both small-bridge calls serve a known line', served.every(s => s !== null),
      `served=${JSON.stringify(served)}`);
    check('control: the 2 small-bridge texts differ', served[0] !== served[1],
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
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-landing-r125-personal-bridge.js'), m],
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
