#!/usr/bin/env node
// Proof test: resume-opener memory quotes (deepening r11, 2026-10-15).
//
// BLANK: the topic ledger had a `snippet` field on open threads but NOTHING
// ever wrote it, so convoResumeOpener could only reference labels — "We
// never did finish talking about their secret — that was 9 days back" —
// which reads as fabricated shared history (Steve's conversation bar: no
// fabricated shared history), even when the conversation really happened.
//
// FIX (src/js/conversation.js): the three open-thread plant sites
// (convoPlantOpenThread 'left'/'unfinished', convoNoteBeat subject-change)
// capture the last NPC-spoken beat on the thread via convoLastThreadSnippet
// and store it on the thread; convoResumeOpener quotes it.
//
// RED (pristine): the plant stores no snippet; the resume line carries no
//   quote of what was said.
// GREEN (fixed): the plant stores the last beat; the resume line quotes it.
//
// Usage: node scripts/test-convo-resume-quote-20261014.js
'use strict';
// SEED BEFORE EVAL: modules capture Math.random at load (AGENTS.md).
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(20261015);

const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};
function clearThreads(Game, vid) {
  try { Game.state.village.topicLog[vid].open = []; } catch (e) {}
  try { delete Game.convoGet(vid)._resumedOnce; } catch (e) {}
  try { delete (Game.state.village.convoSeeds || {})[vid]; } catch (e) {}
}
// keepOnly: prune the open list to the thread under test so the opener's
// random pick is deterministic. Clears any want-seed too (endConvo may
// plant one; the opener yields to seeds).
function keepOnly(Game, vid, tid) {
  try {
    const L = Game.state.village.topicLog[vid];
    L.open = (L.open || []).filter(o => o.tid === tid);
  } catch (e) {}
  try { delete (Game.state.village.convoSeeds || {})[vid]; } catch (e) {}
  try { delete Game.convoGet(vid)._resumedOnce; } catch (e) {}
}
function resumeLine(Game, vid) {
  const saveR = Math.random;
  Math.random = () => 0.1; // force the 0.65 gate open, single-thread pick
  let line = null;
  try {
    const r = Game.convoResumeOpener(vid);
    line = r && r.line;
  } catch (e) { line = 'ERROR: ' + e.message; }
  Math.random = saveR;
  return line;
}

async function main() {
  const lg = await loadGame({ seed: 20261015, fullTelemetry: true });
  const Game = lg.Game;
  if (lg.loadFails && lg.loadFails.length) console.log('LOAD FAILS: ' + JSON.stringify(lg.loadFails));
  await setupGame(Game);

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  ok(!!vid, 'a villager exists to talk to');
  if (!vid) { console.log(`\nRESULT: ${pass} pass, ${fail} fail`); process.exit(1); }
  try { Game.state.village.trust[vid] = 50; } catch (e) {}

  const BEAT1 = 'Their voice drops. "I saw lights over the ridge the night we woke."';
  const BEAT2 = 'They will not say whose name was on the list.';

  // ---- Path A: walk away mid-thread (endConvo 'left' -> plant) ----
  clearThreads(Game, vid);
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  c.thread = 'secret'; c.depth = 2;
  Game.convoNoteBeat(vid, 'secret', BEAT1);
  Game.convoNoteBeat(vid, 'secret', BEAT2);
  Game.endConvo(vid, 'left');
  keepOnly(Game, vid, 'secret');
  let open = [];
  try { open = Game.convoOpenThreads(vid); } catch (e) {}
  const planted = open.find(o => o.tid === 'secret');
  ok(!!planted, 'walk-away plants the secret thread');
  ok(planted && planted.snippet === BEAT2,
    `plant stores the last spoken beat (got: ${JSON.stringify(planted && planted.snippet)})`);
  const lineA = resumeLine(Game, vid);
  ok(typeof lineA === 'string' && lineA.length > 0, 'resume opener fires for the planted thread');
  ok(lineA && lineA.indexOf(BEAT2) >= 0,
    `resume line quotes the last beat (got: ${String(lineA).slice(0, 160)})`);

  // ---- Path B: subject change mid-conversation plants the old thread ----
  clearThreads(Game, vid);
  Game.startConvo(vid);
  const c2 = Game.convoGet(vid);
  c2.thread = 'gossip'; c2.depth = 2;
  Game.convoNoteBeat(vid, 'secret', BEAT1);   // old thread gets a beat
  Game.convoNoteBeat(vid, 'gossip', 'Did you hear about the stores?'); // subject change
  Game.endConvo(vid, 'done'); // 'done' with no unresolved: no re-plant of gossip
  keepOnly(Game, vid, 'secret');
  let open2 = [];
  try { open2 = Game.convoOpenThreads(vid); } catch (e) {}
  const planted2 = open2.find(o => o.tid === 'secret');
  ok(!!planted2, 'subject-change plants the abandoned thread');
  // threadLog pre-cleans surrounding quotes (pre-existing convoNoteBeat
  // behavior) — the stored snippet is the cleaned beat, not the raw line.
  const BEAT1_CLEAN = BEAT1.replace(/^"+|"+$/g, '');
  ok(planted2 && planted2.snippet === BEAT1_CLEAN,
    `subject-change plant stores the old thread's last beat (got: ${JSON.stringify(planted2 && planted2.snippet)})`);
  const lineB = resumeLine(Game, vid);
  ok(lineB && lineB.indexOf(BEAT1) >= 0,
    `resume line quotes the subject-changed thread's beat (got: ${String(lineB).slice(0, 160)})`);

  // ---- Path C: legacy threads (no snippet) render exactly as before ----
  clearThreads(Game, vid);
  Game.convoThreadOpen(vid, 'past', 'their past', 'unfinished business');
  const lineC = resumeLine(Game, vid);
  ok(typeof lineC === 'string' && lineC.indexOf('their past') >= 0,
    'legacy no-snippet thread still resumes by label');
  ok(lineC && lineC.indexOf('""') < 0 && !/\" *\"/.test(lineC),
    `no dangling empty quotes on legacy threads (got: ${String(lineC).slice(0, 160)})`);

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
