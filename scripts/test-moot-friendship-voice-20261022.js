#!/usr/bin/env node
// test-moot-friendship-voice-20261022.js — FRIENDSHIP VOICE proof
// (journey-social 2026-10-22 r42, THE FRIENDSHIP EFFECT).
//
// Finding: the vote math weighs pairAffinity(voter, accused) x0.4
// (betrayal.js tallyVotes), and the probe proved it moves votes (+32.5pp
// acquit near the boundary, 4/4 vote-variant natural moots aligned) — but
// NPC trials never SAID so. Only the player's own trial gets vouch lines
// (defendAlibi: "X stands with you... It matters who your friends are.").
//
// Fix: betrayal.js mootFriendVoice(c), called from finishTrial after the
// count: when the accused's staunchest friend voted to acquit with affinity
// >= 20, the room sees it. Pure voicing (votes already cast); idempotent
// per case.
//
// r44 (2026-10-23): r43 found the identical line echoing across repeat
// trials (Raul for Eamon, 2 days apart). The voicing now has TWO variants
// with world-level alternation (state.village.betrayal.friendVoiceCount,
// advancing only on actual voicing) — consecutive firings never echo.
// Both variants name friend+accused and keep the ceremony tagline.
//
// Proves:
//   1. A high-affinity acquit-voter triggers the line naming friend+accused.
//   2. Idempotent: second call fires nothing new.
//   3. No line when no acquit-voter reaches affinity 20.
//   4. No line when the player is the accused (player lane has defendAlibi).
//   5. No line when the staunchest friend voted GUILTY (only stand-by counts).
//   6. finishTrial integration: the ceremony voices variant B on 2nd firing.
//   7. Third firing cycles back to variant A.
//   8. Consecutive firings never echo (the r43 Raul finding).
// Usage: node scripts/test-moot-friendship-voice-20261022.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

function setBond(Game, a, b, v, depth) {
  const k = Game.bondKey(a, b);
  Game.state.village.bonds = Game.state.village.bonds || {};
  Game.state.village.bonds[k] = { v, depth, day: 1, dayGain: 0 };
}

(async () => {
  const { Game } = await loadGame({ seed: 777001, mode: 'probe', fullTelemetry: false });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say;
  Game.say = function (m) { said.push(String(m)); return origSay.apply(this, arguments); };
  const npcs = Game.npcIds().filter(id => { try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; } });
  const A = npcs[0], F = npcs[1], S = npcs[2], G = npcs[3];
  setBond(Game, F, A, 80, 3); // affinity 36
  const fTag = Game.whoTag(F), aTag = Game.whoTag(A);

  // 1: high-affinity acquit-voter -> line fires naming both.
  const c1 = { id: 't1', accused: [A], trial: { votes: [{ vid: F, vote: 'acquit' }, { vid: S, vote: 'guilty' }] } };
  const n0 = said.length;
  ok(Game.mootFriendVoice(c1) === true, 'fires for a staunch friend who acquitted');
  const line = said.slice(n0).join(' ');
  ok(line.includes(Game.capFirst(fTag)) && line.includes(aTag), 'line names the friend and the accused');
  ok(/hear them out/.test(line), 'line carries the stand-by beat');

  // 2: idempotent.
  const n1 = said.length;
  ok(Game.mootFriendVoice(c1) === false, 'second call fires nothing (idempotent)');
  ok(said.length === n1, 'no duplicate line');

  // 3: no high-affinity acquit-voter -> silent.
  const c3 = { id: 't3', accused: [A], trial: { votes: [{ vid: S, vote: 'acquit' }, { vid: G, vote: 'guilty' }] } };
  const n3 = said.length;
  ok(Game.mootFriendVoice(c3) === false, 'silent when best acquit affinity < 20');
  ok(said.length === n3, 'no line spoken');

  // 4: player accused -> silent (player lane owns vouching via defendAlibi).
  const me = Game.villagerId;
  const c4 = { id: 't4', accused: [me], trial: { votes: [{ vid: F, vote: 'acquit' }] } };
  setBond(Game, F, me, 80, 3);
  const n4 = said.length;
  ok(Game.mootFriendVoice(c4) === false, 'silent when the player is the accused');
  ok(said.length === n4, 'no line spoken for player trial');

  // 5: staunchest friend voted guilty -> silent (only stand-by is voiced).
  const c5 = { id: 't5', accused: [A], trial: { votes: [{ vid: F, vote: 'guilty' }, { vid: S, vote: 'acquit' }] } };
  const n5 = said.length;
  ok(Game.mootFriendVoice(c5) === false, 'silent when the best friend voted guilty');
  ok(said.length === n5, 'no line spoken');

  // 6: finishTrial integration — the SECOND firing voices variant B (alternation).
  // Build a QUORATE trial through the real path: everyone present except the
  // accused, the friend acquits, the rest convict.
  const voters = Game.npcIds().filter(id => id !== A);
  const c6 = {
    id: 't6', accused: [A], charge: 'theft', playerRole: 'juror',
    trial: {
      present: voters,
      votes: voters.map(id => ({ vid: id, vote: id === F ? 'acquit' : 'guilty', score: id === F ? 30 : -20 })),
      guilty: voters.length - 1, day: 5, playerVoter: false, wildDay: false,
    },
    belief: {},
  };
  Game.state.village.betrayal = Game.state.village.betrayal || {};
  Game.state.village.betrayal.cases = Game.state.village.betrayal.cases || [];
  Game.state.village.betrayal.cases.push(c6);
  const n6 = said.length;
  let res = null;
  try { res = Game.finishTrial(c6, 0); } catch (e) { console.log('  (finishTrial threw: ' + e.message + ')'); }
  const newLines6 = said.slice(n6);
  const line6 = newLines6.find(l => /It matters who your friends are/.test(l)) || '';
  ok(/stand by them/.test(line6), 'finishTrial ceremony voices the SECOND variant (alternation)');
  ok(line6.includes(Game.capFirst(fTag)) && line6.includes(aTag), 'variant B names the friend and the accused');
  ok(c6.trial.convicted === true, 'verdict follows the votes (convicted; voicing changes nothing)');

  // 7: third firing cycles back to variant A (world-level counter).
  const c7 = { id: 't7', accused: [A], trial: { votes: [{ vid: F, vote: 'acquit' }, { vid: S, vote: 'guilty' }] } };
  const n7 = said.length;
  ok(Game.mootFriendVoice(c7) === true, 'third firing succeeds');
  const line7 = said.slice(n7).join(' ');

  // 8: the r43 Raul finding — consecutive firings never echo.
  ok(line !== line6, 'consecutive firings differ (variant A vs B)');
  ok(line6 !== line7, 'consecutive firings differ (variant B vs A)');
  ok(line7 === line, 'alternation cycles back to variant A');

  Game.say = origSay;
  console.log(`\nmoot-friendship-voice: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
