'use strict';
// analyze-hurthome-fix-a.js — per-cell pooled tables for sim-hurthome-fix-a.
// Usage:
//   node scripts/analyze-hurthome-fix-a.js --dir evidence/2026-11-04/perseed-hurthome-fix-a --cell baseline
//   node scripts/analyze-hurthome-fix-a.js --compare  (both cells, matched seeds)
// Reads the per-seed JSONs written by scripts/sweep-hurthome-fix-a.js.
// Splits TRIPS vs WALK-OUTS (purpose 'leave') always; never pools them.
// Reports BOTH rates for trips: come-home (returned / all trip episodes)
// and conditional turn-home (same+next-day / returned trip episodes).
// Exits non-zero on any instrument error or unclassified episode.
const fs = require('fs');
const path = require('path');

const arg = (name) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? null : process.argv[i + 1];
};

function loadCell(dir, cell) {
  const files = fs.readdirSync(dir).filter((f) => /^hurthome-fix-a-competent-s\d+-.+?\.json$/.test(f) && f.endsWith(`-${cell}.json`)).sort();
  const rows = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  return rows;
}

function summarize(rows, cell) {
  let errors = 0;
  let unclassified = 0;
  const eps = [];
  for (const r of rows) {
    errors += (r.errors || []).length;
    for (const ep of (r.episodes || [])) {
      if (!ep.bucket) unclassified += 1;
      eps.push(Object.assign({ seed: r.seed }, ep));
    }
  }
  const split = (list) => {
    const trips = list.filter((e) => e.purpose !== 'leave');
    const walks = list.filter((e) => e.purpose === 'leave');
    const tab = (xs) => {
      const ret = xs.filter((e) => e.outcome === 'returned');
      const died = xs.filter((e) => e.outcome === 'died');
      const same = ret.filter((e) => e.bucket === 'turn-home-same-day').length;
      const next = ret.filter((e) => e.bucket === 'turn-home-next-day').length;
      const stayed = xs.filter((e) => e.bucket === 'stayed-out-3plus').length;
      const cens = xs.filter((e) => e.bucket === 'censored-early').length;
      return {
        n: xs.length, returned: ret.length, died: died.length,
        comeHome: xs.length ? ret.length / xs.length : null,
        condTurnHome: ret.length ? (same + next) / ret.length : null,
        same, next, stayed, censoredEarly: cens,
        diedShare: xs.length ? died.length / xs.length : null,
        hurtTriggered: ret.filter((e) => e.hurtTriggered).length,
      };
    };
    return { all: tab(list), trips: tab(trips), walks: tab(walks) };
  };
  const days = rows.map((r) => r.daysAlive).sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : null;
  const survived = rows.filter((r) => r.daysAlive >= 100).length;
  const mealLines = rows.reduce((n, r) => n + (r.hurtMealLineCount || 0), 0);
  const deaths = rows.reduce((n, r) => n + (r.deaths || []).length, 0);
  const maxWave = rows.reduce((m, r) => Math.max(m, r.maxWave || 1), 1);
  const national = rows.filter((r) => r.national).length;
  const wins = rows.filter((r) => r.win).length;
  const hurtLines = [];
  for (const r of rows) {
    for (const t of (r.transcript || [])) {
      if (/returns from the wilds hurt/i.test(t.line)) hurtLines.push({ seed: r.seed, day: t.day, part: t.part, line: t.line });
    }
  }
  return { cell, seeds: rows.map((r) => r.seed), nSeeds: rows.length,
    errors, unclassified, episodes: split(eps), daysAliveMedian: median,
    survived, mealLines, deaths, maxWave, national, wins, hurtLines };
}

function main() {
  const dir = arg('dir') || path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-hurthome-fix-a');
  if (process.argv.includes('--compare')) {
    const b = summarize(loadCell(dir, 'baseline'), 'baseline');
    const a = summarize(loadCell(dir, 'armed'), 'armed');
    const matched = b.seeds.filter((s) => a.seeds.includes(s));
    const lift = (a.episodes.trips.comeHome != null && b.episodes.trips.comeHome != null)
      ? a.episodes.trips.comeHome - b.episodes.trips.comeHome : null;
    console.log(JSON.stringify({ matchedSeeds: matched, baseline: b, armed: a,
      tripComeHomeLift: lift,
      tripDiedShareDelta: (a.episodes.trips.diedShare != null && b.episodes.trips.diedShare != null)
        ? a.episodes.trips.diedShare - b.episodes.trips.diedShare : null,
      medianDaysDelta: (a.daysAliveMedian != null && b.daysAliveMedian != null)
        ? a.daysAliveMedian - b.daysAliveMedian : null,
      survivedDelta: a.survived - b.survived }, null, 1));
    if (b.errors || a.errors || b.unclassified || a.unclassified) {
      console.error('INSTRUMENT DIRTY: errors/unclassified non-zero');
      process.exit(2);
    }
    return;
  }
  const cell = arg('cell');
  if (!cell) { console.error('need --cell baseline|armed or --compare'); process.exit(2); }
  const s = summarize(loadCell(dir, cell), cell);
  console.log(JSON.stringify(s, null, 1));
  if (s.errors || s.unclassified) { console.error('INSTRUMENT DIRTY'); process.exit(2); }
}

if (require.main === module) main();
module.exports = { summarize, loadCell };
