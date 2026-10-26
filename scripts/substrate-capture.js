#!/usr/bin/env node
// substrate-capture.js — racks-bound-day substrate recorder (DIAG only).
//
// sim-substrate-b, 2026-10-26, oversight-flesh-out-loop-b. Wraps Game.say
// AFTER loadGame (plainvoice post-load pattern). Say-only: NO engine
// function is wrapped. Delegates to the original say with identical
// arguments, `this`, and return value. Writes ONLY to the caller's
// arrays; every snapshot query is try/catch isolated and read-only.
// Person lookup goes through the reused plainvoice recompute, which
// reads Game.data.villagers directly and never calls Game.getPerson.
//
// Captured, in arrival order:
//  - cook lines (plainvoice frame regex): frame + emit-time recompute
//    (reused plainvoice-capture.recomputeContext, unchanged) + pantry
//    snapshot (pantryKcal, freshDays via pantryFreshDays(), throttle
//    via prodThrottleEngaged(), each nullable on throw).
//  - duty forage returns: "🌿 {first} returns with foraged food: +{kcal}"
//  - throttle redirects: "… leaves the {forage|harvest|fish nets} standing
//    and turns to the {alt} instead."
//  - throttle exemptions: "🍽️ … hungry eat first: keeps working the {from}"
//  - fitness rests: "{name} is in no shape for the treeline"
'use strict';

const { COOK_FRAME_RE, WORKED_RE, RACKS_FULL_RE, branchDay, recomputeContext } = require('./plainvoice-capture');

const FORAGE_RETURN_RE = /^🌿 (\S+) returns with foraged food: \+(\d+) kcal to the pantry\./;
const REDIRECT_RE = /checks the pantry before heading out — the shelves are full, ~(\d+) days of fresh on hand… leaves the (forage|harvest|fish nets) standing and turns to the (\S+(?: \S+)?) instead\./;
const EXEMPT_RE = /checks the pantry before heading out — ~(\d+) days of fresh on hand, but someone has gone hungry three days running\. The hungry eat first: keeps working the (forage|harvest|fish nets) instead/;
const REST_RE = /^(\S+(?: \S+)?) is in no shape for the treeline/;

function pantrySnapshot(Game) {
  const snap = { pantryKcal: null, freshDays: null, throttleEngaged: null };
  try {
    const pantry = ((Game.state || {}).village || {}).pantry || [];
    let t = 0;
    for (const it of pantry) if (it) t += (it.kcalEach || 0) * (it.units || 1);
    snap.pantryKcal = t;
  } catch (e) { snap.pantryKcal = null; }
  try { snap.freshDays = (typeof Game.pantryFreshDays === 'function') ? Game.pantryFreshDays() : null; }
  catch (e) { snap.freshDays = null; }
  try { snap.throttleEngaged = (typeof Game.prodThrottleEngaged === 'function') ? !!Game.prodThrottleEngaged() : null; }
  catch (e) { snap.throttleEngaged = null; }
  return snap;
}

function installSubstrateCapture(Game, opts) {
  opts = opts || {};
  const cookCap = (opts.cookCap != null) ? opts.cookCap : 1000;
  const eventCap = (opts.eventCap != null) ? opts.eventCap : 3000;
  const orig = Game.say;
  if (typeof orig !== 'function') throw new Error('substrate-capture: Game.say is not a function');
  if (orig.__substrateInstalled) throw new Error('substrate-capture: Game.say is already substrate-wrapped');
  const cookLines = [];
  const events = [];
  const counters = { cookSeen: 0, eventSeen: 0, seq: 0 };
  const ordinal = new Map();
  const wrapped = function () {
    let text = '';
    try { text = Array.prototype.slice.call(arguments).map(String).join(' '); }
    catch (e) { text = ''; }
    try {
      const day = branchDay(Game);
      const cm = text && COOK_FRAME_RE.exec(text);
      if (cm) counters.cookSeen++;
      if (cm && cookLines.length < cookCap) {
        const cook = cm[1];
        const key = cook + '|' + day;
        const resIndex = (ordinal.get(key) || 0) + 1;
        ordinal.set(key, resIndex);
        let frame = 'plain';
        if (WORKED_RE.test(text)) frame = 'worked';
        else if (RACKS_FULL_RE.test(text)) frame = 'racksFull';
        const ctx = recomputeContext(Game, cook);
        const snap = pantrySnapshot(Game);
        cookLines.push({
          seq: ++counters.seq,
          day, cook, frame, resIndex, text: text.slice(0, 240),
          racksFull: ctx ? !!ctx.racksFull : null,
          eligiblePresent: ctx ? !!ctx.eligiblePresent : null,
          eligibleCount: ctx ? (ctx.eligibleCount != null ? ctx.eligibleCount : null) : null,
          eligibleKcal: ctx ? (ctx.eligibleKcal != null ? ctx.eligibleKcal : null) : null,
          preservedKcal: ctx ? (ctx.preservedKcal != null ? ctx.preservedKcal : null) : null,
          rackCap: ctx ? (ctx.rackCap != null ? ctx.rackCap : null) : null,
          voiceSpokenToday: ctx ? !!ctx.voiceSpokenToday : null,
          ctxOk: !!(ctx && ctx.ok),
          pantryKcal: snap.pantryKcal, freshDays: snap.freshDays,
          throttleEngaged: snap.throttleEngaged,
        });
      } else if (text) {
        const fm = FORAGE_RETURN_RE.exec(text);
        const rm = !fm && REDIRECT_RE.exec(text);
        const em = !fm && !rm && EXEMPT_RE.exec(text);
        const sm = !fm && !rm && !em && REST_RE.exec(text);
        if (fm || rm || em || sm) counters.eventSeen++;
        if (events.length < eventCap) {
          if (fm) events.push({ seq: ++counters.seq, day, kind: 'forageReturn', name: fm[1], kcal: parseInt(fm[2], 10), text: text.slice(0, 240) });
          else if (rm) events.push({ seq: ++counters.seq, day, kind: 'throttleRedirect', name: null, fromTask: rm[2], altTask: rm[3], freshDaysQuoted: parseInt(rm[1], 10), text: text.slice(0, 280) });
          else if (em) events.push({ seq: ++counters.seq, day, kind: 'throttleExempt', name: null, fromTask: em[2], freshDaysQuoted: parseInt(em[1], 10), text: text.slice(0, 280) });
          else if (sm) events.push({ seq: ++counters.seq, day, kind: 'fitnessRest', name: sm[1], text: text.slice(0, 200) });
        }
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  wrapped.__substrateInstalled = true;
  Game.say = wrapped;
  // NOTE: redirect/exempt lines do not carry a leading first-name token in
  // the regex (the name is embedded mid-line: "🌿 {first} checks…" /
  // "🍽️ {first} checks…"). Extract it from the stored text in the
  // post-pass below, so the recorder never guesses during the run.
  return {
    cookLines, events, counters,
    cookTruncated: () => counters.cookSeen > cookCap,
    eventTruncated: () => counters.eventSeen > eventCap,
    uninstall() { if (Game.say === wrapped) Game.say = orig; },
  };
}

// Post-pass: fill names on redirect/exempt events from their stored text.
// "🌿 {first} checks the pantry…" / "🍽️ {first} checks the pantry…".
function fillEventNames(events) {
  for (const ev of events) {
    if ((ev.kind === 'throttleRedirect' || ev.kind === 'throttleExempt') && !ev.name) {
      const m = /[🌿🍽️] (\S+) checks the pantry/.exec(ev.text || '');
      ev.name = m ? m[1] : null;
    }
  }
  return events;
}

module.exports = { installSubstrateCapture, fillEventNames, pantrySnapshot,
  FORAGE_RETURN_RE, REDIRECT_RE, EXEMPT_RE, REST_RE };
