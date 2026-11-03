#!/usr/bin/env node
// creekhop-b-recorder.js — GUARD-E CREEK-HOP FIDELITY RECORDER
// (sim-guarde-creekhop-b, Loop B food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-guarde-creekhop-b-prereg.md
// (committed BEFORE any judged sim).
//
// Recorder only: zero src/js changes, zero edits to competent.js
// or the guard policy, zero default flips. The guard functions
// escapeCheck + checkHop are imported VERBATIM from
// competent-homewardstep-b.js; the recorder computes the guard's
// numbers directly instead of installing the guard, because the
// shadow guard cannot change a trajectory (it never vetoes,
// never says) — so this leg is trajectory-identical to the
// homewardac shadow leg while recording strictly more per hop.
//
// Per forced hop (homewardac shape-A route, day 5), recorded
// BEFORE the travelTo call from live state:
//   (a) E = escapeCheck(dest) — the guard's allow prediction;
//   (b) entry = checkHop(origin, dest) — the guard's own hop
//       model, hop origin passed explicitly;
//   (c) engineBlock = Game.travelBlockage(dest, origin) — the
//       engine's destination check, same explicit origin;
//   (d) destination tile at hop time: type, needsBridge,
//       bridged, blockFrom; (e) swimmer ability.
// AFTER the call: moved (pos == dest) + say lines spoken
// during the call. Walk-out stops at the first refusal,
// mirroring the construct policy's break.
//
// Transport (EPERM-flap rule, as homeconstruct): this process
// NEVER writes files — it prints one JSON line per seed to
// stdout with callback-based writes and backoff retry. The
// caller redirects stdout to a .jsonl file.
//
// Env (FATAL if violated):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   packcomp *=1 flags must NOT be 1 (same list as the
//   homeconstruct driver).
//   SEEDS=comma list (default 69502)
//   CONSTRUCT_ROUTE_A (default '5,4;6,4;7,4;7,3;7,2;7,1')
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { escapeCheck, checkHop } = require('./policies/competent-homewardstep-b');

function checkEnv() {
  for (const k of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI', 'DEPOSITGATE']) {
    if (process.env[k] !== '0') { console.error('FATAL: ' + k + '=0 must be set explicitly'); process.exit(2); }
  }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a creekhop leg'); process.exit(2); }
  }
}
function parseRoute(str) {
  if (!str) return [];
  return str.split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
    const m = s.match(/^(-?\d+),(-?\d+)$/);
    if (!m) return null;
    return { x: parseInt(m[1], 10), y: parseInt(m[2], 10) };
  }).filter(Boolean);
}
const SEEDS = (process.env.SEEDS || '69502').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const ROUTE = parseRoute(process.env.CONSTRUCT_ROUTE_A || '5,4;6,4;7,4;7,3;7,2;7,1');
if (!ROUTE.length) { console.error('FATAL: CONSTRUCT_ROUTE_A must parse to >=1 waypoint'); process.exit(2); }

function posOf(Game) {
  try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return { x: null, y: null }; }
}
function havenOf(Game) {
  try { const v = (Game.state || {}).village || {}; return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; }
}
function tileSnap(Game, x, y) {
  try {
    const t = Game.tileAt(x, y);
    if (!t) return null;
    return { type: t.type || null, needsBridge: !!t.needsBridge, bridged: !!t.bridged,
      blockFrom: t.blockFrom ? { dx: t.blockFrom.dx ?? null, dy: t.blockFrom.dy ?? null, type: t.blockFrom.type || null } : null };
  } catch (e) { return { error: e && e.message }; }
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
  const { Game } = await loadGame({ seed, mode: 'creekhop-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 60000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const st = { loopDay: 0, day5Start: null, day5Over: null, hops: [], error: null };
  const policy = {
    daily(Game2, ctx) {
      st.loopDay++;
      try {
        if (st.loopDay < 5) { competent.daily(Game2, ctx); return; }
        if (st.loopDay > 5) return;
        // Loop day 5: forced walk-out, recorder edition.
        st.day5Start = posOf(Game2);
        st.day5Over = !!Game2.over;
        const hv = havenOf(Game2);
        for (const wp of ROUTE) {
          if (Game2.over) { st.hops.push({ from: posOf(Game2), to: wp, attempted: false, moved: false, reason: 'over' }); break; }
          const before = posOf(Game2);
          if (before.x === wp.x && before.y === wp.y) { st.hops.push({ from: before, to: wp, attempted: false, moved: true, reason: 'already-there' }); continue; }
          // (a) guard E from the destination, (b) guard hop model,
          // (c) engine destination check, (d) tile, (e) swimmer —
          // all BEFORE the call, from live state.
          let esc = null, entry = null, engineBlock = null, swimmer = null;
          try { esc = escapeCheck(Game2, wp.x, wp.y, hv.x, hv.y); } catch (e) { esc = { error: e && e.message }; }
          try { entry = checkHop(Game2, before.x, before.y, wp.x, wp.y); } catch (e) { entry = { error: e && e.message }; }
          try { const b = Game2.travelBlockage(wp.x, wp.y, before.x, before.y); engineBlock = b ? { kind: b.kind || null, blockType: b.blockType || null, x: b.x ?? null, y: b.y ?? null } : null; } catch (e) { engineBlock = { error: e && e.message }; }
          try { swimmer = !!(Game2.hasAbility && Game2.hasAbility('swimmer')); } catch (e) { swimmer = null; }
          const tile = tileSnap(Game2, wp.x, wp.y);
          const sayBefore = sayLines.length;
          let res = null;
          try { res = Game2.travelTo(wp.x, wp.y); } catch (e) { res = null; }
          const after = posOf(Game2);
          const moved = after.x === wp.x && after.y === wp.y;
          st.hops.push({ from: before, to: wp, attempted: true, moved, reason: moved ? 'ok' : 'refused',
            E: esc ? { ok: !!esc.ok, via: esc.via || null, directOk: !!esc.directOk, legs: esc.legs || 0, creditUsed: esc.creditUsed || 0, reason: esc.reason || null } : null,
            entry: entry ? { blockers: entry.blockers || null, beyondUngenerated: entry.beyondUngenerated || 0 } : null,
            engineBlock, tile, swimmer,
            sayLines: sayLines.slice(sayBefore).map((s) => s.line) });
          if (!moved) break; // mirror the construct policy: walk-out ends here
        }
      } catch (e) { st.error = 'daily error: ' + (e && (e.stack || e.message)); }
    },
  };
  const result = await runDays(Game, policy, { days: 5, manifest: null });
  return { seed, loopDays: st.loopDay, endReason: result.endReason, gameDays: result.gameDays,
    day5Start: st.day5Start, day5Over: st.day5Over, hops: st.hops, error: st.error };
}

async function main() {
  checkEnv();
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    await writeStdout(JSON.stringify(inst) + '\n');
    console.error('creekhop policy=recorder days=5 seed=' + seed + ' end=' + inst.endReason + ' hops=' + inst.hops.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' creekhop JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('CREEKHOP TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, parseRoute };
