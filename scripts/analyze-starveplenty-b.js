#!/usr/bin/env node
// scripts/analyze-starveplenty-b.js — census classifier for sim-starveplenty-b.
// Reads trace JSONs (trace-starveplenty-b.js output), applies the
// pre-registered "starvation after plenty" test (villageEats-entry pantry
// >= 5,000 kcal within 7 days before the death day) and dumps the
// mechanism evidence per starvation death: away flags, pantry at the
// villager's own meal turns, production, health, scholar draws, roster
// position. The mechanism NAME is judged by the author from this dump
// (taxonomy in sim-starveplenty-b-prereg.md); this script does not invent
// a classification — it assembles the proving events.
// Usage: node scripts/analyze-starveplenty-b.js <trace.json>...
'use strict';
const fs = require('fs');

function analyze(path) {
  const t = JSON.parse(fs.readFileSync(path, 'utf8'));
  const out = { seed: t.seed, days: t.days, endReason: t.endReason, villageLost: t.villageLost, deaths: t.deaths.length, starvationDeaths: [] };
  const starv = t.deaths.filter(d => d.cause === 'starvation' && d.kind === 'villager');
  // village-lost mode: last daily exit flags
  const lastDaily = t.daily[t.daily.length - 1];
  out.lossMode = lastDaily ? { scattered: lastDaily.exit.scattered, extinct: lastDaily.exit.extinct, hungryDays: lastDaily.exit.hungryDays } : null;
  out.starveHitDays = {};
  for (const h of t.starveHits) out.starveHitDays[h.vid] = (out.starveHitDays[h.vid] || 0) + 1;
  for (const d of starv) {
    const vid = d.who, day = d.day;
    const window = t.daily.filter(x => x.day >= day - 7 && x.day < day);
    const plentyEntry = window.length ? Math.max(...window.map(x => (x.entry && x.entry.pantry ? x.entry.pantry.total : 0))) : 0;
    const plentyEntryDay = window.length ? window.reduce((a, x) => ((x.entry && x.entry.pantry && x.entry.pantry.total > (a.entry && a.entry.pantry ? a.entry.pantry.total : -1)) ? x : a), window[0]).day : null;
    const scholarWindow = t.scholarMeals.filter(s => s.day >= day - 7 && s.day < day);
    const scholarTaken = scholarWindow.reduce((a, s) => a + ((s.pantryBefore && s.pantryAfter) ? (s.pantryBefore.total - s.pantryAfter.total) : 0), 0);
    const meals = t.meals.filter(m => m.vid === vid && m.day >= day - 7 && m.day <= day);
    const hits = t.starveHits.filter(h => h.vid === vid && h.day >= day - 7 && h.day <= day);
    const dayMeals = {};
    for (const m of t.meals) { (dayMeals[m.day] = dayMeals[m.day] || []).push(m.vid); }
    const detail = meals.map(m => ({
      day: m.day, away: m.away, produced: m.produced, ate: m.ate, drawn: m.drawn,
      fasting: m.fasting, hp: m.healthBefore + '->' + m.healthAfter,
      pantryAtTurn: m.pantryBefore, rosterPos: (dayMeals[m.day] || []).indexOf(vid),
      rosterLen: (dayMeals[m.day] || []).length,
    }));
    out.starvationDeaths.push({
      vid, day, plentyEntry, plentyEntryDay, plentyTest: plentyEntry >= 5000,
      scholarTaken7d: scholarTaken,
      scholarShortDays: scholarWindow.filter(s => { const dr = t.draws.find(x => x.day === s.day && x.ctx === 'scholarMeal'); return dr && dr.shortOfFresh; }).map(s => s.day),
      meals7d: detail,
      hits7d: hits.map(h => ({ day: h.day, dmg: h.damage, hp: h.healthBefore + '->' + h.healthAfter, died: h.died })),
    });
  }
  return out;
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: analyze-starveplenty-b.js <trace.json>...'); process.exit(2); }
for (const f of files) console.log(JSON.stringify(analyze(f), null, 2));
