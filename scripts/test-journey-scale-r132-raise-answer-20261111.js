#!/usr/bin/env node
// test-journey-scale-r132-raise-answer-20261111.js — proof test for the
// journey-scale r132 raise-answer template fix (lane A, leg 3).
//
// THE DEFECT (r131 Q4, carried; seed 131102 d120, Claudete, outcome
// counter — evidence/2026-11-11/journey-scale-r131/
// journey-scale-r131-raisetalk-131102-2.txt):
//   THEM: "Never mind the food I needed — we got it handled. Thanks
//     anyway. The pantry's nearly bare. Forage with me tomorrow? I know
//     the creek bend, past the treeline."
//   YOU: "All right. Let's ask them."
//   THEM: "All right — let's ask them." You carry the proposal to The
//     Bloodied II.
// The NPC asked to forage tomorrow; the player answered "let's ask
// them" and carried a link proposal to a village never mentioned in the
// sitting. The link-raise line was NEVER spoken in that sitting.
//
// MECHANISM (read in code): `bond-initiation.js bondChoices` prepends
// `link:accept`/`link:decline` to EVERY menu in the sitting whenever a
// link raise is pending — unconditional on what the NPC just said.
// `conversation.js startConvo` speaks the pending raise as its own beat
// ("the player is never asked to accept or decline something they were
// never asked", INVITATION HONESTY r7) — BUT when the opener owns the
// reply (`openerOwnsReply`: the opener asked a question, e.g. the forage
// want line, thread 'want' stage < 3), the raise is HELD in
// `c.linkPending` for the continuer instead of spoken. The menu still
// offers `link:accept` on turn 1, and the linkraise policy ("picks
// link:accept when it is offered", `competent-linkdrive-b.js
// answerRaiseInConversation`) takes it immediately — answering the
// forage ask with the link line. Canon (`docs/CONVERSATIONS.md`):
// "Replies belong to the spoken exchange. A question, invitation, price
// or live request owns its decision menu."
//
// THE FIX (one task, one commit): per-sitting "ask spoken" flags on the
// convo record, gated in `bondChoices`:
//   1. `convo-beats.js convoRecordSpokenBeat`: tag 'linkraise' sets
//      `c.linkRaiseSpoken`; tag 'bondproposal' sets `c.bondProposalSpoken`.
//      The single choke point every speaking path funnels through
//      (`sayLine` records via it; `recordStagedBeat` calls it directly;
//      the goon speaks held beats through `sayLine` with the tag).
//      A queued-but-unspoken beat sets no flag — queuing is not hearing.
//   2. `conversation.js startConvo`: both flags reset alongside
//      `c.spokenBeat = null` (per-sitting, like the other sitting ledgers).
//   3. `bond-initiation.js bondChoices`: `link:accept`/`link:decline`
//      only when the pending raise exists AND `c.linkRaiseSpoken`;
//      `bond:accept`/`bond:decline` only when the pending proposal
//      exists AND `c.bondProposalSpoken`. Fail-open with no convo record;
//      fail-closed with a record whose ask was not spoken this sitting.
//   No demand, number, bar, or line changes; the raise stays pending
//   (3-day expiry, re-spoken next sitting) when the player answers
//   something else first.
//
// PROOF SHAPE: a pending raise (or bond proposal) staged mid-sitting —
// the ask is pending but was never spoken this sitting — must offer NO
// link:/bond: choice (RED before the fix, GREEN after). Every path that
// DOES speak the ask (sayLine with the tag, recordStagedBeat, the goon
// speaking the held beat) must then offer the choice (GREEN both
// engines — the good flow is preserved, not just un-broken).
//
// Usage: node scripts/test-journey-scale-r132-raise-answer-20261111.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-scale-r132-raise-answer');

const VILLAGE_A = 'village_test_a'; // Thornfield (fresh text per section)
const VILLAGE_B = 'village_test_b'; // Stonebridge (fresh text per section)

(async () => {
  const Game = await K.load({ seed: 132100 });

  // fresh(): a new expedition, departed, with a roster. Adds two fake
  // other-villages so linkRaiseLine names real villages, and returns the
  // speaking (shared-language) non-scholar roster villagers.
  function fresh() {
    K.newRun(Game);
    Game.state.otherVillages = Game.state.otherVillages || [];
    for (const [id, name] of [[VILLAGE_A, 'Thornfield'], [VILLAGE_B, 'Stonebridge']]) {
      if (!Game.state.otherVillages.some(v => v && v.id === id)) {
        Game.state.otherVillages.push({ id, name });
      }
    }
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const speaking = others.filter(vid => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 2) throw new Error('fresh run has <2 speaking non-scholar roster members: ' + JSON.stringify(roster));
    return { speaking, scholarId };
  }
  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  // stageRaise/stageBond mirror stageLinkRaise/stageBondProposal's state
  // writes exactly (bond-initiation.js), minus the talk request — the
  // defect shape is a pending ask with NO talk-request opener carrying
  // it (the request was delivered in an earlier sitting, or never
  // staged). The line is the verbatim ask the villager would speak.
  function stageRaise(vid, villageId, name) {
    const v = Game.state.village; v.linkRaises = v.linkRaises || {};
    v.linkRaises[vid] = { vid, villageId, day: day(), kind: 'link',
      line: '"I\'ve heard good things about ' + name + '. We should link with them — we\'d be stronger together."' };
  }
  function stageBond(vid) {
    const v = Game.state.village; v.bondRequests = v.bondRequests || {};
    v.bondRequests[vid] = { vid, day: day(), kind: 'bond',
      line: '"Can I ask you something? ... I want us to stick together. Properly. Watch each other\'s backs."' };
  }
  function bondMenu(vid) {
    try { return (Game.bondChoices(vid) || []).map(ch => ch && ch.id).filter(Boolean); } catch (e) { return ['ERR:' + (e && e.message)]; }
  }
  function fullMenu(vid) {
    try { return (Game.convoChoices(vid) || []).map(ch => ch && ch.id).filter(Boolean); } catch (e) { return ['ERR:' + (e && e.message)]; }
  }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function raiseSpoken(vid) { const c = convo(vid); return !!(c && c.linkRaiseSpoken); }
  function bondSpoken(vid) { const c = convo(vid); return !!(c && c.bondProposalSpoken); }
  // An opening that the menu-ownership filter would NOT strip link:/bond:
  // choices from anyway (no pendingQ/reactiveQ/genericQ, and not a
  // stage 1-2 want) — so the full-menu read is a fair test of the gate
  // itself, not of the filter. Returns the first qualifying villager.
  // (In a fresh run most openers own the reply — this often finds none;
  // the bondChoices-level assertions below do not need it.)
  function openUnfiltered(speaking) {
    for (const vid of speaking) {
      try {
        const opened = Game.talkTo(vid);
        if (!opened) continue;
        const c = convo(vid);
        if (!c || !c.active) continue;
        const owned = c.pendingQ || c.reactiveQ || c.genericQ ||
          (c.thread === 'want' && c.want && (c.want.stage || 0) > 0 && (c.want.stage || 0) < 3 &&
            !['curious', 'share_news', 'just_company'].includes(c.want.id));
        if (!owned) return vid;
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) { /* try the next villager */ }
    }
    return null;
  }
  // openAny: the first speaking villager whose talkTo opens a sitting,
  // whatever the opener owns. Enough for bondChoices-level assertions
  // (bondChoices is read directly, bypassing the menu-ownership filter).
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

  // ---- 1. The defect: pending raise, never spoken — no link:accept ----
  T.section('1. Pending raise, never spoken — the defect (r131 Claudete)');
  let f = fresh();
  // Part A (gate, always decisive): any open sitting, raise staged
  // mid-sitting — pending but never spoken this sitting (the flag can
  // only be set by a spoken ask, and none was pending at open).
  let vid = openAny(f.speaking);
  T.ok('opened a sitting to test the gate', !!vid, 'vid=' + vid);
  if (vid) {
    T.ok('no raise spoken at open (the ask was never heard this sitting)', !raiseSpoken(vid),
      'linkRaiseSpoken=' + raiseSpoken(vid));
    stageRaise(vid, VILLAGE_A, 'Thornfield');
    const bm = bondMenu(vid);
    T.ok('bondChoices offers NO link:accept while the raise is unspoken', bm.indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bm));
    T.ok('bondChoices offers NO link:decline while the raise is unspoken', bm.indexOf('link:decline') === -1,
      'bondChoices=' + JSON.stringify(bm));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  // Part B (full menu): same state, but only where the ownership filter
  // would not strip the choice anyway — otherwise the read is vacuous.
  // In a fresh run most openers own the reply, so this often skips.
  f = fresh();
  const vidU = openUnfiltered(f.speaking);
  if (vidU) {
    stageRaise(vidU, VILLAGE_A, 'Thornfield');
    const fm = fullMenu(vidU);
    T.ok('full menu offers NO link:accept while the raise is unspoken', fm.indexOf('link:accept') === -1,
      'convoChoices=' + JSON.stringify(fm));
    try { Game.endConvo(vidU, 'left'); } catch (e) {}
  } else {
    console.log('  (skip: no unfiltered opening for the full-menu read — gate proof is Part A)');
  }

  // ---- 2. Spoken via sayLine — the good flow, preserved ----
  T.section('2. Raise spoken via sayLine — the choice appears');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageRaise(vid, VILLAGE_A, 'Thornfield');
    T.ok('before speaking: no link:accept', bondMenu(vid).indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    let said = null;
    try { said = Game.sayLine(vid, '"I\'ve heard good things about Thornfield. We should link with them — we\'d be stronger together."', { tag: 'linkraise', linkBeat: true }); } catch (e) { said = 'ERR:' + (e && e.message); }
    T.ok('sayLine spoke the raise (not blocked)', !!said, 'said=' + String(said).slice(0, 60));
    T.ok('after speaking: linkRaiseSpoken is set', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
    T.ok('after speaking: bondChoices offers link:accept', bondMenu(vid).indexOf('link:accept') !== -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Opener-carried (recordStagedBeat) — the choice appears ----
  T.section('3. Raise recorded as the opener-carried ask — the choice appears');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageRaise(vid, VILLAGE_A, 'Thornfield');
    T.ok('before recording: no link:accept', bondMenu(vid).indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.convoRecordSpokenBeat(vid, '"I\'ve heard good things about Thornfield. We should link with them — we\'d be stronger together."', { tag: 'linkraise' }); } catch (e) { T.ok('recordStagedBeat path runs', false, 'ERR: ' + (e && e.message)); }
    T.ok('after recording: linkRaiseSpoken is set', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
    T.ok('after recording: bondChoices offers link:accept', bondMenu(vid).indexOf('link:accept') !== -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 4. Held beat, spoken by the goon — before/after ----
  T.section('4. Held raise, spoken by the continuer — before/after');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageRaise(vid, VILLAGE_B, 'Stonebridge');
    const c = convo(vid);
    // The engine's own hold shape (startConvo, openerOwnsReply): the beat
    // waits in heldBeats for the continuer. Fresh text so the run-ledger
    // cannot block it.
    c.heldBeats = c.heldBeats || [];
    c.heldBeats.push({ text: '"I\'ve heard good things about Stonebridge. We should link with them — we\'d be stronger together."', linkraise: true });
    T.ok('before the continuer: no link:accept', bondMenu(vid).indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    let res = null;
    try { res = Game.convoTurn(vid, 'goon'); } catch (e) { res = 'ERR:' + (e && e.message); }
    T.ok('goon turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 60) : String(res).slice(0, 60)));
    T.ok('after the continuer: linkRaiseSpoken is set', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
    T.ok('after the continuer: bondChoices offers link:accept', bondMenu(vid).indexOf('link:accept') !== -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 5. Bond mirror: proposal unspoken, then spoken ----
  T.section('5. Bond proposal mirror — withheld until spoken');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageBond(vid);
    T.ok('proposal pending but unspoken: no bond:accept', bondMenu(vid).indexOf('bond:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    T.ok('proposal pending but unspoken: no bond:decline', bondMenu(vid).indexOf('bond:decline') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.convoRecordSpokenBeat(vid, '"Can I ask you something? ... I want us to stick together. Properly. Watch each other\'s backs."', { tag: 'bondproposal' }); } catch (e) { T.ok('recordStagedBeat path runs', false, 'ERR: ' + (e && e.message)); }
    T.ok('after speaking: bondProposalSpoken is set', bondSpoken(vid), 'bondProposalSpoken=' + bondSpoken(vid));
    T.ok('after speaking: bondChoices offers bond:accept', bondMenu(vid).indexOf('bond:accept') !== -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 6. Control: nothing pending — no bond:/link: choices ----
  T.section('6. Control — nothing pending, no bond:/link: choices');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    const bm = bondMenu(vid);
    T.ok('no pending: bondChoices has no bond:accept', bm.indexOf('bond:accept') === -1, 'bondChoices=' + JSON.stringify(bm));
    T.ok('no pending: bondChoices has no link:accept', bm.indexOf('link:accept') === -1, 'bondChoices=' + JSON.stringify(bm));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 7. Per-sitting scope: the flag resets next sitting ----
  T.section('7. Per-sitting scope — the flag resets on a fresh sitting');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageRaise(vid, VILLAGE_A, 'Thornfield');
    try { Game.convoRecordSpokenBeat(vid, '"I\'ve heard good things about Thornfield. We should link with them — we\'d be stronger together."', { tag: 'linkraise' }); } catch (e) {}
    T.ok('sitting 1: linkRaiseSpoken is set after speaking', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
    T.ok('sitting 1: link:accept offered', bondMenu(vid).indexOf('link:accept') !== -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    // The raise stays pending (never answered). A fresh sitting must NOT
    // carry the spoken flag over — the ask has to be heard again.
    try { Game.talkTo(vid); } catch (e) {}
    T.ok('sitting 2: linkRaiseSpoken is reset', !raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
    T.ok('sitting 2: link:accept withheld until re-spoken', bondMenu(vid).indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
