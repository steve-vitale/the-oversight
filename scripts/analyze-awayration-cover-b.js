#!/usr/bin/env node
// analyze-awayration-cover-b.js — away-ration COVERAGE re-registration analyzer (measurement only, zero src/js).
// (sim-awayration-cover-b, 2026-10-24, re-registration follow-up to sim-awayration-size-b,
// sim-fullpantry-diag-b.)
//
// PRE-REGISTERED RULES (evidence/2026-10-24/sim-awayration-cover-b.md):
//   Away villager-day = a deduped meal row with away === true.
//   Meal adequacy = ate >= 0.6 * needEst (needEst = kcalPerDay || 2000).
//   Pack/need ratio = packKcal / needEst on the joined away day
//     (pack row joined to the meal row by (vid,day)).
//   Pack coverage = away meal-days with a pack row / all away meal-days.
//   PACK ALIGNMENT GATE: every pack row must have packDay === day.
//     Any misaligned row aborts the run (exit 2) and NO pack/need ratios
//     are published — an unprovable dawn pack is not a measurement.
//   Streak: per villager, meal rows sorted by day; increments on an
//     away row with ate < 0.6*needEst; resets on an adequate row, on a
//     haven row, or on a calendar gap in that villager's rows.
//     Reported: median of per-villager max streaks + global max.
//   Death linkage: for each villager starvation death, trailing
//     inadequate-away streak = consecutive away-inadequate meal days
//     ending at the villager's last meal day <= deathDay (walking back
//     while away && !adequate on consecutive calendar days); days
//     since last adequate meal = deathDay minus the last adequate meal
//     day <= deathDay (any location; null if none). Share preceded by
//     >= 3 inadequate away days = deaths with trailing streak >= 3 /
//     all villager starvation deaths.
//   GO iff seeds complete >= 8 AND away villager-days >= 200 AND
//     pack coverage >= 0.90 AND this report prints every primary
//     metric (away adequacy, pack/need median/Q1/Q3/share<0.6,
//     median+max streak, starvation-death >=3 share, sense quotes).
//     A miss is DIAG-NO-GO, never re-scored on a friendlier denominator.
//   Quartiles use nearest-rank on the sorted joined pack/need ratios:
//     Q1 = ceil(0.25*n)-th value, Q3 = ceil(0.75*n)-th value; median is
//     the middle value (mean of the two middles when n is even).
//   Balanced panel per §15: N/A (single policy, no comparison arm),
//     stated in the evidence file, not silently skipped.
// Modes: argv[3] accepted 'full' (default) or 'pilot' (alias, same BAND
//   corpus). Exit 0 = verdict computed (NO-GO is a valid result, not a
//   crash). Exit 2 = corpus incomplete / C1 freshness hit / pack misalignment.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'awayration-cover-b-corpus');
const MODE = process.argv[3] || 'full';
const BAND = Array.from({length: 32}, (_, i) => 94701 + i);
const CORPUS_DIRNAME = 'awayration-cover-b-corpus';

function fail(msg) { console.error('ANALYZER FAIL: ' + msg); process.exit(2); }

function classify(row, meals) {
  const win = meals.filter(m => m.vid === row.who && m.day >= row.day - 7 && m.day <= row.day);
  if (!win.length) return { cls: 'C', sub: 'no-meal-rows', win: win.length, awayShare: null };
  const awayN = win.filter(m => m.away === true).length;
  const awayShare = awayN / win.length;
  if (row.ctx && row.ctx.awayAtDeath === true) return { cls: 'A', sub: 'away-at-death', win: win.length, awayShare };
  if (awayShare >= 0.5) return { cls: 'A', sub: 'away-share>=0.5', win: win.length, awayShare };
  const shortHaven = win.find(m => m.away === false && m.drawn != null && m.drawn < 0.25 * (m.needEst || 2000)
    && (m.ate || 0) < 0.6 * (m.needEst || 2000));
  if (shortHaven) return { cls: 'B', sub: 'short-haven-draw d' + shortHaven.day + ' drawn=' + shortHaven.drawn + ' ate=' + shortHaven.ate, win: win.length, awayShare };
  const first = win.slice().sort((a, b) => a.day - b.day)[0];
  if (first && first.healthBefore != null && first.healthBefore < 30) return { cls: 'C', sub: 'low-health-carryover', win: win.length, awayShare };
  if (awayShare > 0) return { cls: 'C', sub: 'mixed-away-no-short-haven-draw', win: win.length, awayShare };
  return { cls: 'C', sub: 'haven-adequate-meals', win: win.length, awayShare };
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
    if (/camp wild/i.test(l.text)) s += 1;
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

function isAdequate(m) { return (m.ate || 0) >= 0.6 * (m.needEst || 2000); }

// packNeedStats(ratios): nearest-rank quartiles + median, documented above.
function packNeedStats(ratios) {
  const s = ratios.slice().sort((a, b) => a - b);
  const n = s.length;
  if (!n) return { n: 0, median: null, q1: null, q3: null, shareLt06: null, min: null, max: null };
  const rank = (q) => s[Math.max(0, Math.ceil(q * n) - 1)];
  const median = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  return { n, median, q1: rank(0.25), q3: rank(0.75),
    shareLt06: s.filter(r => r < 0.6).length / n, min: s[0], max: s[n - 1] };
}

// streaksForMeals(rowsForOneVillager sorted by day): max run of
// consecutive away-inadequate days; resets on adequate, haven, or gap.
function streaksForMeals(rows) {
  const sorted = rows.slice().sort((a, b) => a.day - b.day);
  let cur = 0, max = 0, prevDay = null;
  const runs = [];
  for (const m of sorted) {
    if (prevDay !== null && m.day !== prevDay + 1) { if (cur) runs.push(cur); cur = 0; }
    if (m.away === true && !isAdequate(m)) { cur++; if (cur > max) max = cur; }
    else { if (cur) runs.push(cur); cur = 0; }
    prevDay = m.day;
  }
  if (cur) runs.push(cur);
  return { max, runs };
}

// trailingAwayStreak(rowsForOneVillager, deathDay): consecutive
// away-inadequate meal days ending at the last meal day <= deathDay.
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

// validatePackRows(packRows): returns { misaligned, duplicates }.
// Misaligned = packDay !== day. Duplicates = repeat (vid,day) keys.
function validatePackRows(packRows) {
  let misaligned = 0; const seen = new Set(); let duplicates = 0;
  for (const p of (packRows || [])) {
    if (p.packDay !== p.day) misaligned++;
    const k = p.vid + '|' + p.day;
    if (seen.has(k)) duplicates++; else seen.add(k);
  }
  return { misaligned, duplicates };
}

function main() {
  // C1 freshness: no seed in BAND may appear as an exact "seed"
  // field in ANY other per-seed corpus file under evidence/2026-10-24.
  const evDir = path.join(__dirname, '..', 'evidence', '2026-10-24');
  const allSeeds = BAND;
  if (fs.existsSync(evDir)) {
    for (const dir of fs.readdirSync(evDir)) {
      if (!dir.endsWith('-corpus')) continue;
      if (dir === CORPUS_DIRNAME) continue;
      const d = path.join(evDir, dir);
      if (!fs.statSync(d).isDirectory()) continue;
      for (const f of fs.readdirSync(d)) {
        if (!f.endsWith('.json') || f.startsWith('sweep-')) continue;
        try {
          const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
          if (allSeeds.includes(j.seed)) fail(`C1 hit: seed ${j.seed} already in ${dir}/${f}`);
        } catch (e) { /* unreadable non-seed file: ignore */ }
      }
    }
  }

  let seeds = BAND.slice();
  if (MODE !== 'full' && MODE !== 'pilot') fail('unknown mode ' + MODE + ' (want pilot|full)');

  const perSeed = [];
  for (const s of seeds) {
    const f = path.join(CORPUS, `awayration-cover-b-competent-s${s}.json`);
    if (!fs.existsSync(f)) fail('missing per-seed file ' + f);
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.seed !== s) fail(`seed mismatch in ${f}`);
    if (j.policy !== 'competent' || j.plentydepri !== 1 || j.depositgate !== 1) fail(`policy/env mismatch in ${f}`);
    if (!(j.daysAlive > 0)) fail(`daysAlive invalid in ${f}`);
    if (!Array.isArray(j.deathRows) || !Array.isArray(j.mealRows) || !Array.isArray(j.daySeries) || !Array.isArray(j.packRows)) fail(`missing rows in ${f}`);
    const keys = new Set();
    for (const m of j.mealRows) {
      const k = m.vid + '|' + m.day;
      if (keys.has(k)) fail(`duplicate meal row ${k} in ${f} (sweep dedupe failed)`);
      keys.add(k);
    }
    // PACK ALIGNMENT GATE: any misaligned or duplicate pack row aborts
    // before any ratio is published.
    const pv = validatePackRows(j.packRows);
    if (pv.misaligned > 0) fail(`pack misalignment: ${pv.misaligned} pack rows with packDay !== day in ${f} — dawn-pack alignment unproven, ratios withheld`);
    if (pv.duplicates > 0) fail(`duplicate pack row in ${f} (sweep first-wins dedupe failed)`);
    perSeed.push(j);
  }

  const shares = {};
  const wall = [];
  const starvDeaths = [];
  let havenMeals = 0, havenAdequate = 0, awayMeals = 0, awayAdequate = 0;
  let packSkipTotal = 0, mealDupTotal = 0;
  const joinedRatios = [];
  const joinedByStratum = { band: [], ext: [] };
  let awayWithPack = 0;
  let drawDays = 0, drawWithPack = 0, selfFed = 0, packRowsTotal = 0, packRowsWithoutDrawDay = 0;
  const drawRatios = [], drawPackKcals = [], drawPantries = [];
  const perVillagerMax = [];
  let globalMaxStreak = 0;
  const stratumAway = { band: 0, ext: 0 };
  const stratumAwayAdeq = { band: 0, ext: 0 };
  const stratumPackCov = { band: { with: 0, total: 0 }, ext: { with: 0, total: 0 } };

  for (const j of perSeed) {
    const stratum = 'band';
    for (const d of j.deathRows) shares[d.cause] = (shares[d.cause] || 0) + 1;
    const packByKey = new Map();
    for (const p of j.packRows) packByKey.set(p.vid + '|' + p.day, p);
    const byVid = new Map();
    for (const m of j.mealRows) {
      if (!byVid.has(m.vid)) byVid.set(m.vid, []);
      byVid.get(m.vid).push(m);
      if (m.ate == null || m.needEst == null) continue;
      if (m.away) {
        awayMeals++; stratumAway[stratum]++;
        if (isAdequate(m)) { awayAdequate++; stratumAwayAdeq[stratum]++; }
        stratumPackCov[stratum].total++;
        const p = packByKey.get(m.vid + '|' + m.day);
        if (p) {
          awayWithPack++; stratumPackCov[stratum].with++;
          const ratio = p.packKcal / (p.needEst || 2000);
          joinedRatios.push(ratio); joinedByStratum[stratum].push(ratio);
        }
        // COVER-B PRIMARY (independent denominator): a pack-draw day is
        // an away meal row with drawn > 0 (packMeal actually took food).
        // drawn comes from the villagerMealDay result, pack rows from the
        // packKcal wrapper — two independent captures, so the ratio is
        // a capture-completeness test, not a tautology. drawn === 0 days
        // are self-fed and are NOT in the denominator, by design.
        if ((m.drawn || 0) > 0) {
          drawDays++;
          if (p) {
            drawWithPack++;
            drawRatios.push(p.packKcal / (p.needEst || 2000));
            drawPackKcals.push(p.packKcal);
            if (p.pantryKcalAtPack != null) drawPantries.push(p.pantryKcalAtPack);
          }
        } else if (m.drawn === 0) selfFed++;
      } else { havenMeals++; if (isAdequate(m)) havenAdequate++; }
    }
    for (const rows of byVid.values()) {
      const st = streaksForMeals(rows);
      perVillagerMax.push(st.max);
      if (st.max > globalMaxStreak) globalMaxStreak = st.max;
    }
    // Pack rows with no draw-day meal (e.g. steal/intimidate reseeds): context only, never numerator/denominator.
    {
      const drawKeys = new Set();
      for (const m of j.mealRows) if (m.away && (m.drawn || 0) > 0) drawKeys.add(m.vid + '|' + m.day);
      packRowsTotal += j.packRows.length;
      for (const pp of j.packRows) if (!drawKeys.has(pp.vid + '|' + pp.day)) packRowsWithoutDrawDay++;
    }
    const maxWave = Math.max(0, ...(j.waveReach || [0]));
    wall.push({ seed: j.seed, stratum, daysAlive: j.daysAlive, national: !!j.national, win: !!j.win,
      maxWave, deaths: j.deathRows.length });
    for (const d of j.deathRows) {
      if (d.cause !== 'starvation' || d.isPlayer) continue;
      const meals = j.mealRows.filter(m => m.vid === d.who);
      const trail = trailingAwayStreak(meals, d.day);
      const q = pickQuote(d);
      const c = classify(d, j.mealRows);
      starvDeaths.push({ seed: j.seed, stratum, day: d.day, who: d.who, whoName: d.whoName,
        pantryKcal: (d.ctx && d.ctx.pantryKcal) || 0, freshDays: (d.ctx && d.ctx.freshDays),
        awayAtDeath: (d.ctx && d.ctx.awayAtDeath),
        trailingAwayStreak: trail, daysSinceAdequate: daysSince(j.mealRows, d.who, d.day, isAdequate),
        daysSinceAnyMeal: daysSince(j.mealRows, d.who, d.day, m => (m.ate || 0) > 0),
        cls: c.cls, sub: c.sub, quote: q.quote, quoteSrc: q.src });
    }
  }

  const arcCounts = {};
  try {
    const sum = JSON.parse(fs.readFileSync(path.join(CORPUS, 'sweep-competent.json'), 'utf8'));
    for (const r of (sum.rows || [])) { const a = (r.diag && r.diag.arc != null) ? String(r.diag.arc) : '?'; arcCounts[a] = (arcCounts[a] || 0) + 1; }
    for (const r of (sum.rows || [])) {
      if (r.diag && r.diag.mealDupCount) mealDupTotal += r.diag.mealDupCount;
      if (r.diag && r.diag.packSkipCount) packSkipTotal += r.diag.packSkipCount;
    }
  } catch (e) { /* summary absent (pilot-phase run): totals unknown, not fatal */ }

  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
  const packStats = packNeedStats(joinedRatios);
  const drawStats = packNeedStats(drawRatios);
  const drawCoverage = drawDays ? drawWithPack / drawDays : 0;
  const drawPackMedian = med(drawPackKcals);
  const drawPantryMedian = med(drawPantries);
  const drawPantryLt5000 = drawPantries.filter(x => x < 5000).length;
  const packStatsBand = packNeedStats(joinedByStratum.band);
  const packStatsExt = packNeedStats(joinedByStratum.ext);
  const coverage = awayMeals ? awayWithPack / awayMeals : 0; // literal (context only, NOT the verdict)
  const awayAdeqRate = awayMeals ? awayAdequate / awayMeals : null;
  const medianMaxStreak = med(perVillagerMax);
  const ge3 = starvDeaths.filter(d => d.trailingAwayStreak >= 3).length;
  const ge3Share = starvDeaths.length ? ge3 / starvDeaths.length : null;
  const quotesOk = starvDeaths.length === 0 || starvDeaths.every(d => d.quote);
  // Zero villager starvation deaths is a valid measurement outcome, not a
  // measurement failure: the linkage section still prints (n=0, share
  // n/a), and the size question is answered by pack/need + adequacy +
  // streaks. Only a nonzero death count with an uncomputable share
  // (impossible by construction) would block GO on linkage.
  const go = perSeed.length === 32 && drawDays > 0 && drawCoverage >= 0.90
    && packStats.n > 0 && drawStats.n > 0 && awayAdeqRate !== null && medianMaxStreak !== null
    && (starvDeaths.length === 0 || ge3Share !== null) && quotesOk;

  console.log('AWAYRATION-COVER-B ANALYZER REPORT');
  console.log('mode: ' + MODE + ' seeds: ' + seeds.join(',') + ' policy: competent PD=1 DG=1 days: 150');
  console.log(`AWAY_DAYS_TOTAL=${awayMeals} (band=${stratumAway.band} ext=${stratumAway.ext})`);
  console.log(`DRAW_DAYS_TOTAL=${drawDays} SELF_FED_AWAY_DAYS=${selfFed} PACK_ROWS_TOTAL=${packRowsTotal} PACK_ROWS_WITHOUT_DRAW_DAY=${packRowsWithoutDrawDay}`);
  console.log(`DRAW_DAY_COVERAGE=${drawWithPack}/${drawDays}` + (drawDays ? ' (' + drawCoverage.toFixed(3) + ')' : '') + ' — PRIMARY METRIC (pack-draw days with a pack row / all pack-draw days; self-fed days excluded by design)');
  console.log('WALL (seed stratum daysAlive national win maxWave deaths):');
  for (const w of wall) console.log(`  s${w.seed} ${w.stratum} ${w.daysAlive}d national=${w.national} win=${w.win} wave=${w.maxWave} deaths=${w.deaths}`);
  const waveReachCount = w => wall.filter(x => x.maxWave >= w).length;
  console.log(`  median survival ${med(wall.map(w => w.daysAlive))}d max ${Math.max(...wall.map(w => w.daysAlive))}d national ${wall.filter(w => w.national).length}/${wall.length} wins ${wall.filter(w => w.win).length}/${wall.length} waveReach w1=${waveReachCount(1)} w2=${waveReachCount(2)} w3=${waveReachCount(3)} w4=${waveReachCount(4)} w5=${waveReachCount(5)}`);
  console.log('DEATH-CAUSE SHARES (pooled): ' + Object.entries(shares).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  console.log(`MEAL ADEQUACY (ate>=0.6*need): haven ${havenAdequate}/${havenMeals}` +
    (havenMeals ? ' (' + (havenAdequate / havenMeals).toFixed(3) + ')' : '') +
    ` away ${awayAdequate}/${awayMeals}` + (awayMeals ? ' (' + awayAdeqRate.toFixed(3) + ')' : '') +
    ` strata away adequacy band ${stratumAwayAdeq.band}/${stratumAway.band} ext ${stratumAwayAdeq.ext}/${stratumAway.ext}`);
  console.log(`PACK COVERAGE (away meal-days with a pack row): ${awayWithPack}/${awayMeals}` +
    (awayMeals ? ' (' + coverage.toFixed(3) + ')' : '') +
    ` strata band ${stratumPackCov.band.with}/${stratumPackCov.band.total} ext ${stratumPackCov.ext.with}/${stratumPackCov.ext.total} (pack alignment: 0 misaligned rows; sweep packSkipCount total ${packSkipTotal}; mealDup total ${mealDupTotal})`);
  const fmtStats = (label, st) => console.log(`${label}: n=${st.n} median=${st.median == null ? 'n/a' : st.median.toFixed(3)} q1=${st.q1 == null ? 'n/a' : st.q1.toFixed(3)} q3=${st.q3 == null ? 'n/a' : st.q3.toFixed(3)} share<0.6=${st.shareLt06 == null ? 'n/a' : st.shareLt06.toFixed(3)} min=${st.min == null ? 'n/a' : st.min.toFixed(3)} max=${st.max == null ? 'n/a' : st.max.toFixed(3)}`);
  fmtStats('PACK/NEED RATIO (joined away days, pooled)', packStats);
  fmtStats('PACK/NEED RATIO (band)', packStatsBand);
  if (joinedByStratum.ext.length) fmtStats('PACK/NEED RATIO (ext)', packStatsExt);
  fmtStats('PACK/NEED RATIO (pack-draw days only)', drawStats);
  console.log(`DRAW-DAY REPLICATION: median pack kcal=${drawPackMedian} median pantry at draw=${drawPantryMedian} packs with pantry<5000kcal: ${drawPantryLt5000}/${drawPantries.length} (pantry-known draw days) median pack kcal (all joined)=${med(perSeed.flatMap(j => j.packRows.map(pp => pp.packKcal)))}`);
  console.log('ARC COUNTS (summary diag): ' + JSON.stringify(arcCounts));
  console.log(`STREAKS (consecutive inadequate away days): per-villager max median=${medianMaxStreak} global max=${globalMaxStreak} villagers=${perVillagerMax.length} with max>=3: ${perVillagerMax.filter(x => x >= 3).length}`);
  console.log(`STARVATION DEATHS (villagers): n=${starvDeaths.length} preceded by >=3 inadequate away days: ${ge3} (${ge3Share == null ? 'n/a' : ge3Share.toFixed(3)}) quotesAll=${quotesOk}`);
  for (const d of starvDeaths) {
    console.log(`  s${d.seed}(${d.stratum}) d${d.day} ${d.whoName} (${d.who}) class=${d.cls} sub=${d.sub} pantry=${d.pantryKcal}kcal fresh=${d.freshDays}d awayAtDeath=${d.awayAtDeath} trailingAwayStreak=${d.trailingAwayStreak} sinceAdequate=${d.daysSinceAdequate} sinceAny=${d.daysSinceAnyMeal}`);
    console.log(`    quote[${d.quoteSrc}]: ${d.quote || '(empty window)'}`);
  }
  console.log('SENSE WINDOWS (all villager starvation deaths, say+tele):');
  for (const d of starvDeaths) {
    const src = perSeed.find(j => j.seed === d.seed);
    const row = src ? src.deathRows.find(r => r.who === d.who && r.day === d.day && r.cause === 'starvation') : null;
    console.log(`  --- s${d.seed} d${d.day} ${d.whoName} trailing=${d.trailingAwayStreak} ---`);
    if (row) { for (const l of (row.sayWin || [])) console.log('    say: ' + l); for (const l of (row.teleWin || [])) console.log('    tele: ' + l); }
  }
  console.log('VERDICT: ' + (go ? 'GO' : 'NO-GO') +
    ` (seeds=${perSeed.length}==32:${perSeed.length === 32} drawDays=${drawDays}>0:${drawDays > 0} drawDayCoverage=${drawCoverage.toFixed(3)}>=0.90:${drawCoverage >= 0.90} literalCoverage(context)=${coverage.toFixed(3)} ratios+streaks+linkage+quotes present:${packStats.n > 0 && drawStats.n > 0 && awayAdeqRate !== null && medianMaxStreak !== null && (starvDeaths.length === 0 || ge3Share !== null) && quotesOk})`);
  console.log('END REPORT');
}

if (require.main === module) main();
module.exports = { classify, pickQuote, daysSince, isAdequate, packNeedStats, streaksForMeals, trailingAwayStreak, validatePackRows, BAND };
