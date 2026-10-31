// policies/fedevening-diag.js — strand-evening deadfall branch-fire
// substitution (sim-fedevening-b, 2026-10-31, flesh-out loop B, axis
// food-economy). POLICY-SIDE LEVER ONLY: zero src/js changes.
// Default OFF: FEDEVENING=1 enables, FEDEVENING=0 records lever-off
// and acts never, so OFF legs stay pure for the det-gate.
//
// Sits INSIDE woodwarm: warmed(fedevening(woodcarry(nighttravel))).
// On a still-creek evening (woodcarry bucket creek + rescued false),
// AFTER inner.daily (the bridge attempt has already failed), the
// villager gathers fallen branches (bare-hands, no tool gate, no
// food gate) and, if branches >= 2, lights a BRANCH fire — never a
// log fire: fireFuel() falls back to wood when branches < 2, so the
// fire step is gated on branches >= 2 and any wood-fuel spend is an
// instrument failure. After this policy returns, woodwarm evaluates
// on the new state: a lit branch fire reads nearFire -> miss
// 'fire-near'; unlit branches >= 2 read -> miss
// 'branches-available'. Either way NO LOG FIRE lights that night,
// and the bridge logs stay in the pack for tomorrow's bridge.
//
// Bounds (all frozen in the prereg): max 2 gathers per evening, max
// 2 walk steps per gather target, +10 no-day-roll tick margin on
// every verb (walk step needs ticksLeft >= 11, gather >= 26, fire
// >= fireCost + 10). No RNG drawn by the policy itself (BFS order
// fixed; gather yield lottery and fire friction lottery are the
// engine's own). No state writes except through engine verbs
// (microMove, gatherFallen, makeFire) plus one honest say line.
'use strict';

function fedeveningOn() {
  try { return process.env.FEDEVENING === '1'; } catch (e) { return false; }
}

function newStore() {
  return { records: 0, errs: 0, errors: [], acted: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

// Blocking test for a detail cell value. Uses the engine's own
// cellProps when available; falls back to the blocking set in
// cellProps' table (wall/water/tree/bigtree/tent/fire block).
// Copied from strandfix-morning-diag.js (same grid, same walk).
function blocksCell(Game, cell) {
  try {
    if (Game && typeof Game.cellProps === 'function') return !!Game.cellProps(cell).blocks;
  } catch (e) {}
  return cell === 'wall' || cell === 'water' || cell === 'tree' || cell === 'bigtree' || cell === 'tent' || cell === 'fire';
}

function isDeadfallCell(cell) {
  return cell === 'tree' || cell === 'bigtree' || cell === 'bush' || cell === 'thicket';
}

function kindRank(cell) {
  if (cell === 'bigtree') return 0;
  if (cell === 'tree') return 1;
  if (cell === 'bush') return 2;
  return 3; // thicket
}

// Pure BFS target choice (unit-tested). grid: 9x9 detail rows
// (grid[y][x]); start: [mx, my]; blocks: (cell) => boolean.
// Returns { target: {x, y, cell}, stance: [x, y], path: [[x,y],...] }
// (path excludes the start cell; empty path = already standing
// adjacent) or null when no deadfall cell is reachable from any
// stance. Choice: smallest path length; tie-break kind rank
// (bigtree > tree > bush > thicket), then target row-major order.
// A bush/thicket cell is its own stance (neither blocks); a
// tree/bigtree cell is never visited (blocking), so its stances
// are its walkable neighbours.
function findDeadfallTarget(grid, start, blocks) {
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
  let best = null;
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 9; tx++) {
      const cell = grid[ty] && grid[ty][tx];
      if (!isDeadfallCell(cell)) continue;
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
        (cand.pathLen === best.pathLen && kindRank(cell) < kindRank(best.target.cell)) ||
        (cand.pathLen === best.pathLen && kindRank(cell) === kindRank(best.target.cell) &&
          (ty < best.target.y || (ty === best.target.y && tx < best.target.x)))) {
        best = cand;
      }
    }
  }
  if (!best) return null;
  const path = [];
  let cur = best.stance;
  while (cur && !(cur[0] === sx && cur[1] === sy)) {
    path.unshift(cur);
    cur = prev[key(cur[0], cur[1])];
  }
  return { target: best.target, stance: best.stance, path };
}

// Pure fire-cost rule (unit-tested; mirrors woodwarm.js).
function fireCostFor(hasLighter, hasMoss) {
  if (hasLighter) return 8;
  if (hasMoss) return 32;
  return 48;
}

// Pure substitution-line choice (unit-tested). Never claims warmth
// on a failed fire.
function substitutionLine(o) {
  if (o.fireAttempted && o.fireLit) return 'A branch fire takes the night — the bridge logs stay in the pack.';
  if (o.fireAttempted && !o.fireLit) return "The branches are laid, but the fire won't catch — the logs stay in the pack regardless.";
  if (o.branchesAfter >= 2) return 'Branches gathered for the night — the bridge logs stay in the pack.';
  return null;
}

function withFedevening(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'fedevening',
    desc: 'woodcarry + strand-evening deadfall branch-fire substitution (FEDEVENING=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      let rec = null;
      if (!fedeveningOn()) {
        rec = { acted: false, skip: 'lever-off', loopDay };
      } else {
        try {
          const wcl = (ctx && ctx._wcLast) || {};
          if (Game.over) {
            rec = { acted: false, skip: 'game-over', loopDay };
          } else if (combatLive(Game)) {
            rec = { acted: false, skip: 'combat', loopDay };
          } else if (!(wcl.outcome === 'travel-refused' && wcl.bucket === 'creek' && !wcl.rescued)) {
            rec = { acted: false, skip: 'not-still-creek', loopDay, outcome: wcl.outcome || null, bucket: wcl.bucket || null, rescued: !!wcl.rescued };
          } else {
            rec = stillEveningStep(Game, st, loopDay);
          }
        } catch (e) {
          noteErr(st, 'evening', e);
          rec = { acted: false, skip: 'error', loopDay };
        }
      }
      try { ctx._feLast = rec; } catch (e) { noteErr(st, 'evening.ctx', e); }
      try { st.records++; } catch (e) {}
      if (rec && rec.acted) { try { st.acted++; } catch (e) {} }
      return r;
    },
  });
}

function readState(Game) {
  const sch = (Game.state || {}).scholar || {};
  let branches = null, wood = null, nearFire = false;
  try { branches = (typeof Game.materialCount === 'function') ? Game.materialCount('branch') : null; } catch (e) {}
  try { wood = (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) {}
  try { nearFire = (typeof Game.nearFire === 'function') ? !!Game.nearFire() : false; } catch (e) {}
  let fireCost = 48;
  try {
    if (Game.hasItem && Game.hasItem('lighter')) fireCost = 8;
    else if (Game.hasAbility && Game.hasAbility('beard_moss')) fireCost = 32;
  } catch (e) {}
  const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
  const ticksLeft = tpd - (sch.dayTicks || 0);
  return {
    mx: (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx,
    my: (sch.my === undefined || sch.my === null) ? 4 : sch.my,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    branches, wood, kcal: Math.round(sch.kcal || 0), ticksLeft, fireCost, nearFire,
  };
}

function findFireGround(Game, mx, my) {
  try {
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    const cands = [[mx, my], [mx, my + 1], [mx, my - 1], [mx + 1, my], [mx - 1, my],
      [mx + 1, my + 1], [mx + 1, my - 1], [mx - 1, my + 1], [mx - 1, my - 1]];
    for (const [cx, cy] of cands) {
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      let plot = false;
      try { plot = !!(Game.gardenCellAt && Game.gardenCellAt(cx, cy) && Game.gardenCellAt(cx, cy).plot); } catch (e) {}
      if (plot) continue;
      const cell = detail[cy] && detail[cy][cx];
      if (Game.fireGroundOK(cell)) return { cx, cy, cell };
    }
  } catch (e) {}
  return null;
}

function stillEveningStep(Game, st, loopDay) {
  const s0 = readState(Game);
  const gathers = [];
  let walked = [];
  let walkStop = null;
  let branches = s0.branches, wood = s0.wood, kcal = s0.kcal, ticksLeft = s0.ticksLeft;
  // GATHER phase: max 2 gathers.
  while (branches !== null && branches < 2 && gathers.length < 2) {
    const s = readState(Game);
    branches = s.branches; wood = s.wood; kcal = s.kcal; ticksLeft = s.ticksLeft;
    let detail = null;
    try { detail = Game.genDetail(Game.map.px, Game.map.py); } catch (e) { noteErr(st, 'gather.detail', e); walkStop = 'detail-error'; break; }
    const tgt = findDeadfallTarget(detail, [s.mx, s.my], (cell) => blocksCell(Game, cell));
    if (!tgt) { walkStop = 'no-deadfall-near'; break; }
    if (tgt.path.length > 2) { walkStop = 'deadfall-far'; break; }
    // Walk to stance, one +10-margined step at a time.
    let steps = [];
    let blocked = false;
    for (const [tx, ty] of tgt.path) {
      const stNow = readState(Game);
      if (stNow.ticksLeft < 11) { walkStop = 'ticks-short-walk'; blocked = true; break; }
      let ok = false;
      try { ok = !!Game.microMove(tx, ty); } catch (e) { noteErr(st, 'gather.walk', e); walkStop = 'walk-error'; blocked = true; break; }
      if (!ok) { walkStop = 'walk-blocked'; blocked = true; break; }
      steps.push([tx, ty]);
    }
    if (blocked) break;
    walked = walked.concat(steps);
    const sg = readState(Game);
    if (sg.ticksLeft < 26) { walkStop = 'ticks-short-gather'; break; }
    const bBefore = sg.branches, kBefore = sg.kcal, tBefore = sg.ticksLeft, wBefore = sg.wood;
    let gRet = null, gErr = null;
    try { gRet = Game.gatherFallen(tgt.target.x, tgt.target.y); } catch (e) { gErr = String(e && e.message).slice(0, 120); }
    const sa = readState(Game);
    gathers.push({
      cell: tgt.target.cell, x: tgt.target.x, y: tgt.target.y, stance: tgt.stance,
      walked: steps, branchesBefore: bBefore, branchesAfter: sa.branches,
      kcalBefore: kBefore, kcalAfter: sa.kcal, ticksBefore: tBefore, ticksAfter: sa.ticksLeft,
      woodBefore: wBefore, woodAfter: sa.wood, returnedNull: gRet === null, error: gErr,
    });
    branches = sa.branches; wood = sa.wood; kcal = sa.kcal; ticksLeft = sa.ticksLeft;
    if (gRet === null) { walkStop = 'gather-null'; break; }
  }
  // FIRE phase: only on branch fuel (never a log).
  let fire = null;
  const sf = readState(Game);
  branches = sf.branches; wood = sf.wood; kcal = sf.kcal; ticksLeft = sf.ticksLeft;
  if (branches !== null && branches >= 2) {
    if (sf.nearFire) {
      fire = { attempted: false, skip: 'fire-near', branchesBefore: branches, ticksLeft };
    } else {
      const ground = findFireGround(Game, sf.mx, sf.my);
      if (!ground) {
        fire = { attempted: false, skip: 'no-ground', branchesBefore: branches, ticksLeft };
      } else if (sf.ticksLeft < sf.fireCost + 10) {
        fire = { attempted: false, skip: 'ticks-short-fire', branchesBefore: branches, ticksLeft, fireCost: sf.fireCost, ground };
      } else {
        const bBefore = sf.branches, wBefore = sf.wood, kBefore = sf.kcal, tBefore = sf.ticksLeft;
        let fErr = null;
        try { Game.makeFire(ground.cx, ground.cy); } catch (e) { fErr = String(e && e.message).slice(0, 120); }
        const sa = readState(Game);
        let fireLit = false;
        try {
          const detail = Game.genDetail(Game.map.px, Game.map.py);
          fireLit = (detail[ground.cy] && detail[ground.cy][ground.cx]) === 'fire';
        } catch (e) {}
        const fuelKind = (sa.branches !== null && bBefore !== null && sa.branches < bBefore) ? 'branch'
          : (sa.wood !== null && wBefore !== null && sa.wood < wBefore) ? 'wood' : 'none';
        fire = {
          attempted: true, ground, fireLit, fuelKind,
          branchesBefore: bBefore, branchesAfter: sa.branches,
          woodBefore: wBefore, woodAfter: sa.wood,
          kcalBefore: kBefore, kcalAfter: sa.kcal,
          ticksBefore: tBefore, ticksAfter: sa.ticksLeft, error: fErr,
        };
        if (fuelKind === 'wood') noteErr(st, 'fire.wood-fuel', new Error('branch fire spent a log'));
      }
    }
  } else {
    fire = { attempted: false, skip: 'branches-short', branchesBefore: branches, ticksLeft };
  }
  const se = readState(Game);
  const line = substitutionLine({ fireAttempted: !!(fire && fire.attempted), fireLit: !!(fire && fire.fireLit), branchesAfter: se.branches === null ? 0 : se.branches });
  if (line) { try { Game.say(line); } catch (e) { noteErr(st, 'evening.say', e); } }
  return {
    acted: gathers.length > 0 || !!(fire && fire.attempted),
    loopDay, mx: s0.mx, my: s0.my, mapPx: s0.mapPx, mapPy: s0.mapPy,
    branchesBefore: s0.branches, branchesAfter: se.branches,
    woodBefore: s0.wood, woodAfter: se.wood,
    kcalBefore: s0.kcal, kcalAfter: se.kcal,
    ticksBefore: s0.ticksLeft, ticksAfter: se.ticksLeft,
    fireCost: s0.fireCost, nearFireBefore: s0.nearFire,
    gathers, walked, walkStop, fire, sayLine: line,
  };
}

module.exports = {
  fedeveningOn, newStore, blocksCell, isDeadfallCell, kindRank,
  findDeadfallTarget, fireCostFor, substitutionLine, withFedevening,
};
