#!/usr/bin/env node
// scripts/measure-allowgate5-20261015.js — ALLOWGATE4 pilot measurement
// (loop B, 2026-10-15, food-economy axis, sim-findings #187): re-run of
// r14's 4-day-floor gate (the landed allowgate2 layer) under the
// noise-calibrated header.
//
// THE ARM: r14's proven design (starvation 21->16, 123 candidate-only holds,
// floor never moved — killed on the hungryDays proxy, GO'd by r16 under the
// honest bound) re-measured on the current tip. scripts/policies/allowgate2.js
// (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1) wraps
// leadfeast/belongfeast; the allowance may only spend surplus above the
// 4-day fresh floor; holds counted on FEAST CANDIDATES ONLY
// (ctx.ag2GateHeld); suppressed feasts postponed, never displaced.
// Policy-side only; ZERO src/js changes.
//
// Pre-registered (evidence/2026-10-15/sim-allowgate5-b.md header,
// docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: starvation deaths armed <= 0.75 x control (integer: 4*armed <= 3*control)
//   GUARDRAILS: hungryDays <= control x 1.409 (#208); rot/villager-day <=
//     control x 1.335 (rotcal A/A p90rel per-vd); food-deeds >= control-2;
//     table >= control-1; national >= control-2; no new death mode (n>=3).
//     Median survival report-only.
//   Horizon: 180d death-aware. Seeds: 101/202/303/404/606/707/808/909 x
//     leadcourt/belongseek = 16 runs/side, IDENTICAL seeds control vs armed.
//     BOTH sides FEASTSCALE_R13=1. Control: ALLOWGATE2 unset. Armed:
//     ALLOWGATE2=1. OWN control measured in the SAME sweep (#247).
//   KILL at pilot on any primary/guardrail miss (§14).
//
// Usage:
//   SIDE=control OUT=evidence/2026-10-15/ag5-control.json FEASTSCALE_R13=1 node scripts/measure-allowgate5-20261015.js
//   SIDE=armed   OUT=evidence/2026-10-15/ag5-armed.json   FEASTSCALE_R13=1 ALLOWGATE2=1 node scripts/measure-allowgate5-20261015.js
//   SMOKE=1 FEASTSCALE_R13=1 node scripts/measure-allowgate5-20261015.js
//   SMOKE=1 FEASTSCALE_R13=1 ALLOWGATE2=1 node scripts/measure-allowgate5-20261015.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
let AG2;
try {
  AG2 = require('./policies/allowgate2');
} catch (e) {
  console.log('INFO-SKIP: allowgate2 layer absent (reverted per kill protocol)');
  process.exit(0);
}

const ARMED_SIDE = process.env.ALLOWGATE2 === '1';
const POLICY_REGISTRY = ARMED_SIDE
  ? { leadcourt: AG2.leadgate2, belongseek: AG2.belonggate2 }
  : { leadcourt: FS.leadfeast, belongseek: FS.belongfeast };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const SEAT_ORDER = { none: 0, lesser: 1, full: 2 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

// rot instrumentation (sharepol convention): count rot kcal the sweepSpoiled
// pass removes, split fresh vs preserved.
function instrument(Game) {
  const W = { rotFresh: 0, rotPreserved: 0 };
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') W.rotPreserved += k;
          else W.rotFresh += k;
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };
  return W;
}

function buildPolicy(pid) {
  const base = POLICY_REGISTRY[pid];
  if (!base || typeof base.daily !== 'function') throw new Error('policy registry broken for ' + pid + ' (#69)');
  return Object.assign({}, base);
}

async function oneRun(seed, pid, days) {
  const policy = buildPolicy(pid);
  const { Game } = await loadGame({ seed, mode: 'ag5-' + (ARMED_SIDE ? 'armed' : 'control') + '-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everSeat: 'none', everRealm: 0, firstFeastDay: 0, surgeUsedDay: 0 };
  let runCtx = null;
  const origSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const origDaily = policy.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (origDaily) { try { r = origDaily(G, ctx); } catch (e) {} }
    try {
      const day = (G.state.scholar || {}).day || 0;
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      try { const st = G.tableSeat ? G.tableSeat() : { seat: 'none' }; if ((SEAT_ORDER[st.seat] || 0) > (SEAT_ORDER[hist.everSeat] || 0)) hist.everSeat = st.seat; } catch (e) {}
      try { if (G._havenPolity && G._havenPolity()) hist.everRealm = 1; } catch (e) {}
      if (!hist.firstFeastDay && (ctx.fsFeasts || 0) > 0) hist.firstFeastDay = day;
      if (!hist.surgeUsedDay) { try { const sp = (G.state.scholar || {}).prog || {}; if (sp.feastSurgeUsed) hist.surgeUsedDay = day; } catch (e) {} }
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  try {
    // KIND FILTER (allowgate5 2026-10-15): the tele death stream mixes
    // villager deaths (kind person/villager) with monster/enemy kills.
    // Death-cause shares and starvation count villagers only — the
    // scholar's own death rides player:true (ledger.js playerDeath).
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.kind || '?');
      if (k !== 'person' && k !== 'villager' && !d.player) continue;
      const c = String(d.cause || d.kind || 'unknown');
      deaths[c] = (deaths[c] || 0) + 1;
    }
  } catch (e) {}
  let villagerDays = 0;
  // samples.pop is recorded every 10 loop-days (sampleEvery: 10), so each
  // sample represents ~10 villager-days. Same convention both sides — the
  // rot/villager-day guardrail is a relative comparison, unaffected.
  try { for (const row of (result.samples.pop || [])) villagerDays += (row[1] || 0) * 10; } catch (e) {}
  let hungry = 0, exiled = 0, seat = 'none', sentimentTaught = 0, feastSurgeUsed = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { seat = (Game.tableSeat ? Game.tableSeat().seat : 'none') || 'none'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; sentimentTaught = pg.sentimentTaught ? 1 : 0; } catch (e) {}
  try { const sp = (Game.state.scholar || {}).prog || {}; feastSurgeUsed = sp.feastSurgeUsed ? 1 : 0; } catch (e) {}
  const foodDeeds = (sentimentTaught && feastSurgeUsed) ? 1 : 0; // the food-deed rung (progression.js/table.js)
  let standing = { total: 0, war: 0, diplomacy: 0, plenty: 0 };
  try { const st = Game.villageStanding ? Game.villageStanding() : null; if (st) standing = { total: st.total | 0, war: st.war | 0, diplomacy: st.diplomacy | 0, plenty: st.plenty | 0 }; } catch (e) {}
  let realm = 0;
  try { realm = (Game._havenPolity && Game._havenPolity()) ? 1 : 0; } catch (e) {}
  const starveDeaths = deaths.starvation || 0;
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1, wave4: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0, wave5: (result.maxWaveUnlocked || 1) >= 5 ? 1 : 0,
    maxArc: hist.maxArc, maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0, realm: Math.max(realm, hist.everRealm),
    table: (hist.everTable || end.tableWaiting) ? 1 : 0, seat, everSeat: hist.everSeat,
    foodDeeds, attributed: foodDeeds, sentimentTaught, feastSurgeUsed,
    firstFeastDay: hist.firstFeastDay, surgeUsedDay: hist.surgeUsedDay,
    standing, deaths, starveDeaths, villagerDays, hungryDays: hungry,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    fsFeasts: (runCtx && runCtx.fsFeasts) || 0, fsArmedFeasts: (runCtx && runCtx.fsArmedFeasts) || 0,
    ag2GateHeld: (runCtx && runCtx.ag2GateHeld) || 0,
  };
}

function aggregate(runs) {
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const starve = runs.reduce((t, r) => t + r.starveDeaths, 0);
  const vd = runs.reduce((t, r) => t + r.villagerDays, 0);
  const rot = runs.reduce((t, r) => t + r.rotFresh + r.rotPreserved, 0);
  const deaths = {};
  for (const r of runs) for (const k of Object.keys(r.deaths)) deaths[k] = (deaths[k] || 0) + r.deaths[k];
  const seats = runs.filter(r => r.everSeat !== 'none').map(r => `${r.policy}-s${r.seed}:${r.everSeat}`);
  const standing = { total: 0, war: 0, diplomacy: 0, plenty: 0 };
  for (const r of runs) { standing.total += r.standing.total; standing.war += r.standing.war; standing.diplomacy += r.standing.diplomacy; standing.plenty += r.standing.plenty; }
  const byPid = {};
  for (const r of runs) {
    const p = byPid[r.policy] || (byPid[r.policy] = { pid: r.policy, n: 0, national: 0, table: 0, foodDeeds: 0, fsFeasts: 0, ag2GateHeld: 0, starveDeaths: 0 });
    p.n++; p.national += r.national; p.table += r.table; p.foodDeeds += r.foodDeeds;
    p.fsFeasts += r.fsFeasts; p.ag2GateHeld += r.ag2GateHeld; p.starveDeaths += r.starveDeaths;
  }
  return {
    n: runs.length,
    survivalDays: daysArr,
    medianSurvival: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    maxSurvival: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    national: runs.reduce((t, r) => t + r.national, 0),
    realm: runs.reduce((t, r) => t + r.realm, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    wins: runs.reduce((t, r) => t + r.won, 0),
    exiled: runs.reduce((t, r) => t + r.exiled, 0),
    foodDeeds: runs.reduce((t, r) => t + r.foodDeeds, 0),
    attributed: runs.reduce((t, r) => t + r.attributed, 0),
    seats,
    wave4: runs.filter(r => r.wave4).length, wave5: runs.filter(r => r.wave5).length,
    maxWave: Math.max.apply(null, runs.map(r => r.waveReach).concat([1])),
    maxArc: Math.max.apply(null, runs.map(r => r.maxArc).concat([1])),
    starveDeaths: starve, villagerDays: vd, hungryDays: runs.reduce((t, r) => t + r.hungryDays, 0),
    rotFresh: runs.reduce((t, r) => t + r.rotFresh, 0), rotPreserved: runs.reduce((t, r) => t + r.rotPreserved, 0),
    rotTotal: rot, rotPerVd: vd > 0 ? +(rot / vd).toFixed(2) : 0,
    fsFeasts: runs.reduce((t, r) => t + r.fsFeasts, 0),
    fsArmedFeasts: runs.reduce((t, r) => t + r.fsArmedFeasts, 0),
    ag2GateHeld: runs.reduce((t, r) => t + r.ag2GateHeld, 0),
    standing, deaths, perPid: Object.keys(byPid).sort().map(k => byPid[k]),
  };
}

// SMOKE: instrument-honesty gate (#69) — unwrap + live drive, per side.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] named-export unwrap: daily is a function`, base && typeof base.daily === 'function', 'typeof=' + (base && typeof base.daily));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s)`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'ag5-smoke-' + pid, fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    let policyActs = 0;
    try {
      for (const row of (result.pacing.perDay || [])) {
        for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
      }
    } catch (e) {}
    check(`[${pid}] harness invokes policy.daily (meanCalls/day>0)`, meanCalls > 0, 'mean=' + meanCalls);
    check(`[${pid}] >=1 policy-origin deliberate act`, policyActs > 0, 'policyActs=' + policyActs);
  }
  console.log(fails.length ? `\nSMOKE STOP: ${fails.length} failure(s)` : `\nSMOKE GREEN ag5 ${ARMED_SIDE ? 'ARMED' : 'CONTROL'} — policies genuinely drive`);
  process.exit(fails.length ? 1 : 0);
}

if (process.env.SMOKE === '1') { smokeGate(); return; }

(async () => {
  const SIDE = process.env.SIDE || 'armed';
  const SEEDS = (process.env.SEEDS || '101,202,303,404,606,707,808,909').split(',').map(s => parseInt(s.trim(), 10));
  const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim());
  const DAYS = parseInt(process.env.DAYS || '180', 10);
  const OUT = process.env.OUT || ('evidence/2026-10-15/ag5-' + SIDE + '.json');
  const PERSEED = OUT.replace(/\.json$/, '-perseed');
  try { fs.mkdirSync(PERSEED, { recursive: true }); } catch (e) {}
  const layerOn = process.env.FEASTSCALE_R13 === '1';
  const gateOn = process.env.ALLOWGATE2 === '1';
  if (!layerOn) { console.error('FEASTSCALE_R13=1 required on both sides — refusing to run'); process.exit(1); }
  if (SIDE === 'control' && gateOn) { console.error('SIDE=control requires ALLOWGATE2 unset — refusing to run'); process.exit(1); }
  if (SIDE === 'armed' && !gateOn) { console.error('SIDE=armed requires ALLOWGATE2=1 — refusing to run'); process.exit(1); }
  console.log(`ALLOWGATE4 sweep SIDE=${SIDE} (FEASTSCALE_R13=1 ALLOWGATE2=${process.env.ALLOWGATE2 || 'unset'}) seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${DAYS}`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await oneRun(seed, pid, DAYS);
      runs.push(r);
      fs.writeFileSync(PERSEED + `/ag5-${SIDE}-${pid}-s${seed}.json`, JSON.stringify(r, null, 1));
      console.log(`  [${pid} s${seed}] d=${r.days} ${r.endReason} starve=${r.starveDeaths} hungry=${r.hungryDays} rot=${r.rotFresh + r.rotPreserved} feasts=${r.fsFeasts} holds=${r.ag2GateHeld} nat=${r.national} realm=${r.realm} tab=${r.table} w=${r.waveReach} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  const agg = aggregate(runs);
  agg.side = SIDE; agg.seeds = SEEDS; agg.policies = POLICIES; agg.days = DAYS;
  agg.armed = SIDE === 'armed';
  fs.writeFileSync(OUT, JSON.stringify({ label: 'allowgate5', armed: SIDE === 'armed', seeds: SEEDS, days: DAYS, aggregate: agg, runs }, null, 1));
  console.log(`\nAGG [${SIDE}]: n=${agg.n} starve=${agg.starveDeaths} hungry=${agg.hungryDays} rot/vd=${agg.rotPerVd}` +
    ` feasts=${agg.fsFeasts} holds=${agg.ag2GateHeld} medD=${agg.medianSurvival} maxD=${agg.maxSurvival}` +
    ` nat=${agg.national} realm=${agg.realm} tab=${agg.table} won=${agg.wins} exiled=${agg.exiled}` +
    ` w4=${agg.wave4} w5=${agg.wave5} deeds=${agg.foodDeeds}`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
