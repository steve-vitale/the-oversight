#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('survival-parity');
(async () => {
  const saves=new Map(); globalThis.localStorage={getItem:k=>saves.get(k)??null,setItem:(k,v)=>saves.set(k,String(v)),removeItem:k=>saves.delete(k),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
  const G = await K.load({ seed: Number(process.env.SEED||7) });
  let s, v, id;
  function fresh(ids) {
    G.tbfight = null; G.over=false; G.won=false; K.newRun(G); s = G.state.scholar; v = G.state.village;
    s.day = 85; s.health=100; s.kcal=3000; s.abilities=[]; s.backgroundAbilities=[]; G.state.systemArrived = true;
    id = v.roster.find(x => x !== G.villagerId && G.npcAge(x)>=18); const person=G.getPerson(id);person.items=[];person.equipped={};person.backgroundAbilities=[];v.npcSynergies={};v.party=[id];v.followers=[];v.health={[id]:5};
    v.npcAbilities = { [id]: ids.slice() }; G.npcNeeds(id).hunger = 10;
  }
  function arena() {
    G.tbfight = null; v.health[id] = 100; const foe = K.fight(G, 'hushwolf', { party: true });
    let ally = G.tbfight.fighters.find(x => x.villagerId === id);
    if (!ally) { ally = { key: 'v_passive', kind: 'villager', villagerId: id, name: 'Survivor', mx: 3, my: 3, speed: 3 }; G.tbfight.fighters.push(ally); G.tbfight.order.push(ally.key); }
    Object.assign(ally, { hp: 5, maxHp: 100, alive: true, fled: false });
    return { ally, foe };
  }
  const strike = (a, foe) => G.tbDamage(a.key, 999, 'test', foe.key, {undodgeable:true});
  fresh(['second_wind', 'back_from_the_brink']);
  let { ally, foe } = arena(); G.npcNeeds(id).hunger = 95; strike(ally, foe);
  T.ok('actual NPC battle Second Wind restores 1 HP and the 500-kcal floor', ally.alive && ally.hp === 1 && G.npcNeeds(id).hunger === 80);
  T.ok('Back from the Brink follows Second Wind too', ally._nextStrikes?.mult === 1.5 && ally._nextStrikes.n === 3);
  T.ok('the actual NPC has a canonical use and earned deed', v.godpathSurvival[id].secondWindUses === 1 && v.godpathDeeds[id].death_refused.ability === 'second_wind');
  G.tbfight = null; v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'monster');
  T.ok('switching from battle to world does not refresh a spent daily use', v.health[id] === 0 && !v.roster.includes(id));
  fresh(['second_wind']); v.health = { [id]: 5 }; G.npcNeeds(id).hunger = 95;
  G.hurtVillager(id, 999, 'known disease', null, { nonviolent: true });
  T.ok('actual nonviolent NPC damage refuses death without creating food', v.health[id] === 1 && G.npcNeeds(id).hunger === 95 && v.roster.includes(id));
  s.day++; v.health[id] = 5; G.hurtVillager(id, 999, 'monster');
  T.ok('a new day restores the shared daily use', v.health[id] === 1 && v.godpathSurvival[id].secondWindDay === s.day);
  fresh(['second_wind']); v.npcSynergies = { [id]: ['refuses_death'] }; v.health = { [id]: 5 };
  G.hurtVillager(id, 999, 'monster'); G.hurtVillager(id, 999, 'monster');
  T.ok('discovered Refuses Death grants two actual uses', v.health[id] === 1 && v.godpathSurvival[id].secondWindUses === 2);
  G.hurtVillager(id, 999, 'monster');
  T.ok('the synergy still has a hard cap', v.health[id] === 0);
  fresh(['molt']); v.npcSynergies = { [id]: ['refuses_death'] }; v.health = { [id]: 5 };
  G.hurtVillager(id, 999, 'monster'); G.hurtVillager(id, 999, 'monster');
  T.ok('the same discovered synergy grants two weekly Molts', v.health[id] === 100 && v.godpathSurvival[id].moltUses === 2);
  G.hurtVillager(id, 999, 'monster');
  T.ok('weekly Molt uses remain capped with the synergy', v.health[id] === 0);
  fresh(['second_wind']); v.npcSecondWind = { [id]: s.day }; v.health = { [id]: 5 };
  G.hurtVillager(id, 999, 'monster');
  T.ok('old-save NPC daily markers remain spent', v.health[id] === 0);
  fresh(['molt']); const person = G.vpOf(id);
  person.items = ['hunting_spear','hide_armor']; person.equipped = { melee: { itemId: 'hunting_spear' }, torso: { itemId: 'hide_armor' } };
  ({ ally, foe } = arena());
  ally.wbonus = globalThis.Scattering.equipment.weaponBonusOf(person, G.data.items);
  ally.varmor = globalThis.Scattering.equipment.armorOf(person, G.data.items);
  T.ok('prepared Molt price uses real equipped weapon and armor bonuses', ally.wbonus > 0 && ally.varmor > 0);
  strike(ally, foe);
  T.ok('actual NPC Molt fully restores their own HP', ally.alive && ally.hp === 100);
  T.ok('Molt loses real worn gear and its cached battle bonuses', Object.keys(person.equipped).length === 0 && ally.wbonus === 0 && ally.varmor === 0 && !person.items.includes('hunting_spear') && !person.items.includes('hide_armor'));
  G.tbfight = null; v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'monster');
  T.ok('a new scene does not refresh the weekly Molt', v.health[id] === 0);
  fresh(['molt']); v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'sickness', null, { nonviolent: true });
  T.ok('Molt works on actual world damage as well', v.health[id] === 100 && v.godpathSurvival[id].moltUses === 1);
  s.day += 7; v.health[id] = 5; G.hurtVillager(id, 999, 'monster');
  T.ok('a later week restores Molt', v.health[id] === 100 && v.godpathSurvival[id].moltWeek === Math.floor(s.day / 7));
  fresh(['ember_heart', 'second_wind']); G.npcNeeds(id).hunger = 95;
  ({ ally, foe } = arena()); strike(ally, foe);
  T.ok('unfunded Ember Heart falls through to a valid Second Wind', ally.alive && ally.hp === 1 && v.godpathDeeds[id].death_refused.ability === 'second_wind');
  fresh(['second_wind', 'rage']); v.npcSynergies = { [id]: ['undying_fury'] };
  ({ ally, foe } = arena()); ally._vRageRounds = 0; strike(ally, foe);
  T.ok('merely holding Rage does not trigger Undying Fury', ally.hp === 1, JSON.stringify({hp:ally.hp,alive:ally.alive,rage:ally._vRageRounds,dead:G.vpOf(id).dead}));
  fresh(['second_wind', 'rage']); v.npcSynergies = { [id]: ['undying_fury'] };
  ({ ally, foe } = arena()); ally._vRageRounds = 2; strike(ally, foe);
  T.ok('actual active rage triggers the full Undying Fury restore', ally.hp === 100);
  fresh(['molt', 'second_wind']); v.health = { [id]: 5 };
  G.hurtVillager(id, 999, 'monster'); G.hurtVillager(id, 999, 'monster');
  T.ok('the same death-cheat order as the player uses Molt then Second Wind', v.health[id] === 1 && v.godpathSurvival[id].moltUses === 1 && v.godpathSurvival[id].secondWindUses === 1);
  fresh(['molt', 'second_wind']); v.health = { [id]: 5 };
  G.state.phoenixLink = { bearerIsPlayer: false, bearer: id };
  G.hurtVillager(id, 999, 'monster');
  T.ok('their own pending rescue holds without spending or inventing a class deed', v.health[id] === 1 && !v.godpathSurvival?.[id] && !v.godpathDeeds?.[id]);
  fresh(['molt']); v.health = { [id]: 5 };
  G.state.phoenixLink = { bearerIsPlayer: false, bearer: v.roster.find(x => x !== id && x !== G.villagerId) };
  G.hurtVillager(id, 999, 'monster');
  T.ok('another person pending link does not consume or grant their rescue', v.health[id] === 100 && v.godpathSurvival[id].moltUses === 1);
  fresh(['second_wind']); v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'monster');
  const successor = id; v.trust = { [id]: 10000 }; s.abilities = []; G.playerDeath('prepared succession');
  s = G.state.scholar; v = G.state.village; s.abilities = [{ id: 'second_wind', level: 1 }];
  s.health = 0;
  T.ok('actual succession cannot reset the new bearer own spent NPC use', G.villagerId === successor && G.maybeCheatDeath() === false);
  fresh(['molt']); v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'monster');
  v.trust = { [id]: 10000 }; s.abilities = []; G.playerDeath('prepared Molt succession');
  s = G.state.scholar; s.abilities = [{ id: 'molt', level: 1 }];
  T.ok('the voluntary player shed cannot bypass NPC-era weekly use', G.useAbility('molt', 'shed_skin') === false);
  // A deterministic real field battle must both activate and settle a rescue.
  fresh(['molt', 'second_wind']); v.health = { [id]: 1 };
  const def = { ...G.data.monsters.find(m => m.id === 'hushwolf'), hp: [5000, 5000], attack: { damage: [100, 100], accuracy: 1 }, speed: 99 };
  const rec = G.fieldFight(id, def, null, { rng: () => 0.5 });
  T.ok('real field fight activates Molt', /\(Molt\)/.test(rec.log.join('\n')) && v.godpathSurvival[id].moltUses === 1);
  const end = rec.vHpLeft; G.hurtVillager(id, rec.vTaken, 'monster', rec);
  T.ok('field health settlement uses the actual returned HP', v.health[id] === end);
  if (end > 0) {
    G.hurtVillager(id, 1, 'test'); const wounded = v.health[id];
    T.ok('replaying the same settlement cannot heal or damage again', G.hurtVillager(id, rec.vTaken, 'monster', rec) === false && v.health[id] === wounded);
  } else T.ok('field death remains a real death', !v.roster.includes(id));
  fresh(['second_wind']);
  const other = v.roster.find(x => x !== id && x !== G.villagerId);
  v.health = { [id]: 50, [other]: 70 };
  T.ok('a field receipt cannot be applied to another person', G.hurtVillager(other, 40, 'test', { vTaken: 40, healthSettlement: { who: id, start: 50, end: 10 } }) === false && v.health[other] === 70);
  for (const scene of ['wild', 'contest']) {
    fresh(['molt', 'second_wind']); v.health = { [id]: 1 };
    // A survivable sealed encounter must finish honestly after the rescue.
    const sceneDef = scene === 'contest' ? { ...def, hp: [1, 1], pack: 1, attacks: [], attack: { damage: [60, 60], accuracy: 1 } } : def;
    const original = G.fieldFight; let played;
    G.fieldFight = function (who, ignored, entity, opts) { played = original.call(this, who, sceneDef, entity, { ...opts, rng: () => 0.5 }); return played; };
    try {
      if (scene === 'wild') G.resolveWildMonsterEncounter(id, { id: 'hushwolf', hp: 5000, maxHp: 5000, tx: 4, ty: 4 });
      else G._cxBlood(id, { id: 'pit', variant: 'standard' }, {});
    } finally { G.fieldFight = original; }
    T.ok(scene + ' actual caller preserves returned survivor HP after real Molt', played.vHpLeft > 0 && /\(Molt\)/.test(played.log.join('\n')) && v.health[id] === played.vHpLeft && v.roster.includes(id));
    if (scene === 'contest') T.ok('sealed Molt survivor earns a real finishing kill', played.outcome === 'vKill' && !played.fleeLearn);
  }
  fresh([]); s.abilities=[{id:'second_wind',level:1}]; s.health=5;
  G.hurtVillager('player',999,'monster');
  T.ok('actual player refusal synchronizes the canonical world mirror',s.health===1&&v.health[G.villagerId]===1&&!Object.hasOwn(v.health,'player'));
  fresh([]); s.abilities=[{id:'molt',level:1}]; s.health=5;s.equipped={torso:{itemId:'hide_armor',units:1}};
  T.ok('the real voluntary Molt action can spend a fresh weekly use',G.useAbility('molt','shed_skin')===true&&s.health===G.maxHealth()&&!Object.keys(s.equipped).length&&v.godpathSurvival[G.villagerId].moltUses===1);
  s.health=0;
  T.ok('automatic refusal cannot refresh a voluntary weekly use',G.maybeCheatDeath()===false);
  fresh(['second_wind']);v.health[id]=5;G.hurtVillager(id,999,'monster');G.save();const key=G.state.runKey;
  const loaded=G.load(key);s=G.state.scholar;v=G.state.village;
  T.ok('Continue retains the canonical NPC daily use',loaded&&v.godpathSurvival[id].secondWindDay===85&&v.godpathSurvival[id].secondWindUses===1);
  ({ally,foe}=arena());strike(ally,foe);
  T.ok('Continue and a new battle cannot refresh the spent NPC use',!ally.alive&&ally.hp<=0);
  fresh(['molt']);const priced=G.getPerson(id);priced.items=['hunting_spear','hunting_spear','hide_armor','bandage'];priced.equipped={melee:{itemId:'hunting_spear'},torso:{itemId:'hide_armor'}};v.health[id]=5;G.hurtVillager(id,999,'monster');
  T.ok('Molt destroys worn copies while preserving actual unworn spares',priced.items.filter(x=>x==='hunting_spear').length===1&&!priced.items.includes('hide_armor')&&priced.items.includes('bandage')&&!Object.keys(priced.equipped).length);
  fresh(['second_wind']);v.health[id]=1;G.npcNeeds(id).hunger=95;v.sick={[id]:{name:'gut rot',diagnosed:'Gut rot',severity:10,daysLeft:5}};G.villageSicknessTick();
  T.ok('actual named sickness caller refuses death without a spite ration',v.health[id]===1&&v.roster.includes(id)&&G.npcNeeds(id).hunger===95&&v.godpathDeeds[id].death_refused.ability==='second_wind');
  fresh(['second_wind']);v.health[id]=5;const lethal=G.sealDamageResult({},[[id,999,{start:5,end:0}]]);G.hurtVillager(id,999,'monster',lethal);
  T.ok('an authoritative lethal field outcome cannot receive a second world rescue',v.health[id]===0&&!v.roster.includes(id)&&!v.godpathSurvival?.[id]);
  fresh(['molt','second_wind']);const GP=globalThis.Scattering.Godpath,none=JSON.stringify(v.godpathSurvival||null);
  T.ok('healthy and unknown bodies cannot spend canonical survival resources',GP.npcDeathRefusal(G,id,{hp:5,maxHp:100,scene:'world'})===null&&GP.npcDeathRefusal(G,'missing-person',{hp:0,maxHp:100,scene:'world'})===null&&JSON.stringify(v.godpathSurvival||null)===none);
  ({ally,foe}=arena());ally._echoed=true;strike(ally,foe);
  T.ok('echoed bodies cannot borrow canonical personal passives',!ally.alive&&!v.godpathSurvival?.[id]&&!v.godpathDeeds?.[id]?.death_refused);
  // Keep the former hard fixture: its rescue cannot grant an illegal escape.
  fresh(['molt', 'second_wind']); v.health = { [id]: 1 };
  const fieldOriginal = G.fieldFight; let hardFight, hardVerdict;
  G.fieldFight = function(who, ignored, entity, opts) { hardFight = fieldOriginal.call(this, who, def, entity, { ...opts, rng: () => 0.5 }); return hardFight; };
  try { hardVerdict = G._cxBlood(id, { id: 'pit', variant: 'standard' }, {}); }
  finally { G.fieldFight = fieldOriginal; }
  T.ok('hopeless sealed fight records Molt before the later real death', /\(Molt\)/.test(hardFight.log.join('\n')) && hardFight.outcome === 'vDie' && !hardFight.fleeLearn);
  T.ok('later arena death reaches actual person health and roster', hardVerdict.outcome === 'died' && v.health[id] === 0 && !v.roster.includes(id) && G.getPerson(id).dead);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
