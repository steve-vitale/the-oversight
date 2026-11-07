'use strict';
// test-durablepair-20261106.js — proof for the durable-pair judge
// (evidence/2026-11-06/sim-durablepair-a-prereg.md). Run:
//   node scripts/test-durablepair-20261106.js
// Sections:
//   D1 judge logic on synthetic fixtures — every branch of judgePairSeed:
//      durable (both deaths > +14d), fleeting (deaths within 14d),
//      living-at-end (livingKillers==2, no transcript), UNJUDGED (no
//      transcript, livingKillers<2), boundary (death exactly +14d is NOT
//      durable; +15d is), one-alive-one-fleeting, >2 killers (pair is the
//      FIRST two by first-kill day), OFF-leg pair counted on OFF.
//   D2 corpus fidelity — the judge run on the committed stripped corpus
//      (evidence/2026-11-06/durablepair-corpus/, byte-identical transcript
//      copies + field projections of the drive64 panels; full-corpus
//      sha256 recorded in the prereg) reproduces the published pair lists
//      and pooled counts (gate) and yields the durable verdict.
// No game code is touched; the judge is measurement only.
const fs = require('fs');
const path = require('path');

const repo = path.join(__dirname, '..');
const { judge, judgePairSeed, firstTwoKillers } = require(path.join(repo, 'scripts', 'durablepair-judge-20261106'));

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}

function row(seed, extra, days) {
  return { seed, days: days || 150, endReason: 'survived', extra };
}
function transcript(seed, kills, deaths) {
  return { seed, kills, killersDeathDay: deaths, sayLines: [] };
}

// ---- D1: synthetic fixtures ----
{
  // Durable: second kill d101, deaths +16/+22.
  const r = row(1, { pairFormed: 1, firstKillDay: 101, secondKillDay: 101, livingKillers: 0 });
  const t = transcript(1, [
    { day: 101, by: 'a', byName: 'A' }, { day: 101, by: 'b', byName: 'B' },
  ], { a: 117, b: 123 });
  const p = judgePairSeed(r, t);
  check('D1 durable pair (deaths +16/+22)', p.durable === true, 'got ' + p.durable + ' ' + p.reason);
  check('D1 durable reason names 16/22d', /16\/22/.test(p.reason), p.reason);

  // Fleeting: deaths +1/+9.
  const r2 = row(2, { pairFormed: 1, firstKillDay: 89, secondKillDay: 89, livingKillers: 0 });
  const t2 = transcript(2, [
    { day: 89, by: 'c', byName: 'C' }, { day: 89, by: 'd', byName: 'D' },
  ], { c: 98, d: 90 });
  check('D1 fleeting pair (deaths +9/+1)', judgePairSeed(r2, t2).durable === false);

  // Living at end: no transcript, livingKillers==2.
  const r3 = row(3, { pairFormed: 1, firstKillDay: 50, secondKillDay: 52, livingKillers: 2 });
  const p3 = judgePairSeed(r3, null);
  check('D1 living-at-end pair durable without transcript', p3.durable === true, p3.reason);

  // Unjudged: no transcript, livingKillers 0.
  const r4 = row(4, { pairFormed: 1, firstKillDay: 50, secondKillDay: 52, livingKillers: 0 });
  const p4 = judgePairSeed(r4, null);
  check('D1 no-transcript pair is UNJUDGED (null, never durable)', p4.durable === null, 'got ' + p4.durable);

  // Boundary: death exactly +14d is NOT durable (strict >14 rule).
  const r5 = row(5, { pairFormed: 1, firstKillDay: 100, secondKillDay: 100, livingKillers: 0 });
  const t5 = transcript(5, [
    { day: 100, by: 'e', byName: 'E' }, { day: 100, by: 'f', byName: 'F' },
  ], { e: 114, f: 130 });
  check('D1 boundary death at +14d is NOT durable', judgePairSeed(r5, t5).durable === false);
  // Control: death at +15d IS durable.
  const t5b = transcript(5, [
    { day: 100, by: 'e', byName: 'E' }, { day: 100, by: 'f', byName: 'F' },
  ], { e: 115, f: 130 });
  check('D1 control death at +15d IS durable', judgePairSeed(r5, t5b).durable === true);

  // One alive, one fleeting: not durable.
  const t6 = transcript(6, [
    { day: 100, by: 'g', byName: 'G' }, { day: 100, by: 'h', byName: 'H' },
  ], { g: 103 });
  const r6 = row(6, { pairFormed: 1, firstKillDay: 100, secondKillDay: 100, livingKillers: 0 });
  check('D1 one-alive-one-fleeting is NOT durable', judgePairSeed(r6, t6).durable === false);

  // >2 killers: the pair is the FIRST two by first-kill day; later
  // killers (even long-lived ones) do not rescue a fleeting first pair.
  const kills7 = [
    { day: 87, by: 'k1', byName: 'K1' }, { day: 88, by: 'k2', byName: 'K2' },
    { day: 110, by: 'k3', byName: 'K3' }, { day: 134, by: 'k4', byName: 'K4' },
  ];
  check('D1 firstTwoKillers picks first two by day',
    JSON.stringify(firstTwoKillers(kills7).map(k => k.by)) === '["k1","k2"]');
  const t7 = transcript(7, kills7, { k1: 88, k2: 89, k3: 131, k4: 146 });
  const r7 = row(7, { pairFormed: 1, firstKillDay: 87, secondKillDay: 88, livingKillers: 0 });
  check('D1 later killers do not rescue a fleeting first pair', judgePairSeed(r7, t7).durable === false);

  // OFF leg: the judge counts a durable pair wherever it forms — it
  // never assumes OFF is zero.
  const offRep = { runs: [row(11, { pairFormed: 1, firstKillDay: 101, secondKillDay: 101, livingKillers: 0, w4Kills: 2, w4Killers: 2 })] };
  const onRep = { runs: [row(12, { pairFormed: 0, firstKillDay: 0, secondKillDay: 0, livingKillers: 0, w4Kills: 0, w4Killers: 0 })] };
  // judge() hardcodes the published drive64 gate; synthetic panels fail
  // it by design — so assert on armStats-level behavior via judgePairSeed
  // here, and let D2 cover the gate on the real corpus.
  const offPair = judgePairSeed(offRep.runs[0], transcript(11, [
    { day: 101, by: 'm', byName: 'M' }, { day: 101, by: 'n', byName: 'N' },
  ], { m: 120, n: 125 }));
  check('D1 OFF-leg durable pair is counted durable', offPair.durable === true);
}

// ---- D2: committed stripped corpus ----
{
  const dir = path.join(repo, 'evidence', '2026-11-06', 'durablepair-corpus');
  const off = JSON.parse(fs.readFileSync(path.join(dir, 'drive64-panel-off-stripped.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(dir, 'drive64-panel-on-stripped.json'), 'utf8'));
  const j = judge(off, on, dir);
  check('D2 gate reproduces published pair lists + counts', j.gate.all === true, JSON.stringify(j.gate));
  check('D2 OFF durable 0', j.off.durablePairs === 0, 'got ' + j.off.durablePairs);
  check('D2 ON durable 1 (seed 99063)', j.on.durablePairs === 1 && JSON.stringify(j.on.durableSeeds) === '[99063]',
    'got ' + j.on.durablePairs + ' ' + JSON.stringify(j.on.durableSeeds));
  check('D2 ON count pairs 4', j.on.pairs === 4, 'got ' + j.on.pairs);
  check('D2 no unjudged pairs', j.on.unjudgedPairs === 0 && j.off.unjudgedPairs === 0);
  check('D2 verdict is NO-GO on the durable bar (ON 1 < 2)', j.verdict === 'NO-GO', 'got ' + j.verdict);
  check('D2 over-credit ratio 4 -> 1 (0.25)',
    j.on.pairs === 4 && j.on.durablePairs === 1, j.on.pairs + '->' + j.on.durablePairs);
  check('D2 99063 anatomy: survived 16/22d',
    JSON.stringify(j.on.pairRows.find(p => p.seed === 99063).killers.map(k => k.survivedAfterSecondKill)) === '[16,22]');
  check('D2 99091 fleeting: survived 9/1d',
    JSON.stringify(j.on.pairRows.find(p => p.seed === 99091).killers.map(k => k.survivedAfterSecondKill)) === '[9,1]');
  check('D2 99854 fleeting: survived 0/1d',
    JSON.stringify(j.on.pairRows.find(p => p.seed === 99854).killers.map(k => k.survivedAfterSecondKill)) === '[0,1]');
  check('D2 99866 fleeting: survived 3/5d',
    JSON.stringify(j.on.pairRows.find(p => p.seed === 99866).killers.map(k => k.survivedAfterSecondKill)) === '[3,5]');
  check('D2 wall: OFF w4reach 45 / w5reach 1 / medD 100',
    j.off.wave4reach === 45 && j.off.wave5reach === 1 && j.off.medianDays === 100,
    `${j.off.wave4reach}/${j.off.wave5reach}/${j.off.medianDays}`);
  check('D2 wall: ON w4reach 47 / w5reach 2 / medD 93',
    j.on.wave4reach === 47 && j.on.wave5reach === 2 && j.on.medianDays === 93,
    `${j.on.wave4reach}/${j.on.wave5reach}/${j.on.medianDays}`);
  check('D2 wall: national/table/wins 0 both arms',
    j.off.national === 0 && j.off.table === 0 && j.off.won === 0 &&
    j.on.national === 0 && j.on.table === 0 && j.on.won === 0);
  check('D2 fresh-48 durable: ON 1 / OFF 0',
    j.on.pairRows.filter(p => p.seed >= 99053 && p.seed <= 99100 && p.durable === true).length === 1 &&
    j.off.pairRows.filter(p => p.seed >= 99053 && p.seed <= 99100 && p.durable === true).length === 0);
}

console.log(failures === 0 ? 'ALL DURABLEPAIR PROOF CHECKS PASS' : failures + ' DURABLEPAIR PROOF CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
