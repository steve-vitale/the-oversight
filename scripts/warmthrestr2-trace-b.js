#!/usr/bin/env node
// warmthrestr2-trace-b.js — warmth-restraint legs (R1/R2, own driver for sim-warmthrestr2-b)
// (sim-woodwarm-b; prereg: evidence/2026-10-30/
// sim-warmthrestr2-b-prereg.md, committed BEFORE any
// judged leg). Adapted from woodshort-ledger-trace-b.js
// with the same honesty guards; the only addition is the
// warmth wrapper (scripts/policies/woodwarm.js) around
// woodcarry, gated on WOODWARM=1. Warmth only: no cooking
// step. No thief grant, no taps, no state
// edits, no clock-setting, no top-ups, no driver travelTo.
//
// One fresh game per seed (scripts/sim-harness.js). The wrapped
// policy.daily runs once per loop-day; the driver records, per
// loop-day, (a) the MORNING position (post-sleep, pre-daily,
// loop-days 2+), (b) the EVENING position (post-daily,
// pre-sleep — after the policy's night step), (c) the
// woodcarry record (ctx._wcLast: evening classification /
// bridge / retry / rescue), the morning carry record
// (ctx._wcCarry), and the warmth record (ctx._wwLast:
// stranded-night warmth trigger / fire).
//
// BANKING: this driver grants NO thief ability and performs
// NO thief taps (the 1530Z design flaw, fixed in the
// woodcarry3 driver this adapts). The judged legs are
// banked under exactly the driver that judges them.
//
// No clock-setting, no waits, no kcal/health top-ups, no
// travelTo in the driver, no direct position writes, no
// steering of competent.daily. POLICY-SIDE ARM ONLY: zero
// src/js changes.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required: the staged line fires only ON)
//   WOODWARM="0"|"1" (required: 0 = guard leg, 1 = ON leg)
//   SEEDS (banked band default: the 10 woodshort qualifiers)
//   DAYS=30
//   OUTDIR (default evidence/2026-10-30/sim-woodwarm-b-corpus-<guard|on>)
// Write transport mirrors the creekremedy arms: failed writes
// are kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.woodwarm-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
for (const g of ['COMPETENT_EVENING_DETOUR', 'COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND']) {
  if (process.env[g] === '1') { console.error('FATAL: ' + g + ' must NOT be 1 in a woodshort-ledger leg (detour never pooled)'); process.exit(2); }
}
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1 for woodwarm legs (the staged line fires only ON)'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be set explicitly to 0 (guard) or 1 (ON)'); process.exit(2); }
if (!['off','R1','R2'].includes(process.env.WARMTH_RESTRAINT)) { console.error('FATAL: WARMTH_RESTRAINT must be set explicitly to off, R1, or R2'); process.exit(2); }
if (process.env.WOODWARM === '0' && process.env.WARMTH_RESTRAINT !== 'off') { console.error('FATAL: guard leg must use WARMTH_RESTRAINT=off'); process.exit(2); }
const POLICY = process.env.POLICY;
if (POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel for woodwarm legs'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '15003,15009,15091,15211,15215,15220,15221,15337,15376,15439')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const RESTR = process.env.WARMTH_RESTRAINT;
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-warmthrestr2-b-corpus-' + (process.env.WOODWARM === '0' ? 'guard' : (RESTR === 'off' ? 'on' : RESTR.toLowerCase())));
const STAGING_DIR = path.join(__dirname, '..', '.warmthrestr2-staging');

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
  };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 20000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);

  const evenings = [], mornings = [];
  let callIdx = 0;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore, { restraint: (RESTR === 'off' ? null : RESTR) });
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      // MORNING position: post-sleep, pre-daily (loop-days 2+).
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m });
      }
      const sayBefore = sayLines.length;
      warmed.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const eveningSayTail = sayLines.slice(Math.max(sayBefore, sayAfter - 30), sayAfter).map((x) => x.line);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, tapDay: false, ...pos, eveningSayTail };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.eveningMethod = nt.method || null;
        row.policyBefore = nt.before || null;
        row.preStepTile = nt.before ? nt.before.tile : null;
        row.preStepMap = nt.before ? (nt.before.mapPx + ',' + nt.before.mapPy) : null;
        row.preStepKcal = nt.before ? nt.before.kcal : null;
        row.haven = nt.haven || null;
        row.havenDistance = (nt.havenDistance === undefined ? null : nt.havenDistance);
        row.travelOffered = (nt.travelOffered === undefined ? null : nt.travelOffered);
        row.travel = nt.travel || null;
        row.travelledHome = !!nt.travelledHome;
        row.policyWalkTarget = (nt.delegated || {}).walkTarget || null;
        row.policyEntryCellActions = (nt.delegated || {}).entryCellActions || null;
        row.policyEntryAdjacency = ((nt.delegated || {}).entryAdjacency === undefined ? null : (nt.delegated || {}).entryAdjacency);
        row.policyAfter = (nt.delegated || {}).after || null;
        row.positionAgreesWithPolicy = (row.eveningOutcome === 'completed' || row.eveningOutcome === 'already-inside')
          ? (pos.inside === true && pos.tile === 'haven') : null;
        row.travelLandedOnHaven = nt.travel
          ? (nt.travel.arrival.mapPx === (nt.haven && nt.haven.hx) && nt.travel.arrival.mapPy === (nt.haven && nt.haven.hy)) : null;
      }
      row.woodcarry = ctx._wcLast || null;
      row.woodcarryCarry = ctx._wcCarry || null;
      row.warmth = ctx._wwLast || null;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: POLICY, key: null, grantOk: null, grantMethod: 'none-stripped',
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed },
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, taps: [],
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const ins = inst.evenings.filter((e) => e.inside === true && e.tile === 'haven').length;
    const name = `warmthrestr2-b-nighttravel-s${seed}.json`;
    const summary = `warmthrestr2 policy=${POLICY} woodcarry=${process.env.WOODCARRY} woodwarm=${process.env.WOODWARM} restraint=${RESTR} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} inside=${ins} wcRecords=${inst.woodcarryStore.records} errs=${inst.woodcarryStore.errs} wwActed=${inst.warmthStore.acted} wwErrs=${inst.warmthStore.errs}`;
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
  console.log('wrote ' + done + ' warmthrestr2 files to ' + OUTDIR);
})().catch((e) => { console.error('WARMTHRESTR2 CRASH', e && (e.stack || e)); process.exit(2); });
