#!/usr/bin/env node
// scripts/analyze-performretire-20261017.js — paired per-seed diffs for the
// sim-performretire pilot (complements the sweep's pooled verdict).
// Usage: PERSEED=evidence/2026-10-17/perseed-performretire node scripts/analyze-performretire-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.env.PERSEED || 'evidence/2026-10-17/perseed-performretire';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const by = {};
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const key = (r.gate === '1' ? 'a' : 'c') + ':' + r.seed + ':' + (r.policy.includes('belong') ? 'belong' : 'lead');
  by[key] = r;
}
const seeds = [...new Set(files.map(f => f.match(/s(\d+)\.json/)[1]))].sort();
console.log('seed | policy | perfDeaths(c->a) | routedRate(c->a) | attr(c->a) | nat(c->a) | retires');
let totDeaths = 0, totAttr = 0, totNat = 0;
for (const pol of ['lead', 'belong']) {
  for (const sd of seeds) {
    const c = by['c:' + sd + ':' + pol], a = by['a:' + sd + ':' + pol];
    if (!c || !a) { console.log(`  MISSING ${pol} s${sd}`); continue; }
    const dd = a.perfDeaths - c.perfDeaths, da = a.attr - c.attr, dn = a.national - c.national;
    totDeaths += dd; totAttr += da; totNat += dn;
    console.log(`s${sd} | ${pol.padEnd(6)} | ${String(c.perfDeaths).padStart(2)} -> ${String(a.perfDeaths).padStart(2)} (${dd >= 0 ? '+' : ''}${dd}) | ` +
      `${c.routedRate} -> ${a.routedRate} | fled ${c.fledRate} -> ${a.fledRate} | ${c.attr} -> ${a.attr} (${da >= 0 ? '+' : ''}${da}) | ${c.national} -> ${a.national} (${dn >= 0 ? '+' : ''}${dn}) | ${a.retires}`);
  }
}
console.log(`\nPOOLED paired sums: perfDeaths diff ${totDeaths >= 0 ? '+' : ''}${totDeaths} (GO needs <= -3) | attr diff ${totAttr >= 0 ? '+' : ''}${totAttr} (guard >= -2) | national diff ${totNat >= 0 ? '+' : ''}${totNat} (guard >= -2)`);
