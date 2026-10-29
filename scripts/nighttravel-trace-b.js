#!/usr/bin/env node
// nighttravel-trace-b.js — nightly-travel-home measurement instrument
// (sim-nighttravel-b; prereg:
// evidence/2026-10-28/sim-nighttravel-b-prereg.md, committed
// BEFORE any judged run).
//
// One fresh game per seed (scripts/sim-harness.js). The wrapped
// policy.daily runs once per loop-day; the driver records, per
// loop-day, (a) the MORNING position (post-sleep, pre-daily,
// loop-days 2+ — the persistence observation for the previous
// evening), (b) the EVENING position (post-daily, pre-sleep —
// after the policy's night step on the nighttravel leg,
// after insideevening's evening step on the control leg), and (c) on
// TAP DAYS only (the last TAPDAYS loop-days) a GENUINE thief
// tap exactly as thiefinside did (button read via
// Game._actionAvailable, null target; if and only if ok,
// Game.activateAbility('thief.steal_pantry') with NO target).
// The tap is the played reachability probe: on the policy leg
// it should issue from inside with no manual evening; on the
// control leg it should reproduce thiefhall ('none',
// hall-refused).
//
// No clock-setting, no waits, no kcal/health top-ups, no
// travelTo in the driver, no direct position writes, no
// steering of competent.daily. POLICY-SIDE ARM ONLY: zero
// src/js changes.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="insideevening"|"nighttravel" (required)
//   SEEDS="10700,...,10707" (pilot default)
//   DAYS=30 TAPDAYS=5
//   OUTDIR (default evidence/2026-10-28/sim-nighttravel-b-corpus-<policy>)
// Write transport mirrors the thief arms: failed writes are
// kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.nighttravel-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { insideevening } = require('./policies/insideevening');
const { nighttravel } = require('./policies/nighttravel');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
const POLICY = process.env.POLICY;
if (POLICY !== 'insideevening' && POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be insideevening or nighttravel'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '10700,10701,10702,10703,10704,10705,10706,10707')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const TAPDAYS = parseInt(process.env.TAPDAYS || '5', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-nighttravel-b-corpus-' + POLICY);
const STAGING_DIR = path.join(__dirname, '..', '.nighttravel-staging');

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

function loadAbilityDefs() {
  const abs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
  const map = {};
  for (const a of abs) for (const act of (a.actions || [])) map[a.id + '.' + act.id] = { ability: a.id, action: act.id, actObj: act };
  return map;
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

async function oneInstance(seed, defs) {
  const key = 'thief.steal_pantry';
  const def = defs[key];
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
  const s = Game.state.scholar;
  let grantMethod = null;
  try {
    const abs = (s.abilities || []);
    if (!abs.some((a) => (a.id || a) === 'thief')) abs.push({ id: 'thief', level: 1 });
    s.abilities = abs;
    if (Game.hasAbility('thief')) grantMethod = 'abilities-push';
  } catch (e) { grantMethod = 'grant-error:' + String(e && e.message); }
  const grantOk = grantMethod === 'abilities-push';

  const evenings = [], mornings = [], taps = [];
  let callIdx = 0;
  const base = (POLICY === 'nighttravel') ? nighttravel : insideevening;
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      // MORNING position: post-sleep, pre-daily (loop-days 2+).
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m });
      }
      const sayBefore = sayLines.length;
      base.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const eveningSayTail = sayLines.slice(Math.max(sayBefore, sayAfter - 30), sayAfter).map((x) => x.line);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, tapDay: callIdx > DAYS - TAPDAYS, ...pos, eveningSayTail };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else if (POLICY === 'nighttravel') {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.eveningMethod = nt.method || null;
        row.policyBefore = nt.before || null;
        // PRE-TRAVEL position: post-competent.daily, pre-night-step.
        // This is the away/converted classification for M1/M2: an
        // evening is "away" iff preStepTile != 'haven'.
        row.preStepTile = nt.before ? nt.before.tile : null;
        row.preStepMap = nt.before ? (nt.before.mapPx + ',' + nt.before.mapPy) : null;
        row.preStepKcal = nt.before ? nt.before.kcal : null;
        row.haven = nt.haven || null;
        row.havenDistance = (nt.havenDistance === undefined ? null : nt.havenDistance);
        row.travelOffered = (nt.travelOffered === undefined ? null : nt.travelOffered);
        row.travel = nt.travel || null;
        row.travelledHome = !!nt.travelledHome;
        const dg = nt.delegated || {};
        row.policyWalkTarget = dg.walkTarget || null;
        row.policyEntryCellActions = dg.entryCellActions || null;
        row.policyEntryAdjacency = (dg.entryAdjacency === undefined ? null : dg.entryAdjacency);
        row.policyAfter = dg.after || null;
        // Cross-checks: policy record vs driver position must agree,
        // and a recorded travel hop must have landed on the haven node.
        row.positionAgreesWithPolicy = (row.eveningOutcome === 'completed' || row.eveningOutcome === 'already-inside')
          ? (pos.inside === true && pos.tile === 'haven') : null;
        row.travelLandedOnHaven = nt.travel
          ? (nt.travel.arrival.mapPx === (nt.haven && nt.haven.hx) && nt.travel.arrival.mapPy === (nt.haven && nt.haven.hy)) : null;
      } else {
        // Control (insideevening) classification: reuse its record.
        const ie = ctx._ieLast || {};
        row.eveningOutcome = ie.outcome || 'policy-no-record';
        row.eveningMethod = ie.method || null;
        row.policyBefore = ie.before || null;
        // Control has no evening step, so the post-daily driver
        // position IS the pre-step position — including on
        // blocked-combat evenings, where insideevening's record
        // carries no before snapshot (it returns before snapping).
        row.preStepTile = ie.before ? ie.before.tile : pos.tile;
        row.preStepMap = null;
        row.preStepKcal = null;
        row.haven = null;
        row.havenDistance = null;
        row.travelOffered = null;
        row.travel = null;
        row.travelledHome = false;
        row.policyWalkTarget = ie.walkTarget || null;
        row.policyEntryCellActions = ie.entryCellActions || null;
        row.policyEntryAdjacency = (ie.entryAdjacency === undefined ? null : ie.entryAdjacency);
        row.policyAfter = ie.after || null;
        row.positionAgreesWithPolicy = (row.eveningOutcome === 'completed' || row.eveningOutcome === 'already-inside')
          ? (pos.inside === true && pos.tile === 'haven') : null;
        row.travelLandedOnHaven = null;
      }
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
      // TAP DAYS: genuine thief tap from the evening position.
      if (row.tapDay && !Game2.over) {
        const tap = { loopDay: callIdx, gameDayBefore: (Game2.state.scholar || {}).day || 0 };
        const atTap = snapPos(Game2);
        tap.accessAtTap = atTap.access; tap.insideAtTap = atTap.inside; tap.tileAtTap = atTap.tile;
        tap.exiledAtTap = atTap.exiled; tap.stageAtTap = atTap.stage;
        tap.mxAtTap = atTap.mx; tap.myAtTap = atTap.my;
        tap.kcalAtTap = atTap.kcal;
        tap.eveningOutcome = row.eveningOutcome;
        tap.preStepTile = row.preStepTile || null;
        tap.travelledHome = !!row.travelledHome;
        tap.preStepAway = (row.preStepTile !== null && row.preStepTile !== 'haven');
        let ownsThief = null;
        try { ownsThief = !!(Game2.hasAbility ? Game2.hasAbility('thief') : false); } catch (e) {}
        tap.ownsThiefBefore = ownsThief;
        let avail = null, availErr = null;
        try { avail = Game2._actionAvailable('thief', def.actObj); } catch (e) { availErr = String(e && e.message); }
        tap.buttonOk = !!(avail && avail.ok); tap.buttonWhy = avail ? (avail.why || null) : null; tap.buttonErr = availErr;
        if (!tap.buttonOk) {
          tap.outcome = 'button-refused';
        } else {
          const sayB = sayLines.length;
          let tapRes = null, tapErr = null;
          try { tapRes = Game2.activateAbility(key); } catch (e) { tapErr = String(e && (e.stack || e.message)); }
          const sayA = sayLines.length;
          tap.tapResult = (tapRes === undefined ? null : tapRes); tap.tapError = tapErr;
          tap.sayWindow = sayLines.slice(sayB, sayA).map((x) => x.line);
          const win = tap.sayWindow;
          const has = (re) => win.some((l) => re.test(l));
          if (tapRes === true && has(/A hand closes on your wrist/)) tap.tapOutcomeClass = 'success-caught';
          else if (tapRes === true && has(/The food disappears\. Magic/)) tap.tapOutcomeClass = 'success-clean';
          else if (tapRes === false && has(/The pantry is in the hall\. Your hands are not\./)) tap.tapOutcomeClass = 'impl-refused-hall';
          else if (tapRes === false && has(/Nothing worth lifting/)) tap.tapOutcomeClass = 'impl-refused-empty';
          else if (tapRes === false && has(/Too heavy for even a light lift/)) tap.tapOutcomeClass = 'impl-refused-heavy';
          else if (tapRes === false) tap.tapOutcomeClass = 'other-refusal';
          else tap.tapOutcomeClass = 'other-success';
          tap.outcome = 'attempted';
          try {
            const pan = (Game2.state.village || {}).pantry || [];
            tap.pantryKcalAfterTap = Math.round(pan.reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0));
          } catch (e) {}
          const after = snapPos(Game2);
          tap.accessAfter = after.access; tap.insideAfter = after.inside; tap.tileAfter = after.tile;
          tap.kcalAfter = after.kcal;
        }
        taps.push(tap);
      }
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: POLICY, key, grantOk, grantMethod,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, taps,
  };
}

(async () => {
  const defs = loadAbilityDefs();
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed, defs);
    done++;
    const ins = inst.evenings.filter((e) => e.inside === true && e.tile === 'haven').length;
    const att = inst.taps.filter((t) => t.outcome === 'attempted').length;
    const name = `nighttravel-b-${POLICY}-s${seed}.json`;
    const summary = `nighttravel policy=${POLICY} seed=${seed} grant=${inst.grantOk} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} inside=${ins} taps=${inst.taps.length} attempted=${att}`;
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
  console.log('wrote ' + done + ' nighttravel files to ' + OUTDIR);
})().catch((e) => { console.error('NIGHTTRAVEL CRASH', e && (e.stack || e)); process.exit(2); });
