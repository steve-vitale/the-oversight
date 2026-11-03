#!/usr/bin/env node
// pocketpersist-b-driver.js — POCKET-PERSISTENCE PROBE LEG
// (sim-pocketpersist-b, 2026-11-02). Prereg:
// evidence/2026-11-02/sim-pocketpersist-b-prereg.md (committed
// BEFORE any judged leg).
//
// Trajectory: EXACTLY the homewardac shadow leg — loopDay 5
// constructShadow.daily (forced walk-out 5,4 -> 6,4 -> 7,4 ->
// 7,3 -> 7,2 -> 7,1 through the engine's own travelTo, guard
// in shadow mode, never vetoing), every other day pure
// competent.daily. The ONLY addition over
// scripts/homeconstruct-b-driver.js is READ-ONLY probing:
// on loopDays 5-12 a START probe (before daily) and an END
// probe (after daily) record scholar identity/state, the
// guard's E(D) from the live position, the direct return
// path with per-hop blockers, lateral candidates, live
// travel offers, revealed counts, tile snaps for the
// probe box (x 4..8, y 0..4), and orthogonal neighbour
// hops. Probes call escapeCheck / simulateReturnJump /
// checkHop / travelBlockage / tileAt / travelTargets /
// inventory and ability reads — no travelTo, no say, no
// state writes. Gate G2 (prereg) proves the probes do
// not move the trajectory: probe-leg days 1-12 start/end
// pos+kcal must equal the fresh homeconstruct shadow
// leg's exactly.
//
// Transport (EPERM-flap rule, as homeconstruct): this
// process NEVER writes files — it prints one JSON line
// per seed to stdout with callback-based writes and
// backoff retry. The caller redirects stdout to a .jsonl.
//
// Env (FATAL if violated on the judged CLI path):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   DAYS=30, packcomp *=1 flags must NOT be 1.
//   CONSTRUCT_SHAPE unset or A (the construct policy's
//   defaults carry the shape-A route/day).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { constructShadow, parseRoute } = require('./policies/competent-homewardconstruct-b');
const { escapeCheck, simulateReturnJump, checkHop, offersFrom, lateralCandidates } = require('./policies/competent-homewardstep-b');

function checkEnv() {
  for (const k of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI', 'DEPOSITGATE']) {
    if (process.env[k] !== '0') { console.error('FATAL: ' + k + '=0 must be set explicitly'); process.exit(2); }
  }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a pocketpersist leg'); process.exit(2); }
  }
  if (parseInt(process.env.DAYS || '30', 10) !== 30) { console.error('FATAL: DAYS must be 30 for pocketpersist legs'); process.exit(2); }
  if (process.env.CONSTRUCT_SHAPE && process.env.CONSTRUCT_SHAPE !== 'A') { console.error('FATAL: CONSTRUCT_SHAPE must be unset or A for pocketpersist legs'); process.exit(2); }
  if (!parseRoute(process.env.CONSTRUCT_ROUTE_A || '5,4;6,4;7,4;7,3;7,2;7,1').length) { console.error('FATAL: CONSTRUCT_ROUTE_A must parse to >=1 waypoint'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '69501').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = 30;
const BOX = { x0: 4, x1: 8, y0: 0, y1: 4 };

function posOf(Game) {
  try { return { x: (Game.map || {}).px ?? null, y: (Game.map || {}).py ?? null }; } catch (e) { return { x: null, y: null }; }
}
function havenOf(Game) {
  try { const v = (Game.state || {}).village || {}; return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; }
}
function scholarOf(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return { villagerId: Game.villagerId || s.villagerId || null, day: s.day || 0,
      kcal: s.kcal ?? null, health: s.health ?? null, hydration: s.hydration ?? null };
  } catch (e) { return { villagerId: null, day: 0, kcal: null, health: null, hydration: null }; }
}
function snapshot(Game) {
  const s = scholarOf(Game);
  return { pos: posOf(Game), haven: havenOf(Game), over: !!Game.over, day: s.day,
    kcal: s.kcal, health: s.health, hydration: s.hydration, villagerId: s.villagerId };
}
function invSig(Game) {
  try {
    return ((Game.state || {}).scholar || {}).inventory.map((it) => ({
      key: (it.plantId || it.name || it.material || it.lumpForm || 'item'),
      plantId: it.plantId || null, name: it.name || null, units: it.units || 0,
      kcalEach: it.kcalEach || 0, foodKind: it.foodKind || null, foodState: it.foodState || null,
    }));
  } catch (e) { return null; }
}
function tileSnap(Game, x, y) {
  try {
    const t = Game.tileAt(x, y);
    if (!t) return null;
    return { x, y, type: t.type || null, needsBridge: !!t.needsBridge, bridged: !!t.bridged,
      blockFrom: t.blockFrom ? { dx: t.blockFrom.dx ?? null, dy: t.blockFrom.dy ?? null, type: t.blockFrom.type || null } : null,
      stock: t.stock ?? null, maxStock: t.maxStock ?? null, revealed: !!t.revealed };
  } catch (e) { return { x, y, error: e && e.message }; }
}
function blockSnap(b) {
  if (!b) return null;
  return { kind: b.kind || null, blockType: b.blockType || null, x: b.x ?? null, y: b.y ?? null };
}
function probe(Game, loopDay, phase) {
  const out = { loopDay, phase, snap: snapshot(Game), error: null };
  try {
    const pos = out.snap.pos, hv = out.snap.haven;
    out.inventory = invSig(Game);
    try { out.swimmer = !!(Game.hasAbility && Game.hasAbility('swimmer')); } catch (e) { out.swimmer = null; }
    try {
      const e = escapeCheck(Game, pos.x, pos.y, hv.x, hv.y);
      out.E = { ok: !!e.ok, via: e.via || null, directOk: !!e.directOk, legs: e.legs || 0,
        lateralPath: e.lateralPath || [], creditUsed: e.creditUsed || 0, hops: e.hops || 0,
        beyondUngenerated: e.beyondUngenerated || 0, reason: e.reason || null };
    } catch (e) { out.E = { error: e && e.message }; }
    try {
      const d = simulateReturnJump(Game, pos.x, pos.y, hv.x, hv.y, { credit: 1 });
      const path = d.path || [];
      const hops = [];
      for (let i = 0; i + 1 < path.length; i++) {
        const a = path[i], b = path[i + 1];
        let chk = null, eng = null;
        try { const c = checkHop(Game, a.x, a.y, b.x, b.y); chk = { blockers: c.blockers || [], beyondUngenerated: c.beyondUngenerated || 0 }; } catch (e) { chk = { error: e && e.message }; }
        try { eng = blockSnap(Game.travelBlockage(b.x, b.y, a.x, a.y)); } catch (e) { eng = { error: e && e.message }; }
        hops.push({ from: a, to: b, checkHop: chk, engineBlock: eng });
      }
      out.direct = { ok: !!d.ok, reason: d.reason || null, creditUsed: d.creditUsed || 0,
        hops: d.hops || 0, beyondUngenerated: d.beyondUngenerated || 0, path, pathHops: hops };
    } catch (e) { out.direct = { error: e && e.message }; }
    try {
      const cands = lateralCandidates(Game, pos.x, pos.y, new Set(), new Map());
      out.lateralCandidates = (cands || []).map((c) => ({ x: c.x, y: c.y, d: c.d, blocked: !!c.blocked, blockType: c.blockType || null }));
    } catch (e) { out.lateralCandidates = { error: e && e.message }; }
    try {
      const offers = Game.travelTargets() || [];
      out.offers = offers.map((t) => ({ x: t.x, y: t.y, d: t.d ?? null }));
    } catch (e) { out.offers = { error: e && e.message }; }
    try {
      const tiles = (Game.map && Game.map.tiles) || [];
      let revealedCount = 0;
      for (const row of tiles) for (const t of (row || [])) if (t && t.revealed) revealedCount++;
      out.revealedCount = revealedCount;
    } catch (e) { out.revealedCount = null; }
    out.box = [];
    for (let y = BOX.y0; y <= BOX.y1; y++) for (let x = BOX.x0; x <= BOX.x1; x++) out.box.push(tileSnap(Game, x, y));
    out.neighbours = [];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = pos.x + dx, ny = pos.y + dy;
      let chk = null, eng = null;
      try { const c = checkHop(Game, pos.x, pos.y, nx, ny); chk = { blockers: c.blockers || [], beyondUngenerated: c.beyondUngenerated || 0 }; } catch (e) { chk = { error: e && e.message }; }
      try { eng = blockSnap(Game.travelBlockage(nx, ny, pos.x, pos.y)); } catch (e) { eng = { error: e && e.message }; }
      out.neighbours.push({ to: { x: nx, y: ny }, checkHop: chk, engineBlock: eng, tile: tileSnap(Game, nx, ny) });
    }
  } catch (e) { out.error = 'probe error: ' + (e && (e.stack || e.message)); }
  return out;
}
function lumpComp(Game) {
  const out = {};
  try {
    for (const it of ((Game.state || {}).scholar || {}).inventory || []) {
      if (!it || !it.lump || typeof it.lump !== 'object') continue;
      for (const [pid, e] of Object.entries(it.lump)) {
        const u = (e && typeof e === 'object') ? (e.units || 0) : (typeof e === 'number' ? e : 0);
        if (u) out[pid] = (out[pid] || 0) + u;
      }
    }
  } catch (e) {}
  return out;
}
function invDelta(before, after) {
  if (!before || !after) return null;
  const bmap = new Map();
  for (const r of before) bmap.set(r.key + '|' + (r.foodState || '') + '|' + (r.kcalEach || 0), r);
  const added = [];
  for (const r of after) {
    const k = r.key + '|' + (r.foodState || '') + '|' + (r.kcalEach || 0);
    const b = bmap.get(k);
    const du = r.units - (b ? b.units : 0);
    if (du > 0) added.push({ key: r.key, plantId: r.plantId, name: r.name, units: du,
      kcalEach: r.kcalEach, foodKind: r.foodKind, foodState: r.foodState });
  }
  return added;
}
function lumpDelta(before, after) {
  const out = [];
  for (const [pid, u] of Object.entries(after || {})) {
    const du = u - ((before || {})[pid] || 0);
    if (du > 0) out.push({ pid, units: du });
  }
  return out;
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
  const { Game } = await loadGame({ seed, mode: 'pocketpersist-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 60000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const st = { loopDay: 0, days: [], sayLines };
  const origAction = Game.doAction;
  if (typeof origAction === 'function') {
    Game.doAction = function (kind, opts) {
      if (kind !== 'forage') return origAction.apply(this, arguments);
      const d = st.days[st.days.length - 1] || null;
      const beforeInv = invSig(Game), beforeLump = lumpComp(Game);
      const beforePos = posOf(Game);
      let res = null;
      try { res = origAction.apply(this, arguments); } finally {
        try {
          const ev = { loopDay: st.loopDay, pos: beforePos, ok: !!res,
            added: invDelta(beforeInv, invSig(Game)), addedLump: lumpDelta(beforeLump, lumpComp(Game)) };
          if (d) d.forages.push(ev);
        } catch (e) { console.error('pocketpersist forage-tap error', e && e.message); }
      }
      return res;
    };
  }
  // POLICY PARITY (fix before prereg commit, no judged leg run yet):
  // runDays calls policy.setup + policy.upkeep (3x/day, before daily)
  // in addition to policy.daily. A bare {daily} policy therefore does
  // NOT reproduce the homeconstruct control leg: competent.upkeep runs
  // the morning routine (food/water/gear) that sets day-start kcal.
  // The probe policy is the full constructShadow policy with ONLY daily
  // replaced (probes + day-5 construct branch), so the probe leg IS the
  // control leg plus read-only probes. Daily mix unchanged.
  const policy = Object.assign({}, constructShadow, {
    daily(Game2, ctx) {
      st.loopDay++;
      const dayRec = { loopDay: st.loopDay, start: snapshot(Game2), forages: [], end: null,
        construct: null, startProbe: null, endProbe: null, dayEndReturnSim: null };
      st.days.push(dayRec);
      const probed = st.loopDay >= 5 && st.loopDay <= 12;
      if (probed) dayRec.startProbe = probe(Game2, st.loopDay, 'start');
      if (st.loopDay === 5) {
        ctx.constructLoopDay = st.loopDay;
        ctx.constructReport = null;
        constructShadow.daily(Game2, ctx);
        dayRec.construct = ctx.constructReport || null;
      } else {
        competent.daily(Game2, ctx);
      }
      dayRec.end = snapshot(Game2);
      if (probed) dayRec.endProbe = probe(Game2, st.loopDay, 'end');
      try {
        const e = dayRec.end, hv = e.haven;
        if (e.pos && e.pos.x != null && !(e.pos.x === hv.x && e.pos.y === hv.y)) {
          const sim = escapeCheck(Game2, e.pos.x, e.pos.y, hv.x, hv.y);
          dayRec.dayEndReturnSim = { ok: !!sim.ok, via: sim.via || null, directOk: !!sim.directOk,
            legs: sim.legs || 0, reason: sim.reason || null,
            creditUsed: sim.creditUsed || 0, hops: sim.hops || 0, beyondUngenerated: sim.beyondUngenerated || 0 };
        } else {
          dayRec.dayEndReturnSim = { ok: true, via: 'home', directOk: true, legs: 0, reason: 'home', creditUsed: 0, hops: 0, beyondUngenerated: 0 };
        }
      } catch (e) { dayRec.dayEndReturnSim = { ok: null, reason: 'error:' + (e && e.message), creditUsed: 0, hops: 0, beyondUngenerated: 0 }; }
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: 'pocketpersist-probe', days: DAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    days: st.days, sayLines,
  };
}

async function main() {
  checkEnv();
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    await writeStdout(JSON.stringify(inst) + '\n');
    console.error('pocketpersist policy=probe days=30 seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' loopDays=' + inst.days.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' pocketpersist JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('POCKETPERSIST TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapshot, scholarOf, tileSnap, probe, BOX };
