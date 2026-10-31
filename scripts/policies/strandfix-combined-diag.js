// strandfix-combined-diag — COMBINED strand-fix prototype, DIAG ONLY
// (sim-strandfix-combined-b, 2026-10-30, flesh-out loop B, axis
// food-economy). POLICY-SIDE VARIANT ONLY: zero src/js changes,
// zero edits to any existing policy file, zero policy-default
// flips. Env-gated: STRANDFIX=1 arms it; unset/0 delegates to
// inner.daily untouched (the OFF leg runs the same stack with
// STRANDFIX=0 and must reproduce the fresh baselines exactly).
// Component toggles (driver asserts them explicitly):
//   STRANDFIX_KCAL=1 — morning press + eat (kcal-first)
//   STRANDFIX_WOOD=1 — sensed exploration walk + fell / brush
// Warmth protection is NOT in this file: it lives in the driver
// stack as woodwarm's restraint option (R1: the fire acts only
// when the pack holds >= 5 logs, so bridge logs 1..4 are never
// spent — see the driver header and the prereg). R1 is a landed
// woodwarm option, not an edit; this file imports nothing.
//
// BEHAVIOR (one morning behavior, on actionable stranded field
// mornings only — previous loop-day's woodcarry record is a
// still-refused creek evening, villager awake in the field):
//   1. KCAL FIRST: if the sensed window holds a known food
//      species (plant/bush, assigned, plantKnown), press forage
//      on the wake tile and eat, exactly as a player would
//      (forage 16 ticks + eat 1 tick = 17, effort priced by the
//      engine). The press fires only when the tick budget
//      allows it (see below).
//   2. WOOD-SEEK: walk the tile by SENSED exploration to a
//      standing cell adjacent to a sensed tree/bigtree and fell
//      it (96 ticks, 80 kcal effort, engine yield), or clear a
//      sensed adjacent bush (+1 wood, 32 ticks, 40 kcal) when
//      the wood deficit is exactly 1 and felling does not fit
//      the budget. Exploration never plans over unsensed ground:
//      the planner sees only the union of 3x3 windows around
//      cells already visited this morning (the wake cell plus
//      every cell actually stepped on), exactly the ground the
//      villager has stood beside. A bigtree the villager has
//      not walked near does not exist to the planner, however
//      the recorder's full grid looks.
//   3. TICK PRESERVATION (guardrail, not a rescue): morning
//      actions are budgeted against TICK_RESERVE = 136 ticks
//      left in the day (bridge need 96 + routine allowance 40,
//      covering the observed non-day-7 routine spend of 17-33
//      ticks with slack). An action fires only if the projected
//      ticks-left after it stays >= 136. On a 128-tick morning
//      (the day-7 shape) the allowed spend is negative, so the
//      prototype does NOTHING tick-costly: it refuses to worsen
//      a short day. This guardrail cannot fix day 7 — day 7 has
//      no morning behavior to budget (press skips
//      'prev-not-stranded', the routine + waits hole is 49
//      ticks with bridge wood in hand) — and the prereg says so
//      plainly. What it does is guarantee the prototype never
//      CREATES a ticks-short evening: a fell is deferred, not
//      forced, when it would eat the bridge reserve.
//   The evening bridge itself is woodcarry's existing evening
//   step (gates 4 logs / 60 kcal / 96 ticks): morning gains
//   flow into it unchanged. This file takes no evening action.
//
// COSTS (engine prices, never invented): step 1 tick + 2 kcal;
// forage 16 ticks + 60 effort kcal; eat 1 tick; fell 96 ticks
// + 80 kcal; brush 32 ticks + 40 kcal; bridge 96 ticks +
// 60 kcal (evening gate, not spent here).
//
// The wrapper NEVER calls travelTo, buildBridge, takeWood, or
// any verb besides doAction('forage'), eat, microMove, cutTree,
// clearBrush, and never writes game state except through those
// engine verbs. Recording errors are counted in store.errs and
// never thrown into the engine. At most one morning behavior
// per loop-day (one press, one wood-seek sequence).
'use strict';

const TICK_RESERVE = 136;
const BRIDGE_WOOD = 4;
const BRIDGE_KCAL = 60;
const BRIDGE_TICKS = 96;
const PRESS_TICKS = 17;
const FELL_TICKS = 96;
const BRUSH_TICKS = 32;
const MAX_STEPS = 30;

function leverOn() {
  try { return process.env.STRANDFIX === '1'; } catch (e) { return false; }
}
function kcalOn() {
  try { return process.env.STRANDFIX_KCAL !== '0'; } catch (e) { return true; }
}
function woodOn() {
  try { return process.env.STRANDFIX_WOOD !== '0'; } catch (e) { return true; }
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
//   wakeTileType, insideHaven }
// Returns { fire: true } or { fire: false, skip: reason }.
function strandfixDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (!(o.prevOutcome === 'travel-refused' && o.prevBucket === 'creek' && o.prevRescued === false)) {
    return { fire: false, skip: 'prev-not-stranded' };
  }
  if (o.wakeTileType === 'haven' || o.insideHaven === true) return { fire: false, skip: 'haven-morning' };
  return { fire: true };
}

// Pure tick-budget gate (unit-tested). ticksLeft = ticks left at
// morning entry; cost = ticks the action will spend.
// Returns { allow: true, ticksLeftAfter } or { allow: false }.
function budgetDecision(ticksLeft, cost) {
  if (ticksLeft === null || ticksLeft === undefined) return { allow: false, reason: 'ticks-unknown' };
  const after = ticksLeft - cost;
  if (after < TICK_RESERVE) return { allow: false, reason: 'tick-reserve', ticksLeftAfter: after };
  return { allow: true, ticksLeftAfter: after };
}

// ---- Sensed-view planning (pure; unit-tested on fixture grids) ----
// A masked view is a Map keyed 'x,y' -> cell type, containing ONLY
// cells inside the union of 3x3 windows around visited cells, plus
// for plant/bush cells: { species, assigned, known, forageable }.
// The planner never sees any other cell, by construction.
function keyOf(x, y) { return x + ',' + y; }
function inB(x, y) { return x >= 0 && x <= 8 && y >= 0 && y <= 8; }
const NEIGHBORS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
const BLOCKING = { water: 1, tree: 1, bigtree: 1, wall: 1, fire: 1 };
function isWalkableCell(cell) {
  if (cell === null || cell === undefined) return false;
  if (BLOCKING[cell]) return false;
  return true;
}
// bfsPath(view, from, isGoal): shortest path over walkable sensed
// cells from `from` (exclusive of start) to any cell satisfying
// isGoal, or null. Cells not in the view are walls (unsensed).
function bfsPath(view, from, isGoal) {
  const start = keyOf(from[0], from[1]);
  if (isGoal(from[0], from[1], view.get(start))) return [];
  const prev = new Map([[start, null]]);
  const queue = [from];
  while (queue.length) {
    const [cx, cy] = queue.shift();
    for (const [dx, dy] of NEIGHBORS) {
      const nx = cx + dx, ny = cy + dy;
      if (!inB(nx, ny)) continue;
      const k = keyOf(nx, ny);
      if (prev.has(k)) continue;
      const cell = view.get(k);
      if (cell === undefined) continue; // unsensed: not traversable
      if (!isWalkableCell(cell.type !== undefined ? cell.type : cell)) continue;
      prev.set(k, [cx, cy]);
      if (isGoal(nx, ny, cell)) {
        const path = [[nx, ny]];
        let cur = [cx, cy];
        while (cur) { path.unshift(cur); cur = prev.get(keyOf(cur[0], cur[1])); }
        path.shift(); // drop start cell
        return path;
      }
      queue.push([nx, ny]);
    }
  }
  return null;
}
// findFellTarget(view, pos): a sensed tree/bigtree adjacent to
// pos (Chebyshev <= 1), preferring bigtree, else null.
// Returns { tx, ty, kind }.
function findFellTarget(view, pos) {
  let tree = null, big = null;
  for (const [dx, dy] of NEIGHBORS) {
    const nx = pos[0] + dx, ny = pos[1] + dy;
    if (!inB(nx, ny)) continue;
    const cell = view.get(keyOf(nx, ny));
    const type = cell === undefined ? undefined : (cell.type !== undefined ? cell.type : cell);
    if (type === 'bigtree') big = { tx: nx, ty: ny, kind: 'bigtree' };
    else if (type === 'tree') tree = tree || { tx: nx, ty: ny, kind: 'tree' };
  }
  return big || tree || null;
}
// findBrushTarget(view, pos): a sensed bush adjacent to pos.
function findBrushTarget(view, pos) {
  for (const [dx, dy] of NEIGHBORS) {
    const nx = pos[0] + dx, ny = pos[1] + dy;
    if (!inB(nx, ny)) continue;
    const cell = view.get(keyOf(nx, ny));
    const type = cell === undefined ? undefined : (cell.type !== undefined ? cell.type : cell);
    if (type === 'bush') return { tx: nx, ty: ny, kind: 'bush' };
  }
  return null;
}
// findKnownFood(view): sensed plant/bush cells with assigned known
// species and forageable. Returns count + species list.
function findKnownFood(view) {
  const out = [];
  for (const [, cell] of view) {
    if (!cell || typeof cell !== 'object') continue;
    if ((cell.type === 'plant' || cell.type === 'bush') && cell.assigned && cell.known === true && cell.forageable) {
      out.push(cell.species || null);
    }
  }
  return { count: out.length, species: out };
}

// ---- Live reads (sensed windows only) ----
function scholarPos(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    return [(sch.mx === undefined || sch.mx === null) ? 4 : sch.mx,
      (sch.my === undefined || sch.my === null) ? 4 : sch.my];
  } catch (e) { return [4, 4]; }
}
function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return 0; }
}
function dayTicksOf(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}
function ticksLeftOf(Game) {
  try { const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512; return tpd - dayTicksOf(Game); } catch (e) { return null; }
}
function playerWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}
function itemView(it) {
  if (!it || typeof it !== 'object') return it;
  return { plantId: it.plantId || null, name: it.name || null, units: it.units || null,
    kcalEach: (it.kcalEach === undefined ? null : it.kcalEach),
    hiddenKcal: (it.hiddenKcal === undefined ? null : it.hiddenKcal),
    edible: (it.edible === undefined ? null : !!it.edible),
    foodKind: it.foodKind || null, foodState: it.foodState || null,
    material: it.material || null };
}
function snapInventory(Game) {
  try { return ((Game.state.scholar || {}).inventory || []).map(itemView); } catch (e) { return []; }
}
// pressTotals(before, after): known-edible kcal added by a press,
// counting new stacks + positive unit deltas on merged stacks.
function pressTotals(before, after) {
  let knownEdibleKcal = 0, unknownUnits = 0;
  const unknownForms = [];
  const classify = (it, mult) => {
    if (!it) return;
    if (it.plantId && it.edible === true) knownEdibleKcal += mult * (it.kcalEach || 0);
    else if (it.foodState === 'unknown') { unknownUnits += mult; unknownForms.push(it.name); }
  };
  const added = after.slice(before.length);
  for (const it of added) classify(it, it.units || 0);
  for (let i = 0; i < Math.min(before.length, after.length); i++) {
    if (JSON.stringify(before[i]) !== JSON.stringify(after[i])) {
      const du = (after[i].units || 0) - (before[i].units || 0);
      if (du > 0) classify(after[i], du);
    }
  }
  return { knownEdibleKcal, unknownUnits, unknownForms };
}
// senseView(Game, visited): build the masked view from the union
// of 3x3 windows around visited cells. Reads the live detail grid
// but copies ONLY window cells into the view — the planner's
// input, and the proof that it never sees unsensed ground.
function senseView(Game, visited) {
  const view = new Map();
  try {
    const live = Game.genDetail(Game.map.px, Game.map.py);
    let t = null;
    try { t = Game.playerTile(); } catch (e) { t = null; }
    if (!t && typeof Game.tileAt === 'function') { try { t = Game.tileAt(Game.map.px, Game.map.py); } catch (e) {} }
    const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
    for (const [vx, vy] of visited) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const cx = vx + dx, cy = vy + dy;
        if (!inB(cx, cy)) continue;
        const k = keyOf(cx, cy);
        if (view.has(k)) continue;
        const cell = (live[cy] && live[cy][cx]) || null;
        let species = null, assigned = false;
        try {
          if (cell === 'plant' && t && t.plantSpecies && t.plantSpecies[k]) { species = t.plantSpecies[k]; assigned = true; }
          else if (cell === 'bush' && t && t.bushSpecies && t.bushSpecies[k]) { species = t.bushSpecies[k]; assigned = true; }
        } catch (e) {}
        let known = null;
        try { if (species && typeof Game.plantKnown === 'function') known = !!Game.plantKnown(species); } catch (e) { known = null; }
        let regrow = false, scorched = null;
        try { regrow = !!(t && t.detailRegrow && t.detailRegrow[k]); } catch (e) {}
        try { scorched = (typeof Game.cellScorched === 'function') ? !!Game.cellScorched(cx, cy) : null; } catch (e) { scorched = null; }
        view.set(k, { type: cell, species, assigned, known, regrow, scorched,
          forageable: !!FORAGEABLE[cell] && !regrow && scorched !== true });
      }
    }
  } catch (e) { /* view stays partial; caller records the error */ }
  return view;
}

function withStrandfix(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'strandfix',
    desc: 'combined strand-fix prototype (STRANDFIX=1): kcal-first press + sensed wood-seek, tick-reserve 136',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      if (!leverOn()) return inner.daily ? inner.daily(Game, ctx) : undefined;
      let prev = null;
      try { prev = (ctx && ctx._wcLast) || null; } catch (e) { prev = null; }
      try {
        const sch = (Game.state || {}).scholar || {};
        let wakeTileType = null;
        try { const t = Game.playerTile(); wakeTileType = t ? (t.type || null) : null; } catch (e) {}
        const insideHaven = (sch.insideHaven === undefined ? null : !!sch.insideHaven);
        const dec = strandfixDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          prevOutcome: prev ? prev.outcome : null,
          prevBucket: prev ? prev.bucket : null,
          prevRescued: prev ? prev.rescued : null,
          wakeTileType, insideHaven,
        });
        if (!dec.fire) {
          st.skips.push({ loopDay, skip: dec.skip,
            prevLoopDay: loopDay - 1, prevBucket: prev ? prev.bucket : null, prevRescued: prev ? prev.rescued : null,
            wakeTileType, insideHaven });
          return inner.daily ? inner.daily(Game, ctx) : undefined;
        }
        // ---- Morning behavior ----
        const wake = scholarPos(Game);
        const visited = [[wake[0], wake[1]]];
        const visitedKeys = new Set([keyOf(wake[0], wake[1])]);
        const morningKcal = scholarKcal(Game);
        const morningWood = playerWood(Game);
        const ticksLeftEntry = ticksLeftOf(Game);
        const ticksBefore = dayTicksOf(Game);
        const rec = { loopDay, fired: true, wake, wakeTileType,
          morningKcal, morningWood, ticksLeftEntry,
          press: null, steps: [], fell: null, brush: null,
          woodAfter: null, kcalAfter: null, ticksSpent: null,
          stop: null, deferredFell: false, deferredBrush: false, errs: [] };
        let spent = 0; // morning ticks spent (tracked, not re-read per action)
        const budgetLeft = () => (ticksLeftEntry === null ? -1 : ticksLeftEntry - spent);
        const canAfford = (cost) => {
          if (ticksLeftEntry === null) return false;
          return (ticksLeftEntry - spent - cost) >= TICK_RESERVE;
        };
        let pressed = false;
        // Exploration loop: press opportunity first, then fell/brush,
        // then one step. Re-senses after every step.
        for (let iter = 0; iter < MAX_STEPS + 4; iter++) {
          if (gameOver(Game) || combatLive(Game)) { rec.stop = gameOver(Game) ? 'game-over' : 'combat'; break; }
          const pos = scholarPos(Game);
          const view = senseView(Game, visited);
          const woodNow = playerWood(Game);
          // 1. KCAL FIRST: press if known food sensed and not pressed.
          if (kcalOn() && !pressed) {
            const food = findKnownFood(view);
            if (food.count >= 1) {
              if (!canAfford(PRESS_TICKS)) { rec.stop = rec.stop || 'tick-deferred-press'; break; }
              const invBefore = snapInventory(Game);
              const kcalBeforePress = scholarKcal(Game);
              const ticksBeforePress = dayTicksOf(Game);
              let pressErr = null, eatErr = null;
              try { Game.doAction('forage'); } catch (e) { pressErr = String((e && (e.message || e)) || e).slice(0, 300); }
              const invAfterPress = snapInventory(Game);
              const totals = pressTotals(invBefore, invAfterPress);
              try { Game.eat(); } catch (e) { eatErr = String((e && (e.message || e)) || e).slice(0, 300); }
              pressed = true;
              spent += (dayTicksOf(Game) - ticksBeforePress);
              rec.press = { knownCapableCells: food.count, knownSpecies: food.species,
                pressErr, eatErr, E: totals.knownEdibleKcal, unknownUnits: totals.unknownUnits,
                kcalBeforePress, kcalAfterEat: scholarKcal(Game),
                ticksSpent: dayTicksOf(Game) - ticksBeforePress };
              continue;
            }
          }
          // 2. WOOD: fell if adjacent sensed tree/bigtree and deficit.
          if (woodOn() && woodNow !== null && woodNow < BRIDGE_WOOD) {
            const target = findFellTarget(view, pos);
            if (target) {
              if (!canAfford(FELL_TICKS)) { rec.deferredFell = true; rec.stop = rec.stop || 'tick-deferred-fell'; break; }
              const woodBefore = playerWood(Game);
              const kcalBeforeFell = scholarKcal(Game);
              const ticksBeforeFell = dayTicksOf(Game);
              let fellErr = null;
              try { Game.cutTree(target.tx, target.ty); } catch (e) { fellErr = String((e && (e.message || e)) || e).slice(0, 300); }
              spent += (dayTicksOf(Game) - ticksBeforeFell);
              rec.fell = { target, fellErr, woodBefore, woodAfter: playerWood(Game),
                kcalBeforeFell, kcalAfterFell: scholarKcal(Game),
                ticksSpent: dayTicksOf(Game) - ticksBeforeFell };
              if ((playerWood(Game) || 0) >= BRIDGE_WOOD) { rec.stop = 'wood-satisfied'; break; }
              continue;
            }
            // Brush fallback: deficit exactly 1, fell not adjacent.
            const brush = findBrushTarget(view, pos);
            if (brush && (BRIDGE_WOOD - woodNow) === 1) {
              if (!canAfford(BRUSH_TICKS)) { rec.deferredBrush = true; rec.stop = rec.stop || 'tick-deferred-brush'; break; }
              const woodBefore = playerWood(Game);
              const ticksBeforeBrush = dayTicksOf(Game);
              let brushErr = null;
              try { Game.clearBrush(brush.tx, brush.ty); } catch (e) { brushErr = String((e && (e.message || e)) || e).slice(0, 300); }
              spent += (dayTicksOf(Game) - ticksBeforeBrush);
              rec.brush = { target: brush, brushErr, woodBefore, woodAfter: playerWood(Game),
                ticksSpent: dayTicksOf(Game) - ticksBeforeBrush };
              if ((playerWood(Game) || 0) >= BRIDGE_WOOD) { rec.stop = 'wood-satisfied'; break; }
              continue;
            }
          } else if (woodOn() && woodNow !== null && woodNow >= BRIDGE_WOOD) {
            rec.stop = rec.stop || 'wood-satisfied';
            break;
          }
          // No wood component, or wood satisfied, or no target: if the
          // kcal component already pressed (or is off), the morning is
          // done unless exploration can still find wood.
          if (!woodOn()) { rec.stop = rec.stop || 'wood-component-off'; break; }
          if (woodNow !== null && woodNow >= BRIDGE_WOOD) { rec.stop = 'wood-satisfied'; break; }
          // 3. STEP: path to a standing cell adjacent to a sensed tree,
          // else one exploration step to an unvisited sensed walkable cell.
          let path = null;
          // Standing cells: sensed walkable cells adjacent to a sensed tree.
          const standingGoal = (x, y) => {
            for (const [dx, dy] of NEIGHBORS) {
              const nx = x + dx, ny = y + dy;
              if (!inB(nx, ny)) continue;
              const c = view.get(keyOf(nx, ny));
              const ty = c === undefined ? undefined : (c.type !== undefined ? c.type : c);
              if (ty === 'tree' || ty === 'bigtree') return true;
            }
            return false;
          };
          if (!standingGoal(pos[0], pos[1])) {
            path = bfsPath(view, pos, (x, y, cell) => {
              const ty = cell === undefined ? undefined : (cell.type !== undefined ? cell.type : cell);
              if (!isWalkableCell(ty)) return false;
              return standingGoal(x, y);
            });
          }
          if (!path) {
            // Exploration: nearest unvisited sensed walkable cell.
            path = bfsPath(view, pos, (x, y) => !visitedKeys.has(keyOf(x, y)));
          }
          if (!path || path.length === 0) { rec.stop = rec.stop || 'exploration-exhausted'; break; }
          if (rec.steps.length >= MAX_STEPS) { rec.stop = rec.stop || 'step-cap'; break; }
          if (!canAfford(1)) { rec.stop = rec.stop || 'tick-deferred-step'; break; }
          const [nx, ny] = path[0];
          const ticksBeforeStep = dayTicksOf(Game);
          let stepOk = false;
          try { stepOk = !!Game.microMove(nx, ny); } catch (e) { stepOk = false; rec.errs.push('step:' + String((e && (e.message || e)) || e).slice(0, 120)); }
          spent += (dayTicksOf(Game) - ticksBeforeStep);
          rec.steps.push({ from: pos, to: [nx, ny], ok: stepOk });
          if (!stepOk) { rec.stop = 'step-blocked'; break; }
          visited.push([nx, ny]);
          visitedKeys.add(keyOf(nx, ny));
        }
        if (!rec.stop) rec.stop = 'loop-end';
        rec.woodAfter = playerWood(Game);
        rec.kcalAfter = scholarKcal(Game);
        rec.ticksSpent = dayTicksOf(Game) - ticksBefore;
        rec.posAfter = scholarPos(Game);
        st.attempts.push(rec);
      } catch (e) {
        noteErr(st, 'daily', e);
        st.attempts.push({ loopDay, fired: false, error: String((e && (e.message || e)) || e).slice(0, 300) });
      }
      return inner.daily ? inner.daily(Game, ctx) : undefined;
    },
  });
}

module.exports = { leverOn, newStore, strandfixDecision, budgetDecision,
  TICK_RESERVE, BRIDGE_WOOD, BRIDGE_KCAL, BRIDGE_TICKS,
  bfsPath, findFellTarget, findBrushTarget, findKnownFood, isWalkableCell,
  keyOf, withStrandfix };
