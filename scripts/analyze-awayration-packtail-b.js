#!/usr/bin/env node
// analyze-awayration-packtail-b.js — TAIL PACK re-try analyzer (baseline vs armed, same seeds).
// (sim-packtail-b, 2026-10-25, oversight-flesh-out-loop-b; backlog 2026-10-25 tail-metric revision.)
//
// PRE-REGISTERED RULES (evidence/2026-10-25/sim-packtail-b.md):
//   Away villager-day = deduped meal row with away === true.
//   Pack-draw day = away meal row with drawn > 0.
//   Pool-binding day = pack-draw day with a joined pack row AND a joined
//     packMeal row where dawn pack < dayWant (packRow.packKcal <
//     packMealRow.want). Dawn pack from the packKcal reseed wrapper;
//     dayWant from the packMeal wrapper's want argument. Self-fed days
//     (drawn === 0) are NOT binding days (no packMeal call fired).
//   Binding-day coverage = drawn / dayWant on that day (drawn from the
//     meal row, dayWant from the packMeal row). take <= want by
//     construction; a coverage > 1.0 fails the run as instrument error.
//   Meal adequacy = ate >= 0.6 * needEst.
//   Pack-draw-day capture = draw days with a joined pack row / all draw days.
//   Full-pantry away starvation death = villager (non-player) starvation
//     death with ctx.pantryKcal >= 8000 AND ctx.freshDays >= 3.0 AND
//     ctx.awayAtDeath === true.
//   PRIMARY: median binding-day coverage, armed arm.
//   GO iff: armed median binding coverage >= 0.90 AND armed binding n >= 30
//     AND 8/8 seeds complete in both arms AND 0 misaligned pack rows AND
//     0 duplicate pack rows AND capture == 1.000 in both arms AND median
//     survival armed >= 0.8x baseline AND full-pantry away starvation
//     deaths armed <= baseline + 2 AND no armed-only death cause with
//     >= 3 deaths (1-2 deaths of an armed-only cause are inconclusive,
//     reported, not a GO block — small-sample denominator rule fixed
//     pre-sims). A miss is NO-GO, never re-scored.
//   Quartiles: nearest-rank (Q1 = ceil(0.25*n)-th, Q3 = ceil(0.75*n)-th);
//     median = middle value (mean of two middles when n even).
//   Cross-arm claims are DISTRIBUTIONAL only (identical starting seeds,
//   divergent pantry state after the first binding day — no paired
//   per-(vid,day) joins across arms are claimed).
// Usage: node scripts/analyze-awayration-packtail-b.js <baselineCorpus> <armedCorpus>
// Exit 0 = verdict computed (NO-GO is a valid result, not a crash).
// Exit 2 = corpus incomplete / banned-band hit / pack misalignment / coverage > 1.0.
'use strict';
const fs = require('fs');
const path = require('path');

const BASE_DIR = process.argv[2];
const ARMED_DIR = process.argv[3];
// NOTE: no argv exit here — the proof test requires this module for its
// helpers, and an argv check at require time would kill the test process.
// main() validates argv when run as a script.
const BAND = [94901, 94902, 94903, 94904, 94905, 94906, 94907, 94908];
const BANNED = [94801, 94802, 94803, 94804, 94805, 94806, 94807, 94808,
  94701, 94702, 94703, 94704, 94705, 94706, 94707, 94708, 94709, 94710, 94711, 94712, 94713, 94714, 94715, 94716, 94717, 94718, 94719, 94720, 94721, 94722, 94723, 94724, 94725, 94726, 94727, 94728, 94729, 94730, 94731, 94732,
  94501, 94502, 94503, 94504, 94505, 94506, 94507, 94508, 94509, 94510, 94511, 94512, 94513, 94514, 94515, 94516];
for (const s of BAND) if (BANNED.includes(s)) { console.error('ANALYZER FAIL: pilot band intersects a banned band'); process.exit(2); }

function fail(msg) { console.error('ANALYZER FAIL: ' + msg); process.exit(2); }
function isAdequate(m) { return (m.ate || 0) >= 0.6 * (m.needEst || 2000); }
function statsOf(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  const n = s.length;
  if (!n) return { n: 0, median: null, mean: null, q1: null, q3: null, shareEq1: null, min: null, max: null };
  const rank = (q) => s[Math.max(0, Math.ceil(q * n) - 1)];
  const median = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  return { n, median, mean: s.reduce((a, b) => a + b, 0) / n, q1: rank(0.25), q3: rank(0.75),
    shareEq1: s.filter(v => v >= 0.999).length / n, min: s[0], max: s[n - 1] };
}
function med(xs) { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; }
function validatePackRows(packRows) {
  let misaligned = 0; const seen = new Set(); let duplicates = 0;
  for (const p of (packRows || [])) {
    if (p.packDay !== p.day) misaligned++;
    const k = p.vid + '|' + p.day;
    if (seen.has(k)) duplicates++; else seen.add(k);
  }
  return { misaligned, duplicates };
}
function classify(row, meals) {
  const win = meals.filter(m => m.vid === row.who && m.day >= row.day - 7 && m.day <= row.day);
  if (!win.length) return { cls: 'C', sub: 'no-meal-rows' };
  if (row.ctx && row.ctx.awayAtDeath === true) return { cls: 'A', sub: 'away-at-death' };
  return { cls: 'C', sub: 'not-away-at-death' };
}
function pickQuote(row) {
  const lines = [];
  for (const l of (row.sayWin || [])) lines.push({ src: 'say', text: String(l) });
  for (const l of (row.teleWin || [])) lines.push({ src: 'tele', text: String(l) });
  if (!lines.length) return { quote: '', src: 'none' };
  const name = (row.whoName || '').split(' ')[0];
  let best = lines[0], bestScore = -1;
  for (const l of lines) {
    let s = 0;
    if (name && l.text.includes(name)) s += 3;
    if (/STARVING|spiral/i.test(l.text)) s += 2;
    if (/Village meal/i.test(l.text)) s += 1;
    if (s > bestScore) { bestScore = s; best = l; }
  }
  return { quote: best.text, src: best.src };
}
function daysSince(rows, vid, deathDay, pred) {
  let last = null;
  for (const m of rows) {
    if (m.vid !== vid || m.day > deathDay) continue;
    if (pred(m) && (last === null || m.day > last)) last = m.day;
  }
  return last === null ? null : (deathDay - last);
}
function streaksForMeals(rows) {
  const sorted = rows.slice().sort((a, b) => a.day - b.day);
  let cur = 0, max = 0, prevDay = null;
  for (const m of sorted) {
    if (prevDay !== null && m.day !== prevDay + 1) cur = 0;
    if (m.away === true && !isAdequate(m)) { cur++; if (cur > max) max = cur; }
    else cur = 0;
    prevDay = m.day;
  }
  return { max };
}
function trailingAwayStreak(rows, deathDay) {
  const desc = rows.filter(m => m.day <= deathDay).sort((a, b) => b.day - a.day);
  if (!desc.length) return 0;
  let count = 0, expect = desc[0].day;
  for (const m of desc) {
    if (m.day !== expect) break;
    if (m.away === true && !isAdequate(m)) { count++; expect--; }
    else break;
  }
  return count;
}
// classifyBinding(packKcal, want, drawn): the tail classification unit.
// Returns { binding, coverage } — binding iff dawn pack < dayWant.
// Exported for the proof test.
function classifyBinding(packKcal, want, drawn) {
  const binding = packKcal < want;
  const coverage = want > 0 ? drawn / want : null;
  return { binding, coverage };
}

function loadArm(dir, label) {
  const perSeed = [];
  for (const s of BAND) {
    const f = path.join(dir, `packtail-b-competent-s${s}.json`);
    if (!fs.existsSync(f)) fail(`missing per-seed file ${f} (${label})`);
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.seed !== s) fail(`seed mismatch in ${f}`);
    if (j.policy !== 'competent' || j.plentydepri !== 1 || j.depositgate !== 1) fail(`policy/env mismatch in ${f}`);
    if (!(j.daysAlive > 0)) fail(`daysAlive invalid in ${f}`);
    for (const k of ['deathRows', 'mealRows', 'daySeries', 'packRows', 'packMealRows'])
      if (!Array.isArray(j[k])) fail(`missing ${k} in ${f}`);
    const keys = new Set();
    for (const m of j.mealRows) {
      const k = m.vid + '|' + m.day;
      if (keys.has(k)) fail(`duplicate meal row ${k} in ${f}`);
      keys.add(k);
    }
    const pv = validatePackRows(j.packRows);
    if (pv.misaligned > 0) fail(`pack misalignment: ${pv.misaligned} rows in ${f} — ratios withheld`);
    if (pv.duplicates > 0) fail(`duplicate pack row in ${f}`);
    perSeed.push(j);
  }
  return perSeed;
}

function summarize(perSeed, label) {
  const shares = {};
  const wall = [];
  const starvDeaths = [];
  const fullPantryAwayStarv = [];
  let awayMeals = 0, awayAdequate = 0, havenMeals = 0, havenAdequate = 0;
  let drawDays = 0, drawWithPack = 0, selfFed = 0, packRowsTotal = 0, packRowsWithoutDrawDay = 0;
  let drawWithoutPackMeal = 0, takeDrawnMismatch = 0;
  const bindingCov = [], bindingPackNeed = [], bindingDawn = [], bindingWant = [];
  let bindingDays = 0;
  const perVillagerMax = [];
  let globalMaxStreak = 0;
  for (const j of perSeed) {
    for (const d of j.deathRows) shares[d.cause] = (shares[d.cause] || 0) + 1;
    const packByKey = new Map();
    for (const p of j.packRows) packByKey.set(p.vid + '|' + p.day, p);
    const pmByKey = new Map();
    for (const pm of j.packMealRows) if (!pmByKey.has(pm.vid + '|' + pm.day)) pmByKey.set(pm.vid + '|' + pm.day, pm);
    const byVid = new Map();
    for (const m of j.mealRows) {
      if (!byVid.has(m.vid)) byVid.set(m.vid, []);
      byVid.get(m.vid).push(m);
      if (m.ate == null || m.needEst == null) continue;
      if (m.away) {
        awayMeals++;
        if (isAdequate(m)) awayAdequate++;
        if ((m.drawn || 0) > 0) {
          drawDays++;
          const p = packByKey.get(m.vid + '|' + m.day);
          if (p) drawWithPack++;
          const pm = pmByKey.get(m.vid + '|' + m.day);
          if (!pm) { drawWithoutPackMeal++; }
          else {
            if (pm.take !== m.drawn) takeDrawnMismatch++;
            if (p) {
              const { binding, coverage } = classifyBinding(p.packKcal, pm.want, m.drawn);
              if (coverage != null && coverage > 1.000001) fail(`coverage > 1.0 on s${j.seed} ${m.vid} d${m.day} (instrument error: take exceeds want)`);
              if (binding) {
                bindingDays++;
                bindingCov.push(coverage);
                bindingPackNeed.push(p.packKcal / (p.needEst || 2000));
                bindingDawn.push(p.packKcal);
                bindingWant.push(pm.want);
              }
            }
          }
        } else if (m.drawn === 0) selfFed++;
      } else { havenMeals++; if (isAdequate(m)) havenAdequate++; }
    }
    for (const rows of byVid.values()) {
      const st = streaksForMeals(rows);
      perVillagerMax.push(st.max);
      if (st.max > globalMaxStreak) globalMaxStreak = st.max;
    }
    {
      const drawKeys = new Set();
      for (const m of j.mealRows) if (m.away && (m.drawn || 0) > 0) drawKeys.add(m.vid + '|' + m.day);
      packRowsTotal += j.packRows.length;
      for (const pp of j.packRows) if (!drawKeys.has(pp.vid + '|' + pp.day)) packRowsWithoutDrawDay++;
    }
    const maxWave = Math.max(0, ...(j.waveReach || [0]));
    wall.push({ seed: j.seed, daysAlive: j.daysAlive, national: !!j.national, win: !!j.win, maxWave, deaths: j.deathRows.length });
    for (const d of j.deathRows) {
      if (d.cause !== 'starvation' || d.isPlayer) continue;
      const meals = j.mealRows.filter(m => m.vid === d.who);
      const trail = trailingAwayStreak(meals, d.day);
      const q = pickQuote(d);
      const c = classify(d, j.mealRows);
      const rec = { seed: j.seed, day: d.day, who: d.who, whoName: d.whoName,
        pantryKcal: (d.ctx && d.ctx.pantryKcal) || 0, freshDays: (d.ctx && d.ctx.freshDays),
        awayAtDeath: (d.ctx && d.ctx.awayAtDeath),
        trailingAwayStreak: trail, daysSinceAdequate: daysSince(j.mealRows, d.who, d.day, isAdequate),
        cls: c.cls, sub: c.sub, quote: q.quote, quoteSrc: q.src };
      starvDeaths.push(rec);
      if ((d.ctx && d.ctx.pantryKcal || 0) >= 8000 && (d.ctx && d.ctx.freshDays || 0) >= 3.0 && d.ctx && d.ctx.awayAtDeath === true)
        fullPantryAwayStarv.push(rec);
    }
  }
  const bc = statsOf(bindingCov);
  const bp = statsOf(bindingPackNeed);
  return { label, perSeed, shares, wall, starvDeaths, fullPantryAwayStarv,
    awayMeals, awayAdequate, havenMeals, havenAdequate, drawDays, drawWithPack, selfFed,
    packRowsTotal, packRowsWithoutDrawDay, drawWithoutPackMeal, takeDrawnMismatch,
    bindingDays, bindingCov: bc, bindingPackNeed: bp,
    bindingDawnMedian: med(bindingDawn), bindingWantMedian: med(bindingWant),
    medianSurvival: med(wall.map(w => w.daysAlive)), maxSurvival: Math.max(...wall.map(w => w.daysAlive)),
    nationalN: wall.filter(w => w.national).length, winN: wall.filter(w => w.win).length,
    waveN: w => wall.filter(x => x.maxWave >= w).length,
    medianMaxStreak: med(perVillagerMax), globalMaxStreak, villagers: perVillagerMax.length };
}

function printArm(a) {
  console.log(`--- ${a.label} ---`);
  console.log(`WALL: ` + a.wall.map(w => `s${w.seed} ${w.daysAlive}d nat=${w.national} win=${w.win} wave=${w.maxWave} deaths=${w.deaths}`).join(' | '));
  console.log(`WALL SUMMARY: median survival ${a.medianSurvival}d max ${a.maxSurvival}d national ${a.nationalN}/8 wins ${a.winN}/8 wave w1=${a.waveN(1)} w2=${a.waveN(2)} w3=${a.waveN(3)} w4=${a.waveN(4)} w5=${a.waveN(5)}`);
  console.log('DEATH-CAUSE SHARES (pooled): ' + Object.entries(a.shares).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  console.log(`MEALS: away ${a.awayAdequate}/${a.awayMeals}` + (a.awayMeals ? ` (${(a.awayAdequate / a.awayMeals).toFixed(3)})` : '') +
    ` haven ${a.havenAdequate}/${a.havenMeals}` + (a.havenMeals ? ` (${(a.havenAdequate / a.havenMeals).toFixed(3)})` : ''));
  const cov = a.drawDays ? a.drawWithPack / a.drawDays : 0;
  console.log(`DRAW DAYS: ${a.drawDays} self-fed away ${a.selfFed} pack rows ${a.packRowsTotal} without-draw-day ${a.packRowsWithoutDrawDay} draw-days-without-packMeal-row ${a.drawWithoutPackMeal} take-vs-drawn mismatches ${a.takeDrawnMismatch}`);
  console.log(`DRAW_DAY_COVERAGE=${a.drawWithPack}/${a.drawDays}` + (a.drawDays ? ` (${cov.toFixed(3)})` : ''));
  const b = a.bindingCov;
  console.log(`BINDING DAYS (dawn pack < dayWant, draw days only): n=${a.bindingDays} (${a.drawDays ? (a.bindingDays / a.drawDays * 100).toFixed(1) : 'n/a'}% of draw days)`);
  console.log(`BINDING COVERAGE (drawn/dayWant): n=${b.n} median=${b.median == null ? 'n/a' : b.median.toFixed(3)} mean=${b.mean == null ? 'n/a' : b.mean.toFixed(3)} q1=${b.q1 == null ? 'n/a' : b.q1.toFixed(3)} q3=${b.q3 == null ? 'n/a' : b.q3.toFixed(3)} share==1.0=${b.shareEq1 == null ? 'n/a' : b.shareEq1.toFixed(3)} min=${b.min == null ? 'n/a' : b.min.toFixed(3)} max=${b.max == null ? 'n/a' : b.max.toFixed(3)}`);
  const p = a.bindingPackNeed;
  console.log(`BINDING PACK/NEED (diagnostic): n=${p.n} median=${p.median == null ? 'n/a' : p.median.toFixed(3)} q1=${p.q1 == null ? 'n/a' : p.q1.toFixed(3)} q3=${p.q3 == null ? 'n/a' : p.q3.toFixed(3)} median dawn pack=${a.bindingDawnMedian} median dayWant=${a.bindingWantMedian}`);
  console.log(`STREAKS: per-villager max median=${a.medianMaxStreak} global max=${a.globalMaxStreak} villagers=${a.villagers}`);
  console.log(`STARVATION DEATHS (villagers): n=${a.starvDeaths.length} full-pantry-away n=${a.fullPantryAwayStarv.length} preceded by >=3 inadequate away days: ${a.starvDeaths.filter(d => d.trailingAwayStreak >= 3).length}`);
  for (const d of a.starvDeaths) {
    console.log(`  s${d.seed} d${d.day} ${d.whoName} (${d.who}) class=${d.cls} sub=${d.sub} pantry=${d.pantryKcal}kcal fresh=${d.freshDays}d awayAtDeath=${d.awayAtDeath} trailing=${d.trailingAwayStreak} sinceAdequate=${d.daysSinceAdequate}`);
    console.log(`    quote[${d.quoteSrc}]: ${d.quote || '(empty window)'}`);
  }
  console.log(`SENSE WINDOWS (${a.label} starvation deaths):`);
  for (const d of a.starvDeaths) {
    const src = a.perSeed.find(j => j.seed === d.seed);
    const row = src ? src.deathRows.find(r => r.who === d.who && r.day === d.day && r.cause === 'starvation') : null;
    console.log(`  --- s${d.seed} d${d.day} ${d.whoName} trailing=${d.trailingAwayStreak} ---`);
    if (row) { for (const l of (row.sayWin || [])) console.log('    say: ' + l); for (const l of (row.teleWin || [])) console.log('    tele: ' + l); }
  }
}

function main() {
  if (!BASE_DIR || !ARMED_DIR) { console.error('USAGE: analyze-awayration-packtail-b.js <baselineCorpus> <armedCorpus>'); process.exit(2); }
  const base = summarize(loadArm(BASE_DIR, 'BASELINE'), 'BASELINE');
  const armed = summarize(loadArm(ARMED_DIR, 'ARMED'), 'ARMED');
  console.log('AWAYRATION-PACKTAIL-B ANALYZER REPORT');
  console.log('mode: pilot seeds: ' + BAND.join(',') + ' policy: competent PD=1 DG=1 days: 150');
  printArm(base);
  printArm(armed);
  const baseCov = base.drawDays ? base.drawWithPack / base.drawDays : 0;
  const armedCov = armed.drawDays ? armed.drawWithPack / armed.drawDays : 0;
  const armedOnly = Object.entries(armed.shares).filter(([k]) => !(k in base.shares));
  const armedOnlyBlockers = armedOnly.filter(([, v]) => v >= 3);
  const survivalRatio = base.medianSurvival ? armed.medianSurvival / base.medianSurvival : null;
  const go = armed.bindingCov.median != null && armed.bindingCov.median >= 0.90
    && armed.bindingDays >= 30
    && base.perSeed.length === 8 && armed.perSeed.length === 8
    && baseCov === 1 && armedCov === 1
    && survivalRatio != null && survivalRatio >= 0.8
    && armed.fullPantryAwayStarv.length <= base.fullPantryAwayStarv.length + 2
    && armedOnlyBlockers.length === 0;
  console.log('SWEEP-COMPARE (baseline vs armed, identical starting seeds, distributional only):');
  console.log(`  binding-day coverage median: ${base.bindingCov.median == null ? 'n/a' : base.bindingCov.median.toFixed(3)} (n=${base.bindingDays}) -> ${armed.bindingCov.median == null ? 'n/a' : armed.bindingCov.median.toFixed(3)} (n=${armed.bindingDays}) bar >= 0.90`);
  console.log(`  binding-day coverage mean: ${base.bindingCov.mean == null ? 'n/a' : base.bindingCov.mean.toFixed(3)} -> ${armed.bindingCov.mean == null ? 'n/a' : armed.bindingCov.mean.toFixed(3)}`);
  console.log(`  binding share==1.0: ${base.bindingCov.shareEq1 == null ? 'n/a' : base.bindingCov.shareEq1.toFixed(3)} -> ${armed.bindingCov.shareEq1 == null ? 'n/a' : armed.bindingCov.shareEq1.toFixed(3)}`);
  console.log(`  binding pack/need median (diagnostic): ${base.bindingPackNeed.median == null ? 'n/a' : base.bindingPackNeed.median.toFixed(3)} -> ${armed.bindingPackNeed.median == null ? 'n/a' : armed.bindingPackNeed.median.toFixed(3)}`);
  console.log(`  draw-day capture: ${baseCov.toFixed(3)} -> ${armedCov.toFixed(3)} (bar == 1.000)`);
  console.log(`  median survival: ${base.medianSurvival}d -> ${armed.medianSurvival}d (ratio ${survivalRatio == null ? 'n/a' : survivalRatio.toFixed(3)}, bar >= 0.8)`);
  console.log(`  full-pantry away starvation deaths: ${base.fullPantryAwayStarv.length} -> ${armed.fullPantryAwayStarv.length} (bar <= baseline+2)`);
  console.log(`  armed-only death causes: ${armedOnly.length ? armedOnly.map(([k, v]) => `${k}=${v}`).join(' ') : 'none'} (blockers >=3 deaths: ${armedOnlyBlockers.length ? armedOnlyBlockers.map(([k, v]) => `${k}=${v}`).join(' ') : 'none'})`);
  console.log(`  wall national: ${base.nationalN}/8 -> ${armed.nationalN}/8 wins: ${base.winN}/8 -> ${armed.winN}/8 wave4: ${base.waveN(4)}/8 -> ${armed.waveN(4)}/8 wave5: ${base.waveN(5)}/8 -> ${armed.waveN(5)}/8 (reported, not judged)`);
  console.log('VERDICT: ' + (go ? 'GO' : 'NO-GO') +
    ` (armedMedianBindingCov=${armed.bindingCov.median == null ? 'n/a' : armed.bindingCov.median.toFixed(3)}>=0.90:${armed.bindingCov.median != null && armed.bindingCov.median >= 0.90} armedBindingN=${armed.bindingDays}>=30:${armed.bindingDays >= 30} seedsComplete:${base.perSeed.length === 8 && armed.perSeed.length === 8} capture=${baseCov.toFixed(3)}/${armedCov.toFixed(3)}==1.000:${baseCov === 1 && armedCov === 1} survivalRatio=${survivalRatio == null ? 'n/a' : survivalRatio.toFixed(3)}>=0.8:${survivalRatio != null && survivalRatio >= 0.8} fpAwayStarv ${armed.fullPantryAwayStarv.length}<=${base.fullPantryAwayStarv.length + 2}:${armed.fullPantryAwayStarv.length <= base.fullPantryAwayStarv.length + 2} armedOnlyBlockers=${armedOnlyBlockers.length}==0:${armedOnlyBlockers.length === 0})`);
  console.log('END REPORT');
}

if (require.main === module) main();
module.exports = { isAdequate, statsOf, med, validatePackRows, classify, pickQuote, daysSince, streaksForMeals, trailingAwayStreak, classifyBinding, BAND, BANNED };
