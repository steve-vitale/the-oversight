#!/usr/bin/env node
// scripts/analyze-trustcensus-20261015.js — aggregate the trustcensus sweep
// into the census table: per-seed crossing day, composition, half-ration
// days, recovery; attribution rate; the guard-window verdict inputs.
// Reads evidence/2026-10-15/trustcensus-sweep.json (written by the sweep).
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15');
const sweep = JSON.parse(fs.readFileSync(path.join(EVID, 'trustcensus-sweep.json'), 'utf8'));

const runs = sweep.runs;
const med = (a) => {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

console.log('=== trust-ledger trajectory census ===');
console.log('runs: ' + runs.length + '  seeds: ' + sweep.seeds.join(',') + '  policies: ' + sweep.policies.join(','));
console.log('');
console.log('seed   policy      days  CUMx  TR7x  JUSx  trust@x  volTake  mealTake  gives  mealShr  takeDays  maxDay  HRaft  recov  giveAft  hungB/A  attrib');
let nCum = 0, nTr7 = 0, nJus = 0, nAttrib = 0, nCross = 0;
const cumDays = [], tr7Days = [];
let nRecov = 0, nCumWithAfter = 0;
for (const r of runs) {
  const c = r.census.crossings;
  const cx = c.cum.crossed ? c.cum : null;
  const tx = c.tr7.crossed ? c.tr7 : null;
  const jx = c.justice.crossed ? c.justice : null;
  if (cx) { nCum++; cumDays.push(cx.day); nCross++; if (cx.attributed) nAttrib++; }
  if (tx) { nTr7++; tr7Days.push(tx.day); nCross++; if (tx.attributed) nAttrib++; }
  if (jx) { nJus++; nCross++; if (jx.attributed) nAttrib++; }
  const p = r.census.post;
  let recov = '-', hrAft = '-', giveAft = '-', hung = '-';
  if (p) {
    nCumWithAfter++;
    recov = p.trustRecovered ? 'Y' : 'n';
    if (p.trustRecovered) nRecov++;
    hrAft = String(p.halfRationDaysAfter);
    giveAft = String(Math.round(p.giveKcalAfter));
    hung = p.hungerDaysBefore + '/' + p.hungerDaysAfter;
  }
  const f = (v) => (v === null || v === undefined) ? '-' : String(v);
  console.log(
    `s${r.seed}  ${r.policyId.padEnd(10)} ${String(r.days).padStart(4)}  ` +
    `${f(cx && cx.day).padStart(4)}  ${f(tx && tx.day).padStart(4)}  ${f(jx && jx.day).padStart(4)}  ` +
    `${f(cx && Math.round(cx.trust)).padStart(6)}  ${f(cx && Math.round(cx.volTakes)).padStart(7)}  ` +
    `${f(cx && Math.round(cx.mealTakes)).padStart(8)}  ${f(cx && Math.round(cx.cumGives)).padStart(5)}  ` +
    `${f(cx && cx.mealShare).padStart(7)}  ${f(cx && cx.nTakeDays).padStart(8)}  ` +
    `${f(cx && Math.round(cx.maxDayTake)).padStart(6)}  ${hrAft.padStart(5)}  ${recov.padStart(5)}  ` +
    `${giveAft.padStart(7)}  ${hung.padStart(7)}  ${cx ? (cx.attributed ? 'Y' : 'N!') : '-'}`
  );
}
console.log('');
console.log(`CUM crossings (trust-drop bar): ${nCum}/${runs.length}  median day: ${med(cumDays)}`);
console.log(`TR7 crossings (trailing-7d window): ${nTr7}/${runs.length}  median day: ${med(tr7Days)}`);
console.log(`JUSTICE crossings (heat+25 tier): ${nJus}/${runs.length}`);
console.log(`ATTRIBUTION RATE: ${nAttrib}/${nCross} = ${(100 * nAttrib / Math.max(1, nCross)).toFixed(1)}% (PRIMARY bar: >=90%)`);
console.log(`RECOVERY: trust recovered above crossing level in ${nRecov}/${nCumWithAfter} crossed runs`);
// meal-share distribution at CUM crossings
const shares = runs.map(r => r.census.crossings.cum).filter(x => x.crossed).map(x => x.mealShare);
if (shares.length) console.log(`mealShare at CUM crossings: min=${Math.min(...shares).toFixed(2)} med=${med(shares).toFixed(2)} max=${Math.max(...shares).toFixed(2)}`);
else console.log('mealShare at CUM crossings: (none)');
const takeDays = runs.map(r => r.census.crossings.cum).filter(x => x.crossed).map(x => x.nTakeDays);
if (takeDays.length) console.log(`take-days in trailing window at CUM crossings: min=${Math.min(...takeDays)} med=${med(takeDays)} max=${Math.max(...takeDays)}`);
else console.log('take-days in trailing window at CUM crossings: (none)');
// wall numbers
const nat = runs.filter(r => r.national).length;
const won = runs.filter(r => r.won).length;
const tab = runs.filter(r => r.tableWaiting).length;
const w4 = runs.filter(r => r.maxWave >= 4).length;
const w5 = runs.filter(r => r.maxWave >= 5).length;
const surv = runs.map(r => r.days);
console.log(`WALL: national ${nat}/${runs.length} table ${tab}/${runs.length} won ${won}/${runs.length} wave4 ${w4}/${runs.length} wave5 ${w5}/${runs.length} medianSurv ${med(surv)}d maxSurv ${Math.max(...surv)}d`);
const errs = runs.reduce((t, r) => t + r.census.instrErrors, 0);
const incomplete = runs.filter(r => !r.census.rowsComplete).length;
console.log(`INSTRUMENT: errors=${errs} incomplete-rows runs=${incomplete}/${runs.length}`);
// death causes
const dc = {};
for (const r of runs) for (const [k, v] of Object.entries(r.deaths || {})) dc[k] = (dc[k] || 0) + v;
console.log('death causes: ' + Object.entries(dc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}=${v}`).join(' '));
