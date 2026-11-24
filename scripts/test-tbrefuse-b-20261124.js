// test-tbrefuse-b-20261124.js — proof test for the non-building-
// TB-start tracer + analyzer (arm sim-tbrefuse-b). V2 (Amendment
// #1): callKind taxonomy (guard / titan / instant-resolve /
// noop-unexplained), lines fired during the call, instant-resolve
// fate + tbEnd linkage, titan-line dedup.
// Fixture-based (fate counts, call-kind counts, caller taxonomy,
// visibility verdicts, episodes, wait times, kill attribution,
// bloodcluster cross-check, scale-wall aggregation) plus one live
// harness smoke: a staged guard refusal is recorded with caller +
// say line, re-engages after the live fight ends, a second refused
// monster removed from the world resolves as removed-vanished, and
// a staged titan call (herald, no muster) records a titan-refusal
// with the titan line — 0 instrument errors. No repo writes. The
// determinism replay leg (bar 5) runs as a separate driver step,
// not in this proof test — a 150-day seed is too slow for a check
// script. The instant-resolve live path is proven by fixture +
// the judged band's own linkage cross-checks (instantNoEnd,
// endsDuringStartMismatch, instantKilledMismatch), not staged
// here — staging a deterministic opening-round kill is not
// feasible in a check script.
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
    callKind: 'guard-refusal', isTitan: false, titanLineFired: false,
    caller: 'monsterTurn', callerFrame: 'at Game.monsterTurn (/src/js/game.js:24871:11)',
    liveFightId: 'f-live', liveMonsterMid: 'editor', liveRound: 2,
    pendingMonsterId: null, hasWorldMonster: true, worldMonsterId: mid,
    worldMonsterOnTile: true, worldMonsterHp: 40, worldMonsterVeteran: false,
    worldMonsterStance: 'hungry', returnValue: 'f-live',
    sayFired: true, sayFirings: 1,
    linesDuringCall: [{ via: 'say', line: 'Already in a fight — finish this one first. (startCombat refused: a fight is live.)' }],
    contextLines: [], repeatOf: null,
    endedFightId: null, endedResult: null, endedMonsterIds: null,
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
    // V2 rows: one titan-refusal (line fired once that day) and two
    // instant-resolves (won with a kill; routed with no kill).
    refusal(8, 130, 'herald', 4, { callKind: 'titan-refusal', isTitan: true, titanLineFired: true,
      liveFightId: null, liveMonsterMid: null, liveRound: null, returnValue: null,
      sayFired: false, sayFirings: 0,
      linesDuringCall: [{ via: 'say', line: '⛔ The Herald does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster 20 allied blades (you have 0). This is not courage. This is arithmetic.' }],
      fate: 'still-waiting-at-end', fateDay: 150, fateDetail: 'tagged monster still tracked at end of run' }),
    refusal(9, 140, 'suburb', 4, { callKind: 'instant-resolve',
      liveFightId: null, liveMonsterMid: null, liveRound: null, returnValue: null,
      sayFired: false, sayFirings: 0, linesDuringCall: [],
      endedFightId: 'f-open', endedResult: 'won', endedMonsterIds: ['suburb'],
      fate: 'killed-in-opening', fateDay: 140, fateDetail: 'kill in tbKillCtx for fight f-open' }),
    refusal(10, 141, 'audit', 4, { callKind: 'instant-resolve',
      liveFightId: null, liveMonsterMid: null, liveRound: null, returnValue: null,
      sayFired: false, sayFirings: 0, linesDuringCall: [],
      endedFightId: 'f-open2', endedResult: 'routed', endedMonsterIds: ['audit'],
      fate: 'fled-in-opening', fateDay: 141, fateDetail: 'fight f-open2 ended routed in opening turns' }),
  ];
  const tbsList = rows.map(function (r) { return tbs(r.day, r.mid, r.wave, false); });
  tbsList.push(tbs(50, 'editor', 4, true, { fightId: 'f-live' }));
  const ends = [
    { day: 50, fightId: 'f-live', result: 'fled' },
    { day: 50, fightId: 'f-re', result: 'won' },
    { day: 140, fightId: 'f-open', result: 'won', monsterIds: ['suburb'], duringStartCombat: true },
    { day: 141, fightId: 'f-open2', result: 'routed', monsterIds: ['audit'], duringStartCombat: true },
  ];
  const ctxList = [ctx(50, 'herald', 'scholar1', 'player'),
    ctx(140, 'suburb', 'mara_vasquez', 'companion', { fightId: 'f-open' })];
  return seedOut({ refusals: rows, tbStarts: tbsList, tbEnds: ends, tbKillCtx: ctxList,
    refusalSayCount: 1 + 3 + 1 + 1 + 1 + 1 + 1 + 1 });
}

ok('fate counts: every frozen fate class present, 0 unclassified', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.refusalCount, 11);
  assert.deepStrictEqual(s.unclassifiedRefusals, []);
  assert.strictEqual(s.fateCounts['re-engaged-tb'], 2);
  assert.strictEqual(s.fateCounts['killed-field'], 1);
  assert.strictEqual(s.fateCounts['removed-vanished'], 1);
  assert.strictEqual(s.fateCounts['removed-fled-across'], 1);
  assert.strictEqual(s.fateCounts['still-waiting-at-end'], 2, 'guard row + titan row');
  assert.strictEqual(s.fateCounts['pending-resolved'], 1);
  assert.strictEqual(s.fateCounts['pending-unresolved-at-end'], 1);
  assert.strictEqual(s.fateCounts['killed-in-opening'], 1);
  assert.strictEqual(s.fateCounts['fled-in-opening'], 1);
  assert.strictEqual(s.distinctWorldMonsters, 8, 'herald counted once, its repeat linked');
  assert.strictEqual(s.repeatRefusals, 1);
  assert.strictEqual(s.pendingRefusals, 2);
  assert.strictEqual(s.refusalsW4Plus, 11);
});

ok('callKind counts: guard / titan / instant split; titan line dedups once per day; instant ends link', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.deepStrictEqual(s.callKindCounts, { 'guard-refusal': 8, 'titan-refusal': 1, 'instant-resolve': 2 });
  assert.strictEqual(s.titanRows.length, 1);
  assert.strictEqual(s.titanLineRows.length, 1);
  assert.deepStrictEqual(s.titanCountsByMid, { herald: 1 });
  assert.strictEqual(s.titanLineDedupViolations, 0, 'one titan line firing for the one herald day');
  assert.strictEqual(s.instantRows.length, 2);
  assert.deepStrictEqual(s.instantNoEnd, []);
  assert.strictEqual(s.endsDuringStartCount, 2);
  assert.strictEqual(s.endsDuringStartMismatch, 0, 'every end-during-call belongs to an instant row');
  assert.deepStrictEqual(s.instantKilledMismatch, []);
  assert.strictEqual(s.openingKilledRows, 1, 'suburb died in the opening; audit fled');
});

ok('visibility: every row carries linesDuringCall; empty means silent, not missing', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.noVisibility.length, 0);
  assert.strictEqual(s.silentRows.length, 2, 'the two instant rows said nothing during the call');
  assert.strictEqual(s.lineRows.length, 9, '8 guard lines + 1 titan line');
  const titan = s.refusals.find(function (r) { return r.callKind === 'titan-refusal'; });
  assert.ok(titan.linesDuringCall[0].line.indexOf('does not notice you') >= 0);
});

ok('noop-unexplained counts as unclassified (bar 1, fail-closed)', function () {
  const f = refusalsFixture();
  f.refusals.push(refusal(11, 150, 'glasswing', 1, { callKind: 'noop-unexplained',
    liveFightId: null, liveMonsterMid: null, liveRound: null, returnValue: null,
    sayFired: false, sayFirings: 0, linesDuringCall: [],
    fate: 'still-waiting-at-end', fateDay: 150, fateDetail: 'tagged monster still tracked at end of run' }));
  f.tbStarts.push(tbs(150, 'glasswing', 1, false));
  const s = AN.summarizeSeed(f);
  assert.strictEqual(s.refusalCount, 12);
  assert.strictEqual(s.unclassifiedRefusals.length, 1);
  assert.strictEqual(s.unclassifiedRefusals[0].seq, 11);
  assert.strictEqual(s.callKindCounts['noop-unexplained'], 1);
});

ok('gone-untracked counts as unclassified; caller-unknown and silent rows flagged', function () {
  const f = refusalsFixture();
  f.refusals.push(refusal(11, 130, 'eater', 4, { liveFightId: 'f-live8',
    fate: 'gone-untracked', fateDay: 131, fateDetail: 'left worldMonsters() untracked' }));
  f.refusals.push(refusal(12, 131, 'eater', 4, { liveFightId: 'f-live8', caller: 'caller-unknown',
    callerFrame: null, sayFired: false, sayFirings: 0, linesDuringCall: [], fate: 're-engaged-tb', fateDay: 131 }));
  f.tbStarts.push(tbs(130, 'eater', 4, false), tbs(131, 'eater', 4, false));
  const s = AN.summarizeSeed(f);
  assert.strictEqual(s.refusalCount, 13);
  assert.strictEqual(s.unclassifiedRefusals.length, 1);
  assert.strictEqual(s.unclassifiedRefusals[0].seq, 11);
  assert.strictEqual(s.callerUnknown.length, 1);
  assert.strictEqual(s.callerUnknown[0].seq, 12);
  assert.strictEqual(s.sayFiredCount, 9, '8 guard rows + the pushed gone-untracked row fired the guard line');
  assert.strictEqual(s.silentRows.length, 3, '2 instant rows + the unknown-caller row said nothing during the call');
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
  assert.strictEqual(s.openingKilledRows, 1, 'the instant suburb kill is opening, not delayed');
  assert.deepStrictEqual(s.notKilledByFate, {
    'removed-vanished': 1, 'removed-fled-across': 1,
    'still-waiting-at-end': 2, 'pending-unresolved-at-end': 1,
    'fled-in-opening': 1, 'lost-in-opening': 0, 'instant-other': 0,
  });
});

ok('bloodcluster cross-check: rebuilt-false tbStarts rows match non-building-start count', function () {
  const s = AN.summarizeSeed(refusalsFixture());
  assert.strictEqual(s.bloodclusterRefusedCount, 11);
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
  assert.strictEqual(all.refusalCount, 22);
  assert.strictEqual(all.unclassifiedRefusals, 0);
  assert.deepStrictEqual(all.callKindCounts, { 'guard-refusal': 16, 'titan-refusal': 2, 'instant-resolve': 4 });
  assert.strictEqual(all.openingKilledRows, 2);
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
    assert.strictEqual(row.callKind, 'guard-refusal');
    assert.strictEqual(row.liveFightId, liveId);
    assert.strictEqual(row.fate, null, 'fate open until the monster resolves');
    assert.strictEqual(row.sayFired, true, 'the refusal line fired during the call');
    assert.strictEqual(row.sayFirings, 1, 'exactly one line for one refused call');
    assert.strictEqual(row.linesDuringCall.length, 1, 'one line fired during the call');
    assert.ok(row.linesDuringCall[0].line.indexOf('Already in a fight') >= 0);
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
    // A titan call with no muster: the hard gate refuses BEFORE the
    // guard (the titan wrapper sits outside it), even with fight B
    // live — the titan line, not the guard line, is what fires.
    const rTitan = Game.startCombat('herald');
    assert.strictEqual(rTitan, null, 'titan gate returns null without a muster');
    assert.ok(Game.tbfight && !Game.tbfight.over, 'fight B still live after the titan refusal');
    assert.strictEqual(inst.t.refusals.length, 3, 'titan refusal recorded');
    const rowT = inst.t.refusals[2];
    assert.strictEqual(rowT.callKind, 'titan-refusal', 'titan line, not guard line, decides the kind');
    assert.strictEqual(rowT.mid, 'herald');
    assert.strictEqual(rowT.isTitan, true);
    assert.strictEqual(rowT.titanLineFired, true, 'the titan line fired during the call');
    assert.ok(rowT.linesDuringCall.some(function (l) { return l.line.indexOf('does not notice you') >= 0; }));
    assert.strictEqual(rowT.fate, null, 'titan-refused monster fate open until it resolves');
    // Bloodcluster cross-check on the live rows: 3 rebuilt-false tbStarts.
    inst.finalize();
    assert.strictEqual(rowT.fate, 'pending-unresolved-at-end', 'staged herald had no world monster to tag');
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
    assert.strictEqual(bc.refusalCount, 3);
    assert.strictEqual(bc.refusalCountMismatch, 0, 'tbStarts rebuilt-false rows match refusal rows live');
    assert.deepStrictEqual(bc.callKindCounts, { 'guard-refusal': 2, 'titan-refusal': 1 });
    assert.strictEqual(bc.unclassifiedRefusals.length, 0);
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: guard refusal + say line + re-engage + vanished + titan refusal, 0 instrument errors');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('TBREFUSE-B-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('TBREFUSE-B-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
