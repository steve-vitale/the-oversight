#!/usr/bin/env node
// sweep-freshdays-b.js — pantryFreshDays decomposition sweep (DIAG only).
//
// sim-freshdays-b, 2026-10-26, oversight-flesh-out-loop-b run
// fleshout-loop-b-20261026T1730Z, axis food-economy. Re-runs the
// preservesched band EXACTLY (seeds 9750-9757, competent-nofeast, 100d,
// SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1) so the quoted high
// fresh-days values (seed 9753 day 74: 249.8; day 64: 221.7; seed 9752
// day 90: 132.0) can be reproduced and then decomposed at the line that
// quoted them. Installs, after loadGame and before setupGame:
//   scripts/substrate-capture.js (REUSED unchanged: cook lines + duty
//     events, racks-bound day set, first-bound-line freshDays snapshot)
//   scripts/freshdays-capture.js (NEW: per-day + per-cook-line pantry
//     decomposition, same rules as pantryFreshKcal()).
// The wrapped policy snapshots the decomposition once per policy.daily
// call, after delegating to competent.daily.
// Env (all asserted FATAL, same band contract as sweep-inflow-b.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   FEASTSCALE_R13 unset or 0 (R13=1 is a hard error)
//   SEEDS="9750,...,9757" DAYS=100 SAYCAP=1000 EVENTCAP=3000
// Output: freshdays-b-competent-nofeast-s<seed>.json, one per seed,
// written as each seed completes (a crash mid-sweep preserves finished
// seeds). All files live in the worktree evidence dir — never /tmp.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installSubstrateCapture, fillEventNames } = require('./substrate-capture');
const { installFreshdaysCapture } = require('./freshdays-capture');
const { buildDayTable } = require('./substrate-days');

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
const SAYCAP = parseInt(process.env.SAYCAP || '1000', 10);
const EVENTCAP = parseInt(process.env.EVENTCAP || '3000', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26', 'sim-freshdays-b-corpus');

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
  const { Game } = await loadGame({ seed, mode: 'freshdays-b-' + POLICY_ID, fullTelemetry: false });
  const cap = installSubstrateCapture(Game, { cookCap: SAYCAP, eventCap: EVENTCAP });
  const fd = installFreshdaysCapture(Game, { cookCap: SAYCAP });
  await setupGame(Game);
  const wrappedPolicy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      try { competent.daily(Game2, ctx); } catch (e) {}
      try { fd.snapshotDay('policyDaily'); } catch (e) {}
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
  const cookLines = cap.cookLines;
  const events = fillEventNames(cap.events);
  const dayTable = buildDayTable(cookLines, events);
  return {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    competentFeast: 0, feastscaleR13: 0,
    daysAlive: result.days,
    deaths: deaths.length, deathList: deaths, deathCauses, national,
    table: won, win: won, waveReach, rank,
    endReason: result.endReason, ms,
    sayTotal: cookLines.length,
    cookSeen: cap.counters.cookSeen,
    cookTruncated: cap.cookTruncated(),
    eventSeen: cap.counters.eventSeen,
    eventTruncated: cap.eventTruncated(),
    dayTable, racksBoundDays: dayTable.length,
    cookLines, events,
    freshDaily: fd.daily, freshCook: fd.cook,
    freshCookSeen: fd.counters.cookSeen,
    freshCookTruncated: fd.cookTruncated(),
  };
}

(async () => {
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `freshdays-b-${POLICY_ID}-s${seed}.json`;
    writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
    const hiDaily = perSeed.freshDaily.filter(s => (s.freshDaysReported || 0) >= 50).length;
    const hiCook = perSeed.freshCook.filter(s => (s.freshDaysReported || 0) >= 50).length;
    const maxFd = Math.max(0, ...perSeed.freshDaily.map(s => s.freshDaysReported || 0));
    console.log(`done seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} deaths=${perSeed.deaths} racksBoundDays=${perSeed.racksBoundDays} daily=${perSeed.freshDaily.length} cookSnaps=${perSeed.freshCook.length} hiDaily=${hiDaily} hiCook=${hiCook} maxDailyFd=${maxFd.toFixed(1)} (${perSeed.ms}ms)`);
  }
  console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
