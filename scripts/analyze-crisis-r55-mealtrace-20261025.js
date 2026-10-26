#!/usr/bin/env node
// analyze-crisis-r55-mealtrace-20261025.js — CRISIS LEG r55 analyzer.
// Reads one journey-crisis-r55-mealtrace JSON record per argv path and
// prints, for every person starvation death, the victim's 14-day meal
// retrospective plus the pre-registered M2 mechanism classification.
// Usage: node scripts/analyze-crisis-r55-mealtrace-20261025.js <record.json...>
// Approx need: kcalPerDay * (0.7 + 0.3 * healthBefore/100). The hearth
// stretch (10% less at haven, when it applies) is NOT folded in, so the
// shortfall test (ate < 0.6 * need) is conservative: a shortfall here is
// a shortfall under either need. Day alignment: mealRows carry the
// scholar day at villageEats entry (the day being closed); death rows
// carry the scholar day at registerDeath. The retrospective window is
// [deathDay - 14, deathDay] inclusive, which covers the closing days
// before the death tick.
'use strict';
const fs = require('fs');

function approxNeed(row) {
  const k = row.kcalPerDay || 2000;
  const hf = (row.healthBefore !== undefined && row.healthBefore !== null ? row.healthBefore : 100) / 100;
  return k * (0.7 + 0.3 * hf);
}

function classify(retro, mealDays) {
  const short = retro.filter(r => r.ate !== null && r.ate < 0.6 * approxNeed(r));
  if (!short.length) return { cls: 'e-UNEXPLAINED', detail: 'no shortfall day in trace window', shortfallDays: 0 };
  const dawnByDay = new Map(mealDays.map(m => [m.day, m]));
  const frac = (pred) => short.filter(pred).length / short.length;
  const dawnEmpty = frac(r => {
    const m = dawnByDay.get(r.day);
    if (!m) return false;
    return m.dawnPantry < (m.roster || 12) * 500;
  });
  const awayFrac = frac(r => r.away);
  const fastingFrac = frac(r => r.fasting);
  const drawShort = frac(r => !r.away && !r.fasting && r.drawn !== null && r.drawn < 0.6 * approxNeed(r) && (() => {
    const m = dawnByDay.get(r.day);
    return m && m.dawnPantry >= (m.roster || 12) * 500;
  })());
  if (dawnEmpty >= 0.8) return { cls: 'a-dawn-empty', detail: `dawn-empty on ${(dawnEmpty * 100).toFixed(0)}% of ${short.length} shortfall days`, shortfallDays: short.length };
  if (awayFrac >= 0.8) return { cls: 'b-away-pack', detail: `away on ${(awayFrac * 100).toFixed(0)}% of ${short.length} shortfall days`, shortfallDays: short.length };
  if (drawShort >= 0.8) return { cls: 'c-draw-shortfall', detail: `adequate dawn pantry but drawn < 0.6*need on ${(drawShort * 100).toFixed(0)}% of ${short.length} shortfall days`, shortfallDays: short.length };
  if (fastingFrac >= 0.8) return { cls: 'd-fasting', detail: `fasting on ${(fastingFrac * 100).toFixed(0)}% of ${short.length} shortfall days`, shortfallDays: short.length };
  return { cls: 'e-UNEXPLAINED', detail: `mixed: dawnEmpty=${(dawnEmpty * 100).toFixed(0)}% away=${(awayFrac * 100).toFixed(0)}% drawShort=${(drawShort * 100).toFixed(0)}% fasting=${(fastingFrac * 100).toFixed(0)}% over ${short.length} shortfall days`, shortfallDays: short.length };
}

function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('usage: analyze-crisis-r55-mealtrace-20261025.js <record.json...>'); process.exit(1); }
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(f, 'utf8'));
    console.log(`\n=== seed ${rec.seed} ===`);
    console.log(`ended: ${rec.notes} | famineDays=${rec.famineDays.length} revisedWindows=${rec.revisedWindowCount} maxConsec=${rec.maxConsecutiveFamineDays} mealRows=${(rec.mealRows || []).length} mealDays=${(rec.mealDays || []).length}`);
    const starv = (rec.deaths || []).filter(d => d.person && d.starvation);
    console.log(`starvation deaths: ${starv.length}`);
    const dawnByDay = new Map((rec.mealDays || []).map(m => [m.day, m]));
    for (const d of starv) {
      console.log(`\n-- ${d.name} (${d.vid}) d${d.day} pantry=${d.pantryAtDeath} pc=${d.pcAtDeath} pop=${d.popAtDeath} away=${d.awayAtDeath}`);
      const retro = (rec.mealRows || []).filter(r => r.vid === d.vid && r.day >= d.day - 14 && r.day <= d.day)
        .sort((a, b) => a.day - b.day);
      console.log(`   trace rows in window: ${retro.length}`);
      for (const r of retro) {
        const need = approxNeed(r);
        const ratio = r.ate !== null ? (r.ate / need).toFixed(2) : '?';
        const dawn = dawnByDay.get(r.day);
        console.log(`   d${r.day} dawnPantry=${dawn ? dawn.dawnPantry : '?'} away=${r.away} sick=${r.sick ? `sev${r.sick.sev}/${r.sick.daysLeft}d` : '-'} hp ${r.healthBefore}->${r.healthAfter} hunger ${r.hungerBefore}->${r.hungerAfter} ate=${r.ate !== null ? Math.round(r.ate) : '?'} need~${Math.round(need)} ratio=${ratio} drawn=${r.drawn !== null ? Math.round(r.drawn) : '?'} fasting=${r.fasting}`);
      }
      const c = classify(retro, rec.mealDays || []);
      console.log(`   CLASS: ${c.cls} — ${c.detail}`);
      // Mourning check (M3): any mourning line within 7 days after death.
      const mourned = (rec.mourningLines || []).some(m => m.day >= d.day && m.day <= d.day + 7);
      const hungerVoiced = (rec.hungerLines || []).some(m => m.day >= d.day - 14 && m.day <= d.day + 7);
      console.log(`   M3 mourned-within-7d: ${mourned} | hunger-voiced in window: ${hungerVoiced}`);
    }
    // Panel-level: shortfall-day counts across all villagers (context).
    const rows = rec.mealRows || [];
    const shortRows = rows.filter(r => r.ate !== null && r.ate < 0.6 * approxNeed(r));
    const vids = new Set(shortRows.map(r => r.vid));
    console.log(`\npanel: shortfall rows ${shortRows.length}/${rows.length} across ${vids.size} villagers`);
    // Roster departures without a same-call death: exile / flight / joining.
    const deps = (rec.mealDays || []).filter(m => (m.departed || []).length);
    if (deps.length) {
      console.log('roster departures (villageEats calls with roster shrinkage):');
      for (const m of deps) {
        for (const vid of m.departed) {
          const laterDeath = (rec.deaths || []).find(d => d.vid === vid);
          const lastRow = [...rows].reverse().find(r => r.vid === vid);
          console.log(`  d${m.day} departed ${vid} lastMealRow d${lastRow ? lastRow.day : '?'} (${lastRow ? lastRow.name : '?'}) laterDeath=${laterDeath ? `d${laterDeath.day} ${laterDeath.cause}` : 'none'}`);
        }
      }
    } else console.log('roster departures: none recorded');
  }
}

main();
