'use strict';
const assert=require('assert/strict'),fs=require('fs'),z=require('zlib'),{spawnSync}=require('child_process'),K=require('./lib');
const mode=process.argv[2];
async function child(){
 const profile=JSON.parse(z.gunzipSync(fs.readFileSync(K.ROOT+'/evidence/2026-10-29/earned-evolution-r1/actual-pending-profile.json.gz')));
 const disk=new Map(profile.origins[0].localStorage.map(r=>[r.name,r.value]));let armed=false,writes=0;
 const emit=()=>console.log('EVOLUTION_DISK '+JSON.stringify(Object.fromEntries(disk)));
 globalThis.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,removeItem:k=>disk.delete(k),setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');if(armed&&run&&mode==='commit-before')process.exit(77);if(armed&&run&&mode==='quota')throw Error('prepared quota refusal');
  disk.set(k,String(v));if(armed&&run){writes++;emit();if(mode==='commit-after')process.exit(77);}
 }};
 if(mode==='recover'){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));disk.clear();for(const[k,v]of Object.entries(input.disk))disk.set(k,v);
  const G=await K.load({seed:7003,narration:true}),key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=disk.get(key),saved=JSON.parse(raw);
  assert.equal(G.load(key),true);assert.equal(disk.get(key),raw);assert.deepEqual(G.state.scholar,saved.scholar);assert.deepEqual(G.state.codex,saved.codex);
  assert.equal(!!G.state.scholar.abilities.find(a=>a.evolvedFrom==='green_thumb'),input.complete);assert.equal(G.liveEvolutionChoices().length,input.complete?0:2);return;
 }
 const read=fs.readFileSync;if(['removed','removed-upkeep'].includes(mode))fs.readFileSync=function(file,...args){let v=read.call(this,file,...args);const p=String(file).replace(/\\/g,'/');if(mode==='removed'&&p.endsWith('/src/js/timeSettlement.js')){const before=String(v),after=before.replace(",['chooseEvolution','evolutionChoices']",'');assert.notEqual(before,after,'actual evolution checkpoint hook missing');v=typeof v==='string'?after:Buffer.from(after);}if(mode==='removed-upkeep'&&p.endsWith('/src/js/game.js')){const before=String(v),after=before.replace(/(metabolicDaily\(\) \{[\s\S]*?)const aid = \(entry && \(entry.evolvedFrom \|\| entry.id\)\) \|\| entry;/,'$1const aid = (entry && entry.id) || entry;');assert.notEqual(before,after,'actual lineage cost hook missing');v=typeof v==='string'?after:Buffer.from(after);}return v;};
 let G;try{G=await K.load({seed:7003,narration:true});}finally{fs.readFileSync=read;}
 const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-'));assert.equal(G.load(key),true);const s=G.state.scholar,root=s.abilities.find(a=>a.id==='green_thumb');assert(root);assert.equal(root.level,3);assert.equal(G.liveEvolutionChoices().length,2);
 const count=s.abilities.length,cap=G.kcalCap(),upkeep=G.metabolicDaily(),yieldBefore=G.modTarget('forage.yield',1),cost=G.abilityActionDef('green_thumb','ask').action.cost;
 let pick=mode==='hearth'?'system_utility__hearth':'system_utility__sovereign';
 if(mode==='invalid')pick='not-offered';if(mode==='defer')pick='defer';
 if(mode==='missing'){s.pendingEvolution=null;pick='defer';}if(mode==='low')root.level=2;if(mode==='stale')s.abilities=s.abilities.filter(a=>a!==root);
 assert.equal(G.save(),true);const prior=disk.get(key);emit();armed=true;
 if(['nested','throw'].includes(mode)){const say=G.say;G.say=function(...xs){const r=say.apply(this,xs);assert.equal(this.save(),'deferred');assert.equal(disk.get(key),prior);if(mode==='throw')throw Error('prepared evolution tail failure');return r;};}
 if(mode==='throw'){assert.throws(()=>G.chooseEvolution(pick),/prepared evolution tail failure/);assert.equal(disk.get(key),prior);assert.equal(G.save(),'settlement_failed');return;}
 G.chooseEvolution(pick);
 if(['invalid','missing','low','stale','quota'].includes(mode)){assert.equal(disk.get(key),prior,'refusal or failed write preserves checkpoint');assert.equal(writes,0);return;}
 assert.notEqual(disk.get(key),prior,'earned evolution must be immediately durable');assert.equal(writes,1);const saved=JSON.parse(disk.get(key));assert.deepEqual(saved.scholar,s);assert.deepEqual(saved.codex,G.state.codex);
 if(mode==='defer'){assert.equal(s.evolutionDeferred,true);assert.equal(s.pendingEvolution,'green_thumb');assert.equal(G.liveEvolutionChoices().length,2);G.chooseEvolution('defer');assert.equal(writes,1);G.chooseEvolution('system_utility__sovereign');assert.equal(writes,2);assert.equal(s.pendingEvolution,null);return;}
 assert.equal(s.abilities.length,count);assert.equal(root.evolvedFrom,'green_thumb');assert.equal(s.pendingEvolution,null);assert.equal(s.evolutionChoices,null);assert.equal(G.hasAbility('green_thumb'),true);assert.equal(G.abilityLevel('green_thumb'),3);assert.deepEqual(G.abilityActionDef('green_thumb','ask').action.cost,cost);assert(G.activatableAbilities().some(a=>a.id==='green_thumb.ask'));assert.equal(G.metabolicDaily(),upkeep,'evolving must retain existing daily food costs');
 if(mode==='hearth'){assert.equal(G.kcalCap(),Math.round(cap*1.3));assert.equal(s.kcal,JSON.parse(prior).scholar.kcal,'capacity does not refill energy');assert.equal(G.modTarget('forage.yield',1),yieldBefore);}else{assert.equal(G.kcalCap(),cap);assert(Math.abs(G.modTarget('forage.yield',1)/yieldBefore-1.6)<1e-10);}
 const paid=disk.get(key);G.chooseEvolution(pick);assert.equal(writes,1);assert.equal(disk.get(key),paid);
}
async function main(){
 if(mode)return child();const cases=['complete','hearth','defer','invalid','missing','low','stale','nested','throw','quota','commit-before','commit-after'];let cold=0;
 const run=(m,input)=>spawnSync(process.execPath,[__filename,m],{encoding:'utf8',input,maxBuffer:40e6});
 for(const m of cases){const r=run(m);assert.equal(r.status,m.startsWith('commit-')?77:0,r.stderr||r.stdout.slice(-1800));if(m.startsWith('commit-')){const disk=JSON.parse(r.stdout.split('\n').filter(s=>s.startsWith('EVOLUTION_DISK ')).at(-1).slice(15));const recovered=run('recover',JSON.stringify({disk,complete:m==='commit-after'}));assert.equal(recovered.status,0,recovered.stderr||recovered.stdout.slice(-1800));cold++;}}
 for(const[m,expected]of [['removed','earned evolution must be immediately durable'],['removed-upkeep','evolving must retain existing daily food costs']]){const removed=run(m);assert.notEqual(removed.status,0);assert(removed.stderr.includes(expected),removed.stderr.slice(-1800));}
 console.log('Earned evolution: '+cases.length+' scenarios, '+cold+' abrupt-process recoveries and two actual removed-hook rejections passed');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
