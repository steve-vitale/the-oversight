#!/usr/bin/env node
// scripts/analyze-crumbs-20261016.js — before/after analysis for the CRUMB-FIX arm.
// Compares control vs armed census dirs (sweep-sharcensus-20261014.js output).
//
// Pre-registered PRIMARY: crumbs-left starved-villager-days 7->0 (full census
// shape). Guardrails: empty-pantry share not worse than control; national >=
// control-2; median survival >= control-10d; no new death mode; no new
// starvation-path inflation.
//
// Usage:
//   node scripts/analyze-crumbs-20261016.js <control-census-dir> <armed-census-dir>
//     <control-out.json> <armed-out.json>
'use strict';
const fs = require('fs');

function loadCensus(dir) {
  const rows = [];
  const perSeed = {};
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('-census.json')) continue;
    const j = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
    perSeed[`${j.policy}-s${j.seed}`] = { days: j.days, endReason: j.endReason };
    for (const r of j.rows) rows.push({ policy: j.policy, seed: j.seed, ...r });
  }
  return { rows, perSeed };
}
function loadOut(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function summarize(label, census, out) {
  const starve = {};
  let starved = 0, meals = 0, gave = 0, took = 0;
  for (const r of census.rows) {
    meals++;
    gave += r.gave || 0; took += r.drew || 0;
    if (r.starved) { starved++; starve[r.starvePath || 'unknown'] = (starve[r.starvePath || 'unknown'] || 0) + 1; }
  }
  const agg = out.agg;
  const daysArr = Object.values(census.perSeed).map(s => s.days).sort((a, b) => a - b);
  return {
    label, meals, starved, starvePaths: starve,
    crumbsLeft: starve['crumbs-left'] || 0,
    emptyPantry: starve['empty-pantry'] || 0,
    emptyShare: starved ? +((starve['empty-pantry'] || 0) / starved).toFixed(3) : 0,
    medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    national: agg.byPolicy ? Object.values(agg.byPolicy).reduce((t, b) => t + b.national, 0) : 0,
    won: agg.byPolicy ? Object.values(agg.byPolicy).reduce((t, b) => t + b.won, 0) : 0,
    deaths: agg.deathCauses || {},
    gaveK: Math.round(gave / 1000), tookK: Math.round(took / 1000),
  };
}

function main() {
  const [cDir, aDir, cOut, aOut] = process.argv.slice(2);
  if (!cDir || !aDir || !cOut || !aOut) { console.error('usage: analyze-crumbs-20261016.js <control-census> <armed-census> <control-out> <armed-out>'); process.exit(1); }
  const C = loadCensus(cDir), A = loadCensus(aDir);
  const c = summarize('CONTROL', C, loadOut(cOut));
  const a = summarize('ARMED  ', A, loadOut(aOut));
  for (const s of [c, a]) {
    console.log(`\n=== ${s.label} ===`);
    console.log(`  meals=${s.meals} starvedDays=${s.starved} paths=${JSON.stringify(s.starvePaths)}`);
    console.log(`  crumbsLeft=${s.crumbsLeft} emptyPantry=${s.emptyPantry} emptyShare=${s.emptyShare}`);
    console.log(`  medianDays=${s.medianDays} national=${s.national} won=${s.won} gaveK=${s.gaveK} tookK=${s.tookK}`);
    console.log(`  deaths=${JSON.stringify(s.deaths)}`);
  }
  console.log('\n=== DELTAS (armed - control) ===');
  console.log(`  crumbsLeft: ${c.crumbsLeft} -> ${a.crumbsLeft} (GO: 0 on full shape)`);
  console.log(`  emptyPantry share: ${c.emptyShare} -> ${a.emptyShare} (guardrail: not worse)`);
  console.log(`  national: ${c.national} -> ${a.national} (guardrail: >= ${c.national - 2})`);
  console.log(`  medianDays: ${c.medianDays} -> ${a.medianDays} (guardrail: >= ${c.medianDays - 10})`);
  const deathKeys = new Set([...Object.keys(c.deaths), ...Object.keys(a.deaths)]);
  const newModes = [...deathKeys].filter(k => (c.deaths[k] || 0) === 0 && (a.deaths[k] || 0) > 0);
  console.log(`  new death modes: ${newModes.length ? newModes.join(',') : 'none'} (guardrail: none)`);
  console.log(`  starvedDays: ${c.starved} -> ${a.starved}`);

  // Crumb-take sense beats: same villager-day, control starved on crumbs-left,
  // armed drew more. (0.42% duplicate (vid,day) rows — key on day+vid+order.)
  const cKey = {};
  for (const r of C.rows) cKey[`${r.policy}|${r.seed}|${r.day}|${r.vid}|${r.order}`] = r;
  const beats = [];
  for (const r of A.rows) {
    const k = `${r.policy}|${r.seed}|${r.day}|${r.vid}|${r.order}`;
    const cr = cKey[k];
    if (cr && cr.starvePath === 'crumbs-left' && (r.drew || 0) > (cr.drew || 0) && !r.starved) {
      beats.push({ policy: r.policy, seed: r.seed, day: r.day, name: r.name,
        cAte: Math.round(cr.ate), cNeed: Math.round(cr.need), cDrew: Math.round(cr.drew),
        cFresh: Math.round(cr.pantryFreshAfter), aAte: Math.round(r.ate), aDrew: Math.round(r.drew) });
    }
  }
  console.log(`\n=== SENSE BEATS: crumb-takes that fixed a starvation (${beats.length}) ===`);
  for (const b of beats.slice(0, 5)) {
    console.log(`  ${b.policy} s${b.seed} d${b.day} ${b.name}: control ate ${b.cAte}/${b.cNeed} (drew ${b.cDrew}, pantry still held ${b.cFresh} fresh) -> armed ate ${b.aAte} (drew ${b.aDrew}) — the full piece was taken, no longer starving.`);
  }
  // Over-take cost: armed over-draw beyond want on crumb-take days.
  let overKcal = 0, overDays = 0;
  for (const b of beats) {
    const want = b.cNeed; // same need both sides (same seed/policy/day/vid)
    if (b.aAte > want) { overKcal += b.aAte - want; overDays++; }
  }
  console.log(`  extra pantry cost of the fix on fixed days: ${Math.round(overKcal)} kcal over ${overDays} villager-days`);
}

if (require.main === module) main();
