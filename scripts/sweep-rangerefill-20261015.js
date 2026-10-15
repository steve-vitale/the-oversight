#!/usr/bin/env node
// sweep-rangerefill-20261015.js — RANGING WATER-SAFETY measurement sweep
// (loop B r46b, ARM 3 = sim-rangerefill; sim-findings #292).
//
// ONE SIDE PER INVOCATION (the RANGEREFILL gate is process-wide env):
//   node scripts/sweep-rangerefill-20261015.js              # CONTROL side
//   RANGEREFILL=1 node scripts/sweep-rangerefill-20261015.js # ARMED side
//   SMOKE=1 ...                                             # 1 seed x 2 policies x 15d
//
// 8 seeds x {leadcourt, belongseek}, 180d death-aware, identical seeds both
// sides. Both sides carry the rangedehy + routetile instruments (proven
// trajectory-neutral by test-rangerefill-20261015.js PART E). The armed side
// layers scripts/policies/rangerefill.js (named exports — the #69 unwrap
// rule; asserted loudly at startup).
//
// CONTROL BASELINE DRIFT (#247): the control is this sweep's own control
// side — never inherited from prior evidence, even on identical seeds.
//
// Per-run JSON -> evidence/2026-10-15/perseed-rangerefill/<side>/.
// A/A sanity (control side only): leadcourt s11/s22 run PRISTINE (no
// instruments); per-day state hashes must be byte-identical to the
// instrumented control runs (full-horizon instrument honesty).
'use strict';
const fs = require('fs');
const path = require('path');
// wall-clock for run timing: sim-harness freezes Date.now() per loadGame
// (deterministic clock for ID generation), so capture the real one at
// module load, before any game code runs.
const realNow = Date.now;
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');
const { installRouteTile } = require('./routetile-lib-20261015');

const RANGEREFILL = process.env.RANGEREFILL === '1';
const SIDE = RANGEREFILL ? 'armed' : 'control';

const { leadcourt: baseLeadcourt } = require('./policies/leadcourt');
const { belongseek: baseBelongseek } = require('./policies/belongseek');
let POLICIES;
if (RANGEREFILL) {
  const rf = require('./policies/rangerefill');
  POLICIES = { leadcourt: rf.rangerefillLeadcourt, belongseek: rf.rangerefillBelongseek };
} else {
  POLICIES = { leadcourt: baseLeadcourt, belongseek: baseBelongseek };
}
// #69 unwrap guard — fail loudly, before any sim spend
for (const [pid, p] of Object.entries(POLICIES)) {
  if (!p || typeof p.daily !== 'function') {
    console.error(`FATAL #69 unwrap: policy '${pid}' has no callable daily (got ${typeof (p && p.daily)})`);
    process.exit(3);
  }
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-rangerefill', SIDE);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const vw = v.water || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (s.water || []).length, Math.floor(vw.clean || 0), Math.floor(vw.dirty || 0),
    (v.roster || []).length, Game.villagerId].join('|');
}

function stdMetrics(Game, result) {
  const out = { won: false, rank: 'village', tableWaiting: false, maxWave: 1, gameDays: 0, deaths: {} };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.gameDays = Game.state.scholar.day || 0; } catch (e) {}
  try {
    for (const d of ((result && result.samples && result.samples.deaths) || [])) {
      const k = (d.kind || 'unknown') + ':' + (d.cause || 'unknown');
      out.deaths[k] = (out.deaths[k] || 0) + 1;
    }
  } catch (e) {}
  return out;
}

// Departures (GO definition): dawn snapshot at-haven -> next dawn away.
// packAtDepart: armed side = the layer's dawn log (post-top-up /
// post-fallback); control side = the dawn snapshot pack (no top-up exists).
function computeDepartures(daily, dawnLog) {
  const byDay = {};
  for (const l of (dawnLog || [])) byDay[l.day] = l;
  const deps = [];
  for (let i = 0; i + 1 < daily.length; i++) {
    const a = daily[i], b = daily[i + 1];
    if (!a.atHaven || b.atHaven) continue;
    const l = byDay[a.day];
    let packEff, cistern;
    if (l) {
      packEff = l.gateTripped
        ? (l.packAfterFallback != null ? l.packAfterFallback : 0)
        : (l.packAfter != null ? l.packAfter : 0);
      cistern = l.cisternClean != null ? l.cisternClean : 0;
    } else {
      packEff = a.packLiters || 0;
      cistern = (a.cistern || {}).clean || 0;
    }
    deps.push({
      day: a.day, packAtDepart: packEff,
      packFull: packEff >= 3, cisternClean: cistern,
      violation: packEff === 0 && (cistern || 0) === 0,
    });
  }
  return deps;
}

async function oneRun(seed, policyId, days, instrumented) {
  const policy = POLICIES[policyId];
  const { Game } = await loadGame({ seed, mode: `rangerefill-${SIDE}-${policyId}${instrumented ? '' : '-pristine'}`, fullTelemetry: false });
  await setupGame(Game);
  const dehy = instrumented ? installRangeDehy(Game) : null;
  const route = instrumented ? installRouteTile(Game) : null;
  let dailyCalls = 0, savedCtx = null;
  const od = policy.daily;
  const pwrap = Object.assign({}, policy);
  pwrap.daily = (G, ctx) => { dailyCalls++; savedCtx = ctx; return od(G, ctx); };
  const hs = [];
  if (instrumented || true) {
    const oed = Game.endDay.bind(Game);
    Game.endDay = function () {
      const r = oed.apply(this, arguments);
      try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); }
      return r;
    };
  }
  let result = null;
  await quietLog(async () => { result = await runDays(Game, pwrap, { days, sampleEvery: 10 }); });
  const m = stdMetrics(Game, result);
  const finD = dehy ? dehy.finalize() : null;
  const finR = route ? route.finalize() : null;
  // dawn log: the layer's (armed) or synthesized from snapshots (control)
  let dawnLog = null, layerCounters = null;
  if (savedCtx && savedCtx._rfDawnLog) {
    dawnLog = savedCtx._rfDawnLog;
    layerCounters = {
      gateTrips: savedCtx.rf_gateTrips || 0,
      gateHauls: savedCtx.rf_gateHauls || 0,
      gateHaulBottles: savedCtx.rf_gateHaulBottles || 0,
      gateUnresolvable: savedCtx.rf_gateUnresolvable || 0,
      filledDawn: savedCtx.rf_filled_dawn || 0,
      filledEnroute: savedCtx.rf_filled_enroute || 0,
      filledGatehaul: savedCtx.rf_filled_gatehaul || 0,
    };
  } else if (finD) {
    dawnLog = finD.daily.map(s => ({
      day: s.day, packBefore: s.packLiters, packAfter: s.packLiters,
      cisternClean: (s.cistern || {}).clean || 0, gateTripped: false, packAfterFallback: null,
    }));
  }
  const departures = finD ? computeDepartures(finD.daily, dawnLog) : [];
  return {
    seed, policyId, side: SIDE, instrumented, days: m.gameDays, dailyCalls,
    won: m.won, rank: m.rank, national: (RANK_ORDER[m.rank] || 0) >= 2 ? 1 : 0,
    tableWaiting: m.tableWaiting, maxWave: m.maxWave, deaths: m.deaths,
    hashes: hs,
    dehy: finD ? {
      nDehydration: finD.nDehydration, nFullyAttributed: finD.nFullyAttributed,
      coverage: finD.coverage,
      deaths: (finD.deaths || []).map(d => ({
        day: d.day, scholarName: d.scholarName, ranging: d.ranging, mapDist: d.mapDist,
        packLiters: (d.packWater || {}).liters, cistern: d.cistern,
        departure: d.departure, fullyAttributed: d.fullyAttributed,
      })),
      verbsAll: finD.verbsAll, refusedFills: finD.refusedFills,
      rangedDays: finD.rangedDays, maxMapDist: finD.maxMapDist, awayNights: finD.awayNights,
      instrErrors: finD.instrErrors,
    } : null,
    route: finR ? {
      nTravels: finR.nTravels, nWaterTileVisits: finR.nWaterTileVisits,
      nFilledVisits: finR.nFilledVisits, nUnfilledVisits: finR.nUnfilledVisits,
      wildFillShareOfVisits: finR.wildFillShareOfVisits,
      havenFills: finR.havenFills, wildFills: finR.wildFills,
      refusedFills: finR.refusedFills, instrErrors: finR.instrErrors,
      haven: finR.haven, visits: finR.visits,
    } : null,
    departures,
    nDepartures: departures.length,
    packFullFrac: departures.length ? +(departures.filter(d => d.packFull).length / departures.length).toFixed(4) : null,
    nViolations: departures.filter(d => d.violation).length,
    layer: layerCounters,
  };
}

async function main() {
  const smoke = process.env.SMOKE === '1';
  const seeds = smoke ? [11] : SEEDS;
  const days = smoke ? 15 : DAYS;
  const policyIds = Object.keys(POLICIES);
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  const t0 = realNow();
  const hashByKey = {};
  for (const policyId of policyIds) {
    for (const seed of seeds) {
      process.stderr.write(`rangerefill [${SIDE}] policy=${policyId} seed=${seed} ...\n`);
      const row = await oneRun(seed, policyId, days, true);
      rows.push(row);
      hashByKey[policyId + ':' + seed] = row.hashes;
      fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}.json`), JSON.stringify(row, null, 1));
      process.stderr.write(`  done: days=${row.days} dehy=${row.dehy.nDehydration} dep=${row.nDepartures} viol=${row.nViolations} wildvisits=${row.route.nWaterTileVisits}(filled ${row.route.nFilledVisits})\n`);
      // A/A sanity (control side only): pristine twin for leadcourt s11/s22
      if (!smoke && !RANGEREFILL && policyId === 'leadcourt' && (seed === 11 || seed === 22)) {
        process.stderr.write(`rangerefill [${SIDE}] policy=${policyId} seed=${seed} pristine ...\n`);
        const prow = await oneRun(seed, policyId, days, false);
        const same = prow.hashes.length === row.hashes.length &&
          prow.hashes.every((h, i) => h === row.hashes[i]);
        prow.aaByteIdentical = same;
        fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}-pristine.json`), JSON.stringify(prow, null, 1));
        process.stderr.write(`  A/A ${same ? 'BYTE-IDENTICAL' : 'DIVERGED'} (${prow.hashes.length} days)\n`);
        if (!same) { console.error('A/A DIVERGENCE — instrument is not trajectory-neutral'); process.exit(2); }
      }
    }
  }
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const deaths = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths)) deaths[k] = (deaths[k] || 0) + v;
  const deps = rows.flatMap(r => r.departures.map(d => Object.assign({ policy: r.policyId, seed: r.seed }, d)));
  const summary = {
    side: SIDE, seeds, days, policies: policyIds, nRuns: rows.length,
    dehyDeaths: rows.reduce((t, r) => t + r.dehy.nDehydration, 0),
    dehyCoverage: (() => { const n = rows.reduce((t, r) => t + r.dehy.nDehydration, 0); const f = rows.reduce((t, r) => t + r.dehy.nFullyAttributed, 0); return n ? +(f / n).toFixed(4) : null; })(),
    departures: {
      n: deps.length,
      packFullFrac: deps.length ? +(deps.filter(d => d.packFull).length / deps.length).toFixed(4) : null,
      nViolations: deps.filter(d => d.violation).length,
    },
    route: {
      waterTileVisits: rows.reduce((t, r) => t + r.route.nWaterTileVisits, 0),
      filledVisits: rows.reduce((t, r) => t + r.route.nFilledVisits, 0),
      unfilledVisits: rows.reduce((t, r) => t + r.route.nUnfilledVisits, 0),
      havenFills: rows.reduce((t, r) => t + r.route.havenFills, 0),
      wildFills: rows.reduce((t, r) => t + r.route.wildFills, 0),
    },
    layer: rows.some(r => r.layer) ? {
      gateTrips: rows.reduce((t, r) => t + (r.layer ? r.layer.gateTrips : 0), 0),
      gateHauls: rows.reduce((t, r) => t + (r.layer ? r.layer.gateHauls : 0), 0),
      gateHaulBottles: rows.reduce((t, r) => t + (r.layer ? r.layer.gateHaulBottles : 0), 0),
      gateUnresolvable: rows.reduce((t, r) => t + (r.layer ? r.layer.gateUnresolvable : 0), 0),
      filledDawn: rows.reduce((t, r) => t + (r.layer ? r.layer.filledDawn : 0), 0),
      filledEnroute: rows.reduce((t, r) => t + (r.layer ? r.layer.filledEnroute : 0), 0),
    } : null,
    wall: {
      national: rows.reduce((t, r) => t + r.national, 0) + '/' + rows.length,
      table: rows.reduce((t, r) => t + (r.tableWaiting ? 1 : 0), 0) + '/' + rows.length,
      won: rows.reduce((t, r) => t + (r.won ? 1 : 0), 0) + '/' + rows.length,
      w4: rows.filter(r => r.maxWave >= 4).length + '/' + rows.length,
      w5: rows.filter(r => r.maxWave >= 5).length + '/' + rows.length,
      medianDays: med(rows.map(r => r.days)),
      maxDays: Math.max(...rows.map(r => r.days)),
    },
    deaths,
    instrErrors: rows.reduce((t, r) => t + r.dehy.instrErrors.length + r.route.instrErrors.length, 0),
  };
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  console.error(`sweep [${SIDE}] done in ${((realNow() - t0) / 1000).toFixed(0)}s`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
