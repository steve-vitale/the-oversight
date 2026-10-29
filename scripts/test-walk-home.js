#!/usr/bin/env node
// test-walk-home.js — proof for fixall-map slice 1a (design §D):
// Game.walkHome() walks the player home tile by tile through travelTo.
// Bars (pre-registered evidence/2026-10-28/sim-fixall-map-prereg.md §1a):
//   1. walk past the home edge, then walkHome() reaches the SAME haven tile
//   2. every step (out and back) moves exactly 1 tile — no teleport jump
//   3. compass (Chebyshev) distance never increases along the return trace
//   4. a blocked homeward step stops honestly: reached=false, position
//      unchanged by the refused step, block named
//   5. a step cap stops mid-way as a partial walk (tap again to continue)
//   6. walk-home charges exactly what walking out charges: node travel is
//      FREE, so scholar kcal is unchanged across the return
// Uses the shared sim harness (loadGame + setupGame), never copied eval code.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

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
  check(Game.map && Game.map.px === 4 && Game.map.py === 4, 'starts at haven (4,4)');

  const homePassable = (from, nx, ny) => {
    if (Game.monsterAt && Game.monsterAt(nx, ny)) return false;
    try { return !Game.travelBlockage(nx, ny, from.x, from.y); } catch (e) { return false; }
  };
  const isRim = p => p.x === 0 || p.x === 8 || p.y === 0 || p.y === 8;
  const path = bfsPath(Game, { x: 4, y: 4 }, isRim, homePassable, { x0: 0, x1: 8, y0: 0, y1: 8 });
  check(!!path, 'BFS found a rim path on the home board');
  if (!path) return;
  const outTrace = [{ x: 4, y: 4 }];
  for (let i = 1; i < path.length; i++) {
    Game.travelTo(path[i].x, path[i].y);
    if (Game.map.px !== path[i].x || Game.map.py !== path[i].y) { failures.push(`walk step ${i} failed`); return; }
    if (Game.inCombat && Game.inCombat()) { failures.push('combat engaged on the walk to the rim'); return; }
    outTrace.push({ x: Game.map.px, y: Game.map.py });
  }
  const rim = path[path.length - 1];
  const dx = rim.x === 0 ? -1 : rim.x === 8 ? 1 : 0;
  const dy = rim.y === 0 ? -1 : rim.y === 8 ? 1 : 0;
  const res = Game.tryNodeExit(dx, dy);
  check(!!res && res.moved !== false && !res.blocked, 'edge crossing moved');
  if (Game.map.px === 4 && Game.map.py === 4) { failures.push('crossing did not move off the rim'); return; }
  outTrace.push({ x: Game.map.px, y: Game.map.py });
  if (Game.inCombat && Game.inCombat()) { failures.push('combat engaged on the crossing'); return; }
  // March further away from haven (so the return is a real multi-tile
  // walk), routing AROUND blockages: since slice 4, deeper beyond tiles
  // can carry a fallen tree / rubble / washed-out blockage, and a fixed
  // straight march would stall on one honestly. BFS over offered steps
  // (generating beyond tiles as it explores, skipping blocked entries)
  // finds a walkable route to a far tile, exactly as a player would.
  const ox = Game.map.px > 4 ? 1 : Game.map.px < 4 ? -1 : 0;
  const oy = Game.map.px === 4 ? (Game.map.py > 4 ? 1 : -1) : 0;
  const farTarget = { x: Game.map.px + ox * 8, y: Game.map.py + oy * 8 };
  const marchPassable = (from, nx, ny) => {
    if (nx < 0 || nx > 8 || ny < 0 || ny > 8) Game.beyondTile(nx, ny);
    if (Game.monsterAt && Game.monsterAt(nx, ny)) return false;
    try { return !Game.travelBlockage(nx, ny, from.x, from.y); } catch (e) { return false; }
  };
  const marchPath = bfsPath(Game, { x: Game.map.px, y: Game.map.py }, p => p.x === farTarget.x && p.y === farTarget.y, marchPassable,
    { x0: Math.min(Game.map.px, farTarget.x) - 2, x1: Math.max(Game.map.px, farTarget.x) + 2, y0: Math.min(Game.map.py, farTarget.y) - 2, y1: Math.max(Game.map.py, farTarget.y) + 2 });
  check(!!marchPath, `BFS found an outward march route to (${farTarget.x},${farTarget.y})`);
  if (!marchPath) return;
  for (let i = 1; i < marchPath.length; i++) {
    Game.travelTo(marchPath[i].x, marchPath[i].y);
    if (Game.map.px !== marchPath[i].x || Game.map.py !== marchPath[i].y) { failures.push(`march step ${i} to (${marchPath[i].x},${marchPath[i].y}) failed`); return; }
    if (Game.inCombat && Game.inCombat()) { failures.push('combat engaged on the outward march'); return; }
    outTrace.push({ x: Game.map.px, y: Game.map.py });
  }
  const far = { x: Game.map.px, y: Game.map.py };
  console.log(`  walked out to (${far.x},${far.y}), ${outTrace.length - 1} steps from haven`);
  // BAR 2 (outbound): every step exactly 1 tile.
  let outOk = true;
  for (let i = 1; i < outTrace.length; i++) {
    if (Math.abs(outTrace[i].x - outTrace[i - 1].x) + Math.abs(outTrace[i].y - outTrace[i - 1].y) !== 1) outOk = false;
  }
  check(outOk, 'outbound trace: every step exactly 1 tile (no teleport)');

  // BAR 5 first (cap): a 1-step walk home is partial, honestly.
  const capped = Game.walkHome(1);
  check(!capped.reached && capped.steps === 1 && capped.interrupted === 'cap', `walkHome(1) is partial: steps=${capped.steps} interrupted=${capped.interrupted}`);
  check(Game.map.px !== 4 || Game.map.py !== 4, 'capped walk did not reach haven');

  // BAR 1+2+3+6: the full walk home (from where the capped walk left us).
  const far2 = { x: Game.map.px, y: Game.map.py };
  const kcalBefore = Game.state.scholar.kcal;
  const hvBefore = Game.homeVector();
  check(hvBefore.dist > 0, `compass reports home at distance ${hvBefore.dist} before the return`);
  const ret = Game.walkHome();
  check(ret.reached, `walkHome reached haven (steps=${ret.steps}, interrupted=${ret.interrupted})`);
  check(Game.map.px === 4 && Game.map.py === 4 && Game.playerTile().type === 'haven', 'player stands on the haven tile after walkHome');
  check(ret.path && ret.path[0].x === far2.x && ret.path[0].y === far2.y, 'return trace starts where the player stood');
  let backOk = true, monoOk = true, prevCheb = Infinity;
  for (let i = 1; i < (ret.path || []).length; i++) {
    if (Math.abs(ret.path[i].x - ret.path[i - 1].x) + Math.abs(ret.path[i].y - ret.path[i - 1].y) !== 1) backOk = false;
    const cheb = Math.max(Math.abs(4 - ret.path[i].x), Math.abs(4 - ret.path[i].y));
    if (cheb > prevCheb) monoOk = false;
    prevCheb = cheb;
  }
  check(backOk, 'return trace: every step exactly 1 tile (no teleport)');
  check(monoOk, 'compass distance never increases along the return trace');
  check(ret.path && ret.path.length - 1 === ret.steps, 'return trace length matches reported steps');
  check(Game.state.scholar.kcal === kcalBefore, `walk-home kcal unchanged (${kcalBefore} -> ${Game.state.scholar.kcal}; node travel is free)`);
  check(lines.join('\n').includes('Heading home'), 'transcript: walk home announced');
  check(lines.join('\n').includes('Home —'), 'transcript: arrival announced');

  // BAR 4: blocked return. Walk out again along the same outbound trace
  // (travelTo steps; the trace is known-good ground), then box the far
  // position in on ALL FOUR sides. (Since slice 4, walkHome sidesteps
  // around a single blocked homeward tile — blocking only the homeward
  // candidates no longer stops it, by design. A walk stops honestly only
  // when homeward steps AND both sidesteps refuse, i.e. the box.)
  for (let i = 1; i < outTrace.length; i++) {
    Game.travelTo(outTrace[i].x, outTrace[i].y);
    if (Game.inCombat && Game.inCombat()) { failures.push('combat engaged on the second walk out'); return; }
  }
  check(Game.map.px === far.x && Game.map.py === far.y, 'second walk out returned to the far tile');
  const px = Game.map.px, py = Game.map.py;
  const blockTile = (nx, ny, sx, sy) => {
    const t = Game.tileAt(nx, ny) || Game.beyondTile(nx, ny);
    t.blockFrom = { dx: -sx, dy: -sy, type: 'fallen_tree' };
  };
  for (const [bx, by] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) blockTile(px + bx, py + by, bx, by);
  const blocked = Game.walkHome();
  check(!blocked.reached && blocked.interrupted === 'blocked', `blocked walk stops honestly: reached=${blocked.reached} interrupted=${blocked.interrupted}`);
  check(Game.map.px === px && Game.map.py === py, 'blocked walk left the player unmoved');
  check(!!blocked.blocked && blocked.blocked.blockType === 'fallen_tree', `block named: ${blocked.blocked && blocked.blocked.blockType}`);
  check(lines.join('\n').includes('way home is blocked'), 'transcript: blockage named on the stopped walk');
}

async function main() {
  for (const seed of SEEDS) {
    try { await runSeed(seed); } catch (e) { failures.push(`seed ${seed} threw: ${e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : e}`); }
  }
  console.log(`\n${failures.length ? 'FAIL' : 'PASS'}: ${failures.length} failure(s)`);
  for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(failures.length ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
