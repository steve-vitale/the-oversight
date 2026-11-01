'use strict';
const fs=require('fs'),assert=require('assert/strict'),{spawnSync}=require('child_process'),K=require('./lib');
const mode=process.argv[2];
async function child(){
 const disk=new Map(),writes=[];let armed=false;
 const emit=()=>console.log('ABILITY_DISK '+JSON.stringify(Object.fromEntries(disk)));
 globalThis.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,removeItem:k=>disk.delete(k),setItem(k,v){
   if(armed&&k.startsWith('scattering-save-v1-')&&mode==='commit-before')process.exit(77);
   disk.set(k,String(v));if(armed&&k.startsWith('scattering-save-v1-')){writes.push(k);emit();if(mode==='commit-after')process.exit(77);}
 }};
 if(mode==='recover'){
   const input=JSON.parse(fs.readFileSync(0,'utf8'));for(const [k,v]of Object.entries(input.disk))disk.set(k,v);
   const G=await K.load({seed:7003,narration:true}),key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=disk.get(key),saved=JSON.parse(raw);
   assert.equal(G.load(key),true);assert.equal(disk.get(key),raw);assert.deepEqual(G.state.scholar,saved.scholar);
   assert.equal(G.state.scholar.echoDay===G.state.scholar.day,input.complete);return;
 }
 const read=fs.readFileSync;
 if(['removed','retry-control'].includes(mode))fs.readFileSync=function(file,...args){let v=read.call(this,file,...args);const name=String(file).replace(/\\/g,'/');if(mode==='removed'&&name.endsWith('/src/js/timeSettlement.js')){const before=String(v),after=before.replace("for(const name of ['activateAbility','useAbility'])",'for(const name of [])');assert.notEqual(after,before,'actual ability settlement hook required');v=typeof v==='string'?after:Buffer.from(after);}if(mode==='retry-control'&&name.endsWith('/src/js/foodPower.js')){const before=String(v),after=before.replace("console.warn('[foodPower] ability activation failed', e); throw e;",'return _useAbility.call(this, abilityId, actionId, target);');assert.notEqual(after,before,'actual retry prevention required');v=typeof v==='string'?after:Buffer.from(after);}return v;};
 let G;try{G=await K.load({seed:7003,narration:true});}finally{fs.readFileSync=read;}
 K.newRun(G);K.openSlots(G,3);K.giveAbility(G,'echo_location');K.giveAbility(G,'green_thumb');
 let s=G.state.scholar;Object.assign(s,{day:2,dayTicks:0,actionClock:0,kcal:2000,health:100,hydration:100,monster:null});G.dayPart=0;G.pendingEncounter=null;G.worldMonsters().length=0;
 // Start from the real loader's canonical state, including normal migration
 // defaults, so abrupt recovery compares the entire scholar without omissions.
 assert.equal(G.save(),true);const key=G.state.runKey;assert.equal(G.load(key),true);s=G.state.scholar;assert.equal(G.save(),true);
 const prior=disk.get(key);emit();armed=true;
 if(['throw-composite','throw-direct','retry-control'].includes(mode)){
   const impl=globalThis.AbilityActionImpls['green_thumb.ask'];let calls=0;
   globalThis.AbilityActionImpls['green_thumb.ask']=function(...args){calls++;impl(...args);throw Error('prepared composite effect failure');};
   assert.throws(()=>mode==='throw-direct'?G.useAbility('green_thumb','ask'):G.activateAbility('green_thumb.ask'),/prepared composite effect failure/);
   assert.equal(calls,1,'failed effect is never retried');assert.equal(disk.get(key),prior,'composite exception preserves prior bytes');assert.equal(G.save(),'settlement_failed');return;
 }
 if(['after-effect','throw-effect','nested'].includes(mode)){
   const mark=G.markSeen;G.markSeen=function(...args){const value=mark.apply(this,args);if(mode==='nested')assert.equal(this.save(),'deferred','inner request is not durable success');if(mode==='after-effect')process.exit(77);if(mode==='throw-effect')throw Error('prepared ability effect failure');return value;};
 }
 if(mode==='throw-effect'){
   assert.throws(()=>G.activateAbility('echo_location'),/prepared ability effect failure/);assert.equal(disk.get(key),prior,'exception preserves prior bytes');assert.equal(G.save(),'settlement_failed');return;
 }
 const composite=['composite','direct'].includes(mode);
 if(mode==='direct')G.useAbility('green_thumb','ask');else G.activateAbility(composite?'green_thumb.ask':'echo_location');
 const saved=JSON.parse(disk.get(key));assert.deepEqual(saved.scholar,s,'whole completed ability scholar committed');
 // Compare the complete JSON payload: JSON canonically serializes -0 as 0.
 assert.deepEqual(saved.run.map.tiles,JSON.parse(JSON.stringify(G.map.tiles)),'actual revealed world committed');assert.equal(writes.length,1,'nested ability chain commits one payload');
 assert.equal(s.kcal,composite?1980:1960,'real activation fee once');
 assert.equal(s.dayTicks,composite?0:2,'real zero/short time cost');
 const paid=disk.get(key);const count=writes.length;const food=s.kcal;
 if(mode==='direct')assert.equal(G.useAbility('green_thumb','ask'),false);else assert.equal(G.activateAbility(composite?'green_thumb.ask':'echo_location'),false);
 assert.equal(s.kcal,food,'refused repeat pays nothing');assert.equal(writes.length,count,'refused repeat adds no checkpoint');assert.equal(disk.get(key),paid,'refused repeat preserves paid bytes');
}
async function main(){
 if(mode)return child();let count=0,cold=0;
 const run=(m,input)=>spawnSync(process.execPath,[__filename,m],{encoding:'utf8',input,maxBuffer:30e6});
 for(const m of ['legacy','composite','direct','nested','throw-effect','throw-composite','throw-direct','after-effect','commit-before','commit-after']){
   const r=run(m);assert.equal(r.status,['after-effect','commit-before','commit-after'].includes(m)?77:0,r.stderr||r.stdout.slice(-1800));count++;
   if(['after-effect','commit-before','commit-after'].includes(m)){
     const rows=r.stdout.split('\n').filter(v=>v.startsWith('ABILITY_DISK '));assert(rows.length);const disk=JSON.parse(rows.at(-1).slice('ABILITY_DISK '.length));const c=run('recover',JSON.stringify({disk,complete:m==='commit-after'}));assert.equal(c.status,0,c.stderr||c.stdout.slice(-1800));cold++;
   }
 }
 const removed=run('removed');assert.notEqual(removed.status,0);assert(/whole completed ability scholar committed/.test(removed.stderr),'actual removed hook must fail durable scholar comparison: '+removed.stderr.slice(-1800));
 const retry=run('retry-control');assert.notEqual(retry.status,0);assert(/Missing expected exception/.test(retry.stderr),'restored retry must fail the actual exception boundary: '+retry.stderr.slice(-1800));
 console.log(`Ability input settlement: ${count} scenarios, ${cold} fresh-process recoveries and 2 actual removed-hook rejections passed`);
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
