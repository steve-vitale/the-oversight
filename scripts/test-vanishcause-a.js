// test-vanishcause-a.js — proof test for arm sim-vanishcause-a
// (finding #2635: gun-vanish CAUSE). Proves the instrument BEFORE
// any judged sim:
//   (1) the gun-location census finds a searcaster in EVERY location
//       (equipped / carried / stashed / scholar-pack /
//       scholar-equipped / stash / corpse) and counts one gun once
//       (a villager's equipped gun ALSO sits in their items —
//       autoEquip builds equipped entries as copies — so carried
//       counts items MINUS the equipped one);
//   (2) the legacy holder map reproduces the old blind spot (an
//       equipped scholar gun is NOT a holder; a pack gun IS);
//   (3) the code paths the wraps rely on behave as the prereg claims:
//       villagerGearUp seats a carried searcaster (fight-entry
//       seating), Game.equip splices a searcaster OUT of the scholar's
//       inventory (the blind spot), unequip returns it, alienLootGrant
//       lands a searcaster in a person's items, registerDeath puts the
//       gun on the corpse, dropItem removes it from the world;
//   (4) the analyzer's --selftest passes (attribution + judge).
// Live-harness section uses seed 7 via scripts/sim-harness.js
// (Math.random seeded BEFORE eval, per the harness rules).
// Run: node scripts/test-vanishcause-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'vanishcause-driver-a'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-vanishcause-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; failures.push(name); console.log('FAIL: ' + name); }
}
function fakeGame(over) {
  const base = {
    villagerId: 'scholar1',
    data: { villagers: [], items: [
      { id: 'searcaster', weapon: { bonus: 120, type: 'ranged', range: 8, ammo: 'fusion_cell' } },
      { id: 'fusion_cell' },
      { id: 'crude_bow', weapon: { bonus: 18, type: 'ranged', range: 5, ammo: 'arrow' } },
    ] },
    state: { scholar: { inventory: [], equipped: {}, day: 10 }, village: { roster: [] }, corpses: [] },
    stashState: function () { return { materials: {}, weapons: [], armor: [], tools: [], medicine: [] }; },
    corpses: function () { return this.state.corpses; },
  };
  return Object.assign(base, over || {});
}

function pureTests() {
  // (1a) equipped villager: ONE location, count 1 (not 2 — the gun
  // ALSO sits in items as the autoEquip source).
  let g = fakeGame();
  const alice = { id: 'alice', dead: false, items: [{ itemId: 'searcaster', units: 1 }, { itemId: 'fusion_cell', units: 2 }],
    stashed: [], equipped: { ranged: { itemId: 'searcaster', name: 'Searcaster' } } };
  g.data.villagers = [alice];
  g.state.village.roster = ['alice'];
  let loc = driver.gunLocationsOf(g);
  check('census: equipped gun is one location', loc.locations.length === 1 && loc.locations[0].loc === 'equipped' && loc.total === 1);
  check('census: equipped row carries cells', loc.locations[0].cells === 2);
  // (1b) carried (unequipped) villager.
  alice.equipped = { ranged: { itemId: 'crude_bow', name: 'Crude bow' } };
  loc = driver.gunLocationsOf(g);
  check('census: carried gun when another weapon is equipped', loc.locations.length === 1 && loc.locations[0].loc === 'carried' && loc.total === 1);
  // (1c) two guns: one equipped + one carried.
  alice.items.push({ itemId: 'searcaster', units: 1 });
  alice.equipped = { ranged: { itemId: 'searcaster', name: 'Searcaster' } };
  loc = driver.gunLocationsOf(g);
  check('census: two guns = equipped + carried', loc.total === 2 &&
    loc.locations.some(function (l) { return l.loc === 'equipped'; }) &&
    loc.locations.some(function (l) { return l.loc === 'carried'; }));
  // (1d) stashed gun.
  const bob = { id: 'bob', dead: false, items: [], stashed: [{ itemId: 'searcaster', units: 1 }], equipped: {} };
  g.data.villagers = [bob];
  g.state.village.roster = ['bob'];
  loc = driver.gunLocationsOf(g);
  check('census: stashed gun', loc.locations.length === 1 && loc.locations[0].loc === 'stashed');
  // (1e) dead / off-roster villagers are still located (their items
  // persist on the person record — the lendfix probe).
  bob.dead = true;
  g.state.village.roster = [];
  loc = driver.gunLocationsOf(g);
  check('census: dead off-roster holder still located', loc.locations.length === 1 && loc.locations[0].loc === 'stashed');
  check('census: personFlags marks dead + off-roster', loc.personFlags.bob && loc.personFlags.bob.dead === true && loc.personFlags.bob.onRoster === false);
  // (1f) scholar pack vs equipped.
  g = fakeGame();
  g.state.scholar.inventory = [{ itemId: 'searcaster', units: 1 }];
  loc = driver.gunLocationsOf(g);
  check('census: scholar pack gun', loc.locations.length === 1 && loc.locations[0].loc === 'scholar-pack');
  g.state.scholar.inventory = [];
  g.state.scholar.equipped = { ranged: { itemId: 'searcaster', name: 'Searcaster' } };
  loc = driver.gunLocationsOf(g);
  check('census: scholar equipped gun', loc.locations.length === 1 && loc.locations[0].loc === 'scholar-equipped' && loc.locations[0].slot === 'ranged');
  // (1g) communal stash + corpse.
  g = fakeGame();
  g.stashState = function () { return { materials: {}, weapons: [{ itemId: 'searcaster', units: 1 }], armor: [], tools: [], medicine: [] }; };
  g.state.corpses = [{ id: 'c1', villagerId: 'alice', kind: 'villager', buried: true, items: [{ itemId: 'searcaster', units: 1 }] }];
  loc = driver.gunLocationsOf(g);
  check('census: stash + buried-corpse guns both found', loc.total === 2 &&
    loc.locations.some(function (l) { return l.loc === 'stash'; }) &&
    loc.locations.some(function (l) { return l.loc === 'corpse' && l.buried === true; }));
  // (1h) ZERO-UNITS is a taken stack, not a gun: _corpseTakeStack
  // zeroes it.units instead of splicing the entry out (pilot catch,
  // 2026-11-21: seed 107224 ended with a phantom second gun on the
  // corpse the scholar had already looted). A corpse holding only a
  // zeroed searcaster entry holds NO gun; zeroed cells count as 0.
  g = fakeGame();
  g.state.corpses = [{ id: 'c1', villagerId: 'alice', kind: 'villager', buried: false,
    items: [{ itemId: 'searcaster', units: 0 }, { itemId: 'fusion_cell', units: 0 }] }];
  loc = driver.gunLocationsOf(g);
  check('census: zero-units corpse entry is not a gun', loc.total === 0 && loc.locations.length === 0);
  check('census: zero-units cells count as 0', driver.cellCountIn(g.state.corpses[0].items, 'fusion_cell') === 0);
  check('census: missing units still means one', driver.countItemIn([{ itemId: 'searcaster' }], 'searcaster') === 1);
  // (2) legacy holder map: the old blind spot, reproduced.
  g = fakeGame();
  g.state.scholar.inventory = [{ itemId: 'searcaster', units: 1 }];
  g.state.village.roster = ['scholar1'];
  let h = driver.legacyHoldersOf(g);
  check('legacy: pack gun IS a scholar holder', !!h['__scholar__']);
  g.state.scholar.inventory = [];
  g.state.scholar.equipped = { ranged: { itemId: 'searcaster', name: 'Searcaster' } };
  h = driver.legacyHoldersOf(g);
  check('legacy: equipped scholar gun is NOT a holder (blind spot)', !h['__scholar__']);
  // holderKeysOf agrees with the legacy map.
  loc = driver.gunLocationsOf(g);
  check('holderKeysOf: equipped scholar gun yields no holder key', driver.holderKeysOf(loc.locations).length === 0);
  g.state.scholar.equipped = {};
  g.state.scholar.inventory = [{ itemId: 'searcaster', units: 1 }];
  loc = driver.gunLocationsOf(g);
  check('holderKeysOf: pack gun yields __scholar__', JSON.stringify(driver.holderKeysOf(loc.locations)) === JSON.stringify(['__scholar__']));
  // grant caller taxonomy.
  check('classifyGrantCaller: contest prize', driver.classifyGrantCaller('Error\n at foo (_cxItemPrize) (contests.js:1:1)') === 'contest-prize');
  check('classifyGrantCaller: kill loot', driver.classifyGrantCaller('Error\n at foo (corpseForKill) (game.js:1:1)') === 'kill-loot-corpse');
  check('classifyGrantCaller: trade', driver.classifyGrantCaller('Error\n at foo (betrayal.js:1:1)') === 'trade');
  check('classifyGrantCaller: other', driver.classifyGrantCaller('Error\n at foo (something-else.js:1:1)') === 'other');
}

async function liveTests() {
  const { Game } = await loadGame({ seed: 7, mode: 'test-vanishcause-a', fullTelemetry: false });
  await setupGame(Game);
  const st = Game.state || {};
  const roster = ((st.village || {}).roster) || [];
  const scholarVid = Game.villagerId;
  const npcVid = roster.filter(function (id) { return id !== scholarVid; })[0];
  check('live: roster has a non-scholar villager', !!npcVid);
  const person = Game.getPerson(npcVid);
  check('live: getPerson resolves the villager', !!person);
  // (3a) villagerGearUp seats a carried searcaster.
  person.items = person.items || [];
  person.items.push({ itemId: 'searcaster', name: 'Searcaster', units: 1, alienLoot: true });
  person.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 2 });
  try { if (Game.villagerGearUp) Game.villagerGearUp(npcVid, false); } catch (e) { check('live: villagerGearUp runs without throwing', false); }
  const kit = driver.rangedKitOf(Game, person);
  check('live: gearUp seats the carried searcaster', kit.rwId === 'searcaster');
  let loc = driver.gunLocationsOf(Game);
  const eqRows = loc.locations.filter(function (l) { return l.vid === npcVid; });
  check('live: seated gun is one equipped location', eqRows.length === 1 && eqRows[0].loc === 'equipped' && loc.total >= 1);
  // (3b) scholar equip splices the gun OUT of inventory (blind spot).
  const s = st.scholar || {};
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'searcaster', name: 'Searcaster', units: 1, alienLoot: true });
  const idx = s.inventory.findIndex(function (e) { return (e.itemId || e.id) === 'searcaster'; });
  check('live: searcaster in scholar inventory', idx !== -1);
  let ret = null;
  try { ret = Game.equip(idx, 'ranged'); } catch (e) { check('live: Game.equip runs without throwing', false); }
  const inPackAfter = (s.inventory || []).some(function (e) { return (e.itemId || e.id) === 'searcaster'; });
  const equippedNow = ((s.equipped || {}).ranged || {}).itemId === 'searcaster';
  check('live: equip removes the gun from inventory', !inPackAfter);
  check('live: equip seats it in the ranged slot', equippedNow);
  loc = driver.gunLocationsOf(Game);
  check('live: equipped scholar gun is scholar-equipped in the census', loc.locations.some(function (l) { return l.loc === 'scholar-equipped' && l.vid === '__scholar__'; }));
  const h = driver.legacyHoldersOf(Game);
  check('live: equipped scholar gun is NOT a legacy holder', !h['__scholar__']);
  // (3b2) EQUIP DISPLACEMENT: equipping another ranged weapon over
  // the searcaster sends the gun back to the pack with NO unequip
  // call (the policy's dry-weapon gearUp does exactly this — the
  // smoke catch, 2026-11-21).
  s.inventory.push({ itemId: 'crude_bow', name: 'Crude bow', units: 1 });
  const bowIdx = s.inventory.findIndex(function (e) { return (e.itemId || e.id) === 'crude_bow'; });
  check('live: displacement fixture has a bow to equip', bowIdx !== -1);
  try { Game.equip(bowIdx, 'ranged'); } catch (e) { check('live: Game.equip (displacement) runs without throwing', false); }
  const displacedBack = (s.inventory || []).some(function (e) { return (e.itemId || e.id) === 'searcaster'; });
  const bowEquipped = ((s.equipped || {}).ranged || {}).itemId === 'crude_bow';
  check('live: equipping a bow over the searcaster returns it to the pack', displacedBack);
  check('live: the bow is now in the ranged slot', bowEquipped);
  // Re-equip the searcaster for the unequip check below.
  const scIdx2 = s.inventory.findIndex(function (e) { return (e.itemId || e.id) === 'searcaster'; });
  try { Game.equip(scIdx2, 'ranged'); } catch (e) { check('live: Game.equip (re-equip) runs without throwing', false); }
  check('live: searcaster re-equipped', ((s.equipped || {}).ranged || {}).itemId === 'searcaster');
  // (3c) unequip returns it to the pack.
  try { Game.unequip('ranged'); } catch (e) { check('live: Game.unequip runs without throwing', false); }
  const backInPack = (s.inventory || []).some(function (e) { return (e.itemId || e.id) === 'searcaster'; });
  check('live: unequip returns the gun to the pack', backInPack);
  // (3d) alienLootGrant lands a searcaster in a person's items.
  const before = (person.items || []).filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  let granted = null;
  try { granted = Game.alienLootGrant('searcaster', person); } catch (e) { check('live: alienLootGrant runs without throwing', false); }
  const after = (person.items || []).filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  check('live: alienLootGrant adds a searcaster to the person', !!granted && after === before + 1);
  // (3e) registerDeath puts the gun on the corpse.
  const rc = Game.registerDeath({ kind: 'villager', villagerId: npcVid, name: 'Test', mx: 4, my: 4, cause: 'test', killerId: null, items: [{ itemId: 'searcaster', name: 'Searcaster', units: 1 }] });
  check('live: registerDeath returns a corpse id', !!(rc && rc.id));
  const corpses = Game.corpses ? Game.corpses() : [];
  const corpse = corpses.filter(function (c) { return c && c.id === (rc && rc.id); })[0];
  check('live: the corpse holds the searcaster', !!corpse && (corpse.items || []).some(function (e) { return (e.itemId || e.id) === 'searcaster'; }));
  // (3f) dropItem removes the gun from the world.
  const sidx = (s.inventory || []).findIndex(function (e) { return (e.itemId || e.id) === 'searcaster'; });
  if (sidx !== -1) {
    try { Game.dropItem(sidx); } catch (e) { check('live: Game.dropItem runs without throwing', false); }
    const stillThere = (s.inventory || []).some(function (e) { return (e.itemId || e.id) === 'searcaster'; });
    check('live: dropItem removes the gun from inventory (sink)', !stillThere);
  } else {
    check('live: dropItem fixture had a gun to drop', false);
  }
  // (3g) the transfer/loss methods the wraps rely on exist.
  const methods = ['alienLootGrant', '_cxItemPrize', 'villagerKillLoot', '_corpseTakeStack',
    'lootCorpse', 'equip', 'unequip', 'stealFrom', 'dropItem', 'giftArmor',
    'registerDeath', 'removeVillager', 'playerDeath', 'buryCorpse',
    '_lendSearcaster', '_returnLentSearcaster'];
  for (const m of methods) check('live: Game.' + m + ' is a function', typeof Game[m] === 'function');
  const SC = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
  check('live: Scattering.equipment.autoEquip is a function', !!(SC.equipment && typeof SC.equipment.autoEquip === 'function'));
}

(async function () {
  try {
    pureTests();
    await liveTests();
    // (4) the analyzer selftest (attribution + judge).
    let stOk = false;
    try { stOk = analyzer.selftest(); } catch (e) { console.log('analyzer selftest threw: ' + e.message); }
    check('analyzer --selftest passes', stOk === true);
  } catch (e) {
    fail++;
    failures.push('top-level throw: ' + e.message);
    console.log('TOP-LEVEL THROW: ' + (e.stack || e.message));
  }
  console.log('test-vanishcause-a: ' + pass + ' passed, ' + fail + ' failed' + (fail ? ' — ' + failures.join('; ') : ''));
  process.exit(fail === 0 ? 0 : 1);
})();
