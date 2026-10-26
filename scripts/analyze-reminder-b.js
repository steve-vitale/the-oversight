#!/usr/bin/env node
// analyze-reminder-b.js — B-vs-R paired table + GO evaluation for
// sim-reminder-b. Reads evidence/2026-10-26/sim-reminder-b-corpus/.
// Usage: node scripts/analyze-reminder-b.js [corpus-dir] [pilot|confirm]
// Classification (independent re-implementation of the header rules):
// R voices in day order, per-cook last-spoken figure: cook never spoke
// -> initial; figure differs -> change; figure equals cook's last
// spoken figure -> reminder. A reminder's preceding voiceless run is
// the count of consecutive racks-bound (B) days immediately before
// its day on which R did not speak.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-reminder-b-corpus');
const MODE = process.argv[3] || 'pilot';
const SEEDS = MODE === 'confirm'
  ? [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767, 9768, 9769, 9770, 9771, 9772, 9773, 9774, 9775]
  : [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const N = 7;
function load(v, s) {
  const name = MODE === 'confirm'
    ? `reminder-b-${v}-confirm-pd0-dg1-leadfeast-s${s}.json`
    : `reminder-b-${v}-pd0-dg1-leadfeast-s${s}.json`;
  const f = path.join(DIR, name);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function numerics(r) {
  return [r.daysAlive, r.preserveVillagerBatches, r.preserveVillagerResolutions,
    r.deaths, r.rank, r.national, JSON.stringify(r.waveReach), r.table, r.win].join('|');
}
function analyzeSeed(b, r) {
  // B: exactly one line per racks-bound day (gate B day slot).
  const bByDay = new Map();
  for (const d of (b.racksFullDetail || [])) {
    if (bByDay.has(d.day)) bByDay.set(d.day, { kcal: bByDay.get(d.day).kcal, dup: true });
    else bByDay.set(d.day, { kcal: d.kcal, dup: false });
  }
  const bDays = Array.from(bByDay.keys()).sort((x, y) => x - y);
  const rDays = new Set((r.racksFullDetail || []).map(d => d.day));
  const rDetail = (r.racksFullDetail || []).slice().sort((x, y) => x.day - y.day);
  // Voiceless runs over B days.
  const voicelessRuns = [];
  let run = 0;
  for (const day of bDays) {
    if (!rDays.has(day)) run += 1;
    else { if (run) voicelessRuns.push(run); run = 0; }
  }
  if (run) voicelessRuns.push(run);
  const maxVoiceless = voicelessRuns.length ? Math.max(...voicelessRuns) : 0;
  // Preceding voiceless run length for each B day (scan).
  const preRun = new Map();
  let cur = 0;
  for (const day of bDays) {
    if (!rDays.has(day)) cur += 1;
    else { preRun.set(day, cur); cur = 0; }
  }
  // Reminder classification + schedule check.
  const lastByCook = new Map();
  let initial = 0, change = 0, reminder = 0;
  const reminderDays = [];
  const reminderScheduleBad = [];
  for (const d of rDetail) {
    const last = lastByCook.get(d.cook);
    if (last === undefined) { initial += 1; }
    else if (last !== d.kcal) { change += 1; }
    else {
      reminder += 1;
      reminderDays.push(d.day);
      if (preRun.get(d.day) !== N - 1) reminderScheduleBad.push({ day: d.day, cook: d.cook, pre: preRun.get(d.day) });
    }
    lastByCook.set(d.cook, d.kcal);
  }
  // Frozen runs over B days (same first-complaint figure).
  const frozenRuns = [];
  let fr = 0, prevKcal = null;
  for (const day of bDays) {
    const k = bByDay.get(day).kcal;
    if (fr === 0 || k === prevKcal) fr += 1;
    else { frozenRuns.push(fr); fr = 1; }
    prevKcal = k;
  }
  if (fr) frozenRuns.push(fr);
  const maxFrozen = frozenRuns.length ? Math.max(...frozenRuns) : 0;
  // R voices subset of B days?
  const rOutsideB = rDetail.filter(d => !bByDay.has(d.day)).length;
  return {
    bDays: bDays.length, bTotal: (b.racksFullDetail || []).length,
    rTotal: rDetail.length, rDays: rDays.size,
    initial, change, reminder, reminderDays,
    reminderScheduleBad,
    maxVoiceless, voicelessRuns,
    maxFrozen, frozenRuns,
    rOutsideB,
    bDupDays: Array.from(bByDay.values()).filter(v => v.dup).length,
    numericsSame: numerics(b) === numerics(r),
    saySame: b.sayTotal === r.sayTotal,
    plainDelta: (r.plainLines || 0) - (b.plainLines || 0),
    plainDeltaExpected: (b.racksFullDetail || []).length - rDetail.length,
    workedOk: b.workedLines === b.preserveVillagerResolutions && r.workedLines === r.preserveVillagerResolutions,
    noVoiceLost: !((b.racksFullDetail || []).length > 0 && rDetail.length === 0),
    bSay: b.sayTotal, rSay: r.sayTotal,
    bPlain: b.plainLines, rPlain: r.plainLines,
    bRank: b.rank, rRank: r.rank, bDaysAlive: b.daysAlive, rDaysAlive: r.daysAlive,
    bWave: b.waveReach, national: b.national, table: b.table, win: b.win,
    bByCook: (b.census || {}).racksFullByCook, rByCook: (r.census || {}).racksFullByCook,
  };
}
let bandB = 0, bandR = 0, bandRem = 0;
let coverageOk = true, guardOk = true, numericsOk = true, sayOk = true, voiceOk = true, workedOk = true;
console.log('seed | B R rem init chg | maxVoice-less maxFrozen | sayB sayR plainDelta | numerics worked noVoiceLost');
for (const s of SEEDS) {
  const b = load('B', s), r = load('R', s);
  if (!b || !r) { console.log(s + ' MISSING'); coverageOk = guardOk = numericsOk = sayOk = voiceOk = false; continue; }
  const a = analyzeSeed(b, r);
  bandB += a.bTotal; bandR += a.rTotal; bandRem += a.reminder;
  if (a.maxVoiceless > N - 1) coverageOk = false;
  if (a.reminderScheduleBad.length) coverageOk = false;
  if (a.rTotal > a.bTotal) guardOk = false;
  if (!a.numericsSame) numericsOk = false;
  if (!a.saySame || a.plainDelta !== a.plainDeltaExpected) sayOk = false;
  if (!a.noVoiceLost) voiceOk = false;
  if (!a.workedOk) workedOk = false;
  console.log(`${s} | ${a.bTotal} ${a.rTotal} ${a.reminder} ${a.initial} ${a.change} | ${a.maxVoiceless} ${a.maxFrozen} | ${a.bSay} ${a.rSay} ${a.plainDelta} | ${a.numericsSame} ${a.workedOk} ${a.noVoiceLost} | voicelessRuns=${JSON.stringify(a.voicelessRuns)} frozenRuns=${JSON.stringify(a.frozenRuns)} schedBad=${JSON.stringify(a.reminderScheduleBad)} rOutsideB=${a.rOutsideB} bDup=${a.bDupDays}`);
  console.log(`  cooks B=${JSON.stringify(a.bByCook)} R=${JSON.stringify(a.rByCook)} rank=${a.bRank} days=${a.bDaysAlive} wave=${JSON.stringify(a.bWave)} national=${a.national}`);
}
const bandGuard = bandR <= bandB;
console.log(`BAND B=${bandB} R=${bandR} reminders=${bandRem} guard(band)=${bandGuard}`);
console.log(`GO coverage=${coverageOk} guardPerSeed=${guardOk} guardBand=${bandGuard} numerics=${numericsOk} say=${sayOk} voiceKept=${voiceOk} worked=${workedOk}`);
console.log(`VERDICT ${MODE.toUpperCase()} ${coverageOk && guardOk && bandGuard && numericsOk && sayOk && voiceOk && workedOk ? 'GO' : 'NO-GO'}`);
