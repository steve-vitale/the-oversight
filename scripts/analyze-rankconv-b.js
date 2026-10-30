#!/usr/bin/env node
// analyze-rankconv-b.js — pure-JSON aggregation over test-rankconv-b.js
// per-seed outputs. No harness, no Game, no RNG: it only reads JSON and
// prints the census table + wall numbers. Usage:
//   node scripts/analyze-rankconv-b.js <glob-dir> <prefix>...
// e.g. node scripts/analyze-rankconv-b.js evidence/2026-10-30 sim-rankconv-b-pilot-
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const prefixes = process.argv.slice(3);
const files = fs.readdirSync(dir).filter((f) => prefixes.some((p) => f.startsWith(p)) && f.endsWith('.json')).sort();
if (!files.length) { console.error('no files'); process.exit(1); }
const rows = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
console.log('seed days end rank standing(war/dipl/plenty) links seasoned polity wave table won blocker verbs');
for (const r of rows) {
  const st = r.endStanding || {};
  const pol = r.endGate.havenPolity ? r.endGate.havenPolity.shape : 'null';
  console.log(`${r.seed} ${r.days} ${r.endReason} ${r.endRank} ${st.total}(${st.war}/${st.diplomacy}/${st.plenty}) ${r.endGate.linksActive} ${r.endGate.linksSeasoned} ${pol} ${r.maxWaveUnlocked} ${r.tableWaiting ? 'inv' : '-'}/${r.tableEntered ? 'sat' : '-'} ${r.won ? 1 : 0} ${r.classification.blocker} ${JSON.stringify(r.verbCounts)}`);
}
const n = rows.length;
const nat = rows.filter((r) => r.endRank === 'national' || r.endRank === 'global').length;
const reg = rows.filter((r) => r.endRank === 'regional').length;
const wins = rows.filter((r) => r.won).length;
const tab = rows.filter((r) => r.tableWaiting).length;
const sat = rows.filter((r) => r.tableEntered).length;
const w4 = rows.filter((r) => r.maxWaveUnlocked >= 4).length;
const w5 = rows.filter((r) => r.maxWaveUnlocked >= 5).length;
console.log(`\nWALL n=${n} national=${nat} regional=${reg} tableInv=${tab} tableSat=${sat} wins=${wins} wave4=${w4} wave5=${w5} medianDays=${med(rows.map((r) => r.days))} maxDays=${Math.max(...rows.map((r) => r.days))}`);
const blocks = {};
for (const r of rows) blocks[r.classification.blocker] = (blocks[r.classification.blocker] || 0) + 1;
console.log('blockers: ' + JSON.stringify(blocks));
const dk = {};
for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) dk[k] = (dk[k] || 0) + v;
console.log('deaths: ' + JSON.stringify(dk));
const allClassified = rows.filter((r) => r.endRank === 'village').every((r) => r.classification && r.classification.evidence && r.classification.evidence.length > 0);
console.log('village-ranked seeds all classified with cited evidence: ' + allClassified);
