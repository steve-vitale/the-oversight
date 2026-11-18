// test-lingering-raid-control-20261118.js — proof for finding #2559-A.
//
// Pins the distinction that broke the ladder-bundle control: since
// dc8cbd3f3 (2026-11-15, "linger holds the treeline") a lingering raider
// NEVER raids via monsterTurn() — it holds the treeline by design
// (CASCADE, Steve 2026-10-16 design call #8). So a test rig that sets
// m.lingering = true can never satisfy a "the ambient raid fires"
// control, and a "no raid after delivery" section built on it passes
// vacuously. A raid control must use a non-lingering monster.
//
// Usage: node scripts/test-lingering-raid-control-20261118.js
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

async function freshRig(lingering) {
  const { Game } = await loadGame({ seed: 64203, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  const s = Game.state.scholar; s.mx = 4; s.my = 4;
  const m = Game.spawnWorldMonster({ id: 'suburb' }, hx, hy, { mx: 4, my: 6 });
  m.lingering = lingering;
  return { Game, m, hx, hy };
}

async function countFires(Game, turns) {
  let fires = 0;
  const orig = Game.startCombat;
  Game.startCombat = (...a) => { fires++; return orig.apply(Game, a); };
  await quietLog(() => { for (let i = 0; i < turns; i++) Game.monsterTurn(); });
  Game.startCombat = orig;
  return fires;
}

async function main() {
  console.log('=== test-lingering-raid-control (finding #2559-A) ===');

  // 1. A lingering raider never raids via monsterTurn (the guard).
  {
    const { Game } = await freshRig(true);
    const fires = await countFires(Game, 200);
    console.log(`lingering: 200 monsterTurns, fires=${fires}`);
    check('lingering raider fires NO ambient raid in 200 turns', fires === 0, 'fires ' + fires);
  }

  // 2. The same rig, not lingering, DOES raid (so the control is satisfiable).
  {
    const { Game } = await freshRig(false);
    const fires = await countFires(Game, 200);
    console.log(`not lingering: 200 monsterTurns, fires=${fires}`);
    check('non-lingering raider fires the ambient raid', fires > 0, 'fires ' + fires);
  }

  // 3. The table gate still blocks the non-lingering raider after delivery
  // (the mercy mechanism itself, independent of the lingering guard).
  {
    const { Game } = await freshRig(false);
    try { Game.hierarchyState().push({ kind: 'trade', status: 'active', other: 'X', subordinate: 'X', chartered: true }); } catch (e) {}
    Game.state.nationalLive = true;
    const dl = Game.ladderDeliverCapstone('trade_charter');
    check('charter delivery succeeds for the mercy check', dl.ok === true, JSON.stringify(dl));
    const fires = await countFires(Game, 200);
    console.log(`delivered + not lingering: 200 monsterTurns, fires=${fires}`);
    check('delivered capstone blocks the non-lingering raider', fires === 0, 'fires ' + fires);
  }

  console.log(failures ? `\nRESULT: RED — ${failures} check(s) failed` : '\nRESULT: GREEN — all checks pass');
  process.exit(failures ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error('FATAL:', e && e.message); process.exit(1); });
