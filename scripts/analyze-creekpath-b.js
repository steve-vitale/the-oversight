#!/usr/bin/env node
// analyze-creekpath-b.js — pooled census over creekpath-trace-b corpora.
// Usage: node scripts/analyze-creekpath-b.js <corpus-dir> [more dirs...]
// Prints per-seed rows, the pooled DIAG verdict (P_alt vs the 0.50 bar),
// refused-evening detail, streaks, and wall-ish numbers (wave reach,
// median survival). Writes nothing (stdout only; caller redirects).
'use strict';
const fs = require('fs');
const path = require('path');

const dirs = process.argv.slice(2);
if (!dirs.length) { console.error('usage: analyze-creekpath-b.js <corpus-dir> [...]'); process.exit(2); }
const recs = [];
for (const d of dirs) {
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json')).sort()) {
    try { recs.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'))); }
    catch (e) { console.error('skip unreadable', f, String(e.message).slice(0, 100)); }
  }
}
recs.sort((a, b) => a.seed - b.seed);

function starvationDeaths(r) {
  return (r.deaths || []).filter((d) => /starv|hunger/i.test(JSON.stringify(d))).length;
}

let totEvenings = 0, totRefused = 0, totAlt = 0, totRoute = 0, totFix = 0, totRouteOnly = 0, totFixOnly = 0;
const kindHist = {}, legHist = {}, refusedDetail = [];
const survivals = [];
for (const r of recs) {
  const evs = r.evenings || [];
  const refused = evs.filter((e) => e.probe === 'refused');
  const alt = refused.filter((e) => e.hasAlternative);
  const route = refused.filter((e) => e.routeAround && e.routeAround.path);
  const fix = refused.filter((e) => e.crossingFix && e.crossingFix.feasible);
  const routeOnly = refused.filter((e) => (e.routeAround && e.routeAround.path) && !(e.crossingFix && e.crossingFix.feasible));
  const fixOnly = refused.filter((e) => !(e.routeAround && e.routeAround.path) && (e.crossingFix && e.crossingFix.feasible));
  for (const e of refused) {
    kindHist[e.block.blockType] = (kindHist[e.block.blockType] || 0) + 1;
    legHist[e.block.leg] = (legHist[e.block.leg] || 0) + 1;
    refusedDetail.push({ seed: r.seed, day: e.loopDay, at: e.tile + ' (' + e.mapPx + ',' + e.mapPy + ')', dist: e.havenDistance, block: e.block.blockType + '@' + e.block.x + ',' + e.block.y + '/' + e.block.leg, route: e.routeAround && e.routeAround.path ? ('yes len ' + e.routeAround.length) : 'no', fix: e.crossingFix ? (e.crossingFix.kind + ' feasible=' + e.crossingFix.feasible + (e.crossingFix.wood !== undefined ? ' wood=' + e.crossingFix.wood : '')) : '?', alt: !!e.hasAlternative });
  }
  // streaks: consecutive refused evenings (any tile) within the seed
  let streak = 0, streaks = 0, longest = 0;
  for (const e of evs) {
    if (e.probe === 'refused') { streak++; longest = Math.max(longest, streak); }
    else { if (streak >= 2) streaks++; streak = 0; }
  }
  if (streak >= 2) streaks++;
  const probes = {};
  for (const e of evs) probes[e.probe] = (probes[e.probe] || 0) + 1;
  survivals.push(r.daysAlive);
  totEvenings += evs.length; totRefused += refused.length; totAlt += alt.length;
  totRoute += route.length; totFix += fix.length; totRouteOnly += routeOnly.length; totFixOnly += fixOnly.length;
  console.log(`seed ${r.seed}: days=${r.daysAlive} end=${r.endReason} wave=${r.maxWaveUnlocked} wavesKills=${JSON.stringify(r.waveKills || {})} deaths=${(r.deaths || []).length} starv=${starvationDeaths(r)} probes=${JSON.stringify(probes)} refused=${refused.length} alt=${alt.length} route=${route.length} fix=${fix.length} streaks>=2:${streaks} longest:${longest}`);
}
survivals.sort((a, b) => a - b);
const med = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
const pAlt = totRefused ? totAlt / totRefused : null;
console.log('\n=== POOLED ===');
console.log(`seeds=${recs.length} evenings=${totEvenings} refused=${totRefused} withAlternative=${totAlt} P_alt=${pAlt === null ? 'n/a (no refused evenings)' : pAlt.toFixed(3)}`);
console.log(`routeAround=${totRoute} crossingFix=${totFix} routeOnly=${totRouteOnly} fixOnly=${totFixOnly}`);
console.log(`blockKind=${JSON.stringify(kindHist)} leg=${JSON.stringify(legHist)}`);
console.log(`medianSurvival=${med} maxWave=${JSON.stringify(recs.map((r) => r.maxWaveUnlocked))}`);
console.log(`DIAG-GO (P_alt>=0.50): ${pAlt !== null && pAlt >= 0.50}`);
console.log('\n=== REFUSED EVENINGS ===');
for (const d of refusedDetail) console.log(JSON.stringify(d));
const c10757 = recs.find((r) => r.seed === 10757);
if (c10757) {
  console.log('\n=== 10757 CORRIDOR (fresh-map snapshot) ===');
  console.log(JSON.stringify(c10757.corridor, null, 1));
  console.log('=== 10757 REFUSED ROWS ===');
  for (const e of c10757.evenings.filter((x) => x.probe === 'refused')) {
    console.log(`day ${e.loopDay}: ${e.tile} (${e.mapPx},${e.mapPy}) dist ${e.havenDistance} block ${e.block.blockType}@${e.block.x},${e.block.y}/${e.block.leg} route=${e.routeAround && e.routeAround.path ? JSON.stringify(e.routeAround.path) : 'none'} fix=${JSON.stringify(e.crossingFix)} wood=${e.wood} swimmer=${e.swimmer}`);
  }
}
