// analyze-fibersupply-a.js — analyzer + judge, arm sim-fibersupply-a
// (finding #2590, fiber-supply DIAGNOSIS: why the communal pile never
// has fiber when a departure tries to craft arrows).
//
// Reads the fibersupply-driver-a.js corpora (ctl = judged leg, rep =
// identical-code re-run) and judges the FROZEN prereg bars:
//   (0) instrument validity (proof test green + instrument errors 0
//       on all 16 per-seed files — the proof-test half is asserted by
//       the caller; this analyzer checks the errors half);
//   (1) supply gap quantified: dominant source + rate AND dominant
//       sink + rate AND pile fiber = 0 on >= 0.40 of village-days;
//   (2) fiber-need events >= 5 (no-mats departures with pile fiber 0);
//   (3) personal-vs-pile separation measured (census present every
//       seed, scholar mean stated).
// Also: the source/sink ledger with a day-level reconciliation
// (residual = census pile change minus attributed events — the
// betrayal +4s and anything else the wraps never see), the
// stick-throttle check (deadfall staffed days vs pile sticks >= 6),
// the ammoRows cross-check (pileBefore-pileAfter sink vs the
// pocketAmmo ledger rows), the wall numbers, and the ctl-vs-rep
// determinism check (identical code, identical seeds — the §15
// compare's companion; the panel compare .md is the instrument).
// Usage:
//   node scripts/analyze-fibersupply-a.js --ctl DIR --rep DIR [--out FILE]
//   node scripts/analyze-fibersupply-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

const SEEDS = [107091, 107092, 107093, 107094, 107095, 107096, 107097, 107098];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}

function loadLeg(dir, mode) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'fibersupply-a-s' + seed + '-fibersupply-a-' + mode + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

// seedStats(r): everything the judge and the evidence need from one
// per-seed corpus. All counts are read off the live rows, never
// re-derived from summaries.
function seedStats(r) {
  const census = Array.isArray(r.fiberCensus) ? r.fiberCensus : [];
  const events = Array.isArray(r.fiberEvents) ? r.fiberEvents : [];
  const crafts = Array.isArray(r.fiberCrafts) ? r.fiberCrafts : [];
  const ammo = Array.isArray(r.ammoRows) ? r.ammoRows : [];
  const says = Array.isArray(r.fiberSays) ? r.fiberSays : [];
  const slog = Array.isArray(r.fiberStashLog) ? r.fiberStashLog : [];
  const deaths = Array.isArray(r.deaths) ? r.deaths : [];
  const days = r.gameDays || 0;

  // Census: pile-zero share of village-days.
  let pileZeroDays = 0;
  let scholarSum = 0, scholarMax = 0, scholarN = 0;
  let villSum = 0, villMax = 0;
  let lastPileFiber = null, firstPileFiber = null;
  let lastHauls = 0, lastDeadfallFiber = 0, lastSticks = 0;
  let staffedDays = 0, sticksGe6Days = 0;
  for (const c of census) {
    const pf = (c.pile && c.pile.fiber) | 0;
    if (pf === 0) pileZeroDays++;
    if (firstPileFiber === null) firstPileFiber = pf;
    lastPileFiber = pf;
    if (c.scholarFiber != null) { scholarSum += c.scholarFiber; scholarMax = Math.max(scholarMax, c.scholarFiber); scholarN++; }
    if (c.villagersFiber != null) { villSum += c.villagersFiber; villMax = Math.max(villMax, c.villagersFiber); }
    lastHauls = c.deadfallHauls || 0;
    lastDeadfallFiber = c.deadfallFiber || 0;
    lastSticks = c.deadfallSticks || 0;
    if ((c.deadfallStaffed || 0) > 0) staffedDays++;
    if (((c.pile && c.pile.stick) | 0) >= 6) sticksGe6Days++;
  }

  // Ledger: fiber in/out by source/sink kind.
  const byKind = {};
  let inTotal = 0, outTotal = 0;
  for (const e of events) {
    const k = (e.kind || 'unknown') + (e.task ? '/' + e.task : '');
    byKind[k] = byKind[k] || { in: 0, out: 0, n: 0 };
    byKind[k].n++;
    if ((e.dFiber | 0) > 0) { byKind[k].in += e.dFiber; inTotal += e.dFiber; }
    else if ((e.dFiber | 0) < 0) { byKind[k].out += -(e.dFiber); outTotal += -(e.dFiber); }
  }
  // Residual: census pile change minus attributed events. The pile
  // starts at 0 (storage.js stash init), so the final census fiber
  // should equal the net attributed flow; anything else is a
  // wrap-blind move (the betrayal +4 is the known candidate).
  const netEvents = inTotal - outTotal;
  const residual = (lastPileFiber == null ? null : lastPileFiber - netEvents);
  // Day-level reconciliation: for each census day, the pile jump
  // vs that day's attributed events — names the unexplained days.
  const byDay = {};
  for (const e of events) { const d = e.day | 0; byDay[d] = (byDay[d] || 0) + (e.dFiber | 0); }
  const unexplainedDays = [];
  let prev = 0;
  for (const c of census) {
    const pf = (c.pile && c.pile.fiber) | 0;
    const jump = pf - prev;
    const attr = byDay[c.day | 0] || 0;
    if (jump !== attr) unexplainedDays.push({ day: c.day, jump: jump, attributed: attr, residual: jump - attr });
    prev = pf;
  }

  // Departures (ammoRows): the need side.
  let departures = 0, noMats = 0, noMatsFiber0 = 0, noMatsFiber0Served = 0;
  let craftOk = 0, craftFail = 0, craftAttempts = 0;
  let ammoSinkFiber = 0, ammoSinkStick = 0;
  let pileFiber0Rows = 0, pileRows = 0;
  let servedDepartures = 0, servedWithAmmo = 0;
  for (const a of ammo) {
    departures++;
    const pf = (a.pile && a.pile.fiber) | 0;
    if (a.pile) { pileRows++; if (pf === 0) pileFiber0Rows++; }
    if (a.failReason === 'no-mats') {
      noMats++;
      if (pf === 0) { noMatsFiber0++; if (a.servedThisDepart) noMatsFiber0Served++; }
    }
    if (a.failReason === 'craft-ok') craftOk++;
    if (a.failReason === 'craft-fail') craftFail++;
    if (a.crafted === 1) {
      craftAttempts++;
      if (a.pile && a.pileAfter) {
        ammoSinkFiber += ((a.pile.fiber | 0) - (a.pileAfter.fiber | 0));
        ammoSinkStick += ((a.pile.stick | 0) - (a.pileAfter.stick | 0));
      }
    }
    if (a.servedThisDepart) { servedDepartures++; if ((a.carriedAfter | 0) >= 1) servedWithAmmo++; }
  }
  // PocketAmmo ledger rows (the same sink, read off the ledger):
  let ledgerPocketOut = 0;
  for (const e of events) if (e.kind === 'pocketAmmo') ledgerPocketOut += -Math.min(0, e.dFiber | 0);

  // Scholar crafts (personal fiber).
  let scholarCraftAttempts = 0, scholarCraftOk = 0, scholarFiberSpent = 0, scholarPileDelta = 0;
  for (const c of crafts) {
    scholarCraftAttempts++;
    if (c.success) scholarCraftOk++;
    if (c.fiberSpentPersonal != null) scholarFiberSpent += c.fiberSpentPersonal;
    if (c.pileFiberDelta != null) scholarPileDelta += c.pileFiberDelta;
  }

  const starv = deaths.filter(isStarvation);
  const starvVillager = starv.filter(function (d) { return !d.player; });
  return {
    seed: r.seed, days: days, endReason: r.endReason || null, won: !!r.won,
    scaleRank: r.scaleRank || null, maxWave: r.maxWave || 1,
    standing: r.standing != null ? r.standing : null,
    deaths: deaths.length, starvation: starv.length, starvationVillager: starvVillager.length,
    communityLost: ['village-lost', 'village-dead', 'pop-zero'].indexOf(r.endReason) !== -1 ? 1 : 0,
    instrumentErrors: (r.instrumentErrors || []).length,
    censusDays: census.length, pileZeroDays: pileZeroDays,
    pileZeroShare: census.length ? pileZeroDays / census.length : null,
    scholarMean: scholarN ? scholarSum / scholarN : null, scholarMax: scholarMax,
    villagersMean: census.length ? villSum / census.length : null, villagersMax: villMax,
    lastPileFiber: lastPileFiber, firstPileFiber: firstPileFiber,
    deadfallHauls: lastHauls, deadfallFiber: lastDeadfallFiber, deadfallSticks: lastSticks,
    deadfallStaffedDays: staffedDays, sticksGe6Days: sticksGe6Days,
    byKind: byKind, inTotal: inTotal, outTotal: outTotal, netEvents: netEvents,
    residual: residual, unexplainedDays: unexplainedDays,
    departures: departures, noMats: noMats, noMatsFiber0: noMatsFiber0,
    noMatsFiber0Served: noMatsFiber0Served,
    craftOk: craftOk, craftFail: craftFail, craftAttempts: craftAttempts,
    ammoSinkFiber: ammoSinkFiber, ammoSinkStick: ammoSinkStick,
    ledgerPocketOut: ledgerPocketOut,
    pileFiber0Rows: pileFiber0Rows, pileRows: pileRows,
    servedDepartures: servedDepartures, servedWithAmmo: servedWithAmmo,
    scholarCraftAttempts: scholarCraftAttempts, scholarCraftOk: scholarCraftOk,
    scholarFiberSpent: scholarFiberSpent, scholarPileDelta: scholarPileDelta,
    fiberSays: says.length, fiberStashLog: slog.length,
    saySample: says.slice(0, 12),
    stashSample: slog.slice(0, 12),
    craftDayCalls: r.fiberCraftDayCalls || null,
  };
}

function legStats(rows) {
  const per = rows.map(function (x) { return seedStats(x.r); });
  const sum = function (f) { return per.reduce(function (t, s) { return t + (f(s) || 0); }, 0); };
  const villageDays = sum(function (s) { return s.censusDays; });
  const zeroDays = sum(function (s) { return s.pileZeroDays; });
  const needEvents = sum(function (s) { return s.noMatsFiber0; });
  const inTotal = sum(function (s) { return s.inTotal; });
  const outTotal = sum(function (s) { return s.outTotal; });
  // Dominant source/sink by band total.
  const kindTotals = {};
  for (const s of per) for (const k of Object.keys(s.byKind)) {
    kindTotals[k] = kindTotals[k] || { in: 0, out: 0, n: 0 };
    kindTotals[k].in += s.byKind[k].in; kindTotals[k].out += s.byKind[k].out; kindTotals[k].n += s.byKind[k].n;
  }
  let domSource = null, domSourceRate = 0, domSink = null, domSinkRate = 0;
  for (const k of Object.keys(kindTotals)) {
    if (kindTotals[k].in > domSourceRate) { domSource = k; domSourceRate = kindTotals[k].in; }
    if (kindTotals[k].out > domSinkRate) { domSink = k; domSinkRate = kindTotals[k].out; }
  }
  const errors = sum(function (s) { return s.instrumentErrors; });
  const censusPresent = per.every(function (s) { return s.censusDays > 0 && s.lastPileFiber != null; });
  const scholarMeans = per.map(function (s) { return s.scholarMean; }).filter(function (x) { return x != null; });
  return {
    per: per, seeds: per.length,
    villageDays: villageDays, zeroDays: zeroDays,
    pileZeroShare: villageDays ? zeroDays / villageDays : null,
    needEvents: needEvents,
    inTotal: inTotal, outTotal: outTotal,
    kindTotals: kindTotals, domSource: domSource, domSourceRate: domSourceRate,
    domSink: domSink, domSinkRate: domSinkRate,
    domSourcePerDay: villageDays ? domSourceRate / villageDays : null,
    domSinkPerDay: villageDays ? domSinkRate / villageDays : null,
    inPerDay: villageDays ? inTotal / villageDays : null,
    outPerDay: villageDays ? outTotal / villageDays : null,
    errors: errors, censusPresent: censusPresent,
    scholarMeanBand: scholarMeans.length ? mean(scholarMeans) : null,
    scholarMaxBand: Math.max.apply(null, per.map(function (s) { return s.scholarMax; })),
    villagersMaxBand: Math.max.apply(null, per.map(function (s) { return s.villagersMax; })),
    departures: sum(function (s) { return s.departures; }),
    noMats: sum(function (s) { return s.noMats; }),
    craftAttempts: sum(function (s) { return s.craftAttempts; }),
    craftOk: sum(function (s) { return s.craftOk; }),
    craftFail: sum(function (s) { return s.craftFail; }),
    ammoSinkFiber: sum(function (s) { return s.ammoSinkFiber; }),
    ledgerPocketOut: sum(function (s) { return s.ledgerPocketOut; }),
    deadfallHauls: sum(function (s) { return s.deadfallHauls; }),
    deadfallFiber: sum(function (s) { return s.deadfallFiber; }),
    deadfallSticks: sum(function (s) { return s.deadfallSticks; }),
    deadfallStaffedDays: sum(function (s) { return s.deadfallStaffedDays; }),
    sticksGe6Days: sum(function (s) { return s.sticksGe6Days; }),
    scholarCraftAttempts: sum(function (s) { return s.scholarCraftAttempts; }),
    scholarCraftOk: sum(function (s) { return s.scholarCraftOk; }),
    scholarFiberSpent: sum(function (s) { return s.scholarFiberSpent; }),
    scholarPileDelta: sum(function (s) { return s.scholarPileDelta; }),
    fiberSays: sum(function (s) { return s.fiberSays; }),
    fiberStashLog: sum(function (s) { return s.fiberStashLog; }),
    national: per.filter(function (s) { return (RANK_ORDER[s.scaleRank] || 0) >= 2; }).length,
    wins: per.filter(function (s) { return s.won; }).length,
    wave4: per.filter(function (s) { return s.maxWave >= 4; }).length,
    wave5: per.filter(function (s) { return s.maxWave >= 5; }).length,
    communityLost: sum(function (s) { return s.communityLost; }),
    starvation: sum(function (s) { return s.starvation; }),
    starvationVillager: sum(function (s) { return s.starvationVillager; }),
    medianDays: median(per.map(function (s) { return s.days; })),
    deaths: sum(function (s) { return s.deaths; }),
    residuals: per.map(function (s) { return { seed: s.seed, residual: s.residual, unexplainedDays: s.unexplainedDays }; }),
  };
}

// judge(ctl, rep): the FROZEN prereg bars. The proof-test half of
// bar (0) is asserted by the caller (test-fibersupply-a.js GREEN);
// this judge checks the errors half + bars (1)-(3).
function judge(ctl, rep) {
  const bars = [];
  bars.push({ id: '0', name: 'instrument validity (errors 0 on all 16 per-seed files)',
    value: ctl.errors + ' ctl errors + ' + rep.errors + ' rep errors',
    pass: ctl.errors === 0 && rep.errors === 0 });
  bars.push({ id: '1', name: 'supply gap quantified (named source+sink with rates, pile-zero >= 0.40)',
    value: 'source ' + ctl.domSource + ' ' + (ctl.domSourcePerDay == null ? 'null' : ctl.domSourcePerDay.toFixed(3)) + '/day; sink ' + ctl.domSink + ' ' + (ctl.domSinkPerDay == null ? 'null' : ctl.domSinkPerDay.toFixed(3)) + '/day; pile-zero ' + (ctl.pileZeroShare == null ? 'null' : ctl.pileZeroShare.toFixed(3)) + ' (' + ctl.zeroDays + '/' + ctl.villageDays + ' days)',
    pass: !!ctl.domSource && !!ctl.domSink && ctl.pileZeroShare != null && ctl.pileZeroShare >= 0.40 });
  bars.push({ id: '2', name: 'fiber-need events >= 5 (no-mats departures with pile fiber 0)',
    value: String(ctl.needEvents), pass: ctl.needEvents >= 5 });
  bars.push({ id: '3', name: 'personal-vs-pile separation measured (census present every seed, scholar mean stated)',
    value: 'census ' + (ctl.censusPresent ? 'present' : 'MISSING') + '; scholar mean ' + (ctl.scholarMeanBand == null ? 'null' : ctl.scholarMeanBand.toFixed(2)) + ', max ' + ctl.scholarMaxBand + '; villagers max ' + ctl.villagersMaxBand,
    pass: ctl.censusPresent && ctl.scholarMeanBand != null });
  let verdict = 'DIAG-GO', kind = '';
  if (!bars.every(function (b) { return b.pass; })) { verdict = 'DIAG-NO-GO'; kind = 'BAR-FAIL'; }
  return { verdict: verdict, kind: kind, bars: bars };
}

// determinism(ctlRows, repRows): identical code + identical seeds
// must give identical corpora (masking the MODE/leg labels, which
// differ by design). Returns per-seed equality + the first differing
// top-level key per divergent seed.
function determinism(ctlRows, repRows) {
  const out = [];
  for (let i = 0; i < ctlRows.length; i++) {
    const a = JSON.parse(JSON.stringify(ctlRows[i].r));
    const b = JSON.parse(JSON.stringify(repRows[i].r));
    delete a.mode; delete a.leg; delete b.mode; delete b.leg;
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    let diffKeys = [];
    if (sa !== sb) {
      for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) diffKeys.push(k);
      for (const k of Object.keys(b)) if (!(k in a)) diffKeys.push(k + ' (rep-only)');
    }
    out.push({ seed: ctlRows[i].seed, identical: sa === sb, diffKeys: diffKeys });
  }
  return out;
}

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function selftest() {
  // mk() defaults to the ctl GO shape: 150 village-days, pile-zero
  // 0.60, deadfall the dominant source (90 in), pocketAmmo the
  // dominant sink (60 out), 8 need events, census present, 0 errors.
  function mk(o) {
    o = o || {};
    const days = o.days != null ? o.days : 150;
    const zero = o.zero != null ? o.zero : 90;
    const census = [];
    for (let d = 1; d <= days; d++) census.push({ day: d, pile: { fiber: d <= zero ? 0 : 1, stick: 6 }, scholarFiber: 4, villagersFiber: 0, deadfallHauls: 10, deadfallFiber: 90, deadfallSticks: 15, deadfallStaffed: 1, trustLevel: 'open', rosterN: 20 });
    const events = [];
    for (let i = 0; i < (o.deadfallIn != null ? o.deadfallIn : 90); i++) events.push({ kind: 'assign', task: 'deadfall', dFiber: 1, day: 1 });
    for (let i = 0; i < (o.pocketOut != null ? o.pocketOut : 60); i++) events.push({ kind: 'pocketAmmo', dFiber: -1, day: 1 });
    const ammo = [];
    for (let i = 0; i < (o.need != null ? o.need : 8); i++) ammo.push({ failReason: 'no-mats', pile: { fiber: 0, stick: 2, stone: 1 }, pileAfter: { fiber: 0, stick: 2, stone: 1 }, servedThisDepart: false, carriedAfter: 0, crafted: 0 });
    for (let i = 0; i < 10; i++) ammo.push({ failReason: 'craft-ok', pile: { fiber: 1, stick: 2, stone: 1 }, pileAfter: { fiber: 0, stick: 0, stone: 0 }, servedThisDepart: false, carriedAfter: 5, crafted: 1 });
    return { seed: 107091, gameDays: 150, endReason: 'days', won: false, scaleRank: 'regional', maxWave: 5, standing: 199,
      instrumentErrors: o.errors || [], deaths: [], fiberCensus: census, fiberEvents: events,
      fiberCrafts: [], fiberSays: [], fiberStashLog: [], ammoRows: ammo, depmatRows: [],
      fiberCraftDayCalls: { weapon: 10, armor: 10 } };
  }
  function legOf(shapes) { return legStats(shapes.map(function (s) { return { seed: s.seed, r: s }; })); }
  const goCtl = legOf([mk()]);
  const goRep = legOf([mk()]);
  let j = judge(goCtl, goRep);
  check('judge DIAG-GO shape passes (errors 0 + pile-zero 0.60 + need 8 + census present)', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  check('GO shape names deadfall source and pocketAmmo sink', goCtl.domSource === 'assign/deadfall' && goCtl.domSink === 'pocketAmmo', goCtl.domSource + ' / ' + goCtl.domSink);
  j = judge(legOf([mk({ errors: ['boom'] })]), goRep);
  check('judge DIAG-NO-GO when instrument errors > 0', j.verdict === 'DIAG-NO-GO' && !j.bars[0].pass, JSON.stringify(j.bars));
  j = judge(legOf([mk({ zero: 58 })]), goRep); // 58/150 = 0.387 < 0.40
  check('judge DIAG-NO-GO when pile-zero is 0.387 (< 0.40)', j.verdict === 'DIAG-NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(legOf([mk({ zero: 60 })]), goRep); // exactly 0.40
  check('judge DIAG-GO when pile-zero sits exactly at 0.40', j.verdict === 'DIAG-GO' && j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(legOf([mk({ need: 4 })]), goRep);
  check('judge DIAG-NO-GO when need events are 4 (< 5)', j.verdict === 'DIAG-NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(legOf([mk({ need: 5 })]), goRep);
  check('judge DIAG-GO when need events sit exactly at 5', j.verdict === 'DIAG-GO' && j.bars[2].pass, JSON.stringify(j.bars));
  const noCensus = mk(); noCensus.fiberCensus = [];
  j = judge(legOf([noCensus]), goRep);
  check('judge DIAG-NO-GO when the census is missing', j.verdict === 'DIAG-NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  const det = determinism([{ seed: 107091, r: mk() }], [{ seed: 107091, r: mk() }]);
  check('determinism identical on identical corpora', det[0].identical === true, JSON.stringify(det));
  const other = mk(); other.standing = 200;
  const det2 = determinism([{ seed: 107091, r: mk() }], [{ seed: 107091, r: other }]);
  check('determinism names the differing key (standing)', det2[0].identical === false && det2[0].diffKeys.indexOf('standing') !== -1, JSON.stringify(det2));
  console.log('analyze-fibersupply-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  const ctlDir = (args.indexOf('--ctl') !== -1) ? args[args.indexOf('--ctl') + 1] : null;
  const repDir = (args.indexOf('--rep') !== -1) ? args[args.indexOf('--rep') + 1] : null;
  const outFile = (args.indexOf('--out') !== -1) ? args[args.indexOf('--out') + 1] : null;
  if (!ctlDir || !repDir) { console.error('usage: analyze-fibersupply-a.js --ctl DIR --rep DIR [--out FILE] | --selftest'); process.exit(2); }
  const ctlRows = loadLeg(ctlDir, 'ctl');
  const repRows = loadLeg(repDir, 'rep');
  const ctl = legStats(ctlRows);
  const rep = legStats(repRows);
  const j = judge(ctl, rep);
  const det = determinism(ctlRows, repRows);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: ctl, rep: rep, determinism: det };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind,
    bars: j.bars.map(function (b) { return { id: b.id, pass: b.pass, value: b.value }; }),
    pileZeroShare: ctl.pileZeroShare, needEvents: ctl.needEvents,
    domSource: ctl.domSource, domSourcePerDay: ctl.domSourcePerDay,
    domSink: ctl.domSink, domSinkPerDay: ctl.domSinkPerDay,
    inPerDay: ctl.inPerDay, outPerDay: ctl.outPerDay,
    scholarMeanBand: ctl.scholarMeanBand, scholarMaxBand: ctl.scholarMaxBand,
    villagersMaxBand: ctl.villagersMaxBand,
    national: ctl.national, wins: ctl.wins, wave4: ctl.wave4, wave5: ctl.wave5,
    medianDays: ctl.medianDays, communityLost: ctl.communityLost,
    starvation: ctl.starvation, deaths: ctl.deaths,
    determinismIdentical: det.filter(function (d) { return d.identical; }).length + '/' + det.length,
  }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { seedStats: seedStats, legStats: legStats, judge: judge, determinism: determinism, SEEDS: SEEDS };
