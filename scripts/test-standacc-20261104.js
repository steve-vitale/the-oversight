// test-standacc-20261104.js — proof test for the standing accumulation
// instrument + analyzer (arm sim-standacc-b).
// Fixture-based (best-day decomposition, gap/shave math, diplomacy
// funnel trace kinds, negative-delta detection, qualifying test,
// ready / ready-but-unreleased counts, judgeGo) plus one live
// harness smoke: a fresh loaded game snapshots with capped ==
// war+diplomacy+min(plenty,100), gate veteran count == recount,
// peak-stable snapshot, funnel + ledger shapes present, and a live
// wave-4 kill landing in killEvents. No repo writes.
// Usage: node scripts/test-standacc-20261104.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'standacc-analyze-20261104'));
const INST = require(path.join(__dirname, 'standacc-instrument-20261104'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, scholarId: 'v_scholar', roster: ['v_scholar'],
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: ['veterans'] },
    readiness4: { ready: true },
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    capped: 0, peak: 0, deferral5: { deferred: false, ready: false },
    w4faced: 0, w5faced: 0, w3rung: { met: true }, scaleRank: 'village',
    linkFunnel: { total: 0, active: 0, seasoned: 0, regionalPlus: 0, seasonedNotRegional: 0, detail: [] },
    ledger: { w3: { points: 0, headroomPts: 10 }, w4: { points: 0, headroomPts: 10 }, w5: { points: 0, headroomPts: 10 }, perTypeCap: 2 },
    feastLog: { total: 0, major: 0 },
    logW4: [], veteranVids: [], veteranVidsAll: [], veteranRecount: 0, veteranMismatch: false, livingCount: 1,
  }, over || {});
}
function seed(over) {
  return Object.assign({ seed: 1, run: 'fixture', days: 10, endReason: 'village-lost',
    won: false, maxWave: 4, scaleRank: 'village', endUnlockedWave: 4,
    peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
    daily: [], killEvents: [], deathEvents: [], standingLines: [], instrumentErrors: [] }, over || {});
}

ok('best capped day + gap + shave math', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 100, war: 50, diplomacy: 0, plenty: 50, warPts: 2, links: 0, feasts: 2 }, capped: 100 }),
    snap(11, { standing: { total: 245, war: 125, diplomacy: 0, plenty: 120, warPts: 5, links: 0, feasts: 6 }, capped: 225 }),
    snap(12, { standing: { total: 200, war: 100, diplomacy: 0, plenty: 100, warPts: 4, links: 0, feasts: 5 }, capped: 200 }),
  ] }));
  assert.strictEqual(s.bestDay, 11);
  assert.strictEqual(s.bestCapped, 225);
  assert.strictEqual(s.bestRaw, 245);
  assert.strictEqual(s.gapAtBest, 0);
  assert.strictEqual(s.shaveAtBest, 20);
  assert.deepStrictEqual(s.bestSplit, { war: 125, diplomacy: 0, plenty: 120, warPts: 5, links: 0, feasts: 6 });
  assert.strictEqual(s.traceKind, 'no-gap');
  assert.strictEqual(s.traced, false);
});

ok('plenty-cap trace when shave >= gap', function () {
  const s2 = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 220, war: 70, diplomacy: 0, plenty: 150, warPts: 2, links: 0, feasts: 7 }, capped: 170 }),
  ] }));
  assert.strictEqual(s2.bestCapped, 170);
  assert.strictEqual(s2.gapAtBest, 30);
  assert.strictEqual(s2.shaveAtBest, 50);
  assert.strictEqual(s2.traceKind, 'plenty-cap');
  assert.strictEqual(s2.traced, true);
});

ok('diplomacy-stalled trace when seasoned-not-regional x 34 >= gap', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, {
      standing: { total: 150, war: 150, diplomacy: 0, plenty: 0, warPts: 6, links: 0, feasts: 0 }, capped: 150,
      linkFunnel: { total: 2, active: 2, seasoned: 2, regionalPlus: 0, seasonedNotRegional: 2, detail: [] },
    }),
  ] }));
  assert.strictEqual(s.gapAtBest, 50);
  assert.strictEqual(s.traceKind, 'diplomacy-stalled');
  assert.strictEqual(s.traced, true);
});

ok('diplomacy-absent-no-links trace', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 150, war: 150, diplomacy: 0, plenty: 0, warPts: 6, links: 0, feasts: 0 }, capped: 150 }),
  ] }));
  assert.strictEqual(s.traceKind, 'diplomacy-absent-no-links');
  assert.strictEqual(s.traced, true);
});

ok('untraced when diplomacy flows but gap remains', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, {
      standing: { total: 134, war: 100, diplomacy: 34, plenty: 0, warPts: 4, links: 1, feasts: 0 }, capped: 134,
      linkFunnel: { total: 1, active: 1, seasoned: 1, regionalPlus: 1, seasonedNotRegional: 0, detail: [] },
    }),
  ] }));
  assert.strictEqual(s.traceKind, null);
  assert.strictEqual(s.traced, false);
});

ok('negative component deltas are sinks, gains are not', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { standing: { total: 134, war: 100, diplomacy: 34, plenty: 0, warPts: 4, links: 1, feasts: 0 }, capped: 134 }),
    snap(11, { standing: { total: 100, war: 100, diplomacy: 0, plenty: 0, warPts: 4, links: 0, feasts: 0 }, capped: 100 }),
    snap(12, { standing: { total: 125, war: 125, diplomacy: 0, plenty: 0, warPts: 5, links: 0, feasts: 0 }, capped: 125 }),
  ] }));
  assert.strictEqual(s.negDeltas.length, 1);
  assert.strictEqual(s.negDeltas[0].component, 'diplomacy');
  assert.strictEqual(s.negDeltas[0].delta, -34);
});

ok('qualifying: 3 bars, capped>=150, or a ready day', function () {
  const byBars = AN.summarizeSeed(seed({ daily: [snap(10, { readiness5: { ready: false, armored: 4, armed: 6, tricks: 3, veterans: 0, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: ['veterans'] } })] }));
  assert.strictEqual(byBars.maxBarsMet, 3);
  assert.strictEqual(byBars.qualifying, true);
  const byCapped = AN.summarizeSeed(seed({ daily: [snap(10, { capped: 150, standing: { total: 150, war: 150, diplomacy: 0, plenty: 0, warPts: 6, links: 0, feasts: 0 } })] }));
  assert.strictEqual(byCapped.qualifying, true);
  const none = AN.summarizeSeed(seed({ daily: [snap(10)] }));
  assert.strictEqual(none.qualifying, false);
});

ok('ready days and ready-but-unreleased days', function () {
  const ready = { ready: true, armored: 4, armed: 6, tricks: 3, veterans: 2, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: [] };
  const s = AN.summarizeSeed(seed({ daily: [
    snap(10, { readiness5: ready, capped: 210, peak: 0 }),
    snap(11, { readiness5: ready, capped: 210, peak: 0 }),
    snap(12, { capped: 210, peak: 0 }),
    snap(13, { capped: 150, peak: 0 }),
  ] }));
  assert.strictEqual(s.readyDayCount, 2);
  assert.deepStrictEqual(s.readyRuns, [{ start: 10, days: 2, end: 11 }]);
  assert.strictEqual(s.readyUnreleasedDayCount, 1);
  assert.strictEqual(s.firstCapped200, 10);
});

ok('standing-line classification separates standing releases from sector releases', function () {
  const s = AN.summarizeSeed(seed({ standingLines: [
    { day: 10, via: 'sysSay', line: '📡 The fifth draft stays in the wings. It wants a village that can fight — blood your fighters (0 of 2 veterans).' },
    { day: 11, via: 'sysSay', line: '📡 RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft opens.' },
    { day: 12, via: 'sysSay', line: '📡 RATINGS ARE UP... the Producers have greenlit the fifth draft. Wave 5 talent has been released.' },
    { day: 13, via: 'say', line: '📺 RATINGS ARE UP! The producers are pleased. New casting directives incoming — Wave 3 talent has been released into your sector.' },
    { day: 14, via: 'say', line: '📈 your showbiz fans +3 — ratings stunt (favor: 7)' },
  ] }));
  assert.strictEqual(s.holdLines, 1);
  assert.strictEqual(s.standingReleaseLines, 2);
  assert.strictEqual(s.sectorReleaseLines, 1);
  assert.strictEqual(s.otherLines, 1);
});

ok('judgeGo: same-kind trace on all judged seeds', function () {
  const mk = function (kind) {
    return { qualifying: true, traced: true, traceKind: kind };
  };
  const j = AN.judgeGo([mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links')]);
  assert.strictEqual(j.go, true);
  assert.strictEqual(j.goNote, 'DIAG-GO');
  assert.strictEqual(j.dominant, 'diplomacy-absent-no-links');
  const mixed = AN.judgeGo([mk('diplomacy-absent-no-links'), mk('plenty-cap'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links')]);
  assert.strictEqual(mixed.go, true);
  assert.strictEqual(mixed.dominant, 'diplomacy-absent-no-links');
  assert.strictEqual(mixed.dominantN, 7);
  const scattered = AN.judgeGo([mk('diplomacy-absent-no-links'), mk('diplomacy-absent-no-links'), mk('plenty-cap'), mk('plenty-cap'), mk('diplomacy-stalled'), mk('diplomacy-stalled'), mk('diplomacy-absent-unseasoned'), mk('diplomacy-absent-unseasoned')]);
  assert.strictEqual(scattered.go, false);
  const few = AN.judgeGo([{ qualifying: true, traced: true, traceKind: 'plenty-cap' }, { qualifying: false, traced: false, traceKind: null }]);
  assert.strictEqual(few.go, true);
  assert.strictEqual(few.judgedPool, 1);
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'standacc-proof', fullTelemetry: false });
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
    assert.ok(snap0.linkFunnel && typeof snap0.linkFunnel.total === 'number', 'link funnel present');
    assert.ok(snap0.ledger && snap0.ledger.w3 && typeof snap0.ledger.w3.headroomPts === 'number', 'ledger headroom present');
    assert.ok(snap0.feastLog && typeof snap0.feastLog.major === 'number', 'feast log present');
    const peakBefore = snap0.peak;
    inst.snapshot();
    assert.strictEqual(inst.t.daily[1].peak, peakBefore, 'snapshot does not move the peak');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killEvents.length, 1, 'live kill event captured');
    assert.strictEqual(inst.t.killEvents[0].wave, 4);
    const snap1 = inst.snapshot();
    assert.ok((snap1.logW4 || []).some(function (e) { return e.by === vid && e.w === 4; }), 'kill in logW4 snapshot');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: capped math, gate == recount, peak-stable snapshot, funnel + ledger shapes, live kill event');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
