'use strict';
// Read-only source proof; the historical gengap AB runner swaps source files
// and is not a standing check for a shared active worktree.
const K=require('./lib'),T=K.reporter('occupation source parity');
(async()=>{
 const G=await K.load({seed:91001});await K.H.quietLog(()=>K.H.setupGame(G));
 const backgrounds=K.readJSON('src/data/background_survivors.json'),added=require('./muse-occupation-additions.json').added;
 T.ok('the incoming occupation expansion contains the intended23 jobs',added.length===23&&new Set(added).size===23&&G.data.characterGen.occupations.length===78);
 const people=backgrounds.map(x=>G.hydrateSeed(x));
 T.ok('all100 actual background records hydrate with a real occupation',people.length===100&&people.every(p=>p.occupationId&&G.data.characterGen.occupations.some(o=>o.id===p.occupationId)));
 for(const p of people)if(!G.data.villagers.some(x=>x.id===p.id))G.data.villagers.push(p);
 for(const id of added){const p=people.find(p=>p.occupationId===id),occ=G.data.characterGen.occupations.find(o=>o.id===id),expected=(occ.granted||[]).map(x=>G.abilitySkillId(x)||x),got=p?G.skillsKnownBy(p.id):[];
  T.ok('actual '+id+' carries its grants and actual human skills',!!p&&got.length>0&&expected.every(x=>got.includes(x)),JSON.stringify({expected,got}));
 }
 const byName=name=>people.find(p=>p.formerOccupation?.toLowerCase()===name),known=name=>G.skillsKnownBy(byName(name).id);
 T.ok('barber also receives the actual read_people knowledge route',known('barber').includes('read_people'));
 T.ok('florist receives the three actual plant/medicine knowledge routes',['herbal_medicine','forage_sense','foraging'].every(x=>known('florist').includes(x)));
 T.ok('zookeeper receives actual animal_behavior knowledge',known('zookeeper').includes('animal_behavior'));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
