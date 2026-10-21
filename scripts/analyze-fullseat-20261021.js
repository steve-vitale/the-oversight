#!/usr/bin/env node
// analyze-fullseat-20261021.js — full-seat component analysis (sim-fullseat,
// 2026-10-21). Reads evidence/2026-10-21/perseed-fullseat/*/*.json and reports:
// per-component reach distributions, which component binds most often,
// how far the closest run got, whether any win-track run was ever close
// to a full seat. READ-ONLY — writes nothing.
// Usage: node scripts/analyze-fullseat-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const FD = require('./policies/fullseat-diag');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-fullseat');
const files = [];
for (const p of ['leadfeast', 'belongfeast']) {
  const d = path.join(DIR, p);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/^s\d+\.json$/.test(f)) files.push(path.join(d, f));
}
const recs = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8'))).filter(r => r.completed);
if (!recs.length) { console.error('no completed records in ' + DIR); process.exit(2); }

const COMP = ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage'];
const BARS = FD.BARS;

function distAtMax(r) {
  const m = (r.diag || {}).maxReach || {};
  const d = FD.distToFull(Object.assign({}, m, { brokerage: m.score | 0, might: 0, foodShared: m.foodShared | 0 }));
  // foodDeeds is a boolean-pair, not a count: distance is 0 iff BOTH halves
  // ever landed (sentDay && surgeDay), else 1 (the missing half is named
  // from the end snapshot in the closest-run listing).
  d.foodDeeds = ((r.diag || {}).sentDay != null && (r.diag || {}).surgeDay != null) ? 0 : 1;
  return d;
}

console.log(`== sim-fullseat component analysis: ${recs.length} runs ==`);
const full = recs.filter(r => (r.diag || {}).bestSeatEver === 'full');
const indisp = recs.filter(r => (r.diag || {}).indispEver);
const won = recs.filter(r => r.won);
console.log(`full seat: ${full.length}/${recs.length} | indispensable ever: ${indisp.length}/${recs.length} | wins: ${won.length}/${recs.length} | national: ${recs.filter(r => r.national).length}/${recs.length}`);

// Per-component reach distribution (max reach across runs).
console.log('\n-- reach distribution (max reach per run) --');
for (const c of COMP) {
  const vals = recs.map(r => (((r.diag || {}).maxReach || {})[c] | 0));
  const bar = BARS[c];
  const hit = vals.filter(v => v >= bar).length;
  console.log(`  ${c} (bar ${bar}): max=${Math.max.apply(null, vals)} min=${Math.min.apply(null, vals)} runs-at-bar=${hit}/${vals.length} vals=[${vals.join(',')}]`);
}
const sentAt = recs.filter(r => (r.diag || {}).sentDay != null).length;
const surgeAt = recs.filter(r => (r.diag || {}).surgeDay != null).length;
const fsMax = recs.map(r => (((r.diag || {}).maxReach || {}).foodShared | 0));
const scMax = recs.map(r => (((r.diag || {}).maxReach || {}).score | 0));
const stMax = recs.map(r => (((r.diag || {}).maxReach || {}).standing | 0));
console.log(`  sentimentTaught ever: ${sentAt}/${recs.length} | feastSurgeUsed ever: ${surgeAt}/${recs.length}`);
console.log(`  foodShared max-reach: max=${Math.max.apply(null, fsMax)} vals=[${fsMax.join(',')}]`);
console.log(`  indisp score max-reach: max=${Math.max.apply(null, scMax)} vals=[${scMax.join(',')}] (bar 10)`);
console.log(`  standing max-reach: max=${Math.max.apply(null, stMax)} vals=[${stMax.join(',')}] (t4=100 t5=200)`);

// Which component binds most often: at closest approach, the unmet
// component with the largest distance (ties -> hardest bar first).
const binds = {};
for (const r of recs) {
  const d = distAtMax(r);
  let worst = null, wd = 0;
  for (const c of COMP) { if (d[c] >= wd && d[c] > 0) { wd = d[c]; worst = c; } }
  if (d.foodDeeds > 0 && !worst) worst = 'foodDeeds';
  const dg = r.diag || {};
  const key = worst || (dg.bestSeatEver === 'full' ? (d.indispShared > 0 ? 'indispShared' : (d.indispScore > 0 ? 'indispScore' : 'NONE')) : 'NONE');
  binds[key] = (binds[key] || 0) + 1;
  r._bind = key; r._wd = wd; r._distMax = d;
}
console.log('\n-- binding component (at closest approach) --');
for (const [k, n] of Object.entries(binds).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k}: ${n}/${recs.length}`);

// Closest run: fewest total unmet distances at max-reach.
const scored = recs.map(r => {
  const d = r._distMax;
  const tot = COMP.reduce((t, c) => t + d[c], 0) + d.foodDeeds;
  return { r, tot };
}).sort((a, b) => a.tot - b.tot);
console.log('\n-- closest runs (total distance at max-reach, full-seat bars) --');
for (const { r, tot } of scored.slice(0, 4)) {
  const d = r._distMax, m = (r.diag || {}).maxReach || {};
  console.log(`  ${r.policyId} s${r.seed}: totalDist=${tot} binding=${r._bind} w=[${COMP.map(c => m[c]).join('/')}] c=${m.contests} k=${m.crises} st=${m.stage} sent=${r.diag.sentDay != null} surge=${r.diag.surgeDay != null} seat=${r.diag.bestSeatEver} won=${r.won} days=${r.gameDays}`);
}

// Win-track runs: how close did any win get to a full seat?
console.log('\n-- win-track runs (gate state AT THE WIN vs at run end) --');
for (const r of won) {
  const dg = r.diag || {};
  const w = dg.winSnap, e = dg.endSnap;
  const dw = w ? COMP.reduce((t, c) => t + Math.max(0, BARS[c] - (w[c] | 0)), 0) + (w.foodDeeds ? w.foodDeeds.dist : 1) : null;
  const de = e ? COMP.reduce((t, c) => t + Math.max(0, BARS[c] - (e[c] | 0)), 0) + (e.foodDeeds ? e.foodDeeds.dist : 1) : null;
  const wt = r.winTrack || {};
  console.log(`  ${r.policyId} s${r.seed}: door=${wt.path || '?'} branch=${wt.moral || '?'} winDay=${dg.winDay} distAtWin=${dw} distAtEnd=${de} w4=${w ? w.w4 : '?'}/${e ? e.w4 : '?'} w5=${w ? w.w5 : '?'}/${e ? e.w5 : '?'} seat=${w ? w.seat : '?'}/${e ? e.seat : '?'}`);
}
if (!won.length) console.log('  (no wins)');

// Unlock-chain context for w4/w5 at max-reach.
console.log('\n-- wave-4/5 unlock chain at run end (why the bars stay empty) --');
const holdKinds = {};
for (const r of recs) {
  const e = (r.diag || {}).endSnap || {};
  const u = e.unlock || {};
  const hk = u.holdKind || '?';
  holdKinds[hk] = (holdKinds[hk] || 0) + 1;
  console.log(`  ${r.policyId} s${r.seed}: wave=${u.unlockedWave} standing=${u.standing} (raw=${u.raw} war=${u.war} dip=${u.diplomacy} plenty=${u.plenty} capped=${u.capped}) hold=${hk}${u.rd5short ? ' short=' + u.rd5short.join(',') : ''} w4faced=${u.w4faced} w2pts=${u.w2points} w4=${e.w4} w5=${e.w5}`);
}
console.log('\n-- hold-kind distribution (what pins standing at/below t5) --');
for (const [k, n] of Object.entries(holdKinds).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k}: ${n}/${recs.length}`);
