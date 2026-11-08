#!/usr/bin/env node
// test-story-offer-yes-20261108.js — prove-out §1.4 story-offer Yes follow-through.
//
// Tip repro (dialog sampler on 816404356): seed 99 day 91 Owen —
//   "…Want to hear where it left off?" → Yes → "I see." (no story).
//
// This proof owns Yes→deliver unfinished thread content only.
// Stage-direction quote hygiene is PR #10 (convoSnippetIsStageDirection);
// do not reimplement or assert that gate here beyond depending on it.
//
// RED: Yes reply empty, or GQ_ACK shaped ("I see." / "Thank you for telling me.").
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '99', 10);
const SUBSTANTIVE = 'The creek haul was half done when the buckets tipped. We lost most of it.';
const ACK_RE = /I see\.|Thank you for telling me\.|They nod\.\s*"Okay\."/i;

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-story-offer', fullTelemetry: false });
  await setupGame(Game);
  let pass = 0;
  const ok = (cond, msg) => { assert(cond, 'FAIL: ' + msg); pass++; console.log('  ok: ' + msg); };

  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  ok(!!vid, 'found a villager');
  (Game.state.village.trust || {})[vid] = 40;
  Game.convoThreadBacked = () => true;

  const L = Game.convoTopicLedger(vid);
  L.open.length = 0;
  L.open.push({
    tid: 'past', label: 'that water haul', day: 1,
    why: 'unfinished business',
    snippet: SUBSTANTIVE,
    inh: 'Judith Hale',
  });
  // ago > 7 → "Want to hear where it left off?"; age ≤14 so ledger does not lapse.
  Game.state.scholar.day = 12;

  const _rnd = Math.random;
  Math.random = () => 0.5;
  const st = Game.startConvo(vid);
  Math.random = _rnd;
  ok(!!st && !!st.line, 'startConvo opens');
  const startLine = String(st.line || '');
  console.log('  START: ' + startLine.slice(0, 260));
  ok(/want to hear where it left off/i.test(startLine), 'sitting opens on story-offer invite');

  const c = Game.convoGet(vid);
  ok(!!(c.genericQ && c.genericQ.resumeOffer), 'hanging yn is tagged resumeOffer');
  ok(c.genericQ.kind === 'yn', 'hanging question is yes/no');

  const choices = Game.convoChoices(vid) || [];
  const yes = choices.find(x => x && x.id === 'gq:yn:yes');
  ok(!!yes, 'Yes is offered');
  const turn = Game.convoTurn(vid, 'gq:yn:yes');
  const reply = String((turn && turn.line) || '');
  console.log('  YES REPLY: ' + reply.slice(0, 260));
  ok(reply.length > 12, 'Yes reply is non-empty');
  ok(!ACK_RE.test(reply), 'Yes reply is not a generic yn acknowledgment');
  ok(/water haul|creek|bucket|past|never did get back|Judith/i.test(reply)
      || reply.indexOf('"') !== -1,
    'Yes reply delivers thread content or names the unfinished thread');
  ok(!(Game.convoGet(vid).genericQ && Game.convoGet(vid).genericQ.resumeOffer),
    'resumeOffer yn is cleared after Yes');
  ok(!/^["']?I see\.["']?\s*They take a moment/i.test(reply),
    'Owen tip ack shape is absent');

  console.log(`GREEN: ${pass} assertions passed (seed ${SEED})`);
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
