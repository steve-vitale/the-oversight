#!/usr/bin/env node
// test-journey-scale-r131-phantom-veteran-20261111.js — proof test for the
// journey-scale r131 readiness phantom-veteran fix (lane A, leg 3).
//
// THE DEFECT (vetfirst-b, Loop B, evidence/2026-11-11/sim-vetfirst-b.md §9,
// seed 190305): `waveCombatReadiness(4).veterans` = 1 while
// `_ladderLivingVeterans(4)` = 0 and the instrument recomputation = 0.
// The two veteran counts disagree on the day the village's last veterans
// die — the readiness gate reads a dead veteran as living.
//
// MECHANISM (read in code): `ladder.js` `countLivingVeterans.isLiving`
// requires roster membership (`roster.indexOf(vid) < 0 → false`) and then
// checks `vp.dead`. `standing.js` `waveCombatReadiness.isLiving` has NO
// roster check — `vp && !vp.dead` only. The TB combat death path
// (`game.js` `tbVillagerFalls`) removes the villager from `v.roster` and
// `v.villagers` and pushes a fallen row, but NEVER sets `rec.dead = true`
// — unlike `removeVillager('killed'/'ambushed')` (`betrayal.js:1233-1238`,
// "DEAD IS DEAD (2026-10-08)"). So a veteran who falls in a TB fight
// keeps a live-reading vp record and is counted by readiness from then
// on, while the ladder correctly counts 0. `waveUnlockReady()` reads
// `waveCombatReadiness()`, so the phantom can wrongly show a wave ready
// and wrongly trigger `villageBlooded()`.
//
// THE FIX (one line, standing.js): add the roster check to
// `waveCombatReadiness.isLiving`, mirroring `countLivingVeterans`:
//   if (roster.indexOf(vid) < 0) return false;
// `roster` is already in scope. No demand, number, or bar changes; the
// scholar still counts (scholarId → true first, same as ladder). The
// wider `tbVillagerFalls` vp.dead lie is NOT fixed here (carried — it
// touches every vp.dead reader and needs a panel to adjudicate).
//
// PROOF SHAPE: a roster villager is given a wave-3 (or wave-4) kill in
// `state.waveKillLog`, then killed down the TB path. RED before the fix
// (readiness 1, ladder 0); GREEN after (both 0). The removeVillager
// control proves the divergence is TB-path-specific. A living second
// veteran proves the fix does not undercount.
//
// Usage: node scripts/test-journey-scale-r131-phantom-veteran-20261111.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-scale-r131-phantom-veteran');

function counts(Game) {
  let r4 = -1, r5 = -1, l3 = -1, l4 = -1;
  try { r4 = (Game.waveCombatReadiness(4) || {}).veterans; } catch (e) { r4 = 'ERR:' + (e && e.message); }
  try { r5 = (Game.waveCombatReadiness(5) || {}).veterans; } catch (e) { r5 = 'ERR:' + (e && e.message); }
  try { l3 = Game._ladderLivingVeterans(3); } catch (e) { l3 = 'ERR:' + (e && e.message); }
  try { l4 = Game._ladderLivingVeterans(4); } catch (e) { l4 = 'ERR:' + (e && e.message); }
  return { r4, r5, l3, l4 };
}
function fmt(c) { return 'r4=' + c.r4 + ' r5=' + c.r5 + ' l3=' + c.l3 + ' l4=' + c.l4; }

(async () => {
  const Game = await K.load({ seed: 131100 });

  // fresh(): a new expedition, departed, with a roster. Returns two
  // distinct non-scholar roster villagers (vidA, vidB) and the scholar id.
  function fresh() {
    K.newRun(Game);
    Game.state.waveKillLog = Game.state.waveKillLog || [];
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    if (others.length < 2) throw new Error('fresh run has <2 non-scholar roster members: ' + JSON.stringify(roster));
    return { vidA: others[0], vidB: others[1], scholarId, roster };
  }
  function giveKill(vid, w) {
    Game.state.waveKillLog.push({ by: vid, w: w, day: Game.state.scholar.day || 1 });
  }
  function onRoster(vid) { return ((Game.state.village || {}).roster || []).includes(vid); }
  function vpDead(vid) {
    try { const vp = Game.vpOf(vid); return !!(vp && vp.dead); } catch (e) { return 'ERR'; }
  }

  // ---- 1. Alive: both reads agree the veteran stands ----
  T.section('1. Alive veteran — both reads agree');
  let f = fresh();
  giveKill(f.vidA, 3);
  let c = counts(Game);
  T.ok('alive w3 killer: readiness(4).veterans = 1', c.r4 === 1, fmt(c));
  T.ok('alive w3 killer: _ladderLivingVeterans(3) = 1', c.l3 === 1, fmt(c));
  T.ok('alive w3 killer: readiness(5) = 0 (w3 does not lift w5)', c.r5 === 0, fmt(c));
  T.ok('alive w3 killer: _ladderLivingVeterans(4) = 0', c.l4 === 0, fmt(c));

  // ---- 2. TB fall: the defect (RED before, GREEN after) ----
  T.section('2. TB fall — the phantom (vetfirst 190305)');
  f = fresh();
  giveKill(f.vidA, 3);
  Game.tbVillagerFalls({ villagerId: f.vidA });
  T.ok('TB fall removes the villager from the roster', !onRoster(f.vidA),
    'roster: ' + JSON.stringify((Game.state.village || {}).roster));
  c = counts(Game);
  T.ok('after TB fall: _ladderLivingVeterans(3) = 0', c.l3 === 0, fmt(c));
  T.ok('after TB fall: waveCombatReadiness(4).veterans = 0 (no phantom)', c.r4 === 0, fmt(c));
  T.ok('after TB fall: readiness(4) == ladder(3) (the two never drift)', c.r4 === c.l3, fmt(c));

  // ---- 3. Mechanism: the vp record still reads alive ----
  T.section('3. Mechanism — vp.dead is never set by the TB path');
  T.ok('after TB fall: vp.dead is still unset (the lie, documented)',
    vpDead(f.vidA) === false, 'vp.dead=' + vpDead(f.vidA));

  // ---- 4. Control: removeVillager marks dead, both read 0 ----
  T.section('4. Control — removeVillager(killed) marks dead');
  f = fresh();
  giveKill(f.vidA, 3);
  Game.removeVillager(f.vidA, 'killed');
  T.ok('removeVillager removes the villager from the roster', !onRoster(f.vidA),
    'roster: ' + JSON.stringify((Game.state.village || {}).roster));
  T.ok('removeVillager sets vp.dead = true', vpDead(f.vidA) === true,
    'vp.dead=' + vpDead(f.vidA));
  c = counts(Game);
  T.ok('after removeVillager: readiness(4) = 0', c.r4 === 0, fmt(c));
  T.ok('after removeVillager: ladder(3) = 0', c.l3 === 0, fmt(c));

  // ---- 5. No undercount: a living second veteran still counts ----
  T.section('5. No undercount — living second veteran still counts');
  f = fresh();
  giveKill(f.vidA, 3);
  giveKill(f.vidB, 3);
  Game.tbVillagerFalls({ villagerId: f.vidA });
  c = counts(Game);
  T.ok('one TB-fallen + one living: readiness(4) = 1', c.r4 === 1, fmt(c));
  T.ok('one TB-fallen + one living: ladder(3) = 1', c.l3 === 1, fmt(c));
  T.ok('one TB-fallen + one living: readiness == ladder', c.r4 === c.l3, fmt(c));

  // ---- 6. Wave-4 kill + TB fall: the wave-5 bar agrees too ----
  T.section('6. Wave-4 kill + TB fall — the wave-5 bar');
  f = fresh();
  giveKill(f.vidA, 4);
  c = counts(Game);
  T.ok('alive w4 killer: readiness(5).veterans = 1', c.r5 === 1, fmt(c));
  T.ok('alive w4 killer: _ladderLivingVeterans(4) = 1', c.l4 === 1, fmt(c));
  Game.tbVillagerFalls({ villagerId: f.vidA });
  c = counts(Game);
  T.ok('after TB fall: readiness(5) = 0 (no phantom)', c.r5 === 0, fmt(c));
  T.ok('after TB fall: ladder(4) = 0', c.l4 === 0, fmt(c));
  T.ok('after TB fall: readiness(5) == ladder(4)', c.r5 === c.l4, fmt(c));

  // ---- 7. Scholar kill still counts (no overcorrection) ----
  T.section('7. Scholar kill still counts (Steve RULED 2026-11-10)');
  f = fresh();
  giveKill(f.scholarId, 3);
  c = counts(Game);
  T.ok('scholar w3 kill: readiness(4) = 1', c.r4 === 1, fmt(c));
  T.ok('scholar w3 kill: ladder(3) = 1', c.l3 === 1, fmt(c));

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
