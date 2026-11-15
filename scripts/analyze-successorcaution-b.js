// analyze-successorcaution-b.js — JUDGE analyzer for sim-successorcaution-b.
// Reads one per-seed corpus dir and prints per-seed + aggregate numbers
// for the pre-registered bars. Definitions (same as the prereg and the
// funeralmend analyzer):
//   P1 = scholar `the wild` deaths WHILE NATIONAL / national-days.
//     While-national: the death's day joins to a series snapshot with
//     nationalLive true. National-days: series days with nationalLive.
//     (Cross-check P1-scale uses the scaleRank national/global join.)
//   P2 = median nationalHeldDays (series days with scale national/global).
//   Dissolutions = nationalLive true->false transitions in the series;
//     reclimbs = false->true after a dissolution.
//   Starvation deaths = /starv|hunger/i on cause + kind.
//   Median survival = median days.
//   Caution stats pooled from capSummary.successorcaution.
// Read-only; prints JSON to stdout.
// Usage: node scripts/analyze-successorcaution-b.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/analyze-successorcaution-b.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
let totWildNat = 0, totNatDaysLive = 0, totWildNatScale = 0, totNatDaysScale = 0;
let totStarv = 0, totDeaths = 0, totDiss = 0, totReclimb = 0;
let totSucc = 0, totCautionDays = 0, totSuppressed = 0, totNotNeeded = 0;
const perSeed = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const series = r.series || [];
  const natByDayLive = {}, natByDayScale = {};
  for (const s of series) {
    natByDayLive[s.d] = !!s.nationalLive;
    natByDayScale[s.d] = (s.scale === 'national' || s.scale === 'global');
  }
  const natDaysLive = series.filter(function (s) { return s.nationalLive; }).length;
  const natHeld = series.filter(function (s) { return s.scale === 'national' || s.scale === 'global'; }).length;
  const firstNat = series.find(function (s) { return s.scale === 'national' || s.scale === 'global'; });
  let wildNat = 0, wildNatScale = 0, wildAll = 0;
  let starv = 0;
  for (const d of (r.deaths || [])) {
    if (/starv|hunger/i.test(String((d.cause || '') + ' ' + (d.kind || '')))) starv += 1;
    if (d.player && d.cause === 'the wild') {
      wildAll += 1;
      if (natByDayLive[d.day]) wildNat += 1;
      if (natByDayScale[d.day]) wildNatScale += 1;
    }
  }
  // Dissolutions / reclimbs on the nationalLive flag.
  const diss = [], recl = [];
  let wasNat = false;
  for (const s of series) {
    const nat = !!s.nationalLive;
    if (wasNat && !nat) diss.push(s.d);
    if (!wasNat && nat && diss.length > recl.length) recl.push(s.d);
    wasNat = nat;
  }
  const sc = ((r.capSummary || {}).successorcaution || {});
  totWildNat += wildNat; totNatDaysLive += natDaysLive;
  totWildNatScale += wildNatScale; totNatDaysScale += natHeld;
  totStarv += starv; totDeaths += (r.deaths || []).length;
  totDiss += diss.length; totReclimb += recl.length;
  totSucc += (sc.successionsDetected | 0); totCautionDays += (sc.cautionDays | 0);
  totSuppressed += (sc.tripsSuppressed | 0); totNotNeeded += (sc.tripsNotNeeded | 0);
  perSeed.push({ seed: r.seed, days: r.days, endReason: r.endReason,
    won: !!r.won, maxWave: r.maxWave, scaleRank: r.scaleRank,
    natDay: firstNat ? firstNat.d : null, natDaysLive: natDaysLive,
    nationalHeldDays: natHeld, dissolutions: diss, reclimbs: recl,
    wildScholar: wildAll, wildScholarNat: wildNat, wildScholarNatScale: wildNatScale,
    p1: natDaysLive ? +(wildNat / natDaysLive).toFixed(3) : null,
    starv: starv, deaths: (r.deaths || []).length,
    caution: sc.successionsDetected !== undefined ? sc : null });
}
const heldList = perSeed.map(function (s) { return s.nationalHeldDays; });
const daysList = perSeed.map(function (s) { return s.days; });
console.log(JSON.stringify({
  corpus: dir, seeds: files.length,
  nationalEver: perSeed.filter(function (s) { return s.natDay !== null; }).length,
  endNational: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
  wins: perSeed.filter(function (s) { return s.won; }).length,
  wave5: perSeed.filter(function (s) { return s.maxWave >= 5; }).length,
  wave4: perSeed.filter(function (s) { return s.maxWave >= 4; }).length,
  medianNationalHeldDays: med(heldList),
  medianSurvivalDays: med(daysList),
  dissolutions: totDiss, reclimbs: totReclimb,
  starvationPooled: totStarv, totalDeaths: totDeaths,
  wildScholarNat: totWildNat, natDaysLive: totNatDaysLive,
  pooledP1: totNatDaysLive ? +(totWildNat / totNatDaysLive).toFixed(4) : null,
  pooledP1scale: totNatDaysScale ? +(totWildNatScale / totNatDaysScale).toFixed(4) : null,
  cautionPooled: { successionsDetected: totSucc, cautionDays: totCautionDays,
    tripsSuppressed: totSuppressed, tripsNotNeeded: totNotNeeded },
  perSeed: perSeed,
}, null, 2));
