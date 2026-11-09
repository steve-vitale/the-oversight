#!/usr/bin/env node
// OVE-136 — Unkillable army last-standing lean via titanLastStandingContinuity.
//
// god.scale.army: "The coalition's last one standing."
// Settlement: titanLastStandingContinuity honors Game.unkillableLastStandingLeanFor
// when an ascended Unkillable holder is the last living ours blade in a titan
// fight — refuse rout + steadiness + last-standing beat. Seeded proof + failing
// control that strips the helper. Preserves Garden/Voice/Market/All-Seeing/Apex
// army + contest leans. Muse off; Phoenix kcal untouched.
'use strict';
const K = require('./lib');
const T = K.reporter('unkillable-last-standing-army-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 136) });
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

  const others = (v.roster || []).filter(id => id !== Game.villagerId);
  const play = Game.godPlay('unkillable') || {};
  const leanVal = (typeof play.lastStandingLean === 'number' && play.lastStandingLean > 0)
    ? play.lastStandingLean : 1;

  function plantTitanLastBlade(opts) {
    const o = opts || {};
    Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
    Game.state.titans._fight = { titan: 'herald', day: s.day || 1 };
    const player = {
      key: 'p', kind: 'player', name: 'Bearer',
      alive: o.playerAlive !== false, fled: !!o.playerFled,
      hp: o.playerAlive === false ? 0 : (o.playerHp != null ? o.playerHp : 40),
      maxHp: 100,
    };
    const ally = {
      key: 'a_blade', kind: 'ally', villagerId: o.allyVid || 'blade_x',
      villageId: o.allyVillage || 'ash', name: o.allyName || 'Ash Blade',
      alive: !!o.allyAlive, fled: !!o.allyFled,
      hp: o.allyAlive ? (o.allyHp != null ? o.allyHp : 30) : 0,
      maxHp: 80,
    };
    const monster = {
      key: 'm_0', kind: 'monster', id: 'herald', titan: true,
      name: 'The Herald', alive: true, hp: 500, maxHp: 500,
    };
    const fighters = [player, monster];
    if (o.includeAlly !== false) fighters.splice(1, 0, ally);
    if (o.extraFighter) fighters.splice(1, 0, o.extraFighter);
    Game.tbfight = {
      over: false,
      fighters,
      order: fighters.map(f => f.key),
      _lastStandingSaid: false,
      lastStandingHold: false,
      lastStandingSteadiness: 0,
    };
    return Game.tbfight;
  }

  function runContinuity(forFighter) {
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    let result = null;
    let err = null;
    try {
      result = Game.titanLastStandingContinuity(forFighter ? { forFighter } : undefined);
    } catch (e) { err = e; }
    finally { Game.say = osay; }
    return {
      err,
      result,
      said,
      line: said.some(t => /last one standing holds/i.test(t) && /refuse to rout/i.test(t)),
      fight: Game.tbfight,
    };
  }

  T.section('data + wiring');
  {
    clearGods();
    T.ok('unkillableLastStandingLeanFor is exported', typeof Game.unkillableLastStandingLeanFor === 'function');
    T.ok('titanLastStandingContinuity is exported', typeof Game.titanLastStandingContinuity === 'function');
    T.ok('play.lastStandingLean is a positive number', typeof play.lastStandingLean === 'number' && play.lastStandingLean > 0,
      play.lastStandingLean);
    T.ok('Phoenix kcal untouched (500)', play.passive && play.passive.kcal === 500, play.passive && play.passive.kcal);
    T.ok('endurance contestLean untouched (18)', play.contestLean === 18, play.contestLean);
    T.ok('no lean without an Unkillable holder', Game.unkillableLastStandingLeanFor() === 0);
    T.ok('Garden muster feed still exported', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean still exported', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('All-Seeing council lean still exported', typeof Game.allSeeingCouncilLeanFor === 'function');
    T.ok('Apex scout-mark lean still exported', typeof Game.apexScoutMarkLeanFor === 'function');
    T.ok('Voice Be Heard army helper still exported', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('CONTROL: last blade without Unkillable → no refuse-rout');
  {
    clearGods();
    // Player alone vs titan, but player is not Unkillable.
    plantTitanLastBlade({ includeAlly: false, playerAlive: true });
    const out = runContinuity();
    T.ok('CONTROL: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('CONTROL: titan fight recognized', out.result && out.result.titan === true);
    T.ok('CONTROL: helper lean 0', out.result && out.result.lean === 0, out.result && out.result.lean);
    T.ok('CONTROL: oursAlive 1', out.result && out.result.oursAlive === 1, out.result && out.result.oursAlive);
    T.ok('CONTROL: not lastStanding', out.result && out.result.lastStanding === false);
    T.ok('CONTROL: refusedRout false', out.result && out.result.refusedRout === false);
    T.ok('CONTROL: steadiness 0', out.result && out.result.steadiness === 0, out.result && out.result.steadiness);
    T.ok('CONTROL: no last-standing line', out.line === false);
    T.ok('CONTROL: fight flag unset', !(out.fight && out.fight.lastStandingHold));
  }

  T.section('TREATMENT: Unkillable last ours blade refuses rout');
  {
    clearGods();
    T.ok('player ascends Unkillable', ascendPlayer('unkillable') === 'unkillable');
    T.ok('helper returns lastStandingLean', Game.unkillableLastStandingLeanFor() === leanVal,
      Game.unkillableLastStandingLeanFor());
    plantTitanLastBlade({ includeAlly: false, playerAlive: true, playerHp: 12 });
    const holder = Game.tbfight.fighters.find(f => f.key === 'p');
    const out = runContinuity(holder);
    T.ok('TREATMENT: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('TREATMENT: lean matches play', out.result && out.result.lean === leanVal, out.result && out.result.lean);
    T.ok('TREATMENT: lastStanding true', out.result && out.result.lastStanding === true);
    T.ok('TREATMENT: refusedRout true', out.result && out.result.refusedRout === true);
    T.ok('TREATMENT: steadiness matches lean', out.result && out.result.steadiness === leanVal,
      out.result && out.result.steadiness);
    T.ok('TREATMENT: last-standing line', out.line === true, out.said.join(' | ').slice(0, 280));
    T.ok('TREATMENT: fight lastStandingHold', !!(out.fight && out.fight.lastStandingHold));
    T.ok('TREATMENT: fight steadiness stamped', out.fight && out.fight.lastStandingSteadiness === leanVal,
      out.fight && out.fight.lastStandingSteadiness);
    T.ok('TREATMENT: holder not fled', holder && holder.fled === false);
    T.ok('TREATMENT: holder rallied', holder && (holder.rallied || 0) >= 2, holder && holder.rallied);
  }

  T.section('FAILING CONTROL: strip unkillableLastStandingLeanFor');
  {
    clearGods();
    ascendPlayer('unkillable');
    plantTitanLastBlade({ includeAlly: false, playerAlive: true });
    const hook = Game.unkillableLastStandingLeanFor;
    Game.unkillableLastStandingLeanFor = function () { return 0; };
    let out;
    try {
      out = runContinuity();
    } finally {
      Game.unkillableLastStandingLeanFor = hook;
    }
    T.ok('FAILING CONTROL: lean collapses', out.result && out.result.lean === 0, out.result && out.result.lean);
    T.ok('FAILING CONTROL: refusedRout false', out.result && out.result.refusedRout === false);
    T.ok('FAILING CONTROL: lastStanding false', out.result && out.result.lastStanding === false);
    T.ok('FAILING CONTROL: no last-standing line', out.line === false);
    T.ok('FAILING CONTROL: player is still Unkillable (ascended alone is not army LIVE)',
      Game.holderGod('player') === 'unkillable');
    T.ok('FAILING CONTROL: live helper still returns lean when restored',
      Game.unkillableLastStandingLeanFor() === leanVal, Game.unkillableLastStandingLeanFor());
  }

  T.section('not last standing: multiple ours blades → no lean settlement');
  {
    clearGods();
    ascendPlayer('unkillable');
    plantTitanLastBlade({ includeAlly: true, playerAlive: true, allyAlive: true });
    const out = runContinuity();
    T.ok('MULTI: lean present', out.result && out.result.lean === leanVal);
    T.ok('MULTI: oursAlive 2', out.result && out.result.oursAlive === 2, out.result && out.result.oursAlive);
    T.ok('MULTI: not lastStanding', out.result && out.result.lastStanding === false);
    T.ok('MULTI: refusedRout false', out.result && out.result.refusedRout === false);
    T.ok('MULTI: no last-standing line', out.line === false);
  }

  T.section('non-titan fight: no continuity even with Unkillable alone');
  {
    clearGods();
    ascendPlayer('unkillable');
    plantTitanLastBlade({ includeAlly: false, playerAlive: true });
    delete Game.state.titans._fight;
    Game.tbfight.fighters.forEach(f => { if (f.kind === 'monster') { delete f.titan; f.id = 'hushwolf'; } });
    const out = runContinuity();
    T.ok('NON-TITAN: titan false', out.result && out.result.titan === false);
    T.ok('NON-TITAN: refusedRout false', out.result && out.result.refusedRout === false);
    T.ok('NON-TITAN: no last-standing line', out.line === false);
  }

  T.section('non-Unkillable holders get no last-standing lean');
  {
    const gods = ['living_garden', 'voice_of_the_relay', 'all_seeing', 'market_god', 'one_person_army', 'apex_predator'];
    for (const gid of gods) {
      clearGods();
      ascendPlayer(gid);
      T.ok(gid + ' helper returns 0', Game.unkillableLastStandingLeanFor() === 0);
      plantTitanLastBlade({ includeAlly: false, playerAlive: true });
      const out = runContinuity();
      T.ok(gid + ': refusedRout false', out.result && out.result.refusedRout === false);
      T.ok(gid + ': no last-standing line', out.line === false);
    }
  }

  T.section('NPC Unkillable holder leans last-standing');
  {
    clearGods();
    const npc = others[0];
    T.ok('fixture villager for NPC Unkillable', !!npc, others.length);
    T.ok('villager ascends Unkillable', ascendVillager(npc, 'unkillable') === 'unkillable');
    T.ok('NPC Unkillable helper returns lean', Game.unkillableLastStandingLeanFor() === leanVal,
      Game.unkillableLastStandingLeanFor());
    // Player down; NPC Unkillable is the sole living ours blade.
    plantTitanLastBlade({
      includeAlly: false,
      playerAlive: false,
      extraFighter: {
        key: 'v_unk', kind: 'villager', villagerId: npc, name: 'Unkillable Face',
        alive: true, fled: false, hp: 18, maxHp: 100,
      },
    });
    const holder = Game.tbfight.fighters.find(f => f.villagerId === npc);
    const out = runContinuity(holder);
    T.ok('NPC: lastStanding true', out.result && out.result.lastStanding === true);
    T.ok('NPC: refusedRout true', out.result && out.result.refusedRout === true);
    T.ok('NPC: steadiness matches lean', out.result && out.result.steadiness === leanVal);
    T.ok('NPC: last-standing line', out.line === true);
    T.ok('NPC: holder rallied', holder && (holder.rallied || 0) >= 2);
  }

  T.section('prior army + contest leans preserved');
  {
    clearGods();
    delete v.harvestDay;
    const day = s.day || 1;
    const cookfight = { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
    const impress = { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
    const drop = { id: 'drop', name: 'The Drop', cat: 'endurance', risk: 'hard' };
    const whoate = { id: 'whoate', name: 'Who Ate It', cat: 'detective', risk: 'medium' };
    const price = { id: 'price', name: 'The Price', cat: 'moot', risk: 'extreme' };
    const pit = { id: 'pit', name: 'The Pit', cat: 'blood', risk: 'hard' };

    ascendPlayer('living_garden');
    v.harvestDay = day;
    T.ok('Garden muster feed still covers need', Game.gardenMusterFeedFor(2000) === 2000);
    T.ok('Garden feast lean still fires for cookfight', Game.gardenFeastLeanFor(Game.villagerId, cookfight) > 0);
    delete v.harvestDay;

    clearGods();
    ascendPlayer('voice_of_the_relay');
    T.ok('Voice performance lean still fires for impress', Game.voicePerformanceLeanFor(Game.villagerId, impress) > 0);
    T.ok('Voice army delivery still callable', typeof Game.voiceDeliverAllied === 'function');

    clearGods();
    ascendPlayer('unkillable');
    T.ok('Unkillable endurance lean still fires for drop', Game.unkillableEnduranceLeanFor(Game.villagerId, drop) > 0);
    T.ok('Unkillable last-standing helper does not grant Apex scout lean', Game.apexScoutMarkLeanFor() === 0);
    T.ok('Unkillable last-standing helper does not grant All-Seeing council lean', Game.allSeeingCouncilLeanFor() === 0);
    T.ok('Unkillable last-standing helper does not grant Market outfit lean', Game.marketOutfitLeanFor() === 0);

    clearGods();
    ascendPlayer('all_seeing');
    T.ok('All-Seeing strategy lean still fires for whoate', Game.allSeeingStrategyLeanFor(Game.villagerId, whoate) > 0);
    T.ok('All-Seeing council lean still returns for All-Seeing holder', Game.allSeeingCouncilLeanFor() > 0);

    clearGods();
    ascendPlayer('market_god');
    T.ok('Market sponsor lean still fires for price', Game.marketSponsorLeanFor(Game.villagerId, price) > 0);
    T.ok('Market outfit lean still returns for Market holder', Game.marketOutfitLeanFor() > 0);

    clearGods();
    ascendPlayer('one_person_army');
    T.ok('OPA blood lean still fires for pit', Game.opaBloodLeanFor(Game.villagerId, pit) > 0);

    clearGods();
    ascendPlayer('apex_predator');
    T.ok('Apex scout helper still returns for Apex holder', Game.apexScoutMarkLeanFor() > 0);
    T.ok('Apex scout helper does not grant Unkillable last-standing lean', Game.unkillableLastStandingLeanFor() === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
