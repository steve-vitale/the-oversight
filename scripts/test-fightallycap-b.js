#!/usr/bin/env node
// test-fightallycap-b.js — proof for arm sim-fightallycap-b (BUILD: second
// ally slot in the fight engine, finding #2496, env-gated FIGHTALLY2=1).
//
// FIXTURE (seeded, frozen): fighter + 2 trusted roster villagers, all
// unarmed/unarmored, fighter at 200 HP (fixture staging — keeps the leader
// alive long enough for both allies to strike against a gavel), allies at
// 100 HP, gavel (wave 3, HP [300,360], dmg [37,55]). Same fixture and
// sequence as the pre-change baseline (/tmp/fightallycap-baseline.js),
// whose off-mode numbers are frozen below as the regression proof.
//
// WHAT IT PROVES:
//   1. SHOUT PATH (armed): the hopeless shout fires a SECOND time — the
//      second ally charges in, strikes, and the fight outlasts the
//      off-mode round-3 flee.
//   2. FROM-START PATH (armed): both allies join at the door, both
//      strike, both take wounds, and each ally's wounds settle on their
//      OWN body (health drops by exactly their own taken amount).
//   3. OFF-MODE: with FIGHTALLY2 unset the engine is byte-identical to
//      the pre-change baseline (same outcome/rounds/damage on both
//      paths), exactly one ally joins, and the fight is deterministic
//      across fresh loads.
//   4. No phantom settlement: an ally who took 0 damage settles nothing.
// Usage: node scripts/test-fightallycap-b.js
//        FIGHTALLY2=1 is set in-process by the test for the armed legs;
//        the off-mode legs delete it. No other env is read.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

function stage(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { console.log('SKIP need 3+ NPC roster, have ' + roster.length); process.exit(2); }
  const fighter = roster[0], ally1 = roster[1], ally2 = roster[2];
  Game.npcSetNode(fighter, 5, 5);
  Game.npcSetNode(ally1, 5, 5);
  Game.npcSetNode(ally2, 5, 5);
  v.trust = v.trust || {};
  v.trust[ally1] = 50; v.trust[ally2] = 50;
  v.health = v.health || {};
  return { v: v, fighter: fighter, ally1: ally1, ally2: ally2 };
}
function strip(Game, id) {
  try {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (p) { p.items = []; p.equipped = {}; }
  } catch (e) {}
}
function resetHealth(s) {
  s.v.health[s.fighter] = 200; s.v.health[s.ally1] = 100; s.v.health[s.ally2] = 100;
  stripAll(s);
}
function stripAll(s) {
  // strip() needs Game; bound by caller via s.Game
  strip(s.Game, s.fighter); strip(s.Game, s.ally1); strip(s.Game, s.ally2);
}
function hasLine(rec, re) { return (rec.log || []).some(function (s) { return re.test(s); }); }

(async () => {
  // ---------- ARMED LEG (FIGHTALLY2=1, set in-process) ----------
  process.env.FIGHTALLY2 = '1';
  const { Game } = await loadGame({ seed: 424242, mode: 'fightallycap', fullTelemetry: false });
  await setupGame(Game);
  const s = stage(Game);
  s.Game = Game;
  const mdef = (Game.data.monsters || []).find(m => m.id === 'gavel') || {};

  // (a) Shout path: no allyFromStart — the second shout must fire.
  resetHealth(s);
  const recA = Game.fieldFight(s.fighter, mdef, null, { allies: 2, allyVids: [s.ally1, s.ally2] });
  check('armed shout: second ally joins (ally2Vid set)', !!recA.ally2Vid, recA.ally2Vid);
  check('armed shout: ally2Joined recorded, shout2Round 3', recA.ally2Joined === true && recA.shout2Round === 3,
    { ally2Joined: recA.ally2Joined, shout2Round: recA.shout2Round });
  check('armed shout: second-shout line in the log', hasLine(recA, /shouts again!/) && hasLine(recA, /charges in!/),
    (recA.log || []).filter(function (x) { return /shout|charges in/.test(x); }));
  check('armed shout: second ally deals damage (ally2Dealt 5)', recA.ally2Dealt === 5, recA.ally2Dealt);
  check('armed shout: first ally still deals damage (allyDealt - ally2Dealt 14)',
    (recA.allyDealt - recA.ally2Dealt) === 14, recA.allyDealt - recA.ally2Dealt);
  check('armed shout: fight outlasts the off-mode round-3 flee (rounds 4, vFlee)',
    recA.outcome === 'vFlee' && recA.rounds === 4, { outcome: recA.outcome, rounds: recA.rounds });
  check('armed shout: frozen numbers (mDealt 40, vTaken 148, allyDealt 19)',
    recA.mDealt === 40 && recA.vTaken === 148 && recA.allyDealt === 19,
    { mDealt: recA.mDealt, vTaken: recA.vTaken, allyDealt: recA.allyDealt });
  check('armed shout: unwounded allies settle nothing (taken 0, settled false)',
    recA.allyTaken === 0 && recA.ally2Taken === 0 &&
    recA.allyWoundsSettled === false && recA.ally2WoundsSettled === false,
    { allyTaken: recA.allyTaken, ally2Taken: recA.ally2Taken });

  // (b) From-start path: both allies at the door, both fight, both settle.
  resetHealth(s);
  const h1Before = s.v.health[s.ally1], h2Before = s.v.health[s.ally2];
  const recB = Game.fieldFight(s.fighter, mdef, null, { allies: 2, allyVids: [s.ally1, s.ally2], allyFromStart: true });
  check('armed from-start: both allies join at the door', !!recB.allyVid && !!recB.ally2Vid,
    { allyVid: recB.allyVid, ally2Vid: recB.ally2Vid });
  check('armed from-start: second door line in the log', hasLine(recB, /already at the door too/),
    (recB.log || []).filter(function (x) { return /door/.test(x); }));
  check('armed from-start: second ally deals damage (ally2Dealt 49)', recB.ally2Dealt === 49, recB.ally2Dealt);
  check('armed from-start: first ally still deals damage (allyDealt - ally2Dealt 44)',
    (recB.allyDealt - recB.ally2Dealt) === 44, recB.allyDealt - recB.ally2Dealt);
  check('armed from-start: frozen numbers (vDie, 8 rounds, mDealt 141, allyDealt 93)',
    recB.outcome === 'vDie' && recB.rounds === 8 && recB.mDealt === 141 && recB.allyDealt === 93,
    { outcome: recB.outcome, rounds: recB.rounds, mDealt: recB.mDealt, allyDealt: recB.allyDealt });
  check('armed from-start: both allies wounded and settled (taken 22 / 19)',
    recB.allyTaken === 22 && recB.ally2Taken === 19 &&
    recB.allyWoundsSettled === true && recB.ally2WoundsSettled === true,
    { allyTaken: recB.allyTaken, ally2Taken: recB.ally2Taken });
  check('armed from-start: each body carries its own wounds (health drops 22 / 19)',
    (h1Before - s.v.health[s.ally1]) === 22 && (h2Before - s.v.health[s.ally2]) === 19,
    { drop1: h1Before - s.v.health[s.ally1], drop2: h2Before - s.v.health[s.ally2] });
  check('armed from-start: partySize counts both allies (3)',
    recB.partySize === 3, recB.partySize);

  // ---------- OFF-MODE LEG (flag deleted) — byte-identical to pre-change ----------
  delete process.env.FIGHTALLY2;
  const { Game: Game2 } = await loadGame({ seed: 424242, mode: 'fightallycap', fullTelemetry: false });
  await setupGame(Game2);
  const s2 = stage(Game2);
  s2.Game = Game2;
  resetHealth(s2);
  const recC = Game2.fieldFight(s2.fighter, mdef, null, { allies: 2, allyVids: [s2.ally1, s2.ally2] });
  check('off-mode shout: exactly one ally (ally2Vid null, ally2Dealt 0)',
    recC.allyVid != null && recC.ally2Vid == null && (recC.ally2Dealt | 0) === 0,
    { allyVid: recC.allyVid, ally2Vid: recC.ally2Vid, ally2Dealt: recC.ally2Dealt });
  check('off-mode shout: no second-shout line', !hasLine(recC, /shouts again!/) && !hasLine(recC, /door too/));
  check('off-mode shout: pre-change numbers frozen (vFlee, 3 rounds, mDealt 23, vTaken 104, allyDealt 6)',
    recC.outcome === 'vFlee' && recC.rounds === 3 && recC.mDealt === 23 && recC.vTaken === 104 && recC.allyDealt === 6,
    { outcome: recC.outcome, rounds: recC.rounds, mDealt: recC.mDealt, vTaken: recC.vTaken, allyDealt: recC.allyDealt });
  resetHealth(s2);
  const recD = Game2.fieldFight(s2.fighter, mdef, null, { allies: 2, allyVids: [s2.ally1, s2.ally2], allyFromStart: true });
  check('off-mode from-start: exactly one ally at the door',
    recD.allyVid != null && recD.ally2Vid == null && (recD.ally2Dealt | 0) === 0,
    { allyVid: recD.allyVid, ally2Vid: recD.ally2Vid });
  check('off-mode from-start: pre-change numbers frozen (vDie, 11 rounds, mDealt 113, vTaken 200, allyDealt 45)',
    recD.outcome === 'vDie' && recD.rounds === 11 && recD.mDealt === 113 && recD.vTaken === 200 && recD.allyDealt === 45,
    { outcome: recD.outcome, rounds: recD.rounds, mDealt: recD.mDealt, vTaken: recD.vTaken, allyDealt: recD.allyDealt });

  // ---------- DETERMINISM: fresh load, same seed, same off-mode fight ----------
  const { Game: Game3 } = await loadGame({ seed: 424242, mode: 'fightallycap', fullTelemetry: false });
  await setupGame(Game3);
  const s3 = stage(Game3);
  s3.Game = Game3;
  resetHealth(s3);
  const recE = Game3.fieldFight(s3.fighter, mdef, null, { allies: 2, allyVids: [s3.ally1, s3.ally2] });
  check('off-mode determinism: repeat of the shout fight is identical',
    recE.outcome === recC.outcome && recE.rounds === recC.rounds && recE.mDealt === recC.mDealt &&
    recE.vTaken === recC.vTaken && recE.allyDealt === recC.allyDealt && recE.allyVid === recC.allyVid,
    { outcome: recE.outcome, rounds: recE.rounds, mDealt: recE.mDealt });

  console.log(`\n${checks - fails}/${checks} checks passed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('PROOF-FAILED', (e && e.stack) || e); process.exit(1); });
