#!/usr/bin/env node
// compare-givechannel-20261015.js — verdict for the give-channel pilot.
// Reads evidence/2026-10-15/perseed-givechannel/summary.json, applies the
// pre-registered PRIMARY / CO-PRIMARY / GUARDRAILS, prints the verdict.
// Usage: node scripts/compare-givechannel-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-givechannel');
const all = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));

const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = (rs, k) => {
  const v = rs.map(r => r[k] || 0).sort((a, b) => a - b);
  return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};
const mean = (rs, k) => rs.length ? sum(rs, k) / rs.length : 0;

function block(policyId) {
  const ctrl = all.filter(r => r.policyId === policyId && r.side === 'control' && !r.error);
  const armed = all.filter(r => r.policyId === policyId && r.side === 'armed' && !r.error);
  return { ctrl, armed };
}

let go = true;
function verdict(name, ok, detail) {
  console.log(`  ${ok ? 'GO  ' : 'MISS'} ${name} — ${detail}`);
  if (!ok) go = false;
}

for (const policyId of ['leadcourt', 'belongseek']) {
  console.log(`\n=== ${policyId} (n=${block(policyId).ctrl.length}/${block(policyId).armed.length}) ===`);
  const { ctrl, armed } = block(policyId);
  console.log(`  half-ration days (trust<30): control=${sum(ctrl, 'halfRation')} armed=${sum(armed, 'halfRation')}`);
  console.log(`  half-ration beats (literal): control=${sum(ctrl, 'halfBeats')} armed=${sum(armed, 'halfBeats')}`);
  console.log(`  trust>=30 days: control=${sum(ctrl, 'trustGe30')} armed=${sum(armed, 'trustGe30')}`);
  console.log(`  scholar-starved-days: control=${sum(ctrl, 'starvedDays')} armed=${sum(armed, 'starvedDays')}`);
  console.log(`  hungryDays(kcal<1200): control=${sum(ctrl, 'hungry1200')} armed=${sum(armed, 'hungry1200')}`);
  console.log(`  opener donations: armed=${sum(armed, 'gcDonations')} (kcal=${sum(armed, 'gcKcal')}, skips=${sum(armed, 'gcSkips')})`);
  console.log(`  gives lineage: control=${sum(ctrl, 'givesSum')} armed=${sum(armed, 'givesSum')}`);
  console.log(`  mealKcal: control=${sum(ctrl, 'mealKcal')} armed=${sum(armed, 'mealKcal')}`);
  console.log(`  starveDeaths: control=${sum(ctrl, 'starveDeaths')} armed=${sum(armed, 'starveDeaths')}`);
  console.log(`  median survival: control=${med(ctrl, 'gameDays')} armed=${med(armed, 'gameDays')}`);
  console.log(`  national: control=${sum(ctrl, 'national')}/8 armed=${sum(armed, 'national')}/8`);
  console.log(`  table: control=${sum(ctrl, 'everTable')} armed=${sum(armed, 'everTable')}  won: ${sum(ctrl, 'won')}/${sum(armed, 'won')}`);
  console.log(`  maxWave: control=${Math.max(...ctrl.map(r => r.maxWave || 0))} armed=${Math.max(...armed.map(r => r.maxWave || 0))}`);
  console.log(`  exiled: control=${sum(ctrl, 'exiled')} armed=${sum(armed, 'exiled')}`);
}

console.log('\n=== PRE-REGISTERED VERDICT ===');
const C = all.filter(r => r.side === 'control' && !r.error);
const A = all.filter(r => r.side === 'armed' && !r.error);
// PRIMARY: half-ration-gated days (trust<30 at dusk sample) armed <= 0.75 x control
{
  const ch = sum(C, 'halfRation'), ah = sum(A, 'halfRation');
  verdict('PRIMARY (halfRation<=0.75x)', ah <= 0.75 * ch, `armed=${ah} vs bar=${(0.75 * ch).toFixed(1)} (control=${ch})`);
}
// CO-PRIMARY (mechanism honesty): mean dated-give kcal per armed run >= 500
{
  const m = mean(A, 'gcKcal');
  verdict('CO-PRIMARY (gcKcal>=500/run)', m >= 500, `mean=${m.toFixed(0)} kcal/run over ${A.length} armed runs`);
}
// GUARDRAILS (pooled)
{
  const csd = sum(C, 'starveDeaths'), asd = sum(A, 'starveDeaths');
  verdict('GUARD starveDeaths<=control+2', asd <= csd + 2, `armed=${asd} control=${csd}`);
  const cm = med(C, 'gameDays'), am = med(A, 'gameDays');
  verdict('GUARD median>=control-10d', am >= cm - 10, `armed=${am} control=${cm}`);
  const cn = sum(C, 'national'), an = sum(A, 'national');
  verdict('GUARD national>=control-2', an >= cn - 2, `armed=${an}/16 control=${cn}/16`);
}
// new death mode (n>=3): any cause with >=3 armed deaths absent from control
{
  const ck = {}, ak = {};
  for (const r of C) for (const [k, n] of Object.entries(r.deaths || {})) ck[k] = (ck[k] || 0) + n;
  for (const r of A) for (const [k, n] of Object.entries(r.deaths || {})) ak[k] = (ak[k] || 0) + n;
  const novel = Object.keys(ak).filter(k => ak[k] >= 3 && !(ck[k] >= 1));
  verdict('GUARD no new death mode', novel.length === 0, novel.length ? `novel: ${novel.join(',')}` : 'none');
}

console.log(go ? '\nOVERALL: GO' : '\nOVERALL: NO-GO (kill per protocol)');
process.exit(go ? 0 : 1);
