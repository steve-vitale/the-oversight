#!/usr/bin/env node
// scripts/finish-panels-shellrevive-b2.js — regenerate the §15 light panel JSONs
// for sim-shellrevive-b2 from all 32 per-seed files (used after the main sweep
// was timeout-killed 30/32 and the last two runs were finished targeted).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellrevive2');
const PANEL_OUT = path.join(__dirname, '..', 'evidence', '2026-10-17', 'panel-shellrevive2');
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const wallMetrics = ['national', 'table', 'wins', 'exiled', 'survivalDays', 'starvationDeaths', 'villagerStarvationDeaths', 'villStarvPre', 'villStarvTail'];
const armMetrics = ['shelledKcal', 'shelledKcalLean', 'shelledKcalFed', 'shellDays', 'scholarPantryTakes', 'villagerPantryTakes'];
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const all = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const rows = all.map(o => {
  const metrics = {};
  for (const m of wallMetrics.concat(armMetrics)) metrics[m] = num(o[m]) == null ? 0 : num(o[m]);
  return { seed: o.seed, policy: o.policyId, arm: o.arm, metrics };
});
for (const arm of ['control', 'armed']) {
  const armRows = rows.filter(r => r.arm === arm);
  const payload = {
    schema: 'shellrevive-b2-light-panel/1',
    note: 'Light panel: honest per-seed metrics from the sim-shellrevive-b2 revival sweep. NOT a balance-panel.js panel (no observer, no validity gates) — see metric review.',
    wallMetrics, armMetrics,
    rows: armRows,
  };
  fs.mkdirSync(PANEL_OUT, { recursive: true });
  fs.writeFileSync(path.join(PANEL_OUT, `${arm}.json`), JSON.stringify(payload, null, 1));
  console.log(`wrote ${arm}.json: ${armRows.length} rows`);
}
console.log('total rows:', rows.length);
