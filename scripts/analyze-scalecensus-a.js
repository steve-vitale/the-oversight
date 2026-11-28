#!/usr/bin/env node
// scripts/analyze-scalecensus-a.js — sim-scalecensus-a analyzer.
// Reads ONLY the per-seed JSONs the driver wrote (never re-sims,
// never recomputes the bars from anywhere but the snapshot's own
// gate counts). The binding-bar table, first-true days, and the
// §2 judge live here, not in the driver.
//
// Full-seat bars (table.js tableSeat + progression.js deedGateReady):
//   waves (w1>=5, w2>=5, w3>=4, w4>=3, w5>=2 distinct fought),
//   contests >= 3, crises >= 3, scale national/global,
//   stage >= 2, foodDeeds (sentimentTaught), ladderPeak >= 3,
//   capstone delivered.
// Lesser-seat bars (table.js):
//   w1>=4, w2>=4, w3>=3, contests >= 2, crises >= 2,
//   scale regional+, stage >= 2, foodDeeds, ladderPeak >= 1.
//
// Usage:
//   node scripts/analyze-scalecensus-a.js [--outdir <dir>] [--json]
//   node scripts/analyze-scalecensus-a.js --selftest
// Exit 0 on DIAG-GO, 1 on DIAG-NO-GO (or selftest failure).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-28', 'perseed-scalecensus-a-arm');
const SEEDS = (process.env.SEEDS || '113101,113102,113103,113104,113105,113106,113107,113108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

const FULL_BAR_NAMES = ['waves', 'contests', 'crises', 'scale', 'stageOk', 'foodDeeds', 'ladderPeak3', 'capstone'];
const LESSER_BAR_NAMES = ['w1_4', 'w2_4', 'w3_3', 'contests2', 'crises2', 'scaleRegional', 'stage2', 'foodDeeds', 'ladderPeak1'];

// fullBars(gate, ladderPeak, capstone): the full-seat bar booleans,
// recomputed from the gate's OWN counts (not trusted from its stored
// booleans — the reconciliation check compares the two).
function fullBars(gate, ladderPeak, capstone) {
  if (!gate) return null;
  const w1 = gate.w1 | 0, w2 = gate.w2 | 0, w3 = gate.w3 | 0, w4 = gate.w4 | 0, w5 = gate.w5 | 0;
  const waves = w1 >= 5 && w2 >= 5 && w3 >= 4 && w4 >= 3 && w5 >= 2;
  const contests = (gate.contestsN | 0) >= 3;
  const crises = (gate.crisesN | 0) >= 3;
  const rank = gate.rank || 'village';
  const scale = rank === 'national' || rank === 'global';
  const stageOk = (gate.stage | 0) >= 2;
  const foodDeeds = !!gate.foodDeeds;
  const ladderPeak3 = (ladderPeak | 0) >= 3;
  const cap = !!capstone;
  return { waves, contests, crises, scale, stageOk, foodDeeds, ladderPeak3, capstone: cap,
    ok: !!(waves && contests && crises && scale && stageOk && foodDeeds && ladderPeak3 && cap) };
}

function lesserBars(gate, ladderPeak) {
  if (!gate) return null;
  const rank = gate.rank || 'village';
  const out = {
    w1_4: (gate.w1 | 0) >= 4, w2_4: (gate.w2 | 0) >= 4, w3_3: (gate.w3 | 0) >= 3,
    contests2: (gate.contestsN | 0) >= 2, crises2: (gate.crisesN | 0) >= 2,
    scaleRegional: rank === 'regional' || rank === 'national' || rank === 'global',
    stage2: (gate.stage | 0) >= 2, foodDeeds: !!gate.foodDeeds,
    ladderPeak1: (ladderPeak | 0) >= 1,
  };
  out.ok = Object.values(out).every(Boolean);
  return out;
}

// bindingBars: full-seat bars unmet at this snapshot (the finding).
function bindingBars(gate, ladderPeak, capstone) {
  const fb = fullBars(gate, ladderPeak, capstone);
  if (!fb) return null;
  return FULL_BAR_NAMES.filter(n => !fb[n]);
}

function lesserUnmet(gate, ladderPeak) {
  const lb = lesserBars(gate, ladderPeak);
  if (!lb) return null;
  return LESSER_BAR_NAMES.filter(n => !lb[n]);
}

// firstTrueDays(snapshots): first day each bar reads true (null = never).
function firstTrueDays(snapshots) {
  const out = { full: {}, lesser: {} };
  for (const n of FULL_BAR_NAMES) out.full[n] = null;
  for (const n of LESSER_BAR_NAMES) out.lesser[n] = null;
  for (const s of snapshots || []) {
    if (!s.gate) continue;
    const fb = fullBars(s.gate, s.ladderPeak, s.capstone);
    const lb = lesserBars(s.gate, s.ladderPeak);
    for (const n of FULL_BAR_NAMES) if (out.full[n] === null && fb[n]) out.full[n] = s.day;
    for (const n of LESSER_BAR_NAMES) if (out.lesser[n] === null && lb[n]) out.lesser[n] = s.day;
  }
  return out;
}

// reconcileRow(row): the analyzer's end bar table vs the last
// snapshot's stored gate booleans. Returns mismatch strings.
function reconcileRow(row) {
  const mismatches = [];
  const snaps = row.snapshots || [];
  const last = snaps.length ? snaps[snaps.length - 1] : null;
  if (!last) { mismatches.push('no-snapshots'); return mismatches; }
  if (!last.gate) { mismatches.push('last-snapshot-gate-null'); return mismatches; }
  const g = last.gate;
  const fb = fullBars(g, last.ladderPeak, last.capstone);
  // Stored booleans vs recomputed-from-counts booleans (deed half only).
  const pairs = [['waves', fb.waves], ['contests', fb.contests], ['crises', fb.crises],
    ['scale', fb.scale], ['stageOk', fb.stageOk], ['foodDeeds', fb.foodDeeds]];
  for (const [name, recomputed] of pairs) {
    if (!!g[name] !== !!recomputed) mismatches.push(`${name}: stored=${!!g[name]} recomputed=${!!recomputed}`);
  }
  // deedGateReady().ok is the DEED half only (ladder peak + capstone
  // live in tableSeat, not in the gate) — compare against the deed
  // half, never against the full-seat ok.
  const deedHalfOk = !!(fb.waves && fb.contests && fb.crises && fb.scale && fb.stageOk && fb.foodDeeds);
  if (!!g.ok !== deedHalfOk) mismatches.push(`gate.ok: stored=${!!g.ok} recomputed-deedhalf=${deedHalfOk}`);
  // The row's end.gate must be the last snapshot's gate.
  const eg = row.end && row.end.gate;
  if (!eg) mismatches.push('row.end.gate-null');
  else if (JSON.stringify(eg) !== JSON.stringify(g)) mismatches.push('row.end.gate != last-snapshot-gate');
  if (row.end && row.end.seat !== last.seat) mismatches.push(`row.end.seat=${row.end.seat} != last-snapshot-seat=${last.seat}`);
  return mismatches;
}

function analyzeRow(row) {
  const snaps = row.snapshots || [];
  const last = snaps.length ? snaps[snaps.length - 1] : (row.end || {});
  const gate = (last && last.gate) || (row.end && row.end.gate) || null;
  const ladderPeak = (last && typeof last.ladderPeak === 'number') ? last.ladderPeak : ((row.end && row.end.ladderPeak) || 0);
  const capstone = (last && last.capstone) || (row.end && row.end.capstone) || null;
  const aliveDay80 = snaps.some(s => (s.day | 0) >= 80);
  const ft = firstTrueDays(snaps);
  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays, endReason: row.endReason,
    won: !!row.won, maxRank: row.maxRank, finalRank: row.finalRank,
    table: !!row.table, entered: !!row.entered, arcMax: row.arcMax,
    aliveDay80,
    finalSeat: (row.end && row.end.seat) || 'none',
    finalGateOk: gate ? !!gate.ok : null,
    finalCounts: gate ? { w1: gate.w1, w2: gate.w2, w3: gate.w3, w4: gate.w4, w5: gate.w5, contestsN: gate.contestsN, crisesN: gate.crisesN, rank: gate.rank, stage: gate.stage, foodDeeds: !!gate.foodDeeds } : null,
    finalLadderPeak: ladderPeak, finalCapstone: capstone,
    bindingBars: bindingBars(gate, ladderPeak, capstone),
    lesserUnmet: lesserUnmet(gate, ladderPeak),
    firstTrue: ft,
    firstRegionalDay: (row.markers && row.markers.firstRegionalDay) ?? null,
    firstNationalDay: (row.markers && row.markers.firstNationalDay) ?? null,
    firstWaitingDay: row.firstWaitingDay ?? null,
    firstEnteredDay: row.firstEnteredDay ?? null,
    waitingDays: row.waitingDays || 0,
    overtimeEnd: (last && typeof last.overtime === 'number') ? last.overtime : null,
    popEnd: (row.end && typeof row.end.pop === 'number') ? row.end.pop : null,
    popMax: snaps.reduce((m, s) => Math.max(m, (typeof s.pop === 'number') ? s.pop : 0), 0),
    gateErrors: row.gateErrors || 0,
    firesideCount: row.firesideCount || 0,
    tableLinesCount: row.tableLinesCount || 0,
    reconciliation: reconcileRow(row),
  };
}

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function judge(analyzed, rows) {
  // Prereg §2 bars.
  const poolAlive80 = analyzed.filter(a => a.aliveDay80).length;
  const poolFloor = poolAlive80 >= 6;
  const totalSnaps = rows.reduce((n, r) => n + ((r.snapshots || []).length), 0);
  const gatedSnaps = rows.reduce((n, r) => n + ((r.snapshots || []).filter(s => s.gate).length), 0);
  const coverage = totalSnaps ? gatedSnaps / totalSnaps : 0;
  const coverageOk = coverage >= 0.95;
  const mismatches = analyzed.reduce((n, a) => n + a.reconciliation.length, 0);
  const reconciliationOk = mismatches === 0;
  const instrumentErrors = rows.reduce((n, r) => n + ((r.errors || []).length) + (r.gateErrors || 0), 0);
  const instrumentOk = instrumentErrors === 0;
  const sniffTable = analyzed.some(a => a.table);
  const sniffRegional = analyzed.some(a => (a.maxRank === 'regional' || a.maxRank === 'national' || a.maxRank === 'global'));
  const sniffOk = sniffTable && sniffRegional;
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
    coverage: { gated: gatedSnaps, total: totalSnaps, ratio: totalSnaps ? +(gatedSnaps / totalSnaps).toFixed(4) : 0, pass: coverageOk },
    reconciliation: { mismatches, pass: reconciliationOk },
    instrument: { errors: instrumentErrors, pass: instrumentOk },
    sniff: { tableWaitingAny: sniffTable, regionalAny: sniffRegional, pass: sniffOk },
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
  // Pooled finding: which bars bind, on how many seeds.
  const bindFreq = {};
  for (const n of FULL_BAR_NAMES) bindFreq[n] = analyzed.filter(a => (a.bindingBars || []).includes(n)).length;
  const lesserFreq = {};
  for (const n of LESSER_BAR_NAMES) lesserFreq[n] = analyzed.filter(a => (a.lesserUnmet || []).includes(n)).length;
  const seated = analyzed.filter(a => a.entered).length;
  const national = analyzed.filter(a => (a.maxRank === 'national' || a.maxRank === 'global')).length;
  const regional = analyzed.filter(a => (a.maxRank === 'regional' || a.maxRank === 'national' || a.maxRank === 'global')).length;
  const firstNationalDays = analyzed.map(a => a.firstNationalDay).filter(d => d !== null && d !== undefined);
  const wall = {
    seeds: analyzed.length, wins: analyzed.filter(a => a.won).length,
    national, regional, table: analyzed.filter(a => a.table).length,
    seated, entered: seated,
    medianSurvival: medianOf(analyzed.map(a => a.days)),
    medianFirstNationalDay: medianOf(firstNationalDays),
    bindingBarFrequency: bindFreq, lesserUnmetFrequency: lesserFreq,
    deathCauseShares: null, // NOT instrumented by this driver — reported null, never faked.
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
  // Fixture gates (synthetic snapshot gates, clearly fixtures).
  const allMet = { ok: true, waves: true, contests: true, crises: true, scale: true, stageOk: true, foodDeeds: true, stage: 3, w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contestsN: 3, crisesN: 3, rank: 'national' };
  const scaleMissing = Object.assign({}, allMet, { ok: false, scale: false, rank: 'regional' });
  const wavesMissing = Object.assign({}, allMet, { ok: false, waves: false, w4: 1, w5: 0 });
  const foodMissing = Object.assign({}, allMet, { ok: false, foodDeeds: false });
  const early = { ok: false, waves: false, contests: false, crises: false, scale: false, stageOk: false, foodDeeds: false, stage: 1, w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, contestsN: 0, crisesN: 0, rank: 'village' };

  check('all-met full bars ok', fullBars(allMet, 3, 'feast_embassy').ok === true);
  check('all-met binding empty', bindingBars(allMet, 3, 'feast_embassy').length === 0);
  check('scale-missing binds scale only (deed half ok)', JSON.stringify(bindingBars(scaleMissing, 3, 'feast_embassy')) === JSON.stringify(['scale']));
  check('waves-missing binds waves', bindingBars(wavesMissing, 3, 'feast_embassy').includes('waves'));
  check('food-missing binds foodDeeds', bindingBars(foodMissing, 3, 'feast_embassy').includes('foodDeeds'));
  check('ladderPeak<3 binds ladderPeak3', bindingBars(allMet, 2, 'feast_embassy').includes('ladderPeak3'));
  check('no capstone binds capstone', bindingBars(allMet, 3, null).includes('capstone'));
  check('early binds everything', bindingBars(early, 0, null).length === FULL_BAR_NAMES.length);
  check('lesser all-met', lesserBars(allMet, 1).ok === true);
  check('lesser scale-missing still ok (regional counts)', lesserBars(scaleMissing, 1).ok === true);
  check('lesser early unmet', lesserUnmet(early, 0).length === LESSER_BAR_NAMES.length);
  check('lesser ladderPeak<1 binds ladderPeak1', lesserUnmet(allMet, 0).includes('ladderPeak1'));

  // firstTrueDays on a synthetic series.
  const series = [
    { day: 80, gate: early, ladderPeak: 0, capstone: null, seat: 'none' },
    { day: 90, gate: Object.assign({}, early, { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, stage: 2, foodDeeds: true, rank: 'regional', contests: false, crises: false, waves: false, scale: false, stageOk: true }), ladderPeak: 1, capstone: null, seat: 'lesser' },
    { day: 120, gate: allMet, ladderPeak: 3, capstone: 'feast_embassy', seat: 'full' },
  ];
  const ft = firstTrueDays(series);
  check('firstTrue lesser w1_4 = 90', ft.lesser.w1_4 === 90);
  check('firstTrue full waves = 120', ft.full.waves === 120);
  check('firstTrue full capstone = 120', ft.full.capstone === 120);
  check('firstTrue lesser scaleRegional = 90', ft.lesser.scaleRegional === 90);
  check('firstTrue full scale never before 120', ft.full.scale === 120);

  // Judge shapes.
  const mkRow = (seed, alive80, gateOk) => ({
    seed, days: alive80 ? 150 : 40, gameDays: alive80 ? 150 : 40, endReason: alive80 ? 'horizon' : 'village-dead',
    won: false, maxRank: 'regional', finalRank: 'regional', table: true, entered: false, arcMax: 4,
    firstWaitingDay: 95, firstEnteredDay: null, waitingDays: 10, gateErrors: 0, errors: [],
    markers: { firstRegionalDay: 60, firstNationalDay: null, firstLesserDay: null, firstFullDay: null, firstOvertimeDay: null },
    end: { rank: 'regional', pop: 12, pantry: 10000, pantrySrc: 'pantryKcalLive', stage: 2, gate: allMet, seat: gateOk ? 'lesser' : 'none', ladderPeak: 1, capstone: null, overtime: 0 },
    snapshots: [{ day: alive80 ? 80 : 40, rank: 'regional', arc: 4, tableWaiting: true, tableDone: false, tableAnnounced: true, stage: 2, pop: 12, pantry: 10000, pantrySrc: 'pantryKcalLive', waitingDays: 1, gate: allMet, gateError: null, seat: 'lesser', ladderPeak: 1, capstone: null, overtime: 0 }],
    fireside: [], firesideCount: 0, tableLines: [], tableLinesCount: 0, captureCount: 0, error: null,
  });
  const goodRows = SEEDS.map(s => mkRow(s, true, true));
  // Build the judge input directly (analyzeRow + judge are the units).
  const analyzedGood = goodRows.map(analyzeRow);
  const jGood = judge(analyzedGood, goodRows);
  check('judge GO on clean corpus', jGood.verdict === 'DIAG-GO', jGood.verdict);
  const thinRows = SEEDS.map((s, i) => mkRow(s, i < 2, true));
  const jThin = judge(thinRows.map(analyzeRow), thinRows);
  check('judge THIN-POOL when <6 alive day 80', jThin.verdict === 'DIAG-NO-GO THIN-POOL', jThin.verdict);
  const badRows = goodRows.map(r => {
    const c = JSON.parse(JSON.stringify(r));
    c.snapshots[0].gateError = 'deedGateReady-threw: boom';
    c.snapshots[0].gate = null;
    c.gateErrors = 1;
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
module.exports = { fullBars, lesserBars, bindingBars, lesserUnmet, firstTrueDays, reconcileRow, analyzeRow, judge, analyze, FULL_BAR_NAMES, LESSER_BAR_NAMES };
