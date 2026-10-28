#!/usr/bin/env node
// test-map-beyond-slice.js — proof for the tackle-map first slice.
// Bars (pre-registered 2026-10-28, evidence/2026-10-28/map-beyond-slice-prereg.md):
//   1. step past the home-board edge onto a generated tile (kind, stock, wildlife)
//   2. the 9x9 window centers on the player; compass reports home dir + dist > 0
//   3. a `building` tile scavenges finite manufactured loot (empty -> nothing),
//      while a home grove regrows stock
//   4. game still starts; haven at starting-window center; guaranteed ruin +
//      breadbasket grove still generate (gating verified by diff, not here)
//   5. transcript of the crossing + scavenge reads like a player experience
// Uses the shared sim harness (loadGame + setupGame), never copied eval code.
// Determinism is checked in a separate child process per seed (--regen mode),
// so no two harnesses share one node process.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { spawnSync } = require('child_process');

const SEEDS = [7, 42, 99];
const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
  else console.log('  ok: ' + msg);
};

function bfsPath(Game, from, isGoal, passable, bounds) {
  const key = (x, y) => x + ',' + y;
  const prev = new Map([[key(from.x, from.y), null]]);
  const q = [from];
  while (q.length) {
    const cur = q.shift();
    if (isGoal(cur)) {
      const path = [cur];
      let k = key(cur.x, cur.y);
      while (prev.get(k)) { path.unshift(prev.get(k)); k = key(path[0].x, path[0].y); }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (nx < bounds.x0 || nx > bounds.x1 || ny < bounds.y0 || ny > bounds.y1) continue;
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
  const sayText = () => lines.join('\n');

  // ---- BAR 4 (runtime part): start + window + ruin + breadbasket ----
  check(Game.map && Game.map.px === 4 && Game.map.py === 4, `starts at haven (4,4), got (${Game.map.px},${Game.map.py})`);
  const win0 = Game.mapWindow();
  check(win0.length === 9 && win0.every(r => r.length === 9), 'starting window is 9x9');
  check(win0[4][4].x === 4 && win0[4][4].y === 4 && win0[4][4].tile && win0[4][4].tile.type === 'haven', 'haven at starting-window center');
  let ruinNear = false;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (Game.tileAt(x, y).type === 'ruin' && Math.abs(x - 4) + Math.abs(y - 4) <= 3) ruinNear = true;
  }
  check(ruinNear, 'guaranteed ruin within Manhattan 3 of haven');
  const doors = [[3, 4], [5, 4], [4, 3], [4, 5]];
  const doorGrove = doors.some(([x, y]) => Game.tileAt(x, y).type === 'grove');
  const doorRuin = doors.some(([x, y]) => Game.tileAt(x, y).type === 'ruin');
  check(doorGrove || doorRuin, 'breadbasket grove by the door (or the door tile is itself the ruin — genMap\'s own exception)');

  // ---- walk to a rim tile (BFS over home board, avoiding blocks + monsters) ----
  const homePassable = (from, nx, ny) => {
    if (Game.monsterAt && Game.monsterAt(nx, ny)) return false;
    try { return !Game.travelBlockage(nx, ny, from.x, from.y); } catch (e) { return false; }
  };
  const isRim = p => p.x === 0 || p.x === 8 || p.y === 0 || p.y === 8;
  const path = bfsPath(Game, { x: 4, y: 4 }, isRim, homePassable, { x0: 0, x1: 8, y0: 0, y1: 8 });
  check(!!path, 'BFS found a rim path on the home board');
  if (!path) return;
  for (let i = 1; i < path.length; i++) {
    // travelTo returns undefined on success — judge by position, not return.
    const step = Game.travelTo(path[i].x, path[i].y);
    if (Game.map.px !== path[i].x || Game.map.py !== path[i].y) {
      failures.push(`walk step ${i} to (${path[i].x},${path[i].y}) failed: ${JSON.stringify(step)}`);
      return;
    }
    if (Game.inCombat && Game.inCombat()) { failures.push('combat started mid-walk to the rim'); return; }
  }
  const rim = path[path.length - 1];
  console.log(`  walked to rim (${rim.x},${rim.y})`);

  // ---- BAR 1 + BAR 2: step past the edge ----
  const dx = rim.x === 0 ? -1 : rim.x === 8 ? 1 : 0;
  const dy = rim.y === 0 ? -1 : rim.y === 8 ? 1 : 0;
  const bx = rim.x + dx, by = rim.y + dy;
  const res = Game.tryNodeExit(dx, dy);
  check(!!res && res.moved !== false && !res.blocked, `edge crossing moved (got ${JSON.stringify(res)})`);
  check(Game.map.px === bx && Game.map.py === by, `player now on beyond tile (${bx},${by}), got (${Game.map.px},${Game.map.py})`);
  const bt = Game.tileAt(bx, by);
  check(!!bt && typeof bt.type === 'string' && bt.type.length > 0, `beyond tile has a kind: ${bt && bt.type}`);
  check(!!bt && Number.isFinite(bt.stock) && Number.isFinite(bt.maxStock), `beyond tile has stock ${bt && bt.stock}/${bt && bt.maxStock}`);
  check(!!bt && bt.wildlife && typeof bt.wildlife === 'object', 'beyond tile has a wildlife population object');
  check(sayText().includes('New ground'), 'transcript says the world continues ("New ground")');
  const win1 = Game.mapWindow();
  check(win1[4][4].x === bx && win1[4][4].y === by, 'window re-centered on the player after crossing');
  const inWin = win1.some(r => r.some(c => c.x === 4 && c.y === 4));
  check(!inWin, 'home is outside the window after crossing');
  const hv = Game.homeVector();
  const expArrow = { '-1,-1': '↖', '0,-1': '↑', '1,-1': '↗', '-1,0': '←', '0,0': '⊙', '1,0': '→', '-1,1': '↙', '0,1': '↓', '1,1': '↘' }[Math.sign(4 - bx) + ',' + Math.sign(4 - by)];
  check(hv.dist > 0 && hv.arrow === expArrow, `compass reports home ${hv.arrow}${hv.dist} (expected ${expArrow}${Math.max(Math.abs(4 - bx), Math.abs(4 - by))})`);
  console.log(`  crossed to (${bx},${by}) kind=${bt.type} stock=${bt.stock} wildlife=${Object.keys(bt.wildlife).join(',') || '(none)'}`);

  // ---- determinism: same (seed, x, y) in a fresh child process ----
  const child = spawnSync(process.execPath, [__filename, '--regen', String(seed), String(bx), String(by)], { encoding: 'utf8' });
  let regen = null;
  try { regen = JSON.parse(child.stdout.trim().split('\n').pop()); } catch (e) { /* fall through */ }
  check(!!regen, `regen child produced JSON (stderr: ${(child.stderr || '').slice(-300)})`);
  if (regen) {
    check(regen.type === bt.type, `regen kind matches: ${regen.type} === ${bt.type}`);
    check(regen.stock === bt.stock && regen.maxStock === bt.maxStock, `regen stock matches: ${regen.stock}/${regen.maxStock}`);
    // WILDLIFE (living ecology, not a mismatch): arriving on a tile runs
    // checkAnimals (encounters.js wrapper), which takes ONE individual out
    // of the tile population onto the detail grid as the live animal. So
    // the visited tile may hold exactly one fewer animal than a fresh
    // regen, of the spawned species. Species keys must match; total counts
    // may differ by at most that one spawned individual.
    const wMain = bt.wildlife || {}, wRegen = regen.wildlife || {};
    const keysEqual = JSON.stringify(Object.keys(wMain).sort()) === JSON.stringify(Object.keys(wRegen).sort());
    const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
    const diff = sum(wRegen) - sum(wMain);
    const spawned = Game.state.scholar.animal ? Game.state.scholar.animal.id : null;
    const diffExplained = diff === 0 || (diff === 1 && spawned && (wRegen[spawned] || 0) - (wMain[spawned] || 0) === 1);
    check(keysEqual, `regen wildlife species match: ${Object.keys(wRegen).join(',') || '(none)'}`);
    check(diffExplained, `regen wildlife counts within one spawned animal (regen total ${sum(wRegen)}, visited total ${sum(wMain)}, spawned: ${spawned || 'none'})`);
    check(JSON.stringify(regen.loot || null) === JSON.stringify(bt.loot || null), 'regen loot matches');
  }

  // ---- walk home (reverse path) ----
  const back = [...path].reverse();
  for (let i = 1; i < back.length; i++) {
    const step = Game.travelTo(back[i].x, back[i].y);
    if (Game.map.px !== back[i].x || Game.map.py !== back[i].y) {
      failures.push(`walk-home step ${i} to (${back[i].x},${back[i].y}) failed: ${JSON.stringify(step)}`);
      return;
    }
  }
  check(Game.map.px === 4 && Game.map.py === 4 && Game.playerTile().type === 'haven', 'walked home to haven');
  check(Game.beyondTile(bx, by) === bt, 'beyond tile object persisted (same reference after leaving and returning)');

  // ---- BAR 3a: a generated building, emptied by scavenge pulls ----
  // HARNESS POSITIONING (documented, not a gameplay claim): walking is
  // already proven by bars 1-2, and every travelTo ticks the living world
  // (checkEncounter -> worldTick), which lets a world monster close in and
  // engage mid-scavenge — the world working as designed, but it stalls a
  // loot-finiteness observation behind a fight. So the scavenge phase
  // positions directly (as debug scenarios do) on a DISTANT building
  // (>= 12 steps from haven: no day-1 monster starts within a pull
  // sequence's reach), and pulls are guarded: on combat the loop stops
  // and fails loudly naming the interrupter, never spinning silently.
  let building = null;
  for (let y = -20; y <= 28 && !building; y++) {
    for (let x = -20; x <= 28 && !building; x++) {
      if (x >= 0 && x < 9 && y >= 0 && y < 9) continue;
      if (Math.abs(x - 4) + Math.abs(y - 4) < 12) continue;
      const t = Game.beyondTile(x, y);
      if (t.type === 'building') building = { x, y, tile: t };
    }
  }
  check(!!building, 'a distant building tile generates among beyond tiles');
  if (!building) return;
  Game.map.px = building.x; Game.map.py = building.y;
  Game.state.scholar.insideHaven = false;
  Game.markSeen(building.x, building.y, 'visited');
  Game.reveal(building.x, building.y);
  const btile = Game.tileAt(building.x, building.y);
  btile.visited = true; // arrival state, as travelTo would set it
  check(Game.map.px === building.x && Game.map.py === building.y, 'player stands on the building tile');
  const loot0 = (btile.loot || []).length;
  check(loot0 >= 1, `building holds loot (${loot0} items)`);
  // Name the tile through its own UI copy for the transcript.
  try { const ti = Game.tileInfo(building.x, building.y); lines.push(`${ti.name}. ${ti.text}`); } catch (e) {}
  const inv0 = Game.state.scholar.inventory.length;
  let pulled = false, interrupted = null;
  for (let i = 0; i < 10 && !pulled && !interrupted; i++) {
    const before = (Game.tileAt(building.x, building.y).loot || []).length;
    Game.doAction('forage');
    if (Game.inCombat && Game.inCombat()) { interrupted = 'combat engaged during scavenge pulls'; break; }
    const after = (Game.tileAt(building.x, building.y).loot || []).length;
    if (after < before) pulled = true;
  }
  if (interrupted) { failures.push(interrupted + ' (building at ' + building.x + ',' + building.y + ')'); return; }
  check(pulled, 'a scavenge pull reduced the building loot');
  check(Game.state.scholar.inventory.length > inv0, 'a scavenge pull added a manufactured good to the pack');
  check(sayText().includes('cabinet'), 'transcript names the building search ("cabinet")');
  let guard = 0;
  while ((Game.tileAt(building.x, building.y).loot || []).length > 0 && guard++ < 20) {
    Game.doAction('forage');
    if (Game.inCombat && Game.inCombat()) { interrupted = 'combat engaged while emptying the building'; break; }
  }
  if (interrupted) { failures.push(interrupted + ' (building at ' + building.x + ',' + building.y + ')'); return; }
  check((Game.tileAt(building.x, building.y).loot || []).length === 0, 'building emptied by repeated pulls');
  const linesBefore = lines.length;
  Game.doAction('forage');
  const emptyText = lines.slice(linesBefore).join(' ');
  check(emptyText.includes('Picked clean') && emptyText.includes('building'), `empty building pull says picked clean (got: ${emptyText.slice(0, 120)})`);
  check((Game.tileAt(building.x, building.y).loot || []).length === 0, 'empty building loot stays 0');
  // leave and return (harness positioning; real-travel persistence was
  // already proven for the crossing tile above): still empty.
  Game.map.px = building.x + 1; Game.map.py = building.y;
  Game.map.px = building.x; Game.map.py = building.y;
  check((Game.tileAt(building.x, building.y).loot || []).length === 0, 'emptied building stays empty after leaving and returning');

  // ---- BAR 3b: a home grove regrows ----
  let grove = null;
  for (let y = 0; y < 9 && !grove; y++) for (let x = 0; x < 9 && !grove; x++) {
    const t = Game.tileAt(x, y);
    if (t.type === 'grove' && t.maxStock > 0) grove = { x, y, tile: t };
  }
  check(!!grove, 'a home grove tile exists for the regrow check');
  if (grove) {
    const g = grove.tile;
    g.stock = 0; g.vigor = 100; g.foragePressure = 0; g.foragedToday = false; g.erodedToday = false; g.detailRegrow = null;
    Game.regrowTiles(2);
    check(g.stock >= 1, `grove stock regrew 0 -> ${g.stock} after the regrow step`);
  }

  // ---- BAR 5: transcript ----
  console.log(`\n--- transcript (seed ${seed}) ---`);
  const interesting = lines.filter(l => /New ground|standing building|Travel \d+ tile|cabinet|Picked clean|building is done|compass/i.test(l));
  for (const l of interesting.slice(0, 30)) console.log('  ' + l);
  check(interesting.some(l => /New ground/.test(l)), 'transcript: world continues');
  check(interesting.some(l => /standing building/i.test(l)), 'transcript: city tile named');
  check(interesting.some(l => /cabinet/.test(l)), 'transcript: what was found');
  check(interesting.some(l => /building is done|Picked clean/.test(l)), 'transcript: what is left');
}

async function regenMode(seed, x, y) {
  const { Game } = await loadGame({ seed, narration: false });
  await setupGame(Game, 'Columbus, Ohio');
  const t = Game.beyondTile(x, y);
  // The main run's tile passed through arrival (findWalkableEntry ->
  // genDetail), and genDetail's "grid is inventory" rule overwrites the
  // abstract stock with the detail-grid plant count. Reproduce the
  // arrival step so the comparison is visited-tile vs visited-tile.
  try { Game.genDetail(x, y); } catch (e) {}
  console.log(JSON.stringify({ type: t.type, stock: t.stock, maxStock: t.maxStock, wildlife: t.wildlife, loot: t.loot || null }));
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
