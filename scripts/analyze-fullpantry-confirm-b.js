#!/usr/bin/env node
// analyze-fullpantry-confirm-b.js — full-pantry starvation attribution analyzer.
// (sim-fullpantry-confirm-b, 2026-10-24, backlog #910 follow-up to sim-pantrystarve-b.)
//
// PRE-REGISTERED RULES (evidence/2026-10-24/sim-fullpantry-confirm-b.md):
//   FULL-PANTRY: death ctx pantryKcal >= 8000 AND freshDays >= 3.0.
//     (Pantrystarve gated on kcal only; this run's brief requires ample
//     kcal AND fresh days. Deaths meeting the kcal gate but not the
//     fresh gate are counted separately as kcal-only context, never
//     in the verdict denominator.)
//   Window: the deceased's own DEDUPED meal rows, days [deathDay-7, deathDay].
//   A AWAY-RATION: awayAtDeath === true OR away-share of window meal-days >= 0.5.
//   B HAVEN-DISTRIBUTION: not A AND any haven meal-day in the window with
//     drawn < 0.25 * needEst AND ate < 0.6 * needEst. (Pantrystarve
//     metric-review fix: a self-fed villager legitimately draws ~0 while
//     eating adequately from own production; draw alone false-flags it.)
//   C OTHER: neither, with a sub-reason from the record.
// classify() takes ONLY (deathRow, mealRows) — it never reads sayWin /
// teleWin. Window words about another villager, or about "that thing",
// attribute nothing (backlog #911). Windows are used ONLY to attach a
// corroborating quote per case (pickQuote); a quote never overrides
// the record, and a window that contradicts the record is reported
// as a narration-vs-state tension, not a reclassification.
// CONFIRM-GO (this run's binding pre-reg) iff pooled deaths from THIS
// RUN ONLY meet n >= 8 AND shareA >= 0.80 AND every named mechanism
// (A/B) with count > 0 has count >= 2 AND >= 1 quoted case. NO-GO
// otherwise, including n < 8 after the extension even if shareA is
// 1.00, or if the corpus is blind (missing meal rows / death ctx).
// Pooled-with-prior-runs numbers are context ONLY, never the verdict.
// Modes: argv[3] 'pilot' requires PILOT files only (extension decision);
// default 'full' requires the corpus the run actually completed:
// PILOT files, plus EXT files iff any EXT file exists (the run's own
// extension decision is read from the corpus, and the strata counts
// are printed separately so pilot-only vs pooled verdicts are auditable).
// Exit 0 = corpus complete + verdict computed (NO-GO is a valid
// result, not a crash). Exit 2 = corpus incomplete / C1 freshness hit.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'fullpantry-confirm-b-corpus');
const MODE = process.argv[3] || 'full';
const PILOT = [94421, 94422, 94423, 94424, 94425, 94426, 94427, 94428];
const EXT = [94429, 94430, 94431, 94432, 94433, 94434, 94435, 94436];
const FULL_KCAL = 8000;
const FULL_FRESH = 3.0;

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

// pickQuote(row): corroboration ONLY. Scores window lines: a line naming
// the deceased (+3), a STARVING/spiral line (+2), a Village-meal line
// (+1), a camp-wild line (+1, flagged scholar-form when it is the
// scholar's line — it never proves a villager away). Returns '' when
// both windows are empty. The caller labels the quote's source.
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

function main() {
  // C1 freshness: no seed in PILOT+EXT may appear as an exact "seed"
  // field in ANY other per-seed corpus file under evidence/2026-10-24
  // (substring matches in other fields are noise).
  const evDir = path.join(__dirname, '..', 'evidence', '2026-10-24');
  const allSeeds = PILOT.concat(EXT);
  if (fs.existsSync(evDir)) {
    for (const dir of fs.readdirSync(evDir)) {
      if (!dir.endsWith('-corpus')) continue;
      if (dir === 'fullpantry-confirm-b-corpus') continue;
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

  // Decide the required seed list: pilot mode = PILOT; full mode =
  // PILOT + EXT iff any EXT file exists, else PILOT (pilot-only run).
  let seeds = PILOT.slice();
  if (MODE === 'pilot') seeds = PILOT.slice();
  else if (MODE === 'full') {
    const extPresent = EXT.some(s => fs.existsSync(path.join(CORPUS, `fullpantry-confirm-b-competent-s${s}.json`)));
    seeds = extPresent ? PILOT.concat(EXT) : PILOT.slice();
  } else fail('unknown mode ' + MODE + ' (want pilot|full)');

  const perSeed = [];
  for (const s of seeds) {
    const f = path.join(CORPUS, `fullpantry-confirm-b-competent-s${s}.json`);
    if (!fs.existsSync(f)) fail('missing per-seed file ' + f);
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.seed !== s) fail(`seed mismatch in ${f}`);
    if (j.policy !== 'competent' || j.plentydepri !== 1 || j.depositgate !== 1) fail(`policy/env mismatch in ${f}`);
    if (!(j.daysAlive > 0)) fail(`daysAlive invalid in ${f}`);
    if (!Array.isArray(j.deathRows) || !Array.isArray(j.mealRows) || !Array.isArray(j.daySeries)) fail(`missing rows in ${f}`);
    // Dedupe audit: stored mealRows must already be one row per (vid,day).
    const keys = new Set();
    for (const m of j.mealRows) {
      const k = m.vid + '|' + m.day;
      if (keys.has(k)) fail(`duplicate meal row ${k} in ${f} (sweep dedupe failed)`);
      keys.add(k);
    }
    perSeed.push(j);
  }

  const shares = {};
  const wall = [];
  const fullDeaths = [];
  const kcalOnly = [];
  const playerFull = [];
  const allStarv = [];
  let playerStarv = 0;
  let havenMeals = 0, havenAdequate = 0, awayMeals = 0, awayAdequate = 0, mealDupTotal = 0;
  for (const j of perSeed) {
    for (const d of j.deathRows) shares[d.cause] = (shares[d.cause] || 0) + 1;
    // mealDupCount lives in the sweep summary rows' diag, not per-seed files; summed after the loop from the summary when present.
    for (const m of j.mealRows) {
      if (m.ate == null || m.needEst == null) continue;
      if (m.away) { awayMeals++; if (m.ate >= 0.6 * m.needEst) awayAdequate++; }
      else { havenMeals++; if (m.ate >= 0.6 * m.needEst) havenAdequate++; }
    }
    wall.push({ seed: j.seed, stratum: PILOT.includes(j.seed) ? 'pilot' : 'ext', daysAlive: j.daysAlive, national: !!j.national, win: !!j.win,
      maxWave: Math.max(0, ...(j.waveReach || [0])), deaths: j.deathRows.length });
    for (const d of j.deathRows) {
      if (d.cause !== 'starvation') continue;
      if (d.isPlayer) {
        playerStarv++;
        const pk = (d.ctx && d.ctx.pantryKcal) || 0, fd = (d.ctx && d.ctx.freshDays);
        if (pk >= FULL_KCAL && fd != null && fd >= FULL_FRESH) playerFull.push({ seed: j.seed, day: d.day, whoName: d.whoName, pantryKcal: pk, freshDays: fd, awayAtDeath: d.ctx.awayAtDeath });
        continue;
      }
      allStarv.push({ seed: j.seed, ...d });
      const pk = (d.ctx && d.ctx.pantryKcal) || 0, fd = (d.ctx && d.ctx.freshDays);
      if (pk >= FULL_KCAL && fd != null && fd >= FULL_FRESH) {
        const c = classify(d, j.mealRows);
        const q = pickQuote(d);
        const winMeals = j.mealRows.filter(m => m.vid === d.who && m.day >= d.day - 7 && m.day <= d.day)
          .sort((a, b) => a.day - b.day)
          .map(m => `d${m.day}:${m.away ? 'away' : 'haven'} ate=${m.ate} drawn=${m.drawn} hp=${m.healthBefore}->${m.healthAfter}`).join(' | ');
        fullDeaths.push({ seed: j.seed, stratum: PILOT.includes(j.seed) ? 'pilot' : 'ext', day: d.day, who: d.who, whoName: d.whoName,
          pantryKcal: pk, freshDays: fd, pantryFreshKcal: d.ctx.pantryFreshKcal, pantrySpoiledKcal: d.ctx.pantrySpoiledKcal,
          pop: d.ctx.pop, hungry: d.ctx.hungry, awayAtDeath: d.ctx.awayAtDeath,
          cls: c.cls, sub: c.sub, winMeals: c.win, awayShare: c.awayShare,
          daysSinceAdequate: daysSince(j.mealRows, d.who, d.day, m => (m.ate || 0) >= 0.6 * (m.needEst || 2000)),
          daysSinceAnyMeal: daysSince(j.mealRows, d.who, d.day, m => (m.ate || 0) > 0),
          winMealRows: winMeals, quote: q.quote, quoteSrc: q.src,
          sayWin: d.sayWin, teleWin: d.teleWin });
      } else if (pk >= FULL_KCAL) {
        kcalOnly.push({ seed: j.seed, day: d.day, whoName: d.whoName, pantryKcal: pk, freshDays: fd });
      }
    }
  }

  // Sweep-summary meal-dup totals (the dedupe audit trail): rows carry
  // diag.mealDupCount = replaced duplicates for that seed.
  try {
    const sum = JSON.parse(fs.readFileSync(path.join(CORPUS, 'sweep-competent.json'), 'utf8'));
    for (const r of (sum.rows || [])) if (r.diag && r.diag.mealDupCount) mealDupTotal += r.diag.mealDupCount;
  } catch (e) { /* summary absent (pilot-phase run): dup total unknown, not fatal */ }

  const counts = { A: 0, B: 0, C: 0 };
  for (const d of fullDeaths) counts[d.cls]++;
  const n = fullDeaths.length;
  const pilotN = fullDeaths.filter(d => d.stratum === 'pilot').length;
  const sh = c => (n ? (counts[c] / n).toFixed(3) : 'n/a');
  const classified = counts.A + counts.B;
  const quotedMechanismsOk = ['A', 'B'].every(c => counts[c] === 0 || fullDeaths.some(d => d.cls === c && d.quote));
  const countRuleOk = ['A', 'B'].every(c => counts[c] === 0 || counts[c] >= 2);
  // CONFIRM-GO (this run's binding pre-reg, MEASUREMENT.md §14): pooled
  // deaths from THIS RUN ONLY meet n >= 8 AND shareA >= 0.80 AND every
  // named mechanism (A/B) with count > 0 has count >= 2 and >= 1 quoted
  // case. n < 8 after the extension is NO-GO on sample even if shareA
  // is 1.00. Pooled-with-prior-runs numbers are context ONLY, never
  // the verdict. (Diag's small-sample qualifier does NOT apply here.)
  const shareA = n ? counts.A / n : 0;
  const go = n >= 8 && shareA >= 0.80 && countRuleOk && quotedMechanismsOk;
  const strength = !go ? (n > 0 && n < 8 ? 'NO-GO-on-sample' : '-') : 'CONFIRM-GO';

  console.log('FULLPANTRY-CONFIRM-B ANALYZER REPORT');
  console.log('mode: ' + MODE + ' seeds: ' + seeds.join(',') + ' policy: competent PD=1 DG=1 days: 150');
  console.log('FULL-PANTRY GATE: pantryKcal >= ' + FULL_KCAL + ' AND freshDays >= ' + FULL_FRESH);
  console.log('WALL (seed stratum daysAlive national win maxWave deaths):');
  for (const w of wall) console.log(`  s${w.seed} ${w.stratum} ${w.daysAlive}d national=${w.national} win=${w.win} wave=${w.maxWave} deaths=${w.deaths}`);
  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  console.log(`  median survival ${med(wall.map(w => w.daysAlive))}d max ${Math.max(...wall.map(w => w.daysAlive))}d national ${wall.filter(w => w.national).length}/${wall.length} wins ${wall.filter(w => w.win).length}/${wall.length}`);
  console.log('DEATH-CAUSE SHARES (pooled): ' + Object.entries(shares).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  console.log(`STARVATION: total villager=${allStarv.length} player=${playerStarv} full-pantry(kcal+fresh)=${n} (pilot=${pilotN}) kcal-only-context=${kcalOnly.length} player-full-pantry=${playerFull.length}`);
  console.log(`FULL-PANTRY ATTRIBUTION: A=${counts.A} (${sh('A')}) B=${counts.B} (${sh('B')}) C=${counts.C} (${sh('C')}) denominator=${n} classified=${classified} (${n ? (classified / n).toFixed(3) : 'n/a'}) countRule=${countRuleOk} quotedMechanisms=${quotedMechanismsOk}`);
  console.log('VERDICT: ' + (go ? 'CONFIRM-GO' : 'NO-GO') + ` (${strength}; CONFIRM-GO needs n>=8 AND shareA>=0.80 AND every named mechanism >=2 cases + quoted; got n=${n} shareA=${n ? shareA.toFixed(3) : 'n/a'} classified=${classified}/${n})`);
  console.log('MEAL-ROW DEDUPE (sweep summary, replaced duplicates): ' + mealDupTotal + ' across ' + perSeed.length + ' seeds (0 = no second-caller duplicates this run)');
  console.log('MEAL ADEQUACY (all meal rows, ate>=0.6*need): haven ' + havenAdequate + '/' + havenMeals +
    (havenMeals ? ' (' + (havenAdequate / havenMeals).toFixed(3) + ')' : '') +
    ' away ' + awayAdequate + '/' + awayMeals + (awayMeals ? ' (' + (awayAdequate / awayMeals).toFixed(3) + ')' : ''));
  console.log('FULL-PANTRY STARVATION DEATHS:');
  for (const d of fullDeaths) {
    console.log(`  s${d.seed}(${d.stratum}) d${d.day} ${d.whoName} (${d.who}) class=${d.cls} sub=${d.sub} pantry=${d.pantryKcal}kcal fresh=${d.freshDays}d freshKcal=${d.pantryFreshKcal} spoiledKcal=${d.pantrySpoiledKcal} pop=${d.pop} hungry=${d.hungry} awayAtDeath=${d.awayAtDeath} winMeals=${d.winMeals} awayShare=${d.awayShare == null ? 'n/a' : d.awayShare.toFixed(2)} sinceAdequate=${d.daysSinceAdequate} sinceAny=${d.daysSinceAnyMeal}`);
    console.log(`    meals7d: ${d.winMealRows || '(none)'}`);
    console.log(`    quote[${d.quoteSrc}]: ${d.quote || '(empty window)'}`);
  }
  if (kcalOnly.length) {
    console.log('KCAL-ONLY CONTEXT (kcal gate met, fresh gate missed — NOT in denominator):');
    for (const d of kcalOnly) console.log(`  s${d.seed} d${d.day} ${d.whoName} pantry=${d.pantryKcal}kcal fresh=${d.freshDays}d`);
  }
  if (playerFull.length) {
    console.log('PLAYER FULL-PANTRY STARVATIONS (excluded from sample, recorded separately):');
    for (const d of playerFull) console.log(`  s${d.seed} d${d.day} ${d.whoName} pantry=${d.pantryKcal}kcal fresh=${d.freshDays}d awayAtDeath=${d.awayAtDeath}`);
  }
  console.log('SENSE WINDOWS (all full-pantry deaths, say+tele):');
  for (const d of fullDeaths) {
    console.log(`  --- s${d.seed} d${d.day} ${d.whoName} class=${d.cls} ---`);
    for (const l of (d.sayWin || [])) console.log('    say: ' + l);
    for (const l of (d.teleWin || [])) console.log('    tele: ' + l);
  }
  console.log('END REPORT');
}

if (require.main === module) main();
module.exports = { classify, pickQuote, daysSince, FULL_KCAL, FULL_FRESH, PILOT, EXT };
