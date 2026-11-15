// analyze-successorcaution-ceiling-b.js — PRE-SIM corpus analysis for
// sim-successorcaution-b. Reads a committed per-seed corpus dir (funeral-mend
// ON) and computes, per seed: (a) the P1 baseline — scholar `the wild`
// deaths per national-day (national-days from the series nationalLive
// flag); (b) the CAUTION CEILING — for each scholar `the wild` death, the
// gap in days to the previous scholar death of ANY cause (the succession
// day). A death with gap 0 happened the same day as the previous scholar
// death, i.e. inside the death day's own daily() call — a daily-level
// caution gate can never prevent it. Gap 1-2 deaths fall inside an N=2
// caution window (successor's first two daily() calls); gap 3+ fall
// outside it. Read-only; prints JSON to stdout.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const WIN = parseInt(process.argv[3] || '2', 10) || 2;
if (!dir) { console.error('usage: node scripts/analyze-successorcaution-ceiling-b.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
let totWild = 0, totNatDays = 0, totPlayerDeaths = 0, totWildNat = 0, totCeilWild = 0, totCeilWildNat = 0;
const gaps = { 0: 0, 1: 0, 2: 0, '3+': 0 };
const perSeed = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const natDays = (r.series || []).filter(function (s) { return s.nationalLive; }).length;
  const playerDeaths = (r.deaths || []).filter(function (d) { return d.player; })
    .sort(function (a, b) { return (a.day - b.day); });
  const wild = playerDeaths.filter(function (d) { return d.cause === 'the wild'; });
  // National-day attribution: a death counts as while-national when the
  // nearest series snapshot on/before its day has nationalLive. Series is
  // one row per day, so join on day.
  const natByDay = {};
  for (const s of (r.series || [])) natByDay[s.d] = !!s.nationalLive;
  let wildNat = 0;
  for (const d of wild) if (natByDay[d.day]) wildNat += 1;
  // Gap analysis over ALL player deaths (any cause): succession follows
  // every scholar death.
  const seedGaps = { 0: 0, 1: 0, 2: 0, '3+': 0 };
  let prevDay = null;
  for (const d of playerDeaths) {
    if (d.cause !== 'the wild') { prevDay = d.day; continue; }
    if (prevDay === null) { seedGaps['3+'] += 1; } // first scholar death: no prior succession
    else {
      const g = d.day - prevDay;
      if (g <= 0) seedGaps[0] += 1;
      else if (g === 1) seedGaps[1] += 1;
      else if (g === 2) seedGaps[2] += 1;
      else seedGaps['3+'] += 1;
    }
    prevDay = d.day;
  }
  for (const k of Object.keys(gaps)) gaps[k] += seedGaps[k];
  // EPISODE CEILING: group consecutive player deaths into episodes
  // (a new episode starts after a gap >= 3 days or at the first death).
  // Within an episode, caution gets its first chance at the first death
  // with gap 1-2 from its predecessor (the successor's first/second
  // daily call). Preventing THAT death also prevents every later death
  // in the episode (no new succession, no cascade followers). So the
  // ceiling = all deaths from the first gap-1/2 death to the end of
  // each episode. Deaths before it (episode starter + same-day gap-0
  // followers) are never reachable by a daily-level gate.
  let ceilWild = 0, ceilWildNat = 0;
  let ep = []; // current episode: player deaths
  const flushEp = function () {
    if (!ep.length) return;
    let idx = -1;
    for (let i = 1; i < ep.length; i++) {
      const g = ep[i].day - ep[i - 1].day;
      if (g >= 1 && g <= WIN) { idx = i; break; }
    }
    if (idx >= 0) {
      for (let i = idx; i < ep.length; i++) {
        if (ep[i].cause === 'the wild') { ceilWild += 1; if (natByDay[ep[i].day]) ceilWildNat += 1; }
      }
    }
    ep = [];
  };
  for (const d of playerDeaths) {
    if (ep.length && (d.day - ep[ep.length - 1].day) >= 3) flushEp();
    ep.push(d);
  }
  flushEp();
  totWild += wild.length; totNatDays += natDays; totPlayerDeaths += playerDeaths.length;
  totWildNat += wildNat; totCeilWild += ceilWild; totCeilWildNat += ceilWildNat;
  perSeed.push({ seed: r.seed, days: r.days, endReason: r.endReason,
    natDays: natDays, playerDeaths: playerDeaths.length,
    wildScholar: wild.length, wildScholarNat: wildNat,
    p1: natDays ? +(wildNat / natDays).toFixed(3) : null,
    gaps: seedGaps, ceilWild: ceilWild, ceilWildNat: ceilWildNat });
}
console.log(JSON.stringify({ corpus: dir, windowN: WIN, seeds: files.length,
  totalWildScholar: totWild, totalWildScholarNat: totWildNat, totalNatDays: totNatDays,
  totalPlayerDeaths: totPlayerDeaths,
  pooledP1: totNatDays ? +(totWildNat / totNatDays).toFixed(4) : null,
  ceilingPreventableWild: totCeilWild, ceilingPreventableWildNat: totCeilWildNat,
  ceilingP1: totNatDays ? +((totWildNat - totCeilWildNat) / totNatDays).toFixed(4) : null,
  ceilingP1xControl: totWildNat ? +((totWildNat - totCeilWildNat) / totWildNat).toFixed(3) : null,
  gaps: gaps,
  gapShare: { gap0: +(gaps[0] / Math.max(1, totWild)).toFixed(3),
    gap12: +((gaps[1] + gaps[2]) / Math.max(1, totWild)).toFixed(3),
    gap3plus: +(gaps['3+'] / Math.max(1, totWild)).toFixed(3) },
  perSeed: perSeed }, null, 2));
