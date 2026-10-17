#!/usr/bin/env node
// analyze-attrition.js — death-cause x day-bucket matrix from sweep-attrition shards.
'use strict';
const fs = require('fs');
const files = process.argv.slice(2);
const rows = [];
for (const f of files) rows.push(...JSON.parse(fs.readFileSync(f, 'utf8')));

// buckets: villager deaths by cause category; player deaths; monster kills
// SCHOLAR FLAG (gap-closure 2026-10-17): tele('death') records carry
// player:true (boolean, since the 2026-10-13 deathattr fix) — NOT d.scholar,
// which never existed on the record. The old check silently bucketed every
// scholar death as a villager death and the "player deaths by cause"
// section always printed empty. Same convention as succhain-lib's
// isBearerDeath (player flag first, kind fallback).
function isScholarDeath(d) {
  if (!d) return false;
  if (d.player === true) return true;
  return /player|scholar/i.test(String(d.kind || ''));
}
function cat(d) {
  if (d.kind === 'monster') return 'monster-killed'; // monsters killed BY villagers
  if (isScholarDeath(d)) return d.cause === 'combat' ? 'PLAYER-combat' : 'PLAYER-' + d.cause;
  const c = d.cause || '?';
  if (/combat|monster|ambush/i.test(c)) return 'V-combat';
  if (/starvation|hunger/i.test(c)) return 'V-starvation';
  if (/thirst|dehydrat/i.test(c)) return 'V-thirst';
  if (/sick|disease|fever|gut|tick/i.test(c)) return 'V-sickness';
  if (/night/i.test(c)) return 'V-night';
  if (/wound/i.test(c)) return 'V-wounds';
  if (/contest/i.test(c)) return 'V-contest';
  return 'V-other:' + c;
}
const buckets = ['d1-10', 'd11-30', 'd31-60', 'd61+'];
const bOf = (day) => day <= 10 ? 'd1-10' : day <= 30 ? 'd11-30' : day <= 60 ? 'd31-60' : 'd61+';
const mtx = {};
for (const b of buckets) mtx[b] = {};
let totalDeaths = 0, runs = rows.length;
const days = rows.map(r => r.days).sort((a, b) => a - b);
for (const r of rows) {
  for (const d of r.deaths) {
    const c = cat(d), b = bOf(d.day || 1);
    mtx[b][c] = (mtx[b][c] || 0) + 1;
    totalDeaths++;
  }
}
const allCats = [...new Set(buckets.flatMap(b => Object.keys(mtx[b])))].sort();
console.log('runs:', runs, '| median days:', days[Math.floor(days.length / 2)], '| max:', days[days.length - 1]);
console.log('total deaths:', totalDeaths, '| per run:', (totalDeaths / runs).toFixed(2));
console.log('\nheader: ' + ['bucket', ...allCats, 'TOTAL'].join(' | '));
for (const b of buckets) {
  const cells = allCats.map(c => mtx[b][c] || 0);
  const tot = cells.reduce((a, x) => a + x, 0);
  console.log([b, ...cells.map(x => (x / runs).toFixed(2)), (tot / runs).toFixed(2)].join(' | '));
}
// early (d1-30) death rates
const early = {}; let earlyN = 0;
for (const r of rows) for (const d of r.deaths) { if ((d.day || 1) <= 30) { early[cat(d)] = (early[cat(d)] || 0) + 1; earlyN++; } }
console.log('\nearly (d1-30) per run:', Object.fromEntries(Object.entries(early).map(([k, v]) => [k, (v / runs).toFixed(2)])));
// player deaths by cause
const pd = {};
for (const r of rows) for (const d of r.deaths) if (isScholarDeath(d)) pd[d.cause] = (pd[d.cause] || 0) + 1;
console.log('player deaths:', JSON.stringify(pd), 'per run:', (Object.values(pd).reduce((a,b)=>a+b,0)/runs).toFixed(2));
// monster kills by wave
const mw = {};
for (const r of rows) for (const d of r.deaths) if (d.kind === 'monster') mw[d.wave || '?'] = (mw[d.wave || '?'] || 0) + 1;
console.log('monster kills (villagers):', JSON.stringify(mw));
// end reasons
const er = {};
for (const r of rows) er[r.endReason] = (er[r.endReason] || 0) + 1;
console.log('endReasons:', JSON.stringify(er));
