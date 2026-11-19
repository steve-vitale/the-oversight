#!/usr/bin/env node
// test-journey-landing-r146-want-bridge.js — proof test for the r146
// WANT-BRIDGE follow-up fix (journey-landing r146 2026-11-18).
//
// The defect (panel r146, seed 1250 d10 Wei sitting): the dlg:subject
// acknowledgment repeats verbatim in ONE sitting — '"Look, forget it. You
// wanted something?"' at turn 1 and again at turn 24, a 27-turn sitting in
// which the scholar deflected the pending warn_you want 7 times. Root
// cause: BRIDGES.want holds 6 lines (convo-beats.js, expanded 2 -> 6 by
// the r124 fix). bridgeLine draws via convoPickCycle, which cycles
// without replacement then reshuffles keeping the last 3 lines — so the
// 7th want-bridge in a sitting must repeat one of the first 3 served.
// The r124 comment says so outright: "Six lines means a sitting would
// need seven want-bridges before any repeat." The driver found the
// seventh. A real player deflecting seven times hits the same repeat.
// HEED-V (the panel's verbatim-repeat bar, binds at 0) fired: 1.
//
// The fix (src/js, convo-beats.js BRIDGES.want): 6 -> 10 distinct lines,
// the same voice (a villager backing off their own want and handing the
// floor to the player), the six existing lines kept as entries 1-6. A
// sitting now needs eleven want-bridges before any repeat. No other
// call-site change.
//
// Cases (each in its own process — never two harnesses in one process):
//   pool10  : bridgeLine(vid, 'want') 10 times — all 10 served bridge
//             texts distinct (extracted by substring match against the
//             known pool lines, since voiceLine may add an opener/
//             closer). On unfixed code: 7th call repeats -> distinct=6
//             -> FAIL.
//   sitting7: bridgeLine(vid, 'want') 7 times — all 7 distinct. The exact
//             panel shape (1250 d10: 7 deflects). On unfixed code: the
//             7th repeats -> FAIL.
//   window  : bridgeLine(vid, 'want') 12 times — no repeat within any
//             3-consecutive window (the keep-3 memory window). Pins the
//             invariant on the bigger pool.
//   control : bridgeLine(vid, 'small') 2 times — both served, distinct.
//             Pins the untouched pools against regressions.
//
// Usage: node scripts/test-journey-landing-r146-want-bridge.js [pool10|sitting7|window|control]
//   Default (no arg): runs all four cases, spawning children for the
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

// Known BRIDGES.want lines: the 6 existing + the 4 added by the fix.
// The extraction matches the served bridge text inside the voiced line
// (voiceLine may prepend an opener or append a closer).
const WANT_LINES = [
  "Sorry — I shouldn't load that on you. What's up?",
  'Forget I said anything. What did you want?',
  '...Never mind me. What were you going to say?',
  "That can wait — it isn't going anywhere. What's on your mind?",
  'Look, forget it. You wanted something?',
  "Anyway — that's my problem, not yours. What did you want?",
  "It's nothing, really. What were you saying?",
  "Forget it — go on, I'm listening.",
  'Never mind. You had something to say?',
  "I'll keep it to myself. What's on your mind?",
];
const SMALL_LINES = [
  "Sure — what's on your mind?",
  "Yeah? What's up?",
  'Right — go on, I\'m listening.',
  "Okay, I'm all ears.",
  "Go ahead — you've got my attention.",
  "Alright, I'm listening. What's next?",
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
  const seed = { pool10: 5814, sitting7: 5815, window: 5816, control: 5817 }[mode] || 5814;
  const { Game } = await loadGame({ seed, mode: 'landing-r146-want-bridge-proof', fullTelemetry: true });
  await setupGame(Game);
  const vid = pickVillager(Game);
  check(`${mode}: roster villager exists`, !!vid);
  if (!vid) return;

  if (mode === 'pool10' || mode === 'sitting7') {
    const n = mode === 'pool10' ? 10 : 7;
    const served = [];
    for (let i = 0; i < n; i++) {
      let line = '';
      try { line = Game.bridgeLine(vid, 'want') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, WANT_LINES));
    }
    check(`${mode}: all ${n} calls serve a known want line`, served.every(s => s !== null),
      `served=${JSON.stringify(served)}`);
    check(`${mode}: all ${n} served bridge texts distinct (no-repeat)`, new Set(served).size === n,
      `distinct=${new Set(served).size} served=${JSON.stringify(served)}`);
    return;
  }

  if (mode === 'window') {
    const served = [];
    for (let i = 0; i < 12; i++) {
      let line = '';
      try { line = Game.bridgeLine(vid, 'want') || ''; } catch (e) { line = ''; }
      served.push(extractServed(line, WANT_LINES));
    }
    check('window: all 12 calls serve a known want line', served.every(s => s !== null),
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
  if (mode && ['pool10', 'sitting7', 'window', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('pool10');
    for (const m of ['sitting7', 'window', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-landing-r146-want-bridge.js'), m],
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
