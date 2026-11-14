// test-standing99107-b-20261114.js — proof test for the
// standing-accumulation decomposition instrument + analyzer (arm
// sim-standing99107-b). Fixture-based (decomposition math, per-type
// cap, link seasoning / regional+ classification, feast
// classification, release classification, blocked-day splits,
// delta attribution) plus one live harness smoke: a fresh loaded
// game snapshots with gate veteran count == instrument recount,
// capped == war+diplomacy+min(plenty,100), peak-stable snapshot,
// and a live wave-3 kill event captured. No repo writes.
// Usage: node scripts/test-standing99107-b-20261114.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'standing99107-analyze-20261114'));
const INST = require(path.join(__dirname, 'standing99107-instrument-20261114'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, scholarId: 'v_scholar', roster: ['v_scholar'],
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: ['veterans'] },
    readiness4: { ready: true },
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0 },
    capped: 0, peak: 0, deferral5: { deferred: false, ready: false }, deferral4: { deferred: false, ready: true },
    ledger: { 3: { points: 0, perType: {}, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } },
    links: [], feasts: [],
    ladder: { total: 0, counted: 0, stage: 0, stageName: 'Unranked', tracks: { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 }, countedTracks: { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 }, bundleBonus: 0 },
    w4faced: 0, w5faced: 0, w3rung: { met: true }, scaleRank: 'village',
    logW4: [], veteranVids: [], veteranVidsAll: [], veteranRecount: 0, veteranMismatch: false, livingCount: 1,
  }, over || {});
}
function seed(over) {
  return Object.assign({ seed: 1, run: 'fixture', days: 10, endReason: 'village-lost',
    won: false, maxWave: 4, scaleRank: 'village', endUnlockedWave: 4,
    peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
    daily: [], killEvents: [], feastEvents: [], deathEvents: [], standingLines: [], saySample: [],
    instrumentErrors: [] }, over || {});
}
function readySnap(day, capped, peak) {
  return snap(day, { readiness5: { ready: true, armored: 4, armed: 6, tricks: 3, veterans: 2, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: [] },
    standing: { total: capped, war: capped, diplomacy: 0, plenty: 0 }, capped: capped, peak: peak,
    ledger: { 3: { points: capped / 25, perType: {}, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } } });
}
function link(key, over) {
  return Object.assign({ key: key, kind: 'subordinate', status: 'active', day: 1, trust: 50, seasoned: false, regionalPlus: false, counts: false, tributePaidWeek: null }, over || {});
}

// --- breakdown math reconciles ---
ok('breakdown math: war/diplomacy/plenty/capped/total all reconcile', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 124, war: 50, diplomacy: 34, plenty: 40 }, capped: 124,
      ledger: { 3: { points: 2, perType: { a: 2 }, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } },
      links: [link('subordinate|haven|v2', { seasoned: true, regionalPlus: true, counts: true })],
      feasts: [{ day: 5, quality: 1, bundle: false, bundleStage: 0 }, { day: 6, quality: 1, bundle: false, bundleStage: 0 }] }),
  ] }));
  assert.deepStrictEqual(s.reconMismatches, []);
  assert.strictEqual(s.bestCapped, 124);
  assert.deepStrictEqual(s.bestSplit, { war: 50, diplomacy: 34, plenty: 40 });
});
ok('breakdown math flags a lying plenty count', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 40, war: 0, diplomacy: 0, plenty: 40 }, capped: 40, feasts: [{ day: 5, quality: 1, bundle: false, bundleStage: 0 }] }),
  ] }));
  assert.strictEqual(s.reconMismatches.length, 1);
  assert.ok(s.reconMismatches[0].bad.some(function (b) { return b.indexOf('plenty') === 0; }));
});

// --- per-type cap: third kill of one type pays 0 ---
ok('per-type cap: 3 kills of one type score 2 points, not 3', function () {
  const s = AN.summarizeSeed(seed({
    daily: [
      snap(10),
      snap(11, { standing: { total: 50, war: 50, diplomacy: 0, plenty: 0 }, capped: 50,
        ledger: { 3: { points: 2, perType: { deer: 2 }, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } } }),
    ],
    killEvents: [
      { day: 11, fn: 'recordWaveKill', mid: 'deer', wave: 3, by: 'v_a', via: 'wild', entryAdded: true },
      { day: 11, fn: 'recordWaveKill', mid: 'deer', wave: 3, by: 'v_a', via: 'wild', entryAdded: true },
      { day: 11, fn: 'recordWaveKill', mid: 'deer', wave: 3, by: 'v_a', via: 'wild', entryAdded: true },
    ],
  }));
  assert.deepStrictEqual(s.unclassifiedDeltas, [], 'ledger delta (2 pts) matches war delta (50); the capped-out third kill is not a mystery');
  assert.strictEqual(s.warKills, 3);
  assert.strictEqual(s.bestSplit.war, 50);
});

// --- link classification ---
ok('seasoned-but-not-regional+ link scores 0 diplomacy', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 0, war: 0, diplomacy: 0, plenty: 0 }, capped: 0,
      links: [link('subordinate|haven|v2', { seasoned: true, regionalPlus: false })] }),
  ] }));
  assert.deepStrictEqual(s.reconMismatches, []);
  assert.deepStrictEqual(s.diplomacyLinksSeasonedOnly, ['subordinate|haven|v2']);
  assert.strictEqual(s.diplomacyLinksEver.length, 0);
});
ok('seasoned regional+ link scores 34 and is dated', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { links: [link('subordinate|haven|v2', { seasoned: false, regionalPlus: false })] }),
    snap(40, { standing: { total: 34, war: 0, diplomacy: 34, plenty: 0 }, capped: 34,
      links: [link('subordinate|haven|v2', { seasoned: true, regionalPlus: true, counts: true })] }),
  ] }));
  assert.deepStrictEqual(s.reconMismatches, []);
  assert.deepStrictEqual(s.unclassifiedDeltas, []);
  assert.strictEqual(s.diplomacyFirstDay, 40);
  assert.strictEqual(s.diplomacyLinksEver.length, 1);
});

// --- feast classification ---
ok('quality-0 feast pays 0 plenty; quality-1 pays 20; bundle adds no plenty', function () {
  const s = AN.summarizeSeed(seed({
    daily: [
      snap(10),
      snap(11, { standing: { total: 20, war: 0, diplomacy: 0, plenty: 20 }, capped: 20,
        feasts: [{ day: 5, quality: 0, bundle: false, bundleStage: 0 }, { day: 11, quality: 1, bundle: false, bundleStage: 0 }] }),
      snap(12, { standing: { total: 20, war: 0, diplomacy: 0, plenty: 20 }, capped: 20,
        feasts: [{ day: 5, quality: 0, bundle: false, bundleStage: 0 }, { day: 11, quality: 1, bundle: false, bundleStage: 0 }, { day: 12, quality: 0, bundle: true, bundleStage: 1 }] }),
    ],
    feastEvents: [
      { day: 11, quality: 1, bundle: false, bundleStage: 0, feastDay: 11, ok: true },
      { day: 12, quality: 0, bundle: true, bundleStage: 1, feastDay: 12, ok: true },
    ],
  }));
  assert.deepStrictEqual(s.reconMismatches, []);
  assert.deepStrictEqual(s.unclassifiedDeltas, []);
  assert.strictEqual(s.feastCount, 1);
  assert.strictEqual(s.bundleFeastCount, 1);
  assert.strictEqual(s.plentyFirstDay, 11);
});

// --- plenty cap bite ---
ok('plenty cap: raw 240 capped 200 is not a bite; raw 240 capped 180 is', function () {
  const noBite = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 240, war: 100, diplomacy: 0, plenty: 140 }, capped: 200,
      ledger: { 3: { points: 4, perType: {}, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } },
      feasts: [1, 2, 3, 4, 5, 6, 7].map(function (d) { return { day: d, quality: 1, bundle: false, bundleStage: 0 }; }) }),
  ] }));
  assert.strictEqual(noBite.plentyCapBiteDays, 0);
  assert.strictEqual(noBite.bestCapped, 200);
  const bite = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 240, war: 60, diplomacy: 0, plenty: 180 }, capped: 160,
      ledger: { 3: { points: 2, perType: {}, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } },
      feasts: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (d) { return { day: d, quality: 1, bundle: false, bundleStage: 0 }; }) }),
  ] }));
  // war 60 needs 2.4 ledger points — fixture is intentionally inconsistent
  // on war; the cap-bite count is what this case proves.
  assert.strictEqual(bite.plentyCapBiteDays, 1);
  assert.strictEqual(bite.capBiteFirstDay, 10);
});

// --- ready blocked splits + door classification ---
ok('ready + standing-short days vs ready + capped-ok days vs door open', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    readySnap(11, 150, 0),
    snap(12, { capped: 200, standing: { total: 200, war: 200, diplomacy: 0, plenty: 0 }, readiness5: { ready: false, armored: 4, armed: 6, tricks: 3, veterans: 0, short: ['veterans'] },
      ledger: { 3: { points: 8, perType: {}, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } } }),
    readySnap(13, 200, 5),
  ],
  standingLines: [{ day: 13, via: 'sysSay', line: '📡 RATINGS ARE UP... the Producers have greenlit the fifth draft. Wave 5 talent has been released.' }],
  }));
  assert.strictEqual(s.readyBlockedStandingDays, 1, 'day 11 ready but capped 150');
  assert.strictEqual(s.readyBlockedOtherDays, 0, 'day 13 ready and capped 200 with peak 5: released, not blocked');
  assert.strictEqual(s.standingOkNotReadyDays, 1);
  assert.deepStrictEqual(s.shortBarDays, { veterans: 1 });
  assert.strictEqual(s.bestCapped, 200);
  assert.strictEqual(s.doorOpenDay, 13);
  assert.deepStrictEqual(s.unclassifiedReleases, []);
});
ok('peak-to-5 without any release line is unclassified', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(10, { peak: 4 }), readySnap(11, 200, 5)], standingLines: [] }));
  assert.strictEqual(s.unclassifiedReleases.length, 1);
  assert.strictEqual(s.unclassifiedReleases[0].day, 11);
});

// --- veteran reconciliation ---
ok('veteran reconciles to kill log; dead killer is not a veteran', function () {
  const last = snap(20, { logW4: [{ d: 5, mid: 'suburb', w: 4, by: 'v_a', via: 'companion' }, { d: 6, mid: 'congregation', w: 4, by: 'v_b', via: 'player' }, { d: 7, mid: 'eater', w: 4, by: 'v_dead', via: 'wild' }],
    veteranVids: ['v_a', 'v_b'], veteranVidsAll: ['v_a', 'v_b', 'v_dead'], veteranRecount: 2 });
  const s = AN.summarizeSeed(seed({ daily: [snap(10), last] }));
  assert.deepStrictEqual(s.vetWithoutKill, []);
  assert.deepStrictEqual(s.killersNotVeterans, ['v_dead']);
  assert.strictEqual(s.logW4Count, 3);
});
ok('unclassified war delta (ledger moved, no kill) is flagged', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10),
    snap(11, { standing: { total: 25, war: 25, diplomacy: 0, plenty: 0 }, capped: 25,
      ledger: { 3: { points: 1, perType: { deer: 1 }, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } } }),
  ], killEvents: [] }));
  assert.strictEqual(s.unclassifiedDeltas.length, 1);
  assert.strictEqual(s.unclassifiedDeltas[0].kind, 'war-no-kill-event');
});
ok('kill stamped on prev.day (after that day\'s snapshot) explains the next-day delta', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10),
    snap(11, { standing: { total: 50, war: 50, diplomacy: 0, plenty: 0 }, capped: 50,
      ledger: { 3: { points: 2, perType: { gavel: 1, ad_break: 1 }, perTypeX: {} }, 4: { points: 0, perType: {}, perTypeX: {} }, 5: { points: 0, perType: {}, perTypeX: {} } } }),
  ], killEvents: [
    { day: 10, fn: 'recordWaveKill', mid: 'gavel', wave: 3, by: 'v_a', via: 'wild', entryAdded: true },
    { day: 10, fn: 'recordWaveKill', mid: 'ad_break', wave: 3, by: 'v_b', via: 'wild', entryAdded: true },
  ] }));
  assert.deepStrictEqual(s.unclassifiedDeltas, [], 'same-day-after-snapshot kills are valid explanations, not orphans');
});
ok('wave-2/3/4 RATINGS lines are not wave-5 releases', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(10, { peak: 4 })],
    standingLines: [
      { day: 8, via: 'sysSay', line: '📺 RATINGS ARE UP! The producers are pleased. New casting directives incoming — Wave 2 talent has been released into your sector.' },
      { day: 10, via: 'sysSay', line: '📡 RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft opens.' },
    ] }));
  assert.strictEqual(s.releaseLines.length, 0);
  assert.deepStrictEqual(s.unclassifiedReleases, []);
  assert.strictEqual(s.doorOpenDay, null);
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'standing99107-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const snap0 = inst.snapshot();
    assert.ok(snap0.readiness5 && typeof snap0.readiness5.ready === 'boolean', 'gate readiness5 present');
    assert.strictEqual(snap0.veteranRecount, (snap0.readiness5.veterans | 0), 'recount == gate veteran count on a fresh game');
    assert.ok(snap0.standing && typeof snap0.standing.total === 'number', 'standing breakdown present');
    assert.strictEqual(snap0.capped, ((snap0.standing.war | 0) + (snap0.standing.diplomacy | 0) + Math.min((snap0.standing.plenty | 0), 100)),
      'capped == war + diplomacy + min(plenty,100)');
    assert.ok(Number.isInteger(snap0.peak), 'peak is an integer');
    assert.ok(snap0.deferral5 && typeof snap0.deferral5.deferred === 'boolean', 'deferral5 present');
    assert.ok(snap0.ledger && snap0.ledger[3] && typeof snap0.ledger[3].points === 'number', 'per-wave ledger present');
    assert.ok(Array.isArray(snap0.links), 'per-link detail present');
    assert.ok(Array.isArray(snap0.feasts), 'feast log present');
    assert.ok(snap0.ladder && snap0.ladder.tracks && typeof snap0.ladder.tracks.fight === 'number', 'ladder tracks present');
    // Snapshot must NOT move the peak (read-only readers only).
    const peakBefore = snap0.peak;
    inst.snapshot();
    assert.strictEqual(inst.t.daily[1].peak, peakBefore, 'snapshot does not move the peak');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    // A live wave-3 kill lands in killEvents and in the ledger.
    const m3 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 3; });
    assert.ok(m3, 'a wave-3 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    const ptsBefore = Game.waveLedgerPoints ? Game.waveLedgerPoints(3) : null;
    Game.recordWaveKill(m3.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killEvents.length, 1, 'live kill event captured');
    assert.strictEqual(inst.t.killEvents[0].wave, 3);
    const snap1 = inst.snapshot();
    assert.ok((snap1.ledger[3].perType || {})[m3.id] >= 1 || (snap1.ledger[3].points | 0) > (ptsBefore | 0), 'kill scored into the wave-3 ledger');
    assert.ok(((snap1.standing.war | 0) - (snap0.standing.war | 0)) >= 0, 'war did not drop after a kill');
    // Feast wrap is installed and the feast log reads.
    assert.strictEqual(typeof Game.hostFeast, 'function', 'hostFeast wrapped and still a function');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: gate == recount, capped math, peak-stable snapshot, live w3 kill event, ledger/feast/ladder reads');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('STANDING99107-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('STANDING99107-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
