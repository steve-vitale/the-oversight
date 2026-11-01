#!/usr/bin/env node
// scripts/fullseat-recheck-a-analyze.js — independent re-derivation of
// the sim-fullseat-recheck-a census from the judged corpus (NOT from
// the sweep's printed verdict or summary.json). DIAG instrument only:
// reads evidence JSONs, prints the per-seed table + aggregates + gate
// checks, exits 1 on any gate failure.
//
// Pure functions (rankBlockers, classifyRow, medianOf) are exported
// for scripts/test-fullseat-recheck-a.js unit checks; the corpus legs
// below re-derive every headline number from the per-seed rows.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const COMP_ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage', 'foodDeeds'];

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function classifyRow(r) {
  if (!r.endSnap || !r.endSnap.dist) return 'UNCLASSIFIED:no-endSnap-dist';
  if (['none', 'lesser', 'full'].indexOf(r.endSnap.seat) < 0) return 'UNCLASSIFIED:bad-seat:' + String(r.endSnap.seat);
  if (!Array.isArray(r.endSnap.binding)) return 'UNCLASSIFIED:null-binding';
  return 'classified';
}

function rankBlockers(rows) {
  const blockCount = {}, endDistLists = {}, maxDistLists = {};
  for (const k of COMP_ORDER) { blockCount[k] = 0; endDistLists[k] = []; maxDistLists[k] = []; }
  for (const r of rows) {
    if (r.endSnap) {
      for (const k of COMP_ORDER) endDistLists[k].push(r.endSnap.dist[k] | 0);
      for (const k of (r.endSnap.binding || [])) if (k in blockCount) blockCount[k]++;
    }
    if (r.diag && r.diag.maxDist) for (const k of COMP_ORDER) maxDistLists[k].push(r.diag.maxDist[k] | 0);
  }
  const medianEndDist = {}, medianMaxDist = {};
  for (const k of COMP_ORDER) {
    medianEndDist[k] = medianOf(endDistLists[k]);
    medianMaxDist[k] = maxDistLists[k].length ? medianOf(maxDistLists[k]) : null;
  }
  return COMP_ORDER.map(k => ({ component: k, seedsBlocked: blockCount[k], medianEndDist: medianEndDist[k], medianMaxDist: medianMaxDist[k] }))
    .sort((a, b) => (b.seedsBlocked - a.seedsBlocked) || (b.medianEndDist - a.medianEndDist));
}

function loadRows(evidDir) {
  const rows = [];
  for (const fn of fs.readdirSync(evidDir).sort()) {
    if (!/^s[0-9]+-(baseline|armed)\.json$/.test(fn)) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8')));
  }
  return rows;
}

function analyze(evidDir) {
  const rows = loadRows(evidDir);
  const armed = rows.filter(r => r.policy === 'armed');
  const baseline = rows.filter(r => r.policy === 'baseline');
  const seeds = [...new Set(rows.map(r => r.seed))].sort((a, b) => a - b);
  // Gates.
  const g2 = seeds.map(seed => {
    const c = baseline.find(r => r.seed === seed);
    const a = armed.find(r => r.seed === seed);
    return { seed, ok: !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths };
  });
  const g2Pass = g2.every(x => x.ok);
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endSnap && r.endSnap.dist)
    && armed.length === seeds.length && armed.every(r => r.diag && r.diag.days > 0 && r.vet && !r.vet.error
      && (r.diag.errs | 0) === 0 && (r.vet.errs | 0) === 0);
  const classifications = armed.map(r => ({ seed: r.seed, cls: classifyRow(r) }));
  const unclassified = classifications.filter(x => x.cls.indexOf('UNCLASSIFIED') === 0);
  const vetPresent = armed.every(r => r.vet && !r.vet.error && r.vet.endVet4n != null && r.vet.endVet5n != null
    && r.vet.maxVet4 != null && r.vet.maxVet5 != null);
  const w5Present = armed.every(r => r.vet && !r.vet.error && r.vet.w5killCount != null
    && r.endSnapFull && r.endSnapFull.w5 != null && r.diag && r.diag.max && r.diag.max.w5 != null);
  const armedEndSnaps = armed.every(r => r.endSnap && r.endSnap.dist);
  const armedWinSnaps = armed.filter(r => r.won === 1).every(r => r.winSnap && r.winSnap.dist);
  // Wall numbers (armed).
  const wall = {
    n: armed.length,
    won: armed.reduce((t, r) => t + r.won, 0),
    nationalEver: armed.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: armed.reduce((t, r) => t + r.nationalFinal, 0),
    table: armed.reduce((t, r) => t + r.table, 0),
    entered: armed.reduce((t, r) => t + r.entered, 0),
    enteredFull: armed.reduce((t, r) => t + r.enteredFull, 0),
    fullSeat: armed.filter(r => r.endSnapFull && r.endSnapFull.seat === 'full' || (r.diag && r.diag.firstFullSeatDay != null)).length,
    wave4: armed.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: armed.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: medianOf(armed.map(r => r.days)),
    maxDays: Math.max.apply(null, armed.map(r => r.days).concat([0])),
    medianGameDays: medianOf(armed.map(r => r.gameDays)),
  };
  const ranked = rankBlockers(armed);
  const vetAgg = {
    endVet4: armed.map(r => r.vet.endVet4n), endVet5: armed.map(r => r.vet.endVet5n),
    maxVet4: armed.map(r => r.vet.maxVet4), maxVet5: armed.map(r => r.vet.maxVet5),
    maxVet5ge2: armed.filter(r => r.vet.maxVet5 >= 2).length,
    endVet5ge2: armed.filter(r => r.vet.endVet5n >= 2).length,
    w5killTotal: armed.reduce((t, r) => t + (r.vet.w5killCount | 0), 0),
    w5distinctEnd: armed.map(r => r.endSnapFull.w5 | 0),
    w5distinctMax: armed.map(r => r.diag.max.w5 | 0),
  };
  const causeShares = {};
  for (const r of armed) for (const k of Object.keys(r.deaths || {})) causeShares[k] = (causeShares[k] | 0) + r.deaths[k];
  const perSeed = armed.map(r => ({
    seed: r.seed, days: r.days, gameDays: r.gameDays, endReason: r.endReason, won: r.won,
    finalRank: r.finalRank, maxRank: r.maxRank, nationalEver: r.nationalEver,
    table: r.table, entered: r.entered, endSeat: r.endSnap.seat, endOk: r.endSnap.ok,
    endBinding: r.endSnap.binding, endWorst: r.endSnap.worst,
    endDistTotal: COMP_ORDER.reduce((t, k) => t + (r.endSnap.dist[k] | 0), 0),
    maxDist: r.diag.maxDist,
    maxDistTotal: COMP_ORDER.reduce((t, k) => t + (r.diag.maxDist[k] | 0), 0),
    firstLesserDay: r.diag.firstLesserDay, firstFullSeatDay: r.diag.firstFullSeatDay,
    endVet4n: r.vet.endVet4n, endVet5n: r.vet.endVet5n,
    maxVet4: r.vet.maxVet4, maxVet4Day: r.vet.maxVet4Day,
    maxVet5: r.vet.maxVet5, maxVet5Day: r.vet.maxVet5Day,
    w5distinctEnd: r.endSnapFull.w5 | 0, w5distinctMax: r.diag.max.w5 | 0,
    w5killCount: r.vet.w5killCount,
    holdKind: (r.endSnapFull.unlock || {}).holdKind || null,
    rd5short: (r.endSnapFull.unlock || {}).rd5short || null,
    standingEnd: (r.endSnapFull.unlock || {}).standing,
  }));
  const diagGo = armedEndSnaps && armedWinSnaps && g2Pass && g3Pass
    && unclassified.length === 0 && vetPresent && w5Present;
  return { rows: rows.length, seeds, wall, ranked, vetAgg, causeShares, perSeed,
    gates: { g2, g2Pass, g3Pass, classifications, unclassified: unclassified.length, vetPresent, w5Present, armedEndSnaps, armedWinSnaps },
    verdict: diagGo ? 'DIAG-GO' : 'DIAG-NO-GO' };
}

if (require.main === module) {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'perseed-fullseat-recheck-a');
  const a = analyze(evidDir);
  console.log(`rows=${a.rows} seeds=${a.seeds.join(',')}`);
  console.log(`wall: n=${a.wall.n} won=${a.wall.won} natEver=${a.wall.nationalEver} natFinal=${a.wall.nationalFinal} table=${a.wall.table} entered=${a.wall.entered} enteredFull=${a.wall.enteredFull} fullSeat=${a.wall.fullSeat} wave4=${a.wall.wave4} wave5=${a.wall.wave5} medDays=${a.wall.medianDays} maxDays=${a.wall.maxDays}`);
  console.log(`ranked: ${a.ranked.map(x => `${x.component}:${x.seedsBlocked}(medEnd${x.medianEndDist},medMax${x.medianMaxDist})`).join(' ')}`);
  console.log(`vet: endVet4=${JSON.stringify(a.vetAgg.endVet4)} endVet5=${JSON.stringify(a.vetAgg.endVet5)} maxVet4=${JSON.stringify(a.vetAgg.maxVet4)} maxVet5=${JSON.stringify(a.vetAgg.maxVet5)} maxVet5ge2=${a.vetAgg.maxVet5ge2} w5killTotal=${a.vetAgg.w5killTotal} w5distinctEnd=${JSON.stringify(a.vetAgg.w5distinctEnd)} w5distinctMax=${JSON.stringify(a.vetAgg.w5distinctMax)}`);
  for (const s of a.perSeed) console.log(`  seed ${s.seed}: days=${s.days} end=${s.endReason} won=${s.won} rank=${s.finalRank}/${s.maxRank} seat=${s.endSeat} endBind=${s.endBinding.join(',')} endDistTot=${s.endDistTotal} maxDistTot=${s.maxDistTotal} firstLesser=${s.firstLesserDay} vetEnd=${s.endVet4n}/${s.endVet5n} vetMax=${s.maxVet4}/${s.maxVet5} w5=${s.w5distinctEnd}/${s.w5distinctMax} w5kills=${s.w5killCount} hold=${s.holdKind} rd5short=${JSON.stringify(s.rd5short)}`);
  console.log(`gates: G2 ${a.gates.g2Pass ? 'PASS' : 'FAIL'} G3 ${a.gates.g3Pass ? 'PASS' : 'FAIL'} unclassified=${a.gates.unclassified} vetPresent=${a.gates.vetPresent} w5Present=${a.gates.w5Present} endSnaps=${a.gates.armedEndSnaps} winSnaps=${a.gates.armedWinSnaps}`);
  console.log(`VERDICT (pending G1 det-gate): ${a.verdict}`);
  if (!a.gates.g2Pass || !a.gates.g3Pass || a.gates.unclassified !== 0 || !a.gates.vetPresent || !a.gates.w5Present) process.exit(1);
}

module.exports = { medianOf, classifyRow, rankBlockers, loadRows, analyze, COMP_ORDER };
