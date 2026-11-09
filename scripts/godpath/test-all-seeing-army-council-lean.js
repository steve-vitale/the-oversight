#!/usr/bin/env node
// OVE-128 — All-Seeing army war-council map lean via titanWarCouncil.
//
// god.scale.army: "The coalition plans with your map."
// Settlement: titanWarCouncil honors Game.allSeeingCouncilLeanFor when an
// ascended All-Seeing holder is active — readiness honesty (naive vs true),
// scout-intel clarity (loyalty/temptation on the map), and counter-hint
// reveal while monsterCounterKnown is still false. Seeded proof + failing
// control that strips the helper. Preserves Garden/Market army + contest
// leans. Muse off.
'use strict';
const K = require('./lib');
const T = K.reporter('all-seeing-army-council-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 128) });
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

  const ovs = (Game.state.otherVillages || []).filter(ov => ov && ov.id && ov.id !== 'haven');
  T.ok('newRun supplies a foreign village', ovs.length >= 1, ovs.length);
  const ash = ovs[0];
  const day = s.day || 1;
  s.day = day;

  // One answering ally + one refusing ally → readinessGap > 0 for map honesty.
  const linkAsh = {
    id: 'link_' + ash.id,
    kind: 'covenant',
    a: 'haven',
    b: ash.id,
    primary: 'haven',
    subordinate: ash.id,
    status: 'active',
    trust: 60,
    day,
    arrears: 0,
    theirSpeaker: { id: 'ash_speaker', name: 'Mara Voss' },
    history: [],
  };
  const refuseId = 'refuse_fire';
  const refuseOv = {
    id: refuseId,
    name: 'Pale Crossing',
    opinion: 0,
    roster: [
      { id: 'pale_a', name: 'Pale One', alive: true, age: 30, health: 100 },
      { id: 'pale_b', name: 'Pale Two', alive: true, age: 28, health: 100 },
    ],
  };
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([refuseOv]);
  const linkRefuse = {
    id: 'link_' + refuseId,
    kind: 'covenant',
    a: 'haven',
    b: refuseId,
    primary: 'haven',
    subordinate: refuseId,
    status: 'active',
    trust: 10, // refusal: trust < 25
    day,
    arrears: 0,
    theirSpeaker: { id: 'pale_a', name: 'Pale One' },
    history: [],
  };
  // Ensure ash has living adults for readiness faces.
  ash.opinion = 20;
  if (!ash.roster || !ash.roster.length) {
    ash.roster = [
      { id: 'ash_speaker', name: 'Mara Voss', alive: true, age: 34, health: 100 },
      { id: 'ash_fighter', name: 'Tomm Rill', alive: true, age: 29, health: 100 },
    ];
  }
  Game.mshipState = () => ({ links: [linkAsh, linkRefuse], allies: [] });

  // Herald located; counter UNKNOWN so map lean can reveal it.
  Game.state.monsterCounters = Game.state.monsterCounters || {};
  delete Game.state.monsterCounters.herald;
  Game._titanTest.titanState().omens.herald = { stage: 2, day: day - 1, warned: {} };

  const play = Game.godPlay('all_seeing') || {};
  const leanVal = (typeof play.councilMapLean === 'number' && play.councilMapLean > 0)
    ? play.councilMapLean : 1;
  const heraldHint = ((Game.data.titans || {}).herald || {}).counter_hint || '';

  function runCouncil() {
    const said = [];
    const osay = Game.say;
    const osys = Game.sysSay;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    if (typeof osys === 'function') {
      Game.sysSay = function (t) { try { said.push(String(t)); } catch (e) {} return osys.call(this, t); };
    }
    let result = null;
    try {
      result = Game.titanWarCouncil('herald');
    } finally {
      Game.say = osay;
      if (typeof osys === 'function') Game.sysSay = osys;
    }
    return { result, said };
  }

  T.section('data + wiring');
  {
    clearGods();
    T.ok('allSeeingCouncilLeanFor is exported', typeof Game.allSeeingCouncilLeanFor === 'function');
    T.ok('play.councilMapLean is a positive number', typeof play.councilMapLean === 'number' && play.councilMapLean > 0,
      play.councilMapLean);
    T.ok('no lean without an All-Seeing holder', Game.allSeeingCouncilLeanFor() === 0);
    T.ok('strategy contests still listed', Array.isArray(play.strategyContests) && play.strategyContests.includes('whoate'));
    T.ok('herald counter_hint authored', !!heraldHint, heraldHint.slice(0, 60));
    T.ok('counter unknown before council', !(Game.monsterCounterKnown && Game.monsterCounterKnown('herald')));
    T.ok('Garden muster feed still exported', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean still exported', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('Voice Be Heard army helper still exported', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('CONTROL: council without All-Seeing → pale counter, no map lean');
  {
    clearGods();
    delete Game.state.monsterCounters.herald;
    const { result, said } = runCouncil();
    T.ok('CONTROL: allies sit', result && result.allies >= 1, result && result.allies);
    T.ok('CONTROL: lean field is 0', result && result.lean === 0, result && result.lean);
    T.ok('CONTROL: counter still unknown', result && result.counterKnown === false);
    T.ok('CONTROL: counter not revealed', result && result.counterRevealed === false);
    T.ok('CONTROL: no intel clarity flag', result && result.intelClarity === false);
    T.ok('CONTROL: pale weakness line', said.some(t => /weakness is unknown/i.test(t)),
      said.join(' | ').slice(0, 240));
    T.ok('CONTROL: no map-plans line', !said.some(t => /plans with your map/i.test(t)));
    T.ok('CONTROL: no map readiness honesty line', !said.some(t => /Your map names who answers/i.test(t)));
    T.ok('CONTROL: no map loyalty scout clarity', !said.some(t => /map loyalty/i.test(t)));
    T.ok('CONTROL: readinessGap still computed (refusal present)', result && result.readinessGap > 0,
      result && result.readinessGap);
  }

  T.section('TREATMENT: All-Seeing holder leans council map');
  {
    clearGods();
    delete Game.state.monsterCounters.herald;
    T.ok('player ascends All-Seeing', ascendPlayer('all_seeing') === 'all_seeing');
    T.ok('helper returns councilMapLean', Game.allSeeingCouncilLeanFor() === leanVal, Game.allSeeingCouncilLeanFor());
    const { result, said } = runCouncil();
    T.ok('TREATMENT: allies sit', result && result.allies >= 1, result && result.allies);
    T.ok('TREATMENT: lean field matches play', result && result.lean === leanVal, result && result.lean);
    T.ok('TREATMENT: counter still unknown in ledger', result && result.counterKnown === false);
    T.ok('TREATMENT: counter revealed on the map', result && result.counterRevealed === true);
    T.ok('TREATMENT: intel clarity flag', result && result.intelClarity === true);
    T.ok('TREATMENT: readinessGap > 0 (refusal honesty)', result && result.readinessGap > 0,
      result && result.readinessGap);
    T.ok('TREATMENT: map readiness honesty line',
      said.some(t => /Your map names who answers/i.test(t) && /blades true/i.test(t)),
      said.join(' | ').slice(0, 280));
    T.ok('TREATMENT: map loyalty scout clarity', said.some(t => /map loyalty/i.test(t)));
    T.ok('TREATMENT: map marks weakness line',
      said.some(t => /map marks its weakness/i.test(t) && heraldHint && t.indexOf(heraldHint.slice(0, 20)) >= 0),
      said.join(' | ').slice(0, 280));
    T.ok('TREATMENT: plans-with-your-map line', said.some(t => /plans with your map/i.test(t)));
    T.ok('TREATMENT: does not permanently teach counter',
      !(Game.monsterCounterKnown && Game.monsterCounterKnown('herald')));
  }

  T.section('FAILING CONTROL: strip allSeeingCouncilLeanFor');
  {
    clearGods();
    delete Game.state.monsterCounters.herald;
    ascendPlayer('all_seeing');
    const hook = Game.allSeeingCouncilLeanFor;
    Game.allSeeingCouncilLeanFor = function () { return 0; };
    let result, said;
    try {
      ({ result, said } = runCouncil());
    } finally {
      Game.allSeeingCouncilLeanFor = hook;
    }
    T.ok('FAILING CONTROL: allies still sit', result && result.allies >= 1);
    T.ok('FAILING CONTROL: lean collapses to 0', result && result.lean === 0, result && result.lean);
    T.ok('FAILING CONTROL: counter not revealed', result && result.counterRevealed === false);
    T.ok('FAILING CONTROL: no intel clarity', result && result.intelClarity === false);
    T.ok('FAILING CONTROL: pale weakness restored', said.some(t => /weakness is unknown/i.test(t)));
    T.ok('FAILING CONTROL: no map-plans line', !said.some(t => /plans with your map/i.test(t)));
    T.ok('FAILING CONTROL: player is still All-Seeing (ascended alone is not army LIVE)',
      Game.holderGod('player') === 'all_seeing');
  }

  T.section('known counter uses scout-knows branch (herald has no monster.counter)');
  {
    // Herald's monster def has no `counter` field, so monsterCounterKnown is
    // always false even if state.monsterCounters.herald is set. Stub the
    // convention to prove the known-path narration when the gate is true.
    clearGods();
    delete Game.state.monsterCounters.herald;
    ascendPlayer('all_seeing');
    const savedKnown = Game.monsterCounterKnown;
    Game.monsterCounterKnown = function (id) { return id === 'herald'; };
    let result, said;
    try {
      ({ result, said } = runCouncil());
    } finally {
      Game.monsterCounterKnown = savedKnown;
    }
    T.ok('KNOWN: counterKnown true', result && result.counterKnown === true);
    T.ok('KNOWN: counterRevealed true', result && result.counterRevealed === true);
    T.ok('KNOWN: scout-knows line (not map-marks-before)',
      said.some(t => /scouts know its weakness/i.test(t)),
      said.join(' | ').slice(0, 240));
    T.ok('KNOWN: no map-marks-before line', !said.some(t => /map marks its weakness before/i.test(t)));
    T.ok('KNOWN: map lean still names readiness', said.some(t => /Your map names who answers/i.test(t)));
  }

  T.section('non-All-Seeing holders get no council map lean');
  {
    const gods = ['living_garden', 'voice_of_the_relay', 'unkillable', 'market_god', 'one_person_army'];
    for (const gid of gods) {
      clearGods();
      delete Game.state.monsterCounters.herald;
      ascendPlayer(gid);
      T.ok(gid + ' helper returns 0', Game.allSeeingCouncilLeanFor() === 0);
      const out = runCouncil();
      T.ok(gid + ': lean 0', out.result && out.result.lean === 0, out.result && out.result.lean);
      T.ok(gid + ': counter not revealed', out.result && out.result.counterRevealed === false);
      T.ok(gid + ': no map-plans line', !out.said.some(t => /plans with your map/i.test(t)));
    }
  }

  T.section('NPC All-Seeing holder leans council');
  {
    clearGods();
    delete Game.state.monsterCounters.herald;
    const others = (v.roster || []).filter(id => id !== Game.villagerId);
    const vid = others[0];
    T.ok('fixture villager for NPC All-Seeing', !!vid, others.length);
    T.ok('villager ascends All-Seeing', ascendVillager(vid, 'all_seeing') === 'all_seeing');
    T.ok('NPC All-Seeing helper returns lean', Game.allSeeingCouncilLeanFor() === leanVal,
      Game.allSeeingCouncilLeanFor());
    const { result, said } = runCouncil();
    T.ok('NPC All-Seeing: lean field set', result && result.lean === leanVal);
    T.ok('NPC All-Seeing: counter revealed', result && result.counterRevealed === true);
    T.ok('NPC All-Seeing: map-plans line', said.some(t => /plans with your map/i.test(t)));
  }

  T.section('prior army + contest leans preserved');
  {
    clearGods();
    delete v.harvestDay;
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

    clearGods();
    ascendPlayer('all_seeing');
    T.ok('All-Seeing strategy lean still fires for whoate', Game.allSeeingStrategyLeanFor(Game.villagerId, whoate) > 0);
    T.ok('All-Seeing strategy lean still ignores cookfight', Game.allSeeingStrategyLeanFor(Game.villagerId, cookfight) === 0);

    clearGods();
    ascendPlayer('market_god');
    T.ok('Market sponsor lean still fires for price', Game.marketSponsorLeanFor(Game.villagerId, price) > 0);
    T.ok('Market outfit lean still returns for Market holder', Game.marketOutfitLeanFor() > 0);

    clearGods();
    ascendPlayer('one_person_army');
    T.ok('OPA blood lean still fires for pit', Game.opaBloodLeanFor(Game.villagerId, pit) > 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
