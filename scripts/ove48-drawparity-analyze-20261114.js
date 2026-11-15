// ove48-drawparity-analyze-20261114.js — compare the OVE-48 draw-parity
// corpora (arm sim-ove48-drawparity-a) and judge the pre-registered
// bars from evidence/2026-11-14/sim-ove48-drawparity-prereg.md.
//
// Bars (verbatim from the prereg):
//   PARITY-FAIL: median per-seed total-draw delta (subj-base) > 0 AND
//     total delta across 8 seeds >= +40 AND same sign (positive) on >= 7/8.
//   PARITY-OK: |total delta| <= 10 OR the per-seed sign is mixed.
//   AMBIGUOUS: otherwise.
//   Localization (only if PARITY-FAIL): the bucket(s) carrying >= 80%
//     of the total delta, or UNLOCALIZED.
//   Timing (diagnostic): per seed, first day the cumulative-draw series
//     differ vs that seed's deathDiv day from ove48-mech; report X/8
//     where draw divergence strictly precedes deathDiv.
//   Determinism: r2 re-run totals must match judged totals exactly on
//     190457 + 190464 per leg, or the verdict is WITHHELD.
//
// Usage:
//   node scripts/ove48-drawparity-analyze-20261114.js --base <dir> --subj <dir>
//     [--baseR2 <dir> --subjR2 <dir>] [--out <summary.json>]
'use strict';
const fs = require('fs');
const path = require('path');

// deathDiv days from ove48-mech-a §(c) (first day the death sets differ).
const MECH_DEATHDIV = { 190457: 6, 190458: 11, 190459: 11, 190460: 6, 190461: 6, 190462: 14, 190463: 4, 190464: 4 };
// Band-3 replication expectations from the ove48-conv corpora.
const CONV_DAYS = {
  base: { 190457: 150, 190458: 101, 190459: 150, 190460: 124, 190461: 129, 190462: 150, 190463: 23, 190464: 115 },
  subj: { 190457: 134, 190458: 108, 190459: 109, 190460: 129, 190461: 135, 190462: 123, 190463: 138, 190464: 142 },
};

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--base') out.base = argv[++i];
    else if (a === '--subj') out.subj = argv[++i];
    else if (a === '--baseR2') out.baseR2 = argv[++i];
    else if (a === '--subjR2') out.subjR2 = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else { console.error('unknown arg ' + a); process.exit(2); }
  }
  if (!out.base || !out.subj) { console.error('usage: --base <dir> --subj <dir> [--baseR2 <dir> --subjR2 <dir>] [--out <file>]'); process.exit(2); }
  return out;
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const bySeed = {};
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[d.seed] = d;
  }
  return bySeed;
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  if (n === 0) return null;
  return (n % 2) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function deathKey(d) { return [d.day, d.kind, d.who].join('|'); }

// First day the death SETS differ: earliest day d such that the
// multisets of deaths with day <= d differ between legs.
function deathDivDay(baseDeaths, subjDeaths) {
  const maxDay = Math.max.apply(null, baseDeaths.concat(subjDeaths).map(function (d) { return d.day; }).concat([0]));
  function prefix(deaths, day) {
    return deaths.filter(function (d) { return d.day <= day; }).map(deathKey).sort().join('\n');
  }
  for (let d = 1; d <= maxDay; d++) {
    if (prefix(baseDeaths, d) !== prefix(subjDeaths, d)) return d;
  }
  return null; // identical death sets through the whole run
}

// First day the cumulative-draw series differ (first day with a
// nonzero per-day draw delta). Day series are keyed by scholar day.
function drawDivDay(baseSeries, subjSeries) {
  const b = {}, s = {};
  for (const r of baseSeries) b[r.day] = r.cumTotal;
  for (const r of subjSeries) s[r.day] = r.cumTotal;
  const days = Object.keys(b).map(Number).concat(Object.keys(s).map(Number));
  const all = Array.from(new Set(days)).sort(function (x, y) { return x - y; });
  let prevB = 0, prevS = 0;
  for (const d of all) {
    const cb = (b[d] != null) ? b[d] : prevB;
    const cs = (s[d] != null) ? s[d] : prevS;
    if (cb !== cs) return d;
    prevB = cb; prevS = cs;
  }
  return null;
}

function pickStats(draws) {
  const picks = (draws && draws.picks) || [];
  const wp = picks.filter(function (p) { return p.source === 'weighted-pick'; });
  const wpDraws = wp.reduce(function (a, p) { return a + (p.draws || 0); }, 0);
  return {
    opens: picks.length,
    weightedPicks: wp.length,
    weightedPickDraws: wpDraws,
    meanDrawsPerPick: picks.length ? picks.reduce(function (a, p) { return a + (p.draws || 0); }, 0) / picks.length : null,
    meanDrawsPerWeightedPick: wp.length ? wpDraws / wp.length : null,
    bySource: picks.reduce(function (acc, p) { acc[p.source] = (acc[p.source] || 0) + 1; return acc; }, {}),
  };
}

function analyze(args) {
  const base = loadCorpus(args.base);
  const subj = loadCorpus(args.subj);
  const seeds = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
  const subjSeeds = Object.keys(subj).map(Number).sort(function (a, b) { return a - b; });
  if (JSON.stringify(seeds) !== JSON.stringify(subjSeeds)) {
    console.error('seed sets differ: base ' + seeds.join(',') + ' vs subj ' + subjSeeds.join(','));
    process.exit(2);
  }
  const perSeed = [];
  let totalDelta = 0;
  const bucketDelta = { dawn: 0, selectWant: 0, talk: 0, other: 0 };
  let setupMismatch = [];
  for (const seed of seeds) {
    const b = base[seed], s = subj[seed];
    const bd = (b.draws || {}), sd = (s.draws || {});
    const delta = (sd.totalDraws || 0) - (bd.totalDraws || 0);
    totalDelta += delta;
    for (const k of Object.keys(bucketDelta)) bucketDelta[k] += ((sd.byBucket || {})[k] || 0) - ((bd.byBucket || {})[k] || 0);
    if ((bd.setupDraws || 0) !== (sd.setupDraws || 0)) {
      setupMismatch.push({ seed: seed, base: bd.setupDraws, subj: sd.setupDraws });
    }
    const dd = drawDivDay(bd.daySeries || [], sd.daySeries || []);
    const dvd = deathDivDay(b.deaths || [], s.deaths || []);
    perSeed.push({
      seed: seed,
      baseDays: b.days, subjDays: s.days,
      baseEnd: b.endReason, subjEnd: s.endReason,
      baseTotalDraws: bd.totalDraws || 0, subjTotalDraws: sd.totalDraws || 0,
      delta: delta,
      baseByBucket: bd.byBucket || null, subjByBucket: sd.byBucket || null,
      baseSetupDraws: bd.setupDraws || 0, subjSetupDraws: sd.setupDraws || 0,
      basePicks: pickStats(bd), subjPicks: pickStats(sd),
      baseDawnCalls: (bd.totals || {}).dawnPriorityCalls || 0,
      subjDawnCalls: (sd.totals || {}).dawnPriorityCalls || 0,
      baseErrors: ((b.instrumentErrors || []).length),
      subjErrors: ((s.instrumentErrors || []).length),
      drawDivDay: dd,
      deathDivDay: dvd,
      deathDivExpected: MECH_DEATHDIV[seed] || null,
      deathDivMatch: dvd === (MECH_DEATHDIV[seed] || null),
      drawPrecedesDeath: (dd != null && dvd != null) ? (dd < dvd) : null,
    });
  }
  const deltas = perSeed.map(function (r) { return r.delta; });
  const med = median(deltas);
  const nPos = deltas.filter(function (d) { return d > 0; }).length;
  const nNeg = deltas.filter(function (d) { return d < 0; }).length;
  const nZero = deltas.filter(function (d) { return d === 0; }).length;
  const mixed = !(nPos >= 7 || nNeg >= 7);

  // Validity V1–V5 (per prereg).
  const validity = { V1: null, V2: null, V3: null, V4: null, V5: null, notes: [] };
  const baseOpens = perSeed.reduce(function (a, r) { return a + r.basePicks.opens; }, 0);
  const subjOpens = perSeed.reduce(function (a, r) { return a + r.subjPicks.opens; }, 0);
  validity.V1 = { baseOpens: baseOpens, subjOpens: subjOpens, pass: baseOpens >= 200 && subjOpens >= 200 };
  const daysMatch = perSeed.every(function (r) { return r.baseDays === CONV_DAYS.base[r.seed] && r.subjDays === CONV_DAYS.subj[r.seed]; });
  const survivedBase = perSeed.filter(function (r) { return r.baseEnd === 'survived'; }).length;
  const survivedSubj = perSeed.filter(function (r) { return r.subjEnd === 'survived'; }).length;
  validity.V2 = { daysMatch: daysMatch, survivedBase: survivedBase, survivedSubj: survivedSubj, pass: daysMatch && survivedBase === 3 && survivedSubj === 0 };
  const baseDawn = perSeed.reduce(function (a, r) { return a + r.baseDawnCalls; }, 0);
  const subjDawn = perSeed.reduce(function (a, r) { return a + r.subjDawnCalls; }, 0);
  validity.V3 = { baseDawnCalls: baseDawn, subjDawnCalls: subjDawn, pass: baseDawn === 0 && subjDawn > 0 };
  const errTotal = perSeed.reduce(function (a, r) { return a + r.baseErrors + r.subjErrors; }, 0);
  validity.V4 = { instrumentErrors: errTotal, pass: errTotal === 0 };

  // Determinism (V5): r2 re-runs must reproduce judged totals exactly.
  let determinism = { checked: false, pass: null, mismatches: [] };
  if (args.baseR2 && args.subjR2) {
    determinism.checked = true;
    const baseR2 = loadCorpus(args.baseR2);
    const subjR2 = loadCorpus(args.subjR2);
    for (const seed of [190457, 190464]) {
      const checks = [
        { leg: 'base', judged: (base[seed] && base[seed].draws || {}).totalDraws, rerun: (baseR2[seed] && baseR2[seed].draws || {}).totalDraws, judgedDays: base[seed] && base[seed].days, rerunDays: baseR2[seed] && baseR2[seed].days },
        { leg: 'subj', judged: (subj[seed] && subj[seed].draws || {}).totalDraws, rerun: (subjR2[seed] && subjR2[seed].draws || {}).totalDraws, judgedDays: subj[seed] && subj[seed].days, rerunDays: subjR2[seed] && subjR2[seed].days },
      ];
      for (const c of checks) {
        if (c.judged !== c.rerun || c.judgedDays !== c.rerunDays) {
          determinism.mismatches.push({ seed: seed, leg: c.leg, judgedTotal: c.judged, rerunTotal: c.rerun, judgedDays: c.judgedDays, rerunDays: c.rerunDays });
        }
      }
    }
    determinism.pass = determinism.mismatches.length === 0;
  }
  validity.V5 = determinism.checked ? { pass: determinism.pass, mismatches: determinism.mismatches } : { pass: null, note: 'r2 corpora not supplied' };

  // Verdict.
  let verdict;
  if (determinism.checked && !determinism.pass) verdict = 'WITHHELD';
  else if (med != null && med > 0 && totalDelta >= 40 && nPos >= 7) verdict = 'PARITY-FAIL';
  else if (Math.abs(totalDelta) <= 10 || mixed) verdict = 'PARITY-OK';
  else verdict = 'AMBIGUOUS';

  // Localization (only meaningful on PARITY-FAIL).
  let localization = { verdict: 'n/a', bucketShares: {}, carrying: [] };
  if (verdict === 'PARITY-FAIL') {
    const shares = {};
    for (const k of Object.keys(bucketDelta)) shares[k] = totalDelta ? bucketDelta[k] / totalDelta : 0;
    const carrying = Object.keys(shares).filter(function (k) { return shares[k] >= 0.8; });
    localization = { verdict: carrying.length ? 'LOCALIZED' : 'UNLOCALIZED', bucketShares: shares, carrying: carrying };
  } else {
    const shares = {};
    for (const k of Object.keys(bucketDelta)) shares[k] = totalDelta ? bucketDelta[k] / totalDelta : 0;
    localization = { verdict: 'n/a (verdict ' + verdict + ')', bucketShares: shares, carrying: [] };
  }

  // Timing diagnostic.
  const timing = perSeed.map(function (r) { return { seed: r.seed, drawDivDay: r.drawDivDay, deathDivDay: r.deathDivDay, deathDivExpected: r.deathDivExpected, precedes: r.drawPrecedesDeath }; });
  const nPrecede = timing.filter(function (t) { return t.precedes === true; }).length;
  const nDeathDivMatch = perSeed.filter(function (r) { return r.deathDivMatch; }).length;

  // Wall numbers (context, not the verdict).
  const wall = {
    survivedBase: survivedBase, survivedSubj: survivedSubj,
    medianDaysBase: median(perSeed.map(function (r) { return r.baseDays; })),
    medianDaysSubj: median(perSeed.map(function (r) { return r.subjDays; })),
    maxWaveBase: Math.max.apply(null, seeds.map(function (s) { return base[s].maxWave || 1; })),
    maxWaveSubj: Math.max.apply(null, seeds.map(function (s) { return subj[s].maxWave || 1; })),
    wonBase: seeds.filter(function (s) { return base[s].won; }).length,
    wonSubj: seeds.filter(function (s) { return subj[s].won; }).length,
  };

  const summary = {
    arm: 'ove48-drawparity', verdict: verdict,
    medianDelta: med, totalDelta: totalDelta,
    nPositive: nPos, nNegative: nNeg, nZero: nZero,
    bucketDelta: bucketDelta,
    localization: localization,
    timing: { precedesCount: nPrecede, of: seeds.length, perSeed: timing },
    deathDivMatch: nDeathDivMatch + '/' + seeds.length,
    setupMismatch: setupMismatch,
    validity: validity,
    determinism: determinism,
    wall: wall,
    perSeed: perSeed,
  };
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(summary, null, 2) + '\n');
  console.log('DRAWPARTY verdict: ' + verdict);
  console.log('  median delta (subj-base): ' + med + '; total delta: ' + totalDelta + '; positive ' + nPos + '/8, negative ' + nNeg + '/8, zero ' + nZero + '/8');
  console.log('  bucket deltas: ' + JSON.stringify(bucketDelta) + '; localization: ' + localization.verdict + (localization.carrying.length ? ' (' + localization.carrying.join(',') + ')' : ''));
  console.log('  timing: draw divergence precedes deathDiv on ' + nPrecede + '/' + seeds.length + ' seeds; deathDiv reproduced ' + nDeathDivMatch + '/' + seeds.length);
  console.log('  validity: V1 ' + (validity.V1.pass ? 'pass' : 'FAIL') + ' (opens ' + baseOpens + '/' + subjOpens + '), V2 ' + (validity.V2.pass ? 'pass' : 'FAIL') + ' (daysMatch ' + daysMatch + ', survived ' + survivedBase + '/' + survivedSubj + '), V3 ' + (validity.V3.pass ? 'pass' : 'FAIL') + ' (dawn ' + baseDawn + '/' + subjDawn + '), V4 ' + (validity.V4.pass ? 'pass' : 'FAIL') + ' (errors ' + errTotal + '), V5 ' + (validity.V5.pass === null ? 'n/a' : (validity.V5.pass ? 'pass' : 'FAIL')));
  if (setupMismatch.length) console.log('  setup-draw mismatches: ' + JSON.stringify(setupMismatch));
  for (const r of perSeed) {
    console.log('  seed ' + r.seed + ': draws base ' + r.baseTotalDraws + ' subj ' + r.subjTotalDraws + ' delta ' + (r.delta >= 0 ? '+' : '') + r.delta + ' | days ' + r.baseDays + '/' + r.subjDays + ' | drawDiv d' + r.drawDivDay + ' deathDiv d' + r.deathDivDay + ' (expected d' + r.deathDivExpected + ') precedes=' + r.drawPrecedesDeath);
  }
  return summary;
}

if (require.main === module) analyze(parseArgs(process.argv));
module.exports = { analyze: analyze, median: median, deathDivDay: deathDivDay, drawDivDay: drawDivDay, MECH_DEATHDIV: MECH_DEATHDIV, CONV_DAYS: CONV_DAYS };
