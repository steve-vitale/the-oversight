// policies/clearhabit.js — HOMEWARD CLEARING HABIT (sim-clearhabit-b).
// POLICY-SIDE ARM ONLY: zero src/js changes. Default OFF, gate
// COMPETENT_HOMEWARD_CLEAR=1. Called once per loop-day from
// nighttravel.daily, after competent.daily, before nightStep.
//
// The habit (blockedpath diag §5, sketched not built; §4's 10752
// finding: clearRubbleForStone clears the NEAREST rubble with no
// homeward preference): when the day ends away and the homeward
// hop is blocked, clear THAT tile — the first blockage on the
// hop path — instead of the nearest rubble, provided the kcal
// floor holds. Creek blockages are never cleared by hand
// (engine law: bridge or swim only).
//
// Perception law (Steve 2026-10-28): home is the villager's OWN
// haven (lived-in knowledge); every step is an engine travelTo
// hop; clearing is the engine's own clearBlockage (the blockage
// card's action). No roster, list, snapshot, teleport, or force.
'use strict';
const { walkTo } = require('./competent');

function homewardClearOn() { return process.env.COMPETENT_HOMEWARD_CLEAR === '1'; }

// Cost table, mirroring Game.clearBlockage exactly: rubble 40,
// fallen_tree 60, washed_out 80 scramble — or 60 + 4 wood when
// wood >= 4 (the engine builds a bridge instead of scrambling).
function clearCost(Game, type) {
  if (type === 'rubble') return { kcal: 40, remedy: 'rubble' };
  if (type === 'fallen_tree') return { kcal: 60, remedy: 'tree' };
  if (type === 'washed_out') {
    let wood = 0;
    try { wood = Game.woodCount(); } catch (e) {}
    if (wood >= 4) return { kcal: 60, remedy: 'bridge', wood: 4 };
    return { kcal: 80, remedy: 'scramble' };
  }
  return null; // creek and anything else: not hand-clearable
}

// Probe the homeward hop's refusal WITHOUT moving, mirroring
// Game.travelTo's refusal order exactly: destination first, then
// the engine's bounding-box shortest-path intermediate scan.
// Returns null (hop unblocked) or { x, y, blockType }.
function homewardBlockage(Game, hx, hy) {
  try {
    const dest = Game.travelBlockage(hx, hy);
    if (dest) return { x: hx, y: hy, blockType: dest.blockType };
    const px0 = Game.map.px, py0 = Game.map.py;
    const dTot = Math.abs(hx - px0) + Math.abs(hy - py0);
    if (dTot <= 1) return null;
    const bx0 = Math.min(px0, hx) - 1, bx1 = Math.max(px0, hx) + 1;
    const by0 = Math.min(py0, hy) - 1, by1 = Math.max(py0, hy) + 1;
    for (let ty = by0; ty <= by1; ty++) for (let tx = bx0; tx <= bx1; tx++) {
      if ((tx === px0 && ty === py0) || (tx === hx && ty === hy)) continue;
      const dS = Math.abs(tx - px0) + Math.abs(ty - py0);
      const dT = Math.abs(hx - tx) + Math.abs(hy - ty);
      if (dS === 0 || dS + dT !== dTot) continue;
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ex = tx + ox, ey = ty + oy;
        if (ex < bx0 || ex > bx1 || ey < by0 || ey > by1) continue;
        const dE = Math.abs(ex - px0) + Math.abs(ey - py0);
        if (dE !== dS - 1 || dE + 1 + dT !== dTot) continue;
        let ib = null;
        try { ib = Game.travelBlockage(tx, ty, ex, ey); } catch (e) { ib = null; }
        if (ib) return { x: tx, y: ty, blockType: ib.blockType };
      }
    }
    return null;
  } catch (e) { return null; }
}

// One habit attempt. Always returns a record (never throws into
// daily()); ctx._chLast carries it for the trace driver.
function homewardClear(Game, ctx) {
  const rec = { attempted: false, status: 'skipped', gate: homewardClearOn() };
  try {
    if (!rec.gate) { rec.status = 'gate-off'; if (ctx) ctx._chLast = rec; return rec; }
    if (Game.over) { rec.status = 'game-over'; if (ctx) ctx._chLast = rec; return rec; }
    let inCombat = false;
    try { inCombat = !!(Game.inCombat && Game.inCombat()); } catch (e) {}
    if (inCombat) { rec.status = 'in-combat'; if (ctx) ctx._chLast = rec; return rec; }
    const sch = (Game.state || {}).scholar || {};
    if (sch.insideTent) { rec.status = 'in-tent'; if (ctx) ctx._chLast = rec; return rec; }
    if (sch.insideHaven) { rec.status = 'inside'; if (ctx) ctx._chLast = rec; return rec; }
    const v = (Game.state || {}).village || {};
    const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
    let htype = null;
    try { const t = Game.tileAt(hx, hy); htype = t ? (t.type || null) : null; } catch (e) {}
    if (htype !== 'haven') { rec.status = 'haven-unknown'; if (ctx) ctx._chLast = rec; return rec; }
    const px = Game.map.px, py = Game.map.py;
    if (px === hx && py === hy) { rec.status = 'at-haven'; if (ctx) ctx._chLast = rec; return rec; }
    let offered = false;
    try { offered = (Game.travelTargets() || []).some((t) => t.x === hx && t.y === hy); } catch (e) {}
    if (!offered) { rec.status = 'out-of-reach'; if (ctx) ctx._chLast = rec; return rec; }
    rec.haven = { hx, hy };
    rec.from = { mapPx: px, mapPy: py };
    const block = homewardBlockage(Game, hx, hy);
    if (!block) { rec.status = 'unblocked'; if (ctx) ctx._chLast = rec; return rec; }
    rec.block = block;
    rec.attempted = true;
    rec.opportunity = true;
    // Creek: never cleared by hand. Counts as an opportunity the
    // habit cannot take — denominator, never numerator.
    if (block.blockType === 'creek') { rec.status = 'unclearable-creek'; if (ctx) ctx._chLast = rec; return rec; }
    const cost = clearCost(Game, block.blockType);
    if (!cost) { rec.status = 'unclearable-other'; if (ctx) ctx._chLast = rec; return rec; }
    rec.cost = cost;
    // Guarded side: the approach origin the blockage guards.
    let bf = null;
    try { const t = Game.tileAt(block.x, block.y); bf = t && t.blockFrom; } catch (e) {}
    if (!bf) { rec.status = 'no-blockfrom'; if (ctx) ctx._chLast = rec; return rec; }
    const gx = block.x + (bf.dx || 0), gy = block.y + (bf.dy || 0);
    rec.guardedSide = { x: gx, y: gy };
    const kcalBefore = Math.round(sch.kcal || 0);
    let woodBefore = 0;
    try { woodBefore = Game.woodCount(); } catch (e) {}
    rec.kcalBefore = kcalBefore; rec.woodBefore = woodBefore;
    rec.ticksBefore = (sch.dayTicks === undefined ? null : sch.dayTicks);
    // KCAL FLOOR: never clear below 200 kcal after clearing.
    if (kcalBefore - cost.kcal < 200) {
      rec.status = 'unaffordable';
      if (ctx) ctx._chLast = rec;
      return rec;
    }
    // Walk to the guarded side (travelTo hops only, via walkTo).
    try { walkTo(Game, gx, gy); } catch (e) {}
    rec.walkTo = { mapPx: Game.map.px, mapPy: Game.map.py };
    if (Game.map.px !== gx || Game.map.py !== gy) {
      rec.status = 'walk-failed';
      if (ctx) ctx._chLast = rec;
      return rec;
    }
    if (Game.over) { rec.status = 'died-walking'; if (ctx) ctx._chLast = rec; return rec; }
    try { if (Game.inCombat && Game.inCombat()) { rec.status = 'combat-walking'; if (ctx) ctx._chLast = rec; return rec; } } catch (e) {}
    // The clear itself (engine action). Position must not change here.
    const posBeforeClear = { mapPx: Game.map.px, mapPy: Game.map.py };
    let clearRet = null;
    try { clearRet = Game.clearBlockage(block.x, block.y); } catch (e) { clearRet = null; rec.clearError = String(e && e.message).slice(0, 120); }
    rec.posBeforeClear = posBeforeClear;
    rec.posAfterClear = { mapPx: Game.map.px, mapPy: Game.map.py };
    const sch2 = (Game.state || {}).scholar || {};
    rec.kcalAfter = Math.round(sch2.kcal || 0);
    try { rec.woodAfter = Game.woodCount(); } catch (e) { rec.woodAfter = null; }
    rec.ticksAfter = (sch2.dayTicks === undefined ? null : sch2.dayTicks);
    rec.clearReturned = (clearRet === undefined ? null : (clearRet === false ? false : true));
    let cleared = false, bridged = false;
    try {
      const t = Game.tileAt(block.x, block.y);
      cleared = !!(t && !t.blockFrom);
      bridged = !!(t && t.bridged);
    } catch (e) {}
    rec.blockFromGone = cleared; rec.bridged = bridged;
    if (rec.posAfterClear.mapPx !== posBeforeClear.mapPx || rec.posAfterClear.mapPy !== posBeforeClear.mapPy) {
      rec.status = 'moved-during-clear';
    } else if (!cleared && !bridged) {
      rec.status = 'clear-failed';
    } else {
      rec.status = 'cleared';
      rec.remedy = cost.remedy;
    }
    if (ctx) ctx._chLast = rec;
    return rec;
  } catch (e) {
    rec.status = 'habit-error'; rec.error = String(e && e.message).slice(0, 160);
    try { if (ctx) ctx._chLast = rec; } catch (e2) {}
    return rec;
  }
}

module.exports = { homewardClearOn, homewardClear, homewardBlockage, clearCost };
