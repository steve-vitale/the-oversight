#!/usr/bin/env node
// scripts/meatlastmile-sweep-20261015.js — the sim-meatlastmile DIAGNOSTIC
// sweep (loop B, 2026-10-15). Attributes killed-monster meat kcal stage by
// stage on the competent-family courtship road: killed → corpse-rot →
// hauled → cleaned → cooked/smoked → eaten → rotted → succession → leftover.
//
// INSTRUMENT ONLY — scripts/meatlastmile-lib-20261015.js; zero src/js
// changes. 2 policies (leadcourt, belongseek) × 8 seeds × 180d death-aware,
// identical seeds (the courtship-road pilot seed set).
//
// Pre-registration: evidence/2026-10-15/sim-meatlastmile-b.md (header
// written before any sims).
// DIAGNOSTIC GO: ≥80% of killed-monster meat kcal stage-attributed, AND a
// stage-by-stage breakdown naming the binding stage (or honestly naming
// the stages as unconcentrated).
//
// Usage: node scripts/meatlastmile-sweep-20261015.js
//   OUTDIR defaults to evidence/2026-10-15; writes
//   meatlastmile-rows.json (per-seed rows, telemetry-check compatible) +
//   meatlastmile-summary.json (aggregate stage ledger).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attachInstruments, finalize } = require('./meatlastmile-lib-20261015');

const REGISTRY = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

async function runOne(pid, seed) {
  const base = REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const label = `${pid}/s${seed}`;
  const { Game } = await loadGame({ seed, mode: 'meatlastmile-' + pid });
  await setupGame(Game);
  const m = attachInstruments(Game);
  const hist = { maxRank: 0, everTable: false, maxWave: 1 };
  let policyActs = 0;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      policyActs++;
      const rk = RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village')] || 0;
      hist.maxRank = Math.max(hist.maxRank, rk);
      if (G.progState && G.progState().tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave());
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS }); });
  // SMOKE=1 instrument-honesty gate
  if (policyActs < 10) throw new Error(`SMOKE FAIL: ${label} policy.daily fired ${policyActs}x (suite may be policy-less)`);
  const s = finalize(Game, m, result);
  const row = {
    label, policy: pid, seed,
    days: result.days, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0,
    maxWave: hist.maxWave,
    policyActs,
    stages: s,
  };
  console.log(`  [${label}] d=${row.days} ${row.endReason} killed=${(s.killedTotal / 1000).toFixed(1)}k ` +
    `corpseRot=${(s.corpseRotTotal / 1000).toFixed(1)}k hauled=${(s.hauledTotal / 1000).toFixed(1)}k ` +
    `eaten=${(s.eatenTotal / 1000).toFixed(1)}k cov=${s.coverage} nat=${row.national} wave=${row.maxWave} err=${s.instrErrors.length}`);
  return row;
}

function summarize(rows) {
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const sum = (f) => rows.reduce((t, r) => t + (f(r) || 0), 0);
  const st = (rows) => {
    const agg = {};
    const SKIP = { coverage: 1, transcript: 1, instrErrors: 1 };
    for (const r of rows) {
      const s = r.stages;
      for (const k of Object.keys(s)) {
        if (SKIP[k]) continue;
        if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) {
          agg[k] = agg[k] || {};
          for (const kk of Object.keys(s[k])) {
            const v = s[k][kk];
            if (typeof v === 'number') agg[k][kk] = (agg[k][kk] || 0) + v;
          }
        } else if (typeof s[k] === 'number') {
          agg[k] = (agg[k] || 0) + s[k];
        }
      }
    }
    return agg;
  };
  const agg = st(rows);
  const killedTotal = agg.killedTotal || 0;
  const grossAtt = (agg.corpseRotTotal || 0) + (agg.hauledTotal || 0) + (agg.villHauledGrossTotal || 0);
  const netUses = (agg.eatenTotal || 0) + (agg.rotPackTotal || 0) + (agg.rotStashTotal || 0) +
    (agg.rotPantryTotal || 0) + (agg.successionNet || 0) + (agg.donatedTotal || 0) +
    (agg.leftoverTotal || 0) + Math.max(0, agg.cookLossTotal || 0) + (agg.pemmicanInTotal || 0);
  return {
    n: rows.length,
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    national: sum(r => r.national), table: sum(r => r.table),
    wins: sum(r => r.wins), wave45: rows.filter(r => r.maxWave >= 4).length,
    maxWave: Math.max(...rows.map(r => r.maxWave)),
    stages: agg,
    killedTotal,
    grossUnattributed: Math.round(killedTotal - grossAtt),
    netProducedTotal: (agg.netProducedTotal || 0),
    netUsesTotal: Math.round(netUses),
    netResidual: Math.round((agg.netProducedTotal || 0) - netUses),
    coverage: killedTotal > 0
      ? +((1 - ((Math.abs(killedTotal - grossAtt) + Math.abs((agg.netProducedTotal || 0) - netUses)) / killedTotal)).toFixed(3))
      : 0,
    instrErrors: rows.reduce((t, r) => t + ((r.stages.instrErrors || []).length), 0),
  };
}

(async () => {
  const rows = [];
  for (const pid of Object.keys(REGISTRY)) {
    for (const seed of SEEDS) {
      rows.push(await runOne(pid, seed));
    }
  }
  const agg = summarize(rows);
  console.log('\n=== sim-meatlastmile DIAGNOSTIC (8 seeds x 2 policies, 180d death-aware) ===');
  const k = (v) => ((v || 0) / 1000).toFixed(1) + 'k';
  const so = (o) => Object.values(o || {}).reduce((t, v) => t + (typeof v === 'number' ? v : 0), 0);
  console.log(`wall: n=${agg.n} medDays=${agg.medianDays} national=${agg.national}/${agg.n} table=${agg.table}/${agg.n} wins=${agg.wins} wave45=${agg.wave45}/${agg.n} maxWave=${agg.maxWave}`);
  console.log(`gross: killed=${k(agg.killedTotal)} corpseRot=${k(agg.stages.corpseRotTotal)} hauled=${k(agg.stages.hauledTotal)} villHauled=${k(agg.stages.villHauledGrossTotal)} unattr=${k(agg.grossUnattributed)}`);
  console.log(`pack-side: cleanNet=${k(so(agg.stages.cleanNet) + so(agg.stages.specNet))} eaten=${k(agg.stages.eatenTotal)} rotPack=${k(agg.stages.rotPackTotal)} rotPantry=${k(agg.stages.rotPantryTotal)} succession=${k(agg.stages.successionNet)} leftover=${k(agg.stages.leftoverTotal)} cookLoss=${k(agg.stages.cookLossTotal)}`);
  console.log(`net: produced=${k(agg.netProducedTotal)} uses=${k(agg.netUsesTotal)} residual=${k(agg.netResidual)} coverage=${agg.coverage} instrErr=${agg.instrErrors}`);
  console.log(`DIAGNOSTIC GO: coverage ${agg.coverage} >= 0.80 ? ${agg.coverage >= 0.8 ? 'GO' : 'MISS'}`);

  const outdir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-15');
  fs.mkdirSync(outdir, { recursive: true });
  const slim = rows.map(r => {
    const { stages, ...rest } = r;
    return Object.assign(rest, {
      national: r.national, table: r.table, wins: r.wins, exiled: 0,
      killedTotal: stages.killedTotal, eatenTotal: stages.eatenTotal,
      corpseRotTotal: stages.corpseRotTotal, coverage: stages.coverage,
    });
  });
  fs.writeFileSync(path.join(outdir, 'meatlastmile-rows.json'),
    JSON.stringify(Object.assign({ label: 'meatlastmile-rows', rows: slim }, {
      national: agg.national, table: agg.table, wins: agg.wins, exiled: 0,
    }), null, 1));
  fs.writeFileSync(path.join(outdir, 'meatlastmile-summary.json'),
    JSON.stringify({ label: 'meatlastmile-summary', days: DAYS, seeds: SEEDS,
      policies: Object.keys(REGISTRY), aggregate: agg, rows }, null, 1));
  console.log('wrote', path.join(outdir, 'meatlastmile-rows.json'));
  console.log('wrote', path.join(outdir, 'meatlastmile-summary.json'));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
