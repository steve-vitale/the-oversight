#!/usr/bin/env node
// analyze-stockdoors-b-2030.js — boundary-aware ledger analysis for
// sim-stockdoors-b, run fleshout-loop-b-20261027T2030Z.
//
// Judged ONLY against evidence/2026-10-27/sim-stockdoors-b-prereg.md.
// Reuses perSeed() from scripts/analyze-stockdoors-b.js UNCHANGED for
// the NEW-definition components (inflow incl. stockSurplus, draws incl.
// drawSpoiled + direct with span dedup, sweep, transform loss, opening,
// last-day-end closing), then recomputes every residual against the
// FINAL closing (finalPantry, the post-runDays snapshot added by the
// 2030Z sweep): newResidual_ba = newResidual + (closingFinal -
// closingLastDayEnd) per family, and likewise for the dried side.
// Algebra: this is exactly the residual with closing = post-run state
// and ALL recorded flows counted — no flow excluded, no snapshot
// re-timed. The control legs under the last-day-end closing are printed
// alongside so the boundary effect is visible as a difference.
// Usage: node scripts/analyze-stockdoors-b-2030.js [corpusDir]
// When required, exports { computeBaLegs, famOf, isDried } for the proof.
'use strict';
const fs = require('fs');
const path = require('path');
const { perSeed, famOf, isDried, NAMED, GENERIC, FOCAL } = require('./analyze-stockdoors-b');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-stockdoors-b-corpus');

function fmt(n) { return (n == null ? 'n/a' : Math.round(n).toLocaleString('en-US')); }
function medianOf(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  return files.map(f => ({ file: f, ps: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

// Per-seed boundary-aware family rows + case diagnostic.
function perSeedBa(ps) {
  const base = perSeed(ps);
  const finalMap = new Map();
  for (const ch of ((ps.finalPantry || {}).channels || [])) finalMap.set(ch.channel, ch.freshKcal || 0);
  const closingFinalByFam = new Map();
  const closingDriedFinalByFam = new Map();
  for (const [c, k] of finalMap) {
    const f = famOf(c);
    closingFinalByFam.set(f, (closingFinalByFam.get(f) || 0) + k);
    if (isDried(c)) closingDriedFinalByFam.set(f, (closingDriedFinalByFam.get(f) || 0) + k);
  }
  const rows = [];
  for (const r of base.fams.values()) {
    const closingFinal = closingFinalByFam.get(r.family) || 0;
    const closingDriedFinal = closingDriedFinalByFam.get(r.family) || 0;
    const ba = r.newResidual + (closingFinal - r.closing);
    const baDried = r.newDriedResidual + (closingDriedFinal - r.closingDried);
    rows.push({ family: r.family, opening: r.opening, inflow: r.newInflow,
      draws: r.newDraws, sweep: r.sweep, transformLoss: r.transformLoss,
      closingLast: r.closing, closingFinal, residualControl: r.newResidual,
      residualBa: ba, shareBa: r.newInflow > 0 ? Math.abs(ba) / r.newInflow : null,
      driedResidualControl: r.newDriedResidual, driedResidualBa: baDried,
      closingDriedLast: r.closingDried, closingDriedFinal,
      transformPost: r.transformPost, passBa: r.newInflow > 0 && Math.abs(ba) / r.newInflow <= 0.01 });
  }
  // Case diagnostic (a): per record-day non-draw removals = spoil sweep
  // pantry kcal + direct kcal dated that day, with door split.
  const byDay = new Map();
  const dayGet = (d) => {
    if (!byDay.has(d)) byDay.set(d, { day: d, sweep: 0, direct: 0, byPath: {}, byFam: {} });
    return byDay.get(d);
  };
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    const b = dayGet(sw.day);
    const pan = (sw.removed || {}).pantry || {};
    b.sweep += pan.totalKcal || 0;
    for (const bc of (pan.byChannel || [])) {
      const f = famOf(bc.channel);
      b.byFam[f] = (b.byFam[f] || 0) + (bc.kcal || 0);
    }
  }
  for (const r of (ps.directRecords || [])) {
    const b = dayGet(r.day);
    b.direct += r.totalKcal || 0;
    b.byPath[r.path] = (b.byPath[r.path] || 0) + (r.totalKcal || 0);
    for (const it of (r.items || [])) {
      const f = famOf(String(it.name));
      b.byFam[f] = (b.byFam[f] || 0) + ((it.units || 0) * (it.kcalEach || 0));
    }
  }
  let maxDay = null;
  for (const b of byDay.values()) {
    const tot = b.sweep + b.direct;
    if (!maxDay || tot > maxDay.total) maxDay = { day: b.day, total: tot, sweep: b.sweep, direct: b.direct, byPath: b.byPath, byFam: b.byFam };
  }
  return { seed: ps.seed, daysAlive: ps.daysAlive, deaths: ps.deaths, deathCauses: ps.deathCauses,
    waveReach: ps.waveReach, rank: ps.rank, national: ps.national, table: ps.table, win: ps.win,
    base, rows, maxNonDrawDay: maxDay, finalPantry: ps.finalPantry || null,
    lastSpoilDay: (ps.spoilDays || [])[(ps.spoilDays || []).length - 1] || null,
    openingTotal: base.openingTotal };
}

function rateAndPooledBa(seeds, set) {
  let counted = 0, passed = 0, pooledResid = 0, pooledInflow = 0;
  const rows = [];
  for (const s of seeds) {
    for (const r of s.rows.filter(x => set.indexOf(x.family) >= 0 && x.inflow >= 10000)) {
      counted++;
      if (r.passBa) passed++;
      pooledResid += r.residualBa; pooledInflow += r.inflow;
      rows.push({ seed: s.seed, family: r.family, inflow: r.inflow, residualBa: r.residualBa, shareBa: r.shareBa, pass: r.passBa });
    }
  }
  return { counted, passed, rate: counted > 0 ? passed / counted : null,
    pooledResid, pooledInflow, pooledShare: pooledInflow > 0 ? Math.abs(pooledResid) / pooledInflow : null,
    pass: counted > 0 && (passed / counted) >= 0.80 && pooledInflow > 0 && Math.abs(pooledResid) / pooledInflow <= 0.01, rows };
}

function computeBaLegs(dir) {
  const corpus = loadCorpus(dir);
  const seeds = corpus.map(({ ps }) => perSeedBa(ps));
  // Leg 2 (coverage, from reused perSeed components).
  const seedsWithStockdoor = seeds.filter(s => s.base.stockdoor.kcal > 0).length;
  let totPost = 0, totLinked = 0, seedsWithEvents = 0;
  for (const s of seeds) {
    if ((s.base.events || []).length > 0) seedsWithEvents++;
    for (const rec of s.base.fams.values()) { totPost += rec.transformPost; totLinked += rec.linkedPost; }
  }
  const driedStockNoEvent = seeds.filter(s => s.base.anyDriedStock && (s.base.events || []).length === 0).map(s => s.seed);
  const linkedShare = totPost > 0 ? totLinked / totPost : null;
  const leg2 = { seedsWithStockdoor, seedsWithEvents, driedStockNoEvent, totPost, totLinked, linkedShare,
    pass: seedsWithStockdoor >= 7 && seedsWithEvents >= 7 && driedStockNoEvent.length === 0 && linkedShare != null && linkedShare >= 0.95 };
  const leg3 = rateAndPooledBa(seeds, NAMED);
  const leg4 = rateAndPooledBa(seeds, GENERIC);
  let pooledDriedBa = 0;
  for (const s of seeds) for (const r of s.rows.filter(x => FOCAL.indexOf(x.family) >= 0 && x.inflow >= 10000)) pooledDriedBa += r.driedResidualBa;
  const leg5 = { pooledDriedBa, totPost,
    share: totPost > 0 ? Math.abs(pooledDriedBa) / totPost : null,
    pass: totPost > 0 && Math.abs(pooledDriedBa) / totPost <= 0.02 };
  // Control legs (last-day-end closing, 0049Z definition) for comparison.
  let cCounted = 0, cPassed = 0, cPooledResid = 0, cPooledInflow = 0;
  let gCounted = 0, gPassed = 0, gPooledResid = 0, gPooledInflow = 0;
  let cDried = 0;
  for (const s of seeds) {
    for (const r of s.base.fams.values()) {
      if (r.newInflow < 10000) continue;
      if (NAMED.indexOf(r.family) >= 0) {
        cCounted++; if (r.newResidualShare != null && r.newResidualShare <= 0.01) cPassed++;
        cPooledResid += r.newResidual; cPooledInflow += r.newInflow;
      }
      if (GENERIC.indexOf(r.family) >= 0) {
        gCounted++; if (r.newResidualShare != null && r.newResidualShare <= 0.01) gPassed++;
        gPooledResid += r.newResidual; gPooledInflow += r.newInflow;
      }
      if (FOCAL.indexOf(r.family) >= 0) cDried += r.newDriedResidual;
    }
  }
  const control = { named: { counted: cCounted, passed: cPassed,
      rate: cCounted > 0 ? cPassed / cCounted : null, pooledResid: cPooledResid, pooledInflow: cPooledInflow,
      pooledShare: cPooledInflow > 0 ? Math.abs(cPooledResid) / cPooledInflow : null },
    generic: { counted: gCounted, passed: gPassed,
      rate: gCounted > 0 ? gPassed / gCounted : null, pooledResid: gPooledResid, pooledInflow: gPooledInflow,
      pooledShare: gPooledInflow > 0 ? Math.abs(gPooledResid) / gPooledInflow : null },
    dried: { pooledDriedResid: cDried, totPost,
      share: totPost > 0 ? Math.abs(cDried) / totPost : null } };
  return { seeds, leg2, leg3, leg4, leg5, control,
    verdictBa: (leg2.pass && leg3.pass && leg4.pass && leg5.pass) ? 'GO' : 'NO-GO' };
}

function main() {
  const { seeds, leg2, leg3, leg4, leg5, control, verdictBa } = computeBaLegs(DIR);
  console.log(`corpus: ${DIR} (${seeds.length} seeds)`);
  for (const s of seeds) {
    const b = s.base;
    console.log(`\nseed ${s.seed}: days=${s.daysAlive} deaths=${s.deaths} wave=${(s.waveReach || []).length} rank=${s.rank} events=${(b.events || []).length} spoilSweeps=${b.spoilSweeps} openingTotal=${fmt(s.openingTotal)} stockdoorRecs=${b.stockdoor.records} stockdoorKcal=${fmt(b.stockdoor.kcal)} directRecs=${b.direct.records} directKcal=${fmt(b.direct.kcal)} wrapped=${JSON.stringify(b.wrappedPaths)} missing=${JSON.stringify(b.missingPaths)} lastSpoilDay=${s.lastSpoilDay ? s.lastSpoilDay.day : 'none'} finalPantryDay=${s.finalPantry ? s.finalPantry.day : 'none'} finalPantryFresh=${s.finalPantry ? fmt(s.finalPantry.freshKcal) : 'none'}`);
    console.log(`  direct byPath: ${JSON.stringify(b.direct.byPath)} kcal: ${JSON.stringify(b.direct.byPathKcal)} calls: ${JSON.stringify(b.direct.calls)} retMismatches=${b.direct.retMismatches}`);
    for (const r of [...s.rows].sort((a, b2) => b2.inflow - a.inflow)) {
      if (r.inflow < 10000 && FOCAL.indexOf(r.family) < 0 && r.transformPost === 0) continue;
      console.log(`  ${r.family}: open=${fmt(r.opening)} inNEW=${fmt(r.inflow)} drawsNEW=${fmt(r.draws)} sweep=${fmt(r.sweep)} loss=${fmt(r.transformLoss)} closeLast=${fmt(r.closingLast)} closeFinal=${fmt(r.closingFinal)} residControl=${fmt(r.residualControl)} residBA=${fmt(r.residualBa)} (${r.shareBa == null ? 'n/a' : (r.shareBa * 100).toFixed(2) + '%'}) ${r.passBa ? 'PASS' : 'FAIL'} driedResidControl=${fmt(r.driedResidualControl)} driedResidBA=${fmt(r.driedResidualBa)}`);
    }
    if (s.maxNonDrawDay) {
      const md = s.maxNonDrawDay;
      const topFam = Object.entries(md.byFam).sort((a, b2) => b2[1] - a[1])[0];
      console.log(`  CASE max non-draw day: day ${md.day} total=${fmt(md.total)} (sweep=${fmt(md.sweep)} direct=${fmt(md.direct)} byPath=${JSON.stringify(md.byPath)} topFam=${topFam ? topFam[0] + ' ' + fmt(topFam[1]) : 'none'})`);
    }
  }
  console.log(`\nLEG 2 coverage: stockdoorSeeds=${leg2.seedsWithStockdoor}/${seeds.length} (bar >=7) driedEventsSeeds=${leg2.seedsWithEvents}/${seeds.length} (bar >=7) driedStockNoEvent=${JSON.stringify(leg2.driedStockNoEvent)} linkedShare=${leg2.linkedShare == null ? 'n/a' : (leg2.linkedShare * 100).toFixed(1) + '%'} (bar >=95%) => ${leg2.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 3 named BA: counted=${leg3.counted} passed=${leg3.passed} rate=${leg3.rate == null ? 'n/a' : (leg3.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResidBA=${fmt(leg3.pooledResid)} pooledInflow=${fmt(leg3.pooledInflow)} pooledShare=${leg3.pooledShare == null ? 'n/a' : (leg3.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg3.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg3.rows) console.log(`  named ${row.seed} ${row.family}: in=${fmt(row.inflow)} residBA=${fmt(row.residualBa)} (${row.shareBa == null ? 'n/a' : (row.shareBa * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 4 generic BA: counted=${leg4.counted} passed=${leg4.passed} rate=${leg4.rate == null ? 'n/a' : (leg4.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResidBA=${fmt(leg4.pooledResid)} pooledInflow=${fmt(leg4.pooledInflow)} pooledShare=${leg4.pooledShare == null ? 'n/a' : (leg4.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg4.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg4.rows) console.log(`  generic ${row.seed} ${row.family}: in=${fmt(row.inflow)} residBA=${fmt(row.residualBa)} (${row.shareBa == null ? 'n/a' : (row.shareBa * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 5 dried BA: pooledDriedResidBA=${fmt(leg5.pooledDriedBa)} pooledTransPost=${fmt(leg5.totPost)} share=${leg5.share == null ? 'n/a' : (leg5.share * 100).toFixed(2) + '%'} (bar <=2%) => ${leg5.pass ? 'PASS' : 'FAIL'}`);
  console.log(`CONTROL (last-day-end closing): named ${control.named.passed}/${control.named.counted} rate=${control.named.rate == null ? 'n/a' : (control.named.rate * 100).toFixed(1) + '%'} pooledResid=${fmt(control.named.pooledResid)} pooledShare=${control.named.pooledShare == null ? 'n/a' : (control.named.pooledShare * 100).toFixed(3) + '%'} | generic ${control.generic.passed}/${control.generic.counted} rate=${control.generic.rate == null ? 'n/a' : (control.generic.rate * 100).toFixed(1) + '%'} pooledResid=${fmt(control.generic.pooledResid)} pooledShare=${control.generic.pooledShare == null ? 'n/a' : (control.generic.pooledShare * 100).toFixed(3) + '%'} | dried pooledResid=${fmt(control.dried.pooledDriedResid)} share=${control.dried.share == null ? 'n/a' : (control.dried.share * 100).toFixed(2) + '%'}`);
  const nat = seeds.filter(s => s.national).length, tab = seeds.filter(s => s.table).length, win = seeds.filter(s => s.win).length;
  const w45 = seeds.filter(s => (s.waveReach || []).length >= 4).length;
  const medSurv = medianOf(seeds.map(s => s.daysAlive));
  const causes = {};
  for (const s of seeds) for (const [k, v] of Object.entries(s.deathCauses || {})) causes[k] = (causes[k] || 0) + v;
  console.log(`\nWALL: national=${nat}/${seeds.length} table=${tab}/${seeds.length} wins=${win}/${seeds.length} wave4-5=${w45}/${seeds.length} medianSurvival=${medSurv}d deaths=${seeds.reduce((t, s) => t + s.deaths, 0)} causes=${JSON.stringify(causes)}`);
  for (const s of seeds) {
    const r = (s.base.directRecords || []).find(x => x.path === 'npc-adult-pantry' || x.path === 'npc-child-pantry' || x.path === 'alien-raid' || x.path === 'thief.steal_pantry');
    if (r) {
      console.log(`\nSENSE first direct event (seed ${s.seed}): day ${r.day}, path ${r.path}, eater ${r.villager || r.vid}: ${r.items.map(i => `${i.units}u x ${i.kcalEach} ${i.name} (spoilDay ${i.spoilDay}) = ${fmt(i.kcal)} kcal`).join(', ')} total ${fmt(r.totalKcal)} kcal`);
      break;
    }
  }
  for (const s of seeds) {
    const r = (s.base.stockdoorRecords || []).find(x => x.kcal > 0);
    if (r) { console.log(`SENSE first stockSurplus (seed ${s.seed}): day ${r.day} vDay ${r.vDay} give ${r.give} stored ${r.kcal} spoilDay ${r.spoilDay}`); break; }
  }
  for (const s of seeds) {
    const lines = s.base.smokeSayLines || [];
    if (lines.length) { console.log(`SENSE smoke-rack say (seed ${s.seed}, day ${lines[0].day}): ${lines[0].line}`); break; }
  }
  console.log(`\nVERDICT (legs 2-5 BA; leg 1 det-gate in test): ${verdictBa}`);
}

if (require.main === module) main();
module.exports = { computeBaLegs, perSeedBa, famOf, isDried, NAMED, GENERIC, FOCAL };
