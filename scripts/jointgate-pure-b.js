// jointgate-pure-b.js — pure joint-gate functions shared by the
// recorder driver (scripts/jointgate-trace-b.js) and the proof
// (scripts/test-jointgate-b.js). No env reads, no game access, no
// side effects on require. Definitions frozen by
// evidence/2026-10-31/sim-jointgate-b-prereg.md.
'use strict';

// Pure fell-target BFS (tree/bigtree only; strandfix-morning choice
// rule restricted to fellable cells). grid: 9x9 detail rows
// (grid[y][x]); start: [mx, my]; blocks: (cell) => boolean.
// Returns { target: {x, y, cell}, stance: [x, y], pathLen } or null.
function fellTarget(grid, start, blocks) {
  const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
  const key = (x, y) => x + ',' + y;
  const [sx, sy] = start;
  if (!inB(sx, sy)) return null;
  const dist = {};
  const prev = {};
  dist[key(sx, sy)] = 0;
  prev[key(sx, sy)] = null;
  const q = [[sx, sy]];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!inB(nx, ny) || (key(nx, ny) in dist)) continue;
      const cell = grid[ny] && grid[ny][nx];
      if (blocks(cell)) continue;
      dist[key(nx, ny)] = dist[key(x, y)] + 1;
      prev[key(nx, ny)] = [x, y];
      q.push([nx, ny]);
    }
  }
  const rank = (cell) => (cell === 'bigtree' ? 0 : 1);
  let best = null;
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 9; tx++) {
      const cell = grid[ty] && grid[ty][tx];
      if (cell !== 'tree' && cell !== 'bigtree') continue;
      let stance = null, stanceDist = null;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cx = tx + dx, cy = ty + dy;
          if (!inB(cx, cy)) continue;
          const k = key(cx, cy);
          if (!(k in dist)) continue;
          if (stanceDist === null || dist[k] < stanceDist) { stance = [cx, cy]; stanceDist = dist[k]; }
        }
      }
      if (stance === null) continue;
      const cand = { target: { x: tx, y: ty, cell }, stance, pathLen: stanceDist };
      if (!best || cand.pathLen < best.pathLen ||
        (cand.pathLen === best.pathLen && rank(cell) < rank(best.target.cell)) ||
        (cand.pathLen === best.pathLen && rank(cell) === rank(best.target.cell) &&
          (ty < best.target.y || (ty === best.target.y && tx < best.target.x)))) {
        best = cand;
      }
    }
  }
  if (!best) return null;
  return { target: best.target, stance: best.stance, pathLen: best.pathLen };
}

// Pure joint evaluation (prereg definitions frozen). o: {wood,
// kcal, tier, canFell, ticksLeft, walkSteps}. Returns the gate reads
// plus joint (null when not evaluable: pack-ready, or no target =>
// roomy null and joint false).
function jointEval(o) {
  const needsWood = (o.wood !== null && o.wood !== undefined) ? o.wood < 4 : null;
  const fed = (o.kcal !== null && o.kcal !== undefined) ? o.kcal >= 80 : null;
  const axe = (o.tier !== null && o.tier !== undefined) ? o.tier === 'fell' : null;
  const tierCanFellAgree = (o.canFell !== null && o.canFell !== undefined && axe !== null)
    ? (o.canFell === axe) : null;
  let roomy = null, projected = null;
  if (o.walkSteps !== null && o.walkSteps !== undefined &&
      o.ticksLeft !== null && o.ticksLeft !== undefined) {
    projected = o.ticksLeft - o.walkSteps - 96 - 40;
    roomy = projected >= 96;
  }
  let joint = null;
  if (needsWood === true) {
    joint = (fed === true && axe === true && roomy === true);
  } else {
    joint = null; // pack-ready (or unknown wood): fell not needed
  }
  return { needsWood, fed, axe, roomy, projected, tierCanFellAgree, joint };
}

module.exports = { fellTarget, jointEval };
