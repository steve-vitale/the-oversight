#!/usr/bin/env node
// sweep-wintrace-20261015.js — table→win diagnostic sweep (sim-wintrace,
// 2026-10-15, sim-findings #233).
//
// 8 seeds x {leadfeast, belongfeast} x {control, traced}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep (#247).
// Substrate: FEASTSCALE_R13=1 (the table road per #233).
//
// The traced side wraps the base policy in the wintrace diagnostic
// instrument (WINTRAZE=1): read-only table-state sampling + finale
// transcript capture. The control side runs the unwrapped policy.
//
// PHASE 1 GO (binding, MEASUREMENT §14): ≥90% of table-reaching traced runs
// fully attributed (seat → paths qualified → path entered → challenge →
// outcome → win/no-win reason). Verdict via scripts/compare-wintrace-20261015.js.
//
// Usage:
//   FEASTSCALE_R13=1 SMOKE=1 node scripts/sweep-wintrace-20261015.js
//   FEASTSCALE_R13=1 node scripts/sweep-wintrace-20261015.js   # full sweep
// Targeted re-runs: SEEDS="77,88" ONLY="leadfeast,traced;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const WT = require('./policies/wintrace');
const FS = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

if (process.env.FEASTSCALE_R13 !== '1' && process.env.SMOKE !== '1') {
  console.error('SWEEP STOP: FEASTSCALE_R13=1 is required (substrate).');
  process.exit(2);
}
if (process.env.FEASTSCALE_R13 !== '1') process.env.FEASTSCALE_R13 = '1';

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-wintrace');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'wintrace-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function basePolicy(policyId) { return policyId === 'leadfeast' ? FS.leadfeast : FS.belongfeast; }
function tracedPolicy(policyId) { return policyId === 'leadfeast' ? WT.leadtracer : WT.belongtracer; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const traced of [false, true]) {
    if (traced) process.env.WINTRAZE = '1'; else delete process.env.WINTRAZE;
    process.env.POLICY = 'belongfeast';
    const base = traced ? tracedPolicy('belongfeast') : basePolicy('belongfeast');
    const side = traced ? 'traced' : 'control';
    check(`[${side}] named-export unwrap: policy.daily is a function`, typeof base.daily === 'function');
    // LAYER-LIVE MARKER: the sweep must assert the env-gated instrument is
    // actually live on the traced side, not just that the policy drives.
    let liveFlag = null, runCtx = null, dailyCalls = 0;
    const policy = Object.assign({}, base);
    const os = base.setup;
    policy.setup = (G, ctx) => { liveFlag = WT.layerOn(); runCtx = ctx; if (os) return os(G, ctx); };
    const od = base.daily;
    policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'wintrace-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 30 }); });
    check(`[${side}] layer-live marker == ${traced}`, liveFlag === traced, 'live=' + liveFlag);
    check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check(`[${side}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
    if (traced) {
      const W = runCtx && runCtx._wintrace;
      check(`[traced] trace rows recorded (${W ? W.rows.length : 0})`, !!(W && W.rows.length > 0));
      check(`[traced] say-capture installed`, !!(runCtx && runCtx._wtSayInstalled));
    } else {
      check('[control] no trace recorded', !(runCtx && runCtx._wintrace));
    }
  }
  delete process.env.WINTRAZE;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, layer-live marker honest — safe to measure.');
}

async function oneRun(seed, policyId, side) {
  const traced = side === 'traced';
  if (traced) process.env.WINTRAZE = '1'; else delete process.env.WINTRAZE;
  const base = traced ? tracedPolicy(policyId) : basePolicy(policyId);
  const { Game } = await loadGame({ seed, mode: `wintrace-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, layerLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; layerLive = WT.layerOn(); if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (layerLive !== traced) throw new Error(`layer-live marker mismatch: side=${side} live=${layerLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  let att = null;
  try { att = WT.attribute(Game, runCtx || {}, endInfo); }
  catch (e) { att = { traced: false, verdict: 'unknown', evidence: ['attribution crashed: ' + String(e.message).slice(0, 120)] }; }
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    everTable: hist.everTable, won: endInfo.won ? 1 : 0,
    maxWave: result.maxWaveUnlocked || 1, wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    exiled: hist.exiled,
    wintrace: att,
    traceRows: runCtx && runCtx._wintrace ? runCtx._wintrace.rows.length : 0,
    beatsCaptured: runCtx && runCtx._wintrace ? runCtx._wintrace.beats.length : 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  // Finale transcript beats (sense-testing corpus) — separate file.
  try {
    const beats = (runCtx && runCtx._wintrace && runCtx._wintrace.beats) || [];
    if (beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats, null, 1));
    }
  } catch (e) {}
  // TRACE_DUMP=1: full raw trace (rows + beats) for deep-dives.
  try {
    if (process.env.TRACE_DUMP === '1' && runCtx && runCtx._wintrace) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `trace-${policyId}-${side}-s${seed}.json`),
        JSON.stringify(runCtx._wintrace, null, 1));
    }
  } catch (e) {}
  const a = out.wintrace || {};
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.everTable ? 1 : 0} won=${out.won} verdict=${a.verdict || '?'}${a.seatFirst ? ' seat=' + a.seatFirst : ''}${a.pathEntered ? ' path=' + a.pathEntered : ''}`);
  return out;
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seedFilter = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : SEEDS;
  const onlyFilter = process.env.ONLY ? process.env.ONLY.split(';').map(p => p.split(',')) : null;
  const all = [];
  for (const policyId of POLICIES) {
    for (const side of ['control', 'traced']) {
      if (onlyFilter && !onlyFilter.some(([p, s]) => p === policyId && s === side)) continue;
      for (const seed of seedFilter) {
        try {
          all.push(await oneRun(seed, policyId, side));
        } catch (e) {
          console.log(`  [${side} ${policyId} s${seed}] ERROR ${e.message}`);
          all.push({ seed, policyId, side, error: String(e.message) });
        }
      }
    }
  }
  delete process.env.WINTRAZE;
  // Merge with pre-existing per-seed files (targeted re-runs after a
  // mid-sweep process death) before writing the summary.
  try {
    const have = {};
    for (const f of fs.readdirSync(EVID)) {
      const m = f.match(/^([a-z]+)-(control|traced)-s(\d+)\.json$/);
      if (m && f !== 'summary.json') {
        const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
        if (!r.error) have[`${m[1]}|${m[2]}|${m[3]}`] = r;
      }
    }
    for (const r of all) {
      if (!r.error) have[`${r.policyId}|${r.side}|${r.seed}`] = r;
    }
    all.length = 0;
    for (const k of Object.keys(have)) all.push(have[k]);
  } catch (e) { console.log('merge note: ' + e.message); }
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(all, null, 1));
  console.log('\nwrote ' + EVID + '/summary.json');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
