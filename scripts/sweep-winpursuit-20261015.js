#!/usr/bin/env node
// sweep-winpursuit-20261015.js — PHASE 2 sweep: the pursuit layer
// (sim-wintrace, 2026-10-15, sim-findings #233).
//
// 8 seeds x {leadfeast, belongfeast} x {control, pursued}, 180d
// death-aware, identical seeds both sides. Own control in the SAME sweep
// (#247). Substrate: FEASTSCALE_R13=1.
//
//   control: plain policy + wintrace instrument (WINTRAZE=1) — attribution
//            only, behavior-neutral (proven byte-identical).
//   pursued:  plain policy + WINPURSUIT=1 pursuit layer + wintrace
//            instrument — the layer drains the table modal via winseek's
//            tableRoad at the start of daily.
//
// Pre-registered GO (binding, MEASUREMENT §14):
//   PRIMARY: table→win conversions (pursued won − control won) ≥ +1.
//   GUARDRAILS: national ≥ control−2/16; median survival ≥ control−10d;
//               no new death mode at n≥3.
// Verdict via scripts/compare-winpursuit-20261015.js.
//
// Usage:
//   FEASTSCALE_R13=1 SMOKE=1 node scripts/sweep-winpursuit-20261015.js
//   FEASTSCALE_R13=1 node scripts/sweep-winpursuit-20261015.js
// Targeted re-runs: SEEDS="77,88" ONLY="leadfeast,pursued;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const WT = require('./policies/wintrace');
const WP = require('./policies/winpursuit');
const FS = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

if (process.env.FEASTSCALE_R13 !== '1') {
  if (process.env.SMOKE === '1') process.env.FEASTSCALE_R13 = '1';
  else { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required (substrate).'); process.exit(2); }
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-winpursuit');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'winpursuit-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Control: traced plain policy. Pursued: traced pursuit policy.
function policyFor(policyId, side) {
  const pursued = side === 'pursued';
  const inner = pursued
    ? (policyId === 'leadfeast' ? WP.leadpursuit : WP.belongpursuit)
    : (policyId === 'leadfeast' ? FS.leadfeast : FS.belongfeast);
  return WT.withWinTrace(inner, `${policyId}-traced-${side}`, `winpursuit sweep ${side}`);
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'pursued']) {
    process.env.WINTRAZE = '1';
    if (side === 'pursued') process.env.WINPURSUIT = '1'; else delete process.env.WINPURSUIT;
    const base = policyFor('belongfeast', side);
    check(`[${side}] named-export unwrap: policy.daily is a function`, typeof base.daily === 'function');
    let traceLive = null, pursuitLive = null, dailyCalls = 0, runCtx = null;
    const policy = Object.assign({}, base);
    const os = base.setup;
    policy.setup = (G, ctx) => { traceLive = WT.layerOn(); pursuitLive = WP.layerOn(); runCtx = ctx; if (os) return os(G, ctx); };
    const od = base.daily;
    policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'winpursuit-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 30 }); });
    check(`[${side}] trace instrument live`, traceLive === true, 'trace=' + traceLive);
    check(`[${side}] pursuit layer live == ${side === 'pursued'}`, pursuitLive === (side === 'pursued'), 'pursuit=' + pursuitLive);
    check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check(`[${side}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
    check(`[${side}] trace rows recorded`, !!((runCtx && runCtx._wintrace || {}).rows || []).length);
  }
  delete process.env.WINPURSUIT;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both sides drive, layer-live markers honest — safe to measure.');
}

async function oneRun(seed, policyId, side) {
  const pursued = side === 'pursued';
  process.env.WINTRAZE = '1';
  if (pursued) process.env.WINPURSUIT = '1'; else delete process.env.WINPURSUIT;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `winpursuit-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, traceLive = null, pursuitLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; traceLive = WT.layerOn(); pursuitLive = WP.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
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
  if (traceLive !== true || pursuitLive !== pursued)
    throw new Error(`layer-live marker mismatch: side=${side} trace=${traceLive} pursuit=${pursuitLive}`);
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
    tableAnswers: (runCtx && runCtx.tableAnswers) || 0,
    wintrace: att,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    const beats = (runCtx && runCtx._wintrace && runCtx._wintrace.beats) || [];
    if (beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats, null, 1));
    }
  } catch (e) {}
  const a = out.wintrace || {};
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.everTable ? 1 : 0} won=${out.won} answers=${out.tableAnswers} verdict=${a.verdict || '?'}${a.pathEntered ? ' path=' + a.pathEntered : ''}`);
  return out;
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seedFilter = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : SEEDS;
  const onlyFilter = process.env.ONLY ? process.env.ONLY.split(';').map(p => p.split(',')) : null;
  const all = [];
  for (const policyId of POLICIES) {
    for (const side of ['control', 'pursued']) {
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
  delete process.env.WINPURSUIT;
  try {
    const have = {};
    for (const f of fs.readdirSync(EVID)) {
      const m = f.match(/^([a-z]+)-(control|pursued)-s(\d+)\.json$/);
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
