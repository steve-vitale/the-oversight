#!/usr/bin/env node
// plainvoice-capture.js — plain cook frame classifier AT THE SOURCE
// (sim-plainvoice-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// DIAG ONLY: zero game changes, zero default flips. Wraps Game.say
// AFTER loadGame (same post-load pattern as scripts/say-capture.js,
// which is unchanged). For every cook line it records the frame
// (worked / racksFull / plain); for PLAIN lines only it tags the
// emit-time context read from the engine at the moment say is
// called — after the cook branch ran, before any later resolution
// mutates state. Classes are assigned from those tags ONLY, never
// from line text (all plain lines share one byte-identical frame).
//
// READ-ONLY BY CONSTRUCTION: the wrapper writes ONLY to the
// caller's arrays; it never writes Game.state, Game.log, RNG, or
// any game field. Person lookup reads Game.data.villagers directly
// and deliberately does NOT call Game.getPerson (which can hydrate
// a seed — a write). specialistSkill / isSpoiled / isKeepsake are
// read-only queries; every tag computation is try/catch isolated
// so a tag failure can never change game behavior. It delegates
// to the original say with the same arguments, `this`, and return
// value.
//
// TAXONOMY (pre-registered in evidence/2026-10-26/sim-plainvoice-b.md,
// exclusive, first match wins):
//   P-SILENCED     racksFull && eligible && voiceSpokenToday
//   P-RACKS-NOELIG racksFull && !eligible
//   P-RES2PLUS     !racksFull && resolutionIndex >= 2
//   P-FIRST-NOSMOKE !racksFull && resolutionIndex == 1
//   UNCLASSIFIED   recompute failed / rackCap ambiguous across
//                  same-first-name candidates / impossible combo
//                  (racksFull && eligible && !voiceSpokenToday —
//                  under gate B that resolution would have spoken).
// The resolutionIndex is a RECORDER sequence count (emit-order
// ordinal per cook per day), not an engine variable: the engine
// keeps no resolution counter. That is a recorded design question,
// not a hidden assumption.
'use strict';

const COOK_FRAME_RE = /^🍲 (\S+) cooked for the haven — meals stretched\./;
const WORKED_RE = /worked the smoke racks too/i;
const RACKS_FULL_RE = /racks are already full/i;

function branchDay(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 1; }
  catch (e) { return 1; }
}

// Recompute the cook branch's racks-full inputs from engine state
// at emit time. Returns null on any failure (caller: UNCLASSIFIED).
// Valid for plain lines because a plain resolution mutates nothing
// (n = 0: no conversion, no partial split, no pantry change).
function recomputeContext(Game, cook) {
  try {
    const day = branchDay(Game);
    const v = (Game.state || {}).village || {};
    const pantry = v.pantry || [];
    const rosterLen = ((v.roster || []).length || 10);
    let preservedKcal = 0;
    for (const it of pantry) {
      if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
        preservedKcal += (it.kcalEach || 0) * (it.units || 1);
    }
    // Cook skill: candidates are materialized villagers sharing the
    // cook's first name. If they disagree on the rackCap bucket, the
    // recompute is ambiguous — never guessed.
    const villagers = (Game.data || {}).villagers || [];
    const cands = villagers.filter(p => p && typeof p.name === 'string' &&
      p.name.split(' ')[0] === cook);
    if (!cands.length) return { ok: false, reason: 'no-candidate', day, preservedKcal };
    const caps = new Set();
    for (const p of cands) {
      let skill = 0;
      try { skill = (typeof Game.specialistSkill === 'function') ? (Game.specialistSkill(p, 'preserver') || 0) : 0; }
      catch (e) { return { ok: false, reason: 'skill-threw', day, preservedKcal }; }
      const ownShelf = skill > 0 ? 30 + 5 * skill : 15;
      caps.add(125 * rosterLen * Math.max(1, ownShelf - 2));
    }
    if (caps.size !== 1) return { ok: false, reason: 'ambiguous-rackCap', day, preservedKcal, candidates: cands.length };
    const rackCap = caps.values().next().value;
    // Eligible surplus, same rules as the cook branch.
    let eligibleCount = 0, eligibleKcal = 0;
    for (const it of pantry) {
      if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
      if (it.bonded) continue;
      if (it.foodState === 'preserved' || it.foodState === 'rendered') continue;
      if ((it.foodKind || '') === 'pemmican') continue;
      try { if (Game.isKeepsake && Game.isKeepsake(it)) continue; } catch (e) {}
      const sd = it.spoilDay;
      if (sd === undefined || sd === null || sd >= 9999) continue;
      let spoiled = false;
      try { spoiled = Game.isSpoiled ? !!Game.isSpoiled(it, 0) : (sd <= day); }
      catch (e) { spoiled = (sd <= day); }
      if (spoiled) continue;
      if (sd - day > 2) continue;
      eligibleCount++;
      eligibleKcal += (it.kcalEach || 0) * (it.units || 1);
    }
    let voiceSpokenToday = false;
    try { voiceSpokenToday = (Game._racksFullVoiceDay === day); }
    catch (e) { voiceSpokenToday = false; }
    return {
      ok: true, day, preservedKcal, rackCap,
      racksFull: preservedKcal >= rackCap,
      eligiblePresent: eligibleCount > 0, eligibleCount, eligibleKcal,
      voiceSpokenToday, candidates: cands.length,
    };
  } catch (e) {
    return { ok: false, reason: 'threw:' + (e && e.message ? String(e.message).slice(0, 40) : '?') };
  }
}

function classifyPlain(ctx, resIndex) {
  if (!ctx || !ctx.ok) return 'UNCLASSIFIED';
  if (ctx.racksFull && ctx.eligiblePresent && !ctx.voiceSpokenToday) return 'UNCLASSIFIED';
  if (ctx.racksFull && ctx.eligiblePresent && ctx.voiceSpokenToday) return 'P-SILENCED';
  if (ctx.racksFull && !ctx.eligiblePresent) return 'P-RACKS-NOELIG';
  if (!ctx.racksFull && resIndex >= 2) return 'P-RES2PLUS';
  if (!ctx.racksFull && resIndex === 1) return 'P-FIRST-NOSMOKE';
  return 'UNCLASSIFIED';
}

// installPlainvoiceCapture(Game, opts) -> { samples, plainDetail, uninstall }
// opts: { cap (default 1000) }. samples: every cook line (frame only);
// plainDetail: every plain line with its full tag set.
function installPlainvoiceCapture(Game, opts) {
  opts = opts || {};
  const cap = (opts.cap != null) ? opts.cap : 1000;
  const orig = Game.say;
  if (typeof orig !== 'function') throw new Error('plainvoice-capture: Game.say is not a function');
  if (orig.__plainvoiceInstalled) throw new Error('plainvoice-capture: Game.say is already plainvoice-wrapped');
  const samples = [];
  const plainDetail = [];
  const ordinal = new Map(); // cook|day -> count of cook lines so far
  const wrapped = function () {
    let text = '';
    try { text = Array.prototype.slice.call(arguments).map(String).join(' '); }
    catch (e) { text = ''; }
    try {
      const m = text && COOK_FRAME_RE.exec(text);
      if (m && samples.length < cap) {
        const cook = m[1];
        const day = branchDay(Game);
        const key = cook + '|' + day;
        const resIndex = (ordinal.get(key) || 0) + 1;
        ordinal.set(key, resIndex);
        let frame = 'plain';
        if (WORKED_RE.test(text)) frame = 'worked';
        else if (RACKS_FULL_RE.test(text)) frame = 'racksFull';
        samples.push({ day, cook, frame, text: text.slice(0, 240) });
        if (frame === 'plain') {
          const ctx = recomputeContext(Game, cook);
          const cls = classifyPlain(ctx, resIndex);
          plainDetail.push({
            day, cook, text: text.slice(0, 240), resIndex, class: cls,
            racksFull: ctx ? !!ctx.racksFull : null,
            eligiblePresent: ctx ? !!ctx.eligiblePresent : null,
            eligibleCount: ctx ? (ctx.eligibleCount != null ? ctx.eligibleCount : null) : null,
            eligibleKcal: ctx ? (ctx.eligibleKcal != null ? ctx.eligibleKcal : null) : null,
            preservedKcal: ctx ? (ctx.preservedKcal != null ? ctx.preservedKcal : null) : null,
            rackCap: ctx ? (ctx.rackCap != null ? ctx.rackCap : null) : null,
            voiceSpokenToday: ctx ? !!ctx.voiceSpokenToday : null,
            candidates: ctx ? (ctx.candidates != null ? ctx.candidates : null) : null,
            unclassReason: cls === 'UNCLASSIFIED' ? (ctx && ctx.reason ? ctx.reason : 'impossible-combo') : null,
          });
        }
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  wrapped.__plainvoiceInstalled = true;
  Game.say = wrapped;
  return {
    samples, plainDetail,
    uninstall() { if (Game.say === wrapped) Game.say = orig; },
  };
}

module.exports = { COOK_FRAME_RE, WORKED_RE, RACKS_FULL_RE, branchDay, recomputeContext, classifyPlain, installPlainvoiceCapture };
