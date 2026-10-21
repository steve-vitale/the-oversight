#!/usr/bin/env node
// analyze-rotpathdiag-b.js — aggregate the sim-rotpathdiag-b per-seed corpus.
//
// Reads evidence/2026-10-20/perseed-rotpathdiag-b/{leadfeast,belongfeast}.json
// and emits the pooled attribution tables answering:
//   (a) what in the Game.stockPantry path rots faster than the engine's
//       stockSurplus path (cap binding? piece size? draw order? dawn sweep?)
//   (b) why the retagrot benefit concentrates where the crisis-bypass binds.
//
// Also judges the pre-registered DIAG-GO: >=15/16 runs at >=0.99 fast-rot
// attribution completeness, 0 unexplained.
//
// Usage: node scripts/analyze-rotpathdiag-b.js [--out <path>]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = 'evidence/2026-10-20/perseed-rotpathdiag-b';
const files = ['leadfeast.json', 'belongfeast.json'].map(f => path.join(DIR, f));
const rows = [];
for (const f of files) {
  if (!fs.existsSync(f)) { console.error('missing ' + f); process.exit(2); }
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of j.rows) rows.push(Object.assign({ policy: j.meta.policy }, r));
}

const sum = (a) => a.reduce((x, y) => x + y, 0);
const get = (o, k) => (o && o[k]) || 0;

console.log('=== sim-rotpathdiag-b analysis ===');
console.log(`corpus: ${rows.length} runs (${[...new Set(rows.map(r => r.policy))].join(', ')})`);

// ---------- DIAG-GO: attribution completeness ----------
console.log('\n--- DIAG-GO: fast-rot attribution completeness ---');
let passN = 0, judgedN = 0, vacuous = [];
for (const r of rows) {
  const tagged = sum(Object.values(r.rotByPath || {}));
  const total = tagged + (r.untaggedRotKcal || 0);
  const judged = total >= 2000;
  if (!judged) { vacuous.push(`${r.policy}/${r.seed}`); continue; }
  judgedN++;
  const ok = r.completeness >= 0.99;
  if (ok) passN++;
  console.log(`  ${r.policy} s${r.seed}: completeness=${(r.completeness * 100).toFixed(2)}% ` +
    `tagged=${Math.round(tagged / 1000)}k untagged=${Math.round((r.untaggedRotKcal || 0) / 1000)}k ${ok ? 'PASS' : 'FAIL'}`);
}
if (vacuous.length) console.log('  under-powered (<2k fresh rot, excluded): ' + vacuous.join(' '));
const diagGo = passN >= 15 && judgedN >= 15;
console.log(`DIAG-GO: ${passN}/${judgedN} judged runs >= 0.99 (bar >=15/16) -> ${diagGo ? 'DIAG-GO' : 'DIAG-NO-GO'}`);

// ---------- pooled attribution ----------
const P = (fn) => sum(rows.map(fn));
const inflowSP = P(r => get(r.inflow, 'SP')), inflowSS = P(r => get(r.inflow, 'SS')),
      inflowDPP = P(r => get(r.inflow, 'DPP'));
const fastSP = P(r => get(r.rotByPathFast, 'SP')), fastSS = P(r => get(r.rotByPathFast, 'SS')),
      fastDPP = P(r => get(r.rotByPathFast, 'DPP')), fastINIT = P(r => get(r.rotByPathFast, 'INIT')),
      fastOTHER = P(r => get(r.rotByPathFast, 'OTHER'));
const fastSPoc = P(r => get(r.rotByPathFastSub, 'SP:overcap')), fastSPn = P(r => get(r.rotByPathFastSub, 'SP:normal'));
const fastSSc = P(r => get(r.rotByPathFastSub, 'SS:crisis')), fastSSn = P(r => get(r.rotByPathFastSub, 'SS:noncrisis'));
const fastTot = fastSP + fastSS + fastDPP + fastINIT + fastOTHER;
const days = P(r => r.days || 0);
const per1k = (rot, inf) => inf > 0 ? (rot / inf * 1000).toFixed(1) : 'n/a';

console.log('\n--- (a) fast-rot by call-path (pooled, /run) ---');
console.log(`  run-days: ${days}`);
console.log(`  path      inflow(kcal)   fast-rot(kcal)   fast-rot per 1000 inflow`);
console.log(`  SP        ${String(Math.round(inflowSP)).padStart(12)} ${String(Math.round(fastSP)).padStart(14)} ${per1k(fastSP, inflowSP).padStart(12)}`);
console.log(`  SS        ${String(Math.round(inflowSS)).padStart(12)} ${String(Math.round(fastSS)).padStart(14)} ${per1k(fastSS, inflowSS).padStart(12)}`);
console.log(`  DPP       ${String(Math.round(inflowDPP)).padStart(12)} ${String(Math.round(fastDPP)).padStart(14)} ${per1k(fastDPP, inflowDPP).padStart(12)}`);
console.log(`  OTHER     ${'n/a'.padStart(12)} ${String(Math.round(fastOTHER)).padStart(14)} ${'n/a'.padStart(12)} (9-21d clocks: winner's share, tariff, tribute, ...)`);
console.log(`  INIT      ${'n/a'.padStart(12)} ${String(Math.round(fastINIT)).padStart(14)} ${'n/a'.padStart(12)}`);
console.log(`  TOTAL fast-rot: ${Math.round(fastTot).toLocaleString()} kcal over ${days}d = ${Math.round(fastTot / (days / 100) ).toLocaleString()}/100d`);
console.log(`  (b4 control sanity: 2,132,972 kcal / 2,239d = 95,264/100d)`);

const spOverCapKcal = P(r => r.spOverCapKcal || 0), spNormalKcal = P(r => r.spNormalKcal || 0);
const ssGive = P(r => r.ssGive || 0), ssRefused = P(r => r.ssRefused || 0);
const ssCrisisKcal = P(r => r.ssCrisisKcal || 0), ssNonCrisisKcal = P(r => r.ssNonCrisisKcal || 0);
console.log('\n--- (a) cap-binding channel ---');
console.log(`  SP over-cap writes: ${Math.round(spOverCapKcal).toLocaleString()} kcal (${(spOverCapKcal / Math.max(1, spOverCapKcal + spNormalKcal) * 100).toFixed(1)}% of SP inflow)`);
console.log(`    fast-rot per 1000: overcap ${per1k(fastSPoc, spOverCapKcal)} vs normal ${per1k(fastSPn, spNormalKcal)}`);
console.log(`  SS cap refusals: ${Math.round(ssRefused).toLocaleString()} kcal refused of ${Math.round(ssGive).toLocaleString()} give ` +
  `(${(ssRefused / Math.max(1, ssGive) * 100).toFixed(1)}% refused, ${P(r => r.ssRefusalEvents || 0)} events)`);

console.log('\n--- (b) crisis-split channel (SS only) ---');
console.log(`  SS give: crisis ${Math.round(ssCrisisKcal).toLocaleString()} kcal vs non-crisis ${Math.round(ssNonCrisisKcal).toLocaleString()} kcal`);
console.log(`    fast-rot per 1000: crisis ${per1k(fastSSc, ssCrisisKcal)} vs non-crisis ${per1k(fastSSn, ssNonCrisisKcal)}`);

// piece sizes
console.log('\n--- piece-size histograms (kcal by piece-size bucket, pooled) ---');
for (const p of ['SP', 'SS', 'DPP']) {
  const h = {};
  for (const r of rows) for (const [b, v] of Object.entries(r.pieceHist[p] || {})) h[b] = (h[b] || 0) + v;
  const tot = sum(Object.values(h)) || 1;
  console.log(`  ${p}: ` + ['le100', '101_200', '201_300', '301_400', '401_500', 'gt500']
    .map(b => `${b}=${(100 * (h[b] || 0) / tot).toFixed(0)}%`).join(' '));
}

// rot by name
console.log('\n--- rot by name (top 12, pooled kcal) ---');
{
  const byName = {};
  for (const r of rows) for (const [n, v] of Object.entries(r.rotByName || {})) byName[n] = (byName[n] || 0) + v;
  Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .forEach(([n, v]) => console.log(`  ${String(Math.round(v)).padStart(10)}  ${n}`));
}

// draw vs rot lag
console.log('\n--- draw order vs rot lag ---');
{
  // drawKcal-weighted mean of per-run drawUrgencyDays (== kcal-weighted mean days-to-spoil at draw)
  let urgW = 0, urgWSum = 0;
  for (const r of rows) { const w = r.drawKcal || 0; urgW += w; urgWSum += w * (r.drawUrgencyDays || 0); }
  console.log(`  pantryDraw: ${Math.round(P(r => r.drawKcal || 0) / 1000)}k kcal drawn, mean days-to-spoil at draw: ${(urgW ? urgWSum / urgW : 0).toFixed(2)}d`);
  console.log('  (draw order in code: FRESH-FIRST — spoilDay asc, kcalEach asc, slabs>2000 last; no DRAWCOARSE exists)');
  // weighted mean lag per path from per-run means (approximate; rot-kcal-weighted)
  const lagInfo = {};
  for (const p of ['SP', 'SS', 'DPP', 'INIT']) {
    let sw = 0, wsum = 0;
    for (const r of rows) {
      const w = get(r.rotByPath, p);
      sw += w; wsum += w * ((r.rotLagMean && r.rotLagMean[p]) || 0);
    }
    lagInfo[p] = sw > 0 ? (wsum / sw).toFixed(2) + 'd' : 'n/a';
  }
  console.log('  mean days-in-pantry at rot: ' + Object.entries(lagInfo).map(([p, v]) => `${p}=${v}`).join(' '));
}

// dawn glut stats
console.log('\n--- dawn glut stats (pooled samples) ---');
{
  let n = 0, overCapDays = 0, overCapKcalSum = 0, freshDaysSum = 0, doomSum = 0;
  for (const r of rows) for (const s of (r.dawnSamples || [])) {
    n++; freshDaysSum += s.freshDays || 0; doomSum += s.doomedKcal || 0;
    if ((s.overCapKcal || 0) > 0) { overCapDays++; overCapKcalSum += s.overCapKcal; }
  }
  console.log(`  dawn samples: ${n}; days over cap: ${overCapDays} (${(100 * overCapDays / Math.max(1, n)).toFixed(1)}%)` +
    `; mean over-cap kcal on those days: ${Math.round(overCapKcalSum / Math.max(1, overCapDays)).toLocaleString()}`);
  console.log(`  mean fresh-days at dawn: ${(freshDaysSum / Math.max(1, n)).toFixed(1)}; mean doomed kcal: ${Math.round(doomSum / Math.max(1, n)).toLocaleString()}`);
}

// merge mix
{
  const mix = P(r => r.mergeMixKcal || 0), tagged = P(r => sum(Object.values(r.rotByPath || {})) + 0);
  const inflowTot = inflowSP + inflowSS + inflowDPP;
  console.log(`\nmerge-mix: ${Math.round(mix).toLocaleString()} kcal merged into differently-tagged stacks ` +
    `(${(100 * mix / Math.max(1, inflowTot)).toFixed(2)}% of tagged inflow — attribution dilution)`);
}

// per-policy split (the b4 puzzle was policy-conditional: lead 1.32x / belong 0.55x)
console.log('\n--- per-policy split ---');
for (const pol of ['leadfeast', 'belongfeast']) {
  const rs = rows.filter(r => r.policy === pol);
  const f = P2(rs, r => sum(Object.values(r.rotByPathFast || {})));
  const d = P2(rs, r => r.days || 0);
  const spI = P2(rs, r => get(r.inflow, 'SP')), spF = P2(rs, r => get(r.rotByPathFast, 'SP'));
  const ssI = P2(rs, r => get(r.inflow, 'SS')), ssF = P2(rs, r => get(r.rotByPathFast, 'SS'));
  console.log(`  ${pol}: fast-rot ${Math.round(f).toLocaleString()} kcal / ${d}d = ${Math.round(f / (d / 100)).toLocaleString()}/100d` +
    ` | SP ${per1k(spF, spI)}/1k | SS ${per1k(ssF, ssI)}/1k`);
}
function P2(rs, fn) { return sum(rs.map(fn)); }

const outPath = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : 'evidence/2026-10-20/perseed-rotpathdiag-b/rotpathdiag-b-analysis.json';
const summary = {
  meta: { run: 'sim-rotpathdiag-b', rows: rows.length },
  diagGo, passN, judgedN,
  pooled: {
    days,
    inflow: { SP: Math.round(inflowSP), SS: Math.round(inflowSS), DPP: Math.round(inflowDPP) },
    fastRot: { SP: Math.round(fastSP), SS: Math.round(fastSS), DPP: Math.round(fastDPP), INIT: Math.round(fastINIT), OTHER: Math.round(fastOTHER) },
    fastRotPer1kInflow: { SP: +per1k(fastSP, inflowSP), SS: +per1k(fastSS, inflowSS) },
    spOverCap: { kcal: Math.round(spOverCapKcal), fastRotPer1k: +per1k(fastSPoc, spOverCapKcal) },
    spNormal: { kcal: Math.round(spNormalKcal), fastRotPer1k: +per1k(fastSPn, spNormalKcal) },
    ssCrisis: { kcal: Math.round(ssCrisisKcal), fastRotPer1k: +per1k(fastSSc, ssCrisisKcal) },
    ssNonCrisis: { kcal: Math.round(ssNonCrisisKcal), fastRotPer1k: +per1k(fastSSn, ssNonCrisisKcal) },
    ssRefused: { kcal: Math.round(ssRefused), events: P(r => r.ssRefusalEvents || 0) },
    mergeMixKcal: Math.round(P(r => r.mergeMixKcal || 0)),
  },
};
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(summary, null, 1));
console.log('\nwrote ' + outPath);
