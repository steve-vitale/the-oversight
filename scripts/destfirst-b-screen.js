#!/usr/bin/env node
// destfirst-b-screen.js — DESTINATION-FIRST screener (sim-destfirst-b,
// Loop B food-economy arm, 2026-11-02). Prereg:
// evidence/2026-11-02/sim-destfirst-b-prereg.md (committed BEFORE
// any judged sim; screening itself is not judged).
//
// Why this exists: the 1636Z homewardac pilot judged shape A
// SUBSTRATE-FAIL and shape C NO-GO because FIXED forced routes
// landed on destinations pocketed on 0/16 trips (fixed destinations
// never satisfied either shape's full precondition). This screener
// reverses the order: it probes the shape precondition FIRST —
// per seed, per home-board tile, at two times (day-1 start and
// day-5 start, i.e. after four competent days) — and only then
// does stage 2 force trips toward tiles that qualify.
//
// What it is NOT: it never constructs a trip, never installs the
// guard, never judges. escapeCheck is read-only (it simulates
// returns against live revealed/stock state; it mutates nothing),
// so probing cannot change the trajectory it measures. The
// competent days 1-4 run through the ordinary competent.daily,
// exactly as the judged legs' pre-trip days do.
//
// Screen classes (per state, reported separately, never pooled
// into a single "hit" without the class label):
//   A-LAT:    directOk=false, ok=true (via lateral) — the tile's
//             direct escape fails but a lateral escape passes.
//   A-POCKET: ok=false — no direct or lateral escape passes.
//   C-PAIR:   adjacent (O,D) with E(O).ok=true and E(D).ok=false
//             at the SAME probed state — a pocketed destination
//             next to escapable ground.
// A screen hit is a CANDIDATE, never a setup: stage 2 (shadow-only
// homeconstruct runs, scripts/homeconstruct-b-driver.js UNCHANGED)
// must still confirm it on the real trip (A: walk-out completes
// to P, all hop-time E pass, shadow day-end E false; C: day-6
// start off haven, attempt hop to D offered, shadow hop E false).
// The judged band is built ONLY from stage-2 confirmations, in
// seed order, per the prereg selection rule.
//
// Transport (EPERM-flap rule, as homeconstruct): this process
// NEVER writes files — one JSON line per seed to stdout with
// callback-based writes and backoff retry. The caller redirects
// stdout to a .jsonl file.
//
// Env: SEEDS (csv, required). No substrate flags: the screen runs
// plain competent (the judged legs' driver-enforced flags affect
// only pantry/feat/seat behaviour, not map geometry; the day-5
// start state is re-derived identically by the judged legs'
// pre-trip days, and stage 2 re-confirms on the real substrate).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { escapeCheck } = require('./policies/competent-homewardstep-b');

const SEEDS = (process.env.SEEDS || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

function havenOf(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) };
  } catch (e) { return { x: 4, y: 4 }; }
}

// Probe every home-board tile at the CURRENT game state.
// Returns map "x,y" -> {ok, directOk, via, legs, reason} (or {error}).
function probeAll(Game, hx, hy) {
  const out = {};
  for (let y = 0; y <= 8; y++) {
    for (let x = 0; x <= 8; x++) {
      try {
        const e = escapeCheck(Game, x, y, hx, hy);
        out[x + ',' + y] = { ok: !!e.ok, directOk: !!e.directOk, via: e.via || null,
          legs: e.legs || 0, reason: e.reason || null };
      } catch (err) { out[x + ',' + y] = { error: String(err && err.message) }; }
    }
  }
  return out;
}

// Classify one probed state into screen classes. Pure function
// (proof-tested on fixtures); the caller runs it per state.
function classifyState(emap) {
  const aLat = [], aPocket = [];
  for (const [k, e] of Object.entries(emap)) {
    if (!e || e.error) continue;
    if (e.ok === false) aPocket.push(k);
    else if (e.directOk === false) aLat.push(k);
  }
  const cPairs = [];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [k, e] of Object.entries(emap)) {
    if (!e || e.error || e.ok !== true) continue;
    const [ox, oy] = k.split(',').map(Number);
    for (const [dx, dy] of dirs) {
      const dk = (ox + dx) + ',' + (oy + dy);
      const d = emap[dk];
      if (d && !d.error && d.ok === false) cPairs.push({ origin: k, dest: dk });
    }
  }
  return { aLat, aPocket, cPairs };
}

// Deterministic BFS over the 9x9 board (adjacent steps only),
// neighbor order east, south, west, north. Returns the waypoint
// list excluding the start, including the destination, or [] if
// unreachable (never happens on an open grid).
function bfsRoute(from, to) {
  const key = (p) => p.x + ',' + p.y;
  const seen = new Map([[key(from), null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur.x === to.x && cur.y === to.y) {
      const path = [];
      let p = cur;
      while (p && !(p.x === from.x && p.y === from.y)) { path.unshift(p); p = seen.get(key(p)); }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
      const np = { x: nx, y: ny };
      if (seen.has(key(np))) continue;
      seen.set(key(np), cur);
      queue.push(np);
    }
  }
  return [];
}

function writeStdout(str) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const attempt = () => {
      tries++;
      try {
        process.stdout.write(str, (err) => {
          if (err) { if (tries < 12) setTimeout(attempt, 1000); else reject(err); }
          else resolve();
        });
      } catch (e) { if (tries < 12) setTimeout(attempt, 1000); else reject(e); }
    };
    attempt();
  });
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'destfirst-b', fullTelemetry: false });
  await setupGame(Game);
  const haven = havenOf(Game);
  const day1 = probeAll(Game, haven.x, haven.y);
  const policy = { id: 'competent', daily(Game2, ctx) { competent.daily(Game2, ctx); } };
  const result = await runDays(Game, policy, { days: 4, manifest: null });
  const day5start = probeAll(Game, haven.x, haven.y);
  return {
    seed, haven,
    daysAlive: result.days, endReason: result.endReason, over: !!Game.over,
    probe: { day1, day5start },
    screen: { day1: classifyState(day1), day5start: classifyState(day5start) },
  };
}

async function main() {
  if (!SEEDS.length) { console.error('FATAL: SEEDS must be a non-empty csv'); process.exit(2); }
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    await writeStdout(JSON.stringify(inst) + '\n');
    console.error('destfirst screen seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive +
      ' day1 aLat=' + inst.screen.day1.aLat.length + ' aPocket=' + inst.screen.day1.aPocket.length +
      ' cPairs=' + inst.screen.day1.cPairs.length +
      ' day5 aLat=' + inst.screen.day5start.aLat.length + ' aPocket=' + inst.screen.day5start.aPocket.length +
      ' cPairs=' + inst.screen.day5start.cPairs.length);
  }
  console.error('wrote ' + SEEDS.length + ' destfirst screen JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('DESTFIRST TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { probeAll, classifyState, bfsRoute, havenOf };
