#!/usr/bin/env node
// scholaraway-trace-b.js — scholar-presence census tracer (DIAG ONLY).
// (sim-scholaraway-b; prereg: evidence/2026-11-01/sim-scholaraway-b-prereg.md,
// committed BEFORE any judged sim.)
//
// Per seed, competent policy, 30 days: morning/evening snapshots of the
// scholar's OWN state (position, haven tile, presence gate, pack, tent)
// plus every homecoming (wrapped returnToVillage, non-death-path) and
// every home-village deposit (wrapped depositPantryPieces, unload = in a
// returnToVillage call OR stack matches /returnToVillage/).
//
// PERCEPTION LAW: presence comes only from the scholar's own
// Game.map.px/py, Game.state.village.px/py, Game.playerAtHaven(), and
// Game.state.scholar.lastHavenDay — never a roster or list. The driver
// NEVER moves the scholar: no travelTo, no returnToVillage, no eat, no
// other state-moving call in the judged path. Wrappers count only.
//
// Transport (EPERM-flap rule, supplyleg precedent): this process NEVER
// writes files — it prints one JSON line per seed to stdout. The caller
// redirects stdout to a .jsonl file in evidence/ and splits it afterwards
// with scripts/split-absencehunt-jsonl-b.js (reused verbatim).
//
// Env (same substrate gates as supplyleg, plus the standing-home gate
// made explicit; FATAL if violated):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=competent, DAYS=30
//   COMPETENT_STANDING_HOME / COMPETENT_ROUTE_AROUND /
//   COMPETENT_TRIPHOME_ROUTE_AROUND / WOODCARRY / WOODWARM /
//   MORNINGCARRY / WINDOWCARRY / STRANDFIX / PRESSB / FEDEVENING
//   must NOT be 1.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

// Env gates apply to the judged CLI path (require.main). Requiring this
// module from the proof test must not fatal on the importer's env — the
// proof test sets the same contract explicitly before its control run.
function checkEnv() {
  if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
  if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
  if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
  if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a scholaraway leg'); process.exit(2); }
  }
  const DAYS = parseInt(process.env.DAYS || '30', 10);
  if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for scholaraway legs'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '51101').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);

function stackTop() {
  try {
    const st = new Error().stack || '';
    return st.split('\n').slice(2, 9).join(' | ').slice(0, 600);
  } catch (e) { return ''; }
}

function packKcal(Game) {
  try {
    let kcal = 0, units = 0;
    for (const it of ((Game.state || {}).scholar || {}).inventory || []) {
      units += it.units || 0;
      if ((it.kcalEach || 0) > 0) kcal += (it.kcalEach || 0) * (it.units || 1);
    }
    return { kcal: Math.round(kcal), units };
  } catch (e) { return null; }
}

function pantryKcal(Game) {
  try {
    let kcal = 0;
    for (const it of ((Game.state || {}).village || {}).pantry || []) kcal += (it.kcalEach || 0) * (it.units || 1);
    return Math.round(kcal);
  } catch (e) { return null; }
}

// The scholar's own presence snapshot. Fields are all scholar-own or
// home-tile reads; nothing here consults a roster or member list.
function snapshot(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const v = (Game.state || {}).village || {};
    const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    let atHaven = null;
    try { atHaven = !!Game.playerAtHaven(); } catch (e) { atHaven = null; }
    return {
      day: s.day || 0, px, py, hx, hy,
      dist: (px == null || py == null) ? null : Math.abs(px - hx) + Math.abs(py - hy),
      onTile: (px === hx && py === hy), atHaven,
      lastHavenDay: (s.lastHavenDay === undefined ? null : s.lastHavenDay),
      scholarKcal: Math.round(s.kcal || 0), pack: packKcal(Game),
      insideTent: !!s.insideTent, gameOver: !!Game.over,
    };
  } catch (e) { return null; }
}

// installWrappers(Game, st): count-only wrappers used by the judged driver
// AND by the proof test's positive control (same code, both paths).
// st = { loopDay, homecomings: [], deposits: [] }. Restores nothing:
// one Game object per seed/process, wrappers live for that seed only.
function installWrappers(Game, st) {
  let inReturn = false;
  let currentReturn = null;
  const homeVillage = () => { try { return (Game.state || {}).village || null; } catch (e) { return null; } };
  const origDeposit = Game.depositPantryPieces;
  if (typeof origDeposit === 'function') {
    Game.depositPantryPieces = function (v, src, pieceKcal) {
      let deposited = 0;
      try { deposited = origDeposit.apply(this, arguments); } finally {
        try {
          if (v === homeVillage() && deposited > 0) {
            const stack = stackTop();
            const rec = { loopDay: st.loopDay, inReturn, kcal: Math.round(deposited),
              name: (src && src.name) || null, stack };
            st.deposits.push(rec);
            if (inReturn && currentReturn) currentReturn.unloadKcal += Math.round(deposited);
          }
        } catch (e) { console.error('scholaraway deposit-log error', e && e.message); }
      }
      return deposited;
    };
  }
  const origReturn = Game.returnToVillage;
  if (typeof origReturn === 'function') {
    Game.returnToVillage = function (...args) {
      // COUNT ONLY. The original runs exactly as it would unwrapped.
      const overAtEntry = !!Game.over;
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0,
        overAtEntry, packBefore: packKcal(Game), pantryBefore: pantryKcal(Game),
        unloadKcal: 0, packAfter: null, pantryAfter: null };
      const prevInReturn = inReturn, prevCurrent = currentReturn;
      inReturn = true; currentReturn = rec;
      try { return origReturn.apply(this, args); } finally {
        inReturn = prevInReturn; currentReturn = prevCurrent;
        rec.packAfter = packKcal(Game); rec.pantryAfter = pantryKcal(Game);
        st.homecomings.push(rec);
      }
    };
  }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'scholaraway-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('scholaraway say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const st = { loopDay: 0, homecomings: [], deposits: [] };
  installWrappers(Game, st);
  const homecomings = st.homecomings;
  const deposits = st.deposits;
  let loopDay = 0;

  const mornings = [], evenings = [];
  let callIdx = 0;
  const baseDaily = competent.daily.bind(competent);
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      callIdx++;
      loopDay = callIdx; st.loopDay = callIdx;
      const sayBefore = sayLines.length;
      mornings.push({ loopDay: callIdx, snap: snapshot(Game2), saySeqAtMorning: sayBefore });
      baseDaily(Game2, ctx);
      const dayLines = sayLines.slice(sayBefore).map((x) => x.line);
      evenings.push({ loopDay: callIdx, snap: snapshot(Game2), gameOver: !!Game2.over, dayLines });
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: 'competent', days: DAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    mornings, evenings, homecomings, deposits, sayLines,
    // `decisions` mirrors the supplyleg shape so the reused splitter's
    // validation (seed + decisions + evenings) holds: one decision
    // record per policy daily() call, i.e. the morning record.
    decisions: mornings,
  };
}

async function main() {
  checkEnv();
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    process.stdout.write(JSON.stringify(inst) + '\n');
    console.error('scholaraway policy=competent days=30 seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' evenings=' + inst.evenings.length +
      ' homecomings=' + inst.homecomings.length + ' deposits=' + inst.deposits.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' scholaraway JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('SCHOLARAWAY TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapshot, installWrappers, packKcal, pantryKcal };
