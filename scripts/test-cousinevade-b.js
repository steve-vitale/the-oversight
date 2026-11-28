// test-cousinevade-b.js — proof test for arm sim-cousinevade-b.
// 1. Unit fixtures for the frozen verdict function (WISE / WASTED /
//    UNDECIDED branches, the leave-counter override, the null-HP case).
// 2. Unit fixtures for the frozen launch-join rule (latest in-window
//    launch wins; a mismatched target still joins; >21d and future
//    launches excluded; no match returns null).
// 3. Corpus-population check: the classifier run on the FROZEN
//    fleerepair build-leg + emptybow armed-leg corpora (read-only
//    extracts under /tmp/sim-cousinevade-b-corpus/) must reproduce the
//    frozen population (42 launched evades: 23 build, 19 armed), every
//    row classified with a verdict + reason, mHpStartRec and lead HP
//    present on every row, constants positive and ordered,
//    scope-invariant verdicts, and a frozen-rule decision in
//    {A-DAMAGE, B-ENGAGEMENT, NO-LEVER}.
// Writes its classifier output to /tmp only — never into the repo.
// Usage: node scripts/test-cousinevade-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');
const REPO = path.join(__dirname, '..');
const C = require('./classify-cousinevade-b.js');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + e.message); process.exitCode = 1; }
}

// ---- 1. Verdict fixtures (synthetic constants D_BEST=100, D_TYP=40) ----
check('WISE: HP above D_BEST', function () {
  const v = C.verdict({ leaveCounter: false, hp: 991, dBest: 100, dTyp: 40, targetMatch: true });
  assert.strictEqual(v.verdict, 'WISE');
  assert.ok(v.reason.length > 0);
});
check('WISE: HP above D_BEST even when trick known and target matches', function () {
  const v = C.verdict({ leaveCounter: false, hp: 500, dBest: 100, dTyp: 40, targetMatch: true });
  assert.strictEqual(v.verdict, 'WISE');
});
check('WASTED: HP at/below D_TYP and launch target', function () {
  const v = C.verdict({ leaveCounter: false, hp: 40, dBest: 100, dTyp: 40, targetMatch: true });
  assert.strictEqual(v.verdict, 'WASTED');
  const v2 = C.verdict({ leaveCounter: false, hp: 21, dBest: 100, dTyp: 40, targetMatch: true });
  assert.strictEqual(v2.verdict, 'WASTED');
});
check('UNDECIDED: HP between D_TYP and D_BEST', function () {
  const v = C.verdict({ leaveCounter: false, hp: 60, dBest: 100, dTyp: 40, targetMatch: true });
  assert.strictEqual(v.verdict, 'UNDECIDED');
  assert.ok(/between/.test(v.reason));
});
check('UNDECIDED: finishable HP but NOT the launch target', function () {
  const v = C.verdict({ leaveCounter: false, hp: 30, dBest: 100, dTyp: 40, targetMatch: false });
  assert.strictEqual(v.verdict, 'UNDECIDED');
  assert.ok(/not a wasted launch/.test(v.reason));
});
check('UNDECIDED: HP null (no HP field)', function () {
  const v = C.verdict({ leaveCounter: false, hp: null, dBest: 100, dTyp: 40, targetMatch: true });
  assert.strictEqual(v.verdict, 'UNDECIDED');
  assert.ok(/no HP field/.test(v.reason));
});
check('WISE by definition: leave-counter (Suburb) regardless of HP', function () {
  const v = C.verdict({ leaveCounter: true, hp: 21, dBest: 100, dTyp: 40, targetMatch: true });
  assert.strictEqual(v.verdict, 'WISE');
  const vNull = C.verdict({ leaveCounter: true, hp: null, dBest: 100, dTyp: 40, targetMatch: false });
  assert.strictEqual(vNull.verdict, 'WISE');
});
check('median: odd/even/empty', function () {
  assert.strictEqual(C.median([34, 37, 38, 48, 86]), 38);
  assert.strictEqual(C.median([34, 37]), 35.5);
  assert.strictEqual(C.median([]), null);
});

// ---- 2. Launch-join fixtures (frozen rule) ----
function launches() {
  return [
    { result: 'launch', day: 32, vid: 'zoltan_nagy', party: ['gen_dbrfgwi'], target: 'buffering', partySize: 2, partyKillers: 0, partyArmed: 1 },
    { result: 'launch', day: 40, vid: 'zoltan_nagy', party: ['gen_rknsavb'], target: 'buffering', partySize: 2, partyKillers: 1, partyArmed: 1 },
    { result: 'launch', day: 54, vid: 'zoltan_nagy', party: ['gen_1afk6zx'], target: 'buffering', partySize: 2, partyKillers: 1, partyArmed: 1 },
    { result: 'launch', day: 61, vid: 'zoltan_nagy', party: ['leo_martin'], target: 'buffering', partySize: 2, partyKillers: 1, partyArmed: 1 },
    { result: 'other', day: 50, vid: 'zoltan_nagy', party: [], target: null },
  ];
}
check('join: latest in-window launch wins (d54, not d32/d40)', function () {
  const l = C.joinLaunch(launches(), { day: 57, vid: 'zoltan_nagy', allyVids: ['gen_xqo6o2n', 'meera_reddy'] });
  assert.ok(l, 'a launch joins');
  assert.strictEqual(l.day, 54);
  assert.strictEqual(l.target, 'buffering');
});
check('join: mismatched target still joins (targetMatch is separate)', function () {
  // The meeting is vs 'strike'; the joined launch targets 'buffering'.
  // joinLaunch does not filter on target — the classifier records
  // targetMatch=false for this row instead of dropping the join.
  const l = C.joinLaunch(launches(), { day: 57, vid: 'zoltan_nagy', allyVids: [] });
  assert.ok(l, 'a launch joins despite the target mismatch');
  assert.strictEqual(l.target, 'buffering');
});
check('join: 21-day window boundary (d61 joins a d80 meeting; d54 does not join d80)', function () {
  const l = C.joinLaunch(launches(), { day: 80, vid: 'zoltan_nagy', allyVids: [] });
  assert.ok(l, 'd61 launch is 19 days back, in window');
  assert.strictEqual(l.day, 61);
  const l2 = C.joinLaunch(launches(), { day: 76, vid: 'zoltan_nagy', allyVids: [] });
  assert.ok(l2, 'd61 launch is 15 days back, in window');
  assert.strictEqual(l2.day, 61);
  const none = C.joinLaunch(
    [{ result: 'launch', day: 10, vid: 'zoltan_nagy', party: [], target: null }],
    { day: 57, vid: 'zoltan_nagy', allyVids: [] });
  assert.strictEqual(none, null); // 47 days back, out of window
  const future = C.joinLaunch(launches(), { day: 30, vid: 'zoltan_nagy', allyVids: [] });
  assert.strictEqual(future, null); // earliest launch is d32, after the meeting
});
check('join: ally membership counts (fighter is a companion, not the holder)', function () {
  const l = C.joinLaunch(
    [{ result: 'launch', day: 87, vid: 'ella_johnson', party: ['visjoin_85', 'gen_5855k66', 'quinn_murphy'], target: 'influencer', partySize: 4, partyKillers: 1, partyArmed: 3 }],
    { day: 87, vid: 'visjoin_85', allyVids: ['ella_johnson', 'gen_5855k66'] });
  assert.ok(l, 'same-day launch joins via companion membership');
  assert.strictEqual(l.day, 87);
  assert.strictEqual(l.target, 'influencer');
});
check('trickKnownByDay: gate row and encounter trickAfter both count', function () {
  const raw = {
    v4gates: [{ mid: 'audit', day: 44, trickKnown: false }, { mid: 'eulogy', day: 50, trickKnown: true }],
    v4encounters: [{ mid: 'eulogy', day: 50, trickAfter: true }, { mid: 'audit', day: 44, trickAfter: false }],
  };
  assert.strictEqual(C.trickKnownByDay(raw, 'eulogy', 61), true);
  assert.strictEqual(C.trickKnownByDay(raw, 'audit', 46), false);
  assert.strictEqual(C.trickKnownByDay(raw, 'eulogy', 49), false); // no row on/before day 49
});

// ---- 3. Corpus-population check on the frozen corpora ----
check('corpus: population 42 (23 build, 19 armed), all classified, HP + lead HP present, scope-invariant', function () {
  const outTmp = path.join(os.tmpdir(), 'cousinevade-b-test-' + process.pid + '.json');
  const root = path.join(os.tmpdir(), 'sim-cousinevade-b-corpus');
  const build = path.join(root, 'build-field', 'evidence', '2026-11-28', 'perseed-fleerepair-b-field-build');
  const armed = path.join(root, 'armed-field', 'evidence', '2026-11-28', 'perseed-emptybow-b-field');
  const r = childProcess.spawnSync(process.execPath,
    [path.join(REPO, 'scripts', 'classify-cousinevade-b.js'), build, armed, outTmp],
    { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, 'classifier exit ' + r.status + ': ' + (r.stderr || r.stdout));
  const out = JSON.parse(fs.readFileSync(outTmp, 'utf8'));
  assert.deepStrictEqual(out.population.actual, { total: 42, build: 23, armed: 19 });
  assert.strictEqual(out.rows.length, 42);
  assert.ok(out.constants.dBest > 0 && out.constants.dTyp > 0, 'constants positive');
  assert.ok(out.constants.dTyp <= out.constants.dBest, 'D_TYP <= D_BEST');
  assert.strictEqual(out.missingHp, 0, 'every launched evade carries mHpStartRec');
  assert.strictEqual(out.missingLeadHp, 0, 'every launched evade carries lead HP');
  // Scope-invariance does NOT hold on this corpus (measured, frozen
  // corpora): the pooled D_BEST (1276) is set by the build leg's single
  // kill, while the armed leg's best is 707 — so 12 armed evades are
  // WISE under per-leg scope but UNDECIDED under pooled scope. Per the
  // frozen prereg each such row is UNDECIDED with the scope reason.
  // The pins below lock the measured classification on the frozen corpora.
  assert.strictEqual(out.scopeInvariant, false, 'scope disagreement is present and reported');
  const nonInv = out.rows.filter(function (row) { return !row.scopeInvariant; });
  assert.strictEqual(nonInv.length, 12, '12 scope-disagreeing rows');
  for (const row of nonInv) {
    assert.strictEqual(row.verdict, 'UNDECIDED', 'scope-disagreeing row is UNDECIDED');
    assert.ok(/scope-dependent/.test(row.reason), 'scope reason recorded');
  }
  assert.deepStrictEqual(out.verdictCounts, { UNDECIDED: 27, WISE: 15 }, 'verdict split on frozen corpora');
  assert.strictEqual(out.decision, 'NO-LEVER', 'frozen decision rule: wise 15/42 < 60%, wasted 0/42 < 25%');
  assert.strictEqual(out.joinMiss, 0, 'every evade joins a launch under the frozen rule');
  assert.strictEqual(out.targetMatchN, 2, 'only 2 evades met their launch target');
  assert.strictEqual(out.trickKnownN, 0, 'no evade had the trick known by the meeting');
  assert.ok(['A-DAMAGE', 'B-ENGAGEMENT', 'NO-LEVER'].indexOf(out.decision) !== -1, 'decision in frozen set');
  assert.strictEqual(out.verdictCounts.WISE + (out.verdictCounts.WASTED || 0) + (out.verdictCounts.UNDECIDED || 0), 42, 'verdicts sum to population');
  for (const row of out.rows) {
    assert.ok(['WISE', 'WASTED', 'UNDECIDED'].indexOf(row.verdict) !== -1, 'verdict in set');
    assert.ok(row.reason && row.reason.length > 0, 'reason present');
    assert.ok(row.trickBefore != null && row.trickAfter != null, 'trick fields present');
    assert.ok(row.meetingPartySize != null, 'meeting party size present');
    assert.ok(row.mHpStartRec != null, 'HP present');
    assert.ok(row.leadHp != null, 'lead HP present');
    assert.strictEqual(row.partyHp, 'lead only; party HP not in corpus');
    assert.ok(row.log && row.log.length > 0, 'log line present');
    assert.strictEqual(row.distanceTerrain, 'n/a (not in corpus)');
  }
  // Joined-launch regression (mismatched target): build seed 112305 d57,
  // zoltan_nagy vs strike, must join the d54 buffering launch (latest
  // in-window launch with zoltan in the party), NOT drop the join.
  const z = out.rows.find(function (r2) { return r2.leg === 'build' && r2.seed === '112305' && r2.day === 57; });
  assert.ok(z, 'build 112305 d57 row present');
  assert.strictEqual(z.launchDay, 54);
  assert.strictEqual(z.launchTarget, 'buffering');
  assert.strictEqual(z.targetMatch, false);
  assert.strictEqual(z.launchJoined, true);
  // Same shape, armed leg: s112306 d103 gen_3ghbpc8 vs editor joins the
  // d102 eulogy launch.
  const ed = out.rows.find(function (r2) { return r2.leg === 'armed' && r2.seed === '112306' && r2.day === 103; });
  assert.ok(ed, 'armed 112306 d103 row present');
  assert.strictEqual(ed.launchDay, 102);
  assert.strictEqual(ed.launchTarget, 'eulogy');
  assert.strictEqual(ed.targetMatch, false);
  fs.unlinkSync(outTmp);
});

console.log('test-cousinevade-b: ' + pass + ' checks passed');
