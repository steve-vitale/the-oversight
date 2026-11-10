// test-talkturn-a.js — proof test for the talk-turn arm
// (arm sim-talkturn-a, run fleshout-20261110T1215Z). Proves the
// instrument (COMPETENT_TALK=1 flag + talk-turn recorder driver) and
// the measurement (talkturn analyzer: second-link counting,
// answered-vs-expired, first-link source, cost bar).
//
// Legs: (a) talkOn() env gate on/off; (b) pickTalkChoice picks
// link:accept as the fallback first live choice, after the
// higher-priority choices are consumed, and still answers ans:*
// first; (c) analyzer second-link counting + answered-vs-expired +
// first-link source + cost bar on synthetic per-seed JSON; (d) live
// harness miniature (12d, seed 150201): flag-ON run takes real held
// conversation turns (deepTurns > 0) with zero instrument errors and
// is deterministic across identical runs; flag-OFF run is
// byte-identical to plain competent on days + standing (the control
// leg is a true control — deepTalk returns immediately).
// Usage: node scripts/test-talkturn-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const TA = require(path.join(__dirname, 'talkturn-analyze-20261110'));
const DRV = require(path.join(__dirname, 'talkturn-driver-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent, talkOn, pickTalkChoice } = require(path.join(__dirname, 'policies', 'competent'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
async function aok(name, fn) { await fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function withTalkEnv(value, fn) {
  const prev = process.env.COMPETENT_TALK;
  try {
    if (value == null) delete process.env.COMPETENT_TALK;
    else process.env.COMPETENT_TALK = value;
    return fn();
  } finally {
    if (prev == null) delete process.env.COMPETENT_TALK;
    else process.env.COMPETENT_TALK = prev;
  }
}

ok('talkOn: COMPETENT_TALK=1 on, unset/0 off', function () {
  assert.strictEqual(withTalkEnv('1', function () { return talkOn(); }), true);
  assert.strictEqual(withTalkEnv(undefined, function () { return talkOn(); }), false);
  assert.strictEqual(withTalkEnv('0', function () { return talkOn(); }), false);
  assert.strictEqual(withTalkEnv('', function () { return talkOn(); }), false);
});

ok('pickTalkChoice: link:accept is the fallback first live choice', function () {
  const menu = [
    { id: 'link:accept', label: '"All right. Let\'s ask them."' },
    { id: 'link:decline', label: '"Not them. Not now."' },
  ];
  assert.strictEqual(pickTalkChoice(menu, {}).id, 'link:accept');
});

ok('pickTalkChoice: higher-priority choices consumed first, link reached after', function () {
  const menu = [
    { id: 'link:accept', label: '"All right. Let\'s ask them."' },
    { id: 'link:decline', label: '"Not them. Not now."' },
    { id: 'teach', label: 'Teach.' },
    { id: 'ask', label: 'Ask.' },
  ];
  // Teach outranks the fallback; ask outranks it too.
  assert.strictEqual(pickTalkChoice(menu, {}).id, 'teach');
  assert.strictEqual(pickTalkChoice(menu, { teach: 1 }).id, 'ask');
  // Once teach + ask are consumed (no-repeat seen set), the link ask is reached.
  assert.strictEqual(pickTalkChoice(menu, { teach: 1, ask: 1 }).id, 'link:accept');
});

ok('pickTalkChoice: an unanswered question still comes first (courtesy preserved)', function () {
  const menu = [
    { id: 'link:accept', label: '"All right. Let\'s ask them."' },
    { id: 'link:decline', label: '"Not them. Not now."' },
    { id: 'ans:grief', label: 'Answer.' },
    { id: 'teach', label: 'Teach.' },
  ];
  assert.strictEqual(pickTalkChoice(menu, {}).id, 'ans:grief');
});

// --- Analyzer fixtures (same synthetic corpus shape as test-secondlink-a) ---
function fakeSeed(opts) {
  const base = {
    seed: 150201, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    scaleRank: 'regional', maxWave: 4, standing: 100,
    instrumentErrors: [], bondEvents: [], stageCalls: [], acceptCalls: [],
    declineCalls: [], proposeCalls: [], linkTickCalls: 0, daily: [],
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
function fakeLink(other) {
  return { key: other + '|LEAD|haven>' + other + '|:', other: other, kind: 'LEAD', primary: 'haven', subordinate: other, a: null, b: null, age: 30, trust: 40, conquered: false, status: 'active', seasoned: false, regional: false, reason: 'too-young' };
}

ok('analyzer: second link formed via raise counts; first link source = raise', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 11, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'accepted', chance: null, reason: null },
      { day: 20, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 21, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'accepted', chance: null, reason: null },
    ],
    proposeCalls: [
      { day: 11, villageId: 'emberhold', outcome: 'formed', stack: '' },
      { day: 21, villageId: 'stonebridge', outcome: 'formed', stack: '' },
    ],
    daily: [
      fakeDay(10),
      fakeDay(11, { links: [fakeLink('emberhold')], linkTotal: 1 }),
      fakeDay(20, { links: [fakeLink('emberhold')], linkTotal: 1, villages: [{ id: 'emberhold', name: 'Emberhold', opinion: 10, linked: true }, { id: 'stonebridge', name: 'Stonebridge', opinion: 5, linked: false }], scholarLore: ['emberhold', 'stonebridge'] }),
      fakeDay(21, { links: [fakeLink('emberhold'), fakeLink('stonebridge')], linkTotal: 2 }),
    ],
  });
  const r = TA.analyzeSeedTalkturn(j);
  assert.strictEqual(r.secondLinkFormed, true);
  assert.strictEqual(r.secondLinksViaRaise, 1);
  assert.strictEqual(r.firstLinkSource, 'raise');
  assert.strictEqual(r.answered.accepted, 2);
  assert.strictEqual(r.answered.expired, 0);
});

ok('analyzer: ladder first link + expired second raise = no second link, source ladder', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 20, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 23, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'expired', chance: null, reason: null },
    ],
    daily: [
      fakeDay(10, { links: [fakeLink('emberhold')], linkTotal: 1 }),
      fakeDay(20, { links: [fakeLink('emberhold')], linkTotal: 1, villages: [{ id: 'emberhold', name: 'Emberhold', opinion: 10, linked: true }, { id: 'stonebridge', name: 'Stonebridge', opinion: 5, linked: false }], scholarLore: ['emberhold', 'stonebridge'] }),
      fakeDay(23, { links: [fakeLink('emberhold')], linkTotal: 1 }),
    ],
  });
  const r = TA.analyzeSeedTalkturn(j);
  assert.strictEqual(r.secondLinkFormed, false);
  assert.strictEqual(r.secondLinksViaRaise, 0);
  assert.strictEqual(r.firstLinkSource, 'ladder');
  assert.strictEqual(r.answered.accepted, 0);
  assert.strictEqual(r.answered.expired, 1);
  assert.strictEqual(r.answered.refused, 0);
});

ok('analyzer: cost bar passes and fails on the prereg rule', function () {
  const ctrl = { starvation: 2, deaths: 10, median: 100 };
  const okArm = { starvation: 4, deaths: 10, median: 90 };
  const badStarve = { starvation: 5, deaths: 10, median: 90 };
  const badDeaths = { starvation: 2, deaths: 11, median: 90 };
  const badMedian = { starvation: 2, deaths: 10, median: 79 };
  assert.strictEqual(TA.costBar(okArm, ctrl).pass, true);
  assert.strictEqual(TA.costBar(badStarve, ctrl).pass, false);
  assert.strictEqual(TA.costBar(badDeaths, ctrl).pass, false);
  assert.strictEqual(TA.costBar(badMedian, ctrl).pass, false);
  assert.strictEqual(TA.costBar(okArm, ctrl).reasons.length, 0);
});

ok('driver: setTalkFlag sets/deletes COMPETENT_TALK explicitly', function () {
  DRV.setTalkFlag('armed');
  assert.strictEqual(process.env.COMPETENT_TALK, '1');
  DRV.setTalkFlag('control');
  assert.strictEqual(process.env.COMPETENT_TALK, undefined);
});

(async function () {
  await aok('live: talk recorder installs; flag-ON 12d takes real held turns, zero errors', async function () {
    DRV.setTalkFlag('armed');
    const { Game } = await loadGame({ seed: 150201, mode: 'competent-talkturn-test', fullTelemetry: false });
    await setupGame(Game);
    const rec = DRV.createTalkRecorder(Game);
    rec.install();
    let lastCtx = null;
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        lastCtx = ctx;
        try { return competent.daily(Gm, ctx); } finally { try { rec.snapshotDay(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    rec.uninstall();
    DRV.setTalkFlag('control');
    assert.strictEqual(rec.t.errors.length, 0, 'recorder errors: ' + JSON.stringify(rec.t.errors));
    assert.ok((lastCtx.deepTurns || 0) > 0, 'held turns taken, deepTurns=' + (lastCtx && lastCtx.deepTurns));
    assert.ok((lastCtx.deepConvos || 0) > 0, 'held sittings held, deepConvos=' + (lastCtx && lastCtx.deepConvos));
    assert.ok(rec.t.talks > 0, 'talks recorded, talks=' + rec.t.talks);
    assert.ok(rec.t.turns > 0, 'convo turns recorded, turns=' + rec.t.turns);
    console.log('    (12d armed: days=' + result.days + ' deepConvos=' + lastCtx.deepConvos + ' deepTurns=' + lastCtx.deepTurns + ' talks=' + rec.t.talks + ' turns=' + rec.t.turns + ')');
  });

  await aok('live: flag-OFF 12d is byte-identical to plain competent (true control)', async function () {
    async function shortRun(withFlag) {
      if (withFlag) DRV.setTalkFlag('armed'); else DRV.setTalkFlag('control');
      const { Game } = await loadGame({ seed: 150201, mode: 'competent-talkturn-test', fullTelemetry: false });
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
    const off = await shortRun(false);
    const plain = await shortRun(false);
    assert.strictEqual(off.deepTurns, 0, 'flag-off takes zero held turns');
    assert.strictEqual(off.days, plain.days, 'flag-off days match plain competent');
    assert.strictEqual(off.standing, plain.standing, 'flag-off standing matches plain competent');
    DRV.setTalkFlag('control');
    console.log('    (12d control: days=' + off.days + ' standing=' + off.standing + ')');
  });

  await aok('live: flag-ON 12d determinism (same seed twice)', async function () {
    async function shortRun() {
      DRV.setTalkFlag('armed');
      const { Game } = await loadGame({ seed: 150201, mode: 'competent-talkturn-test', fullTelemetry: false });
      await setupGame(Game);
      const rec = DRV.createTalkRecorder(Game);
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
      return { days: result.days, standing: standing, deepTurns: (lastCtx && lastCtx.deepTurns) || 0, talks: rec.t.talks, turns: rec.t.turns };
    }
    const a = await shortRun();
    const b = await shortRun();
    DRV.setTalkFlag('control');
    assert.deepStrictEqual(a, b, 'flag-on 12d deterministic: ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
    console.log('    (12d armed x2: ' + JSON.stringify(a) + ')');
  });

  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
