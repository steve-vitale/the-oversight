#!/usr/bin/env node
// analyze-glut-b.js — dose-response aggregator for the sim-glutprobe-b diagnostic.
//
// Reads evidence/2026-10-20/perseed-glutprobe-b/*.json, builds:
//   1. per-channel dose-response: kcal/day vs pantry fresh-days buckets AND
//      vs dawn doomed-stock buckets (pooled day-pairs + per-run means)
//   2. permanent-glut configs (>=40% of lived days at freshDays >= 7)
//   3. marginal glut inflow attribution by channel on glut days
//   4. throttle verdicts per channel (glut-bucket rate vs lean-bucket rate)
//   5. wall numbers, death-cause shares
// Writes evidence/2026-10-20/glutprobe-analysis.json and prints the tables.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || 'evidence/2026-10-20/perseed-glutprobe-b';
const OUT = process.argv[3] || 'evidence/2026-10-20/glutprobe-analysis.json';

const fdBucket = fd => fd <= 2 ? 'lean(<=2)' : fd <= 4 ? 'mid(2-4]' : fd < 7 ? 'midhi(4-7)' : 'glut(>=7)';
const doomedBucket = k => k <= 0 ? 'doom0' : k <= 2000 ? 'doom1-2k' : k <= 10000 ? 'doom2k-10k' : 'doom10k+';

const rows = [];
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.json')) continue;
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  for (const r of (j.rows || [])) rows.push({ policy: j.meta.policy, ...r });
}

const out = { runs: rows.length, perRun: [], pooled: {}, wall: {}, deaths: {} };

// --- per-run rollups + day-pair corpus ---
const dayPairs = []; // {policy, seed, day, fd, doomed, roster, ch:{}}
for (const r of rows) {
  const pr = {
    policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
    won: r.won, national: r.national, table: r.table, maxWave: r.maxWave, arc: r.arc,
    chokeTotal: r.chokeTotal, unattShare: r.unattShare,
    inflow: r.inflow, rotFresh: r.rotFresh, rotPreserved: r.rotPreserved,
    throttleEngaged: r.throttleEngaged, throttleCalls: r.throttleCalls,
    starveDays: r.starveDays, dutyPreserved: r.dutyPreserved, laundered: r.laundered,
    deaths: r.deaths,
  };
  // permanent-glut: fraction of dawn days with freshDays >= 7
  let glutDays = 0, nDays = 0, sumFd = 0;
  for (const s of (r.dawnSamples || [])) {
    nDays++; sumFd += s.freshDays;
    if (s.freshDays >= 7) glutDays++;
    const di = (r.dayInflow || {})[s.day] || {};
    dayPairs.push({ policy: r.policy, seed: r.seed, day: s.day, fd: s.freshDays, doomed: s.doomedKcal, roster: s.roster, ch: di });
  }
  pr.glutDayShare = nDays ? glutDays / nDays : 0;
  pr.meanFd = nDays ? sumFd / nDays : 0;
  pr.permanentGlut = pr.glutDayShare >= 0.4;
  out.perRun.push(pr);
  for (const d of (r.deaths || [])) {
    const k = d.cause || '?';
    out.deaths[k] = (out.deaths[k] || 0) + 1;
  }
}

// --- pooled dose-response tables ---
function doseTable(keyFn, buckets) {
  const t = {};
  for (const b of buckets) t[b] = { n: 0, ch: {} };
  for (const p of dayPairs) {
    const b = keyFn(p);
    const cell = t[b];
    cell.n++;
    for (const [c, k] of Object.entries(p.ch)) cell.ch[c] = (cell.ch[c] || 0) + k;
  }
  // means per day
  for (const b of buckets) {
    const cell = t[b];
    cell.mean = {};
    for (const [c, k] of Object.entries(cell.ch)) cell.mean[c] = cell.n ? k / cell.n : 0;
    cell.totalMean = cell.n ? Object.values(cell.ch).reduce((a, x) => a + x, 0) / cell.n : 0;
  }
  return t;
}
const FD_BUCKETS = ['lean(<=2)', 'mid(2-4]', 'midhi(4-7)', 'glut(>=7)'];
const DOOM_BUCKETS = ['doom0', 'doom1-2k', 'doom2k-10k', 'doom10k+'];
out.pooled.byFreshDays = doseTable(p => fdBucket(p.fd), FD_BUCKETS);
out.pooled.byDoomed = doseTable(p => doomedBucket(p.doomed), DOOM_BUCKETS);

// --- throttle verdicts: glut-bucket mean vs lean-bucket mean per channel ---
const lean = out.pooled.byFreshDays['lean(<=2)'].mean;
const glut = out.pooled.byFreshDays['glut(>=7)'].mean;
const chans = new Set([...Object.keys(lean), ...Object.keys(glut)]);
out.throttleVerdicts = {};
for (const c of chans) {
  const l = lean[c] || 0, g = glut[c] || 0;
  const ratio = l > 0 ? g / l : (g > 0 ? Infinity : 0);
  const verdict = ratio >= 0.8 ? 'DOES-NOT-THROTTLE' : ratio <= 0.5 ? 'THROTTLES' : 'PARTIAL';
  out.throttleVerdicts[c] = { lean: Math.round(l), glut: Math.round(g), ratio: l > 0 ? +ratio.toFixed(2) : (g > 0 ? 'inf' : 0), verdict };
}

// --- permanent-glut configs + marginal glut inflow attribution ---
out.permanentGlutRuns = out.perRun.filter(p => p.permanentGlut)
  .map(p => ({ policy: p.policy, seed: p.seed, glutDayShare: +p.glutDayShare.toFixed(2), meanFd: +p.meanFd.toFixed(1), days: p.days }));
const glutPairs = dayPairs.filter(p => p.fd >= 7);
const marg = {};
for (const p of glutPairs) for (const [c, k] of Object.entries(p.ch)) marg[c] = (marg[c] || 0) + k;
const margTotal = Object.values(marg).reduce((a, b) => a + b, 0);
out.marginalGlutInflow = { nGlutDays: glutPairs.length, totalKcal: Math.round(margTotal),
  byChannel: Object.fromEntries(Object.entries(marg).map(([c, k]) => [c, { kcal: Math.round(k), share: +(k / margTotal).toFixed(3) }])) };

// --- Pearson(freshDays, same-day inflow) for comparability ---
{
  let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (const p of dayPairs) {
    const x = p.fd, y = Object.values(p.ch).reduce((a, b) => a + b, 0);
    n++; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
  }
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  out.pooled.pearsonFdInflow = den ? +((n * sxy - sx * sy) / den).toFixed(3) : null;
  out.pooled.nDayPairs = n;
}

// --- wall numbers ---
{
  const w = { won: 0, national: 0, table: 0, w4: 0, w5: 0, surv: [] };
  for (const r of rows) {
    if (r.won) w.won++;
    if (r.national) w.national++;
    if (r.table) w.table++;
    if ((r.maxWave || 0) >= 4) w.w4++;
    if ((r.maxWave || 0) >= 5) w.w5++;
    w.surv.push(r.days);
  }
  w.surv.sort((a, b) => a - b);
  w.medianSurv = w.surv.length ? w.surv[Math.floor(w.surv.length / 2)] : 0;
  w.maxSurv = w.surv.length ? w.surv[w.surv.length - 1] : 0;
  out.wall = w;
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

// --- print ---
const kfmt = k => (k / 1000).toFixed(1) + 'k';
console.log('=== sim-glutprobe-b analysis ===');
console.log(`runs=${out.runs} dayPairs=${out.pooled.nDayPairs} pearson(fd,inflow)=${out.pooled.pearsonFdInflow}`);
console.log('\n--- dose-response vs fresh-days (mean kcal/day/channel, pooled) ---');
const allCh = [...new Set(dayPairs.flatMap(p => Object.keys(p.ch)))].sort();
console.log('channel'.padEnd(22) + FD_BUCKETS.map(b => b.padStart(12)).join(''));
for (const c of allCh) {
  const row = FD_BUCKETS.map(b => {
    const m = out.pooled.byFreshDays[b].mean[c] || 0;
    return String(m >= 1000 ? kfmt(m) : Math.round(m)).padStart(12);
  }).join('');
  console.log(c.padEnd(22) + row);
}
console.log('n-days'.padEnd(22) + FD_BUCKETS.map(b => String(out.pooled.byFreshDays[b].n).padStart(12)).join(''));
console.log('\n--- dose-response vs doomed stock (mean kcal/day/channel, pooled) ---');
console.log('channel'.padEnd(22) + DOOM_BUCKETS.map(b => b.padStart(12)).join(''));
for (const c of allCh) {
  const row = DOOM_BUCKETS.map(b => {
    const m = out.pooled.byDoomed[b].mean[c] || 0;
    return String(m >= 1000 ? kfmt(m) : Math.round(m)).padStart(12);
  }).join('');
  console.log(c.padEnd(22) + row);
}
console.log('n-days'.padEnd(22) + DOOM_BUCKETS.map(b => String(out.pooled.byDoomed[b].n).padStart(12)).join(''));
console.log('\n--- throttle verdicts (glut>=7 vs lean<=2 kcal/day) ---');
for (const [c, v] of Object.entries(out.throttleVerdicts).sort()) {
  console.log(`${c.padEnd(22)} lean=${String(v.lean).padStart(7)} glut=${String(v.glut).padStart(7)} ratio=${String(v.ratio).padStart(6)} ${v.verdict}`);
}
console.log('\n--- permanent-glut configs (>=40% of days at freshDays>=7) ---');
for (const p of out.permanentGlutRuns) console.log(`  ${p.policy} s${p.seed}: glutShare=${p.glutDayShare} meanFd=${p.meanFd} days=${p.days}`);
console.log(`\n--- marginal glut inflow (${out.marginalGlutInflow.nGlutDays} glut-days, ${kfmt(out.marginalGlutInflow.totalKcal)} total) ---`);
for (const [c, v] of Object.entries(out.marginalGlutInflow.byChannel).sort((a, b) => b[1].kcal - a[1].kcal)) {
  console.log(`  ${c.padEnd(22)} ${kfmt(v.kcal).padStart(8)}  ${(v.share * 100).toFixed(1)}%`);
}
console.log('\n--- wall ---');
console.log(`won=${out.wall.won}/${out.runs} national=${out.wall.national}/${out.runs} table=${out.wall.table}/${out.runs} w4=${out.wall.w4}/${out.runs} w5=${out.wall.w5}/${out.runs} med=${out.wall.medianSurv}d max=${out.wall.maxSurv}d`);
console.log('--- death causes ---');
for (const [c, n] of Object.entries(out.deaths).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${c}: ${n}`);
console.log('\n--- conservation (unattributed share per run) ---');
for (const p of out.perRun) console.log(`  ${p.policy} s${p.seed}: choke=${kfmt(p.chokeTotal)} unatt=${(p.unattShare * 100).toFixed(2)}%`);
console.log('\nwrote ' + OUT);
