// analyze-14cwatch2-b.js — §14c watch rerun analyzer (arm sim-14cwatch2-b).
// Reads the two per-seed dirs (control = competent-covenant-b,
// armed = competent-courtship-b) and computes, per seed and pooled:
//   combatDeaths   = deaths with kind 'monster' AND player false (FROZEN classifier)
//   allVillager    = deaths with player false, any kind (the driver's
//                    villagerCombatDeaths field — reported as all-villager,
//                    NEVER as combat deaths)
//   edgeMonster    = kind 'villager' + cause 'monster' + player false
//                    (non-combat under the frozen rule; sensitivity note)
//   starvation    = cause/kind matching /starv|hunger/i (answercourt precedent)
//   exposure      = sum of daily roster size (pop) from the series
//   wall numbers  = national by standing>=200 AND by scaleRank>=2, table,
//                   wins, wave 4/5 unlocks, median survival
// Usage: node scripts/analyze-14cwatch2-b.js [--control <dir>] [--armed <dir>]
//   [--out <analysis.json>] [--seeds 102221,...,102228]
// Writes the analysis JSON and prints the per-seed table + pooled verdict inputs.
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const CONTROL_DIR = path.join(REPO, argvVal('--control', 'evidence/2026-11-16/perseed-14cwatch2-b-control'));
const ARMED_DIR = path.join(REPO, argvVal('--armed', 'evidence/2026-11-16/perseed-14cwatch2-b-armed'));
const OUT_PATH = argvVal('--out', path.join(REPO, 'evidence', '2026-11-16', '14cwatch2-b-analysis.json'));
const SEEDS = (argvVal('--seeds', null) || '102221,102222,102223,102224,102225,102226,102227,102228')
  .split(',').map(function (s) { return parseInt(s.trim(), 10); });
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3, galactic: 3 };

function isCombat(d) { return d.kind === 'monster' && d.player === false; }
function isAllVillager(d) { return d.player === false; }
function isEdgeMonster(d) { return d.kind === 'villager' && d.cause === 'monster' && d.player === false; }
function isStarvation(d) { return /starv|hunger/i.test(String((d.cause || '') + ' ' + (d.kind || ''))); }

function kindBreakdown(deaths) {
  const b = {};
  for (const d of deaths) {
    if (!isCombat(d)) continue;
    const k = (d.kind || '?') + '|' + (d.cause || '?') + '|' + (d.who || '?');
    b[k] = (b[k] || 0) + 1;
  }
  return b;
}

function analyzeOne(dir, leg, seed) {
  const fp = path.join(dir, '14cwatch2-b-s' + seed + '-competent-' + leg + '-14cwatch2-b.json');
  if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
  const r = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const deaths = r.deaths || [];
  const combat = deaths.filter(isCombat);
  const allVill = deaths.filter(isAllVillager);
  const edge = deaths.filter(isEdgeMonster);
  const starv = deaths.filter(isStarvation);
  const exposure = (r.series || []).reduce(function (t, s) { return t + ((s.pop | 0) || 0); }, 0);
  const tableTaken = (r.seatTakes || []).some(function (s) { return s.ok; }) ||
    !!((r.tableState || {}).seat);
  return {
    seed: seed,
    policy: r.policy,
    days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    won: !!r.won, scaleRank: r.scaleRank, maxWave: r.maxWave,
    standing: r.standing, standingRaw: r.standingRaw,
    nationalByScale: (RANK_ORDER[r.scaleRank] || 0) >= 2,
    nationalByStanding: (r.standing | 0) >= 200,
    tableTaken: tableTaken,
    waveKills: r.waveKills || {},
    combatDeaths: combat.length,
    allVillagerDeaths: allVill.length,
    driverVillagerCombatDeaths: r.villagerCombatDeaths,
    edgeMonsterKindVillager: edge.length,
    starvationDeaths: starv.length,
    totalDeaths: deaths.length,
    playerDeaths: deaths.filter(function (d) { return d.player === true; }).length,
    exposure: exposure,
    combatPer1000: exposure > 0 ? combat.length * 1000 / exposure : null,
    instrumentErrors: (r.instrumentErrors || []).length,
    kindBreakdown: kindBreakdown(deaths),
  };
}

function summarize(rows) {
  const sum = function (f) { return rows.reduce(function (t, r) { return t + (r[f] | 0); }, 0); };
  const survivals = rows.map(function (r) { return r.gameDays | 0; }).sort(function (a, b) { return a - b; });
  const median = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
  return {
    seeds: rows.length,
    combatDeaths: sum('combatDeaths'),
    allVillagerDeaths: sum('allVillagerDeaths'),
    driverVillagerCombatDeaths: sum('driverVillagerCombatDeaths'),
    edgeMonsterKindVillager: sum('edgeMonsterKindVillager'),
    starvationDeaths: sum('starvationDeaths'),
    totalDeaths: sum('totalDeaths'),
    playerDeaths: sum('playerDeaths'),
    exposure: sum('exposure'),
    combatPer1000: sum('exposure') > 0 ? sum('combatDeaths') * 1000 / sum('exposure') : null,
    nationalByScale: rows.filter(function (r) { return r.nationalByScale; }).length,
    nationalByStanding: rows.filter(function (r) { return r.nationalByStanding; }).length,
    tableTaken: rows.filter(function (r) { return r.tableTaken; }).length,
    wins: rows.filter(function (r) { return r.won; }).length,
    wave4: rows.filter(function (r) { return (r.maxWave | 0) >= 4; }).length,
    wave5: rows.filter(function (r) { return (r.maxWave | 0) >= 5; }).length,
    medianSurvival: median,
    maxSurvival: survivals.length ? survivals[survivals.length - 1] : null,
    instrumentErrors: sum('instrumentErrors'),
  };
}

function main() {
  const control = SEEDS.map(function (s) { return analyzeOne(CONTROL_DIR, 'covenant-b', s); });
  const armed = SEEDS.map(function (s) { return analyzeOne(ARMED_DIR, 'courtship-b', s); });
  const cSum = summarize(control);
  const aSum = summarize(armed);
  const pooledRatio = cSum.combatDeaths > 0 ? aSum.combatDeaths / cSum.combatDeaths : null;
  const rateRatio = (cSum.combatPer1000 && aSum.combatPer1000) ? aSum.combatPer1000 / cSum.combatPer1000 : null;
  const perSeed = SEEDS.map(function (seed, i) {
    const c = control[i].combatDeaths, a = armed[i].combatDeaths;
    return { seed: seed, control: c, armed: a, ratio: c > 0 ? a / c : (a > 0 ? Infinity : null) };
  });
  const verdict = pooledRatio === null ? 'UNJUDGED'
    : pooledRatio >= 1.5 ? 'REPRODUCED'
    : (pooledRatio >= 0.8 && pooledRatio <= 1.2) ? 'NOT REPRODUCED' : 'INCONCLUSIVE';
  const out = {
    arm: 'sim-14cwatch2-b', run: 'fleshout-loop-b-20261116T1730Z',
    seeds: SEEDS, days: 200,
    classifier: 'combat = kind monster AND player false; driver villagerCombatDeaths = all non-player deaths',
    perSeedControl: control, perSeedArmed: armed,
    pooledControl: cSum, pooledArmed: aSum,
    pooledCombatRatio: pooledRatio,
    pooledCombatRateRatio: rateRatio,
    perSeedRatios: perSeed,
    verdict: verdict,
  };
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log('seed control armed ratio');
  for (const p of perSeed) console.log(p.seed, p.control, p.armed, p.ratio === null ? 'n/a' : (p.ratio === Infinity ? 'inf' : p.ratio.toFixed(2)));
  console.log('pooled combat: control ' + cSum.combatDeaths + ' armed ' + aSum.combatDeaths + ' ratio ' + (pooledRatio === null ? 'n/a' : pooledRatio.toFixed(3)));
  console.log('combat/1000 villager-days: control ' + (cSum.combatPer1000 === null ? 'n/a' : cSum.combatPer1000.toFixed(2)) + ' armed ' + (aSum.combatPer1000 === null ? 'n/a' : aSum.combatPer1000.toFixed(2)) + ' rate ratio ' + (rateRatio === null ? 'n/a' : rateRatio.toFixed(3)));
  console.log('all-villager (driver field): control ' + cSum.driverVillagerCombatDeaths + ' armed ' + aSum.driverVillagerCombatDeaths);
  console.log('starvation: control ' + cSum.starvationDeaths + ' armed ' + aSum.starvationDeaths + ' | median survival: control ' + cSum.medianSurvival + ' armed ' + aSum.medianSurvival);
  console.log('wall control: national(scale) ' + cSum.nationalByScale + '/8 national(standing) ' + cSum.nationalByStanding + '/8 table ' + cSum.tableTaken + ' wins ' + cSum.wins + ' wave4 ' + cSum.wave4 + ' wave5 ' + cSum.wave5);
  console.log('wall armed:   national(scale) ' + aSum.nationalByScale + '/8 national(standing) ' + aSum.nationalByStanding + '/8 table ' + aSum.tableTaken + ' wins ' + aSum.wins + ' wave4 ' + aSum.wave4 + ' wave5 ' + aSum.wave5);
  console.log('VERDICT: ' + verdict);
  return out;
}

if (require.main === module) main();
module.exports = { isCombat: isCombat, isAllVillager: isAllVillager, isEdgeMonster: isEdgeMonster, isStarvation: isStarvation, analyzeOne: analyzeOne, summarize: summarize, main: main };
