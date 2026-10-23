#!/usr/bin/env node
// test-social-r7-fixes-20261012.js — r7 blank-fill proofs (journey-social 2026-10-12).
// Two blanks from the r7 playthrough (subagent sense-test of seeds 30303/40404/50505):
//  1. WINDDOWN STACKED SIGN-OFFS: natural ends emitted 2-4 consecutive NPC
//     goodbye lines ("should get back to it" + "Right. Go on, then." + dry
//     trail-offs). Fix: endConvo closes quietly when the winddown beat was
//     already spoken (goodbyeSaid) — a person says goodbye once.
//  2. DIG-RESULT FILLER LOOP: the bribery dig miss was one template repeated
//     6-8x verbatim. Fix: bribeDigMissLine() per-case rotation.
// Usage: node scripts/test-social-r7-fixes-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

(async () => {
  const { Game } = await loadGame({ seed: 31337, mode: 'proof' });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  const npcs = (Game.npcIds() || []).filter(id => id !== Game.villagerId);
  const vid = npcs[0];

  // ---------- 1. winddown: exactly one goodbye ----------
  Game.startConvo(vid);
  let c = Game.convoGet(vid);
  ok(!!(c && c.active), 'conversation starts');
  // spend the budget deterministically: force the winddown queue
  c.budget = 0; c.exchanges = 99; c.pendingQ = null; c.heldAsk = false;
  c.heldBeats = [];
  Game.convoMaybeWinddown(vid); // direct: the turn tail calls this
  c = Game.convoGet(vid);
  const queued = (c.heldBeats || []).some(h => h && h.winddown);
  ok(queued || c.windingDown, 'winddown goodbye queued (or already winding down)');
  // reveal the goodbye via the continuer
  if (queued && !c.windingDown) {
    const r = Game.convoTurn(vid, 'goon');
    ok(!!(r && r.windingDown), 'goodbye beat revealed via continuer');
  }
  c = Game.convoGet(vid);
  const mark = (c.transcript || []).length;
  // now leave — the player says goodbye after the NPC already did
  Game.convoTurn(vid, 'leave');
  c = Game.convoGet(vid);
  const tail = (c.transcript || []).slice(mark).filter(e => e.who !== 'you').map(e => String(e.text || ''));
  const leftexits = ['Oh — okay. Later, then.', "Sure. I'll be around.", 'Right. Go on, then.'];
  const secondGoodbye = tail.some(t => leftexits.some(l => t.includes(l)));
  ok(!secondGoodbye, 'no second exit line after the winddown goodbye');
  ok(!(c.active), 'conversation ended');
  console.log('  -- tail NPC lines: ' + JSON.stringify(tail.slice(0, 4)));

  // a conversation that ends WITHOUT winddown still gets its exit line
  const vid2 = npcs[1];
  Game.startConvo(vid2);
  Game.convoTurn(vid2, 'leave');
  const c2 = Game.convoGet(vid2);
  const tail2 = (c2.transcript || []).filter(e => e.who !== 'you').map(e => String(e.text || ''));
  ok(tail2.some(t => leftexits.some(l => t.includes(l))), 'abrupt leave still gets a normal exit line');

  // ---------- 2. dig-miss pool (r7 rotation; r43 no-wrap + cold-trail) ----------
  // r43 (journey-social, THE VOICING THRESHOLD): L2' showed digs run 6+ deep
  // and the 4-line pool wrapped mid-convo — verbatim repeats after a full
  // cycle, the same filler-loop shape r7 fixed. Now 8 distinct lines with NO
  // wrap; past exhaustion the narrator admits the trail is cold.
  const fake = {};
  const digs = Array.from({ length: 9 }, () => Game.bribeDigMissLine(fake));
  ok(new Set(digs.slice(0, 8)).size === 8, 'dig-miss: 8 distinct lines before exhaustion');
  ok(digs.slice(0, 8).every(d => !/burns daylight/.test(d)), 'dig-miss: pool lines are investigation, not the cold-trail line');
  ok(/burns daylight/.test(digs[8]), 'dig-miss: dig 9 speaks the honest cold-trail line (no wrap)');
  const fake3 = {};
  const deep = Array.from({ length: 12 }, () => Game.bribeDigMissLine(fake3));
  ok(new Set(deep.slice(0, 8)).size === 8 && deep.slice(8).every(d => /burns daylight/.test(d)),
    'dig-miss: no verbatim pool repeat across 12 digs');
  // per-case independence: a second case starts its own pool
  const fake2 = {};
  ok(Game.bribeDigMissLine(fake2) === digs[0], 'dig-miss: rotation is per-case');
  // end-to-end: investigateBribery with no bribes says a pool line
  const plot = { id: 'p_dig', day: Game.state.scholar.day, leader: npcs[2], accomplices: [], target: npcs[3], weakest: npcs[2], witnesses: [] };
  Game.betrayalState().plots.push(plot);
  const cs = Game.openCase(plot, 'murder');
  const saidBefore = lines.length;
  const f = Game.investigateBribery(cs.id);
  ok(Array.isArray(f) && f.length === 0, 'investigateBribery finds nothing (no bribes planted)');
  const saidLine = lines.slice(saidBefore).join(' ');
  ok(digs.slice(0, 4).some(d => saidLine.includes(d.slice(0, 30))), 'investigateBribery miss uses the rotating pool');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
