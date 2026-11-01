'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),{spawnSync}=require('child_process'),K=require('./lib'),mode=process.argv[2],json=x=>JSON.parse(JSON.stringify(x));
async function child(){
 const profile=JSON.parse(z.gunzipSync(fs.readFileSync(K.ROOT+'/evidence/2026-10-29/earned-evolution-r1/day13-unanswerable-rumor-profile.json.gz'))),disk=new Map(profile.origins[0].localStorage.map(e=>[e.name,e.value]));
 global.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,String(v)),removeItem:k=>disk.delete(k)};
 const read=fs.readFileSync;
 if(mode==='removed')fs.readFileSync=function(file,...args){let v=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/gardenCultivation.js')){const before=String(v),after=before.replace("(a?.evolvedFrom||a?.id)","a?.id");assert.notEqual(after,before);v=typeof v==='string'?after:Buffer.from(after);}return v;};
 let G;try{G=await K.load({seed:2020962499,narration:true});}finally{fs.readFileSync=read;}
 const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-'));assert(G.load(key));G.exitBuilding();
 const s=G.state.scholar,entry=s.abilities.find(a=>a.evolvedFrom==='green_thumb');assert.equal(entry?.id,'system_utility__sovereign');assert.equal(entry.level,3);
 const before=json(G.state),plan=G.gardenMagicPlan();assert(plan,'the actual evolved holder retains cultivation');assert.equal(G.gardenAbilityEntry(G.villagerId,'green_thumb'),entry,'same canonical owned entry');assert.deepEqual(json(G.state),before,'planning creates no mastery or effects');
 assert.equal(plan.source,'green_thumb');assert.equal(plan.costKcal,G.abilityActionDef('green_thumb','cultivate').action.cost.kcal);assert(G.gardenMagicGate().ok);
 const resident=G.state.village.roster.find(id=>id!==G.villagerId&&!G.gardenAbilityEntry(id,'green_thumb')&&!G.gardenAbilityEntry(id,'green_whisper'));assert(resident);assert.equal(G.gardenMagicPlan(resident),null,'resident cannot borrow player mastery');
 const plots=G.gardenPlots().filter(p=>p.pid&&!p.dead&&!G.plotRipe(p,s.day)),growth=plots.map(p=>p.magicGrowth||0),food=s.kcal,tick=s.dayTicks;assert.equal(plots.length,3);
 assert.equal(G.cultivateGarden(),true);assert.equal(s.kcal,food-plan.costKcal,'one real authored payment');assert.equal(s.dayTicks,tick+16,'real cultivation time');
 plots.forEach((p,i)=>{assert.equal(p.magicGrowth,growth[i]+plan.growth);assert.equal(p.magicOwner,G.villagerId);assert.equal(p.magicDay,s.day);});
 const saved=JSON.parse(disk.get(key));assert.deepEqual(saved.scholar,json(s));assert.deepEqual(saved.codex,json(G.state.codex));assert.deepEqual(saved.village,json(G.state.village));
 const paid=json(G.state);assert.equal(G.cultivateGarden(),false);assert.deepEqual(json(G.state.scholar),paid.scholar,'same-day refusal neither pays nor grows again');
 assert(G.load(key));assert.deepEqual(json(G.state.scholar),saved.scholar,'Continue retains cost and real crop growth');
 console.log('Actual evolved garden holder: ownership, pure plan, paid three-bed growth, daily refusal and whole saved state passed');
}
(async()=>{if(mode)return child();for(const m of ['current','removed']){const r=spawnSync(process.execPath,[__filename,m],{encoding:'utf8',maxBuffer:10e6});if(m==='current'){assert.equal(r.status,0,r.stderr);console.log(r.stdout.trim());}else{assert.notEqual(r.status,0);assert(r.stderr.includes('the actual evolved holder retains cultivation'),r.stderr);}}console.log('Original raw-ID lookup independently rejects the retained actual evolved holder');})().catch(e=>{console.error(e.stack);process.exitCode=1;});
