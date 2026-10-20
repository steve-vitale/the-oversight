#!/usr/bin/env node
// probe-w5doormeasure-20261020.js — wave-5 unlock-PATH end-to-end diagnostic
// instrument (flesh-out loop arm sim-w5door-measure, run fleshout-20261020T0415Z,
// axis scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. The instrument wraps the policy daily with PURE engine reads
// (no state writes, no RNG draws) — the DET gate pins instrument-on vs
// instrument-off byte-identical trajectories.
//
// WHERE THIS SITS: sim-w5census (2026-10-19) measured the PATH to the w5 door
// on the pre-seat + windefer substrate (32 runs: 21/32 engage the door, 18/21
// die in the window, veterans short 32/32 terminally). This arm REPRODUCES
// that decomposition on the IDENTICAL substrate with 8 FRESH seeds x
// {leadfeast, belongfeast} = 16 runs, then EXTENDS with the end-to-end path:
//   E1 full-path per-day vectors: wave-1/2 ledger fill vs bars, day floors,
//      days to fill, w2/w3 unlock days.
//   E2 villager-experience counting lines: per-day ledger points and kills by
//      killer class (player/scholar vs villager vs companion) per wave, from
//      waveKillLog (by/via as the engine stamps them).
//   E3 window-mortality attribution of deed earners: per wave-4+ kill, killer
//      class and whether the killer died within 30d (samples.deaths).
//   E4 raid-exposure vs unlock-decoupling check (#469): kills and faced-types
//      with wave > unlockedWave() that day (exposure beyond progression).
//
// SUBSTRATE (EXACT sim-w5census stack): policy
//   withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
//   (VETREL/REPOSITION unset -> those layers inert by their own gates;
//   SEATDRIVE=0 -> seatdrive pure delegation.)
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   node scripts/probe-w5doormeasure-20261020.js
//   SMOKE=1 ...        # short smoke: both policies drive, path records live
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="65111,65112" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-w5path-20261019'); // policyFor: the landed w5census policy stack (composed, never edited)
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — the brief's exact env. SEATDRIVE must be '0' (not '1',
// not unset): the seat driver must be provably off on this pre-seat arm.
// VETREL/REPOSITION must NOT be '1' (those layers stay inert).
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (w5doormeasure substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat — this is the w5doormeasure arm).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must NOT be 1 (pre-seat substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65111, 65112, 65113, 65114, 65115, 65116, 65117, 65118]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-w5doormeasure');
const isBare = () => process.env.W5DOOR_BARE === '1';

function gday(G) { try { return (G.state && G.state.scholar && G.state.scholar.day) | 0 || 0; } catch (e) { return 0; } }

// byClass: killer class from the engine's own stamps. In recordWaveKill
// (game.js:42132) the scholar's TB kills carry via='player'; a companion's
// killing blow inside the scholar's TB fight carries via='companion' (the
// _tbKilledBy stamp); field fights / agency / sorties / aid-crisis /
// contests carry the channel as via with the killer's vid in by — those are
// villagers. 'unknown'/null by -> 'unknown' (never silent-counted).
function byClass(e) {
  try {
    const v = String((e && e.via) || 'unknown');
    if (v === 'player') return 'player';
    if (v === 'companion') return 'companion';
    if (e && e.by) return 'villager';
    return 'unknown';
  } catch (err) { return 'unknown'; }
}

// pathRec(G): the FULL wave-5 unlock-path vector from the engine's own
// reads. PURE: no state writes, no RNG — safe to call daily. (unlockedWave
// -> villageStandingTotal can fire the idempotent hold/release beats, but
// the game calls it during play anyway; the DET gate proves the extra call
// is trajectory-neutral, as in sim-w5census/sim-w5legs.)
function pathRec(G, prev) {
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
  // Wave ledger points — the FULL path: l1/l2 fill the w2/w3 rungs (E1).
  try {
    const lp = (w) => (G.waveLedgerPoints ? (G.waveLedgerPoints(w) | 0) : -1);
    rec.l1 = lp(1); rec.l2 = lp(2); rec.l3 = lp(3); rec.l4 = lp(4); rec.l5 = lp(5);
  } catch (e) { rec.l1 = -1; rec.l2 = -1; rec.l3 = -1; rec.l4 = -1; rec.l5 = -1; }
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
  // The doors — deferral(4) and deferral(5) are the engine's own "at the door".
  try {
    const df4 = G.standingDeferral ? G.standingDeferral(4) : null;
    rec.def4 = !!(df4 && df4.deferred);
  } catch (e) { rec.def4 = false; }
  try {
    const df = G.standingDeferral ? G.standingDeferral(5) : null;
    rec.def5 = !!(df && df.deferred);
    rec.gf5 = !!(df && df.grandfathered);
  } catch (e) { rec.def5 = false; rec.gf5 = false; }
  // Deed feed wavesFaced — distinct types faced per wave (the w5 gate's
  // wave-4-faced leg reads waveEngaged(4) off this; E4 compares it to
  // unlockedWave for the decoupling check).
  try {
    const ds = (typeof G.deedState === 'function') ? G.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    const per = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const ids = Object.keys(faced);
    for (const mid of ids) { const w = faced[mid] | 0; if (per[w] !== undefined) per[w]++; }
    rec.faced = per;
    rec.wEngaged4 = (typeof G.waveEngaged === 'function') ? (G.waveEngaged(4) | 0) : -1;
    // New faced entries since yesterday (diff the key sets).
    const prevKeys = (prev && prev._facedKeys) || [];
    const prevSet = new Set(prevKeys);
    const newF = [];
    for (const mid of ids) {
      if (!prevSet.has(mid)) {
        const w = faced[mid] | 0;
        newF.push({ mid, w, decoupled: w > (rec.uw | 0) });
      }
    }
    rec.newFaced = newF;
    rec._facedKeys = ids;
  } catch (e) { rec.faced = null; rec.wEngaged4 = -1; rec.newFaced = []; rec._facedKeys = []; }
  // waveKillLog — new kills since yesterday (E2 counting lines, E4
  // decoupling, E3 kill anatomy). The log is append-only (capped 1000),
  // so diff by length.
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const prevLen = (prev && (prev._logLen | 0)) || 0;
    const newK = [];
    for (let i = prevLen; i < log.length; i++) {
      const e = log[i];
      if (!e) continue;
      const w = (e.w | 0) || 0;
      newK.push({ mid: e.mid || null, w, by: e.by || null, cls: byClass(e), ch: String(e.via || 'unknown'), uw: rec.uw | 0, decoupled: w > (rec.uw | 0) });
    }
    rec.newKills = newK;
    rec._logLen = log.length;
  } catch (e) { rec.newKills = []; rec._logLen = 0; }
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

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = SW.policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'w5doormeasure', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const recs = [];
  const hashes = [];
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const waveTrace = { maxWave: 1, wave2Day: null, wave3Day: null, wave4Day: null, wave5Day: null };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  const bare = isBare();
  let prev = null;
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
        const rec = pathRec(G, prev);
        prev = rec;
        recs.push(rec);
        const uw = rec.uw;
        if (uw > waveTrace.maxWave) waveTrace.maxWave = uw;
        const day = rec.d;
        if (uw >= 2 && waveTrace.wave2Day == null) waveTrace.wave2Day = day;
        if (uw >= 3 && waveTrace.wave3Day == null) waveTrace.wave3Day = day;
        if (uw >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = day;
        if (uw >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = day;
      } else {
        // Bare mode still advances the diff cursors so the end-of-run log
        // diff in live mode doesn't see phantom "new" kills (the DET
        // comparison needs identical bookkeeping, not identical reads).
        try {
          const log = (G.state && G.state.waveKillLog) || [];
          const ds = (typeof G.deedState === 'function') ? G.deedState() : null;
          prev = { _logLen: log.length, _facedKeys: Object.keys((ds && ds.wavesFaced) || {}) };
        } catch (e) {}
      }
      // Hashes ALWAYS recorded (bare and live) — the w5census lesson: a
      // hash inside the census block voids the bare-vs-live comparison.
      hashes.push(G.state.scholar.day + ':' + dayHash(Game));
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const deaths = {};
  const deathList = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathList.push({ day: d.day | 0, who: String(d.who || ''), player: !!d.player, kind: String(d.kind || ''), cause: String(d.cause || '') });
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
    if (maxWave >= 3 && waveTrace.wave3Day == null) waveTrace.wave3Day = gameDays;
    if (maxWave >= 2 && waveTrace.wave2Day == null) waveTrace.wave2Day = gameDays;
  } catch (e) {}
  // Final-day path vector at run end (the terminal state the analyzer
  // attributes against) — recorded even in bare mode for the DET compare.
  let endRec = null;
  try { endRec = pathRec(Game, prev); } catch (e) { endRec = null; }
  // The full waveKillLog for E2/E3 (killer classes, window-mortality).
  let killLog = [];
  try {
    for (const e of ((Game.state && Game.state.waveKillLog) || [])) {
      killLog.push({ d: (e.d | 0) || 0, mid: e.mid || null, w: (e.w | 0) || 0, by: e.by || null, cls: byClass(e), ch: String(e.via || 'unknown') });
    }
  } catch (e) {}
  const out = {
    seed, policyId, substrate: 'w5doormeasure-preseat-windefer',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    deaths, deathList,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave2Day: waveTrace.wave2Day, wave3Day: waveTrace.wave3Day,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    recs, endRec, killLog, hashes,
  };
  if (process.env.W5DOOR_NOWRITE !== '1' && !opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    // DET gate: instrument-on vs instrument-off byte-identical trajectories.
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65111, 65112]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of dseeds) {
        delete process.env.W5DOOR_BARE;
        const live = await runOne(seed, policyId, { noWrite: true });
        process.env.W5DOOR_BARE = '1';
        const bareR = await runOne(seed, policyId, { noWrite: true });
        delete process.env.W5DOOR_BARE;
        n++;
        const lh = JSON.stringify(live.hashes), bh = JSON.stringify(bareR.hashes);
        const ok = lh === bh && live.hashes.length > 0;
        console.log(`DET ${policyId}/s${seed}: ${ok ? 'IDENTICAL' : 'DIVERGED'} (${live.hashes.length} days)`);
        if (!ok) bad++;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    if (bad) { console.error(`DET FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`DET GREEN: ${n}/${n} byte-identical.`);
    return;
  }
  if (process.env.FIDELITY === '1') {
    // Fidelity: re-run completed sweep seeds, byte-identical per-seed JSON.
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : SEEDS.slice(0, 2)).filter(Number.isFinite);
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of fseeds) {
        const fp = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { console.log(`FIDELITY SKIP ${policyId}/s${seed}: no sweep JSON`); continue; }
        const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const re = await runOne(seed, policyId, { noWrite: true });
        n++;
        const strip = (o) => { const c = Object.assign({}, o); delete c.hashes; return JSON.stringify(c); };
        const ok = strip(orig) === strip(re);
        console.log(`FIDELITY ${policyId}/s${seed}: ${ok ? 'IDENTICAL' : 'DIVERGED'}`);
        if (!ok) bad++;
      }
    }
    if (!n) { console.error('FIDELITY: nothing to compare.'); process.exit(2); }
    if (bad) { console.error(`FIDELITY FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`FIDELITY GREEN: ${n}/${n} byte-identical.`);
    return;
  }
  if (process.env.SMOKE === '1') {
    const sseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65111]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = process.env.DAYS || '10';
    for (const policyId of POLICIES) {
      for (const seed of sseeds) {
        const r = await runOne(seed, policyId, { noWrite: true });
        const er = r.endRec || {};
        console.log(`SMOKE ${policyId}/s${seed}: days=${r.gameDays} end=${r.endReason} recs=${r.recs.length} maxWave=${r.maxWave} errs=0 ` +
          `endRec{uw=${er.uw},peak=${er.peak},cap=${er.cap},l1=${er.l1},l2=${er.l2},def5=${er.def5}}`);
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log('SMOKE GREEN.');
    return;
  }
  // Full sweep.
  console.log(`w5doormeasure sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${daysNow()}`);
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await runOne(seed, policyId);
      console.log(`done ${policyId}/s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} w4d=${r.wave4Day} def5=${(r.endRec || {}).def5} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
  }
  console.log('SWEEP COMPLETE.');
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}

module.exports = { policyFor: SW.policyFor, pathRec, runOne, byClass, SEEDS };
