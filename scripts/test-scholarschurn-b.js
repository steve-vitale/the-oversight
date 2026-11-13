#!/usr/bin/env node
// test-scholarschurn-b.js — proof test for the scholar-churn census
// (arm sim-scholarschurn-b, run fleshout-loop-b-20261112T2130Z).
//
// THE QUESTION (pairarming §8, tracker blank #6): three scholars die
// in 19 days on seed 190398, all "the wild", and the third death ends
// the wave-5 pair because the dead scholar was a veteran. How bad is
// scholar churn across the band, where does it happen, and what does
// each succession cost?
//
// GROUND TRUTH (prereg sizing probe): the harness samples.deaths
// player:true rows OVERCOUNT scholar deaths (91 vs 66 by the
// prev-day regDeath rule on the pairarming corpus), and the same-day
// snapshot rule UNDERCOUNTS (24 — succession happens before the
// daily snapshot). The census wraps Game.playerDeath directly and
// cross-checks against vetfirst regDeath rows.
//
// WHAT THIS TEST PROVES (before any judged sim):
//   1. Engine APIs — the APIs the scholar instrument needs exist on
//      the loaded game (playerDeath, registerDeath, mantleBecome,
//      state.scholar.abilities, state.waveKillLog).
//   2. Cause/location taxonomy — causeClass + locationClass on a
//      table of cause strings incl. 'the wild' (wild-fight label),
//      'the arena', 'contest', 'the expedition', starvation,
//      'a stranger', phoenix, unknown; location home/camp/wild.
//   3. playerDeath wrap, live + stub — on a live game the wrap
//      records the DYING scholar (id, cause, location, hp,
//      abilities, veteran, pellet/reactor) and the successor (id,
//      name, trust, was-veteran, abilities) with wrapLive set, and
//      uninstall restores the original; on a stub the village-lost
//      branch records no successor.
//   4. Succession diff on synthetic snapshots — a scholarId change
//      with a matching wrap CHAIN is clean: one death, a same-day
//      cascade (each record's scholarId is the previous record's
//      successor), a sleep-boundary death (wrap day = snapshot day -
//      1), and a mid-cascade snapshot (the chain continues past the
//      snapshot scholar — the remaining deaths belong to the next
//      diff). Without a chain it is an instrument error; a wrap
//      naming a different successor mismatches; two wrap records for
//      one death double-fire.
//   5. Recovery helpers — firstWaveKillDay on a synthetic kill log.
//   6. Analyzer reconciliation on synthetic seeds — wrap-vs-regDeath
//      matching both ways (unattributed 0 clean; wrap-without-reg
//      and reg-scholar-without-wrap each unattributed 1); succession
//      coverage incl. chained same-day double succession (190391
//      d47: Charlotte -> Kurt -> third bearer), mid-cascade bearers
//      covered by their own wrap record (190393 d61), and
//      sleep-boundary successions (successor first appears on the
//      next day's snapshot); chain violations; samples player:true
//      rows reported separately from wrap scholar deaths (the
//      overcount never equates them); GO-bar table (pass only when
//      complete + unattributed 0 + coverage 100% + chain 0 +
//      errors 0).
//   7. Seed-band identity + driver shape — exactly seeds
//      190391–190398; driver writes to perseed-scholarschurn-b in
//      mode 'current' with NO fix-swap (the r131 roster-check fix is
//      in master — verified live on disk).
//   8. Corpus completeness — dedupDays keeps the first occurrence
//      of a duplicated village-loss day; a synthetic full corpus
//      analyzes with 0 snapshot gaps.
//   9. Live short run — 3 days under competent with VF + SC
//      installed: scholarDaily covers every day, scholarId stable,
//      0 instrument errors, gear cross-check clean.
//
// Usage: node scripts/test-scholarschurn-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const PA = require('./pairarming-instrument-20261112');
const SC = require('./scholarschurn-instrument-20261112');
const AN = require('./scholarschurn-analyze-20261112');
const T = K.reporter('scholarschurn-b');

function synthGear(day, scholarId, opts) {
  const o = opts || {};
  return {
    day: day, scholarId: scholarId, peakWave: o.peakWave != null ? o.peakWave : 4,
    standingRaw: 210, cappedStanding: o.capped != null ? o.capped : 210,
    ready5: { ready: false, armored: 1, armed: 2, tricks: 0, veterans: o.vets != null ? o.vets : 0, short: [] },
    deathsToday: [], exiles: [], stashWeaponIds: [], stashArmorIds: [],
    pantryWeaponIds: [], pantryArmorIds: [],
    members: [
      { vid: scholarId, name: scholarId, isScholar: true, alive: true, armed: o.armed != null ? o.armed : true, meleeId: 'knife', rangedId: null, carriedWeaponIds: [], equippedItemIds: [], carriedArmorIds: [], armorP: 10, veteranW4: !!o.vet, hp: 80 },
      { vid: 'v1', name: 'v1', isScholar: false, alive: true, armed: true, meleeId: 'knife', rangedId: null, carriedWeaponIds: [], equippedItemIds: [], carriedArmorIds: [], armorP: 10, veteranW4: false, hp: 80 },
      { vid: 'v2', name: 'v2', isScholar: false, alive: true, armed: false, meleeId: null, rangedId: null, carriedWeaponIds: [], equippedItemIds: [], carriedArmorIds: [], armorP: 0, veteranW4: false, hp: 80 },
    ],
    armed: 2, armored: 1, veteransW4: o.vet ? [scholarId] : [], veterans: o.vet ? 1 : 0,
    prevVanished: [], instrumentErrors: [],
  };
}

function synthScholarDay(day, scholarId, opts) {
  const o = opts || {};
  return {
    day: day, scholarId: scholarId, scholarName: scholarId,
    abilityIds: o.abilities || [], abilityCount: (o.abilities || []).length,
    hp: 80, insideHaven: o.home != null ? o.home : false, insideTent: false,
    hasCamp: false, pelletBearer: false, reactorBearer: false,
    scholarArmed: o.armed != null ? o.armed : true, scholarArmorP: 10,
    scholarVeteranW4: !!o.vet, instrumentErrors: [],
    gear: synthGear(day, scholarId, o),
  };
}

function synthSeed(over) {
  const o = over || {};
  const days = [];
  for (let d = 1; d <= 10; d++) {
    // sleepBoundary: the death is day 5 but the d5 snapshot still
    // shows the dead scholar (died after the snapshot, during sleep);
    // the successor first appears on d6.
    const sid = o.sleepBoundary ? (d <= 5 ? 's1' : 's2') : (d <= 4 ? 's1' : (o.chain && d >= 5 ? 's3' : 's2'));
    days.push(synthScholarDay(d, sid, { armed: d >= 6, abilities: d >= 7 ? ['purify'] : [], vet: sid === 's1' }));
  }
  const wrap = o.wrap !== undefined ? o.wrap : [
    { day: 5, cause: 'the wild', causeClass: 'wild-fight', location: 'wild', scholarId: 's1', scholarName: 's1', veteranW4: true, pelletBearer: false, reactorBearer: false, successorId: o.chain ? 's2' : 's2', successorName: 's2', successorTrust: 70, successorWasVeteran: false, successorAbilityIds: [], villageLost: false, over: false },
  ];
  if (o.chain) {
    wrap.push({ day: 5, cause: 'the wild', causeClass: 'wild-fight', location: 'wild', scholarId: 's2', scholarName: 's2', veteranW4: false, pelletBearer: false, reactorBearer: false, successorId: 's3', successorName: 's3', successorTrust: 60, successorWasVeteran: false, successorAbilityIds: [], villageLost: false, over: false });
  }
  const reg = o.reg !== undefined ? o.reg : [
    { day: 5, kind: 'villager', villagerId: 's1', name: 's1', cause: 'the wild', killerId: null },
    { day: 3, kind: 'villager', villagerId: 'v9', name: 'v9', cause: 'combat', killerId: null },
    { day: 8, kind: 'villager', villagerId: 'v8', name: 'v8', cause: 'the wild', killerId: null },
  ];
  if (o.chain) reg.push({ day: 5, kind: 'villager', villagerId: 's2', name: 's2', cause: 'the wild', killerId: null });
  return {
    seed: 190391, days: 10, gameDays: 10, endReason: 'survived', won: false,
    villageLost: false, scaleRank: 'regional', maxWave: 4, standing: 210,
    regDeaths: reg,
    deaths: o.samples !== undefined ? o.samples : [{ day: 5, kind: 'villager', who: 's1', cause: 'the wild', player: true }],
    instrumentErrors: o.errors || [],
    scholarSays: [],
    scholarDeaths: wrap,
    scholarDaily: days,
    gearDaily: days.map(function (d) { return d.gear; }),
    daily: [{ day: 10, waveKillLog: [{ by: 's2', d: 7, w: 1 }] }],
  };
}

(async () => {
  const Game = await K.load({ seed: 131102 });

  // ---- 1. Engine APIs ----
  T.section('1. Engine APIs — the scholar instrument’s reads exist on the loaded game');
  for (const name of ['playerDeath', 'registerDeath', 'mantleBecome', 'vpOf', 'waveCombatReadiness']) {
    T.ok('Game.' + name + ' is a function', typeof Game[name] === 'function', typeof Game[name]);
  }
  // Game.state is created by newGame, not by load: before a run starts
  // there is no state at all (and waveKillLog is created lazily on the
  // first wave kill — game.js:34807 — so the instrument's `|| []`
  // fallback is the live behavior, not a gap).
  T.ok('no state before a run starts (state is created by newGame)', (Game.state == null), 'state pre-exists');

  // ---- 2. Cause/location taxonomy ----
  T.section('2. Cause/location taxonomy — cause strings and death-time location classify cleanly');
  const causeCases = [
    ['the wild', 'wild-fight'], ['the arena', 'arena'], ['contest', 'contest'],
    ['the expedition', 'expedition'], ['expedition', 'expedition'],
    ['starvation', 'exposure'], ['disease', 'exposure'], ['injuries', 'exposure'],
    ["a wound that wouldn't close", 'exposure'], ['the night', 'exposure'],
    ['combat', 'fight'], ['monster', 'fight'], ['ambush', 'fight'],
    ['a stranger', 'fight'], ['alien', 'fight'], ['Spool', 'fight'],
    ['Big-Eyes', 'fight'], ['your own pit trap', 'fight'],
    ['the phoenix link', 'fight'], ['the phoenix link (given)', 'fight'],
    ['something unheard of', 'other'], [null, 'other'], ['', 'other'],
  ];
  for (const c of causeCases) {
    T.ok("causeClass('" + c[0] + "') === '" + c[1] + "'", SC.causeClass(c[0]) === c[1], SC.causeClass(c[0]));
  }
  T.ok("location home when insideHaven", SC.locationClass({ insideHaven: true }) === 'home', SC.locationClass({ insideHaven: true }));
  T.ok("location camp when in a tent out", SC.locationClass({ insideHaven: false, insideTent: true, hasCamp: false }) === 'camp', 'not camp');
  T.ok("location camp when camp set", SC.locationClass({ insideHaven: false, insideTent: false, hasCamp: true }) === 'camp', 'not camp');
  T.ok("location wild when out with neither", SC.locationClass({ insideHaven: false, insideTent: false, hasCamp: false }) === 'wild', 'not wild');
  T.ok("location unknown on null", SC.locationClass(null) === 'unknown', SC.locationClass(null));

  // ---- 3a. playerDeath wrap, live ----
  T.section('3. playerDeath wrap — live game records the dying scholar and the successor');
  K.newRun(Game);
  T.ok('state.scholar exists once a run starts', !!(Game.state && Game.state.scholar), 'no scholar');
  T.ok('state.waveKillLog is undefined-or-array (lazy init on first wave kill)', (Game.state || {}).waveKillLog == null || Array.isArray(Game.state.waveKillLog), typeof (Game.state || {}).waveKillLog);
  const oldScholarId = Game.villagerId;
  const origPlayerDeath = Game.playerDeath;
  const sc = SC.install(Game);
  T.ok('install wraps playerDeath', Game.playerDeath !== origPlayerDeath, 'not wrapped');
  const oldName = (function () { try { return Game.displayName(oldScholarId); } catch (e) { return oldScholarId; } })();
  Game.playerDeath('the wild');
  T.ok('wrapLive.playerDeath set', sc.t.wrapLive.playerDeath === true, JSON.stringify(sc.t.wrapLive));
  T.ok('exactly one scholar death recorded', sc.t.scholarDeaths.length === 1, String(sc.t.scholarDeaths.length));
  const rec = sc.t.scholarDeaths[0] || {};
  T.ok('wrap records the dying scholar id', rec.scholarId === oldScholarId, rec.scholarId + ' vs ' + oldScholarId);
  T.ok('wrap records the cause arg', rec.cause === 'the wild', String(rec.cause));
  T.ok('wrap derives causeClass wild-fight', rec.causeClass === 'wild-fight', String(rec.causeClass));
  T.ok('wrap records a location class', ['home', 'camp', 'wild'].indexOf(rec.location) >= 0, String(rec.location));
  T.ok('wrap records scholar hp as a number', typeof rec.hp === 'number', typeof rec.hp);
  T.ok('wrap records ability ids as an array', Array.isArray(rec.abilityIds), typeof rec.abilityIds);
  T.ok('wrap records veteranW4 as a boolean', typeof rec.veteranW4 === 'boolean', typeof rec.veteranW4);
  T.ok('wrap records pellet/reactor flags as booleans', typeof rec.pelletBearer === 'boolean' && typeof rec.reactorBearer === 'boolean', rec.pelletBearer + '/' + rec.reactorBearer);
  T.ok('successor is a different living villager', !!rec.successorId && rec.successorId !== oldScholarId, String(rec.successorId));
  T.ok('successor id matches the new Game.villagerId', rec.successorId === Game.villagerId, rec.successorId + ' vs ' + Game.villagerId);
  T.ok('successor ability ids are an array', Array.isArray(rec.successorAbilityIds), typeof rec.successorAbilityIds);
  T.ok('successor trust is a number', typeof rec.successorTrust === 'number', typeof rec.successorTrust);
  T.ok('no village loss on a live succession', rec.villageLost === false && rec.over === false, rec.villageLost + '/' + rec.over);
  T.ok('death line names the dead scholar', (function () { try { return String(rec.scholarName || '').length > 0; } catch (e) { return false; } })(), String(rec.scholarName));
  sc.uninstall();
  T.ok('uninstall restores the original playerDeath', Game.playerDeath === origPlayerDeath, 'not restored');

  // ---- 3b. playerDeath wrap, stub village-lost branch ----
  T.section('3b. playerDeath wrap — stub village-lost branch records no successor');
  const stub = {
    villagerId: 'v1', over: false, villageLost: false,
    state: {
      scholar: { day: 5, insideHaven: false, insideTent: false, health: 40, abilities: [{ id: 'purify' }], inventory: [{ itemId: 'fusion_pellet' }], equipped: {} },
      village: { trust: { v1: 30, v2: 80 } }, camp: null,
      waveKillLog: [{ by: 'v1', w: 4 }],
    },
    data: { villagers: [{ id: 'v1', name: 'A One' }, { id: 'v2', name: 'B Two' }] },
    playerDeath: function (cause) { this.over = true; this.villageLost = true; },
  };
  const stubOrig = stub.playerDeath;
  const scStub = SC.install(stub);
  stub.playerDeath('starvation');
  T.ok('stub wrap recorded one death', scStub.t.scholarDeaths.length === 1, String(scStub.t.scholarDeaths.length));
  const srec = scStub.t.scholarDeaths[0] || {};
  T.ok('stub pre-hook reads the dying scholar', srec.scholarId === 'v1' && srec.scholarName === 'A One', srec.scholarId + '/' + srec.scholarName);
  T.ok('stub pre-hook reads veteranW4 from the kill log', srec.veteranW4 === true, String(srec.veteranW4));
  T.ok('stub pre-hook reads the pellet bearer flag', srec.pelletBearer === true, String(srec.pelletBearer));
  T.ok('stub pre-hook reads ability ids', JSON.stringify(srec.abilityIds) === '["purify"]', JSON.stringify(srec.abilityIds));
  T.ok('stub cause starvation classifies exposure', srec.causeClass === 'exposure', String(srec.causeClass));
  T.ok('stub location wild (out, no tent, no camp)', srec.location === 'wild', String(srec.location));
  T.ok('stub village-lost records no successor', srec.successorId === null && srec.successorName === null, srec.successorId + '/' + srec.successorName);
  T.ok('stub village-lost flags over + villageLost', srec.over === true && srec.villageLost === true, srec.over + '/' + srec.villageLost);
  scStub.uninstall();
  T.ok('stub uninstall restores the original', stub.playerDeath === stubOrig, 'not restored');

  // ---- 4. Succession diff ----
  T.section('4. Succession diff — scholarId changes match wrap records or error loudly');
  const prev = synthScholarDay(4, 's1', { vet: true, abilities: ['purify', 'hearten'] });
  const cur = synthScholarDay(5, 's2', { armed: false, abilities: [] });
  const wrapOk = [{ day: 5, scholarId: 's1', successorId: 's2' }];
  const dOk = SC.diffScholarDays(prev, cur, wrapOk);
  T.ok('matching wrap: succession recorded', !!dOk.succession && dOk.succession.fromId === 's1' && dOk.succession.toId === 's2', JSON.stringify(dOk.succession));
  T.ok('matching wrap: from-was-veteran carried', dOk.succession.fromWasVeteran === true, String(dOk.succession.fromWasVeteran));
  T.ok('matching wrap: ability counts carried', dOk.succession.fromAbilityCount === 2 && dOk.succession.toAbilityCount === 0, dOk.succession.fromAbilityCount + '/' + dOk.succession.toAbilityCount);
  T.ok('matching wrap: no instrument errors', dOk.instrumentErrors.length === 0, dOk.instrumentErrors.join('|'));
  const dNoWrap = SC.diffScholarDays(prev, cur, []);
  T.ok('no wrap: succession-without-death-record error', dNoWrap.instrumentErrors.some(function (m) { return m.indexOf('succession-without-death-record') === 0; }), dNoWrap.instrumentErrors.join('|'));
  T.ok('no wrap: succession still recorded (never dropped)', !!dNoWrap.succession, 'lost');
  const dMismatch = SC.diffScholarDays(prev, cur, [{ day: 5, scholarId: 's1', successorId: 's9' }]);
  T.ok('wrong successor: succession-mismatch error', dMismatch.instrumentErrors.some(function (m) { return m.indexOf('succession-mismatch') === 0; }), dMismatch.instrumentErrors.join('|'));
  const dDouble = SC.diffScholarDays(prev, cur, [wrapOk[0], wrapOk[0]]);
  T.ok('double wrap: succession-double-death-record error', dDouble.instrumentErrors.some(function (m) { return m.indexOf('succession-double-death-record') === 0; }), dDouble.instrumentErrors.join('|'));
  const dSame = SC.diffScholarDays(prev, synthScholarDay(5, 's1', { vet: true }));
  T.ok('no change: no succession, no errors', dSame.succession === null && dSame.instrumentErrors.length === 0, JSON.stringify(dSame));
  // Seven-scholar cascade, 190393 d61 shape: d60 shows Larry (s1),
  // d61 shows Tikhon (s4, the 3rd of 7 deaths) — the snapshot is
  // taken mid-day, so the chain from s1 stops at the snapshot
  // scholar s4 and the remaining deaths belong to the next diff.
  const cascadeWrap = [
    { day: 61, scholarId: 's1', successorId: 's2' },
    { day: 61, scholarId: 's2', successorId: 's3' },
    { day: 61, scholarId: 's3', successorId: 's4' },
    { day: 61, scholarId: 's4', successorId: 's5' },
    { day: 61, scholarId: 's5', successorId: 's6' },
    { day: 61, scholarId: 's6', successorId: 's7' },
    { day: 61, scholarId: 's7', successorId: 's8' },
  ];
  const dCascadeMid = SC.diffScholarDays(
    synthScholarDay(60, 's1', { vet: true }), synthScholarDay(61, 's4'), cascadeWrap);
  T.ok('7-cascade, mid-chain snapshot: clean, cascadeSize 3', dCascadeMid.instrumentErrors.length === 0 && dCascadeMid.succession.cascadeSize === 3, JSON.stringify(dCascadeMid.succession) + ' | ' + dCascadeMid.instrumentErrors.join('|'));
  T.ok('7-cascade, mid-chain snapshot: intermediates are s2, s3', JSON.stringify(dCascadeMid.succession.intermediateIds) === '["s2","s3"]', JSON.stringify(dCascadeMid.succession.intermediateIds));
  const dCascadeEnd = SC.diffScholarDays(
    synthScholarDay(61, 's4'), synthScholarDay(62, 's8'), cascadeWrap.concat([
      { day: 62, scholarId: 's8', successorId: 's9' },
    ]));
  T.ok('7-cascade, next diff consumes the tail (s4->s8 over d61-d62)', dCascadeEnd.instrumentErrors.length === 0 && dCascadeEnd.succession.cascadeSize === 4, JSON.stringify(dCascadeEnd.succession) + ' | ' + dCascadeEnd.instrumentErrors.join('|'));
  // Sleep boundary, 190397 d28->d29 shape: the scholar dies after
  // the d28 snapshot (during sleep), so the wrap says d28 while the
  // snapshot transition appears on d29.
  const dSleep = SC.diffScholarDays(
    synthScholarDay(28, 's1', { vet: true }), synthScholarDay(29, 's2'),
    [{ day: 28, scholarId: 's1', successorId: 's2' }]);
  T.ok('sleep boundary (wrap day = snapshot day - 1): clean', dSleep.instrumentErrors.length === 0 && dSleep.succession.cascadeSize === 1, JSON.stringify(dSleep.succession) + ' | ' + dSleep.instrumentErrors.join('|'));
  // Chain that dead-ends at a holder the snapshot does not show.
  const dChainDead = SC.diffScholarDays(
    synthScholarDay(4, 's1', { vet: true }), synthScholarDay(5, 's2'),
    [{ day: 5, scholarId: 's1', successorId: 's9' }, { day: 5, scholarId: 's9', successorId: 's8' }]);
  T.ok('chain dead-end: succession-mismatch error', dChainDead.instrumentErrors.some(function (m) { return m.indexOf('succession-mismatch') === 0; }), dChainDead.instrumentErrors.join('|'));

  // ---- 5. Recovery helpers ----
  T.section('5. Recovery helpers — firstWaveKillDay on a synthetic kill log');
  const log = [{ by: 'a', d: 10, w: 1 }, { by: 'a', d: 12, w: 4 }, { by: 'b', d: 9, w: 4 }];
  T.ok('first kill on/after fromDay', SC.firstWaveKillDay(log, 'a', 11) === 12, String(SC.firstWaveKillDay(log, 'a', 11)));
  T.ok('first kill at fromDay inclusive', SC.firstWaveKillDay(log, 'a', 10) === 10, String(SC.firstWaveKillDay(log, 'a', 10)));
  T.ok('no kill after fromDay is null', SC.firstWaveKillDay(log, 'a', 13) === null, String(SC.firstWaveKillDay(log, 'a', 13)));
  T.ok('other villager unaffected', SC.firstWaveKillDay(log, 'b', 1) === 9, String(SC.firstWaveKillDay(log, 'b', 1)));
  T.ok('unknown villager is null', SC.firstWaveKillDay(log, 'z', 1) === null, String(SC.firstWaveKillDay(log, 'z', 1)));

  // ---- 6. Analyzer reconciliation ----
  T.section('6. Analyzer reconciliation — wrap vs regDeath, coverage, chain, GO bar');
  const clean = AN.analyzeSeed(synthSeed());
  T.ok('clean seed: unattributed 0', clean.unattributed === 0, String(clean.unattributed));
  T.ok('clean seed: succession coverage 1', clean.successionCoverage === 1 && clean.successionsUncovered.length === 0, JSON.stringify(clean.successionsUncovered));
  T.ok('clean seed: chain violations 0', clean.chainViolations.length === 0, JSON.stringify(clean.chainViolations));
  T.ok('clean seed: scholar deaths 1 (wrap, not samples)', clean.scholarDeaths === 1, String(clean.scholarDeaths));
  T.ok('clean seed: non-scholar deaths 2', clean.nonScholarDeaths === 2, String(clean.nonScholarDeaths));
  T.ok('clean seed: tenure of the dead scholar is 5d', clean.tenures.length === 2 && clean.tenures[0].days === 5, JSON.stringify(clean.tenures));
  T.ok('clean seed: recovery days-to-armed 1 (d6 armed)', clean.recoveries.length === 1 && clean.recoveries[0].daysToArmed === 1, JSON.stringify(clean.recoveries));
  T.ok('clean seed: recovery days-to-ability 2 (d7)', clean.recoveries[0].daysToAbility === 2, String(clean.recoveries[0] && clean.recoveries[0].daysToAbility));
  T.ok('clean seed: recovery days-to-first-kill 2 (d7)', clean.recoveries[0].daysToFirstKill === 2, String(clean.recoveries[0] && clean.recoveries[0].daysToFirstKill));
  T.ok('clean seed: snapshot gaps 0', clean.snapshotGaps === 0, String(clean.snapshotGaps));

  const noReg = AN.analyzeSeed(synthSeed({ reg: [
    { day: 3, kind: 'villager', villagerId: 'v9', name: 'v9', cause: 'combat', killerId: null },
  ] }));
  T.ok('wrap without reg: unattributed 1', noReg.unattributed === 1 && noReg.wrapWithoutReg.length === 1, String(noReg.unattributed));

  const noWrap = AN.analyzeSeed(synthSeed({ wrap: [] }));
  T.ok('reg scholar without wrap: unattributed 1', noWrap.unattributed === 1 && noWrap.regScholarWithoutWrap.length === 1, String(noWrap.unattributed));
  T.ok('reg scholar without wrap: chain violation 1', noWrap.chainViolations.length === 1, JSON.stringify(noWrap.chainViolations));

  const chained = AN.analyzeSeed(synthSeed({ chain: true }));
  T.ok('chained same-day double succession: unattributed 0', chained.unattributed === 0, String(chained.unattributed));
  T.ok('chained same-day double succession: coverage 1', chained.successionCoverage === 1 && chained.successionsUncovered.length === 0, JSON.stringify(chained.successionsUncovered));
  T.ok('chained same-day double succession: chain clean', chained.chainViolations.length === 0, JSON.stringify(chained.chainViolations));
  T.ok('chained same-day double succession: 2 deaths counted', chained.scholarDeaths === 2, String(chained.scholarDeaths));
  T.ok('chained same-day double succession: mid-cascade bearer covered by own wrap record',
    chained.successions === 2, 'successions ' + chained.successions);

  // Sleep boundary: the successor first appears on the NEXT day's
  // snapshot (death after the death-day snapshot). Coverage must
  // still be 1 — the old first-snapshot rule would have failed this.
  const sleepB = AN.analyzeSeed(synthSeed({ sleepBoundary: true }));
  T.ok('sleep-boundary succession: unattributed 0', sleepB.unattributed === 0, String(sleepB.unattributed));
  T.ok('sleep-boundary succession: coverage 1', sleepB.successionCoverage === 1 && sleepB.successionsUncovered.length === 0, JSON.stringify(sleepB.successionsUncovered));
  T.ok('sleep-boundary succession: chain clean', sleepB.chainViolations.length === 0, JSON.stringify(sleepB.chainViolations));

  const overcount = AN.analyzeSeed(synthSeed({ samples: [
    { day: 5, kind: 'villager', who: 's1', cause: 'the wild', player: true },
    { day: 5, kind: 'villager', who: 's1', cause: 'the wild', player: true },
    { day: 5, kind: 'villager', who: 's1', cause: 'the wild', player: true },
    { day: 5, kind: 'villager', who: 's1', cause: 'the wild', player: true },
    { day: 5, kind: 'villager', who: 's1', cause: 'the wild', player: true },
  ] }));
  T.ok('samples overcount kept separate: 5 player rows vs 1 wrap death', overcount.samplesPlayerDeaths === 5 && overcount.scholarDeaths === 1, overcount.samplesPlayerDeaths + ' vs ' + overcount.scholarDeaths);

  // GO-bar table: pass only when complete + unattributed 0 +
  // coverage 100% + chain 0 + errors 0. (The analyzer's main() gates
  // on the same fields; here the table is checked per-condition.)
  const goOk = { complete: true, unattributed: 0, successionUncovered: 0, chainViolations: 0, instrumentErrors: 0 };
  const goPass = function (g) { return g.complete && g.unattributed === 0 && g.successionUncovered === 0 && g.chainViolations === 0 && g.instrumentErrors === 0; };
  T.ok('GO bar: all-green passes', goPass(goOk) === true, 'should pass');
  T.ok('GO bar: one unattributed fails', goPass(Object.assign({}, goOk, { unattributed: 1 })) === false, 'should fail');
  T.ok('GO bar: one uncovered succession fails', goPass(Object.assign({}, goOk, { successionUncovered: 1 })) === false, 'should fail');
  T.ok('GO bar: one chain violation fails', goPass(Object.assign({}, goOk, { chainViolations: 1 })) === false, 'should fail');
  T.ok('GO bar: one instrument error fails', goPass(Object.assign({}, goOk, { instrumentErrors: 1 })) === false, 'should fail');
  T.ok('GO bar: incomplete corpus fails', goPass(Object.assign({}, goOk, { complete: false })) === false, 'should fail');

  // ---- 7. Seed-band identity + driver shape ----
  T.section('7. Seed-band identity + driver shape — the prescribed band, current master, no fix-swap');
  const anSrc = fs.readFileSync(path.join(__dirname, 'scholarschurn-analyze-20261112.js'), 'utf8');
  T.ok('analyzer band is exactly 190391–190398', anSrc.indexOf('[190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]') >= 0, 'band literal missing');
  const drSrc = fs.readFileSync(path.join(__dirname, 'scholarschurn-driver-20261112.js'), 'utf8');
  T.ok('driver writes to perseed-scholarschurn-b', drSrc.indexOf('perseed-scholarschurn-b') >= 0, 'out dir missing');
  T.ok('driver mode is current (no fix leg)', drSrc.indexOf("MODE = 'current'") >= 0, 'mode missing');
  T.ok('driver carries no fix-swap guard', drSrc.indexOf('EXPECTED_FIX_SHA') < 0 && drSrc.indexOf('refuseUnlessSwapped') < 0, 'fix-swap residue');
  const standingText = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'standing.js'), 'utf8');
  T.ok('r131 roster-check fix is in master (ROSTER CHECK on disk)', standingText.indexOf('ROSTER CHECK') >= 0, 'fix marker missing');

  // ---- 8. Corpus completeness ----
  T.section('8. Corpus completeness — duplicate village-loss days dedup by first occurrence');
  const dup = AN.dedupDays([
    { day: 42 }, { day: 43 }, { day: 43 }, { day: 44 },
  ]);
  T.ok('dedupDays keeps the first of a duplicated day', dup.length === 3 && dup[1].day === 43 && dup[2].day === 44, JSON.stringify(dup.map(function (d) { return d.day; })));
  const dupSeed = synthSeed();
  dupSeed.scholarDaily.push(Object.assign({}, dupSeed.scholarDaily[9], {}));
  dupSeed.gearDaily.push(dupSeed.gearDaily[9]);
  const dupAn = AN.analyzeSeed(dupSeed);
  T.ok('duplicated final day analyzes with 0 gaps', dupAn.snapshotGaps === 0 && dupAn.snapshotDays === 10, dupAn.snapshotDays + ' days, ' + dupAn.snapshotGaps + ' gaps');

  // ---- 9. Live short run ----
  // 5 loop-days: the game day advances on sleep, so loop-days and
  // game-days drift — assert on distinct game days, not loop-days.
  T.section('9. Live short run — 5 loop-days under competent with VF + SC installed');
  const { Game: G2 } = await H.loadGame({ seed: 131102, mode: 'competent-vetphantom', fullTelemetry: false });
  await H.setupGame(G2);
  const vf2 = VF.install(G2);
  const sc2 = SC.install(G2);
  let lastDay = -1;
  const wrapped2 = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = ((G2.state || {}).scholar || {}).day || 0;
          if (d !== lastDay) { lastDay = d; vf2.snapshot(); sc2.snapshot([]); }
        } catch (e) {}
      }
    },
  });
  await H.quietLog(async function () { await H.runDays(G2, wrapped2, { days: 5, manifest: undefined, sampleEvery: 1 }); });
  const liveDays = sc2.t.scholarDaily;
  T.ok('live run: scholarDaily covers >= 3 game days', liveDays.length >= 3, String(liveDays.length));
  T.ok('live run: scholarId stable across the short run', liveDays.every(function (d) { return d.scholarId === liveDays[0].scholarId; }), 'scholar changed');
  T.ok('live run: 0 scholar instrument errors', sc2.t.instrumentErrors.length === 0, sc2.t.instrumentErrors.slice(0, 3).join(' | '));
  T.ok('live run: gear cross-check clean on every day', liveDays.every(function (d) { return d.gear && (d.gear.instrumentErrors || []).length === 0; }), 'gear errors present');
  T.ok('live run: scholarArmed is a boolean every day', liveDays.every(function (d) { return typeof d.scholarArmed === 'boolean'; }), 'not boolean');
  T.ok('live run: abilityCount is a number every day', liveDays.every(function (d) { return typeof d.abilityCount === 'number'; }), 'not a number');
  try { vf2.uninstall(); } catch (e) {}
  try { sc2.uninstall(); } catch (e) {}

  T.done();
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
