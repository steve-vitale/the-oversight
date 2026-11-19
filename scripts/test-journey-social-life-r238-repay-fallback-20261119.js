#!/usr/bin/env node
// test-journey-social-life-r238-repay-fallback-20261119.js — proof test for
// the r238 fallback-structural fix (journey-social-life r238; the wild F6
// NO-GO: 2 dry lines on seed 45752, both after the player asks "I owe you.
// Let me make it right — what do you need?" — alive:want:repay, stage 0).
//
// THE DEFECT: when the repay opener is ledger-blocked AND every stale
// variant is ledger-blocked, the F6 guard gives up (wline = null) and the
// turn falls to the generic done() fallback '"Okay. Here’s the thing —"' —
// which was handed to sayLine UNCHECKED. If that fallback is also in the
// 48-entry run ledger, sayLine dry-replaces it and the turn dries
// ("...Sorry, lost my train of thought."). Same hole at the settled-favor
// F5 site: all three variants blocked kept the blocked pick, which dried
// (the r226 residual, characterized by the r238 F5 harness: rapid re-asks
// serve V1,V2,V3,DRY,DRY,DRY).
//
// THE FIX (same class as F6 — check the ledger BEFORE handing sayLine a
// line, fall to a fresh phrasing; conversation.js, alive:want branch):
//   1. F5 branch: all three variants blocked -> wline = null (fall
//      through to the generic fallback) instead of keeping the blocked
//      pick.
//   2. alive:want branch: when wline is null after the guard, the turn
//      is structural — the last-resort fallback is conversation GRAMMAR
//      (r17), not content, so it is exempt from the run-ledger block and
//      always speaks instead of drying.
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib, as the
// r226 F6 proof): poison the line(s) through ANOTHER villager's sitting
// (cross-villager run ledger, never the test villager's own said lists),
// then re-ask in a fresh sitting. Fixed: speaks the fallback, never dry.
// Unfixed: dries.
//   1. control: fresh repay opener unblocked — speaks the opener.
//   2. DISCRIMINATOR: opener + both stale variants + fallback blocked —
//      speaks the fallback, never dry (unfixed: dries).
//   3. DISCRIMINATOR: all three F5 variants blocked — speaks the fallback,
//      never dry (unfixed: dries).
//   4. control: opener + stale-v1 blocked, fallback fresh — speaks stale-v2
//      (the pick itself skips the blocked variant; unchanged behavior).
//
// STAGING NOTE (r226 pattern): the favor + want are staged AFTER opening
// the test sitting, and the repay def comes from a DONOR villager (opening
// a sitting on a repay villager consumes their favor). Poisoning always
// happens BEFORE opening the test sitting.
// Usage: node scripts/test-journey-social-life-r238-repay-fallback-20261119.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r238-repay-fallback');

const DRY_MARK = 'lost my train of thought';
const REPAY_OPENER = '"You came through on the food I needed. I won\'t forget it."';
const STALE_1 = '"About the food I needed — I keep thinking about what you did. I want to say it right."';
const STALE_2 = '"The food I needed — I still owe you the thanks. Let me say it properly."';
const FALLBACK = '"Okay. Here’s the thing —"';
const F5_VARIANTS = [
  '"No, really — it\'s handled. Thanks for asking, though."',
  '"It\'s taken care of, I swear. You don\'t need to worry about that one anymore."',
  '"Honestly? It\'s done. Finished. Thank you for checking — it means something that you did."',
];

(async () => {
  const Game = await K.load({ seed: 238200 });

  function fresh() {
    K.newRun(Game);
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const speaking = others.filter(vid => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 1) throw new Error('fresh run has no speaking non-scholar roster members');
    return { speaking };
  }
  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function openVid(vid) {
    try {
      const opened = Game.talkTo(vid);
      if (!opened) return false;
      const c = convo(vid);
      if (c && c.active) return true;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    } catch (e) {}
    return false;
  }
  // poisonOther: speak the line through ANOTHER villager's sitting, so it
  // lands in the cross-villager run ledger but never in the test villager's
  // own said lists — the panel's shape (a line another villager spoke).
  function poisonOther(speaking, excludeVid, line) {
    for (const vid of speaking) {
      if (vid === excludeVid) continue;
      try {
        const opened = Game.talkTo(vid);
        if (!opened) continue;
        const c = convo(vid);
        if (!c || !c.active) { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
        let said = null;
        try { said = Game.sayLine(vid, line); } catch (e) { said = null; }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
        if (said) return true;
      } catch (e) { /* try the next villager */ }
    }
    return false;
  }
  function themLinesSince(vid, from) {
    const c = convo(vid);
    const tr = (c && Array.isArray(c.transcript)) ? c.transcript : [];
    return tr.slice(from).filter(e => e && e.who === 'them').map(e => String(e.text || ''));
  }
  function transcriptLen(vid) {
    const c = convo(vid);
    return (c && Array.isArray(c.transcript)) ? c.transcript.length : 0;
  }
  function makeFavor(vid, state, short) {
    const favor = { vid, id: 'favor-r238-' + state + '-' + vid + '-' + day(), kind: 'food_share', state, askedDay: day(), short };
    try { Game.convoStoreFavor(favor); } catch (e) {}
    return favor;
  }
  // findRepayDef: stage a fulfilled food favor on a DONOR villager until one
  // selects the repay want — returns {donor, def}. The def object is shared
  // across villagers, so it stages any test villager. The donor is never
  // the test villager: opening a sitting on a repay villager consumes their
  // favor (onSurfaced settles on speak).
  function findRepayDef(speaking) {
    for (const vid of speaking) {
      makeFavor(vid, 'fulfilled', 'the food I needed');
      let sel = null;
      try { sel = Game.convoSelectWant(vid); } catch (e) { sel = null; }
      if (sel && sel.id === 'repay' && sel.def) return { donor: vid, def: sel.def };
    }
    return null;
  }
  function askWant(vid) {
    const before = transcriptLen(vid);
    let res = null;
    try { res = Game.convoTurn(vid, 'alive:want'); } catch (e) { res = 'ERR:' + (e && e.message); }
    const lines = themLinesSince(vid, before);
    return { res, text: lines.join(' ') };
  }
  function stageRepay(vid, repDef) {
    const favor = makeFavor(vid, 'fulfilled', 'the food I needed');
    const c = convo(vid);
    c.want = { id: 'repay', def: repDef.def, favor, stage: 0, fromSeed: false, seedFavorId: favor.id };
    return favor;
  }
  function stageSettledFavor(vid) {
    const favor = { vid, id: 'favor-r238-f5-' + vid + '-' + day(), kind: 'food_share', state: 'thanked', askedDay: day(), short: 'spare food for the little ones' };
    try { Game.convoStoreFavor(favor); } catch (e) {}
    const c = convo(vid);
    c.want = { id: 'ask_favor', favor, stage: 0, fromSeed: false };
    return favor;
  }

  // ---- 1. Control: fresh repay opener speaks the opener (good flow). ----
  T.section('1. Control — fresh repay opener speaks the opener');
  let f = fresh();
  let repDef = findRepayDef(f.speaking);
  T.ok('found the repay def via a donor villager', !!repDef, repDef && ('donor=' + repDef.donor));
  if (repDef) {
    const vid = f.speaking.find(v => v !== repDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    stageRepay(vid, repDef);
    T.ok('the opener line is NOT run-blocked', Game.convoWouldBlock(vid, REPAY_OPENER) === false);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 60));
    T.ok('the turn speaks the opener', turn.text.indexOf('You came through on the food I needed') !== -1, 'text=' + turn.text.slice(0, 140));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. DISCRIMINATOR: everything blocked — speaks the fallback, never dry. ----
  T.section('2. All blocked (opener + both stale + fallback) — speaks the fallback, never dry (wild: 45752 x2)');
  f = fresh();
  repDef = findRepayDef(f.speaking);
  T.ok('found the repay def via a donor villager', !!repDef, repDef && ('donor=' + repDef.donor));
  if (repDef) {
    const vid = f.speaking.find(v => v !== repDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('poisoned the opener through another villager', poisonOther(f.speaking, vid, REPAY_OPENER));
    T.ok('poisoned stale-v1 through another villager', poisonOther(f.speaking, vid, STALE_1));
    T.ok('poisoned stale-v2 through another villager', poisonOther(f.speaking, vid, STALE_2));
    T.ok('poisoned the fallback through another villager', poisonOther(f.speaking, vid, FALLBACK));
    T.ok('all four ARE run-blocked', [REPAY_OPENER, STALE_1, STALE_2, FALLBACK].every(l => Game.convoWouldBlock(vid, l) === true));
    T.ok('opened a sitting on the test villager', openVid(vid));
    stageRepay(vid, repDef);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 60));
    T.ok('the turn speaks the fallback (structural-exempt)', turn.text.indexOf('Okay. Here') !== -1, 'text=' + turn.text.slice(0, 140));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. DISCRIMINATOR: all three F5 variants blocked — fallback, never dry. ----
  T.section('3. All three F5 variants blocked — speaks the fallback, never dry (harness case 4)');
  f = fresh();
  const vid3 = f.speaking[0];
  T.ok('picked a test villager', !!vid3, 'vid=' + vid3);
  T.ok('poisoned F5 variant 1 through another villager', poisonOther(f.speaking, vid3, F5_VARIANTS[0]));
  T.ok('poisoned F5 variant 2 through another villager', poisonOther(f.speaking, vid3, F5_VARIANTS[1]));
  T.ok('poisoned F5 variant 3 through another villager', poisonOther(f.speaking, vid3, F5_VARIANTS[2]));
  T.ok('all three ARE run-blocked', F5_VARIANTS.every(v => Game.convoWouldBlock(vid3, v) === true));
  T.ok('opened a sitting on the test villager', openVid(vid3));
  stageSettledFavor(vid3);
  const turn3 = askWant(vid3);
  T.ok('the turn ran', !!turn3.res && typeof turn3.res === 'object', 'res=' + String(turn3.res && turn3.res.line || turn3.res).slice(0, 60));
  T.ok('the turn speaks the fallback (structural-exempt)', turn3.text.indexOf('Okay. Here') !== -1, 'text=' + turn3.text.slice(0, 140));
  T.ok('the turn does NOT dry', turn3.text.indexOf(DRY_MARK) === -1, 'text=' + turn3.text.slice(0, 140));
  try { Game.endConvo(vid3, 'left'); } catch (e) {}

  // ---- 4. Control: opener + stale-v1 blocked — speaks stale-v2 (unchanged). ----
  T.section('4. Control — opener + stale-v1 blocked, stale-v2 fresh: speaks stale-v2');
  f = fresh();
  repDef = findRepayDef(f.speaking);
  T.ok('found the repay def via a donor villager', !!repDef, repDef && ('donor=' + repDef.donor));
  if (repDef) {
    const vid = f.speaking.find(v => v !== repDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('poisoned the opener through another villager', poisonOther(f.speaking, vid, REPAY_OPENER));
    T.ok('poisoned stale-v1 through another villager', poisonOther(f.speaking, vid, STALE_1));
    T.ok('stale-v2 is NOT run-blocked', Game.convoWouldBlock(vid, STALE_2) === false);
    T.ok('opened a sitting on the test villager', openVid(vid));
    stageRepay(vid, repDef);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 60));
    T.ok('the turn speaks stale-v2', turn.text.indexOf('I still owe you the thanks') !== -1, 'text=' + turn.text.slice(0, 140));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
