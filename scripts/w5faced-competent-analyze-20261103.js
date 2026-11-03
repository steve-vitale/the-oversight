#!/usr/bin/env node
// w5faced-competent-analyze-20261103.js — aggregate the competent-policy
// wave-5-fought corpus (evidence/2026-11-03/perseed-w5faced-competent-a/)
// into per-seed chains and population rates. Read-only: prints to stdout,
// writes nothing. CampaignOnly spawns are split out of fight-candidate
// spawns; player-TB kills are joined tbEnd->start by fightSeq (pre-call
// fighter snapshot: a monster fighter of the start id dead at tbEnd
// capture, result won/routed); field kills are fieldFight outcomes
// 'vKill'. Headline rates use ALL runs as denominator; conditional rates
// are labeled as such.
// Usage: node scripts/w5faced-competent-analyze-20261103.js [glob-dir]
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-03', 'perseed-w5faced-competent-a');

function w5(rows) { return (rows || []).filter(function (r) { return r.wave === 5; }); }
function countBy(rows, key) {
  const out = {};
  for (const r of (rows || [])) {
    const v = (typeof key === 'function') ? key(r) : r[key];
    const k = String(v == null ? 'null' : v);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}
function median(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const files = fs.readdirSync(DIR).filter(function (f) { return f.endsWith('.json'); }).sort();
if (!files.length) { console.error('W5FACED-COMPETENT-ANALYZE: no per-seed files in ' + DIR); process.exit(2); }
const perSeed = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const daily = r.daily || [];
  let unlockDay = null, unlockSnap = null;
  for (const d of daily) {
    if ((d.unlocked || 0) >= 5) { unlockDay = d.day; unlockSnap = d; break; }
  }
  const last = daily[daily.length - 1] || {};
  const windowDays = unlockDay == null ? 0 : (r.days - unlockDay);
  const postUnlockTargets = unlockDay == null ? 0 : (r.targetRows || []).filter(function (x) { return x.day >= unlockDay; }).length;
  const postUnlockTargetW5 = unlockDay == null ? 0 : (r.targetRows || []).filter(function (x) { return x.day >= unlockDay && x.target === 5; }).length;
  const spawnAll = w5(r.spawnRows);
  const spawnFC = spawnAll.filter(function (x) { return !x.campaignOnly; });
  const spawnCO = spawnAll.filter(function (x) { return !!x.campaignOnly; });
  const startAll = w5(r.startRows);
  const fieldAll = w5(r.fieldRows);
  const tbAll = r.tbEndRows || [];
  // Join tbEnd rows to start rows by fightSeq (player-TB fights only).
  const startBySeq = {};
  for (const s of startAll) startBySeq[s.startSeq] = s;
  let tbJoined = 0, tbUnjoined = 0, tbKill = 0;
  const tbKillIds = [];
  for (const e of tbAll) {
    const s = (e.fightSeq != null) ? startBySeq[e.fightSeq] : null;
    if (!s) { tbUnjoined++; continue; }
    tbJoined++;
    if (e.result !== 'won' && e.result !== 'routed') continue;
    const dead = (e.fighters || []).some(function (x) { return x.id === s.id && (x.alive === false || (x.hp != null && x.hp <= 0)); });
    if (dead) { tbKill++; tbKillIds.push(s.id); }
  }
  const fieldKill = fieldAll.filter(function (x) { return x.outcome === 'vKill'; });
  const facedEnd = last.facedW5 || [];
  const removeFC = w5(r.removeRows).filter(function (x) { return !x.campaignOnly; });
  const wanderW5Days = daily.filter(function (d) { return d.wanderer && d.wanderer.wave === 5; }).length;
  const tbReadable = tbAll.filter(function (e) { return e.monsterIdReadable; }).length;
  perSeed.push({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won,
    scaleRank: r.scaleRank, maxWave: r.maxWave, tableLatch: r.tableLatch,
    tableWaiting: r.tableWaiting, tableDone: r.tableDone,
    seat: r.tableSeat, gateW4: r.endGate ? r.endGate.w4 : null,
    gateW5: r.endGate ? r.endGate.w5 : null,
    unlockDay: unlockDay, windowDays: windowDays,
    unlockStanding: unlockSnap ? unlockSnap.standing : null,
    unlockFacedW4: unlockSnap ? (unlockSnap.facedW4 || []) : null,
    poolW5AtUnlock: unlockSnap ? unlockSnap.poolW5 : null,
    poolW5AtEnd: last.poolW5 || null,
    targetCalls: (r.targetRows || []).length,
    targetW5: (r.targetRows || []).filter(function (x) { return x.target === 5; }).length,
    postUnlockTargets: postUnlockTargets, postUnlockTargetW5: postUnlockTargetW5,
    castW5: w5(r.castRows).length, castW5Ids: countBy(w5(r.castRows), 'id'),
    spawnW5All: spawnAll.length, spawnW5FightCandidate: spawnFC.length,
    spawnW5CampaignOnly: spawnCO.length,
    spawnFCByCaller: countBy(spawnFC, 'caller'),
    spawnFCDistPlayer: spawnFC.map(function (s) { return s.distPlayer; }),
    wanderW5Days: wanderW5Days,
    triggerW5: w5(r.triggerRows).length,
    startW5: startAll.length, startW5Ids: countBy(startAll, 'id'),
    fieldW5: fieldAll.length, fieldOutcomes: countBy(fieldAll, 'outcome'),
    fieldKillW5: fieldKill.length, fieldKillIds: countBy(fieldKill, 'id'),
    tbEndRows: tbAll.length, tbJoined: tbJoined, tbUnjoined: tbUnjoined,
    tbMonsterIdReadable: tbReadable, tbKillW5: tbKill, tbKillIds: countBy(tbKillIds, function (x) { return x; }),
    killsW5: tbKill + fieldKill.length,
    removeW5FC: removeFC.length, removeFCByCaller: countBy(removeFC, 'caller'),
    facedW5End: facedEnd, facedW5Count: facedEnd.length,
    distTo2: Math.max(0, 2 - facedEnd.length),
    totalSpawns: (r.spawnRows || []).length,
    wrapCounts: r.wrapCounts || null,
    instrumentErrors: (r.instrumentErrors || []).length,
    file: f,
  });
}

for (const s of perSeed) console.log(JSON.stringify(s, null, 2));
const tot = function (k) { return perSeed.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
const n = perSeed.length;
const unlocked = perSeed.filter(function (s) { return s.unlockDay != null; });
const spawned = perSeed.filter(function (s) { return s.spawnW5FightCandidate > 0; });
const faced = perSeed.filter(function (s) { return s.facedW5Count > 0; });
const fought = perSeed.filter(function (s) { return s.startW5 > 0 || s.fieldW5 > 0; });
const killed = perSeed.filter(function (s) { return s.killsW5 > 0; });
console.log('=== AGGREGATE (headline denominator = ALL runs) ===');
console.log(JSON.stringify({
  seeds: n,
  unlockedW5: unlocked.length, unlockedRate: unlocked.length + '/' + n,
  spawnFCSeeds: spawned.length, spawnFCRate: spawned.length + '/' + n,
  facedSeeds: faced.length, facedRate: faced.length + '/' + n,
  foughtSeeds: fought.length, foughtRate: fought.length + '/' + n,
  killedSeeds: killed.length, killedRate: killed.length + '/' + n,
  spawnW5All: tot('spawnW5All'), spawnW5FightCandidate: tot('spawnW5FightCandidate'),
  spawnW5CampaignOnly: tot('spawnW5CampaignOnly'),
  castW5: tot('castW5'), triggerW5: tot('triggerW5'),
  startW5: tot('startW5'), fieldW5: tot('fieldW5'),
  tbKillW5: tot('tbKillW5'), fieldKillW5: tot('fieldKillW5'), killsW5: tot('killsW5'),
  facedKindsTotal: tot('facedW5Count'),
  tbEndRows: tot('tbEndRows'), tbJoined: tot('tbJoined'), tbUnjoined: tot('tbUnjoined'),
  tbMonsterIdReadable: tot('tbMonsterIdReadable'),
  totalTargetCalls: tot('targetCalls'), totalSpawns: tot('totalSpawns'),
  wrapCountsTotal: perSeed.reduce(function (acc, s) {
    const w = s.wrapCounts || {};
    for (const k of Object.keys(w)) acc[k] = (acc[k] || 0) + w[k];
    return acc;
  }, {}),
  instrumentErrorsTotal: tot('instrumentErrors'),
  conditional: {
    unlockedDenominator: unlocked.length,
    facedGivenUnlocked: faced.filter(function (s) { return s.unlockDay != null; }).length + '/' + unlocked.length,
    foughtGivenFaced: fought.filter(function (s) { return s.facedW5Count > 0; }).length + '/' + faced.length,
    killedGivenFought: killed.filter(function (s) { return s.startW5 > 0 || s.fieldW5 > 0; }).length + '/' + fought.length,
    facedKindsPerUnlockedDay: unlocked.length ? (tot('facedW5Count') / unlocked.reduce(function (a, s) { return a + s.windowDays; }, 0)) : null,
    unlockedWindowDaysTotal: unlocked.reduce(function (a, s) { return a + s.windowDays; }, 0),
  },
  national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
  tableLatch: perSeed.filter(function (s) { return s.tableLatch; }).length,
  won: perSeed.filter(function (s) { return s.won; }).length,
  maxWave4: perSeed.filter(function (s) { return s.maxWave >= 4; }).length,
  maxWave5: perSeed.filter(function (s) { return s.maxWave >= 5; }).length,
  tableWaiting: perSeed.filter(function (s) { return s.tableWaiting; }).length,
  tableDone: perSeed.filter(function (s) { return s.tableDone; }).length,
  medianDays: median(perSeed.map(function (s) { return s.days; })),
  daysList: perSeed.map(function (s) { return s.days; }).sort(function (x, y) { return x - y; }),
}, null, 2));
