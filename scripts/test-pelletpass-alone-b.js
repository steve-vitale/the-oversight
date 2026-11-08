// test-pelletpass-alone-b.js — proof for the pellet-pass-alone counterfactual
// (arm sim-pelletpass-alone-b, prereg evidence/2026-11-08/
// sim-pelletpass-alone-b-prereg.md). Proves the construction (#14 base +
// ONLY the pellet pass, by diff), the frozen-instrument byte identity, the
// corpus integrity (8/8 seeds, 0 instrument errors), and the full-8 bars
// on the published fixture tables through the shared analyzer. No sim, no
// harness load — runs at any SHA on the branch.
// Run: node scripts/test-pelletpass-alone-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const A = require('./analyze-frozenband-bisect-20261107');

const REPO = path.join(__dirname, '..');
const SCRATCH = path.join(REPO, 'scratch-2bc17d793');
const CORPUS = path.join(REPO, 'evidence', '2026-11-08', 'perseed-pelletpass-alone-b');

let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function skipCheck(name, why) { skip++; console.log('SKIP ' + name + ' — ' + why); }
function git(args) { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
function gitRaw(args) { return execSync('git ' + args, { cwd: REPO }).toString(); }
function shaFile(p) {
  return execSync('git hash-object ' + JSON.stringify(p), { cwd: REPO }).toString().trim();
}

// --- Construction: the pellet-pass diff is exactly progression.js +104 ---
const stat1516 = git('diff --stat e6ddaf32a 685dc9ec4 -- src');
check('diff: #15..#16 touches exactly one src file (progression.js, +104)',
  /src\/js\/progression\.js \| 104 \+/.test(stat1516) && (stat1516.match(/\|/g) || []).length === 1,
  stat1516.replace(/\n/g, ' / '));
const stat1415 = git('diff --stat 2bc17d793 e6ddaf32a -- src');
check('diff: #14..#15 touches exactly one src file (food.js)',
  /src\/js\/food\.js \|/.test(stat1415) && (stat1415.match(/\|/g) || []).length === 1,
  stat1415.replace(/\n/g, ' / '));
check('diff: progression.js identical between #14 and #15 (patch applies cleanly)',
  git('diff 2bc17d793 e6ddaf32a -- src/js/progression.js') === '');
check('diff: food.js identical between #15 and #16 (no other game-code change)',
  git('diff e6ddaf32a 685dc9ec4 -- src/js/food.js') === '');

// --- Construction: scratch src = #14 everywhere except progression.js = #16 ---
if (fs.existsSync(path.join(SCRATCH, 'src', 'js', 'progression.js'))) {
  const ls = git('ls-tree -r 2bc17d793 -- src').split('\n');
  const expected = {};
  ls.forEach(function (line) {
    const parts = line.split('\t');
    if (parts.length === 2) expected[parts[1]] = parts[0].split(/\s+/)[2];
  });
  expected['src/js/progression.js'] = git('rev-parse 685dc9ec4:src/js/progression.js');
  const files = Object.keys(expected).sort();
  const hashes = execSync('git hash-object ' + files.map(function (f) {
    return JSON.stringify(path.join(SCRATCH, f));
  }).join(' '), { cwd: REPO }).toString().trim().split('\n');
  const bad = files.filter(function (f, i) { return hashes[i] !== expected[f]; });
  check('construct: scratch src is #14 + pellet pass only (' + files.length + ' files)',
    bad.length === 0, bad.slice(0, 5).join(', '));
  check('construct: scratch food.js is the #14 10-XP first rung, not #15',
    /self-taught pay double for the first rung/.test(
      fs.readFileSync(path.join(SCRATCH, 'src', 'js', 'food.js'), 'utf8')));
  check('construct: scratch progression.js is byte-identical to #16',
    fs.readFileSync(path.join(SCRATCH, 'src', 'js', 'progression.js'), 'utf8') ===
    gitRaw('show 685dc9ec4:src/js/progression.js'));
  check('construct: scratch version stamp is the #13 bump (#14 sits after #13)',
    JSON.parse(fs.readFileSync(path.join(SCRATCH, 'version.json'), 'utf8')).version ===
    '09e57528e-20261107-233501');
} else {
  skipCheck('construct: scratch src checks', 'scratch-2bc17d793/ deleted per prereg (reproducible from git archive); construction was proven at run time, see evidence');
}

// --- Instruments: the 3 frozen files byte-identical across tips ---
const INSTR = [
  'scripts/doorwalk-b-driver-20261107.js',
  'scripts/policies/competent-doorwalk-b.js',
  'scripts/analyze-frozenband-bisect-20261107.js',
];
INSTR.forEach(function (f) {
  const tip = gitRaw('show 715c2918d:' + f);
  const mid15 = gitRaw('show d229b58f5:' + f);
  const mid14 = gitRaw('show 246ce6dc2:' + f);
  check('instrument: ' + f + ' byte-identical tip/mid15/mid14',
    tip === mid15 && tip === mid14);
  if (fs.existsSync(path.join(SCRATCH, f))) {
    check('instrument: scratch overlay of ' + f + ' matches branch tip',
      fs.readFileSync(path.join(SCRATCH, f), 'utf8') === tip);
  }
});
check('instrument: zero commits 246ce6dc2..HEAD touch any instrument file',
  git('log --oneline 246ce6dc2..HEAD -- scripts/doorwalk-b-driver-20261107.js scripts/policies/competent-doorwalk-b.js scripts/analyze-frozenband-bisect-20261107.js scripts/healerbisect-screen-20261108.js scripts/sim-harness.js scripts/sitstep-instrument-20261107.js scripts/policies/competent-stageally-a.js scripts/policies/competent-rally-bankkiller-b.js') === '');

// --- Require closure: the 17 files exist in scratch ---
const CLOSURE = [
  'scripts/doorwalk-b-driver-20261107.js', 'scripts/sim-harness.js',
  'scripts/policies/competent-stageally-a.js', 'scripts/policies/competent-rally-bankkiller-b.js',
  'scripts/policies/competent-doorwalk-b.js', 'scripts/sitstep-instrument-20261107.js',
  'scripts/stageally-instrument-20261106.js', 'scripts/bankkiller-instrument-20261105.js',
  'scripts/killerdeath-instrument-20261105.js', 'scripts/policies/competent.js',
  'scripts/policies/idle.js', 'scripts/policies/vinebank.js', 'scripts/policies/snareteach.js',
  'scripts/policies/conversation-pages.js', 'scripts/policies/competent-feastdrive-b.js',
  'scripts/policies/competent-linkdrive-b.js', 'scripts/policies/competent-linkfeast-b.js',
];
if (fs.existsSync(SCRATCH)) {
  const missing = CLOSURE.filter(function (f) { return !fs.existsSync(path.join(SCRATCH, f)); });
  check('closure: all 17 require files present in scratch', missing.length === 0, missing.join(', '));
} else {
  skipCheck('closure: 17 require files in scratch', 'scratch deleted; closure was proven before the smoke, see evidence');
}

// --- Corpus integrity: 8/8 seeds, 0 instrument errors, anchor = worktree tip ---
if (fs.existsSync(CORPUS)) {
  const files = fs.readdirSync(CORPUS).filter(function (f) {
    return f.indexOf('doorwalk-b-s') === 0 && f.endsWith('.json');
  }).sort();
  check('corpus: 8 per-seed JSONs present', files.length === 8, 'got ' + files.length);
  const seeds = files.map(function (f) { return parseInt(f.match(/s(\d+)-/)[1], 10); }).sort();
  check('corpus: seeds are exactly 53001..53008',
    JSON.stringify(seeds) === JSON.stringify([53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008]));
  let errors = 0, anchors = {};
  files.forEach(function (f) {
    const j = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    errors += (j.instrumentErrors || []).length;
    anchors[j.anchorCommit] = (anchors[j.anchorCommit] || 0) + 1;
  });
  check('corpus: 0 instrument errors on all 8 seeds', errors === 0, errors + ' errors');
  // The anchor is the worktree HEAD at sweep time (12-char prefix); the
  // evidence file records its value. The test pins consistency, not the
  // value, so later evidence commits do not break it.
  const anchorKeys = Object.keys(anchors);
  check('corpus: one shared 12-hex anchor in all 8 JSONs',
    anchorKeys.length === 1 && /^[0-9a-f]{12}$/.test(anchorKeys[0]),
    'anchors: ' + anchorKeys.join(', '));
  const sums = A.seedSummaries(CORPUS);
  const c = A.classify(sums);
  console.log('CORPUS pelletpass-alone: n=' + c.n + ' median=' + c.median + 'd sits=' + c.sits + '/8 verdict=' + c.verdict);
  check('corpus: analyzer classifies all 8 seeds (n=8)', c.n === 8);
} else {
  skipCheck('corpus: 8/8 + 0 errors + anchor', 'corpus not written yet (pre-sweep run)');
}

// --- Full-8 bars on the published fixture tables (shared analyzer) ---
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
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pelletpass-alone-proof-'));
function fixtureTable(days, sits) {
  // days: {seed: days}; sits: {seed: [seatDay, seatKind]} — mirrors the published tables.
  const rows = [53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008].map(function (s) {
    return { seed: s, days: days[s], end: days[s] >= 150 ? 'survived' : 'village-lost',
      sat: sits[s] ? sits[s][0] : null, seat: sits[s] ? sits[s][1] : null,
      standing: 199, wave: 4, w4: 0 };
  });
  return rows;
}
const dir14 = path.join(tmp, 'm14'), dir15 = path.join(tmp, 'm15'),
  dir16 = path.join(tmp, 'm16'), dirC = path.join(tmp, 'c');
writeDir(dir14, fixtureTable(
  { 53001: 67, 53002: 139, 53003: 45, 53004: 150, 53005: 54, 53006: 150, 53007: 59, 53008: 150 },
  { 53002: [90, 'lesser'], 53004: [90, 'lesser'], 53006: [90, 'lesser'], 53008: [141, 'lesser'] }));
writeDir(dir15, fixtureTable(
  { 53001: 67, 53002: 88, 53003: 65, 53004: 150, 53005: 150, 53006: 150, 53007: 50, 53008: 150 },
  { 53004: [90, 'lesser'], 53005: [99, 'lesser'], 53006: [90, 'lesser'], 53008: [141, 'lesser'] }));
writeDir(dir16, fixtureTable(
  { 53001: 105, 53002: 140, 53003: 65, 53004: 150, 53005: 150, 53006: 150, 53007: 50, 53008: 150 },
  { 53004: [90, 'lesser'], 53005: [99, 'lesser'], 53006: [90, 'lesser'], 53008: [97, 'lesser'] }));
writeDir(dirC, fixtureTable(
  { 53001: 88, 53002: 84, 53003: 68, 53004: 73, 53005: 54, 53006: 66, 53007: 63, 53008: 92 }, {}));
const c14 = A.classify(A.seedSummaries(dir14));
const c15 = A.classify(A.seedSummaries(dir15));
const c16 = A.classify(A.seedSummaries(dir16));
const cc = A.classify(A.seedSummaries(dirC));
check('bars: #14 fixture median 103 + sits 4/8 AMBIGUOUS',
  c14.median === 103 && c14.sits === 4 && c14.verdict === 'AMBIGUOUS',
  'got median=' + c14.median + ' sits=' + c14.sits + ' ' + c14.verdict);
check('bars: #15 fixture median 119 + sits 4/8 AMBIGUOUS (one day short)',
  c15.median === 119 && c15.sits === 4 && c15.verdict === 'AMBIGUOUS',
  'got median=' + c15.median + ' sits=' + c15.sits + ' ' + c15.verdict);
check('bars: #16 fixture median 145 + sits 4/8 HEALTHY',
  c16.median === 145 && c16.sits === 4 && c16.verdict === 'HEALTHY',
  'got median=' + c16.median + ' sits=' + c16.sits + ' ' + c16.verdict);
check('bars: collapsed fixture median 70.5 + sits 0/8 COLLAPSED',
  cc.median === 70.5 && cc.sits === 0 && cc.verdict === 'COLLAPSED',
  'got median=' + cc.median + ' sits=' + cc.sits + ' ' + cc.verdict);
// The GO bars: HEALED needs median >= 120 AND sits >= 4; a 119d median is
// AMBIGUOUS even with 4 sits — the median bar does real work.
check('bars: 119d + 4 sits is AMBIGUOUS, not HEALED (median bar binds)',
  c15.verdict === 'AMBIGUOUS');

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
