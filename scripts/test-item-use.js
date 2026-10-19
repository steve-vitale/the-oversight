// Shared-runtime item contracts: item data plus both actual starter-pool paths.
'use strict';
const K=require('./godpath/lib');
const T=K.reporter('item-use');
(async()=>{
  const Game=await K.load({seed:Number(process.env.SEED||20261017),narration:true});
  K.newRun(Game);
  const s=Game.state.scholar;
  // hasItem / consumeItem helpers
  s.inventory.push({ itemId: 'lighter', name: 'Lighter', units: 1, kg: 0.1 });
  T.ok('hasItem finds lighter', Game.hasItem('lighter'));
  T.ok('hasItem false for missing', !Game.hasItem('nope_nothing'));

  // clothing has armor now
  const def = id => Game.data.items.find(i => i.id === id);
  for (const id of ['good_boots','camo_jacket','wool_socks','rain_poncho','work_gloves','canvas_pants','flannel_shirt','knit_cap','denim_jacket','running_shoes','rain_shell']) {
    T.ok(`${id} wearable`, !!(def(id) && def(id).armor && def(id).armor.protection > 0));
  }
  // mislabeled armor fixed
  for (const id of ['bark_armor','leather_jacket','riot_gear','military_vest','padded_cloth','hide_armor','swat_vest']) {
    T.ok(`${id} class fixed`, def(id).class === 'clothing');
  }
  // alien weapons equippable
  T.ok('phase_blade has weapon', !!(def('phase_blade').weapon && def('phase_blade').weapon.bonus === 60));
  T.ok('phase_blade ignoresArmor', !!def('phase_blade').weapon.ignoresArmor);
  T.ok('starfall_lance has weapon', !!(def('starfall_lance').weapon && def('starfall_lance').weapon.bonus === 80));
  // food edible
  T.ok('protein_bar edible', def('protein_bar').kcalEach === 250);
  T.ok('trail_mix edible', def('trail_mix').kcalEach === 150);
  T.ok('energy_drink edible', def('energy_drink').kcalEach === 120);
  // medical heals
  T.ok('field_sutures heals', def('field_sutures').healAmount === 40);
  T.ok('field_dressing_kit heals', def('field_dressing_kit').healAmount === 30);
  T.ok('nanite_swarm heals', def('nanite_swarm').healAmount === 50);
  T.ok('bandana heals', def('bandana').healAmount === 10);
  // cut items gone
  for (const id of ['phone_charger','calculator','pen_set','chopsticks','soy_packets','rope_coil','sewing_kit']) {
    T.ok(`${id} cut`, !def(id));
  }
  // reclassified as sentimental
  for (const id of ['rope_50ft','bus_map','thermos','tasting_spoon','whetstone','tin_cup','contract_quill']) {
    T.ok(`${id} sentimental`, def(id) && def(id).class === 'sentimental');
  }
  // Generic helper/fallback: its wildcard must obey the same kin gate as
  // the two dedicated keepsake slots. A thin actual-data fixture makes that
  // otherwise rare wildcard choice mandatory, without replacing the method.
  const originalItems=Game.data.items;
  const pick=(cls,n,filter=()=>true)=>originalItems.filter(i=>i.class===cls&&filter(i)).slice(0,n);
  const fixture=[...pick('tool',2),...pick('weapon',1,i=>(i.lootTier||1)<=2&&i.origin!=='alien'),...pick('clothing',2),...pick('sentimental',2,i=>!i.kin||i.kin==='none'),def('hard_candy')];
  const child={name:'Avery Tan',age:19,homeRegion:'Columbus, Ohio',itemPersonal:{}};
  let candidates;const originalRandom=Math.random;
  try{Game.data.items=fixture;Math.random=()=>0.5;candidates=Game.genItemCandidates({},child);}
  finally{Game.data.items=originalItems;Math.random=originalRandom;}
  T.ok('fixture really exercises a restricted grandchildren keepsake', fixture.some(i=>i.id==='hard_candy'&&i.kin==='grandchildren')&&!Game.kinAgeOk('grandchildren',19));
  T.ok('generic wildcard does not bypass the kin age gate', !candidates.includes('hard_candy'),JSON.stringify(candidates));
  const adult={name:'Avery Tan',age:45,homeRegion:'Columbus, Ohio',itemPersonal:{}};
  let eligible;
  try{Game.data.items=fixture;Math.random=()=>0.5;eligible=Game.genItemCandidates({},adult);}
  finally{Game.data.items=originalItems;Math.random=originalRandom;}
  T.ok('eligible wildcard keepsake really appears',eligible.includes('hard_candy'));
  T.ok('eligible wildcard keepsake is personalized',!!adult.itemPersonal.hard_candy&&adult.itemPersonal.hard_candy.kin==='grandchildren'&&typeof adult.itemPersonal.hard_candy.kinName==='string');

  // Preserve the existing generic ancestor-age gates too; this correction
  // does not silently redefine their separate policy from the semantic pool.
  for(const id of ['locket','lucky_coin']){
    const filteredFixture=[...fixture.slice(0,-1),def(id)];
    const younger={name:'Avery Tan',age:19,homeRegion:'Columbus, Ohio',itemPersonal:{}};
    const older={name:'Avery Tan',age:45,homeRegion:'Columbus, Ohio',itemPersonal:{}};
    let youngPool,oldPool;
    try{Game.data.items=filteredFixture;Math.random=()=>0.5;youngPool=Game.genItemCandidates({},younger);oldPool=Game.genItemCandidates({},older);}
    finally{Game.data.items=originalItems;Math.random=originalRandom;}
    T.ok(id+': existing generic age gate applies to wildcard',!youngPool.includes(id));
    T.ok(id+': eligible generic wildcard remains personal',oldPool.includes(id)&&!!older.itemPersonal[id]&&older.itemPersonal[id].kin===def(id).kin);
  }

  // Final semantic pool: the named person must be the biography's person,
  // not a second randomly invented relative from the discarded generic pool.
  const person={name:'Mara Tan',relation:'daughter',fate:'drew Avery holding the sun, age six'};
  const owner={name:'Avery Tan',age:45,formerOccupation:'teacher',homeRegion:'Columbus, Ohio',items:[],itemPersonal:{},lifeseed:{people:[person],places:[],skillOrigins:{}}};
  const pool=Game.genPersonalPool(owner);
  T.ok('prepared semantic pool contains the daughter keepsake',pool.pool.includes('daughters_drawing'));
  const named=owner.itemPersonal.daughters_drawing;
  T.ok('semantic keepsake uses the actual lifeseed person',!!named&&named.kinName===person.name,JSON.stringify(named));
  T.ok('semantic keepsake name and memory stay personal',!!named&&named.name.includes('Mara')&&named.flavor.includes(person.name)&&named.flavor.includes(person.fate),JSON.stringify(named));

  const byId=Object.fromEntries(originalItems.map(i=>[i.id,i]));
  let checked=0;const mismatches=[];
  for(const ch of Game.generatedRoster){
    for(const id of [...(ch.items||[]),...(ch.stashed||[])]){
      const d=byId[id];if(!d||!d.kin||d.kin==='none')continue;
      checked++;const personal=ch.itemPersonal&&ch.itemPersonal[id];
      if(!personal||!(ch.lifeseed.people||[]).some(p=>p.relation===d.kin&&p.name===personal.kinName))mismatches.push({character:ch.name,id,kin:d.kin,personal:personal||null});
    }
  }
  T.ok('real generated kin keepsakes exist in the roster',checked>0);
  T.ok('real kept and stashed keepsakes match their lifeseed people',mismatches.length===0,JSON.stringify(mismatches));
  const missing=originalItems.filter(i=>['tool','weapon','clothing','sentimental'].includes(i.class)&&i.kg==null);
  T.ok('all starters have kg',missing.length===0);
  T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
