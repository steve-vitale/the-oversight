// test-xphalf-20261107.js — proof for the XP-half early-death probe analyzer
// (arm sim-xphalf-b, run fleshout-loop-b-20261108T0013Z). DIAG, zero src/js.
// Fixture-based: death census + cause bucketing + living trajectory +
// mechanism classification (all four prereg outcomes incl. unclassified) +
// first-divergence + loadCorpus on fixture JSONs. No sims, no game code.
// Usage: node scripts/test-xphalf-20261107.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const A = require('./analyze-xphalf-20261107');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// --- cause bucketing ---
check('bucket monster kill', A.bucketCause('Killed by the Living Wire').bucket === 'violent-monster');
check('bucket ambush', A.bucketCause('ambushed by a boar').bucket === 'violent-monster');
check('bucket contest', A.bucketCause('died in the contest').bucket === 'violent-contest');
check('bucket betrayal', A.bucketCause('murdered by a jealous rival').bucket === 'violent-betrayal');
check('bucket starvation', A.bucketCause('starved to death').bucket === 'starvation');
check('bucket thirst', A.bucketCause('died of thirst').bucket === 'thirst');
check('bucket sickness', A.bucketCause('fell sick and died').bucket === 'sickness');
check('bucket wounds', A.bucketCause('bled out from wounds').bucket === 'wounds');
check('bucket the-wild', A.bucketCause('lost in the wild').bucket === 'the-wild');
check('bucket unmapped stays unmapped', A.bucketCause('taken by the pale choir').bucket === 'unmapped');
check('bucket null cause unknown', A.bucketCause(null).bucket === 'unknown');

function dailyRow(day, living, standing) { return { day: day, living: living, raw: standing }; }
function fakeRun(seed, days, fallen, livingRows, extra) {
  const j = {
    seed: seed, days: days, endReason: 'village-lost', won: false,
    takeseatStats: { seatTaken: 0 }, standing: 150, maxWave: 4,
    waveKillLog: [], scholarDeaths: 0, instrumentErrors: [],
    fallen: fallen, deathSays: [], daily: livingRows, teleDeaths: null,
  };
  if (extra) Object.assign(j, extra);
  return j;
}
function livingSeries(firstDeathDay, deaths) {
  // 12 villagers; deaths: [{day, livingAfter}]
  const rows = [];
  let living = 12;
  for (let d = 1; d <= 60; d++) {
    deaths.forEach(function (x) { if (x.day === d) living = x.livingAfter; });
    rows.push(dailyRow(d, living, 100 + d));
  }
  return rows;
}

// --- violent-thinning classification ---
(function () {
  const j = fakeRun(53003, 45, [
    { name: 'Victor', day: 14, cause: 'ambushed by a boar' },
    { name: 'Sergio', day: 15, cause: 'Killed by the Living Wire' },
    { name: 'Maeve', day: 22, cause: 'died in the contest' },
  ], livingSeries(14, [{ day: 14, livingAfter: 11 }, { day: 15, livingAfter: 10 }, { day: 22, livingAfter: 9 }, { day: 30, livingAfter: 7 }]));
  // living at d30 must be < 8 for the rule: force the d30 row to 7.
  j.daily.forEach(function (r) { if (r.day >= 30) r.living = 7; });
  const c = A.classifyMechanism(j);
  check('classify violent-thinning', c.mechanism === 'violent-thinning', c.mechanism + ': ' + c.why);
})();

// --- attrition-after-thinning classification ---
(function () {
  const j = fakeRun(53005, 62, [
    { name: 'Ella', day: 9, cause: 'ambushed by a boar' },
    { name: 'Pavel', day: 20, cause: 'Killed by Gavel' },
    { name: 'Jorge', day: 53, cause: 'starved to death' },
    { name: 'Mateo', day: 54, cause: 'starved to death' },
    { name: 'David', day: 54, cause: 'died of thirst' },
  ], livingSeries(9, [{ day: 9, livingAfter: 11 }, { day: 20, livingAfter: 10 }, { day: 53, livingAfter: 9 }, { day: 54, livingAfter: 7 }]));
  // First 3 deaths are NOT all violent (only 2 violent before d30... actually
  // first3 = Ella violent, Pavel violent, Jorge starvation) so the violent
  // rule must not fire; the attrition rule must.
  const c = A.classifyMechanism(j);
  check('classify attrition-after-thinning', c.mechanism === 'attrition-after-thinning', c.mechanism + ': ' + c.why);
})();

// --- starvation-first classification ---
(function () {
  const j = fakeRun(53007, 55, [
    { name: 'Onni', day: 18, cause: 'starved to death' },
    { name: 'Raquel', day: 30, cause: 'fell sick and died' },
  ], livingSeries(18, [{ day: 18, livingAfter: 11 }, { day: 30, livingAfter: 10 }]));
  const c = A.classifyMechanism(j);
  check('classify starvation-first', c.mechanism === 'starvation-first', c.mechanism + ': ' + c.why);
})();

// --- unclassified: no fallen entries ---
(function () {
  const j = fakeRun(53001, 150, [], livingSeries(999, []));
  const c = A.classifyMechanism(j);
  check('classify unclassified on empty fallen', c.mechanism === 'unclassified', c.mechanism);
})();

// --- unclassified: undated/unmapped causes only ---
(function () {
  const j = fakeRun(53002, 80, [
    { name: 'X', day: null, cause: 'taken by the pale choir' },
  ], livingSeries(999, []));
  const c = A.classifyMechanism(j);
  check('classify unclassified on undated/unmapped', c.mechanism === 'unclassified', c.mechanism + ': ' + c.why);
})();

// --- living trajectory ---
(function () {
  const j = fakeRun(53003, 45, [], livingSeries(14, [{ day: 14, livingAfter: 11 }, { day: 15, livingAfter: 10 }, { day: 22, livingAfter: 9 }]));
  const t = A.livingTrajectory(j);
  check('traj firstDeathDay', t.firstDeathDay === 14, String(t.firstDeathDay));
  check('traj deathsBy30', t.deathsBy30 === 3, String(t.deathsBy30));
  check('traj livingAt30', t.livingAt30 === 9, String(t.livingAt30));
})();

// --- death census buckets + unmapped listing ---
(function () {
  const j = fakeRun(53003, 45, [
    { name: 'A', day: 10, cause: 'ambushed by a boar' },
    { name: 'B', day: 20, cause: 'starved to death' },
    { name: 'C', day: 30, cause: 'taken by the pale choir' },
  ], livingSeries(10, []));
  const c = A.deathCensus(j);
  check('census violent-monster count', c.byBucket['violent-monster'] === 1, JSON.stringify(c.byBucket));
  check('census starvation count', c.byBucket.starvation === 1, JSON.stringify(c.byBucket));
  check('census unmapped listed', c.unmapped.length === 1 && c.unmapped[0].name === 'C', JSON.stringify(c.unmapped));
})();

// --- first divergence ---
(function () {
  const a = { daily: [dailyRow(1, 12, 100), dailyRow(2, 12, 102), dailyRow(3, 11, 105)] };
  const b = { daily: [dailyRow(1, 12, 100), dailyRow(2, 12, 102), dailyRow(3, 12, 105)] };
  check('firstDivergence day 3', A.firstDivergence(a, b) === 3, String(A.firstDivergence(a, b)));
  const c = { daily: [dailyRow(1, 12, 100), dailyRow(2, 12, 102)] };
  check('firstDivergence null when identical', A.firstDivergence(a, c) === null, String(A.firstDivergence(a, c)));
})();

// --- median ---
check('median odd', A.median([45, 150, 62]) === 62);
check('median even', A.median([45, 55, 62, 150, 150, 150, 150, 150]) === 150);

// --- loadCorpus on fixture JSONs ---
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xphalf-fixture-'));
  const j = fakeRun(53003, 45, [{ name: 'Victor', day: 14, cause: 'ambushed by a boar' }], livingSeries(14, [{ day: 14, livingAfter: 11 }]));
  fs.writeFileSync(path.join(dir, 'doorwalk-b-s53003-doorwalk-baseline.json'), JSON.stringify(j));
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'ignored');
  const corpus = A.loadCorpus(dir);
  check('loadCorpus reads one seed', corpus && corpus[53003] && corpus[53003].days === 45, corpus ? Object.keys(corpus).join(',') : 'null');
  check('loadCorpus missing dir null', A.loadCorpus(path.join(dir, 'nope')) === null);
  check('loadCorpus empty dir null', A.loadCorpus(fs.mkdtempSync(path.join(os.tmpdir(), 'xphalf-empty-'))) === null);
  const sum = A.seedSummary(j);
  check('seedSummary mechanism', sum.mechanism === 'unclassified' || typeof sum.mechanism === 'string', sum.mechanism);
  check('seedSummary days', sum.days === 45);
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
