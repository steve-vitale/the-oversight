// test-linkseek-20261106.js — proof test for the link-seeking probe
// (arm sim-linkseek-b). Fixture tests (pickTarget perception gate,
// classification rules, link-event derivation) plus live harness
// legs: (1) instrument snapshot carries the knowledge roll with
// zero instrument errors on a fresh loaded game; (2) determinism —
// the same seed run twice under linkseek yields identical days /
// endReason / standing; (3) baseline pin — competent.daily makes
// ZERO proposeLink calls in a 30-day live run (the never-asked
// claim, pinned in code, not assumed).
// Usage: node scripts/test-linkseek-20261106.js
'use strict';
const path = require('path');
const assert = require('assert');
const { linkseek, pickTarget } = require(path.join(__dirname, 'policies', 'linkseek'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const INST = require(path.join(__dirname, 'linkseek-instrument-20261106'));
const AN = require(path.join(__dirname, 'linkseek-analyze-20261106'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
async function okAsync(name, fn) { await fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function fakeGame(villages, opts) {
  opts = opts || {};
  return {
    state: { otherVillages: villages, scholar: { day: 30 }, village: { pantry: [], roster: ['a', 'b', 'c', 'd', 'e'] } },
    map: { px: 4, py: 4 },
    knowsVillage: function (v) { return !!v._known; },
    linkWith: function (id) { return (opts.linked || []).indexOf(id) >= 0; },
  };
}

ok('pickTarget: nearest known unlinked village wins', function () {
  const g = fakeGame([
    { id: 'v1', x: 0, y: 4, _known: true },
    { id: 'v2', x: 4, y: 5, _known: true },
    { id: 'v3', x: 8, y: 8, _known: true },
  ]);
  assert.strictEqual(pickTarget(g).id, 'v2');
});

ok('pickTarget: unknown villages are never candidates (perception gate)', function () {
  const g = fakeGame([
    { id: 'v1', x: 4, y: 5, _known: false },
    { id: 'v2', x: 0, y: 0, _known: false },
  ]);
  assert.strictEqual(pickTarget(g), null);
});

ok('pickTarget: linked villages are skipped; null when all linked', function () {
  const g = fakeGame([
    { id: 'v1', x: 4, y: 5, _known: true },
  ], { linked: ['v1'] });
  assert.strictEqual(pickTarget(g), null);
});

ok('pickTarget: null when no villages exist', function () {
  assert.strictEqual(pickTarget(fakeGame([])), null);
});

ok('classifyBaseline: never-met at zero known, never-accepted at >=1 known', function () {
  assert.strictEqual(AN.classifyBaseline({ maxKnown: 0 }), 'never-met');
  assert.strictEqual(AN.classifyBaseline({ maxKnown: 3 }), 'never-accepted');
});

ok('classifyArmed: seasoned-link / knowledge / acceptance / seasoning splits', function () {
  assert.strictEqual(AN.classifyArmed({ seasoned: 1, peakDiplo: 34, maxKnown: 2, proposes: 2, formed: 1 }), 'seasoned-link');
  assert.strictEqual(AN.classifyArmed({ seasoned: 0, peakDiplo: 0, maxKnown: 0, proposes: 0, formed: 0 }), 'knowledge-blocked');
  assert.strictEqual(AN.classifyArmed({ seasoned: 0, peakDiplo: 0, maxKnown: 2, proposes: 3, formed: 0 }), 'acceptance-blocked');
  assert.strictEqual(AN.classifyArmed({ seasoned: 0, peakDiplo: 0, maxKnown: 2, proposes: 2, formed: 2 }), 'seasoning-blocked');
  assert.strictEqual(AN.classifyArmed({ seasoned: 1, peakDiplo: 0, maxKnown: 2, proposes: 2, formed: 1 }), 'seasoned-no-diplo');
  assert.strictEqual(AN.classifyArmed({ seasoned: 0, peakDiplo: 0, maxKnown: 2, proposes: 0, formed: 0 }), 'no-proposal-despite-known');
});

ok('linkEvents: formed then seasoned then dissolved derive from transitions', function () {
  const daily = [
    { day: 10, links: [] },
    { day: 11, links: [{ key: 'a|x', other: 'A', trust: 30, seasoned: false }] },
    { day: 45, links: [{ key: 'a|x', other: 'A', trust: 44, seasoned: true }] },
    { day: 46, links: [] },
  ];
  const le = AN.linkEvents(daily);
  assert.deepStrictEqual(le.events.map(function (e) { return e.kind; }), ['formed', 'seasoned', 'dissolved-or-inactive']);
  assert.strictEqual(le.events[1].day, 45);
});

(async function () {
  await okAsync('live: instrument snapshot carries knowledge roll, zero errors', async function () {
    const { Game } = await loadGame({ seed: 56001, mode: 'competent-linkseek', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const snap = inst.snapshot();
    assert.ok(snap.knowledge, 'knowledge roll present');
    assert.ok(Array.isArray(snap.knowledge.villages), 'villages array');
    assert.strictEqual(typeof snap.knowledge.knownCount, 'number');
    assert.ok(snap.standing && typeof snap.standing.total === 'number', 'standing breakdown present');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'zero instrument errors: ' + inst.t.instrumentErrors.join('; '));
    inst.uninstall();
  });

  await okAsync('live: linkseek runs 10 days without instrument errors', async function () {
    const { Game } = await loadGame({ seed: 56001, mode: 'competent-linkseek', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    let lastDay = -1;
    const wrapped = Object.assign({}, linkseek, {
      daily: function (Gm, ctx) {
        try { return linkseek.daily(Gm, ctx); } finally {
          const d = ((Game.state || {}).scholar || {}).day || 0;
          if (d !== lastDay) { lastDay = d; inst.snapshot(); }
        }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 10, manifest: undefined, sampleEvery: 30 }); });
    assert.ok(result && typeof result.days === 'number');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'zero instrument errors: ' + inst.t.instrumentErrors.join('; '));
    assert.ok(inst.t.daily.length >= 2, 'snapshots taken');
    inst.uninstall();
  });

  await okAsync('live: determinism — same seed twice under linkseek is identical', async function () {
    async function shortRun() {
      const { Game } = await loadGame({ seed: 56002, mode: 'competent-linkseek', fullTelemetry: false });
      await setupGame(Game);
      let result = null;
      await quietLog(async function () { result = await runDays(Game, linkseek, { days: 15, manifest: undefined, sampleEvery: 30 }); });
      let standing = null;
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      return { days: result.days, endReason: result.endReason, standing: standing, maxWave: result.maxWaveUnlocked };
    }
    const a = await shortRun();
    const b = await shortRun();
    assert.deepStrictEqual(a, b);
  });

  await okAsync('live: baseline pin — competent makes ZERO proposeLink calls in 30 days', async function () {
    const { Game } = await loadGame({ seed: 56001, mode: 'competent-linkseek', fullTelemetry: false });
    let calls = 0;
    const orig = Game.proposeLink;
    if (typeof orig === 'function') {
      Game.proposeLink = function () { calls++; return orig.apply(this, arguments); };
    }
    await setupGame(Game);
    await quietLog(async function () { await runDays(Game, competent, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    assert.strictEqual(calls, 0, 'competent proposed ' + calls + ' time(s)');
  });

  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
