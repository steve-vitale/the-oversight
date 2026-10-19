#!/usr/bin/env node
// w5preseat-sweep-20261018.js — wave-5 door bar-leg instrument, PRE-SEAT
// substrate (flesh-out loop arm sim-w5preseat, 2026-10-18, axis
// scale-onramp).
//
// DIAGNOSTIC, policy-side instrument. ZERO src/js changes, ZERO
// scripts/policies changes. Re-points the sim-w5legs instrument at the
// PRE-SEAT substrate: policy tribfloor leadfeast/belongfeast (TF base
// ONLY — NO vetstaff, NO vetblood, NO vetrel), env FEASTSCALE_R13=1
// TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1,
// SEATDRIVE=0, NODEWITNESS=1.
//
// The door (src/js/standing.js, design call #4 2026-10-16): capped
// Standing >= t5(200) AND waveUnlockReady(5) — { armored 4 @ P>=15,
// armed 6, tricks 3, veterans 2 (living, wave-4+ kills in
// state.waveKillLog) } — AND peak<5 (monotonic ratchet). Bread counts at
// most plentyCapT5=100 toward t5.
//
// All daily reads are engine-pure: waveUnlockReady / waveCombatReadiness /
// villageStanding / standingDeferral / deedGateReady / monsterCounterKnown
// write no state (verified in src/js/standing.js, src/js/progression.js,
// src/js/waveLedger.js). The DET gate pins instrument-on vs
// instrument-off byte-identical trajectories.
//
// Usage (pre-seat substrate ONLY — SEATDRIVE must NOT be 1):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//     node scripts/w5preseat-sweep-20261018.js
//   SMOKE=1 ...        # short smoke: both policies drive, legs recorded, shape dump
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   SEEDS="66101,66102" ONLY="leadfeast" ...
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// PRE-SEAT substrate: the seven required, and SEATDRIVE must NOT be 1.
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pre-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate — this is the pre-seat arm, not the winseat).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [66101, 66102, 66103, 66104, 66105, 66106, 66107, 66108]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['belongfeast', 'leadfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-w5preseat');
const isBare = () => process.env.W5PRESEAT_BARE === '1';

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition — PRE-SEAT: TF base ONLY (no vetstaff, no vetblood,
// no vetrel, no reposition, no windefer wrapper, no seatdrive wrapper).
function policyFor(policyId) {
  return baseFor(policyId);
}

function gday(G) { try { return (G.state && G.state.scholar && G.state.scholar.day) | 0 || 0; } catch (e) { return 0; } }

// barLegs(G): the FULL wave-5 door leg vector from the engine's own reads.
// PURE: no state writes, no RNG — safe to call daily. Identical logic to
// w5legs (the attribution schema is shared by design).
function barLegs(G) {
  const day = gday(G);
  const rec = { d: day };
  try { rec.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { rec.uw = 1; }
  try {
    const vs = G.villageStanding ? G.villageStanding() : {};
    rec.raw = (vs.total | 0) || 0;
    rec.war = (vs.war | 0) || 0; rec.dip = (vs.diplomacy | 0) || 0; rec.plenty = (vs.plenty | 0) || 0;
  } catch (e) { rec.raw = -1; rec.war = -1; rec.dip = -1; rec.plenty = -1; }
  try { rec.cap = G.standingPlentyCappedTotal ? (G.standingPlentyCappedTotal() | 0) : -1; } catch (e) { rec.cap = -1; }
  try { rec.peak = G._standingPeakWave ? (G._standingPeakWave() | 0) : 0; } catch (e) { rec.peak = 0; }
  try {
    const r5 = G.waveUnlockReady ? G.waveUnlockReady(5) : null;
    if (r5) {
      rec.arm = r5.armored | 0; rec.wpn = r5.armed | 0; rec.trk = r5.tricks | 0; rec.vet = r5.veterans | 0;
      const dem = r5.demand || {};
      rec.dem = { arm: (dem.armored | 0) || 0, armP: (dem.armorP | 0) || 0, wpn: (dem.armed | 0) || 0, trk: (dem.tricks | 0) || 0, vet: (dem.veterans | 0) || 0 };
      rec.short = Array.isArray(r5.short) ? r5.short.slice() : [];
      rec.rdy = !!r5.ready;
    } else { rec.arm = -1; rec.wpn = -1; rec.trk = -1; rec.vet = -1; rec.short = ['no-read']; rec.rdy = false; rec.dem = null; }
  } catch (e) { rec.arm = -1; rec.wpn = -1; rec.trk = -1; rec.vet = -1; rec.short = ['read-error']; rec.rdy = false; rec.dem = null; }
  // door in play: wave-4 open, village alive, run not won — computed from
  // cheap fields; the analyzer derives "deferred" from cap/short/peak.
  rec.def5 = (rec.cap >= 200 && !rec.rdy && rec.peak < 5);
  // wave-4 kill anatomy from the same waveKillLog the gate reads.
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const mids = new Set(), killers = new Set();
    let kills = 0;
    for (const e of log) {
      if (!e || ((e.w | 0) < 4)) continue;
      kills++;
      if (e.mid) mids.add(e.mid);
      if (e.by) killers.add(e.by);
    }
    rec.w4k = kills; rec.w4d = mids.size; rec.w4killers = killers.size;
  } catch (e) { rec.w4k = -1; rec.w4d = -1; rec.w4killers = -1; }
  // deed-gate state (the full-seat gate downstream of this door) — pure read.
  try {
    const dg = G.deedGateReady ? G.deedGateReady() : null;
    if (dg) rec.deed = { ok: !!dg.ok, w1: (dg.w1 | 0) || 0, w2: (dg.w2 | 0) || 0, w3: (dg.w3 | 0) || 0, w4: (dg.w4 | 0) || 0, w5: (dg.w5 | 0) || 0, cN: (dg.contestsN | 0) || 0, kN: (dg.crisesN | 0) || 0, st: (dg.stage | 0) || 0, rk: dg.rank || 'village' };
    else rec.deed = null;
  } catch (e) { rec.deed = null; }
  try { rec.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { rec.alive = false; }
  return rec;
}

async function runOne(seed, policyId) {
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `w5preseat`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const legs = [];
  const hashes = [];
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const waveTrace = { maxWave: 1, wave4Day: null, wave5Day: null };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  const bare = isBare();
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      // The instrument's own reads come AFTER the base daily — the legs
      // reflect post-daily state, deterministic for a given seed.
      if (!bare) {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
        if ((G.state.scholar || {}).exiled) hist.exiled = true;
        const rec = barLegs(G);
        legs.push(rec);
        const uw = rec.uw;
        if (uw > waveTrace.maxWave) waveTrace.maxWave = uw;
        const day = rec.d;
        if (uw >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = day;
        if (uw >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = day;
      }
      hashes.push(G.state.scholar.day + ':' + dayHash(Game));
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let maxWave = Math.max(result.maxWaveUnlocked || 1, waveTrace.maxWave);
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  // final-day unlock edge: a final-day unlock is never daily-sampled — the
  // run-end read catches it and records gameDays as the unlock day.
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = gameDays;
    if (maxWave >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = gameDays;
  } catch (e) {}
  // Final-day leg vector at run end (the terminal state the analyzer
  // attributes against) — recorded even in bare mode for the DET compare.
  let endLegs = null;
  try { endLegs = barLegs(Game); } catch (e) { endLegs = null; }
  const out = {
    seed, policyId, substrate: 'preseat',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    legs, endLegs, hashes,
  };
  if (process.env.W5PRESEAT_NOWRITE !== '1') {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    // DET gate: instrument-on vs instrument-off byte-identical trajectories.
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66101, 66102]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.W5PRESEAT_BARE = '1'; process.env.W5PRESEAT_NOWRITE = '1';
        const bare = await runOne(seed, policyId);
        delete process.env.W5PRESEAT_BARE;
        const live = await runOne(seed, policyId);
        const hb = bare.hashes.join('|'), hl = live.hashes.join('|');
        const pass = hb === hl;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (${bare.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    delete process.env.W5PRESEAT_NOWRITE;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.FIDELITY === '1') {
    // FIDELITY: re-run 2 completed sweep seeds, byte-identical per-seed JSON.
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66101, 66102]).filter(Number.isFinite);
    let ok = true;
    for (const seed of fseeds) {
      for (const policyId of POLICIES) {
        const p = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(p)) { console.log(`  FIDELITY s${seed} ${policyId}: SKIP (no per-seed file)`); continue; }
        const before = fs.readFileSync(p, 'utf8');
        await runOne(seed, policyId);
        const after = fs.readFileSync(p, 'utf8');
        const pass = before === after;
        console.log(`  FIDELITY s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'}`);
        if (!pass) ok = false;
      }
    }
    console.log(ok ? 'FIDELITY: ALL PASS' : 'FIDELITY: FAILURES');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    process.env.SEEDS = process.env.SEEDS || '66101';
    const seeds = [parseInt(process.env.SEEDS.split(',')[0], 10)];
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId);
      const last = out.legs[out.legs.length - 1];
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} legs=${out.legs.length} last=${JSON.stringify(last && { d: last.d, uw: last.uw, cap: last.cap, arm: last.arm, wpn: last.wpn, trk: last.trk, vet: last.vet, short: last.short })}`);
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep.
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      results.push(out);
      const el = out.endLegs || {};
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4Day} w5=${out.wave5} w5d=${out.wave5Day} table=${out.table} legs=${out.legs.length} cap=${el.cap} arm=${el.arm}/${el.dem && el.dem.arm} wpn=${el.wpn}/${el.dem && el.dem.wpn} trk=${el.trk}/${el.dem && el.dem.trk} vet=${el.vet}/${el.dem && el.dem.vet} short=${(el.short || []).join(',')}`);
    }
  }
  const n = results.length;
  const agg = (f) => results.filter(f).length;
  console.log(`SWEEP COMPLETE: ${n}/${SEEDS.length * POLICIES.length} runs, 0 errors`);
  console.log(`  national=${agg(r => r.national)} table=${agg(r => r.table)} wins=${agg(r => r.won)} wave4=${agg(r => r.wave45)} wave5=${agg(r => r.wave5)} exiled=${agg(r => r.exiled)}`);
  const w5 = results.filter(r => r.wave5);
  console.log(`  wave5Days: ${w5.map(r => `${r.policyId}-s${r.seed}=d${r.wave5Day}`).join(' ')}`);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, policyFor, barLegs, daysNow };
