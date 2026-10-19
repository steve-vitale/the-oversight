#!/usr/bin/env node
// analyze-spikechar-b.js — intra-day glut-spike characterization analysis
// (arm sim-spikechar-b, run fleshout-loop-b-20261019T0317Z).
//
// Reads evidence/2026-10-19/perseed-spikechar-b/sweep-{leadfeast,belongfeast}.json
// and judges the pre-registered diagnostic bars (see evidence/2026-10-19/
// sim-spikechar-b.md — the header was written BEFORE the sweep):
//   GO (watch item REAL): (1) leanWindowTrims = 0; (2) >=6/8 pairs show >=1
//     attributed same-cycle ordering (spike trim day D or D-1 precedes the
//     dayEnded=D post-census mild-hunger day, trimSeq < censusSeq verified);
//     (3) dose-response positive: median over pairs of max(r_lag0, r_lag1) > 0
//     AND >=6/8 pairs positive.
//   NO-GO otherwise, with the watch item explained away.
//
// Per-pair Pearson: day-level series pooled over the pair's two runs
// (spikeD, mildD) and (spikeD, mild_{D+1}).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.env.EVDIR || 'evidence/2026-10-19/perseed-spikechar-b';

function classify(t) {
  if (!t.trim) return 'no-trim';
  if (!(t.fireFd > 4)) return 'leanWindow';
  if (!(t.dawnFd >= 0)) return 'unknownDawn';
  if (t.dawnFd <= 4) return 'spike';
  return 'glut';
}

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

function load(policy) {
  return JSON.parse(fs.readFileSync(path.join(DIR, `sweep-${policy}.json`), 'utf8'));
}

// Per-run day series + classification.
function runStats(row) {
  const { govLog, census } = row.char;
  const classes = { spike: 0, glut: 0, unknownDawn: 0, leanWindow: 0 };
  const spikeByDay = new Map();   // day -> [{seq}]
  const spikeSeqByDay = new Map();
  for (const g of govLog) {
    if (!g.trim) continue;
    const c = classify(g);
    classes[c]++;
    if (c === 'spike') {
      if (!spikeByDay.has(g.day)) { spikeByDay.set(g.day, 0); spikeSeqByDay.set(g.day, []); }
      spikeByDay.set(g.day, spikeByDay.get(g.day) + 1);
      spikeSeqByDay.get(g.day).push(g.seq);
    }
  }
  const post = census.filter(c => c.phase === 'post');
  const pre = census.filter(c => c.phase === 'pre');
  const mildByDay = new Map(post.map(c => [c.dayEnded, c.nHungry > 0 ? 1 : 0]));
  const censusSeqByDay = new Map(post.map(c => [c.dayEnded, c.seq]));
  // day series over days that have a post census
  const days = [...mildByDay.keys()].sort((a, b) => a - b);
  const xs = [], y0 = [], y1 = [];
  for (const d of days) {
    xs.push(spikeByDay.get(d) || 0);
    y0.push(mildByDay.get(d));
    y1.push(mildByDay.has(d + 1) ? mildByDay.get(d + 1) : null);
  }
  const y1f = y1.filter(v => v !== null);
  const x1f = xs.filter((_, i) => y1[i] !== null);
  // attribution: mild day D with a spike trim on D or D-1, seq-verified
  let attributed = 0, seqViolations = 0;
  const attributedDays = [];
  for (const d of days) {
    if (!mildByDay.get(d)) continue;
    const cs = censusSeqByDay.get(d);
    let ok = false;
    for (const dd of [d, d - 1]) {
      for (const s of (spikeSeqByDay.get(dd) || [])) {
        if (s < cs) { ok = true; } else { seqViolations++; }
      }
    }
    if (ok) { attributed++; attributedDays.push(d); }
  }
  const mildDays = days.filter(d => mildByDay.get(d)).length;
  return {
    seed: row.seed, days: row.end.days,
    classes, trims: classes.spike + classes.glut + classes.unknownDawn + classes.leanWindow,
    spikeTot: classes.spike,
    mildDays, mildRate100: days.length ? +(mildDays / days.length * 100).toFixed(2) : 0,
    mildDaysPre: pre.filter(c => c.nHungry > 0).length,
    rLag0: pearson(xs, y0), rLag1: pearson(x1f, y1f), nPts: xs.length,
    attributed, attributedDays, seqViolations,
  };
}

const lead = load('leadfeast'), belong = load('belongfeast');
const seeds = lead.meta.seeds;
const pairs = seeds.map(s => {
  const L = runStats(lead.rows.find(r => r.seed === s));
  const B = runStats(belong.rows.find(r => r.seed === s));
  // pooled day-level Pearson across the pair's two runs
  // (recompute from pooled series for exactness)
  return { seed: s, L, B };
});

// Pooled per-pair Pearson: rebuild pooled series.
function pooledPearson(s) {
  const rows = [lead.rows.find(r => r.seed === s), belong.rows.find(r => r.seed === s)];
  const xs = [], y0 = [], y1 = [];
  for (const row of rows) {
    const { govLog, census } = row.char;
    const spikeByDay = new Map();
    for (const g of govLog) {
      if (g.trim && classify(g) === 'spike') spikeByDay.set(g.day, (spikeByDay.get(g.day) || 0) + 1);
    }
    const post = census.filter(c => c.phase === 'post').sort((a, b) => a.dayEnded - b.dayEnded);
    const mild = new Map(post.map(c => [c.dayEnded, c.nHungry > 0 ? 1 : 0]));
    const days = [...mild.keys()].sort((a, b) => a - b);
    for (const d of days) {
      xs.push(spikeByDay.get(d) || 0); y0.push(mild.get(d));
    }
  }
  // lag-1 aligned arrays
  const x1 = [], yy1 = [];
  for (const row of rows) {
    const { govLog, census } = row.char;
    const spikeByDay = new Map();
    for (const g of govLog) {
      if (g.trim && classify(g) === 'spike') spikeByDay.set(g.day, (spikeByDay.get(g.day) || 0) + 1);
    }
    const post = census.filter(c => c.phase === 'post').sort((a, b) => a.dayEnded - b.dayEnded);
    const mild = new Map(post.map(c => [c.dayEnded, c.nHungry > 0 ? 1 : 0]));
    for (const d of [...mild.keys()].sort((a, b) => a - b)) {
      if (mild.has(d + 1)) { x1.push(spikeByDay.get(d) || 0); yy1.push(mild.get(d + 1)); }
    }
  }
  return { r0: pearson(xs, y0), r1: pearson(x1, yy1), n0: xs.length, n1: x1.length };
}

console.log('seed   policy      trims  spike  glut  unkDwn leanW  mildD  mild/100d  attrib  rLag0   rLag1');
const pairRows = [];
for (const p of pairs) {
  const pp = pooledPearson(p.seed);
  for (const [tag, R] of [['lead', p.L], ['belong', p.B]]) {
    console.log(
      `${p.seed} ${tag.padEnd(10)} ${String(R.trims).padStart(5)} ${String(R.classes.spike).padStart(6)}` +
      `${String(R.classes.glut).padStart(6)}${String(R.classes.unknownDawn).padStart(7)}${String(R.classes.leanWindow).padStart(6)}` +
      `${String(R.mildDays).padStart(7)}${String(R.mildRate100).padStart(10)}${String(R.attributed).padStart(8)}` +
      `${R.rLag0 === null ? '   null' : R.rLag0.toFixed(3).padStart(8)}${R.rLag1 === null ? '   null' : R.rLag1.toFixed(3).padStart(8)}`
    );
  }
  // dose delta: high-spike run vs low-spike run within the pair
  const hi = p.L.spikeTot >= p.B.spikeTot ? p.L : p.B;
  const lo = p.L.spikeTot >= p.B.spikeTot ? p.B : p.L;
  const dDose = hi.spikeTot - lo.spikeTot;
  const dMild = hi.mildRate100 - lo.mildRate100;
  const rMax = Math.max(pp.r0 === null ? -Infinity : pp.r0, pp.r1 === null ? -Infinity : pp.r1);
  pairRows.push({
    seed: p.seed, r0: pp.r0, r1: pp.r1, n0: pp.n0, n1: pp.n1, rMax,
    dDose, dMild, attrib: p.L.attributed + p.B.attributed,
    seqViol: p.L.seqViolations + p.B.seqViolations,
  });
  console.log(`  -> pair ${p.seed}: pooled rLag0=${pp.r0 === null ? 'null' : pp.r0.toFixed(3)} rLag1=${pp.r1 === null ? 'null' : pp.r1.toFixed(3)} (n=${pp.n0}/${pp.n1}) doseΔ=${dDose} mildRateΔ=${dMild.toFixed(2)}/100d attrib=${p.L.attributed + p.B.attributed} seqViol=${p.L.seqViolations + p.B.seqViolations}`);
}

const tot = { spike: 0, glut: 0, unknownDawn: 0, leanWindow: 0, trims: 0, mild: 0, attrib: 0, seqViol: 0 };
for (const p of pairs) for (const R of [p.L, p.B]) {
  tot.spike += R.classes.spike; tot.glut += R.classes.glut;
  tot.unknownDawn += R.classes.unknownDawn; tot.leanWindow += R.classes.leanWindow;
  tot.trims += R.trims; tot.mild += R.mildDays; tot.attrib += R.attributed; tot.seqViol += R.seqViolations;
}
console.log(`\nTOTALS: trims=${tot.trims} spike=${tot.spike} (${(tot.spike / Math.max(1, tot.trims) * 100).toFixed(1)}%) glut=${tot.glut} unknownDawn=${tot.unknownDawn} leanWindow=${tot.leanWindow} mildDays=${tot.mild} attributed=${tot.attrib} seqViolations=${tot.seqViol}`);

// ---- pre-registered bars ----
const bar1 = tot.leanWindow === 0;
const pairsWithOrder = pairRows.filter(p => p.attrib > 0).length;
const bar2 = pairsWithOrder >= 6;
const posPairs = pairRows.filter(p => p.rMax > 0).length;
const rMaxes = pairRows.map(p => p.rMax).filter(v => v > -Infinity).sort((a, b) => a - b);
const median = rMaxes.length ? (rMaxes.length % 2 ? rMaxes[(rMaxes.length - 1) / 2] : (rMaxes[rMaxes.length / 2 - 1] + rMaxes[rMaxes.length / 2]) / 2) : null;
const bar3 = median !== null && median > 0 && posPairs >= 6;
console.log(`\nBAR1 leanWindow=0: ${bar1} (leanWindow=${tot.leanWindow})`);
console.log(`BAR2 >=6/8 pairs with >=1 attributed ordering: ${bar2} (${pairsWithOrder}/8)`);
console.log(`BAR3 dose-response positive (median max(r)>0, >=6/8 positive): ${bar3} (median=${median === null ? 'null' : median.toFixed(3)}, positive=${posPairs}/8)`);
console.log(`\nVERDICT: ${bar1 && bar2 && bar3 ? 'GO — watch item REAL (spike trims cause mild hunger)' : 'NO-GO — watch item explained away (see evidence file)'}`);

// ---- wall numbers ----
let nat = 0, tab = 0, win = 0, w4 = 0, w5 = 0;
const surv = [];
for (const p of pairs) for (const R of [p.L, p.B]) {
  const e = (p.L === R ? lead : belong).rows.find(r => r.seed === p.seed).end;
  if (e.nationalLive) nat++; if (e.tableWaiting) tab++; if (e.won) win++;
  if (e.maxWave >= 4) w4++; if (e.maxWave >= 5) w5++;
  surv.push(e.days);
}
surv.sort((a, b) => a - b);
const med = surv.length % 2 ? surv[(surv.length - 1) / 2] : (surv[surv.length / 2 - 1] + surv[surv.length / 2]) / 2;
console.log(`\nWALL (armed, 16 runs): national ${nat}/16, table ${tab}/16, wins ${win}/16, wave-4 ${w4}/16, wave-5 ${w5}/16, median survival ${med}d, max ${surv[surv.length - 1]}d`);

// machine-readable summary
const out = {
  totals: tot, bars: { bar1, bar2, bar3, pairsWithOrder, posPairs, medianRmax: median },
  verdict: (bar1 && bar2 && bar3) ? 'GO' : 'NO-GO',
  pairs: pairRows,
  wall: { national: nat, table: tab, wins: win, wave4: w4, wave5: w5, medianSurv: med, maxSurv: surv[surv.length - 1] },
};
fs.writeFileSync(path.join(DIR, 'spikechar-b-analysis.json'), JSON.stringify(out, null, 1));
console.log('wrote ' + path.join(DIR, 'spikechar-b-analysis.json'));
