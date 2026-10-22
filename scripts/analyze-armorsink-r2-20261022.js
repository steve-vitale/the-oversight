#!/usr/bin/env node
// analyze-armorsink-r2-20261022.js — ledger report for the sim-armorsink-r2
// sweep (flesh-out loop, run fleshout-20261022T0415Z, axis scale-onramp).
//
// Reads evidence/2026-10-22/perseed-armorsink-r2/ledger/<policy>/s<seed>.json
// and prints the worn-armor mortality-sink ledger:
//   1. corpus integrity (16/16, instrumentErrors)
//   2. P>=15 PRODUCTION by how/who/item
//   3. SINK events by kind
//   4. armor-bearing deaths: who died in what, each piece's fate
//   5. corpse fates
//   6. defer5 re-binds involving armor
//   7. DIAG-GO verdict (0 unexplained)
//   8. wall numbers
//   9. sense-test: 2 armor-bearing deaths with their say-context
//
// Usage: node scripts/analyze-armorsink-r2-20261022.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-armorsink-r2', 'ledger');

const runs = [];
for (const pol of fs.readdirSync(DIR)) {
  const pd = path.join(DIR, pol);
  if (!fs.statSync(pd).isDirectory()) continue;
  for (const f of fs.readdirSync(pd)) {
    if (!/^s\d+\.json$/.test(f)) continue;
    runs.push(JSON.parse(fs.readFileSync(path.join(pd, f), 'utf8')));
  }
}
if (!runs.length) { console.error('no per-seed JSONs'); process.exit(2); }
runs.sort((a, b) => (a.policyId === b.policyId) ? a.seed - b.seed : (a.policyId < b.policyId ? -1 : 1));
const L = (r) => (r.ledger || {});
const N = runs.length;

console.log('=== 1. CORPUS INTEGRITY ===');
const bad = runs.filter(r => (r.instrumentErrors | 0) > 0);
console.log(`  runs: ${N}/16, instrumentErrors>0: ${bad.length}`);
for (const r of bad) console.log(`    s${r.seed}/${r.policyId}: ${r.instrumentErrors} — ${r.instrumentErrorList.join('; ')}`);

console.log('\n=== 2. P>=15 PRODUCTION (by how) ===');
const prodByHow = {}, prodByItem = {};
let prodTotal = 0;
for (const r of runs) for (const p of (L(r).production || [])) {
  const u = (p.units | 0) || 1; prodTotal += u;
  prodByHow[p.how] = (prodByHow[p.how] || 0) + u;
  const k = `${p.itemId} (P${p.P})`;
  prodByItem[k] = (prodByItem[k] || 0) + u;
}
for (const [k, n] of Object.entries(prodByHow).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
console.log(`  TOTAL: ${prodTotal} pieces across ${N} runs`);
console.log('  by item:');
for (const [k, n] of Object.entries(prodByItem).sort((a, b) => b[1] - a[1])) console.log(`    ${k}: ${n}`);

console.log('\n=== 3. SINK EVENTS (by kind) ===');
const sinkByKind = {};
let sinkTotal = 0;
for (const r of runs) for (const e of (L(r).sinkEvents || [])) {
  sinkByKind[e.kind] = (sinkByKind[e.kind] || 0) + 1; sinkTotal++;
}
for (const [k, n] of Object.entries(sinkByKind).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
console.log(`  TOTAL: ${sinkTotal} sunk pieces`);
const ret = runs.reduce((t, r) => t + (L(r).returnEvents || []).filter(e => e.kind === 'corpse-loot').length, 0);
console.log(`  corpse-loot returns: ${ret}`);

console.log('\n=== 4. ARMOR-BEARING DEATHS ===');
let armorDeaths = 0;
const fates = {};
for (const r of runs) {
  for (const d of (L(r).deaths || [])) {
    const pieces = [...(d.vanished || []), ...(d.packed || [])];
    if (!pieces.length) continue;
    armorDeaths++;
    console.log(`  s${r.seed}/${r.policyId} d${d.day}: ${d.name} (${d.isScholar ? 'scholar' : 'villager'}, ${d.cause})`);
    for (const p of (d.vanished || [])) { console.log(`    VANISHED: ${p.name} P${p.P}`); fates['worn-vanished'] = (fates['worn-vanished'] || 0) + 1; }
    for (const p of (d.packed || [])) {
      // piece fate from the corpse track
      const tr = (L(r).corpseTracks || {})[d.corpseId];
      const tp = tr && (tr.packArmor || []).find(x => x.itemId === p.itemId);
      let fate = 'pack-unresolved';
      if (tp) fate = tp.unexplained ? 'pack-left-unexplained' : tp.looted ? 'pack-looted-returned' : tp.sunk ? 'pack-buried' : (tr.endState === 'buried' ? 'pack-buried' : tr.endState === 'gone' ? 'pack-decayed' : 'pack-unlooted-at-end');
      console.log(`    PACKED: ${p.name} P${p.P} -> ${fate}`);
      fates[fate] = (fates[fate] || 0) + 1;
    }
  }
}
console.log(`  armor-bearing deaths: ${armorDeaths}`);
console.log('  piece fates:', JSON.stringify(fates));

console.log('\n=== 5. CORPSE FATES (tracked corpses with armor) ===');
const cf = {};
for (const r of runs) for (const cid of Object.keys((L(r).corpseTracks || {}))) {
  const t = L(r).corpseTracks[cid];
  const k = t.buried ? 'buried' : t.gone ? 'gone' : 'exists';
  cf[k] = (cf[k] || 0) + 1;
}
console.log('  ' + JSON.stringify(cf));

console.log('\n=== 6. DEFER5 RE-BINDS ===');
let binds = 0, rebinds = 0, armorBinds = 0;
for (const r of runs) for (const b of (L(r).rebinds || [])) {
  binds++;
  if (b.rebind) rebinds++;
  if (b.armorInvolved) { armorBinds++; console.log(`  s${r.seed}/${r.policyId} d${b.bindDay}: ${b.rebind ? 'RE-BIND' : 'bind'} armor-involved (short: ${b.short.join(',')}, armored=${b.armored}, veterans=${b.veterans})`); }
}
console.log(`  binds: ${binds}, re-binds: ${rebinds}, armor-involved: ${armorBinds}`);

console.log('\n=== 7. DIAG-GO VERDICT ===');
let unexpl = 0;
for (const r of runs) {
  const u = (L(r).unexplained || []);
  if (u.length) { unexpl += u.length; console.log(`  s${r.seed}/${r.policyId}: ${u.map(x => `${x.kind}:${x.itemId}x${x.unaccounted}`).join(', ')}`); }
}
console.log(`  unexplained events: ${unexpl} -> ${unexpl === 0 ? 'DIAG-GO' : 'DIAG-NO-GO (the miss is the finding)'}`);

console.log('\n=== 8. WALL NUMBERS ===');
const nat = runs.filter(r => r.national).length, tab = runs.filter(r => r.table).length, won = runs.filter(r => r.won).length;
const wr = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
for (const r of runs) for (let w = 1; w <= 5; w++) if ((r.maxWave || 1) >= w) wr[w]++;
const days = runs.map(r => r.gameDays | 0).sort((a, b) => a - b);
const med = (days[7] + days[8]) / 2;
const causes = {};
for (const r of runs) for (const [k, n] of Object.entries(r.deaths || {})) causes[k] = (causes[k] || 0) + n;
console.log(`  national ${nat}/${N} · table ${tab}/${N} · wins ${won}/${N}`);
console.log(`  wave reach: 1:${wr[1]} 2:${wr[2]} 3:${wr[3]} 4:${wr[4]} 5:${wr[5]}`);
console.log(`  survival days: median ${med}, max ${days[days.length - 1]}, min ${days[0]}`);
console.log('  death causes: ' + Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${k}=${n}`).join(' · '));

console.log('\n=== 9. SENSE-TEST (2 armor-bearing deaths, say-context) ===');
let shown = 0;
for (const r of runs) {
  for (const d of (L(r).deaths || [])) {
    if (shown >= 2) break;
    const pieces = [...(d.vanished || []), ...(d.packed || [])];
    if (!pieces.length || !(d.sayContext || []).length) continue;
    shown++;
    console.log(`\n  --- s${r.seed}/${r.policyId} d${d.day}: ${d.name} (${d.isScholar ? 'scholar' : 'villager'}) died ${d.cause}; worn: ${pieces.map(p => p.name + ' P' + p.P).join(', ')}`);
    for (const s of d.sayContext.slice(-12)) console.log(`  d${s.d} | ${s.text.slice(0, 160)}`);
  }
  if (shown >= 2) break;
}
if (!shown) console.log('  (no armor-bearing deaths with say-context in the corpus)');

if (process.argv.includes('--json')) {
  const rep = { runs: N, bad: bad.length, prodTotal, prodByHow, prodByItem, sinkTotal, sinkByKind, returns: ret, armorDeaths, fates, corpseFates: cf, binds, rebinds, armorBinds, unexplained: unexpl, wall: { nat, tab, won, wr, medDays: med, causes } };
  fs.writeFileSync(path.join(DIR, 'armorsink-report.json'), JSON.stringify(rep, null, 1));
  console.log('\nwrote ' + path.join(DIR, 'armorsink-report.json'));
}
