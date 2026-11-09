#!/usr/bin/env node
// OVE-152 — Between runner army lean via aidPartsFor / aidSendRunner.
//
// god.scale.army: "The coalition's runner between camps."
// Settlement: aidPartsFor / aidSendRunner honor Game.betweenRunnerLeanFor when
// an ascended Between holder is active — fewer travel day-parts (floor 1).
// Seeded proof + failing control that strips the helper. Preserves Between
// chase contest lean + prior army leans. Does NOT re-label Voice Be Heard
// broadcast or retune Phase Out kcal / minFrac / retreat. Muse off.
'use strict';
const K = require('./lib');
const T = K.reporter('between-runner-army-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 152) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const quiet = (fn) => { const l = K.captureSays(Game); try { return fn(); } finally { l.restore(); } };
  function clearGods() { s.godhood = { recognized: {}, active: [] }; v.npcGodhood = {}; }
  function ascendPlayer(id) {
    s.godhood = { recognized: {}, active: [] };
    quiet(() => GH.recognitionCeremony(Game, id));
    return Game.holderGod('player');
  }
  function ascendVillager(vid, id) {
    Game.getPerson(vid).dead = false;
    if (!v.roster.includes(vid)) v.roster.push(vid);
    (v.health || (v.health = {}))[vid] = 100;
    v.npcGodhood = v.npcGodhood || {};
    delete v.npcGodhood[vid];
    quiet(() => GH.villagerRecognitionCeremony(Game, vid, id));
    return Game.holderGod(vid);
  }

  const play = Game.godPlay('the_between') || {};
  const leanVal = (typeof play.runnerLean === 'number' && play.runnerLean > 0)
    ? play.runnerLean : 1;
  const phase = play.passive || {};
  const others = (v.roster || []).filter(id => id !== Game.villagerId);
  const runnerId = others[0];
  T.ok('roster supplies a runner candidate', !!runnerId, others.length);

  const ovs = (Game.state.otherVillages || []).filter(ov => ov && ov.id && ov.id !== 'haven');
  T.ok('newRun supplies a foreign village', ovs.length >= 1, ovs.length);
  // Pin a far camp so base travel parts > lean (ceil(dist/3) >= 2).
  const camp = ovs[0];
  camp.x = 0;
  camp.y = 0;
  camp.generated = true;
  camp.rumored = true;
  camp.crisis = null;

  function basePartsRaw() {
    // Mirror aidPartsFor without lean so CONTROL/TREATMENT share one ground truth.
    const dist = Game.aidDistance(camp.id);
    return Math.max(1, Math.ceil(dist / 3));
  }

  function linkCamp(trust) {
    quiet(() => Game._formLink(camp.id, {}, null));
    const link = Game.linkWith(camp.id);
    T.ok('link to far camp exists', !!link);
    if (link) {
      link.trust = trust != null ? trust : 70;
      link.aidDebtKcal = 0;
    }
    return link;
  }

  function resetRoad() {
    clearGods();
    Game.state.aidCrisis = null;
    Game.state.aidRunners = [];
    Game.state.pendingHelp = [];
    s.day = 20;
    s.health = Game.maxHealth();
    s.kcal = 2000;
    Game.state.over = false;
    Game.state.networkLive = true;
    if (runnerId) {
      Game.getPerson(runnerId).dead = false;
      if (!v.roster.includes(runnerId)) v.roster.push(runnerId);
      (v.health || (v.health = {}))[runnerId] = 100;
    }
    linkCamp(70);
  }

  function raiseCrisis() {
    return quiet(() => Game.raiseAidCrisis('Between Road Hushwolf', 1));
  }

  // Safe road tape: wave-1 danger = 0.14; first roll >= 0.14 skips mishap.
  function sendSafeRunner() {
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    const origRandom = Math.random;
    let result = null;
    try {
      Math.random = () => 0.99;
      result = Game.aidSendRunner({ runnerId: runnerId, targetId: camp.id });
    } finally {
      Math.random = origRandom;
      Game.say = osay;
    }
    const rn = (Game.state.aidRunners || []).find(r => r.vid === runnerId) || null;
    return { result, said, rn, parts: Game.aidPartsFor(camp.id) };
  }

  const raw = basePartsRaw();
  T.ok('far camp base travel parts >= 2 (lean can bite)', raw >= 2, raw);
  const expectedLeanParts = Math.max(1, raw - leanVal);

  T.section('data + wiring');
  {
    clearGods();
    T.ok('betweenRunnerLeanFor is exported', typeof Game.betweenRunnerLeanFor === 'function');
    T.ok('play.runnerLean is a positive number', typeof play.runnerLean === 'number' && play.runnerLean > 0,
      play.runnerLean);
    T.ok('chase contest keys still listed', Array.isArray(play.chaseContests)
      && play.chaseContests.includes('hide') && play.chaseContests.includes('calorie_run'));
    T.ok('contestLean still present', typeof play.contestLean === 'number' && play.contestLean > 0,
      play.contestLean);
    T.ok('Phase Out kcal unlabeled as army (still 100)', phase.kcal === 100, phase.kcal);
    T.ok('Phase Out minFrac unlabeled as army (still 0.25)', phase.minFrac === 0.25, phase.minFrac);
    T.ok('Phase Out retreat unlabeled as army (still 3)', phase.retreat === 3, phase.retreat);
    T.ok('no lean without a Between holder', Game.betweenRunnerLeanFor() === 0);
    T.ok('Between chase lean hook still present', typeof Game.betweenChaseLeanFor === 'function');
    T.ok('Voice army delivery hook still present', typeof Game.voiceDeliverAllied === 'function');
    T.ok('Garden muster feed hook still present', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean hook still present', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('All-Seeing council lean hook still present', typeof Game.allSeeingCouncilLeanFor === 'function');
    T.ok('Apex scout-mark lean hook still present', typeof Game.apexScoutMarkLeanFor === 'function');
    T.ok('Unkillable last-standing lean hook still present', typeof Game.unkillableLastStandingLeanFor === 'function');
    T.ok('OPA breach lean hook still present', typeof Game.opaBreachLeanFor === 'function');
    T.ok('Ward advance lean hook still present', typeof Game.wardAdvanceLeanFor === 'function');
  }

  T.section('CONTROL: aid-runner without Between → base travel parts');
  {
    resetRoad();
    raiseCrisis();
    T.ok('CONTROL: helper returns 0', Game.betweenRunnerLeanFor() === 0);
    T.ok('CONTROL: aidPartsFor equals raw base', Game.aidPartsFor(camp.id) === raw, Game.aidPartsFor(camp.id));
    const { result, said, rn } = sendSafeRunner();
    T.ok('CONTROL: runner sent', result === 'sent', result);
    T.ok('CONTROL: runner parts equal raw base', rn && rn.parts === raw, rn && rn.parts);
    T.ok('CONTROL: runner partsLeft equals parts (no delay/mishap)', rn && rn.partsLeft === rn.parts, rn && rn.partsLeft);
    T.ok('CONTROL: lean field is 0', rn && (rn.lean || 0) === 0, rn && rn.lean);
    T.ok('CONTROL: no Between runner lean line', !said.some(t => /Between runner lean/i.test(t)),
      said.join(' | ').slice(0, 200));
  }

  T.section('TREATMENT: Between holder leans travel parts');
  {
    resetRoad();
    T.ok('player ascends The Between', ascendPlayer('the_between') === 'the_between');
    T.ok('helper returns runnerLean', Game.betweenRunnerLeanFor() === leanVal, Game.betweenRunnerLeanFor());
    T.ok('TREATMENT: aidPartsFor is leaner', Game.aidPartsFor(camp.id) === expectedLeanParts,
      Game.aidPartsFor(camp.id));
    T.ok('TREATMENT: leaner than control raw', Game.aidPartsFor(camp.id) < raw, Game.aidPartsFor(camp.id));
    raiseCrisis();
    const { result, said, rn } = sendSafeRunner();
    T.ok('TREATMENT: runner sent', result === 'sent', result);
    T.ok('TREATMENT: runner parts lean', rn && rn.parts === expectedLeanParts, rn && rn.parts);
    T.ok('TREATMENT: runner partsLeft leans', rn && rn.partsLeft === expectedLeanParts, rn && rn.partsLeft);
    T.ok('TREATMENT: lean field matches play', rn && rn.lean === leanVal, rn && rn.lean);
    T.ok('TREATMENT: Between runner lean line said',
      said.some(t => /Between holds the road/i.test(t) && /Between runner lean/i.test(t)),
      said.join(' | ').slice(0, 240));
    T.ok('TREATMENT: Phase Out kcal still 100 (not retuned)',
      (Game.godPlay('the_between').passive || {}).kcal === 100);
  }

  T.section('FAILING CONTROL: strip betweenRunnerLeanFor');
  {
    resetRoad();
    ascendPlayer('the_between');
    raiseCrisis();
    const hook = Game.betweenRunnerLeanFor;
    Game.betweenRunnerLeanFor = function () { return 0; };
    let result, said, rn, parts;
    try {
      parts = Game.aidPartsFor(camp.id);
      ({ result, said, rn } = sendSafeRunner());
    } finally {
      Game.betweenRunnerLeanFor = hook;
    }
    T.ok('FAILING CONTROL: aidPartsFor restores raw base', parts === raw, parts);
    T.ok('FAILING CONTROL: runner still sent', result === 'sent');
    T.ok('FAILING CONTROL: runner parts restore raw', rn && rn.parts === raw, rn && rn.parts);
    T.ok('FAILING CONTROL: lean field collapses to 0', rn && (rn.lean || 0) === 0, rn && rn.lean);
    T.ok('FAILING CONTROL: no Between runner lean line', !said.some(t => /Between runner lean/i.test(t)));
    T.ok('FAILING CONTROL: player is still Between (ascended alone is not army LIVE)',
      Game.holderGod('player') === 'the_between');
  }

  T.section('non-Between holders get no runner lean');
  {
    const gods = [
      'living_garden', 'voice_of_the_relay', 'market_god', 'all_seeing',
      'apex_predator', 'unkillable', 'one_person_army', 'undying_ward',
    ];
    for (const gid of gods) {
      resetRoad();
      ascendPlayer(gid);
      T.ok(gid + ': helper returns 0', Game.betweenRunnerLeanFor() === 0);
      T.ok(gid + ': aidPartsFor stays raw', Game.aidPartsFor(camp.id) === raw, Game.aidPartsFor(camp.id));
      raiseCrisis();
      const out = sendSafeRunner();
      T.ok(gid + ': runner parts stay raw', out.rn && out.rn.parts === raw, out.rn && out.rn.parts);
      T.ok(gid + ': no Between runner lean line', !out.said.some(t => /Between runner lean/i.test(t)));
    }
  }

  T.section('Haven NPC Between holder also leans');
  {
    resetRoad();
    const npc = others[1] || others[0];
    T.ok('NPC candidate for Between', !!npc, npc);
    T.ok('NPC ascends The Between', ascendVillager(npc, 'the_between') === 'the_between');
    T.ok('NPC Between: helper returns lean', Game.betweenRunnerLeanFor() === leanVal);
    T.ok('NPC Between: aidPartsFor leans', Game.aidPartsFor(camp.id) === expectedLeanParts,
      Game.aidPartsFor(camp.id));
    raiseCrisis();
    // Prefer a different body on the road when possible.
    const roadBody = (others.find(id => id !== npc) || runnerId);
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    const origRandom = Math.random;
    let result = null;
    let rn = null;
    try {
      Math.random = () => 0.99;
      result = Game.aidSendRunner({ runnerId: roadBody, targetId: camp.id });
      rn = (Game.state.aidRunners || []).find(r => r.vid === roadBody) || null;
    } finally {
      Math.random = origRandom;
      Game.say = osay;
    }
    T.ok('NPC Between: runner sent', result === 'sent', result);
    T.ok('NPC Between: runner parts lean', rn && rn.parts === expectedLeanParts, rn && rn.parts);
    T.ok('NPC Between: lean line said', said.some(t => /Between runner lean/i.test(t)));
  }

  T.section('prior army + Between chase leans unchanged');
  {
    clearGods();
    const wPlay = Game.godPlay('undying_ward') || {};
    const oPlay = Game.godPlay('one_person_army') || {};
    const uPlay = Game.godPlay('unkillable') || {};
    const aPlay = Game.godPlay('apex_predator') || {};
    const asPlay = Game.godPlay('all_seeing') || {};
    const mPlay = Game.godPlay('market_god') || {};
    const gPlay = Game.godPlay('living_garden') || {};
    const vPlay = Game.godPlay('voice_of_the_relay') || {};
    const bPlay = Game.godPlay('the_between') || {};
    T.ok('Ward advanceLean still present', typeof wPlay.advanceLean === 'number' && wPlay.advanceLean > 0);
    T.ok('OPA breachLean still present', typeof oPlay.breachLean === 'number' && oPlay.breachLean > 0);
    T.ok('Unkillable lastStandingLean still present', typeof uPlay.lastStandingLean === 'number' && uPlay.lastStandingLean > 0);
    T.ok('Apex scoutMarkLean still present', typeof aPlay.scoutMarkLean === 'number' && aPlay.scoutMarkLean > 0);
    T.ok('All-Seeing councilMapLean still present', typeof asPlay.councilMapLean === 'number' && asPlay.councilMapLean > 0);
    T.ok('Market outfitEffLean still present', typeof mPlay.outfitEffLean === 'number' && mPlay.outfitEffLean > 0);
    T.ok('Garden musterMouths still present', typeof gPlay.musterMouths === 'number' && gPlay.musterMouths > 0);
    T.ok('Voice still has Be Heard army verb path', typeof Game.voiceDeliverAllied === 'function');
    T.ok('Voice performance contests still listed', Array.isArray(vPlay.performanceContests));
    T.ok('Between chase contests still listed', Array.isArray(bPlay.chaseContests)
      && bPlay.chaseContests.includes('hide'));
    T.ok('Between contestLean still 18', bPlay.contestLean === 18, bPlay.contestLean);
    ascendPlayer('the_between');
    T.ok('Between chase lean still fires for hide',
      Game.betweenChaseLeanFor('player', { id: 'hide' }) === 18,
      Game.betweenChaseLeanFor('player', { id: 'hide' }));
    T.ok('Between chase lean still fires for calorie_run',
      Game.betweenChaseLeanFor('player', { id: 'calorie_run' }) === 18);
    T.ok('Between chase lean still zero for drop (Unkillable)',
      Game.betweenChaseLeanFor('player', { id: 'drop' }) === 0);
  }

  T.section('floor: lean never makes travel instant');
  {
    resetRoad();
    // Near camp: raw parts = 1; lean must floor at 1.
    camp.x = 4;
    camp.y = 5; // manhattan 1 → ceil(1/3)=1
    ascendPlayer('the_between');
    const nearRaw = Math.max(1, Math.ceil(Game.aidDistance(camp.id) / 3));
    T.ok('near camp raw parts is 1', nearRaw === 1, nearRaw);
    T.ok('near camp leaned parts still 1 (never instant)', Game.aidPartsFor(camp.id) === 1,
      Game.aidPartsFor(camp.id));
  }

  T.done();
})().catch(err => {
  console.error(err && err.stack || err);
  process.exitCode = 1;
});
