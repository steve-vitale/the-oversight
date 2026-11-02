#!/usr/bin/env node
// homeconstruct-b-driver.js — CONSTRUCTED-TRIP driver
// (sim-homewardac-b, 2026-11-02). Prereg:
// evidence/2026-11-02/sim-homewardac-b-prereg.md (committed
// BEFORE any judged sim). Structure mirrors
// scripts/homext-abl-b-driver.js (same day-record fields, so
// scripts/analyze-homeward-shapes-b.js reads these legs
// unchanged); the policy set is the constructed-trip pair
// (construct-shadow / construct-armed) and each day record
// additionally carries day.construct (the policy's construction
// report for construction days, null otherwise).
//
// Transport (EPERM-flap rule, as multisweep/entrywindow/roadguard):
// this process NEVER writes files — it prints one JSON line per seed
// to stdout with callback-based writes and backoff retry. The caller
// redirects stdout to a .jsonl file.
//
// Env (FATAL if violated on the judged CLI path):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   POLICY=construct-shadow|construct-armed, DAYS=30, and the packcomp
//   * =1 flags must NOT be 1.
//   CONSTRUCT_SHAPE=A|C, plus the shape's day/route/hop env
//   (parsed by scripts/policies/competent-homewardconstruct-b.js).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { construct, constructShadow, parseRoute, parseHop } = require('./policies/competent-homewardconstruct-b');

function checkEnv() {
  if (process.env.POLICY !== 'construct-shadow' && process.env.POLICY !== 'construct-armed') { console.error('FATAL: POLICY must be construct-shadow or construct-armed'); process.exit(2); }
  if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
  if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
  if (process.env.DEPOSITGATE !== '0') { console.error('FATAL: DEPOSITGATE=0 must be set explicitly'); process.exit(2); }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a homeconstruct leg'); process.exit(2); }
  }
  if (parseInt(process.env.DAYS || '30', 10) !== 30) { console.error('FATAL: DAYS must be 30 for homeconstruct legs'); process.exit(2); }
  if (process.env.CONSTRUCT_SHAPE !== 'A' && process.env.CONSTRUCT_SHAPE !== 'C') { console.error('FATAL: CONSTRUCT_SHAPE must be A or C'); process.exit(2); }
  if (process.env.CONSTRUCT_SHAPE === 'A') {
    if (!parseRoute(process.env.CONSTRUCT_ROUTE_A || '5,4;6,4;7,4;7,3;7,2;7,1').length) { console.error('FATAL: CONSTRUCT_ROUTE_A must parse to >=1 waypoint'); process.exit(2); }
    if (!parseInt(process.env.CONSTRUCT_DAY_A || '5', 10)) { console.error('FATAL: CONSTRUCT_DAY_A must be an int'); process.exit(2); }
  } else {
    if (!parseRoute(process.env.CONSTRUCT_ROUTE_C1 || '4,5;4,6;4,7;4,8;3,8;2,8').length) { console.error('FATAL: CONSTRUCT_ROUTE_C1 must parse to >=1 waypoint'); process.exit(2); }
    if (!parseInt(process.env.CONSTRUCT_DAY_C1 || '5', 10) || !parseInt(process.env.CONSTRUCT_DAY_C2 || '6', 10)) { console.error('FATAL: CONSTRUCT_DAY_C1/C2 must be ints'); process.exit(2); }
    if (!parseHop(process.env.CONSTRUCT_HOP_C2 || '2,8>4,8')) { console.error('FATAL: CONSTRUCT_HOP_C2 must parse'); process.exit(2); }
  }
}
const SEEDS = (process.env.SEEDS || '60307').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = 30;
const POLICY_ID = process.env.POLICY || 'construct-shadow';
const POLICY_OBJ = POLICY_ID === 'construct-armed' ? construct : constructShadow;

function posOf(Game) {
  try { return { x: (Game.map || {}).px ?? null, y: (Game.map || {}).py ?? null }; } catch (e) { return { x: null, y: null }; }
}
function havenOf(Game) {
  try { const v = (Game.state || {}).village || {}; return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; }
}
function snapshot(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return { pos: posOf(Game), haven: havenOf(Game), over: !!Game.over,
      day: s.day || 0, kcal: s.kcal ?? null, hydration: s.hydration ?? null };
  } catch (e) { return { pos: posOf(Game), haven: havenOf(Game), over: null, day: 0, kcal: null, hydration: null }; }
}
function invSig(Game) {
  try {
    return ((Game.state || {}).scholar || {}).inventory.map((it) => ({
      key: (it.plantId || it.name || it.material || it.lumpForm || 'item'),
      plantId: it.plantId || null, name: it.name || null, units: it.units || 0,
      kcalEach: it.kcalEach || 0, hiddenKcal: (it.hiddenKcal == null ? null : it.hiddenKcal),
      foodKind: it.foodKind || null, foodState: it.foodState || null,
      lumpForm: it.lumpForm || null,
    }));
  } catch (e) { return null; }
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
      kcalEach: r.kcalEach, hiddenKcal: r.hiddenKcal, foodKind: r.foodKind, foodState: r.foodState });
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
  const { Game } = await loadGame({ seed, mode: 'homeconstruct-b', fullTelemetry: false });
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
  const baseDaily = POLICY_OBJ.daily.bind(POLICY_OBJ);
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
        } catch (e) { console.error('homeconstruct forage-tap error', e && e.message); }
      }
      return res;
    };
  }
  let prevVetoes = 0, prevSilent = 0, prevLateral = 0, prevCredit = 0, prevSims = 0, prevBeyond = 0, prevHopIdx = 0, prevHomeward = 0, prevOriginPass = 0, prevOriginFail = 0;
  const { escapeCheck } = require('./policies/competent-homewardstep-b');
  const policy = Object.assign({}, POLICY_OBJ, {
    daily(Game2, ctx) {
      st.loopDay++;
      const dayRec = { loopDay: st.loopDay, start: snapshot(Game2), forages: [], end: null,
        vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0, simChecks: 0, beyondUngenerated: 0, homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0, hops: [], dayEndReturnSim: null, construct: null };
      st.days.push(dayRec);
      ctx.constructLoopDay = st.loopDay;
      ctx.constructReport = null;
      baseDaily(Game2, ctx);
      dayRec.end = snapshot(Game2);
      dayRec.construct = ctx.constructReport || null;
      dayRec.vetoes = (ctx.homewardstepVetoes || 0) - prevVetoes;
      dayRec.silentVetoes = (ctx.homewardstepSilentVetoes || 0) - prevSilent;
      dayRec.lateralPasses = (ctx.homewardstepLateralPasses || 0) - prevLateral;
      dayRec.creditUses = (ctx.homewardstepCreditUses || 0) - prevCredit;
      dayRec.simChecks = (ctx.homewardstepSimChecks || 0) - prevSims;
      dayRec.beyondUngenerated = (ctx.homewardstepBeyondUngenerated || 0) - prevBeyond;
      dayRec.homewardVetoes = (ctx.homewardstepHomewardVetoes || 0) - prevHomeward;
      dayRec.vetoOriginPass = (ctx.homewardstepVetoOriginPass || 0) - prevOriginPass;
      dayRec.vetoOriginFail = (ctx.homewardstepVetoOriginFail || 0) - prevOriginFail;
      prevHomeward = ctx.homewardstepHomewardVetoes || 0; prevOriginPass = ctx.homewardstepVetoOriginPass || 0; prevOriginFail = ctx.homewardstepVetoOriginFail || 0;
      prevVetoes = ctx.homewardstepVetoes || 0; prevSilent = ctx.homewardstepSilentVetoes || 0;
      prevLateral = ctx.homewardstepLateralPasses || 0; prevCredit = ctx.homewardstepCreditUses || 0;
      prevSims = ctx.homewardstepSimChecks || 0; prevBeyond = ctx.homewardstepBeyondUngenerated || 0;
      try {
        const log = ctx.homewardstepHopLog || [];
        dayRec.hops = log.slice(prevHopIdx);
        prevHopIdx = log.length;
      } catch (e) { dayRec.hops = []; }
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
    seed, policy: POLICY_ID, days: DAYS,
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
    console.error('homeconstruct policy=' + POLICY_ID + ' days=30 seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' loopDays=' + inst.days.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' homeconstruct JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('HOMECONSTRUCT TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapshot, invSig, invDelta, lumpComp, lumpDelta };
