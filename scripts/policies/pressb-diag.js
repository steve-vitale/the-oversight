// pressb-diag — morning-press behavior variant (sim-pressb-b,
// 2026-10-30, flesh-out loop B, axis food-economy, backlog #1553).
// POLICY-SIDE VARIANT ONLY: zero src/js changes, zero edits to
// competent.js or any other existing policy file. Env-gated:
// PRESSB=1 arms it; unset/0 delegates to inner.daily untouched
// (the control leg runs the same stack with PRESSB=0).
//
// BEHAVIOR: on a stranded field morning — the villager woke on a
// field tile after a still-refused creek evening — press forage
// on the wake tile BEFORE inner.daily travels anywhere, then eat
// (press-then-eat is one morning behavior: a press at 0 kcal
// drives kcal to -60 effort debt, backlog #1552, and only the
// eat restores it; wakeforage's verdicts likewise assumed the
// eat step follows). The press fires ONLY when the live 3x3
// sweep around the wake cell holds a known food species, so on
// west-corner creek mornings (dirt, grass, water — nothing
// green) it skips silently and the day proceeds unchanged.
//
// PERCEPTION LAW (Steve 2026-10-28): the fire gate reads ONLY
// the wake cell + its 8 neighbours (the exact 3x3 the forage
// sweep works and perceptionHints scans), ONLY species already
// assigned on the tile map (never cellPlantSpecies, which
// backfills with Math.random() and would draw RNG), and ONLY
// the villager's own plantKnown flag. No whole-tile scan, no
// roster, no snapshot feed. The gate draws NO RNG and edits NO
// state; the only state changes are the engine's own forage +
// eat verbs on a fired morning.
//
// STRANDED DEFINITION (actionable form of wakeforage's
// definition; see sim-pressb-b-prereg.md): previous loop-day's
// woodcarry evening record (ctx._wcLast, read at daily entry
// before woodcarry's own daily resets it) has outcome
// 'travel-refused', bucket 'creek', rescued false; current
// wake tile type is not 'haven' and the scholar is not
// insideHaven. Wakeforage paired a morning with its SAME-day
// evening; a live policy cannot see the future evening, so the
// previous-evening form is the only actionable one — on a
// consecutive strand the two agree on every interior morning,
// differing only at the boundary morning after the last still
// evening (included here, reported as a boundary row).
//
// The wrapper NEVER calls microMove, cutTree, clearBrush,
// travelTo, or any verb besides forage + eat, and never writes
// game state except through those two engine verbs. Recording
// errors are counted in store.errs and never thrown into the
// engine. At most one attempt per loop-day.
'use strict';

function leverOn() {
  try { return process.env.PRESSB === '1'; } catch (e) { return false; }
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

// Pure gate (unit-tested by scripts/test-pressb-b.js). Input o:
// { gameOver, combatLive, prevBucket, prevRescued, prevOutcome,
//   wakeTileType, insideHaven, ticksLeft, knownCapableCells }
// Returns { fire: true } or { fire: false, skip: reason }.
function pressDecision(o) {
  if (o.gameOver) return { fire: false, skip: 'game-over' };
  if (o.combatLive) return { fire: false, skip: 'combat' };
  if (!(o.prevOutcome === 'travel-refused' && o.prevBucket === 'creek' && o.prevRescued === false)) {
    return { fire: false, skip: 'prev-not-stranded' };
  }
  if (o.wakeTileType === 'haven' || o.insideHaven === true) return { fire: false, skip: 'haven-morning' };
  if (o.ticksLeft === null || o.ticksLeft === undefined || o.ticksLeft < 17) return { fire: false, skip: 'ticks-short' };
  if (!o.knownCapableCells || o.knownCapableCells < 1) return { fire: false, skip: 'no-known-kcal' };
  return { fire: true };
}

// prePressSweep(Game): PURE READS ONLY — the wakeforage
// sweepAnalysis logic reduced to what the gate needs: the <=9
// sweep cells with cell type, assigned species, plantKnown,
// regrow/scorched flags, and the forageable + known-food
// verdicts. Returns { wake, wakeCell, cells, knownCapableCells,
// knownSpecies, error } — never throws, never draws RNG
// (species read ONLY where already assigned).
function prePressSweep(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
    const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
    const live = Game.genDetail(Game.map.px, Game.map.py);
    const grid = live.map((row) => (row ? row.slice() : row));
    let t = null;
    try { t = Game.playerTile(); } catch (e) { t = null; }
    if (!t && typeof Game.tileAt === 'function') { try { t = Game.tileAt(Game.map.px, Game.map.py); } catch (e) {} }
    const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
    const cellAt = (x, y) => (grid[y] && grid[y][x]) || null;
    const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
    const cells = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = mx + dx, cy = my + dy;
      if (!inB(cx, cy)) continue;
      const cell = cellAt(cx, cy);
      const key = cx + ',' + cy;
      let species = null, assigned = false;
      try {
        if (cell === 'plant' && t && t.plantSpecies && t.plantSpecies[key]) { species = t.plantSpecies[key]; assigned = true; }
        else if (cell === 'bush' && t && t.bushSpecies && t.bushSpecies[key]) { species = t.bushSpecies[key]; assigned = true; }
      } catch (e) {}
      let known = null;
      try { if (species && typeof Game.plantKnown === 'function') known = !!Game.plantKnown(species); } catch (e) { known = null; }
      let regrow = false, scorched = null;
      try { regrow = !!(t && t.detailRegrow && t.detailRegrow[key]); } catch (e) {}
      try { scorched = (typeof Game.cellScorched === 'function') ? !!Game.cellScorched(cx, cy) : null; } catch (e) { scorched = null; }
      const forageable = !!FORAGEABLE[cell] && !regrow && scorched !== true;
      // Known FOOD species only: plant/bush cells with an assigned
      // known species. Tree/bigtree cells give deadfall, never food,
      // and their nut species is not resolved here (same limitation
      // as wakeforage's recorder) — they never satisfy the gate.
      const knownFood = forageable && (cell === 'plant' || cell === 'bush') && assigned && known === true;
      cells.push({ x: cx, y: cy, cell, species, assigned, known, regrow, scorched, forageable, knownFood });
    }
    const knownCells = cells.filter((c) => c.knownFood);
    return { wake: [mx, my], wakeCell: cellAt(mx, my), cells,
      knownCapableCells: knownCells.length,
      knownSpecies: knownCells.map((c) => c.species), error: null };
  } catch (e) { return { wake: null, wakeCell: null, cells: [], knownCapableCells: 0, knownSpecies: [], error: String((e && (e.message || e)) || e).slice(0, 200) }; }
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

function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return 0; }
}

function dayTicks(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}

// pressTotals(before, after): known-edible kcal added by the press,
// counting BOTH new stacks and positive unit deltas on merged
// stacks (wakeforage replay fix: the engine merges unknown lumps
// into an existing pack stack; the same applies to known items).
// Unknown units + deadfall reported separately, never in E.
function pressTotals(before, after) {
  let knownEdibleKcal = 0, unknownUnits = 0;
  const unknownForms = [];
  const deadfall = { branches: 0, bark: 0, fiber: 0, sticks: 0, vines: 0 };
  const classify = (it, mult) => {
    if (!it) return;
    if (it.plantId && it.edible === true) knownEdibleKcal += mult * (it.kcalEach || 0);
    else if (it.foodState === 'unknown') { unknownUnits += mult; unknownForms.push(it.name); }
    else if (it.material === 'branch') deadfall.branches += mult;
    else if (it.material === 'bark') deadfall.bark += mult;
    else if (it.material === 'fiber') deadfall.fiber += mult;
    else if (it.material === 'stick') deadfall.sticks += mult;
    else if (it.material === 'vine') deadfall.vines += mult;
  };
  const added = after.slice(before.length);
  for (const it of added) classify(it, it.units || 0);
  const changed = [];
  for (let i = 0; i < Math.min(before.length, after.length); i++) {
    if (JSON.stringify(before[i]) !== JSON.stringify(after[i])) changed.push({ idx: i, before: before[i], after: after[i] });
  }
  for (const c of changed) {
    const du = (c.after.units || 0) - (c.before.units || 0);
    if (du > 0) classify(c.after, du);
  }
  return { knownEdibleKcal, unknownUnits, unknownForms, deadfall, addedItems: added, changedItems: changed };
}

function withPressb(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'pressb',
    desc: 'nighttravel + woodcarry + woodwarm + morning press on stranded field mornings (PRESSB=1)',
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
        let ticksLeft = null;
        try { const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512; ticksLeft = tpd - (sch.dayTicks || 0); } catch (e) {}
        const sweep = prePressSweep(Game);
        if (sweep.error) {
          noteErr(st, 'sweep', sweep.error);
          st.skips.push({ loopDay, skip: 'sweep-error', error: sweep.error });
        } else {
          const dec = pressDecision({
            gameOver: gameOver(Game), combatLive: combatLive(Game),
            prevOutcome: prev ? prev.outcome : null,
            prevBucket: prev ? prev.bucket : null,
            prevRescued: prev ? prev.rescued : null,
            wakeTileType, insideHaven, ticksLeft,
            knownCapableCells: sweep.knownCapableCells,
          });
          if (!dec.fire) {
            st.skips.push({ loopDay, skip: dec.skip,
              prevLoopDay: loopDay - 1, prevBucket: prev ? prev.bucket : null, prevRescued: prev ? prev.rescued : null,
              wakeTileType, insideHaven, ticksLeft, knownCapableCells: sweep.knownCapableCells,
              knownSpecies: sweep.knownSpecies });
          } else {
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
            st.attempts.push({ loopDay, fired: true,
              prevLoopDay: loopDay - 1, prevBucket: prev ? prev.bucket : null, prevRescued: prev ? prev.rescued : null,
              wakeTile: (Game.map ? (Game.map.px + ',' + Game.map.py) : null), wakeTileType,
              wake: sweep.wake, wakeCell: sweep.wakeCell,
              morningKcal: kcalBefore, knownCapableCells: sweep.knownCapableCells, knownSpecies: sweep.knownSpecies,
              pressErr, retNull, eatErr,
              E: totals.knownEdibleKcal, unknownUnits: totals.unknownUnits, unknownForms: totals.unknownForms,
              deadfall: totals.deadfall, addedItems: totals.addedItems, changedItems: totals.changedItems,
              kcalAfterPress, kcalAfterEat, realizedNet: kcalAfterEat - kcalBefore,
              ticksBefore, ticksAfter, ticksSpent: ticksAfter - ticksBefore });
          }
        }
      } catch (e) {
        noteErr(st, 'daily', e);
        st.attempts.push({ loopDay, fired: false, error: String((e && (e.message || e)) || e).slice(0, 300) });
      }
      return inner.daily ? inner.daily(Game, ctx) : undefined;
    },
  });
}

module.exports = { withPressb, newStore, pressDecision, prePressSweep, pressTotals, leverOn };
