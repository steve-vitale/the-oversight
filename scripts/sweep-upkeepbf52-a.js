#!/usr/bin/env node
// sweep-upkeepbf52-a.js — upkeep-breakfast narration instrument
// (sim-upkeepbf52-a, oversight-flesh-out-loop, axis food-economy).
// Phase 1: reproduce the bankretain "UPKEEP BREAKFAST IS SILENT"
// blank on current master with a FULL-transcript instrument.
//
// The bankretain corpus could not see upkeep lines (say lines were
// captured only around daily(), full day lines only on
// bankfood-evening rows), so its silence observation was read off a
// corpus blind to the upkeep window where competentEat runs. This
// sweep closes that blind spot on the SAME policy stack that produced
// the substrate (nighttravel + woodcarry + woodwarm + bankfood, see
// scripts/bankfood-trace-b.js): per loop-day it records
//   - every upkeep call: say lines, scholarDay/kcal/pack before/after
//   - the daily-start snapshot (post-upkeep, pre-daily): kcal, pack,
//     wake position (insideHaven, tile type, map coords)
//   - every daily call: full say lines, bankfood morning/evening
//     records for that loop-day, post-daily pack
//   - the bankfood wrapper's first-upkeep snapshots (true post-sleep
//     mornings) and morning/evening records, verbatim
// The analyzer joins these into morning windows and chain-pins each
// qualifying upkeep meal (see upkeepbf52-a-lib.js). This sweep
// makes NO game-code change and NO judgment: it only records.
//
// Env (all substrate gates asserted FATAL, mirroring bankfood-trace-b):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required)
//   WOODWARM="0"|"1" (required: 0 = guard leg, 1 = ON leg)
//   BANKFOOD="1" (required: first-upkeep snapshots exist only on
//     variant legs; OFF legs delegate untouched and record nothing)
//   SEEDS (required, comma-separated; no default band — the prereg
//     picks the band, this instrument must never presume one)
//   DAYS=60 (required: the substrate horizon of the 16505 case)
//   OUTDIR (default evidence/2026-11-04/sim-upkeepbf52-a-corpus-<guard|on>)
// Output per seed: upkeepbf52-a-s<seed>.json. Never writes into
// the repo outside OUTDIR. A failed write is LOUD (exit 2) after
// retries — never silently dropped.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withBankfood, newStore: newBfStore, packSnap } = require('./policies/bankfood-diag');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
for (const g of ['COMPETENT_EVENING_DETOUR', 'COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND']) {
  if (process.env[g] === '1') { console.error('FATAL: ' + g + ' must NOT be 1 in this leg'); process.exit(2); }
}
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be set explicitly to 0 (guard) or 1 (ON)'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.BANKFOOD !== '1') { console.error('FATAL: BANKFOOD must be 1 (first-upkeep snapshots exist only on variant legs)'); process.exit(2); }
if (!process.env.SEEDS) { console.error('FATAL: SEEDS must be set explicitly (no default band)'); process.exit(2); }
const SEEDS = process.env.SEEDS.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!SEEDS.length) { console.error('FATAL: SEEDS parsed empty'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 60) { console.error('FATAL: DAYS must be exactly 60, got: ' + (process.env.DAYS || '(unset)')); process.exit(2); }
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-04',
  'sim-upkeepbf52-a-corpus-' + (process.env.WOODWARM === '1' ? 'on' : 'guard'));

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 120; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) {
      if (i === 119) return false;
      realSleepMs(2000);
    }
  }
  return false;
}
function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return null; }
}
function scholarDay(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return null; }
}
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
  };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ day: scholarDay(Game), line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);

  const events = [];
  let callIdx = 0, upkeepSeq = 0;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const pbStore = newBfStore();
  const dayPolicy = withBankfood(warmed, pbStore);
  const policy = Object.assign({}, base, {
    upkeep(Game2, ctx) {
      upkeepSeq++;
      const dayBefore = scholarDay(Game2), kcalBefore = scholarKcal(Game2);
      let packBefore = null;
      try { packBefore = packSnap(Game2); } catch (e) { packBefore = null; }
      const sayBefore = sayLines.length;
      // Wire the bankfood wrapper's upkeep (first-upkeep-of-new-day
      // snapshot) — runDays calls policy.upkeep, NOT dayPolicy.upkeep.
      const ret = dayPolicy.upkeep ? dayPolicy.upkeep(Game2, ctx) : (base.upkeep ? base.upkeep(Game2, ctx) : undefined);
      const lines = sayLines.slice(sayBefore, sayLines.length).map((x) => x.line);
      let packAfter = null;
      try { packAfter = packSnap(Game2); } catch (e) { packAfter = null; }
      events.push({ kind: 'upkeep', seq: upkeepSeq,
        scholarDayBefore: dayBefore, scholarDayAfter: scholarDay(Game2),
        kcalBefore, kcalAfter: scholarKcal(Game2), packBefore, packAfter, lines });
      return ret;
    },
    daily(Game2, ctx) {
      callIdx++;
      // Daily-start snapshot: POST-upkeep (all 3 upkeep calls ran),
      // PRE-daily. The bankfood morning phase runs inside dayPolicy.daily
      // after this snapshot, so the first-upkeep -> daily-start chain
      // pins eating to the upkeep window alone.
      const pos = snapPos(Game2);
      const kcalBefore = scholarKcal(Game2);
      let packBefore = null;
      try { packBefore = packSnap(Game2); } catch (e) { packBefore = null; }
      const sayBefore = sayLines.length;
      dayPolicy.daily(Game2, ctx);
      const lines = sayLines.slice(sayBefore, sayLines.length).map((x) => x.line);
      let postDailyPack = null;
      try { postDailyPack = packSnap(Game2); } catch (e) { postDailyPack = null; }
      events.push({ kind: 'daily', loopDay: callIdx, scholarDay: scholarDay(Game2),
        kcalBefore, packBefore, pos, lines,
        bankfoodMorning: (pbStore.mornings || []).find((a) => a.loopDay === callIdx) || null,
        bankfoodEvening: (pbStore.evenings || []).find((a) => a.loopDay === callIdx) || null,
        postDailyPack, gameOver: !!Game2.over });
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: 'nighttravel', woodwarm: process.env.WOODWARM, bankfood: 1,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked,
    firstUpkeeps: pbStore.firstUpkeeps,
    bankfoodMornings: pbStore.mornings, bankfoodEvenings: pbStore.evenings,
    bankfoodErrs: pbStore.errs, bankfoodErrors: pbStore.errors,
    woodcarryErrs: wcStore.errs, warmthActed: wwStore.acted, warmthErrs: wwStore.errs,
    sayTotal: sayLines.length, events,
  };
}

(async () => {
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    const name = `upkeepbf52-a-s${seed}.json`;
    const data = JSON.stringify(inst);
    const ok = writeRobust(path.join(OUTDIR, name), data);
    console.log(`upkeepbf52 seed=${seed} end=${inst.endReason} days=${inst.daysAlive} ` +
      `events=${inst.events.length} firstUpkeeps=${inst.firstUpkeeps.length} ` +
      `bfMornings=${inst.bankfoodMornings.length} bfEvenings=${inst.bankfoodEvenings.length} ` +
      `bfErrs=${inst.bankfoodErrs} sayTotal=${inst.sayTotal} ` + (ok ? 'written' : 'WRITE FAIL LOUDLY'));
    if (!ok) { console.error('FATAL: write failed after retries: ' + path.join(OUTDIR, name)); process.exit(2); }
    done++;
  }
  console.log('wrote ' + done + ' upkeepbf52 files to ' + OUTDIR);
})().catch((e) => { console.error('UPKEEPBF52 CRASH', e && (e.stack || e)); process.exit(2); });
