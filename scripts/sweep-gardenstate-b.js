#!/usr/bin/env node
// sweep-gardenstate-b.js — garden plot-state sweep (DIAG only).
//
// sim-gardenstate-b, 2026-10-26, oversight-flesh-out-loop-b. Same
// loadGame-per-seed pattern as sweep-inflow-b.js, with BOTH captures
// installed after loadGame and before setupGame:
// scripts/inflow-capture.js (REUSED unchanged: all three pantry doors)
// and scripts/garden-capture.js (NEW: plot-state snapshots at each
// policy.daily call + garden duty/keeper/sow/harvest events).
// Policy: competent-nofeast (COMPETENT_FEAST=0, FEASTSCALE_R13 unset/0,
// SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1).
//
// Env (all asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   FEASTSCALE_R13 unset or 0 (R13=1 is a hard error)
//   SEEDS="9750,...,9757" DAYS=100 SAYCAP=300 INFLOWCAP=50000
// Output: gardenstate-b-competent-nofeast-s<seed>.json, one per seed,
// written as each seed completes (a crash mid-sweep preserves finished
// seeds). All files live in the worktree evidence dir — never /tmp.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installInflowCapture } = require('./inflow-capture');
const { installGardenCapture } = require('./garden-capture');

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
const SEEDS = (process.env.SEEDS || '9750,9751,9752,9753,9754,9755,9756,9757')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SAYCAP = parseInt(process.env.SAYCAP || '300', 10);
const INFLOWCAP = parseInt(process.env.INFLOWCAP || '50000', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26', 'sim-gardenstate-b-corpus');

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
  const { Game } = await loadGame({ seed, mode: 'gardenstate-b-' + POLICY_ID, fullTelemetry: false });
  const inflow = installInflowCapture(Game, { inflowCap: INFLOWCAP });
  const garden = installGardenCapture(Game, { sayCap: SAYCAP });
  await setupGame(Game);
  const gardenDays = [];
  const wrappedPolicy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      try { competent.daily(Game2, ctx); } catch (e) {}
      try {
        const day = (Game2.state.scholar || {}).day || 0;
        gardenDays.push(garden.snapshotGarden(day));
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
    competentFeast: 0, feastscaleR13: 0,
    daysAlive: result.days,
    deaths: deaths.length, deathCauses, national,
    table: won, win: won, waveReach, rank,
    endReason: result.endReason, ms,
    gardenDays, gardenEvents: garden.events, gardenCounters: garden.counters,
    inflows: inflow.inflows, inflowSeen: inflow.counters.inflowSeen,
    inflowTruncated: inflow.inflowTruncated(),
  };
}

(async () => {
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `gardenstate-b-${POLICY_ID}-s${seed}.json`;
    writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
    const gd = perSeed.gardenDays;
    const last = gd.length ? gd[gd.length - 1] : null;
    console.log(`done seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} deaths=${perSeed.deaths} gardenDays=${gd.length} lastBeds=${last ? last.beds : '?'} lastPlanted=${last ? last.planted : '?'} lastRipe=${last ? last.ripe : '?'} assigns=${perSeed.gardenEvents.assigns.length} keeperTurns=${perSeed.gardenEvents.keeperTurns.length} resolutions=${perSeed.gardenEvents.resolutions.length} gardenInflows=${perSeed.gardenEvents.gardenInflows.length} inflows=${perSeed.inflowSeen} (${perSeed.ms}ms)`);
  }
  console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
