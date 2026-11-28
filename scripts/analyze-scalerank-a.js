#!/usr/bin/env node
// scripts/analyze-scalerank-a.js — sim-scalerank-a analyzer.
// Reads ONLY the per-seed JSONs the driver wrote (never re-sims,
// never recomputes the mechanism from anywhere but the snapshot's
// own recorded fields). The mechanism stage, first-stage days, the
// binding input, and the §2 judge live here, not in the driver.
//
// Mechanism stages (per snapshot, from the recorded scale block):
//   0 — no polity ever (havenPolity null, no beat, not national)
//   1 — polity qualified (havenPolity non-null)
//   2 — national beat staged (pendingNational non-null)
//   3 — beat answered (nationalLive true)
//   4 — national held to end (nationalLive true at last snapshot)
//   LOST — nationalLive was true, then cleared (realm dissolved)
// The binding input at end: per-shape near-miss counts
// (leadSeasonedSubs/3, belong good + realmSize/4, covenantSeasoned/3,
// tradeSeasoned/3), the rung-gate remainder, and the closest link's
// gap (max over active links of min(age/30, trust/40)).
//
// Usage:
//   node scripts/analyze-scalerank-a.js [--outdir <dir>] [--json]
//   node scripts/analyze-scalerank-a.js --selftest
// Exit 0 on DIAG-GO, 1 on DIAG-NO-GO (or selftest failure).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-28', 'perseed-scalerank-a-arm');
const SEEDS = (process.env.SEEDS || '113301,113302,113303,113304,113305,113306,113307,113308')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

// stageAt(snap): the mechanism stage of one snapshot.
function stageAt(s) {
  if (!s || !s.scale) return 0;
  const sc = s.scale;
  if (sc.nationalLive) return 3;
  if (sc.pendingNational) return 2;
  if (sc.havenPolity) return 1;
  return 0;
}

// recomputeCounts(scale): per-shape counts recomputed from the
// snapshot's own recorded link rows (+ foreign roll for BELONG).
// Independent of the driver's recorded counts — reconciliation.
function recomputeCounts(sc) {
  if (!sc || !Array.isArray(sc.links)) return null;
  const active = sc.links.filter(r => r && r.status === 'active');
  const leadSeasoned = active.filter(r => r.primary === 'haven' && r.seasoned).length;
  const covSeasoned = active.filter(r => r.kind === 'covenant' && r.seasoned).length;
  const trSeasoned = active.filter(r => r.kind === 'trade' && r.seasoned).length;
  let belongBest = null;
  const fps = Array.isArray(sc.foreign) ? sc.foreign : [];
  for (const r of active) {
    if (r.subordinate !== 'haven' || !r.primary) continue;
    const good = (r.trust | 0) >= 50 && (r.arrears | 0) === 0 && (r.age | 0) >= 14;
    const fp = fps.find(f => f && f.primary === r.primary);
    const realmSize = 2 + (fp && Array.isArray(fp.subs) ? fp.subs.length : 0);
    const cand = { primary: r.primary, good, realmSize };
    if (!belongBest || cand.realmSize > belongBest.realmSize) belongBest = cand;
  }
  return { leadSeasoned, covSeasoned, trSeasoned, belongBest };
}

// closestLink(sc): the active link nearest the seasoned bar — the
// next link to season. Only UNSEASONED links count: a seasoned link
// is not a gap. Null when every active link is already seasoned.
function closestLink(sc) {
  if (!sc || !Array.isArray(sc.links)) return null;
  let best = null;
  for (const r of sc.links) {
    if (!r || r.status !== 'active' || r.seasoned) continue;
    const ageP = ((r.age | 0) || 0) / 30;
    const trustP = r.conquered ? 1 : (((r.trust | 0) || 0) / 40);
    const prog = Math.min(ageP, trustP);
    if (!best || prog > best.progress) {
      best = { other: r.other || null, kind: r.kind || null, age: r.age | 0, trust: r.trust | 0, conquered: !!r.conquered, seasoned: !!r.seasoned, progress: +prog.toFixed(3) };
    }
  }
  return best;
}

// bindingInput(sc): the end-of-run stall, from one snapshot.
function bindingInput(sc) {
  if (!sc) return null;
  const rc = recomputeCounts(sc);
  return {
    rank: sc.rank || 'village',
    leadSeasonedSubs: (sc.lead && sc.lead.seasonedSubs) ?? null, leadNeed: 3,
    belong: sc.belong ? { primary: sc.belong.primary, good: !!sc.belong.good, realmSize: sc.belong.realmSize, needRealm: 4, trust: sc.belong.trust, arrears: sc.belong.arrears, age: sc.belong.age } : null,
    covenantSeasoned: (sc.covenant && sc.covenant.seasoned) ?? null, covenantNeed: 3,
    tradeSeasoned: (sc.trade && sc.trade.seasoned) ?? null, tradeNeed: 3,
    rungGateDays: sc.rungGateDays,
    networkLive: !!sc.networkLive, networkLiveDay: sc.networkLiveDay,
    scaleRefused: !!sc.scaleRefused, exiled: !!sc.exiled,
    pendingNational: sc.pendingNational ? { shape: sc.pendingNational.shape, day: sc.pendingNational.day, daysPending: sc.pendingDays || 0 } : null,
    nationalLive: !!sc.nationalLive, nationalFirstDay: sc.nationalFirstDay,
    standing: sc.standing || null, gatedStanding: sc.gatedStanding,
    activeLinks: Array.isArray(sc.links) ? sc.links.filter(r => r && r.status === 'active').length : null,
    closestLink: closestLink(sc),
    recomputed: rc,
  };
}

// reconcileRow(row): stored-vs-recomputed on the last snapshot.
// Returns mismatch strings.
function reconcileRow(row) {
  const mismatches = [];
  const snaps = row.snapshots || [];
  const last = snaps.length ? snaps[snaps.length - 1] : null;
  if (!last) { mismatches.push('no-snapshots'); return mismatches; }
  if (!last.scale) { mismatches.push('last-snapshot-scale-null'); return mismatches; }
  const sc = last.scale;
  // (a) Rank recomputed from the flags vs recorded rank.
  const rankFromFlags = sc.globalLive ? 'global' : (sc.nationalLive ? 'national' : (sc.networkLive ? 'regional' : 'village'));
  if (rankFromFlags !== sc.rank) mismatches.push(`rank: flags->${rankFromFlags} recorded=${sc.rank}`);
  if (last.rank !== sc.rank) mismatches.push(`row.rank=${last.rank} != scale.rank=${sc.rank}`);
  // (b) Per-shape counts recomputed from the link rows vs recorded.
  const rc = recomputeCounts(sc);
  if (!rc) mismatches.push('recompute-null');
  else {
    if ((sc.lead ? sc.lead.seasonedSubs : null) !== rc.leadSeasoned) mismatches.push(`lead.seasonedSubs: recorded=${sc.lead && sc.lead.seasonedSubs} recomputed=${rc.leadSeasoned}`);
    if ((sc.covenant ? sc.covenant.seasoned : null) !== rc.covSeasoned) mismatches.push(`covenant.seasoned: recorded=${sc.covenant && sc.covenant.seasoned} recomputed=${rc.covSeasoned}`);
    if ((sc.trade ? sc.trade.seasoned : null) !== rc.trSeasoned) mismatches.push(`trade.seasoned: recorded=${sc.trade && sc.trade.seasoned} recomputed=${rc.trSeasoned}`);
    const rb = rc.belongBest;
    if (!sc.belong && rb) mismatches.push('belong: recorded=null recomputed=' + JSON.stringify(rb));
    else if (sc.belong && rb) {
      if (!!sc.belong.good !== !!rb.good) mismatches.push(`belong.good: recorded=${sc.belong.good} recomputed=${rb.good}`);
      if ((sc.belong.realmSize | 0) !== (rb.realmSize | 0)) mismatches.push(`belong.realmSize: recorded=${sc.belong.realmSize} recomputed=${rb.realmSize}`);
      if (sc.belong.primary !== rb.primary) mismatches.push(`belong.primary: recorded=${sc.belong.primary} recomputed=${rb.primary}`);
    } else if (sc.belong && !rb) mismatches.push('belong: recorded non-null, recomputed null');
  }
  // (c) Standing arithmetic: total == war + diplomacy + plenty.
  if (sc.standing) {
    const sum = (sc.standing.war | 0) + (sc.standing.diplomacy | 0) + (sc.standing.plenty | 0);
    if ((sc.standing.total | 0) !== sum) mismatches.push(`standing.total: recorded=${sc.standing.total} war+diplomacy+plenty=${sum}`);
  }
  // (d) The row's end.scale must be the last snapshot's scale block.
  const es = row.end && row.end.scale;
  if (!es) mismatches.push('row.end.scale-null');
  else if (JSON.stringify(es) !== JSON.stringify(sc)) mismatches.push('row.end.scale != last-snapshot-scale');
  if (row.end && row.end.rank !== last.rank) mismatches.push(`row.end.rank=${row.end.rank} != last-snapshot-rank=${last.rank}`);
  // (e) Deed-gate stored-vs-recomputed (census rule, kept).
  if (last.gate) {
    const g = last.gate;
    const waves = (g.w1 | 0) >= 5 && (g.w2 | 0) >= 5 && (g.w3 | 0) >= 4 && (g.w4 | 0) >= 3 && (g.w5 | 0) >= 2;
    if (!!g.waves !== waves) mismatches.push(`gate.waves: stored=${!!g.waves} recomputed=${waves}`);
    const scale = g.rank === 'national' || g.rank === 'global';
    if (!!g.scale !== scale) mismatches.push(`gate.scale: stored=${!!g.scale} recomputed=${scale}`);
  }
  return mismatches;
}

function analyzeRow(row) {
  const snaps = row.snapshots || [];
  const last = snaps.length ? snaps[snaps.length - 1] : (row.end || {});
  const sc = (last && last.scale) || (row.end && row.end.scale) || null;
  const aliveDay80 = snaps.some(s => (s.day | 0) >= 80);
  // Stage journey across the series.
  let maxStage = 0;
  let firstPolityDay = null, firstBeatDay = null, firstNationalDay = null, nationalLostDay = null;
  let nationalHeldDays = 0;
  let everNational = false;
  for (const s of snaps) {
    const stg = stageAt(s);
    if (stg > maxStage) maxStage = stg;
    if (s.scale && s.scale.nationalLive) { everNational = true; nationalHeldDays++; if (firstNationalDay === null) firstNationalDay = s.day; }
    if (s.scale && s.scale.havenPolity && firstPolityDay === null) firstPolityDay = s.day;
    if (s.scale && s.scale.pendingNational && firstBeatDay === null) firstBeatDay = s.day;
  }
  // LOST: national was live, then cleared (last snapshot not national
  // but nationalFirstDay stamped, or a later snapshot drops the flag).
  let nationalLost = false;
  if (everNational && !(sc && sc.nationalLive)) {
    nationalLost = true;
    for (const s of snaps) {
      if (s.scale && !s.scale.nationalLive && firstNationalDay !== null && s.day > firstNationalDay) { nationalLostDay = s.day; break; }
    }
  }
  const endStage = nationalLost ? 3 : (sc && sc.nationalLive ? 4 : maxStage);
  const ds = (row.deaths && row.deaths.summary) || null;
  const deathsTotal = ds ? (ds.deaths | 0) : 0;
  const deathsNamed = ds ? (deathsTotal - (ds.unattributed | 0)) : 0;
  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays, endReason: row.endReason,
    won: !!row.won, maxRank: row.maxRank, finalRank: row.finalRank,
    table: !!row.table, entered: !!row.entered, arcMax: row.arcMax,
    aliveDay80,
    finalSeat: (row.end && row.end.seat) || 'none',
    finalGateOk: (row.end && row.end.gate) ? !!row.end.gate.ok : null,
    finalCounts: (row.end && row.end.gate) ? { w1: row.end.gate.w1, w2: row.end.gate.w2, w3: row.end.gate.w3, w4: row.end.gate.w4, w5: row.end.gate.w5, contestsN: row.end.gate.contestsN, crisesN: row.end.gate.crisesN, rank: row.end.gate.rank, stage: row.end.gate.stage, foodDeeds: !!row.end.gate.foodDeeds } : null,
    mechanism: {
      maxStage, endStage, nationalLost, nationalLostDay,
      firstPolityDay: (row.markers && row.markers.firstPolityDay) ?? firstPolityDay,
      firstBeatDay: (row.markers && row.markers.firstBeatDay) ?? firstBeatDay,
      firstNationalDay,
      nationalHeldDays,
      beatShape: (last && last.scale && last.scale.pendingNational) ? last.scale.pendingNational.shape : null,
      endPolityShape: (sc && sc.havenPolity) ? sc.havenPolity.shape : null,
      binding: bindingInput(sc),
    },
    firstRegionalDay: (row.markers && row.markers.firstRegionalDay) ?? null,
    firstWaitingDay: row.firstWaitingDay ?? null,
    firstEnteredDay: row.firstEnteredDay ?? null,
    waitingDays: row.waitingDays || 0,
    overtimeEnd: (last && typeof last.overtime === 'number') ? last.overtime : null,
    popEnd: (row.end && typeof row.end.pop === 'number') ? row.end.pop : null,
    deaths: ds ? {
      total: deathsTotal, named: deathsNamed,
      classificationCompleteness: deathsTotal ? +(deathsNamed / deathsTotal).toFixed(4) : null,
      byCause: ds.byCause || {}, booksClose: !!ds.booksClose,
      unattributed: ds.unattributed | 0, rosteredDeaths: ds.rosteredDeaths | 0,
      guestDeaths: ds.guestDeaths | 0, joins: ds.joins | 0, leavers: ds.leavers | 0,
    } : null,
    gateErrors: row.gateErrors || 0,
    scaleErrors: row.scaleErrors || 0,
    linkErrors: row.linkErrors || 0,
    firesideCount: row.firesideCount || 0,
    tableLinesCount: row.tableLinesCount || 0,
    scaleLinesCount: row.scaleLinesCount || 0,
    reconciliation: reconcileRow(row),
  };
}

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function judge(analyzed, rows) {
  const poolAlive80 = analyzed.filter(a => a.aliveDay80).length;
  const poolFloor = poolAlive80 >= 6;
  const totalSnaps = rows.reduce((n, r) => n + ((r.snapshots || []).length), 0);
  const completeSnaps = rows.reduce((n, r) => n + ((r.snapshots || []).filter(s => s.scale && s.scale.standing && Array.isArray(s.scale.links)).length), 0);
  const coverage = totalSnaps ? completeSnaps / totalSnaps : 0;
  const coverageOk = coverage >= 0.95;
  const mismatches = analyzed.reduce((n, a) => n + a.reconciliation.length, 0);
  const reconciliationOk = mismatches === 0;
  const instrumentErrors = rows.reduce((n, r) => n + ((r.errors || []).length) + (r.gateErrors || 0) + (r.scaleErrors || 0) + (r.linkErrors || 0) + (((r.deaths && r.deaths.errors) || []).length), 0);
  const instrumentOk = instrumentErrors === 0;
  const sniffRegional = analyzed.some(a => (a.maxRank === 'regional' || a.maxRank === 'national' || a.maxRank === 'global'));
  const sniffLinks = rows.some(r => (r.snapshots || []).some(s => s.scale && Array.isArray(s.scale.links) && s.scale.links.length > 0));
  const sniffOk = sniffRegional && sniffLinks;
  const go = poolFloor && coverageOk && reconciliationOk && instrumentOk;
  let kind = 'DIAG-GO';
  if (!go) {
    if (!poolFloor) kind = 'DIAG-NO-GO THIN-POOL';
    else if (!coverageOk || !reconciliationOk) kind = 'DIAG-NO-GO ATTRIBUTION';
    else kind = 'DIAG-NO-GO INSTRUMENT';
  }
  if (go && !sniffOk) kind = 'DIAG-NO-GO THIN-POOL';
  return {
    verdict: kind, go,
    pool: { aliveDay80: poolAlive80, of: analyzed.length, floor: 6, pass: poolFloor },
    coverage: { complete: completeSnaps, total: totalSnaps, ratio: totalSnaps ? +(completeSnaps / totalSnaps).toFixed(4) : 0, pass: coverageOk },
    reconciliation: { mismatches, pass: reconciliationOk },
    instrument: { errors: instrumentErrors, pass: instrumentOk },
    sniff: { regionalAny: sniffRegional, linksAny: sniffLinks, pass: sniffOk },
  };
}

function analyze(outdir, seeds) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const p = path.join(outdir, `s${seed}.json`);
    if (!fs.existsSync(p)) { missing.push(seed); continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  if (missing.length) return { error: `missing rows: ${missing.join(',')}`, rows: [], analyzed: [] };
  const analyzed = rows.map(analyzeRow);
  const verdict = judge(analyzed, rows);
  // Pooled mechanism finding: seeds per stage, binding inputs.
  const stageCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const a of analyzed) stageCounts[a.mechanism.maxStage] = (stageCounts[a.mechanism.maxStage] || 0) + 1;
  const nationalLostSeeds = analyzed.filter(a => a.mechanism.nationalLost).length;
  const firstPolityDays = analyzed.map(a => a.mechanism.firstPolityDay).filter(d => d !== null && d !== undefined);
  const firstBeatDays = analyzed.map(a => a.mechanism.firstBeatDay).filter(d => d !== null && d !== undefined);
  const firstNationalDays = analyzed.map(a => a.mechanism.firstNationalDay).filter(d => d !== null && d !== undefined);
  // Pooled death-cause shares (named causes only).
  const byCause = {};
  let deathsTotal = 0, deathsNamed = 0;
  for (const a of analyzed) {
    if (!a.deaths) continue;
    deathsTotal += a.deaths.total;
    deathsNamed += a.deaths.named;
    for (const [k, v] of Object.entries(a.deaths.byCause || {})) byCause[k] = (byCause[k] || 0) + v;
  }
  const wall = {
    seeds: analyzed.length, wins: analyzed.filter(a => a.won).length,
    national: analyzed.filter(a => (a.maxRank === 'national' || a.maxRank === 'global')).length,
    regional: analyzed.filter(a => (a.maxRank === 'regional' || a.maxRank === 'national' || a.maxRank === 'global')).length,
    table: analyzed.filter(a => a.table).length,
    seated: analyzed.filter(a => a.entered).length,
    entered: analyzed.filter(a => a.entered).length,
    medianSurvival: medianOf(analyzed.map(a => a.days)),
    medianFirstNationalDay: medianOf(firstNationalDays),
    medianFirstPolityDay: medianOf(firstPolityDays),
    medianFirstBeatDay: medianOf(firstBeatDays),
    stageCounts, nationalLostSeeds,
    wave5BarSeeds: analyzed.filter(a => a.finalCounts && (a.finalCounts.w5 | 0) >= 2).length,
    wave4BarSeeds: analyzed.filter(a => a.finalCounts && (a.finalCounts.w4 | 0) >= 3).length,
    deathCauseShares: deathsTotal ? byCause : null,
    deathClassificationCompleteness: deathsTotal ? +(deathsNamed / deathsTotal).toFixed(4) : null,
    deathsTotal, deathsNamed,
  };
  return { verdict, wall, analyzed, rows };
}

function selftest() {
  let passed = 0, failed = 0;
  const fails = [];
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  const mkScale = (over) => Object.assign({
    rank: 'village', networkLive: false, networkLiveDay: null,
    nationalLive: false, nationalFirstDay: null, nationalShape: null,
    globalLive: false, pendingNational: null, pendingDays: 0,
    scaleRefused: false, natDefer: [], exiled: false, rungGateDays: null,
    havenPolity: null, foreign: [],
    lead: { seasonedSubs: 0, subs: [], activeSubs: 0, need: 3 },
    belong: null,
    covenant: { seasoned: 0, others: [], active: 0, need: 3 },
    trade: { seasoned: 0, others: [], active: 0, need: 3 },
    links: [], linkErrors: [],
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    gatedStanding: 0,
  }, over || {});
  const mkSnap = (day, scaleOver) => ({
    day, rank: (scaleOver && scaleOver.rank) || 'village', arc: 4,
    tableWaiting: false, tableDone: false, tableAnnounced: false, stage: 2, pop: 12,
    pantry: 10000, pantrySrc: 'pantryKcalLive', waitingDays: 0,
    gate: { ok: false, waves: false, contests: false, crises: false, scale: false, stageOk: true, foodDeeds: true, stage: 2, w1: 5, w2: 5, w3: 4, w4: 1, w5: 0, contestsN: 3, crisesN: 3, rank: 'village' },
    gateError: null, seat: 'none', ladderPeak: 1, capstone: null, overtime: 0,
    scale: mkScale(scaleOver), scaleError: null,
  });

  // Stages.
  check('stage 0 no polity', stageAt(mkSnap(10, {})) === 0);
  check('stage 1 polity qualified', stageAt(mkSnap(60, { havenPolity: { shape: 'covenant', primary: null, villages: ['haven', 'a', 'b', 'c'], size: 4, led: false }, rank: 'regional', networkLive: true, networkLiveDay: 50 })) === 1);
  check('stage 2 beat staged', stageAt(mkSnap(80, { pendingNational: { shape: 'covenant', day: 80, villages: ['haven', 'a', 'b', 'c'], led: false, primary: null }, pendingDays: 1, havenPolity: { shape: 'covenant', primary: null, villages: ['haven', 'a', 'b', 'c'], size: 4, led: false }, rank: 'regional', networkLive: true, networkLiveDay: 50 })) === 2);
  check('stage 3 national live', stageAt(mkSnap(90, { nationalLive: true, nationalFirstDay: 90, nationalShape: 'covenant', rank: 'national', networkLive: true, networkLiveDay: 50 })) === 3);

  // Recompute counts from link rows.
  const linkRows = [
    { id: 'l1', kind: 'sub', other: 'emberhold', primary: 'haven', subordinate: 'emberhold', a: null, b: null, day: 10, age: 40, trust: 55, status: 'active', seasoned: true, conquered: false, arrears: 0 },
    { id: 'l2', kind: 'sub', other: 'stonebridge', primary: 'haven', subordinate: 'stonebridge', a: null, b: null, day: 12, age: 38, trust: 45, status: 'active', seasoned: true, conquered: false, arrears: 0 },
    { id: 'l3', kind: 'covenant', other: 'millford', primary: null, subordinate: null, a: 'haven', b: 'millford', day: 20, age: 30, trust: 40, status: 'active', seasoned: true, conquered: false, arrears: 0 },
    { id: 'l4', kind: 'covenant', other: 'oakvale', primary: null, subordinate: null, a: 'haven', b: 'oakvale', day: 40, age: 10, trust: 60, status: 'active', seasoned: false, conquered: false, arrears: 0 },
    { id: 'l5', kind: 'trade', other: 'fernhollow', primary: null, subordinate: null, a: 'haven', b: 'fernhollow', day: 5, age: 45, trust: 30, status: 'dissolved', seasoned: false, conquered: false, arrears: 0 },
  ];
  const scLinks = mkScale({
    rank: 'regional', networkLive: true, networkLiveDay: 50,
    lead: { seasonedSubs: 2, subs: ['emberhold', 'stonebridge'], activeSubs: 2, need: 3 },
    covenant: { seasoned: 1, others: ['millford'], active: 2, need: 3 },
    trade: { seasoned: 0, others: [], active: 0, need: 3 },
    links: linkRows, foreign: [],
    standing: { total: 68, war: 0, diplomacy: 68, plenty: 0, warPts: 0, links: 2, feasts: 0 },
  });
  const rc = recomputeCounts(scLinks);
  check('recompute lead seasoned 2', rc.leadSeasoned === 2);
  check('recompute covenant seasoned 1', rc.covSeasoned === 1);
  check('recompute trade seasoned 0 (dissolved excluded)', rc.trSeasoned === 0);
  check('recompute belong null (no subordinate link)', rc.belongBest === null);
  const cl = closestLink(scLinks);
  check('closest link is the young covenant (age 10, trust 60)', cl.other === 'oakvale' && cl.progress === 0.333, JSON.stringify(cl));

  // BELONG recompute.
  const belongRows = [
    { id: 'b1', kind: 'sub', other: 'highcourt', primary: 'highcourt', subordinate: 'haven', a: null, b: null, day: 10, age: 40, trust: 55, status: 'active', seasoned: true, conquered: false, arrears: 0 },
  ];
  const scBelong = mkScale({
    rank: 'regional', networkLive: true, networkLiveDay: 50,
    belong: { primary: 'highcourt', good: true, realmSize: 4, needRealm: 4, trust: 55, arrears: 0, age: 40 },
    links: belongRows, foreign: [{ primary: 'highcourt', subs: ['x', 'y'] }],
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 },
  });
  const rcb = recomputeCounts(scBelong);
  check('belong recompute good + realm 4', rcb.belongBest && rcb.belongBest.good === true && rcb.belongBest.realmSize === 4, JSON.stringify(rcb.belongBest));

  // Reconciliation: clean row passes, tampered counts fail.
  const mkRow = (seed, snaps, endScale) => ({
    seed, days: 150, gameDays: 150, endReason: 'horizon', won: false,
    maxRank: 'regional', finalRank: 'regional', table: true, entered: false, arcMax: 4,
    firstWaitingDay: 95, firstEnteredDay: null, waitingDays: 10,
    gateErrors: 0, scaleErrors: 0, linkErrors: 0, errors: [],
    markers: { firstRegionalDay: 50, firstNationalDay: null, firstPolityDay: null, firstBeatDay: null, firstLesserDay: 60, firstFullDay: null, firstOvertimeDay: null },
    end: { rank: 'regional', pop: 12, pantry: 10000, pantrySrc: 'pantryKcalLive', stage: 2, gate: snaps[snaps.length - 1].gate, seat: 'none', ladderPeak: 1, capstone: null, overtime: 0, scale: endScale },
    snapshots: snaps, deaths: { summary: { deaths: 0, byCause: {}, booksClose: true, unattributed: 0, rosteredDeaths: 0, guestDeaths: 0, joins: 0, leavers: 0 }, errors: [] },
    fireside: [], firesideCount: 0, tableLines: [], tableLinesCount: 0, scaleLines: [], scaleLinesCount: 0, captureCount: 0, error: null,
  });
  const cleanSnap = mkSnap(80, { rank: 'regional', networkLive: true, networkLiveDay: 50 });
  const cleanRow = mkRow(113301, [cleanSnap], cleanSnap.scale);
  check('reconcile clean row 0 mismatches', reconcileRow(cleanRow).length === 0, reconcileRow(cleanRow).join(';'));
  const tampered = JSON.parse(JSON.stringify(cleanRow));
  tampered.snapshots[0].scale.lead.seasonedSubs = 3;
  check('reconcile catches tampered lead count', reconcileRow(tampered).length > 0);
  const rankBad = JSON.parse(JSON.stringify(cleanRow));
  rankBad.snapshots[0].scale.rank = 'national';
  check('reconcile catches rank/flags disagreement', reconcileRow(rankBad).length > 0);
  const standingBad = JSON.parse(JSON.stringify(cleanRow));
  standingBad.snapshots[0].scale.standing.total = 99;
  check('reconcile catches standing arithmetic', reconcileRow(standingBad).length > 0);

  // Stage journey + LOST on a synthetic series.
  const series = [
    mkSnap(40, { rank: 'village', networkLive: false }),
    mkSnap(60, { rank: 'regional', networkLive: true, networkLiveDay: 50, havenPolity: { shape: 'trade', primary: null, villages: ['haven', 'a', 'b', 'c'], size: 4, led: false } }),
    mkSnap(85, { rank: 'regional', networkLive: true, networkLiveDay: 50, havenPolity: { shape: 'trade', primary: null, villages: ['haven', 'a', 'b', 'c'], size: 4, led: false }, pendingNational: { shape: 'trade', day: 85, villages: ['haven', 'a', 'b', 'c'], led: false, primary: null }, pendingDays: 1 }),
    mkSnap(86, { rank: 'national', networkLive: true, networkLiveDay: 50, nationalLive: true, nationalFirstDay: 86, nationalShape: 'trade' }),
    mkSnap(120, { rank: 'regional', networkLive: true, networkLiveDay: 50, nationalFirstDay: null }),
  ];
  const lostRow = mkRow(113302, series, series[series.length - 1].scale);
  lostRow.maxRank = 'national'; lostRow.finalRank = 'regional';
  const aLost = analyzeRow(lostRow);
  check('stage journey maxStage 3', aLost.mechanism.maxStage === 3, 'got ' + aLost.mechanism.maxStage);
  check('national LOST detected', aLost.mechanism.nationalLost === true);
  check('firstNationalDay 86', aLost.mechanism.firstNationalDay === 86);
  check('firstPolityDay 60', aLost.mechanism.firstPolityDay === 60);
  check('firstBeatDay 85', aLost.mechanism.firstBeatDay === 85);
  check('nationalHeldDays 1', aLost.mechanism.nationalHeldDays === 1, 'got ' + aLost.mechanism.nationalHeldDays);

  // Judge shapes.
  const goodRows = SEEDS.map(s => {
    const snap = mkSnap(80, { rank: 'regional', networkLive: true, networkLiveDay: 50 });
    snap.scale.links = [{ id: 'l1', kind: 'sub', other: 'emberhold', primary: 'haven', subordinate: 'emberhold', a: null, b: null, day: 10, age: 70, trust: 55, status: 'active', seasoned: true, conquered: false, arrears: 0 }];
    snap.scale.lead = { seasonedSubs: 1, subs: ['emberhold'], activeSubs: 1, need: 3 };
    return mkRow(s, [snap], snap.scale);
  });
  const jGood = judge(goodRows.map(analyzeRow), goodRows);
  check('judge GO on clean corpus', jGood.verdict === 'DIAG-GO', jGood.verdict);
  const thinRows = SEEDS.map((s, i) => {
    const snap = mkSnap(i < 2 ? 80 : 40, { rank: 'regional', networkLive: true, networkLiveDay: 50 });
    return mkRow(s, [snap], snap.scale);
  });
  const jThin = judge(thinRows.map(analyzeRow), thinRows);
  check('judge THIN-POOL when <6 alive day 80', jThin.verdict === 'DIAG-NO-GO THIN-POOL', jThin.verdict);
  const badRows = goodRows.map(r => {
    const c = JSON.parse(JSON.stringify(r));
    c.snapshots[0].scale = null;
    c.scaleErrors = 1;
    return c;
  });
  const jAttr = judge(badRows.map(analyzeRow), badRows);
  check('judge ATTRIBUTION on coverage miss', jAttr.verdict === 'DIAG-NO-GO ATTRIBUTION', jAttr.verdict);

  console.log(`SELFTEST: ${passed} passed, ${failed} failed`);
  if (failed) { console.log('FAILURES: ' + fails.join('; ')); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) { selftest(); return; }
  const outdirIdx = args.indexOf('--outdir');
  const outdir = outdirIdx >= 0 ? args[outdirIdx + 1] : OUTDIR;
  const res = analyze(outdir, SEEDS);
  if (res.error) { console.error('ANALYZE FAILED: ' + res.error); process.exit(1); }
  const out = { verdict: res.verdict, wall: res.wall, perSeed: res.analyzed };
  console.log(JSON.stringify(out, null, 1));
  if (!res.verdict.go) { console.error('VERDICT: ' + res.verdict.verdict); process.exit(1); }
  console.log('VERDICT: ' + res.verdict.verdict);
}
if (require.main === module) main().catch(e => { console.error('ANALYZE FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { stageAt, recomputeCounts, closestLink, bindingInput, reconcileRow, analyzeRow, judge, analyze };
