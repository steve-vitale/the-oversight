#!/usr/bin/env node
// Prepared builds and lethal hits exercise real game actions; not natural wins.
'use strict';
const K = require('./lib'), T = K.reporter('survivalist-deed');
(async () => {
  const saved = new Map();
  global.localStorage = {
    getItem: k => saved.get(String(k)) ?? null,
    setItem: (k, value) => saved.set(String(k), String(value)),
    removeItem: k => saved.delete(String(k)),
    key: i => [...saved.keys()][i] ?? null,
    get length() { return saved.size; },
  };
  const G = await K.load({ seed: 7 }), GH = globalThis.Scattering.Godhood;
  const god = GH.byId('unkillable');
  const undying = ['second_wind', 'survivor', 'symbiote', 'back_from_the_brink'];
  const furnace = ['feast_engine', 'deep_reserves', 'stoke', 'ember_heart'];
  let s, v;
  function fresh(ids = undying) {
    G.tbfight = null; K.newRun(G); s = G.state.scholar; v = G.state.village;
    G.state.systemArrived = true; s.day = 85; s.kcal = 3000;
    s.abilities = ids.map(id => ({ id, level: 1 })); s.activeSynergies = [];
    G.recognizeClass('player');
  }
  const status = who => G.godpathDeedStatus(who || 'player', god.id);
  const close = () => GH.godhoodCloseness(s, god, s.day);
  fresh(); s.godpath.since = 1; s.activeSynergies = god.requires.synergies.slice();
  const before = JSON.stringify(G.state);
  T.ok('old saves get no invented deed from class age or every synergy', !close().synergy && !close().complete && !status().observed);
  T.ok('missing progress reads do not mutate a save', JSON.stringify(G.state) === before && !v.godpathDeeds);
  T.ok('new objective is visible only after a class is named', !!G.godpathDeedHint('player') && !G.godpathDeedHint((v.roster || []).find(id => id !== G.villagerId)));
  const hint = GH.hintBeat(G, god.id);
  T.ok('the actual System guide asks for the outcome rather than an obsolete resonance', hint.includes(god.requires.deed.hint) && !hint.includes('a resonance like'));
  T.ok('healthy no-op cannot earn a death-refusal receipt', G.maybeCheatDeath() === false && !status().observed);
  s.activeSynergies = []; const me = G.villagerId;
  G.hurtVillager(me, 999, 'contest');
  T.ok('actual lethal damage triggers Second Wind and records its real actor', s.health === 1 && v.godpathDeeds?.[me]?.death_refused.ability === 'second_wind' && status().observed);
  T.ok('the same day is too early to complete the deed', !status().complete && !close().complete);
  const receipt = JSON.stringify(v.godpathDeeds[me]);
  G.maybeCheatDeath();
  T.ok('no-op retries cannot replace or multiply the receipt', JSON.stringify(v.godpathDeeds[me]) === receipt);
  s.day++;
  T.ok('another day alive completes the real deed and full gate', status().complete && close().complete);
  T.ok('a detached scholar cannot borrow the current bearer accomplishment', !GH.godhoodCloseness({ ...s, villagerId: undefined }, god, s.day).synergy);
  s.health = 0;
  T.ok('a dead holder cannot satisfy the alive-after-dawn requirement', !status().complete);
  s.health = 1; G.checkPlayerGodhoodAscension();
  T.ok('the actual ascension check recognizes Unkillable', s.godhood.active.includes(god.id));
  T.ok('recognized old gods need no retroactive deed and no unfinished objective', (delete v.godpathDeeds, G.checkPlayerGodhoodAscension(), s.godhood.active.includes(god.id) && G.godpathDeedHint('player') === null));
  fresh(['molt', 'survivor', 'symbiote', 'back_from_the_brink']);
  s.equipped.acc1 = { itemId: 'field_knife', units: 1 }; G.hurtVillager(G.villagerId, 999, 'contest');
  T.ok('Molt records a real refusal while retaining its gear-loss price', v.godpathDeeds?.[G.villagerId]?.death_refused.ability === 'molt' && Object.keys(s.equipped).length === 0);
  fresh(furnace); K.fight(G, 'hushwolf'); s.kcal = 1000; s.health = 0;
  T.ok('Furnace Ember Heart pays real food and earns a pending receipt', G.maybeCheatDeath() && s.kcal === 400 && v.godpathDeeds?.[G.villagerId]?.death_refused.ability === 'ember_heart' && !status().complete);
  fresh(furnace); K.fight(G, 'hushwolf'); s.kcal = 0; s.health = 0;
  T.ok('an unfunded Ember Heart cannot manufacture a deed', !G.maybeCheatDeath() && !status().observed);
  fresh(undying); G.state.phoenixLink = { bearerIsPlayer: true }; s.health = 0;
  T.ok('a pending borrowed Phoenix rescue is not a completed class refusal', G.maybeCheatDeath() && !status().observed);
  fresh(); s.health = 0; s.kcal = 0;
  T.ok('noncombat starvation refusal earns a receipt but prints no food or instant ascension', G.maybeCheatDeath('starvation') && s.health === 1 && s.kcal === 0 && status().observed && !status().complete);
  fresh(furnace);
  const npc = v.roster.find(id => id !== G.villagerId);
  v.npcAbilities = { [npc]: furnace.slice() }; G.recognizeClass(npc); G.npcNeeds(npc).hunger = 10;
  const monster = K.fight(G, 'hushwolf', { party: true }), f = G.tbfight;
  const ally = f.fighters.find(x => x.villagerId === npc) || { key: 'v_deed', kind: 'villager', villagerId: npc, name: 'Deed holder', hp: 5, maxHp: 30, speed: 3, mx: 3, my: 3, alive: true };
  if (!f.fighters.includes(ally)) { f.fighters.push(ally); f.order.push(ally.key); }
  ally.hp = 5; ally.maxHp = 30; ally.alive = true; G.tbDamage(ally.key, 20, 'test', monster.key, {});
  T.ok('real NPC lethal hit records Ember Heart and charges the same 600 kcal', ally.alive && ally.hp === 6 && G.npcNeeds(npc).hunger === 34 && v.godpathDeeds?.[npc]?.death_refused.ability === 'ember_heart');
  s.day++;
  T.ok('NPC uses the same next-day deed gate, without lending it to the bearer', status(npc).complete && GH.villagerGodhoodCloseness(G, npc, god).complete && !status().complete, JSON.stringify({ npc, me: G.villagerId, status: status(npc), close: GH.villagerGodhoodCloseness(G, npc, god), hp: v.health?.[npc], dead: G.vpOf(npc).dead }));
  const npcReceipt = JSON.stringify(v.godpathDeeds[npc]);
  // The actual succession action chooses the prepared trusted holder.
  G.tbfight = null; v.trust = { [npc]: 10000 }; s.abilities = []; G.playerDeath('prepared succession');
  s = G.state.scholar; v = G.state.village;
  T.ok('actual succession retains the successor own NPC-era deed', G.villagerId === npc && JSON.stringify(v.godpathDeeds[npc]) === npcReceipt && status().complete, JSON.stringify({ npc, me: G.villagerId, status: status(), over: G.over, roster: v.roster }));
  const next = v.roster.find(id => id !== G.villagerId);
  v.trust = { [next]: 20000 }; s.abilities = []; G.playerDeath('second prepared succession');
  s = G.state.scholar; v = G.state.village;
  T.ok('another successor does not inherit either predecessor deed', G.villagerId === next && !status().observed, JSON.stringify({ next, me: G.villagerId, status: status(), over: G.over }));
  // A real off-screen fight must reach the hook, not just a direct helper call.
  fresh(); const fieldVid = v.roster.find(id => id !== G.villagerId);
  v.npcAbilities = { [fieldVid]: ['second_wind'] }; v.health = { [fieldVid]: 1 };
  const def = { ...G.data.monsters.find(m => m.id === 'hushwolf'), hp: [5000, 5000], attack: { damage: [100, 100], accuracy: 1 }, speed: 99 };
  const field = G.fieldFight(fieldVid, def, null, { rng: () => 0.5 });
  T.ok('real off-screen fight credits the NPC Second Wind outcome', v.godpathDeeds?.[fieldVid]?.death_refused.ability === 'second_wind' && /Second wind/i.test(field.log.join('\n')));
  fresh(); G.hurtVillager(G.villagerId, 999, 'contest');
  const savedId = G.villagerId, savedReceipt = JSON.stringify(v.godpathDeeds[savedId]);
  G.save(); const saveKey = G.state.runKey; v.godpathDeeds = {};
  const loaded = G.load(saveKey); s = G.state.scholar; v = G.state.village;
  T.ok('real save/load retains the actor receipt without completing it early', loaded && JSON.stringify(v.godpathDeeds?.[savedId]) === savedReceipt && status().observed && !status().complete);
  fresh(); const dawnId = G.villagerId; G.hurtVillager(dawnId, 999, 'contest');
  // A prepared recovery reserve keeps this a dawn-gate proof, not a survival trial.
  s.health = 50; s.kcal = 3000; const oldDay = s.day; G.endDay();
  T.ok('actual dawn wrapper completes the earned deed and runs the ceremony', G.villagerId === dawnId && s.day > oldDay && s.godhood.active.includes(god.id));
  fresh(furnace); const gone = v.roster.find(id => id !== G.villagerId);
  v.npcAbilities = { [gone]: furnace.slice() }; G.npcNeeds(gone).hunger = 10;
  const foe = K.fight(G, 'hushwolf', { party: true });
  const away = G.tbfight.fighters.find(x => x.villagerId === gone) || { key: 'v_away', kind: 'villager', villagerId: gone, name: 'Departing survivor', speed: 3, mx: 3, my: 3 };
  if (!G.tbfight.fighters.includes(away)) { G.tbfight.fighters.push(away); G.tbfight.order.push(away.key); }
  away.hp = 5; away.maxHp = 30; away.alive = true;
  G.tbDamage(away.key, 20, 'test', foe.key, {}); s.day++;
  G.removeVillager(gone, 'exiled');
  T.ok('actual exile does not erase a living person earned deed', !v.roster.includes(gone) && status(gone).complete);
  G.hurtVillager(gone, 999, 'test');
  T.ok('the departed holder still has to be alive', !status(gone).complete);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
