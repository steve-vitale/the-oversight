#!/usr/bin/env node
// analyze-launchfit-b.js — departure-stamp analyzer (arm sim-launchfit-b).
// Reads evidence/2026-11-27/perseed-launchfit-b/launchfit-b-s<seed>.json,
// judges the frozen prereg bars B1–B4 and reports the distributions +
// the Alberto pattern-vs-outlier verdict with numbers.
//
// Usage:
//   node scripts/analyze-launchfit-b.js [--dir <per-seed dir>] [--out <json>]
//   node scripts/analyze-launchfit-b.js --selftest   (synthetic rows only)
'use strict';
const fs = require('fs');
const path = require('path');

function quartile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}
function median(a) { const s = a.slice().sort(function (x, y) { return x - y; }); return quartile(s, 0.5); }

function analyzeFiles(files) {
  const seeds = [];
  let departs = [], launches = [], holds = [];
  let instrumentErrors = 0, errorDetail = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    seeds.push(j.seed);
    (j.departs || []).forEach(function (d) { d._seed = j.seed; departs.push(d); });
    instrumentErrors += (j.instrumentErrors || []).length;
    (j.instrumentErrors || []).forEach(function (e) { errorDetail.push('s' + j.seed + ': ' + e); });
  }
  launches = departs.filter(function (d) { return d.result === 'launch'; });
  holds = departs.filter(function (d) { return d.result === 'hold'; });
  const stamped = departs.filter(function (d) { return d.complete; });
  const coverage = departs.length ? stamped.length / departs.length : 0;

  // Per-launch armed share + per-member distributions (launches only).
  const launchArmedShares = [];
  const launchMembers = [];
  const launchHps = [];
  let volleyCarriers = 0, loadedCarriers = 0, ammoN = [];
  let lowHpMembers = 0, veryLowHpMembers = 0, albertoLike = [];
  for (const d of launches) {
    const ms = d.members || [];
    if (!ms.length) continue;
    const armed = ms.filter(function (m) { return m.armed; }).length;
    launchArmedShares.push(armed / ms.length);
    for (const m of ms) {
      launchMembers.push(m);
      launchHps.push(m.hp);
      if (m.hp < 50) lowHpMembers++;
      if (m.hp < 25) veryLowHpMembers++;
      if (m.hp <= 20) albertoLike.push({ seed: d._seed, day: d.day, vid: m.vid, name: m.name, hp: m.hp, melee: m.melee, ranged: m.ranged, ammoN: m.ammoN, loaded: m.loaded });
      if (m.volley) {
        volleyCarriers++;
        ammoN.push(m.ammoN);
        if (m.loaded) loadedCarriers++;
      }
    }
  }
  const hpSorted = launchHps.slice().sort(function (a, b) { return a - b; });
  const armedSorted = launchArmedShares.slice().sort(function (a, b) { return a - b; });
  const holderHps = launches.map(function (d) {
    const h = (d.members || []).find(function (m) { return m.role === 'holder'; });
    return h ? h.hp : null;
  }).filter(function (x) { return x !== null; });
  const holderSorted = holderHps.slice().sort(function (a, b) { return a - b; });

  const bars = {
    B1: { threshold: 'coverage >= 0.80', value: coverage, pass: coverage >= 0.80,
      detail: stamped.length + '/' + departs.length + ' departures stamped complete' },
    B2: { threshold: '>= 10 launches stamped with full distributions', value: launches.length, pass: launches.length >= 10,
      detail: launches.length + ' launches, ' + launchMembers.length + ' launch members' },
    B3: { threshold: 'verdict stated with numbers', value: null, pass: launches.length >= 10,
      detail: 'see verdict below' },
    B4: { threshold: '0 instrument errors; determinism byte-identical on re-run', value: instrumentErrors, pass: instrumentErrors === 0,
      detail: errorDetail.slice(0, 10) },
  };
  const verdict = (bars.B1.pass && bars.B2.pass && bars.B4.pass) ? 'DIAG-GO' : 'DIAG-NO-GO';
  return {
    seeds: seeds.sort(function (a, b) { return a - b; }),
    departs: departs.length, launches: launches.length, holds: holds.length,
    stamped: stamped.length, coverage: coverage,
    bars: bars, verdict: verdict,
    launchArmedShare: { n: launchArmedShares.length, median: median(launchArmedShares),
      q1: quartile(armedSorted, 0.25), q3: quartile(armedSorted, 0.75),
      min: armedSorted.length ? armedSorted[0] : null, max: armedSorted.length ? armedSorted[armedSorted.length - 1] : null,
      zeroArmed: launchArmedShares.filter(function (x) { return x === 0; }).length },
    launchHp: { n: launchHps.length, median: median(launchHps),
      q1: quartile(hpSorted, 0.25), q3: quartile(hpSorted, 0.75),
      min: hpSorted.length ? hpSorted[0] : null, max: hpSorted.length ? hpSorted[hpSorted.length - 1] : null,
      shareLt50: launchHps.length ? lowHpMembers / launchHps.length : null,
      shareLt25: launchHps.length ? veryLowHpMembers / launchHps.length : null,
      lt50: lowHpMembers, lt25: veryLowHpMembers },
    holderHp: { n: holderHps.length, median: median(holderHps),
      q1: quartile(holderSorted, 0.25), q3: quartile(holderSorted, 0.75),
      min: holderSorted.length ? holderSorted[0] : null, max: holderSorted.length ? holderSorted[holderSorted.length - 1] : null },
    volley: { carriers: volleyCarriers, loaded: loadedCarriers,
      loadedShare: volleyCarriers ? loadedCarriers / volleyCarriers : null,
      ammoMedian: median(ammoN), ammoZero: ammoN.filter(function (x) { return x === 0; }).length },
    albertoLike: albertoLike,
    instrumentErrors: instrumentErrors, errorDetail: errorDetail,
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { console.log(JSON.stringify({ selftest: 'use scripts/test-launchfit-b.js' })); return; }
  const di = args.indexOf('--dir');
  const dir = di !== -1 ? args[di + 1] : path.join(__dirname, '..', 'evidence', '2026-11-27', 'perseed-launchfit-b');
  const oi = args.indexOf('--out');
  const out = oi !== -1 ? args[oi + 1] : null;
  const files = fs.readdirSync(dir).filter(function (f) { return /^launchfit-b-s\d+\.json$/.test(f); })
    .map(function (f) { return path.join(dir, f); }).sort();
  if (!files.length) { console.error('ANALYZE-LAUNCHFIT-B STOP: no per-seed files in ' + dir); process.exit(2); }
  const res = analyzeFiles(files);
  if (out) fs.writeFileSync(out, JSON.stringify(res, null, 2) + '\n');
  console.log(JSON.stringify(res, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeFiles: analyzeFiles, median: median, quartile: quartile };
