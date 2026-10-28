// creekpath-probe-b.js — shared non-destructive blocked-path probe.
// Required by creekpath-trace-b.js (the census driver) and
// test-creekpath-b.js (the proof). Pure reads only: never calls travelTo,
// never writes positions, never spends resources.
'use strict';

function havenCoords(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
    let type = null;
    try { const t = Game.tileAt(hx, hy); type = t ? (t.type || null) : null; } catch (e) {}
    return { hx, hy, type };
  } catch (e) { return { hx: 4, hy: 4, type: null }; }
}

// Mirror of Game.travelTo's refusal scan (destination first, then every
// tile on a shortest path, entered from a tile on a shortest path).
// Returns null (hop would succeed) or {blockType, x, y, leg}.
function directHopBlockage(Game, hx, hy) {
  const px0 = Game.map.px, py0 = Game.map.py;
  let b = null;
  try { b = Game.travelBlockage(hx, hy); } catch (e) { return { blockType: 'error:' + String(e && e.message).slice(0, 80), x: hx, y: hy, leg: 'destination' }; }
  if (b) return { blockType: b.blockType, x: b.x, y: b.y, leg: 'destination' };
  const dTot = Math.abs(hx - px0) + Math.abs(hy - py0);
  if (dTot > 1) {
    for (let ty = 0; ty < 9; ty++) for (let tx = 0; tx < 9; tx++) {
      if ((tx === px0 && ty === py0) || (tx === hx && ty === hy)) continue;
      const dS = Math.abs(tx - px0) + Math.abs(ty - py0);
      const dT = Math.abs(hx - tx) + Math.abs(hy - ty);
      if (dS === 0 || dS + dT !== dTot) continue;
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ex = tx + ox, ey = ty + oy;
        if (ex < 0 || ey < 0 || ex > 8 || ey > 8) continue;
        const dE = Math.abs(ex - px0) + Math.abs(ey - py0);
        if (dE !== dS - 1 || dE + 1 + dT !== dTot) continue;
        let ib = null;
        try { ib = Game.travelBlockage(tx, ty, ex, ey); } catch (e) {}
        if (ib) return { blockType: ib.blockType, x: ib.x, y: ib.y, leg: 'intermediate' };
      }
    }
  }
  return null;
}

// BFS route-around: orthogonal steps, each entry travelBlockage-clean from
// the step's origin, in-bounds 9x9. Returns {length, path} or null.
function bfsRouteAround(Game, hx, hy) {
  try {
    const N = (Game.map && Game.map.worldSize) || 9;
    const sx = Game.map.px, sy = Game.map.py;
    const key = (x, y) => x + ',' + y;
    const prev = {}; prev[key(sx, sy)] = null;
    const q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === hx && y === hy) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || key(nx, ny) in prev) continue;
        let blocked = true;
        try { blocked = !!Game.travelBlockage(nx, ny, x, y); } catch (e) { blocked = true; }
        if (blocked) continue;
        prev[key(nx, ny)] = [x, y];
        q.push([nx, ny]);
      }
    }
    if (!(key(hx, hy) in prev)) return null;
    const path = [[hx, hy]];
    while (prev[key(path[0][0], path[0][1])]) path.unshift(prev[key(path[0][0], path[0][1])]);
    if (path.length > 21) return { length: path.length - 1, path: null, tooLong: true };
    return { length: path.length - 1, path };
  } catch (e) { return { length: null, path: null, error: String(e && e.message).slice(0, 120) }; }
}

// Crossing-fix feasibility on the first blocking tile, with resources on
// hand at probe time. Costs are the engine's (game.js).
function crossingFix(Game, block) {
  try {
    const t = Game.tileAt(block.x, block.y);
    const wood = (typeof Game.woodCount === 'function') ? Game.woodCount() : null;
    let swimmer = false;
    try { swimmer = !!Game.hasAbility('swimmer'); } catch (e) {}
    if (block.blockType === 'creek') {
      return { kind: 'creek', tileType: t ? t.type : null, needsBridge: !!(t && t.needsBridge), bridged: !!(t && t.bridged), wood, swimmer, bridgeFeasible: wood !== null && wood >= 4, swimFeasible: swimmer, feasible: (wood !== null && wood >= 4) || swimmer };
    }
    const bf = t && t.blockFrom;
    return { kind: block.blockType, tileType: t ? t.type : null, blockFromType: bf ? bf.type : null, wood, swimmer, feasible: true,
      cost: block.blockType === 'fallen_tree' ? '60 kcal, +2 wood' : block.blockType === 'rubble' ? '40 kcal' : block.blockType === 'washed_out' ? '80 kcal scramble or 4 wood bridge' : 'unknown' };
  } catch (e) { return { kind: block.blockType, error: String(e && e.message).slice(0, 120), feasible: false }; }
}

module.exports = { havenCoords, directHopBlockage, bfsRouteAround, crossingFix };
