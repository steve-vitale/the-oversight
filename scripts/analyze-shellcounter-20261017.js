#!/usr/bin/env node
// scripts/analyze-shellcounter-20261017.js — pilot analysis for sim-shellcounter-b.
//
// Reads evidence/2026-10-17/perseed-shellcounter/*.json and prints:
//   PRIMARY: shelled kcal on LEAN days (armed) vs 0 control, day-type split
//   GUARDRAILS: starvation armed <= control+2; national; median survival; death modes
//   Wall metrics per the mission list.
// Usage: node scripts/analyze-shellcounter-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellcounter');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const ctl = rows.filter(r => r.arm === 'control');
const arm = rows.filter(r => r.arm === 'armed');
const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = (rs, k) => { const v = rs.map(r => r[k] || 0).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; };

console.log(`runs: control=${ctl.length} armed=${arm.length}\n`);

// PRIMARY — engagement on lean days
console.log('== PRIMARY: counter-nut engagement ==');
console.log(`  shelledKcal (total)      : control=${sum(ctl, 'shelledKcal')}  armed=${sum(arm, 'shelledKcal')}`);
console.log(`  shelledKcalLean (LEAN)   : control=${sum(ctl, 'shelledKcalLean')}  armed=${sum(arm, 'shelledKcalLean')}`);
console.log(`  shelledKcalFed  (FED)    : control=${sum(ctl, 'shelledKcalFed')}  armed=${sum(arm, 'shelledKcalFed')}`);
console.log(`  shellDays                : control=${sum(ctl, 'shellDays')}  armed=${sum(arm, 'shellDays')}`);
console.log(`  shelledDayEatKcal (proxy): control=${sum(ctl, 'shelledDayEatKcal')}  armed=${sum(arm, 'shelledDayEatKcal')}`);
const leanK = sum(arm, 'shelledKcalLean');
console.log(`  GO threshold: >= 2000 kcal on LEAN days -> ${leanK >= 2000 ? 'GO' : 'NO-GO'} (${leanK})`);
console.log('\n  engagement by run (armed):');
for (const r of arm.filter(r => (r.shelledKcal || 0) > 0).sort((a, b) => b.shelledKcal - a.shelledKcal))
  console.log(`    s${r.seed}-${r.policyId}: ${r.shellDays}d / ${r.shelledKcal} kcal (lean ${r.shelledKcalLean} / fed ${r.shelledKcalFed})`);

// GUARDRAILS
console.log('\n== GUARDRAILS ==');
const stC = sum(ctl, 'starvationDeaths'), stA = sum(arm, 'starvationDeaths');
console.log(`  starvation deaths: control=${stC} armed=${stA} (guardrail: armed <= control+2 -> ${stA <= stC + 2 ? 'HOLD' : 'MISS'})`);
console.log(`  player starvation: control=${sum(ctl, 'playerStarvationDeaths')} armed=${sum(arm, 'playerStarvationDeaths')}`);
const natC = sum(ctl, 'national'), natA = sum(arm, 'national');
console.log(`  national: control=${natC}/${ctl.length} armed=${natA}/${arm.length} (guardrail: armed >= control-2 -> ${natA >= natC - 2 ? 'HOLD' : 'MISS'})`);
const medC = med(ctl, 'survivalDays'), medA = med(arm, 'survivalDays');
console.log(`  median survival: control=${medC}d armed=${medA}d (guardrail: >= control-10d -> ${medA >= medC - 10 ? 'HOLD' : 'MISS'})`);
// paired starvation sign
let better = 0, worse = 0, tied = 0;
for (const c of ctl) {
  const a = arm.find(x => x.seed === c.seed && x.policyId === c.policyId);
  if (!a) continue;
  if (a.starvationDeaths < c.starvationDeaths) better++;
  else if (a.starvationDeaths > c.starvationDeaths) worse++;
  else tied++;
}
console.log(`  paired starvation sign (better/worse/tied): ${better}/${worse}/${tied}`);
// death-mode check
const modes = {};
for (const r of arm) for (const [k, v] of Object.entries(r.causeCounts || {})) modes[k] = (modes[k] || 0) + v;
const modesC = {};
for (const r of ctl) for (const [k, v] of Object.entries(r.causeCounts || {})) modesC[k] = (modesC[k] || 0) + v;
const newModes = Object.keys(modes).filter(k => !(k in modesC));
console.log(`  death modes armed-only: ${newModes.length ? newModes.join(', ') : '(none)'}`);
// pantry displacement (validated instrument)
const ptC = sum(ctl, 'scholarPantryTakes'), ptA = sum(arm, 'scholarPantryTakes');
console.log(`  scholar pantry takes: control=${ptC} armed=${ptA} displacement(control-armed)=${ptC - ptA} (>=0 -> ${ptC - ptA >= 0 ? 'HOLD' : 'MISS'})`);

// WALL metrics
console.log('\n== WALL ==');
for (const [lbl, k] of [['table', 'table'], ['wins', 'wins'], ['exiled', 'exiled'], ['wave4', 'wave4'], ['wave5', 'wave5'], ['arc4', 'arc4'], ['fourRealm', 'fourRealm']])
  console.log(`  ${lbl}: control=${sum(ctl, k)}/${ctl.length} armed=${sum(arm, k)}/${arm.length}`);
console.log(`  max survival: control=${Math.max(...ctl.map(r => r.survivalDays || 0))}d armed=${Math.max(...arm.map(r => r.survivalDays || 0))}d`);
console.log(`  starved days: control=${sum(ctl, 'starvedDays')} armed=${sum(arm, 'starvedDays')}`);
const err = sum(ctl, 'instrumentErrors') + sum(arm, 'instrumentErrors');
console.log(`  instrument errors: ${err}`);
