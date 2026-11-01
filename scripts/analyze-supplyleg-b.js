#!/usr/bin/env node
// analyze-supplyleg-b.js — supply-leg share analyzer (DIAG ONLY).
// (sim-supplyleg-b; prereg: evidence/2026-11-01/sim-supplyleg-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Reads one corpus dir of per-seed JSON files (as written by
// scripts/split-absencehunt-jsonl-b.js for the supplyleg trace driver)
// and writes a census JSON to <outFile>. Every logged event lands in
// exactly one bucket (prereg leg definitions); shares sum to 100%.
//
// Usage: node scripts/analyze-supplyleg-b.js <corpusDir> <outFile>
//   With out.json: writes the census JSON there. Without: prints it.
//   Exit 0 with the census; exit 2 on unreadable corpus dir.
'use strict';
const fs = require('fs');
const path = require('path');

// Leg order for reporting (supply legs first, then non-dominance buckets).
const LEG_ORDER = ['expedition', 'npc-forage', 'meal-surplus',
  'scholar-unload', 'scholar-donate', 'favor-delivery', 'fish', 'traps',
  'garden', 'tribute', 'other-supply', 'direct-other',
  'processing', 'contest-prize'];
const SUPPLY_LEGS = new Set(['expedition', 'npc-forage', 'meal-surplus',
  'scholar-unload', 'scholar-donate', 'favor-delivery', 'fish', 'traps',
  'garden', 'tribute', 'other-supply', 'direct-other']);

function classifyEvent(ev) {
  const stack = ev.stack || '';
  const name = ev.name || '';
  // Direct pushes: transforms and zero-kcal flesh are not inflows.
  if (ev.t === 'direct') {
    if (/smoke|preserve|rack/i.test(stack)) return 'transform-skip';
    if ((ev.kcal || 0) <= 0) return 'zero-kcal';
    if (/contest/i.test(stack)) return 'contest-prize';
    if (/^Tribute grain/.test(name)) return 'tribute';
    return 'direct-other';
  }
  // Garden flag wins over method/name: the food's origin is the garden.
  if (ev.garden) return 'garden';
  if (ev.t === 'stock') {
    if (name === 'Expedition haul' || name === 'Expedition meat') return 'expedition';
    if (/expeditionReturn|haulKcal|haulUnknown/.test(stack)) return 'expedition';
    if (name === 'Fish catch') return 'fish';
    if (/^Snared meat/.test(name) || /^Pit meat/.test(name)) return 'traps';
    if (name === 'Garden harvest') return 'garden';
    if (name === 'Foraged food') return 'npc-forage';
    return 'other-supply';
  }
  if (ev.t === 'deposit') {
    if (/returnToVillage/.test(stack)) return 'scholar-unload';
    if (/donateToPantry/.test(stack)) return 'scholar-donate';
    if (/favor/i.test(stack)) return 'favor-delivery';
    return 'other-supply';
  }
  if (ev.t === 'pantryAdd') {
    if (/contest/i.test(stack)) return 'contest-prize';
    return 'processing';
  }
  if (ev.t === 'surplus') return 'meal-surplus';
  return 'direct-other';
}

// Dominance rule (prereg, fixed): highest mean supply-leg share, top
// supply leg on >= 6 of N seeds, mean share >= 35%. Else 'no dominant leg'.
function dominanceVerdict(perSeed, legs) {
  const n = perSeed.length;
  if (n === 0) return { verdict: 'no dominant leg', reason: 'no seeds' };
  const means = {};
  const tops = {};
  for (const leg of legs) { means[leg] = 0; tops[leg] = 0; }
  for (const s of perSeed) {
    let best = null, bestShare = -1;
    for (const leg of legs) {
      const sh = s.shares[leg] || 0;
      means[leg] += sh / n;
      if (sh > bestShare) { bestShare = sh; best = leg; }
    }
    if (best !== null && bestShare > 0) tops[best]++;
  }
  let dom = null, domMean = -1;
  for (const leg of legs) if (means[leg] > domMean) { domMean = means[leg]; dom = leg; }
  if (dom !== null && domMean >= 0.35 && tops[dom] >= Math.ceil((6 / 8) * n) && domMean > 0) {
    return { verdict: 'dominant', leg: dom, meanShare: domMean, topSeeds: tops[dom], nSeeds: n };
  }
  return { verdict: 'no dominant leg', topLeg: dom, topMeanShare: domMean, topSeeds: dom ? tops[dom] : 0, nSeeds: n };
}

function analyzeSeed(inst) {
  const byLeg = {};
  const byName = {};
  for (const leg of LEG_ORDER) byLeg[leg] = 0;
  let transformSkipped = 0, zeroKcalUnits = 0, eventCount = 0;
  for (const ev of (inst.events || [])) {
    eventCount++;
    const leg = classifyEvent(ev);
    if (leg === 'transform-skip') { transformSkipped++; continue; }
    if (leg === 'zero-kcal') { zeroKcalUnits += (ev.units || 1); continue; }
    byLeg[leg] = (byLeg[leg] || 0) + (ev.kcal || 0);
    const nm = (ev.t || '?') + ':' + (ev.name || '(unnamed)');
    byName[nm] = (byName[nm] || 0) + (ev.kcal || 0);
  }
  const total = LEG_ORDER.reduce((t, l) => t + (byLeg[l] || 0), 0);
  const shares = {};
  for (const leg of LEG_ORDER) shares[leg] = total > 0 ? byLeg[leg] / total : 0;
  let topSupply = null, topSupplyShare = -1;
  for (const leg of LEG_ORDER) {
    if (!SUPPLY_LEGS.has(leg)) continue;
    if (shares[leg] > topSupplyShare) { topSupplyShare = shares[leg]; topSupply = leg; }
  }
  const scholarSide = (byLeg['scholar-unload'] || 0) + (byLeg['scholar-donate'] || 0);
  return {
    seed: inst.seed, daysAlive: inst.daysAlive, endReason: inst.endReason,
    daysRecorded: (inst.decisions || []).length,
    totalInflowKcal: total, byLeg, shares,
    topSupplyLeg: topSupply, topSupplyShare,
    scholarSideKcal: scholarSide, scholarSideShare: total > 0 ? scholarSide / total : 0,
    transformSkipped, zeroKcalUnits, eventCount, byName,
  };
}

function main() {
  const dir = process.argv[2];
  const outFile = process.argv[3];
  if (!dir) { console.error('usage: analyze-supplyleg-b.js <corpusDir> [outFile]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  if (files.length === 0) { console.error('no corpus files in ' + dir); process.exit(2); }
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    perSeed.push(analyzeSeed(inst));
  }
  const legs = LEG_ORDER.filter((l) => SUPPLY_LEGS.has(l));
  const verdict = dominanceVerdict(perSeed, legs);
  const census = { seeds: perSeed.map((s) => s.seed), nSeeds: perSeed.length, perSeed, verdict };
  const text = JSON.stringify(census, null, 2);
  if (outFile) fs.writeFileSync(outFile, text + '\n');
  else process.stdout.write(text + '\n');
  // Human table on stderr for the evidence file.
  console.error('seed  total  top-supply-leg (share)  scholar-side');
  for (const s of perSeed) {
    console.error(String(s.seed) + '  ' + s.totalInflowKcal + '  ' + s.topSupplyLeg +
      ' (' + (s.topSupplyShare * 100).toFixed(1) + '%)  ' + (s.scholarSideShare * 100).toFixed(1) + '%');
  }
  console.error('VERDICT ' + JSON.stringify(verdict));
}

if (require.main === module) main();

module.exports = { classifyEvent, dominanceVerdict, analyzeSeed, LEG_ORDER, SUPPLY_LEGS };
