#!/usr/bin/env node
// test-origins-world-20261014.js — origins <-> world regions in sync.
//
// Steve 2026-10-14: "the local visitor map looks okay just maybe not granular
// enough or synced to our available starting options. Flesh out where it
// needs to be to make sense, either with starting characters or new
// locations to originate." / trim the eastern woodlands to eastern species.
//
//   W1 every world region has >=2 picker origins; every picker label names
//      exactly one region (no ties); validate-regions is clean
//   W2 every picker origin has a name culture and a lifeseed sub-area in its
//      own world region; a generated character's hometown comes from it
//   W3 deliberate mappings: São Paulo off the Amazon, Houston Gulf Coast,
//      Istanbul Mediterranean, Iquitos Amazon (not Quito's Andes)
//   W4 starting NPCs draw region-first (one draw): every region shows up
//   W5 familiarity ladder native > local > neighbor > visitor > stranger,
//      effects read from characterGen.familiarity (plants, levels, animals)
//   W6 eastern woodlands fauna: eastern species only, landing variants add
//      their own (alligator in the slough, moose in the alder marsh), no
//      western animal wanders back in, trichinosis is regional data
//   W7 names: feminine Slavic surnames, culture-listed genders
//   W8 background survivors speak their home's language
//
// Uses scripts/godpath/lib.js (sim-harness underneath). Writes nothing.
'use strict';
const K = require('./godpath/lib');
const { validateRegions, loadData } = require('./validate-regions');
const T = K.reporter('test-origins-world-20261014');

function pickerLabels(Game) {
  const out = [];
  Game.data.originPicker.regions.forEach(c => c.origins.forEach(o => out.push(o.label)));
  return out;
}

(async () => {
  const Game = await K.load({ seed: 20261014 });
  const regions = Game.data.regions;
  const regionIds = new Set(regions.map(r => r.id));
  const labels = pickerLabels(Game);

  T.section('W1 every region has >=2 picker origins; one region per label');
  const res = validateRegions(loadData());
  T.ok('validate-regions: 0 errors', res.errors.length === 0, res.errors.slice(0, 4).join(' | '));
  const byRegion = {};
  let named1 = 0;
  for (const l of labels) {
    const p = Game.parseOrigin(l);
    const ids = p.tags.filter(t => regionIds.has(t));
    if (ids.length === 1 && p.regions[0] === ids[0]) named1++;
    (byRegion[p.regions[0]] = byRegion[p.regions[0]] || []).push(l);
  }
  T.ok(`all ${labels.length} labels name exactly one region and resolve to it`, named1 === labels.length, `${named1}/${labels.length}`);
  const thin = regions.filter(r => (byRegion[r.id] || []).length < 2).map(r => r.id);
  T.ok('all 20 regions have >=2 picker origins', regions.length === 20 && !thin.length, thin.join(', '));
  T.ok('regions that had none now have some (plains, Congo, southern Africa, central Asia)',
    ['na_plains', 'africa_congo', 'africa_southern', 'central_asia_highlands'].every(r => (byRegion[r] || []).length >= 2));
  T.ok('east Asia includes China', (byRegion.east_asia || []).some(l => /China/.test(l)));

  T.section('W2 cultures + lifeseeds come from the origin\'s own region');
  const ls = Game.data.lifeseeds.regions;
  let cultured = 0, subOk = 0, townOk = 0;
  const badTown = [];
  for (const l of labels) {
    const p = Game.parseOrigin(l);
    if (Game.cultureForOrigin(l)) cultured++;
    const sub = Game.lifeseedRegion({ originTags: p.tags, homeRegion: l });
    if (sub && sub.worldRegion === p.regions[0]) subOk++;
    const ch = Game.genCharacter({ origin: l, forceCultureMatch: true, candidate: true, usedNames: new Set(), usedOccs: new Set() });
    const seed = ch.lifeseed || {};
    const mine = ls.find(r => r.id === seed.regionId) || {};
    if (mine.worldRegion === p.regions[0] && (mine.towns || []).includes(seed.hometown)) townOk++;
    else badTown.push(`${l}: ${seed.regionId}/${seed.hometown}`);
  }
  T.ok('every picker origin has a name culture', cultured === labels.length, `${cultured}/${labels.length}`);
  T.ok('every picker origin\'s lifeseed sub-area is in its world region', subOk === labels.length, `${subOk}/${labels.length}`);
  T.ok('generated hometowns come from that sub-area', townOk === labels.length, badTown.slice(0, 4).join(' | '));
  T.ok('far_away stays only as the last resort', Game.lifeseedRegion({ originTags: [], homeRegion: 'Atlantis' }).id === 'far_away'
    && labels.every(l => Game.lifeseedRegion({ originTags: Game.parseOrigin(l).tags, homeRegion: l }).id !== 'far_away'));
  T.ok('a lifeseed sub-area exists for every world region', regions.every(r => ls.some(x => x.worldRegion === r.id)));
  // heritage lines ("their parents came from Enugu") name originToCulture
  // cities; a sub-area town with that name reads as a region contradiction
  // in someone else's story (test-background-audit C9).
  const heritageCities = new Set(Object.entries(Game.data.nameCultures.originToCulture)
    .filter(([, c]) => c !== 'american').map(([l]) => l.split(',')[0].trim().toLowerCase()));
  const clash = [];
  for (const x of ls) for (const t of (x.towns || [])) if (heritageCities.has(String(t).toLowerCase())) clash.push(`${x.id}:${t}`);
  T.ok('no sub-area town doubles as a heritage city', !clash.length, clash.join(', '));

  T.section('W3 deliberate mappings');
  const reg = l => Game.parseOrigin(l).regions[0];
  T.ok('São Paulo is not the Amazon (pampas/south-east)', reg('São Paulo, Brazil') === 'sa_pampas_patagonia', reg('São Paulo, Brazil'));
  T.ok('Manaus is the Amazon', reg('Manaus, Brazil') === 'sa_amazon');
  T.ok('Iquitos is the Amazon, not Quito\'s Andes', reg('Iquitos, Peru') === 'sa_amazon', reg('Iquitos, Peru'));
  T.ok('Houston is the eastern woodlands (Gulf Coast), no tie', reg('Houston, Texas') === 'na_eastern_woodlands'
    && Game.lifeseedRegion({ originTags: Game.parseOrigin('Houston, Texas').tags, homeRegion: 'Houston, Texas' }).id === 'gulf_coast');
  T.ok('Istanbul is the Mediterranean, no tie', reg('Istanbul, Turkey') === 'eu_mediterranean');
  T.ok('Brooklyn has its own sub-area (was far_away)', Game.lifeseedRegion({ originTags: Game.parseOrigin('Brooklyn, New York').tags, homeRegion: 'Brooklyn, New York' }).id === 'new_york_metro');

  T.section('W4 starting NPCs span the world');
  const seen = {};
  for (let i = 0; i < 3000; i++) { const r = reg(Game.npcOriginPick()); seen[r] = (seen[r] || 0) + 1; }
  T.ok('npcOriginPick reaches all 20 regions', regions.every(r => seen[r.id] > 0), JSON.stringify(seen));
  const maxShare = Math.max(...Object.values(seen)) / 3000;
  T.ok('no region dominates (region-first draw, max share < 8%)', maxShare < 0.08, maxShare.toFixed(3));
  T.ok('sampleOrigins lists every picker city', labels.every(l => Game.data.characterGen.sampleOrigins.includes(l)));
  const npcRegions = new Set();
  for (let i = 0; i < 12; i++) {
    Game.genRoster('Columbus, Ohio');
    for (const c of Game.generatedRoster.slice(4)) npcRegions.add(reg(c.homeRegion));
  }
  T.ok('12 rosters\' NPCs come from >= 8 regions (called from genRoster)', npcRegions.size >= 8, [...npcRegions].join(','));

  T.section('W5 familiarity ladder');
  const start = (place, loc) => {
    Game.genRoster(place);
    Game.newGame(place, loc, Game.generatedRoster[0].id);
    return Game.state.scholar.famTier;
  };
  const famData = Game.data.characterGen.familiarity;
  T.ok('five tiers in data, best first', JSON.stringify(famData.order) === JSON.stringify(['native', 'local', 'neighbor', 'visitor', 'stranger']));
  const cases = [
    ['New Orleans, Louisiana', 'cypress_slough', 'native'],
    ['New Orleans, Louisiana', 'hay_field', 'local'],
    ['Chicago, Illinois', 'hay_field', 'native'],
    ['Omaha, Nebraska', 'creek_bottom', 'neighbor'],
    ['Portland, Oregon', 'creek_bottom', 'neighbor'],
    ['Berlin, Germany', 'creek_bottom', 'visitor'],
    ['Tokyo, Japan', 'creek_bottom', 'visitor'],
    ['Lagos, Nigeria', 'creek_bottom', 'stranger'],
    ['Tucson, Arizona', 'creek_bottom', 'stranger'],
  ];
  for (const [place, loc, want] of cases) {
    const got = start(place, loc);
    T.ok(`${place} landing at ${loc}: ${want}`, got === want, got);
    const def = Game.familiarityTierDef(got);
    const fam = (Game.state.village.familiar || {})[Game.villagerId] || [];
    T.ok(`  ...knows ${def.plants} plants (data)`, fam.length === def.plants, String(fam.length));
    const lv = Object.values(Game.state.codex.plants).map(e => e.level);
    T.ok(`  ...at codex level ${def.plantLevel}`, lv.length > 0 && lv.every(x => x === def.plantLevel), lv.join(','));
  }
  // native: alligator by name (slough pool) + home game depth; stranger: not the bear
  start('New Orleans, Louisiana', 'cypress_slough');
  T.ok('native in the slough names the alligator (pool mode)', Game.canShow('animal', 'american_alligator', 'name'));
  T.ok('native knows the deer to codex depth 1', ((Game.state.codex.animals || {}).white_tailed_deer || {}).level === 1);
  start('Lagos, Nigeria', 'cypress_slough');
  T.ok('a stranger does not name the alligator', !Game.canShow('animal', 'american_alligator', 'name'));
  T.ok('a stranger has no home game depth', !((Game.state.codex.animals || {}).white_tailed_deer));
  start('Chicago, Illinois', 'creek_bottom');
  T.ok('a local names the black bear (pool mode; continent mode did not)', Game.canShow('animal', 'black_bear', 'name'));
  const keep = famData.tiers.local.plants;
  famData.tiers.local.plants = 5;
  T.ok('tier effects are data (local plants edited to 5 -> 5)', Game.familiarityTierDef('local').plants === 5);
  famData.tiers.local.plants = keep;
  T.ok('explicit landing region stops at local (native needs this landing)',
    Game.familiarityTier(Game.parseOrigin('Chicago, Illinois').tags, 'na_eastern_woodlands', 'Chicago, Illinois') === 'local');

  T.section('W6 eastern woodlands fauna');
  const east = regions.find(r => r.id === 'na_eastern_woodlands').fauna;
  const WEST = ['bison', 'pronghorn', 'prairie_dog', 'javelina', 'roadrunner', 'gila_monster', 'roosevelt_elk', 'spotted_owl', 'moose', 'snowshoe_hare', 'american_alligator', 'nutria', 'florida_panther', 'burmese_python'];
  T.ok('base list holds no western/plains/Florida-only animal', WEST.every(a => !east.animals.includes(a)));
  T.ok('cottontail and deer stay (hunter ecology)', east.animals.includes('cottontail_rabbit') && east.animals.includes('white_tailed_deer'));
  T.ok('moved animals live in their regions', ['bison', 'pronghorn', 'prairie_dog'].every(a => regions.find(r => r.id === 'na_plains').fauna.animals.includes(a))
    && ['javelina', 'roadrunner', 'gila_monster'].every(a => regions.find(r => r.id === 'na_arid').fauna.animals.includes(a))
    && ['roosevelt_elk', 'moose', 'snowshoe_hare'].every(a => regions.find(r => r.id === 'na_boreal_pacific').fauna.animals.includes(a)));
  const spawned = {};
  const landings = ['creek_bottom', 'hay_field', 'cypress_slough', 'alder_marsh', 'pine_flat', 'old_suburb'];
  for (const loc of landings) {
    start('Columbus, Ohio', loc);
    Game.depart();
    for (let d = 0; d < 40; d++) { try { Game.simEcology && Game.simEcology(); } catch (e) { console.log('simEcology threw: ' + e.message); break; } }
    const set = spawned[loc] = new Set();
    for (const row of Game.map.tiles) for (const t of row) for (const id of Object.keys(t.wildlife || {})) set.add(id);
  }
  const allSeen = new Set([].concat(...Object.values(spawned).map(s => [...s])));
  const westSeen = ['bison', 'pronghorn', 'prairie_dog', 'javelina', 'roadrunner', 'gila_monster', 'roosevelt_elk', 'spotted_owl', 'florida_panther', 'burmese_python'].filter(a => allSeen.has(a));
  T.ok('6 landings x 40 days of ecology: no western animal spawns or wanders in', westSeen.length === 0, westSeen.join(','));
  const noVariant = ['creek_bottom', 'hay_field', 'pine_flat', 'old_suburb'];
  T.ok('no alligator outside the swamp variants', noVariant.every(l => !spawned[l].has('american_alligator')));
  start('Columbus, Ohio', 'cypress_slough');
  T.ok('the cypress slough pool adds the alligator', Game.regionAnimalPool().has('american_alligator'));
  start('Columbus, Ohio', 'alder_marsh');
  T.ok('the alder marsh pool adds moose', Game.regionAnimalPool().has('moose') && !Game.regionAnimalPool().has('american_alligator'));
  T.ok('trichinosis: boar yes, javelina no (eastern data)', !!Game.regionParasiteRisk('wild_boar') && !Game.regionParasiteRisk('javelina'));
  T.ok('javelina carries it in the drylands data', regions.find(r => r.id === 'na_arid').fauna.parasites.trichinosis.javelina > 0);

  T.section('W7 names');
  let femOk = 0, femN = 0;
  for (let i = 0; i < 60; i++) {
    const n = Game.genNameForOrigin('Novosibirsk, Russia', true);
    const [first, last] = n.name.split(' ');
    if (Game.data.nameCultures.cultures.russian.fem.includes(first)) { femN++; if (/a$/.test(last)) femOk++; }
  }
  T.ok('Russian women carry the feminine surname', femN > 0 && femOk === femN, `${femOk}/${femN}`);
  T.ok('culture-listed gender: Xiuying f, Jianguo m', Game.guessNameGender('Xiuying', 'chinese') === 'f' && Game.guessNameGender('Jianguo', 'chinese') === 'm');
  const NEW = ['chinese', 'russian', 'congolese', 'south_african', 'kazakh', 'saudi'];
  const langIds = new Set(Game.data.characterGen.languages.map(l => l.id));
  T.ok('new cultures use existing languages (no new language, 25 pinned)', NEW.every(c => langIds.has(Game.data.nameCultures.cultures[c].language)));

  T.section('W8 background survivors speak their home language');
  let checked = 0, right = 0;
  for (const s of [1, 2, 3, 4]) {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', 'creek_bottom', Game.generatedRoster[0].id);
    for (const [id, langs] of Object.entries(Game.state.village.bgLangs || {})) {
      const p = Game.data.background_survivors.find(b => b.id === id) || {};
      const c = Game.cultureForOrigin(p.homeRegion);
      if (!c) continue;
      checked++;
      if (langs.native === Game.data.nameCultures.cultures[c].language) right++;
    }
  }
  T.ok('every drawn survivor with a known home speaks its language natively', checked > 0 && right === checked, `${right}/${checked}`);

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
