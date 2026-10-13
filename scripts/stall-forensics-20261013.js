#!/usr/bin/env node
// stall-forensics-20261013.js — for each of the 7 stall stretches from
// sim-action-telemetry.md, break the action budget down by SPECIFIC verb and
// origin (policy=deliberate / driver=harness / internal=game code).
// Reads evidence/2026-10-13/sim-action-telemetry.json perDay[].acts.
// Writes evidence/2026-10-13/sim-stall-forensics.json (raw numbers).
'use strict';
const fs = require('fs');
const path = require('path');

const J = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'evidence', '2026-10-13', 'sim-action-telemetry.json'), 'utf8'));

// The 7 stall stretches, exactly as reported in sim-action-telemetry.md.
const STRETCHES = [
  { policy: 'competent', seed: 11, from: 78, to: 84 },
  { policy: 'winseek', seed: 33, from: 35, to: 41 },
  { policy: 'belongseek', seed: 11, from: 57, to: 63 },
  { policy: 'belongseek', seed: 33, from: 60, to: 66 },
  { policy: 'belongseek', seed: 77, from: 29, to: 35 },
  { policy: 'leadcourt', seed: 11, from: 86, to: 92 },
  { policy: 'leadcourt', seed: 33, from: 72, to: 78 },
];

const rowFor = (p, s) => J.rows.find(r => r.policy === p && r.seed === s);
const out = { stretches: [], aggregate: {} };
const agg = {}; // "origin:verb" -> total across stretches

for (const st of STRETCHES) {
  const row = rowFor(st.policy, st.seed);
  if (!row) { console.error('MISSING ROW', st.policy, st.seed); process.exit(1); }
  const days = (row.pacing.perDay || []).filter(d => d.day >= st.from && d.day <= st.to);
  const byVerb = {};
  let totDelib = 0, totDriver = 0, totInternal = 0, nDays = 0;
  for (const d of days) {
    nDays++;
    for (const [k, v] of Object.entries(d.acts || {})) {
      const [origin, ...rest] = k.split(':');
      const verb = rest.join(':');
      byVerb[k] = (byVerb[k] || 0) + v;
      agg[k] = (agg[k] || 0) + v;
      if (origin === 'policy') totDelib += v;
      else if (origin === 'driver') totDriver += v;
      else totInternal += v;
    }
  }
  const total = totDelib + totDriver + totInternal;
  const sorted = Object.entries(byVerb).sort((a, b) => b[1] - a[1]);
  out.stretches.push({
    ...st, days: nDays,
    totalActs: total,
    perDay: +(total / Math.max(1, nDays)).toFixed(1),
    deliberate: totDelib, driver: totDriver, internal: totInternal,
    delibShare: +(totDelib / Math.max(1, total)).toFixed(3),
    topVerbs: sorted.slice(0, 12).map(([k, v]) => ({ verb: k, n: v, share: +(v / total).toFixed(3) })),
  });
  console.log(`\n== ${st.policy}/s${st.seed} days ${st.from}-${st.to} (${nDays}d): ${total} acts, ${+(total / Math.max(1, nDays)).toFixed(1)}/day`);
  console.log(`   deliberate(policy)=${totDelib} driver=${totDriver} internal=${totInternal} | delib share=${(100 * totDelib / Math.max(1, total)).toFixed(1)}%`);
  for (const [k, v] of sorted.slice(0, 12)) {
    console.log(`   ${String(v).padStart(4)}  ${(100 * v / total).toFixed(1).padStart(5)}%  ${k}`);
  }
}

// Cross-stretch aggregate: top verbs overall, with origin split per verb.
const byVerbOrigin = {};
for (const [k, v] of Object.entries(agg)) {
  const [origin, ...rest] = k.split(':');
  const verb = rest.join(':');
  byVerbOrigin[verb] = byVerbOrigin[verb] || { policy: 0, driver: 0, internal: 0, total: 0 };
  byVerbOrigin[verb][origin] = (byVerbOrigin[verb][origin] || 0) + v;
  byVerbOrigin[verb].total += v;
}
const grand = Object.values(agg).reduce((a, b) => a + b, 0);
const ranked = Object.entries(byVerbOrigin).sort((a, b) => b[1].total - a[1].total);
out.aggregate = { grandTotal: grand, byVerb: ranked.map(([verb, o]) => ({ verb, ...o, share: +(o.total / grand).toFixed(4) })) };

console.log(`\n== CROSS-STRETCH AGGREGATE (${grand} acts over 7 stretches x 7 days)`);
console.log('   verb                          total   share    policy  driver  internal');
for (const [verb, o] of ranked.slice(0, 20)) {
  console.log(`   ${verb.padEnd(28)} ${String(o.total).padStart(5)}  ${(100 * o.total / grand).toFixed(1).padStart(5)}%  ${String(o.policy).padStart(6)}  ${String(o.driver).padStart(6)}  ${String(o.internal).padStart(8)}`);
}
// Origin totals across stretches
let p = 0, dr = 0, it = 0;
for (const o of Object.values(byVerbOrigin)) { p += o.policy; dr += o.driver; it += o.internal; }
out.aggregate.originTotals = { policy: p, driver: dr, internal: it };
console.log(`\n   ORIGIN TOTALS: deliberate(policy)=${p} (${(100 * p / grand).toFixed(1)}%) driver=${dr} internal=${it} (${(100 * it / grand).toFixed(1)}%)`);

fs.writeFileSync(
  path.join(__dirname, '..', 'evidence', '2026-10-13', 'sim-stall-forensics.json'),
  JSON.stringify(out, null, 1));
console.log('\nwrote evidence/2026-10-13/sim-stall-forensics.json');
