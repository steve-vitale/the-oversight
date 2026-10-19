'use strict';
const K = require('./lib'), T = K.reporter('alien-party-readiness');
(async () => {
  const G = await K.load({ seed: Number(process.env.TEST_SEED||36) }), E = globalThis.Scattering.equipment;
  function scene(kind = 'alien', hp = 77, equipped = {}, abilities = []) {
    G.tbfight = null;
    K.newRun(G); G.state.systemArrived = true;
    const v = G.state.village, id = v.roster.find(x => x !== G.villagerId);
    G.ensureVillagerPositions();
    for (const who of v.roster) v.positions[who] = { mx: 8, my: 8 };
    v.positions[id] = { mx: 2, my: 3 };
    v.health = v.health || {}; v.health[id] = hp;
    const person = G.vpOf(id); person.equipped = equipped;
    v.npcAbilities = { [id]: abilities }; v.npcKnacks = {}; v.npcSynergies = {};
    G.npcNeeds(id).hunger = 20;
    G.state.scholar.mx = 2; G.state.scholar.my = 4;
    const advance = G.tbAdvance; G.tbAdvance = () => {};
    try {
      if (kind === 'alien') G.apStartEncounter(G.data.alienPlayers[0].id);
      else { G.state.scholar.monster = { id: 'hushwolf', mx: 3, my: 3 }; G.startCombat('hushwolf'); }
    } finally { G.tbAdvance = advance; }
    const ally = G.tbfight.fighters.find(x => x.villagerId === id);
    const foe = G.tbfight.fighters.find(x => x.kind === 'monster' || x.kind === 'hostile');
    return { id, v, person, ally, foe };
  }
  const gear = { melee: { itemId: 'hunting_spear' }, torso: { itemId: 'leather_jacket' } };
  let c = scene('monster', 77, gear);
  const ordinary = [c.ally.hp, c.ally.maxHp, c.ally.wbonus, c.ally.varmor];
  c = scene('alien', 77, gear);
  T.ok('actual alien and monster builders carry the same wounded body and equipment', JSON.stringify([c.ally.hp, c.ally.maxHp, c.ally.wbonus, c.ally.varmor]) === JSON.stringify(ordinary));
  T.ok('wounds are not healed on entry and ordinary adult capacity remains 100', c.ally.hp === 77 && c.ally.maxHp === 100);
  T.ok('weapon and armor snapshots equal the actual worn item calculations', c.ally.wbonus === E.weaponBonusOf(c.person, G.data.items) && c.ally.wbonus > 0 && c.ally.varmor === E.armorOf(c.person, G.data.items) && c.ally.varmor > 0);
  c = scene('alien', 9);
  T.ok('a critically wounded companion enters with nine HP', c.ally.hp === 9);
  c = scene('alien', 100);
  const bare = G.tbDamage(c.ally.key, 20, 'prepared physical hit', c.foe.key, { undodgeable: true });
  c = scene('alien', 100, gear);
  const armored = G.tbDamage(c.ally.key, 20, 'prepared physical hit', c.foe.key, { undodgeable: true });
  T.ok('carried armor reduces actual incoming physical damage', armored > 0 && armored < bare, `${armored} vs ${bare}`);
  c = scene('alien', 100, gear);
  c.ally.ai = 'brave'; c.foe.mx = 3; c.foe.my = 3; c.foe.hp = c.foe.maxHp = 100;
  G.tbVillagerTurn(c.ally);
  T.ok('the actual equipped companion strike lands its weapon-powered damage', c.ally._dealt > 8, c.ally._dealt);
  function beam(equipped) {
    const c = scene('alien', 100, equipped), random = Math.random;
    Math.random = () => 0.5;
    try { return { damage: G.apBeamHit(c.ally.key, 0, 'prepared beam', { sourceKey: c.foe.key }), hp: c.ally.hp, pieces: G.apBeamResistPieces(c.person).length }; }
    finally { Math.random = random; }
  }
  const b = beam({}), resistant = beam({ head: { itemId: 'alien_helm' }, torso: { itemId: 'alien_carapace' }, legs: { itemId: 'alien_greaves' }, hands: { itemId: 'alien_gauntlets' }, shoes: { itemId: 'alien_boots' } });
  T.ok('unprotected companion takes the current declared full-HP central beam hit', b.damage === 100 && b.hp === 0, JSON.stringify(b));
  T.ok('actual resistant gear protects the targeted companion against beams', resistant.pieces === 5 && resistant.damage === 17 && resistant.hp === 83, JSON.stringify(resistant));
  c = scene('alien', 77);
  G.tbDamage(c.ally.key, 20, 'prepared injury', c.foe.key, { undodgeable: true });
  const survivor = c.ally.hp;
  G.tbEnd('fled');
  T.ok('real surviving wounds settle to the same world body after escape', c.v.health[c.id] === survivor && survivor === 57, `${c.v.health[c.id]} vs ${survivor}`);
  c = scene('alien', 77, gear, ['molt']);
  G.tbDamage(c.ally.key, 999, 'prepared fatal hit', c.foe.key, { undodgeable: true });
  T.ok('actual Molt restores the real body capacity and pays its gear loss', c.ally.alive && c.ally.hp === 100 && Object.keys(c.person.equipped).length === 0 && c.ally.wbonus === 0 && c.ally.varmor === 0);
  G.tbEnd('fled');
  T.ok('the rescued body persists with its actual restored health', c.v.health[c.id] === 100 && c.v.godpathDeeds[c.id]?.death_refused?.ability === 'molt');
  c = scene('alien', 77, {}, ['second_wind']);
  G.tbDamage(c.ally.key, 999, 'prepared fatal hit', c.foe.key, { undodgeable: true });
  const alive = c.ally.alive && c.ally.hp === 1;
  c.ally.fled = true;
  G.tbEnd('fled');
  T.ok('a retreating Second Wind survivor keeps its actual one HP in the world', alive && c.v.health[c.id] === 1 && c.v.roster.includes(c.id));
  for (const result of ['won', 'calmed', 'routed']) {
    c = scene('monster', 77);
    G.tbDamage(c.ally.key, 20, 'prepared injury', c.foe.key, { undodgeable: true });
    G.tbEnd(result);
    T.ok(result + ' also persists actual ordinary-party wounds', c.v.health[c.id] === 57);
  }
  c = scene('alien', 77);
  const absent = c.v.roster.find(id => id !== c.id && id !== G.villagerId), bearer = G.villagerId;
  c.v.health[absent] = 88; c.v.health[bearer] = 12;
  c.ally.hp = 57;
  const f = G.tbfight;
  f.fighters.push({ ...c.ally, key: 'duplicate', hp: 3 }, { ...c.ally, key: 'summon', kind: 'ally', villagerId: absent, hp: 6 }, { ...c.ally, key: 'unknown', villagerId: 'no-such-person', hp: 13 }, { ...c.ally, key: 'bearer-alias', villagerId: bearer, hp: 5 });
  G.tbEnd('fled');
  T.ok('settlement deduplicates real people and excludes summons, unknown IDs and bearer aliases', c.v.health[c.id] === 57 && c.v.health[absent] === 88 && c.v.health[bearer] === 12 && !Object.hasOwn(c.v.health, 'no-such-person'));
  c.v.health[c.id] = 70;
  G.tbfight = f; G.tbEnd('fled');
  T.ok('replaying a settled fight cannot erase later world healing', c.v.health[c.id] === 70);
  c = scene('alien', 77);
  G.tbDamage(c.ally.key, 999, 'prepared fatal hit', c.foe.key, { undodgeable: true });
  G.tbEnd('fled');
  T.ok('actual companion death settles zero HP without restoring the person', c.v.health[c.id] === 0 && !c.v.roster.includes(c.id));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
