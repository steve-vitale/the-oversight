#!/usr/bin/env node
// test-region-engine-20261014.js — proof for the world-region engine
// (docs/WORLD-REGIONS.md §6-8, §11).
//
//   R1 a FIXTURE region (injected here, never shipped) changes forage species,
//      trees + nuts, bushes, fish, wildlife, predators/parasites, weather +
//      seasons, scavenge, ruins, pantry, village names, common trees
//   R2 the fixture passes validate-regions; a broken copy fails it
//   R3 origin -> region covers all 47 originPicker labels (spot-checked)
//   R4 familiarity tiers: same region local, same climateFamily visitor, else stranger
//   R5 kin placed out of the landing region; fates; deterministic per seed
//      (two child processes, same seed -> same placements)
//   R6 save/load keeps region and world; an old save (no region/world) migrates
//
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const { loadGame, quietLog } = require('./sim-harness');
const { validateRegions, loadData } = require('./validate-regions');

// ---- localStorage stub (save/load in node) ----
function makeStore() {
  const _store = {};
  const api = {
    getItem: (k) => (k in _store ? _store[k] : null),
    setItem: (k, v) => { _store[k] = String(v); },
    removeItem: (k) => { delete _store[k]; },
    key: (i) => Object.keys(_store)[i] || null,
  };
  Object.defineProperty(api, 'length', { get: () => Object.keys(_store).length });
  return api;
}
globalThis.localStorage = makeStore();

const SEED = 20261014;
const FX = 'fx_dry_scrub';

function fixtureBiome() {
  return {
    id: 'fx_scrub', name: 'Fixture scrub', tileTypes: [], hazards: [], weather: [], seasons: {},
    forageTable: { purslane: 5, lambs_quarters: 4, dandelion: 3, plantain_leaf: 3, cattail: 3, sunchoke: 2,
      wild_onion: 2, chickweed: 2, burdock: 2, maypop: 2, elderberry: 2, serviceberry: 2, groundnut: 2,
      goldenrod: 1, yarrow: 1, sassafras: 1 },
  };
}
function fixtureRegion() {
  return {
    id: FX, name: 'Fixture Dry Scrub', continent: 'fixture', climateFamily: 'arid', hemisphere: 'south',
    status: 'playable', biome: 'fx_scrub', originTags: ['fixtureland'], neighbors: ['na_arid'],
    climate: { seasons: [
      { id: 'dry', days: 150, temp: 'hot', weather: { clear: 0.5, heat: 0.5 } },
      { id: 'wet', days: 215, temp: 'warm', weather: { rain: 1 } },
    ] },
    fauna: {
      animals: ['javelina', 'roadrunner', 'gila_monster', 'bison', 'pronghorn', 'prairie_dog', 'nine_banded_armadillo', 'bluegill', 'crayfish'],
      add: ['eastern_coyote'], remove: ['bison'],
      fish: ['bluegill', 'crayfish'], predators: ['eastern_coyote'],
      parasites: { trichinosis: { javelina: 0.5 } }, density: 1,
    },
    flora: {
      trees: [{ id: 'fx_mesquite', roll: 0.5, nut: 'black_walnut' }, { id: 'fx_acacia', roll: 0.5 }, { id: 'fx_palo_verde' }],
      bushes: ['elderberry', 'serviceberry'],
      commonTrees: ['fx_mesquite'],
      bounty: { 'open meadow': ['purslane', 'Fixture bounty.'] },
    },
    people: {
      language: 'spanish',
      ruins: ['FX ruin one: a bus depot.', 'FX ruin two: a clinic.'],
      scavenge: [
        { id: 'fx_rice', name: 'FX rice sack', kcal: 900, kg: 1, text: 'fx' },
        { id: 'fx_tins', name: 'FX tinned fish', kcal: 300, kg: 0.2, text: 'fx' },
        { id: 'fx_flour', name: 'FX flour', kcal: 800, kg: 1, text: 'fx' },
        { id: 'fx_oil', name: 'FX oil', kcal: 1000, kg: 0.5, text: 'fx' },
        { id: 'fx_med_a', name: 'FX antibiotics', kcal: 0, kg: 0.1, rare: true, medType: 'antibiotics', doses: 3, text: 'fx' },
        { id: 'fx_med_b', name: 'FX antiparasitic', kcal: 0, kg: 0.1, rare: true, medType: 'antiparasitic', doses: 3, text: 'fx' },
      ],
      pantry: [{ name: 'FX maize', kcalEach: 300, units: 100, spoilDays: 200, safe: false, kg: 0.5, needsCooking: true, unit: 'scoop' }],
      villageNames: ['FX-Alpha', 'FX-Beta', 'FX-Gamma', 'FX-Delta'],
    },
    landingVariants: ['quarry_edge', 'burn_scar', 'junkyard_edge'],
    lifeseedRegions: ['southwest'],
  };
}

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}
const subset = (arr, allowed) => arr.every(x => allowed.includes(x));

// ---- child mode: print kin placements for a seed (R5 determinism) ----
async function kinChild(seed) {
  const { Game } = await loadGame({ seed });
  await quietLog(async () => {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  });
  const kin = Game.state.world.kin.map(k => [k.owner, k.relation, k.name, k.region, k.fate]);
  process.stdout.write(JSON.stringify({ region: Game.state.region, kin }) + '\n');
  process.exit(0);
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: SEED, mode: 'region-engine-proof' });
  ok(!loadFails.length, 'all modules load', loadFails.join('; '));
  ok(typeof Game.initWorld === 'function', 'world.js loaded (initWorld)');

  // ============ R2 validator (before the fixture touches the game) ============
  console.log('\n[R2] validate-regions: shipped data + fixture pass; a broken fixture fails');
  const data = loadData();
  const shipped = validateRegions(data);
  ok(shipped.errors.length === 0, 'shipped regions.json validates', shipped.errors.slice(0, 3).join(' | '));
  ok(data.regions.length === 20 && data.regions.filter(r => r.status === 'playable').length === 2, '20 regions, 2 playable');
  // origins-world 2026-10-14: a region now also needs >=2 picker origins, a
  // lifeseed sub-area and a name culture (validate-regions origin coverage),
  // so the fixture brings its own — injected into copies, never shipped.
  const fxLabels = ['Fixtureville North, Fixtureland', 'Fixtureville South, Fixtureland'];
  const withFx = Object.assign({}, data, {
    regions: [...data.regions, fixtureRegion()], biomes: [...data.biomes, fixtureBiome()],
    originPicker: Object.assign({}, data.originPicker, { regions: [...data.originPicker.regions,
      { name: 'Fixture', origins: fxLabels.map(label => ({ flag: 'x', label })) }] }),
    characterGen: Object.assign({}, data.characterGen, { originKeywords: Object.assign({}, data.characterGen.originKeywords,
      { fixtureland: ['fixtureland', FX] }) }),
    lifeseeds: Object.assign({}, data.lifeseeds, { regions: [...data.lifeseeds.regions,
      { id: 'fx_home', worldRegion: FX, label: 'the fixture', land: 'scrub', matchTags: ['fixtureland'], origins: fxLabels,
        towns: ['Fxa', 'Fxb', 'Fxc', 'Fxd'], workplaces: ['the mill', 'the shop', 'the depot'] }] }),
    nameCultures: Object.assign({}, data.nameCultures, { originToCulture: Object.assign({}, data.nameCultures.originToCulture,
      { [fxLabels[0]]: 'american', [fxLabels[1]]: 'american' }) }),
  });
  const fxRes = validateRegions(withFx);
  ok(fxRes.errors.length === 0, 'fixture region validates as playable', fxRes.errors.slice(0, 3).join(' | '));
  const broken = fixtureRegion();
  broken.climate.seasons[0].weather = { clear: 0.5, heat: 0.4 };
  broken.climate.seasons[1].days = 100;
  broken.fauna.fish = ['bluegill'];
  const brRes = validateRegions(Object.assign({}, withFx, { regions: [...data.regions, broken] }));
  ok(brRes.errors.some(e => /weather sums/.test(e)), 'broken weather is caught');
  ok(brRes.errors.some(e => /season days/.test(e)), 'broken year length is caught');
  ok(brRes.errors.some(e => /fish \(need/.test(e)), 'too few fish is caught');

  // ============ R3 origin -> region ============
  console.log('\n[R3] every originPicker label resolves to a region');
  const labels = [];
  Game.data.originPicker.regions.forEach(c => c.origins.forEach(o => labels.push(o.label)));
  // 47 -> 69 (origins-world 2026-10-14: every world region has >=2 picker origins)
  ok(labels.length === 69, '69 picker labels', 'got ' + labels.length);
  const unmapped = labels.filter(l => !(Game.parseOrigin(l).regions || []).length);
  ok(unmapped.length === 0, 'all 69 labels map to a region', unmapped.join(', '));
  const untagged = labels.filter(l => !Game.parseOrigin(l).tags.length);
  ok(untagged.length === 0, 'all 69 labels carry tags', untagged.join(', '));
  const expect = {
    'Chicago, Illinois': 'na_eastern_woodlands', 'Portland, Oregon': 'na_boreal_pacific', 'Tucson, Arizona': 'na_arid',
    'Caracas, Venezuela': 'mesoamerica_caribbean', 'La Paz, Bolivia': 'sa_andes', 'Montevideo, Uruguay': 'sa_pampas_patagonia',
    'Oslo, Norway': 'eurasia_taiga', 'rural Ireland': 'eu_temperate', 'Casablanca, Morocco': 'eu_mediterranean',
    'Cairo, Egypt': 'mena_desert', 'Kumasi, Ghana': 'africa_sahel_savanna', 'Addis Ababa, Ethiopia': 'africa_sahel_savanna',
    'Dhaka, Bangladesh': 'south_asia', 'Seoul, South Korea': 'east_asia', 'Hanoi, Vietnam': 'southeast_asia',
    'Wellington, New Zealand': 'oceania', 'Sydney, Australia': 'oceania',
  };
  for (const [l, r] of Object.entries(expect)) ok(Game.parseOrigin(l).regions[0] === r, `${l} -> ${r}`, String(Game.parseOrigin(l).regions));

  // ============ R4 familiarity ============
  console.log('\n[R4] familiarity: origin region vs landing region');
  const tier = (l, land) => Game.familiarityTier(Game.parseOrigin(l).tags, land);
  ok(tier('Columbus, Ohio', 'na_eastern_woodlands') === 'local', 'Columbus in the eastern woodlands: local');
  ok(tier('rural Vermont', 'na_eastern_woodlands') === 'local', 'Vermont in the eastern woodlands: local');
  // origins-world 2026-10-14: the finer ladder puts bordering regions (regions.json
  // neighbors) above same-climate visitors. Portland's region borders the woodlands.
  ok(tier('Portland, Oregon', 'na_eastern_woodlands') === 'neighbor', 'Portland in the eastern woodlands: neighbor (bordering region)');
  ok(tier('Berlin, Germany', 'na_eastern_woodlands') === 'visitor', 'Berlin in the eastern woodlands: visitor');
  ok(tier('Lagos, Nigeria', 'na_eastern_woodlands') === 'stranger', 'Lagos in the eastern woodlands: stranger');
  ok(tier('Berlin, Germany', 'eu_temperate') === 'local', 'Berlin in temperate Europe: local');
  ok(tier('Cairo, Egypt', 'na_arid') === 'visitor', 'Cairo in the US drylands: visitor (arid family)');
  ok(tier('Atlantis', 'na_eastern_woodlands') === 'stranger', 'an origin no region claims: stranger');

  // ============ R1 the fixture region drives the environment ============
  console.log('\n[R1] a fixture region changes the environment');
  Game.data.biomes.push(fixtureBiome());
  Game.data.regions.push(fixtureRegion());
  const fx = fixtureRegion();
  Game.debugRegion = FX;
  await quietLog(async () => {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  });
  const st = Game.state;
  ok(st.region === FX, 'debugRegion lands the run in the fixture', st.region);
  ok(fx.landingVariants.includes(st.startLocation), 'landing variant comes from the region', st.startLocation);
  ok(Game.biome().id === 'fx_scrub', 'Game.biome() is the region biome');
  const table = Object.keys(fixtureBiome().forageTable);
  const rolls = [];
  for (let i = 0; i < 300; i++) rolls.push(Game.rollWildSpecies({}));
  ok(subset(rolls, table), 'wild forage species come from the region forage table');
  ok(!rolls.includes('acorn_white_oak') && !rolls.includes('muscadine'), 'no eastern-woodland forage');
  // detail grids: trees, bushes, plant cells
  const trees = new Set(), bushes = new Set(), plants = new Set();
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    let d = null;
    try { d = Game.genDetail(x, y); } catch (e) { console.warn('genDetail ' + x + ',' + y + ': ' + e.message); }
    const t = Game.tileAt(x, y);
    for (const m of Object.values(t.modifiers || {})) if (m && m.species) trees.add(m.species);
    for (const b of Object.values(t.bushSpecies || {})) bushes.add(b);
    for (const p of Object.values(t.plantSpecies || {})) plants.add(p);
    void d;
  }
  ok(trees.size > 0 && subset([...trees], ['fx_mesquite', 'fx_acacia', 'fx_palo_verde']), 'detail trees are the region trees', [...trees].join(','));
  ok(bushes.size > 0 && subset([...bushes], fx.flora.bushes), 'detail bushes are the region bushes', [...bushes].join(','));
  ok(plants.size > 0 && subset([...plants], table), 'detail plant cells are the region forage', [...plants].join(','));
  ok(Game.regionTreeNut('fx_mesquite') === 'black_walnut' && Game.regionTreeNut('fx_acacia') === null, 'tree nuts come from flora.trees');
  ok(Game.cellPlantSpecies({ modifiers: { '1,1': { species: 'fx_mesquite' } } }, 1, 1, 'tree') === 'black_walnut', 'cellPlantSpecies reads the region nut');
  const bush = Game.cellPlantSpecies({}, 2, 2, 'bush');
  ok(fx.flora.bushes.includes(bush), 'a fresh bush cell is a region bush', bush);
  ok(st.codex.trees.fx_mesquite && !st.codex.trees.oak, 'common trees known at start are the region ones');
  // wildlife + fish
  const pool = ['javelina', 'roadrunner', 'gila_monster', 'pronghorn', 'prairie_dog', 'nine_banded_armadillo', 'bluegill', 'crayfish', 'eastern_coyote'];
  const seen = new Set();
  let waterFish = 0, waterTiles = 0;
  for (const row of Game.map.tiles) for (const t of row) {
    for (const sid of Object.keys(t.wildlife || {})) seen.add(sid);
    if (['creek', 'wetland'].includes(t.type)) { waterTiles++; if (fx.fauna.fish.some(f => (t.wildlife || {})[f])) waterFish++; }
  }
  ok(seen.size > 0 && subset([...seen], pool), 'map wildlife comes from the region pool', [...seen].join(','));
  ok(!seen.has('bison'), 'fauna.remove keeps bison off the map');
  ok(waterTiles === 0 || waterFish === waterTiles, 'every water tile holds a region fish', `${waterFish}/${waterTiles}`);
  let coyote = 0;
  for (let i = 0; i < 400; i++) if (Game.initTileWildlife('meadow', Game.mulberry32(i + 1)).eastern_coyote) coyote++;
  ok(coyote > 0, 'fauna.add puts the coyote in the pool');
  ok(JSON.stringify(Game.regionFish()) === JSON.stringify(['bluegill', 'crayfish']), 'regionFish is the region list');
  ok(Game.isRegionPredator('eastern_coyote') && !Game.isRegionPredator('black_bear'), 'the region predator replaces the bear');
  const pr = Game.regionParasiteRisk('javelina');
  ok(pr && pr.id === 'trichinosis' && pr.p === 0.5 && !Game.regionParasiteRisk('black_bear'), 'parasite hosts come from the region');
  // people layer
  const ruinT = Game.map.tiles.flat().find(t => t.type === 'ruin');
  ok(ruinT && fx.people.ruins.includes(ruinT.ruinStory), 'the ruin tells a region story');
  const fxIds = fx.people.scavenge.map(s => s.id);
  ok(ruinT && ruinT.loot.length > 0 && subset(ruinT.loot, fxIds), 'ruin loot comes from the region scavenge pool', ruinT && ruinT.loot.join(','));
  ok(Game.scavengeItem('fx_rice').name === 'FX rice sack' && Game.scavengeItem('can_beans').name === 'Canned beans', 'scavengeItem resolves this region and old-save ids');
  ok(st.village.pantry.length === 1 && st.village.pantry[0].name === 'FX maize' && st.village.pantry[0].spoilDay === 1 + 200, 'starting pantry is the region pantry (spoilDays -> spoilDay)');
  const vnames = (st.otherVillages || []).map(v => v.name);
  ok(vnames.length > 0 && subset(vnames, fx.people.villageNames), 'other villages carry region names', vnames.join(','));
  ok(JSON.stringify(Game.regionFlora().bounty) === JSON.stringify(fx.flora.bounty), 'bounty table is the region table');
  // climate: southern hemisphere, two seasons
  ok(Game.season(1).id === 'wet' && Game.season(1).hemisphere === 'south', 'southern hemisphere: day 1 is half a year on (wet)');
  ok(Game.season(1 + 183).id === 'dry', 'half a year later it is the dry season');
  ok(Game.rollWeather(0.2, 200) === 'clear' && Game.rollWeather(0.7, 200) === 'heat', 'dry-season table: clear .5 / heat .5');
  ok(Game.rollWeather(0.99, 1) === 'rain', 'wet-season table: rain');
  // endDay uses it: run a few real days
  const weathers = new Set();
  await quietLog(async () => {
    try { Game.depart(); } catch (e) { console.warn('depart: ' + e.message); }
    for (let d = 0; d < 6; d++) {
      try { Game.endDay(); } catch (e) { console.warn('endDay: ' + e.message); }
      if (Game.state && Game.state.weather) weathers.add(Game.state.weather);
    }
  });
  ok(weathers.size > 0 && subset([...weathers], ['clear', 'heat', 'rain']), 'endDay weather comes from the region season table', [...weathers].join(','));
  ok(!weathers.has('cold'), 'no eastern-woodland cold snap in the fixture');

  // ============ R5 kin ============
  console.log('\n[R5] kin scattered across the world');
  const kin = Game.state.world.kin;
  ok(kin.length >= 3, 'kin placed for the roster', 'n=' + kin.length);
  ok(kin.every(k => k.region !== Game.state.region), 'no kin in the landing region');
  ok(kin.filter(k => k.fate === 'scattered').every(k => Game.regionDef(k.region)), 'every scattered kin region exists');
  ok(kin.filter(k => k.fate === 'taken').every(k => k.region === null), 'the Taken are off-world (region null, KIN.md)');
  ok(kin.every(k => k.fate === 'scattered' || k.fate === 'taken'), 'fates are scattered|taken');
  const pk = Game.worldKin();
  ok(pk.length > 0 && pk.every(k => k.owner === Game.villagerId), 'worldKin() = the player\'s kin');
  const vp = Game.vpOf(Game.villagerId);
  const takenNames = (Game.takenKinOf(Game.villagerId) || []).map(p => p.name);
  ok(pk.filter(k => k.fate === 'taken').every(k => takenNames.includes(k.name)), 'taken fate matches lifeseed takenKinOf');
  ok(((vp.lifeseed || {}).people || []).filter(p => !/\bburied\b|\bdied\b/i.test(p.fate || '')).length === pk.length, 'every living lifeseed person is placed once');
  const w = Game.state.world.regions;
  ok(w[FX].known && w[FX].visited, 'landing region known + visited');
  ok(w.na_eastern_woodlands.known, 'the player\'s origin region (Columbus) is known');
  ok(Game.worldRegions().length === 21 && Game.worldRegions().every(r => typeof r.known === 'boolean'), 'worldRegions lists every region');
  const target = Game.worldRegions().find(r => !r.known && r.id !== FX);
  ok(Game.hearOfRegion(target.id, 'rumor') === true && Game.hearOfRegion(target.id, 'rumor') === false && w[target.id].known, 'hearOfRegion marks a region known once');
  // keepsake clue names the region only once known
  st.keepsakeThread = { clues: [{ kind: 'place', itemId: 'x', kinName: 'K', relation: 'mother', region: 'oceania', text: 'clue.' }] };
  w.oceania.known = false;
  ok(!Game.keepsakeClues()[0].regionName, 'a keepsake clue hides an unknown region');
  Game.hearOfRegion('oceania', 'keepsake');
  ok(Game.keepsakeClues()[0].regionName === 'Oceania', 'once known, the clue names the region');
  const tele = (Game.state.telemetry || []).find(e => e.type === 'region_start');
  ok(tele && tele.region === FX && tele.landing === st.startLocation, 'region_start telemetry names region + landing');
  // determinism across processes
  const runChild = () => {
    const r = spawnSync(process.execPath, [__filename, '--kin-child', '7'], { encoding: 'utf8', timeout: 60000 });
    return (r.stdout || '').trim().split('\n').pop();
  };
  const a = runChild(), b = runChild();
  ok(a && a === b, 'same seed -> identical kin placement (two processes)');
  try {
    const ka = JSON.parse(a);
    ok(ka.region === 'na_eastern_woodlands' && ka.kin.every(k => k[3] !== 'na_eastern_woodlands'), 'eastern-woodlands run: kin all elsewhere');
  } catch (e) { ok(false, 'child output parses', e.message + ' :: ' + String(a).slice(0, 200)); }

  // ============ R6 save/load ============
  console.log('\n[R6] save/load keeps region + world; old saves migrate');
  Game.over = false;
  const kinBefore = JSON.stringify(Game.state.world.kin);
  const saved = Game.save();
  const saves = globalThis.Scattering.state.listSaves();
  ok(saved !== false && saves.length > 0, 'save written');
  const key = saves[0].key;
  ok(Game.load(key) === true, 'Continue loads');
  ok(Game.state.region === FX, 'region survives save/load');
  ok(JSON.stringify(Game.state.world.kin) === kinBefore, 'world kin survives save/load');
  ok(Game.state.world.regions.oceania.known === true, 'known regions survive save/load');
  // old save: strip region + world, re-save raw, load
  const raw = JSON.parse(localStorage.getItem(key));
  const oldState = raw && raw.state ? raw.state : raw;
  delete oldState.region; delete oldState.world;
  localStorage.setItem(key, JSON.stringify(raw));
  ok(Game.load(key) === true, 'an old save (no region, no world) loads');
  ok(Game.state.region === 'na_eastern_woodlands', 'old save migrates to na_eastern_woodlands');
  ok(Game.state.world && Object.keys(Game.state.world.regions).length === 21 && Game.state.world.regions.na_eastern_woodlands.visited, 'old save gets a world registry');
  ok(Game.state.world.kin.length > 0 && Game.state.world.kin.every(k => k.region !== 'na_eastern_woodlands'), 'old save kin placed outside its region');

  console.log(`\nregion-engine: ${pass} passed, ${fail} failed`);
  if (fail) { console.log('FAILED: ' + failures.join(' | ')); process.exit(1); }
  process.exit(0);
}

if (process.argv[2] === '--kin-child') kinChild(Number(process.argv[3]) || 7).catch(e => { console.error(e.stack); process.exit(1); });
else main().catch(e => { console.error(e.stack); process.exit(1); });
