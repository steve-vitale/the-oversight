#!/usr/bin/env node
// test-havendrink-20261015.js — HAVENDRINK mechanism proof + lever pilot
// (loop B ARM 2, 2026-10-15, sim-findings #320: at-haven dehydration with
// full cistern).
//
// PART 1 (mechanism, REAL RED): the s606 d51 autopsy. belongseek s606's
// Nathan Costa died AT HAVEN (neverAway, dist 1) with pack=0, cistern=20.
// drinkSafe (competent.js) gates fills on Game.playerAtHaven() (Manhattan
// dist <= 1), but Game.fillWater() gates on (location==='haven' — DEAD CODE,
// location is 'village'|'wilds' — OR playerTile().type==='haven'). The
// fixture parks the scholar at (a) the haven tile, (b) an adjacent tile
// (dist 1, the playerAtHaven boundary), (c) haven tile with a heavy pack,
// and calls the honest Game.fillWater(), capturing the say-beat. RED =
// the dist-1 fill refuses "No water here" while the policy gate says fill.
// PART 2 (det-gate): HAVENDRINK=1 vs gate-off byte-identical trajectories.
// PART 3 (SMOKE): layer fires without errors.
//
// Node harness: full src/js list in index.html order (minus DOM-only),
// Math.random seeded BEFORE eval (sim-harness loadGame). Never stub Game.save.
// Usage: node scripts/test-havendrink-20261015.js
//        SMOKE=1 node scripts/test-havendrink-20261015.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let nPass = 0, nFail = 0;
function check(name, cond, extra) {
  if (cond) { nPass++; console.log('  PASS ' + name); }
  else { nFail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// capture Game.say beats into an array; returns restore()
function captureSay(Game) {
  const beats = [];
  const orig = Game.say.bind(Game);
  Game.say = function (msg) { try { beats.push(String(msg)); } catch (e) {} return orig.apply(this, arguments); };
  return { beats, restore() { Game.say = orig; } };
}

function havenXY(Game) {
  const v = Game.state.village || {};
  return { hx: v.px != null ? v.px : 4, hy: v.py != null ? v.py : 4 };
}
function cisternClean(Game) {
  return Math.floor((((Game.state.village || {}).water) || {}).clean || 0);
}
function packN(Game) { return ((Game.state.scholar || {}).water || []).length; }
function ensureCistern(Game, liters) {
  Game.state.village.water = Game.state.village.water || { clean: 0, dirty: 0 };
  Game.state.village.water.clean = liters;
}
function lightPack(Game) {
  // empty the pack of water and drop carry weight to ~0 so canCarry passes
  Game.state.scholar.water = [];
}

// PART 1: the at-haven fill gate on the live engine.
async function part1() {
  console.log('PART 1 — at-haven fillWater gate (the #320 mechanism)');
  const { Game } = await loadGame({ seed: 606, mode: 'havendrink-p1', fullTelemetry: false });
  await setupGame(Game);
  const { hx, hy } = havenXY(Game);
  const cap = captureSay(Game);

  // (a) ON the haven tile, cistern full, light pack — must fill.
  Game.map.px = hx; Game.map.py = hy; Game.location = 'village';
  Game.state.scholar.insideHaven = false; // on the grounds, like the courtship scholar
  ensureCistern(Game, 20); lightPack(Game);
  cap.beats.length = 0;
  await quietLog(async () => { Game.fillWater(); });
  const tileType = (() => { try { return Game.playerTile().type; } catch (e) { return 'ERR'; } })();
  check('haven tile type reads', tileType === 'haven', 'tileType=' + tileType);
  check('fill ON haven tile succeeds', packN(Game) === 1, 'pack=' + packN(Game) + ' beats=' + JSON.stringify(cap.beats.slice(-2)));
  check('cistern drawn down by the fill', cisternClean(Game) === 19, 'clean=' + cisternClean(Game));

  // (b) ADJACENT tile (dist 1 — inside the policy playerAtHaven() gate),
  // cistern full, light pack. The policy FIRES fillWater here; the engine?
  // pick a real adjacent tile (stay on-map)
  let ax = hx + 1, ay = hy;
  try {
    const t = Game.tileAt(ax, ay);
    if (!t) { ax = hx - 1; }
  } catch (e) { ax = hx - 1; }
  Game.map.px = ax; Game.map.py = ay;
  ensureCistern(Game, 20); lightPack(Game);
  const atHavenPolicy = (() => { try { return Game.playerAtHaven(); } catch (e) { return 'ERR'; } })();
  const adjType = (() => { try { return Game.playerTile().type; } catch (e) { return 'ERR'; } })();
  check('policy gate fires at dist 1', atHavenPolicy === true, 'playerAtHaven=' + atHavenPolicy);
  cap.beats.length = 0;
  await quietLog(async () => { Game.fillWater(); });
  const refusedNoWater = cap.beats.some(b => b.indexOf('No water here') >= 0);
  check('RED: dist-1 fill refused "No water here"', packN(Game) === 0 && refusedNoWater,
    'pack=' + packN(Game) + ' adjType=' + adjType + ' beats=' + JSON.stringify(cap.beats.slice(-1)));
  check('cistern untouched by refused fill', cisternClean(Game) === 20, 'clean=' + cisternClean(Game));

  // (c) ON the haven tile but pack too heavy — canCarry refusal is honest.
  Game.map.px = hx; Game.map.py = hy;
  ensureCistern(Game, 20); lightPack(Game);
  // make the pack heavy: push inventory weight past capacity
  const inv = Game.state.scholar.inventory || (Game.state.scholar.inventory = []);
  const heavyBefore = (() => { try { return Game.packWeight(); } catch (e) { return -1; } })();
  const capKg = (() => { try { return Game.packCapacity(); } catch (e) { return -1; } })();
  // add a 40kg stone-ish item if capacity allows distinguishing
  inv.push({ name: 'test boulder', kg: 500, qty: 1 });
  cap.beats.length = 0;
  await quietLog(async () => { Game.fillWater(); });
  const refusedHeavy = cap.beats.some(b => b.indexOf('Your pack is full') >= 0);
  check('heavy pack refuses honestly', packN(Game) === 0 && refusedHeavy,
    'pack=' + packN(Game) + ' weight=' + heavyBefore + ' cap=' + capKg + ' beats=' + JSON.stringify(cap.beats.slice(-1)));
  inv.pop();

  // (d) The location==='haven' branch is dead code in LIVE play: Game.location
  // is only ever 'village' (game.js:2723) or 'wilds' — grep finds no
  // assignment of 'haven' anywhere in src/js. So the tile-type check is the
  // SOLE live gate: the scholar must stand exactly on the haven tile.
  const liveLocation = Game.location;
  check("location is never 'haven' in live play (dead branch)", liveLocation !== 'haven',
    'location=' + liveLocation);
  Game.map.px = ax; Game.map.py = ay; // back to dist 1, live location value
  Game.location = 'village';
  ensureCistern(Game, 20); lightPack(Game);
  cap.beats.length = 0;
  await quietLog(async () => { Game.fillWater(); });
  const stillRefused = cap.beats.some(b => b.indexOf('No water here') >= 0);
  check('dist-1 + live location value: fill refused, cistern untouched',
    packN(Game) === 0 && stillRefused && cisternClean(Game) === 20,
    'pack=' + packN(Game) + ' beats=' + JSON.stringify(cap.beats.slice(-1)));

  cap.restore();
}

// PART 2: det-gate — gate-off must be byte-identical to the base policy.
// Structural (same references when off) + behavioral (40d day-hashes).
async function part2() {
  console.log('PART 2 — det-gate (gate-off byte-identical)');
  const GATE = process.env.HAVENDRINK === '1';
  // fresh requires: bust the cache so the gate is read honestly for THIS env
  for (const k of Object.keys(require.cache)) {
    if (k.endsWith('policies/havendrink.js')) delete require.cache[k];
  }
  let mod = null;
  try { mod = require('./policies/havendrink'); } catch (e) {}
  const { belongseek } = require('./policies/belongseek');
  if (!mod) {
    console.log('  SKIP det-gate (layer deleted per kill protocol — base-policy determinism only)');
  } else if (!GATE) {
    check('gate-off: exports ARE the base policy (same refs)', mod.havendrinkBelongseek === belongseek,
      'wrapped when it should be passthrough');
  } else {
    check('gate-on: exports are wrapped', mod.havendrinkBelongseek !== belongseek && !!mod.HAVENDRINK);
  }
  // Behavioral: 40d run under the current gate; day-hash twin determinism.
  async function runOnce() {
    // bust all policy caches for a clean load
    for (const k of Object.keys(require.cache)) {
      if (k.indexOf('policies/') >= 0) delete require.cache[k];
    }
    const m2 = (() => { try { return require('./policies/havendrink'); } catch (e) { return null; } })();
    const b2 = require('./policies/belongseek').belongseek;
    const policy = (process.env.HAVENDRINK === '1' && m2 && m2.havendrinkBelongseek) ? m2.havendrinkBelongseek : b2;
    const { Game } = await loadGame({ seed: 22, mode: 'havendrink-p2', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oed = Game.endDay.bind(Game);
    Game.endDay = function () { const r = oed.apply(this, arguments); try {
      const s = Game.state.scholar || {}, v = Game.state.village || {}, vw = v.water || {};
      hs.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
        (s.water || []).length, Math.floor(vw.clean || 0), (v.roster || []).length, Game.villagerId].join('|'));
    } catch (e) { hs.push('ERR'); } return r; };
    const pwrap = Object.assign({}, policy);
    const od = policy.daily;
    pwrap.daily = (G, ctx) => od(G, ctx);
    await quietLog(async () => { await runDays(Game, pwrap, { days: 40, sampleEvery: 10 }); });
    return hs.join('\n');
  }
  const a = await runOnce();
  const b = await runOnce();
  check('40d twin deterministic under current gate', a === b, 'hash lines ' + a.split('\n').length);
}

// PART 4: the layer fills where the base leaves the pack empty (the #320
// RED: base = dist-1 fill refused, pack 0 at full cistern; layer = walks to
// the well and fills to 3). The RED patch
// (~/workspace/havendrink-red-20261015.patch) neuters the walk-to-well step —
// with it applied this part must FAIL loud; restored, it passes.
async function part4() {
  console.log('PART 4 — layer fills where base leaves the pack empty');
  const { Game } = await loadGame({ seed: 606, mode: 'havendrink-p4', fullTelemetry: false });
  await setupGame(Game);
  for (const k of Object.keys(require.cache)) {
    if (k.endsWith('policies/havendrink.js')) delete require.cache[k];
  }
  let mod = null;
  try { mod = require('./policies/havendrink'); } catch (e) {}
  if (!mod) {
    console.log('  SKIP part4 (layer deleted per kill protocol — scripts/policies/havendrink.js absent)');
    return;
  }
  if (!mod.HAVENDRINK) {
    console.log('  SKIP part4 (layer gate off — run with HAVENDRINK=1 for the fill proof)');
    return;
  }
  const { hx, hy } = havenXY(Game);
  // park at dist 1 on a dry adjacent tile, empty pack, full cistern —
  // the Nathan Costa state.
  let ax = hx + 1, ay = hy;
  try { if (!Game.tileAt(ax, ay)) ax = hx - 1; } catch (e) { ax = hx - 1; }
  Game.map.px = ax; Game.map.py = ay; Game.location = 'village';
  Game.state.scholar.insideHaven = false;
  // cistern 30: above the 12-villager floor (2*11+2=24) so the commons gate
  // passes and the #320 fix (walk-to-well + fill) is what gets measured.
  Game.state.village.water = { clean: 30, dirty: 0 };
  Game.state.scholar.water = [];
  // plenty of villagers so the floor is meaningful but passable: 12 villagers
  // -> floor = 2*11+2 = 24 <= 30.
  const ctx = {};
  const cap = captureSay(Game);
  await quietLog(async () => { mod.havendrinkDawn(Game, ctx); });
  const onTile = (() => { try { return Game.playerTile().type === 'haven'; } catch (e) { return 'ERR'; } })();
  check('layer walked the scholar to the well', onTile === true, 'onTile=' + onTile);
  check('layer filled the pack to 3', packN(Game) === 3, 'pack=' + packN(Game));
  check('cistern drawn down honestly (30 -> 27)', cisternClean(Game) === 27, 'clean=' + cisternClean(Game));
  check('dawn log recorded the fill', !!(ctx._hdDawnLog && ctx._hdDawnLog.length === 1 && ctx._hdDawnLog[0].gained === 3),
    JSON.stringify(ctx._hdDawnLog));
  check('commons voice beat fired', cap.beats.some(b => b.indexOf('walk to the well') >= 0),
    JSON.stringify(cap.beats.slice(-2)));
  check('layer counter credited', (ctx.hd_filled_dawn || 0) === 3, 'hd_filled_dawn=' + ctx.hd_filled_dawn);
  cap.restore();

  // Floor honored: cistern below floor -> no draw, no walk.
  Game.map.px = ax; Game.map.py = ay;
  Game.state.village.water = { clean: 5, dirty: 0 }; // below floor 12
  Game.state.scholar.water = [];
  const ctx2 = {};
  await quietLog(async () => { mod.havendrinkDawn(Game, ctx2); });
  check('floor skip: no draw when cistern < floor', packN(Game) === 0 && cisternClean(Game) === 5,
    'pack=' + packN(Game) + ' clean=' + cisternClean(Game));
  check('floor skip recorded', (ctx2.hd_skipped_floor || 0) === 1, JSON.stringify(ctx2));
}

// PART 3: SMOKE — the layer loads, daily fires, no errors.
async function part3() {
  console.log('PART 3 — SMOKE');
  const { Game } = await loadGame({ seed: 11, mode: 'havendrink-p3', fullTelemetry: false });
  await setupGame(Game);
  let mod = null;
  try { mod = require('./policies/havendrink'); } catch (e) {}
  if (!mod) {
    console.log('  SKIP part3 (layer deleted per kill protocol — scripts/policies/havendrink.js absent)');
    return;
  }
  check('gate default OFF', mod.HAVENDRINK === false || process.env.HAVENDRINK === '1');
  const p = mod.havendrinkBelongseek;
  check('wrapped belongseek exported', !!(p && p.daily));
  let calls = 0;
  const pwrap = Object.assign({}, p);
  const od = p.daily;
  pwrap.daily = (G, ctx) => { calls++; return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, pwrap, { days: 15, sampleEvery: 5 }); });
  check('policy.daily fired >= 10x', calls >= 10, 'calls=' + calls);
}

async function main() {
  const smokeOnly = process.env.SMOKE === '1';
  await part1();
  if (process.env.PART1ONLY === '1') {
    console.log(`\nRESULT (part1 only): ${nPass} pass, ${nFail} fail`);
    process.exit(nFail ? 1 : 0);
  }
  if (!smokeOnly) { await part2(); }
  await part4();
  await part3();
  console.log(`\nRESULT: ${nPass} pass, ${nFail} fail`);
  process.exit(nFail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
