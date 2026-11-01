#!/usr/bin/env node
// test-trajband-a.js — proof test for scripts/trajband-a-analyze.js
// (sim-trajband-a, DIAG ONLY). Synthetic corpora + calibration on the
// 0615Z 87135 pair. Exits non-zero on any failed check; prints PASS count.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./trajband-a-analyze.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), { got, want }); }

// Minimal leg builder. opts: seed, daily ranks [{day,rank}], killLog,
// spawns, fieldFights, snaps [{day,sheltered,wm}], ticks [{day,opps,shelterSkipped}],
// hashes, endRank, gameDays, endReason.
function leg(o) {
  return {
    seed: o.seed || 1,
    daily: (o.daily || []).map((d) => ({ day: d.day, rank: d.rank })),
    fieldFights: o.fieldFights || [],
    killLog: o.killLog || [],
    spawns: o.spawns || [],
    trajSnaps: (o.snaps !== undefined ? o.snaps : [{ day: 1, sheltered: 0 }]).map((s) => ({
      day: s.day, shelteredList: s.sheltered ? new Array(s.sheltered).fill('v') : [],
      worldMonsters: s.wm || [],
    })),
    trajTicks: (o.ticks !== undefined ? o.ticks : [{ day: 1, opps: 0 }]).map((t) => ({ day: t.day, opps: t.opps || 0, shelterSkipped: t.shelterSkipped || 0 })),
    hashes: o.hashes || ['1:a'],
    endScaleRank: o.endRank || null,
    gameDays: o.gameDays || 100,
    endReason: o.endReason || 'village-lost',
    national: 0, table: 0, won: 0,
  };
}
function dailyRank(start, end, rank) {
  const out = [];
  for (let d = start; d <= end; d++) out.push({ day: d, rank });
  return out;
}
function ticksRange(lo, hi, opps) {
  const out = [];
  for (let d = lo; d <= hi; d++) out.push({ day: d, opps, shelterSkipped: 0 });
  return out;
}
function wildFights(days, mid) {
  return days.map((d) => ({ day: d, mid: mid || 'hushwolf', caller: 'wild', wave: 1 }));
}

// --- Case 1: ACCEL + MUSTER-MAJOR + COLLAPSE-PRESENT + UNDERSTATE + NOT-SAFE
(function () {
  const B = leg({
    seed: 7,
    daily: dailyRank(1, 120, 'national'),
    killLog: [{ d: 100, mid: 'spool', w: 3 }],
    spawns: [{ day: 120, mid: 'algorithm', wave: 4 }],
    hashes: ['1:a', '2:a', '3:a'],
  });
  const snaps = [];
  for (let d = 60; d <= 69; d++) snaps.push({ day: d, sheltered: 6, wm: d === 60 ? [{ id: 'algorithm', tx: 3, ty: 3 }] : [] });
  const L = leg({
    seed: 7,
    daily: dailyRank(1, 64, 'regional').concat([{ day: 65, rank: 'global' }]).concat(dailyRank(66, 120, 'regional')),
    killLog: [{ d: 50, mid: 'spool', w: 3 }],
    spawns: [{ day: 60, mid: 'algorithm', wave: 4 }],
    fieldFights: [{ day: 50, mid: 'spool', caller: 'wild', wave: 3, contactFinishAttempted: true, contactFinishKill: true }]
      .concat(wildFights([31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]))
      .concat([{ day: 65, mid: 'murkcap', caller: 'wild', wave: 1 }]),
    snaps,
    ticks: ticksRange(30, 59, 4).concat(ticksRange(60, 69, 0).map((t) => Object.assign(t, { opps: t.day === 65 ? 1 : 0, shelterSkipped: 6 }))),
    hashes: ['1:a', '2:a', '3:a'],
    endRank: 'regional', gameDays: 120,
  });
  // Hashes identical here (divergence null) with an attempt present:
  // neutrality HOLDS under the rule (div == null).
  const r = A.classifyPair(B, L, { algorithm: 4 });
  eq('case1 accel', r.accel, 'ACCEL');
  eq('case1 killAccelDays', r.killAccelDays, 50);
  eq('case1 spawnAccelDays', r.spawnAccelDays, 60);
  eq('case1 muster', r.lever.muster, 'MUSTER-MAJOR');
  eq('case1 episode', [r.lever.episodes[0].start, r.lever.episodes[0].end, r.lever.episodes[0].max], [60, 69, 6]);
  eq('case1 threat', r.lever.episodes[0].threatAtStart.map((t) => t.id), ['algorithm']);
  eq('case1 collapse', r.collapse.state, 'PRESENT');
  eq('case1 understate', r.lever.understate, true);
  eq('case1 peak', [r.lever.peakRank, r.lever.peakDay], ['global', 65]);
  eq('case1 safe', r.safe, false);
  eq('case1 outcome', r.outcome, 'ACCEL/MUSTER-MAJOR/COLLAPSE-PRESENT/UNDERSTATE/NOT-SAFE');
  eq('case1 neutrality', r.neutrality, 'HOLDS');
})();

// --- Case 2: trajectory-SAFE (ACCEL, no muster, lever end >= baseline end)
(function () {
  const B = leg({ seed: 8, daily: dailyRank(1, 100, 'regional'), killLog: [{ d: 90, mid: 'spool', w: 3 }], spawns: [{ day: 110, mid: 'algorithm', wave: 4 }], endRank: 'regional' });
  const L = leg({ seed: 8, daily: dailyRank(1, 100, 'national'), killLog: [{ d: 40, mid: 'spool', w: 3 }], spawns: [{ day: 45, mid: 'algorithm', wave: 4 }], endRank: 'national' });
  const r = A.classifyPair(B, L, {});
  eq('case2 accel', r.accel, 'ACCEL');
  eq('case2 muster', r.lever.muster, 'NO-MUSTER');
  eq('case2 collapse', r.collapse.state, 'N/A');
  eq('case2 safe', r.safe, true);
  check('case2 safeFail empty', r.safeFail.length === 0, r.safeFail);
})();

// --- Case 3: ABSENT (no kill/spawn advantage) + NO-MUSTER + NOT-SAFE
(function () {
  const B = leg({ seed: 9, daily: dailyRank(1, 100, 'regional'), killLog: [{ d: 50, mid: 'spool', w: 3 }], spawns: [{ day: 60, mid: 'algorithm', wave: 4 }], endRank: 'regional' });
  const L = leg({ seed: 9, daily: dailyRank(1, 100, 'regional'), killLog: [{ d: 50, mid: 'spool', w: 3 }], spawns: [{ day: 60, mid: 'algorithm', wave: 4 }], endRank: 'regional' });
  const r = A.classifyPair(B, L, {});
  eq('case3 accel', r.accel, 'ABSENT');
  eq('case3 safe', r.safe, false);
  check('case3 safeFail mentions no ACCEL', r.safeFail.indexOf('no ACCEL') >= 0, r.safeFail);
})();

// --- Case 4: KILL-ONLY (kill earlier, spawn NOT earlier)
(function () {
  const B = leg({ seed: 10, daily: dailyRank(1, 100, 'regional'), killLog: [{ d: 90, mid: 'spool', w: 3 }], spawns: [{ day: 50, mid: 'algorithm', wave: 4 }] });
  const L = leg({ seed: 10, daily: dailyRank(1, 100, 'regional'), killLog: [{ d: 40, mid: 'spool', w: 3 }], spawns: [{ day: 60, mid: 'algorithm', wave: 4 }] });
  const r = A.classifyPair(B, L, {});
  eq('case4 accel', r.accel, 'KILL-ONLY');
  eq('case4 killAccelDays', r.killAccelDays, 50);
  eq('case4 spawnAccelDays', r.spawnAccelDays, -10);
})();

// --- Case 5: UNCLASSIFIED on empty daily
(function () {
  const B = leg({ seed: 11, daily: [] });
  const L = leg({ seed: 11, daily: dailyRank(1, 10, 'village') });
  const r = A.classifyPair(B, L, {});
  eq('case5 outcome', r.outcome, 'UNCLASSIFIED');
  check('case5 reason names daily', /daily/.test(r.unclassified), r.unclassified);
})();

// --- Case 6: neutrality FAILS when hashes diverge before the attempt
(function () {
  const B = leg({ seed: 12, daily: dailyRank(1, 100, 'regional'), killLog: [{ d: 90, mid: 'spool', w: 3 }], hashes: ['5:a', '6:a', '7:a'] });
  const L = leg({ seed: 12, daily: dailyRank(1, 100, 'regional'), killLog: [{ d: 40, mid: 'spool', w: 3 }],
    fieldFights: [{ day: 50, mid: 'spool', caller: 'wild', wave: 3, contactFinishAttempted: true }],
    hashes: ['5:a', '6:b', '7:b'] });
  const r = A.classifyPair(B, L, {});
  eq('case6 divergenceDay', r.divergenceDay, 6);
  eq('case6 neutrality', r.neutrality, 'FAILS');
})();

// --- Case 7: episode gap bridging (missing snap day inside a run)
(function () {
  const eps = A.musterEpisodes([
    { day: 10, shelteredList: ['a', 'b'], worldMonsters: [] },
    { day: 12, shelteredList: ['a'], worldMonsters: [] },
    { day: 13, shelteredList: [], worldMonsters: [] },
  ], {});
  eq('case7 one episode', eps.length, 1);
  eq('case7 span', [eps[0].start, eps[0].end, eps[0].span, eps[0].snapDays], [10, 12, 3, 2]);
})();

// --- Case 8: wave-filtered threat list (wave < 4 excluded, unknown kept only without a map)
(function () {
  const eps = A.musterEpisodes([
    { day: 20, shelteredList: ['a'], worldMonsters: [{ id: 'algorithm', tx: 3, ty: 3 }, { id: 'hushwolf', tx: 5, ty: 4 }, { id: 'far', tx: 0, ty: 0 }] },
  ], { algorithm: 4, hushwolf: 1 });
  eq('case8 threat filtered', eps[0].threatAtStart.map((t) => t.id), ['algorithm']);
})();

// --- Case 9: calibration on the real 0615Z 87135 pair (this arm's definitions)
(function () {
  const dir = path.join(__dirname, '..', 'evidence', '2026-11-01');
  const B = JSON.parse(fs.readFileSync(path.join(dir, 's87135traj-baseline-v3', 'leadfeast', 's87135.json'), 'utf8'));
  const L = JSON.parse(fs.readFileSync(path.join(dir, 's87135traj-lever-v3', 'leadfeast', 's87135.json'), 'utf8'));
  const r = A.classifyPair(B, L, null);
  eq('cal accel', r.accel, 'ACCEL');
  eq('cal killAccelDays', r.killAccelDays, 48);
  eq('cal bSpawn null', r.baseline.firstW4SpawnDay, null);
  eq('cal lSpawn', r.lever.firstW4SpawnDay, 88);
  eq('cal divergenceDay', r.divergenceDay, 87);
  eq('cal neutrality', r.neutrality, 'HOLDS');
  eq('cal muster', r.lever.muster, 'MUSTER-MAJOR');
  eq('cal episode', [r.lever.episodes[0].start, r.lever.episodes[0].end, r.lever.episodes[0].max], [89, 163, 10]);
  check('cal threat includes algorithm', r.lever.episodes[0].threatAtStart.some((t) => t.id === 'algorithm'), r.lever.episodes[0].threatAtStart);
  eq('cal collapse', r.collapse.state, 'PRESENT');
  eq('cal post87 opps B', B.trajTicks.filter((t) => t.day > 87).reduce((a, t) => a + t.opps, 0), 192);
  eq('cal post87 opps L', L.trajTicks.filter((t) => t.day > 87).reduce((a, t) => a + t.opps, 0), 8);
  eq('cal post87 wild B', B.fieldFights.filter((f) => f.day > 87 && f.caller === 'wild').length, 95);
  eq('cal post87 wild L', L.fieldFights.filter((f) => f.day > 87 && f.caller === 'wild').length, 5);
  eq('cal peak', [r.lever.peakRank, r.lever.peakDay], ['global', 125]);
  eq('cal end', [r.lever.endRank, r.baseline.endRank], ['regional', 'national']);
  eq('cal outcome', r.outcome, 'ACCEL/MUSTER-MAJOR/COLLAPSE-PRESENT/UNDERSTATE/NOT-SAFE');
})();

// --- Case 10: band summary counts
(function () {
  const mk = (seed, accelKill, spawnDay) => {
    const B = leg({ seed, daily: dailyRank(1, 50, 'regional'), killLog: [{ d: 90, mid: 'spool', w: 3 }], spawns: [{ day: 95, mid: 'algorithm', wave: 4 }] });
    const L = leg({ seed, daily: dailyRank(1, 50, 'regional'), killLog: accelKill ? [{ d: 40, mid: 'spool', w: 3 }] : [{ d: 90, mid: 'spool', w: 3 }], spawns: [{ day: spawnDay, mid: 'algorithm', wave: 4 }] });
    return A.classifyPair(B, L, {});
  };
  const s = A.bandSummary([mk(21, true, 45), mk(22, false, 95)]);
  eq('band seeds', s.seeds, 2);
  eq('band accel', s.accel, 1);
  eq('band absent', s.absent, 1);
  eq('band safe', s.safe, 1); // seed 21: ACCEL, no muster, lever end == baseline end
})();

console.log('test-trajband-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
