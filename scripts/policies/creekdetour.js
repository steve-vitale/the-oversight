// policies/creekdetour.js — creek-aware titan routing (Loop B
// fleshout-20261102T1030Z, arm sim-creekdetour-b, axis scale-onramp).
// POLICY ONLY: zero src/js changes. Wraps a base policy's daily/setup;
// upkeep, fight, and everything else delegate untouched.
//
// WHAT IT FIXES (diagnosed, not guessed): titanroute-a's greedy march
// picks the Manhattan-best travelTarget and stops on refusal. On seed
// 97307 that target is (6,4) — a WETLAND, not a creek — and travelTo
// refuses it because its intermediate scan walks every shortest path
// from (4,4) and hits the needsBridge creek at (5,4) (the block object
// returned is {blockType:'creek', x:5, y:4}, the INTERMEDIATE tile, not
// the destination). titanroute-a's evidence glossed (6,4) as the creek
// tile and concluded a travelBlockage-based BFS "would NOT route
// around"; both halves are wrong, proven by replay trace in
// evidence/2026-11-02/sim-creekdetour-b.md: travelBlockage(6,4) is
// null because (6,4) IS passable — the blocked edge is (4,4)->(5,4) —
// and a BFS over entry-specific travelBlockage edges routes north
// (4,3)->(5,3)->(6,3)->(7,3)->(7,4) and arrives. The lair's fallen
// tree guards ONLY the west approach (blockFrom dx=-1), so the north
// entry is open. This policy is that BFS walk, step by step.
//
// PERCEPTION LAW (load-bearing, same as titanroute.js): the policy
// NEVER reads Game.worldMonsters() or any monster roster. It knows
// exactly two things, both heard/seen in fiction:
//   1. the lair tile, heard from the scouts' announcement line
//      ("Scouts found its lair — tile x,y", Game.say at omen stage 1->2);
//   2. tile-sharing, seen with its own eyes via Game.playerMonster()
//      (the engine's monster-on-your-tile read, used only by the
//      inherited arrival/call branch below, never for routing).
// Routing reads ONLY: its own tile, entry-specific travelBlockage,
// map tiles the BFS steps onto (board terrain the player sees on the
// 9x9 board), its own wood count (bridge gate), and its own swimmer
// ability (own body). The march target is ALWAYS the heard lair tile
// (fixed, known) — never a live herald position, which the scholar
// cannot know.
//
// BEHAVIOR: same guardrails and call rule as titanroute.js (fed /
// watered / healthy; sound the call once on the first night the
// scholar ends ON the lair tile; Haven's own blades NOT committed).
// The walk differs: BFS over orthogonal adjacent steps (one travelTo
// per hop, no force — d=1 hops skip travelTo's intermediate scan
// entirely, so a refused jump can never recur), refusal memory (a
// refused edge is excluded and the march re-plans, up to 3 re-plans
// per march day), and a bridge fallback ONLY when BFS finds no
// walkable path (adjacent needsBridge creek + wood >= 4 ->
// buildBridge, then re-plan; wood < 4 fails honestly). If the
// scholar has swimmer, travelBlockage already passes creeks and the
// BFS routes straight through; such an arrival is recorded as
// swimmer-assisted when the walked path steps on a needsBridge
// creek tile, and as a plain detour otherwise.
// If the lair is never heard, this wrapper is byte-identical to base.
// No RNG is consumed (deterministic tie-breaks), so arm/baseline
// trajectories differ ONLY through the march/call actions and their
// consequences.
'use strict';

const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;
const CALL_RE = /THE CALL GOES OUT/;

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function scholarTile(Game) {
  try {
    if (!Game.map) return null;
    return { x: Game.map.px, y: Game.map.py };
  } catch (e) { return null; }
}

function slain(Game) {
  try {
    const st = ((Game.state || {}).titans || {});
    return !!((st.slain || {}).herald);
  } catch (e) { return false; }
}

function musterExists(Game) {
  try {
    if (typeof Game.titanMusterState === 'function') return !!Game.titanMusterState('herald');
    const st = ((Game.state || {}).titans || {});
    return !!((st.musters || {}).herald);
  } catch (e) { return false; }
}

function key(x, y) { return x + ',' + y; }

// BFS over orthogonal adjacent steps. An edge (from -> neighbor) is
// passable iff it is not in refusedEdges AND Game.travelBlockage
// (neighbor, from) returns null AND the neighbor tile exists
// (tileAt non-null — ungenerated beyond ground is never planned
// through: looking must not create ground). Neighbors expand in
// (Manhattan-to-lair, x, y) order, so the path is deterministic and
// shortest. Returns the path as [{x,y}, ...] from start-exclusive to
// lair-inclusive, or null when no walkable path exists.
function findDetourPath(Game, sx, sy, hx, hy, refusedEdges) {
  try {
    const N = (Game.map && Game.map.worldSize) || 9;
    const x0 = Math.min(0, sx, hx), x1 = Math.max(N - 1, sx, hx);
    const y0 = Math.min(0, sy, hy), y1 = Math.max(N - 1, sy, hy);
    const prev = {};
    prev[key(sx, sy)] = null;
    const q = [[sx, sy]];
    while (q.length) {
      const cur = q.shift();
      const cx = cur[0], cy = cur[1];
      if (cx === hx && cy === hy) break;
      const nbs = [];
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + d[0], ny = cy + d[1];
        if (nx < x0 || nx > x1 || ny < y0 || ny > y1) continue;
        if (key(nx, ny) in prev) continue;
        nbs.push([nx, ny]);
      }
      nbs.sort((a, b) => {
        const da = Math.abs(a[0] - hx) + Math.abs(a[1] - hy);
        const db = Math.abs(b[0] - hx) + Math.abs(b[1] - hy);
        if (da !== db) return da - db;
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
      });
      for (const nb of nbs) {
        const nx = nb[0], ny = nb[1];
        let tile = null;
        try { tile = Game.tileAt(nx, ny); } catch (e) { tile = null; }
        if (!tile) continue;
        if (refusedEdges && refusedEdges.has(key(cx, cy) + '->' + key(nx, ny))) continue;
        let blocked = true;
        try { blocked = !!Game.travelBlockage(nx, ny, cx, cy); } catch (e) { blocked = true; }
        if (blocked) continue;
        prev[key(nx, ny)] = [cx, cy];
        q.push([nx, ny]);
      }
    }
    if (!(key(hx, hy) in prev)) return null;
    const path = [];
    let cur = [hx, hy];
    while (cur && !(cur[0] === sx && cur[1] === sy)) {
      path.unshift({ x: cur[0], y: cur[1] });
      cur = prev[key(cur[0], cur[1])];
    }
    return path;
  } catch (e) {
    return null;
  }
}

// One march day's walk. Returns a record: { steps, arrived, way,
// path, refusals, bridgeUsed, bridgeBlocked, swimmer, error }.
// way: 'detour' | 'bridge' | 'swimmer' | null (not arrived).
// refusedEdges lives on ctx (per run) so a creek refused on day N is
// never re-tried on day N+1; a cleared tree edge stays refused until
// ... it stays refused (conservative: a refused edge is re-probed
// only by a fresh run — the tree-clear case is a documented blank,
// not silently retried).
function detourMarch(Game, hx, hy, st) {
  const rec = { steps: 0, arrived: false, way: null, path: [],
    refusals: [], bridgeUsed: null, bridgeBlocked: null,
    swimmer: false, error: null };
  try {
    try { rec.swimmer = !!Game.hasAbility('swimmer'); } catch (e) { rec.swimmer = false; }
    st.refusedEdges = st.refusedEdges || new Set();
    // Serialize the Set for JSON records (driver reads rec, not st).
    const refused = st.refusedEdges;
    let replans = 0;
    let hopsUsed = 0;
    const walked = [];
    let bridgedThisMarch = false;
    for (;;) {
      const here = scholarTile(Game);
      if (!here) { rec.error = 'no-scholar-tile'; break; }
      if (here.x === hx && here.y === hy) { rec.arrived = true; break; }
      if (hopsUsed >= 20) { rec.error = 'hop-cap-20'; break; }
      let path = findDetourPath(Game, here.x, here.y, hx, hy, refused);
      if (!path) {
        if (bridgedThisMarch) break; // already bridged once; no path is honest
        // BRIDGE FALLBACK: adjacent needsBridge creek on a shortest
        // line to the lair, scholar standing next to it (sees it).
        let best = null;
        try {
          for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = here.x + d[0], ny = here.y + d[1];
            let tl = null;
            try { tl = Game.tileAt(nx, ny); } catch (e) { tl = null; }
            if (!tl || tl.type !== 'creek' || !tl.needsBridge || tl.bridged) continue;
            const dd = Math.abs(nx - hx) + Math.abs(ny - hy);
            if (!best || dd < best.d || (dd === best.d && (nx < best.x || (nx === best.x && ny < best.y)))) {
              best = { x: nx, y: ny, d: dd };
            }
          }
        } catch (e) { best = null; }
        if (!best) break;
        let wood = 0;
        try { wood = Game.woodCount(); } catch (e) { wood = 0; }
        if (wood < 4) { rec.bridgeBlocked = { tile: { x: best.x, y: best.y }, wood: wood }; break; }
        let ok = false;
        try { ok = !!Game.buildBridge(best.x, best.y); } catch (e) { ok = false; }
        if (!ok) { rec.bridgeBlocked = { tile: { x: best.x, y: best.y }, wood: wood, buildFailed: true }; break; }
        rec.bridgeUsed = { x: best.x, y: best.y };
        st.bridgesBuilt = st.bridgesBuilt || [];
        st.bridgesBuilt.push({ x: best.x, y: best.y, day: gday(Game) });
        bridgedThisMarch = true;
        continue; // re-plan over the new bridge
      }
      // Walk the path hop by hop; a refusal re-plans from here.
      let refusedHop = false;
      for (const step of path) {
        if (hopsUsed >= 20) break;
        const px0 = Game.map.px, py0 = Game.map.py;
        let r = null;
        try { r = Game.travelTo(step.x, step.y); } catch (e) { r = null; rec.error = String(e.message).slice(0, 120); }
        if (Game.map.px === px0 && Game.map.py === py0) {
          const bt = (r && typeof r === 'object') ? (r.blockType || r.kind || null) : null;
          refused.add(key(px0, py0) + '->' + key(step.x, step.y));
          rec.refusals.push({ from: { x: px0, y: py0 }, to: { x: step.x, y: step.y }, blockType: bt });
          refusedHop = true;
          break;
        }
        walked.push({ x: step.x, y: step.y });
        hopsUsed++;
        rec.steps++;
        if (Game.over || Game.tbfight) break;
        if (Game.map.px === hx && Game.map.py === hy) break;
      }
      if (Game.map.px === hx && Game.map.py === hy) { rec.arrived = true; break; }
      if (Game.over || Game.tbfight) break;
      if (!refusedHop) break; // path walked fully without arriving: give up honestly
      replans++;
      if (replans > 3) { rec.error = 'replan-cap-3'; break; }
    }
    rec.path = walked;
    if (rec.arrived) {
      const overOldBridge = (st.bridgesBuilt || []).some(function (b) {
        return walked.some(function (s) { return s.x === b.x && s.y === b.y; });
      });
      if (rec.bridgeUsed || overOldBridge) {
        rec.way = 'bridge';
      } else {
        // Swimmer-assisted iff the walked path steps on a needsBridge
        // creek tile (BFS only lets those edges through for a swimmer,
        // or over a bridge built in an EARLIER march — bridged tiles
        // are recorded separately below).
        let steppedNB = false;
        try {
          for (const s of walked) {
            const tl = Game.tileAt(s.x, s.y);
            if (tl && tl.type === 'creek' && tl.needsBridge && !tl.bridged) { steppedNB = true; break; }
          }
        } catch (e) { steppedNB = false; }
        rec.way = (steppedNB && rec.swimmer) ? 'swimmer' : 'detour';
      }
    }
    return rec;
  } catch (e) {
    rec.error = String((e && e.message) || e).slice(0, 120);
    return rec;
  }
}

function withCreekDetour(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'creekdetour',
    desc: desc || 'creekdetour: BFS detour march to heard lair + sound the call once',
    setup(Game, ctx) {
      if (base.setup) {
        try { base.setup(Game, ctx); } catch (e) { ctx.creekSetupErr = String(e.message).slice(0, 120); }
      }
      // HEARING, not reading: wrap Game.say and record ONLY the anchored
      // lair line (and the call line, for bookkeeping). Every other line
      // passes through untouched and is never used for decisions.
      const st = { lair: null, callHeard: false, errors: [] };
      ctx.creekdetour = st;
      try {
        const origSay = Game.say;
        Game.say = function () {
          try {
            const arg = arguments.length ? arguments[0] : null;
            if (typeof arg === 'string') {
              const lm = LAIR_RE.exec(arg);
              if (lm && !st.lair) st.lair = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
              if (CALL_RE.test(arg)) st.callHeard = true;
            }
          } catch (e) { st.errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
          return origSay.apply(this, arguments);
        };
      } catch (e) { st.errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
    },
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.creekBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const st = ctx.creekdetour || (ctx.creekdetour = { lair: null, callHeard: false, errors: [] });
      if (!st.lair || slain(Game)) return;
      if (Game.over || Game.tbfight) return;
      // GUARDRAILS (identical to titanroute.js): march only fed,
      // watered, healthy. A starving march would suicide the village
      // and prove nothing about routing.
      let s = null;
      try { s = Game.state.scholar; } catch (e) { return; }
      if (!s) return;
      let cap = 2000;
      try { cap = Game.kcalCap() || 2000; } catch (e) { /* keep default */ }
      const fed = (s.kcal || 0) > cap * 0.5;
      const watered = (s.hydration || 0) > 45;
      const hp = (s.hp != null ? s.hp : (s.health != null ? s.health : 100));
      const healthy = hp > (s.maxHp || 100) * 0.5;
      if (!fed || !watered || !healthy) {
        st.lastGuardBlock = { day: gday(Game), fed: fed, watered: watered, healthy: healthy };
        return;
      }
      const here = scholarTile(Game);
      if (!here) return;
      const atLair = here.x === st.lair.x && here.y === st.lair.y;
      let marchRec = null;
      if (!atLair) {
        marchRec = detourMarch(Game, st.lair.x, st.lair.y, st);
        const now = scholarTile(Game);
        const arrived = !!(now && now.x === st.lair.x && now.y === st.lair.y);
        marchRec.arrived = marchRec.arrived && arrived;
        st.marches = st.marches || [];
        st.marches.push(Object.assign({ day: gday(Game), from: here }, marchRec));
        if (!arrived) return;
      } else {
        st.marches = st.marches || [];
        st.marches.push({ day: gday(Game), from: here, steps: 0, arrived: true, way: 'already-there', path: [], refusals: [], bridgeUsed: null, bridgeBlocked: null, swimmer: false, error: null, alreadyThere: true });
      }
      // ARRIVED (or already camped): sound the call once, if no muster.
      // Identical rule to titanroute.js.
      if (st.called) return;
      if (musterExists(Game)) { st.called = 'preexisting-muster'; return; }
      if (typeof Game.soundTitanCall !== 'function') {
        st.callError = 'soundTitanCall missing';
        return;
      }
      try {
        const r = Game.soundTitanCall('herald');
        st.called = { day: gday(Game), result: r == null ? 'null (nothing located)' : 'sounded' };
        if (r == null) st.called = null; // nothing located: stay unsounded, retry another night
      } catch (e) {
        st.callError = String(e.message).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withCreekDetour, detourMarch, findDetourPath, LAIR_RE };
