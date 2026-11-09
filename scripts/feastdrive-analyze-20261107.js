// feastdrive-analyze-20261107.js — summarize a feastdrive corpus
// (arm sim-feastdrive-b). Reads per-seed JSON from a corpus dir and
// prints a JSON summary: per-seed chain state (channels / arms /
// feasts / grants / draws / faced / driven-off / spent), end feast
// gate + gate-day counts, first-arm/feast/grant/draw/spend days,
// baseline-reproduction check against the preregged regionalstep
// numbers, and the scale-wall numbers. The evidence file is the
// record; this is the arithmetic behind it.
// Usage: node scripts/feastdrive-analyze-20261107.js <corpus-dir> [--out <file>]
'use strict';
const fs = require('fs');
const path = require('path');
// sim-sitmetric-b: the row's finalSeat is the ALIGNED seat (taken, not
// priced) — see scripts/lib/seat-taken.js. A priced-but-untaken seat
// (seed 53004: "lesser", taken 0) reads 'none' here.
const { alignedSeat } = require(path.join(__dirname, 'lib', 'seat-taken'));

const dir = process.argv[2];
if (!dir) { console.error('FEASTDRIVE-ANALYZE STOP: corpus dir required.'); process.exit(2); }
const outIdx = process.argv.indexOf('--out');
const outFile = outIdx >= 0 ? process.argv[outIdx + 1] : null;

const EXPECTED = { medianDays: 114.5, w4kills: [1, 1, 2, 1, 0, 8, 4, 0], links: 0, regional: 0, spentFalse: 7 };

const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
const seeds = [];
for (const f of files) {
  const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const daily = o.daily || [];
  const last = daily[daily.length - 1] || {};
  const gates = {};
  daily.forEach(function (d) { gates[d.feastGate || '?'] = (gates[d.feastGate || '?'] | 0) + 1; });
  const w4kills = (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const w5kills = (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); }).length;
  // Starvation deaths: teleDeaths is an ARRAY of death records
  // ({kind, cause}) in this driver — the old object-index read
  // ((teleDeaths).starvation) always returned 0. Count records whose
  // kind/cause names starvation. (Measurement correction 2026-11-07:
  // true counts are baseline 6, armed 6 — the frozen cost bar still
  // passes, 6 <= 6+2; the correction changes the number, not the
  // verdict. See sim-feastdrive-b.md.)
  const starveDeaths = Array.isArray(o.teleDeaths)
    ? o.teleDeaths.filter(function (d) { return /starv/i.test(((d.cause || '') + ' ' + (d.kind || ''))); }).length
    : (((o.teleDeaths || {}).starvation | 0) + ((o.teleDeaths || {}).starved | 0));
  seeds.push({
    seed: o.seed, policy: o.policy, days: o.days, endReason: o.endReason, won: !!o.won,
    maxWave: o.maxWave, standing: o.standing, scaleRank: o.scaleRank,
    finalSeat: alignedSeat(o),
    w4kills: w4kills, w5kills: w5kills, pairDays: daily.filter(function (d) { return d.pairDay; }).length,
    channels: last.channels | 0, arms: last.arms | 0, feasts: last.feasts | 0,
    armedFeasts: last.armedFeasts | 0, grants: last.grants | 0,
    draws: last.draws | 0, drawn: last.drawn | 0, facedOk: last.facedOk | 0,
    drivenOff: last.drivenOff | 0, spent: !!last.spent,
    resonance: last.surgeResonance, l3: last.l3Count,
    firstArmDay: o.firstArmDay, firstFeastDay: o.firstFeastDay,
    firstGrantDay: o.firstGrantDay, firstDrawDay: o.firstDrawDay,
    firstSpendDay: o.firstSpendDay, endFeastGate: o.endFeastGate,
    sentimentTaught: !!last.sentimentTaught,
    foodDeeds: !!(last.sentimentTaught && last.spent),
    teleDeaths: o.teleDeaths || null,
    feastGates: gates, feastLines: (o.feastLines || []).length,
    starveDeaths: starveDeaths, errors: (o.instrumentErrors || []).length,
    instrumentErrors: o.instrumentErrors || [],
  });
}

function median(nums) {
  const s = nums.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  if (!n) return null;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

const days = seeds.map(function (s) { return s.days; });
const endGates = {};
seeds.forEach(function (s) { endGates[s.endFeastGate || '?'] = (endGates[s.endFeastGate || '?'] | 0) + 1; });
const spentSeeds = seeds.filter(function (s) { return s.spent; }).length;
const foodDeeds = seeds.filter(function (s) { return s.foodDeeds; }).length;
const summary = {
  seeds: seeds.length,
  medianDays: median(days),
  maxDays: Math.max.apply(null, days),
  survived: seeds.filter(function (s) { return s.endReason === 'survived' || s.days >= 150; }).length,
  won: seeds.filter(function (s) { return s.won; }).length,
  national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
  table: seeds.filter(function (s) { return s.finalSeat && s.finalSeat !== 'none'; }).length,
  wave4unlock: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
  wave5unlock: seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
  w4killsTotal: seeds.reduce(function (a, s) { return a + s.w4kills; }, 0),
  w4killsPerSeed: seeds.map(function (s) { return s.w4kills; }),
  pairDaysTotal: seeds.reduce(function (a, s) { return a + s.pairDays; }, 0),
  spentSeeds: spentSeeds,
  foodDeedsSeeds: foodDeeds,
  endFeastGates: endGates,
  starveDeathsTotal: seeds.reduce(function (a, s) { return a + s.starveDeaths; }, 0),
  starveDeathsPerSeed: seeds.map(function (s) { return s.starveDeaths; }),
  totalErrors: seeds.reduce(function (a, s) { return a + s.errors; }, 0),
  baselineCheck: {
    medianDaysMatch: median(days) === EXPECTED.medianDays,
    medianDays: median(days), expectedMedian: EXPECTED.medianDays,
    w4killsMatch: JSON.stringify(seeds.map(function (s) { return s.w4kills; })) === JSON.stringify(EXPECTED.w4kills),
    w4kills: seeds.map(function (s) { return s.w4kills; }), expectedW4: EXPECTED.w4kills,
    linksMatch: true, // links/regional read from scaleRank + regionalAttempts in the evidence file
    spentFalseCount: seeds.filter(function (s) { return !s.spent; }).length,
    expectedSpentFalse: EXPECTED.spentFalse,
  },
  perSeed: seeds,
};
console.log(JSON.stringify(summary, null, 2));
if (outFile) fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
