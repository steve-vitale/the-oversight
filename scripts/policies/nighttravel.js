// policies/nighttravel.js — competent + inside evenings, PLUS a nightly
// trip home when the day ends away but within reach.
//
// sim-nighttravel-b (prereg: evidence/2026-10-28/
// sim-nighttravel-b-prereg.md, committed BEFORE any judged run).
// POLICY-SIDE ARM ONLY: zero src/js changes. This file EXTENDS
// insideevening's evening step (requires ./insideevening for
// eveningStep/snapPos, and ./competent for setup/upkeep/fight)
// — it does not fork competent.js or insideevening.js, and it
// does not call insideevening.daily (that would run the evening
// step twice: once bare, once after travel).
//
// The blank (sim-insideevening-b, GO): insideevening's only M2
// failures on both bands are tap days spent away (10701, 10714,
// 10720), and it never treks home by design. This policy's daily()
// runs competent.daily, then — as the evening's LAST step, before
// the harness's sleep — if the player ends the day AWAY:
//
//   * blocked-combat / blocked-tent / game-over: no travel, no
//     entry (never mid-fight, never tent entry/exit by travel).
//   * already inside on the haven tile, or outside on the haven
//     tile: delegate to insideevening's eveningStep unchanged
//     (already-inside / walk + 'Go inside', no travel leg).
//   * away: REACH = the haven node (state.village.px/py,
//     engine default 4,4; verified type 'haven' at runtime)
//     appears in Game.travelTargets() — a single honest travelTo
//     hop, no force, no route-around, no blockage clearing, no
//     multi-hop trek, no walking into fog beyond what the engine
//     offers. Not offered: 'out-of-reach', sleep away.
//     Offered: ONE Game.travelTo(hx, hy). If the position did not
//     change: 'travel-refused' (block object / null recorded).
//     If a fight is live after the hop: 'travel-arrived-combat',
//     NO entry attempt (the harness drives the fight on the next
//     loop-day's upkeep, as already-live blocked-combat evenings
//     are handled). If the hop killed the player: 'travel-died'.
//     Otherwise delegate to insideevening's eveningStep for the
//     lodge walk + 'Go inside' leg, and record the travel leg
//     (hop distance, kcal/tick deltas, arrival tile) beside the
//     entry outcome. A travelled-home evening whose entry then
//     fails still leaves the player at haven for the night —
//     recorded, not hidden.
//
// Honest costs, by engine law (docs/TIME-ECONOMY.md): node
// travel is free (travelTo charges no ticks, no kcal); the
// lodge detail walk bills walkStepKcal() per landed square
// plus 1 tick per step (pathStep), exactly as insideevening
// pays it; arrival runs treelineAmbush / checkEncounter, and
// a follower holds at the haven boundary rather than chasing
// onto a safe tile. No kcal floor is imposed beyond the
// engine's own affordability check in beginPathWalk.
//
// The policy does NOT exit in the morning — the next day's
// competent.daily runs from wherever the night left the player,
// and its own trips exit honestly when they travel.
'use strict';
const { competent } = require('./competent');
const { eveningStep, snapPos } = require('./insideevening');

function havenCoords(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
    let type = null;
    try { const t = Game.tileAt(hx, hy); type = t ? (t.type || null) : null; } catch (e) {}
    return { hx, hy, type };
  } catch (e) { return { hx: 4, hy: 4, type: null }; }
}

function fullSnap(Game) {
  const s = snapPos(Game);
  const sch = (Game.state || {}).scholar || {};
  let mapPx = null, mapPy = null;
  try { mapPx = (Game.map ? Game.map.px : null); mapPy = (Game.map ? Game.map.py : null); } catch (e) {}
  return Object.assign({}, s, {
    mapPx, mapPy,
    kcal: Math.round(sch.kcal || 0),
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
  });
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

// EVENING DETOUR (sim-eveningdetour-b, gate COMPETENT_EVENING_DETOUR=1,
// default OFF): on a travel-refused evening, walk the BFS route-around
// path home — orthogonal travelTo steps, each travelBlockage-clean,
// exactly Arm B's routeAround mechanics (competent.js routeAround,
// mirrored here, not imported: competent.js is owned by a sibling
// worker this run and is NOT touched). No clearing, no force, no
// bridge-building, no detour narration (separate named blank). If
// any step refuses or combat starts mid-detour, stop honestly where
// you stand: the caller counts the evening NOT rescued.
function eveningDetourOn() { return process.env.COMPETENT_EVENING_DETOUR === '1'; }
function bfsDetourPath(Game, hx, hy) {
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
    const path = [];
    let cur = [hx, hy];
    while (!(cur[0] === sx && cur[1] === sy)) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
    return path;
  } catch (e) { return null; }
}

// The night step. Returns a record; the driver cross-checks it
// against its own position snapshots (pre-travel, post-step).
function nightStep(Game, ctx) {
  const rec = { outcome: null, method: null };
  try {
    if (Game.over) { rec.outcome = 'game-over'; return rec; }
    // Capture the pre-step position BEFORE the guards: a
    // blocked-combat away evening is still an away evening, and
    // the analyzer must be able to exclude it explicitly rather
    // than lose it to a null preStepTile.
    const before = fullSnap(Game);
    rec.before = before;
    if (combatLive(Game)) { rec.outcome = 'blocked-combat'; return rec; }
    if (before.insideTent === true) { rec.outcome = 'blocked-tent'; return rec; }
    if (before.inside === true && before.tile === 'haven') {
      const ie = eveningStep(Game, ctx);
      rec.outcome = ie.outcome; rec.method = ie.method;
      rec.delegated = ie; rec.travel = null;
      return rec;
    }
    if (before.tile === 'haven') {
      const ie = eveningStep(Game, ctx);
      rec.outcome = ie.outcome; rec.method = ie.method;
      rec.delegated = ie; rec.travel = null;
      return rec;
    }
    // AWAY: reach check.
    const { hx, hy, type } = havenCoords(Game);
    rec.haven = { hx, hy, type };
    if (type !== 'haven') { rec.outcome = 'haven-unknown'; return rec; }
    const dist = Math.abs((before.mapPx ?? -99) - hx) + Math.abs((before.mapPy ?? -99) - hy);
    rec.havenDistance = dist;
    let offered = false, offerErr = null;
    try {
      const targets = Game.travelTargets() || [];
      offered = targets.some((t) => t.x === hx && t.y === hy);
    } catch (e) { offerErr = String(e && e.message).slice(0, 120); }
    rec.travelOffered = offered; rec.travelOfferErr = offerErr;
    if (!offered) { rec.outcome = 'out-of-reach'; return rec; }
    // ONE honest hop, no force. Judge by position change, not by
    // the return value (success falls off the end: undefined).
    const kcalBefore = before.kcal, ticksBefore = before.dayTicks;
    let hopRet = null, hopErr = null;
    try { hopRet = Game.travelTo(hx, hy); } catch (e) { hopErr = String(e && (e.stack || e.message)).slice(0, 200); }
    const afterHop = fullSnap(Game);
    const hopKind = (hopRet === undefined || hopRet === null) ? String(hopRet)
      : (typeof hopRet === 'object' ? ('block:' + (hopRet.blockType || hopRet.kind || '?')) : String(hopRet));
    rec.travel = {
      from: { tile: before.tile, mapPx: before.mapPx, mapPy: before.mapPy },
      to: { hx, hy }, distance: dist,
      hopReturnKind: hopKind, hopError: hopErr,
      kcalBefore, kcalAfterHop: afterHop.kcal,
      kcalDeltaHop: afterHop.kcal - kcalBefore,
      ticksBefore, ticksAfterHop: afterHop.dayTicks,
      arrival: { tile: afterHop.tile, mapPx: afterHop.mapPx, mapPy: afterHop.mapPy, inside: afterHop.inside },
      hops: 1, forced: false,
    };
    if (Game.over) { rec.outcome = 'travel-died'; return rec; }
    if (afterHop.mapPx !== hx || afterHop.mapPy !== hy) {
      // Hop refused. Gate OFF: the verdict behavior, unchanged.
      if (!eveningDetourOn()) { rec.outcome = 'travel-refused'; return rec; }
      // Gate ON: walk the BFS route-around path home, step by step.
      const detour = { attempted: true, path: null, steps: [], stoppedReason: null };
      rec.detour = detour; rec.detourAttempted = true;
      const kcalBeforeDetour = afterHop.kcal, ticksBeforeDetour = afterHop.dayTicks;
      detour.kcalBeforeDetour = kcalBeforeDetour; detour.ticksBeforeDetour = ticksBeforeDetour;
      const path = bfsDetourPath(Game, hx, hy);
      detour.path = path;
      if (!path) { rec.outcome = 'detour-nopath'; detour.stoppedReason = 'no-path'; return rec; }
      let reached = false;
      for (const [tx, ty] of path) {
        if (Game.over) { rec.outcome = 'detour-died'; detour.stoppedReason = 'died'; break; }
        if (combatLive(Game)) { rec.outcome = 'detour-stopped'; detour.stoppedReason = 'combat'; break; }
        const fx = Game.map.px, fy = Game.map.py;
        let stepErr = null;
        try { Game.travelTo(tx, ty); } catch (e) { stepErr = String(e && e.message).slice(0, 120); }
        const afterStep = fullSnap(Game);
        const moved = afterStep.mapPx === tx && afterStep.mapPy === ty;
        const stepCombat = combatLive(Game);
        detour.steps.push({
          from: { mapPx: fx, mapPy: fy }, to: { mapPx: tx, mapPy: ty },
          moved, combatLive: stepCombat, stepError: stepErr,
        });
        if (Game.over) { rec.outcome = 'detour-died'; detour.stoppedReason = 'died'; break; }
        if (!moved) { rec.outcome = 'detour-stopped'; detour.stoppedReason = 'step-refused'; break; }
        if (stepCombat) { rec.outcome = 'detour-stopped'; detour.stoppedReason = 'combat'; break; }
        if (tx === hx && ty === hy) reached = true;
      }
      detour.stepsWalked = detour.steps.filter((s) => s.moved).length;
      detour.kcalAfterDetour = fullSnap(Game).kcal;
      if (!reached) {
        if (!rec.outcome || rec.outcome === 'travel-refused') { rec.outcome = 'detour-stopped'; detour.stoppedReason = detour.stoppedReason || 'not-reached'; }
        return rec;
      }
      // Reached haven, outside, not in combat: the insideevening leg.
      const ie2 = eveningStep(Game, ctx);
      rec.outcome = ie2.outcome; rec.method = ie2.method;
      rec.delegated = ie2;
      rec.travelledHome = true;
      detour.rescued = (ie2.outcome === 'completed' || ie2.outcome === 'already-inside');
      const after2 = fullSnap(Game);
      detour.kcalAfterEntry = after2.kcal;
      detour.ticksAfterEntry = after2.dayTicks;
      return rec;
    }
    if (combatLive(Game)) { rec.outcome = 'travel-arrived-combat'; return rec; }
    // Arrived home, outside, not in combat: the insideevening leg.
    const ie = eveningStep(Game, ctx);
    rec.outcome = ie.outcome; rec.method = ie.method;
    rec.delegated = ie;
    rec.travelledHome = true;
    const after = fullSnap(Game);
    rec.travel.kcalAfterEntry = after.kcal;
    rec.travel.kcalDeltaEntry = after.kcal - afterHop.kcal;
    rec.travel.ticksAfterEntry = after.dayTicks;
    return rec;
  } catch (e) {
    rec.outcome = 'step-error'; rec.error = String(e && e.message).slice(0, 160);
    return rec;
  }
}

const nighttravel = Object.assign({}, competent, {
  id: 'nighttravel',
  desc: 'competent + inside evenings + nightly trip home when away but within one travel hop',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    if (Game.over) { ctx._ntLast = { outcome: 'game-over', method: null }; return; }
    const rec = nightStep(Game, ctx);
    ctx._ntLast = rec;
    ctx.ntEvenings = ctx.ntEvenings || {};
    ctx.ntEvenings[rec.outcome] = (ctx.ntEvenings[rec.outcome] || 0) + 1;
    if (rec.outcome === 'completed' || rec.outcome === 'already-inside') {
      ctx.ntInsideEvenings = (ctx.ntInsideEvenings || 0) + 1;
    }
    if (rec.before && rec.before.tile !== 'haven' && (rec.outcome === 'completed' || rec.outcome === 'already-inside')) {
      ctx.ntConvertedAway = (ctx.ntConvertedAway || 0) + 1;
    }
  },
});

module.exports = { nighttravel, nightStep, havenCoords, fullSnap };
