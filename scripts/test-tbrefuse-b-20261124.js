// test-tbrefuse-b-20261124.js — proof test for the refused-TB-start
// fate tracer + analyzer (arm sim-tbrefuse-b).
// Fixture-based (fate counts, caller taxonomy, visibility verdicts,
// episodes, wait times, kill attribution, bloodcluster cross-check,
// scale-wall aggregation) plus one live harness smoke: a staged
// refusal is recorded with caller + say line, re-engages after the
// live fight ends, and a second refused monster removed from the
// world resolves as removed-vanished — 0 instrument errors. No repo
// writes. The determinism replay leg (bar 5) runs as a separate
// driver step, not in this proof test — a 150-day seed is too slow
// for a check script.
// Usage: node scripts/test-tbrefuse-b-20261124.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'tbrefuse-b-analyze-20261124'));
const INST = require(path.join(__dirname, 'tbrefuse-b-instrument-20261124'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function seedOut(over) {
  return Object.assign({ seed: 109312, arm: 'tbrefuse-b', run: 'fixture', days: 150, gameDays: 150,
    endReason: 'survived', won: false, scaleRank: 'regional', maxWave: 5,
    endUnlockedWave: 5, peakBeforeEndCall: 5, peakAfterEndCall: 5, endCallMovedPeak: false,
    endState: { scholarId: 'scholar1', roster: [], exiles: [] },
    daily: [], killEvents: [], deathEvents: [], feastEvents: [], standingLines: [],
    releaseLines: [], saySample: [], fieldFights: [], tbStarts: [], tbKillCtx: [],
    refusals: [], tbEnds: [], refusalSayLines: [], refusalSayCount: 0,
    wrapCounts: {}, instrumentErrors: [] }, over || {});
}
function refusal(seq, day, mid, wave, over) {
  return Object.assign({ seq: seq, day: day, mid: mid, wave: wave,
    caller: 'monsterTurn', callerFrame: 'at Game.monsterTurn (/src/js/game.js:24871:11)',
    liveFightId: 'f-live', liveMonsterMid: 'editor', liveRound: 2,
    pendingMonsterId: null, hasWorldMonster: true, worldMonsterId: mid,
    worldMonsterOnTile: true, worldMonsterHp: 40, worldMonsterVeteran: false,
    worldMonsterStance: 'hungry', sayFired: true, sayFirings: 1,
    contextLines: [], repeatOf: null,
    fate: 're-engaged-tb', fateDay: day, fateDetail: 'lifted by startCombat',
    reengagedFightId: 'f-re' }, over || {});
}
function tbs(day, mid, wave, rebuilt, over) {
  return Object.assign({ day: day, mid: mid, wave: wave, fightId: 'f' + day + mid, rebuilt: rebuilt,
    scholarId: 'scholar1', partySize: 1, scholarPresent: true,
    villagerJoiners: [], fighterKinds: ['player'], monsterCount: 1 }, over || {});
}
function ctx(day, mid, by, via, over) {
  return Object.assign({ seq: 0, day: day, fn: 'recordWaveKill', mid: mid, wave: 4,
    by: by, via: via, inTbFight: true, fightId: 'f-re', tbOver: false, tbResult: 'won',
    partySize: 1, scholarPresent: true, villagerFighters: [], monsterIds: [mid] }, over || {});
}

function refusalsFixture() {
  const rows = [
    refusal(0, 50, 'herald', 4),
    refusal(1, 50, 'herald', 4, { liveFightId: 'f-live', repeatOf: 0, sayFirings: 3,
      fate: 're-engaged-tb', fateDay: 50, fateDetail: 'lifted by startCombat day 50' }),
    refusal(2, 70, 'suburb', 4, { liveFightId: 'f-live2', liveMonsterMid: 'strike',
      fate: 'killed-field', fateDay: 71, fateDetail: 'fieldFight vKill day 71 by scholar1' }),
    refusal(3, 80, 'editor', 4, { liveFightId: 'f-live3', liveMonsterMid: 'audit',
      fate: 'removed-vanished', fateDay: 82, fateDetail: 'lostSight' }),
    refusal(4, 90, 'reunion', 4, { liveFightId: 'f-live4', liveMonsterMid: 'eulogy',
      fate: 'removed-fled-across', fateDay: 90, fateDetail: 'fledMonsters entry for reunion' }),
    refusal(5, 100, 'congregation', 5, { liveFightId: 'f-live5', liveMonsterMid: 'spoiler',
      fate: 'still-waiting-at-end', fateDay: 150, fateDetail: 'tagged monster still tracked at end of run' }),
    refusal(6, 110, 'audit', 4, { liveFightId: 'f-live6', liveMonsterMid: 'herald',
      hasWorldMonster: false, worldMonsterId: null, pendingMonsterId: 'audit',
      fate: 'pending-resolved', fateDay: 110, fateDetail: 'pending audit consumed by startCombat' }),
    refusal(7, 120, 'strike', 4, { liveFightId: 'f-live7', liveMonsterMid: 'buffering',
      hasWorldMonster: false, worldMonsterId: null, pendingMonsterId: 'strike',
      fate: 'pending-unresolved-at-end', fateDay: 150, fateDetail: 'never consumed nor cleared' }),
  ];
  const tbsList = rows.map(function (r) { return tbs(r.day, r.mid, r.wave, false); });
  tbsList.push(tbs(50, 'editor', 4, true, { fightId: 'f-live' }));
  const ends = [
    { day: 50, fightId: 'f-live', result: 'fled' },
    { day: 50, fightId: 'f-re', result: 'won' },
  ];
  const ctxList = [ctx(50, 'herald', 'scholar1', 'player')];
  return seedOut({ refusals: rows, tbStarts: tbsList, tbEnds: ends, tbKillCtx: ctxList,
    refusalSayCount: 1 + 3 + 1 + 1 + 1 + 1 + 1 + 1 });
}

ok('fate counts: every frozen fate class present once, 0 unclassified', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.refusalCount, 8);
  assert.deepStrictEqual(s.unclassifiedRefusals, []);
  assert.strictEqual(s.fateCounts['re-engaged-tb'], 2);
  assert.strictEqual(s.fateCounts['killed-field'], 1);
  assert.strictEqual(s.fateCounts['removed-vanished'], 1);
  assert.strictEqual(s.fateCounts['removed-fled-across'], 1);
  assert.strictEqual(s.fateCounts['still-waiting-at-end'], 1);
  assert.strictEqual(s.fateCounts['pending-resolved'], 1);
  assert.strictEqual(s.fateCounts['pending-unresolved-at-end'], 1);
  assert.strictEqual(s.distinctWorldMonsters, 5, 'herald counted once, its repeat linked');
  assert.strictEqual(s.repeatRefusals, 1);
  assert.strictEqual(s.pendingRefusals, 2);
  assert.strictEqual(s.refusalsW4Plus, 8);
});

ok('gone-untracked counts as unclassified; caller-unknown and silent rows flagged', function () {
  const f = refusalsFixture();
  f.refusals.push(refusal(8, 130, 'eater', 4, { liveFightId: 'f-live8',
    fate: 'gone-untracked', fateDay: 131, fateDetail: 'left worldMonsters() untracked' }));
  f.refusals.push(refusal(9, 131, 'eater', 4, { liveFightId: 'f-live8', caller: 'caller-unknown',
    callerFrame: null, sayFired: false, sayFirings: 0, fate: 're-engaged-tb', fateDay: 131 }));
  f.tbStarts.push(tbs(130, 'eater', 4, false), tbs(131, 'eater', 4, false));
  const s = AN.summarizeSeed(f);
  assert.strictEqual(s.refusalCount, 10);
  assert.strictEqual(s.unclassifiedRefusals.length, 1);
  assert.strictEqual(s.unclassifiedRefusals[0].seq, 8);
  assert.strictEqual(s.callerUnknown.length, 1);
  assert.strictEqual(s.callerUnknown[0].seq, 9);
  assert.strictEqual(s.silentCount, 1, 'the unknown-caller row is the silent one');
  assert.strictEqual(s.sayFiredCount, 9);
});

ok('say-line cross-check: per-row firings sum to the recorded line count', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.sayFiringsSum, 10);
  assert.strictEqual(s.refusalSayCount, 10);
  assert.strictEqual(s.sayCountMismatch, 0);
  const bad = refusalsFixture();
  bad.refusalSayCount = 11;
  assert.strictEqual(AN.summarizeSeed(bad).sayCountMismatch, 1);
});

ok('episodes group by live fight; waits measured from refusal day', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.episodeCount, 7, 'f-live holds 2 refusals, the rest are singletons');
  assert.strictEqual(s.maxRefusalsPerEpisode, 2);
  assert.strictEqual(s.episodes[0].liveFightId, 'f-live');
  assert.strictEqual(s.episodes[0].count, 2);
  assert.strictEqual(s.episodes[0].sayFirings, 4);
  assert.deepStrictEqual(s.reengagedWaits, [0, 0]);
  assert.strictEqual(s.reengagedWaitMedian, 0);
  assert.strictEqual(s.reengagedWaitMax, 0);
  assert.strictEqual(s.reengagedSameDay, 2);
});

ok('kill attribution: re-engaged fight that kills counts as delayed-killed', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.reengagedKilled, 1, 'both herald rows share one monster and one ctx kill — distinct count 1');
  assert.strictEqual(s.reengagedKilledRows, 2, 'per-row count still 2');
  assert.deepStrictEqual(s.reengagedFightResults, { won: 2 });
  assert.strictEqual(s.reengagedNoEnd, 0);
  assert.strictEqual(s.delayedCount, 2, '2 distinct monsters delayed (herald + suburb)');
  assert.strictEqual(s.delayedRows, 3, '3 refusal rows delayed');
  assert.strictEqual(s.delayedKilledCount, 2, '1 TB kill + 1 field kill');
  assert.deepStrictEqual(s.notKilledByFate, {
    'removed-vanished': 1, 'removed-fled-across': 1,
    'still-waiting-at-end': 1, 'pending-unresolved-at-end': 1,
  });
});

ok('bloodcluster cross-check: rebuilt-false tbStarts rows match refusal count', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.bloodclusterRefusedCount, 8);
  assert.strictEqual(s.refusalCountMismatch, 0);
  const bad = refusalsFixture();
  bad.tbStarts.splice(0, 1); // drop one refused row from the base instrument's count
  assert.strictEqual(AN.summarizeSeed(bad).refusalCountMismatch, 1);
});

ok('scale-wall aggregation across seeds', function () {
  const a = refusalsFixture();
  const b = refusalsFixture();
  b.seed = 109311; b.won = true; b.scaleRank = 'national'; b.endUnlockedWave = 5;
  b.killEvents = [{ day: 60, fn: 'recordWaveKill', mid: 'herald', wave: 5, by: 'scholar1', via: 'player', entryAdded: true }];
  b.daily = [{ day: 60, w5faced: 1 }];
  b.days = 150;
  const all = AN.summarizeAll([a, b]);
  assert.strictEqual(all.refusalCount, 16);
  assert.strictEqual(all.unclassifiedRefusals, 0);
  assert.strictEqual(all.wins, 1);
  assert.strictEqual(all.national, 1);
  assert.strictEqual(all.w5Unlocked, 2);
  assert.strictEqual(all.w5Faced, 1);
  assert.strictEqual(all.w5Kills, 1);
  assert.strictEqual(all.medianSurvival, 150);
  assert.strictEqual(all.delayedCount, 4, '2 distinct delayed monsters per seed');
});

ok('callerClass: stack frames map to the frozen caller set', function () {
  const C = INST.callerClass;
  assert.strictEqual(C(['at Game.monsterTurn (/src/js/game.js:24871:11)']), 'monsterTurn');
  assert.strictEqual(C(['at Game.reengageWaitingMonsters (/src/js/game.js:12847:9)']), 'waiting-monsters');
  assert.strictEqual(C(['at Game.gwTrapTick (/src/js/game.js:24721:11)']), 'trap');
  assert.strictEqual(C(['at Game.faceFeastDraw (/src/js/feastBuff.js:763:9)']), 'feast-draw');
  assert.strictEqual(C(['at Game._contestArena (/src/js/contests.js:4824:7)']), 'contest-arena');
  assert.strictEqual(C(['at Object.daily (/scripts/policies/competent.js:100:11)']), 'policy');
  assert.strictEqual(C([]), 'caller-unknown');
  assert.ok(C(['at foo (/src/js/somewhere.js:1:1)']).indexOf('other-') === 0);
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 109312, mode: 'tbrefuse-b-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const defs = (Game.data.monsters || []).filter(function (m) { return m && (m.wave || 1) === 1; });
    assert.ok(defs.length >= 2, 'need two wave-1 monster defs');
    const s = Game.state.scholar;
    const sx = s.mx ?? 4, sy = s.my ?? 4;
    const tx = Game.map.px, ty = Game.map.py;
    // Monster A starts the live fight; monster B walks in while it is live.
    const monA = Game.spawnWorldMonster(defs[0], tx, ty, { mx: sx, my: sy });
    assert.ok(monA, 'monster A spawned on the player tile');
    Game.startCombat(monA.id);
    assert.ok(Game.tbfight && !Game.tbfight.over, 'fight A is live');
    const liveId = Game.tbfight.id;
    const monB = Game.spawnWorldMonster(defs[1], tx, ty, { mx: sx, my: sy });
    assert.ok(monB, 'monster B spawned on the player tile');
    const sayBefore = inst.t.refusalSayCount;
    Game.startCombat(monB.id);
    assert.strictEqual(inst.t.refusals.length, 1, 'one refusal recorded');
    const row = inst.t.refusals[0];
    assert.strictEqual(row.mid, monB.id);
    assert.strictEqual(row.liveFightId, liveId);
    assert.strictEqual(row.fate, null, 'fate open until the monster resolves');
    assert.strictEqual(row.sayFired, true, 'the refusal line fired during the call');
    assert.strictEqual(row.sayFirings, 1, 'exactly one line for one refused call');
    assert.strictEqual(inst.t.refusalSayCount, sayBefore + 1);
    assert.ok(Array.isArray(monB.__tbrefuse) && monB.__tbrefuse[0] === 0, 'monster B tagged by object identity');
    // End the live fight, then face B: the refusal resolves as re-engaged.
    const fightA = Game.tbfight; // tbEnd clears Game.tbfight — hold the object
    Game.tbEnd('fled');
    assert.ok(fightA.over, 'fight A ended');
    Game.startCombat(monB.id);
    assert.ok(Game.tbfight && !Game.tbfight.over, 'fight B is live now');
    assert.strictEqual(row.fate, 're-engaged-tb', 'refused monster re-engaged after the first fight');
    assert.strictEqual(row.reengagedFightId, Game.tbfight.id);
    assert.strictEqual(row.fateDay, row.day, 're-engagement same day (same tick sequence)');
    // A second refused monster, removed from the world instead: vanished.
    const monC = Game.spawnWorldMonster(defs[0], tx, ty, { mx: sx, my: sy });
    Game.startCombat(monC.id);
    assert.strictEqual(inst.t.refusals.length, 2, 'second refusal recorded');
    const rowC = inst.t.refusals[1];
    assert.strictEqual(rowC.fate, null);
    Game.removeWorldMonster(monC);
    assert.strictEqual(rowC.fate, 'removed-vanished', 'removed monster resolves as vanished');
    assert.strictEqual(rowC.fateDetail, 'other', 'no lostSight / fearful markers on a fresh spawn');
    // Bloodcluster cross-check on the live rows: 2 rebuilt-false tbStarts.
    const bc = AN.summarizeSeed({ seed: 109312, run: 'smoke', days: 1, gameDays: 1,
      endReason: 'smoke', won: false, scaleRank: 'village', maxWave: 1, endUnlockedWave: 1,
      peakBeforeEndCall: null, peakAfterEndCall: null, endCallMovedPeak: false,
      endState: { scholarId: Game.villagerId, roster: [], exiles: [] },
      daily: inst.t.daily, killEvents: inst.t.killEvents, feastEvents: inst.t.feastEvents,
      deathEvents: inst.t.deathEvents, standingLines: inst.t.standingLines,
      releaseLines: inst.t.releaseLines, saySample: inst.t.saySample,
      fieldFights: inst.t.fieldFights, tbStarts: inst.t.tbStarts, tbKillCtx: inst.t.tbKillCtx,
      refusals: inst.t.refusals, tbEnds: inst.t.tbEnds,
      refusalSayLines: inst.t.refusalSayLines, refusalSayCount: inst.t.refusalSayCount,
      wrapCounts: inst.t.wrapCounts, instrumentErrors: inst.t.instrumentErrors });
    assert.strictEqual(bc.refusalCount, 2);
    assert.strictEqual(bc.refusalCountMismatch, 0, 'tbStarts rebuilt-false rows match refusal rows live');
    assert.strictEqual(bc.unclassifiedRefusals.length, 0);
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: refusal recorded + say line + re-engage + vanished, 0 instrument errors');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('TBREFUSE-B-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('TBREFUSE-B-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
