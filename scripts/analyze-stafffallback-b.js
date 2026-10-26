#!/usr/bin/env node
// analyze-stafffallback-b.js — judge the stafffallback pilot corpus against
// the pre-registered GO bar in evidence/2026-10-25/sim-stafffallback-b.md.
// Inputs: per-seed JSONs only (evidence/2026-10-25/sim-stafffallback-b-corpus/
// stafffallback-b-<arm>-<side>-dg1-leadfeast-s<seed>.json). Sweep summaries
// are NOT inputs. Exit 0 prints the table + verdict; the verdict lines
// (G1/G2/G3, GO/KILLED/NO-GO) are the judgment, computed here, not edited.
// Staffed-day rate: among staffDays with no cook in asgPre AND
// freshKcalPre > 1500, the share with a cook in asgPost. Computed from the
// stored staffDays arrays, never from a counter.
'use strict';
const fs = require('fs');
const path = require('path');
const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'sim-stafffallback-b-corpus');
const SEEDS = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const SIDES = ['pd0', 'pd1'];

function load(arm, side, seed) {
  const f = path.join(CORPUS, `stafffallback-b-${arm}-${side}-dg1-leadfeast-s${seed}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function cellStats(r) {
  const aa = r.assignAgg || {};
  let denom = 0, numer = 0;
  for (const sd of (r.staffDays || [])) {
    const preCook = Object.values(sd.asgPre || {}).some(t => t === 'cook');
    const postCook = Object.values(sd.asgPost || {}).some(t => t === 'cook');
    if (!preCook && (sd.freshKcalPre || 0) > 1500) { denom += 1; if (postCook) numer += 1; }
  }
  // Max cook refusals on any single day (spam check).
  const perDay = {};
  for (const c of (r.assignCalls || [])) {
    if (c.task === 'cook' && c.ret === 'refused') perDay[c.day] = (perDay[c.day] || 0) + 1;
  }
  const maxRefDay = Math.max(0, ...Object.values(perDay));
  const starv = (r.deathCauses || {}).starvation || 0;
  // Death-cause keys are lowercased/truncated by canonCause; 'starvation'
  // is the literal key used by the onzero corpus. Count any key containing
  // 'starv' to be safe.
  let starv2 = starv;
  if (!starv) for (const [k, v] of Object.entries(r.deathCauses || {})) if (/starv/.test(k)) starv2 += v;
  return {
    calls: aa.cookCalls || 0, ok: aa.cookOk || 0, refused: aa.cookRefused || 0,
    nulls: aa.cookNull || 0, callVids: aa.cookCallVids || {},
    staffDenom: denom, staffNumer: numer,
    staffRate: denom ? numer / denom : null,
    resolutions: r.preserveVillagerResolutions || 0,
    batches: r.preserveVillagerBatches || 0,
    cookingDeeds: r.cookingDeeds || 0,
    daysAlive: r.daysAlive || 0, national: !!r.national, win: !!r.win,
    maxWave: (r.waveReach || []).length ? Math.max(...r.waveReach) : 1,
    starv: starv2, deathCauses: r.deathCauses || {},
    maxRefDay, saySamples: r.saySamples || [],
    cookingByVid: r.cookingByVid || {},
  };
}
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

const rows = [];
for (const side of SIDES) for (const seed of SEEDS) {
  const off = cellStats(load('off', side, seed));
  const on = cellStats(load('on', side, seed));
  const isClass = off.calls > 0 && off.ok === 0;
  rows.push({ side, seed, off, on, isClass });
}
const classRows = rows.filter(r => r.isClass);
console.log('seed side | class | OFF calls/ok/staffRate/res/batches/days | ON calls/ok/staffRate/res/batches/days | ON maxRefDay');
for (const r of rows) {
  const f = (c) => `${c.calls}/${c.ok}/${c.staffRate === null ? 'na' : c.staffRate.toFixed(2)}/${c.resolutions}/${c.batches}/${c.daysAlive}`;
  console.log(`${r.seed} ${r.side} | ${r.isClass ? 'CLASS' : '  -  '} | ${f(r.off)} | ${f(r.on)} | ${r.on.maxRefDay}`);
}
// G1: every class cell armed ok>0 and staffRate>=0.5. Vacuous-fail if no class cells.
let g1 = null, g1Detail = '';
if (classRows.length === 0) { g1 = false; g1Detail = 'VACUOUS-FAIL: zero 9754-class cells in pilot control'; }
else {
  const bad = classRows.filter(r => !(r.on.ok > 0 && r.on.staffRate !== null && r.on.staffRate >= 0.5));
  g1 = bad.length === 0;
  g1Detail = bad.length ? 'failing class cells: ' + bad.map(r => `${r.seed}/${r.side} ok=${r.on.ok} rate=${r.on.staffRate}`).join(', ') : `all ${classRows.length} class cells pass`;
}
const g2Bad = classRows.filter(r => !(r.on.resolutions > 0));
const g2 = classRows.length > 0 && g2Bad.length === 0;
const g2Detail = classRows.length === 0 ? 'no class cells' : (g2Bad.length ? 'zero resolutions on: ' + g2Bad.map(r => `${r.seed}/${r.side}`).join(', ') : `all ${classRows.length} class cells resolve`);
const g3 = [];
for (const side of SIDES) {
  const offS = rows.filter(r => r.side === side).reduce((t, r) => t + r.off.starv, 0);
  const onS = rows.filter(r => r.side === side).reduce((t, r) => t + r.on.starv, 0);
  const offM = median(rows.filter(r => r.side === side).map(r => r.off.daysAlive));
  const onM = median(rows.filter(r => r.side === side).map(r => r.on.daysAlive));
  const pass = onS <= offS + 2 && onM >= 0.8 * offM;
  g3.push({ side, offS, onS, offM, onM, pass });
}
const g3Pass = g3.every(g => g.pass);
console.log('\nCLASS CELLS: ' + (classRows.length ? classRows.map(r => `${r.seed}/${r.side}`).join(', ') : 'NONE'));
console.log(`G1 ${g1 ? 'PASS' : 'FAIL'} — ${g1Detail}`);
console.log(`G2 ${g2 ? 'PASS' : 'FAIL'} — ${g2Detail}`);
for (const g of g3) console.log(`G3 ${g.side} ${g.pass ? 'PASS' : 'FAIL'} — starv off=${g.offS} on=${g.onS} (bar <=${g.offS + 2}), medianDays off=${g.offM} on=${g.onM} (bar >=${(0.8 * g.offM).toFixed(1)})`);
const sniffFail = classRows.length > 0 && classRows.every(r => r.on.ok === 0);
const go = g1 && g2 && g3Pass;
console.log(`\nVERDICT: ${go ? 'GO' : (sniffFail || classRows.length === 0 ? 'KILLED-at-pilot' : 'NO-GO')}`);
// Wall numbers (whole pilot, per arm).
for (const arm of ['off', 'on']) {
  const cells = rows.map(r => r[arm]);
  const nat = cells.filter(c => c.national).length;
  const wins = cells.filter(c => c.win).length;
  const waves = {};
  for (const c of cells) waves[c.maxWave] = (waves[c.maxWave] || 0) + 1;
  console.log(`WALL ${arm}: national ${nat}/16 table ${wins}/16 wins ${wins}/16 medianDays ${median(cells.map(c => c.daysAlive))} waves ${JSON.stringify(waves)}`);
}
// Say samples on class cells (armed): first refusal line + first smoke line.
for (const r of classRows) {
  const ss = r.on.saySamples || [];
  const ref = ss.find(s => /Trust too low|Why should I listen|haven't earned|Ask someone|Not today/i.test(s.text));
  const smoke = ss.find(s => /smoke racks|cooked for the haven/i.test(s.text));
  console.log(`SAY ${r.seed}/${r.side} armed: refusal=${ref ? JSON.stringify(ref.text.slice(0, 160)) : 'none'} | smoke=${smoke ? JSON.stringify(smoke.text.slice(0, 160)) : 'none'}`);
  console.log(`  cookIdentity armed: ${JSON.stringify(r.on.cookingByVid)} | callVids: ${JSON.stringify(r.on.callVids)}`);
  console.log(`  cookIdentity control: ${JSON.stringify(r.off.cookingByVid)} | callVids: ${JSON.stringify(r.off.callVids)}`);
}
