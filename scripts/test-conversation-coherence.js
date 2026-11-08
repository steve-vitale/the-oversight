#!/usr/bin/env node
// Conversation coherence tests. Usage: node scripts/test-conversation-coherence.js
// Steve's report: "Did you see that, just now? By the tree line." ->
// "Let me show you something." -> canned BURDOCK lesson (non sequitur) ->
// hard pivot to "What are you hoping for?" with no bridge.
// Rules under test:
//  1. Direct NPC questions get contextual answers (not just subject-changes).
//  2. Teach/theorize pivots are suppressed while a direct question hangs.
//  3. Unanswered questions linger: one follow-up, then a lapse line — never
//     silently dropped for a random new topic.
//  4. Genuinely new NPC questions mid-thread carry a narrative bridge.
//  5. Every choice outcome reads as a RESPONSE to the last beat.
//
// Loads via scripts/godpath/lib.js (shared sim-harness). Never copy eval
// boilerplate — that was the Text-is-not-defined crash (dialog-coherence
// audit item 10). One harness load per process; fresh runs via K.newRun.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./godpath/lib');

const T = K.reporter('conversation-coherence');
const idsOf = (choices) => (choices || []).map(c => c.id);

function seedTeachable(Game, vid) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.plants = { burdock: { level: 2 } };
  Game.state.village.taught = Game.state.village.taught || {};
  Game.state.village.taught[vid] = [];
}

// Force a specific opener by stubbing convoOpening, then restore.
function startWithOpener(Game, vid, line, thread) {
  const real = Game.convoOpening;
  Game.convoOpening = () => ({ line, thread: thread || 'small' });
  const st = Game.startConvo(vid);
  Game.convoOpening = real;
  return st;
}

function freshRoster(Game) {
  K.newRun(Game);
  return (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
}

// One-beat turns queue follow-ups / lapses / formal asks on heldBeats;
// the continuer reveals them. Drain until the queue is empty or a hanging
// question owns the menu again (goon is filtered out while reactiveQ hangs).
function drainGoon(Game, vid, max = 8) {
  const lines = [];
  for (let i = 0; i < max; i++) {
    const ids = idsOf(Game.convoChoices(vid));
    if (ids.indexOf('goon') === -1) break;
    const r = Game.convoTurn(vid, 'goon');
    if (r && r.line) lines.push(r.line);
  }
  return lines;
}

function themText(Game, vid) {
  const c = Game.convoGet(vid);
  return (c.transcript || []).filter(t => t.who === 'them').map(t => t.text).join(' || ');
}

function heldTexts(Game, vid) {
  return ((Game.convoGet(vid).heldBeats) || []).map(b => b && b.text).filter(Boolean);
}

async function main() {
  const Game = await K.load({ seed: 20261007 });

  // === 1. REGISTRY AUDIT: every match string exists in the shipped dialogue ===
  T.section('1. reactive registry');
  {
    const raw = fs.readFileSync(path.join(K.ROOT, 'src/data/characterGen.json'), 'utf8');
    // pull match strings out of the source and verify each appears in data.
    // convoMatchReactive matches case-insensitively on a normalized line
    // (bespoke defs are short fragments on purpose), so audit the same way.
    // Some defs use single quotes, some double (apostrophes in the fragment).
    const src = fs.readFileSync(path.join(K.ROOT, 'src/js/conversation.js'), 'utf8');
    const matches = [...src.matchAll(/^\s*match:\s*(['"])((?:(?!\1)[^\\]|\\.)*)\1,/gm)]
      .map(x => x[2].replace(/\\'/g, "'").replace(/\\"/g, '"'));
    const rawLower = raw.toLowerCase();
    T.ok('registry has entries', matches.length >= 8);
    for (const mt of matches) {
      T.ok(`match shipped in dialogue: ${mt.slice(0, 40)}`, rawLower.indexOf(mt.toLowerCase()) !== -1);
    }
    // every def has answers, followUp, lapse, and reactive reacts
    for (const mt of matches) {
      const def = Game.convoMatchReactive('zz' + mt + 'zz');
      T.ok(`def resolves: ${mt.slice(0, 30)}`, !!def);
      T.ok(`def has 2+ answers: ${mt.slice(0, 30)}`, !!(def && def.answers && def.answers.length >= 2));
      T.ok(`def has followUp: ${mt.slice(0, 30)}`, !!(def && def.followUp));
      T.ok(`def has lapse: ${mt.slice(0, 30)}`, !!(def && def.lapse));
      T.ok(`def has reacts: ${mt.slice(0, 30)}`,
        !!(def && def.reacts && def.reacts.agree && def.reacts.joke && def.reacts.silence));
    }
  }

  // === 2. THE SCREENSHOT SCENARIO: tree-line opener -> contextual answers, no burdock ===
  T.section('2. tree-line opener');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    seedTeachable(Game, A);
    startWithOpener(Game, A, '"Did you see that, just now? By the tree line."', 'small');
    const c = Game.convoGet(A);
    T.ok('tree-line opener sets reactiveQ', c.reactiveQ && c.reactiveQ.id === 'rq_treeline');
    T.ok('tree-line opener sets spooked thread', c.thread === 'spooked');
    const choices = Game.convoChoices(A);
    const ids = idsOf(choices);
    T.ok('reactive answers come first', ids[0] === 'react:rq_treeline:saw');
    T.ok('all four reactive answers offered',
      ['react:rq_treeline:saw', 'react:rq_treeline:no', 'react:rq_treeline:look', 'react:rq_treeline:what']
        .every(id => ids.indexOf(id) !== -1));
    T.ok('teach suppressed while direct question hangs', !K.findConvoChoice(Game, A, 'teach'));
    T.ok('theorize suppressed while direct question hangs', !K.findConvoChoice(Game, A, 'theorize'));
    T.ok('leave still available', ids.indexOf('leave') !== -1);
    Game.endConvo(A, 'natural');
  }

  // === 3. ANSWERING: outcome responds to the question ===
  T.section('3. answer engages the scare');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    startWithOpener(Game, A, '"Did you see that, just now? By the tree line."', 'small');
    const r = Game.convoTurn(A, 'react:rq_treeline:saw');
    T.ok('answer engages the question (not burdock)',
      /imagining|fire tonight/i.test(r.line) && !/Burdock|burdock/i.test(r.line));
    T.ok('reactiveQ cleared after answering', !Game.convoGet(A).reactiveQ);
    T.ok('thread stays on the scare', Game.convoGet(A).thread === 'spooked');
    T.ok('no random new question same turn (room to breathe)', !Game.convoGet(A).pendingQ);
    Game.endConvo(A, 'natural');
  }

  // === 4. "LOOK TOGETHER": the contextual show, not a plant lesson ===
  T.section('4. look together');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    startWithOpener(Game, A, '"Did you see that, just now? By the tree line."', 'small');
    const before = (Game.state.village.trust || {})[A] || 10;
    const r = Game.convoTurn(A, 'react:rq_treeline:look');
    T.ok('look-together goes to the tree line', /tree line/i.test(r.line));
    T.ok('look-together is not a plant lesson', !/Burdock|burdock|grows/i.test(r.line));
    T.ok('shared scare builds trust', ((Game.state.village.trust || {})[A] || 0) > before);
    Game.endConvo(A, 'natural');
  }

  // === 5. DODGED QUESTIONS LINGER: follow-up, then lapse — never a silent drop ===
  // One-beat turns queue the authored follow-up / lapse on heldBeats. Menu
  // ownership keeps goon off the board while reactiveQ still hangs, so the
  // first follow-up may sit queued until the second dodge lapses the question
  // (or until an answer clears it). Assert the queue + flag, then the lapse.
  T.section('5. dodge linger / lapse');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    startWithOpener(Game, A, '"Did you see that, just now? By the tree line."', 'small');
    // dodge: ask about the village instead of answering (engine path)
    Game.convoTurn(A, 'ask:village');
    const c1 = Game.convoGet(A);
    T.ok('dodged question persists', !!(c1.reactiveQ && c1.reactiveQ.id === 'rq_treeline'));
    T.ok('follow-up flagged', !!(c1.reactiveQ && c1.reactiveQ.followedUp === true));
    T.ok('NPC follow-up queued (not a silent drop)',
      heldTexts(Game, A).some(t => /tree line\. Did you see it/i.test(t)));
    T.ok('no random formal question while reactive hangs', !c1.pendingQ);
    // dodge AGAIN -> lapse queued, reactive cleared
    Game.convoTurn(A, 'ask:plans');
    const c2 = Game.convoGet(A);
    T.ok('second dodge lapses the question', !c2.reactiveQ);
    const lapseQueued = heldTexts(Game, A).some(t => /Never mind\. Probably nothing/i.test(t));
    drainGoon(Game, A);
    T.ok('lapse gets a closing line, not silence',
      lapseQueued || /Never mind\. Probably nothing/i.test(themText(Game, A)));
    Game.endConvo(A, 'natural');
  }

  // === 6. GENERIC REACTS BECOME ANSWERS when a direct question hangs ===
  T.section('6. silence answers the scare');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    startWithOpener(Game, A, '"Did you see that, just now? By the tree line."', 'small');
    const r = Game.convoTurn(A, 'silence');
    T.ok('silence reads as a response to the scare', /paler|face/i.test(r.line));
    T.ok('reactiveQ consumed by the reaction', !Game.convoGet(A).reactiveQ);
    Game.endConvo(A, 'natural');
  }

  // === 7. BRIDGE: new NPC question mid-thread doesn't hard-pivot ===
  T.section('7. topic bridge');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    startWithOpener(Game, A, '"Tell me about your goal."', 'goal');
    const c = Game.convoGet(A);
    c.depth = 2;
    const realRandom = Math.random;
    Math.random = () => 0.05; // force the question roll
    try {
      Game.convoTurn(A, 'agree');
    } finally { Math.random = realRandom; }
    drainGoon(Game, A);
    const c2 = Game.convoGet(A);
    const themLines = themText(Game, A);
    const bridged = /shaking something off|thread drop|something else entirely|Different subject/i.test(themLines);
    T.ok('topic pivot carries a bridge', bridged || !c2.pendingQ);
    Game.endConvo(A, 'natural');
  }

  // === 8. TEACH STAYS for neutral contexts (no over-suppression) ===
  T.section('8. teach gating');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    seedTeachable(Game, A);
    startWithOpener(Game, A, '"Hey."', 'small');
    T.ok('teach offered in neutral small talk', !!K.findConvoChoice(Game, A, 'teach'));
    Game.endConvo(A, 'natural');
    // ...but not on a grief opener
    const B = roster[1];
    seedTeachable(Game, B);
    startWithOpener(Game, B, '"Have you — sorry. I keep thinking about them."', 'grief');
    T.ok('teach suppressed on grief opener', !K.findConvoChoice(Game, B, 'teach'));
    Game.endConvo(B, 'natural');
  }

  // === 9. rq_personal chains into a REAL question ===
  // "Of course. Ask." queues the formal question on heldBeats; continuer
  // reveals it as pendingQ with ans: choices (one-beat turns).
  T.section('9. personal -> formal question');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    startWithOpener(Game, A, '"Can I ask you something — person to person, not village business?"', 'small');
    Game.convoTurn(A, 'react:rq_personal:yes');
    drainGoon(Game, A);
    const c = Game.convoGet(A);
    T.ok('personal yes -> formal pendingQ', !!(c.pendingQ && c.pendingQ.q));
    T.ok('formal question has answers', (c.pendingQ && c.pendingQ.answers || []).length >= 2);
    const ch = idsOf(Game.convoChoices(A));
    T.ok('choices are the formal answers now', ch.some(id => id.indexOf('ans:') === 0));
    Game.endConvo(A, 'natural');
  }

  // === 10. reactiveQ never leaks across conversations ===
  T.section('10. no reactive leak');
  {
    const roster = freshRoster(Game);
    const A = roster[0];
    startWithOpener(Game, A, '"Did you see that, just now? By the tree line."', 'small');
    T.ok('reactiveQ set', !!Game.convoGet(A).reactiveQ);
    Game.endConvo(A, 'left');
    T.ok('reactiveQ cleared on endConvo', !Game.convoGet(A).reactiveQ);
    startWithOpener(Game, A, '"Hey."', 'small');
    T.ok('reactiveQ cleared on startConvo (neutral opener)', !Game.convoGet(A).reactiveQ);
    Game.endConvo(A, 'natural');
  }

  T.done();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
