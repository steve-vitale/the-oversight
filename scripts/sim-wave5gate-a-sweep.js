#!/usr/bin/env node
// scripts/sim-wave5gate-a-sweep.js — wave-5 binding-gate decomposition
// (scale-onramp axis, 2026-10-26, arm sim-wave5gate-a. DIAG/MEASUREMENT
// ONLY, zero src/js changes.)
//
// Same substrate as the 1715Z band: tableseat-nowait policy
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, seat legs only), 180d
// death-aware horizon, seeds 73671-73678. One process per seed —
// never two harnesses in one node process.
//
// INSTRUMENT DISCIPLINE (pre-registered): the daily hook calls the base
// policy daily FIRST, then takes PURE-READ snapshots only. It never calls
// villageStandingTotal() or unlockedWave() inside the day loop: both fire
// hold/release beats and advance the peak ratchet, so an instrument call
// could move narration (and the ratchet) on a day the engine would not
// have. The gated total is recomputed here from the pure components with
// the villageStandingTotal() formula, and checked ONCE at end-of-run
// (after the run is over) against the real function. Any mismatch is an
// instrument fault, reported by the analyzer, never a gate finding.
//
// Per-day snapshot fields: scholar day, w3 rung (day>=25 && w2 ledger
// pts>=4), ledger pts per wave, standing breakdown (war/diplomacy/plenty
// + warPts/links/feasts), capped total, readiness bars for waves 4 and 5
// (waveUnlockReady), peak wave, computed gated total, faced counts per
// wave (waveEngaged), computed unlocked wave, scale rank, table flags.
// The analyzer derives closest-approach days and binding gates from
// these snapshots; this script asserts nothing about gates.
//
// Transcript capture (journey-arm method, read-only): say/emit wrapped
// to record ONLY System hold/release/wave lines (standing holds, draft
// releases, wave beats) with the day at call time. No RNG, no inputs.
//
// Modes:
//   --one <seed> : run one seed, write s<seed>-wave5gate.json to EVID.
//   --analyze    : (see scripts/sim-wave5gate-a-analyze.js — the analyzer
//                  lives there so the proof script can require it.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const RANK_ORDER = { village: 0, local: 0, regional: 1, national: 2, global: 3 };
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const HOLD_LINE_RE = /fifth draft|next act|RATINGS ARE UP|Mirror Draft|Producers|wave 4 talent|fifth draft stays|not bought with bread/i;

function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function num(v, dflt) { const n = (v | 0); return Number.isFinite(n) ? n : (dflt | 0); }

// Pure-read gate snapshot. Returns null only if every read fails.
function gateSnap(Game) {
  const s = { errs: [] };
  try { s.day = ((Game.state && Game.state.scholar && Game.state.scholar.day) | 0) || 0; } catch (e) { s.day = 0; s.errs.push('day'); }
  try {
    const cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : {};
    s.dayFloor2 = (cfg.wave2DayFloor != null) ? (cfg.wave2DayFloor | 0) : 8;
    s.dayFloorN = (cfg.dayFloor != null) ? (cfg.dayFloor | 0) : 25;
    s.bar = (cfg.barsPerWave) || { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
  } catch (e) { s.errs.push('ledgerCfg'); s.dayFloor2 = 8; s.dayFloorN = 25; s.bar = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 }; }
  try {
    s.pts = {};
    for (const w of [1, 2, 3, 4, 5]) s.pts[w] = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(w) | 0) : 0;
  } catch (e) { s.errs.push('pts'); s.pts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; }
  s.w3rung = (s.day >= s.dayFloorN) && ((s.pts[2] | 0) >= ((s.bar[2] | 0) || 4));
  try {
    const st = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : {};
    s.standing = { total: num(st.total, 0), war: num(st.war, 0), diplomacy: num(st.diplomacy, 0), plenty: num(st.plenty, 0), warPts: num(st.warPts, 0), links: num(st.links, 0), feasts: num(st.feasts, 0) };
  } catch (e) { s.errs.push('standing'); s.standing = { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 }; }
  try {
    const cfg = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : {};
    s.t4 = (cfg.t4 | 0) || 100; s.t5 = (cfg.t5 | 0) || 200; s.plentyCap = (cfg.plentyCapT5 | 0) || 100;
  } catch (e) { s.errs.push('standingCfg'); s.t4 = 100; s.t5 = 200; s.plentyCap = 100; }
  s.capped = (s.standing.war | 0) + (s.standing.diplomacy | 0) + Math.min((s.standing.plenty | 0), s.plentyCap);
  try { s.cappedCheck = (typeof Game.standingPlentyCappedTotal === 'function') ? (Game.standingPlentyCappedTotal() | 0) : null; } catch (e) { s.cappedCheck = null; s.errs.push('cappedCheck'); }
  try {
    const rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null;
    const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    const slim = (r) => (r ? { ready: !!r.ready, armored: num(r.armored, 0), armed: num(r.armed, 0), tricks: num(r.tricks, 0), veterans: num(r.veterans, 0), short: (r.short || []).slice(), demand: r.demand || null } : null);
    s.rd4 = slim(rd4); s.rd5 = slim(rd5);
  } catch (e) { s.errs.push('readiness'); s.rd4 = null; s.rd5 = null; }
  try { s.peak = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : 0; } catch (e) { s.peak = 0; s.errs.push('peak'); }
  // Gated total, replicating villageStandingTotal() WITHOUT beats/ratchet
  // writes: holds cap(199)/defer4(99)/defer5(199), then the peak floor.
  try {
    const raw = s.standing.total | 0;
    const holds = [];
    if (raw >= s.t5 && s.capped < s.t5 && s.peak < 5) holds.push({ bound: s.t5 - 1, kind: 'cap' });
    if (raw >= s.t4 && s.rd4 && !s.rd4.ready && s.peak < 4) holds.push({ bound: s.t4 - 1, kind: 'defer4' });
    if (s.capped >= s.t5 && s.rd5 && !s.rd5.ready && s.peak < 5) holds.push({ bound: s.t5 - 1, kind: 'defer5' });
    let gated = raw;
    for (const h of holds) if (h.bound < gated) gated = h.bound;
    const floor = s.peak >= 5 ? s.t5 : s.peak >= 4 ? s.t4 : 0;
    s.gated = Math.max(gated, floor);
    s.holds = holds;
  } catch (e) { s.errs.push('gated'); s.gated = 0; s.holds = []; }
  try {
    s.faced = {};
    for (const w of [1, 2, 3, 4, 5]) s.faced[w] = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(w) | 0) : 0;
  } catch (e) { s.errs.push('faced'); s.faced = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; }
  // Computed unlocked wave, replicating unlockedWave() on pure reads.
  if (s.w3rung && s.gated >= s.t5 && (s.faced[4] | 0) > 0) s.computedWave = 5;
  else if (s.w3rung && s.gated >= s.t4) s.computedWave = 4;
  else if (s.w3rung) s.computedWave = 3;
  else if (s.day >= s.dayFloor2 && (s.pts[1] | 0) >= ((s.bar[1] | 0) || 5)) s.computedWave = 2;
  else s.computedWave = 1;
  try { s.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { s.rank = 'village'; s.errs.push('rank'); }
  try { const pg = Game.progState ? Game.progState() : {}; s.arc = pg.arc || 1; s.tableWaiting = !!pg.tableWaiting; s.tableDone = !!pg.tableDone; } catch (e) { s.arc = 1; s.tableWaiting = false; s.tableDone = false; s.errs.push('prog'); }
  try { s.won = !!Game.won; } catch (e) { s.won = false; }
  try { s.rosterN = ((Game.state && Game.state.village && Game.state.village.roster) || []).length; } catch (e) { s.rosterN = null; }
  return s;
}

async function runOne(seed) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'wave5gate', fullTelemetry: false });
  await setupGame(Game);
  const snaps = [];
  const holdLines = [];
  const gdayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  // Read-only transcript capture: System hold/release/wave lines only.
  try {
    const _say = Game.say.bind(Game);
    Game.say = function (...a) { try { const line = String(a[0]); if (HOLD_LINE_RE.test(line)) holdLines.push({ day: gdayOf(), line: line.slice(0, 300) }); } catch (e) {} try { return _say(...a); } catch (e) { return a[0]; } };
  } catch (e) {}
  try {
    if (typeof Game.emit === 'function') {
      const _emit = Game.emit.bind(Game);
      Game.emit = function (...a) { try { const line = String(a[0]); if (HOLD_LINE_RE.test(line)) holdLines.push({ day: gdayOf(), line: line.slice(0, 300) }); } catch (e) {} try { return _emit(...a); } catch (e) { return a[0]; } };
    }
  } catch (e) {}
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      // PRE-BASE snapshot of the ever-flags, exactly like the verbatim
      // rebaseline hook: the seat leg can take the seat inside
      // base.daily, clearing tableWaiting before any post-base snapshot
      // would ever see it (won seeds showed table 0 vs rebaseline 1
      // before this fix). Gate snapshots stay post-base below.
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        if (pg.tableDone) hist.everEntered = true;
        hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
        try { hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] || 0); } catch (e) {}
      } catch (e) {}
      if (tableseatNowait.daily) { try { tableseatNowait.daily(G, ctx); } catch (e) {} }
      try {
        const s = gateSnap(G);
        s.loopDay = snaps.length + 1;
        snaps.push(s);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableDone) hist.everEntered = true;
      } catch (e) {}
    },
  });
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  // End-of-run real-function cross-checks (run over — side effects harmless).
  let realTotal = null, realWave = null, realSeat = null, realFull = null;
  try { realTotal = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
  try { realWave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  try { realSeat = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null; } catch (e) {}
  try { realFull = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null; } catch (e) {}
  const lastSnap = snaps.length ? snaps[snaps.length - 1] : null;
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  // Wave-4+ kill-log census at end (veteran story: who killed, alive?).
  let killLog = [];
  try { killLog = ((Game.state && Game.state.waveKillLog) || []).slice(); } catch (e) {}
  const killerAlive = (vid) => {
    try {
      if (vid === Game.villagerId) return true;
      if (typeof Game.vpOf === 'function') { const vp = Game.vpOf(vid); return !!(vp && !vp.dead); }
    } catch (e) {}
    return null;
  };
  const w4plus = {};
  for (const e of killLog) {
    if (!e || ((e.w | 0) < 4)) continue;
    const k = w4plus[e.by] || (w4plus[e.by] = { vid: e.by, kills: 0, waves: {}, firstDay: null, lastDay: null });
    k.kills++; k.waves[e.w] = (k.waves[e.w] || 0) + 1;
    if (k.firstDay === null || (e.d | 0) < k.firstDay) k.firstDay = e.d | 0;
    if (k.lastDay === null || (e.d | 0) > k.lastDay) k.lastDay = e.d | 0;
  }
  const w4plusKillers = Object.values(w4plus).map(k => Object.assign(k, { aliveAtEnd: killerAlive(k.vid) }));
  let countersKnown = 0;
  try { const mc = (Game.state && Game.state.monsterCounters) || {}; for (const mid of Object.keys(mc)) if (typeof Game.monsterCounterKnown === 'function' && Game.monsterCounterKnown(mid)) countersKnown++; } catch (e) {}
  const row = {
    policy: 'wave5gate', seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: (lastSnap && lastSnap.won) ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: lastSnap ? lastSnap.rank : 'village',
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[(lastSnap && lastSnap.rank) || 'village'] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[(lastSnap && lastSnap.rank) || 'village'] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || (lastSnap && lastSnap.tableWaiting)) ? 1 : 0,
    entered: (hist.everEntered || (lastSnap && lastSnap.tableDone)) ? 1 : 0,
    deathTotal: (result.samples.deaths || []).length,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    ts: (() => { const ts = {}; if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k]; return ts; })(),
    snaps, holdLines,
    endSnap: lastSnap,
    endReal: { villageStandingTotal: realTotal, unlockedWave: realWave, tableSeat: realSeat, deedGateReady: realFull },
    endChecks: {
      gatedVsReal: (lastSnap ? (lastSnap.gated | 0) : null) === realTotal,
      computedWaveVsReal: (lastSnap ? (lastSnap.computedWave | 0) : null) === realWave,
      computedMaxWaveVsHarness: Math.max.apply(null, snaps.map(s => s.computedWave | 0).concat([1])) === (result.maxWaveUnlocked || 1),
      cappedVsReal: (lastSnap ? (lastSnap.capped | 0) : null) === (lastSnap ? (lastSnap.cappedCheck) : null),
    },
    w4plusKillers, countersKnown,
    snapErrs: snaps.reduce((t, s) => t + (s.errs || []).length, 0),
  };
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-wave5gate-a');
  const fn = path.join(evidDir, `s${seed}-wave5gate.json`);
  writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
  const e = row.endSnap || {};
  console.log(`  [wave5gate seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} computedMax=${Math.max.apply(null, snaps.map(s => s.computedWave | 0).concat([1]))} endGated=${e.gated} endReal=${realTotal} endWaveReal=${realWave} faced4end=${e.faced ? e.faced[4] : '?'} rd5end=${e.rd5 ? JSON.stringify(e.rd5.short) : '?'} checks=${JSON.stringify(row.endChecks)} holdLines=${holdLines.length} snaps=${snaps.length}`);
  return row;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) {
    const seed = parseInt(args[args.indexOf('--one') + 1], 10);
    if (!Number.isFinite(seed)) { console.error('usage: --one <seed>'); process.exit(2); }
    await runOne(seed);
    return;
  }
  console.error('usage: --one <seed>  (analysis lives in scripts/sim-wave5gate-a-analyze.js)');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('WAVE5GATE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, gateSnap, SEEDS };
