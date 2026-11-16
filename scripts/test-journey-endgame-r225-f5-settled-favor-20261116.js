#!/usr/bin/env node
// test-journey-endgame-r225-f5-settled-favor-20261116.js — proof test for
// the r225 F5 fix (journey-endgame r225; filed in journey-succession r224).
//
// THE DEFECT (r224 panel, seed 34301 d105, Farid, trust 90): the SETTLED
// FAVOR branch (conversation.js, journey establishment r7) returns ONE
// fixed line — "No, really — it's handled. Thanks for asking, though." —
// with no variants and no ledger guard. Farid said the favor was handled,
// the player asked again what he needs, and Farid blanked ("...Sorry,
// lost my train of thought."). The 48-entry run ledger blocks the
// singleton on the re-ask, and the STAGE-0 guard's rungs all miss for a
// settled favor (convoFavorFollowup returns null for thanked/moot/
// acknowledged; the need line was already spoken; no whyLine), so the
// blocked singleton stands and sayLine dries.
//
// THE FIX: three honest variants via convoPickCycle (key
// 'settledfavor:handled', F4c class) + fallback to the original line.
// The cycle skips the ledger-blocked variant and speaks a fresh phrasing;
// the turn never dries or deflects on a re-ask.
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib):
//   1. ledger-blocked-picks-fresh (the r224 shape): poison the singleton
//      AND the favor's need line in a prior sitting, then ask alive:want
//      once in a fresh sitting. Fixed: speaks a DIFFERENT handled
//      variant (never the poisoned one, never dry). Unfixed: dries.
//   2. repeat-varies: poison only the need line, then ask alive:want
//      twice in one sitting. Fixed: the two turns speak DIFFERENT
//      handled variants, neither dry nor a self-repeat deflection.
//      Unfixed: turn 1 is the singleton, turn 2 is the self-repeat
//      deflection pool ("I just said...") — not a handled variant.
//   3. control: fresh state, one ask — speaks a handled variant, never
//      dry (the good flow, preserved — GREEN on both engines).
//
// Usage: node scripts/test-journey-endgame-r225-f5-settled-favor-20261116.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-endgame-r225-f5-settled-favor');

const SINGLETON = '"No, really — it\'s handled. Thanks for asking, though."';
const VARIANTS = [
  SINGLETON,
  '"It\'s taken care of, I swear. You don\'t need to worry about that one anymore."',
  '"Honestly? It\'s done. Finished. Thank you for checking — it means something that you did."',
];
const MARKERS = ["it's handled", 'taken care of', "It's done"];
const SHORT = 'spare food for the little ones';
const NEED_LINE = '"I need help with ' + SHORT + '."'; // convoFavorNeedLine(vid, fav, still=false)
const DRY_MARK = 'lost my train of thought';

function isHandled(text) { return MARKERS.some(m => text.indexOf(m) !== -1); }

(async () => {
  const Game = await K.load({ seed: 225100 });

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
  function openAny(speaking) {
    for (const vid of speaking) {
      try {
        const opened = Game.talkTo(vid);
        if (!opened) continue;
        const c = convo(vid);
        if (c && c.active) return vid;
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) { /* try the next villager */ }
    }
    return null;
  }
  // speakInPriorSitting: open a sitting, speak the line once (it lands in
  // the 48-entry run ledger), close. Only the ledger entry carries over —
  // exactly the Farid shape (handled line spoken earlier, blocked now).
  function poison(speaking, line) {
    const vid = openAny(speaking);
    if (!vid) return false;
    let said = null;
    try { said = Game.sayLine(vid, line); } catch (e) { said = null; }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return !!said;
  }
  function stageSettledFavor(vid) {
    const favor = { vid, id: 'favor-f5-test', kind: 'food_share', state: 'thanked', askedDay: day(), short: SHORT };
    try { Game.convoStoreFavor(favor); } catch (e) {}
    const c = convo(vid);
    c.want = { id: 'ask_favor', favor, stage: 0, fromSeed: false };
    return favor;
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

  // ---- 1. The defect: singleton + need line poisoned — the re-ask must
  // speak a FRESH handled variant, never the dry line. ----
  T.section('1. Ledger-blocked settled favor — re-ask speaks a fresh variant (Farid d105)');
  let f = fresh();
  T.ok('prior sitting poisoned the singleton', poison(f.speaking, SINGLETON));
  T.ok('prior sitting poisoned the need line', poison(f.speaking, NEED_LINE));
  let vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageSettledFavor(vid);
    T.ok('the singleton IS run-blocked for this villager', Game.convoWouldBlock(vid, SINGLETON) === true);
    T.ok('the need line IS run-blocked for this villager', Game.convoWouldBlock(vid, NEED_LINE) === true);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 80));
    T.ok('the turn speaks a handled variant', isHandled(turn.text), 'text=' + turn.text.slice(0, 120));
    T.ok('the turn does NOT speak the poisoned singleton', turn.text.indexOf("it's handled") === -1, 'text=' + turn.text.slice(0, 120));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. Repeat within one sitting — the two asks must vary. ----
  T.section('2. Settled favor asked twice in one sitting — variants differ, no deflection');
  f = fresh();
  T.ok('prior sitting poisoned the need line (guard rung blocked)', poison(f.speaking, NEED_LINE));
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageSettledFavor(vid);
    const t1 = askWant(vid);
    T.ok('turn 1 ran', !!t1.res && typeof t1.res === 'object', 'res=' + String(t1.res && t1.res.line || t1.res).slice(0, 80));
    T.ok('turn 1 speaks a handled variant', isHandled(t1.text), 'text=' + t1.text.slice(0, 120));
    T.ok('turn 1 does NOT dry', t1.text.indexOf(DRY_MARK) === -1, 'text=' + t1.text.slice(0, 120));
    const t2 = askWant(vid);
    T.ok('turn 2 ran', !!t2.res && typeof t2.res === 'object', 'res=' + String(t2.res && t2.res.line || t2.res).slice(0, 80));
    T.ok('turn 2 speaks a handled variant', isHandled(t2.text), 'text=' + t2.text.slice(0, 120));
    T.ok('turn 2 does NOT dry', t2.text.indexOf(DRY_MARK) === -1, 'text=' + t2.text.slice(0, 120));
    T.ok('turn 2 differs from turn 1 (variants cycle)', t2.text !== t1.text, 't1=' + t1.text.slice(0, 60) + ' | t2=' + t2.text.slice(0, 60));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Control: fresh state, one ask — the good flow, preserved. ----
  T.section('3. Settled favor asked once, fresh — speaks a handled variant (good flow)');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageSettledFavor(vid);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 80));
    T.ok('the turn speaks a handled variant', isHandled(turn.text), 'text=' + turn.text.slice(0, 120));
    T.ok('the turn does NOT dry', turn.text.indexOf(DRY_MARK) === -1, 'text=' + turn.text.slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
