#!/usr/bin/env node
// analyze-kcal-r8-20261012.js — analyze the diag-kcal balance-sheet JSON.
// IN=path node scripts/analyze-kcal-r8-20261012.js
'use strict';
const fs = require('fs');
const IN = process.env.IN || '/tmp/kcal-r8-baseline.json';
const d = JSON.parse(fs.readFileSync(IN));
const rows = d.rows;

const k = x => Math.round(x / 1000) + 'k';
const inSum = r => Object.values(r.end.inBy).reduce((a, b) => a + b, 0);
const outSum = r => Object.values(r.end.outBy).reduce((a, b) => a + b, 0);

// ---- wall numbers ----
const n = rows.length;
const nat = rows.filter(r => r.end.nationalLive);
const table = rows.filter(r => r.end.tableWaiting);
const won = rows.filter(r => r.end.won);
const w4 = rows.filter(r => r.end.waves.max >= 4);
const w5 = rows.filter(r => r.end.waves.max >= 5);
const days = rows.map(r => r.end.days).sort((a, b) => a - b);
const deathCauses = {};
for (const r of rows) for (const dd of r.end.deaths) deathCauses[dd.cause] = (deathCauses[dd.cause] || 0) + 1;
const nDeaths = Object.values(deathCauses).reduce((a, b) => a + b, 0);
console.log('=== WALL (n=' + n + ') ===');
console.log('national:', nat.length + '/' + n, nat.map(r => 's' + r.seed + '@d' + (r.end.nationalLive && r.trace.find(t => t.nat) ? r.trace.find(t => t.nat).day : '?')).join(' '));
console.log('table:', table.length + '/' + n, '| wins:', won.length + '/' + n);
console.log('wave4:', w4.length + '/' + n, '| wave5:', w5.length + '/' + n);
console.log('survival median:', days[Math.floor(days.length / 2)], 'max:', days[days.length - 1]);
console.log('survived horizon:', rows.filter(r => r.end.endReason === 'survived').length + '/' + n);
console.log('death causes (n=' + nDeaths + '):', Object.entries(deathCauses).sort((a, b) => b[1] - a[1]).map(([c, x]) => c + '=' + x + '(' + Math.round(100 * x / nDeaths) + '%)').join(' '));
console.log('vested:', rows.filter(r => r.end.vests.length > 0).length + '/' + n, '| fourRealm(via vests):', rows.filter(r => r.end.vests.length > 0).length + '/' + n);
console.log('counterKills total:', rows.reduce((a, r) => a + r.end.counterKills, 0));
console.log('successions:', rows.reduce((a, r) => a + r.end.successions, 0), '(young:', rows.reduce((a, r) => a + r.end.youngSuccessions, 0) + ')');
console.log('feastSurgeUsed:', rows.filter(r => r.end.feastSurge).length + '/' + n);
const arcs = {};
for (const r of rows) arcs[r.end.arc] = (arcs[r.end.arc] || 0) + 1;
console.log('arc reach (end):', JSON.stringify(arcs));
console.log('regional reach:', rows.filter(r => r.end.networkLive).length + '/' + n);

// ---- balance sheet ----
console.log('\n=== BALANCE SHEET ===');
const inKeys = new Set(), outKeys = new Set();
for (const r of rows) { Object.keys(r.end.inBy).forEach(x => inKeys.add(x)); Object.keys(r.end.outBy).forEach(x => outKeys.add(x)); }
const totIn = {}, totOut = {};
for (const r of rows) { for (const [kk, v] of Object.entries(r.end.inBy)) totIn[kk] = (totIn[kk] || 0) + v; for (const [kk, v] of Object.entries(r.end.outBy)) totOut[kk] = (totOut[kk] || 0) + v; }
const TI = Object.values(totIn).reduce((a, b) => a + b, 0), TO = Object.values(totOut).reduce((a, b) => a + b, 0);
console.log('TOTAL IN', k(TI), '| TOTAL OUT', k(TO));
console.log('IN:', Object.entries(totIn).sort((a, b) => b[1] - a[1]).map(([kk, v]) => kk + '=' + k(v) + '(' + Math.round(100 * v / TI) + '%)').join(' '));
console.log('OUT:', Object.entries(totOut).sort((a, b) => b[1] - a[1]).map(([kk, v]) => kk + '=' + k(v) + '(' + Math.round(100 * v / TO) + '%)').join(' '));

// per-run: rot share, pantry at day 40/60/80, meals per day
console.log('\n=== PER-RUN (seed days end pkEnd rotShare pk@40/60/80) ===');
for (const r of rows) {
  const I = inSum(r), O = outSum(r);
  const rot = (r.end.outBy['rot:fresh'] || 0) + (r.end.outBy['rot:preserved'] || 0);
  const at = d => { const t = r.trace.filter(x => x.day <= d).pop(); return t ? k(t.pk) : '?'; };
  console.log('s' + r.seed, r.end.days + 'd', r.end.endReason, 'pkEnd=' + k(r.end.pkEnd), 'rot=' + Math.round(100 * rot / Math.max(1, I)) + '%ofIN', 'pk40=' + at(40), 'pk60=' + at(60), 'pk80=' + at(80), 'rank=' + r.end.rank);
}

// surplus/deficit: villageEats need per day vs meals+rationalized intake
console.log('\n=== TRAJECTORY SNAPSHOT (day, median pk, median roster, % runs with net regional) ===');
for (const day of [20, 40, 60, 80, 100, 120, 150]) {
  const pts = rows.map(r => r.trace.filter(t => t.day <= day).pop()).filter(Boolean);
  const pks = pts.map(t => t.pk).sort((a, b) => a - b);
  const ros = pts.map(t => t.roster).sort((a, b) => a - b);
  const net = pts.filter(t => t.net).length;
  console.log('d' + day, 'medPk=' + k(pks[Math.floor(pks.length / 2)]), 'medRoster=' + ros[Math.floor(ros.length / 2)], 'regional=' + net + '/' + pts.length);
}

// wave reach days
console.log('\n=== WAVE REACH DAYS (first day wave seen in trace) ===');
for (const r of rows) {
  const first = {};
  for (const t of r.trace) for (const w of [2, 3, 4, 5]) if (t.wave >= w && !first[w]) first[w] = t.day;
  console.log('s' + r.seed, JSON.stringify(first), 'end=' + r.end.days + 'd');
}
