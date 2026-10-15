#!/usr/bin/env node
// compare-trusthalf-20261015.js — verdict for the trusthalf pilot.
// Reads evidence/2026-10-15/perseed-trusthalf/summary.json, applies the
// pre-registered PRIMARY / CO-PRIMARY / GUARDRAILS, prints the verdict.
// Usage: node scripts/compare-trusthalf-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-trusthalf');
const all = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));

const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
const med = (rs, k) => {
  const v = rs.map(r => r[k] || 0).sort((a, b) => a - b);
  return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};

function block(policyId) {
  const ctrl = all.filter(r => r.policyId === policyId && r.side === 'control' && !r.error);
  const armed = all.filter(r => r.policyId === policyId && r.side === 'armed' && !r.error);
  return { ctrl, armed };
}

let go = true;
const verdicts = [];
function verdict(name, ok, detail) {
  console.log(`  ${ok ? 'GO  ' : 'MISS'} ${name} — ${detail}`);
  verdicts.push({ name, ok, detail });
  if (!ok) go = false;
}

for (const policyId of ['belongseek', 'leadfeast']) {
  console.log(`\n=== ${policyId} (n=${block(policyId).ctrl.length}/${block(policyId).armed.length}) ===`);
  const { ctrl, armed } = block(policyId);
  const cs = sum(ctrl, 'starvedDays'), as = sum(armed, 'starvedDays');
  console.log(`  scholar-starved-days: control=${cs} armed=${as}`);
  console.log(`  trust>=30 days: control=${sum(ctrl, 'trustGe30')} armed=${sum(armed, 'trustGe30')}`);
  console.log(`  half-ration days: control=${sum(ctrl, 'halfRation')} armed=${sum(armed, 'halfRation')}`);
  console.log(`  hungryDays(kcal<1200): control=${sum(ctrl, 'hungry1200')} armed=${sum(armed, 'hungry1200')}`);
  console.log(`  mealKcal: control=${sum(ctrl, 'mealKcal')} armed=${sum(armed, 'mealKcal')}`);
  console.log(`  refused=${sum(armed, 'refused')} hatch=${sum(armed, 'hatchTakes')} gtrip=${sum(armed, 'guaranteeTrips')} gforaged=${sum(armed, 'guaranteeForaged')} gskip=${sum(armed, 'guaranteeSkipped')}`);
  console.log(`  takes lineage: control=${sum(ctrl, 'takesSum')} armed=${sum(armed, 'takesSum')}`);
  console.log(`  starveDeaths: control=${sum(ctrl, 'starveDeaths')} armed=${sum(armed, 'starveDeaths')}`);
  console.log(`  median survival: control=${med(ctrl, 'gameDays')} armed=${med(armed, 'gameDays')}`);
  console.log(`  national: control=${sum(ctrl, 'national')}/8 armed=${sum(armed, 'national')}/8`);
  console.log(`  table: control=${sum(ctrl, 'everTable')} armed=${sum(armed, 'everTable')}  won: ${sum(ctrl, 'won')}/${sum(armed, 'won')}`);
  console.log(`  maxWave: control=${Math.max(...ctrl.map(r => r.maxWave || 0))} armed=${Math.max(...armed.map(r => r.maxWave || 0))}`);
  console.log(`  exiled: control=${sum(ctrl, 'exiled')} armed=${sum(armed, 'exiled')}`);
}

console.log('\n=== PRE-REGISTERED VERDICT ===');
// PRIMARY: armed starvedDays <= 0.70 x control (pooled over both policies)
{
  const cs = sum(all.filter(r => r.side === 'control' && !r.error), 'starvedDays');
  const as = sum(all.filter(r => r.side === 'armed' && !r.error), 'starvedDays');
  if (cs < 8) {
    console.log(`  INFO-SKIP PRIMARY: control starvedDays=${cs} < 8 — ratio is noise-powered, question unanswerable`);
    verdicts.push({ name: 'PRIMARY (starvedDays<=0.70x)', ok: null, detail: `INFO-SKIP: control=${cs} < 8` });
  } else {
    verdict('PRIMARY (starvedDays<=0.70x)', as <= 0.70 * cs, `armed=${as} vs bar=${(0.70 * cs).toFixed(1)} (control=${cs})`);
  }
}
// CO-PRIMARY: trust>=30 days armed >= 1.10 x control
{
  const ct = sum(all.filter(r => r.side === 'control' && !r.error), 'trustGe30');
  const at = sum(all.filter(r => r.side === 'armed' && !r.error), 'trustGe30');
  verdict('CO-PRIMARY (trustGe30>=1.10x)', at >= 1.10 * ct, `armed=${at} vs bar=${(1.10 * ct).toFixed(1)} (control=${ct})`);
}
// GUARDRAILS (pooled)
{
  const csd = sum(all.filter(r => r.side === 'control' && !r.error), 'starveDeaths');
  const asd = sum(all.filter(r => r.side === 'armed' && !r.error), 'starveDeaths');
  verdict('GUARD starveDeaths<=control+2', asd <= csd + 2, `armed=${asd} control=${csd}`);
  const cm = med(all.filter(r => r.side === 'control' && !r.error), 'gameDays');
  const am = med(all.filter(r => r.side === 'armed' && !r.error), 'gameDays');
  verdict('GUARD median>=control-10d', am >= cm - 10, `armed=${am} control=${cm}`);
  const cn = sum(all.filter(r => r.side === 'control' && !r.error), 'national');
  const an = sum(all.filter(r => r.side === 'armed' && !r.error), 'national');
  verdict('GUARD national>=control-2', an >= cn - 2, `armed=${an}/16 control=${cn}/16`);
}
// no new death mode: any cause with n>=3 on armed that is 0 on control
{
  const ck = {}, ak = {};
  for (const r of all.filter(r => !r.error)) {
    const t = r.side === 'armed' ? ak : ck;
    for (const [k, v] of Object.entries(r.deaths || {})) t[k] = (t[k] || 0) + v;
  }
  const novel = Object.keys(ak).filter(k => ak[k] >= 3 && !(ck[k] > 0));
  verdict('GUARD no-new-death-mode(n>=3)', novel.length === 0,
    novel.length ? `NOVEL: ${novel.map(k => k + '=' + ak[k]).join(', ')}` : 'none');
  console.log('  death causes control:', JSON.stringify(ck));
  console.log('  death causes armed:  ', JSON.stringify(ak));
}
console.log(`\nOVERALL: ${go ? 'GO' : 'NO-GO'}${verdicts.some(v => v.ok === null) ? ' (with INFO-SKIP)' : ''}`);
