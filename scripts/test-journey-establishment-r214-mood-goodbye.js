#!/usr/bin/env node
// Proof test for the r214 neutral/friendly mood-goodbye fix
// (journey-establishment r214 2026-11-15, adoption of r213).
//
// The blank (r213 Q1, 5/10 ENGINE-CUT + 1 NO-CLOSE): the pre-registered bar
// counted the driver's "closing:" lines, but the full-transcript probe
// (scripts/probe-q1-fulltranscript-r214-20261115.js, seeds 100501-100505)
// showed the live game DOES close 4 of the 5 engine-cut sittings with
// spoken beats — the want's close line, the thread close, and the mood
// goodbye, all spoken into the transcript after the final grace beat.
// The one sitting with NO closing beat at all was seed 100505 Marta:
// farewell ("Anyway — I should get back to it. Good talking, though."),
// joke, "Snorts.", then silence.
//
// Mechanism (code reading): on an engine-ended sitting the exit line is
// null BY DESIGN (goodbye already said at winddown, r7 2026-10-12 — a
// person says goodbye once), so the sitting's only closing beats are the
// want close, the thread close, and the mood goodbye. convoMoodGoodbye
// returns a beat for warm / tense / cool bands — but null for friendly
// AND neutral. Marta's sitting was neutral-mood with no want-close and
// no thread-close, so endConvo spoke nothing after the grace beat.
//
// The fix (src/js/convo-mood.js only): friendly + neutral bands get a
// plain parting pool, so every sitting ends with a parting beat. The
// exit line stays null when the goodbye was already said — no stacked
// farewell; the mood goodbye is the separate parting beat warm/tense/
// cool sittings already get.
//
// This test proves, on a harness-loaded Game:
//   source : the plain pool exists for friendly/neutral bands and the
//            warm/cold pools are untouched.
//   live   : a neutral engine-ended sitting (winddown already spoken, no
//            want, no hanging thread) gains exactly one closing beat,
//            drawn from the plain pool; a friendly sitting likewise; a
//            warm sitting still gains its warm goodbye (control); the
//            exit line stays null when the goodbye was already said
//            (no double goodbye); a graceful neutral sitting still gets
//            its exit line plus the plain parting (consistent with warm).
// Usage: node scripts/test-journey-establishment-r214-mood-goodbye.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');
const MOOD_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'convo-mood.js'), 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- source: the plain pool exists, warm/cold pools untouched ---
check('A plain-pool-for-friendly-neutral', /band === 'friendly' \|\| band === 'neutral'/.test(MOOD_SRC) &&
  /mbye:plain/.test(MOOD_SRC) && /See you around/.test(MOOD_SRC) && /Take care out there/.test(MOOD_SRC));
check('B warm-pool-untouched', /band === 'warm'/.test(MOOD_SRC) && /mbye:warm/.test(MOOD_SRC) &&
  /Come back anytime/.test(MOOD_SRC) && /This was good/.test(MOOD_SRC));
check('C cold-pool-untouched', /band === 'tense' \|\| band === 'cool'/.test(MOOD_SRC) && /mbye:cold/.test(MOOD_SRC) &&
  /already turning away/.test(MOOD_SRC));

const PLAIN = ['"See you around."', '"Take care out there."', '"Same time tomorrow, maybe."'];
const WARM = ['They\'re smiling as you go. "Come back anytime."', '"This was good." They mean it.'];

function lastThemText(Game, vid) {
  const c = Game.convoGet(vid) || {};
  const t = c.transcript || [];
  for (let i = t.length - 1; i >= 0; i--) if (t[i] && t[i].who === 'them') return t[i].text;
  return null;
}
function themCount(Game, vid) {
  const c = Game.convoGet(vid) || {};
  return (c.transcript || []).filter(e => e && e.who === 'them').length;
}

(async () => {
  const { Game } = await loadGame({ seed: 5001, mode: 'mvc', fullTelemetry: false });
  try { await setupGame(Game); } catch (e) {
    check('D live-game-loads', false, 'loadGame/setupGame: ' + (e && e.message));
    finish(); return;
  }
  check('D live-game-loads', !!Game && typeof Game.startConvo === 'function' && typeof Game.endConvo === 'function' && typeof Game.convoMoodGoodbye === 'function');

  // Engine-ended shape: start a sitting, then mark the winddown goodbye as
  // already spoken and clear the want, so the only possible closing beats
  // are the thread close and the mood goodbye. Fresh sittings have no
  // hanging thread, so the mood goodbye is the only beat left.
  function engineEndSetup(vid, mood) {
    const r = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.mood = mood;
    c.windingDown = true; // goodbye already said (winddown beat spoken)
    c.want = null; // no want close line
    c.exchanges = Math.max(c.exchanges || 0, 3);
    c.substantive = true;
    return { r, before: themCount(Game, vid) };
  }
  const living = ((Game.state.village || {}).roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
  const vid = living[0];
  if (!vid) { check('E villager-found', false, 'no living non-player villager'); finish(); return; }
  check('E villager-found', true);

  // (F) Neutral engine-ended sitting gains a plain parting beat.
  try {
    const s = engineEndSetup(vid, 0);
    const end = Game.endConvo(vid, 'natural');
    const after = themCount(Game, vid);
    const last = lastThemText(Game, vid);
    check('F neutral-engine-end-gains-plain-parting', after > s.before && PLAIN.indexOf(last) !== -1,
      `them ${s.before}->${after}, last=${JSON.stringify(last)} (want one of ${PLAIN.join(' / ')})`);
    check('F2 neutral-exit-line-stays-null', end && end.line === null,
      `end.line=${JSON.stringify(end && end.line)} (want null — goodbye already said, no stacked farewell)`);
  } catch (e) { check('F neutral-engine-end-gains-plain-parting', false, 'threw: ' + (e && e.message)); }

  // (G) Friendly engine-ended sitting gains a plain parting beat.
  try {
    const s = engineEndSetup(vid, 1);
    Game.endConvo(vid, 'natural');
    const after = themCount(Game, vid);
    const last = lastThemText(Game, vid);
    check('G friendly-engine-end-gains-plain-parting', after > s.before && PLAIN.indexOf(last) !== -1,
      `them ${s.before}->${after}, last=${JSON.stringify(last)}`);
  } catch (e) { check('G friendly-engine-end-gains-plain-parting', false, 'threw: ' + (e && e.message)); }

  // (H) Warm engine-ended sitting still gains its warm goodbye (control).
  try {
    const s = engineEndSetup(vid, 2);
    Game.endConvo(vid, 'natural');
    const after = themCount(Game, vid);
    const last = lastThemText(Game, vid);
    check('H warm-engine-end-keeps-warm-goodbye', after > s.before && WARM.indexOf(last) !== -1,
      `them ${s.before}->${after}, last=${JSON.stringify(last)}`);
  } catch (e) { check('H warm-engine-end-keeps-warm-goodbye', false, 'threw: ' + (e && e.message)); }

  // (I) Graceful neutral sitting still gets its exit line plus the plain
  // parting — consistent with warm (exit + warm goodbye).
  try {
    const r = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.mood = 0;
    c.exchanges = Math.max(c.exchanges || 0, 3);
    c.substantive = true;
    const before = themCount(Game, vid);
    const end = Game.endConvo(vid, 'done');
    const after = themCount(Game, vid);
    const last = lastThemText(Game, vid);
    check('I graceful-neutral-exit-plus-plain-parting', end && typeof end.line === 'string' && end.line.length > 0 &&
      after >= before + 2 && PLAIN.indexOf(last) !== -1,
      `exit=${JSON.stringify(end && end.line)}, them ${before}->${after}, last=${JSON.stringify(last)}`);
  } catch (e) { check('I graceful-neutral-exit-plus-plain-parting', false, 'threw: ' + (e && e.message)); }

  finish();
  function finish() {
    console.log(`\nmood-goodbye r214: ${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
  }
})();
