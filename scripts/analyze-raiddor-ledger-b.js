#!/usr/bin/env node
// analyze-raiddor-ledger-b.js — VENDORED + ADAPTED copy of
// sim-ledgerbound-b:scripts/analyze-ledgerbound-b.js, for
// sim-raiddor-ledger-b. Adaptations ONLY: default corpus dir, this
// header, the RAID-DOOR boundary legs (leg3r/leg4r/leg5r: boundary
// definition + raid-unanswered draws, with post-snapshot raid takes
// subtracted from the boundary closing), the leg-2 label fix (prints
// the real seed count instead of a hardcoded "/8"), and raid census /
// sense output. Ledgerbound boundary + old-boundary legs are
// byte-identical and reported alongside as controls. The ledgerbound
// branch is untouched.
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
// Usage: node scripts/analyze-ledgerbound-b.js [corpusDir]
// When required, exports { computeLegs, perSeed, famOf } for the proof.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-raiddor-ledger-b-corpus');
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

  // BOUNDARY-AWARE ledger (ledgerbound prereg, analyzer closing-step
  // adaptation ONLY): the closing snapshot (spoilDays day 100) is
  // taken after day-100 daytime flows but before the day-100 night
  // meal (villagerMealDay). Boundary closing = closing + day-100
  // stockSurplus pushes - day-100 meal draws (pantryDraw +
  // drawSpoiled, day 100). Direct draws day 100 are daytime flows,
  // already reflected in the snapshot, so they are NOT adjusted.
  // Boundary flows = NEW-definition flows dated <= 100; flows dated
  // > 100 (day-101 sweeps on this band) are post-horizon and excluded.
  const bDraw100 = new Map();
  const bGet = (f) => { if (!bDraw100.has(f)) bDraw100.set(f, { meal: 0, mealDried: 0, stock: 0 }); return bDraw100.get(f); };
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.day !== 100 || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const a = bGet(famOf(String(it.name)));
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      a.meal += kcal; if (isDried(it.name)) a.mealDried += kcal;
    }
  }
  for (const r of (ps.stockdoorRecords || [])) {
    if (r.day !== 100 || !(r.kcal > 0)) continue;
    bGet('Foraged food').stock += r.kcal;
  }
  const bFam = new Map();
  const bFGet = (f) => { if (!bFam.has(f)) bFam.set(f, { inflow: 0, draws: 0, sweep: 0, loss: 0, post: 0, dIn: 0, dDraws: 0, dSweep: 0 }); return bFam.get(f); };
  for (const r of (ps.inflows || [])) {
    if (r.day > 100) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (r.name == null) continue;
    const a = bFGet(famOf(String(r.name))); a.inflow += r.kcal || 0;
    if (isDried(r.name)) a.dIn += r.kcal || 0;
  }
  for (const r of (ps.stockdoorRecords || [])) {
    if (r.day > 100 || !(r.kcal > 0)) continue;
    bFGet('Foraged food').inflow += r.kcal;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.day > 100 || (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled')) continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      const a = bFGet(famOf(String(it.name))); a.draws += kcal;
      if (isDried(it.name)) a.dDraws += kcal;
    }
  }
  for (const r of (ps.directRecords || [])) {
    if (r.day > 100) continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      const a = bFGet(famOf(String(it.name))); a.draws += kcal;
      if (isDried(it.name)) a.dDraws += kcal;
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    if (sw.day > 100) continue;
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      const a = bFGet(famOf(String(bc.channel))); a.sweep += bc.kcal || 0;
      if (isDried(bc.channel)) a.dSweep += bc.kcal || 0;
    }
  }
  for (const e of events) {
    if (e.day > 100) continue;
    const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
    const a = bFGet(famOf(nm)); a.post += e.postKcal || 0;
    if (e.linked && e.lossKcal != null) a.loss += e.lossKcal || 0;
  }
  for (const rec of fams.values()) {
    const b = bFam.get(rec.family) || { inflow: 0, draws: 0, sweep: 0, loss: 0, post: 0, dIn: 0, dDraws: 0, dSweep: 0 };
    const adj = bDraw100.get(rec.family) || { meal: 0, mealDried: 0, stock: 0 };
    rec.bInflow = b.inflow; rec.bDraws = b.draws; rec.bSweep = b.sweep; rec.bLoss = b.loss;
    rec.bClosing = rec.closing + adj.stock - adj.meal;
    rec.bClosingDried = rec.closingDried - adj.mealDried;
    rec.bResidual = (rec.bClosing - rec.opening) - (b.inflow - b.draws - b.sweep - b.loss);
    rec.bResidualShare = b.inflow > 0 ? Math.abs(rec.bResidual) / b.inflow : null;
    rec.bDriedResidual = (rec.bClosingDried - rec.openingDried) - (b.post + b.dIn - b.dDraws - b.dSweep);
    rec.bMeal100 = adj.meal; rec.bStock100 = adj.stock; rec.bTransPost = b.post;
  }
  // RAID-DOOR boundary legs (raiddor prereg): raid-unanswered draws
  // (dated <= 100) count as draws; raid-unanswered records dated ==
  // the closing-snapshot day are post-snapshot and are subtracted
  // from the boundary closing (total + dried portion), mirroring the
  // day-100 meal adjustment. Other _removePantryKcal callers are
  // census only (never folded into these legs).
  const lastSnapDay = (ps.spoilDays || []).length ? (ps.spoilDays[(ps.spoilDays || []).length - 1] || {}).day : null;
  const raidAgg = new Map();
  const rGet = (f) => { if (!raidAgg.has(f)) raidAgg.set(f, { draws: 0, dDraws: 0, r100: 0, r100D: 0 }); return raidAgg.get(f); };
  const raidCensus = { records: 0, kcal: 0, byPath: {}, byPathKcal: {}, unansweredRecords: 0, unansweredKcal: 0 };
  for (const r of (ps.raidRecords || [])) {
    raidCensus.records++;
    raidCensus.kcal += r.totalKcal || 0;
    raidCensus.byPath[r.path] = (raidCensus.byPath[r.path] || 0) + 1;
    raidCensus.byPathKcal[r.path] = (raidCensus.byPathKcal[r.path] || 0) + (r.totalKcal || 0);
    if (r.path === 'raid-unanswered') { raidCensus.unansweredRecords++; raidCensus.unansweredKcal += r.totalKcal || 0; }
    if (r.path !== 'raid-unanswered' || r.day > 100) continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      const a = rGet(famOf(String(it.name))); a.draws += kcal;
      if (isDried(it.name)) a.dDraws += kcal;
      if (r.day === lastSnapDay) { a.r100 += kcal; if (isDried(it.name)) a.r100D += kcal; }
    }
  }
  for (const rec of fams.values()) {
    const a = raidAgg.get(rec.family) || { draws: 0, dDraws: 0, r100: 0, r100D: 0 };
    rec.raidDraws = a.draws; rec.raidDriedDraws = a.dDraws; rec.raid100 = a.r100; rec.raid100Dried = a.r100D;
    rec.rBInflow = rec.bInflow;
    rec.rBClosing = rec.bClosing - a.r100;
    rec.rBClosingDried = rec.bClosingDried - a.r100D;
    rec.rBDraws = rec.bDraws + a.draws;
    rec.rBResidual = (rec.rBClosing - rec.opening) - (rec.bInflow - rec.rBDraws - rec.bSweep - rec.bLoss);
    rec.rBResidualShare = rec.bInflow > 0 ? Math.abs(rec.rBResidual) / rec.bInflow : null;
    rec.rBDriedResidual = (rec.rBClosingDried - rec.openingDried) - (rec.bTransPost + rec.bDIn - (rec.bDDraws || 0) - rec.bDSweep);
  }
  // NOTE: bDDraws/bDSweep/bDIn are not stored per family above; recompute
  // the dried raiddor residual directly from the bFam dried fields.
  for (const rec of fams.values()) {
    const b = bFam.get(rec.family) || { inflow: 0, draws: 0, sweep: 0, loss: 0, post: 0, dIn: 0, dDraws: 0, dSweep: 0 };
    const a = raidAgg.get(rec.family) || { draws: 0, dDraws: 0, r100: 0, r100D: 0 };
    rec.rBDriedResidual = (rec.bClosingDried - a.r100D - rec.openingDried) - (b.post + b.dIn - (b.dDraws + a.dDraws) - b.dSweep);
  }
  return { seed: ps.seed, daysAlive: ps.daysAlive, deaths: ps.deaths, deathCauses: ps.deathCauses,
    waveReach: ps.waveReach, rank: ps.rank, national: ps.national, table: ps.table, win: ps.win,
    fams, events, anyDriedStock, stockdoor, direct,
    openingTotal: [...opening.values()].reduce((t, k) => t + k, 0),
    driedInflowRecords: (ps.inflows || []).filter(r => isDried(r.name) &&
      !(r.door === 'stock' && !(r.kcal > 0)) && !(r.door === 'pantryAdd' && !r.added)),
    smokeSayLines: ps.smokeSayLines || [],
    spoilSweeps: ((ps.spoilEvents || {}).sweeps || []).length,
    stockdoorRecords: ps.stockdoorRecords || [],
    directRecords: ps.directRecords || [],
    wrappedPaths: ((ps.directCounters || {}).wrappedPaths || []),
    missingPaths: ((ps.directCounters || {}).missingPaths || []),
    stockdoorsOn: ps.stockdoorsOn,
    raidRecords: ps.raidRecords || [],
    raidCounters: ps.raidCounters || null,
    raidCensus, raidSayLines: ps.raidSayLines || [],
    lastSnapDay, raiddorOn: ps.raiddorOn };
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
  // Boundary legs (ledgerbound, judged).
  function rateAndPooledBoundary(seeds2, set) {
    let counted = 0, passed = 0, pooledResid = 0, pooledInflow = 0;
    const rows = [];
    for (const s of seeds2) {
      for (const r of [...s.fams.values()].filter(x => set.indexOf(x.family) >= 0 && x.bInflow >= 10000)) {
        counted++;
        const ok = r.bResidualShare != null && r.bResidualShare <= 0.01;
        if (ok) passed++;
        pooledResid += r.bResidual; pooledInflow += r.bInflow;
        rows.push({ seed: s.seed, family: r.family, inflow: r.bInflow, residual: r.bResidual, share: r.bResidualShare, pass: ok });
      }
    }
    return { counted, passed, rate: counted > 0 ? passed / counted : null,
      pooledResid, pooledInflow, pooledShare: pooledInflow > 0 ? Math.abs(pooledResid) / pooledInflow : null,
      pass: counted > 0 && (passed / counted) >= 0.80 && pooledInflow > 0 && Math.abs(pooledResid) / pooledInflow <= 0.01, rows };
  }
  const leg3b = rateAndPooledBoundary(seeds, NAMED);
  const leg4b = rateAndPooledBoundary(seeds, GENERIC);
  let pooledBDriedResid = 0, bTotPost = 0;
  for (const s of seeds) for (const r of [...s.fams.values()]) bTotPost += r.bTransPost || 0;
  for (const s of seeds) for (const r of [...s.fams.values()].filter(x => FOCAL.indexOf(x.family) >= 0 && x.bInflow >= 10000)) pooledBDriedResid += r.bDriedResidual;
  const leg5b = { pooledDriedResid: pooledBDriedResid, totPost: bTotPost,
    share: bTotPost > 0 ? Math.abs(pooledBDriedResid) / bTotPost : null,
    pass: bTotPost > 0 && Math.abs(pooledBDriedResid) / bTotPost <= 0.02 };
  function rateAndPooledRaiddor(seeds2, set) {
    let counted = 0, passed = 0, pooledResid = 0, pooledInflow = 0;
    const rows = [];
    for (const s of seeds2) {
      for (const r of [...s.fams.values()].filter(x => set.indexOf(x.family) >= 0 && x.rBInflow >= 10000)) {
        counted++;
        const ok = r.rBResidualShare != null && r.rBResidualShare <= 0.01;
        if (ok) passed++;
        pooledResid += r.rBResidual; pooledInflow += r.rBInflow;
        rows.push({ seed: s.seed, family: r.family, inflow: r.rBInflow, residual: r.rBResidual, share: r.rBResidualShare, pass: ok });
      }
    }
    return { counted, passed, rate: counted > 0 ? passed / counted : null,
      pooledResid, pooledInflow, pooledShare: pooledInflow > 0 ? Math.abs(pooledResid) / pooledInflow : null,
      pass: counted > 0 && (passed / counted) >= 0.80 && pooledInflow > 0 && Math.abs(pooledResid) / pooledInflow <= 0.01, rows };
  }
  const leg3r = rateAndPooledRaiddor(seeds, NAMED);
  const leg4r = rateAndPooledRaiddor(seeds, GENERIC);
  let pooledRDriedResid = 0;
  for (const s of seeds) for (const r of [...s.fams.values()].filter(x => FOCAL.indexOf(x.family) >= 0 && x.rBInflow >= 10000)) pooledRDriedResid += r.rBDriedResidual;
  const leg5r = { pooledDriedResid: pooledRDriedResid, totPost: bTotPost,
    share: bTotPost > 0 ? Math.abs(pooledRDriedResid) / bTotPost : null,
    pass: bTotPost > 0 && Math.abs(pooledRDriedResid) / bTotPost <= 0.02 };
  // Control ledger (OLD definition, this head).
  let oldPooledResid = 0, oldPooledInflow = 0, oldPooledDriedResid = 0;
  for (const s of seeds) for (const r of [...s.fams.values()].filter(x => FOCAL.indexOf(x.family) >= 0 && x.inflow >= 10000)) {
    oldPooledResid += r.residual; oldPooledInflow += r.inflow; oldPooledDriedResid += r.driedResidual;
  }
  const control = { oldPooledResid, oldPooledInflow,
    oldPooledShare: oldPooledInflow > 0 ? Math.abs(oldPooledResid) / oldPooledInflow : null,
    oldPooledDriedResid, oldDriedShare: totPost > 0 ? Math.abs(oldPooledDriedResid) / totPost : null };
  return { seeds, leg2, leg3, leg4, leg5, leg3b, leg4b, leg5b, leg3r, leg4r, leg5r, control,
    verdictLegs2345: (leg2.pass && leg3.pass && leg4.pass && leg5.pass) ? 'GO' : 'NO-GO',
    verdictBoundary: (leg2.pass && leg3b.pass && leg4b.pass && leg5b.pass) ? 'GO' : 'NO-GO',
    verdictRaiddor: (leg2.pass && leg3r.pass && leg4r.pass && leg5r.pass) ? 'GO' : 'NO-GO' };
}

function main() {
  const { seeds, leg2, leg3, leg4, leg5, leg3b, leg4b, leg5b, leg3r, leg4r, leg5r, control, verdictLegs2345, verdictBoundary, verdictRaiddor } = computeLegs(DIR);
  console.log(`corpus: ${DIR} (${seeds.length} seeds)`);
  for (const s of seeds) {
    console.log(`\nseed ${s.seed}: days=${s.daysAlive} deaths=${s.deaths} wave=${(s.waveReach || []).length} rank=${s.rank} events=${(s.events || []).length} spoilSweeps=${s.spoilSweeps} openingTotal=${fmt(s.openingTotal)} stockdoorRecs=${s.stockdoor.records} stockdoorKcal=${fmt(s.stockdoor.kcal)} directRecs=${s.direct.records} directKcal=${fmt(s.direct.kcal)} wrapped=${JSON.stringify(s.wrappedPaths)} missing=${JSON.stringify(s.missingPaths)}`);
    console.log(`  direct byPath: ${JSON.stringify(s.direct.byPath)} kcal: ${JSON.stringify(s.direct.byPathKcal)} calls: ${JSON.stringify(s.direct.calls)} retMismatches=${s.direct.retMismatches}`);
    for (const r of [...s.fams.values()].sort((a, b) => b.newInflow - a.newInflow)) {
      if (r.newInflow < 10000 && FOCAL.indexOf(r.family) < 0 && r.transformPost === 0) continue;
      console.log(`  ${r.family}: open=${fmt(r.opening)} inOLD=${fmt(r.inflow)} inNEW=${fmt(r.newInflow)} drawsOLD=${fmt(r.draws)} drawsNEW=${fmt(r.newDraws)} (spoiled=${fmt(r.drawSpoiledKcal)} direct=${fmt(r.directKcal)}) sweep=${fmt(r.sweep)} loss=${fmt(r.transformLoss)} close=${fmt(r.closing)} residOLD=${fmt(r.residual)} (${r.residualShare == null ? 'n/a' : (r.residualShare * 100).toFixed(2) + '%'}) residNEW=${fmt(r.newResidual)} (${r.newResidualShare == null ? 'n/a' : (r.newResidualShare * 100).toFixed(2) + '%'}) driedResidOLD=${fmt(r.driedResidual)} driedResidNEW=${fmt(r.newDriedResidual)}`);
    }
  }
  console.log(`\nLEG 2 coverage: stockdoorSeeds=${leg2.seedsWithStockdoor}/${seeds.length} (bar >=7) driedEventsSeeds=${leg2.seedsWithEvents}/${seeds.length} (bar >=7) driedStockNoEvent=${JSON.stringify(leg2.driedStockNoEvent)} linkedShare=${leg2.linkedShare == null ? 'n/a' : (leg2.linkedShare * 100).toFixed(1) + '%'} (bar >=95%) => ${leg2.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 3 named closure: counted=${leg3.counted} passed=${leg3.passed} rate=${leg3.rate == null ? 'n/a' : (leg3.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg3.pooledResid)} pooledInflow=${fmt(leg3.pooledInflow)} pooledShare=${leg3.pooledShare == null ? 'n/a' : (leg3.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg3.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg3.rows) console.log(`  named ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 4 generic closure: counted=${leg4.counted} passed=${leg4.passed} rate=${leg4.rate == null ? 'n/a' : (leg4.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg4.pooledResid)} pooledInflow=${fmt(leg4.pooledInflow)} pooledShare=${leg4.pooledShare == null ? 'n/a' : (leg4.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg4.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg4.rows) console.log(`  generic ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`LEG 5 dried-channel closure: pooledDriedResidNEW=${fmt(leg5.pooledDriedResid)} pooledTransPost=${fmt(leg5.totPost)} share=${leg5.share == null ? 'n/a' : (leg5.share * 100).toFixed(2) + '%'} (bar <=2%) => ${leg5.pass ? 'PASS' : 'FAIL'}`);
  console.log(`BOUNDARY LEG 3 named closure: counted=${leg3b.counted} passed=${leg3b.passed} rate=${leg3b.rate == null ? 'n/a' : (leg3b.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg3b.pooledResid)} pooledInflow=${fmt(leg3b.pooledInflow)} pooledShare=${leg3b.pooledShare == null ? 'n/a' : (leg3b.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg3b.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg3b.rows) console.log(`  boundary named ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`BOUNDARY LEG 4 generic closure: counted=${leg4b.counted} passed=${leg4b.passed} rate=${leg4b.rate == null ? 'n/a' : (leg4b.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg4b.pooledResid)} pooledInflow=${fmt(leg4b.pooledInflow)} pooledShare=${leg4b.pooledShare == null ? 'n/a' : (leg4b.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg4b.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg4b.rows) console.log(`  boundary generic ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`BOUNDARY LEG 5 dried-channel closure: pooledDriedResidBOUNDARY=${fmt(leg5b.pooledDriedResid)} pooledTransPost=${fmt(leg5b.totPost)} share=${leg5b.share == null ? 'n/a' : (leg5b.share * 100).toFixed(2) + '%'} (bar <=2%) => ${leg5b.pass ? 'PASS' : 'FAIL'}`);
  console.log(`BOUNDARY VERDICT (legs 2 + boundary 3-5; leg 1 det-gate in test): ${verdictBoundary}`);
  console.log(`RAID-DOOR LEG 3 named closure: counted=${leg3r.counted} passed=${leg3r.passed} rate=${leg3r.rate == null ? 'n/a' : (leg3r.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg3r.pooledResid)} pooledInflow=${fmt(leg3r.pooledInflow)} pooledShare=${leg3r.pooledShare == null ? 'n/a' : (leg3r.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg3r.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg3r.rows) console.log(`  raiddor named ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`RAID-DOOR LEG 4 generic closure: counted=${leg4r.counted} passed=${leg4r.passed} rate=${leg4r.rate == null ? 'n/a' : (leg4r.rate * 100).toFixed(1) + '%'} (bar >=80%) pooledResid=${fmt(leg4r.pooledResid)} pooledInflow=${fmt(leg4r.pooledInflow)} pooledShare=${leg4r.pooledShare == null ? 'n/a' : (leg4r.pooledShare * 100).toFixed(3) + '%'} (bar <=1%) => ${leg4r.pass ? 'PASS' : 'FAIL'}`);
  for (const row of leg4r.rows) console.log(`  raiddor generic ${row.seed} ${row.family}: in=${fmt(row.inflow)} resid=${fmt(row.residual)} (${row.share == null ? 'n/a' : (row.share * 100).toFixed(2) + '%'}) ${row.pass ? 'PASS' : 'FAIL'}`);
  console.log(`RAID-DOOR LEG 5 dried-channel closure: pooledDriedResidRAIDDOR=${fmt(leg5r.pooledDriedResid)} pooledTransPost=${fmt(leg5r.totPost)} share=${leg5r.share == null ? 'n/a' : (leg5r.share * 100).toFixed(2) + '%'} (bar <=2%) => ${leg5r.pass ? 'PASS' : 'FAIL'}`);
  console.log(`RAID-DOOR VERDICT (legs 2 + raiddor 3-5; leg 1 det-gate in test): ${verdictRaiddor}`);
  for (const s of seeds) {
    console.log(`  raid census seed ${s.seed}: records=${s.raidCensus.records} kcal=${fmt(s.raidCensus.kcal)} byPath=${JSON.stringify(s.raidCensus.byPath)} kcalByPath=${JSON.stringify(s.raidCensus.byPathKcal)} unanswered=${s.raidCensus.unansweredRecords} recs / ${fmt(s.raidCensus.unansweredKcal)} kcal, raiddorOn=${s.raiddorOn}, lastSnapDay=${s.lastSnapDay}`);
  }
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
  for (const s of seeds) {
    const r = (s.raidRecords || []).find(x => x.path === 'raid-unanswered');
    if (r) console.log(`SENSE first unanswered-raid take (seed ${s.seed}): day ${r.day}, caller ${r.caller}, asked ${r.asked}, taken ${r.totalKcal} kcal: ${r.items.map(i => `${i.units}u x ${i.kcalEach} ${i.name} (spoilDay ${i.spoilDay}) = ${fmt(i.kcal)} kcal`).join(', ')}`);
  }
  for (const s of seeds) {
    if ((s.raidSayLines || []).length) { console.log(`SENSE treeline say (seed ${s.seed}, day ${s.raidSayLines[0].day}): ${s.raidSayLines[0].line}`); break; }
  }
  console.log(`\nVERDICT (legs 2-5; leg 1 det-gate in test): ${verdictLegs2345}`);
}

if (require.main === module) main();
module.exports = { computeLegs, perSeed, famOf, isDried, FOCAL, NAMED, GENERIC };
