#!/usr/bin/env node
// OVE-113 — Market God sponsor contest lean.
//
// god.scale.contest: "The sponsor: money talks to judges (risky)."
// Settlement: price moot case scores in contestEngine _cxMoot and auction
// bid capacity in _cxChance add Game.marketSponsorLeanFor for an ascended
// Market holder. Exact IDs: price, auction only.
// RISK preserved: auction winners (and losers) still pay their bid.
// Seeded proof + failing control that removes the hook.
// Preserves Garden feast lean, Voice performance lean, Unkillable endurance
// lean, All-Seeing strategy lean, and Voice Be Heard allied delivery.
'use strict';
const K = require('./lib');
const T = K.reporter('market-sponsor-contest-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 113) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster0 = (v.roster || []).slice();
  const others = roster0.filter(id => id !== Game.villagerId);
  const [vidA, vidB] = others;
  T.ok('two living villagers for sponsor fixtures', !!(vidA && vidB), others.length);

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
  function hpOf(vid) {
    return (v.health && v.health[vid]) != null ? v.health[vid] : 100;
  }
  function price() {
    return { id: 'price', name: 'The Price', cat: 'moot', risk: 'extreme' };
  }
  function auction() {
    return { id: 'auction', name: 'The Auction', cat: 'chance', risk: 'high' };
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
  function wheel() {
    return { id: 'wheel', name: 'The Wheel', cat: 'chance', risk: 'medium' };
  }
  function resolvePrice(pid) {
    return quiet(() => Game.contestResolveVillager(pid, price(), {}));
  }
  function resolveAuction(a, b) {
    return quiet(() => Game.contestResolveGroup([a, b], auction(), {}));
  }

  const SPONSOR_IDS = ['price', 'auction'];

  T.section('data + wiring');
  {
    clearGods();
    const play = Game.godPlay('market_god') || {};
    T.ok('play lists sponsor contests', Array.isArray(play.sponsorContests)
      && SPONSOR_IDS.every(id => play.sponsorContests.includes(id)),
      JSON.stringify(play.sponsorContests));
    T.ok('play.sponsorContests exact length 2', play.sponsorContests && play.sponsorContests.length === 2,
      play.sponsorContests && play.sponsorContests.length);
    T.ok('play.contestLean is a positive number', typeof play.contestLean === 'number' && play.contestLean > 0, play.contestLean);
    T.ok('price is a sponsor contest', Game.isSponsorContest(price()) === true);
    T.ok('auction is a sponsor contest', Game.isSponsorContest(auction()) === true);
    T.ok('cookfight is not a sponsor contest', Game.isSponsorContest(cookfight()) === false);
    T.ok('impress is not a sponsor contest', Game.isSponsorContest(impress()) === false);
    T.ok('moot oratory is not a sponsor contest (Voice keeps it)', Game.isSponsorContest(moot()) === false);
    T.ok('drop is not a sponsor contest', Game.isSponsorContest(drop()) === false);
    T.ok('whoate is not a sponsor contest', Game.isSponsorContest(whoate()) === false);
    T.ok('wheel is not a sponsor contest (chance theater, not sponsor bids)', Game.isSponsorContest(wheel()) === false);
    T.ok('no lean without a Market holder', Game.marketSponsorLeanFor(vidA, price()) === 0);
    // Prior leans remain wired and separate.
    const gPlay = Game.godPlay('living_garden') || {};
    const vPlay = Game.godPlay('voice_of_the_relay') || {};
    const uPlay = Game.godPlay('unkillable') || {};
    const aPlay = Game.godPlay('all_seeing') || {};
    T.ok('Garden feast contests still listed', Array.isArray(gPlay.feastContests) && gPlay.feastContests.includes('cookfight'));
    T.ok('Voice performance contests still listed', Array.isArray(vPlay.performanceContests) && vPlay.performanceContests.includes('impress'));
    T.ok('Unkillable endurance contests still listed', Array.isArray(uPlay.enduranceContests) && uPlay.enduranceContests.includes('drop'));
    T.ok('All-Seeing strategy contests still listed', Array.isArray(aPlay.strategyContests) && aPlay.strategyContests.includes('whoate'));
    T.ok('Garden feast lean hook still present', typeof Game.gardenFeastLeanFor === 'function');
    T.ok('Voice performance lean hook still present', typeof Game.voicePerformanceLeanFor === 'function');
    T.ok('Unkillable endurance lean hook still present', typeof Game.unkillableEnduranceLeanFor === 'function');
    T.ok('All-Seeing strategy lean hook still present', typeof Game.allSeeingStrategyLeanFor === 'function');
    T.ok('Voice army delivery hook still present', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('price solo: player Market holder clears The Price');
  {
    clearGods();
    v.roster = roster0.slice();
    const speaker = Game.villagerId;
    // Extreme moot demand is 15. Pin a quiet case so only the sponsor lean
    // (18) clears it; without Market the case collapses (died at extreme).
    Game.state.notability = {};
    Game.state.notability[speaker] = 0;
    v.trust = v.trust || {};
    v.trust[speaker] = 10; // +1
    const ag = Game.agencyOf(speaker);
    ag.xp[speaker].bravery = 0;
    const temper = Game.npcTemper;
    Game.npcTemper = function (pid) {
      if (pid === speaker) return 'steady';
      return temper.apply(this, arguments);
    };
    let control, treated, stripped;
    try {
      const controlR = resolvePrice(speaker);
      control = controlR.outcome;
      T.ok('CONTROL: without Market the quiet case collapses on The Price',
        control === 'died' || control === 'lost', JSON.stringify(controlR));

      T.ok('player ascends Market God', ascendPlayer('market_god') === 'market_god');
      T.ok('lean applies to the player speaker body', Game.marketSponsorLeanFor(speaker, price()) >= 18);

      const treatedR = resolvePrice(speaker);
      treated = treatedR.outcome;
      T.ok('TREATMENT: Market speaker wins The Price', treated === 'won', JSON.stringify(treatedR));

      const hook = Game.marketSponsorLeanFor;
      Game.marketSponsorLeanFor = function () { return 0; };
      try {
        stripped = resolvePrice(speaker).outcome;
      } finally {
        Game.marketSponsorLeanFor = hook;
      }
      T.ok('FAILING CONTROL: stripping marketSponsorLeanFor collapses The Price again',
        stripped === 'died' || stripped === 'lost', stripped);
    } finally {
      Game.npcTemper = temper;
    }
  }

  T.section('auction H2H: NPC Market holder flips The Auction (still pays)');
  {
    clearGods();
    v.roster = roster0.slice();
    // Bid = min(hp-20, 10 + bravery/2 + nota*3 + lean). Weak A vs slight B;
    // lean 18 flips. Both start at 100 HP so payment is visible.
    (v.health || (v.health = {}))[vidA] = 100;
    (v.health || (v.health = {}))[vidB] = 100;
    setBravery(vidA, 0);   // bid 10
    setBravery(vidB, 4);   // bid 12
    Game.state.notability = {};
    Game.state.notability[vidA] = 0;
    Game.state.notability[vidB] = 0;

    const hpA0 = hpOf(vidA);
    const hpB0 = hpOf(vidB);
    const control = resolveAuction(vidA, vidB);
    T.ok('CONTROL: without Market the stronger bidder wins',
      control[vidB].outcome === 'won' && control[vidA].outcome === 'lost',
      JSON.stringify({ A: control[vidA], B: control[vidB] }));
    T.ok('CONTROL: auction still charges both bidders',
      hpOf(vidA) < hpA0 && hpOf(vidB) < hpB0,
      JSON.stringify({ A: [hpA0, hpOf(vidA)], B: [hpB0, hpOf(vidB)], detailA: control[vidA].detail, detailB: control[vidB].detail }));

    // Reset HP for the treatment run.
    v.health[vidA] = 100;
    v.health[vidB] = 100;
    T.ok('NPC ascends Market God', ascendVillager(vidA, 'market_god') === 'market_god');
    T.ok('lean applies to the Market bidder', Game.marketSponsorLeanFor(vidA, auction()) >= 18, Game.marketSponsorLeanFor(vidA, auction()));
    T.ok('lean does not apply to the non-holder', Game.marketSponsorLeanFor(vidB, auction()) === 0);

    const hpA1 = hpOf(vidA);
    const hpB1 = hpOf(vidB);
    const treated = resolveAuction(vidA, vidB);
    T.ok('TREATMENT: ascended Market holder wins The Auction',
      treated[vidA].outcome === 'won' && treated[vidB].outcome === 'lost',
      JSON.stringify({ A: treated[vidA], B: treated[vidB] }));
    T.ok('TREATMENT: Market winner still pays (risky — not a free win)',
      hpOf(vidA) < hpA1 && /paid\s+[1-9]/.test(String(treated[vidA].detail || '')),
      JSON.stringify({ hp: [hpA1, hpOf(vidA)], detail: treated[vidA].detail }));
    T.ok('TREATMENT: loser still pays half',
      hpOf(vidB) < hpB1,
      JSON.stringify({ hp: [hpB1, hpOf(vidB)], detail: treated[vidB].detail }));

    v.health[vidA] = 100;
    v.health[vidB] = 100;
    const hook = Game.marketSponsorLeanFor;
    Game.marketSponsorLeanFor = function () { return 0; };
    let stripped;
    try {
      stripped = resolveAuction(vidA, vidB);
    } finally {
      Game.marketSponsorLeanFor = hook;
    }
    T.ok('FAILING CONTROL: stripping marketSponsorLeanFor restores the stronger bidder',
      stripped[vidB].outcome === 'won' && stripped[vidA].outcome === 'lost',
      JSON.stringify({ A: stripped[vidA], B: stripped[vidB] }));
  }

  T.section('non-sponsor / prior leans unchanged');
  {
    clearGods();
    ascendVillager(vidA, 'market_god');
    T.ok('Market holder gets no cookfight lean', Game.marketSponsorLeanFor(vidA, cookfight()) === 0);
    T.ok('Market holder gets no impress lean', Game.marketSponsorLeanFor(vidA, impress()) === 0);
    T.ok('Market holder gets no moot lean', Game.marketSponsorLeanFor(vidA, moot()) === 0);
    T.ok('Market holder gets no drop lean', Game.marketSponsorLeanFor(vidA, drop()) === 0);
    T.ok('Market holder gets no whoate lean', Game.marketSponsorLeanFor(vidA, whoate()) === 0);
    T.ok('Market holder gets no wheel lean', Game.marketSponsorLeanFor(vidA, wheel()) === 0);
    T.ok('Market gets no Garden feast lean on cookfight', Game.gardenFeastLeanFor(vidA, cookfight()) === 0);
    T.ok('Market gets no Voice impress lean', Game.voicePerformanceLeanFor(vidA, impress()) === 0);
    T.ok('Market gets no Unkillable drop lean', Game.unkillableEnduranceLeanFor(vidA, drop()) === 0);
    T.ok('Market gets no All-Seeing whoate lean', Game.allSeeingStrategyLeanFor(vidA, whoate()) === 0);

    setSurvival(vidA, 8);
    setSurvival(vidB, 30);
    const ag = Game.agencyState();
    ag.potential = ag.potential || {};
    ag.potential[vidA] = 'steady';
    ag.potential[vidB] = 'steady';
    Game.state.notability = {};
    const r = quiet(() => Game.contestResolveGroup([vidA, vidB], cookfight(), {}));
    T.ok('cookfight still favors the stronger cook without Market sponsor lean',
      r[vidB].outcome === 'won' && r[vidA].outcome === 'lost',
      JSON.stringify({ A: r[vidA], B: r[vidB] }));

    clearGods();
    ascendVillager(vidA, 'living_garden');
    T.ok('Garden cookfight lean still applies', Game.gardenFeastLeanFor(vidA, cookfight()) >= 18);
    T.ok('Garden holder gets no Market price lean', Game.marketSponsorLeanFor(vidA, price()) === 0);

    clearGods();
    ascendVillager(vidA, 'voice_of_the_relay');
    T.ok('Voice impress lean still applies', Game.voicePerformanceLeanFor(vidA, impress()) >= 18);
    T.ok('Voice still claims moot', Game.isPerformanceContest(moot()) === true);
    T.ok('Voice holder gets no Market price lean', Game.marketSponsorLeanFor(vidA, price()) === 0);

    clearGods();
    ascendVillager(vidA, 'unkillable');
    T.ok('Unkillable drop lean still applies', Game.unkillableEnduranceLeanFor(vidA, drop()) >= 18);
    T.ok('Unkillable holder gets no Market auction lean', Game.marketSponsorLeanFor(vidA, auction()) === 0);

    clearGods();
    ascendVillager(vidA, 'all_seeing');
    T.ok('All-Seeing whoate lean still applies', Game.allSeeingStrategyLeanFor(vidA, whoate()) >= 18);
    T.ok('All-Seeing still claims lies', Game.isStrategyContest({ id: 'lies', cat: 'moot' }) === true);
    T.ok('All-Seeing holder gets no Market price lean', Game.marketSponsorLeanFor(vidA, price()) === 0);
    T.ok('All-Seeing does not claim price', Game.isStrategyContest(price()) === false);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
