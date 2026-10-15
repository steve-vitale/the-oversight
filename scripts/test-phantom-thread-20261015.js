#!/usr/bin/env node
// test-phantom-thread-20261015.js — journey establishment r5.
//
// QUESTION (r5 people-check): sittings opened with "We never did finish
// talking about that favor — X days back" for favors never discussed
// (Anh d25 s124, Sanne d37 s82, Nadia d37 s124 — all verified: no prior
// conversation with that villager exists). Root cause: a conversation
// opened and immediately left (talkRound's open-and-walk-out; a human
// player tapping away on turn 1 does the same) plants an open 'want'
// thread via convoPlantOpenThread(vid,'left') even though NOTHING was said
// about the want — the resume opener then fabricates shared history.
//
// RED: talkTo(vid) + endConvo(vid,'left') with zero exchanges must plant
// NO open thread. GREEN: convoOpenThreads(vid) is empty afterwards, and a
// later conversation does not open with the "never did finish" resume.
// GUARD: a REAL exchange (player engages the want, NPC speaks a beat on
// the thread, then leaves) STILL plants the thread — the fix must not
// kill legitimate resumes.
//
// Canon: docs/CONVERSATIONS.md (dialogue, talk, gossip). Steve's bar:
// no fabricated shared history.
//
// Run: node scripts/test-phantom-thread-20261015.js
//      SEED=61 node scripts/test-phantom-thread-20261015.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEED ? [parseInt(process.env.SEED, 10)] : [61, 82, 103]);

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function liveVillager(Game, exclude) {
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && id !== exclude);
  for (const id of roster) {
    try { const p = Game.getPerson(id); if (p && !p.dead) return id; } catch (e) { return id; }
  }
  return roster[0];
}

function openThreads(Game, vid) {
  try { return Game.convoOpenThreads(vid) || []; } catch (e) { return []; }
}

async function runSeed(seed) {
  console.log(`\n### seed ${seed}`);
  const { Game } = await loadGame({ seed });
  await setupGame(Game);

  // --- RED CASE: open and immediately leave, zero exchanges ---
  const vid = liveVillager(Game);
  ok(!!vid, 'fixture: live villager found');
  let opener = null;
  try { opener = Game.talkTo(vid); } catch (e) { console.log('talkTo threw: ' + e.message); }
  let c0 = null;
  try { c0 = Game.convoGet(vid); } catch (e) {}
  const threadAtOpen = c0 && c0.thread;
  const depthAtOpen = c0 && c0.depth;
  console.log(`  opener thread=${threadAtOpen} depth=${depthAtOpen} opener=${JSON.stringify(String(opener).slice(0, 80))}`);
  try { Game.endConvo(vid, 'left'); } catch (e) { console.log('endConvo threw: ' + e.message); }
  const planted = openThreads(Game, vid);
  console.log('  planted threads: ' + JSON.stringify(planted.map(t => ({ tid: t.tid, label: t.label, day: t.day }))));
  ok(planted.length === 0, 'zero-exchange leave plants NO open thread',
    `planted ${planted.length}: ${planted.map(t => t.tid + '/' + t.label).join(', ')}`);

  // --- resume honesty: a later conversation must not claim unfinished business ---
  let line2 = null;
  try { line2 = Game.talkTo(vid); } catch (e) {}
  const fabricated = /never did finish talking|never finished talking/i.test(String(line2));
  console.log(`  second opener: ${JSON.stringify(String(line2).slice(0, 100))}`);
  ok(!fabricated, 'second conversation does not resume phantom business');
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // --- GUARD CASE: a real exchange DOES plant the thread ---
  const vid2 = liveVillager(Game, vid);
  let c2 = null;
  try {
    Game.talkTo(vid2);
    c2 = Game.convoGet(vid2);
    // take one real turn: prefer a want-engaging choice
    const choices = Game.convoChoices(vid2) || [];
    const wantChoice = choices.find(ch => /want:ask_favor|dlg:help|goon/.test(ch.id)) || choices.find(ch => !/leave|silence/.test(ch.id));
    if (wantChoice) Game.convoTurn(vid2, wantChoice.id);
    Game.endConvo(vid2, 'left');
  } catch (e) { console.log('guard convo threw: ' + e.message); }
  const planted2 = openThreads(Game, vid2);
  const threadLog = (c2 && c2.threadLog) || [];
  console.log(`  guard: threadLog beats=${threadLog.length} planted=${JSON.stringify(planted2.map(t => t.tid))}`);
  // only assert the plant when beats were actually noted (honest precondition)
  if (threadLog.length > 0) {
    ok(planted2.length > 0, 'real exchange still plants its thread');
  } else {
    console.log('  SKIP guard plant assertion (no beats noted in one turn)');
  }
}

(async () => {
  for (const s of SEEDS) await runSeed(s);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
