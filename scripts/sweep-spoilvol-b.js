#!/usr/bin/env node
// sweep-spoilvol-b.js — per-channel spoil-removal volume band sweep
// (measurement only).
//
// sim-spoilvol-b, 2026-10-26, oversight-flesh-out-loop-b. Same substrate
// as lqpersist: competent-nofeast (COMPETENT_FEAST=0,
// FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1),
// 100d death-aware. Reuses scripts/inflow-capture.js and
// scripts/mealdraw-capture.js UNCHANGED, plus the NEW
// scripts/spoilvol-capture.js (wraps Game.sweepSpoiled once; reads
// state, delegates identically, writes ONLY to the caller's arrays).
// Day-end snapshots use spoilvol-capture's snapshotPantry (same
// classification as the sweep records, bonus-aware horizons included).
//
// Env (all asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   FEASTSCALE_R13 unset or 0
//   SEEDS="9820,...,9827" DAYS=100 SAYCAP=300 INFLOWCAP=50000 MEALDRAWCAP=50000
//   SPOILVOL=0 disables the spoilvol wrapper (det-gate control only).
// Output: spoilvol-b-competent-nofeast-s<seed>.json, one per seed,
// written as each seed completes. SWEEP_STDOUT_JSON=1 emits exactly one
// JSON line per seed on stdout (diagnostics on stderr) for the proof
// re-run, with identical payload bytes except `ms` and spoilvol fields.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installInflowCapture } = require('./inflow-capture');
const { installMealDrawCapture } = require('./mealdraw-capture');
const { installSpoilvolCapture } = require('./spoilvol-capture');

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
const SPOILVOL_ON = process.env.SPOILVOL !== '0';
const SEEDS = (process.env.SEEDS || '9820,9821,9822,9823,9824,9825,9826,9827')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SAYCAP = parseInt(process.env.SAYCAP || '300', 10);
const INFLOWCAP = parseInt(process.env.INFLOWCAP || '50000', 10);
const MEALDRAWCAP = parseInt(process.env.MEALDRAWCAP || '50000', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26', 'sim-spoilvol-b-corpus');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function writeRobust(filePath, data) {
  for (let i = 0; i < 60; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return;
    } catch (e) {
      if (i === 59) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      realSleepMs(2000);
    }
  }
}

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'spoilvol-b-' + POLICY_ID, fullTelemetry: false });
  const inflow = installInflowCapture(Game, { inflowCap: INFLOWCAP });
  const spoilvol = SPOILVOL_ON ? installSpoilvolCapture(Game) : null;
  // Spoil-voice sample recorder (part of the spoilvol instrument, gated
  // by the same SPOILVOL flag so the det-gate compares the full
  // instrument on/off). Read-only: records Game.say lines mentioning
  // rot, delegates identically, writes ONLY to the caller's array, no
  // state write, no RNG use. Installed BEFORE mealdraw so mealdraw's
  // say wrapper wraps this one, same order as the lqpersist sweep
  // (garden say first, mealdraw say last).
  const spoilSayLines = [];
  if (SPOILVOL_ON) {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try {
          const line = String(args[0] || '');
          if (/spoil|rotten|went bad|threw out|flies/i.test(line) && spoilSayLines.length < 2000) {
            spoilSayLines.push({ day: (Game.state.scholar || {}).day || 0, line: line.slice(0, 300) });
          }
        } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  const mealdraw = installMealDrawCapture(Game, { mealdrawCap: MEALDRAWCAP });
  await setupGame(Game);
  const spoilDays = [];
  const wrappedPolicy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      try { competent.daily(Game2, ctx); } catch (e) {}
      try {
        if (!spoilvol) return;
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
    competentFeast: 0, feastscaleR13: 0, spoilvolOn: SPOILVOL_ON,
    daysAlive: result.days,
    deaths: deaths.length, deathCauses, deathList: deaths, national,
    table: won, win: won, waveReach, rank,
    endReason: result.endReason, ms,
    spoilDays, spoilSayLines,
    spoilEvents: spoilvol ? spoilvol.events : null, spoilCounters: spoilvol ? spoilvol.counters : null,
    mealDrawRecords: mealdraw.mealDrawRecords, mealDrawCounters: mealdraw.counters,
    mealdrawTruncated: mealdraw.mealdrawTruncated(),
    inflows: inflow.inflows, inflowSeen: inflow.counters.inflowSeen,
    inflowTruncated: inflow.inflowTruncated(),
  };
}

(async () => {
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `spoilvol-b-${POLICY_ID}-s${seed}.json`;
    const sw = perSeed.spoilEvents ? perSeed.spoilEvents.sweeps.length : 0;
    const md = perSeed.mealDrawRecords.length;
    const summary = `done seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} deaths=${perSeed.deaths} sweeps=${sw} spoilDays=${perSeed.spoilDays.length} mealDraw=${md} inflows=${perSeed.inflowSeen} (${perSeed.ms}ms)`;
    if (process.env.SWEEP_STDOUT_JSON === '1') {
      process.stdout.write(JSON.stringify(perSeed) + '\n');
      console.error(summary);
    } else {
      writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
      console.log(summary);
    }
  }
  if (process.env.SWEEP_STDOUT_JSON === '1') console.error('wrote ' + SEEDS.length + ' files to stdout');
  else console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
