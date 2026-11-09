#!/usr/bin/env node
// OVE-148 — Between chase/race contest lean.
//
// god.scale.contest: "Chases and races lean your way."
// Settlement: hide seek/evasion tracking pad + calorie_run forage yield in
// contestEngine _cxOther honor Game.betweenChaseLeanFor for an ascended
// Between holder. Exact ID list: hide, calorie_run.
// Seeded proof + failing control that removes the hook.
// Preserves Garden/Voice/Unkillable/All-Seeing/Market/OPA contest leans and
// prior army leans; Unkillable endurance IDs get no Between lean.
'use strict';
const K = require('./lib');
const T = K.reporter('between-chase-contest-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 148) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  const others = roster0.filter(id => id !== Game.villagerId);
  const [vidA, vidB] = others;
  T.ok('two living villagers for chase fixtures', !!(vidA && vidB), others.length);

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
  function setTrackSurvive(vid, tracking, survival) {
    const a = Game.agencyOf(vid);
    a.xp[vid].tracking = tracking;
    a.xp[vid].survival = survival;
    a.xp[vid].bravery = 0;
  }
  function hide() {
    return { id: 'hide', name: 'Hide and Seek', cat: 'weird', risk: 'extreme' };
  }
  function calorieRun() {
    return { id: 'calorie_run', name: 'Calorie Run', cat: 'forage', risk: 'medium' };
  }
  function pantryRaid() {
    return { id: 'pantry_raid', name: 'Pantry Raid', cat: 'forage', risk: 'medium' };
  }
  function drop() {
    return { id: 'drop', name: 'The Drop', cat: 'endurance', risk: 'high' };
  }
  function cookfight() {
    return { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
  }
  function impress() {
    return { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
  }
  function whoate() {
    return { id: 'whoate', name: 'Who Ate It?', cat: 'detective', risk: 'low' };
  }
  function price() {
    return { id: 'price', name: 'The Price', cat: 'moot', risk: 'medium' };
  }
  function pit() {
    return { id: 'pit', name: 'The Pit', cat: 'blood', risk: 'high' };
  }
  function resolveHide(pid) {
    return quiet(() => Game.contestResolveVillager(pid, hide(), {}));
  }
  function resolveCalorie(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], calorieRun(), {}));
  }

  const CHASE_IDS = ['hide', 'calorie_run'];
  const ENDURANCE_IDS = ['drop', 'starve', 'maw', 'vigil', 'exchange'];

  T.section('data + wiring');
  {
    clearGods();
    const play = Game.godPlay('the_between') || {};
    T.ok('play lists chase contests', Array.isArray(play.chaseContests)
      && CHASE_IDS.every(id => play.chaseContests.includes(id)),
      JSON.stringify(play.chaseContests));
    T.ok('play.chaseContests exact length 2', play.chaseContests && play.chaseContests.length === 2,
      play.chaseContests && play.chaseContests.length);
    T.ok('play.contestLean is a positive number', typeof play.contestLean === 'number' && play.contestLean > 0, play.contestLean);
    T.ok('hide is a chase contest', Game.isChaseContest(hide()) === true);
    T.ok('calorie_run is a chase contest', Game.isChaseContest(calorieRun()) === true);
    T.ok('pantry_raid is not a chase contest', Game.isChaseContest(pantryRaid()) === false);
    T.ok('drop is not a chase contest', Game.isChaseContest(drop()) === false);
    T.ok('cookfight is not a chase contest', Game.isChaseContest(cookfight()) === false);
    T.ok('impress is not a chase contest', Game.isChaseContest(impress()) === false);
    T.ok('whoate is not a chase contest', Game.isChaseContest(whoate()) === false);
    T.ok('price is not a chase contest', Game.isChaseContest(price()) === false);
    T.ok('pit is not a chase contest', Game.isChaseContest(pit()) === false);
    for (const id of ENDURANCE_IDS) {
      T.ok(`Unkillable endurance id ${id} is not a chase contest`,
        Game.isChaseContest({ id, cat: 'endurance' }) === false);
    }
    T.ok('no lean without a Between holder', Game.betweenChaseLeanFor(vidA, hide()) === 0);

    // Prior contest + army leans remain wired and separate.
    const gPlay = Game.godPlay('living_garden') || {};
    const vPlay = Game.godPlay('voice_of_the_relay') || {};
    const uPlay = Game.godPlay('unkillable') || {};
    const aPlay = Game.godPlay('all_seeing') || {};
    const mPlay = Game.godPlay('market_god') || {};
    const oPlay = Game.godPlay('one_person_army') || {};
    const wPlay = Game.godPlay('undying_ward') || {};
    T.ok('Garden feast contests still listed', Array.isArray(gPlay.feastContests) && gPlay.feastContests.includes('cookfight'));
    T.ok('Voice performance contests still listed', Array.isArray(vPlay.performanceContests) && vPlay.performanceContests.includes('impress'));
    T.ok('Unkillable endurance contests still listed', Array.isArray(uPlay.enduranceContests) && uPlay.enduranceContests.includes('drop'));
    T.ok('All-Seeing strategy contests still listed', Array.isArray(aPlay.strategyContests) && aPlay.strategyContests.includes('whoate'));
    T.ok('Market sponsor contests still listed', Array.isArray(mPlay.sponsorContests) && mPlay.sponsorContests.includes('price'));
    T.ok('OPA blood contests still listed', Array.isArray(oPlay.bloodContests) && oPlay.bloodContests.includes('pit'));
    T.ok('Ward advanceLean still present', typeof wPlay.advanceLean === 'number' && wPlay.advanceLean > 0, wPlay.advanceLean);
    T.ok('Garden feast lean hook still present', typeof Game.gardenFeastLeanFor === 'function');
    T.ok('Voice performance lean hook still present', typeof Game.voicePerformanceLeanFor === 'function');
    T.ok('Unkillable endurance lean hook still present', typeof Game.unkillableEnduranceLeanFor === 'function');
    T.ok('All-Seeing strategy lean hook still present', typeof Game.allSeeingStrategyLeanFor === 'function');
    T.ok('Market sponsor lean hook still present', typeof Game.marketSponsorLeanFor === 'function');
    T.ok('OPA blood lean hook still present', typeof Game.opaBloodLeanFor === 'function');
    T.ok('Voice army delivery hook still present', typeof Game.voiceDeliverAllied === 'function');
    T.ok('Garden muster feed hook still present', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean hook still present', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('All-Seeing council lean hook still present', typeof Game.allSeeingCouncilLeanFor === 'function');
    T.ok('Apex scout-mark lean hook still present', typeof Game.apexScoutMarkLeanFor === 'function');
    T.ok('Unkillable last-standing lean hook still present', typeof Game.unkillableLastStandingLeanFor === 'function');
    T.ok('OPA breach lean hook still present', typeof Game.opaBreachLeanFor === 'function');
    T.ok('Ward advance lean hook still present', typeof Game.wardAdvanceLeanFor === 'function');
  }

  T.section('calorie_run H2H: NPC Between holder flips the race');
  {
    clearGods();
    v.roster = roster0.slice();
    // Yield = tracking + survival (+clever). Weak A vs strong B; lean 18 flips.
    setTrackSurvive(vidA, 8, 0);
    setTrackSurvive(vidB, 20, 0);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';

    const control = resolveCalorie(vidA, vidB);
    T.ok('CONTROL: without Between the stronger forager wins', control[vidB].outcome === 'won' && control[vidA].outcome === 'lost',
      JSON.stringify({ A: control[vidA], B: control[vidB] }));

    T.ok('NPC ascends Between', ascendVillager(vidA, 'the_between') === 'the_between');
    T.ok('lean applies to the Between runner', Game.betweenChaseLeanFor(vidA, calorieRun()) >= 18, Game.betweenChaseLeanFor(vidA, calorieRun()));
    T.ok('lean does not apply to the non-Between forager', Game.betweenChaseLeanFor(vidB, calorieRun()) === 0);

    const treated = resolveCalorie(vidA, vidB);
    T.ok('TREATMENT: ascended Between holder wins Calorie Run', treated[vidA].outcome === 'won' && treated[vidB].outcome === 'lost',
      JSON.stringify({ A: treated[vidA], B: treated[vidB] }));

    const hook = Game.betweenChaseLeanFor;
    Game.betweenChaseLeanFor = function () { return 0; };
    let stripped;
    try {
      stripped = resolveCalorie(vidA, vidB);
    } finally {
      Game.betweenChaseLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping betweenChaseLeanFor restores the stronger forager',
      stripped[vidB].outcome === 'won' && stripped[vidA].outcome === 'lost',
      JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
  }

  T.section('hide: player Between holder evades where control is found');
  {
    clearGods();
    v.roster = roster0.slice();
    const hider = Game.villagerId;
    // Pin low tracking so the seeker finds them without Between lean; lean 18
    // as spot pad (lean/25) flips seeded hide settlement to never found.
    setTrackSurvive(hider, 0, 0);
    (v.health || (v.health = {}))[hider] = 100;

    let control, treated, stripped;
    const controlR = resolveHide(hider);
    control = controlR.outcome;
    T.ok('CONTROL: without Between the hider is found', control !== 'won', JSON.stringify(controlR));

    T.ok('player ascends Between', ascendPlayer('the_between') === 'the_between');
    T.ok('lean applies to the player hider body', Game.betweenChaseLeanFor(hider, hide()) >= 18, Game.betweenChaseLeanFor(hider, hide()));

    const treatedR = resolveHide(hider);
    treated = treatedR.outcome;
    T.ok('TREATMENT: Between hider is never found', treated === 'won' && treatedR.detail === 'never found',
      JSON.stringify(treatedR));

    const hook = Game.betweenChaseLeanFor;
    Game.betweenChaseLeanFor = function () { return 0; };
    try {
      stripped = resolveHide(hider);
    } finally {
      Game.betweenChaseLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping the hook finds the hider again', stripped.outcome !== 'won',
      JSON.stringify(stripped));
  }

  T.section('non-chase + prior leans unchanged');
  {
    clearGods();
    ascendVillager(vidA, 'the_between');
    T.ok('Between holder gets no drop lean', Game.betweenChaseLeanFor(vidA, drop()) === 0);
    T.ok('Between holder gets no cookfight lean', Game.betweenChaseLeanFor(vidA, cookfight()) === 0);
    T.ok('Between holder gets no impress lean', Game.betweenChaseLeanFor(vidA, impress()) === 0);
    T.ok('Between holder gets no whoate lean', Game.betweenChaseLeanFor(vidA, whoate()) === 0);
    T.ok('Between holder gets no price lean', Game.betweenChaseLeanFor(vidA, price()) === 0);
    T.ok('Between holder gets no pit lean', Game.betweenChaseLeanFor(vidA, pit()) === 0);
    T.ok('Between holder gets no pantry_raid lean', Game.betweenChaseLeanFor(vidA, pantryRaid()) === 0);
    T.ok('Between holder gets no Garden feast lean on cookfight', Game.gardenFeastLeanFor(vidA, cookfight()) === 0);
    T.ok('Between holder gets no Voice performance lean on impress', Game.voicePerformanceLeanFor(vidA, impress()) === 0);
    T.ok('Between holder gets no Unkillable endurance lean on drop', Game.unkillableEnduranceLeanFor(vidA, drop()) === 0);
    T.ok('Between holder gets no All-Seeing strategy lean on whoate', Game.allSeeingStrategyLeanFor(vidA, whoate()) === 0);
    T.ok('Between holder gets no Market sponsor lean on price', Game.marketSponsorLeanFor(vidA, price()) === 0);
    T.ok('Between holder gets no OPA blood lean on pit', Game.opaBloodLeanFor(vidA, pit()) === 0);

    // Prior contest leans still fire when their own holder is ascended.
    clearGods();
    ascendVillager(vidA, 'living_garden');
    T.ok('Garden cookfight lean still applies', Game.gardenFeastLeanFor(vidA, cookfight()) >= 18);
    T.ok('Garden holder gets no Between hide lean', Game.betweenChaseLeanFor(vidA, hide()) === 0);

    clearGods();
    ascendVillager(vidA, 'voice_of_the_relay');
    T.ok('Voice impress lean still applies', Game.voicePerformanceLeanFor(vidA, impress()) >= 18);
    T.ok('Voice holder gets no Between calorie lean', Game.betweenChaseLeanFor(vidA, calorieRun()) === 0);

    clearGods();
    ascendVillager(vidA, 'unkillable');
    T.ok('Unkillable drop lean still applies', Game.unkillableEnduranceLeanFor(vidA, drop()) >= 18);
    T.ok('Unkillable holder gets no Between hide lean', Game.betweenChaseLeanFor(vidA, hide()) === 0);

    clearGods();
    ascendVillager(vidA, 'all_seeing');
    T.ok('All-Seeing whoate lean still applies', Game.allSeeingStrategyLeanFor(vidA, whoate()) >= 18);
    T.ok('All-Seeing holder gets no Between hide lean', Game.betweenChaseLeanFor(vidA, hide()) === 0);

    clearGods();
    ascendVillager(vidA, 'market_god');
    T.ok('Market price lean still applies', Game.marketSponsorLeanFor(vidA, price()) >= 18);
    T.ok('Market holder gets no Between calorie lean', Game.betweenChaseLeanFor(vidA, calorieRun()) === 0);

    clearGods();
    ascendVillager(vidA, 'one_person_army');
    T.ok('OPA pit lean still applies', Game.opaBloodLeanFor(vidA, pit()) >= 18);
    T.ok('OPA holder gets no Between hide lean', Game.betweenChaseLeanFor(vidA, hide()) === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
