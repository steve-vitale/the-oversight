#!/usr/bin/env node
// test-rangerefill-20261015.js — proof test for the RANGING WATER-SAFETY
// layer (loop B r46b, ARM 3 = sim-rangerefill; sim-findings #292).
// scripts/policies/rangerefill.js, gate RANGEREFILL=1. Zero src/js changes.
//
// KILL-PROTOCOL DEGRADATION: if scripts/policies/rangerefill.js is absent
// (layer deleted per kill protocol) this file INFO-SKIPs (exit 0) — never
// MODULE_NOT_FOUND.
//
// MODE DISPATCH (the gate is process-wide env; the proof runs twice):
//   RANGEREFILL unset -> PART A (gate-off inert: named exports ARE the base
//     policy objects) + PART E-det (instrument neutrality: instrumented vs
//     pristine byte-identical, 40d, seeds 11/22).
//   RANGEREFILL=1    -> PART B (dawn top-up: haven dawn fills pack to full
//     from the well) + PART C (en-route fill: wrapped travelTo arrival on a
//     wetland fills) + PART D (gate fallback: empty pack + dry cistern ->
//     creek-haul) + PART E-smoke.
//   SMOKE=1          -> PART E only (either mode).
//
// RED-verification (never stash on the shared repo): patch
// ~/workspace/rangerefill-red-20261015.patch neuters topUpPack (the while
// condition can never fire); with it applied PARTs B/C/D must FAIL (real
// RED); restored, all GREEN. PART A is gate-off and unaffected by the patch.
//
// Usage:
//   node scripts/test-rangerefill-20261015.js                 # gate-off parts
//   RANGEREFILL=1 node scripts/test-rangerefill-20261015.js  # gate-on parts
//   SMOKE=1 node scripts/test-rangerefill-20261015.js        # PART E only
'use strict';

let RF;
try {
  RF = require('./policies/rangerefill');
} catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: scripts/policies/rangerefill.js absent (layer deleted per kill protocol) — nothing to prove.');
    process.exit(0);
  }
  throw e;
}

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');
const { installRouteTile } = require('./routetile-lib-20261015');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const { competent } = require('./policies/competent');

const GATE_ON = RF.RANGEREFILL === true;
const SMOKE_ONLY = process.env.SMOKE === '1';

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.error('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function packN(Game) { try { return (Game.state.scholar.water || []).length; } catch (e) { return null; } }
function atHaven(Game) { try { return !!Game.playerAtHaven(); } catch (e) { return false; } }
function havenXY(Game) {
  try { const v = Game.state.village || {}; return { hx: v.px != null ? v.px : 4, hy: v.py != null ? v.py : 4 }; }
  catch (e) { return { hx: 4, hy: 4 }; }
}
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}
// find a real wetland tile, else construct one adjacent to (px,py)
function ensureWetland(Game, px, py) {
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    try { if (Game.tileAt(x, y).type === 'wetland') return { x, y, real: true }; } catch (e) {}
  }
  const cands = [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]];
  for (const [x, y] of cands) {
    if (x < 0 || x > 8 || y < 0 || y > 8) continue;
    try {
      const t = Game.tileAt(x, y);
      if (t.type === 'haven') continue;
      t.type = 'wetland'; t.revealed = true;
      return { x, y, real: false };
    } catch (e) {}
  }
  return null;
}

// ---------------- PART A — gate-off inert ----------------
async function partA() {
  console.log('PART A — gate OFF: named exports are the base policies (inert)');
  check('gate reads OFF', GATE_ON === false, 'RANGEREFILL=' + process.env.RANGEREFILL);
  check('rangerefillLeadcourt === leadcourt (same object)', RF.rangerefillLeadcourt === leadcourt);
  check('rangerefillBelongseek === belongseek (same object)', RF.rangerefillBelongseek === belongseek);
  check('rangerefillCompetent === competent (same object)', RF.rangerefillCompetent === competent);
  // #69 unwrap: the named export carries a callable daily (the Object.assign
  // module-spread bug would give {leadcourt:{...}} with .daily undefined)
  check('#69 unwrap: leadcourt.daily is function', typeof RF.rangerefillLeadcourt.daily === 'function');
  check('#69 unwrap: belongseek.daily is function', typeof RF.rangerefillBelongseek.daily === 'function');
  check('no layer internals exported when off', RF.rangerefillDawn === undefined);
}

// ---------------- PART B — dawn top-up ----------------
async function partB() {
  console.log('PART B — dawn top-up: haven dawn fills the pack from the well (seed 11)');
  const { Game } = await loadGame({ seed: 11, mode: 'rangerefill-fixture-b', fullTelemetry: false });
  await setupGame(Game);
  check('scholar starts at haven (non-vacuous fixture)', atHaven(Game) === true);
  Game.state.scholar.water = [];
  Game.state.village.water = { clean: 10, dirty: 0 };
  const ctx = {};
  check('pack empty before', packN(Game) === 0);
  RF.rangerefillDawn(Game, ctx);
  check('pack full after dawn top-up (3 bottles)', packN(Game) === 3, 'n=' + packN(Game));
  check('cistern drawn down by 3', Math.floor(Game.state.village.water.clean) === 7,
    'clean=' + Game.state.village.water.clean);
  const log = (ctx._rfDawnLog || [])[0];
  check('dawn log entry recorded', !!log, JSON.stringify((ctx._rfDawnLog || []).length));
  if (log) {
    check('dawn log packAfter == 3', log.packAfter === 3, JSON.stringify(log));
    check('dawn log gate not tripped', log.gateTripped === false, JSON.stringify(log));
  }
  check('ctx.rf_filled_dawn counted', (ctx.rf_filled_dawn || 0) === 3, 'n=' + ctx.rf_filled_dawn);
  // end-to-end wiring: the full policy runs the dawn layer before base daily
  const { Game: G2 } = await loadGame({ seed: 11, mode: 'rangerefill-fixture-b2', fullTelemetry: false });
  await setupGame(G2);
  G2.state.scholar.water = [];
  G2.state.village.water = { clean: 10, dirty: 0 };
  let savedCtx = null;
  const od = RF.rangerefillCompetent.daily;
  const pwrap = Object.assign({}, RF.rangerefillCompetent);
  pwrap.daily = (G, c) => { savedCtx = c; return od(G, c); };
  await quietLog(async () => { await runDays(G2, pwrap, { days: 3 }); });
  check('3-day run kept a dawn log', !!(savedCtx && savedCtx._rfDawnLog && savedCtx._rfDawnLog.length >= 1),
    'entries=' + (savedCtx && savedCtx._rfDawnLog && savedCtx._rfDawnLog.length));
}

// ---------------- PART C — en-route fill ----------------
async function partC() {
  console.log('PART C — en-route fill: wrapped travelTo arrival on wetland fills (seed 11)');
  const { Game } = await loadGame({ seed: 11, mode: 'rangerefill-fixture-c', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  RF.installTravelFill(Game, ctx);
  check('travelTo wrapped once', Game._rfTravelWrapped === true);
  const px0 = Game.map.px, py0 = Game.map.py;
  const wl = ensureWetland(Game, px0, py0);
  check('wetland tile available', !!wl, JSON.stringify(wl));
  if (!wl) return;
  // stand adjacent, then arrive via the wrapped travelTo
  const adj = [[wl.x + 1, wl.y], [wl.x - 1, wl.y], [wl.x, wl.y + 1], [wl.x, wl.y - 1]]
    .find(([x, y]) => x >= 0 && x <= 8 && y >= 0 && y <= 8);
  Game.map.px = adj[0]; Game.map.py = adj[1];
  Game.state.scholar.water = [{ liters: 1, quality: 'clean', source: 'Haven well' }];
  const before = packN(Game);
  let moved = false;
  try { Game.travelTo(wl.x, wl.y); moved = (Game.map.px === wl.x && Game.map.py === wl.y); }
  catch (e) { moved = false; }
  check('arrived on the wetland (non-vacuous fixture)', moved === true, `to=${wl.x},${wl.y} at=${Game.map.px},${Game.map.py}`);
  if (moved) {
    check('en-route fill fired (pack grew)', packN(Game) > before, `before=${before} after=${packN(Game)}`);
    check('pack filled toward full (3)', packN(Game) === 3, 'n=' + packN(Game));
    check('ctx.rf_filled_enroute counted', (ctx.rf_filled_enroute || 0) >= 1, 'n=' + ctx.rf_filled_enroute);
    check('known-water recorded (honest map knowledge)', !!(ctx._rfKnownWater && ctx._rfKnownWater[wl.x + ',' + wl.y]),
      JSON.stringify(Object.keys(ctx._rfKnownWater || {})));
  }
}

// ---------------- PART D — gate fallback (creek-haul) ----------------
async function partD() {
  console.log('PART D — gate fallback: empty pack + dry cistern -> creek-haul (seed 22)');
  const { Game } = await loadGame({ seed: 22, mode: 'rangerefill-fixture-d', fullTelemetry: false });
  await setupGame(Game);
  const { hx, hy } = havenXY(Game);
  check('scholar starts at haven (non-vacuous fixture)', atHaven(Game) === true, `at=${Game.map.px},${Game.map.py} haven=${hx},${hy}`);
  const ctx = {};
  RF.installTravelFill(Game, ctx);
  // teach the scholar a water tile: construct one adjacent to haven, arrive via wrapped travelTo
  const wl = ensureWetland(Game, hx, hy);
  check('wetland tile available', !!wl, JSON.stringify(wl));
  if (!wl) return;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.travelTo(wl.x, wl.y); } catch (e) {}
  const known = !!(ctx._rfKnownWater && ctx._rfKnownWater[wl.x + ',' + wl.y]);
  check('water tile learned via arrival', known);
  if (!known) return;
  // back to haven, then the Violet Pang state: empty pack, dry cistern
  Game.map.px = hx; Game.map.py = hy;
  Game.state.scholar.water = [];
  Game.state.village.water = { clean: 0, dirty: 0 };
  check('gate state staged (pack 0, cistern 0)', packN(Game) === 0 && Math.floor(Game.state.village.water.clean) === 0);
  RF.rangerefillDawn(Game, ctx);
  check('gate tripped once', (ctx.rf_gateTrips || 0) === 1, 'n=' + ctx.rf_gateTrips);
  check('gate haul attempted', (ctx.rf_gateHauls || 0) === 1, 'n=' + ctx.rf_gateHauls);
  check('pack non-empty after creek-haul', packN(Game) > 0, 'n=' + packN(Game));
  const log = (ctx._rfDawnLog || [])[0];
  check('dawn log entry recorded', !!log);
  if (log) {
    check('dawn log gateTripped', log.gateTripped === true, JSON.stringify(log));
    check('dawn log packAfterFallback > 0', (log.packAfterFallback || 0) > 0, JSON.stringify(log));
  }
  // unresolvable variant: no known water -> recorded, day proceeds, pack stays 0
  const ctx2 = {};
  Game.map.px = hx; Game.map.py = hy;
  Game.state.scholar.water = [];
  Game.state.village.water = { clean: 0, dirty: 0 };
  RF.rangerefillDawn(Game, ctx2);
  check('unresolvable gate recorded', (ctx2.rf_gateUnresolvable || 0) === 1, 'n=' + ctx2.rf_gateUnresolvable);
  check('unresolvable: pack stays 0 (honest, measured)', packN(Game) === 0, 'n=' + packN(Game));
}

// ---------------- PART E — smoke + unwrap + det-gate ----------------
function dayHashE(Game) { return dayHash(Game); }

async function partE() {
  console.log('PART E — ' + (GATE_ON ? 'SMOKE (gate-on)' : 'det-gate: instrument neutrality (gate-off)') + ' + #69 unwrap');
  // #69 unwrap in both modes
  check('#69 unwrap: named export has callable daily', typeof RF.rangerefillLeadcourt.daily === 'function');
  check('#69 unwrap: named export has string id', typeof RF.rangerefillLeadcourt.id === 'string');
  if (GATE_ON) {
    // SMOKE: the layer drives, the dawn log fills, nothing crashes
    const { Game } = await loadGame({ seed: 44, mode: 'rangerefill-smoke', fullTelemetry: false });
    await setupGame(Game);
    let dailyCalls = 0, savedCtx = null;
    const od = RF.rangerefillCompetent.daily;
    const pwrap = Object.assign({}, RF.rangerefillCompetent);
    pwrap.daily = (G, c) => { dailyCalls++; savedCtx = c; return od(G, c); };
    await quietLog(async () => { await runDays(Game, pwrap, { days: 15 }); });
    check('policy.daily fires >= 10x', dailyCalls >= 10, 'calls=' + dailyCalls);
    check('dawn log recorded', !!(savedCtx && savedCtx._rfDawnLog && savedCtx._rfDawnLog.length >= 1),
      'entries=' + (savedCtx && savedCtx._rfDawnLog && savedCtx._rfDawnLog.length));
    return;
  }
  // gate-off det-gate: instruments (rangedehy + routetile) are trajectory-neutral
  async function runHashes(seed, withInstr) {
    const { Game } = await loadGame({ seed, mode: 'rangerefill-h' + seed + (withInstr ? '1' : '0'), fullTelemetry: false });
    await setupGame(Game);
    if (withInstr) { installRangeDehy(Game); installRouteTile(Game); }
    const hs = [];
    const oed = Game.endDay.bind(Game);
    Game.endDay = function () {
      const r = oed.apply(this, arguments);
      try { hs.push(dayHashE(this)); } catch (e) { hs.push('ERR'); }
      return r;
    };
    await quietLog(async () => { await runDays(Game, belongseek, { days: 40 }); });
    return hs;
  }
  for (const seed of [11, 22]) {
    const [h0, h1] = [await runHashes(seed, false), await runHashes(seed, true)];
    const same = h0.length === h1.length && h0.every((h, i) => h === h1[i]);
    check(`byte-identical instrumented-vs-pristine seed ${seed} (40d)`, same,
      same ? h0.length + ' days' : ('pristine=' + h0.length + ' instr=' + h1.length));
  }
}

async function main() {
  try {
    if (SMOKE_ONLY) { await partE(); }
    else if (!GATE_ON) { await partA(); await partE(); }
    else { await partB(); await partC(); await partD(); await partE(); }
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main();
