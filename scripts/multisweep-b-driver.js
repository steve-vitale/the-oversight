#!/usr/bin/env node
// multisweep-b-driver.js — second-trip / multi-sweep tracer.
// Prereg: evidence/2026-11-01/sim-multisweep-b-prereg.md (committed
// BEFORE any judged sim). Same substrate as haulsize (competent, 30d,
// DEPOSITGATE=0), two policies on identical seeds: baseline 'competent'
// (one-sweep behavior) vs armed 'competent-multisweep-b' (up to 3
// sweeps/day after a successful first sweep). Per loopDay: day-start
// snapshot, every travelTo + doAction('forage') call, trip-end snapshot
// when a walk home lands on the haven after a successful forage, every
// returnToVillage call (packcomp rule: live = Game.over false at
// entry), and the multisweep ctx counters at day end. The driver NEVER
// moves the scholar: wrappers count only (assignments + orig
// passthrough). No travelTo, returnToVillage, eat, donateToPantry,
// shellNuts, or identifyPlant call in the judged path.
//
// Transport (EPERM-flap rule, as haulsize): this process NEVER writes
// files — it prints one JSON line per seed to stdout with
// callback-based writes and backoff retry. The caller redirects
// stdout to a .jsonl file.
//
// Env (FATAL if violated on the judged CLI path):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   POLICY=competent|competent-multisweep-b, DAYS=30, and the packcomp
//   * =1 flags must NOT be 1.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { multisweep } = require('./policies/competent-multisweep-b');

function checkEnv() {
  if (process.env.POLICY !== 'competent' && process.env.POLICY !== 'competent-multisweep-b') { console.error('FATAL: POLICY must be competent or competent-multisweep-b'); process.exit(2); }
  if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
  if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
  if (process.env.DEPOSITGATE !== '0') { console.error('FATAL: DEPOSITGATE=0 must be set explicitly'); process.exit(2); }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a multisweep leg'); process.exit(2); }
  }
  if (parseInt(process.env.DAYS || '30', 10) !== 30) { console.error('FATAL: DAYS must be 30 for multisweep legs'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '51809').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = 30;
const POLICY_ID = process.env.POLICY || 'competent';
const POLICY_OBJ = POLICY_ID === 'competent-multisweep-b' ? multisweep : competent;

function numOrNull(fn) {
  try { const v = fn(); return (typeof v === 'number' && isFinite(v)) ? v : null; } catch (e) { return null; }
}
function dayTicksOf(Game) {
  try { const v = (Game.state || {}).scholar || {}; return (v.dayTicks === undefined ? null : v.dayTicks); } catch (e) { return null; }
}
function posOf(Game) {
  try { return { x: (Game.map || {}).px ?? null, y: (Game.map || {}).py ?? null }; } catch (e) { return { x: null, y: null }; }
}
function havenOf(Game) {
  try { const v = (Game.state || {}).village || {}; return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; }
}
function pantryKcal(Game) {
  try {
    let kcal = 0;
    for (const it of ((Game.state || {}).village || {}).pantry || []) kcal += (it.kcalEach || 0) * (it.units || 1);
    return Math.round(kcal);
  } catch (e) { return null; }
}
function packKgCap(Game) {
  return { kg: numOrNull(() => Game.packWeight()), cap: numOrNull(() => Game.packCapacity()) };
}
function knownPlants(Game) {
  try { return Object.keys((Game.state.codex || {}).plants || {}).length; } catch (e) { return null; }
}
function plantKnown(Game, pid) {
  try { if (typeof Game.plantKnown === 'function') return !!Game.plantKnown(pid); } catch (e) {}
  try { return !!((Game.state.codex || {}).plants || {})[pid]; } catch (e) { return null; }
}
function stockedCandidates(Game) {
  try {
    const out = [];
    for (const tt of (Game.travelTargets() || [])) {
      const t = Game.tileAt(tt.x, tt.y);
      if (!t || t.type === 'haven' || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
      let availableCells = null;
      try {
        if (Array.isArray(t.detail)) {
          const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
          let n = 0;
          for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 9; cx++) {
            const c = t.detail[cy] && t.detail[cy][cx];
            if (!FORAGEABLE[c]) continue;
            if (t.detailRegrow && t.detailRegrow[cx + ',' + cy]) continue;
            n++;
          }
          availableCells = n;
        }
      } catch (e) { availableCells = null; }
      out.push({ x: tt.x, y: tt.y, d: tt.d, type: t.type, revealed: !!t.revealed, stock: t.stock, availableCells });
    }
    return out;
  } catch (e) { return null; }
}
function invSig(Game) {
  try {
    return ((Game.state || {}).scholar || {}).inventory.map((it) => ({
      key: (it.plantId || it.name || it.material || 'item'),
      plantId: it.plantId || null, name: it.name || null, units: it.units || 0,
      kcalEach: it.kcalEach || 0, hiddenKcal: (it.hiddenKcal == null ? null : it.hiddenKcal),
      foodKind: it.foodKind || null, foodState: it.foodState || null,
      kg: it.kg || 0, lumpKeys: (it.lump && typeof it.lump === 'object') ? Object.keys(it.lump) : null,
    }));
  } catch (e) { return null; }
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
function packRows(Game) {
  try {
    return ((Game.state || {}).scholar || {}).inventory.map((it) => ({
      name: it.name || null, plantId: it.plantId || null, units: it.units || 0,
      kcalEach: it.kcalEach || 0, hiddenKcal: (it.hiddenKcal == null ? null : it.hiddenKcal),
      foodKind: it.foodKind || null, foodState: it.foodState || null,
      edible: (it.edible === undefined ? null : !!it.edible),
      lump: (it.lump && typeof it.lump === 'object')
        ? Object.keys(it.lump).map((pid) => ({ pid, units: ((it.lump[pid] || {}).units || 0) })) : null,
    }));
  } catch (e) { return null; }
}
function snapshot(Game) {
  const pc = packKgCap(Game);
  return { day: ((Game.state || {}).scholar || {}).day || 0, dayTicks: dayTicksOf(Game),
    pos: posOf(Game), packKg: pc.kg, packCap: pc.cap, knownPlants: knownPlants(Game),
    pantryKcal: pantryKcal(Game), scholarKcal: numOrNull(() => Math.round((Game.state.scholar || {}).kcal || 0)),
    kcalCap: numOrNull(() => Game.kcalCap()), candidates: stockedCandidates(Game) };
}

function installWrappers(Game, st) {
  let inReturn = false, currentReturn = null, inDonate = false, currentDonate = null;
  const homeVillage = () => { try { return (Game.state || {}).village || null; } catch (e) { return null; } };
  const saySlice = (from) => st.sayLines.slice(from).map((x) => x.line);
  const curDay = () => st.days[st.days.length - 1] || null;

  const origTele = Game.tele;
  if (typeof origTele === 'function') {
    Game.tele = function (type, data) {
      const r = origTele.apply(this, arguments);
      try {
        if (type === 'forage' && data) {
          const ev = { loopDay: st.loopDay, cells: data.cells ?? null,
            plants: data.plants || null, kcal: data.kcal ?? null, tile: data.tile || null };
          st.forageTele.push(ev);
          if (st.currentForage) st.currentForage.tele = ev;
        }
      } catch (e) { console.error('multisweep tele-tap error', e && e.message); }
      return r;
    };
  }
  const origLump = Game.addUnknownToLump;
  if (typeof origLump === 'function') {
    Game.addUnknownToLump = function (plant, units) {
      const r = origLump.apply(this, arguments);
      try {
        if (st.currentForage) {
          const pid = (plant && (plant.id || plant.plantId)) || null;
          st.currentForage.unknownGains.push({ plantId: pid, units: units || 0 });
        }
      } catch (e) { console.error('multisweep lump-tap error', e && e.message); }
      return r;
    };
  }
  const origTravel = Game.travelTo;
  if (typeof origTravel === 'function') {
    Game.travelTo = function (x, y) {
      const d = curDay();
      const before = { pos: posOf(Game), ticks: dayTicksOf(Game) };
      let res = null;
      try { res = origTravel.apply(this, arguments); } finally {
        try {
          const after = { pos: posOf(Game), ticks: dayTicksOf(Game) };
          const moved = after.pos.x === x && after.pos.y === y;
          const ev = { loopDay: st.loopDay, from: before.pos, to: { x, y },
            moved, ticksDelta: (before.ticks == null || after.ticks == null) ? null : after.ticks - before.ticks,
            blocked: (res && (res.blockType || res.blocked)) ? (res.blockType || 'blocked') : null };
          if (d) d.travels.push(ev);
          if (d && moved && !d.tripEnd) {
            const hv = havenOf(Game);
            if (after.pos.x === hv.x && after.pos.y === hv.y && (d.forages || []).some((f) => f.ok)) {
              const pc = packKgCap(Game);
              d.tripEnd = { dayTicks: after.ticks, ticksRemaining: (after.ticks == null ? null : 512 - after.ticks),
                packKg: pc.kg, packCap: pc.cap, candidatesRemaining: stockedCandidates(Game) };
            }
          }
        } catch (e) { console.error('multisweep travel-tap error', e && e.message); }
      }
      return res;
    };
  }
  const origAction = Game.doAction;
  if (typeof origAction === 'function') {
    Game.doAction = function (kind, opts) {
      if (kind !== 'forage') return origAction.apply(this, arguments);
      const d = curDay();
      const sayFrom = st.sayLines.length;
      const before = { pos: posOf(Game), ticks: dayTicksOf(Game), inv: invSig(Game) };
      const pc0 = packKgCap(Game);
      let tileType = null;
      try { const t = Game.tileAt(before.pos.x, before.pos.y); tileType = t ? t.type : null; } catch (e) {}
      const ev = { loopDay: st.loopDay, pos: before.pos, tileType, ticksBefore: before.ticks,
        packKgBefore: pc0.kg, packCapBefore: pc0.cap, unknownGains: [], tele: null };
      const prevCurrent = st.currentForage;
      st.currentForage = ev;
      let res = null;
      try { res = origAction.apply(this, arguments); } finally {
        st.currentForage = prevCurrent;
        try {
          const after = { pos: posOf(Game), ticks: dayTicksOf(Game) };
          const pc1 = packKgCap(Game);
          ev.ok = !!res;
          ev.ticksDelta = (before.ticks == null || after.ticks == null) ? null : after.ticks - before.ticks;
          ev.packKgAfter = pc1.kg; ev.packCapAfter = pc1.cap;
          ev.sayDuring = saySlice(sayFrom);
          ev.added = invDelta(before.inv, invSig(Game));
          for (const row of (ev.added || [])) {
            if (row.plantId) row.known = plantKnown(Game, row.plantId);
          }
          if (d) d.forages.push(ev);
        } catch (e) { console.error('multisweep forage-tap error', e && e.message); }
      }
      return res;
    };
  }
  const origDeposit = Game.depositPantryPieces;
  if (typeof origDeposit === 'function') {
    Game.depositPantryPieces = function (v, src, pieceKcal) {
      let deposited = 0;
      try { deposited = origDeposit.apply(this, arguments); } finally {
        try {
          if (v === homeVillage() && deposited > 0) {
            const kind = inReturn ? 'unload' : (inDonate ? 'donate' : 'other');
            st.deposits.push({ loopDay: st.loopDay, kind, kcal: Math.round(deposited) });
            if (inReturn && currentReturn) currentReturn.unloadKcal += Math.round(deposited);
            if (inDonate && currentDonate) currentDonate.donateKcal += Math.round(deposited);
          }
        } catch (e) { console.error('multisweep deposit-log error', e && e.message); }
      }
      return deposited;
    };
  }
  const origReturn = Game.returnToVillage;
  if (typeof origReturn === 'function') {
    Game.returnToVillage = function (...args) {
      const overAtEntry = !!Game.over;
      const sayBefore = st.sayLines.length;
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0,
        overAtEntry, packBefore: packRows(Game), pantryBefore: pantryKcal(Game),
        unloadKcal: 0, packAfter: null, pantryAfter: null,
        gateEngagedAtEntry: numOrNull(() => (Game._depositGateEngaged() ? 1 : 0)),
        gateEngagedAtExit: null, sayBefore, sayAfter: null };
      const prevInReturn = inReturn, prevCurrent = currentReturn;
      inReturn = true; currentReturn = rec;
      try { return origReturn.apply(this, args); } finally {
        inReturn = prevInReturn; currentReturn = prevCurrent;
        rec.packAfter = packRows(Game); rec.pantryAfter = pantryKcal(Game);
        rec.gateEngagedAtExit = numOrNull(() => (Game._depositGateEngaged() ? 1 : 0));
        rec.sayAfter = st.sayLines.length;
        st.homecomings.push(rec);
      }
    };
  }
  const origDonate = Game.donateToPantry;
  if (typeof origDonate === 'function') {
    Game.donateToPantry = function (idx, units) {
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0, donateKcal: 0 };
      const prevInDonate = inDonate, prevCurrent = currentDonate;
      inDonate = true; currentDonate = rec;
      try { return origDonate.apply(this, arguments); } finally {
        inDonate = prevInDonate; currentDonate = prevCurrent;
        st.donates.push(rec);
      }
    };
  }
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
  const { Game } = await loadGame({ seed, mode: 'multisweep-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 60000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('multisweep say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const st = { loopDay: 0, days: [], homecomings: [], deposits: [], donates: [],
    forageTele: [], sayLines, currentForage: null };
  installWrappers(Game, st);
  let callIdx = 0;
  const baseDaily = POLICY_OBJ.daily.bind(POLICY_OBJ);
  const policy = Object.assign({}, POLICY_OBJ, {
    daily(Game2, ctx) {
      callIdx++;
      st.loopDay = callIdx;
      const dayRec = { loopDay: callIdx, start: snapshot(Game2), travels: [], forages: [], tripEnd: null, end: null };
      st.days.push(dayRec);
      baseDaily(Game2, ctx);
      dayRec.end = snapshot(Game2);
      dayRec.multisweep = { baseSuccesses: ctx.multisweepBaseSuccesses || 0,
        extraTrips: ctx.multisweepExtraTrips || 0, extraSuccesses: ctx.multisweepExtraSuccesses || 0 };
      // Counters above are cumulative across days in ctx; the analyzer
      // re-derives per-day values from forages, and uses these only as
      // a cross-check total. Per-day deltas are computed by the driver
      // wrapper below via the stored previous totals.
      dayRec.successfulForages = dayRec.forages.filter((f) => f.ok).length;
      dayRec.secondTripAttempted = dayRec.successfulForages > 1;
    },
  });
  // Per-day multisweep deltas: wrap the policy daily once more so the
  // dayRec above carries this day's extra trips, not the running total.
  const innerDaily = policy.daily;
  let prevExtra = 0, prevExtraSucc = 0, prevBase = 0;
  policy.daily = function (Game2, ctx) {
    innerDaily(Game2, ctx);
    const d = st.days[st.days.length - 1];
    if (d) {
      const e = ctx.multisweepExtraTrips || 0, es = ctx.multisweepExtraSuccesses || 0, b = ctx.multisweepBaseSuccesses || 0;
      d.multisweep = { baseSuccesses: b - prevBase, extraTrips: e - prevExtra, extraSuccesses: es - prevExtraSucc };
      prevExtra = e; prevExtraSucc = es; prevBase = b;
    }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: POLICY_ID, days: DAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    days: st.days, homecomings: st.homecomings, deposits: st.deposits, donates: st.donates,
    forageTele: st.forageTele, sayLines,
  };
}

async function main() {
  checkEnv();
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    await writeStdout(JSON.stringify(inst) + '\n');
    const live = inst.homecomings.filter((h) => !h.overAtEntry);
    console.error('multisweep policy=' + POLICY_ID + ' days=30 seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' loopDays=' + inst.days.length +
      ' liveReturns=' + live.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' multisweep JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('MULTISWEEP TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapshot, stockedCandidates, invDelta, packRows };
