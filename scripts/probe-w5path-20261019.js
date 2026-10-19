#!/usr/bin/env node
// probe-w5path-20261019.js — wave-5 unlock-PATH census instrument
// (flesh-out loop arm sim-w5census, run fleshout-20261019T0215Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. The instrument wraps the policy daily with PURE engine reads
// (no state writes, no RNG draws) — the DET gate pins instrument-on vs
// instrument-off byte-identical trajectories.
//
// WHERE THIS SITS: sim-w5legs (2026-10-18) measured the wave-5 DOOR's five
// legs on the full winseat substrate (veterans bind 16/16, kill-drought
// shape); sim-w5preseat measured the same door on the pre-seat substrate
// (veterans bind 16/16, killer-mortality shape). This census measures the
// PATH to the door on the pre-seat + windefer substrate: per run, standing
// points by source (war/diplomacy/plenty), wave-4 ledger points earned,
// wave-5 unlock attempts (deferral(5) windows) and their outcomes,
// readiness-bar state at stall points, and a STALL-POINT classification of
// 100% of runs: never-progressed / progressed-but-stalled /
// engaged-but-failed / unlocked.
//
// SUBSTRATE (the brief's EXACT stack — winseat policy set, SEATDRIVE=0):
//   withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
//   (VETREL/REPOSITION unset -> those layers inert by their own gates;
//   SEATDRIVE=0 -> seatdrive pure delegation (proven byte-identical in
//   scripts/policies/seatdrive.js). Effective behavior: windefer-active
//   tribfloor on pre-seat — the windefer layer drives the table modal,
//   which never exists pre-seat, so it delegates.)
//
// STALL-POINT DEFINITIONS (pre-registered, door-centered — the w5 door is
// standingDeferral(5); the classes form a strict path ladder, mutually
// exclusive and exhaustive by construction):
//   unlocked             — peak >= 5 observed (the w5 door opened).
//   engaged-but-failed   — deferral(5) true >= 1 day (the village stood at
//                          the door) but the door never opened.
//   progressed-but-stalled — wave-4 unlocked (peak >= 4) but deferral(5)
//                          never true (the door never approached).
//   never-progressed     — peak < 4 all run (the w5 path never opened).
// A wave-5 unlock ATTEMPT is a maximal contiguous deferral(5)-true window;
// its outcome is released | died | won | horizon | regressed.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   node scripts/probe-w5path-20261019.js
//   SMOKE=1 ...        # short smoke: both policies drive, path records live
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="63701,63702" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — the brief's exact env. SEATDRIVE must be '0' (not '1',
// not unset): the seat driver must be provably off on this pre-seat arm.
// VETREL/REPOSITION must NOT be '1' (those layers stay inert).
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (w5path substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat — this is the w5path arm, not the winseat).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must NOT be 1 (pre-seat substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() true despite SEATDRIVE=0.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [63701, 63702, 63703, 63704, 63705, 63706, 63707, 63708, 63709, 63710, 63711, 63712, 63713, 63714, 63715, 63716]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-w5path');
const isBare = () => process.env.W5PATH_BARE === '1';

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition — the winseat policy set, EXACTLY as
// evidence/2026-10-18/sim-vetwindow.md. SEATDRIVE=0 makes the seatdrive
// wrapper pure delegation; VETREL/REPOSITION unset keeps those inert.
function policyFor(policyId) {
  const base = baseFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION unset: inert)`);
  const vet = VR.withVetrel(rp, `${tag}-vetrel-rp`, `${policyId} + reposition + VETREL unset (inert)`);
  const wd = WD.withWinDefer(vet, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=0: pure delegation)`);
}

function gday(G) { try { return (G.state && G.state.scholar && G.state.scholar.day) | 0 || 0; } catch (e) { return 0; } }

// pathRec(G): the FULL wave-5 unlock-path vector from the engine's own
// reads. PURE: no state writes, no RNG — safe to call daily. (unlockedWave
// -> villageStandingTotal can fire the idempotent hold/release beats, but
// the game calls it during play anyway; the DET gate proves the extra call
// is trajectory-neutral, as in sim-w5legs.)
function pathRec(G) {
  const day = gday(G);
  const rec = { d: day };
  try { rec.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { rec.uw = 1; }
  try { rec.peak = (G._standingPeakWave ? G._standingPeakWave() : 0) | 0; } catch (e) { rec.peak = 0; }
  // Standing by source — the three earn channels (war/diplomacy/plenty).
  try {
    const vs = G.villageStanding ? G.villageStanding() : {};
    rec.raw = (vs.total | 0) || 0;
    rec.war = (vs.war | 0) || 0; rec.dip = (vs.diplomacy | 0) || 0; rec.plenty = (vs.plenty | 0) || 0;
    rec.warPts = (vs.warPts | 0) || 0; rec.links = (vs.links | 0) || 0; rec.feasts = (vs.feasts | 0) || 0;
  } catch (e) { rec.raw = -1; rec.war = -1; rec.dip = -1; rec.plenty = -1; rec.warPts = -1; rec.links = -1; rec.feasts = -1; }
  try { rec.cap = G.standingPlentyCappedTotal ? (G.standingPlentyCappedTotal() | 0) : -1; } catch (e) { rec.cap = -1; }
  // Wave ledger points — the "wave-4 points earned (ledger)" trace.
  try {
    rec.l3 = G.waveLedgerPoints ? (G.waveLedgerPoints(3) | 0) : -1;
    rec.l4 = G.waveLedgerPoints ? (G.waveLedgerPoints(4) | 0) : -1;
    rec.l5 = G.waveLedgerPoints ? (G.waveLedgerPoints(5) | 0) : -1;
  } catch (e) { rec.l3 = -1; rec.l4 = -1; rec.l5 = -1; }
  // Readiness bars (w5 door + w4 path).
  const readBars = (w) => {
    try {
      const r = G.waveUnlockReady ? G.waveUnlockReady(w) : null;
      if (!r) return { arm: -1, wpn: -1, trk: -1, vet: -1, short: ['no-read'], rdy: false };
      return { arm: r.armored | 0, wpn: r.armed | 0, trk: r.tricks | 0, vet: r.veterans | 0, short: Array.isArray(r.short) ? r.short.slice() : [], rdy: !!r.ready };
    } catch (e) { return { arm: -1, wpn: -1, trk: -1, vet: -1, short: ['read-error'], rdy: false }; }
  };
  rec.r5 = readBars(5);
  rec.r4 = readBars(4);
  // The w5 door state — deferral(5) is the engine's own "at the door".
  try {
    const df = G.standingDeferral ? G.standingDeferral(5) : null;
    rec.def5 = !!(df && df.deferred);
    rec.gf5 = !!(df && df.grandfathered);
  } catch (e) { rec.def5 = false; rec.gf5 = false; }
  // Wave-4 kill anatomy from the same waveKillLog the gate reads, with the
  // engine's own via tags (player/villager/companion/unknown).
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const mids = new Set(), killers = new Set();
    const via = { player: 0, villager: 0, companion: 0, unknown: 0, other: 0 };
    let kills = 0;
    for (const e of log) {
      if (!e || ((e.w | 0) < 4)) continue;
      kills++;
      if (e.mid) mids.add(e.mid);
      if (e.by) killers.add(e.by);
      const v = String(e.via || 'unknown');
      if (Object.prototype.hasOwnProperty.call(via, v)) via[v]++; else via.other++;
    }
    rec.w4k = kills; rec.w4d = mids.size; rec.w4killers = killers.size; rec.w4via = via;
  } catch (e) { rec.w4k = -1; rec.w4d = -1; rec.w4killers = -1; rec.w4via = null; }
  // Deed-gate state (the full-seat gate downstream of this door).
  try {
    const dg = G.deedGateReady ? G.deedGateReady() : null;
    if (dg) rec.deed = { ok: !!dg.ok, w1: (dg.w1 | 0) || 0, w2: (dg.w2 | 0) || 0, w3: (dg.w3 | 0) || 0, w4: (dg.w4 | 0) || 0, w5: (dg.w5 | 0) || 0 };
    else rec.deed = null;
  } catch (e) { rec.deed = null; }
  try { rec.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { rec.alive = false; }
  try { rec.won = !!G.won; } catch (e) { rec.won = false; }
  return rec;
}

async function runOne(seed, policyId) {
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'w5path', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const recs = [];
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
      // The instrument's own reads come AFTER the base daily — the path
      // reflects post-daily state, deterministic for a given seed.
      if (!bare) {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
        if ((G.state.scholar || {}).exiled) hist.exiled = true;
        const rec = pathRec(G);
        recs.push(rec);
        const uw = rec.uw;
        if (uw > waveTrace.maxWave) waveTrace.maxWave = uw;
        const day = rec.d;
        if (uw >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = day;
        if (uw >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = day;
      }
      // Hashes ALWAYS recorded (bare and live) — the vetwindow lesson: a
      // hash inside the census block voids the bare-vs-live comparison.
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
  // A final-day unlock is never daily-sampled — the run-end read catches it.
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = gameDays;
    if (maxWave >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = gameDays;
  } catch (e) {}
  // Final-day path vector at run end (the terminal state the analyzer
  // attributes against) — recorded even in bare mode for the DET compare.
  let endRec = null;
  try { endRec = pathRec(Game); } catch (e) { endRec = null; }
  const out = {
    seed, policyId, substrate: 'w5path-preseat-windefer',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    recs, endRec, hashes,
  };
  if (process.env.W5PATH_NOWRITE !== '1') {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    // DET gate: instrument-on vs instrument-off byte-identical trajectories.
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63701, 63702]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.W5PATH_BARE = '1'; process.env.W5PATH_NOWRITE = '1';
        const bare = await runOne(seed, policyId);
        delete process.env.W5PATH_BARE;
        const live = await runOne(seed, policyId);
        const hb = bare.hashes.join('|'), hl = live.hashes.join('|');
        const pass = hb === hl;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (${bare.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    delete process.env.W5PATH_NOWRITE;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.FIDELITY === '1') {
    // FIDELITY: re-run 2 completed sweep seeds, byte-identical per-seed JSON.
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63701, 63702]).filter(Number.isFinite);
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
    process.env.SEEDS = process.env.SEEDS || '63701';
    const seeds = [parseInt(process.env.SEEDS.split(',')[0], 10)];
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId);
      const last = out.recs[out.recs.length - 1];
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} recs=${out.recs.length} last=${JSON.stringify(last && { d: last.d, uw: last.uw, raw: last.raw, cap: last.cap, def5: last.def5, l4: last.l4, w4k: last.w4k, short: last.r5.short })}`);
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
      const el = out.endRec || {};
      const r5 = (el.r5) || {};
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4Day} w5=${out.wave5} w5d=${out.wave5Day} table=${out.table} recs=${out.recs.length} raw=${el.raw} cap=${el.cap} def5=${el.def5} l4=${el.l4} w4k=${el.w4k} r5short=${(r5.short || []).join(',')}`);
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
module.exports = { runOne, policyFor, pathRec, daysNow };
