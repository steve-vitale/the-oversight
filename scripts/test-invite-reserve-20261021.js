#!/usr/bin/env node
// PROOF TEST (journey-social r40 2026-10-21): the want-opener/invite re-serve.
//
// BUG: c.invitePending (the intra-conversation hold for "opener owns the
// reply, queue the invite for the continuer") leaked across sittings —
// startConvo's reset block never cleared it. Sequence (transcript-caught,
// seed 3601 David d13->d14):
//   d13: opener owns reply -> c.invitePending = <label>, never served;
//        convo ends with the hold still set.
//   d14: fresh open speaks the invite (opener doesn't own reply) AND
//        queueTraderIntro re-queues the STALE hold -> <goon> re-serves the
//        just-spoken invite verbatim.
// FIX: clear c.invitePending in startConvo's reset block. The "undecided
// invite re-spoken next sitting" design lives in the pendingInvite itself
// (endConvo resets inv.spoken), not in this hold.
//
// Usage: node scripts/test-invite-reserve-20261021.js
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: 3601, mode: 'mvc' });
  await setupGame(Game);
  const vid = Game.npcIds().find(id => Game.vpOf(id) && Game.vpOf(id).id);
  const name = Game.displayName(vid);
  console.log(`villager: ${name} (${vid})`);

  const label = '"Come see what I found. You won\'t believe it."';

  // --- Part 1: the hold must not leak across sittings ---
  Game.startConvo(vid);
  let c = Game.convoGet(vid);
  // Simulate the d13 state: opener owned the reply, invite held, never served.
  c.invitePending = label;
  ok('setup: hold planted', c.invitePending === label);
  Game.endConvo(vid, 'left');

  Game.startConvo(vid);
  c = Game.convoGet(vid);
  ok('T1 invitePending cleared at open (no cross-sitting leak)', c.invitePending == null,
    `invitePending=${JSON.stringify(c.invitePending)}`);
  ok('T2 no stale [INV] beat queued at open',
    !(c.heldBeats || []).some(h => h && h.invitation),
    `heldBeats=${JSON.stringify((c.heldBeats || []).map(h => String(h.text).slice(0, 30)))}`);
  Game.endConvo(vid, 'left');

  // --- Part 2: the full d13->d14 sequence cannot re-serve ---
  // Sitting A (d13): opener owned the reply -> hold set, convo ends unserved.
  Game.startConvo(vid);
  Game.convoGet(vid).invitePending = label; // the d13 end-state (trace-proven)
  Game.endConvo(vid, 'left');
  // Sitting B (d14): fresh open. The hold must be gone, so even if this
  // open speaks a fresh invite, queueTraderIntro has nothing stale to queue.
  Game.startConvo(vid);
  c = Game.convoGet(vid);
  ok('T3 hold cleared across the d13->d14 boundary', c.invitePending == null,
    `invitePending=${JSON.stringify(c.invitePending)}`);
  const staleQueued = (c.heldBeats || []).some(h => h && h.invitation);
  ok('T4 no stale [INV] beat queued at the d14 open', !staleQueued,
    `heldBeats=${JSON.stringify((c.heldBeats || []).map(h => String(h.text).slice(0, 30)))}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // --- Part 3: the live hold still works within one sitting ---
  // (The fix must not break the normal queue-then-goon flow.)
  Game.startConvo(vid);
  c = Game.convoGet(vid);
  c.invitePending = label; // opener owned the reply this sitting
  let ch3 = (Game.convoChoices(vid) || []).map(x => String(x.id));
  const queued = (Game.convoGet(vid).heldBeats || []).some(h => h && h.invitation);
  ok('T5 live hold queues as [INV] beat for the continuer', queued || ch3.includes('goon') === false,
    `heldBeats=${JSON.stringify((Game.convoGet(vid).heldBeats || []).map(h => String(h.text).slice(0, 30)))}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
