// test-frozenband-bisect-20261107.js — proof for the bisect analyzer
// (arm sim-frozenband-bisect-b). Fixture-based: builds synthetic
// doorwalk-b baseline-leg per-seed JSONs in /tmp, asserts the analyzer
// classifies HEALTHY / COLLAPSED / AMBIGUOUS per the prereg flip bars
// and that the flip table names the moved seeds. Also asserts the
// analyzer reads the REAL driver JSON shape (field names the driver
// writes: days, gameDays, endReason, daily[].seat, waveKillLog[].w,
// instrumentErrors).
// Run: node scripts/test-frozenband-bisect-20261107.js
// Seeds used: fixtures only (53001–53008 shapes, synthetic days).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const A = require('./analyze-frozenband-bisect-20261107');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function seedJson(seed, days, endReason, satDay, seat, standing, maxWave, w4, errors) {
  const daily = [];
  // Daily tableSeat() rows turn 'lesser' at the EARNED day (satDay-30
  // in the 53003 shape) — the analyzer must read the SIT from
  // takeseatStats.seatDay, not from the daily rows.
  const earnedDay = satDay != null ? Math.max(1, satDay - 30) : null;
  for (let d = 1; d <= Math.min(days, 150); d++) daily.push({ day: d, seat: (earnedDay != null && d >= earnedDay) ? seat : 'none' });
  return {
    seed: seed, days: days, gameDays: days, endReason: endReason, won: false,
    maxWave: maxWave, standing: standing, scaleRank: 'regional',
    daily: daily,
    takeseatStats: { seatTaken: satDay != null ? 1 : 0, seatDay: satDay, seatKind: seat, doorsOffered: satDay != null ? 6 : 0 },
    waveKillLog: Array.from({ length: w4 }, function (_, i) { return { w: 4, day: 50 + i }; }),
    scholarDeaths: 0, sitAttempts: satDay != null ? [{ day: satDay, ok: true }] : [],
    instrumentErrors: errors || [],
  };
}

function writeDir(dir, rows) {
  fs.mkdirSync(dir, { recursive: true });
  rows.forEach(function (r) {
    fs.writeFileSync(path.join(dir, 'doorwalk-b-s' + r.seed + '-doorwalk-baseline.json'), JSON.stringify(seedJson(r.seed, r.days, r.end, r.sat, r.seat, r.standing, r.wave, r.w4, r.errors)));
  });
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bisect-proof-'));
// Healthy fixture: the 62ca38845 reference table (days/sits/standing/wave).
const healthy = [
  { seed: 53001, days: 150, end: 'survived', sat: null, seat: null, standing: 175, wave: 4, w4: 0 },
  { seed: 53002, days: 79, end: 'village-lost', sat: null, seat: null, standing: 125, wave: 4, w4: 0 },
  { seed: 53003, days: 150, end: 'survived', sat: 90, seat: 'lesser', standing: 344, wave: 5, w4: 2 },
  { seed: 53004, days: 150, end: 'survived', sat: 94, seat: 'lesser', standing: 260, wave: 5, w4: 2 },
  { seed: 53005, days: 97, end: 'lost', sat: 90, seat: 'lesser', standing: 230, wave: 5, w4: 3 },
  { seed: 53006, days: 150, end: 'survived', sat: 93, seat: 'lesser', standing: 834, wave: 4, w4: 4 },
  { seed: 53007, days: 86, end: 'village-lost', sat: null, seat: null, standing: 99, wave: 3, w4: 0 },
  { seed: 53008, days: 150, end: 'survived', sat: 90, seat: 'lesser', standing: 199, wave: 4, w4: 0 },
];
// Collapsed fixture: the 1430Z collapsed shape (die 54–92d, sits 0/8).
const collapsed = [
  { seed: 53001, days: 54, end: 'village-lost', sat: null, seat: null, standing: 60, wave: 2, w4: 0 },
  { seed: 53002, days: 61, end: 'village-lost', sat: null, seat: null, standing: 80, wave: 3, w4: 0 },
  { seed: 53003, days: 70, end: 'village-lost', sat: null, seat: null, standing: 110, wave: 3, w4: 1 },
  { seed: 53004, days: 88, end: 'village-lost', sat: null, seat: null, standing: 140, wave: 4, w4: 1 },
  { seed: 53005, days: 76, end: 'village-lost', sat: null, seat: null, standing: 95, wave: 3, w4: 0 },
  { seed: 53006, days: 84, end: 'village-lost', sat: null, seat: null, standing: 150, wave: 4, w4: 2 },
  { seed: 53007, days: 66, end: 'village-lost', sat: null, seat: null, standing: 55, wave: 2, w4: 0 },
  { seed: 53008, days: 92, end: 'village-lost', sat: null, seat: null, standing: 180, wave: 4, w4: 1 },
];
const dirH = path.join(tmp, 'healthy'), dirC = path.join(tmp, 'collapsed');
writeDir(dirH, healthy);
writeDir(dirC, collapsed);

const h = A.seedSummaries(dirH), c = A.seedSummaries(dirC);
check('seedSummaries reads 8 healthy seeds', Object.keys(h).length === 8);
check('seedSummaries reads sat day + seat (53003 d90 lesser)', h[53003].sat === 90 && h[53003].seat === 'lesser');
check('analyzer reads the SIT day, not the EARNED day (53003 earned d60, sat d90)', h[53003].seatEarnedDay === 60 && h[53003].sat === 90);
check('seedSummaries counts wave-4 kills (53006 = 4)', h[53006].w4kills === 4);
check('seedSummaries reads 0 instrument errors', Object.keys(h).every(function (s) { return h[s].errors === 0; }));
check('median healthy = 150', A.median([150, 79, 150, 150, 97, 150, 86, 150]) === 150);
check('median collapsed = 73', A.median([54, 61, 70, 88, 76, 84, 66, 92]) === 73);
const ch = A.classify(h), cc = A.classify(c);
check('healthy fixture classifies HEALTHY (median 150, sits 5/8)', ch.verdict === 'HEALTHY' && ch.median === 150 && ch.sits === 5, JSON.stringify(ch));
check('collapsed fixture classifies COLLAPSED (median 73, sits 0/8)', cc.verdict === 'COLLAPSED' && cc.median === 73 && cc.sits === 0, JSON.stringify(cc));
// Ambiguous middle: median 100, sits 3/8.
const amb = {};
[53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008].forEach(function (s, i) {
  amb[s] = { days: [100, 100, 100, 100, 100, 100, 100, 100][i], sat: i < 3 ? 90 : null };
});
check('middle fixture classifies AMBIGUOUS (median 100, sits 3/8)', A.classify(amb).verdict === 'AMBIGUOUS');
// Flip table names moved seeds and direction.
const table = A.flipTable(h, c, 'L0', 'L1');
check('flip table shows 53001 -96 days', table.indexOf('| 53001 | 150 | 54 | -96 |') !== -1);
check('flip table shows 53003 losing its d90 seat', table.indexOf('| 53003 | 150 | 70 | -80 | lesser d90 | — |') !== -1);
check('flip table keeps 53002/53007 non-sitters unseated both sides', table.indexOf('| 53002 | 79 | 61 | -18 | — | — |') !== -1);
// Real driver JSON shape: the analyzer must tolerate missing optional fields.
const realShape = { seed: 53001, days: 150, gameDays: 150, endReason: 'survived', won: false, maxWave: 4, standing: 175, daily: [{ day: 150, seat: 'none' }], waveKillLog: [], scholarDeaths: 0, sitAttempts: [], instrumentErrors: [] };
const dirR = path.join(tmp, 'realshape');
fs.mkdirSync(dirR, { recursive: true });
fs.writeFileSync(path.join(dirR, 'doorwalk-b-s53001-doorwalk-baseline.json'), JSON.stringify(realShape));
const r = A.seedSummaries(dirR);
check('real driver shape parses (53001, 150d, no seat)', r[53001] && r[53001].days === 150 && r[53001].sat === null);

console.log(pass + '/' + (pass + fail) + ' green');
process.exit(fail ? 1 : 0);
