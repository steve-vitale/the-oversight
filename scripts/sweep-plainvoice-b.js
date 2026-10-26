#!/usr/bin/env node
// sweep-plainvoice-b.js — plain cook frame classifier sweep
// (sim-plainvoice-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// DIAG ONLY: zero game changes. Same loadGame-per-seed pattern as
// sweep-racksvoice-b.js, with scripts/plainvoice-capture.js tagging
// every plain cook frame at emit time. No game-code change, no
// default flip (gate B default is the substrate, not set here).
//
// Cells: policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
// SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only), 100d death-aware horizon.
// Env: FEASTSCALE_R13=1 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   CAP=0|1 SEEDS="9750,...,9757" DAYS=100 POLICY=leadfeast
//   SAYCAP=1000 PERSEED_DIR=<dir> SWEEP_CENSUS=1
// Output: plainvoice-b-<cap0|cap1>-pd0-dg1-leadfeast-s<seed>.json
// SWEEP_CENSUS=1 prints PERSEED-CENSUS lines to stdout (flap-proof:
// the long-running sweep never writes files; a short-lived splitter
// persists per-seed JSONs from stdout).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { installPlainvoiceCapture } = require('./plainvoice-capture');

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
  console.error('FATAL: CAP=0|1 must be set explicitly');
  process.exit(2);
}
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = leadfeast;
const SEEDS = (process.env.SEEDS || '9750,9751,9752,9753,9754,9755,9756,9757')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const SAYCAP = parseInt(process.env.SAYCAP || '1000', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26', 'sim-plainvoice-b-corpus');

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
  const { Game } = await loadGame({ seed, mode: 'plainvoice-b-' + POLICY_ID, fullTelemetry: false });
  let cap = null;
  if (CAP === '1') cap = installPlainvoiceCapture(Game, { cap: SAYCAP });
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
  const plainDetail = cap ? cap.plainDetail : null;
  const classCounts = {};
  const byCookClass = {};
  const racksFullDays = new Set();
  if (samples) for (const s of samples) if (s.frame === 'racksFull') racksFullDays.add(s.day);
  if (plainDetail) for (const p of plainDetail) {
    classCounts[p.class] = (classCounts[p.class] || 0) + 1;
    byCookClass[p.cook] = byCookClass[p.cook] || {};
    byCookClass[p.cook][p.class] = (byCookClass[p.cook][p.class] || 0) + 1;
  }
  // Coherence: a P-SILENCED line's day must carry a racks-full
  // complaint line in the same seed (the first complaint that
  // silenced it, earlier the same day).
  let silencedIncoherent = 0;
  if (plainDetail) for (const p of plainDetail) {
    if (p.class === 'P-SILENCED' && !racksFullDays.has(p.day)) silencedIncoherent++;
  }
  const workedCount = samples ? samples.filter(s => s.frame === 'worked').length : null;
  const racksFullCount = samples ? samples.filter(s => s.frame === 'racksFull').length : null;
  const plainCount = samples ? samples.filter(s => s.frame === 'plain').length : null;
  return {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    daysAlive: result.days,
    preserveVillagerBatches: batches, preserveVillagerKcal: Math.round(kcal),
    preserveVillagerResolutions: resolutions,
    deaths: deaths.length, deathCauses, national,
    table: won, win: won, waveReach, rank,
    endReason: result.endReason, cap: CAP === '1' ? 1 : 0, ms,
    sayTotal: samples ? samples.length : null,
    workedLines: workedCount, racksFullLines: racksFullCount, plainLines: plainCount,
    classCounts: samples ? classCounts : null,
    byCookClass: samples ? byCookClass : null,
    racksFullDays: samples ? Array.from(racksFullDays).sort((a, b) => a - b) : null,
    silencedIncoherent: samples ? silencedIncoherent : null,
    plainDetail, saySamples: samples,
    fullSamplesPersisted: !!samples,
  };
}

(async () => {
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `plainvoice-b-cap${CAP}-pd0-dg1-${POLICY_ID}-s${seed}.json`;
    writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
    console.log(`done cap=${CAP} seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} batches=${perSeed.preserveVillagerBatches} res=${perSeed.preserveVillagerResolutions} deaths=${perSeed.deaths} say=${perSeed.sayTotal} worked=${perSeed.workedLines} racksFull=${perSeed.racksFullLines} plain=${perSeed.plainLines} classes=${JSON.stringify(perSeed.classCounts)} (${perSeed.ms}ms)`);
  }
  console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
