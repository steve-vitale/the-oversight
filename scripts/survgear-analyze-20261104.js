// survgear-analyze-20261104.js — SURVIVORSHIP + GEAR-STABILITY joint
// counterfactual (arm sim-survgear-b). Pure function over per-seed
// corpus rows; no game reads, no re-scoring. Killer fates come from
// vetprod-analyze's killerFates (single source of truth).
//
// Per snapshot day d the analyzer reduces the counterfactual to two
// numbers (see sim-survgear-b-prereg.md for the fixed definitions):
//   minE(d): smallest survival extension E with V_E(d) >= 2.
//     For each killer banked by d, req = 0 if alive, else
//     d - deathDay + 1 (need d < deathDay + E). minE(d) is the 2nd
//     smallest req, or Infinity when fewer than 2 killers banked.
//   minG(d): smallest gear hold G with both gear legs held-met.
//     For a leg, 0 if met on d, d - lastMetDay if met earlier,
//     Infinity if never met by d. minG(d) = max over the two legs.
// A snapshot day is counterfactual-ready at (E, G) iff raw >= 200,
// tricks actually met, minE(d) <= E, and minG(d) <= G. Gated standing
// is NEVER used as the release proxy (vetshape lesson: capped at 199
// while held). Days with no readiness5 object never count as ready.
// Usage: node scripts/survgear-analyze-20261104.js <per-seed-dir>
//   [vetshape-dir-for-reproduction-check]
//   Prints a JSON summary.
'use strict';
const fs = require('fs');
const path = require('path');
const VETPROD = require(path.join(__dirname, 'vetprod-analyze-20261104'));

const SCAN_E = [0, 7, 14, 28, 60];
const SCAN_G = [0, 7, 14, 30];
const INF = Infinity;

function legReadings(row) {
  // Per snapshot day: raw, gated, armorMet, weaponsMet, tricksMet,
  // engine short list, engine veterans count, demand.
  const out = [];
  (row.daily || []).forEach(function (s) {
    const r5 = s.readiness5;
    if (!r5) return;
    const dem = r5.demand || {};
    const armoredDem = (dem.armored != null) ? dem.armored : 4;
    const armedDem = (dem.armed != null) ? dem.armed : 6;
    const tricksDem = (dem.tricks != null) ? dem.tricks : 3;
    out.push({
      day: s.day, raw: s.raw, gated: s.gated,
      armored: r5.armored, armed: r5.armed, tricks: r5.tricks,
      engineVets: r5.veterans, short: r5.short || null,
      armorMet: (r5.armored | 0) >= armoredDem,
      weaponsMet: (r5.armed | 0) >= armedDem,
      tricksMet: (r5.tricks | 0) >= tricksDem,
    });
  });
  return out;
}

function dayTable(row) {
  const fates = VETPROD.killerFates(row);
  const legs = legReadings(row);
  let lastArmorMet = null, lastWeaponsMet = null;
  const days = legs.map(function (L) {
    if (L.armorMet) lastArmorMet = L.day;
    if (L.weaponsMet) lastWeaponsMet = L.day;
    const reqs = fates.filter(function (f) { return f.firstDay <= L.day; })
      .map(function (f) { return f.deathDay == null ? 0 : (L.day - f.deathDay + 1); })
      .sort(function (a, b) { return a - b; });
    const minE = reqs.length >= 2 ? reqs[1] : INF;
    const gArmor = L.armorMet ? 0 : (lastArmorMet == null ? INF : (L.day - lastArmorMet));
    const gWeapons = L.weaponsMet ? 0 : (lastWeaponsMet == null ? INF : (L.day - lastWeaponsMet));
    const minG = Math.max(gArmor, gWeapons);
    // Actual (E=0, G=0) short set, derived from counts + living count.
    const living0 = fates.filter(function (f) {
      return f.firstDay <= L.day && (f.deathDay == null || L.day < f.deathDay);
    }).length;
    const short = [];
    if (!L.armorMet) short.push('armor');
    if (!L.weaponsMet) short.push('weapons');
    if (!L.tricksMet) short.push('tricks');
    if (living0 < 2) short.push('veterans');
    return {
      day: L.day, raw: L.raw, gated: L.gated,
      armored: L.armored, armed: L.armed, tricks: L.tricks,
      engineVets: L.engineVets, engineShort: L.short,
      living0: living0, shape: fates.filter(function (f) { return f.firstDay <= L.day; }).length,
      armorMet: L.armorMet, weaponsMet: L.weaponsMet, tricksMet: L.tricksMet,
      shortDerived: short, minE: minE, minG: minG,
    };
  });
  return { fates: fates, days: days };
}

function readyDaysAt(days, E, G) {
  return days.filter(function (d) {
    return d.raw != null && d.raw >= 200 && d.tricksMet &&
      d.minE <= E && d.minG <= G;
  }).map(function (d) { return d.day; });
}

function minimalPairs(days) {
  // Candidate (minE, minG) per raw>=200 + tricks-met day; Pareto-minimal
  // set plus the three prereg summaries. Search bounds E<=120, G<=90:
  // a candidate outside the bounds cannot be minimal inside them unless
  // no in-bounds candidate exists, in which case the summaries are null.
  const cands = days.filter(function (d) {
    return d.raw != null && d.raw >= 200 && d.tricksMet &&
      d.minE <= 120 && d.minG <= 90;
  }).map(function (d) { return { day: d.day, E: d.minE, G: d.minG }; });
  if (!cands.length) return { minimalE: null, minimalG: null, minimalSum: null, pareto: [] };
  const byE = cands.slice().sort(function (a, b) { return (a.E - b.E) || (a.G - b.G); });
  const minimalE = byE[0];
  const byG = cands.slice().sort(function (a, b) { return (a.G - b.G) || (a.E - b.E); });
  const minimalG = byG[0];
  const bySum = cands.slice().sort(function (a, b) { return ((a.E + a.G) - (b.E + b.G)) || (a.E - b.E); });
  const minimalSum = bySum[0];
  const pareto = [];
  cands.slice().sort(function (a, b) { return (a.E - b.E) || (a.G - b.G); }).forEach(function (c) {
    if (!pareto.some(function (p) { return p.E <= c.E && p.G <= c.G; })) pareto.push(c);
  });
  return { minimalE: minimalE, minimalG: minimalG, minimalSum: minimalSum, pareto: pareto };
}

function analyzeSeed(row) {
  const t = dayTable(row);
  const fates = t.fates;
  const days = t.days;
  const scan = {};
  SCAN_E.forEach(function (E) {
    SCAN_G.forEach(function (G) {
      scan[E + 'x' + G] = readyDaysAt(days, E, G);
    });
  });
  const mins = minimalPairs(days);
  const survivalOnly = readyDaysAt(days, 120, 0);
  const survivalOnlyMinE = (function () {
    const c = days.filter(function (d) {
      return d.raw != null && d.raw >= 200 && d.tricksMet && d.minG === 0 && d.minE <= 120;
    }).map(function (d) { return d.minE; });
    return c.length ? Math.min.apply(null, c) : null;
  })();
  const gearOnlyMinG = (function () {
    const c = days.filter(function (d) {
      return d.raw != null && d.raw >= 200 && d.tricksMet && d.minE === 0 && d.minG <= 90;
    }).map(function (d) { return d.minG; });
    return c.length ? Math.min.apply(null, c) : null;
  })();
  // Binding-leg day counts (actual E=0, G=0), derived short sets.
  const bindingAll = {}, bindingRaw200 = {};
  days.forEach(function (d) {
    const k = d.shortDerived.length ? d.shortDerived.join('+') : 'none';
    bindingAll[k] = (bindingAll[k] | 0) + 1;
    if (d.raw != null && d.raw >= 200) bindingRaw200[k] = (bindingRaw200[k] | 0) + 1;
  });
  const intervals = fates.filter(function (f) { return f.killToDeathDays != null; })
    .map(function (f) { return f.killToDeathDays; }).sort(function (a, b) { return a - b; });
  const medianInterval = intervals.length
    ? ((intervals[Math.floor((intervals.length - 1) / 2)] + intervals[Math.ceil((intervals.length - 1) / 2)]) / 2) : null;
  const causes = {};
  fates.forEach(function (f) { if (f.deathCause) causes[f.deathCause] = (causes[f.deathCause] | 0) + 1; });
  const peakGated = days.reduce(function (m, d) { return (d.gated != null && d.gated > m) ? d.gated : m; }, -Infinity);
  const peakRaw = days.reduce(function (m, d) { return (d.raw != null && d.raw > m) ? d.raw : m; }, -Infinity);
  const armorMetDays = days.filter(function (d) { return d.armorMet; }).length;
  const weaponsMetDays = days.filter(function (d) { return d.weaponsMet; }).length;
  const lastArmorMet = days.filter(function (d) { return d.armorMet; }).map(function (d) { return d.day; });
  const lastWeaponsMet = days.filter(function (d) { return d.weaponsMet; }).map(function (d) { return d.day; });
  const w4fights = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4; }).length;
  const w4kills = (row.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
  return {
    seed: row.seed, days: row.days, endReason: row.endReason,
    won: !!row.won, scaleRank: row.scaleRank, unlockedWave: row.unlockedWave, maxWave: row.maxWave,
    peakGated: peakGated === -Infinity ? null : peakGated,
    peakRaw: peakRaw === -Infinity ? null : peakRaw,
    w4fights: w4fights, w4kills: w4kills, killersEver: fates.length,
    killers: fates, killToDeathIntervals: intervals, medianKillToDeath: medianInterval,
    deathCauses: causes,
    armorMetDays: armorMetDays, weaponsMetDays: weaponsMetDays,
    lastArmorMetDay: lastArmorMet.length ? lastArmorMet[lastArmorMet.length - 1] : null,
    lastWeaponsMetDay: lastWeaponsMet.length ? lastWeaponsMet[lastWeaponsMet.length - 1] : null,
    scanGrid: scan,
    survivalOnlyMinE: survivalOnlyMinE,
    survivalOnlyReadyDaysAt120: survivalOnly,
    gearOnlyMinG: gearOnlyMinG,
    minimalE: mins.minimalE, minimalG: mins.minimalG, minimalSum: mins.minimalSum,
    paretoMinimalPairs: mins.pareto,
    bindingLegDaysAll: bindingAll, bindingLegDaysRaw200: bindingRaw200,
    snapshotDays: days.length,
    instrumentErrors: (row.instrumentErrors || []).length,
    dayTable: days,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('survgear-s') === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const errSeeds = seeds.filter(function (s) { return s.instrumentErrors > 0; }).length;
  const totalErr = seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0);
  // GO pair: a single (E<=28, G<=30) with >=1 ready day on >=3 error-free seeds.
  let goPair = null;
  outer: for (let ei = 0; ei < SCAN_E.length; ei++) {
    for (let gi = 0; gi < SCAN_G.length; gi++) {
      const E = SCAN_E[ei], G = SCAN_G[gi];
      if (E > 28 || G > 30) continue;
      const n = seeds.filter(function (s) {
        return s.instrumentErrors === 0 && s.scanGrid[E + 'x' + G].length > 0;
      }).length;
      if (n >= 3) { goPair = { E: E, G: G, seeds: n }; break outer; }
    }
  }
  const verdict = errSeeds > 2 ? 'INSUFFICIENT-DATA' :
    (goPair ? 'DIAG-GO' : 'DIAG-NO-CANDIDATE');
  const allIntervals = [];
  seeds.forEach(function (s) { s.killToDeathIntervals.forEach(function (v) { allIntervals.push(v); }); });
  allIntervals.sort(function (a, b) { return a - b; });
  const medianAll = allIntervals.length
    ? ((allIntervals[Math.floor((allIntervals.length - 1) / 2)] + allIntervals[Math.ceil((allIntervals.length - 1) / 2)]) / 2) : null;
  const dayList = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = dayList.length ? ((dayList[Math.floor((dayList.length - 1) / 2)] + dayList[Math.ceil((dayList.length - 1) / 2)]) / 2) : null;
  const wall = {
    wins: seeds.filter(function (s) { return s.won; }).length,
    national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: 0,
    wave4unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 4 || (s.maxWave | 0) >= 4; }).length,
    wave4faced: seeds.filter(function (s) { return s.w4fights > 0; }).length,
    wave4kills: seeds.reduce(function (m, s) { return m + s.w4kills; }, 0),
    wave5unlocks: seeds.filter(function (s) { return (s.unlockedWave | 0) >= 5; }).length,
    wave5faced: 0, medianDays: medianDays,
  };
  return {
    verdict: verdict, goPair: goPair, n: seeds.length,
    totalInstrumentErrors: totalErr, errSeeds: errSeeds,
    medianKillToDeathAll: medianAll, killToDeathIntervalsAll: allIntervals,
    wall: wall, seeds: seeds,
  };
}

function reproductionCheck(survDir, vetDir) {
  const out = [];
  fs.readdirSync(survDir).filter(function (f) { return f.indexOf('survgear-s') === 0 && f.endsWith('.json'); }).sort()
    .forEach(function (f) {
      const row = JSON.parse(fs.readFileSync(path.join(survDir, f), 'utf8'));
      const vf = fs.readdirSync(vetDir).filter(function (g) { return g.indexOf('vetshape-s' + row.seed + '-') === 0; })[0];
      if (!vf) { out.push({ seed: row.seed, match: false, reason: 'no vetshape file' }); return; }
      const v = JSON.parse(fs.readFileSync(path.join(vetDir, vf), 'utf8'));
      const peakGated = function (r) {
        return (r.daily || []).reduce(function (m, s) { return (s.gated != null && s.gated > m) ? s.gated : m; }, null);
      };
      const fates = VETPROD.killerFates(row), vfates = VETPROD.killerFates(v);
      const sameFates = JSON.stringify(fates.map(function (k) { return [k.by, k.firstDay, k.deathDay]; })) ===
        JSON.stringify(vfates.map(function (k) { return [k.by, k.firstDay, k.deathDay]; }));
      const w4f = function (r) { return (r.fights || []).filter(function (e) { return (e.wave | 0) >= 4; }).length; };
      const w4k = function (r) { return (r.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length; };
      const match = row.days === v.days && peakGated(row) === peakGated(v) &&
        w4f(row) === w4f(v) && w4k(row) === w4k(v) && sameFates;
      out.push({
        seed: row.seed, match: match, days: [row.days, v.days],
        peakGated: [peakGated(row), peakGated(v)],
        w4fights: [w4f(row), w4f(v)], w4kills: [w4k(row), w4k(v)],
        sameFates: sameFates,
      });
    });
  return out;
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: survgear-analyze-20261104.js <per-seed-dir> [vetshape-dir]'); process.exit(2); }
  const summary = analyzeDir(dir);
  if (process.argv[3]) summary.reproduction = reproductionCheck(dir, process.argv[3]);
  console.log(JSON.stringify(summary, null, 2));
}

module.exports = {
  legReadings: legReadings, dayTable: dayTable, readyDaysAt: readyDaysAt,
  minimalPairs: minimalPairs, analyzeSeed: analyzeSeed, analyzeDir: analyzeDir,
  reproductionCheck: reproductionCheck, SCAN_E: SCAN_E, SCAN_G: SCAN_G,
};
