#!/usr/bin/env node
// OVE-140 — One-Person Army army breach / pour-through lean via titanBreachPourThrough.
//
// god.scale.army: "You are the breach the coalition pours through."
// Settlement: titanBreachPourThrough honors Game.opaBreachLeanFor when an
// ascended OPA holder opens the front in a titan fight (adjacent to a living
// titan) — coalition blades pour through with steadiness + pour-count +
// breach beat. Seeded proof + failing control that strips the helper.
// Preserves Garden/Voice/Market/All-Seeing/Apex/Unkillable army + contest
// leans. Does NOT re-label partyRallyAt (PARTY) or titanPain (TITAN).
// Muse off; Turn the Pain kcal / blood contestLean untouched.
'use strict';
const K = require('./lib');
const T = K.reporter('opa-breach-army-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 140) });
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
  const play = Game.godPlay('one_person_army') || {};
  const leanVal = (typeof play.breachLean === 'number' && play.breachLean > 0)
    ? play.breachLean : 1;
  const painAct = (play.actions || []).find(a => a && a.id === 'turn_the_pain');

  function plantTitanBreach(opts) {
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
      pouredThrough: false,
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
      _breachPourSaid: false,
      breachOpen: false,
      breachPoured: 0,
      breachSteadiness: 0,
      _gv: { uses: {}, beam: {}, titanPain: {}, rallied: {}, phased: {}, strains: {}, collapsed: {}, echoes: 0, terms: null, truth: null, firstBlow: false, saidHeal: false },
    };
    return Game.tbfight;
  }

  function runPour(opts) {
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    let result = null;
    let err = null;
    try {
      result = Game.titanBreachPourThrough(opts || undefined);
    } catch (e) { err = e; }
    finally { Game.say = osay; }
    return {
      err,
      result,
      said,
      line: said.some(t => /breach the coalition pours through/i.test(t) && /surge/i.test(t)),
      fight: Game.tbfight,
    };
  }

  T.section('data + wiring');
  {
    clearGods();
    T.ok('opaBreachLeanFor is exported', typeof Game.opaBreachLeanFor === 'function');
    T.ok('titanBreachPourThrough is exported', typeof Game.titanBreachPourThrough === 'function');
    T.ok('play.breachLean is a positive number', typeof play.breachLean === 'number' && play.breachLean > 0,
      play.breachLean);
    T.ok('Turn the Pain kcal untouched (150)', painAct && painAct.cost && painAct.cost.kcal === 150,
      painAct && painAct.cost && painAct.cost.kcal);
    T.ok('partyRallyAt untouched (0.5)', play.partyRallyAt === 0.5, play.partyRallyAt);
    T.ok('blood contestLean untouched (18)', play.contestLean === 18, play.contestLean);
    T.ok('no lean without an OPA holder', Game.opaBreachLeanFor() === 0);
    T.ok('Garden muster feed still exported', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean still exported', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('All-Seeing council lean still exported', typeof Game.allSeeingCouncilLeanFor === 'function');
    T.ok('Apex scout-mark lean still exported', typeof Game.apexScoutMarkLeanFor === 'function');
    T.ok('Unkillable last-standing lean still exported', typeof Game.unkillableLastStandingLeanFor === 'function');
    T.ok('Voice Be Heard army helper still exported', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('CONTROL: titan front without OPA → no pour-through');
  {
    clearGods();
    plantTitanBreach({ includeAlly: true, allyAlive: true, playerAlive: true });
    const out = runPour();
    T.ok('CONTROL: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('CONTROL: titan fight recognized', out.result && out.result.titan === true);
    T.ok('CONTROL: helper lean 0', out.result && out.result.lean === 0, out.result && out.result.lean);
    T.ok('CONTROL: oursAlive 2', out.result && out.result.oursAlive === 2, out.result && out.result.oursAlive);
    T.ok('CONTROL: breachOpen false', out.result && out.result.breachOpen === false);
    T.ok('CONTROL: poured 0', out.result && out.result.poured === 0, out.result && out.result.poured);
    T.ok('CONTROL: steadiness 0', out.result && out.result.steadiness === 0, out.result && out.result.steadiness);
    T.ok('CONTROL: no pour-through line', out.line === false);
    T.ok('CONTROL: fight flag unset', !(out.fight && out.fight.breachOpen));
  }

  T.section('TREATMENT: OPA opens titan front → coalition pours through');
  {
    clearGods();
    T.ok('player ascends OPA', ascendPlayer('one_person_army') === 'one_person_army');
    T.ok('helper returns breachLean', Game.opaBreachLeanFor() === leanVal,
      Game.opaBreachLeanFor());
    plantTitanBreach({ includeAlly: true, allyAlive: true, playerAlive: true });
    const holder = Game.tbfight.fighters.find(f => f.key === 'p');
    const ally = Game.tbfight.fighters.find(f => f.key === 'a_blade');
    const out = runPour({ opener: holder });
    T.ok('TREATMENT: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('TREATMENT: lean matches play', out.result && out.result.lean === leanVal, out.result && out.result.lean);
    T.ok('TREATMENT: adjacent true', out.result && out.result.adjacent === true);
    T.ok('TREATMENT: breachOpen true', out.result && out.result.breachOpen === true);
    T.ok('TREATMENT: poured 1', out.result && out.result.poured === 1, out.result && out.result.poured);
    T.ok('TREATMENT: steadiness matches lean', out.result && out.result.steadiness === leanVal,
      out.result && out.result.steadiness);
    T.ok('TREATMENT: pour-through line', out.line === true, out.said.join(' | ').slice(0, 280));
    T.ok('TREATMENT: fight breachOpen', !!(out.fight && out.fight.breachOpen));
    T.ok('TREATMENT: fight poured stamped', out.fight && out.fight.breachPoured === 1,
      out.fight && out.fight.breachPoured);
    T.ok('TREATMENT: fight steadiness stamped', out.fight && out.fight.breachSteadiness === leanVal,
      out.fight && out.fight.breachSteadiness);
    T.ok('TREATMENT: ally pouredThrough', ally && ally.pouredThrough === true);
    T.ok('TREATMENT: ally rallied', ally && (ally.rallied || 0) >= 2, ally && ally.rallied);
    T.ok('TREATMENT: holder breachOpen stamped', holder && holder.breachOpen === true);
  }

  T.section('FAILING CONTROL: strip opaBreachLeanFor');
  {
    clearGods();
    ascendPlayer('one_person_army');
    plantTitanBreach({ includeAlly: true, allyAlive: true, playerAlive: true });
    const hook = Game.opaBreachLeanFor;
    Game.opaBreachLeanFor = function () { return 0; };
    let out;
    try {
      out = runPour();
    } finally {
      Game.opaBreachLeanFor = hook;
    }
    T.ok('FAILING CONTROL: lean collapses', out.result && out.result.lean === 0, out.result && out.result.lean);
    T.ok('FAILING CONTROL: breachOpen false', out.result && out.result.breachOpen === false);
    T.ok('FAILING CONTROL: poured 0', out.result && out.result.poured === 0);
    T.ok('FAILING CONTROL: no pour-through line', out.line === false);
    T.ok('FAILING CONTROL: player is still OPA (ascended alone is not army LIVE)',
      Game.holderGod('player') === 'one_person_army');
    T.ok('FAILING CONTROL: live helper still returns lean when restored',
      Game.opaBreachLeanFor() === leanVal, Game.opaBreachLeanFor());
  }

  T.section('solo OPA (no coalition) → no pour-through');
  {
    clearGods();
    ascendPlayer('one_person_army');
    plantTitanBreach({ includeAlly: false, playerAlive: true });
    const out = runPour();
    T.ok('SOLO: lean present', out.result && out.result.lean === leanVal);
    T.ok('SOLO: oursAlive 1', out.result && out.result.oursAlive === 1, out.result && out.result.oursAlive);
    T.ok('SOLO: breachOpen false (no coalition to pour)', out.result && out.result.breachOpen === false);
    T.ok('SOLO: poured 0', out.result && out.result.poured === 0);
    T.ok('SOLO: no pour-through line', out.line === false);
  }

  T.section('non-adjacent OPA with coalition → no pour (unless forceOpen)');
  {
    clearGods();
    ascendPlayer('one_person_army');
    plantTitanBreach({
      includeAlly: true, allyAlive: true, playerAlive: true,
      playerMx: 1, playerMy: 1, monsterMx: 8, monsterMy: 8,
    });
    const out = runPour();
    T.ok('FAR: adjacent false', out.result && out.result.adjacent === false);
    T.ok('FAR: breachOpen false', out.result && out.result.breachOpen === false);
    T.ok('FAR: poured 0', out.result && out.result.poured === 0);
    T.ok('FAR: no pour-through line', out.line === false);

    // Turn the Pain path stamps openedBy / forceOpen after reach-1 contact.
    plantTitanBreach({
      includeAlly: true, allyAlive: true, playerAlive: true,
      playerMx: 1, playerMy: 1, monsterMx: 8, monsterMy: 8,
    });
    const holder = Game.tbfight.fighters.find(f => f.key === 'p');
    const forced = runPour({ opener: holder, openedBy: 'turn_the_pain' });
    T.ok('FORCE: breachOpen true via Turn the Pain open stamp', forced.result && forced.result.breachOpen === true);
    T.ok('FORCE: poured 1', forced.result && forced.result.poured === 1);
    T.ok('FORCE: pour-through line', forced.line === true);
  }

  T.section('non-titan fight: no pour even with OPA + allies adjacent');
  {
    clearGods();
    ascendPlayer('one_person_army');
    plantTitanBreach({ includeAlly: true, allyAlive: true, playerAlive: true });
    delete Game.state.titans._fight;
    Game.tbfight.fighters.forEach(f => { if (f.kind === 'monster') { delete f.titan; f.id = 'hushwolf'; } });
    const out = runPour();
    T.ok('NON-TITAN: titan false', out.result && out.result.titan === false);
    T.ok('NON-TITAN: breachOpen false', out.result && out.result.breachOpen === false);
    T.ok('NON-TITAN: no pour-through line', out.line === false);
  }

  T.section('non-OPA holders get no breach lean');
  {
    const gods = ['living_garden', 'voice_of_the_relay', 'unkillable', 'all_seeing', 'market_god', 'apex_predator'];
    for (const gid of gods) {
      clearGods();
      ascendPlayer(gid);
      T.ok(gid + ' helper returns 0', Game.opaBreachLeanFor() === 0);
      plantTitanBreach({ includeAlly: true, allyAlive: true, playerAlive: true });
      const out = runPour();
      T.ok(gid + ': breachOpen false', out.result && out.result.breachOpen === false);
      T.ok(gid + ': no pour-through line', out.line === false);
    }
  }

  T.section('NPC OPA holder leans breach pour-through');
  {
    clearGods();
    const npc = others[0];
    T.ok('fixture villager for NPC OPA', !!npc, others.length);
    T.ok('villager ascends OPA', ascendVillager(npc, 'one_person_army') === 'one_person_army');
    T.ok('NPC OPA helper returns lean', Game.opaBreachLeanFor() === leanVal,
      Game.opaBreachLeanFor());
    // Player down; NPC OPA is the front breach with a living ally behind.
    plantTitanBreach({
      includeAlly: true,
      allyAlive: true,
      playerAlive: false,
      extraFighter: {
        key: 'v_opa', kind: 'villager', villagerId: npc, name: 'OPA Face',
        alive: true, fled: false, hp: 40, maxHp: 100, mx: 5, my: 5,
      },
    });
    // Move the dead player off the front so adjacency is the NPC's.
    const deadP = Game.tbfight.fighters.find(f => f.key === 'p');
    if (deadP) { deadP.mx = 0; deadP.my = 0; }
    const holder = Game.tbfight.fighters.find(f => f.villagerId === npc);
    const ally = Game.tbfight.fighters.find(f => f.key === 'a_blade');
    const out = runPour({ opener: holder });
    T.ok('NPC: breachOpen true', out.result && out.result.breachOpen === true);
    T.ok('NPC: poured >= 1', out.result && out.result.poured >= 1, out.result && out.result.poured);
    T.ok('NPC: steadiness matches lean', out.result && out.result.steadiness === leanVal);
    T.ok('NPC: pour-through line', out.line === true);
    T.ok('NPC: ally pouredThrough', ally && ally.pouredThrough === true);
  }

  T.section('PARTY partyRallyAt and TITAN titanPain remain unlabeled as army');
  {
    clearGods();
    ascendPlayer('one_person_army');
    T.ok('partyRallyAt still 0.5 (PARTY axis untouched)', play.partyRallyAt === 0.5);
    plantTitanBreach({ includeAlly: true, allyAlive: true, playerAlive: true });
    const f = Game.tbfight;
    T.ok('titanPain map still present on fight GV (TITAN axis substrate)',
      !!(f._gv && typeof f._gv.titanPain === 'object'));
    // Low-HP party rally is a separate postHit path; army pour does not require low HP.
    const holder = f.fighters.find(x => x.key === 'p');
    holder.hp = holder.maxHp;
    const out = runPour({ opener: holder });
    T.ok('full-HP OPA still opens army breach (not partyRallyAt gate)',
      out.result && out.result.breachOpen === true);
    T.ok('army pour does not stamp GV.rallied party key as its done-when',
      !(f._gv && f._gv.rallied && f._gv.rallied[holder.key]));
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
    T.ok('Unkillable does not grant OPA breach lean', Game.opaBreachLeanFor() === 0);

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
    T.ok('OPA breach helper does not grant Unkillable last-standing lean', Game.unkillableLastStandingLeanFor() === 0);
    T.ok('OPA breach helper does not grant Apex scout lean', Game.apexScoutMarkLeanFor() === 0);
    T.ok('OPA breach helper does not grant All-Seeing council lean', Game.allSeeingCouncilLeanFor() === 0);
    T.ok('OPA breach helper does not grant Market outfit lean', Game.marketOutfitLeanFor() === 0);

    clearGods();
    ascendPlayer('apex_predator');
    T.ok('Apex scout helper still returns for Apex holder', Game.apexScoutMarkLeanFor() > 0);
    T.ok('Apex scout helper does not grant OPA breach lean', Game.opaBreachLeanFor() === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
