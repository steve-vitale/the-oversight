// tradefirst-analyze-20261110.js — trade/market first-numbers analyzer
// (arm sim-tradefirst-a). Reads evidence/2026-11-10/perseed-tradefirst-a/
// control-leg JSON (+ neutral-leg JSON for the neutrality check) and
// prints per-seed + pooled tables as JSON.
// Usage: node scripts/tradefirst-analyze-20261110.js [--out <summary.json>]
//   [--dir <perseed-dir>] [--run <run-tag>] [--mode control]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : def;
}
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-10', 'perseed-tradefirst-a'));
const RUN = argVal('--run', 'tradefirst-pilot');
const MODE = argVal('--mode', 'control');
const OUT = argVal('--out', null);

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  return (n % 2) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function bump(obj, k, n) { obj[k] = (obj[k] || 0) + (n === undefined ? 1 : n); }

if (require.main !== module) { module.exports = { median: median, mean: mean }; return; }

function loadLeg(mode) {
  const files = fs.readdirSync(DIR)
    .filter(function (f) { return f.indexOf('tradefirst-s') === 0 && f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; })
    .sort();
  return files.map(function (f) { return { file: f, o: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }; });
}

const control = loadLeg(MODE);
if (!control.length) { console.error('TRADEFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }

function dayBand(d) {
  if (d <= 30) return '1-30';
  if (d <= 60) return '31-60';
  if (d <= 90) return '61-90';
  return '91+';
}

const perSeed = [];
const pooled = {
  seeds: control.length,
  arrivalsTotal: 0, arrivalsByType: {}, arrivalsByBand: {}, arrivalsByTypeBand: {},
  arrivalsEntrepreneurial: 0, arrivalsShady: 0, arrivalsDesperate: 0, arrivalsHostile: 0, arrivalsReturningScammer: 0,
  arrivalsOtherRaw: [],
  traderPresentDays: 0, visitorPresentDays: 0, traderDays: 0, snapshotDays: 0,
  departuresTotal: 0, departuresByType: {}, departuresUnvisited: 0, departuresInteracted: 0,
  interactsTotal: 0, interactsByHow: {}, interactsByCaller: {}, interactsOtherRaw: [],
  cartOpenedVisits: 0, cartOpenedByHow: {},
  waresGenerated: 0, waresByKind: {}, waresPrices: [],
  buysTotal: 0, buysSucceeded: 0, buysByKind: {}, buysByItem: {},
  buyPrices: [], buyTabKcal: 0, buyPackKcal: 0,
  sellsTotal: 0, sellsSucceeded: 0, sellsByItem: {}, sellCreditGained: 0,
  paymentsTotal: 0, paymentsOk: 0, paymentsShort: 0, paymentsPaidKcal: 0,
  appraisalsTotal: 0, appraisalsByVerdict: {}, appraisalPrices: [],
  hawkerOffersTotal: 0, hawkerOffersGenerated: 0, hawkerOffersByKind: {},
  hawkerBuysTotal: 0, hawkerBuysSucceeded: 0, hawkerBuysByKind: {},
  riverTotal: 0, riverByVerb: {}, riverTraderSeen: 0, riverNewsSeen: 0,
  marketExchangesTotal: 0, marketExchangesRecorded: 0, marketExchangesByRoute: {}, marketExchangesByRole: {},
  godpathDeedsTotal: 0,
  scamsTotal: 0, scamsByKind: {}, scamsDiscovered: 0,
  tradeSourcedGear: [], tradeSourcedFoodKcal: 0, newsBought: 0,
  instrumentErrors: 0, wrapLive: {},
  considerCalls: 0, visitorDailyCalls: 0,
  wall: { wins: 0, national: 0, table: 0, wave4: 0, wave5: 0, regional: 0, survivals: [], deaths: 0, standings: [] },
};

for (const entry of control) {
  const o = entry.o;
  const s = {
    seed: o.seed, days: o.days, gameDays: o.gameDays, endReason: o.endReason,
    won: o.won, villageLost: o.villageLost, scaleRank: o.scaleRank,
    maxWave: o.maxWave, standing: o.standing, deaths: o.deaths.length,
    endPantryKcal: o.endPantryKcal, errors: o.instrumentErrors.length,
  };
  pooled.instrumentErrors += o.instrumentErrors.length;
  for (const w of Object.keys(o.wrapLive || {})) if (o.wrapLive[w]) pooled.wrapLive[w] = (pooled.wrapLive[w] || 0) + 1;
  pooled.considerCalls += o.considerCalls || 0;
  pooled.visitorDailyCalls += o.visitorDailyCalls || 0;

  // ---- Metric 1: arrivals ----
  const arrivals = o.arrivals || [];
  s.arrivals = arrivals.length; s.arrivalsByType = {}; s.arrivalsByBand = {};
  s.arrivalsEntrepreneurial = 0; s.arrivalsShady = 0; s.arrivalsDesperate = 0;
  s.arrivalsHostile = 0; s.arrivalsReturningScammer = 0;
  for (const a of arrivals) {
    bump(s.arrivalsByType, a.type || 'unknown'); bump(pooled.arrivalsByType, a.type || 'unknown');
    bump(s.arrivalsByBand, dayBand(a.day)); bump(pooled.arrivalsByBand, dayBand(a.day));
    bump(pooled.arrivalsByTypeBand, (a.type || 'unknown') + '|' + dayBand(a.day));
    if (a.type === 'other' || !a.type) pooled.arrivalsOtherRaw.push({ seed: o.seed, day: a.day, name: a.name });
    if (a.entrepreneurial) { s.arrivalsEntrepreneurial++; pooled.arrivalsEntrepreneurial++; }
    if (a.shady) { s.arrivalsShady++; pooled.arrivalsShady++; }
    if (a.desperate) { s.arrivalsDesperate++; pooled.arrivalsDesperate++; }
    if (a.hostile) { s.arrivalsHostile++; pooled.arrivalsHostile++; }
    if (a.returningScammer) { s.arrivalsReturningScammer++; pooled.arrivalsReturningScammer++; }
  }
  pooled.arrivalsTotal += s.arrivals;

  // ---- Metric 2: presence (from snapshots) + departures ----
  const daily = o.daily || [];
  const byDaySnap = {};
  for (const snap of daily) byDaySnap[snap.day] = snap;
  const snapDays = Object.keys(byDaySnap).map(function (d) { return parseInt(d, 10); }).sort(function (a, b) { return a - b; });
  s.snapshotDays = snapDays.length;
  s.traderPresentDays = 0; s.visitorPresentDays = 0; s.traderDays = 0;
  for (const d of snapDays) {
    const snap = byDaySnap[d];
    if (snap.traderPresent) s.traderPresentDays++;
    if (snap.visitorCount > 0) s.visitorPresentDays++;
    s.traderDays += Object.keys(snap.visitors || {}).filter(function (id) { return snap.visitors[id].type === 'trader'; }).length;
  }
  pooled.snapshotDays += s.snapshotDays;
  pooled.traderPresentDays += s.traderPresentDays;
  pooled.visitorPresentDays += s.visitorPresentDays;
  pooled.traderDays += s.traderDays;

  const departures = o.departures || [];
  s.departures = departures.length; s.departuresByType = {};
  s.departuresUnvisited = 0; s.departuresInteracted = 0;
  for (const dep of departures) {
    bump(s.departuresByType, dep.type || 'unknown'); bump(pooled.departuresByType, dep.type || 'unknown');
    if (dep.interacted) { s.departuresInteracted++; pooled.departuresInteracted++; }
    else { s.departuresUnvisited++; pooled.departuresUnvisited++; }
  }
  pooled.departuresTotal += s.departures;

  // ---- Metric 2b/3: interacts + cart ----
  const interacts = o.interacts || [];
  s.interacts = interacts.length; s.interactsByHow = {}; s.interactsByCaller = {};
  const cartVisitIds = {};
  for (const ix of interacts) {
    bump(s.interactsByHow, ix.how || 'unknown'); bump(pooled.interactsByHow, ix.how || 'unknown');
    bump(s.interactsByCaller, ix.caller || 'unknown'); bump(pooled.interactsByCaller, ix.caller || 'unknown');
    if (ix.caller === 'other') pooled.interactsOtherRaw.push({ seed: o.seed, day: ix.day, how: ix.how, stack: ix.stack });
    if (ix.how === 'trade' || ix.how === 'sell') {
      cartVisitIds[ix.visId] = true;
      bump(pooled.cartOpenedByHow, ix.how);
    }
  }
  s.cartOpenedVisits = Object.keys(cartVisitIds).length;
  pooled.cartOpenedVisits += s.cartOpenedVisits;
  pooled.interactsTotal += s.interacts;

  // ---- Metric 3: wares generated ----
  const wg = o.waresGenerated || [];
  s.waresGenerated = wg.length; s.waresByKind = {}; s.waresPrices = [];
  for (const g of wg) {
    for (const w of (g.wares || [])) {
      bump(s.waresByKind, w.kind || 'unknown'); bump(pooled.waresByKind, w.kind || 'unknown');
      if (typeof w.price === 'number') { s.waresPrices.push(w.price); pooled.waresPrices.push(w.price); }
    }
  }
  pooled.waresGenerated += s.waresGenerated;

  // ---- Metric 3: buys ----
  const buys = o.buys || [];
  s.buys = buys.length; s.buysSucceeded = 0; s.buysByKind = {}; s.buysByItem = {};
  s.buyPrices = []; s.buyTabKcal = 0; s.buyPackKcal = 0;
  for (const b of buys) {
    if (b.ret === true) {
      s.buysSucceeded++;
      bump(s.buysByKind, b.kind || 'unknown'); bump(pooled.buysByKind, b.kind || 'unknown');
      bump(s.buysByItem, (b.kind || 'unknown') + ':' + (b.name || b.itemId || 'unknown'));
      bump(pooled.buysByItem, (b.kind || 'unknown') + ':' + (b.name || b.itemId || 'unknown'));
      if (typeof b.price === 'number') { s.buyPrices.push(b.price); pooled.buyPrices.push(b.price); }
      const tabUsed = (typeof b.tabBefore === 'number' && typeof b.tabAfter === 'number') ? Math.max(0, b.tabBefore - b.tabAfter) : 0;
      s.buyTabKcal += tabUsed; pooled.buyTabKcal += tabUsed;
      // Pack kcal paid: the matching market-exchange record carries it.
      const mx = (o.marketExchanges || []).find(function (m) {
        return m.route === 'cart' && m.role === 'buyer' && m.item === b.itemId && m.recorded;
      });
      if (mx && typeof mx.packKcal === 'number') { s.buyPackKcal += mx.packKcal; pooled.buyPackKcal += mx.packKcal; }
      // Trade-sourced gear (Metric 6): nonfood items via the cart.
      if (b.kind === 'alien' || b.kind === 'tool') {
        pooled.tradeSourcedGear.push({ seed: o.seed, day: b.day, route: 'cart', kind: b.kind, itemId: b.itemId, name: b.name, price: b.price });
      }
      if (b.kind === 'food') {
        // Food bought: units/kcal from the generated ware (same visId).
        const gen = wg.find(function (g) { return g.visId === b.visId; });
        const ware = gen ? (gen.wares || [])[b.idx] : null;
        if (ware && typeof ware.units === 'number' && typeof ware.kcalEach === 'number') pooled.tradeSourcedFoodKcal += ware.units * ware.kcalEach;
      }
      if (b.kind === 'news') pooled.newsBought++;
    }
  }
  pooled.buysTotal += s.buys; pooled.buysSucceeded += s.buysSucceeded;

  // ---- Metric 3: sells ----
  const sells = o.sells || [];
  s.sells = sells.length; s.sellsSucceeded = 0; s.sellsByItem = {}; s.sellCreditGained = 0;
  for (const sl of sells) {
    if (sl.ret === true) {
      s.sellsSucceeded++;
      bump(s.sellsByItem, sl.name || 'unknown'); bump(pooled.sellsByItem, sl.name || 'unknown');
      if (typeof sl.creditBefore === 'number' && typeof sl.creditAfter === 'number') {
        const gain = sl.creditAfter - sl.creditBefore;
        s.sellCreditGained += gain; pooled.sellCreditGained += gain;
      }
    }
  }
  pooled.sellsTotal += s.sells; pooled.sellsSucceeded += s.sellsSucceeded;

  // ---- Metric 3: payments ----
  const payments = o.payments || [];
  s.payments = payments.length; s.paymentsOk = 0; s.paymentsShort = 0; s.paymentsPaidKcal = 0;
  for (const p of payments) {
    if (p.ok) { s.paymentsOk++; if (typeof p.paid === 'number') { s.paymentsPaidKcal += p.paid; pooled.paymentsPaidKcal += p.paid; } }
    else s.paymentsShort++;
  }
  pooled.paymentsTotal += s.payments; pooled.paymentsOk += s.paymentsOk; pooled.paymentsShort += s.paymentsShort;

  // ---- Metric 7: appraisals ----
  const appraisals = o.appraisals || [];
  s.appraisals = appraisals.length; s.appraisalsByVerdict = {}; s.appraisalPrices = [];
  for (const ap of appraisals) {
    bump(s.appraisalsByVerdict, ap.verdict || 'unknown'); bump(pooled.appraisalsByVerdict, ap.verdict || 'unknown');
    if (typeof ap.pricePerUnit === 'number') { s.appraisalPrices.push(ap.pricePerUnit); pooled.appraisalPrices.push(ap.pricePerUnit); }
  }
  pooled.appraisalsTotal += s.appraisals;

  // ---- Metric 4: resident trade ----
  const ho = o.hawkerOffers || [];
  s.hawkerOffers = ho.length; s.hawkerOffersGenerated = 0; s.hawkerOffersByKind = {};
  for (const h of ho) {
    if (h.generated) s.hawkerOffersGenerated++;
    bump(s.hawkerOffersByKind, h.kind || 'unknown'); bump(pooled.hawkerOffersByKind, h.kind || 'unknown');
  }
  pooled.hawkerOffersTotal += s.hawkerOffers; pooled.hawkerOffersGenerated += s.hawkerOffersGenerated;
  const hb = o.hawkerBuys || [];
  s.hawkerBuys = hb.length; s.hawkerBuysSucceeded = 0; s.hawkerBuysByKind = {};
  for (const h of hb) {
    if (h.ret === true) {
      s.hawkerBuysSucceeded++;
      bump(s.hawkerBuysByKind, h.kind || 'unknown'); bump(pooled.hawkerBuysByKind, h.kind || 'unknown');
      if (h.kind === 'tool') pooled.tradeSourcedGear.push({ seed: o.seed, day: h.day, route: 'resident', kind: h.kind, itemId: h.itemId, name: h.name, price: h.price });
    }
  }
  pooled.hawkerBuysTotal += s.hawkerBuys; pooled.hawkerBuysSucceeded += s.hawkerBuysSucceeded;

  // ---- Metric 5: river ----
  const river = o.river || [];
  s.river = river.length; s.riverByVerb = {};
  for (const r of river) { bump(s.riverByVerb, r.verb); bump(pooled.riverByVerb, r.verb); }
  pooled.riverTotal += s.river;
  const lastSnap = snapDays.length ? byDaySnap[snapDays[snapDays.length - 1]] : null;
  s.riverTraderSeen = snapDays.some(function (d) { return !!(byDaySnap[d].riverTrader); });
  s.riverNewsSeen = snapDays.some(function (d) { return !!(byDaySnap[d].riverNews); });
  if (s.riverTraderSeen) pooled.riverTraderSeen++;
  if (s.riverNewsSeen) pooled.riverNewsSeen++;
  void lastSnap;

  // ---- Metric 7/11: market exchanges + deeds + scams ----
  const mx = o.marketExchanges || [];
  s.marketExchanges = mx.length; s.marketExchangesRecorded = 0; s.marketExchangesByRoute = {}; s.marketExchangesByRole = {};
  for (const m of mx) {
    if (m.recorded) s.marketExchangesRecorded++;
    bump(s.marketExchangesByRoute, m.route || 'unknown'); bump(pooled.marketExchangesByRoute, m.route || 'unknown');
    bump(s.marketExchangesByRole, m.role || 'unknown'); bump(pooled.marketExchangesByRole, m.role || 'unknown');
  }
  pooled.marketExchangesTotal += s.marketExchanges; pooled.marketExchangesRecorded += s.marketExchangesRecorded;
  s.godpathDeeds = (o.godpathDeeds || []).length;
  pooled.godpathDeedsTotal += s.godpathDeeds;
  const scams = o.scams || [];
  s.scams = scams.length; s.scamsByKind = {}; s.scamsDiscovered = 0;
  for (const sc of scams) {
    bump(s.scamsByKind, sc.kind || 'unknown'); bump(pooled.scamsByKind, sc.kind || 'unknown');
    if (sc.discovered) s.scamsDiscovered++;
  }
  pooled.scamsTotal += s.scams; pooled.scamsDiscovered += s.scamsDiscovered;

  // ---- Metric 9: wall ----
  if (o.won) pooled.wall.wins++;
  if (o.scaleRank === 'national' || o.scaleRank === 'galactic') pooled.wall.national++;
  if (o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.table++;
  if (o.scaleRank === 'regional' || o.scaleRank === 'national' || o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.regional++;
  if ((o.maxWave || 1) >= 4) pooled.wall.wave4++;
  if ((o.maxWave || 1) >= 5) pooled.wall.wave5++;
  pooled.wall.survivals.push(o.days);
  pooled.wall.deaths += o.deaths.length;
  pooled.wall.standings.push(o.standing);

  perSeed.push(s);
}

pooled.wall.survivals.sort(function (a, b) { return a - b; });
pooled.wall.medianSurvival = median(pooled.wall.survivals);
pooled.wall.villageLost = perSeed.filter(function (s) { return s.villageLost; }).length;
pooled.waresPriceMean = mean(pooled.waresPrices);
pooled.waresPriceMedian = median(pooled.waresPrices);
pooled.buyPriceMean = mean(pooled.buyPrices);
pooled.buyPriceMedian = median(pooled.buyPrices);
pooled.appraisalPriceMean = mean(pooled.appraisalPrices);
pooled.appraisalPriceMedian = median(pooled.appraisalPrices);
pooled.traderPresentShare = pooled.snapshotDays ? pooled.traderPresentDays / pooled.snapshotDays : null;
pooled.visitorPresentShare = pooled.snapshotDays ? pooled.visitorPresentDays / pooled.snapshotDays : null;
pooled.unvisitedDepartureShare = pooled.departuresTotal ? pooled.departuresUnvisited / pooled.departuresTotal : null;

// ---- GO table (prereg) ----
const go = {
  engagementFloor: { bar: '>=5 visitor arrivals band-wide', value: pooled.arrivalsTotal, pass: pooled.arrivalsTotal >= 5 },
  unclassifiedArrivals: { bar: '0 unclassified (other-type) arrivals', value: pooled.arrivalsOtherRaw.length, pass: pooled.arrivalsOtherRaw.length === 0 },
  unclassifiedInteracts: { bar: '0 unclassified (other-caller) interact calls', value: pooled.interactsOtherRaw.length, pass: pooled.interactsOtherRaw.length === 0 },
  instrumentErrors: { bar: '0 instrument errors, all seeds, all legs', value: pooled.instrumentErrors, pass: pooled.instrumentErrors === 0 },
  completeCapture: { bar: 'per-seed tables for metrics 1-9 + sense scenes quoted', value: perSeed.length + ' seeds tabulated', pass: perSeed.length === control.length },
};
go.allPass = go.engagementFloor.pass && go.unclassifiedArrivals.pass && go.unclassifiedInteracts.pass && go.instrumentErrors.pass && go.completeCapture.pass;

// ---- Neutrality: control vs neutral on days + end pantry kcal + deaths ----
const neutral = loadLeg('neutral');
const neutrality = { seeds: neutral.length, matches: 0, mismatches: [] };
if (neutral.length) {
  const nBySeed = {};
  for (const n of neutral) nBySeed[n.o.seed] = n.o;
  for (const entry of control) {
    const c = entry.o, n = nBySeed[c.seed];
    if (!n) { neutrality.mismatches.push({ seed: c.seed, reason: 'no neutral file' }); continue; }
    const okDays = c.days === n.days;
    const okPantry = c.endPantryKcal === n.endPantryKcal;
    const okDeaths = c.deaths.length === n.deaths.length;
    if (okDays && okPantry && okDeaths) neutrality.matches++;
    else neutrality.mismatches.push({ seed: c.seed, control: { days: c.days, pantry: c.endPantryKcal, deaths: c.deaths.length }, neutral: { days: n.days, pantry: n.endPantryKcal, deaths: n.deaths.length } });
  }
} else {
  neutrality.mismatches.push({ reason: 'no neutral files found' });
}
go.neutrality = { bar: 'days + end pantry kcal + deaths match exactly, 8/8 seeds', value: neutrality.matches + '/' + control.length, pass: neutrality.matches === control.length && neutrality.mismatches.length === 0 };
go.allPass = go.allPass && go.neutrality.pass;

const summary = { run: RUN, mode: MODE, files: control.map(function (e) { return e.file; }), perSeed: perSeed, pooled: pooled, go: go, neutrality: neutrality };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
