#!/usr/bin/env node
// scripts/test-r30-recap-label-20261023.js — proof test for the r30 blank:
// RECFAP/RESUME 'themselves' LABEL. The personal thread's ledger label
// ('themselves') leaked raw into NPC-spoken frames: the recap answered
// "Still on themselves." and the resume opener said "We never finished
// talking about themselves." (transcript-caught, journey-establishment r30,
// seeds 103/61/124). A previous fix routed the CLOSING frame through
// convoThreadAbout ('themselves' -> 'your story'; test pinned), but the
// recap and resume opener used the raw label.
//
// Fix: both frames route through convoThreadAbout, the designated
// grammatical-phrase function. GREEN means:
//   A. convoRecapLine on a personal thread says "your story", not "themselves".
//   B. convoResumeOpener on a personal open thread says "your story", not "themselves".
//   C. Other threads' labels pass through untouched (village -> "the village").
// Usage: node scripts/test-r30-recap-label-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const fails = [];
  const ok = (name, cond, detail) => {
    if (cond) console.log(`ok - ${name}`);
    else fails.push(`${name}: ${detail}`);
  };

  const { Game } = await loadGame({ seed: 303001, mode: 'r30-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== me);
  if (roster.length < 2) { console.error('construction invalid: roster too small'); process.exit(2); }
  const H = roster[0];

  // Plant a personal thread with the ledger label, then drive the recap.
  // (convoThreadOpen requires a real snippet — the no-ghost-threads contract.)
  // NOTE: convoNoteTopic would resolve the open thread — the resume check
  // runs first, on the planted open thread.
  Game.convoThreadOpen(H, 'personal', 'themselves', 'walked away mid-thread',
    'Every morning I wake up surprised. Like part of me still expects the old world.');
  const v2 = Game.state.village;
  v2.trust = v2.trust || {};
  v2.trust[H] = 50;

  // B. Resume opener on the open personal thread (gated: trust>=15, 65% draw —
  // retry the draw; the assertion is on the label mapping, not the gate).
  let resume = null;
  for (let i = 0; i < 20 && !resume; i++) {
    try { delete Game.convoGet(H)._resumedOnce; } catch (e) {}
    resume = Game.convoResumeOpener(H);
  }
  ok('B. resume opener is grammatical (no "themselves")',
    resume && typeof resume.line === 'string' && /your story/.test(resume.line) && !/themselves/.test(resume.line),
    resume ? String(resume.line) : 'null resume');

  // A. Recap on the personal thread.
  const cH = Game.convoGet(H);
  cH.threadLog = [{ thread: 'personal' }];
  const recap = Game.convoRecapLine(H);
  ok('A. recap is grammatical (no "themselves")',
    typeof recap === 'string' && /your story/.test(recap) && !/themselves/.test(recap), String(recap));

  // Other threads pass through untouched.
  const H2 = roster[1];
  Game.convoThreadOpen(H2, 'village', 'the village', 'walked away mid-thread');
  Game.convoNoteTopic(H2, 'village', 'the village');
  const cH2 = Game.convoGet(H2);
  cH2.threadLog = [{ thread: 'village' }];
  const recapV = Game.convoRecapLine(H2);
  ok('C. village label passes through untouched',
    typeof recapV === 'string' && /the village/.test(recapV), String(recapV));

  if (fails.length) {
    console.error('FAILURES:\n' + fails.join('\n'));
    process.exit(1);
  }
  console.log('ALL GREEN');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
