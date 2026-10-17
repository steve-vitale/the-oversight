#!/usr/bin/env node
// scripts/analyze-feastvoice-b.js — analysis for census-feastvoice-b.js.
// Reads evidence/2026-10-17/feastvoice-b-beats/ + -perseed/, prints:
//  (1) repetition census on EAT class (primary b: >3 verbatim in any 10d
//      window per villager = violation), cross-speaker verbatim table;
//  (2) fictiongate ledger ("I know why" vs "I don't know why");
//  (3) sense-read candidate day-slices (richest beat days) with context;
//  (4) wall summary.
'use strict';
const fs = require('fs');
const path = require('path');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'feastvoice-b-beats');
const PERSEED = path.join(__dirname, '..', 'evidence', '2026-10-17', 'feastvoice-b-perseed');
const files = fs.readdirSync(BEATS).filter(f => f.endsWith('.json'));

const template = (text, nm) => {
  // strip speaker: exact nm prefix after leading emoji/whitespace
  const esc = nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp('^\\s*(?:[\\p{So}\\p{Sc}\\p{Sk}]+\\s*)?' + esc + '\\b', 'u'), '⟨S⟩').trim();
};

let eatTotal = 0, eatByRun = {}, violations = [], crossRep = {};
let fictionHonest = 0, fictionDishonest = 0;
let halfRationRegimeDays = 0, mealDays = 0;
const daySlices = []; // {run, day, beats, n}
const wall = { runs: 0, wins: 0, nat: 0, table: 0, w4: 0, w5: 0, maxWave: 0, arc2: 0, arc3: 0, arc4: 0, fourRealm: 0, exiled: 0, surv: [], maxArc: 0, deaths: {} };

for (const f of files) {
  const run = f.replace(/\.json$/, '');
  const j = JSON.parse(fs.readFileSync(path.join(BEATS, f), 'utf8'));
  const ps = JSON.parse(fs.readFileSync(path.join(PERSEED, f), 'utf8'));
  wall.runs++;
  wall.wins += ps.wins; wall.nat += ps.national; wall.table += ps.table;
  wall.w4 += ps.wave4; wall.w5 += ps.wave5; wall.maxWave = Math.max(wall.maxWave, ps.maxWave);
  wall.arc2 += ps.arc2; wall.arc3 += ps.arc3; wall.arc4 += ps.arc4;
  wall.fourRealm += ps.fourRealm; wall.exiled += ps.exiled;
  wall.surv.push(ps.gameDays); wall.maxArc = Math.max(wall.maxArc, ps.maxArc);
  fictionHonest += ps.iDontKnowWhy; fictionDishonest += ps.iKnowWhy;
  for (const [k, v] of Object.entries(ps.causeCounts)) wall.deaths[k] = (wall.deaths[k] || 0) + v;

  // EAT class: ambient key='eat'
  const eats = j.ambient.filter(a => a.key === 'eat');
  eatTotal += eats.length;
  eatByRun[run] = eats.length;
  // per (vid, template): sliding 10-day window max count
  const perVidTpl = {};
  for (const a of eats) {
    const tpl = template(a.text, a.nm);
    const k = a.vid + '␟' + tpl;
    (perVidTpl[k] = perVidTpl[k] || []).push(a.day);
    const ck = run + '␟' + tpl;
    crossRep[ck] = crossRep[ck] || { tpl, vids: new Set(), count: 0 };
    crossRep[ck].vids.add(a.vid); crossRep[ck].count++;
  }
  for (const [k, days] of Object.entries(perVidTpl)) {
    days.sort((a, b) => a - b);
    let mx = 0;
    for (let i = 0; i < days.length; i++) {
      let c = 0;
      for (let q = i; q < days.length && days[q] - days[i] < 10; q++) c++;
      if (c > mx) mx = c;
    }
    if (mx > 3) {
      const [vid, tpl] = k.split('␟');
      violations.push({ run, vid, tpl, maxWindow: mx, total: days.length });
    }
  }

  // half-ration regime days
  const mealDaysN = Object.keys(j.meals).length;
  mealDays += mealDaysN;
  for (const m of Object.values(j.meals)) if (m.halfRation) halfRationRegimeDays++;

  // day-slices: count beats/day (ambient+say+feast+meals-hr) for candidate reads
  const byDay = {};
  const add = (day, cls, text, vid) => {
    const d = num(day); if (d == null) return;
    (byDay[d] = byDay[d] || []).push({ cls, text, vid });
  };
  const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
  for (const a of j.ambient) add(a.day, 'AMB(' + a.key + ')', a.text, a.vid);
  for (const s of j.saybeats) add(s.day, 'SAY', s.text);
  for (const e of j.feasts) add(e.day, 'FEAST', e.text);
  for (const [d, m] of Object.entries(j.meals)) if (m.halfRation) add(d, 'MEAL-HR', '(half-ration regime this day)');
  for (const dd of ps.deaths) if (/starv|hungr|ration/i.test(dd.cause || '')) add(dd.day, 'DEATH', dd.cause + ' — ' + dd.who);
  for (const [d, list] of Object.entries(byDay)) {
    const foodish = list.filter(b => /feast|ration|hungr|starv|eat|cook|spoil|meal|gave|give|share|food|dinner|bowl|pantry|kal|kcal|parcel|hollow|mutter/i.test(b.text) || b.cls.startsWith('AMB(eat'));
    if (foodish.length >= 6) daySlices.push({ run, day: +d, n: foodish.length, beats: foodish.slice(0, 24) });
  }
}

daySlices.sort((a, b) => b.n - a.n);
wall.surv.sort((a, b) => a - b);
const median = wall.surv[Math.floor(wall.surv.length / 2)];

console.log('=== REPETITION CENSUS (EAT class, primary b: >3 verbatim per villager per 10d) ===');
console.log(`eat beats total: ${eatTotal}, runs: ${Object.keys(eatByRun).length}`);
console.log(`VIOLATIONS: ${violations.length}`);
for (const v of violations.slice(0, 20)) console.log(`  ${v.run} ${v.vid} maxWindow=${v.maxWindow} total=${v.total} :: ${v.tpl}`);

console.log('\n=== CROSS-SPEAKER VERBATIM (same template, multiple speakers, one run) ===');
const cr = Object.entries(crossRep).map(([k, v]) => ({ run: k.split('␟')[0], tpl: v.tpl, vids: v.vids.size, count: v.count }))
  .filter(r => r.vids >= 3).sort((a, b) => b.vids - a.vids);
console.log(`templates voiced by >=3 distinct speakers: ${cr.length}`);
for (const r of cr.slice(0, 25)) console.log(`  ${r.run} vids=${r.vids} count=${r.count} :: ${r.tpl}`);

console.log('\n=== FICTIONGATE ===');
console.log(`honest meal-line ("I don't know why"): ${fictionHonest}`);
console.log(`dishonest assert ("I know why"): ${fictionDishonest}`);
console.log('\n=== HALF-RATION REGIME ===');
console.log(`half-ration regime days: ${halfRationRegimeDays} / meal days ${mealDays} = ${(halfRationRegimeDays / Math.max(1, mealDays) * 100).toFixed(1)}%`);

console.log('\n=== WALL SUMMARY ===');
console.log(JSON.stringify({ runs: wall.runs, wins: wall.wins, national: wall.nat, table: wall.table, wave4: wall.w4, wave5: wall.w5, maxWaveSeen: wall.maxWave, arc2: wall.arc2, arc3: wall.arc3, arc4: wall.arc4, maxArcSeen: wall.maxArc, fourRealm: wall.fourRealm, exiled: wall.exiled, medianSurv: median, maxSurv: Math.max(...wall.surv), deaths: wall.deaths }, null, 1));

console.log('\n=== SENSE-READ CANDIDATES (richest food days) ===');
for (const s of daySlices.slice(0, 12)) console.log(`  ${s.run} day ${s.day}: ${s.n} food beats`);

// dump top 6 slices to a file for hand-reading
const out = daySlices.slice(0, 6).map(s => {
  const lines = s.beats.map(b => `  [${b.cls}]${b.vid ? ' <' + b.vid + '>' : ''} ${b.text}`).join('\n');
  return `### ${s.run} — day ${s.day} (${s.n} food beats)\n${lines}`;
}).join('\n\n');
fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-17', 'feastvoice-b-senseread-candidates.md'), out);
console.log('\nwrote evidence/2026-10-17/feastvoice-b-senseread-candidates.md');
