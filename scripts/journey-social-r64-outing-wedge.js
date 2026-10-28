// journey-social-r64-outing-wedge.js -- WILD OUTING WEDGE (lane B, social r64).
// Plays the tackle-outing joint-foraging outing through the PUBLIC favour
// path only (forageFavorAction status reads + convoPerformFavor /
// performForageTalk), driven by the r64 journey driver's upkeep (dawn
// starts) and daily (outing days). Shared by the driver and by the proof
// test (scripts/test-journey-social-r64-outing-wedge.js) so the wedge
// logic is proven once, not twice.
//
// Rules the wedge obeys (declared in evidence/2026-10-28/r64/prereg.md):
// - Every performance is gated by a forageFavorAction status read
//   (ready + expected action); a blocked status is recorded, never forced.
// - No driver-side Math.random for any decision: target choice is first
//   match in travelTargets order; hops minimize distance to home. Any RNG
//   consumed is the game's own (travel placement, forage sweep).
// - Never travels mid-combat; never touches a second outing in one day
//   (daily) or a second dawn start pass in one day (upkeep).
// - Never throws: every step is try/catch-wrapped and recorded.
'use strict';

function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function haulKcal(xs) { return (xs || []).reduce((n, i) => n + (Number(i.kcalEach) || 0) * (Number(i.units) || 0), 0); }
function homePoint(Game) {
  const v = Game.state.village || {};
  if (Number.isFinite(v.px) && Number.isFinite(v.py)) return { x: v.px, y: v.py };
  try {
    for (let y = 0; y < Game.map.tiles.length; y++) for (let x = 0; x < Game.map.tiles[y].length; x++)
      if (Game.map.tiles[y][x].type === 'haven') return { x, y };
  } catch (e) {}
  return { x: 4, y: 4 };
}
function curDay(Game) { return safe(() => (Game.state.scholar || {}).day || 0, 0); }
function inCombat(Game) { try { return !!(Game.inCombat && Game.inCombat()); } catch (e) { return false; } }
function isOver(Game) { try { return !!Game.over || !!((Game.state.scholar || {}).dead); } catch (e) { return false; } }

function favorForageFavors(Game) {
  const v = Game.state.village || {};
  return Object.values(v.favorLedger || {}).filter(f => f && f.kind === 'forage_help');
}
function promiseOf(Game, vid) { try { return (Game.state.village.promises || {})[vid] || null; } catch (e) { return null; } }
function dueOf(Game, f) {
  const p = promiseOf(Game, f.vid);
  try { const d = Game.promiseDueDay ? Game.promiseDueDay(p) : null; if (d !== null && d !== undefined) return d; } catch (e) {}
  return (f && f.deadline !== undefined && f.deadline !== null) ? f.deadline : 99999;
}
function statusOf(Game, vid, f) {
  try { return Game.forageFavorAction(vid, f) || { ready: false, reason: 'no-status' }; }
  catch (e) { return { ready: false, reason: 'status-error: ' + (e && e.message) }; }
}
function menuIds(Game, vid, f) {
  try { return (Game.convoFavorActionMenu(vid, f, false) || []).map(m => m.id); } catch (e) { return []; }
}

// Hop toward home over unblocked travelTargets (bounded). Returns true
// iff the player ends the hops standing on the home node.
function hopHome(Game, maxHops) {
  const home = homePoint(Game);
  for (let h = 0; h < (maxHops || 8); h++) {
    if (Game.map.px === home.x && Game.map.py === home.y) return true;
    if (inCombat(Game)) return false;
    const targets = safe(() => Game.travelTargets() || [], []);
    let best = null, bestD = Infinity;
    for (const tt of targets) {
      if (tt.x === Game.map.px && tt.y === Game.map.py) continue;
      let blocked = false;
      try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (blocked) continue;
      const d = Math.abs(tt.x - home.x) + Math.abs(tt.y - home.y);
      if (d < bestD) { bestD = d; best = tt; }
    }
    if (!best) return false;
    const bx = Game.map.px, by = Game.map.py;
    try { Game.travelTo(best.x, best.y); } catch (e) { return false; }
    if (Game.map.px === bx && Game.map.py === by) return false; // no progress
  }
  return Game.map.px === home.x && Game.map.py === home.y;
}

// DAWN START WEDGE. Call from upkeep; runs only when dayPart === 0 and
// only once per loop-day. For each promised, unstarted outing: status
// read, one door crossing if door-side-blocked, perform if ready.
function startWedge(Game, log, ctx) {
  const day = curDay(Game);
  if (ctx.outingStartDoneDay === day) return;
  ctx.outingStartDoneDay = day;
  if (isOver(Game)) return;
  if (Game.dayPart !== 0) return;
  for (const f of favorForageFavors(Game)) {
    try {
      const vid = f.vid, p = promiseOf(Game, vid);
      if (f.state !== 'promised' || !p || p.favorId !== f.id || p.kept) continue;
      if (f.forageRun) continue;
      let waiting = false;
      try { waiting = !!Game.forageFavorWaiting(vid); } catch (e) {}
      if (waiting) log.push({ day, step: 'wait', vid, vidName: vname(Game, vid), favorId: f.id });
      let st = statusOf(Game, vid, f);
      if (!st.ready && /door|hall|grounds|same side/i.test(String(st.reason || ''))) {
        try {
          const v = Game.state.village || {}, s = Game.state.scholar || {};
          const partnerInside = (v.npcInside || {})[vid] !== false;
          const playerInside = s.insideHaven !== false;
          if (partnerInside !== playerInside) {
            if (playerInside) Game.exitBuilding(); else Game.enterBuilding();
          }
        } catch (e) {}
        st = statusOf(Game, vid, f);
      }
      if (st.ready && st.action === 'forage_start') {
        let res = null;
        try { res = Game.convoPerformFavor(vid, f); } catch (e) { res = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
        log.push({ day, step: 'start', vid, vidName: vname(Game, vid), favorId: f.id, waiting, menu: menuIds(Game, vid, f), ok: !!(res && res.ok), line: res && res.line });
      } else {
        log.push({ day, step: 'start-blocked', vid, vidName: vname(Game, vid), favorId: f.id, waiting, status: st });
      }
    } catch (e) {
      log.push({ day, step: 'start-error', favorId: f && f.id, error: String(e && e.message) });
    }
  }
}

// BFS micro-walk to a cell (orthogonal + diagonal steps, non-blocking
// cells only, via microMove). Returns true iff the player ends on the
// cell. Bounded by maxSteps; a refused step (combat, blocked) stops the
// walk and returns false. The partner does NOT follow — the caller must
// only walk to cells where the press stays legal (anchor-adjacent).
function walkToCell(Game, tx, ty, maxSteps) {
  const s = Game.state.scholar || {};
  if ((s.mx ?? 4) === tx && (s.my ?? 4) === ty) return true;
  let detail = null;
  try { detail = Game.genDetail(Game.map.px, Game.map.py); } catch (e) { return false; }
  const key = (x, y) => x + ',' + y;
  const prev = {};
  prev[key(s.mx ?? 4, s.my ?? 4)] = null;
  const q = [[s.mx ?? 4, s.my ?? 4]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) break;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8 || key(nx, ny) in prev) continue;
      try { if (Game.cellProps(detail[ny][nx]).blocks) continue; } catch (e) { continue; }
      prev[key(nx, ny)] = [x, y]; q.push([nx, ny]);
    }
  }
  if (!(key(tx, ty) in prev)) return false;
  const path = [];
  let cur = [tx, ty];
  while (cur && !(cur[0] === (s.mx ?? 4) && cur[1] === (s.my ?? 4))) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
  if (path.length > (maxSteps || 20)) return false;
  for (const [nx, ny] of path) {
    if (inCombat(Game)) return false;
    let ok = false;
    try { ok = Game.microMove(nx, ny); } catch (e) { return false; }
    if (!ok) return false;
  }
  return (Game.state.scholar.mx ?? 4) === tx && (Game.state.scholar.my ?? 4) === ty;
}

// OUTING-DAY WEDGE. Call from daily BEFORE base.daily; advances at most
// one live outing per loop-day (earliest deadline first). Forage leg +
// trail talk + return + deliver, each step status-gated and recorded.
function dayWedge(Game, log, ctx) {
  const day = curDay(Game);
  if (ctx.outingDayDoneDay === day) return;
  if (isOver(Game) || inCombat(Game)) return;
  const live = favorForageFavors(Game).filter(f => {
    try {
      return f.forageRun && !f.forageRun.returned && f.forageRun.bearer === Game.villagerId;
    } catch (e) { return false; }
  });
  if (!live.length) return;
  live.sort((a, b) => dueOf(Game, a) - dueOf(Game, b));
  const f = live[0], vid = f.vid;
  ctx.outingDayDoneDay = day;
  const home = homePoint(Game);
  try {
    const haul = haulKcal(f.forageRun.playerHaul) + haulKcal(f.forageRun.partnerHaul);
    const atHome = Game.map.px === home.x && Game.map.py === home.y;
    if (atHome && haul > 0) {
      const st = statusOf(Game, vid, f);
      if (st.ready && st.action === 'forage_deliver') {
        let res = null;
        try { res = Game.convoPerformFavor(vid, f); } catch (e) { res = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
        log.push({ day, step: 'deliver', vid, vidName: vname(Game, vid), favorId: f.id, haulBefore: haul, ok: !!(res && res.ok), line: res && res.line, deliveredKcal: f.forageRun.deliveredKcal, promiseKept: !!(promiseOf(Game, vid) || {}).kept, favorState: f.state });
      } else {
        log.push({ day, step: 'deliver-blocked', vid, vidName: vname(Game, vid), favorId: f.id, haulBefore: haul, status: st });
      }
      return;
    }
    // Forage leg: get home first if away, then one green hop out.
    if (!atHome) {
      const gotHome = hopHome(Game, 8);
      if (!gotHome) { log.push({ day, step: 'forage-no-home', vid, vidName: vname(Game, vid), favorId: f.id, map: { x: Game.map.px, y: Game.map.py } }); return; }
    }
    if (inCombat(Game)) { log.push({ day, step: 'stopped-combat', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
    // FORAGE LEG (r64 wedge, revised after the fixture failure): the press
    // sweeps ONLY the player's cell + 8 around it, and pressing requires
    // the player adjacent to the partner — who does NOT shadow micro-
    // moves (they stay where node travel placed them). So the pressable
    // area on a node is the 3x3 around the partner's placed cell (the
    // anchor). The wedge walks the player to each anchor-adjacent cell
    // in turn and presses; a failed press is free (no haul, no patch
    // marked, no ticks spent — the game says so itself), so trying the
    // anchor area costs only footsteps. If the anchor area is barren,
    // the wedge tries another node (a fresh arrival re-places the
    // partner somewhere new, as in real play). Bounded: 3 nodes/day.
    const F = (globalThis.Scattering || {}).forage;
    const targets = [];
    for (const tt of safe(() => Game.travelTargets() || [], [])) {
      if (tt.x === home.x && tt.y === home.y) continue;
      let blocked = false;
      try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (blocked) continue;
      const tile = safe(() => Game.tileAt(tt.x, tt.y), null);
      if (!tile) continue;
      let can = true;
      try { can = !F || !F.canForage || F.canForage(tile); } catch (e) { can = true; }
      if (can) targets.push(tt);
    }
    if (!targets.length) { log.push({ day, step: 'forage-no-target', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
    let pressed = null;
    for (let ni = 0; ni < targets.length && ni < 3 && !pressed; ni++) {
      const target = targets[ni];
      if (inCombat(Game)) { log.push({ day, step: 'stopped-combat', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
      try { Game.travelTo(target.x, target.y); } catch (e) {}
      if (Game.map.px !== target.x || Game.map.py !== target.y) {
        log.push({ day, step: 'forage-travel-blocked', vid, vidName: vname(Game, vid), favorId: f.id, target, map: { x: Game.map.px, y: Game.map.py } });
        continue;
      }
      const vpos = (Game.state.village.positions || {})[vid] || null;
      if (!vpos) { log.push({ day, step: 'forage-no-anchor', vid, vidName: vname(Game, vid), favorId: f.id, target }); continue; }
      const anchor = { mx: vpos.mx, my: vpos.my };
      // Anchor-adjacent cells (including the partner's own cell — NPCs
      // are not terrain, so the player may step there), non-blocking.
      let detail = null;
      try { detail = Game.genDetail(Game.map.px, Game.map.py); } catch (e) {}
      const cells = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const cx = anchor.mx + dx, cy = anchor.my + dy;
        if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
        try { if (detail && Game.cellProps(detail[cy][cx]).blocks) continue; } catch (e) {}
        cells.push({ mx: cx, my: cy });
      }
      let tried = 0;
      for (const cell of cells) {
        if (inCombat(Game)) { log.push({ day, step: 'stopped-combat', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
        if (!walkToCell(Game, cell.mx, cell.my, 20)) continue;
        tried++;
        const st = statusOf(Game, vid, f);
        if (!st.ready || st.action !== 'forage_together') {
          log.push({ day, step: 'forage-cell-blocked', vid, vidName: vname(Game, vid), favorId: f.id, target, anchor, cell, status: st });
          continue;
        }
        const pBefore = haulKcal(f.forageRun.playerHaul), qBefore = haulKcal(f.forageRun.partnerHaul);
        let res = null;
        try { res = Game.convoPerformFavor(vid, f); } catch (e) { res = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
        const pAfter = haulKcal(f.forageRun.playerHaul), qAfter = haulKcal(f.forageRun.partnerHaul);
        if (res && res.ok && (pAfter - pBefore) + (qAfter - qBefore) > 0) {
          pressed = { target, anchor, cell, res, pBefore, pAfter, qBefore, qAfter };
          break;
        }
        // Empty press: free, patch unmarked — try the next anchor cell.
      }
      if (!pressed) log.push({ day, step: 'forage-node-barren', vid, vidName: vname(Game, vid), favorId: f.id, target, anchor, cellsTried: tried });
    }
    if (!pressed) { log.push({ day, step: 'forage-barren', vid, vidName: vname(Game, vid), favorId: f.id, nodesTried: Math.min(targets.length, 3) }); return; }
    log.push({ day, step: 'forage', vid, vidName: vname(Game, vid), favorId: f.id, target: pressed.target, anchor: pressed.anchor, cell: pressed.cell, menu: menuIds(Game, vid, f), ok: true, line: pressed.res && pressed.res.line, pressPlayerKcal: pressed.pAfter - pressed.pBefore, pressPartnerKcal: pressed.qAfter - pressed.qBefore, cumPlayerKcal: pressed.pAfter, cumPartnerKcal: pressed.qAfter, forageCount: f.forageRun.forageCount });
    try {
      if (Game.forageFavorTalkReady && Game.forageFavorTalkReady(vid, f)) {
        const tk = Game.performForageTalk(vid, f);
        log.push({ day, step: 'talk', vid, vidName: vname(Game, vid), favorId: f.id, ok: !!(tk && tk.ok), line: tk && tk.line, talkCount: f.forageRun.talkCount });
      }
    } catch (e) { log.push({ day, step: 'talk-error', vid, vidName: vname(Game, vid), favorId: f.id, error: String(e && e.message) }); }
    // Return home + deliver, same day.
    if (inCombat(Game)) { log.push({ day, step: 'stopped-combat-return', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
    const gotHome = hopHome(Game, 8);
    if (!gotHome) { log.push({ day, step: 'deliver-no-home', vid, vidName: vname(Game, vid), favorId: f.id, map: { x: Game.map.px, y: Game.map.py } }); return; }
    const st2 = statusOf(Game, vid, f);
    if (st2.ready && st2.action === 'forage_deliver') {
      let res = null;
      try { res = Game.convoPerformFavor(vid, f); } catch (e) { res = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
      log.push({ day, step: 'deliver', vid, vidName: vname(Game, vid), favorId: f.id, ok: !!(res && res.ok), line: res && res.line, deliveredKcal: f.forageRun.deliveredKcal, deliveredPlayerKcal: f.forageRun.deliveredPlayerKcal, deliveredPartnerKcal: f.forageRun.deliveredPartnerKcal, promiseKept: !!(promiseOf(Game, vid) || {}).kept, favorState: f.state });
    } else {
      log.push({ day, step: 'deliver-blocked', vid, vidName: vname(Game, vid), favorId: f.id, status: st2 });
    }
  } catch (e) {
    log.push({ day, step: 'day-error', vid, vidName: vname(Game, vid), favorId: f.id, error: String(e && e.message) });
  }
}

function favorEndStates(Game) {
  return favorForageFavors(Game).map(f => {
    const p = promiseOf(Game, f.vid);
    const r = f.forageRun || null;
    return {
      vid: f.vid, vidName: vname(Game, f.vid), favorId: f.id, state: f.state,
      promisedDay: f.promisedDay !== undefined ? f.promisedDay : null,
      meetDay: f.meetDay !== undefined ? f.meetDay : null,
      deadline: f.deadline !== undefined ? f.deadline : null,
      promiseKept: p ? !!p.kept : null,
      startedDay: r ? r.startedDay : null, forageCount: r ? r.forageCount : 0,
      playerKcal: r ? haulKcal(r.playerHaul) : 0, partnerKcal: r ? haulKcal(r.partnerHaul) : 0,
      deliveredKcal: r ? (r.deliveredKcal || 0) : 0, returnedDay: r ? (r.returnedDay || null) : null,
      talkCount: r ? (r.talkCount || 0) : 0,
    };
  });
}

module.exports = { homePoint, haulKcal, favorForageFavors, promiseOf, dueOf, statusOf, menuIds, hopHome, startWedge, dayWedge, favorEndStates };
