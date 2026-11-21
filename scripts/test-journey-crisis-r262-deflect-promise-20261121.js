#!/usr/bin/env node
'use strict';
// Proof: a declined favor never promises never-again (journey-crisis r262,
// fix 2 — r261 blemish 2: the decline line contradicted the re-ask).
//
// THE CONTRADICTION (r261 panel, Imani 14581 d27/d38/d44): the decline
// (convo-wants.js deflectBeat) spoke three narrator-asserted never-again
// promises — "They'll just stop asking", "They won't raise it again",
// "They won't ask twice. That much is clear" — while the re-ask path
// (RE-ASK VARIETY, sociallife 2026-10-11) deliberately re-asks a live
// need ("I hate to ask twice, but it's still open"). The re-ask is the
// intended behavior (a need that never re-opens can never be met later);
// the decline line is the liar — narrator assertion, not the NPC's own
// breakable promise.
//
// GREEN (post-fix): driving deflectBeat across all three cycled variants
// yields three distinct lines, NONE of which promises never-again
// (no "won't ask twice" / "won't raise it again" / "stop asking"), and
// the re-ask path still fires for a live need (convoFavorFollowup
// returns the "I hate to ask twice" variant among its cycle). The
// settled-favor acknowledgment ("Already handled") is unchanged.
// Staging mirrors the r228 proof: a villager with a live wound and an
// asked heal_help favor, the real want def from convoSelectWant.
// Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const NEVER_AGAIN = /won't ask twice|won't raise it again|stop asking/i;

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  let vid = null, def = null;
  for (const id of roster) {
    try { if (Game.commLevel(id).level !== 'full') continue; } catch (e) { continue; }
    try {
      v.health = v.health || {};
      v.health[id] = 50; // the wound is live, so heal_help is a real need
      Game.convoStoreFavor({ kind: 'heal_help', state: 'asked', vid: id });
      const w = Game.convoSelectWant(id);
      if (w && w.id === 'ask_favor' && w.def && typeof w.def.deflectBeat === 'function') {
        vid = id; def = w.def; break;
      }
    } catch (e) { continue; }
  }
  check('a speaker stages ask_favor with a live wound', !!vid, 'vid=' + vid);
  const opened = Game.startConvo(vid);
  assert(opened && !opened.refused && !opened.ended, 'conversation opens for ' + vid);
  const c = Game.convoGet(vid);
  c.want = { id: 'ask_favor', def, stage: 1, favor: Game.convoGetFavor(vid) };

  // ---- 1. all three decline variants: distinct, none promises never-again. ----
  const lines = [];
  for (let i = 0; i < 3; i++) lines.push(def.deflectBeat.call(Game, vid));
  console.log('  declines:', JSON.stringify(lines));
  check('three decline draws are all distinct', new Set(lines).size === 3, JSON.stringify(lines));
  for (const [i, line] of lines.entries()) {
    check(`decline variant ${i + 1} promises no never-again`,
      typeof line === 'string' && !NEVER_AGAIN.test(line), 'got: ' + line);
  }
  check('decline variants still promise only a pause',
    lines.some(l => /for now|For today|Not right now/.test(l)), JSON.stringify(lines));
  check('decline variants keep "they won\'t forget" (the memory plant)',
    lines.some(l => /won't forget/i.test(l)), JSON.stringify(lines));

  // ---- 2. the re-ask path is untouched: it still fires for a live need. ----
  const favor = Game.convoGetFavor(vid);
  check('ledger favor is the asked wound favor', favor && favor.kind === 'heal_help' && favor.state === 'asked',
    JSON.stringify(favor && { kind: favor.kind, state: favor.state }));
  const reasks = [];
  for (let i = 0; i < 4; i++) {
    try { reasks.push(Game.convoFavorFollowup(vid, favor)); } catch (e) { reasks.push(null); }
  }
  console.log('  re-asks:', JSON.stringify(reasks));
  check('re-ask cycle still serves "I hate to ask twice"',
    reasks.some(l => typeof l === 'string' && /hate to ask twice/i.test(l)), JSON.stringify(reasks));

  // ---- 3. settled favor still gets the light acknowledgment, not a decline. ----
  Game.convoStoreFavor({ kind: 'heal_help', state: 'fulfilled', vid });
  // The sitting's want favor is re-read from the ledger — the staged
  // reference still points at the pre-fulfillment object.
  c.want.favor = Game.convoGetFavor(vid);
  const settled = def.deflectBeat.call(Game, vid);
  check('fulfilled favor deflects as "Already handled"',
    typeof settled === 'string' && /Already handled/i.test(settled), 'got: ' + settled);
  check('settled line carries no never-again promise', !NEVER_AGAIN.test(settled || ''), 'got: ' + settled);

  Game.endConvo(vid, 'left');
  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
