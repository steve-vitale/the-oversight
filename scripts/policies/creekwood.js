// policies/creekwood.js — two-creek walls + wood gathering (Loop B
// fleshout-20261102T1155Z, arm sim-creekwood-a, axis scale-onramp).
// POLICY ONLY: zero src/js changes. Wraps a base policy's daily/setup;
// upkeep, fight, and everything else delegate untouched.
//
// BLANK TAKEN (1030Z closeout, scale-onramp blank #2): seed 97396,
// lair (6,4) IS itself a needsBridge creek tile, with (5,4) a second
// needsBridge creek. Creekdetour fails it twice over: (a) its bridge
// fallback bridges at most ONCE per march and only from an adjacent
// tile, so after bridging (5,4) it still finds no BFS path (the lair
// itself is gated) and stops; (b) woodCount = 0 on all 17
// bridge-eligible march days, so even the first bridge never fires.
// This policy adds two legs, measured separately:
//   (a) walk-toward-then-bridge: loop { BFS path -> walk it; no path
//       + adjacent unbridged needsBridge creek -> bridge it; no path
//       + no adjacent creek -> ADVANCE to the reachable tile strictly
//       closest (Manhattan) to the lair, then loop }. On 97396 that is:
//       bridge (5,4), advance onto it, bridge (6,4), step onto the lair.
//   (b) wood leg: at each bridge point (no path + adjacent unbridged
//       creek + wood < 4), top up to 4 via Game.takeWood() — the
//       engine's own verb (up to 4 logs from the village pile per
//       call, 2 kg each, carry-gated, no position gate in code) —
//       until wood >= 4 or a call adds nothing (pile empty or
//       carry-full, recorded from wood/pile deltas). Game.cutTree is
//       deliberately NOT used: it needs a grove tile + tree cell
//       within Chebyshev 1 of the scholar's micro-position and costs
//       a day-part, which a march-day leg cannot honestly drive.
//       If the pile is empty, the leg fails honestly (DIAG, not a fix).
// Detour BFS, refusal memory, swimmer lane, guardrails, and the
// sound-the-call-once rule are identical to creekdetour.js, so
// non-two-creek seeds behave the same except where a bridge point
// fires. No RNG is consumed (deterministic tie-breaks).
//
// PERCEPTION LAW (load-bearing, same as creekdetour.js): the policy
// NEVER reads Game.worldMonsters() or any monster roster. Routing
// reads ONLY: its own tile, entry-specific travelBlockage, map tiles
// the BFS steps onto (board terrain the player sees on the 9x9
// board), the heard lair (scouts' say line), tile-sharing seen with
// its own eyes (Game.playerMonster(), arrival/call logic only), its
// own wood count + its own village's pile size (takeWood gate only),
// and its own swimmer ability. The march target is ALWAYS the heard
// lair tile — never a live herald position.
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

function woodNow(Game) {
  try { return Game.woodCount(); } catch (e) { return 0; }
}

function pileNow(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return (v.wood === undefined ? null : v.wood);
  } catch (e) { return null; }
}

// BFS flood from (sx,sy) over entry-specific travelBlockage edges,
// skipping refused edges and non-existent tiles. Returns { prev } where
// prev maps "x,y" -> [px,py] | null (start). Neighbors expand in
// (Manhattan-to-lair, x, y) order, so paths are deterministic.
function bfsFlood(Game, sx, sy, hx, hy, refusedEdges) {
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
  return { prev: prev };
}

function pathFromPrev(prev, sx, sy, tx, ty) {
  if (!(key(tx, ty) in prev)) return null;
  const path = [];
  let cur = [tx, ty];
  while (cur && !(cur[0] === sx && cur[1] === sy)) {
    path.unshift({ x: cur[0], y: cur[1] });
    cur = prev[key(cur[0], cur[1])];
  }
  return path;
}

function findPath(Game, sx, sy, hx, hy, refusedEdges) {
  try {
    const flood = bfsFlood(Game, sx, sy, hx, hy, refusedEdges);
    return pathFromPrev(flood.prev, sx, sy, hx, hy);
  } catch (e) {
    return null;
  }
}

// Adjacent unbridged needsBridge creek minimizing Manhattan to lair
// (tie: x, then y), or null. The scholar sees adjacent tiles.
function adjacentCreek(Game, here, hx, hy) {
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
  return best;
}

// Wood leg at a bridge point: top up to 4 via takeWood until no gain
// (at most 3 calls — each takes min(4, pile), so a second call after a
// partial take can only fire on an empty pile, i.e. no gain).
// Appends attempts to rec.woodLeg; returns the final wood count.
function woodLeg(Game, rec) {
  const attempts = [];
  try {
    if (typeof Game.takeWood !== 'function') {
      attempts.push({ reason: 'no-takeWood', woodBefore: woodNow(Game), woodAfter: woodNow(Game), pileBefore: pileNow(Game), pileAfter: pileNow(Game) });
      rec.woodLeg = (rec.woodLeg || []).concat(attempts);
      return woodNow(Game);
    }
    for (let i = 0; i < 3; i++) {
      const wb = woodNow(Game), pb = pileNow(Game);
      if (wb >= 4) break;
      try { Game.takeWood(); } catch (e) { /* takeWood narrates its own refusal */ }
      const wa = woodNow(Game), pa = pileNow(Game);
      attempts.push({ woodBefore: wb, woodAfter: wa, pileBefore: pb, pileAfter: pa });
      if (wa <= wb) break; // pile empty or carry-full: no gain, stop honestly
      if (wa >= 4) break;
    }
  } catch (e) {
    attempts.push({ reason: 'woodLeg-error:' + String(e.message).slice(0, 80) });
  }
  rec.woodLeg = (rec.woodLeg || []).concat(attempts);
  return woodNow(Game);
}

// Walk a hop path; returns { walked, refusedHop }. A hop that leaves
// the scholar unmoved records the refused edge in st.refusedEdges.
function walkPath(Game, path, st, rec) {
  const walked = [];
  let refusedHop = false;
  for (const step of path) {
    if (rec.steps >= 20) break;
    const px0 = Game.map.px, py0 = Game.map.py;
    let r = null;
    try { r = Game.travelTo(step.x, step.y); } catch (e) { r = null; rec.error = String(e.message).slice(0, 120); }
    if (Game.map.px === px0 && Game.map.py === py0) {
      const bt = (r && typeof r === 'object') ? (r.blockType || r.kind || null) : null;
      st.refusedEdges.add(key(px0, py0) + '->' + key(step.x, step.y));
      rec.refusals.push({ from: { x: px0, y: py0 }, to: { x: step.x, y: step.y }, blockType: bt });
      refusedHop = true;
      break;
    }
    walked.push({ x: step.x, y: step.y });
    rec.steps++;
    if (Game.over || Game.tbfight) break;
    if (Game.map.px === step.x && Game.map.py === step.y) {
      // keep walking the path
    } else {
      break; // moved somewhere unexpected: stop honestly
    }
  }
  return { walked: walked, refusedHop: refusedHop };
}

// One march day's walk. Returns a record: { steps, arrived, way,
// path, refusals, bridgesUsed, bridgeBlocked, woodLeg, advances,
// swimmer, stuck, error }.
// way: 'detour' | 'bridge' | 'swimmer' | null (not arrived).
function creekwoodMarch(Game, hx, hy, st) {
  const rec = { steps: 0, arrived: false, way: null, path: [],
    refusals: [], bridgesUsed: [], bridgeBlocked: null, woodLeg: [],
    advances: [], swimmer: false, stuck: null, error: null };
  try {
    try { rec.swimmer = !!Game.hasAbility('swimmer'); } catch (e) { rec.swimmer = false; }
    st.refusedEdges = st.refusedEdges || new Set();
    st.bridgesBuilt = st.bridgesBuilt || [];
    const refused = st.refusedEdges;
    const walked = [];
    let replans = 0;
    for (let round = 0; round < 8; round++) {
      const here = scholarTile(Game);
      if (!here) { rec.error = 'no-scholar-tile'; break; }
      if (here.x === hx && here.y === hy) { rec.arrived = true; break; }
      if (rec.steps >= 20) { rec.error = 'hop-cap-20'; break; }
      const path = findPath(Game, here.x, here.y, hx, hy, refused);
      if (path) {
        const w = walkPath(Game, path, st, rec);
        for (const s of w.walked) walked.push(s);
        const now = scholarTile(Game);
        if (now && now.x === hx && now.y === hy) { rec.arrived = true; break; }
        if (Game.over || Game.tbfight) break;
        if (!w.refusedHop) break; // walked fully without arriving: honest stop
        replans++;
        if (replans > 3) { rec.error = 'replan-cap-3'; break; }
        continue;
      }
      // NO PATH: bridge point or advance.
      const creek = adjacentCreek(Game, here, hx, hy);
      if (creek) {
        let wood = woodNow(Game);
        if (wood < 4) wood = woodLeg(Game, rec);
        if (wood < 4) { rec.bridgeBlocked = { tile: { x: creek.x, y: creek.y }, wood: wood }; break; }
        let ok = false;
        try { ok = !!Game.buildBridge(creek.x, creek.y); } catch (e) { ok = false; }
        if (!ok) { rec.bridgeBlocked = { tile: { x: creek.x, y: creek.y }, wood: wood, buildFailed: true }; break; }
        rec.bridgesUsed.push({ x: creek.x, y: creek.y });
        st.bridgesBuilt.push({ x: creek.x, y: creek.y, day: gday(Game) });
        continue; // re-plan over the new bridge
      }
      // No adjacent creek to bridge: ADVANCE to the reachable tile
      // strictly closest (Manhattan) to the lair, then loop so the
      // next creek becomes adjacent. Strictly-closer guarantees
      // termination (no advance loop can revisit a distance).
      let flood = null;
      try { flood = bfsFlood(Game, here.x, here.y, hx, hy, refused); } catch (e) { flood = null; }
      if (!flood) { rec.stuck = 'flood-error'; break; }
      const curD = Math.abs(here.x - hx) + Math.abs(here.y - hy);
      let best = null, bestD = curD;
      for (const k of Object.keys(flood.prev)) {
        const parts = k.split(',');
        const tx = parseInt(parts[0], 10), ty = parseInt(parts[1], 10);
        if (tx === here.x && ty === here.y) continue;
        const dd = Math.abs(tx - hx) + Math.abs(ty - hy);
        // Strictly-closer only (bestD starts at curD and only shrinks):
        // a tie re-ranks an already strictly-closer tile, never admits
        // a non-closer one.
        if (best && dd === bestD && (tx < best.x || (tx === best.x && ty < best.y))) {
          best = { x: tx, y: ty };
        } else if (dd < bestD) {
          best = { x: tx, y: ty }; bestD = dd;
        }
      }
      if (!best) { rec.stuck = 'no-advance'; break; }
      const advPath = pathFromPrev(flood.prev, here.x, here.y, best.x, best.y);
      if (!advPath) { rec.stuck = 'no-advance-path'; break; }
      const w = walkPath(Game, advPath, st, rec);
      for (const s of w.walked) walked.push(s);
      const now2 = scholarTile(Game);
      if (now2 && now2.x === hx && now2.y === hy) { rec.arrived = true; break; }
      if (Game.over || Game.tbfight) break;
      if (w.refusedHop) {
        replans++;
        if (replans > 3) { rec.error = 'replan-cap-3'; break; }
        continue;
      }
      if (now2 && now2.x === best.x && now2.y === best.y) {
        rec.advances.push({ x: best.x, y: best.y });
        continue;
      }
      rec.stuck = 'advance-shortfall';
      break;
    }
    rec.path = walked;
    if (rec.arrived) {
      const overOurBridge = (st.bridgesBuilt || []).some(function (b) {
        return walked.some(function (s) { return s.x === b.x && s.y === b.y; });
      });
      if (overOurBridge) {
        rec.way = 'bridge';
      } else {
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

function withCreekwood(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'creekwood',
    desc: desc || 'creekwood: walk-toward-then-bridge march + takeWood leg + sound the call once',
    setup(Game, ctx) {
      if (base.setup) {
        try { base.setup(Game, ctx); } catch (e) { ctx.creekSetupErr = String(e.message).slice(0, 120); }
      }
      const st = { lair: null, callHeard: false, errors: [] };
      ctx.creekwood = st;
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
      const st = ctx.creekwood || (ctx.creekwood = { lair: null, callHeard: false, errors: [] });
      if (!st.lair || slain(Game)) return;
      if (Game.over || Game.tbfight) return;
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
        marchRec = creekwoodMarch(Game, st.lair.x, st.lair.y, st);
        const now = scholarTile(Game);
        const arrived = !!(now && now.x === st.lair.x && now.y === st.lair.y);
        marchRec.arrived = marchRec.arrived && arrived;
        st.marches = st.marches || [];
        st.marches.push(Object.assign({ day: gday(Game), from: here }, marchRec));
        if (!arrived) return;
      } else {
        st.marches = st.marches || [];
        st.marches.push({ day: gday(Game), from: here, steps: 0, arrived: true, way: 'already-there', path: [], refusals: [], bridgesUsed: [], bridgeBlocked: null, woodLeg: [], advances: [], swimmer: false, stuck: null, error: null, alreadyThere: true });
      }
      if (st.called) return;
      if (musterExists(Game)) { st.called = 'preexisting-muster'; return; }
      if (typeof Game.soundTitanCall !== 'function') {
        st.callError = 'soundTitanCall missing';
        return;
      }
      try {
        const r = Game.soundTitanCall('herald');
        st.called = { day: gday(Game), result: r == null ? 'null (nothing located)' : 'sounded' };
        if (r == null) st.called = null;
      } catch (e) {
        st.callError = String(e.message).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withCreekwood, creekwoodMarch, findPath, bfsFlood, LAIR_RE };
