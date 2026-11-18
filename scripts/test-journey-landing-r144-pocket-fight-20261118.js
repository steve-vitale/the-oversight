#!/usr/bin/env node
'use strict';
// Proof: fight placement never strands the player across a wall
// (journey-landing r144, 2026-11-18).
// Panel shape: seed 1223 d11, tile (6,4) — the tile's blocking detail
// splits the 9x9 board into two disconnected open regions. The scholar
// stood at (2,3) in one region; The Understudy (wave 2, 108 HP) stood
// at (1,1) in the other. findPath scholar->monster was null, so every
// move failed ("No path there."): 10 stuck turns, 26 failed moves,
// 0 strikes, won at full HP while allies in the monster's region
// ground it down. tbPlaceHumans only checks legality (non-blocking,
// untaken), never connectivity to the monster, and freeSpotNear only
// checks terrainBlocked — so placement can strand the player.
// RED: after startCombat on the pocket geometry, findPath from the
// player to the monster is null (and the monster is still at (1,1)).
// GREEN (post-fix): the monster is moved onto the closest cell the
// player can reach, findPath is non-null, and a fight that already
// has a path leaves the monster exactly where it stood.
// Cases: (1) pocket replay — monster (1,1), unreachable pre-fight;
// (2) control — monster (5,3), reachable pre-fight, must NOT move.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

function stageFight(Game, mx, my) {
  const s = Game.state.scholar;
  Game.map.px = 6; Game.map.py = 4;
  s.mx = 2; s.my = 3;
  if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
  // No joiners: the fixture is player vs monster, nothing else.
  Game.state.village.roster = [];
  const vpos = Game.state.village.positions || {};
  for (const k of Object.keys(vpos)) vpos[k] = { mx: 8, my: 8 };
  // playerMonster() adopts a plain {id,mx,my} into the world list at the
  // current tile, so startCombat reads it as the world monster.
  s.monster = { id: 'understudy', mx, my };
  Game.startCombat('understudy');
  const f = Game.tbfight;
  const p = Game.tbFighter('p');
  const m = f.fighters.find(x => x.kind === 'monster');
  return { f, p, m };
}

async function main() {
  // ---- (1) POCKET REPLAY: monster (1,1), across the wall ----
  const G1 = await K.load({ seed: 1223 });
  K.newRun(G1);
  G1.map.px = 6; G1.map.py = 4; // the panel tile, before the pre-check
  // Anchor the fixture: the exact panel geometry must be a real pocket
  // on this build, or the test proves nothing.
  check('(1) fixture is a real pocket (no path pre-fight)',
    G1.findPath(2, 3, 1, 1) == null);
  const c1 = stageFight(G1, 1, 1);
  check('(1) fight started', !!c1.f && !!c1.p && !!c1.m);
  check('(1) the monster moved off its pocket cell',
    !(c1.m.mx === 1 && c1.m.my === 1),
    `still at (1,1)`);
  const path1 = G1.findPath(c1.p.mx, c1.p.my, c1.m.mx, c1.m.my);
  check('(1) the player can now path to the monster',
    path1 && path1.length > 0,
    `monster at (${c1.m.mx},${c1.m.my}), path=${JSON.stringify(path1)}`);
  console.log(`      monster relocated to (${c1.m.mx},${c1.m.my}), path len ${path1.length}`);

  // ---- (2) CONTROL: monster (5,3), already reachable ----
  const G2 = await K.load({ seed: 1223 });
  K.newRun(G2);
  G2.map.px = 6; G2.map.py = 4; // same panel tile, before the pre-check
  check('(2) fixture is reachable pre-fight',
    G2.findPath(2, 3, 5, 3) != null);
  const c2 = stageFight(G2, 5, 3);
  check('(2) fight started', !!c2.f && !!c2.p && !!c2.m);
  check('(2) the monster was NOT moved (path already existed)',
    c2.m.mx === 5 && c2.m.my === 3,
    `moved to (${c2.m.mx},${c2.m.my})`);
  const path2 = G2.findPath(c2.p.mx, c2.p.my, c2.m.mx, c2.m.my);
  check('(2) the player can path to the monster',
    path2 && path2.length > 0);

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
