'use strict';
// competent-fertrot-b.js — FERTILITY-SIGNAL ROTATION policy variant
// (sim-fertrot-b, Loop B food-economy arm, 2026-11-01).
//
// Prereg: evidence/2026-11-01/sim-fertrot-b-prereg.md (committed
// BEFORE any judged sim). Policy-side arm: a NEW policy file, default
// OFF (nothing loads it unless a driver names it), ZERO src/js changes,
// ZERO edits to scripts/policies/competent.js, ZERO policy-default flips.
//
// FROZEN RULE (one sentence, from the prereg): for forage-target
// choice during competent.daily only, a tile the scholar has itself
// worked whose detail grid currently shows ZERO harvestable cells
// outside detailRegrow (barren-by-observation — the sweep's own
// skip rule, presence-based) sorts as 99 steps farther, and a
// worked tile showing 6+ such cells sorts as one step nearer;
// ground the scholar has never worked is left exactly alone
// (no signal — neither boosted nor penalized).
//
// WHY THIS SIGNAL AND NOT RECENCY (patchrot's lesson): patchrot
// rotated away from tiles foraged within 2 days and cut failed
// trips 0.346 -> 0.171 while mean haul FELL 511.9 -> 457.2 — the
// extra trips went to thinner ground, and rule-fresh tiles still
// failed worked-out. Recency is not fertility: a tile swept
// yesterday whose sweep window still holds cells (partial sweep,
// different entry window) is not barren, and a tile never swept
// by the scholar can still be cell-picked-clean (animals,
// villagers, or a detail grid with no forageables at all). The
// sweep itself tests exactly one thing — forageable detail cells
// not in detailRegrow (game.js forage action: FORAGEABLE plant /
// bush / tree / bigtree, skipping scorched cells and any cell in
// t.detailRegrow) — so this rule ranks by that same test, read
// only off ground the scholar has stood on and worked.
//
// PERCEPTION HONESTY (Steve 2026-10-28, no magic lists): the rule
// reads t.detail ONLY for tiles in the policy's own visited set
// (tiles the scholar foraged during this run — its own memory of
// ground it worked). Unvisited tiles have no detail read at all:
// their entries pass through untouched, and the wrapper never
// calls genDetail or any generator — reading t.detail of a
// visited tile cannot create ground, and no unvisited tile's
// detail is ever touched. Beyond-edge menu entries are never
// visited, so Game.tileAt is never called for them (tileAt on a
// beyond-edge coordinate could generate ground; the visited
// check happens first, on the key alone).
//
// MECHANISM (pure policy reweighting, no game-code change): during
// competent.daily only, the wrapper replaces Game.travelTargets
// with a version returning fresh objects whose `d` is inflated by
// +99 for barren-by-observation tiles or reduced by 1 for
// known-fertile tiles. forageTripSeedFirst sorts candidates by
// (blocked, effective distance), so among unblocked candidates a
// fertile tile sorts ahead of a thin one and a barren tile sorts
// last; the trip tries up to 3 candidates, so barren ground is
// still tried when fewer than 3 better candidates exist. Blocked-
// first ordering is untouched. Known spillovers, stated in the
// prereg: walkTo ignores `d` (own Manhattan distance), so it is
// unaffected; nearestRubble picks by min `d`, so a barren rubble
// tile may lose a stoneRun to a farther fertile one; the feast
// patrol sorts by descending `d`, so a barren tile may look
// farther and enter its top-4 — the patrol runs only while
// feasted, and COMPETENT_FEAST=0 in this substrate.
//
// CAVEATS BUILT INTO THE SIGNAL (not hidden): (1) availCells
// counts the WHOLE 9x9 detail grid, while one sweep works only
// the 3x3 around the scholar's entry cell (travelTo sets mx/my
// to the entry cell) — so the count is an upper bound on what
// one sweep reaches, a ranking signal, not an exact prediction.
// (2) Scorched cells are not excluded (cellScorched is relative
// to the tile the scholar currently stands on, which at menu
// time is the haven, not the candidate) — scorched ground is
// rare, and any overcount biases toward trying, not skipping.
// (3) The game's parallel record, groundReadLevel (readGround
// on every sweep: lush / thinning / picked / barren from
// stock / vigor-cap), is NOT used by the rule — it tracks the
// stock layer, and haulsize proved stock does not predict
// sweep success. It is recorded by the driver as a diagnostic
// predictor for the census, not as a rule input.
//
// VISITED TRACKING: the wrapper records every forage doAction
// during daily (success OR failure — a worked-out patch is
// picked clean either way) keyed "x,y" in the run's ctx
// (ctx.fertrotVisited, a plain object; ctx is per-run). All
// wrappers are restored in a finally; the base daily runs
// exactly once.
const { competent } = require('./competent');

const FERTROT_PENALTY = 99; // distance inflation for barren-by-observation tiles
const FERTROT_BONUS = 1; // distance reduction for known-fertile tiles
const FERTROT_FERTILE_MIN = 6; // availCells at/above which a tile counts fertile

const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };

function tileKey(x, y) { return x + ',' + y; }
// Pure: harvestable-cell count for one tile object, using the sweep's
// own test (forageable cell not in detailRegrow, presence-based).
// Returns null when the tile has no detail grid (never worked).
function availableCells(tile) {
  if (!tile || !Array.isArray(tile.detail)) return null;
  const regrow = tile.detailRegrow || {};
  let n = 0;
  for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 9; cx++) {
    const c = tile.detail[cy] && tile.detail[cy][cx];
    if (!FORAGEABLE[c]) continue;
    if (regrow[cx + ',' + cy]) continue;
    n++;
  }
  return n;
}
// Pure: adjusted distance for one candidate. `avail` is the
// availableCells count for the tile, or null when unknown (tile
// never worked by the scholar — no signal, no adjustment).
function adjustedDistance(entry, avail) {
  const d = (entry && typeof entry.d === 'number') ? entry.d : 0;
  if (avail == null) return d;
  if (avail === 0) return d + FERTROT_PENALTY;
  if (avail >= FERTROT_FERTILE_MIN) return d - FERTROT_BONUS;
  return d;
}
// Pure: reweight a whole travelTargets menu (fresh objects out).
// `availByKey` maps "x,y" -> availableCells count (only for tiles
// the scholar has worked); anything absent is unknown -> unchanged.
function adjustedTargets(targets, availByKey) {
  return (targets || []).map((t) => Object.assign({}, t, {
    d: adjustedDistance(t, Object.prototype.hasOwnProperty.call(availByKey, tileKey(t.x, t.y))
      ? availByKey[tileKey(t.x, t.y)] : null),
  }));
}

const fertrot = Object.assign({}, competent, {
  id: 'competent-fertrot-b',
  desc: 'competent + fertility-signal rotation: worked tiles with 0 harvestable detail cells sort as 99 steps farther, worked tiles with 6+ sort 1 step nearer, unworked ground untouched (sim-fertrot-b)',
  daily(Game, ctx) {
    if (!ctx.fertrotVisited) ctx.fertrotVisited = {};
    const visited = ctx.fertrotVisited;
    const origTravelTargets = Game.travelTargets;
    const origDoAction = Game.doAction;
    if (typeof origTravelTargets === 'function') {
      Game.travelTargets = function () {
        const out = origTravelTargets.apply(this, arguments);
        try {
          let adjusted = false;
          const adj = (out || []).map((t) => {
            // Visited check FIRST, on the key alone: never call
            // tileAt for unvisited (possibly beyond-edge) entries.
            if (!Object.prototype.hasOwnProperty.call(visited, tileKey(t.x, t.y))) return t;
            let avail = null;
            try { const tile = Game.tileAt(t.x, t.y); avail = availableCells(tile); } catch (e) { avail = null; }
            const a = Object.assign({}, t, { d: adjustedDistance(t, avail) });
            if (a.d !== t.d) {
              adjusted = true;
              if (avail === 0) ctx.fertrotBarrenTiles = (ctx.fertrotBarrenTiles || 0) + 1;
              else ctx.fertrotFertileTiles = (ctx.fertrotFertileTiles || 0) + 1;
            }
            return a;
          });
          if (adjusted) ctx.fertrotPenalizedMenus = (ctx.fertrotPenalizedMenus || 0) + 1;
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
            ctx.fertrotForageAttempts = (ctx.fertrotForageAttempts || 0) + 1;
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
    try { ctx.fertrotVisitedTiles = Object.keys(visited).length; } catch (e) {}
  },
});

module.exports = {
  fertrot, FERTROT_PENALTY, FERTROT_BONUS, FERTROT_FERTILE_MIN,
  _availableCells: availableCells, _adjustedDistance: adjustedDistance,
  _adjustedTargets: adjustedTargets, _tileKey: tileKey,
};
