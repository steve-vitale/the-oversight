#!/usr/bin/env node
// analyze-surplusfeed-national-b.js — verdict analysis for sim-surplusfeed-national-b.
//
// Reads evidence/2026-10-20/perseed-surplusfeed-national-b/{control,armed}-{leadfeast,belongfeast}.json
// (paired on identical seeds) and judges the pre-registered DIAG-GO bar:
//
// DIAG-GO (mechanism confirmed) iff ALL hold:
//   1. SPEND-DOSE: Pearson(trimKcal, feastGiftSpendDelta) >= 0.6 — the
//      trimmed kcal taxes the recurring standing-economy spend (feasts +
//      accord/renegotiation gifts; court ceremony excluded — it is the
//      outcome-scale payment, not the recurring mechanism).
//   2. STANDING-SLOW: armed standing trajectories materially slower —
//      median day-120 total standing armed < control on >= 75% of paired
//      seeds, AND the plenty component shows the deficit (armed mean
//      plenty <= control mean plenty on those seeds).
//   3. GAP-SIGNATURE: 100% of national-gap seeds (control national, armed
//      not) show a standing-deficit signature: at the day control's court
//      sat (nationalDay), armed standing total <= control's at the same day
//      minus 10 pts (noise floor).
//
// Verdict classes: DIAG-GO | open (mechanism unproven).
// Usage: node scripts/analyze-surplusfeed-national-b.js [--json]
'use strict';
const fs = require('fs');

const DIR = 'evidence/2026-10-20/perseed-surplusfeed-national-b';

function load(side, policy) {
  const p = `${DIR}/${side}-${policy}.json`;
  return JSON.parse(fs.readFileSync(p, 'utf8')).rows;
}

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return NaN;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) * (xs[i] - mx);
    syy += (ys[i] - my) * (ys[i] - my);
  }
  return (sxx > 0 && syy > 0) ? sxy / Math.sqrt(sxx * syy) : NaN;
}

// national hit = ever hit (nationalDay persists even when the realm later
// dissolves — national is a LIVE state; end-state nationalLive alone
// understates reach). traj rows are [d,t,war,dip,ple,feasts,nat,pend].
function everNational(row) {
  if (row.nationalDay > 0) return true;
  const tr = (row.stand && row.stand.traj) || [];
  return tr.some(x => x[6] > 0);
}
// standing total at day D (last sample <= D)
function standAt(row, D) {
  const tr = (row.stand && row.stand.traj) || [];
  let best = null;
  for (const x of tr) if (x[0] <= D) best = x;
  return best;
}
function compAt(row, D, idx) { const x = standAt(row, D); return x ? x[idx] : 0; }

const pairs = [];
for (const policy of ['leadfeast', 'belongfeast']) {
  const C = load('control', policy), A = load('armed', policy);
  for (const c of C) {
    const a = A.find(r => r.seed === c.seed);
    if (!a) throw new Error(`missing armed pair for seed ${c.seed} ${policy}`);
    pairs.push({ seed: c.seed, policy, c, a });
  }
}

const out = { pairs: [], bars: {} };

// --- bar 1: SPEND-DOSE ---
const trim = [], spendDelta = [], feastDelta = [], giftDelta = [], feastQual = [];
for (const p of pairs) {
  const t = (p.a.sfeed && p.a.sfeed.trimKcal) || 0;
  const cSpend = ((p.c.spend && p.c.spend.feastKcal) || 0) + ((p.c.spend && p.c.spend.gift) || 0);
  const aSpend = ((p.a.spend && p.a.spend.feastKcal) || 0) + ((p.a.spend && p.a.spend.gift) || 0);
  trim.push(t);
  spendDelta.push(cSpend - aSpend);
  feastDelta.push(((p.c.spend && p.c.spend.feastKcal) || 0) - ((p.a.spend && p.a.spend.feastKcal) || 0));
  giftDelta.push(((p.c.spend && p.c.spend.gift) || 0) - ((p.a.spend && p.a.spend.gift) || 0));
  const cFeasts = ((p.c.spend && p.c.spend.feastEvents) || []).filter(f => f.q >= 1).length;
  const aFeasts = ((p.a.spend && p.a.spend.feastEvents) || []).filter(f => f.q >= 1).length;
  feastQual.push({ seed: p.seed, policy: p.policy, c: cFeasts, a: aFeasts });
}
const rSpend = pearson(trim, spendDelta);
const rFeast = pearson(trim, feastDelta);
const rGift = pearson(trim, giftDelta);
out.bars.spendDose = {
  rSpend: +rSpend.toFixed(3), rFeast: +rFeast.toFixed(3), rGift: +rGift.toFixed(3),
  bar: 0.6, pass: rSpend >= 0.6,
  trimMean: Math.round(trim.reduce((a, b) => a + b, 0) / trim.length),
  spendDeltaMean: Math.round(spendDelta.reduce((a, b) => a + b, 0) / spendDelta.length),
};

// --- bar 2: STANDING-SLOW (day-120 standing) ---
let slowerCount = 0, plentyDeficitCount = 0, evalCount = 0;
const standRows = [];
for (const p of pairs) {
  const cT = compAt(p.c, 120, 1), aT = compAt(p.a, 120, 1);
  const cP = compAt(p.c, 120, 4), aP = compAt(p.a, 120, 4);
  const cD = compAt(p.c, 120, 3), aD = compAt(p.a, 120, 3);
  const cW = compAt(p.c, 120, 2), aW = compAt(p.a, 120, 2);
  const has = p.c.stand && p.c.stand.n >= 2 && p.a.stand && p.a.stand.n >= 2;
  if (has) {
    evalCount++;
    if (aT < cT) slowerCount++;
    if (aP <= cP) plentyDeficitCount++;
  }
  standRows.push({
    seed: p.seed, policy: p.policy, days: p.c.days + '/' + p.a.days,
    cTot: cT, aTot: aT, cPle: cP, aPle: aP, cDip: cD, aDip: aD, cWar: cW, aWar: aW,
    nat: (p.c.national ? 1 : 0) + '/' + (p.a.national ? 1 : 0),
    trimK: Math.round(((p.a.sfeed && p.a.sfeed.trimKcal) || 0) / 1000),
  });
}
out.bars.standingSlow = {
  slowerShare: evalCount ? +(slowerCount / evalCount).toFixed(3) : NaN,
  plentyDeficitShare: evalCount ? +(plentyDeficitCount / evalCount).toFixed(3) : NaN,
  bar: 0.75, pass: evalCount > 0 && slowerCount / evalCount >= 0.75 && plentyDeficitCount / evalCount >= 0.75,
  evalCount,
};

// --- bar 3: GAP-SIGNATURE (ever-national basis) ---
const gapSeeds = pairs.filter(p => everNational(p.c) && !everNational(p.a));
const gapRows = [];
let sigCount = 0;
for (const p of gapSeeds) {
  const nd = p.c.nationalDay || 0;
  const cT = compAt(p.c, nd, 1), aT = compAt(p.a, nd, 1);
  const cP = compAt(p.c, nd, 4), aP = compAt(p.a, nd, 4);
  const sig = aT <= cT - 10;
  if (sig) sigCount++;
  // court affordability: pantry at control's nationalDay
  gapRows.push({
    seed: p.seed, policy: p.policy, natDay: nd, shape: p.c.nationalShape,
    cTot: cT, aTot: aT, cPle: cP, aPle: aP,
    deficitSig: sig,
    cCourtEvents: (p.c.spend && p.c.spend.courtEvents) || [],
    aCourtEvents: (p.a.spend && p.a.spend.courtEvents) || [],
    cSpend: Math.round((((p.c.spend && p.c.spend.feastKcal) || 0) + ((p.c.spend && p.c.spend.gift) || 0) + ((p.c.spend && p.c.spend.court) || 0)) / 1000),
    aSpend: Math.round((((p.a.spend && p.a.spend.feastKcal) || 0) + ((p.a.spend && p.a.spend.gift) || 0) + ((p.a.spend && p.a.spend.court) || 0)) / 1000),
  });
}
out.bars.gapSignature = {
  n: gapSeeds.length, sigCount, pass: gapSeeds.length > 0 && sigCount === gapSeeds.length,
};

// --- wall numbers (paired, armed / control) ---
const cnt = (rs, f) => rs.filter(f).length;
const C = pairs.map(p => p.c), A = pairs.map(p => p.a);
out.wall = {
  control: {
    won: cnt(C, r => r.won), national: cnt(C, r => r.national),
    nationalEver: cnt(C, r => everNational(r)),
    table: cnt(C, r => r.table),
    wave4: cnt(C, r => r.maxWave >= 4), wave5: cnt(C, r => r.maxWave >= 5),
    median: median(C.map(r => r.days)), max: Math.max(...C.map(r => r.days)),
  },
  armed: {
    won: cnt(A, r => r.won), national: cnt(A, r => r.national),
    nationalEver: cnt(A, r => everNational(r)),
    table: cnt(A, r => r.table),
    wave4: cnt(A, r => r.maxWave >= 4), wave5: cnt(A, r => r.maxWave >= 5),
    median: median(A.map(r => r.days)), max: Math.max(...A.map(r => r.days)),
  },
  n: pairs.length,
};
function median(xs) { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

out.pairs = pairs.map(p => ({
  seed: p.seed, policy: p.policy,
  days: p.c.days + '/' + p.a.days, nat: (p.c.national ? 1 : 0) + '/' + (p.a.national ? 1 : 0),
  rank: p.c.rank + '/' + p.a.rank,
  trimK: Math.round(((p.a.sfeed && p.a.sfeed.trimKcal) || 0) / 1000),
  feastK: Math.round(((p.c.spend && p.c.spend.feastKcal) || 0) / 1000) + '/' + Math.round(((p.a.spend && p.a.spend.feastKcal) || 0) / 1000),
  giftK: Math.round(((p.c.spend && p.c.spend.gift) || 0) / 1000) + '/' + Math.round(((p.a.spend && p.a.spend.gift) || 0) / 1000),
  courtK: Math.round(((p.c.spend && p.c.spend.court) || 0) / 1000) + '/' + Math.round(((p.a.spend && p.a.spend.court) || 0) / 1000),
  feastQ: ((((p.c.spend && p.c.spend.feastEvents) || []).filter(f => f.q >= 1).length) + '/' + (((p.a.spend && p.a.spend.feastEvents) || []).filter(f => f.q >= 1).length)),
  stand120: compAt(p.c, 120, 1) + '/' + compAt(p.a, 120, 1),
  honest: ((p.c.feastHonest && p.c.feastHonest.ok) ? 1 : 0) + '/' + ((p.a.feastHonest && p.a.feastHonest.ok) ? 1 : 0),
}));

out.standRows = standRows;
out.gapRows = gapRows;
out.feastQual = feastQual;
out.verdict = (out.bars.spendDose.pass && out.bars.standingSlow.pass && out.bars.gapSignature.pass) ? 'DIAG-GO' : 'open';

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(out, null, 1));
} else {
  console.log('=== sim-surplusfeed-national-b ===');
  console.log('wall (control / armed, n=' + out.wall.n + '):');
  for (const k of ['won', 'national', 'nationalEver', 'table', 'wave4', 'wave5']) console.log(`  ${k}: ${out.wall.control[k]} / ${out.wall.armed[k]}`);
  console.log(`  median: ${out.wall.control.median} / ${out.wall.armed.median}   max: ${out.wall.control.max} / ${out.wall.armed.max}`);
  console.log('bar 1 SPEND-DOSE: r(trim,feastGiftSpendDelta)=' + out.bars.spendDose.rSpend + ' (bar 0.6) feast r=' + out.bars.spendDose.rFeast + ' gift r=' + out.bars.spendDose.rGift + ' -> ' + (out.bars.spendDose.pass ? 'PASS' : 'MISS'));
  console.log('bar 2 STANDING-SLOW: slower share=' + out.bars.standingSlow.slowerShare + ' plenty-deficit share=' + out.bars.standingSlow.plentyDeficitShare + ' (bar 0.75, n=' + out.bars.standingSlow.evalCount + ') -> ' + (out.bars.standingSlow.pass ? 'PASS' : 'MISS'));
  console.log('bar 3 GAP-SIGNATURE: ' + out.bars.gapSignature.sigCount + '/' + out.bars.gapSignature.n + ' national-gap seeds show deficit signature -> ' + (out.bars.gapSignature.pass ? 'PASS' : 'MISS'));
  console.log('VERDICT: ' + out.verdict);
  console.log('\nper-pair (c/a):');
  for (const p of out.pairs) console.log(`  ${p.seed} ${p.policy} days=${p.days} nat=${p.nat} rank=${p.rank} trim=${p.trimK}k feast=${p.feastK}k gift=${p.giftK}k court=${p.courtK}k feastQ=${p.feastQ} stand120=${p.stand120} honest=${p.honest}`);
  if (gapRows.length) {
    console.log('\nnational-gap seeds:');
    for (const g of gapRows) console.log(`  ${g.seed} ${g.policy} natDay=${g.natDay} shape=${g.shape} cTot=${g.cTot} aTot=${g.aTot} cPle=${g.cPle} aPle=${g.aPle} sig=${g.deficitSig} cSpend=${g.cSpend}k aSpend=${g.aSpend}k`);
  }
}
