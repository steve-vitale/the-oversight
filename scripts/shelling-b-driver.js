#!/usr/bin/env node
// shelling-b-driver.js — REAL shelling-habit census (sim-shelling-b).
// Prereg: evidence/2026-11-01/sim-shelling-b-prereg.md (committed BEFORE
// any judged sim). Per seed, competent policy, 30 days, DEPOSITGATE=0:
// every returnToVillage call (live = Game.over false at entry, the
// depositkeep rule) with the pack at entry (finished / shelledNet /
// combined / eligible, prereg definitions), the habit event on the
// armed leg ONLY (baseline leg records the same pack fields with the
// wrapper OFF, so the two legs are comparable), unload kcal
// (depositPantryPieces inside a return), donation kcal (inside a
// donateToPantry call), and tick accounting per shelling event.
//
// The driver NEVER moves the scholar except through the habit itself:
// the armed leg's ONLY state-moving addition is Game.shellNuts per
// in-shell lot, immediately before the original returnToVillage.
// Everything else is counting wrappers (depositkeep pattern).
//
// Transport (EPERM-flap rule): this process NEVER writes files — it
// prints one JSON line per seed to stdout with callback-based writes
// and backoff retry. The caller redirects stdout to a .jsonl file.
//
// Env (FATAL if violated on the judged CLI path):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   POLICY=competent, DAYS=30, ARM=baseline|armed (explicit)
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const shelling = require('./policies/shelling-b');

function checkEnv() {
  if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
  if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
  if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
  if (process.env.DEPOSITGATE !== '0') { console.error('FATAL: DEPOSITGATE=0 must be set explicitly'); process.exit(2); }
  if (process.env.ARM !== 'baseline' && process.env.ARM !== 'armed') { console.error('FATAL: ARM must be baseline|armed'); process.exit(2); }
  if (parseInt(process.env.DAYS || '30', 10) !== 30) { console.error('FATAL: DAYS must be 30 for shelling legs'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '51401').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = 30;

function numOrNull(fn) {
  try { const v = fn(); return (typeof v === 'number' && isFinite(v)) ? v : null; } catch (e) { return null; }
}
function pantryKcal(Game) {
  try {
    let kcal = 0;
    for (const it of ((Game.state || {}).village || {}).pantry || []) kcal += (it.kcalEach || 0) * (it.units || 1);
    return Math.round(kcal);
  } catch (e) { return null; }
}
function packAtEntry(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    const isUnproc = (it) => { try { return !!Game.isUnprocessed(it); } catch (e) { return false; } };
    const sum = shelling.summarizePack(inv, isUnproc);
    let spoiledLots = 0;
    for (const lot of sum.lots) {
      try { if (Game.isSpoiled && Game.isSpoiled(inv[lot.index])) spoiledLots++; } catch (e) {}
    }
    return { finishedKcal: sum.finishedKcal, shelledNet: sum.shelledNet,
      combined: sum.combined, eligible: sum.eligible, lots: sum.lots, spoiledLots };
  } catch (e) { return null; }
}

function installWrappers(Game, st, arm) {
  let inReturn = false;
  let currentReturn = null;
  let inDonate = false;
  let currentDonate = null;
  const homeVillage = () => { try { return (Game.state || {}).village || null; } catch (e) { return null; } };
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
        } catch (e) { console.error('shelling deposit-log error', e && e.message); }
      }
      return deposited;
    };
  }
  const origReturn = Game.returnToVillage;
  if (typeof origReturn === 'function') {
    Game.returnToVillage = function (...args) {
      const overAtEntry = !!Game.over;
      const packBefore = packAtEntry(Game);
      const pantryBefore = pantryKcal(Game);
      let pantryRoom = null;
      try { pantryRoom = Math.max(0, Game.pantryCapKcal() - Game.pantryKcal()); } catch (e) {}
      const sayBefore = st.sayCount ? st.sayCount() : null;
      // Habit FIRST (armed only), before the haul block inside the original.
      let habit = null;
      if (arm === 'armed' && !st.inHabitReturn) {
        st.inHabitReturn = true;
        try { habit = shelling.shellOnReturn(Game); } finally { st.inHabitReturn = false; }
      } else if (arm === 'armed') {
        habit = { fired: false, reason: 'reentrant-return', lots: 0, ticksCharged: 0 };
      }
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0,
        overAtEntry, packBefore, pantryBefore, pantryRoom, habit,
        unloadKcal: 0, packAfter: null, pantryAfter: null, sayBefore, sayAfter: null,
        gateEngagedAtEntry: numOrNull(() => (Game._depositGateEngaged() ? 1 : 0)),
        gateEngagedAtExit: null };
      const prevInReturn = inReturn, prevCurrent = currentReturn;
      inReturn = true; currentReturn = rec;
      try { return origReturn.apply(this, args); } finally {
        inReturn = prevInReturn; currentReturn = prevCurrent;
        rec.packAfter = packAtEntry(Game); rec.pantryAfter = pantryKcal(Game);
        rec.gateEngagedAtExit = numOrNull(() => (Game._depositGateEngaged() ? 1 : 0));
        rec.sayAfter = st.sayCount ? st.sayCount() : null;
        st.homecomings.push(rec);
      }
    };
  }
  const origDonate = Game.donateToPantry;
  if (typeof origDonate === 'function') {
    Game.donateToPantry = function (idx, units) {
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0,
        donateKcal: 0, pantryBefore: pantryKcal(Game), pantryAfter: null };
      const prevInDonate = inDonate, prevCurrent = currentDonate;
      inDonate = true; currentDonate = rec;
      try { return origDonate.apply(this, arguments); } finally {
        inDonate = prevInDonate; currentDonate = prevCurrent;
        rec.pantryAfter = pantryKcal(Game);
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

async function oneInstance(seed, arm) {
  const { Game } = await loadGame({ seed, mode: 'shelling-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('shelling say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const st = { loopDay: 0, homecomings: [], deposits: [], donates: [], inHabitReturn: false, sayCount: () => sayLines.length };
  installWrappers(Game, st, arm);
  let callIdx = 0;
  const baseDaily = competent.daily.bind(competent);
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      callIdx++;
      st.loopDay = callIdx;
      baseDaily(Game2, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  const deaths = (result.samples && result.samples.deaths) || [];
  const scholarStarve = deaths.filter((d) => d && d.player && /starv/i.test(String(d.cause || ''))).length;
  return {
    seed, policy: 'competent', days: DAYS, arm,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths, scholarStarvationDeaths: scholarStarve,
    homecomings: st.homecomings, deposits: st.deposits, donates: st.donates, sayLines,
  };
}

async function main() {
  checkEnv();
  const arm = process.env.ARM;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed, arm);
    await writeStdout(JSON.stringify(inst) + '\n');
    const live = inst.homecomings.filter((h) => !h.overAtEntry);
    console.error('shelling arm=' + arm + ' seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' liveReturns=' + live.length +
      ' unload=' + live.reduce((t, h) => t + (h.unloadKcal || 0), 0) + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' shelling JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('SHELLING TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, packAtEntry, pantryKcal };
