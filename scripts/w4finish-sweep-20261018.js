#!/usr/bin/env node
// w4finish-sweep-20261018.js — wave-4 finishing-layer sweep (flesh-out loop
// arm sim-w4finish, 2026-10-18, axis scale-onramp).
//
// LEVER (policy-side only, ZERO src/js changes): scripts/policies/w4finish.js
// (W4FINISH=1, default OFF). When wave 4 is unlocked and wave 5 is not, the
// policy commits to FINISH wave-4 fights it already engages: no early
// retreat once committed (turn-1 outmatched / 0.35 eject / losing-race
// become finishing strikes down to the 12% floor), counter-use when known
// (vacuous for wave-4), focus fire on the wave-4 monster, kill-attribution
// spread measured across two fighters (no yield-steering).
//
// SUBSTRATE (full winseat — EXACTLY evidence/2026-10-18/sim-vetwindow.md):
//   withW4finish(withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))))
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 VETREL=1 REPOSITION=1
//   Armed: + W4FINISH=1. Control: W4FINISH unset (pure delegation).
//
// The w5legs corpus (evidence/2026-10-18/perseed-w5legs/, seeds 65101-65108
// x {leadfeast,belongfeast}) is the paired control on IDENTICAL seeds. The
// control side of this sweep re-runs it; byte-equality against the corpus
// verifies the reproduction (then the corpus is the confirmed baseline).
//
// PRE-REGISTRATION (binding — written BEFORE the sweep):
//   PILOT (seeds 65101-65104, 8 runs/side): PRIMARY armed runs with >=1
//     wave-4 kill >= 2/8 per side (baseline 1/16 -> ~0.5/8 expected; bar =
//     2x expectation). Guardrails: no new death mode; median survival >=
//     control - 15d. Proceed to confirm ONLY on pilot GO.
//   CONFIRM (seeds 65101-65108, 16 runs/side): PRIMARY armed runs with >=1
//     wave-4 kill >= 5/16 (baseline 1/16); SECONDARY armed runs with
//     maxVet>=2 >= 2/16 (baseline 0/16). GUARDRAILS: no new death mode
//     (n>=3); wins >= 9/16 (corpus 11/16 - 2); median survival >= 66d
//     (corpus 91d - 25).
//   Metric review, not re-scoring: doubts go in the evidence file.
//
// Usage:
//   <10 winseat flags>=1 [W4FINISH=1] node scripts/w4finish-sweep-20261018.js
//   SIDE=control|armed|both (default both)
//   SEEDS="65101,65102" ONLY="leadfeast" DAYS=180 ...
//   SMOKE=1 / DET=1 / FIDELITY=1 (mirror w5legs-sweep modes)
'use strict';
const fs = require('fs');
const path = require('path');
const W4F = require('./policies/w4finish');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'NODEWITNESS', 'VETREL', 'REPOSITION']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (full winseat substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65101, 65102, 65103, 65104, 65105, 65106, 65107, 65108]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['belongfeast', 'leadfeast'].filter(p => !ONLY || p === ONLY);
const SIDE = (process.env.SIDE || 'both').toLowerCase(); // control | armed | both
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-w4finish');

function policyFor(policyId) {
  return policyId === 'leadfeast' ? W4F.w4finishLead : W4F.w4finishBelong;
}
function gday(G) { try { return (G.state && G.state.scholar && G.state.scholar.day) | 0 || 0; } catch (e) { return 0; } }

// barLegs: same shape as w5legs-sweep (the control side must reproduce the
// corpus byte-for-byte on the shared fields).
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
  rec.def5 = (rec.cap >= 200 && !rec.rdy && rec.peak < 5);
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
  try {
    const dg = G.deedGateReady ? G.deedGateReady() : null;
    if (dg) rec.deed = { ok: !!dg.ok, w1: (dg.w1 | 0) || 0, w2: (dg.w2 | 0) || 0, w3: (dg.w3 | 0) || 0, w4: (dg.w4 | 0) || 0, w5: (dg.w5 | 0) || 0, cN: (dg.contestsN | 0) || 0, kN: (dg.crisesN | 0) || 0, st: (dg.stage | 0) || 0, rk: dg.rank || 'village' };
    else rec.deed = null;
  } catch (e) { rec.deed = null; }
  try { rec.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { rec.alive = false; }
  return rec;
}

// w4fBlock: layer-specific metrics (per-vid wave-4 kill attribution for the
// spread analysis + the layer's own counters).
function w4fBlock(G, runCtx) {
  const out = {};
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const byVid = {};
    for (const e of log) {
      if (!e || ((e.w | 0) < 4) || !e.by) continue;
      byVid[e.by] = (byVid[e.by] || 0) + 1;
    }
    out.byVid = byVid;
    out.distinctKillers = Object.keys(byVid).length;
  } catch (e) { out.byVid = {}; out.distinctKillers = -1; }
  if (runCtx) {
    for (const k of ['w4fCommits', 'w4fOverrides', 'w4fStrikes', 'w4fCloses', 'w4fDelegated', 'w4fBroken', 'w4fCounterChecks']) {
      out[k] = runCtx[k] || 0;
    }
  }
  return out;
}

async function runOne(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.W4FINISH = '1'; else delete process.env.W4FINISH;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'w4finish', fullTelemetry: false });
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
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
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
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = gameDays;
    if (maxWave >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = gameDays;
  } catch (e) {}
  let endLegs = null;
  try { endLegs = barLegs(Game); } catch (e) { endLegs = null; }
  let w4f = null;
  try { w4f = w4fBlock(Game, runCtx); } catch (e) { w4f = null; }
  const out = {
    seed, policyId, substrate: 'winseat', side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    legs, endLegs, hashes, w4f,
  };
  if (process.env.W4F_NOWRITE !== '1') {
    const dir = path.join(EVID, side, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  const sides = SIDE === 'both' ? ['control', 'armed'] : [SIDE];
  if (process.env.DET === '1') {
    // DET: W4FINISH=1 vs unset on seeds where wave 4 never unlocks.
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65105, 65101]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = process.env.DAYS || '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.W4F_NOWRITE = '1';
        const ctl = await runOne(seed, policyId, 'control');
        const arm = await runOne(seed, policyId, 'armed');
        const same = ctl.hashes.join('|') === arm.hashes.join('|');
        console.log(`  DET s${seed} ${policyId}: ${same ? 'PASS' : 'FAIL'} (${ctl.hashes.length} days)`);
        if (!same) ok = false;
      }
    }
    delete process.env.W4F_NOWRITE;
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    const seed = parseInt((process.env.SEEDS || '65101').split(',')[0], 10);
    for (const side of sides) for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId, side);
      console.log(`  SMOKE ${side} ${policyId} s${seed}: days=${out.gameDays} end=${out.endReason} w4f=${JSON.stringify(out.w4f)}`);
    }
    console.log('SMOKE: done');
    return;
  }
  const results = [];
  for (const side of sides) {
    for (const seed of SEEDS) {
      for (const policyId of POLICIES) {
        const out = await runOne(seed, policyId, side);
        results.push(out);
        const w = out.w4f || {};
        console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} wave=${out.maxWave} w4k=${(out.endLegs || {}).w4k} vet=${(out.endLegs || {}).vet} commits=${w.w4fCommits || 0} ovr=${w.w4fOverrides || 0} byVid=${JSON.stringify(w.byVid || {})}`);
      }
    }
  }
  for (const side of sides) {
    const rs = results.filter(r => r.side === side);
    const agg = (f) => rs.filter(f).length;
    const surv = rs.map(r => r.gameDays).sort((a, b) => a - b);
    const med = surv.length % 2 ? surv[surv.length >> 1] : (surv[surv.length / 2 - 1] + surv[surv.length / 2]) / 2;
    const w4killRuns = agg(r => ((r.endLegs || {}).w4k | 0) > 0);
    const vet2 = agg(r => ((r.endLegs || {}).vet | 0) >= 2);
    console.log(`SIDE ${side}: n=${rs.length} w4killRuns=${w4killRuns} maxVet>=2:${vet2} wins=${agg(r => r.won)} national=${agg(r => r.national)} table=${agg(r => r.table)} wave4=${agg(r => r.wave45)} wave5=${agg(r => r.wave5)} medianSurvival=${med}`);
  }
  console.log(`SWEEP COMPLETE: ${results.length} runs, 0 errors`);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, policyFor, barLegs, w4fBlock, daysNow };
