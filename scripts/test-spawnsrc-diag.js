#!/usr/bin/env node
// scripts/test-spawnsrc-diag.js — sim-spawnsrc-a analyzer (DIAG ONLY).
//
// Reads ONLY the armed corpus written by scripts/test-spawnsrc-diag-
// sweep.js --one armed (EVID dir, default evidence/2026-10-25/
// perseed-sim-spawnsrc-a). Read-only over the corpus; writes only its
// own spawnsrc-summary.json next to the rows (the analyzer's output,
// not a re-run).
//
// Computes the four pre-registered DIAG-GO outputs:
//   (a) classification rate: pooled per-raid living-pool entities with
//       a known spawn source (unknown share must be <= 5%);
//   (b) per-seed + pooled source shares, with the above-cap portion
//       attributed by source under the stated convention: pool entities
//       ordered by birth sequence (the recorder's spawn counter;
//       worldMonsters list order is spawn order modulo removals), the
//       earliest `cap` living entities are the cap stock and the rest
//       is the excess. Two cap views are reported: the raid-time cap
//       recorded by the recorder (worldMonsterCap at raid time) and
//       the fixed deep cap 8 from the brief, so the "median 17 vs cap
//       8" framing is directly comparable;
//   (c) wave mix per source (pooled raid-time entities);
//   (d) wave-5 pool presence, by source.
// Plus the birth census (fresh spawns by source + wave mix) and a
// cross-check of spawnsrc raid pools against the raftdraft census on
// the same rows (same fired raids, same pool totals).
//
// Modes: --summary (print + write spawnsrc-summary.json).
// Exit 1 on gate failure (census incomplete, recorder errors > 0).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-spawnsrc-a'); }
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) {
  if (!arr.length) return null;
  return arr.reduce((t, x) => t + x, 0) / arr.length;
}
function countBy(arr, key) {
  const c = {};
  for (const x of arr) { const k = String(x[key]); c[k] = (c[k] || 0) + 1; }
  return c;
}
function shares(counts) {
  const tot = Object.keys(counts).reduce((t, k) => t + counts[k], 0) || 1;
  const o = {};
  for (const k of Object.keys(counts).sort()) o[k] = { n: counts[k], share: counts[k] / tot };
  o._total = tot;
  return o;
}
function waveMixOf(entities) {
  const byWave = {};
  for (const e of entities) { const w = e.wave || 1; byWave[w] = (byWave[w] || 0) + 1; }
  const tot = entities.length || 1;
  const out = {};
  for (const k of Object.keys(byWave).sort((a, b) => a - b)) out[k] = { n: byWave[k], share: byWave[k] / tot };
  out._total = entities.length;
  out.w3plus = entities.filter(e => (e.wave || 1) >= 3).length;
  out.w3plusShare = entities.length ? out.w3plus / entities.length : 0;
  out.w5 = entities.filter(e => (e.wave || 1) >= 5).length;
  return out;
}

function analyze(rows) {
  const raids = [];
  for (const r of rows) for (const x of (r.spawnsrc.raids || [])) raids.push(Object.assign({ seed: r.seed }, x));
  const poolEntities = [];
  for (const raid of raids) for (const p of (raid.pool || [])) poolEntities.push(Object.assign({ seed: raid.seed, raidDay: raid.day, raidCap: raid.cap }, p));
  const classified = poolEntities.filter(e => e.src && e.src !== 'unknown');
  const unknownShare = poolEntities.length ? 1 - classified.length / poolEntities.length : 1;
  // Per-seed source shares.
  const perSeed = {};
  for (const r of rows) {
    const ents = poolEntities.filter(e => e.seed === r.seed);
    perSeed[r.seed] = {
      raids: (r.spawnsrc.raids || []).length,
      poolTotal: ents.length,
      bySrc: shares(countBy(ents, 'src')),
      unknown: ents.filter(e => !e.src || e.src === 'unknown').length,
      waveMix: waveMixOf(ents),
    };
  }
  // Above-cap attribution, two cap views.
  const excessViews = {};
  for (const view of ['raidCap', 'cap8']) {
    const capStock = [], excess = [];
    for (const raid of raids) {
      const ents = (raid.pool || []).slice().sort((a, b) => {
        const sa = (a.seq == null ? 1e12 : a.seq), sb = (b.seq == null ? 1e12 : b.seq);
        return sa - sb;
      });
      const cap = view === 'raidCap' ? (raid.cap != null ? raid.cap : 8) : 8;
      capStock.push.apply(capStock, ents.slice(0, cap));
      excess.push.apply(excess, ents.slice(cap));
    }
    excessViews[view] = {
      capStockTotal: capStock.length, excessTotal: excess.length,
      capStockBySrc: shares(countBy(capStock, 'src')),
      excessBySrc: shares(countBy(excess, 'src')),
      capStockWave: waveMixOf(capStock),
      excessWave: waveMixOf(excess),
    };
  }
  // Wave mix per source (pooled raid-time).
  const bySrcWave = {};
  const sources = Array.from(new Set(poolEntities.map(e => e.src))).sort();
  for (const s of sources) bySrcWave[s] = waveMixOf(poolEntities.filter(e => e.src === s));
  // Wave-5 presence by source.
  const w5 = poolEntities.filter(e => (e.wave || 1) >= 5);
  const w5BySrc = countBy(w5, 'src');
  // Birth census: fresh spawns by source + wave mix.
  const spawns = [];
  for (const r of rows) for (const x of (r.spawnsrc.spawns || [])) spawns.push(Object.assign({ seed: r.seed }, x));
  const birthBySrc = {};
  for (const s of Array.from(new Set(spawns.map(e => e.src))).sort()) {
    birthBySrc[s] = Object.assign({ total: spawns.filter(e => e.src === s).length }, waveMixOf(spawns.filter(e => e.src === s)));
  }
  // Cross-check vs raftdraft census on the same rows.
  const raftRaids = [];
  for (const r of rows) for (const x of (r.raftdraft.raids || [])) raftRaids.push(Object.assign({ seed: r.seed }, x));
  const crossCheck = {
    spawnsrcRaids: raids.length, raftRaids: raftRaids.length,
    spawnsrcPoolTotal: poolEntities.length,
    raftPoolTotal: raftRaids.reduce((t, r) => t + (r.livingN || 0), 0),
    spawnsrcPoolByWave: countBy(poolEntities, 'wave'),
    raftPoolByWave: (() => { const c = {}; for (const r of raftRaids) for (const k of Object.keys(r.poolByWave || {})) c[k] = (c[k] || 0) + (r.poolByWave[k] | 0); return c; })(),
  };
  const poolSizes = raids.map(r => (r.pool || []).length);
  const diagGo = poolEntities.length > 0 && unknownShare <= 0.05
    && raids.length > 0 && sources.length > 0;
  return {
    raids: raids.length, poolEntities: poolEntities.length,
    classified: classified.length, unknown: poolEntities.length - classified.length,
    unknownShare: unknownShare,
    pooledBySrc: shares(countBy(poolEntities, 'src')),
    pooledWave: waveMixOf(poolEntities),
    perSeed: perSeed,
    excessViews: excessViews,
    bySrcWave: bySrcWave,
    w5Total: w5.length, w5BySrc: w5BySrc,
    birthTotal: spawns.length, birthBySrc: birthBySrc,
    birthUnknown: spawns.filter(e => !e.src || e.src === 'unknown').length,
    crossCheck: crossCheck,
    poolSize: { median: medianOf(poolSizes), mean: meanOf(poolSizes), min: poolSizes.length ? Math.min.apply(null, poolSizes) : 0, max: poolSizes.length ? Math.max.apply(null, poolSizes) : 0 },
    diagGo: diagGo,
  };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-armed.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.spawnsrc
    && Array.isArray(r.spawnsrc.raids) && Array.isArray(r.spawnsrc.spawns)
    && r.spawnsrc.diag.errs === 0 && Object.keys(r.spawnsrc.diag.overflow || {}).length === 0
    && r.raftdraft && Array.isArray(r.raftdraft.raids) && r.raftdraft.diag.errs === 0);
  const a = analyze(rows);
  const report = { label: 'sim-spawnsrc-a analysis', seeds: SEEDS, corpusOk, analysis: a, generated: new Date().toISOString() };
  const outPath = path.join(evidDir, 'spawnsrc-summary.json');
  fs.mkdirSync(evidDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-spawnsrc-a analysis ===');
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'} raids=${a.raids} poolEntities=${a.poolEntities} poolSize median=${a.poolSize.median} mean=${a.poolSize.mean} min=${a.poolSize.min} max=${a.poolSize.max}`);
  console.log(`  classification: classified=${a.classified}/${a.poolEntities} unknown=${a.unknown} (${(a.unknownShare * 100).toFixed(2)}%)`);
  console.log(`  pooled by source: ${JSON.stringify(a.pooledBySrc)}`);
  console.log(`  pooled wave mix: ${JSON.stringify(a.pooledWave)}`);
  for (const s of Object.keys(a.bySrcWave).sort()) console.log(`  wave mix [${s}]: ${JSON.stringify(a.bySrcWave[s])}`);
  for (const v of ['raidCap', 'cap8']) {
    const e = a.excessViews[v];
    console.log(`  excess [${v}]: capStock=${e.capStockTotal} excess=${e.excessTotal} excessBySrc=${JSON.stringify(e.excessBySrc)} excessWave=${JSON.stringify(e.excessWave)} capStockWave=${JSON.stringify(e.capStockWave)}`);
  }
  console.log(`  wave-5 pool: total=${a.w5Total} bySrc=${JSON.stringify(a.w5BySrc)}`);
  console.log(`  birth census: total=${a.birthTotal} unknown=${a.birthUnknown}`);
  for (const s of Object.keys(a.birthBySrc).sort()) console.log(`  births [${s}]: total=${a.birthBySrc[s].total} w3plusShare=${(a.birthBySrc[s].w3plusShare * 100).toFixed(1)}% w5=${a.birthBySrc[s].w5} wave=${JSON.stringify(a.birthBySrc[s])}`);
  console.log(`  cross-check: spawnsrcRaids=${a.crossCheck.spawnsrcRaids} raftRaids=${a.crossCheck.raftRaids} spawnsrcPool=${a.crossCheck.spawnsrcPoolTotal} raftPool=${a.crossCheck.raftPoolTotal} spawnsrcByWave=${JSON.stringify(a.crossCheck.spawnsrcPoolByWave)} raftByWave=${JSON.stringify(a.crossCheck.raftPoolByWave)}`);
  console.log(`  DIAG-GO (classification only; full verdict in evidence): ${a.diagGo ? 'GO' : 'NO-GO'} -> ${outPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--summary')) return summaryMode();
  console.error('usage: --summary');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('SPAWNSRC-DIAG ANALYZER FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { analyze };
