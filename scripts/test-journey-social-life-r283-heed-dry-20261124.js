#!/usr/bin/env node
'use strict';
// Proof: dlg:heed goes dry when its generic pool is run-blocked
// (journey-social-life r283, Arm B; the r277 F6 dry line).
//
// THE DEFECT (r277 panel, seed 45846, C-friendship, day 81): the warning
// was delivered via dlg:details, which marks c._warnDelivered, so the
// dlg:heed handler falls to its 3-line generic pool with NO pre-check.
// The picked generic line was run-ledger-blocked — another villager had
// said one of the 3 generic heed lines within the last 48 NPC lines —
// and sayLine dry-replaced it with "...Sorry, lost my train of thought."
// Root cause: convoPickCycle dedupes against the villager's OWN said
// lists only; it never asks convoWouldBlock, so it can return a line
// the RUN ledger would refuse at emission.
//
// THE FIX (r283 Arm B, convo-dialogue.js dlg:heed, heeds < 4 branch):
// (a) widen the generic pool 3 -> 6; (b) pre-check each candidate with
// convoWouldBlock and serve the first unblocked (r19 opener / r193
// closer pattern); (c) if ALL generic lines are blocked, fall back to
// convoWantWarning — a fresh warning variant, rotation-guarded, never
// the just-delivered line since the cursor advanced past it.
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib, as the
// r268 resume-fallthrough test and the r150 warn-heed test): poison the
// whole generic heed pool through OTHER villagers' sittings
// (cross-villager run ledger, never the test villager's own said lists),
// plant a warn_you want, details -> warning, press dlg:heed.
// Fixed: a content line speaks (warning variant), never dry.
// Unfixed: dries.
//   1. poisoned whole pool, details -> heed — warning variant, never dry
//   2. poisoned ONE generic line (the r277 exact shape) — a different
//      generic line speaks, never dry, never the blocked one
//   3. control: unpoisoned details -> heed — a generic line speaks
//   4. control: heed FIRST (r150 regression) — the warning itself speaks
//
// STAGING NOTE: the 6-line pool is poisoned whole, because convoPickCycle
// draws a random unserved line — no single line is predictable.
// Poisoning happens in ONE sitting, not one per line: each sitting's
// opener + goodbye also enters the 48-entry run-ledger window, and a
// sitting per line evicted the earliest poisons before the test pick
// (the r268 lesson). The 3 NEW draft lines are poisoned too: sayLine
// ledgers any line spoken, so they land in the run ledger whether or
// not the fix has added them to the pool yet — which is what makes
// section 1 RED before the fix and GREEN after.
// Usage: node scripts/test-journey-social-life-r283-heed-dry-20261124.js
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r283-heed-dry');

const DRY_MARK = 'lost my train of thought';
// The 6-line generic heed pool: the 3 originals first (verbatim from
// convo-dialogue.js), then the 3 r283 drafts (verbatim from the prereg).
// If the fix's strings differ by even one character, section 1 fails
// loudly instead of false-passing — the poison must block the real pool.
const GENERIC_HEED_6 = [
  '"Good. I mean it — watch yourself out there."',
  '"Promise me that. Please."',
  '"Thank you. I needed to hear you say it."',
  '"Good. That\'s all I wanted — someone out there who comes back."',
  '"Alright. I\'ll stop hovering. Just — come back, yes?"',
  '"Good. The fire\'s warmer with you beside it, that\'s all."',
];
const WARNING_CONTENT = /treeline|last night|come back|come through|moving out|don't go out alone|woods don't feel empty|stay where people can see you|it knows|get back inside/i;

(async () => {
  const Game = await K.load({ seed: 283100 });

  function fresh() {
    K.newRun(Game);
    const v = Game.state.village;
    const oldId = Game.villagerId;
    const roster = (v.roster || []).filter(id => id !== oldId);
    const speaking = roster.filter(id => {
      try { return Game.commLevel(id).level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 2) throw new Error('fresh run needs 2+ speaking non-scholar roster members');
    const speaker = speaking.find(id => {
      try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
    }) || speaking[0];
    v.trust = v.trust || {};
    v.trust[speaker] = 50;
    v.recentAttacks = 1;
    ensureWarnDef(speaking);
    return { speaking, speaker };
  }
  // WARN_DEF: the shared WANTS.warn_you def, captured once from whichever
  // villager selects it naturally (recentAttacks=1 makes it likely, but
  // the pick is per-villager state, so a single speaker may not offer
  // it on a given fresh run — sections 3-4 of the first draft failed
  // exactly there). The def is the module-shared singleton, so capturing
  // it once and re-hanging it is the r150 sitting-2 pattern, not a
  // fabrication: the sitting still runs the real warn_you want.
  let WARN_DEF = null;
  function ensureWarnDef(speaking) {
    if (WARN_DEF) return true;
    for (const vid of speaking) {
      try {
        const w = Game.convoSelectWant(vid);
        if (w && w.id === 'warn_you') { WARN_DEF = w.def; return true; }
      } catch (e) { /* next villager */ }
    }
    return false;
  }
  function npcLast(vid) {
    const c = Game.convoGet(vid);
    const npc = (c.transcript || []).filter(e => e.who !== 'you').map(e => String(e.text));
    return npc.length ? npc[npc.length - 1] : null;
  }
  function takeChoice(vid, id) {
    for (let t = 0; t < 8; t++) {
      let choices = [];
      try { choices = Game.convoChoices(vid) || []; } catch (e) { return null; }
      if (!choices.length) return null;
      if (choices.find(ch => ch.id === id)) {
        Game.convoTurn(vid, id);
        return npcLast(vid);
      }
      const next = choices.find(ch => !/^(leave|bye|goodbye)/.test(ch.id));
      if (!next) return null;
      Game.convoTurn(vid, next.id);
    }
    return null;
  }
  // poisonPool: speak every line through ONE other villager's sitting, so
  // all of them land in the cross-villager run ledger but never in the
  // test villager's own said lists (r268 pattern).
  function poisonPool(speaking, excludeVid, lines) {
    for (const vid of speaking) {
      if (vid === excludeVid) continue;
      try {
        const opened = Game.talkTo(vid);
        if (!opened) continue;
        const c = Game.convoGet(vid);
        if (!c || !c.active) { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
        let said = 0;
        for (const line of lines) {
          try { if (Game.sayLine(vid, line)) said++; } catch (e) { /* next line */ }
        }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
        if (said > 0) return said;
      } catch (e) { /* try the next villager */ }
    }
    return 0;
  }
  function hangWarnYou(vid) {
    // Prefer the sitting's natural want (the r150 shape); fall back to
    // the captured shared def so the test does not depend on one
    // speaker's pick on one fresh run.
    let warnDef = WARN_DEF;
    try {
      const w = Game.convoSelectWant(vid);
      if (w && w.id === 'warn_you') warnDef = w.def;
    } catch (e) {}
    if (!warnDef) return false;
    try {
      const c = Game.convoGet(vid);
      if (c && (!c.want || c.want.id !== 'warn_you')) c.want = { id: 'warn_you', def: warnDef, stage: 1 };
    } catch (e) { return false; }
    return true;
  }

  // ---- 1. Poisoned whole pool, details -> heed: warning, never dry. ----
  T.section('1. Poisoned whole generic pool, details -> heed — warning variant speaks, never dry (r277 panel defect)');
  let f = fresh();
  let vid = f.speaker;
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  const poisoned1 = poisonPool(f.speaking, vid, GENERIC_HEED_6);
  T.ok('poisoned the whole 6-line generic pool through other villagers', poisoned1 === GENERIC_HEED_6.length, 'poisoned=' + poisoned1 + '/6');
  T.ok('opened a sitting on the test villager', (() => { try { const o = Game.startConvo(vid); return !!(o && !o.refused && !o.ended); } catch (e) { return false; } })());
  T.ok('warn_you is the sitting want', hangWarnYou(vid));
  const d1 = takeChoice(vid, 'dlg:details');
  T.ok('details speaks the warning', !!d1 && WARNING_CONTENT.test(d1), (d1 || '(none)').slice(0, 160));
  const h1 = takeChoice(vid, 'dlg:heed');
  T.ok('heed after details reaches a reply', !!h1, (h1 || '(none)').slice(0, 160));
  T.ok('heed after details does NOT dry', !!h1 && h1.indexOf(DRY_MARK) === -1, (h1 || '(none)').slice(0, 160));
  T.ok('heed after details speaks a warning variant (the fallback)', !!h1 && WARNING_CONTENT.test(h1), (h1 || '(none)').slice(0, 160));
  T.ok('heed after details does NOT repeat a blocked generic line', !!h1 && GENERIC_HEED_6.every(l => h1.indexOf(l.slice(1, 30)) === -1), (h1 || '(none)').slice(0, 160));
  try { const c = Game.convoGet(vid); T.ok('heed still engages the want', !!c && !!c.want && (c.want.stage || 0) >= 2, 'stage=' + ((c.want && c.want.stage) || 0)); } catch (e) { T.ok('heed still engages the want', false, String(e && e.message)); }
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 2. One generic line blocked (r277 exact shape). ----
  T.section('2. One generic line blocked — a different generic line speaks, never dry');
  f = fresh();
  vid = f.speaker;
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  const blockedOne = GENERIC_HEED_6[0];
  const poisoned2 = poisonPool(f.speaking, vid, [blockedOne]);
  T.ok('poisoned one generic line through other villagers', poisoned2 === 1, 'poisoned=' + poisoned2);
  T.ok('opened a sitting on the test villager', (() => { try { const o = Game.startConvo(vid); return !!(o && !o.refused && !o.ended); } catch (e) { return false; } })());
  T.ok('warn_you is the sitting want', hangWarnYou(vid));
  const d2 = takeChoice(vid, 'dlg:details');
  T.ok('details speaks the warning', !!d2 && WARNING_CONTENT.test(d2), (d2 || '(none)').slice(0, 160));
  const h2 = takeChoice(vid, 'dlg:heed');
  T.ok('heed after details reaches a reply', !!h2, (h2 || '(none)').slice(0, 160));
  T.ok('heed after details does NOT dry', !!h2 && h2.indexOf(DRY_MARK) === -1, (h2 || '(none)').slice(0, 160));
  T.ok('heed after details speaks a generic line', !!h2 && GENERIC_HEED_6.indexOf(h2) !== -1, (h2 || '(none)').slice(0, 160));
  T.ok('heed after details does NOT repeat the blocked line', !!h2 && h2 !== blockedOne, (h2 || '(none)').slice(0, 160));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 3. Control: unpoisoned details -> heed speaks a generic line. ----
  T.section('3. Control — unpoisoned details -> heed speaks a generic line');
  f = fresh();
  vid = f.speaker;
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  T.ok('opened a sitting on the test villager', (() => { try { const o = Game.startConvo(vid); return !!(o && !o.refused && !o.ended); } catch (e) { return false; } })());
  T.ok('warn_you is the sitting want', hangWarnYou(vid));
  const d3 = takeChoice(vid, 'dlg:details');
  T.ok('details speaks the warning', !!d3 && WARNING_CONTENT.test(d3), (d3 || '(none)').slice(0, 160));
  const h3 = takeChoice(vid, 'dlg:heed');
  T.ok('heed after details reaches a reply', !!h3, (h3 || '(none)').slice(0, 160));
  T.ok('heed after details does NOT dry', !!h3 && h3.indexOf(DRY_MARK) === -1, (h3 || '(none)').slice(0, 160));
  T.ok('heed after details speaks a generic line', !!h3 && GENERIC_HEED_6.indexOf(h3) !== -1, (h3 || '(none)').slice(0, 160));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 4. Control: heed FIRST speaks the warning (r150 regression). ----
  T.section('4. Control — heed FIRST speaks the warning itself (r150 fix holds)');
  f = fresh();
  vid = f.speaker;
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  T.ok('opened a sitting on the test villager', (() => { try { const o = Game.startConvo(vid); return !!(o && !o.refused && !o.ended); } catch (e) { return false; } })());
  T.ok('warn_you is the sitting want', hangWarnYou(vid));
  const h4 = takeChoice(vid, 'dlg:heed');
  T.ok('first heed reaches a reply', !!h4, (h4 || '(none)').slice(0, 160));
  T.ok('first heed names the danger', !!h4 && WARNING_CONTENT.test(h4), (h4 || '(none)').slice(0, 160));
  T.ok('first heed is not a generic line', !!h4 && GENERIC_HEED_6.indexOf(h4) === -1, (h4 || '(none)').slice(0, 160));
  T.ok('first heed is not a dry deflection', !!h4 && h4.indexOf(DRY_MARK) === -1, (h4 || '(none)').slice(0, 160));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
