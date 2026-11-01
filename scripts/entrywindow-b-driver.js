#!/usr/bin/env node
// entrywindow-b-driver.js — entry-window census tracer.
// Stage 1/2a instrument for sim-entrywindow-b. The census it runs is
// MEASUREMENT, not a judged pilot; the judged pilot (if any) runs
// under evidence/2026-11-01/sim-entrywindow-b-prereg.md, committed
// BEFORE any judged sim (see the prereg's commit-order note for the
// exact sequencing: census first, prereg commit second, pilot third).
// Same substrate as fertrot (competent, 30d, DEPOSITGATE=0). Census
// policy is baseline 'competent' only; the driver also accepts
// 'competent-entrywindow-b' once that policy file exists, for a
// later judged pilot. Per loopDay:
// day-start snapshot, every travelTo + doAction('forage') call,
// trip-end snapshot when a walk home lands on the haven after a
// successful forage, every returnToVillage call (packcomp rule: live =
// Game.over false at entry). NEW vs fertrot: every travelTo records
// the menu-time PREDICTED entry cell (travelTo's own formula +
// findWalkableEntry BFS, replicated on the tile's EXISTING detail
// only — never genDetail, so no ground is created and no first-visit
// strip fires) against the ACTUAL post-travel mx/my, and every
// forage attempt records its pre-sweep ENTRY-WINDOW count (3x3
// around the entry cell, the sweep's own test). The driver NEVER
// moves the scholar: wrappers count only (assignments + orig
// passthrough). No travelTo, returnToVillage, eat, donateToPantry,
// shellNuts, or identifyPlant call in the judged path.
//
// Transport (EPERM-flap rule, as haulsize): this process NEVER writes
// files — it prints one JSON line per seed to stdout with
// callback-based writes and backoff retry. The caller redirects
// stdout to a .jsonl file.
//
// Env (FATAL if violated on the judged CLI path):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   POLICY=competent|competent-entrywindow-b, DAYS=30, and the packcomp
//   * =1 flags must NOT be 1.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
function loadEntrywindowPolicy() {
  try { return require('./policies/competent-entrywindow-b').entrywindow; }
  catch (e) { console.error('FATAL: competent-entrywindow-b policy file missing: ' + (e && e.message)); process.exit(2); }
}

function checkEnv() {
  if (process.env.POLICY !== 'competent' && process.env.POLICY !== 'competent-entrywindow-b') { console.error('FATAL: POLICY must be competent or competent-entrywindow-b'); process.exit(2); }
  if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
  if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
  if (process.env.DEPOSITGATE !== '0') { console.error('FATAL: DEPOSITGATE=0 must be set explicitly'); process.exit(2); }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in an entrywindow leg'); process.exit(2); }
  }
  if (parseInt(process.env.DAYS || '30', 10) !== 30) { console.error('FATAL: DAYS must be 30 for entrywindow legs'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '60109').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = 30;
const POLICY_ID = process.env.POLICY || 'competent';
const POLICY_OBJ = POLICY_ID === 'competent-entrywindow-b' ? loadEntrywindowPolicy() : competent;

function numOrNull(fn) {
  try { const v = fn(); return (typeof v === 'number' && isFinite(v)) ? v : null; } catch (e) { return null; }
}
function dayTicksOf(Game) {
  try { const v = (Game.state || {}).scholar || {}; return (v.dayTicks === undefined ? null : v.dayTicks); } catch (e) { return null; }
}
function posOf(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    return { x: (Game.map || {}).px ?? null, y: (Game.map || {}).py ?? null,
      mx: (sch.mx ?? null), my: (sch.my ?? null) };
  } catch (e) { return { x: null, y: null, mx: null, my: null }; }
}
// PURE (also exported for the proof test): replicate travelTo's entry
// computation (game.js travelTo + findWalkableEntry) on an EXISTING
// detail grid. Returns null when detail is absent (unvisited tile:
// computing it would call genDetail, which on first visit strips
// cells and mutates stock — so an honest menu-time read is null
// there, exactly the perception boundary this arm respects).
// cellPropsFn(cell) -> {blocks} (Game.cellProps in the driver).
function predictEntry(fromPx, fromPy, fromMx, fromMy, destX, destY, detail, cellPropsFn) {
  if (!Array.isArray(detail)) return null;
  const clamp9 = (v) => Math.max(0, Math.min(8, v));
  const odx = Math.sign(destX - fromPx), ody = Math.sign(destY - fromPy);
  const wantX = odx > 0 ? 0 : odx < 0 ? 8 : clamp9(fromMx == null ? 4 : fromMx);
  const wantY = ody > 0 ? 0 : ody < 0 ? 8 : clamp9(fromMy == null ? 4 : fromMy);
  const walkable = (cx, cy) => {
    if (cx < 0 || cy < 0 || cx > 8 || cy > 8) return false;
    const cell = detail[cy] && detail[cy][cx];
    if (!cell) return false;
    try { return !cellPropsFn(cell).blocks; } catch (e) { return false; }
  };
  const hasExit = (cx, cy) => {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]])
      if (walkable(cx + dx, cy + dy)) return true;
    return false;
  };
  const sx = clamp9(wantX), sy = clamp9(wantY);
  if (walkable(sx, sy) && hasExit(sx, sy)) return { x: sx, y: sy };
  let fallback = walkable(sx, sy) ? { x: sx, y: sy } : null;
  const seen = new Set([sy * 9 + sx]);
  const queue = [[sx, sy]];
  while (queue.length) {
    const [cx, cy] = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [-1, 0]]) {
      const nx = cx + dx, ny = cy + dy, k = ny * 9 + nx;
      if (nx < 0 || ny < 0 || nx > 8 || ny > 8 || seen.has(k)) continue;
      seen.add(k);
      if (walkable(nx, ny)) {
        if (hasExit(nx, ny)) return { x: nx, y: ny };
        if (!fallback) fallback = { x: nx, y: ny };
      }
      queue.push([nx, ny]);
    }
  }
  if (fallback) return fallback;
  return { x: 4, y: 4 };
}
// PURE: entry-window counts for one tile object at one micro cell,
// using the sweep's own test (game.js doAction 'forage'): forageable
// cell, not scorched (scorchedFn(cx,cy) — the driver passes a
// current-tile-relative reader, valid because the scholar stands on
// the tile at sweep time), not in detailRegrow. harvest = cells the
// sweep would actually take: a species cell, or a tree/bigtree with
// no species (deadfall). speciesFn(tile,cx,cy,cell) -> pid|null.
function entryWindowCount(tile, mx, my, scorchedFn, speciesFn) {
  if (!tile || !Array.isArray(tile.detail) || mx == null || my == null) return null;
  const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
  let cells = 0, harvest = 0, regrow = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = mx + dx, cy = my + dy;
    if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
    const c = tile.detail[cy] && tile.detail[cy][cx];
    if (!FORAGEABLE[c]) continue;
    if (tile.detailRegrow && tile.detailRegrow[cx + ',' + cy]) { regrow++; continue; }
    try { if (scorchedFn && scorchedFn(cx, cy)) continue; } catch (e) {}
    cells++;
    let pid = null;
    try { pid = speciesFn ? speciesFn(tile, cx, cy, c) : null; } catch (e) { pid = null; }
    if (pid || c === 'tree' || c === 'bigtree') harvest++;
  }
  return { cells, harvest, regrow };
}
function havenOf(Game) {
  try { const v = (Game.state || {}).village || {}; return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; }
}
function pantryKcal(Game) {
  try {
    let kcal = 0;
    for (const it of ((Game.state || {}).village || {}).pantry || []) kcal += (it.kcalEach || 0) * (it.units || 1);
    return Math.round(kcal);
  } catch (e) { return null; }
}
function packKgCap(Game) {
  return { kg: numOrNull(() => Game.packWeight()), cap: numOrNull(() => Game.packCapacity()) };
}
function knownPlants(Game) {
  try { return Object.keys((Game.state.codex || {}).plants || {}).length; } catch (e) { return null; }
}
function plantKnown(Game, pid) {
  try { if (typeof Game.plantKnown === 'function') return !!Game.plantKnown(pid); } catch (e) {}
  try { return !!((Game.state.codex || {}).plants || {})[pid]; } catch (e) { return null; }
}
function stockedCandidates(Game) {
  try {
    const out = [];
    for (const tt of (Game.travelTargets() || [])) {
      const t = Game.tileAt(tt.x, tt.y);
      if (!t || t.type === 'haven' || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
      let availableCells = null, regrowingCells = null;
      try {
        if (Array.isArray(t.detail)) {
          const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
          let n = 0, r = 0;
          for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 9; cx++) {
            const c = t.detail[cy] && t.detail[cy][cx];
            if (!FORAGEABLE[c]) continue;
            if (t.detailRegrow && t.detailRegrow[cx + ',' + cy]) { r++; continue; }
            n++;
          }
          availableCells = n; regrowingCells = r;
        }
      } catch (e) { availableCells = null; regrowingCells = null; }
      // groundReadLevel: the game's own observed-depletion record for
      // this tile (readGround on every sweep; null when never read).
      // Diagnostic predictor for the census, never a rule input.
      let groundReadLevel = null;
      try { groundReadLevel = t.groundReadLevel || null; } catch (e) {}
      out.push({ x: tt.x, y: tt.y, d: tt.d, type: t.type, revealed: !!t.revealed, stock: t.stock, availableCells, regrowingCells, groundReadLevel });
    }
    return out;
  } catch (e) { return null; }
}
function invSig(Game) {
  try {
    return ((Game.state || {}).scholar || {}).inventory.map((it) => ({
      key: (it.plantId || it.name || it.material || 'item'),
      plantId: it.plantId || null, name: it.name || null, units: it.units || 0,
      kcalEach: it.kcalEach || 0, hiddenKcal: (it.hiddenKcal == null ? null : it.hiddenKcal),
      foodKind: it.foodKind || null, foodState: it.foodState || null,
      kg: it.kg || 0, lumpKeys: (it.lump && typeof it.lump === 'object') ? Object.keys(it.lump) : null,
    }));
  } catch (e) { return null; }
}
function invDelta(before, after) {
  if (!before || !after) return null;
  const bmap = new Map();
  for (const r of before) bmap.set(r.key + '|' + (r.foodState || '') + '|' + (r.kcalEach || 0), r);
  const added = [];
  for (const r of after) {
    const k = r.key + '|' + (r.foodState || '') + '|' + (r.kcalEach || 0);
    const b = bmap.get(k);
    const du = r.units - (b ? b.units : 0);
    if (du > 0) added.push({ key: r.key, plantId: r.plantId, name: r.name, units: du,
      kcalEach: r.kcalEach, hiddenKcal: r.hiddenKcal, foodKind: r.foodKind, foodState: r.foodState });
  }
  return added;
}
function packRows(Game) {
  try {
    return ((Game.state || {}).scholar || {}).inventory.map((it) => ({
      name: it.name || null, plantId: it.plantId || null, units: it.units || 0,
      kcalEach: it.kcalEach || 0, hiddenKcal: (it.hiddenKcal == null ? null : it.hiddenKcal),
      foodKind: it.foodKind || null, foodState: it.foodState || null,
      edible: (it.edible === undefined ? null : !!it.edible),
      lump: (it.lump && typeof it.lump === 'object')
        ? Object.keys(it.lump).map((pid) => ({ pid, units: ((it.lump[pid] || {}).units || 0) })) : null,
    }));
  } catch (e) { return null; }
}
function snapshot(Game) {
  const pc = packKgCap(Game);
  return { day: ((Game.state || {}).scholar || {}).day || 0, dayTicks: dayTicksOf(Game),
    pos: posOf(Game), haven: havenOf(Game), packKg: pc.kg, packCap: pc.cap, knownPlants: knownPlants(Game),
    pantryKcal: pantryKcal(Game), scholarKcal: numOrNull(() => Math.round((Game.state.scholar || {}).kcal || 0)),
    kcalCap: numOrNull(() => Game.kcalCap()), candidates: stockedCandidates(Game) };
}

function installWrappers(Game, st) {
  let inReturn = false, currentReturn = null, inDonate = false, currentDonate = null;
  const homeVillage = () => { try { return (Game.state || {}).village || null; } catch (e) { return null; } };
  const saySlice = (from) => st.sayLines.slice(from).map((x) => x.line);
  const curDay = () => st.days[st.days.length - 1] || null;

  const origTele = Game.tele;
  if (typeof origTele === 'function') {
    Game.tele = function (type, data) {
      const r = origTele.apply(this, arguments);
      try {
        if (type === 'forage' && data) {
          const ev = { loopDay: st.loopDay, cells: data.cells ?? null,
            plants: data.plants || null, kcal: data.kcal ?? null, tile: data.tile || null };
          st.forageTele.push(ev);
          if (st.currentForage) st.currentForage.tele = ev;
        }
      } catch (e) { console.error('entrywindow tele-tap error', e && e.message); }
      return r;
    };
  }
  const origLump = Game.addUnknownToLump;
  if (typeof origLump === 'function') {
    Game.addUnknownToLump = function (plant, units) {
      const r = origLump.apply(this, arguments);
      try {
        if (st.currentForage) {
          const pid = (plant && (plant.id || plant.plantId)) || null;
          st.currentForage.unknownGains.push({ plantId: pid, units: units || 0 });
        }
      } catch (e) { console.error('entrywindow lump-tap error', e && e.message); }
      return r;
    };
  }
  const origTravel = Game.travelTo;
  if (typeof origTravel === 'function') {
    Game.travelTo = function (x, y) {
      const d = curDay();
      const before = { pos: posOf(Game), ticks: dayTicksOf(Game) };
      // Menu-time entry prediction, BEFORE the move: replicate
      // travelTo's formula on the destination's EXISTING detail
      // only. Haven destinations are excluded (haven detail is a
      // view alias that travelTo may switch; not a forage tile).
      let predicted = null, detailPresent = false, destType = null;
      try {
        const dt = Game.tileAt(x, y);
        destType = dt ? dt.type : null;
        detailPresent = !!(dt && Array.isArray(dt.detail));
        if (destType !== 'haven' && detailPresent) {
          predicted = predictEntry(before.pos.x, before.pos.y, before.pos.mx, before.pos.my,
            x, y, dt.detail, (cell) => Game.cellProps(cell));
        }
      } catch (e) { predicted = null; }
      let res = null;
      try { res = origTravel.apply(this, arguments); } finally {
        try {
          const after = { pos: posOf(Game), ticks: dayTicksOf(Game) };
          const moved = after.pos.x === x && after.pos.y === y;
          const ev = { loopDay: st.loopDay, from: before.pos, to: { x, y },
            moved, ticksDelta: (before.ticks == null || after.ticks == null) ? null : after.ticks - before.ticks,
            blocked: (res && (res.blockType || res.blocked)) ? (res.blockType || 'blocked') : null,
            predictedEntry: predicted, actualEntry: moved ? { x: after.pos.mx, y: after.pos.my } : null,
            entryMatch: (moved && predicted && after.pos.mx != null)
              ? (predicted.x === after.pos.mx && predicted.y === after.pos.my) : null,
            detailPresentBefore: detailPresent, destType };
          if (d) d.travels.push(ev);
          if (d && moved && !d.tripEnd) {
            const hv = havenOf(Game);
            if (after.pos.x === hv.x && after.pos.y === hv.y && (d.forages || []).some((f) => f.ok)) {
              const pc = packKgCap(Game);
              d.tripEnd = { dayTicks: after.ticks, ticksRemaining: (after.ticks == null ? null : 512 - after.ticks),
                packKg: pc.kg, packCap: pc.cap, candidatesRemaining: stockedCandidates(Game) };
            }
          }
        } catch (e) { console.error('entrywindow travel-tap error', e && e.message); }
      }
      return res;
    };
  }
  const origAction = Game.doAction;
  if (typeof origAction === 'function') {
    Game.doAction = function (kind, opts) {
      if (kind !== 'forage') return origAction.apply(this, arguments);
      const d = curDay();
      const sayFrom = st.sayLines.length;
      const before = { pos: posOf(Game), ticks: dayTicksOf(Game), inv: invSig(Game) };
      const pc0 = packKgCap(Game);
      let tileType = null;
      try { const t = Game.tileAt(before.pos.x, before.pos.y); tileType = t ? t.type : null; } catch (e) {}
      // Pre-sweep fertility signal for the tile being worked: the same
      // detail-cell count (whole-tile, fertrot comparison) plus the game's
      // ground-read level and stock as diagnostic predictors. Computed
      // BEFORE the sweep consumes cells.
      let preAvail = null, preRegrow = null, preGround = null, preStock = null;
      try {
        const t0 = Game.tileAt(before.pos.x, before.pos.y);
        if (t0) {
          preStock = t0.stock ?? null; preGround = t0.groundReadLevel || null;
          if (Array.isArray(t0.detail)) {
            const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
            let n = 0, r = 0;
            for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 9; cx++) {
              const c = t0.detail[cy] && t0.detail[cy][cx];
              if (!FORAGEABLE[c]) continue;
              if (t0.detailRegrow && t0.detailRegrow[cx + ',' + cy]) { r++; continue; }
              n++;
            }
            preAvail = n; preRegrow = r;
          }
        }
      } catch (e) {}
      // Entry-window census: the scholar's micro cell at sweep time
      // IS the travelTo entry cell (doAction 'forage' with {} moves
      // nothing); count the 3x3 around it with the sweep's own test.
      // cellScorched is current-tile-relative and the scholar stands
      // on this tile now, so it reads correctly here (unlike at
      // menu time, where the scholar stands on the origin tile).
      let entryCell = null, entryWindow = null;
      try {
        const sch = (Game.state || {}).scholar || {};
        entryCell = { x: sch.mx ?? null, y: sch.my ?? null };
        const tw = Game.tileAt(before.pos.x, before.pos.y);
        entryWindow = entryWindowCount(tw, sch.mx, sch.my,
          (cx, cy) => { try { return Game.cellScorched(cx, cy); } catch (e) { return false; } },
          (t, cx, cy, c) => { try { return Game.cellPlantSpecies(t, cx, cy, c); } catch (e) { return null; } });
      } catch (e) {}
      const attemptOrdinal = d ? ((d.forages || []).length + 1) : null;
      const lastTravel = d ? (d.travels || [])[(d.travels || []).length - 1] || null : null;
      const ev = { loopDay: st.loopDay, pos: before.pos, tileType, ticksBefore: before.ticks,
        packKgBefore: pc0.kg, packCapBefore: pc0.cap, unknownGains: [], tele: null,
        preAvail, preRegrow, preGround, preStock,
        entryCell, entryWindow, attemptOrdinal,
        travelPredictedEntry: lastTravel ? lastTravel.predictedEntry : null,
        travelActualEntry: lastTravel ? lastTravel.actualEntry : null,
        travelEntryMatch: lastTravel ? lastTravel.entryMatch : null };
      const prevCurrent = st.currentForage;
      st.currentForage = ev;
      let res = null;
      try { res = origAction.apply(this, arguments); } finally {
        st.currentForage = prevCurrent;
        try {
          const after = { pos: posOf(Game), ticks: dayTicksOf(Game) };
          const pc1 = packKgCap(Game);
          ev.ok = !!res;
          ev.ticksDelta = (before.ticks == null || after.ticks == null) ? null : after.ticks - before.ticks;
          ev.packKgAfter = pc1.kg; ev.packCapAfter = pc1.cap;
          ev.sayDuring = saySlice(sayFrom);
          // Failure reason, read off the sweep's own lines (not inferred
          // from counts): worked-out vs nothing-in-reach vs pack-full.
          try {
            const joined = (ev.sayDuring || []).join(' ');
            ev.failReason = ev.ok ? null
              : /pack is full|Still full/.test(joined) ? 'pack_full'
              : /worked out/.test(joined) ? 'worked_out'
              : /Walk to the green|Nothing within reach|Nothing left to take|Bare pavement/.test(joined) ? 'nothing_in_reach'
              : 'other';
          } catch (e) { ev.failReason = ev.ok ? null : 'other'; }
          ev.added = invDelta(before.inv, invSig(Game));
          for (const row of (ev.added || [])) {
            if (row.plantId) row.known = plantKnown(Game, row.plantId);
          }
          if (d) d.forages.push(ev);
        } catch (e) { console.error('entrywindow forage-tap error', e && e.message); }
      }
      return res;
    };
  }
  const origDeposit = Game.depositPantryPieces;
  if (typeof origDeposit === 'function') {
    Game.depositPantryPieces = function (v, src, pieceKcal) {
      let deposited = 0;
      try { deposited = origDeposit.apply(this, arguments); } finally {
        try {
          if (v === homeVillage() && deposited > 0) {
            const kind = inReturn ? 'unload' : (inDonate ? 'donate' : 'other');
            st.deposits.push({ loopDay: st.loopDay, kind, kcal: Math.round(deposited) });
            if (inReturn && currentReturn) currentReturn.unloadKcal += Math.round(deposited);
            if (inDonate && currentDonate) currentDonate.donateKcal += Math.round(deposited);
          }
        } catch (e) { console.error('entrywindow deposit-log error', e && e.message); }
      }
      return deposited;
    };
  }
  const origReturn = Game.returnToVillage;
  if (typeof origReturn === 'function') {
    Game.returnToVillage = function (...args) {
      const overAtEntry = !!Game.over;
      const sayBefore = st.sayLines.length;
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0,
        overAtEntry, packBefore: packRows(Game), pantryBefore: pantryKcal(Game),
        unloadKcal: 0, packAfter: null, pantryAfter: null,
        gateEngagedAtEntry: numOrNull(() => (Game._depositGateEngaged() ? 1 : 0)),
        gateEngagedAtExit: null, sayBefore, sayAfter: null };
      const prevInReturn = inReturn, prevCurrent = currentReturn;
      inReturn = true; currentReturn = rec;
      try { return origReturn.apply(this, args); } finally {
        inReturn = prevInReturn; currentReturn = prevCurrent;
        rec.packAfter = packRows(Game); rec.pantryAfter = pantryKcal(Game);
        rec.gateEngagedAtExit = numOrNull(() => (Game._depositGateEngaged() ? 1 : 0));
        rec.sayAfter = st.sayLines.length;
        st.homecomings.push(rec);
      }
    };
  }
  const origDonate = Game.donateToPantry;
  if (typeof origDonate === 'function') {
    Game.donateToPantry = function (idx, units) {
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0, donateKcal: 0 };
      const prevInDonate = inDonate, prevCurrent = currentDonate;
      inDonate = true; currentDonate = rec;
      try { return origDonate.apply(this, arguments); } finally {
        inDonate = prevInDonate; currentDonate = prevCurrent;
        st.donates.push(rec);
      }
    };
  }
}

function writeStdout(str) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const attempt = () => {
      tries++;
      try {
        process.stdout.write(str, (err) => {
          if (err) { if (tries < 12) setTimeout(attempt, 1000); else reject(err); }
          else resolve();
        });
      } catch (e) { if (tries < 12) setTimeout(attempt, 1000); else reject(e); }
    };
    attempt();
  });
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'entrywindow-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 60000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('entrywindow say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const st = { loopDay: 0, days: [], homecomings: [], deposits: [], donates: [],
    forageTele: [], sayLines, currentForage: null };
  installWrappers(Game, st);
  let callIdx = 0;
  const baseDaily = POLICY_OBJ.daily.bind(POLICY_OBJ);
  const policy = Object.assign({}, POLICY_OBJ, {
    daily(Game2, ctx) {
      callIdx++;
      st.loopDay = callIdx;
      const dayRec = { loopDay: callIdx, start: snapshot(Game2), travels: [], forages: [], tripEnd: null, end: null };
      st.days.push(dayRec);
      baseDaily(Game2, ctx);
      dayRec.end = snapshot(Game2);
      dayRec.entrywindow = { penalizedMenus: ctx.entrywindowPenalizedMenus || 0,
        emptyTiles: ctx.entrywindowEmptyTiles || 0,
        forageAttempts: ctx.entrywindowForageAttempts || 0,
        visitedTiles: ctx.entrywindowVisitedTiles || 0 };
      // Counters above are cumulative across days in ctx (visitedTiles
      // is a size, not a delta); per-day deltas are computed by the
      // driver wrapper below via the stored previous totals.
      dayRec.successfulForages = dayRec.forages.filter((f) => f.ok).length;
      dayRec.secondTripAttempted = dayRec.successfulForages > 1;
    },
  });
  // Per-day entrywindow deltas: wrap the policy daily once more so the
  // dayRec above carries this day's counters, not the running total.
  // (Baseline competent carries none, so census deltas are zero.)
  const innerDaily = policy.daily;
  let prevMen = 0, prevEmp = 0, prevAtt = 0;
  policy.daily = function (Game2, ctx) {
    innerDaily(Game2, ctx);
    const d = st.days[st.days.length - 1];
    if (d) {
      const mn = ctx.entrywindowPenalizedMenus || 0, em = ctx.entrywindowEmptyTiles || 0,
        at = ctx.entrywindowForageAttempts || 0;
      d.entrywindow = { penalizedMenus: mn - prevMen, emptyTiles: em - prevEmp,
        forageAttempts: at - prevAtt, visitedTiles: ctx.entrywindowVisitedTiles || 0 };
      prevMen = mn; prevEmp = em; prevAtt = at;
    }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: POLICY_ID, days: DAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    days: st.days, homecomings: st.homecomings, deposits: st.deposits, donates: st.donates,
    forageTele: st.forageTele, sayLines,
  };
}

async function main() {
  checkEnv();
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    await writeStdout(JSON.stringify(inst) + '\n');
    const live = inst.homecomings.filter((h) => !h.overAtEntry);
    console.error('entrywindow policy=' + POLICY_ID + ' days=30 seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' loopDays=' + inst.days.length +
      ' liveReturns=' + live.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' entrywindow JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('ENTRYWINDOW TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapshot, stockedCandidates, invDelta, packRows, predictEntry, entryWindowCount };
