#!/usr/bin/env node
// rubbleroute-trace-b.js — 12-step rubble route-around DIAG tracer
// (sim-rubbleroute-b; prereg:
// evidence/2026-10-29/sim-rubbleroute-b-prereg.md, committed
// BEFORE any judged run).
//
// One fresh game per seed (scripts/sim-harness.js). The wrapped
// policy.daily runs once per loop-day; the driver records, per
// loop-day, (a) the MORNING position (post-sleep, pre-daily,
// loop-days 2+) plus the OVERNIGHT say lines said during sleep
// since the previous daily ended, and (b) the EVENING position
// (post-daily, pre-sleep) plus the nighttravel record
// (ctx._ntLast, including the detour record on gate-ON legs)
// and, on travel-refused evenings, the blocktype census record
// (ctx._blocktypeLast) from scripts/policies/blocktype-diag.js.
// On detour/refused evenings the FULL day's say lines are kept
// (row.sayDayLines); other evenings keep only the last-30 tail.
//
// No clock-setting, no waits, no kcal/health top-ups, no
// travelTo in the driver, no direct position writes, no
// steering of nighttravel.daily. POLICY-SIDE ARM ONLY: zero
// src/js changes. The recorder adds no say lines, draws no
// RNG, writes no game state, wraps no engine function.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   BLOCKTYPE_DIAG="1" (required; recorder ON both legs)
//   COMPETENT_EVENING_DETOUR="0"|"1" (required, exactly one)
//   SEEDS="13224,13029"
//   DAYS=30
//   OUTDIR (default evidence/2026-10-29/sim-rubbleroute-b-corpus-<off|on>)
// Write transport mirrors the blocktype driver: failed writes
// are kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.rubbleroute-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withBlocktypeDiag } = require('./policies/blocktype-diag');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.BLOCKTYPE_DIAG !== '1') { console.error('FATAL: BLOCKTYPE_DIAG=1 must be set explicitly'); process.exit(2); }
const DETOUR = process.env.COMPETENT_EVENING_DETOUR;
if (DETOUR !== '0' && DETOUR !== '1') { console.error('FATAL: COMPETENT_EVENING_DETOUR must be exactly 0 or 1'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '13224,13029')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-rubbleroute-b-corpus-' + (DETOUR === '1' ? 'on' : 'off'));
const STAGING_DIR = path.join(__dirname, '..', '.rubbleroute-staging');

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
  };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'rubbleroute-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);

  const evenings = [], mornings = [];
  let callIdx = 0;
  let lastSayEnd = sayLines.length;
  const base = withBlocktypeDiag(nighttravel, 'blocktype-diag', 'nighttravel + refused-evening blockage census recorder', undefined);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      const dayStartIdx = sayLines.length;
      if (callIdx > 1) {
        const m = snapPos(Game2);
        // Lines said during sleep since the previous daily ended.
        const overnight = sayLines.slice(lastSayEnd, dayStartIdx).map((x) => x.line);
        mornings.push({ loopDay: callIdx, ...m, overnightSayLines: overnight });
      }
      base.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const eveningSayTail = sayLines.slice(Math.max(dayStartIdx, sayAfter - 30), sayAfter).map((x) => x.line);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, ...pos, eveningSayTail };
      const nt = ctx._ntLast || {};
      row.eveningOutcome = Game2.over ? 'game-over' : (nt.outcome || 'policy-no-record');
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
      row.detour = nt.detour || null;
      row.detourAttempted = !!nt.detourAttempted;
      row.delegated = nt.delegated || null;
      row.blocktype = ctx._blocktypeLast || null;
      row.blocktypeErrs = (ctx._blocktype && ctx._blocktype.errs !== undefined) ? ctx._blocktype.errs : null;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      // Full-day say lines only on evenings that matter for the
      // sense read (detour attempted or hop refused); other
      // evenings keep the tail only, to bound corpus size.
      if (row.detourAttempted || row.eveningOutcome === 'travel-refused') {
        row.sayDayLines = sayLines.slice(dayStartIdx, sayAfter).map((x) => x.line);
      }
      lastSayEnd = sayAfter;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: 'nighttravel', recorderOn: true, detourGate: DETOUR,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings,
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const refused = inst.evenings.filter((e) => e.eveningOutcome === 'travel-refused').length;
    const detours = inst.evenings.filter((e) => e.detourAttempted).length;
    const name = `rubbleroute-b-${DETOUR === '1' ? 'on' : 'off'}-s${seed}.json`;
    const summary = `rubbleroute detour=${DETOUR} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} refused=${refused} detours=${detours} wave=${inst.maxWaveUnlocked}`;
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
  console.log('wrote ' + done + ' rubbleroute files to ' + OUTDIR);
})().catch((e) => { console.error('RUBBLEROUTE CRASH', e && (e.stack || e)); process.exit(2); });
