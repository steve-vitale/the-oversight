#!/usr/bin/env node
// analyze-prodrebound-b-obs.js — dose-response aggregator for the
// sim-prodrebound-b observational diagnostic.
//
// Reads the per-policy sweep JSONs and builds:
//   - the pantry->inflow dose-response (lean vs fat dawn, per channel)
//   - Pearson(dawn freshDays, same-day inflow) per channel
//   - marginal-rot shares per channel (rot within 3d of arrival / inflow)
//   - PRODTHROTTLE lean-vs-fat engagement, duty smoke-drive lean-vs-fat
//   - wall numbers, death-cause shares
//
// Usage: node scripts/analyze-prodrebound-b-obs.js <dir> [out.json]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || 'evidence/2026-10-20/perseed-prodrebound-b-obs';
const OUT = process.argv[3] || 'evidence/2026-10-20/prodrebound-b-obs-analysis.json';

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

const runs = [];
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  for (const r of (d.rows || [])) runs.push({ policy: d.meta.policy, seed: r.seed, end: r.end });
}
console.log(`runs: ${runs.length}`);

const wall = {};
for (const r of runs) {
  const p = (wall[r.policy] = wall[r.policy] || { n: 0, won: 0, table: 0, national: 0, w4: 0, w5: 0, surv: [], ends: {}, starveD: 0, deaths: {} });
  const e = r.end;
  p.n++; if (e.won) p.won++; if (e.tableWaiting) p.table++; if (e.nationalLive) p.national++;
  if (e.maxWave >= 4) p.w4++; if (e.maxWave >= 5) p.w5++;
  p.surv.push(e.days); p.ends[e.endReason] = (p.ends[e.endReason] || 0) + 1; p.starveD += e.starveDays;
  for (const dd of (e.deaths || [])) p.deaths[dd.cause] = (p.deaths[dd.cause] || 0) + 1;
}
for (const p of Object.values(wall)) {
  p.surv.sort((a, b) => a - b);
  p.median = p.surv[Math.floor(p.surv.length / 2)];
  p.max = p.surv[p.surv.length - 1];
}

// ---- day-pair dose-response: dawn pantry -> same-day inflow ----
const pairs = []; // {policy, seed, day, freshDays, pantryKcal, roster, inflow: {ch: kcal}}
for (const r of runs) {
  const e = r.end;
  const dawnByDay = {};
  for (const s of (e.dawn || [])) dawnByDay[s.day] = s;
  for (const [dayStr, inflow] of Object.entries(e.dayInflow || {})) {
    const day = Number(dayStr);
    const dawn = dawnByDay[day];
    if (!dawn) continue;
    pairs.push({ policy: r.policy, seed: r.seed, day, freshDays: dawn.freshDays, pantryKcal: dawn.pantryKcal, roster: dawn.roster, inflow });
  }
}
console.log(`paired day-rows: ${pairs.length}`);

const CHANNELS = ['share_surplus', 'duty_forage', 'duty_garden', 'duty_fish', 'duty_hunt', 'duty_cook', 'haul_field', 'traps', 'away_wild', 'other'];
const LEAN = 4; // at/under the PRODTHROTTLE threshold = lean
const dose = {};
for (const ch of CHANNELS) dose[ch] = { leanDays: 0, fatDays: 0, leanKcal: 0, fatKcal: 0, xs: [], ys: [] };
let totLean = 0, totFat = 0, totLeanK = 0, totFatK = 0;
const allX = [], allY = [];
for (const p of pairs) {
  const lean = p.freshDays <= LEAN;
  let tot = 0;
  for (const ch of CHANNELS) {
    const k = (p.inflow[ch] || 0);
    tot += k;
    const c = dose[ch];
    if (lean) { c.leanDays++; c.leanKcal += k; } else { c.fatDays++; c.fatKcal += k; }
    c.xs.push(p.freshDays); c.ys.push(k);
  }
  if (lean) { totLean++; totLeanK += tot; } else { totFat++; totFatK += tot; }
  allX.push(p.freshDays); allY.push(tot);
}

const chanReport = {};
for (const ch of CHANNELS) {
  const c = dose[ch];
  chanReport[ch] = {
    leanMean: c.leanDays ? Math.round(c.leanKcal / c.leanDays) : 0,
    fatMean: c.fatDays ? Math.round(c.fatKcal / c.fatDays) : 0,
    ratio: (c.leanDays && c.fatDays && c.fatKcal > 0) ? +((c.leanKcal / c.leanDays) / (c.fatKcal / c.fatDays)).toFixed(2) : null,
    pearson: pearson(c.xs, c.ys) === null ? null : +pearson(c.xs, c.ys).toFixed(3),
    n: c.leanDays + c.fatDays,
  };
}

// ---- marginal rot per channel (pooled) ----
const rotReport = {};
const inflTot = {}, rotTot = {}, fastTot = {};
for (const r of runs) {
  for (const [ch, v] of Object.entries(r.end.inflow || {})) inflTot[ch] = (inflTot[ch] || 0) + v;
  for (const [ch, v] of Object.entries(r.end.rotByCh || {})) rotTot[ch] = (rotTot[ch] || 0) + v;
  for (const [ch, v] of Object.entries(r.end.rotByChFast || {})) fastTot[ch] = (fastTot[ch] || 0) + v;
}
for (const ch of Object.keys(inflTot)) {
  rotReport[ch] = {
    inflowK: Math.round(inflTot[ch] / 1000),
    rotK: Math.round((rotTot[ch] || 0) / 1000),
    rotShare: inflTot[ch] > 0 ? +((rotTot[ch] || 0) / inflTot[ch]).toFixed(3) : null,
    fastRotK: Math.round((fastTot[ch] || 0) / 1000),
    fastRotShare: inflTot[ch] > 0 ? +((fastTot[ch] || 0) / inflTot[ch]).toFixed(3) : null,
  };
}

// ---- throttle lean-vs-fat engagement + duty smoke-drive lean-vs-fat ----
let thrLean = { c: 0, e: 0 }, thrFat = { c: 0, e: 0 }, dutyLeanK = 0, dutyFatK = 0, dutyLeanD = 0, dutyFatD = 0;
for (const r of runs) {
  const e = r.end;
  const dawnByDay = {};
  for (const s of (e.dawn || [])) dawnByDay[s.day] = s;
  for (const [dayStr, t] of Object.entries(e.dayThrottle || {})) {
    const dawn = dawnByDay[Number(dayStr)];
    if (!dawn) continue;
    const acc = dawn.freshDays <= LEAN ? thrLean : thrFat;
    acc.c += t.calls; acc.e += t.engaged;
  }
  for (const [dayStr, dd] of Object.entries(e.dayDuty || {})) {
    const dawn = dawnByDay[Number(dayStr)];
    if (!dawn) continue;
    const k = Object.values(dd).reduce((a, b) => a + b, 0);
    if (dawn.freshDays <= LEAN) { dutyLeanK += k; dutyLeanD++; } else { dutyFatK += k; dutyFatD++; }
  }
}

const report = {
  meta: { runs: runs.length, pairedDays: pairs.length, leanThresholdFreshDays: LEAN },
  wall,
  doseOverall: {
    leanMean: totLean ? Math.round(totLeanK / totLean) : 0,
    fatMean: totFat ? Math.round(totFatK / totFat) : 0,
    ratio: totLean && totFat && totFatK > 0 ? +((totLeanK / totLean) / (totFatK / totFat)).toFixed(2) : null,
    pearson: pearson(allX, allY) === null ? null : +pearson(allX, allY).toFixed(3),
    leanDays: totLean, fatDays: totFat,
  },
  channels: chanReport,
  marginalRot: rotReport,
  throttle: {
    lean: { calls: thrLean.c, engaged: thrLean.e, rate: thrLean.c ? +(thrLean.e / thrLean.c).toFixed(3) : null },
    fat: { calls: thrFat.c, engaged: thrFat.e, rate: thrFat.c ? +(thrFat.e / thrFat.c).toFixed(3) : null },
  },
  dutySmokeDrive: {
    leanMean: dutyLeanD ? Math.round(dutyLeanK / dutyLeanD) : 0,
    fatMean: dutyFatD ? Math.round(dutyFatK / dutyFatD) : 0,
    ratio: dutyLeanD && dutyFatD && dutyFatK > 0 ? +((dutyLeanK / dutyLeanD) / (dutyFatK / dutyFatD)).toFixed(2) : null,
  },
};

fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log('\n=== WALL ===');
for (const [p, w] of Object.entries(wall))
  console.log(`${p}: n=${w.n} won=${w.won} table=${w.table} national=${w.national} w4=${w.w4} w5=${w.w5} med=${w.median}d max=${w.max}d ends=${JSON.stringify(w.ends)} starveD=${w.starveD}`);
console.log('\n=== DOSE-RESPONSE (lean <=4 freshDays vs fat >4) ===');
console.log(`OVERALL: leanMean=${report.doseOverall.leanMean} fatMean=${report.doseOverall.fatMean} ratio=${report.doseOverall.ratio} pearson=${report.doseOverall.pearson} (lean n=${totLean}, fat n=${totFat})`);
for (const [ch, c] of Object.entries(chanReport))
  console.log(`  ${ch}: lean=${c.leanMean} fat=${c.fatMean} ratio=${c.ratio} pearson=${c.pearson} n=${c.n}`);
console.log('\n=== MARGINAL ROT (fast = rotted <=3d after arrival) ===');
for (const [ch, c] of Object.entries(rotReport))
  console.log(`  ${ch}: inflow=${c.inflowK}k rot=${c.rotK}k share=${c.rotShare} fastRot=${c.fastRotK}k fastShare=${c.fastRotShare}`);
console.log('\n=== THROTTLE ===');
console.log(`lean engage=${report.throttle.lean.rate} (${report.throttle.lean.engaged}/${report.throttle.lean.calls}) fat engage=${report.throttle.fat.rate} (${report.throttle.fat.engaged}/${report.throttle.fat.calls})`);
console.log(`duty smoke drive: leanMean=${report.dutySmokeDrive.leanMean} fatMean=${report.dutySmokeDrive.fatMean} ratio=${report.dutySmokeDrive.ratio}`);
console.log('\nwrote ' + OUT);
