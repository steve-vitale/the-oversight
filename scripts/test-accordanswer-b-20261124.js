// test-accordanswer-b-20261124.js — proof test for the accord-answer
// probe instrument + analyzer + panel mapping (arm sim-accordanswer-b).
// Fixture-based (answer-rate classification, gate-leak detection,
// answer-without-stage, channel/actor requirements, paired-leg
// comparison + cost guardrail, reproduction-field comparison,
// wall summary, panel metric mapping, channel classifier) plus a
// live harness smoke on seed 109301 (default; SEED env override):
// the control leg stages the accord and leaves it unanswered with
// driveStats null, the armed leg answers it via the engine channel
// with an actor recorded, on the same staged day in both legs.
// No repo writes.
// Usage: node scripts/test-accordanswer-b-20261124.js [SEED=109301]
'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const AN = require(path.join(__dirname, 'accordanswer-b-analyze-20261124'));
const INST = require(path.join(__dirname, 'accordanswer-b-instrument-20261124'));
const PANELS = require(path.join(__dirname, 'build-accordanswer-b-panels-20261124'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

// --- fixture builders (analyzer shape only) ---
function run(over) {
  return Object.assign({ seed: 109301, arm: 'accordanswer-b', run: 'fixture',
    policy: 'competent', anchorCommit: 'fixture', driveEnv: false, driveStats: null,
    days: 126, gameDays: 126, endReason: 'village-lost', won: false, over: true,
    villageLost: true, scaleRank: 'regional', maxWave: 5, endUnlockedWave: 5,
    peakBeforeEndCall: 5, peakAfterEndCall: 5, endCallMovedPeak: false,
    daily: [], killEvents: [], deathEvents: [],
    feastEvents: [], standingLines: [], releaseLines: [], saySample: [],
    linkEvents: [], proposeEvents: [], counterEvents: [],
    nationalEvents: [], linkLines: [],
    accordStageEvents: [], accordAnswerEvents: [], driveCallDays: [],
    otherVillages: [], wrapCounts: {}, instrumentErrors: [] }, over || {});
}
function staged(linkId, day, targetName) {
  return { day: day, linkId: linkId, target: 'village_3', targetName: targetName || 'Ashford',
    staged: true, caller: 'metaProgression.js <- hierarchy.js' };
}
function answered(linkId, day, over) {
  return Object.assign({ day: day, how: 'gift', channel: 'engine',
    actorId: 'v_ema', actorName: 'Emma', linkId: linkId, target: 'village_3',
    targetName: 'Ashford', stagedDay: 27, lagDays: day - 27,
    kcalPaid: 2000, trustGain: 10, outcome: 'answered' }, over || {});
}
function driveStats(over) {
  return Object.assign({ accordAnswers: 1, tends: 3, tendsBlockedPantry: 0,
    renegotiationAnswers: 0, demandAnswers: 0, demandKinds: {},
    blockedDays: { noAnswerer: 0 }, answerers: { v_ema: 4 }, answererNames: { v_ema: 'Emma' },
    errors: 0, firstAnswerDay: { link_1: 28 } }, over || {});
}
function classifiedFixture(over) {
  // A classified seed built through classifySeed (keeps the shape honest).
  return AN.classifySeed(run(over));
}

// --- 1. arm seed: full answer story ---
ok('arm seed classifies the answered accord with actor, day, lag, price', function () {
  const c = AN.classifySeed(run({ driveEnv: true, driveStats: driveStats(),
    accordStageEvents: [staged('link_1', 27)],
    accordAnswerEvents: [answered('link_1', 28)],
    driveCallDays: [{ day: 28, envOn: true, repId: 'v_ema', repName: 'Emma',
      accordAnswersBefore: 0, accordAnswersAfter: 1, tendsBefore: 0, tendsAfter: 0,
      errorsBefore: 0, errorsAfter: 0 }] }));
  assert.strictEqual(c.answerRate, 1);
  assert.strictEqual(c.answerRateDistinct, 1);
  assert.strictEqual(c.staged.length, 1);
  assert.strictEqual(c.answered.length, 1);
  assert.strictEqual(c.unanswered.length, 0);
  assert.strictEqual(c.staged[0].answeredDay, 28);
  assert.strictEqual(c.staged[0].lagDays, 1);
  assert.strictEqual(c.staged[0].actorName, 'Emma');
  assert.strictEqual(c.staged[0].kcalPaid, 2000);
  assert.strictEqual(c.staged[0].trustGain, 10);
  assert.strictEqual(c.staged[0].pendingDaysEnd, null);
  assert.strictEqual(c.unclassified, false);
});

// --- 2. control seed: unanswered to run end, gate off ---
ok('control seed classifies the unanswered accord with its pending span', function () {
  const c = AN.classifySeed(run({ accordStageEvents: [staged('link_1', 27)] }));
  assert.strictEqual(c.answerRate, 0);
  assert.strictEqual(c.staged.length, 1);
  assert.strictEqual(c.unanswered.length, 1);
  assert.strictEqual(c.unanswered[0].pendingDaysEnd, 126 - 27);
  assert.strictEqual(c.driveStats, null);
  assert.strictEqual(c.driveCalls, 0);
  assert.strictEqual(c.unclassified, false);
});

// --- 3. arm leg with no driveStats is a gate failure, not a classification ---
ok('arm leg with driveStats null is unclassified (gate did not run)', function () {
  const c = AN.classifySeed(run({ driveEnv: true, driveStats: null,
    accordStageEvents: [staged('link_1', 27)] }));
  assert.strictEqual(c.unclassified, true);
  assert.ok(c.unclassifiedReasons.some(function (r) { return /gate did not run/.test(r); }));
});

// --- 4. control leg with driveStats is a gate leak ---
ok('control leg with driveStats present is unclassified (gate leaked)', function () {
  const c = AN.classifySeed(run({ driveEnv: false, driveStats: driveStats(),
    accordStageEvents: [staged('link_1', 27)] }));
  assert.strictEqual(c.unclassified, true);
  assert.ok(c.unclassifiedReasons.some(function (r) { return /leaked into control/.test(r); }));
});

// --- 5. answer without a stage is unclassified ---
ok('answer event with no matching staged accord is unclassified', function () {
  const c = AN.classifySeed(run({ driveEnv: true, driveStats: driveStats(),
    accordAnswerEvents: [answered('link_9', 28)] }));
  assert.strictEqual(c.unclassified, true);
  assert.ok(c.unclassifiedReasons.some(function (r) { return /no matching staged accord/.test(r); }));
});

// --- 6. non-engine channel is unclassified ---
ok('answer via a non-engine channel is unclassified', function () {
  const c = AN.classifySeed(run({ driveEnv: true, driveStats: driveStats(),
    accordStageEvents: [staged('link_1', 27)],
    accordAnswerEvents: [answered('link_1', 28, { channel: 'policy', actorName: 'Emma' })] }));
  assert.strictEqual(c.unclassified, true);
  assert.ok(c.unclassifiedReasons.some(function (r) { return /unexpected channel/.test(r); }));
});

// --- 7. answer with no actor is unclassified ---
ok('answer event with no actor recorded is unclassified', function () {
  const c = AN.classifySeed(run({ driveEnv: true, driveStats: driveStats(),
    accordStageEvents: [staged('link_1', 27)],
    accordAnswerEvents: [answered('link_1', 28, { actorId: null, actorName: null })] }));
  assert.strictEqual(c.unclassified, true);
  assert.ok(c.unclassifiedReasons.some(function (r) { return /no actor recorded/.test(r); }));
});

// --- 8. paired comparison + cost guardrail ---
ok('compareLegs pairs deltas and the cost guardrail trips on excess starvation', function () {
  const ctl = [classifiedFixture({ seed: 109301, days: 126,
    deathEvents: [{ day: 50, kind: 'villager', who: 'v1', cause: 'starvation', player: false }],
    accordStageEvents: [staged('link_1', 27)] })];
  const arm = [classifiedFixture({ seed: 109301, days: 140, driveEnv: true,
    driveStats: driveStats(),
    deathEvents: [
      { day: 50, kind: 'villager', who: 'v1', cause: 'starvation', player: false },
      { day: 60, kind: 'villager', who: 'v2', cause: 'starvation', player: false },
      { day: 70, kind: 'villager', who: 'v3', cause: 'starvation', player: false },
      { day: 80, kind: 'villager', who: 'v4', cause: 'starvation', player: false },
    ],
    accordStageEvents: [staged('link_1', 27)],
    accordAnswerEvents: [answered('link_1', 28)] })];
  const cmp = AN.compareLegs(ctl, arm);
  assert.strictEqual(cmp.pairs, 1);
  assert.strictEqual(cmp.answerRate.control, 0);
  assert.strictEqual(cmp.answerRate.arm, 1);
  assert.deepStrictEqual(cmp.deltas.days, [14]);
  assert.deepStrictEqual(cmp.deltas.starvationDeaths, [3]);
  assert.strictEqual(cmp.costGuardrail.starvationCtl, 1);
  assert.strictEqual(cmp.costGuardrail.starvationArm, 4);
  assert.strictEqual(cmp.costGuardrail.starvationPass, false); // 4 > 1+2
  assert.strictEqual(cmp.costGuardrail.medianSurvivalCtl, 126);
  assert.strictEqual(cmp.costGuardrail.medianSurvivalArm, 140);
  assert.strictEqual(cmp.costGuardrail.survivalPass, true);
  // And the guardrail passes when the arm starves nobody extra.
  const armClean = [classifiedFixture({ seed: 109301, days: 126, driveEnv: true,
    driveStats: driveStats(),
    deathEvents: [{ day: 50, kind: 'villager', who: 'v1', cause: 'starvation', player: false }],
    accordStageEvents: [staged('link_1', 27)],
    accordAnswerEvents: [answered('link_1', 28)] })];
  const cmp2 = AN.compareLegs(ctl, armClean);
  assert.strictEqual(cmp2.costGuardrail.starvationPass, true);
  assert.strictEqual(cmp2.costGuardrail.survivalPass, true);
});

// --- 9. reproduction check on the real havenlink corpus ---
ok('reproductionCheck matches the havenlink corpus against itself and names a moved field', function () {
  const hlPath = path.join(__dirname, '..', 'evidence', '2026-11-24', 'perseed-havenlink-b', 'havenlink-b-s109301-havenlink-b.json');
  const hl = JSON.parse(fs.readFileSync(hlPath, 'utf8'));
  const same = AN.reproductionCheck(hl, hl);
  assert.strictEqual(same.match, true);
  assert.deepStrictEqual(same.mismatches, []);
  const moved = JSON.parse(JSON.stringify(hl));
  moved.days = hl.days + 1;
  const diff = AN.reproductionCheck(moved, hl);
  assert.strictEqual(diff.match, false);
  assert.strictEqual(diff.mismatches.length, 1);
  assert.strictEqual(diff.mismatches[0].field, 'days');
});

// --- 10. wall summary counts ---
ok('wallSummary counts wins, national, wave unlocks and median survival', function () {
  const list = [
    classifiedFixture({ seed: 109301, days: 126, scaleRank: 'regional', endUnlockedWave: 5,
      daily: [{ day: 126, w5faced: true, w4faced: true }] }),
    classifiedFixture({ seed: 109302, days: 150, scaleRank: 'national', endUnlockedWave: 5, won: false,
      daily: [{ day: 150, w5faced: false, w4faced: true }] }),
  ];
  const w = AN.wallSummary(list);
  assert.strictEqual(w.seeds, 2);
  assert.strictEqual(w.wins, 0);
  assert.strictEqual(w.national, 1);
  assert.strictEqual(w.medianSurvival, 138);
  assert.strictEqual(w.wave5unlocks, 2);
  assert.strictEqual(w.wave5faced, 1);
  assert.strictEqual(w.wave4faced, 2);
});

// --- 11. panel metric mapping (playerDeaths stays null, never faked) ---
ok('panel metricsFor maps the mappable contract metrics and leaves playerDeaths null', function () {
  const m = PANELS.metricsFor({ won: false, scaleRank: 'national', gameDays: 126,
    endReason: 'village-lost', deathEvents: [{ cause: 'starvation' }, { cause: 'wave' }] });
  assert.strictEqual(m.won, 0);
  assert.strictEqual(m.national, 1);
  assert.strictEqual(m.survival30, 1);
  assert.strictEqual(m.survival60, 1);
  assert.strictEqual(m.communityLost, 1);
  assert.strictEqual(m.villageDeaths, 2);
  assert.ok(Math.abs(m.villageDeaths100Days - 200 / 126) < 1e-9);
  assert.strictEqual(m.playerDeaths, null);
  const m2 = PANELS.metricsFor({ won: true, scaleRank: 'village', gameDays: 20,
    endReason: 'won', deathEvents: [] });
  assert.strictEqual(m2.won, 1);
  assert.strictEqual(m2.national, 0);
  assert.strictEqual(m2.survival30, 0);
  assert.strictEqual(m2.communityLost, 0);
});

// --- 12. channel classifier: engine only when called from the drive ---
ok('answerChannel reads engine from a _answermailDriveDaily frame and other otherwise', function () {
  function _answermailDriveDaily() { return INST.answerChannel(); }
  assert.strictEqual(_answermailDriveDaily(), 'engine');
  assert.strictEqual(INST.answerChannel(), 'other');
});

// --- live harness smoke (seed 109301, 70 days, both legs) ---
(async function () {
  const SEED = parseInt(process.env.SEED || '109301', 10) || 109301;
  const DAYS = 70;
  const REPO = path.join(__dirname, '..');
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

  function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

  async function smokeLeg(driveOn) {
    if (driveOn) process.env.ANSWERMAIL_DRIVE = '1';
    else delete process.env.ANSWERMAIL_DRIVE;
    const { Game } = await loadGame({ seed: SEED, mode: 'competent-accordanswer-b-smoke-' + (driveOn ? 'arm' : 'ctl'), fullTelemetry: false });
    const errors = [];
    await setupGame(Game);
    const inst = INST.install(Game);
    const t = inst.t;
    let lastSnapDay = -1;
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally {
          try {
            const d = gday(Game);
            if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
          } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
        }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
    try { inst.snapshot(); } catch (e) {}
    const out = { days: result.days, endReason: result.endReason,
      staged: t.accordStageEvents.filter(function (e) { return e.staged; }),
      answered: t.accordAnswerEvents.filter(function (e) { return e.outcome === 'answered'; }),
      driveStats: (Game.state || {}).answermailDrive ? JSON.parse(JSON.stringify((Game.state || {}).answermailDrive)) : null,
      driveCalls: t.driveCallDays.length,
      driveCallRows: t.driveCallDays.slice(),
      errors: t.instrumentErrors.concat(errors) };
    try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
    delete process.env.ANSWERMAIL_DRIVE;
    return out;
  }

  const ctl = await smokeLeg(false);
  ok('live smoke control: accord stages, stays unanswered, driveStats null, 0 errors', function () {
    assert.ok(ctl.staged.length >= 1, 'expected >=1 staged accord, got ' + ctl.staged.length);
    assert.strictEqual(ctl.answered.length, 0);
    assert.strictEqual(ctl.driveStats, null);
    // The drive TICK runs daily even with the gate off (hierarchyDaily
    // calls it; the env check inside returns immediately) — the tick
    // count equals the days run, and every row must read envOn false.
    assert.strictEqual(ctl.driveCalls, ctl.days);
    assert.ok(ctl.driveCallRows.every(function (r) { return r.envOn === false; }),
      'every control drive tick must read envOn false');
    assert.deepStrictEqual(ctl.errors, []);
  });

  const arm = await smokeLeg(true);
  ok('live smoke arm: accord answered via the engine with actor, day, price recorded', function () {
    assert.ok(arm.staged.length >= 1, 'expected >=1 staged accord, got ' + arm.staged.length);
    assert.ok(arm.answered.length >= 1, 'expected >=1 answer, got ' + arm.answered.length);
    const a = arm.answered[0];
    assert.strictEqual(a.channel, 'engine');
    assert.ok(a.actorName, 'actor recorded');
    assert.ok(a.day >= a.stagedDay, 'answer day >= staged day');
    assert.ok(a.lagDays != null && a.lagDays >= 0 && a.lagDays <= 7, 'lag ' + a.lagDays + ' within a week');
    assert.ok(a.kcalPaid != null && a.kcalPaid > 0, 'kcal paid ' + a.kcalPaid);
    assert.ok(a.trustGain != null && a.trustGain > 0, 'trust gained ' + a.trustGain);
    assert.ok(arm.driveStats && (arm.driveStats.accordAnswers | 0) >= 1, 'driveStats.accordAnswers >= 1');
    assert.ok(arm.driveCalls > 0, 'drive ticked');
    assert.deepStrictEqual(arm.errors, []);
    console.log('   smoke: staged day ' + arm.staged[0].day + ', answered day ' + a.day +
      ' by ' + a.actorName + ' (' + a.how + ', ' + a.kcalPaid + ' kcal, trust +' + a.trustGain + ')');
  });

  ok('live smoke: staged day identical across legs (drive acts only after staging)', function () {
    assert.strictEqual(arm.staged[0].day, ctl.staged[0].day);
    assert.strictEqual(arm.staged[0].linkId, ctl.staged[0].linkId);
  });

  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
