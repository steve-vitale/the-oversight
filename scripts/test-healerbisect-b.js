// test-healerbisect-b.js — proof for the healer-bisect screen rule,
// flip-interval logic, and the 8-seed control bars (arm
// sim-healerbisect-b). Fixture-based: synthetic per-seed summaries shaped
// on the published tables (bisect C2 collapsed, fightloop healed
// baseline). No sim, no harness load — runs at any SHA.
// Run: node scripts/test-healerbisect-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const S = require('./healerbisect-screen-20261108');
const A = require('./analyze-frozenband-bisect-20261107');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function summaries(daysBySeed) {
  const out = {};
  Object.keys(daysBySeed).forEach(function (s) {
    out[s] = { days: daysBySeed[s].days, sat: daysBySeed[s].sat || null };
  });
  return out;
}

// --- Screen rule on the published shapes ---
// Collapsed (bisect C2): subset 73/54/66/92, none sits.
check('screen: C2 shape COLLAPSED',
  S.classifyScreen(summaries({ 53004: { days: 73 }, 53005: { days: 54 }, 53006: { days: 66 }, 53008: { days: 92 } })).verdict === 'COLLAPSED');
// Healed (fightloop baseline): subset all 150d, all sit.
check('screen: fightloop shape HEALED',
  S.classifyScreen(summaries({ 53004: { days: 150, sat: 90 }, 53005: { days: 150, sat: 99 }, 53006: { days: 150, sat: 90 }, 53008: { days: 150, sat: 97 } })).verdict === 'HEALED');
// 2 healed + 2 collapsed -> AMBIGUOUS (must run the full 8).
check('screen: 2/2 split AMBIGUOUS',
  S.classifyScreen(summaries({ 53004: { days: 150 }, 53005: { days: 150 }, 53006: { days: 66 }, 53008: { days: 92 } })).verdict === 'AMBIGUOUS');
// 3 healed + 1 early death -> HEALED (the bar is >=3/4).
check('screen: 3 healed + 1 dead HEALED',
  S.classifyScreen(summaries({ 53004: { days: 150 }, 53005: { days: 150 }, 53006: { days: 150 }, 53008: { days: 92 } })).verdict === 'HEALED');
// 3 dead + 1 survivor -> COLLAPSED.
check('screen: 3 dead + 1 survivor COLLAPSED',
  S.classifyScreen(summaries({ 53004: { days: 73 }, 53005: { days: 54 }, 53006: { days: 150 }, 53008: { days: 92 } })).verdict === 'COLLAPSED');
// Missing seed rows do not crash; 3/3 present and healed still HEALED.
check('screen: missing row tolerated',
  S.classifyScreen(summaries({ 53004: { days: 150 }, 53005: { days: 150 }, 53006: { days: 150 } })).verdict === 'HEALED');

// --- Subset justification: the excluded seeds do NOT discriminate ---
// C2 -> fightloop days: 53003 68->65, 53007 63->50, 53001 88->105,
// 53002 84->140. None flips death->150d survival.
const nonDisc = { 53001: [88, 105], 53002: [84, 140], 53003: [68, 65], 53007: [63, 50] };
check('screen: excluded seeds never reach 150d on either side',
  Object.keys(nonDisc).every(function (s) { return nonDisc[s][0] < 150 && nonDisc[s][1] < 150; }));
const disc = { 53004: [73, 150], 53005: [54, 150], 53006: [66, 150], 53008: [92, 150] };
check('screen: subset seeds all flip death->150d',
  Object.keys(disc).every(function (s) { return disc[s][0] < 100 && disc[s][1] >= 150; }));

// --- Flip interval ---
check('flip: C,C,H,H names the C->H interval',
  JSON.stringify(S.flipInterval([
    { sha: 'a', verdict: 'COLLAPSED' }, { sha: 'b', verdict: 'COLLAPSED' },
    { sha: 'c', verdict: 'HEALED' }, { sha: 'd', verdict: 'HEALED' },
  ])) === JSON.stringify({ from: 'b', to: 'c', ambiguous: false }));
check('flip: C,A,H flags ambiguous',
  S.flipInterval([
    { sha: 'a', verdict: 'COLLAPSED' }, { sha: 'b', verdict: 'AMBIGUOUS' },
    { sha: 'c', verdict: 'HEALED' },
  ]).ambiguous === true);
check('flip: no healed reading -> null',
  S.flipInterval([{ sha: 'a', verdict: 'COLLAPSED' }, { sha: 'b', verdict: 'COLLAPSED' }]) === null);
check('flip: healed with no collapsed anchor -> null',
  S.flipInterval([{ sha: 'a', verdict: 'HEALED' }, { sha: 'b', verdict: 'HEALED' }]) === null);
check('flip: later collapse does not move the first interval',
  S.flipInterval([
    { sha: 'a', verdict: 'COLLAPSED' }, { sha: 'b', verdict: 'HEALED' },
    { sha: 'c', verdict: 'COLLAPSED' },
  ]).to === 'b');

// --- 8-seed control bars through the shared analyzer ---
function seedJson(seed, days, endReason, satDay, seat, standing, maxWave, w4) {
  const daily = [];
  const earnedDay = satDay != null ? Math.max(1, satDay - 30) : null;
  for (let d = 1; d <= Math.min(days, 150); d++) daily.push({ day: d, seat: (earnedDay != null && d >= earnedDay) ? seat : 'none' });
  return {
    seed: seed, days: days, gameDays: days, endReason: endReason, won: false,
    maxWave: maxWave, standing: standing, scaleRank: 'regional', daily: daily,
    takeseatStats: { seatTaken: satDay != null ? 1 : 0, seatDay: satDay, seatKind: seat, doorsOffered: satDay != null ? 6 : 0 },
    waveKillLog: Array.from({ length: w4 }, function (_, i) { return { w: 4, day: 50 + i }; }),
    scholarDeaths: 0, sitAttempts: satDay != null ? [{ day: satDay, ok: true }] : [],
    instrumentErrors: [],
  };
}
function writeDir(dir, rows) {
  fs.mkdirSync(dir, { recursive: true });
  rows.forEach(function (r) {
    fs.writeFileSync(path.join(dir, 'doorwalk-b-s' + r.seed + '-doorwalk-baseline.json'),
      JSON.stringify(seedJson(r.seed, r.days, r.end, r.sat, r.seat, r.standing, r.wave, r.w4)));
  });
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healerbisect-proof-'));
// Collapsed full-8 fixture: the bisect C2 per-seed table.
const collapsed8 = [
  { seed: 53001, days: 88, end: 'village-lost', sat: null, seat: null, standing: 199, wave: 4, w4: 3 },
  { seed: 53002, days: 84, end: 'village-lost', sat: null, seat: null, standing: 100, wave: 4, w4: 0 },
  { seed: 53003, days: 68, end: 'village-lost', sat: null, seat: null, standing: 120, wave: 4, w4: 0 },
  { seed: 53004, days: 73, end: 'village-lost', sat: null, seat: null, standing: 199, wave: 4, w4: 2 },
  { seed: 53005, days: 54, end: 'village-lost', sat: null, seat: null, standing: 199, wave: 4, w4: 1 },
  { seed: 53006, days: 66, end: 'village-lost', sat: null, seat: null, standing: 190, wave: 4, w4: 1 },
  { seed: 53007, days: 63, end: 'village-lost', sat: null, seat: null, standing: 125, wave: 4, w4: 0 },
  { seed: 53008, days: 92, end: 'village-lost', sat: null, seat: null, standing: 199, wave: 4, w4: 3 },
];
// Healed full-8 fixture: the fightloop baseline per-seed table.
const healed8 = [
  { seed: 53001, days: 105, end: 'village-lost', sat: null, seat: null, standing: 275, wave: 5, w4: 0 },
  { seed: 53002, days: 140, end: 'village-lost', sat: null, seat: null, standing: 199, wave: 4, w4: 0 },
  { seed: 53003, days: 65, end: 'village-lost', sat: null, seat: null, standing: 199, wave: 4, w4: 0 },
  { seed: 53004, days: 150, end: 'survived', sat: 90, seat: 'lesser', standing: 199, wave: 4, w4: 0 },
  { seed: 53005, days: 150, end: 'survived', sat: 99, seat: 'lesser', standing: 199, wave: 4, w4: 0 },
  { seed: 53006, days: 150, end: 'survived', sat: 90, seat: 'lesser', standing: 199, wave: 4, w4: 0 },
  { seed: 53007, days: 50, end: 'village-lost', sat: null, seat: null, standing: 75, wave: 3, w4: 0 },
  { seed: 53008, days: 150, end: 'survived', sat: 97, seat: 'lesser', standing: 199, wave: 4, w4: 0 },
];
const dirC = path.join(tmp, 'c'), dirH = path.join(tmp, 'h');
writeDir(dirC, collapsed8);
writeDir(dirH, healed8);
const cc = A.classify(A.seedSummaries(dirC));
const ch = A.classify(A.seedSummaries(dirH));
check('bars: C2 fixture median 70.5 + sits 0/8 COLLAPSED',
  cc.median === 70.5 && cc.sits === 0 && cc.verdict === 'COLLAPSED',
  'got median=' + cc.median + ' sits=' + cc.sits + ' ' + cc.verdict);
check('bars: fightloop fixture median 145 + sits 4/8 HEALTHY',
  ch.median === 145 && ch.sits === 4 && ch.verdict === 'HEALTHY',
  'got median=' + ch.median + ' sits=' + ch.sits + ' ' + ch.verdict);
// A/A smoke: same dir classified twice gives the same verdict.
check('bars: A/A smoke identical verdict', A.classify(A.seedSummaries(dirC)).verdict === cc.verdict);
// The analyzer reads the SIT from takeseatStats, not the daily earned row.
check('bars: sit day read as taken day (90), not earned day (60)',
  A.seedSummaries(dirH)[53004].sat === 90);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
