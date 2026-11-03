#!/usr/bin/env node
// wave5encounter-analyze-20261103.js — aggregate the wave-5
// faced-wall corpus (evidence/2026-11-03/
// perseed-w5faced-a/w5-*.json) into per-stage counts per
// seed, the named bottleneck, and descriptive wall numbers.
// Read-only: prints to stdout, writes nothing.
// Usage: node scripts/wave5encounter-analyze-20261103.js [glob-dir]
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-03', 'perseed-w5faced-a');

function w5(rows) { return (rows || []).filter(function (r) { return r.wave === 5; }); }
function countBy(rows, key) {
  const out = {};
  for (const r of (rows || [])) { const k = String(r[key] == null ? 'null' : r[key]); out[k] = (out[k] || 0) + 1; }
  return out;
}
function median(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const files = fs.readdirSync(DIR).filter(function (f) { return f.endsWith('.json'); }).sort();
if (!files.length) { console.error('WAVE5ENCOUNTER-ANALYZE: no per-seed files in ' + DIR); process.exit(2); }
const perSeed = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const daily = r.daily || [];
  let unlockDay = null, unlockSnap = null;
  for (const d of daily) {
    if ((d.unlocked || 0) >= 5) { unlockDay = d.day; unlockSnap = d; break; }
  }
  const unlockDays = daily.filter(function (d) { return (d.unlocked || 0) >= 5; }).length;
  const postUnlockTargets = unlockDay == null ? 0 : (r.targetRows || []).filter(function (x) { return x.day >= unlockDay; }).length;
  const postUnlockTargetW5 = unlockDay == null ? 0 : (r.targetRows || []).filter(function (x) { return x.day >= unlockDay && x.target === 5; }).length;
  const targetW5 = (r.targetRows || []).filter(function (x) { return x.target === 5; });
  const spawnW5 = w5(r.spawnRows);
  const castW5 = w5(r.castRows);
  const triggerW5 = w5(r.triggerRows);
  const startW5 = w5(r.startRows);
  const fieldW5 = w5(r.fieldRows);
  const removeW5 = w5(r.removeRows);
  // Closest approach per spawned w4 instance (join daily worldW4 by spawnSeq).
  const closest = {};
  for (const d of daily) {
    for (const m of (d.worldW5 || [])) {
      if (m.spawnSeq == null || m.distPlayer == null) continue;
      if (closest[m.spawnSeq] == null || m.distPlayer < closest[m.spawnSeq]) closest[m.spawnSeq] = m.distPlayer;
    }
  }
  const closestVals = Object.keys(closest).map(function (k) { return closest[k]; });
  const wanderW5Days = daily.filter(function (d) { return d.wanderer && d.wanderer.wave === 5; }).length;
  const last = daily[daily.length - 1] || {};
  perSeed.push({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won,
    scaleRank: r.scaleRank, maxWave: r.maxWave, tableLatch: r.tableLatch,
    tableWaiting: r.tableWaiting, tableDone: r.tableDone,
    seat: r.tableSeat, gateW4: r.endGate ? r.endGate.w4 : null,
    gateW5: r.endGate ? r.endGate.w5 : null,
    unlockDay: unlockDay, unlockDays: unlockDays,
    unlockStanding: unlockSnap ? unlockSnap.standing : null,
    unlockReadiness5: unlockSnap ? unlockSnap.readiness5 : null,
    unlockFacedW4: unlockSnap ? (unlockSnap.facedW4 || []) : null,
    poolW5AtUnlock: unlockSnap ? unlockSnap.poolW5 : null,
    poolW5AtEnd: last.poolW5 || null,
    targetW5: targetW5.length, targetByPoolTop: countBy(targetW5, 'poolTop'),
    postUnlockTargets: postUnlockTargets, postUnlockTargetW5: postUnlockTargetW5,
    castW5: castW5.length, castW5Ids: countBy(castW5, 'id'),
    spawnW5: spawnW5.length, spawnByCaller: countBy(spawnW5, 'caller'),
    spawnDistPlayer: spawnW5.map(function (s) { return s.distPlayer; }),
    spawnDistHome: spawnW5.map(function (s) { return s.distHome; }),
    wanderW5Days: wanderW5Days,
    triggerW5: triggerW5.length, startW5: startW5.length,
    fieldW5: fieldW5.length, fieldOutcomes: countBy(fieldW5, 'outcome'),
    removeW5: removeW5.length, removeByCaller: countBy(removeW5, 'caller'),
    removeByCls: countBy(removeW5, 'cls'),
    facedW5End: last.facedW5 || [],
    facedW4End: last.facedW4 || [],
    closestApproach: closestVals, closestMin: closestVals.length ? Math.min.apply(null, closestVals) : null,
    instrumentErrors: (r.instrumentErrors || []).length,
    file: f,
  });
}

for (const s of perSeed) console.log(JSON.stringify(s, null, 2));
const tot = function (k) { return perSeed.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
const unlocked = perSeed.filter(function (s) { return s.unlockDay != null; });
const fought = perSeed.filter(function (s) { return (s.facedW5End && s.facedW5End.length) || s.startW5 > 0 || s.fieldW5 > 0; });
console.log('=== AGGREGATE ===');
console.log(JSON.stringify({
  seeds: perSeed.length,
  unlockedW5: unlocked.length, unlockDays: perSeed.map(function (s) { return s.unlockDay; }),
  targetW5: tot('targetW5'), castW5: tot('castW5'), spawnW5: tot('spawnW5'),
  triggerW5: tot('triggerW5'), startW5: tot('startW5'), fieldW5: tot('fieldW5'),
  removeW5: tot('removeW5'),
  foughtW5Seeds: fought.map(function (s) { return s.seed; }),
  national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
  tableLatch: perSeed.filter(function (s) { return s.tableLatch; }).length,
  won: perSeed.filter(function (s) { return s.won; }).length,
  maxWave4: perSeed.filter(function (s) { return s.maxWave >= 4; }).length,
  maxWave5: perSeed.filter(function (s) { return s.maxWave >= 5; }).length,
  tableWaiting: perSeed.filter(function (s) { return s.tableWaiting; }).length,
  tableDone: perSeed.filter(function (s) { return s.tableDone; }).length,
  medianDays: median(perSeed.map(function (s) { return s.days; })),
  daysList: perSeed.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; }),
}, null, 2));
