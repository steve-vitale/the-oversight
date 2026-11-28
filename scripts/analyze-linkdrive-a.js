#!/usr/bin/env node
// scripts/analyze-linkdrive-a.js — sim-linkdrive-a analyzer.
// Reads ONLY the per-seed JSONs the driver wrote (never re-sims,
// never recomputes the mechanism from anywhere but the snapshot's
// own recorded fields). The mechanism stage, first-stage days, the
// binding input, and the per-leg judge live in the reused scalerank
// functions (imported, not re-derived); the PAIRED before/after
// table and the prereg §2 GO judge live here.
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
// PAIRED verdict (prereg §2): GO iff the armed leg meets (a) national
// on >= 2/8 seeds OR (b) max simultaneous seasoned LEAD subs >= 3 on
// >= 4/8 seeds, AND guards (c) median armed survival >= 0.8x baseline
// median AND (d) armed starvation deaths <= baseline + 2 — with the
// per-leg pool/coverage/reconciliation/instrument bars clean.
//
// Usage:
//   node scripts/analyze-linkdrive-a.js [--outdir <dir>] [--json]
//   node scripts/analyze-linkdrive-a.js --selftest
// Exit 0 on GO, 1 on NO-GO (or selftest failure).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SR = require('./analyze-scalerank-a');
const { stageAt, recomputeCounts, closestLink, bindingInput, reconcileRow, analyzeRow, judge, analyze: analyzeSingle } = SR;
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-28', 'perseed-linkdrive-a-arm');
const SEEDS = (process.env.SEEDS || '113501,113502,113503,113504,113505,113506,113507,113508')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

// maxSeasonedLead(row): the most seasoned Haven-primary subs held at
// once on any day of the run — the LEAD realm input as a held state,
// not an end state. Read from the snapshot series' own recorded
// lead.seasonedSubs; also returns the first day it hit 3.
function maxSeasonedLead(row) {
  const snaps = (row && row.snapshots) || [];
  let max = 0, firstDay3 = null, heldDays3 = 0;
  for (const s of snaps) {
    const n = (s && s.scale && s.scale.lead && typeof s.scale.lead.seasonedSubs === 'number')
      ? s.scale.lead.seasonedSubs : 0;
    if (n > max) max = n;
    if (n >= 3) {
      heldDays3++;
      if (firstDay3 === null) firstDay3 = s.day;
    }
  }
  return { max, firstDay3, heldDays3 };
}

// everLinks(row): distinct link ids ever seen in the snapshot series,
// split by shape (LEAD = primary haven, BELONG = subordinate haven,
// peer = covenant/trade kind). Shapes come from the link rows, which
// carry primary/subordinate/kind.
function everLinks(row) {
  const snaps = (row && row.snapshots) || [];
  const seen = new Map();
  for (const s of snaps) {
    const links = (s && s.scale && Array.isArray(s.scale.links)) ? s.scale.links : [];
    for (const l of links) {
      if (!l || !l.id || seen.has(l.id)) continue;
      let shape = '?';
      if (l.primary === 'haven') shape = 'lead';
      else if (l.subordinate === 'haven') shape = 'belong';
      else if (l.kind === 'covenant' || l.kind === 'trade') shape = l.kind;
      seen.set(l.id, { id: l.id, shape: shape, other: l.other || null, firstDay: s.day });
    }
  }
  const list = [...seen.values()];
  return {
    total: list.length,
    lead: list.filter(x => x.shape === 'lead').length,
    belong: list.filter(x => x.shape === 'belong').length,
    covenant: list.filter(x => x.shape === 'covenant').length,
    trade: list.filter(x => x.shape === 'trade').length,
    unknown: list.filter(x => x.shape === '?').length,
    list: list,
  };
}

// driveFormed(row): links the DRIVE formed, from the policy event log
// (propose accepted + raise-answer linked), matched to ever-links by
// village. Links the drive did NOT form (competent's own talk-round
// raise-accepts, or links already present) are the residual: ever
// minus drive-formed. The analyzer never re-simulates.
function driveFormed(row) {
  const ld = (row && row.linkdrive) || null;
  if (!ld || !Array.isArray(ld.events)) return null;
  const formed = [];
  for (const e of ld.events) {
    if (!e) continue;
    if (e.kind === 'propose' && e.outcome === 'accepted') formed.push({ via: 'propose', village: e.village || null, day: e.day });
    if (e.kind === 'raise-answer' && e.outcome === 'linked') formed.push({ via: 'raise', village: e.village || null, day: e.day });
  }
  return { total: formed.length, viaPropose: formed.filter(f => f.via === 'propose').length, viaRaise: formed.filter(f => f.via === 'raise').length, list: formed };
}

function starvationDeaths(row) {
  try {
    const by = (row && row.deaths && row.deaths.summary && row.deaths.summary.byCause) || {};
    return (by.starvation | 0) || 0;
  } catch (e) { return 0; }
}

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// pairedRow(base, armed): one seed, both legs.
function pairedRow(base, armed) {
  const ab = analyzeRow(base);
  const aa = analyzeRow(armed);
  const mb = maxSeasonedLead(base);
  const ma = maxSeasonedLead(armed);
  const eb = everLinks(base);
  const ea = everLinks(armed);
  const df = driveFormed(armed);
  const diploHeld = (row) => {
    const snaps = (row && row.snapshots) || [];
    let days = 0, maxDiplo = 0;
    for (const s of snaps) {
      const d = (s && s.scale && s.scale.standing) ? (s.scale.standing.diplomacy | 0) : 0;
      if (d > 0) days++;
      if (d > maxDiplo) maxDiplo = d;
    }
    return { heldDays: days, max: maxDiplo };
  };
  return {
    seed: base.seed,
    base: { days: ab.days, endReason: ab.endReason, won: ab.won, maxRank: ab.maxRank, finalRank: ab.finalRank,
      finalSeat: ab.finalSeat, maxStage: ab.mechanism.maxStage, firstPolityDay: ab.mechanism.firstPolityDay,
      firstBeatDay: ab.mechanism.firstBeatDay, firstNationalDay: ab.mechanism.firstNationalDay,
      maxSeasonedLead: mb.max, maxLeadFirstDay3: mb.firstDay3, maxLeadHeldDays3: mb.heldDays3,
      everLinks: eb, starvation: starvationDeaths(base), diplomacyHeld: diploHeld(base),
      deaths: ab.deaths ? ab.deaths.total : null },
    armed: { days: aa.days, endReason: aa.endReason, won: aa.won, maxRank: aa.maxRank, finalRank: aa.finalRank,
      finalSeat: aa.finalSeat, maxStage: aa.mechanism.maxStage, firstPolityDay: aa.mechanism.firstPolityDay,
      firstBeatDay: aa.mechanism.firstBeatDay, firstNationalDay: aa.mechanism.firstNationalDay,
      maxSeasonedLead: ma.max, maxLeadFirstDay3: ma.firstDay3, maxLeadHeldDays3: ma.heldDays3,
      everLinks: ea, driveFormed: df, starvation: starvationDeaths(armed), diplomacyHeld: diploHeld(armed),
      deaths: aa.deaths ? aa.deaths.total : null,
      linkdrive: armed.linkdrive || null },
    survivalDelta: aa.days - ab.days,
    nationalArmed: (aa.maxRank === 'national' || aa.maxRank === 'global'),
    leadRealmArmed: ma.max >= 3,
  };
}

// judgePaired(paired, baseRows, armedRows): the prereg §2 verdict.
// Per-leg instrument bars come from the scalerank judge() run on each
// leg separately; the primary bar + guards are paired.
function judgePaired(paired, baseRows, armedRows) {
  const jb = judge(baseRows.map(analyzeRow), baseRows);
  const ja = judge(armedRows.map(analyzeRow), armedRows);
  const n = paired.length;
  const nationalArmed = paired.filter(p => p.nationalArmed).length;
  const realmArmed = paired.filter(p => p.leadRealmArmed).length;
  const barA = nationalArmed >= 2;
  const barB = realmArmed >= 4;
  const primary = barA || barB;
  const medianBase = medianOf(paired.map(p => p.base.days));
  const medianArmed = medianOf(paired.map(p => p.armed.days));
  const guardC = medianArmed >= 0.8 * medianBase;
  const starvBase = paired.reduce((t, p) => t + p.base.starvation, 0);
  const starvArmed = paired.reduce((t, p) => t + p.armed.starvation, 0);
  const guardD = starvArmed <= starvBase + 2;
  const instrumentsOk = jb.go && ja.go;
  const go = primary && guardC && guardD && instrumentsOk;
  let verdict = 'GO';
  let kind = 'GO';
  if (!go) {
    if (!jb.go || !ja.go) { kind = 'NO-GO INSTRUMENT'; verdict = 'NO-GO'; }
    else if (!jb.pool.pass) { kind = 'NO-GO THIN-POOL'; verdict = 'NO-GO'; }
    else if (!primary) { kind = 'NO-GO PRIMARY-MISS'; verdict = 'NO-GO'; }
    else if (!guardC || !guardD) { kind = 'NO-GO GUARD'; verdict = 'NO-GO'; }
    else { kind = 'NO-GO'; verdict = 'NO-GO'; }
  }
  const regressions = paired
    .filter(p => p.survivalDelta <= -30)
    .map(p => ({ seed: p.seed, delta: p.survivalDelta, baseDays: p.base.days, armedDays: p.armed.days }));
  return {
    verdict: kind, go,
    primary: { barA_national2: barA, nationalArmed, barB_realm4: barB, realmArmed, pass: primary },
    guards: { medianBase, medianArmed, ratio: medianBase ? +(medianArmed / medianBase).toFixed(3) : null, guardC,
      starvationBase: starvBase, starvationArmed: starvArmed, guardD },
    legs: { base: jb, armed: ja },
    instrumentsOk, regressions,
  };
}

function analyze(outdir, seeds) {
  const baseRows = [];
  const armedRows = [];
  const missing = [];
  for (const seed of seeds) {
    for (const leg of ['base', 'armed']) {
      const p = path.join(outdir, `s${seed}-${leg}.json`);
      if (!fs.existsSync(p)) { missing.push(seed + '-' + leg); continue; }
      const row = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (leg === 'base') baseRows.push(row); else armedRows.push(row);
    }
  }
  if (missing.length) return { error: `missing rows: ${missing.join(',')}`, rows: [], analyzed: [] };
  const paired = [];
  for (const b of baseRows) {
    const a = armedRows.find(r => r.seed === b.seed);
    if (a) paired.push(pairedRow(b, a));
  }
  const verdict = judgePaired(paired, baseRows, armedRows);
  // Pooled wall numbers per leg (scalerank wall shape, per leg).
  const wallFor = (rows) => {
    const an = rows.map(analyzeRow);
    const stageCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const x of an) stageCounts[x.mechanism.maxStage] = (stageCounts[x.mechanism.maxStage] || 0) + 1;
    let deathsTotal = 0, deathsNamed = 0;
    const byCause = {};
    for (const x of an) {
      if (!x.deaths) continue;
      deathsTotal += x.deaths.total;
      deathsNamed += x.deaths.named;
      for (const [k, v] of Object.entries(x.deaths.byCause || {})) byCause[k] = (byCause[k] || 0) + v;
    }
    return {
      seeds: an.length, wins: an.filter(x => x.won).length,
      national: an.filter(x => (x.maxRank === 'national' || x.maxRank === 'global')).length,
      regional: an.filter(x => (x.maxRank === 'regional' || x.maxRank === 'national' || x.maxRank === 'global')).length,
      table: an.filter(x => x.table).length,
      seated: an.filter(x => x.entered).length,
      medianSurvival: medianOf(an.map(x => x.days)),
      stageCounts,
      wave5BarSeeds: an.filter(x => x.finalCounts && (x.finalCounts.w5 | 0) >= 2).length,
      wave4BarSeeds: an.filter(x => x.finalCounts && (x.finalCounts.w4 | 0) >= 3).length,
      deathCauseShares: deathsTotal ? byCause : null,
      deathClassificationCompleteness: deathsTotal ? +(deathsNamed / deathsTotal).toFixed(4) : null,
      deathsTotal, deathsNamed,
    };
  };
  return { verdict, wall: { base: wallFor(baseRows), armed: wallFor(armedRows) }, paired, baseRows, armedRows };
}

function selftest() {
  let passed = 0, failed = 0;
  const fails = [];
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  // Reused scalerank functions still behave (smoke on the import).
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
  check('stage 0 via import', stageAt(mkSnap(10, {})) === 0);
  check('stage 1 via import', stageAt(mkSnap(60, { havenPolity: { shape: 'lead', primary: 'haven', villages: ['haven', 'a', 'b', 'c'], size: 4, led: true }, rank: 'regional', networkLive: true, networkLiveDay: 50 })) === 1);

  // maxSeasonedLead: peaks and holds.
  const leadRow = { snapshots: [
    mkSnap(10, { lead: { seasonedSubs: 0, subs: [], activeSubs: 1, need: 3 } }),
    mkSnap(50, { lead: { seasonedSubs: 2, subs: ['a', 'b'], activeSubs: 2, need: 3 } }),
    mkSnap(80, { lead: { seasonedSubs: 3, subs: ['a', 'b', 'c'], activeSubs: 3, need: 3 } }),
    mkSnap(90, { lead: { seasonedSubs: 3, subs: ['a', 'b', 'c'], activeSubs: 3, need: 3 } }),
    mkSnap(120, { lead: { seasonedSubs: 2, subs: ['a', 'b'], activeSubs: 3, need: 3 } }),
  ] };
  const ml = maxSeasonedLead(leadRow);
  check('maxSeasonedLead max 3', ml.max === 3, JSON.stringify(ml));
  check('maxSeasonedLead firstDay3 80', ml.firstDay3 === 80, JSON.stringify(ml));
  check('maxSeasonedLead heldDays3 2', ml.heldDays3 === 2, JSON.stringify(ml));
  check('maxSeasonedLead empty row 0', maxSeasonedLead({ snapshots: [] }).max === 0);

  // everLinks: shapes from rows.
  const linkRows = [
    { id: 'l1', kind: 'sub', other: 'emberhold', primary: 'haven', subordinate: 'emberhold', a: null, b: null, day: 10, age: 40, trust: 55, status: 'active', seasoned: true, conquered: false, arrears: 0 },
    { id: 'l2', kind: 'sub', other: 'stonebridge', primary: 'highcourt', subordinate: 'haven', a: null, b: null, day: 12, age: 38, trust: 45, status: 'active', seasoned: true, conquered: false, arrears: 0 },
    { id: 'l3', kind: 'covenant', other: 'millford', primary: null, subordinate: null, a: 'haven', b: 'millford', day: 20, age: 30, trust: 40, status: 'active', seasoned: true, conquered: false, arrears: 0 },
  ];
  const elRow = { snapshots: [mkSnap(50, { links: linkRows })] };
  const el = everLinks(elRow);
  check('everLinks total 3', el.total === 3, JSON.stringify(el));
  check('everLinks lead 1 belong 1 covenant 1', el.lead === 1 && el.belong === 1 && el.covenant === 1, JSON.stringify(el));
  // A link seen across snapshots counts once.
  const elRow2 = { snapshots: [mkSnap(50, { links: linkRows }), mkSnap(51, { links: linkRows })] };
  check('everLinks dedupes across days', everLinks(elRow2).total === 3);

  // driveFormed: reads the event log only.
  const dfRow = { linkdrive: { events: [
    { day: 60, kind: 'propose', village: 'emberhold', outcome: 'accepted' },
    { day: 61, kind: 'propose', village: 'stonebridge', outcome: 'counter' },
    { day: 62, kind: 'raise-answer', village: 'millford', outcome: 'linked' },
    { day: 63, kind: 'counter-answer', village: 'stonebridge', outcome: 'sweeten-formed' },
    { day: 64, kind: 'tend', village: 'emberhold', outcome: 'lead-below-bar' },
  ] } };
  const df = driveFormed(dfRow);
  check('driveFormed total 2', df.total === 2, JSON.stringify(df));
  check('driveFormed viaPropose 1 viaRaise 1', df.viaPropose === 1 && df.viaRaise === 1, JSON.stringify(df));
  check('driveFormed null without stats', driveFormed({}) === null);
  check('starvationDeaths reads byCause', starvationDeaths({ deaths: { summary: { byCause: { starvation: 3 } } } }) === 3);
  check('starvationDeaths 0 when absent', starvationDeaths({}) === 0);

  // judgePaired on fixtures: build minimal paired rows via pairedRow
  // on synthetic driver rows (mkRow mirrors the scalerank shape).
  const mkRow = (seed, leg, snaps, endScale, extra) => ({
    seed, leg, days: 150, gameDays: 150, endReason: 'horizon', won: false,
    maxRank: 'regional', finalRank: 'regional', table: true, entered: false, arcMax: 4,
    firstWaitingDay: 95, firstEnteredDay: null, waitingDays: 10,
    gateErrors: 0, scaleErrors: 0, linkErrors: 0, errors: [],
    markers: { firstRegionalDay: 50, firstNationalDay: null, firstPolityDay: null, firstBeatDay: null, firstLesserDay: 60, firstFullDay: null, firstOvertimeDay: null },
    end: { rank: 'regional', pop: 12, pantry: 10000, pantrySrc: 'pantryKcalLive', stage: 2, gate: snaps[snaps.length - 1].gate, seat: 'none', ladderPeak: 1, capstone: null, overtime: 0, scale: endScale },
    snapshots: snaps, deaths: { summary: { deaths: 0, byCause: {}, booksClose: true, unattributed: 0, rosteredDeaths: 0, guestDeaths: 0, joins: 0, leavers: 0 }, errors: [] },
    fireside: [], firesideCount: 0, tableLines: [], tableLinesCount: 0, scaleLines: [], scaleLinesCount: 0, captureCount: 0, error: null,
    linkdrive: (leg === 'armed') ? (extra && extra.linkdrive) || { events: [], errors: 0 } : null,
  });
  const mkPairRows = (realmSeeds) => {
    const pairs = [];
    const baseRows = [];
    const armedRows = [];
    for (let i = 0; i < 8; i++) {
      const seed = 113501 + i;
      const realm = realmSeeds.includes(seed);
      const lead3 = { seasonedSubs: 3, subs: ['a', 'b', 'c'], activeSubs: 3, need: 3 };
      const lead1 = { seasonedSubs: 1, subs: ['a'], activeSubs: 1, need: 3 };
      const oneLink = [{ id: 'l1', kind: 'sub', other: 'a', primary: 'haven', subordinate: 'a', a: null, b: null, day: 10, age: 70, trust: 55, status: 'active', seasoned: true, conquered: false, arrears: 0 }];
      const threeLinks = ['a', 'b', 'c'].map((o, j) => ({ id: 'l' + (j + 1), kind: 'sub', other: o, primary: 'haven', subordinate: o, a: null, b: null, day: 10 + j, age: 70, trust: 55, status: 'active', seasoned: true, conquered: false, arrears: 0 }));
      const bSnap = mkSnap(80, { rank: 'regional', networkLive: true, networkLiveDay: 50, lead: lead1, links: oneLink });
      const aSnap = mkSnap(80, { rank: 'regional', networkLive: true, networkLiveDay: 50, lead: realm ? lead3 : lead1, links: realm ? threeLinks : oneLink,
        havenPolity: realm ? { shape: 'lead', primary: 'haven', villages: ['haven', 'a', 'b', 'c'], size: 4, led: true } : null });
      const b = mkRow(seed, 'base', [bSnap], bSnap.scale);
      const a = mkRow(seed, 'armed', [aSnap], aSnap.scale, { linkdrive: { events: realm ? [
        { day: 60, kind: 'propose', village: 'b', outcome: 'accepted' },
        { day: 61, kind: 'propose', village: 'c', outcome: 'accepted' },
      ] : [], errors: 0 } });
      baseRows.push(b);
      armedRows.push(a);
      pairs.push(pairedRow(b, a));
    }
    return { pairs, baseRows, armedRows };
  };
  const goFixture = mkPairRows([113501, 113502, 113503, 113504]);
  const goPairs = goFixture.pairs;
  const goJudge = judgePaired(goPairs, goFixture.baseRows, goFixture.armedRows);
  check('judgePaired GO on 4/8 realm fixture', goJudge.verdict === 'GO' && goJudge.go === true, goJudge.verdict);
  check('judgePaired primary barB 4/8', goJudge.primary.barB_realm4 === true && goJudge.primary.realmArmed === 4, JSON.stringify(goJudge.primary));
  check('judgePaired guards pass on fixtures', goJudge.guards.guardC === true && goJudge.guards.guardD === true, JSON.stringify(goJudge.guards));
  // The fixture judge above is instrument-only scaffolding; the REAL
  // paired-bar checks use pairedRow outputs directly (no re-sim):
  check('pairedRow realm armed on 4/8 fixture seeds', goPairs.filter(p => p.leadRealmArmed).length === 4);
  check('pairedRow nationalArmed false on fixtures', goPairs.filter(p => p.nationalArmed).length === 0);
  check('pairedRow driveFormed counts proposes', goPairs[0].armed.driveFormed.total === 2);
  check('pairedRow survivalDelta 0 on fixtures', goPairs.every(p => p.survivalDelta === 0));
  const noFixture = mkPairRows([]);
  const noPairs = noFixture.pairs;
  const noJudge = judgePaired(noPairs, noFixture.baseRows, noFixture.armedRows);
  check('judgePaired NO-GO PRIMARY-MISS on 0/8 realm fixture', noJudge.verdict === 'NO-GO PRIMARY-MISS' && noJudge.go === false, noJudge.verdict);
  check('pairedRow realm armed 0/8 when no realm', noPairs.filter(p => p.leadRealmArmed).length === 0);
  check('pairedRow maxSeasonedLead base 1', noPairs[0].base.maxSeasonedLead === 1);

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
  const out = { verdict: res.verdict, wall: res.wall, paired: res.paired };
  console.log(JSON.stringify(out, null, 1));
  if (!res.verdict.go) { console.error('VERDICT: ' + res.verdict.verdict); process.exit(1); }
  console.log('VERDICT: ' + res.verdict.verdict);
}
if (require.main === module) main().catch(e => { console.error('ANALYZE FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { stageAt, recomputeCounts, closestLink, bindingInput, reconcileRow, analyzeRow, judge, maxSeasonedLead, everLinks, driveFormed, starvationDeaths, pairedRow, judgePaired, analyze };
