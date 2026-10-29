#!/usr/bin/env node
// test-city-districts.js — proof for fixall-map slice 3 (city districts).
// Bars (pre-registered evidence/2026-10-28/sim-fixall-map-slice3-city.md):
//   1. district coherence: one cell's tiles share one district id; two
//      cells' districts differ
//   2. layout: sampled cell's center 2x2 are plazas, cross arms streets,
//      and the cell holds >= 1 building and >= 1 cache
//   3. determinism: a regen child process reproduces kinds/districts
//   4. home untouched: no street/plaza/cache tile inside 0..8
//   5. near fringe untouched: no street/plaza/cache within Chebyshev 12
//      of haven, and the old wild rule still yields buildings nearby
//   6. scavenge parity: a cache empties finitely (pulls + "Picked clean"
//      naming the cache); a street forage names pavement, adds nothing
//   7. walkability: the player walks onto a street and a plaza via
//      travelTo and stands on a walkable detail cell
// Uses the shared sim harness (loadGame + setupGame), never copied eval
// code. Determinism is checked in a fresh child process per coordinate.
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

function bfsPath(Game, from, to, passable) {
  const key = (x, y) => x + ',' + y;
  const prev = new Map([[key(from.x, from.y), null]]);
  const q = [from];
  const x0 = Math.min(from.x, to.x) - 1, x1 = Math.max(from.x, to.x) + 1;
  const y0 = Math.min(from.y, to.y) - 1, y1 = Math.max(from.y, to.y) + 1;
  while (q.length) {
    const cur = q.shift();
    if (cur.x === to.x && cur.y === to.y) {
      const path = [cur];
      let k = key(cur.x, cur.y);
      while (prev.get(k)) { path.unshift(prev.get(k)); k = key(path[0].x, path[0].y); }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (nx < x0 || nx > x1 || ny < y0 || ny > y1) continue;
      if (prev.has(key(nx, ny))) continue;
      if (!passable(cur, nx, ny)) continue;
      prev.set(key(nx, ny), cur);
      q.push({ x: nx, y: ny });
    }
  }
  return null;
}

async function runSeed(seed) {
  console.log(`\n=== seed ${seed} ===`);
  const { Game } = await loadGame({ seed, narration: true });
  const lines = [];
  const realSay = Game.say;
  Game.say = function (...a) { lines.push(a.join(' ')); try { return realSay.apply(this, a); } catch (e) { return null; } };
  await setupGame(Game, 'Columbus, Ohio');

  // BAR 4: home board holds no city kind.
  let homeCity = 0;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const ty = Game.tileAt(x, y).type;
    if (ty === 'street' || ty === 'plaza' || ty === 'cache') homeCity++;
  }
  check(homeCity === 0, `home board holds no city tile (${homeCity} found)`);
  check(Game.tileAt(4, 4).type === 'haven', 'haven still at (4,4)');

  // BAR 5: near fringe (Chebyshev <= 12) holds no city kind, but the old
  // wild rule still yields buildings nearby.
  let nearCity = 0, nearBuildings = 0;
  for (let y = -8; y <= 20; y++) for (let x = -8; x <= 20; x++) {
    if (x >= 0 && x < 9 && y >= 0 && y < 9) continue;
    if (cheb(x, y) > 12) continue;
    const t = Game.beyondTile(x, y);
    if (t.type === 'street' || t.type === 'plaza' || t.type === 'cache') nearCity++;
    if (t.type === 'building') nearBuildings++;
  }
  check(nearCity === 0, `near fringe (<=12) holds no city tile (${nearCity} found)`);
  check(nearBuildings >= 1, `near fringe still yields wild buildings (${nearBuildings} found)`);

  // Find city cells: scan coarse cells whose centers sit past the ring.
  const cityCells = [];
  for (let cy = -4; cy <= 4 && cityCells.length < 6; cy++) {
    for (let cx = -4; cx <= 4 && cityCells.length < 6; cx++) {
      const px = cx * 8 + 3, py = cy * 8 + 3;
      if (cheb(px, py) <= 12) continue;
      const t = Game.beyondTile(px, py);
      if (t.district) cityCells.push({ cx, cy, district: t.district });
    }
  }
  check(cityCells.length >= 2, `at least 2 far city cells found (${cityCells.length})`);
  if (cityCells.length < 2) return;
  // BAR 1: coherence within a cell, difference across cells.
  const cellA = cityCells[0];
  const districtsA = new Set();
  for (let ly = 0; ly < 8; ly++) for (let lx = 0; lx < 8; lx++) {
    districtsA.add(Game.beyondTile(cellA.cx * 8 + lx, cellA.cy * 8 + ly).district || '(none)');
  }
  check(districtsA.size === 1, `cell A tiles share one district (${[...districtsA].join(',')})`);
  check(cityCells[1].district !== cellA.district, `cell B district differs (${cityCells[1].district} vs ${cellA.district})`);
  console.log(`  city cells: ${cityCells.map(c => `${c.district}`).join(', ')}`);

  // BAR 2: layout on a cell holding the full set (search, then assert the
  // whole layout on that cell — the search itself proves caches exist).
  let sample = null;
  for (const c of cityCells) {
    let buildings = 0, caches = 0;
    for (let ly = 0; ly < 8; ly++) for (let lx = 0; lx < 8; lx++) {
      const ty = Game.beyondTile(c.cx * 8 + lx, c.cy * 8 + ly).type;
      if (ty === 'building') buildings++;
      if (ty === 'cache') caches++;
    }
    if (buildings >= 1 && caches >= 1) { sample = { ...c, buildings, caches }; break; }
  }
  check(!!sample, 'a sampled city cell holds >= 1 building and >= 1 cache');
  if (!sample) return;
  console.log(`  sampled cell ${sample.district}: ${sample.buildings} buildings, ${sample.caches} caches`);
  let layoutOk = true;
  for (let ly = 0; ly < 8; ly++) for (let lx = 0; lx < 8; lx++) {
    const ty = Game.beyondTile(sample.cx * 8 + lx, sample.cy * 8 + ly).type;
    const isCenter = lx >= 3 && lx <= 4 && ly >= 3 && ly <= 4;
    const isCross = (lx >= 3 && lx <= 4) || (ly >= 3 && ly <= 4);
    if (isCenter && ty !== 'plaza') layoutOk = false;
    if (!isCenter && isCross && ty !== 'street') layoutOk = false;
    if ((ty === 'street' || ty === 'plaza') && Game.beyondTile(sample.cx * 8 + lx, sample.cy * 8 + ly).maxStock !== 0) layoutOk = false;
  }
  check(layoutOk, 'sampled cell layout: center 2x2 plazas, cross arms streets, pavement stock 0');

  // BAR 3: determinism via regen children (plaza, street, cache/building,
  // one far wild tile).
  const probes = [];
  probes.push({ x: sample.cx * 8 + 3, y: sample.cy * 8 + 3 }); // plaza
  probes.push({ x: sample.cx * 8 + 3, y: sample.cy * 8 + 0 }); // street (cross arm)
  let cacheProbe = null, bldProbe = null;
  for (let ly = 0; ly < 8 && (!cacheProbe || !bldProbe); ly++) for (let lx = 0; lx < 8 && (!cacheProbe || !bldProbe); lx++) {
    const t = Game.beyondTile(sample.cx * 8 + lx, sample.cy * 8 + ly);
    if (t.type === 'cache' && !cacheProbe) cacheProbe = { x: sample.cx * 8 + lx, y: sample.cy * 8 + ly };
    if (t.type === 'building' && !bldProbe) bldProbe = { x: sample.cx * 8 + lx, y: sample.cy * 8 + ly };
  }
  if (cacheProbe) probes.push(cacheProbe);
  if (bldProbe) probes.push(bldProbe);
  // one far wild tile (past the ring, not in a city cell): scan for it.
  let wildProbe = null;
  for (let y = 20; y <= 28 && !wildProbe; y++) for (let x = 20; x <= 28 && !wildProbe; x++) {
    const t = Game.beyondTile(x, y);
    if (!t.district && t.type !== 'building') wildProbe = { x, y };
  }
  if (wildProbe) probes.push(wildProbe);
  for (const p of probes) {
    const t = Game.beyondTile(p.x, p.y);
    const child = spawnSync(process.execPath, [__filename, '--regen', String(seed), String(p.x), String(p.y)], { encoding: 'utf8' });
    let regen = null;
    try { regen = JSON.parse(child.stdout.trim().split('\n').pop()); } catch (e) { /* fall through */ }
    check(!!regen, `regen child produced JSON for (${p.x},${p.y})`);
    if (regen) {
      check(regen.type === t.type, `regen kind matches at (${p.x},${p.y}): ${regen.type} === ${t.type}`);
      check((regen.district || null) === (t.district || null), `regen district matches at (${p.x},${p.y})`);
      check(regen.stock === t.stock && regen.maxStock === t.maxStock, `regen stock matches at (${p.x},${p.y})`);
      check(JSON.stringify(regen.loot || null) === JSON.stringify(t.loot || null), `regen loot matches at (${p.x},${p.y})`);
    }
  }

  // BAR 7: walk onto a street and a plaza via travelTo (BFS avoiding
  // blockages, generating beyond tiles as it explores).
  const streetTarget = { x: sample.cx * 8 + 3, y: sample.cy * 8 + 0 };
  const plazaTarget = { x: sample.cx * 8 + 3, y: sample.cy * 8 + 3 };
  const passable = (from, nx, ny) => {
    if (nx < 0 || nx > 8 || ny < 0 || ny > 8) Game.beyondTile(nx, ny); // generate before probing
    if (Game.monsterAt && Game.monsterAt(nx, ny)) return false;
    try { return !Game.travelBlockage(nx, ny, from.x, from.y); } catch (e) { return false; }
  };
  for (const target of [streetTarget, plazaTarget]) {
    // Start each walk from haven for a clean BFS (walk home first if needed).
    if (Game.map.px !== 4 || Game.map.py !== 4) {
      const back = Game.walkHome ? Game.walkHome() : null;
      if (!back || !back.reached) { failures.push('walkHome failed before the city walk'); return; }
    }
    const path = bfsPath(Game, { x: 4, y: 4 }, target, passable);
    check(!!path, `BFS found a path to (${target.x},${target.y})`);
    if (!path) return;
    let walked = true;
    for (let i = 1; i < path.length; i++) {
      Game.travelTo(path[i].x, path[i].y);
      if (Game.map.px !== path[i].x || Game.map.py !== path[i].y) { failures.push(`city walk step ${i} to (${path[i].x},${path[i].y}) failed`); walked = false; break; }
      if (Game.inCombat && Game.inCombat()) { failures.push('combat engaged on the city walk'); walked = false; break; }
    }
    if (!walked) return;
    const tt = Game.tileAt(target.x, target.y);
    check(Game.map.px === target.x && Game.map.py === target.y, `player stands on (${target.x},${target.y}) type=${tt.type}`);
    const detail = Game.genDetail(target.x, target.y);
    const mx = Game.state.scholar.mx ?? 4, my = Game.state.scholar.my ?? 4;
    const cell = detail[my] && detail[my][mx];
    let walkable = false;
    try { walkable = !!cell && !Game.cellProps(cell).blocks; } catch (e) { walkable = false; }
    check(walkable, `detail cell under the player on ${tt.type} is walkable (cell=${cell})`);
    console.log(`  walked to ${tt.type} at (${target.x},${target.y})`);
  }

  // BAR 6: cache scavenge + street forage (harness positioning, as in the
  // slice-1 guard: walking is already proven above; these pulls tick time
  // and a world monster could engage, so combat stops the loop loudly).
  const cacheT = cacheProbe ? Game.tileAt(cacheProbe.x, cacheProbe.y) : null;
  check(!!cacheT && cacheT.type === 'cache', 'a cache tile exists for the scavenge check');
  if (cacheT) {
    Game.map.px = cacheProbe.x; Game.map.py = cacheProbe.y;
    Game.state.scholar.insideHaven = false;
    Game.markSeen(cacheProbe.x, cacheProbe.y, 'visited');
    Game.reveal(cacheProbe.x, cacheProbe.y);
    const ct = Game.tileAt(cacheProbe.x, cacheProbe.y);
    ct.visited = true;
    const loot0 = (ct.loot || []).length;
    check(loot0 >= 1 && loot0 <= 2, `cache holds 1-2 loot items (${loot0})`);
    const inv0 = Game.state.scholar.inventory.length;
    let pulled = false, interrupted = null;
    for (let i = 0; i < 10 && !pulled && !interrupted; i++) {
      const before = (Game.tileAt(cacheProbe.x, cacheProbe.y).loot || []).length;
      Game.doAction('forage');
      if (Game.inCombat && Game.inCombat()) { interrupted = 'combat engaged during cache pulls'; break; }
      const after = (Game.tileAt(cacheProbe.x, cacheProbe.y).loot || []).length;
      if (after < before) pulled = true;
    }
    if (interrupted) { failures.push(interrupted); return; }
    check(pulled, 'a cache pull reduced the cache loot');
    check(Game.state.scholar.inventory.length > inv0, 'a cache pull added a manufactured good to the pack');
    let guard = 0;
    while ((Game.tileAt(cacheProbe.x, cacheProbe.y).loot || []).length > 0 && guard++ < 20) {
      Game.doAction('forage');
      if (Game.inCombat && Game.inCombat()) { interrupted = 'combat engaged while emptying the cache'; break; }
    }
    if (interrupted) { failures.push(interrupted); return; }
    check((Game.tileAt(cacheProbe.x, cacheProbe.y).loot || []).length === 0, 'cache emptied by repeated pulls');
    const linesBefore = lines.length;
    Game.doAction('forage');
    const emptyText = lines.slice(linesBefore).join(' ');
    check(emptyText.includes('Picked clean') && emptyText.includes('cache'), `empty cache pull says picked clean naming the cache (got: ${emptyText.slice(0, 120)})`);
  }
  // Street forage names pavement and adds nothing.
  const stT = Game.tileAt(streetTarget.x, streetTarget.y);
  Game.map.px = streetTarget.x; Game.map.py = streetTarget.y;
  Game.state.scholar.insideHaven = false;
  Game.markSeen(streetTarget.x, streetTarget.y, 'visited');
  Game.reveal(streetTarget.x, streetTarget.y);
  Game.tileAt(streetTarget.x, streetTarget.y).visited = true;
  const invBefore = Game.state.scholar.inventory.length;
  const linesBefore2 = lines.length;
  Game.doAction('forage');
  const streetText = lines.slice(linesBefore2).join(' ');
  check(streetText.includes('Bare pavement'), `street forage names pavement (got: ${streetText.slice(0, 120)})`);
  check(Game.state.scholar.inventory.length === invBefore, 'street forage added nothing to the pack');
  void stT;
}

async function regenMode(seed, x, y) {
  const { Game } = await loadGame({ seed, narration: false });
  await setupGame(Game, 'Columbus, Ohio');
  const t = Game.beyondTile(x, y);
  console.log(JSON.stringify({ type: t.type, district: t.district || null, stock: t.stock, maxStock: t.maxStock, loot: t.loot || null }));
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
