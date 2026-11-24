#!/usr/bin/env node
'use strict';
// Proof: the warn_you first-heed warning must restate once per sitting
// (journey-establishment r277, 2026-11-24).
//
// Finding (r277 panel, live — seed 109014 d36 Ursula; seed 109015 d26 and
// d42 Naran): three warn_you sittings engaged via dlg:heed and heard a
// content-free generic ack ("Promise me that. Please." / "Thank you. I
// needed to hear you say it.") with no danger named, and no warnLog
// delivery that day. The warning HAD been delivered by the same villager
// on an earlier day (Ursula d31, twice; Naran d22) — so this is not the
// r150 shape of a player never told what to be careful about — but it
// IS a defect in the r150 fix itself: the r150 comment promises the NPC
// "states the warning on the first heed, once per sitting", yet
// c._warnDelivered (convo-dialogue.js dlg:heed / dlg:details) lives on
// the per-villager persistent conversation object (conversation.js
// convoGet: state.village.conv[vid], created once, never reset between
// sittings) and is set in two places and reset in NONE — so it latches
// forever after the first delivery and every later sitting's first heed
// falls back to the generic 3-line ack pool. The warn_you want
// re-surfacing in a new sitting means the villager has something to warn
// about again; answering a fresh warning want with an ack names no
// danger for THIS sitting's warning. The 9-10-variant warning pool
// (convoWantWarning, rotation cursor) still has unserved variants, so
// the warning COULD have been stated — only the latch blocked it.
//
// Fix (game code, this run): reset c._warnDelivered in startConvo
// (conversation.js), alongside the other per-sitting flags (rumorDone,
// _interpThanks, nvLastGesture). Within-sitting behaviour is unchanged:
// details-then-heed in one sitting still does not double-deliver, and
// heeds 2-3 in one sitting still ack (r140/r150 shape, re-proven by
// test-warnheed-deepen-r274.js).
//
// This test proves, on the live handler, across TWO sittings with the
// same speaker:
//  (1) sitting 1 heed 1 states the warning (r150, warnLog +1);
//  (2) after endConvo + a fresh startConvo, _warnDelivered is false
//      again (the fix) and sitting 2 heed 1 states a warning too
//      (warnLog +1, a DIFFERENT variant — the cursor advanced — not an
//      ack line);
//  (3) within sitting 2, heed 2 is still an ack (no double-delivery
//      in one sitting — the r150 guard intact).
// Staging follows test-warnheed-deepen-r274.js (seed 1175,
// recentAttacks=1 + trust 50, natural warn_you speaker). Uses the shared
// harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const ACK = [
  '"Good. I mean it — watch yourself out there."',
  '"Promise me that. Please."',
  '"Thank you. I needed to hear you say it."',
];

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 1175 });
  K.newRun(Game);

  // The driver's warnLog instrument, replicated verbatim: wrap
  // Game.convoWantWarning, log every truthy return.
  const warnLog = [];
  if (typeof Game.convoWantWarning === 'function') {
    const _warn = Game.convoWantWarning.bind(Game);
    Game.convoWantWarning = function (vid) {
      const out = _warn.apply(this, arguments);
      try { if (out) warnLog.push({ vid: String(vid), lineStart: String(out).slice(0, 120) }); } catch (e) {}
      return out;
    };
  }

  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const commAble = roster.filter(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  });
  v.trust = v.trust || {};
  for (const id of commAble) { try { v.trust[id] = 50; } catch (e) {} }
  v.recentAttacks = 1;

  let speaker = null, warnDef = null;
  for (const id of commAble) {
    try {
      const w = Game.convoSelectWant(id);
      if (w && w.id === 'warn_you') { speaker = id; warnDef = w.def; break; }
    } catch (e) {}
  }
  check('a villager naturally picks warn_you with recent attacks', !!speaker,
    `commAble=${commAble.length}`);
  if (!speaker) { console.log(`\n=== RESULT: ${pass} pass, 1 fail ===`); process.exit(1); }
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  function hangWarn() {
    const c = Game.convoGet(speaker);
    if (!c.want || c.want.id !== 'warn_you') {
      c.want = { id: 'warn_you', def: warnDef, stage: 1 };
      console.log('[probe] want re-hung to warn_you stage 1');
    }
    try { c.budget = 20; } catch (e) {}
    return c;
  }
  function driveAns() {
    for (let t = 0; t < 4; t++) {
      let choices = [];
      try { choices = Game.convoChoices(speaker) || []; } catch (e) { break; }
      const ans = (choices || []).find(ch => ch && ch.id && ch.id.indexOf('ans:') === 0);
      if (!ans) break;
      const r = Game.convoTurn(speaker, ans.id);
      if (r.ended) break;
    }
  }
  function pressHeed() {
    let choices = [];
    try { choices = Game.convoChoices(speaker) || []; } catch (e) { return null; }
    const heed = (choices || []).find(ch => ch && ch.id === 'dlg:heed');
    if (!heed) return null;
    const r = Game.convoTurn(speaker, 'dlg:heed');
    return String((r && r.line) || '');
  }

  // ---- Sitting 1 ----
  const opened1 = Game.startConvo(speaker);
  check('sitting 1 opens', !!opened1 && !opened1.refused && !opened1.ended);
  const c1 = hangWarn();
  check('sitting 1 want is warn_you stage 1', c1.want.id === 'warn_you' && (c1.want.stage || 0) === 1,
    `want=${c1.want.id} stage=${c1.want.stage}`);
  driveAns();
  const warnBefore1 = warnLog.length;
  const line1 = pressHeed();
  check('sitting 1 heed 1 is offered', line1 !== null);
  check('sitting 1 heed 1 states the warning (r150), not an ack',
    line1 !== null && !ACK.includes(line1),
    `line1=${(line1 || '').slice(0, 100)}`);
  check('sitting 1 heed 1 delivered via convoWantWarning (warnLog +1)',
    warnLog.length === warnBefore1 + 1, `warnLog=${warnLog.length} before=${warnBefore1}`);
  check('sitting 1 sets _warnDelivered', Game.convoGet(speaker)._warnDelivered === true);
  console.log(`sitting 1 heed 1: ${String(line1).slice(0, 100)}`);
  try { Game.endConvo(speaker, 'left'); } catch (e) {}

  // ---- Sitting 2 (fresh startConvo, same speaker, warn_you again) ----
  const opened2 = Game.startConvo(speaker);
  check('sitting 2 opens', !!opened2 && !opened2.refused && !opened2.ended);
  const c2pre = Game.convoGet(speaker);
  check('fresh sitting resets _warnDelivered (the fix)',
    c2pre._warnDelivered === false || c2pre._warnDelivered === undefined,
    `_warnDelivered=${c2pre._warnDelivered}`);
  const c2 = hangWarn();
  check('sitting 2 want is warn_you stage 1', c2.want.id === 'warn_you' && (c2.want.stage || 0) === 1,
    `want=${c2.want.id} stage=${c2.want.stage}`);
  driveAns();
  const warnBefore2 = warnLog.length;
  const line2 = pressHeed();
  check('sitting 2 heed 1 is offered', line2 !== null);
  check('sitting 2 heed 1 states the warning again (once per sitting), not an ack',
    line2 !== null && !ACK.includes(line2),
    `line2=${(line2 || '').slice(0, 100)}`);
  check('sitting 2 heed 1 delivered via convoWantWarning (warnLog +1)',
    warnLog.length === warnBefore2 + 1, `warnLog=${warnLog.length} before=${warnBefore2}`);
  check('sitting 2 warning is a different variant than sitting 1 (cursor advanced)',
    line2 !== null && line1 !== null && line2 !== line1,
    `line1=${String(line1).slice(0, 60)} line2=${String(line2).slice(0, 60)}`);
  console.log(`sitting 2 heed 1: ${String(line2).slice(0, 100)}`);

  // ---- (3) Within sitting 2, heed 2 still acks (no double-delivery) ----
  const warnBefore2b = warnLog.length;
  const line2b = pressHeed();
  if (line2b !== null) {
    check('sitting 2 heed 2 is an ack (no double-delivery in one sitting)',
      ACK.includes(line2b), `line2b=${line2b.slice(0, 100)}`);
    check('sitting 2 heed 2 adds no warnLog entry',
      warnLog.length === warnBefore2b, `warnLog=${warnLog.length} before=${warnBefore2b}`);
  } else {
    console.log('[probe] sitting 2 heed 2 not offered (want resolved) — within-sitting guard untestable here, skipping');
  }

  try { Game.endConvo(speaker, 'left'); } catch (e) {}
  console.log(`\n=== RESULT: ${pass} pass ===`);
  process.exit(0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
