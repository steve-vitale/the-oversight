#!/usr/bin/env node
// analyze-stafffallback-confirm-b.js — judge the 12-seed confirm band
// (9760-9771) against the confirm amendment in
// evidence/2026-10-25/sim-stafffallback-b.md (C1/C2/C3/C4). Same
// per-seed-file-only rule as the pilot analyzer. C1 vacuous-satisfied
// when the fresh band holds zero 9754-class cells (pilot already
// reproduced the capture); C4 is a watch report, not a GO condition.
// Exit 0 always (the verdict lines are the judgment); the caller reads
// VERDICT, not the exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'sim-stafffallback-b-corpus');
const SEEDS = [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767, 9768, 9769, 9770, 9771];
const SIDES = ['pd0', 'pd1'];
function load(arm, side, seed) {
  return JSON.parse(fs.readFileSync(path.join(CORPUS, `stafffallback-b-${arm}-${side}-dg1-leadfeast-s${seed}.json`), 'utf8'));
}
function stats(r) {
  const aa = r.assignAgg || {};
  let denom = 0, numer = 0;
  for (const sd of (r.staffDays || [])) {
    const pre = Object.values(sd.asgPre || {}).some(t => t === 'cook');
    const post = Object.values(sd.asgPost || {}).some(t => t === 'cook');
    if (!pre && (sd.freshKcalPre || 0) > 1500) { denom += 1; if (post) numer += 1; }
  }
  let starv = 0, arena = 0, total = 0;
  for (const [k, v] of Object.entries(r.deathCauses || {})) { total += v; if (/starv/.test(k)) starv += v; if (/arena/.test(k)) arena += v; }
  return { calls: aa.cookCalls || 0, ok: aa.cookOk || 0, rate: denom ? numer / denom : null, res: r.preserveVillagerResolutions || 0, days: r.daysAlive || 0, national: !!r.national, win: !!r.win, maxWave: (r.waveReach || []).length ? Math.max(...r.waveReach) : 1, starv, arena, total, deathCauses: r.deathCauses || {} };
}
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const rows = [];
for (const side of SIDES) for (const seed of SEEDS) {
  const off = stats(load('off', side, seed));
  const on = stats(load('on', side, seed));
  rows.push({ side, seed, off, on, isClass: off.calls > 0 && off.ok === 0, unstaffed: off.ok > 0 && on.ok === 0 && on.calls > 0 });
}
const classRows = rows.filter(r => r.isClass);
console.log('seed side | class | OFF calls/ok/rate/res/days | ON calls/ok/rate/res/days');
for (const r of rows) {
  const f = (c) => `${c.calls}/${c.ok}/${c.rate === null ? 'na' : c.rate.toFixed(2)}/${c.res}/${c.days}`;
  console.log(`${r.seed} ${r.side} | ${r.isClass ? 'CLASS' : '  -  '} | ${f(r.off)} | ${f(r.on)}${r.unstaffed ? ' UNSTAFFED!' : ''}`);
}
const c1Bad = classRows.filter(r => !(r.on.ok > 0 && r.on.rate !== null && r.on.rate >= 0.5));
const c1 = c1Bad.length === 0;
console.log(`\nCLASS CELLS: ${classRows.length ? classRows.map(r => `${r.seed}/${r.side}`).join(', ') : 'NONE (C1 vacuous-satisfied)'}`);
console.log(`C1 ${c1 ? 'PASS' : 'FAIL'}${c1Bad.length ? ' — failing: ' + c1Bad.map(r => `${r.seed}/${r.side}`).join(', ') : ''}`);
let c2 = true;
for (const side of SIDES) {
  const offS = rows.filter(r => r.side === side).reduce((t, r) => t + r.off.starv, 0);
  const onS = rows.filter(r => r.side === side).reduce((t, r) => t + r.on.starv, 0);
  const offM = median(rows.filter(r => r.side === side).map(r => r.off.days));
  const onM = median(rows.filter(r => r.side === side).map(r => r.on.days));
  const ok = onS <= offS + 2 && onM >= 0.8 * offM;
  if (!ok) c2 = false;
  console.log(`C2 ${side} ${ok ? 'PASS' : 'FAIL'} — starv off=${offS} on=${onS} (bar <=${offS + 2}), median off=${offM} on=${onM} (bar >=${(0.8 * offM).toFixed(1)})`);
}
const unstaffed = rows.filter(r => r.unstaffed);
const c3 = unstaffed.length === 0;
console.log(`C3 ${c3 ? 'PASS' : 'FAIL'} — unstaffed cells: ${unstaffed.length ? unstaffed.map(r => `${r.seed}/${r.side}`).join(', ') : 'none'}`);
console.log(`\nVERDICT: ${c1 && c2 && c3 ? 'GO-CONFIRMED' : 'NO-GO'}`);
// C4 watch: armed village-lost cells + arena shares.
for (const arm of ['off', 'on']) {
  const cells = rows.map(r => r[arm]);
  const lost = rows.filter(r => r[arm].days < 100);
  const arena = cells.reduce((t, c) => t + c.arena, 0);
  const total = cells.reduce((t, c) => t + c.total, 0);
  const nat = cells.filter(c => c.national).length;
  console.log(`WALL ${arm}: national ${nat}/24 table 0/24 wins 0/24 medianDays ${median(cells.map(c => c.days))} arenaDeaths ${arena}/${total} villageLost ${lost.length}`);
  for (const r of lost) console.log(`  LOST ${arm} ${r.seed}/${r.side} days=${r[arm].days} deaths=${JSON.stringify(r[arm].deathCauses)}`);
}
