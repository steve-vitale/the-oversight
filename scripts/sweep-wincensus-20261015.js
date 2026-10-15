#!/usr/bin/env node
// sweep-wincensus-20261015.js — the win-side census sweep
// (flesh-out loop ARM 1, 2026-10-15, scale-onramp axis, sim-wincensus).
//
// 8 seeds x {leadfeast, belongfeast} x {control, armed}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep (#247 — never
// inherit a baseline). The win-side layers (winpursuit + windefer) measured
// TOGETHER for the first time, on the tribcollapse census substrate.
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   control: tribfloor.js leadfeast/belongfeast (leadcourt/belongseek +
//            feastscale r13 + tribfloor), traced (WINTRAZE=1).
//   armed:   the SAME tribfloor base wrapped in windefer's withWinDefer
//            (WINPURSUIT=1 + WINDEFER=1) — the wrapper reproduces winpursuit's
//            tableRoad drain internally (proven by windefer's 19/19 proof),
//            then adds the hold discipline. Traced (WINTRAZE=1).
//
// Pre-registered GO (binding, MEASUREMENT §14): ≥90% of non-winning runs
// attributed to a named census bucket by scripts/wincensus-20261015.js
// ('unknown' counts against). Verdict via the classifier CLI after the
// sweep. Per-seed JSONs carry numeric national, table, wins, exiled for
// the coordinator's telemetry-check.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-wincensus-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-wincensus-20261015.js
// Targeted re-runs: SEEDS="77,88" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const WT = require('./policies/wintrace');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');
const WC = require('./wincensus-20261015');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [11, 22, 33, 44, 55, 66, 77, 88]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-wincensus');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'wincensus-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Control: traced tribfloor base. Armed: traced (windefer over the SAME
// tribfloor base). The windefer wrapper's daily reproduces winpursuit's
// tableRoad drain (drain skipped only on hold days).
function policyFor(policyId, side) {
  const armed = side === 'armed';
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const inner = armed
    ? WD.withWinDefer(base, `${policyId}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base`)
    : base;
  return WT.withWinTrace(inner, `${policyId}-traced-${side}`, `wincensus sweep ${side}`);
}

function expectedInnerId(policyId, side) {
  return side === 'armed' ? `${policyId}-windefer` : policyId;
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
    const inner = side === 'armed'
      ? WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'smoke')
      : TF.belongfeast;
    check(`[${side}] SMOKE inner policy id = ${innerId}`, inner.id === innerId, 'got ' + inner.id);
    check(`[${side}] tribfloor layer live`, TF.layerOn() === true, 'tribfloor=' + TF.layerOn());
    const base = policyFor('belongfeast', side);
    let traceLive = null, deferLive = null, dailyCalls = 0, runCtx = null;
    const policy = Object.assign({}, base);
    const os = base.setup;
    policy.setup = (G, ctx) => { traceLive = WT.layerOn(); deferLive = WD.layerOn(); runCtx = ctx; if (os) return os(G, ctx); };
    const od = base.daily;
    policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'wincensus-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 30 }); });
    check(`[${side}] trace instrument live`, traceLive === true, 'trace=' + traceLive);
    check(`[${side}] defer layer live == ${side === 'armed'}`, deferLive === (side === 'armed'), 'defer=' + deferLive);
    check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    check(`[${side}] trace rows recorded`, !!((runCtx && runCtx._wintrace || {}).rows || []).length);
    // The census record shape works end to end: build the record the way
    // oneRun does (sans hashes) and classify it — the classifier must
    // produce a bucket without throwing.
    const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
    let att = null;
    try { att = WT.attribute(Game, runCtx || {}, endInfo); } catch (e) { att = { traced: false, verdict: 'unknown', evidence: ['crash: ' + String(e.message).slice(0, 80)] }; }
    const smokeRec = { seed: 11, policyId: 'belongfeast', side, gameDays: result.gameDays, endReason: result.endReason, deaths: {}, wins: endInfo.won ? 1 : 0, wintrace: att };
    let bucket = null, threw = false;
    try { bucket = WC.classify(smokeRec).bucket; } catch (e) { threw = true; }
    check(`[${side}] classifier produces a bucket on the smoke record`, !threw && typeof bucket === 'string', 'bucket=' + bucket + ' threw=' + threw);
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both sides drive, layer-live markers honest, record shape classifies — safe to measure.');
}

function seatDetail(Game) {
  try {
    const s = Game.tableSeat ? Game.tableSeat() : null;
    const d = (s && s.detail) || {};
    return { seat: (s && s.seat) || 'none', w1: d.w1 | 0, w2: d.w2 | 0, w3: d.w3 | 0, contestsN: d.contestsN | 0, crisesN: d.crisesN | 0, rank: d.rank || 'village', stage: d.stage | 0, foodDeeds: !!d.foodDeeds };
  } catch (e) { return { seat: 'err' }; }
}

function deedGate(Game) {
  try {
    const g = Game.deedGateReady ? Game.deedGateReady() : null;
    if (!g) return null;
    return { ok: !!g.ok, w1: g.w1 | 0, w2: g.w2 | 0, w3: g.w3 | 0, w4: g.w4 | 0, w5: g.w5 | 0, contestsN: g.contestsN | 0, crisesN: g.crisesN | 0, rank: g.rank || 'village', stageOk: !!g.stageOk, foodDeeds: !!g.foodDeeds };
  } catch (e) { return null; }
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINTRAZE = '1';
  process.env.WINPURSUIT = '1';
  if (armed) process.env.WINDEFER = '1'; else delete process.env.WINDEFER;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `wincensus-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, traceLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; traceLive = WT.layerOn(); deferLive = WD.layerOn();
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
  if (traceLive !== true || deferLive !== armed)
    throw new Error(`layer-live marker mismatch: side=${side} trace=${traceLive} defer=${deferLive}`);
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
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave: result.maxWaveUnlocked || 1, wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    tableAnswers: (runCtx && runCtx.tableAnswers) || 0,
    seatDetail: seatDetail(Game), deedGate: deedGate(Game),
    holds, decisions,
    hashes,
    wintrace: att,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled — all 0/1 above. gameDays is the survival day.
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
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.table} wins=${out.wins} answers=${out.tableAnswers} holds=${holds} verdict=${a.verdict || '?'}${a.pathEntered ? ' path=' + a.pathEntered : ''}`);
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
  console.log('\nSWEEP DONE — verdict via: node scripts/wincensus-20261015.js "evidence/2026-10-15/perseed-wincensus/*.json"');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
