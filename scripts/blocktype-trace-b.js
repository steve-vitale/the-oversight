#!/usr/bin/env node
// blocktype-trace-b.js — refused-evening blockage census driver
// (sim-blocktype-b; prereg: evidence/2026-10-29/
// sim-blocktype-b-prereg.md, committed BEFORE any judged run).
//
// One fresh game per seed (scripts/sim-harness.js). The wrapped
// policy.daily runs once per loop-day; the driver records, per
// loop-day, (a) the MORNING position (post-sleep, pre-daily,
// loop-days 2+), and (b) the EVENING position (post-daily,
// pre-sleep) plus the nighttravel record (ctx._ntLast) and,
// on travel-refused evenings when BLOCKTYPE_DIAG=1, the
// census record (ctx._blocktypeLast) from
// scripts/policies/blocktype-diag.js.
//
// No clock-setting, no waits, no kcal/health top-ups, no
// travelTo in the driver, no direct position writes, no
// steering of nighttravel.daily. POLICY-SIDE ARM ONLY:
// zero src/js changes. The recorder adds no say lines, draws
// no RNG, writes no game state, wraps no engine function.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   BLOCKTYPE_DIAG="1" (optional; recorder ON iff exactly '1')
//   COMPETENT_EVENING_DETOUR unset or "0" (census measures
//     current-master refusals, detour OFF)
//   SEEDS="12000,...,12007" (scan default)
//   DAYS=30
//   OUTDIR (default evidence/2026-10-29/sim-blocktype-b-corpus-<off|on>)
// Write transport mirrors the eveningdetour driver: failed writes
// are kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.blocktype-staging, never /tmp) and exits loudly.
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
if (process.env.COMPETENT_EVENING_DETOUR === '1') { console.error('FATAL: COMPETENT_EVENING_DETOUR must be unset or 0 (census measures detour-OFF refusals)'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '12000,12001,12002,12003,12004,12005,12006,12007')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const RECORDER_ON = process.env.BLOCKTYPE_DIAG === '1';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-blocktype-b-corpus-' + (RECORDER_ON ? 'on' : 'off'));
const STAGING_DIR = path.join(__dirname, '..', '.blocktype-staging');

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
  const { Game } = await loadGame({ seed, mode: 'blocktype-b', fullTelemetry: false });
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
  const base = RECORDER_ON
    ? withBlocktypeDiag(nighttravel, 'blocktype-diag', 'nighttravel + refused-evening blockage census recorder', undefined)
    : nighttravel;
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m });
      }
      const sayBefore = sayLines.length;
      base.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const eveningSayTail = sayLines.slice(Math.max(sayBefore, sayAfter - 30), sayAfter).map((x) => x.line);
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
      // Census record: null on non-refused evenings and on
      // recorder-OFF legs (the OFF/ON diff strips this field).
      row.blocktype = ctx._blocktypeLast || null;
      row.blocktypeErrs = (ctx._blocktype && ctx._blocktype.errs !== undefined) ? ctx._blocktype.errs : null;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: 'nighttravel', recorderOn: RECORDER_ON,
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
    const name = `blocktype-b-${RECORDER_ON ? 'on' : 'off'}-s${seed}.json`;
    const summary = `blocktype recorder=${RECORDER_ON ? 'on' : 'off'} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} refused=${refused} wave=${inst.maxWaveUnlocked}`;
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
  console.log('wrote ' + done + ' blocktype files to ' + OUTDIR);
})().catch((e) => { console.error('BLOCKTYPE CRASH', e && (e.stack || e)); process.exit(2); });
