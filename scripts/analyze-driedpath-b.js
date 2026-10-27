#!/usr/bin/env node
// analyze-driedpath-b.js — family-ledger analysis for sim-driedpath-b.
//
// Reads evidence/2026-10-26/sim-driedpath-b-corpus/ (per-seed JSONs
// from scripts/sweep-driedpath-b.js) and judges ONLY against
// evidence/2026-10-26/sim-driedpath-b-prereg.md:
//   leg 2 coverage (events on >=7/8 seeds; no dried-stock-but-no-event
//   seed; linked post-kcal >= 95% pooled),
//   leg 3 family closure (per-family-seed |residual| within 1% of
//   family inflow on >= 6/8 seeds, where a seed passes iff ALL its
//   focal families with inflow >= 10k close within 1%; pooled
//   |signed residual| within 1% of pooled focal inflow, with
//   transformation loss AND opening stock in the ledger),
//   leg 4 dried-channel closure (pooled |dried residual| within 2%
//   of pooled transformed post-kcal).
// Leg 1 (det-gate) is judged by scripts/test-driedpath-b.js, not here.
// Usage: node scripts/analyze-driedpath-b.js [corpusDir]
// When required, exports { computeLegs, perSeed, famOf } for the proof.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-driedpath-b-corpus');
const FOCAL = ["Lamb's Quarters", 'Burdock', 'Muscadine Grapes', 'Purslane', 'Foraged food'];

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
  for (const r of (ps.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null) continue;
    const b = get(String(r.name));
    b.inflow += r.kcal || 0;
    if (b.firstDay == null || r.day < b.firstDay) b.firstDay = r.day;
  }
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
  // Opening stock (spoilvol snapshot shape) and closing stock (last day-end).
  const opening = new Map();
  for (const ch of ((ps.openingStock || {}).channels || [])) opening.set(ch.channel, ch.freshKcal || 0);
  const lastDay = (ps.spoilDays || [])[(ps.spoilDays || []).length - 1] || {};
  const closing = new Map();
  for (const ch of (lastDay.channels || [])) closing.set(ch.channel, ch.freshKcal || 0);
  // Dried stock anywhere in day-end snapshots (for leg 2b).
  let anyDriedStock = false;
  for (const sd of (ps.spoilDays || [])) {
    for (const ch of (sd.channels || [])) if (isDried(ch.channel) && (ch.freshKcal || 0) > 0) anyDriedStock = true;
  }
  // Transformation events, aggregated per family.
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
  // Family aggregation over base + dried channels.
  const fams = new Map();
  const fGet = (f) => {
    if (!fams.has(f)) fams.set(f, { family: f, opening: 0, openingDried: 0, inflow: 0, driedInflow: 0,
      mealDrawn: 0, otherDrawn: 0, driedDraws: 0, sweep: 0, driedSweep: 0,
      closing: 0, closingDried: 0, closingBase: 0, openingBase: 0,
      inflowBase: 0, drawsBase: 0, sweepBase: 0 });
    return fams.get(f);
  };
  for (const [c, b] of m) {
    const f = fGet(famOf(c));
    f.inflow += b.inflow; f.mealDrawn += b.mealDrawn; f.otherDrawn += b.otherDrawn; f.sweep += b.sweep;
    if (isDried(c)) { f.driedInflow += b.inflow; f.driedDraws += b.mealDrawn + b.otherDrawn; f.driedSweep += b.sweep; }
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
  }
  return { seed: ps.seed, daysAlive: ps.daysAlive, deaths: ps.deaths, deathCauses: ps.deathCauses,
    waveReach: ps.waveReach, rank: ps.rank, national: ps.national, table: ps.table, win: ps.win,
    fams, events, anyDriedStock,
    openingTotal: [...opening.values()].reduce((t, k) => t + k, 0),
    driedInflowRecords: (ps.inflows || []).filter(r => isDried(r.name) &&
      !(r.door === 'stock' && !(r.kcal > 0)) && !(r.door === 'pantryAdd' && !r.added)),
    smokeSayLines: ps.smokeSayLines || [],
    spoilSweeps: ((ps.spoilEvents || {}).sweeps || []).length };
}

function computeLegs(dir) {
  const corpus = loadCorpus(dir);
  const seeds = corpus.map(({ ps }) => perSeed(ps));
  // Leg 2.
  const seedsWithEvents = seeds.filter(s => (s.events || []).length > 0).length;
  const driedStockNoEvent = seeds.filter(s => s.anyDriedStock && (s.events || []).length === 0).map(s => s.seed);
  let totPost = 0, totLinked = 0;
  for (const s of seeds) for (const rec of s.fams.values()) { totPost += rec.transformPost; totLinked += rec.linkedPost; }
  const linkedShare = totPost > 0 ? totLinked / totPost : null;
  const leg2 = { seedsWithEvents, driedStockNoEvent, totPost, totLinked, linkedShare,
    pass: seedsWithEvents >= 7 && driedStockNoEvent.length === 0 && linkedShare != null && linkedShare >= 0.95 };
  // Leg 3.
  let seedPass = 0; const seedResults = [];
  let pooledResid = 0, pooledInflow = 0, pooledAbsResid = 0;
  for (const s of seeds) {
    const focal = [...s.fams.values()].filter(r => FOCAL.indexOf(r.family) >= 0 && r.inflow >= 10000);
    const ok = focal.length > 0 && focal.every(r => r.residualShare != null && r.residualShare <= 0.01);
    if (ok) seedPass++;
    seedResults.push({ seed: s.seed, focal: focal.map(r => ({ family: r.family, inflow: r.inflow, residual: r.residual, share: r.residualShare })), pass: ok });
    for (const r of focal) { pooledResid += r.residual; pooledInflow += r.inflow; pooledAbsResid += Math.abs(r.residual); }
  }
  const pooledShare = pooledInflow > 0 ? Math.abs(pooledResid) / pooledInflow : null;
  const leg3 = { seedPass, seedResults, pooledResid, pooledInflow, pooledShare,
    pooledAbsShare: pooledInflow > 0 ? pooledAbsResid / pooledInflow : null,
    pass: seedPass >= 6 && pooledShare != null && pooledShare <= 0.01 };
  // Leg 4.
  let pooledDriedResid = 0;
  for (const s of seeds) for (const r of [...s.fams.values()].filter(x => FOCAL.indexOf(x.family) >= 0 && x.inflow >= 10000)) pooledDriedResid += r.driedResidual;
  const leg4 = { pooledDriedResid, totPost,
    share: totPost > 0 ? Math.abs(pooledDriedResid) / totPost : null,
    pass: totPost > 0 && Math.abs(pooledDriedResid) / totPost <= 0.02 };
  return { seeds, leg2, leg3, leg4, verdict: (leg2.pass && leg3.pass && leg4.pass) ? 'GO' : 'NO-GO' };
}

function main() {
  const { seeds, leg2, leg3, leg4, verdict } = computeLegs(DIR);
  console.log(`corpus: ${DIR} (${seeds.length} seeds)`);
  for (const s of seeds) {
    console.log(`\nseed ${s.seed}: days=${s.daysAlive} deaths=${s.deaths} wave=${(s.waveReach || []).length} rank=${s.rank} events=${(s.events || []).length} spoilSweeps=${s.spoilSweeps} openingTotal=${fmt(s.openingTotal)} driedInflowRecs=${s.driedInflowRecords.length}`);
    for (const r of [...s.fams.values()].sort((a, b) => b.inflow - a.inflow)) {
      if (r.inflow < 10000 && FOCAL.indexOf(r.family) < 0 && r.transformPost === 0) continue;
      console.log(`  ${r.family}: open=${fmt(r.opening)} in=${fmt(r.inflow)} draws=${fmt(r.draws)} sweep=${fmt(r.sweep)} transPre=${fmt(r.transformPre)} transPost=${fmt(r.transformPost)} loss=${fmt(r.transformLoss)} close=${fmt(r.closing)} resid=${fmt(r.residual)} (${r.residualShare == null ? 'n/a' : (r.residualShare * 100).toFixed(2) + '%'}) baseResid=${fmt(r.baseResidual)} driedResid=${fmt(r.driedResidual)} paths=${JSON.stringify(r.byPath)}`);
    }
  }
  console.log(`\nLEG 2 coverage: seedsWithEvents=${leg2.seedsWithEvents}/8 (bar >=7) driedStockNoEvent=${JSON.stringify(leg2.driedStockNoEvent)} (bar []) linkedShare=${leg2.linkedShare == null ? 'n/a' : (leg2.linkedShare * 100).toFixed(1) + '%'} (bar >=95%) => ${leg2.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 3 family closure: seedPass=${leg3.seedPass}/8 (bar >=6) pooledResid=${fmt(leg3.pooledResid)} pooledInflow=${fmt(leg3.pooledInflow)} pooledShare=${leg3.pooledShare == null ? 'n/a' : (leg3.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) pooledAbsShare=${leg3.pooledAbsShare == null ? 'n/a' : (leg3.pooledAbsShare * 100).toFixed(3) + '%'} => ${leg3.pass ? 'PASS' : 'FAIL'}`);
  for (const sr of leg3.seedResults) console.log(`  seed ${sr.seed}: ${sr.pass ? 'PASS' : 'FAIL'} ${sr.focal.map(f => `${f.family} resid=${fmt(f.residual)} (${f.share == null ? 'n/a' : (f.share * 100).toFixed(2) + '%'})`).join(' | ')}`);
  console.log(`LEG 4 dried-channel closure: pooledDriedResid=${fmt(leg4.pooledDriedResid)} pooledTransPost=${fmt(leg4.totPost)} share=${leg4.share == null ? 'n/a' : (leg4.share * 100).toFixed(2) + '%'} (bar <=2%) => ${leg4.pass ? 'PASS' : 'FAIL'}`);
  // Wall numbers.
  const nat = seeds.filter(s => s.national).length, tab = seeds.filter(s => s.table).length, win = seeds.filter(s => s.win).length;
  const w45 = seeds.filter(s => (s.waveReach || []).length >= 4).length;
  const medSurv = medianOf(seeds.map(s => s.daysAlive));
  const causes = {};
  for (const s of seeds) for (const [k, v] of Object.entries(s.deathCauses || {})) causes[k] = (causes[k] || 0) + v;
  console.log(`\nWALL: national=${nat}/${seeds.length} table=${tab}/${seeds.length} wins=${win}/${seeds.length} wave4-5=${w45}/${seeds.length} medianSurvival=${medSurv}d deaths=${seeds.reduce((t, s) => t + s.deaths, 0)} causes=${JSON.stringify(causes)}`);
  // Sense: first cook-racks event + first smoke-rack say line.
  for (const s of seeds) {
    const e = (s.events || []).find(x => x.path === 'cook-racks' || x.path === 'cook-racks-split');
    if (e) {
      console.log(`\nSENSE first transformation (seed ${s.seed}): day ${e.day}, cook ${e.villager || e.vid} (${e.path}): "${e.before ? e.before.channel : '?'}": ${e.before ? e.before.units + 'u x ' + e.before.kcalEach + ' = ' + fmt(e.preKcal) + ' kcal, spoilDay ' + e.before.spoilDay + ', state ' + e.before.foodState : 'split, unlinked'} -> "${e.after.channel}": ${e.after.units}u x ${e.after.kcalEach} = ${fmt(e.postKcal)} kcal, spoilDay ${e.after.spoilDay}, state ${e.after.foodState} (loss ${e.lossKcal == null ? 'n/a' : fmt(e.lossKcal)} kcal)`);
      break;
    }
  }
  for (const s of seeds) {
    if ((s.smokeSayLines || []).length) { console.log(`SENSE smoke-rack say (seed ${s.seed}, day ${s.smokeSayLines[0].day}): ${s.smokeSayLines[0].line}`); break; }
  }
  console.log(`\nVERDICT (legs 2-4; leg 1 det-gate in test): ${verdict}`);
}

if (require.main === module) main();
module.exports = { computeLegs, perSeed, famOf, isDried, FOCAL };
