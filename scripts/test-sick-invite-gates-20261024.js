#!/usr/bin/env node
// test-sick-invite-gates-20261024.js — SICK INVITE GATE proof
// (journey-crisis 2026-10-24 r46).
//
// Finding: the r42 sick-stay-home gates (objMaybeDepart, guard companions)
// missed the betrayal micro-invite pathway. Transcript-verified (r42 seed303
// d4): a feverish villager (Paola) invited the player to walk her trap line
// and `betrayal:accept` walked them both out. Two leak points:
//   1. npcInviteTick() assigned pending invites to sick villagers.
//   2. acceptInvite()/resolveInvite() walked out with no sickness check.
//
// Fix (src/js/betrayal.js, r46):
//   1. npcInviteTick skips sick villagers when assigning invite ideas.
//   2. acceptInvite returns an honest body-veto line for a sick inviter
//      (pending issued before the fever hit) instead of the walk. Armed plot
//      ambushes are unaffected (a lure is a lure).
//
// Proves:
//   1. 40 npcInviteTick ticks never assign a pending invite to a sick NPC.
//   2. The tick still assigns invites to well NPCs (no over-gating).
//   3. acceptInvite on a sick inviter consumes the pending, returns the
//      honest sick line, and does NOT resolve a walk.
//   4. acceptInvite on a well inviter still resolves a real walk outcome.
//   5. acceptInvite with no pending returns null.
// Usage: node scripts/test-sick-invite-gates-20261024.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' (' + extra + ')' : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 777, mode: 'proof' });
  await setupGame(Game);
  Game.state.scholar.day = 10;
  const v = Game.state.village;
  const npcs = Game.npcIds().filter(id => id !== Game.villagerId);
  ok(npcs.length >= 4, 'roster has NPCs', 'npcs=' + npcs.length);

  // warm trust so the invite tick is live (avg >= 15 -> n >= 1 invite/tick)
  v.trust = v.trust || {};
  for (const id of npcs) v.trust[id] = 30;

  const sick1 = npcs[0];
  const well1 = npcs[1];
  const well2 = npcs[2];
  v.sick = v.sick || {};
  v.sick[sick1] = { name: 'bad belly', daysLeft: 5, severity: 2 };

  // ---- 1+2. the tick never invites the sick, still invites the well ----
  let wellInvited = false;
  let sickEverPending = false;
  for (let i = 0; i < 40; i++) {
    try { Game.npcInviteTick(); } catch (e) { ok(false, 'npcInviteTick no-throw', e.message); break; }
    try {
      if (Game.inviteHistory(sick1).pending) sickEverPending = true;
      for (const id of npcs) {
        if (id !== sick1 && Game.inviteHistory(id).pending) wellInvited = true;
      }
    } catch (e) { ok(false, 'inviteHistory readable', e.message); break; }
  }
  ok(!sickEverPending, 'sick villager never assigned a pending invite over 40 ticks');
  ok(wellInvited, 'tick still assigns invites to well villagers (not over-gated)');

  // ---- 3. accept with a sick inviter: honest veto, no walk ----
  try { Game.inviteHistory(sick1).pending = { defId: 'traps', day: 10 }; } catch (e) {}
  const before = (Game.inviteHistory(sick1).accepted || 0);
  let rs = null;
  try { rs = Game.acceptInvite(sick1); } catch (e) { ok(false, 'acceptInvite no-throw on sick', e.message); }
  ok(rs && rs.outcome === 'sick', 'sick inviter accept returns outcome=sick');
  ok(rs && /fire|not today/i.test(rs.line || ''), 'sick accept line is the body veto', String(rs && rs.line).slice(0, 60));
  let pendingAfter = true;
  try { pendingAfter = !!Game.inviteHistory(sick1).pending; } catch (e) {}
  ok(!pendingAfter, 'sick inviter pending consumed on accept');
  ok((Game.inviteHistory(sick1).accepted || 0) === before + 1, 'accept counted in invite history');

  // ---- 4. accept with a well inviter: a real walk still resolves ----
  try { Game.inviteHistory(well1).pending = { defId: 'traps', day: 10 }; } catch (e) {}
  let rw = null;
  try { rw = Game.acceptInvite(well1); } catch (e) { ok(false, 'acceptInvite no-throw on well', e.message); }
  ok(rw && ['small', 'reward', 'wild'].indexOf(rw.outcome) >= 0,
    'well inviter accept resolves a walk outcome', 'outcome=' + (rw && rw.outcome));
  ok(rw && /trap line|tree line|cache spot|ridge|hollow/i.test(rw.line || ''),
    'well accept line names the spot', String(rw && rw.line).slice(0, 60));

  // ---- 5. accept with no pending: null ----
  // (clear the tick-assigned pending from step 1 first)
  try { Game.inviteHistory(well2).pending = null; } catch (e) {}
  let rn = 'x';
  try { rn = Game.acceptInvite(well2); } catch (e) { ok(false, 'acceptInvite no-throw on empty', e.message); }
  ok(rn === null, 'acceptInvite with no pending returns null');

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
