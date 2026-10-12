#!/usr/bin/env node
// analyze-knowledge-r5.js — before/after comparison for longsim knowledge r5:
// "traders learn from the village over time" (pool growth).
// BEFORE: TRADE_POOL_GROWTH=0 (legacy static 2-3 pool). AFTER: TRADE_POOL_GROWTH=1.
// Both with TRADE_HOOK=1 (r4's competent trading), identical seeds.
// Usage: node scripts/analyze-knowledge-r5.js /tmp/knowledge-r5-before.json /tmp/knowledge-r5-after.json
'use strict';
const fs = require('fs');
const [beforeF, afterF] = process.argv.slice(2);
const before = JSON.parse(fs.readFileSync(beforeF, 'utf8'));
const after = JSON.parse(fs.readFileSync(afterF, 'utf8'));

function sum(runs, f) { return runs.reduce((a, r) => a + (f(r) || 0), 0); }
function mean(runs, f) { return runs.length ? sum(runs, f) / runs.length : 0; }
function objSum(runs, f) {
  const o = {};
  for (const r of runs) for (const [k, v] of Object.entries(f(r) || {})) o[k] = (o[k] || 0) + v;
  return o;
}
function waveMax(runs) {
  const d = {};
  for (const r of runs) { const w = r.maxWaveUnlocked || 0; d[w] = (d[w] || 0) + 1; }
  return d;
}

for (const [name, D] of [['BEFORE', before], ['AFTER', after]]) {
  const runs = D.runs;
  const tradedId = objSum(runs, r => r.identifyBy).traded || 0;
  const trOut = objSum(runs, r => r.tradeOutcomes);
  const trMeet = sum(runs, r => r.traderMeetings);
  const trOffer = sum(runs, r => r.tradeOffers);
  const trDecl = objSum(runs, r => r.tradeDeclined);
  const trNoOffer = objSum(runs, r => r.tradeNoOffer);
  const mentions = sum(runs, r => r.traderMentions);
  const deepTrades = sum(runs, r => r.deepTrades);
  const deepTotal = sum(runs, r => r.trDeepTotal);
  const deepVia = objSum(runs, r => r.trDeepVia);
  const poolFull = [];
  for (const r of runs) for (const n of (r.trPoolFull || [])) poolFull.push(n);
  poolFull.sort((a, b) => a - b);
  const days = runs.map(r => r.days).sort((a, b) => a - b);
  const med = days[Math.floor(days.length / 2)];
  const pDeaths = sum(runs, r => r.playerDeaths), vDeaths = sum(runs, r => r.villagerDeaths);
  const pBuck = objSum(runs, r => r.deathBucketsP), vBuck = objSum(runs, r => r.deathBucketsV);
  const share = (o, k, t) => t ? ((o[k] || 0) / t * 100).toFixed(0) + '%' : '-';
  const noOfferTot = Object.values(trNoOffer).reduce((a, b) => a + b, 0) || 1;
  console.log(`=== ${name} (${runs.length} seeds x 200d) ===`);
  console.log(`trader: mentions=${mentions} meetings=${trMeet} offers=${trOffer} outcomes=${JSON.stringify(trOut)} declined=${JSON.stringify(trDecl)}`);
  console.log(`near-miss noOffer: ${JSON.stringify(trNoOffer)}  tradeable-empty share=${(100 * (trNoOffer['tradeable-empty'] || 0) / noOfferTot).toFixed(0)}%`);
  console.log(`POOL GROWTH: deep plants gained=${deepTotal}  deep-plant trades completed=${deepTrades}  deepVia=${JSON.stringify(deepVia)}`);
  console.log(`pool size (full, per trader end-state): n=${poolFull.length} median=${poolFull[Math.floor(poolFull.length / 2)] || 0} max=${poolFull[poolFull.length - 1] || 0} dist=${JSON.stringify(poolFull.reduce((o, n) => { o[n] = (o[n] || 0) + 1; return o; }, {}))}`);
  console.log(`traded identifications (identifyPlant 'traded'): ${tradedId}`);
  console.log(`combines: ${sum(runs, r => r.combines)}  nearMiss: ${sum(runs, r => r.nearMiss)}`);
  console.log(`survival: median=${med}d max=${days[days.length - 1]}d  deaths P/V=${pDeaths}/${vDeaths}`);
  console.log(`player death causes: starv=${share(pBuck, 'starvation', pDeaths)} combat=${share(pBuck, 'combat', pDeaths)}`);
  console.log(`villager death causes: ${Object.entries(vBuck).map(([k, v]) => k + ':' + share(vBuck, k, vDeaths)).join(' ')}`);
  console.log(`wave max-unlock dist: ${JSON.stringify(waveMax(runs))}  arc3: ${runs.filter(r => r.maxArc >= 3).length}/${runs.length}  scale>vil: ${runs.filter(r => r.maxScale !== 'village').length}  won: ${runs.filter(r => r.won).length}`);
  const pl = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of runs) for (const l of [1, 2, 3, 4]) pl[l] += (r.ks.plantLevels || {})[l] || 0;
  console.log(`player plant L1/L2/L3/L4: ${pl[1]}/${pl[2]}/${pl[3]}/${pl[4]}  prepKnown: ${sum(runs, r => r.ks.prepKnown)}  teaches P->V: ${sum(runs, r => r.teachPlant)}`);
  console.log(`counters: ${sum(runs, r => r.countersDiscovered)}  traps crafted/looted: ${sum(runs, r => r.trapsCrafted)}/${sum(runs, r => r.trapsLooted)}`);
  console.log('');
}
// per-seed trader detail for the after run
console.log('--- AFTER per-seed trader detail ---');
for (const r of after.runs) {
  const names = r.trTraderNames || {};
  const deepNamed = Object.entries(r.trDeepByTrader || {}).map(([id, n]) => `${names[id] || id}:${n}`).join(',');
  console.log(`seed ${r.seed}: days=${r.days} traders=${r.trTradersEver || 0}(alive ${r.trTradersAlive || 0}) meet=${r.traderMeetings || 0} offer=${r.tradeOffers || 0} out=${JSON.stringify(r.tradeOutcomes || {})} idTraded=${(r.identifyBy || {}).traded || 0} deepGained=${r.trDeepTotal || 0}{${deepNamed}} deepTrades=${r.deepTrades || 0} poolFull=${JSON.stringify(r.trPoolFull || [])} noOffer=${JSON.stringify(r.tradeNoOffer || {})}`);
}
// pool growth over time: day-50/100/150/200 snapshots, after run only
console.log('\n--- AFTER pool size over time (per-trader full pool at day snapshots) ---');
for (const d of [50, 100, 150, 200]) {
  const sizes = [];
  for (const r of after.runs) {
    const snap = (r.knowSnap || {})[d];
    if (snap && snap.traderPools) for (const t of snap.traderPools) sizes.push(t.full);
  }
  sizes.sort((a, b) => a - b);
  console.log(`day ${d}: n=${sizes.length} median=${sizes[Math.floor(sizes.length / 2)] || 0} max=${sizes[sizes.length - 1] || 0}`);
}
