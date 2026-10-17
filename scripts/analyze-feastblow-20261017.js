#!/usr/bin/env node
// scripts/analyze-feastblow-20261017.js — verdict over the feastblow pilot.
// Reads evidence/2026-10-17/perseed-feastblow/feastblow-*.json, judges the
// pre-registered PRIMARY (armed foodDeeds bar-holding runs >= control + 3),
// guardrails, and the seat/invitation question. No sims.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-feastblow');
const files = fs.readdirSync(DIR).filter(f => f.startsWith('feastblow-') && f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
console.log('runs: ' + rows.length);
const by = {};
for (const r of rows) by[`${r.road}/${r.arm}/s${r.seed}`] = r;
const sum = (rs, f) => rs.filter(f).length;
const mean = (rs, f) => rs.length ? (rs.reduce((t, r) => t + f(r), 0) / rs.length) : 0;
const median = (rs, f) => { const v = rs.map(f).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; };

for (const road of ['leadfeast', 'belongfeast']) {
  const armed = rows.filter(r => r.road === road && r.arm === 'armed');
  const ctrl = rows.filter(r => r.road === road && r.arm === 'control');
  console.log(`\n=== ${road} (n=${armed.length} armed / ${ctrl.length} control) ===`);
  const show = (label, f) => console.log(`  ${label}: armed ${sum(armed, f)}/${armed.length}  control ${sum(ctrl, f)}/${ctrl.length}`);
  show('foodDeeds holds (end)', r => r.foodDeeds.holds);
  show('  sentimentTaught', r => r.foodDeeds.sentimentTaught);
  show('  feastSurgeUsed', r => r.foodDeeds.feastSurgeUsed);
  show('seat ever (lesser+)', r => r.seatEver !== 'none');
  show('invitation staged (waiting)', r => r.waitingDay != null);
  show('announced', r => r.announcedDay != null);
  show('arc IV reached', r => r.arc4Day != null);
  show('national ever', r => r.nationalDay != null);
  show('tableDone', r => r.tableDone);
  show('won', r => r.won);
  console.log(`  feasted marks/run: armed mean ${mean(armed, r => r.marks).toFixed(1)}  control mean ${mean(ctrl, r => r.marks).toFixed(1)}`);
  console.log(`  draws cast: armed ${armed.reduce((t, r) => t + r.draws, 0)}  control ${ctrl.reduce((t, r) => t + r.draws, 0)}`);
  console.log(`  draws faced ok: armed ${armed.reduce((t, r) => t + r.faceOk, 0)} (layer ctx ${armed.reduce((t, r) => t + r.fbFacedCtx, 0)})  control ${ctrl.reduce((t, r) => t + r.faceOk, 0)}`);
  console.log(`  armed feasts: armed ${armed.reduce((t, r) => t + r.armedFeasts, 0)}  control ${ctrl.reduce((t, r) => t + r.armedFeasts, 0)}`);
  console.log(`  scholar combat deaths: armed ${armed.reduce((t, r) => t + r.scholarCombatDeaths, 0)}  control ${ctrl.reduce((t, r) => t + r.scholarCombatDeaths, 0)}`);
  console.log(`  median survival: armed d${median(armed, r => r.endDay)}  control d${median(ctrl, r => r.endDay)}`);
  console.log(`  instrument errors: armed ${armed.reduce((t, r) => t + r.instrumentErrors, 0)}  control ${ctrl.reduce((t, r) => t + r.instrumentErrors, 0)}`);
  // guardrail: new death modes on armed?
  const modes = {};
  for (const r of armed) for (const [k, v] of Object.entries(r.deathCauses || {})) modes[k] = (modes[k] || 0) + v;
  const cmodes = {};
  for (const r of ctrl) for (const [k, v] of Object.entries(r.deathCauses || {})) cmodes[k] = (cmodes[k] || 0) + v;
  const newModes = Object.keys(modes).filter(k => !cmodes[k]);
  console.log(`  death modes armed-only: ${newModes.length ? newModes.join(', ') : 'none'}`);
}

// PRIMARY verdict (both roads pooled, paired by seed+road)
const paired = [];
for (const road of ['leadfeast', 'belongfeast']) for (const s of [...new Set(rows.map(r => r.seed))]) {
  const a = rows.find(r => r.road === road && r.arm === 'armed' && r.seed === s);
  const c = rows.find(r => r.road === road && r.arm === 'control' && r.seed === s);
  if (a && c) paired.push({ road, seed: s, a, c });
}
const aHold = sum(paired, p => p.a.foodDeeds.holds), cHold = sum(paired, p => p.c.foodDeeds.holds);
console.log(`\nPRIMARY: armed foodDeeds ${aHold}/${paired.length} vs control ${cHold}/${paired.length} — bar: armed >= control+3`);
console.log(aHold >= cHold + 3 ? 'PRIMARY: GO' : 'PRIMARY: NO-GO');
// Guardrails
const aCD = paired.reduce((t, p) => t + p.a.scholarCombatDeaths, 0), cCD = paired.reduce((t, p) => t + p.c.scholarCombatDeaths, 0);
const aN = sum(paired, p => p.a.nationalDay != null), cN = sum(paired, p => p.c.nationalDay != null);
const aMed = median(paired.map(p => p.a), r => r.endDay);
const cMed = median(paired.map(p => p.c), r => r.endDay);
console.log(`GUARDRAILS: scholar combat deaths armed ${aCD} vs control ${cCD} (kill if > control+2): ${aCD > cCD + 2 ? 'TRIPPED' : 'ok'}`);
console.log(`GUARDRAILS: national armed ${aN} vs control ${cN} (kill if < control-2): ${aN < cN - 2 ? 'TRIPPED' : 'ok'}`);
console.log(`GUARDRAILS: median survival armed d${aMed} vs control d${cMed} (kill if < control-10d): ${aMed < cMed - 10 ? 'TRIPPED' : 'ok'}`);
// The seat question: any run convert feasted blows -> seat/invitation?
const seatRuns = rows.filter(r => r.seatEver !== 'none');
console.log(`\nSEAT QUESTION: seat-earned on ${seatRuns.length}/${rows.length} runs`);
for (const r of seatRuns) console.log(`  ${r.road}/${r.arm}/s${r.seed}: seat=${r.seatEver} d${r.seatEverDay} waiting=${r.waitingDay != null ? 'd' + r.waitingDay : 'no'} foodDeeds=${r.foodDeeds.holds}`);
const waitingRuns = rows.filter(r => r.waitingDay != null);
console.log(`invitation staged on ${waitingRuns.length}/${rows.length} runs`);
