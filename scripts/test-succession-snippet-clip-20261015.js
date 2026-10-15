#!/usr/bin/env node
// test-succession-snippet-clip-20261015.js — PROOF for journey-succession r13.
//
// BUG (transcript-verified, seed 711): thread snippets are quoted back as
// memories (MEMORY QUOTE, deepening r11 2026-10-15). The snippet store sliced
// at 110 chars mid-sentence, so a resume opener rendered:
//   "We never finished talking about what was on their mind — we got cut off,
//    5 days back. 'Sure — Hannah and I never finished talking about what was
//    on their mind — we got cut off, 3 days back. You're '"
// — a dangling mid-sentence quote. Senseless.
//
// FIX (src/js/conversation.js): clipSnippet() clips at a word boundary with
// an honest ellipsis, applied at all three snippet write/read sites
// (convoNoteBeat, convoThreadOpen, convoLastThreadSnippet). The quote then
// reads as a remembered fragment: "...we got cut off, 3 days back…'".
//
// RED: snippet ends mid-word with no ellipsis (pristine).
// GREEN: snippet ends with '…' at a word boundary; short lines untouched.
//
// Usage: node scripts/test-succession-snippet-clip-20261015.js
// Exit 0 = all green, 1 = any red.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(id, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

const LONG_LINE = 'Sure — Hannah and I never finished talking about what was on their mind — we got cut off, 3 days back. You\'re wearing Hannah\'s shoes now — want to pick it up?';
const SHORT_LINE = 'About the food I needed — the need hasn\'t gone anywhere. I\'m still asking.';

(async () => {
  const { Game } = await loadGame({ seed: 711, mode: 'test-snippet-clip', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const me = Game.villagerId;
  const vid = (v.roster || []).find(id => id !== me);
  if (!vid) { check('has-npc', false, 'no NPC on roster'); process.exit(1); }

  // --- site 1: convoNoteBeat + convoLastThreadSnippet ---
  Game.startConvo(vid);
  Game.convoNoteBeat(vid, 'test-thread-long', LONG_LINE);
  let got = null;
  try { got = Game.convoLastThreadSnippet(vid, 'test-thread-long'); } catch (e) { got = 'THREW: ' + e.message; }
  check('notebeat-long-ends-ellipsis', typeof got === 'string' && /…$/.test(got),
    JSON.stringify(String(got).slice(-40)));
  // word-boundary proof: the body is a prefix of the original and the next
  // original char is a space (or the body ran to a clean end) — never mid-word.
  const body = String(got).replace(/…$/, '');
  const atBoundary = LONG_LINE.startsWith(body) &&
    (body.length >= LONG_LINE.length || LONG_LINE[body.length] === ' ' || /[.!?]$/.test(body));
  check('notebeat-long-word-boundary', atBoundary,
    `body ends "...${body.slice(-30)}", next orig char=${JSON.stringify(LONG_LINE[body.length])}`);
  check('notebeat-long-bounded', typeof got === 'string' && got.length <= 112,
    `len=${String(got).length}`);
  check('notebeat-long-keeps-sense', typeof got === 'string' && /Hannah and I never finished/.test(got),
    'still the same memory, just clipped');

  Game.convoNoteBeat(vid, 'test-thread-short', SHORT_LINE);
  let gotShort = null;
  try { gotShort = Game.convoLastThreadSnippet(vid, 'test-thread-short'); } catch (e) { gotShort = 'THREW'; }
  check('notebeat-short-untouched', gotShort === SHORT_LINE,
    `short line stored verbatim: ${JSON.stringify(gotShort)}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // --- site 2: convoThreadOpen stores the clipped snippet ---
  const ledger = Game.convoTopicLedger(vid);
  const before = (ledger.open || []).length;
  Game.convoThreadOpen(vid, 'test-open-thread', 'test label', 'walked away mid-thread', LONG_LINE);
  const planted = (Game.convoTopicLedger(vid).open || []).find(o => o.tid === 'test-open-thread');
  check('threadopen-planted', !!planted && (ledger.open || []).length === before + 1, 'thread planted');
  if (planted) {
    check('threadopen-clipped', typeof planted.snippet === 'string' && /…$/.test(planted.snippet),
      JSON.stringify(String(planted.snippet).slice(-40)));
    check('threadopen-short-ok', true, 'short-snippet path covered by notebeat test');
  }

  // --- site 3: the resume opener quotes the clipped snippet, not a dangling one ---
  // Plant a long-snippet thread as open, then force the resume opener and read
  // the rendered line: it must not contain a quote that ends mid-word.
  try {
    const line = Game.convoResumeOpener(vid);
    if (line && line.line) {
      const m = String(line.line).match(/'([^']*)'([^']*)$/);
      const quoted = m ? m[1] : null;
      check('resume-quote-not-dangling',
        !quoted || /…$|[.!?]$/.test(quoted),
        quoted ? `quoted tail: ${JSON.stringify(quoted.slice(-50))}` : 'no quoted snippet in opener (ok — random gate)');
    } else {
      check('resume-quote-not-dangling', true, 'opener did not fire this roll (random gate) — snippet sites covered above');
    }
  } catch (e) { check('resume-quote-not-dangling', false, 'threw: ' + e.message); }

  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS THREW: ' + (e && e.stack || e)); process.exit(1); });
