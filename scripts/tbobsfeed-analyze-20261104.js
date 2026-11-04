// tbobsfeed-analyze-20261104.js — judged-leg analyzer for arm sim-tbobsfeed-a.
// Reads paired per-seed JSONs from scripts/tbobsfeed-driver-20261104.js
// (evidence/2026-11-04/perseed-tbobsfeed-a/tbobsfeed-s<seed>-<RUN>.json).
// Usage:
//   node scripts/tbobsfeed-analyze-20261104.js <baseRUN> <armedRUN> <seed...>
// Prints a judged table + GO verdict per the pre-registered legs.
// A won fight whose kind was already known at fight start is EXCLUDED
// from the feed-rate denominator (shared core correctly no-ops) and
// reported separately. Missing start/end inventory is reported, never
// counted as fed or unfed.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-04', 'perseed-tbobsfeed-a');
const W4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];

function load(seed, run) {
  const f = path.join(DIR, 'tbobsfeed-s' + seed + '-' + run + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function wonFights(d) {
  return (d.exposures || []).filter(function (e) {
    return e.type === 'tb' && e.end && e.end.result === 'won';
  });
}
function fedOf(e) {
  const s = e.trickInventoryStart && e.trickInventoryStart.trick;
  const t = e.trickInventoryEnd && e.trickInventoryEnd.trick;
  if (!s || !t || s.villageCounterObs == null || t.villageCounterObs == null) return 'missing';
  if (s.villageKnowsTrick) return 'already-known';
  return (t.villageCounterObs > s.villageCounterObs) ? 'fed' : 'unfed';
}
function knownKinds(d) {
  const out = {};
  const inv = d.endInventory || {};
  for (const k of Object.keys(inv.kinds || {})) {
    const st = inv.kinds[k];
    if (st && st.villagerTricks) out[k] = true;
  }
  return out;
}
function starv(d) {
  return (d.deaths || []).filter(function (x) { return x.cause === 'starvation' || x.cause === 'hunger'; }).length;
}
function median(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

function main() {
  const args = process.argv.slice(2);
  const baseRUN = args[0], armedRUN = args[1];
  const seeds = args.slice(2).map(Number);
  if (!baseRUN || !armedRUN || !seeds.length) {
    console.error('usage: node scripts/tbobsfeed-analyze-20261104.js <baseRUN> <armedRUN> <seed...>');
    process.exit(2);
  }
  let fed = 0, denom = 0, alreadyKnown = 0, missing = 0, unfed = 0, fedTotal = 0;
  let armOnlyLoss = 0, baseStarv = 0, armedStarv = 0;
  const baseDays = [], armedDays = [];
  const rows = [];
  for (const seed of seeds) {
    const b = load(seed, baseRUN), a = load(seed, armedRUN);
    const wf = wonFights(a);
    const detail = [];
    for (const e of wf) {
      const f = fedOf(e);
      if (f === 'fed') { fed++; denom++; fedTotal++; }
      else if (f === 'unfed') { unfed++; denom++; }
      else if (f === 'already-known') { alreadyKnown++; }
      else { missing++; }
      detail.push(e.mid + '@d' + e.day + ':' + f +
        '(obs ' + ((e.trickInventoryStart && e.trickInventoryStart.trick || {}).villageCounterObs) +
        '->' + ((e.trickInventoryEnd && e.trickInventoryEnd.trick || {}).villageCounterObs) + ')');
    }
    // Fed observations total counts ALL armed-leg fed observations on won
    // fights (each won fight feeds at most 1 per kind; exposures are
    // single-kind here, so this equals the fed count above).
    const bk = knownKinds(b), ak = knownKinds(a);
    const gained = W4.filter(function (k) { return ak[k] && !bk[k]; });
    const bStarv = starv(b), aStarv = starv(a);
    baseStarv += bStarv; armedStarv += aStarv;
    if (a.endReason === 'village-lost' && b.endReason === 'survived') armOnlyLoss++;
    baseDays.push(b.days); armedDays.push(a.days);
    rows.push({
      seed: seed,
      baseDays: b.days, armedDays: a.days, baseEnd: b.endReason, armedEnd: a.endReason,
      baseWins: b.won, armedWins: a.won, baseScale: b.scaleRank, armedScale: a.scaleRank,
      baseMaxWave: b.maxWave, armedMaxWave: a.maxWave,
      baseKillsW4: b.killsW4, armedKillsW4: a.killsW4,
      baseTB: (b.exposures || []).filter(function (e) { return e.type === 'tb'; }).length,
      armedTB: (a.exposures || []).filter(function (e) { return e.type === 'tb'; }).length,
      armedWonTB: wf.length, wonDetail: detail.join('; '),
      kindsGained: gained.join(',') || '—',
      baseKnownW4: Object.keys(bk).join(',') || '—', armedKnownW4: Object.keys(ak).join(',') || '—',
      baseStarv: bStarv, armedStarv: aStarv,
      baseDeaths: (b.deaths || []).length, armedDeaths: (a.deaths || []).length,
      orphans: ((a.orphanTbEnds || []).length + (b.orphanTbEnds || []).length),
      errors: ((a.instrumentErrors || []).length + (b.instrumentErrors || []).length),
    });
  }
  const rate = denom ? fed / denom : 0;
  const bMed = median(baseDays), aMed = median(armedDays);
  console.log('PER-SEED (base=' + baseRUN + ' armed=' + armedRUN + ')');
  for (const r of rows) console.log(JSON.stringify(r));
  console.log('JUDGED:');
  console.log(JSON.stringify({
    wonTBArmed: fed + unfed + alreadyKnown + missing,
    fed: fed, unfed: unfed, alreadyKnownExcluded: alreadyKnown, missingInventory: missing,
    feedRate: denom ? +(rate).toFixed(3) : null, denom: denom,
    leg1_feedRate_ge_0_80: denom > 0 && rate >= 0.80,
    fedObservationsTotal: fedTotal,
    kindsGainedAny: rows.some(function (r) { return r.kindsGained !== '—'; }),
    leg2_knowledge: rows.some(function (r) { return r.kindsGained !== '—'; }) || fedTotal >= 3,
    baseStarvationTotal: baseStarv, armedStarvationTotal: armedStarv,
    leg3a_starvation_le_basePlus2: armedStarv <= baseStarv + 2,
    armOnlyVillageLossSeeds: armOnlyLoss,
    leg3b_armOnlyLoss_eq_0: armOnlyLoss === 0,
    baseMedianDays: bMed, armedMedianDays: aMed,
    leg3c_median_ge_0_8x: aMed >= 0.8 * bMed,
  }, null, 2));
}
main();
