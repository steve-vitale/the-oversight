#!/usr/bin/env node
// analyze-shelling-b.js — verdict analyzer for sim-shelling-b (pure).
// Usage: node scripts/analyze-shelling-b.js <baseline.jsonl> <armed.jsonl> [--mode pilot|confirm]
// Reads per-seed driver lines, prints per-seed + band tables and the
// prereg verdict. No sim, no Game, no file writes (stdout only).
'use strict';
const fs = require('fs');

function fail(msg) { console.error('ANALYZER FAIL: ' + msg); process.exit(2); }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function perSeed(j) {
  const live = (j.homecomings || []).filter((h) => !h.overAtEntry);
  let unload = 0, donate = 0;
  for (const h of live) unload += h.unloadKcal || 0;
  for (const d of (j.donates || [])) donate += d.donateKcal || 0;
  const eligible = live.filter((h) => h.packBefore && h.packBefore.eligible);
  const firedEligible = eligible.filter((h) => h.habit && h.habit.fired);
  const unloadedEligible = eligible.filter((h) => (h.unloadKcal || 0) > 0);
  let lots = 0, ticks = 0;
  const skips = {};
  let capBlockedEligible = 0;
  for (const h of live) {
    if (h.habit && h.habit.fired) { lots += h.habit.lots || 0; ticks += h.habit.ticksCharged || 0; }
    else if (h.habit && h.habit.reason) skips[h.habit.reason] = (skips[h.habit.reason] || 0) + 1;
    if (h.packBefore && h.packBefore.eligible && (h.pantryRoom === 0)) capBlockedEligible++;
  }
  const maxCombined = live.reduce((m, h) => Math.max(m, (h.packBefore && h.packBefore.combined) || 0), 0);
  const flipSeed = unload > 0 && live.some((h) => (h.unloadKcal || 0) > 0 &&
    h.packBefore && h.packBefore.finishedKcal <= 2000 && (h.packBefore.shelledNet || 0) > 0);
  return { seed: j.seed, arm: j.arm, end: j.endReason, daysAlive: j.daysAlive,
    wave: j.maxWaveUnlocked, liveReturns: live.length, unload, donate,
    eligible: eligible.length, firedEligible: firedEligible.length,
    unloadedEligible: unloadedEligible.length,
    eligibleUnloadRate: eligible.length ? unloadedEligible.length / eligible.length : null,
    lots, ticks, skips, capBlockedEligible,
    haulSizeShaped: maxCombined < 2000, maxCombined,
    scholarStarvationDeaths: j.scholarStarvationDeaths || 0,
    deaths: (j.deaths || []).length, flipSeed };
}

function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const mode = (process.argv.slice(2).find((a) => a.startsWith('--mode=')) || '--mode=pilot').split('=')[1];
  if (args.length !== 2) fail('usage: analyze-shelling-b.js <baseline.jsonl> <armed.jsonl> [--mode pilot|confirm]');
  const read = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const base = read(args[0]).map(perSeed);
  const armed = read(args[1]).map(perSeed);
  if (!base.length || base.length !== armed.length) fail('baseline/armed seed counts differ or empty');
  const bBySeed = new Map(base.map((s) => [s.seed, s]));
  const rows = [];
  for (const a of armed) {
    const b = bBySeed.get(a.seed);
    if (!b) fail('armed seed ' + a.seed + ' missing from baseline');
    rows.push({ seed: a.seed, baseUnload: b.unload, armedUnload: a.unload,
      baseEligible: b.eligible, armedEligible: a.eligible,
      armedFiredEligible: a.firedEligible, armedUnloadedEligible: a.unloadedEligible,
      armedEligibleRate: a.eligibleUnloadRate, lots: a.lots, ticks: a.ticks,
      haulSizeShaped: a.haulSizeShaped, maxCombined: a.maxCombined,
      baseFlip: b.flipSeed, armedFlip: a.flipSeed,
      baseDays: b.daysAlive, armedDays: a.daysAlive,
      baseStarve: b.scholarStarvationDeaths, armedStarve: a.scholarStarvationDeaths,
      end: a.end, wave: a.wave });
  }
  const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
  const totBaseUnload = sum(rows, 'baseUnload'), totArmedUnload = sum(rows, 'armedUnload');
  const totBaseEligible = sum(rows, 'baseEligible'), totArmedEligible = sum(rows, 'armedEligible');
  const totFired = sum(rows, 'armedFiredEligible'), totUnloaded = sum(rows, 'armedUnloadedEligible');
  const totBaseUnloaded = base.reduce((t, s) => t + s.unloadedEligible, 0);
  const armedRate = totArmedEligible ? totUnloaded / totArmedEligible : null;
  const baseRate = totBaseEligible ? totBaseUnloaded / totBaseEligible : null;
  const fireRate = totArmedEligible ? totFired / totArmedEligible : null;
  const flipSeeds = rows.filter((r) => r.baseUnload === 0 && r.armedUnload > 0 && r.armedFlip);
  const medBase = median(base.map((s) => s.daysAlive)), medArmed = median(armed.map((s) => s.daysAlive));
  const starveBase = sum(base.map((s) => ({ scholarStarvationDeaths: s.scholarStarvationDeaths })), 'scholarStarvationDeaths');
  const starveArmed = sum(armed.map((s) => ({ scholarStarvationDeaths: s.scholarStarvationDeaths })), 'scholarStarvationDeaths');
  const haulCount = rows.filter((r) => r.haulSizeShaped).length;
  console.log('# sim-shelling-b — paired before/after (' + mode + ', ' + rows.length + ' seeds)');
  console.log('| seed | baseUnload | armedUnload | baseElig | armedElig | firedElig | unloadedElig | lots | ticks | haulSize | baseDays | armedDays |');
  for (const r of rows) console.log('| ' + r.seed + ' | ' + r.baseUnload + ' | ' + r.armedUnload + ' | ' + r.baseEligible + ' | ' + r.armedEligible + ' | ' + r.armedFiredEligible + ' | ' + r.armedUnloadedEligible + ' | ' + r.lots + ' | ' + r.ticks + ' | ' + (r.haulSizeShaped ? 'YES' : 'no') + ' | ' + r.baseDays + ' | ' + r.armedDays + ' |');
  console.log('\nBAND: baseUnload=' + totBaseUnload + ' armedUnload=' + totArmedUnload +
    ' baseEligible=' + totBaseEligible + ' armedEligible=' + totArmedEligible +
    ' firedEligible=' + totFired + ' unloadedEligible=' + totUnloaded);
  console.log('RATES: fireRate=' + (fireRate === null ? 'null (0 eligible)' : fireRate.toFixed(3)) +
    ' armedEligibleUnloadRate=' + (armedRate === null ? 'null' : armedRate.toFixed(3)) +
    ' baseEligibleUnloadRate=' + (baseRate === null ? 'null' : baseRate.toFixed(3)));
  console.log('FLIP SEEDS (base 0 -> armed >0, shelling-attributed): ' + (flipSeeds.length ? flipSeeds.map((r) => r.seed).join(',') : 'none'));
  console.log('HAUL-SIZE-SHAPED SEEDS (maxCombined < 2000, descriptive only): ' + haulCount + ' ' +
    rows.filter((r) => r.haulSizeShaped).map((r) => r.seed).join(','));
  console.log('GUARDRAIL: medianDays base=' + medBase + ' armed=' + medArmed +
    ' scholarStarvation base=' + starveBase + ' armed=' + starveArmed);
  console.log('TICKS: totalLots=' + sum(rows, 'lots') + ' totalTicks=' + sum(rows, 'ticks') +
    ' (must equal 4 x lots: ' + (sum(rows, 'ticks') === 4 * sum(rows, 'lots') ? 'PASS' : 'FAIL') + ')');
  let verdict, reasons = [];
  if (mode === 'pilot') {
    const fireOk = fireRate !== null && fireRate >= 0.8;
    const unloadOk = totArmedUnload > totBaseUnload;
    const flipOk = flipSeeds.length >= 1;
    if (fireRate === null) { verdict = 'UNJUDGED (0 eligible returns)'; }
    else if (fireOk && unloadOk && flipOk) verdict = 'GO';
    else { verdict = 'NO-GO (killed-at-pilot)'; if (!fireOk) reasons.push('firing ' + fireRate.toFixed(3) + ' < 0.80'); if (!unloadOk) reasons.push('armed unload not > baseline'); if (!flipOk) reasons.push('no shelling-attributed flip seed'); }
  } else {
    const rateOk = armedRate !== null && armedRate >= 0.8 && baseRate !== null && (armedRate - baseRate) >= 0.30;
    const survOk = medArmed !== null && medBase !== null && medArmed >= 0.8 * medBase;
    const starveOk = starveArmed <= starveBase + 2;
    const tickOk = sum(rows, 'ticks') === 4 * sum(rows, 'lots');
    if (rateOk && survOk && starveOk && tickOk) verdict = 'GO';
    else { verdict = 'NO-GO'; if (!rateOk) reasons.push('eligible unload rate'); if (!survOk) reasons.push('survival guardrail'); if (!starveOk) reasons.push('starvation guardrail'); if (!tickOk) reasons.push('tick accounting'); }
  }
  console.log('\nVERDICT (' + mode + '): ' + verdict + (reasons.length ? ' — ' + reasons.join('; ') : ''));
  console.log(JSON.stringify({ mode, seeds: rows.length, totBaseUnload, totArmedUnload,
    totBaseEligible, totArmedEligible, totFired, totUnloaded, fireRate, armedRate, baseRate,
    flipSeeds: flipSeeds.map((r) => r.seed), haulSizeShaped: haulCount,
    medBase, medArmed, starveBase, starveArmed,
    totalLots: sum(rows, 'lots'), totalTicks: sum(rows, 'ticks'), verdict }));
}
main();
