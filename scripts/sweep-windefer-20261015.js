#!/usr/bin/env node
// sweep-windefer-20261015.js — deferral-window discipline sweep
// (sim-findings #310, scale-onramp axis, 2026-10-15).
//
// 8 seeds x {leadfeast, belongfeast} x {control, armed}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep (#247).
// Substrate: FEASTSCALE_R13=1, WINPURSUIT=1 (asserted up front — #312);
// WINDEFER=1 on the armed side only.
//
//   control: traced pursuit policy (WINTRAZE=1 + WINPURSUIT=1) — the drain
//            answers the table offer the dawn it appears (old behavior).
//   armed:   traced defer-discipline policy (WINTRAZE=1 + WINPURSUIT=1 +
//            WINDEFER=1) — the offer is HELD pre-floor only when the
//            deferral window is plausibly survivable; otherwise walk now.
//
// Pre-registered GO (binding, MEASUREMENT §14):
//   PRIMARY: deferred-died verdicts armed <= control (fewer lame-duck deaths).
//   CO-PRIMARY: wins armed >= control (discipline must not cost wins).
//   GUARDRAILS: median survival >= control-10d; national >= control-2/16;
//               no new death mode at n>=3.
// Verdict via scripts/compare-windefer-20261015.js.
//
// Honesty: day-hashes are recorded per run; the verdict script hard-fails
// if any armed run with ZERO holds diverges from its control (the layer's
// only legitimate delta is the hold).
//
// Usage:
//   FEASTSCALE_R13=1 WINPURSUIT=1 SMOKE=1 node scripts/sweep-windefer-20261015.js
//   FEASTSCALE_R13=1 WINPURSUIT=1 node scripts/sweep-windefer-20261015.js
// Targeted re-runs: SEEDS="77,88" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const WT = require('./policies/wintrace');
const WP = require('./policies/winpursuit');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'WINPURSUIT']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [11, 22, 33, 44, 55, 66, 77, 88]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-windefer');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'windefer-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Control: traced pursuit. Armed: traced defer-discipline.
function policyFor(policyId, side) {
  const armed = side === 'armed';
  const inner = armed
    ? (policyId === 'leadfeast' ? WD.leaddefer : WD.belongdefer)
    : (policyId === 'leadfeast' ? WP.leadpursuit : WP.belongpursuit);
  return WT.withWinTrace(inner, `${policyId}-traced-${side}`, `windefer sweep ${side}`);
}

function expectedInnerId(policyId, side) {
  if (side === 'armed') return policyId === 'leadfeast' ? 'leadfeast-windefer' : 'belongfeast-windefer';
  return policyId === 'leadfeast' ? 'leadfeast-winpursuit' : 'belongfeast-winpursuit';
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    process.env.WINTRAZE = '1';
    process.env.WINPURSUIT = '1';
    if (side === 'armed') process.env.WINDEFER = '1'; else delete process.env.WINDEFER;
    const innerId = expectedInnerId('belongfeast', side);
    const inner = side === 'armed' ? WD.belongdefer : WP.belongpursuit;
    check(`[${side}] SMOKE policy id = ${innerId}`, inner.id === innerId, 'got ' + inner.id);
    const base = policyFor('belongfeast', side);
    check(`[${side}] named-export unwrap: policy.daily is a function`, typeof base.daily === 'function');
    let traceLive = null, pursuitLive = null, deferLive = null, dailyCalls = 0, runCtx = null;
    const policy = Object.assign({}, base);
    const os = base.setup;
    policy.setup = (G, ctx) => { traceLive = WT.layerOn(); pursuitLive = WP.layerOn(); deferLive = WD.layerOn(); runCtx = ctx; if (os) return os(G, ctx); };
    const od = base.daily;
    policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'windefer-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 30 }); });
    check(`[${side}] trace instrument live`, traceLive === true, 'trace=' + traceLive);
    check(`[${side}] pursuit layer live`, pursuitLive === true, 'pursuit=' + pursuitLive);
    check(`[${side}] defer layer live == ${side === 'armed'}`, deferLive === (side === 'armed'), 'defer=' + deferLive);
    check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check(`[${side}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
    check(`[${side}] trace rows recorded`, !!((runCtx && runCtx._wintrace || {}).rows || []).length);
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both sides drive, layer-live markers honest — safe to measure.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINTRAZE = '1';
  process.env.WINPURSUIT = '1';
  if (armed) process.env.WINDEFER = '1'; else delete process.env.WINDEFER;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `windefer-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, traceLive = null, pursuitLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; traceLive = WT.layerOn(); pursuitLive = WP.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const hashes = [];
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
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (traceLive !== true || pursuitLive !== true || deferLive !== armed)
    throw new Error(`layer-live marker mismatch: side=${side} trace=${traceLive} pursuit=${pursuitLive} defer=${deferLive}`);
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
  const decisions = ((runCtx && runCtx._windefer && runCtx._windefer.decisions) || []).slice();
  const holds = decisions.filter(d => d.hold).length;
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    everTable: hist.everTable, won: endInfo.won ? 1 : 0,
    maxWave: result.maxWaveUnlocked || 1, wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    exiled: hist.exiled,
    tableAnswers: (runCtx && runCtx.tableAnswers) || 0,
    holds, decisions,
    hashes,
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
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.everTable ? 1 : 0} won=${out.won} answers=${out.tableAnswers} holds=${holds} verdict=${a.verdict || '?'}${a.pathEntered ? ' path=' + a.pathEntered : ''}`);
}

(async () => {
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) {
      const [p, s] = part.split(',').map(x => x.trim());
      if (p && s) only[p + '|' + s] = true;
    }
  }
  if (process.env.SMOKE === '1') await smokeGate();
  for (const policyId of POLICIES) {
    for (const side of ['control', 'armed']) {
      if (only && !only[policyId + '|' + side]) continue;
      for (const seed of SEEDS) {
        await oneRun(seed, policyId, side);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log('\nSWEEP DONE — verdict via scripts/compare-windefer-20261015.js');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
