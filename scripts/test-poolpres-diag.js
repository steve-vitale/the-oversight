#!/usr/bin/env node
// scripts/test-poolpres-diag.js — sim-poolpres-a analyzer (DIAG ONLY).
//
// Reads ONLY the armed corpus written by scripts/test-raftdraft-diag-
// sweep.js --one armed (EVID dir, default evidence/2026-10-25/
// perseed-poolpres-a). Reuses that script's analyzeDraft() for the
// raftdraft headline numbers, then adds the pool-presence analysis
// this arm pre-registered:
//   - pool wave composition over time (day buckets + per-seed)
//   - raid draft composition + raidN distribution
//   - implied pool wave-3+ presence for 1 wave-3+ raider/raid under
//     the ACTUAL draft-size distribution, two ways:
//       A) mean-raidN: p = 1 / E[raidN]  (p s.t. expected w3+ per raid = 1)
//       B) distribution-weighted: p = E[1/raidN] over raids (average
//          of the per-raidN requirement 1/n across the raid mix)
//     plus a hypergeometric check: at a candidate pool share p, with
//     each raid's observed pool size N and raidN n, P(raid drafts
//     >=1 w3+) = 1 - prod_{j<n} (N-K-j)/(N-j), K = round(p*N).
//     Averaged over raids, this predicts the raids-with->=1 rate at
//     that p; compare against the observed rate at the measured p.
// Modes (read-only; never runs a sweep, never writes outside EVID):
//   --summary : build summary.json from the rows on disk, print gates.
//   --check <seed> : verify one armed row exists and is well-formed.
// Exit 1 on gate failure (census incomplete, recorder errors > 0).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { analyzeDraft } = require('./test-raftdraft-diag-sweep');

const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-poolpres-a'); }
function medianOf(arr) { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function meanOf(arr) { if (!arr.length) return null; return arr.reduce((t, x) => t + x, 0) / arr.length; }
// P(zero w3+ drafted) under random drafting without replacement:
// pool N, w3+ count K, draft n. Returns 0 if n > N-K (cannot miss).
function pZeroDrafted(N, K, n) {
  if (n <= 0) return 1;
  if (K <= 0) return 1;
  if (n > N - K) return 0;
  let p = 1;
  for (let j = 0; j < n; j++) p *= (N - K - j) / (N - j);
  return p;
}
function meanProbAtLeastOne(raids, p) {
  if (!raids.length) return null;
  let tot = 0;
  for (const r of raids) {
    const N = r.livingN || 0, n = r.raidN || 0;
    if (!N || !n) continue;
    tot += 1 - pZeroDrafted(N, Math.round(p * N), n);
  }
  return tot / raids.length;
}

function analyzePoolPres(armedRows) {
  const a = analyzeDraft(armedRows);
  const raids = [];
  for (const r of armedRows) for (const x of (r.raftdraft.raids || [])) raids.push(Object.assign({ seed: r.seed }, x));
  const raidNs = raids.map(r => r.raidN || 0);
  const meanRaidN = meanOf(raidNs);
  const impliedMean = meanRaidN ? 1 / meanRaidN : null; // method A
  const impliedDist = raids.length ? meanOf(raidNs.map(n => (n ? 1 / n : 0))) : null; // method B
  const perRaidN = {};
  for (const r of raids) {
    const n = r.raidN;
    perRaidN[n] = perRaidN[n] || { raids: 0, raiders: 0, w3plusDrafted: 0, poolTotal: 0, poolW3: 0 };
    perRaidN[n].raids++;
    perRaidN[n].raiders += (r.raiders || []).length;
    perRaidN[n].w3plusDrafted += (r.raiders || []).filter(x => (x.wave || 1) >= 3).length;
    perRaidN[n].poolTotal += r.livingN || 0;
    perRaidN[n].poolW3 += (r.w3plusPool || []).length;
  }
  for (const k of Object.keys(perRaidN)) {
    const d = perRaidN[k];
    d.impliedP = 1 / Number(k);
    d.poolW3Share = d.poolTotal ? d.poolW3 / d.poolTotal : 0;
    d.w3plusPerRaid = d.raids ? d.w3plusDrafted / d.raids : 0;
  }
  // Time buckets over raid day.
  const buckets = { '<60': [], '60-89': [], '90-119': [], '120+': [] };
  const bucketOf = (d) => (d < 60 ? '<60' : d < 90 ? '60-89' : d < 120 ? '90-119' : '120+');
  for (const r of raids) buckets[bucketOf(r.day || 0)].push(r);
  const timeSeries = {};
  for (const k of Object.keys(buckets)) {
    const rs = buckets[k];
    let poolTot = 0, poolW3 = 0, poolW4 = 0, poolW5 = 0;
    for (const r of rs) {
      poolTot += r.livingN || 0;
      const pbw = r.poolByWave || {};
      poolW3 += (pbw['3'] | 0) + (pbw['4'] | 0) + (pbw['5'] | 0) + (pbw['6'] | 0);
      poolW4 += (pbw['4'] | 0) + (pbw['5'] | 0) + (pbw['6'] | 0);
      poolW5 += (pbw['5'] | 0) + (pbw['6'] | 0);
    }
    const draftedW3 = rs.reduce((t, r) => t + (r.raiders || []).filter(x => (x.wave || 1) >= 3).length, 0);
    timeSeries[k] = {
      raids: rs.length, poolTotal: poolTot, poolW3: poolW3,
      poolW3Share: poolTot ? poolW3 / poolTot : 0,
      poolW4plusShare: poolTot ? poolW4 / poolTot : 0,
      poolW5Share: poolTot ? poolW5 / poolTot : 0,
      raidsWithW3InPool: rs.filter(r => (r.w3plusPool || []).length > 0).length,
      raidsWithW3Drafted: rs.filter(r => (r.raiders || []).filter(x => (x.wave || 1) >= 3).length > 0).length,
      w3plusDrafted: draftedW3, w3plusPerRaid: rs.length ? draftedW3 / rs.length : 0,
      meanPoolSize: meanOf(rs.map(r => r.livingN || 0)),
    };
  }
  // Per-seed pool shares.
  const perSeed = {};
  for (const r of raids) {
    perSeed[r.seed] = perSeed[r.seed] || { raids: 0, poolTotal: 0, poolW3: 0, w3Drafted: 0, raiders: 0 };
    const d = perSeed[r.seed];
    d.raids++; d.poolTotal += r.livingN || 0; d.poolW3 += (r.w3plusPool || []).length;
    d.w3Drafted += (r.raiders || []).filter(x => (x.wave || 1) >= 3).length;
    d.raiders += (r.raiders || []).length;
  }
  for (const k of Object.keys(perSeed)) {
    const d = perSeed[k];
    d.poolW3Share = d.poolTotal ? d.poolW3 / d.poolTotal : 0;
    d.w3plusPerRaid = d.raids ? d.w3Drafted / d.raids : 0;
  }
  const poolW3Share = a.poolTotal ? (a.poolByWave['3'] || 0) + (a.poolByWave['4'] || 0) + (a.poolByWave['5'] || 0) + (a.poolByWave['6'] || 0) : 0;
  const poolW3ShareFrac = a.poolTotal ? poolW3Share / a.poolTotal : 0;
  const se = a.poolTotal ? Math.sqrt(poolW3ShareFrac * (1 - poolW3ShareFrac) / a.poolTotal) : null;
  return Object.assign(a, {
    raidsDetail: raids.map(r => ({ seed: r.seed, day: r.day, raidN: r.raidN, poolN: r.livingN, poolW3: (r.w3plusPool || []).length, draftedW3: (r.raiders || []).filter(x => (x.wave || 1) >= 3).length })),
    meanRaidN: meanRaidN,
    impliedPresenceMeanRaidN: impliedMean,
    impliedPresenceDistWeighted: impliedDist,
    impliedPresenceAgreementPp: (impliedMean != null && impliedDist != null) ? Math.abs(impliedMean - impliedDist) * 100 : null,
    perRaidN: perRaidN,
    timeSeries: timeSeries,
    perSeedPool: perSeed,
    poolW3Count: poolW3Share, poolW3Share: poolW3ShareFrac, poolW3ShareSE: se,
    w3plusPerRaid: raids.length ? a.raiderWave1234plus.w3 + a.raiderWave1234plus.w4plus : 0,
    w3plusPerRaidValue: raids.length ? (a.raiderWave1234plus.w3 + a.raiderWave1234plus.w4plus) / raids.length : 0,
    raidsWithW3DraftedShare: raids.length ? a.raidsWithW3Drafted / raids.length : 0,
    raidsWithW3InPoolShare: raids.length ? a.raidsWithW3InPool / raids.length : 0,
    hypergeometric: {
      atMeasuredP: meanProbAtLeastOne(raids, poolW3ShareFrac),
      atImpliedMeanP: impliedMean != null ? meanProbAtLeastOne(raids, impliedMean) : null,
      atImpliedDistP: impliedDist != null ? meanProbAtLeastOne(raids, impliedDist) : null,
      observedRaidsWithW3DraftedShare: raids.length ? a.raidsWithW3Drafted / raids.length : 0,
      note: 'Random-drafting prediction at candidate p, using each raid\'s observed pool size and raidN (K=round(p*N)). Compares against the observed drafted rate; the observed rate also reflects nearest-first selection, which raftdraft-a showed mildly favors w3+.',
    },
  });
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  const missing = [];
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-armed.json`);
    try { rows.push(JSON.parse(fs.readFileSync(p, 'utf8'))); }
    catch (e) { missing.push(seed); }
  }
  const gCensus = rows.length === SEEDS.length && rows.every(r => r.days > 0 && Array.isArray(r.raftdraft.raids) && r.diag && r.diag.errs === 0);
  if (!gCensus) {
    console.error(`POOLPRES GATE FAIL: census rows=${rows.length}/${SEEDS.length} missing=${missing.join(',')}`);
    process.exit(1);
  }
  const analysis = analyzePoolPres(rows);
  const bySeed = rows.map(r => ({
    seed: r.seed, days: r.days, gameDays: r.gameDays, endReason: r.endReason, won: r.won,
    waveReach: r.waveReach, maxArc: r.maxArc, finalRank: r.finalRank, maxRank: r.maxRank,
    nationalEver: r.nationalEver, nationalFinal: r.nationalFinal, table: r.table, entered: r.entered,
    deathTotal: r.deathTotal, starvationDeaths: r.starvationDeaths,
  }));
  const wall = {
    n: rows.length, won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)), medianGameDays: medianOf(rows.map(r => r.gameDays)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0), entered: rows.reduce((t, r) => t + r.entered, 0),
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    maxArc: Math.max.apply(null, rows.map(r => r.maxArc).concat([1])),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const diagGo = gCensus && analysis.raidCount > 0 && analysis.raiderCount > 0
    && analysis.impliedPresenceAgreementPp != null && analysis.impliedPresenceAgreementPp <= 2;
  const report = {
    label: 'sim-poolpres-a diag', seeds: SEEDS, evidDir, bySeed, wall,
    gates: { censusComplete8of8ZeroErrs: gCensus, impliedAgreementWithin2pp: analysis.impliedPresenceAgreementPp <= 2 },
    analysis: analysis, diagGo: diagGo, generated: new Date().toISOString(),
  };
  const out = path.join(evidDir, 'summary.json');
  fs.mkdirSync(evidDir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-poolpres-a diag ===');
  console.log(`  WALL: n=${wall.n} won=${wall.won} medD=${wall.medianDays} medGameD=${wall.medianGameDays} natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave3=${wall.wave3} wave4=${wall.wave4} wave5=${wall.wave5} maxArc=${wall.maxArc} starvTotal=${wall.starvationTotal} deathTotal=${wall.deathTotal}`);
  console.log(`  RAIDS: count=${analysis.raidCount} raiders=${analysis.raiderCount} raidN=${JSON.stringify(analysis.raidNDist)} meanRaidN=${analysis.meanRaidN}`);
  console.log(`  POOL: total=${analysis.poolTotal} byWave=${JSON.stringify(analysis.poolByWave)} w3plus=${analysis.poolW3Count} share=${(analysis.poolW3Share * 100).toFixed(2)}% SE=${(analysis.poolW3ShareSE * 100).toFixed(2)}pp`);
  console.log(`  DRAFTED: w1=${analysis.raiderWave1234plus.w1} w2=${analysis.raiderWave1234plus.w2} w3=${analysis.raiderWave1234plus.w3} w4plus=${analysis.raiderWave1234plus.w4plus} w3plusPerRaid=${analysis.w3plusPerRaidValue.toFixed(3)} raidsWithW3Drafted=${analysis.raidsWithW3Drafted}/${analysis.raidCount} raidsWithW3InPool=${analysis.raidsWithW3InPool}/${analysis.raidCount}`);
  console.log(`  IMPLIED PRESENCE for 1 w3+/raid: meanRaidN=${(analysis.impliedPresenceMeanRaidN * 100).toFixed(2)}% distWeighted=${(analysis.impliedPresenceDistWeighted * 100).toFixed(2)}% agreement=${analysis.impliedPresenceAgreementPp.toFixed(2)}pp perRaidN=${JSON.stringify(analysis.perRaidN)}`);
  console.log(`  HYPERGEOMETRIC: atMeasuredP>=1=${(analysis.hypergeometric.atMeasuredP * 100).toFixed(1)}% atImpliedMeanP>=1=${(analysis.hypergeometric.atImpliedMeanP * 100).toFixed(1)}% observed>=1=${(analysis.hypergeometric.observedRaidsWithW3DraftedShare * 100).toFixed(1)}%`);
  console.log(`  TIME: ${JSON.stringify(analysis.timeSeries)}`);
  console.log(`  DIAG-GO: ${diagGo ? 'GO' : 'NO-GO'} -> ${out}`);
  if (!diagGo) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--check')) {
    const seed = args[args.indexOf('--check') + 1];
    const p = path.join(evidDirOf(), `s${seed}-armed.json`);
    const row = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log(`CHECK seed=${seed} days=${row.days} raids=${(row.raftdraft.raids || []).length} errs=${row.diag ? row.diag.errs : '?'}`);
    return;
  }
  console.error('usage: --summary | --check <seed>');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('POOLPRES-DIAG FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { analyzePoolPres, meanProbAtLeastOne };
