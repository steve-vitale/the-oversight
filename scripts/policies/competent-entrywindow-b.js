'use strict';
// competent-entrywindow-b.js — ENTRY-WINDOW ROTATION policy variant
// (sim-entrywindow-b, Loop B food-economy arm, 2026-11-01).
//
// Prereg: evidence/2026-11-01/sim-entrywindow-b-prereg.md (committed
// BEFORE any judged sim). Policy-side arm: a NEW policy file, default
// OFF (nothing loads it unless a driver names it), ZERO src/js changes,
// ZERO edits to scripts/policies/competent.js, ZERO policy-default flips.
//
// STAGE-1 FINDING (why this rule can exist at all): the entry cell IS
// knowable at menu time for the trip's first candidate, and only
// conditionally knowable for later ones. travelTo (game.js) sets
// mx/my from (a) the sign of the total delta from the current tile,
// (b) the scholar's current micro position on the origin tile, and
// (c) findWalkableEntry's BFS on the destination detail grid — all
// three readable at the travelTargets call, with no RNG in the path
// (genDetail is detailSeed/detailRand-seeded, and for a visited tile
// it returns the cached detail without regenerating). The census
// instrument verified this empirically: predicted entry == actual
// entry on 457/457 compared forage travels (100%), and the sweep's
// micro cell == the travel entry cell on 486/486 attempts. The two
// qualifications: (1) LATER candidates enter from the previous
// candidate's tile, not from the trip origin — so a static menu
// ranking can only carry the FROM-CURRENT-POSITION entry window,
// which is exact for the first try and an approximation for tries
// 2-3 (the pilot judges whether the approximation moves the pair);
// (2) FIRST-VISIT tiles have no detail at menu time, so their entry
// window is unknowable without generating ground (genDetail's first
// visit also strips cells and mutates stock — a side effect, not a
// read) — first-visit tiles are therefore left exactly alone, the
// same perception boundary fertrot used. Census bound: 29/486
// attempts were first-visit travels (predicted null), 14 of them
// failures — the most a visited-only rule could ever prevent is
// 330 of 344 failures, and only if the chain approximation holds.
//
// STAGE-2a CENSUS (why this rule, not another): on fertrot's band
// re-run with the entry-window instrument (60101-60108, baseline
// competent, 486 attempts), pre-sweep entry-window harvest count
// separates PERFECTLY: window 0 -> 344 attempts, 0 successes;
// window >= 1 -> 142 attempts, 142 successes; ZERO failed attempts
// had a non-empty window (fertrot's whole-tile count left 95% of
// failures in the fertile bucket). A tile whose from-here entry
// window is empty CANNOT pay this trip; a tile whose window is
// non-empty always paid here. (Pack-full would break the identity;
// it occurred 0 times in the census.)
//
// FROZEN RULE (one sentence): during competent.daily only, a tile
// the scholar has itself worked whose entry window FROM THE
// SCHOLAR'S CURRENT POSITION currently holds zero harvestable cells
// (sweep's own test, scorch aside — see caveat) sorts as 99 steps
// farther for forage-target choice; every other tile is left exactly
// alone — no fertile bonus (a bonus would only reshuffle tiles that
// already pay, the fertrot harm pattern), no filtering (the trip
// still tries up to 3 candidates, so empty-window ground is tried
// when nothing better exists).
//
// PERCEPTION HONESTY (Steve 2026-10-28, no magic lists): the rule
// reads t.detail ONLY for tiles in the policy's own visited set
// (tiles the scholar foraged during this run). Unvisited tiles have
// no detail read at all: their entries pass through untouched, and
// the wrapper never calls genDetail. The visited check runs first,
// on the key alone, so Game.tileAt is never called for unvisited
// (possibly beyond-edge) entries.
//
// MECHANISM (pure policy reweighting, no game-code change): during
// competent.daily only, the wrapper replaces Game.travelTargets
// with a version returning fresh objects whose `d` is inflated by
// +99 for empty-entry-window worked tiles. forageTripSeedFirst sorts
// candidates by (blocked, effective distance), so among unblocked
// candidates an empty-window tile sorts last. Blocked-first ordering
// is untouched. Known spillovers, stated in the prereg: walkTo
// ignores `d` (own Manhattan distance), so it is unaffected;
// nearestRubble picks by min `d`, so an empty-window rubble tile
// may lose a stoneRun to a farther tile; the feast patrol sorts by
// descending `d`, so an empty-window tile may look farther and
// enter its top-4 — the patrol runs only while feasted, and
// COMPETENT_FEAST=0 in this substrate.
//
// CAVEATS BUILT INTO THE SIGNAL (not hidden): (1) SCORCH: the
// sweep excludes scorched cells, but cellScorched is
// current-tile-relative — at menu time the scholar stands on the
// origin tile, so it cannot read a candidate's scorch honestly.
// The rule therefore counts a scorched cell as harvestable (same
// class as fertrot's caveat 2; scorch is rare, and any overcount
// biases toward trying, not skipping). The census predictor DID
// exclude scorch (sweep-time read, scholar on the tile) and still
// separated perfectly, so this caveat can only cost the rule
// occasional tries, never its direction. (2) CHAIN: see stage-1
// qualification (1) above — the ranked value is the
// from-current-position window, exact for try 1, approximate for
// tries 2-3. (3) SPECIES: a forageable cell with no species is not
// taken unless it is a tree/bigtree (deadfall) — the window count
// applies the sweep's rule via Game.cellPlantSpecies, not a raw
// cell-type count.
//
// VISITED TRACKING: the wrapper records every forage doAction
// during daily (success OR failure — a worked-out patch is picked
// clean either way) keyed "x,y" in the run's ctx
// (ctx.entrywindowVisited, a plain object; ctx is per-run). All
// wrappers are restored in a finally; the base daily runs exactly
// once.
const { competent } = require('./competent');

const ENTRYWINDOW_PENALTY = 99; // distance inflation for empty-entry-window worked tiles

const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };

function tileKey(x, y) { return x + ',' + y; }
function clamp9(v) { return Math.max(0, Math.min(8, v)); }
// Pure: replicate travelTo's entry computation (game.js travelTo +
// findWalkableEntry) on an EXISTING detail grid. Returns null when
// detail is absent (unvisited tile: no genDetail, no ground created).
// cellPropsFn(cell) -> {blocks} (Game.cellProps in the wrapper).
function predictEntry(fromPx, fromPy, fromMx, fromMy, destX, destY, detail, cellPropsFn) {
  if (!Array.isArray(detail)) return null;
  const odx = Math.sign(destX - fromPx), ody = Math.sign(destY - fromPy);
  const wantX = odx > 0 ? 0 : odx < 0 ? 8 : clamp9(fromMx == null ? 4 : fromMx);
  const wantY = ody > 0 ? 0 : ody < 0 ? 8 : clamp9(fromMy == null ? 4 : fromMy);
  const walkable = (cx, cy) => {
    if (cx < 0 || cx > 8 || cy < 0 || cy > 8) return false;
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
// Pure: harvestable-cell count in the 3x3 window around (mx,my) on
// one tile object, using the sweep's test minus scorch (see caveat
// 1: scorch is not readable for a candidate at menu time).
// speciesFn(tile,cx,cy,cell) -> pid|null (Game.cellPlantSpecies).
// Returns null when the tile has no detail grid or no micro cell.
function entryWindowHarvest(tile, mx, my, speciesFn) {
  if (!tile || !Array.isArray(tile.detail) || mx == null || my == null) return null;
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = mx + dx, cy = my + dy;
    if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
    const c = tile.detail[cy] && tile.detail[cy][cx];
    if (!FORAGEABLE[c]) continue;
    if (tile.detailRegrow && tile.detailRegrow[cx + ',' + cy]) continue;
    let pid = null;
    try { pid = speciesFn ? speciesFn(tile, cx, cy, c) : null; } catch (e) { pid = null; }
    if (pid || c === 'tree' || c === 'bigtree') n++;
  }
  return n;
}
// Pure: adjusted distance for one candidate. `harvest` is the
// entry-window harvest count for the tile, or null when unknown
// (tile never worked by the scholar — no signal, no adjustment).
function adjustedDistance(entry, harvest) {
  const d = (entry && typeof entry.d === 'number') ? entry.d : 0;
  if (harvest == null) return d;
  if (harvest === 0) return d + ENTRYWINDOW_PENALTY;
  return d;
}

const entrywindow = Object.assign({}, competent, {
  id: 'competent-entrywindow-b',
  desc: 'competent + entry-window rotation: worked tiles whose entry window from the current position holds zero harvestable cells sort as 99 steps farther, everything else untouched (sim-entrywindow-b)',
  daily(Game, ctx) {
    if (!ctx.entrywindowVisited) ctx.entrywindowVisited = {};
    const visited = ctx.entrywindowVisited;
    const origTravelTargets = Game.travelTargets;
    const origDoAction = Game.doAction;
    if (typeof origTravelTargets === 'function') {
      Game.travelTargets = function () {
        const out = origTravelTargets.apply(this, arguments);
        try {
          let adjusted = false;
          // Menu-time position: the scholar's current tile + micro
          // cell. This is the origin every candidate's entry is
          // computed from (exact for the trip's first try; see the
          // chain caveat in the header for tries 2-3).
          let fromPx = null, fromPy = null, fromMx = null, fromMy = null;
          try {
            fromPx = Game.map.px; fromPy = Game.map.py;
            fromMx = Game.state.scholar.mx; fromMy = Game.state.scholar.my;
          } catch (e) {}
          const adj = (out || []).map((t) => {
            // Visited check FIRST, on the key alone: never call
            // tileAt for unvisited (possibly beyond-edge) entries.
            if (!Object.prototype.hasOwnProperty.call(visited, tileKey(t.x, t.y))) return t;
            let harvest = null;
            try {
              const tile = Game.tileAt(t.x, t.y);
              if (tile && Array.isArray(tile.detail)) {
                const entry = predictEntry(fromPx, fromPy, fromMx, fromMy, t.x, t.y,
                  tile.detail, (cell) => Game.cellProps(cell));
                if (entry) {
                  harvest = entryWindowHarvest(tile, entry.x, entry.y,
                    (tt, cx, cy, c) => { try { return Game.cellPlantSpecies(tt, cx, cy, c); } catch (e) { return null; } });
                }
              }
            } catch (e) { harvest = null; }
            const a = Object.assign({}, t, { d: adjustedDistance(t, harvest) });
            if (a.d !== t.d) {
              adjusted = true;
              ctx.entrywindowEmptyTiles = (ctx.entrywindowEmptyTiles || 0) + 1;
            }
            return a;
          });
          if (adjusted) ctx.entrywindowPenalizedMenus = (ctx.entrywindowPenalizedMenus || 0) + 1;
          return adj;
        } catch (e) { return out; }
      };
    }
    if (typeof origDoAction === 'function') {
      Game.doAction = function (kind, opts) {
        if (kind !== 'forage') return origDoAction.apply(this, arguments);
        // Record BEFORE the call: position at call time is the tile
        // being worked.
        let px = null, py = null;
        try { px = Game.map.px; py = Game.map.py; } catch (e) {}
        if (px != null && py != null) {
          try {
            visited[tileKey(px, py)] = true;
            ctx.entrywindowForageAttempts = (ctx.entrywindowForageAttempts || 0) + 1;
          } catch (e) {}
        }
        return origDoAction.apply(this, arguments);
      };
    }
    try {
      competent.daily(Game, ctx);
    } finally {
      if (typeof origTravelTargets === 'function') Game.travelTargets = origTravelTargets;
      if (typeof origDoAction === 'function') Game.doAction = origDoAction;
    }
    try { ctx.entrywindowVisitedTiles = Object.keys(visited).length; } catch (e) {}
  },
});

module.exports = {
  entrywindow, ENTRYWINDOW_PENALTY,
  _predictEntry: predictEntry, _entryWindowHarvest: entryWindowHarvest,
  _adjustedDistance: adjustedDistance, _tileKey: tileKey,
};
