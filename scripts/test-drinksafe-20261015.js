#!/usr/bin/env node
// test-drinksafe-20261015.js — proof for sim-findings #306 (DRINKSAFE NEVER
// FILLS ON WETLANDS). Policy-side only; zero src/js changes.
//
// PART A — fixtures (REAL RED/GREEN):
//   Teleport the scholar onto wetland/creek/pond/haven/dry tiles with an
//   empty pack, run competent.upkeep once (drinkSafe is the ONLY fillWater
//   caller in the competent family), and assert gained fills.
//   RED=1  -> pre-fix expectations (wetland: 0 fills — the bug).
//   default -> post-fix expectations (wetland: 1 fill).
//   Run RED=1 BEFORE the fix and default AFTER; each must pass in its world,
//   and each must FAIL in the other world (proving the test detects the fix).
//
// PART B — det-gate (instrument honesty, runs post-fix):
//   40d x seeds {11,22} x sides {control, armed}: instrumented
//   (routetile + rangedehy) vs pristine per-day state hashes must be
//   BYTE-IDENTICAL. Control = HEAD bytes of competent.js via a
//   Module._resolveFilename hook; A/B integrity asserted (diff = the one
//   regex line only).
//
// Usage:
//   RED=1 node scripts/test-drinksafe-20261015.js   # pre-fix world
//   node scripts/test-drinksafe-20261015.js          # post-fix world (A+B)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const RED = process.env.RED === '1';
const CONTROL_PATH = process.env.DRINKSAFE_CONTROL ||
  path.join(process.env.HOME || '/home/hatch', 'workspace', 'drinksafe-control-competent.js');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function controlBytes() {
  return execSync('git -C ' + JSON.stringify(ROOT) + ' show HEAD:scripts/policies/competent.js').toString('utf8');
}
function headSha() {
  return execSync('git -C ' + JSON.stringify(ROOT) + ' rev-parse HEAD').toString('utf8').trim();
}

const OLD_RX = '/creek|well|spring|river|pond|haven/i';
const NEW_RX = '/creek|wetland|pond|haven/i';

// ---------- PART A: fixtures ----------
async function partA() {
  console.log(`PART A — fixtures (${RED ? 'RED: pre-fix expectations' : 'GREEN: post-fix expectations'})`);
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const { competent } = require('./policies/competent');

  const src = fs.readFileSync(path.join(ROOT, 'scripts', 'policies', 'competent.js'), 'utf8');
  const hasOld = src.includes(OLD_RX), hasNew = src.includes(NEW_RX);
  console.log(`  worktree competent.js: oldRegex=${hasOld} newRegex=${hasNew}`);
  if (RED) check('worktree still carries the buggy regex (RED world)', hasOld && !hasNew, 'expected pre-fix file');
  else check('worktree carries the fixed regex (GREEN world)', hasNew && !hasOld, 'expected post-fix file');

  // tile finder: first tile of the wanted kind.
  // (ponds do not generate on seeds 1-40 — the pond case shims tileAt to
  // report a real dry tile as 'pond', testing the full regex->fillWater
  // chain with only the reported type controlled.)
  async function findTile(seed, want) {
    const { Game } = await loadGame({ seed, mode: 'drinksafe-scan', fullTelemetry: false });
    await setupGame(Game);
    for (let x = 0; x <= 8; x++) for (let y = 0; y <= 8; y++) {
      let t = null;
      try { t = Game.tileAt(x, y); } catch (e) {}
      if (t && want(t.type, x, y)) return { x, y, type: t.type };
    }
    return null;
  }
  const dist1 = (x, y) => Math.abs(x - 4) + Math.abs(y - 4);
  const wetlandT = await findTile(22, (ty, x, y) => ty === 'wetland' && dist1(x, y) > 1);
  const creekT = await findTile(11, (ty, x, y) => ty === 'creek' && dist1(x, y) > 1);
  const dryT = await findTile(11, (ty, x, y) => /meadow|forest|field|grassland|scrub|forest_floor|grove|thicket/.test(ty) && dist1(x, y) > 1);
  console.log(`  tiles: wetland@${wetlandT && wetlandT.x + ',' + wetlandT.y} creek@${creekT && creekT.x + ',' + creekT.y} dry@${dryT && dryT.type + '@' + dryT.x + ',' + dryT.y}`);
  check('map has a true-wild wetland tile (seed 22)', !!wetlandT);
  check('map has a true-wild creek tile (seed 11)', !!creekT);
  check('map has a true-wild dry tile (seed 11)', !!dryT);
  if (!wetlandT || !creekT || !dryT) return;

  const cases = [
    { name: 'wetland', seed: 22, tile: wetlandT, shimPond: false, expectGained: RED ? 0 : 1, expectCalls: RED ? 0 : 1 },
    { name: 'creek', seed: 11, tile: creekT, shimPond: false, expectGained: 1, expectCalls: 1 },
    { name: 'pond(shim)', seed: 11, tile: dryT, shimPond: true, expectGained: 1, expectCalls: 1 },
    { name: 'haven', seed: 11, tile: { x: 4, y: 4 }, shimPond: false, expectGained: 1, expectCalls: 1 },
    { name: 'dry(' + dryT.type + ')', seed: 11, tile: dryT, shimPond: false, expectGained: 0, expectCalls: 0 },
  ];
  for (const c of cases) {
    const { Game } = await loadGame({ seed: c.seed, mode: 'drinksafe-fixture', fullTelemetry: false });
    await setupGame(Game);
    Game.map.px = c.tile.x; Game.map.py = c.tile.y; // teleport: playerTile()/playerAtHaven() read map.px/py
    Game.state.scholar.water = [];
    if (c.shimPond) {
      // ponds don't generate on seeds 1-40: report this real dry tile as 'pond'
      const oTileAt = Game.tileAt.bind(Game);
      Game.tileAt = function (x, y) {
        const t = oTileAt(x, y);
        if (x === c.tile.x && y === c.tile.y && t) return Object.assign({}, t, { type: 'pond' });
        return t;
      };
    }
    if (c.name === 'haven') { Game.state.village.water = Game.state.village.water || {}; Game.state.village.water.clean = 40; }
    const fills = [];
    let moved = false;
    const oFill = Game.fillWater.bind(Game);
    Game.fillWater = function () {
      const pk0 = (Game.state.scholar.water || []).length;
      let ttype = null; try { const t = Game.playerTile(); ttype = t && t.type; } catch (e) {}
      const r = oFill.apply(this, arguments);
      const pk1 = (Game.state.scholar.water || []).length;
      fills.push({ tileType: ttype, gained: pk1 > pk0 });
      return r;
    };
    const oTravel = Game.travelTo.bind(Game);
    Game.travelTo = function (x, y) {
      const r = oTravel.apply(this, arguments);
      if (Game.map.px !== c.tile.x || Game.map.py !== c.tile.y) moved = true;
      return r;
    };
    const ctx = {};
    await quietLog(async () => { try { competent.upkeep(Game, ctx); } catch (e) { fills.push({ err: e.message }); } });
    const gained = fills.filter(f => f.gained).length;
    const errFills = fills.filter(f => f.err);
    check(`${c.name}: fillWater calls == ${c.expectCalls}`, fills.length - errFills.length === c.expectCalls,
      `got ${fills.length} calls (${JSON.stringify(fills.slice(0, 3))})`);
    check(`${c.name}: gained fills == ${c.expectGained}`, gained === c.expectGained, `got ${gained}`);
    check(`${c.name}: scholar did not move during upkeep`, !moved);
    if (errFills.length) check(`${c.name}: no upkeep errors`, false, errFills[0].err);
  }
}

// ---------- PART B: det-gate ----------
let side = 'armed';
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  const pf = (parent && parent.filename) || '';
  if (side === 'control') {
    if (request === './competent' && /scripts[\\/]policies[\\/]/.test(pf)) return CONTROL_PATH;
    // the control file lives outside scripts/policies/ — its sibling
    // requires ('./idle', './vinebank') must resolve back into policies/.
    // Return the absolute filename with extension (hook results bypass
    // node's extension probing).
    if (pf === CONTROL_PATH && request.startsWith('./')) {
      const abs = path.join(ROOT, 'scripts', 'policies', request.slice(2));
      return abs.endsWith('.js') ? abs : abs + '.js';
    }
  }
  return origResolve.call(this, request, parent, isMain, options);
};
function clearPolicyCache() {
  for (const k of Object.keys(require.cache)) {
    if (/scripts[\\/]policies[\\/](leadcourt|competent|idle|vinebank)(\.js)?$/.test(k) || k === CONTROL_PATH) {
      delete require.cache[k];
    }
  }
}
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}

async function partB() {
  console.log('PART B — det-gate (instrumented vs pristine, 40d, seeds 11/22, both sides)');
  const sha = headSha();
  fs.writeFileSync(CONTROL_PATH, controlBytes());
  console.log(`  control bytes pinned from HEAD ${sha.slice(0, 12)} -> ${CONTROL_PATH}`);
  const worktree = fs.readFileSync(path.join(ROOT, 'scripts', 'policies', 'competent.js'), 'utf8');
  const ctrl = fs.readFileSync(CONTROL_PATH, 'utf8');
  check('control file carries the OLD regex', ctrl.includes(OLD_RX) && !ctrl.includes(NEW_RX));
  check('worktree file carries the NEW regex (fix applied)', worktree.includes(NEW_RX) && !worktree.includes(OLD_RX));
  // A/B integrity: exactly one differing line, the regex line
  const wl = worktree.split('\n'), cl = ctrl.split('\n');
  const diffs = [];
  const n = Math.max(wl.length, cl.length);
  for (let i = 0; i < n; i++) if (wl[i] !== cl[i]) diffs.push(i);
  check('A/B integrity: exactly one differing line', diffs.length === 1, `diff lines: ${diffs.join(',')}`);
  if (diffs.length === 1) {
    check('the differing line is the drinkSafe regex swap',
      cl[diffs[0]].includes(OLD_RX) && wl[diffs[0]].includes(NEW_RX),
      `old: ${String(cl[diffs[0]]).slice(0, 80)}`);
  }
  if (failures) { console.log('  SKIPPING det-gate runs (A/B integrity failed)'); return; }

  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  for (const sd of ['control', 'armed']) {
    for (const seed of [11, 22]) {
      const hashes = {};
      for (const instr of [true, false]) {
        side = sd; clearPolicyCache();
        const { leadcourt } = require('./policies/leadcourt');
        // positive hook check: prove WHICH competent.js this side loaded
        const loadedKeys = Object.keys(require.cache);
        const loadedCtrl = loadedKeys.includes(CONTROL_PATH);
        const loadedWork = loadedKeys.some(k => k.endsWith('scripts/policies/competent.js'));
        check(`det-gate ${sd} s${seed}: loaded the ${sd} competent.js`,
          sd === 'control' ? (loadedCtrl && !loadedWork) : (loadedWork && !loadedCtrl),
          `ctrl=${loadedCtrl} work=${loadedWork}`);
        const { Game } = await loadGame({ seed, mode: `drinksafe-detgate-${sd}-${instr ? 'i' : 'p'}`, fullTelemetry: false });
        await setupGame(Game);
        if (instr) {
          require('./routetile-lib-20261015').installRouteTile(Game);
          require('./rangedehy-lib-20261015').installRangeDehy(Game);
        }
        const hs = [];
        const oed = Game.endDay.bind(Game);
        Game.endDay = function () { const r = oed.apply(this, arguments); try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); } return r; };
        await quietLog(async () => { await require('./sim-harness').runDays(Game, leadcourt, { days: 40, sampleEvery: 10 }); });
        hashes[instr ? 'instr' : 'pristine'] = hs;
      }
      const a = hashes.instr, b = hashes.pristine;
      const same = a.length === b.length && a.length > 0 && a.every((h, i) => h === b[i]);
      check(`det-gate ${sd} s${seed}: instrumented == pristine (${a.length}d)`, same,
        same ? '' : `lengths ${a.length}/${b.length}, first diff at day ${a.findIndex((h, i) => h !== b[i]) + 1}`);
    }
  }
  side = 'armed'; clearPolicyCache();
}

async function main() {
  // KILL-PROTOCOL INFO-SKIP: the fix was reverted (MISS on the mechanism GO);
  // GREEN mode needs the fix present. RED mode still describes the buggy world.
  if (!RED) {
    const src0 = fs.readFileSync(path.join(ROOT, 'scripts', 'policies', 'competent.js'), 'utf8');
    if (!src0.includes(NEW_RX) || src0.includes(OLD_RX)) {
      console.log('INFO-SKIP: drinksafe fix not present in worktree (killed arm — evidence only, see evidence/2026-10-15/sim-drinksafe-b.md)');
      process.exit(0);
    }
  }
  await partA();
  if (!RED) await partB();
  else console.log('PART B skipped in RED mode (needs the fix applied for the armed side)');
  console.log(failures ? `\nRESULT: ${failures} FAILURE(S)` : '\nRESULT: ALL PASS');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
