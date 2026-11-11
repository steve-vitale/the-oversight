// test-journey-crisis-r180-voiceline-stacking.js — proof test for the r180
// VOICELINE PREFIX STACKING fix (Q3, graduated by the r180 panel).
//
// DEFECT (r180 panel, 7 sightings across 5 seeds): an NPC turn opens with
// TWO discourse/hedge chunks stacked before the body — a thinking-aloud
// ack plus a "it's different now" change line, or a voice opener plus a
// recap reframe prefix:
//   ask:lately — '"Good question." "You asked me that before. It\'s a
//     different question now." "I dreamed Darius was still here..."'
//     (14401-d34 Hank); '"Huh. Let me think about that." "Last time
//     things were different. They always are." "Sweet Tooth..."'
//     (14404-d24 Deborah); '"You want to know about that? Okay."
//     "Last time things were different..." "Since Shalini died..."'
//     (14405-d35 Camila)
//   recap — '"You know — Like I said — we\'re still on that personal
//     stuff."' (14402-d21 Raj); '"Oh! Oh — As I said — we\'re still on
//     that personal stuff."' (14403-d29 Gunther); '"Why do you ask?
//     Like I said — we\'re still on that personal stuff."' (14403-d30
//     Gunther)
// Single-prefix turns ("As I said — ..." alone, "Like I said — ..."
// alone) are NOT the defect — one discourse chunk is voice; two is
// a stutter. The r155 fix already caught one instance of this class
// (the "Still on X." body + "As/Like I said —" prefix doubling); this
// is the remaining two assembly paths.
//
// ROOT CAUSE — two stacking assembly paths, one class:
//   (A) ask path: topic2Ask (convoTopics.js) prepends a t2changeLine
//       ("You asked me that before..." / "Last time things were
//       different...") when the topic clock moved since the last ask;
//       the generic emission (conversation.js) then runs
//       convoComposeBeat (convo-wants.js), which prepends a topic ack
//       ("Good question." / "Huh. Let me think about that." / "You
//       want to know about that? Okay.") in front of it. Ack +
//       change + body. The change line already acknowledges the
//       player — the ack is redundant.
//   (B) recap path: convoRecapLine builds a reframe line that already
//       carries its own discourse prefix ("As I said —" / "Like I
//       said —" / "I've told you three times now —" / "We're going
//       in circles a bit —" / "<topic> — that's still where we
//       are."), then applies voiceLine on return — and voiceLine
//       prepends an opener ("You know —", "Oh! ", "Why do you
//       ask? ") on top of it. Opener + reframe prefix + body.
//
// FIX (src/js/convo-wants.js, convoComposeBeat): when the raw beat
// already opens with an ack/change line (convoAckLines — which lists
// all three change lines and all three topic acks), skip the topic
// ack and return the beat unchanged. (src/js/conversation.js,
// convoRecapLine): when the line was reframed (the _recapSaid branch
// fired), return it without the voiceLine pass — the reframe is a
// complete discourse unit; a first recap still gets its voiceLine
// opener as before.
//
// Run: node scripts/test-journey-crisis-r180-voiceline-stacking.js [seed]
//   (exit 0 = PASS; default seed 14411)
// RED on unfixed code (Part A: the re-ask compose prepends a topic
// ack; Part B: a reframe serve gains a voice opener); GREEN after.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

const seed = parseInt(process.argv[2] || '14411', 10);

// The three t2changeLine variants (convoTopics.js t2changeLine) — also
// members of convoAckLines (conversation.js).
const CHANGE = [
  "You asked me that before. It's a different question now.",
  'Last time things were different. They always are.',
  'Huh. I answered that once — back when the answer was simpler.',
];
// The three topic acks convoComposeBeat prepends (convo-wants.js).
const TOPIC_ACKS = [
  'Good question.',
  'Huh. Let me think about that.',
  'You want to know about that? Okay.',
];
// The four fixed recap-reframe prefixes (conversation.js convoRecapLine).
const REFRAME_PREFIXES = [
  'As I said — ',
  'Like I said — ',
  "I've told you three times now — ",
  "We're going in circles a bit — ",
];

function firstChunk(Game, line) {
  try { return Game.convoSplitBeats(line)[0].trim(); } catch (e) { return String(line); }
}
function stripQuotes(s) {
  return String(s || '').replace(/^"|"$/g, '');
}
// True when the line opens with one of the change lines (checked as a
// prefix on the raw string — convoSplitBeats does not split a
// multi-chunk line, so the first "chunk" is the whole line).
function startsWithChange(Game, line) {
  const t = String(line || '').trim();
  return CHANGE.some(ch => t.indexOf('"' + ch + '"') === 0);
}
// True when the line's first chunk contains a topic ack (a voice opener
// inside the chunk, e.g. "You know — Good question.", still counts).
function firstChunkHasAck(Game, line) {
  const c = firstChunk(Game, line);
  return TOPIC_ACKS.some(a => c.indexOf(a) !== -1);
}
// True when a served recap line is a clean reframe: it starts with one
// of the fixed reframe prefixes, or with the topic form ("<topic> —
// that's still where we are." / "<raw inner> That's still where we
// are."). A voice opener stacked in front fails every arm.
function isCleanReframe(serve, rawInner, topic) {
  const s = String(serve || '');
  if (REFRAME_PREFIXES.some(p => s.indexOf('"' + p) === 0)) return true;
  if (topic && s.indexOf('"' + topic + " — that's still where we are.") === 0) return true;
  if (rawInner && s.indexOf('"' + rawInner + " That's still where we are.") === 0) return true;
  return false;
}

(async () => {
  const { Game } = await loadGame({ seed, mode: 'test-r180-voiceline-stacking', fullTelemetry: false, narration: false });
  await setupGame(Game);
  Game.progState().tableWaiting = true;
  const village = Game.state.village || {};
  const roster = (village.roster || []).filter(v => v !== Game.villagerId);
  check('setup: roster has villagers', roster.length >= 2, 'roster=' + roster.length);
  try { for (const v of roster) ((Game.state.village || {}).trust || {})[v] = 90; } catch (e) {}
  const vid = roster[0];

  // ---------- PART A: ask path — re-ask after the clock moves ----------
  Game.startConvo(vid);
  const line1 = String(Game.topic2Ask(vid, 'lately') || '');
  console.log('ask1(first): ' + line1.slice(0, 140));
  check('ask: first lately ask carries NO change line', !startsWithChange(Game, line1), 'line1=' + line1.slice(0, 100));
  // Move the topic clock: t2clock includes the scholar day.
  Game.state.scholar.day = (Game.state.scholar.day || 0) + 1;
  const line2 = String(Game.topic2Ask(vid, 'lately') || '');
  console.log('ask2(re-ask): ' + line2.slice(0, 160));
  check('ask: re-ask after the clock moves DOES open with a change line', startsWithChange(Game, line2), 'line2=' + line2.slice(0, 100));
  const said = Game.convoPlayerSaid(vid, 'ask:lately');
  const composed2 = String(Game.convoComposeBeat(vid, line2, said) || '');
  console.log('ask2(composed): ' + composed2.slice(0, 180));
  check('ask: compose adds NO topic ack to a beat that already opens with a change line', composed2 === line2, 'composed2=' + composed2.slice(0, 120));
  check('ask: composed re-ask still opens with the change line (nothing lost)', startsWithChange(Game, composed2), 'composed2=' + composed2.slice(0, 100));
  const composed1 = String(Game.convoComposeBeat(vid, line1, said) || '');
  console.log('ask1(composed): ' + composed1.slice(0, 160));
  check('ask: CONTROL — compose still acks a first ask (no change line to stand in)', composed1 !== line1 && firstChunkHasAck(Game, composed1), 'composed1=' + composed1.slice(0, 120));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---------- PART B: recap path — reframe serves must not gain an opener ----------
  // Same staging as the r155 test: fixed thread logs, direct
  // convoRecapLine calls (the turn tail appends a thread-log entry on
  // every press, so the reframe path cannot be reached through
  // convoTurn). Several sittings across villagers for many draws —
  // voiceLine fires probabilistically, so the unfixed code must be
  // caught by volume, not by one serve.
  const sittings = [
    { name: 'still-on', log: [{ thread: 'goal', snippet: 'wants', ex: 0 }, { thread: 'goal', snippet: 'wants more', ex: 0 }] },
    { name: 'two-thread', log: [{ thread: 'goal', snippet: 'wants', ex: 0 }, { thread: 'past', snippet: 'old life', ex: 0 }] },
    { name: 'single-log', log: [{ thread: 'goal', snippet: 'wants', ex: 0 }] },
  ];
  let reframeServes = 0;
  let stackedServes = [];
  const vids = roster.slice(0, 5);
  for (let si = 0; si < sittings.length; si++) {
    for (let vi = 0; vi < vids.length; vi++) {
      const v = vids[vi];
      const st = sittings[si];
      Game.startConvo(v);
      const c = Game.convoGet(v);
      c.budget = 99;
      c.threadLog = JSON.parse(JSON.stringify(st.log));
      const served = [];
      for (let i = 0; i < 5; i++) {
        if (c.spent && c.spent.recap) break;
        served.push(String(Game.convoRecapLine(v) || ''));
      }
      try { Game.endConvo(v, 'left'); } catch (e) {}
      if (served.length < 2) continue;
      // Extract the raw body from the first serve (it may itself carry
      // a voice opener or a trailing closer — the patterns find the
      // first sentence regardless, non-greedy so a closer's extra
      // period can't leak into the extraction).
      const first = served[0];
      const stillM = /Still on ([^.]+)\./.exec(first);
      const topic = stillM ? stillM[1] : null;
      let rawInner = null;
      const twoM = /We started on (.+?), then got onto ([^.]+)\./.exec(first);
      const oneM = /We were talking about ([^.]+)\./.exec(first);
      if (stillM) rawInner = 'Still on ' + stillM[1] + '.';
      else if (twoM) rawInner = 'We started on ' + twoM[1] + ', then got onto ' + twoM[2] + '.';
      else if (oneM) rawInner = 'We were talking about ' + oneM[1] + '.';
      // The reframe serves are indexes 1..end (index 0 is the raw line).
      for (let i = 1; i < served.length; i++) {
        reframeServes++;
        if (!isCleanReframe(served[i], rawInner, topic)) {
          stackedServes.push(st.name + '#' + vi + '[' + i + ']=' + served[i]);
        }
      }
      if (si === 0 && vi === 0) console.log('recap sitting still-on#0: served=' + JSON.stringify(served));
    }
  }
  console.log('recap: reframe serves checked=' + reframeServes + ' stacked=' + stackedServes.length);
  check('recap: every reframe serve starts clean (no voice opener stacked on the reframe prefix)', stackedServes.length === 0, 'stacked=' + JSON.stringify(stackedServes.slice(0, 3)));
  check('recap: enough reframe serves were actually checked (volume for the probabilistic path)', reframeServes >= 10, 'reframeServes=' + reframeServes);

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('test crashed: ' + (e && e.stack || e)); process.exit(2); });
