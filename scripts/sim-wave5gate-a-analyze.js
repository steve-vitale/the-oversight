#!/usr/bin/env node
// scripts/sim-wave5gate-a-analyze.js — binding-gate analysis for the
// wave-5 absence (scale-onramp axis, 2026-10-26, arm sim-wave5gate-a).
// DIAG/MEASUREMENT ONLY, zero src/js changes.
//
// Reads three corpora (all under evidence/2026-10-26/):
//   gate:       perseed-sim-wave5gate-a/s<seed>-wave5gate.json (this arm)
//   rebaseline: perseed-sim-wave5gate-a-rebaseline/s<seed>-rebaseline.json
//               (scripts/test-rebaseline-sweep.js, verbatim)
//   tablenat:   perseed-sim-tablenat-a/s<seed>-rebaseline.json (1715Z band)
// and prints: (1) rebaseline-vs-1715Z field diffs, (2) gate-vs-rebaseline
// trajectory diffs, (3) per-seed binding gates at closest-approach day,
// (4) the full-seat secondary table, (5) the GO/NO-GO verdict.
//
// Gate classes and closest-approach day are exactly as pre-registered in
// evidence/2026-10-26/sim-wave5gate-a.md. Exit 1 only on corpus
// incompleteness or instrument faults (failed endChecks, gate-vs-
// rebaseline trajectory mismatch); a rebaseline-vs-1715Z drift is a
// LOUD finding, not an exit-1 — the pre-registration says to report it
// before judging anything, not to fail the instrument on it.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const TRAJ_FIELDS = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'finalPop', 'finalPantry'];
const REPRO_FIELDS = TRAJ_FIELDS.concat(['starvationDeaths']);

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function fieldDiffs(a, b, fields) {
  const diffs = [];
  for (const f of fields) {
    const av = (f === 'ts') ? JSON.stringify(a.ts || {}) : a[f];
    const bv = (f === 'ts') ? JSON.stringify(b.ts || {}) : b[f];
    if (JSON.stringify(av) !== JSON.stringify(bv)) diffs.push({ field: f, a: av, b: bv });
  }
  return diffs;
}
function medianOf(arr) { const s = arr.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }

// Failing gate classes on one snapshot, given whether wave 4 was ever
// unlocked in the run (FACED4 counts only then — otherwise it is
// downstream of standing/readiness, not an independent failure).
// Each class is evaluated by its OWN pre-registered condition — NOT an
// elif chain: a co-present hold is a real second blocker (removing the
// raw shortfall alone still leaves the hold at 99/199, and removing the
// hold alone still leaves the raw shortfall). The first analyzer version
// used an elif chain (RAW masking DEF4) and misclassified the two
// defer4 seeds as single-RAW; this is the pre-registered definition
// applied literally. Holds come from the sweep's gated computation, so
// peak-ratchet grandfathering is already honored (a released wave's
// hold does not re-appear).
function failingClasses(snap, w4EverUnlocked) {
  const fail = [];
  if (!snap.w3rung) fail.push('W3RUNG');
  const raw = (snap.standing && snap.standing.total) | 0;
  const capped = snap.capped | 0;
  const holds = (snap.holds || []).map(h => h.kind);
  if (raw < (snap.t5 | 0)) fail.push('STANDING-RAW');
  if (raw >= (snap.t5 | 0) && capped < (snap.t5 | 0)) fail.push('PLENTY-CAP');
  if (holds.indexOf('defer4') >= 0) fail.push('READINESS-DEF4');
  if (holds.indexOf('defer5') >= 0) fail.push('READINESS-DEF5');
  if (((snap.faced && snap.faced[4]) | 0) === 0 && w4EverUnlocked) fail.push('FACED4');
  if (!fail.length && (snap.gated | 0) < (snap.t5 | 0)) fail.push('STANDING-UNCLASSIFIED');
  return fail;
}

function analyze(opts) {
  opts = opts || {};
  const gateDir = opts.gateDir || path.join(EVID, 'perseed-sim-wave5gate-a');
  const reDir = opts.reDir || path.join(EVID, 'perseed-sim-wave5gate-a-rebaseline');
  const tabDir = opts.tabDir || path.join(EVID, 'perseed-sim-tablenat-a');
  const out = { seeds: [], corpusOk: true, corpusErrors: [], reproDiffs: {}, trajDiffs: {}, endCheckFails: [], band: null, gateDist: {}, singleGateCount: 0, compoundCount: 0, verdict: null, fullSeat: [] };
  const gateRows = {}, reRows = {}, tabRows = {};
  for (const seed of SEEDS) {
    try { gateRows[seed] = load(path.join(gateDir, `s${seed}-wave5gate.json`)); }
    catch (e) { out.corpusOk = false; out.corpusErrors.push(`gate s${seed} missing/unreadable`); }
    try { reRows[seed] = load(path.join(reDir, `s${seed}-rebaseline.json`)); }
    catch (e) { out.corpusOk = false; out.corpusErrors.push(`rebaseline s${seed} missing/unreadable`); }
    try { tabRows[seed] = load(path.join(tabDir, `s${seed}-rebaseline.json`)); }
    catch (e) { out.corpusOk = false; out.corpusErrors.push(`tablenat s${seed} missing/unreadable`); }
  }
  if (!out.corpusOk) return out;
  for (const seed of SEEDS) {
    const repro = fieldDiffs(reRows[seed], tabRows[seed], REPRO_FIELDS.concat(['ts']));
    out.reproDiffs[seed] = repro;
    const traj = fieldDiffs(gateRows[seed], reRows[seed], TRAJ_FIELDS.concat(['ts']));
    out.trajDiffs[seed] = traj;
    const ec = gateRows[seed].endChecks || {};
    for (const k of Object.keys(ec)) if (!ec[k]) out.endCheckFails.push(`s${seed}.${k}`);
  }
  // Band aggregates from the verbatim rebaseline rows (the comparison of record).
  const reList = SEEDS.map(s => reRows[s]);
  out.band = {
    n: reList.length,
    won: reList.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(reList.map(r => r.days)),
    maxDays: Math.max.apply(null, reList.map(r => r.days)),
    nationalEver: reList.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: reList.reduce((t, r) => t + r.nationalFinal, 0),
    table: reList.reduce((t, r) => t + r.table, 0),
    entered: reList.reduce((t, r) => t + r.entered, 0),
    wave3: reList.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: reList.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: reList.filter(r => (r.waveReach || 1) >= 5).length,
    deaths: reList.reduce((t, r) => t + r.deathTotal, 0),
    starvation: reList.reduce((t, r) => t + r.starvationDeaths, 0),
  };
  for (const seed of SEEDS) {
    const row = gateRows[seed];
    const snaps = row.snaps || [];
    const w4EverUnlocked = snaps.some(s => (s.computedWave | 0) >= 4);
    const w4EverFaced = snaps.some(s => ((s.faced && s.faced[4]) | 0) > 0);
    // Closest-approach day: max score, then gated, then faced4, then earliest.
    let best = null, bestScore = -1;
    for (const s of snaps) {
      const score = (s.w3rung ? 1 : 0) + (((s.gated | 0) >= (s.t5 | 0)) ? 1 : 0) + ((((s.faced && s.faced[4]) | 0) > 0) ? 1 : 0);
      if (!best || score > bestScore
        || (score === bestScore && (s.gated | 0) > (best.gated | 0))
        || (score === bestScore && (s.gated | 0) === (best.gated | 0) && ((s.faced && s.faced[4]) | 0) > ((best.faced && best.faced[4]) | 0))
        || (score === bestScore && (s.gated | 0) === (best.gated | 0) && ((s.faced && s.faced[4]) | 0) === ((best.faced && best.faced[4]) | 0) && (s.day | 0) < (best.day | 0))) {
        best = s; bestScore = score;
      }
    }
    const fail = best ? failingClasses(best, w4EverUnlocked) : ['NO-SNAPSHOTS'];
    const endFail = row.endSnap ? failingClasses(row.endSnap, w4EverUnlocked) : ['NO-ENDSNAP'];
    const peakGated = Math.max.apply(null, snaps.map(s => s.gated | 0).concat([0]));
    const peakRaw = Math.max.apply(null, snaps.map(s => (s.standing && s.standing.total) | 0).concat([0]));
    const peakCapped = Math.max.apply(null, snaps.map(s => s.capped | 0).concat([0]));
    const peakRd5 = { armored: 0, armed: 0, tricks: 0, veterans: 0 };
    for (const s of snaps) {
      if (!s.rd5) continue;
      peakRd5.armored = Math.max(peakRd5.armored, s.rd5.armored | 0);
      peakRd5.armed = Math.max(peakRd5.armed, s.rd5.armed | 0);
      peakRd5.tricks = Math.max(peakRd5.tricks, s.rd5.tricks | 0);
      peakRd5.veterans = Math.max(peakRd5.veterans, s.rd5.veterans | 0);
    }
    const firstW4 = snaps.find(s => (s.computedWave | 0) >= 4);
    const firstFaced4 = snaps.find(s => ((s.faced && s.faced[4]) | 0) > 0);
    const daysGated200 = snaps.filter(s => (s.gated | 0) >= (s.t5 | 0)).length;
    const daysRd5Ready = snaps.filter(s => s.rd5 && s.rd5.ready).length;
    const daysRd4Ready = snaps.filter(s => s.rd4 && s.rd4.ready).length;
    const daysStandingOkFacedMissing = snaps.filter(s => s.w3rung && (s.gated | 0) >= (s.t5 | 0) && (((s.faced && s.faced[4]) | 0) === 0)).length;
    const single = fail.length === 1;
    if (single) out.gateDist[fail[0]] = (out.gateDist[fail[0]] || 0) + 1;
    else out.compoundCount++;
    if (single) out.singleGateCount++;
    const rd5end = (row.endSnap && row.endSnap.rd5) || null;
    const rd4end = (row.endSnap && row.endSnap.rd4) || null;
    out.seeds.push({
      seed, days: row.days, endReason: row.endReason, won: row.won, waveReach: row.waveReach,
      closestDay: best ? best.day : null, closestScore: bestScore,
      closestGated: best ? best.gated : null, closestRaw: best && best.standing ? best.standing.total : null,
      closestCapped: best ? best.capped : null, closestFaced4: best && best.faced ? best.faced[4] : null,
      closestRd5short: best && best.rd5 ? best.rd5.short : null, closestRd4short: best && best.rd4 ? best.rd4.short : null,
      closestHolds: best ? best.holds : null,
      failing: fail, single, endFail,
      w4EverUnlocked, w4EverFaced, firstW4day: firstW4 ? firstW4.day : null, firstFaced4day: firstFaced4 ? firstFaced4.day : null,
      peakGated, peakRaw, peakCapped, peakRd5,
      daysGated200, daysRd5Ready, daysRd4Ready, daysStandingOkFacedMissing,
      endGated: row.endSnap ? row.endSnap.gated : null,
      endStanding: row.endSnap && row.endSnap.standing ? row.endSnap.standing : null,
      endCapped: row.endSnap ? row.endSnap.capped : null,
      endRd5: rd5end, endRd4: rd4end,
      endFaced: row.endSnap ? row.endSnap.faced : null,
      endRealTotal: row.endReal ? row.endReal.villageStandingTotal : null,
      endRealWave: row.endReal ? row.endReal.unlockedWave : null,
      w4plusKillers: row.w4plusKillers || [], countersKnown: row.countersKnown || 0,
      holdLines: (row.holdLines || []).length,
    });
    // Secondary: full-seat decomposition at end-of-run (reported, not judged).
    const full = row.endReal ? row.endReal.deedGateReady : null;
    const seat = row.endReal ? row.endReal.tableSeat : null;
    if (full && seat) {
      const shortBars = [];
      if (!full.waves) shortBars.push(`waves ${full.w1}/${full.w2}/${full.w3}/${full.w4}/${full.w5} vs 5/5/4/3/2`);
      if (!full.contests) shortBars.push(`contests ${full.contestsN} vs 3`);
      if (!full.crises) shortBars.push(`crises ${full.crisesN} vs 3`);
      if (!full.stageOk) shortBars.push(`stage ${full.stage} vs 2`);
      if (!full.foodDeeds) shortBars.push('foodDeeds missing');
      out.fullSeat.push({ seed, seat: seat.seat, seatDetail: seat.detail || {}, fullOk: !!full.ok, fullWaves: [full.w1, full.w2, full.w3, full.w4, full.w5], fullContestsN: full.contestsN, fullCrisesN: full.crisesN, fullStage: full.stage, fullFoodDeeds: !!full.foodDeeds, fullRank: full.rank, shortBars });
    } else {
      out.fullSeat.push({ seed, seat: null, shortBars: ['NO-ENDREAL'] });
    }
  }
  // GO iff one class alone blocks on >= 6/8 seeds.
  let topClass = null, topCount = 0;
  for (const k of Object.keys(out.gateDist)) if (out.gateDist[k] > topCount) { topClass = k; topCount = out.gateDist[k]; }
  out.verdict = (topClass && topCount >= 6)
    ? { verdict: 'DIAG-GO', gateClass: topClass, count: topCount }
    : { verdict: 'DIAG-NO-GO', gateClass: null, count: topCount, distribution: Object.assign({}, out.gateDist), compound: out.compoundCount };
  return out;
}

function print(out) {
  console.log('=== sim-wave5gate-a analysis ===');
  console.log(`corpus: ${out.corpusOk ? 'COMPLETE' : 'INCOMPLETE: ' + out.corpusErrors.join('; ')}`);
  if (out.band) {
    const b = out.band;
    console.log(`band (verbatim rebaseline): n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave3=${b.wave3} wave4=${b.wave4} wave5=${b.wave5} deaths=${b.deaths} starv=${b.starvation}`);
  }
  console.log('-- rebaseline vs 1715Z (tablenat) field diffs --');
  for (const seed of SEEDS) {
    const d = out.reproDiffs[seed] || [];
    console.log(`  s${seed}: ${d.length ? d.map(x => `${x.field} ${JSON.stringify(x.a)}->${JSON.stringify(x.b)}`).join('; ') : 'IDENTICAL'}`);
  }
  console.log('-- gate corpus vs verbatim rebaseline trajectory diffs --');
  for (const seed of SEEDS) {
    const d = out.trajDiffs[seed] || [];
    console.log(`  s${seed}: ${d.length ? d.map(x => `${x.field} ${JSON.stringify(x.a)}->${JSON.stringify(x.b)}`).join('; ') : 'IDENTICAL'}`);
  }
  console.log(`-- endChecks failures: ${out.endCheckFails.length ? out.endCheckFails.join(', ') : 'none'} --`);
  console.log('-- per-seed binding gate (closest-approach day) --');
  for (const s of out.seeds) {
    console.log(`  s${s.seed} ${s.days}d ${s.endReason} wave=${s.waveReach} closest d${s.closestDay} score=${s.closestScore}/3 gated=${s.closestGated} raw=${s.closestRaw} capped=${s.closestCapped} faced4=${s.closestFaced4} holds=${JSON.stringify(s.closestHolds)} rd5short=${JSON.stringify(s.closestRd5short)} -> ${s.single ? 'SINGLE ' + s.failing[0] : 'COMPOUND ' + s.failing.join('+')} | endFail=${s.endFail.join('+')} peakGated=${s.peakGated} peakRd5=${JSON.stringify(s.peakRd5)} w4unlock=${s.w4EverUnlocked ? 'd' + s.firstW4day : 'never'} faced4=${s.w4EverFaced ? 'd' + s.firstFaced4day : 'never'} daysGated200=${s.daysGated200} daysStandOkFacedMissing=${s.daysStandingOkFacedMissing}`);
  }
  console.log('-- full-seat secondary (end-of-run, reported not judged) --');
  for (const f of out.fullSeat) {
    console.log(`  s${f.seed} seat=${f.seat} fullOk=${f.fullOk} waves=${(f.fullWaves || []).join('/')} contests=${f.fullContestsN} crises=${f.fullCrisesN} stage=${f.fullStage} food=${f.fullFoodDeeds} rank=${f.fullRank} short=[${(f.shortBars || []).join('; ')}]`);
  }
  console.log(`-- verdict: ${out.verdict.verdict}${out.verdict.gateClass ? ' gate=' + out.verdict.gateClass + ' n=' + out.verdict.count : ' dist=' + JSON.stringify(out.verdict.distribution) + ' compound=' + out.verdict.compound} --`);
}

async function main() {
  const out = analyze({});
  print(out);
  if (!out.corpusOk || out.endCheckFails.length) { console.error('ANALYZER GATE FAILURE'); process.exit(1); }
  for (const seed of SEEDS) if ((out.trajDiffs[seed] || []).length) { console.error(`ANALYZER GATE FAILURE: gate-vs-rebaseline trajectory diff s${seed}`); process.exit(1); }
}
if (require.main === module) main().catch(e => { console.error('WAVE5GATE ANALYZE FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { analyze, print, failingClasses, SEEDS };
