#!/usr/bin/env node
// winfunnel-analyze-20261103.js — aggregate the winnability-push funnel
// corpus (evidence/2026-11-03/perseed-winfunnel-a/) into per-seed chains
// and before/after-comparable population rates. Wave-5 chain logic is the
// baseline w5faced-competent analyzer's (tbEnd->start join by fightSeq,
// campaignOnly split, faced = endGate daily facedW5). New arm-3 fields:
//   veterans banked = max over daily snapshots of readiness5.veterans
//     (living roster members with a wave-4+ kill, per standing.js);
//   readiness-5 releases = seeds with >= 1 daily snapshot where
//     readiness5.ready is true (release = first such day);
//   national reached = national/global on ANY daily scale snapshot
//     (ext) or at run end — end-only rank is also reported separately;
//   wild ally-join rate = field fights (ext rows) carrying >= 1 ally
//     over all field fights, plus sensing-helper hit rate.
// Read-only: prints to stdout, writes nothing.
// Usage: node scripts/winfunnel-analyze-20261103.js [glob-dir]
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-03', 'perseed-winfunnel-a');

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
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const files = fs.readdirSync(DIR).filter(function (f) { return f.endsWith('.json'); }).sort();
if (!files.length) { console.error('WINFUNNEL-ANALYZE: no per-seed files in ' + DIR); process.exit(2); }
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
  const spawnAll = w5(r.spawnRows);
  const spawnFC = spawnAll.filter(function (x) { return !x.campaignOnly; });
  const spawnCO = spawnAll.filter(function (x) { return !!x.campaignOnly; });
  const startAll = w5(r.startRows);
  const fieldAll = w5(r.fieldRows);
  const tbAll = r.tbEndRows || [];
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
  // Arm-3 fields.
  let maxVeterans = 0, endVeterans = 0, ready5Days = 0, firstReady5Day = null;
  let maxArmored = 0, maxArmed = 0;
  for (const d of daily) {
    const rd = d.readiness5 || {};
    if (typeof rd.veterans === 'number') maxVeterans = Math.max(maxVeterans, rd.veterans);
    if (typeof rd.armored === 'number') maxArmored = Math.max(maxArmored, rd.armored);
    if (typeof rd.armed === 'number') maxArmed = Math.max(maxArmed, rd.armed);
    if (rd.ready) { ready5Days++; if (firstReady5Day == null) firstReady5Day = d.day; }
  }
  if (last.readiness5) endVeterans = last.readiness5.veterans || 0;
  const extDaily = r.extScaleDaily || [];
  let maxRank = r.scaleRank || null, maxRankVal = RANK_ORDER[r.scaleRank] != null ? RANK_ORDER[r.scaleRank] : -1;
  for (const d of extDaily) {
    const v = RANK_ORDER[d.rank];
    if (v != null && v > maxRankVal) { maxRankVal = v; maxRank = d.rank; }
  }
  const nationalReached = maxRankVal >= 2;
  const allyRows = r.extAllyFieldRows || [];
  const allyJoins = allyRows.filter(function (x) { return (x.allies || 0) > 0 || (x.allyVids || 0) > 0; });
  const senseCalls = r.extSenseCalls || [];
  const senseHits = senseCalls.filter(function (x) { return x.returned > 0; });
  const aidRows = r.extAidRows || [];
  const aidJoins = aidRows.filter(function (x) { return (x.allies || 0) > 0 || (x.allyVids || 0) > 0; });
  perSeed.push({
    seed: r.seed, anchorCommit: r.anchorCommit, days: r.days, endReason: r.endReason, won: r.won,
    scaleRankEnd: r.scaleRank, maxScaleRank: maxRank, nationalReached: nationalReached,
    maxWave: r.maxWave, tableLatch: r.tableLatch,
    tableWaiting: r.tableWaiting, tableDone: r.tableDone,
    seat: r.tableSeat, gateW4: r.endGate ? r.endGate.w4 : null,
    gateW5: r.endGate ? r.endGate.w5 : null,
    unlockDay: unlockDay, windowDays: windowDays,
    unlockStanding: unlockSnap ? unlockSnap.standing : null,
    maxVeterans: maxVeterans, endVeterans: endVeterans,
    maxArmored: maxArmored, maxArmed: maxArmed,
    ready5Days: ready5Days, firstReady5Day: firstReady5Day, released5: ready5Days > 0,
    targetW5: (r.targetRows || []).filter(function (x) { return x.target === 5; }).length,
    castW5: w5(r.castRows).length,
    spawnW5All: spawnAll.length, spawnW5FightCandidate: spawnFC.length,
    spawnW5CampaignOnly: spawnCO.length,
    triggerW5: w5(r.triggerRows).length,
    startW5: startAll.length, startW5Ids: countBy(startAll, 'id'),
    fieldW5: fieldAll.length, fieldOutcomes: countBy(fieldAll, 'outcome'),
    fieldKillW5: fieldKill.length, tbKillW5: tbKill, tbKillIds: countBy(tbKillIds, function (x) { return x; }),
    killsW5: tbKill + fieldKill.length,
    facedW5End: facedEnd, facedW5Count: facedEnd.length,
    distTo2: Math.max(0, 2 - facedEnd.length),
    fieldFights: allyRows.length, allyJoinFights: allyJoins.length,
    allyJoinRate: allyRows.length ? (allyJoins.length / allyRows.length) : null,
    aidCalls: aidRows.length, aidJoinCalls: aidJoins.length,
    senseCalls: senseCalls.length, senseHits: senseHits.length,
    senseHitRate: senseCalls.length ? (senseHits.length / senseCalls.length) : null,
    tbEndRows: tbAll.length, tbJoined: tbJoined, tbUnjoined: tbUnjoined,
    instrumentErrors: (r.instrumentErrors || []).length,
    file: f,
  });
}

for (const s of perSeed) console.log(JSON.stringify(s, null, 2));
const tot = function (k) { return perSeed.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
const n = perSeed.length;
const released = perSeed.filter(function (s) { return s.released5; });
const unlocked = perSeed.filter(function (s) { return s.unlockDay != null; });
const spawned = perSeed.filter(function (s) { return s.spawnW5FightCandidate > 0; });
const faced = perSeed.filter(function (s) { return s.facedW5Count > 0; });
const fought = perSeed.filter(function (s) { return s.startW5 > 0 || s.fieldW5 > 0; });
const killed = perSeed.filter(function (s) { return s.killsW5 > 0; });
const national = perSeed.filter(function (s) { return s.nationalReached; });
console.log('=== AGGREGATE (headline denominator = ALL runs) ===');
console.log(JSON.stringify({
  seeds: n,
  anchors: countBy(perSeed, 'anchorCommit'),
  veteransBankedSeeds: perSeed.filter(function (s) { return s.maxVeterans >= 2; }).length,
  veteransBankedRate: perSeed.filter(function (s) { return s.maxVeterans >= 2; }).length + '/' + n,
  maxVeteransDist: countBy(perSeed, 'maxVeterans'),
  released5: released.length, released5Rate: released.length + '/' + n,
  ready5DaysTotal: tot('ready5Days'),
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
  nationalReached: national.length, nationalReachedRate: national.length + '/' + n,
  nationalAtEnd: perSeed.filter(function (s) { return s.scaleRankEnd === 'national' || s.scaleRankEnd === 'global'; }).length,
  tableLatch: perSeed.filter(function (s) { return s.tableLatch; }).length,
  won: perSeed.filter(function (s) { return s.won; }).length,
  maxWave4: perSeed.filter(function (s) { return s.maxWave >= 4; }).length,
  maxWave5: perSeed.filter(function (s) { return s.maxWave >= 5; }).length,
  fieldFights: tot('fieldFights'), allyJoinFights: tot('allyJoinFights'),
  allyJoinRate: tot('fieldFights') ? (tot('allyJoinFights') / tot('fieldFights')) : null,
  aidCalls: tot('aidCalls'), aidJoinCalls: tot('aidJoinCalls'),
  senseCalls: tot('senseCalls'), senseHits: tot('senseHits'),
  senseHitRate: tot('senseCalls') ? (tot('senseHits') / tot('senseCalls')) : null,
  tbEndRows: tot('tbEndRows'), tbJoined: tot('tbJoined'), tbUnjoined: tot('tbUnjoined'),
  instrumentErrorsTotal: tot('instrumentErrors'),
  conditional: {
    unlockedDenominator: unlocked.length,
    facedGivenUnlocked: faced.filter(function (s) { return s.unlockDay != null; }).length + '/' + unlocked.length,
    foughtGivenFaced: fought.filter(function (s) { return s.facedW5Count > 0; }).length + '/' + faced.length,
    killedGivenFought: killed.filter(function (s) { return s.startW5 > 0 || s.fieldW5 > 0; }).length + '/' + fought.length,
    facedKindsPerUnlockedDay: unlocked.length ? (tot('facedW5Count') / unlocked.reduce(function (a, s) { return a + s.windowDays; }, 0)) : null,
    unlockedWindowDaysTotal: unlocked.reduce(function (a, s) { return a + s.windowDays; }, 0),
  },
  medianDays: median(perSeed.map(function (s) { return s.days; })),
  daysList: perSeed.map(function (s) { return s.days; }).sort(function (x, y) { return x - y; }),
}, null, 2));
