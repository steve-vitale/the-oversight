#!/usr/bin/env node
// scripts/measure-fameredirect2-20261016.js — FAMEREDIRECT2 pilot measurement
// (fleshout-b, 2026-10-16). Revival of the killed FAMINEREDIRECT arm
// (evidence/2026-10-14/sim-famredirect-b.md): wood/stone→food redirect at
// <2 fresh pantry days, POLICY-SIDE ONLY (zero src/js), with the killed
// arm's mechanism fix — WATER duties are NEVER redirected.
//
// SUBSTRATE: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 explicit. Stack:
//   withFamineRedirect2(feastscale.leadfeast / belongfeast).
// CONTROL = FAMREDIRECT2 unset (delegation path the proof pins
// byte-identical to bare leadcourt; mechanism provably inert —
// fam2Ledger.redirects === 0 all runs).
// ARMED = FAMREDIRECT2=1.
//
// PRE-REGISTERED (evidence header, §§9–12 + 14 binding — a miss is NO-GO,
// never re-scored mid-run):
//   PRIMARY   = starvation deaths per 100 villager-days (sp100vd), summed
//               over the 16-run suite. GO = armed <= control x 0.6 (relative
//               bar — the killed arm's lesson: absolute A/A bars don't
//               transfer across rate regimes; famredirect pilot control was
//               0.141, armed 0.161).
//   GUARDRAILS: thirst deaths <= control + 2 (the killed arm's mechanism,
//               now a named guardrail); national >= control - 2;
//               median survival >= control - 10d; exiled unchanged
//               (<= control); no NEW death mode (death-cause keys in armed
//               must be a subset of control's keys, modulo zero-count keys).
//   ABANDONED DUTY'S COST (finding's demand): measure wood stockpile delta
//               (start vs end, armed vs control) and name fire/palisade
//               consequences in the village assessment — report-only, never
//               a guardrail.
//   KILL: primary misses, or any guardrail binds.
//   HORIZON: 180d death-aware (dead villages stop, +10d tail max).
//   SEEDS: 11/22/33/44/55/66/77/88 x leadfeast/belongfeast, 16 runs/side,
//          IDENTICAL seeds both sides (own paired control — same substrate).
//   INSTRUMENT HONESTY: SMOKE=1 gate before sweep spend (fail loudly if
//          policy-less); per-side shape assertion (control: env unset +
//          mechanism provably inert; armed: env set + redirect fires in
//          >=1 run across the pilot — else the lever is inert and the pilot
//          is a NO-GO for a different reason).
//
// Usage:
//   FAM2_SIDE=control SMOKE=1 node scripts/measure-fameredirect2-20261016.js
//   FAM2_SIDE=control SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadfeast,belongfeast" \
//     DAYS=180 OUT=evidence/2026-10-16/fameredirect2-control.json \
//     PERSEED_DIR=evidence/2026-10-16/fameredirect2-control-perseed \
//     FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/measure-fameredirect2-20261016.js
//   FAM2_SIDE=armed FAMREDIRECT2=1 ...same... node scripts/measure-fameredirect2-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FEAST = require('./policies/feastscale');
const FAM2 = require('./policies/fameredirect2');

// SUBSTRATE GATES (fail loudly — the comparison is only honest on the
// named substrate).
if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('SWEEP STOP: FEASTSCALE_R13=1 is required (courtship substrate).');
  process.exit(2);
}
if (process.env.SEATDRIVE !== '0') {
  console.error('SWEEP STOP: SEATDRIVE=0 is required (explicit pre-seat substrate).');
  process.exit(2);
}

const SIDE = (process.env.FAM2_SIDE || 'control').trim();
// The env gate is the side selector. Force it decisively so a leaked shell
// env can never silently flip a side.
if (SIDE === 'armed') process.env.FAMREDIRECT2 = '1';
else delete process.env.FAMREDIRECT2;

const BASE = {
  leadfeast: FEAST.leadfeast,
  belongfeast: FEAST.belongfeast,
};
// One shared stack both sides — the FAMREDIRECT2 env gate is the ONLY
// switch (mirrors the seatdrive composition pattern: wrap once, gate at
// runtime). Control exercises the delegation path the proof pins
// byte-identical to the bare base.
function policyFor(pid) {
  return FAM2.withFamineRedirect2(BASE[pid], pid + '+fameredirect2',
    pid + ' + famine-shift layer (FAMREDIRECT2=1): wood/stone→food below 2 fresh days; water never redirected');
}
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}

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

function woodStock(Game) {
  try { return (Game.state.village || {}).wood || 0; } catch (e) { return 0; }
}

async function oneRun(seed, pid, days) {
  const base = policyFor(pid);
  const { Game } = await loadGame({ seed, mode: 'fameredirect2-' + SIDE + '-' + pid, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const woodStart = woodStock(Game);
  const W = instrument(Game);
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWaveSeen: 1 };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.arc >= 2) hist.maxWaveSeen = Math.max(hist.maxWaveSeen, 2);
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  let starveDeaths = 0, thirstDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (d.cause === 'starvation' && (d.kind === 'villager' || d.kind === 'person') && !d.player) starveDeaths++;
      if (d.cause === 'thirst' && (d.kind === 'villager' || d.kind === 'person') && !d.player) thirstDeaths++;
    }
  } catch (e) {}
  // villager-days: pop snapshots are every 10 days; subtract one scholar-day
  // per game day. Identical seeds make the approximation symmetric.
  let villagerDays = 0;
  try {
    for (const row of (result.samples.pop || [])) villagerDays += (row[1] || 0) * 10;
    villagerDays = Math.max(1, villagerDays - (result.gameDays || 0));
  } catch (e) {}
  let hungry = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const ledger = (Game.state.village || {}).fam2Ledger || {};
  const woodEnd = woodStock(Game);
  const waveReach = result.maxWaveUnlocked || hist.maxWaveSeen || 1;
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths, thirstDeaths, villagerDays,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    hungryDays: hungry, fam2Ledger: ledger,
    woodStart, woodEnd, woodDelta: woodEnd - woodStart,
  };
}

function aggregate(runs) {
  const starveDeaths = runs.reduce((t, r) => t + (r.starveDeaths || 0), 0);
  const thirstDeaths = runs.reduce((t, r) => t + (r.thirstDeaths || 0), 0);
  const villagerDays = runs.reduce((t, r) => t + (r.villagerDays || 0), 0);
  const sp100vd = 100 * starveDeaths / Math.max(1, villagerDays);
  const tp100vd = 100 * thirstDeaths / Math.max(1, villagerDays);
  const rotFresh = runs.reduce((t, r) => t + r.rotFresh, 0);
  const rotPreserved = runs.reduce((t, r) => t + r.rotPreserved, 0);
  const rotTotal = rotFresh + rotPreserved;
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const byPolicy = {};
  for (const pid of [...new Set(runs.map(r => r.policy))]) {
    const rs = runs.filter(r => r.policy === pid);
    const da = rs.map(r => r.days).sort((a, b) => a - b);
    const lsum = (k) => rs.reduce((t, r) => t + (((r.fam2Ledger || {})[k]) || 0), 0);
    byPolicy[pid] = {
      n: rs.length, won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
      maxDays: da.length ? da[da.length - 1] : 0,
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
      starveDeaths: rs.reduce((t, r) => t + (r.starveDeaths || 0), 0),
      thirstDeaths: rs.reduce((t, r) => t + (r.thirstDeaths || 0), 0),
      villagerDays: rs.reduce((t, r) => t + (r.villagerDays || 0), 0),
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      redirects: lsum('redirects'), redir_wood: lsum('redir_wood'), redir_stone: lsum('redir_stone'),
      signals: lsum('signals'), blockedAway: lsum('blockedAway'),
      rotFresh: rs.reduce((t, r) => t + r.rotFresh, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      woodStart: rs.reduce((t, r) => t + (r.woodStart || 0), 0),
      woodEnd: rs.reduce((t, r) => t + (r.woodEnd || 0), 0),
      woodDelta: rs.reduce((t, r) => t + (r.woodDelta || 0), 0),
    };
  }
  return {
    side: SIDE, n: runs.length, starveDeaths, thirstDeaths, villagerDays,
    sp100vd: +sp100vd.toFixed(3), tp100vd: +tp100vd.toFixed(3),
    rotFresh, rotPreserved, rotPerVDay: +(rotTotal / Math.max(1, villagerDays)).toFixed(1),
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    wins: runs.reduce((t, r) => t + r.won, 0),
    exiled: runs.reduce((t, r) => t + r.exiled, 0),
    redirects: runs.reduce((t, r) => t + (((r.fam2Ledger || {}).redirects) || 0), 0),
    woodDelta: runs.reduce((t, r) => t + (r.woodDelta || 0), 0),
    deathCauses: runs.reduce((o, r) => { for (const k of Object.keys(r.deaths || {})) o[k] = (o[k] || 0) + r.deaths[k]; return o; }, {}),
    byPolicy,
  };
}

// INSTRUMENT-HONESTY GATE: SMOKE=1 runs a short live smoke per policy BEFORE
// any pilot spend and FAILS LOUDLY unless the policy is genuinely driving:
// (1) policy.daily is a function after wrap; (2) the harness invokes it;
// (3) >=1 policy-origin deliberate act happens. Shape assertion differs by
// side: control must be provably inert (fam2Ledger.redirects === 0);
// armed must show the mechanism can fire (redirects >= 1 in a live run —
// the famine may not hit in 15 days on seed 11, so this asserts the signal
// path ran, and the suite-level assertion handles firing).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of Object.keys(BASE)) {
    const pol = policyFor(pid);
    check(`[${pid}] wrapped policy.daily is a function`, typeof pol.daily === 'function');
    check(`[${pid}] wrapped policy.upkeep is a function`, typeof pol.upkeep === 'function');
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} wrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(BASE)) {
    const pol = policyFor(pid);
    let dailyCalls = 0;
    const wrapped = Object.assign({}, pol, { daily(G, ctx) { dailyCalls++; return pol.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'fameredirect2-smoke-' + pid + '-' + SIDE, fullTelemetry: false });
    await quietLog(async () => { await setupGame(Game); });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    let policyActs = 0;
    try {
      for (const row of (result.pacing.perDay || [])) {
        for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
      }
    } catch (e) {}
    check(`[${pid}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    check(`[${pid}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
    check(`[${pid}] >=1 policy-origin deliberate act (policyActs=${policyActs})`, policyActs > 0);
    const ledger = (Game.state.village || {}).fam2Ledger || {};
    if (SIDE === 'control') {
      check(`[${pid}] control shape: mechanism provably inert (redirects=0)`, (ledger.redirects || 0) === 0,
        'redirects=' + (ledger.redirects || 0));
    } else {
      check(`[${pid}] armed shape: signal path ran (checked=${ledger.checked || 0})`, (ledger.checked || 0) > 0);
    }
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s) — fix before measuring.`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [11, 22, 33, 44, 55, 66, 77, 88]).filter(Number.isFinite);
  const pids = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']).filter(s => BASE[s]);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT;
  const perseed = process.env.PERSEED_DIR;
  if (perseed) fs.mkdirSync(perseed, { recursive: true });
  const runs = [];
  for (const pid of pids) {
    for (const seed of seeds) {
      console.log(`[fam2/${SIDE}] ${pid} seed ${seed} ...`);
      const r = await oneRun(seed, pid, days);
      runs.push(r);
      if (perseed) fs.writeFileSync(path.join(perseed, `${pid}-s${seed}.json`), JSON.stringify(r, null, 1));
      console.log(`  end d${r.days} (${r.endReason}) starve=${r.starveDeaths} thirst=${r.thirstDeaths} hungry=${r.hungryDays} redir=${(r.fam2Ledger || {}).redirects || 0} woodΔ=${r.woodDelta}`);
    }
  }
  const agg = aggregate(runs);
  console.log('\n=== AGGREGATE (' + SIDE + ') ===');
  console.log(JSON.stringify(agg, null, 1));
  if (out) fs.writeFileSync(out, JSON.stringify({ aggregate: agg, runs }, null, 1));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
