#!/usr/bin/env node
// spearvolley-analyze-20261110.js — sim-spearvolley-b wild-leg analyzer.
// Reads finishersize-driver per-seed JSONs (one leg dir) and reports the
// wild-leg measures the prereg binds: volley-carrying wave>=4 field rows
// and volley rate, field wave-4 kills, below-break meetings/kills,
// field-fighter deaths, scholar deaths, starvation deaths (teleDeaths
// cause 'starvation', totals + scholar-only), veterans banked (peak and
// end living veterans from daily readiness5 snapshots), wave-4/5 unlocks,
// wave-5 kills, standing, rank, median survival.
// Usage: node scripts/spearvolley-analyze-20261110.js <leg-dir> [leg-dir...]
// Prints one JSON object per leg dir.
'use strict';
const fs = require('fs');
const path = require('path');

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => path.join(dir, f)).sort();
  if (!files.length) { console.error('SPEARVOLLEY-ANALYZE STOP: no JSON in ' + dir); process.exit(2); }
  const jsons = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  const perSeed = [];
  let w4field = 0, volleyRows = 0, volleyShots = 0, volleyDmg = 0;
  let belowBreak = 0, belowBreakKills = 0, fieldDeaths = 0, scholarDeaths = 0;
  let starvTotal = 0, starvScholar = 0, w4killsAll = 0, w5kills = 0;
  let w4unlock = 0, w5unlock = 0, wins = 0, national = 0, table = 0;
  const survivals = [];
  for (const j of jsons) {
    const ff = j.fieldFights || [];
    const w4 = ff.filter(r => (r.wave | 0) >= 4);
    const vr = w4.filter(r => r.volley && (r.volley.shots | 0) > 0);
    w4field += w4.length;
    volleyRows += vr.length;
    for (const r of vr) { volleyShots += (r.volley.shots | 0); volleyDmg += (r.volley.dmg | 0); }
    const bb = w4.filter(r => (r.entryFrac != null && r.entryFrac < 0.15) || r.fsMetBelowBreak);
    belowBreak += bb.length;
    belowBreakKills += bb.filter(r => r.outcome === 'vKill').length;
    fieldDeaths += w4.filter(r => r.outcome === 'vDie').length;
    scholarDeaths += (j.scholarDeaths || []).length;
    for (const d of (j.teleDeaths || [])) {
      // One instrument, one count: teleDeaths cause 'starvation';
      // player:true marks the scholar bearer. (scholarDeaths causeArg is
      // a second instrument on the same deaths — not added here.)
      if (d.cause === 'starvation') { starvTotal++; if (d.player) starvScholar++; }
    }
    w4killsAll += (j.waveKillLog || []).filter(e => (e.w | 0) >= 4).length;
    w5kills += (j.waveKillLog || []).filter(e => (e.w | 0) >= 5).length;
    if ((j.maxWave | 0) >= 4) w4unlock++;
    if ((j.maxWave | 0) >= 5) w5unlock++;
    if (j.won) wins++;
    if (String(j.scaleRank || '').toLowerCase().indexOf('national') >= 0) national++;
    if (j.tableSat || j.satTable) table++;
    survivals.push(j.days | 0);
    const daily = j.daily || [];
    let peakVet = 0, endVet = 0;
    for (const d of daily) { const v = ((d.readiness5 || {}).veterans | 0); if (v > peakVet) peakVet = v; }
    if (daily.length) endVet = ((daily[daily.length - 1].readiness5 || {}).veterans | 0);
    perSeed.push({ seed: j.seed, days: j.days, end: j.endReason, maxWave: j.maxWave,
      standing: j.standing, scaleRank: j.scaleRank, w4field: w4.length,
      volleyRows: vr.length, w4kills: (j.waveKillLog || []).filter(e => (e.w | 0) >= 4).length,
      scholarDeaths: (j.scholarDeaths || []).length, peakVeterans: peakVet, endVeterans: endVet,
      readiness5: j.readiness5 || null });
  }
  return { leg: path.basename(dir), seeds: jsons.length,
    w4field, volleyRows, volleyShots, volleyDmg,
    volleyRate: w4field ? volleyRows / w4field : null,
    belowBreak, belowBreakKills, fieldFighterDeaths: fieldDeaths,
    scholarDeaths, starvationTotal: starvTotal, starvationScholar: starvScholar,
    w4killsAllChannels: w4killsAll, w5kills,
    w4unlock, w5unlock, wins, national, table,
    medianSurvival: median(survivals), maxSurvival: survivals.length ? Math.max.apply(null, survivals) : null,
    perSeed };
}

const dirs = process.argv.slice(2);
if (!dirs.length) { console.error('Usage: node scripts/spearvolley-analyze-20261110.js <leg-dir> [leg-dir...]'); process.exit(2); }
for (const d of dirs) console.log(JSON.stringify(analyzeDir(d), null, 2));
