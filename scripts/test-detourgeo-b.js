#!/usr/bin/env node
// test-detourgeo-b.js — constructed-evening battery for sim-detourgeo-b
// (prereg: evidence/2026-10-29/sim-detourgeo-b-prereg.md, committed
// BEFORE any judged leg).
//
// Plays REAL evening steps (nighttravel.nightStep, the exact function
// the policy's daily invokes) from staged geometry on fresh games.
// Forbidden shortcuts are NOT used: no position writes (player moves
// only via Game.travelTo), no hand-set combat state (no
// pendingEncounter/tbfight injection), no clock-setting, no
// bfsDetourPath calls from the test (path prediction for monster
// staging uses the test's own BFS over Game.travelBlockage, and a
// firing counts only if the INSTRUMENT's recorded path steps onto
// a staged tile). Tile mutation is scenario construction only
// (same class as src/js/debug-scenarios.js staging blockFrom).
//
// Usage:
//   node scripts/test-detourgeo-b.js --mode stage --seed 20101
//     (staging probe only: positions + geometry, NO nightStep call,
//      NOT a judged leg)
//   node scripts/test-detourgeo-b.js --mode battery --seed 20101 --out <file>
//     (judged: N-track + C1/C2/C3 attempts + gate-OFF control)
// Exit code: 0 when the battery ran to completion (a branch NOT
// firing is data, not failure); non-zero only on a guard
// violation on a fired branch, a failed gate-OFF control, or a
// harness error. The analyzer judges bars, not this exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { nighttravel, nightStep, havenCoords } = require('./policies/nighttravel');

const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const MODE = arg('mode', 'battery');
const SEED = parseInt(arg('seed', '20101'), 10);
const OUT = arg('out', null);

function snap(Game) {
  const s = Game.state.scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return { mapPx: Game.map ? Game.map.px : null, mapPy: Game.map ? Game.map.py : null,
    tile, inside: !!s.insideHaven, insideTent: !!s.insideTent, kcal: Math.round(s.kcal || 0),
    hp: s.health === undefined ? null : s.health, gameOver: !!Game.over,
    inCombat: !!(Game.inCombat && Game.inCombat()), pendingEncounter: !!Game.pendingEncounter };
}

// Test-side BFS prediction (NOT the instrument's): orthogonal steps,
// travelBlockage-clean, used ONLY to choose staging tiles.
function predictPath(Game, hx, hy) {
  const N = (Game.map && Game.map.worldSize) || 9;
  const sx = Game.map.px, sy = Game.map.py;
  const key = (x, y) => x + ',' + y;
  const prev = {}; prev[key(sx, sy)] = null;
  const q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === hx && y === hy) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || key(nx, ny) in prev) continue;
      let blocked = true;
      try { blocked = !!Game.travelBlockage(nx, ny, x, y); } catch (e) { blocked = true; }
      if (blocked) continue;
      prev[key(nx, ny)] = [x, y];
      q.push([nx, ny]);
    }
  }
  if (!(key(hx, hy) in prev)) return null;
  const p = [];
  let cur = [hx, hy];
  while (!(cur[0] === sx && cur[1] === sy)) { p.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
  return p;
}

const DIRS = [[-1, 0, 'W'], [0, -1, 'N'], [1, 0, 'E'], [0, 1, 'S']];

async function fresh(seed) {
  const { Game } = await loadGame({ seed, mode: 'detourgeo-b', fullTelemetry: false });
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { if (sayLines.length < 20000) sayLines.push(String(args[0] || '').slice(0, 400)); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  return { Game, sayLines };
}

// Honest move: travelTo steps only. Returns positions walked or null.
function honestWalk(Game, targets) {
  const walked = [{ x: Game.map.px, y: Game.map.py }];
  for (const [tx, ty] of targets) {
    const bx = Game.map.px, by = Game.map.py;
    try { Game.travelTo(tx, ty); } catch (e) { return null; }
    if (Game.map.px !== tx || Game.map.py !== ty) return null;
    if (Game.over) return null;
    walked.push({ x: tx, y: ty });
  }
  return walked;
}

function tileAt(Game, x, y) { try { return Game.tileAt(x, y); } catch (e) { return null; } }

// N-track staging for one direction. Returns staging record or null
// (honest step failed, or haven coords unexpected).
//
// AMENDMENT A (pilot-stage, see prereg): the original creek
// construction does NOT enclose a swimmer — hasAbility('swimmer')
// is true for the seed-20101 bearer, so travelBlockage passes
// unbridged creeks (verified: blockage null on a staged creek
// tile) and the BFS walked straight through (battery s20101:
// N-track rescued via (3,5)->(4,5)). The cage construction
// below uses blockFrom only, so it encloses any bearer:
// haven entry is blocked from the player's side, and each of
// the player's OTHER three neighbours gets a blockFrom guarding
// entry from the player tile itself. BFS from the player can
// then leave nowhere, so it returns null.
function stageN(Game, dir) {
  const [dx, dy, name] = dir;
  const hv = havenCoords(Game);
  if (hv.type !== 'haven') return null;
  const { hx, hy } = hv;
  const px = hx + dx, py = hy + dy;
  const walked = honestWalk(Game, [[px, py]]);
  if (!walked) return null;
  // Haven entry blocked from the player's side: entry direction
  // is (-dx,-dy), so the guarding bf is (dx,dy) (travelBlockage
  // blocks iff bf === -entry-direction).
  const ht = tileAt(Game, hx, hy);
  if (!ht) return null;
  ht.blockFrom = { dx, dy, type: 'rubble' };
  // Cage the player: for each other neighbour Q of the player
  // tile, guard entry from the player tile (entry direction
  // Q-P, so bf = P-Q).
  const caged = [];
  for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const qx = px + ox, qy = py + oy;
    if (qx === hx && qy === hy) continue;
    const t = tileAt(Game, qx, qy);
    if (!t) return null;
    t.blockFrom = { dx: -ox, dy: -oy, type: 'rubble' };
    caged.push([qx, qy]);
  }
  return { dirName: name, hx, hy, px, py, walked, caged,
    havenBlockFrom: ht.blockFrom, construction: 'cage' };
}

// C-track staging: player two steps west-ish of haven; the middle
// tile is blocked from the player's side so the direct hop refuses,
// while a BFS path around it exists. Direction param picks the axis:
// player at haven + 2*dir, middle tile haven + 1*dir.
function stageC(Game, dir) {
  const [dx, dy, name] = dir;
  const hv = havenCoords(Game);
  if (hv.type !== 'haven') return null;
  const { hx, hy } = hv;
  const mx = hx + dx, my = hy + dy;
  const px = hx + 2 * dx, py = hy + 2 * dy;
  const walked = honestWalk(Game, [[mx, my], [px, py]]);
  if (!walked) return null;
  const mt = tileAt(Game, mx, my);
  if (!mt) return null;
  // Block entry to the middle tile from the player's side: the
  // direct hop (d=2) must refuse on its intermediate scan, while
  // entries from perpendicular sides stay clean for the BFS path.
  // Same sign rule as stageN: bf equals the player-side offset.
  mt.blockFrom = { dx, dy, type: 'rubble' };
  const predicted = predictPath(Game, hx, hy);
  return { dirName: name, hx, hy, mx, my, px, py, walked, middleBlockFrom: mt.blockFrom, predicted };
}

function checkGuards(rec, detour) {
  const g = {};
  // H1: every recorded detour step moves exactly one orthogonal tile.
  g.H1_orthogonal = true;
  if (detour && Array.isArray(detour.steps)) {
    for (const s of detour.steps) {
      const md = Math.abs((s.to.mapPx ?? -99) - (s.from.mapPx ?? -99)) + Math.abs((s.to.mapPy ?? -99) - (s.from.mapPy ?? -99));
      if (md !== 1) g.H1_orthogonal = false;
    }
    // Chain contiguity from departure.
    let cx = rec.posBefore.mapPx, cy = rec.posBefore.mapPy;
    g.H1_chain = true;
    for (const s of detour.steps) {
      if (s.from.mapPx !== cx || s.from.mapPy !== cy) g.H1_chain = false;
      cx = s.to.mapPx; cy = s.to.mapPy;
    }
    g.chainEnd = { x: cx, y: cy };
  }
  // H2: unrescued legs end where the detour left them.
  if (rec.outcome === 'detour-nopath') {
    g.H2_arrivalEqDeparture = (rec.posAfter.mapPx === rec.posBefore.mapPx && rec.posAfter.mapPy === rec.posBefore.mapPy);
  } else if (rec.outcome === 'detour-stopped') {
    const end = g.chainEnd || {};
    g.H2_arrivalEqLastStep = (rec.posAfter.mapPx === end.x && rec.posAfter.mapPy === end.y);
  }
  // H4: no death by construction; detour steps charge no kcal.
  g.H4_alive = !rec.posAfter.gameOver;
  g.H4_kcalDelta = (rec.posAfter.kcal - rec.posBefore.kcal);
  return g;
}

async function playEvening(seed, gateOn, stageFn) {
  const { Game, sayLines } = await fresh(seed);
  const st = stageFn(Game);
  if (!st) return { seed, gateOn, staged: false };
  if (gateOn) process.env.COMPETENT_EVENING_DETOUR = '1';
  else delete process.env.COMPETENT_EVENING_DETOUR;
  const posBefore = snap(Game);
  const sayBefore = sayLines.length;
  const rec = nightStep(Game, {});
  const posAfter = snap(Game);
  const sayTail = sayLines.slice(Math.max(sayBefore, sayLines.length - 30), sayLines.length);
  const detour = rec.detour || null;
  const out = { seed, gateOn, staged: true, staging: st, outcome: rec.outcome,
    stoppedReason: detour ? detour.stoppedReason : null,
    detourAttempted: !!rec.detourAttempted,
    travelOffered: rec.travelOffered === undefined ? null : rec.travelOffered,
    havenDistance: rec.havenDistance === undefined ? null : rec.havenDistance,
    detourPath: detour ? detour.path : null,
    detourSteps: detour ? detour.steps : null,
    stepsWalked: detour ? detour.stepsWalked : null,
    posBefore, posAfter, sayTail,
    guards: detour ? checkGuards({ posBefore, posAfter, outcome: rec.outcome }, detour) : null };
  return out;
}

async function main() {
  const results = { seed: SEED, mode: MODE, tracks: {} };
  if (MODE === 'stage') {
    // Staging probe only — NO nightStep call (not a judged leg).
    const { Game, sayLines } = await fresh(SEED);
    const hv = havenCoords(Game);
    const start = snap(Game);
    const nStages = [];
    for (const dir of DIRS) {
      // Fresh game per direction: staging mutates tiles.
      const g2 = await fresh(SEED);
      const st = stageN(g2.Game, dir);
      nStages.push({ dir: dir[2], staged: !!st, staging: st || null,
        posAfterWalk: st ? snap(g2.Game) : null });
    }
    const g3 = await fresh(SEED);
    const cStage = stageC(g3.Game, DIRS[0]);
    results.stage = { haven: hv, start, nStages,
      cStage: cStage ? { ...cStage, posAfterWalk: snap(g3.Game) } : null };
    console.log(JSON.stringify(results, null, 2));
    if (OUT) fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    return;
  }
  // N-track: first stageable direction, gate ON + gate-OFF control.
  let nOn = null, nOff = null, nDirTried = [];
  for (const dir of DIRS) {
    const on = await playEvening(SEED, true, (G) => stageN(G, dir));
    nDirTried.push({ dir: dir[2], staged: on.staged });
    if (!on.staged) continue;
    nOn = on;
    nOff = await playEvening(SEED, false, (G) => stageN(G, dir));
    break;
  }
  results.tracks.N = { dirTried: nDirTried, gateOn: nOn, gateOff: nOff };
  // C-tracks: first stageable direction (prefer W), gate ON.
  let cStageDir = null, cBase = null;
  for (const dir of DIRS) {
    const probe = await fresh(SEED);
    const st = stageC(probe.Game, dir);
    if (st) { cStageDir = dir; cBase = st; break; }
  }
  results.tracks.C_stage = cBase ? { dirName: cBase.dirName, predicted: cBase.predicted } : null;
  if (cStageDir) {
    const monsterId = (() => {
      // First wave-1 monster def available in this Game's data.
      return 'highbeam_deer';
    })();
    // C1: monster on every predicted-path intermediate tile.
    const c1 = await (async () => {
      const { Game, sayLines } = await fresh(SEED);
      const st = stageC(Game, cStageDir);
      if (!st) return { staged: false };
      const pathTiles = (st.predicted || []).slice(0, -1); // exclude haven
      const stagedTiles = [];
      for (const [tx, ty] of pathTiles) {
        try {
          const m = Game.spawnWorldMonster({ id: monsterId }, tx, ty, { mx: 4, my: 4 });
          stagedTiles.push([tx, ty, !!m]);
        } catch (e) { stagedTiles.push([tx, ty, 'err:' + String(e.message).slice(0, 80)]); }
      }
      process.env.COMPETENT_EVENING_DETOUR = '1';
      const posBefore = snap(Game);
      const sayBefore = sayLines.length;
      const rec = nightStep(Game, {});
      const posAfter = snap(Game);
      const detour = rec.detour || null;
      const hitTiles = (detour && detour.steps) ? detour.steps.filter((s) =>
        pathTiles.some(([tx, ty]) => tx === s.to.mapPx && ty === s.to.mapPy)).length : 0;
      return { staged: true, staging: st, stagedTiles, outcome: rec.outcome,
        stoppedReason: detour ? detour.stoppedReason : null,
        detourPath: detour ? detour.path : null, detourSteps: detour ? detour.steps : null,
        stepsWalked: detour ? detour.stepsWalked : null,
        pathTilesHitByInstrument: hitTiles,
        posBefore, posAfter,
        sayTail: sayLines.slice(Math.max(sayBefore, sayLines.length - 30), sayLines.length),
        guards: detour ? checkGuards({ posBefore, posAfter, outcome: rec.outcome }, detour) : null };
    })();
    results.tracks.C1_monsterOnPath = c1;
    // C2: wanderer on the first predicted-path tile.
    const c2 = await (async () => {
      const { Game, sayLines } = await fresh(SEED);
      const st = stageC(Game, cStageDir);
      if (!st) return { staged: false };
      const first = (st.predicted || [])[0];
      let wandererSet = null;
      if (first) {
        try {
          // Wanderer is a GAME-level field (this.wanderer in
          // game.js, not state.wanderer) — staging it on state
          // silently never fires the contact branch (found on
          // the s20101 pilot leg, which therefore did NOT test
          // wanderer contact and is not counted as a C2 attempt).
          Game.wanderer = { x: first[0], y: first[1], dir: 1, monsterId, veteran: false };
          Game.encounterDone = false;
          wandererSet = first;
        } catch (e) { wandererSet = 'err:' + String(e.message).slice(0, 80); }
      }
      process.env.COMPETENT_EVENING_DETOUR = '1';
      const posBefore = snap(Game);
      const sayBefore = sayLines.length;
      const rec = nightStep(Game, {});
      const posAfter = snap(Game);
      const detour = rec.detour || null;
      return { staged: true, staging: st, wandererSet, outcome: rec.outcome,
        stoppedReason: detour ? detour.stoppedReason : null,
        detourPath: detour ? detour.path : null, detourSteps: detour ? detour.steps : null,
        stepsWalked: detour ? detour.stepsWalked : null,
        posBefore, posAfter,
        sayTail: sayLines.slice(Math.max(sayBefore, sayLines.length - 30), sayLines.length),
        guards: detour ? checkGuards({ posBefore, posAfter, outcome: rec.outcome }, detour) : null };
    })();
    results.tracks.C2_wandererOnPath = c2;
    // C3: busy world — monsters on all path tiles + wanderer on first.
    const c3 = await (async () => {
      const { Game, sayLines } = await fresh(SEED);
      const st = stageC(Game, cStageDir);
      if (!st) return { staged: false };
      const pathTiles = (st.predicted || []).slice(0, -1);
      const stagedTiles = [];
      for (const [tx, ty] of pathTiles) {
        try { const m = Game.spawnWorldMonster({ id: monsterId }, tx, ty, { mx: 4, my: 4 }); stagedTiles.push([tx, ty, !!m]); }
        catch (e) { stagedTiles.push([tx, ty, 'err:' + String(e.message).slice(0, 80)]); }
      }
      let wandererSet = null;
      if (pathTiles.length) {
        try { Game.wanderer = { x: pathTiles[0][0], y: pathTiles[0][1], dir: 1, monsterId, veteran: false }; Game.encounterDone = false; wandererSet = pathTiles[0]; }
        catch (e) { wandererSet = 'err:' + String(e.message).slice(0, 80); }
      }
      process.env.COMPETENT_EVENING_DETOUR = '1';
      const posBefore = snap(Game);
      const sayBefore = sayLines.length;
      const rec = nightStep(Game, {});
      const posAfter = snap(Game);
      const detour = rec.detour || null;
      return { staged: true, staging: st, stagedTiles, wandererSet, outcome: rec.outcome,
        stoppedReason: detour ? detour.stoppedReason : null,
        detourPath: detour ? detour.path : null, detourSteps: detour ? detour.steps : null,
        stepsWalked: detour ? detour.stepsWalked : null,
        posBefore, posAfter,
        sayTail: sayLines.slice(Math.max(sayBefore, sayLines.length - 30), sayLines.length),
        guards: detour ? checkGuards({ posBefore, posAfter, outcome: rec.outcome }, detour) : null };
    })();
    results.tracks.C3_busyWorld = c3;
  }
  // Verdicts on guards for FIRED branches (non-firing is data).
  let fail = false;
  const problems = [];
  const checkFired = (label, r) => {
    if (!r || !r.staged || !r.detourPath && !r.detourSteps) {
      // N-track nopath fires with detour.path null — handle separately below.
    }
    if (!r || !r.guards) return;
    const g = r.guards;
    if (g.H1_orthogonal === false || g.H1_chain === false) { fail = true; problems.push(label + ': H1 violated'); }
    if (g.H2_arrivalEqDeparture === false || g.H2_arrivalEqLastStep === false) { fail = true; problems.push(label + ': H2 violated'); }
    if (g.H4_alive === false) { fail = true; problems.push(label + ': H4 death'); }
  };
  if (nOn) checkFired('N', nOn);
  for (const k of ['C1_monsterOnPath', 'C2_wandererOnPath', 'C3_busyWorld']) checkFired(k, results.tracks[k]);
  // H5: gate-OFF control must be travel-refused with no detour.
  if (nOff) {
    if (!(nOff.outcome === 'travel-refused' && !nOff.detourAttempted)) {
      fail = true; problems.push('H5 gate-OFF control failed: outcome=' + nOff.outcome + ' detourAttempted=' + nOff.detourAttempted);
    }
  }
  results.guardProblems = problems;
  results.batteryOk = !fail;
  console.log(JSON.stringify(results, null, 2));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  if (fail) { console.error('GUARD FAILURES: ' + problems.join('; ')); process.exit(1); }
}

main().catch((e) => { console.error('BATTERY ERROR: ' + (e && e.stack || e)); process.exit(2); });
