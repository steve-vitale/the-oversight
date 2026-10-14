#!/usr/bin/env node
// PILOT: villager godhood achievement rate (Steve 2026-10-13 metric).
// "We know it's working when villagers occasionally obtain it by sim run end."
// Target: 5-15% of runs have >=1 villager godhood by run end.
// Horizon: 150 days (reachability lever, MEASUREMENT.md section 10).
// Seeds: 7,42,99,1234,555,777,2026,31337 (8-seed pilot).
// Policy: competent (baseline).
'use strict';
const { runComparison } = require('./sweep-compare');

const SEEDS = (process.env.SEEDS || '7,42,99,1234,555,777,2026,31337').split(',').map(s => parseInt(s, 10));
const DAYS = parseInt(process.env.DAYS || '150', 10);

function countVillagerGodhoods(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const ngh = v.npcGodhood || {};
    let total = 0;
    const byGodhood = {};
    for (const vid of Object.keys(ngh)) {
      const active = (ngh[vid] || {}).active || [];
      total += active.length;
      for (const gid of active) byGodhood[gid] = (byGodhood[gid] || 0) + 1;
    }
    return { total, byGodhood };
  } catch (e) { return { total: 0, byGodhood: {} }; }
}

function countVillagerSynergies(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const ns = v.npcSynergies || {};
    let total = 0;
    for (const vid of Object.keys(ns)) total += (ns[vid] || []).length;
    return total;
  } catch (e) { return 0; }
}

function maxVillagerAbilities(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const na = v.npcAbilities || {};
    let mx = 0;
    for (const vid of Object.keys(na)) mx = Math.max(mx, (na[vid] || []).length);
    return mx;
  } catch (e) { return 0; }
}

(async () => {
  const rep = await runComparison({
    label: 'godhood-villager-pilot',
    seeds: SEEDS,
    policies: ['competent'],
    days: DAYS,
    extraMetrics: (Game, ctx) => {
      const gh = countVillagerGodhoods(Game);
      return {
        villager_godhoods: gh.total,
        villager_godhood_list: JSON.stringify(gh.byGodhood),
        villager_synergies: countVillagerSynergies(Game),
        villager_max_abilities: maxVillagerAbilities(Game),
      };
    },
  });
  // summarize
  const rows = rep.runs || [];
  let runsWithGodhood = 0, totalGodhoods = 0;
  console.log('\n--- VILLAGER GODHOOD PILOT ---');
  for (const r of rows) {
    const ex = r.extra || {};
    const g = ex.villager_godhoods || 0;
    if (g > 0) runsWithGodhood++;
    totalGodhoods += g;
    console.log(`seed ${r.seed}: godhoods=${g} ${ex.villager_godhood_list || ''} synergies=${ex.villager_synergies} maxAbils=${ex.villager_max_abilities} days=${r.days}`);
  }
  const n = rows.length;
  const rate = n ? (runsWithGodhood / n) : 0;
  console.log(`\nRuns with >=1 villager godhood: ${runsWithGodhood}/${n} = ${(rate * 100).toFixed(1)}% (target 5-15%)`);
  console.log(`Total villager godhoods: ${totalGodhoods}`);
  console.log(rate >= 0.05 && rate <= 0.15 ? 'IN BAND' : (rate < 0.05 ? 'BELOW BAND (too hard)' : 'ABOVE BAND (too easy)'));
})().catch(e => { console.error(e); process.exit(1); });
