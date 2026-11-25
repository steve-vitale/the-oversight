// test-wilddeath-b-20261124.js — proof test for the "what kills a
// veteran in the wild" attribution instrument + analyzer (arm
// sim-wilddeath-b). Fixture-based classification (every frozen
// taxonomy class, veteran join, inconsistent rows, bar counts)
// plus one live harness smoke: a fresh loaded game, a live
// registerDeath 'the wild' capture, and a live playerDeath with
// no cause (the ledger.js default path) whose row + tele death
// classify WILD-DEFAULT end to end. No repo writes. The
// determinism replay leg (bar 2) runs as a separate driver step,
// not in this proof test — a 150-day seed is too slow for a check
// script.
// Usage: node scripts/test-wilddeath-b-20261124.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'wilddeath-b-analyze-20261124'));
const INST = require(path.join(__dirname, 'wilddeath-b-instrument-20261124'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function pdRow(over) {
  return Object.assign({
    day: 100, causeArg: '<undefined>', site: 'game.js:8624 Game.hurtVillager',
    hasTbEnd: false, stackFrames: ['Game.hurtVillager @ src/js/game.js:8624'],
    tb: { inTbFight: false, fightId: null, over: null, result: null, fighters: [],
      monsterIds: [], monsterWaves: [], villagerIds: [],
      hasMonster: false, hasHostile: false, arenaContest: false,
      betrayal: false, tableTrial: false, coalitionArena: false },
    where: { departed: true, location: 'the wild', runLocation: null, tileType: 'forest',
      dayPart: 'dusk', insideTent: false, camp: false, campXY: null,
      pendingEncounter: false, pendingMonsterId: null, pendingInTent: false,
      vitals: { health: 0 }, scholarId: 'omar_farouk' },
    sayTail: [], victimName: 'Omar Farouk',
  }, over || {});
}
function regRow(over) {
  return Object.assign({
    day: 100, who: 'gen_x', kind: 'villager', cause: 'the wild', player: false,
    site: 'game.js:8600 Game.hurtVillager', hasTbEnd: false, stackFrames: [],
    tbFightId: null, tbInFight: false, tbMonsterIds: [], tbMonsterWaves: [],
    tbHasMonster: false, tbHasHostile: false, tbArenaContest: false,
  }, over || {});
}
function death(day, who, cause, player) {
  return { day: day, kind: 'villager', who: who, cause: cause, player: !!player };
}
function tbFightPd(over) {
  const tb = { inTbFight: true, fightId: 'f1', over: true, result: 'lost',
    fighters: [
      { kind: 'player', monsterId: null, wave: null, villagerId: null, alive: false },
      { kind: 'monster', monsterId: 'eater', wave: 4, villagerId: null, alive: true },
      { kind: 'villager', monsterId: null, wave: null, villagerId: 'tashi_sherpa', alive: true },
    ],
    monsterIds: ['eater'], monsterWaves: [4], villagerIds: ['tashi_sherpa'],
    hasMonster: true, hasHostile: false, arenaContest: false,
    betrayal: false, tableTrial: false, coalitionArena: false };
  return pdRow(Object.assign({ causeArg: 'the wild', hasTbEnd: true,
    site: 'game.js:48334 Game.tbEnd',
    stackFrames: ['Game.tbEnd @ src/js/game.js:48334', 'Game.playerDeath @ src/js/ledger.js:658'],
    tb: tb }, over || {}));
}

// --- every frozen taxonomy class ---
ok('WILD-TB-FIGHT: tbEnd loss, proven wild fight, monster + wave named', function () {
  const rec = AN.classifyWildDeath(death(138, 'omar_farouk', 'the wild', true), tbFightPd(), null);
  assert.strictEqual(rec.class, 'WILD-TB-FIGHT');
  assert.deepStrictEqual(rec.evidence.tbMonsterIds, ['eater']);
  assert.deepStrictEqual(rec.evidence.tbMonsterWaves, [4]);
  assert.strictEqual(rec.evidence.site, 'game.js:48334 Game.tbEnd');
  assert.strictEqual(rec.evidence.departed, true);
  assert.strictEqual(rec.evidence.tileType, 'forest');
});
ok('WILD-TB-OTHER: tbEnd loss but arena contest live is not a wild fight', function () {
  const row = tbFightPd();
  row.tb.arenaContest = true;
  const rec = AN.classifyWildDeath(death(138, 'omar_farouk', 'the wild', true), row, null);
  assert.strictEqual(rec.class, 'WILD-TB-OTHER');
  assert.strictEqual(rec.evidence.tbArenaContest, true);
});
ok('WILD-TB-OTHER: tbEnd loss but the fight was already cleared when captured', function () {
  const row = tbFightPd();
  row.tb = Object.assign({}, row.tb, { inTbFight: false, fightId: null, fighters: [], monsterIds: [], monsterWaves: [], hasMonster: false });
  const rec = AN.classifyWildDeath(death(138, 'omar_farouk', 'the wild', true), row, null);
  assert.strictEqual(rec.class, 'WILD-TB-OTHER');
});
ok('WILD-DEFAULT: playerDeath called with no cause; stack names the site', function () {
  const rec = AN.classifyWildDeath(death(100, 'omar_farouk', 'the wild', true), pdRow(), null);
  assert.strictEqual(rec.class, 'WILD-DEFAULT');
  assert.strictEqual(rec.evidence.causeArg, '<undefined>');
  assert.strictEqual(rec.evidence.site, 'game.js:8624 Game.hurtVillager');
});
ok('WILD-EXPLICIT: playerDeath called with the literal string', function () {
  const rec = AN.classifyWildDeath(death(100, 'omar_farouk', 'the wild', true),
    pdRow({ causeArg: 'the wild', site: 'game.js:9999 Game.somewhere' }), null);
  assert.strictEqual(rec.class, 'WILD-EXPLICIT');
});
ok('WILD-NON-SCHOLAR: non-scholar wild death from the registerDeath stack', function () {
  const rec = AN.classifyWildDeath(death(100, 'gen_x', 'the wild', false), null, regRow());
  assert.strictEqual(rec.class, 'WILD-NON-SCHOLAR');
  assert.strictEqual(rec.evidence.site, 'game.js:8600 Game.hurtVillager');
});
ok('UNCLASSIFIED: no capture row; scholar with no playerDeath row; inconsistent causeArg', function () {
  const none = AN.classifyWildDeath(death(100, 'gen_x', 'the wild', false), null, null);
  assert.strictEqual(none.class, 'UNCLASSIFIED');
  assert.ok(/no playerDeath row/.test(none.reason));
  const scholarNoPd = AN.classifyWildDeath(death(100, 'gen_x', 'the wild', true), null, regRow({ player: true }));
  assert.strictEqual(scholarNoPd.class, 'UNCLASSIFIED');
  assert.ok(/no playerDeath capture row/.test(scholarNoPd.reason));
  const inconsistent = AN.classifyWildDeath(death(100, 'omar_farouk', 'the wild', true),
    pdRow({ causeArg: 'monster' }), null);
  assert.strictEqual(inconsistent.class, 'UNCLASSIFIED');
  assert.ok(/inconsistent/.test(inconsistent.reason));
  assert.strictEqual(AN.classifyWildDeath(death(100, 'gen_x', 'monster', false), null, null), null,
    'a non-wild death is not a wild death at all');
});

// --- summarizeSeed: veteran join, dominant class, bar counts ---
function snap(day, over) {
  return Object.assign({
    day: day, roster: ['omar_farouk', 'visjoin_136', 'tashi_sherpa', 'gen_x'],
    veteranVids: [], veteranRecount: 0, veteranMismatch: false,
    logW4: [], w4faced: 0, w5faced: 0,
  }, over || {});
}
function seedJson(over) {
  return Object.assign({ seed: 109447, run: 'fixture', days: 150, gameDays: 150,
    endReason: 'survived', won: false, scaleRank: 'regional', maxWave: 5,
    endUnlockedWave: 5, peakBeforeEndCall: 5, peakAfterEndCall: 5, endCallMovedPeak: false,
    endState: { scholarId: 'gen_x', roster: ['omar_farouk', 'visjoin_136', 'tashi_sherpa', 'gen_x'], exiles: [] },
    daily: [], killEvents: [], deathEvents: [], playerDeaths: [], regDeaths: [],
    instrumentErrors: [] }, over || {});
}
function kill(day, by, mid, wave, via) {
  return { day: day, fn: 'recordWaveKill', mid: mid, wave: wave, by: by, via: via || 'wild', entryAdded: true };
}
ok('summarizeSeed: wild veteran death joins to the killer list; non-veteran wild death does not; dominant class named', function () {
  const daily = [];
  for (let d = 1; d <= 150; d++) {
    daily.push(snap(d, {
      veteranVids: d < 138 ? ['omar_farouk'] : (d < 149 ? ['visjoin_136'] : []),
      veteranRecount: d < 149 ? 1 : 0,
      logW4: d < 137
        ? [{ d: 88, mid: 'eater', w: 4, by: 'omar_farouk', via: 'wild' }]
        : [{ d: 88, mid: 'eater', w: 4, by: 'omar_farouk', via: 'wild' },
           { d: 137, mid: 'audit', w: 4, by: 'visjoin_136', via: 'aid-crisis' }],
    }));
  }
  // omar: veteran, wild TB-fight death d138. visjoin: veteran, monster
  // death d149 (not wild). gen_x: NOT a killer, wild death d120 — a
  // wild death but not a veteran wild death.
  const omarPd = tbFightPd({ day: 138 });
  const genxPd = pdRow({ day: 120, where: Object.assign({}, pdRow().where, { scholarId: 'gen_x' }), victimName: 'Gen X' });
  const s = AN.summarizeSeed(seedJson({ daily: daily,
    killEvents: [kill(88, 'omar_farouk', 'eater', 4, 'wild'), kill(137, 'visjoin_136', 'audit', 4, 'aid-crisis')],
    deathEvents: [death(138, 'omar_farouk', 'the wild', true), death(149, 'visjoin_136', 'monster', false),
      death(120, 'gen_x', 'the wild', true)],
    playerDeaths: [omarPd, genxPd],
  }));
  assert.strictEqual(s.killerCount, 2, 'vetpair census re-proven on the fixture');
  assert.deepStrictEqual(s.unclassifiedKillers, []);
  assert.strictEqual(s.wildDeaths.length, 2, 'omar + gen_x');
  assert.strictEqual(s.wildVeteranDeaths.length, 1, 'only omar is a veteran');
  const wv = s.wildVeteranDeaths[0];
  assert.strictEqual(wv.victim, 'omar_farouk');
  assert.strictEqual(wv.class, 'WILD-TB-FIGHT');
  assert.strictEqual(wv.bloodDay, 88);
  assert.strictEqual(wv.aliveAfter, 50);
  assert.deepStrictEqual(wv.evidence.tbMonsterIds, ['eater']);
  assert.deepStrictEqual(s.wildVeteranClassCounts, { 'WILD-TB-FIGHT': 1 });
  assert.strictEqual(s.dominantWildClass, 'WILD-TB-FIGHT');
  assert.strictEqual(s.dominantWildCount, 1);
  assert.strictEqual(s.dominantWildShare, 1);
  assert.deepStrictEqual(s.unclassifiedWildVeteranDeaths, []);
  assert.deepStrictEqual(s.orphanPlayerDeaths, [], 'both playerDeath rows match tele rows');
  const genx = s.wildDeaths.find(function (r) { return r.victim === 'gen_x'; });
  assert.strictEqual(genx.veteran, false);
  assert.strictEqual(genx.class, 'WILD-DEFAULT');
});
ok('summarizeSeed: a wild death before blooding is not a veteran death; unclassified fails bar 1', function () {
  const s = AN.summarizeSeed(seedJson({ daily: [snap(150, { roster: ['early_bird'], veteranVids: [], veteranRecount: 0,
    logW4: [{ d: 100, mid: 'eater', w: 4, by: 'early_bird', via: 'wild' }] })],
    killEvents: [kill(100, 'early_bird', 'eater', 4)],
    // early_bird dies wild on day 50 — BEFORE blooding day 100.
    deathEvents: [death(50, 'early_bird', 'the wild', true)],
    playerDeaths: [],
  }));
  assert.strictEqual(s.wildDeaths.length, 1);
  assert.strictEqual(s.wildVeteranDeaths.length, 0, 'died before earning the title');
  assert.strictEqual(s.unclassifiedWildVeteranDeaths.length, 0, 'not a veteran death at all');
  assert.strictEqual(s.unclassifiedWildDeaths.length, 1, 'but the wild death itself is unclassified');
});
ok('summarizeAll: dominant class pools; TB-fight monsters counted by id and wave', function () {
  const mk = function (seedN, wildClass, mid, wave) {
    const row = (wildClass === 'WILD-TB-FIGHT') ? tbFightPd({ day: 50 }) : pdRow({ day: 50 });
    if (mid) { row.tb.monsterIds = [mid]; row.tb.monsterWaves = [wave]; }
    const vid = 'vet_' + seedN;
    row.where = Object.assign({}, row.where, { scholarId: vid });
    return seedJson({ seed: seedN,
      daily: [snap(150, { roster: [vid], veteranVids: [], veteranRecount: 0,
        logW4: [{ d: 10, mid: 'eater', w: 4, by: vid, via: 'wild' }] })],
      killEvents: [kill(10, vid, 'eater', 4)],
      deathEvents: [death(50, vid, 'the wild', true)],
      playerDeaths: [row] });
  };
  const all = AN.summarizeAll([
    mk(1, 'WILD-TB-FIGHT', 'eater', 4),
    mk(2, 'WILD-TB-FIGHT', 'audit', 4),
    mk(3, 'WILD-DEFAULT', null, null),
  ]);
  assert.strictEqual(all.wildVeteranDeaths, 3);
  assert.strictEqual(all.dominantWildClass, 'WILD-TB-FIGHT');
  assert.strictEqual(all.dominantWildCount, 2);
  assert.strictEqual(all.dominantWildShare, 0.667);
  assert.deepStrictEqual(all.tbFightMonsters, { eater: 1, audit: 1 });
  assert.deepStrictEqual(all.tbFightMonsterWaves, { w4: 2 });
  assert.strictEqual(all.unclassifiedWildVeteranDeaths, 0);
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 109447, mode: 'wilddeath-b-proof', fullTelemetry: false });
  await setupGame(Game);
  assert.strictEqual(typeof Game.playerDeath, 'function', 'playerDeath present before install');
  assert.strictEqual(typeof Game.registerDeath, 'function', 'registerDeath present before install');
  const inst = INST.install(Game);
  try {
    // A live wave-4 kill + a live registerDeath 'the wild' capture
    // for a roster villager (non-scholar backstop path).
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killEvents.length, 1, 'live wave-4 kill event captured');
    Game.say('smoke line before the wild death');
    Game.registerDeath({ villagerId: vid, kind: 'villager', cause: 'the wild', name: 'Smoke Villager' });
    assert.strictEqual(inst.t.regDeaths.length, 1, 'live wild registerDeath captured');
    assert.strictEqual(inst.t.regDeaths[0].who, vid);
    assert.ok(inst.t.regDeaths[0].site && inst.t.regDeaths[0].site.indexOf('test-wilddeath-b-20261124') >= 0,
      'registerDeath stack site names this test file, got: ' + inst.t.regDeaths[0].site);
    // Live playerDeath with NO cause: the ledger.js default path.
    // Stage a fake live fight first so the tb snapshot is exercised.
    const scholarId = Game.villagerId;
    Game.tbfight = { id: 'smoke-f1', over: false, result: null, fighters: [
      { kind: 'player', villagerId: null, alive: false },
      { kind: 'monster', mdef: { id: 'eater' }, alive: true },
    ] };
    let threw = null;
    try { Game.playerDeath(undefined); } catch (e) { threw = e; }
    assert.strictEqual(inst.t.playerDeaths.length, 1, 'live playerDeath row recorded even if the original threw');
    const row = inst.t.playerDeaths[0];
    assert.strictEqual(row.causeArg, '<undefined>', 'the caller passed no cause');
    assert.ok(row.site && row.site.indexOf('test-wilddeath-b-20261124') >= 0,
      'playerDeath stack site names this test file, got: ' + row.site);
    assert.strictEqual(row.hasTbEnd, false, 'called from the test, not from tbEnd');
    assert.strictEqual(row.tb.inTbFight, true, 'fake live fight still readable at playerDeath time');
    assert.deepStrictEqual(row.tb.monsterIds, ['eater']);
    assert.ok(Array.isArray(row.sayTail) && row.sayTail.some(function (x) { return x.line.indexOf('smoke line') >= 0; }),
      'say tail carries the line spoken before the death');
    assert.strictEqual(row.where.scholarId, scholarId);
    // The tele death row exists with cause 'the wild', player true —
    // and the analyzer classifies the scholar's death WILD-DEFAULT.
    assert.ok(inst.t.deathEvents.some(function (e) { return String(e.who) === String(scholarId) && e.cause === 'the wild' && e.player; }),
      'live death tele captured with cause the wild, player true');
    const live = AN.summarizeSeed({ seed: 109447, run: 'smoke', days: 1, gameDays: 1,
      endReason: 'smoke', won: false, scaleRank: 'village', maxWave: 4, endUnlockedWave: 4,
      peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
      endState: { scholarId: scholarId, roster: roster.filter(function (id) { return id !== vid; }), exiles: [] },
      daily: inst.t.daily, killEvents: inst.t.killEvents, feastEvents: inst.t.feastEvents,
      deathEvents: inst.t.deathEvents, standingLines: inst.t.standingLines,
      releaseLines: inst.t.releaseLines, saySample: inst.t.saySample,
      playerDeaths: inst.t.playerDeaths, regDeaths: inst.t.regDeaths,
      instrumentErrors: inst.t.instrumentErrors });
    // The smoke villager blooded AND died wild on day 1, so ITS
    // death is a veteran wild death (WILD-NON-SCHOLAR — a
    // registerDeath row, no playerDeath row); the scholar never
    // blooded, so the scholar's death is wild but not veteran.
    assert.strictEqual(live.killerCount, 1);
    assert.strictEqual(live.wildDeaths.length, 2);
    assert.strictEqual(live.wildVeteranDeaths.length, 1);
    const vetWild = live.wildVeteranDeaths[0];
    assert.strictEqual(vetWild.victim, vid);
    assert.strictEqual(vetWild.class, 'WILD-NON-SCHOLAR');
    assert.strictEqual(vetWild.aliveAfter, 0, 'blooded and died the same day in the smoke');
    assert.strictEqual(live.dominantWildClass, 'WILD-NON-SCHOLAR');
    assert.deepStrictEqual(live.unclassifiedWildDeaths, []);
    assert.deepStrictEqual(live.orphanPlayerDeaths, []);
    assert.deepStrictEqual(live.orphanRegDeaths, []);
    const scholarWild = live.wildDeaths.find(function (r) { return r.victim === scholarId; });
    assert.ok(scholarWild, 'scholar wild death present');
    assert.strictEqual(scholarWild.class, 'WILD-DEFAULT');
    assert.strictEqual(inst.t.instrumentErrors.length, 0,
      'no instrument errors, got: ' + JSON.stringify(inst.t.instrumentErrors));
    if (threw) console.log('note: live playerDeath threw (caught, row still recorded): ' + String(threw.message).slice(0, 100));
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: registerDeath wild capture + playerDeath default path, analyzer WILD-DEFAULT end to end');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('WILDDEATH-B-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('WILDDEATH-B-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
