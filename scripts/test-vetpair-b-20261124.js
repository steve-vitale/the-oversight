// test-vetpair-b-20261124.js — proof test for the veterans-alive-together
// census analyzer + driver (arm sim-vetpair-b). Fixture-based
// (109314-shape pair case, overlap windows, same-day death,
// alive-at-end, departed, unclassified, cause groups, orphan rows,
// veteran mismatches, duplicate deaths, standard median) plus one
// live harness smoke: a fresh loaded game with a live wave-4 kill
// and a live registerDeath capture, analyzed end to end. No repo
// writes. The determinism replay leg (bar 3) runs as a separate
// driver step, not in this proof test — a 150-day seed is too slow
// for a check script.
// Usage: node scripts/test-vetpair-b-20261124.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'vetpair-b-analyze-20261124'));
const INST = require(path.join(__dirname, 'standing-gearready-b-instrument-20261124'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, roster: ['omar_farouk', 'visjoin_136', 'tashi_sherpa'],
    veteranVids: [], veteranRecount: 0, veteranMismatch: false,
    logW4: [], w4faced: 0, w5faced: 0,
  }, over || {});
}
function seed(over) {
  return Object.assign({ seed: 109314, run: 'fixture', days: 150, gameDays: 150,
    endReason: 'survived', won: false, scaleRank: 'regional', maxWave: 5,
    endUnlockedWave: 5, peakBeforeEndCall: 5, peakAfterEndCall: 5, endCallMovedPeak: false,
    endState: { scholarId: 'gen_x', roster: ['omar_farouk', 'visjoin_136', 'tashi_sherpa'], exiles: [] },
    daily: [], killEvents: [], deathEvents: [], instrumentErrors: [] }, over || {});
}
function kill(day, by, mid, wave, via) {
  return { day: day, fn: 'recordWaveKill', mid: mid, wave: wave, by: by, via: via || 'wild', entryAdded: true };
}
function death(day, who, cause, kind) {
  return { day: day, kind: kind || 'villager', who: who, cause: cause, player: false };
}

// --- the 109314 pair case, fixture form ---
ok('109314 shape: event overlap 2 days, snapshot overlap 0, both killers classified', function () {
  const daily = [];
  for (let d = 1; d <= 149; d++) {
    daily.push(snap(d, {
      veteranVids: d < 138 ? ['omar_farouk'] : ['visjoin_136'],
      veteranRecount: 1,
      logW4: d < 137
        ? [{ d: 88, mid: 'eater', w: 4, by: 'omar_farouk', via: 'wild' }]
        : [{ d: 88, mid: 'eater', w: 4, by: 'omar_farouk', via: 'wild' },
           { d: 137, mid: 'audit', w: 4, by: 'visjoin_136', via: 'aid-crisis' }],
    }));
  }
  const s = AN.summarizeSeed(seed({ daily: daily,
    killEvents: [kill(88, 'omar_farouk', 'eater', 4, 'wild'), kill(137, 'visjoin_136', 'audit', 4, 'aid-crisis')],
    deathEvents: [death(138, 'omar_farouk', 'the wild'), death(149, 'visjoin_136', 'monster')],
  }));
  assert.strictEqual(s.killerCount, 2);
  assert.deepStrictEqual(s.unclassifiedKillers, []);
  assert.deepStrictEqual(s.orphanLogRows, []);
  const omar = s.killers.find(function (k) { return k.vid === 'omar_farouk'; });
  const vis = s.killers.find(function (k) { return k.vid === 'visjoin_136'; });
  assert.strictEqual(omar.bloodDay, 88);
  assert.strictEqual(omar.deathDay, 138);
  assert.strictEqual(omar.causeRaw, 'the wild');
  assert.strictEqual(omar.causeGroup, 'wild');
  assert.strictEqual(omar.aliveAfter, 50);
  assert.strictEqual(omar.status, 'dead');
  assert.strictEqual(vis.bloodDay, 137);
  assert.strictEqual(vis.deathDay, 149);
  assert.strictEqual(vis.causeGroup, 'combat');
  assert.strictEqual(vis.aliveAfter, 12);
  // Event-level: omar alive [88,138], visjoin [137,149] -> overlap 137,138.
  assert.deepStrictEqual(s.overlapDaysEvent, [137, 138]);
  assert.deepStrictEqual(s.overlapWindowsEvent, [{ start: 137, end: 138, days: 2 }]);
  // Snapshot-level: daily veteranVids never holds 2 at once.
  assert.deepStrictEqual(s.overlapDaysSnap, []);
  assert.deepStrictEqual(s.overlapWindowsSnap, []);
  assert.strictEqual(s.maxLivingVeteransEvent, 2);
  assert.strictEqual(s.maxLivingVeteransSnap, 1);
  assert.deepStrictEqual(s.deathCauseSplit, { wild: 1, combat: 1 });
});

// --- overlap windows: gaps split, same-day death counts ---
ok('overlap windows split on gaps; same-day blooding+death still overlaps', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(30, { roster: ['a', 'b', 'c'], veteranVids: ['c'], veteranRecount: 1, logW4: [] })],
    killEvents: [kill(10, 'a', 'eater', 4), kill(12, 'b', 'audit', 4), kill(20, 'c', 'eater', 4)],
    deathEvents: [death(15, 'a', 'monster'), death(15, 'b', 'starvation'), death(25, 'c', 'the wild')],
    endState: { scholarId: 'gen_x', roster: ['a', 'b', 'c'], exiles: [] },
  }));
  // a [10,15], b [12,15] overlap 12-15; c [20,25] alone. One window, 4 days.
  assert.deepStrictEqual(s.overlapWindowsEvent, [{ start: 12, end: 15, days: 4 }]);
  assert.strictEqual(s.maxLivingVeteransEvent, 2);
  const b = s.killers.find(function (k) { return k.vid === 'b'; });
  assert.strictEqual(b.aliveAfter, 3);
  assert.strictEqual(b.causeGroup, 'starvation');
  const s2 = AN.summarizeSeed(seed({ daily: [snap(30, { roster: ['a', 'b'], veteranVids: ['b'], veteranRecount: 1, logW4: [] })],
    killEvents: [kill(10, 'a', 'eater', 4), kill(10, 'b', 'audit', 4)],
    deathEvents: [death(10, 'a', 'monster')],
    endState: { scholarId: 'gen_x', roster: ['a', 'b'], exiles: [] },
  }));
  const a2 = s2.killers.find(function (k) { return k.vid === 'a'; });
  assert.strictEqual(a2.aliveAfter, 0, 'blooded and died the same day');
  assert.deepStrictEqual(s2.overlapDaysEvent, [10], 'same-day pair still overlaps one day');
});

// --- terminal statuses: alive-at-end, departed, unclassified ---
ok('alive-at-end is censored, not a death; departed needs roster evidence', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(150, { roster: ['alive_one', 'gone_one'], veteranVids: ['alive_one'], veteranRecount: 1, logW4: [
    { d: 50, mid: 'eater', w: 4, by: 'alive_one', via: 'wild' },
    { d: 60, mid: 'audit', w: 4, by: 'gone_one', via: 'wild' },
  ] })],
    killEvents: [kill(50, 'alive_one', 'eater', 4), kill(60, 'gone_one', 'audit', 4)],
    deathEvents: [],
    endState: { scholarId: 'gen_x', roster: ['alive_one', 'gone_one'], exiles: [{ vid: 'gone_one', day: 70, how: 'exiled' }] },
  }));
  // gone_one IS still in the final roster here (fixture inconsistency
  // on purpose): roster presence + no death + not a veteran -> the
  // analyzer must call it unclassified, not guess departed.
  assert.deepStrictEqual(s.unclassifiedKillers, ['gone_one']);
  const alive = s.killers.find(function (k) { return k.vid === 'alive_one'; });
  assert.strictEqual(alive.status, 'alive-at-end');
  assert.strictEqual(alive.aliveAfter, null, 'censored, never averaged in as a death');
  const s2 = AN.summarizeSeed(seed({ daily: [snap(150, { roster: ['alive_one'], veteranVids: ['alive_one'], veteranRecount: 1, logW4: [
    { d: 50, mid: 'eater', w: 4, by: 'alive_one', via: 'wild' },
    { d: 60, mid: 'audit', w: 4, by: 'gone_one', via: 'wild' },
  ] })],
    killEvents: [kill(50, 'alive_one', 'eater', 4), kill(60, 'gone_one', 'audit', 4)],
    deathEvents: [],
    endState: { scholarId: 'gen_x', roster: ['alive_one'], exiles: [{ vid: 'gone_one', day: 70, how: 'exiled' }] },
  }));
  assert.deepStrictEqual(s2.unclassifiedKillers, []);
  const gone = s2.killers.find(function (k) { return k.vid === 'gone_one'; });
  assert.strictEqual(gone.status, 'departed');
  assert.deepStrictEqual(gone.departEvidence, { day: 70, how: 'exiled' });
});

// --- cause groups + monster teles never match killers ---
ok('cause groups frozen; unknown recorded cause is other, not unclassified; monster teles ignored', function () {
  assert.strictEqual(AN.causeGroup('villager combat'), 'combat');
  assert.strictEqual(AN.causeGroup('expedition'), 'expedition');
  assert.strictEqual(AN.causeGroup('the wild'), 'wild');
  assert.strictEqual(AN.causeGroup('sickness'), 'disease');
  assert.strictEqual(AN.causeGroup("a wound that wouldn't close"), 'disease');
  assert.strictEqual(AN.causeGroup('starvation'), 'starvation');
  assert.strictEqual(AN.causeGroup('thirst'), 'starvation');
  assert.strictEqual(AN.causeGroup('a stranger'), 'stranger');
  assert.strictEqual(AN.causeGroup('something brand new'), 'other');
  assert.strictEqual(AN.causeGroup(null), null);
  const s = AN.summarizeSeed(seed({ daily: [snap(30, { roster: ['a'], veteranVids: [], veteranRecount: 0, logW4: [{ d: 10, mid: 'eater', w: 4, by: 'a', via: 'wild' }] })],
    killEvents: [kill(10, 'a', 'eater', 4)],
    // A monster death tele whose who happens to equal a monster id is
    // not a killer death; the killer's own death has a novel cause.
    deathEvents: [
      { day: 12, kind: 'monster', who: 'eater', cause: 'villager combat', player: false },
      death(20, 'a', 'fell off a cliff'),
    ],
    endState: { scholarId: 'gen_x', roster: ['a'], exiles: [] },
  }));
  const a = s.killers.find(function (k) { return k.vid === 'a'; });
  assert.strictEqual(a.status, 'dead');
  assert.strictEqual(a.causeGroup, 'other');
  assert.strictEqual(a.causeRaw, 'fell off a cliff');
  assert.deepStrictEqual(s.unclassifiedKillers, []);
});

// --- orphans, mismatches, duplicate deaths ---
ok('orphan log rows, veteran mismatches, and duplicate deaths are reported', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { veteranMismatch: true }),
    snap(30, { roster: ['a', 'b'], veteranVids: ['a'], veteranRecount: 1, logW4: [
      { d: 10, mid: 'eater', w: 4, by: 'a', via: 'wild' },
      { d: 20, mid: 'audit', w: 4, by: 'b', via: 'wild' },
    ] }),
  ],
    killEvents: [kill(10, 'a', 'eater', 4)],
    deathEvents: [death(25, 'b', 'monster'), death(26, 'b', 'monster')],
    endState: { scholarId: 'gen_x', roster: ['a', 'b'], exiles: [] },
  }));
  assert.strictEqual(s.orphanLogRows.length, 1, 'log row for b has no kill event');
  assert.strictEqual(s.orphanLogRows[0].by, 'b');
  assert.deepStrictEqual(s.veteranMismatchDays, [10]);
  assert.strictEqual(s.duplicateDeaths.length, 1, 'second death record for b flagged, not double-counted');
  const b = s.killers.find(function (k) { return k.vid === 'b'; });
  assert.strictEqual(b.status, 'dead');
  assert.strictEqual(b.deathDay, 25, 'first record wins');
  assert.strictEqual(b.logOnly, true, 'killer known only from the log is still a killer');
});

// --- pooled stats: standard median, cause split, wall numbers ---
ok('pooled median is the standard median; wall numbers pool cleanly', function () {
  const mk = function (seedN, days, won, rank) {
    return seed({ seed: seedN, days: days, gameDays: days,
      endReason: days < 150 ? 'village-lost' : 'survived', won: won, scaleRank: rank,
      daily: [snap(days, { roster: [], veteranVids: [], logW4: [] })],
      killEvents: [], deathEvents: [] });
  };
  const all = AN.summarizeAll([mk(1, 65, false, 'village'), mk(2, 150, false, 'regional'),
    mk(3, 150, false, 'regional'), mk(4, 150, true, 'national')]);
  assert.strictEqual(all.medianSurvival, 150, 'sorted 65,150,150,150 -> (150+150)/2');
  assert.strictEqual(all.maxSurvival, 150);
  assert.strictEqual(all.wins, 1);
  assert.strictEqual(all.national, 1);
  assert.strictEqual(all.seeds, 4);
  const all2 = AN.summarizeAll([mk(1, 65, false, 'village'), mk(2, 74, false, 'village'),
    mk(3, 82, false, 'village'), mk(4, 116, false, 'village'), mk(5, 125, false, 'village'),
    mk(6, 139, false, 'village'), mk(7, 150, false, 'village'), mk(8, 150, false, 'village')]);
  assert.strictEqual(all2.medianSurvival, 120.5, 'standard median, not the upper-middle');
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 109314, mode: 'vetpair-b-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const snap0 = inst.snapshot();
    assert.ok(snap0.readiness5 && typeof snap0.readiness5.ready === 'boolean', 'gate readiness5 present');
    assert.strictEqual(snap0.veteranRecount, (snap0.readiness5.veterans | 0), 'recount == gate veteran count on a fresh game');
    // A live wave-4 kill for a roster villager lands in killEvents,
    // the log, and the analyzer's killer list as alive-at-end.
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killEvents.length, 1, 'live wave-4 kill event captured');
    assert.strictEqual(inst.t.killEvents[0].wave, 4);
    const snap1 = inst.snapshot();
    assert.ok(snap1.veteranVids.indexOf(vid) >= 0, 'killer is a living veteran in the snapshot recount');
    // A live registerDeath capture: the killer's death tele lands in
    // deathEvents with its cause, and the analyzer classifies it.
    assert.strictEqual(typeof Game.registerDeath, 'function', 'registerDeath present');
    Game.registerDeath({ villagerId: vid, kind: 'villager', cause: 'monster', name: 'Smoke Villager' });
    assert.ok(inst.t.deathEvents.some(function (e) { return String(e.who) === String(vid) && e.cause === 'monster'; }),
      'live death tele captured with cause');
    const live = AN.summarizeSeed({ seed: 109314, run: 'smoke', days: 1, gameDays: 1,
      endReason: 'smoke', won: false, scaleRank: 'village', maxWave: 4, endUnlockedWave: 4,
      peakBeforeEndCall: snap0.peak, peakAfterEndCall: snap0.peak, endCallMovedPeak: false,
      endState: { scholarId: Game.villagerId, roster: roster.filter(function (id) { return id !== vid; }), exiles: [] },
      daily: inst.t.daily, killEvents: inst.t.killEvents, feastEvents: inst.t.feastEvents,
      deathEvents: inst.t.deathEvents, standingLines: inst.t.standingLines,
      releaseLines: inst.t.releaseLines, saySample: inst.t.saySample, instrumentErrors: inst.t.instrumentErrors });
    assert.strictEqual(live.killerCount, 1);
    assert.deepStrictEqual(live.unclassifiedKillers, []);
    const k = live.killers[0];
    assert.strictEqual(k.vid, vid);
    assert.strictEqual(k.status, 'dead');
    assert.strictEqual(k.causeGroup, 'combat');
    assert.strictEqual(k.aliveAfter, 0, 'blooded and died the same day in the smoke');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: wave-4 kill + registerDeath capture, analyzer classifies dead/combat/0 days');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('VETPAIR-B-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('VETPAIR-B-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
