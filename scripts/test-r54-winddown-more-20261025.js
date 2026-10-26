#!/usr/bin/env node
// scripts/test-r54-winddown-more-20261025.js — proof test for the r54 blank:
// WIND-DOWN 'MORE' SWALLOWED (wild: journey-landing r53, seed 638 day 5,
// Jorge Silva). After personal/past/village/plans asks, the goodbye beat
// surfaced ("Anyway — I should get back to it. Good talking, though."),
// the winddown menu offered [more] "One more thing —", and taking it
// returned THEM: (no line) while the engine closed the sitting.
//
// ROOT CAUSE (conversation.js, convoTurn tail): the winddown menu's
// non-leave picks run their branch and EMIT the beat to the transcript,
// but the tail then returns convoMaybeWinddown's endConvo('natural')
// result instead of the turn's line — and endConvo's quiet-close path
// (goodbyeSaid, because windingDown was true) returns line null. The
// beat was computed and transcript-logged but never RETURNED, so the
// player saw silence for their pick, then the close.
//
// The winddown menu's documented purpose is "one last turn — say
// goodbye yourself, take one more beat of a live thread, or just
// leave" (convoWinddownChoices). Gating 'more' off would kill that
// grace beat to hide a display bug. The fix: when a winddown-menu
// non-leave pick lands while windingDown, end the sitting WITH the
// turn's beat as the closing line (one grace beat, then over, spoken).
//
// GREEN means:
//   A. winddown + plans thread + 'more' -> a real (non-dry, non-empty)
//      plans beat AND ended=true. (Pre-fix: line null + ended — THE BUG.)
//   B. winddown + 'leave' -> quiet close UNCHANGED (line null + ended).
//      The goodbye was already said; leave must not gain a second one.
//   C. no winddown + plans thread + 'more' -> beat + ended=false.
//      The normal path is untouched by the fix.
//   D. winddown + 'agree' -> a non-empty agree beat AND ended=true.
//      Same swallow class as 'more', same fix.
// State note: windingDown=true is set directly, mirroring the state
// after the goodbye beat surfaces (proven by the r53 wild transcript);
// the unit under test is the tail-swallow on the next pick, not the
// surfacing itself.
// Usage: node scripts/test-r54-winddown-more-20261025.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const DRY_RE = /I've told you everything|That's the whole of it|pretty much all of it|I wish there was more to tell/i;

async function main() {
  const fails = [];
  const ok = (name) => console.log(`ok - ${name}`);
  const fail = (name, detail) => fails.push(`${name}: ${detail}`);

  const { Game } = await loadGame({ seed: 777054, mode: 'r54-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== me);
  if (roster.length < 4) { console.error('construction invalid: roster too small'); process.exit(2); }

  // Arm a conversation exactly like the post-goodbye state: a live thread,
  // budget spent, the goodbye already spoken (windingDown), no hanging
  // question/ask so the tail reaches the windingDown branch.
  function armWinddown(vid, thread) {
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    if (thread) { c.thread = thread; c.depth = 1; }
    c.windingDown = true;
    c.winddownQueued = false;
    c.exchanges = Math.max(c.exchanges || 0, c.budget || 0);
    c.pendingQ = null; c.reactiveQ = null; c.genericQ = null; c.heldAsk = false;
    return c;
  }
  function end(vid) { try { Game.endConvo(vid, 'done'); } catch (e) {} }

  // A. winddown + plans + 'more' -> real beat, ended.
  {
    const vid = roster[0];
    armWinddown(vid, 'plans');
    const r = Game.convoTurn(vid, 'more');
    const line = String((r && r.line) || '');
    if (!line) fail('A', 'winddown more returned null/empty line (THE BUG)');
    else if (DRY_RE.test(line)) fail('A', `winddown more fell to dry admission: "${line.slice(0, 120)}"`);
    else if (!r.ended) fail('A', `winddown more did not end sitting: "${line.slice(0, 120)}"`);
    else ok(`A winddown more -> beat + ended ("${line.slice(0, 80)}")`);
    end(vid);
  }

  // B. winddown + 'leave' -> quiet close unchanged.
  {
    const vid = roster[1];
    armWinddown(vid, 'plans');
    const r = Game.convoTurn(vid, 'leave');
    const line = (r && r.line) || null;
    if (line) fail('B', `leave gained a line (goodbye would double): "${String(line).slice(0, 120)}"`);
    else if (!r.ended) fail('B', 'leave did not end sitting');
    else ok('B winddown leave -> quiet close unchanged (null line + ended)');
    end(vid);
  }

  // C. no winddown + plans + 'more' -> beat, sitting continues.
  {
    const vid = roster[2];
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.thread = 'plans'; c.depth = 1;
    const r = Game.convoTurn(vid, 'more');
    const line = String((r && r.line) || '');
    if (!line) fail('C', 'normal more returned null/empty line');
    else if (DRY_RE.test(line)) fail('C', `normal more fell to dry admission: "${line.slice(0, 120)}"`);
    else if (r.ended) fail('C', 'normal more ended the sitting');
    else ok(`C normal more -> beat, sitting continues ("${line.slice(0, 80)}")`);
    end(vid);
  }

  // D. winddown + 'agree' -> agree beat, ended.
  {
    const vid = roster[3];
    armWinddown(vid, 'plans');
    const r = Game.convoTurn(vid, 'agree');
    const line = String((r && r.line) || '');
    if (!line) fail('D', 'winddown agree returned null/empty line (same swallow)');
    else if (!r.ended) fail('D', `winddown agree did not end sitting: "${line.slice(0, 120)}"`);
    else ok(`D winddown agree -> beat + ended ("${line.slice(0, 80)}")`);
    end(vid);
  }

  if (fails.length) {
    console.log(`\nFAIL (${fails.length}):`);
    for (const f of fails) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('\nALL GREEN (4/4)');
}

main().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
