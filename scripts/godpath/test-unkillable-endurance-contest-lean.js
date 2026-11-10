#!/usr/bin/env node
// OVE-108 — Unkillable endurance contest lean.
//
// god.scale.contest: "Endurance contests lean your way."
// Settlement: real _cxEndurance arms honor Game.unkillableEnduranceLeanFor
// for an ascended Unkillable holder (starve HP/days, drop/exchange survival
// for time, maw/vigil nerve). Seeded proof + failing control that removes
// the hook. Preserves Garden feast lean, Voice performance lean, and Voice
// Be Heard allied delivery.
'use strict';
const K = require('./lib');
const T = K.reporter('unkillable-endurance-contest-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 108) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  const others = roster0.filter(id => id !== Game.villagerId);
  const [vidA, vidB] = others;
  T.ok('two living villagers for endurance fixtures', !!(vidA && vidB), others.length);

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
  function setSurvival(vid, n) {
    const a = Game.agencyOf(vid);
    a.xp[vid].survival = n;
    a.xp[vid].tracking = 0;
    a.xp[vid].bravery = 0;
  }
  function setBravery(vid, n) {
    const a = Game.agencyOf(vid);
    a.xp[vid].bravery = n;
    a.xp[vid].survival = 0;
    a.xp[vid].tracking = 0;
  }
  function setHp(vid, n) {
    (v.health || (v.health = {}))[vid] = n;
  }
  function drop() {
    return { id: 'drop', name: 'The Drop', cat: 'endurance', risk: 'high' };
  }
  function vigil() {
    return { id: 'vigil', name: 'The Vigil', cat: 'endurance', risk: 'high' };
  }
  function starve() {
    return { id: 'starve', name: 'Hollow Belly', cat: 'endurance', risk: 'medium' };
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
  function resolveDrop(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], drop(), {}));
  }
  function resolveVigil(pid) {
    return quiet(() => Game.contestResolveVillager(pid, vigil(), {}));
  }

  T.section('data + wiring');
  {
    clearGods();
    const play = Game.godPlay('unkillable') || {};
    T.ok('play lists endurance contests', Array.isArray(play.enduranceContests)
      && play.enduranceContests.includes('drop')
      && play.enduranceContests.includes('starve')
      && play.enduranceContests.includes('maw')
      && play.enduranceContests.includes('vigil')
      && play.enduranceContests.includes('exchange'));
    T.ok('play.contestLean is a positive number', typeof play.contestLean === 'number' && play.contestLean > 0, play.contestLean);
    T.ok('drop is an endurance contest', Game.isEnduranceContest(drop()) === true);
    T.ok('vigil is an endurance contest', Game.isEnduranceContest(vigil()) === true);
    T.ok('starve is an endurance contest', Game.isEnduranceContest(starve()) === true);
    T.ok('cookfight is not an endurance contest', Game.isEnduranceContest(cookfight()) === false);
    T.ok('impress is not an endurance contest', Game.isEnduranceContest(impress()) === false);
    T.ok('moot is not an endurance contest', Game.isEnduranceContest(moot()) === false);
    T.ok('no lean without an Unkillable holder', Game.unkillableEnduranceLeanFor(vidA, drop()) === 0);
    // Prior contest + army leans remain wired and separate.
    const gPlay = Game.godPlay('living_garden') || {};
    const vPlay = Game.godPlay('voice_of_the_relay') || {};
    T.ok('Garden feast contests still listed', Array.isArray(gPlay.feastContests) && gPlay.feastContests.includes('cookfight'));
    T.ok('Voice performance contests still listed', Array.isArray(vPlay.performanceContests) && vPlay.performanceContests.includes('impress'));
    T.ok('Garden feast lean hook still present', typeof Game.gardenFeastLeanFor === 'function');
    T.ok('Voice performance lean hook still present', typeof Game.voicePerformanceLeanFor === 'function');
    T.ok('Voice army delivery hook still present', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('drop: NPC Unkillable holder flips the race');
  {
    clearGods();
    v.roster = roster0.slice();
    // Strong peer vs weak Unkillable candidate. Without lean the peer wins
    // The Drop; with Unkillable survival lean the holder finishes first.
    // Reset HP between resolves — drop costs 30 HP per run.
    function pinDrop() {
      setSurvival(vidA, 15);
      setSurvival(vidB, 30);
      setHp(vidA, 100);
      setHp(vidB, 100);
      const ag = Game.agencyState();
      ag.potential = ag.potential || {};
      ag.potential[vidA] = 'steady';
      ag.potential[vidB] = 'steady';
      Game.state.notability = {};
      v.trust = v.trust || {};
      v.trust[vidA] = 10;
      v.trust[vidB] = 10;
    }

    pinDrop();
    const control = resolveDrop(vidA, vidB);
    T.ok('CONTROL: without Unkillable the stronger runner wins', control[vidB].outcome === 'won' && control[vidA].outcome === 'lost',
      JSON.stringify({ A: control[vidA], B: control[vidB] }));

    T.ok('NPC ascends Unkillable', ascendVillager(vidA, 'unkillable') === 'unkillable');
    pinDrop();
    T.ok('lean applies to the Unkillable runner', Game.unkillableEnduranceLeanFor(vidA, drop()) >= 18, Game.unkillableEnduranceLeanFor(vidA, drop()));
    T.ok('lean does not apply to the non-Unkillable runner', Game.unkillableEnduranceLeanFor(vidB, drop()) === 0);

    const treated = resolveDrop(vidA, vidB);
    T.ok('TREATMENT: ascended Unkillable holder wins The Drop', treated[vidA].outcome === 'won' && treated[vidB].outcome === 'lost',
      JSON.stringify({ A: treated[vidA], B: treated[vidB] }));

    // Failing control: remove the settlement hook; Unkillable still ascended.
    pinDrop();
    const hook = Game.unkillableEnduranceLeanFor;
    Game.unkillableEnduranceLeanFor = function () { return 0; };
    let stripped;
    try {
      stripped = resolveDrop(vidA, vidB);
    } finally {
      Game.unkillableEnduranceLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping unkillableEnduranceLeanFor restores the stronger runner',
      stripped[vidB].outcome === 'won' && stripped[vidA].outcome === 'lost',
      JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
  }

  T.section('vigil: player Unkillable holder holds until dawn');
  {
    clearGods();
    v.roster = roster0.slice();
    const watch = Game.villagerId;
    // High vigil fear peaks at 34 on watch 4. Bravery 31 loses without lean
    // (abandons on watch 3); with +18 nerve the holder clears all four.
    setBravery(watch, 31);
    setHp(watch, 100);
    Game.state.notability = Game.state.notability || {};
    Game.state.notability[watch] = 0;
    v.trust = v.trust || {};
    v.trust[watch] = 10;

    const controlR = resolveVigil(watch);
    T.ok('CONTROL: without Unkillable the quiet watcher loses The Vigil', controlR.outcome === 'lost', JSON.stringify(controlR));

    T.ok('player ascends Unkillable', ascendPlayer('unkillable') === 'unkillable');
    T.ok('lean applies to the player watcher body', Game.unkillableEnduranceLeanFor(watch, vigil()) >= 18);

    const treatedR = resolveVigil(watch);
    T.ok('TREATMENT: Unkillable watcher wins The Vigil', treatedR.outcome === 'won', JSON.stringify(treatedR));

    const hook = Game.unkillableEnduranceLeanFor;
    Game.unkillableEnduranceLeanFor = function () { return 0; };
    let stripped;
    try {
      stripped = resolveVigil(watch).outcome;
    } finally {
      Game.unkillableEnduranceLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping the hook loses The Vigil again', stripped === 'lost', stripped);
  }

  T.section('non-endurance / feast / performance boundary unchanged');
  {
    clearGods();
    ascendVillager(vidA, 'unkillable');
    T.ok('Unkillable holder gets no cookfight lean', Game.unkillableEnduranceLeanFor(vidA, cookfight()) === 0);
    T.ok('Unkillable holder gets no impress lean', Game.unkillableEnduranceLeanFor(vidA, impress()) === 0);
    T.ok('Unkillable holder gets no moot lean', Game.unkillableEnduranceLeanFor(vidA, moot()) === 0);
    T.ok('Unkillable holder gets no Garden feast lean on cookfight', Game.gardenFeastLeanFor(vidA, cookfight()) === 0);
    T.ok('Unkillable holder gets no Voice performance lean on impress', Game.voicePerformanceLeanFor(vidA, impress()) === 0);

    setSurvival(vidA, 8);
    setSurvival(vidB, 30);
    setHp(vidA, 100);
    setHp(vidB, 100);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';
    Game.state.notability = {};
    const cook = quiet(() => Game.contestResolveGroup([vidA, vidB], cookfight(), {}));
    T.ok('cookfight still favors the stronger cook without Unkillable lean', cook[vidB].outcome === 'won' && cook[vidA].outcome === 'lost',
      JSON.stringify({ A: cook[vidA], B: cook[vidB] }));
    const show = quiet(() => Game.contestResolveGroup([vidA, vidB], impress(), {}));
    T.ok('impress still favors the stronger maker without Unkillable lean', show[vidB].outcome === 'won' && show[vidA].outcome === 'lost',
      JSON.stringify({ A: show[vidA], B: show[vidB] }));

    // Garden feast lean still works when Garden holds cookfight.
    clearGods();
    ascendVillager(vidA, 'living_garden');
    T.ok('Garden cookfight lean still applies', Game.gardenFeastLeanFor(vidA, cookfight()) >= 18);
    T.ok('Garden holder gets no Unkillable drop lean', Game.unkillableEnduranceLeanFor(vidA, drop()) === 0);

    // Voice performance lean still works when Voice holds impress.
    clearGods();
    ascendVillager(vidA, 'voice_of_the_relay');
    T.ok('Voice impress lean still applies', Game.voicePerformanceLeanFor(vidA, impress()) >= 18);
    T.ok('Voice holder gets no Unkillable vigil lean', Game.unkillableEnduranceLeanFor(vidA, vigil()) === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
