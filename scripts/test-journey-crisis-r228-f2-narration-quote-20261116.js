#!/usr/bin/env node
'use strict';
// Proof: a memory quote is the NPC's own spoken words, never narration
// (journey-crisis r228, F2 — the r223 F1 class, second sighting).
//
// TRANSCRIPT-CAUGHT (crisis r228 panel): two resume openers quote the
// narrator about the NPC herself —
//   seed 14483 d11 Esmeralda: "...that question — we wandered off it.
//     'Okay. Something shutters, just slightly.'"
//   seed 14485 d15 Booker: "...what's been happening — we wandered off
//     it. 'I see. They take a moment to think about your answer.'"
// In the sitting the renderer keeps speech and narration apart
// (NPC: "Okay." Something shutters, just slightly.), but the resume
// quote strips the double quotes and presents the whole snippet as
// spoken memory. The mechanism: convoDeflectQLine's pool (8 lines) and
// the GQ_ACK yes-pool are built as a SHORT quoted fragment ("Okay.",
// "I see.", "Mm.") plus a narration sentence — and
// convoSnippetIsStageDirection returned false for ANY snippet
// containing a double quote, so the fragment+narration shape sailed
// through both the plant gate and the resume-time guard.
//
// GREEN (post-fix): a mixed snippet is quotable only when its quoted
// speech carries a proposition (>= 4 words, the real-beat floor — the
// 'They go still. "So it's not just me…"' shape stays real memory). A
// fragment plus narration is stage direction: the plant walks back to
// substance (or plants nothing) and the resume-time guard drops quotes
// planted before the fix. A dropped quote is harmless — the resume
// still names the thread.
//
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const DEFLECT_POOL = [
  '"Okay." Something shutters, just slightly.',
  '"Fine." Their face closes like a door.',
  '"Right." They look away, and the question dies where it stood.',
  '"Sure." The warmth drains out of their eyes.',
  '"Okay." A small silence, and then they move on.',
  '"Mm." They fold their arms and the subject is gone.',
  '"Fine." Something in them steps back from you.',
  '"Right." They nod once, and the door between you shuts a little.',
];
const GQ_MIXED = [
  '"I see." They take a moment to think about your answer.',
  'They nod. "Okay."',
];
const REAL_MEMORY = [
  'They go still. "So it\'s not just me…"',
  '"Can I tell you something? I know who took the extra rations but won\'t say."',
  'My arm still burns where the beast caught me. I need someone to look at it.',
  '"We bury, we grieve, we keep going. There\'s no step four."',
  '"Don\'t mind me. Today\'s just heavy."',
];
const WOUND_BEAT = 'My arm still burns where the beast caught me. I need someone to look at it.';

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const speakers = [];
  for (const id of roster) {
    try { if (Game.commLevel(id).level !== 'full') continue; } catch (e) { continue; }
    speakers.push(id);
    if (speakers.length >= 4) break;
  }
  check('enough full-comm speakers', speakers.length >= 4, 'found ' + speakers.length);

  // ---- 1. guard unit: every deflect-pool line is stage direction. ----
  for (const line of DEFLECT_POOL) {
    check('deflect-pool line rejected: ' + line.slice(0, 40),
      Game.convoSnippetIsStageDirection(line) === true, 'got false for: ' + line);
  }

  // ---- 2. guard unit: mixed GQ_ACK lines rejected; pure speech kept. ----
  for (const line of GQ_MIXED) {
    check('GQ_ACK mixed line rejected: ' + line.slice(0, 40),
      Game.convoSnippetIsStageDirection(line) === true, 'got false for: ' + line);
  }
  check('GQ_ACK pure-speech line kept',
    Game.convoSnippetIsStageDirection('"All right. Thank you for telling me."') === false);

  // ---- 3. guard unit: real memories stay quotable. ----
  for (const line of REAL_MEMORY) {
    check('real memory kept: ' + line.slice(0, 40),
      Game.convoSnippetIsStageDirection(line) === false, 'got true for: ' + line);
  }

  // ---- 4. plant gate: a deflect-response snippet plants nothing. ----
  const vid4 = speakers[0];
  v.trust = v.trust || {};
  v.trust[vid4] = 50;
  Game.startConvo(vid4);
  Game.convoThreadOpen(vid4, 'want', 'that question', 'changed the subject', DEFLECT_POOL[0]);
  check('plant with deflect snippet plants no thread',
    Game.convoOpenThreads(vid4).length === 0,
    'open: ' + JSON.stringify(Game.convoOpenThreads(vid4)));
  Game.convoThreadOpen(vid4, 'want', 'that question', 'changed the subject', WOUND_BEAT);
  check('plant with a real beat still plants',
    Game.convoOpenThreads(vid4).length === 1,
    'open: ' + JSON.stringify(Game.convoOpenThreads(vid4)));

  // ---- 5. resume-time guard: a pre-fix plant drops the quote. ----
  // Simulate a thread planted before the fix by writing the record
  // directly into the ledger, then pull the resume opener: the thread
  // still resumes (label + why), but the narration quote must not
  // appear in the line.
  const vid5 = speakers[1];
  v.trust[vid5] = 50;
  Game.startConvo(vid5);
  const L5 = Game.convoTopicLedger(vid5);
  L5.open.push({
    tid: 'want', label: 'that question',
    day: (Game.state.scholar || {}).day || 1,
    why: 'changed the subject', snippet: DEFLECT_POOL[0],
  });
  let rs5 = null;
  for (let i = 0; i < 40 && !rs5; i++) rs5 = Game.convoResumeOpener(vid5);
  check('resume fires on the pre-fix plant', rs5 != null, 'got null');
  console.log('  pre-fix plant resume -> ' + JSON.stringify(rs5 && rs5.line));
  check('resume drops the narration quote',
    rs5 && !rs5.line.includes('shutters'), 'got: ' + (rs5 && rs5.line));
  check('resume still names the thread',
    rs5 && rs5.line.includes('that question'), 'got: ' + (rs5 && rs5.line));

  // ---- 6. resume-time guard, second transcript case (GQ_ACK). ----
  const vid6 = speakers[2];
  v.trust[vid6] = 50;
  Game.startConvo(vid6);
  const L6 = Game.convoTopicLedger(vid6);
  L6.open.push({
    tid: 'lately', label: "what's been happening",
    day: (Game.state.scholar || {}).day || 1,
    why: 'changed the subject', snippet: GQ_MIXED[0],
  });
  let rs6 = null;
  for (let i = 0; i < 40 && !rs6; i++) rs6 = Game.convoResumeOpener(vid6);
  check('resume fires on the GQ_ACK plant', rs6 != null, 'got null');
  console.log('  GQ_ACK plant resume -> ' + JSON.stringify(rs6 && rs6.line));
  check('resume drops the GQ_ACK narration quote',
    rs6 && !rs6.line.includes('take a moment'), 'got: ' + (rs6 && rs6.line));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
