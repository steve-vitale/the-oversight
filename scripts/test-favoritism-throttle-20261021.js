#!/usr/bin/env node
// test-favoritism-throttle-20261021.js -- PROOF TEST (journey-social r38).
//
// THE BLANK: convoConflictFallout narrated the favoritism beat on EVERY
// qualifying convo end — the r38 pilot (warm-competent, seeds 3501-3504)
// served the identical "X saw how close you've gotten to Y. Old history
// has long eyes. (-2 trust)" line 53 times in 47 days on seed 3501 (42
// known + 11 unknown), 20 times on 3503. The -2 cost is the mechanic (it
// visibly suppressed the other side: trustB=4 vs trustA=90 on 3501's
// second feud) — the fix throttles only the narration: rising edge +
// at most one reminder per 7 days per side. The cost keeps ticking.
//
// BEFORE (from the r38 pilot corpus, evidence/2026-10-21/social-r38-feudscenes):
//   seed 3501: 53 favoritism say-lines in 47 days (d7-d53)
// AFTER (this test): 20 consecutive qualifying convo ends over 10 scholar
//   days -> the -2 cost lands all 20 times (other side -40), but the beat
//   narrates at most 3 times (rising + 7-day reminders).
//
// Usage: node scripts/test-favoritism-throttle-20261021.js
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: 4344, mode: 'favoritism-throttle-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const sid = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== sid);
  const a = roster[0], b = roster[1];

  // Seed a KNOWN old_wound between two NPCs.
  v.conflicts = [{ a, b, kind: 'old_wound', heritageA: 'x', heritageB: 'y',
    history: ['{a} and {b} don\'t speak.'], known: true, stage: 0,
    tension: 60, resolved: false }];
  v.trust = v.trust || {};
  v.trust[a] = 55;   // player is close to side A
  v.trust[b] = 60;   // side B starts at 60
  Game.state.scholar.day = 10;

  // Capture say-lines.
  const said = [];
  const origSay = Game.say;
  Game.say = function (msg) { said.push(String(msg)); return origSay.apply(this, arguments); };

  // 20 qualifying convo ends over 10 scholar days (2/day, like the driver).
  for (let i = 0; i < 20; i++) {
    Game.state.scholar.day = 10 + Math.floor(i / 2);
    Game.convoConflictFallout(a, 55);
  }
  const favLines = said.filter(t => /long eyes|colder to you lately/.test(t));
  const cost = 60 - v.trust[b];

  console.log(`  20 convo ends over 10 days: -2 cost landed ${cost / 2}x (trust ${60} -> ${v.trust[b]}), narrations: ${favLines.length}`);
  check('the -2 cost lands on every qualifying convo end (mechanic intact)', cost === 40, `cost=${cost}`);
  check('narration throttled: <=3 beats in 10 days (was 20/20 before)', favLines.length <= 3, `narrations=${favLines.length}`);
  check('rising edge narrates the first time', /long eyes/.test(favLines[0] || ''), `first=${JSON.stringify((favLines[0] || '').slice(0, 60))}`);
  check('narrated beat names the other side and the cost', /\(-2 trust\)/.test(favLines[0] || ''));

  // Rising edge re-arms: trust dips below 50, then returns.
  const n0 = favLines.length;
  Game.convoConflictFallout(a, 40);   // below threshold: no cost, re-arm
  check('no cost below the 50 threshold', v.trust[b] === 20, `trustB=${v.trust[b]}`);
  Game.state.scholar.day = 25;        // >7 days later, so the reminder rule alone would also fire;
  Game.convoConflictFallout(a, 55);   // but the rising edge must fire regardless of the 7-day clock
  const favLines2 = said.filter(t => /long eyes|colder to you lately/.test(t));
  check('re-crossing 50 re-narrates (rising edge re-armed)', favLines2.length === n0 + 1,
    `before=${n0} after=${favLines2.length}`);
  check('re-crossing still costs -2', v.trust[b] === 18, `trustB=${v.trust[b]}`);

  // Unknown-conflict variant: the "colder" line throttles the same way.
  v.conflicts[0].known = false;
  v.conflicts[0]._favAbove = {}; v.conflicts[0]._favNarrDay = {};
  v.trust[b] = 60;
  said.length = 0;
  Game.state.scholar.day = 40;
  for (let i = 0; i < 10; i++) {
    Game.state.scholar.day = 40 + Math.floor(i / 2);
    Game.convoConflictFallout(a, 55);
  }
  const coldLines = said.filter(t => /colder to you lately/.test(t));
  check('unknown-conflict beat throttled too (<=2 in 5 days)', coldLines.length <= 2, `narrations=${coldLines.length}`);
  check('unknown-conflict cost still lands every time', v.trust[b] === 40, `trustB=${v.trust[b]}`);

  // Resolved conflicts stay silent entirely.
  v.conflicts[0].resolved = true;
  said.length = 0;
  Game.convoConflictFallout(a, 55);
  check('resolved conflict: no cost, no narration', v.trust[b] === 40 && said.length === 0,
    `trustB=${v.trust[b]} said=${said.length}`);

  // ---- FEUD INCIDENT NO-REPEAT (same run, second blank) ----
  // BEFORE (r38 pilot corpus): the 4-incident pool re-served the identical
  // beat 3x in 4 days on hot feuds (3501 incident-message d18/d20/d21;
  // 3503 incident-cornered d18/d20/d21).
  // AFTER: conflictIncident never serves the same incident twice running.
  v.conflicts[0].resolved = false;
  v.conflicts[0].known = true;
  const cls = (t) => /sharp, quiet argument/.test(t) ? 'argument'
    : /corners you by the fire/.test(t) ? 'cornered'
    : /eats apart/.test(t) ? 'eatsapart'
    : /carry a message/.test(t) ? 'message' : '?';
  const seq = [];
  said.length = 0;
  for (let i = 0; i < 24; i++) {
    const before = said.length;
    try { Game.conflictIncident(v.conflicts[0]); } catch (e) { /* keep going */ }
    const fresh = said.slice(before).join(' ');
    const c = cls(fresh);
    if (c !== '?') seq.push(c);
  }
  check('conflictIncident fires over repeated calls', seq.length >= 12, `fired=${seq.length}/24`);
  let backToBack = 0;
  for (let i = 1; i < seq.length; i++) if (seq[i] === seq[i - 1]) backToBack++;
  console.log(`  incident sequence (${seq.length} fires): ${seq.join(',')}`);
  check('no identical incident twice running (was 3x-in-4d before)', backToBack === 0,
    `back-to-back repeats=${backToBack}`);
  const kinds = new Set(seq);
  check('all 4 incident kinds still reachable', kinds.size === 4, `kinds=${[...kinds].join(',')}`);

  Game.say = origSay;
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROBE ERROR:', e && e.stack || e); process.exit(2); });
