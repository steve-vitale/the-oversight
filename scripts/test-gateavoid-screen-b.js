// test-gateavoid-screen-b.js — M3k proof for sim-gateavoid-doorrich-b.
//
// The frozen screen rule (sim-gateavoid-doorrich-b-prereg.md): a fresh
// 8-seed band QUALIFIES for the judged legs iff its CONTROL probe shows
// >= 4 pool doors with >= 2 bad, where the pool is the control leg's
// fought doors whose leader entered <= 75 HP (projHp2 <= 25) and bad is
// the vFlee+vDie share of that pool — the exact population the analyzer
// reports as projPool / projPoolBad.
//
// This test proves the RULE, not the data: it calls the analyzer's own
// doorStats (the computation the judge uses) over fixture corpora and
// over the real gateavoid-b probe corpus, and asserts the qualify /
// reject boundary on all four sides of it.
//
//   §1 fixture: 4 pool doors, 2 bad (vFlee + vDie) → QUALIFIES.
//   §2 fixture: 4 pool doors, 1 bad → does NOT qualify (bad floor binds).
//   §3 fixture: 3 pool doors, 2 bad → does NOT qualify (pool floor binds).
//   §4 real data: the gateavoid-b probe corpus (pool 1, bad 0) → does NOT
//       qualify — the band this arm exists to replace.
//   §5 old-code-fails control: the rule with the pool threshold dropped
//       to >= 1 (and no bad floor) WOULD qualify the gateavoid-b probe
//       corpus — so a dropped threshold fails §4's assertion, proving the
//       strict rule is doing work and the test is not vacuous.
//   §6 boundary exactness: pool exactly 4 with bad exactly 2 is the
//       minimum qualifying case; pool 4 / bad 2 qualifies, pool 4 / bad 1
//       does not (re-asserted numerically, not by re-running §1/§2).
//
// Fixtures are synthetic v4encounters rows shaped exactly like the
// analyzer's input (origin 'expedition', allyFromStart, pinned,
// wave >= 4, rounds >= 1, leaderEntryHp). Temp dirs live under
// os.tmpdir() — nothing is written into the repo. The real-corpus check
// reads evidence/2026-11-23/perseed-gateavoid-b-probe/ read-only.
//
// Usage: node scripts/test-gateavoid-screen-b.js
// Exit 0 when every check passes; prints "N passed, 0 failed".
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const analyzer = require(path.join(REPO, 'scripts', 'analyze-gateavoid-b.js'));

const MIN_POOL = 4;
const MIN_BAD = 2;

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// The screen rule, parameterized so §5 can run the dropped-threshold
// variant against the same computation.
function screenResult(corpora, minPool, minBad) {
  const stats = analyzer.doorStats(corpora);
  return {
    pool: stats.projPool, bad: stats.projPoolBad,
    badRate: stats.projPoolBadRate, fought: stats.fought,
    qualifies: stats.projPool >= minPool && stats.projPoolBad >= minBad,
  };
}
function qualifies(corpora) { return screenResult(corpora, MIN_POOL, MIN_BAD); }

function doorRow(seed, day, mid, outcome, leaderEntryHp) {
  return {
    origin: 'expedition', allyFromStart: true, pinned: true, wave: 4,
    day: day, mid: mid, rounds: 4, outcome: outcome, mDealt: 1000,
    leaderEntryHp: leaderEntryHp, doorHold: 0, everHopeless: false,
  };
}
function corpusFile(seed, rows) {
  return { file: 'fixture-s' + seed + '.json', data: { seed: seed, v4encounters: rows } };
}
function writeCorpusDir(dir, files) {
  fs.mkdirSync(dir, { recursive: true });
  files.forEach(function (f, i) {
    fs.writeFileSync(path.join(dir, 'fixture-' + i + '.json'), JSON.stringify(f.data));
  });
}
function readCorpusDir(dir) {
  return fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort().map(function (f) {
    return { file: f, data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) };
  });
}

(async function main() {
  // ---------- §1 4-pool / 2-bad QUALIFIES ----------
  const fourTwo = [
    corpusFile(1, [doorRow(1, 50, 'rerun', 'vFlee', 40), doorRow(1, 90, 'eater', 'vDie', 60)]),
    corpusFile(2, [doorRow(2, 70, 'reunion', 'vKill', 38), doorRow(2, 120, 'editor', 'vKill', 70)]),
    corpusFile(3, [doorRow(3, 60, 'spoiler', 'vKill', 95)]), // safe band: not pool
  ];
  const r1 = qualifies(fourTwo);
  check('§1 4-pool / 2-bad fixture qualifies (pool 4, bad 2)', r1.qualifies && r1.pool === 4 && r1.bad === 2, r1);
  check('§1 the safe-band door is not counted in the pool (fought 5, pool 4)', r1.fought === 5 && r1.pool === 4, r1);

  // ---------- §2 4-pool / 1-bad does NOT qualify ----------
  const fourOne = [
    corpusFile(1, [doorRow(1, 50, 'rerun', 'vFlee', 40)]),
    corpusFile(2, [doorRow(2, 70, 'reunion', 'vKill', 38), doorRow(2, 120, 'editor', 'vKill', 70)]),
    corpusFile(3, [doorRow(3, 80, 'cancellation', 'vKill', 55)]),
  ];
  const r2 = qualifies(fourOne);
  check('§2 4-pool / 1-bad fixture does NOT qualify (bad floor binds)', !r2.qualifies && r2.pool === 4 && r2.bad === 1, r2);

  // ---------- §3 3-pool / 2-bad does NOT qualify ----------
  const threeTwo = [
    corpusFile(1, [doorRow(1, 50, 'rerun', 'vFlee', 40), doorRow(1, 90, 'eater', 'vDie', 60)]),
    corpusFile(2, [doorRow(2, 70, 'reunion', 'vKill', 38)]),
  ];
  const r3 = qualifies(threeTwo);
  check('§3 3-pool / 2-bad fixture does NOT qualify (pool floor binds)', !r3.qualifies && r3.pool === 3 && r3.bad === 2, r3);

  // ---------- §4 real gateavoid-b probe corpus does NOT qualify ----------
  const probeDir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-gateavoid-b-probe');
  const probe = readCorpusDir(probeDir);
  const r4 = qualifies(probe);
  check('§4 gateavoid-b probe corpus reads pool 1, bad 0 (the known table)', r4.pool === 1 && r4.bad === 0 && r4.fought === 2, r4);
  check('§4 gateavoid-b probe corpus does NOT qualify under the frozen rule', !r4.qualifies, r4);

  // ---------- §5 old-code-fails control: dropped thresholds qualify it ----------
  const loose = screenResult(probe, 1, 0);
  check('§5 dropped-threshold rule (pool >= 1, bad >= 0) WOULD qualify the probe corpus', loose.qualifies === true, loose);
  check('§5 ...so the strict rule is doing work: strict rejects what loose accepts', !r4.qualifies && loose.qualifies, { strict: r4.qualifies, loose: loose.qualifies });
  const looseBad = screenResult(probe, 1, 1);
  check('§5 a pool-only drop (pool >= 1, bad >= 1) still rejects the 0-bad probe corpus', !looseBad.qualifies && looseBad.pool === 1 && looseBad.bad === 0, looseBad);

  // ---------- §6 boundary exactness, via temp dirs (disk round-trip) ----------
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gateavoid-screen-b-'));
  try {
    const dirA = path.join(tmp, 'four-two');
    writeCorpusDir(dirA, fourTwo.map(function (f) { return f; }));
    const rA = qualifies(readCorpusDir(dirA));
    check('§6 disk round-trip: 4-pool / 2-bad still qualifies after write+read', rA.qualifies && rA.pool === 4 && rA.bad === 2, rA);
    const dirB = path.join(tmp, 'four-one');
    writeCorpusDir(dirB, fourOne.map(function (f) { return f; }));
    const rB = qualifies(readCorpusDir(dirB));
    check('§6 disk round-trip: 4-pool / 1-bad still rejected after write+read', !rB.qualifies && rB.pool === 4 && rB.bad === 1, rB);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }

  console.log('test-gateavoid-screen-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-gateavoid-screen-b FATAL', e && e.stack || e); process.exit(1); });
