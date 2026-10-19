'use strict';

// Prepared state for standing proofs, not a policy or a gameplay shortcut.
// Never override readiness readers, demands, standing, or wave unlocks.
function stripReadiness(Game) {
  const weapon = item => {
    const id = typeof item === 'string' ? item : item?.itemId || item?.id;
    return Game.data.items.some(def => def.id === id && def.weapon);
  };
  const scholar = Game.state.scholar;
  scholar.equipped = {};
  scholar.inventory = scholar.inventory.filter(item => !weapon(item));
  for (const id of Game.state.village.roster) {
    if (id === Game.villagerId) continue;
    const person = Game.vpOf(id);
    if (!person || person.dead) continue;
    person.equipped = {};
    person.items = (person.items || []).filter(item => !weapon(item));
  }
  Game.state.monsterCounters = {};
  Game.state.waveKillLog = [];
  delete Game.state._standingPeakWave;
}

function prepareReadiness(Game, wave) {
  const demand = Game.standingCfg().readyDemand[wave];
  if (!demand) throw new Error('No authored readiness demand for wave ' + wave);
  const living = Game.state.village.roster.filter(id => id === Game.villagerId ||
    (Game.vpOf(id) && !Game.vpOf(id).dead));
  if (living.length < Math.max(demand.armored, demand.armed, demand.veterans))
    throw new Error('Prepared fixture has too few living fighters');
  const armor = Game.data.items.filter(item => item.armor?.protection >= demand.armorP)
    .sort((a, b) => a.armor.protection - b.armor.protection)[0];
  const weapon = Game.data.items.find(item => item.id === 'hunting_spear' && item.weapon);
  const priorMonster = Game.data.monsters.find(monster => monster.wave === wave - 1);
  const counters = ['bulldozer', 'hushwolf', 'voice_mimic_radio', 'mirror_stag'];
  if (!armor || !weapon || !priorMonster || counters.length < demand.tricks ||
      counters.some(id => !Game.data.monsters.some(monster => monster.id === id)))
    throw new Error('Prepared fixture is missing authored gear, monsters or counters');
  for (let i = 0; i < living.length; i++) {
    const owner = living[i] === Game.villagerId ? Game.state.scholar : Game.vpOf(living[i]);
    owner.equipped = owner.equipped || {};
    if (i < demand.armored) owner.equipped.torso = { itemId: armor.id };
    if (i < demand.armed) owner.equipped.melee = { itemId: weapon.id };
  }
  Game.state.monsterCounters = Object.fromEntries(counters.slice(0, demand.tricks).map(id => [id, true]));
  // A prepared kill history for real living people; leave ledger standing and
  // the separate faced-deed feed untouched so tests can vary those independently.
  Game.state.waveKillLog = living.slice(0, demand.veterans).map(by => ({
    d: Game.state.scholar.day - 1, mid: priorMonster.id, w: priorMonster.wave, by, via: 'proof-fixture',
  }));
  return Game.waveCombatReadiness(wave);
}

module.exports = { stripReadiness, prepareReadiness };
