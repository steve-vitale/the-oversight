#!/usr/bin/env node
// analyze-rangerefill2-20261015.js — before/after analysis for the RANGING
// WATER-SAFETY re-test sweep (loop B 10:10Z run, ARM 2 = sim-rangerefill2;
// sim-findings #292).
//
// Reads evidence/2026-10-15/perseed-rangerefill2/{control,armed}/ and prints
// the GO verdict against the HONEST pre-registered bar (§14 metric review of
// the r46b run — not a re-score; the bar applies fresh):
//
// PRIMARY (conjunction, all must hold):
//   (a) ranging-dehydration deaths on the ARMED side == 0
//   (b) pack-water-full departures >= 90% of FILLABLE armed departures,
//       where FILLABLE = cistern clean > 0 at the departure dawn
//       (a cistern-dry departure with pack 2/3 is honest, not a miss — the
//       r46b miss states are excluded by construction)
//   (c) true-wild fill share armed >= control true-wild fill share
//       (mechanism co-primary — the #292 gap)
//   (d) zero armed departures with empty pack + dry cistern
// GUARDRAILS:
//   (e) armed median survival >= control median - 10d
//   (f) armed national >= control national - 2/16
//   (g) no new death mode on armed (n>=3) absent on control
// GO -> report for a 12-16 seed confirm. MISS -> layer deleted per kill
// protocol, evidence-only landing.
//
// Usage: node scripts/analyze-rangerefill2-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-rfconfirm');

function loadSide(side) {
  const dir = path.join(BASE, side);
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  const runs = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/^run-.*\.json$/.test(f) || /-pristine\.json$/.test(f)) continue;
    runs.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return { summary, runs };
}

// true-wild (Manhattan dist from haven > 1) fill share from visit rows
function trueWild(side) {
  let tw = 0, tf = 0;
  for (const run of side.runs) {
    const hv = (run.route && run.route.haven) || { hx: 4, hy: 4 };
    for (const v of ((run.route && run.route.visits) || [])) {
      const d = Math.abs(v.to.x - hv.hx) + Math.abs(v.to.y - hv.hy);
      if (d > 1) { tw++; if (v.filled) tf++; }
    }
  }
  return { visits: tw, filled: tf, share: tw ? tf / tw : null };
}

function depRows(side) {
  return side.runs.flatMap(r => (r.departures || []).map(d => Object.assign({ policy: r.policyId, seed: r.seed }, d)));
}

function main() {
  const ctrl = loadSide('control');
  const armed = loadSide('armed');
  const cs = ctrl.summary, as = armed.summary;
  const out = [];
  const L = (s) => { out.push(s); console.log(s); };

  L('=== RANGEREFILL re-test before/after (8 seeds x {leadcourt,belongseek}, 180d death-aware) ===');
  L(`runs: control ${cs.nRuns}, armed ${as.nRuns}`);
  L('');
  L('--- PRIMARY (honest bar, §14 metric review) ---');
  const dehyA = as.dehyDeaths;
  L(`(a) armed ranging-dehydration deaths: ${dehyA} (control: ${cs.dehyDeaths}) -> ${dehyA === 0 ? 'HOLD' : 'MISS'}`);

  const adeps = depRows(armed), cdeps = depRows(ctrl);
  const afill = adeps.filter(d => (d.cisternClean || 0) > 0);
  const afillFull = afill.filter(d => d.packFull).length;
  const afillFrac = afill.length ? afillFull / afill.length : null;
  const aexcl = adeps.filter(d => !((d.cisternClean || 0) > 0));
  const cfill = cdeps.filter(d => (d.cisternClean || 0) > 0);
  L(`(b) FILLABLE departures (cistern>0 at dawn): armed ${afill.length}, pack-full ${afillFull} (${afillFrac != null ? (afillFrac * 100).toFixed(1) : 'n/a'}%) -> ${(afillFrac != null && afillFrac >= 0.90) ? 'HOLD' : 'MISS'} (need >=90%)`);
  L(`    excluded non-fillable (cistern=0 at dawn): armed ${aexcl.length} — ${aexcl.map(d => `${d.policy}-s${d.seed} d${d.day} pack=${d.packAtDepart}`).join('; ') || 'none'}`);
  L(`    raw (unscoped, for the record): armed ${adeps.length} dep, full=${adeps.length ? (adeps.filter(d => d.packFull).length / adeps.length * 100).toFixed(1) : 'n/a'}% | control ${cdeps.length} dep, fillable ${cfill.length}`);

  const twC = trueWild(ctrl), twA = trueWild(armed);
  const mechHold = twA.share != null && twC.share != null && twA.share >= twC.share;
  L(`(c) true-wild fill share: armed ${(twA.share * 100).toFixed(1)}% (${twA.filled}/${twA.visits}) vs control ${(twC.share * 100).toFixed(1)}% (${twC.filled}/${twC.visits}) -> ${mechHold ? 'HOLD' : 'MISS'}`);

  const violA = as.departures.nViolations;
  L(`(d) empty-pack+dry-cistern departures: armed ${violA} (control ${cs.departures.nViolations}) -> ${violA === 0 ? 'HOLD' : 'MISS'}`);
  L('');
  L('--- GUARDRAILS ---');
  const medA = as.wall.medianDays, medC = cs.wall.medianDays;
  L(`(e) median survival: armed ${medA}d vs control ${medC}d -> ${medA >= medC - 10 ? 'HOLD' : 'MISS'} (need >= ${medC - 10}d)`);
  const natA = parseInt(as.wall.national), natC = parseInt(cs.wall.national);
  L(`(f) national: armed ${as.wall.national} vs control ${cs.wall.national} -> ${natA >= natC - 2 ? 'HOLD' : 'MISS'} (need >= ${natC - 2}/16)`);
  const newModes = [];
  for (const [k, v] of Object.entries(as.deaths)) {
    if (v >= 3 && !(cs.deaths[k] >= 1)) newModes.push(`${k} (armed ${v}, control ${cs.deaths[k] || 0})`);
  }
  L(`(g) new death modes (armed n>=3, control 0): ${newModes.length ? newModes.join('; ') : 'none'} -> ${newModes.length ? 'MISS' : 'HOLD'}`);
  L('');
  const go = dehyA === 0 && afillFrac != null && afillFrac >= 0.90 && mechHold && violA === 0 &&
    medA >= medC - 10 && natA >= natC - 2 && newModes.length === 0;
  L(`GO VERDICT: ${go ? 'GO — report for the 12-16 seed confirm' : 'MISS — layer deleted per kill protocol, evidence-only landing'}`);
  L('');
  L('--- WALL NUMBERS ---');
  for (const s of [cs, as]) {
    L(`[${s.side}] national ${s.wall.national} table ${s.wall.table} won ${s.wall.won} w4 ${s.wall.w4} w5 ${s.wall.w5} median ${s.wall.medianDays}d max ${s.wall.maxDays}d`);
  }
  L('');
  L('--- #292 VISIT ANALYSIS (wild water tiles on-route: filled vs unfilled) ---');
  for (const s of [cs, as]) {
    const r = s.route;
    L(`[${s.side}] visits=${r.waterTileVisits} filled=${r.filledVisits} unfilled=${r.unfilledVisits} havenFills=${r.havenFills} wildFills=${r.wildFills} refused=${r.refusedFills}`);
  }
  L(`[control] true-wild (dist>1) visits=${twC.visits} filled=${twC.filled}`);
  L(`[armed]   true-wild (dist>1) visits=${twA.visits} filled=${twA.filled}`);
  if (as.layer) {
    const l = as.layer;
    L(`[armed layer] gateTrips=${l.gateTrips} gateHauls=${l.gateHauls} gateHaulBottles=${l.gateHaulBottles} gateUnresolvable=${l.gateUnresolvable} filledDawn=${l.filledDawn} filledEnroute=${l.filledEnroute} filledGatehaul=${l.filledGatehaul || 0}`);
  }
  L('');
  L('--- DEATH CAUSES ---');
  const causes = [...new Set([...Object.keys(cs.deaths), ...Object.keys(as.deaths)])].sort();
  for (const k of causes) L(`  ${k}: control ${cs.deaths[k] || 0} | armed ${as.deaths[k] || 0}`);
  L('');
  L(`instrument errors: control ${cs.instrErrors}, armed ${as.instrErrors}`);
  fs.writeFileSync(path.join(BASE, 'go-verdict.txt'), out.join('\n') + '\n');
}
main();
