#!/usr/bin/env node
// Prepared pantry meals exercise real intake + dawn settlement; not natural wins.
'use strict';
const K = require('./lib'), T = K.reporter('forager-deed');
(async () => {
  const saved = new Map();
  global.localStorage = {
    getItem: k => saved.get(String(k)) ?? null,
    setItem: (k, value) => saved.set(String(k), String(value)),
    removeItem: k => saved.delete(String(k)),
    key: i => [...saved.keys()][i] ?? null,
    get length() { return saved.size; },
  };
  const G = await K.load({ seed: Number(process.env.SEED || 7) }), GH = globalThis.Scattering.Godhood;
  const god = GH.byId('living_garden');
  const gardener = ['green_thumb', 'green_whisper', 'rain_dancer', 'cornucopia'];
  let s, v, me, npc, other;
  function fresh(ids = gardener) {
    G.tbfight = null; G.over = false; G.won = false; K.newRun(G);
    s = G.state.scholar; v = G.state.village; me = G.villagerId;
    [npc, other] = v.roster.filter(id => id !== me);
    v.roster = [me, npc, other];
    G.state.systemArrived = true; s.day = 85; s.kcal = 3000; s.health = 100;
    s.backgroundAbilities = []; s.equipped = {}; s.godhood = { active: [], recognized: {} };
    s.abilities = ids.map(id => ({ id, level: 1 })); s.activeSynergies = [];
    v.npcAbilities = {}; v.npcGodhood = {}; v.npcGodpath = {};
    delete v.godpathDeeds; delete v.godpathHarvestFeed; delete v.harvestIntake; delete v.harvestIntakeTotals;
    // Prepared village: no travelers, arrivals, away parties, or overnight deaths.
    G.state.otherVillages = []; v.visitors = []; v.away = {};
    try { const m = G.mshipState && G.mshipState(); if (m) { m.arrivals = []; m.applications = []; } } catch (e) {}
    v.health = { [npc]: 100, [other]: 100 };
    for (const id of v.roster) G.npcNeeds(id).hunger = 60;
    G.recognizeClass('player');
  }
  const status = who => G.godpathDeedStatus(who || 'player', god.id) || { observed: false, complete: false, pending: false };
  const book = who => v.godpathDeeds?.[who || me]?.harvest_fed;
  const close = who => who && who !== 'player' && who !== me
    ? GH.villagerGodhoodCloseness(G, who, god)
    : GH.godhoodCloseness(s, god, s.day);
  function tagged(producer, kcalEach = 500, units = 200) {
    return {
      name: 'Harvest stores', units, kcalEach, safe: true, edible: true, foodState: 'ready',
      spoilDay: 9999, harvestShares: { [producer]: 1 },
    };
  }
  function dawn() {
    const prod = G.villagerDayProduction;
    const random = Math.random;
    try {
      // Isolate the pantry-fed path: personal catch would dilute provenance.
      G.villagerDayProduction = () => 0;
      Math.random = () => 0.99;
      G.endDay();
    } finally {
      G.villagerDayProduction = prod;
      Math.random = random;
    }
    s = G.state.scholar; v = G.state.village;
    // Keep the prepared trio alive and present for the streak proof.
    v.roster = [me, npc, other];
    s.health = Math.max(s.health, 80); s.kcal = Math.max(s.kcal, 2500);
    v.health = { [npc]: 100, [other]: 100 };
    for (const id of [npc, other]) {
      const p = G.getPerson(id); if (p) p.dead = false;
      G.npcNeeds(id).hunger = Math.min(G.npcNeeds(id).hunger, 40);
    }
    G.state.otherVillages = []; v.visitors = []; v.away = {};
    try { const m = G.mshipState && G.mshipState(); if (m) { m.arrivals = []; m.applications = []; } } catch (e) {}
  }
  function feedFrom(producer) {
    v.roster = [me, npc, other];
    try { const m = G.mshipState && G.mshipState(); if (m) { m.arrivals = []; m.applications = []; } } catch (e) {}
    v.pantry = [tagged(producer)];
    for (const id of v.roster) G.npcNeeds(id).hunger = 60;
    if (producer !== me) {
      // Eat a real tagged bite, then top the bank so overnight burn cannot kill the streak.
      s.kcal = Math.max(0, (G.kcalCap ? G.kcalCap() : 3000) - 2000);
      s.inventory = [tagged(producer, 800, 4)];
      const before = s.kcal;
      G.eatOne(0);
      if (!(s.kcal > before)) throw new Error('prepared producer meal did not feed the bearer');
      s.kcal = Math.max(s.kcal, 3000);
    } else {
      s.kcal = 3000; s.inventory = [];
    }
    dawn();
  }

  T.ok('Living Garden authors the harvest-fed deed (removing it fails this proof)',
    god.requires.deed?.event === 'harvest_fed' && god.requires.deed.days === 7 && god.requires.deed.minKcal === 400);

  fresh(); s.godpath.since = 1; s.activeSynergies = god.requires.synergies.slice();
  const before = JSON.stringify(G.state);
  T.ok('old class age and every synergy cannot replace the harvest deed', !close().synergy && !status().observed && !status().complete);
  T.ok('missing progress reads invent no harvest streak or receipt', JSON.stringify(G.state) === before && !v.godpathDeeds && !v.godpathHarvestFeed);
  T.ok('known class receives the authored harvest objective', G.godpathDeedHint('player') === god.requires.deed.hint);
  const hint = GH.hintBeat(G, god.id);
  T.ok('System guide asks for the lived harvest outcome', hint.includes(god.requires.deed.hint) && !hint.includes('a resonance like'));

  fresh();
  v.pantry = [{ name: 'Anonymous stores', units: 200, kcalEach: 500, safe: true, spoilDay: 9999 }];
  for (const id of v.roster) G.npcNeeds(id).hunger = 60;
  s.kcal = 0; s.inventory = [{ name: 'Anonymous meal', units: 1, kcalEach: 2500, safe: true, edible: true, foodState: 'ready', spoilDay: 9999 }];
  G.eatOne(0); dawn();
  T.ok('anonymous meals cannot mint a harvest streak', !status().pending && !status().observed && !v.godpathHarvestFeed);

  fresh();
  feedFrom(me);
  T.ok('one real harvest-fed dawn opens the pending streak, not the completed deed',
    status().pending && !status().complete && !status().observed && (v.godpathHarvestFeed?.[me]?.streak === 1));
  T.ok('pending objective names the continuing harvest work', G.godpathDeedHint('player') === god.requires.deed.pendingHint);

  for (let i = 0; i < 5; i++) feedFrom(me);
  T.ok('six consecutive harvest-fed days stay pending', status().pending && !status().complete && v.godpathHarvestFeed?.[me]?.streak === 6);

  feedFrom(me);
  T.ok('seven consecutive harvest-fed days write the person-owned receipt',
    status().complete && status().observed && book()?.streak === 7 && book()?.fed >= 2);
  T.ok('completed harvest deed unlocks the existing build/day gates', close().complete && close().synergy);
  G.checkPlayerGodhoodAscension();
  T.ok('actual player ceremony recognizes the Living Garden', s.godhood.active.includes(god.id));
  const gift = (GH.capstoneItemFor(god) || god.requires.capstoneItems[0]);
  T.ok('ceremony gifts an authored garden capstone once',
    s.inventory.some(x => x.itemId === gift) && (G.checkPlayerGodhoodAscension(), s.inventory.filter(x => x.itemId === gift).length === 1));

  fresh();
  for (let i = 0; i < 3; i++) feedFrom(me);
  T.ok('mid-streak is pending', status().pending && v.godpathHarvestFeed?.[me]?.streak === 3);
  v.pantry = [{ name: 'Anonymous stores', units: 200, kcalEach: 500, safe: true, spoilDay: 9999 }];
  for (const id of v.roster) G.npcNeeds(id).hunger = 60;
  s.kcal = 3000; dawn();
  T.ok('a day without the producer harvest breaks the streak', !status().pending && !v.godpathHarvestFeed?.[me]);

  fresh();
  const receiptDays = [];
  for (let i = 0; i < 7; i++) {
    feedFrom(me);
    receiptDays.push(book()?.day ?? null);
  }
  T.ok('the receipt stamps the seventh fed calendar day', book()?.day === 85 + 6);
  const first = JSON.stringify(book());
  feedFrom(me);
  T.ok('further harvest days cannot grind or replace the first receipt', JSON.stringify(book()) === first);

  fresh();
  for (let i = 0; i < 7; i++) feedFrom(me);
  G.save(); const key = G.state.runKey; v.godpathDeeds = {}; delete v.godpathHarvestFeed;
  T.ok('actual save/load retains the harvest receipt', G.load(key) && (s = G.state.scholar, v = G.state.village, status().complete && book()?.streak === 7));

  fresh();
  v.npcAbilities = { [npc]: gardener.slice() };
  G.recognizeClass(npc);
  for (let i = 0; i < 7; i++) feedFrom(npc);
  T.ok('NPC harvest-fed streak completes that person own deed without lending it to the bearer',
    status(npc).complete && !!book(npc) && !status().complete);
  T.ok('NPC closeness uses the same authored harvest gate', GH.villagerGodhoodCloseness(G, npc, god).complete);
  G.checkVillagerGodhoodAscension(npc);
  T.ok('actual NPC ceremony grants Living Garden and a capstone',
    v.npcGodhood?.[npc]?.active?.includes(god.id) &&
    G.getPerson(npc).items.some(x => (typeof x === 'string' ? x : x.itemId || x.id) === gift));

  fresh();
  for (let i = 0; i < 7; i++) feedFrom(me);
  const predecessor = me, kept = JSON.stringify(book());
  v.trust = { [npc]: 10000 }; s.abilities = []; s.kcal = 0; G.playerDeath('prepared harvest succession');
  s = G.state.scholar; v = G.state.village;
  T.ok('successor cannot inherit the predecessor harvest deed',
    G.villagerId === npc && JSON.stringify(v.godpathDeeds?.[predecessor]?.harvest_fed) === kept && !status().complete);

  fresh(); s.godhood = { active: [god.id], recognized: { [god.id]: 70 } };
  delete v.godpathDeeds; delete v.godpathHarvestFeed;
  G.checkPlayerGodhoodAscension();
  T.ok('already-recognized Living Garden needs no retroactive harvest deed',
    s.godhood.active.includes(god.id) && G.godpathDeedHint('player') === null);

  // Removal control: without the authored deed, class-age/synergy proxies return.
  // byId caches on the GODPATHS object identity — replace the root to rebuild.
  fresh(); s.godpath.since = 1; s.activeSynergies = god.requires.synergies.slice();
  const S = globalThis.Scattering, prevPaths = S.GODPATHS;
  const strippedRoot = JSON.parse(JSON.stringify(prevPaths));
  strippedRoot.paths.forager.god.deed = null;
  S.GODPATHS = strippedRoot; G.data.godpaths = strippedRoot;
  try {
    const stripped = GH.byId('living_garden');
    T.ok('removing the authored deed fails the gate this proof requires',
      stripped.requires.deed === null && !!GH.godhoodCloseness(s, stripped, 85).synergy);
  } finally {
    S.GODPATHS = prevPaths; G.data.godpaths = prevPaths;
  }
  T.ok('restoring the authored deed again blocks synergy proxies',
    GH.byId('living_garden').requires.deed?.event === 'harvest_fed' && !GH.godhoodCloseness(s, GH.byId('living_garden'), 85).synergy);

  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
