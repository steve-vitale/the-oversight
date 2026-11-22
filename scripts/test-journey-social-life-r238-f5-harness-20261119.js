#!/usr/bin/env node
// test-journey-social-life-r238-f5-harness-20261119.js — F5 TARGETED HARNESS
// (journey-social-life r238; the settled-favor site, owed since r231).
//
// THE SITE (r225, src/js/conversation.js ~7330-7360): when a settled favor
// (state moot / thanked / acknowledged / fulfilled) is re-asked, the
// settled-favor branch serves one of three variants via convoPickCycle +
// the r226 F6 guard (try each variant until one is fresh; all three
// blocked keeps the pick — the known residual, characterized here, NOT
// judged):
//   V1: "No, really — it's handled: spare food for the little ones. Thanks
//       for asking, though."
//   V2: "Spare food for the little ones — it's taken care of, I swear. You
//       don't need to worry about it anymore."
//   V3: "Honestly? It's done — spare food for the little ones. Finished.
//       Thank you for checking — it means something that you did."
// (r266: the variants above are the NAMED pool — the harness stages favors
// with a speakable short, so the game serves these, not the generic pool.
// The r238 cores matched only the generic pool, so every named serving
// read variant=null; the r238 poisoning used the generic strings, which
// cannot block the named variants. Both are fixed here: shape-based
// detection + poison by variant slot. The generic pool is covered by the
// r152 named test (shortless favor) and the r225 F5 test.)
//
// THE GAP: wild counts by grep were r231: 1, r234: 3, r235: 0, r236: 0,
// r237: NOT COUNTED — six thin panels. The wild panel never produced a
// serving distribution, never showed a blocked variant being skipped, and
// never showed the all-3-blocked residual firing. This harness stages the
// site directly (godpath-lib pattern, modeled on the r226 F6 proof):
// poison variants through ANOTHER villager's sitting (cross-villager run
// ledger, never the test villager's own said lists), then re-ask in a
// fresh sitting.
//
// CASES (prereg: evidence/2026-11-19/journey-social-life-r238-prereg.md):
//   1. FRESH-ALL: ask a fresh settled favor 3x across fresh sittings —
//      all three variants serve, 0 dry.
//   2. ONE-BLOCKED: poison V1, re-ask — serves V2 or V3, never V1, 0 dry.
//   3. TWO-BLOCKED: poison V1+V2, re-ask — serves V3 (r226 case 4
//      re-proven as the harness's core case), 0 dry.
//   4. ALL3-BLOCKED (characterized, not pass/fail): poison V1+V2+V3,
//      re-ask — record exactly what serves and the dry count.
//   5. CROSS-VILLAGER: poison V1 through A, ask B twice across two
//      sittings — B skips V1 both times and never dries.
//   6. REPEAT-ASK EXHAUSTION (characterized, not pass/fail): ask the
//      same settled favor 6x in rapid succession — record the serving
//      sequence; the 48-entry ledger holds all three variants after
//      three servings, so asks 4+ are expected to hit the residual.
//
// STAGING NOTE (r226 pattern): the settled favor + want are staged AFTER
// opening the test sitting (opening a sitting on a favor villager can
// consume the favor), and poisoning always happens BEFORE opening the
// test sitting.
// Usage: node scripts/test-journey-social-life-r238-f5-harness-20261119.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r238-f5-harness');

const DRY_MARK = 'lost my train of thought';
// r266 (r152 fallout): poison + detect by VARIANT SLOT in the NAMED pool —
// the staged short interpolates between the core words, so the generic
// strings below could neither be matched nor poisoned. Detection is
// shape-based (r265 analyzer F5W cores): V1 = "it's handled" + "Thanks
// for asking"; V2 = case-insensitive "taken care of, i swear"; V3 =
// "Finished. Thank you for checking".
const F5_SHORT = 'spare food for the little ones';
const F5_VARIANTS = [
  `"No, really — it's handled: ${F5_SHORT}. Thanks for asking, though."`,
  `"Spare food for the little ones — it's taken care of, I swear. You don't need to worry about it anymore."`,
  `"Honestly? It's done — ${F5_SHORT}. Finished. Thank you for checking — it means something that you did."`,
];

(async () => {
  const Game = await K.load({ seed: 238100 });

  function fresh() {
    K.newRun(Game);
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const speaking = others.filter(vid => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 2) throw new Error('fresh run needs >= 2 speaking non-scholar roster members, got ' + speaking.length);
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
  function stageSettledFavor(vid, tag) {
    const favor = { vid, id: 'favor-f5-' + tag + '-' + vid + '-' + day(), kind: 'food_share', state: 'thanked', askedDay: day(), short: F5_SHORT };
    try { Game.convoStoreFavor(favor); } catch (e) {}
    const c = convo(vid);
    c.want = { id: 'ask_favor', favor, stage: 0, fromSeed: false };
    return favor;
  }
  function askWant(vid) {
    const before = transcriptLen(vid);
    let res = null;
    try { res = Game.convoTurn(vid, 'alive:want'); } catch (e) { res = 'ERR:' + (e && e.message); }
    const lines = themLinesSince(vid, before);
    return { res, text: lines.join(' ') };
  }
  // r266: shape-based detection (F5W cores) — matches the named pool the
  // game actually serves, and the generic pool too.
  function whichVariant(text) {
    if (!text) return null;
    if (text.indexOf('Finished. Thank you for checking') !== -1) return 'V3';
    if (text.toLowerCase().indexOf('taken care of, i swear') !== -1) return 'V2';
    if (text.indexOf("it's handled") !== -1 && text.indexOf('Thanks for asking') !== -1) return 'V1';
    return null;
  }
  function endSitting(vid) { try { Game.endConvo(vid, 'left'); } catch (e) {} }

  // ---- 1. Fresh — all three variants serve across three sittings. ----
  T.section('1. FRESH-ALL — three fresh sittings serve all three variants, 0 dry');
  let f = fresh();
  const vid1 = f.speaking[0];
  T.ok('picked a test villager', !!vid1, 'vid=' + vid1);
  const served1 = [];
  let dry1 = 0;
  for (let i = 0; i < 3; i++) {
    T.ok('opened sitting ' + (i + 1), openVid(vid1));
    stageSettledFavor(vid1, 'fresh-' + i);
    const turn = askWant(vid1);
    const v = whichVariant(turn.text);
    served1.push(v);
    if (turn.text.indexOf(DRY_MARK) !== -1) dry1++;
    T.ok('sitting ' + (i + 1) + ' ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 60));
    endSitting(vid1);
  }
  T.ok('all three variants served', new Set(served1).size === 3, 'served=' + JSON.stringify(served1));
  T.ok('0 dry across the three sittings', dry1 === 0, 'dry=' + dry1);

  // ---- 2. One blocked — serves a fresh variant, never the blocked one. ----
  T.section('2. ONE-BLOCKED — V1 poisoned, re-ask serves V2 or V3, 0 dry');
  f = fresh();
  const vid2 = f.speaking[0];
  T.ok('picked a test villager', !!vid2, 'vid=' + vid2);
  T.ok('poisoned V1 through another villager', poisonOther(f.speaking, vid2, F5_VARIANTS[0]));
  T.ok('V1 IS run-blocked for this villager', Game.convoWouldBlock(vid2, F5_VARIANTS[0]) === true);
  T.ok('opened a sitting on the test villager', openVid(vid2));
  stageSettledFavor(vid2, 'oneblocked');
  const turn2 = askWant(vid2);
  const v2 = whichVariant(turn2.text);
  T.ok('the turn ran', !!turn2.res && typeof turn2.res === 'object', 'res=' + String(turn2.res && turn2.res.line || turn2.res).slice(0, 60));
  T.ok('the turn serves a fresh variant (V2 or V3)', v2 === 'V2' || v2 === 'V3', 'variant=' + v2 + ' text=' + turn2.text.slice(0, 140));
  T.ok('the turn does NOT repeat blocked V1', whichVariant(turn2.text) !== 'V1', 'variant=' + whichVariant(turn2.text) + ' text=' + turn2.text.slice(0, 140));
  T.ok('the turn does NOT dry', turn2.text.indexOf(DRY_MARK) === -1, 'text=' + turn2.text.slice(0, 140));
  endSitting(vid2);

  // ---- 3. Two blocked — serves the third (r226 case 4, re-proven). ----
  T.section('3. TWO-BLOCKED — V1+V2 poisoned, re-ask speaks V3, 0 dry');
  f = fresh();
  const vid3 = f.speaking[0];
  T.ok('picked a test villager', !!vid3, 'vid=' + vid3);
  T.ok('poisoned V1 through another villager', poisonOther(f.speaking, vid3, F5_VARIANTS[0]));
  T.ok('poisoned V2 through another villager', poisonOther(f.speaking, vid3, F5_VARIANTS[1]));
  T.ok('V1+V2 ARE run-blocked', Game.convoWouldBlock(vid3, F5_VARIANTS[0]) === true && Game.convoWouldBlock(vid3, F5_VARIANTS[1]) === true);
  T.ok('V3 is NOT run-blocked', Game.convoWouldBlock(vid3, F5_VARIANTS[2]) === false);
  T.ok('opened a sitting on the test villager', openVid(vid3));
  stageSettledFavor(vid3, 'twoblocked');
  const turn3 = askWant(vid3);
  T.ok('the turn ran', !!turn3.res && typeof turn3.res === 'object', 'res=' + String(turn3.res && turn3.res.line || turn3.res).slice(0, 60));
  T.ok('the turn speaks V3', whichVariant(turn3.text) === 'V3', 'variant=' + whichVariant(turn3.text) + ' text=' + turn3.text.slice(0, 140));
  T.ok('the turn does NOT dry', turn3.text.indexOf(DRY_MARK) === -1, 'text=' + turn3.text.slice(0, 140));
  endSitting(vid3);

  // ---- 4. All three blocked — CHARACTERIZED, not judged. ----
  T.section('4. ALL3-BLOCKED — characterized: what serves when no variant is fresh?');
  f = fresh();
  const vid4 = f.speaking[0];
  T.ok('picked a test villager', !!vid4, 'vid=' + vid4);
  T.ok('poisoned V1 through another villager', poisonOther(f.speaking, vid4, F5_VARIANTS[0]));
  T.ok('poisoned V2 through another villager', poisonOther(f.speaking, vid4, F5_VARIANTS[1]));
  T.ok('poisoned V3 through another villager', poisonOther(f.speaking, vid4, F5_VARIANTS[2]));
  T.ok('all three ARE run-blocked', F5_VARIANTS.every(v => Game.convoWouldBlock(vid4, v) === true));
  T.ok('opened a sitting on the test villager', openVid(vid4));
  stageSettledFavor(vid4, 'all3blocked');
  const turn4 = askWant(vid4);
  const v4 = whichVariant(turn4.text);
  const dry4 = turn4.text.indexOf(DRY_MARK) !== -1;
  T.ok('the turn ran', !!turn4.res && typeof turn4.res === 'object', 'res=' + String(turn4.res && turn4.res.line || turn4.res).slice(0, 60));
  // Record-only: no pass/fail on the served variant or the dry line here.
  console.log('  [ALL3-OUTCOME] variant=' + v4 + ' dry=' + dry4 + ' text=' + turn4.text.slice(0, 200));
  endSitting(vid4);

  // ---- 5. Cross-villager — B skips A's poisoned variant across sittings. ----
  T.section('5. CROSS-VILLAGER — V1 poisoned via A, B asks twice, skips V1 both times, 0 dry');
  f = fresh();
  const vidB = f.speaking[0];
  T.ok('picked test villager B', !!vidB, 'vid=' + vidB);
  T.ok('poisoned V1 through another villager (A)', poisonOther(f.speaking, vidB, F5_VARIANTS[0]));
  T.ok('V1 IS run-blocked for B', Game.convoWouldBlock(vidB, F5_VARIANTS[0]) === true);
  const servedB = [];
  let dryB = 0;
  for (let i = 0; i < 2; i++) {
    T.ok('opened sitting ' + (i + 1) + ' on B', openVid(vidB));
    stageSettledFavor(vidB, 'cross-' + i);
    const turn = askWant(vidB);
    const v = whichVariant(turn.text);
    servedB.push(v);
    if (turn.text.indexOf(DRY_MARK) !== -1) dryB++;
    T.ok('sitting ' + (i + 1) + ' ran', !!turn.res && typeof turn.res === 'object', 'res=' + String(turn.res && turn.res.line || turn.res).slice(0, 60));
    endSitting(vidB);
  }
  T.ok('B never served the ledger-blocked V1', servedB.indexOf('V1') === -1, 'served=' + JSON.stringify(servedB));
  T.ok('B served two DISTINCT fresh variants', new Set(servedB).size === 2, 'served=' + JSON.stringify(servedB));
  T.ok('0 dry across both sittings', dryB === 0, 'dry=' + dryB);

  // ---- 6. Repeat-ask exhaustion — CHARACTERIZED, not judged. ----
  T.section('6. REPEAT-ASK EXHAUSTION — characterized: six rapid re-asks of one settled favor');
  f = fresh();
  const vid6 = f.speaking[0];
  T.ok('picked a test villager', !!vid6, 'vid=' + vid6);
  const seq6 = [];
  for (let i = 0; i < 6; i++) {
    T.ok('opened sitting ' + (i + 1), openVid(vid6));
    stageSettledFavor(vid6, 'exhaust-' + i);
    const turn = askWant(vid6);
    seq6.push((whichVariant(turn.text) || (turn.text.indexOf(DRY_MARK) !== -1 ? 'DRY' : 'OTHER')));
    endSitting(vid6);
  }
  // Record-only: the exhaustion point is the measurement.
  console.log('  [EXHAUSTION] sequence=' + JSON.stringify(seq6) + ' dryCount=' + seq6.filter(x => x === 'DRY').length);

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
