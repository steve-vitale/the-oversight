#!/usr/bin/env node
// test-creekdetour-b.js — unit proof for sim-creekdetour-b (Loop B
// fleshout-20261102T1030Z). Stub boards mirror the ENGINE's blockage
// semantics (creek needsBridge blocks unless bridged/swimmer; blockFrom
// guards ONE approach side), not the policy's hopes. No RNG, no harness,
// no Game.worldMonsters anywhere in the stub (perception audit).
// Usage: node scripts/test-creekdetour-b.js  (exit non-zero on failure)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CD = require(path.join(__dirname, 'policies', 'creekdetour'));

let pass = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  pass++;
  console.log('ok - ' + name);
}
function eq(name, a, b) {
  assert.deepStrictEqual(a, b, name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')');
  pass++;
  console.log('ok - ' + name);
}

// Minimal stub Game. tiles: map "x,y" -> {type, needsBridge, bridged,
// blockFrom}. travelBlockage mirrors game.js: blockFrom side match, then
// creek-needsBridge unless bridged or swimmer. travelTo moves ONLY on
// adjacent (d=1) hops whose edge is unblocked, returning the block
// object on refusal (game.js returns the blockage, undefined on success).
// travelTo refuses a hop listed in refuseOnce (then clears it) to model
// a blockage the BFS could not foresee.
function makeGame(spec) {
  const tiles = {};
  for (const k of Object.keys(spec.tiles || {})) tiles[k] = Object.assign({}, spec.tiles[k]);
  const calls = [];
  const G = {
    map: { px: spec.start.x, py: spec.start.y, worldSize: spec.size || 9 },
    state: { scholar: { day: 1, kcal: 1900, hydration: 90, health: 100, maxHp: 100 }, titans: {} },
    over: false, tbfight: null,
    _calls: calls, _tiles: tiles,
    tileAt(x, y) { calls.push(['tileAt', x, y]); return tiles[x + ',' + y] || null; },
    travelBlockage(x, y, fx, fy) {
      calls.push(['travelBlockage', x, y, fx, fy]);
      const dest = tiles[x + ',' + y];
      if (!dest) return null;
      const sx = (fx === undefined) ? this.map.px : fx;
      const sy = (fy === undefined) ? this.map.py : fy;
      const dx = Math.sign(x - sx), dy = Math.sign(y - sy);
      const bf = dest.blockFrom;
      if (bf && ((bf.dx !== 0 && bf.dx === -dx) || (bf.dy !== 0 && bf.dy === -dy))) {
        return { kind: 'blockage', blockType: bf.type, x, y };
      }
      if (dest.type === 'creek' && dest.needsBridge && !dest.bridged && !spec.swimmer) {
        return { kind: 'blockage', blockType: 'creek', x, y };
      }
      return null;
    },
    travelTo(x, y) {
      calls.push(['travelTo', x, y]);
      const fx = this.map.px, fy = this.map.py;
      if (Math.abs(x - fx) + Math.abs(y - fy) !== 1) return null;
      if (spec.refuseOnce && spec.refuseOnce.has(fx + ',' + fy + '->' + x + ',' + y)) {
        spec.refuseOnce.delete(fx + ',' + fy + '->' + x + ',' + y);
        return { kind: 'blockage', blockType: 'surprise', x, y };
      }
      const b = this.travelBlockage(x, y, fx, fy);
      if (b) return b;
      this.map.px = x; this.map.py = y;
      return undefined;
    },
    hasAbility() { calls.push(['hasAbility']); return !!spec.swimmer; },
    woodCount() { calls.push(['woodCount']); return spec.wood || 0; },
    buildBridge(x, y) {
      calls.push(['buildBridge', x, y]);
      const tl = tiles[x + ',' + y];
      if (!tl || !(tl.type === 'creek' && tl.needsBridge) || (spec.wood || 0) < 4) return false;
      spec.wood -= 4;
      tl.bridged = true;
      return true;
    },
    say() { calls.push(['say']); },
    kcalCap() { return 2000; },
    playerMonster() { return null; },
    soundTitanCall() { calls.push(['soundTitanCall']); return {}; },
    // NOTE: deliberately NO worldMonsters on this stub. Any policy read
    // of it would throw TypeError — the perception audit below relies
    // on the march succeeding without it.
  };
  return G;
}

function openTile(type) { return { type: type || 'forest_floor' }; }

// --- 1. 97307-shape board: greedy dies, detour arrives -----------------
(function () {
  // Home (4,4) haven; lair (7,4) grove, tree guards WEST only (dx=-1).
  // (5,4) needsBridge creek; (6,4) wetland (passable); (5,3) plain creek.
  // North row 3 all open from the west/north entries used.
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile('trail_edge'),
    '5,3': { type: 'creek' }, '6,3': openTile(),
    '7,3': openTile(), '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'wetland' },
    '7,4': { type: 'grove', blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles });
  const st = {};
  const rec = CD.detourMarch(G, 7, 4, st);
  ok('97307-shape: detour arrives', rec.arrived === true);
  eq('97307-shape: way is detour', rec.way, 'detour');
  eq('97307-shape: walked path', rec.path,
    [{ x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 7, y: 4 }]);
  ok('97307-shape: never steps on the creek (5,4)',
    !rec.path.some(p => p.x === 5 && p.y === 4));
  ok('97307-shape: no bridge used', rec.bridgeUsed === null);
  // Greedy regression on the SAME board: Manhattan-best jump target is
  // (6,4) (d=1 to lair); the engine's intermediate scan would refuse it
  // via (5,4) — modeled here by the stub's edge check on the direct
  // first hop the greedy walk would attempt through (5,4). The point of
  // this case is the detour's arrival, not a re-implementation of the
  // intermediate scan; the scan itself is proven by the replay trace
  // in the evidence (travelTo(6,4) -> {blockType:'creek', x:5, y:4}).
  eq('97307-shape: scholar ends on the lair', [G.map.px, G.map.py], [7, 4]);
})();

// --- 2. Refusal memory: unforeseen refusal re-plans --------------------
(function () {
  // Start (0,0), lair (2,0). North row is the short route but its first
  // hop refuses once (surprise); the south route (0,1)-(1,1)-(2,1)-(2,0)
  // must then carry the march.
  const tiles = {
    '0,0': openTile(), '1,0': openTile(), '2,0': openTile(),
    '0,1': openTile(), '1,1': openTile(), '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 0 }, tiles,
    refuseOnce: new Set(['0,0->1,0']) });
  const st = {};
  const rec = CD.detourMarch(G, 2, 0, st);
  ok('refusal: re-plan arrives after surprise refusal', rec.arrived === true);
  eq('refusal: refusal recorded', rec.refusals.length, 1);
  eq('refusal: refusal edge', rec.refusals[0].to, { x: 1, y: 0 });
  ok('refusal: re-planned path avoids the refused edge',
    !rec.path.some((p, i) => {
      const prev = i === 0 ? { x: 0, y: 0 } : rec.path[i - 1];
      return prev.x === 0 && prev.y === 0 && p.x === 1 && p.y === 0;
    }));
  eq('refusal: scholar ends on the lair', [G.map.px, G.map.py], [2, 0]);
})();

// --- 3. Bridge fallback: wall board, wood >= 4 --------------------------
(function () {
  // Creek column x=1, all needsBridge: no walkable path exists.
  const tiles = {
    '0,1': openTile(), '1,0': { type: 'creek', needsBridge: true },
    '1,1': { type: 'creek', needsBridge: true },
    '1,2': { type: 'creek', needsBridge: true }, '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 1 }, tiles, wood: 4 });
  const st = {};
  const rec = CD.detourMarch(G, 2, 1, st);
  ok('bridge: arrives over a built bridge', rec.arrived === true);
  eq('bridge: way is bridge', rec.way, 'bridge');
  eq('bridge: bridge tile is adjacent (1,1)', rec.bridgeUsed, { x: 1, y: 1 });
  ok('bridge: tile bridged', G._tiles['1,1'].bridged === true);
})();

// --- 4. Bridge gate: wall board, wood < 4 -> honest failure ------------
(function () {
  const tiles = {
    '0,1': openTile(), '1,0': { type: 'creek', needsBridge: true },
    '1,1': { type: 'creek', needsBridge: true },
    '1,2': { type: 'creek', needsBridge: true }, '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 1 }, tiles, wood: 3 });
  const st = {};
  const rec = CD.detourMarch(G, 2, 1, st);
  ok('bridge-gate: no arrival without 4 wood', rec.arrived === false);
  ok('bridge-gate: bridgeBlocked recorded with wood count',
    rec.bridgeBlocked !== null && rec.bridgeBlocked.wood === 3);
  ok('bridge-gate: nothing bridged', G._tiles['1,1'].bridged !== true);
})();

// --- 5. Swimmer lane: wall board, swimmer, no wood ----------------------
(function () {
  const tiles = {
    '0,1': openTile(), '1,0': { type: 'creek', needsBridge: true },
    '1,1': { type: 'creek', needsBridge: true },
    '1,2': { type: 'creek', needsBridge: true }, '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 1 }, tiles, wood: 0, swimmer: true });
  const st = {};
  const rec = CD.detourMarch(G, 2, 1, st);
  ok('swimmer: arrives through the creek', rec.arrived === true);
  eq('swimmer: way is swimmer', rec.way, 'swimmer');
  ok('swimmer: no bridge built', rec.bridgeUsed === null);
})();

// --- 6. No path, no wood, no swimmer -> honest failure, no crash --------
(function () {
  const tiles = {
    '0,1': openTile(), '1,0': { type: 'creek', needsBridge: true },
    '1,1': { type: 'creek', needsBridge: true },
    '1,2': { type: 'creek', needsBridge: true }, '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 1 }, tiles, wood: 0 });
  const st = {};
  const rec = CD.detourMarch(G, 2, 1, st);
  ok('no-path: no arrival, no error', rec.arrived === false && rec.error === null);
})();

// --- 7. Perception audit ------------------------------------------------
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': { type: 'creek' },
    '6,3': openTile(), '7,3': openTile(),
    '5,4': { type: 'creek', needsBridge: true }, '6,4': { type: 'wetland' },
    '7,4': { type: 'grove', blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles });
  const st = {};
  const rec = CD.detourMarch(G, 7, 4, st);
  ok('perception: routes with NO worldMonsters on the Game object',
    rec.arrived === true && !('worldMonsters' in G));
  const allowed = new Set(['tileAt', 'travelBlockage', 'travelTo', 'hasAbility', 'woodCount', 'buildBridge', 'say']);
  const bad = G._calls.filter(c => !allowed.has(c[0]));
  eq('perception: routing calls only allowed reads', bad, []);
  const srcRaw = fs.readFileSync(path.join(__dirname, 'policies', 'creekdetour.js'), 'utf8');
  // Comments may NAME the forbidden read (the header explains the law);
  // code must never CALL it. Strip //-comments before auditing.
  const src = srcRaw.split('\n').map(l => l.split('//')[0]).join('\n');
  ok('perception: policy code never calls worldMonsters',
    !src.includes('worldMonsters'));
  ok('perception: policy source never reads a live herald position',
    !src.includes('herald') || !/herald\.(tx|ty|px|py)/.test(src));
})();

// --- 8. Daily guardrails: unhealthy scholar does not march --------------
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': { type: 'creek' },
    '6,3': openTile(), '7,3': openTile(),
    '5,4': { type: 'creek', needsBridge: true }, '6,4': { type: 'wetland' },
    '7,4': { type: 'grove', blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles });
  G.state.scholar.health = 10; // hurt: guardrail must block
  const base = { daily() {}, setup() {} };
  const pol = CD.withCreekDetour(base, 'test-detour', 'x');
  const ctx = {};
  pol.setup(G, ctx);
  ctx.creekdetour.lair = { x: 7, y: 4 };
  pol.daily(G, ctx);
  ok('guardrail: hurt scholar records a guard block, marches none',
    ctx.creekdetour.lastGuardBlock !== undefined &&
    (ctx.creekdetour.marches || []).length === 0);
  eq('guardrail: scholar stays home', [G.map.px, G.map.py], [4, 4]);
})();

// --- 9. Daily happy path: fed/watered/healthy scholar marches + calls ---
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': { type: 'creek' },
    '6,3': openTile(), '7,3': openTile(),
    '5,4': { type: 'creek', needsBridge: true }, '6,4': { type: 'wetland' },
    '7,4': { type: 'grove', blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles });
  const base = { daily() {}, setup() {} };
  const pol = CD.withCreekDetour(base, 'test-detour', 'x');
  const ctx = {};
  pol.setup(G, ctx);
  ctx.creekdetour.lair = { x: 7, y: 4 };
  pol.daily(G, ctx);
  ok('daily: march arrives', (ctx.creekdetour.marches || [])[0].arrived === true);
  ok('daily: call sounded once on arrival',
    ctx.creekdetour.called !== undefined && ctx.creekdetour.called !== null);
  eq('daily: scholar ends on the lair', [G.map.px, G.map.py], [7, 4]);
})();

console.log(`CREEKDETOUR PROOF GREEN: ${pass} checks passed.`);
