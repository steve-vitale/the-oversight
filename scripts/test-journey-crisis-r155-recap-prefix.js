// test-journey-crisis-r155-recap-prefix.js — proof test for the r155
// RECAP-PREFIX STACKING fix.
//
// DEFECT (r154 filed #4, graduated by the r155 pilot): the recap reframe
// pool prefixes "As/Like I said —" onto a body that is itself a
// re-anchor — "Like I said — Still on that sickness help." 11 instances
// in 9/23 pilot conversations (d10/d30/d31/d33/d39/d46/d47/d59/d74;
// worst: "Now then — As I said — Still on that plant lesson."). The
// "Still on X." body already says "we covered this"; the prefix doubles
// the repetition marker. Root cause: convoRecapLine's reframe branch
// wraps the FULL inner sentence in the reframe templates.
//
// FIX (src/js/conversation.js, convoRecapLine): when the raw line has
// the "Still on X." form, reframe around the topic label instead —
// "As I said — we're still on X." / "X — that's still where we are."
// / "I've told you three times now — we're still on X." Other bodies
// ("We started on...", "We were talking about...") reframe unchanged.
//
// Run: node scripts/test-journey-crisis-r155-recap-prefix.js  (exit 0 = PASS)
// RED on unfixed code (a reframe serve contains "I said — Still on");
// GREEN after.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 13801, mode: 'test-r155-recap-prefix', fullTelemetry: false, narration: false });
  await setupGame(Game);
  const village = Game.state.village || {};
  const roster = (village.roster || []).filter(v => v !== Game.villagerId);
  check('setup: roster has villagers', roster.length >= 2, 'roster=' + roster.length);
  try { for (const v of roster) ((Game.state.village || {}).trust || {})[v] = 60; } catch (e) {}
  const vidA = roster[0];
  const vidB = roster[1];
  const vidC = roster[2] || roster[0];

  // ---------- SITTING A: "Still on X." form (the defect) ----------
  // Two log entries on the SAME thread -> raw line "Still on <label>."
  // The turn tail appends a thread-log entry on every press, so the
  // reframe path cannot be reached through convoTurn — it is exercised
  // by calling convoRecapLine directly on a fixed thread log, which is
  // exactly the unit the r27/r31 machinery owns (r154 recap test).
  Game.startConvo(vidA);
  const cA = Game.convoGet(vidA);
  cA.budget = 99;
  cA.threadLog = [
    { thread: 'goal', snippet: 'wants', ex: 0 },
    { thread: 'goal', snippet: 'wants more', ex: 0 },
  ];
  const servedA = [];
  for (let i = 0; i < 5; i++) {
    if (cA.spent && cA.spent.recap) break;
    servedA.push(String(Game.convoRecapLine(vidA) || ''));
  }
  console.log('sittingA(Still-on, direct): served=' + JSON.stringify(servedA));
  check('still-on: exactly 5 recap lines served', servedA.length === 5, 'served=' + servedA.length);
  check('still-on: 1st serve is the raw "Still on..." line', /Still on/.test(servedA[0] || '') && !/I said/.test(servedA[0] || ''), 'served[0]=' + servedA[0]);
  const stacked = servedA.filter(s => /(As|Like) I said — Still on/.test(s));
  check('still-on: NO served line stacks "I said —" onto "Still on"', stacked.length === 0, 'stacked=' + JSON.stringify(stacked));
  const reframesA = servedA.slice(1, 4);
  const reframeOk = reframesA.every(s => /we're still on/.test(s) || /— that's still where we are\./.test(s));
  check('still-on: every reframe names the topic ("we\'re still on X" / "X — that\'s still where we are")', reframeOk, 'reframes=' + JSON.stringify(reframesA));
  check('still-on: the 5th press escalates honestly ("three times now — we\'re still on")', /three times now — we're still on/.test(servedA[4] || ''), 'served[4]=' + servedA[4]);
  check('still-on: recap spent after the 5th press (cap intact)', !!(cA.spent && cA.spent.recap), 'spent.recap=' + !!(cA.spent && cA.spent.recap));
  try { Game.endConvo(vidA, 'left'); } catch (e) {}

  // ---------- SITTING B: two-thread form (must NOT change) ----------
  Game.startConvo(vidB);
  const cB = Game.convoGet(vidB);
  cB.budget = 99;
  cB.threadLog = [
    { thread: 'goal', snippet: 'wants', ex: 0 },
    { thread: 'past', snippet: 'old life', ex: 0 },
  ];
  const servedB = [];
  for (let i = 0; i < 2; i++) servedB.push(String(Game.convoRecapLine(vidB) || ''));
  console.log('sittingB(two-thread, direct): served=' + JSON.stringify(servedB));
  check('two-thread: 1st serve is the "We started on..." arc', /We started on/.test(servedB[0] || ''), 'served[0]=' + servedB[0]);
  check('two-thread: reframe keeps the arc verbatim (no "we\'re still on" inserted)', /We started on/.test(servedB[1] || '') && !/we're still on/.test(servedB[1] || ''), 'served[1]=' + servedB[1]);
  try { Game.endConvo(vidB, 'left'); } catch (e) {}

  // ---------- SITTING C: single-log form (must NOT change) ----------
  Game.startConvo(vidC);
  const cC = Game.convoGet(vidC);
  cC.budget = 99;
  cC.threadLog = [{ thread: 'goal', snippet: 'wants', ex: 0 }];
  const servedC = [];
  for (let i = 0; i < 2; i++) servedC.push(String(Game.convoRecapLine(vidC) || ''));
  console.log('sittingC(single-log, direct): served=' + JSON.stringify(servedC));
  check('single-log: 1st serve is the "We were talking about..." line', /We were talking about/.test(servedC[0] || ''), 'served[0]=' + servedC[0]);
  check('single-log: reframe keeps the line verbatim (no "we\'re still on" inserted)', /We were talking about/.test(servedC[1] || '') && !/we're still on/.test(servedC[1] || ''), 'served[1]=' + servedC[1]);
  try { Game.endConvo(vidC, 'left'); } catch (e) {}

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('test crashed: ' + (e && e.stack || e)); process.exit(2); });
