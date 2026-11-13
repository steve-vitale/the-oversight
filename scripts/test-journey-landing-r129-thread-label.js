#!/usr/bin/env node
// test-journey-landing-r129-thread-label.js — proof test for the r129 D1
// fix (journey-landing r129 2026-11-13).
//
// The defect (r128 M5, seed 1142 d6, Dmitri): the topic menu offers
// [alive:thread:personal] "We never finished — themselves." — a dangling
// pronoun, garbled in the player-facing menu. Root cause: the open
// thread's ledger label for 'personal' is 'themselves'
// (convoTopicLabel base map), and convoWhatsAlive (convo-scene.js) built
// the menu label from the RAW ledger label. The resume spoken line and
// the closing frames already route through convoThreadAbout, which
// renders 'themselves' as 'your story' — the menu was the one path that
// didn't.
//
// The fix: convoWhatsAlive uses convoThreadAbout for the thread menu
// label, so the menu, the resume line, and the close all agree. The
// ledger label itself is untouched (sibling proof tests pin it verbatim).
//
// Cases (one process — the harness loads once; each case is a separate
// villager/thread so no state leaks between them):
//   personal-menu  : open a 'personal' thread, read convoWhatsAlive —
//             the alive:thread:personal item reads "We never finished —
//             your story." (BEFORE: "...themselves." — FAIL).
//   ledger-untouched: the stored thread label is still 'themselves'
//             (control: the fix changes the rendering, not the ledger).
//   goal-menu      : open a 'goal' thread — its label is unaffected
//             ("We never finished — what they want."; control: the fix
//             must not rewrite labels that were already grammatical).
//
// "FAIL on unfixed code": personal-menu reads "themselves" (the live
// r128 transcript is the unfixed-behavior evidence; the test asserts the
// fixed rendering).
//
// Usage: node scripts/test-journey-landing-r129-thread-label.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

async function main() {
  const { Game } = await loadGame({ seed: 1142, fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const scholarId = Game.villagerId;
  const vid = roster.find(id => id && id !== scholarId);
  if (!vid) { console.log('FAIL no villager to test with'); process.exit(1); }
  if (typeof Game.convoWhatsAlive !== 'function') { console.log('FAIL convoWhatsAlive missing'); process.exit(1); }

  // The snippet must be a real beat (convoThreadOpen's R19 gate rejects
  // micro-fillers). Dmitri's own line from the r128 transcript.
  const snippet = '"Denver rain. Specific rain. I\'m allowed to be specific."';

  // --- personal-menu ---
  const labelPersonal = Game.convoTopicLabel(vid, 'personal');
  check('ledger label for personal is themselves (precondition)', labelPersonal === 'themselves', `got ${JSON.stringify(labelPersonal)}`);
  Game.convoThreadOpen(vid, 'personal', labelPersonal, 'changed the subject', snippet);
  const alive = Game.convoWhatsAlive(vid) || [];
  const item = (Array.isArray(alive) ? alive : alive.items || []).find(x => x && x.id === 'alive:thread:personal');
  check('personal thread offered in the menu', !!item, `items=${JSON.stringify((Array.isArray(alive) ? alive : alive.items || []).map(x => x && x.id))}`);
  if (item) {
    check('personal menu label reads your story', /your story/.test(item.label || ''), `got ${JSON.stringify(item.label)}`);
    check('personal menu label has no dangling themselves', !/themselves/.test(item.label || ''), `got ${JSON.stringify(item.label)}`);
  }

  // --- ledger-untouched ---
  const open = Game.convoOpenThreads(vid) || [];
  const stored = open.find(o => o && o.tid === 'personal');
  check('stored ledger label still themselves', !!stored && stored.label === 'themselves', `got ${JSON.stringify(stored && stored.label)}`);

  // --- goal-menu (control) ---
  Game.convoThreadOpen(vid, 'goal', Game.convoTopicLabel(vid, 'goal'), 'changed the subject', '"Hungry people make bad decisions. Fed people can think."');
  const alive2 = Game.convoWhatsAlive(vid) || [];
  const goalItem = (Array.isArray(alive2) ? alive2 : alive2.items || []).find(x => x && x.id === 'alive:thread:goal');
  check('goal thread offered in the menu', !!goalItem, `items=${JSON.stringify((Array.isArray(alive2) ? alive2 : alive2.items || []).map(x => x && x.id))}`);
  if (goalItem) {
    // The goal label is the goal itself ("wanting ..."), not the category
    // (GOAL NAMES ITS WANT, r68) — the control pins that the fix leaves
    // an already-grammatical label alone.
    check('goal menu label unchanged (goal phrase, not category)', /wanting /.test(goalItem.label || '') && !/themselves/.test(goalItem.label || ''), `got ${JSON.stringify(goalItem.label)}`);
  }

  console.log(fails === 0 ? 'test-journey-landing-r129-thread-label: ALL GREEN' : 'test-journey-landing-r129-thread-label: ' + fails + ' FAILURES');
  process.exit(fails === 0 ? 0 : 1);
}

main().catch(e => { console.log('FAIL harness error — ' + (e && e.stack || e)); process.exit(1); });
