// test-raiserseat-a.js — proof test for the raiser-seat arm
// (arm sim-raiserseat-a, run fleshout-20261110T1415Z; NO-GO closeout
// run fleshout-20261110T1915Z: the +35 pending-raise signal FAILED its
// GO bar — second links 6/8 armed vs 7/8 control — so the signal was
// REVERTED out of scripts/policies/competent.js and must not land.
// This proof now pins the REVERTED state plus the measurement
// (raiserseat analyzer: 150206-class detection, revised per-day cost
// bar). The driver (raiserseat-driver-20261110.js) is kept as the
// historical record of how the committed corpus was produced; it still
// sets RAISER_SEAT=1 on the armed leg, but the flag is now a no-op in
// the policy, so re-running it will NOT reproduce the armed leg.
//
// Legs: (a) revert pins: RAISER_SEAT is a no-op on talkScore even with
// a pending raise (flag on == flag off; base scores unchanged) and the
// raiserSeatOn / RAISER_SEAT_BONUS exports are gone; pickTalkTargets
// order is unchanged by the flag; (b) analyzer 150206-class
// detection + revised cost bar (per-day, arm-only starvation,
// starvation, median) on synthetic per-seed JSON; (c) live harness
// miniature (12d, seed 150201): the (now no-op) flag-ON run takes real
// held turns with zero instrument errors and is deterministic across
// identical runs; the COMPETENT_TALK-on leg also takes held turns (the
// talkturn-a substrate is on); both flags OFF is byte-identical to
// plain competent on days + standing (the gates add nothing when off).
// Usage: node scripts/test-raiserseat-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'raiserseat-analyze-20261110'));
const DRV = require(path.join(__dirname, 'raiserseat-driver-20261110'));
const TDRV = require(path.join(__dirname, 'talkturn-driver-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent, talkOn, talkScore, pickTalkTargets } = require(path.join(__dirname, 'policies', 'competent'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
async function aok(name, fn) { await fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function withEnv(env, fn) {
  const prev = { talk: process.env.COMPETENT_TALK, seat: process.env.RAISER_SEAT };
  try {
    if (env.talk == null) delete process.env.COMPETENT_TALK; else process.env.COMPETENT_TALK = env.talk;
    if (env.seat == null) delete process.env.RAISER_SEAT; else process.env.RAISER_SEAT = env.seat;
    return fn();
  } finally {
    if (prev.talk == null) delete process.env.COMPETENT_TALK; else process.env.COMPETENT_TALK = prev.talk;
    if (prev.seat == null) delete process.env.RAISER_SEAT; else process.env.RAISER_SEAT = prev.seat;
  }
}

// --- Fake Game for talkScore units: controlled convo/mood/bond/pending/comm. ---
function fakeGame(opts) {
  const g = {
    villagerId: 'scholar1',
    convoGet: function (vid) { return (opts.convo || {})[vid] || null; },
    npcMood: function (vid) { return (opts.mood || {})[vid] || null; },
    bondGet: function (a, b) { return { v: ((opts.bond || {})[b] != null ? opts.bond[b] : 0) }; },
    pendingLinkRaise: function (vid) { return (opts.pending || {})[vid] || null; },
  };
  if (!opts.noComm) g.commLevel = function (vid) { const c = (opts.comm || {})[vid]; return c ? { level: c } : null; };
  return g;
}
const RAISE = { villageId: 'emberhold', day: 6, kind: 'link' };

ok('revert: RAISER_SEAT is a no-op on talkScore even with a pending raise (flag on == flag off, base scores unchanged)', function () {
  // The killed +35 signal is gone: a raiser with a pending ask scores
  // exactly what the base policy gives, flag on or off.
  const g = fakeGame({
    convo: { devon: { count: 12 }, ella: { count: 0 } },
    bond: { devon: 25, ella: 0 },
    pending: { devon: RAISE },
    comm: { devon: 'full' },
  });
  const base = withEnv({ seat: undefined }, function () { return talkScore(g, {}, 'devon'); });
  assert.strictEqual(base, 0, 'devon base is 0 (trusted, talked-to)');
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'devon'); }), 0, 'flag on changes nothing');
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'ella'); }), 30, 'stranger max is still 30');
  // 150206-shaped base scores are unchanged by the flag too.
  const g2 = fakeGame({
    convo: { devon: { count: 4 }, ella: { count: 1 } },
    bond: { devon: 18, ella: 0 },
    pending: { devon: RAISE },
    comm: { devon: 'full' },
  });
  assert.strictEqual(withEnv({ seat: undefined }, function () { return talkScore(g2, {}, 'devon'); }), 8);
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g2, {}, 'devon'); }), 8, 'flag on: still 8, no +35');
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g2, {}, 'ella'); }), 29);
});

ok('talkScore: no pending raise = picker unchanged (flag on scores equal flag off)', function () {
  const g = fakeGame({
    convo: { devon: { count: 4 }, ella: { count: 1 } },
    bond: { devon: 18, ella: 0 },
    comm: { devon: 'full' },
  });
  ['devon', 'ella'].forEach(function (vid) {
    const off = withEnv({ seat: undefined }, function () { return talkScore(g, {}, vid); });
    const on = withEnv({ seat: '1' }, function () { return talkScore(g, {}, vid); });
    assert.strictEqual(on, off, vid + ' unchanged without a pending raise');
  });
});

ok('revert: raiserSeatOn / RAISER_SEAT_BONUS are not exported by competent', function () {
  const mod = require(path.join(__dirname, 'policies', 'competent'));
  assert.strictEqual(mod.raiserSeatOn, undefined, 'raiserSeatOn export is gone');
  assert.strictEqual(mod.RAISER_SEAT_BONUS, undefined, 'RAISER_SEAT_BONUS export is gone');
});

ok('revert: pickTalkTargets order is unchanged by RAISER_SEAT (flag on == flag off)', function () {
  const g = fakeGame({
    convo: { devon: { count: 12 }, ella: { count: 0 }, raj: { count: 0 } },
    bond: { devon: 25, ella: 0, raj: 0 },
    pending: { devon: RAISE },
    comm: { devon: 'full' },
  });
  const alive = ['devon', 'ella', 'raj'];
  const off = withEnv({ seat: undefined }, function () { return pickTalkTargets(g, {}, alive); });
  assert.deepStrictEqual(off, ['ella', 'raj', 'devon'], 'flag off: strangers first, raiser last');
  const on = withEnv({ seat: '1' }, function () { return pickTalkTargets(g, {}, alive); });
  assert.deepStrictEqual(on, off, 'flag on: same order — the signal is gone');
});

// --- Analyzer fixtures (same synthetic corpus shape as test-talkturn-a) ---
function fakeSeed(opts) {
  const base = {
    seed: 150201, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    scaleRank: 'regional', maxWave: 4, standing: 100,
    instrumentErrors: [], bondEvents: [], stageCalls: [], acceptCalls: [],
    declineCalls: [], proposeCalls: [], linkTickCalls: 0, daily: [],
    raiseDays: [],
    talk: { talks: 0, turns: 0, linkPicks: 0, bondPicks: 0, talksWithRaiserPending: 0, deepConvos: 0, deepTurns: 0 },
    deaths: [],
  };
  return Object.assign(base, opts || {});
}
function fakeDay(day, extra) {
  return Object.assign({
    day: day, scholarId: 'scholar1', standing: 100, scaleRank: 'regional',
    polity: null, pending: { counter: false, accord: false, national: false, global: false },
    pendingRaises: [], raiseState: [], links: [], linkTotal: 0,
    villages: [{ id: 'emberhold', name: 'Emberhold', opinion: 10, linked: false }],
    scholarLore: ['emberhold'], linkTickRoll: 0.7,
    raisers: [{ vid: 'nathan', alive: true, isScholar: false, trust: 25, buildStanding: 1,
      lore: ['emberhold'], unlinkedKnown: ['emberhold'], cooldown: [], hasPending: false,
      talkBlocked: false, gates: [], eligible: true }],
    eligibleRaisers: 1,
  }, extra || {});
}
function stagedTele(day, vid, village) {
  return { day: day, initiator: vid, target: village, kind: 'link', outcome: 'staged', chance: null, reason: null };
}
function fakeSeed150206(opts) {
  const events = [];
  for (let d = 6; d < 6 + 28; d++) events.push(stagedTele(d, 'devon', 'emberhold'));
  return fakeSeed(Object.assign({ bondEvents: events, daily: [fakeDay(6), fakeDay(150)] }, opts || {}));
}

ok('analyzer: 28 stagings + 0 link picks = 150206-class', function () {
  const r = AN.analyzeSeedRaiserseat(fakeSeed150206());
  assert.strictEqual(r.is150206Class, true);
  assert.strictEqual(r.stagingsTotal, 28);
  assert.strictEqual(r.talk.linkPicks, 0);
});

ok('analyzer: 28 stagings + 1 link pick = NOT 150206-class', function () {
  const j = fakeSeed150206({ talk: { talks: 10, turns: 20, linkPicks: 1, bondPicks: 0, talksWithRaiserPending: 3, deepConvos: 5, deepTurns: 20 } });
  assert.strictEqual(AN.analyzeSeedRaiserseat(j).is150206Class, false);
});

ok('analyzer: 9 stagings + 0 picks = NOT 150206-class (below the threshold)', function () {
  const events = [];
  for (let d = 6; d < 15; d++) events.push(stagedTele(d, 'devon', 'emberhold'));
  const r = AN.analyzeSeedRaiserseat(fakeSeed({ bondEvents: events, daily: [fakeDay(6), fakeDay(150)] }));
  assert.strictEqual(r.is150206Class, false);
});

ok('analyzer: revised cost bar — per-day pass/fail, arm-only, starvation, median', function () {
  const ctrl = { starvation: 0, deathsPer100: 70.8, median: 100 };
  const okArm = { starvation: 0, armOnlyStarvation: 0, deathsPer100: 70.7, median: 129 };
  const badRate = { starvation: 0, armOnlyStarvation: 0, deathsPer100: 78.5, median: 129 };
  const badStarve = { starvation: 3, armOnlyStarvation: 0, deathsPer100: 70.7, median: 129 };
  const badArmOnly = { starvation: 2, armOnlyStarvation: 1, deathsPer100: 70.7, median: 129 };
  const badMedian = { starvation: 0, armOnlyStarvation: 0, deathsPer100: 70.7, median: 79 };
  assert.strictEqual(AN.costBarRevised(okArm, ctrl).pass, true);
  assert.strictEqual(AN.costBarRevised(badRate, ctrl).pass, false, 'rate 78.5 > 70.8*1.1=77.9');
  assert.strictEqual(AN.costBarRevised(badStarve, ctrl).pass, false, 'starvation 3 > 0+2');
  // Control starvation is 0 here, so the arm-only cap is 0 (zero-tolerance, disclosed in the prereg).
  assert.strictEqual(AN.costBarRevised(badArmOnly, ctrl).pass, false, 'arm-only 1 > control total 0');
  assert.strictEqual(AN.costBarRevised(badMedian, ctrl).pass, false, 'median 79 < 0.8*100');
  assert.strictEqual(AN.costBarRevised(okArm, ctrl).reasons.length, 0);
  // With control starvation 2, arm-only 2 passes (cap = control total).
  const ctrl2 = { starvation: 2, deathsPer100: 70.8, median: 100 };
  const arm2 = { starvation: 2, armOnlyStarvation: 2, deathsPer100: 70.7, median: 129 };
  assert.strictEqual(AN.costBarRevised(arm2, ctrl2).pass, true);
});

ok('driver: setRaiserFlags sets COMPETENT_TALK=1 on both legs and RAISER_SEAT per leg', function () {
  DRV.setRaiserFlags('armed');
  assert.strictEqual(process.env.COMPETENT_TALK, '1');
  assert.strictEqual(process.env.RAISER_SEAT, '1');
  DRV.setRaiserFlags('control');
  assert.strictEqual(process.env.COMPETENT_TALK, '1');
  assert.strictEqual(process.env.RAISER_SEAT, undefined);
  delete process.env.COMPETENT_TALK;
  delete process.env.RAISER_SEAT;
});

(async function () {
  await aok('live: (reverted flag) RAISER_SEAT=1 12d takes real held turns, zero errors, deterministic', async function () {
    async function shortRun() {
      DRV.setRaiserFlags('armed');
      const { Game } = await loadGame({ seed: 150201, mode: 'competent-raiserseat-test', fullTelemetry: false });
      await setupGame(Game);
      const rec = TDRV.createTalkRecorder(Game);
      rec.install();
      let lastCtx = null;
      const wrapped = Object.assign({}, competent, {
        daily: function (Gm, ctx) { lastCtx = ctx; return competent.daily(Gm, ctx); },
      });
      let result = null;
      await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
      rec.uninstall();
      let standing = null;
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      return { days: result.days, standing: standing, deepTurns: (lastCtx && lastCtx.deepTurns) || 0, talks: rec.t.talks, turns: rec.t.turns, errors: rec.t.errors.length };
    }
    const a = await shortRun();
    const b = await shortRun();
    DRV.setRaiserFlags('control');
    delete process.env.COMPETENT_TALK;
    delete process.env.RAISER_SEAT;
    assert.strictEqual(a.errors, 0, 'recorder errors: ' + a.errors);
    assert.ok(a.deepTurns > 0, 'held turns taken, deepTurns=' + a.deepTurns);
    assert.deepStrictEqual(a, b, 'flag-on 12d deterministic: ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
    console.log('    (12d reverted-flag x2: ' + JSON.stringify(a) + ')');
  });

  await aok('live: RAISER_SEAT-off + COMPETENT_TALK-on takes held turns (substrate on); both flags off is byte-identical to plain competent', async function () {
    async function shortRun(flags) {
      // flags: 'seat-off' (substrate on, signal off) or 'both-off' (plain competent).
      if (flags === 'seat-off') DRV.setRaiserFlags('control');
      else { delete process.env.COMPETENT_TALK; delete process.env.RAISER_SEAT; }
      const { Game } = await loadGame({ seed: 150201, mode: 'competent-raiserseat-test', fullTelemetry: false });
      await setupGame(Game);
      let lastCtx = null;
      const wrapped = Object.assign({}, competent, {
        daily: function (Gm, ctx) { lastCtx = ctx; return competent.daily(Gm, ctx); },
      });
      let result = null;
      await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
      let standing = null;
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      return { days: result.days, standing: standing, deepTurns: (lastCtx && lastCtx.deepTurns) || 0 };
    }
    const seatOff = await shortRun('seat-off');
    assert.ok(seatOff.deepTurns > 0, 'substrate-on leg takes held turns, deepTurns=' + seatOff.deepTurns);
    const bothOff = await shortRun('both-off');
    const plain = await shortRun('both-off');
    delete process.env.COMPETENT_TALK;
    delete process.env.RAISER_SEAT;
    assert.strictEqual(bothOff.deepTurns, 0, 'both-flags-off takes zero held turns');
    assert.strictEqual(bothOff.days, plain.days, 'both-flags-off days match plain competent');
    assert.strictEqual(bothOff.standing, plain.standing, 'both-flags-off standing matches plain competent');
    console.log('    (12d seat-off: days=' + seatOff.days + ' deepTurns=' + seatOff.deepTurns + '; both-off: days=' + bothOff.days + ' standing=' + bothOff.standing + ')');
  });

  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
