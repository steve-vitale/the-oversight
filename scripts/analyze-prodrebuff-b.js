#!/usr/bin/env node
// analyze-prodrebuff-b.js — sim-prodrebuff-b dose-response aggregator.
//
// Usage: node scripts/analyze-prodrebuff-b.js --control <dir-with-perseed-jsons>
//        [--armed <dir-with-perseed-jsons>] [--out <path>]
//
// The pre-registered buckets, verdict bands, and lever GO bars are encoded
// here, written BEFORE the sweep.
//
// Output: JSON analysis + the DIAG verdict and (if --armed) the lever
// verdict, printed and saved.
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = {};
for (let i = 0; i < args.length; i += 2) opt[args[i].replace(/^--/, '')] = args[i + 1];
if (!opt.control) { console.error('FATAL: --control <dir> required'); process.exit(2); }

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const rows = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const r of j.rows) rows.push(r);
  }
  return rows;
}

// Spearman rho on paired arrays (average-tie ranks)
function spearman(xs, ys) {
  const n = xs.length;
  if (n < 10) return null;
  const rank = a => {
    const idx = a.map((v, i) => i).sort((p, q) => a[p] - a[q]);
    const r = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && a[idx[j + 1]] === a[idx[i]]) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k]] = avg;
      i = j + 1;
    }
    return r;
  };
  const rx = rank(xs), ry = rank(ys);
  const mx = rx.reduce((a, b) => a + b, 0) / n, my = ry.reduce((a, b) => a + b, 0) / n;
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < n; i++) {
    cov += (rx[i] - mx) * (ry[i] - my);
    vx += (rx[i] - mx) ** 2; vy += (ry[i] - my) ** 2;
  }
  if (vx === 0 || vy === 0) return null;
  return cov / Math.sqrt(vx * vy);
}

// fine fresh-day buckets (binding, pre-registered)
const BUCKETS = [[0, 1], [1, 2], [2, 4], [4, 7], [7, 14], [14, 30], [30, Infinity]];
const DOOM_BUCKETS = [[0, 0], [1, 2000], [2000, 10000], [10000, Infinity]];

function dayPairs(rows) {
  // [{day, fd, doomed, chKcal: {ch: kcal}}] pooled over runs
  const out = [];
  for (const r of rows) {
    for (const s of (r.dawnSamples || [])) {
      const fd = s.freshDays;
      const chKcal = {};
      const di = (r.dayInflow || {})[s.day] || {};
      for (const [ch, k] of Object.entries(di)) chKcal[ch] = k;
      out.push({ seed: r.seed, day: s.day, fd, doomed: s.doomedKcal || 0, chKcal });
    }
  }
  return out;
}

function analyzeCorpus(rows, label) {
  const pairs = dayPairs(rows);
  const channels = new Set();
  for (const p of pairs) for (const ch of Object.keys(p.chKcal)) channels.add(ch);
  const chans = [...channels].sort();

  // bucket means
  const bucketMeans = {};
  const bucketN = {};
  for (const [lo, hi] of BUCKETS) {
    const key = `${lo}-${hi === Infinity ? '+' : hi}`;
    const sel = pairs.filter(p => p.fd >= lo && p.fd < hi);
    bucketN[key] = sel.length;
    bucketMeans[key] = {};
    for (const ch of chans) {
      bucketMeans[key][ch] = sel.length ? sel.reduce((a, p) => a + (p.chKcal[ch] || 0), 0) / sel.length : 0;
    }
  }

  // throttle coefficient: Spearman rho(fd, inflow) on fd in [2,30]
  const coeff = {};
  const sub = pairs.filter(p => p.fd >= 2 && p.fd <= 30);
  for (const ch of chans) {
    const xs = [], ys = [];
    for (const p of sub) { xs.push(p.fd); ys.push(p.chKcal[ch] || 0); }
    coeff[ch] = spearman(xs, ys);
  }

  // glut/lean ratio (continuity with the glutprobe taxonomy)
  const lean = pairs.filter(p => p.fd <= 2), glut = pairs.filter(p => p.fd >= 7);
  const ratio = {};
  for (const ch of chans) {
    const l = lean.length ? lean.reduce((a, p) => a + (p.chKcal[ch] || 0), 0) / lean.length : 0;
    const g = glut.length ? glut.reduce((a, p) => a + (p.chKcal[ch] || 0), 0) / glut.length : 0;
    ratio[ch] = l > 0 ? g / l : (g > 0 ? Infinity : null);
  }

  // marginal glut inflow attribution
  const margKcal = {}, margShare = {};
  let margTotal = 0;
  for (const ch of chans) margKcal[ch] = glut.reduce((a, p) => a + (p.chKcal[ch] || 0), 0);
  for (const ch of chans) margTotal += margKcal[ch];
  for (const ch of chans) margShare[ch] = margTotal > 0 ? margKcal[ch] / margTotal : 0;

  // doomed-bucket curves for the candidate lever channels
  const doomCurves = {};
  for (const ch of ['away_wild', 'ambient:villagelives', 'share_surplus', 'tribute']) {
    if (!channels.has(ch)) continue;
    doomCurves[ch] = DOOM_BUCKETS.map(([lo, hi]) => {
      const sel = pairs.filter(p => p.doomed >= lo && p.doomed <= hi);
      return {
        bucket: hi === Infinity ? `${lo}+` : `${lo}-${hi}`,
        n: sel.length,
        mean: sel.length ? sel.reduce((a, p) => a + (p.chKcal[ch] || 0), 0) / sel.length : 0,
      };
    });
  }

  // wall numbers + deaths
  const won = rows.filter(r => r.won).length;
  const national = rows.filter(r => r.national).length;
  const table = rows.filter(r => r.table).length;
  const wave4 = rows.filter(r => (r.maxWave || 0) >= 4).length;
  const wave5 = rows.filter(r => (r.maxWave || 0) >= 5).length;
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : 0;
  const max = days.length ? days[days.length - 1] : 0;
  const deathKinds = {};
  for (const r of rows) {
    for (const d of (r.deaths || [])) {
      const k = String(d.kind || d.cause || '?');
      deathKinds[k] = (deathKinds[k] || 0) + 1;
    }
  }
  const starve = rows.reduce((a, r) => a + (r.starveDays || 0), 0);

  // permanent-glut configs
  let permGlut = 0;
  for (const r of rows) {
    const ds = (r.dawnSamples || []);
    const g = ds.filter(s => s.freshDays >= 7).length;
    if (ds.length && g / ds.length >= 0.40) permGlut++;
  }

  // instrument honesty
  const unattMax = rows.length ? Math.max(...rows.map(r => r.unattShare || 0)) : 1;

  return {
    label, runs: rows.length, dayPairs: pairs.length,
    glutPairs: glut.length, leanPairs: lean.length,
    bucketMeans, bucketN, coeff, ratio, margKcal, margShare, margTotal,
    doomCurves, won, national, table, wave4, wave5, median, max, permGlut,
    deathKinds, starveDays: starve, unattMax,
  };
}

const ctl = analyzeCorpus(loadDir(opt.control), 'control');
const out = { control: ctl };

if (opt.armed) {
  const arm = analyzeCorpus(loadDir(opt.armed), 'armed');
  out.armed = arm;
  // lever comparison (binding, pre-registered): away_wild glut/lean ratio,
  // permanent-glut days, lean inflow, starvation, survival, laundering,
  // death mechanisms
  const aw = ch => (ctl.ratio[ch] || 0);
  const leans = rows => {
    const ps = dayPairs(rows);
    const lean = ps.filter(p => p.fd <= 2);
    const m = {};
    for (const ch of Object.keys(ctl.bucketMeans['0-1'] || {})) {
      m[ch] = lean.length ? lean.reduce((a, p) => a + (p.chKcal[ch] || 0), 0) / lean.length : 0;
    }
    return m;
  };
  const ctlLean = leans(loadDir(opt.control)), armLean = leans(loadDir(opt.armed));
  const otherChans = chans => chans.filter(c => c !== 'away_wild');
  const glutBucketOther = rows => {
    const ps = dayPairs(rows);
    const glut = ps.filter(p => p.fd >= 7);
    const m = {};
    for (const ch of Object.keys(ctl.bucketMeans['0-1'] || {})) {
      m[ch] = glut.length ? glut.reduce((a, p) => a + (p.chKcal[ch] || 0), 0) / glut.length : 0;
    }
    return m;
  };
  const ctlGO = glutBucketOther(loadDir(opt.control)), armGO = glutBucketOther(loadDir(opt.armed));
  const chanNames = Object.keys(ctl.bucketMeans['0-1'] || {});
  const launderMiss = chanNames.filter(c => c !== 'away_wild' && armGO[c] > (ctlGO[c] || 0) * 1.10);
  const ctlDeathKinds = new Set(Object.keys(ctl.deathKinds));
  const newDeathKinds = Object.keys(arm.deathKinds).filter(k => !ctlDeathKinds.has(k));
  out.lever = {
    awayWildRatioCtl: ctl.ratio['away_wild'],
    awayWildRatioArm: arm.ratio['away_wild'],
    permGlutDaysCtl: ctl.glutPairs, permGlutDaysArm: arm.glutPairs,
    permGlutCfgCtl: ctl.permGlut, permGlutCfgArm: arm.permGlut,
    leanInflowAwayCtl: ctlLean['away_wild'], leanInflowAwayArm: armLean['away_wild'],
    starveDaysCtl: ctl.starveDays, starveDaysArm: arm.starveDays,
    medianCtl: ctl.median, medianArm: arm.median,
    launderMiss, newDeathKinds,
    // GO bars
    goPrimaryRatio: arm.ratio['away_wild'] <= 0.9,
    goPermGlut: arm.glutPairs <= ctl.glutPairs * 0.7,
    guardLean: armLean['away_wild'] >= (ctlLean['away_wild'] || 0) * 1.0,
    guardStarve: arm.starveDays <= ctl.starveDays,
    guardSurvival: arm.median >= ctl.median - 10,
    guardLaunder: launderMiss.length === 0,
    guardDeaths: newDeathKinds.length === 0,
  };
}

const outPath = opt.out || (opt.armed ? 'evidence/2026-10-21/prodrebuff-lever-analysis.json' : 'evidence/2026-10-21/prodrebuff-analysis.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, (k, v) => v === Infinity ? 'Infinity' : v, 1));
console.log('wrote ' + outPath);

// DIAG verdict block
const D = out.control;
console.log('\n=== DIAG VERDICT (sim-prodrebuff-b) ===');
console.log(`runs=${D.runs} dayPairs=${D.dayPairs} glut=${D.glutPairs} lean=${D.leanPairs} unattMax=${(D.unattMax * 100).toFixed(2)}%`);
console.log('throttle coefficients (Spearman rho fd→inflow, fd∈[2,30]) + glut/lean ratio + marginal glut share:');
const order = Object.keys(D.coeff).sort((a, b) => (D.margShare[b] || 0) - (D.margShare[a] || 0));
for (const ch of order) {
  const rho = D.coeff[ch] === null ? 'null' : D.coeff[ch].toFixed(2);
  const r = D.ratio[ch] === null ? 'null' : (D.ratio[ch] === 'Infinity' ? 'Inf' : D.ratio[ch].toFixed(2));
  console.log(`  ${ch.padEnd(22)} rho=${rho} ratio=${r} margShare=${(D.margShare[ch] * 100).toFixed(1)}%`);
}
console.log(`permanent-glut configs: ${D.permGlut}/${D.runs}`);
console.log(`wall: won ${D.won}/${D.runs} national ${D.national}/${D.runs} table ${D.table}/${D.runs} wave4 ${D.wave4}/${D.runs} wave5 ${D.wave5}/${D.runs} median ${D.median}d max ${D.max}d starveDays ${D.starveDays}`);
if (out.lever) {
  const L = out.lever;
  console.log('\n=== LEVER VERDICT (RETURNINTAKE pilot) ===');
  console.log(`away_wild ratio: ctl=${L.awayWildRatioCtl && L.awayWildRatioCtl.toFixed ? L.awayWildRatioCtl.toFixed(2) : L.awayWildRatioCtl} arm=${L.awayWildRatioArm && L.awayWildRatioArm.toFixed ? L.awayWildRatioArm.toFixed(2) : L.awayWildRatioArm} GO(≤0.9): ${L.goPrimaryRatio}`);
  console.log(`perm-glut configs: ${L.permGlutCfgCtl}→${L.permGlutCfgArm}; perm-glut day-pairs: ${L.permGlutDaysCtl}→${L.permGlutDaysArm} GO(≤0.7x): ${L.goPermGlut}`);
  console.log(`lean away inflow: ${L.leanInflowAwayCtl.toFixed(0)}→${L.leanInflowAwayArm.toFixed(0)} guard(≥ctl): ${L.guardLean}`);
  console.log(`starveDays: ${L.starveDaysCtl}→${L.starveDaysArm} guard(≤ctl): ${L.guardStarve}`);
  console.log(`median survival: ${L.medianCtl}→${L.medianArm} guard(≥ctl−10): ${L.guardSurvival}`);
  console.log(`laundering: ${L.launderMiss.length ? L.launderMiss.join(',') : 'none'} guard: ${L.guardLaunder}`);
  console.log(`new death kinds: ${L.newDeathKinds.length ? L.newDeathKinds.join(',') : 'none'} guard: ${L.guardDeaths}`);
}
