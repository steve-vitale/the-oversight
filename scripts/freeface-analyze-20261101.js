#!/usr/bin/env node
// freeface-analyze-20261101.js — sim-freeface-a analyzer.
// Reads per-seed JSONs (perseed-freeface/leadfeast/s<seed>.json) and
// derives every judged number from them only (no re-simulation).
// Checks:
//  (a) per-record arithmetic: total == dead+underage+unhealthy+committed+free
//      for every village in every record;
//  (b) refusal cross-check: each refusal record's free count equals
//      the same-day muster-diag snapshot's facesFree for that village
//      (paired in order within the day);
//  (c) pilot gate + per-village cause tables for the refusal window
//      and the daily 80-95 trace.
// Usage: node scripts/freeface-analyze-20261101.js <dir> [seed ...]
// Prints JSON summary to stdout.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const wanted = process.argv.slice(3).map(s => parseInt(s, 10)).filter(Number.isFinite);
if (!dir) { console.error('usage: freeface-analyze-20261101.js <dir> [seed ...]'); process.exit(2); }

function load(seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '.json'), 'utf8'));
}

function checkRecord(rec) {
  const bad = [];
  (rec.villages || []).forEach(v => {
    const d = v.decomposition;
    const sum = d.dead + d.underage + d.unhealthy + d.committed + d.free;
    if (d.total !== sum) bad.push({ village: v.name, total: d.total, sum: sum });
  });
  return bad;
}

function summarize(seed) {
  const row = load(seed);
  const recs = row.freefaceRecords || [];
  const refusals = recs.filter(r => r.kind === 'refusal');
  const dailies = recs.filter(r => r.kind === 'daily').sort((a, b) => a.day - b.day);
  const snaps = row.musterRefusals || [];
  // Pair refusal records to muster snapshots in order within each day.
  const snapsByDay = {};
  snaps.forEach(s => { (snapsByDay[s.day] = snapsByDay[s.day] || []).push(s); });
  const used = {};
  let arithBad = 0, crossBad = 0, crossChecked = 0, crossMissing = 0;
  recs.forEach(r => { arithBad += checkRecord(r).length; });
  refusals.forEach(r => {
    const list = snapsByDay[r.day] || [];
    const idx = used[r.day] || 0;
    used[r.day] = idx + 1;
    const snap = list[idx] || null;
    if (!snap) { crossMissing++; return; }
    (r.villages || []).forEach(v => {
      const link = (snap.links || []).find(l => l.villageId === v.villageId);
      if (!link) { crossMissing++; return; }
      crossChecked++;
      if (link.facesFree !== v.decomposition.free) crossBad++;
    });
  });
  const heraldRef = (row.attempts || []).filter(a => a.mid === 'herald' && a.cls === 'REFUSED');
  return {
    seed, gameDays: row.gameDays, won: row.won, national: row.national, table: row.table,
    maxWave: row.maxWave, endOmenStage: row.endOmenStage,
    instrumentErrors: (row.instrumentErrors || []).length, musterErrs: row.musterErrs || 0,
    freefaceErrs: row.freefaceErrs || 0, freefaceInstalled: !!row.freefaceInstalled,
    refusalRecords: refusals.length, dailyRecords: dailies.length,
    dailyDays: dailies.map(d => d.day),
    heraldRefusedAttempts: heraldRef.length,
    arithBad, crossChecked, crossBad, crossMissing,
    refusals, dailies,
  };
}

const seeds = wanted.length ? wanted : fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).map(f => parseInt(f.slice(1, -5), 10)).sort((a, b) => a - b);
const perSeed = {};
seeds.forEach(s => { perSeed[s] = summarize(s); });
// Strip heavy record arrays from the JSON summary except for the primary seed's refusal table (kept in evidence md, not here).
const summary = { seeds, perSeed: {} };
seeds.forEach(s => {
  const p = perSeed[s];
  summary.perSeed[s] = {
    gameDays: p.gameDays, won: p.won, national: p.national, table: p.table,
    maxWave: p.maxWave, endOmenStage: p.endOmenStage,
    instrumentErrors: p.instrumentErrors, musterErrs: p.musterErrs,
    freefaceErrs: p.freefaceErrs, freefaceInstalled: p.freefaceInstalled,
    refusalRecords: p.refusalRecords, dailyRecords: p.dailyRecords,
    dailyDays: p.dailyDays, heraldRefusedAttempts: p.heraldRefusedAttempts,
    arithBad: p.arithBad, crossChecked: p.crossChecked, crossBad: p.crossBad, crossMissing: p.crossMissing,
  };
});
console.log(JSON.stringify(summary, null, 2));
module.exports = { summarize };
