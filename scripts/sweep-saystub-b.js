#!/usr/bin/env node
// sweep-saystub-b.js — say-capture corpus recorder (sim-saystub-b,
// 2026-10-25, oversight-flesh-out-loop-b, arm sim-saystub-b).
//
// Contrast, ONLY contrast: CAP=0 (stock harness, say dropped) vs
// CAP=1 (scripts/say-capture.js installed after loadGame) on
// CURRENT head, identical seeds/policy/horizon. The ONLY code
// difference between arms is the capture wrapper.
//
// Cells: policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
// SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only), 100d death-aware horizon
// — the preserveact substrate, pd0 side only. All asserted FATAL.
//
// Env: FEASTSCALE_R13=1 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   CAP=0|1 SEEDS="9750,...,9757" DAYS=100 POLICY=leadfeast
//   PERSEED_DIR=<dir>
// Output: saystub-b-<cap0|cap1>-pd0-dg1-leadfeast-s<seed>.json
//   per seed into PERSEED_DIR (default:
//   evidence/2026-10-25/sim-saystub-b-corpus).
// INSTRUMENT ONLY: zero game-balance changes in this file.
// One process per arm; seeds run sequentially inside the process
// (the loadGame-per-seed pattern the preserveact sweep used).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { installSayCapture, isWorkedLine, isRacksFullLine } = require('./say-capture');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
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
  console.error('FATAL: CAP=0|1 must be set explicitly (every per-seed JSON is tagged with it)');
  process.exit(2);
}
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = leadfeast;
const SEEDS = (process.env.SEEDS || '9750,9751,9752,9753,9754,9755,9756,9757')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SAYCAP = parseInt(process.env.SAYCAP || '200', 10); // raised for cap-hit cells only; default 200
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-25', 'sim-saystub-b-corpus');

function writeRobust(filePath, data) {
  for (let i = 0; i < 30; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return;
    } catch (e) {
      if (i === 29) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'saystub-b-' + POLICY_ID, fullTelemetry: false });
  let cap = null;
  if (CAP === '1') cap = installSayCapture(Game, { cap: SAYCAP });
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
  const samples = cap ? cap.samples : null;
  const perSeed = {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    daysAlive: result.days,
    preserveVillagerBatches: batches, preserveVillagerKcal: Math.round(kcal),
    preserveVillagerResolutions: resolutions,
    deaths: deaths.length, deathCauses, national,
    table: won, win: won, waveReach, rank,
    endReason: result.endReason, cap: CAP === '1' ? 1 : 0, ms,
    saySamples: samples,
    workedLines: samples ? samples.filter(isWorkedLine).length : null,
    racksFullLines: samples ? samples.filter(isRacksFullLine).length : null,
  };
  return perSeed;
}

(async () => {
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `saystub-b-cap${CAP}-pd0-dg1-${POLICY_ID}-s${seed}.json`;
    writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
    console.log(`done cap=${CAP} seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} batches=${perSeed.preserveVillagerBatches} res=${perSeed.preserveVillagerResolutions} deaths=${perSeed.deaths} say=${perSeed.saySamples ? perSeed.saySamples.length : '-'} worked=${perSeed.workedLines} (${perSeed.ms}ms)`);
  }
  console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
