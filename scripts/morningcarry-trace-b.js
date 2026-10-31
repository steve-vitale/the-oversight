#!/usr/bin/env node
// morningcarry-trace-b.js — evening -> morning pack tracer (DIAG ONLY).
// (sim-morningcarry-b; trace leg, run BEFORE the prereg is written, so the
// trace can shape the probe. NOT a judged leg: no probe policy exists yet,
// no verdict reads this corpus. It re-derives the 15215 strand set on the
// CURRENT master and answers, with item-level evidence, where pack food
// goes overnight: which stacks survive sleep, which the dawn sweep takes,
// and what a haven-departure morning could actually carry.)
//
// Adapted from scripts/jointgate-trace-b.js (same warmed stack, same
// evening/morning record shape) with READ-ONLY additions and NO behavior
// change: (a) full pack snaps (kcalEach, edible, foodState, spoilDay, kg,
// lump presence) at evening, pre-sleep, post-sleep, and morning; (b) a
// Game.sleep wrapper that brackets the night (pre/post snaps + say lines
// during sleep); (c) pantry snaps (full item list + carry capacity) on
// every morning; (d) say-sequence numbers so the analyzer can attribute
// sweep lines ("Overnight, X went bad") to the exact night. No verb calls,
// no state writes, no RNG draws. DIAG ONLY: no probe wiring, no policy
// file, no edits to any existing file.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required)
//   WOODWARM="0"|"1" (required: 0 = guard leg, 1 = ON leg)
//   MORNINGCARRY must NOT be 1; STRANDFIX must NOT be 1; PRESSB must NOT be 1
//   SEEDS (default 15215), DAYS=30, OUTDIR (override)
// Write transport mirrors jointgate: failed writes kept in memory
// and flushed at the end (EPERM flap waited out, never forced);
// deadline exhaustion stages inside this worktree
// (.morningcarry-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be set explicitly to 0 (guard) or 1 (ON)'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.MORNINGCARRY === '1') { console.error('FATAL: MORNINGCARRY must NOT be 1 in a trace leg (no probe yet)'); process.exit(2); }
if (process.env.STRANDFIX === '1') { console.error('FATAL: STRANDFIX must NOT be 1 in a trace leg'); process.exit(2); }
if (process.env.PRESSB === '1') { console.error('FATAL: PRESSB must NOT be 1 in a trace leg'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '15215')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for morningcarry trace legs'); process.exit(2); }
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-31', 'sim-morningcarry-b-corpus-trace-' + (process.env.WOODWARM === '1' ? 'on' : 'guard'));
const STAGING_DIR = path.join(__dirname, '..', '.morningcarry-staging');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null, stage = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, access, stage,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    vesselId: (Game.villagerId !== undefined ? Game.villagerId : (sch.villagerId !== undefined ? sch.villagerId : null)),
  };
}

function packSnap(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const day = sch.day || 0;
    const items = (sch.inventory || []).map((it) => {
      if (!it || typeof it !== 'object') return it;
      let spoiled = null;
      try { spoiled = (typeof Game.isSpoiled === 'function') ? !!Game.isSpoiled(it) : ((it.spoilDay !== undefined && it.spoilDay !== null) ? it.spoilDay <= day : false); } catch (e) {}
      let lumpPids = null;
      try { if (it.lump && typeof it.lump === 'object') lumpPids = Object.keys(it.lump); } catch (e) {}
      return {
        name: it.name || null, plantId: it.plantId || null, itemId: it.itemId || it.id || null,
        units: (it.units === undefined ? null : it.units),
        kcalEach: (it.kcalEach === undefined ? null : it.kcalEach),
        edible: (it.edible === undefined ? null : !!it.edible),
        foodState: it.foodState || null,
        spoilDay: (it.spoilDay === undefined ? null : it.spoilDay),
        spoiled, kg: (it.kg === undefined ? null : it.kg),
        lump: lumpPids,
      };
    });
    let kcalAll = 0, kcalKnown = 0, kcalUnknown = 0;
    for (const it of items) {
      const k = (it.kcalEach || 0) * (it.units || 0);
      if ((it.kcalEach || 0) > 0) {
        kcalAll += k;
        if (it.edible === false) kcalUnknown += k;
        else if (!it.spoiled) kcalKnown += k;
      }
    }
    let weight = 0;
    for (const it of items) weight += (it.kg || 0) * (it.units || 1);
    return { items, kcalAll: Math.round(kcalAll), kcalKnown: Math.round(kcalKnown), kcalUnknown: Math.round(kcalUnknown), weightKg: Math.round(weight * 100) / 100 };
  } catch (e) { return null; }
}

function pantrySnap(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const items = (v.pantry || []).map((it) => {
      if (!it || typeof it !== 'object') return it;
      return {
        name: it.name || null, units: (it.units === undefined ? null : it.units),
        kcalEach: (it.kcalEach === undefined ? null : it.kcalEach),
        edible: (it.edible === undefined ? null : !!it.edible),
        foodState: it.foodState || null,
        spoilDay: (it.spoilDay === undefined ? null : it.spoilDay),
        kg: (it.kg === undefined ? null : it.kg),
      };
    });
    let kcal = 0;
    for (const it of items) kcal += (it.kcalEach || 0) * (it.units || 1);
    let cap = null;
    try { cap = (typeof Game.carryCapacity === 'function') ? Game.carryCapacity() : null; } catch (e) {}
    return { items, kcal: Math.round(kcal), count: items.length, carryCapacityKg: cap };
  } catch (e) { return null; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  // Sleep bracket: snap pack immediately before and after the engine's
  // sleep (the night's own bookkeeping, including the dawn sweep, runs
  // inside it). Wrapping is not stubbing: the original runs exactly once.
  const sleeps = [];
  {
    const origSleep = Game.sleep;
    if (typeof origSleep === 'function') {
      Game.sleep = function (...args) {
        const seqBefore = saySeq;
        const pre = { pos: snapPos(Game), pack: packSnap(Game) };
        let ret;
        try { ret = origSleep.apply(this, args); } catch (e) { sleeps.push({ pre, post: null, seqBefore, seqAfter: saySeq, error: String(e && e.message).slice(0, 200) }); throw e; }
        const post = { pos: snapPos(Game), pack: packSnap(Game) };
        sleeps.push({ pre, post, seqBefore, seqAfter: saySeq, dayRolled: post.pos.gameDay !== pre.pos.gameDay });
        return ret;
      };
    }
  }
  await setupGame(Game);
  const errs = [];
  const spawn = { pos: snapPos(Game), pack: packSnap(Game), pantry: pantrySnap(Game) };
  const evenings = [], mornings = [], nights = [];
  let callIdx = 0;
  let lastEvening = null;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const dayPolicy = warmed;
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) {
        const mPos = snapPos(Game2);
        const mPack = packSnap(Game2);
        const mPantry = pantrySnap(Game2);
        let mWood = null;
        try { mWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) { errs.push('wood: ' + String(e && e.message).slice(0, 120)); }
        const prevStill = !!(lastEvening && lastEvening.woodcarry && lastEvening.woodcarry.bucket === 'creek' && !lastEvening.woodcarry.rescued);
        const atHaven = !!(mPos.inside || mPos.tile === 'haven');
        mornings.push({
          loopDay: callIdx, ...mPos, morningWood: mWood, pack: mPack, pantry: mPantry,
          prevEveningStillCreek: prevStill, prevEveningLoopDay: lastEvening ? lastEvening.loopDay : null,
          strandMorning: prevStill && !atHaven && !Game2.over && !(Game2.inCombat && Game2.inCombat()),
          startsAtHaven: atHaven,
          inCombat: !!(Game2.inCombat && Game2.inCombat()),
          saySeqAtMorning: saySeq,
        });
      }
      const sayBefore = sayLines.length;
      dayPolicy.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, tapDay: false, ...pos, saySeqAtEvening: saySeq };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.eveningMethod = nt.method || null;
        row.travelledHome = !!nt.travelledHome;
      }
      row.woodcarry = ctx._wcLast || null;
      row.warmth = ctx._wwLast || null;
      try { row.eveningWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) {}
      row.pack = packSnap(Game2);
      row.pantry = pantrySnap(Game2);
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
      lastEvening = row;
      // Attach the night bracket that just ended (the sleep after the
      // PREVIOUS evening is what this morning follows): nights are
      // recorded in sleep order; pair by index in the analyzer via
      // loopDay (night after evening D belongs to morning D+1).
      void dayLines;
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  // Nights: sleeps[] is in chronological order; the k-th sleep follows the
  // k-th evening (loopDay k). Pair explicitly here for the analyzer.
  for (let i = 0; i < sleeps.length; i++) {
    nights.push({ afterEveningLoopDay: i + 1, ...sleeps[i] });
  }
  return {
    seed, policy: process.env.POLICY, woodwarm: process.env.WOODWARM, woodcarry: process.env.WOODCARRY,
    spawn,
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed },
    errs, errCount: errs.length,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, nights,
    sayLines,
  };
}

async function main() {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const name = `morningcarry-b-nighttravel-s${seed}.json`;
    const summary = `morningcarry-trace policy=nighttravel woodcarry=${process.env.WOODCARRY} woodwarm=${process.env.WOODWARM} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} mornings=${inst.mornings.length} nights=${inst.nights.length} errs=${inst.errCount}`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' morningcarry trace files to ' + OUTDIR);
}

if (require.main === module) {
  main().catch((e) => { console.error('MORNINGCARRY TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { packSnap, pantrySnap };
