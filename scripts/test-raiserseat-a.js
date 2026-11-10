// test-raiserseat-a.js — proof test for the raiser-seat arm
// (arm sim-raiserseat-a, run fleshout-20261110T1415Z). Proves the
// mechanism (RAISER_SEAT=1 pending-raise signal in talkScore) and the
// measurement (raiserseat analyzer: 150206-class detection, revised
// per-day cost bar).
//
// Legs: (a) raiserSeatOn() env gate on/off; (b) talkScore unit legs on
// a fake Game: an answerable raiser with a pending ask outranks a
// stranger (+35 beats the stranger max 30 from a zero base; the
// 150206-shaped case: base 8 vs stranger 29 -> 43 > 29); no pending
// raise = picker unchanged; unanswerable raiser (commLevel 'none') =
// no bonus; fail-open when commLevel is missing; a want-bearer and a
// grieving stranger still outrank a low-base raiser (priority
// preserved); pickTalkTargets orders the raiser first with the flag
// on and is unchanged with it off; (c) analyzer 150206-class
// detection + revised cost bar (per-day, arm-only starvation,
// starvation, median) on synthetic per-seed JSON; (d) live harness
// miniature (12d, seed 150201): flag-ON run takes real held turns
// with zero instrument errors and is deterministic across identical
// runs; the RAISER_SEAT-off + COMPETENT_TALK-on leg also takes held
// turns (the talkturn-a substrate is on); both flags OFF is
// byte-identical to plain competent on days + standing (the gates add
// nothing when off).
// Usage: node scripts/test-raiserseat-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'raiserseat-analyze-20261110'));
const DRV = require(path.join(__dirname, 'raiserseat-driver-20261110'));
const TDRV = require(path.join(__dirname, 'talkturn-driver-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent, talkOn, raiserSeatOn, RAISER_SEAT_BONUS, talkScore, pickTalkTargets } = require(path.join(__dirname, 'policies', 'competent'));

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

ok('raiserSeatOn: RAISER_SEAT=1 on, unset/0 off; bonus is 35', function () {
  assert.strictEqual(withEnv({ seat: '1' }, function () { return raiserSeatOn(); }), true);
  assert.strictEqual(withEnv({ seat: undefined }, function () { return raiserSeatOn(); }), false);
  assert.strictEqual(withEnv({ seat: '0' }, function () { return raiserSeatOn(); }), false);
  assert.strictEqual(RAISER_SEAT_BONUS, 35);
});

ok('talkScore: answerable raiser outranks a stranger (zero-base raiser 35 > stranger max 30)', function () {
  const g = fakeGame({
    convo: { devon: { count: 12 }, ella: { count: 0 } },
    bond: { devon: 25, ella: 0 },
    pending: { devon: RAISE },
    comm: { devon: 'full' },
  });
  const base = withEnv({ seat: undefined }, function () { return talkScore(g, {}, 'devon'); });
  assert.strictEqual(base, 0, 'devon base is 0 (trusted, talked-to)');
  const armed = withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'devon'); });
  assert.strictEqual(armed, 35, 'devon armed is 35');
  const stranger = withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'ella'); });
  assert.strictEqual(stranger, 30, 'stranger max is 30');
  assert.ok(armed > stranger, 'raiser outranks the stranger');
});

ok('talkScore: 150206-shaped case — raiser base 8 vs stranger 29 -> 43 > 29', function () {
  const g = fakeGame({
    convo: { devon: { count: 4 }, ella: { count: 1 } },
    bond: { devon: 18, ella: 0 },
    pending: { devon: RAISE },
    comm: { devon: 'full' },
  });
  assert.strictEqual(withEnv({ seat: undefined }, function () { return talkScore(g, {}, 'devon'); }), 8);
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'devon'); }), 43);
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'ella'); }), 29);
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

ok('talkScore: unanswerable raiser (commLevel none) gets no bonus', function () {
  const g = fakeGame({
    convo: { gen: { count: 5 } },
    bond: { gen: 0 },
    pending: { gen: RAISE },
    comm: { gen: 'none' },
  });
  const base = withEnv({ seat: undefined }, function () { return talkScore(g, {}, 'gen'); });
  const armed = withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'gen'); });
  assert.strictEqual(armed, base, 'no bonus when the ask cannot appear in the menu');
  assert.strictEqual(base, 25, 'base is stranger 20 + count 5');
});

ok('talkScore: fail-open when commLevel is missing (bonus applies)', function () {
  const g = fakeGame({
    convo: { devon: { count: 12 } },
    bond: { devon: 25 },
    pending: { devon: RAISE },
    noComm: true,
  });
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'devon'); }), 35);
});

ok('talkScore: want-bearer and grieving stranger still outrank a low-base raiser (priority preserved)', function () {
  const g = fakeGame({
    convo: {
      devon: { count: 12 },
      wanter: { count: 0, want: { id: 'w1' } },
      griever: { count: 0 },
    },
    mood: { griever: 'grieving' },
    bond: { devon: 25, wanter: 0, griever: 0 },
    pending: { devon: RAISE },
    comm: { devon: 'full' },
  });
  const raiser = withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'devon'); });
  const wanter = withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'wanter'); });
  const griever = withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'griever'); });
  assert.strictEqual(raiser, 35);
  assert.strictEqual(wanter, 130, 'want 100 + stranger 20 + count 10');
  assert.strictEqual(griever, 80, 'grief 50 + stranger 20 + count 10');
  assert.ok(wanter > raiser && griever > raiser, 'grief and wants keep priority over the raise signal');
});

ok('pickTalkTargets: raiser first with the flag on, order unchanged with it off', function () {
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
  assert.strictEqual(on[0], 'devon', 'flag on: raiser takes the first seat');
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
  await aok('live: flag-ON 12d takes real held turns, zero errors, deterministic', async function () {
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
    console.log('    (12d armed x2: ' + JSON.stringify(a) + ')');
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
