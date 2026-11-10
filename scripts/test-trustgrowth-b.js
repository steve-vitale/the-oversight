// test-trustgrowth-b.js — proof test for the trust-growth + polity probe
// instrument + analyzer, v2 (arm sim-trustgrowth-b, run
// fleshout-loop-b-20261110T0122Z). Fixture-based (event-cause
// classification from caller stacks incl. the direct writers found by
// the v1 pilot — comms/safetynets/titans — down-magnitude fallback,
// trajectory classes + precedence, seq-interval reconciliation incl.
// wrap/setter dedupe and unattributed residue) plus live harness legs:
// (1) a fresh loaded game installs the instrument with zero errors,
// the trust setter logs a direct write with its caller, the _trustGain
// wrap records and returns the original value, and unifyEvents dedupes
// the wrap/setter pair into one event; (2) determinism: the same seed
// loads twice and yields identical day-0 trust snapshots.
// Usage: node scripts/test-trustgrowth-b.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'trustgrowth-analyze-20261109'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function stack(fnName) { return '    at Object.' + fnName + ' (/repo/src/js/hierarchy.js:1:1)'; }

ok('classifyEvent: choke callers map to their causes', function () {
  assert.strictEqual(AN.classifyEvent(stack('tendLink'), 8), 'tend');
  assert.strictEqual(AN.classifyEvent(stack('linkTick'), 1), 'tribute-weekly');
  assert.strictEqual(AN.classifyEvent(stack('linkTick'), 3), 'arrears-settle');
  assert.strictEqual(AN.classifyEvent(stack('linkTick'), -1), 'tribute-thin');
  assert.strictEqual(AN.classifyEvent(stack('linkTick'), -2), 'tribute-nothing');
  assert.strictEqual(AN.classifyEvent(stack('linkTick'), -6), 'arrears-short');
  assert.strictEqual(AN.classifyEvent(stack('linkTick'), -4), 'sabotage');
  assert.strictEqual(AN.classifyEvent(stack('payTribute'), 3), 'paytribute-full');
  assert.strictEqual(AN.classifyEvent(stack('forgiveArrears'), 6), 'arrears-forgive');
  assert.strictEqual(AN.classifyEvent(stack('answerDemand'), 8), 'demand-honor');
  assert.strictEqual(AN.classifyEvent(stack('answerDemand'), -15), 'demand-refused');
  assert.strictEqual(AN.classifyEvent(stack('proveWorth'), 4), 'prove-worth');
  assert.strictEqual(AN.classifyEvent(stack('answerRenegotiation'), 5), 'renegotiation-answer');
  assert.strictEqual(AN.classifyEvent(stack('_resolveRenegotiation'), -6), 'renegotiation-silence');
  assert.strictEqual(AN.classifyEvent(stack('answerNationalChoice'), 6), 'national-choice');
  assert.strictEqual(AN.classifyEvent(stack('answerNationalChoice'), 12), 'oath');
  assert.strictEqual(AN.classifyEvent(stack('answerAccord'), 10), 'accord-gift');
  assert.strictEqual(AN.classifyEvent(stack('answerAccord'), 4), 'accord-word');
  assert.strictEqual(AN.classifyEvent(stack('answerAccord'), 8), 'accord-visit');
  assert.strictEqual(AN.classifyEvent(stack('successionCrisis'), -8), 'succession-haircut');
  assert.strictEqual(AN.classifyEvent(stack('theirLeaderDied'), -8), 'their-speaker-died');
});

ok('classifyEvent: direct writers (v1 pilot find) map to their causes', function () {
  assert.strictEqual(AN.classifyEvent(stack('aidAskVillage'), 3), 'aid-accept');
  assert.strictEqual(AN.classifyEvent(stack('aidHelpArrived'), 2), 'aid-arrived');
  assert.strictEqual(AN.classifyEvent(stack('repayAidDebt'), 3), 'aid-debt-repaid');
  assert.strictEqual(AN.classifyEvent(stack('answerAidOffer'), 4), 'aid-offer-accept');
  assert.strictEqual(AN.classifyEvent(stack('answerAidOffer'), -3), 'aid-offer-refuse');
  assert.strictEqual(AN.classifyEvent(stack('answerAidBeg'), 4), 'aid-beg-give');
  assert.strictEqual(AN.classifyEvent(stack('answerAidBeg'), -2), 'aid-beg-short');
  assert.strictEqual(AN.classifyEvent(stack('answerAidBeg'), -10), 'aid-beg-refuse');
  assert.strictEqual(AN.classifyEvent(stack('resolveAidOut'), 3), 'aid-out-accept');
  assert.strictEqual(AN.classifyEvent(stack('resolveAidOut'), -2), 'aid-out-refused');
  assert.strictEqual(AN.classifyEvent('    at Object.titanNormalizeMuster (/repo/src/js/titans.js:646:1)', -8), 'titan-event');
  assert.strictEqual(AN.classifyEvent('', 5), 'unattributed');
  assert.strictEqual(AN.classifyEvent(stack('someNewVerb'), 5), 'other-named:someNewVerb');
});

ok('downMagnitude: history-note fallback is text-sensitive, not kind-fixed', function () {
  assert.deepStrictEqual(AN.downMagnitude('tribute', 'X paid thin: 1,000 of 4,000 kcal.'), { mag: 1, cause: 'tribute-thin' });
  assert.deepStrictEqual(AN.downMagnitude('tribute', 'X paid nothing — empty fields.'), { mag: 2, cause: 'tribute-nothing' });
  assert.deepStrictEqual(AN.downMagnitude('tribute', 'X paid. The pantry grows.'), { mag: 0, cause: null });
  assert.deepStrictEqual(AN.downMagnitude('arrears', 'Tribute short 0/4,000 kcal. Arrears 4,000 kcal.'), { mag: 6, cause: 'arrears-short' });
  // succession: the -8 haircut note vs the zero-move grief note.
  assert.deepStrictEqual(AN.downMagnitude('succession', 'Young link: grief delays the verdict — a renegotiation is staged.'), { mag: 8, cause: 'succession-haircut' });
  assert.deepStrictEqual(AN.downMagnitude('succession', 'Another death while the link already grieves — the grief is priced in.'), { mag: 0, cause: null });
  assert.deepStrictEqual(AN.downMagnitude('renegotiation', 'Seven days of silence answered for Haven (trust -6).'), { mag: 6, cause: 'renegotiation-silence' });
  assert.deepStrictEqual(AN.downMagnitude('titan', 'THE HERALD struck Emberhold in the night — trust −5; they notice.'), { mag: 5, cause: 'titan-event' });
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
function fsnap(day, link, seq) { return { day: day, seq: (seq != null ? seq : day), links: [link], polity: { haven: null, lead: null, belong: null, covenant: null, trade: null }, pending: { counter: false, accord: false, national: false, global: false } }; }
function fout(daily, events, gains) {
  return { seed: 99104, run: 'fixture', days: 100, endReason: 'village-lost', won: false, villageLost: true, scaleRank: 'regional', maxWave: 4, unlockedWave: 4, standing: 199, daily: daily, events: events || [], gains: gains || [], trustSays: [], sayCount: 0, instrumentErrors: [] };
}
function ev(seq, day, delta, fnName, via) {
  return { seq: seq, day: day, linkId: 'link_test', other: 'village_x', old: 0, new: delta, delta: delta, stack: stack(fnName), via: via || 'setter' };
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
});

ok('unifyEvents: wrap/setter twins dedupe to one event; gap wrap kept', function () {
  const out = fout([], [
    ev(1, 11, 1, 'linkTick'),
  ], [
    { seq: 2, day: 11, linkId: 'link_test', requested: 1, applied: 1, stack: '    at Object.linkTick (/repo/src/js/hierarchy.js:1346:26) |     at Object.trustGrowthTrustGain (x)', via: 'trustgain-wrap' },
    { seq: 3, day: 12, linkId: 'link_test', requested: 1, applied: 1, stack: stack('linkTick'), via: 'trustgain-wrap' },
  ]);
  // The setter event's stack must contain a _trustGain frame to twin with the wrap.
  out.events[0].stack = '    at Object.trustGrowthTrustGain (/repo/scripts/x:1:1) |     at Object.linkTick (/repo/src/js/hierarchy.js:1465:13)';
  const u = AN.unifyEvents(out);
  assert.strictEqual(u.length, 2, 'one setter event + one gap wrap event');
  assert.strictEqual(u.filter(function (e) { return e.via === 'setter'; }).length, 1);
  assert.strictEqual(u.filter(function (e) { return e.via === 'trustgain-wrap'; }).length, 1);
  assert.strictEqual(u[1].day, 12, 'the kept wrap is the gap one (d12)');
});

ok('reconcileLink: seq intervals attribute settlement gains to the next snapshot', function () {
  // Snapshots d21 (seq 0) and d22 (seq 1): the +1 was logged under day 21
  // (settlement) but lands in the d22 snapshot — the v1 day-match missed it.
  const daily = [
    fsnap(21, flink(21, { trust: 30 }), 0),
    fsnap(22, flink(22, { trust: 31 }), 1),
    fsnap(23, flink(23, { trust: 35 }), 5), // +4 aid, seq 2..5 (two writes? one +4 event seq 2)
    fsnap(24, flink(24, { trust: 29 }), 6), // -6 renegotiation-silence, seq 6
    fsnap(25, flink(25, { trust: 27 }), 7), // -2, no event: unattributed-down 2
  ];
  const events = [
    ev(1, 21, 1, 'linkTick'),
    ev(2, 23, 4, 'answerAidBeg'),
    ev(6, 24, -6, '_resolveRenegotiation'),
  ];
  const r = AN.reconcileLink(fout(daily, events), 'link_test');
  assert.strictEqual(r.reconciled, 3);
  assert.strictEqual(r.unattributedDown, 2);
  assert.strictEqual(r.unattributedUp, 0);
  assert.strictEqual(r.gainByCause['tribute-weekly'], 1);
  assert.strictEqual(r.gainByCause['aid-beg-give'], 4);
  assert.strictEqual(r.downByCause['renegotiation-silence'], 6);
  assert.strictEqual(r.days[0].status, 'reconciled');
  assert.strictEqual(r.days[3].status, 'unattributed-down:2');
});

ok('polityBlocking: no-links / never-seasoned / seasoned-but-no-polity / polity-formed', function () {
  const noLinks = AN.polityBlocking(fout([fsnap(10, flink(10, { trust: 30, id: 'link_nope' }))], []));
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
  const withPolity = fout([Object.assign(fsnap(40, flink(40, { trust: 42, age: 30, seasoned: true })), { polity: { haven: { shape: 'lead', size: 4 }, lead: { shape: 'lead', size: 4 }, belong: null, covenant: null, trade: null } })], []);
  assert.strictEqual(AN.polityBlocking(withPolity).reason, 'polity-formed');
  assert.strictEqual(AN.polityBlocking(withPolity).polityFirstDay, 40);
  assert.strictEqual(formed.reason, 'seasoned-but-no-polity');
});

ok('summarizeSeed: tend calls, blocked gains, pending days counted', function () {
  const s = AN.summarizeSeed(fout([
    fsnap(10, flink(10, { trust: 30 }), 0),
    fsnap(11, flink(11, { trust: 38, historyNew: [{ day: 11, kind: 'tended', note: 'Haven sent grain (1,500 kcal, trust +8); the bond is fed.' }] }), 1),
  ], [
    ev(1, 11, 8, 'tendLink'),
  ], [
    { seq: 2, day: 11, linkId: 'link_test', requested: 8, applied: 0, stack: stack('tendLink'), via: 'trustgain-wrap' },
  ]));
  assert.strictEqual(s.tendCalls, 1);
  assert.strictEqual(s.blockedGains, 1);
  assert.deepStrictEqual(s.blockedGainCauses, ['tend']);
  assert.strictEqual(s.links.length, 1);
  assert.strictEqual(s.links[0].class, 'holds'); // peak 38 < born+10 (40)
  assert.strictEqual(s.totalEvents, 1, 'the blocked wrap (applied 0) is dropped from the event log and counted as blockedGains instead');
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
  // The setter logs a DIRECT write with its caller (test file = unattributed).
  // instrumentLink is exposed on the installed instrument for this leg.
  const probe = { id: 'probe-link', trust: 30, status: 'active', primary: 'haven', subordinate: 'village_0', day: 0, history: [] };
  inst.instrumentLink(probe);
  inst.instrumentLink(probe); // idempotent: a second install must not double-log
  const evBefore = inst.t.events.length;
  probe.trust = 35;
  assert.strictEqual(inst.t.events.length, evBefore + 1, 'setter logged the direct write once');
  const logged = inst.t.events[inst.t.events.length - 1];
  assert.strictEqual(logged.delta, 5, 'direct write logged as +5');
  assert.strictEqual(logged.via, 'setter');
  assert.strictEqual(AN.classifyEvent(logged.stack, 5), 'unattributed', 'test-file caller is unattributed, not mislabeled');
  probe.trust = 35; // no change: no event
  assert.strictEqual(inst.t.events.length, evBefore + 1, 'a no-change write logs nothing');
  // The wrap records and returns the original value (plain object, no setter).
  const probe2 = { id: 'probe-link-2', trust: 30, status: 'active' };
  const applied = Game._trustGain(probe2, 5);
  assert.strictEqual(applied, 5, 'wrap returns the original gain');
  assert.strictEqual(probe2.trust, 35, 'wrap applies the gain');
  assert.ok(inst.t.gains.length >= 1, 'wrap logged the gain');
  inst.uninstall();
  const gainsBefore = inst.t.gains.length;
  Game._trustGain({ id: 'probe-link-3', trust: 30 }, 5);
  assert.strictEqual(inst.t.gains.length, gainsBefore, 'no wrap logging after uninstall');
  pass++; console.log('ok ' + pass + ' - live harness smoke: setter logs direct writes, wrap records/returns/restores, 0 instrument errors');
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
