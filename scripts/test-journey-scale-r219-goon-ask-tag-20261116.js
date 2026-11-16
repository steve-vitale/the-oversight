#!/usr/bin/env node
// test-journey-scale-r219-goon-ask-tag-20261116.js — proof test for the
// journey-scale r219 goon-substitution tag fix (lane A, leg 3).
//
// THE DEFECT (r219 pilot, seed 135609 d130, Felipe, outcome accepted —
// evidence/2026-11-16/arm-a/journey-scale-r219-raisetalk-135609-5.txt):
//   THEM: "Do you still count the days? I lost track days ago."
//   YOU: "I count. Someone has to."
//   THEM: "Good. Keep counting. The days need witnesses. No time to waste."
//   YOU: "I'm listening."
//   THEM: "I count meals, not days. ..."
//   YOU: "I'm listening."
//   THEM: "Huh. I wouldn't have guessed that about you."
//   YOU: "All right. Let's ask them."
//   THEM: "All right — let's ask them." You carry the proposal to The
//     Red Table II.
// Felipe never voiced the link proposal in that sitting — yet the player
// answered "let's ask them" and carried a proposal to a village never
// mentioned. The r132 spoken-ask gate should have withheld link:accept.
//
// MECHANISM (proven with the RAISE_DEBUG probe on the pilot seed — the
// probe replays seed 135609 arm A and logs every bondChoices call with a
// pending raise plus every convoRecordSpokenBeat call):
//   Felipe's raise line WAS spoken on d128 (a base-daily sitting), so it
//   sits in the 48-entry run ledger. On d130 the raise is HELD
//   (openerOwnsReply: the curious opener owns the reply), queued via
//   queueTraderIntro into heldBeats. The continuer's goon tries to speak
//   it, but convoWouldBlock fires (run ledger) and the goon substitutes
//   an alternate thread beat ("Huh. I wouldn't have guessed that about
//   you.") — WHILE KEEPING goonOpts {tag:'linkraise'}. sayLine records
//   the substitute with the linkraise tag, flipping linkRaiseSpoken
//   true for a line that never voiced the proposal; bondChoices then
//   offers link:accept and the policy takes it. The same shape applies
//   to bondproposal (same substitution branch, same tag leak).
//
// THE FIX (one task, one commit): in conversation.js, the goon's
// run-block substitution branch resets goonOpts to {} when it swaps in
// the alternate thread beat — the substitute is a thread beat, not the
// held ask, so its tag is the thread's own. The held ask stays pending
// (re-spoken next sitting, per the r132 design); this turn speaks only
// the thread beat. The else branch (unfinished-engage fallback) already
// reset the opts — this branch was the only one leaking the tag onto
// substitute text. No demand, number, bar, or line changes.
//
// PROOF SHAPE: a held link/bond beat whose text is run-blocked (spoken
// in a prior sitting, so the run ledger blocks it) must, after the goon
// turn, leave the spoken flag FALSE and offer NO link:/bond: choice —
// the goon spoke a thread line, not the ask (RED before the fix: the
// flag flips true and the choice is offered; GREEN after). The
// unblocked good flow (held beat spoken verbatim by the goon) must
// still set the flag and offer the choice (GREEN both engines — the
// good flow is preserved, not just un-broken).
//
// Usage: node scripts/test-journey-scale-r219-goon-ask-tag-20261116.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-scale-r219-goon-ask-tag');

const VILLAGE_A = 'village_test_a'; // Thornfield (fresh text per section)
const VILLAGE_B = 'village_test_b'; // Stonebridge (fresh text per section)
const RAISE_B = '"I\'ve heard good things about Stonebridge. We should link with them — we\'d be stronger together."';
const RAISE_A = '"I\'ve heard good things about Thornfield. We should link with them — we\'d be stronger together."';
const BOND_LINE = '"Can I ask you something? ... I want us to stick together. Properly. Watch each other\'s backs."';

(async () => {
  const Game = await K.load({ seed: 219100 });

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
  function stageRaise(vid, villageId, name) {
    const v = Game.state.village; v.linkRaises = v.linkRaises || {};
    v.linkRaises[vid] = { vid, villageId, day: day(), kind: 'link',
      line: '"I\'ve heard good things about ' + name + '. We should link with them — we\'d be stronger together."' };
  }
  function stageBond(vid) {
    const v = Game.state.village; v.bondRequests = v.bondRequests || {};
    v.bondRequests[vid] = { vid, day: day(), kind: 'bond', line: BOND_LINE };
  }
  function bondMenu(vid) {
    try { return (Game.bondChoices(vid) || []).map(ch => ch && ch.id).filter(Boolean); } catch (e) { return ['ERR:' + (e && e.message)]; }
  }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function raiseSpoken(vid) { const c = convo(vid); return !!(c && c.linkRaiseSpoken); }
  function bondSpoken(vid) { const c = convo(vid); return !!(c && c.bondProposalSpoken); }
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
  function themLines(vid) {
    const c = convo(vid);
    const tr = (c && Array.isArray(c.transcript)) ? c.transcript : [];
    return tr.filter(e => e && e.who === 'them').map(e => String(e.text || ''));
  }
  // speakInPriorSitting: open a sitting, speak the line once (it lands in
  // the 48-entry run ledger), close. The flag it sets belongs to THAT
  // sitting; the next sitting resets it — only the ledger entry carries
  // over, which is exactly the Felipe shape (spoken d128, blocked d130).
  function speakInPriorSitting(speaking, line, tag) {
    const vid = openAny(speaking);
    if (!vid) return null;
    let said = null;
    try { said = Game.sayLine(vid, line, { tag }); } catch (e) { said = 'ERR:' + (e && e.message); }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return said ? vid : null;
  }

  // ---- 1. The defect: held link beat, run-blocked — the goon substitutes
  // a thread line; the flag must NOT flip, the choice must NOT appear. ----
  T.section('1. Held link beat run-blocked — goon substitutes, flag stays false (Felipe d130)');
  let f = fresh();
  let prior = speakInPriorSitting(f.speaking, RAISE_B, 'linkraise');
  T.ok('prior sitting spoke the raise line (run ledger seeded)', !!prior, 'vid=' + prior);
  let vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    // Stage the thread the goon substitutes from: 'village' always has a
    // beat (convoVillageLine, live state + idle fallback), so the alt
    // branch is exercised deterministically — no opener lottery.
    // (Tried first: picking the opener's thread — 'small'/'trade' openers
    // have no thread beat at all, and a 'want' opener's engageBeat can be
    // ledger-blocked, both landing the goon on the else branch.)
    convo(vid).thread = 'village';
    stageRaise(vid, VILLAGE_B, 'Stonebridge');
    const c = convo(vid);
    c.heldBeats = [];
    c.heldBeats.push({ text: RAISE_B, linkraise: true });
    T.ok('before the continuer: no link:accept', bondMenu(vid).indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    let res = null;
    try { res = Game.convoTurn(vid, 'goon'); } catch (e) { res = 'ERR:' + (e && e.message); }
    T.ok('goon turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 80) : String(res).slice(0, 80)));
    // Guard against a vacuous pass: if the goon took the else branch (no
    // substitute thread beat), it speaks an unfinished-engage fallback
    // and the flag never flips on either engine — the test must say so
    // loudly instead of passing for the wrong reason. The fallback pool
    // (convoUnfinishedEngageLine) has three shapes; all three are
    // else-branch tells.
    const goonLine = (res && res.line) ? String(res.line) : '';
    const isFallback = goonLine.indexOf('Right — where was I.') !== -1 ||
      goonLine.indexOf("we hadn't finished. Give me a second.") !== -1 ||
      goonLine.indexOf('Let me pick that up.') !== -1 ||
      goonLine.indexOf('Still on ') !== -1;
    T.ok('goon spoke a substitute thread line (not the unfinished fallback)', !isFallback,
      'goon line=' + goonLine.slice(0, 80));
    T.ok('after the continuer: linkRaiseSpoken is still false', !raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
    T.ok('after the continuer: bondChoices offers NO link:accept', bondMenu(vid).indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    T.ok('after the continuer: the raise line is nowhere in the transcript',
      !themLines(vid).some(l => l.indexOf('We should link with') !== -1),
      'THEM=' + JSON.stringify(themLines(vid).map(l => l.slice(0, 50))));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. Control: held link beat, fresh text — the goon speaks it, the
  // flag flips, the choice appears (the good flow, preserved). ----
  T.section('2. Held link beat unblocked — goon speaks it, flag flips (good flow)');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageRaise(vid, VILLAGE_A, 'Thornfield');
    const c = convo(vid);
    c.heldBeats = [];
    c.heldBeats.push({ text: RAISE_A, linkraise: true });
    T.ok('before the continuer: no link:accept', bondMenu(vid).indexOf('link:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    let res = null;
    try { res = Game.convoTurn(vid, 'goon'); } catch (e) { res = 'ERR:' + (e && e.message); }
    T.ok('goon turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 80) : String(res).slice(0, 80)));
    T.ok('after the continuer: linkRaiseSpoken is set', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
    T.ok('after the continuer: bondChoices offers link:accept', bondMenu(vid).indexOf('link:accept') !== -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    T.ok('after the continuer: the raise line IS in the transcript',
      themLines(vid).some(l => l.indexOf('We should link with') !== -1),
      'THEM=' + JSON.stringify(themLines(vid).map(l => l.slice(0, 50))));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Bond mirror: held bond beat, run-blocked — flag stays false. ----
  T.section('3. Held bond beat run-blocked — goon substitutes, flag stays false (same branch)');
  f = fresh();
  prior = speakInPriorSitting(f.speaking, BOND_LINE, 'bondproposal');
  T.ok('prior sitting spoke the bond line (run ledger seeded)', !!prior, 'vid=' + prior);
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    // Stage the thread the goon substitutes from: 'village' always has a
    // beat (convoVillageLine, live state + idle fallback), so the alt
    // branch is exercised deterministically — no opener lottery.
    // (Tried first: picking the opener's thread — 'small'/'trade' openers
    // have no thread beat at all, and a 'want' opener's engageBeat can be
    // ledger-blocked, both landing the goon on the else branch.)
    convo(vid).thread = 'village';
    stageBond(vid);
    const c = convo(vid);
    c.heldBeats = [];
    c.heldBeats.push({ text: BOND_LINE, bondproposal: true });
    T.ok('before the continuer: no bond:accept', bondMenu(vid).indexOf('bond:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    let res = null;
    try { res = Game.convoTurn(vid, 'goon'); } catch (e) { res = 'ERR:' + (e && e.message); }
    T.ok('goon turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 80) : String(res).slice(0, 80)));
    const goonLine = (res && res.line) ? String(res.line) : '';
    const isFallback = goonLine.indexOf('Right — where was I.') !== -1 ||
      goonLine.indexOf("we hadn't finished. Give me a second.") !== -1 ||
      goonLine.indexOf('Let me pick that up.') !== -1 ||
      goonLine.indexOf('Still on ') !== -1;
    T.ok('goon spoke a substitute thread line (not the unfinished fallback)', !isFallback,
      'goon line=' + goonLine.slice(0, 80));
    T.ok('after the continuer: bondProposalSpoken is still false', !bondSpoken(vid), 'bondProposalSpoken=' + bondSpoken(vid));
    T.ok('after the continuer: bondChoices offers NO bond:accept', bondMenu(vid).indexOf('bond:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    T.ok('after the continuer: the bond line is nowhere in the transcript',
      !themLines(vid).some(l => l.indexOf('stick together') !== -1),
      'THEM=' + JSON.stringify(themLines(vid).map(l => l.slice(0, 50))));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 4. Bond control: held bond beat, fresh — the goon speaks it. ----
  T.section('4. Held bond beat unblocked — goon speaks it, flag flips (good flow)');
  f = fresh();
  vid = openAny(f.speaking);
  T.ok('opened a sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageBond(vid);
    const c = convo(vid);
    c.heldBeats = [];
    c.heldBeats.push({ text: BOND_LINE, bondproposal: true });
    T.ok('before the continuer: no bond:accept', bondMenu(vid).indexOf('bond:accept') === -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    let res = null;
    try { res = Game.convoTurn(vid, 'goon'); } catch (e) { res = 'ERR:' + (e && e.message); }
    T.ok('goon turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 80) : String(res).slice(0, 80)));
    T.ok('after the continuer: bondProposalSpoken is set', bondSpoken(vid), 'bondProposalSpoken=' + bondSpoken(vid));
    T.ok('after the continuer: bondChoices offers bond:accept', bondMenu(vid).indexOf('bond:accept') !== -1,
      'bondChoices=' + JSON.stringify(bondMenu(vid)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
