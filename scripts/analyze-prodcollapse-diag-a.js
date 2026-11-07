#!/usr/bin/env node
// analyze-prodcollapse-diag-a.js — aggregate the prodcollapse-a diagnosis corpus,
// detect collapse episodes (trailing-14d produced/need < 0.80, >= 7 days), decompose
// each episode's shortfall into single-factor counterfactual kcal gains vs the pooled
// non-episode baseline, and classify EVERY episode by primary cause with quoted ledger
// rows. Also judges G2 (recorded vs bare fingerprints) and G3 (corpus validity).
// Reads per-seed JSONs from evidence/2026-11-07/prodcollapse-a-corpus/
// prodcollapse-a-competent-s*.json (+ prodcollapse-a-bare-s*.json + sweep-competent.json).
// Pure analysis: reads only, prints a report, exits 0. Verdict logic lives here;
// the sweep never judges.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'prodcollapse-a-corpus');

const sum = (xs) => xs.reduce((a, b) => a + (b || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : 'n/a');
const r1 = (n) => (n == null ? 'n/a' : (Math.round(n * 10) / 10));
const r3 = (n) => (n == null ? 'n/a' : (Math.round(n * 1000) / 1000));
const FOOD_TASKS = ['forage', 'hunt', 'fish', 'garden'];
const DUTY_STOCK_NAMES = ['Foraged food', 'Game meat', 'Garden harvest', 'Fish catch'];

// ---- per-day aggregates from one per-seed file ----
function dayAggs(s) {
  const byDay = new Map();
  const get = (d) => {
    let a = byDay.get(d);
    if (!a) {
      a = { day: d, produced: 0, need: 0, expected: 0, kfSum: 0, kfN: 0,
        healthSum: 0, healthN: 0, multSum: 0, multN: 0, rows: 0,
        stockedDuty: 0, stored: 0, pantryAdd: 0, donated: 0, league: 0,
        removedKcal: 0, takeBulk: 0, spoiledSwept: 0, spoiledDrawn: 0,
        foodDutyDays: 0, resolvedTotal: 0, vigorSum: 0, vigorN: 0,
        depletedSum: 0, barrenSum: 0, forageCalls: 0,
        huntCalls: 0, huntZero: 0, huntKcal: 0, zones: {},
        foragers: null, foragerMeanComp: null, season: null, weather: null,
        throttle: null, freshDays: null, pantryKcal: null, pop: null,
        awayCount: null, sickCount: null, meanHealth: null, meanVigor: null,
        meanStockRatio: null, barrenTiles: null, pressuredTiles: null };
      byDay.set(d, a);
    }
    return a;
  };
  for (const r of (s.mealRows || [])) {
    const a = get(r.day);
    a.rows++;
    a.produced += r.produced || 0;
    a.need += r.needEst || 0;
    a.expected += r.expected || 0;
    if (r.kf != null) { a.kfSum += r.kf; a.kfN++; }
    if (r.healthFrac != null) { a.healthSum += r.healthFrac; a.healthN++; }
    if (r.mult != null) { a.multSum += r.mult; a.multN++; }
  }
  for (const f of (s.flowSeries || [])) {
    const a = get(f.day);
    for (const nm of DUTY_STOCK_NAMES) a.stockedDuty += (f.stocked || {})[nm] || 0;
    a.stored += f.stored || 0; a.pantryAdd += f.pantryAdd || 0;
    a.donated += f.donated || 0; a.league += f.league || 0;
    a.removedKcal += f.removedKcal || 0; a.takeBulk += f.takeBulk || 0;
    a.spoiledSwept += f.spoiledSwept || 0; a.spoiledDrawn += f.spoiledDrawn || 0;
    for (const t of FOOD_TASKS) a.foodDutyDays += (f.resolved || {})[t] || 0;
    a.resolvedTotal += sum(Object.values(f.resolved || {}));
    a.vigorSum += f.vigorSum || 0; a.vigorN += f.vigorN || 0;
    a.depletedSum += f.depletedSum || 0; a.barrenSum += f.barrenSum || 0;
    a.forageCalls += f.forageCalls || 0;
    a.huntCalls += f.huntCalls || 0; a.huntZero += f.huntZero || 0;
    a.huntKcal += f.huntKcal || 0;
    for (const [z, n] of Object.entries(f.zones || {})) a.zones[z] = (a.zones[z] || 0) + n;
  }
  for (const d of (s.daySeries || [])) {
    const a = get(d.day);
    a.foragers = d.foragers; a.foragerMeanComp = d.foragerMeanComp;
    a.season = d.season; a.weather = d.weather;
    a.throttle = d.throttleEngaged; a.freshDays = d.freshDays;
    a.pantryKcal = d.pantryKcal; a.pop = d.pop;
    a.awayCount = d.awayCount; a.sickCount = d.sickCount;
    a.meanHealth = d.meanHealth; a.meanVigor = d.meanVigor;
    a.meanStockRatio = d.meanStockRatio; a.barrenTiles = d.barrenTiles;
    a.pressuredTiles = d.pressuredTiles;
  }
  return [...byDay.values()].sort((a, b) => a.day - b.day);
}

// ---- collapse episodes (pre-registered definition) ----
// Trailing-14d produced/need ratio per day; an episode is a maximal run of days
// with ratio < 0.80, length >= 7 days.
function computeDayRatios(days) {
  const out = [];
  for (let i = 0; i < days.length; i++) {
    const win = days.slice(Math.max(0, i - 13), i + 1);
    const prod = sum(win.map(d => d.produced));
    const need = sum(win.map(d => d.need));
    out.push({ day: days[i].day, ratio: need ? prod / need : null,
      dailyRatio: days[i].need ? days[i].produced / days[i].need : null,
      produced: days[i].produced, need: days[i].need });
  }
  return out;
}
function detectEpisodes(days) {
  const ratios = computeDayRatios(days);
  const eps = [];
  let run = [];
  const flush = () => {
    if (run.length >= 7) {
      const first = run[0], last = run[run.length - 1];
      eps.push({ startDay: first.day, endDay: last.day, length: run.length,
        minRatio: Math.min(...run.map(r => r.ratio)),
        meanRatio: run.reduce((t, r) => t + r.ratio, 0) / run.length,
        prodWindowStart: Math.max(1, first.day - 13), prodWindowEnd: last.day,
        days: run.map(r => r.day) });
    }
    run = [];
  };
  for (const r of ratios) {
    if (r.ratio != null && r.ratio < 0.80) run.push(r);
    else flush();
  }
  flush();
  return eps;
}

// ---- counterfactual decomposition over a day set ----
function counterfactuals(days, base) {
  const n = days.length;
  const producedEp = sum(days.map(d => d.produced));
  const expectedEp = sum(days.map(d => d.expected));
  const needEp = sum(days.map(d => d.need));
  const kfEp = sum(days.map(d => d.kfSum)) / Math.max(1, sum(days.map(d => d.kfN)));
  const hEp = sum(days.map(d => d.healthSum)) / Math.max(1, sum(days.map(d => d.healthN)));
  const multEp = sum(days.map(d => d.multSum)) / Math.max(1, sum(days.map(d => d.multN)));
  const fddEp = sum(days.map(d => d.foodDutyDays));
  const dutyEp = sum(days.map(d => d.stockedDuty));
  const fddRateEp = n ? fddEp / n : 0;
  const yieldEp = fddEp ? dutyEp / fddEp : 0;
  const needRateEp = n ? needEp / n : 0;
  const removedEp = sum(days.map(d => d.removedKcal));
  const takeBulkEp = sum(days.map(d => d.takeBulk));
  const spoilEp = sum(days.map(d => d.spoiledSwept));
  const inflowEp = producedEp + dutyEp + sum(days.map(d => d.stored + d.pantryAdd + d.donated + d.league));
  const S = needEp - inflowEp;
  const cf = {};
  cf['KNOW (plants unknown)'] = (kfEp < base.kf) ? producedEp * (base.kf / kfEp - 1) : 0;
  cf['HEALTH (wounds/sickness)'] = (hEp < base.health) ? producedEp * (base.health / hEp - 1) : 0;
  cf['GRIT (realized effort)'] = (multEp < base.mult) ? expectedEp * (base.mult - multEp) : 0;
  cf['LABOR (too few food-duty days)'] = (fddRateEp < base.fddRate)
    ? (base.fddRate - fddRateEp) * base.yieldPerFdd * n : 0;
  cf['YIELD (thin ground / failed hunts)'] = (yieldEp < base.yieldPerFdd)
    ? fddEp * (base.yieldPerFdd - yieldEp) : 0;
  cf['DRAIN (raid/tariff outflows)'] = removedEp + takeBulkEp;
  cf['SPOILAGE'] = spoilEp;
  cf['NEED (roster/need growth)'] = (needRateEp > base.needRate)
    ? (needRateEp - base.needRate) * n : 0;
  const ranked = Object.entries(cf).sort((a, b) => b[1] - a[1]);
  return { n, producedEp, expectedEp, needEp, kfEp, hEp, multEp, fddEp, dutyEp,
    fddRateEp, yieldEp, needRateEp, removedEp, takeBulkEp, spoilEp, S, cf, ranked,
    primary: ranked[0] };
}

function main() {
  const files = fs.readdirSync(DIR).filter(f => /^prodcollapse-a-competent-s\d+\.json$/.test(f)).sort();
  if (!files.length) { console.error('no per-seed files in ' + DIR); process.exit(2); }
  const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  const perSeedAggs = seeds.map(s => ({ seed: s.seed, days: dayAggs(s), raw: s }));
  // Episodes per seed first (baselines need non-episode days).
  for (const ps of perSeedAggs) ps.episodes = detectEpisodes(ps.days);
  const epDaySet = new Map(); // seed -> Set of episode days
  for (const ps of perSeedAggs) {
    const set = new Set();
    for (const ep of ps.episodes) for (const d of ep.days) set.add(d);
    epDaySet.set(ps.seed, set);
  }
  // Pooled non-episode baseline.
  const nonEpDays = [];
  for (const ps of perSeedAggs) {
    const set = epDaySet.get(ps.seed);
    for (const d of ps.days) if (!set.has(d.day)) nonEpDays.push(d);
  }
  const base = {
    kf: sum(nonEpDays.map(d => d.kfSum)) / Math.max(1, sum(nonEpDays.map(d => d.kfN))),
    health: sum(nonEpDays.map(d => d.healthSum)) / Math.max(1, sum(nonEpDays.map(d => d.healthN))),
    mult: sum(nonEpDays.map(d => d.multSum)) / Math.max(1, sum(nonEpDays.map(d => d.multN))),
    fddRate: nonEpDays.length ? sum(nonEpDays.map(d => d.foodDutyDays)) / nonEpDays.length : 0,
    yieldPerFdd: sum(nonEpDays.map(d => d.foodDutyDays))
      ? sum(nonEpDays.map(d => d.stockedDuty)) / sum(nonEpDays.map(d => d.foodDutyDays)) : 0,
    needRate: nonEpDays.length ? sum(nonEpDays.map(d => d.need)) / nonEpDays.length : 0,
    nDays: nonEpDays.length,
  };

  console.log('=== sim-prodcollapse-diag-a DIAGNOSIS (seeds ' + seeds.map(s => s.seed).join(',') + ', competent, 150d) ===');
  console.log('');
  // Pooled production vs burn (cross-check vs the sibling's 1.054).
  const P = { produced: 0, need: 0, ate: 0, starveDeaths: 0, throttleDays: 0, snapDays: 0,
    deathCauses: {}, national: 0, table: 0, wins: 0, daysAlive: [], waveReach: {} };
  for (const s of seeds) {
    P.produced += sum((s.mealRows || []).map(r => r.produced || 0));
    P.need += sum((s.mealRows || []).map(r => r.needEst || 0));
    P.ate += sum((s.mealRows || []).map(r => r.ate || 0));
    for (const d of (s.daySeries || [])) { P.snapDays++; if (d.throttleEngaged) P.throttleDays++; }
    for (const d of (s.deathRows || [])) {
      P.deathCauses[d.cause] = (P.deathCauses[d.cause] || 0) + 1;
      if (d.cause === 'starvation' && !d.isPlayer) P.starveDeaths++;
    }
    P.daysAlive.push(s.daysAlive);
    for (const w of (s.waveReach || [])) P.waveReach[w] = (P.waveReach[w] || 0) + 1;
    if (s.national) P.national++;
    if (s.table) P.table++;
    if (s.win) P.wins++;
  }
  console.log('D1 PRODUCTION vs BURN (pooled, deduped meal rows): produced=' + fmt(P.produced) +
    ' need=' + fmt(P.need) + ' ate=' + fmt(P.ate) +
    ' produced/need=' + (P.need ? (P.produced / P.need).toFixed(3) : 'n/a'));
  console.log('  starvation deaths (villager)=' + P.starveDeaths +
    ' death causes=' + JSON.stringify(P.deathCauses));
  console.log('  throttle-engaged village-days=' + P.throttleDays + '/' + P.snapDays +
    ' (' + pct(P.throttleDays, P.snapDays) + ')');
  console.log('WALL: national=' + P.national + '/' + seeds.length + ' table=' + P.table +
    ' wins=' + P.wins + ' waveReach=' + JSON.stringify(P.waveReach) +
    ' medianSurvival=' + med(P.daysAlive) + 'd max=' + Math.max(...P.daysAlive) + 'd');
  console.log('');
  console.log('NON-EPISODE BASELINE (pooled ' + base.nDays + ' village-days): kf=' + r3(base.kf) +
    ' healthFrac=' + r3(base.health) + ' mult=' + r3(base.mult) +
    ' foodDutyDays/day=' + r1(base.fddRate) + ' dutyKcal/foodDutyDay=' + fmt(base.yieldPerFdd) +
    ' need/day=' + fmt(base.needRate));
  console.log('');

  // ---- G3 corpus validity ----
  let g3ok = true;
  const g3notes = [];
  for (const s of seeds) {
    const days = s.daySeries || [], flows = s.flowSeries || [], meals = s.mealRows || [];
    const keys = meals.map(r => r.vid + '|' + r.day);
    const ok = days.length === s.daysAlive && flows.length > 0 &&
      new Set(keys).size === keys.length && Array.isArray(s.deathRows);
    if (!ok) { g3ok = false; g3notes.push('s' + s.seed + ': daySeries=' + days.length + ' daysAlive=' + s.daysAlive + ' flows=' + flows.length + ' mealRows=' + meals.length + ' deduped=' + (new Set(keys).size === keys.length)); }
  }
  const bareFiles = fs.readdirSync(DIR).filter(f => /^prodcollapse-a-bare-s\d+\.json$/.test(f)).sort();
  if (bareFiles.length !== 8) { g3ok = false; g3notes.push('bare fingerprints: ' + bareFiles.length + '/8 present'); }
  console.log('G3 CORPUS: ' + (g3ok ? 'PASS — all 16 legs valid (8 recorded + 8 bare)' : 'FAIL — ' + g3notes.join('; ')));
  console.log('');

  // ---- G2 neutrality ----
  let g2 = 'NOT CHECKED (no sweep-competent.json summary found)';
  try {
    const summPath = path.join(DIR, 'sweep-competent.json');
    if (fs.existsSync(summPath)) {
      const summ = JSON.parse(fs.readFileSync(summPath, 'utf8'));
      const mism = [];
      for (const row of (summ.rows || [])) {
        const bf = path.join(DIR, `prodcollapse-a-bare-s${row.seed}.json`);
        if (!fs.existsSync(bf)) { mism.push('s' + row.seed + ': bare file missing'); continue; }
        const bareFp = JSON.parse(fs.readFileSync(bf, 'utf8'));
        const recFp = row.fingerprint;
        if (JSON.stringify(bareFp) !== JSON.stringify(recFp)) {
          const diffs = [];
          for (const k of Object.keys(bareFp)) {
            if (JSON.stringify(bareFp[k]) !== JSON.stringify(recFp ? recFp[k] : undefined)) diffs.push(k);
          }
          mism.push('s' + row.seed + ': fingerprint differs on ' + (diffs.join(', ') || 'unknown'));
        }
      }
      g2 = mism.length ? 'FAIL — ' + mism.join('; ') : 'PASS — recorded == bare on all 8 seeds';
    }
  } catch (e) { g2 = 'ERROR — ' + e.message; }
  console.log('G2 NEUTRALITY: ' + g2);
  console.log('');

  // ---- Episodes + classification (G4) ----
  let totalEps = 0;
  for (const ps of perSeedAggs) {
    const s = ps.raw;
    console.log('--- seed ' + ps.seed + ' (daysAlive=' + s.daysAlive + ') — ' + ps.episodes.length + ' episode(s) ---');
    if (!ps.episodes.length) {
      const ratios = computeDayRatios(ps.days);
      const minR = Math.min(...ratios.filter(r => r.ratio != null).map(r => r.ratio));
      console.log('  no collapse episode: min trailing-14d produced/need=' + r3(minR));
      continue;
    }
    for (const ep of ps.episodes) {
      totalEps++;
      const epDays = ps.days.filter(d => ep.days.includes(d.day));
      const cf = counterfactuals(epDays, base);
      // Core window: days inside the episode with daily produced/need < 0.8.
      const coreDays = epDays.filter(d => d.need && d.produced / d.need < 0.8);
      const cfCore = coreDays.length >= 3 ? counterfactuals(coreDays, base) : null;
      // Supporting ledger: vigor, hunts, foragers, season/weather, throttle, deaths.
      const vigorMean = sum(epDays.map(d => d.vigorSum)) / Math.max(1, sum(epDays.map(d => d.vigorN)));
      const lowVigorShare = (() => {
        // Per-day mean vigor < 50 share (resolution-level vigor is in flowSeries;
        // day-level mean is the recorded proxy).
        const days = epDays.filter(d => d.vigorN > 0);
        if (!days.length) return 'n/a';
        const low = days.filter(d => (d.vigorSum / d.vigorN) < 50).length;
        return pct(low, days.length) + ' of forage days (mean avgVigor<50)';
      })();
      const huntZeroShare = pct(sum(epDays.map(d => d.huntZero)), sum(epDays.map(d => d.huntCalls)));
      const foragersEp = (() => {
        const xs = epDays.map(d => d.foragers).filter(x => x != null);
        return xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : 'n/a';
      })();
      const foragerCompEp = (() => {
        const xs = epDays.map(d => d.foragerMeanComp).filter(x => x != null);
        return xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2) : 'n/a';
      })();
      const seasons = {};
      for (const d of epDays) seasons[d.season || '?'] = (seasons[d.season || '?'] || 0) + 1;
      const weathers = {};
      for (const d of epDays) weathers[d.weather || '?'] = (weathers[d.weather || '?'] || 0) + 1;
      const thrShare = pct(epDays.filter(d => d.throttle).length, epDays.length);
      const deathsInEp = (s.deathRows || []).filter(d => d.day >= ep.startDay && d.day <= ep.endDay);
      const starveInEp = deathsInEp.filter(d => d.cause === 'starvation');
      console.log('  EPISODE d' + ep.startDay + '–d' + ep.endDay + ' (' + ep.length + 'd, prod window d' +
        ep.prodWindowStart + '–d' + ep.prodWindowEnd + '): min trailing-14d ratio=' + r3(ep.minRatio) +
        ' mean=' + r3(ep.meanRatio));
      console.log('    shortfall S=' + fmt(cf.S) + ' kcal over ' + cf.n + 'd (need=' + fmt(cf.needEp) +
        ' produced=' + fmt(cf.producedEp) + ' duty=' + fmt(cf.dutyEp) + ')');
      console.log('    episode means: kf=' + r3(cf.kfEp) + ' (base ' + r3(base.kf) + ')' +
        ' healthFrac=' + r3(cf.hEp) + ' (base ' + r3(base.health) + ')' +
        ' mult=' + r3(cf.multEp) + ' (base ' + r3(base.mult) + ')' +
        ' foodDutyDays/day=' + r1(cf.fddRateEp) + ' (base ' + r1(base.fddRate) + ')' +
        ' dutyKcal/foodDutyDay=' + fmt(cf.yieldEp) + ' (base ' + fmt(base.yieldPerFdd) + ')' +
        ' need/day=' + fmt(cf.needRateEp) + ' (base ' + fmt(base.needRate) + ')');
      console.log('    COUNTERFACTUALS (single-factor kcal gains vs non-episode baseline — NOT additive, they overlap):');
      for (const [name, v] of cf.ranked) console.log('      ' + fmt(v) + '  ' + name);
      console.log('    PRIMARY CAUSE: ' + cf.primary[0] + ' (' + fmt(cf.primary[1]) + ' kcal)');
      if (cfCore) {
        console.log('    CORE WINDOW (' + cfCore.n + 'd with daily produced/need<0.8): S=' + fmt(cfCore.S) +
          ' primary=' + cfCore.primary[0] + ' (' + fmt(cfCore.primary[1]) + ' kcal)' +
          ' kf=' + r3(cfCore.kfEp) + ' health=' + r3(cfCore.hEp) + ' mult=' + r3(cfCore.multEp) +
          ' yield/FDD=' + fmt(cfCore.yieldEp));
      }
      console.log('    LEDGER: mean avgVigor at forage=' + r1(vigorMean) +
        ' | low-vigor days=' + lowVigorShare +
        ' | depleted tiles stripped=' + fmt(sum(epDays.map(d => d.depletedSum))) +
        ' barren-at-call=' + fmt(sum(epDays.map(d => d.barrenSum))) +
        ' | hunt zero-kcal=' + huntZeroShare + ' (' + sum(epDays.map(d => d.huntZero)) + '/' + sum(epDays.map(d => d.huntCalls)) + ')' +
        ' huntKcal=' + fmt(sum(epDays.map(d => d.huntKcal))));
      console.log('    LEDGER: foragers/day=' + foragersEp + ' meanComp=' + foragerCompEp +
        ' (base fddRate ' + r1(base.fddRate) + ')' +
        ' | seasons=' + JSON.stringify(seasons) + ' weather=' + JSON.stringify(weathers) +
        ' | throttle-engaged=' + thrShare +
        ' | meanHealth=' + r1(epDays.length ? sum(epDays.map(d => d.meanHealth || 0)) / epDays.length : null) +
        ' sickCount/day=' + r1(epDays.length ? sum(epDays.map(d => d.sickCount || 0)) / epDays.length : null) +
        ' away/day=' + r1(epDays.length ? sum(epDays.map(d => d.awayCount || 0)) / epDays.length : null));
      console.log('    LEDGER: deaths in episode=' + deathsInEp.length + ' (starvation ' + starveInEp.length + ')' +
        starveInEp.map(d => ' d' + d.day + ' ' + d.whoName + ' pantry=' + ((d.ctx || {}).pantryKcal) + ' freshDays=' + ((d.ctx || {}).freshDays)).join(';'));
      // Sense: say-window beats from deaths inside the episode.
      for (const d of starveInEp) {
        const beats = (d.sayWin || []).slice(-3);
        if (beats.length) console.log('    SENSE (d' + d.day + ' ' + d.whoName + '): ' + JSON.stringify(beats));
      }
    }
    console.log('');
  }
  const seedsWithEp = perSeedAggs.filter(ps => ps.episodes.length).length;
  console.log('G4 CLASSIFICATION: ' + totalEps + ' episode(s) on ' + seedsWithEp + '/8 seeds — ' +
    (totalEps ? 'EVERY episode classified above with quoted ledger rows' : 'no episodes found; prevalence 0/8') +
    ' (prevalence ' + seedsWithEp + '/8 seeds)');
  console.log('DIAGNOSIS VERDICT: ' + (totalEps ? 'COMPLETE — ' + totalEps + ' episode(s) classified' : 'COMPLETE — no collapse episode reproduced on this band; see evidence'));
}

if (require.main === module) main();
module.exports = { detectEpisodes, computeDayRatios, counterfactuals, dayAggs, FOOD_TASKS };
