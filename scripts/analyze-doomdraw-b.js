#!/usr/bin/env node
// analyze-doomdraw-b.js — aggregator with the pre-registered verdict
// (sim-doomdraw-b). Reads the 4 sweep files, judges against the evidence
// header: PRIMARY rot/100d <= 0.85x; ENGAGEMENT bound nights >= 8 (armed),
// doomed-drawn share >= 60%; guardrails: survival >= control-10d,
// dose-aware starve-rate (pooled >+15% AND Pearson(dose, rate-delta) > +0.3),
// new-death-mode (exposure-matched, >=2 floor), laundering 0.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.env.SWEEP_DIR || '/tmp/sim-doomdraw-b';
const POLICIES = ['leaddoomdraw', 'belongdoomdraw'];
const SEEDS = [6551, 6552, 6553, 6554, 6555, 6556, 6557, 6558];

function load(side, policy) {
  const f = path.join(DIR, `sweep-${side}-${policy}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8')).rows;
}
const C = {}, A = {};
for (const p of POLICIES) { C[p] = load('control', p); A[p] = load('armed', p); }

const pairs = [];
for (const p of POLICIES) for (const s of SEEDS) {
  const c = C[p].find(r => r.seed === s), a = A[p].find(r => r.seed === s);
  if (c && a) pairs.push({ policy: p, seed: s, c: c.end, a: a.end });
}

const rot100 = e => (e.days > 0 ? 100 * (e.rotFresh + e.rotPreserved) / e.days : 0);
const starve100 = e => (e.days > 0 ? 100 * e.starveDays / e.days : 0);
const median = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const pearson = (xs, ys) => {
  const n = xs.length; if (n < 3) return NaN;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return (sxx > 0 && syy > 0) ? sxy / Math.sqrt(sxx * syy) : NaN;
};

// ---- PRIMARY: rot/100d pooled absolute ----
let cRot = 0, cDays = 0, aRot = 0, aDays = 0;
for (const { c, a } of pairs) {
  cRot += c.rotFresh + c.rotPreserved; cDays += c.days;
  aRot += a.rotFresh + a.rotPreserved; aDays += a.days;
}
const cRot100 = 100 * cRot / cDays, aRot100 = 100 * aRot / aDays;
const rotRatio = aRot100 / cRot100;

// ---- ENGAGEMENT ----
let boundNights = 0, doomedDrawn = 0, drawnTotal = 0, withheld = 0, voiced = 0;
for (const { a } of pairs) {
  boundNights += a.ddBound || 0; doomedDrawn += a.ddDoomedDrawn || 0;
  drawnTotal += a.ddDrawnTotal || 0; withheld += a.ddWithheld || 0; voiced += a.ddVoiced || 0;
}
let cDoomed = 0, cDrawn = 0;
for (const { c } of pairs) { cDoomed += c.ddDoomedDrawn || 0; cDrawn += c.ddDrawnTotal || 0; }
const doomedShare = drawnTotal ? doomedDrawn / drawnTotal : NaN;
const cDoomedShare = cDrawn ? cDoomed / cDrawn : NaN;

// ---- survival ----
const cSurv = pairs.map(({ c }) => c.days), aSurv = pairs.map(({ a }) => a.days);
const medC = median(cSurv), medA = median(aSurv);

// ---- starve rate (dose-aware) ----
let cStarve = 0, aStarve = 0;
for (const { c, a } of pairs) { cStarve += c.starveDays; aStarve += a.starveDays; }
const cStarve100 = 100 * cStarve / cDays, aStarve100 = 100 * aStarve / aDays;
const pooledRise = cStarve100 > 0 ? (aStarve100 - cStarve100) / cStarve100 : NaN;
const doses = [], rateDeltas = [];
for (const { c, a } of pairs) {
  if (c.days <= 30 || a.days <= 30) continue; // collapse-aware
  doses.push(a.ddBound || 0);
  rateDeltas.push(starve100(a) - starve100(c));
}
const rDose = pearson(doses, rateDeltas);

// ---- new death mode (exposure-matched, >=2 floor) ----
const canon = s => s.replace(/dehydration/g, 'thirst');
const cCauses = new Set();
for (const { c } of pairs) for (const d of (c.deaths || [])) cCauses.add(canon(d.cause));
const armedCounts = {};
for (const { c, a } of pairs) {
  for (const d of (a.deaths || [])) {
    if (d.day > c.days) continue; // exposure-matched: control twin must be alive
    const k = canon(d.cause);
    armedCounts[k] = (armedCounts[k] || 0) + 1;
  }
}
const newModes = Object.entries(armedCounts).filter(([k, n]) => n >= 2 && !cCauses.has(k));

// ---- laundering / spoiled-drawn ----
let laundered = 0, spoiledC = 0, spoiledA = 0;
for (const { c, a } of pairs) { laundered += a.laundered || 0; spoiledC += c.spoiledDrawn || 0; spoiledA += a.spoiledDrawn || 0; }

// ---- wall numbers ----
const wall = rows => ({
  national: rows.filter(r => r.nationalLive).length,
  table: rows.filter(r => r.tableWaiting || r.won).length,
  wins: rows.filter(r => r.won).length,
  w4: rows.filter(r => r.maxWave >= 4).length,
  w5: rows.filter(r => r.maxWave >= 5).length,
});
const wallC = wall(pairs.map(({ c }) => c)), wallA = wall(pairs.map(({ a }) => a));

console.log('=== SIM-DOOMDRAW-B PILOT (32 runs) ===');
console.log(`PRIMARY rot/100d: control=${Math.round(cRot100)} armed=${Math.round(aRot100)} ratio=${rotRatio.toFixed(3)}  GO<=0.85: ${rotRatio <= 0.85 ? 'PASS' : 'FAIL'}`);
console.log(`ENGAGEMENT bound nights (armed): ${boundNights}  GO>=8: ${boundNights >= 8 ? 'PASS' : 'FAIL(invisible)'}`);
console.log(`ENGAGEMENT doomed-drawn share: armed=${(100 * doomedShare).toFixed(0)}% control=${(100 * cDoomedShare).toFixed(0)}%  GO>=60%: ${doomedShare >= 0.6 ? 'PASS' : 'FAIL'}`);
console.log(`withheld=${Math.round(withheld / 1000)}k voiced=${voiced}`);
console.log(`survival median: control=${medC.toFixed(0)}d armed=${medA.toFixed(0)}d  guard>=control-10d: ${medA >= medC - 10 ? 'PASS' : 'FAIL'}`);
console.log(`starveDays/100d pooled: control=${cStarve100.toFixed(1)} armed=${aStarve100.toFixed(1)} rise=${(100 * pooledRise).toFixed(1)}%`);
console.log(`dose-response Pearson(bound nights, rate delta)=${Number.isFinite(rDose) ? rDose.toFixed(2) : 'n/a'} (n=${doses.length})`);
const starveFail = pooledRise > 0.15 && rDose > 0.3;
console.log(`guard starve-rate (fail iff rise>+15% AND r>+0.3): ${starveFail ? 'FAIL' : 'PASS'}`);
console.log(`new death modes (exposure-matched, >=2): ${newModes.length ? newModes.map(([k, n]) => k + 'x' + n).join(', ') : 'none'}  ${newModes.length ? 'FAIL' : 'PASS'}`);
console.log(`laundered=${laundered}  ${laundered === 0 ? 'PASS' : 'FAIL'}`);
console.log(`spoiledDrawn: control=${Math.round(spoiledC / 1000)}k armed=${Math.round(spoiledA / 1000)}k`);
console.log(`wall control: national ${wallC.national}/16 table ${wallC.table}/16 wins ${wallC.wins}/16 w4 ${wallC.w4}/16 w5 ${wallC.w5}/16`);
console.log(`wall armed:   national ${wallA.national}/16 table ${wallA.table}/16 wins ${wallA.wins}/16 w4 ${wallA.w4}/16 w5 ${wallA.w5}/16`);
console.log('\nper-pair:');
console.log('policy seed | rotC->A (ratio) | bound | survC->A | starveC->A/100d');
for (const { policy, seed, c, a } of pairs) {
  const rr = rot100(c) > 0 ? (rot100(a) / rot100(c)).toFixed(2) : '-';
  console.log(`${policy.replace('doomdraw', '')} ${seed} | ${Math.round(rot100(c) / 1000)}k->${Math.round(rot100(a) / 1000)}k (${rr}) | ${(a.ddBound || 0)} | ${c.days}->${a.days} | ${starve100(c).toFixed(1)}->${starve100(a).toFixed(1)}`);
}

const goPrimary = rotRatio <= 0.85;
const goEngage = boundNights >= 8 && doomedShare >= 0.6;
const goGuards = (medA >= medC - 10) && !starveFail && !newModes.length && laundered === 0;
const verdict = (goPrimary && goEngage && goGuards) ? 'GO' : 'NO-GO';
console.log(`\nVERDICT: ${verdict} (primary:${goPrimary ? 'PASS' : 'FAIL'} engagement:${goEngage ? 'PASS' : 'FAIL'} guards:${goGuards ? 'PASS' : 'FAIL'})`);
fs.writeFileSync(path.join(DIR, 'doomdraw-pilot-verdict.json'), JSON.stringify({
  rotRatio: +rotRatio.toFixed(4), boundNights, doomedShare: +doomedShare.toFixed(4),
  medC, medA, pooledRise: +pooledRise.toFixed(4), rDose: Number.isFinite(rDose) ? +rDose.toFixed(3) : null,
  newModes, laundered, wallC, wallA, verdict,
}, null, 2) + '\n');
