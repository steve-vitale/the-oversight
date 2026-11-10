// test-trustgrowth-b.js — proof test for the trust-growth + polity probe
// instrument + analyzer (arm sim-trustgrowth-b, run
// fleshout-loop-b-20261110T0122Z). Fixture-based (gain-cause
// classification from caller stacks, down-magnitude map, trajectory
// classes + precedence, delta reconciliation incl. unattributed residue
// and the trust-100 cap) plus two live harness legs: (1) a fresh loaded
// game installs the instrument with zero errors, the _trustGain wrap
// records and returns the original value, and uninstall restores it;
// (2) determinism: the same seed loads twice and yields identical
// day-0 trust snapshots.
// Usage: node scripts/test-trustgrowth-b.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'trustgrowth-analyze-20261109'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function stack(fnName) { return '    at Object.' + fnName + ' (/repo/src/js/hierarchy.js:1:1)'; }

ok('classifyGain: every known _trustGain caller maps to its cause', function () {
  assert.strictEqual(AN.classifyGain(stack('tendLink'), 8), 'tend');
  assert.strictEqual(AN.classifyGain(stack('linkTick'), 1), 'tribute-weekly');
  assert.strictEqual(AN.classifyGain(stack('linkTick'), 3), 'arrears-settle');
  assert.strictEqual(AN.classifyGain(stack('payTribute'), 3), 'paytribute-full');
  assert.strictEqual(AN.classifyGain(stack('forgiveArrears'), 6), 'arrears-forgive');
  assert.strictEqual(AN.classifyGain(stack('answerDemand'), 8), 'demand-honor');
  assert.strictEqual(AN.classifyGain(stack('proveWorth'), 4), 'prove-worth');
  assert.strictEqual(AN.classifyGain(stack('answerRenegotiation'), 5), 'renegotiation-answer');
  assert.strictEqual(AN.classifyGain(stack('answerNationalChoice'), 6), 'national-choice');
  assert.strictEqual(AN.classifyGain(stack('answerNationalChoice'), 12), 'oath');
  assert.strictEqual(AN.classifyGain(stack('answerAccord'), 10), 'accord-gift');
  assert.strictEqual(AN.classifyGain(stack('answerAccord'), 4), 'accord-word');
  assert.strictEqual(AN.classifyGain(stack('answerAccord'), 8), 'accord-visit');
  assert.strictEqual(AN.classifyGain('', 5), 'unattributed');
  assert.strictEqual(AN.classifyGain(stack('someNewVerb'), 5), 'other-named:someNewVerb');
});

ok('downMagnitude: history-note kinds map to code-grounded magnitudes', function () {
  assert.deepStrictEqual(AN.downMagnitude('tribute', 'X paid thin: 1,000 of 4,000 kcal. Arrears +3,000.'), { mag: 1, cause: 'tribute-thin' });
  assert.deepStrictEqual(AN.downMagnitude('tribute', 'X paid nothing — empty fields. Arrears +4,000.'), { mag: 2, cause: 'tribute-nothing' });
  assert.deepStrictEqual(AN.downMagnitude('tribute', 'X paid. The pantry grows.'), { mag: 0, cause: null });
  assert.deepStrictEqual(AN.downMagnitude('arrears', 'Tribute short 0/4,000 kcal. Arrears 4,000 kcal.'), { mag: 6, cause: 'arrears-short' });
  assert.deepStrictEqual(AN.downMagnitude('arrears', 'X back-paid 1,000 kcal. The old debt is settled (trust +3).'), { mag: 0, cause: null });
  assert.deepStrictEqual(AN.downMagnitude('sabotage', 'Tribute arrived light.'), { mag: 4, cause: 'sabotage' });
  assert.deepStrictEqual(AN.downMagnitude('succession', 'The speaker died.'), { mag: 8, cause: 'succession' });
  assert.deepStrictEqual(AN.downMagnitude('demand', 'REFUSED the call (aid).'), { mag: 15, cause: 'demand-refused' });
  assert.deepStrictEqual(AN.downMagnitude('drift', 'Trust crossed below the seasoned bar.'), { mag: 0, cause: null });
});

function flink(day, over) {
  return Object.assign({
    id: 'link_test', key: 'village_x|LEAD|haven>village_x|:', other: 'village_x',
    kind: 'LEAD', primary: 'haven', subordinate: 'village_x', a: null, b: null,
    age: day - 10, trust: 30, conquered: false, status: 'active',
    seasoned: false, seasonedPolity: false, regional: false, reason: 'too-young',
    arrears: 0, historyNew: [], historyLen: 0,
  }, over || {});
}
function fsnap(day, link) { return { day: day, links: [link], polity: { haven: null, lead: null, belong: null, covenant: null, trade: null }, pending: { counter: false, accord: false, national: false, global: false } }; }
function fout(daily, gains) {
  return { seed: 99104, run: 'fixture', days: 100, endReason: 'village-lost', won: false, villageLost: true, scaleRank: 'regional', maxWave: 4, unlockedWave: 4, standing: 199, daily: daily, gains: gains || [], trustSays: [], sayCount: 0, instrumentErrors: [] };
}

ok('classifyLink: seasoned beats rises; rises beats decays; holds is the remainder', function () {
  const seasoned = AN.classifyLink([
    { day: 10, link: flink(10, { trust: 30 }) },
    { day: 40, link: flink(40, { trust: 42, age: 30, seasoned: true, reason: 'not-regional' }) },
  ]);
  assert.strictEqual(seasoned.class, 'seasoned');
  assert.strictEqual(seasoned.seasonedEver, true);
  const rises = AN.classifyLink([
    { day: 10, link: flink(10, { trust: 30 }) },
    { day: 20, link: flink(20, { trust: 41 }) },
  ]);
  assert.strictEqual(rises.class, 'rises');
  const decays = AN.classifyLink([
    { day: 10, link: flink(10, { trust: 30 }) },
    { day: 60, link: flink(60, { trust: 19 }) },
  ]);
  assert.strictEqual(decays.class, 'decays');
  const holds = AN.classifyLink([
    { day: 10, link: flink(10, { trust: 30 }) },
    { day: 60, link: flink(60, { trust: 28 }) },
  ]);
  assert.strictEqual(holds.class, 'holds');
  const broke = AN.classifyLink([
    { day: 10, link: flink(10, { trust: 30 }) },
    { day: 50, link: flink(50, { trust: 12, status: 'broken' }) },
  ]);
  assert.strictEqual(broke.broke, true);
  assert.strictEqual(broke.brokeDay, 50);
  // end trust is the last ACTIVE trust (30): a break alone is not a decay.
  assert.strictEqual(broke.class, 'holds');
  assert.strictEqual(broke.end, 30);
  const decayThenBroke = AN.classifyLink([
    { day: 10, link: flink(10, { trust: 30 }) },
    { day: 40, link: flink(40, { trust: 19 }) },
    { day: 50, link: flink(50, { trust: 12, status: 'broken' }) },
  ]);
  assert.strictEqual(decayThenBroke.class, 'decays');
  assert.strictEqual(decayThenBroke.end, 19);
});

ok('reconcileLink: gains + history notes reconcile; residue is listed, not hidden', function () {
  const daily = [
    fsnap(10, flink(10, { trust: 30 })),
    fsnap(11, flink(11, { trust: 31 })), // +1 gain
    fsnap(12, flink(12, { trust: 30, historyNew: [{ day: 12, kind: 'tribute', note: 'X paid thin: 1,000 of 4,000 kcal.' }] })), // -1
    fsnap(13, flink(13, { trust: 31 })), // +1 gain
    fsnap(14, flink(14, { trust: 29, historyNew: [{ day: 14, kind: 'tribute', note: 'X paid nothing — empty fields.' }] })), // -2
    fsnap(15, flink(15, { trust: 27 })), // -2, no note: unattributed-down 2
    fsnap(16, flink(16, { trust: 30 })), // +3 with only +1 gain: unattributed-up 2
  ];
  const gains = [
    { day: 11, linkId: 'link_test', requested: 1, applied: 1, stack: stack('linkTick') },
    { day: 13, linkId: 'link_test', requested: 1, applied: 1, stack: stack('linkTick') },
    { day: 16, linkId: 'link_test', requested: 1, applied: 1, stack: stack('linkTick') },
  ];
  const r = AN.reconcileLink(fout(daily, gains), 'link_test');
  assert.strictEqual(r.reconciled, 4);
  assert.strictEqual(r.unattributedDown, 2);
  assert.strictEqual(r.unattributedUp, 2);
  assert.strictEqual(r.gainByCause['tribute-weekly'], 3);
  assert.strictEqual(r.downByCause['tribute-thin'], 1);
  assert.strictEqual(r.downByCause['tribute-nothing'], 2);
  assert.strictEqual(r.days.length, 6);
  assert.strictEqual(r.days[4].status, 'unattributed-down:2');
  assert.strictEqual(r.days[5].status, 'unattributed-up:2');
});

ok('reconcileLink: trust-100 cap explains a gains/delta gap as cap-100, not residue', function () {
  const daily = [
    fsnap(20, flink(20, { trust: 98 })),
    fsnap(21, flink(21, { trust: 100 })),
  ];
  const gains = [{ day: 21, linkId: 'link_test', requested: 8, applied: 8, stack: stack('tendLink') }];
  const r = AN.reconcileLink(fout(daily, gains), 'link_test');
  assert.strictEqual(r.reconciled, 0);
  assert.strictEqual(r.capAdjust, 6);
  assert.strictEqual(r.unattributedUp, 0);
  assert.strictEqual(r.unattributedDown, 0);
  assert.strictEqual(r.days[0].status, 'cap-100');
});

ok('polityBlocking: no-links / never-seasoned / seasoned-but-no-polity / polity-formed', function () {
  const noLinks = AN.polityBlocking(fout([fsnap(10, flink(10, { trust: 30, id: 'link_nope' }))], []));
  // fixture has one link, so this is never-seasoned, not no-links:
  assert.strictEqual(noLinks.reason, 'never-seasoned');
  const empty = AN.polityBlocking({ daily: [Object.assign(fsnap(10, flink(10)), { links: [] })], gains: [] });
  assert.strictEqual(empty.reason, 'no-links');
  const seasoned = AN.polityBlocking(fout([
    fsnap(10, flink(10, { trust: 30 })),
    fsnap(40, flink(40, { trust: 42, age: 30, seasoned: true, reason: 'not-regional' })),
  ], []));
  assert.strictEqual(seasoned.reason, 'seasoned-but-no-polity');
  assert.strictEqual(seasoned.seasonedCount, 1);
  const formed = AN.polityBlocking(fout([
    fsnap(40, flink(40, { trust: 42, age: 30, seasoned: true, polity: undefined })),
  ], []));
  // polity lives on the snapshot, not the link: rebuild with haven polity set
  const withPolity = fout([Object.assign(fsnap(40, flink(40, { trust: 42, age: 30, seasoned: true })), { polity: { haven: { shape: 'lead', size: 4 }, lead: { shape: 'lead', size: 4 }, belong: null, covenant: null, trade: null } })], []);
  assert.strictEqual(AN.polityBlocking(withPolity).reason, 'polity-formed');
  assert.strictEqual(AN.polityBlocking(withPolity).polityFirstDay, 40);
  assert.strictEqual(formed.reason, 'seasoned-but-no-polity'); // no polity on any snapshot
});

ok('summarizeSeed: tend calls, blocked gains, pending days counted', function () {
  const s = AN.summarizeSeed(fout([
    fsnap(10, flink(10, { trust: 30 })),
    fsnap(11, flink(11, { trust: 38, historyNew: [{ day: 11, kind: 'tended', note: 'Haven sent grain (1,500 kcal, trust +8); the bond is fed.' }] })),
  ], [
    { day: 11, linkId: 'link_test', requested: 8, applied: 8, stack: stack('tendLink') },
    { day: 11, linkId: 'link_test', requested: 8, applied: 0, stack: stack('tendLink') }, // mourning-blocked
  ]));
  assert.strictEqual(s.tendCalls, 1);
  assert.strictEqual(s.blockedGains, 1);
  assert.deepStrictEqual(s.blockedGainCauses, ['tend']);
  assert.strictEqual(s.links.length, 1);
  assert.strictEqual(s.links[0].class, 'holds'); // peak 38 < born+10 (40)
});

(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const INST = require(path.join(__dirname, 'trustgrowth-instrument-20261109'));
  const { Game } = await loadGame({ seed: 99104, mode: 'trustgrowth-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  assert.strictEqual(inst.gainWrapped, true, 'trustGain wrap installed');
  const s0 = inst.snapshot();
  assert.strictEqual(inst.t.instrumentErrors.length, 0, '0 instrument errors on smoke');
  assert.ok(Array.isArray(s0.links), 'link roll is an array');
  assert.ok(s0.polity && 'haven' in s0.polity && 'lead' in s0.polity, 'polity roads snapshotted');
  // The wrap records and returns the original value.
  const probe = { id: 'probe-link', trust: 30, status: 'active' };
  const applied = Game._trustGain(probe, 5);
  assert.strictEqual(applied, 5, 'wrap returns the original gain');
  assert.strictEqual(probe.trust, 35, 'wrap applies the gain');
  assert.strictEqual(inst.t.gains.length, 1, 'one gain logged');
  assert.strictEqual(AN.classifyGain(inst.t.gains[0].stack, 5), 'unattributed', 'test-file caller is unattributed, not mislabeled');
  inst.uninstall();
  Game._trustGain({ id: 'probe-link-2', trust: 30 }, 5);
  assert.strictEqual(inst.t.gains.length, 1, 'no logging after uninstall');
  pass++; console.log('ok ' + pass + ' - live harness smoke: wrap records/returns/restores, 0 instrument errors');
  // Determinism leg: same seed loads twice, identical day-0 trust snapshot.
  const { Game: Game2 } = await loadGame({ seed: 99104, mode: 'trustgrowth-proof', fullTelemetry: false });
  await setupGame(Game2);
  const inst2 = INST.install(Game2);
  const s0b = inst2.snapshot();
  assert.deepStrictEqual(
    { gated: s0b.gated, standing: s0b.standing, links: s0b.links, polity: s0b.polity },
    { gated: s0.gated, standing: s0.standing, links: s0.links, polity: s0.polity },
    'same seed, same day-0 trust snapshot');
  pass++; console.log('ok ' + pass + ' - determinism leg: same seed reproduces day-0 trust snapshot');
  inst2.uninstall();
  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
