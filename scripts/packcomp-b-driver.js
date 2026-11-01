#!/usr/bin/env node
// packcomp-b-driver.js — scholar return-pack census tracer (DIAG ONLY).
// (sim-packcomp-b; prereg: evidence/2026-11-01/sim-packcomp-b-prereg.md,
// committed BEFORE any judged sim — the prereg commit is a gate on the
// judged runs, not on writing this file.)
//
// Same substrate as sim-depositkeep-b exactly: competent policy, 30 days,
// DEPOSITGATE=0 (keep 2,000), seeds 51101-51108. Same count-only wrapper
// design (returnToVillage / depositPantryPieces / donateToPantry), same
// say capture, same evening snapshots. ONE change vs depositkeep: the
// pack record carries the full item fields the counterfactual needs
// (plantId, lumpForm, foodKind, foodState, edible, needsCooking,
// hiddenKcal, data caloriesPerUnit + edibility from Game.data.plants,
// and the lump composition with per-component calories/edibility/nut/
// must-cook flags). The counterfactual itself lives in
// packcomp-b-count.js and runs offline in the analyzer — the driver
// never transforms a pack, it only records it.
//
// PERCEPTION LAW: presence/pack reads come only from the scholar's own
// state — never a roster or list. The driver NEVER moves the scholar:
// no travelTo, no returnToVillage, no eat, no donateToPantry, no
// shellNuts, no identifyPlant, no other state-moving call in the
// judged path. Wrappers count only.
//
// Transport (EPERM-flap rule, depositgate precedent): this process
// NEVER writes files — it prints one JSON line per seed to stdout
// with callback-based writes and backoff retry. The caller redirects
// stdout to a .jsonl file in evidence/.
//
// Env (FATAL if violated):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   POLICY=competent, DAYS=30
//   COMPETENT_STANDING_HOME / COMPETENT_ROUTE_AROUND /
//   COMPETENT_TRIPHOME_ROUTE_AROUND / WOODCARRY / WOODWARM /
//   MORNINGCARRY / WINDOWCARRY / STRANDFIX / PRESSB / FEDEVENING
//   must NOT be 1.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

// Nut / must-cook detection, copied from src/js/food.js data section
// (NUT_IDS + NUT_RE + MUST_COOK_RE) so the driver can flag lump
// components without calling game code. Values are cited, not invented.
const NUT_IDS = { hickory_nut: 1, acorn_white_oak: 1 };
const NUT_RE = /crack|shell|husk/i;
const MUST_COOK_RE = /must be cooked|must leach|never eat raw/i;
function isNutPid(pid, preparation) {
  return !!NUT_IDS[pid] || NUT_RE.test(preparation || '');
}
function isMustCookPrep(preparation) {
  return MUST_COOK_RE.test(preparation || '');
}

function checkEnv() {
  if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
  if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
  if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
  if (process.env.DEPOSITGATE !== '0') { console.error('FATAL: DEPOSITGATE=0 must be set explicitly'); process.exit(2); }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a packcomp leg'); process.exit(2); }
  }
  const DAYS = parseInt(process.env.DAYS || '30', 10);
  if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for packcomp legs'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '51101').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);

function stackTop() {
  try {
    const st = new Error().stack || '';
    return st.split('\n').slice(2, 10).join(' | ').slice(0, 800);
  } catch (e) { return ''; }
}

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

// Plant data lookup: Game.data.plants first, JSON file fallback (read-only).
let fallbackPlants = null;
function plantData(Game, pid) {
  try {
    const list = (Game.data || {}).plants;
    if (Array.isArray(list)) {
      const p = list.find((x) => x && x.id === pid);
      if (p) return p;
    }
  } catch (e) {}
  try {
    if (!fallbackPlants) {
      const fs = require('fs');
      const path = require('path');
      fallbackPlants = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'plants.json'), 'utf8'));
    }
    if (Array.isArray(fallbackPlants)) return fallbackPlants.find((x) => x && x.id === pid) || null;
  } catch (e) {}
  return null;
}

// Full pack record at a return: one row per inventory stack, with every
// field the counterfactual needs. isUnprocessed failures are recorded
// as null, never guessed; missing data values as null, never zero-filled.
function packComposition(Game) {
  try {
    const items = [];
    let finishedKcal = 0, totalKcal = 0, units = 0;
    for (const it of ((Game.state || {}).scholar || {}).inventory || []) {
      let unproc = null;
      try { unproc = !!Game.isUnprocessed(it); } catch (e) { unproc = null; }
      const finished = (it.kcalEach || 0) > 0 && unproc === false;
      const kcal = (it.kcalEach || 0) * (it.units || 1);
      if ((it.kcalEach || 0) > 0) totalKcal += kcal;
      if (finished) finishedKcal += kcal;
      units += it.units || 0;
      let dataCal = null, edibility = null, isNut = null, mustCook = null;
      if (it.plantId) {
        const p = plantData(Game, it.plantId);
        if (p) {
          dataCal = (typeof p.caloriesPerUnit === 'number') ? p.caloriesPerUnit : null;
          edibility = p.edibility || null;
          isNut = isNutPid(it.plantId, p.preparation);
          mustCook = isMustCookPrep(p.preparation);
        }
      }
      let lumpComp = null;
      if (it.lump && typeof it.lump === 'object') {
        lumpComp = [];
        for (const pid of Object.keys(it.lump)) {
          const e = it.lump[pid] || {};
          const p = plantData(Game, pid);
          lumpComp.push({
            pid, units: e.units || 0,
            calPerUnit: (p && typeof p.caloriesPerUnit === 'number') ? p.caloriesPerUnit : null,
            edibility: (p && p.edibility) || null,
            isNut: p ? isNutPid(pid, p.preparation) : null,
            mustCook: p ? isMustCookPrep(p.preparation) : null,
          });
        }
      }
      items.push({
        name: it.name || null, plantId: it.plantId || null,
        lumpForm: it.lumpForm || null, units: it.units || 0,
        kcalEach: it.kcalEach || 0,
        hiddenKcal: (it.hiddenKcal == null ? null : it.hiddenKcal),
        dataCal, edibility, isNut, mustCook,
        foodKind: it.foodKind || null, foodState: it.foodState || null,
        edible: (it.edible === undefined ? null : !!it.edible),
        needsCooking: !!it.needsCooking,
        unprocessed: unproc, finished, kcal: Math.round(kcal),
        lumpComp,
      });
    }
    return { finishedKcal: Math.round(finishedKcal), totalKcal: Math.round(totalKcal), units, items };
  } catch (e) { return null; }
}

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
      scholarKcal: Math.round(s.kcal || 0), pack: packComposition(Game),
      insideTent: !!s.insideTent, gameOver: !!Game.over,
      pantryKcal: pantryKcal(Game),
      pantryFreshDays: numOrNull(() => Game.pantryFreshDays()),
      gateEngaged: numOrNull(() => (Game._depositGateEngaged() ? 1 : 0)),
    };
  } catch (e) { return null; }
}

// installWrappers(Game, st): count-only wrappers, same design as
// depositkeep. One Game object per seed/process; wrappers live for
// that seed only.
function installWrappers(Game, st) {
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
            const rec = { loopDay: st.loopDay, kind, kcal: Math.round(deposited),
              name: (src && src.name) || null, stack: stackTop() };
            st.deposits.push(rec);
            if (inReturn && currentReturn) currentReturn.unloadKcal += Math.round(deposited);
            if (inDonate && currentDonate) currentDonate.donateKcal += Math.round(deposited);
          }
        } catch (e) { console.error('packcomp deposit-log error', e && e.message); }
      }
      return deposited;
    };
  }
  const origReturn = Game.returnToVillage;
  if (typeof origReturn === 'function') {
    Game.returnToVillage = function (...args) {
      // COUNT ONLY. The original runs exactly as it would unwrapped.
      const overAtEntry = !!Game.over;
      const sayBefore = st.sayCount ? st.sayCount() : null;
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0,
        overAtEntry, stack: stackTop(),
        gateEngagedAtEntry: numOrNull(() => (Game._depositGateEngaged() ? 1 : 0)),
        packBefore: packComposition(Game), pantryBefore: pantryKcal(Game),
        unloadKcal: 0, packAfter: null, pantryAfter: null,
        gateEngagedAtExit: null, sayBefore, sayAfter: null };
      const prevInReturn = inReturn, prevCurrent = currentReturn;
      inReturn = true; currentReturn = rec;
      try { return origReturn.apply(this, args); } finally {
        inReturn = prevInReturn; currentReturn = prevCurrent;
        rec.packAfter = packComposition(Game); rec.pantryAfter = pantryKcal(Game);
        rec.gateEngagedAtExit = numOrNull(() => (Game._depositGateEngaged() ? 1 : 0));
        rec.sayAfter = st.sayCount ? st.sayCount() : null;
        st.homecomings.push(rec);
      }
    };
  }
  const origDonate = Game.donateToPantry;
  if (typeof origDonate === 'function') {
    Game.donateToPantry = function (idx, units) {
      // COUNT ONLY. The original runs exactly as it would unwrapped.
      let itemBefore = null;
      try {
        const it = ((Game.state || {}).scholar || {}).inventory[idx];
        if (it) itemBefore = { name: it.name || null, units: it.units || 0, kcalEach: it.kcalEach || 0 };
      } catch (e) {}
      const rec = { loopDay: st.loopDay, day: ((Game.state || {}).scholar || {}).day || 0,
        idx, unitsArg: (units === undefined ? null : units), itemBefore,
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
          if (err) {
            if (tries < 12) setTimeout(attempt, 1000);
            else reject(err);
          } else resolve();
        });
      } catch (e) {
        if (tries < 12) setTimeout(attempt, 1000);
        else reject(e);
      }
    };
    attempt();
  });
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'packcomp-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('packcomp say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const st = { loopDay: 0, homecomings: [], deposits: [], donates: [], sayCount: () => sayLines.length };
  installWrappers(Game, st);
  const homecomings = st.homecomings;
  const deposits = st.deposits;
  const donates = st.donates;
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
    seed, policy: 'competent', days: DAYS, arm: 'depositgate-off',
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    mornings, evenings, homecomings, deposits, donates, sayLines,
    decisions: mornings,
  };
}

async function main() {
  checkEnv();
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    await writeStdout(JSON.stringify(inst) + '\n');
    console.error('packcomp policy=competent days=30 seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' evenings=' + inst.evenings.length +
      ' homecomings=' + inst.homecomings.length + ' deposits=' + inst.deposits.length +
      ' donates=' + inst.donates.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' packcomp JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('PACKCOMP TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapshot, installWrappers, packComposition, pantryKcal };
