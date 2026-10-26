#!/usr/bin/env node
// sweep-substrate-b.js — racks-bound-day substrate measurement (DIAG only).
//
// sim-substrate-b, 2026-10-26, oversight-flesh-out-loop-b. Same
// loadGame-per-seed pattern as sweep-noelig-lean-b.js, with
// scripts/substrate-capture.js recording cook lines + forage/throttle
// events at emit time. Policy: competent-nofeast (COMPETENT_FEAST=0,
// FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1).
//
// Env (all asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   FEASTSCALE_R13 unset or 0 (R13=1 is a hard error)
//   CAP=0|1 SEEDS="9750,...,9757" DAYS=100 SAYCAP=1000 EVENTCAP=3000
//   SWEEP_CENSUS=1 (stdout carrier; a short-lived splitter persists
//   per-seed JSONs from stdout — the long sweep never writes files)
// Output: substrate-b-<cap0|cap1>-pd0-dg1-competent-nofeast-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installSubstrateCapture, fillEventNames } = require('./substrate-capture');
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
const CAP = process.env.CAP || '';
if (CAP !== '0' && CAP !== '1') {
  console.error('FATAL: CAP=0|1 must be set explicitly');
  process.exit(2);
}
const POLICY_ID = 'competent-nofeast';
const POLICY = competent;
const SEEDS = (process.env.SEEDS || '9750,9751,9752,9753,9754,9755,9756,9757')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SAYCAP = parseInt(process.env.SAYCAP || '1000', 10);
const EVENTCAP = parseInt(process.env.EVENTCAP || '3000', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26', 'sim-substrate-b-corpus');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function writeRobust(filePath, data) {
  if (process.env.SWEEP_CENSUS === '1') {
    console.log('PERSEED-CENSUS ' + path.basename(filePath) + ' ' + data);
    return;
  }
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
  const { Game } = await loadGame({ seed, mode: 'substrate-b-' + POLICY_ID, fullTelemetry: false });
  let cap = null;
  if (CAP === '1') cap = installSubstrateCapture(Game, { cookCap: SAYCAP, eventCap: EVENTCAP });
  await setupGame(Game);
  let resolutions = 0;
  const oCredit = Game.creditDeed;
  if (typeof oCredit === 'function') Game.creditDeed = function (who, deedId, trackOverride) {
    const ret = oCredit.apply(this, arguments);
    try { if (deedId === 'preserving') resolutions += 1; } catch (e) {}
    return ret;
  };
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
  const result = await runDays(Game, POLICY, { days: DAYS, manifest: null });
  const ms = Date.now() - t0;
  let batches = 0, kcal = 0;
  try {
    const hc = Game._haulcount || {};
    batches = hc.villagerPreserveBatches || 0;
    kcal = hc.villagerPreserveKcal || 0;
  } catch (e) {}
  const deathCauses = {};
  for (const d of deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const cookLines = cap ? cap.cookLines : null;
  const events = cap ? fillEventNames(cap.events) : null;
  const dayTable = (cookLines && events) ? buildDayTable(cookLines, events) : null;
  const classCounts = {};
  if (dayTable) for (const d of dayTable) classCounts[d.class] = (classCounts[d.class] || 0) + 1;
  const workedCount = cookLines ? cookLines.filter(s => s.frame === 'worked').length : null;
  const racksFullCount = cookLines ? cookLines.filter(s => s.frame === 'racksFull').length : null;
  const plainCount = cookLines ? cookLines.filter(s => s.frame === 'plain').length : null;
  const eventCounts = {};
  if (events) for (const e of events) eventCounts[e.kind] = (eventCounts[e.kind] || 0) + 1;
  return {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    competentFeast: 0, feastscaleR13: 0,
    daysAlive: result.days,
    preserveVillagerBatches: batches, preserveVillagerKcal: Math.round(kcal),
    preserveVillagerResolutions: resolutions,
    deaths: deaths.length, deathCauses, national,
    table: won, win: won, waveReach, rank,
    endReason: result.endReason, cap: CAP === '1' ? 1 : 0, ms,
    sayTotal: cookLines ? cookLines.length : null,
    cookSeen: cap ? cap.counters.cookSeen : null,
    cookTruncated: cap ? cap.cookTruncated() : null,
    eventSeen: cap ? cap.counters.eventSeen : null,
    eventTruncated: cap ? cap.eventTruncated() : null,
    workedLines: workedCount, racksFullLines: racksFullCount, plainLines: plainCount,
    eventCounts: events ? eventCounts : null,
    dayTable, classCounts,
    racksBoundDays: dayTable ? dayTable.length : null,
    cookLines, events,
    fullSamplesPersisted: !!cookLines,
  };
}

(async () => {
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `substrate-b-cap${CAP}-pd0-dg1-${POLICY_ID}-s${seed}.json`;
    writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
    console.log(`done cap=${CAP} seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} batches=${perSeed.preserveVillagerBatches} res=${perSeed.preserveVillagerResolutions} deaths=${perSeed.deaths} cook=${perSeed.sayTotal} racksFull=${perSeed.racksFullLines} plain=${perSeed.plainLines} events=${JSON.stringify(perSeed.eventCounts)} racksBoundDays=${perSeed.racksBoundDays} classes=${JSON.stringify(perSeed.classCounts)} (${perSeed.ms}ms)`);
  }
  console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
