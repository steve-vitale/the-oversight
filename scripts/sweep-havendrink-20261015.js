#!/usr/bin/env node
// sweep-havendrink-20261015.js — HAVENDRINK pilot sweep (loop B ARM 2,
// 2026-10-15, sim-findings #320: at-haven dehydration with full cistern).
//
// PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9-12, 14):
//   PRIMARY (mechanism-forward): fraction of dawn departures from haven with
//     pack water >= 1L — armed >= 1.3x control.
//   GUARDRAILS: (g1) villager thirst deaths <= control+2; (g2) the layer
//     never draws when cistern clean < reserve floor (instrument-verified
//     from the dawn log); cistern-below-floor dawns attributed base-vs-layer;
//     (g3) median survival >= control-10d; (g4) national >= control-2/16;
//     (g5) no new death mode (n>=3 armed-only).
//   HORIZON: 180d death-aware (§10 — dead villages stop simulating, +10d tail).
//   SEEDS: 11/22/33/44/55/66/77/88 (exact literals, identical both sides).
//   POLICIES: leadcourt + belongseek. OWN control in the SAME sweep
//     (CONTROL BASELINE DRIFT #247 — never inherited).
//   PHENOMENON TRACK: scholar at-haven dehydration deaths (the #320 class:
//     cause dehydration AND player AND at-haven at the death beat).
//   GO -> confirm (12-16 seeds) on the primary. MISS -> kill protocol
//     (layer deleted, evidence + instruments retained).
//
// Usage:
//   node scripts/sweep-havendrink-20261015.js              # CONTROL side
//   HAVENDRINK=1 node scripts/sweep-havendrink-20261015.js # ARMED side
//   SMOKE=1 node scripts/sweep-havendrink-20261015.js      # 1 seed x 2 policies x 15d
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');

const SIDE = process.env.HAVENDRINK === '1' ? 'armed' : 'control';
const SMOKE = process.env.SMOKE === '1';
const SEEDS = SMOKE ? [11] : [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = SMOKE ? 15 : 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-havendrink', SIDE);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policies() {
  // Bust the policy cache so the HAVENDRINK gate is read honestly.
  for (const k of Object.keys(require.cache)) {
    if (k.indexOf('policies/') >= 0) delete require.cache[k];
  }
  if (process.env.HAVENDRINK === '1') {
    const hd = require('./policies/havendrink');
    return { leadcourt: hd.havendrinkLeadcourt, belongseek: hd.havendrinkBelongseek, _hd: hd };
  }
  return {
    leadcourt: require('./policies/leadcourt').leadcourt,
    belongseek: require('./policies/belongseek').belongseek,
    _hd: null,
  };
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}

function stdMetrics(Game, result) {
  const out = { won: false, rank: 'village', tableWaiting: false, maxWave: 1, gameDays: 0, deaths: {}, thirstDeaths: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.gameDays = Game.state.scholar.day || 0; } catch (e) {}
  try {
    for (const d of ((result && result.samples && result.samples.deaths) || [])) {
      const k = (d.kind || 'unknown') + ':' + (d.cause || 'unknown');
      out.deaths[k] = (out.deaths[k] || 0) + 1;
      if (d.cause === 'thirst') out.thirstDeaths++;
    }
  } catch (e) {}
  return out;
}

// Departures: dawn snapshot atHaven -> next dawn snapshot !atHaven.
// Pack at the departure dawn: armed = layer dawn-log packAfter (what the
// layer provided); control = instrument dawn-snapshot packLiters.
function computeDepartures(dailySnaps, dawnLog) {
  const deps = [];
  const logByDay = {};
  for (const l of (dawnLog || [])) logByDay[l.day] = l;
  for (let i = 0; i + 1 < dailySnaps.length; i++) {
    const a = dailySnaps[i], b = dailySnaps[i + 1];
    if (a.atHaven && !b.atHaven) {
      const l = logByDay[a.day];
      const pack = l ? l.packAfter : (a.packLiters || 0);
      deps.push({ day: a.day, packAtDepart: pack, packGe1: pack >= 1, fromLayer: !!l });
    }
  }
  return deps;
}

async function oneRun(seed, policyId, pol) {
  const { Game } = await loadGame({ seed, mode: `havendrink-${SIDE}-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  const dehy = installRangeDehy(Game);
  let dailyCalls = 0, savedCtx = null;
  const od = pol.daily;
  const pwrap = Object.assign({}, pol);
  pwrap.daily = (G, ctx) => { dailyCalls++; savedCtx = ctx; return od(G, ctx); };
  const hs = [];
  const oed = Game.endDay.bind(Game);
  Game.endDay = function () {
    const r = oed.apply(this, arguments);
    try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); }
    return r;
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, pwrap, { days: DAYS, sampleEvery: 10 }); });
  const m = stdMetrics(Game, result);
  const fin = dehy.finalize();
  const dawnLog = (savedCtx && savedCtx._hdDawnLog) || null;
  const departures = computeDepartures(fin.daily || [], dawnLog);
  // at-haven scholar dehydration deaths (the #320 phenomenon class)
  const atHavenDehy = (fin.deaths || []).filter(d => !d.ranging);
  // floor-guard audit: any layer draw when cistern < floor?
  let floorViolations = 0;
  for (const l of (dawnLog || [])) {
    if (!l.skippedFloor && l.cisternClean < l.floor && (l.gained || 0) > 0) floorViolations++;
  }
  return {
    seed, policyId, side: SIDE, days: m.gameDays, dailyCalls,
    won: m.won, rank: m.rank, national: (RANK_ORDER[m.rank] || 0) >= 2 ? 1 : 0,
    tableWaiting: m.tableWaiting, maxWave: m.maxWave, deaths: m.deaths,
    thirstDeaths: m.thirstDeaths,
    dehy: {
      nDehydration: fin.nDehydration,
      atHavenDehy: atHavenDehy.map(d => ({ day: d.day, scholarName: d.scholarName, mapDist: d.mapDist, packLiters: (d.packWater || {}).liters, cistern: d.cistern })),
      verbsAll: fin.verbsAll, refusedFills: fin.refusedFills, instrErrors: fin.instrErrors,
    },
    departures,
    nDepartures: departures.length,
    nDeparturesGe1: departures.filter(d => d.packGe1).length,
    layer: dawnLog ? {
      nDawns: dawnLog.length,
      filledDawn: savedCtx.hd_filled_dawn || 0,
      skippedFloor: savedCtx.hd_skipped_floor || 0,
      walkedToWell: dawnLog.filter(l => l.walkedToWell).length,
      floorViolations,
    } : null,
    hashes: hs,
  };
}

async function main() {
  const POL = policies();
  const policyIds = ['leadcourt', 'belongseek'];
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const policyId of policyIds) {
    for (const seed of SEEDS) {
      process.stderr.write(`havendrink [${SIDE}] policy=${policyId} seed=${seed} ...\n`);
      const r = await oneRun(seed, policyId, POL[policyId]);
      rows.push(r);
      fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}.json`), JSON.stringify(r, null, 1));
      process.stderr.write(`  -> days=${r.days} departures=${r.nDepartures} (>=1L: ${r.nDeparturesGe1}) atHavenDehy=${r.dehy.atHavenDehy.length} thirst=${r.thirstDeaths}\n`);
    }
  }
  // summary
  const deps = rows.reduce((n, r) => n + r.nDepartures, 0);
  const depsGe1 = rows.reduce((n, r) => n + r.nDeparturesGe1, 0);
  const summary = {
    side: SIDE, seeds: SEEDS, days: DAYS,
    runs: rows.length,
    departures: deps,
    departuresGe1: depsGe1,
    departuresGe1Frac: deps ? +(depsGe1 / deps).toFixed(4) : null,
    atHavenDehyDeaths: rows.reduce((n, r) => n + r.dehy.atHavenDehy.length, 0),
    thirstDeaths: rows.reduce((n, r) => n + r.thirstDeaths, 0),
    national: rows.reduce((n, r) => n + r.national, 0),
    medianDays: (() => { const ds = rows.map(r => r.days).sort((a, b) => a - b); return ds.length % 2 ? ds[(ds.length - 1) / 2] : (ds[ds.length / 2 - 1] + ds[ds.length / 2]) / 2; })(),
    maxDays: Math.max(...rows.map(r => r.days)),
    wins: rows.filter(r => r.won).length,
    maxWave: Math.max(...rows.map(r => r.maxWave)),
    layerTotals: SIDE === 'armed' ? {
      filledDawn: rows.reduce((n, r) => n + ((r.layer || {}).filledDawn || 0), 0),
      skippedFloor: rows.reduce((n, r) => n + ((r.layer || {}).skippedFloor || 0), 0),
      walkedToWell: rows.reduce((n, r) => n + ((r.layer || {}).walkedToWell || 0), 0),
      floorViolations: rows.reduce((n, r) => n + ((r.layer || {}).floorViolations || 0), 0),
    } : null,
  };
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
