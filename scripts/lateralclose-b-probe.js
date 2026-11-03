#!/usr/bin/env node
// lateralclose-b-probe.js — LATERAL-CLOSE PROBE DRIVER
// (sim-lateralclose-b, Loop B food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-lateralclose-b-prereg.md
// (committed BEFORE any judged leg).
//
// What it does: runs ONE seed for 12 competent days under a
// wrapper policy that probes (full 81-tile E-map + full map
// snapshot) at each daily() entry, then a final probe. Probing
// is read-only: escapeCheck simulates against live state and
// mutates nothing (as at destfirst); this driver never calls
// genDetail, never installs the guard, never vetoes, never
// touches src/js or any policy default.
//
// Modes (env):
//   SEED=<int> (required, one seed per process invocation).
//   DAYS=<int, default 12> — runDays length.
//   STOP_PROBE=<k> + APPLY_DIFF=<json> + EVAL_TILE="x,y":
//     counterfactual replay mode (an experiment, never a judged
//     leg). At probe k, after capturing the snapshot, apply the
//     diff, re-run escapeCheck on EVAL_TILE, print
//     REPLAY_SNAPSHOT + COUNTERFACTUAL lines, and exit.
//     APPLY_DIFF classes: stock {k:v}, revealed {k:v},
//     terrain {k:{type,blockFrom,bridged,needsBridge,bridgeFrom}},
//     beyond {k:tile|null}, haven {x,y}.
//   SENSE=1: say-tee mode. Game.say is wrapped to log lines
//     (with game-day) to stderr as "SAY <json>"; the wrapper
//     calls no RNG and changes no trajectory. Progress logs
//     are suppressed in this mode so stderr holds only SAY lines.
//
// Output: probe records (one JSON object per line) to stdout.
// The process buffers lines and flushes with writeSync + retry
// (EPERM-flap rule: wait and retry, never truncate). Callers
// redirect stdout to evidence/2026-11-02/
// sim-lateralclose-b-probe-<seed>.jsonl.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { escapeCheck } = require('./policies/competent-homewardstep-b');

const SEED = parseInt(process.env.SEED || '', 10);
const DAYS = parseInt(process.env.DAYS || '12', 10);
const STOP_PROBE = process.env.STOP_PROBE === undefined ? null : parseInt(process.env.STOP_PROBE, 10);
const EVAL_TILE = process.env.EVAL_TILE || null;
const SENSE = process.env.SENSE === '1';
let APPLY_DIFF = null;
if (process.env.APPLY_DIFF) {
  try { APPLY_DIFF = JSON.parse(process.env.APPLY_DIFF); }
  catch (e) { console.error('FATAL: APPLY_DIFF is not valid JSON'); process.exit(2); }
}

function havenOf(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) };
  } catch (e) { return { x: 4, y: 4 }; }
}

function tileKey(x, y) { return x + ',' + y; }

// Normalized E-relevant snapshot of one tile object. Normalized
// so judged and replayed snapshots compare exactly: bridged /
// needsBridge as booleans, blockFrom / bridgeFrom as objects
// or null, missing stock as 0, missing vigor as null.
function snapTile(t) {
  if (!t) return null;
  return {
    type: t.type || null,
    stock: (t.stock === undefined || t.stock === null) ? 0 : t.stock,
    maxStock: (t.maxStock === undefined || t.maxStock === null) ? 0 : t.maxStock,
    vigor: (t.vigor === undefined || t.vigor === null) ? null : t.vigor,
    pressure: t.foragePressure || 0,
    revealed: !!t.revealed,
    blockFrom: t.blockFrom ? JSON.parse(JSON.stringify(t.blockFrom)) : null,
    bridged: !!t.bridged,
    needsBridge: !!t.needsBridge,
    bridgeFrom: t.bridgeFrom ? JSON.parse(JSON.stringify(t.bridgeFrom)) : null,
  };
}

// Full map snapshot: 9x9 board + beyond ring (-2..10, outside
// the board only). Beyond tiles are snapshotted with the same
// normalized shape; absent beyond coords are simply absent.
function snapMap(Game) {
  const board = {};
  let rows = [];
  try { rows = (Game.map && Game.map.tiles) || []; } catch (e) { rows = []; }
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y] || [];
    for (let x = 0; x < row.length; x++) board[tileKey(x, y)] = snapTile(row[x]);
  }
  const beyond = {};
  for (let y = -2; y <= 10; y++) for (let x = -2; x <= 10; x++) {
    if (x >= 0 && x <= 8 && y >= 0 && y <= 8) continue;
    let t = null;
    try { t = Game.tileAt(x, y); } catch (e) { t = null; }
    if (t) beyond[tileKey(x, y)] = snapTile(t);
  }
  return { board, beyond };
}

function probeAll(Game, hx, hy) {
  const out = {};
  for (let y = 0; y <= 8; y++) for (let x = 0; x <= 8; x++) {
    try {
      const e = escapeCheck(Game, x, y, hx, hy);
      out[tileKey(x, y)] = { ok: !!e.ok, directOk: !!e.directOk, via: e.via || null,
        legs: e.legs || 0, reason: e.reason || null,
        lateralPath: (e.lateralPath || []).map((p) => tileKey(p.x, p.y)) };
    } catch (err) { out[tileKey(x, y)] = { error: String(err && err.message) }; }
  }
  return out;
}

const outLines = [];
function writeSyncRetry(str) {
  let tries = 0;
  for (;;) {
    tries++;
    try { fs.writeSync(1, str); return; }
    catch (e) {
      if (tries >= 12) throw e;
      try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000); } catch (e2) {}
    }
  }
}
function flushOut() {
  if (!outLines.length) return;
  writeSyncRetry(outLines.join(''));
  outLines.length = 0;
}

function applyDiff(Game, diff) {
  const rows = (Game.map && Game.map.tiles) || [];
  const boardTile = (k) => {
    const [x, y] = k.split(',').map(Number);
    return (rows[y] || [])[x] || null;
  };
  if (diff.stock) for (const [k, v] of Object.entries(diff.stock)) {
    const t = boardTile(k); if (t) t.stock = v;
  }
  if (diff.revealed) for (const [k, v] of Object.entries(diff.revealed)) {
    const t = boardTile(k); if (t) t.revealed = v;
  }
  if (diff.terrain) for (const [k, v] of Object.entries(diff.terrain)) {
    const t = boardTile(k); if (!t) continue;
    if (v.type !== undefined) t.type = v.type;
    if (v.blockFrom === null) delete t.blockFrom; else if (v.blockFrom) t.blockFrom = JSON.parse(JSON.stringify(v.blockFrom));
    if (v.bridgeFrom === null) delete t.bridgeFrom; else if (v.bridgeFrom) t.bridgeFrom = JSON.parse(JSON.stringify(v.bridgeFrom));
    if (v.bridged !== undefined) t.bridged = v.bridged;
    if (v.needsBridge !== undefined) t.needsBridge = v.needsBridge;
  }
  if (diff.beyond) {
    Game.map.beyond = Game.map.beyond || {};
    for (const [k, v] of Object.entries(diff.beyond)) {
      if (v === null) delete Game.map.beyond[k];
      else Game.map.beyond[k] = JSON.parse(JSON.stringify(v));
    }
  }
  if (diff.haven) {
    try {
      Game.state.village.px = diff.haven.x;
      Game.state.village.py = diff.haven.y;
    } catch (e) {}
  }
}

async function main() {
  if (!SEED) { console.error('FATAL: SEED must be a non-empty int'); process.exit(2); }
  if (STOP_PROBE !== null && (!EVAL_TILE || !APPLY_DIFF)) {
    console.error('FATAL: STOP_PROBE requires EVAL_TILE and APPLY_DIFF'); process.exit(2);
  }
  const { Game } = await loadGame({ seed: SEED, mode: 'lateralclose-b', fullTelemetry: false });
  await setupGame(Game);

  // SENSE tee: log say lines (with game-day) to stderr. The
  // wrapper calls no RNG; the underlying say is unchanged.
  if (SENSE) {
    const origSay = Game.say ? Game.say.bind(Game) : null;
    if (origSay) {
      Game.say = function (...args) {
        try {
          const d = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0;
          fs.writeSync(2, 'SAY ' + JSON.stringify({ day: d, text: String(args[0]) }) + '\n');
        } catch (e) {}
        return origSay.apply(Game, args);
      };
    }
  }

  let probeIndex = -1;
  const doProbe = () => {
    probeIndex++;
    const haven = havenOf(Game);
    let swimmer = false;
    try { swimmer = !!Game.hasAbility('swimmer'); } catch (e) { swimmer = false; }
    let maxWave = 1;
    try { maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { maxWave = 1; }
    const rec = {
      seed: SEED,
      probeIndex,
      gameDay: (Game.state && Game.state.scholar && Game.state.scholar.day) || 0,
      scholarPos: { x: Game.map.px, y: Game.map.py },
      over: !!Game.over,
      villageLost: !!Game.villageLost,
      haven,
      swimmer,
      maxWaveUnlocked: maxWave,
      map: snapMap(Game),
      emap: probeAll(Game, haven.x, haven.y),
    };
    outLines.push(JSON.stringify(rec) + '\n');
    if (STOP_PROBE !== null && probeIndex === STOP_PROBE) {
      flushOut();
      writeSyncRetry('REPLAY_SNAPSHOT ' + JSON.stringify(rec) + '\n');
      applyDiff(Game, APPLY_DIFF);
      const [tx, ty] = EVAL_TILE.split(',').map(Number);
      const e = escapeCheck(Game, tx, ty, havenOf(Game).x, havenOf(Game).y);
      writeSyncRetry('COUNTERFACTUAL ' + JSON.stringify({
        tile: EVAL_TILE, ok: !!e.ok, directOk: !!e.directOk, via: e.via || null,
        legs: e.legs || 0, reason: e.reason || null,
        lateralPath: (e.lateralPath || []).map((p) => tileKey(p.x, p.y)),
      }) + '\n');
      process.exit(0);
    }
  };

  const wrapper = { id: 'lateralclose-probe', daily(Game2, ctx) {
    doProbe();
    competent.daily(Game2, ctx);
  } };
  const result = await runDays(Game, wrapper, { days: DAYS, manifest: null });
  doProbe(); // final probe after the run
  flushOut();
  if (!SENSE) {
    console.error('lateralclose probe seed=' + SEED + ' probes=' + (probeIndex + 1) +
      ' end=' + result.endReason + ' daysAlive=' + result.days +
      ' gameDay=' + ((Game.state && Game.state.scholar && Game.state.scholar.day) || 0));
  }
}

if (require.main === module) {
  main().catch((e) => { console.error('LATERALCLOSE TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { snapTile, snapMap, probeAll, havenOf, applyDiff };
