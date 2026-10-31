// strandfix-morning-diag — strand-morning joint food+wood recovery
// (sim-strandfix-morning-b, 2026-10-30, flesh-out loop B, axis
// food-economy). POLICY-SIDE VARIANT ONLY: zero src/js changes,
// zero edits to any existing policy file (pressb-diag.js helpers
// are REQUIRED, never edited). Env-gated: STRANDFIX=1 arms it;
// unset/0 delegates to inner.daily untouched (the OFF leg runs
// the same stack with STRANDFIX=0).
//
// BEHAVIOR (exact, pre-registered in
// evidence/2026-10-30/sim-strandfix-morning-b-prereg.md — no
// mid-run swaps): on a stranded field morning — the villager
// woke on a field tile after a still-refused creek evening —
// try a JOINT recovery BEFORE inner.daily travels anywhere:
//   PHASE 1 — SECURE KCAL: if morning kcal >= 80, already-fed
//   (no verb). Else if the wake 3x3 sweep holds a known food
//   species and ticksLeft >= 17, forage + eat (the pressb verbs,
//   priced: forage 16 ticks + 60 kcal effort, eat 1 tick).
//   Else if pack food kcal > 0, eat only. Else skip.
//   PHASE 2 — WOOD-SEEK: only if pack wood < 4. BFS over
//   non-blocking cells of the OCCUPIED tile's own 9x9 detail
//   grid to a stance adjacent to the nearest tree/bigtree/bush
//   (smallest path; tie bigtree > tree > bush, then row-major),
//   microMove step by step (1 tick + walkStepKcal per step),
//   then the engine's own verbs at the stance: cutTree on
//   tree/bigtree (kcal >= 80, ticksLeft >= 96, max 2 fells),
//   clearBrush on bush (kcal >= 40, ticksLeft >= 32), looping
//   over adjacent wood cells until pack >= 4 or a floor stops it.
// Every cost is recorded, never assumed from the TIME table:
// food realizedNet + ticks, wood kcalSpent + ticks, wood delta,
// stop reasons per phase.
//
// PERCEPTION LAW (Steve 2026-10-28): the food gate reads ONLY
// the wake cell + its 8 neighbours via pressb-diag's
// prePressSweep (species only where already assigned, only the
// villager's own plantKnown flag). The wood scan reads ONLY
// the occupied tile's detail grid (the ground the villager
// stands on) — no other tile, no roster, no snapshot feed.
// The policy draws NO RNG itself (BFS order and verb order are
// fixed; forage/cutTree yield lotteries are the engine's own,
// exactly as in woodday/pressb). The wrapper NEVER calls
// travelTo and never writes game state except through the
// engine verbs above. Recording errors are counted in
// store.errs and never thrown into the engine. At most one
// attempt per loop-day.
//
// CONSTRAINTS MEASURED, NOT ASSUMED (see prereg): strand
// mornings hold 0–44 kcal on the woodday finding, below the
// bridge cost (60) and the felling cost (80) — so a wood
// attempt without a successful food phase is EXPECTED to stop
// at 'kcal-floor', and brush (+1 wood, 40 kcal) is the only
// wood verb affordable below 80 kcal. The routine has NO wood
// move on the wake tile (fedexile 0/4) — so CONVERSION is the
// measured quantity (woodDelta > 0, pack >= 4 reached), never
// an assumed walk-to-tree behavior.
'use strict';

const { prePressSweep, pressTotals } = require('./pressb-diag');

function leverOn() {
  try { return process.env.STRANDFIX === '1'; } catch (e) { return false; }
}

function newStore() {
  return { attempts: [], skips: [], errs: 0, errors: [] };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function gameOver(Game) {
  try { return !!Game.over; } catch (e) { return false; }
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

// Pure stranded-morning gate (unit-tested). Input o:
// { gameOver, combatLive, prevOutcome, prevBucket, prevRescued,
//   wakeTileType, insideHaven }.
// Returns { fire: true } or { fire: false, skip: reason }.
function strandDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (!(o.prevOutcome === 'travel-refused' && o.prevBucket === 'creek' && o.prevRescued === false)) {
    return { fire: false, skip: 'prev-not-stranded' };
  }
  if (o.wakeTileType === 'haven' || o.insideHaven === true) return { fire: false, skip: 'haven-morning' };
  return { fire: true };
}

function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return 0; }
}

function dayTicks(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}

function ticksLeft(Game) {
  try {
    const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
    return tpd - dayTicks(Game);
  } catch (e) { return null; }
}

function playerWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}

function packFoodKcal(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    let sum = 0;
    for (const it of inv) {
      const k = (it && it.kcalEach) || 0;
      if (k > 0) sum += k * ((it.units === undefined || it.units === null) ? 1 : it.units);
    }
    return Math.round(sum);
  } catch (e) { return null; }
}

function snapInventory(Game) {
  try {
    return ((Game.state.scholar || {}).inventory || []).map((it) => {
      if (!it || typeof it !== 'object') return it;
      return { plantId: it.plantId || null, name: it.name || null, units: it.units || null,
        kcalEach: (it.kcalEach === undefined ? null : it.kcalEach),
        edible: (it.edible === undefined ? null : !!it.edible),
        foodState: it.foodState || null, material: it.material || null };
    });
  } catch (e) { return []; }
}

// Blocking test for a detail cell value. Uses the engine's own
// cellProps when available; falls back to the blocking set in
// cellProps' table (wall/water/tree/bigtree/tent/fire block).
function blocksCell(Game, cell) {
  try {
    if (Game && typeof Game.cellProps === 'function') return !!Game.cellProps(cell).blocks;
  } catch (e) {}
  return cell === 'wall' || cell === 'water' || cell === 'tree' || cell === 'bigtree' || cell === 'tent' || cell === 'fire';
}

function isWoodCell(cell) {
  return cell === 'tree' || cell === 'bigtree' || cell === 'bush';
}

function kindRank(cell) {
  if (cell === 'bigtree') return 0;
  if (cell === 'tree') return 1;
  return 2; // bush
}

// Pure BFS target choice (unit-tested). grid: 9x9 detail rows
// (grid[y][x]); start: [mx, my]; blocks: (cell) => boolean.
// Returns { target: {x, y, cell}, stance: [x, y], path: [[x,y],...] }
// (path excludes the start cell; empty path = already standing
// adjacent) or null when no wood cell is reachable from any
// stance. Choice: smallest path length; tie-break kind rank
// (bigtree > tree > bush), then target row-major order.
function findWoodTarget(grid, start, blocks) {
  const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
  const key = (x, y) => x + ',' + y;
  const [sx, sy] = start;
  if (!inB(sx, sy)) return null;
  // BFS over non-blocking cells (the start cell itself is
  // walkable by definition — the villager stands there).
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
  // Collect targets in row-major order; for each, the best
  // stance is the visited cell adjacent (Chebyshev <= 1) with
  // the smallest distance.
  let best = null;
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 9; tx++) {
      const cell = grid[ty] && grid[ty][tx];
      if (!isWoodCell(cell)) continue;
      let stance = null, stanceDist = null;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cx = tx + dx, cy = ty + dy;
          if (!inB(cx, cy)) continue;
          const k = key(cx, cy);
          if (!(k in dist)) continue;
          // A bush cell is its own stance (bush does not block);
          // a tree/bigtree cell is never visited (blocking), so
          // its stances are its walkable neighbours.
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
  // Reconstruct the path stance <- start.
  const path = [];
  let cur = best.stance;
  while (cur && !(cur[0] === sx && cur[1] === sy)) {
    path.unshift(cur);
    cur = prev[key(cur[0], cur[1])];
  }
  return { target: best.target, stance: best.stance, path };
}

// Pure verb-floor decision for one adjacent wood cell
// (unit-tested). Returns { verb: 'cutTree'|'clearBrush' } or
// { skip: reason }.
function verbDecision(o) {
  if (o.cell === 'tree' || o.cell === 'bigtree') {
    if (o.fells >= 2) return { skip: 'fell-cap' };
    if (o.kcal === null || o.kcal === undefined || o.kcal < 80) return { skip: 'kcal-floor' };
    if (o.ticksLeft === null || o.ticksLeft === undefined || o.ticksLeft < 96) return { skip: 'ticks-floor' };
    return { verb: 'cutTree' };
  }
  if (o.cell === 'bush') {
    if (o.kcal === null || o.kcal === undefined || o.kcal < 40) return { skip: 'kcal-floor' };
    if (o.ticksLeft === null || o.ticksLeft === undefined || o.ticksLeft < 32) return { skip: 'ticks-floor' };
    return { verb: 'clearBrush' };
  }
  return { skip: 'not-wood' };
}

function withStrandfix(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'strandfix',
    desc: 'nighttravel + woodcarry + woodwarm + morning joint food+wood recovery on stranded field mornings (STRANDFIX=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      if (!leverOn()) return inner.daily ? inner.daily(Game, ctx) : undefined;
      // Read the PREVIOUS evening's woodcarry record BEFORE inner
      // (woodcarry's own daily resets ctx._wcLast at its start).
      let prev = null;
      try { prev = (ctx && ctx._wcLast) || null; } catch (e) { prev = null; }
      try {
        const sch = (Game.state || {}).scholar || {};
        let wakeTileType = null;
        try { const t = Game.playerTile(); wakeTileType = t ? (t.type || null) : null; } catch (e) {}
        const insideHaven = (sch.insideHaven === undefined ? null : !!sch.insideHaven);
        const gate = strandDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          prevOutcome: prev ? prev.outcome : null,
          prevBucket: prev ? prev.bucket : null,
          prevRescued: prev ? prev.rescued : null,
          wakeTileType, insideHaven,
        });
        if (!gate.fire) {
          st.skips.push({ loopDay, skip: gate.skip,
            prevLoopDay: loopDay - 1, prevBucket: prev ? prev.bucket : null, prevRescued: prev ? prev.rescued : null,
            wakeTileType, insideHaven });
          return inner.daily ? inner.daily(Game, ctx) : undefined;
        }
        const wakeTile = (Game.map ? (Game.map.px + ',' + Game.map.py) : null);
        const morningKcal = scholarKcal(Game);
        const morningWood = playerWood(Game);
        const morningTicksLeft = ticksLeft(Game);
        const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
        const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
        let acted = false;

        // ---- PHASE 1: SECURE KCAL ----
        let foodPhase = null;
        const sweep = prePressSweep(Game);
        if (sweep.error) {
          noteErr(st, 'sweep', sweep.error);
          foodPhase = { kind: 'sweep-error', error: sweep.error };
        } else if (morningKcal >= 80) {
          foodPhase = { kind: 'already-fed', knownCapableCells: sweep.knownCapableCells, knownSpecies: sweep.knownSpecies };
        } else if (sweep.knownCapableCells >= 1 && morningTicksLeft !== null && morningTicksLeft >= 17) {
          const invBefore = snapInventory(Game);
          const kcalBefore = scholarKcal(Game);
          const ticksBefore = dayTicks(Game);
          let pressErr = null, retNull = null;
          try { const ret = Game.doAction('forage'); retNull = (ret === null || ret === undefined); }
          catch (e) { pressErr = String((e && (e.message || e)) || e).slice(0, 300); }
          const kcalAfterPress = scholarKcal(Game);
          const invAfterPress = snapInventory(Game);
          const totals = pressTotals(invBefore, invAfterPress);
          let eatErr = null;
          try { Game.eat(); } catch (e) { eatErr = String((e && (e.message || e)) || e).slice(0, 300); }
          const kcalAfterEat = scholarKcal(Game);
          const ticksAfter = dayTicks(Game);
          acted = true;
          foodPhase = { kind: 'forage-eat',
            knownCapableCells: sweep.knownCapableCells, knownSpecies: sweep.knownSpecies,
            pressErr, retNull, eatErr,
            E: totals.knownEdibleKcal, unknownUnits: totals.unknownUnits, unknownForms: totals.unknownForms,
            kcalBefore, kcalAfterPress, kcalAfterEat, realizedNet: kcalAfterEat - kcalBefore,
            ticksBefore, ticksAfter, ticksSpent: ticksAfter - ticksBefore };
        } else if (packFoodKcal(Game) > 0 && morningTicksLeft !== null && morningTicksLeft >= 1) {
          const kcalBefore = scholarKcal(Game);
          const ticksBefore = dayTicks(Game);
          let eatErr = null;
          try { Game.eat(); } catch (e) { eatErr = String((e && (e.message || e)) || e).slice(0, 300); }
          acted = true;
          foodPhase = { kind: 'eat-only', packFoodKcalBefore: packFoodKcal(Game),
            kcalBefore, kcalAfterEat: scholarKcal(Game), realizedNet: scholarKcal(Game) - kcalBefore,
            eatErr, ticksBefore, ticksAfter: dayTicks(Game), ticksSpent: dayTicks(Game) - ticksBefore };
        } else {
          foodPhase = { kind: 'skip',
            skip: (morningTicksLeft !== null && morningTicksLeft < 17) ? 'ticks-short' : 'no-known-kcal',
            knownCapableCells: sweep.knownCapableCells, knownSpecies: sweep.knownSpecies };
        }
        const kcalAfterFood = scholarKcal(Game);
        const ticksLeftAfterFood = ticksLeft(Game);

        // ---- PHASE 2: WOOD-SEEK ----
        let walkPhase = null, woodPhase = null;
        const woodBefore = playerWood(Game);
        if (woodBefore !== null && woodBefore < 4 && !gameOver(Game) && !combatLive(Game)) {
          // Snapshot the occupied tile's detail grid (copied rows).
          let grid = null;
          try {
            const live = Game.genDetail(Game.map.px, Game.map.py);
            grid = live.map((row) => (row ? row.slice() : row));
          } catch (e) { noteErr(st, 'woodscan', e); grid = null; }
          if (!grid) {
            walkPhase = { skipped: 'scan-error' };
            woodPhase = { skipped: 'scan-error' };
          } else {
            const curMx = (Game.state.scholar.mx === undefined || Game.state.scholar.mx === null) ? 4 : Game.state.scholar.mx;
            const curMy = (Game.state.scholar.my === undefined || Game.state.scholar.my === null) ? 4 : Game.state.scholar.my;
            const found = findWoodTarget(grid, [curMx, curMy], (c) => blocksCell(Game, c));
            if (!found) {
              walkPhase = { skipped: 'no-target' };
              woodPhase = { skipped: 'no-target' };
            } else {
              const ticksAtWalk = ticksLeft(Game);
              let steps = [];
              let walkStop = null;
              if (ticksAtWalk !== null && ticksAtWalk < found.path.length + 1) {
                walkStop = 'ticks-floor';
              } else {
                for (const [tx, ty] of found.path) {
                  if (gameOver(Game) || combatLive(Game)) { walkStop = combatLive(Game) ? 'combat' : 'game-over'; break; }
                  if (ticksLeft(Game) !== null && ticksLeft(Game) < 2) { walkStop = 'ticks-floor'; break; }
                  let ok = false, stepErr = null;
                  try { ok = !!Game.microMove(tx, ty); }
                  catch (e) { stepErr = String((e && (e.message || e)) || e).slice(0, 120); }
                  steps.push({ to: tx + ',' + ty, ok, error: stepErr });
                  if (!ok) { walkStop = 'walk-blocked'; break; }
                }
              }
              if (steps.length > 0) acted = true;
              walkPhase = { target: found.target, stance: found.stance, path: found.path.map(([x, y]) => x + ',' + y),
                steps, walkStop };
              // Verb loop at the stance (re-snapshot adjacent cells
              // each iteration: cutting mutates the live detail).
              const verbs = [];
              let fells = 0, stopReason = null;
              for (let iter = 0; iter < 12; iter++) {
                const curWood = playerWood(Game);
                if (curWood !== null && curWood >= 4) { stopReason = 'pack-ready'; break; }
                if (gameOver(Game) || combatLive(Game)) { stopReason = combatLive(Game) ? 'combat' : 'game-over'; break; }
                const pmx = (Game.state.scholar.mx === undefined || Game.state.scholar.mx === null) ? 4 : Game.state.scholar.mx;
                const pmy = (Game.state.scholar.my === undefined || Game.state.scholar.my === null) ? 4 : Game.state.scholar.my;
                let liveGrid = null;
                try {
                  const live = Game.genDetail(Game.map.px, Game.map.py);
                  liveGrid = live.map((row) => (row ? row.slice() : row));
                } catch (e) { noteErr(st, 'verbscan', e); stopReason = 'scan-error'; break; }
                // Adjacent wood cells: target cell first, then
                // remaining adjacent cells row-major.
                const adj = [];
                const pushAdj = (cx, cy) => {
                  if (cx < 0 || cx > 8 || cy < 0 || cy > 8) return;
                  const cell = liveGrid[cy] && liveGrid[cy][cx];
                  if (isWoodCell(cell)) adj.push({ cx, cy, cell });
                };
                pushAdj(found.target.x, found.target.y);
                for (let cy = Math.max(0, pmy - 1); cy <= Math.min(8, pmy + 1); cy++) {
                  for (let cx = Math.max(0, pmx - 1); cx <= Math.min(8, pmx + 1); cx++) {
                    if (cx === found.target.x && cy === found.target.y) continue;
                    pushAdj(cx, cy);
                  }
                }
                if (adj.length === 0) { stopReason = 'sources-exhausted'; break; }
                // Pick the first adjacent cell whose floors pass;
                // record the first failing reason if none passes.
                let picked = null, firstFail = null;
                for (const c of adj) {
                  const dec = verbDecision({ cell: c.cell, fells,
                    kcal: scholarKcal(Game), ticksLeft: ticksLeft(Game) });
                  if (dec.verb) { picked = { cell: c, verb: dec.verb }; break; }
                  if (!firstFail) firstFail = dec.skip;
                }
                if (!picked) { stopReason = firstFail || 'sources-exhausted'; break; }
                const wb = playerWood(Game);
                const kb = scholarKcal(Game), tb = dayTicks(Game);
                let verbErr = null;
                try {
                  if (picked.verb === 'cutTree') { Game.cutTree(picked.cell.cx, picked.cell.cy); fells++; }
                  else Game.clearBrush(picked.cell.cx, picked.cell.cy);
                } catch (e) { verbErr = String((e && (e.message || e)) || e).slice(0, 120); }
                const wa = playerWood(Game);
                acted = true;
                verbs.push({ verb: picked.verb, cell: picked.cell.cx + ',' + picked.cell.cy, kind: picked.cell.cell,
                  woodBefore: wb, woodAfter: wa, kcalBefore: kb, kcalAfter: scholarKcal(Game),
                  ticksBefore: tb, ticksAfter: dayTicks(Game), error: verbErr });
                if (wa === wb && !verbErr) { stopReason = 'verb-nochange'; break; }
              }
              if (!stopReason) {
                const curWood = playerWood(Game);
                stopReason = (curWood !== null && curWood >= 4) ? 'pack-ready' : 'sources-exhausted';
              }
              const woodAfter = playerWood(Game);
              woodPhase = { verbs, fells, stopReason,
                woodBefore, woodAfter, woodDelta: (woodAfter === null || woodBefore === null) ? null : woodAfter - woodBefore,
                kcalAfterFood, kcalAfterWood: scholarKcal(Game),
                kcalSpentWood: kcalAfterFood - scholarKcal(Game),
                ticksLeftAfterFood, ticksLeftAfterWood: ticksLeft(Game),
                ticksSpentWood: (ticksLeftAfterFood === null || ticksLeft(Game) === null) ? null : ticksLeftAfterFood - ticksLeft(Game) };
            }
          }
        } else if (woodBefore !== null && woodBefore >= 4) {
          walkPhase = { skipped: 'pack-ready' };
          woodPhase = { skipped: 'pack-ready' };
        } else {
          walkPhase = { skipped: (gameOver(Game) ? 'game-over' : (combatLive(Game) ? 'combat' : 'wood-unknown')) };
          woodPhase = walkPhase;
        }

        const rec = { loopDay, fired: true,
          prevLoopDay: loopDay - 1, prevBucket: prev ? prev.bucket : null, prevRescued: prev ? prev.rescued : null,
          wakeTile, wakeTileType, wake: [mx, my],
          morningKcal, morningWood, morningTicksLeft,
          foodPhase, walkPhase, woodPhase,
          kcalAfterWood: scholarKcal(Game), ticksLeftAfter: ticksLeft(Game),
          woodAfterMorning: playerWood(Game) };
        if (acted) st.attempts.push(rec);
        else {
          st.skips.push(Object.assign({}, rec, {
            skip: (foodPhase && foodPhase.skip) || (woodPhase && woodPhase.skipped) || 'no-action',
            fired: false }));
        }
      } catch (e) {
        noteErr(st, 'daily', e);
        st.attempts.push({ loopDay, fired: false, error: String((e && (e.message || e)) || e).slice(0, 300) });
      }
      return inner.daily ? inner.daily(Game, ctx) : undefined;
    },
  });
}

module.exports = { leverOn, newStore, strandDecision, findWoodTarget, verbDecision, blocksCell, withStrandfix };
