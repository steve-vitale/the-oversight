#!/usr/bin/env node
// secondary-spikechar-b.js — SECONDARY (not pre-registered) analysis for
// sim-spikechar-b: dose-response on the PRE-sleep census (pilot phase).
//
// The primary (post-census) verdict is NO-GO. This secondary asks whether the
// pilot-phase transient hunger (the actual +16% watch-item phase) shows any
// spike-dose signal, using only seq-valid trims: a spike trim labeled day X
// counts toward pre-census day D iff X in {D, D-1} AND trimSeq < preSeq(D).
// (In-sleep day-D trims do NOT precede the day-D pre-census and are excluded.)
// Clearly labeled secondary: informs the named next, does not re-judge bars.
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

const lead = load('leadfeast'), belong = load('belongfeast');
console.log('pair  rPre_lag0  rPre_lag1  preMild_hi  preMild_lo  dose_hi dose_lo');
for (const s of lead.meta.seeds) {
  const runs = [lead.rows.find(r => r.seed === s), belong.rows.find(r => r.seed === s)];
  const xs = [], y0 = [], x1 = [], y1 = [];
  const preRates = [];
  for (const row of runs) {
    const { govLog, census } = row.char;
    const pre = census.filter(c => c.phase === 'pre').sort((a, b) => a.dayEnded - b.dayEnded);
    const preSeq = new Map(pre.map(c => [c.dayEnded, c.seq]));
    const mildPre = new Map(pre.map(c => [c.dayEnded, c.nHungry > 0 ? 1 : 0]));
    const spikes = govLog.filter(g => g.trim && classify(g) === 'spike');
    // seq-valid spike dose per pre-census day D: trims labeled D or D-1 with seq < preSeq(D)
    const doseByDay = new Map();
    for (const c of pre) {
      const D = c.dayEnded;
      let n = 0;
      for (const g of spikes) {
        if ((g.day === D || g.day === D - 1) && g.seq < c.seq) n++;
      }
      doseByDay.set(D, n);
    }
    const days = [...mildPre.keys()].sort((a, b) => a - b);
    for (const d of days) { xs.push(doseByDay.get(d) || 0); y0.push(mildPre.get(d)); }
    for (const d of days) {
      if (mildPre.has(d + 1)) { x1.push(doseByDay.get(d) || 0); y1.push(mildPre.get(d + 1)); }
    }
    const spikeTot = spikes.length;
    const preMildDays = [...mildPre.values()].filter(Boolean).length;
    preRates.push({ spikeTot, preMildDays, rate: preMildDays / Math.max(1, days.length) * 100 });
  }
  const hi = preRates[0].spikeTot >= preRates[1].spikeTot ? preRates[0] : preRates[1];
  const lo = preRates[0].spikeTot >= preRates[1].spikeTot ? preRates[1] : preRates[0];
  const r0 = pearson(xs, y0), r1 = pearson(x1, y1);
  console.log(`${s}  ${r0 === null ? 'null' : r0.toFixed(3)}    ${r1 === null ? 'null' : r1.toFixed(3)}    ${hi.preMildDays}(${hi.rate.toFixed(1)}/100d)  ${lo.preMildDays}(${lo.rate.toFixed(1)}/100d)  ${hi.spikeTot} ${lo.spikeTot}`);
}
