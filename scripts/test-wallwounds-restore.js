#!/usr/bin/env node
// scripts/test-wallwounds-restore.js — sim-wallwounds-a unit proof.
//
// Drives the REAL Game.tbEnd (src/js/game.js) on a loaded game
// (shared sim-harness, NOT a stubbed tbEnd) and asserts the
// lingerer-restore rule: a lost/fled fight against a lingering
// raider restores the world monster to
//   min(pre-fight world HP, fighter end HP)
// — never above the wounds it went into the fight with — while
// every other restore path keeps its old behavior.
//
// Cases (all on the real tbEnd code path):
//   1. lingerer LOST, fighter ends ABOVE pre-fight (the traced
//      75106 case: pre 675, fighter 740) -> world 675.
//   2. lingerer FLED, fighter ends ABOVE pre-fight (pre 675,
//      fighter 800) -> world 675.
//   3. lingerer LOST, fighter ends BELOW pre-fight (pre 675,
//      fighter 500) -> world 500 (wounds deepen, never erased).
//   4. TITAN lost, fighter ends below max (max 1200, fighter
//      900) -> world 1200 (full restore, UNCHANGED by the fix).
//   5. lingerer WON (monster slain, dead fighter) -> NOT
//      re-pushed (no restore on a kill).
//   6. lingerer ROUTED (broke and ran) -> NOT re-pushed.
//
// Scaffolding, stated not hidden: the 'lost' tail calls
// playerDeath on a real game (succession machinery), which would
// swamp the restore assertion with unrelated side effects, so
// 'lost' cases set state.phoenixLink = { bearerIsPlayer: true }
// — the fire holds the death and the 'lost' path skips
// playerDeath. The phoenix flag is read NOWHERE in the restore
// block, so it cannot change the asserted behavior; it only
// keeps the test game alive to read the assertion.
// Monster fighters use the REAL eulogy mdef from
// src/data/monsters.json. The world object is placed on a tile
// with no monster (scanned via monsterAt), as the restore guard
// requires, and is NOT in the world list at tbEnd time (lifted,
// as startCombat leaves it).
//
// Exit 0 only when every case passes; each failure names its case.
// This test is EXPECTED to fail cases 1-2 on unmodified code
// (740/800 restored, the bug) and pass all cases after the fix.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

function emptyTile(Game) {
  for (let y = 0; y <= 8; y++) {
    for (let x = 0; x <= 8; x++) {
      try { if (!Game.monsterAt(x, y)) return { x: x, y: y }; } catch (e) { /* keep scanning */ }
    }
  }
  return { x: 0, y: 0 };
}

function fighter(Game, mdef, hp, alive) {
  return {
    key: 'm_0', kind: 'monster', monsterId: mdef.id,
    name: 'The Eulogy', emoji: mdef.emoji || '👹',
    hp: hp, maxHp: hp, speed: mdef.speed || 3,
    mx: 4, my: 4, alive: !!alive, fled: false, telegraph: null,
    mdef: mdef, hesitate: 0, blind: 0, stunned: 0, beamCooldown: 0,
    dwellTaught: false, beamPhase: 'stalk', threatQueue: [],
    veteran: false,
  };
}

function runCase(Game, mdef, spec) {
  const tile = emptyTile(Game);
  const o = {
    id: spec.id || 'eulogy', lingering: !!spec.lingering,
    titan: !!spec.titan, hp: spec.preHp, maxHp: spec.maxHp,
    tx: tile.x, ty: tile.y, wave: 4,
  };
  const f = fighter(Game, mdef, spec.fighterHp, spec.fighterAlive);
  if (spec.fighterMaxHp != null) { f.hp = spec.fighterHp; f.maxHp = spec.fighterMaxHp; }
  Game.tbfight = {
    id: 'ftest_' + spec.name, fighters: [f], order: [f],
    turnIdx: 0, round: 1, over: false, result: null,
    gridSize: 9, terraform: {}, worldOrigin: o,
  };
  if (spec.phoenix) {
    try { Game.state.phoenixLink = { bearerIsPlayer: true }; } catch (e) { /* best-effort */ }
  }
  let threw = null;
  try { Game.tbEnd(spec.result); } catch (e) { threw = e; }
  if (spec.phoenix) {
    try { Game.state.phoenixLink = null; } catch (e) { /* best-effort */ }
  }
  let present = false, hp = null;
  try {
    const list = Game.worldMonsters();
    present = list.indexOf(o) >= 0;
    if (present) hp = o.hp;
  } catch (e) { /* read best-effort */ }
  return { name: spec.name, threw: threw, present: present, hp: hp,
    expectPresent: spec.expectPresent, expectHp: spec.expectHp };
}

async function main() {
  const { Game } = await loadGame({ seed: 42, mode: 'wallwounds-restore', fullTelemetry: false });
  await setupGame(Game);
  const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(monsters) ? monsters : (monsters.monsters || []);
  const mdef = list.find(m => m && m.id === 'eulogy');
  if (!mdef) { console.error('FAIL: eulogy mdef not found in src/data/monsters.json'); process.exit(1); }

  const specs = [
    // The traced case: toll-wounded lingerer (675/900) loses a TB
    // fight the fighter ends at 740. Old code restores 740 (heals
    // the toll); fixed code restores 675.
    { name: 'linger-lost-fighter-above', result: 'lost', lingering: true, titan: false,
      preHp: 675, maxHp: 900, fighterHp: 740, fighterMaxHp: 914, fighterAlive: true,
      phoenix: true, expectPresent: true, expectHp: 675 },
    { name: 'linger-fled-fighter-above', result: 'fled', lingering: true, titan: false,
      preHp: 675, maxHp: 900, fighterHp: 800, fighterMaxHp: 914, fighterAlive: true,
      phoenix: false, expectPresent: true, expectHp: 675 },
    { name: 'linger-lost-fighter-below', result: 'lost', lingering: true, titan: false,
      preHp: 675, maxHp: 900, fighterHp: 500, fighterMaxHp: 914, fighterAlive: true,
      phoenix: true, expectPresent: true, expectHp: 500 },
    { name: 'titan-lost-full-restore', result: 'lost', lingering: false, titan: true,
      preHp: 900, maxHp: 1200, fighterHp: 900, fighterMaxHp: 1200, fighterAlive: true,
      phoenix: true, expectPresent: true, expectHp: 1200 },
    { name: 'linger-won-no-restore', result: 'won', lingering: true, titan: false,
      preHp: 675, maxHp: 900, fighterHp: 0, fighterMaxHp: 914, fighterAlive: false,
      phoenix: false, expectPresent: false, expectHp: null },
    { name: 'linger-routed-no-restore', result: 'routed', lingering: true, titan: false,
      preHp: 675, maxHp: 900, fighterHp: 700, fighterMaxHp: 914, fighterAlive: true,
      phoenix: false, expectPresent: false, expectHp: null },
  ];

  let fail = 0;
  for (const spec of specs) {
    const r = runCase(Game, mdef, spec);
    const hpOk = (spec.expectHp === null) ? true : (r.hp === spec.expectHp);
    const ok = !r.threw && r.present === spec.expectPresent && hpOk;
    if (!ok) fail++;
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${r.name}: present=${r.present} (want ${spec.expectPresent}) hp=${r.hp} (want ${spec.expectHp}) threw=${r.threw ? String(r.threw.message || r.threw).slice(0, 120) : 'no'}`);
  }
  console.log(fail === 0 ? 'WALLWOUNDS-RESTORE: ALL PASS' : `WALLWOUNDS-RESTORE: ${fail} FAIL`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
