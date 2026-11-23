// analyze-departsafe-a.js — JUDGE, arm sim-departsafe-a
// (Loop A run fleshout-20261123T1115Z, axis scale-onramp).
// Implements the FROZEN prereg §7 bars exactly — nothing else
// decides the verdict. The balanced panel is the instrument; this
// file is the judge. Three legs on identical seeds (band
// 107601-107616, 150d death-aware, tableseat-nowait policy):
//   ctl  — PROFILEGATE4 unset, DEPARTSAFE unset, OLD code.
//   lift — PROFILEGATE4=1, DEPARTSAFE unset, NEW code (reference:
//          the dawnchoke gate alone; descriptive only).
//   arm  — PROFILEGATE4=1, DEPARTSAFE=1, NEW code (the judged leg).
// FROZEN BARS (prereg §7):
//   (1) Instrument validity — proof test 100% (run by this judge
//       as a child process), dawnchoke analyzer --selftest 100%
//       (run in-process), departsafe judge --selftest 100% (run
//       in-process), 0 instrument errors on all 48 seed files.
//   (2) Det-gate (extended bound) — ctl 0 first-release rows AND
//       0 departSafeCalls rows on all 16 seeds, pre-bound streams
//       identical under order-insensitive canonicalization, first
//       divergence on a lever-effect day, anchor checks pass with
//       expected values actually compared (missing expectation =
//       FAIL, never vacuous).
//   (3) PRIMARY launches — arm >= 1.25x ctl (wave-4+ brain-path
//       launches, analyzeSeed launchesN).
//   (4) GUARDRAIL total deaths — arm mean <= 1.05x ctl mean.
//   (5) Survival — arm median gameDays >= 0.8x ctl median.
//   (6) Starvation — arm total <= ctl total + 2.
//   (7) NO-GO rule — any of bars 2-6 missed -> NO-GO.
// Zero-launch rule: either leg < 5 wave-4+ launches -> INCONCLUSIVE.
// Pilot GO (proceed to confirm) iff instrument valid + det-gate
// passes on the pilot seeds + lift launches > ctl launches +
// safety holds fired >= 1 on the arm leg; else stop
// INCONCLUSIVE-at-pilot. Use --pilot with the pilot seeds.
// Usage:
//   node scripts/analyze-departsafe-a.js --ctl <dir> --lift <dir> --arm <dir> --out <file>
//     [--seeds 107601,...] [--ctl-anchor <sha> --arm-anchor <sha>]
//     [--ctl-brain <sha> --arm-brain <sha> --ctl-winplan <sha> --arm-winplan <sha>]
//     [--lift-anchor <sha> --lift-brain <sha> --lift-winplan <sha>] [--pilot]
//   node scripts/analyze-departsafe-a.js --selftest
// RE-JUDGE (sim-departsafe-rejudge-a prereg §6): --proof-frozen
// <frozen-departsafe-judge.json> takes the proof-test result from
// the frozen departsafe judge JSON's instrumentRuns.proofPass
// instead of running scripts/test-departsafe-a.js (the proof test
// asserts lever behavior; the lever is held on sim-departsafe-a
// and absent from a re-judge tree by design). A missing file or a
// recorded proofPass that is not true FAILS bar 1; the source file
// is recorded in the output's instrumentRuns.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const dawnchoke = require(path.join(REPO, 'scripts', 'analyze-dawnchoke-a.js'));
const analyzeSeed = dawnchoke.analyzeSeed;
const detGateForSeed = dawnchoke.detGateForSeed;
const median = dawnchoke.median;

function loadLeg(dir, filemode, seeds) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, 'dawnchoke-a-s' + seed + '-dawnchoke-a-' + filemode + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(analyzeSeed(JSON.parse(fs.readFileSync(fp, 'utf8'))));
  }
  return rows;
}

function wallOf(rows) {
  const sum = function (f) { return rows.reduce(function (a, r) { return a + (f(r) || 0); }, 0); };
  return { wins: sum(function (r) { return r.won ? 1 : 0 }),
    national: sum(function (r) { return r.scaleRank === 'national' ? 1 : 0 }),
    wave5: sum(function (r) { return (r.maxWave | 0) >= 5 ? 1 : 0 }),
    wave4: sum(function (r) { return (r.maxWave | 0) >= 4 ? 1 : 0 }),
    medianSurvival: median(rows.map(function (r) { return r.gameDays; })),
    maxSurvival: Math.max.apply(null, rows.map(function (r) { return r.gameDays; })),
    villagesLost: sum(function (r) { return r.villageLost ? 1 : 0 }) };
}

function safetyCensus(rows) {
  const tot = { calls: 0, judged: 0, holds: 0, passes: 0, skips: 0, holdReasons: {}, firstSafetyDay: null };
  for (const r of rows) {
    tot.calls += (r.raw.departSafeCalls || []).length;
    tot.judged += r.safetyCalls || 0;
    tot.holds += r.safetyHolds || 0;
    tot.passes += r.safetyPasses || 0;
    tot.skips += r.safetySkips || 0;
    for (const c of (r.raw.departSafeCalls || [])) {
      if (c.skipped) continue;
      for (const f of (c.fails || [])) {
        for (const reason of (f.reasons || [])) tot.holdReasons[reason] = (tot.holdReasons[reason] || 0) + 1;
      }
    }
    if (r.firstSafetyDay != null && (tot.firstSafetyDay == null || r.firstSafetyDay < tot.firstSafetyDay)) tot.firstSafetyDay = r.firstSafetyDay;
  }
  return tot;
}

function anchorChecksFor(rows, opts, prefix) {
  const checks = [];
  function checkAnchor(field, expected, label, usePrefix) {
    if (expected == null) {
      checks.push({ label: label, checked: true, pass: false, reason: 'expected value not supplied' });
      return;
    }
    const bad = rows.filter(function (r) {
      const v = r[field];
      if (v == null) return true;
      return usePrefix ? String(v).slice(0, 12) !== String(expected).slice(0, 12) : v !== expected;
    });
    checks.push({ label: label, checked: true, pass: bad.length === 0,
      badSeeds: bad.map(function (r) { return r.seed; }) });
  }
  checkAnchor('anchorCommit', opts[prefix + 'Anchor'], prefix + ' anchorCommit', true);
  checkAnchor('brainSha', opts[prefix + 'Brain'], prefix + ' villager-brain.js', false);
  checkAnchor('winplanSha', opts[prefix + 'Winplan'], prefix + ' win-plan.js', false);
  return checks;
}

function judgeLegs(ctlRows, liftRows, armRows, opts) {
  opts = opts || {};
  const sum = function (rows, f) { return rows.reduce(function (a, r) { return a + (f(r) || 0); }, 0); };
  const ctlLaunches = sum(ctlRows, function (r) { return r.launchesN; });
  const liftLaunches = sum(liftRows, function (r) { return r.launchesN; });
  const armLaunches = sum(armRows, function (r) { return r.launchesN; });
  const ctlDeaths = sum(ctlRows, function (r) { return r.deaths; });
  const liftDeaths = sum(liftRows, function (r) { return r.deaths; });
  const armDeaths = sum(armRows, function (r) { return r.deaths; });
  const n = ctlRows.length;
  const ctlMeanDeaths = n ? ctlDeaths / n : null;
  const liftMeanDeaths = liftRows.length ? liftDeaths / liftRows.length : null;
  const armMeanDeaths = armRows.length ? armDeaths / armRows.length : null;
  const ctlMed = median(ctlRows.map(function (r) { return r.gameDays; }));
  const armMed = median(armRows.map(function (r) { return r.gameDays; }));
  const ctlStarv = sum(ctlRows, function (r) { return r.starvDeaths; });
  const armStarv = sum(armRows, function (r) { return r.starvDeaths; });
  const ctlErr = sum(ctlRows, function (r) { return r.errors; });
  const liftErr = sum(liftRows, function (r) { return r.errors; });
  const armErr = sum(armRows, function (r) { return r.errors; });
  // Bar 1: instrument validity. The proof test, the analyzer
  // selftest and this judge's selftest are all RUN (not trusted
  // flags) by the CLI entry point and passed in via opts; a
  // missing component is a FAIL, never a vacuous pass.
  const bars = {};
  bars.instrument = (ctlErr === 0 && liftErr === 0 && armErr === 0) &&
    opts.proofPass === true && opts.analyzerSelftestPass === true && opts.judgeSelftestPass === true;
  // Bar 2: det-gate (extended bound) ctl-vs-arm + anchors.
  const det = [];
  for (let i = 0; i < ctlRows.length; i++) det.push(detGateForSeed(ctlRows[i], armRows[i]));
  const detPass = det.every(function (d) { return d.pass; });
  const anchorChecks = anchorChecksFor(ctlRows, opts, 'ctl').concat(anchorChecksFor(armRows, opts, 'arm'));
  const anchorPass = anchorChecks.every(function (c) { return c.checked && c.pass; });
  bars.detGate = detPass && anchorPass;
  // Lift det-gate (diagnostic only — the lift leg is a reference,
  // not a judged contrast): ctl-vs-lift under the unextended
  // bound (the lift leg records no safety calls).
  const detLift = [];
  for (let i = 0; i < ctlRows.length; i++) detLift.push(detGateForSeed(ctlRows[i], liftRows[i]));
  const liftAnchorChecks = anchorChecksFor(liftRows, opts, 'lift');
  // Bars 3-6.
  bars.primaryLaunches = (ctlLaunches > 0) && (armLaunches >= 1.25 * ctlLaunches);
  bars.totalDeaths = (ctlMeanDeaths != null && armMeanDeaths != null) && (armMeanDeaths <= 1.05 * ctlMeanDeaths);
  bars.survival = (ctlMed != null && armMed != null) && (armMed >= 0.8 * ctlMed);
  bars.starvation = (armStarv <= ctlStarv + 2);
  const zeroLaunch = (ctlLaunches < 5 || armLaunches < 5);
  let verdict = 'NO-GO';
  if (zeroLaunch) verdict = 'INCONCLUSIVE';
  else if (bars.instrument && bars.detGate && bars.primaryLaunches && bars.totalDeaths &&
    bars.survival && bars.starvation) verdict = 'GO';
  // Safety census (arm leg) + the lift-vs-arm death delta (the
  // lives the bar saved, descriptively).
  const armSafety = safetyCensus(armRows);
  const liftSafety = safetyCensus(liftRows);
  const ctlSafety = safetyCensus(ctlRows);
  // Pilot gate (prereg §9): instrument + det-gate on the pilot
  // seeds + lift launches > ctl launches + >= 1 safety hold fired.
  const pilotGo = bars.instrument && detPass && anchorPass &&
    (liftLaunches > ctlLaunches) && (armSafety.holds >= 1);
  const pilotReasons = [];
  if (!bars.instrument) pilotReasons.push('instrument invalid (errors ' + ctlErr + '/' + liftErr + '/' + armErr +
    ', proof ' + opts.proofPass + ', analyzer-selftest ' + opts.analyzerSelftestPass +
    ', judge-selftest ' + opts.judgeSelftestPass + ')');
  if (!detPass) pilotReasons.push('det-gate fails on pilot seeds');
  if (!anchorPass) pilotReasons.push('anchor checks fail on pilot seeds');
  if (!(liftLaunches > ctlLaunches)) pilotReasons.push('lift launches (' + liftLaunches + ') not above ctl (' + ctlLaunches + ')');
  if (!(armSafety.holds >= 1)) pilotReasons.push('no safety hold fired on the arm leg');
  return {
    verdict: verdict, zeroLaunch: zeroLaunch,
    seeds: ctlRows.map(function (r) { return r.seed; }),
    ctl: { launches: ctlLaunches, totalDeaths: ctlDeaths, meanDeaths: ctlMeanDeaths,
      medianSurvival: ctlMed, starvDeaths: ctlStarv, instrumentErrors: ctlErr,
      wall: wallOf(ctlRows), safety: ctlSafety },
    lift: { launches: liftLaunches, totalDeaths: liftDeaths, meanDeaths: liftMeanDeaths,
      medianSurvival: median(liftRows.map(function (r) { return r.gameDays; })),
      starvDeaths: sum(liftRows, function (r) { return r.starvDeaths; }), instrumentErrors: liftErr,
      wall: wallOf(liftRows), safety: liftSafety },
    arm: { launches: armLaunches, totalDeaths: armDeaths, meanDeaths: armMeanDeaths,
      medianSurvival: armMed, starvDeaths: armStarv, instrumentErrors: armErr,
      wall: wallOf(armRows), safety: armSafety },
    deathsPerExtraLaunch: (armLaunches > ctlLaunches)
      ? (armDeaths - ctlDeaths) / (armLaunches - ctlLaunches) : null,
    liftDeathsMinusArmDeaths: (liftDeaths - armDeaths),
    det: det, detPass: detPass, detLift: detLift,
    detLiftPass: detLift.every(function (d) { return d.pass; }),
    anchorChecks: anchorChecks, anchorPass: anchorPass,
    liftAnchorChecks: liftAnchorChecks,
    liftAnchorPass: liftAnchorChecks.every(function (c) { return c.checked && c.pass; }),
    bars: bars,
    pilot: { go: pilotGo, reasons: pilotReasons,
      liftAboveCtl: liftLaunches > ctlLaunches, safetyHolds: armSafety.holds },
    perSeed: ctlRows.map(function (r, i) {
      return { seed: r.seed,
        ctl: { launches: r.launchesN, deaths: r.deaths, gameDays: r.gameDays, starv: r.starvDeaths, errors: r.errors },
        lift: { launches: liftRows[i].launchesN, deaths: liftRows[i].deaths, gameDays: liftRows[i].gameDays, starv: liftRows[i].starvDeaths, errors: liftRows[i].errors },
        arm: { launches: armRows[i].launchesN, deaths: armRows[i].deaths, gameDays: armRows[i].gameDays, starv: armRows[i].starvDeaths, errors: armRows[i].errors,
          safetyHolds: armRows[i].safetyHolds, safetyPasses: armRows[i].safetyPasses, firstSafetyDay: armRows[i].firstSafetyDay } };
    }),
  };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) {
    if (cond) { pass++; } else { fail++; console.log('SELFTEST FAIL: ' + name); }
  }
  function seedOut(o) {
    return Object.assign({ seed: 107601, mode: 'ctl', anchorCommit: 'abc',
      winplanSha: 'wp1', brainSha: 'br1', instrumentErrors: [],
      days: 150, gameDays: 150, endReason: 'survived', won: false,
      villageLost: false, maxWave: 5, unlockedWave: 5, standing: 300,
      scaleRank: 'regional', deaths: [], samples: null, v4gunLoc: [],
      contestEvents: [], prizeEvents: [], grantEvents: [],
      corpseTakeEvents: [], killLootEvents: [], volleyEvents: [],
      v4departs: [], v4fights: [], planSeeds: [], planCensus: [],
      needWaveCopies: [], departBeats: [], reseedBeats: [], beatLines: [],
      departCalls: [], scorePicks: [], dawnPool: [], departSafeCalls: [],
      sayWrap: true }, o || {});
  }
  function call(day, vid, o) {
    return Object.assign({ day: day, part: 0, vid: vid, source: 'brain',
      commitWinPlanAction: 'party_launch', commitKind: 'EXPEDITION', result: 'launch',
      planStage: 'party', planTarget: 'congregation', planNeedWave: 4,
      profile: 'forager', occupation: 'forager' }, o || {});
  }
  function deathRow(day) { return { day: day, kind: 'starved', cause: 'hunger' }; }
  function safetyCall(day, vid, o) {
    return Object.assign({ day: day, part: 0, members: [vid, 'diana'], needWave: 4, target: 'congregation',
      ok: false, skipped: false, fails: [{ vid: vid, reasons: ['hp<70'] }], checked: [vid, 'diana'] }, o || {});
  }
  function legRows(mode, specs) {
    return specs.map(function (s, i) {
      return analyzeSeed(seedOut(Object.assign({ seed: 107601 + i, mode: mode }, s)));
    });
  }
  const goodOpts = { proofPass: true, analyzerSelftestPass: true, judgeSelftestPass: true,
    ctlAnchor: 'abc', armAnchor: 'abc', ctlBrain: 'br1', armBrain: 'br1',
    ctlWinplan: 'wp1', armWinplan: 'wp1', liftAnchor: 'abc', liftBrain: 'br1', liftWinplan: 'wp1' };
  // Base legs: ctl 8 launches (2 seeds x 4), lift 10, arm 10; deaths
  // ctl 80/seed-mean, arm 82; survival 150 both; starvation 2 vs 2.
  function baseLegs() {
    const ctl = legRows('ctl', [
      { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
      { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
    ]);
    const lift = legRows('lift', [
      { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
      { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
    ]);
    const arm = legRows('arm', [
      { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150,
        deaths: [deathRow(20)], departSafeCalls: [safetyCall(40, 'alice')] },
      { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150,
        deaths: [deathRow(20)], departSafeCalls: [safetyCall(40, 'alice')] },
    ]);
    return { ctl: ctl, lift: lift, arm: arm };
  }
  // NOTE: the staged arm legs diverge from ctl on the safety-call
  // day (40) — firstSafetyDay 40, firstExtraDepartDay null (no
  // extra depart call: the arm's calls are a SUPERSET only via the
  // safety stream; the departCalls rows are identical except the
  // extra day-14 launches...). The day-14 extra launches make
  // firstExtraDepartDay 14 < firstSafetyDay 40, so the bound is
  // 14 and the first divergence is 14 — the det-gate passes.
  let b = baseLegs();
  let v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('GO when all bars pass (arm 10 vs ctl 8 launches, deaths +2.5%)', v.verdict === 'GO' &&
    v.bars.primaryLaunches === true && v.bars.totalDeaths === true && v.bars.survival === true &&
    v.bars.starvation === true && v.bars.detGate === true && v.bars.instrument === true);
  check('pilot GO on the base legs (lift > ctl, holds fired)', v.pilot.go === true);
  check('safety census counts holds + reasons', v.arm.safety.holds === 2 &&
    (v.arm.safety.holdReasons['hp<70'] || 0) === 2 && v.arm.safety.firstSafetyDay === 40);
  check('lift-minus-arm deaths is the saved-lives delta', v.liftDeathsMinusArmDeaths === 0);
  // RE-JUDGE (sim-departsafe-rejudge-a prereg §2): a bid-only
  // divergence passes the det-gate under the amended bound. Seed 1
  // is the 107611 shape (deferred bid day 64, extra depart call
  // day 65, first safety effect day 66 — the bound is the bid,
  // 64); seed 2 is the plain base shape. The launches bar is
  // deliberately short here (arm 9 vs ctl 8) so this case isolates
  // the det-gate: it asserts the det fields, not the verdict.
  function bidRow(day, vid, o) {
    return Object.assign({ day: day, part: 0, vid: vid, pickKind: 'EXPEDITION',
      winPlanAction: 'party_launch', override: 'win_plan:party_launch', deferred: null,
      commitKind: 'EXPEDITION', commitWinPlanAction: 'party_launch', commitDay: day }, o || {});
  }
  function waitBid(day, vid, o) {
    return Object.assign({ day: day, part: 3, vid: vid, pickKind: 'HAVEN_CHORE',
      winPlanAction: 'party_wait', override: 'win_plan:party_wait', deferred: null,
      commitKind: 'HAVEN_CHORE', commitWinPlanAction: 'party_wait', commitDay: day }, o || {});
  }
  b = baseLegs();
  b.ctl[0] = analyzeSeed(seedOut({ seed: 107601, mode: 'ctl',
    departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice')],
    gameDays: 150, deaths: [deathRow(20)],
    scorePicks: [waitBid(64, 'desmond')] }));
  b.arm[0] = analyzeSeed(seedOut({ seed: 107601, mode: 'arm',
    departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'),
      call(65, 'desmond', { planTarget: 'eulogy', part: 2, result: 'normal',
        commitWinPlanAction: null, commitKind: null })],
    gameDays: 150, deaths: [deathRow(20)],
    scorePicks: [bidRow(64, 'desmond', { part: 3, deferred: 'party_launch:no-tick-exact',
      commitKind: null, commitWinPlanAction: null, commitDay: null })],
    departSafeCalls: [safetyCall(66, 'desmond')] }));
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('det-gate passes a bid-only divergence under the amended bound (107611 shape)',
    v.detPass === true && v.det[0].firstBidDivergenceDay === 64 && v.det[0].bound === 64 &&
    v.det[0].firstExtraDepartDay === 65 && v.det[0].firstSafetyDay === 66 &&
    v.det[0].firstDivergenceDay === 64 && v.det[0].pass === true);
  // Launches bar: 9 vs 8 is below 1.25x.
  b = baseLegs();
  b.arm = legRows('arm', [
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150, deaths: [deathRow(20)], departSafeCalls: [safetyCall(40, 'alice')] },
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice')], gameDays: 150, deaths: [deathRow(20)], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('launches bar fails at 9 vs 8 (needs >= 10)', v.verdict === 'NO-GO' && v.bars.primaryLaunches === false);
  // Deaths guardrail: arm mean 84 vs ctl 80 is +5% exactly -> pass;
  // 88 vs 80 is +10% -> fail. (Staged: 2 seeds, deaths per seed.)
  b = baseLegs();
  b.arm = legRows('arm', [
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150,
      deaths: [deathRow(20), deathRow(21), deathRow(22), deathRow(23)], departSafeCalls: [safetyCall(40, 'alice')] },
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150,
      deaths: [deathRow(20), deathRow(21), deathRow(22), deathRow(23)], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  // ctl deaths: 1 per seed (mean 1); arm deaths: 4 per seed (mean 4) -> way over.
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('deaths guardrail fails when the arm mean is far above ctl', v.verdict === 'NO-GO' && v.bars.totalDeaths === false);
  // Zero-launch rule: ctl launches 3 -> INCONCLUSIVE.
  b = baseLegs();
  b.ctl = legRows('ctl', [
    { departCalls: [call(10, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
    { departCalls: [call(10, 'alice'), call(11, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
  ]);
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('zero-launch rule INCONCLUSIVE when ctl launches < 5', v.verdict === 'INCONCLUSIVE' && v.zeroLaunch === true);
  // Instrument: an error on any seed file fails bar 1.
  b = baseLegs();
  b.arm[0].errors = 1;
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('instrument bar fails on a seed-file error', v.verdict === 'NO-GO' && v.bars.instrument === false);
  // Instrument: a missing proof-pass fails bar 1 (never vacuous).
  b = baseLegs();
  v = judgeLegs(b.ctl, b.lift, b.arm, Object.assign({}, goodOpts, { proofPass: false }));
  check('instrument bar fails when the proof test did not pass', v.verdict === 'NO-GO' && v.bars.instrument === false);
  // Survival bar: arm median 100 vs ctl 150 -> 0.67x -> fail.
  b = baseLegs();
  b.arm = legRows('arm', [
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 100, deaths: [deathRow(20)], departSafeCalls: [safetyCall(40, 'alice')] },
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 100, deaths: [deathRow(20)], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('survival bar fails at 0.67x ctl median', v.verdict === 'NO-GO' && v.bars.survival === false);
  // Starvation bar: arm total 5 vs ctl 2 -> +3 -> fail.
  b = baseLegs();
  b.arm = legRows('arm', [
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150,
      deaths: [deathRow(20), deathRow(21), deathRow(22)], departSafeCalls: [safetyCall(40, 'alice')] },
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150,
      deaths: [deathRow(20), deathRow(21)], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  // ctl starv: 1 per seed = 2 total; arm starv: 3 + 2 = 5 -> exceeds ctl+2.
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('starvation bar fails at arm total ctl+3', v.verdict === 'NO-GO' && v.bars.starvation === false);
  // Pilot gate: no safety hold fired -> INCONCLUSIVE-at-pilot.
  b = baseLegs();
  b.arm = legRows('arm', [
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice'), call(14, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
  ]);
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('pilot gate blocks when no safety hold fired', v.pilot.go === false &&
    v.pilot.reasons.some(function (r) { return r.indexOf('no safety hold') !== -1; }));
  // Pilot gate: lift not above ctl -> blocks.
  b = baseLegs();
  b.lift = legRows('lift', [
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
    { departCalls: [call(10, 'alice'), call(11, 'alice'), call(12, 'alice'), call(13, 'alice')], gameDays: 150, deaths: [deathRow(20)] },
  ]);
  v = judgeLegs(b.ctl, b.lift, b.arm, goodOpts);
  check('pilot gate blocks when lift is not above ctl', v.pilot.go === false &&
    v.pilot.reasons.some(function (r) { return r.indexOf('lift launches') !== -1; }));
  // Anchor: a missing expectation fails the det-gate bar.
  b = baseLegs();
  v = judgeLegs(b.ctl, b.lift, b.arm, Object.assign({}, goodOpts, { armAnchor: null }));
  check('det-gate bar fails when an anchor expectation is missing', v.verdict === 'NO-GO' && v.bars.detGate === false);
  console.log('departsafe judge selftest: ' + pass + ' pass, ' + fail + ' fail');
  return fail === 0;
}

if (require.main === module) (async function () {
  if (process.argv.includes('--selftest')) {
    process.exit(selftest() ? 0 : 1);
  }
  const arg = function (name, dflt) {
    const i = process.argv.indexOf('--' + name);
    return i === -1 ? dflt : process.argv[i + 1];
  };
  const pilotFlag = process.argv.includes('--pilot');
  const ctlDir = arg('ctl'), liftDir = arg('lift'), armDir = arg('arm'), outFile = arg('out');
  const seedsArg = arg('seeds', '');
  if (!ctlDir || !liftDir || !armDir || !outFile || !seedsArg) {
    console.error('usage: node scripts/analyze-departsafe-a.js --ctl <dir> --lift <dir> --arm <dir> --out <file> --seeds 107601,... [--ctl-anchor <sha> --arm-anchor <sha>] [--ctl-brain <sha> --arm-brain <sha> --ctl-winplan <sha> --arm-winplan <sha>] [--lift-anchor <sha> --lift-brain <sha> --lift-winplan <sha>] [--pilot] [--proof-frozen <frozen-judge.json>]');
    process.exit(2);
  }
  const seeds = seedsArg.split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
  const ctlRows = loadLeg(ctlDir, 'ctl', seeds);
  const liftRows = loadLeg(liftDir, 'arm', seeds);
  const armRows = loadLeg(armDir, 'arm', seeds);
  // Bar 1 components, all RUN here (never trusted flags): the
  // dawnchoke analyzer selftest in-process, this judge's selftest
  // in-process, the proof test as a child process — OR, in a
  // re-judge run (--proof-frozen, sim-departsafe-rejudge-a prereg
  // §6), the proof-test result INHERITED from the frozen departsafe
  // judge JSON: the proof test asserts lever behavior and the lever
  // code is held on sim-departsafe-a, absent from a re-judge tree
  // by design, so it cannot be re-run there. A missing frozen file
  // or a recorded proofPass that is not true FAILS bar 1 (never
  // vacuous); the source file is named in the output.
  let analyzerSelftestPass = false;
  try { analyzerSelftestPass = dawnchoke.selftest(); } catch (e) { analyzerSelftestPass = false; }
  let judgeSelftestPass = false;
  try { judgeSelftestPass = selftest(); } catch (e) { judgeSelftestPass = false; }
  let proofPass = false;
  let proofFrozenFile = null;
  let proofInherited = false;
  const proofFrozenArg = arg('proof-frozen');
  if (proofFrozenArg) {
    proofFrozenFile = proofFrozenArg;
    try {
      const frozen = JSON.parse(fs.readFileSync(proofFrozenArg, 'utf8'));
      proofPass = !!((frozen || {}).instrumentRuns || {}).proofPass;
      proofInherited = true;
    } catch (e) { proofPass = false; proofInherited = true; }
  } else {
    try {
      execSync('node ' + path.join(REPO, 'scripts', 'test-departsafe-a.js'), { cwd: REPO, stdio: 'pipe' });
      proofPass = true;
    } catch (e) { proofPass = false; }
  }
  const opts = { proofPass: proofPass, analyzerSelftestPass: analyzerSelftestPass, judgeSelftestPass: judgeSelftestPass,
    ctlAnchor: arg('ctl-anchor'), armAnchor: arg('arm-anchor'),
    ctlBrain: arg('ctl-brain'), armBrain: arg('arm-brain'),
    ctlWinplan: arg('ctl-winplan'), armWinplan: arg('arm-winplan'),
    liftAnchor: arg('lift-anchor'), liftBrain: arg('lift-brain'), liftWinplan: arg('lift-winplan') };
  const result = judgeLegs(ctlRows, liftRows, armRows, opts);
  result.instrumentRuns = { proofPass: proofPass, analyzerSelftestPass: analyzerSelftestPass, judgeSelftestPass: judgeSelftestPass,
    proofInherited: proofInherited, proofFrozenFile: proofFrozenFile };
  result.pilotMode = pilotFlag;
  if (pilotFlag) {
    result.pilotVerdict = result.pilot.go ? 'PILOT-GO' : 'INCONCLUSIVE-at-pilot';
  }
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({
    verdict: pilotFlag ? result.pilotVerdict : result.verdict,
    bars: result.bars, pilot: result.pilot,
    ctlLaunches: result.ctl.launches, liftLaunches: result.lift.launches, armLaunches: result.arm.launches,
    ctlMeanDeaths: result.ctl.meanDeaths, liftMeanDeaths: result.lift.meanDeaths, armMeanDeaths: result.arm.meanDeaths,
    ctlMedian: result.ctl.medianSurvival, armMedian: result.arm.medianSurvival,
    ctlStarv: result.ctl.starvDeaths, armStarv: result.arm.starvDeaths,
    detPass: result.detPass, anchorPass: result.anchorPass, detLiftPass: result.detLiftPass,
    instrument: result.instrumentRuns, out: outFile,
  }, null, 2));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { judgeLegs: judgeLegs, selftest: selftest, loadLeg: loadLeg, safetyCensus: safetyCensus, wallOf: wallOf };
