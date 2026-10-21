#!/usr/bin/env node
// analyze-repairrate-b.js — sim-repairrate-b sweep analysis.
//
// Reads the paired sweep corpus (evidence/2026-10-21/perseed-repairrate-b/)
// and judges the pre-registered PRIMARY + guardrails:
//
//   PRIMARY (binding): post-court dissolution pairs-net (armed vs control)
//     <= +1. control = SURPLUSFEED=1 + base policies (REPAIRRATE/SUCCPOLITY
//     unset); armed = SURPLUSFEED=1 + repairrate policies (REPAIRRATE=1,
//     SUCCPOLITY=1). Baseline context: the grandparent SURPLUSFEED tradeoff
//     was +3 (5v2); the parent gate arm was +2 (3v1) — both armed-vs-control
//     on the no-SURPLUSFEED control. This arm's control IS the SURPLUSFEED
//     substrate, so the pairs-net reads the repair-rate package directly.
//   GO = pairs-net <= +1 AND all guardrails pass:
//     - starvation deaths (armed) <= control + 1
//     - median survival (armed) >= control - 10d
//     - no new death modes (armed cause set ⊆ control cause set;
//       per-seed monster-name kills are pre-existing engine vocabulary —
//       the parent's honest category reading applies)
//     - ever-national (armed) >= control - 2
//   NO-GO = gap persists -> the repair rate doesn't close it either; the
//     trim's upkeep cost is structural through both the gate AND the
//     repair-rate levels.
//
// A pair = one seed + one policy. pairs-net follows the PARENT's BINARY
// counting: armed-only iff the armed run dissolved >=1 and control did not,
// control-only iff the reverse, else tie.
//
// Engagement attribution (separate, for decomposing a GO):
//   beatGifts — succession beats answered with the gift (policy lever)
//   graceWindows — distinct successions stamping _succDay on a link while
//     national live (SUCCPOLITY lever engaged)
//   loadBearingDawns — dawns where a grace-covered link read _succTrust >=
//     its road bar while link.trust < bar, national live (the lever MATTERED:
//     without it the polity bar would have failed that dawn).
//
// Usage: node scripts/analyze-repairrate-b.js [corpus-dir]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] ||
  path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-repairrate-b');
const POLICIES = ['leadfeast-repairrate', 'belongfeast-repairrate'];

function load(arm, pol) {
  const p = path.join(DIR, `rr-${arm}-${pol}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function dissN(row) { return (row.dissolve && row.dissolve.dissolutions.length) || 0; }
function binDiss(row) { return dissN(row) > 0; }
function everNational(row) {
  if (row.nationalDay > 0) return true;
  return false; // nationalDay persists as the ever-hit marker (parent convention)
}
function trimK(row) { return Math.round(((row.sfeed || {}).trimKcal) || 0) / 1000; }
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
// road bar for a scanned link: P (primary-Haven) 40, S (Haven-subordinate)
// 50, C/T (covenant/trade) 40 — the engine's polity bars.
function barFor(dir) { return dir === 'S' ? 50 : 40; }

function engagement(rows) {
  let beatGifts = 0, beatSkips = 0;
  const graceKeys = new Set();
  let loadBearingDawns = 0, graceActiveDawns = 0;
  for (const r of rows) {
    beatGifts += (r.rr && r.rr.beatGifts) || 0;
    beatSkips += (r.rr && r.rr.beatSkips) || 0;
    for (const s of (r.succScan || [])) {
      let anyGrace = false, loadBearing = false;
      for (const l of (s.links || [])) {
        const succDay = l[3];
        if (succDay < 0) continue;
        anyGrace = true;
        graceKeys.add(r.seed + ':' + l[0] + ':' + succDay);
        const bar = barFor(l[1]);
        if (s.nat === 1 && (s.d - succDay) <= 14 && l[4] >= bar && l[2] < bar) loadBearing = true;
      }
      if (anyGrace && s.nat === 1) graceActiveDawns++;
      if (loadBearing) loadBearingDawns++;
    }
  }
  return { beatGifts, beatSkips, graceWindows: graceKeys.size, graceActiveDawns, loadBearingDawns };
}

const report = { policies: {}, combined: null };
let allPairs = [];

for (const pol of POLICIES) {
  let p;
  try { p = { control: load('control', pol), armed: load('armed', pol) }; }
  catch (e) { console.error(`skip ${pol}: corpus missing (${e.message.split('\n')[0]})`); continue; }
  const cRows = p.control.rows, aRows = p.armed.rows;
  const pairs = cRows.map((cr, i) => ({ seed: cr.seed, c: cr, a: aRows[i] }));
  let aMore = 0, cMore = 0;
  const ledger = [];
  for (const pr of pairs) {
    const cd = dissN(pr.c), ad = dissN(pr.a);
    const cb = binDiss(pr.c), ab = binDiss(pr.a);
    if (ab && !cb) aMore++; else if (cb && !ab) cMore++;
    ledger.push({
      seed: pr.seed,
      courts: `${pr.c.dissolve.courts.length}/${pr.a.dissolve.courts.length}`,
      diss: `${cd}/${ad}`,
      trimK: trimK(pr.a),
      rrGifts: `${(pr.c.rr ? pr.c.rr.beatGifts : 0)}/${(pr.a.rr ? pr.a.rr.beatGifts : 0)}`,
    });
    allPairs.push({ pol, seed: pr.seed, cd, ad, cb, ab });
  }
  const sum = (rs, f) => rs.reduce((t, r) => t + f(r), 0);
  const cCauses = {}, aCauses = {};
  for (const r of cRows) for (const k of Object.keys(r.deathCauses || {})) cCauses[k] = (cCauses[k] || 0) + r.deathCauses[k];
  for (const r of aRows) for (const k of Object.keys(r.deathCauses || {})) aCauses[k] = (aCauses[k] || 0) + r.deathCauses[k];
  const newModes = Object.keys(aCauses).filter(k => !(k in cCauses));
  const engC = engagement(cRows), engA = engagement(aRows);
  const g = {
    pairsNet: aMore - cMore,
    aMore, cMore,
    starv: { armed: sum(aRows, r => r.starvDeaths || 0), control: sum(cRows, r => r.starvDeaths || 0) },
    medSurv: { armed: median(aRows.map(r => r.days)), control: median(cRows.map(r => r.days)) },
    newDeathModes: newModes,
    everNat: { armed: aRows.filter(everNational).length, control: cRows.filter(everNational).length },
    agreeBad: sum(aRows, r => (r.dissolve ? r.dissolve.agreeBad : 0)) + sum(cRows, r => (r.dissolve ? r.dissolve.agreeBad : 0)),
    engagement: { control: engC, armed: engA },
  };
  g.guard = {
    starv: g.starv.armed <= g.starv.control + 1,
    surv: g.medSurv.armed >= g.medSurv.control - 10,
    modes: g.newDeathModes.length === 0,
    nat: g.everNat.armed >= g.everNat.control - 2,
  };
  g.guardAll = g.guard.starv && g.guard.surv && g.guard.modes && g.guard.nat;
  const wall = (rs) => ({
    won: rs.filter(r => r.won).length,
    nationalEnd: rs.filter(r => r.national).length,
    everNat: rs.filter(everNational).length,
    table: rs.filter(r => r.table).length,
    wave4: rs.filter(r => (r.maxWave || 1) >= 4).length,
    wave5: rs.filter(r => (r.maxWave || 1) >= 5).length,
    medSurv: median(rs.map(r => r.days)),
    maxSurv: Math.max(...rs.map(r => r.days)),
  });
  report.policies[pol] = { pairsNet: g.pairsNet, aMore, cMore, guard: g.guard, guardAll: g.guardAll,
    starv: g.starv, medSurv: g.medSurv, newDeathModes: g.newDeathModes, everNat: g.everNat,
    agreeBad: g.agreeBad, engagement: g.engagement,
    wall: { control: wall(cRows), armed: wall(aRows) }, ledger,
    deathCauses: { control: cCauses, armed: aCauses } };
}

{
  let aMore = 0, cMore = 0, evA = 0, evC = 0;
  for (const pr of allPairs) {
    if (pr.ab && !pr.cb) aMore++; else if (pr.cb && !pr.ab) cMore++;
    evA += pr.ad; evC += pr.cd;
  }
  const ps = Object.values(report.policies);
  report.combined = {
    pairs: allPairs.length,
    pairsNet: aMore - cMore, aMore, cMore,
    eventNet: evA - evC, eventsArmed: evA, eventsControl: evC,
    guardAll: ps.length > 0 && ps.every(p => p.guardAll),
    verdict: (aMore - cMore) <= 1 && ps.length > 0 && ps.every(p => p.guardAll) ? 'GO' : 'NO-GO',
  };
}

console.log(JSON.stringify(report, null, 1));
