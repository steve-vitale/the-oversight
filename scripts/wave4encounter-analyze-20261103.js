#!/usr/bin/env node
// wave4encounter-analyze-20261103.js — aggregate the wave-4
// encounter-opportunity pilot corpus (evidence/2026-11-02/
// perseed-wave4encounter-diag/w4-*.json) into per-stage counts per
// seed, the named bottleneck, and descriptive wall numbers.
// Read-only: prints to stdout, writes nothing.
// Usage: node scripts/wave4encounter-analyze-20261103.js [glob-dir]
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-02', 'perseed-wave4encounter-diag');

function w4(rows) { return (rows || []).filter(function (r) { return r.wave === 4; }); }
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
if (!files.length) { console.error('WAVE4ENCOUNTER-ANALYZE: no per-seed files in ' + DIR); process.exit(2); }
const perSeed = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const daily = r.daily || [];
  let unlockDay = null, unlockSnap = null;
  for (const d of daily) {
    if ((d.unlocked || 0) >= 4) { unlockDay = d.day; unlockSnap = d; break; }
  }
  const unlockDays = daily.filter(function (d) { return (d.unlocked || 0) >= 4; }).length;
  const targetW4 = w4(r.targetRows);
  const spawnW4 = w4(r.spawnRows);
  const castW4 = w4(r.castRows);
  const triggerW4 = w4(r.triggerRows);
  const startW4 = w4(r.startRows);
  const fieldW4 = w4(r.fieldRows);
  const removeW4 = w4(r.removeRows);
  // Closest approach per spawned w4 instance (join daily worldW4 by spawnSeq).
  const closest = {};
  for (const d of daily) {
    for (const m of (d.worldW4 || [])) {
      if (m.spawnSeq == null || m.distPlayer == null) continue;
      if (closest[m.spawnSeq] == null || m.distPlayer < closest[m.spawnSeq]) closest[m.spawnSeq] = m.distPlayer;
    }
  }
  const closestVals = Object.keys(closest).map(function (k) { return closest[k]; });
  const wanderW4Days = daily.filter(function (d) { return d.wanderer && d.wanderer.wave === 4; }).length;
  const last = daily[daily.length - 1] || {};
  perSeed.push({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won,
    scaleRank: r.scaleRank, maxWave: r.maxWave, tableLatch: r.tableLatch,
    seat: r.tableSeat, gateW4: r.endGate ? r.endGate.w4 : null,
    gateW5: r.endGate ? r.endGate.w5 : null,
    unlockDay: unlockDay, unlockDays: unlockDays,
    unlockStanding: unlockSnap ? unlockSnap.standing : null,
    unlockReadiness: unlockSnap ? unlockSnap.readiness4 : null,
    poolW4AtUnlock: unlockSnap ? unlockSnap.poolW4 : null,
    targetW4: targetW4.length, targetByPoolTop: countBy(targetW4, 'poolTop'),
    castW4: castW4.length, castW4Ids: countBy(castW4, 'id'),
    spawnW4: spawnW4.length, spawnByCaller: countBy(spawnW4, 'caller'),
    spawnDistPlayer: spawnW4.map(function (s) { return s.distPlayer; }),
    spawnDistHome: spawnW4.map(function (s) { return s.distHome; }),
    wanderW4Days: wanderW4Days,
    triggerW4: triggerW4.length, startW4: startW4.length,
    fieldW4: fieldW4.length, fieldOutcomes: countBy(fieldW4, 'outcome'),
    removeW4: removeW4.length, removeByCaller: countBy(removeW4, 'caller'),
    removeByCls: countBy(removeW4, 'cls'),
    facedW4End: last.facedW4 || [],
    closestApproach: closestVals, closestMin: closestVals.length ? Math.min.apply(null, closestVals) : null,
    instrumentErrors: (r.instrumentErrors || []).length,
    file: f,
  });
}

for (const s of perSeed) console.log(JSON.stringify(s, null, 2));
const tot = function (k) { return perSeed.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
const unlocked = perSeed.filter(function (s) { return s.unlockDay != null; });
const fought = perSeed.filter(function (s) { return (s.facedW4End && s.facedW4End.length) || s.startW4 > 0 || s.fieldW4 > 0; });
console.log('=== AGGREGATE ===');
console.log(JSON.stringify({
  seeds: perSeed.length,
  unlockedW4: unlocked.length, unlockDays: perSeed.map(function (s) { return s.unlockDay; }),
  targetW4: tot('targetW4'), castW4: tot('castW4'), spawnW4: tot('spawnW4'),
  triggerW4: tot('triggerW4'), startW4: tot('startW4'), fieldW4: tot('fieldW4'),
  removeW4: tot('removeW4'),
  foughtW4Seeds: fought.map(function (s) { return s.seed; }),
  national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
  tableLatch: perSeed.filter(function (s) { return s.tableLatch; }).length,
  won: perSeed.filter(function (s) { return s.won; }).length,
  maxWave4: perSeed.filter(function (s) { return s.maxWave >= 4; }).length,
  maxWave5: perSeed.filter(function (s) { return s.maxWave >= 5; }).length,
  medianDays: median(perSeed.map(function (s) { return s.days; })),
  daysList: perSeed.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; }),
}, null, 2));
