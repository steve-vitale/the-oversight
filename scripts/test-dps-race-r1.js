#!/usr/bin/env node
// test-dps-race-r1.js — PROOF for the scale-wall r1 "DPS-RACE" lever (policy-side).
//
// Mechanism: competent.fight gauges the damage race after a couple of
// exchanges (measured dealt/strike vs taken/turn, projected rounds-to-kill
// vs rounds-to-die) and disengages a lost race while HP is still high —
// instead of fighting to the 35% HP threshold like the sim-combat-r1
// raccoon replay (11 rounds at ~1 dealt/round vs 13-16 taken, death
// mid-retreat).
//
// A/B/C use a prepared hushwolf attack profile with pack/retreat side rules
// isolated, plus the repaired directional exit. Ordinary low-HP wolves can
// now rout; the fixture tests the race decision, not natural wolf behavior.
//   A: LOST race (bare-handed vs 300-HP hushwolf, gate ON): ctx.dpsFled
//      fires and the first flee happens with the player clearly alive
//      (php well above the legacy 35% threshold).
//   B: WON race (bare-handed vs 20-HP hushwolf, gate ON): no dpsFled —
//      the policy finishes it.
//   C: GATE OFF (COMPETENT_DPS_RACE=0): the lever is inert — no dpsFled,
//      no dpsWindows; the legacy HP-threshold behavior is untouched.
//
// Usage: node scripts/test-dps-race-r1.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

function drivePolicyFight(Game, policy, ctx, maxCalls) {
  let calls = 0;
  const originalFight = Game.tbfight;
  while (Game.tbfight === originalFight && Game.tbfight && !Game.tbfight.over && calls++ < (maxCalls || 80) && !Game.over) {
    if (!Game.tbIsPlayerTurn()) break;
    let handled = false;
    try { handled = policy.fight(Game, ctx); }
    catch (e) { console.error('fight threw: ' + (e && e.message)); break; }
    if (!handled) break;
  }
  return calls;
}

async function scenario(monsterHp, gateOn, seed) {
  const directionalBefore = process.env.COMPETENT_DIRECTIONAL_FLEE;
  // Use the repaired directional exit for survival, not a nearest-edge chase.
  process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
  if (gateOn) process.env.COMPETENT_DPS_RACE = '1';
  else delete process.env.COMPETENT_DPS_RACE;
  const { Game } = await loadGame({ seed, mode: 'dpsrace-proof' });
  Game.debugRegion = 'na_eastern_woodlands'; // explicit woodland scene fixture
  await setupGame(Game);
  const ctx = {};
  const s = Game.state.scholar;
  s.health = 100; s.kcal = 2600; s.hydration = 80; s.energy = 100;
  s.trauma = 0;
  const originalBearer = Game.villagerId;
  s.stats = { str: 8, end: 5, per: 5, agi: 5, pre: 5 };
  // Prepared outdoor contact beside an exit: this tests extraction, not
  // a generated hall position that can hold the player inside Haven.
  Game.map.px = 3; Game.map.py = 4; s.insideHaven = false; s.mx = 1; s.my = 4;
  // Both named scenarios are bare-handed, without randomly generated escape perks.
  s.equipped = {}; s.inventory = []; s.abilities = []; s.backgroundAbilities = []; Game.state.codex.skills = {};
  Game.startCombat('hushwolf');
  const f = Game.tbfight;
  if (!f) throw new Error('no fight started');
  const mo = f.fighters.find(x => x.kind === 'monster');
  // Prepared hushwolf attack profile without pack/fear/retreat side rules.
  // Those can rout a 20-HP wolf before the race policy's finishing strike.
  // This fixture tests the damage race and the player's extraction only.
  mo.mdef = { ...mo.mdef, id: 'dps_race_fixture', fleeAt: 0 };
  mo.wolfBroken = false;
  mo.hp = monsterHp; mo.maxHp = monsterHp;
  mo.mx = 6; mo.my = 4;
  const p0 = Game.tbFighter('p');
  p0.mx = 7; p0.my = 4; // contact beside the eastward Haven exit
  p0.hp = 100; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true;
  drivePolicyFight(Game, competent, ctx);
  if (directionalBefore == null) delete process.env.COMPETENT_DIRECTIONAL_FLEE;
  else process.env.COMPETENT_DIRECTIONAL_FLEE = directionalBefore;
  return {
    ctx,
    dpsFled: ctx.dpsFled || 0,
    dpsWindows: ctx.dpsWindows || 0,
    firstDetail: ctx.dpsFledFirstDetail || null,
    gameOver: !!Game.over,
    monsterHp: mo.hp,
    bearerAlive: p0.alive && p0.hp > 0 && Game.villagerId === originalBearer,
    fightOver: f.over || !Game.tbfight,
  };
}

(async () => {
  let fails = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : ''));
    if (!cond) fails++;
  };

  // A: lost race — bare-handed vs 300-HP hushwolf.
  // SEEDS re-derived after origins-world 2026-10-14 rerolled the starting
  // roster's RNG draws (different landing + map per seed). Same scenarios,
  // same assertions: 11->13 (A/C), 22->23 (B), 44->46 (D replay).
  const A = await scenario(300, true, 13);
  console.log('A detail:', JSON.stringify(A.firstDetail), 'monsterHp=' + A.monsterHp, 'gameOver=' + A.gameOver);
  check('A: dpsFled fires on the lost race', A.dpsFled >= 1, 'dpsFled=' + A.dpsFled);
  check('A: first flee happens while the player is clearly alive (>35% HP)',
    A.firstDetail && A.firstDetail.php > 35, 'php@flee=' + (A.firstDetail && A.firstDetail.php));
  check('A: the race projection is sane (fewer rounds to die than to kill)',
    A.firstDetail && A.firstDetail.roundsToDie < A.firstDetail.roundsToKill,
    JSON.stringify(A.firstDetail));
  check('A: the original player survives the disengagement', !A.gameOver && A.bearerAlive, 'gameOver=' + A.gameOver);

  // B: won race — 20-HP hushwolf. Policy should finish it, not flee.
  const B = await scenario(20, true, 23);
  console.log('B: dpsFled=' + B.dpsFled, 'monsterHp=' + B.monsterHp, 'gameOver=' + B.gameOver);
  check('B: no dpsFled on the won race', B.dpsFled === 0, 'dpsFled=' + B.dpsFled);
  check('B: the monster dies', B.monsterHp <= 0, 'monsterHp=' + B.monsterHp);
  check('B: the original player lives', !B.gameOver && B.bearerAlive, 'gameOver=' + B.gameOver);

  // C: gate off — legacy behavior, lever inert.
  const C = await scenario(300, false, 13);
  console.log('C: dpsFled=' + C.dpsFled, 'dpsWindows=' + C.dpsWindows, 'gameOver=' + C.gameOver);
  check('C: gate off => no dpsFled', C.dpsFled === 0, 'dpsFled=' + C.dpsFled);
  check('C: gate off => no assessment windows ran', C.dpsWindows === 0, 'dpsWindows=' + C.dpsWindows);

  // D: THE BARRIER PUSH (seed-44 belltoad replay) — a lost race vs a chaser
  // that the old walk-to-edge flee could never exit: the scholar must push
  // THROUGH the edge (tbBarrierExit) and live, not stand at the edge dying.
  process.env.COMPETENT_DPS_RACE = '1';
  {
    const { Game } = await loadGame({ seed: 46, mode: 'dpsrace-proof-D' });
    Game.debugRegion = 'na_eastern_woodlands'; // explicit woodland scene fixture
    await setupGame(Game);
    const ctx = {};
    const s = Game.state.scholar;
    s.health = 100; s.kcal = 2600; s.hydration = 80; s.energy = 100; s.trauma = 0;
    Game.startCombat('belltoad');
    const f = Game.tbfight;
    if (!f) throw new Error('no belltoad fight started');
    const mo = f.fighters.find(x => x.kind === 'monster');
    mo.hp = 150; mo.maxHp = 150; // lost race, and it will not die before the assessment
    const p0 = Game.tbFighter('p');
    p0.hp = 100; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true;
    // start the scholar ON the edge — the old flee's no-op trap
    p0.mx = 8; p0.my = 8;
    drivePolicyFight(Game, competent, ctx, 60);
    const pushes = ctx.barrierPushes || 0;
    const ended = !Game.tbfight || Game.tbfight.over;
    console.log(`D: dpsFled=${ctx.dpsFled || 0} barrierPushes=${pushes} fightEnded=${ended} gameOver=${!!Game.over}`);
    check('D: the scholar pushes through the barrier (not a no-op edge walk)', pushes >= 1, 'barrierPushes=' + pushes);
    check('D: the lost race ends with the scholar alive', ended && !Game.over, `ended=${ended} gameOver=${!!Game.over}`);
  }

  delete process.env.COMPETENT_DPS_RACE;
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
