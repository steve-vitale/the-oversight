#!/usr/bin/env node
// scripts/analyze-crumbguard-20261016.js — before/after analysis for the
// CRUMB-GUARD arm (sim-crumbguard-b).
//
// Compares control vs armed census dirs (sweep-sharcensus-20261014.js output).
//
// Pre-registered PRIMARY: ABSOLUTE starvedDays — GO if armed <= control x
// 0.75 (control >= 8; below that: NO-COVERAGE). Heterogeneity lens: max
// per-seed (armed - control) starvedDays <= +1. Guardrails: national >=
// control-2; medianDays >= control-10; no new death mode; thirst deaths and
// exiled unchanged.
//
// Usage:
//   node scripts/analyze-crumbguard-20261016.js <control-census-dir> <armed-census-dir>
//     <control-out.json> <armed-out.json>
'use strict';
const fs = require('fs');

function loadCensus(dir, outRows) {
  const rows = [];
  const perSeed = {};
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('-census.json')) continue;
    const j = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
    const key = `${j.policy}-s${j.seed}`;
    // Wall fields (wave/national/table/won/deaths/exiled) live in the OUT
    // json's slim rows, not the census files — merge by seed key.
    const o = (outRows || {})[key] || {};
    perSeed[key] = {
      days: j.days, endReason: j.endReason,
      wave: o.waveReach || 1, maxArc: o.maxArc || 1, maxRank: o.maxRank || 'village',
      national: o.national || 0, table: o.table || 0, won: o.won || 0,
      deaths: o.deaths || {}, exiled: o.exiled || 0,
    };
    for (const r of j.rows) rows.push({ policy: j.policy, seed: j.seed, ...r });
  }
  return { rows, perSeed };
}
function loadOut(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function outRowsBySeed(out) {
  const m = {};
  for (const r of (out.rows || [])) m[`${r.policy}-s${r.seed}`] = r;
  return m;
}

function summarize(label, census, out) {
  const starve = {};
  const perSeedStarved = {};
  let starved = 0, meals = 0, thirst = 0;
  for (const r of census.rows) {
    meals++;
    if (r.starved) {
      starved++;
      perSeedStarved[`${r.policy}-s${r.seed}`] = (perSeedStarved[`${r.policy}-s${r.seed}`] || 0) + 1;
      starve[r.starvePath || 'unknown'] = (starve[r.starvePath || 'unknown'] || 0) + 1;
    }
  }
  const agg = out.agg;
  const daysArr = Object.values(census.perSeed).map(s => s.days).sort((a, b) => a - b);
  const waves = {};
  for (const s of Object.values(census.perSeed)) waves[s.wave] = (waves[s.wave] || 0) + 1;
  let national = 0, table = 0, won = 0, exiled = 0;
  for (const s of Object.values(census.perSeed)) {
    if (s.maxRank === 'national' || s.maxRank === 'global') national++;
    if (s.table) table++;
    if (s.won) won++;
    if (s.exiled) exiled++;
  }
  for (const s of Object.values(census.perSeed)) for (const [k, n] of Object.entries(s.deaths || {})) if (/thirst|dehydrat/i.test(k)) thirst += n;
  return {
    label, meals, starved, starvePaths: starve, perSeedStarved,
    medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    national, table, won, exiled, thirst, waves,
    deaths: agg.deathCauses || {},
    byPolicy: agg.byPolicy || {},
  };
}

function main() {
  const [cDir, aDir, cOut, aOut] = process.argv.slice(2);
  if (!cDir || !aDir || !cOut || !aOut) { console.error('usage: analyze-crumbguard-20261016.js <control-census> <armed-census> <control-out> <armed-out>'); process.exit(1); }
  const cOutJ = loadOut(cOut), aOutJ = loadOut(aOut);
  const C = loadCensus(cDir, outRowsBySeed(cOutJ)), A = loadCensus(aDir, outRowsBySeed(aOutJ));
  const c = summarize('CONTROL', C, cOutJ);
  const a = summarize('ARMED  ', A, aOutJ);
  for (const s of [c, a]) {
    console.log(`\n=== ${s.label} ===`);
    console.log(`  meals=${s.meals} starvedDays=${s.starved} paths=${JSON.stringify(s.starvePaths)}`);
    console.log(`  medianDays=${s.medianDays} maxDays=${s.maxDays} national=${s.national} table=${s.table} won=${s.won}`);
    console.log(`  waveReach=${JSON.stringify(s.waves)} thirstDeaths=${s.thirst} exiled=${s.exiled}`);
    console.log(`  deaths=${JSON.stringify(s.deaths)}`);
  }
  console.log('\n=== PRIMARY (absolute starvedDays) ===');
  const bar = c.starved >= 8 ? `armed <= ${(c.starved * 0.75).toFixed(1)}` : 'NO-COVERAGE (control < 8)';
  const primaryGo = c.starved >= 8 ? a.starved <= c.starved * 0.75 : null;
  console.log(`  control=${c.starved} armed=${a.starved} bar: ${bar} -> ${primaryGo === null ? 'NO-COVERAGE' : primaryGo ? 'GO' : 'NO-GO'}`);
  console.log('\n=== HETEROGENEITY LENS (max per-seed armed-control starvedDays <= +1) ===');
  const keys = [...new Set([...Object.keys(c.perSeedStarved), ...Object.keys(a.perSeedStarved)])].sort();
  let maxDelta = -Infinity;
  for (const k of keys) {
    const d = (a.perSeedStarved[k] || 0) - (c.perSeedStarved[k] || 0);
    if (d > maxDelta) maxDelta = d;
    if (d !== 0) console.log(`  ${k}: control=${c.perSeedStarved[k] || 0} armed=${a.perSeedStarved[k] || 0} delta=${d >= 0 ? '+' : ''}${d}`);
  }
  if (maxDelta === -Infinity) maxDelta = 0;
  console.log(`  max per-seed delta: ${maxDelta >= 0 ? '+' : ''}${maxDelta} -> ${maxDelta <= 1 ? 'GO' : 'NO-GO'}`);
  console.log('\n=== GUARDRAILS ===');
  console.log(`  national: ${c.national} -> ${a.national} (bar >= ${c.national - 2}) -> ${a.national >= c.national - 2 ? 'GO' : 'NO-GO'}`);
  console.log(`  medianDays: ${c.medianDays} -> ${a.medianDays} (bar >= ${c.medianDays - 10}) -> ${a.medianDays >= c.medianDays - 10 ? 'GO' : 'NO-GO'}`);
  const deathKeys = new Set([...Object.keys(c.deaths), ...Object.keys(a.deaths)]);
  const newModes = [...deathKeys].filter(k => (c.deaths[k] || 0) === 0 && (a.deaths[k] || 0) > 2);
  console.log(`  new death modes (n>2): ${newModes.length ? newModes.join(',') : 'none'} -> ${newModes.length ? 'NO-GO' : 'GO'}`);
  console.log(`  thirst deaths: ${c.thirst} -> ${a.thirst} (guardrail: unchanged) -> ${a.thirst === c.thirst ? 'GO' : 'CHECK'}`);
  console.log(`  exiled: ${c.exiled} -> ${a.exiled} (guardrail: unchanged) -> ${a.exiled === c.exiled ? 'GO' : 'CHECK'}`);

  // Sense beats: control starved crumbs-left, armed drew more on the same
  // villager-day. (0.42% duplicate (vid,day) rows — key on day+vid+order.)
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
  console.log(`\n=== SENSE BEATS: guard-takes that fixed a crumbs-left starvation (${beats.length}) ===`);
  for (const b of beats.slice(0, 5)) {
    console.log(`  ${b.policy} s${b.seed} d${b.day} ${b.name}: control ate ${b.cAte}/${b.cNeed} (drew ${b.cDrew}, pantry held ${b.cFresh} fresh) -> armed ate ${b.aAte} (drew ${b.aDrew}) — the guard took the full piece, no longer starving.`);
  }
  let overKcal = 0, overDays = 0;
  for (const b of beats) { if (b.aAte > b.cNeed) { overKcal += b.aAte - b.cNeed; overDays++; } }
  console.log(`  extra pantry cost of the guard on fixed days: ${Math.round(overKcal)} kcal over ${overDays} villager-days`);
}

if (require.main === module) main();
