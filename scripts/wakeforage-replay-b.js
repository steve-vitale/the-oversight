#!/usr/bin/env node
// wakeforage-replay-b.js — wake-tile forage replay instrument
// (sim-wakeforage-b; prereg: evidence/2026-10-30/
// sim-wakeforage-b-prereg.md). Single-target: replays ONE seed
// with the SAME policy stack and morning-snap code as
// scripts/wakeforage-trace-b.js, stops at the target loop-day
// morning, and either (WAKEFORAGE=0) dumps the control snap
// and exits, or (WAKEFORAGE=1) presses doAction('forage')
// ONCE, captures the yield, writes it, and exits. The replay
// instance is then DISCARDED: nothing from it enters any
// judged corpus, and no judged trajectory is altered by it.
// The press is a measurement instrument, disclosed as such
// in the evidence file — never quoted as bot behavior.
//
// Env (all substrate gates asserted FATAL, same as recorder):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" WOODCARRY="1" WOODWARM="0"|"1"
//   TARGET_SEED (int), TARGET_DAY (loopDay int)
//   WAKEFORAGE="0"|"1"
//   OUTDIR (default evidence/2026-10-30/sim-wakeforage-b-corpus-replay)
//   JUDGED_MORNING (optional path to a JSON file holding the
//     judged recorder morning row {tile, mx, my, kcal,
//     morningWood, sweepAnalysis:{grid}} — when set, the
//     pre-press snap must equal it on tile/cell/kcal/wood/
//     grid, else exit 4 with a loud mismatch, never a
//     silent substitution)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be set explicitly to 0 or 1'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
const TARGET_SEED = parseInt(process.env.TARGET_SEED || '', 10);
const TARGET_DAY = parseInt(process.env.TARGET_DAY || '', 10);
if (!TARGET_SEED || !TARGET_DAY) { console.error('FATAL: TARGET_SEED and TARGET_DAY required'); process.exit(2); }
if (process.env.WAKEFORAGE !== '0' && process.env.WAKEFORAGE !== '1') { console.error('FATAL: WAKEFORAGE must be 0 (control) or 1 (press)'); process.exit(2); }
const PRESS = process.env.WAKEFORAGE === '1';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-wakeforage-b-corpus-replay');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), 'recursive');
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
  };
}
// sweepAnalysis copied verbatim in logic from wakeforage-trace-b.js
// (same pure reads; duplicated rather than imported so the
// replay driver stays a single self-contained script).
function sweepAnalysis(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
    const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
    const live = Game.genDetail(Game.map.px, Game.map.py);
    const grid = live.map((row) => (row ? row.slice() : row));
    let t = null;
    try { t = Game.playerTile(); } catch (e) { t = null; }
    if (!t && typeof Game.tileAt === 'function') { try { t = Game.tileAt(Game.map.px, Game.map.py); } catch (e) {} }
    const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
    const cellAt = (x, y) => (grid[y] && grid[y][x]) || null;
    const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
    const cells = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = mx + dx, cy = my + dy;
      if (!inB(cx, cy)) continue;
      const cell = cellAt(cx, cy);
      const key = cx + ',' + cy;
      let species = null, assigned = false, treeModSpecies = null;
      try {
        if (cell === 'plant' && t && t.plantSpecies && t.plantSpecies[key]) { species = t.plantSpecies[key]; assigned = true; }
        else if (cell === 'bush' && t && t.bushSpecies && t.bushSpecies[key]) { species = t.bushSpecies[key]; assigned = true; }
        else if ((cell === 'tree' || cell === 'bigtree') && t && t.modifiers && t.modifiers[key] && t.modifiers[key].species) { treeModSpecies = t.modifiers[key].species; }
      } catch (e) {}
      let known = null;
      try { if (species && typeof Game.plantKnown === 'function') known = !!Game.plantKnown(species); } catch (e) { known = null; }
      let regrow = false, scorched = null;
      try { regrow = !!(t && t.detailRegrow && t.detailRegrow[key]); } catch (e) {}
      try { scorched = (typeof Game.cellScorched === 'function') ? !!Game.cellScorched(cx, cy) : null; } catch (e) { scorched = null; }
      cells.push({ x: cx, y: cy, cell, species, assigned, treeModSpecies, known, regrow, scorched,
        forageable: !!FORAGEABLE[cell] && !regrow && scorched !== true });
    }
    let tileCanForage = null;
    try {
      const F = (globalThis.Scattering || {}).forage;
      if (F && typeof F.canForage === 'function' && t) tileCanForage = !!F.canForage(t);
    } catch (e) { tileCanForage = null; }
    let ticksLeft = null;
    try { const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512; ticksLeft = tpd - (sch.dayTicks || 0); } catch (e) {}
    return { wake: [mx, my], wakeCell: cellAt(mx, my), grid, cells,
      forageableCells: cells.filter((c) => c.forageable).length, tileCanForage, ticksLeft };
  } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
}
// nearestCutSteps(Game, grid, mx, my): PURE READ, walktree
// instrument reused for ONE purpose: re-deriving the
// walktree food-first break-even Y* per fresh morning
// (walkKcal = steps x walkStepKcal). findPath + cellProps
// only; no state edits, no verbs. Returns {steps,
// walkStepKcal, cutPos, bridgeUse} for the nearest reachable
// bigtree cut-position, or {steps:null,...} when none is
// reachable (the far-stand-from-east-corner case).
function nearestCutSteps(Game, grid, mx, my) {
  try {
    const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
    const cellAt = (x, y) => (grid[y] && grid[y][x]) || null;
    const blocks = (cell) => { try { return !!Game.cellProps(cell).blocks; } catch (e) { return false; } };
    const cutSet = new Map();
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (cellAt(x, y) !== 'bigtree') continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const cx = x + dx, cy = y + dy;
        if (!inB(cx, cy) || blocks(cellAt(cx, cy))) continue;
        if (!cutSet.has(cx + ',' + cy)) cutSet.set(cx + ',' + cy, [cx, cy]);
      }
    }
    let best = null;
    for (const [cx, cy] of cutSet.values()) {
      let pp = null;
      if (cx === mx && cy === my) pp = [];
      else { try { pp = (typeof Game.findPath === 'function') ? Game.findPath(mx, my, cx, cy) : null; } catch (e) { pp = null; } }
      if (!pp) continue;
      if (best === null || pp.length < best.steps) {
        let bridgeUse = false;
        for (const [px2, py2] of pp) if (cellAt(px2, py2) === 'bridge') bridgeUse = true;
        best = { steps: pp.length, cutPos: [cx, cy], bridgeUse };
      }
    }
    let walkKcal = null;
    try { walkKcal = (typeof Game.walkStepKcal === 'function') ? Game.walkStepKcal() : null; } catch (e) {}
    if (!best) return { steps: null, cutPos: null, bridgeUse: null, walkStepKcal: walkKcal };
    return { steps: best.steps, cutPos: best.cutPos, bridgeUse: best.bridgeUse, walkStepKcal: walkKcal };
  } catch (e) { return { steps: null, cutPos: null, bridgeUse: null, walkStepKcal: null, error: String((e && (e.message || e)) || e).slice(0, 200) }; }
}
function itemView(it) {
  if (!it || typeof it !== 'object') return it;
  return { plantId: it.plantId || null, name: it.name || null, units: it.units || null,
    kcalEach: (it.kcalEach === undefined ? null : it.kcalEach),
    hiddenKcal: (it.hiddenKcal === undefined ? null : it.hiddenKcal),
    edible: (it.edible === undefined ? null : !!it.edible),
    foodKind: it.foodKind || null, foodState: it.foodState || null,
    material: it.material || null };
}
function snapEqual(a, b) {
  // a = replay snap {pos, morningWood, sweep}, b = judged morning row
  const diffs = [];
  if (!b) return ['no judged morning supplied'];
  if (a.pos.tile !== b.tile) diffs.push('tile ' + a.pos.tile + ' vs ' + b.tile);
  if (a.pos.mapPx !== b.mapPx || a.pos.mapPy !== b.mapPy) diffs.push('map ' + a.pos.mapPx + ',' + a.pos.mapPy + ' vs ' + b.mapPx + ',' + b.mapPy);
  if (a.pos.mx !== b.mx || a.pos.my !== b.my) diffs.push('cell ' + a.pos.mx + ',' + a.pos.my + ' vs ' + b.mx + ',' + b.my);
  if (a.pos.kcal !== b.kcal) diffs.push('kcal ' + a.pos.kcal + ' vs ' + b.kcal);
  if (a.morningWood !== b.morningWood) diffs.push('wood ' + a.morningWood + ' vs ' + b.morningWood);
  const ga = (a.sweep && a.sweep.grid) || null, gb = (b.sweepAnalysis && b.sweepAnalysis.grid) || null;
  if (JSON.stringify(ga) !== JSON.stringify(gb)) diffs.push('grid mismatch');
  return diffs;
}

(async () => {
  const { Game } = await loadGame({ seed: TARGET_SEED, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 20000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 500) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const dayPolicy = withWoodwarm(base, wwStore);
  let callIdx = 0;
  let done = false;
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      if (done) return;
      callIdx++;
      if (callIdx === TARGET_DAY) {
        const pos = snapPos(Game2);
        let morningWood = null;
        try { morningWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) {}
        const sweep = sweepAnalysis(Game2);
        const walk = (sweep && !sweep.error && sweep.grid) ? nearestCutSteps(Game2, sweep.grid, pos.mx === null ? 4 : pos.mx, pos.my === null ? 4 : pos.my) : { steps: null, cutPos: null, bridgeUse: null, walkStepKcal: null };
        const snap = { pos, morningWood, sweep, walk };
        let judgedDiffs = null;
        if (process.env.JUDGED_MORNING) {
          try {
            const judged = JSON.parse(fs.readFileSync(process.env.JUDGED_MORNING, 'utf8'));
            judgedDiffs = snapEqual(snap, judged);
          } catch (e) { judgedDiffs = ['judged read error: ' + String(e.message || e).slice(0, 200)]; }
        }
        const name = `wakeforage-replay-${PRESS ? 'press' : 'control'}-s${TARGET_SEED}-d${TARGET_DAY}-${process.env.WOODWARM === '1' ? 'on' : 'guard'}.json`;
        if (!PRESS) {
          const out = { seed: TARGET_SEED, leg: (process.env.WOODWARM === '1' ? 'on' : 'guard'),
            targetDay: TARGET_DAY, mode: 'control', snap, judgedDiffs, sayLinesAtSnap: sayLines.length };
          if (!tryWrite(path.join(OUTDIR, name), JSON.stringify(out), 6)) { console.error('REPLAY WRITE FAIL ' + name); process.exit(3); }
          console.log('replay control seed=' + TARGET_SEED + ' day=' + TARGET_DAY + ' leg=' + out.leg + ' judgedDiffs=' + JSON.stringify(judgedDiffs));
          done = true;
          process.exit(0);
        }
        // PRESS path: judged equality is a hard gate when JUDGED_MORNING set.
        if (judgedDiffs && judgedDiffs.length) {
          console.error('REPLAY SNAP MISMATCH seed=' + TARGET_SEED + ' day=' + TARGET_DAY + ' diffs=' + JSON.stringify(judgedDiffs));
          const out = { seed: TARGET_SEED, leg: (process.env.WOODWARM === '1' ? 'on' : 'guard'),
            targetDay: TARGET_DAY, mode: 'press-aborted', snap, judgedDiffs };
          tryWrite(path.join(OUTDIR, name), JSON.stringify(out), 3);
          process.exit(4);
        }
        const invBefore = ((Game2.state.scholar || {}).inventory || []).map(itemView);
        const kcalBefore = Math.round((Game2.state.scholar || {}).kcal || 0);
        const ticksBefore = ((Game2.state.scholar || {}).dayTicks || 0);
        const sayBefore = sayLines.length;
        let ret = null, pressErr = null;
        try { ret = Game2.doAction('forage'); } catch (e) { pressErr = String((e && (e.message || e)) || e).slice(0, 300); }
        const pressSay = sayLines.slice(sayBefore).map((x) => x.line);
        const invAfter = ((Game2.state.scholar || {}).inventory || []).map(itemView);
        const added = invAfter.slice(invBefore.length);
        // Inventory can also change in place (prep refresh); report
        // changed pre-existing rows separately so the diff is honest.
        const changed = [];
        for (let i = 0; i < Math.min(invBefore.length, invAfter.length); i++) {
          if (JSON.stringify(invBefore[i]) !== JSON.stringify(invAfter[i])) changed.push({ idx: i, before: invBefore[i], after: invAfter[i] });
        }
        let knownEdibleKcal = 0, knownInedibleHiddenKcal = 0, unknownUnits = 0;
        const unknownForms = [], deadfall = { branches: 0, bark: 0, fiber: 0, sticks: 0, vines: 0 };
        for (const it of added) {
          if (it.plantId && it.edible === true) knownEdibleKcal += (it.units || 0) * (it.kcalEach || 0);
          else if (it.plantId && it.edible === false && it.hiddenKcal) knownInedibleHiddenKcal += (it.units || 0) * (it.hiddenKcal || 0);
          else if (it.foodState === 'unknown') { unknownUnits += (it.units || 0); unknownForms.push(it.name); }
          else if (it.material === 'branch') deadfall.branches += (it.units || 0);
          else if (it.material === 'bark') deadfall.bark += (it.units || 0);
          else if (it.material === 'fiber') deadfall.fiber += (it.units || 0);
          else if (it.material === 'stick') deadfall.sticks += (it.units || 0);
          else if (it.material === 'vine') deadfall.vines += (it.units || 0);
        }
        const kcalAfter = Math.round((Game2.state.scholar || {}).kcal || 0);
        const out = { seed: TARGET_SEED, leg: (process.env.WOODWARM === '1' ? 'on' : 'guard'),
          targetDay: TARGET_DAY, mode: 'press', snap, judgedDiffs,
          kcalBefore, kcalAfter, ticksBefore, dayTicksAfter: ((Game2.state.scholar || {}).dayTicks || 0),
          pressSay, pressErr, retNull: (ret === null || ret === undefined),
          addedItems: added, changedItems: changed,
          totals: { knownEdibleKcal, knownInedibleHiddenKcal, unknownUnits, unknownForms, deadfall } };
        if (!tryWrite(path.join(OUTDIR, name), JSON.stringify(out), 6)) { console.error('REPLAY WRITE FAIL ' + name); process.exit(3); }
        console.log('replay press seed=' + TARGET_SEED + ' day=' + TARGET_DAY + ' leg=' + out.leg + ' E=' + knownEdibleKcal + ' unknownUnits=' + unknownUnits + ' say=' + JSON.stringify(pressSay.slice(0, 2)));
        done = true;
        process.exit(0);
      }
      dayPolicy.daily(Game2, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: 30, manifest: null });
  if (!done) { console.error('REPLAY TARGET NOT REACHED seed=' + TARGET_SEED + ' day=' + TARGET_DAY + ' days=' + result.days); process.exit(5); }
})().catch((e) => { console.error('REPLAY CRASH', e && (e.stack || e)); process.exit(2); });
