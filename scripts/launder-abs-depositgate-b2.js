#!/usr/bin/env node
// launder-abs-depositgate-b2.js — #800 laundering instrument fix.
//
// Recomputes the duty rebound in ABSOLUTE kcal (rebound kcal vs suppressed
// kcal) alongside the ratio. The b-run's 2.0x ratio guardrail misfires on
// near-zero control baselines by construction; the absolute compensation is
// the honest instrument.
//
// Inputs: sweep JSON pairs (control/armed) for one or more policies.
//   node scripts/launder-abs-depositgate-b2.js <control.json> <armed.json> [<control2.json> <armed2.json> ...]
// Depositor-inflow (b-run definition): share[stockSurplus stored] +
// return[npcNodeTravel stockPantry] + bighaul[villageLives forage stockPantry]
// + tribute-receipt[depositPantryPieces 'Tribute grain'].
'use strict';
const fs = require('fs');

function inflow(e) {
  const c = e.chan || {};
  return (e.shareKcal || 0) + (c.return || 0) + (c.bighaul || 0) + (e.tributeKcal || 0);
}

function load(f) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  return d.rows.map(r => ({ seed: r.seed, end: r.end }));
}

const pairs = [];
for (let i = 0; i + 1 < process.argv.length - 1; i += 2) {
  pairs.push([process.argv[2 + i], process.argv[3 + i]]);
}

let totSuppressed = 0, totRebound = 0;
const byPolicy = [];
for (const [fc, fa] of pairs) {
  const C = load(fc), A = load(fa);
  const cBy = Object.fromEntries(C.map(r => [r.seed, r.end]));
  let suppressed = 0, rebound = 0, dutyC = 0, dutyA = 0, ratioSum = 0, ratioN = 0;
  const perSeed = [];
  for (const { seed, end: a } of A) {
    const c = cBy[seed];
    if (!c) continue;
    const sup = inflow(c) - inflow(a);          // kcal NOT deposited because of the gate
    const reb = (a.chan.duty || 0) - (c.chan.duty || 0); // duty-channel delta
    suppressed += sup; rebound += reb;
    dutyC += c.chan.duty || 0; dutyA += a.chan.duty || 0;
    if ((c.chan.duty || 0) > 0) { ratioSum += (a.chan.duty || 0) / (c.chan.duty || 0); ratioN++; }
    perSeed.push({ seed, suppressed: Math.round(sup), rebound: Math.round(reb) });
  }
  const comp = suppressed > 0 ? rebound / suppressed : null;
  byPolicy.push({ control: fc, armed: fa, dutyC: Math.round(dutyC), dutyA: Math.round(dutyA),
    suppressed: Math.round(suppressed), rebound: Math.round(rebound),
    compensation: comp == null ? null : +comp.toFixed(3),
    meanRatio: ratioN ? +(ratioSum / ratioN).toFixed(2) : null });
  totSuppressed += suppressed; totRebound += rebound;
}

console.log('=== #800 duty-laundering: absolute kcal ===');
for (const b of byPolicy) {
  console.log(`\n${b.control} vs ${b.armed}`);
  console.log(`  duty kcal: control=${b.dutyC} armed=${b.dutyA}`);
  console.log(`  suppressed inflow kcal: ${b.suppressed}`);
  console.log(`  duty rebound kcal:      ${b.rebound}`);
  console.log(`  ABSOLUTE compensation:  ${b.compensation == null ? 'n/a' : (b.compensation * 100).toFixed(1) + '%'} (rebound/suppressed)`);
  console.log(`  ratio (old instrument): ${b.meanRatio == null ? 'n/a' : b.meanRatio + 'x'} (mean over seeds with control duty > 0)`);
}
const totComp = totSuppressed > 0 ? totRebound / totSuppressed : null;
console.log(`\nPOOLED: suppressed=${Math.round(totSuppressed)} rebound=${Math.round(totRebound)} ` +
  `compensation=${totComp == null ? 'n/a' : (totComp * 100).toFixed(1) + '%'} ` +
  (totComp != null && totComp > 0.5 ? '→ FLAG: >50% real laundering concern' : '→ partial compensation, watched not blocking'));
