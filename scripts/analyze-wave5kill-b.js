// analyze-wave5kill-b.js — wave-5 killing DIAG for sim-wave5kill-b.
// Decomposes the gorgeprice2 CONFIRM corpora (commit 740838f3c) per
// seed into wave-5 faced / killed / died, per the binding prereg
// evidence/2026-11-15/sim-wave5kill-b-prereg.md. The corpus carries NO
// per-encounter records, so the classification is PER SEED:
//   LOCKED           — wave 5 never unlocked (maxWave < 5, no event)
//   NEVER-FACED      — unlocked, distinct wave-5 types faced = 0
//   FACED-NOT-KILLED — unlocked, faced > 0, wave-5 kills = 0
//   KILLED           — unlocked, wave-5 kills > 0
// Series w1..w5 are cumulative DISTINCT types faced per wave (the
// deed-feed counts); waveKills['5'] is total wave-5 kills; deaths
// with `who` in the wave-5 id set are deaths TO a wave-5 monster.
// Read-only; prints JSON to stdout when run as a script.
// Usage: node scripts/analyze-wave5kill-b.js <control-dir> <armed-dir>
'use strict';
const fs = require('fs');
const path = require('path');

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Frozen wave-5 id set, per the prereg (from src/data/monsters.json).
// loadWave5Ids() re-reads the data file so the proof test can assert
// the frozen set still matches the roster exactly.
var W5_IDS = ['cancellation', 'editor', 'rerun', 'spoiler', 'timeslot',
  'nielsen', 'finale', 'finale_crew', 'finale_opening', 'network_note'];
function loadWave5Ids(monstersPath) {
  const raw = JSON.parse(fs.readFileSync(monstersPath, 'utf8'));
  const list = raw.monsters || raw;
  return list.filter(function (m) { return m.wave === 5; })
    .map(function (m) { return m.id; }).sort();
}

function seriesAt(series, day) {
  let best = null;
  for (const r of series || []) {
    if (r.d <= day) best = r;
    else break;
  }
  return best;
}

// classifySeed(d, w5set) — one per-seed corpus file. Returns a record
// with `cls` in LOCKED / NEVER-FACED / FACED-NOT-KILLED / KILLED and
// `errors` (instrument problems; an UNCLASSIFIED seed is one whose
// fields contradict each other — see the prereg's guard list).
function classifySeed(d, w5set) {
  const errors = [];
  const seed = d.seed;
  if (!Array.isArray(d.series) || !d.series.length) errors.push('no-series');
  if (!d.waveKills || typeof d.waveKills !== 'object') errors.push('no-waveKills');
  if (Array.isArray(d.instrumentErrors) && d.instrumentErrors.length) {
    errors.push('instrumentErrors:' + d.instrumentErrors.length);
  }
  const ev = (d.events || []).filter(function (e) {
    return e.kind === 'unlockedWave' && e.wave === 5;
  });
  const unlockDay = ev.length ? ev[0].day : null;
  const unlockedByEvent = unlockDay !== null;
  const unlockedByMax = (d.maxWave || 0) >= 5;
  if (unlockedByMax && !unlockedByEvent) errors.push('maxWave5-no-unlock-event');
  const unlocked = unlockedByEvent || unlockedByMax;
  const series = (d.series || []).slice().sort(function (a, b) { return a.d - b.d; });
  const last = series.length ? series[series.length - 1] : null;
  const facedDistinct = last ? (last.w5 || 0) : 0;
  let firstFacedDay = null;
  for (const r of series) {
    if ((r.w5 || 0) > 0) { firstFacedDay = r.d; break; }
  }
  const kills = (d.waveKills && d.waveKills['5']) || 0;
  const deathsW5 = (d.deaths || []).filter(function (x) {
    return w5set.has(x.who);
  });
  const deathsW5Scholar = deathsW5.filter(function (x) { return x.player; }).length;
  const deathsW5Villager = deathsW5.length - deathsW5Scholar;
  if (kills > 0 && !unlocked) errors.push('kills-without-unlock');
  if (firstFacedDay !== null && unlockDay !== null && firstFacedDay < unlockDay) {
    errors.push('faced-before-unlock');
  }
  if (facedDistinct > 0 && firstFacedDay === null) errors.push('faced-no-first-day');
  let cls;
  if (!unlocked) cls = 'LOCKED';
  else if (facedDistinct === 0) cls = 'NEVER-FACED';
  else if (kills === 0) cls = 'FACED-NOT-KILLED';
  else cls = 'KILLED';
  // Veteran attrition: vet5 (living wave-4+ killers) at unlock, at
  // first faced, at end; readiness days after unlock; dominant short bar.
  let vet5AtUnlock = null, vet5AtFirstFaced = null, vet5AtEnd = null;
  let readyDaysAfterUnlock = 0, shortDaysAfterUnlock = 0;
  const shortCounts = {};
  if (unlocked && unlockDay !== null) {
    const atUnlock = seriesAt(series, unlockDay);
    vet5AtUnlock = atUnlock ? (atUnlock.vet5 || 0) : null;
    if (firstFacedDay !== null) {
      const atFaced = seriesAt(series, firstFacedDay);
      vet5AtFirstFaced = atFaced ? (atFaced.vet5 || 0) : null;
    }
    for (const r of series) {
      if (r.d < unlockDay) continue;
      if (r.rd5ready) readyDaysAfterUnlock += 1;
      const sh = r.rd5short;
      if (Array.isArray(sh) && sh.length) {
        shortDaysAfterUnlock += 1;
        const key = sh.slice().sort().join('+');
        shortCounts[key] = (shortCounts[key] || 0) + 1;
      }
    }
  }
  if (last) vet5AtEnd = last.vet5 || 0;
  let dominantShort = null, dominantShortDays = 0;
  Object.keys(shortCounts).forEach(function (k) {
    if (shortCounts[k] > dominantShortDays) {
      dominantShort = k; dominantShortDays = shortCounts[k];
    }
  });
  return {
    seed: seed, cls: cls, errors: errors,
    unlocked: unlocked, unlockDay: unlockDay,
    firstFacedDay: firstFacedDay, facedDistinct: facedDistinct,
    kills: kills,
    deathsW5: deathsW5.length,
    deathsW5Scholar: deathsW5Scholar,
    deathsW5Villager: deathsW5Villager,
    vet5AtUnlock: vet5AtUnlock, vet5AtFirstFaced: vet5AtFirstFaced,
    vet5AtEnd: vet5AtEnd,
    readyDaysAfterUnlock: readyDaysAfterUnlock,
    shortDaysAfterUnlock: shortDaysAfterUnlock,
    dominantShort: dominantShort, dominantShortDays: dominantShortDays,
    days: d.days, endReason: d.endReason,
    maxWave: d.maxWave
  };
}

// analyzeLeg(dir, w5set) — one corpus dir. Returns { perSeed, pooled }.
function analyzeLeg(dir, w5set) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const perSeed = [];
  let parseErrors = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { parseErrors += 1; continue; }
    perSeed.push(classifySeed(d, w5set));
  }
  const unlocked = perSeed.filter(function (s) { return s.unlocked; });
  const classes = { LOCKED: 0, 'NEVER-FACED': 0, 'FACED-NOT-KILLED': 0, KILLED: 0 };
  perSeed.forEach(function (s) { classes[s.cls] += 1; });
  const totKills = unlocked.reduce(function (a, s) { return a + s.kills; }, 0);
  const totDeathsW5 = unlocked.reduce(function (a, s) { return a + s.deathsW5; }, 0);
  const totDeathsW5Scholar = unlocked.reduce(function (a, s) { return a + s.deathsW5Scholar; }, 0);
  const facedVillages = unlocked.filter(function (s) { return s.facedDistinct > 0; }).length;
  const pooled = {
    seeds: perSeed.length, files: files.length, parseErrors: parseErrors,
    unlocked: unlocked.length, classes: classes,
    totalKills: totKills,
    killsPerUnlocked: unlocked.length ? +(totKills / unlocked.length).toFixed(2) : null,
    killsPerFaced: facedVillages ? +(totKills / facedVillages).toFixed(2) : null,
    totalDeathsW5: totDeathsW5,
    deathsW5Scholar: totDeathsW5Scholar,
    deathsW5Villager: totDeathsW5 - totDeathsW5Scholar,
    killDeathRatio: totDeathsW5 ? +(totKills / totDeathsW5).toFixed(2) : null,
    medianSurvivalUnlocked: med(unlocked.map(function (s) { return s.days; })),
    medianSurvivalAll: med(perSeed.map(function (s) { return s.days; })),
    instrumentErrors: perSeed.reduce(function (a, s) { return a + s.errors.length; }, 0),
    unclassified: perSeed.filter(function (s) { return s.errors.length > 0; }).length
  };
  return { perSeed: perSeed, pooled: pooled };
}

const isMain = require.main === module;
if (isMain) {
  const controlDir = process.argv[2];
  const armedDir = process.argv[3];
  if (!controlDir || !armedDir) {
    console.error('usage: node scripts/analyze-wave5kill-b.js <control-dir> <armed-dir>');
    process.exit(2);
  }
  const monstersPath = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
  const w5set = new Set(loadWave5Ids(monstersPath));
  const out = {
    control: analyzeLeg(controlDir, w5set),
    armed: analyzeLeg(armedDir, w5set)
  };
  console.log(JSON.stringify(out, null, 2));
}

module.exports = {
  W5_IDS: W5_IDS, loadWave5Ids: loadWave5Ids,
  classifySeed: classifySeed, analyzeLeg: analyzeLeg, med: med
};
