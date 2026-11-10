// test-secondlink-a.js — proof test for the second-link road recorder
// instrument + analyzer (arm sim-secondlink-a, run
// fleshout-20261110T0415Z). Fixture legs (per-village classification
// by rule: raised / staged-and-lost / never-staged with dominant gate
// / unknown; staging-fate mapping incl. accepted->counter and
// accepted->propose-declined; second-raise definition) plus live
// harness legs: (1) a fresh loaded game installs the instrument with
// zero errors, the daily snapshot carries the full census shape, the
// lazy tele wrap captures a fired bond_proposed link event, the
// stageLinkRaise/proposeLink wraps record and return the original
// value, and uninstall restores the methods; (2) determinism: the
// same seed run twice (12 days, instrument ON) yields identical
// days/standing/bond-event streams; (3) neutrality (miniature of the
// prereg bar): instrument ON vs OFF over the same 12 days yields
// identical days + standing.
// Usage: node scripts/test-secondlink-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'secondlink-analyze-20261110'));
const INST = require(path.join(__dirname, 'secondlink-instrument-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
async function aok(name, fn) { await fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function fakeSeed(opts) {
  // Minimal synthetic per-seed corpus for analyzeSeed.
  const base = {
    seed: 99101, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    scaleRank: 'regional', maxWave: 4, standing: 100,
    instrumentErrors: [], bondEvents: [], stageCalls: [], acceptCalls: [],
    declineCalls: [], proposeCalls: [], linkTickCalls: 0, daily: [],
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
function fakeLink(other, day) {
  return { key: other + '|LEAD|haven>' + other + '|:', other: other, kind: 'LEAD', primary: 'haven', subordinate: other, a: null, b: null, age: 30, trust: 40, conquered: false, status: 'active', seasoned: false, regional: false, reason: 'too-young' };
}

ok('classify: raised — staging + accept + propose formed', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 11, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'accepted', chance: null, reason: null },
    ],
    proposeCalls: [{ day: 11, villageId: 'emberhold', outcome: 'formed', stack: '' }],
    daily: [fakeDay(10), fakeDay(11, { links: [fakeLink('emberhold', 11)], linkTotal: 1 }), fakeDay(12, { links: [fakeLink('emberhold', 12)], linkTotal: 1 })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.villages.emberhold.class, 'raised');
  assert.strictEqual(r.firstLink.other, 'emberhold');
  assert.strictEqual(r.stagings[0].fate, 'accepted->formed');
  assert.strictEqual(r.secondStagings.length, 0);
});

ok('classify: staged-and-lost — expired raise, no link', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 13, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'expired', chance: null, reason: null },
    ],
    daily: [fakeDay(10, { pendingRaises: [{ vid: 'nathan', villageId: 'emberhold', day: 10, line: 'x' }] }),
      fakeDay(13, { raiseState: [{ key: 'emberhold|nathan', day: 13, outcome: 'expired' }] })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.villages.emberhold.class, 'staged-and-lost');
  assert.strictEqual(r.stagings[0].fate, 'expired');
  assert.strictEqual(r.firstLink, null);
});

ok('classify: staged-and-lost — accepted but propose countered, then refused', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 11, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'accepted', chance: null, reason: null },
    ],
    proposeCalls: [{ day: 11, villageId: 'emberhold', outcome: 'counter', stack: '' }],
    daily: [fakeDay(10), fakeDay(11, { pending: { counter: true, accord: false, national: false, global: false } })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.villages.emberhold.class, 'staged-and-lost');
  assert.strictEqual(r.stagings[0].fate, 'accepted->counter');
});

ok('classify: never-staged with dominant gate (no-lore)', function () {
  const raiser = { vid: 'nathan', alive: true, isScholar: false, trust: 25, buildStanding: 1,
    lore: [], unlinkedKnown: [], cooldown: [], hasPending: false, talkBlocked: false,
    gates: ['no-lore'], eligible: false };
  const j = fakeSeed({
    daily: [fakeDay(10, { scholarLore: ['emberhold'], raisers: [raiser], eligibleRaisers: 0 }),
      fakeDay(11, { scholarLore: ['emberhold'], raisers: [raiser], eligibleRaisers: 0 })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.villages.emberhold.class, 'never-staged');
  assert.strictEqual(r.villages.emberhold.dominantGate, 'no-lore');
  assert.strictEqual(r.census.eligibleRaiserDays, 0);
});

ok('classify: unknown — village never in any roll or lore', function () {
  const j = fakeSeed({ daily: [fakeDay(10, { villages: [], scholarLore: [], raisers: [], eligibleRaisers: 0 })] });
  const r = AN.analyzeSeed(j);
  assert.deepStrictEqual(Object.keys(r.villages), []);
});

ok('classify: unknown — in the region roll but in nobody\'s lore', function () {
  // The roll alone is not knowledge: no scholar lore, no raiser lore.
  const j = fakeSeed({
    daily: [fakeDay(10, { scholarLore: [], raisers: [{ vid: 'nathan', alive: true, isScholar: false, trust: 25, buildStanding: 1,
      lore: [], unlinkedKnown: [], cooldown: [], hasPending: false, talkBlocked: false,
      gates: ['no-lore'], eligible: false }], eligibleRaisers: 0 })],
  });
  const r = AN.analyzeSeed(j);
  assert.deepStrictEqual(Object.keys(r.villages), []);
});

ok('classify: first-link village holds a link but its raises were lost', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 13, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'expired', chance: null, reason: null },
    ],
    daily: [fakeDay(10, { pendingRaises: [{ vid: 'nathan', villageId: 'emberhold', day: 10, line: 'x' }] }),
      fakeDay(13, { raiseState: [{ key: 'emberhold|nathan', day: 13, outcome: 'expired' }] }),
      fakeDay(20, { links: [fakeLink('emberhold', 20)], linkTotal: 1 })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.villages.emberhold.class, 'staged-and-lost');
  assert.strictEqual(r.villages.emberhold.linkFormed, true);
  assert.strictEqual(r.villages.emberhold.formedViaRaise, false);
});

ok('classify: second raise = different target after first link', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 11, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'accepted', chance: null, reason: null },
      { day: 20, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 21, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'refused', chance: null, reason: null },
    ],
    proposeCalls: [{ day: 11, villageId: 'emberhold', outcome: 'formed', stack: '' }],
    daily: [
      fakeDay(10),
      fakeDay(11, { links: [fakeLink('emberhold', 11)], linkTotal: 1, villages: [{ id: 'emberhold', name: 'Emberhold', opinion: 10, linked: true }, { id: 'stonebridge', name: 'Stonebridge', opinion: 5, linked: false }] }),
      fakeDay(20, { links: [fakeLink('emberhold', 20)], linkTotal: 1, villages: [{ id: 'emberhold', name: 'Emberhold', opinion: 10, linked: true }, { id: 'stonebridge', name: 'Stonebridge', opinion: 5, linked: false }], scholarLore: ['emberhold', 'stonebridge'] }),
      fakeDay(21, { links: [fakeLink('emberhold', 21)], linkTotal: 1 }),
    ],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.villages.emberhold.class, 'raised');
  assert.strictEqual(r.villages.stonebridge.class, 'staged-and-lost');
  assert.strictEqual(r.stagings.length, 2);
  assert.strictEqual(r.secondStagings.length, 1);
  assert.strictEqual(r.secondStagings[0].fate, 'refused');
  assert.strictEqual(r.secondStagings[0].villageId, 'stonebridge');
});

ok('reconcile: staged event with no snapshot trace is listed bad', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
    ],
    daily: [fakeDay(10), fakeDay(11)],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.reconcile.ok, 0);
  assert.strictEqual(r.reconcile.bad.length, 1);
  assert.strictEqual(r.reconcile.bad[0].villageId, 'emberhold');
});

ok('census: lottery pass/fail counted only on eligible days', function () {
  const j = fakeSeed({
    daily: [fakeDay(10, { linkTickRoll: 0.2, eligibleRaisers: 1 }),
      fakeDay(11, { linkTickRoll: 0.8, eligibleRaisers: 1 }),
      fakeDay(12, { linkTickRoll: 0.1, eligibleRaisers: 0 })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.census.eligibleRaiserDays, 2);
  assert.strictEqual(r.census.lotteryPassEligible, 1);
  assert.strictEqual(r.census.lotteryFailEligible, 1);
});

(async function () {
  await aok('live: instrument installs, snapshot shape complete, zero errors', async function () {
    const { Game } = await loadGame({ seed: 99101, mode: 'competent-secondlink-test', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const snap = inst.snapshot();
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'install errors: ' + JSON.stringify(inst.t.instrumentErrors));
    assert.ok(Array.isArray(snap.pendingRaises), 'pendingRaises array');
    assert.ok(Array.isArray(snap.raiseState), 'raiseState array');
    assert.ok(Array.isArray(snap.links), 'links array');
    assert.ok(Array.isArray(snap.villages), 'villages array');
    assert.ok(Array.isArray(snap.scholarLore), 'scholarLore array');
    assert.ok(Array.isArray(snap.raisers), 'raisers array');
    assert.strictEqual(typeof snap.eligibleRaisers, 'number', 'eligibleRaisers number');
    assert.strictEqual(typeof snap.linkTickRoll, 'number', 'linkTickRoll number (bondRoll readable)');
    assert.ok(snap.linkTickRoll >= 0 && snap.linkTickRoll < 1, 'linkTickRoll in [0,1)');
    assert.ok(snap.raisers.length > 0, 'roster non-empty');
    snap.raisers.forEach(function (rv) {
      assert.ok(Array.isArray(rv.gates), 'raiser gates array');
      assert.strictEqual(typeof rv.eligible, 'boolean', 'raiser eligible boolean');
      assert.strictEqual(rv.eligible, rv.gates.length === 0, 'eligible iff no gates');
    });
    inst.uninstall();
  });

  await aok('live: lazy tele wrap captures bond_proposed; wraps record + return originals', async function () {
    const { Game } = await loadGame({ seed: 99101, mode: 'competent-secondlink-test', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    inst.installTeleLazy();
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'tele install errors: ' + JSON.stringify(inst.t.instrumentErrors));
    Game.tele('bond_proposed', { initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null });
    assert.strictEqual(inst.t.bondEvents.length, 1, 'one bond event captured');
    assert.strictEqual(inst.t.bondEvents[0].kind, 'link');
    assert.strictEqual(inst.t.bondEvents[0].outcome, 'staged');
    Game.tele('death', { kind: 'villager', who: 'nobody', cause: 'test' });
    assert.strictEqual(inst.t.bondEvents.length, 1, 'non-bond tele ignored');
    // stageLinkRaise with a bogus village returns null and logs the call.
    const r1 = Game.stageLinkRaise('nobody', 'nowhere');
    assert.strictEqual(r1, null, 'bogus stage returns null');
    assert.strictEqual(inst.t.stageCalls.length, 1, 'stage call recorded');
    assert.strictEqual(inst.t.stageCalls[0].staged, false, 'bogus stage not staged');
    // proposeLink to an unknown village returns null, logs declined-null.
    const r2 = Game.proposeLink('nowhere-village');
    assert.strictEqual(r2, null, 'unknown propose returns null');
    assert.strictEqual(inst.t.proposeCalls.length, 1, 'propose call recorded');
    assert.strictEqual(inst.t.proposeCalls[0].outcome, 'declined-null');
    // Uninstall restores the wrapped methods (no double-wrap on reinstall).
    const teleBefore = Game.tele;
    inst.uninstall();
    assert.notStrictEqual(Game.tele, teleBefore, 'tele restored after uninstall');
    inst.uninstall();
    console.log('    (uninstall idempotent)');
  });

  await aok('live: determinism + neutrality miniature (12d, seed 99101, ON vs ON vs OFF)', async function () {
    async function shortRun(withInst) {
      const { Game } = await loadGame({ seed: 99101, mode: 'competent-secondlink-test', fullTelemetry: false });
      await setupGame(Game);
      const inst = withInst ? INST.install(Game) : null;
      let lastSnap = -1;
      const wrapped = Object.assign({}, competent, {
        daily: function (Gm, ctx) {
          try { return competent.daily(Gm, ctx); } finally {
            try {
              if (inst) inst.installTeleLazy();
              const d = ((Game.state || {}).scholar || {}).day || 0;
              if (inst && d !== lastSnap) { lastSnap = d; inst.snapshot(); }
            } catch (e) {}
          }
        },
      });
      let result = null;
      await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
      let standing = null;
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      const out = { days: result.days, standing: standing, bondEvents: inst ? inst.t.bondEvents.slice() : [], errors: inst ? inst.t.instrumentErrors.length : 0 };
      if (inst) inst.uninstall();
      return out;
    }
    const a = await shortRun(true);
    const b = await shortRun(true);
    const c = await shortRun(false);
    assert.strictEqual(a.errors, 0, 'ON run errors 0');
    assert.strictEqual(b.errors, 0, 'ON rerun errors 0');
    assert.deepStrictEqual(a.bondEvents, b.bondEvents, 'bond events deterministic across identical runs');
    assert.strictEqual(a.days, b.days, 'days deterministic');
    assert.strictEqual(a.standing, b.standing, 'standing deterministic');
    assert.strictEqual(a.days, c.days, 'ON vs OFF days identical (non-perturbation)');
    assert.strictEqual(a.standing, c.standing, 'ON vs OFF standing identical (non-perturbation)');
    console.log('    (12d: days=' + a.days + ' standing=' + a.standing + ' bondEvents=' + a.bondEvents.length + ')');
  });

  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
