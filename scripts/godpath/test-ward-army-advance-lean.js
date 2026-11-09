#!/usr/bin/env node
// OVE-144 — Undying Ward army advance / march-behind lean via titanWardAdvanceBehind.
//
// god.scale.army: "The army advances behind you."
// Settlement: titanWardAdvanceBehind honors Game.wardAdvanceLeanFor when an
// ascended Ward holder holds the line in a titan fight (adjacent to a living
// titan) — coalition blades advance behind the wall with steadiness +
// advance-count + advance beat. Seeded proof + failing control that strips
// the helper. Preserves Garden/Voice/Market/All-Seeing/Apex/Unkillable/OPA
// army + contest leans. Does NOT re-label Take the Wound (PARTY/TITAN) as
// army LIVE, invent weep contests, or retune Take the Wound kcal/strains.
// Muse off.
'use strict';
const K = require('./lib');
const T = K.reporter('ward-army-advance-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 144) });
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
  const play = Game.godPlay('undying_ward') || {};
  const leanVal = (typeof play.advanceLean === 'number' && play.advanceLean > 0)
    ? play.advanceLean : 1;
  const passive = play.passive || {};

  function plantTitanAdvance(opts) {
    const o = opts || {};
    Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
    Game.state.titans._fight = { titan: 'herald', day: s.day || 1 };
    const player = {
      key: 'p', kind: 'player', name: 'Bearer',
      alive: o.playerAlive !== false, fled: !!o.playerFled,
      hp: o.playerAlive === false ? 0 : (o.playerHp != null ? o.playerHp : 40),
      maxHp: 100,
      mx: o.playerMx != null ? o.playerMx : 5,
      my: o.playerMy != null ? o.playerMy : 5,
    };
    const ally = {
      key: 'a_blade', kind: 'ally', villagerId: o.allyVid || 'blade_x',
      villageId: o.allyVillage || 'ash', name: o.allyName || 'Ash Blade',
      alive: o.allyAlive !== false, fled: !!o.allyFled,
      hp: o.allyAlive === false ? 0 : (o.allyHp != null ? o.allyHp : 30),
      maxHp: 80,
      mx: o.allyMx != null ? o.allyMx : 4,
      my: o.allyMy != null ? o.allyMy : 5,
      rallied: 0,
      rallyBuff: 0,
      advancedBehind: false,
    };
    const monster = {
      key: 'm_0', kind: 'monster', id: 'herald', titan: true,
      name: 'The Herald', alive: true, hp: 500, maxHp: 500,
      mx: o.monsterMx != null ? o.monsterMx : 5,
      my: o.monsterMy != null ? o.monsterMy : 6,
    };
    const fighters = [player, monster];
    if (o.includeAlly !== false) fighters.splice(1, 0, ally);
    if (o.extraFighter) fighters.splice(1, 0, o.extraFighter);
    Game.tbfight = {
      over: false,
      fighters,
      order: fighters.map(f => f.key),
      _wardAdvanceSaid: false,
      advanceBehind: false,
      advanceAdvanced: 0,
      advanceSteadiness: 0,
      _gv: { uses: {}, beam: {}, titanPain: {}, rallied: {}, phased: {}, strains: {}, collapsed: {}, echoes: 0, terms: null, truth: null, firstBlow: false, saidHeal: false },
    };
    return Game.tbfight;
  }

  function runAdvance(opts) {
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    let result = null;
    let err = null;
    try {
      result = Game.titanWardAdvanceBehind(opts || undefined);
    } catch (e) { err = e; }
    finally { Game.say = osay; }
    return {
      err,
      result,
      said,
      line: said.some(t => /army advances behind you/i.test(t) && /press/i.test(t)),
      fight: Game.tbfight,
    };
  }

  T.section('data + wiring');
  {
    clearGods();
    T.ok('wardAdvanceLeanFor is exported', typeof Game.wardAdvanceLeanFor === 'function');
    T.ok('titanWardAdvanceBehind is exported', typeof Game.titanWardAdvanceBehind === 'function');
    T.ok('play.advanceLean is a positive number', typeof play.advanceLean === 'number' && play.advanceLean > 0,
      play.advanceLean);
    T.ok('Take the Wound kcal untouched (60)', passive.kcal === 60, passive.kcal);
    T.ok('Take the Wound strains untouched (3)', passive.strains === 3, passive.strains);
    T.ok('Take the Wound minFrac untouched (0.25)', passive.minFrac === 0.25, passive.minFrac);
    T.ok('selfHealMult untouched (0.5)', play.selfHealMult === 0.5, play.selfHealMult);
    T.ok('no lean without a Ward holder', Game.wardAdvanceLeanFor() === 0);
    T.ok('Garden muster feed still exported', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean still exported', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('All-Seeing council lean still exported', typeof Game.allSeeingCouncilLeanFor === 'function');
    T.ok('Apex scout-mark lean still exported', typeof Game.apexScoutMarkLeanFor === 'function');
    T.ok('Unkillable last-standing lean still exported', typeof Game.unkillableLastStandingLeanFor === 'function');
    T.ok('OPA breach lean still exported', typeof Game.opaBreachLeanFor === 'function');
    T.ok('Voice Be Heard army helper still exported', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('CONTROL: titan front without Ward → no advance-behind');
  {
    clearGods();
    plantTitanAdvance({ includeAlly: true, allyAlive: true, playerAlive: true });
    const out = runAdvance();
    T.ok('CONTROL: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('CONTROL: titan fight recognized', out.result && out.result.titan === true);
    T.ok('CONTROL: helper lean 0', out.result && out.result.lean === 0, out.result && out.result.lean);
    T.ok('CONTROL: oursAlive 2', out.result && out.result.oursAlive === 2, out.result && out.result.oursAlive);
    T.ok('CONTROL: advanceBehind false', out.result && out.result.advanceBehind === false);
    T.ok('CONTROL: advanced 0', out.result && out.result.advanced === 0, out.result && out.result.advanced);
    T.ok('CONTROL: steadiness 0', out.result && out.result.steadiness === 0, out.result && out.result.steadiness);
    T.ok('CONTROL: no advance line', out.line === false);
    T.ok('CONTROL: fight flag unset', !(out.fight && out.fight.advanceBehind));
  }

  T.section('TREATMENT: Ward holds titan line → army advances behind');
  {
    clearGods();
    T.ok('player ascends Ward', ascendPlayer('undying_ward') === 'undying_ward');
    T.ok('helper returns advanceLean', Game.wardAdvanceLeanFor() === leanVal,
      Game.wardAdvanceLeanFor());
    plantTitanAdvance({ includeAlly: true, allyAlive: true, playerAlive: true });
    const holder = Game.tbfight.fighters.find(f => f.key === 'p');
    const ally = Game.tbfight.fighters.find(f => f.key === 'a_blade');
    const out = runAdvance({ wall: holder });
    T.ok('TREATMENT: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('TREATMENT: lean matches play', out.result && out.result.lean === leanVal, out.result && out.result.lean);
    T.ok('TREATMENT: adjacent true', out.result && out.result.adjacent === true);
    T.ok('TREATMENT: advanceBehind true', out.result && out.result.advanceBehind === true);
    T.ok('TREATMENT: advanced 1', out.result && out.result.advanced === 1, out.result && out.result.advanced);
    T.ok('TREATMENT: steadiness matches lean', out.result && out.result.steadiness === leanVal,
      out.result && out.result.steadiness);
    T.ok('TREATMENT: advance line', out.line === true, out.said.join(' | ').slice(0, 280));
    T.ok('TREATMENT: fight advanceBehind', !!(out.fight && out.fight.advanceBehind));
    T.ok('TREATMENT: fight advanced stamped', out.fight && out.fight.advanceAdvanced === 1,
      out.fight && out.fight.advanceAdvanced);
    T.ok('TREATMENT: fight steadiness stamped', out.fight && out.fight.advanceSteadiness === leanVal,
      out.fight && out.fight.advanceSteadiness);
    T.ok('TREATMENT: ally advancedBehind', ally && ally.advancedBehind === true);
    T.ok('TREATMENT: ally rallied', ally && (ally.rallied || 0) >= 2, ally && ally.rallied);
    T.ok('TREATMENT: holder wallHolding stamped', holder && holder.wallHolding === true);
  }

  T.section('FAILING CONTROL: strip wardAdvanceLeanFor');
  {
    clearGods();
    ascendPlayer('undying_ward');
    plantTitanAdvance({ includeAlly: true, allyAlive: true, playerAlive: true });
    const hook = Game.wardAdvanceLeanFor;
    Game.wardAdvanceLeanFor = function () { return 0; };
    let out;
    try {
      out = runAdvance();
    } finally {
      Game.wardAdvanceLeanFor = hook;
    }
    T.ok('FAILING CONTROL: lean collapses', out.result && out.result.lean === 0, out.result && out.result.lean);
    T.ok('FAILING CONTROL: advanceBehind false', out.result && out.result.advanceBehind === false);
    T.ok('FAILING CONTROL: advanced 0', out.result && out.result.advanced === 0);
    T.ok('FAILING CONTROL: no advance line', out.line === false);
    T.ok('FAILING CONTROL: player is still Ward (ascended alone is not army LIVE)',
      Game.holderGod('player') === 'undying_ward');
    T.ok('FAILING CONTROL: live helper still returns lean when restored',
      Game.wardAdvanceLeanFor() === leanVal, Game.wardAdvanceLeanFor());
  }

  T.section('solo Ward (no coalition) → no advance-behind');
  {
    clearGods();
    ascendPlayer('undying_ward');
    plantTitanAdvance({ includeAlly: false, playerAlive: true });
    const out = runAdvance();
    T.ok('SOLO: lean present', out.result && out.result.lean === leanVal);
    T.ok('SOLO: oursAlive 1', out.result && out.result.oursAlive === 1, out.result && out.result.oursAlive);
    T.ok('SOLO: advanceBehind false (no coalition behind)', out.result && out.result.advanceBehind === false);
    T.ok('SOLO: advanced 0', out.result && out.result.advanced === 0);
    T.ok('SOLO: no advance line', out.line === false);
  }

  T.section('non-adjacent Ward with coalition → no advance (unless forceOpen)');
  {
    clearGods();
    ascendPlayer('undying_ward');
    plantTitanAdvance({
      includeAlly: true, allyAlive: true, playerAlive: true,
      playerMx: 1, playerMy: 1, monsterMx: 8, monsterMy: 8,
    });
    const out = runAdvance();
    T.ok('FAR: adjacent false', out.result && out.result.adjacent === false);
    T.ok('FAR: advanceBehind false', out.result && out.result.advanceBehind === false);
    T.ok('FAR: advanced 0', out.result && out.result.advanced === 0);
    T.ok('FAR: no advance line', out.line === false);

    // Take the Wound path stamps openedBy / forceOpen after redirect.
    plantTitanAdvance({
      includeAlly: true, allyAlive: true, playerAlive: true,
      playerMx: 1, playerMy: 1, monsterMx: 8, monsterMy: 8,
    });
    const holder = Game.tbfight.fighters.find(f => f.key === 'p');
    const forced = runAdvance({ wall: holder, openedBy: 'take_the_wound' });
    T.ok('FORCE: advanceBehind true via Take the Wound open stamp', forced.result && forced.result.advanceBehind === true);
    T.ok('FORCE: advanced 1', forced.result && forced.result.advanced === 1);
    T.ok('FORCE: advance line', forced.line === true);
  }

  T.section('non-titan fight: no advance even with Ward + allies adjacent');
  {
    clearGods();
    ascendPlayer('undying_ward');
    plantTitanAdvance({ includeAlly: true, allyAlive: true, playerAlive: true });
    delete Game.state.titans._fight;
    Game.tbfight.fighters.forEach(f => { if (f.kind === 'monster') { delete f.titan; f.id = 'hushwolf'; } });
    const out = runAdvance();
    T.ok('NON-TITAN: titan false', out.result && out.result.titan === false);
    T.ok('NON-TITAN: advanceBehind false', out.result && out.result.advanceBehind === false);
    T.ok('NON-TITAN: no advance line', out.line === false);
  }

  T.section('non-Ward holders get no advance lean');
  {
    const gods = ['living_garden', 'voice_of_the_relay', 'unkillable', 'all_seeing', 'market_god', 'apex_predator', 'one_person_army'];
    for (const gid of gods) {
      clearGods();
      ascendPlayer(gid);
      T.ok(gid + ' helper returns 0', Game.wardAdvanceLeanFor() === 0);
      plantTitanAdvance({ includeAlly: true, allyAlive: true, playerAlive: true });
      const out = runAdvance();
      T.ok(gid + ': advanceBehind false', out.result && out.result.advanceBehind === false);
      T.ok(gid + ': no advance line', out.line === false);
    }
  }

  T.section('NPC Ward holder leans advance-behind');
  {
    clearGods();
    const npc = others[0];
    T.ok('fixture villager for NPC Ward', !!npc, others.length);
    T.ok('villager ascends Ward', ascendVillager(npc, 'undying_ward') === 'undying_ward');
    T.ok('NPC Ward helper returns lean', Game.wardAdvanceLeanFor() === leanVal,
      Game.wardAdvanceLeanFor());
    // Player down; NPC Ward is the wall with a living ally behind.
    plantTitanAdvance({
      includeAlly: true,
      allyAlive: true,
      playerAlive: false,
      extraFighter: {
        key: 'v_ward', kind: 'villager', villagerId: npc, name: 'Ward Face',
        alive: true, fled: false, hp: 40, maxHp: 100, mx: 5, my: 5,
      },
    });
    const deadP = Game.tbfight.fighters.find(f => f.key === 'p');
    if (deadP) { deadP.mx = 0; deadP.my = 0; }
    const holder = Game.tbfight.fighters.find(f => f.villagerId === npc);
    const ally = Game.tbfight.fighters.find(f => f.key === 'a_blade');
    const out = runAdvance({ wall: holder });
    T.ok('NPC: advanceBehind true', out.result && out.result.advanceBehind === true);
    T.ok('NPC: advanced >= 1', out.result && out.result.advanced >= 1, out.result && out.result.advanced);
    T.ok('NPC: steadiness matches lean', out.result && out.result.steadiness === leanVal);
    T.ok('NPC: advance line', out.line === true);
    T.ok('NPC: ally advancedBehind', ally && ally.advancedBehind === true);
  }

  T.section('PARTY/TITAN Take the Wound redirect remains unlabeled as army');
  {
    clearGods();
    ascendPlayer('undying_ward');
    T.ok('Take the Wound kcal still 60 (PARTY/TITAN axis untouched)', passive.kcal === 60);
    T.ok('Take the Wound strains still 3', passive.strains === 3);
    plantTitanAdvance({ includeAlly: true, allyAlive: true, playerAlive: true });
    const f = Game.tbfight;
    T.ok('strains map still present on fight GV (Take the Wound substrate)',
      !!(f._gv && typeof f._gv.strains === 'object'));
    // Army advance does not require a redirect to have already fired — adjacency
    // alone with lean is enough; Take the Wound is a separate PARTY/TITAN path.
    const holder = f.fighters.find(x => x.key === 'p');
    const out = runAdvance({ wall: holder });
    T.ok('adjacent Ward still opens army advance without strain stamp',
      out.result && out.result.advanceBehind === true);
    T.ok('army advance does not require GV.strains as its done-when',
      !(f._gv && f._gv.strains && f._gv.strains[holder.key]));
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
    T.ok('Unkillable last-standing helper still returns for Unkillable holder', Game.unkillableLastStandingLeanFor() > 0);
    T.ok('Unkillable does not grant Ward advance lean', Game.wardAdvanceLeanFor() === 0);

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
    T.ok('OPA breach helper returns for OPA holder', Game.opaBreachLeanFor() > 0);
    T.ok('OPA breach helper does not grant Ward advance lean', Game.wardAdvanceLeanFor() === 0);

    clearGods();
    ascendPlayer('apex_predator');
    T.ok('Apex scout helper still returns for Apex holder', Game.apexScoutMarkLeanFor() > 0);
    T.ok('Apex scout helper does not grant Ward advance lean', Game.wardAdvanceLeanFor() === 0);

    clearGods();
    ascendPlayer('undying_ward');
    T.ok('Ward advance helper returns for Ward holder', Game.wardAdvanceLeanFor() > 0);
    T.ok('Ward advance helper does not grant OPA breach lean', Game.opaBreachLeanFor() === 0);
    T.ok('Ward advance helper does not grant Unkillable last-standing lean', Game.unkillableLastStandingLeanFor() === 0);
    T.ok('Ward advance helper does not grant Apex scout lean', Game.apexScoutMarkLeanFor() === 0);
    T.ok('Ward advance helper does not grant All-Seeing council lean', Game.allSeeingCouncilLeanFor() === 0);
    T.ok('Ward advance helper does not grant Market outfit lean', Game.marketOutfitLeanFor() === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
