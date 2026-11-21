#!/usr/bin/env node
// test-settled-reask-names-favor-r152-20261121.js — PROOF for journey-landing r152:
// re-asking "Is there something you need?" about a SETTLED favor must name
// the favor, not answer "that one" with no antecedent.
//
// PANEL-CAUGHT (r152, seed 1332 d16, Onni): the favor was settled before
// the sitting; the player re-asks the ask_favor want and hears "It's taken
// care of, I swear. You don't need to worry about that one anymore." —
// "that one" names nothing. The r247 fix covered the dlg:help settled
// branch (convo-dialogue.js — "It's already handled — the food I needed");
// this is the sibling re-ask branch, the handledPool in conversation.js
// (r7/r225-F5), whose three variants are all generic by design. The r152
// prereg's settled-help watch requires every settled-favor help topic to
// name the favor's short; the re-ask path is the one live case that
// doesn't.
//
// FIX (conversation.js): when the settled favor carries a speakable short
// (a phrase with a space — the r247 rule; a bare kind id is never spoken),
// the handled variants name it; otherwise the generic pool stands.
//
// RED: pre-fix -> the re-ask line contains no favor short.
// GREEN: fix -> the re-ask line names the favor's short.
//
// PROOF SHAPE: clones the r225-F5 staging (godpath lib): plant a settled
// favor with a known short, ask alive:want once in a fresh sitting.
// Part 2 repeats the ask to prove the cycle still varies (F5 invariant);
// Part 3 proves a shortless favor still speaks the generic pool with no
// kind id (r247 Part C rule).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-landing-r152-settled-reask-names-favor');

const SHORT = 'spare food for the little ones';
const GENERIC = [
  '"No, really — it\'s handled. Thanks for asking, though."',
  '"It\'s taken care of, I swear. You don\'t need to worry about that one anymore."',
  '"Honestly? It\'s done. Finished. Thank you for checking — it means something that you did."',
];

(async () => {
  const Game = await K.load({ seed: 152100 });

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
  function stageSettledFavor(vid, short) {
    const favor = { vid, id: 'favor-r152-test', kind: 'food_share', state: 'thanked', askedDay: day() };
    if (short !== undefined) favor.short = short;
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

  // ---- 1. Core: settled favor with a known short — the re-ask names it. ----
  T.section('1. Settled favor re-asked — the answer names the favor short');
  let f = fresh();
  let vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageSettledFavor(vid, SHORT);
    const turn = askWant(vid);
    T.ok('the turn ran', !!turn.res && typeof turn.res === 'object',
      'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 80));
    T.ok('the re-ask NAMES the favor short', turn.text.toLowerCase().indexOf(SHORT) !== -1, 'text=' + turn.text.slice(0, 160));
    T.ok('the re-ask does NOT say the nameless "that one anymore"',
      turn.text.indexOf('that one anymore') === -1, 'text=' + turn.text.slice(0, 160));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. The cycle still varies (F5 invariant): two asks differ. ----
  T.section('2. Settled favor asked twice — variants still differ, both name the favor');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageSettledFavor(vid, SHORT);
    const t1 = askWant(vid);
    const t2 = askWant(vid);
    T.ok('turn 1 names the favor', t1.text.toLowerCase().indexOf(SHORT) !== -1, 't1=' + t1.text.slice(0, 120));
    T.ok('turn 2 names the favor', t2.text.toLowerCase().indexOf(SHORT) !== -1, 't2=' + t2.text.slice(0, 120));
    T.ok('turn 2 differs from turn 1 (variants cycle)', t2.text !== t1.text,
      't1=' + t1.text.slice(0, 60) + ' | t2=' + t2.text.slice(0, 60));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Shortless favor — generic pool, no kind id (r247 Part C rule). ----
  T.section('3. Shortless settled favor — generic pool stands, no kind id spoken');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageSettledFavor(vid, undefined); // kind food_share, NO short
    const turn = askWant(vid);
    const isGeneric = GENERIC.some(g => turn.text.indexOf(g.replace(/"/g, '')) !== -1) ||
      /handled|taken care of|It's done/i.test(turn.text);
    T.ok('the turn speaks a generic handled variant', isGeneric, 'text=' + turn.text.slice(0, 160));
    T.ok('no kind id is spoken', turn.text.indexOf('food_share') === -1, 'text=' + turn.text.slice(0, 160));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
