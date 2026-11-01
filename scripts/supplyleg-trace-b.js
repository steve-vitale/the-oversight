#!/usr/bin/env node
// supplyleg-trace-b.js — supply-leg pantry-inflow tracer (DIAG ONLY).
// (sim-supplyleg-b; prereg: evidence/2026-11-01/sim-supplyleg-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Per seed, competent policy, 30 days: morning/evening pantry snaps plus
// EVERY gross pantry inflow, logged at the pantry-entry methods
// themselves by driver-side wrappers (no src/js change):
//   stockPantry(kcal, name, opts) -> kcal argument (no cap on this path)
//   depositPantryPieces(v, src, pieceKcal) -> return value, home village only
//   pantryAdd(item) -> item kcal if it returned true (home village only)
//   stockSurplus(v, give) -> return value, home village only
// plus a push-trap on the home village pantry array (Array.prototype.push
// patched for the duration of one seed, firing ONLY when `this` is the
// current home pantry array) for direct pushes that bypass the methods.
// Wrapper calls suppress the trap (single-threaded flag) so method-driven
// pushes are never double-logged.
//
// Transport (EPERM-flap rule, absencehunt precedent): this process NEVER
// writes files — it prints one JSON line per seed to stdout. The caller
// redirects stdout to a .jsonl file in evidence/ and splits it afterwards
// with scripts/split-absencehunt-jsonl-b.js (reused verbatim).
//
// Env (same substrate gates as absencehunt legs, FATAL if violated):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=competent, DAYS=30, SEEDS=<csv>
//   WOODCARRY/WOODWARM/MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING
//   must NOT be 1.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
for (const k of ['WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a supplyleg leg'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '51101').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for supplyleg legs'); process.exit(2); }

function pantryKcal(Game) {
  try {
    const items = ((Game.state || {}).village || {}).pantry || [];
    let kcal = 0;
    for (const it of items) kcal += (it.kcalEach || 0) * (it.units || 1);
    return { kcal: Math.round(kcal), count: items.length };
  } catch (e) { return null; }
}

function stackTop() {
  try {
    const st = new Error().stack || '';
    return st.split('\n').slice(2, 9).join(' | ').slice(0, 600);
  } catch (e) { return ''; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'supplyleg-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('supplyleg say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const events = [];
  let loopDay = 0;
  let phase = 'setup';
  let suppressTrap = false;
  let pantryRef = null;
  const homeVillage = () => { try { return (Game.state || {}).village || null; } catch (e) { return null; } };
  const refreshPantryRef = () => { try { const v = homeVillage(); pantryRef = v ? v.pantry : null; } catch (e) { pantryRef = null; } };
  refreshPantryRef();

  // Push trap: fires ONLY for the current home pantry array, never for
  // other arrays, and never while a wrapper is running (its pushes are
  // already logged by the wrapper). Restored after each seed.
  const origPush = Array.prototype.push;
  Array.prototype.push = function (...items) {
    if (this === pantryRef && !suppressTrap) {
      for (const it of items) {
        try {
          events.push({
            t: 'direct', loopDay, phase,
            kcal: Math.round((it.kcalEach || 0) * (it.units || 1)),
            kcalEach: it.kcalEach || 0, units: it.units || 1,
            name: it.name || null, stack: stackTop(),
          });
        } catch (e) { console.error('supplyleg trap error', e && e.message); }
      }
    }
    return origPush.apply(this, items);
  };

  try {
    const origStock = Game.stockPantry;
    if (typeof origStock === 'function') {
      Game.stockPantry = function (kcal, name, opts) {
        suppressTrap = true;
        try { return origStock.apply(this, arguments); }
        finally {
          suppressTrap = false;
          try {
            events.push({ t: 'stock', loopDay, phase, kcal: Math.round(kcal || 0), name: name || null,
              garden: !!(opts && opts.gardenShares), harvest: !!(opts && opts.harvestShares), stack: stackTop() });
          } catch (e) { console.error('supplyleg stock-log error', e && e.message); }
        }
      };
    }
    const origDeposit = Game.depositPantryPieces;
    if (typeof origDeposit === 'function') {
      Game.depositPantryPieces = function (v, src, pieceKcal) {
        suppressTrap = true;
        let deposited = 0;
        try { deposited = origDeposit.apply(this, arguments); }
        finally {
          suppressTrap = false;
          try {
            if (v === homeVillage() && deposited > 0) {
              events.push({ t: 'deposit', loopDay, phase, kcal: Math.round(deposited), name: (src && src.name) || null,
                garden: !!(src && src.gardenShares), harvest: !!(src && src.harvestShares), stack: stackTop() });
            }
          } catch (e) { console.error('supplyleg deposit-log error', e && e.message); }
        }
        return deposited;
      };
    }
    const origAdd = Game.pantryAdd;
    if (typeof origAdd === 'function') {
      Game.pantryAdd = function (item) {
        suppressTrap = true;
        let ok = false;
        try { ok = origAdd.apply(this, arguments); }
        finally {
          suppressTrap = false;
          try {
            if (ok && item) {
              events.push({ t: 'pantryAdd', loopDay, phase, kcal: Math.round((item.kcalEach || 0) * (item.units || 1)),
                name: item.name || null, garden: !!item.gardenShares, harvest: !!item.harvestShares, stack: stackTop() });
            }
          } catch (e) { console.error('supplyleg add-log error', e && e.message); }
        }
        return ok;
      };
    }
    const origSurplus = Game.stockSurplus;
    if (typeof origSurplus === 'function') {
      Game.stockSurplus = function (v, give) {
        suppressTrap = true;
        let stored = 0;
        try { stored = origSurplus.apply(this, arguments); }
        finally {
          suppressTrap = false;
          try {
            if (v === homeVillage() && stored > 0) {
              events.push({ t: 'surplus', loopDay, phase, kcal: Math.round(stored), name: null, stack: stackTop() });
            }
          } catch (e) { console.error('supplyleg surplus-log error', e && e.message); }
        }
        return stored;
      };
    }

    const errs = [];
    const spawn = { pantry: pantryKcal(Game) };
    const decisions = [], evenings = [];
    let callIdx = 0;
    const baseDaily = competent.daily.bind(competent);
    const policy = Object.assign({}, competent, {
      daily(Game2, ctx) {
        callIdx++;
        loopDay = callIdx;
        phase = 'daily';
        refreshPantryRef();
        const mPantry = pantryKcal(Game2);
        const sayBefore = sayLines.length;
        baseDaily(Game2, ctx);
        const dayLines = sayLines.slice(sayBefore).map((x) => x.line);
        decisions.push({ loopDay: callIdx, pantry: mPantry, saySeqAtMorning: sayBefore });
        phase = 'sleep';
        refreshPantryRef();
        evenings.push({ loopDay: callIdx, pantry: pantryKcal(Game2), gameOver: !!Game2.over, dayLines });
      },
    });
    const result = await runDays(Game, policy, { days: DAYS, manifest: null });
    return {
      seed, policy: 'competent', days: DAYS,
      spawn, errs, errCount: errs.length,
      daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
      maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
      deaths: (result.samples && result.samples.deaths) || [],
      decisions, evenings, events, sayLines,
    };
  } finally {
    Array.prototype.push = origPush;
  }
}

async function main() {
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    process.stdout.write(JSON.stringify(inst) + '\n');
    console.error('supplyleg policy=competent days=30 seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' decisions=' + inst.decisions.length +
      ' events=' + inst.events.length + ' errs=' + inst.errCount + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' supplyleg JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('SUPPLYLEG TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance };
