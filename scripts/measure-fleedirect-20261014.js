#!/usr/bin/env node
// scripts/measure-fleedirect-20261014.js — DIRECTIONAL-FLEE (r26) pilot measurement.
//
// Pre-registered (evidence/2026-10-14/sim-fleedirect.md header):
//   PRIMARY: median survival days, armed >= control + 7d (180d death-aware,
//     identical seeds 11/22/33/44/55/66/77/88 x leadfeast).
//   GUARDRAILS: national armed >= control - 4 (perturbation-aware);
//     starvation deaths armed <= control + 2; no new death mode;
//     combat-death share reported.
//   CONTROL: FLEEDIRECT unset (legacy flee). ARMED: FLEEDIRECT=1.
//   Same code tree, identical seeds, env-var only.
//   A miss is NO-GO — never re-scored against a friendlier metric mid-run.
//
// Usage:
//   SIDE=control OUT=evidence/2026-10-14/fleedirect-control.json \
//     node scripts/measure-fleedirect-20261014.js
//   SIDE=armed OUT=evidence/2026-10-14/fleedirect-armed.json \
//     FLEEDIRECT=1 node scripts/measure-fleedirect-20261014.js
//   SMOKE=1 node scripts/measure-fleedirect-20261014.js   # instrument gate
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const POLICY_REGISTRY = {
  // named-export unwrap only (#69: Object.assign({}, require(...)) leaves
  // policy.daily undefined and the suite silently runs policy-less).
  leadfeast: require('./policies/feastscale').leadfeast,
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'fleedirect-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = base.daily;
  const fd = { checks: 0, pushes: 0, held: 0, walks: 0, fled: 0, byReason: {}, holdReasons: {}, _p: 0, _h: 0 };
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    // fleedirect telemetry accumulates on the run ctx — snapshot the latest,
    // attributing push/hold deltas to the current reason.
    try {
      if (ctx) {
        const pushes = ctx.fleeDirectPushes || 0, held = ctx.fleeDirectHeld || 0;
        const dp = pushes - (fd._p || 0), dh = held - (fd._h || 0);
        if (dp > 0) { const r = ctx.fleeDirectReason || 'unknown'; fd.byReason[r] = (fd.byReason[r] || 0) + dp; }
        if (dh > 0) { const r = ctx.fleeDirectHoldReason || 'unknown'; fd.holdReasons[r] = (fd.holdReasons[r] || 0) + dh; }
        fd._p = pushes; fd._h = held;
        fd.checks = ctx.fleeDirectChecks || 0;
        fd.pushes = pushes; fd.held = held;
        fd.walks = ctx.fleeDirectWalks || 0;
        fd.fled = ctx.fled || 0;
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let villagerDays = 0;
  try { for (const row of (result.samples.pop || [])) villagerDays += (row[1] || 0); } catch (e) {}
  // fleedirect telemetry is on the run ctx — recover it from the last daily ctx.
  // runDays does not expose ctx, so re-derive from the policy wrapper: the
  // harness calls policy.daily(G, ctx) with one ctx per run; capture it.
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, villagerDays,
    fd: { checks: fd.checks, pushes: fd.pushes, held: fd.held, walks: fd.walks,
          byReason: fd.byReason, holdReasons: fd.holdReasons },
  };
}

function aggregate(runs) {
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const n = runs.length;
  const mid = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
  const deaths = {};
  for (const r of runs) for (const k of Object.keys(r.deaths)) deaths[k] = (deaths[k] || 0) + r.deaths[k];
  const totalDeaths = Object.values(deaths).reduce((a, b) => a + b, 0);
  const combatDeaths = Object.keys(deaths).filter(k => /combat|fight|monster|kill/i.test(k))
    .reduce((t, k) => t + deaths[k], 0);
  const vd = runs.reduce((t, r) => t + r.villagerDays, 0);
  const fdT = { checks: 0, pushes: 0, held: 0, walks: 0, byReason: {}, holdReasons: {} };
  for (const r of runs) {
    const f = r.fd || {};
    fdT.checks += f.checks || 0; fdT.pushes += f.pushes || 0; fdT.held += f.held || 0; fdT.walks += f.walks || 0;
    for (const k of Object.keys(f.byReason || {})) fdT.byReason[k] = (fdT.byReason[k] || 0) + f.byReason[k];
    for (const k of Object.keys(f.holdReasons || {})) fdT.holdReasons[k] = (fdT.holdReasons[k] || 0) + f.holdReasons[k];
  }
  return {
    n,
    medianDays: mid,
    maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    days: daysArr,
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    wins: runs.reduce((t, r) => t + r.won, 0),
    wave4: runs.filter(r => r.waveReach >= 4).length,
    wave5: runs.filter(r => r.waveReach >= 5).length,
    maxWave: Math.max.apply(null, runs.map(r => r.waveReach).concat([1])),
    maxArc: Math.max.apply(null, runs.map(r => r.maxArc).concat([1])),
    deaths, totalDeaths,
    starveDeaths: deaths.starvation || 0,
    combatDeaths,
    combatDeathShare: totalDeaths ? +(combatDeaths / totalDeaths).toFixed(3) : 0,
    villagerDays: vd,
    deathModes: Object.keys(deaths).sort(),
    fleedirect: fdT,
  };
}

// INSTRUMENT-HONESTY GATE: SMOKE=1 runs a short live smoke BEFORE any sweep
// spend and FAILS LOUDLY unless (a) the policy is genuinely driving
// (unwrapped daily is a function; harness invokes it; >=1 policy-origin
// deliberate act fires) and (b) with FLEEDIRECT=1 the layer actually fires
// through the policy's fight path (fleeDirectChecks > 0 in a scripted
// disengage). The r20b lesson: a policy-less run silently measures nothing.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  const base = POLICY_REGISTRY.leadfeast;
  check('unwrapped policy.daily is a function', base && typeof base.daily === 'function',
    'typeof=' + (base && typeof base.daily));
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  let dailyCalls = 0;
  const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
  const { Game } = await loadGame({ seed: 11, mode: 'fleedirect-smoke', fullTelemetry: false });
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
  check('harness invokes policy.daily (meanCalls/day>0)', meanCalls > 0, 'mean=' + meanCalls);
  check('>=1 policy-origin deliberate act', policyActs > 0, 'policyActs=' + policyActs);
  // (b) the layer fires: scripted disengage with FLEEDIRECT=1.
  process.env.FLEEDIRECT = '1';
  const { competent } = require('./policies/competent');
  const { Game: G2 } = await loadGame({ seed: 12, mode: 'fleedirect-smoke2' });
  await setupGame(G2);
  G2.map.px = 4; G2.map.py = 6;
  G2.state.scholar.seenTiles = {};
  try { G2.worldMonsters().length = 0; G2.worldMonsters().push({ id: 'smoke_mon', tx: 4, ty: 5, hp: 50, maxHp: 50 }); } catch (e) {}
  const s2 = G2.state.scholar;
  s2.health = 100; s2.kcal = 400; s2.hydration = 80; s2.energy = 100; s2.trauma = 0;
  G2.startCombat('hushwolf');
  let checks = 0;
  if (G2.tbfight) {
    const mo = G2.tbfight.fighters.find(x => x.kind === 'monster');
    if (mo) { mo.hp = 300; mo.maxHp = 300; }
    const p0 = G2.tbFighter('p');
    if (p0) { p0.hp = 20; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true; }
    const ctx = {};
    let n = 0;
    while (G2.tbfight && !G2.tbfight.over && n++ < 3 && !G2.over) {
      if (!G2.tbIsPlayerTurn()) break;
      try { competent.fight(G2, ctx); } catch (e) { break; }
      if ((ctx.fleeDirectChecks || 0) >= 1) break;
    }
    checks = ctx.fleeDirectChecks || 0;
  }
  check('FLEEDIRECT=1: the layer fires through the fight path (fleeDirectChecks>0)',
    checks > 0, 'checks=' + checks);
  delete process.env.FLEEDIRECT;
  console.log(fails.length ? `\nSMOKE STOP: ${fails.length} failure(s)` : '\nSMOKE GREEN — policy genuinely drives, fleedirect layer fires');
  process.exit(fails.length ? 1 : 0);
}

async function main() {
  const side = process.env.SIDE || 'control';
  const out = process.env.OUT;
  if (!out) { console.error('OUT required'); process.exit(2); }
  console.log(`fleedirect pilot: side=${side} FLEEDIRECT=${process.env.FLEEDIRECT || '(unset)'}`);
  const runs = [];
  for (const seed of SEEDS) {
    const r = await oneRun(seed, 'leadfeast', 180);
    runs.push(r);
    console.log(`  seed ${seed}: days=${r.days} end=${r.endReason} national=${r.national} wave=${r.waveReach} arc=${r.maxArc} deaths=${JSON.stringify(r.deaths)}`);
  }
  const agg = aggregate(runs);
  const payload = { side, fleedirect: process.env.FLEEDIRECT || null, seeds: SEEDS, agg, runs };
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log('wrote ' + out);
  console.log(JSON.stringify(agg, null, 2));
}

if (process.env.SMOKE === '1') { smokeGate(); return; }
main().catch(e => { console.error('FATAL', e); process.exit(1); });
