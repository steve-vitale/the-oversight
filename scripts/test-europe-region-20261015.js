#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('europe-region');
const V = require('./validate-regions');
(async () => {
  const data = V.loadData(), candidate = data.regions.find(r => r.id === 'eu_temperate');
  candidate.status = 'playable'; // validate the full contract even while draft
  const validation = V.validateRegions(data);
  T.ok('European candidate meets the full playable data contract', !validation.errors.length && !validation.warnings.length, JSON.stringify(validation));
  const G = await K.load({ seed: 7 });
  G.debugRegion = 'eu_temperate';
  const r = G.regionDef('eu_temperate'), variants = r.landingVariants.slice();
  const plants = G.data.biomes.find(b => b.id === r.biome).forageTable;
  T.ok('forage has the roadmap-scale species mix', Object.keys(plants).length === 29);
  T.ok('all new plant records carry actual source links and explicit safety', G.data.plants.filter(p => p.regions && p.regions.includes('eu_temperate')).every(p => p.sources.some(s => /^https:/.test(s)) && p.edibility && p.lookalikeNote && p.confidence));
  for (const loc of variants) {
    r.landingVariants = [loc]; // select each actual authored landing deterministically
    K.newRun(G, 'Berlin, Germany');
    T.ok(loc + ': real new run uses the authored region and landing', G.state.region === r.id && G.state.startLocation === loc && G.biome().id === 'eu_broadleaf');
    const rolls = Array.from({ length: 100 }, () => G.rollWildSpecies({}));
    T.ok(loc + ': actual forage rolls use only regional species', rolls.every(id => id in plants) && !rolls.includes('muscadine') && !rolls.includes('hickory_nut'));
    T.ok(loc + ': nuts use European species rather than US substitutes', G.regionTreeNut('oak') === 'pedunculate_acorn' && G.regionTreeNut('hazel') === 'european_hazelnut');
    T.ok(loc + ': brown bear is restricted to the continental forest variant', G.regionAnimalPool().has('brown_bear') === (loc === 'eu_forest_village'));
    T.ok(loc + ': freshwater fish do not fall back to US chub/bluegill', JSON.stringify(G.regionFish()) === JSON.stringify(['brown_trout', 'european_perch', 'roach']));
    const seen = new Set(G.map.tiles.flat().flatMap(t => Object.keys(t.wildlife || {})));
    T.ok(loc + ': map wildlife stays in the real regional pool', seen.size > 0 && [...seen].every(id => G.regionAnimalPool().has(id)));
    const pantry = G.state.village.pantry;
    T.ok(loc + ': pantry contains the authored regional bags', pantry.some(i => i.name === 'Pearl barley') && pantry.some(i => i.name === 'Hazelnut kernels') && !pantry.some(i => i.name === 'Rice'));
    const ruins = G.map.tiles.flat().filter(t => t.type === 'ruin');
    T.ok(loc + ': generated ruins use the regional people layer', ruins.length > 0 && ruins.every(t => r.people.ruins.includes(t.ruinStory)));
  }
  r.landingVariants = variants;
  T.ok('regional initial pantry retains baseline-equivalent food reserves', r.people.pantry.reduce((n,i)=>n+i.kcalEach*i.units,0) === 47250);
  T.ok('regional voice is wired through the existing climate talk data', G.data.climates.talk.regions.eu_temperate.local.some(x => /Europe/.test(x)));
  T.ok('challenge and monster skins honestly remain scaffolded', r.challenge.status === 'scaffolded' && r.monsters.every(m => m.status === 'scaffolded' && G.data.monsters.some(d => d.id === m.id)));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
