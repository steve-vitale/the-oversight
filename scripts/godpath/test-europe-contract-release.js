#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('europe-region');
const V = require('../validate-regions');
(async () => {
  const data = V.loadData(), candidate = data.regions.find(r => r.id === 'eu_temperate');
  candidate.status = 'playable'; // validate the full contract even while draft
  const validation = V.validateRegions(data);
  T.ok('European candidate meets the full playable data contract', !validation.errors.length && !validation.warnings.length, JSON.stringify(validation));
  const G = await K.load({ seed: Number(process.env.SEED||7) });
  G.debugRegion = 'eu_temperate';
  const r = G.regionDef('eu_temperate'), variants = r.landingVariants.slice();
  const plants = G.data.biomes.find(b => b.id === r.biome).forageTable;
  T.ok('forage retains the reconciled 34-species mix', Object.keys(plants).length === 34);
  // WORLD-REGIONS requires sources, including named books; this is metadata
  // completeness, not independent verification of edibility or a linked URL.
  // The prototype's regions.includes('eu_temperate') selected zero current
  // records. Iterate the actual forage table so this cannot pass vacuously.
  const missing=Object.keys(plants).map(id=>G.data.plants.find(p=>p.id===id)).filter(p=>!p||!Array.isArray(p.sources)||!p.sources.length||!p.sources.every(s=>typeof s==='string'&&s.trim())||!p.edibility||!p.lookalikeNote||!p.confidence);
  T.ok('every actual forage record declares sources and safety metadata',missing.length===0,JSON.stringify(missing.map(p=>p?.id)));
  for (const loc of variants) {
    r.landingVariants = [loc]; // select each actual authored landing deterministically
    K.newRun(G, 'Berlin, Germany');
    T.ok(loc + ': real new run uses the authored region and landing', G.state.region === r.id && G.state.startLocation === loc && G.biome().id === 'eu_temperate_forest');
    const rolls = Array.from({ length: 100 }, () => G.rollWildSpecies({}));
    T.ok(loc + ': actual forage rolls use only regional species', rolls.every(id => id in plants) && !rolls.includes('muscadine') && !rolls.includes('hickory_nut'));
    T.ok(loc + ': nuts use European species rather than US substitutes', G.regionTreeNut('pedunculate_oak') === 'acorn_pedunculate_oak' && G.regionTreeNut('hazel') === 'european_hazelnut');
    T.ok(loc + ': fauna includes the authored hare and excludes the superseded bear', G.regionAnimalPool().has('european_hare') && !G.regionAnimalPool().has('brown_bear'));
    T.ok(loc + ': freshwater fish do not fall back to US chub/bluegill', JSON.stringify(G.regionFish()) === JSON.stringify(['northern_pike', 'european_perch', 'brown_trout']));
    const seen = new Set(G.map.tiles.flat().flatMap(t => Object.keys(t.wildlife || {})));
    const regional=new Set([...G.regionAnimalPool(),...G.regionFish()]);
    T.ok(loc + ': land and water wildlife stay in their real regional pools', seen.size > 0 && [...seen].every(id => regional.has(id)),JSON.stringify([...seen].filter(id=>!regional.has(id))));
    const pantry = G.state.village.pantry;
    T.ok(loc + ': pantry contains the authored regional bags', pantry.some(i => i.name === 'Rye flour') && pantry.some(i => i.name === 'Yellow peas') && !pantry.some(i => i.name === 'Rice'));
    const ruins = G.map.tiles.flat().filter(t => t.type === 'ruin');
    T.ok(loc + ': generated ruins use the regional people layer', ruins.length > 0 && ruins.every(t => r.people.ruins.includes(t.ruinStory)));
  }
  r.landingVariants = variants;
  T.ok('regional initial pantry retains the reconciled 30050 raw kcal', r.people.pantry.reduce((n,i)=>n+i.kcalEach*i.units,0) === 30050);
  T.ok('regional voice is wired through the existing climate talk data', G.data.climates.talk.regions.eu_temperate.local.some(x => /Europe/.test(x)));
  T.ok('the authored hungry-gap challenge and both real monsters resolve', r.challenge.id==='hungry_gap' && r.monsters.length===2 && r.monsters.every(id => G.data.monsters.some(d => d.id === id)));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
