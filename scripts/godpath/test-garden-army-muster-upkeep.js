#!/usr/bin/env node
// OVE-116 — Living Garden army muster-upkeep feed.
//
// god.scale.army: "Feeds fifty mouths a day."
// god.scale.titan: "The coalition marches because you feed it."
// Settlement: titanMusterUpkeep honors Game.gardenMusterFeedFor when an
// ascended Living Garden holder has Feed the Multitude / harvestDay active.
// Covered kcal skip pack debit and hunger trust bleed. Seeded proof + failing
// control that strips the helper. Preserves feast contest lean and Voice Be
// Heard. Muse prices untouched.
'use strict';
const K = require('./lib');
const T = K.reporter('garden-army-muster-upkeep');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 116) });
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
    history: [],
  };
  const savedMship = Game.mshipState;
  Game.mshipState = () => ({ links: [linkAsh], allies: [] });

  const spendCalls = [];
  const savedSpend = Game.playerPackSpend;
  Game.playerPackSpend = function (n) {
    spendCalls.push(n);
    return 0; // empty pack — hunger unless Garden covers
  };

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

  function runUpkeep(d) {
    const muster = Game._titanTest.titanState().musters.herald;
    if (muster) delete muster.lastUpkeep;
    spendCalls.length = 0;
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    try {
      Game._titanTest.titanMusterUpkeep(d);
    } finally {
      Game.say = osay;
    }
    return said;
  }

  T.section('data + wiring');
  {
    clearGods();
    delete v.harvestDay;
    const play = Game.godPlay('living_garden') || {};
    T.ok('gardenMusterFeedFor is exported', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('play.musterMouths is a positive number', typeof play.musterMouths === 'number' && play.musterMouths > 0, play.musterMouths);
    T.ok('play.musterKcalPerMouth is a positive number', typeof play.musterKcalPerMouth === 'number' && play.musterKcalPerMouth > 0, play.musterKcalPerMouth);
    T.ok('no cover without Garden holder', Game.gardenMusterFeedFor(2000) === 0);
    v.harvestDay = day;
    T.ok('harvestDay alone without Garden holder still covers nothing', Game.gardenMusterFeedFor(2000) === 0);
    delete v.harvestDay;
    T.ok('Garden feast contests still listed', Array.isArray(play.feastContests) && play.feastContests.includes('cookfight'));
    T.ok('Market sponsor contests still listed', Array.isArray((Game.godPlay('market_god') || {}).sponsorContests));
    T.ok('Voice Be Heard army helper still exported', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('CONTROL: empty pack + muster → hunger trust bleed');
  {
    clearGods();
    delete v.harvestDay;
    linkAsh.trust = 60;
    linkAsh.history = [];
    plantMuster(2);
    const said = runUpkeep(day);
    T.ok('CONTROL: pack asked for full need', spendCalls.length === 1 && spendCalls[0] === 2000,
      JSON.stringify(spendCalls));
    T.ok('CONTROL: hunger line said', said.some(t => /muster is hungry/i.test(t) && /of 2,000 kcal fed/.test(t)),
      said.join(' | ').slice(0, 200));
    T.ok('CONTROL: trust bleeds −2', linkAsh.trust === 58, linkAsh.trust);
    T.ok('CONTROL: muster-hunger history booked',
      (linkAsh.history || []).some(h => h.kind === 'muster-hunger' && h.amount === -2 && h.day === day),
      JSON.stringify(linkAsh.history));
  }

  T.section('TREATMENT: Garden + harvestDay covers muster');
  {
    clearGods();
    linkAsh.trust = 60;
    linkAsh.history = [];
    plantMuster(2);
    T.ok('player ascends Living Garden', ascendPlayer('living_garden') === 'living_garden');
    // Ascended but no Harvest day yet — still hungry.
    delete v.harvestDay;
    let said = runUpkeep(day);
    T.ok('Garden without Harvest still spends pack', spendCalls.length === 1 && spendCalls[0] === 2000,
      JSON.stringify(spendCalls));
    T.ok('Garden without Harvest still hungry', said.some(t => /muster is hungry/i.test(t)));
    T.ok('Garden without Harvest still bleeds trust', linkAsh.trust === 58, linkAsh.trust);

    // Activate Harvest day (Feed the Multitude stamp) without relying on pack food.
    linkAsh.trust = 60;
    linkAsh.history = [];
    plantMuster(2);
    v.harvestDay = day;
    T.ok('helper covers full 2-blade need on Harvest day', Game.gardenMusterFeedFor(2000) === 2000);
    said = runUpkeep(day);
    T.ok('TREATMENT: pack spend skipped when Garden covers', spendCalls.length === 0,
      JSON.stringify(spendCalls));
    T.ok('TREATMENT: garden feed line said',
      said.some(t => /Living Garden feeds the muster/i.test(t) && /coalition marches because you feed it/i.test(t)),
      said.join(' | ').slice(0, 240));
    T.ok('TREATMENT: no hunger line', !said.some(t => /muster is hungry/i.test(t)),
      said.join(' | ').slice(0, 200));
    T.ok('TREATMENT: trust unchanged', linkAsh.trust === 60, linkAsh.trust);
    T.ok('TREATMENT: no muster-hunger history',
      !(linkAsh.history || []).some(h => h.kind === 'muster-hunger'),
      JSON.stringify(linkAsh.history));
  }

  T.section('FAILING CONTROL: strip gardenMusterFeedFor');
  {
    clearGods();
    linkAsh.trust = 60;
    linkAsh.history = [];
    plantMuster(2);
    ascendPlayer('living_garden');
    v.harvestDay = day;
    const hook = Game.gardenMusterFeedFor;
    Game.gardenMusterFeedFor = function () { return 0; };
    let said;
    try {
      said = runUpkeep(day);
    } finally {
      Game.gardenMusterFeedFor = hook;
    }
    T.ok('FAILING CONTROL: pack spend restored when helper stripped',
      spendCalls.length === 1 && spendCalls[0] === 2000, JSON.stringify(spendCalls));
    T.ok('FAILING CONTROL: hunger line restored', said.some(t => /muster is hungry/i.test(t)));
    T.ok('FAILING CONTROL: trust bleed restored', linkAsh.trust === 58, linkAsh.trust);
    // Haven harvestDay stamp alone is not army LIVE without the muster hook.
    T.ok('FAILING CONTROL: harvestDay still stamped (Haven feed alone is not enough)',
      v.harvestDay === day);
  }

  T.section('non-Garden holders get no cover');
  {
    clearGods();
    delete v.harvestDay;
    linkAsh.trust = 60;
    linkAsh.history = [];
    plantMuster(2);
    ascendPlayer('market_god');
    v.harvestDay = day; // stamped alone must not cover for Market
    T.ok('Market holder + harvestDay stamp covers nothing', Game.gardenMusterFeedFor(2000) === 0);
    const said = runUpkeep(day);
    T.ok('Market: pack still charged', spendCalls.length === 1 && spendCalls[0] === 2000);
    T.ok('Market: hunger still said', said.some(t => /muster is hungry/i.test(t)));
    T.ok('Market: trust still bleeds', linkAsh.trust === 58, linkAsh.trust);

    clearGods();
    linkAsh.trust = 60;
    linkAsh.history = [];
    plantMuster(2);
    ascendPlayer('voice_of_the_relay');
    v.harvestDay = day;
    T.ok('Voice holder + harvestDay stamp covers nothing', Game.gardenMusterFeedFor(2000) === 0);
    runUpkeep(day);
    T.ok('Voice: trust still bleeds', linkAsh.trust === 58, linkAsh.trust);
  }

  T.section('NPC Living Garden holder covers');
  {
    clearGods();
    const others = (v.roster || []).filter(id => id !== Game.villagerId);
    const vid = others[0];
    T.ok('fixture villager for NPC Garden', !!vid, others.length);
    linkAsh.trust = 60;
    linkAsh.history = [];
    plantMuster(2);
    T.ok('villager ascends Living Garden', ascendVillager(vid, 'living_garden') === 'living_garden');
    v.harvestDay = day;
    T.ok('NPC Garden helper covers need', Game.gardenMusterFeedFor(2000) === 2000);
    const said = runUpkeep(day);
    T.ok('NPC Garden: pack spend skipped', spendCalls.length === 0, JSON.stringify(spendCalls));
    T.ok('NPC Garden: trust unchanged', linkAsh.trust === 60, linkAsh.trust);
    T.ok('NPC Garden: feed line said', said.some(t => /Living Garden feeds the muster/i.test(t)));
  }

  T.section('prior contest leans + Voice army preserved');
  {
    clearGods();
    const cookfight = { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
    const impress = { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
    const price = { id: 'price', name: 'The Price', cat: 'moot', risk: 'extreme' };
    ascendPlayer('living_garden');
    T.ok('Garden feast lean still fires for cookfight', Game.gardenFeastLeanFor(Game.villagerId, cookfight) > 0);
    T.ok('Garden feast lean still ignores impress', Game.gardenFeastLeanFor(Game.villagerId, impress) === 0);
    clearGods();
    ascendPlayer('voice_of_the_relay');
    T.ok('Voice performance lean still fires for impress', Game.voicePerformanceLeanFor(Game.villagerId, impress) > 0);
    clearGods();
    ascendPlayer('market_god');
    T.ok('Market sponsor lean still fires for price', Game.marketSponsorLeanFor(Game.villagerId, price) > 0);
    T.ok('Voice army delivery still callable', typeof Game.voiceDeliverAllied === 'function');
    // Fixture still has the ashford link; delivery should reach it (army LIVE preserved).
    const reached = Game.voiceDeliverAllied(day);
    T.ok('Voice army delivery still reaches the linked fire', reached === 1, reached);
  }

  Game.playerPackSpend = savedSpend;
  Game.mshipState = savedMship;
  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
