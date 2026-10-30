// journey-social-r75-outing-wedge.js -- WILD OUTING WEDGE (lane B, social r75).
// r75 FORK of the r74 wedge. DRIVER-POLICY changes only (zero src/js):
// (a) TARGET-AWARE WALK: walkToNode steps only onto tiles travelTo
// would accept from the step origin — orthogonal always, diagonal only
// onto a revealed tile and never past a guarded orthogonal
// intermediate (r74's walk arrived 0/35 because it planned diagonal
// steps into unrevealed tiles travelTo refuses); (b) hopHome walks
// home on the same target-aware walk instead of best-distance
// travelTargets hops, so a d=2-3 jump's intermediate blockage can no
// longer strand the player; no-home entries carry walk detail;
// (c) DAWN STEP-FIRST RETRY: on a clean-case no-micro-pos dawn block,
// one micro-step triggers ensureVillagerPositions, then a walk
// adjacent + start retry inside dayPart 0; (d) recordPosHistory gains
// a phase ('dawn'/'midday') so mid-day position gains stop reading as
// never-before. r74 behavior otherwise unchanged.
// See evidence/2026-10-30/r75/prereg.md (bindings B1-B4).
// Plays the tackle-outing joint-foraging outing through the PUBLIC favour
// path only (forageFavorAction status reads + convoPerformFavor /
// performForageTalk), driven by the r65 journey driver's upkeep (dawn
// starts) and daily (outing days). Shared by the driver and by the proof
// test (scripts/test-journey-social-r65-outing-wedge.js) so the wedge
// logic is proven once, not twice.
//
// Rules the wedge obeys (declared in evidence/2026-10-29/r65/prereg.md):
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
// r74: the ENDING status read (the menu's dlg:favor_cancel offer).
function statusEndOf(Game, vid, f) {
  try { return Game.forageFavorAction(vid, f, true) || { ready: false, reason: 'no-status' }; }
  catch (e) { return { ready: false, reason: 'status-error: ' + (e && e.message) }; }
}
// r74: RAW promise value — never coerced. 'broken' is a string and
// !!'broken' is true, which is exactly how r73 misread broken promises.
function keptRaw(p) { return p ? p.kept : null; }
function barrenKind(nodesReached, targetCount) {
  if (!targetCount) return 'no-target';
  return nodesReached > 0 ? 'node-barren' : 'travel-blocked';
}
// r74: once-per-day micro-position possession snapshot. ctx.posHistory
// maps vid -> { firstDay, lastDay, daysSeen }. Pure state reads.
// r75: phase ('dawn' default, 'midday') — one snapshot per phase per
// day, so a partner who gains a position mid-day is recorded as
// midday-ever instead of never-before. Dawn history stays in
// ctx.posHistory (r74-compatible); midday lands in posHistoryMidday.
function recordPosHistory(Game, ctx, phase) {
  try {
    const day = curDay(Game);
    const ph = phase || 'dawn';
    const dayKey = ph === 'midday' ? 'posHistDayMidday' : 'posHistDay';
    const histKey = ph === 'midday' ? 'posHistoryMidday' : 'posHistory';
    if (ctx[dayKey] === day) return;
    ctx[dayKey] = day;
    ctx[histKey] = ctx[histKey] || {};
    const v = Game.state.village || {};
    for (const vid of (v.roster || [])) {
      if ((v.positions || {})[vid]) {
        const e = ctx[histKey][vid] || (ctx[histKey][vid] = { firstDay: day, lastDay: day, daysSeen: 0 });
        e.lastDay = day; e.daysSeen = (e.daysSeen || 0) + 1;
      }
    }
  } catch (e) {}
}
function menuIds(Game, vid, f) {
  try { return (Game.convoFavorActionMenu(vid, f, false) || []).map(m => m.id); } catch (e) { return []; }
}

// r73 DAWN DIAGNOSTIC (recording only): mirrors src/js/favor-forage.js
// adjacent() failure order as pure reads, so a start-blocked dawn
// attempt classifies to exactly one cause. Never throws, never moves
// the player, never consumes RNG. adjFail: door-side / away /
// node-elsewhere / no-micro-pos / inside-mismatch / nonfinite-pos /
// micro-far / adjacent-ok / non-adjacency (status reason is not an
// adjacency block, e.g. deadline or another live outing).
function dawnDiag(Game, vid, f, st) {
  try {
    const v = Game.state.village || {}, s = Game.state.scholar || {};
    const home = homePoint(Game);
    const rawNode = (v.nodePos || {})[vid];
    const node = rawNode || { nx: home.x, ny: home.y };
    const pos = (v.positions || {})[vid] || null;
    const partnerInside = (v.npcInside || {})[vid] !== false;
    const playerInside = s.insideHaven !== false;
    const atHome = Game.map.px === home.x && Game.map.py === home.y;
    const nodeAtHome = node.nx === home.x && node.ny === home.y;
    let adjFail = 'adjacent-ok';
    if (atHome && nodeAtHome && partnerInside !== playerInside) adjFail = 'door-side';
    else if ((v.away || {})[vid]) adjFail = 'away';
    else if (node.nx !== Game.map.px || node.ny !== Game.map.py) adjFail = 'node-elsewhere';
    else if (!pos) adjFail = 'no-micro-pos';
    else if (atHome && partnerInside !== playerInside) adjFail = 'inside-mismatch';
    else if (![pos.mx, pos.my, s.mx, s.my].every(Number.isFinite)) adjFail = 'nonfinite-pos';
    else if (Math.max(Math.abs(pos.mx - s.mx), Math.abs(pos.my - s.my)) > 1) adjFail = 'micro-far';
    if (st && !st.ready && !/Move next to your partner|inside the Haven hall|on the Haven grounds/i.test(String(st.reason || ''))) adjFail = 'non-adjacency';
    const p = promiseOf(Game, vid);
    return { playerMap: { x: Game.map.px, y: Game.map.py }, home, playerInside, partnerInside,
      partnerNode: { nx: node.nx, ny: node.ny, defaulted: !rawNode }, partnerAway: !!(v.away || {})[vid],
      partnerPos: pos ? { mx: pos.mx, my: pos.my } : null, scholarPos: { mx: s.mx, my: s.my },
      dayPart: Game.dayPart, meetDay: f.meetDay !== undefined ? f.meetDay : null,
      deadline: dueOf(Game, f), promiseKept: keptRaw(p), favorState: f.state,
      playerAtHome: atHome, partnerNodeAtHome: nodeAtHome, adjFail };
  } catch (e) { return { error: String(e && e.message) }; }
}
function targetCanForage(Game, tt) {
  try {
    const F = (globalThis.Scattering || {}).forage;
    const tile = Game.tileAt(tt.x, tt.y);
    if (!tile) return null;
    return !F || !F.canForage || F.canForage(tile);
  } catch (e) { return null; }
}

// r75 TARGET-AWARE STEP GATE: would travelTo accept the step from
// (x,y) to (nx,ny)? Mirrors travelTargets() + travelTo() from the
// step origin (travelTargets itself reads the player's CURRENT tile,
// so planning from a hypothetical origin must re-derive the rule):
// orthogonal steps are always offered (d=1, revealed or fog, home
// board or beyond edge); diagonal steps are offered only onto a
// revealed tile (Manhattan d=2, revealed-only). A diagonal step is
// additionally refused when either orthogonal intermediate guards
// entry from the origin (travelTo's intermediate check refuses on
// any shortest-path intermediate blockage). A missing tile (beyond,
// ungenerated) reads as unrevealed; a missing travelBlockage probe
// reads as unblocked. Returns { ok, reason } — reason names the wall
// ('diagonal-unrevealed', 'dest-blocked', 'intermediate-blocked',
// or null). Never throws.
function nodeStepAllowed(Game, x, y, nx, ny) {
  try {
    const dx = nx - x, dy = ny - y;
    if (!dx && !dy) return { ok: true, reason: null };
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return { ok: false, reason: 'not-a-step' };
    const orth = (dx === 0 || dy === 0);
    if (!orth) {
      let tile = null;
      try { tile = Game.tileAt(nx, ny); } catch (e) { tile = null; }
      if (!tile || !tile.revealed) return { ok: false, reason: 'diagonal-unrevealed' };
      // Intermediate blockages on the two orthogonal corners.
      for (const [ix, iy] of [[nx, y], [x, ny]]) {
        let b = null;
        try { b = Game.travelBlockage(ix, iy, x, y); } catch (e) { b = null; }
        if (b) return { ok: false, reason: 'intermediate-blocked', at: { x: ix, y: iy }, blockage: String(b.blockType || b.kind || b) };
      }
    }
    let dest = null;
    try { dest = Game.travelBlockage(nx, ny, x, y); } catch (e) { dest = null; }
    if (dest) return { ok: false, reason: 'dest-blocked', blockage: String(dest.blockType || dest.kind || dest) };
    return { ok: true, reason: null };
  } catch (e) { return { ok: false, reason: 'probe-error' }; }
}

// r75: step-walk toward a node tile on TARGET-AWARE steps only (see
// nodeStepAllowed). r74's walk planned diagonal steps into unrevealed
// tiles and travelTo refused every one (0/35 arrived) — the BFS now
// plans only steps travelTo will take, so a refused execution step is
// a real wall, recorded as refusedAt, not an instrument gap. BFS
// bounds cover the home board plus the target (beyond-edge targets
// included). Returns { ok, pathFound, steps, refusedAt, refusedReason }.
// Never throws.
function walkToNode(Game, tx, ty, maxSteps) {
  const out = { ok: false, pathFound: false, steps: 0, refusedAt: null, refusedReason: null };
  try {
    const tiles = Game.map.tiles || [];
    const H = tiles.length, W = H ? tiles[0].length : 0;
    if (!H || !W) return out;
    const sx = Game.map.px, sy = Game.map.py;
    if (sx === tx && sy === ty) return { ok: true, pathFound: true, steps: 0, refusedAt: null, refusedReason: null };
    const minX = Math.min(0, tx), maxX = Math.max(W - 1, tx);
    const minY = Math.min(0, ty), maxY = Math.max(H - 1, ty);
    const key = (x, y) => x + ',' + y;
    const prev = {}; prev[key(sx, sy)] = null;
    const q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === tx && y === ty) break;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < minX || nx > maxX || ny < minY || ny > maxY || key(nx, ny) in prev) continue;
        if (!nodeStepAllowed(Game, x, y, nx, ny).ok) continue;
        prev[key(nx, ny)] = [x, y]; q.push([nx, ny]);
      }
    }
    if (!(key(tx, ty) in prev)) return out;
    out.pathFound = true;
    const path = [];
    let cur = [tx, ty];
    while (cur && !(cur[0] === sx && cur[1] === sy)) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
    if (path.length > (maxSteps || 16)) return out;
    for (const [nx, ny] of path) {
      if (inCombat(Game)) { out.refusedReason = 'combat'; return out; }
      const bx = Game.map.px, by = Game.map.py;
      try { Game.travelTo(nx, ny); } catch (e) { out.refusedAt = { x: nx, y: ny }; out.refusedReason = 'travel-error'; return out; }
      if (Game.map.px === bx && Game.map.py === by && !(nx === bx && ny === by)) {
        out.refusedAt = { x: nx, y: ny };
        try { const b = Game.travelBlockage(nx, ny, bx, by); out.refusedReason = b ? String(b.blockType || b.kind || b) : 'travel-refused'; } catch (e) { out.refusedReason = 'travel-refused'; }
        return out;
      }
      out.steps++;
      if (Game.map.px === tx && Game.map.py === ty) return { ok: true, pathFound: true, steps: out.steps, refusedAt: null, refusedReason: null };
    }
    out.ok = (Game.map.px === tx && Game.map.py === ty);
    return out;
  } catch (e) { return out; }
}

// r75: walk home on the target-aware walk (bounded steps). Returns the
// walk result object (not just a bool) so callers can log the refusal
// instead of a bare 'no-home'. hopHome keeps the old bool shape.
function hopHomeWalk(Game, maxSteps) {
  const home = homePoint(Game);
  if (Game.map.px === home.x && Game.map.py === home.y)
    return { ok: true, pathFound: true, steps: 0, refusedAt: null, refusedReason: null };
  if (inCombat(Game)) return { ok: false, pathFound: false, steps: 0, refusedAt: null, refusedReason: 'combat' };
  return walkToNode(Game, home.x, home.y, maxSteps || 40);
}
function hopHome(Game, maxHops) {
  // maxHops kept for call-shape compat; the walk is step-bounded.
  return hopHomeWalk(Game, (maxHops || 8) * 5).ok;
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
      if (waiting) log.push({ day, step: 'wait', vid, vidName: vname(Game, vid), favorId: f.id, diag: dawnDiag(Game, vid, f, null) });
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
        log.push({ day, step: 'start', vid, vidName: vname(Game, vid), favorId: f.id, waiting, menu: menuIds(Game, vid, f), ok: !!(res && res.ok), line: res && res.line, diag: dawnDiag(Game, vid, f, st) });
      } else {
        const diag0 = dawnDiag(Game, vid, f, st);
        log.push({ day, step: 'start-blocked', vid, vidName: vname(Game, vid), favorId: f.id, waiting, status: st, diag: diag0 });
        // r75 DAWN STEP-FIRST RETRY (clean case only): the partner is
        // on the home node on the player's door side but holds no
        // micro position, because ensureVillagerPositions runs on
        // movement/arrival/fight, never at dawn. One real player
        // micro-step triggers it; if a position appears, walk
        // adjacent and retry the start inside dayPart 0. A step is a
        // real move (1 tick + walk kcal, world turns run) — the same
        // move a competent player makes at dawn. Combat after the
        // step, or a dayPart flip, aborts the retry honestly.
        if (diag0 && diag0.adjFail === 'no-micro-pos' && diag0.playerAtHome && diag0.partnerNodeAtHome && diag0.partnerInside === diag0.playerInside) {
          const retry = { day, step: 'start-step-retry', vid, vidName: vname(Game, vid), favorId: f.id, stepOk: false, stepAssigned: false, retryStarted: false, dayPartAfter: Game.dayPart, statusAfter: null };
          try {
            const s0 = Game.state.scholar || {};
            const px0 = s0.mx ?? 4, py0 = s0.my ?? 4;
            let detail0 = null;
            try { detail0 = Game.genDetail(Game.map.px, Game.map.py); } catch (e) {}
            let stepCell = null;
            for (let dy = -1; dy <= 1 && !stepCell; dy++) for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const cx = px0 + dx, cy = py0 + dy;
              if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
              try { if (detail0 && Game.cellProps(detail0[cy][cx]).blocks) continue; } catch (e) { continue; }
              stepCell = { mx: cx, my: cy }; break;
            }
            retry.stepFrom = { mx: px0, my: py0 };
            if (stepCell) {
              retry.stepTo = stepCell;
              let okStep = false;
              try { okStep = Game.microMove(stepCell.mx, stepCell.my); } catch (e) { okStep = false; }
              retry.stepOk = !!okStep;
            }
            const vposAfter = (Game.state.village.positions || {})[vid] || null;
            retry.stepAssigned = !!vposAfter;
            retry.dayPartAfter = Game.dayPart;
            if (retry.stepAssigned && Game.dayPart === 0 && !inCombat(Game)) {
              const anchor = { mx: vposAfter.mx, my: vposAfter.my };
              let detailA = null;
              try { detailA = Game.genDetail(Game.map.px, Game.map.py); } catch (e) {}
              const cells = [];
              for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const cx = anchor.mx + dx, cy = anchor.my + dy;
                if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
                try { if (detailA && Game.cellProps(detailA[cy][cx]).blocks) continue; } catch (e) {}
                cells.push({ mx: cx, my: cy });
              }
              // Nearest anchor-adjacent cell first: fewest ticks, so the
              // retry stays inside dayPart 0 (128 ticks/part).
              try {
                const sp = Game.state.scholar || {};
                cells.sort((a, b) => Math.max(Math.abs(a.mx - (sp.mx ?? 4)), Math.abs(a.my - (sp.my ?? 4))) - Math.max(Math.abs(b.mx - (sp.mx ?? 4)), Math.abs(b.my - (sp.my ?? 4))));
              } catch (e) {}
              for (const cell of cells) {
                if (inCombat(Game) || Game.dayPart !== 0) break;
                if (!walkToCell(Game, cell.mx, cell.my, 20)) continue;
                const st2 = statusOf(Game, vid, f);
                retry.statusAfter = st2;
                if (st2.ready && st2.action === 'forage_start') {
                  let res2 = null;
                  try { res2 = Game.convoPerformFavor(vid, f); } catch (e) { res2 = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
                  if (res2 && res2.ok) {
                    retry.retryStarted = true;
                    log.push({ day, step: 'start', vid, vidName: vname(Game, vid), favorId: f.id, waiting, retryFromStep: true, menu: menuIds(Game, vid, f), ok: true, line: res2.line, diag: dawnDiag(Game, vid, f, st2) });
                  }
                  break;
                }
              }
              if (!retry.statusAfter) retry.statusAfter = statusOf(Game, vid, f);
            } else if (inCombat(Game)) {
              retry.statusAfter = { ready: false, reason: 'combat-after-step' };
            } else if (Game.dayPart !== 0) {
              retry.statusAfter = { ready: false, reason: 'daypart-moved' };
            } else {
              retry.statusAfter = statusOf(Game, vid, f);
            }
          } catch (e) {
            retry.error = String(e && e.message);
          }
          retry.diagAfter = dawnDiag(Game, vid, f, retry.statusAfter);
          log.push(retry);
        }
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
const STUCK_DAYS = 7;
// r74 WRAPPER: stuck counting lives here so every inner exit is counted
// exactly once. Progress = a forage press or a deliver this outing day;
// a combat-stopped day is skipped, not counted as stalling.
function dayWedge(Game, log, ctx) {
  ctx._lastOutingFavorId = null; ctx._lastOutingProgress = false;
  ctx._lastOutingEnded = false; ctx._outingSkip = false;
  dayWedgeInner(Game, log, ctx);
  const fid = ctx._lastOutingFavorId;
  if (!fid || ctx._outingSkip) return;
  ctx.stuckDays = ctx.stuckDays || {};
  if (ctx._lastOutingEnded) delete ctx.stuckDays[fid];
  else if (ctx._lastOutingProgress) delete ctx.stuckDays[fid];
  else ctx.stuckDays[fid] = (ctx.stuckDays[fid] || 0) + 1;
}
function dayWedgeInner(Game, log, ctx) {
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
  ctx._lastOutingFavorId = f.id; ctx._lastOutingProgress = false;
  // r74 STUCK ESCALATION: 7 consecutive no-progress outing days. The
  // player ends the outing at home through the game's own forage_end
  // action (status-gated); if it is not offered, the block is logged
  // (day 7 and every 7th day after) and the gate stays honestly shut.
  const stuck = (ctx.stuckDays || {})[f.id] || 0;
  if (stuck >= STUCK_DAYS) {
    const home0 = homePoint(Game);
    const atHome0 = Game.map.px === home0.x && Game.map.py === home0.y;
    const walkHome0 = atHome0 ? { ok: true, pathFound: true, steps: 0, refusedAt: null, refusedReason: null } : hopHomeWalk(Game, 40);
    const gotHome0 = walkHome0.ok;
    if (!gotHome0) {
      if (stuck === STUCK_DAYS || stuck % STUCK_DAYS === 0)
        log.push({ day, step: 'outing-end-blocked', vid, vidName: vname(Game, vid), favorId: f.id, stuckDays: stuck, reason: 'no-home', map: { x: Game.map.px, y: Game.map.py }, walkPathFound: walkHome0.pathFound, walkSteps: walkHome0.steps, walkRefusedAt: walkHome0.refusedAt, walkRefusedReason: walkHome0.refusedReason });
      return;
    }
    const stEnd = statusEndOf(Game, vid, f);
    if (stEnd.ready && stEnd.action === 'forage_end') {
      let res = null;
      try { res = Game.performForageFavor(vid, f, true); } catch (e) { res = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
      log.push({ day, step: 'outing-ended-stuck', vid, vidName: vname(Game, vid), favorId: f.id, stuckDays: stuck, ok: !!(res && res.ok), line: res && res.line, deliveredKcal: f.forageRun.deliveredKcal, promiseKept: keptRaw(promiseOf(Game, vid)), favorState: f.state });
      ctx._lastOutingEnded = true;
    } else if (stuck === STUCK_DAYS || stuck % STUCK_DAYS === 0) {
      log.push({ day, step: 'outing-end-blocked', vid, vidName: vname(Game, vid), favorId: f.id, stuckDays: stuck, status: stEnd });
    }
    return;
  }
  const home = homePoint(Game);
  try {
    const haul = haulKcal(f.forageRun.playerHaul) + haulKcal(f.forageRun.partnerHaul);
    const atHome = Game.map.px === home.x && Game.map.py === home.y;
    if (atHome && haul > 0) {
      const st = statusOf(Game, vid, f);
      if (st.ready && st.action === 'forage_deliver') {
        let res = null;
        try { res = Game.convoPerformFavor(vid, f); } catch (e) { res = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
        if (res && res.ok) ctx._lastOutingProgress = true;
        log.push({ day, step: 'deliver', vid, vidName: vname(Game, vid), favorId: f.id, haulBefore: haul, ok: !!(res && res.ok), line: res && res.line, deliveredKcal: f.forageRun.deliveredKcal, promiseKept: keptRaw(promiseOf(Game, vid)), favorState: f.state });
      } else {
        log.push({ day, step: 'deliver-blocked', vid, vidName: vname(Game, vid), favorId: f.id, haulBefore: haul, status: st });
      }
      return;
    }
    // Forage leg: get home first if away, then one green hop out.
    if (!atHome) {
      const walkHome = hopHomeWalk(Game, 40);
      if (!walkHome.ok) { log.push({ day, step: 'forage-no-home', vid, vidName: vname(Game, vid), favorId: f.id, map: { x: Game.map.px, y: Game.map.py }, walkPathFound: walkHome.pathFound, walkSteps: walkHome.steps, walkRefusedAt: walkHome.refusedAt, walkRefusedReason: walkHome.refusedReason }); return; }
    }
    if (inCombat(Game)) { ctx._outingSkip = true; log.push({ day, step: 'stopped-combat', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
    // FORAGE LEG (r65 wedge, revised after the fixture failure): the press
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
    let pressed = null, nodesReached = 0;
    for (let ni = 0; ni < targets.length && ni < 3 && !pressed; ni++) {
      const target = targets[ni];
      if (inCombat(Game)) { ctx._outingSkip = true; log.push({ day, step: 'stopped-combat', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
      try { Game.travelTo(target.x, target.y); } catch (e) {}
      if (Game.map.px !== target.x || Game.map.py !== target.y) {
        // r75 TARGET-AWARE FALLBACK: the direct jump refused
        // (intermediate blockage). Step-walk around it on
        // travelTo-legal steps; log the attempt either way.
        const walk = walkToNode(Game, target.x, target.y, 16);
        let blockage = null;
        try { blockage = Game.travelBlockage ? String(Game.travelBlockage(target.x, target.y, Game.map.px, Game.map.py)) : null; } catch (e) {}
        if (!walk.ok) {
          log.push({ day, step: 'forage-travel-blocked', vid, vidName: vname(Game, vid), favorId: f.id, target, map: { x: Game.map.px, y: Game.map.py }, walkAttempted: true, pathFound: walk.pathFound, walkSteps: walk.steps, walkRefusedAt: walk.refusedAt, walkRefusedReason: walk.refusedReason, blockage });
          continue;
        }
        log.push({ day, step: 'forage-travel-walked', vid, vidName: vname(Game, vid), favorId: f.id, target, walkSteps: walk.steps });
      }
      nodesReached++;
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
        if (inCombat(Game)) { ctx._outingSkip = true; log.push({ day, step: 'stopped-combat', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
        if (!walkToCell(Game, cell.mx, cell.my, 20)) continue;
        tried++;
        const st = statusOf(Game, vid, f);
        if (!st.ready || st.action !== 'forage_together') {
          log.push({ day, step: 'forage-cell-blocked', vid, vidName: vname(Game, vid), favorId: f.id, target, anchor, cell, status: st, targetCanForage: targetCanForage(Game, target), playerMap: { x: Game.map.px, y: Game.map.py } });
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
      if (!pressed) log.push({ day, step: 'forage-node-barren', vid, vidName: vname(Game, vid), favorId: f.id, target, anchor, cellsTried: tried, targetCanForage: targetCanForage(Game, target), playerMap: { x: Game.map.px, y: Game.map.py } });
    }
    if (!pressed) { log.push({ day, step: 'forage-barren', vid, vidName: vname(Game, vid), favorId: f.id, nodesTried: Math.min(targets.length, 3), nodesReached, barrenKind: barrenKind(nodesReached, targets.length) }); return; }
    ctx._lastOutingProgress = true;
    log.push({ day, step: 'forage', vid, vidName: vname(Game, vid), favorId: f.id, target: pressed.target, anchor: pressed.anchor, cell: pressed.cell, menu: menuIds(Game, vid, f), ok: true, line: pressed.res && pressed.res.line, pressPlayerKcal: pressed.pAfter - pressed.pBefore, pressPartnerKcal: pressed.qAfter - pressed.qBefore, cumPlayerKcal: pressed.pAfter, cumPartnerKcal: pressed.qAfter, forageCount: f.forageRun.forageCount });
    try {
      if (Game.forageFavorTalkReady && Game.forageFavorTalkReady(vid, f)) {
        const tk = Game.performForageTalk(vid, f);
        log.push({ day, step: 'talk', vid, vidName: vname(Game, vid), favorId: f.id, ok: !!(tk && tk.ok), line: tk && tk.line, talkCount: f.forageRun.talkCount });
      }
    } catch (e) { log.push({ day, step: 'talk-error', vid, vidName: vname(Game, vid), favorId: f.id, error: String(e && e.message) }); }
    // Return home + deliver, same day.
    if (inCombat(Game)) { ctx._outingSkip = true; log.push({ day, step: 'stopped-combat-return', vid, vidName: vname(Game, vid), favorId: f.id }); return; }
    const walkHome = hopHomeWalk(Game, 40);
    if (!walkHome.ok) { log.push({ day, step: 'deliver-no-home', vid, vidName: vname(Game, vid), favorId: f.id, map: { x: Game.map.px, y: Game.map.py }, walkPathFound: walkHome.pathFound, walkSteps: walkHome.steps, walkRefusedAt: walkHome.refusedAt, walkRefusedReason: walkHome.refusedReason }); return; }
    const st2 = statusOf(Game, vid, f);
    if (st2.ready && st2.action === 'forage_deliver') {
      let res = null;
      try { res = Game.convoPerformFavor(vid, f); } catch (e) { res = { ok: false, line: 'perform-error: ' + (e && e.message) }; }
      if (res && res.ok) ctx._lastOutingProgress = true;
      log.push({ day, step: 'deliver', vid, vidName: vname(Game, vid), favorId: f.id, ok: !!(res && res.ok), line: res && res.line, deliveredKcal: f.forageRun.deliveredKcal, deliveredPlayerKcal: f.forageRun.deliveredPlayerKcal, deliveredPartnerKcal: f.forageRun.deliveredPartnerKcal, promiseKept: keptRaw(promiseOf(Game, vid)), favorState: f.state });
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
      promiseKept: keptRaw(p),
      startedDay: r ? r.startedDay : null, forageCount: r ? r.forageCount : 0,
      playerKcal: r ? haulKcal(r.playerHaul) : 0, partnerKcal: r ? haulKcal(r.partnerHaul) : 0,
      deliveredKcal: r ? (r.deliveredKcal || 0) : 0, returnedDay: r ? (r.returnedDay || null) : null,
      talkCount: r ? (r.talkCount || 0) : 0,
    };
  });
}

module.exports = { homePoint, haulKcal, favorForageFavors, promiseOf, dueOf, statusOf, statusEndOf, menuIds, hopHome, hopHomeWalk, walkToNode, nodeStepAllowed, keptRaw, barrenKind, recordPosHistory, STUCK_DAYS, dawnDiag, startWedge, dayWedge, dayWedgeInner, favorEndStates };
