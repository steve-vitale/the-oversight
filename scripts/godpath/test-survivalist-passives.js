#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('survivalist-passives');
(async () => {
  const G = await K.load({ seed: 7 });
  let s, v, id;
  function fresh(ids) {
    G.tbfight = null; K.newRun(G); s = G.state.scholar; v = G.state.village;
    s.day = 85; G.state.systemArrived = true;
    id = v.roster.find(x => x !== G.villagerId);
    v.npcAbilities = { [id]: ids.slice() }; G.npcNeeds(id).hunger = 10;
  }
  function arena() {
    G.tbfight = null; const foe = K.fight(G, 'hushwolf', { party: true });
    let ally = G.tbfight.fighters.find(x => x.villagerId === id);
    if (!ally) { ally = { key: 'v_passive', kind: 'villager', villagerId: id, name: 'Survivor', mx: 3, my: 3, speed: 3 }; G.tbfight.fighters.push(ally); G.tbfight.order.push(ally.key); }
    Object.assign(ally, { hp: 5, maxHp: 100, alive: true, fled: false });
    return { ally, foe };
  }
  const strike = (a, foe) => G.tbDamage(a.key, 999, 'test', foe.key, {});
  fresh(['second_wind', 'back_from_the_brink']);
  let { ally, foe } = arena(); G.npcNeeds(id).hunger = 95; strike(ally, foe);
  T.ok('actual NPC battle Second Wind restores 1 HP and the 500-kcal floor', ally.alive && ally.hp === 1 && G.npcNeeds(id).hunger === 80);
  T.ok('Back from the Brink follows Second Wind too', ally._nextStrikes?.mult === 1.5 && ally._nextStrikes.n === 3);
  T.ok('the actual NPC has a canonical use and earned deed', v.godpathSurvival[id].secondWindUses === 1 && v.godpathDeeds[id].death_refused.ability === 'second_wind');
  G.tbfight = null; v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'monster');
  T.ok('switching from battle to world does not refresh a spent daily use', v.health[id] === 0 && !v.roster.includes(id));
  fresh(['second_wind']); v.health = { [id]: 5 }; G.npcNeeds(id).hunger = 95;
  G.hurtVillager(id, 999, 'known disease', { nonviolent: true });
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
  person.items = ['hunting_spear']; person.equipped = { melee: { itemId: 'hunting_spear' }, torso: { itemId: 'hide_armor' } };
  ({ ally, foe } = arena());
  ally.wbonus = globalThis.Scattering.equipment.weaponBonusOf(person, G.data.items);
  ally.varmor = globalThis.Scattering.equipment.armorOf(person, G.data.items);
  T.ok('prepared Molt price uses real equipped weapon and armor bonuses', ally.wbonus > 0 && ally.varmor > 0);
  strike(ally, foe);
  T.ok('actual NPC Molt fully restores their own HP', ally.alive && ally.hp === 100);
  T.ok('Molt loses real worn gear and its cached battle bonuses', Object.keys(person.equipped).length === 0 && ally.wbonus === 0 && ally.varmor === 0 && person.items.includes('hunting_spear'));
  G.tbfight = null; v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'monster');
  T.ok('a new scene does not refresh the weekly Molt', v.health[id] === 0);
  fresh(['molt']); v.health = { [id]: 5 }; G.hurtVillager(id, 999, 'sickness', { nonviolent: true });
  T.ok('Molt works on actual world damage as well', v.health[id] === 100 && v.godpathSurvival[id].moltUses === 1);
  s.day += 7; v.health[id] = 5; G.hurtVillager(id, 999, 'monster');
  T.ok('a later week restores Molt', v.health[id] === 100 && v.godpathSurvival[id].moltWeek === Math.floor(s.day / 7));
  fresh(['ember_heart', 'second_wind']); G.npcNeeds(id).hunger = 95;
  ({ ally, foe } = arena()); strike(ally, foe);
  T.ok('unfunded Ember Heart falls through to a valid Second Wind', ally.alive && ally.hp === 1 && v.godpathDeeds[id].death_refused.ability === 'second_wind');
  fresh(['second_wind', 'rage']); v.npcSynergies = { [id]: ['undying_fury'] };
  ({ ally, foe } = arena()); strike(ally, foe);
  T.ok('merely holding Rage does not trigger Undying Fury', ally.hp === 1);
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
  T.ok('the voluntary player shed cannot bypass NPC-era weekly use', G.useAbility('molt', 'shed') === false);
  // A deterministic real field battle must both activate and settle a rescue.
  fresh(['molt', 'second_wind']); v.health = { [id]: 1 };
  const def = { ...G.data.monsters.find(m => m.id === 'hushwolf'), hp: [5000, 5000], attack: { damage: [100, 100], accuracy: 1 }, speed: 99 };
  const rec = G.fieldFight(id, def, null, { rng: () => 0.5 });
  T.ok('real field fight activates Molt', /\(Molt\)/.test(rec.log.join('\n')) && v.godpathSurvival[id].moltUses === 1);
  const end = rec.vHpLeft; G.settleFieldFight(id, rec, 'monster');
  T.ok('field health settlement uses the actual returned HP', v.health[id] === end && rec.healthSettlement.applied);
  if (end > 0) {
    G.hurtVillager(id, 1, 'test'); const wounded = v.health[id];
    T.ok('replaying the same settlement cannot heal or damage again', G.settleFieldFight(id, rec, 'monster') === false && v.health[id] === wounded);
  } else T.ok('field death remains a real death', !v.roster.includes(id));
  fresh(['second_wind']);
  const other = v.roster.find(x => x !== id && x !== G.villagerId);
  v.health = { [id]: 50, [other]: 70 };
  T.ok('a field receipt cannot be applied to another person', G.settleFieldFight(other, { vTaken: 40, healthSettlement: { who: id, start: 50, end: 10 } }, 'test') === false && v.health[other] === 70);
  for (const scene of ['wild', 'contest']) {
    fresh(['molt', 'second_wind']); v.health = { [id]: 1 };
    const original = G.fieldFight; let played;
    G.fieldFight = function (who, ignored, entity, opts) { played = original.call(this, who, def, entity, { ...opts, rng: () => 0.5 }); return played; };
    try {
      if (scene === 'wild') G.resolveWildMonsterEncounter(id, { id: 'hushwolf', hp: 5000, maxHp: 5000, tx: 4, ty: 4 });
      else G._cxBlood(id, { id: 'pit', variant: 'standard' }, {});
    } finally { G.fieldFight = original; }
    T.ok(scene + ' actual caller preserves returned survivor HP after real Molt', played.vHpLeft > 0 && /\(Molt\)/.test(played.log.join('\n')) && v.health[id] === played.vHpLeft && played.healthSettlement.applied && v.roster.includes(id));
  }
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
