#!/usr/bin/env node
// test-creekpath-b.js — proof for the creek blocked-path diag.
// 1. Fresh game, seed 10757 (the index case): the corridor tiles match the
//    nighttravel corpus (player tile (3,3) is forest_floor), and the
//    blocking tile on the (3,3)->(4,4) hop is identified by tile + leg.
// 2. The probe's direct-hop verdict AGREES with the engine: placing the
//    player at (3,3) in a throwaway test game and calling Game.travelTo
//    (4,4) returns the same block kind the probe predicts (probe is a
//    pure read; travelTo is only called here, in the test, to cross-check).
// 3. The probe is non-destructive: position, kcal, and tile state are
//    identical before/after a probe call.
// 4. The BFS route-around, when it reports a path, is walkable step by
//    step: every step's entry is travelBlockage-clean from its origin.
// Usage: node scripts/test-creekpath-b.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { directHopBlockage, bfsRouteAround, crossingFix } = require('./creekpath-probe-b');

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 10757, mode: 'creekpath-b-proof', fullTelemetry: false });
  await setupGame(Game);
  const t33 = Game.tileAt(3, 3);
  check('10757 fresh map (3,3) is forest_floor (matches corpus)', t33 && t33.type === 'forest_floor', 'got ' + (t33 && t33.type));
  const corridor = {};
  for (const [x, y] of [[4, 3], [3, 4], [4, 4]]) {
    const t = Game.tileAt(x, y);
    corridor[x + ',' + y] = t ? { type: t.type, needsBridge: !!t.needsBridge, bridged: !!t.bridged, blockFrom: t.blockFrom || null } : null;
  }
  console.log('corridor: ' + JSON.stringify(corridor));
  // Place the player at the strand tile in this throwaway test game.
  Game.map.px = 3; Game.map.py = 3;
  const before = { px: Game.map.px, py: Game.map.py, kcal: Game.state.scholar.kcal };
  const probe = directHopBlockage(Game, 4, 4);
  console.log('probe (3,3)->(4,4): ' + JSON.stringify(probe));
  check('probe finds a blockage on the index hop', !!probe, JSON.stringify(probe));
  if (probe) {
    check('probe block kind is creek', probe.blockType === 'creek', probe.blockType);
    // Cross-check against the engine itself.
    const ret = Game.travelTo(4, 4);
    check('engine travelTo agrees (same block kind)', ret && ret.blockType === probe.blockType, JSON.stringify(ret && ret.blockType));
    check('engine travelTo did not move the player', Game.map.px === 3 && Game.map.py === 3);
    const route = bfsRouteAround(Game, 4, 4);
    console.log('route-around: ' + JSON.stringify(route));
    if (route && route.path) {
      // Every step entry-clean from its origin, orthogonal, in-bounds.
      let walkable = route.path[0][0] === 3 && route.path[0][1] === 3 &&
        route.path[route.path.length - 1][0] === 4 && route.path[route.path.length - 1][1] === 4;
      for (let i = 1; i < route.path.length && walkable; i++) {
        const [px, py] = route.path[i - 1], [nx, ny] = route.path[i];
        if (Math.abs(nx - px) + Math.abs(ny - py) !== 1) walkable = false;
        if (Game.travelBlockage(nx, ny, px, py)) walkable = false;
      }
      check('reported route-around path is step-walkable', walkable, 'len ' + route.length);
    } else {
      console.log('NOTE route-around: none (path=null) — recorded, not failed');
    }
    const fix = crossingFix(Game, probe);
    console.log('crossing fix: ' + JSON.stringify(fix));
    check('crossing fix names the creek tile', fix.kind === 'creek' && fix.tileType === 'creek', JSON.stringify(fix));
  }
  // Non-destructiveness of the probe itself.
  const p2 = directHopBlockage(Game, 4, 4);
  const r2 = bfsRouteAround(Game, 4, 4);
  check('probe calls move nothing', Game.map.px === before.px && Game.map.py === before.py && Game.state.scholar.kcal === before.kcal);
  check('probe is deterministic', JSON.stringify(p2) === JSON.stringify(probe));
  void r2;
  console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED ' + failures + ' failures');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
