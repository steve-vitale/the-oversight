'use strict';
// Real cached offered acceptance, abrupt process loss and fresh-process Continue.
const K=require('./lib'),P=require('../lib/conversation-playtest'),assert=require('assert/strict'),fs=require('fs'),{spawnSync}=require('child_process');
const crash=['after-accept','commit-before','commit-after'];
function storage(initial={}){
 const blobs=new Map(Object.entries(initial));let armed=false,phase='',writes=0;
 const disk=()=>console.log('FAVOR_DISK '+JSON.stringify(Object.fromEntries(blobs)));
 globalThis.localStorage={getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),key:i=>[...blobs.keys()][i]??null,get length(){return blobs.size;},setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');if(armed&&run&&phase==='commit-before')process.exit(77);
  blobs.set(k,String(v));if(armed&&run){writes++;disk();if(phase==='commit-after')process.exit(77);}
 }};return{blobs,disk,arm(p){armed=true;phase=p;},count:()=>writes};
}
async function act(phase){
 const fixture=JSON.parse(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-phone-fixture-r1.json','utf8'));
 const G=await K.load({seed:7}),store=storage(fixture.storage);assert(G.load(fixture.setup.key));
 const id=fixture.setup.npc;G.startConvo(id);assert(P.offers(G,id).some(c=>c.id==='dlg:commit'));
 assert.equal(G.save(),true);const key=G.state.runKey,prior=store.blobs.get(key);store.disk();
 let nested;const say=G.sayLine;G.sayLine=function(...args){const result=say.apply(this,args);
  if(this.state.village.promises?.[id]?.favorId===fixture.setup.favorId){this.state.favorSettlementProbe=true;nested=this.save();if(phase==='after-accept')process.exit(77);if(phase==='throw-after-accept')throw Error('prepared post-accept speech failure');}
  return result;
 };
 store.arm(phase);
 if(phase==='throw-after-accept'){
  assert.throws(()=>P.choose(G,id,'dlg:commit'),/prepared post-accept speech failure/);
  assert.equal(store.blobs.get(key),prior);assert.equal(G.save(),'settlement_failed','Failed partial conversation cannot autosave');
 }else{
  const result=P.choose(G,id,'dlg:commit');assert.equal(result.favorSave,true,'Final durable result is exposed to the UI');assert.equal(store.count(),1,'One final acceptance payload');
  const saved=JSON.parse(store.blobs.get(key));assert.equal(saved.favorSettlementProbe,true);
  assert.deepEqual(saved.village.promises[id],G.state.village.promises[id]);assert.deepEqual(saved.village.favorLedger[id],G.state.village.favorLedger[id]);
  assert.deepEqual(saved.village.conv[id],JSON.parse(JSON.stringify(G.state.village.conv[id])),'Final serializable spoken transcript and cached menu saved');
 }
 assert.equal(nested,'deferred','Speech-time request is not durable success');console.log('Favor settlement '+phase+' passed');
}
async function recover(){
 const input=JSON.parse(fs.readFileSync(0,'utf8')),G=await K.load({seed:7}),store=storage(input.disk),key=[...store.blobs.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=store.blobs.get(key),saved=JSON.parse(raw);
 assert(G.load(key));assert.equal(store.blobs.get(key),raw,'Fresh Continue neither replays nor rewrites');
 const id=Object.keys(G.state.village.favorLedger).find(id=>G.state.village.favorLedger[id].kind==='forage_help');assert(id);
 const completed=input.phase==='commit-after';assert.equal(!!G.state.favorSettlementProbe,completed);assert.equal(!!G.state.village.promises?.[id],completed);
 assert.deepEqual(G.state.scholar.inventory,saved.scholar.inventory);assert.equal(G.state.scholar.dayTicks,saved.scholar.dayTicks);assert.equal(G.dayPart,saved.run.dayPart);
 // Ordinary mid-talk Continue intentionally settles a walk-away (game.js
 // load); preserve all saved words and the actual promise, not a dead chat UI.
 const continued=G.state.village.conv[id],transcript=saved.village.conv[id].transcript;
 assert.equal(continued.active,false);assert.equal(continued.over,true);
 assert.deepEqual(JSON.parse(JSON.stringify(continued.transcript.slice(0,transcript.length))),transcript);
 assert.deepEqual(G.state.village.promises?.[id],saved.village.promises?.[id]);
 console.log('Fresh favor recovery '+input.phase+' passed');
}
(async()=>{
 if(process.argv[2]==='recover')return recover();if(process.argv[2])return act(process.argv[2]);
 for(const phase of ['normal','throw-after-accept',...crash]){
  const r=spawnSync(process.execPath,[__filename,phase],{encoding:'utf8',maxBuffer:20e6,timeout:120000});assert.equal(r.status,crash.includes(phase)?77:0,r.stderr+r.stdout.slice(-1800));
  if(crash.includes(phase)){const lines=r.stdout.split('\n').filter(x=>x.startsWith('FAVOR_DISK ')),disk=JSON.parse(lines.at(-1).slice(11));const recovered=spawnSync(process.execPath,[__filename,'recover'],{input:JSON.stringify({phase,disk}),encoding:'utf8',maxBuffer:20e6,timeout:120000});assert.equal(recovered.status,0,recovered.stderr);console.log(recovered.stdout.trim());}
  else console.log(r.stdout.split('\n').filter(x=>x.startsWith('Favor settlement')).join('\n'));
 }
 console.log('Forage favor settlement: 5 scenarios and 3 fresh recoveries passed');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
