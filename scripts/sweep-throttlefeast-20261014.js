#!/usr/bin/env node
// scripts/sweep-throttlefeast-20261014.js — throttle x feast-road interaction arm
// (fleshout-b, 2026-10-14). MEASUREMENT ONLY — no game-code changes.
//
// Question: does the landed production-throttle (game.js prodThrottleEngaged(),
// pantry > 4 fresh days -> duty forage/garden/fish redirected to wood/water/
// stone) starve the feast/plenty road (major feasts need surplus)? The feast
// affordability gate requires pantry >= cost x 1.5, so a throttle that caps
// the pantry at ~4 fresh days could plausibly choke feasts.
//
// ARMS (policy FIXED = leadfeast = leadcourt + FEASTSCALE_R13=1):
//   throttle-OFF: instrument wraps Game.prodThrottleEngaged() to () => false
//                 (THROTTLE_OFF=1). In-tree only via this wrap; game.js never
//                 touched, nothing to commit, nothing to revert.
//   throttle-ON:  as landed (afb736e6), prodThrottleEngaged() = freshDays > 4.
// Identical seeds both sides.
//
// Pre-registered (evidence/2026-10-14/sim-throttlefeast-b.md header):
//   PRIMARY: mean feasts/run (hostFeast ok) + mean plenty-max/run
//            (villageStanding().plenty max over the run).
//   GO   = ON mean feasts >= OFF mean - 2 AND ON mean plenty-max >= OFF mean - 20.
//   KILL = either primary misses (the throttle regresses the feast road;
//          documented as a finding, not silently tuned).
//   GUARDRAILS: wall-neutral national (>= OFF - 2), median survival within
//          +-10d, hungryDays delta <= +1.
//   Horizon: 180d death-aware. Why: feast/plenty are late-chain metrics.
//   Seeds: 11,22,33,44,55,66,77,88 (8), identical both sides.
//
// Usage:
//   SMOKE=1 node scripts/sweep-throttlefeast-20261014.js                      # gate
//   THROTTLE_OFF=1 LEVER=throttlefeast-off PERSEED_DIR=evidence/2026-10-14/throttlefeast-per-seed DAYS=180 OUT=/tmp/tf-off.json node scripts/sweep-throttlefeast-20261014.js
//   LEVER=throttlefeast-on  PERSEED_DIR=evidence/2026-10-14/throttlefeast-per-seed DAYS=180 OUT=/tmp/tf-on.json  node scripts/sweep-throttlefeast-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { attachFeast, finalizeFeast } = require('./sweep-feastscale-20261013');

process.env.FEASTSCALE_R13 = '1';

const POLICY_REGISTRY = { leadfeast };
const THROTTLE_OFF = process.env.THROTTLE_OFF === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

function standingRow(Game) {
  try {
    const s = Game.villageStanding();
    return { total: s.total | 0, war: s.war | 0, diplomacy: s.diplomacy | 0, plenty: s.plenty | 0, feasts: s.feasts | 0 };
  } catch (e) { return null; }
}

function instrument(Game) {
  const W = { redirects: 0, hungry: 0 };
  // THROTTLE-OFF ARM: neutralize the landed gate post-load. Game is a
  // per-load singleton; resolveOneAssignment reads this.prodThrottleEngaged()
  // off `this`, so this own-property assignment redirects the call. This is
  // the ONLY delta between the two arms; game.js is untouched on disk.
  if (THROTTLE_OFF) Game.prodThrottleEngaged = function () { return false; };
  // Redirect + beat capture: count engages, keep feast/pantry beats for
  // sense-testing (max 60 kept, oldest dropped).
  const beats = [];
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (t) {
    try { if (/feast|pantry|leaves the/i.test(String(t))) { beats.push(String(t)); if (beats.length > 60) beats.shift(); } } catch (e) {}
    return oSay.apply(this, arguments);
  };
  return { W, beats };
}

function wave4Faced(Game) {
  try { return (Game.waveEngaged && Game.waveEngaged(4) > 0) || false; } catch (e) { return false; }
}

async function oneRun(seed, days) {
  const base = POLICY_REGISTRY.leadfeast;
  const { Game } = await loadGame({ seed, mode: 'throttlefeast-' + (THROTTLE_OFF ? 'off' : 'on'), fullTelemetry: false });
  await setupGame(Game);
  const { W, beats } = instrument(Game);
  const ft = attachFeast(Game);
  const st = { max: { total: 0, war: 0, diplomacy: 0, plenty: 0, feasts: 0 } };
  const origDaily = base.daily;
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    try {
      const r = standingRow(G);
      if (r) for (const k of Object.keys(st.max)) if (r[k] > st.max[k]) st.max[k] = r[k];
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const feas = finalizeFeast(Game, ft);
  const fin = standingRow(Game) || { total: 0, plenty: 0, feasts: 0 };
  let redirects = 0, hungry = 0, exiled = 0;
  try { redirects = (Game.state.village || {}).throttleRedirects || 0; } catch (e) {}
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const deaths = [];
  try { for (const d of (result.samples.deaths || [])) deaths.push({ kind: String(d.cause || d.kind || 'unknown'), player: !!d.player }); } catch (e) {}
  return {
    policy: 'leadfeast', throttle: THROTTLE_OFF ? 'off' : 'on', seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    wave5: (feas.unlockedWave >= 5) ? 1 : 0, wave4: (feas.unlockedWave >= 4) ? 1 : 0,
    wave4Faced: wave4Faced(Game) ? 1 : 0,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    feasts: feas.feasts, armedFeasts: feas.armedFeasts, grants: feas.grants,
    feastSurgeUsed: feas.feastSurgeUsed ? 1 : 0,
    plentyMax: st.max.plenty, plentyFinal: fin.plenty, standingMax: st.max.total,
    t4: st.max.total >= 100 ? 1 : 0, t5: st.max.total >= 200 ? 1 : 0,
    redirects, hungryDays: hungry, deaths, beats,
  };
}

function aggregate(runs) {
  const n = runs.length;
  const mean = (f) => n ? runs.reduce((t, r) => t + f(r), 0) / n : 0;
  const da = runs.map(r => r.days).sort((a, b) => a - b);
  return {
    n,
    meanFeasts: +mean(r => r.feasts).toFixed(2),
    meanPlentyMax: +mean(r => r.plentyMax).toFixed(1),
    totalFeasts: runs.reduce((t, r) => t + r.feasts, 0),
    totalGrants: runs.reduce((t, r) => t + r.grants, 0),
    totalRedirects: runs.reduce((t, r) => t + r.redirects, 0),
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    won: runs.reduce((t, r) => t + r.won, 0),
    exiled: runs.reduce((t, r) => t + r.exiled, 0),
    wave4: runs.reduce((t, r) => t + r.wave4, 0),
    wave5: runs.reduce((t, r) => t + r.wave5, 0),
    wave4Faced: runs.reduce((t, r) => t + r.wave4Faced, 0),
    t4: runs.reduce((t, r) => t + r.t4, 0),
    t5: runs.reduce((t, r) => t + r.t5, 0),
    medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
    maxDays: da.length ? da[da.length - 1] : 0,
    hungryDays: runs.reduce((t, r) => t + r.hungryDays, 0),
  };
}

// INSTRUMENT-HONESTY GATE (sim-findings #99, measure-prodthrottle pattern):
// SMOKE=1 fails loudly unless the policy genuinely drives the suite.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  const base = POLICY_REGISTRY.leadfeast;
  check('[leadfeast] unwrapped policy.daily is a function', base && typeof base.daily === 'function', 'typeof=' + (base && typeof base.daily));
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  let dailyCalls = 0;
  const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
  const { Game } = await loadGame({ seed: 11, mode: 'throttlefeast-smoke', fullTelemetry: false });
  await setupGame(Game);
  const ft = attachFeast(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  let policyActs = 0;
  try {
    for (const row of (result.pacing.perDay || [])) {
      for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
    }
  } catch (e) {}
  check('[leadfeast] harness invoked policy.daily (calls=' + dailyCalls + ')', dailyCalls > 0, 'days=' + result.days);
  check('[leadfeast] policyCalls pacing > 0 (mean=' + meanCalls + '/day)', meanCalls > 0);
  check('[leadfeast] >=1 policy-origin deliberate act (policyActs=' + policyActs + ')', policyActs > 0);
  // throttle-arm honesty: the wrap form used by the OFF arm must exist and be
  // reachable on the loaded Game object.
  check('[arm] Game.prodThrottleEngaged is a function on the loaded Game',
    typeof Game.prodThrottleEngaged === 'function', 'typeof=' + typeof Game.prodThrottleEngaged);
  if (fails.length) { console.log('\nSMOKE STOP: ' + fails.length + ' failure(s) — policy present but not driving.'); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, throttle wrap reachable — safe to measure. THROTTLE_OFF=' + (THROTTLE_OFF ? '1' : '0'));
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || ('throttlefeast-' + (THROTTLE_OFF ? 'off' : 'on'));
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const beatsDir = process.env.BEATS_DIR || null;
  console.log(`ARM throttle=${THROTTLE_OFF ? 'OFF' : 'ON'} policy=leadfeast FEASTSCALE_R13=${process.env.FEASTSCALE_R13} seeds=${seeds.join(',')} days=${days}`);
  const rows = [];
  for (const seed of seeds) {
    const r = await oneRun(seed, days);
    rows.push(r);
    console.log(`  [s${seed}] d=${r.days} ${r.endReason} feasts=${r.feasts} grants=${r.grants} plentyMax=${r.plentyMax} finP=${r.plentyFinal} stand=${r.standingMax} t4/t5=${r.t4}/${r.t5} w4=${r.wave4}(f:${r.wave4Faced}) w5=${r.wave5} nat=${r.national} tab=${r.table} redir=${r.redirects} hungry=${r.hungryDays}`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n} throttle=${THROTTLE_OFF ? 'off' : 'on'}`);
  console.log(`meanFeasts=${agg.meanFeasts} meanPlentyMax=${agg.meanPlentyMax} totalFeasts=${agg.totalFeasts} grants=${agg.totalGrants} redirects=${agg.totalRedirects}`);
  console.log(`nat=${agg.national} tab=${agg.table} won=${agg.won} exiled=${agg.exiled} w4=${agg.wave4} w5=${agg.wave5} w4faced=${agg.wave4Faced} medD=${agg.medianDays} maxD=${agg.maxDays} hungry=${agg.hungryDays}`);
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, throttle: THROTTLE_OFF ? 'off' : 'on', seeds, days, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      fs.writeFileSync(`${perSeedDir}/${label}-s${r.seed}.json`, JSON.stringify({
        label, policy: r.policy, throttle: r.throttle, seed: r.seed, days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, wave4: r.wave4, wave5: r.wave5, wave4Faced: r.wave4Faced,
        maxArc: r.maxArc, maxRank: r.maxRank,
        feasts: r.feasts, grants: r.grants, armedFeasts: r.armedFeasts,
        plentyMax: r.plentyMax, plentyFinal: r.plentyFinal, standingMax: r.standingMax,
        t4: r.t4, t5: r.t5, redirects: r.redirects, hungryDays: r.hungryDays,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
  if (beatsDir) {
    fs.mkdirSync(beatsDir, { recursive: true });
    for (const r of rows) {
      fs.writeFileSync(`${beatsDir}/${label}-s${r.seed}.json`, JSON.stringify({ seed: r.seed, throttle: r.throttle, feasts: r.feasts, beats: r.beats }, null, 1));
    }
    console.error('wrote ' + rows.length + ' beat files to ' + beatsDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { oneRun, aggregate };
