#!/usr/bin/env node
// test-creekwood-a.js — unit proof for sim-creekwood-a (Loop B
// fleshout-20261102T1155Z). Stub boards mirror the ENGINE's blockage
// semantics (creek needsBridge blocks unless bridged/swimmer; blockFrom
// guards ONE approach side), not the policy's hopes. No RNG, no harness,
// no Game.worldMonsters anywhere in the stub (perception audit).
// Usage: node scripts/test-creekwood-a.js  (exit non-zero on failure)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CW = require(path.join(__dirname, 'policies', 'creekwood'));

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

// Minimal stub Game, same semantics as test-creekdetour-b.js, plus:
// takeWood (min(4, pile), carry-gated at 8 logs = 16kg vs capacity
// spec.carryCap logs, tick-free here) and a village pile on state.
function makeGame(spec) {
  const tiles = {};
  for (const k of Object.keys(spec.tiles || {})) tiles[k] = Object.assign({}, spec.tiles[k]);
  const calls = [];
  const G = {
    map: { px: spec.start.x, py: spec.start.y, worldSize: spec.size || 9 },
    state: { scholar: { day: 1, kcal: 1900, hydration: 90, health: 100, maxHp: 100 },
      titans: {}, village: { wood: (spec.pile === undefined ? 0 : spec.pile) } },
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
    takeWood() {
      calls.push(['takeWood']);
      const pile = this.state.village.wood || 0;
      if (pile < 1) return null;
      const n = Math.min(4, pile);
      const cap = (spec.carryCap === undefined ? 99 : spec.carryCap);
      if ((spec.wood || 0) + n > cap) return null; // carry-full: no gain
      this.state.village.wood -= n;
      spec.wood = (spec.wood || 0) + n;
      return null; // engine takeWood returns null on success too
    },
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

// --- 1. 97396-shape: lair tile itself a creek + second creek ---------
(function () {
  // Home (4,4); (5,4) needsBridge creek; lair (6,4) needsBridge creek.
  // North/south rows open so a detour BFS still cannot enter the lair
  // (the lair tile itself refuses entry from every side).
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': openTile(),
    '6,3': openTile(), '4,5': openTile(), '5,5': openTile(),
    '6,5': openTile(), '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'creek', needsBridge: true },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 8 });
  const st = {};
  const rec = CW.creekwoodMarch(G, 6, 4, st);
  ok('97396-shape: arrives', rec.arrived === true);
  eq('97396-shape: way is bridge', rec.way, 'bridge');
  eq('97396-shape: two bridges built', rec.bridgesUsed,
    [{ x: 5, y: 4 }, { x: 6, y: 4 }]);
  eq('97396-shape: walked path crosses both bridges', rec.path,
    [{ x: 5, y: 4 }, { x: 6, y: 4 }]);
  ok('97396-shape: advance step recorded', rec.advances.length === 1 &&
    rec.advances[0].x === 5 && rec.advances[0].y === 4);
  ok('97396-shape: wood leg fired (pile 8 -> 0)', rec.woodLeg.length >= 2 &&
    rec.woodLeg[0].woodAfter === 4 && G.state.village.wood === 0);
  eq('97396-shape: scholar ends on the lair', [G.map.px, G.map.py], [6, 4]);
})();

// --- 1b. 97396-shape + sideways creek: never bridge the useless one ---
(function () {
  // Same as case 1, plus (4,3) a needsBridge creek adjacent to home
  // that lies on NO route to the lair (the pre-pool smoke run bridged
  // it, spending 4 wood for nothing). The ordered rule must bridge
  // only (5,4) and (6,4): (4,3) is farther from the lair than the
  // scholar, so the advance onto (5,4) must outrank it.
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': { type: 'creek', needsBridge: true },
    '5,3': openTile(), '6,3': openTile(), '4,5': openTile(),
    '5,5': openTile(), '6,5': openTile(),
    '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'creek', needsBridge: true },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 8 });
  const st = {};
  const rec = CW.creekwoodMarch(G, 6, 4, st);
  ok('sideways: arrives', rec.arrived === true);
  eq('sideways: exactly the two route bridges', rec.bridgesUsed,
    [{ x: 5, y: 4 }, { x: 6, y: 4 }]);
  ok('sideways: (4,3) never bridged', G._tiles['4,3'].bridged !== true);
  ok('sideways: exactly 8 logs spent (pile 8 -> 0)',
    G.state.village.wood === 0);
})();

// --- 2. Wood-starved honest failure: pile empty ------------------------
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': openTile(),
    '6,3': openTile(), '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'creek', needsBridge: true },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 0 });
  const st = {};
  const rec = CW.creekwoodMarch(G, 6, 4, st);
  ok('wood-starved: no arrival', rec.arrived === false);
  ok('wood-starved: bridgeBlocked with wood 0',
    rec.bridgeBlocked !== null && rec.bridgeBlocked.wood === 0);
  ok('wood-starved: wood leg recorded no-gain attempts',
    rec.woodLeg.length >= 1 && rec.woodLeg[0].woodAfter === 0);
  ok('wood-starved: nothing bridged', G._tiles['5,4'].bridged !== true);
  eq('wood-starved: scholar stays home', [G.map.px, G.map.py], [4, 4]);
})();

// --- 3. Carry-full honest failure --------------------------------------
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'creek', needsBridge: true },
    '4,3': openTile(), '5,3': openTile(), '6,3': openTile(),
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 8, carryCap: 2 });
  const st = {};
  const rec = CW.creekwoodMarch(G, 6, 4, st);
  ok('carry-full: no arrival', rec.arrived === false);
  ok('carry-full: bridgeBlocked recorded',
    rec.bridgeBlocked !== null && rec.bridgeBlocked.wood === 0);
})();

// --- 4. Single-creek wall with wood: bridge leg fires in one march -----
(function () {
  // Creek column x=1, all needsBridge: no walkable path exists.
  const tiles = {
    '0,1': openTile(), '1,0': { type: 'creek', needsBridge: true },
    '1,1': { type: 'creek', needsBridge: true },
    '1,2': { type: 'creek', needsBridge: true }, '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 1 }, tiles, wood: 4 });
  const st = {};
  const rec = CW.creekwoodMarch(G, 2, 1, st);
  ok('single-creek: arrives over a built bridge', rec.arrived === true);
  eq('single-creek: way is bridge', rec.way, 'bridge');
  eq('single-creek: bridge tile is adjacent (1,1)', rec.bridgesUsed, [{ x: 1, y: 1 }]);
  ok('single-creek: no wood leg needed (wood already 4)', rec.woodLeg.length === 0);
})();

// --- 5. Pure detour unchanged: 97307-shape, no wood leg, no bridge -----
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile('trail_edge'),
    '5,3': { type: 'creek' }, '6,3': openTile(),
    '7,3': openTile(), '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'wetland' },
    '7,4': { type: 'grove', blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 8 });
  const st = {};
  const rec = CW.creekwoodMarch(G, 7, 4, st);
  ok('detour: arrives', rec.arrived === true);
  eq('detour: way is detour', rec.way, 'detour');
  eq('detour: walked path', rec.path,
    [{ x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 7, y: 4 }]);
  ok('detour: wood leg never fires on a walkable path',
    rec.woodLeg.length === 0 && G.state.village.wood === 8);
  ok('detour: no bridge built', rec.bridgesUsed.length === 0);
})();

// --- 6. Refusal memory still works under creekwood ----------------------
(function () {
  const tiles = {
    '0,0': openTile(), '1,0': openTile(), '2,0': openTile(),
    '0,1': openTile(), '1,1': openTile(), '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 0 }, tiles,
    refuseOnce: new Set(['0,0->1,0']) });
  const st = {};
  const rec = CW.creekwoodMarch(G, 2, 0, st);
  ok('refusal: re-plan arrives after surprise refusal', rec.arrived === true);
  eq('refusal: refusal recorded', rec.refusals.length, 1);
  eq('refusal: refusal edge', rec.refusals[0].to, { x: 1, y: 0 });
})();

// --- 7. Swimmer lane unchanged ------------------------------------------
(function () {
  const tiles = {
    '0,1': openTile(), '1,0': { type: 'creek', needsBridge: true },
    '1,1': { type: 'creek', needsBridge: true },
    '1,2': { type: 'creek', needsBridge: true }, '2,1': openTile(),
  };
  const G = makeGame({ start: { x: 0, y: 1 }, tiles, wood: 0, swimmer: true });
  const st = {};
  const rec = CW.creekwoodMarch(G, 2, 1, st);
  ok('swimmer: arrives through the creek', rec.arrived === true);
  eq('swimmer: way is swimmer', rec.way, 'swimmer');
  ok('swimmer: no bridge built', rec.bridgesUsed.length === 0);
})();

// --- 8. Second bridge across march days (persistence) -------------------
(function () {
  // Day 1: pile has only 4 -> first bridge built, second blocked.
  // Day 2 (fresh march call, same st): pile refilled to 4 -> the
  // march walks the first bridge, bridges the lair, arrives.
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': openTile(),
    '6,3': openTile(), '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'creek', needsBridge: true },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 4 });
  const st = {};
  const r1 = CW.creekwoodMarch(G, 6, 4, st);
  ok('persist: day 1 no arrival (one bridge only)', r1.arrived === false);
  eq('persist: day 1 bridges', r1.bridgesUsed, [{ x: 5, y: 4 }]);
  G.state.village.wood = 4; // villagers restock the pile overnight
  G.map.px = 4; G.map.py = 4; // scholar starts the next march from home
  const r2 = CW.creekwoodMarch(G, 6, 4, st);
  ok('persist: day 2 arrives', r2.arrived === true);
  eq('persist: day 2 way is bridge', r2.way, 'bridge');
  ok('persist: day 2 walks the day-1 bridge',
    r2.path.some(p => p.x === 5 && p.y === 4));
})();

// --- 9. Perception audit -------------------------------------------------
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': openTile(),
    '6,3': openTile(), '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'creek', needsBridge: true },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 8 });
  const st = {};
  const rec = CW.creekwoodMarch(G, 6, 4, st);
  ok('perception: routes with NO worldMonsters on the Game object',
    rec.arrived === true && !('worldMonsters' in G));
  const allowed = new Set(['tileAt', 'travelBlockage', 'travelTo', 'hasAbility', 'woodCount', 'buildBridge', 'takeWood', 'say']);
  const bad = G._calls.filter(c => !allowed.has(c[0]));
  eq('perception: routing calls only allowed reads', bad, []);
  const srcRaw = fs.readFileSync(path.join(__dirname, 'policies', 'creekwood.js'), 'utf8');
  const src = srcRaw.split('\n').map(l => l.split('//')[0]).join('\n');
  ok('perception: policy code never calls worldMonsters',
    !src.includes('worldMonsters'));
  ok('perception: policy source never reads a live herald position',
    !src.includes('herald') || !/herald\.(tx|ty|px|py)/.test(src));
  // takeWood is called only at a bridge point, never on a detour path
  // (case 5 asserts the pile is untouched there); here the pile is
  // spent only because bridges were needed.
  ok('perception: takeWood fired only for bridges',
    G._calls.some(c => c[0] === 'takeWood') && rec.bridgesUsed.length === 2);
})();

// --- 10. Daily guardrails + happy path ----------------------------------
(function () {
  const tiles = {
    '4,4': { type: 'haven' }, '4,3': openTile(), '5,3': openTile(),
    '6,3': openTile(), '5,4': { type: 'creek', needsBridge: true },
    '6,4': { type: 'creek', needsBridge: true },
  };
  const G = makeGame({ start: { x: 4, y: 4 }, tiles, wood: 0, pile: 8 });
  G.state.scholar.health = 10;
  const base = { daily() {}, setup() {} };
  const pol = CW.withCreekwood(base, 'test-creekwood', 'x');
  const ctx = {};
  pol.setup(G, ctx);
  ctx.creekwood.lair = { x: 6, y: 4 };
  pol.daily(G, ctx);
  ok('guardrail: hurt scholar records a guard block, marches none',
    ctx.creekwood.lastGuardBlock !== undefined &&
    (ctx.creekwood.marches || []).length === 0);
  G.state.scholar.health = 100;
  pol.daily(G, ctx);
  ok('daily: march arrives', (ctx.creekwood.marches || [])[0].arrived === true);
  ok('daily: call sounded once on arrival',
    ctx.creekwood.called !== undefined && ctx.creekwood.called !== null);
  eq('daily: scholar ends on the lair', [G.map.px, G.map.py], [6, 4]);
})();

console.log(`CREEKWOOD PROOF GREEN: ${pass} checks passed.`);
