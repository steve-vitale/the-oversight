#!/usr/bin/env node
// test-opener-skip-r19-20261016.js — journey-social r19 M1 blank fix proof.
// Blank (r19 pilot, 6 runs x 60d): 611/3255 driven openers (18.8%) were
// run-ledger-blocked at emission and dry-replaced ("...Sorry, lost my train
// of thought.") even though the NPC had something on their mind — every one
// thread-mismatched (want 494, recall 48, request 48, grief 21).
// Fix: the opener chain (convoOpening) now SKIPS a would-be-blocked
// candidate and falls through to the next one — a real person with a blocked
// opener picks a different line. Side effects (request delivered flag,
// want stage, secret/taught/recall once-per flags) are deferred, never
// burned on a skipped candidate.
// RED (pre-fix): blocked request opener goes dry AND the request is marked
//   delivered anyway (stranded — the reason they came to talk is lost).
// GREEN (post-fix): blocked request opener falls through to a content line,
//   the request stays pending, and fires next conversation.
// Usage: SEED=4242 node scripts/test-opener-skip-r19-20261016.js
// (MEASUREMENT.md §3: run green on >=3 seeds.)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '4242', 10);

function firstNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  const e = tr.find(x => x.who !== 'you');
  return e ? String(e.text) : null;
}
function livingVillagers(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
    return true;
  });
}
function commOk(Game, vid) {
  try { return Game.commLevel(vid).level !== 'none'; } catch (e) { return true; }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-opener-skip-r19', fullTelemetry: false });
  await setupGame(Game);
  let pass = 0;
  const ok = (cond, msg) => { assert(cond, 'FAIL: ' + msg); pass++; console.log('  ok: ' + msg); };

  const cands = livingVillagers(Game).filter(v => commOk(Game, v));
  ok(cands.length >= 3, `>=3 comm-ok villagers (found ${cands.length})`);
  const [A, B, C] = cands;

  // --- unit: convoWouldBlock mirrors sayLine's block decision ---
  Game.startConvo(A);
  ok(!Game.convoWouldBlock(A, '"A brand new line nobody said."'), 'fresh line is not blocked');
  Game.convoRunLedger().push('"A brand new line nobody said."');
  ok(Game.convoWouldBlock(A, '"A brand new line nobody said."'), 'run-ledgered line is blocked');
  Game.endConvo(A, 'left');

  // --- integration: talk-request opener, run-blocked ---
  const REQ = '"Can we talk? It is about the water rota."';
  const v = Game.state.village;
  v.talkRequests = v.talkRequests || {};
  v.talkRequests[B] = { line: REQ, delivered: false };
  Game.convoRunLedger().push(REQ); // another villager said it recently
  Game.startConvo(B);
  const first = firstNpcLine(Game, B);
  ok(!!first, 'blocked-request convo produced an opener line');
  console.log('  blocked-request opener said: ' + String(first).slice(0, 130));
  ok(!Game.convoIsDeflectionLine(first),
    'blocked request opener does NOT open with a deflection line (falls through to a content candidate)');
  ok(v.talkRequests[B].delivered === false,
    'blocked request stays undelivered (not stranded)');
  Game.endConvo(B, 'left');

  // --- control: unblocked request opener fires normally ---
  v.talkRequests[C] = { line: '"Can we talk? It is about the night watch."', delivered: false };
  Game.startConvo(C);
  const firstC = firstNpcLine(Game, C);
  ok(!!firstC, 'control convo produced an opener line');
  console.log('  control opener said: ' + String(firstC).slice(0, 130));
  ok(!Game.convoIsDeflectionLine(firstC), 'unblocked request opener is a content line');
  ok(String(firstC).indexOf('night watch') !== -1, 'unblocked request opener speaks the request');
  ok(v.talkRequests[C].delivered === true, 'unblocked request marked delivered');
  Game.endConvo(C, 'left');

  // --- the skipped request fires next conversation (ledger slid) ---
  Game.convoRunLedger().length = 0;
  Game.startConvo(B);
  const firstB2 = firstNpcLine(Game, B);
  ok(!!firstB2, 'retry convo produced an opener line');
  console.log('  retry opener said: ' + String(firstB2).slice(0, 130));
  ok(String(firstB2).indexOf('water rota') !== -1, 'pending request fires next conversation');
  ok(v.talkRequests[B].delivered === true, 'request delivered on retry');
  Game.endConvo(B, 'left');

  console.log(`GREEN: ${pass} assertions passed (seed ${SEED})`);
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
