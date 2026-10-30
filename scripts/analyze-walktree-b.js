#!/usr/bin/env node
// analyze-walktree-b.js — walk-to-tree passability / cost-ledger /
// affordability census for sim-walktree-b corpora
// (scripts/walktree-trace-b.js). Pure reads; no game code.
// Usage: node scripts/analyze-walktree-b.js <corpusDir> [outJson]
//
// Stranded morning = morning snap of a loop-day whose evening row
// is bucket creek + rescued false (woodday strand definition;
// singletons included). Passability, sense channels, ledgers,
// and affordability are per the prereg
// (evidence/2026-10-30/sim-walktree-b-prereg.md).
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: analyze-walktree-b.js <corpusDir> [outJson]'); process.exit(2); }
const outJson = process.argv[3] || null;

function eveningWood(e) {
  const c = (e.woodcarry || {}).classification || {};
  return (c.woodPlayer === undefined ? null : c.woodPlayer);
}
function eveningKcal(e) {
  const wc = e.woodcarry || {};
  if (wc.kcal !== undefined && wc.kcal !== null) return wc.kcal;
  const c = wc.classification || {};
  if (c.kcal !== undefined && c.kcal !== null) return c.kcal;
  if (e.preStepKcal !== undefined && e.preStepKcal !== null) return e.preStepKcal;
  return null;
}
function eveningTicksLeft(e) {
  const wc = e.woodcarry || {};
  if (wc.ticksToDayEnd !== undefined && wc.ticksToDayEnd !== null) return wc.ticksToDayEnd;
  const c = wc.classification || {};
  if (c.ticksToDayEnd !== undefined && c.ticksToDayEnd !== null) return c.ticksToDayEnd;
  return null;
}
// Forage-yield extraction from a stranded day's full say lines:
// the engine's forage line names the haul's known kcal ("(N kcal)").
function forageYields(lines) {
  const out = [];
  for (const l of (lines || [])) {
    if (!/patch|forag|harvest|gather/i.test(l)) continue;
    const m = l.match(/\((\d+)\s*kcal\)/);
    if (m) out.push(parseInt(m[1], 10));
  }
  return out;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const perSeed = {};
const strands = [];
const mornings = []; // one record per stranded morning
const allForageYields = [];
let seeds = 0, evenings = 0, creekEvenings = 0, stillRefused = 0, rescued = 0;
let warmActed = 0, warmLogSpent = 0;
let recorderErrors = 0;

for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const s = inst.seed;
  seeds++;
  const evs = inst.evenings || [];
  evenings += evs.length;
  const mornByDay = {};
  for (const m of (inst.mornings || [])) mornByDay[m.loopDay] = m;
  perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0, warmActed: 0, warmLogSpent: 0, strands: [], strandedMornings: 0, daysAlive: inst.daysAlive, endReason: inst.endReason };
  for (const e of evs) {
    const wc = e.woodcarry || {};
    const ww = e.warmth || null;
    if (ww && ww.acted) {
      warmActed++; perSeed[s].warmActed++;
      if (ww.fireLit && ww.logSpent && ww.logSpent >= 1) { warmLogSpent++; perSeed[s].warmLogSpent++; }
    }
    if (wc.bucket !== 'creek') continue;
    creekEvenings++; perSeed[s].creek++;
    if (wc.rescued) { rescued++; perSeed[s].rescued++; }
    else { stillRefused++; perSeed[s].still++; }
  }
  // Strand runs (woodday definition, for the strand table).
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const rec = { seed: s, nights: run.map((e) => e.loopDay), length: run.length,
      eveningWoods: run.map((e) => eveningWood(e)) };
    strands.push(rec);
    perSeed[s].strands.push(rec);
    run = [];
  };
  const sorted = [...evs].sort((a, b) => a.loopDay - b.loopDay);
  for (const e of sorted) {
    const wc = e.woodcarry || {};
    if (wc.bucket === 'creek' && !wc.rescued) {
      if (run.length && e.loopDay !== run[run.length - 1].loopDay + 1) flush();
      run.push(e);
    } else flush();
  }
  flush();
  // Stranded mornings: every still-creek evening's own morning snap.
  const strandDays = new Set();
  for (const st of perSeed[s].strands) for (const d of st.nights) strandDays.add(d);
  for (const e of sorted) {
    const wc = e.woodcarry || {};
    if (!(wc.bucket === 'creek' && !wc.rescued)) continue;
    const m = mornByDay[e.loopDay] || null;
    const wa = (m && m.walkAnalysis) || (e.morningWalk) || null;
    if (wa && wa.error) recorderErrors++;
    if (!wa) recorderErrors++;
    const clusters = (wa && wa.clusters) || [];
    const reachable = clusters.filter((c) => c.reachable);
    const nearestSteps = reachable.length ? Math.min(...reachable.map((c) => c.steps)) : null;
    const stepKcal = (wa && wa.walkStepKcal !== undefined && wa.walkStepKcal !== null) ? wa.walkStepKcal : 2;
    const walkKcal = nearestSteps === null ? null : nearestSteps * stepKcal;
    const morningKcal = m ? m.kcal : null;
    const morningWood = (m && m.morningWood !== undefined) ? m.morningWood : (e.morningWood !== undefined ? e.morningWood : null);
    const woodlore = wa ? wa.woodlore : null;
    const yieldMin = woodlore ? 6 : 4, yieldMax = woodlore ? 9 : 6;
    const canFell = wa ? wa.canFell : null;
    const passable = reachable.length > 0;
    const woodAfterFell = (morningWood === null) ? null : morningWood + yieldMin;
    // Full affordability (prereg: kcal + axe gate + passable + wood)
    // is reported alongside kcal-only affordability, so the ledger
    // shows which gate binds when the axe gate kills a sequence
    // the kcal alone would fund.
    const woodOk = woodAfterFell !== null && woodAfterFell >= 4;
    const directKcalOk = (morningKcal !== null && walkKcal !== null && (morningKcal >= walkKcal + 80 + 60));
    const directAffordable = (directKcalOk && canFell === true && passable && woodOk);
    const breakEvenY = (morningKcal === null || walkKcal === null) ? null : (walkKcal + 80 + 60 + 60 - morningKcal);
    const foodFirst = {}, foodFirstKcal = {};
    for (const Y of [200, 425, 650]) {
      foodFirstKcal['Y' + Y] = (morningKcal !== null && walkKcal !== null && (morningKcal - 60 + Y >= walkKcal + 80 + 60));
      foodFirst['Y' + Y] = (foodFirstKcal['Y' + Y] && canFell === true && passable && woodOk);
    }
    const seqTicksDirect = nearestSteps === null ? null : nearestSteps + 96;
    const seqTicksFood = nearestSteps === null ? null : nearestSteps + 96 + 17;
    const fy = forageYields(e.fullDaySay || []);
    for (const y of fy) allForageYields.push({ seed: s, loopDay: e.loopDay, yield: y });
    const rec = {
      seed: s, loopDay: e.loopDay, inStrand: strandDays.has(e.loopDay),
      wakeTile: m ? (m.mapPx + ',' + m.mapPy) : null, wakeTileType: m ? m.tile : null,
      wake: wa ? wa.wake : (m ? [m.mx, m.my] : null), wakeCell: wa ? wa.wakeCell : null,
      insideTent: m ? m.insideTent : null, insideHaven: m ? m.inside : null,
      morningKcal, morningWood, ticksLeftMorning: wa ? wa.ticksLeft : null,
      walkStepKcal: stepKcal, canFell, fellTier: wa ? wa.fellTier : null, woodlore,
      fullBigtree: wa ? wa.fullBigtree : null, fullTree: wa ? wa.fullTree : null, fullBush: wa ? wa.fullBush : null,
      adjacentBigtree: wa ? wa.adjacentBigtree : null,
      clusters: clusters.map((c) => ({ cells: c.cells, size: c.size, reachable: c.reachable, steps: c.steps, cutPos: c.cutPos, bridgeUse: c.bridgeUse, sameBank: c.sameBank, visible: c.visible })),
      passable, nearestSteps, walkKcal,
      yieldMin, yieldMax, woodAfterFellMin: woodAfterFell,
      directAffordable, directKcalOk, breakEvenY, foodFirst, foodFirstKcal,
      seqTicksDirect, seqTicksFood,
      eveningKcal: eveningKcal(e), eveningTicksLeft: eveningTicksLeft(e),
      eveningWood: eveningWood(e),
      recorderError: (wa && wa.error) || (!wa ? 'no-walkAnalysis' : null),
      grid: wa ? wa.grid : null,
      forageYieldsDay: fy,
    };
    mornings.push(rec);
    perSeed[s].strandedMornings++;
  }
}

const fieldMornings = mornings.filter((m) => m.wakeTileType !== 'haven');
const passableCount = mornings.filter((m) => m.passable).length;
const fieldPassableCount = fieldMornings.filter((m) => m.passable).length;
const canFellCount = mornings.filter((m) => m.canFell === true).length;
const adjacentCount = mornings.filter((m) => m.adjacentBigtree === true).length;
const directCount = mornings.filter((m) => m.directAffordable === true).length;
const directKcalCount = mornings.filter((m) => m.directKcalOk === true).length;
const foodCounts = {};
const foodKcalCounts = {};
for (const Y of [200, 425, 650]) {
  foodCounts['Y' + Y] = mornings.filter((m) => m.foodFirst['Y' + Y] === true).length;
  foodKcalCounts['Y' + Y] = mornings.filter((m) => m.foodFirstKcal['Y' + Y] === true).length;
}
const rescuedAny = mornings.filter((m) => m.directAffordable === true || m.foodFirst.Y650 === true).length;
const clusterTotal = mornings.reduce((a, m) => a + m.clusters.length, 0);
const clusterReachable = mornings.reduce((a, m) => a + m.clusters.filter((c) => c.reachable).length, 0);
const clusterSameBankReachable = mornings.reduce((a, m) => a + m.clusters.filter((c) => c.reachable && c.sameBank).length, 0);
const clusterAcrossReachable = mornings.reduce((a, m) => a + m.clusters.filter((c) => c.reachable && !c.sameBank).length, 0);
const clusterBridgeUse = mornings.reduce((a, m) => a + m.clusters.filter((c) => c.reachable && c.bridgeUse).length, 0);
const clusterVisible = mornings.reduce((a, m) => a + m.clusters.filter((c) => c.visible).length, 0);
const ys = allForageYields.map((y) => y.yield).sort((a, b) => a - b);
const yMed = ys.length ? ys[Math.floor(ys.length / 2)] : null;

const census = { dir, seeds, files: files.length, evenings, creekEvenings, stillRefused, rescued,
  warmActed, warmLogSpent, perSeed, strands, mornings, recorderErrors,
  totals: { strandedMornings: mornings.length, fieldMornings: fieldMornings.length,
    passable: passableCount, fieldPassable: fieldPassableCount, canFell: canFellCount,
    adjacentPerceived: adjacentCount, directAffordable: directCount, directKcalOk: directKcalCount,
    foodFirst: foodCounts, foodFirstKcalOk: foodKcalCounts,
    rescuedAny: rescuedAny, clusters: clusterTotal, clustersReachable: clusterReachable,
    clustersSameBankReachable: clusterSameBankReachable, clustersAcrossReachable: clusterAcrossReachable,
    clustersBridgeUse: clusterBridgeUse, clustersVisible: clusterVisible },
  forageYields: { n: ys.length, min: ys.length ? ys[0] : null, median: yMed, max: ys.length ? ys[ys.length - 1] : null, all: allForageYields } };

console.log('seeds: ' + seeds + ' files: ' + files.length + ' evenings: ' + evenings);
console.log('creek evenings: ' + creekEvenings + ' still-refused: ' + stillRefused + ' rescued: ' + rescued);
console.log('warmth acted: ' + warmActed + ' log-spent: ' + warmLogSpent);
console.log('strands: ' + strands.length);
for (const st of strands) console.log('  STRAND seed ' + st.seed + ' nights ' + st.nights.join(',') + ' eveningWoods ' + st.eveningWoods.join(','));
console.log('stranded mornings: ' + mornings.length + ' field mornings: ' + fieldMornings.length + ' passable: ' + passableCount + ' field-passable: ' + fieldPassableCount + ' canFell: ' + canFellCount + ' adjacent-perceived: ' + adjacentCount);
console.log('direct affordable: ' + directCount + ' (kcal-only: ' + directKcalCount + ') food-first: ' + JSON.stringify(foodCounts) + ' (kcal-only: ' + JSON.stringify(foodKcalCounts) + ') rescued-any: ' + rescuedAny);
console.log('clusters: ' + clusterTotal + ' reachable: ' + clusterReachable + ' same-bank reachable: ' + clusterSameBankReachable + ' across-river reachable: ' + clusterAcrossReachable + ' bridge-use: ' + clusterBridgeUse + ' LOS-visible: ' + clusterVisible);
console.log('recorder errors: ' + recorderErrors);
console.log('observed stranded-day forage yields: n=' + ys.length + ' min=' + (ys.length ? ys[0] : null) + ' median=' + yMed + ' max=' + (ys.length ? ys[ys.length - 1] : null));
for (const m of mornings) {
  console.log('  MORNING seed ' + m.seed + ' day ' + m.loopDay + ' tile ' + m.wakeTile + ' (' + m.wakeTileType + ') wake ' + JSON.stringify(m.wake) +
    ' kcal ' + m.morningKcal + ' wood ' + m.morningWood + ' canFell ' + m.canFell + ' lore ' + m.woodlore +
    ' bigtrees ' + m.fullBigtree + ' adj ' + m.adjacentBigtree + ' passable ' + m.passable + ' steps ' + m.nearestSteps +
    ' walkKcal ' + m.walkKcal + ' direct ' + m.directAffordable + ' directKcal ' + m.directKcalOk + ' ff200 ' + m.foodFirst.Y200 + ' ff425 ' + m.foodFirst.Y425 + ' ff650 ' + m.foodFirst.Y650 +
    ' ffKcal200 ' + m.foodFirstKcal.Y200 + ' ffKcal425 ' + m.foodFirstKcal.Y425 + ' ffKcal650 ' + m.foodFirstKcal.Y650 +
    ' breakEvenY ' + m.breakEvenY + ' eveKcal ' + m.eveningKcal + ' eveTicks ' + m.eveningTicksLeft +
    (m.recorderError ? ' RECORDER-ERR ' + m.recorderError : ''));
  for (const c of m.clusters) console.log('    CLUSTER cells ' + JSON.stringify(c.cells) + ' reachable ' + c.reachable + ' steps ' + c.steps + ' cutPos ' + JSON.stringify(c.cutPos) + ' bridge ' + c.bridgeUse + ' sameBank ' + c.sameBank + ' visible ' + c.visible);
}
console.log('per-seed: ' + JSON.stringify(perSeed));
if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(census, null, 2)); console.log('wrote ' + outJson); }
