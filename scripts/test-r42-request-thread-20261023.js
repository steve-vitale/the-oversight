#!/usr/bin/env node
// scripts/test-r42-request-thread-20261023.js — proof test for the r42 blank:
// THREAD-DEPTH FIZZLES. Two wild-caught fizzles (seed 505: Nora day 3,
// Lounes day 8) plus one latent same-class miss:
//
// 1. REQUEST THREAD (dialog-ui defect, wild): a talk-request opener sets
//    thread='request', pre-empting the want opener. "Tell me more"
//    (dlg:more) funneled through convoThreadBeat, which had no 'request'
//    branch -> null -> the dry admission ("That's... pretty much all of
//    it, honestly.") with the NPC's reason for coming to talk still
//    unstated — the Liam pattern from r41. Fix: the branch delivers the
//    want's DEFERRED opener (question hung, thread flips to 'want').
// 2. VILLAGE THREAD (latent, same root cause): the village topic plants
//    thread='village' with real follow-up content, but convoThreadBeat had
//    no branch -> dry admission. Fix: serve the next village line via the
//    extracted convoVillageLine generator. (personal branch: same shape.)
// 3. GRIEF THREAD (wild): grief has no follow-up pool, so the menu must
//    not OFFER "tell me more" (thread_dry_collapse, Steve 2026-10-06).
//    Fix: convo-beats.js treats followup-less threads as dry for the
//    reply-pool dlg:more offer gate.
//
// GREEN means:
//   A. request + curious want + dlg:more -> the deferred question lands
//      (pendingQ hung, thread flips to 'want'), NOT the dry admission.
//      (Pre-fix: dry admission — THE BUG.)
//   B. request + NO want + dlg:more -> honest dry admission (unchanged;
//      there is genuinely nothing to deliver).
//   C. request + opener-less want + dlg:more -> dry admission, no crash,
//      no literal "null" line.
//   D. village thread + dlg:more -> a village line ("Honestly? ..."),
//      NOT the dry admission. (Pre-fix: dry admission — THE BUG.)
//   E. grief thread -> the built menu offers NO dlg:more choice.
//      (Pre-fix: offered — THE BUG.)
// Usage: node scripts/test-r42-request-thread-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const DRY_RE = /I've told you everything|That's the whole of it|pretty much all of it|I wish there was more to tell/i;

async function main() {
  const fails = [];
  const ok = (name) => console.log(`ok - ${name}`);
  const fail = (name, detail) => fails.push(`${name}: ${detail}`);

  const { Game } = await loadGame({ seed: 777001, mode: 'r42-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== me);
  if (roster.length < 2) { console.error('construction invalid: roster too small'); process.exit(2); }
  v.talkRequests = v.talkRequests || {};

  function startRequestConvo(vid) {
    v.talkRequests[vid] = { line: '"Hey." Can we talk? Just talk — like people used to.', day: 1 };
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    return { r0, c };
  }
  function end(vid) { try { Game.endConvo(vid, 'done'); } catch (e) {} delete v.talkRequests[vid]; }

  // Find a villager whose selected want is curious (deterministic on seed).
  let curiousVid = null;
  for (const vid of roster) {
    const { c } = startRequestConvo(vid);
    if (c && c.thread === 'request' && c.want && c.want.id === 'curious') { curiousVid = vid; break; }
    end(vid);
  }
  if (!curiousVid) { console.error('construction invalid: no curious want found on seed'); process.exit(2); }

  // A. request + curious: dlg:more must deliver the deferred question.
  {
    const c = Game.convoGet(curiousVid);
    const r = Game.convoTurn(curiousVid, 'dlg:more');
    const line = String((r && r.line) || '');
    const c2 = Game.convoGet(curiousVid);
    if (DRY_RE.test(line)) fail('A', `dry admission on request+curious: "${line.slice(0, 120)}"`);
    else if (!c2.pendingQ) fail('A', `no pendingQ hung after deferred opener: "${line.slice(0, 120)}"`);
    else if (c2.thread !== 'want') fail('A', `thread=${c2.thread}, expected 'want'`);
    else ok(`A request+curious dlg:more -> deferred question (thread=want, pendingQ=${c2.pendingQ.id})`);
    void c;
  }
  end(curiousVid);

  // B. request + no want: honest dry admission (unchanged behavior).
  {
    const vid = roster.find(id => id !== curiousVid);
    startRequestConvo(vid);
    const c = Game.convoGet(vid);
    c.want = null;
    const r = Game.convoTurn(vid, 'dlg:more');
    const line = String((r && r.line) || '');
    if (!DRY_RE.test(line)) fail('B', `expected dry admission with no want, got: "${line.slice(0, 120)}"`);
    else ok('B request+no-want dlg:more -> honest dry admission (unchanged)');
    end(vid);
  }

  // C. request + opener-less want: dry admission, no crash, no "null".
  {
    const vid = roster.find(id => id !== curiousVid);
    startRequestConvo(vid);
    const c = Game.convoGet(vid);
    c.want = { id: 'mystery', def: {}, stage: 0 };
    let r = null, threw = null;
    try { r = Game.convoTurn(vid, 'dlg:more'); } catch (e) { threw = e; }
    const line = String((r && r.line) || '');
    if (threw) fail('C', `threw: ${threw.message}`);
    else if (/^null$|THEM: null/.test(line)) fail('C', 'literal null line spoken');
    else if (!DRY_RE.test(line)) fail('C', `expected dry admission, got: "${line.slice(0, 120)}"`);
    else ok('C request+opener-less-want dlg:more -> dry admission, no crash');
    end(vid);
  }

  // D. village thread: dlg:more serves the next village line.
  {
    const vid = roster.find(id => id !== curiousVid);
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.thread = 'village'; c.depth = 1;
    const r = Game.convoTurn(vid, 'dlg:more');
    const line = String((r && r.line) || '');
    if (DRY_RE.test(line)) fail('D', `dry admission on village thread: "${line.slice(0, 120)}"`);
    else if (!/Honestly\?|same as before|no big changes|still standing/i.test(line))
      fail('D', `not a village line: "${line.slice(0, 160)}"`);
    else ok(`D village-thread dlg:more -> village line: "${line.slice(0, 90)}..."`);
    end(vid);
  }

  // E. grief thread: after a comfort beat, the menu must NOT offer dlg:more
  // (the reply-pool "I'm listening" on a thread with no follow-up
  // machinery always fizzled to the dry admission — seed 505 Lounes).
  // Faithful wild path: force the grief thread, take the comfort reply
  // the wild menu offered, inspect the returned menu.
  {
    const vid = roster.find(id => id !== curiousVid);
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    c.thread = 'grief'; c.depth = 1;
    const r = Game.convoTurn(vid, 'dlg:comfort');
    const choices = (r && r.choices) || [];
    const line = String((r && r.line) || '');
    const more = choices.find(ch => ch && ch.id === 'dlg:more');
    if (!/kind|thanks|helps|appreciate|exhale|asked me|Talk to me/i.test(line))
      fail('E', `construction: comfort beat didn't land: "${line.slice(0, 100)}"`);
    else if (more) fail('E', `dlg:more still offered on grief thread: "${String(more.label).slice(0, 60)}"`);
    else ok(`E grief-thread post-comfort menu offers no dlg:more (${choices.length} choices)`);
    end(vid);
  }

  if (fails.length) { console.error('FAIL:\n' + fails.join('\n')); process.exit(1); }
  console.log('ALL GREEN');
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
