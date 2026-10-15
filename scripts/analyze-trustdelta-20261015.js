#!/usr/bin/env node
// analyze-trustdelta-20261015.js — decomposition tables for the
// trust-delta-by-source sweep. Reads evidence/2026-10-15/perseed-trustdelta/
// run-*.json, prints: per-policy source mix, pooled detail ranking, the
// trusthalf/mealonly divergence decomposition, channel census
// (gift/comfort/amends/teach/feast/meal fires), gossip check, wall numbers.
// Usage: node scripts/analyze-trustdelta-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-trustdelta');

const files = fs.readdirSync(EVID).filter(f => f.startsWith('run-') && f.endsWith('.json'));
// drop short smoke runs (<=30d) when full runs exist
const allRows = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
const fullRows = allRows.filter(r => r.days > 30);
const rows = fullRows.length >= 20 ? fullRows : allRows;
console.log(`runs: ${rows.length}`);

const policies = [...new Set(rows.map(r => r.policyId))];
for (const p of policies) {
  const rs = rows.filter(r => r.policyId === p);
  console.log(`\n===== ${p} (n=${rs.length}) =====`);
  const bySource = {}, byDetail = {};
  let ticks = 0, named = 0, viol = 0, recon = 0, errs = 0;
  for (const r of rs) {
    ticks += r.trust.nTicks; viol += r.trust.gossipViolations;
    recon += r.trust.reconMismatched; errs += r.trust.instrErrors;
    for (const [s, v] of Object.entries(r.trust.bySource)) {
      const a = bySource[s] || (bySource[s] = { n: 0, pos: 0, neg: 0 });
      a.n += v.n; a.pos += v.pos; a.neg += v.neg;
      if (s !== 'other') named += v.n;
    }
    for (const [d, v] of Object.entries(r.byDetail)) {
      const a = byDetail[d] || (byDetail[d] = { n: 0, pos: 0, neg: 0 });
      a.n += v.n; a.pos += v.pos; a.neg += v.neg;
    }
  }
  console.log(`ticks=${ticks} named-category=${(named / ticks * 100).toFixed(1)}% gossipViol=${viol} reconMismatch=${recon} instrErr=${errs}`);
  console.log('--- by source (net = pos+neg) ---');
  for (const [s, v] of Object.entries(bySource).sort((a, b) => (b[1].pos + b[1].neg) - (a[1].pos + a[1].neg)))
    console.log(`  ${String(v.n).padStart(5)} net=${String(v.pos + v.neg).padStart(6)} (+${v.pos}/-${-v.neg}) ${s}`);
  console.log('--- top details ---');
  for (const [d, v] of Object.entries(byDetail).sort((a, b) => b[1].n - a[1].n).slice(0, 18))
    console.log(`  ${String(v.n).padStart(5)} net=${String(v.pos + v.neg).padStart(6)} (+${v.pos}/-${-v.neg}) ${d.slice(0, 70)}`);
}

// channel census: the dead-channel question
console.log('\n===== CHANNEL CENSUS (fires across all runs) =====');
const chan = {};
for (const r of rows) for (const [d, v] of Object.entries(r.byDetail)) {
  const kl = d.toLowerCase();
  const hit = /donat/.test(kl) ? 'donations'
    : /givefood|fooddeed/.test(kl) ? 'giveFood(personal gift)'
    : /feast/.test(kl) ? 'feast'
    : /villagemeal/.test(kl) ? 'meal'
    : /amend/.test(kl) ? 'amends'
    : /comfort/.test(kl) ? 'comfort'
    : /teach|learntechnique|share_knowledge/.test(kl) ? 'teaching'
    : /mediat/.test(kl) ? 'mediate'
    : null;
  if (hit) { const c = chan[hit] || (chan[hit] = { n: 0, pos: 0, neg: 0 }); c.n += v.n; c.pos += v.pos; c.neg += v.neg; }
}
for (const [k, v] of Object.entries(chan).sort((a, b) => b[1].n - a[1].n))
  console.log(`  ${String(v.n).padStart(5)} net=${String(v.pos + v.neg).padStart(6)} ${k}`);
for (const k of ['giveFood(personal gift)', 'amends', 'comfort', 'teaching', 'meal', 'mediate'])
  if (!chan[k]) console.log(`        0 net=     0 ${k} — ZERO FIRES`);

// wall
console.log('\n===== WALL =====');
const W = { national: 0, table: 0, won: 0, maxWave: 0 };
const deaths = {};
for (const r of rows) {
  W.national += r.national; W.table += r.tableWaiting ? 1 : 0; W.won += r.won ? 1 : 0;
  W.maxWave = Math.max(W.maxWave, r.maxWave);
  for (const [k, v] of Object.entries(r.deaths)) deaths[k] = (deaths[k] || 0) + v;
}
const days = rows.map(r => r.days).sort((a, b) => a - b);
console.log(`national ${W.national}/${rows.length}  table ${W.table}/${rows.length}  won ${W.won}/${rows.length}  maxWave ${W.maxWave}  medianDays ${days[Math.floor(days.length / 2)]}  maxDays ${days[days.length - 1]}`);
console.log('death causes: ' + Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}=${v}`).join(', '));
