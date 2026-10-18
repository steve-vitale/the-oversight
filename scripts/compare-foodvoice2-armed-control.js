#!/usr/bin/env node
// armed-vs-control comparison for sim-foodvoice2-b on IDENTICAL substrate.
// Compares /tmp/foodvoice2-census (armed) vs /tmp/foodvoice2-census-control.
'use strict';
const fs = require('fs'), path = require('path');
const depLines = [
  'Back before dark. Probably.',
  "Gone looking. Don't wait up.",
  "There's food out there. Going to find it.",
  'Out for a forage. If I\'m late, start without me.',
  'Bringing dinner back. One way or another.',
];
function runsIn(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(leadfeast|belongfeast)-(\d+)\.json$/);
    if (!m) continue;
    out.push({ policy: m[1], seed: +m[2], d: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) });
  }
  return out.sort((a, b) => (a.policy + a.seed).localeCompare(b.policy + b.seed));
}
function wall(d) {
  const w = d.wall || {};
  return { national: w.national ? 1 : 0, table: w.table ? 1 : 0, wins: w.wins ? 1 : 0, wave4: (w.maxWave || 1) >= 4 ? 1 : 0, wave5: (w.maxWave || 1) >= 5 ? 1 : 0, days: d.days, end: d.endReason, starv: d.starvationDeaths || 0 };
}
function depStats(beats) {
  const per = {};
  for (const b of beats) {
    const line = depLines.find(l => b.text.includes(l));
    if (!line) continue;
    per[b.day] = per[b.day] || {}; per[b.day][line] = (per[b.day][line] || 0) + 1;
  }
  let maxV = 0, dist = new Set();
  for (const d of Object.keys(per)) for (const l of Object.keys(per[d])) { dist.add(l); maxV = Math.max(maxV, per[d][l]); }
  return { maxV, distinct: dist.size };
}
function pantryStats(beats) {
  const per = {};
  for (const b of beats) {
    if (!/checks the pantry/.test(b.text)) continue;
    const kind = b.text.startsWith('🌿') ? 'r' : 'e';
    const m = b.text.match(/~(\d+) days/);
    per[b.day] = per[b.day] || { r: [], e: [] };
    per[b.day][kind].push(m ? +m[1] : null);
  }
  let maxR = 0, maxE = 0, wob = 0, totR = 0, totE = 0;
  for (const d of Object.keys(per)) {
    const r = per[d].r, e = per[d].e;
    if (r.length) { totR += r.length; maxR = Math.max(maxR, r.length); if (new Set(r).size > 1) wob++; }
    if (e.length) { totE += e.length; maxE = Math.max(maxE, e.length); if (new Set(e).size > 1) wob++; }
  }
  return { maxR, maxE, wob, totR, totE };
}
const A = runsIn('/tmp/foodvoice2-census');
const C = runsIn('/tmp/foodvoice2-census-control');
console.log(`armed runs: ${A.length}, control runs: ${C.length}`);
if (A.length !== 32 || C.length !== 32) { console.log('FATAL: need 32+32'); process.exit(1); }
const agg = (runs) => { const s = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, starv: 0, days: [] }; for (const r of runs) { const w = wall(r.d); s.national += w.national; s.table += w.table; s.wins += w.wins; s.wave4 += w.wave4; s.wave5 += w.wave5; s.starv += w.starv; s.days.push(w.days); } s.days.sort((a, b) => a - b); s.median = s.days[Math.floor(s.days.length / 2)]; return s; };
const aA = agg(A), aC = agg(C);
console.log('armed  :', JSON.stringify(aA));
console.log('control:', JSON.stringify(aC));
const ok = ['national', 'table', 'wins', 'wave4', 'wave5'].every(k => Math.abs(aA[k] - aC[k]) <= 2) && Math.abs(aA.starv - aC.starv) <= 2;
console.log(ok ? 'GUARDRAIL (armed vs control, same tree): PASS' : 'GUARDRAIL (armed vs control, same tree): BREACHED');
// per-run wall equality + end-day equality
let sameWall = 0, sameEnd = 0, wallDiffs = [], endDiffs = [];
for (const a of A) {
  const c = C.find(x => x.policy === a.policy && x.seed === a.seed);
  const wa = wall(a.d), wc = wall(c.d);
  if (JSON.stringify([wa.national, wa.table, wa.wins, wa.wave4, wa.wave5, wa.starv]) === JSON.stringify([wc.national, wc.table, wc.wins, wc.wave4, wc.wave5, wc.starv])) sameWall++;
  else wallDiffs.push(`${a.policy}-${a.seed}: armed=${JSON.stringify([wa.national, wa.table, wa.wins, wa.wave4, wa.wave5, wa.starv])} control=${JSON.stringify([wc.national, wc.table, wc.wins, wc.wave4, wc.wave5, wc.starv])}`);
  if (wa.days === wc.days && wa.end === wc.end) sameEnd++;
  else endDiffs.push(`${a.policy}-${a.seed}: armed days=${wa.days}/${wa.end} control days=${wc.days}/${wc.end}`);
}
console.log(`per-run identical wall tuple: ${sameWall}/32`);
if (wallDiffs.length) wallDiffs.forEach(d => console.log('  WALLDIFF ' + d));
console.log(`per-run identical end day+reason: ${sameEnd}/32`);
if (endDiffs.length) endDiffs.forEach(d => console.log('  ENDDIFF ' + d));
// voice stats per side
for (const [name, runs] of [['armed', A], ['control', C]]) {
  let mxV = 0, dt = 0, mxR = 0, mxE = 0, wob = 0, tR = 0, tE = 0;
  for (const r of runs) { const ds = depStats(r.d.beats); mxV = Math.max(mxV, ds.maxV); dt = Math.max(dt, ds.distinct); const ps = pantryStats(r.d.beats); mxR = Math.max(mxR, ps.maxR); mxE = Math.max(mxE, ps.maxE); wob += ps.wob; tR += ps.totR; tE += ps.totE; }
  console.log(`${name}: dep maxV/day=${mxV} distinct=${dt} | pantry maxR/day=${mxR} maxE/day=${mxE} wobbleDays=${wob} totals r=${tR} e=${tE}`);
}
// exempt-beat count sanity: did control on this tree even fire the exempt branch?
console.log('DONE');
