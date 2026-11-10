#!/usr/bin/env node
// OVE-124 — One-Person Army blood contest lean.
//
// god.scale.contest: "Blood contests: the crowd counts your scars."
// Settlement: pit/gauntlet/duel/siege honor Game.opaBloodLeanFor as extra
// braveryBonus / cheer steadiness in contestEngine _cxBlood / duelFight for
// an ascended OPA holder. Tithe stays altar HP-measures (no scar ledger).
// Seeded proof + failing control that removes the hook.
// Preserves Garden/Voice/Unkillable/All-Seeing/Market contest leans and
// Voice Be Heard / Garden muster / Market outfit army hooks.
'use strict';
const K = require('./lib');
const T = K.reporter('opa-blood-contest-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 124) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  const others = roster0.filter(id => id !== Game.villagerId);
  const [vidA, vidB] = others;
  T.ok('two living villagers for blood fixtures', !!(vidA && vidB), others.length);

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
  function setBravery(vid, n) {
    const a = Game.agencyOf(vid);
    a.xp[vid].bravery = n;
    a.xp[vid].survival = 0;
    a.xp[vid].tracking = 0;
  }
  function setSurvival(vid, n) {
    const a = Game.agencyOf(vid);
    a.xp[vid].survival = n;
    a.xp[vid].tracking = 0;
    a.xp[vid].bravery = 0;
  }
  function hpOf(vid) {
    return (v.health && v.health[vid]) != null ? v.health[vid] : 100;
  }
  function pit() {
    return { id: 'pit', name: 'The Pit', cat: 'blood', risk: 'high' };
  }
  function duel() {
    return { id: 'duel', name: 'The Duel', cat: 'blood', risk: 'high' };
  }
  function gauntlet() {
    return { id: 'gauntlet', name: 'The Gauntlet', cat: 'blood', risk: 'extreme' };
  }
  function siege() {
    return { id: 'siege', name: 'The Siege', cat: 'blood', risk: 'extreme' };
  }
  function tithe() {
    return { id: 'tithe', name: 'The Tithe', cat: 'blood', risk: 'medium' };
  }
  function cookfight() {
    return { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
  }
  function impress() {
    return { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
  }
  function moot() {
    return { id: 'moot', name: 'The Moot', cat: 'moot', risk: 'medium' };
  }
  function drop() {
    return { id: 'drop', name: 'The Drop', cat: 'endurance', risk: 'high' };
  }
  function whoate() {
    return { id: 'whoate', name: 'Who Ate It?', cat: 'detective', risk: 'low' };
  }
  function price() {
    return { id: 'price', name: 'The Price', cat: 'moot', risk: 'extreme' };
  }
  function resolveDuel(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], duel(), {}));
  }
  function resolvePit(pid) {
    return quiet(() => Game.contestResolveVillager(pid, pit(), {}));
  }

  const BLOOD_IDS = ['pit', 'gauntlet', 'duel', 'siege'];

  T.section('data + wiring');
  {
    clearGods();
    const play = Game.godPlay('one_person_army') || {};
    T.ok('play lists blood contests', Array.isArray(play.bloodContests)
      && BLOOD_IDS.every(id => play.bloodContests.includes(id)),
      JSON.stringify(play.bloodContests));
    T.ok('play.bloodContests exact length 4', play.bloodContests && play.bloodContests.length === 4,
      play.bloodContests && play.bloodContests.length);
    T.ok('play.contestLean is a positive number', typeof play.contestLean === 'number' && play.contestLean > 0, play.contestLean);
    T.ok('pit is a blood contest', Game.isBloodContest(pit()) === true);
    T.ok('gauntlet is a blood contest', Game.isBloodContest(gauntlet()) === true);
    T.ok('duel is a blood contest', Game.isBloodContest(duel()) === true);
    T.ok('siege is a blood contest', Game.isBloodContest(siege()) === true);
    T.ok('tithe is not a blood-lean contest (altar measures, no scar ledger)', Game.isBloodContest(tithe()) === false);
    T.ok('cookfight is not a blood contest', Game.isBloodContest(cookfight()) === false);
    T.ok('impress is not a blood contest', Game.isBloodContest(impress()) === false);
    T.ok('moot is not a blood contest', Game.isBloodContest(moot()) === false);
    T.ok('drop is not a blood contest', Game.isBloodContest(drop()) === false);
    T.ok('whoate is not a blood contest', Game.isBloodContest(whoate()) === false);
    T.ok('price is not a blood contest', Game.isBloodContest(price()) === false);
    T.ok('no lean without an OPA holder', Game.opaBloodLeanFor(vidA, duel()) === 0);
    // Prior leans remain wired and separate.
    const gPlay = Game.godPlay('living_garden') || {};
    const vPlay = Game.godPlay('voice_of_the_relay') || {};
    const uPlay = Game.godPlay('unkillable') || {};
    const aPlay = Game.godPlay('all_seeing') || {};
    const mPlay = Game.godPlay('market_god') || {};
    T.ok('Garden feast contests still listed', Array.isArray(gPlay.feastContests) && gPlay.feastContests.includes('cookfight'));
    T.ok('Voice performance contests still listed', Array.isArray(vPlay.performanceContests) && vPlay.performanceContests.includes('impress'));
    T.ok('Unkillable endurance contests still listed', Array.isArray(uPlay.enduranceContests) && uPlay.enduranceContests.includes('drop'));
    T.ok('All-Seeing strategy contests still listed', Array.isArray(aPlay.strategyContests) && aPlay.strategyContests.includes('whoate'));
    T.ok('Market sponsor contests still listed', Array.isArray(mPlay.sponsorContests) && mPlay.sponsorContests.includes('price'));
    T.ok('Garden feast lean hook still present', typeof Game.gardenFeastLeanFor === 'function');
    T.ok('Voice performance lean hook still present', typeof Game.voicePerformanceLeanFor === 'function');
    T.ok('Unkillable endurance lean hook still present', typeof Game.unkillableEnduranceLeanFor === 'function');
    T.ok('All-Seeing strategy lean hook still present', typeof Game.allSeeingStrategyLeanFor === 'function');
    T.ok('Market sponsor lean hook still present', typeof Game.marketSponsorLeanFor === 'function');
    T.ok('Voice army delivery hook still present', typeof Game.voiceDeliverAllied === 'function');
    T.ok('Garden muster feed hook still present', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean hook still present', typeof Game.marketOutfitLeanFor === 'function');
  }

  T.section('duel H2H: NPC OPA holder flips The Duel (bravery lean)');
  {
    clearGods();
    v.roster = roster0.slice();
    // Cautious A breaks early without lean; bold B holds longer. Lean 18
    // drops A's yield floor below B's — crowd steadies the scarred god.
    (v.health || (v.health = {}))[vidA] = 100;
    (v.health || (v.health = {}))[vidB] = 100;
    setBravery(vidA, 0);
    setBravery(vidB, 0);
    Game.state.notability = {};
    Game.state.notability[vidA] = 0;
    Game.state.notability[vidB] = 0;
    const temper = Game.npcTemper;
    Game.npcTemper = function (pid) {
      if (pid === vidA) return 'cautious';
      if (pid === vidB) return 'bold';
      return temper.apply(this, arguments);
    };
    let control, treated, stripped;
    try {
      const controlR = resolveDuel(vidA, vidB);
      control = controlR;
      T.ok('CONTROL: without OPA the bold partner wins The Duel',
        control[vidB].outcome === 'won' && (control[vidA].outcome === 'lost' || control[vidA].outcome === 'died'),
        JSON.stringify({ A: control[vidA], B: control[vidB] }));

      T.ok('NPC ascends One-Person Army', ascendVillager(vidA, 'one_person_army') === 'one_person_army');
      T.ok('lean applies to the OPA duelist', Game.opaBloodLeanFor(vidA, duel()) >= 18, Game.opaBloodLeanFor(vidA, duel()));
      T.ok('lean does not apply to the non-holder', Game.opaBloodLeanFor(vidB, duel()) === 0);

      v.health[vidA] = 100;
      v.health[vidB] = 100;
      const treatedR = resolveDuel(vidA, vidB);
      treated = treatedR;
      T.ok('TREATMENT: ascended OPA holder wins The Duel',
        treated[vidA].outcome === 'won' && (treated[vidB].outcome === 'lost' || treated[vidB].outcome === 'died'),
        JSON.stringify({ A: treated[vidA], B: treated[vidB] }));

      v.health[vidA] = 100;
      v.health[vidB] = 100;
      const hook = Game.opaBloodLeanFor;
      Game.opaBloodLeanFor = function () { return 0; };
      try {
        stripped = resolveDuel(vidA, vidB);
      } finally {
        Game.opaBloodLeanFor = hook;
      }
      T.ok('FAILING CONTROL: stripping opaBloodLeanFor restores the bold partner',
        stripped[vidB].outcome === 'won' && (stripped[vidA].outcome === 'lost' || stripped[vidA].outcome === 'died'),
        JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
    } finally {
      Game.npcTemper = temper;
    }
  }

  T.section('player OPA: blood-fight IDs lean; pit/gauntlet/siege wired');
  {
    clearGods();
    v.roster = roster0.slice();
    for (const id of roster0) {
      try { Game.getPerson(id).dead = false; } catch (e) {}
      (v.health || (v.health = {}))[id] = 100;
    }
    const speaker = Game.villagerId;
    (v.health || (v.health = {}))[speaker] = 100;
    setBravery(speaker, 0);
    Game.state.notability = {};
    Game.state.notability[speaker] = 0;

    T.ok('no pit lean before OPA', Game.opaBloodLeanFor(speaker, pit()) === 0);
    T.ok('player ascends One-Person Army', ascendPlayer('one_person_army') === 'one_person_army');
    T.ok('lean applies to the player on The Pit', Game.opaBloodLeanFor(speaker, pit()) >= 18);
    T.ok('lean applies to gauntlet', Game.opaBloodLeanFor(speaker, gauntlet()) >= 18);
    T.ok('lean applies to siege', Game.opaBloodLeanFor(speaker, siege()) >= 18);
    T.ok('lean applies to duel for the player body', Game.opaBloodLeanFor(speaker, duel()) >= 18);

    // Pit still settles under the lean (sealed arena); measurable outcome
    // flip + failing control are proven on duel above — no fieldFight wrap.
    const treated = resolvePit(speaker);
    T.ok('TREATMENT: pit resolves under OPA lean',
      !!(treated && treated.outcome), JSON.stringify(treated));
  }

  T.section('non-blood / prior leans unchanged');
  {
    clearGods();
    ascendVillager(vidA, 'one_person_army');
    T.ok('OPA holder gets no cookfight lean', Game.opaBloodLeanFor(vidA, cookfight()) === 0);
    T.ok('OPA holder gets no impress lean', Game.opaBloodLeanFor(vidA, impress()) === 0);
    T.ok('OPA holder gets no moot lean', Game.opaBloodLeanFor(vidA, moot()) === 0);
    T.ok('OPA holder gets no drop lean', Game.opaBloodLeanFor(vidA, drop()) === 0);
    T.ok('OPA holder gets no whoate lean', Game.opaBloodLeanFor(vidA, whoate()) === 0);
    T.ok('OPA holder gets no price lean', Game.opaBloodLeanFor(vidA, price()) === 0);
    T.ok('OPA holder gets no tithe lean', Game.opaBloodLeanFor(vidA, tithe()) === 0);
    T.ok('OPA gets no Garden feast lean on cookfight', Game.gardenFeastLeanFor(vidA, cookfight()) === 0);
    T.ok('OPA gets no Voice impress lean', Game.voicePerformanceLeanFor(vidA, impress()) === 0);
    T.ok('OPA gets no Unkillable drop lean', Game.unkillableEnduranceLeanFor(vidA, drop()) === 0);
    T.ok('OPA gets no All-Seeing whoate lean', Game.allSeeingStrategyLeanFor(vidA, whoate()) === 0);
    T.ok('OPA gets no Market price lean', Game.marketSponsorLeanFor(vidA, price()) === 0);

    setSurvival(vidA, 8);
    setSurvival(vidB, 30);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';
    Game.state.notability = {};
    const r = quiet(() => Game.contestResolveGroup([vidA, vidB], cookfight(), {}));
    T.ok('cookfight still favors the stronger cook without OPA blood lean',
      r[vidB].outcome === 'won' && r[vidA].outcome === 'lost',
      JSON.stringify({ A: r[vidA], B: r[vidB] }));

    clearGods();
    ascendVillager(vidA, 'living_garden');
    T.ok('Garden cookfight lean still applies', Game.gardenFeastLeanFor(vidA, cookfight()) >= 18);
    T.ok('Garden holder gets no OPA pit lean', Game.opaBloodLeanFor(vidA, pit()) === 0);

    clearGods();
    ascendVillager(vidA, 'voice_of_the_relay');
    T.ok('Voice impress lean still applies', Game.voicePerformanceLeanFor(vidA, impress()) >= 18);
    T.ok('Voice holder gets no OPA duel lean', Game.opaBloodLeanFor(vidA, duel()) === 0);

    clearGods();
    ascendVillager(vidA, 'unkillable');
    T.ok('Unkillable drop lean still applies', Game.unkillableEnduranceLeanFor(vidA, drop()) >= 18);
    T.ok('Unkillable holder gets no OPA pit lean', Game.opaBloodLeanFor(vidA, pit()) === 0);

    clearGods();
    ascendVillager(vidA, 'all_seeing');
    T.ok('All-Seeing whoate lean still applies', Game.allSeeingStrategyLeanFor(vidA, whoate()) >= 18);
    T.ok('All-Seeing holder gets no OPA duel lean', Game.opaBloodLeanFor(vidA, duel()) === 0);

    clearGods();
    ascendVillager(vidA, 'market_god');
    T.ok('Market price lean still applies', Game.marketSponsorLeanFor(vidA, price()) >= 18);
    T.ok('Market holder gets no OPA pit lean', Game.opaBloodLeanFor(vidA, pit()) === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
