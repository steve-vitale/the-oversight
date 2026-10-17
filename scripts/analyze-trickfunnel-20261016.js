#!/usr/bin/env node
// analyze-trickfunnel-20261016.js — aggregate the sim-trickfunnel census
// per-seed JSONs into the funnel table per perform-kind.
// Usage: node scripts/analyze-trickfunnel-20261016.js [glob]
// Default glob: evidence/2026-10-16/perseed-trickfunnel/*.json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const GLOB = process.argv[2] || path.join(ROOT, 'evidence', '2026-10-16', 'perseed-trickfunnel', '*.json');

function globFiles(g) {
  const dir = path.dirname(g);
  const base = path.basename(g).replace(/\*/g, '.*');
  const re = new RegExp('^' + base + '$');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => re.test(f)).map(f => path.join(dir, f)).sort();
}

const files = globFiles(GLOB);
if (!files.length) { console.error('no per-seed files'); process.exit(2); }

const agg = {}; // kind -> funnel counts
const speciesAgg = {}; // mid -> funnel counts
let nRuns = 0, nTbFights = 0, nRows = 0, nUnattr = 0;
let national = 0, table = 0, won = 0, w4 = 0, w5 = 0;
let daysSum = 0, daysN = 0;
const byVia = {};
const monsterCountersAll = new Set();

function bump(o, r) {
  o.contact += r.contact;
  o.known += r.known_at_start || 0;
  o.cond += r.condition_met;
  o.perf += r.performed;
  o.attr += r.kill_attributed;
  o.surv += r.survived || 0;
  o.dism += r.dismissed;
  o.unattr += r.unattributed;
}

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  nRuns++;
  nTbFights += j.nTbFights || 0;
  nRows += j.nFunnelRows || 0;
  nUnattr += j.nUnattributed || 0;
  national += j.national || 0; table += j.table || 0; won += j.won || 0;
  w4 += j.wave4Reached || 0; w5 += j.wave5Reached || 0;
  daysSum += j.days || 0; daysN++;
  for (const d of (j.discoveries || [])) byVia[d.via || '?'] = (byVia[d.via || '?'] || 0) + 1;
  for (const m of (j.monsterCounters || [])) monsterCountersAll.add(m);
  for (const r of (j.rows || [])) {
    const k = r.kind || 'unknown';
    const a = agg[k] || (agg[k] = { contact: 0, known: 0, cond: 0, perf: 0, attr: 0, surv: 0, dism: 0, unattr: 0, species: {} });
    bump(a, r);
    a.species[r.mid] = (a.species[r.mid] || 0) + 1;
    const s = speciesAgg[r.mid] || (speciesAgg[r.mid] = { contact: 0, known: 0, cond: 0, perf: 0, attr: 0, surv: 0, dism: 0, unattr: 0, kind: k });
    bump(s, r);
  }
}

console.log(`# trickfunnel census — ${nRuns} runs, ${nTbFights} TB fights, ${nRows} funnel rows, ${nUnattr} unattributed`);
console.log(`# wall: national ${national}/${nRuns}, table ${table}/${nRuns}, wins ${won}/${nRuns}, wave4 ${w4}/${nRuns}, wave5 ${w5}/${nRuns}, mean days ${(daysSum / Math.max(1, daysN)).toFixed(1)}`);
console.log(`# discoveries by via: ${JSON.stringify(byVia)}`);
console.log(`# counters known (union): ${monsterCountersAll.size} — ${Array.from(monsterCountersAll).sort().join(', ')}`);
console.log('');
console.log('kind               | contact | known | cond_met | performed | attributed | survived | dismissed | unattr | widest gap');
console.log('-------------------+---------+-------+----------+-----------+------------+----------+-----------+--------+-----------');
const kinds = Object.keys(agg).sort((a, b) => agg[b].contact - agg[a].contact);
for (const k of kinds) {
  const a = agg[k];
  const gaps = [
    ['contact->known', a.contact - a.known],
    ['known->cond', a.known - a.cond],
    ['cond->perf', a.cond - a.perf],
    ['perf->attr', a.perf - a.attr],
  ];
  gaps.sort((x, y) => y[1] - x[1]);
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`${pad(k, 18)} | ${pad(a.contact, 7)} | ${pad(a.known, 5)} | ${pad(a.cond, 8)} | ${pad(a.perf, 9)} | ${pad(a.attr, 10)} | ${pad(a.surv, 8)} | ${pad(a.dism, 9)} | ${pad(a.unattr, 6)} | ${gaps[0][0]} (-${gaps[0][1]})`);
}
console.log('');
console.log('per-species detail (contact/known/cond/perf/attr):');
const mids = Object.keys(speciesAgg).sort((a, b) => speciesAgg[b].contact - speciesAgg[a].contact);
for (const m of mids) {
  const s = speciesAgg[m];
  console.log(`  ${m} [${s.kind}]: ${s.contact}/${s.known}/${s.cond}/${s.perf}/${s.attr} surv=${s.surv} dism=${s.dism} unattr=${s.unattr}`);
}
console.log('');
console.log(`PRIMARY (diagnostic GO): 100% attribution — ${nUnattr} unattributed rows across ${nRows} funnel rows => ${nUnattr === 0 ? 'GO' : 'NO-GO'}`);

// Integrity: on the engine, condition_met ⇒ performed (the push IS the hit
// record). Any cond=1/perf=0 row is an engine bug — flag it loud.
let condNotPerf = 0;
const condNotPerfRows = [];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of (j.rows || [])) {
    if (r.condition_met === 1 && r.performed === 0) {
      condNotPerf++;
      if (condNotPerfRows.length < 10) condNotPerfRows.push(`${path.basename(f)} seq=${r.fightSeq} ${r.mid}[${r.kind}]`);
    }
  }
}
console.log(`INTEGRITY: condition_met=1 but performed=0 rows: ${condNotPerf}${condNotPerf ? ' — ENGINE BUG, see: ' + condNotPerfRows.join(' | ') : ' (none — the hit⇒push invariant holds)'}`);
