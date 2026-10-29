#!/usr/bin/env node
// test-beyond-blockage.js — proof for fixall-map slice 4 (blockage/bridge
// parity beyond the edge).
// Bars (pre-registered evidence/2026-10-28/sim-fixall-map-slice4-blockage.md):
//   1. destination parity: a beyond fallen-tree tile refuses from its
//      guarded side; a beyond needsBridge creek refuses a non-swimmer
//   2. intermediate parity (the hole): a 2-tile jump from beyond onto a
//      revealed home tile, over a beyond intermediate guarding the jump's
//      approach side, REFUSES with the intermediate's block. On the
//      slice-3 base the identical scenario SUCCEEDS (before/after via a
//      git-archive scratch copy of the slice-3 commit — see closeout).
//   3. first-ring exemption: no Chebyshev-5 beyond tile carries a blockage
//   4. city exemption: no tile of a sampled city cell carries a blockage
//   5. determinism: a regen child reproduces blockFrom/needsBridge
//   6. home regression: a home-board jump over a home intermediate
//      blockage still refuses with the intermediate's block
// Uses the shared sim harness (loadGame + setupGame), never copied eval
// code. Player positioning is harness positioning (as in the slice-1/3
// guards); what is proven is the refusal logic, not the walk to the spot.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { spawnSync } = require('child_process');

const SEEDS = [7, 42, 99];
const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
  else console.log('  ok: ' + msg);
};
const cheb = (x, y) => Math.max(Math.abs(x - 4), Math.abs(y - 4));
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function placePlayer(Game, x, y) {
  Game.map.px = x; Game.map.py = y;
  Game.state.scholar.insideHaven = false;
  Game.markSeen(x, y, 'visited');
  Game.reveal(x, y);
  const t = Game.tileAt(x, y);
  if (t) t.visited = true;
}

async function runSeed(seed) {
  console.log(`\n=== seed ${seed} ===`);
  const { Game } = await loadGame({ seed, narration: true });
  await setupGame(Game, 'Columbus, Ohio');
  const hasMonster = (x, y) => !!(Game.monsterAt && Game.monsterAt(x, y));

  // BAR 3: first ring (Chebyshev == 5) carries no blockage.
  let ringBlocked = 0, ringChecked = 0;
  for (let y = -1; y <= 13; y++) for (let x = -1; x <= 13; x++) {
    if (x >= 0 && x < 9 && y >= 0 && y < 9) continue;
    if (cheb(x, y) !== 5) continue;
    ringChecked++;
    const t = Game.beyondTile(x, y);
    if (t.blockFrom || t.needsBridge) ringBlocked++;
  }
  check(ringChecked > 0 && ringBlocked === 0, `first ring: ${ringChecked} tiles checked, ${ringBlocked} blocked`);

  // BAR 4: a sampled city cell carries no blockage.
  let cityCell = null;
  for (let cy = -4; cy <= 4 && !cityCell; cy++) for (let cx = -4; cx <= 4 && !cityCell; cx++) {
    const t = Game.beyondTile(cx * 8 + 3, cy * 8 + 3);
    if (t.district && cheb(cx * 8 + 3, cy * 8 + 3) > 12) cityCell = { cx, cy };
  }
  if (cityCell) {
    let cityBlocked = 0;
    for (let ly = 0; ly < 8; ly++) for (let lx = 0; lx < 8; lx++) {
      const t = Game.beyondTile(cityCell.cx * 8 + lx, cityCell.cy * 8 + ly);
      if (t.blockFrom || t.needsBridge) cityBlocked++;
    }
    check(cityBlocked === 0, `city cell ${cityCell.cx},${cityCell.cy}: 0 blocked tiles (got ${cityBlocked})`);
  } else {
    console.log('  (no far city cell in scan range — city exemption unchecked on this seed)');
  }

  // BAR 1a: beyond fallen-tree destination refuses from its guarded side.
  let destTile = null;
  outer: for (let y = -20; y <= 28; y++) for (let x = -20; x <= 28; x++) {
    if (cheb(x, y) <= 5) continue;
    const t = Game.beyondTile(x, y);
    if (!t.blockFrom || t.type === 'building' || t.type === 'cache') continue;
    const ox = x + t.blockFrom.dx, oy = y + t.blockFrom.dy;
    if (hasMonster(x, y) || hasMonster(ox, oy)) continue;
    destTile = { x, y, tile: t, ox, oy };
    break outer;
  }
  check(!!destTile, 'a beyond blocked wild tile exists for the destination check');
  if (destTile) {
    if (destTile.ox < 0 || destTile.ox > 8 || destTile.oy < 0 || destTile.oy > 8) Game.beyondTile(destTile.ox, destTile.oy);
    placePlayer(Game, destTile.ox, destTile.oy);
    const res = Game.travelTo(destTile.x, destTile.y);
    check(!!res && res.blockType === destTile.tile.blockFrom.type, `beyond destination refuses from guarded side (blockType=${res && res.blockType}, expected ${destTile.tile.blockFrom.type})`);
    check(Game.map.px === destTile.ox && Game.map.py === destTile.oy, 'refused destination left the player unmoved');
    // BAR 5: regen reproduces the blockage.
    const child = spawnSync(process.execPath, [__filename, '--regen', String(seed), String(destTile.x), String(destTile.y)], { encoding: 'utf8' });
    let regen = null;
    try { regen = JSON.parse(child.stdout.trim().split('\n').pop()); } catch (e) { /* fall through */ }
    check(!!regen, 'regen child produced JSON for the blocked tile');
    if (regen) {
      check(JSON.stringify(regen.blockFrom || null) === JSON.stringify(destTile.tile.blockFrom || null), `regen blockFrom matches (${JSON.stringify(regen.blockFrom)})`);
      check(!!regen.needsBridge === !!destTile.tile.needsBridge, 'regen needsBridge matches');
    }
  }

  // BAR 1b: beyond needsBridge creek refuses a non-swimmer.
  check(!Game.hasAbility || !Game.hasAbility('swimmer'), 'player is not a swimmer (bridge test is meaningful)');
  let creekTile = null;
  outer2: for (let y = -20; y <= 28; y++) for (let x = -20; x <= 28; x++) {
    if (cheb(x, y) <= 5) continue;
    const t = Game.beyondTile(x, y);
    if (t.type !== 'creek' || !t.needsBridge) continue;
    // Find an approach side the tile's own blockFrom (if any) does not guard.
    for (const [dx, dy] of DIRS) {
      const ox = x + dx, oy = y + dy;
      if (hasMonster(x, y) || hasMonster(ox, oy)) continue;
      placePlayer(Game, ox, oy);
      const b = Game.travelBlockage(x, y);
      if (b && b.blockType === 'creek') { creekTile = { x, y, ox, oy }; break outer2; }
    }
  }
  check(!!creekTile, 'a beyond needsBridge creek with a creek-guarded approach exists');
  if (creekTile) {
    if (creekTile.ox < 0 || creekTile.ox > 8 || creekTile.oy < 0 || creekTile.oy > 8) Game.beyondTile(creekTile.ox, creekTile.oy);
    placePlayer(Game, creekTile.ox, creekTile.oy);
    const res = Game.travelTo(creekTile.x, creekTile.y);
    check(!!res && res.blockType === 'creek', `beyond creek refuses without a bridge (blockType=${res && res.blockType})`);
    check(Game.map.px === creekTile.ox && Game.map.py === creekTile.oy, 'refused creek left the player unmoved');
  }

  // BAR 2: the intermediate hole. Player beyond, home tile revealed, a
  // beyond intermediate guarding the jump's approach side.
  const candidates = [
    { dest: [8, 4], inter: [9, 4], approach: [10, 4], bf: { dx: 1, dy: 0 } },
    { dest: [0, 4], inter: [-1, 4], approach: [-2, 4], bf: { dx: -1, dy: 0 } },
    { dest: [4, 8], inter: [4, 9], approach: [4, 10], bf: { dx: 0, dy: 1 } },
    { dest: [4, 0], inter: [4, -1], approach: [4, -2], bf: { dx: 0, dy: -1 } },
  ];
  let hole = null;
  for (const c of candidates) {
    const [dx0, dy0] = c.dest, [ix, iy] = c.inter, [ax, ay] = c.approach;
    if (hasMonster(dx0, dy0) || hasMonster(ix, iy) || hasMonster(ax, ay)) continue;
    Game.beyondTile(ix, iy);
    placePlayer(Game, ax, ay);
    Game.reveal(dx0, dy0);
    const destBlock = Game.travelBlockage(dx0, dy0);
    if (destBlock) continue; // destination itself blocked — wrong reason; try another side
    hole = c;
    break;
  }
  check(!!hole, 'a clean intermediate-hole scenario exists (destination unblocked)');
  if (hole) {
    const [ix, iy] = hole.inter;
    const it = Game.beyondTile(ix, iy);
    it.blockFrom = { dx: hole.bf.dx, dy: hole.bf.dy, type: 'fallen_tree' };
    const [ax, ay] = hole.approach;
    placePlayer(Game, ax, ay);
    const res = Game.travelTo(hole.dest[0], hole.dest[1]);
    check(!!res && res.x === ix && res.y === iy && res.blockType === 'fallen_tree', `intermediate jump refuses with the intermediate block (got ${JSON.stringify(res)})`);
    check(Game.map.px === ax && Game.map.py === ay, 'refused intermediate jump left the player unmoved');
  }

  // BAR 6: home regression — a home-board jump over a home intermediate
  // blockage still refuses with the intermediate's block.
  let homeCase = null;
  for (let y = 0; y < 9 && !homeCase; y++) for (let x = 0; x < 9 && !homeCase; x++) {
    const t = Game.tileAt(x, y);
    if (!t || !t.blockFrom) continue;
    // Origin = intermediate + blockFrom offset (the guarded approach side);
    // dest = intermediate - that offset, collinear, both on the home board.
    const ox = x + t.blockFrom.dx, oy = y + t.blockFrom.dy;
    const dx0 = x - t.blockFrom.dx, dy0 = y - t.blockFrom.dy;
    if (ox < 0 || ox > 8 || oy < 0 || oy > 8 || dx0 < 0 || dx0 > 8 || dy0 < 0 || dy0 > 8) continue;
    if (hasMonster(ox, oy) || hasMonster(x, y) || hasMonster(dx0, dy0)) continue;
    // Destination must be offered (revealed, d==2) and itself unblocked
    // from the origin's approach.
    placePlayer(Game, ox, oy);
    Game.reveal(dx0, dy0);
    const destBlock = Game.travelBlockage(dx0, dy0);
    if (destBlock) continue;
    homeCase = { ox, oy, ix: x, iy: y, dx: dx0, dy: dy0, type: t.blockFrom.type };
  }
  check(!!homeCase, 'a home intermediate-blockage jump scenario exists');
  if (homeCase) {
    placePlayer(Game, homeCase.ox, homeCase.oy);
    const res = Game.travelTo(homeCase.dx, homeCase.dy);
    check(!!res && res.x === homeCase.ix && res.y === homeCase.iy, `home intermediate jump refuses with the intermediate block (got ${JSON.stringify(res)})`);
    check(Game.map.px === homeCase.ox && Game.map.py === homeCase.oy, 'refused home jump left the player unmoved');
  }
}

async function regenMode(seed, x, y) {
  const { Game } = await loadGame({ seed, narration: false });
  await setupGame(Game, 'Columbus, Ohio');
  const t = Game.beyondTile(x, y);
  console.log(JSON.stringify({ type: t.type, blockFrom: t.blockFrom || null, needsBridge: !!t.needsBridge }));
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--regen') {
    await regenMode(Number(args[1]), Number(args[2]), Number(args[3]));
    return;
  }
  for (const seed of SEEDS) {
    try { await runSeed(seed); } catch (e) { failures.push(`seed ${seed} threw: ${e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : e}`); }
  }
  console.log(`\n${failures.length ? 'FAIL' : 'PASS'}: ${failures.length} failure(s)`);
  for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(failures.length ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
