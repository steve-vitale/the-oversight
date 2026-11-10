#!/usr/bin/env node
// OVE-99 — Living Garden feast contest lean.
//
// god.scale.contest: "Feast contests lean your way."
// Settlement: cookfight/guest making scores in contestEngine _cxOther add
// Game.gardenFeastLeanFor for an ascended Living Garden holder.
// Seeded proof + failing control that removes the hook.
'use strict';
const K = require('./lib');
const T = K.reporter('garden-feast-contest-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 99) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  const others = roster0.filter(id => id !== Game.villagerId);
  const [vidA, vidB] = others;
  T.ok('two living villagers for feast fixtures', !!(vidA && vidB), others.length);

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
  function cookfight() {
    return { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
  }
  function guest() {
    return { id: 'guest', name: 'The Guest', cat: 'weird', risk: 'medium' };
  }
  function resolveCook(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], cookfight(), {}));
  }
  function resolveGuest(pid) {
    return quiet(() => Game.contestResolveVillager(pid, guest(), {}));
  }

  T.section('data + wiring');
  {
    clearGods();
    const play = Game.godPlay('living_garden') || {};
    T.ok('play lists feast contests', Array.isArray(play.feastContests) && play.feastContests.includes('cookfight') && play.feastContests.includes('guest'));
    T.ok('play.contestLean is a positive number', typeof play.contestLean === 'number' && play.contestLean > 0, play.contestLean);
    T.ok('cookfight is a feast contest', Game.isFeastContest(cookfight()) === true);
    T.ok('guest is a feast contest', Game.isFeastContest(guest()) === true);
    T.ok('impress is not a feast contest', Game.isFeastContest({ id: 'impress', cat: 'weird' }) === false);
    T.ok('no lean without a Garden holder', Game.gardenFeastLeanFor(vidA, cookfight()) === 0);
  }

  T.section('cookfight: NPC Garden holder flips the feast');
  {
    clearGods();
    v.roster = roster0.slice();
    // Strong peer vs weak Garden candidate. Without lean the peer wins;
    // with Garden lean the holder takes the feast. Pin potential/notability
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

    const control = resolveCook(vidA, vidB);
    T.ok('CONTROL: without Garden the stronger cook wins', control[vidB].outcome === 'won' && control[vidA].outcome === 'lost',
      JSON.stringify({ A: control[vidA], B: control[vidB] }));

    T.ok('NPC ascends Living Garden', ascendVillager(vidA, 'living_garden') === 'living_garden');
    T.ok('lean applies to the Garden cook', Game.gardenFeastLeanFor(vidA, cookfight()) >= 18, Game.gardenFeastLeanFor(vidA, cookfight()));
    T.ok('lean does not apply to the non-Garden cook', Game.gardenFeastLeanFor(vidB, cookfight()) === 0);

    const treated = resolveCook(vidA, vidB);
    T.ok('TREATMENT: ascended Garden holder wins the cookfight', treated[vidA].outcome === 'won' && treated[vidB].outcome === 'lost',
      JSON.stringify({ A: treated[vidA], B: treated[vidB] }));

    // Failing control: remove the settlement hook; Garden still ascended.
    const hook = Game.gardenFeastLeanFor;
    Game.gardenFeastLeanFor = function () { return 0; };
    let stripped;
    try {
      stripped = resolveCook(vidA, vidB);
    } finally {
      Game.gardenFeastLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping gardenFeastLeanFor restores the stronger cook',
      stripped[vidB].outcome === 'won' && stripped[vidA].outcome === 'lost',
      JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
  }

  T.section('guest: player Garden holder clears the dinner');
  {
    clearGods();
    v.roster = roster0.slice();
    const host = Game.villagerId;
    // Medium guest demand is 20. Trust/5 alone cannot clear it without temper
    // luck; pin a quiet temper and low trust so only the Garden lean wins.
    v.trust = v.trust || {};
    v.trust[host] = 20; // score 4 without temper bonus
    const temper = Game.npcTemper;
    Game.npcTemper = function (pid) { return pid === host ? 'steady' : temper.apply(this, arguments); };
    let control, treated, stripped;
    try {
      const controlR = resolveGuest(host);
      control = controlR.outcome;
      T.ok('CONTROL: without Garden the quiet host loses The Guest', control === 'lost', JSON.stringify(controlR));

      T.ok('player ascends Living Garden', ascendPlayer('living_garden') === 'living_garden');
      T.ok('lean applies to the player host body', Game.gardenFeastLeanFor(host, guest()) >= 18);

      const treatedR = resolveGuest(host);
      treated = treatedR.outcome;
      T.ok('TREATMENT: Garden host wins The Guest', treated === 'won', JSON.stringify(treatedR));

      const hook = Game.gardenFeastLeanFor;
      Game.gardenFeastLeanFor = function () { return 0; };
      try {
        stripped = resolveGuest(host).outcome;
      } finally {
        Game.gardenFeastLeanFor = hook;
      }
      T.ok('FAILING CONTROL: stripping the hook loses The Guest again', stripped === 'lost', stripped);
    } finally {
      Game.npcTemper = temper;
    }
  }

  T.section('non-feast unchanged');
  {
    clearGods();
    ascendVillager(vidA, 'living_garden');
    const impress = { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
    T.ok('Garden holder gets no impress lean', Game.gardenFeastLeanFor(vidA, impress) === 0);
    setSurvival(vidA, 8);
    setSurvival(vidB, 30);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';
    Game.state.notability = {};
    const r = quiet(() => Game.contestResolveGroup([vidA, vidB], impress, {}));
    T.ok('impress still favors the stronger maker without Garden feast lean', r[vidB].outcome === 'won' && r[vidA].outcome === 'lost',
      JSON.stringify({ A: r[vidA], B: r[vidB] }));
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
