#!/usr/bin/env node
'use strict';
// analyze-fieldroute-20261016.js — judges the pre-registered gates for
// sim-fieldroute (2026-10-16, scale-onramp axis).
//
// Reads evidence/2026-10-16/perseed-fieldroute/*.json, pairs control/armed
// by (policyId, seed), and prints:
//   PRIMARY: Σ postInviteFieldExposure armed vs control (GO <= 0.70x)
//   GUARDRAILS: national, table, median survival, starvation, new death
//     modes, wave-4 unlocks
//   WALL: national/table/wins, wave 4-5 unlocks, median/max survival,
//     death-cause shares
//   SECONDARIES: diverted legs, sightings, pantry blocks, apex engagements,
//     travel days (routing displacement)
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldroute');

function load() {
  const rows = [];
  for (const f of fs.readdirSync(DIR)) {
    const m = f.match(/^(\w+)-(control|armed)-s(\d+)\.json$/);
    if (!m) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  }
  return rows;
}
const sum = (rs, k) => rs.reduce((a, r) => a + ((r[k] | 0)), 0);
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };

function main() {
  const rows = load();
  if (!rows.length) { console.error('no per-seed JSONs in ' + DIR); process.exit(2); }
  const byKey = {};
  for (const r of rows) byKey[`${r.policyId}|${r.seed}`] = byKey[`${r.policyId}|${r.seed}`] || {};
  for (const r of rows) byKey[`${r.policyId}|${r.seed}`][r.side] = r;
  const pairs = Object.values(byKey).filter(p => p.control && p.armed);
  const ctrl = pairs.map(p => p.control), armed = pairs.map(p => p.armed);
  console.log(`pairs: ${pairs.length} (${ctrl.length} control, ${armed.length} armed)`);

  // PRIMARY
  const feC = sum(ctrl, 'postInviteFieldExposure'), feA = sum(armed, 'postInviteFieldExposure');
  const ratio = feC ? feA / feC : (feA ? Infinity : 1);
  console.log(`\nPRIMARY — field-exposure (non-raid, post-invite) monster-verb villager deaths:`);
  console.log(`  control Σ=${feC}  armed Σ=${feA}  ratio=${isFinite(ratio) ? ratio.toFixed(3) : 'n/a'}  GO<=0.70 → ${feC && ratio <= 0.70 ? 'GO' : 'NO-GO'}`);
  console.log(`  (per-pair: ${pairs.map(p => `${p.control.policyId}-s${p.control.seed}:${p.control.postInviteFieldExposure}→${p.armed.postInviteFieldExposure}`).join('  ')})`);

  // GUARDRAILS
  console.log(`\nGUARDRAILS:`);
  const natC = sum(ctrl, 'national'), natA = sum(armed, 'national');
  console.log(`  national: control=${natC} armed=${natA} (need >= ${natC - 2}) → ${natA >= natC - 2 ? 'HOLD' : 'BREACH'}`);
  const tabC = sum(ctrl, 'table'), tabA = sum(armed, 'table');
  console.log(`  table: control=${tabC} armed=${tabA} (need >= ${tabC - 2}) → ${tabA >= tabC - 2 ? 'HOLD' : 'BREACH'}`);
  const medC = median(ctrl.map(r => r.days)), medA = median(armed.map(r => r.days));
  console.log(`  median survival: control=${medC}d armed=${medA}d (need >= ${medC - 10}d) → ${medA >= medC - 10 ? 'HOLD' : 'BREACH'}`);
  const stC = sum(ctrl, 'starvationDeaths'), stA = sum(armed, 'starvationDeaths');
  console.log(`  starvation deaths: control=${stC} armed=${stA} (need <= ${stC + 2}) → ${stA <= stC + 2 ? 'HOLD' : 'BREACH'}`);
  const w4C = sum(ctrl, 'wave4'), w4A = sum(armed, 'wave4');
  console.log(`  wave-4 unlocks: control=${w4C} armed=${w4A} (need >= ${w4C - 1}) → ${w4A >= w4C - 1 ? 'HOLD' : 'BREACH'}`);
  const famsC = new Set(); ctrl.forEach(r => Object.keys(r.deathFamilies || {}).forEach(f => famsC.add(f)));
  const newModes = new Set(); armed.forEach(r => Object.keys(r.deathFamilies || {}).forEach(f => { if (!famsC.has(f) && (r.deathFamilies[f] | 0) > 0) newModes.add(f); }));
  console.log(`  new death modes: ${newModes.size ? [...newModes].join(',') + ' → BREACH' : 'none → HOLD'}`);

  // WALL
  const w5C = sum(ctrl, 'wave5'), w5A = sum(armed, 'wave5');
  const winC = sum(ctrl, 'won'), winA = sum(armed, 'won');
  const maxC = Math.max(...ctrl.map(r => r.days)), maxA = Math.max(...armed.map(r => r.days));
  console.log(`\nWALL (control → armed):`);
  console.log(`  national ${natC}→${natA}  table ${tabC}→${tabA}  wins ${winC}→${winA}`);
  console.log(`  wave4 ${w4C}→${w4A}  wave5 ${w5C}→${w5A}`);
  console.log(`  median survival ${medC}d→${medA}d  max ${maxC}d→${maxA}d`);
  const famAgg = (rs) => { const o = {}; rs.forEach(r => Object.entries(r.deathFamilies || {}).forEach(([f, n]) => o[f] = (o[f] | 0) + n)); return o; };
  console.log(`  death families control: ${JSON.stringify(famAgg(ctrl))}`);
  console.log(`  death families armed:   ${JSON.stringify(famAgg(armed))}`);

  // SECONDARIES — mechanism notes
  console.log(`\nSECONDARIES (armed only):`);
  console.log(`  diverted legs Σ=${sum(armed, 'frDiverted')}  pantry-blocked Σ=${sum(armed, 'frPantryBlock')}  no-alt Σ=${sum(armed, 'frNoAlt')}`);
  console.log(`  apex sightings Σ=${sum(armed, 'frSightings')}  apex engagements Σ=${sum(armed, 'frApexEngagements')} (field Σ=${sum(armed, 'frApexFieldEngagements')})`);
  console.log(`  travel days: control Σ=${sum(ctrl, 'travelDays')} armed Σ=${sum(armed, 'travelDays')}`);
  console.log(`  per-run diverted: ${armed.map(r => `${r.policyId}-s${r.seed}:${r.frDiverted}`).join('  ')}`);

  const goPrimary = feC > 0 && ratio <= 0.70;
  const guardsHold = natA >= natC - 2 && tabA >= tabC - 2 && medA >= medC - 10 && stA <= stC + 2 && w4A >= w4C - 1 && newModes.size === 0;
  console.log(`\nVERDICT: primary ${goPrimary ? 'GO' : 'NO-GO'} · guardrails ${guardsHold ? 'HOLD' : 'BREACH'} → ${goPrimary && guardsHold ? 'GO' : 'KILL'}`);
}
main();
