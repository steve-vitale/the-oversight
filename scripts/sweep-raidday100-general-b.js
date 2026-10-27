#!/usr/bin/env node
// VENDORED for sim-raidday100-general-b from sim-raidday100-b's same-named scripts; only filenames, corpus dir, file prefix, mode string, staging dir, and capture require changed; ledger math and internal raid field names (raidRecords/raiddorOn/RAIDDOORS) unchanged for analyzer compatibility. Sibling raiddor files untouched.
// sweep-raidday100-general-b.js — VENDORED + ADAPTED copy of
// sim-ledgerbound-b:scripts/sweep-ledgerbound-b.js, for
// sim-raidday100-general-b. Adaptations ONLY: output dir/file prefix, mode
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
const { installSpoilvolCapture } = require('./spoilvol-capture');
const { installDriedpathCapture } = require('./driedpath-capture');
const { installStockdoorsCapture, installRaiddorCapture } = require('./stockdoors-capture-raidday100-general');

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
const POLICY_ID = 'competent-nofeast';
const STOCKDOORS_ON = process.env.STOCKDOORS !== '0';
const RAIDDOORS_ON = process.env.RAIDDOORS !== '0';
const SEEDS = (process.env.SEEDS || '9820,9821,9822,9823,9824,9825,9826,9827')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SAYCAP = parseInt(process.env.SAYCAP || '300', 10);
const INFLOWCAP = parseInt(process.env.INFLOWCAP || '50000', 10);
const MEALDRAWCAP = parseInt(process.env.MEALDRAWCAP || '50000', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-27', 'sim-raidday100-general-b-corpus');

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
const STAGING_DIR = path.join(__dirname, '..', '.raidday100-general-b-staging');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'raidday100-general-b-' + POLICY_ID, fullTelemetry: false });
  const inflow = installInflowCapture(Game, { inflowCap: INFLOWCAP });
  const spoilvol = installSpoilvolCapture(Game);
  const driedpath = installDriedpathCapture(Game);
  const stockdoors = STOCKDOORS_ON ? installStockdoorsCapture(Game) : null;
  const raiddor = RAIDDOORS_ON ? installRaiddorCapture(Game) : null;
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
  const spoilDays = [];
  const wrappedPolicy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      try { competent.daily(Game2, ctx); } catch (e) {}
      try {
        const day = (Game2.state.scholar || {}).day || 0;
        const snap = spoilvol.snapshotPantry();
        spoilDays.push({ day, freshKcal: snap.freshKcal, spoiledKcal: snap.spoiledKcal,
          bonus: snap.bonus, channels: snap.channels, error: snap.error });
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
    spoilDays, smokeSayLines,
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
    raiddorOn: RAIDDOORS_ON,
    raidSayLines,
  };
}

(async () => {
  const pending = [];
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `raidday100-general-b-${POLICY_ID}-s${seed}.json`;
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
