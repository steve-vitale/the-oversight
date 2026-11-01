#!/usr/bin/env node
// analyze-gatediseng-confirm-b.js — CONFIRM-band evenings analysis
// for sim-gatediseng-confirm-b (DIAG ONLY). New file, this arm.
// The JUDGED first-firing rule is scripts/analyze-gatediseng-b.js
// reused VERBATIM (never edited): its candidateC day is the
// authority. This file adds ONLY the metric-review-(3) texture
// gatediseng-b said was missing: ALL evenings satisfying the (c)
// condition (not just the first), and warnings issued under the
// prereg's one-per-stretch counting rule. It cross-checks its
// own first evening against the reused analyzer on every seed;
// any mismatch is reported in `mismatches` and is a loud failure,
// never a re-score.
//
// (c) condition per evening D (prereg, operationalized exactly
// as the reused analyzer): D is in a disengaged stretch starting
// at S, D > S, D >= 8, D-3 >= S, three consecutive strictly
// decreasing total falls ending at D (D-3 > D-2 > D-1 > D in
// pantry terms), and pantry(D) <= 0.90 * pantry(S).
// Warnings issued = first condition-satisfying evening of each
// stretch (one per stretch).
'use strict';
const { analyzeSeedGatediseng, firstStarvationDay } = require('./analyze-gatediseng-b');

const TREND_FRACTION = 0.90;
const ELIGIBLE_DAY = 8;

function rowMap(series) {
  const m = new Map();
  for (const r of (series || [])) {
    if (r != null && typeof r.loopDay === 'number') m.set(r.loopDay, r);
  }
  return m;
}
function pantry(m, d) {
  const r = m.get(d);
  return (r != null && typeof r.pantryKcal === 'number') ? r.pantryKcal : null;
}
function engaged(m, d) {
  const r = m.get(d);
  return r != null && r.gateEngaged === true;
}
function threeFalls(m, d) {
  const a = pantry(m, d - 3), b = pantry(m, d - 2), c = pantry(m, d - 1), e = pantry(m, d);
  if (a == null || b == null || c == null || e == null) return false;
  return a > b && b > c && c > e;
}
function stretchesOf(m, days) {
  const stretches = [];
  let cur = null;
  for (const d of days) {
    if (!engaged(m, d)) {
      if (cur == null) cur = { start: d, days: [] };
      cur.days.push(d);
    } else if (cur != null) { stretches.push(cur); cur = null; }
  }
  if (cur != null) stretches.push(cur);
  return stretches;
}

// All evenings satisfying (c), in day order, with their stretch start.
function allCEvenings(series) {
  const m = rowMap(series);
  const days = (series || []).map((r) => r.loopDay).filter((d) => typeof d === 'number').sort((a, b) => a - b);
  const out = [];
  for (const st of stretchesOf(m, days)) {
    const sPantry = pantry(m, st.start);
    if (sPantry == null) continue;
    for (const d of st.days) {
      if (d <= st.start || d < ELIGIBLE_DAY) continue;
      if (d - 3 < st.start) continue;
      if (!threeFalls(m, d)) continue;
      const p = pantry(m, d);
      if (p != null && p <= TREND_FRACTION * sPantry) {
        out.push({ day: d, standDownDay: st.start, standDownPantry: sPantry, pantry: p, fallPctVsStandDown: 1 - p / sPantry });
      }
    }
  }
  return out;
}

// Warnings issued under the prereg counting rule: first (c)
// evening of each disengaged stretch.
function warningsForSeed(series) {
  const all = allCEvenings(series);
  const seen = new Set();
  const warnings = [];
  for (const e of all) {
    if (!seen.has(e.standDownDay)) { seen.add(e.standDownDay); warnings.push(e); }
  }
  return { allEvenings: all, warnings };
}

function analyzeSeedConfirm(seedJson) {
  const reused = analyzeSeedGatediseng(seedJson);
  const { allEvenings, warnings } = warningsForSeed((seedJson && seedJson.rows) || []);
  const reusedFirst = reused.candidates.c_standDownTrend == null ? null : reused.candidates.c_standDownTrend.day;
  const mineFirst = allEvenings.length === 0 ? null : allEvenings[0].day;
  const collapsed = reused.collapsed;
  const starveDay = firstStarvationDay(seedJson);
  const refDay = starveDay != null ? starveDay : (collapsed ? seedJson.daysAlive : null);
  const inTime = (mineFirst != null && refDay != null) ? (mineFirst <= refDay - 3) : null;
  return {
    seed: seedJson.seed,
    endReason: reused.endReason,
    daysAlive: reused.daysAlive,
    maxWaveUnlocked: reused.maxWaveUnlocked,
    survived: reused.survived,
    collapsed,
    firstStarvationDay: starveDay,
    startsDisengaged: reused.startsDisengaged,
    reusedFirstC: reusedFirst,
    reusedC: reused.candidates.c_standDownTrend,
    allCEvenings: allEvenings,
    allCEveningDays: allEvenings.map((e) => e.day),
    warnings: warnings,
    warningDays: warnings.map((e) => e.day),
    rawEveningsCount: allEvenings.length,
    warningsCount: warnings.length,
    firing: mineFirst != null,
    firstFiringDay: mineFirst,
    inTime,
    crossCheckMismatch: reusedFirst !== mineFirst,
  };
}

function medianOf(nums) {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function summarizeConfirm(allSeeds) {
  const seeds = allSeeds.map((sj) => analyzeSeedConfirm(sj));
  const survivors = seeds.filter((s) => s.survived);
  const collapsedSeeds = seeds.filter((s) => s.collapsed);
  const firingSurvivors = survivors.filter((s) => s.firing);
  const rate = survivors.length === 0 ? null : firingSurvivors.length / survivors.length;
  const firingSeeds = seeds.filter((s) => s.firing);
  const rawCounts = firingSeeds.map((s) => s.rawEveningsCount);
  const warnCounts = firingSeeds.map((s) => s.warningsCount);
  const mismatches = seeds.filter((s) => s.crossCheckMismatch).map((s) => s.seed);
  return {
    seeds,
    survivorCount: survivors.length,
    collapsedSeeds: collapsedSeeds.map((s) => s.seed),
    firingSurvivorSeeds: firingSurvivors.map((s) => s.seed),
    firingSurvivorCount: firingSurvivors.length,
    firingSurvivorRate: rate,
    firingSeeds: firingSeeds.map((s) => s.seed),
    eveningsPerFiringSeed: {
      rawCounts,
      rawMean: rawCounts.length === 0 ? null : rawCounts.reduce((a, b) => a + b, 0) / rawCounts.length,
      rawMedian: medianOf(rawCounts),
      rawMax: rawCounts.length === 0 ? null : Math.max(...rawCounts),
      warningCounts: warnCounts,
      warningMean: warnCounts.length === 0 ? null : warnCounts.reduce((a, b) => a + b, 0) / warnCounts.length,
      warningMax: warnCounts.length === 0 ? null : Math.max(...warnCounts),
    },
    crossCheckMismatches: mismatches,
  };
}

// Verdict exactly per the confirm prereg. Evenings texture is
// reported, never a bar, so it plays no part here.
function confirmVerdict(summary) {
  if (summary.crossCheckMismatches.length > 0) return 'INSUFFICIENT-DATA';
  if (summary.survivorCount === 0) return 'INSUFFICIENT-DATA';
  if (summary.firingSurvivorRate == null || summary.firingSurvivorRate > 0.25) return 'FAIL';
  for (const s of summary.seeds) {
    if (!s.collapsed) continue;
    if (s.firstFiringDay == null || s.inTime !== true) return 'FAIL';
  }
  return 'PASS';
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    const summary = summarizeConfirm(seeds);
    summary.verdict = confirmVerdict(summary);
    process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  });
}

module.exports = {
  TREND_FRACTION, ELIGIBLE_DAY,
  allCEvenings, warningsForSeed, analyzeSeedConfirm,
  summarizeConfirm, confirmVerdict, medianOf,
};
