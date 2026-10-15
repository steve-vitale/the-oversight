#!/usr/bin/env node
// scripts/measure-belongfeast-20261015.js — SIM-BELONGFEAST diagnostic sweep
// (flesh-out loop B, 2026-10-15, food-economy axis — sim-findings #259).
//
// The instrument arm: rebuilds the overdrawfloor fresh-first drawdown layer
// from the preserved spec (scripts/policies/overdrawfloor.js, default OFF)
// and runs it on belongseek with per-villager meal telemetry
// (scripts/sharcensus-20261014.js pattern) + feast-drawdown event logging.
// It answers #259's named next: does the belong-road feast verb drive the
// starvation elevation, or is it innocent?
//
// Sides: control = belongseek (layer off), armed = overbelongfloor
// (OVERDRAWFLOOR=1). Own control in the SAME sweep — never inherited.
// SIDES=control|armed to run one side; default both.
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9-12, 14):
//   PRIMARY (diagnostic): share of starved villager-days (ate < 0.6*need,
//     the engine's own starvation branch condition) carrying a DETERMINED
//     cause class (feast-proximity <=3d after a feast drawdown, empty-pantry,
//     spoiled-insufficient, crumbs-left, away-pack-empty/short — anything
//     except the 'other-short' residual). GO threshold: >= 80% determined
//     AND a feast-proximity x starvation breakdown that answers #259.
//   SECONDARY: starvation deaths armed vs control (the breached guardrail),
//     hungryDays, feast event counts/kcal, wall numbers (national/table/wins,
//     wave reach, median survival), death-cause shares.
//   Horizon: 180d death-aware (the elevation appeared on this horizon in the
//     overdrawfloor pilot; dead villages stop +10d tail).
//   Seeds: 11/22/33/44/55/66/77/88 (the overdrawfloor cohort), identical both sides.
//   Det-gate: 8/8 bit-identical both sides first (r27 rule).
//   A miss is NO-GO per §14, never re-scored.
//
// INFO-SKIP: missing overdrawfloor layer -> exit 0, never MODULE_NOT_FOUND.
// A diagnostic miss (0 starved villager-days: the question is unanswerable)
// is also INFO-SKIP exit 0, not a failure.
//
// Usage:
//   SMOKE=1 node scripts/measure-belongfeast-20261015.js
//   LEVER=belongfeast SEEDS="11,22,33,44,55,66,77,88" DAYS=180 SIDES=control,armed \
//     OUT=evidence/2026-10-15/belongfeast-sweep.json \
//     PERSEED_DIR=evidence/2026-10-15/perseed-belongfeast \
//     TRANSCRIPT_DIR=evidence/2026-10-15/belongfeast-transcripts \
//     node scripts/measure-belongfeast-20261015.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.OVERDRAWFLOOR === '1';
let ODF = null;
try { ODF = require('./policies/overdrawfloor'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: overdrawfloor layer absent (killed lineage); diagnostic cannot run');
    process.exit(0);
  }
  throw e;
}
// NAMED-EXPORT UNWRAP (finding #69 gate): never Object.assign({}, require(...)).
const { overbelongfloor } = ODF;
const { belongseek } = require('./policies/belongseek');
const { installShareCensus, classify } = require('./sharcensus-20261014');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// ---- attribution: starved/hungry villager-days x feast-drawdown proximity ----
function attributeRun(rows, feastEvents) {
  const out = [];
  for (const row of rows) {
    const c = classify(row, {});
    let starveClass = c.starvePath, feastProx = false;
    if (c.starved) {
      for (const ev of feastEvents) {
        const dt = row.day - ev.day;
        if (dt >= 0 && dt <= 3) { feastProx = true; break; }
      }
      if (feastProx) starveClass = 'feast-proximity';
    }
    const hungryNV = !c.starved && (row.hungerAfter || 0) >= 70;
    out.push({ day: row.day, vid: row.vid, name: row.name,
               starved: c.starved, hungryNV, base: c.starvePath,
               starveClass, feastProx });
  }
  return out;
}

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed, side, days, tdir) {
  const base = side === 'armed' ? overbelongfloor : belongseek;
  const { Game } = await loadGame({ seed, mode: 'belongfeast-' + side, fullTelemetry: false });
  await setupGame(Game);
  // say-beat capture (sense-testing): feast + hunger-relevant beats, capped.
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/FEAST|feast|starv|hunger|grain|pantry|gorges at the treeline|RAID/i.test(s) &&
          beats.length < 6000) beats.push({ day: gday(Game), text: s.slice(0, 400) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const cen = installShareCensus(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  let hungryDays = 0;
  try { hungryDays = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  // feast telemetry from the layer ctx
  let osFeasts = 0, osFeastKcal = 0, osGateHeld = 0, osFragileHeld = 0;
  let feastEvents = [];
  try {
    if (runCtx) {
      osFeasts = runCtx.osFeasts || 0; osFeastKcal = runCtx.osFeastKcal || 0;
      osGateHeld = runCtx.osGateHeld || 0; osFragileHeld = runCtx.osFragileHeld || 0;
      feastEvents = (runCtx._odfFeastEvents || []).map(e => ({
        day: e.day, kcal: e.kcal, fdBefore: e.fdBefore, fdAfter: e.fdAfter }));
    }
  } catch (e) {}
  const attr = attributeRun(cen.rows, feastEvents);
  const starvedDays = attr.filter(a => a.starved);  const determined = starvedDays.filter(a => a.starveClass !== 'other-short');
  const feastProxStarved = starvedDays.filter(a => a.feastProx);
  const byClass = {};
  for (const a of starvedDays) byClass[a.starveClass] = (byClass[a.starveClass] || 0) + 1;
  const hungryNVDays = attr.filter(a => a.hungryNV).length;
  try { cen.uninstall(); } catch (e) {}
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(`${tdir}/${side}-s${seed}.txt`,
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  return {
    side, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths, hungryDays,
    villagerDays: attr.length,
    starvedDays: starvedDays.length,
    determined: determined.length,
    determinedShare: starvedDays.length ? determined.length / starvedDays.length : null,
    feastProxStarved: feastProxStarved.length,
    feastProxShare: starvedDays.length ? feastProxStarved.length / starvedDays.length : null,
    byClass, hungryNVDays,
    osFeasts, osFeastKcal, osGateHeld, osFragileHeld, feastEvents,
    rowsAttr: attr.map(a => ({ day: a.day, vid: a.vid, starved: a.starved,
      hungryNV: a.hungryNV, base: a.base, starveClass: a.starveClass, feastProx: a.feastProx })),
  };
}

// INSTRUMENT-HONESTY GATE (finding #69): the suite must never run policy-less.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  const base = ARMED ? overbelongfloor : belongseek;
  const side = ARMED ? 'armed' : 'control';
  check(`[${side}] named-export unwrap: policy.daily is a function`, typeof base.daily === 'function');
  check(`[${side}] policy id`, ARMED ? /^over/.test(base.id || '') : /^(belongseek)$/.test(base.id || ''), 'id=' + base.id);
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  let dailyCalls = 0;
  const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
  const { Game } = await loadGame({ seed: 11, mode: 'belongfeast-smoke', fullTelemetry: false });
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
  check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0, `days=${result.days}`);
  check(`[${side}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
  check(`[${side}] >=1 policy-origin deliberate act (policyActs=${policyActs})`, policyActs > 0);
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || 'belongfeast';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const sides = (process.env.SIDES || 'control,armed').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const tdir = process.env.TRANSCRIPT_DIR || null;
  const rows = [];
  for (const side of sides) for (const seed of seeds) {
    const r = await oneRun(seed, side, days, tdir);
    rows.push(r);
    console.log(`  [${side} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} starved=${r.starvedDays} det=${r.determined} prox=${r.feastProxStarved} feasts=${r.osFeasts} hungry=${r.hungryDays} starveDeaths=${r.starveDeaths}`);
  }
  // aggregate
  const agg = {};
  for (const side of sides) {
    const rs = rows.filter(r => r.side === side);
    const da = rs.map(r => r.days).sort((a, b) => a - b);
    const deathTotals = {};
    const classTotals = {};
    for (const r of rs) {
      for (const [k, v] of Object.entries(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
      for (const [k, v] of Object.entries(r.byClass || {})) classTotals[k] = (classTotals[k] || 0) + v;
    }
    const nStarved = rs.reduce((t, r) => t + r.starvedDays, 0);
    const nDet = rs.reduce((t, r) => t + r.determined, 0);
    agg[side] = {
      n: rs.length,
      won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
      maxDays: da.length ? da[da.length - 1] : 0,
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
      wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
      deaths: deathTotals,
      villagerDays: rs.reduce((t, r) => t + r.villagerDays, 0),
      starvedDays: nStarved,
      determined: nDet,
      determinedShare: nStarved ? +(nDet / nStarved).toFixed(3) : null,
      feastProxStarved: rs.reduce((t, r) => t + r.feastProxStarved, 0),
      feastProxShare: nStarved ? +(rs.reduce((t, r) => t + r.feastProxStarved, 0) / nStarved).toFixed(3) : null,
      byClass: classTotals,
      hungryNVDays: rs.reduce((t, r) => t + r.hungryNVDays, 0),
      osFeasts: rs.reduce((t, r) => t + r.osFeasts, 0),
      osFeastKcal: rs.reduce((t, r) => t + r.osFeastKcal, 0),
      osGateHeld: rs.reduce((t, r) => t + r.osGateHeld, 0),
      osFragileHeld: rs.reduce((t, r) => t + r.osFragileHeld, 0),
    };
  }
  console.log(`\n=== ${label} === sides=[${sides.join(',')}] seeds=[${seeds.join(',')}] days=${days}`);
  for (const side of sides) {
    const b = agg[side];
    console.log(`  ${side}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} w4=${b.wave4} w5=${b.wave5} hungry=${b.hungryDays} starveDeaths=${b.starveDeaths} starvedVD=${b.starvedDays} det=${b.determinedShare} prox=${b.feastProxShare} feasts=${b.osFeasts} feastsKcal=${(b.osFeastKcal / 1000).toFixed(0)}k gateHeld=${b.osGateHeld} fragileHeld=${b.osFragileHeld}`);
    console.log(`    byClass: ${Object.entries(b.byClass).map(([k, v]) => `${k}:${v}`).join(' ') || '-'}`);
  }
  // PRIMARY verdict
  const a = agg['armed'];
  let verdict = 'MISS';
  if (a && a.starvedDays === 0) verdict = 'INFO-SKIP (no starved villager-days — question unanswerable)';
  else if (a && a.determinedShare != null && a.determinedShare >= 0.80) verdict = 'GO';
  console.log(`\nPRIMARY: armed starvedVD=${a ? a.starvedDays : '?'} determinedShare=${a ? a.determinedShare : '?'} -> ${verdict}`);
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, seeds, sides, days, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      fs.writeFileSync(`${perSeedDir}/${label}-${r.side}-s${r.seed}.json`, JSON.stringify(r, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
