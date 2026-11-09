#!/usr/bin/env node
// OVE-104 — Voice of the Relay performance contest lean.
//
// god.scale.contest: "You are the show: performance contests lean your way."
// Settlement: impress making scores in contestEngine _cxOther and moot case
// scores in _cxMoot add Game.voicePerformanceLeanFor for an ascended Voice
// holder. Seeded proof + failing control that removes the hook.
// Preserves Garden feast lean and Voice Be Heard army delivery.
'use strict';
const K = require('./lib');
const T = K.reporter('voice-performance-contest-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 104) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  const others = roster0.filter(id => id !== Game.villagerId);
  const [vidA, vidB] = others;
  T.ok('two living villagers for performance fixtures', !!(vidA && vidB), others.length);

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
  function impress() {
    return { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
  }
  function moot() {
    return { id: 'moot', name: 'The Moot', cat: 'moot', risk: 'medium' };
  }
  function cookfight() {
    return { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
  }
  function resolveImpress(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], impress(), {}));
  }
  function resolveMoot(pid) {
    return quiet(() => Game.contestResolveVillager(pid, moot(), {}));
  }

  T.section('data + wiring');
  {
    clearGods();
    const play = Game.godPlay('voice_of_the_relay') || {};
    T.ok('play lists performance contests', Array.isArray(play.performanceContests) && play.performanceContests.includes('impress') && play.performanceContests.includes('moot'));
    T.ok('play.contestLean is a positive number', typeof play.contestLean === 'number' && play.contestLean > 0, play.contestLean);
    T.ok('impress is a performance contest', Game.isPerformanceContest(impress()) === true);
    T.ok('moot is a performance contest', Game.isPerformanceContest(moot()) === true);
    T.ok('cookfight is not a performance contest', Game.isPerformanceContest(cookfight()) === false);
    T.ok('no lean without a Voice holder', Game.voicePerformanceLeanFor(vidA, impress()) === 0);
    // Garden feast lean remains wired and separate.
    const gPlay = Game.godPlay('living_garden') || {};
    T.ok('Garden feast contests still listed', Array.isArray(gPlay.feastContests) && gPlay.feastContests.includes('cookfight'));
    T.ok('Garden feast lean hook still present', typeof Game.gardenFeastLeanFor === 'function');
    T.ok('Voice army delivery hook still present', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('impress: NPC Voice holder flips the show');
  {
    clearGods();
    v.roster = roster0.slice();
    // Strong peer vs weak Voice candidate. Without lean the peer wins;
    // with Voice lean the holder takes Impress Us. Pin potential/notability
    // so clever (+5) and nota*2 cannot hide the lean contrast.
    setSurvival(vidA, 8);
    setSurvival(vidB, 30);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';
    Game.state.notability = {};
    v.trust = v.trust || {};
    v.trust[vidA] = 10;
    v.trust[vidB] = 10;

    const control = resolveImpress(vidA, vidB);
    T.ok('CONTROL: without Voice the stronger maker wins', control[vidB].outcome === 'won' && control[vidA].outcome === 'lost',
      JSON.stringify({ A: control[vidA], B: control[vidB] }));

    T.ok('NPC ascends Voice of the Relay', ascendVillager(vidA, 'voice_of_the_relay') === 'voice_of_the_relay');
    T.ok('lean applies to the Voice maker', Game.voicePerformanceLeanFor(vidA, impress()) >= 18, Game.voicePerformanceLeanFor(vidA, impress()));
    T.ok('lean does not apply to the non-Voice maker', Game.voicePerformanceLeanFor(vidB, impress()) === 0);

    const treated = resolveImpress(vidA, vidB);
    T.ok('TREATMENT: ascended Voice holder wins Impress Us', treated[vidA].outcome === 'won' && treated[vidB].outcome === 'lost',
      JSON.stringify({ A: treated[vidA], B: treated[vidB] }));

    // Failing control: remove the settlement hook; Voice still ascended.
    const hook = Game.voicePerformanceLeanFor;
    Game.voicePerformanceLeanFor = function () { return 0; };
    let stripped;
    try {
      stripped = resolveImpress(vidA, vidB);
    } finally {
      Game.voicePerformanceLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping voicePerformanceLeanFor restores the stronger maker',
      stripped[vidB].outcome === 'won' && stripped[vidA].outcome === 'lost',
      JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
  }

  T.section('moot: player Voice holder clears the case');
  {
    clearGods();
    v.roster = roster0.slice();
    const speaker = Game.villagerId;
    // Medium moot demand is 9. Pin low notability/trust/bravery and a quiet
    // temper so only the Voice lean clears the case.
    Game.state.notability = Game.state.notability || {};
    Game.state.notability[speaker] = 0;
    v.trust = v.trust || {};
    v.trust[speaker] = 10; // trust/10 = 1
    const ag = Game.agencyOf(speaker);
    ag.xp[speaker].bravery = 0;
    const temper = Game.npcTemper;
    Game.npcTemper = function (pid) { return pid === speaker ? 'steady' : temper.apply(this, arguments); };
    let control, treated, stripped;
    try {
      const controlR = resolveMoot(speaker);
      control = controlR.outcome;
      T.ok('CONTROL: without Voice the quiet speaker loses The Moot', control === 'lost', JSON.stringify(controlR));

      T.ok('player ascends Voice of the Relay', ascendPlayer('voice_of_the_relay') === 'voice_of_the_relay');
      T.ok('lean applies to the player speaker body', Game.voicePerformanceLeanFor(speaker, moot()) >= 18);

      const treatedR = resolveMoot(speaker);
      treated = treatedR.outcome;
      T.ok('TREATMENT: Voice speaker wins The Moot', treated === 'won', JSON.stringify(treatedR));

      const hook = Game.voicePerformanceLeanFor;
      Game.voicePerformanceLeanFor = function () { return 0; };
      try {
        stripped = resolveMoot(speaker).outcome;
      } finally {
        Game.voicePerformanceLeanFor = hook;
      }
      T.ok('FAILING CONTROL: stripping the hook loses The Moot again', stripped === 'lost', stripped);
    } finally {
      Game.npcTemper = temper;
    }
  }

  T.section('non-performance / feast boundary unchanged');
  {
    clearGods();
    ascendVillager(vidA, 'voice_of_the_relay');
    T.ok('Voice holder gets no cookfight lean', Game.voicePerformanceLeanFor(vidA, cookfight()) === 0);
    T.ok('Voice holder gets no Garden feast lean on cookfight', Game.gardenFeastLeanFor(vidA, cookfight()) === 0);
    setSurvival(vidA, 8);
    setSurvival(vidB, 30);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';
    Game.state.notability = {};
    const r = quiet(() => Game.contestResolveGroup([vidA, vidB], cookfight(), {}));
    T.ok('cookfight still favors the stronger cook without Voice performance lean', r[vidB].outcome === 'won' && r[vidA].outcome === 'lost',
      JSON.stringify({ A: r[vidA], B: r[vidB] }));

    // Garden feast lean still works when Garden holds cookfight.
    clearGods();
    ascendVillager(vidA, 'living_garden');
    T.ok('Garden cookfight lean still applies', Game.gardenFeastLeanFor(vidA, cookfight()) >= 18);
    T.ok('Garden holder gets no Voice impress lean', Game.voicePerformanceLeanFor(vidA, impress()) === 0);
    const g = resolveImpress(vidA, vidB);
    T.ok('impress still favors the stronger maker under Garden (no Voice lean)', g[vidB].outcome === 'won' && g[vidA].outcome === 'lost',
      JSON.stringify({ A: g[vidA], B: g[vidB] }));
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
