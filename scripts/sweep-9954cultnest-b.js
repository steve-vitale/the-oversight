#!/usr/bin/env node
// sweep-9954cultnest-b.js — VENDORED copy of scripts/sweep-9954perstack-b.js
// for sim-cultnest-b (faithful raidcallers replication for seed 9954 ONLY,
// PLUS one added read-only span logger — see the cultnest block after the
// mealdraw install). NO capture file is modified; NO src/js is modified.
// (faithful raidcallers replication for seed 9954 ONLY, PLUS one
// added read-only per-iteration recorder — see below). NO capture
// file is modified; NO src/js is modified. Adaptations ONLY: output
// dir/file prefix, and the NEW per-iteration recorder.
// NO capture file is modified; NO src/js is modified. Adaptations ONLY: output dir/file prefix, mode
// string, staging dir, the capture require below, the NEW raiddor
// install (Game._removePantryKcal snapshot-diff recorder), and a
// read-only raid say-line recorder (Game.say lines mentioning the
// treeline); sweep logic otherwise identical. The ledgerbound branch
// is untouched. (measurement only).
// (measurement only).
//
// sim-stockdoors-b, 2026-10-26, oversight-flesh-out-loop-b. Same substrate
// as driedpath: competent-nofeast (COMPETENT_FEAST=0,
// FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1),
// 100d death-aware, seeds 9820-9827 REUSED as substrate (stated in the
// prereg — no freshness claim). Reuses scripts/inflow-capture.js,
// scripts/mealdraw-capture.js, scripts/spoilvol-capture.js, and
// scripts/driedpath-capture.js UNCHANGED, plus the NEW
// scripts/stockdoors-capture.js (stockSurplus via the reused
// stockdoor-capture.js + direct-consumption snapshot-diff wrappers).
// Opening-stock snapshot after setupGame, before the first policy day.
// Day-end snapshots use spoilvol-capture's snapshotPantry.
//
// Env (all asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   FEASTSCALE_R13 unset or 0
//   SEEDS="9820,...,9827" DAYS=100 SAYCAP=300 INFLOWCAP=50000 MEALDRAWCAP=50000
//   STOCKDOORS=0 disables ONLY the stockdoors install (det-gate control;
//   driedpath + spoilvol stay on in both det-gate runs, so the det-gate
//   compares the stockdoors instrument alone).
// Output: stockdoors-b-competent-nofeast-s<seed>.json, one per seed,
// written as each seed completes. SWEEP_STDOUT_JSON=1 emits exactly one
// JSON line per seed on stdout (diagnostics on stderr) for the proof
// re-run, with identical payload bytes except `ms` and stockdoors fields.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installInflowCapture } = require('./inflow-capture');
const { installMealDrawCapture } = require('./mealdraw-capture');
const { installSpoilvolCapture, snapshotAll } = require('./spoilvol-capture');
const { installDriedpathCapture } = require('./driedpath-capture');
const { installStockdoorsCapture, installRaiddorCapture } = require('./stockdoors-capture-raidcallers');

if (process.env.FEASTSCALE_R13 === '1') {
  console.error('FATAL: this band is feastscale-OFF; FEASTSCALE_R13=1 is forbidden');
  process.exit(2);
}
if (process.env.COMPETENT_FEAST !== '0') {
  console.error('FATAL: this band is no-feast; COMPETENT_FEAST=0 must be set explicitly');
  process.exit(2);
}
if (process.env.SEATDRIVE !== '0') {
  console.error('FATAL: SEATDRIVE=0 must be set explicitly');
  process.exit(2);
}
if (process.env.PLENTYDEPRI !== '0') {
  console.error('FATAL: this recorder is pd0-only; PLENTYDEPRI=0 must be set explicitly');
  process.exit(2);
}
if (process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: this recorder is dg1-only; DEPOSITGATE=1 must be set explicitly');
  process.exit(2);
}
// POLICY selection (raidcallers adaptation — the raiddor sweep hardcoded
// competent). POLICY names a regional-politics-leaning policy module;
// every candidate wraps the competent substrate, so the nofeast gates
// above still apply. treeline is composed here (withTreeline over
// competent) because the module's ready-made stacks wrap feast stacks,
// not the nofeast substrate; TREELINE=1 must be set by the caller for
// the layer to answer (the layer is default-OFF, same as upstream).
const POLICY_NAME = (process.env.POLICY || 'competent').toLowerCase();
let POLICY_OBJ = competent, POLICY_BASE = 'competent';
if (POLICY_NAME === 'belongseek') { POLICY_OBJ = require('./policies/belongseek').belongseek; POLICY_BASE = 'belongseek'; }
else if (POLICY_NAME === 'scalecourt') { POLICY_OBJ = require('./policies/scalecourt').scalecourt; POLICY_BASE = 'scalecourt'; }
else if (POLICY_NAME === 'treeline') { POLICY_OBJ = require('./policies/treeline').withTreeline(competent, 'competent-treeline', 'competent + treeline hold answers'); POLICY_BASE = 'treeline'; }
else if (POLICY_NAME === 'warcourt') { POLICY_OBJ = require('./policies/warcourt').warcourt; POLICY_BASE = 'warcourt'; }
else if (POLICY_NAME === 'kind') { POLICY_OBJ = require('./policies/kind').kind; POLICY_BASE = 'kind'; }
else if (POLICY_NAME !== 'competent') { console.error('FATAL: unknown POLICY ' + POLICY_NAME); process.exit(2); }
const POLICY_ID = POLICY_BASE + '-nofeast';
const STOCKDOORS_ON = process.env.STOCKDOORS !== '0';
const RAIDCALLERS_ON = process.env.RAIDCALLERS !== '0';
const SEEDS = (process.env.SEEDS || '9954')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SAYCAP = parseInt(process.env.SAYCAP || '300', 10);
const INFLOWCAP = parseInt(process.env.INFLOWCAP || '50000', 10);
const MEALDRAWCAP = parseInt(process.env.MEALDRAWCAP || '50000', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);
// ---- sim-9954perstack-b: READ-ONLY per-iteration recorder (the ONLY
// addition vs sweep-9954trace-b.js). At every snapshot moment it
// records, alongside the existing stack snapshot, the cumulative
// lengths of every flow array, so the walk can slice each array
// between consecutive snapshots and attribute every flow to exactly
// one iteration interval. Length reads consume no RNG and write
// nothing to game state.
// ---- sim-9954trace-b: READ-ONLY per-stack pantry recorder (kept verbatim). snapshotAll() is the spoilvol
// capture's own read-only snapshot (already called by the sweep's
// sweepSpoiled wrapper on every sweep); this calls it at the daily
// snapshot moment, at day-100 start, and post-run. It reads state,
// consumes no RNG, writes only to the caller's arrays. Fidelity is
// PROVED, not assumed, by the field-by-field comparison in
// scripts/test-9954trace-b.js (replay vs committed corpus).
function stripStacks(stacks) {
  return (stacks || []).map((s) => ({ channel: s.channel, kcalEach: s.kcalEach,
    units: s.units, kcal: s.kcal, spoilDay: s.spoilDay, bonus: s.bonus,
    rawHorizon: s.rawHorizon, bonusHorizon: s.bonusHorizon, spoiled: s.spoiled,
    foodState: s.foodState, foodKind: s.foodKind, container: s.container }));
}
function stackSnap(Game) {
  try { const snap = snapshotAll(Game); return { day: snap.day, bonus: snap.bonus, pantry: stripStacks(snap.pantry), error: snap.error }; }
  catch (e) { return { day: null, bonus: null, pantry: [], error: 'stackSnap: ' + String(e && e.message) }; }
}
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-27', 'sim-9954cultnest-b-replay');
// Per-iteration flow counts (NEW in this arm): cumulative array lengths
// at a snapshot moment. Defined inside oneRun (after installs) where
// the capture objects are in scope; see flowCounts there.

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  // Transport note (2026-10-27, post-prereg, not a judged definition):
  // the container EPERM write flap blocks evidence writes for 10+
  // minutes at a time (five failed sweeps this run, each dying on the
  // FIRST per-seed file — and the 150-retry edit never took effect,
  // because the exit check still read i === 59). A sweep that exits
  // on the first failed write loses every seed's compute, so the
  // sweep now KEEPS failed per-seed payloads in memory, finishes
  // all seeds, and flushes pending files until a quiet window opens
  // (deadline 45 min); only a deadline exhaustion writes the staging
  // fallback and exits loudly. Recorded bytes are identical either
  // way — this changes transport, never content.
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
const STAGING_DIR = path.join(__dirname, '..', '.raidcallers-ledger-staging');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'raidcallers-b-' + POLICY_ID, fullTelemetry: false });
  const inflow = installInflowCapture(Game, { inflowCap: INFLOWCAP });
  const spoilvol = installSpoilvolCapture(Game);
  const driedpath = installDriedpathCapture(Game);
  const stockdoors = STOCKDOORS_ON ? installStockdoorsCapture(Game) : null;
  const raiddor = RAIDCALLERS_ON ? installRaiddorCapture(Game) : null;
  // Smoke-rack say recorder (part of the driedpath instrument, always
  // on in this sweep so the det-gate compares the stockdoors
  // instrument alone). Read-only: records Game.say lines mentioning
  // the smoke racks, delegates identically, writes ONLY to the
  // caller's array, no state write, no RNG use.
  const smokeSayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try {
          const line = String(args[0] || '');
          if (/smoke racks/i.test(line) && smokeSayLines.length < 2000) {
            smokeSayLines.push({ day: (Game.state.scholar || {}).day || 0, line: line.slice(0, 400) });
          }
        } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  const mealdraw = installMealDrawCapture(Game, { mealdrawCap: MEALDRAWCAP });
  // NEW (cultnest): READ-ONLY useAbility-span + pantryDraw event logger
  // (the ONLY addition vs sweep-9954perstack-b.js). Installed AFTER
  // all existing captures, so it sits OUTSIDE the stockdoors
  // useAbility wrapper (span entry precedes its pre-snapshot, span
  // exit follows its record push) and OUTSIDE the mealdraw
  // pantryDraw wrapper (draw events are the same calls mealdraw
  // records). One shared monotonic counter `evt` orders every
  // event, so nesting is read from evt order, never from day
  // labels. Delegates identically, writes ONLY to nestEvents,
  // consumes no RNG, writes no game state.
  const nestEvents = [];
  let nestEvt = 0, nestDepth = 0;
  function nestDay() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function nestFrames() {
    try {
      const lines = String(new Error().stack || '').split('\n').slice(1);
      const out = [];
      for (const ln of lines) {
        if (/nestFrames|wrappedCultnestUse|wrappedCultnestDraw/.test(ln)) continue;
        const m = ln.match(/at\s+(?:async\s+)?([^\s(]+)/);
        out.push(m ? m[1] : ln.trim().slice(0, 80));
        if (out.length >= 8) break;
      }
      return out;
    } catch (e) { return []; }
  }
  {
    const origUse = Game.useAbility;
    if (typeof origUse === 'function' && !origUse.__cultnestInstalled) {
      const wrappedCultnestUse = function (...args) {
        const depth = nestDepth++;
        const directBefore = (() => { try { return (stockdoors ? stockdoors.directRecords.length : 0); } catch (e) { return -1; } })();
        nestEvents.push({ evt: ++nestEvt, kind: 'spanEnter', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore });
        let ret;
        try { ret = origUse.apply(this, args); } finally {
          const directAfter = (() => { try { return (stockdoors ? stockdoors.directRecords.length : 0); } catch (e) { return -1; } })();
          nestEvents.push({ evt: ++nestEvt, kind: 'spanExit', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore, directAfter, result: ret });
          nestDepth--;
        }
        return ret;
      };
      wrappedCultnestUse.__cultnestInstalled = true;
      Game.useAbility = wrappedCultnestUse;
    }
    const origDraw = Game.pantryDraw;
    if (typeof origDraw === 'function' && !origDraw.__cultnestInstalled) {
      const wrappedCultnestDraw = function (...args) {
        const frames = nestFrames();
        const want = args[1];
        nestEvents.push({ evt: ++nestEvt, kind: 'drawEnter', day: nestDay(), want: (want == null ? null : Math.round(want)), frames });
        const ret = origDraw.apply(this, args);
        try {
          const items = [];
          for (const d of (ret.items || [])) {
            const it = d.item || {};
            items.push({ name: (it.name == null ? null : String(it.name)), kcalEach: (it.kcalEach || 0), units: (d.units || 0), spoilDay: (it.spoilDay == null ? null : it.spoilDay) });
          }
          nestEvents.push({ evt: ++nestEvt, kind: 'drawExit', day: nestDay(), want: (want == null ? null : Math.round(want)), taken: Math.round(ret.taken || 0), items });
        } catch (e) {}
        return ret;
      };
      wrappedCultnestDraw.__cultnestInstalled = true;
      Game.pantryDraw = wrappedCultnestDraw;
    }
  }
  // Raid say recorder (part of the raiddor instrument, always on in
  // this sweep so the det-gate compares the raiddor instrument alone).
  // Read-only: records Game.say lines mentioning the treeline,
  // delegates identically, writes ONLY to the caller's array.
  const raidSayLines = [];
  {
    const origSay2 = Game.say;
    if (typeof origSay2 === 'function') {
      Game.say = function (...args) {
        try {
          const line = String(args[0] || '');
          if (/treeline/i.test(line) && raidSayLines.length < 2000) {
            raidSayLines.push({ day: (Game.state.scholar || {}).day || 0, line: line.slice(0, 400) });
          }
        } catch (e) {}
        return origSay2.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  // OPENING STOCK: pantry snapshot after setup, before the first day.
  // Always via the (always-on) spoilvol snapshot so the det-gate
  // payload shape is identical with STOCKDOORS on and off.
  const openingStock = (() => { try { return spoilvol.snapshotPantry(); } catch (e) { return null; } })();
  // NEW (perstack): flow-count reader + opening per-stack snapshot.
  // Length reads only: no RNG, no state write.
  function flowCounts() {
    try {
      return {
        inflows: (inflow.inflows || []).length,
        stockdoor: stockdoors ? (stockdoors.stockdoorRecords || []).length : 0,
        mealDraw: (mealdraw.mealDrawRecords || []).length,
        direct: stockdoors ? (stockdoors.directRecords || []).length : 0,
        raid: raiddor ? (raiddor.raidRecords || []).length : 0,
        dried: ((driedpath.events && driedpath.events.events) || []).length,
        sweeps: ((spoilvol.events && spoilvol.events.sweeps) || []).length,
      };
    } catch (e) { return { inflows: -1, stockdoor: -1, mealDraw: -1, direct: -1, raid: -1, dried: -1, sweeps: -1, error: String(e && e.message) }; }
  }
  const perstackOpening = { stack: stackSnap(Game), counts: flowCounts() };
  const spoilDays = [];
  const stackDays = []; // lockstep with spoilDays: same call, per-stack breakdown
  const perstackFlowCounts = []; // NEW: lockstep with stackDays, one entry per iteration
  let stackDay100Start = null;
  let perstackDay100StartCounts = null; // NEW: flow counts at the day-100 start moment
  const wrappedPolicy = Object.assign({}, POLICY_OBJ, {
    daily(Game2, ctx) {
      try {
        const day0 = (Game2.state.scholar || {}).day || 0;
        if (day0 === 100 && !stackDay100Start) { stackDay100Start = stackSnap(Game2); perstackDay100StartCounts = flowCounts(); }
      } catch (e) {}
      try { POLICY_OBJ.daily(Game2, ctx); } catch (e) {}
      try {
        const day = (Game2.state.scholar || {}).day || 0;
        const snap = spoilvol.snapshotPantry();
        spoilDays.push({ day, freshKcal: snap.freshKcal, spoiledKcal: snap.spoiledKcal,
          bonus: snap.bonus, channels: snap.channels, error: snap.error });
        stackDays.push(stackSnap(Game2));
        perstackFlowCounts.push(flowCounts());
      } catch (e) {}
    },
  });
  const deaths = [];
  const deathSeen = new Set();
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!deathSeen.has(key)) { deathSeen.add(key); deaths.push({ day, who: who.slice(0, 24), kind, cause }); }
      }
    } catch (e) {}
  };
  const t0 = Date.now();
  const result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: null });
  const ms = Date.now() - t0;
  const stackPostRun = stackSnap(Game);
  const perstackPostRunCounts = flowCounts(); // NEW: flow counts at post-run
  // stackDay100Snap: the stackDays entry lockstep with the LAST spoilDays
  // entry (the corpus closing snapshot), iff that entry is day 100.
  let stackDay100Snap = null;
  if (spoilDays.length && spoilDays[spoilDays.length - 1].day === 100) stackDay100Snap = stackDays[stackDays.length - 1] || null;
  const deathCauses = {};
  for (const d of deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  return {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    competentFeast: 0, feastscaleR13: 0, stockdoorsOn: STOCKDOORS_ON,
    daysAlive: result.days,
    deaths: deaths.length, deathCauses, deathList: deaths, national,
    table: won, win: won, waveReach, rank,
    endReason: result.endReason, ms,
    openingStock,
    spoilDays, stackDays, stackDay100Start, stackDay100Snap, stackPostRun, smokeSayLines,
    perstackOpening, perstackFlowCounts, perstackDay100StartCounts, perstackPostRunCounts,
    driedEvents: driedpath.events.events,
    driedCounters: driedpath.counters,
    spoilEvents: spoilvol.events, spoilCounters: spoilvol.counters,
    mealDrawRecords: mealdraw.mealDrawRecords, mealDrawCounters: mealdraw.counters,
    mealdrawTruncated: mealdraw.mealdrawTruncated(),
    inflows: inflow.inflows, inflowSeen: inflow.counters.inflowSeen,
    inflowTruncated: inflow.inflowTruncated(),
    stockdoorRecords: stockdoors ? stockdoors.stockdoorRecords : null,
    stockdoorCounters: stockdoors ? stockdoors.stockdoorCounters : null,
    stockdoorTruncated: stockdoors ? stockdoors.stockdoorTruncated() : null,
    directRecords: stockdoors ? stockdoors.directRecords : null,
    directCounters: stockdoors ? stockdoors.counters : null,
    raidRecords: raiddor ? raiddor.raidRecords : null,
    raidCounters: raiddor ? raiddor.counters : null,
    raiddorOn: RAIDCALLERS_ON,
    raidSayLines,
    nestEvents,
  };
}

(async () => {
  const pending = [];
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `9954cultnest-b-${POLICY_ID}-s${seed}.json`;
    const sw = perSeed.spoilEvents ? perSeed.spoilEvents.sweeps.length : 0;
    const de = perSeed.driedEvents ? perSeed.driedEvents.length : 0;
    const md = perSeed.mealDrawRecords.length;
    const sd = perSeed.stockdoorRecords ? perSeed.stockdoorRecords.length : 0;
    const dr = perSeed.directRecords ? perSeed.directRecords.length : 0;
    const rd = perSeed.raidRecords ? perSeed.raidRecords.length : 0;
    const summary = `done seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} deaths=${perSeed.deaths} sweeps=${sw} driedEvents=${de} spoilDays=${perSeed.spoilDays.length} mealDraw=${md} inflows=${perSeed.inflowSeen} stockdoor=${sd} direct=${dr} raid=${rd} (${perSeed.ms}ms)`;
    if (process.env.SWEEP_STDOUT_JSON === '1') {
      process.stdout.write(JSON.stringify(perSeed) + '\n');
      console.error(summary);
    } else {
      const data = JSON.stringify(perSeed);
      // Short initial window on purpose: the end-flush loop does the
      // long waiting for ALL seeds at once; burning 5 min per seed
      // here would serialize the flap wait 8 times.
      if (tryWrite(path.join(PERSEED_DIR, name), data, 6)) {
        console.log(summary + ' written');
      } else {
        pending.push({ name, data });
        console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory, will flush at end');
      }
    }
  }
  if (process.env.SWEEP_STDOUT_JSON === '1') {
    console.error('wrote ' + SEEDS.length + ' files to stdout');
  } else if (pending.length) {
    // Flush loop: a seconds-long quiet window is all a flush needs.
    // Deadline 45 min; between passes, sleep 30s (quiet gaps recur).
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(PERSEED_DIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
    if (pending.length) {
      // Last resort: staging inside this worktree (never /tmp), so
      // the compute survives even a deadline exhaustion; the
      // coordinator copies staging -> evidence and the corpus is
      // still verified byte-for-byte before any judging.
      for (const p of pending) {
        if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
        else console.error('STAGE FAIL LOUDLY ' + p.name);
      }
      console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + PERSEED_DIR + ' before judging');
      process.exit(3);
    }
    console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR + ' (after flush)');
  } else {
    console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
  }
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
