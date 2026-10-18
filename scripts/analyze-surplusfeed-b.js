#!/usr/bin/env node
// analyze-surplusfeed-b.js — pair aggregation + GO/NO-GO/KILL judging for the
// surplus-share governor pilot (arm sim-surplusfeed-b).
//
// Usage: node scripts/analyze-surplusfeed-b.js <dir-with-4-sweep-jsons> [out.json]
// Judges the pre-registered header in evidence/2026-10-18/sim-surplusfeed-b.md:
//   PRIMARY: rot/100d <= 0.85x vs control (pooled pairs).
//   ENGAGEMENT: trims on >=50% of glut-days; share_surplus armed < control on >=75% of pairs.
//   KILL-FAST: zero trim events on every pair -> KILL.
//   GUARDRAILS: ate/person-day >= control; starveDays <= control+2; median
//     survival >= control-10d; no new death mode; det-gate byte-identical (separate).
'use strict';
const fs = require('fs'), path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-18/perseed-surplusfeed-b';
const out = process.argv[3] || null;

function load(side, policy) {
  const f = path.join(dir, `sweep-${side}-${policy}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

const pairs = [];
for (const policy of ['leadfeast', 'belongfeast']) {
  const c = load('control', policy), a = load('armed', policy);
  const am = {};
  for (const r of a.rows) am[r.seed] = r.end;
  for (const r of c.rows) {
    const ae = am[r.seed];
    if (!ae) { console.error('missing armed pair for seed ' + r.seed + ' ' + policy); continue; }
    pairs.push({ seed: r.seed, policy, c: r.end, a: ae });
  }
}

const rot100 = e => (e.rotFresh || 0) / Math.max(1, e.days) * 100;
let rotC = 0, rotA = 0;
const causes = { c: {}, a: {} };
for (const p of pairs) {
  rotC += rot100(p.c); rotA += rot100(p.a);
  for (const d of (p.c.deaths || [])) causes.c[d.cause] = (causes.c[d.cause] || 0) + 1;
  for (const d of (p.a.deaths || [])) causes.a[d.cause] = (causes.a[d.cause] || 0) + 1;
}
const primaryRatio = rotA / Math.max(1e-9, rotC);

const trimTotal = pairs.reduce((t, p) => t + (p.a.trimEvents || 0), 0);
const glutDaysTotal = pairs.reduce((t, p) => t + (p.c.glutDays || 0), 0);
const engagement = trimTotal > 0 ? pairs.reduce((t, p) => t + (p.a.trimDays || 0), 0) / Math.max(1, glutDaysTotal) : 0;
const surplusWinFrac = pairs.filter(p => p.a.shareSurplus < p.c.shareSurplus).length / pairs.length;

const ateOk = pairs.filter(p => p.a.atePerVday >= p.c.atePerVday - 1e-9).length;
const starveOk = pairs.filter(p => p.a.starveDays <= p.c.starveDays + 2).length;
const med = xs => { const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const survC = med(pairs.map(p => p.c.days)), survA = med(pairs.map(p => p.a.days));
const survOk = survA >= survC - 10;
const newModes = Object.keys(causes.a).filter(k => !causes.c[k]);

const newModesBig = newModes.filter(k => (causes.a[k] || 0) >= 3);
const verdict = trimTotal === 0 ? 'KILL'
  : (primaryRatio <= 0.85 && engagement >= 0.5 && surplusWinFrac >= 0.75 &&
     ateOk === pairs.length && starveOk === pairs.length && survOk && newModesBig.length === 0)
    ? 'GO' : 'NO-GO';

const rep = {
  pairs: pairs.length,
  primary: { rot100d_control: +rotC.toFixed(0), rot100d_armed: +rotA.toFixed(0), ratio: +primaryRatio.toFixed(3), go: primaryRatio <= 0.85 },
  engagement: { trimEvents: trimTotal, trimDaysOnGlutFrac: +engagement.toFixed(3), go: engagement >= 0.5,
    surplusWinFrac: +surplusWinFrac.toFixed(3), goSurplus: surplusWinFrac >= 0.75 },
  guardrails: {
    atePairsOk: ateOk + '/' + pairs.length,
    starvePairsOk: starveOk + '/' + pairs.length,
    medianSurvival: { control: survC, armed: survA, ok: survOk },
    deathCauses: { control: causes.c, armed: causes.a, newModes, newModesBig },
  },
  wall: {
    national: pairs.map(p => p.a.nationalLive).filter(Boolean).length + '/' + pairs.length,
    table: pairs.map(p => p.a.tableWaiting).filter(Boolean).length + '/' + pairs.length,
    wins: pairs.map(p => p.a.won).filter(Boolean).length + '/' + pairs.length,
    wave4: pairs.map(p => p.a.maxWave >= 4).filter(Boolean).length + '/' + pairs.length,
    wave5: pairs.map(p => p.a.maxWave >= 5).filter(Boolean).length + '/' + pairs.length,
  },
  perPair: pairs.map(p => ({
    seed: p.seed, policy: p.policy,
    rotC: Math.round(p.c.rotFresh / 1000) + 'k', rotA: Math.round(p.a.rotFresh / 1000) + 'k',
    ratio: +((p.a.rotFresh / Math.max(1, p.a.days)) / Math.max(1e-9, p.c.rotFresh / Math.max(1, p.c.days))).toFixed(2),
    shareC: Math.round(p.c.shareSurplus / 1000) + 'k', shareA: Math.round(p.a.shareSurplus / 1000) + 'k',
    trims: p.a.trimEvents + '/' + p.a.trimDays + 'd', glut: p.c.glutDays + 'd',
    ateC: p.c.atePerVday, ateA: p.a.atePerVday,
    starveC: p.c.starveDays, starveA: p.a.starveDays,
    daysC: p.c.days, daysA: p.a.days, endC: p.c.endReason, endA: p.a.endReason,
  })),
  verdict,
};
console.log(JSON.stringify(rep, null, 1));
if (out) fs.writeFileSync(out, JSON.stringify(rep, null, 1) + '\n');
console.log('VERDICT: ' + verdict);
