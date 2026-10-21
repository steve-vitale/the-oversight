#!/usr/bin/env node
// analyze-upkeepgate-b.js — sim-upkeepgate-b sweep analysis.
//
// Reads the paired sweep corpus (evidence/2026-10-21/perseed-upkeepgate-b/)
// and judges the pre-registered PRIMARY + guardrails:
//
//   PRIMARY (binding): post-court dissolution pairs-net (armed vs control)
//     closes to <= +1 (parent sim-linkdissolve-b baseline: +3 overall;
//     lead +3, belong +1 on substrate 0301f2450).
//   GO = gap closes AND all guardrails pass:
//     - starvation deaths (armed) <= control + 1
//     - median survival (armed) >= control - 10d
//     - no new death modes (armed cause set ⊆ control cause set)
//     - ever-national (armed) >= control - 2
//   NO-GO = gap persists -> the trim's upkeep cost is structural, not
//     policy-elastic.
//
// A pair = one seed + one policy. pairs-net follows the PARENT's own BINARY
// counting (sim-linkdissolve-b: "+3 pairs net: 5 armed-only vs 2 control-only,
// 4 both"): armed-only iff the armed run dissolved >=1 and control did not,
// control-only iff the reverse, else tie ("both dissolved" or "neither").
// Event counts are carried alongside for the mechanism read.
//

// Usage: node scripts/analyze-upkeepgate-b.js [corpus-dir]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] ||
  path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-upkeepgate-b');
const POLICIES = ['leadfeast-upkeepgate', 'belongfeast-upkeepgate'];

function load(arm, pol) {
  const p = path.join(DIR, `uglow-${arm}-${pol}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function dissN(row) { return (row.dissolve && row.dissolve.dissolutions.length) || 0; }
function binDiss(row) { return dissN(row) > 0; }
function everNational(row) {
  if (row.nationalDay > 0) return true;
  const t = (row.stand && row.stand.traj) || [];
  return t.some(x => x[6] === 1);
}
function trimK(row) { return Math.round(((row.sfeed || {}).trimKcal) || 0) / 1000; }
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
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
      ugSkips: (pr.a.ug ? pr.a.ug.gateSkips : 0) + '/' + (pr.c.ug ? pr.c.ug.gateSkips : 0),
      ugTend: (pr.a.ug ? pr.a.ug.tendCalls : 0) + '/' + (pr.c.ug ? pr.c.ug.tendCalls : 0),
      ugTrib: (pr.a.ug ? pr.a.ug.tribCalls : 0) + '/' + (pr.c.ug ? pr.c.ug.tribCalls : 0),
    });
    allPairs.push({ pol, seed: pr.seed, cd, ad, cb, ab });
  }
  const sum = (rs, f) => rs.reduce((t, r) => t + f(r), 0);
  const cCauses = {}, aCauses = {};
  for (const r of cRows) for (const k of Object.keys(r.deathCauses || {})) cCauses[k] = (cCauses[k] || 0) + r.deathCauses[k];
  for (const r of aRows) for (const k of Object.keys(r.deathCauses || {})) aCauses[k] = (aCauses[k] || 0) + r.deathCauses[k];
  const newModes = Object.keys(aCauses).filter(k => !(k in cCauses));
  const g = {
    pairsNet: aMore - cMore,
    aMore, cMore,
    starv: { armed: sum(aRows, r => r.starvDeaths || 0), control: sum(cRows, r => r.starvDeaths || 0) },
    medSurv: { armed: median(aRows.map(r => r.days)), control: median(cRows.map(r => r.days)) },
    newDeathModes: newModes,
    everNat: { armed: aRows.filter(everNational).length, control: cRows.filter(everNational).length },
    agreeBad: sum(aRows, r => (r.dissolve ? r.dissolve.agreeBad : 0)) + sum(cRows, r => (r.dissolve ? r.dissolve.agreeBad : 0)),
  };
  g.guard = {
    starv: g.starv.armed <= g.starv.control + 1,
    surv: g.medSurv.armed >= g.medSurv.control - 10,
    modes: g.newDeathModes.length === 0,
    nat: g.everNat.armed >= g.everNat.control - 2,
  };
  g.guardAll = g.guard.starv && g.guard.surv && g.guard.modes && g.guard.nat;
  // wall numbers per arm
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
    agreeBad: g.agreeBad, wall: { control: wall(cRows), armed: wall(aRows) }, ledger,
    deathCauses: { control: cCauses, armed: aCauses } };
}

// combined verdict over all pairs (binary counting = the parent's own)
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
