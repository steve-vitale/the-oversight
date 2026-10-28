// policies/insideevening.js — competent, plus evenings that end INSIDE.
//
// sim-insideevening-b (prereg: evidence/2026-10-28/
// sim-insideevening-b-prereg.md, committed BEFORE any judged run).
// POLICY-SIDE ARM ONLY: zero src/js changes. This file EXTENDS
// competent (requires ./competent, delegates setup/upkeep/fight
// unchanged) — it does not fork competent.js.
//
// The blank: competent.daily exits the hall every day, so no
// evening ever starts inside (thiefhall: 40/40 tap days access
// 'none'; thiefinside: only a MANUAL walk + 'Go inside' evening
// opened the gate, 36/36). This policy's daily() runs
// competent.daily, then — as the evening's LAST step, before
// the harness's sleep — steps inside the hall whenever the
// player ends the day on the haven tile: walk to a
// lodge-adjacent cell via the browser "Walk here" verbs
// (beginPathWalk + pathStep, the thiefinside walk), read
// Game.cellActions at an adjacent lodge cell, and ONLY if
// the list contains 'Go inside' at Chebyshev adjacency <= 1,
// dispatch that label exactly as app.js doContextAction does
// (Game.enterBuilding(); refresh is DOM-only and skipped).
// A bare enterBuilding() with no adjacency + cellActions
// checks NEVER happens here.
//
// Honesty bounds (prereg): away evenings (not on the haven
// tile) get NO trek home; in-combat / pending-encounter /
// tent evenings get no entry attempt; a refused step is
// recorded, never teleported past. The policy does NOT exit
// in the morning — the next day's competent.daily runs from
// wherever the night left the player, and its own trips exit
// honestly when they travel.
'use strict';
const { competent } = require('./competent');

// Lodge footprint on the haven detail grid, as thiefinside
// traced it: rows 3-4, cols 3-5. The enterBuilding landing
// is (4,7) inside, on the haven tile.
const LODGE_CELLS = [];
for (let y = 3; y <= 4; y++) for (let x = 3; x <= 5; x++) LODGE_CELLS.push([x, y]);
function isLodge(x, y) { return LODGE_CELLS.some(([qx, qy]) => qx === x && qy === y); }
function adjacentLodgeCell(x, y) {
  return LODGE_CELLS.find(([lx, ly]) => Math.max(Math.abs(lx - x), Math.abs(ly - y)) <= 1) || null;
}
function lodgeAdjacentCells() {
  const map = new Map();
  for (const [lx, ly] of LODGE_CELLS) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (dx === 0 && dy === 0) continue;
    const ax = lx + dx, ay = ly + dy;
    if (ax < 0 || ax > 8 || ay < 0 || ay > 8 || isLodge(ax, ay)) continue;
    const k = ax + ',' + ay;
    if (!map.has(k)) map.set(k, { ax, ay, lx, ly });
  }
  return [...map.values()];
}

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, access,
  };
}

// The evening step. Returns a record; the driver cross-checks it
// against its own position snapshot (proof leg: policy record vs
// driver position must agree on inside/outside).
function eveningStep(Game, ctx) {
  const rec = { outcome: null, method: null };
  try {
    if (Game.over) { rec.outcome = 'game-over'; return rec; }
    // Pending encounter counts as combat-blocked: the engine
    // refuses enterBuilding mid-fight, and walking into a live
    // encounter to reach a door is not an evening — it is a fight.
    if ((Game.inCombat && Game.inCombat()) || Game.pendingEncounter) {
      rec.outcome = 'blocked-combat'; return rec;
    }
    const before = snapPos(Game);
    rec.before = before;
    if (before.insideTent === true) { rec.outcome = 'blocked-tent'; return rec; }
    if (before.inside === true && before.tile === 'haven') {
      rec.outcome = 'already-inside'; rec.method = 'already-inside'; return rec;
    }
    if (before.tile !== 'haven') { rec.outcome = 'not-attempted-away'; return rec; }
    // On the haven tile, outside: walk to a lodge-adjacent cell.
    const sch = Game.state.scholar || {};
    const startMx = sch.mx ?? 4, startMy = sch.my ?? 4;
    let walked = null, walkInterruptedCombat = false, walkBlockedDetail = null;
    if (adjacentLodgeCell(startMx, startMy)) {
      walked = { ax: startMx, ay: startMy, steps: 0, alreadyThere: true };
    } else {
      const cands = [];
      for (const c of lodgeAdjacentCells()) {
        let p = null;
        try { p = Game.findPath(startMx, startMy, c.ax, c.ay); } catch (e) {}
        if (p) cands.push({ ...c, pathLen: p.length });
      }
      cands.sort((a, b) => ((a.ax === 4 && a.ay === 5) ? 0 : 1) - ((b.ax === 4 && b.ay === 5) ? 0 : 1) || a.pathLen - b.pathLen);
      rec.walkCandidates = cands.map((c) => ({ ax: c.ax, ay: c.ay, pathLen: c.pathLen }));
      for (const c of cands) {
        const cur = Game.state.scholar || {};
        if ((cur.mx ?? 4) === c.ax && (cur.my ?? 4) === c.ay) { walked = { ...c, steps: 0, alreadyThere: true }; break; }
        let pth = null;
        try { pth = Game.beginPathWalk(c.ax, c.ay); } catch (e) { pth = null; }
        if (!pth) continue;
        let steps = 0, blocked = false;
        for (const [sx, sy] of pth) {
          let stepped = false;
          try { stepped = Game.pathStep(sx, sy); } catch (e) { stepped = false; }
          if (!stepped) { blocked = true; break; }
          steps++;
          if (Game.inCombat && Game.inCombat()) { walkInterruptedCombat = true; break; }
        }
        if (walkInterruptedCombat) { walked = { ...c, steps, interruptedCombat: true }; break; }
        const cur2 = Game.state.scholar || {};
        if (adjacentLodgeCell(cur2.mx ?? 4, cur2.my ?? 4)) { walked = { ...c, steps, partial: blocked }; break; }
        if (blocked) walkBlockedDetail = 'step false at candidate ' + c.ax + ',' + c.ay + ' after ' + steps + ' steps';
      }
    }
    rec.walkBlockedDetail = walkBlockedDetail;
    if (walkInterruptedCombat) { rec.outcome = 'walk-interrupted-combat'; return rec; }
    if (!walked) { rec.outcome = 'walk-no-path'; return rec; }
    rec.walkTarget = { ax: walked.ax, ay: walked.ay, steps: walked.steps, partial: !!walked.partial, alreadyThere: !!walked.alreadyThere };
    const cur3 = Game.state.scholar || {};
    const pmx = cur3.mx ?? 4, pmy = cur3.my ?? 4;
    let lodgePick = adjacentLodgeCell(pmx, pmy);
    if (Math.max(Math.abs(walked.lx - pmx), Math.abs(walked.ly - pmy)) <= 1) lodgePick = [walked.lx, walked.ly];
    if (!lodgePick) { rec.outcome = 'walk-no-path'; return rec; }
    rec.entryLodgeCell = { x: lodgePick[0], y: lodgePick[1] };
    rec.entryAdjacency = Math.max(Math.abs(lodgePick[0] - pmx), Math.abs(lodgePick[1] - pmy));
    let cellList = null, cellErr = null;
    try { cellList = Game.cellActions(lodgePick[0], lodgePick[1]); } catch (e) { cellErr = String(e && e.message).slice(0, 120); }
    rec.entryCellActions = cellList; rec.entryCellErr = cellErr;
    if (!Array.isArray(cellList) || cellList.indexOf('Go inside') < 0 || rec.entryAdjacency > 1) {
      rec.outcome = 'no-go-inside-button'; return rec;
    }
    // Dispatch 'Go inside' exactly as app.js doContextAction does.
    let entryRet = null, entryErr = null;
    try { entryRet = Game.enterBuilding(); } catch (e) { entryErr = String(e && (e.stack || e.message)); }
    rec.entryReturn = (entryRet === undefined ? null : entryRet); rec.entryError = entryErr;
    const after = snapPos(Game);
    rec.after = after;
    if (entryRet !== true || after.inside !== true || after.tile !== 'haven') {
      rec.outcome = 'entry-refused'; return rec;
    }
    rec.outcome = 'completed'; rec.method = 'walk+go-inside';
    return rec;
  } catch (e) {
    rec.outcome = 'step-error'; rec.error = String(e && e.message).slice(0, 160);
    return rec;
  }
}

const insideevening = Object.assign({}, competent, {
  id: 'insideevening',
  desc: 'competent, plus evenings that end inside the hall when the day ends at haven',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    if (Game.over) { ctx._ieLast = { outcome: 'game-over', method: null }; return; }
    const rec = eveningStep(Game, ctx);
    ctx._ieLast = rec;
    ctx.ieEvenings = ctx.ieEvenings || {};
    ctx.ieEvenings[rec.outcome] = (ctx.ieEvenings[rec.outcome] || 0) + 1;
    if (rec.outcome === 'completed' || rec.outcome === 'already-inside') {
      ctx.ieInsideEvenings = (ctx.ieInsideEvenings || 0) + 1;
    }
  },
});

module.exports = { insideevening, eveningStep, snapPos };
