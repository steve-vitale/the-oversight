#!/usr/bin/env node
// summarize-dismissal-20261018.js — builds the b2 census tables and the
// counterfactual bar-flip summary from the sweep's per-seed JSONs.
// Pure read of the per-seed files; prints the census to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const { hpShape, counterfactual } = require('./analyze-dismissal-20261018');

const dir = process.env.PERSEED || 'evidence/2026-10-18/perseed-dismissal';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const b2 = [], all = [];
let unatt = 0, ierr = 0;
const wall = {};
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  unatt += r.unattributed | 0; ierr += r.instrumentErrors | 0;
  const side = r.gate === '1' ? 'armed' : 'control';
  const pol = r.policy.includes('belong') ? 'belong' : 'lead';
  wall[side] = wall[side] || { n: 0, national: 0, table: 0, wins: 0, lost: 0 };
  wall[side].n++; wall[side].national += r.national | 0; wall[side].table += r.table | 0;
  wall[side].wins += r.wins | 0;
  if (/village-lost|village-dead|pop-zero/.test(r.endReason || '')) wall[side].lost++;
  for (const row of (r.rows || [])) {
    all.push(Object.assign({ file: f, side: side, pol: pol }, row));
    if (row.cls === 'b2-dismissal') b2.push(Object.assign({ file: f, side: side, pol: pol }, row));
  }
}
console.log(`runs=${files.length} fights_classified=${all.length} b2_dismissals=${b2.length} unattributed=${unatt} instrumentErrors=${ierr}`);
console.log('wall:', JSON.stringify(wall));
// Taxonomy: species x kind x wave.
const tax = {};
for (const r of b2) {
  const k = `${r.mid}/${r.kind}/w${r.wave}/${r.side}`;
  tax[k] = tax[k] || { n: 0, known: 0, nPerfs: 0, hp: [] };
  tax[k].n++; tax[k].known += r.knownAtStart | 0; tax[k].nPerfs += r.nPerfs | 0;
  tax[k].hp.push(hpShape(r.hpByMid));
}
console.log('\n-- b2 taxonomy (species/kind/wave/side) --');
for (const k of Object.keys(tax).sort()) {
  const t = tax[k];
  const minP = t.hp.map(h => h.minPct).filter(x => x != null);
  const maxP = t.hp.map(h => h.maxPct).filter(x => x != null);
  console.log(`  ${k}: n=${t.n} knownAtStart=${t.known}/${t.n} perfs=${t.nPerfs} hpMin=${minP.length ? Math.min.apply(null, minP) : '?'}% hpMax=${maxP.length ? Math.max.apply(null, maxP) : '?'}%`);
}
// Counterfactual per run.
console.log('\n-- counterfactual bar flips --');
let flipsD1 = { w2: 0, w3: 0, w4: 0, w5: 0 }, flipsD2 = { w2: 0, w3: 0, w4: 0, w5: 0 };
let runsWithB2 = 0, deedPtsD1 = 0, deedPtsD2 = 0;
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const dis = (r.rows || []).filter(x => x.cls === 'b2-dismissal')
    .map(x => ({ mid: x.mid, wave: x.wave, knownAtStart: x.knownAtStart, day: x.day, seq: x.seq }));
  if (!dis.length) continue;
  runsWithB2++;
  const snap = r.snapshot;
  if (!snap || snap.error) { console.log(`  ${f}: SNAPSHOT ERROR`); continue; }
  const cf = counterfactual(snap, dis);
  deedPtsD1 += cf.d1.deedPoints; deedPtsD2 += cf.d2.deedPoints;
  for (const w of ['w2', 'w3', 'w4', 'w5']) {
    if (cf.d1.rungs[w].flipped) flipsD1[w]++;
    if (cf.d2.rungs[w].flipped) flipsD2[w]++;
  }
  if (cf.d1Wave !== cf.actualWave || cf.d2Wave !== cf.actualWave) {
    console.log(`  ${f}: actual w${cf.actualWave} -> D1 w${cf.d1Wave} (pts ${cf.d1.deedPoints}) / D2 w${cf.d2Wave} (pts ${cf.d2.deedPoints}) day=${snap.day}`);
  }
}
console.log(`runsWithB2=${runsWithB2}/${files.length} deedPtsD1=${deedPtsD1} deedPtsD2=${deedPtsD2}`);
console.log('flipsD1:', JSON.stringify(flipsD1), 'flipsD2:', JSON.stringify(flipsD2));
// Class mix (the full performed-fight census).
const mix = {};
for (const r of all) mix[r.cls] = (mix[r.cls] || 0) + 1;
console.log('class mix:', JSON.stringify(mix));
