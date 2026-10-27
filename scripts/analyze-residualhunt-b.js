#!/usr/bin/env node
// analyze-residualhunt-b.js — VENDORED + ADAPTED copy of
// sim-stockdoors-b:scripts/analyze-stockdoors-b.js (tip b55b484ec), for
// sim-residualhunt-b. Adaptations ONLY: default corpus dir + this header;
// ledger math byte-identical. The stockdoors branch is untouched.
//
// Reads evidence/2026-10-26/sim-stockdoors-b-corpus/ (per-seed JSONs
// from scripts/sweep-stockdoors-b.js) and judges ONLY against
// evidence/2026-10-26/sim-stockdoors-b-prereg.md:
//   leg 2 coverage (stockSurplus records on >=7/8 seeds; per-path
//   direct census reported for every wrapped path, none claimed
//   unwrapped; reused driedpath coverage on this head),
//   leg 3 named-family closure (per-family-seed pass rate >=80%
//   within 1% AND pooled |residual| within 1% of pooled inflow),
//   leg 4 generic-family closure (same bars, generic set alone),
//   leg 5 dried-channel closure (pooled |dried residual| within 2%
//   of pooled transformed post-kcal).
// Leg 1 (det-gate) is judged by scripts/test-stockdoors-b.js, not
// here. The analyzer ALSO prints the CONTROL ledger: the same
// family-seeds under the OLD definition (3-door inflow,
// pantryDraw-only draws — exactly driedpath's definitions) so the
// old->new move is visible on this head.
// Usage: node scripts/analyze-residualhunt-b.js [corpusDir]
// When required, exports { computeLegs, perSeed, famOf } for the proof.
'use strict';
const { spanDedupSummary, applySpanDedupToFams, applySpanDedupToBoundary } = require('./dedupspan-apply-b.js'); // SPAN-DEDUP wiring (sim-dedupspan-wire-b): subtract span-internal meal draws from the direct leg; see dedupspan-apply-b.js for the status contract.
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-residualhunt-b-corpus');
const NAMED = ["Lamb's Quarters", 'Burdock', 'Muscadine Grapes', 'Purslane'];
const GENERIC = ['Foraged food'];
const FOCAL = NAMED.concat(GENERIC);

function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
function medianOf(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function fmt(n) { return (n == null ? 'n/a' : Math.round(n).toLocaleString('en-US')); }

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  return files.map(f => ({ file: f, ps: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

function perSeed(ps) {
  const m = new Map();
  const get = (c) => {
    if (!m.has(c)) m.set(c, { inflow: 0, mealDrawn: 0, otherDrawn: 0, sweep: 0, firstDay: null });
    return m.get(c);
  };
  // OLD-definition inflow: three doors only (driedpath honesty rules).
  for (const r of (ps.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null) continue;
    const b = get(String(r.name));
    b.inflow += r.kcal || 0;
    if (b.firstDay == null || r.day < b.firstDay) b.firstDay = r.day;
  }
  // OLD-definition draws: pantryDraw records only.
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const b = get(String(it.name));
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      if (r.context === 'other') b.otherDrawn += kcal; else b.mealDrawn += kcal;
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    const pan = (sw.removed || {}).pantry || {};
    for (const bc of (pan.byChannel || [])) get(String(bc.channel)).sweep += bc.kcal || 0;
  }
  const opening = new Map();
  for (const ch of ((ps.openingStock || {}).channels || [])) opening.set(ch.channel, ch.freshKcal || 0);
  const lastDay = (ps.spoilDays || [])[(ps.spoilDays || []).length - 1] || {};
  const closing = new Map();
  for (const ch of (lastDay.channels || [])) closing.set(ch.channel, ch.freshKcal || 0);
  let anyDriedStock = false;
  for (const sd of (ps.spoilDays || [])) {
    for (const ch of (sd.channels || [])) if (isDried(ch.channel) && (ch.freshKcal || 0) > 0) anyDriedStock = true;
  }
  // Transformation events (reused driedpath instrument), per family.
  const evAgg = new Map();
  const evGet = (f) => {
    if (!evAgg.has(f)) evAgg.set(f, { events: 0, pre: 0, post: 0, loss: 0, linkedPost: 0, unlinkedPost: 0, unlinkedEvents: 0, byPath: {} });
    return evAgg.get(f);
  };
  const events = ps.driedEvents || [];
  for (const e of events) {
    const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
    const f = famOf(nm);
    const a = evGet(f);
    a.events++;
    a.byPath[e.path || '?'] = (a.byPath[e.path || '?'] || 0) + 1;
    a.post += e.postKcal || 0;
    if (e.linked && e.preKcal != null) { a.pre += e.preKcal; a.loss += (e.lossKcal || 0); a.linkedPost += e.postKcal || 0; }
    else { a.unlinkedPost += e.postKcal || 0; a.unlinkedEvents++; }
  }
  // NEW-definition additions: stockSurplus inflow + drawSpoiled + direct draws.
  const stockdoor = { records: 0, kcal: 0, give: 0, zeroRecords: 0, bySeedDay: [] };
  for (const r of (ps.stockdoorRecords || [])) {
    stockdoor.records++;
    if (r.kcal > 0) { stockdoor.kcal += r.kcal; stockdoor.give += r.give || 0; }
    else stockdoor.zeroRecords++;
  }
  const direct = { records: 0, kcal: 0, byPath: {}, byPathKcal: {}, retMismatches: 0, calls: {}, callsWithDecrease: {} };
  const dc = ps.directCounters || {};
  direct.calls = dc.calls || {};
  direct.callsWithDecrease = dc.callsWithDecrease || {};
  for (const r of (ps.directRecords || [])) {
    direct.records++;
    direct.kcal += r.totalKcal || 0;
    direct.byPath[r.path] = (direct.byPath[r.path] || 0) + 1;
    direct.byPathKcal[r.path] = (direct.byPathKcal[r.path] || 0) + (r.totalKcal || 0);
    if (r.retMismatch) direct.retMismatches++;
  }
  // Family aggregation (OLD and NEW side by side).
  const fams = new Map();
  const fGet = (f) => {
    if (!fams.has(f)) fams.set(f, { family: f, opening: 0, openingDried: 0, inflow: 0, driedInflow: 0,
      mealDrawn: 0, otherDrawn: 0, driedDraws: 0, sweep: 0, driedSweep: 0,
      closing: 0, closingDried: 0, closingBase: 0, openingBase: 0,
      inflowBase: 0, drawsBase: 0, sweepBase: 0,
      newInflow: 0, newDraws: 0, newDriedDraws: 0, newDriedInflow: 0,
      drawSpoiledKcal: 0, directKcal: 0, directByPath: {} });
    return fams.get(f);
  };
  for (const [c, b] of m) {
    const f = fGet(famOf(c));
    f.inflow += b.inflow; f.mealDrawn += b.mealDrawn; f.otherDrawn += b.otherDrawn; f.sweep += b.sweep;
    f.newInflow += b.inflow; f.newDraws += b.mealDrawn + b.otherDrawn;
    if (isDried(c)) { f.driedInflow += b.inflow; f.driedDraws += b.mealDrawn + b.otherDrawn; f.driedSweep += b.sweep; f.newDriedDraws += b.mealDrawn + b.otherDrawn; f.newDriedInflow += b.inflow; }
    else { f.inflowBase += b.inflow; f.drawsBase += b.mealDrawn + b.otherDrawn; f.sweepBase += b.sweep; }
  }
  for (const [c, k] of opening) {
    const f = fGet(famOf(c));
    f.opening += k;
    if (isDried(c)) f.openingDried += k; else f.openingBase += k;
  }
  for (const [c, k] of closing) {
    const f = fGet(famOf(c));
    f.closing += k;
    if (isDried(c)) f.closingDried += k; else f.closingBase += k;
  }
  for (const [f, a] of evAgg) {
    const rec = fGet(f);
    rec.transformEvents = a.events; rec.transformPre = a.pre; rec.transformPost = a.post;
    rec.transformLoss = a.loss; rec.linkedPost = a.linkedPost; rec.unlinkedPost = a.unlinkedPost;
    rec.unlinkedEvents = a.unlinkedEvents; rec.byPath = a.byPath;
  }
  // StockSurplus inflow lands in the generic family only.
  if (stockdoor.kcal > 0) {
    const f = fGet('Foraged food');
    f.newInflow += stockdoor.kcal;
  }
  // drawSpoiled items (NEW draws).
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'drawSpoiled') continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      const f = fGet(famOf(String(it.name)));
      f.newDraws += kcal; f.drawSpoiledKcal += kcal;
      if (isDried(it.name)) f.newDriedDraws += kcal;
    }
  }
  // Direct-consumption items (NEW draws).
  for (const r of (ps.directRecords || [])) {
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      const f = fGet(famOf(String(it.name)));
      f.newDraws += kcal; f.directKcal += kcal;
      f.directByPath[r.path] = (f.directByPath[r.path] || 0) + kcal;
      if (isDried(it.name)) f.newDriedDraws += kcal;
    }
  }
  // SPAN-DEDUP (sim-dedupspan-wire-b): a useAbility span that swallows an endDay
  // double-counts its span-internal meal draws as direct draws. Subtract the
  // rule's exclusions from the direct side BEFORE residuals are computed.
  // directKcal stays raw; newDrawsPreDedup / spanDedupKcal keep it auditable.
  const spanDedup = spanDedupSummary(ps, famOf, isDried);
  applySpanDedupToFams(fams, spanDedup);
  for (const rec of fams.values()) {
    rec.transformEvents = rec.transformEvents || 0; rec.transformPre = rec.transformPre || 0;
    rec.transformPost = rec.transformPost || 0; rec.transformLoss = rec.transformLoss || 0;
    rec.linkedPost = rec.linkedPost || 0; rec.unlinkedPost = rec.unlinkedPost || 0;
    rec.unlinkedEvents = rec.unlinkedEvents || 0; rec.byPath = rec.byPath || {};
    rec.draws = rec.mealDrawn + rec.otherDrawn;
    rec.residual = (rec.closing - rec.opening) - (rec.inflow - rec.draws - rec.sweep - rec.transformLoss);
    rec.residualShare = rec.inflow > 0 ? Math.abs(rec.residual) / rec.inflow : null;
    rec.baseResidual = (rec.closingBase - rec.openingBase) - (rec.inflowBase - rec.drawsBase - rec.sweepBase - rec.transformPre);
    rec.driedResidual = (rec.closingDried - rec.openingDried) - (rec.transformPost + rec.driedInflow - rec.driedDraws - rec.driedSweep);
    rec.newResidual = (rec.closing - rec.opening) - (rec.newInflow - rec.newDraws - rec.sweep - rec.transformLoss);
    rec.newResidualShare = rec.newInflow > 0 ? Math.abs(rec.newResidual) / rec.newInflow : null;
    rec.newDriedResidual = (rec.closingDried - rec.openingDried) - (rec.transformPost + rec.newDriedInflow - rec.newDriedDraws - rec.driedSweep);
  }
  return { seed: ps.seed, daysAlive: ps.daysAlive, deaths: ps.deaths, deathCauses: ps.deathCauses,
    waveReach: ps.waveReach, rank: ps.rank, national: ps.national, table: ps.table, win: ps.win,
    fams, spanDedup, events, anyDriedStock, stockdoor, direct,
    openingTotal: [...opening.values()].reduce((t, k) => t + k, 0),
    driedInflowRecords: (ps.inflows || []).filter(r => isDried(r.name) &&
      !(r.door === 'stock' && !(r.kcal > 0)) && !(r.door === 'pantryAdd' && !r.added)),
    smokeSayLines: ps.smokeSayLines || [],
    spoilSweeps: ((ps.spoilEvents || {}).sweeps || []).length,
    stockdoorRecords: ps.stockdoorRecords || [],
    directRecords: ps.directRecords || [],
    wrappedPaths: ((ps.directCounters || {}).wrappedPaths || []),
    missingPaths: ((ps.directCounters || {}).missingPaths || []),
    stockdoorsOn: ps.stockdoorsOn };
}

function rateAndPooled(seeds, set) {
  let counted = 0, passed = 0, pooledResid = 0, pooledInflow = 0, pooledAbs = 0;
  const rows = [];
  for (const s of seeds) {
    for (const r of [...s.fams.values()].filter(x => set.indexOf(x.family) >= 0 && x.newInflow >= 10000)) {
      counted++;
      const ok = r.newResidualShare != null && r.newResidualShare <= 0.01;
      if (ok) passed++;
      pooledResid += r.newResidual; pooledInflow += r.newInflow; pooledAbs += Math.abs(r.newResidual);
      rows.push({ seed: s.seed, family: r.family, inflow: r.newInflow, residual: r.newResidual, share: r.newResidualShare, pass: ok });
    }
  }
  return { counted, passed, rate: counted > 0 ? passed / counted : null,
    pooledResid, pooledInflow, pooledShare: pooledInflow > 0 ? Math.abs(pooledResid) / pooledInflow : null,
    pooledAbsShare: pooledInflow > 0 ? pooledAbs / pooledInflow : null,
    pass: counted > 0 && (passed / counted) >= 0.80 && pooledInflow > 0 && Math.abs(pooledResid) / pooledInflow <= 0.01, rows };
}

function computeLegs(dir) {
  const corpus = loadCorpus(dir);
  const seeds = corpus.map(({ ps }) => perSeed(ps));
  // Leg 2.
  const seedsWithStockdoor = seeds.filter(s => s.stockdoor.kcal > 0).length;
  let totPost = 0, totLinked = 0, seedsWithEvents = 0;
  for (const s of seeds) {
    if ((s.events || []).length > 0) seedsWithEvents++;
    for (const rec of s.fams.values()) { totPost += rec.transformPost; totLinked += rec.linkedPost; }
  }
  const driedStockNoEvent = seeds.filter(s => s.anyDriedStock && (s.events || []).length === 0).map(s => s.seed);
  const linkedShare = totPost > 0 ? totLinked / totPost : null;
  const leg2 = { seedsWithStockdoor, seedsWithEvents, driedStockNoEvent, totPost, totLinked, linkedShare,
    pass: seedsWithStockdoor >= 7 && seedsWithEvents >= 7 && driedStockNoEvent.length === 0 && linkedShare != null && linkedShare >= 0.95 };
  // Legs 3 (named) and 4 (generic).
  const leg3 = rateAndPooled(seeds, NAMED);
  const leg4 = rateAndPooled(seeds, GENERIC);
  // Leg 5: dried-channel closure over all focal family-seeds.
  let pooledDriedResid = 0;
  for (const s of seeds) for (const r of [...s.fams.values()].filter(x => FOCAL.indexOf(x.family) >= 0 && x.newInflow >= 10000)) pooledDriedResid += r.newDriedResidual;
  const leg5 = { pooledDriedResid, totPost,
    share: totPost > 0 ? Math.abs(pooledDriedResid) / totPost : null,
    pass: totPost > 0 && Math.abs(pooledDriedResid) / totPost <= 0.02 };
  // Control ledger (OLD definition, this head).
  let oldPooledResid = 0, oldPooledInflow = 0, oldPooledDriedResid = 0;
  for (const s of seeds) for (const r of [...s.fams.values()].filter(x => FOCAL.indexOf(x.family) >= 0 && x.inflow >= 10000)) {
    oldPooledResid += r.residual; oldPooledInflow += r.inflow; oldPooledDriedResid += r.driedResidual;
  }
  const control = { oldPooledResid, oldPooledInflow,
    oldPooledShare: oldPooledInflow > 0 ? Math.abs(oldPooledResid) / oldPooledInflow : null,
    oldPooledDriedResid, oldDriedShare: totPost > 0 ? Math.abs(oldPooledDriedResid) / totPost : null };
  return { seeds, leg2, leg3, leg4, leg5, control,
    verdictLegs2345: (leg2.pass && leg3.pass && leg4.pass && leg5.pass) ? 'GO' : 'NO-GO' };
}

function main() {
  const { seeds, leg2, leg3, leg4, leg5, control, verdictLegs2345 } = computeLegs(DIR);
  console.log(`corpus: ${DIR} (${seeds.length} seeds)`);
  for (const s of seeds) {
    console.log(`\nseed ${s.seed}: days=${s.daysAlive} deaths=${s.deaths} wave=${(s.waveReach || []).length} rank=${s.rank} events=${(s.events || []).length} spoilSweeps=${s.spoilSweeps} openingTotal=${fmt(s.openingTotal)} stockdoorRecs=${s.stockdoor.records} stockdoorKcal=${fmt(s.stockdoor.kcal)} directRecs=${s.direct.records} directKcal=${fmt(s.direct.kcal)} wrapped=${JSON.stringify(s.wrappedPaths)} missing=${JSON.stringify(s.missingPaths)}`);
    console.log(`  direct byPath: ${JSON.stringify(s.direct.byPath)} kcal: ${JSON.stringify(s.direct.byPathKcal)} calls: ${JSON.stringify(s.direct.calls)} retMismatches=${s.direct.retMismatches}`);
    for (const r of [...s.fams.values()].sort((a, b) => b.newInflow - a.newInflow)) {
      if (r.newInflow < 10000 && FOCAL.indexOf(r.family) < 0 && r.transformPost === 0) continue;
      console.log(`  ${r.family}: open=${fmt(r.opening)} inOLD=${fmt(r.inflow)} inNEW=${fmt(r.newInflow)} drawsOLD=${fmt(r.draws)} drawsNEW=${fmt(r.newDraws)} (spoiled=${fmt(r.drawSpoiledKcal)} direct=${fmt(r.directKcal)}) sweep=${fmt(r.sweep)} loss=${fmt(r.transformLoss)} close=${fmt(r.closing)} residOLD=${fmt(r.residual)} (${r.residualShare == null ? 'n/a' : (r.residualShare * 100).toFixed(2) + '%'}) residNEW=${fmt(r.newResidual)} (${r.newResidualShare == null ? 'n/a' : (r.newResidualShare * 100).toFixed(2) + '%'}) driedResidOLD=${fmt(r.driedResidual)} driedResidNEW=${fmt(r.newDriedResidual)}`);
    }
  }
  console.log(`\nLEG 2 coverage: stockdoorSeeds=${leg2.seedsWithStockdoor}/8 (bar >=7) driedEventsSeeds=${leg2.seedsWithEvents}/8 (bar >=7) driedStockNoEvent=${JSON.stringify(leg2.driedStockNoEvent)} linkedShare=${leg2.linkedShare == null ? 'n/a' : (leg2.linkedShare * 100).toFixed(1) + '%'} (bar >=95%) => ${leg2.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 3 named closure: counted=${leg3.counted} passed=${leg3.passed} rate=${leg3.rate == null ? 'n/a' : (leg3.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg3.pooledResid)} pooledInflow=${fmt(leg3.pooledInflow)} pooledShare=${leg3.pooledShare == null ? 'n/a' : (leg3.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg3.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg3.rows) console.log(`  named ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 4 generic closure: counted=${leg4.counted} passed=${leg4.passed} rate=${leg4.rate == null ? 'n/a' : (leg4.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg4.pooledResid)} pooledInflow=${fmt(leg4.pooledInflow)} pooledShare=${leg4.pooledShare == null ? 'n/a' : (leg4.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg4.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg4.rows) console.log(`  generic ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 5 dried-channel closure: pooledDriedResidNEW=${fmt(leg5.pooledDriedResid)} pooledTransPost=${fmt(leg5.totPost)} share=${leg5.share == null ? 'n/a' : (leg5.share * 100).toFixed(2) + '%'} (bar <=2%) => ${leg5.pass ? 'PASS' : 'FAIL'}`);
  console.log(`CONTROL (OLD definition, this head): pooledResid=${fmt(control.oldPooledResid)} pooledInflow=${fmt(control.oldPooledInflow)} pooledShare=${control.oldPooledShare == null ? 'n/a' : (control.oldPooledShare * 100).toFixed(3) + '%'} pooledDriedResid=${fmt(control.oldPooledDriedResid)} driedShare=${control.oldDriedShare == null ? 'n/a' : (control.oldDriedShare * 100).toFixed(2) + '%'} (driedpath corpus was pooled 90.42% / dried 8.78% — compare as observation, not verdict input)`);
  const nat = seeds.filter(s => s.national).length, tab = seeds.filter(s => s.table).length, win = seeds.filter(s => s.win).length;
  const w45 = seeds.filter(s => (s.waveReach || []).length >= 4).length;
  const medSurv = medianOf(seeds.map(s => s.daysAlive));
  const causes = {};
  for (const s of seeds) for (const [k, v] of Object.entries(s.deathCauses || {})) causes[k] = (causes[k] || 0) + v;
  console.log(`\nWALL: national=${nat}/${seeds.length} table=${tab}/${seeds.length} wins=${win}/${seeds.length} wave4-5=${w45}/${seeds.length} medianSurvival=${medSurv}d deaths=${seeds.reduce((t, s) => t + s.deaths, 0)} causes=${JSON.stringify(causes)}`);
  for (const s of seeds) {
    const r = (s.directRecords || []).find(x => x.path === 'npc-adult-pantry' || x.path === 'npc-child-pantry' || x.path === 'alien-raid' || x.path === 'thief.steal_pantry');
    if (r) {
      console.log(`\nSENSE first direct event (seed ${s.seed}): day ${r.day}, path ${r.path}, eater ${r.villager || r.vid}: ${r.items.map(i => `${i.units}u x ${i.kcalEach} ${i.name} (spoilDay ${i.spoilDay}) = ${fmt(i.kcal)} kcal`).join(', ')} total ${fmt(r.totalKcal)} kcal`);
      break;
    }
  }
  for (const s of seeds) {
    const r = (s.stockdoorRecords || []).find(x => x.kcal > 0);
    if (r) { console.log(`SENSE first stockSurplus (seed ${s.seed}): day ${r.day} vDay ${r.vDay} give ${r.give} stored ${r.kcal} spoilDay ${r.spoilDay}`); break; }
  }
  for (const s of seeds) {
    if ((s.smokeSayLines || []).length) { console.log(`SENSE smoke-rack say (seed ${s.seed}, day ${s.smokeSayLines[0].day}): ${s.smokeSayLines[0].line}`); break; }
  }
  console.log(`\nVERDICT (legs 2-5; leg 1 det-gate in test): ${verdictLegs2345}`);
}

if (require.main === module) main();
module.exports = { computeLegs, perSeed, famOf, isDried, FOCAL, NAMED, GENERIC };
