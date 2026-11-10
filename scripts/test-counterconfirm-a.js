// test-counterconfirm-a.js — proof test for the counter-close CONFIRM
// (arm sim-counterconfirm-a, run fleshout-20261110T2215Z).
//
// Legs: (a) policy units on a fake Game — COUNTER_ANSWER gate, the
// sweeten-if-pantry->=12000 / walk-if-thin decision, ctx counts for
// formed/failed/held/walked, and the RAISER_SEAT HARNESS-ACTIVE pins
// (the +35 signal is live in this tree ONLY as the confirm harness on
// both legs; the revert commit flips these three tests to the revert
// pins — flag a no-op on talkScore, exports gone — exactly as
// test-counterclose-a.js does for the pilot); (b) analyzer fixtures —
// the fresh vs blocked counter split, stalled-at-end from the last
// counterDays snapshot, first-fresh score/opinion/rep pairing, revised
// per-day cost bar; (c) driver flags; (d) live harness miniatures
// (12d, seed 150217) — armed config takes real held turns with zero
// instrument errors and is deterministic, control config likewise;
// plus a real-engine counter-answer proof (fabricated pendingCounter
// on a loaded game: walk path on a thin pantry, sweeten path on a fat
// pantry with exactly 1,500 kcal debited).
// Usage: node scripts/test-counterconfirm-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'counterconfirm-analyze-20261110'));
const DRV = require(path.join(__dirname, 'counterconfirm-driver-20261110'));
const TDRV = require(path.join(__dirname, 'talkturn-driver-20261110'));
const CINST = require(path.join(__dirname, 'counterclose-instrument-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const COMP = require(path.join(__dirname, 'policies', 'competent'));
const { competent, talkOn, talkScore, pickTalkTargets, counterAnswerOn, answerPendingCounter, COUNTER_SWEETEN_PANTRY_MIN, COUNTER_SWEETEN_KCAL, raiserSeatOn, RAISER_SEAT_BONUS } = COMP;

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
async function aok(name, fn) { await fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function withEnv(env, fn) {
  const prev = { talk: process.env.COMPETENT_TALK, seat: process.env.RAISER_SEAT, counter: process.env.COUNTER_ANSWER };
  try {
    if (env.talk == null) delete process.env.COMPETENT_TALK; else process.env.COMPETENT_TALK = env.talk;
    if (env.seat == null) delete process.env.RAISER_SEAT; else process.env.RAISER_SEAT = env.seat;
    if (env.counter == null) delete process.env.COUNTER_ANSWER; else process.env.COUNTER_ANSWER = env.counter;
    return fn();
  } finally {
    if (prev.talk == null) delete process.env.COMPETENT_TALK; else process.env.COMPETENT_TALK = prev.talk;
    if (prev.seat == null) delete process.env.RAISER_SEAT; else process.env.RAISER_SEAT = prev.seat;
    if (prev.counter == null) delete process.env.COUNTER_ANSWER; else process.env.COUNTER_ANSWER = prev.counter;
  }
}

// --- Fake Game for the counter-answer decision units. ---
function fakeCounterGame(opts) {
  const pantry = (opts.pantryKcal != null) ? [{ kcalEach: opts.pantryKcal, units: 1 }] : [];
  const g = {
    state: {
      village: { pantry: pantry },
      pendingCounter: opts.counter || null,
    },
    answerCounterCalls: [],
    answerCounter: function (how) {
      g.answerCounterCalls.push(how);
      if (opts.answerResult !== undefined) return opts.answerResult;
      if (how === 'sweeten') return { id: 'link_test' };
      g.state.pendingCounter = null;
      return null;
    },
  };
  return g;
}
const CTR = { targetId: 'emberhold', asSubordinate: true, tributeKcalPerWeek: 5000, day: 6, kind: undefined };

ok('gate: COUNTER_ANSWER off = no-op (answerCounter never called, ctx untouched)', function () {
  const g = fakeCounterGame({ pantryKcal: 20000, counter: CTR });
  const ctx = {};
  withEnv({ counter: undefined }, function () { answerPendingCounter(g, ctx); });
  assert.strictEqual(g.answerCounterCalls.length, 0);
  assert.strictEqual(ctx.counterSweetened, undefined);
  assert.strictEqual(counterAnswerOn(), false);
});

ok('gate: COUNTER_ANSWER on + no pending counter = no-op', function () {
  const g = fakeCounterGame({ pantryKcal: 20000, counter: null });
  const ctx = {};
  withEnv({ counter: '1' }, function () {
    assert.strictEqual(counterAnswerOn(), true);
    answerPendingCounter(g, ctx);
  });
  assert.strictEqual(g.answerCounterCalls.length, 0);
});

ok('decision: pantry >= 12000 sweetens; formed link counted, 1500 kcal booked', function () {
  const g = fakeCounterGame({ pantryKcal: 20000, counter: CTR, answerResult: { id: 'link_test' } });
  const ctx = {};
  withEnv({ counter: '1' }, function () { answerPendingCounter(g, ctx); });
  assert.deepStrictEqual(g.answerCounterCalls, ['sweeten']);
  assert.strictEqual(ctx.counterSweetened, 1);
  assert.strictEqual(ctx.counterSweetenFormed, 1);
  assert.strictEqual(ctx.counterSweetenKcal, 1500);
  assert.strictEqual(ctx.counterWalked, undefined);
});

ok('decision: sweeten refused (null) counts as failed, table still cleared by the verb', function () {
  const g = fakeCounterGame({ pantryKcal: 20000, counter: CTR, answerResult: null });
  const ctx = {};
  withEnv({ counter: '1' }, function () { answerPendingCounter(g, ctx); });
  assert.deepStrictEqual(g.answerCounterCalls, ['sweeten']);
  assert.strictEqual(ctx.counterSweetened, 1);
  assert.strictEqual(ctx.counterSweetenFailed, 1);
  assert.strictEqual(ctx.counterSweetenFormed, undefined);
});

ok('decision: sweeten held (pantry fell short at the verb) counts as held', function () {
  const g = fakeCounterGame({ pantryKcal: 20000, counter: CTR, answerResult: 'counter' });
  const ctx = {};
  withEnv({ counter: '1' }, function () { answerPendingCounter(g, ctx); });
  assert.deepStrictEqual(g.answerCounterCalls, ['sweeten']);
  assert.strictEqual(ctx.counterSweetenHeld, 1);
});

ok('decision: pantry < 12000 walks (keeps the food, clears the table)', function () {
  const g = fakeCounterGame({ pantryKcal: 8000, counter: CTR });
  const ctx = {};
  withEnv({ counter: '1' }, function () { answerPendingCounter(g, ctx); });
  assert.deepStrictEqual(g.answerCounterCalls, ['walk']);
  assert.strictEqual(ctx.counterWalked, 1);
  assert.strictEqual(ctx.counterSweetened, undefined);
  assert.strictEqual(ctx.counterSweetenKcal, undefined);
});

ok('decision: pantry exactly at the 12000 bar sweetens; 11999 walks', function () {
  assert.strictEqual(COUNTER_SWEETEN_PANTRY_MIN, 12000);
  assert.strictEqual(COUNTER_SWEETEN_KCAL, 1500);
  const g1 = fakeCounterGame({ pantryKcal: 12000, counter: CTR, answerResult: { id: 'l' } });
  withEnv({ counter: '1' }, function () { answerPendingCounter(g1, {}); });
  assert.deepStrictEqual(g1.answerCounterCalls, ['sweeten']);
  const g2 = fakeCounterGame({ pantryKcal: 11999, counter: CTR });
  withEnv({ counter: '1' }, function () { answerPendingCounter(g2, {}); });
  assert.deepStrictEqual(g2.answerCounterCalls, ['walk']);
});

// --- Fake Game for talkScore units (HARNESS-ACTIVE pins — the
// RAISER_SEAT +35 signal is live in this tree ONLY as the confirm
// harness; the revert commit flips these to the revert pins.) ---
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

ok('harness: RAISER_SEAT=1 adds +35 to an answerable raiser (flag off = base)', function () {
  assert.strictEqual(RAISER_SEAT_BONUS, 35);
  assert.strictEqual(withEnv({ seat: '1' }, function () { return raiserSeatOn(); }), true);
  assert.strictEqual(withEnv({ seat: undefined }, function () { return raiserSeatOn(); }), false);
  const g = fakeGame({
    convo: { devon: { count: 12 }, ella: { count: 0 } },
    bond: { devon: 25, ella: 0 },
    pending: { devon: RAISE },
    comm: { devon: 'full' },
  });
  assert.strictEqual(withEnv({ seat: undefined }, function () { return talkScore(g, {}, 'devon'); }), 0, 'devon base is 0 (trusted, talked-to)');
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'devon'); }), 35, 'flag on: base 0 + 35');
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(g, {}, 'ella'); }), 30, 'stranger max is still 30');
});

ok('harness: unanswerable raiser (comm none) gets no bonus; no commLevel fails open', function () {
  const gNone = fakeGame({
    convo: { devon: { count: 12 } },
    bond: { devon: 25 },
    pending: { devon: RAISE },
    comm: { devon: 'none' },
  });
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(gNone, {}, 'devon'); }), 0, 'comm none: no seat spent');
  const gNoComm = fakeGame({
    convo: { devon: { count: 12 } },
    bond: { devon: 25 },
    pending: { devon: RAISE },
    noComm: true,
  });
  assert.strictEqual(withEnv({ seat: '1' }, function () { return talkScore(gNoComm, {}, 'devon'); }), 35, 'missing commLevel fails open');
});

ok('harness: pickTalkTargets seats the raiser first with the flag on', function () {
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
  assert.deepStrictEqual(on, ['devon', 'ella', 'raj'], 'flag on: raiser first');
});

// --- Analyzer fixtures (same synthetic corpus shape as test-counterclose-a). ---
function fakeSeed(opts) {
  const base = {
    seed: 150217, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    scaleRank: 'regional', maxWave: 4, standing: 100,
    instrumentErrors: [], bondEvents: [], stageCalls: [], acceptCalls: [],
    declineCalls: [], proposeCalls: [], linkTickCalls: 0, daily: [],
    raiseDays: [],
    counter: { propose: [], judgments: [], answers: [], counterDays: [], ctx: null },
    talk: { talks: 0, turns: 0, linkPicks: 0, bondPicks: 0, talksWithRaiserPending: 0, deepConvos: 0, deepTurns: 0 },
    deaths: [],
  };
  return Object.assign(base, opts || {});
}

ok('analyzer: fresh vs blocked split — 1 fresh + 28 blocked + 0 formed is the 150204 shape', function () {
  const propose = [{ day: 10, villageId: 'village_0', outcome: 'counter', kind: 'fresh-counter', pendingBefore: false, opinion: 0, repStanding: 4 }];
  for (let d = 12; d <= 12 + 27; d++) propose.push({ day: d, villageId: 'village_1', outcome: 'counter', kind: 'blocked-reknock', pendingBefore: true, opinion: 6, repStanding: 4 });
  const j = fakeSeed({
    counter: {
      propose: propose,
      judgments: [{ day: 10, targetId: 'village_0', score: 44, reasons: ['cold ask'], caller: 'proposeLink' }],
      answers: [],
      counterDays: [{ day: 9, pendingCounter: null, pantryKcal: 20000 }, { day: 80, pendingCounter: { targetId: 'village_0', asSubordinate: true, tributeKcalPerWeek: 5000, day: 10 }, pantryKcal: 18000 }],
      ctx: null,
    },
  });
  const r = AN.analyzeSeedCounterclose(j);
  assert.strictEqual(r.counter.fresh, 1);
  assert.strictEqual(r.counter.blocked, 28);
  assert.strictEqual(r.counter.formed, 0);
  assert.strictEqual(r.counter.stalledAtEnd, true);
  assert.strictEqual(r.counter.stalledTarget, 'village_0');
  assert.strictEqual(r.counter.stalledSinceDay, 10);
  assert.strictEqual(r.counter.firstFreshDay, 10);
  assert.strictEqual(r.counter.firstFreshScore, 44);
  assert.strictEqual(r.counter.firstFreshOpinion, 0);
  assert.strictEqual(r.counter.firstFreshRepStanding, 4);
});

ok('analyzer: no counter at end = not stalled; sweeten answers counted by result', function () {
  const j = fakeSeed({
    counter: {
      propose: [
        { day: 6, villageId: 'emberhold', outcome: 'counter', kind: 'fresh-counter', pendingBefore: false, opinion: 2, repStanding: 6 },
        { day: 20, villageId: 'ashford', outcome: 'formed', kind: 'formed', pendingBefore: false, opinion: 12, repStanding: 10 },
      ],
      judgments: [{ day: 6, targetId: 'emberhold', score: 41, reasons: [], caller: 'proposeLink' }],
      answers: [
        { day: 7, how: 'sweeten', targetId: 'emberhold', result: 'formed-link', pantryBefore: 20000, pantryAfter: 18500 },
        { day: 30, how: 'walk', targetId: 'thornfield', result: 'refused-null', pantryBefore: 9000, pantryAfter: 9000 },
      ],
      counterDays: [{ day: 6, pendingCounter: { targetId: 'emberhold', day: 6 }, pantryKcal: 20000 }, { day: 30, pendingCounter: null, pantryKcal: 9000 }],
      ctx: { counterSweetened: 1, counterSweetenFormed: 1, counterWalked: 1, counterSweetenKcal: 1500 },
    },
  });
  const r = AN.analyzeSeedCounterclose(j);
  assert.strictEqual(r.counter.fresh, 1);
  assert.strictEqual(r.counter.blocked, 0);
  assert.strictEqual(r.counter.formed, 1);
  assert.strictEqual(r.counter.stalledAtEnd, false);
  assert.strictEqual(r.counter.sweetenFormed, 1);
  assert.strictEqual(r.counter.walked, 1);
  assert.strictEqual(r.counter.answerCalls, 2);
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
  assert.strictEqual(AN.costBarRevised(badArmOnly, ctrl).pass, false, 'arm-only 1 > control total 0');
  assert.strictEqual(AN.costBarRevised(badMedian, ctrl).pass, false, 'median 79 < 0.8*100');
  assert.strictEqual(AN.costBarRevised(okArm, ctrl).reasons.length, 0);
});

ok('driver: setCounterFlags sets TALK=1 + SEAT=1 on both legs, COUNTER_ANSWER per leg', function () {
  DRV.setCounterFlags('armed');
  assert.strictEqual(process.env.COMPETENT_TALK, '1');
  assert.strictEqual(process.env.RAISER_SEAT, '1');
  assert.strictEqual(process.env.COUNTER_ANSWER, '1');
  DRV.setCounterFlags('control');
  assert.strictEqual(process.env.COMPETENT_TALK, '1');
  assert.strictEqual(process.env.RAISER_SEAT, '1');
  assert.strictEqual(process.env.COUNTER_ANSWER, undefined);
  delete process.env.COMPETENT_TALK;
  delete process.env.RAISER_SEAT;
  delete process.env.COUNTER_ANSWER;
});

(async function () {
  await aok('live: armed config (TALK+SEAT+COUNTER) 12d takes real held turns, zero errors, deterministic', async function () {
    async function shortRun() {
      DRV.setCounterFlags('armed');
      const { Game } = await loadGame({ seed: 150217, mode: 'competent-counterconfirm-test', fullTelemetry: false });
      await setupGame(Game);
      const cinst = CINST.install(Game);
      const rec = TDRV.createTalkRecorder(Game);
      rec.install();
      let lastCtx = null;
      const wrapped = Object.assign({}, competent, {
        daily: function (Gm, ctx) { lastCtx = ctx; try { return competent.daily(Gm, ctx); } finally { cinst.snapshotDay(); } },
      });
      let result = null;
      await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
      rec.uninstall();
      cinst.uninstall();
      let standing = null;
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      return {
        days: result.days, standing: standing,
        deepTurns: (lastCtx && lastCtx.deepTurns) || 0, talks: rec.t.talks, turns: rec.t.turns,
        errors: rec.t.errors.length + cinst.t.instrumentErrors.length,
        counterAnswers: (cinst.t.answers || []).length,
      };
    }
    const a = await shortRun();
    const b = await shortRun();
    delete process.env.COMPETENT_TALK;
    delete process.env.RAISER_SEAT;
    delete process.env.COUNTER_ANSWER;
    assert.strictEqual(a.errors, 0, 'instrument errors: ' + a.errors);
    assert.ok(a.deepTurns > 0, 'held turns taken, deepTurns=' + a.deepTurns);
    assert.deepStrictEqual(a, b, 'armed 12d deterministic: ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
    console.log('    (12d armed x2: ' + JSON.stringify(a) + ')');
  });

  await aok('live: control config (TALK+SEAT, no COUNTER) 12d takes held turns, zero errors', async function () {
    DRV.setCounterFlags('control');
    const { Game } = await loadGame({ seed: 150217, mode: 'competent-counterconfirm-test', fullTelemetry: false });
    await setupGame(Game);
    const cinst = CINST.install(Game);
    const rec = TDRV.createTalkRecorder(Game);
    rec.install();
    let lastCtx = null;
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) { lastCtx = ctx; try { return competent.daily(Gm, ctx); } finally { cinst.snapshotDay(); } },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    rec.uninstall();
    cinst.uninstall();
    delete process.env.COMPETENT_TALK;
    delete process.env.RAISER_SEAT;
    delete process.env.COUNTER_ANSWER;
    assert.strictEqual(rec.t.errors.length + cinst.t.instrumentErrors.length, 0);
    assert.ok(((lastCtx && lastCtx.deepTurns) || 0) > 0, 'held turns taken');
    console.log('    (12d control: days=' + result.days + ' deepTurns=' + ((lastCtx && lastCtx.deepTurns) || 0) + ')');
  });

  await aok('live: real-engine counter answer — fabricated counter on a loaded game (walk on thin pantry, sweeten on fat pantry, exactly 1500 kcal debited)', async function () {
    // Walk path: thin pantry.
    {
      const { Game } = await loadGame({ seed: 150217, mode: 'competent-counterconfirm-test', fullTelemetry: false });
      await setupGame(Game);
      const ovs = ((Game.state || {}).otherVillages || []);
      assert.ok(ovs.length > 0, 'other villages exist');
      const target = ovs[0].id;
      // A fresh game stocks a fat pantry (>= 12000), which would
      // sweeten — empty it to force the walk path under test.
      Game.state.village.pantry = [];
      Game.state.pendingCounter = { targetId: target, asSubordinate: true, tributeKcalPerWeek: 5000, day: 1 };
      const ctx = {};
      withEnv({ counter: '1' }, function () { answerPendingCounter(Game, ctx); });
      assert.strictEqual(Game.state.pendingCounter, null, 'walk clears the counter');
      assert.strictEqual(ctx.counterWalked, 1);
      assert.strictEqual(ctx.counterSweetened, undefined);
    }
    // Sweeten path: fat pantry (surgery: add real pantry items).
    {
      const { Game } = await loadGame({ seed: 150217, mode: 'competent-counterconfirm-test', fullTelemetry: false });
      await setupGame(Game);
      const ovs = ((Game.state || {}).otherVillages || []);
      const target = ovs[0].id;
      Game.state.village.pantry = Game.state.village.pantry || [];
      Game.state.village.pantry.push({ kcalEach: 5000, units: 4 });
      const before = ((Game.state.village.pantry || []).reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0));
      assert.ok(before >= 12000, 'fat pantry before sweeten: ' + before);
      Game.state.pendingCounter = { targetId: target, asSubordinate: true, tributeKcalPerWeek: 5000, day: 1 };
      const ctx = {};
      withEnv({ counter: '1' }, function () { answerPendingCounter(Game, ctx); });
      const after = ((Game.state.village.pantry || []).reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0));
      assert.strictEqual(Game.state.pendingCounter, null, 'sweeten clears the counter either way');
      assert.strictEqual(ctx.counterSweetened, 1);
      assert.strictEqual(before - after, 1500, 'exactly the 1500 kcal sweetener left the pantry (' + before + ' -> ' + after + ')');
      assert.strictEqual((ctx.counterSweetenFormed || 0) + (ctx.counterSweetenFailed || 0), 1, 'exactly one sweeten outcome recorded (formed XOR failed)');
      console.log('    (sweeten: pantry ' + before + ' -> ' + after + ', formed=' + (ctx.counterSweetenFormed || 0) + ' failed=' + (ctx.counterSweetenFailed || 0) + ', target=' + target + ')');
    }
    delete process.env.COMPETENT_TALK;
    delete process.env.RAISER_SEAT;
    delete process.env.COUNTER_ANSWER;
  });

  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
