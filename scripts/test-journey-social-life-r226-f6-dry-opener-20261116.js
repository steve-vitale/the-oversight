#!/usr/bin/env node
// test-journey-social-life-r226-f6-dry-opener-20261116.js — proof test for
// the r226 F6 fix (journey-social-life r226; the B2 dry-line finding).
//
// THE DEFECT (r226 panel, seeds 45701-45704): 21 dropped threads, ALL the
// dry line ("...Sorry, lost my train of thought.") — 16 of them on 45704,
// Olivia Bennett alone drying 7 times on one line in the probe run. The
// r224 F4a/F4c dry-line fixes do NOT hold in the wild, because the
// `alive:want` handler's stage-0 opener guard covers ONLY ask_favor
// (r53/r191/r146 rungs). Three sites hand sayLine a ledger-blocked line:
//
//   1. alive:want stage-0 opener, non-ask_favor wants: repay's
//      fulfilled-favor opener is a SINGLE fixed line ("You came through on
//      the food I needed. I won't forget it.") — once any villager speaks
//      it, every later repay re-ask dries. A resumed curious question
//      re-hangs unfiltered (seedQid path bypasses the F4a ledger-aware
//      pick), so its text dries the same way.
//   2. repay.engageBeat thanks pool (stage 1-2): two variants cycled per
//      villager with no ledger check — once both are in the 48-entry run
//      ledger, every re-ask dries.
//   3. Settled-favor F5 pool: three variants cycled per villager, no
//      ledger check — the r225 comment claimed the cycle "skips the
//      ledger-blocked variant"; it does not (per-villager memory, not the
//      cross-villager run ledger). Probe: Olivia d97 dried on variant 2.
//
// THE FIX (F6, same class at all three sites — check the ledger BEFORE
// handing sayLine a line, fall to a fresh phrasing):
//   1. alive:want stage-0: after the ask_favor rungs, any still-blocked
//      opener falls to its stale opener (def.staleOpener, else the generic
//      reframe — the same escape the startConvo flow uses); stale blocked
//      too -> the handler's default speaks, never the dry line.
//   2. repay.engageBeat thanks: try the cycle's pick, then the other
//      variant; both blocked -> null (callers fall through honestly).
//   3. Settled-favor branch: try each variant in cycle order until one is
//      fresh; all three blocked keeps the pick (rare residual, noted).
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib, as the
// r225 F5 test): poison the line(s) through ANOTHER villager's sitting
// (cross-villager run ledger, never this villager's own said lists),
// then re-ask in a fresh sitting. Fixed: speaks the fresh phrasing (or
// null for the thanks pool), never dry. Unfixed: dries.
//   1. repay-opener-blocked-speaks-stale (the panel's dominant shape)
//   2. curious-resume-blocked-speaks-stale (the resume-path hole)
//   3. repay-thanks-both-blocked-returns-null + one-blocked-returns-fresh
//   4. settled-favor-two-blocked-speaks-third
//   5. control: fresh repay opener unblocked — speaks the opener (good flow)
//
// STAGING NOTE: opening a sitting on a repay villager CONSUMES the favor
// (repay.onSurfaced settles on speak), so the favor + want are always
// staged AFTER opening the test sitting (the r225 F5 pattern), and the
// repay def comes from a DONOR villager. Poisoning always happens BEFORE
// opening the test sitting — opening a poison sitting would close it.
// Usage: node scripts/test-journey-social-life-r226-f6-dry-opener-20261116.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r226-f6-dry-opener');

const DRY_MARK = 'lost my train of thought';
const REPAY_OPENER = '"You came through on the food I needed. I won\'t forget it."';
const REPAY_THANKS_2 = '"the food I needed — you kept your word. Thank you."';
// r266 (r152 fallout): the F5 variants below are the NAMED pool — section 4
// stages its favor with this short, so the game serves these, not the
// generic pool. Poisoning the generic strings could neither block the
// named variants nor make the pick order-independent (the served variant
// was random among the three). The generic pool is covered by the r152
// named test (shortless favor) and the r225 F5 test (shape markers).
const F5_SHORT = 'spare food for the little ones';
const F5_VARIANTS = [
  `"No, really — it's handled: ${F5_SHORT}. Thanks for asking, though."`,
  `"Spare food for the little ones — it's taken care of, I swear. You don't need to worry about it anymore."`,
  `"Honestly? It's done — ${F5_SHORT}. Finished. Thank you for checking — it means something that you did."`,
];
const TEACH_ID = 'q_teach_me';

(async () => {
  const Game = await K.load({ seed: 226100 });

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
  function openAny(speaking) {
    for (const vid of speaking) {
      if (openVid(vid)) return vid;
    }
    return null;
  }
  // poisonOther: speak the line through ANOTHER villager's sitting, so it
  // lands in the cross-villager run ledger but never in the test villager's
  // own said lists — the panel's shape (Olivia drying on a line Ines spoke).
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
  function askWant(vid) {
    const before = transcriptLen(vid);
    let res = null;
    try { res = Game.convoTurn(vid, 'alive:want'); } catch (e) { res = 'ERR:' + (e && e.message); }
    const lines = themLinesSince(vid, before);
    return { res, text: lines.join(' ') };
  }
  function makeFavor(vid, state, short) {
    const favor = { vid, id: 'favor-f6-' + state + '-' + vid + '-' + day(), kind: 'food_share', state, askedDay: day(), short };
    try { Game.convoStoreFavor(favor); } catch (e) {}
    return favor;
  }
  // findRepayDef: stage a fulfilled food favor on a DONOR villager until one
  // selects the repay want (r104 record path) — returns {donor, def}. The def
  // object is shared across villagers, so it stages any test villager. The
  // donor is never the test villager: opening a sitting on a repay villager
  // consumes their favor (onSurfaced settles on speak).
  function findRepayDef(speaking) {
    for (const vid of speaking) {
      makeFavor(vid, 'fulfilled', 'the food I needed');
      let sel = null;
      try { sel = Game.convoSelectWant(vid); } catch (e) { sel = null; }
      if (sel && sel.id === 'repay' && sel.def) return { donor: vid, def: sel.def };
    }
    return null;
  }
  function findDef(speaking, wantId) {
    for (const vid of speaking) {
      try {
        const sel = Game.convoSelectWant(vid);
        if (sel && sel.id === wantId && sel.def) return sel.def;
      } catch (e) {}
    }
    return null;
  }
  function pickTestVid(speaking, exclude) {
    for (const vid of speaking) {
      if (vid !== exclude) return vid;
    }
    return null;
  }

  // ---- 1. Repay opener blocked — the stale opener speaks, never dry. ----
  T.section('1. Repay opener ledger-blocked — re-ask speaks the stale opener (panel: Olivia x7)');
  let f = fresh();
  let repDef = findRepayDef(f.speaking);
  T.ok('found the repay def via a donor villager', !!repDef, repDef && ('donor=' + repDef.donor));
  if (repDef) {
    const vid = pickTestVid(f.speaking, repDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('poisoned the opener line through another villager', poisonOther(f.speaking, vid, REPAY_OPENER));
    T.ok('opened a sitting on the test villager', openVid(vid));
    const favor = makeFavor(vid, 'fulfilled', 'the food I needed');
    const c = convo(vid);
    c.want = { id: 'repay', def: repDef.def, favor, stage: 0, fromSeed: false, seedFavorId: favor.id };
    T.ok('the opener line IS run-blocked for this villager', Game.convoWouldBlock(vid, REPAY_OPENER) === true);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 80));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 140));
    T.ok('the turn does NOT repeat the blocked opener', turn.text.indexOf('You came through on the food I needed') === -1, 'text=' + turn.text.slice(0, 140));
    T.ok('the turn speaks the stale opener (names the debt)', /the food I needed/i.test(turn.text) && /keep thinking|owe you the thanks|turning it over/i.test(turn.text), 'text=' + turn.text.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. Curious resume blocked — the stale opener speaks, never dry. ----
  T.section('2. Curious resumed question ledger-blocked — re-ask speaks the stale opener');
  f = fresh();
  const curiousDef = findDef(f.speaking, 'curious');
  T.ok('found the curious def via selection', !!curiousDef);
  const teach = (Game.data && Game.data.characterGen && Game.data.characterGen.convo && Game.data.characterGen.convo.questions || []).find(q => q.id === TEACH_ID);
  T.ok('q_teach_me def exists with its singleton line', !!teach && !!teach.q, teach && teach.q);
  if (curiousDef && teach) {
    const vid = f.speaking[0];
    T.ok('picked a test villager', !!vid, 'vid=' + vid);
    T.ok('poisoned the resumed question through another villager', poisonOther(f.speaking, vid, teach.q));
    T.ok('opened a sitting on the test villager', openVid(vid));
    const c = convo(vid);
      c.want = { id: 'curious', def: curiousDef, stage: 0, fromSeed: true, seedQid: TEACH_ID, seedNote: null };
      T.ok('the question line IS run-blocked for this villager', Game.convoWouldBlock(vid, teach.q) === true);
      const turn = askWant(vid);
      T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 80));
      T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 140));
      T.ok('the turn does NOT repeat the blocked question', turn.text.indexOf(teach.q.slice(0, 40)) === -1, 'text=' + turn.text.slice(0, 140));
      T.ok('the turn speaks the stale opener (names the question)', /keep turning it over|Still wondering/i.test(turn.text), 'text=' + turn.text.slice(0, 140));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Repay thanks pool: both blocked -> null; one blocked -> fresh. ----
  T.section('3. Repay thanks pool — both blocked returns null, one blocked returns the fresh variant');
  f = fresh();
  repDef = findRepayDef(f.speaking);
  T.ok('found the repay def via a donor villager', !!repDef, repDef && ('donor=' + repDef.donor));
  if (repDef) {
    const vid = pickTestVid(f.speaking, repDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('poisoned thanks variant 1 through another villager', poisonOther(f.speaking, vid, REPAY_OPENER));
    T.ok('poisoned thanks variant 2 through another villager', poisonOther(f.speaking, vid, REPAY_THANKS_2));
    T.ok('opened a sitting on the test villager', openVid(vid));
    const favor = makeFavor(vid, 'fulfilled', 'the food I needed');
    const c = convo(vid);
    c.want = { id: 'repay', def: repDef.def, favor, stage: 2, fromSeed: false, seedFavorId: favor.id };
    T.ok('both thanks variants ARE run-blocked', Game.convoWouldBlock(vid, REPAY_OPENER) === true && Game.convoWouldBlock(vid, REPAY_THANKS_2) === true);
    let beat = null;
    try { beat = repDef.def.engageBeat.call(Game, vid); } catch (e) { beat = 'ERR:' + (e && e.message); }
    T.ok('engageBeat returns null when both thanks variants are blocked', beat === null, 'beat=' + String(beat).slice(0, 100));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  // One blocked: fresh run, poison only variant 1 — engageBeat must return variant 2.
  f = fresh();
  repDef = findRepayDef(f.speaking);
  T.ok('found the repay def via a donor villager (one-blocked case)', !!repDef, repDef && ('donor=' + repDef.donor));
  if (repDef) {
    const vid = pickTestVid(f.speaking, repDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('poisoned thanks variant 1 through another villager', poisonOther(f.speaking, vid, REPAY_OPENER));
    T.ok('opened a sitting on the test villager', openVid(vid));
    const favor = makeFavor(vid, 'fulfilled', 'the food I needed');
    const c = convo(vid);
    c.want = { id: 'repay', def: repDef.def, favor, stage: 2, fromSeed: false, seedFavorId: favor.id };
    T.ok('variant 1 IS run-blocked', Game.convoWouldBlock(vid, REPAY_OPENER) === true);
    T.ok('variant 2 is NOT run-blocked', Game.convoWouldBlock(vid, REPAY_THANKS_2) === false);
    let beat = null;
    try { beat = repDef.def.engageBeat.call(Game, vid); } catch (e) { beat = 'ERR:' + (e && e.message); }
    T.ok('engageBeat returns the fresh variant 2', beat === REPAY_THANKS_2, 'beat=' + String(beat).slice(0, 100));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 4. Settled favor, two variants blocked — speaks the third. ----
  T.section('4. Settled favor, variants 1+2 blocked — re-ask speaks variant 3 (probe: Olivia d97)');
  f = fresh();
  const vid4 = f.speaking[0];
  T.ok('picked a test villager', !!vid4, 'vid=' + vid4);
  if (vid4) {
    T.ok('poisoned F5 variant 1 through another villager', poisonOther(f.speaking, vid4, F5_VARIANTS[0]));
    T.ok('poisoned F5 variant 2 through another villager', poisonOther(f.speaking, vid4, F5_VARIANTS[1]));
    T.ok('opened a sitting on the test villager', openVid(vid4));
    const favor = { vid: vid4, id: 'favor-f6-f5', kind: 'food_share', state: 'thanked', askedDay: day(), short: F5_SHORT };
    try { Game.convoStoreFavor(favor); } catch (e) {}
    const c = convo(vid4);
    c.want = { id: 'ask_favor', favor, stage: 0, fromSeed: false };
    T.ok('variants 1+2 ARE run-blocked', Game.convoWouldBlock(vid4, F5_VARIANTS[0]) === true && Game.convoWouldBlock(vid4, F5_VARIANTS[1]) === true);
    T.ok('variant 3 is NOT run-blocked', Game.convoWouldBlock(vid4, F5_VARIANTS[2]) === false);
    const turn = askWant(vid4);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 80));
    T.ok('the turn speaks variant 3', turn.text.indexOf('Finished. Thank you for checking') !== -1, 'text=' + turn.text.slice(0, 140));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 140));
    try { Game.endConvo(vid4, 'left'); } catch (e) {}
  }

  // ---- 5. Control: fresh repay opener unblocked — speaks the opener. ----
  T.section('5. Control — fresh repay opener speaks the opener (good flow)');
  f = fresh();
  repDef = findRepayDef(f.speaking);
  T.ok('found the repay def via a donor villager', !!repDef, repDef && ('donor=' + repDef.donor));
  if (repDef) {
    const vid = pickTestVid(f.speaking, repDef.donor);
    T.ok('picked a test villager (not the donor)', !!vid, 'vid=' + vid);
    T.ok('opened a sitting on the test villager', openVid(vid));
    const favor = makeFavor(vid, 'fulfilled', 'the food I needed');
    const c = convo(vid);
    c.want = { id: 'repay', def: repDef.def, favor, stage: 0, fromSeed: false, seedFavorId: favor.id };
    T.ok('the opener line is NOT run-blocked', Game.convoWouldBlock(vid, REPAY_OPENER) === false);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 80));
    T.ok('the turn speaks the opener', turn.text.indexOf('You came through on the food I needed') !== -1, 'text=' + turn.text.slice(0, 140));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
