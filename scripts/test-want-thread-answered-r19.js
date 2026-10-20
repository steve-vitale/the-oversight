// test-want-thread-answered-r19.js — ESTABLISHMENT r19: THE AMNESIA RESUME.
//
// Wild-probe transcripts (r19, 6 seeds x 42d, competent) caught a mild
// incoherence in want-thread resumes (seed 103 Erin, seed 61 Wilhelm):
//
//   OPENING: "Where are you from — originally? Before all this."
//   YOU: "I'm from Columbus, Ohio."
//   THEM: "Columbus, Ohio. I'll remember that. Everybody's from somewhere
//          that isn't here."
//   YOU: [alive:event:tension] "It's tense around the fire lately."   <- subject change
//   ...
//   YOU: [alive:thread:want] "We never finished — where you're from."
//   THEM: "Huh. I wouldn't have guessed that about you."              <- amnesia
//
// Root cause: the open-'want'-thread PLANT fires after the want's hanging
// question was already answered and acknowledged. Two sites:
//   (1) convoNoteBeat's subject-change plant — moving off the 'want' thread
//       mid-conversation plants it as "unfinished business" even when the
//       want's question-exchange is complete.
//   (2) convoPlantOpenThread (endConvo) — same class: plants 'want' as
//       unfinished when the question was answered but other things hang.
//
// In both cases the next sitting offers "We never finished — <question>" and
// convoThreadBeat re-serves the generic first-reveal engageBeat as if the
// reveal just happened. The want ARC itself persists via convoResolveWant
// seeds, not these plants.
//
// RED: plant fires after the question was answered (open 'want' thread with
//   the question's label exists).
// GREEN: no plant when the want's question was answered this conversation.
//   Controls: unanswered and honest_pass/declined questions still plant
//   (genuinely unfinished); other tids unaffected.
//
// Run: node scripts/test-want-thread-answered-r19.js (SEED env optional)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '103', 10);
let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

const WANT_BEAT = '"Columbus, Ohio. I will remember that for you."'; // real beat (>=4 words)
const OTHER_BEAT = '"Everyone is choosing sides and pretending they are not choosing sides."';

function openWantThreads(Game, vid) {
  return Game.convoOpenThreads(vid).filter(o => o && o.tid === 'want');
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-want-thread' });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId && id !== 'player');
  assert(roster.length >= 1, 'need 1+ non-scholar villagers');
  const vid = roster[0];

  const cgs = (Game.data.characterGen || {}).convo || {};
  const qs = (cgs.questions || []).filter(q => q && q.id && q.answers && q.answers.length >= 1 && q.answers[0].id);
  assert(qs.length >= 1, 'need 1+ answerable bespoke questions, found ' + qs.length);
  const q = qs[0];
  const lab = String(Game.convoQuestionTopic(q.id));

  // ---- A: question ANSWERED -> subject-change plant must NOT fire ----
  {
    const r = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.want = { id: 'curious', qid: q.id, stage: 1 };
    c.answered = {}; c.answered[q.id] = q.answers[0].id; // answered this convo
    Game.convoNoteBeat(vid, 'want', WANT_BEAT);
    Game.convoNoteBeat(vid, 'lately', OTHER_BEAT);
    const open = openWantThreads(Game, vid);
    ok('answered question: no want-thread plant on subject change',
      open.length === 0, 'planted: ' + JSON.stringify(open.map(o => o.label)));
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }

  // ---- B (control): question UNANSWERED -> plant fires (genuinely unfinished) ----
  {
    const r = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.want = { id: 'curious', qid: q.id, stage: 1 };
    c.answered = {};
    Game.convoNoteBeat(vid, 'want', WANT_BEAT);
    Game.convoNoteBeat(vid, 'lately', OTHER_BEAT);
    const open = openWantThreads(Game, vid);
    ok('unanswered question: want-thread plant fires (B control)', open.length === 1,
      'open count: ' + open.length);
    ok('planted thread names the question', open.length === 1 && open[0].label === lab,
      'label: ' + (open[0] && open[0].label) + ' vs ' + lab);
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }

  // ---- C (control): honest_pass -> plant fires (genuinely unresolved) ----
  {
    const r = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.want = { id: 'curious', qid: q.id, stage: 1 };
    c.answered = {}; c.answered[q.id] = 'honest_pass';
    Game.convoNoteBeat(vid, 'want', WANT_BEAT);
    Game.convoNoteBeat(vid, 'lately', OTHER_BEAT);
    const open = openWantThreads(Game, vid);
    ok('declined question: want-thread plant fires (C control)', open.length === 1,
      'open count: ' + open.length);
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }

  // ---- D: endConvo plant — answered question must NOT plant ----
  {
    const r = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.want = { id: 'curious', qid: q.id, stage: 1 };
    c.answered = {}; c.answered[q.id] = q.answers[0].id;
    c.thread = 'want'; c.depth = 1; c.exchanges = 1;
    c.heldBeats = [{ text: '"A follow-up thought that goes unspoken." ' }]; // unresolved => plant path
    Game.convoNoteBeat(vid, 'want', WANT_BEAT); // populate threadLog snippet for the plant
    try { Game.endConvo(vid, 'done'); } catch (e) { console.log('  (endConvo threw: ' + e.message + ')'); }
    const open = openWantThreads(Game, vid);
    ok('answered question: no want-thread plant at endConvo', open.length === 0,
      'planted: ' + JSON.stringify(open.map(o => o.label)));
  }

  // ---- E (control): endConvo plant — unanswered question still plants ----
  {
    const r = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.want = { id: 'curious', qid: q.id, stage: 1 };
    c.answered = {};
    c.thread = 'want'; c.depth = 1; c.exchanges = 1;
    c.heldBeats = [{ text: '"A follow-up thought that goes unspoken." ' }];
    Game.convoNoteBeat(vid, 'want', WANT_BEAT); // populate threadLog snippet for the plant
    try { Game.endConvo(vid, 'done'); } catch (e) { console.log('  (endConvo threw: ' + e.message + ')'); }
    const open = openWantThreads(Game, vid);
    ok('unanswered question: want-thread plants at endConvo (E control)', open.length === 1,
      'open count: ' + open.length);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
