#!/usr/bin/env node
// OVE-120 — Market God army quartermaster via titanOutfit.
//
// god.scale.army: "The coalition's quartermaster."
// god.scale.party: "You equip the party: the market delivers what you name."
// Settlement: titanOutfit honors Game.marketOutfitLeanFor when an ascended
// Market holder is active — same transferred pieces yield higher force
// wbonus / varmor / gearValue. Seeded proof + failing control that strips
// the helper. Preserves Garden muster feed + all contest leans. Muse off.
'use strict';
const K = require('./lib');
const T = K.reporter('market-army-outfit-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 120) });
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

  function plantMuster(blades) {
    const st = Game._titanTest.titanState();
    const allies = [];
    for (let i = 0; i < blades; i++) {
      allies.push({
        villageId: ash.id,
        vid: 'blade_' + i,
        name: 'Blade ' + i,
        hp: 40,
        outfitted: [],
        gearValue: 0,
        wbonus: 0,
        varmor: 0,
      });
    }
    st.musters.herald = {
      allies,
      haven: [],
      day,
      outfitted: {},
    };
    return st.musters.herald;
  }

  function stockKnives(n) {
    s.inventory = Array.from({ length: n }, () => ({ itemId: 'stone_knife', units: 1 }));
  }

  function forceTotals(muster) {
    const force = (muster.allies || []).filter(a => a.villageId === ash.id);
    return {
      wbonus: force.reduce((n, f) => n + (f.wbonus || 0), 0),
      varmor: force.reduce((n, f) => n + (f.varmor || 0), 0),
      gearValue: force.reduce((n, f) => n + (f.gearValue || 0), 0),
      pieces: force.reduce((n, f) => n + ((f.outfitted || []).length), 0),
    };
  }

  function runOutfit(indexes) {
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    let result = null;
    try {
      result = Game.titanOutfit('herald', ash.id, indexes);
    } finally {
      Game.say = osay;
    }
    return { result, said, totals: forceTotals(Game._titanTest.titanState().musters.herald) };
  }

  // stone_knife weapon.bonus = 12 → gearValue 120. Lean 25% → 15 / 150.
  const BASE_W = 12;
  const BASE_V = 120;
  const play = Game.godPlay('market_god') || {};
  const leanPct = (typeof play.outfitEffLean === 'number' && play.outfitEffLean > 0)
    ? play.outfitEffLean : 25;
  const LEAN_W = Math.round(BASE_W * (100 + leanPct) / 100);
  const LEAN_V = Math.round(BASE_V * (100 + leanPct) / 100);

  T.section('data + wiring');
  {
    clearGods();
    T.ok('marketOutfitLeanFor is exported', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('play.outfitEffLean is a positive number', typeof play.outfitEffLean === 'number' && play.outfitEffLean > 0,
      play.outfitEffLean);
    T.ok('no lean without a Market holder', Game.marketOutfitLeanFor() === 0);
    T.ok('Market sponsor contests still listed', Array.isArray(play.sponsorContests) && play.sponsorContests.includes('price'));
    T.ok('Garden muster feed still exported', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Voice Be Heard army helper still exported', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('CONTROL: outfit without Market → base effectiveness');
  {
    clearGods();
    const muster = plantMuster(2);
    stockKnives(2);
    const { result, said, totals } = runOutfit([0, 1]);
    T.ok('CONTROL: two pieces transferred', result && result.given === 2, result && result.given);
    T.ok('CONTROL: lean field is 0', result && result.lean === 0, result && result.lean);
    T.ok('CONTROL: base wbonus across force', totals.wbonus === BASE_W * 2, totals.wbonus);
    T.ok('CONTROL: base gearValue across force', totals.gearValue === BASE_V * 2, totals.gearValue);
    T.ok('CONTROL: no quartermaster line', !said.some(t => /Market quarters/i.test(t)),
      said.join(' | ').slice(0, 200));
    T.ok('CONTROL: pack emptied', (s.inventory || []).length === 0, (s.inventory || []).length);
    T.ok('CONTROL: both blades hold a knife', totals.pieces === 2, totals.pieces);
    // Keep muster identity for a sanity check that outfitted items are real.
    T.ok('CONTROL: outfitted item ids are stone_knife',
      muster.allies.every(a => a.outfitted.some(i => i.itemId === 'stone_knife')));
  }

  T.section('TREATMENT: Market holder leans same gear');
  {
    clearGods();
    plantMuster(2);
    stockKnives(2);
    T.ok('player ascends Market God', ascendPlayer('market_god') === 'market_god');
    T.ok('helper returns outfitEffLean', Game.marketOutfitLeanFor() === leanPct, Game.marketOutfitLeanFor());
    const { result, said, totals } = runOutfit([0, 1]);
    T.ok('TREATMENT: two pieces transferred', result && result.given === 2, result && result.given);
    T.ok('TREATMENT: lean field matches play', result && result.lean === leanPct, result && result.lean);
    T.ok('TREATMENT: leaned wbonus across force', totals.wbonus === LEAN_W * 2, totals.wbonus);
    T.ok('TREATMENT: leaned gearValue across force', totals.gearValue === LEAN_V * 2, totals.gearValue);
    T.ok('TREATMENT: higher than control wbonus', totals.wbonus > BASE_W * 2, totals.wbonus);
    T.ok('TREATMENT: higher than control gearValue', totals.gearValue > BASE_V * 2, totals.gearValue);
    T.ok('TREATMENT: quartermaster line said',
      said.some(t => /Market quarters them/i.test(t) && /quartermaster lean/i.test(t)),
      said.join(' | ').slice(0, 240));
    T.ok('TREATMENT: pack still emptied (no free gear)', (s.inventory || []).length === 0);
  }

  T.section('FAILING CONTROL: strip marketOutfitLeanFor');
  {
    clearGods();
    plantMuster(2);
    stockKnives(2);
    ascendPlayer('market_god');
    const hook = Game.marketOutfitLeanFor;
    Game.marketOutfitLeanFor = function () { return 0; };
    let result, said, totals;
    try {
      ({ result, said, totals } = runOutfit([0, 1]));
    } finally {
      Game.marketOutfitLeanFor = hook;
    }
    T.ok('FAILING CONTROL: transfer still happens', result && result.given === 2);
    T.ok('FAILING CONTROL: lean field collapses to 0', result && result.lean === 0, result && result.lean);
    T.ok('FAILING CONTROL: base wbonus restored', totals.wbonus === BASE_W * 2, totals.wbonus);
    T.ok('FAILING CONTROL: base gearValue restored', totals.gearValue === BASE_V * 2, totals.gearValue);
    T.ok('FAILING CONTROL: no quartermaster line', !said.some(t => /Market quarters/i.test(t)));
    T.ok('FAILING CONTROL: player is still Market (ascended alone is not army LIVE)',
      Game.holderGod('player') === 'market_god');
  }

  T.section('non-Market holders get no outfit lean');
  {
    clearGods();
    plantMuster(2);
    stockKnives(2);
    ascendPlayer('living_garden');
    T.ok('Garden holder helper returns 0', Game.marketOutfitLeanFor() === 0);
    let out = runOutfit([0, 1]);
    T.ok('Garden: base wbonus', out.totals.wbonus === BASE_W * 2, out.totals.wbonus);
    T.ok('Garden: no quartermaster line', !out.said.some(t => /Market quarters/i.test(t)));

    clearGods();
    plantMuster(2);
    stockKnives(2);
    ascendPlayer('voice_of_the_relay');
    T.ok('Voice holder helper returns 0', Game.marketOutfitLeanFor() === 0);
    out = runOutfit([0, 1]);
    T.ok('Voice: base gearValue', out.totals.gearValue === BASE_V * 2, out.totals.gearValue);

    clearGods();
    plantMuster(2);
    stockKnives(2);
    ascendPlayer('unkillable');
    T.ok('Unkillable holder helper returns 0', Game.marketOutfitLeanFor() === 0);
    out = runOutfit([0, 1]);
    T.ok('Unkillable: base wbonus', out.totals.wbonus === BASE_W * 2, out.totals.wbonus);

    clearGods();
    plantMuster(2);
    stockKnives(2);
    ascendPlayer('all_seeing');
    T.ok('All-Seeing holder helper returns 0', Game.marketOutfitLeanFor() === 0);
    out = runOutfit([0, 1]);
    T.ok('All-Seeing: base gearValue', out.totals.gearValue === BASE_V * 2, out.totals.gearValue);
  }

  T.section('NPC Market holder leans outfit');
  {
    clearGods();
    const others = (v.roster || []).filter(id => id !== Game.villagerId);
    const vid = others[0];
    T.ok('fixture villager for NPC Market', !!vid, others.length);
    plantMuster(2);
    stockKnives(2);
    T.ok('villager ascends Market God', ascendVillager(vid, 'market_god') === 'market_god');
    T.ok('NPC Market helper returns lean', Game.marketOutfitLeanFor() === leanPct, Game.marketOutfitLeanFor());
    const { result, totals, said } = runOutfit([0, 1]);
    T.ok('NPC Market: leaned wbonus', totals.wbonus === LEAN_W * 2, totals.wbonus);
    T.ok('NPC Market: leaned gearValue', totals.gearValue === LEAN_V * 2, totals.gearValue);
    T.ok('NPC Market: lean field set', result && result.lean === leanPct);
    T.ok('NPC Market: quartermaster line said', said.some(t => /Market quarters/i.test(t)));
  }

  T.section('Garden muster + contest leans preserved');
  {
    clearGods();
    delete v.harvestDay;
    const cookfight = { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
    const impress = { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
    const drop = { id: 'drop', name: 'The Drop', cat: 'endurance', risk: 'hard' };
    const whoate = { id: 'whoate', name: 'Who Ate It', cat: 'detective', risk: 'medium' };
    const price = { id: 'price', name: 'The Price', cat: 'moot', risk: 'extreme' };

    // Garden muster feed still covers on Harvest day (army LIVE preserved).
    ascendPlayer('living_garden');
    v.harvestDay = day;
    T.ok('Garden muster feed still covers need', Game.gardenMusterFeedFor(2000) === 2000);
    T.ok('Garden feast lean still fires for cookfight', Game.gardenFeastLeanFor(Game.villagerId, cookfight) > 0);
    T.ok('Garden feast lean still ignores impress', Game.gardenFeastLeanFor(Game.villagerId, impress) === 0);
    delete v.harvestDay;

    clearGods();
    ascendPlayer('voice_of_the_relay');
    T.ok('Voice performance lean still fires for impress', Game.voicePerformanceLeanFor(Game.villagerId, impress) > 0);

    clearGods();
    ascendPlayer('unkillable');
    T.ok('Unkillable endurance lean still fires for drop', Game.unkillableEnduranceLeanFor(Game.villagerId, drop) > 0);

    clearGods();
    ascendPlayer('all_seeing');
    T.ok('All-Seeing strategy lean still fires for whoate', Game.allSeeingStrategyLeanFor(Game.villagerId, whoate) > 0);

    clearGods();
    ascendPlayer('market_god');
    T.ok('Market sponsor lean still fires for price', Game.marketSponsorLeanFor(Game.villagerId, price) > 0);
    T.ok('Market sponsor lean still ignores cookfight', Game.marketSponsorLeanFor(Game.villagerId, cookfight) === 0);
    T.ok('Voice army delivery still callable', typeof Game.voiceDeliverAllied === 'function');
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
