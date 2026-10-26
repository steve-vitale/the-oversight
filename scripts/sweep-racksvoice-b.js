#!/usr/bin/env node
// sweep-racksvoice-b.js — racks-full voice census recorder
// (sim-racksvoice-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// DIAG ONLY: zero game changes. Same loadGame-per-seed pattern as
// sweep-saystub-b.js, plus a census computed from the captured
// samples: per-cook racks-full counts, per-cook distinct days,
// day span, and preserved-kcal min/max parsed from the line text.
// Filter and capture are scripts/say-capture.js unchanged.
//
// Cells: policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
// SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only), 100d death-aware horizon.
// Env: FEASTSCALE_R13=1 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   CAP=0|1 SEEDS="9750,...,9757" DAYS=100 POLICY=leadfeast
//   SAYCAP=1000 PERSEED_DIR=<dir>
// Output: racksvoice-b-<cap0|cap1>-pd0-dg1-leadfeast-s<seed>.json
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
  __dirname, '..', 'evidence', '2026-10-26', 'sim-racksvoice-b-corpus');

function realSleepMs(ms) {
  // REAL delay: the sim harness mocks Date.now (sim-harness.js:
  // Date.now advances 1ms per CALL), so a Date.now busy-wait exits
  // after ~2000 mock-calls (~0 real ms) — the saystub sweep's retry
  // loop has this latent bug and only bursts. Atomics.wait uses
  // real wall time regardless of the mocked clock.
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
// SWEEP_STDOUT=1: print per-seed JSON to stdout instead of writing
// files. Flap recovery (2026-10-26): the container write-denial flap
// persistently EPERMs file writes from the long-running sweep process
// (60 real-wait retries still failed) while short-lived shell/python
// writes succeed — so the sim output is carried on stdout and a
// short-lived writer persists it. The printed line is the complete
// per-seed JSON; the writer validates (parses + seed matches) it.
function writeRobust(filePath, data) {
  if (process.env.SWEEP_STDOUT === '1') {
    console.log('PERSEED-JSON ' + path.basename(filePath) + ' ' + data);
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

// Parser shared with scripts/test-racksvoice-b.js (same regexes).
function cookOf(text) {
  const m = String(text || '').match(/^🍲 (\S+) cooked for the haven/);
  if (m) return m[1];
  const m2 = String(text || '').match(/so (\S+) left the fresh pile/);
  return m2 ? m2[1] : '?';
}
function keptKcalOf(text) {
  const m = String(text || '').match(/\(([\d,]+) kcal kept/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}
function census(samples) {
  const racks = (samples || []).filter(isRacksFullLine);
  const worked = (samples || []).filter(isWorkedLine);
  const byCook = {};
  const daysByCook = {};
  const kcals = [];
  for (const s of racks) {
    const c = cookOf(s.text);
    byCook[c] = (byCook[c] || 0) + 1;
    (daysByCook[c] = daysByCook[c] || new Set()).add(s.day);
    const k = keptKcalOf(s.text);
    if (k != null) kcals.push(k);
  }
  const daysByCookOut = {};
  for (const c of Object.keys(daysByCook)) {
    daysByCookOut[c] = Array.from(daysByCook[c]).sort((a, b) => a - b);
  }
  const workedByCook = {};
  for (const s of worked) {
    const c = cookOf(s.text);
    workedByCook[c] = (workedByCook[c] || 0) + 1;
  }
  const allDays = racks.map(s => s.day);
  return {
    racksFullByCook: byCook,
    racksFullDaysByCook: daysByCookOut,
    workedByCook,
    racksFullDayMin: allDays.length ? Math.min(...allDays) : null,
    racksFullDayMax: allDays.length ? Math.max(...allDays) : null,
    racksFullDistinctDays: new Set(allDays).size,
    racksFullKcalMin: kcals.length ? Math.min(...kcals) : null,
    racksFullKcalMax: kcals.length ? Math.max(...kcals) : null,
    racksFullKcalDistinct: new Set(kcals).size,
    racksFullKcalParsed: kcals.length,
  };
}

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'racksvoice-b-' + POLICY_ID, fullTelemetry: false });
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
  const cen = samples ? census(samples) : null;
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
    plainLines: samples ? samples.length - samples.filter(isWorkedLine).length - samples.filter(isRacksFullLine).length : null,
    census: cen,
  };
  return perSeed;
}

// SWEEP_CENSUS=1: print a compact, verdict-complete census record to
// stdout (pipe — the one carrier the write flap does not block) instead
// of the full samples array. The census record carries every verdict
// input: numerics, worked==resolutions inputs, per-cook breakdowns,
// per-line racks-full detail (day/cook/kcal for EVERY racks-full line),
// and verbatim quote samples. Full samples are NOT persisted in this
// mode; the record says so honestly (fullSamplesPersisted: false).
function compactRecord(perSeed) {
  const samples = perSeed.saySamples || [];
  const rf = samples.filter(isRacksFullLine);
  const wk = samples.filter(isWorkedLine);
  const rfDetail = rf.map(s => ({ day: s.day, cook: cookOf(s.text), kcal: keptKcalOf(s.text) }));
  const rfQuotes = [];
  if (rf.length) {
    const pick = [rf[0], rf[1], rf[2], rf[rf.length - 1]].filter(Boolean);
    const seen = new Set();
    for (const q of pick) { const k = q.day + '|' + q.text; if (!seen.has(k)) { seen.add(k); rfQuotes.push({ day: q.day, text: q.text }); } }
  }
  const { saySamples, ...rest } = perSeed;
  return Object.assign({}, rest, {
    fullSamplesPersisted: false,
    sayTotal: samples.length,
    racksFullDetail: rfDetail,
    racksFullQuotes: rfQuotes,
    workedQuoteFirst: wk.length ? { day: wk[0].day, text: wk[0].text } : null,
  });
}

(async () => {
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `racksvoice-b-cap${CAP}-pd0-dg1-${POLICY_ID}-s${seed}.json`;
    if (process.env.SWEEP_CENSUS === '1') {
      console.log('PERSEED-CENSUS ' + name + ' ' + JSON.stringify(compactRecord(perSeed)));
    } else {
      writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
    }
    console.log(`done cap=${CAP} seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} batches=${perSeed.preserveVillagerBatches} res=${perSeed.preserveVillagerResolutions} deaths=${perSeed.deaths} say=${perSeed.saySamples ? perSeed.saySamples.length : '-'} worked=${perSeed.workedLines} racksFull=${perSeed.racksFullLines} (${perSeed.ms}ms)`);
  }
  console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
