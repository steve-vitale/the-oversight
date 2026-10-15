#!/usr/bin/env node
// analyze-rangerefill-20261015.js — before/after analysis for the RANGING
// WATER-SAFETY sweep (loop B r46b, ARM 3 = sim-rangerefill; #292).
//
// Reads evidence/2026-10-15/perseed-rangerefill/{control,armed}/ and prints
// the GO verdict against the pre-registered bar:
//
// PRIMARY (all must hold):
//   (a) ranging-dehydration deaths on the ARMED side == 0
//   (b) pack-water-full departures >= 90% of armed rangings
//   (c) zero armed departures with empty pack + dry cistern
// GUARDRAILS:
//   (d) armed median survival >= control median - 10d
//   (e) armed national >= control national - 2/16
//   (f) no new death mode on armed (n>=3) absent on control
// GO -> 12-16 seed confirm. MISS -> layer deleted per kill protocol.
//
// Usage: node scripts/analyze-rangerefill-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-rangerefill');

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

function main() {
  const ctrl = loadSide('control');
  const armed = loadSide('armed');
  const cs = ctrl.summary, as = armed.summary;
  const out = [];
  const L = (s) => { out.push(s); console.log(s); };

  L('=== RANGEREFILL before/after (8 seeds x {leadcourt,belongseek}, 180d death-aware) ===');
  L(`runs: control ${cs.nRuns}, armed ${as.nRuns}`);
  L('');
  L('--- PRIMARY ---');
  const dehyA = as.dehyDeaths;
  L(`(a) armed ranging-dehydration deaths: ${dehyA} (control: ${cs.dehyDeaths}) -> ${dehyA === 0 ? 'HOLD' : 'MISS'}`);
  const pfA = as.departures.packFullFrac, pfC = cs.departures.packFullFrac;
  L(`(b) pack-full departures: armed ${as.departures.n} departures, full=${pfA} (control ${cs.departures.n}, full=${pfC}) -> ${(pfA != null && pfA >= 0.90) ? 'HOLD' : 'MISS'} (need >=0.90)`);
  const violA = as.departures.nViolations;
  L(`(c) empty-pack+dry-cistern departures: armed ${violA} (control ${cs.departures.nViolations}) -> ${violA === 0 ? 'HOLD' : 'MISS'}`);
  L('');
  L('--- GUARDRAILS ---');
  const medA = as.wall.medianDays, medC = cs.wall.medianDays;
  L(`(d) median survival: armed ${medA}d vs control ${medC}d -> ${medA >= medC - 10 ? 'HOLD' : 'MISS'} (need >= ${medC - 10}d)`);
  const natA = parseInt(as.wall.national), natC = parseInt(cs.wall.national);
  L(`(e) national: armed ${as.wall.national} vs control ${cs.wall.national} -> ${natA >= natC - 2 ? 'HOLD' : 'MISS'} (need >= ${natC - 2}/16)`);
  // (f) new death modes: causes with n>=3 on armed absent (0) on control
  const newModes = [];
  for (const [k, v] of Object.entries(as.deaths)) {
    if (v >= 3 && !(cs.deaths[k] >= 1)) newModes.push(`${k} (armed ${v}, control ${cs.deaths[k] || 0})`);
  }
  L(`(f) new death modes (armed n>=3, control 0): ${newModes.length ? newModes.join('; ') : 'none'} -> ${newModes.length ? 'MISS' : 'HOLD'}`);
  L('');
  const go = dehyA === 0 && pfA != null && pfA >= 0.90 && violA === 0 &&
    medA >= medC - 10 && natA >= natC - 2 && newModes.length === 0;
  L(`GO VERDICT: ${go ? 'GO — run the 12-16 seed confirm' : 'MISS — layer deleted per kill protocol, evidence-only landing'}`);
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
  // true-wild (Manhattan dist from haven > 1) from per-run visit rows
  for (const [name, side] of [['control', ctrl], ['armed', armed]]) {
    let tw = 0, tf = 0;
    for (const run of side.runs) {
      const hv = (run.route && run.route.haven) || { hx: 4, hy: 4 };
      for (const v of ((run.route && run.route.visits) || [])) {
        const d = Math.abs(v.to.x - hv.hx) + Math.abs(v.to.y - hv.hy);
        if (d > 1) { tw++; if (v.filled) tf++; }
      }
    }
    L(`[${name}] true-wild (dist>1) visits=${tw} filled=${tf} unfilled=${tw - tf}`);
  }
  if (as.layer) {
    const l = as.layer;
    L(`[armed layer] gateTrips=${l.gateTrips} gateHauls=${l.gateHauls} gateHaulBottles=${l.gateHaulBottles} gateUnresolvable=${l.gateUnresolvable} filledDawn=${l.filledDawn} filledEnroute=${l.filledEnroute}`);
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
