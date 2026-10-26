#!/usr/bin/env node
// say-capture.js — sim-harness say-capture instrument (sim-saystub-b,
// 2026-10-25, oversight-flesh-out-loop-b, arm sim-saystub-b).
//
// PROBLEM (proven by scripts/test-saystub-b.js T2, not assumed):
// scripts/sim-harness.js loadGame replaces Game.say with a no-op
// whenever opts.narration is falsy, and sim sweeps call loadGame
// without narration. Cook-duty lines are emitted via this.say()
// (src/js/game.js cook duty) -> G.say (src/js/encounters.js, which
// delegates to this.emit) — so with the no-op in place the line
// never reaches Game.emit at all, and an emit wrapper (the
// preserveact sweep's approach) can never capture it, no matter
// how good its matcher is. saySamples = 0 in the preserveact
// traces is a harness-design limit, not a matcher bug and not
// evidence that cooks never speak.
//
// FIX (instrument only, zero game changes, zero default flips):
// wrap Game.say AFTER loadGame — the same post-load wrap pattern
// the probe-killattr-say-20261020 probe already uses — and record
// matching lines into a caller-owned array. This file does NOT
// edit sim-harness.js and does NOT touch any src/js file. When
// the capture is not installed, runs are byte-identical to
// stock-harness runs by construction (nothing is installed).
//
// NEUTRALITY MECHANISM: the wrapper writes ONLY to the caller's
// array; it never touches Game.state, Game.log, RNG, or any game
// field; it delegates to the original say with the same arguments,
// `this`, and return value; its counting block is try/catch
// isolated so a counting failure can never change game behavior.
// The original say in sims is the harness no-op, so delegating to
// it preserves the exact stock behavior (lines dropped from the
// log) while the array keeps a copy for sense-testing.
'use strict';

// The preserveact matcher, reused verbatim so this run tests the
// stub hypothesis and NOT a new matcher.
const COOK_SAY_FILTER = /smoke racks|cooked for the haven|racks are already full/i;
const WORKED_RE = /worked the smoke racks too/i;
const RACKS_FULL_RE = /racks are already full/i;

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; }
  catch (e) { return 0; }
}

// installSayCapture(Game, opts) -> { samples, uninstall }
// opts: { filter (default COOK_SAY_FILTER), cap (default 200) }.
// Throws loudly if Game.say is not a function or is already a
// capture wrapper (double-wrapping would double-count lines).
function installSayCapture(Game, opts) {
  opts = opts || {};
  const filter = opts.filter || COOK_SAY_FILTER;
  const cap = (opts.cap != null) ? opts.cap : 200;
  const orig = Game.say;
  if (typeof orig !== 'function') throw new Error('say-capture: Game.say is not a function');
  if (orig.__sayCaptureInstalled) throw new Error('say-capture: Game.say is already capture-wrapped');
  const samples = [];
  const wrapped = function () {
    let text = '';
    try { text = Array.prototype.slice.call(arguments).map(String).join(' '); }
    catch (e) { text = ''; }
    try {
      if (text && filter.test(text) && samples.length < cap)
        samples.push({ day: dayOf(Game), text: text.slice(0, 240) });
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  wrapped.__sayCaptureInstalled = true;
  wrapped.__sayCaptureSamples = samples;
  Game.say = wrapped;
  return {
    samples,
    uninstall() { if (Game.say === wrapped) Game.say = orig; },
  };
}

function isWorkedLine(s) { return WORKED_RE.test((s && s.text) || ''); }
function isRacksFullLine(s) { return RACKS_FULL_RE.test((s && s.text) || ''); }

module.exports = { COOK_SAY_FILTER, WORKED_RE, RACKS_FULL_RE, dayOf, installSayCapture, isWorkedLine, isRacksFullLine };
