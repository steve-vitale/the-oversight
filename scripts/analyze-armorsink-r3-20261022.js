#!/usr/bin/env node
// analyze-armorsink-r3-20261022.js — verdict analysis for sim-armorsink-r3.
//
// Reads evidence/2026-10-22/perseed-armorsink-r3/ledger/<policy>/s<seed>.json
// (the 3 r2-implicated configs) and prints:
//   1. the r3 attribution verdict per config (unexplained vs attributed),
//   2. the six r2 events' disposition (explained -> named hooked channel,
//      or still unexplained -> named gap),
//   3. wall numbers: national/table/wins, wave 4-5 unlocks, median survival.
//   4. generation-path + form-audit findings.
//
// Usage: node scripts/analyze-armorsink-r3-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-22', 'perseed-armorsink-r3', 'ledger');

const CONFIGS = [
  { seed: 65422, policyId: 'leadfeast' },
  { seed: 65424, policyId: 'belongfeast' },
  { seed: 65428, policyId: 'belongfeast' },
];

// r2's six events, for disposition tracking.
const R2_EVENTS = [
  { seed: 65422, policyId: 'leadfeast', day: 145, kind: 'production', itemId: 'wardens_cloak' },
  { seed: 65422, policyId: 'leadfeast', day: 145, kind: 'production', itemId: 'conquerors_plate' },
  { seed: 65422, policyId: 'leadfeast', day: 171, kind: 'sink', itemId: 'stormcloak' },
  { seed: 65422, policyId: 'leadfeast', day: 171, kind: 'sink', itemId: 'wardens_cloak' },
  { seed: 65424, policyId: 'belongfeast', day: 99, kind: 'sink', itemId: 'shelter_cloak' },
  { seed: 65428, policyId: 'belongfeast', day: 105, kind: 'production', itemId: 'swat_vest' },
];

function load(seed, policyId) {
  const f = path.join(EVID, policyId, `s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function main() {
  const wall = { national: 0, table: 0, won: 0, wave45: 0, survivals: [] };
  let allExplained = true;
  console.log('=== r3 attribution per config ===');
  for (const { seed, policyId } of CONFIGS) {
    const d = load(seed, policyId);
    if (!d) { console.log(`  ${policyId}/s${seed}: MISSING`); allExplained = false; continue; }
    const L = d.ledger || {};
    const s = L.r3summary || {};
    wall.national += d.national | 0; wall.table += d.table | 0; wall.won += d.won | 0;
    if ((d.maxWave | 0) >= 4) wall.wave45++;
    wall.survivals.push(d.gameDays | 0);
    console.log(`  ${policyId}/s${seed}: days=${d.gameDays} end=${d.endReason} ` +
      `unexplained=${s.unexplained} attributed=${s.attributed} shadows=${s.shadowDeduped} ` +
      `transfers=${s.transfers} genArmor=${s.genArmorSightings} formAnom=${s.formAnomalies} ierr=${d.instrumentErrors}`);
    for (const u of (L.unexplained || [])) {
      console.log(`    UNEXPLAINED d${u.day} ${u.kind} ${u.itemId} x${u.delta} holders=${JSON.stringify(u.holders || {})}${u.note ? ' note=' + u.note : ''}`);
    }
    for (const a of (L.r3attributed || [])) {
      const hk = (a.hooks || []).map(h => `d${h.day}:${h.how || h.kind}`).join(',');
      console.log(`    attributed  d${a.day} ${a.kind} ${a.itemId} x${a.delta} via=${a.via} hooks=[${hk}] holders=${JSON.stringify(a.holders || {})}`);
    }
    // sample-cadence anomalies
    const spd = L.r3samplesPerDay || {};
    const weird = Object.entries(spd).filter(([, n]) => n !== 1);
    if (weird.length) console.log(`    sample-cadence anomalies: ${weird.map(([d, n]) => `d${d}x${n}`).join(', ')}`);
  }

  console.log('\n=== the six r2 events: disposition ===');
  let explained = 0;
  for (const ev of R2_EVENTS) {
    const d = load(ev.seed, ev.policyId);
    let line = `  d${ev.day} ${ev.kind} ${ev.itemId} (${ev.policyId}/s${ev.seed}): `;
    if (!d) { line += 'NO RUN DATA'; allExplained = false; }
    else {
      const L = d.ledger || {};
      const attr = (L.r3attributed || []).find(a =>
        a.itemId === ev.itemId && a.kind === ev.kind && Math.abs(a.day - ev.day) <= 1);
      const unx = (L.unexplained || []).find(u =>
        u.itemId === ev.itemId && u.kind === ev.kind && Math.abs(u.day - ev.day) <= 1);
      if (attr && !unx) {
        explained++;
        const hk = (attr.hooks || []).map(h => `d${h.day}:${h.how || h.kind}`).join(',');
        line += `EXPLAINED via=${attr.via} hooks=[${hk}] holders=${JSON.stringify(attr.holders || {})}`;
      } else if (unx) {
        allExplained = false;
        line += `STILL UNEXPLAINED d${unx.day} holders=${JSON.stringify(unx.holders || {})}${unx.note ? ' note=' + unx.note : ''}`;
      } else {
        // event did not reproduce on this re-run (sim variance) — check
        // whether the underlying shape was seen at all
        line += 'NOT REPRODUCED on re-run (no matching delta within +-1d)';
      }
    }
    console.log(line);
  }

  console.log('\n=== wall numbers (3 configs) ===');
  const surv = wall.survivals.slice().sort((a, b) => a - b);
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  console.log(`  national=${wall.national}/3 table=${wall.table}/3 won=${wall.won}/3 wave4+=${wall.wave45}/3 median-survival=${median}d survivals=[${surv.join(',')}]`);

  console.log('\n=== generation-path + form findings ===');
  for (const { seed, policyId } of CONFIGS) {
    const d = load(seed, policyId);
    if (!d) continue;
    const L = d.ledger || {};
    const gen = (L.r3genArmor || []).filter(e => (e.P | 0) >= 15);
    const form = L.r3formAnomalies || [];
    if (gen.length || form.length) {
      console.log(`  ${policyId}/s${seed}: genArmor(P>=15)=${gen.length} formAnomalies=${form.length}`);
      for (const g of gen.slice(0, 5)) console.log(`    gen: ${g.where} ${g.itemId} P${g.P} form=${g.form}`);
      for (const f of form.slice(0, 5)) console.log(`    form: ${f.vid} ${f.slot} ${f.itemId} ${f.note}`);
    }
  }

  console.log(`\nR2-EVENTS EXPLAINED: ${explained}/6`);
  console.log(explained === 6 ? 'VERDICT: DIAG-GO' : 'VERDICT: DIAG-NO-GO (see still-unexplained above)');
}

main();
