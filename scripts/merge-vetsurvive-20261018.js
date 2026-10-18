#!/usr/bin/env node
// merge-vetsurvive-20261018.js — merge the 4 parallel pilot batches into
// the single sweep-vetsurvive.json summary.
// Usage: node scripts/merge-vetsurvive-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = 'evidence/2026-10-18';
const PERSEED_DIR = path.join(DIR, 'perseed-vetsurvive');

const rows = [];
// Read per-seed JSONs directly (robust to killed/partial batches).
for (const f of fs.readdirSync(PERSEED_DIR)) {
  if (!f.endsWith('.json')) continue;
  try {
    const r = JSON.parse(fs.readFileSync(path.join(PERSEED_DIR, f), 'utf8'));
    if (r && r.seed && !r.error) rows.push(r);
  } catch (e) {}
}
if (!rows.length) { console.error('no per-seed rows'); process.exit(2); }

// paired summary (same logic as the sweep)
const pairs = [];
const seeds = [...new Set(rows.map(r => r.seed))].sort((a, b) => a - b);
for (const seed of seeds) {
  for (const pname of ['lead', 'belong']) {
    const c = rows.find(r => r.seed === seed && r.policyBase === pname && r.armKey === 'control');
    const a = rows.find(r => r.seed === seed && r.policyBase === pname && r.armKey === 'armed');
    if (c && a && !c.error && !a.error) pairs.push({ seed, pname, c, a });
  }
}
const sum = { armed: { w4: 0, national: 0, starve: 0, vetDeaths: 0, days: [] },
              control: { w4: 0, national: 0, starve: 0, vetDeaths: 0, days: [] } };
for (const p of pairs) {
  for (const [k, r] of [['armed', p.a], ['control', p.c]]) {
    sum[k].w4 += r.w4unlock | 0;
    sum[k].national += r.national | 0;
    sum[k].starve += r.starveDeaths | 0;
    sum[k].vetDeaths += r.vetDeaths | 0;
    sum[k].days.push(r.days | 0);
  }
}
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
const w4diff = sum.armed.w4 - sum.control.w4;

// new-death-mode check: cause sets armed vs control (person deaths, n>=3)
const causes = { armed: {}, control: {} };
for (const p of pairs) {
  for (const [k, r] of [['armed', p.a], ['control', p.c]]) {
    for (const [cause, n] of Object.entries(r.deathCauses || {})) {
      causes[k][cause] = (causes[k][cause] || 0) + n;
    }
  }
}
const newModes = Object.keys(causes.armed).filter(c => (causes.armed[c] | 0) >= 3 && !(causes.control[c] | 0));

const summary = {
  seeds, days: 180, pairs: pairs.length,
  w4: { armed: sum.armed.w4, control: sum.control.w4, diff: w4diff, GO: w4diff >= 3 },
  national: { armed: sum.armed.national, control: sum.control.national },
  starveDeaths: { armed: sum.armed.starve, control: sum.control.starve },
  vetDeaths: { armed: sum.armed.vetDeaths, control: sum.control.vetDeaths },
  medianDays: { armed: med(sum.armed.days), control: med(sum.control.days) },
  newDeathModes: newModes,
  causeSets: causes,
};
console.log(`pairs: ${pairs.length}`);
console.log(`PRIMARY w4 unlocks: armed=${sum.armed.w4} control=${sum.control.w4} diff=${w4diff} bar>=+3 -> ${w4diff >= 3 ? 'GO' : 'NO-GO (KILL)'}`);
console.log(`national: armed=${sum.armed.national} control=${sum.control.national} (guardrail >= control-2)`);
console.log(`starvation deaths: armed=${sum.armed.starve} control=${sum.control.starve} (guardrail <= control+1)`);
console.log(`veteran deaths: armed=${sum.armed.vetDeaths} control=${sum.control.vetDeaths}`);
console.log(`median days: armed=${med(sum.armed.days)} control=${med(sum.control.days)} (guardrail >= control-10)`);
console.log(`new death modes (n>=3): ${newModes.length ? newModes.join(', ') : 'none'}`);
fs.writeFileSync(path.join(DIR, 'sweep-vetsurvive.json'), JSON.stringify({ summary, rows }, null, 1));
console.log(`wrote ${DIR}/sweep-vetsurvive.json`);
