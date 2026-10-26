#!/usr/bin/env node
// test-reminder-b.js — proof tests for sim-reminder-b.
// ORDER (binding, per the evidence header): the NEUTRALITY leg runs
// FIRST. If any neutrality assertion fails, the test exits nonzero
// immediately and NO classified number (coverage, totals, say) is
// judged. Only after neutrality passes does the test evaluate the
// GO bars (coverage, guardrail, say, voice-kept).
// T1: line parsers + classifier fixtures on synthetic detail arrays.
// T2: corpus assertions (pilot default; pass 'confirm' for the
//   fresh band 9760-9775).
// Usage: node scripts/test-reminder-b.js [corpus-dir] [pilot|confirm]
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-reminder-b-corpus');
const MODE = process.argv[3] || 'pilot';
const SEEDS = MODE === 'confirm'
  ? [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767, 9768, 9769, 9770, 9771, 9772, 9773, 9774, 9775]
  : [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const N = 7;
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) { pass += 1; } else { fail += 1; console.log('FAIL: ' + name); } }
function eq(a, b, name) { ok(a === b, name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

// ---- T1: parsers (same regexes as the sweep) ----
function cookOf(text) {
  const m = String(text || '').match(/^🍲 (\S+) cooked for the haven/);
  if (m) return m[1];
  const m2 = String(text || '').match(/so (\S+) left the fresh pile/);
  return m2 ? m2[1] : '?';
}
function keptKcalOf(text) {
  const m = String(text || '').match(/\(([\d,]+) kcal kept/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}
const RF = '🍲 Miguel cooked for the haven — meals stretched. The racks are already full (20,187 kcal kept — more than the haven can eat before it turns), so Miguel left the fresh pile for tonight\'s dinner instead of smoking it onto the rot pile.';
const WK = '🍲 Hassan cooked for the haven — meals stretched. Hassan worked the smoke racks too — 5 batches preserved (~1631 kcal, keeps for weeks).';
const PL = '🍲 Grace cooked for the haven — meals stretched.';
eq(cookOf(RF), 'Miguel', 'T1 cookOf racks-full');
eq(keptKcalOf(RF), 20187, 'T1 keptKcalOf racks-full');
eq(cookOf(WK), 'Hassan', 'T1 cookOf worked');
eq(keptKcalOf(WK), null, 'T1 keptKcalOf worked is null');
eq(cookOf(PL), 'Grace', 'T1 cookOf plain');
const { isRacksFullLine, isWorkedLine } = require('./say-capture');
ok(isRacksFullLine({ text: RF }), 'T1 isRacksFullLine true');
ok(!isRacksFullLine({ text: WK }) && !isRacksFullLine({ text: PL }), 'T1 isRacksFullLine false on worked/plain');
ok(isWorkedLine({ text: WK }), 'T1 isWorkedLine true');
ok(!isWorkedLine({ text: RF }), 'T1 isWorkedLine false on racks-full');

// ---- T1 classifier fixtures (synthetic detail arrays) ----
// Classifier: R voices in day order, per-cook last-spoken figure.
// initial: cook unseen; change: figure differs; reminder: figure equal.
// Preceding voiceless run: consecutive B days before the voice day
// with no R voice.
function classify(bDays, rDetail) {
  const rSet = new Set(rDetail.map(d => d.day));
  const preRun = new Map();
  let cur = 0;
  for (const day of bDays) {
    if (!rSet.has(day)) cur += 1;
    else { preRun.set(day, cur); cur = 0; }
  }
  const last = new Map();
  const out = [];
  for (const d of rDetail) {
    const prev = last.get(d.cook);
    let cls;
    if (prev === undefined) cls = 'initial';
    else if (prev !== d.kcal) cls = 'change';
    else cls = 'reminder';
    out.push({ day: d.day, cook: d.cook, kcal: d.kcal, cls, pre: preRun.get(d.day) });
    last.set(d.cook, d.kcal);
  }
  let maxVoice = 0, run = 0;
  for (const day of bDays) {
    if (!rSet.has(day)) { run += 1; maxVoice = Math.max(maxVoice, run); }
    else run = 0;
  }
  return { out, maxVoice };
}
// Fixture 1: 10 frozen days, same figure, one cook. R speaks day 1
// (initial) and day 8 (reminder after 6 silent days 2..7).
{
  const bDays = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
  const rDetail = [{ day: 30, cook: 'Miguel', kcal: 17000 }, { day: 37, cook: 'Miguel', kcal: 17000 }];
  const { out, maxVoice } = classify(bDays, rDetail);
  eq(out[0].cls, 'initial', 'T1 fixture1 day30 initial');
  eq(out[1].cls, 'reminder', 'T1 fixture1 day37 reminder');
  eq(out[1].pre, 6, 'T1 fixture1 reminder pre-run 6');
  eq(maxVoice, 6, 'T1 fixture1 max voiceless 6');
}
// Fixture 2: same frozen days but R speaks only day 1 -> 9 silent days:
// coverage FAILS (max voiceless 9 > 6). The classifier must detect it.
{
  const bDays = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
  const rDetail = [{ day: 30, cook: 'Miguel', kcal: 17000 }];
  const { maxVoice } = classify(bDays, rDetail);
  ok(maxVoice > N - 1, 'T1 fixture2 long silence detected (maxVoice 9)');
}
// Fixture 3: figure changes mid-run -> change voice, not reminder.
{
  const bDays = [30, 31, 32];
  const rDetail = [{ day: 30, cook: 'Miguel', kcal: 17000 }, { day: 31, cook: 'Miguel', kcal: 18000 }];
  const { out } = classify(bDays, rDetail);
  eq(out[1].cls, 'change', 'T1 fixture3 changed figure is change, not reminder');
}
// Fixture 4: new cook on a frozen figure -> initial, not reminder.
{
  const bDays = [30, 31];
  const rDetail = [{ day: 30, cook: 'Miguel', kcal: 17000 }, { day: 31, cook: 'Grace', kcal: 17000 }];
  const { out } = classify(bDays, rDetail);
  eq(out[1].cls, 'initial', 'T1 fixture4 new cook on frozen figure is initial');
}
// Fixture 5: reminder fired early (pre-run 3) must be flagged by the
// schedule check (pre !== N-1).
{
  const bDays = [30, 31, 32, 33, 34];
  const rDetail = [{ day: 30, cook: 'Miguel', kcal: 17000 }, { day: 34, cook: 'Miguel', kcal: 17000 }];
  const { out } = classify(bDays, rDetail);
  eq(out[1].cls, 'reminder', 'T1 fixture5 frozen re-voice classifies reminder');
  ok(out[1].pre !== N - 1, 'T1 fixture5 early reminder schedule flagged (pre 3)');
}
console.log(`T1 done: ${pass} PASS / ${fail} FAIL`);

// ---- T2: corpus ----
// NEUTRALITY LEG FIRST (binding order): flagged (R) vs unflagged (B)
// numerics identical on every cell. On failure, exit NOW — no
// classified number is judged.
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
let neutPass = 0, neutFail = 0;
for (const s of SEEDS) {
  const b = load('B', s), r = load('R', s);
  if (!b || !r) { neutFail += 1; console.log('NEUTRALITY FAIL: missing file seed ' + s); continue; }
  if (numerics(b) === numerics(r)) neutPass += 1;
  else { neutFail += 1; console.log('NEUTRALITY FAIL: numerics differ seed ' + s + ' B=' + numerics(b) + ' R=' + numerics(r)); }
}
console.log(`NEUTRALITY LEG: ${neutPass} PASS / ${neutFail} FAIL (flagged-vs-unflagged numerics identical)`);
if (neutFail > 0) {
  console.log('NEUTRALITY FAILED — classified numbers NOT judged. Exiting nonzero.');
  process.exit(1);
}
pass += neutPass; fail += neutFail;

// Only now: classified numbers + GO bars.
let bandB = 0, bandR = 0, bandRem = 0;
for (const s of SEEDS) {
  const b = load('B', s), r = load('R', s);
  const bDetail = b.racksFullDetail || [], rDetail = (r.racksFullDetail || []).slice().sort((x, y) => x.day - y.day);
  const bDays = Array.from(new Set(bDetail.map(d => d.day))).sort((x, y) => x - y);
  ok(bDetail.length === bDays.length, `T2 seed ${s} B at most one voice per racks-bound day`);
  ok(rDetail.every(d => bDays.includes(d.day)), `T2 seed ${s} R voices are a subset of B voice days`);
  bandB += bDetail.length; bandR += rDetail.length;
  // Voiceless runs + reminder schedule (same classifier as T1).
  const { out, maxVoice } = classify(bDays, rDetail);
  const rems = out.filter(o => o.cls === 'reminder');
  bandRem += rems.length;
  ok(maxVoice <= N - 1, `T2 seed ${s} max voiceless run <= 6 (got ${maxVoice})`);
  ok(rems.every(o => o.pre === N - 1), `T2 seed ${s} every reminder preceded by exactly 6 voiceless days`);
  ok(rDetail.length <= bDetail.length, `T2 seed ${s} R total <= B total`);
  ok(!(bDetail.length > 0 && rDetail.length === 0), `T2 seed ${s} no seed loses all voice`);
  ok(b.sayTotal === r.sayTotal, `T2 seed ${s} say totals unchanged`);
  ok((r.plainLines - b.plainLines) === (bDetail.length - rDetail.length), `T2 seed ${s} plain rises by exactly the silenced count`);
  ok(b.workedLines === b.preserveVillagerResolutions && r.workedLines === r.preserveVillagerResolutions, `T2 seed ${s} worked == resolutions`);
}
ok(bandR <= bandB, `T2 band total R <= B (${bandR} <= ${bandB})`);
console.log(`BAND B=${bandB} R=${bandR} reminders=${bandRem}`);
console.log(`TOTAL: ${pass} PASS / ${fail} FAIL (mode ${MODE})`);
process.exit(fail ? 1 : 0);
