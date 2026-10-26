#!/usr/bin/env node
// analyze-eggroad-a-20261026.js — eggroad pilot analyzer (sim-eggroad-a).
// Reads evidence/2026-10-26/perseed-eggroad-a/*.json, prints the chain
// table per seed and names the binding gate: the first chain link that
// fails on the most seeds. Pure read; writes nothing.
// Usage: node scripts/analyze-eggroad-a-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-eggroad-a');

const LINKS = [
  ['window', (c) => c.announceDay != null],
  ['seat', (c) => c.seat === 'lesser' || c.seat === 'full'],
  ['overtime-tier3', (c) => (c.overtimeTier | 0) >= 3],
  ['herald-slain', (c) => !!c.titans.herald.slain],
  ['apocalypse-slain', (c) => !!(c.titans.nielsen.slain || c.titans.finale.slain)],
  ['all-three-slain', (c) => !!(c.titans.herald.slain && c.titans.nielsen.slain && c.titans.finale.slain)],
  ['network-summoned', (c) => !!c.networkSummoned],
  ['network-fallen', (c) => !!c.networkFallen],
  ['hosts-offered', (c) => c.hostsOfferedDay != null],
];
function main() {
  if (!fs.existsSync(DIR)) { console.log('no per-seed files yet'); return; }
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
  if (!files.length) { console.log('no per-seed files yet'); return; }
  const rows = [];
  for (const f of files) {
    const m = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const c = m.census || m.result || {};
    rows.push({ seed: m.seed, c });
  }
  console.log('seed | announce seat tier wave scale | H omen/ready/slain | N omen/slain | F omen/slain | net summ/fall | end');
  for (const r of rows) {
    const c = r.c;
    const t = c.titans || {};
    const th = t.herald || {}, tn = t.nielsen || {}, tf = t.finale || {};
    console.log(`${r.seed} | ann=${c.announceDay} seat=${c.seat} tier=${c.overtimeTier} wave=${c.unlockedWave} scale=${c.scaleRank} | H ${th.omenStage}/${th.ready ? 'R' : '-'} /${th.slain ? 'SLAIN' : '-'} | N ${tn.omenStage}/${tn.slain ? 'SLAIN' : '-'} | F ${tf.omenStage}/${tf.slain ? 'SLAIN' : '-'} | net ${c.networkSummoned ? 'SUMM' : '-'}/${c.networkFallen ? 'FALL' : '-'} | ${c.endReason}`);
  }
  console.log('\nlink pass counts (of ' + rows.length + '):');
  let binding = null;
  for (const [name, fn] of LINKS) {
    let n = 0;
    for (const r of rows) { try { if (fn(r.c)) n++; } catch (e) {} }
    console.log(`  ${name}: ${n}/${rows.length}`);
    if (!binding && n < rows.length) binding = { link: name, passed: n, total: rows.length };
  }
  console.log('\nPRIMARY (network summoned >=1): ' + (rows.some(r => r.c.networkSummoned) ? 'GO' : 'NO-GO'));
  console.log('GUARD (window reached >=5 or honest non-table resolution): ' + (rows.filter(r => r.c.announceDay != null).length) + '/' + rows.length + ' reached window');
  if (binding) console.log('BINDING GATE: ' + binding.link + ' (' + binding.passed + '/' + binding.total + ' pass)');
  // per-seed binding detail: first failing link per seed
  console.log('\nfirst failing link per seed:');
  for (const r of rows) {
    let first = 'none (full chain)';
    for (const [name, fn] of LINKS) { try { if (!fn(r.c)) { first = name; break; } } catch (e) { first = name + ' (read-err)'; break; } }
    const c = r.c;
    console.log(`  ${r.seed}: ${first} | ready5=${JSON.stringify(c.ready5)} standing=${c.standing ? JSON.stringify(c.standing) : null} livingVets=${c.livingVeterans} vetKillers=${c.veteranKillers}`);
  }
}
main();
