// test-tendfloor-analyze-20261104.js — floored tend-through wrapper
// over the polityfrag analyzer (arm sim-tendfloor-b). The polityfrag
// analyzer is REUSED verbatim (not modified); this file only adds
// the tendfloor reporting fields the prereg requires: tend counts
// by pantry band (<= 13,500 blocked by the floor; 13,501–20,000
// floored-allowed; > 20,000 always-allowed; unknown-pantry counted
// separately), ever-faced wave 4/5 (ANY daily snapshot with
// w4faced/w5faced true — the reused analyzer's fields read only
// the LAST snapshot, so they are not used for the wave guard),
// survival bands, per-seed death-day deltas, pooled hold-share,
// and the prereg GO judge. Pure functions over per-seed JSONs:
// no Game, no harness. When run directly, it reads
// evidence/2026-11-04/perseed-tendfloor-b/ and prints one JSON
// line per seed pair plus the GO verdict.
// Usage: node scripts/test-tendfloor-analyze-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const AN = require(path.join(__dirname, 'test-polityfrag-analyze-20261104'));

const BAND_ORDER = { D: 0, C: 1, B: 2, A: 3 };

function bandFor(days, endReason) {
  if (endReason === 'horizon' || days >= 300) return 'A';
  if (days >= 150) return 'B';
  if (days >= 100) return 'C';
  return 'D';
}

function pantryAt(out, day) {
  let found = null;
  for (const snap of (out.daily || [])) {
    if (snap.day > day) break;
    if (typeof snap.pantryKcal === 'number') found = snap.pantryKcal;
  }
  return found;
}

function summarizeLeg(out) {
  const s = AN.analyzeSeed(out);
  const daily = (out.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  const tends = (out.courtshipEvents || []).filter(function (e) { return e.fn === 'tendLink'; });
  const tendByLink = {};
  let blocked = 0, floored = 0, high = 0, unknown = 0;
  for (const e of tends) {
    const k = String(e.target);
    tendByLink[k] = (tendByLink[k] || 0) + 1;
    const p = pantryAt(out, e.day);
    if (p == null) unknown++;
    else if (p <= 13500) blocked++;
    else if (p <= 20000) floored++;
    else high++;
  }
  return Object.assign({}, s, {
    survivalBand: bandFor(s.days, s.endReason),
    everW4: daily.some(function (snap) { return !!snap.w4faced; }),
    everW5: daily.some(function (snap) { return !!snap.w5faced; }),
    tendTotal: tends.length, tendByLink: tendByLink,
    tendBlocked: blocked, tendFloored: floored, tendHigh: high, tendUnknown: unknown,
    tendDays: tends.map(function (e) { return e.day; }),
  });
}

function median(arr) {
  const sorted = arr.slice().sort(function (a, b) { return a - b; });
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function pooledHoldShare(summaries) {
  // Analyzer sets postFirstSnapshots and holdShare per seed; pooled
  // diplo snapshots = round(holdShare * postFirstSnapshots) per seed.
  const diplo = summaries.filter(function (s) { return s.firstDiploDay != null; });
  let num = 0, den = 0;
  for (const s of diplo) { num += Math.round((s.holdShare || 0) * s.postFirstSnapshots); den += s.postFirstSnapshots; }
  return { value: den ? num / den : null, diploSeeds: diplo.length, numerator: num, denominator: den };
}

function pairSeeds(baseOut, armedOut) {
  const b = summarizeLeg(baseOut), a = summarizeLeg(armedOut);
  const delta = a.days - b.days;
  const regressed = BAND_ORDER[a.survivalBand] < BAND_ORDER[b.survivalBand];
  return { seed: baseOut.seed, base: b, armed: a, deltaDays: delta,
    baseBand: b.survivalBand, armedBand: a.survivalBand, regressed: regressed };
}

function judgeGo(pairs) {
  const base = pairs.map(function (p) { return p.base; });
  const armed = pairs.map(function (p) { return p.armed; });
  let bad = 0;
  for (const p of pairs) { if ((p.base.instrumentErrors || 0) > 0) bad++; if ((p.armed.instrumentErrors || 0) > 0) bad++; }
  const baseHold = pooledHoldShare(base), armedHold = pooledHoldShare(armed);
  const deltas = pairs.map(function (p) { return p.deltaDays; });
  const med = median(deltas);
  const regressions = pairs.filter(function (p) { return p.regressed; }).map(function (p) { return p.seed; });
  const baseW4 = base.filter(function (s) { return s.everW4; }).length;
  const armedW4 = armed.filter(function (s) { return s.everW4; }).length;
  const baseW5 = base.filter(function (s) { return s.everW5; }).length;
  const armedW5 = armed.filter(function (s) { return s.everW5; }).length;
  const legA = regressions.length === 0;
  const legB = med != null && med >= -5;
  const legC = baseHold.value != null && armedHold.value != null && armedHold.value >= baseHold.value - 0.05;
  const legD = armedW4 >= baseW4 - 1 && armedW5 >= baseW5 - 1;
  let verdict;
  if (bad > 2 || baseHold.diploSeeds === 0) verdict = 'INSUFFICIENT-DATA';
  else if (legA && legB && legC && legD) verdict = 'GO';
  else verdict = 'NO-GO';
  return { verdict: verdict, legA_noRegression: legA, legB_medianDelta: med, legB_pass: legB,
    legC_baseHold: baseHold.value, legC_armedHold: armedHold.value, legC_pass: legC,
    legD_baseW4: baseW4, legD_armedW4: armedW4, legD_baseW5: baseW5, legD_armedW5: armedW5, legD_pass: legD,
    regressions: regressions, badSeeds: bad, total: pairs.length,
    baseHoldDiploSeeds: baseHold.diploSeeds, armedHoldDiploSeeds: armedHold.diploSeeds };
}

module.exports = { summarizeLeg: summarizeLeg, pairSeeds: pairSeeds, judgeGo: judgeGo, bandFor: bandFor, median: median, pooledHoldShare: pooledHoldShare };

if (require.main === module) {
  const dir = path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-tendfloor-b');
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const bySeed = {};
  for (const f of files) {
    const out = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[out.seed] = bySeed[out.seed] || {};
    bySeed[out.seed][out.run] = out;
  }
  const pairs = [];
  for (const seed of Object.keys(bySeed).sort()) {
    const g = bySeed[seed];
    if (!g['tendfloor-base'] || !g['tendfloor-armed']) { console.log(JSON.stringify({ seed: Number(seed), error: 'missing leg' })); continue; }
    const p = pairSeeds(g['tendfloor-base'], g['tendfloor-armed']);
    pairs.push(p);
    console.log(JSON.stringify({ seed: p.seed, daysBase: p.base.days, daysArmed: p.armed.days, deltaDays: p.deltaDays,
      bandBase: p.baseBand, bandArmed: p.armedBand, regressed: p.regressed,
      scaleBase: p.base.scaleRank, scaleArmed: p.armed.scaleRank,
      maxWaveBase: p.base.maxWave, maxWaveArmed: p.armed.maxWave,
      everW4Base: p.base.everW4, everW4Armed: p.armed.everW4,
      everW5Base: p.base.everW5, everW5Armed: p.armed.everW5,
      trajBase: p.base.trajectory, trajArmed: p.armed.trajectory,
      holdBase: p.base.holdShare, holdArmed: p.armed.holdShare,
      dropsBase: p.base.drops.length, dropsArmed: p.armed.drops.length,
      recovBase: p.base.recoveries.length, recovArmed: p.armed.recoveries.length,
      readyBase: p.base.readyDays, readyArmed: p.armed.readyDays,
      tendBase: p.base.tendTotal, tendArmed: p.armed.tendTotal,
      tendArmedBlocked: p.armed.tendBlocked, tendArmedFloored: p.armed.tendFloored,
      tendArmedHigh: p.armed.tendHigh, tendArmedUnknown: p.armed.tendUnknown,
      tendBaseBlocked: p.base.tendBlocked, tendBaseFloored: p.base.tendFloored,
      errorsBase: p.base.instrumentErrors, errorsArmed: p.armed.instrumentErrors,
      deathTotalBase: p.base.deathTotal, deathTotalArmed: p.armed.deathTotal }));
  }
  console.log(JSON.stringify(judgeGo(pairs)));
}
