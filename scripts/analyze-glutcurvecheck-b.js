#!/usr/bin/env node
// analyze-glutcurvecheck-b.js — armed-vs-control comparison for
// sim-surplusfeed-curvecheck-b.
//
// analyze-glut-b.js + the pre-registered armed-vs-control comparison.
// argv[2] = ARMED dir (default evidence/2026-10-20/perseed-glutcurvecheck-b)
// argv[3] = OUT (default evidence/2026-10-20/glutcurvecheck-analysis.json)
// argv[4] = CONTROL dir (default evidence/2026-10-20/perseed-glutprobe-b,
//   the landed corpus — never re-run)
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || 'evidence/2026-10-20/perseed-glutcurvecheck-b';
const OUT = process.argv[3] || 'evidence/2026-10-20/glutcurvecheck-analysis.json';
const CONTROL_DIR = process.argv[4] || 'evidence/2026-10-20/perseed-glutprobe-b';

const fdBucket = fd => fd <= 2 ? 'lean(<=2)' : fd <= 4 ? 'mid(2-4]' : fd < 7 ? 'midhi(4-7)' : 'glut(>=7)';
const doomedBucket = k => k <= 0 ? 'doom0' : k <= 2000 ? 'doom1-2k' : k <= 10000 ? 'doom2k-10k' : 'doom10k+';
const FD_BUCKETS = ['lean(<=2)', 'mid(2-4]', 'midhi(4-7)', 'glut(>=7)'];
const DOOM_BUCKETS = ['doom0', 'doom1-2k', 'doom2k-10k', 'doom10k+'];

function analyzeCorpus(dir) {
  const rows = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const r of (j.rows || [])) rows.push({ policy: j.meta.policy, ...r });
  }
  const out = { runs: rows.length, perRun: [], pooled: {}, wall: {}, deaths: {}, sfeed: { trimKcal: 0, trimDays: 0, trimCalls: 0 } };
  const dayPairs = [];
  for (const r of rows) {
    const pr = {
      policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
      won: r.won, national: r.national, table: r.table, maxWave: r.maxWave, arc: r.arc,
      chokeTotal: r.chokeTotal, unattShare: r.unattShare,
      inflow: r.inflow, rotFresh: r.rotFresh, rotPreserved: r.rotPreserved,
      rotByChFast: r.rotByChFast,
      throttleEngaged: r.throttleEngaged, throttleCalls: r.throttleCalls,
      starveDays: r.starveDays, dutyPreserved: r.dutyPreserved, laundered: r.laundered,
      deaths: r.deaths,
      sfeed: r.sfeed || null,
    };
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
    if (r.sfeed) {
      out.sfeed.trimKcal += (r.sfeed.trimKcal || 0);
      out.sfeed.trimDays += (r.sfeed.trimDays || 0);
      out.sfeed.trimCalls += (r.sfeed.trimCalls || 0);
    }
  }

  function doseTable(keyFn, buckets) {
    const t = {};
    for (const b of buckets) t[b] = { n: 0, ch: {} };
    for (const p of dayPairs) {
      const b = keyFn(p);
      const cell = t[b];
      cell.n++;
      for (const [c, k] of Object.entries(p.ch)) cell.ch[c] = (cell.ch[c] || 0) + k;
    }
    for (const b of buckets) {
      const cell = t[b];
      cell.mean = {};
      for (const [c, k] of Object.entries(cell.ch)) cell.mean[c] = cell.n ? k / cell.n : 0;
      cell.totalMean = cell.n ? Object.values(cell.ch).reduce((a, x) => a + x, 0) / cell.n : 0;
    }
    return t;
  }
  out.pooled.byFreshDays = doseTable(p => fdBucket(p.fd), FD_BUCKETS);
  out.pooled.byDoomed = doseTable(p => doomedBucket(p.doomed), DOOM_BUCKETS);

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

  out.permanentGlutRuns = out.perRun.filter(p => p.permanentGlut)
    .map(p => ({ policy: p.policy, seed: p.seed, glutDayShare: +p.glutDayShare.toFixed(2), meanFd: +p.meanFd.toFixed(1), days: p.days }));
  const glutPairs = dayPairs.filter(p => p.fd >= 7);
  const marg = {};
  for (const p of glutPairs) for (const [c, k] of Object.entries(p.ch)) marg[c] = (marg[c] || 0) + k;
  const margTotal = Object.values(marg).reduce((a, b) => a + b, 0);
  out.marginalGlutInflow = { nGlutDays: glutPairs.length, totalKcal: Math.round(margTotal),
    byChannel: Object.fromEntries(Object.entries(marg).map(([c, k]) => [c, { kcal: Math.round(k), share: margTotal ? +(k / margTotal).toFixed(3) : 0 }])) };

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
  return out;
}

const armed = analyzeCorpus(DIR);
const control = analyzeCorpus(CONTROL_DIR);

// --- pre-registered comparison: paired (policy,seed) ---
function pairKey(p) { return p.policy + '#' + p.seed; }
const controlByKey = {};
for (const p of control.perRun) controlByKey[pairKey(p)] = p;

const cmp = { primary: {}, guardrails: {}, pairs: [] };
const af = armed.throttleVerdicts.share_surplus || {}, cf = control.throttleVerdicts.share_surplus || {};
cmp.primary.shareSurplusRatio = {
  armed: af.ratio, control: cf.ratio, bar: '<=1.5',
  verdict: (typeof af.ratio === 'number' && af.ratio <= 1.5) ? 'GO' : 'NO-GO',
  armedLean: af.lean, armedGlut: af.glut, controlLean: cf.lean, controlGlut: cf.glut,
};

// guardrail 1: lean inflow >= 0.9x control
cmp.guardrails.leanInflow = {
  armed: af.lean, control: cf.lean,
  ratio: (cf.lean ? +(af.lean / cf.lean).toFixed(3) : null), bar: '>=0.9',
  verdict: (cf.lean && af.lean / cf.lean >= 0.9) ? 'GO' : 'NO-GO',
};
// guardrail 2: fast-rot <= control (share_surplus fast rot)
function fastRot(out, ch) {
  let t = 0;
  for (const p of out.perRun) t += ((p.rotByChFast || {})[ch] || 0);
  return Math.round(t);
}
const aFast = fastRot(armed, 'share_surplus'), cFast = fastRot(control, 'share_surplus');
cmp.guardrails.fastRot = { armed: aFast, control: cFast, ratio: cFast ? +(aFast / cFast).toFixed(3) : null, bar: '<=1.0', verdict: aFast <= cFast ? 'GO' : 'NO-GO' };
// guardrail 3: conservation — total glut-day inflow/day armed < control;
// other-channel glut means armed <= control + 10%
const aGlutTot = armed.pooled.byFreshDays['glut(>=7)'].totalMean;
const cGlutTot = control.pooled.byFreshDays['glut(>=7)'].totalMean;
cmp.guardrails.totalGlutInflowPerDay = {
  armed: Math.round(aGlutTot), control: Math.round(cGlutTot),
  ratio: cGlutTot ? +(aGlutTot / cGlutTot).toFixed(3) : null, bar: '<1.0', verdict: aGlutTot < cGlutTot ? 'GO' : 'NO-GO',
};
{
  const aM = armed.pooled.byFreshDays['glut(>=7)'].mean;
  const cM = control.pooled.byFreshDays['glut(>=7)'].mean;
  let aO = 0, cO = 0;
  for (const c of new Set([...Object.keys(aM), ...Object.keys(cM)])) {
    if (c === 'share_surplus') continue;
    aO += aM[c] || 0; cO += cM[c] || 0;
  }
  cmp.guardrails.otherChannelGlut = {
    armed: Math.round(aO), control: Math.round(cO),
    ratio: cO ? +(aO / cO).toFixed(3) : null, bar: '<=1.10', verdict: (cO ? aO / cO <= 1.10 : aO === 0) ? 'GO' : 'NO-GO',
  };
}
// guardrail 4: starvation deaths <= control
function starvDeaths(out) {
  let n = 0;
  for (const p of out.perRun) for (const d of (p.deaths || [])) if (/starv/.test(String(d.cause || ''))) n++;
  return n;
}
{
  const a = starvDeaths(armed), c = starvDeaths(control);
  cmp.guardrails.starvationDeaths = { armed: a, control: c, bar: '<=control', verdict: a <= c ? 'GO' : 'NO-GO' };
}
// guardrail 5: median survival >= control - 10d
{
  const a = armed.wall.medianSurv, c = control.wall.medianSurv;
  cmp.guardrails.medianSurvival = { armed: a, control: c, delta: a - c, bar: '>=control-10d', verdict: a >= c - 10 ? 'GO' : 'NO-GO' };
}
// guardrail 6: no new death mechanism
{
  const kinds = out => { const s = new Set(); for (const p of out.perRun) for (const d of (p.deaths || [])) s.add((d.kind || '?') + ':' + (d.cause || '?')); return s; };
  const aK = kinds(armed), cK = kinds(control);
  const novel = [...aK].filter(k => !cK.has(k));
  cmp.guardrails.newDeathMechanism = { novel, bar: 'none', verdict: novel.length === 0 ? 'GO' : 'NO-GO' };
}
// per-pair descriptive table (armed/control)
{
  for (const p of armed.perRun) {
    const c = controlByKey[pairKey(p)];
    if (!c) continue;
    cmp.pairs.push({
      policy: p.policy, seed: p.seed, days: p.days + '/' + c.days,
      chokeKcal: Math.round(p.chokeTotal / 1000) + 'k/' + Math.round(c.chokeTotal / 1000) + 'k',
      shareSurplusKcal: Math.round(((p.inflow || {}).share_surplus || 0) / 1000) + 'k/' + Math.round(((c.inflow || {}).share_surplus || 0) / 1000) + 'k',
    });
  }
}

fs.writeFileSync(OUT, JSON.stringify({ armed, control, comparison: cmp }, null, 1));

// --- print ---
const kfmt = k => (k / 1000).toFixed(1) + 'k';
function printTables(out, label) {
  console.log(`=== ${label} ===`);
  console.log(`runs=${out.runs} dayPairs=${out.pooled.nDayPairs} pearson(fd,inflow)=${out.pooled.pearsonFdInflow}`);
  console.log(`trim: ${kfmt(out.sfeed.trimKcal)} over ${out.sfeed.trimDays}d (${out.sfeed.trimCalls} trim calls)`);
  console.log('\n--- dose-response vs fresh-days (mean kcal/day/channel, pooled) ---');
  const chSet = new Set();
  for (const b of FD_BUCKETS) for (const c of Object.keys(out.pooled.byFreshDays[b].ch)) chSet.add(c);
  console.log('channel'.padEnd(22) + FD_BUCKETS.map(b => b.padStart(12)).join(''));
  for (const c of [...chSet].sort()) {
    const row = FD_BUCKETS.map(b => {
      const m = out.pooled.byFreshDays[b].mean[c] || 0;
      return String(m >= 1000 ? kfmt(m) : Math.round(m)).padStart(12);
    }).join('');
    console.log(c.padEnd(22) + row);
  }
  console.log('n-days'.padEnd(22) + FD_BUCKETS.map(b => String(out.pooled.byFreshDays[b].n).padStart(12)).join(''));
  console.log('\n--- throttle verdicts (glut>=7 vs lean<=2 kcal/day) ---');
  for (const [c, v] of Object.entries(out.throttleVerdicts).sort()) {
    console.log(`${c.padEnd(22)} lean=${String(v.lean).padStart(7)} glut=${String(v.glut).padStart(7)} ratio=${String(v.ratio).padStart(6)} ${v.verdict}`);
  }
  console.log('\n--- wall ---');
  console.log(`won=${out.wall.won}/${out.runs} national=${out.wall.national}/${out.runs} table=${out.wall.table}/${out.runs} w4=${out.wall.w4}/${out.runs} w5=${out.wall.w5}/${out.runs} med=${out.wall.medianSurv}d max=${out.wall.maxSurv}d`);
  console.log('--- death causes ---');
  for (const [c, n] of Object.entries(out.deaths).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${c}: ${n}`);
}
printTables(armed, 'sim-surplusfeed-curvecheck-b ARMED (SURPLUSFEED=1)');
console.log('\n');
printTables(control, 'glutprobe-b CONTROL (landed corpus, SURPLUSFEED unset)');
console.log('\n=== PRE-REGISTERED COMPARISON ===');
console.log(`PRIMARY share_surplus glut/lean: armed=${cmp.primary.shareSurplusRatio.armed} control=${cmp.primary.shareSurplusRatio.control} bar=${cmp.primary.shareSurplusRatio.bar} -> ${cmp.primary.shareSurplusRatio.verdict}`);
console.log(`  (armed lean=${cmp.primary.shareSurplusRatio.armedLean}/d glut=${cmp.primary.shareSurplusRatio.armedGlut}/d; control lean=${cmp.primary.shareSurplusRatio.controlLean}/d glut=${cmp.primary.shareSurplusRatio.controlGlut}/d)`);
for (const [k, g] of Object.entries(cmp.guardrails)) {
  console.log(`guardrail ${k}: ${JSON.stringify(g)}`);
}
console.log('\n--- per-pair (armed/control) ---');
for (const p of cmp.pairs) console.log(`  ${p.policy} s${p.seed}: days=${p.days} choke=${p.chokeKcal} share_surplus=${p.shareSurplusKcal}`);
console.log('\nwrote ' + OUT);
