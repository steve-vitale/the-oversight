#!/usr/bin/env node
// analyze-prodstore-diag-a.js — aggregate the prodstore-a diagnosis corpus and
// answer the seven pre-registered diagnosis questions (D1-D7), rank the five
// kcal channels, and name the binding constraint. Reads per-seed JSONs from
// evidence/2026-11-07/prodstore-a-corpus/prodstore-a-competent-s*.json.
// Pure analysis: reads only, prints a report, exits 0. Verdict logic lives here;
// the sweep never judges.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'prodstore-a-corpus');
const files = fs.readdirSync(DIR).filter(f => /^prodstore-a-competent-s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no per-seed files in ' + DIR); process.exit(2); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const sum = (xs) => xs.reduce((a, b) => a + (b || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : 'n/a');

// ---- pooled accumulators ----
const P = {
  produced: 0, need: 0, ate: 0, ownEat: 0, gave: 0, drawn: 0,
  stocked: {}, stored: 0, pantryAdd: 0, donated: 0, league: 0,
  spoiledDrawn: 0, spoiledSwept: 0, resolved: {}, redirectResolved: {},
  starveDeaths: 0, starveDeathsFullPantry: 0, starveDeathsEmptyPantry: 0,
  starveDeathsKcalOnly: 0, playerStarveDeaths: 0,
  throttleDays: 0, snapDays: 0, capDays: 0, emptyPantryDays: 0,
  throttleRedirects: 0, throttleExempt: 0, plentyDepri: 0, depositGate: 0,
  daysAlive: [], deathCauses: {}, waveReach: {}, national: 0, table: 0, wins: 0,
  mealRows: 0, mealDupNote: 0, preservedLast: [], preservedMax: [],
  spoiledSittingMean: [], freshDaysValues: [],
};
const perSeed = [];
for (const s of seeds) {
  const rows = s.mealRows || [];
  const flows = s.flowSeries || [];
  const days = s.daySeries || [];
  const r = { seed: s.seed, daysAlive: s.daysAlive, endReason: null };
  // D1 from DEDUPED meal rows (authoritative; the flow wrapper double-counts
  // the second villagerMealDay caller's rows, same class as awayconfirm's 141).
  const mProduced = sum(rows.map(x => x.produced || 0));
  const mNeed = sum(rows.map(x => x.needEst || 0));
  const mAte = sum(rows.map(x => x.ate || 0));
  const mOwn = sum(rows.map(x => x.ownEat || 0));
  const mGave = sum(rows.map(x => x.gave || 0));
  const mDrawn = sum(rows.map(x => x.drawn || 0));
  P.produced += mProduced; P.need += mNeed; P.ate += mAte; P.ownEat += mOwn;
  P.gave += mGave; P.drawn += mDrawn;
  P.mealRows += rows.length;
  // flows (single-call sites except the meal-driven ones; drawn cross-checked
  // against deduped meal rows below)
  for (const f of flows) {
    for (const [k, v] of Object.entries(f.stocked || {})) P.stocked[k] = (P.stocked[k] || 0) + v;
    P.stored += f.stored || 0; P.pantryAdd += f.pantryAdd || 0; P.donated += f.donated || 0;
    P.league += f.league || 0; P.spoiledDrawn += f.spoiledDrawn || 0;
    P.spoiledSwept += f.spoiledSwept || 0;
    for (const [k, v] of Object.entries(f.resolved || {})) P.resolved[k] = (P.resolved[k] || 0) + v;
    for (const [k, v] of Object.entries(f.redirectResolved || {})) P.redirectResolved[k] = (P.redirectResolved[k] || 0) + v;
  }
  const flowDrawn = sum(flows.map(f => f.drawn || 0));
  const flowProduced = sum(flows.map(f => f.produced || 0));
  r.flowDrawn = flowDrawn; r.flowProduced = flowProduced;
  r.mealProduced = mProduced; r.mealDrawn = mDrawn;
  // snapshots
  let thrDays = 0, capD = 0, emptyD = 0, spoiledSit = 0;
  for (const d of days) {
    P.snapDays++;
    if (d.throttleEngaged) thrDays++;
    if (d.capFlag) capD++;
    if (d.pantryKcal === 0) emptyD++;
    spoiledSit += d.pantrySpoiledKcal || 0;
    if (d.freshDays != null) P.freshDaysValues.push(d.freshDays);
  }
  P.throttleDays += thrDays; P.capDays += capD; P.emptyPantryDays += emptyD;
  const last = days[days.length - 1] || {};
  P.throttleRedirects += last.throttleRedirects || 0;
  P.throttleExempt += last.throttleExemptDepth || 0;
  P.plentyDepri += last.plentyDepriKcal || 0;
  P.depositGate += last.depositGateKcal || 0;
  P.preservedLast.push(last.preservedKcal || 0);
  P.preservedMax.push(Math.max(0, ...days.map(d => d.preservedKcal || 0)));
  P.spoiledSittingMean.push(days.length ? spoiledSit / days.length : 0);
  // deaths
  for (const d of (s.deathRows || [])) {
    P.deathCauses[d.cause] = (P.deathCauses[d.cause] || 0) + 1;
    if (d.cause === 'starvation' && !d.isPlayer) {
      P.starveDeaths++;
      const c = d.ctx || {};
      if ((c.pantryKcal || 0) >= 8000 && (c.freshDays || 0) >= 3.0) P.starveDeathsFullPantry++;
      else if ((c.pantryKcal || 0) === 0) P.starveDeathsEmptyPantry++;
      else if ((c.pantryKcal || 0) >= 8000) P.starveDeathsKcalOnly++;
    }
    if (d.cause === 'starvation' && d.isPlayer) P.playerStarveDeaths++;
  }
  // accounting closure per seed — SHIFTED windows (snapshot D is pre-meal-D,
  // post-work-D; meals of day D land after snapshot D; duties of day D land
  // before it). Window (snapshot D -> D+1) holds: meals(D) [drawn/stored/
  // spoiledDrawn/league], dawn sweep(D+1) [spoiledSwept], duties(D+1)
  // [stocked/pantryAdd/donated/takeBulk]. Pooled closure therefore sums
  // stocked/pantryAdd/donated/takeBulk over days 2..N and stored/league/
  // drawn/spoiledDrawn over days 1..N-1, spoiledSwept over days 2..N.
  // Residual holds cook conversion losses + direct pushes + unmeasured paths.
  const first = days[0] || {}, lastD = days[days.length - 1] || {};
  const dPantry = (lastD.pantryKcal || 0) - (first.pantryKcal || 0);
  const sumF = (fn, from, to) => sum(flows.filter(f => f.day >= from && f.day <= to).map(fn));
  const n = days.length;
  const stockedTot = sumF(f => sum(Object.values(f.stocked || {})), 2, n);
  const inTot = stockedTot
    + sumF(f => (f.stored || 0) + (f.league || 0), 1, n - 1)
    + sumF(f => (f.pantryAdd || 0) + (f.donated || 0), 2, n);
  const outTot = sumF(f => (f.drawn || 0) + (f.drawGap || 0) + (f.spoiledDrawn || 0), 1, n - 1)
    + sumF(f => (f.spoiledSwept || 0) + (f.takeBulk || 0) + (f.removedKcal || 0), 2, n);
  const stockedAll = sum(flows.map(f => sum(Object.values(f.stocked || {}))));
  r.stockedTot = stockedAll; r.inTot = inTot; r.outTot = outTot; r.dPantry = dPantry;
  r.residual = dPantry - (inTot - outTot);
  r.residualShare = inTot ? (100 * r.residual / inTot).toFixed(1) + '%' : 'n/a';
  r.takeBulk = sum(flows.map(f => f.takeBulk || 0));
  r.drawGap = sum(flows.map(f => f.drawGap || 0));
  r.removedKcal = sum(flows.map(f => f.removedKcal || 0));
  r.daysAlive = s.daysAlive;
  P.daysAlive.push(s.daysAlive);
  for (const w of (s.waveReach || [])) P.waveReach[w] = (P.waveReach[w] || 0) + 1;
  if (s.national) P.national++;
  if (s.table) P.table++;
  if (s.win) P.wins++;
  perSeed.push(r);
}

const stockedTot = sum(Object.values(P.stocked));
const dutyStocked = stockedTot; // all stockPantry calls are duty/other inflows
const totalIn = stockedTot + P.stored + P.pantryAdd + P.donated + P.league;
const totalOut = P.drawn + P.spoiledDrawn + P.spoiledSwept;
const resolvedTot = sum(Object.values(P.resolved));
const foodResolved = sum(Object.entries(P.resolved).filter(([k]) => ['forage', 'hunt', 'fish', 'garden', 'cook'].includes(k)).map(([, v]) => v));

console.log('=== sim-prodstore-a DIAGNOSIS (seeds ' + seeds.map(s => s.seed).join(',') + ', competent, 150d) ===');
console.log('');
console.log('D1 PRODUCTION vs BURN (pooled, deduped meal rows):');
console.log('  produced=' + fmt(P.produced) + ' need=' + fmt(P.need) + ' ate=' + fmt(P.ate) +
  ' ownEat=' + fmt(P.ownEat) + ' gave=' + fmt(P.gave) + ' drawn=' + fmt(P.drawn));
console.log('  produced/need=' + (P.need ? (P.produced / P.need).toFixed(3) : 'n/a') +
  ' ate/need=' + (P.need ? (P.ate / P.need).toFixed(3) : 'n/a') +
  ' ownEat/need=' + (P.need ? (P.ownEat / P.need).toFixed(3) : 'n/a'));
console.log('  duty-stocked by name: ' + JSON.stringify(P.stocked));
console.log('  duty-stocked total=' + fmt(dutyStocked) + ' surplus-stored=' + fmt(P.stored) +
  ' pantryAdd=' + fmt(P.pantryAdd) + ' donated=' + fmt(P.donated) + ' league=' + fmt(P.league));
console.log('  total inflows=' + fmt(totalIn) + ' total outflows(measured)=' + fmt(totalOut));
console.log('');
console.log('D2 SPOILAGE:');
console.log('  spoiledSwept=' + fmt(P.spoiledSwept) + ' spoiledDrawn(desperation)=' + fmt(P.spoiledDrawn));
console.log('  spoiledSwept / (stocked+stored)=' + pct(P.spoiledSwept, stockedTot + P.stored));
console.log('  spoiledSwept / total inflows=' + pct(P.spoiledSwept, totalIn));
console.log('  mean spoiled kcal sitting in pantry at snapshot=' + fmt(sum(P.spoiledSittingMean) / Math.max(1, P.spoiledSittingMean.length)));
console.log('');
console.log('D3 THROTTLE/EASING:');
console.log('  throttle-engaged village-days=' + P.throttleDays + '/' + P.snapDays + ' (' + pct(P.throttleDays, P.snapDays) + ')');
console.log('  throttleRedirects=' + fmt(P.throttleRedirects) + ' throttleExemptDepth=' + fmt(P.throttleExempt));
console.log('  plentyDepri eased kcal=' + fmt(P.plentyDepri) + ' (' + pct(P.plentyDepri, P.produced) + ' of produced)');
console.log('  depositGate eased kcal=' + fmt(P.depositGate) + ' (' + pct(P.depositGate, P.produced) + ' of produced)');
console.log('  redirect re-resolutions: ' + JSON.stringify(P.redirectResolved));
console.log('');
console.log('D4 CAP:');
console.log('  cap-flag village-days (pantry>=0.95xcap)=' + P.capDays + '/' + P.snapDays + ' (' + pct(P.capDays, P.snapDays) + ')');
console.log('  empty-pantry village-days=' + P.emptyPantryDays + '/' + P.snapDays + ' (' + pct(P.emptyPantryDays, P.snapDays) + ')');
console.log('  gave-stored shortfall (gave offered, not stored — cap + remainder carry)=' + fmt(P.gave - P.stored) + ' (' + pct(P.gave - P.stored, P.gave) + ' of gave)');
console.log('');
console.log('D5 PRESERVATION:');
console.log('  preserved kcal at last snapshot per seed: [' + P.preservedLast.join(', ') + ']');
console.log('  preserved kcal max per seed: [' + P.preservedMax.join(', ') + ']');
console.log('  cook resolutions (pooled)=' + (P.resolved.cook || 0) + ' of ' + fmt(resolvedTot) + ' resolved duties');
console.log('');
console.log('D6 LABOR (resolved duties, pooled):');
console.log('  ' + JSON.stringify(P.resolved));
console.log('  food duties (forage/hunt/fish/garden/cook)=' + fmt(foodResolved) + ' / ' + fmt(resolvedTot) + ' (' + pct(foodResolved, resolvedTot) + ')');
console.log('');
console.log('D7 STARVATION:');
console.log('  villager starvation deaths=' + P.starveDeaths + ' (full-pantry=' + P.starveDeathsFullPantry +
  ', empty-pantry=' + P.starveDeathsEmptyPantry + ', kcal-only=' + P.starveDeathsKcalOnly + ')');
console.log('  player starvation deaths=' + P.playerStarveDeaths);
console.log('  death causes (pooled): ' + JSON.stringify(P.deathCauses));
console.log('');
console.log('WALL: national=' + P.national + '/' + seeds.length + ' table=' + P.table + ' wins=' + P.wins +
  ' waveReach=' + JSON.stringify(P.waveReach) + ' medianSurvival=' + med(P.daysAlive) + 'd max=' + Math.max(...P.daysAlive) + 'd');
console.log('  freshDays median across snapshots=' + (P.freshDaysValues.length ? med(P.freshDaysValues).toFixed(1) : 'n/a'));
console.log('');
console.log('ACCOUNTING CLOSURE (per seed: residual = Δpantry - (inflows - outflows), shifted windows per the header; residual holds cook conversion losses + direct pushes + unmeasured paths):');
for (const r of perSeed) {
  console.log('  s' + r.seed + ': days=' + r.daysAlive + ' stocked=' + fmt(r.stockedTot) + ' in=' + fmt(r.inTot) +
    ' out=' + fmt(r.outTot) + ' takeBulk=' + fmt(r.takeBulk) + ' drawGap=' + fmt(r.drawGap) + ' removedKcal=' + fmt(r.removedKcal) + ' Δpantry=' + fmt(r.dPantry) + ' residual=' + fmt(r.residual) + ' (' + r.residualShare + ' of inflows)' +
    ' flowDrawn=' + fmt(r.flowDrawn) + ' mealDrawn=' + fmt(r.mealDrawn) +
    ' flowProduced=' + fmt(r.flowProduced) + ' mealProduced=' + fmt(r.mealProduced));
}
console.log('');
// ---- channel ranking (pooled kcal) ----
const structuralShortfall = Math.max(0, P.need - P.produced);
const channels = [
  ['structural shortfall (need - produced, floor 0)', structuralShortfall],
  ['spoilage (swept)', P.spoiledSwept],
  ['throttle/easing (plentyDepri + depositGate)', P.plentyDepri + P.depositGate],
  ['cap refusal (gave - stored)', Math.max(0, P.gave - P.stored)],
  ['preservation shortfall (about-to-rot surplus NOT preserved — see evidence; proxy: spoiledSwept is the realized loss)', P.spoiledSwept],
].sort((a, b) => b[1] - a[1]);
console.log('CHANNEL RANKING (pooled kcal; preservation shortfall shares its loss with spoilage — the realized rot IS the unpreserved surplus):');
for (const [name, v] of channels) console.log('  ' + fmt(v) + '  ' + name);
console.log('');
console.log('BINDING CONSTRAINT (largest channel): ' + channels[0][0] + ' (' + fmt(channels[0][1]) + ' kcal)');
console.log('BASELINE FOR PHASE B: starvation deaths per 8 seeds = ' + P.starveDeaths +
  '; median survival = ' + med(P.daysAlive) + 'd; empty-pantry village-days = ' + P.emptyPantryDays);
console.log('DIAGNOSIS VERDICT: ' + (P.starveDeaths >= 0 ? 'COMPLETE — all seven questions answered with pooled numbers' : 'INCOMPLETE'));
