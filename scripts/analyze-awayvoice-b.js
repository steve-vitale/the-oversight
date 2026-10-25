#!/usr/bin/env node
// analyze-awayvoice-b.js — before/after analyzer for sim-awayvoice-b.
// Reads baseline + armed per-seed JSONs from evidence/2026-10-25/
// sim-awayvoice-b-corpus/ and prints the pilot table. Writes NO files:
// the evidence file carries the table (the sweep corpora are the record).
//
// Definitions (pre-registered in evidence/2026-10-25/sim-awayvoice-b.md):
// - qualifying day: a BASELINE packCall with healthBefore <= 7, deduped
//   by (vid,day) (first call wins; duplicate calls counted separately).
// - fired: the ARMED packCall on the same (vid,day) carries >= 1 beatLine.
// - name-borrowing: a fired beat line that fails to contain the call
//   traveler's firstName, OR that contains any OTHER firstName from
//   that seed's packCall set as a standalone word.
// - numbers-identical: per-(vid,day) meal rows (ate, drawn,
//   hungerBefore/After, healthBefore/After) and death rows (day, who,
//   cause) must match baseline vs armed EXACTLY. Any diff fails the
//   narration-only constraint and is printed, never averaged away.
// - uncovered: BASELINE meal rows with away=true and healthBefore <= 7
//   that have NO packCall on that (vid,day) (dayWant <= 50 days — the
//   beat's trigger cannot see them; reported, never folded into the rate).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'sim-awayvoice-b-corpus');
const PILOT = [94801, 94407, 94408, 94411, 94416, 94425, 94629, 94616];
// Confirm runs pass AWAYVOICE_SEEDS=94901,...,94916; the pilot default
// above is used otherwise. The seed list is the ONLY input that varies:
// the qualifying definition, threshold, and verdict bars are identical.
const SEEDS = (process.env.AWAYVOICE_SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const ACTIVE_SEEDS = SEEDS.length ? SEEDS : PILOT;
const THRESH = 7;

function load(cell, seed, dir) {
  const prefix = process.env.AWAYVOICE_PREFIX || 'awayvoice-b';
  const f = path.join(dir, `${prefix}-${cell}-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function key(vid, day) { return String(vid) + '|' + day; }
function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function analyzeSeed(seed, dir) {
  dir = dir || DIR;
  const base = load('baseline', seed, dir);
  const armed = load('armed', seed, dir);
  if (!base || !armed) return { seed, missing: true, missingCell: !base ? 'baseline' : 'armed' };
  // dedupe baseline packCalls by (vid,day), first wins
  const bCalls = new Map(); let bDup = 0;
  for (const c of (base.packCalls || [])) {
    const k = key(c.vid, c.day);
    if (bCalls.has(k)) bDup++; else bCalls.set(k, c);
  }
  const aCalls = new Map();
  for (const c of (armed.packCalls || [])) {
    const k = key(c.vid, c.day);
    if (!aCalls.has(k)) aCalls.set(k, c);
  }
  // pack-call identity: (vid,day,want,take) multisets
  const packIdDiffs = [];
  for (const [k, c] of bCalls) {
    const a = aCalls.get(k);
    if (!a) packIdDiffs.push(k + ' missing-armed');
    else if (a.want !== c.want || a.take !== c.take) packIdDiffs.push(k + ` want/take ${c.want}/${c.take} -> ${a.want}/${a.take}`);
  }
  for (const k of aCalls.keys()) if (!bCalls.has(k)) packIdDiffs.push(k + ' extra-armed');
  // qualifying days + fire rate
  const qual = [...bCalls.values()].filter(c => c.healthBefore != null && c.healthBefore <= THRESH);
  let fired = 0; const firedRows = []; const missed = [];
  const borrowFails = [];
  const rosterNames = new Set();
  for (const c of (base.packCalls || [])) if (c.firstName) rosterNames.add(c.firstName);
  for (const q of qual) {
    const k = key(q.vid, q.day);
    const a = aCalls.get(k);
    const lines = (a && a.beatLines) || [];
    if (lines.length) {
      fired++;
      firedRows.push({ vid: q.vid, day: q.day, firstName: q.firstName, healthBefore: q.healthBefore, want: q.want, take: q.take, lines });
      for (const line of lines) {
        const body = line.replace(/^d\d+ /, '');
        if (!q.firstName || !body.includes(q.firstName)) {
          borrowFails.push({ vid: q.vid, day: q.day, why: 'line lacks traveler firstName', line });
        }
        for (const other of rosterNames) {
          if (other === q.firstName) continue;
          if (new RegExp('\\b' + escRe(other) + '\\b').test(body)) {
            borrowFails.push({ vid: q.vid, day: q.day, why: 'line names other roster person ' + other, line });
          }
        }
      }
    } else missed.push({ vid: q.vid, day: q.day, firstName: q.firstName, healthBefore: q.healthBefore, want: q.want, take: q.take });
  }
  // meal-row identity
  const bMeals = new Map((base.mealRows || []).map(r => [key(r.vid, r.day), r]));
  const aMeals = new Map((armed.mealRows || []).map(r => [key(r.vid, r.day), r]));
  const mealDiffs = [];
  for (const [k, r] of bMeals) {
    const a = aMeals.get(k);
    if (!a) { mealDiffs.push(k + ' missing-armed'); continue; }
    for (const f of ['ate', 'drawn', 'hungerBefore', 'hungerAfter', 'healthBefore', 'healthAfter']) {
      if (r[f] !== a[f]) mealDiffs.push(k + ` ${f} ${r[f]} -> ${a[f]}`);
    }
  }
  for (const k of aMeals.keys()) if (!bMeals.has(k)) mealDiffs.push(k + ' extra-armed');
  // death-row identity
  const bDeaths = (base.deathRows || []).map(d => `${d.day}|${d.who}|${d.cause}`).sort();
  const aDeaths = (armed.deathRows || []).map(d => `${d.day}|${d.who}|${d.cause}`).sort();
  const deathDiffs = [];
  if (JSON.stringify(bDeaths) !== JSON.stringify(aDeaths)) {
    const bs = new Set(bDeaths), as = new Set(aDeaths);
    for (const d of bDeaths) if (!as.has(d)) deathDiffs.push('baseline-only ' + d);
    for (const d of aDeaths) if (!bs.has(d)) deathDiffs.push('armed-only ' + d);
  }
  // uncovered low-health away meal days (no packCall)
  const uncovered = [];
  for (const r of (base.mealRows || [])) {
    if (r.away === true && r.healthBefore != null && r.healthBefore <= THRESH && !bCalls.has(key(r.vid, r.day))) {
      uncovered.push({ vid: r.vid, day: r.day, healthBefore: r.healthBefore, ate: r.ate, drawn: r.drawn });
    }
  }
  // away deaths in baseline + whether a beat fired on the death day
  const awayDeaths = (base.deathRows || []).filter(d => d.ctx && d.ctx.awayAtDeath === true).map(d => {
    const k = key(d.who, d.day);
    const a = aCalls.get(k);
    return { who: d.who, whoName: d.whoName, day: d.day, cause: d.cause,
      beatFiredDeathDay: !!((a && a.beatLines || []).length),
      deathDayLines: (a && a.beatLines) || [] };
  });
  return { seed, missing: false, baseDays: base.daysAlive, armedDays: armed.daysAlive,
    packCallsBase: base.packCalls.length, packCallsArmed: armed.packCalls.length,
    packDupBase: bDup, packIdDiffs, qualCount: qual.length, fired, missed,
    firedRows, borrowFails, mealDiffs, deathDiffs, uncovered, awayDeaths,
    baseDeaths: base.deathRows.length, armedDeaths: armed.deathRows.length,
    baseSayLines: base.sayLog.length, armedSayLines: armed.sayLog.length };
}

function main() {
  const rows = ACTIVE_SEEDS.map(s => analyzeSeed(s));
  let totQual = 0, totFired = 0, totBorrow = 0, totMealDiff = 0, totDeathDiff = 0, totPackDiff = 0, totUncovered = 0;
  console.log('seed | daysB/A | qual | fired | rate | borrowFails | mealDiffs | deathDiffs | packIdDiffs | uncovered');
  for (const r of rows) {
    if (r.missing) { console.log(`${r.seed} MISSING ${r.missingCell}`); continue; }
    totQual += r.qualCount; totFired += r.fired; totBorrow += r.borrowFails.length;
    totMealDiff += r.mealDiffs.length; totDeathDiff += r.deathDiffs.length;
    totPackDiff += r.packIdDiffs.length; totUncovered += r.uncovered.length;
    const rate = r.qualCount ? (r.fired / r.qualCount).toFixed(3) : 'n/a';
    console.log(`${r.seed} | ${r.baseDays}/${r.armedDays} | ${r.qualCount} | ${r.fired} | ${rate} | ${r.borrowFails.length} | ${r.mealDiffs.length} | ${r.deathDiffs.length} | ${r.packIdDiffs.length} | ${r.uncovered.length}`);
  }
  const totRate = totQual ? (totFired / totQual).toFixed(3) : 'n/a';
  console.log(`TOTAL | qual=${totQual} fired=${totFired} rate=${totRate} borrowFails=${totBorrow} mealDiffs=${totMealDiff} deathDiffs=${totDeathDiff} packIdDiffs=${totPackDiff} uncovered=${totUncovered}`);
  const go = totQual > 0 && totFired / totQual >= 0.80 && totBorrow === 0 && totMealDiff === 0 && totDeathDiff === 0;
  console.log('VERDICT-RENDERED: ' + (go ? 'PILOT-GO' : 'PILOT-NO-GO') + ` (rate bar >=0.80, borrow==0, mealDiffs==0, deathDiffs==0)`);
  // detail dumps for the evidence file
  for (const r of rows) {
    if (r.missing) continue;
    if (r.missed.length) console.log(`MISSED s${r.seed}: ` + JSON.stringify(r.missed));
    if (r.borrowFails.length) console.log(`BORROW s${r.seed}: ` + JSON.stringify(r.borrowFails));
    if (r.mealDiffs.length) console.log(`MEALDIFF s${r.seed}: ` + JSON.stringify(r.mealDiffs.slice(0, 20)));
    if (r.deathDiffs.length) console.log(`DEATHDIFF s${r.seed}: ` + JSON.stringify(r.deathDiffs));
    if (r.packIdDiffs.length) console.log(`PACKDIFF s${r.seed}: ` + JSON.stringify(r.packIdDiffs.slice(0, 20)));
    if (r.uncovered.length) console.log(`UNCOVERED s${r.seed}: ` + JSON.stringify(r.uncovered));
    if (r.awayDeaths.length) console.log(`AWAYDEATHS s${r.seed}: ` + JSON.stringify(r.awayDeaths));
  }
  return { rows, totQual, totFired, totRate, go };
}

if (require.main === module) main();
module.exports = { analyzeSeed, PILOT, ACTIVE_SEEDS, THRESH, main };
