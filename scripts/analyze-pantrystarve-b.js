#!/usr/bin/env node
// analyze-pantrystarve-b.js — full-pantry starvation attribution analyzer.
// (sim-pantrystarve-b, 2026-10-24, backlog #910.)
//
// PRE-REGISTERED CLASS RULES (evidence/2026-10-24/sim-pantrystarve-b.md):
//   FULL-PANTRY: death ctx pantryKcal >= 8000.
//   Window: the deceased's own meal rows, days [deathDay-7, deathDay].
//   A AWAY-RATION: awayAtDeath === true OR away-share of window meal-days >= 0.5.
//   B HAVEN-DISTRIBUTION: not A AND any haven meal-day in the window with
//     drawn < 0.25 * needEst.
//   C OTHER: neither, with a sub-reason from the record.
// classify() takes ONLY (deathRow, mealRows) — it never reads sayWin /
// teleWin. Window words about another villager or "that thing" attribute
// nothing (backlog #911). Windows are printed for the sense read only.
// Exit 0 = corpus complete + verdict computed (DIAG-NO-GO is a valid
// result, not a crash). Exit 2 = corpus incomplete / C1 freshness hit.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'pantrystarve-b-corpus');
const PILOT = [94301, 94302, 94303, 94304, 94305, 94306, 94307, 94308];
const FULL_KCAL = 8000;

function fail(msg) { console.error('ANALYZER FAIL: ' + msg); process.exit(2); }

function classify(row, meals) {
  const win = meals.filter(m => m.vid === row.who && m.day >= row.day - 7 && m.day <= row.day);
  if (!win.length) return { cls: 'C', sub: 'no-meal-rows', win: win.length, awayShare: null };
  const awayN = win.filter(m => m.away === true).length;
  const awayShare = awayN / win.length;
  if (row.ctx && row.ctx.awayAtDeath === true) return { cls: 'A', sub: 'away-at-death', win: win.length, awayShare };
  if (awayShare >= 0.5) return { cls: 'A', sub: 'away-share>=0.5', win: win.length, awayShare };
  const shortHaven = win.find(m => m.away === false && m.drawn != null && m.drawn < 0.25 * (m.needEst || 2000));
  if (shortHaven) return { cls: 'B', sub: 'short-haven-draw d' + shortHaven.day + ' drawn=' + shortHaven.drawn, win: win.length, awayShare };
  const first = win.slice().sort((a, b) => a.day - b.day)[0];
  if (first && first.healthBefore != null && first.healthBefore < 30) return { cls: 'C', sub: 'low-health-carryover', win: win.length, awayShare };
  if (awayShare > 0) return { cls: 'C', sub: 'mixed-away-no-short-haven-draw', win: win.length, awayShare };
  return { cls: 'C', sub: 'haven-adequate-meals', win: win.length, awayShare };
}

function daysSince(rows, vid, deathDay, pred) {
  let last = null;
  for (const m of rows) {
    if (m.vid !== vid || m.day > deathDay) continue;
    if (pred(m) && (last === null || m.day > last)) last = m.day;
  }
  return last === null ? null : (deathDay - last);
}

function main() {
  // C1 freshness: exact seed fields in the belongcost/pdvalue corpora must
  // never equal a pilot seed (substring matches in other fields are noise).
  const otherCorpora = ['belongcost-b-corpus', 'pdvalue-b-corpus'];
  for (const dir of otherCorpora) {
    const d = path.join(__dirname, '..', 'evidence', '2026-10-24', dir);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!f.endsWith('.json') || f.startsWith('sweep-')) continue;
      try {
        const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
        if (PILOT.includes(j.seed)) fail(`C1 hit: pilot seed ${j.seed} already in ${dir}/${f}`);
      } catch (e) { /* unreadable non-seed file: ignore */ }
    }
  }

  const perSeed = [];
  for (const s of PILOT) {
    const f = path.join(CORPUS, `pantrystarve-b-competent-s${s}.json`);
    if (!fs.existsSync(f)) fail('missing per-seed file ' + f);
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.seed !== s) fail(`seed mismatch in ${f}`);
    if (j.policy !== 'competent' || j.plentydepri !== 1 || j.depositgate !== 1) fail(`policy/env mismatch in ${f}`);
    if (!(j.daysAlive > 0)) fail(`daysAlive invalid in ${f}`);
    if (!Array.isArray(j.deathRows) || !Array.isArray(j.mealRows) || !Array.isArray(j.daySeries)) fail(`missing rows in ${f}`);
    perSeed.push(j);
  }

  const shares = {};
  const wall = [];
  const fullDeaths = [];
  const allStarv = [];
  let playerStarv = 0;
  let havenMeals = 0, havenAdequate = 0, awayMeals = 0, awayAdequate = 0;
  for (const j of perSeed) {
    for (const d of j.deathRows) shares[d.cause] = (shares[d.cause] || 0) + 1;
    for (const m of j.mealRows) {
      if (m.ate == null || m.needEst == null) continue;
      if (m.away) { awayMeals++; if (m.ate >= 0.6 * m.needEst) awayAdequate++; }
      else { havenMeals++; if (m.ate >= 0.6 * m.needEst) havenAdequate++; }
    }
    wall.push({ seed: j.seed, daysAlive: j.daysAlive, national: !!j.national, win: !!j.win,
      maxWave: Math.max(0, ...(j.waveReach || [0])), deaths: j.deathRows.length });
    for (const d of j.deathRows) {
      if (d.cause !== 'starvation') continue;
      if (d.isPlayer) { playerStarv++; continue; }
      allStarv.push({ seed: j.seed, ...d });
      const pk = (d.ctx && d.ctx.pantryKcal) || 0;
      if (pk >= FULL_KCAL) {
        const c = classify(d, j.mealRows);
        fullDeaths.push({ seed: j.seed, day: d.day, who: d.who, whoName: d.whoName,
          pantryKcal: pk, freshDays: d.ctx.freshDays, pantryFreshKcal: d.ctx.pantryFreshKcal,
          pop: d.ctx.pop, hungry: d.ctx.hungry, awayAtDeath: d.ctx.awayAtDeath,
          cls: c.cls, sub: c.sub, winMeals: c.win, awayShare: c.awayShare,
          daysSinceAdequate: daysSince(j.mealRows, d.who, d.day, m => (m.ate || 0) >= 0.6 * (m.needEst || 2000)),
          daysSinceAnyMeal: daysSince(j.mealRows, d.who, d.day, m => (m.ate || 0) > 0),
          sayWin: d.sayWin, teleWin: d.teleWin });
      }
    }
  }

  const counts = { A: 0, B: 0, C: 0 };
  for (const d of fullDeaths) counts[d.cls]++;
  const n = fullDeaths.length;
  const sh = c => (n ? (counts[c] / n).toFixed(3) : 'n/a');
  const go = n >= 8 && Math.max(counts.A, counts.B) / n >= 0.70;
  const secondAmbiguous = n >= 8 && go && Math.min(counts.A, counts.B) / n >= 0.20;

  console.log('PANTRYSTARVE-B ANALYZER REPORT');
  console.log('seeds: ' + PILOT.join(',') + ' policy: competent PD=1 DG=1 days: 150');
  console.log('WALL (seed daysAlive national win maxWave deaths):');
  for (const w of wall) console.log(`  s${w.seed} ${w.daysAlive}d national=${w.national} win=${w.win} wave=${w.maxWave} deaths=${w.deaths}`);
  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  console.log(`  median survival ${med(wall.map(w => w.daysAlive))}d max ${Math.max(...wall.map(w => w.daysAlive))}d national ${wall.filter(w => w.national).length}/8 wins ${wall.filter(w => w.win).length}/8`);
  console.log('DEATH-CAUSE SHARES (pooled): ' + Object.entries(shares).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  console.log(`STARVATION: total villager=${allStarv.length} player=${playerStarv} full-pantry(>=8000kcal)=${n}`);
  console.log(`FULL-PANTRY ATTRIBUTION: A=${counts.A} (${sh('A')}) B=${counts.B} (${sh('B')}) C=${counts.C} (${sh('C')}) denominator=${n}`);
  console.log('VERDICT: ' + (go ? 'DIAG-GO' : 'DIAG-NO-GO') + ` (need n>=8 and max share>=0.70; got n=${n} max=${n ? Math.max(counts.A, counts.B) + '/' + n : 'n/a'})` +
    (secondAmbiguous ? ' + second class >=0.20: confirm allowed' : ''));
  console.log('MEAL ADEQUACY (all meal rows, ate>=0.6*need): haven ' + havenAdequate + '/' + havenMeals +
    (havenMeals ? ' (' + (havenAdequate / havenMeals).toFixed(3) + ')' : '') +
    ' away ' + awayAdequate + '/' + awayMeals + (awayMeals ? ' (' + (awayAdequate / awayMeals).toFixed(3) + ')' : ''));
  console.log('FULL-PANTRY STARVATION DEATHS:');
  for (const d of fullDeaths) {
    console.log(`  s${d.seed} d${d.day} ${d.whoName} (${d.who}) class=${d.cls} sub=${d.sub} pantry=${d.pantryKcal}kcal fresh=${d.freshDays}d freshKcal=${d.pantryFreshKcal} pop=${d.pop} hungry=${d.hungry} awayAtDeath=${d.awayAtDeath} winMeals=${d.winMeals} awayShare=${d.awayShare == null ? 'n/a' : d.awayShare.toFixed(2)} sinceAdequate=${d.daysSinceAdequate} sinceAny=${d.daysSinceAnyMeal}`);
  }
  console.log('SENSE WINDOWS (first 2 full-pantry deaths, say+tele):');
  for (const d of fullDeaths.slice(0, 2)) {
    console.log(`  --- s${d.seed} d${d.day} ${d.whoName} class=${d.cls} ---`);
    for (const l of (d.sayWin || [])) console.log('    say: ' + l);
    for (const l of (d.teleWin || [])) console.log('    tele: ' + l);
  }
  console.log('END REPORT');
}

if (require.main === module) main();
module.exports = { classify, daysSince, FULL_KCAL, PILOT };
