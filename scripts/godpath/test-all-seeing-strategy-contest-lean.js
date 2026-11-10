#!/usr/bin/env node
// OVE-110 — All-Seeing strategy contest lean.
//
// god.scale.contest: "Strategy contests: nobody bluffs you."
// Settlement: puzzle/detective scores in contestEngine _cxOther and lies
// case scores in _cxMoot add Game.allSeeingStrategyLeanFor for an ascended
// All-Seeing holder. Exact ID list:
//   puzzle: box, pattern, riddle, sorting, lockpick, wrongmap
//   detective: whoate, informant, confession, witness, alibi, echo
//   strategy-bluff: lies (Lie Detector; moot cat — No Lies / nobody bluffs
//   you; not oath/quiet/price; not Voice's moot oratory)
// Seeded proof + failing control that removes the hook.
// Preserves Garden feast lean, Voice performance lean, Unkillable endurance
// lean, and Voice Be Heard allied delivery.
'use strict';
const K = require('./lib');
const T = K.reporter('all-seeing-strategy-contest-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 110) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  const others = roster0.filter(id => id !== Game.villagerId);
  const [vidA, vidB] = others;
  T.ok('two living villagers for strategy fixtures', !!(vidA && vidB), others.length);

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
  function setTracking(vid, n) {
    const a = Game.agencyOf(vid);
    a.xp[vid].tracking = n;
    a.xp[vid].survival = 0;
    a.xp[vid].bravery = 0;
  }
  function setSurvival(vid, n) {
    const a = Game.agencyOf(vid);
    a.xp[vid].survival = n;
    a.xp[vid].tracking = 0;
    a.xp[vid].bravery = 0;
  }
  function whoate() {
    return { id: 'whoate', name: 'Who Ate It?', cat: 'detective', risk: 'low' };
  }
  function box() {
    return { id: 'box', name: 'The Box', cat: 'puzzle', risk: 'medium' };
  }
  function lies() {
    return { id: 'lies', name: 'Lie Detector', cat: 'moot', risk: 'low' };
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
  function resolveWhoate(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], whoate(), {}));
  }
  function resolveBox(pid) {
    return quiet(() => Game.contestResolveVillager(pid, box(), {}));
  }
  function resolveLies(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], lies(), {}));
  }

  const STRATEGY_IDS = [
    'box', 'pattern', 'riddle', 'sorting', 'lockpick', 'wrongmap',
    'whoate', 'informant', 'confession', 'witness', 'alibi', 'echo',
    'lies'
  ];

  T.section('data + wiring');
  {
    clearGods();
    const play = Game.godPlay('all_seeing') || {};
    T.ok('play lists strategy contests', Array.isArray(play.strategyContests)
      && STRATEGY_IDS.every(id => play.strategyContests.includes(id)),
      JSON.stringify(play.strategyContests));
    T.ok('play.strategyContests exact length 13', play.strategyContests && play.strategyContests.length === 13,
      play.strategyContests && play.strategyContests.length);
    T.ok('play.contestLean is a positive number', typeof play.contestLean === 'number' && play.contestLean > 0, play.contestLean);
    T.ok('whoate is a strategy contest', Game.isStrategyContest(whoate()) === true);
    T.ok('box is a strategy contest', Game.isStrategyContest(box()) === true);
    T.ok('lies is a strategy contest (bluff / No Lies)', Game.isStrategyContest(lies()) === true);
    T.ok('cookfight is not a strategy contest', Game.isStrategyContest(cookfight()) === false);
    T.ok('impress is not a strategy contest', Game.isStrategyContest(impress()) === false);
    T.ok('moot oratory is not a strategy contest (Voice keeps it)', Game.isStrategyContest(moot()) === false);
    T.ok('drop is not a strategy contest', Game.isStrategyContest(drop()) === false);
    T.ok('no lean without an All-Seeing holder', Game.allSeeingStrategyLeanFor(vidA, whoate()) === 0);
    // Prior leans remain wired and separate.
    const gPlay = Game.godPlay('living_garden') || {};
    const vPlay = Game.godPlay('voice_of_the_relay') || {};
    const uPlay = Game.godPlay('unkillable') || {};
    T.ok('Garden feast contests still listed', Array.isArray(gPlay.feastContests) && gPlay.feastContests.includes('cookfight'));
    T.ok('Voice performance contests still listed', Array.isArray(vPlay.performanceContests) && vPlay.performanceContests.includes('impress'));
    T.ok('Unkillable endurance contests still listed', Array.isArray(uPlay.enduranceContests) && uPlay.enduranceContests.includes('drop'));
    T.ok('Garden feast lean hook still present', typeof Game.gardenFeastLeanFor === 'function');
    T.ok('Voice performance lean hook still present', typeof Game.voicePerformanceLeanFor === 'function');
    T.ok('Unkillable endurance lean hook still present', typeof Game.unkillableEnduranceLeanFor === 'function');
    T.ok('Voice army delivery hook still present', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('detective H2H: NPC All-Seeing holder flips Who Ate It?');
  {
    clearGods();
    v.roster = roster0.slice();
    // Detective score = tracking + trust/5. Weak A vs strong B; lean 18 flips.
    setTracking(vidA, 8);
    setTracking(vidB, 20);
    v.trust = v.trust || {};
    v.trust[vidA] = 10; // +2
    v.trust[vidB] = 10; // +2 → B = 22, A = 10; A+lean = 28

    const control = resolveWhoate(vidA, vidB);
    T.ok('CONTROL: without All-Seeing the stronger tracker wins', control[vidB].outcome === 'won' && control[vidA].outcome === 'lost',
      JSON.stringify({ A: control[vidA], B: control[vidB] }));

    T.ok('NPC ascends All-Seeing', ascendVillager(vidA, 'all_seeing') === 'all_seeing');
    T.ok('lean applies to the All-Seeing detective', Game.allSeeingStrategyLeanFor(vidA, whoate()) >= 18, Game.allSeeingStrategyLeanFor(vidA, whoate()));
    T.ok('lean does not apply to the non-holder', Game.allSeeingStrategyLeanFor(vidB, whoate()) === 0);

    const treated = resolveWhoate(vidA, vidB);
    T.ok('TREATMENT: ascended All-Seeing holder wins Who Ate It?', treated[vidA].outcome === 'won' && treated[vidB].outcome === 'lost',
      JSON.stringify({ A: treated[vidA], B: treated[vidB] }));

    const hook = Game.allSeeingStrategyLeanFor;
    Game.allSeeingStrategyLeanFor = function () { return 0; };
    let stripped;
    try {
      stripped = resolveWhoate(vidA, vidB);
    } finally {
      Game.allSeeingStrategyLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping allSeeingStrategyLeanFor restores the stronger tracker',
      stripped[vidB].outcome === 'won' && stripped[vidA].outcome === 'lost',
      JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
  }

  T.section('puzzle solo: player All-Seeing holder clears The Box');
  {
    clearGods();
    v.roster = roster0.slice();
    const solver = Game.villagerId;
    // Medium puzzle demand is 20. Pin non-clever, zero survival/tracking so
    // only the strategy lean (18) plus a thin survival buffer clears it.
    const ag = Game.agencyOf(solver);
    ag.xp[solver].survival = 4; // +2
    ag.xp[solver].tracking = 0;
    ag.xp[solver].bravery = 0;
    const agState = Game.agencyState();
    agState.potential = agState.potential || {};
    agState.potential[solver] = 'steady'; // not clever (+15)

    let control, treated, stripped;
    const controlR = resolveBox(solver);
    control = controlR.outcome;
    T.ok('CONTROL: without All-Seeing the quiet solver loses The Box', control === 'lost', JSON.stringify(controlR));

    T.ok('player ascends All-Seeing', ascendPlayer('all_seeing') === 'all_seeing');
    T.ok('lean applies to the player solver body', Game.allSeeingStrategyLeanFor(solver, box()) >= 18);

    const treatedR = resolveBox(solver);
    treated = treatedR.outcome;
    T.ok('TREATMENT: All-Seeing solver wins The Box', treated === 'won', JSON.stringify(treatedR));

    const hook = Game.allSeeingStrategyLeanFor;
    Game.allSeeingStrategyLeanFor = function () { return 0; };
    try {
      stripped = resolveBox(solver).outcome;
    } finally {
      Game.allSeeingStrategyLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping the hook loses The Box again', stripped === 'lost', stripped);
  }

  T.section('lies H2H: All-Seeing flips Lie Detector (strategy-bluff)');
  {
    clearGods();
    v.roster = roster0.slice();
    // Case score = nota*2 + trust/10 + bravery/10 + temper. Weak A vs famous B.
    Game.state.notability = {};
    Game.state.notability[vidA] = 0;
    Game.state.notability[vidB] = 5;
    v.trust = v.trust || {};
    v.trust[vidA] = 10;
    v.trust[vidB] = 10;
    const agA = Game.agencyOf(vidA);
    const agB = Game.agencyOf(vidB);
    agA.xp[vidA].bravery = 0;
    agB.xp[vidB].bravery = 20;
    const temper = Game.npcTemper;
    Game.npcTemper = function (pid) {
      if (pid === vidA || pid === vidB) return 'steady';
      return temper.apply(this, arguments);
    };
    let control, treated, stripped;
    try {
      control = resolveLies(vidA, vidB);
      T.ok('CONTROL: without All-Seeing the stronger case wins Lie Detector',
        control[vidB].outcome === 'won' && control[vidA].outcome === 'lost',
        JSON.stringify({ A: control[vidA], B: control[vidB] }));

      T.ok('NPC ascends All-Seeing for lies', ascendVillager(vidA, 'all_seeing') === 'all_seeing');
      T.ok('lean applies on lies', Game.allSeeingStrategyLeanFor(vidA, lies()) >= 18);
      T.ok('Voice performance lean does not claim lies', Game.voicePerformanceLeanFor(vidA, lies()) === 0);

      treated = resolveLies(vidA, vidB);
      T.ok('TREATMENT: All-Seeing holder wins Lie Detector',
        treated[vidA].outcome === 'won' && treated[vidB].outcome === 'lost',
        JSON.stringify({ A: treated[vidA], B: treated[vidB] }));

      const hook = Game.allSeeingStrategyLeanFor;
      Game.allSeeingStrategyLeanFor = function () { return 0; };
      try {
        stripped = resolveLies(vidA, vidB);
      } finally {
        Game.allSeeingStrategyLeanFor = hook;
      }
      T.ok('FAILING CONTROL: stripping the hook restores the stronger case',
        stripped[vidB].outcome === 'won' && stripped[vidA].outcome === 'lost',
        JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
    } finally {
      Game.npcTemper = temper;
    }
  }

  T.section('non-strategy / prior leans unchanged');
  {
    clearGods();
    ascendVillager(vidA, 'all_seeing');
    T.ok('All-Seeing holder gets no cookfight lean', Game.allSeeingStrategyLeanFor(vidA, cookfight()) === 0);
    T.ok('All-Seeing holder gets no impress lean', Game.allSeeingStrategyLeanFor(vidA, impress()) === 0);
    T.ok('All-Seeing holder gets no moot lean', Game.allSeeingStrategyLeanFor(vidA, moot()) === 0);
    T.ok('All-Seeing holder gets no drop lean', Game.allSeeingStrategyLeanFor(vidA, drop()) === 0);
    T.ok('All-Seeing gets no Garden feast lean on cookfight', Game.gardenFeastLeanFor(vidA, cookfight()) === 0);
    T.ok('All-Seeing gets no Voice impress lean', Game.voicePerformanceLeanFor(vidA, impress()) === 0);
    T.ok('All-Seeing gets no Unkillable drop lean', Game.unkillableEnduranceLeanFor(vidA, drop()) === 0);

    setSurvival(vidA, 8);
    setSurvival(vidB, 30);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';
    Game.state.notability = {};
    const r = quiet(() => Game.contestResolveGroup([vidA, vidB], cookfight(), {}));
    T.ok('cookfight still favors the stronger cook without All-Seeing strategy lean',
      r[vidB].outcome === 'won' && r[vidA].outcome === 'lost',
      JSON.stringify({ A: r[vidA], B: r[vidB] }));

    // Garden feast lean still works when Garden holds cookfight.
    clearGods();
    ascendVillager(vidA, 'living_garden');
    T.ok('Garden cookfight lean still applies', Game.gardenFeastLeanFor(vidA, cookfight()) >= 18);
    T.ok('Garden holder gets no All-Seeing whoate lean', Game.allSeeingStrategyLeanFor(vidA, whoate()) === 0);

    // Voice impress lean still works; All-Seeing does not claim impress.
    clearGods();
    ascendVillager(vidA, 'voice_of_the_relay');
    T.ok('Voice impress lean still applies', Game.voicePerformanceLeanFor(vidA, impress()) >= 18);
    T.ok('Voice holder gets no All-Seeing whoate lean', Game.allSeeingStrategyLeanFor(vidA, whoate()) === 0);
    T.ok('Voice still does not claim lies', Game.voicePerformanceLeanFor(vidA, lies()) === 0);
    T.ok('Voice still claims moot', Game.isPerformanceContest(moot()) === true);

    // Unkillable drop lean still works.
    clearGods();
    ascendVillager(vidA, 'unkillable');
    T.ok('Unkillable drop lean still applies', Game.unkillableEnduranceLeanFor(vidA, drop()) >= 18);
    T.ok('Unkillable holder gets no All-Seeing whoate lean', Game.allSeeingStrategyLeanFor(vidA, whoate()) === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
